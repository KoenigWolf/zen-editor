'use client';

import { useEffect, useRef } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

type WebVitalsCallback = (metric: Metric) => void;

const defaultCallback: WebVitalsCallback = () => {};

export const useWebVitals = (callback: WebVitalsCallback = defaultCallback): void => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const reportMetric = (metric: Metric) => callbackRef.current(metric);
    onCLS(reportMetric);
    onINP(reportMetric);
    onFCP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);
};
