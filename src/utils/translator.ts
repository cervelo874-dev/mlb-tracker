/**
 * MLB Real-Time Play & Pitch Japanese Translation Engine
 */

export const PLAYER_NAME_JA: Record<string, string> = {
  // 現役・近年MLB日本人選手
  'Shohei Ohtani': '大谷 翔平',
  'Yoshinobu Yamamoto': '山本 由伸',
  'Yu Darvish': 'ダルビッシュ 有',
  'Shota Imanaga': '今永 昇太',
  'Seiya Suzuki': '鈴木 誠也',
  'Kodai Senga': '千賀 滉大',
  'Masataka Yoshida': '吉田 正尚',
  'Yusei Kikuchi': '菊池 雄星',
  'Yuki Matsui': '松井 裕樹',
  'Kenta Maeda': '前田 健太',
  'Shintaro Fujinami': '藤浪 晋太郎',
  'Naoyuki Uwasawa': '上沢 直之',
  'Yoshi Tsutsugo': '筒香 嘉智',
  'Go Tsutsugo': '筒香 嘉智',
  'Shogo Akiyama': '秋山 翔吾',
  'Kohei Arihara': '有原 航平',
  'Shun Yamaguchi': '山口 俊',
  'Roki Sasaki': '佐々木 朗希',
  'Munetaka Murakami': '村上 宗隆',
  'Kazuma Okamoto': '岡本 和真',
  'Lars Nootbaar': 'ラーズ・ヌートバー',

  // レジェンド日本人MLB選手
  'Ichiro Suzuki': 'イチロー',
  'Hideki Matsui': '松井 秀喜',
  'Hideo Nomo': '野茂 英雄',
  'Koji Uehara': '上原 浩治',
  'Masahiro Tanaka': '田中 将大',
  'Hiroki Kuroda': '黒田 博樹',
  'Hisashi Iwakuma': '岩隈 久志',
  'Daisuke Matsuzaka': '松坂 大輔',
  'Kenji Johjima': '城島 健司',
  'Kosuke Fukudome': '福留 孝介',
  'Norichika Aoki': '青木 宣親',
  'Munenori Kawasaki': '川﨑 宗則',
  'Takashi Saito': '斎藤 隆',
  'Hideki Okajima': '岡島 秀樹',
  'Kazuo Matsui': '松井 稼頭央',
  'Akinori Iwamura': '岩村 明憲',
  'Tadahito Iguchi': '井口 資仁',
  'So Taguchi': '田口 壮',
  'Kei Igawa': '井川 慶',
  'Tsuyoshi Shinjo': '新庄 剛志',
  'Masato Yoshii': '吉井 理人',
  'Shigetoshi Hasegawa': '長谷川 滋利',
};

export function getPlayerDisplayName(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  // 日本人選手のみ日本語名、その他は英語表記そのまま
  return PLAYER_NAME_JA[trimmed] || trimmed;
}

export const PITCH_TYPES_JA: Record<string, string> = {
  'FF': '4シーム (直球)',
  'FA': '直球',
  'SI': 'シンカー',
  'FC': 'カッター',
  'SL': 'スライダー',
  'ST': 'スイーパー',
  'SV': 'スラーブ',
  'CH': 'チェンジアップ',
  'FS': 'スプリット',
  'FO': 'フォーク',
  'CU': 'カーブ',
  'KC': 'ナックルカーブ',
  'CS': 'スローカーブ',
  'KN': 'ナックル',
  'EP': 'イーファス',
  'PO': 'ピッチアウト',
  'IN': '故意四球',
};

export const PITCH_DESCRIPTION_JA: Record<string, string> = {
  'Four-Seam Fastball': '4シーム',
  'Fastball': '直球',
  'Sinker': 'シンカー',
  'Cutter': 'カットボール',
  'Slider': 'スライダー',
  'Sweeper': 'スイーパー',
  'Slurve': 'スラーブ',
  'Changeup': 'チェンジアップ',
  'Splitter': 'スプリット',
  'Forkball': 'フォーク',
  'Curveball': 'カーブ',
  'Knuckle Curve': 'ナックルカーブ',
  'Knuckleball': 'ナックル',
};

