import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFavoriteTeam } from './hooks/useFavoriteTeam';
import { useMlbSchedule } from './hooks/useMlbSchedule';
import { useMlbLiveFeed } from './hooks/useMlbLiveFeed';
import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { DiamondBases } from './components/DiamondBases';
import { CountIndicator } from './components/CountIndicator';
import { MatchupCard } from './components/MatchupCard';
import { PitchSequencePills } from './components/PitchSequencePills';
import { StrikeZone } from './components/StrikeZone';
import { PlayFeed } from './components/PlayFeed';
import { BoxscoreView } from './components/BoxscoreView';
import { PlayerCardModal } from './components/PlayerCardModal';
import type { PlayerSelection } from './components/PlayerCardModal';
import { HomeRunCelebration } from './components/HomeRunCelebration';
import type { HomeRunDetails } from './components/HomeRunCelebration';
import { HardHitAlert } from './components/HardHitAlert';
import type { HardHitAlertData } from './components/HardHitAlert';
import { TeamSelectorModal } from './components/TeamSelectorModal';
import { GameSelectorModal } from './components/GameSelectorModal';
import { HighlightHistoryModal } from './components/HighlightHistoryModal';
import { LiveSimulationBar } from './components/LiveSimulationBar';
import { DEMO_GAMES } from './constants/demoGames';
import { getTeamMeta } from './constants/teams';
import { getJstTodayDateString } from './utils/date';
import type { Play, Linescore } from './types/mlb';
import { Sparkles, RefreshCw, Activity, BarChart3 } from 'lucide-react';

