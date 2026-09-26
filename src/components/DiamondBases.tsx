import React from 'react';
import type { LinescoreOffense } from '../types/mlb';
import { getPlayerDisplayName } from '../utils/translator';
import { AlertCircle, Flame } from 'lucide-react';

interface DiamondBasesProps {
  offense?: LinescoreOffense;
  className?: string;
}

export const DiamondBases: React.FC<DiamondBasesProps> = ({ offense, className = '' }) => {
  const runner1 = offense?.first;
  const runner2 = offense?.second;
  const runner3 = offense?.third;

  const has1st = !!runner1;
  const has2nd = !!runner2;
  const has3rd = !!runner3;

  // 得点圏 (Scoring Position): 走者が2塁または3塁にいる
  const isRISP = has2nd || has3rd;
  const isBasesLoaded = has1st && has2nd && has3rd;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* RISP / 満塁 アラートバッジ */}
      {isBasesLoaded ? (
        <div className="mb-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-extrabold tracking-wider shadow-md animate-pulse flex items-center gap-1">
          <Flame className="w-3 h-3 fill-current" />
          満塁 (BASES LOADED)
        </div>
      ) : isRISP ? (
        <div className="mb-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1 animate-pulse-fast">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          得点圏 (RISP)
        </div>
      ) : (
        <div className="h-5 mb-1.5" />
      )}

      {/* 野球場ダイヤモンドグラフィック (SVG) */}
      <div
        className={`relative w-28 h-28 p-2 rounded-2xl transition-all duration-500 flex items-center justify-center ${
          isRISP
            ? 'bg-amber-950/40 border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
            : 'bg-slate-950/70 border border-slate-800'
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-24 h-24 select-none">
          {/* フィールド内野グラウンド (薄い芝生調) */}
          <polygon
            points="50,15 85,50 50,85 15,50"
            fill="rgba(15, 23, 42, 0.6)"
            stroke={isRISP ? 'rgba(245, 158, 11, 0.4)' : '#334155'}
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* ピッチャーズマウンド */}
          <circle cx="50" cy="50" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <line x1="47" y1="50" x2="53" y2="50" stroke="#94a3b8" strokeWidth="1.5" />

          {/* ホームベース (下: 50, 85) */}
          <polygon
            points="50,89 44,83 44,80 56,80 56,83"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          {/* 1塁 (右: 85, 50) */}
          <g>
            {has1st && (
              <rect
                x="76"
                y="41"
                width="18"
                height="18"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                transform="rotate(45 85 50)"
                className="animate-ping"
                opacity="0.7"
              />
            )}
            <rect
              x="78"
              y="43"
              width="14"
              height="14"
              transform="rotate(45 85 50)"
              fill={has1st ? '#fbbf24' : '#1e293b'}
              stroke={has1st ? '#ffffff' : '#64748b'}
              strokeWidth={has1st ? '1.5' : '1'}
              className="transition-colors duration-300 shadow-md"
            />
          </g>

          {/* 2塁 (上: 50, 15) */}
          <g>
            {has2nd && (
              <rect
                x="41"
                y="6"
                width="18"
                height="18"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                transform="rotate(45 50 15)"
                className="animate-ping"
                opacity="0.7"
              />
            )}
            <rect
              x="43"
              y="8"
              width="14"
              height="14"
              transform="rotate(45 50 15)"
              fill={has2nd ? '#fbbf24' : '#1e293b'}
              stroke={has2nd ? '#ffffff' : '#64748b'}
              strokeWidth={has2nd ? '1.5' : '1'}
              className="transition-colors duration-300 shadow-md"
            />
          </g>

          {/* 3塁 (左: 15, 50) */}
          <g>
            {has3rd && (
              <rect
                x="6"
                y="41"
                width="18"
                height="18"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                transform="rotate(45 15 50)"
                className="animate-ping"
                opacity="0.7"
              />
            )}
            <rect
              x="8"
              y="43"
              width="14"
              height="14"
              transform="rotate(45 15 50)"
              fill={has3rd ? '#fbbf24' : '#1e293b'}
              stroke={has3rd ? '#ffffff' : '#64748b'}
              strokeWidth={has3rd ? '1.5' : '1'}
              className="transition-colors duration-300 shadow-md"
            />
          </g>
        </svg>
      </div>

      {/* 塁上の走者名リスト */}
      <div className="mt-2 w-full space-y-1">
        {has3rd && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/90 border border-amber-500/40 text-xs">
            <span className="w-4 h-4 rounded bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">
              3B
            </span>
            <span className="text-slate-100 font-bold truncate">
              {getPlayerDisplayName(runner3.fullName)}
            </span>
          </div>
        )}

        {has2nd && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/90 border border-amber-500/40 text-xs">
            <span className="w-4 h-4 rounded bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">
              2B
            </span>
            <span className="text-slate-100 font-bold truncate">
              {getPlayerDisplayName(runner2.fullName)}
            </span>
          </div>
        )}

        {has1st && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/90 border border-blue-500/40 text-xs">
            <span className="w-4 h-4 rounded bg-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-[10px]">
              1B
            </span>
            <span className="text-slate-100 font-bold truncate">
              {getPlayerDisplayName(runner1.fullName)}
            </span>
          </div>
        )}

        {!has1st && !has2nd && !has3rd && (
          <div className="text-[11px] text-slate-500 text-center py-0.5 font-medium">
            走者なし
          </div>
        )}
      </div>
    </div>
  );
};
