/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PrizeItem } from '../types';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface PrizeShelfProps {
  prizes: PrizeItem[];
  onOpenPrizeShop: () => void;
}

export const PrizeShelf: React.FC<PrizeShelfProps> = ({ prizes, onOpenPrizeShop }) => {
  const ownedPrizes = prizes.filter(p => p.unlockedCount > 0);

  return (
    <div className="w-full bg-[#241309] border-2 border-amber-900/80 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-amber-900/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h3 className="text-base sm:text-lg font-black text-amber-200">
            我的夜市戰利品展示架
          </h3>
          <span className="text-xs text-amber-400/80 font-bold bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
            已收集 {ownedPrizes.length} / {prizes.length} 款
          </span>
        </div>

        <button
          onClick={onOpenPrizeShop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-xs font-bold transition-colors cursor-pointer border border-amber-500/60"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>兌換更多獎品</span>
        </button>
      </div>

      {ownedPrizes.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-xl bg-[#1b0d06] border border-dashed border-amber-900/70 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl opacity-50">🧸</span>
          <p className="text-sm text-amber-200/80 font-bold">
            展示架上目前還是空的！
          </p>
          <p className="text-xs text-amber-300/60 max-w-md">
            在上方夜市射氣球攤位瞄準滑動窗口的小鴨與氣球，贏得夜市彩票即可兌換巨型柴犬與水豚君娃娃！
          </p>
          <button
            onClick={onOpenPrizeShop}
            className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>查看可兌換的夜市獎品清單</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Wooden Shelf Background Beam */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ownedPrizes.map(item => (
              <div
                key={item.id}
                className="bg-[#1b0d06] border border-amber-800/80 rounded-xl p-3 flex flex-col items-center justify-between text-center shadow group hover:border-amber-500 transition-all"
              >
                <div className="relative w-16 h-16 flex items-center justify-center text-4xl mb-1 group-hover:scale-110 transition-transform">
                  {item.icon}
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-amber-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                    x{item.unlockedCount}
                  </span>
                </div>
                <h4 className="text-xs font-black text-amber-200 line-clamp-1">
                  {item.name}
                </h4>
                <span className="text-[10px] text-amber-400/70 mt-0.5">
                  {item.category === 'PLUSH' ? '超萌娃娃' : item.category === 'SNACK' ? '美食抱枕' : '特色玩具'}
                </span>
              </div>
            ))}
          </div>
          {/* Wooden Shelf Edge Base */}
          <div className="mt-3 h-2 w-full bg-[#4e2712] rounded-full border-t border-amber-600/60 shadow" />
        </div>
      )}
    </div>
  );
};
