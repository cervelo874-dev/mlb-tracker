import React, { useEffect } from 'react';
import { triggerVibration, VIBRATION_PATTERNS } from '../utils/vibrate';
import { getPlayerDisplayName, mphToKmh } from '../utils/translator';
import { Flame, X } from 'lucide-react';

export interface HardHitAlertData {
  speed: number;
  batterName: string;
  angle?: number;
  distance?: number;
}

interface HardHitAlertProps {
  data: HardHitAlertData | null;
  onClose: () => void;
}

export const HardHitAlert: React.FC<HardHitAlertProps> = ({ data, onClose }) => {
  useEffect(() => {
    if (!data) return;

    // 触覚フィードバック
    triggerVibration(VIBRATION_PATTERNS.hardHit);

    // 4.5秒後に自動消去
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [data, onClose]);

  if (!data) return null;

  const kmh = mphToKmh(data.speed);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-bounce">
      <div className="relative rounded-2xl bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 p-3.5 shadow-[0_0_30px_rgba(239,68,68,0.7)] border-2 border-amber-300 text-white flex items-center justify-between overflow-hidden">
        {/* 光線背景 */}
        <div className="absolute inset-0 bg-white/10 animate-pulse" />

        <div className="relative z-10 flex items-center gap-3">
          {/* 燃える炎アイコン */}
          <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0 animate-pulse">
            <Flame className="w-6 h-6 fill-amber-400 stroke-amber-200" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full border border-white/30 text-amber-200">
                STATCAST ハードヒット
              </span>
            </div>
            <div className="text-xl font-black font-mono tracking-tight flex items-baseline gap-1 mt-0.5">
              <span>🔥 {data.speed} MPH</span>
              {kmh && (
                <span className="text-xs font-sans font-normal text-amber-100">
                  ({kmh} km/h)
                </span>
              )}
            </div>
            <div className="text-xs text-white/90 font-medium truncate max-w-[200px]">
              打者: {getPlayerDisplayName(data.batterName)}
            </div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="relative z-10 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
