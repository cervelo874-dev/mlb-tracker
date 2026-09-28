import React from 'react';
import type { GameStatus, Linescore, Team } from '../types/mlb';
import { getTeamMeta } from '../constants/teams';
import { getPlayerDisplayName } from '../utils/translator';
import { Clock, Trophy, Calendar } from 'lucide-react';

interface ScoreboardProps {
  gameStatus?: GameStatus;
  linescore?: Linescore;
  awayTeam?: Team;
  homeTeam?: Team;
  gameDate?: string;
  probablePitchers?: {
    away?: { fullName: string };
    home?: { fullName: string };
  };
  decisions?: {
    winner?: { fullName: string };
    loser?: { fullName: string };
    save?: { fullName: string };
  };
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  gameStatus,
  linescore,
  awayTeam,
  homeTeam,
  gameDate,
  probablePitchers,
  decisions,
}) => {
  const awayMeta = awayTeam ? getTeamMeta(awayTeam.id, awayTeam.name) : null;
  const homeMeta = homeTeam ? getTeamMeta(homeTeam.id, homeTeam.name) : null;

  const awayScore = linescore?.teams?.away?.runs ?? 0;
  const homeScore = linescore?.teams?.home?.runs ?? 0;
  const awayHits = linescore?.teams?.away?.hits ?? 0;
  const homeHits = linescore?.teams?.home?.hits ?? 0;
  const awayErrors = linescore?.teams?.away?.errors ?? 0;
  const homeErrors = linescore?.teams?.home?.errors ?? 0;

  const state = gameStatus?.abstractGameState || 'Preview';
  const detailedState = gameStatus?.detailedState || '';

  const currentInning = linescore?.currentInning || 1;
  const isTopInning = linescore?.isTopInning ?? true;
  const inningHalf = linescore?.inningHalf || (isTopInning ? 'Top' : 'Bottom');
  const inningHalfJa = inningHalf === 'Top' ? '表' : '裏';

  // 試合日時のフォーマット
  const formattedGameTime = React.useMemo(() => {
    if (!gameDate) return '';
    try {
      const d = new Date(gameDate);
      return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [gameDate]);

  return (
    <div className="w-full rounded-2xl glass-panel-glow overflow-hidden shadow-2xl border border-slate-700/80">
      {/* 上部ヘッダーバー: 試合ステータスとイニング */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state === 'Live' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-rose-600/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          ) : state === 'Final' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-slate-700/60 text-slate-200 border border-slate-600/50">
              <Trophy className="w-4 h-4 text-amber-400" />
              試合終了 ({detailedState || 'Final'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-sky-900/50 text-sky-200 border border-sky-600/40">
              <Clock className="w-4 h-4 text-sky-300" />
              試合前 ({detailedState || '予定'})
            </span>
          )}

          {/* 試合日時の簡易表示 */}
          {formattedGameTime && state === 'Preview' && (
            <span className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedGameTime} 開始予定
            </span>
          )}
        </div>

        {/* イニング表示 */}
        {state === 'Live' && (
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-black text-amber-400 bg-amber-950/50 px-3.5 py-1 rounded-full border border-amber-500/40 shadow-sm">
            <span>{isTopInning ? '▲' : '▼'}</span>
            <span>
              {currentInning}回 {inningHalfJa}
            </span>
          </div>
        )}
      </div>

      {/* メインスコアエリア */}
      <div className="p-3 sm:p-5 grid grid-cols-7 items-center gap-2">
        {/* ビジターチーム */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 mb-1.5 sm:mb-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-lg group hover:scale-105 transition-transform">
            {awayMeta?.logo ? (
              <img
                src={awayMeta.logo}
                alt={awayMeta.name}
                className="w-full h-full object-contain filter drop-shadow"
                loading="eager"
              />
            ) : (
              <div className="text-base font-bold">{awayTeam?.name.substring(0, 3)}</div>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">VISITOR</span>
          <span className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-tight mt-0.5">
            {awayMeta?.jpName || awayTeam?.name}
          </span>
          <span className="text-xs text-slate-400 font-mono font-bold mt-0.5">
            {awayMeta?.abbreviation}
          </span>
        </div>

        {/* スコア数字表示 */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2 text-4xl sm:text-5xl font-black font-mono tracking-tighter">
            <span
              className={`transition-all ${
                awayScore > homeScore ? 'text-amber-400 font-black scale-105' : 'text-slate-100'
              }`}
            >
              {state === 'Preview' ? '-' : awayScore}
            </span>
            <span className="text-slate-600 text-3xl font-light">-</span>
            <span
              className={`transition-all ${
                homeScore > awayScore ? 'text-amber-400 font-black scale-105' : 'text-slate-100'
              }`}
            >
              {state === 'Preview' ? '-' : homeScore}
            </span>
          </div>

          {/* ヒット・エラーまとめ */}
          {state !== 'Preview' && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300 font-mono font-medium">
              <span>H: {awayHits}-{homeHits}</span>
              <span>•</span>
              <span>E: {awayErrors}-{homeErrors}</span>
            </div>
          )}
        </div>

        {/* ホームチーム */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 mb-1.5 sm:mb-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-lg group hover:scale-105 transition-transform">
            {homeMeta?.logo ? (
              <img
                src={homeMeta.logo}
                alt={homeMeta.name}
                className="w-full h-full object-contain filter drop-shadow"
                loading="eager"
              />
            ) : (
              <div className="text-base font-bold">{homeTeam?.name.substring(0, 3)}</div>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">HOME</span>
          <span className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-tight mt-0.5">
            {homeMeta?.jpName || homeTeam?.name}
          </span>
          <span className="text-xs text-slate-400 font-mono font-bold mt-0.5">
            {homeMeta?.abbreviation}
          </span>
        </div>
      </div>

      {/* 予告先発投手（試合前 Preview 時） */}
      {state === 'Preview' && probablePitchers && (
        <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-around text-sm">
          <div className="text-center">
            <span className="text-xs text-slate-400 block mb-0.5">先発予定</span>
            <span className="text-slate-100 font-bold text-sm">
              {probablePitchers.away?.fullName
                ? getPlayerDisplayName(probablePitchers.away.fullName)
                : '未定'}
            </span>
          </div>
          <div className="text-slate-500 font-extrabold text-sm">VS</div>
          <div className="text-center">
            <span className="text-xs text-slate-400 block mb-0.5">先発予定</span>
            <span className="text-slate-100 font-bold text-sm">
              {probablePitchers.home?.fullName
                ? getPlayerDisplayName(probablePitchers.home.fullName)
                : '未定'}
            </span>
          </div>
        </div>
      )}

      {/* 勝敗/セーブ投手（試合終了 Final 時） */}
      {state === 'Final' && decisions && (
        <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
          {decisions.winner && (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-black text-xs">
                勝
              </span>
              <span className="text-slate-100 font-medium">
                {getPlayerDisplayName(decisions.winner.fullName)}
              </span>
            </div>
          )}
          {decisions.loser && (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-black text-xs">
                負
              </span>
              <span className="text-slate-100 font-medium">
                {getPlayerDisplayName(decisions.loser.fullName)}
              </span>
            </div>
          )}
          {decisions.save && (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-black text-xs">
                S
              </span>
              <span className="text-slate-100 font-medium">
                {getPlayerDisplayName(decisions.save.fullName)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* イニング別スコアテーブル（ラインスコア） */}
      {linescore?.innings && linescore.innings.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-950/60 px-3 py-2.5 overflow-x-auto">
          <table className="w-full text-center text-xs sm:text-sm font-mono">
            <thead>
              <tr className="text-slate-400 text-xs border-b border-slate-800">
                <th className="py-1.5 px-2 text-left font-sans w-16">TEAM</th>
                {linescore.innings.map((inn) => (
                  <th key={inn.num} className="py-1.5 px-1.5 min-w-[22px] font-bold">
                    {inn.num}
                  </th>
                ))}
                <th className="py-1.5 px-2 font-black text-slate-200 min-w-[28px]">R</th>
                <th className="py-1.5 px-2 font-black text-slate-200 min-w-[28px]">H</th>
                <th className="py-1.5 px-2 font-black text-slate-200 min-w-[28px]">E</th>
              </tr>
            </thead>
            <tbody>
              {/* ビジター行 */}
              <tr className="border-b border-slate-800/50 text-slate-200">
                <td className="py-1.5 px-2 text-left font-bold font-sans text-slate-100 truncate text-xs sm:text-sm">
                  {awayMeta?.abbreviation || 'AWAY'}
                </td>
                {linescore.innings.map((inn) => (
                  <td key={`away-${inn.num}`} className="py-1.5 px-1.5 font-medium">
                    {inn.away?.runs !== undefined ? inn.away.runs : '-'}
                  </td>
                ))}
                <td className="py-1.5 px-2 font-black text-amber-400 bg-amber-950/20 text-sm sm:text-base">{awayScore}</td>
                <td className="py-1.5 px-2 text-slate-300 font-bold">{awayHits}</td>
                <td className="py-1.5 px-2 text-slate-400">{awayErrors}</td>
              </tr>
              {/* ホーム行 */}
              <tr className="text-slate-200">
                <td className="py-1.5 px-2 text-left font-bold font-sans text-slate-100 truncate text-xs sm:text-sm">
                  {homeMeta?.abbreviation || 'HOME'}
                </td>
                {linescore.innings.map((inn) => (
                  <td key={`home-${inn.num}`} className="py-1.5 px-1.5 font-medium">
                    {inn.home?.runs !== undefined ? inn.home.runs : '-'}
                  </td>
                ))}
                <td className="py-1.5 px-2 font-black text-amber-400 bg-amber-950/20 text-sm sm:text-base">{homeScore}</td>
                <td className="py-1.5 px-2 text-slate-300 font-bold">{homeHits}</td>
                <td className="py-1.5 px-2 text-slate-400">{homeErrors}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
