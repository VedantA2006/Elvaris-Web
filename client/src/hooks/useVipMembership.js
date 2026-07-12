'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useVipMembership() {
  return useQuery({
    queryKey: ['vipMembership'],
    queryFn: async () => {
      const res = await api.get('/vip/me');
      return res.data?.data || { active: false, membership: null, user: null };
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1
  });
}
