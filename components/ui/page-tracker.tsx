'use client'

import { usePageViewTracking } from '@/components/ui/ad-slot';

export function PageTracker() {
  usePageViewTracking();
  return null;
} 