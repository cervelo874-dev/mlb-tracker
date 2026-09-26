import React, { useState } from 'react';
import { ALL_TEAMS_LIST } from '../constants/teams';
import { Heart, Search, X, Check } from 'lucide-react';

interface TeamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeamId: number;
  onSelectTeam: (teamId: number) => void;
}

export const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTeamId,
  onSelectTeam,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<'ALL' | 'NL' | 'AL'>('ALL');

  if (!isOpen) return null;

  const filteredTeams = ALL_TEAMS_LIST.filter((team) => {
    const matchesSearch =
      team.jpName.toLowerCase().includes(search.toLowerCase()) ||
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.abbreviation.toLowerCase().includes(search.toLowerCase());

    const matchesLeague =
      selectedLeague === 'ALL' || team.league === selectedLeague;

    return matchesSearch && matchesLeague;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h2 className="text-base font-bold text-white">
              お気に入り球団の選択
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索 & リーグ切り替え */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
          {/* 検索入力 */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="球団名や略称で検索 (例: ドジャース, LAD, ヤンキース)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-dodger-light"
            />
          </div>

          {/* リーグフィルタータブ */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedLeague('ALL')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedLeague === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              全30球団
            </button>
            <button
              onClick={() => setSelectedLeague('NL')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedLeague === 'NL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ナ・リーグ (NL)
            </button>
            <button
              onClick={() => setSelectedLeague('AL')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedLeague === 'AL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ア・リーグ (AL)
            </button>
          </div>
        </div>

        {/* ドジャース推奨クイック選択バナー */}
        <div className="px-4 py-2 bg-dodger-blue/20 border-b border-dodger-blue/30 flex items-center justify-between text-xs">
          <span className="text-blue-200">
            デフォルト推奨: <strong>ロサンゼルス・ドジャース (LAD)</strong>
          </span>
          <button
            onClick={() => {
              onSelectTeam(119);
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg bg-dodger-blue hover:bg-blue-600 text-white font-bold text-xs"
          >
            ドジャースに設定
          </button>
        </div>

        {/* 球団リスト */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {filteredTeams.map((team) => {
            const isSelected = team.id === currentTeamId;
            return (
              <button
                key={team.id}
                onClick={() => {
                  onSelectTeam(team.id);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all border ${
                  isSelected
                    ? 'bg-blue-900/30 border-dodger-light/80 shadow-md ring-1 ring-dodger-light/60'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 p-1 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center flex-shrink-0">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">
                        {team.jpName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-800 text-slate-300">
                        {team.abbreviation}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {team.name} ({team.league} {team.division})
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-dodger-blue text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
