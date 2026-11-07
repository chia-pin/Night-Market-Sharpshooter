/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GunType } from '../types';

interface GunViewModelProps {
  gunId: GunType;
  isRecoiling: boolean;
  ammo: number;
  mousePos: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
}

export const GunViewModel: React.FC<GunViewModelProps> = ({
  gunId,
  isRecoiling,
  ammo,
  mousePos,
  containerWidth,
  containerHeight,
}) => {
  // Gun pivot base position:
  // Stands at the player's station at the bottom counter.
  // Slightly tracks horizontally with aim (22% weight) to create a natural, immersive shooting stance.
  const gunBaseX = containerWidth * 0.5 + (mousePos.x - containerWidth * 0.5) * 0.22;
  const gunBaseY = containerHeight; // Pivot at bottom edge of booth

  // Vector from gun pivot to the mouse crosshair
  const dx = mousePos.x - gunBaseX;
  const dy = mousePos.y - gunBaseY; // dy is negative since crosshair is above the gun

  // Calculate rotation angle in degrees:
  // 0° points straight UP towards negative Y.
  // Positive degrees rotate clockwise (aiming right).
  // Negative degrees rotate counter-clockwise (aiming left).
  const aimAngleRad = Math.atan2(dx, -dy);
  const aimAngleDeg = aimAngleRad * (180 / Math.PI);

  // Recoil kickback along the aiming trajectory
  const recoilDist = isRecoiling ? 8 : 0;
  const recoilX = -Math.sin(aimAngleRad) * recoilDist;
  const recoilY = Math.cos(aimAngleRad) * recoilDist;

  // If aiming very low near the bottom counter, make gun slightly translucent so it never obstructs
  const isAimingLow = mousePos.y > containerHeight * 0.72;

  return (
    <div
      className={`absolute -bottom-2 sm:-bottom-3 pointer-events-none z-30 transition-transform duration-75 ${
        isAimingLow ? 'opacity-75' : 'opacity-100'
      }`}
      style={{
        left: `${gunBaseX}px`,
        transform: `translate(-50%, 0) translate(${recoilX}px, ${recoilY}px) rotate(${aimAngleDeg}deg)`,
        transformOrigin: '50% 100%',
      }}
    >
      {/* 1. 復古木柄軟木塞槍 (Vintage Cork Gun) */}
      {gunId === 'CORK_GUN' && (
        <div className="relative w-20 sm:w-24 h-24 sm:h-28 drop-shadow-xl">
          <svg viewBox="0 0 160 170" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="corkWoodStock" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="corkBrass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>

            {/* Hand Grip & Stock (centered at X = 80) */}
            <path
              d="M 64 170 C 68 130 72 95 73 75 L 87 75 C 88 95 92 130 96 170 Z"
              fill="url(#corkWoodStock)"
              stroke="#291206"
              strokeWidth="2.5"
            />
            {/* Brass Grip Plate & Rivets */}
            <rect x="73" y="105" width="14" height="34" rx="4" fill="url(#corkBrass)" opacity="0.95" />
            <circle cx="80" cy="112" r="2" fill="#713f12" />
            <circle cx="80" cy="130" r="2" fill="#713f12" />

            {/* Brass Trigger Guard & Trigger */}
            <path d="M 65 115 C 57 115 57 132 66 134" fill="none" stroke="url(#corkBrass)" strokeWidth="3" />
            <path d="M 63 121 Q 59 125 61 129" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />

            {/* Metal Receiver & Cocking Lever */}
            <rect x="69" y="45" width="22" height="32" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            <line x1="74" y1="48" x2="74" y2="72" stroke="#64748b" strokeWidth="2" />
            {/* Bolt Action Knob on side */}
            <circle cx="93" cy="54" r="5" fill="url(#corkBrass)" stroke="#713f12" strokeWidth="1" />
            <rect x="88" y="52" width="6" height="4" fill="url(#corkBrass)" />

            {/* Wide Brass Barrel (centered exactly at X = 80) */}
            <rect x="71" y="14" width="18" height="33" rx="2" fill="url(#corkBrass)" stroke="#713f12" strokeWidth="2" />
            <line x1="75" y1="14" x2="75" y2="47" stroke="#fef9c3" strokeWidth="1.5" opacity="0.85" />
            {/* Barrel Reinforcement Rings */}
            <rect x="70" y="22" width="20" height="3.5" rx="1" fill="#713f12" />
            <rect x="70" y="36" width="20" height="3.5" rx="1" fill="#713f12" />
            {/* Front Sight Pin (dead center at X = 80) */}
            <circle cx="80" cy="12" r="2.5" fill="#fef08a" stroke="#854d0e" strokeWidth="1" />

            {/* Attached Rustic Hemp String to Cork */}
            <path
              d={isRecoiling ? "M 80 20 Q 64 6 72 -14" : "M 80 20 Q 86 14 82 8"}
              fill="none"
              stroke="#d97706"
              strokeWidth="1.8"
              strokeDasharray="2 2"
            />

            {/* Cork Stopper (centered at X = 80) */}
            {isRecoiling ? (
              /* Cork flying forward on string */
              <g transform="translate(68, -22) rotate(-15)">
                <polygon points="6,0 18,0 16,16 8,16" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
                <ellipse cx="12" cy="0" rx="6" ry="2" fill="#fde68a" />
              </g>
            ) : (
              /* Plugged cork in barrel mouth */
              <g transform="translate(71, 4)">
                <polygon points="2,0 16,0 14,10 4,10" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
                <ellipse cx="9" cy="0" rx="7" ry="2.5" fill="#fde68a" />
              </g>
            )}

            {/* Vintage Night Market Brass Plaque */}
            <rect x="66" y="80" width="28" height="8" rx="2" fill="#1e293b" />
            <text x="80" y="86" fontSize="5.5" fill="#fde047" textAnchor="middle" fontWeight="bold">
              夜市·軟木塞
            </text>
          </svg>
        </div>
      )}

      {/* 2. 連發BB玩具步槍 (Tactical Airsoft Rifle) */}
      {gunId === 'BB_RIFLE' && (
        <div className="relative w-22 sm:w-26 h-26 sm:h-30 drop-shadow-xl">
          <svg viewBox="0 0 160 180" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="bbTacticalGun" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="bbCamo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f4f34" />
                <stop offset="100%" stopColor="#25321f" />
              </linearGradient>
            </defs>

            {/* Tactical Pistol Grip (centered around X = 80) */}
            <path
              d="M 66 180 L 73 115 L 87 115 L 94 180 Z"
              fill="url(#bbCamo)"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Grip ribbing lines */}
            <line x1="71" y1="130" x2="89" y2="130" stroke="#1c2417" strokeWidth="2" />
            <line x1="73" y1="145" x2="91" y2="145" stroke="#1c2417" strokeWidth="2" />
            <line x1="75" y1="160" x2="93" y2="160" stroke="#1c2417" strokeWidth="2" />

            {/* Trigger Guard & Red Safety Toggle */}
            <path d="M 63 135 C 53 135 53 155 64 155" fill="none" stroke="#475569" strokeWidth="3" />
            <polygon points="63,142 59,145 63,148" fill="#ef4444" />

            {/* Tactical Upper Receiver (centered at X = 80) */}
            <rect x="66" y="58" width="28" height="58" rx="4" fill="url(#bbTacticalGun)" stroke="#0f172a" strokeWidth="2.5" />
            {/* Picatinny Top Rail */}
            <rect x="71" y="53" width="18" height="6" fill="#475569" />
            <line x1="74" y1="53" x2="74" y2="59" stroke="#0f172a" strokeWidth="1" />
            <line x1="78" y1="53" x2="78" y2="59" stroke="#0f172a" strokeWidth="1" />
            <line x1="82" y1="53" x2="82" y2="59" stroke="#0f172a" strokeWidth="1" />
            <line x1="86" y1="53" x2="86" y2="59" stroke="#0f172a" strokeWidth="1" />

            {/* Transparent BB Pellet Hopper Reservoir on Side */}
            <g transform="translate(94, 66)">
              <rect x="0" y="0" width="20" height="38" rx="5" fill="rgba(148, 163, 184, 0.45)" stroke="#38bdf8" strokeWidth="2" />
              {/* Colorful 6mm BB Pellets visible inside */}
              <circle cx="7" cy="9" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="13" cy="10" r="3" fill="#fb923c" stroke="#c2410c" strokeWidth="1" />
              <circle cx="8" cy="17" r="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
              <circle cx="14" cy="18" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="7" cy="25" r="3" fill="#fb923c" stroke="#c2410c" strokeWidth="1" />
              <circle cx="13" cy="26" r="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
              <circle cx="10" cy="32" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            </g>

            {/* Long Ventilated Fluted Barrel (centered at X = 80) */}
            <rect x="73" y="8" width="14" height="50" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            {/* Barrel cooling vents */}
            <ellipse cx="80" cy="18" rx="3" ry="1.5" fill="#0f172a" />
            <ellipse cx="80" cy="26" rx="3" ry="1.5" fill="#0f172a" />
            <ellipse cx="80" cy="34" rx="3" ry="1.5" fill="#0f172a" />
            <ellipse cx="80" cy="42" rx="3" ry="1.5" fill="#0f172a" />

            {/* Blaze Orange Safety Muzzle Tip (centered at X = 80) */}
            <rect x="72" y="2" width="16" height="8" rx="2" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
            <circle cx="80" cy="2" r="2.5" fill="#1e293b" />

            {/* Tactical holographic sight frame */}
            <path d="M 72 50 L 72 40 L 88 40 L 88 50" fill="none" stroke="#475569" strokeWidth="2" />
            <rect x="74" y="42" width="12" height="7" fill="rgba(34, 197, 94, 0.3)" />
            <circle cx="80" cy="45.5" r="1.5" fill="#22c55e" />

            {/* Muzzle Flash if recoiling */}
            {isRecoiling && (
              <g transform="translate(80, -4)">
                <polygon points="0,-14 4,-4 14,0 4,4 0,14 -4,4 -14,0 -4,-4" fill="#fde047" />
                <circle cx="0" cy="0" r="4.5" fill="#fb923c" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* 3. 磁吸夜市飛鏢 (Carnival Darts) */}
      {gunId === 'DARTS' && (
        <div className="relative w-18 sm:w-22 h-24 sm:h-28 drop-shadow-xl">
          <svg viewBox="0 0 160 180" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="dartShaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="dartFlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* Player's Throwing Hand / Fingers holding dart (centered) */}
            <g transform="translate(56, 95)">
              <path d="M 10 85 L 18 35 Q 24 18 32 35 L 36 65" fill="#f59e0b" opacity="0.85" stroke="#b45309" strokeWidth="2" />
              <path d="M 28 35 Q 34 14 42 28 L 46 65" fill="#fbbf24" opacity="0.9" stroke="#b45309" strokeWidth="2" />
              <path d="M 40 32 Q 46 16 52 32 L 54 70" fill="#fde047" opacity="0.9" stroke="#b45309" strokeWidth="2" />
            </g>

            {/* Active Primary Ready-to-Throw Dart (centered at X = 80) */}
            <g transform={isRecoiling ? "translate(80, 16) scale(0.85)" : "translate(80, 36)"}>
              {/* Magnetic Chrome Tip (centered at 0, which is X = 80) */}
              <polygon points="0,-36 3,-22 -3,-22" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
              <circle cx="0" cy="-36" r="3" fill="#dc2626" />

              {/* Metallic Knurled Brass Barrel */}
              <rect x="-4" y="-22" width="8" height="32" rx="2" fill="url(#dartShaftGrad)" stroke="#334155" strokeWidth="1.5" />
              <line x1="-3" y1="-16" x2="3" y2="-16" stroke="#475569" strokeWidth="1" />
              <line x1="-3" y1="-10" x2="3" y2="-10" stroke="#475569" strokeWidth="1" />
              <line x1="-3" y1="-4" x2="3" y2="-4" stroke="#475569" strokeWidth="1" />
              <line x1="-3" y1="2" x2="3" y2="2" stroke="#475569" strokeWidth="1" />

              {/* Lightweight Polycarbonate Shaft */}
              <rect x="-2" y="10" width="4" height="24" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />

              {/* Aerodynamic 4-Wing Carnival Flight */}
              <path d="M -2 24 L -18 36 L -16 52 L -2 46 Z" fill="url(#dartFlightGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M 2 24 L 18 36 L 16 52 L 2 46 Z" fill="url(#dartFlightGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
              <line x1="0" y1="22" x2="0" y2="54" stroke="#fef08a" strokeWidth="2" />
            </g>

            {/* Extra Reserve Darts in Hand */}
            {ammo > 1 && (
              <g transform="translate(108, 75) rotate(22)">
                <rect x="-3" y="-15" width="6" height="22" rx="1.5" fill="url(#dartShaftGrad)" />
                <rect x="-1.5" y="7" width="3" height="16" fill="#38bdf8" />
                <path d="M -1.5 16 L -12 24 L -10 34 L -1.5 30 Z" fill="#3b82f6" />
                <path d="M 1.5 16 L 12 24 L 10 34 L 1.5 30 Z" fill="#3b82f6" />
              </g>
            )}
            {ammo > 2 && (
              <g transform="translate(52, 78) rotate(-20)">
                <rect x="-3" y="-15" width="6" height="22" rx="1.5" fill="url(#dartShaftGrad)" />
                <rect x="-1.5" y="7" width="3" height="16" fill="#38bdf8" />
                <path d="M -1.5 16 L -12 24 L -10 34 L -1.5 30 Z" fill="#10b981" />
                <path d="M 1.5 16 L 12 24 L 10 34 L 1.5 30 Z" fill="#10b981" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* 4. 霓虹雷射手槍 (Arcade Cyber Lightgun) */}
      {gunId === 'LASER_PISTOL' && (
        <div className="relative w-20 sm:w-24 h-24 sm:h-28 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
          <svg viewBox="0 0 160 170" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="laserCyberFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Ergonomic Cyber Grip (centered around X = 80) */}
            <path
              d="M 66 170 L 73 105 L 87 105 L 94 170 Z"
              fill="url(#laserCyberFrame)"
              stroke="#06b6d4"
              strokeWidth="2"
            />
            {/* Grip LED Accent Insets */}
            <path d="M 73 120 L 77 155" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 87 120 L 91 155" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />

            {/* Neon Cyan Trigger Guard */}
            <path d="M 64 120 C 52 120 52 145 66 145" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
            <line x1="64" y1="130" x2="60" y2="135" stroke="#f43f5e" strokeWidth="2.5" />

            {/* Angular Chassis (centered at X = 80) */}
            <polygon
              points="60,65 100,65 94,110 66,110"
              fill="url(#laserCyberFrame)"
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* Glowing Plasma Core Chamber (centered at X = 80) */}
            <rect x="69" y="74" width="22" height="26" rx="4" fill="#082f49" stroke="#22d3ee" strokeWidth="1.5" />
            <rect x="72" y="77" width="16" height="20" rx="3" fill="#06b6d4" opacity="0.75" className="animate-pulse" />
            <line x1="74" y1="87" x2="86" y2="87" stroke="#ffffff" strokeWidth="2" />

            {/* Dual Twin Rail Laser Emitter Barrel (symmetrical around X = 80) */}
            <rect x="67" y="24" width="8" height="42" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            <rect x="85" y="24" width="8" height="42" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            {/* Central Laser Accelerator Tube (centered at X = 80) */}
            <rect x="75" y="16" width="10" height="50" rx="2" fill="#0c4a6e" stroke="#22d3ee" strokeWidth="2" />
            <line x1="80" y1="18" x2="80" y2="64" stroke="#e0f2fe" strokeWidth="2.5" className="animate-pulse" />

            {/* Holographic Projection Lens at the muzzle (centered at X = 80) */}
            <ellipse cx="80" cy="14" rx="10" ry="4" fill="#22d3ee" stroke="#67e8f9" strokeWidth="1.5" />
            <circle cx="80" cy="14" r="3" fill="#ffffff" />

            {/* Holographic HUD Reticle floating above muzzle (centered at X = 80) */}
            <g transform="translate(80, -6)">
              <polygon points="0,-10 10,0 0,10 -10,0" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.9" />
              <circle cx="0" cy="0" r="2" fill="#f43f5e" />
              <line x1="0" y1="-12" x2="0" y2="-8" stroke="#22d3ee" strokeWidth="1" />
              <line x1="0" y1="8" x2="0" y2="12" stroke="#22d3ee" strokeWidth="1" />
              <line x1="-12" y1="0" x2="-8" y2="0" stroke="#22d3ee" strokeWidth="1" />
              <line x1="8" y1="0" x2="12" y2="0" stroke="#22d3ee" strokeWidth="1" />
            </g>

            {/* Laser beam pulse upon firing */}
            {isRecoiling && (
              <g transform="translate(80, 10)">
                <line x1="0" y1="0" x2="0" y2="-50" stroke="#67e8f9" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                <line x1="0" y1="0" x2="0" y2="-50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="0" cy="-50" r="7" fill="#f43f5e" opacity="0.75" />
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
