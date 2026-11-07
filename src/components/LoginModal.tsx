/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KeyRound, User, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export interface LoggedUser {
  username: string;
  lastLoginTime: string;
  isGuest?: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: LoggedUser) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
  canDismiss = false,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('請輸入玩家名稱！');
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('請輸入密碼！');
      return;
    }

    setIsLoading(true);
    const endpoint = mode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || (mode === 'LOGIN' ? '登入成功！' : '註冊成功！'));
        setTimeout(() => {
          onLoginSuccess({
            username: data.user.username,
            lastLoginTime: data.user.lastLoginTime,
          });
        }, 600);
      } else {
        setErrorMessage(data.error || '驗證失敗，請檢查輸入內容！');
        if (data.notFound && mode === 'LOGIN') {
          // Suggest user switch to register
          setTimeout(() => {
            // Keep error visible but guide user
          }, 300);
        }
      }
    } catch (err: any) {
      setErrorMessage(`連線伺服器失敗: ${err.message || '請確認後端服務是否正常啟動'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Guest offline preview option if user has not filled .env yet
  const handleGuestPlay = () => {
    const guestUser: LoggedUser = {
      username: username.trim() || '夜市遊客 (試玩)',
      lastLoginTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }),
      isGuest: true,
    };
    onLoginSuccess(guestUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#251208] border-3 border-amber-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Stall Header Awning Bar */}
        <div className="h-4 w-full flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-red-600' : 'bg-amber-400'}`}
            />
          ))}
        </div>

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 mb-2 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide">
            夜市射氣球 · 玩家驗證
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">
            資料直接即時同步至 Google Sheets <span className="text-amber-400 font-bold">「玩家」</span> 工作表
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-amber-900/80 mx-6 bg-[#1a0c05] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-amber-500 text-amber-950 shadow-md'
                : 'text-amber-300/70 hover:text-amber-200'
            }`}
          >
            🔑 玩家登入
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-amber-500 text-amber-950 shadow-md'
                : 'text-amber-300/70 hover:text-amber-200'
            }`}
          >
            ✨ 註冊新玩家
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-3.5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>玩家名稱 (工作表欄位：玩家名稱)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="例如: 夜市神射手小明"
                maxLength={20}
                required
                className="w-full bg-black/60 border border-amber-700/80 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>密碼 (工作表欄位：密碼)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                required
                className="w-full bg-black/60 border border-amber-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>{errorMessage}</span>
                {errorMessage.includes('找不到玩家') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setErrorMessage(null);
                    }}
                    className="block mt-1 text-amber-300 underline font-bold cursor-pointer"
                  >
                    點此切換至「註冊新玩家」➜
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>存取 Google Sheets 驗證中...</span>
              </>
            ) : mode === 'LOGIN' ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>登入並開始射擊</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>註冊帳號並開玩</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info: Google Sheets details */}
        <div className="px-6 py-3.5 bg-[#1a0c05] border-t border-amber-900/60 text-[11px] text-amber-300/70 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              工作表規格：【玩家】工作表
            </span>
            <span className="text-amber-500/80 font-mono">A:玩家名稱 B:密碼 C:最後登入</span>
          </div>
          <p className="leading-relaxed text-amber-200/50">
            登入成功後，系統將自動寫入當前登入時間至「最後一次登入時間」欄位。
          </p>

          {/* Fallback trial if Google Sheets credentials aren't ready */}
          <div className="pt-2 border-t border-amber-950/80 flex items-center justify-between">
            <span className="text-[10px] text-amber-400/50">尚未配置 Google Sheets？</span>
            <button
              type="button"
              onClick={handleGuestPlay}
              className="text-[10px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
            >
              訪客離線試玩模式 ➜
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
