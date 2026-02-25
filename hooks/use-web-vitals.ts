'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

type WebVitalsCallback = (metric: Metric) => void;

const defaultCallback: WebVitalsCallback = (_metric) => {
  // Send to analytics when configured
};

export const useWebVitals = (callback: WebVitalsCallback = defaultCallback): void => {
  useEffect(() => {
    onCLS(callback);
    onINP(callback);
    onFCP(callback);
    onLCP(callback);
    onTTFB(callback);
  }, [callback]);
};
