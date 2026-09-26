/**
 * Web Vibration API Utility for Mobile Haptic Feedback
 */

export const VIBRATION_PATTERNS = {
  // ホームラン: 豪快な連続振動 [100ms 振動, 50ms 休み, 100ms 振動, 50ms 休み, 200ms 振動]
  homerun: [100, 50, 100, 50, 200],
  // 100mph超ハードヒット: 鋭い二段ショック
  hardHit: [80, 40, 150],
  // 得点圏 (RISP) チャンス突入
  risp: [60, 40, 60],
  // 三振奪取
  strikeout: [120, 60],
  // タップ感
  lightTap: [30],
};

export function triggerVibration(pattern: number[] = VIBRATION_PATTERNS.homerun): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API not permitted or supported:', e);
      return false;
    }
  }
  return false;
}

export function isVibrationSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
}
