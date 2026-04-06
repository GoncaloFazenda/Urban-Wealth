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

    const { id: listingId } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // Lock listing row
      const [lockedListing] = await tx.$queryRaw<
        Array<{
          id: string;
          seller_id: string;
          investment_id: string;
          property_id: string;
          shares_amount: number;
          ownership_pct: number;
          ask_price: number;
          price_per_percent: number;
          status: string;
        }>
      >`SELECT * FROM listings WHERE id = ${listingId} FOR UPDATE`;

      if (!lockedListing) {
        throw Object.assign(new Error('Listing not found'), { code: 'NOT_FOUND' });
      }

      if (lockedListing.status !== 'ACTIVE') {
        throw Object.assign(new Error('This listing is no longer available'), { code: 'NOT_ACTIVE' });
      }

      if (lockedListing.seller_id === session.userId) {
        throw Object.assign(new Error('You cannot purchase your own listing'), { code: 'SELF_PURCHASE' });
      }

      const askPrice = lockedListing.ask_price;
      const platformFee = askPrice * PLATFORM_FEE_RATE;

      // Check buyer wallet balance
      const buyerWallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });

      if (!buyerWallet || buyerWallet.balance < askPrice) {
        throw Object.assign(
          new Error(`Insufficient wallet balance. You need €${askPrice.toLocaleString()} but have €${(buyerWallet?.balance ?? 0).toLocaleString()}`),
          { code: 'INSUFFICIENT_BALANCE' }
        );
      }

      // Deduct from buyer wallet
      await tx.wallet.update({
        where: { userId: session.userId },
        data: { balance: { decrement: askPrice } },
      });

      // Credit seller wallet (ask price minus platform fee)
      const sellerProceeds = askPrice - platformFee;
      await tx.wallet.upsert({
        where: { userId: lockedListing.seller_id },
        update: { balance: { increment: sellerProceeds } },
        create: { userId: lockedListing.seller_id, balance: sellerProceeds },
      });

      // Get the property for recalculating buyer's investment estimates
      const property = await tx.property.findUniqueOrThrow({
        where: { id: lockedListing.property_id },
      });

      // Get seller's investment to reduce it
      const sellerInvestment = await tx.investment.findUniqueOrThrow({
        where: { id: lockedListing.investment_id },
      });

      // Create new investment for buyer
      const buyerOwnershipPct = lockedListing.ownership_pct;
      const estimatedAnnualIncome =
        property.totalValue * (property.annualYield / 100) * (buyerOwnershipPct / 100);
      const estimatedAppreciationGain =
        property.totalValue * (property.projectedAppreciation / 100) * (buyerOwnershipPct / 100);

      // Yield starts on the 1st of next month
      const now = new Date();
      const yieldStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      await tx.investment.create({
        data: {
          userId: session.userId,
          propertyId: lockedListing.property_id,
          amount: lockedListing.shares_amount,
          ownershipPercentage: buyerOwnershipPct,
          estimatedAnnualIncome,
          estimatedAppreciationGain,
          platformFee: 0, // No additional platform fee on the buyer's new investment record
          status: 'COMPLETED',
          yieldStartDate,
        },
      });

      // Reduce seller's investment
      const newSellerAmount = sellerInvestment.amount - lockedListing.shares_amount;
      const newSellerOwnership = sellerInvestment.ownershipPercentage - lockedListing.ownership_pct;

      if (newSellerAmount <= 0.01) {
        // Fully sold — mark investment as SOLD
        await tx.investment.update({
          where: { id: sellerInvestment.id },
          data: {
            amount: 0,
            ownershipPercentage: 0,
            estimatedAnnualIncome: 0,
            estimatedAppreciationGain: 0,
            status: 'SOLD',
          },
        });
      } else {
        // Partially sold — reduce proportionally and recalculate estimates
        const newEstimatedAnnualIncome =
          property.totalValue * (property.annualYield / 100) * (newSellerOwnership / 100);
        const newEstimatedAppreciationGain =
          property.totalValue * (property.projectedAppreciation / 100) * (newSellerOwnership / 100);

        await tx.investment.update({
          where: { id: sellerInvestment.id },
          data: {
            amount: newSellerAmount,
            ownershipPercentage: newSellerOwnership,
            estimatedAnnualIncome: newEstimatedAnnualIncome,
            estimatedAppreciationGain: newEstimatedAppreciationGain,
            status: 'PARTIALLY_SOLD',
          },
        });
      }

      // Create trade record
      const trade = await tx.trade.create({
        data: {
          listingId,
          buyerId: session.userId,
          sellerId: lockedListing.seller_id,
          propertyId: lockedListing.property_id,
          amount: askPrice,
          platformFee,
          status: 'COMPLETED',
        },
      });

      // Mark listing as SOLD
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' },
      });

      // Cancel any other active listings from this seller for the same investment
      // that would exceed the remaining position
      const remainingAmount = newSellerAmount <= 0.01 ? 0 : newSellerAmount;
      if (remainingAmount <= 0) {
        // Cancel all remaining active listings for this investment
        await tx.listing.updateMany({
          where: {
            investmentId: lockedListing.investment_id,
            status: 'ACTIVE',
          },
          data: { status: 'CANCELLED' },
        });
      }

      // Notify the seller
      await tx.notification.create({
        data: {
          userId: lockedListing.seller_id,
          type: 'LISTING_PURCHASED',
          title: 'Your listing was purchased',
          message: `Your ${lockedListing.ownership_pct.toFixed(2)}% stake in ${property.title} was purchased for €${askPrice.toLocaleString()}. You received €${sellerProceeds.toLocaleString()} after fees.`,
          data: { tradeId: trade.id, listingId, propertyId: property.id },
        },
      });

      return trade;
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
