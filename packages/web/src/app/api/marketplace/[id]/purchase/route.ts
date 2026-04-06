import { NextRequest, NextResponse } from 'next/server';
import { PLATFORM_FEE_RATE } from '@urban-wealth/core';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AUTH_CONSTANTS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

// POST /api/marketplace/[id]/purchase — buy a listing
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limit
    const rateLimitResult = checkRateLimit(`marketplace:${session.userId}`, {
      maxRequests: AUTH_CONSTANTS.RATE_LIMIT_INVEST_MAX,
      windowMs: AUTH_CONSTANTS.RATE_LIMIT_INVEST_WINDOW_MS,
    });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // [id] is either a groupId (multi-investment sell) or a single listing id
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // Lock all sub-listings belonging to the group (or the single listing)
      type LockedRow = {
        id: string;
        group_id: string | null;
        seller_id: string;
        investment_id: string;
        property_id: string;
        shares_amount: number;
        ownership_pct: number;
        ask_price: number;
        status: string;
      };
      const lockedListings = await tx.$queryRaw<LockedRow[]>`
        SELECT * FROM listings
        WHERE (group_id = ${id} OR id = ${id})
          AND status = 'ACTIVE'
        FOR UPDATE
      `;

      if (lockedListings.length === 0) {
        throw Object.assign(new Error('Listing not found'), { code: 'NOT_FOUND' });
      }

      const first = lockedListings[0]!;

      if (first.seller_id === session.userId) {
        throw Object.assign(new Error('You cannot purchase your own listing'), { code: 'SELF_PURCHASE' });
      }

      const totalAskPrice = lockedListings.reduce((s, l) => s + l.ask_price, 0);
      const totalPlatformFee = totalAskPrice * PLATFORM_FEE_RATE;
      const sellerProceeds = totalAskPrice - totalPlatformFee;

      // Check buyer wallet balance
      const buyerWallet = await tx.wallet.findUnique({ where: { userId: session.userId } });
      if (!buyerWallet || buyerWallet.balance < totalAskPrice) {
        throw Object.assign(
          new Error(`Insufficient wallet balance. You need €${totalAskPrice.toLocaleString()} but have €${(buyerWallet?.balance ?? 0).toLocaleString()}`),
          { code: 'INSUFFICIENT_BALANCE' }
        );
      }

      // Deduct from buyer, credit seller
      await tx.wallet.update({
        where: { userId: session.userId },
        data: { balance: { decrement: totalAskPrice } },
      });
      await tx.wallet.upsert({
        where: { userId: first.seller_id },
        update: { balance: { increment: sellerProceeds } },
        create: { userId: first.seller_id, balance: sellerProceeds },
      });

      const property = await tx.property.findUniqueOrThrow({ where: { id: first.property_id } });
      const now = new Date();
      const yieldStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Process each sub-listing independently
      const trades = [];
      for (const listing of lockedListings) {
        const sellerInvestment = await tx.investment.findUniqueOrThrow({
          where: { id: listing.investment_id },
        });

        // Create buyer investment for this slice
        const estimatedAnnualIncome =
          property.totalValue * (property.annualYield / 100) * (listing.ownership_pct / 100);
        const estimatedAppreciationGain =
          property.totalValue * (property.projectedAppreciation / 100) * (listing.ownership_pct / 100);

        await tx.investment.create({
          data: {
            userId: session.userId,
            propertyId: listing.property_id,
            amount: listing.shares_amount,
            ownershipPercentage: listing.ownership_pct,
            estimatedAnnualIncome,
            estimatedAppreciationGain,
            platformFee: 0,
            status: 'COMPLETED',
            yieldStartDate,
          },
        });

        // Reduce seller investment
        const newAmount = sellerInvestment.amount - listing.shares_amount;
        const newOwnership = sellerInvestment.ownershipPercentage - listing.ownership_pct;

        if (newAmount <= 0.01) {
          await tx.investment.update({
            where: { id: sellerInvestment.id },
            data: { amount: 0, ownershipPercentage: 0, estimatedAnnualIncome: 0, estimatedAppreciationGain: 0, status: 'SOLD' },
          });
        } else {
          await tx.investment.update({
            where: { id: sellerInvestment.id },
            data: {
              amount: newAmount,
              ownershipPercentage: newOwnership,
              estimatedAnnualIncome: property.totalValue * (property.annualYield / 100) * (newOwnership / 100),
              estimatedAppreciationGain: property.totalValue * (property.projectedAppreciation / 100) * (newOwnership / 100),
              status: 'PARTIALLY_SOLD',
            },
          });
        }

        // Trade record per sub-listing
        const sliceFee = listing.ask_price * PLATFORM_FEE_RATE;
        const trade = await tx.trade.create({
          data: {
            listingId: listing.id,
            buyerId: session.userId,
            sellerId: listing.seller_id,
            propertyId: listing.property_id,
            amount: listing.ask_price,
            platformFee: sliceFee,
            status: 'COMPLETED',
          },
        });
        trades.push(trade);

        // Mark sub-listing SOLD
        await tx.listing.update({ where: { id: listing.id }, data: { status: 'SOLD' } });

        // Cancel any remaining active listings for this investment that are now overhang
        if (newAmount <= 0.01) {
          await tx.listing.updateMany({
            where: { investmentId: listing.investment_id, status: 'ACTIVE' },
            data: { status: 'CANCELLED' },
          });
        }
      }

      // Single notification to seller summarising the whole group
      const totalOwnership = lockedListings.reduce((s, l) => s + l.ownership_pct, 0);
      await tx.notification.create({
        data: {
          userId: first.seller_id,
          type: 'LISTING_PURCHASED',
          title: 'Your listing was purchased',
          message: `Your ${totalOwnership.toFixed(2)}% stake in ${property.title} was purchased for €${totalAskPrice.toLocaleString()}. You received €${sellerProceeds.toLocaleString()} after fees.`,
          data: { tradeIds: trades.map((t) => t.id), propertyId: property.id },
        },
      });

      return trades[0]!;
    });

    return NextResponse.json({ trade: result }, { status: 201 });
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === 'NOT_FOUND') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (['NOT_ACTIVE', 'SELF_PURCHASE', 'INSUFFICIENT_BALANCE'].includes(err.code ?? '')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Purchase error:', err.message);
    return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 });
  }
}
