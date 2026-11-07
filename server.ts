/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/**
 * Initialize Google Sheets Client from environment variables
 */
function getGoogleSheetsClient() {
  const serviceAccountJsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountJsonStr || !serviceAccountJsonStr.trim()) {
    return { client: null, sheetId: null, error: 'GOOGLE_SERVICE_ACCOUNT_JSON 尚未於 .env 設定' };
  }

  if (!sheetId || !sheetId.trim()) {
    return { client: null, sheetId: null, error: 'GOOGLE_SHEET_ID 尚未於 .env 設定' };
  }

  let credentials: any;
  try {
    const trimmed = serviceAccountJsonStr.trim();
    if (trimmed.startsWith('{')) {
      credentials = JSON.parse(trimmed);
    } else {
      credentials = JSON.parse(Buffer.from(trimmed, 'base64').toString('utf-8'));
    }
  } catch (err: any) {
    return {
      client: null,
      sheetId: null,
      error: `GOOGLE_SERVICE_ACCOUNT_JSON 格式錯誤，無法解析為 JSON: ${err.message}`,
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return { client: sheets, sheetId: sheetId.trim(), error: null };
  } catch (err: any) {
    return { client: null, sheetId: null, error: `GoogleAuth 初始化失敗: ${err.message}` };
  }
}

/**
 * Ensure '玩家' sheet exists and has headers: 玩家名稱, 密碼, 最後一次登入時間
 */
async function ensurePlayersSheet(client: any, sheetId: string) {
  const meta = await client.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetTitles = meta.data.sheets?.map((s: any) => s.properties?.title) || [];

  if (!sheetTitles.includes('玩家')) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: '玩家',
              },
            },
          },
        ],
      },
    });
  }

  // Ensure header row in '玩家' sheet
  const headerCheck = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'玩家'!A1:C1`,
  });

  if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'玩家'!A1:C1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['玩家名稱', '密碼', '最後一次登入時間']],
      },
    });
  }
}

/**
 * Ensure '遊戲紀錄' sheet exists for game high scores
 */
async function ensureScoresSheet(client: any, sheetId: string) {
  const meta = await client.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetTitles = meta.data.sheets?.map((s: any) => s.properties?.title) || [];

  const targetSheetName = sheetTitles.includes('遊戲紀錄')
    ? '遊戲紀錄'
    : sheetTitles.length > 0 && sheetTitles[0] !== '玩家'
    ? sheetTitles[0]
    : '遊戲紀錄';

  if (!sheetTitles.includes(targetSheetName)) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: targetSheetName,
              },
            },
          },
        ],
      },
    });
  }

  const headerCheck = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${targetSheetName}'!A1:I1`,
  });

  if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${targetSheetName}'!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['時間', '玩家名稱', '遊戲模式', '最終得分', '命中率', '擊破數', '最高連擊', '使用武器', '獲得夜市幣']],
      },
    });
  }

  return targetSheetName;
}

// 1. Check Google Sheets API connection status
app.get('/api/sheets/status', async (req, res) => {
  const hasJson = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim());
  const hasSheetId = Boolean(process.env.GOOGLE_SHEET_ID?.trim());

  if (!hasJson || !hasSheetId) {
    return res.json({
      configured: false,
      hasJson,
      hasSheetId,
      message: '尚未在 .env 設定 GOOGLE_SERVICE_ACCOUNT_JSON 或 GOOGLE_SHEET_ID',
    });
  }

  const { client, sheetId, error } = getGoogleSheetsClient();

  if (error || !client || !sheetId) {
    return res.json({
      configured: false,
      hasJson,
      hasSheetId,
      message: error,
    });
  }

  try {
    const meta = await client.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    return res.json({
      configured: true,
      hasJson,
      hasSheetId,
      sheetTitle: meta.data.properties?.title || '未命名試算表',
      sheets: meta.data.sheets?.map(s => s.properties?.title) || [],
      message: '已成功連線至 Google Sheets！',
    });
  } catch (err: any) {
    return res.json({
      configured: false,
      hasJson,
      hasSheetId,
      message: `連線 Google Sheets 失敗: ${err.message || '請確認 Service Account 郵件是否已加入該試算表共用名單 (編輯者)'}`,
    });
  }
});

