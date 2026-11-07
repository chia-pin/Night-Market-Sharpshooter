/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, GameStats } from '../types';
import { Award, RotateCcw, ShoppingBag, Target, Zap, UploadCloud, CheckCircle2, AlertCircle, Trophy, Loader2 } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  stats: GameStats;
  gunName?: string;
  playerName?: string;
  onPlayAgain: () => void;
  onOpenPrizeShop: () => void;
  onOpenLeaderboard?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  gameMode,
  stats,
  gunName = '夜市軟木塞槍',
  playerName: initialPlayerName = '夜市神射手',
  onPlayAgain,
  onOpenPrizeShop,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState<string>(initialPlayerName);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPlayerName(initialPlayerName);
      setUploadStatus(null);
    }
  }, [isOpen, initialPlayerName]);

  if (!isOpen) return null;

  const accuracy =
    stats.shotsFired > 0
      ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
      : 0;

  // Handle uploading record to Google Sheets
  const handleUploadScore = async () => {
    setIsUploading(true);
    setUploadStatus(null);

    const modeLabels: Record<GameMode, string> = {
      TIMED: '60秒限時挑戰',
      CLASSIC_10: '經典十發包廂',
      SPEED_RUSH: '極速滑行狂暴',
    };

    try {
      const res = await fetch('/api/sheets/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim() || '夜市神射手',
          gameMode: modeLabels[gameMode] || gameMode,
          score: stats.score,
          accuracy,
          totalHits: stats.shotsHit,
          maxCombo: stats.maxCombo,
          gunName,
          tokens: stats.ticketsEarnedThisRound,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus({
          success: true,
          message: data.message || '已成功記錄至 Google Sheets！',
        });
      } else {
        setUploadStatus({
          success: false,
          message: data.error || '上傳失敗，請檢查 .env 設定檔中的 Service Account 與 Sheet ID。',
        });
      }
    } catch (err: any) {
      setUploadStatus({
        success: false,
        message: `連線失敗: ${err.message || '請確認伺服器與網路連線'}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Determine Classic 10 reward tier
  const getClassicTier = () => {
    if (stats.shotsHit >= 10) {
      return {
        badge: '🏆 特等獎 (全中！)',
        title: '神射手降臨！抱走巨型柴犬大娃娃！',
        color: 'text-amber-300',
        bg: 'bg-amber-500/20 border-amber-400',
        icon: '🐕',
      };
    } else if (stats.shotsHit >= 8) {
      return {
        badge: '🥈 頭獎',
        title: '神準！獲得頂橘子水豚君玩偶！',
        color: 'text-amber-200',
        bg: 'bg-orange-500/20 border-orange-400',
        icon: '🍊',
      };
    } else if (stats.shotsHit >= 6) {
      return {
        badge: '🥉 二獎',
        title: '表現不俗！獲得波霸奶茶大抱枕！',
        color: 'text-amber-100',
        bg: 'bg-purple-500/20 border-purple-400',
        icon: '🧋',
      };
    } else if (stats.shotsHit >= 4) {
      return {
        badge: '🎖️ 普獎',
        title: '獲得廟口香腸鑰匙圈或地瓜球徽章！',
        color: 'text-emerald-300',
        bg: 'bg-emerald-500/20 border-emerald-400',
        icon: '🌭',
      };
    } else {
      return {
        badge: '🍬 參加獎',
        title: '再來一局！領取夜市彩虹棒棒糖！',
        color: 'text-rose-300',
        bg: 'bg-rose-500/20 border-rose-400',
        icon: '🍭',
      };
    }
  };

  const classicReward = getClassicTier();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#2a170c] border-3 border-amber-600 rounded-3xl shadow-2xl overflow-hidden p-6 text-center max-h-[92vh] overflow-y-auto">
        {/* Stall Header Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-500/60 px-4 py-1.5 rounded-full mb-3">
          <span className="text-sm">🏮</span>
          <span className="text-xs font-bold text-amber-300 tracking-wider">
            {gameMode === 'CLASSIC_10'
              ? '【經典十發包廂】結算'
              : gameMode === 'SPEED_RUSH'
              ? '【極速滑行狂暴】結算'
              : '【60秒限時挑戰】結算'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-200 mb-1">
          本局射擊結束！
        </h2>

        {/* In Classic 10 Mode: Highlight Prize Tier */}
        {gameMode === 'CLASSIC_10' && (
          <div
            className={`my-4 p-4 rounded-2xl border-2 ${classicReward.bg} flex items-center gap-4 text-left shadow-lg`}
          >
            <div className="text-4xl sm:text-5xl drop-shadow-md">
              {classicReward.icon}
            </div>
            <div>
              <span
                className={`text-xs font-black uppercase tracking-wider ${classicReward.color}`}
              >
                {classicReward.badge}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {classicReward.title}
              </h3>
              <p className="text-xs text-amber-200/70 mt-1">
                命中數: {stats.shotsHit} / 10 發 (命中率 {accuracy}%)
              </p>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">最終得分</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 tabular-nums">
              {stats.score}
            </span>
          </div>

          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">本局獲得彩票</span>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 tabular-nums">
                +{stats.ticketsEarnedThisRound}
              </span>
            </div>
          </div>

          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">射擊命中率</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">最高連擊</span>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-lg sm:text-xl font-black font-mono text-orange-400 tabular-nums">
                x{stats.maxCombo}
              </span>
            </div>
          </div>

          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">擊破氣球</span>
            <span className="text-lg sm:text-xl font-black font-mono text-rose-400 tabular-nums">
              {stats.balloonsPopped} 顆
            </span>
          </div>

          <div className="bg-[#1f1008] border border-amber-900/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-amber-400/80 font-bold">射中小鴨</span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-300 tabular-nums">
              {stats.ducksHit} 隻
            </span>
          </div>
        </div>

        {/* Google Sheets Score Upload Section */}
        <div className="my-3 p-3.5 rounded-2xl bg-[#1b0d06] border border-amber-800/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              同步戰績至 Google Sheets 雲端試算表
            </span>
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                查看英雄榜
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="輸入玩家暱稱"
              maxLength={12}
              className="flex-1 bg-black/60 border border-amber-700/80 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleUploadScore}
              disabled={isUploading || uploadStatus?.success}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>上傳中...</span>
                </>
              ) : uploadStatus?.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已記錄</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>送出紀錄</span>
                </>
              )}
            </button>
          </div>

          {/* Upload Status Message */}
          {uploadStatus && (
            <div
              className={`mt-2 text-[11px] p-2 rounded-lg flex items-start gap-1.5 ${
                uploadStatus.success
                  ? 'bg-emerald-950/80 border border-emerald-600/80 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-600/80 text-rose-300'
              }`}
            >
              {uploadStatus.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{uploadStatus.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再玩一局</span>
          </button>

          <button
            onClick={onOpenPrizeShop}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-950 hover:bg-amber-900 text-amber-200 border-2 border-amber-600/80 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>兌換獎品 ({stats.ticketsTotal}點)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