export const PITCH_CALL_JA: Record<string, { label: string; isStrike: boolean; isBall: boolean }> = {
  'B': { label: 'ボール', isStrike: false, isBall: true },
  'C': { label: '見逃しストライク', isStrike: true, isBall: false },
  'S': { label: '空振りストライク', isStrike: true, isBall: false },
  'F': { label: 'ファウル', isStrike: true, isBall: false },
  'X': { label: 'インプレー (安打/得点)', isStrike: false, isBall: false },
  'D': { label: 'インプレー (アウト)', isStrike: false, isBall: false },
  'E': { label: 'インプレー (エラー)', isStrike: false, isBall: false },
  'T': { label: 'ファウルチップ', isStrike: true, isBall: false },
  'W': { label: '空振り三振', isStrike: true, isBall: false },
  'M': { label: '見逃し三振', isStrike: true, isBall: false },
};

export function getPitchTypeJapanese(code?: string, desc?: string): string {
  if (code && PITCH_TYPES_JA[code]) return PITCH_TYPES_JA[code];
  if (desc && PITCH_DESCRIPTION_JA[desc]) return PITCH_DESCRIPTION_JA[desc];
  return desc || code || '投球';
}

export function getPitchCallJapanese(code?: string, desc?: string): { label: string; isStrike: boolean; isBall: boolean } {
  if (code && PITCH_CALL_JA[code]) return PITCH_CALL_JA[code];
  const d = (desc || '').toLowerCase();
  if (d.includes('ball')) return { label: 'ボール', isStrike: false, isBall: true };
  if (d.includes('called strike')) return { label: '見逃しストライク', isStrike: true, isBall: false };
  if (d.includes('swinging strike')) return { label: '空振りストライク', isStrike: true, isBall: false };
  if (d.includes('foul')) return { label: 'ファウル', isStrike: true, isBall: false };
  if (d.includes('in play')) return { label: 'インプレー', isStrike: false, isBall: false };
  return { label: desc || '投球判定', isStrike: false, isBall: false };
}

export function mphToKmh(mph?: number): number | null {
  if (mph === undefined || mph === null) return null;
  return Math.round(mph * 1.60934 * 10) / 10;
}

export function feetToMeters(ft?: number): number | null {
  if (ft === undefined || ft === null) return null;
  return Math.round(ft * 0.3048);
}

export interface TranslatedPlay {
  badge: string;
  badgeColor: string;
  isHomeRun: boolean;
  isHardHit: boolean;
  isRBI: boolean;
  japaneseSummary: string;
  statcastText?: string;
  rawDescription: string;
}

// -------------------------------------------------------------
// 自然な日本語実況文生成ヘルパー
// -------------------------------------------------------------

function getDirectionFromText(text: string): string {
  if (/left-center/i.test(text)) return '左中間';
  if (/right-center/i.test(text)) return '右中間';
  if (/left field|to left\b/i.test(text)) return 'レフト';
  if (/right field|to right\b/i.test(text)) return 'ライト';
  if (/center field|to center\b/i.test(text)) return 'センター';
  return '';
}

function getFielderPositionFromText(text: string): string {
  if (/right fielder/i.test(text)) return 'ライト';
  if (/left fielder/i.test(text)) return 'レフト';
  if (/center fielder/i.test(text)) return 'センター';
  if (/shortstop/i.test(text)) return 'ショート';
  if (/second baseman/i.test(text)) return 'セカンド';
  if (/third baseman/i.test(text)) return 'サード';
  if (/first baseman/i.test(text)) return 'ファースト';
  if (/pitcher/i.test(text)) return 'ピッチャー';
  if (/catcher/i.test(text)) return 'キャッチャー';
  return '';
}

function getInfielderFromText(text: string): string {
  if (/shortstop/i.test(text)) return 'ショート';
  if (/second baseman/i.test(text)) return 'セカンド';
  if (/third baseman/i.test(text)) return 'サード';
  if (/first baseman/i.test(text)) return 'ファースト';
  if (/pitcher/i.test(text)) return 'ピッチャー';
  if (/catcher/i.test(text)) return 'キャッチャー';
  return '';
}

