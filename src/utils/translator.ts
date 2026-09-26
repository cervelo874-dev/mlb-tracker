/**
 * MLB Real-Time Play & Pitch Japanese Translation Engine
 */

export const PLAYER_NAME_JA: Record<string, string> = {
  // Dodgers
  'Shohei Ohtani': '大谷 翔平',
  'Yoshinobu Yamamoto': '山本 由伸',
  'Mookie Betts': 'ムーキー・ベッツ',
  'Freddie Freeman': 'フレディ・フリーマン',
  'Teoscar Hernández': 'テオスカー・ヘルナンデス',
  'Teoscar Hernandez': 'テオスカー・ヘルナンデス',
  'Will Smith': 'ウィル・スミス',
  'Max Muncy': 'マックス・マンシー',
  'Tommy Edman': 'トミー・エドマン',
  'Gavin Lux': 'ギャビン・ラックス',
  'Kiké Hernández': 'キケ・ヘルナンデス',
  'Kike Hernandez': 'キケ・ヘルナンデス',
  'Miguel Rojas': 'ミゲル・ロハス',
  'Andy Pages': 'アンディ・パヘス',
  'Chris Taylor': 'クリス・テイラー',
  'Jack Flaherty': 'ジャック・フラハティ',
  'Walker Buehler': 'ウォーカー・ビューラー',
  'Tyler Glasnow': 'タイラー・グラスノー',
  'Clayton Kershaw': 'クレイトン・カーショウ',
  'Blake Treinen': 'ブレイク・トライネン',
  'Michael Kopech': 'マイケル・コペック',
  'Evan Phillips': 'エバン・フィリップス',
  'Daniel Hudson': 'ダニエル・ハドソン',
  'Alex Vesia': 'アレックス・ベシア',

  // Padres
  'Yu Darvish': 'ダルビッシュ 有',
  'Yuki Matsui': '松井 裕樹',
  'Fernando Tatis Jr.': 'フェルナンド・タティスJr.',
  'Manny Machado': 'マニー・マチャド',
  'Jackson Merrill': 'ジャクソン・メリル',
  'Jurickson Profar': 'ジュリクソン・プロファー',
  'Luis Arraez': 'ルイス・アラエス',
  'Xander Bogaerts': 'ザンダー・ボガーツ',
  'Michael King': 'マイケル・キング',
  'Robert Suarez': 'ロベルト・スアレス',

  // Cubs
  'Shota Imanaga': '今永 昇太',
  'Seiya Suzuki': '鈴木 誠也',
  'Cody Bellinger': 'コディ・ベリンジャー',
  'Dansby Swanson': 'ダンスビー・スワンソン',
  'Ian Happ': 'イアン・ハップ',

  // Yankees
  'Aaron Judge': 'アーロン・ジャッジ',
  'Juan Soto': 'フアン・ソト',
  'Giancarlo Stanton': 'ジャンカルロ・スタントン',
  'Gerrit Cole': 'ゲリット・コール',
  'Anthony Volpe': 'アンソニー・ボルピ',

  // Mets
  'Kodai Senga': '千賀 滉大',
  'Francisco Lindor': 'フランシスコ・リンドーア',
  'Pete Alonso': 'ピート・アロンソ',

  // Red Sox
  'Masataka Yoshida': '吉田 正尚',
  'Rafael Devers': 'ラファエル・デバース',
  'Jarren Duran': 'ジャレン・デュラン',

  // Astros
  'Yusei Kikuchi': '菊池 雄星',
  'Jose Altuve': 'ホセ・アルトゥーベ',
  'Yordan Alvarez': 'ヨルダン・アルバレス',
  'Alex Bregman': 'アレックス・ブレグマン',

  // Angels
  'Mike Trout': 'マイク・トラウト',

  // Phillies
  'Bryce Harper': 'ブライス・ハーパー',
  'Kyle Schwarber': 'カイル・シュワーバー',
  'Trea Turner': 'トレイ・ターナー',
  'Zack Wheeler': 'ザック・ウィーラー',

  // Marlins
  'Jake Burger': 'ジェイク・バーガー',
};

export function getPlayerDisplayName(fullName: string): string {
  if (!fullName) return '';
  return PLAYER_NAME_JA[fullName] || fullName;
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

  let badge = '【結果】';
  let badgeColor = 'bg-slate-600 text-white';
  let isHomeRun = false;
  let isRBI = false;
  let isHardHit = false;

  const speed = hitData?.launchSpeed;
  if (speed && speed >= 100.0) {
    isHardHit = true;
  }

  // ホームラン判定
  if (ev.includes('home run') || desc.toLowerCase().includes('homers') || desc.toLowerCase().includes('grand slam')) {
    badge = '[本塁打]';
    badgeColor = 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/50';
    isHomeRun = true;
    isRBI = true;
  } else if (ev.includes('triple') || desc.toLowerCase().includes('triples')) {
    badge = '[三塁打]';
    badgeColor = 'bg-emerald-500 text-white font-bold';
    if (desc.toLowerCase().includes('scores') || desc.toLowerCase().includes('rbi')) isRBI = true;
  } else if (ev.includes('double') || desc.toLowerCase().includes('doubles')) {
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
  } else if (ev.includes('double play') || desc.toLowerCase().includes('grounds into a double play')) {
    badge = '[併殺打]';
    badgeColor = 'bg-rose-900 text-rose-200';
  } else if (ev.includes('groundout') || desc.toLowerCase().includes('grounds out')) {
    badge = '[ゴロ]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('flyout') || desc.toLowerCase().includes('flies out')) {
    badge = '[飛球]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('lineout') || desc.toLowerCase().includes('lines out')) {
    badge = '[直野]';
    badgeColor = 'bg-slate-700 text-slate-300';
  } else if (ev.includes('pop out') || desc.toLowerCase().includes('pops out')) {
    badge = '[内野飛球]';
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

  // 日本語要約文の生成
  let japaneseSummary = '';

  // 英語の実況文を日本語の表現に変換
  let parsedDesc = desc;
  Object.keys(PLAYER_NAME_JA).forEach((engName) => {
    if (parsedDesc.includes(engName)) {
      parsedDesc = parsedDesc.split(engName).join(PLAYER_NAME_JA[engName]);
    }
  });

  // 打者名が実況に含まれていない場合は先頭に付与
  const batterJp = batterName ? getPlayerDisplayName(batterName) : '';
  if (batterJp && !parsedDesc.includes(batterJp)) {
    parsedDesc = `${batterJp}: ${parsedDesc}`;
  }

  // 打球方向などの置換
  parsedDesc = parsedDesc
    .replace(/to left-center field/gi, '左中間へ')
    .replace(/to right-center field/gi, '右中間へ')
    .replace(/to center field/gi, 'センターへ')
    .replace(/to left field/gi, 'レフトへ')
    .replace(/to right field/gi, 'ライトへ')
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
    .replace(/scores\./gi, 'が生還、得点！')
    .replace(/scores/gi, 'が生還');

  japaneseSummary = parsedDesc;

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
