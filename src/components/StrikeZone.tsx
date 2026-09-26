import React, { useState } from 'react';
import type { PlayEvent } from '../types/mlb';
import { getPitchCallJapanese, getPitchTypeJapanese, mphToKmh } from '../utils/translator';
import { Info } from 'lucide-react';
import batterRhbImg from '../assets/batter-rhb.png';
import batterLhbImg from '../assets/batter-lhb.png';

interface StrikeZoneProps {
  playEvents: PlayEvent[];
  batterName?: string;
  pitcherName?: string;
  batSide?: string;
  teamColor?: string;
}

export const StrikeZone: React.FC<StrikeZoneProps> = ({
  playEvents = [],
  batterName,
  pitcherName,
  batSide,
  teamColor,
}) => {
  const [selectedPitchIndex, setSelectedPitchIndex] = useState<number | null>(null);

  // 打者打席 (L: 左打者, R: 右打者, S: スイッチヒッター)
  // 投手視点 (マウンドからキャッチャー方向):
  // 左打者 (L): 画面左側 (一塁側)
  // 右打者 (R): 画面右側 (三塁側)
  const isLeftHanded = batSide === 'L';
  const neonColor = teamColor && teamColor !== '#000000' && teamColor !== '#27251F' ? teamColor : '#38bdf8';

  // 投球イベントのみを抽出
  const pitches = playEvents.filter((e) => e.isPitch && e.pitchData);

  // 選択された投球、デフォルトは最新球
  const activePitch =
    selectedPitchIndex !== null
      ? pitches.find((p) => p.pitchNumber === selectedPitchIndex)
      : pitches.length > 0
      ? pitches[pitches.length - 1]
      : null;

  // SVG dimensions
  const SVG_WIDTH = 260;
  const SVG_HEIGHT = 280;

  // ストライクゾーンの物理基準値（フィート）
  // 左右プレート幅: 17インチ = 1.417 ft (-0.708 ~ +0.708)
  // 上下: デフォルト 1.5ft ~ 3.5ft
  const szTopDefault = 3.5;
  const szBottomDefault = 1.5;

  const currentSzTop = activePitch?.pitchData?.strikeZoneTop || szTopDefault;
  const currentSzBottom = activePitch?.pitchData?.strikeZoneBottom || szBottomDefault;

  // 物理座標 (pX, pZ) を SVG ピクセル座標 (svgX, svgY) にマッピング
  // x範囲: -1.6 ft (左端 20px) ~ +1.6 ft (右端 240px)
  // z範囲: 0.8 ft (底端 250px) ~ 4.4 ft (上端 30px)
  const mapCoordinates = (pitch: PlayEvent) => {
    const coords = pitch.pitchData?.coordinates;
    if (!coords) return null;

    if (coords.pX !== undefined && coords.pZ !== undefined) {
      // 投手視点 (Pitcher's View):
      // キャッチャー視点から見て左右が反転するため、-coords.pX で反転
      const pitcherPX = -coords.pX;
      const minX = -1.6;
      const maxX = 1.6;
      const minZ = 0.8;
      const maxZ = 4.4;

      // X: -1.6 -> 25, +1.6 -> 235 (左が左打者側、右が右打者側)
      const svgX = 25 + ((pitcherPX - minX) / (maxX - minX)) * (SVG_WIDTH - 50);
      // Z: maxZ (4.4) -> 30, minZ (0.8) -> 250
      const svgY = 250 - ((coords.pZ - minZ) / (maxZ - minZ)) * 220;

      return { x: svgX, y: svgY };
    }

    // フォールバック: Gameday x, y (0-250)
    if (coords.x !== undefined && coords.y !== undefined) {
      return { x: SVG_WIDTH - coords.x, y: coords.y };
    }

    return null;
  };

  // ストライクゾーン矩形のピクセル計算
  const zoneLeft = 25 + ((-0.708 - -1.6) / (1.6 - -1.6)) * (SVG_WIDTH - 50);
  const zoneRight = 25 + ((0.708 - -1.6) / (1.6 - -1.6)) * (SVG_WIDTH - 50);
  const zoneWidth = zoneRight - zoneLeft;

  const zoneTop = 250 - ((currentSzTop - 0.8) / (4.4 - 0.8)) * 220;
  const zoneBottom = 250 - ((currentSzBottom - 0.8) / (4.4 - 0.8)) * 220;
  const zoneHeight = zoneBottom - zoneTop;

  // 判定に応じたカラー
  const getPitchColor = (callCode?: string, desc?: string) => {
    const code = callCode || '';
    const d = (desc || '').toLowerCase();
    if (code === 'B' || d.includes('ball')) return { bg: '#10b981', ring: 'rgba(16, 185, 129, 0.4)' }; // 緑: ボール
    if (code === 'C' || d.includes('called strike')) return { bg: '#ef4444', ring: 'rgba(239, 68, 68, 0.4)' }; // 赤: 見逃し
    if (code === 'S' || code === 'W' || d.includes('swinging')) return { bg: '#a855f7', ring: 'rgba(168, 85, 247, 0.4)' }; // 紫: 空振り
    if (code === 'F' || code === 'T' || d.includes('foul')) return { bg: '#eab308', ring: 'rgba(234, 179, 8, 0.4)' }; // 黄: ファウル
    if (code === 'X' || code === 'D' || code === 'E' || d.includes('in play')) return { bg: '#005A9C', ring: 'rgba(0, 90, 156, 0.5)' }; // 青: インプレー
    return { bg: '#64748b', ring: 'rgba(100, 116, 139, 0.4)' };
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 shadow-xl flex flex-col items-center">
      {/* タイトルと球数 */}
      <div className="w-full flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
            <span>ピッチトラッカー & ストライクゾーン</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-950/80 border border-blue-600/50 text-blue-300">
              投手視点
            </span>
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          この打席: <strong className="text-amber-400">{pitches.length}</strong> 球
        </span>
      </div>

      {/* 対戦情報 (投手 vs 打者) */}
      {(pitcherName || batterName) && (
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1 pb-1.5 border-b border-slate-800/80">
          <div className="truncate max-w-[48%]">
            <span className="text-[10px] text-slate-500 mr-1">投:</span>
            <span className="text-slate-300 font-medium truncate">{pitcherName || '投手'}</span>
          </div>
          <span className="text-slate-600 text-[10px] font-bold">vs</span>
          <div className="truncate max-w-[48%] text-right">
            <span className="text-[10px] text-slate-500 mr-1">打:</span>
            <span className="text-slate-300 font-medium truncate">{batterName || '打者'}</span>
          </div>
        </div>
      )}

      {/* SVG ストライクゾーン */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[260/280] bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* バッター立ち絵用 チームカラーティント＆ネオングローフィルター */}
            <filter id="batter-tint-glow" x="-20%" y="-20%" width="140%" height="140%">
              {/* チームカラーの光彩 */}
              <feFlood floodColor={neonColor} floodOpacity="0.8" result="flood" />
              <feComposite in="flood" in2="SourceAlpha" operator="in" result="tinted" />
              <feGaussianBlur in="tinted" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* 打席ボックスの床面グラデーション */}
            <linearGradient id="batterBoxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={neonColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={neonColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* 左打席ボックス (画面左・一塁側) */}
          <rect
            x="6"
            y="42"
            width="72"
            height="228"
            rx="8"
            fill={isLeftHanded ? "url(#batterBoxGrad)" : "rgba(15, 23, 42, 0.4)"}
            stroke={isLeftHanded ? neonColor : "#334155"}
            strokeWidth={isLeftHanded ? "1.5" : "1"}
            strokeDasharray={isLeftHanded ? "none" : "3,3"}
            strokeOpacity={isLeftHanded ? "0.8" : "0.5"}
          />
          {/* 左打席インジケーター L */}
          <text
            x="42"
            y="35"
            textAnchor="middle"
            fill={isLeftHanded ? neonColor : "#475569"}
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            L
          </text>

          {/* 右打席ボックス (画面右・三塁側) */}
          <rect
            x="182"
            y="42"
            width="72"
            height="228"
            rx="8"
            fill={!isLeftHanded ? "url(#batterBoxGrad)" : "rgba(15, 23, 42, 0.4)"}
            stroke={!isLeftHanded ? neonColor : "#334155"}
            strokeWidth={!isLeftHanded ? "1.5" : "1"}
            strokeDasharray={!isLeftHanded ? "none" : "3,3"}
            strokeOpacity={!isLeftHanded ? "0.8" : "0.5"}
          />
          {/* 右打席インジケーター R */}
          <text
            x="218"
            y="35"
            textAnchor="middle"
            fill={!isLeftHanded ? neonColor : "#475569"}
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            R
          </text>

          {/* ホームベース (投手視点: 尖った頂点が上[投手方向]、底辺が下[捕手方向]) */}
          <polygon
            points={`${SVG_WIDTH / 2},263 ${SVG_WIDTH / 2 + 25},270 ${SVG_WIDTH / 2 + 25},278 ${SVG_WIDTH / 2 - 25},278 ${SVG_WIDTH / 2 - 25},270`}
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <polygon
            points={`${SVG_WIDTH / 2},266 ${SVG_WIDTH / 2 + 21},272 ${SVG_WIDTH / 2 + 21},276 ${SVG_WIDTH / 2 - 21},276 ${SVG_WIDTH / 2 - 21},272`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* 足元のホログラム接地サークル */}
          <ellipse
            cx={isLeftHanded ? 42 : 218}
            cy={265}
            rx={25}
            ry={6.5}
            fill="none"
            stroke={neonColor}
            strokeWidth="1.2"
            strokeDasharray="4,2"
            strokeOpacity="0.7"
          />
          <ellipse
            cx={isLeftHanded ? 42 : 218}
            cy={265}
            rx={15}
            ry={4}
            fill={neonColor}
            fillOpacity="0.15"
          />

          {/* バッター立ち絵 (高精細アスリートホログラムPNG: リアルスケール拡大版) */}
          {/* 投手視点: マウンド(手前上)を鋭く見据え、前肩を出しバットを引いた正確なフォーム */}
          <image
            href={isLeftHanded ? batterLhbImg : batterRhbImg}
            x={isLeftHanded ? -7 : 169}
            y={23}
            width={98}
            height={242}
            opacity={0.55}
            filter="url(#batter-tint-glow)"
            style={{ pointerEvents: 'none' }}
          />

          {/* ストライクゾーン外枠 (9分割グリッド) */}
          <rect
            x={zoneLeft}
            y={zoneTop}
            width={zoneWidth}
            height={zoneHeight}
            fill="rgba(30, 41, 59, 0.45)"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="none"
            rx="4"
          />

          {/* 3x3 グリッド線 */}
          {/* 縦線 */}
          <line
            x1={zoneLeft + zoneWidth / 3}
            y1={zoneTop}
            x2={zoneLeft + zoneWidth / 3}
            y2={zoneBottom}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line
            x1={zoneLeft + (zoneWidth * 2) / 3}
            y1={zoneTop}
            x2={zoneLeft + (zoneWidth * 2) / 3}
            y2={zoneBottom}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          {/* 横線 */}
          <line
            x1={zoneLeft}
            y1={zoneTop + zoneHeight / 3}
            x2={zoneRight}
            y2={zoneTop + zoneHeight / 3}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line
            x1={zoneLeft}
            y1={zoneTop + (zoneHeight * 2) / 3}
            x2={zoneRight}
            y2={zoneTop + (zoneHeight * 2) / 3}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* 全投球プロット */}
          {pitches.map((p, index) => {
            const ptCoords = mapCoordinates(p);
            if (!ptCoords) return null;

            const isLatest = index === pitches.length - 1;
            const isSelected = activePitch?.pitchNumber === p.pitchNumber;
            const colors = getPitchColor(p.details.call?.code, p.details.call?.description);

            return (
              <g
                key={`pitch-${p.pitchNumber || index}`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedPitchIndex(p.pitchNumber || index + 1)}
              >
                {/* 最新球の外周光彩リング（白リングを置き換えた太く鮮やかなグローリング） */}
                {isLatest && (
                  <circle
                    cx={ptCoords.x}
                    cy={ptCoords.y}
                    r="14"
                    fill={colors.bg}
                    fillOpacity="0.25"
                    stroke={colors.bg}
                    strokeWidth="3.5"
                    strokeOpacity="0.9"
                    className="animate-pulse"
                  />
                )}

                {/* 過去球をクリック選択した際の強調リング（最新球選択時は光彩リングに一本化） */}
                {isSelected && !isLatest && (
                  <circle
                    cx={ptCoords.x}
                    cy={ptCoords.y}
                    r="14"
                    fill="none"
                    stroke={colors.bg}
                    strokeWidth="3"
                    strokeOpacity="0.95"
                  />
                )}

                {/* 投球ドット */}
                <circle
                  cx={ptCoords.x}
                  cy={ptCoords.y}
                  r="10"
                  fill={colors.bg}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="filter drop-shadow"
                />

                {/* 球数番号 */}
                <text
                  x={ptCoords.x}
                  y={ptCoords.y + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {p.pitchNumber || index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {pitches.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Info className="w-5 h-5 mb-1 text-slate-600" />
            <span>投球データ待機中</span>
          </div>
        )}
      </div>

      {/* 判定凡例 (Legend) */}
      <div className="w-full flex items-center justify-center gap-2.5 mt-2.5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ボール
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 見逃し
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> 空振り
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> ファウル
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> インプレー
        </span>
      </div>

      {/* 選択中（または最新）投球の詳細バッジ */}
      {activePitch && activePitch.pitchData && (
        <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs font-mono">
              #{activePitch.pitchNumber}
            </span>
            <div>
              <div className="font-bold text-slate-200">
                {getPitchTypeJapanese(activePitch.details.type?.code, activePitch.details.type?.description)}
              </div>
              <div className="text-[11px] text-slate-400">
                {getPitchCallJapanese(activePitch.details.call?.code, activePitch.details.call?.description).label}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold font-mono text-amber-400">
              {activePitch.pitchData.startSpeed ? `${activePitch.pitchData.startSpeed} mph` : ''}
            </div>
            {activePitch.pitchData.startSpeed && (
              <div className="text-[10px] text-slate-400 font-mono">
                ({mphToKmh(activePitch.pitchData.startSpeed)} km/h)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
