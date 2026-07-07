import { syncTierList } from '../src/tier-list-sync.ts';

const result = await syncTierList();

console.log(result.message);
