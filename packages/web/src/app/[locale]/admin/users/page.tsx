'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from '@/i18n/navigation';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  investmentCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{ users: AdminUser[] }>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Update failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  return (
    <div className="max-w-5xl">
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('usersTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {t('usersCount', { count: data?.users.length ?? 0 })}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted-bg">
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thUser')}</th>
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thEmail')}</th>
              <th className="px-5 py-3 text-center font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thRole')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thInvestments')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thJoined')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-[11px] font-bold text-foreground border border-border">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <Link href={`/admin/users/${user.id}`} className="text-foreground font-semibold hover:text-primary-500 transition-colors">{user.fullName}</Link>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted font-medium">{user.email}</td>
                  <td className="px-5 py-3.5 text-center">
                    {isSelf ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase bg-primary-500/10 text-primary-500 border border-primary-500/20">
                        {user.role}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          roleMutation.mutate({ id: user.id, role: e.target.value })
                        }
                        disabled={roleMutation.isPending}
                        className="rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-semibold text-foreground cursor-pointer focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-foreground font-medium">
                    {user.investmentCount}
                  </td>
                  <td className="px-5 py-3.5 text-right text-muted font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
