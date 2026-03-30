'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useCallback } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export function useWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ propertyIds: string[] }>({
    queryKey: ['watchlist-ids'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/watchlist');
      if (!res.ok) throw new Error('Failed to load watchlist');
      return res.json();
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const res = await fetchWithAuth('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      return res.json();
    },
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist-ids'] });
      const prev = queryClient.getQueryData<{ propertyIds: string[] }>(['watchlist-ids']);
      queryClient.setQueryData<{ propertyIds: string[] }>(['watchlist-ids'], (old) => {
        if (!old) return { propertyIds: [propertyId] };
        const ids = old.propertyIds.includes(propertyId)
          ? old.propertyIds.filter((id) => id !== propertyId)
          : [...old.propertyIds, propertyId];
        return { ...old, propertyIds: ids };
      });
      return { prev };
    },
    onError: (_err, _propertyId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['watchlist-ids'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-ids'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const watchlistIds = new Set(data?.propertyIds ?? []);

  const toggle = useCallback(
    (propertyId: string) => {
      if (!user) return;
      mutation.mutate(propertyId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, mutation.mutate]
  );

  return {
    watchlistIds,
    isLoading,
    toggle,
  };
}
