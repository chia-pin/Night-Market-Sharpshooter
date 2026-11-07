/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GunStats, GameMode, GameStats, PrizeItem } from './types';
import { GUNS_CONFIG, INITIAL_PRIZES } from './utils/constants';
import { soundEngine } from './utils/audio';
import { ShootingGallery } from './components/ShootingGallery';
import { NightMarketHUD } from './components/NightMarketHUD';
import { PrizeShopModal } from './components/PrizeShopModal';
import { GameOverModal } from './components/GameOverModal';
import { InstructionsModal } from './components/InstructionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LoginModal, LoggedUser } from './components/LoginModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PrizeShelf } from './components/PrizeShelf';
import { Award, Crosshair, HelpCircle, RefreshCw, Trophy, User, Volume2, VolumeX } from 'lucide-react';

const STORAGE_KEY_USER = 'night_market_logged_user_v1';
const STORAGE_KEY_PRIZES = 'night_market_shooting_prizes_v1';
const STORAGE_KEY_TICKETS = 'night_market_shooting_tickets_v1';
const STORAGE_KEY_HIGHSCORE = 'night_market_shooting_highscore_v1';

export default function App() {
  // Player Login Authentication State
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Game Setup & Mode
  const [gameMode, setGameMode] = useState<GameMode>('TIMED');
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return Boolean(saved);
    } catch {
      return false;
    }
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [shotsLeft, setShotsLeft] = useState<number>(10);

  // Weapon & Ammo
  const [currentGun, setCurrentGun] = useState<GunStats>(GUNS_CONFIG.CORK_GUN);
  const [ammo, setAmmo] = useState<number>(GUNS_CONFIG.CORK_GUN.capacity);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Audio Status
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return !saved;
    } catch {
      return true;
    }
  });
  const [isPrizeShopOpen, setIsPrizeShopOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Persistent Saved Prizes & Tickets
  const [prizes, setPrizes] = useState<PrizeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRIZES);
      return saved ? JSON.parse(saved) : INITIAL_PRIZES;
    } catch {
      return INITIAL_PRIZES;
    }
  });

  const [savedTickets, setSavedTickets] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      return saved ? parseInt(saved, 10) : 120; // Welcome starter bonus tickets!
    } catch {
      return 120;
    }
  });

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGHSCORE);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Active Round Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: highScore,
    shotsFired: 0,
    shotsHit: 0,
    maxCombo: 0,
    currentCombo: 0,
    ticketsTotal: savedTickets,
    ticketsEarnedThisRound: 0,
    balloonsPopped: 0,
    ducksHit: 0,
    feverGauge: 0,
    isFever: false,
    feverTimeRemaining: 0,
  });

  // Save tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, stats.ticketsTotal.toString());
    } catch {}
  }, [stats.ticketsTotal]);

  // Save prizes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRIZES, JSON.stringify(prizes));
    } catch {}
  }, [prizes]);

  // Save HighScore
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      try {
        localStorage.setItem(STORAGE_KEY_HIGHSCORE, stats.score.toString());
      } catch {}
    }
  }, [stats.score, highScore]);

  // Auth Handlers
  const handleLoginSuccess = useCallback((user: LoggedUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {}
    setIsPlaying(true);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
    setIsPlaying(false);
    setIsLoginModalOpen(true);
  }, []);

  // Restart / Reset Round
  const restartGame = useCallback((mode: GameMode = gameMode) => {
    setIsGameOver(false);
    setIsPlaying(Boolean(currentUser));
    setGameMode(mode);
    setTimeRemaining(mode === 'SPEED_RUSH' ? 45 : 60);
    setShotsLeft(10);
    setAmmo(currentGun.capacity);
    setIsReloading(false);

    setStats(prev => ({
      ...prev,
      score: 0,
      shotsFired: 0,
      shotsHit: 0,
      maxCombo: 0,
      currentCombo: 0,
      ticketsEarnedThisRound: 0,
      balloonsPopped: 0,
      ducksHit: 0,
      feverGauge: 0,
      isFever: false,
      feverTimeRemaining: 0,
    }));
  }, [gameMode, currentGun.capacity, currentUser]);

  // Trigger End of Round
  const triggerGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    soundEngine.playPrizeRedeemed();

    setStats(prev => {
      // Calculate Tickets reward based on performance
      let earned = 0;
      if (gameMode === 'CLASSIC_10') {
        if (prev.shotsHit >= 10) earned = 250;
        else if (prev.shotsHit >= 8) earned = 180;
        else if (prev.shotsHit >= 6) earned = 120;
        else if (prev.shotsHit >= 4) earned = 70;
        else earned = 30;
      } else {
        earned = Math.max(20, Math.floor(prev.score / 25) + prev.maxCombo * 5);
      }

      return {
        ...prev,
        ticketsEarnedThisRound: earned,
        ticketsTotal: prev.ticketsTotal + earned,
      };
    });
  }, [gameMode]);

  // Timer Tick Loop for TIMED and SPEED_RUSH modes
  useEffect(() => {
    if (!isPlaying || isGameOver || gameMode === 'CLASSIC_10') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, gameMode, triggerGameOver]);

  // Fever Gauge Countdown Loop
  useEffect(() => {
    if (!stats.isFever) return;

    const interval = setInterval(() => {
      setStats(prev => {
        if (prev.feverTimeRemaining <= 0.1) {
          return {
            ...prev,
            isFever: false,
            feverGauge: 0,
            feverTimeRemaining: 0,
          };
        }
        const remaining = prev.feverTimeRemaining - 0.1;
        return {
          ...prev,
          feverTimeRemaining: remaining,
          feverGauge: (remaining / 8.0) * 100,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stats.isFever]);

  // Gun Reload handler
  const handleReload = useCallback(() => {
    if (isReloading || ammo === currentGun.capacity) return;
    setIsReloading(true);
    soundEngine.playReload();

    setTimeout(() => {
      setAmmo(currentGun.capacity);
      setIsReloading(false);
    }, currentGun.reloadTimeMs);
  }, [isReloading, ammo, currentGun]);

  // Handle Gun Shoot Result
  const handleShoot = useCallback(
    (hit: boolean, scoreGained: number, targetType?: string) => {
      if (!isPlaying || isGameOver) return;

      // Deduct ammo
      setAmmo(prev => Math.max(0, prev - 1));

      // In Classic 10 mode, deduct shot
      if (gameMode === 'CLASSIC_10') {
        setShotsLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => triggerGameOver(), 400);
          }
          return Math.max(0, next);
        });
      }

      // Update round stats
      setStats(prev => {
        const newShotsFired = prev.shotsFired + 1;
        const newShotsHit = hit ? prev.shotsHit + 1 : prev.shotsHit;
        const newScore = Math.max(0, prev.score + scoreGained);

        // Combo logic
        let newCombo = prev.currentCombo;
        let newMaxCombo = prev.maxCombo;

        if (hit && targetType !== 'BOMB_FIRECRACKER') {
          newCombo += 1;
          if (newCombo > newMaxCombo) {
            newMaxCombo = newCombo;
          }
        } else {
          newCombo = 0;
        }

        // Count balloons & ducks
        let newBalloons = prev.balloonsPopped;
        let newDucks = prev.ducksHit;
        if (hit && targetType) {
          if (targetType.includes('BALLOON')) newBalloons += 1;
          if (targetType.includes('DUCK')) newDucks += 1;
          if (targetType === 'BOBA_BONUS') {
            // Boba gives instant ammo refill!
            setAmmo(currentGun.capacity);
          }
        }

        // Fever gauge increment
        let newFeverGauge = prev.feverGauge;
        let isNowFever = prev.isFever;
        let feverTimeRemaining = prev.feverTimeRemaining;

        if (hit && !prev.isFever && targetType !== 'BOMB_FIRECRACKER') {
          const bonus = targetType === 'DUCK_GOLDEN' ? 40 : 12;
          newFeverGauge = Math.min(100, newFeverGauge + bonus);
          if (newFeverGauge >= 100) {
            isNowFever = true;
            feverTimeRemaining = 8.0;
            soundEngine.playGoldenHit();
          }
        }

        return {
          ...prev,
          score: newScore,
          shotsFired: newShotsFired,
          shotsHit: newShotsHit,
          currentCombo: newCombo,
          maxCombo: newMaxCombo,
          balloonsPopped: newBalloons,
          ducksHit: newDucks,
          feverGauge: newFeverGauge,
          isFever: isNowFever,
          feverTimeRemaining,
        };
      });
    },
    [isPlaying, isGameOver, gameMode, currentGun.capacity, triggerGameOver]
  );

  // Trigger Fever mode directly (from golden duck hit or bonus)
  const triggerFever = useCallback(() => {
    setStats(prev => ({
      ...prev,
      isFever: true,
      feverGauge: 100,
      feverTimeRemaining: 8.0,
    }));
  }, []);

  // Weapon switch handler & notification toast
  const [weaponToast, setWeaponToast] = useState<string | null>(null);

  const handleSelectGun = (gun: GunStats) => {
    setCurrentGun(gun);
    setAmmo(gun.capacity);
    setIsReloading(false);
    soundEngine.playReload();
    setWeaponToast(`已裝備：${gun.icon} ${gun.name}（容量 ${gun.capacity} 發）`);
    setTimeout(() => setWeaponToast(null), 1400);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleReload();
      } else if (e.key === '1') {
        handleSelectGun(GUNS_CONFIG.CORK_GUN);
      } else if (e.key === '2') {
        handleSelectGun(GUNS_CONFIG.BB_RIFLE);
      } else if (e.key === '3') {
        handleSelectGun(GUNS_CONFIG.DARTS);
      } else if (e.key === '4') {
        handleSelectGun(GUNS_CONFIG.LASER_PISTOL);
      } else if (e.key === 'Escape') {
        setIsPrizeShopOpen(false);
        setIsInstructionsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReload]);

  // Sound Controls
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundEngine.setMuted(newMuted);
  };

  const toggleBGM = () => {
    const active = soundEngine.toggleBGM();
    setIsBgmOn(active);
  };

  // Redeem prize in shop
  const handleRedeemPrize = (prizeId: string) => {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || stats.ticketsTotal < prize.costTickets) return;

    // Deduct tickets
    setStats(prev => ({
      ...prev,
      ticketsTotal: prev.ticketsTotal - prize.costTickets,
    }));

    // Increment item count
    setPrizes(prev =>
      prev.map(p =>
        p.id === prizeId ? { ...p, unlockedCount: p.unlockedCount + 1 } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#180a04] text-slate-100 flex flex-col items-center select-none pb-12">
      {/* 1. Universal Top Bar Contract (1-line Brand wordmark, concise links, 1 primary action) */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-amber-900/60 bg-[#221006]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏮</span>
          <a
            href="/"
            className="text-lg sm:text-xl font-black tracking-tight text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap drop-shadow"
          >
            夜市神射手 · 射氣球打靶
          </a>
        </div>

        {/* Zone 2: Concise navigation items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-amber-200/80">
          <button
            onClick={() => restartGame('TIMED')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'TIMED' ? 'text-amber-400 font-black' : ''
            }`}
          >
            60秒限時挑戰
          </button>
          <button
            onClick={() => restartGame('CLASSIC_10')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'CLASSIC_10' ? 'text-amber-400 font-black' : ''
            }`}
          >
            十發送大娃娃
          </button>
          <button
            onClick={() => restartGame('SPEED_RUSH')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'SPEED_RUSH' ? 'text-amber-400 font-black' : ''
            }`}
          >
            橫向滑行極速
          </button>
          <button
            onClick={() => setIsInstructionsOpen(true)}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>玩法說明</span>
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-emerald-300/90 hover:text-emerald-200"
            title="Google Sheets 雲端英雄榜"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>雲端英雄榜</span>
          </button>
        </nav>

        {/* Zone 3: Player Profile & PWA & Prize Counter */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <PWAInstallButton />

          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#2d160b] border border-amber-600/70 rounded-xl px-2.5 py-1 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-amber-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-300 max-w-[80px] sm:max-w-[140px] truncate">
                  {currentUser.username}
                </span>
                {currentUser.isGuest && (
                  <span className="text-[10px] bg-amber-900/80 text-amber-300 px-1 rounded">試玩</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] text-amber-400 hover:text-amber-200 underline ml-0.5 cursor-pointer"
                title="登出或更換帳號"
              >
                登出
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>登入</span>
            </button>
          )}

          <button
            onClick={() => setIsPrizeShopOpen(true)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-950" />
            <span className="whitespace-nowrap">獎品兌換</span>
            <span className="bg-amber-900/30 text-amber-950 px-1.5 py-0.5 rounded text-xs font-mono">
              {stats.ticketsTotal}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Main Carnival Arena Container */}
      <main className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex flex-col gap-4">
        {/* Night Market HUD Bar */}
        <NightMarketHUD
          stats={stats}
          currentGun={currentGun}
          ammo={ammo}
          isReloading={isReloading}
          gameMode={gameMode}
          timeRemaining={timeRemaining}
          shotsLeft={shotsLeft}
          isMuted={isMuted}
          isBgmOn={isBgmOn}
          onSelectGun={handleSelectGun}
          onReload={handleReload}
          onToggleMute={toggleMute}
          onToggleBGM={toggleBGM}
          onOpenPrizeShop={() => setIsPrizeShopOpen(true)}
          onOpenInstructions={() => setIsInstructionsOpen(true)}
          onRestartGame={() => restartGame()}
          onChangeMode={mode => restartGame(mode)}
        />

        {/* The Heart of the Game: Night Market Shooting Gallery Stall */}
        <div className="relative w-full">
          {/* Weapon Switch Toast Banner */}
          {weaponToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
              <div className="bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-1.5">
                <span>{weaponToast}</span>
              </div>
            </div>
          )}

          <ShootingGallery
            currentGun={currentGun}
            ammo={ammo}
            isReloading={isReloading}
            gameMode={gameMode}
            isPlaying={isPlaying && Boolean(currentUser)}
            isFever={stats.isFever}
            onShoot={handleShoot}
            onReloadRequested={handleReload}
            combo={stats.currentCombo}
            onFeverTriggered={triggerFever}
            isLoggedIn={Boolean(currentUser)}
            onRequireLogin={() => setIsLoginModalOpen(true)}
          />
        </div>

        {/* Quick Tips / Keyboard Legend bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-amber-300/80 bg-[#241309] border border-amber-900/60 rounded-xl px-4 py-2 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>點擊/點按發射</span>
            </span>
            <span className="text-amber-800">·</span>
            <span>按 <strong className="text-amber-200">[R]</strong> 裝填子彈</span>
            <span className="text-amber-800">·</span>
            <span className="hidden sm:inline">數字鍵 <strong className="text-amber-200">[1-4]</strong> 切換槍枝</span>
          </div>

          <div className="flex items-center gap-3 text-amber-200/90 font-medium">
            <span>歷史最高分: <strong className="font-mono text-amber-400">{highScore}</strong></span>
            <span className="text-amber-800">·</span>
            <button
              onClick={() => restartGame()}
              className="text-amber-400 hover:text-white underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>新一局</span>
            </button>
          </div>
        </div>

        {/* 3. Player's Prize Showcase Shelf */}
        <PrizeShelf
          prizes={prizes}
          onOpenPrizeShop={() => setIsPrizeShopOpen(true)}
        />
      </main>

      {/* 4. Modals */}
      {/* Prize Shop Modal */}
      <PrizeShopModal
        isOpen={isPrizeShopOpen}
        onClose={() => setIsPrizeShopOpen(false)}
        prizes={prizes}
        tickets={stats.ticketsTotal}
        onRedeemPrize={handleRedeemPrize}
      />

      {/* Game Over Summary Modal */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode={gameMode}
        stats={stats}
        gunName={currentGun.name}
        playerName={currentUser?.username}
        onPlayAgain={() => restartGame()}
        onOpenPrizeShop={() => {
          setIsGameOver(false);
          setIsPrizeShopOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Google Sheets Cloud Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Google Sheets Player Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
        canDismiss={Boolean(currentUser)}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
