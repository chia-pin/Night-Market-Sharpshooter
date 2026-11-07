/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, X, Table, ExternalLink, CheckCircle2, AlertTriangle, Key, FileSpreadsheet } from 'lucide-react';

interface SheetRecord {
  id: number;
  timestamp: string;
  playerName: string;
  gameMode: string;
  score: number;
  accuracy: string;
  totalHits: number;
  maxCombo: number;
  gunName: string;
  tokens: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<SheetRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    hasJson: boolean;
    hasSheetId: boolean;
    sheetTitle?: string;
    message?: string;
  } | null>(null);

  const fetchStatusAndRecords = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch connection status
      const statusRes = await fetch('/api/sheets/status');
      const statusData = await statusRes.json();
      setStatus(statusData);

      // 2. If configured, fetch records
      if (statusData.configured) {
        const recordsRes = await fetch('/api/sheets/records');
        const recordsData = await recordsRes.json();
        if (recordsData.success) {
          setRecords(recordsData.records || []);
        }
      }
    } catch (err) {
      console.error('Fetch Google Sheets failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#27140a] border-3 border-amber-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900/90 via-amber-800 to-amber-950 px-5 py-4 border-b border-amber-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-200 tracking-wide flex items-center gap-2">
                夜市神射手雲端英雄榜
                <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-600/60 px-2 py-0.5 rounded-full font-mono font-normal">
                  Google Sheets
                </span>
              </h2>
              <p className="text-xs text-amber-200/70">
                透過 Service Account 即時同步遊戲戰績至 Google 試算表
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatusAndRecords}
              disabled={isLoading}
              className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 transition-colors disabled:opacity-50 cursor-pointer"
              title="重新整理"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="px-5 py-3 border-b border-amber-900/50 bg-[#1e0e06]">
          {status?.configured ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>已連線至 Google Sheets：{status.sheetTitle}</span>
              </div>
              <span className="text-[11px] text-amber-400/80 font-mono">
                共 {records.length} 筆遊玩紀錄
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 text-xs text-amber-300/90">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Google Sheets 設定狀態提示</span>
              </div>
              <p className="text-amber-200/70 leading-relaxed">
                尚未在專案設定檔 <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">.env</code> 中填入環境變數。請在 <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">.env</code> 設定：
              </p>
              <div className="bg-black/60 rounded-lg p-2.5 font-mono text-[11px] text-amber-200 border border-amber-900/60 flex flex-col gap-1 select-all">
                <div><span className="text-amber-400 font-bold">GOOGLE_SERVICE_ACCOUNT_JSON</span> = <span className="text-amber-100/60">(Service Account 完整 JSON 字串)</span></div>
                <div><span className="text-amber-400 font-bold">GOOGLE_SHEET_ID</span> = <span className="text-amber-100/60">(試算表 ID)</span></div>
              </div>
              <p className="text-[11px] text-amber-400/70">
                🔒 注意：<code className="text-amber-300">.env</code> 已被 <code className="text-amber-300">.gitignore</code> 排除，不會被 Push 到 GitHub。
              </p>
            </div>
          )}
        </div>

        {/* Records Table or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-sm font-bold">讀取 Google Sheets 雲端資料中...</span>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-amber-800 text-amber-400/90 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">排名</th>
                    <th className="py-2.5 px-3">玩家暱稱</th>
                    <th className="py-2.5 px-3">模式</th>
                    <th className="py-2.5 px-3 text-right">得分</th>
                    <th className="py-2.5 px-3 text-center">命中率</th>
                    <th className="py-2.5 px-3 text-center">擊破數</th>
                    <th className="py-2.5 px-3 text-center">最高連擊</th>
                    <th className="py-2.5 px-3">使用武器</th>
                    <th className="py-2.5 px-3 text-right">時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/40 text-amber-100">
                  {records.map((rec, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-amber-950/40 transition-colors ${
                        index === 0
                          ? 'bg-amber-500/10 font-bold text-amber-300'
                          : index === 1
                          ? 'bg-slate-400/5 text-amber-200'
                          : index === 2
                          ? 'bg-amber-700/10 text-amber-200'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-300">
                            🥇 1
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            🥈 2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            🥉 3
                          </span>
                        ) : (
                          <span className="text-amber-400/70">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-200">
                        {rec.playerName}
                      </td>
                      <td className="py-2.5 px-3 text-amber-300/80">
                        {rec.gameMode}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 text-sm">
                        {rec.score.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {rec.accuracy}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {rec.totalHits}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-orange-400">
                        x{rec.maxCombo}
                      </td>
                      <td className="py-2.5 px-3 text-amber-200/80">
                        {rec.gunName}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[11px] text-amber-200/50 font-mono">
                        {rec.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 mb-3">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-amber-200 mb-1">
                {status?.configured ? '目前試算表尚無遊玩紀錄' : '尚未連線至 Google Sheets'}
              </h3>
              <p className="text-xs text-amber-300/70 max-w-md leading-relaxed mb-4">
                {status?.configured
                  ? '完成一局夜市射擊遊戲後，在結算畫面點擊「上傳戰績至 Google Sheets」即可記錄！'
                  : '請在 .env 檔案中填入 GOOGLE_SERVICE_ACCOUNT_JSON 與 GOOGLE_SHEET_ID，並將試算表共用給 Service Account 的 Email。'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#1a0c05] px-5 py-3 border-t border-amber-900/60 flex items-center justify-between text-xs text-amber-400/80">
          <span>🎯 夜市射氣球 · Google Sheets 即時資料串接</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-bold transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
