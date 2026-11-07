/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TargetType =
  | 'DUCK_YELLOW'      // 經典黃色小鴨 (100分)
  | 'DUCK_HELMET'      // 鋼盔特技鴨 (200分, 耐打)
  | 'DUCK_GOLDEN'      // 黃金發光招財鴨 (350分, 高速橫向滑過, 大量集氣)
  | 'BALLOON_RED'      // 紅色氣球 (60分)
  | 'BALLOON_BLUE'     // 藍色氣球 (80分)
  | 'BALLOON_GREEN'    // 綠色氣球 (80分)
  | 'BALLOON_PURPLE'   // 紫色氣球 (100分)
  | 'BALLOON_RAINBOW'  // 彩虹狂熱氣球 (250分, 觸發狂熱加成)
  | 'BULLSEYE_WOOD'    // 旋轉同心圓木靶 (中心 200分 / 外圈 100分)
  | 'BOMB_FIRECRACKER' // 夜市惡作劇排炮/炸彈 (-150分, 中斷連擊, 扣子彈)
  | 'BOBA_BONUS';      // 台灣珍珠奶茶驚喜 (補給子彈 + 150分)

export type TargetBehavior = 
  | 'POP_UP'        // 窗口彈出停留後縮回
  | 'SLIDE_LEFT'    // 從右向左橫向滑過窗口
  | 'SLIDE_RIGHT'   // 從左向右橫向滑過窗口
  | 'CONVEYOR';     // 上層軌道連續橫向滑動

export interface TargetEntity {
  id: string;
  type: TargetType;
  windowIndex: number; // 0..2 for booth windows (1 row of 3 windows), -1 for top conveyor
  behavior: TargetBehavior;
  xPercent: number;    // 0..100 horizontal position within window/track
  yPercent: number;    // vertical offset
  spawnTime: number;
  durationMs: number;  // How long before retracting/leaving
  speed: number;       // For sliding targets
  health: number;      // 1 for most, 2 for helmet duck
  maxHealth: number;
  hit: boolean;
  retracting: boolean;
  scoreValue: number;
}

export type GunType = 'CORK_GUN' | 'BB_RIFLE' | 'DARTS' | 'LASER_PISTOL';

export interface GunStats {
  id: GunType;
  name: string;
  subtitle: string;
  capacity: number;
  reloadTimeMs: number;
  fireCooldownMs: number;
  accuracyJitter: number; // slight realistic spread in pixels
  damage: number;
  icon: string;
}

export type GameMode = 
  | 'TIMED'      // 60秒夜市限時挑戰
  | 'CLASSIC_10' // 經典十發裝 (夜市十發制送大娃娃)
  | 'SPEED_RUSH';// 橫向滑行極速狂暴模式

export interface PrizeItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  category: 'PLUSH' | 'SNACK' | 'TOY' | 'TROPHY';
  costTickets: number;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedCount: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  type: 'shard' | 'feather' | 'sparkle' | 'smoke' | 'score' | 'cork' | 'bubble';
  text?: string;
}

export interface BulletHole {
  id: number;
  x: number;
  y: number;
  alpha: number;
  type: 'cork_dent' | 'bb_hole' | 'dart_pin' | 'laser_burn';
}

export interface GameStats {
  score: number;
  highScore: number;
  shotsFired: number;
  shotsHit: number;
  maxCombo: number;
  currentCombo: number;
  ticketsTotal: number;
  ticketsEarnedThisRound: number;
  balloonsPopped: number;
  ducksHit: number;
  feverGauge: number; // 0..100
  isFever: boolean;
  feverTimeRemaining: number;
}
