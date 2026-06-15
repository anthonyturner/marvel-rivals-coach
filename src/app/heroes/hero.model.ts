export type HeroRole = 'Vanguard' | 'Duelist' | 'Strategist' | 'Multi-Role';

export interface HeroAbility {
  name: string;
  type: string;
  description: string;
}

export interface HeroRoleAbilityKit {
  role: HeroRole;
  label: string;
  abilities: HeroAbility[];
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
  imageUrl: string;
}
