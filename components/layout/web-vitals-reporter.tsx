'use client';

import { useCallback } from 'react';
import type { Metric } from 'web-vitals';
import { useWebVitals } from '@/hooks/platform/use-web-vitals';

export const WebVitalsReporter = () => {
  const handleMetric = useCallback((metric: Metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WebVitals] ${metric.name}:`, metric.value, metric);
    }
  }, []);

  useWebVitals(handleMetric);
  return null;
};
