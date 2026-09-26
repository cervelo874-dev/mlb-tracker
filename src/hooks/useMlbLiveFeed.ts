import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import type { LiveGameFeed, Play } from '../types/mlb';

export async function fetchLiveGameFeed(gamePk: number): Promise<LiveGameFeed> {
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch live game feed for ${gamePk}: ${res.statusText}`);
  }
  return res.json();
}

export interface UseMlbLiveFeedOptions {
  onHomeRun?: (play: Play) => void;
  onHardHit?: (speed: number, play: Play) => void;
  enabled?: boolean;
}

export function useMlbLiveFeed(gamePk?: number, options: UseMlbLiveFeedOptions = {}) {
  const lastProcessedPlayEndTimeRef = useRef<string | null>(null);
  const lastProcessedPitchCountRef = useRef<number>(0);

  const query = useQuery({
    queryKey: ['mlb-live-feed', gamePk],
    queryFn: () => {
      if (!gamePk) throw new Error('GamePk is required');
      return fetchLiveGameFeed(gamePk);
    },
    enabled: !!gamePk && (options.enabled ?? true),
    refetchInterval: (query) => {
      const data = query.state.data as LiveGameFeed | undefined;
      if (!data) return 6000;

      const state = data.gameData.status.abstractGameState;
      if (state === 'Live') {
        // 進行中は5〜6秒の高速リアルタイムポーリング
        return 5000;
      } else if (state === 'Preview') {
        // 試合前は30秒
        return 30000;
      } else {
        // 試合終了(Final)は自動ポーリング停止
        return false;
      }
    },
    staleTime: 4000,
  });

  const liveData = query.data;

  // 新規イベント（ホームラン、ハードヒット）の検知ロジック
  useEffect(() => {
    if (!liveData) return;

    const allPlays = liveData.liveData.plays.allPlays || [];
    if (allPlays.length === 0) return;

    const currentPlay = liveData.liveData.plays.currentPlay || allPlays[allPlays.length - 1];

    // 初回ロード時は基準タイムスタンプを保存するのみ（過剰通知防止）
    if (lastProcessedPlayEndTimeRef.current === null) {
      lastProcessedPlayEndTimeRef.current = currentPlay?.playEndTime || 'init';
      lastProcessedPitchCountRef.current = currentPlay?.playEvents?.length || 0;
      return;
    }

    // 最新プレーを検査
    const latestPlay = allPlays[allPlays.length - 1];
    if (latestPlay && latestPlay.playEndTime && latestPlay.playEndTime !== lastProcessedPlayEndTimeRef.current) {
      lastProcessedPlayEndTimeRef.current = latestPlay.playEndTime;

      // ホームラン判定
      const isHr =
        latestPlay.result?.event === 'Home Run' ||
        latestPlay.result?.eventType === 'home_run' ||
        latestPlay.result?.description?.toLowerCase().includes('homers');

      if (isHr && options.onHomeRun) {
        options.onHomeRun(latestPlay);
      }

      // ハードヒット判定
      const hitEvent = latestPlay.playEvents?.find((e) => e.hitData?.launchSpeed);
      const speed = hitEvent?.hitData?.launchSpeed;
      if (speed && speed >= 100.0 && options.onHardHit) {
        options.onHardHit(speed, latestPlay);
      }
    }
  }, [liveData, options]);

  return {
    ...query,
    feed: liveData,
    status: liveData?.gameData?.status,
    linescore: liveData?.liveData?.linescore,
    currentPlay: liveData?.liveData?.plays?.currentPlay,
    allPlays: liveData?.liveData?.plays?.allPlays || [],
    teams: liveData?.gameData?.teams,
    players: liveData?.gameData?.players || {},
  };
}
