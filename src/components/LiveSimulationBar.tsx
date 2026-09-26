import React from 'react';
import { SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface LiveSimulationBarProps {
  isSimulating: boolean;
  onToggleSimulate: () => void;
  currentIndex: number;
  totalPlays: number;
  onNextPlay: () => void;
  onPrevPlay: () => void;
  onReset: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export const LiveSimulationBar: React.FC<LiveSimulationBarProps> = ({
  isSimulating,
  onToggleSimulate,
  currentIndex,
  totalPlays,
  onNextPlay,
  onPrevPlay,
  onReset,
  autoPlay,
  onToggleAutoPlay,
}) => {
  if (!isSimulating) {
    return (
      <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          💡 過去の試合を1プレーずつリアルタイム再現したい場合:
        </span>
        <button
          onClick={onToggleSimulate}
          className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 font-bold text-[11px] transition-all"
        >
          ライブ再現シミュレーター起動
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/40 shadow-xl flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-extrabold text-[10px] tracking-wider animate-pulse">
          SIMULATOR
        </span>
        <span className="text-slate-300 font-mono">
          打席 {currentIndex + 1} / {totalPlays}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="最初から再生"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onPrevPlay}
          disabled={currentIndex <= 0}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[11px]"
          title="前の打席"
        >
          前へ
        </button>

        <button
          onClick={onToggleAutoPlay}
          className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
            autoPlay
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {autoPlay ? (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              自動進行中
            </>
          ) : (
            <>
              <FastForward className="w-3.5 h-3.5" />
              自動再生
            </>
          )}
        </button>

        <button
          onClick={onNextPlay}
          disabled={currentIndex >= totalPlays - 1}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
          title="次の打席へ進む"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSimulate}
          className="ml-2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px]"
        >
          終了
        </button>
      </div>
    </div>
  );
};
