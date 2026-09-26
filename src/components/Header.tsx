import React from 'react';
import type { MLBTeamMeta } from '../constants/teams';
import { Heart, Calendar, RefreshCw, Sparkles, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  favoriteTeam: MLBTeamMeta;
  onOpenTeamModal: () => void;
  onOpenGameModal: () => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isFetching?: boolean;
  onTriggerTestHomeRun: () => void;
  onTriggerTestHardHit: () => void;
  homeRunCount?: number;
  hardHitCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  favoriteTeam,
  onOpenTeamModal,
  onOpenGameModal,
  currentDate,
  onDateChange,
  onRefresh,
  isFetching = false,
  onTriggerTestHomeRun,
  onTriggerTestHardHit,
  homeRunCount = 0,
  hardHitCount = 0,
}) => {
  // 日付の前後移動
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#002F6C]/95 backdrop-blur-md border-b border-blue-500/30 shadow-lg">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2">
        {/* 上段: アプリ名とお気に入り球団 */}
        <div className="flex items-center justify-between gap-2">
          {/* ロゴ & タイトル */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-dodger-blue border border-white/20 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm italic tracking-tighter">
                MLB
              </span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5 m-0 leading-tight">
                <span>MLB LIVE TRACKER</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-dodger-red font-bold text-white tracking-widest uppercase">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-blue-200 font-medium m-0">
                リアルタイム速報 & 配球トラッカー
              </p>
            </div>
          </div>

          {/* 右側: お気に入り球団ボタン & 更新 */}
          <div className="flex items-center gap-2">
            {/* お気に入り球団選択 */}
            <button
              onClick={onOpenTeamModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-blue-400/40 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
              title="お気に入り球団を変更"
            >
              <img
                src={favoriteTeam.logo}
                alt={favoriteTeam.shortName}
                className="w-4 h-4 object-contain"
              />
              <span className="hidden sm:inline">{favoriteTeam.jpName}</span>
              <span className="sm:hidden">{favoriteTeam.abbreviation}</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </button>

            {/* 更新ボタン */}
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-blue-400/30 text-blue-200 hover:text-white transition-all active:scale-95"
              title="手動更新"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? 'animate-spin text-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* 下段: 日付ナビゲーション & 試合選択 & 演出テストボタン */}
        <div className="mt-2 pt-2 border-t border-blue-800/40 flex flex-wrap items-center justify-between gap-2">
          {/* 日付ナビ */}
          <div className="flex items-center gap-1 bg-slate-950/60 rounded-xl p-0.5 border border-blue-900/60">
            <button
              onClick={handlePrevDay}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="前日"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenGameModal}
              className="px-2 py-0.5 text-xs font-mono font-bold text-amber-300 flex items-center gap-1 hover:text-amber-200"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDate}</span>
            </button>

            <button
              onClick={handleNextDay}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="翌日"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 試合選択 & テスト演出ツールバー */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenGameModal}
              className="px-2.5 py-1 rounded-xl bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-[11px] font-bold text-white flex items-center gap-1 transition-all"
            >
              <span>試合切替 / 名勝負</span>
            </button>

            {/* HR履歴 & 演出ボタン */}
            <button
              onClick={onTriggerTestHomeRun}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-[11px] font-extrabold text-amber-300 flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="この試合の本塁打履歴 & 演出再生"
            >
              <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
              <span>HR{homeRunCount > 0 ? ` (${homeRunCount})` : ''}</span>
            </button>

            {/* 100mph ハードヒット履歴 & 演出ボタン */}
            <button
              onClick={onTriggerTestHardHit}
              className="px-2.5 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/60 text-[11px] font-extrabold text-rose-300 flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="この試合の100mph超ハードヒット履歴 & 演出再生"
            >
              <Flame className="w-3 h-3 text-rose-400 fill-current" />
              <span>100mph{hardHitCount > 0 ? ` (${hardHitCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
