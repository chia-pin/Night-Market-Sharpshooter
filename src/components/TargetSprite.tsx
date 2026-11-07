/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TargetEntity } from '../types';

interface TargetSpriteProps {
  target: TargetEntity;
  onHit: (e: React.MouseEvent | React.TouchEvent, target: TargetEntity) => void;
}

export const TargetSprite: React.FC<TargetSpriteProps> = ({ target, onHit }) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!target.hit && !target.retracting) {
      onHit(e, target);
    }
  };

  // Render SVG graphic based on target type
  const renderGraphic = () => {
    switch (target.type) {
      case 'DUCK_YELLOW':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 select-none pointer-events-none drop-shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Duck Body */}
              <ellipse cx="48" cy="62" rx="36" ry="24" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
              {/* Tail */}
              <path d="M 14 55 Q 6 42 16 48 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
              {/* Wing */}
              <path d="M 32 60 Q 50 50 54 68 Q 38 72 32 60 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
              {/* Head */}
              <circle cx="70" cy="40" r="19" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
              {/* Eye */}
              <circle cx="76" cy="36" r="4" fill="#1E293B" />
              <circle cx="78" cy="34" r="1.5" fill="#FFFFFF" />
              {/* Beak */}
              <ellipse cx="88" cy="44" rx="10" ry="5.5" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
              {/* Cheek blush */}
              <circle cx="68" cy="46" r="4.5" fill="#FB7185" opacity="0.6" />
            </svg>
          </div>
        );

      case 'DUCK_HELMET':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 select-none pointer-events-none drop-shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Duck Body */}
              <ellipse cx="48" cy="62" rx="36" ry="24" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
              {/* Tail */}
              <path d="M 14 55 Q 6 42 16 48 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
              {/* Wing with armor plate */}
              <path d="M 32 60 Q 50 50 54 68 Q 38 72 32 60 Z" fill="#64748B" stroke="#334155" strokeWidth="2" />
              {/* Head */}
              <circle cx="70" cy="42" r="18" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
              {/* Steel Combat Helmet */}
              <path d="M 52 38 C 52 20 88 20 88 38 Z" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
              <ellipse cx="70" cy="38" rx="19" ry="4" fill="#334155" />
              {/* Eye with determined brow */}
              <circle cx="76" cy="42" r="3.5" fill="#0F172A" />
              <path d="M 72 38 L 81 40" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
              {/* Beak */}
              <ellipse cx="88" cy="47" rx="9" ry="5" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
              {/* Health shield bar if 2 HP */}
              {target.health > 1 && (
                <g>
                  <rect x="58" y="8" width="24" height="6" rx="3" fill="#1E293B" opacity="0.8" />
                  <rect x="59" y="9" width="22" height="4" rx="2" fill="#38BDF8" />
                </g>
              )}
            </svg>
          </div>
        );

      case 'DUCK_GOLDEN':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 select-none pointer-events-none filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Aura Rays */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FDE68A" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
              {/* Golden Duck Body */}
              <ellipse cx="48" cy="62" rx="36" ry="24" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="2.5" />
              <path d="M 14 55 Q 6 42 16 48 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              {/* Wing */}
              <path d="M 32 60 Q 50 50 54 68 Q 38 72 32 60 Z" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
              {/* Head */}
              <circle cx="70" cy="40" r="19" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="2.5" />
              {/* Golden Crown */}
              <polygon points="63,22 66,28 71,21 76,28 79,22 80,31 62,31" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
              {/* Eye with star sparkle */}
              <circle cx="76" cy="38" r="4" fill="#78350F" />
              <circle cx="77" cy="36" r="1.5" fill="#FFFFFF" />
              {/* Beak */}
              <ellipse cx="88" cy="44" rx="10" ry="5.5" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
              
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      case 'BALLOON_RED':
      case 'BALLOON_BLUE':
      case 'BALLOON_GREEN':
      case 'BALLOON_PURPLE': {
        const colorMap = {
          BALLOON_RED: { fill: '#EF4444', dark: '#B91C1C', light: '#FCA5A5' },
          BALLOON_BLUE: { fill: '#3B82F6', dark: '#1D4ED8', light: '#93C5FD' },
          BALLOON_GREEN: { fill: '#10B981', dark: '#047857', light: '#6EE7B7' },
          BALLOON_PURPLE: { fill: '#A855F7', dark: '#7E22CE', light: '#E9D5FF' },
        }[target.type] || { fill: '#EF4444', dark: '#B91C1C', light: '#FCA5A5' };

        return (
          <div className="relative w-14 h-20 sm:w-16 sm:h-24 select-none pointer-events-none drop-shadow-lg">
            <svg viewBox="0 0 80 120" className="w-full h-full">
              {/* Balloon String */}
              <path d="M 40 90 Q 44 105 38 115" stroke="#CBD5E1" strokeWidth="2" fill="none" />
              {/* Balloon Knot */}
              <polygon points="36,88 44,88 40,94" fill={colorMap.dark} />
              {/* Main Balloon Oval */}
              <ellipse cx="40" cy="48" rx="34" ry="40" fill={colorMap.fill} stroke={colorMap.dark} strokeWidth="2" />
              {/* Glossy Reflection Highlight */}
              <ellipse cx="26" cy="32" rx="10" ry="18" fill={colorMap.light} opacity="0.65" transform="rotate(-25 26 32)" />
              <circle cx="21" cy="20" r="3.5" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>
        );
      }

      case 'BALLOON_RAINBOW':
        return (
          <div className="relative w-14 h-20 sm:w-16 sm:h-24 select-none pointer-events-none filter drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
            <svg viewBox="0 0 80 120" className="w-full h-full">
              <path d="M 40 90 Q 44 105 38 115" stroke="#FDE047" strokeWidth="2" fill="none" />
              <polygon points="36,88 44,88 40,94" fill="#E11D48" />
              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF007F" />
                  <stop offset="25%" stopColor="#FF7700" />
                  <stop offset="50%" stopColor="#FFDD00" />
                  <stop offset="75%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#B026FF" />
                </linearGradient>
              </defs>
              <ellipse cx="40" cy="48" rx="34" ry="40" fill="url(#rainbowGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
              <ellipse cx="26" cy="32" rx="10" ry="18" fill="#FFFFFF" opacity="0.75" transform="rotate(-25 26 32)" />
              <circle cx="21" cy="20" r="3.5" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>
        );

      case 'BULLSEYE_WOOD':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 select-none pointer-events-none drop-shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer wooden rim */}
              <circle cx="50" cy="50" r="46" fill="#78350F" stroke="#451A03" strokeWidth="3" />
              {/* White ring */}
              <circle cx="50" cy="50" r="40" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              {/* Red ring */}
              <circle cx="50" cy="50" r="30" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
              {/* Inner White ring */}
              <circle cx="50" cy="50" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
              {/* Center Bullseye Red */}
              <circle cx="50" cy="50" r="10" fill="#DC2626" />
              <circle cx="50" cy="50" r="4" fill="#FEF08A" />
            </svg>
          </div>
        );

      case 'BOMB_FIRECRACKER':
        return (
          <div className="relative w-14 h-16 sm:w-16 sm:h-20 select-none pointer-events-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Sparking fuse */}
              <path d="M 40 38 Q 45 22 55 18" stroke="#78350F" strokeWidth="2.5" fill="none" />
              <circle cx="55" cy="18" r="4" fill="#F59E0B" />
              <polygon points="55,10 57,16 63,18 57,20 55,26 53,20 47,18 53,16" fill="#EF4444" />
              {/* Firecracker Red Cylinder */}
              <rect x="22" y="38" width="36" height="52" rx="6" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
              {/* Gold bands */}
              <line x1="22" y1="48" x2="58" y2="48" stroke="#FDE047" strokeWidth="3" />
              <line x1="22" y1="78" x2="58" y2="78" stroke="#FDE047" strokeWidth="3" />
              {/* Danger Skull / Bomb icon */}
              <text x="40" y="68" fontSize="18" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">✕</text>
            </svg>
          </div>
        );

      case 'BOBA_BONUS':
        return (
          <div className="relative w-14 h-18 sm:w-16 sm:h-20 select-none pointer-events-none drop-shadow-md">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Boba Straw */}
              <rect x="42" y="6" width="8" height="30" rx="3" fill="#F43F5E" transform="rotate(15 46 21)" />
              {/* Cup Lid */}
              <ellipse cx="40" cy="34" rx="28" ry="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
              {/* Plastic Cup Body */}
              <path d="M 14 34 L 20 86 Q 21 92 28 92 L 52 92 Q 59 92 60 86 L 66 34 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2.5" opacity="0.9" />
              {/* Milk Tea Liquid */}
              <path d="M 17 46 L 21 86 Q 22 90 28 90 L 52 90 Q 58 90 59 86 L 63 46 Z" fill="#D97706" opacity="0.75" />
              {/* Pearls (Boba) */}
              <circle cx="28" cy="82" r="5" fill="#1C1917" />
              <circle cx="40" cy="83" r="5.5" fill="#1C1917" />
              <circle cx="52" cy="81" r="5" fill="#1C1917" />
              <circle cx="34" cy="74" r="4.8" fill="#1C1917" />
              <circle cx="46" cy="75" r="5" fill="#1C1917" />
              {/* Cute smiling face */}
              <circle cx="33" cy="56" r="2.5" fill="#451A03" />
              <circle cx="47" cy="56" r="2.5" fill="#451A03" />
              <path d="M 38 60 Q 40 64 42 60" stroke="#451A03" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  // Remaining time percentage before retracting
  const progressRatio = Math.max(0, 1 - (Date.now() - target.spawnTime) / target.durationMs);
  const isTrackTarget = target.windowIndex < 0;

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleClick}
      style={{
        left: `${target.xPercent}%`,
        bottom: `${target.yPercent}%`,
        transform: `translate(-50%, 0) scale(${target.retracting || target.hit ? 0.2 : 1})`,
        opacity: target.retracting || target.hit ? 0 : 1,
        transition: target.hit ? 'all 120ms ease-out' : target.retracting ? 'all 200ms ease-in' : 'none',
      }}
      className={`absolute z-20 cursor-crosshair flex flex-col items-center justify-end select-none group ${
        target.type.includes('DUCK') ? 'animate-duck-wobble' : ''
      }`}
    >
      {/* Target Sprite graphic with track scaling */}
      <div className={isTrackTarget ? "transform scale-[0.88] sm:scale-[0.92] origin-bottom flex flex-col items-center" : "flex flex-col items-center"}>
        {renderGraphic()}

        {/* Carnival target sliding carriage/stand on mechanical tracks */}
        {isTrackTarget && (
          <div className="w-9 sm:w-11 h-2 bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 rounded-sm border-t border-amber-400/80 shadow-md -mt-0.5 flex items-center justify-around px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shadow" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shadow" />
          </div>
        )}
      </div>

      {/* Dwell time indicator fuse on bottom */}
      {!target.hit && !target.retracting && target.behavior === 'POP_UP' && (
        <div className="w-10 sm:w-12 h-1 bg-black/40 rounded-full mt-1 overflow-hidden pointer-events-none">
          <div
            className={`h-full transition-all duration-100 ${
              progressRatio > 0.4 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
