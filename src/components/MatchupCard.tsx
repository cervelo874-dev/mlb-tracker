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
  probablePitchers?: {
    away?: PlayerBasic;
    home?: PlayerBasic;
  };
  isPreGame?: boolean;
}

export const MatchupCard: React.FC<MatchupCardProps> = ({
  pitcher,
  batter,
  onDeck,
  players,
  boxscore,
  probablePitchers,
  isPreGame = false,
}) => {
  // 試合前で実況バッテリーが未定の場合、予告先発投手同士のプレビュー対決を表示
  const showProbables = isPreGame && probablePitchers && (probablePitchers.away || probablePitchers.home);

  const activePitcher = showProbables ? probablePitchers.away : pitcher;
  const activeOpponent = showProbables ? probablePitchers.home : batter;

  const pitcherId = activePitcher?.id;
  const opponentId = activeOpponent?.id;

  const pitcherKey = pitcherId ? `ID${pitcherId}` : null;
  const opponentKey = opponentId ? `ID${opponentId}` : null;

  // boxscore から詳細スタッツを取得
  const awayPlayers = boxscore?.teams?.away?.players;
  const homePlayers = boxscore?.teams?.home?.players;

  const pitcherBox = pitcherKey
    ? awayPlayers?.[pitcherKey] || homePlayers?.[pitcherKey]
    : null;
  const opponentBox = opponentKey
    ? awayPlayers?.[opponentKey] || homePlayers?.[opponentKey]
    : null;

  const pitcherData = pitcherKey ? players?.[pitcherKey] : null;
  const opponentData = opponentKey ? players?.[opponentKey] : null;

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

  // 右側（打者 または 予告先発ホーム投手）のスタッツ抽出
  const oppPitchSeason = opponentBox?.seasonStats?.pitching || opponentData?.stats?.pitching;
  const oppPEra = oppPitchSeason?.era ?? opponentData?.stats?.pitching?.era ?? '-.--';
  const oppPWins = oppPitchSeason?.wins;
  const oppPLosses = oppPitchSeason?.losses;

  const bBatting = opponentBox?.stats?.batting;
  const bSeason = opponentBox?.seasonStats?.batting || opponentData?.stats?.batting;
  const bAtBats = bBatting?.atBats;
  const bHits = bBatting?.hits;
  const bHR = bBatting?.homeRuns;
  const bRBI = bBatting?.rbi;
  const bAvg = bSeason?.avg
    ? `.${Math.round(parseFloat(bSeason.avg) * 1000)}`
    : opponentData?.stats?.batting?.avg
    ? `.${Math.round(opponentData.stats.batting.avg * 1000)}`
    : '-';
  const bOps = bSeason?.ops ?? '-';
  const bSeasonHR = bSeason?.homeRuns;

  return (
    <div className="w-full h-full glass-panel rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 shadow-lg flex flex-col justify-between">
      {/* 上部ヘッダー（フィールド状況カードと対称） */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80">
        <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-dodger-light" />
          {showProbables ? '予告先発 (PROBABLE PITCHERS)' : '対決 (MATCHUP)'}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {showProbables ? '先発マッチアップ' : 'リアルタイム打席'}
        </span>
      </div>

      {/* 投手 vs 打者（または予告先発対決）メインエリア */}
      <div className="grid grid-cols-2 gap-3 divide-x divide-slate-800/80 my-auto">
        {/* 左側: 投手（または先攻予告先発） */}
        <div className="flex flex-col gap-2 pr-1">
          {/* アイコン & 氏名 */}
          <div className="flex items-center gap-2">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex-shrink-0 shadow">
              {pitcherId ? (
                <img
                  src={`https://midfield.mlbstatic.com/v1/people/${pitcherId}/spots/120`}
                  alt={activePitcher?.fullName}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback && pitcherId) {
                      img.dataset.fallback = 'true';
                      img.src = `https://img.mlbstatic.com/mlb-photos/image/upload/w_120,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${pitcherId}/headshot/silo/current.png`;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500 text-xs">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/70 px-1.5 py-0.5 rounded border border-rose-800/50">
                  {showProbables ? '先発(ビジター)' : 'P 投手'}
                </span>
                {pitcherData?.pitchHand?.code && (
                  <span className="text-xs text-slate-300 font-semibold">
                    ({pitcherData.pitchHand.code === 'R' ? '右' : '左'})
                  </span>
                )}
              </div>
              <div className="text-sm sm:text-base font-black text-slate-100 truncate mt-0.5">
                {activePitcher?.fullName ? getPlayerDisplayName(activePitcher.fullName) : '投手未定'}
              </div>
            </div>
          </div>

          {/* 投手スタッツボックス */}
          <div className="space-y-1 bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800/90 text-xs sm:text-[13px] font-mono">
            {/* 今日 */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-sans text-xs">今日:</span>
              <span className="font-extrabold text-amber-300">
                {pPitches !== undefined ? `${pPitches}球` : showProbables ? '登板前' : '-'}
                {pStrikes !== undefined ? ` (${pStrikes}S)` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-sans text-xs">奪三振/失点:</span>
              <span>
                <strong className="text-slate-100">{pStrikeouts ?? 0}</strong> K /{' '}
                <strong className="text-rose-400">{pRuns ?? 0}</strong> 失
              </span>
            </div>
            {/* 今季 */}
            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 font-sans text-xs">今季防御率:</span>
              <span className="font-bold text-slate-100">{pEra}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 font-sans text-xs">今季勝敗:</span>
              <span className="font-bold text-slate-100">
                {pWins !== undefined && pLosses !== undefined ? `${pWins}勝 ${pLosses}敗` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 右側: 打者 または 後攻予告先発投手 */}
        <div className="flex flex-col gap-2 pl-2">
          {/* アイコン & 氏名 */}
          <div className="flex items-center gap-2">
            <div
              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-800 border-2 ${
                showProbables ? 'border-sky-600/60' : 'border-amber-600/60'
              } flex-shrink-0 shadow`}
            >
              {opponentId ? (
                <img
                  src={`https://midfield.mlbstatic.com/v1/people/${opponentId}/spots/120`}
                  alt={activeOpponent?.fullName}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback && opponentId) {
                      img.dataset.fallback = 'true';
                      img.src = `https://img.mlbstatic.com/mlb-photos/image/upload/w_120,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${opponentId}/headshot/silo/current.png`;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500 text-xs">
                {showProbables ? <Shield className="w-5 h-5" /> : <Target className="w-5 h-5" />}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                    showProbables
                      ? 'text-sky-300 bg-sky-950/70 border-sky-800/50'
                      : 'text-amber-300 bg-amber-950/70 border-amber-800/50'
                  } px-1.5 py-0.5 rounded border`}
                >
                  {showProbables ? '先発(ホーム)' : 'B 打者'}
                </span>
                {showProbables ? (
                  opponentData?.pitchHand?.code && (
                    <span className="text-xs text-slate-300 font-semibold">
                      ({opponentData.pitchHand.code === 'R' ? '右' : '左'})
                    </span>
                  )
                ) : (
                  opponentData?.batSide?.code && (
                    <span className="text-xs text-slate-300 font-semibold">
                      ({opponentData.batSide.code === 'R' ? '右' : opponentData.batSide.code === 'L' ? '左' : '両'})
                    </span>
                  )
                )}
              </div>
              <div className="text-sm sm:text-base font-black text-slate-100 truncate mt-0.5">
                {activeOpponent?.fullName ? getPlayerDisplayName(activeOpponent.fullName) : showProbables ? '投手未定' : '打者'}
              </div>
            </div>
          </div>

          {/* 右側スタッツボックス */}
          {showProbables ? (
            /* 試合前の相手先発投手スタッツ */
            <div className="space-y-1 bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800/90 text-xs sm:text-[13px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今日:</span>
                <span className="font-extrabold text-amber-300">登板前</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今季登板数:</span>
                <span className="font-bold text-slate-100">
                  {oppPitchSeason?.gamesPitched !== undefined ? `${oppPitchSeason.gamesPitched}登板` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 font-sans text-xs">今季防御率:</span>
                <span className="font-bold text-slate-100">{oppPEra}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今季勝敗:</span>
                <span className="font-bold text-slate-100">
                  {oppPWins !== undefined && oppPLosses !== undefined ? `${oppPWins}勝 ${oppPLosses}敗` : '-'}
                </span>
              </div>
            </div>
          ) : (
            /* 試合中の打者スタッツボックス */
            <div className="space-y-1 bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border border-slate-800/90 text-xs sm:text-[13px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今日:</span>
                <span className="font-extrabold text-amber-300 truncate max-w-[130px]">
                  {bAtBats !== undefined && bHits !== undefined
                    ? `${bAtBats}打数${bHits}安打${bHR ? ` ${bHR}HR` : ''}${bRBI ? ` ${bRBI}点` : ''}`
                    : bBatting?.summary || '打席中'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今季打率:</span>
                <span className="font-bold text-slate-100">{bAvg}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 font-sans text-xs">今季OPS:</span>
                <span className="font-bold text-slate-100">{bOps}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans text-xs">今季本塁打:</span>
                <span className="font-bold text-slate-100">
                  {bSeasonHR !== undefined ? `${bSeasonHR}本` : '-'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ネクストバッターズサークル（または試合開始予定案内） */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          {showProbables ? '予告先発:' : '次打者 (On-Deck):'}
        </span>
        <span className="text-slate-100 font-bold truncate max-w-[180px]">
          {showProbables
            ? `${getPlayerDisplayName(activePitcher?.fullName || '')} vs ${getPlayerDisplayName(activeOpponent?.fullName || '')}`
            : onDeck?.fullName
            ? getPlayerDisplayName(onDeck.fullName)
            : '未定'}
        </span>
      </div>
    </div>
  );
};
