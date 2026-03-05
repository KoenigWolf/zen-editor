'use client';

import { HANDLE_SIZE, type HandleVariant } from './types';

interface HandleConfig {
  className: string;
  positionProp: 'left' | 'right';
  svg: React.ReactNode;
}

export const HANDLE_CONFIGS: Record<HandleVariant, HandleConfig> = {
  firstLine: {
    className: 'indent-handle-first-line',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,0 10,0 5,8" fill="currentColor" />
      </svg>
    ),
  },
  hanging: {
    className: 'indent-handle-hanging',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,10 10,10 5,2" fill="currentColor" />
      </svg>
    ),
  },
  leftMargin: {
    className: 'indent-handle-left-margin',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={6} viewBox="0 0 10 6">
        <rect x="0" y="0" width="10" height="6" fill="currentColor" />
      </svg>
    ),
  },
  rightMargin: {
    className: 'indent-handle-right-margin',
    positionProp: 'right',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,10 10,10 5,2" fill="currentColor" />
      </svg>
    ),
  },
  tabStop: {
    className: 'indent-handle-tab-stop',
    positionProp: 'left',
    svg: (
      <svg width={6} height={10} viewBox="0 0 6 10">
        <line x1="3" y1="0" x2="3" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="0" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
};
