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
  className = 'w-3.5 h-3.5',
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
  // 最新の打席の最新イベントが非投球（アクション）かつ直近で発生している場合
  const latestPlay = currentPlay || plays[plays.length - 1];
  const latestEvents = latestPlay?.playEvents || [];
  const latestEvent = latestEvents.length > 0 ? latestEvents[latestEvents.length - 1] : null;
  const isLatestActionOngoing = latestEvent && !latestEvent.isPitch;
  const activeAction = isLatestActionOngoing ? translatePlayAction(latestEvent) : null;

  return (
    <div
      className={`w-full glass-panel rounded-2xl p-2.5 sm:p-4 border border-slate-700/60 shadow-xl flex flex-col ${className}`}
    >
      {/* タイムラインヘッダー & フィルター */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-dodger-light animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100 tracking-wide">
            実況プレイフィード
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {plays.length} 打席
          </span>
        </div>

        {/* フィルター切り替え */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterScoringOnly(false)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              !filterScoringOnly
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            全プレー
          </button>
          <button
            onClick={() => setFilterScoringOnly(true)}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              filterScoringOnly
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3 h-3" />
            得点のみ
          </button>
        </div>
      </div>

      {/* 試合進行中のライブアクションバナー (投手交代中、チャレンジ中、マウンド訪問中、中断中など) */}
      {activeAction && (
        <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/50 border border-purple-500/40 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ActionIcon type={activeAction.iconType} className="w-4 h-4 text-amber-400" />
              【試合中断中・状況確認】{activeAction.title}
            </span>
          </div>
          <p className="text-xs text-slate-200 pl-4.5 font-medium">
            {activeAction.description}
          </p>
        </div>
      )}

      {/* タイムラインリスト */}
      <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
        {filteredPlays.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
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
                className={`relative rounded-xl p-2.5 sm:p-3 border transition-all ${
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
                        className={`flex items-start gap-1.5 p-1.5 sm:p-2 rounded-lg text-xs border ${
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
                          <ActionIcon type={action.iconType} className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${action.badgeColor}`}>
                              {action.badge}
                            </span>
                            <span className="font-bold text-[11px] sm:text-xs text-slate-100">
                              {action.title}
                            </span>
                          </div>
                          {action.description && action.description !== action.title && (
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ② プレーのメタヘッダー */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {inningText}
                    </span>

                    {/* 日本語イベントバッジ */}
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${translated.badgeColor}`}
                    >
                      {translated.badge}
                    </span>

                    {/* ハードヒットバッジ */}
                    {translated.isHardHit && hitData?.launchSpeed && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm flex items-center gap-0.5 animate-pulse">
                        <Flame className="w-3 h-3 fill-current" />
                        {hitData.launchSpeed} mph
                      </span>
                    )}
                  </div>

                  {/* スコア状況 */}
                  {play.result?.awayScore !== undefined && play.result?.homeScore !== undefined && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {play.result.awayScore} - {play.result.homeScore}
                    </span>
                  )}
                </div>

                {/* ③ 対決 (打者 vs 投手) */}
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <strong className="text-slate-200">
                    {getPlayerDisplayName(batterName)}
                  </strong>
                  <span className="text-slate-600 font-light">vs</span>
                  <span className="text-slate-400">
                    {getPlayerDisplayName(pitcherName)}
                  </span>
                </div>

                {/* ④ 日本語実況テキスト */}
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {translated.japaneseSummary}
                </p>

                {/* ⑤ Statcast データ（打球速度・角度・飛距離） */}
                {translated.statcastText && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-mono text-amber-400/90">
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40 text-[10px] font-sans font-bold">
                      Statcast
                    </span>
                    <span>{translated.statcastText}</span>
                  </div>
                )}

                {/* ⑥ 公式英語トグル & 投球数 */}
                <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <button
                    onClick={() =>
                      setExpandedPlayIndex(
                        isExpanded ? null : play.about?.atBatIndex ?? null
                      )
                    }
                    className="flex items-center gap-1 hover:text-slate-400 transition-colors"
                  >
                    <span>公式英語テキスト</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  <span>
                    {play.playEvents?.filter((e) => e.isPitch).length || 0} 球
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono break-words">
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
