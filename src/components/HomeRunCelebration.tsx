import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { triggerVibration, VIBRATION_PATTERNS } from '../utils/vibrate';
import { getPlayerDisplayName, mphToKmh, feetToMeters } from '../utils/translator';
import { Trophy, X } from 'lucide-react';

export interface HomeRunDetails {
  batterName: string;
  distance?: number;
  launchSpeed?: number;
  description?: string;
  rbi?: number;
}

interface HomeRunCelebrationProps {
  details: HomeRunDetails | null;
  onClose: () => void;
}

export const HomeRunCelebration: React.FC<HomeRunCelebrationProps> = ({ details, onClose }) => {
  useEffect(() => {
    if (!details) return;

    // 1. スマホ触覚フィードバック (要件: navigator.vibrate([100, 50, 100, 50, 200]))
    triggerVibration(VIBRATION_PATTERNS.homerun);

    // 2. 全画面 Confetti (紙吹雪) 演出
    // 最初の爆発
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#005A9C', '#EF3E42', '#fbbf24', '#ffffff', '#38bdf8'],
    });

    // 左右からのキャノン放射
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#f43f5e'],
      });
    }, 350);

    // 3秒後に自動クローズ
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [details, onClose]);

  if (!details) return null;

  const batterJp = getPlayerDisplayName(details.batterName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* ホームラン特大バナー */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/80 rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.6)] text-center animate-shake overflow-hidden">
        {/* 背景の光線エフェクト */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />

        {/* トロフィーアイコン */}
        <div className="inline-flex p-3 rounded-full bg-amber-500/20 border border-amber-400/50 mb-3 text-amber-300 animate-bounce">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* 特大ゴールドネオン HOMERUN! */}
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-[0_5px_15px_rgba(245,158,11,0.8)] animate-pulse">
          HOMERUN!
        </h1>
        <p className="text-xs font-bold tracking-widest text-amber-300 uppercase mt-1">
          本 塁 打 ！
        </p>

        {/* 打者名 */}
        <div className="my-4 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40">
          <div className="text-xs text-slate-400">BATTER</div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {batterJp}
          </div>
          {details.description && (
            <div className="text-xs text-amber-200/90 mt-1 line-clamp-2">
              {details.description}
            </div>
          )}
        </div>

        {/* Statcast 弾道データ */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-left">
          {details.launchSpeed && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">打球初速</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-400">
                {details.launchSpeed} mph
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                ({mphToKmh(details.launchSpeed)} km/h)
              </span>
            </div>
          )}

          {details.distance && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">推定飛距離</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-400">
                {details.distance} ft
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                ({feetToMeters(details.distance)} m)
              </span>
            </div>
          )}
        </div>

        {/* タップして閉じるガイド */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-amber-500/40 active:scale-95"
        >
          最高！ (閉じる)
        </button>
      </div>
    </div>
  );
};
