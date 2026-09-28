import React, { useState } from 'react';
import { MLB_TEAMS } from '../constants/teams';
import { getPlayerDisplayName, formatPlayerPositions } from '../utils/translator';
import { Users, Shield } from 'lucide-react';

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
}

export const BoxscoreView: React.FC<BoxscoreViewProps> = ({
  boxscore,
  gameData,
  className = '',
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

  // 打者リストの抽出（打順・交代順）
  const batters: any[] = [];
  const battersIds: number[] = currentTeamBox?.batters || [];
  const playersMap = currentTeamBox?.players || {};

  if (battersIds.length > 0) {
    battersIds.forEach((id) => {
      const p = playersMap[`ID${id}`] || playersMap[id];
      if (p) batters.push(p);
    });
  } else {
    // batters 配列がない場合のフォールバック
    Object.values(playersMap).forEach((p: any) => {
      if (p?.stats?.batting && (p.stats.batting.atBats !== undefined || p.stats.batting.plateAppearances)) {
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
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm sm:text-base font-bold transition-all border-b-2 ${
            selectedSide === 'away'
              ? 'border-dodger-light text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          {awayMeta?.logo && (
            <img
              src={awayMeta.logo}
              alt={awayTeamName}
              className="w-5 h-5 object-contain drop-shadow"
            />
          )}
          <span>{awayTeamName}</span>
        </button>

        <button
          onClick={() => setSelectedSide('home')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm sm:text-base font-bold transition-all border-b-2 ${
            selectedSide === 'home'
              ? 'border-dodger-light text-white bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          {homeMeta?.logo && (
            <img
              src={homeMeta.logo}
              alt={homeTeamName}
              className="w-5 h-5 object-contain drop-shadow"
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
              <Users className="w-4 h-4 text-dodger-light" />
              <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide">
                打者
              </h3>
            </div>
            {currentTeamMeta && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 bg-slate-900"
              >
                {selectedSide === 'away' ? awayTeamName : homeTeamName}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/40">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] sm:text-xs text-slate-400 border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-slate-300">選手</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">打</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">得</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">安</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">四</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">点</th>
                  <th className="py-2.5 px-3 text-center font-semibold w-10 sm:w-12">HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {batters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
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
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            {jerseyNumber && (
                              <span className="text-slate-400 font-mono text-[11px] sm:text-xs w-5 sm:w-6 flex-shrink-0">
                                {jerseyNumber}
                              </span>
                            )}
                            <span className="font-semibold text-slate-100 hover:text-dodger-light transition-colors">
                              {displayName}
                            </span>
                            {posText && (
                              <span className="text-slate-400 text-[11px] sm:text-xs">
                                · {posText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-200">
                          {atBats}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-200">
                          {runs}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-bold ${
                            hits > 0 ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {hits}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-200">
                          {bb}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-bold ${
                            rbi > 0 ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          {rbi}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-center font-mono font-extrabold ${
                            hr > 0 ? 'text-orange-400' : 'text-slate-200'
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
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide">
              投手
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/40">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] sm:text-xs text-slate-400 border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold text-slate-300">選手</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-12 sm:w-14">回</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">安</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-10 sm:w-12">自責</th>
                  <th className="py-2.5 px-2 text-center font-semibold w-9 sm:w-11">四</th>
                  <th className="py-2.5 px-3 text-center font-semibold w-9 sm:w-11">三</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {pitchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
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
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="flex items-baseline gap-1.5">
                            {jerseyNumber && (
                              <span className="text-slate-400 font-mono text-[11px] sm:text-xs w-5 sm:w-6 flex-shrink-0">
                                {jerseyNumber}
                              </span>
                            )}
                            <span className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors">
                              {displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-200">
                          {ip}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-200">
                          {hits}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-bold ${
                            er > 0 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {er}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-200">
                          {bb}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-center font-mono font-bold ${
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
