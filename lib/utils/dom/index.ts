/**
 * DOM操作ユーティリティ
 */

export { getEventCoordinates, type Point } from './event';
export { getDelta, isVerticalDominant, exceedsThreshold, type Delta } from './gesture';
export { isBrowser, browserDocument, browserWindow } from './ssr';
export { constrainToViewport, type Size, type Position, type ConstrainOptions } from './viewport';
