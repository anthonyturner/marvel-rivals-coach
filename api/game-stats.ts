import type { IncomingMessage, ServerResponse } from 'http';

import { sendJson } from '../src/vercel-api.js';

interface SteamGameSnapshot {
  appId: number;
  name: string;
  category: string;
  fallbackCurrentPlayers: number;
  dailyPeak: number;
  allTimePeak: number;
  steamDailyRank: string;
  topSellerRank: string;
  twitchViewers: number;
  reviewSummary: string;
  sourceUrl: string;
}

const snapshotDate = 'June 19, 2026';
const steamCurrentPlayersUrl = 'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/';

const games: SteamGameSnapshot[] = [
  {
    appId: 2767030,
    name: 'Marvel Rivals',
    category: 'Hero shooter',
    fallbackCurrentPlayers: 59562,
    dailyPeak: 118674,
    allTimePeak: 644269,
    steamDailyRank: '#15',
    topSellerRank: '#4',
    twitchViewers: 24451,
    reviewSummary: 'Mostly Positive, 75.74% SteamDB rating, 394k reviews',
    sourceUrl: 'https://steamdb.info/app/2767030/charts/',
  },
  {
    appId: 2357570,
    name: 'Overwatch',
    category: 'Hero shooter',
    fallbackCurrentPlayers: 56818,
    dailyPeak: 81755,
    allTimePeak: 165651,
    steamDailyRank: '#14',
    topSellerRank: '#19',
    twitchViewers: 34794,
    reviewSummary: 'Mostly Negative, 30.94% SteamDB rating, 407k reviews',
    sourceUrl: 'https://steamdb.info/app/2357570/charts/',
  },
  {
    appId: 1172470,
    name: 'Apex Legends',
    category: 'Battle royale shooter',
    fallbackCurrentPlayers: 121009,
    dailyPeak: 194956,
    allTimePeak: 624473,
    steamDailyRank: '#8',
    topSellerRank: '#18',
    twitchViewers: 13672,
    reviewSummary: 'Mixed, 67.41% SteamDB rating, 1.05M reviews',
    sourceUrl: 'https://steamdb.info/app/1172470/charts/',
  },
  {
    appId: 570,
    name: 'Dota 2',
    category: 'MOBA',
    fallbackCurrentPlayers: 382833,
    dailyPeak: 609443,
    allTimePeak: 1295114,
    steamDailyRank: '#2',
    topSellerRank: '#40',
    twitchViewers: 39955,
    reviewSummary: 'Very Positive, 80.38% SteamDB rating, 2.72M reviews',
    sourceUrl: 'https://steamdb.info/app/570/charts/',
  },
  {
    appId: 730,
    name: 'Counter-Strike 2',
    category: 'Tactical shooter',
    fallbackCurrentPlayers: 854652,
    dailyPeak: 1374512,
    allTimePeak: 1862531,
    steamDailyRank: '#1',
    topSellerRank: '#3',
    twitchViewers: 0,
    reviewSummary: 'Very Positive, 85.83% SteamDB rating, 9.67M reviews',
    sourceUrl: 'https://steamdb.info/app/730/charts/',
  },
];

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const fetchedAt = new Date().toISOString();
  const liveGames = await Promise.all(games.map(async (game) => ({
    ...game,
    currentPlayers: await getCurrentPlayers(game.appId, game.fallbackCurrentPlayers),
  })));

  sendJson(res, 200, {
    snapshotDate,
    fetchedAt,
    currentPlayerSource: 'Valve ISteamUserStats GetNumberOfCurrentPlayers',
    currentPlayerSourceUrl: steamCurrentPlayersUrl,
    games: liveGames.map(({ fallbackCurrentPlayers, ...game }) => game),
  });
}

async function getCurrentPlayers(appId: number, fallback: number): Promise<number> {
  try {
    const response = await fetch(`${steamCurrentPlayersUrl}?appid=${appId}`, {
      headers: {
        accept: 'application/json',
        'user-agent': 'marvel-rivals-coach-game-stats/1.0',
      },
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json() as {
      response?: {
        player_count?: number;
      };
    };

    return payload.response?.player_count ?? fallback;
  } catch {
    return fallback;
  }
}
