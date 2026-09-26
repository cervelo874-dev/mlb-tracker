import React from 'react';
import type { PlayerBasic } from '../types/mlb';
import { getPlayerDisplayName } from '../utils/translator';
import { Shield, Target, Activity } from 'lucide-react';

interface MatchupCardProps {
  pitcher?: PlayerBasic;
  batter?: PlayerBasic;
  onDeck?: PlayerBasic;
  players?: Record<string, any>;
  boxscore?: {
    teams?: {
      away?: { players?: Record<string, any> };
      home?: { players?: Record<string, any> };
    };
  };
}

export const MatchupCard: React.FC<MatchupCardProps> = ({
  pitcher,
  batter,
  onDeck,
  players,
  boxscore,
}) => {
  const pitcherId = pitcher?.id;
  const batterId = batter?.id;

  const pitcherKey = pitcherId ? `ID${pitcherId}` : null;
  const batterKey = batterId ? `ID${batterId}` : null;

  // boxscore から詳細スタッツを取得
  const awayPlayers = boxscore?.teams?.away?.players;
  const homePlayers = boxscore?.teams?.home?.players;

  const pitcherBox = pitcherKey
    ? awayPlayers?.[pitcherKey] || homePlayers?.[pitcherKey]
    : null;
  const batterBox = batterKey
    ? awayPlayers?.[batterKey] || homePlayers?.[batterKey]
    : null;

  const pitcherData = pitcherKey ? players?.[pitcherKey] : null;
  const batterData = batterKey ? players?.[batterKey] : null;

  // 投手スタッツの抽出
  const pPitching = pitcherBox?.stats?.pitching;
  const pSeason = pitcherBox?.seasonStats?.pitching || pitcherData?.stats?.pitching;
  const pPitches = pPitching?.numberOfPitches ?? pPitching?.pitchesThrown;
  const pStrikes = pPitching?.strikes;
  const pStrikeouts = pPitching?.strikeOuts;
  const pRuns = pPitching?.runs ?? pPitching?.earnedRuns;
  const pEra = pSeason?.era ?? pitcherData?.stats?.pitching?.era ?? '-.--';
  const pWins = pSeason?.wins;
  const pLosses = pSeason?.losses;

  // 打者スタッツの抽出
  const bBatting = batterBox?.stats?.batting;
  const bSeason = batterBox?.seasonStats?.batting || batterData?.stats?.batting;
  const bAtBats = bBatting?.atBats;
  const bHits = bBatting?.hits;
  const bHR = bBatting?.homeRuns;
  const bRBI = bBatting?.rbi;
  const bAvg = bSeason?.avg ? `.${Math.round(parseFloat(bSeason.avg) * 1000)}` : (batterData?.stats?.batting?.avg ? `.${Math.round(batterData.stats.batting.avg * 1000)}` : '-');
  const bOps = bSeason?.ops ?? '-';
  const bSeasonHR = bSeason?.homeRuns;

  return (
    <div className="w-full h-full glass-panel rounded-2xl p-3.5 border border-slate-700/60 shadow-lg flex flex-col justify-between">
      {/* 上部ヘッダー（フィールド状況カードと対称） */}
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-dodger-light" />
          対決 (MATCHUP)
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          リアルタイム打席
        </span>
      </div>

      {/* 投手 vs 打者 メイン対決エリア */}
      <div className="grid grid-cols-2 gap-3 divide-x divide-slate-800/80 my-auto">
        {/* 投手エリア */}
        <div className="flex flex-col gap-2 pr-1">
          {/* 投手アイコン & 氏名 */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex-shrink-0 shadow">
              {pitcherId ? (
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_120,q_auto:best/v1/people/${pitcherId}/headshot/67/current`}
                  alt={pitcher?.fullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500 text-xs">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-1 py-0.2 rounded border border-rose-800/40">
                  P 投手
                </span>
                {pitcherData?.pitchHand?.code && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({pitcherData.pitchHand.code === 'R' ? '右' : '左'})
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {pitcher?.fullName ? getPlayerDisplayName(pitcher.fullName) : '投手未定'}
              </div>
            </div>
          </div>

          {/* 投手スタッツボックス */}
          <div className="space-y-1 bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 text-[10px] font-mono">
            {/* 今日 */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500 font-sans">今日:</span>
              <span className="font-bold text-amber-300">
                {pPitches !== undefined ? `${pPitches}球` : '-'}
                {pStrikes !== undefined ? ` (${pStrikes}S)` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500 font-sans">奪三振/失点:</span>
              <span>
                <strong className="text-slate-200">{pStrikeouts ?? 0}</strong> K / <strong className="text-rose-400">{pRuns ?? 0}</strong> 失
              </span>
            </div>
            {/* 今季 */}
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-slate-500 font-sans">今季防御率:</span>
              <span className="font-bold text-slate-200">{pEra}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500 font-sans">今季勝敗:</span>
              <span className="font-bold text-slate-200">
                {pWins !== undefined && pLosses !== undefined ? `${pWins}勝 ${pLosses}敗` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 打者エリア */}
        <div className="flex flex-col gap-2 pl-2">
          {/* 打者アイコン & 氏名 */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-amber-600/50 flex-shrink-0 shadow">
              {batterId ? (
                <img
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_120,q_auto:best/v1/people/${batterId}/headshot/67/current`}
                  alt={batter?.fullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500 text-xs">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/40">
                  B 打者
                </span>
                {batterData?.batSide?.code && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({batterData.batSide.code === 'R' ? '右' : batterData.batSide.code === 'L' ? '左' : '両'})
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {batter?.fullName ? getPlayerDisplayName(batter.fullName) : '打者'}
              </div>
            </div>
          </div>

          {/* 打者スタッツボックス（OPSと本塁打を個別行に分離） */}
          <div className="space-y-1 bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 text-[10px] font-mono">
            {/* 今日 */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500 font-sans">今日:</span>
              <span className="font-bold text-amber-300 truncate max-w-[110px]">
                {bAtBats !== undefined && bHits !== undefined
                  ? `${bAtBats}打数${bHits}安打${bHR ? ` ${bHR}HR` : ''}${bRBI ? ` ${bRBI}点` : ''}`
                  : bBatting?.summary || '打席中'}
              </span>
            </div>
            {/* 今季打率 */}
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500 font-sans">今季打率:</span>
              <span className="font-bold text-slate-200">{bAvg}</span>
            </div>
            {/* 今季OPS */}
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-slate-500 font-sans">今季OPS:</span>
              <span className="font-bold text-slate-200">{bOps}</span>
            </div>
            {/* 今季本塁打 */}
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500 font-sans">今季本塁打:</span>
              <span className="font-bold text-slate-200">
                {bSeasonHR !== undefined ? `${bSeasonHR}本` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ネクストバッターズサークル（On Deck） */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          次打者 (On-Deck):
        </span>
        <span className="text-slate-300 font-medium truncate max-w-[160px]">
          {onDeck?.fullName ? getPlayerDisplayName(onDeck.fullName) : '未定'}
        </span>
      </div>
    </div>
  );
};
