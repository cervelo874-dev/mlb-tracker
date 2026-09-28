import React, { useState } from 'react';
import type { Play, PlayEvent } from '../types/mlb';
import {
  translatePlay,
  getPlayerDisplayName,
  translatePlayAction,
  type TranslatedAction,
} from '../utils/translator';
import {
  Flame,
  Trophy,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  Shield,
  AlertTriangle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface PlayFeedProps {
  plays: Play[];
  currentPlay?: Play;
  className?: string;
}

// アクションアイコンのレンダリング
const ActionIcon: React.FC<{ type: TranslatedAction['iconType']; className?: string }> = ({
  type,
  className = 'w-4 h-4',
}) => {
  switch (type) {
    case 'pitcher':
      return <RefreshCw className={className} />;
    case 'review':
      return <Search className={className} />;
    case 'mound':
      return <Users className={className} />;
    case 'batter':
      return <UserCheck className={className} />;
    case 'defense':
      return <Shield className={className} />;
    case 'delay':
      return <AlertTriangle className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'alert':
    default:
      return <AlertCircle className={className} />;
  }
};

export const PlayFeed: React.FC<PlayFeedProps> = ({
  plays = [],
  currentPlay,
  className = '',
}) => {
  const [filterScoringOnly, setFilterScoringOnly] = useState(false);
  const [expandedPlayIndex, setExpandedPlayIndex] = useState<number | null>(null);

  // プレーを新しい順（降順）にソート
  const sortedPlays = [...plays].reverse();

  const filteredPlays = filterScoringOnly
    ? sortedPlays.filter((p) => p.about?.isScoringPlay || p.result?.rbi)
    : sortedPlays;

  // 現在進行中（直近）のライブアクションを検出
  const latestPlay = currentPlay || plays[plays.length - 1];
  const latestEvents = latestPlay?.playEvents || [];
  const latestEvent = latestEvents.length > 0 ? latestEvents[latestEvents.length - 1] : null;
  const isLatestActionOngoing = latestEvent && !latestEvent.isPitch;
  const activeAction = isLatestActionOngoing ? translatePlayAction(latestEvent) : null;

  return (
    <div
      className={`w-full glass-panel rounded-2xl p-3 sm:p-5 border border-slate-700/60 shadow-xl flex flex-col ${className}`}
    >
      {/* タイムラインヘッダー & フィルター */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-dodger-light animate-pulse" />
          <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide">
            実況プレイフィード
          </h3>
          <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
            {plays.length} 打席
          </span>
        </div>

        {/* フィルター切り替え */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <button
            onClick={() => setFilterScoringOnly(false)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              !filterScoringOnly
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            全プレー
          </button>
          <button
            onClick={() => setFilterScoringOnly(true)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              filterScoringOnly
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            得点のみ
          </button>
        </div>
      </div>

      {/* 試合進行中のライブアクションバナー (投手交代中、チャレンジ中、マウンド訪問中、中断中など) */}
      {activeAction && (
        <div className="mb-3.5 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-500/50 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
              <ActionIcon type={activeAction.iconType} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              【試合中断中・状況確認】{activeAction.title}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 pl-5 font-semibold leading-relaxed">
            {activeAction.description}
          </p>
        </div>
      )}

      {/* タイムラインリスト */}
      <div className="space-y-3.5 overflow-y-auto max-h-[520px] pr-1">
        {filteredPlays.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            プレー記録はまだありません
          </div>
        ) : (
          filteredPlays.map((play, idx) => {
            const hitEvent = play.playEvents?.find((e) => e.hitData?.launchSpeed);
            const hitData = hitEvent?.hitData;
            const batterName = play.matchup?.batter?.fullName || '';
            const pitcherName = play.matchup?.pitcher?.fullName || '';

            const translated = translatePlay(
              play.result?.event,
              play.result?.description,
              batterName,
              hitData
            );

            // この打席内の非投球アクションイベント（投手交代、マウンド訪問、チャレンジ、代打等）を抽出
            const actionEvents: TranslatedAction[] = [];
            (play.playEvents || []).forEach((e: PlayEvent) => {
              if (!e.isPitch) {
                const action = translatePlayAction(e);
                if (action) {
                  // 重複を避ける（同じタイトル・説明が複数入らないように）
                  if (!actionEvents.some((a) => a.title === action.title)) {
                    actionEvents.push(action);
                  }
                }
              }
            });

            const isScoring =
              play.about?.isScoringPlay || (play.result?.rbi && play.result.rbi > 0);
            const isExpanded = expandedPlayIndex === play.about?.atBatIndex;

            const inningText = `${play.about?.inning}回${
              play.about?.halfInning === 'top' ? '表' : '裏'
            }`;

            return (
              <div
                key={`play-${play.about?.atBatIndex ?? idx}`}
                className={`relative rounded-xl p-3 sm:p-3.5 border transition-all ${
                  translated.isHomeRun
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : isScoring
                    ? 'bg-slate-900/90 border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* ① 打席に関連する非投球アクションバナー（投手交代・代打・チャレンジなど） */}
                {actionEvents.length > 0 && (
                  <div className="mb-2 space-y-1.5 pb-2 border-b border-slate-800/80">
                    {actionEvents.map((action, aIdx) => (
                      <div
                        key={`action-${aIdx}`}
                        className={`flex items-start gap-2 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm border ${
                          action.category === 'pitcher_sub'
                            ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                            : action.category === 'review'
                            ? 'bg-purple-950/40 border-purple-700/50 text-purple-200'
                            : action.category === 'mound_visit'
                            ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                            : action.category === 'offensive_sub'
                            ? 'bg-cyan-950/40 border-cyan-700/50 text-cyan-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <ActionIcon type={action.iconType} className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-black ${action.badgeColor}`}>
                              {action.badge}
                            </span>
                            <span className="font-black text-xs sm:text-sm text-slate-100">
                              {action.title}
                            </span>
                          </div>
                          {action.description && action.description !== action.title && (
                            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-snug break-words">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ② プレーのメタヘッダー */}
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-200 font-mono bg-slate-800 px-2.5 py-0.5 rounded text-xs sm:text-sm border border-slate-700">
                      {inningText}
                    </span>

                    {/* 日本語イベントバッジ */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-black ${translated.badgeColor}`}
                    >
                      {translated.badge}
                    </span>

                    {/* ハードヒットバッジ */}
                    {translated.isHardHit && hitData?.launchSpeed && (
                      <span className="px-2.5 py-0.5 rounded text-xs sm:text-sm font-black bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {hitData.launchSpeed} mph
                      </span>
                    )}
                  </div>

                  {/* スコア状況 */}
                  {play.result?.awayScore !== undefined && play.result?.homeScore !== undefined && (
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-300">
                      {play.result.awayScore} - {play.result.homeScore}
                    </span>
                  )}
                </div>

                {/* ③ 対決 (打者 vs 投手) */}
                <div className="text-sm sm:text-base text-slate-400 mb-1.5 flex items-center gap-2">
                  <strong className="text-slate-100 font-bold">
                    {getPlayerDisplayName(batterName)}
                  </strong>
                  <span className="text-slate-500 font-normal text-xs sm:text-sm">vs</span>
                  <span className="text-slate-300 font-medium">
                    {getPlayerDisplayName(pitcherName)}
                  </span>
                </div>

                {/* ④ 日本語実況テキスト */}
                <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed">
                  {translated.japaneseSummary}
                </p>

                {/* ⑤ Statcast データ（打球速度・角度・飛距離） */}
                {translated.statcastText && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-2 text-xs sm:text-sm font-mono text-amber-300">
                    <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/50 text-[11px] sm:text-xs font-sans font-black">
                      Statcast
                    </span>
                    <span>{translated.statcastText}</span>
                  </div>
                )}

                {/* ⑥ 公式英語トグル & 投球数 */}
                <div className="mt-2.5 pt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={() =>
                      setExpandedPlayIndex(
                        isExpanded ? null : play.about?.atBatIndex ?? null
                      )
                    }
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors font-medium"
                  >
                    <span>公式英語テキスト</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="font-mono font-bold text-slate-300">
                    {play.playEvents?.filter((e) => e.isPitch).length || 0} 球
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-1.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 font-mono break-words leading-relaxed">
                    {translated.rawDescription}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
