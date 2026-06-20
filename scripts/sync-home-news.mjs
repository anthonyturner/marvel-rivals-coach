import { syncHomeNews } from '../src/home-news-sync.ts';

const result = await syncHomeNews();
console.log(`Synced ${result.latestNews.length} home news cards at ${result.updatedAt}`);
