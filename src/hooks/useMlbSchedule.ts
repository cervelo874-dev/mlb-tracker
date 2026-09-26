import { useQuery } from '@tanstack/react-query';
import type { ScheduleGame } from '../types/mlb';

export interface ScheduleResponse {
  dates?: Array<{
    date: string;
    totalGames: number;
    games: ScheduleGame[];
  }>;
}

export async function fetchSchedule(dateStr: string): Promise<ScheduleGame[]> {
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&hydrate=probablePitcher,team,linescore`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch MLB schedule: ${res.status} ${res.statusText}`);
  }
  const data: ScheduleResponse = await res.json();
  if (data.dates && data.dates.length > 0) {
    return data.dates[0].games || [];
  }
  return [];
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
