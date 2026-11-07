/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Crosshair, Award, Zap, HelpCircle } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#2a170c] border-3 border-amber-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#3e1f0e] border-b-2 border-amber-700/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              夜市射氣球 · 遊戲玩法與規則
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-400/80 hover:text-white hover:bg-amber-900/60 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-amber-100">
          {/* Core Mechanism */}
          <div className="bg-[#1f1008] border border-amber-900/80 rounded-2xl p-4">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2 mb-2">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <span>核心機制說明</span>
            </h3>
            <p className="text-sm leading-relaxed text-amber-200/90">
              各類目標會在<span className="text-amber-400 font-bold">隨機百葉窗或滑軌</span>短暫出現、或以不同速度<span className="text-amber-400 font-bold">橫向滑過窗口</span>。您必須在目標縮回、關窗或滑離視野之前瞄準射擊！
            </p>
          </div>

          {/* Target Types Grid */}
          <div>
            <h3 className="text-base font-black text-amber-300 mb-2.5">
              🎯 目標類型與計分
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🐤</span>
                <div className="font-bold text-xs text-amber-200">黃色小鴨</div>
                <div className="text-xs font-mono text-amber-400 font-black">+120 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">經典滑動目標</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">👑</span>
                <div className="font-bold text-xs text-amber-300">黃金招財鴨</div>
                <div className="text-xs font-mono text-amber-400 font-black">+350 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">高速橫滑·引爆狂熱</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🎈</span>
                <div className="font-bold text-xs text-rose-300">五彩氣球</div>
                <div className="text-xs font-mono text-amber-400 font-black">60~100 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">清脆爆裂音效</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🎯</span>
                <div className="font-bold text-xs text-amber-200">同心圓木靶</div>
                <div className="text-xs font-mono text-amber-400 font-black">+180 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">旋轉金屬敲擊</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🪖</span>
                <div className="font-bold text-xs text-slate-300">鋼盔特技鴨</div>
                <div className="text-xs font-mono text-amber-400 font-black">+200 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">需命中 2 發</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🌈</span>
                <div className="font-bold text-xs text-pink-300">彩虹氣球</div>
                <div className="text-xs font-mono text-amber-400 font-black">+250 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">狂熱能量加成</div>
              </div>

              <div className="bg-[#1f1008] border border-amber-900/70 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">🧋</span>
                <div className="font-bold text-xs text-amber-200">波霸珍珠奶茶</div>
                <div className="text-xs font-mono text-amber-400 font-black">+150 分</div>
                <div className="text-[10px] text-amber-300/60 mt-0.5">獎勵彈藥補給</div>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3 text-center">
                <span className="text-3xl block mb-1">💣</span>
                <div className="font-bold text-xs text-rose-300">惡作劇排炮</div>
                <div className="text-xs font-mono text-rose-400 font-black">-150 分</div>
                <div className="text-[10px] text-rose-300/70 mt-0.5">切勿射擊！斷連擊</div>
              </div>
            </div>
          </div>

          {/* Controls & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#1f1008] border border-amber-900/80 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>操作按鍵</span>
              </h4>
              <ul className="text-xs space-y-1.5 text-amber-200/80">
                <li>• <strong className="text-white">滑鼠移動 / 手機觸控</strong>：瞄準夜市準星</li>
                <li>• <strong className="text-white">點擊 / 點按螢幕</strong>：扣下板機射擊</li>
                <li>• <strong className="text-white">[R] 鍵 / 點擊裝填鈕</strong>：快速裝填子彈</li>
                <li>• 可隨時切換軟木塞槍、BB槍、飛鏢與雷射手槍！</li>
              </ul>
            </div>

            <div className="bg-[#1f1008] border border-amber-900/80 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>彩票與獎品機制</span>
              </h4>
              <ul className="text-xs space-y-1.5 text-amber-200/80">
                <li>• 每次連續命中可累積 Combo，連擊越高倍率越高！</li>
                <li>• 累積滿 Fever 能量進入 8 秒 2x 雙倍得分！</li>
                <li>• 局末依據表現發放彩票，可在獎品專櫃兌換巨型柴犬與水豚君娃娃！</li>
                <li>• 經典十發制：10發全中可直接獲得夜市特等獎！</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1f1008] px-6 py-4 border-t border-amber-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm shadow-md transition-colors cursor-pointer"
          >
            開始射擊！
          </button>
        </div>
      </div>
    </div>
  );
};
