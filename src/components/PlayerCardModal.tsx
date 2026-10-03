import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCw, Loader2 } from 'lucide-react';
import { MLB_TEAMS } from '../constants/teams';
import { getPlayerDisplayName } from '../utils/translator';
import { triggerVibration, VIBRATION_PATTERNS } from '../utils/vibrate';

/* ------------------------------------------------------------------ */
/* 型定義                                                              */
/* ------------------------------------------------------------------ */

export type StatGroup = 'hitting' | 'pitching';

export interface PlayerSelection {
  id: number;
  fullName?: string;
  /** 今日どちらで出場したか（打者行・打席中 → hitting / 投手行・登板中 → pitching） */
  preferredGroup: StatGroup;
  /** 判明していれば所属チームID（未指定時は API の currentTeam を使用） */
  teamId?: number;
}

type Period = 'regular' | 'post' | 'career';

interface StatBundle {
  hitting?: Record<string, any>;
  pitching?: Record<string, any>;
}

interface PlayerCardData {
  person: any;
  regular: StatBundle;
  post: StatBundle;
  career: StatBundle;
}

interface PlayerCardModalProps {
  selection: PlayerSelection | null;
  season: string;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* データ取得（シンプルなメモリキャッシュ付き）                          */
/* ------------------------------------------------------------------ */

const cache = new Map<string, PlayerCardData>();

const extractStats = (json: any): { season: StatBundle; career: StatBundle } => {
  const season: StatBundle = {};
  const career: StatBundle = {};
  (json?.stats || []).forEach((s: any) => {
    const type = s?.type?.displayName;
    const group = s?.group?.displayName as StatGroup;
    // 複数球団に在籍した場合は splits が複数になるため、合算行（team なし）を優先
    const splits: any[] = s?.splits || [];
    const total = splits.find((sp) => !sp.team) || splits[splits.length - 1];
    if (!total?.stat || (group !== 'hitting' && group !== 'pitching')) return;
    if (type === 'season') season[group] = total.stat;
    if (type === 'career') career[group] = total.stat;
  });
  return { season, career };
};

const fetchPlayerCardData = async (id: number, season: string): Promise<PlayerCardData> => {
  const key = `${id}-${season}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const base = 'https://statsapi.mlb.com/api/v1/people';
  const [personRes, regRes, postRes] = await Promise.all([
    fetch(`${base}/${id}?hydrate=currentTeam`),
    fetch(`${base}/${id}/stats?stats=season,career&group=hitting,pitching&season=${season}&gameType=R`),
    fetch(`${base}/${id}/stats?stats=season&group=hitting,pitching&season=${season}&gameType=P`),
  ]);
  if (!personRes.ok) throw new Error('選手データの取得に失敗しました');

  const personJson = await personRes.json();
  const regJson = regRes.ok ? await regRes.json() : {};
  const postJson = postRes.ok ? await postRes.json() : {};

  const reg = extractStats(regJson);
  const post = extractStats(postJson);

  const data: PlayerCardData = {
    person: personJson?.people?.[0] || {},
    regular: reg.season,
    career: reg.career,
    post: post.season,
  };
  cache.set(key, data);
  return data;
};

/* ------------------------------------------------------------------ */
/* 表示ヘルパー                                                         */
/* ------------------------------------------------------------------ */

const COUNTRY_JA: Record<string, string> = {
  Japan: '日本',
  USA: 'アメリカ',
  'United States': 'アメリカ',
  'Dominican Republic': 'ドミニカ共和国',
  Venezuela: 'ベネズエラ',
  Cuba: 'キューバ',
  'Puerto Rico': 'プエルトリコ',
  Mexico: 'メキシコ',
  Canada: 'カナダ',
  Colombia: 'コロンビア',
  Panama: 'パナマ',
  'South Korea': '韓国',
  Korea: '韓国',
  Taiwan: '台湾',
  Curacao: 'キュラソー',
  'Curaçao': 'キュラソー',
  Netherlands: 'オランダ',
  Australia: 'オーストラリア',
  Nicaragua: 'ニカラグア',
  Bahamas: 'バハマ',
  Aruba: 'アルバ',
  Brazil: 'ブラジル',
  Germany: 'ドイツ',
  'United Kingdom': 'イギリス',
  Honduras: 'ホンジュラス',
  Peru: 'ペルー',
  Jamaica: 'ジャマイカ',
};

const POSITION_JA: Record<string, string> = {
  P: '投手',
  SP: '先発投手',
  RP: '救援投手',
  C: '捕手',
  '1B': '一塁手',
  '2B': '二塁手',
  '3B': '三塁手',
  SS: '遊撃手',
  LF: '左翼手',
  CF: '中堅手',
  RF: '右翼手',
  OF: '外野手',
  IF: '内野手',
  DH: '指名打者',
  TWP: '二刀流',
};

const handJa = (code?: string) => (code === 'R' ? '右' : code === 'L' ? '左' : code === 'S' ? '両' : '-');

const heightToCm = (h?: string): string => {
  if (!h) return '-';
  const m = h.match(/(\d+)'\s*(\d+)?/);
  if (!m) return h;
  const cm = Math.round((parseInt(m[1], 10) * 12 + parseInt(m[2] || '0', 10)) * 2.54);
  return `${cm}cm`;
};

const lbsToKg = (w?: number): string => (w ? `${Math.round(w * 0.4536)}kg` : '-');

const v = (val: any, suffix = ''): string =>
  val === undefined || val === null || val === '' ? '-' : `${val}${suffix}`;

interface StatItem {
  label: string;
  value: string;
  highlight?: boolean;
}

const mainStats = (group: StatGroup, s?: Record<string, any>): StatItem[] => {
  if (group === 'hitting') {
    return [
      { label: '打率', value: v(s?.avg), highlight: true },
      { label: '本塁打', value: v(s?.homeRuns) },
      { label: '打点', value: v(s?.rbi) },
      { label: 'OPS', value: v(s?.ops), highlight: true },
    ];
  }
  return [
    { label: '防御率', value: v(s?.era), highlight: true },
    { label: '勝敗', value: s ? `${s.wins ?? 0}-${s.losses ?? 0}` : '-' },
    { label: '奪三振', value: v(s?.strikeOuts) },
    { label: 'WHIP', value: v(s?.whip), highlight: true },
  ];
};

export interface StatBarItem {
  key: string;
  label: string;
  subLabel: string;
  value: string;
  percent: number;
  gradient: string;
  glowColor: string;
}

export interface SummaryStatItem {
  label: string;
  value: string;
}

const getStatusBarStats = (group: StatGroup, s?: Record<string, any>): StatBarItem[] => {
  if (!s) return [];
  if (group === 'hitting') {
    const avgNum = parseFloat(s.avg) || 0;
    const hrNum = parseInt(s.homeRuns, 10) || 0;
    const rbiNum = parseInt(s.rbi, 10) || 0;
    const opsNum = parseFloat(s.ops) || 0;
    const obpNum = parseFloat(s.obp) || 0;
    const sbNum = parseInt(s.stolenBases, 10) || 0;

    return [
      {
        key: 'avg',
        label: '打率',
        subLabel: 'AVG',
        value: v(s.avg),
        percent: Math.min(100, Math.max(8, Math.round(((avgNum - 0.180) / (0.340 - 0.180)) * 100))),
        gradient: 'from-emerald-400 to-teal-300',
        glowColor: 'rgba(52, 211, 153, 0.7)',
      },
      {
        key: 'hr',
        label: '本塁打',
        subLabel: 'HR',
        value: v(s.homeRuns),
        percent: Math.min(100, Math.max(8, Math.round((hrNum / 45) * 100))),
        gradient: 'from-amber-400 to-orange-500',
        glowColor: 'rgba(251, 146, 60, 0.7)',
      },
      {
        key: 'rbi',
        label: '打点',
        subLabel: 'RBI',
        value: v(s.rbi),
        percent: Math.min(100, Math.max(8, Math.round((rbiNum / 110) * 100))),
        gradient: 'from-rose-400 to-pink-500',
        glowColor: 'rgba(244, 63, 94, 0.7)',
      },
      {
        key: 'ops',
        label: 'OPS',
        subLabel: 'OPS',
        value: v(s.ops),
        percent: Math.min(100, Math.max(8, Math.round(((opsNum - 0.550) / (1.000 - 0.550)) * 100))),
        gradient: 'from-yellow-300 via-amber-400 to-amber-500',
        glowColor: 'rgba(245, 158, 11, 0.8)',
      },
      {
        key: 'obp',
        label: '出塁率',
        subLabel: 'OBP',
        value: v(s.obp),
        percent: Math.min(100, Math.max(8, Math.round(((obpNum - 0.260) / (0.420 - 0.260)) * 100))),
        gradient: 'from-sky-400 to-blue-500',
        glowColor: 'rgba(56, 189, 248, 0.7)',
      },
      {
        key: 'sb',
        label: '盗塁',
        subLabel: 'SB',
        value: v(s.stolenBases),
        percent: Math.min(100, Math.max(8, Math.round((sbNum / 35) * 100))),
        gradient: 'from-lime-400 to-emerald-400',
        glowColor: 'rgba(163, 230, 53, 0.7)',
      },
    ];
  } else {
    // 投手
    const eraNum = parseFloat(s.era) || 4.0;
    const soNum = parseInt(s.strikeOuts, 10) || 0;
    const whipNum = parseFloat(s.whip) || 1.3;
    const avgNum = parseFloat(s.avg) || 0.25;
    const k9Num = parseFloat(s.strikeoutsPer9Inn) || 0;
    const ipNum = parseFloat(s.inningsPitched) || 0;

    return [
      {
        key: 'era',
        label: '防御率',
        subLabel: 'ERA',
        value: v(s.era),
        percent: Math.min(100, Math.max(8, Math.round(((5.50 - eraNum) / (5.50 - 1.80)) * 100))),
        gradient: 'from-yellow-300 via-amber-400 to-amber-500',
        glowColor: 'rgba(245, 158, 11, 0.8)',
      },
      {
        key: 'so',
        label: '奪三振',
        subLabel: 'SO',
        value: v(s.strikeOuts),
        percent: Math.min(100, Math.max(8, Math.round((soNum / 220) * 100))),
        gradient: 'from-cyan-400 to-blue-500',
        glowColor: 'rgba(34, 211, 238, 0.7)',
      },
      {
        key: 'whip',
        label: 'WHIP',
        subLabel: 'WHIP',
        value: v(s.whip),
        percent: Math.min(100, Math.max(8, Math.round(((1.55 - whipNum) / (1.55 - 0.85)) * 100))),
        gradient: 'from-emerald-400 to-teal-300',
        glowColor: 'rgba(52, 211, 153, 0.7)',
      },
      {
        key: 'baa',
        label: '被打率',
        subLabel: 'BAA',
        value: v(s.avg),
        percent: Math.min(100, Math.max(8, Math.round(((0.290 - avgNum) / (0.290 - 0.170)) * 100))),
        gradient: 'from-purple-400 to-indigo-500',
        glowColor: 'rgba(192, 132, 252, 0.7)',
      },
      {
        key: 'k9',
        label: '奪三振率',
        subLabel: 'K/9',
        value: v(s.strikeoutsPer9Inn),
        percent: Math.min(100, Math.max(8, Math.round(((k9Num - 4.0) / (13.0 - 4.0)) * 100))),
        gradient: 'from-orange-400 to-rose-400',
        glowColor: 'rgba(251, 146, 60, 0.7)',
      },
      {
        key: 'ip',
        label: '投球回',
        subLabel: 'IP',
        value: v(s.inningsPitched),
        percent: Math.min(100, Math.max(8, Math.round((ipNum / 190) * 100))),
        gradient: 'from-sky-400 to-cyan-300',
        glowColor: 'rgba(56, 189, 248, 0.7)',
      },
    ];
  }
};

const getSummaryStats = (group: StatGroup, s?: Record<string, any>): SummaryStatItem[] => {
  if (!s) return [];
  if (group === 'hitting') {
    return [
      { label: '試合', value: v(s.gamesPlayed) },
      { label: '打数', value: v(s.atBats) },
      { label: '安打', value: v(s.hits) },
      { label: '二塁打', value: v(s.doubles) },
      { label: '四球', value: v(s.baseOnBalls) },
      { label: '長打率', value: v(s.slg) },
    ];
  } else {
    return [
      { label: '登板', value: v(s.gamesPitched) },
      { label: '先発', value: v(s.gamesStarted) },
      { label: '勝敗', value: s ? `${s.wins ?? 0}-${s.losses ?? 0}` : '-' },
      { label: 'セーブ', value: v(s.saves) },
      { label: '被安打', value: v(s.hits) },
      { label: '与四球', value: v(s.baseOnBalls) },
    ];
  }
};

const PERIOD_LABEL: Record<Period, string> = {
  regular: 'レギュラーシーズン',
  post: 'ポストシーズン',
  career: '通算',
};

const GOLD_FRAME =
  'linear-gradient(135deg, #fff3c4 0%, #d9a840 18%, #fbe7a1 35%, #a8741a 52%, #f6d77a 70%, #b8862b 85%, #fff1b8 100%)';

/* ------------------------------------------------------------------ */
/* メインコンポーネント                                                 */
/* ------------------------------------------------------------------ */

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({ selection, season, onClose }) => {
  const [data, setData] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('regular');
  const [group, setGroup] = useState<StatGroup>('hitting');
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const [imgStage, setImgStage] = useState(0);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  /* 選手が切り替わったらリセット & 取得 */
  useEffect(() => {
    if (!selection) return;
    triggerVibration(VIBRATION_PATTERNS.lightTap);
    let cancelled = false;
    setPeriod('regular');
    setGroup(selection.preferredGroup);
    setFlipped(false);
    setImgStage(0);
    setError(null);
    setLoading(true);
    setData(null);
    fetchPlayerCardData(selection.id, season)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e?.message || 'データ取得エラー'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selection, season]);

  /* Esc で閉じる & 背面スクロール固定 */
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selection, onClose]);

  const person = data?.person;
  const teamId = selection?.teamId || person?.currentTeam?.id;
  const team = teamId ? MLB_TEAMS[teamId] : undefined;
  const primary = team?.primaryColor || '#1e3a8a';
  const secondary = team?.secondaryColor || '#0f172a';

  /* 二刀流判定 */
  const isTwoWay = useMemo(() => {
    if (!data) return false;
    if (data.person?.primaryPosition?.abbreviation === 'TWP') return true;
    const h = data.regular.hitting;
    const p = data.regular.pitching;
    return (h?.plateAppearances ?? 0) >= 50 && (p?.gamesPitched ?? 0) >= 5;
  }, [data]);

  /* 選択グループのデータが存在しない場合は存在する方へ自動補正 */
  useEffect(() => {
    if (!data || isTwoWay) return;
    const has = (g: StatGroup) => !!(data.regular[g] || data.career[g]);
    if (!has(group)) {
      const other: StatGroup = group === 'hitting' ? 'pitching' : 'hitting';
      if (has(other)) setGroup(other);
    }
  }, [data, isTwoWay, group]);

  const currentStats = data?.[period]?.[group];
  const hasPost = !!(data?.post.hitting || data?.post.pitching);

  const statusBarStats = useMemo(() => getStatusBarStats(group, currentStats), [group, currentStats]);
  const summaryStats = useMemo(() => getSummaryStats(group, currentStats), [group, currentStats]);

  /* ---------------- 3D チルト & ホロ演出 ---------------- */
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    if (pointerStart.current) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      if (Math.hypot(dx, dy) > 10) movedRef.current = true;
    }
    setTilt({
      rx: (0.5 - py) * 22,
      ry: (px - 0.5) * 26,
      mx: Math.max(0, Math.min(100, px * 100)),
      my: Math.max(0, Math.min(100, py * 100)),
      active: true,
    });
  }, []);

  const resetTilt = () => {
    pointerStart.current = null;
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  };

  const handleCardClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    triggerVibration(VIBRATION_PATTERNS.lightTap);
    setFlipped((f) => !f);
  };

  if (!selection) return null;

  const displayName = getPlayerDisplayName(person?.fullName || selection.fullName || '');
  const englishName = person?.fullName || selection.fullName || '';
  const showEnglishSub = displayName !== englishName && englishName;
  const posAbbr = person?.primaryPosition?.abbreviation || '';
  const posJa = POSITION_JA[posAbbr] || person?.primaryPosition?.name || '';
  const number = person?.primaryNumber;

  const headshotUrls = [
    // 1. 最優先: 試合中のダイナミックなアクションショット（最高解像度 w_1600）
    `https://img.mlbstatic.com/mlb-photos/image/upload/w_1600,q_auto:best,f_auto/v1/people/${selection.id}/action/hero/current`,
    // 2. フォールバック1: 高解像度公式キャップ着用バストアップ切り抜き (w_1200)
    `https://img.mlbstatic.com/mlb-photos/image/upload/w_1200,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${selection.id}/headshot/silo/current.png`,
    // 3. フォールバック2: 公式ヘッドショット67 (w_1200)
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_1200,q_auto:best/v1/people/${selection.id}/headshot/67/current`,
  ];

  /* 共通: カード面のベーススタイル */
  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: '1.25rem',
    padding: 3,
    background: GOLD_FRAME,
  };

  const innerBg: React.CSSProperties = {
    background: `radial-gradient(120% 80% at 50% 0%, ${primary}ee 0%, ${primary}99 35%, #0a0f1c 78%), linear-gradient(160deg, ${secondary}55, transparent 60%)`,
  };

  const holoLayer = (
    <>
      {/* ホログラフィック・プリズム */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[1.1rem] ${tilt.active ? '' : 'animate-holo-idle'}`}
        style={{
          background:
            'linear-gradient(115deg, transparent 18%, rgba(255,219,112,0.38) 32%, rgba(160,80,255,0.28) 41%, rgba(0,255,224,0.30) 50%, rgba(255,90,200,0.28) 59%, rgba(255,240,150,0.30) 66%, transparent 80%)',
          backgroundSize: '250% 250%',
          backgroundPosition: `${tilt.mx}% ${tilt.my}%`,
          mixBlendMode: 'color-dodge',
          opacity: tilt.active ? 0.85 : 0.55,
          transition: tilt.active ? 'none' : 'opacity 0.4s ease',
        }}
      />
      {/* グレア（光源の反射） */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.1rem]"
        style={{
          background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 30%, transparent 55%)`,
          mixBlendMode: 'overlay',
          opacity: tilt.active ? 1 : 0.4,
        }}
      />
    </>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4 py-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-200 flex items-center justify-center hover:bg-slate-800 transition-colors z-10"
        aria-label="閉じる"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-4 w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
        {/* ========== カード本体 ========== */}
        <div
          className="relative w-full animate-card-enter"
          style={{ aspectRatio: '5 / 7', perspective: 1200 }}
        >
          <div
            className="absolute inset-0 cursor-pointer select-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: tilt.active ? 'transform 0.05s linear' : 'transform 0.6s cubic-bezier(.2,.8,.2,1)',
              touchAction: 'none',
              filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.65)) drop-shadow(0 0 25px rgba(245,180,60,0.25))',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
            onPointerUp={() => (pointerStart.current = null)}
            onPointerCancel={resetTilt}
            onClick={handleCardClick}
          >
            <div
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${flipped ? 180 : 0}deg)`,
                transition: 'transform 0.75s cubic-bezier(.3,1.3,.5,1)',
              }}
            >
              {/* ---------------- 表面 ---------------- */}
              <div
                style={{
                  ...faceStyle,
                  transform: 'rotateY(0deg) translateZ(1px)',
                  opacity: flipped ? 0 : 1,
                  pointerEvents: flipped ? 'none' : 'auto',
                  transition: 'opacity 0.2s ease',
                }}
              >
                <div className="relative w-full h-full rounded-[1.1rem] overflow-hidden flex flex-col justify-between" style={innerBg}>
                  {/* 背景の装飾パターン */}
                  <div
                    className="absolute inset-0 opacity-[0.12] pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 12px)',
                    }}
                  />
                  {/* 巨大背番号（透かし） */}
                  {number && (
                    <div className="absolute -right-2 top-10 text-[9rem] leading-none font-black text-white/10 font-mono pointer-events-none select-none">
                      {number}
                    </div>
                  )}

                  {/* 選手写真（見切れを防ぐ引きの構図 ＋ 自然なスタジアム光彩ブレンド） */}
                  <div className="absolute inset-x-0 top-0 bottom-[135px] overflow-hidden">
                    {imgStage < headshotUrls.length ? (
                      <>
                        {/* 背面: 写真のエッジ色・スタジアムの光彩をカード上部全体に広げるアンビエントブレンド層 */}
                        <img
                          src={headshotUrls[imgStage]}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-125 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />

                        {/* 前面: 適度な引き（scale-95〜100、中央寄り）で見切れを防ぎ、フォームの躍動感を綺麗に収める */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center p-2 pt-10">
                          <img
                            key={imgStage}
                            src={headshotUrls[imgStage]}
                            alt={displayName}
                            className="w-full h-full object-contain object-center drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] filter contrast-[1.03] transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            draggable={false}
                            onError={() => setImgStage((s) => s + 1)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-7xl font-black">
                        {number || '?'}
                      </div>
                    )}
                    {/* 写真上部フェード（ロゴ・シーズン文字の視認性確保） */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none z-10" />

                    {/* 写真下部フェード（ネームプレートへのシームレスなグラデーション） */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/80 to-transparent pointer-events-none z-10" />
                  </div>

                  {/* ヘッダー：チームロゴ・シーズン（写真の上にフローティング配置） */}
                  <div className="relative z-20 flex items-center justify-between px-4 pt-3.5 drop-shadow-md">
                    <div className="w-11 h-11 rounded-full bg-white/95 p-1.5 shadow-xl ring-2 ring-amber-300/80 flex items-center justify-center backdrop-blur-sm">
                      {team?.logo && <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />}
                    </div>
                    <div className="text-right bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 shadow-lg">
                      <div className="text-[10px] font-black tracking-[0.25em] text-amber-300">{season} SEASON</div>
                      <div className="text-xs font-black text-white">{team?.jpName || person?.currentTeam?.name || ''}</div>
                    </div>
                  </div>

                  {/* 中央スペーサー（写真を見せるための十分なスペース） */}
                  <div className="flex-1 min-h-[140px]" />

                  {/* 下部：ネームプレート＆主要成績 */}
                  <div className="relative z-20">
                    {/* ネームプレート */}
                    <div className="px-3.5">
                      <div
                        className="rounded-xl px-3 py-2 border border-amber-300/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md"
                        style={{ background: 'linear-gradient(180deg, rgba(15,20,35,0.88), rgba(5,8,15,0.96))' }}
                      >
                        <div className="flex items-center gap-2">
                          {number && (
                            <span
                              className="text-xl font-black font-mono text-transparent bg-clip-text"
                              style={{ backgroundImage: GOLD_FRAME }}
                            >
                              #{number}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                            {displayName || '...'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-slate-300 font-semibold truncate">
                            {showEnglishSub ? englishName : ''}
                          </span>
                          <span className="text-xs font-bold text-amber-200 whitespace-nowrap">
                            {posJa}
                            {person && ` · ${handJa(person?.pitchHand?.code)}投${handJa(person?.batSide?.code)}打`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 主要成績 */}
                    <div className="px-3.5 pt-2 pb-3.5">
                      <div className="grid grid-cols-4 gap-1.5">
                        {mainStats(group, currentStats).map((it) => (
                          <div
                            key={it.label}
                            className="rounded-lg py-1.5 text-center bg-black/55 backdrop-blur-sm border border-white/10"
                          >
                            <div className="text-[10px] font-bold text-slate-300">{it.label}</div>
                            <div
                              className={`text-base sm:text-lg font-black font-mono leading-tight ${
                                it.highlight ? 'text-amber-300' : 'text-white'
                              }`}
                            >
                              {loading ? '…' : it.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 text-center text-[10px] font-bold tracking-widest text-amber-100/70">
                        {PERIOD_LABEL[period]} · {group === 'hitting' ? '打撃成績' : '投球成績'}
                      </div>
                    </div>
                  </div>

                  {holoLayer}
                </div>
              </div>

              {/* ---------------- 裏面 ---------------- */}
              <div
                style={{
                  ...faceStyle,
                  transform: 'rotateY(180deg) translateZ(1px)',
                  opacity: flipped ? 1 : 0,
                  pointerEvents: flipped ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease',
                }}
              >
                <div
                  className="relative w-full h-full rounded-[1.1rem] overflow-hidden flex flex-col justify-between p-3"
                  style={{
                    background: `linear-gradient(170deg, #0d1322 0%, #0a0f1c 55%, ${primary}66 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
                      backgroundSize: '14px 14px',
                    }}
                  />

                  {/* ① 裏面ヘッダー */}
                  <div className="relative z-10 flex items-center justify-between pb-2 border-b border-amber-300/25">
                    <div className="flex items-center gap-2 min-w-0">
                      {team?.logo && (
                        <div className="w-7 h-7 rounded-full bg-white/95 p-0.5 flex-shrink-0 shadow">
                          <img src={team.logo} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-black text-white truncate">
                          {number ? `#${number} ` : ''}
                          {displayName}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold text-slate-300 truncate">
                          {englishName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-400/35 text-amber-200 border border-amber-400/40 shadow-sm">
                        {PERIOD_LABEL[period]}
                      </span>
                    </div>
                  </div>

                  {/* ② プロフィール（上部コンパクトグリッド） */}
                  <div className="relative z-10 grid grid-cols-4 gap-1 pt-1.5 text-center">
                    <div className="rounded-lg bg-white/5 border border-white/10 px-1 py-1">
                      <div className="text-[9px] text-slate-400 font-bold">年齢</div>
                      <div className="text-[11px] font-black text-slate-100">{person?.currentAge ? `${person.currentAge}歳` : '-'}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 px-1 py-1">
                      <div className="text-[9px] text-slate-400 font-bold">体格</div>
                      <div className="text-[11px] font-black text-slate-100">{heightToCm(person?.height)} / {lbsToKg(person?.weight)}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 px-1 py-1">
                      <div className="text-[9px] text-slate-400 font-bold">投打</div>
                      <div className="text-[11px] font-black text-slate-100">{person ? `${handJa(person?.pitchHand?.code)}投${handJa(person?.batSide?.code)}打` : '-'}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 border border-white/10 px-1 py-1">
                      <div className="text-[9px] text-slate-400 font-bold">出身</div>
                      <div className="text-[11px] font-black text-slate-100 truncate">{person?.birthCountry ? COUNTRY_JA[person.birthCountry] || person.birthCountry : '-'}</div>
                    </div>
                  </div>

                  {/* ③ 主要6項目 スタイリッシュ・ネオンステータスバー（中央） */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center space-y-1.5 my-1 px-1">
                    {statusBarStats.length > 0 ? (
                      statusBarStats.map((item) => (
                        <div key={item.key} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px] leading-tight">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                              <span>{item.label}</span>
                              <span className="text-[9px] text-slate-400 font-mono font-medium">({item.subLabel})</span>
                            </span>
                            <span className="font-black font-mono text-xs text-white">
                              {item.value}
                            </span>
                          </div>
                          {/* プログレスバー溝 */}
                          <div className="w-full h-2 rounded-full bg-slate-900/95 border border-slate-700/60 overflow-hidden p-[1px]">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-700 ease-out`}
                              style={{
                                width: `${item.percent}%`,
                                boxShadow: `0 0 8px ${item.glowColor}`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold text-center px-4">
                        {loading ? '読み込み中…' : `${PERIOD_LABEL[period]}のデータはありません`}
                      </div>
                    )}
                  </div>

                  {/* ④ 補足データ（下部ミニバッジグリッド） */}
                  <div className="relative z-10 grid grid-cols-6 gap-1 pt-1.5 border-t border-white/10 text-center">
                    {summaryStats.map((item, idx) => (
                      <div key={idx} className="bg-black/45 rounded-md py-1 px-0.5 border border-white/10 shadow-sm">
                        <div className="text-[8px] text-slate-400 font-bold leading-tight truncate">{item.label}</div>
                        <div className="text-[10px] font-mono font-black text-slate-100 leading-tight mt-0.5 truncate">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* ⑤ フッター刻印 */}
                  <div className="relative z-10 pt-1 text-center">
                    <span className="text-[8px] font-bold text-amber-200/60 tracking-widest uppercase">
                      OFFICIAL MLB PLAYER CARD · {group === 'hitting' ? 'BATTING METRICS' : 'PITCHING METRICS'}
                    </span>
                  </div>

                  {holoLayer}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========== コントロール ========== */}
        <div className="w-full space-y-2 mt-1">
          {(loading || error) && (
            <div className="flex justify-center text-xs font-bold text-amber-200/90 items-center gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> 選手データを取得中…
                </>
              ) : (
                <span className="text-rose-300">{error}</span>
              )}
            </div>
          )}
          {/* 期間タブ */}
          <div className="flex p-1 rounded-xl bg-slate-900/90 border border-amber-400/25">
            {(['regular', 'post', 'career'] as Period[]).map((p) => {
              const disabled = p === 'post' && !!data && !hasPost;
              return (
                <button
                  key={p}
                  disabled={disabled}
                  onClick={() => {
                    triggerVibration(VIBRATION_PATTERNS.lightTap);
                    setPeriod(p);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all ${
                    period === p
                      ? 'text-slate-950 shadow-[0_0_12px_rgba(245,180,60,0.5)]'
                      : disabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  style={period === p ? { background: GOLD_FRAME } : undefined}
                >
                  {p === 'regular' ? 'レギュラー' : p === 'post' ? 'ポスト' : '通算'}
                </button>
              );
            })}
          </div>

          {/* 二刀流トグル */}
          {isTwoWay && (
            <div className="flex p-1 rounded-xl bg-slate-900/90 border border-slate-700">
              {(['hitting', 'pitching'] as StatGroup[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    triggerVibration(VIBRATION_PATTERNS.lightTap);
                    setGroup(g);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black transition-all ${
                    group === g ? 'bg-slate-100 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {g === 'hitting' ? '⚾ 打撃' : '🔥 投球'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              triggerVibration(VIBRATION_PATTERNS.lightTap);
              setFlipped((f) => !f);
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-200/80 py-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            カードをタップで{flipped ? '表面' : '裏面（詳細成績・プロフィール）'}へ
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
