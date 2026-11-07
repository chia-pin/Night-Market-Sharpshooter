/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrizeItem } from '../types';
import { soundEngine } from '../utils/audio';
import { X, Award, CheckCircle, Sparkles } from 'lucide-react';

interface PrizeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: PrizeItem[];
  tickets: number;
  onRedeemPrize: (prizeId: string) => void;
}

export const PrizeShopModal: React.FC<PrizeShopModalProps> = ({
  isOpen,
  onClose,
  prizes,
  tickets,
  onRedeemPrize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PLUSH' | 'SNACK' | 'TOY'>('ALL');
  const [justRedeemedId, setJustRedeemedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPrizes = prizes.filter(p =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  const handleRedeem = (prize: PrizeItem) => {
    if (tickets < prize.costTickets) return;
    soundEngine.playPrizeRedeemed();
    setJustRedeemedId(prize.id);
    setTimeout(() => setJustRedeemedId(null), 1500);
    onRedeemPrize(prize.id);
  };

  const totalCollectedItems = prizes.reduce((acc, p) => acc + p.unlockedCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#2a170c] border-3 border-amber-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#3e1f0e] border-b-2 border-amber-700/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏮</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide flex items-center gap-2">
                夜市獎品兌換處 · 戰利品專櫃
              </h2>
              <p className="text-xs text-amber-200/70">
                憑神射手累積彩票兌換超人氣巨型娃娃與夜市美食抱枕！
              </p>
            </div>
          </div>

          {/* User Ticket Balance Badge & Close */}
          <div className="flex items-center gap-4">
            <div className="bg-amber-950 border border-amber-500/80 px-4 py-2 rounded-2xl flex items-center gap-2 shadow">
              <Award className="w-5 h-5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-300/80 font-bold">現有彩票</span>
                <span className="text-base sm:text-lg font-black font-mono text-amber-300 tabular-nums">
                  {tickets}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-amber-400/80 hover:text-white hover:bg-amber-900/60 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Tabs & Collection Summary */}
        <div className="bg-[#241309] px-6 py-3 border-b border-amber-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: '全部獎品' },
              { id: 'PLUSH', label: '🧸 巨型娃娃' },
              { id: 'SNACK', label: '🍗 美食抱枕' },
              { id: 'TOY', label: '🔫 玩具紀念' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-amber-950 shadow-sm'
                    : 'text-amber-300/70 hover:text-amber-100 hover:bg-amber-900/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-amber-300/90 font-medium">
            已收集戰利品: <span className="font-bold font-mono text-amber-400">{totalCollectedItems}</span> 件
          </div>
        </div>

        {/* Prize Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPrizes.map(prize => {
            const canAfford = tickets >= prize.costTickets;
            const isJustRedeemed = justRedeemedId === prize.id;

            return (
              <div
                key={prize.id}
                className={`relative bg-[#1f1008] border-2 rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  isJustRedeemed
                    ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-[1.02]'
                    : prize.rarity === 'LEGENDARY'
                    ? 'border-amber-500/80 shadow-md'
                    : prize.rarity === 'EPIC'
                    ? 'border-purple-500/60'
                    : 'border-amber-900/70'
                }`}
              >
                {/* Rarity & Owned Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                      prize.rarity === 'LEGENDARY'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : prize.rarity === 'EPIC'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {prize.rarity}
                  </span>

                  {prize.unlockedCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      持有 x{prize.unlockedCount}
                    </span>
                  )}
                </div>

                {/* Prize Icon & Presentation */}
                <div className="flex flex-col items-center my-2">
                  <div className="w-20 h-20 rounded-2xl bg-amber-950/50 border border-amber-900/80 flex items-center justify-center text-5xl mb-2 drop-shadow-md">
                    {prize.icon}
                  </div>
                  <h3 className="text-base font-black text-amber-200 text-center">
                    {prize.name}
                  </h3>
                  <p className="text-xs text-amber-300/70 text-center line-clamp-1 mt-0.5">
                    {prize.subtitle}
                  </p>
                  <p className="text-[11px] text-amber-100/60 text-center mt-1.5 leading-relaxed">
                    {prize.description}
                  </p>
                </div>

                {/* Cost & Redeem Action */}
                <div className="mt-4 pt-3 border-t border-amber-950 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-black font-mono tabular-nums text-amber-300">
                      {prize.costTickets}
                    </span>
                    <span className="text-[10px] text-amber-300/70 font-semibold">張彩票</span>
                  </div>

                  <button
                    onClick={() => handleRedeem(prize)}
                    disabled={!canAfford}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 shadow-md cursor-pointer'
                        : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>兌換獎品</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#1f1008] px-6 py-3 border-t border-amber-900/60 flex items-center justify-between text-xs text-amber-300/70">
          <span>提示：夜市射擊遊戲每局得分越高，可獲得的彩票數量越多！</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold transition-colors cursor-pointer"
          >
            返回射擊攤位
          </button>
        </div>
      </div>
    </div>
  );
};
