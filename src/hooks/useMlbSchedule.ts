import { useQuery } from '@tanstack/react-query';
import type { ScheduleGame } from '../types/mlb';
import { getGameJstDateString, shiftJstDateString } from '../utils/date';

export interface ScheduleResponse {
  dates?: Array<{
    date: string;
    totalGames: number;
    games: ScheduleGame[];
  }>;
}

/**
 * 日本時間 (JST) の指定日 (00:00〜23:59) に開始する試合一覧を取得する
 * 米国現地時間との時差（約13〜16時間）を考慮し、前日〜当日の2日分を取得して JST で厳密に抽出・ソート
 */
export async function fetchSchedule(jstDateStr: string): Promise<ScheduleGame[]> {
  const prevDateStr = shiftJstDateString(jstDateStr, -1);
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${prevDateStr}&endDate=${jstDateStr}&hydrate=probablePitcher,team,linescore`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch MLB schedule: ${res.status} ${res.statusText}`);
  }
  const data: ScheduleResponse = await res.json();

  const jstGames: ScheduleGame[] = [];
  for (const dateObj of data.dates || []) {
    for (const g of dateObj.games) {
      if (getGameJstDateString(g.gameDate) === jstDateStr) {
        jstGames.push(g);
      }
    }
  }

  // 日本時間の試合開始時刻昇順にソート
  jstGames.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

  return jstGames;
}

export function useMlbSchedule(dateStr: string, favoriteTeamId: number) {
  const query = useQuery({
    queryKey: ['mlb-schedule', dateStr],
    queryFn: () => fetchSchedule(dateStr),
    staleTime: 60 * 1000, // 1分
    refetchInterval: 60 * 1000, // スケジュール全体は1分ごとにポーリング
  });

  const games = query.data || [];

  // お気に入り球団の試合を自動検出して最優先
  const favoriteGame = games.find(
    (g) => g.teams.away.team.id === favoriteTeamId || g.teams.home.team.id === favoriteTeamId
  );

  return {
    ...query,
    games,
    favoriteGame,
  };
}
