import React from 'react';

interface CountIndicatorProps {
  balls?: number;
  strikes?: number;
  outs?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CountIndicator: React.FC<CountIndicatorProps> = ({
  balls = 0,
  strikes = 0,
  outs = 0,
  size = 'md',
}) => {
  const dotSizeClass = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex flex-col gap-1.5 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/60 shadow-inner">
      {/* Balls (Max 3) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 w-3 tracking-wider">B</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((n) => {
            const active = balls >= n;
            return (
              <div
                key={`b-${n}`}
                className={`${dotSizeClass} rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] scale-105'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Strikes (Max 2) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 w-3 tracking-wider">S</span>
        <div className="flex items-center gap-1.5">
          {[1, 2].map((n) => {
            const active = strikes >= n;
            return (
              <div
                key={`s-${n}`}
                className={`${dotSizeClass} rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-105'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Outs (Max 2) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-400 w-3 tracking-wider">O</span>
        <div className="flex items-center gap-1.5">
          {[1, 2].map((n) => {
            const active = outs >= n;
            return (
              <div
                key={`o-${n}`}
                className={`${dotSizeClass} rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] scale-105'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
