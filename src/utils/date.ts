/**
 * 日本時間 (JST: Asia/Tokyo) の日付・時刻ユーティリティ
 */

// 日本時間の「今日」を YYYY-MM-DD 形式で取得 (午前0:00に切り替わる)
export function getJstTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()).replace(/\//g, '-');
}

// 日本時間基準で日付を shift (±days) して YYYY-MM-DD 形式で返す
export function shiftJstDateString(dateStr: string, days: number): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  } catch {
    return getJstTodayDateString();
  }
}

// 試合の UTC 日時 (gameDate) を 日本時間 (JST) の YYYY-MM-DD に変換
export function getGameJstDateString(utcDateStr: string): string {
  const d = new Date(utcDateStr);
  return d.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
}

// 試合の UTC 日時 (gameDate) を 日本時間 (JST) の HH:mm に変換
export function getGameJstTimeString(utcDateStr: string): string {
  const d = new Date(utcDateStr);
  return d.toLocaleTimeString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
  });
}
