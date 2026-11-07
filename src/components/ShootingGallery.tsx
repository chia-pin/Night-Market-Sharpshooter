/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TargetEntity, GunStats, GameMode, Particle, BulletHole } from '../types';
import { TargetSprite } from './TargetSprite';
import { GunViewModel } from './GunViewModel';
import { soundEngine } from '../utils/audio';

interface ShootingGalleryProps {
  currentGun: GunStats;
  ammo: number;
  isReloading: boolean;
  gameMode: GameMode;
  isPlaying: boolean;
  isFever: boolean;
  onShoot: (hit: boolean, scoreGained: number, targetType?: string) => void;
  onReloadRequested: () => void;
  combo: number;
  onFeverTriggered: () => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const ShootingGallery: React.FC<ShootingGalleryProps> = ({
  currentGun,
  ammo,
  isReloading,
  gameMode,
  isPlaying,
  isFever,
  onShoot,
  onReloadRequested,
  combo,
  onFeverTriggered,
  isLoggedIn = true,
  onRequireLogin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active targets on screen
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  // Open status for the 3 booth windows in 1 row [w0..w2]
  const [openWindows, setOpenWindows] = useState<boolean[]>([false, false, false]);

  // Visual effects
  const particlesRef = useRef<Particle[]>([]);
  const bulletHolesRef = useRef<BulletHole[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Mouse & Gun orientation
  const [mousePos, setMousePos] = useState({ x: 500, y: 350 });
  const [isGunRecoiling, setIsGunRecoiling] = useState(false);
  const lastShotTimeRef = useRef<number>(0);

  // Keep references for animation frame loop
  const targetsRef = useRef<TargetEntity[]>([]);
  targetsRef.current = targets;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const isFeverRef = useRef(isFever);
  isFeverRef.current = isFever;

  // Add particles helper
  const addParticles = useCallback((x: number, y: number, type: 'shard' | 'feather' | 'sparkle' | 'smoke' | 'score' | 'bubble', color: string, count: number, text?: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 5 + 2;
      newParticles.push({
        id: Math.random() + Date.now(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'feather' ? 1 : 2),
        color,
        size: type === 'score' ? 20 : Math.random() * 8 + 4,
        alpha: 1,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: type === 'score' ? 50 : type === 'feather' ? 65 : 35,
        type,
        text,
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  // Spawn Target Helper
  const spawnTarget = useCallback(() => {
    if (!isPlayingRef.current) return;

    // Pick location:
    // 0..2 = Lower Shutter Windows (1 row across: pop up or slide across)
    // -1 = Top Conveyor track (slides horizontally all the way)
    const randLoc = Math.random();
    let windowIndex = -1;
    if (randLoc < 0.65) {
      // Pick a window in the row (0..2)
      windowIndex = Math.floor(Math.random() * 3);
    } else {
      windowIndex = -1; // Top conveyor
    }

    // Don't spawn in an already occupied window
    if (windowIndex >= 0 && targetsRef.current.some(t => t.windowIndex === windowIndex && !t.retracting)) {
      return;
    }

    // Pick target type
    const feverBonus = isFeverRef.current;
    const typeRoll = Math.random();
    let type: TargetEntity['type'] = 'BALLOON_RED';
    let scoreValue = 80;
    let maxHealth = 1;

    if (feverBonus) {
      if (typeRoll < 0.45) {
        type = 'DUCK_GOLDEN';
        scoreValue = 350;
      } else if (typeRoll < 0.75) {
        type = 'BALLOON_RAINBOW';
        scoreValue = 250;
      } else {
        type = 'BULLSEYE_WOOD';
        scoreValue = 200;
      }
    } else {
      if (typeRoll < 0.22) {
        type = 'DUCK_YELLOW';
        scoreValue = 120;
      } else if (typeRoll < 0.35) {
        type = 'DUCK_HELMET';
        scoreValue = 200;
        maxHealth = 2;
      } else if (typeRoll < 0.43) {
        type = 'DUCK_GOLDEN';
        scoreValue = 350;
      } else if (typeRoll < 0.55) {
        type = 'BULLSEYE_WOOD';
        scoreValue = 180;
      } else if (typeRoll < 0.67) {
        type = 'BALLOON_BLUE';
        scoreValue = 90;
      } else if (typeRoll < 0.78) {
        type = 'BALLOON_PURPLE';
        scoreValue = 100;
      } else if (typeRoll < 0.86) {
        type = 'BALLOON_GREEN';
        scoreValue = 80;
      } else if (typeRoll < 0.93) {
        type = 'BOMB_FIRECRACKER';
        scoreValue = -150;
      } else {
        type = 'BOBA_BONUS';
        scoreValue = 150;
      }
    }

    // Choose behavior:
    // If windowIndex is -1, it slides horizontally across top conveyor!
    // If middle window (0..5), can either slide horizontally across window or pop up!
    let behavior: TargetEntity['behavior'] = 'POP_UP';
    let xPercent = 50;
    let speed = 0;
    let durationMs = 1600 + Math.random() * 800; // 1.6s ~ 2.4s

    if (windowIndex === -1) {
      // Top conveyor: slides from left to right or right to left
      const goRight = Math.random() > 0.5;
      behavior = 'CONVEYOR';
      xPercent = goRight ? -10 : 110;
      speed = (goRight ? 1 : -1) * (type === 'DUCK_GOLDEN' ? 1.6 : 0.9 + Math.random() * 0.5);
      durationMs = 5500;
    } else {
      // Middle window
      const slideAcross = Math.random() > 0.45;
      if (slideAcross) {
        const goRight = Math.random() > 0.5;
        behavior = goRight ? 'SLIDE_RIGHT' : 'SLIDE_LEFT';
        xPercent = goRight ? -15 : 115;
        speed = (goRight ? 1 : -1) * (0.8 + Math.random() * 0.7);
        durationMs = 2800;
      } else {
        behavior = 'POP_UP';
        xPercent = 35 + Math.random() * 30;
        speed = 0;
        durationMs = (type === 'DUCK_GOLDEN' ? 1200 : 1700 + Math.random() * 900);
      }
      // Open window shutter!
      setOpenWindows(prev => {
        const next = [...prev];
        next[windowIndex] = true;
        return next;
      });
    }

    const newTarget: TargetEntity = {
      id: `target_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      windowIndex,
      behavior,
      xPercent,
      yPercent: windowIndex === -1 ? 4 : 8,
      spawnTime: Date.now(),
      durationMs,
      speed,
      health: maxHealth,
      maxHealth,
      hit: false,
      retracting: false,
      scoreValue,
    };

    setTargets(prev => [...prev, newTarget]);
  }, []);

  // Main Target Tick & Movement Loop
  useEffect(() => {
    if (!isPlaying) {
      setTargets([]);
      setOpenWindows([false, false, false]);
      return;
    }

    const interval = setInterval(() => {
      // Check target count limit (around 4-7 simultaneous targets)
      const maxTargets = isFever ? 7 : gameMode === 'SPEED_RUSH' ? 6 : 5;
      if (targetsRef.current.length < maxTargets) {
        spawnTarget();
      }
    }, isFever ? 450 : gameMode === 'SPEED_RUSH' ? 550 : 750);

    return () => clearInterval(interval);
  }, [isPlaying, isFever, gameMode, spawnTarget]);

  // Update target positions & close windows when retracted
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const now = Date.now();
      const windowsInUse = new Set<number>();

      setTargets(prevTargets => {
        const nextTargets: TargetEntity[] = [];

        for (const target of prevTargets) {
          // If already marked hit, fade out shortly
          if (target.hit) {
            if (now - target.spawnTime < 300) {
              nextTargets.push(target);
            }
            continue;
          }

          // Check if lifetime expired
          const elapsed = now - target.spawnTime;
          if (elapsed >= target.durationMs) {
            // Retract target
            target.retracting = true;
            continue;
          }

          // Move horizontally if sliding
          if (target.behavior === 'SLIDE_RIGHT' || target.behavior === 'SLIDE_LEFT' || target.behavior === 'CONVEYOR') {
            target.xPercent += target.speed;
            // Check boundary
            if ((target.speed > 0 && target.xPercent > 120) || (target.speed < 0 && target.xPercent < -20)) {
              continue;
            }
          }

          if (target.windowIndex >= 0) {
            windowsInUse.add(target.windowIndex);
          }

          nextTargets.push(target);
        }

        return nextTargets;
      });

      // Update window shutters
      setOpenWindows(prev => {
        let changed = false;
        const next = prev.map((isOpen, idx) => {
          const shouldBeOpen = windowsInUse.has(idx);
          if (isOpen !== shouldBeOpen) changed = true;
          return shouldBeOpen;
        });
        return changed ? next : prev;
      });

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Particle Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render bullet holes / dents
      const remainingHoles: BulletHole[] = [];
      for (const hole of bulletHolesRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, hole.alpha);
        if (hole.type === 'cork_dent') {
          ctx.beginPath();
          ctx.arc(hole.x, hole.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#451A03';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#1C1917';
          ctx.stroke();
        } else if (hole.type === 'bb_hole') {
          ctx.beginPath();
          ctx.arc(hole.x, hole.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0F172A';
          ctx.fill();
        } else if (hole.type === 'dart_pin') {
          ctx.beginPath();
          ctx.arc(hole.x, hole.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
        } else {
          // laser burn
          ctx.beginPath();
          ctx.arc(hole.x, hole.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#06B6D4';
          ctx.fill();
        }
        ctx.restore();

        // Slow fade out of bullet holes after many shots
        hole.alpha -= 0.001;
        if (hole.alpha > 0.1) {
          remainingHoles.push(hole);
        }
      }
      bulletHolesRef.current = remainingHoles;

      // Render particles
      const remainingParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.type === 'shard') {
          p.vy += 0.25; // gravity
        } else if (p.type === 'feather') {
          p.vy += 0.08;
          p.vx += Math.sin(p.life * 0.1) * 0.2; // wobble
        } else if (p.type === 'score') {
          p.vy = -1.2;
        }

        const progress = p.life / p.maxLife;
        p.alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.type === 'score' && p.text) {
          ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText(p.text, 0, 0);
        } else if (p.type === 'feather') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'shard') {
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'sparkle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        } else if (p.type === 'smoke') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * (1 + progress), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
          ctx.fill();
        }

        ctx.restore();

        if (p.life < p.maxLife) {
          remainingParticles.push(p);
        }
      }
      particlesRef.current = remainingParticles;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Movement tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Touch Move tracker
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  // Perform Gun Shot
  const executeShot = (clickX: number, clickY: number) => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < currentGun.fireCooldownMs) return;
    lastShotTimeRef.current = now;

    // Check Ammo
    if (ammo <= 0) {
      soundEngine.playTargetHit(false);
      onReloadRequested();
      return;
    }

    // Trigger Gun Audio
    switch (currentGun.id) {
      case 'CORK_GUN':
        soundEngine.playCorkGunShoot();
        break;
      case 'BB_RIFLE':
        soundEngine.playBBShoot();
        break;
      case 'DARTS':
        soundEngine.playDartThrow();
        break;
      case 'LASER_PISTOL':
        soundEngine.playLaserShoot();
        break;
    }

    // Recoil animation & Mobile Haptic Vibration
    setIsGunRecoiling(true);
    setTimeout(() => setIsGunRecoiling(false), 90);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(18); } catch {}
    }

    // Muzzle smoke particle
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      addParticles(w * 0.5 + 40, h - 30, 'smoke', '#94A3B8', 3);
    }

    // Hit Testing against active targets
    if (!containerRef.current) return;
    const galleryRect = containerRef.current.getBoundingClientRect();

    let hitTarget: TargetEntity | null = null;
    let hitElementCenter = { x: clickX, y: clickY };

    // Search targets in reverse order (topmost first)
    for (const target of [...targetsRef.current].reverse()) {
      if (target.hit || target.retracting) continue;

      // Find element in DOM by target id or test bounding box
      const el = document.getElementById(target.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Convert to gallery-relative coords
        const elLeft = rect.left - galleryRect.left;
        const elRight = rect.right - galleryRect.left;
        const elTop = rect.top - galleryRect.top;
        const elBottom = rect.bottom - galleryRect.top;

        // Expanded hitbox for good arcade feel (extra 10px cushion)
        if (
          clickX >= elLeft - 10 &&
          clickX <= elRight + 10 &&
          clickY >= elTop - 10 &&
          clickY <= elBottom + 10
        ) {
          hitTarget = target;
          hitElementCenter = {
            x: (elLeft + elRight) / 2,
            y: (elTop + elBottom) / 2,
          };
          break;
        }
      }
    }

    if (hitTarget) {
      // Process Hit
      handleTargetHit(hitTarget, hitElementCenter.x, hitElementCenter.y);
    } else {
      // Shot Missed
      onShoot(false, 0);

      // Add bullet hole mark on the booth backboard
      const holeType =
        currentGun.id === 'CORK_GUN'
          ? 'cork_dent'
          : currentGun.id === 'BB_RIFLE'
          ? 'bb_hole'
          : currentGun.id === 'DARTS'
          ? 'dart_pin'
          : 'laser_burn';

      bulletHolesRef.current.push({
        id: Math.random(),
        x: clickX,
        y: clickY,
        alpha: 0.9,
        type: holeType,
      });

      // Miss particle
      addParticles(clickX, clickY, 'smoke', '#E2E8F0', 2, 'MISS');
    }
  };

  // Handle direct click / touch on a target
  const handleTargetHit = (target: TargetEntity, hitX: number, hitY: number) => {
    target.health -= currentGun.damage;

    if (target.health > 0) {
      // Multi-hit target (like helmet duck) took damage but not dead yet
      soundEngine.playTargetHit(false);
      addParticles(hitX, hitY, 'sparkle', '#38BDF8', 6, 'SHIELD -1');
      return;
    }

    // Defeated!
    target.hit = true;

    // Calculate score with combo multiplier
    const comboMultiplier = isFever ? 2.0 : 1.0 + Math.min(combo * 0.1, 1.5);
    const finalScore = Math.round(target.scoreValue * comboMultiplier);

    // Audio & Particle FX based on type
    if (target.type === 'BOMB_FIRECRACKER') {
      soundEngine.playBombExplode();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 250);
      addParticles(hitX, hitY, 'shard', '#DC2626', 18);
      addParticles(hitX, hitY, 'smoke', '#451A03', 10, '-150 💥');
    } else if (target.type.includes('BALLOON')) {
      soundEngine.playBalloonPop();
      const color =
        target.type === 'BALLOON_RED'
          ? '#EF4444'
          : target.type === 'BALLOON_BLUE'
          ? '#3B82F6'
          : target.type === 'BALLOON_GREEN'
          ? '#10B981'
          : target.type === 'BALLOON_PURPLE'
          ? '#A855F7'
          : '#F43F5E';

      addParticles(hitX, hitY, 'shard', color, 16);
      addParticles(hitX, hitY, 'score', color, 1, `+${finalScore}`);

      if (target.type === 'BALLOON_RAINBOW') {
        soundEngine.playGoldenHit();
        addParticles(hitX, hitY, 'sparkle', '#FDE047', 20, 'FEVER BOOST!');
      }
    } else if (target.type.includes('DUCK')) {
      if (target.type === 'DUCK_GOLDEN') {
        soundEngine.playGoldenHit();
        addParticles(hitX, hitY, 'sparkle', '#FBBF24', 25, `✨ +${finalScore}`);
        onFeverTriggered();
      } else {
        soundEngine.playDuckQuack();
        addParticles(hitX, hitY, 'feather', '#FCD34D', 14);
        addParticles(hitX, hitY, 'score', '#F59E0B', 1, `+${finalScore}`);
      }
    } else if (target.type === 'BULLSEYE_WOOD') {
      soundEngine.playTargetHit(true);
      addParticles(hitX, hitY, 'sparkle', '#EF4444', 12);
      addParticles(hitX, hitY, 'score', '#EF4444', 1, `🎯 +${finalScore}`);
    } else if (target.type === 'BOBA_BONUS') {
      soundEngine.playPrizeRedeemed();
      addParticles(hitX, hitY, 'bubble', '#D97706', 15, '🧋 +AMMO!');
    }

    // Play ascending combo tone
    if (target.type !== 'BOMB_FIRECRACKER' && combo > 0) {
      soundEngine.playComboFanfare(combo + 1);
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([25, 20, 20]); } catch {}
    }

    onShoot(true, finalScore, target.type);
  };

  // Background Click Handler
  const handleBoothClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      onRequireLogin?.();
      return;
    }
    if (!isPlaying) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    executeShot(x, y);
  };

  // Touch Handler
  const handleBoothTouch = (e: React.TouchEvent) => {
    if (!isLoggedIn) {
      onRequireLogin?.();
      return;
    }
    if (!isPlaying) return;
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setMousePos({ x, y });
    executeShot(x, y);
  };

  // Group targets by window
  const topConveyorTargets = targets.filter(t => t.windowIndex === -1);
  const windowTargets = (idx: number) => targets.filter(t => t.windowIndex === idx);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleBoothClick}
      onTouchStart={handleBoothTouch}
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9.5] max-h-[640px] bg-slate-900 rounded-2xl overflow-hidden select-none cursor-crosshair shadow-2xl border-4 border-amber-950 transition-transform ${
        screenShake ? 'translate-x-1.5 translate-y-1 rotate-0.5' : ''
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* 1. Carnival Stall Awning (紅白/紅黃相間夜市帳篷布頂與彩燈) */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        {/* Striped valance */}
        <div className="h-9 sm:h-12 w-full flex shadow-lg">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${
                i % 2 === 0 ? 'bg-red-600' : 'bg-amber-400'
              } border-r border-red-700/40 relative`}
            >
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-amber-950/20 rounded-b-md" />
            </div>
          ))}
        </div>

        {/* Glowing Festoon Light Bulbs */}
        <div className="absolute top-8 sm:top-10 left-0 right-0 flex justify-around px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-0.5 h-2.5 sm:h-3.5 bg-slate-800" />
              <div
                className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full ${
                  isFever
                    ? i % 3 === 0
                      ? 'bg-fuchsia-400 animate-pulse'
                      : i % 3 === 1
                      ? 'bg-amber-300 animate-pulse'
                      : 'bg-cyan-300 animate-pulse'
                    : 'bg-amber-300 animate-bulb-glow'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Night Market Signplate */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-900/90 border-2 border-amber-400 px-5 py-0.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase neon-title">
            ★ 夜市射氣球 · 神射手挑戰 ★
          </span>
        </div>
      </div>

      {/* 2. Booth Interior Wooden Paneling Background */}
      <div
        className="absolute inset-0 bg-[#3c2415] bg-opacity-95"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.15), transparent 70%),
            repeating-linear-gradient(0deg, #2b180d, #2b180d 28px, #361f12 28px, #361f12 30px)
          `,
        }}
      />

      {/* 3. Upper Track: Mechanical Duck Conveyor Window (上層滑動窗 - 加高完整呈現物件) */}
      <div className="absolute top-11 sm:top-13 left-5 sm:left-6 right-5 sm:right-6 h-28 sm:h-34 bg-[#201007] border-2 border-amber-800/80 rounded-xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Track side tunnel exit/entrance vignettes */}
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none z-15" />
        <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-10 bg-gradient-to-l from-black/90 via-black/40 to-transparent pointer-events-none z-15" />

        {/* Double metal rail lines */}
        <div className="absolute bottom-2.5 left-0 right-0 h-2 bg-gradient-to-b from-zinc-400 via-zinc-300 to-zinc-600 border-t border-zinc-200 shadow" />
        <div className="absolute bottom-1.5 left-0 right-0 h-0.5 bg-zinc-800/70" />

        {/* Track neon indicator */}
        <div className="absolute top-1.5 left-3 text-[10px] text-amber-400/90 font-bold tracking-wider select-none z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          上層輸送軌道 (持續橫向滑過)
        </div>

        {/* Conveyor Targets */}
        {topConveyorTargets.map(t => (
          <div key={t.id} id={t.id} className="absolute inset-0 pointer-events-none">
            <TargetSprite target={t} onHit={(_, target) => {
              if (containerRef.current) {
                const el = document.getElementById(target.id);
                if (el) {
                  const r = el.getBoundingClientRect();
                  const cr = containerRef.current.getBoundingClientRect();
                  handleTargetHit(target, (r.left + r.right) / 2 - cr.left, (r.top + r.bottom) / 2 - cr.top);
                }
              }
            }} />
          </div>
        ))}
      </div>

      {/* 4. Lower Section: 1 Row of Shutter Windows (一排百葉木窗，手機橫向畫面上下空間充裕) */}
      <div className="absolute top-[150px] sm:top-[182px] bottom-8 sm:bottom-9 left-5 sm:left-6 right-5 sm:right-6 grid grid-cols-3 grid-rows-1 gap-3 sm:gap-4 md:gap-5">
        {[0, 1, 2].map(idx => {
          const isOpen = openWindows[idx];
          const targetsInThisWindow = windowTargets(idx);

          return (
            <div
              key={idx}
              className="relative bg-[#1c0d05] border-3 sm:border-4 border-[#61361b] rounded-xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] overflow-hidden flex items-end justify-center group"
            >
              {/* Window sill lighting & shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-black/60 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#4a2712] border-t border-amber-700/60 shadow" />

              {/* Window Number Plaque */}
              <div className="absolute top-1 left-1.5 w-4 h-4 rounded-full bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-[9px] font-bold text-amber-300 select-none">
                {idx + 1}
              </div>

              {/* Left & Right Wooden Shutters (百葉木窗隨機開合) */}
              <div
                className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#522c15] border-r border-[#341808] transition-transform duration-200 z-10 origin-left flex flex-col justify-around py-1 shadow-md ${
                  isOpen ? '-rotate-y-90 scale-x-10 opacity-30' : 'rotate-y-0 opacity-100'
                }`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, #43220f, #43220f 8px, #522c15 8px, #522c15 12px)',
                }}
              />
              <div
                className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#522c15] border-l border-[#341808] transition-transform duration-200 z-10 origin-right flex flex-col justify-around py-1 shadow-md ${
                  isOpen ? 'rotate-y-90 scale-x-10 opacity-30' : 'rotate-y-0 opacity-100'
                }`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, #43220f, #43220f 8px, #522c15 8px, #522c15 12px)',
                }}
              />

              {/* Targets inside this window */}
              {targetsInThisWindow.map(t => (
                <div key={t.id} id={t.id} className="absolute inset-0 pointer-events-none">
                  <TargetSprite target={t} onHit={(_, target) => {
                    if (containerRef.current) {
                      const el = document.getElementById(target.id);
                      if (el) {
                        const r = el.getBoundingClientRect();
                        const cr = containerRef.current.getBoundingClientRect();
                        handleTargetHit(target, (r.left + r.right) / 2 - cr.left, (r.top + r.bottom) / 2 - cr.top);
                      }
                    }
                  }} />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 6. Front Counter Wooden Bar (夜市攤位前緣櫃台) */}
      <div className="absolute bottom-0 left-0 right-0 h-7 sm:h-8 bg-[#4e2712] border-t-2 border-amber-600 shadow-2xl flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base">{currentGun.icon}</span>
          <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider">
            {currentGun.name}
          </span>
          <span className="text-xs text-amber-200/80 font-mono font-bold">
            · {ammo > 0 ? `餘彈 ${ammo} / ${currentGun.capacity} 發` : '⚠️ 無子彈！請按 [R] 裝填'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFever && (
            <span className="text-xs font-black text-amber-300 animate-pulse bg-red-600/80 px-2 py-0.5 rounded">
              🔥 狂熱 2x 雙倍爆擊中！
            </span>
          )}
          <span className="text-[11px] text-amber-300/80 font-medium hidden sm:inline">
            快捷鍵 [1-4] 可即時切換不同武器外觀
          </span>
        </div>
      </div>

      {/* 7. Canvas Overlay for Particles, Bullet Marks & Shards */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-25 pointer-events-none"
      />

      {/* 8. Distinct Gun View Model for Each Weapon Type */}
      <GunViewModel
        gunId={currentGun.id}
        isRecoiling={isGunRecoiling}
        ammo={ammo}
        mousePos={mousePos}
        containerWidth={containerRef.current?.clientWidth || 800}
        containerHeight={containerRef.current?.clientHeight || 550}
      />

      {/* 9. Custom Crosshair Overlay Following Mouse */}
      <div
        className="absolute pointer-events-none z-35 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: `translate(-50%, -50%) scale(${isGunRecoiling ? 1.35 : 1})`,
        }}
      >
        {currentGun.id === 'LASER_PISTOL' ? (
          /* Futuristic Cyber Diamond Reticle */
          <div className="relative w-11 h-11 flex items-center justify-center">
            <div className="absolute inset-0 border border-cyan-400/70 rotate-45 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping opacity-80" />
            <div className="absolute w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <div className="absolute -top-1 w-0.5 h-2 bg-cyan-400" />
            <div className="absolute -bottom-1 w-0.5 h-2 bg-cyan-400" />
            <div className="absolute -left-1 h-0.5 w-2 bg-cyan-400" />
            <div className="absolute -right-1 h-0.5 w-2 bg-cyan-400" />
          </div>
        ) : currentGun.id === 'BB_RIFLE' ? (
          /* Tactical Mil-Dot Green Sniper Crosshair */
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <div className="absolute w-full h-[1.5px] bg-emerald-500/90" />
            <div className="absolute h-full w-[1.5px] bg-emerald-500/90" />
            <div className="absolute top-1 w-1 h-1 bg-emerald-400 rounded-full" />
            <div className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full" />
            <div className="absolute left-1 w-1 h-1 bg-emerald-400 rounded-full" />
            <div className="absolute right-1 w-1 h-1 bg-emerald-400 rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300 ring-1 ring-emerald-600" />
          </div>
        ) : currentGun.id === 'DARTS' ? (
          /* Aerodynamic Dart Throw Aim Pip with 3-prong guidance fins */
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="20" y1="4" x2="20" y2="14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="28" x2="16" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="28" x2="24" y2="23" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
            </svg>
          </div>
        ) : (
          /* Classic Carnival Cork Gun Round Brass Reticle */
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/90 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <div className="absolute w-full h-[1.5px] bg-red-500/90" />
            <div className="absolute h-full w-[1.5px] bg-red-500/90" />
            <div className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-red-700" />
          </div>
        )}
      </div>

      {/* 10. Reloading Prompt Overlay */}
      {isReloading && (
        <div className="absolute inset-0 bg-black/40 z-35 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
          <div className="bg-amber-950/90 border-2 border-amber-400 px-6 py-2.5 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-amber-200 font-bold text-sm tracking-wide">
              裝填彈藥中...
            </span>
          </div>
        </div>
      )}

      {/* 11. Empty Ammo Warning Banner */}
      {ammo <= 0 && !isReloading && isPlaying && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onReloadRequested();
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35 cursor-pointer bg-red-600/95 border-2 border-amber-300 text-white font-black px-6 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          <span>⚠️ 彈藥用盡！點擊或按 [R] 鍵裝填</span>
        </div>
      )}

      {/* 12. Not Logged In Stall Gate Banner */}
      {!isLoggedIn && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onRequireLogin?.();
          }}
          className="absolute inset-0 z-40 bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-[#241107] border-3 border-amber-500 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-inner">
              🏮
            </div>
            <h3 className="text-xl font-black text-amber-200">
              夜市射氣球攤位營業中
            </h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              老闆規定：遊玩前請先登入 Google Sheets 玩家帳號，以領取彈藥並記錄戰績！
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequireLogin?.();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm shadow-lg transition-transform active:scale-95 cursor-pointer mt-1"
            >
              🔑 立即登入 / 註冊玩家
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