export default function App() {
  // 1. お気に入りチーム管理 (デフォルト: ドジャース 119)
  const { favoriteTeamId, favoriteTeamMeta, setFavoriteTeamId } = useFavoriteTeam();

  // 2. 日付ステート (デフォルト: 日本時間の今日)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getJstTodayDateString();
  });

  // 3. モーダル開閉ステート
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [highlightModalTab, setHighlightModalTab] = useState<'homerun' | 'hardhit'>('homerun');

  // 4. 当日スケジュール取得
  const {
    data: games = [],
    isLoading: isScheduleLoading,
    favoriteGame,
    refetch: refetchSchedule,
    isFetching: isScheduleFetching,
  } = useMlbSchedule(selectedDate, favoriteTeamId);

  // 5. 選択中ゲームPk
  const [selectedGamePk, setSelectedGamePk] = useState<number | undefined>(undefined);

  // スケジュールがロードされた時、または日付が変更された時に、
  // 選択中のゲームが現在の日の試合一覧に存在しない場合のみ、お気に入りチームの試合または第1試合を自動選択
  useEffect(() => {
    if (games.length === 0) return;

    // デモ試合が選択されている場合は上書きしない
    const isDemoGame = DEMO_GAMES.some((d) => d.gamePk === selectedGamePk);
    if (isDemoGame) return;

    // 現在選択されているゲームが、当日のゲーム一覧に含まれているか確認
    const isCurrentGameInList = games.some((g) => g.gamePk === selectedGamePk);

    // 含まれていない場合（初回ロード時、または日付変更時）のみ、自動選択を行う
    if (!isCurrentGameInList) {
      if (favoriteGame) {
        setSelectedGamePk(favoriteGame.gamePk);
      } else {
        setSelectedGamePk(games[0].gamePk);
      }
    }
  }, [games, favoriteGame, selectedGamePk]);

  // 6. エキサイト演出ステート
  const [homeRunDetails, setHomeRunDetails] = useState<HomeRunDetails | null>(null);
  const [hardHitData, setHardHitData] = useState<HardHitAlertData | null>(null);

  const handleHomeRunDetected = useCallback((play: Play) => {
    const hitEvent = play.playEvents?.find((e) => e.hitData);
    setHomeRunDetails({
      batterName: play.matchup?.batter?.fullName || '打者',
      distance: hitEvent?.hitData?.totalDistance,
      launchSpeed: hitEvent?.hitData?.launchSpeed,
      description: play.result?.description,
      rbi: play.result?.rbi,
    });
  }, []);

  const handleHardHitDetected = useCallback((speed: number, play: Play) => {
    const hitEvent = play.playEvents?.find((e) => e.hitData);
    setHardHitData({
      speed,
      batterName: play.matchup?.batter?.fullName || '打者',
      angle: hitEvent?.hitData?.launchAngle,
      distance: hitEvent?.hitData?.totalDistance,
    });
  }, []);

  const handleCloseHomeRun = useCallback(() => {
    setHomeRunDetails(null);
  }, []);

  const handleCloseHardHit = useCallback(() => {
    setHardHitData(null);
  }, []);

  // 下部セクション表示タブ（実況タイムライン or 選手成績ボックススコア）
  const [activeBottomTab, setActiveBottomTab] = useState<'feed' | 'boxscore'>('feed');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSelection | null>(null);
  const closePlayerCard = useCallback(() => setSelectedPlayer(null), []);

  const handleOpenBoxscore = useCallback(() => {
    setActiveBottomTab('boxscore');
    setTimeout(() => {
      document.getElementById('bottom-content-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // 7. ライブフィード取得 (進行中なら5秒ポーリング)
  const {
    feed,
    isLoading: isFeedLoading,
    refetch: refetchFeed,
    isFetching: isFeedFetching,
    status: gameStatus,
    linescore,
    allPlays = [],
    players,
    teams,
  } = useMlbLiveFeed(selectedGamePk, {
    onHomeRun: handleHomeRunDetected,
    onHardHit: handleHardHitDetected,
    enabled: !!selectedGamePk,
  });

  // 8. ライブシミュレーション機能（オフシーズンや過去の名勝負を1打席ずつ再生する機能）
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPlayIndex, setSimPlayIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // シミュレーション対象プレイ
  const activePlays = useMemo(() => {
    if (!isSimulating) return allPlays;
    return allPlays.slice(0, simPlayIndex + 1);
  }, [isSimulating, allPlays, simPlayIndex]);

  // 現在の打席 (currentPlay)
  const activeCurrentPlay = useMemo(() => {
    if (activePlays.length === 0) return feed?.liveData?.plays?.currentPlay;
    return activePlays[activePlays.length - 1];
  }, [activePlays, feed]);

  // シミュレーション時のラインスコア調整
  const activeLinescore = useMemo<Linescore | undefined>(() => {
    if (!isSimulating || !activeCurrentPlay) return linescore;
    const half: 'Top' | 'Bottom' = activeCurrentPlay.about?.halfInning === 'top' ? 'Top' : 'Bottom';
    // 最新打席の状況を模倣
    return {
      ...linescore,
      balls: activeCurrentPlay.count?.balls ?? 0,
      strikes: activeCurrentPlay.count?.strikes ?? 0,
      outs: activeCurrentPlay.count?.outs ?? 0,
      currentInning: activeCurrentPlay.about?.inning ?? linescore?.currentInning,
      isTopInning: activeCurrentPlay.about?.isTopInning ?? linescore?.isTopInning,
      inningHalf: half,
      offense: {
        ...linescore?.offense,
        batter: activeCurrentPlay.matchup?.batter,
        first: activeCurrentPlay.matchup?.postOnFirst,
        second: activeCurrentPlay.matchup?.postOnSecond,
        third: activeCurrentPlay.matchup?.postOnThird,
      },
      defense: {
        ...linescore?.defense,
        pitcher: activeCurrentPlay.matchup?.pitcher,
      },
    };
  }, [isSimulating, activeCurrentPlay, linescore]);

  // 現在の攻撃チーム情報（打席バッターのチームカラー用）
  const battingTeamMeta = useMemo(() => {
    const isTop = activeLinescore?.isTopInning ?? (activeCurrentPlay?.about?.halfInning === 'top');
    const battingTeam = isTop ? teams?.away : teams?.home;
    return battingTeam ? getTeamMeta(battingTeam.id, battingTeam.name) : undefined;
  }, [activeLinescore, activeCurrentPlay, teams]);

  // シミュレーションの自動再生タイマー
  useEffect(() => {
    if (!isSimulating || !autoPlay) return;

    const timer = setInterval(() => {
      setSimPlayIndex((prev) => {
        if (prev >= allPlays.length - 1) {
          setAutoPlay(false);
          return prev;
        }
        const nextIdx = prev + 1;
        const play = allPlays[nextIdx];

        // ホームランやハードヒットをチェックして発火
        if (
          play.result?.event === 'Home Run' ||
          play.result?.eventType === 'home_run' ||
          play.result?.description?.toLowerCase().includes('homers')
        ) {
          handleHomeRunDetected(play);
        }

        const hitEvent = play.playEvents?.find((e) => e.hitData?.launchSpeed);
        if (hitEvent?.hitData?.launchSpeed && hitEvent.hitData.launchSpeed >= 100.0) {
          handleHardHitDetected(hitEvent.hitData.launchSpeed, play);
        }

        return nextIdx;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isSimulating, autoPlay, allPlays, handleHomeRunDetected, handleHardHitDetected]);

  // シミュレーション開始/終了トグル
  const handleToggleSimulate = () => {
    if (!isSimulating) {
      setIsSimulating(true);
      setSimPlayIndex(0);
      setAutoPlay(true);
    } else {
      setIsSimulating(false);
      setAutoPlay(false);
    }
  };

  // 手動更新ハンドラ
  const handleRefreshAll = () => {
    refetchSchedule();
    if (selectedGamePk) {
      refetchFeed();
    }
  };

  // 試合選択ハンドラ
  const handleSelectGame = (gamePk: number, dateStr?: string) => {
    setSelectedGamePk(gamePk);
    if (dateStr && dateStr !== selectedDate) {
      setSelectedDate(dateStr);
    }
    setIsSimulating(false);
    setAutoPlay(false);
  };

  // テスト用ホームラン演出発火
  const triggerTestHomeRun = () => {
    setHomeRunDetails({
      batterName: 'Shohei Ohtani',
      distance: 442,
      launchSpeed: 111.8,
      description: '大谷翔平 第50号特大ソロホームラン！ (442ft / 111.8mph)',
      rbi: 1,
    });
  };

  // テスト用100mphハードヒット演出発火
  const triggerTestHardHit = () => {
    setHardHitData({
      speed: 113.6,
      batterName: 'Shohei Ohtani',
      angle: 19,
      distance: 380,
    });
  };

  // 初期ロードで当日に試合がない場合、自動で直近の名勝負（大谷50-50試合）を初期表示に設定する親切設計
  useEffect(() => {
    if (!isScheduleLoading && games.length === 0 && !selectedGamePk) {
      const defaultDemo = DEMO_GAMES[0];
      setSelectedGamePk(defaultDemo.gamePk);
      setSelectedDate(defaultDemo.date);
    }
  }, [isScheduleLoading, games, selectedGamePk]);

  // 現在の試合のHRプレイ一覧
  const currentHomeRunPlays = useMemo(() => {
    return allPlays.filter((play) => {
      const ev = (play.result?.event || '').toLowerCase();
      const evType = (play.result?.eventType || '').toLowerCase();
      const desc = (play.result?.description || '').toLowerCase();
      return (
        ev.includes('home run') ||
        evType.includes('home_run') ||
        desc.includes('homers') ||
        desc.includes('grand slam')
      );
    });
  }, [allPlays]);

  // 現在の試合の100mph超ハードヒットプレイ一覧
  const currentHardHitPlays = useMemo(() => {
    return allPlays.filter((play) => {
      const hitEvent = play.playEvents?.find((e) => e.hitData?.launchSpeed);
      return hitEvent?.hitData?.launchSpeed && hitEvent.hitData.launchSpeed >= 100.0;
    });
  }, [allPlays]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
      {/* 1. アプリヘッダー */}
      <Header
        favoriteTeam={favoriteTeamMeta}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenGameModal={() => setIsGameModalOpen(true)}
        currentDate={selectedDate}
        onDateChange={(d) => {
          setSelectedDate(d);
          setIsSimulating(false);
        }}
        onRefresh={handleRefreshAll}
        isFetching={isScheduleFetching || isFeedFetching}
        onTriggerTestHomeRun={() => {
          setHighlightModalTab('homerun');
          setIsHighlightModalOpen(true);
        }}
        onTriggerTestHardHit={() => {
          setHighlightModalTab('hardhit');
          setIsHighlightModalOpen(true);
        }}
        homeRunCount={currentHomeRunPlays.length}
        hardHitCount={currentHardHitPlays.length}
        onOpenBoxscore={handleOpenBoxscore}
      />

      {/* 2. メインコンテンツ（画面横幅をフル活用・max-w-5xlでヘッダーと完全一致） */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-2.5 sm:py-4 space-y-2.5 sm:space-y-4">
        {/* シミュレーション操作バー（過去試合やハイライトを1打席ずつリアルタイム追体験できる） */}
        {allPlays.length > 0 && (
          <LiveSimulationBar
            isSimulating={isSimulating}
            onToggleSimulate={handleToggleSimulate}
            currentIndex={simPlayIndex}
            totalPlays={allPlays.length}
            onNextPlay={() => setSimPlayIndex((p) => Math.min(allPlays.length - 1, p + 1))}
            onPrevPlay={() => setSimPlayIndex((p) => Math.max(0, p - 1))}
            onReset={() => setSimPlayIndex(0)}
            autoPlay={autoPlay}
            onToggleAutoPlay={() => setAutoPlay((a) => !a)}
          />
        )}

        {/* スケジュール読み込み中 / エラーハンドリング */}
        {isFeedLoading && !feed && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-dodger-light" />
            <span className="text-sm font-medium">MLB公式リアルタイムフィードを取得中...</span>
          </div>
        )}

        {/* 試合データ表示 */}
        {feed && (
          <>
            {/* ① スコアボード (ラインスコア、イニング、スコア、チームロゴ) */}
            <Scoreboard
              gameStatus={gameStatus}
              linescore={activeLinescore}
              awayTeam={teams?.away}
              homeTeam={teams?.home}
              gameDate={feed.gameData.datetime.dateTime}
              probablePitchers={feed.gameData.probablePitchers}
              decisions={feed.liveData.decisions}
            />

            {/* ② ダイヤモンド走者 & BSOカウント & 打者・投手対決 (左右均等グリッド) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 items-stretch">
              {/* 左: ダイヤモンド走者 & BSO カウントランプ */}
              <div className="glass-panel rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 shadow-lg flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    フィールド状況
                  </span>
                  <span className="text-[10px] text-slate-400">
                    アウト数: <strong className="text-rose-400 font-mono text-xs">{activeLinescore?.outs ?? 0}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-around gap-2 my-auto py-1">
                  {/* BSO LEDインジケーター */}
                  <CountIndicator
                    balls={activeLinescore?.balls}
                    strikes={activeLinescore?.strikes}
                    outs={activeLinescore?.outs}
                  />

                  {/* ダイヤモンド走者グラフィック & RISP強調 */}
                  <DiamondBases offense={activeLinescore?.offense} />
                </div>
              </div>

              {/* 右: 投手 vs 打者対決カード */}
              <div className="h-full">
                <MatchupCard
                  pitcher={activeLinescore?.defense?.pitcher || activeCurrentPlay?.matchup?.pitcher}
                  batter={activeLinescore?.offense?.batter || activeCurrentPlay?.matchup?.batter}
                  onDeck={activeLinescore?.offense?.onDeck}
                  players={players}
                  boxscore={feed?.liveData?.boxscore}
                  probablePitchers={feed?.gameData?.probablePitchers}
                  isPreGame={feed?.gameData?.status?.abstractGameState === 'Preview'}
                  onPlayerSelect={setSelectedPlayer}
                />
              </div>
            </div>

            {/* ③ 配球シーケンス（全幅独立バー・スクロール不要エリア） */}
            <PitchSequencePills playEvents={activeCurrentPlay?.playEvents} />

            {/* ④ ピッチトラッカー & ストライクゾーン (SVG) */}
            <StrikeZone
              playEvents={activeCurrentPlay?.playEvents || []}
              batterName={activeCurrentPlay?.matchup?.batter?.fullName}
              pitcherName={activeCurrentPlay?.matchup?.pitcher?.fullName}
              batSide={activeCurrentPlay?.matchup?.batSide?.code}
              teamColor={battingTeamMeta?.primaryColor}
            />

            {/* ⑤ 下部エリア: 実況タイムライン / 選手成績（ボックススコア）タブ切り替え */}
            <div id="bottom-content-area" className="w-full space-y-2.5">
              {/* タブ切り替えバー */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
                <button
                  onClick={() => setActiveBottomTab('feed')}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-black transition-all ${
                    activeBottomTab === 'feed'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-dodger-light" />
                  <span>実況タイムライン</span>
                  {activePlays.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/60 text-slate-200 font-mono font-bold">
                      {activePlays.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveBottomTab('boxscore')}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-black transition-all ${
                    activeBottomTab === 'boxscore'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                  <span>選手成績（ボックススコア）</span>
                </button>
              </div>

              {/* タブコンテンツ */}
              {activeBottomTab === 'feed' ? (
                <PlayFeed plays={activePlays} currentPlay={activeCurrentPlay} />
              ) : (
                <BoxscoreView
                  boxscore={feed?.liveData?.boxscore}
                  gameData={feed?.gameData}
                  onPlayerSelect={setSelectedPlayer}
                />
              )}
            </div>

            {/* 選手トレーディングカード */}
            <PlayerCardModal
              selection={selectedPlayer}
              season={feed?.gameData?.game?.season || String(new Date().getFullYear())}
              onClose={closePlayerCard}
            />
          </>
        )}

        {/* 試合が未選択または取得できなかった場合 */}
        {!isFeedLoading && !feed && (
          <div className="py-12 px-4 rounded-3xl glass-panel text-center space-y-4 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                試合データがロードされていません
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                上の「試合切替 / 名勝負」ボタンから試合を選択するか、厳選ハイライトをお楽しみください。
              </p>
            </div>
            <button
              onClick={() => setIsGameModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-dodger-blue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
            >
              試合・ハイライトを選ぶ
            </button>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/80 bg-slate-950/60 mt-8">
        <p>MLB Real-Time Game Tracker • Data provided by MLB Stats API</p>
        <p className="mt-0.5 text-slate-600">Mobile-First Haptic & Confetti Enabled</p>
      </footer>

      {/* 演出オーバーレイ */}
      {/* 1. ホームラン演出（全画面Confetti + 振動 + ネオンゴールドバナー） */}
      <HomeRunCelebration
        details={homeRunDetails}
        onClose={handleCloseHomeRun}
      />

      {/* 2. 100mph超ハードヒットアラート（炎アイコン + 赤色パルスバッジ + 振動） */}
      <HardHitAlert
        data={hardHitData}
        onClose={handleCloseHardHit}
      />

      {/* モーダル */}
      {/* 1. お気に入りチーム選択モーダル */}
      <TeamSelectorModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentTeamId={favoriteTeamId}
        onSelectTeam={(teamId) => {
          setFavoriteTeamId(teamId);
          // もし今日そのチームの試合があれば自動選択
          const match = games.find(
            (g) => g.teams.away.team.id === teamId || g.teams.home.team.id === teamId
          );
          if (match) {
            setSelectedGamePk(match.gamePk);
          }
        }}
      />

      {/* 2. 試合切替 & 名勝負モーダル */}
      <GameSelectorModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        games={games}
        currentGamePk={selectedGamePk}
        onSelectGame={handleSelectGame}
        currentDate={selectedDate}
        onDateChange={(d) => setSelectedDate(d)}
      />

      {/* 3. ハイライト（本塁打 & ハードヒット）履歴モーダル */}
      <HighlightHistoryModal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
        initialTab={highlightModalTab}
        allPlays={allPlays}
        onTriggerHomeRunPreview={(play) => {
          if (play) {
            handleHomeRunDetected(play);
          } else {
            triggerTestHomeRun();
          }
        }}
        onTriggerHardHitPreview={(speed, play) => {
          if (speed && play) {
            handleHardHitDetected(speed, play);
          } else {
            triggerTestHardHit();
          }
        }}
      />
    </div>
  );
}
