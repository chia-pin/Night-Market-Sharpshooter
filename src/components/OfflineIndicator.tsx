/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-400 text-amber-950 px-3.5 py-1.5 text-xs font-bold shadow-2xl backdrop-blur-sm animate-pulse">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>離線模式中 — 使用快取資料正常暢玩</span>
    </div>
  );
};
