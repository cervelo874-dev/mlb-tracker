import React, { useState } from 'react';
import type { PlayEvent } from '../types/mlb';
import { getPitchCallJapanese, getPitchTypeJapanese, mphToKmh } from '../utils/translator';
import { ChevronDown, ChevronUp, Activity, History } from 'lucide-react';

interface PitchSequencePillsProps {
  playEvents?: PlayEvent[];
  className?: string;
}

export const PitchSequencePills: React.FC<PitchSequencePillsProps> = ({
  playEvents = [],
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 投球イベントのみを抽出
  const pitches = playEvents.filter((e) => e.isPitch);

  if (pitches.length === 0) {
    return (
      <div className={`w-full glass-panel rounded-2xl p-3 border border-slate-700/60 shadow-md text-xs text-slate-500 flex items-center justify-center gap-2 ${className}`}>
        <History className="w-4 h-4 text-slate-600" />
        <span>この打席の投球データ待機中...</span>
      </div>
    );
  }

  // 表示する投球リスト（折りたたみ時は最新4球、展開時は全投球）
  const totalPitches = pitches.length;
  const showAll = isExpanded || totalPitches <= 4;
  const displayedPitches = showAll ? pitches : pitches.slice(totalPitches - 4);

  // 判定に応じたバッジ配色
  const getCallBadgeStyle = (code?: string, desc?: string) => {
    const c = (code || '').toUpperCase();
    const d = (desc || '').toLowerCase();

    if (c === 'B' || d.includes('ball')) {
      return {
        container: 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-500/70',
        dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        accentText: 'text-emerald-300',
      };
    }
    if (c === 'C' || d.includes('called strike')) {
      return {
        container: 'bg-rose-950/40 border-rose-500/40 hover:border-rose-500/70',
        dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        accentText: 'text-rose-300',
      };
    }
    if (c === 'S' || c === 'W' || d.includes('swinging')) {
      return {
        container: 'bg-purple-950/40 border-purple-500/40 hover:border-purple-500/70',
        dot: 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.9)]',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        accentText: 'text-purple-300',
      };
    }
    if (c === 'F' || c === 'T' || d.includes('foul')) {
      return {
        container: 'bg-amber-950/40 border-amber-500/40 hover:border-amber-500/70',
        dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        accentText: 'text-amber-300',
      };
    }
    if (c === 'X' || c === 'D' || c === 'E' || d.includes('in play')) {
      return {
        container: 'bg-blue-950/40 border-blue-500/40 hover:border-blue-500/70',
        dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.9)]',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        accentText: 'text-blue-300',
      };
    }

    return {
      container: 'bg-slate-900/60 border-slate-700/60',
      dot: 'bg-slate-400',
      badge: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
      accentText: 'text-slate-300',
    };
  };

  return (
    <div className={`w-full glass-panel rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 shadow-lg ${className}`}>
      {/* ヘッダー & アコーディオン切り替えボタン */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-dodger-light animate-pulse" />
          <span className="font-bold tracking-wide text-slate-100">
            配球シーケンス
          </span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full">
            この打席: <strong className="text-amber-400">{totalPitches}</strong> 球
          </span>
        </div>

        {totalPitches > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors border border-slate-700"
          >
            {isExpanded ? (
              <>
                <span>最新4球のみ表示</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              </>
            ) : (
              <>
                <span>全{totalPitches}球を表示</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </>
            )}
          </button>
        )}
      </div>

      {/* 投球カード（4球対応の均等グリッド: 1列 / 2列 / 4列） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
        {displayedPitches.map((pitch, idx) => {
          const originalIndex = showAll ? idx : totalPitches - 4 + idx;
          const pitchNumber = pitch.pitchNumber || originalIndex + 1;
          const isLatest = originalIndex === totalPitches - 1;

          const pitchTypeJa = getPitchTypeJapanese(
            pitch.details.type?.code,
            pitch.details.type?.description
          );
          const callInfo = getPitchCallJapanese(
            pitch.details.call?.code,
            pitch.details.call?.description
          );

          const speedMph = pitch.pitchData?.startSpeed;
          const speedKmh = speedMph ? mphToKmh(speedMph) : null;
          const styles = getCallBadgeStyle(
            pitch.details.call?.code,
            pitch.details.call?.description
          );

          return (
            <div
              key={`pill-${pitchNumber}`}
              className={`p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 sm:gap-2 text-xs transition-all shadow-sm ${styles.container}`}
            >
              {/* 【上段】: 球番・球種 & 球速 (km/h) */}
              <div className="flex items-center justify-between gap-2">
                {/* 球番 + 球種 */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot} ${isLatest ? 'animate-pulse' : ''}`} />
                  <span className="font-mono font-black text-slate-200 text-xs flex-shrink-0 whitespace-nowrap">
                    第{pitchNumber}球:
                  </span>
                  <span className="font-bold text-slate-100 truncate text-xs">
                    {pitchTypeJa}
                  </span>
                </div>

                {/* 球速 km/h */}
                {speedKmh ? (
                  <div className="flex-shrink-0 font-mono font-extrabold text-amber-300 text-xs whitespace-nowrap">
                    {speedKmh} <span className="text-[10px] font-sans font-normal text-slate-300">km/h</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">-</span>
                )}
              </div>

              {/* 【下段】: 判定結果タグ & mph & 最新バッジ */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                {/* 判定ラベル */}
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles.badge} truncate max-w-[170px]`}>
                  {callInfo.label}
                </span>

                {/* mph & 最新タグ */}
                <div className="flex items-center gap-1.5 flex-shrink-0 text-right font-mono">
                  {speedMph && (
                    <span className="text-[10px] text-slate-400">
                      ({speedMph}mph)
                    </span>
                  )}

                  {isLatest && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold font-sans animate-pulse whitespace-nowrap">
                      最新
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
