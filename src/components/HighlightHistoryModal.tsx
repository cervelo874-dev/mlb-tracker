import React, { useState } from 'react';
import type { Play } from '../types/mlb';
import { mphToKmh, feetToMeters, translatePlay } from '../utils/translator';
import { Sparkles, Flame, X, Play as PlayIcon, Trophy, ChevronRight } from 'lucide-react';

interface HighlightHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'homerun' | 'hardhit';
  allPlays: Play[];
  onTriggerHomeRunPreview: (play?: Play) => void;
  onTriggerHardHitPreview: (speed?: number, play?: Play) => void;
}

export const HighlightHistoryModal: React.FC<HighlightHistoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'homerun',
  allPlays = [],
  onTriggerHomeRunPreview,
  onTriggerHardHitPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'homerun' | 'hardhit'>(initialTab);

  // モーダルが開かれた時にタブを更新
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ホームランプレイの抽出
  const homeRunPlays = allPlays.filter((play) => {
    const ev = (play.result?.event || '').toLowerCase();
    const evType = (play.result?.eventType || '').toLowerCase();
    const desc = (play.result?.description || '').toLowerCase();
    return ev.includes('home run') || evType.includes('home_run') || desc.includes('homers') || desc.includes('grand slam');
  });

  // 100mph超ハードヒットプレイの抽出
  const hardHitPlays = allPlays.filter((play) => {
    const hitEvent = play.playEvents?.find((e) => e.hitData?.launchSpeed);
    return hitEvent?.hitData?.launchSpeed && hitEvent.hitData.launchSpeed >= 100.0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              ハイライト演出 & 履歴
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/40 border-b border-slate-800/80 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('homerun')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'homerun'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>本塁打 (HR)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[11px] font-mono font-normal">
              {homeRunPlays.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hardhit')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'hardhit'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span>ハードヒット (100mph+)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[11px] font-mono font-normal">
              {hardHitPlays.length}
            </span>
          </button>
        </div>

        {/* リストエリア */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          {activeTab === 'homerun' && (
            <>
              {homeRunPlays.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400/80 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">
                      この試合で本塁打はまだありません
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      本塁打が発生するとここにリアルタイムで蓄積されます
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerHomeRunPreview();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md active:scale-95"
                  >
                    <PlayIcon className="w-3.5 h-3.5 fill-current" />
                    <span>デモHR演出を再生（大谷翔平50号）</span>
                  </button>
                </div>
              ) : (
                homeRunPlays.map((play, idx) => {
                  const hitEvent = play.playEvents?.find((e) => e.hitData);
                  const hitData = hitEvent?.hitData;
                  const speed = hitData?.launchSpeed;
                  const kmh = speed ? mphToKmh(speed) : null;
                  const distance = hitData?.totalDistance;
                  const meters = distance ? feetToMeters(distance) : null;
                  const inningText = `${play.about?.inning}回${
                    play.about?.halfInning === 'top' ? '表' : '裏'
                  }`;

                  return (
                    <div
                      key={`hr-${play.about?.atBatIndex ?? idx}`}
                      onClick={() => {
                        onClose();
                        onTriggerHomeRunPreview(play);
                      }}
                      className="group cursor-pointer rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-800/80 to-slate-900 border border-amber-500/40 hover:border-amber-400 p-3 sm:p-3.5 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[11px] shadow-sm">
                            HR
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {inningText}
                          </span>
                          <strong className="text-sm font-bold text-white truncate">
                            {play.matchup?.batter?.fullName || '打者'}
                          </strong>
                        </div>

                        {/* Statcast 飛距離 & 初速 */}
                        <div className="flex items-center gap-3 text-xs font-mono text-amber-300">
                          {distance && (
                            <span>
                              飛距離: <strong>{distance} ft</strong> ({meters} m)
                            </span>
                          )}
                          {speed && (
                            <span>
                              初速: <strong>{speed} mph</strong> ({kmh} km/h)
                            </span>
                          )}
                        </div>

                        {/* 実況サマリー */}
                        {play.result?.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {play.result.description}
                          </p>
                        )}
                      </div>

                      {/* 再生アイコン */}
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 font-bold text-xs transition-colors flex-shrink-0">
                        <span>再生</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'hardhit' && (
            <>
              {hardHitPlays.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400/80 flex items-center justify-center mx-auto">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">
                      この試合で100mph超の打球はまだありません
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statcast計測で100mph以上の打球がここに蓄積されます
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerHardHitPreview(113.6);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all shadow-md active:scale-95"
                  >
                    <PlayIcon className="w-3.5 h-3.5 fill-current" />
                    <span>デモ演出を再生（113.6 mph）</span>
                  </button>
                </div>
              ) : (
                hardHitPlays.map((play, idx) => {
                  const hitEvent = play.playEvents?.find((e) => e.hitData?.launchSpeed);
                  const hitData = hitEvent?.hitData;
                  const speed = hitData?.launchSpeed || 100;
                  const kmh = mphToKmh(speed);
                  const inningText = `${play.about?.inning}回${
                    play.about?.halfInning === 'top' ? '表' : '裏'
                  }`;
                  const translated = translatePlay(play.result?.event, play.result?.description, play.matchup?.batter?.fullName, hitData);

                  return (
                    <div
                      key={`hh-${play.about?.atBatIndex ?? idx}`}
                      onClick={() => {
                        onClose();
                        onTriggerHardHitPreview(speed, play);
                      }}
                      className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 p-3 sm:p-3.5 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black text-[11px] shadow-sm flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-current" />
                            {speed} mph
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {inningText}
                          </span>
                          <strong className="text-sm font-bold text-white truncate">
                            {play.matchup?.batter?.fullName || '打者'}
                          </strong>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${translated.badgeColor}`}>
                            {translated.badge}
                          </span>
                        </div>

                        {/* 詳細データ */}
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>時速: <strong className="text-slate-200">{kmh} km/h</strong></span>
                          {hitData?.launchAngle !== undefined && (
                            <span>角度: <strong className="text-slate-200">{hitData.launchAngle}°</strong></span>
                          )}
                          {hitData?.totalDistance && (
                            <span>飛距離: <strong className="text-slate-200">{hitData.totalDistance} ft</strong></span>
                          )}
                        </div>

                        {/* 実況 */}
                        <p className="text-[11px] text-slate-300 truncate">
                          {translated.japaneseSummary}
                        </p>
                      </div>

                      {/* 再生アイコン */}
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-rose-600 text-slate-300 group-hover:text-white font-bold text-xs transition-colors flex-shrink-0">
                        <span>演出</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
