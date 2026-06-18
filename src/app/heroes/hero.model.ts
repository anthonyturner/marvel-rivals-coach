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
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
  counters: string[];
  synergies: string[];
  abilities: HeroAbility[];
  roleAbilityKits?: HeroRoleAbilityKit[];
  buildProfile?: HeroBuildProfile;
  imageUrl: string;
}
