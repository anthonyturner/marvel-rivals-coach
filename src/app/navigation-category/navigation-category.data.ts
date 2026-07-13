export interface NavigationCategory {
  label: string;
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    label: string;
    path: string;
    description: string;
    enabled: boolean;
  }>;
}

export const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    label: 'Learn',
    path: '/learn',
    eyebrow: 'Learning Library',
    title: 'Build habits that hold up in real matches.',
    description:
      'Start with the foundations, then sharpen the decisions that matter for your role and your next fight.',
    items: [
      { label: 'Guides', path: '/hero-guides', description: 'Hero and role fundamentals in one library.', enabled: true },
      { label: 'Techniques', path: '/techniques', description: 'Practical mechanics and fight habits to train.', enabled: true },
      { label: 'Build Theory', path: '/build-theory', description: 'Understand choices, upgrades, and game plans.', enabled: true },
      { label: 'Learning Paths', path: '/learning-paths', description: 'Follow a focused route through your next skill.', enabled: true },
      { label: 'Power Positions', path: '/power-positions', description: 'Learn where each fight gives you an advantage.', enabled: true },
      { label: 'Strategic Cover', path: '/strategic-cover', description: 'Turn terrain into safer, repeatable decisions.', enabled: true },
    ],
  },
  {
    label: 'Resources',
    path: '/resources',
    eyebrow: 'Reference Desk',
    title: 'Keep the useful information within reach.',
    description:
      'Quick references for concepts, current numbers, and lessons you can watch when you need an example.',
    items: [
      { label: 'Media Tutorials', path: '/media-tutorials', description: 'Browse coaching videos by topic.', enabled: true },
      { label: 'Game Stats', path: '/game-stats', description: 'Review the numbers behind the roster.', enabled: true },
      { label: 'Tier List', path: '/tier-list', description: 'Compare synced hero tiers by season and rank.', enabled: true },
      { label: 'Glossary', path: '/glossary', description: 'Translate common hero-shooter terms quickly.', enabled: true },
    ],
  },
  {
    label: 'Tools',
    path: '/tools',
    eyebrow: 'Practice Tools',
    title: 'Turn a confusing match into a clear next step.',
    description:
      'Use these tools before you queue, after a tough fight, or when you want a more deliberate practice session.',
    items: [
      { label: 'Watch Next Quiz', path: '/watch-next', description: 'Get a targeted lesson for your current problem.', enabled: true },
      { label: 'Counters', path: '/counters', description: 'Explore practical matchup answers.', enabled: true },
      { label: 'Team Builder', path: '/team-builder', description: 'Sketch a team composition with intention.', enabled: true },
      { label: 'AI Coach', path: '/ai-coach', description: 'Personalized coaching is coming soon.', enabled: false },
    ],
  },
];
