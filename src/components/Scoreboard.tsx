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
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state === 'Live' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          ) : state === 'Final' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
              <Trophy className="w-3 h-3 text-amber-400" />
              試合終了 ({detailedState || 'Final'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-900/40 text-sky-300 border border-sky-600/30">
              <Clock className="w-3 h-3" />
              試合前 ({detailedState || '予定'})
            </span>
          )}

          {/* 試合日時の簡易表示 */}
          {formattedGameTime && state === 'Preview' && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedGameTime} 開始予定
            </span>
          )}
        </div>

        {/* イニング表示 */}
        {state === 'Live' && (
          <div className="flex items-center gap-1 text-sm font-bold text-amber-400 bg-amber-950/40 px-3 py-0.5 rounded-full border border-amber-500/30">
            <span>{isTopInning ? '▲' : '▼'}</span>
            <span>
              {currentInning}回 {inningHalfJa}
            </span>
          </div>
        )}
      </div>

      {/* メインスコアエリア */}
      <div className="p-4 grid grid-cols-7 items-center gap-2">
        {/* ビジターチーム */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-lg group hover:scale-105 transition-transform">
            {awayMeta?.logo ? (
              <img
                src={awayMeta.logo}
                alt={awayMeta.name}
                className="w-full h-full object-contain filter drop-shadow"
                loading="eager"
              />
            ) : (
              <div className="text-sm font-bold">{awayTeam?.name.substring(0, 3)}</div>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">VISITOR</span>
          <span className="text-base sm:text-lg font-black text-slate-100 tracking-tight leading-tight">
            {awayMeta?.jpName || awayTeam?.name}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {awayMeta?.abbreviation}
          </span>
        </div>

        {/* スコア数字表示 */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-mono tracking-tighter">
            <span
              className={`transition-all ${
                awayScore > homeScore ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-100'
              }`}
            >
              {state === 'Preview' ? '-' : awayScore}
            </span>
            <span className="text-slate-600 text-2xl font-light">-</span>
            <span
              className={`transition-all ${
                homeScore > awayScore ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-100'
              }`}
            >
              {state === 'Preview' ? '-' : homeScore}
            </span>
          </div>

          {/* ヒット・エラーまとめ */}
          {state !== 'Preview' && (
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
              <span>H: {awayHits}-{homeHits}</span>
              <span>•</span>
              <span>E: {awayErrors}-{homeErrors}</span>
            </div>
          )}
        </div>

        {/* ホームチーム */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-lg group hover:scale-105 transition-transform">
            {homeMeta?.logo ? (
              <img
                src={homeMeta.logo}
                alt={homeMeta.name}
                className="w-full h-full object-contain filter drop-shadow"
                loading="eager"
              />
            ) : (
              <div className="text-sm font-bold">{homeTeam?.name.substring(0, 3)}</div>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">HOME</span>
          <span className="text-base sm:text-lg font-black text-slate-100 tracking-tight leading-tight">
            {homeMeta?.jpName || homeTeam?.name}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {homeMeta?.abbreviation}
          </span>
        </div>
      </div>

      {/* 予告先発投手（試合前 Preview 時） */}
      {state === 'Preview' && probablePitchers && (
        <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-around text-xs">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">先発予定</span>
            <span className="text-slate-200 font-semibold">
              {probablePitchers.away?.fullName
                ? getPlayerDisplayName(probablePitchers.away.fullName)
                : '未定'}
            </span>
          </div>
          <div className="text-slate-600 font-bold">VS</div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">先発予定</span>
            <span className="text-slate-200 font-semibold">
              {probablePitchers.home?.fullName
                ? getPlayerDisplayName(probablePitchers.home.fullName)
                : '未定'}
            </span>
          </div>
        </div>
      )}

      {/* 勝敗/セーブ投手（試合終了 Final 時） */}
      {state === 'Final' && decisions && (
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs">
          {decisions.winner && (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">
                勝
              </span>
              <span className="text-slate-200">
                {getPlayerDisplayName(decisions.winner.fullName)}
              </span>
            </div>
          )}
          {decisions.loser && (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 font-bold text-[10px]">
                負
              </span>
              <span className="text-slate-200">
                {getPlayerDisplayName(decisions.loser.fullName)}
              </span>
            </div>
          )}
          {decisions.save && (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 font-bold text-[10px]">
                S
              </span>
              <span className="text-slate-200">
                {getPlayerDisplayName(decisions.save.fullName)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* イニング別スコアテーブル（ラインスコア） */}
      {linescore?.innings && linescore.innings.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-950/60 px-3 py-2 overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="text-slate-500 text-[10px] border-b border-slate-800">
                <th className="py-1 px-1.5 text-left font-sans w-14">TEAM</th>
                {linescore.innings.map((inn) => (
                  <th key={inn.num} className="py-1 px-1 min-w-[20px]">
                    {inn.num}
                  </th>
                ))}
                <th className="py-1 px-1 font-bold text-slate-300 min-w-[24px]">R</th>
                <th className="py-1 px-1 font-bold text-slate-300 min-w-[24px]">H</th>
                <th className="py-1 px-1 font-bold text-slate-300 min-w-[24px]">E</th>
              </tr>
            </thead>
            <tbody>
              {/* ビジター行 */}
              <tr className="border-b border-slate-800/50 text-slate-300">
                <td className="py-1 px-1.5 text-left font-bold font-sans text-slate-200 truncate">
                  {awayMeta?.abbreviation || 'AWAY'}
                </td>
                {linescore.innings.map((inn) => (
                  <td key={`away-${inn.num}`} className="py-1 px-1">
                    {inn.away?.runs !== undefined ? inn.away.runs : '-'}
                  </td>
                ))}
                <td className="py-1 px-1 font-bold text-amber-400 bg-amber-950/20">{awayScore}</td>
                <td className="py-1 px-1 text-slate-400">{awayHits}</td>
                <td className="py-1 px-1 text-slate-400">{awayErrors}</td>
              </tr>
              {/* ホーム行 */}
              <tr className="text-slate-300">
                <td className="py-1 px-1.5 text-left font-bold font-sans text-slate-200 truncate">
                  {homeMeta?.abbreviation || 'HOME'}
                </td>
                {linescore.innings.map((inn) => (
                  <td key={`home-${inn.num}`} className="py-1 px-1">
                    {inn.home?.runs !== undefined ? inn.home.runs : '-'}
                  </td>
                ))}
                <td className="py-1 px-1 font-bold text-amber-400 bg-amber-950/20">{homeScore}</td>
                <td className="py-1 px-1 text-slate-400">{homeHits}</td>
                <td className="py-1 px-1 text-slate-400">{homeErrors}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
