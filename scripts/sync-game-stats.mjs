import { syncGameStats } from '../src/game-stats-sync.ts';

const result = await syncGameStats();

console.log(`Saved game-stat snapshot for ${result.snapshotDate}.`);
console.log(`Games: ${result.games.length}`);
console.log(`Compared with: ${result.previousSnapshot?.snapshotDate ?? 'first stored snapshot'}`);