// 2. Auth: Player Login (驗證「玩家」工作表的 玩家名稱 與 密碼，並更新 最後一次登入時間)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, error: '請輸入玩家名稱！' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, error: '請輸入密碼！' });
  }

  const { client, sheetId, error } = getGoogleSheetsClient();
  if (error || !client || !sheetId) {
    return res.status(400).json({
      success: false,
      error: error || '未設定 Google Sheets API，請先於 .env 填寫 GOOGLE_SERVICE_ACCOUNT_JSON 及 GOOGLE_SHEET_ID',
    });
  }

  try {
    await ensurePlayersSheet(client, sheetId);

    // Read '玩家' sheet
    const response = await client.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'玩家'!A2:C1000`,
    });

    const rows = response.data.values || [];
    const normalizedUsername = username.trim().toLowerCase();
    const targetIndex = rows.findIndex(row => row[0]?.toString().trim().toLowerCase() === normalizedUsername);

    if (targetIndex === -1) {
      return res.status(404).json({
        success: false,
        notFound: true,
        error: `找不到玩家「${username}」，初次遊玩請切換至「註冊新玩家」！`,
      });
    }

    const targetRow = rows[targetIndex];
    const realUsername = targetRow[0]?.toString().trim();
    const storedPassword = targetRow[1]?.toString() || '';

    if (storedPassword !== password.toString()) {
      return res.status(401).json({
        success: false,
        error: '密碼錯誤，請確認後重新輸入！',
      });
    }

    // Update '最後一次登入時間'
    const nowTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    const rowNumber = targetIndex + 2; // Row number in sheet (1-based, offset by header row)

    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'玩家'!C${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nowTime]],
      },
    });

    return res.json({
      success: true,
      user: {
        username: realUsername,
        lastLoginTime: nowTime,
      },
      message: `歡迎回到夜市，${realUsername}！`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `登入過程存取試算表失敗: ${err.message || '請確認 Service Account 具有編輯權限'}`,
    });
  }
});

// 3. Auth: Player Register (新增玩家至「玩家」工作表：玩家名稱, 密碼, 最後一次登入時間)
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, error: '請輸入玩家名稱！' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, error: '請輸入密碼！' });
  }
  if (username.trim().length > 20) {
    return res.status(400).json({ success: false, error: '玩家名稱不可超過 20 個字元！' });
  }

  const { client, sheetId, error } = getGoogleSheetsClient();
  if (error || !client || !sheetId) {
    return res.status(400).json({
      success: false,
      error: error || '未設定 Google Sheets API，請先於 .env 填寫 GOOGLE_SERVICE_ACCOUNT_JSON 及 GOOGLE_SHEET_ID',
    });
  }

  try {
    await ensurePlayersSheet(client, sheetId);

    // Read '玩家' sheet to check existence
    const response = await client.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'玩家'!A2:C1000`,
    });

    const rows = response.data.values || [];
    const normalizedUsername = username.trim().toLowerCase();
    const exists = rows.some(row => row[0]?.toString().trim().toLowerCase() === normalizedUsername);

    if (exists) {
      return res.status(409).json({
        success: false,
        error: `玩家名稱「${username}」已存在，請更換名稱或直接登入！`,
      });
    }

    // Append to '玩家' sheet
    const nowTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    await client.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'玩家'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[username.trim(), password.toString(), nowTime]],
      },
    });

    return res.json({
      success: true,
      user: {
        username: username.trim(),
        lastLoginTime: nowTime,
      },
      message: `恭喜註冊成功！歡迎來到夜市射氣球，${username.trim()}！`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `註冊寫入試算表失敗: ${err.message || '請確認 Service Account 具有編輯權限'}`,
    });
  }
});

// 4. Read game records from Google Sheet
app.get('/api/sheets/records', async (req, res) => {
  const { client, sheetId, error } = getGoogleSheetsClient();

  if (error || !client || !sheetId) {
    return res.status(400).json({ success: false, error: error || '未設定 Google Sheets API' });
  }

  try {
    const scoresSheetName = await ensureScoresSheet(client, sheetId);

    const response = await client.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${scoresSheetName}'!A2:I100`,
    });

    const rows = response.data.values || [];
    const records = rows.map((row, idx) => ({
      id: idx + 1,
      timestamp: row[0] || '',
      playerName: row[1] || '夜市遊客',
      gameMode: row[2] || '',
      score: parseInt(row[3], 10) || 0,
      accuracy: row[4] || '0%',
      totalHits: parseInt(row[5], 10) || 0,
      maxCombo: parseInt(row[6], 10) || 0,
      gunName: row[7] || '',
      tokens: parseInt(row[8], 10) || 0,
    })).sort((a, b) => b.score - a.score);

    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || '讀取試算表失敗' });
  }
});

// 5. Append new score record to Google Sheet
app.post('/api/sheets/record', async (req, res) => {
  const { client, sheetId, error } = getGoogleSheetsClient();

  if (error || !client || !sheetId) {
    return res.status(400).json({ success: false, error: error || '未設定 Google Sheets API' });
  }

  const { playerName, gameMode, score, accuracy, totalHits, maxCombo, gunName, tokens } = req.body;

  try {
    const scoresSheetName = await ensureScoresSheet(client, sheetId);

    const nowTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    const newRow = [
      nowTime,
      playerName || '夜市神射手',
      gameMode || '限時挑戰',
      score || 0,
      typeof accuracy === 'number' ? `${accuracy}%` : accuracy || '0%',
      totalHits || 0,
      maxCombo || 0,
      gunName || '復古軟木塞槍',
      tokens || 0,
    ];

    const appendRes = await client.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${scoresSheetName}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return res.json({
      success: true,
      message: '已成功將得分記錄上傳至 Google Sheets！',
      updatedRange: appendRes.data.updates?.updatedRange,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `寫入失敗: ${err.message || '請確認 Service Account 擁有編輯者權限'}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Night Market Shooting Gallery server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