function getGroundFielderFromText(text: string): string {
  const m = text.match(/grounds out(?:[,\w\s]+?)(second baseman|shortstop|third baseman|first baseman|pitcher|catcher)\b/i);
  if (m) {
    const pos = m[1].toLowerCase();
    if (pos.includes('second')) return 'セカンド';
    if (pos.includes('shortstop')) return 'ショート';
    if (pos.includes('third')) return 'サード';
    if (pos.includes('first')) return 'ファースト';
    if (pos.includes('pitcher')) return 'ピッチャー';
    if (pos.includes('catcher')) return 'キャッチャー';
  }
  return getFielderPositionFromText(text);
}

function extractScoringRunners(desc: string): string[] {
  const sentences = desc.split(/[.;]/);
  const names: string[] = [];
  for (const sentence of sentences) {
    const s = sentence.trim();
    const m = s.match(/^([A-Za-z\u00C0-\u024F\s\-']+?)\s+scores(?:\s*,\s*unearned)?$/i);
    if (m) {
      const rawName = m[1].trim();
      if (rawName && !['and', 'also'].includes(rawName.toLowerCase())) {
        names.push(getPlayerDisplayName(rawName));
      }
    }
  }
  return names;
}

/**
 * 構文解析による日本のプロ野球速報風・実況文生成
 */
function parsePlayDescription(
  desc: string,
  event: string,
  batterDisplayName: string
): string {
  const ev = (event || '').toLowerCase();
  const d = desc.trim();

  // 1. ホームラン (Homers / Grand Slam)
  if (ev.includes('home run') || /homers|grand slam|home run/i.test(d)) {
    const isGrandSlam = /grand slam/i.test(d);
    const hrMatch = d.match(/(?:homers|grand slam|home run)\s*(?:\((\d+)\))?/i);
    const hrNum = hrMatch && hrMatch[1] ? hrMatch[1] : null;
    const dir = getDirectionFromText(d);
    const dirText = dir ? `${dir}への` : '';
    const hrTitle = isGrandSlam
      ? hrNum ? `第${hrNum}号満塁本塁打！` : '満塁本塁打！'
      : hrNum ? `第${hrNum}号本塁打！` : '本塁打！';

    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${dirText}${hrTitle}`;
  }

  // 2. 併殺打 (Double Play) - 二塁打より前に判定
  if (ev.includes('double play') || /double play/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}併殺打（ダブルプレー）`;
  }

  // 3. 三塁打 (Triple)
  if (ev.includes('triple') || /\btriples\b/i.test(d)) {
    const dir = getDirectionFromText(d);
    const dirText = dir ? `${dir}への` : '';
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${dirText}スリーベースヒット！`;
  }

  // 4. 二塁打 (Double)
  if ((ev.includes('double') && !ev.includes('double play')) || /\bdoubles\b/i.test(d)) {
    const dir = getDirectionFromText(d);
    const dirText = dir ? `${dir}への` : '';
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${dirText}ツーベースヒット！`;
  }

  // 5. 単打 (Single)
  if (ev.includes('single') || /\bsingles\b/i.test(d)) {
    const isBunt = /bunt/i.test(d);
    const isRBI = /scores|rbi/i.test(d);
    const infielder = getInfielderFromText(d);
    const dir = getDirectionFromText(d);

    if (isBunt) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}セーフティバント成功（安打）！`;
    }
    if (infielder && !dir) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}${infielder}への内野安打！`;
    }
    const dirText = dir ? `${dir}への` : '';
    const hitLabel = isRBI ? 'タイムリーヒット！' : 'ヒット！';
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${dirText}${hitLabel}`;
  }

  // 6. 三振 (Strikeout)
  if (ev.includes('strikeout') || /strikes out/i.test(d)) {
    if (/looking/i.test(d)) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}見逃し三振`;
    }
    if (/foul tip/i.test(d)) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}ファウルチップ三振`;
    }
    if (/foul bunt/i.test(d)) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}スリーバント失敗三振`;
    }
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}空振り三振`;
  }

  // 7. 四球・死球 (Walk / HBP)
  if (ev.includes('walk') || /\bwalks\b/i.test(d)) {
    if (/intentional/i.test(d)) {
      return `${batterDisplayName ? batterDisplayName + ' ' : ''}申告敬遠で出塁`;
    }
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}四球で出塁`;
  }
  if (ev.includes('hit by pitch') || /hit by pitch/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}死球で出塁`;
  }

  // 8. 直野・ライナー (Lineout)
  if (ev.includes('lineout') || /lines out/i.test(d)) {
    const fielderPos = getFielderPositionFromText(d);
    const dir = getDirectionFromText(d);
    const target = fielderPos || dir || '';
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${target}ライナー`;
  }

  // 9. 飛球・フライ (Flyout / Pop Out / Foul Out)
  if (ev.includes('flyout') || /flies out/i.test(d)) {
    const fielderPos = getFielderPositionFromText(d);
    const dir = getDirectionFromText(d);
    const target = fielderPos || dir || '';
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${target}フライ`;
  }
  if (ev.includes('pop out') || /pops out/i.test(d)) {
    const fielderPos = getFielderPositionFromText(d);
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${fielderPos || '内野'}フライ`;
  }
  if (/fouls out/i.test(d)) {
    const fielderPos = getFielderPositionFromText(d);
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${fielderPos ? fielderPos + 'への' : ''}ファウルフライ`;
  }

  // 10. ゴロ (Groundout)
  if (ev.includes('groundout') || /grounds out/i.test(d)) {
    const groundFielder = getGroundFielderFromText(d);
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${groundFielder || '内野'}ゴロ`;
  }

  // 11. 犠飛・犠打
  if (ev.includes('sac fly') || /sacrifice fly/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}犠牲フライ！`;
  }
  if (ev.includes('sac bunt') || /sacrifice bunt/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}送りバント成功`;
  }

  // 12. 失策 (Error)
  if (ev.includes('error') || /error by/i.test(d)) {
    const errPos = getFielderPositionFromText(d) || getInfielderFromText(d);
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}${errPos ? errPos + 'の' : ''}エラーで出塁`;
  }

  // 13. 野手選択 (Fielder's Choice)
  if (ev.includes('fielders choice') || /fielder's choice/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}フィルダースチョイスで出塁`;
  }

  // 14. 盗塁・走塁
  if (/steals (?:second|2nd|third|3rd|home)/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}盗塁成功！`;
  }
  if (/caught stealing/i.test(d)) {
    return `${batterDisplayName ? batterDisplayName + ' ' : ''}盗塁死`;
  }
  if (/wild pitch/i.test(d)) {
    return '暴投（ワイルドピッチ）';
  }
  if (/passed ball/i.test(d)) {
    return '捕逸（パスボール）';
  }

  // 15. フォールバック（未定義パターンへの安全な置換）
  return fallbackTranslate(desc, batterDisplayName);
}

/**
 * パターン外の文章に対する安全なフォールバック翻訳（最長一致置換）
 */
function fallbackTranslate(rawDesc: string, batterDisplayName: string): string {
  let parsed = rawDesc;

  // 打者名を先頭に補完
  if (batterDisplayName && !parsed.includes(batterDisplayName)) {
    parsed = `${batterDisplayName} ${parsed}`;
  }

  // 最長一致で順序安全に置換
  return parsed
    .replace(/to left-center field/gi, '左中間へ')
    .replace(/to right-center field/gi, '右中間へ')
    .replace(/to center fielder/gi, 'センター')
    .replace(/to left fielder/gi, 'レフト')
    .replace(/to right fielder/gi, 'ライト')
    .replace(/to center field/gi, 'センターへ')
    .replace(/to left field/gi, 'レフトへ')
    .replace(/to right field/gi, 'ライトへ')
    .replace(/center fielder/gi, 'センター')
    .replace(/left fielder/gi, 'レフト')
    .replace(/right fielder/gi, 'ライト')
    .replace(/shortstop/gi, 'ショート')
    .replace(/second baseman/gi, 'セカンド')
    .replace(/third baseman/gi, 'サード')
    .replace(/first baseman/gi, 'ファースト')
    .replace(/on a fly ball/gi, 'のフライで')
    .replace(/on a line drive/gi, 'のライナーで')
    .replace(/on a sharp grounder/gi, 'の鋭いゴロで')
    .replace(/on a ground ball/gi, 'のゴロで')
    .replace(/on a pop up/gi, 'のポップフライで')
    .replace(/homers \((\d+)\)/gi, '第$1号本塁打！')
    .replace(/doubles \((\d+)\)/gi, '第$1号ツーベース！')
    .replace(/triples \((\d+)\)/gi, 'スリーベース！')
    .replace(/singles/gi, 'ヒット！')
    .replace(/strikes out swinging\./gi, '空振り三振。')
    .replace(/strikes out looking\./gi, '見逃し三振。')
    .replace(/walks\./gi, '四球で出塁。')
    .replace(/intentionally walks\./gi, '申告敬遠。')
    .replace(/grounds out,/gi, 'ゴロに倒れる。')
    .replace(/flies out,/gi, 'フライに倒れる。')
    .replace(/lines out,/gi, 'ライナーでアウト。')
    .replace(/scores\./gi, 'が生還！')
    .replace(/scores/gi, 'が生還');
}

/**
 * 英語の Play Result および Description から日本語タグと実況テキストを生成
 */
export function translatePlay(
  event: string = '',
  description: string = '',
  batterName: string = '',
  hitData?: { launchSpeed?: number; launchAngle?: number; totalDistance?: number }
): TranslatedPlay {
  const ev = (event || '').toLowerCase();
  const desc = description || '';
  const batterJp = batterName ? getPlayerDisplayName(batterName) : '';

  let badge = '【結果】';
  let badgeColor = 'bg-slate-600 text-white';
  let isHomeRun = false;
  let isRBI = false;
  let isHardHit = false;

  const speed = hitData?.launchSpeed;
  if (speed && speed >= 100.0) {
    isHardHit = true;
  }

  // 結果バッジの判定（日本のプロ野球速報に準拠した自然な表記）
  if (ev.includes('home run') || desc.toLowerCase().includes('homers') || desc.toLowerCase().includes('grand slam')) {
    badge = '[本塁打]';
    badgeColor = 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/50';
    isHomeRun = true;
    isRBI = true;
  } else if (ev.includes('triple') || desc.toLowerCase().includes('triples')) {
    badge = '[三塁打]';
    badgeColor = 'bg-emerald-500 text-white font-bold';
    if (desc.toLowerCase().includes('scores') || desc.toLowerCase().includes('rbi')) isRBI = true;
  } else if (ev.includes('double') && !ev.includes('double play')) {
    badge = '[二塁打]';
    badgeColor = 'bg-blue-500 text-white font-bold';
    if (desc.toLowerCase().includes('scores') || desc.toLowerCase().includes('rbi')) isRBI = true;
  } else if (ev.includes('single') || desc.toLowerCase().includes('singles')) {
    if (desc.toLowerCase().includes('scores') || desc.toLowerCase().includes('rbi')) {
      badge = '[適時打]';
      badgeColor = 'bg-emerald-600 text-white font-bold';
      isRBI = true;
    } else {
      badge = '[安打]';
      badgeColor = 'bg-cyan-600 text-white font-medium';
    }
  } else if (ev.includes('strikeout') || desc.toLowerCase().includes('strikes out')) {
    if (desc.toLowerCase().includes('looking')) {
      badge = '[見逃し三振]';
    } else {
      badge = '[空振り三振]';
    }
    badgeColor = 'bg-rose-700 text-white font-medium';
  } else if (ev.includes('walk') || desc.toLowerCase().includes('walks')) {
    if (desc.toLowerCase().includes('intentional')) {
      badge = '[敬遠四球]';
      badgeColor = 'bg-indigo-600 text-white';
    } else {
      badge = '[四球]';
      badgeColor = 'bg-teal-600 text-white';
    }
  } else if (ev.includes('hit by pitch') || desc.toLowerCase().includes('hit by pitch')) {
    badge = '[死球]';
    badgeColor = 'bg-orange-600 text-white';
  } else if (ev.includes('sac fly') || desc.toLowerCase().includes('sacrifice fly')) {
    badge = '[犠飛]';
    badgeColor = 'bg-purple-600 text-white font-bold';
    isRBI = true;
  } else if (ev.includes('sac bunt') || desc.toLowerCase().includes('sacrifice bunt')) {
    badge = '[犠打]';
    badgeColor = 'bg-slate-500 text-white';
  } else if (ev.includes('double play') || desc.toLowerCase().includes('double play')) {
    badge = '[併殺打]';
    badgeColor = 'bg-rose-900 text-rose-200';
  } else if (ev.includes('groundout') || desc.toLowerCase().includes('grounds out')) {
    badge = '[ゴロ]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('flyout') || desc.toLowerCase().includes('flies out')) {
    badge = '[フライ]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('lineout') || desc.toLowerCase().includes('lines out')) {
    badge = '[ライナー]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('pop out') || desc.toLowerCase().includes('pops out')) {
    badge = '[内野フライ]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('field error') || desc.toLowerCase().includes('error')) {
    badge = '[失策]';
    badgeColor = 'bg-yellow-600 text-black font-semibold';
  } else if (ev.includes('stolen base') || desc.toLowerCase().includes('steals')) {
    badge = '[盗塁]';
    badgeColor = 'bg-green-600 text-white font-bold';
  } else if (ev.includes('caught stealing')) {
    badge = '[盗塁死]';
    badgeColor = 'bg-red-800 text-white';
  } else if (ev.includes('wild pitch')) {
    badge = '[暴投]';
    badgeColor = 'bg-amber-700 text-white';
  } else if (ev.includes('passed ball')) {
    badge = '[捕逸]';
    badgeColor = 'bg-amber-800 text-white';
  }

  // 日本語実況文の生成
  let japaneseSummary = '';
  if (desc) {
    const mainAction = parsePlayDescription(desc, event, batterJp);
    const scoringRunners = extractScoringRunners(desc);

    // ソロホームラン等の場合、打者本人が生還者リストに入って重複するのを避ける
    const otherRunners = isHomeRun
      ? scoringRunners.filter((r) => r !== batterJp)
      : scoringRunners;

    if (otherRunners.length > 0) {
      japaneseSummary = `${mainAction} ${otherRunners.join('、')}が生還！`;
    } else {
      japaneseSummary = mainAction;
    }
  }

  // Statcast情報のテキスト整形
  let statcastText: string | undefined;
  if (hitData && (hitData.launchSpeed || hitData.totalDistance)) {
    const parts: string[] = [];
    if (hitData.launchSpeed) {
      const kmh = mphToKmh(hitData.launchSpeed);
      parts.push(`初速: ${hitData.launchSpeed} mph (${kmh} km/h)`);
    }
    if (hitData.launchAngle !== undefined && hitData.launchAngle !== null) {
      parts.push(`角度: ${hitData.launchAngle}°`);
    }
    if (hitData.totalDistance) {
      const meters = feetToMeters(hitData.totalDistance);
      parts.push(`飛距離: ${hitData.totalDistance} ft (${meters} m)`);
    }
    statcastText = parts.join(' | ');
  }

  return {
    badge,
    badgeColor,
    isHomeRun,
    isHardHit,
    isRBI,
    japaneseSummary: japaneseSummary || desc,
    statcastText,
    rawDescription: desc,
  };
}

/**
 * 守備位置コード・略称を日本の野球表記（一、二、遊、左、指など）に変換
 */
export const POSITION_MAP_JA: Record<string, string> = {
  P: '投',
  C: '捕',
  '1B': '一',
  '2B': '二',
  '3B': '三',
  SS: '遊',
  LF: '左',
  CF: '中',
  RF: '右',
  DH: '指',
  PH: '打',
  PR: '走',
  OF: '外',
  IF: '内',
  // 数字ポジションコード
  '1': '投',
  '2': '捕',
  '3': '一',
  '4': '二',
  '5': '三',
  '6': '遊',
  '7': '左',
  '8': '中',
  '9': '右',
  '10': '指',
};

export function translatePosition(
  pos?: string | { abbreviation?: string; name?: string; code?: string }
): string {
  if (!pos) return '';
  if (typeof pos === 'string') {
    return POSITION_MAP_JA[pos] || pos;
  }
  const abbr = pos.abbreviation || pos.code || pos.name || '';
  return POSITION_MAP_JA[abbr] || abbr;
}

/**
 * 選手の全ポジション（allPositions）を「走, 指」「打, 左」のように日本語カンマ区切りで生成
 */
export function formatPlayerPositions(
  allPositions?: Array<{ abbreviation?: string; name?: string; code?: string }>,
  primaryPosition?: { abbreviation?: string; name?: string; code?: string }
): string {
  if (allPositions && allPositions.length > 0) {
    const list = allPositions
      .map((p) => translatePosition(p))
      .filter((s) => s.length > 0);
    if (list.length > 0) {
      return list.join(', ');
    }
  }
  if (primaryPosition) {
    return translatePosition(primaryPosition);
  }
  return '';
}

/**
 * 試合が動いていない時間（非投球アクション: 投手交代、チャレンジ、マウンド訪問等）の翻訳
 */
export interface TranslatedAction {
  category:
    | 'pitcher_sub'
    | 'review'
    | 'mound_visit'
    | 'offensive_sub'
    | 'defensive_sub'
    | 'delay'
    | 'violation'
    | 'other';
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  iconType: 'pitcher' | 'review' | 'mound' | 'batter' | 'defense' | 'delay' | 'clock' | 'alert';
}

export function translatePlayAction(actionEvent: {
  details?: {
    eventType?: string;
    description?: string;
    event?: string;
  };
  type?: string;
}): TranslatedAction | null {
  const desc = actionEvent.details?.description || actionEvent.details?.event || '';
  const eventType = (actionEvent.details?.eventType || actionEvent.type || '').toLowerCase();
  const descLower = desc.toLowerCase();

  // 1. 投手交代 (Pitching Substitution)
  if (eventType.includes('pitching_substitution') || descLower.includes('pitching substitution')) {
    // 例: "Pitching Substitution: Jason Foley replaces Carson Seymour."
    const match = desc.match(/Pitching Substitution:\s*([^]+?)\s*replaces\s*([^.]+)/i);
    let title = '投手交代';
    let detail = desc;
    if (match) {
      const newPitcher = getPlayerDisplayName(match[1].trim());
      const oldPitcher = getPlayerDisplayName(match[2].trim());
      title = `投手交代: ${newPitcher} が登板`;
      detail = `${oldPitcher} → ${newPitcher}`;
    } else {
      const simpleMatch = desc.match(/Pitching Substitution:\s*([^.]+)/i);
      if (simpleMatch) {
        const newPitcher = getPlayerDisplayName(simpleMatch[1].trim());
        title = `投手交代: ${newPitcher} が登板`;
      }
    }
    return {
      category: 'pitcher_sub',
      title,
      description: detail,
      badge: '投手交代',
      badgeColor: 'bg-emerald-600/90 text-white font-bold',
      iconType: 'pitcher',
    };
  }

  // 2. チャレンジ / 審判団レビュー (Challenge / Umpire Review)
  if (
    eventType.includes('challenge') ||
    eventType.includes('review') ||
    descLower.includes('challenge') ||
    descLower.includes('review')
  ) {
    let outcome = 'リプレー検証中';
    if (descLower.includes('overturned')) {
      outcome = '判定変更（セーフ/アウト等の判定が覆る）';
    } else if (descLower.includes('confirmed') || descLower.includes('stands')) {
      outcome = '判定通り（原審支持）';
    }
    return {
      category: 'review',
      title: '審判団によるリプレー検証（チャレンジ）',
      description: desc ? `${desc} (${outcome})` : outcome,
      badge: 'チャレンジ',
      badgeColor: 'bg-purple-600/90 text-white font-bold',
      iconType: 'review',
    };
  }

  // 3. マウンド訪問 (Mound Visit)
  if (eventType.includes('mound_visit') || descLower.includes('mound visit')) {
    return {
      category: 'mound_visit',
      title: 'マウンド訪問',
      description: 'ベンチ首脳陣または捕手・内野陣がマウンドに集まり協議',
      badge: 'マウンド訪問',
      badgeColor: 'bg-amber-600/90 text-white font-bold',
      iconType: 'mound',
    };
  }

  // 4. 代打・代走起用 (Offensive Substitution)
  if (
    eventType.includes('offensive_substitution') ||
    descLower.includes('offensive substitution') ||
    descLower.includes('pinch-hitter') ||
    descLower.includes('pinch-runner')
  ) {
    const isRunner = descLower.includes('pinch-runner');
    const roleName = isRunner ? '代走' : '代打';
    const match = desc.match(/(?:Pinch-hitter|Pinch-runner)\s*([^]+?)\s*replaces\s*([^.]+)/i);
    let title = `${roleName}起用`;
    let detail = desc;
    if (match) {
      const newPlayer = getPlayerDisplayName(match[1].trim());
      const oldPlayer = getPlayerDisplayName(match[2].trim());
      title = `${roleName}起用: ${newPlayer}`;
      detail = `${oldPlayer} に代わり ${newPlayer} が出場`;
    }
    return {
      category: 'offensive_sub',
      title,
      description: detail,
      badge: roleName,
      badgeColor: 'bg-cyan-600/90 text-white font-bold',
      iconType: 'batter',
    };
  }

  // 5. 守備交代・ポジション変更 (Defensive Sub / Switch)
  if (
    eventType.includes('defensive_substitution') ||
    eventType.includes('defensive_switch') ||
    descLower.includes('defensive switch') ||
    descLower.includes('defensive substitution')
  ) {
    return {
      category: 'defensive_sub',
      title: '守備交代・守備位置変更',
      description: desc,
      badge: '守備交代',
      badgeColor: 'bg-blue-600/90 text-white font-bold',
      iconType: 'defense',
    };
  }

  // 6. 負傷中断・治療 (Injury Delay / Delay)
  if (
    eventType.includes('injury') ||
    eventType.includes('delay') ||
    descLower.includes('injury') ||
    descLower.includes('delay')
  ) {
    const isInjury = descLower.includes('injury');
    return {
      category: 'delay',
      title: isInjury ? '選手負傷による治療・試合中断' : '試合中断・一時停止',
      description: desc || (isInjury ? 'メディカルスタッフが対応中' : '試合進行が一時中断しています'),
      badge: isInjury ? '負傷治療' : '試合中断',
      badgeColor: 'bg-rose-600/90 text-white font-bold animate-pulse',
      iconType: 'delay',
    };
  }

  // 7. ピッチクロック違反 (Pitch Timer Violation)
  if (descLower.includes('pitch timer') || descLower.includes('timer violation') || descLower.includes('pitch clock')) {
    return {
      category: 'violation',
      title: 'ピッチクロック違反',
      description: desc,
      badge: '時計違反',
      badgeColor: 'bg-amber-500 text-black font-bold',
      iconType: 'clock',
    };
  }

  // 8. ボーク (Balk)
  if (eventType.includes('balk') || descLower.includes('balk')) {
    return {
      category: 'other',
      title: 'ボーク判定',
      description: desc,
      badge: 'ボーク',
      badgeColor: 'bg-yellow-500 text-black font-bold',
      iconType: 'alert',
    };
  }

  // 9. 退場処分 (Ejection)
  if (eventType.includes('ejection') || descLower.includes('ejected')) {
    return {
      category: 'other',
      title: '退場処分',
      description: desc,
      badge: '退場',
      badgeColor: 'bg-red-700 text-white font-extrabold',
      iconType: 'alert',
    };
  }

  // その他有意義なアクション説明文がある場合
  if (desc && desc.length > 3 && !descLower.startsWith('status change')) {
    return {
      category: 'other',
      title: 'フィールドアクション',
      description: desc,
      badge: 'イベント',
      badgeColor: 'bg-slate-700 text-slate-200',
      iconType: 'alert',
    };
  }

  return null;
}

