import React from 'react';
import type { ScheduleGame } from '../types/mlb';
import { DEMO_GAMES } from '../constants/demoGames';
import { getTeamMeta } from '../constants/teams';
import { getGameJstTimeString, getJstTodayDateString, shiftJstDateString } from '../utils/date';
import { Calendar, Trophy, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface GameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: ScheduleGame[];
  currentGamePk?: number;
  onSelectGame: (gamePk: number, dateStr?: string) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  isOpen,
  onClose,
  games,
  currentGamePk,
  onSelectGame,
  currentDate,
  onDateChange,
}) => {
  // 今日の日本時間日付文字列 (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    return getJstTodayDateString();
  }, []);

  // 日付の前後シフト処理（日本時間基準）
  const shiftDate = (days: number) => {
    onDateChange(shiftJstDateString(currentDate, days));
  };

  // 直近の日付ピル生成（日本時間の今日を基準にした前後4日間）
  const quickDates = React.useMemo(() => {
    const daysJa = ['日', '月', '火', '水', '木', '金', '土'];
    const result = [];

    for (let offset = -4; offset <= 3; offset++) {
      const dateStr = shiftJstDateString(todayStr, offset);
      const [, month, day] = dateStr.split('-');
      const d = new Date(dateStr + 'T00:00:00+09:00');
      const dayOfWeek = daysJa[d.getDay()];

      result.push({
        dateStr,
        displayDate: `${Number(month)}/${Number(day)}`,
        dayOfWeek,
        isToday: dateStr === todayStr,
      });
    }
    return result;
  }, [todayStr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-dodger-light" />
            <h2 className="text-base font-bold text-white">
              試合切り替え & ハイライト名勝負
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 日付クイック切り替えナビゲーションバー */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-2.5">
          {/* 上段: ◀ 前日 / カレンダー直接指定 / 翌日 ▶ */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => shiftDate(-1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/60 transition-colors shadow-sm"
              title="前日へ移動"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>前日</span>
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center max-w-[220px]">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white text-center font-mono focus:outline-none focus:border-dodger-light shadow-inner"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/60 transition-colors shadow-sm"
              title="翌日へ移動"
            >
              <span>翌日</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 下段: 直近の日付ピルバー (横スクロール可能) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {quickDates.map((item) => {
              const isSelected = item.dateStr === currentDate;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => onDateChange(item.dateStr)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-dodger-blue text-white border-blue-400 shadow-md font-bold ring-1 ring-blue-400/40'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono">{item.displayDate}</span>
                  <span className="text-[10px] opacity-75">({item.dayOfWeek})</span>
                  {item.isToday && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      今日
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* ① 伝説の名勝負デモ（オフシーズン・即時体感用） */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>厳選！伝説の名勝負ハイライト（即座に体験可能）</span>
            </div>

            <div className="space-y-2">
              {DEMO_GAMES.map((demo) => {
                const isSelected = demo.gamePk === currentGamePk;
                return (
                  <button
                    key={demo.gamePk}
                    onClick={() => {
                      onSelectGame(demo.gamePk, demo.date);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {demo.date}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            おすすめ
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {demo.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-mono mt-0.5">
                          {demo.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-2" />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {demo.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ② 選択された日付の試合一覧 */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{currentDate} の全試合 (日本時間 {games.length} 試合)</span>
            </div>

            {games.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                この日付（日本時間）の試合データはありません（上の「伝説の名勝負」をお試しください）
              </div>
            ) : (
              <div className="space-y-1.5">
                {games.map((g) => {
                  const awayMeta = getTeamMeta(g.teams.away.team.id, g.teams.away.team.name);
                  const homeMeta = getTeamMeta(g.teams.home.team.id, g.teams.home.team.name);
                  const isSelected = g.gamePk === currentGamePk;
                  const jstTime = getGameJstTimeString(g.gameDate);

                  return (
                    <button
                      key={g.gamePk}
                      onClick={() => {
                        onSelectGame(g.gamePk, currentDate);
                        onClose();
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-blue-900/40 border-dodger-light shadow-md'
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={awayMeta.logo}
                            alt={awayMeta.name}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="text-xs font-bold text-slate-200">
                            {awayMeta.abbreviation}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400 ml-1">
                            {g.teams.away.score ?? '-'}
                          </span>
                        </div>

                        <span className="text-xs text-slate-600">vs</span>

                        <div className="flex items-center gap-1.5">
                          <img
                            src={homeMeta.logo}
                            alt={homeMeta.name}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="text-xs font-bold text-slate-200">
                            {homeMeta.abbreviation}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400 ml-1">
                            {g.teams.home.score ?? '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          {jstTime}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            g.status.abstractGameState === 'Live'
                              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {g.status.detailedState}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
