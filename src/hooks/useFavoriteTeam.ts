import { useState, useCallback } from 'react';
import { DEFAULT_FAVORITE_TEAM_ID, getTeamMeta } from '../constants/teams';
import type { MLBTeamMeta } from '../constants/teams';

const STORAGE_KEY = 'mlb_tracker_favorite_team_id';

export interface UseFavoriteTeamReturn {
  favoriteTeamId: number;
  favoriteTeamMeta: MLBTeamMeta;
  setFavoriteTeamId: (teamId: number) => void;
  resetToDefault: () => void;
}

export function useFavoriteTeam(): UseFavoriteTeamReturn {
  const [favoriteTeamId, setTeamIdState] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_FAVORITE_TEAM_ID;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read favorite team from localStorage:', e);
    }
    return DEFAULT_FAVORITE_TEAM_ID;
  });

  const setFavoriteTeamId = useCallback((id: number) => {
    setTeamIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id.toString());
    } catch (e) {
      console.warn('Failed to save favorite team to localStorage:', e);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setFavoriteTeamId(DEFAULT_FAVORITE_TEAM_ID);
  }, [setFavoriteTeamId]);

  const favoriteTeamMeta = getTeamMeta(favoriteTeamId);

  return {
    favoriteTeamId,
    favoriteTeamMeta,
    setFavoriteTeamId,
    resetToDefault,
  };
}
