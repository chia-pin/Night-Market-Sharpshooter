/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GunStats, GameMode, GameStats } from '../types';
import { GUNS_CONFIG } from '../utils/constants';
import { Volume2, VolumeX, Music, Award, HelpCircle, RotateCcw } from 'lucide-react';

interface NightMarketHUDProps {
  stats: GameStats;
  currentGun: GunStats;
  ammo: number;
  isReloading: boolean;
  gameMode: GameMode;
  timeRemaining: number;
  shotsLeft: number;
  isMuted: boolean;
  isBgmOn: boolean;
  onSelectGun: (gun: GunStats) => void;
  onReload: () => void;
  onToggleMute: () => void;
  onToggleBGM: () => void;
  onOpenPrizeShop: () => void;
  onOpenInstructions: () => void;
  onRestartGame: () => void;
  onChangeMode: (mode: GameMode) => void;
}

export const NightMarketHUD: React.FC<NightMarketHUDProps> = ({
  stats,
  currentGun,
  ammo,
  isReloading,
  gameMode,
  timeRemaining,
  shotsLeft,
  isMuted,
  isBgmOn,
  onSelectGun,
  onReload,
  onToggleMute,
  onToggleBGM,
  onOpenPrizeShop,
  onOpenInstructions,
  onRestartGame,
  onChangeMode,
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Main Carnival Scoreboard & Status Header */}
      <div className="bg-[#2a170c] border-2 border-amber-800/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mode Switcher & Tickets count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-950/70 p-1 rounded-xl border border-amber-900">
            <button
              onClick={() => onChangeMode('TIMED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                gameMode === 'TIMED'
                  ? 'bg-amber-500 text-amber-950 shadow-md'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
              }`}
            >
              ⏱️ 60秒限時挑戰
            </button>
            <button
              onClick={() => onChangeMode('CLASSIC_10')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                gameMode === 'CLASSIC_10'
                  ? 'bg-amber-500 text-amber-950 shadow-md'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
              }`}
            >
              🎯 經典十發包廂
            </button>
            <button
              onClick={() => onChangeMode('SPEED_RUSH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                gameMode === 'SPEED_RUSH'
                  ? 'bg-amber-500 text-amber-950 shadow-md'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
              }`}
            >
              ⚡ 橫向滑行極速
            </button>
          </div>

          {/* Tickets Balance */}
          <button
            onClick={onOpenPrizeShop}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-50 px-3 py-1.5 rounded-xl border border-amber-400/60 shadow transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-200" />
            <span className="text-xs font-bold">夜市彩票</span>
            <span className="text-sm font-black font-mono tabular-nums text-amber-200">
              {stats.ticketsTotal}
            </span>
          </button>
        </div>

        {/* Center: Score, Timer/Shots, Combo */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              SCORE 分數
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
              {stats.score}
            </span>
          </div>

          {/* Time or Shots Left */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              {gameMode === 'CLASSIC_10' ? 'SHOTS 剩餘發數' : 'TIME 剩餘秒數'}
            </span>
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${
                (gameMode === 'CLASSIC_10' ? shotsLeft <= 3 : timeRemaining <= 10)
                  ? 'text-rose-500 animate-pulse'
                  : 'text-white'
              }`}
            >
              {gameMode === 'CLASSIC_10' ? `${shotsLeft}發` : `${timeRemaining}s`}
            </span>
          </div>

          {/* Combo */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              COMBO 連擊
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-orange-400">
                x{stats.currentCombo}
              </span>
              {stats.currentCombo >= 3 && (
                <span className="text-xs animate-bounce">🔥</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls (Prize Shop, Audio, Rules, Restart) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleBGM}
            className={`p-2 rounded-lg border transition-colors ${
              isBgmOn
                ? 'bg-amber-600/60 border-amber-400 text-amber-200'
                : 'bg-amber-950/60 border-amber-900 text-amber-400/50 hover:text-amber-200'
            }`}
            title={isBgmOn ? '關閉夜市背景音樂' : '開啟夜市背景音樂'}
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              !isMuted
                ? 'bg-amber-600/60 border-amber-400 text-amber-200'
                : 'bg-amber-950/60 border-amber-900 text-amber-400/50 hover:text-amber-200'
            }`}
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenInstructions}
            className="p-2 rounded-lg bg-amber-950/60 border border-amber-900 text-amber-300 hover:text-white hover:bg-amber-900/60 transition-colors"
            title="查看玩法規則"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onRestartGame}
            className="p-2 rounded-lg bg-amber-950/60 border border-amber-900 text-amber-300 hover:text-white hover:bg-amber-900/60 transition-colors"
            title="重新開始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Secondary Bar: Fever Gauge & Weapon Armory */}
      <div className="bg-[#241309] border border-amber-900/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Fever Bar */}
        <div className="flex items-center gap-2.5 min-w-[200px] flex-1 max-w-sm">
          <span className="text-xs font-bold text-amber-300 whitespace-nowrap">
            {stats.isFever ? '⚡ 狂熱FEVER爆發中' : '🔥 FEVER 集氣'}
          </span>
          <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-amber-800/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                stats.isFever
                  ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{ width: `${stats.feverGauge}%` }}
            />
          </div>
          <span className="text-[11px] font-mono tabular-nums text-amber-400 font-bold">
            {Math.round(stats.feverGauge)}%
          </span>
        </div>

        {/* Gun Armory Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-amber-400/80 mr-1 hidden md:inline">
            武器庫:
          </span>
          {Object.values(GUNS_CONFIG).map((gun, idx) => {
            const isSelected = currentGun.id === gun.id;
            return (
              <button
                key={gun.id}
                onClick={() => onSelectGun(gun)}
                title={`${gun.name} - ${gun.subtitle}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-amber-950 border-2 border-white shadow-lg ring-2 ring-amber-400 font-black scale-105'
                    : 'bg-amber-950/70 text-amber-200/80 border border-amber-900/70 hover:bg-amber-900/60 hover:text-white'
                }`}
              >
                <span>{gun.icon}</span>
                <span>{gun.name}</span>
                <span
                  className={`text-[10px] px-1 py-0.5 rounded font-mono font-bold ${
                    isSelected ? 'bg-amber-900/30 text-amber-950' : 'bg-black/50 text-amber-400'
                  }`}
                >
                  [{idx + 1}]
                </span>
              </button>
            );
          })}

          {/* Reload Button */}
          <button
            onClick={onReload}
            disabled={isReloading || ammo === currentGun.capacity}
            className={`ml-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              ammo === 0
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100 border border-amber-600/60'
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            <span>🔄 裝填 [R]</span>
            <span className="font-mono tabular-nums">
              ({ammo}/{currentGun.capacity})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
