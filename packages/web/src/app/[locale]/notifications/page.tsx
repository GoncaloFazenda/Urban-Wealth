'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{
    notifications: NotificationItem[];
    unreadCount: number;
    total: number;
  }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/notifications?limit=50');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const handleMarkAllRead = async () => {
    await fetchWithAuth('/api/notifications/read-all', { method: 'PATCH' });
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkRead = async (id: string) => {
    await fetchWithAuth(`/api/notifications/${id}/read`, { method: 'PATCH' });
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  if (isLoading) return <div className="mx-auto max-w-3xl px-5 sm:px-6 py-12"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-3xl px-5 sm:px-6 py-12"><ErrorState title={t('errorTitle')} onRetry={() => refetch()} /></div>;

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 animate-enter-sm">
        <div>
          <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-1 text-[14px] text-muted">{t('subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-md border border-border px-4 py-2 text-[13px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card animate-enter-sm-delay-1">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
            <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 className="font-display text-[20px] font-bold text-foreground mb-2">
            {t('emptyTitle')}
          </h3>
          <p className="text-[14px] text-muted max-w-md mx-auto leading-relaxed">
            {t('emptyMessage')}
          </p>
        </div>
      ) : (
        <div className="space-y-2 animate-enter-sm-delay-1">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.read && handleMarkRead(notification.id)}
              className={`w-full text-left rounded-xl border px-5 py-4 transition-all ${
                notification.read
                  ? 'border-border bg-card'
                  : 'border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  notification.read ? 'bg-transparent' : 'bg-primary-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground mb-0.5">
                    {notification.title}
                  </p>
                  <p className="text-[13px] text-muted leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-muted mt-2">
                    {new Date(notification.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
