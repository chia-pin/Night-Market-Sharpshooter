/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, Tablet } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  // Handle Android / Chrome / Edge installation
  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {/* 1. Android / Chrome / Desktop PWA prompt */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 border border-amber-400/50 shrink-0"
          title="安裝至手機或平板桌面"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-200" />
          <span className="whitespace-nowrap">安裝 App</span>
        </button>
      )}

      {/* 2. iOS Safari guide button */}
      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          title="在 iPhone / iPad 上安裝"
        >
          <Tablet className="w-3.5 h-3.5 text-amber-400" />
          <span className="whitespace-nowrap">加入主畫面</span>
        </button>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#27140a] border-2 border-amber-500 rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-amber-200">
                  安裝至 iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-amber-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="flex flex-col gap-3 text-xs text-amber-100/90 leading-relaxed">
              <div className="flex items-start gap-3 bg-[#1e0e06] p-2.5 rounded-xl border border-amber-900/60">
                <div className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  點擊 Safari 底部工具列中央的 <strong className="text-amber-300">「分享」</strong> 按鈕
                  <span className="inline-flex items-center gap-1 mx-1 text-sky-400 font-mono">
                    <Share className="w-3.5 h-3.5 inline" />
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1e0e06] p-2.5 rounded-xl border border-amber-900/60">
                <div className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  在選單中往下滾動，找到並點選 <strong className="text-amber-300">「加入主畫面」</strong> (Add to Home Screen)
                  <span className="inline-flex items-center gap-1 mx-1 text-emerald-400 font-mono">
                    <PlusSquare className="w-3.5 h-3.5 inline" />
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1e0e06] p-2.5 rounded-xl border border-amber-900/60">
                <div className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  點擊右上角的 <strong className="text-amber-300">「新增」</strong>，即可在桌面以全螢幕原生 App 隨開隨玩！
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-amber-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
