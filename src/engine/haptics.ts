/**
 * Haptics wrapper. Feature-detected; silently no-ops on iOS.
 */

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Short buzz (gift tap, candle out) */
export function buzzShort() {
  if (canVibrate()) navigator.vibrate(18);
}

/** Medium buzz (cut complete) */
export function buzzMedium() {
  if (canVibrate()) navigator.vibrate(40);
}

/** Pattern vibration (cut complete celebration) */
export function buzzPattern() {
  if (canVibrate()) navigator.vibrate([28, 12, 28, 12, 55, 12, 75, 12, 100]);
}

/** Tiny tick (knife drag, candle extinguish) */
export function tick() {
  if (canVibrate()) navigator.vibrate(3);
}
