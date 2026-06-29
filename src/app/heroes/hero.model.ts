export type HeroRole = 'Vanguard' | 'Duelist' | 'Strategist' | 'Multi-Role';

export interface HeroAbilityTechnicalDetail {
  label: string;
  value: string;
}

export interface HeroAbility {
  name: string;
  type: string;
  description: string;
  technicalDetails?: HeroAbilityTechnicalDetail[];
}

export interface HeroRoleAbilityKit {
  role: HeroRole;
  label: string;
  abilities: HeroAbility[];
}

export interface HeroBuildProfile {
  Utility: number;
  Damage: number;
  Sustain: number;
  Mobility: number;
  Ultimate: number;
}

export interface HeroBuildProfileRationale {
  source: {
    label: string;
    url: string;
  };
  reason: string;
  strongestSignals: string[];
}

export interface HeroPlaystyleGuide {
  id: string;
  role?: HeroRole;
  title: string;
  sourceTitle?: string;
  sourceUrl?: string;
  summary: string;
  whenToUse: string;
  coreIdeas: {
    label: string;
    description: string;
  }[];
  upgradeNotes: string[];
  ultimateNotes: string[];
}

export type HeroVideoType = 'paz-gameplay' | 'paz-counters-combos';

export interface HeroVideo {
  heroId: string | null;
  role?: HeroRole;
  videoType: HeroVideoType;
  youtubeId: string;
  title: string;
}

export interface Hero {
  id: string;
  name: string;
  role: HeroRole;
  difficulty: number;
  summary: string;
  overview?: string;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
  counters: string[];
  synergies: string[];
  abilities: HeroAbility[];
  roleAbilityKits?: HeroRoleAbilityKit[];
  playstyles?: HeroPlaystyleGuide[];
  buildProfile?: HeroBuildProfile;
  buildProfileRationale?: HeroBuildProfileRationale;
  imageUrl: string;
}
