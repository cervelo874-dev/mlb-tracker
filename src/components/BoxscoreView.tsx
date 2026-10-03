import React, { useState } from 'react';
import { MLB_TEAMS } from '../constants/teams';
import { getPlayerDisplayName, formatPlayerPositions } from '../utils/translator';
import { Users, Shield } from 'lucide-react';
import type { PlayerSelection } from './PlayerCardModal';

interface BoxscoreViewProps {
  boxscore?: {
    teams?: {
      away?: any;
      home?: any;
    };
  };
  gameData?: {
    teams?: {
      away?: any;
      home?: any;
    };
  };
  className?: string;
  /** 選手行タップ時に選手カードを開く */
  onPlayerSelect?: (selection: PlayerSelection) => void;
}

export const BoxscoreView: React.FC<BoxscoreViewProps> = ({
  boxscore,
  gameData,
  className = '',
  onPlayerSelect,
}) => {
  const [selectedSide, setSelectedSide] = useState<'away' | 'home'>('away');

  const awayTeam = boxscore?.teams?.away || {};
  const homeTeam = boxscore?.teams?.home || {};
  const awayGameTeam = gameData?.teams?.away || awayTeam?.team || {};
  const homeGameTeam = gameData?.teams?.home || homeTeam?.team || {};

  const awayTeamId = awayGameTeam?.id || awayTeam?.team?.id;
  const homeTeamId = homeGameTeam?.id || homeTeam?.team?.id;

  const awayMeta = awayTeamId ? MLB_TEAMS[awayTeamId] : undefined;
  const homeMeta = homeTeamId ? MLB_TEAMS[homeTeamId] : undefined;

  const awayTeamName = awayMeta?.jpName || awayGameTeam?.name || 'アウェイ';
  const homeTeamName = homeMeta?.jpName || homeGameTeam?.name || 'ホーム';

  const currentTeamBox = selectedSide === 'away' ? awayTeam : homeTeam;
  const currentTeamMeta = selectedSide === 'away' ? awayMeta : homeMeta;

  // 打者選出ロジック:
  // MLB API では batters 配列に登板した投手も末尾に含まれてしまうため、
  // 実際に打席に立った選手（野手、または打撃スタッツのある二刀流投手）のみに絞り込む
  const isBatterEligible = (p: any): boolean => {
    if (!p) return false;
    const isPitcherPos =
      p.position?.abbreviation === 'P' || p.primaryPosition?.abbreviation === 'P';
    const bStats = p.stats?.batting;

    // 打撃スタッツが存在しない、または空オブジェクトの場合は除外
    if (!bStats || Object.keys(bStats).length === 0) {
      return false;
    }

    // 投手登録選手は、打席に立っている（打席数 > 0 または 打数 > 0）場合のみ表示
    if (isPitcherPos) {
      const pa = bStats.plateAppearances ?? 0;
      const ab = bStats.atBats ?? 0;
      return pa > 0 || ab > 0;
    }

    // 野手（P以外）は代走・守備固め等含め打者テーブルに含める
    return true;
  };

  // 打者リストの抽出（打順・交代順）
  const batters: any[] = [];
  const battersIds: number[] = currentTeamBox?.batters || [];
  const playersMap = currentTeamBox?.players || {};

  if (battersIds.length > 0) {
    battersIds.forEach((id) => {
      const p = playersMap[`ID${id}`] || playersMap[id];
      if (p && isBatterEligible(p)) {
        batters.push(p);
      }
    });
  } else {
    // batters 配列がない場合のフォールバック
    Object.values(playersMap).forEach((p: any) => {
      if (isBatterEligible(p)) {
        batters.push(p);
      }
    });
  }

  // 投手リストの抽出（登板順）
  const pitchers: any[] = [];
  const pitchersIds: number[] = currentTeamBox?.pitchers || [];
  if (pitchersIds.length > 0) {
    pitchersIds.forEach((id) => {
      const p = playersMap[`ID${id}`] || playersMap[id];
      if (p) pitchers.push(p);
    });
  } else {
    // pitchers 配列がない場合のフォールバック
    Object.values(playersMap).forEach((p: any) => {
      if (p?.stats?.pitching && p.stats.pitching.inningsPitched !== undefined) {
        pitchers.push(p);
      }
    });
  }

  return (
    <div
      id="boxscore-section"
      className={`w-full glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* チーム切り替えタブ (ユーザー画像準拠の2分割タブ) */}
      <div className="flex border-b border-slate-800 bg-slate-950/70">
        <button
          onClick={() => setSelectedSide('away')}
          className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 text-base sm:text-lg font-black transition-all border-b-2 ${
            selectedSide === 'away'
              ? 'border-dodger-light text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          {awayMeta?.logo && (
            <img
              src={awayMeta.logo}
              alt={awayTeamName}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]"
            />
          )}
          <span>{awayTeamName}</span>
        </button>

        <button
          onClick={() => setSelectedSide('home')}
          className={`flex-1 py-3.5 px-4 flex items-center justify-center gap-2 text-base sm:text-lg font-black transition-all border-b-2 ${
            selectedSide === 'home'
              ? 'border-dodger-light text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          {homeMeta?.logo && (
            <img
              src={homeMeta.logo}
              alt={homeTeamName}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]"
            />
          )}
          <span>{homeTeamName}</span>
        </button>
      </div>

      <div className="p-3 sm:p-5 space-y-6">
        {/* ① 打者セクション */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dodger-light" />
              <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide">
                打者
              </h3>
              {onPlayerSelect && (
                <span className="text-[11px] sm:text-xs font-bold text-amber-300/80">
                  ✦ 選手をタップでカード表示
                </span>
              )}
            </div>
            {currentTeamMeta && (
              <span
                className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border border-slate-700 text-slate-200 bg-slate-900 font-sans"
              >
                {selectedSide === 'away' ? awayTeamName : homeTeamName}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/40">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs sm:text-sm text-slate-300 border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 font-bold text-slate-200">選手</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">打</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">得</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">安</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">四</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">点</th>
                  <th className="py-2.5 px-3 text-center font-black w-11 sm:w-14">HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {batters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 text-xs sm:text-sm">
                      打者データがありません
                    </td>
                  </tr>
                ) : (
                  batters.map((player: any, idx: number) => {
                    const id = player.person?.id || idx;
                    const jerseyNumber = player.jerseyNumber || '';
                    const rawName = player.person?.fullName || '';
                    const displayName = getPlayerDisplayName(rawName);
                    const posText = formatPlayerPositions(player.allPositions, player.position);

                    const bStats = player.stats?.batting || {};
                    const atBats = bStats.atBats ?? '-';
                    const runs = bStats.runs ?? 0;
                    const hits = bStats.hits ?? 0;
                    const bb = bStats.baseOnBalls ?? 0;
                    const rbi = bStats.rbi ?? 0;
                    const hr = bStats.homeRuns ?? 0;

                    return (
                      <tr
                        key={`batter-${id}-${idx}`}
                        onClick={() =>
                          player.person?.id &&
                          onPlayerSelect?.({
                            id: player.person.id,
                            fullName: rawName,
                            preferredGroup: 'hitting',
                            teamId: selectedSide === 'away' ? awayTeamId : homeTeamId,
                          })
                        }
                        className="hover:bg-slate-800/30 active:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            {jerseyNumber && (
                              <span className="text-slate-400 font-mono text-xs sm:text-sm font-bold w-5 sm:w-6 flex-shrink-0">
                                {jerseyNumber}
                              </span>
                            )}
                            <span className="font-bold text-sm sm:text-base text-slate-100 hover:text-dodger-light transition-colors">
                              {displayName}
                            </span>
                            {posText && (
                              <span className="text-slate-300 text-xs sm:text-sm font-medium">
                                · {posText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {atBats}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {runs}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-black text-xs sm:text-sm ${
                            hits > 0 ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {hits}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {bb}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-black text-xs sm:text-sm ${
                            rbi > 0 ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          {rbi}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-center font-mono font-black text-xs sm:text-sm ${
                            hr > 0 ? 'text-orange-400 text-sm sm:text-base' : 'text-slate-200'
                          }`}
                        >
                          {hr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* ② 投手セクション */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide">
              投手
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/40">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs sm:text-sm text-slate-300 border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 font-bold text-slate-200">選手</th>
                  <th className="py-2.5 px-2 text-center font-bold w-12 sm:w-16">回</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">安</th>
                  <th className="py-2.5 px-2 text-center font-bold w-11 sm:w-14">自責</th>
                  <th className="py-2.5 px-2 text-center font-bold w-10 sm:w-12">四</th>
                  <th className="py-2.5 px-3 text-center font-black w-10 sm:w-12">三</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {pitchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 text-xs sm:text-sm">
                      投手データがありません
                    </td>
                  </tr>
                ) : (
                  pitchers.map((player: any, idx: number) => {
                    const id = player.person?.id || idx;
                    const jerseyNumber = player.jerseyNumber || '';
                    const rawName = player.person?.fullName || '';
                    const displayName = getPlayerDisplayName(rawName);

                    const pStats = player.stats?.pitching || {};
                    const ip = pStats.inningsPitched ?? '0.0';
                    const hits = pStats.hits ?? 0;
                    const er = pStats.earnedRuns ?? 0;
                    const bb = pStats.baseOnBalls ?? 0;
                    const so = pStats.strikeOuts ?? 0;

                    return (
                      <tr
                        key={`pitcher-${id}-${idx}`}
                        onClick={() =>
                          player.person?.id &&
                          onPlayerSelect?.({
                            id: player.person.id,
                            fullName: rawName,
                            preferredGroup: 'pitching',
                            teamId: selectedSide === 'away' ? awayTeamId : homeTeamId,
                          })
                        }
                        className="hover:bg-slate-800/30 active:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-baseline gap-1.5">
                            {jerseyNumber && (
                              <span className="text-slate-400 font-mono text-xs sm:text-sm font-bold w-5 sm:w-6 flex-shrink-0">
                                {jerseyNumber}
                              </span>
                            )}
                            <span className="font-bold text-sm sm:text-base text-slate-100 hover:text-emerald-400 transition-colors">
                              {displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {ip}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {hits}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-black text-xs sm:text-sm ${
                            er > 0 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {er}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs sm:text-sm text-slate-200">
                          {bb}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-center font-mono font-black text-xs sm:text-sm ${
                            so > 0 ? 'text-cyan-400' : 'text-slate-200'
                          }`}
                        >
                          {so}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
