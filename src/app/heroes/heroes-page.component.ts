import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { HeroDataService } from './hero-data.service';
import {
  buildHeroBuildProfileRationale,
  computeHeroBuildProfile,
  heroBuildTypes,
  HeroBuildType,
} from './hero-build-profile';
import {
  Hero,
  HeroAbility,
  HeroBuildProfileRationale,
  HeroPlaystyleGuide,
  HeroRole,
  HeroRoleAbilityKit,
  HeroVideo,
  HeroVideoType,
} from './hero.model';

type HeroRoleFilter = HeroRole | 'All';
type HeroGridMode = 'rows' | 'thumbs';

interface HeroVideoSearch {
  label: string;
  query: string;
  url: string;
  embedUrl?: SafeResourceUrl;
}

interface UltimateStrategy {
  ability: HeroAbility;
  sourceDescription: string;
  strategy: string;
}

interface DeadpoolUpgradeStep {
  rank: number | string;
  name: string;
  reason: string;
  note: string;
}

@Component({
  selector: 'app-heroes-page',
  imports: [CommonModule],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(8px)',
        }),
        animate('400ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)',
        })),
      ]),
    ]),
    trigger('modalZoom', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(24px) scale(0.92)',
        }),
        animate('260ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({
          opacity: 0,
          transform: 'translateY(18px) scale(0.96)',
        })),
      ]),
    ]),
  ],
})
export class HeroesPageComponent implements OnInit {
  private readonly heroDataService = inject(HeroDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly heroes = signal<Hero[]>([]);
  private readonly heroVideos = signal<HeroVideo[]>([]);

  readonly roles: HeroRoleFilter[] = ['All', 'Vanguard', 'Duelist', 'Strategist'];
  readonly selectedRole = signal<HeroRoleFilter>('All');
  readonly heroGridMode = signal<HeroGridMode>('rows');
  readonly searchTerm = signal('');
  readonly selectedHeroId = signal(this.heroes()[0]?.id ?? '');
  readonly selectedAbilityKitRole = signal<HeroRole>('Vanguard');
  readonly isHeroDetailModalOpen = signal(false);
  readonly activeAbilityAnchorId = signal('');
  readonly buildTypes = heroBuildTypes();
  readonly deadpoolUpgradeOrders: Record<Exclude<HeroRole, 'Multi-Role'>, DeadpoolUpgradeStep[]> = {
    Vanguard: [
      {
        rank: 1,
        name: 'Dual Desert Eagles',
        reason: 'Adds ranged pressure and Boom Emoji explosive value to your baseline weapon loop.',
        note: 'Take after core space tools unless you need safer poke early.',
      },
      {
        rank: 4,
        name: 'Hazardous Hijinks',
        reason: 'Hit-refresh bounce adds engage, chase, and escape options.',
        note: 'Move up on maps with strong vertical routes.',
      },
      {
        rank: 5,
        name: 'Deadpool In Your Area',
        reason: 'Best early space tool: 12s cooldown, AoE vision disruption, attack speed, and ally damage reduction.',
        note: 'Take first when you need to walk space.',
      },
      {
        rank: 2,
        name: 'Kick@$$ Katana',
        reason: 'Improves close-range brawl pressure and follow-up after Bunny Bounce.',
        note: 'Move up when you are consistently fighting in melee range.',
      },
      {
        rank: 3,
        name: 'Magical Unicorn Shield!',
        reason: 'Adds a 400-health shield on a 12s cooldown for crosses, holds, and resets.',
        note: 'Swap to first if your team is being burst early.',
      },
      {
        rank: 7,
        name: 'The Big Test',
        reason: 'Teamfight swing with bonus health, healing, speed, and challenge payoff.',
        note: 'Best before planned objective fights.',
      },
      {
        rank: 6,
        name: 'The Ban Hammer',
        reason: 'Single-target taunt upgrade with sustain and missed-ability punishment.',
        note: 'Move up into ability-spam matchups.',
      },
    ],
    Duelist: [
      {
        rank: 3,
        name: 'Headshot!',
        reason: 'High-frequency 10s damage tool with repeat throws and third-toss explosion.',
        note: 'Cleanest first pick for poke and picks.',
      },
      {
        rank: 5,
        name: 'Deadpool In Your Area',
        reason: 'Adds AoE disruption, 30/s field damage, self damage reduction, and attack speed.',
        note: 'Move first for tight rooms or objective brawls.',
      },
      {
        rank: 4,
        name: 'Hazardous Hijinks',
        reason: 'Improves chase and resets with two charges and hit refresh.',
        note: 'Take earlier for flank or dive pressure.',
      },
      {
        rank: 7,
        name: 'Pop Quiz!',
        reason: 'Snowballs fights with speed, healing, damage boost, and cooldown refresh.',
        note: 'Best when you reliably complete the challenge.',
      },
      {
        rank: 6,
        name: 'Skill Issue',
        reason: 'Adds 25/s damage over time and Vulnerability stacks to the taunt.',
        note: 'Move up into ability-heavy duelists.',
      },
      {
        rank: 1,
        name: 'Dual Desert Eagles',
        reason: 'Adds ranged poke and Boom Emoji explosive damage to the baseline DPS loop.',
        note: 'Take after core pick tools unless you need safer ranged pressure early.',
      },
      {
        rank: 2,
        name: 'Kick@$$ Katana',
        reason: 'Improves close-range confirm damage and Bunny Hop follow-up pressure.',
        note: 'Move up when you are reliably finishing fights in brawl range.',
      },
    ],
    Strategist: [
      {
        rank: 3,
        name: 'Bouncing Bobblehead',
        reason: 'Repeatable 8s damage and healing with return throws and stronger third toss.',
        note: 'Best first for steady healing between fights.',
      },
      {
        rank: 7,
        name: 'Final Exam',
        reason: 'Huge teamfight swing: 80/s healing, 120/s completed healing, and 3000 bonus health.',
        note: 'Strong when completion is realistic.',
      },
      {
        rank: 5,
        name: 'Deadpool In Your Area',
        reason: 'Adds 70/s field healing, 30/s field damage, damage boost, and disruption.',
        note: 'Excellent for grouped brawl comps.',
      },
      {
        rank: 4,
        name: 'Healing Hijinks',
        reason: 'Adds 55 healing in an 8m field while keeping dash refresh.',
        note: 'Strong when healing while moving matters.',
      },
      {
        rank: 1,
        name: 'Dual Desert Eagles',
        reason: 'Adds safer ranged damage and healing throughput to your basic pressure loop.',
        note: 'Take after the core support cooldown upgrades.',
      },
      {
        rank: 2,
        name: 'Kick@$$ Katana',
        reason: 'Adds close-range pressure and Healing Hop follow-up value.',
        note: 'Best when you can safely play in brawl range.',
      },
      {
        rank: 6,
        name: 'Pwnage Pound',
        reason: 'Taunt upgrade that turns missed enemy abilities into ally healing.',
        note: 'Move up against heavy dive pressure.',
      },
    ],
  };

  readonly filteredHeroes = computed(() => {
    const role = this.selectedRole();
    const searchTerm = this.searchTerm().trim().toLowerCase();

    return this.heroes().filter((hero) => {
      const matchesRole = role === 'All' || this.heroMatchesRole(hero, role);
      const matchesSearch =
        searchTerm.length === 0 ||
        hero.name.toLowerCase().includes(searchTerm) ||
        hero.summary.toLowerCase().includes(searchTerm) ||
        hero.strengths.some((strength) => strength.toLowerCase().includes(searchTerm));

      return matchesRole && matchesSearch;
    });
  });

  readonly selectedHero = computed<Hero | undefined>(() => {
    const visibleHeroes = this.filteredHeroes();
    const selectedHero = visibleHeroes.find((hero) => hero.id === this.selectedHeroId());

    // Keep the detail panel populated when filters hide the previously selected hero.
    return selectedHero ?? visibleHeroes[0] ?? this.heroes()[0];
  });

  readonly selectedHeroVideos = computed<HeroVideoSearch[]>(() => {
    const hero = this.selectedHero();

    if (!hero) {
      return [];
    }

    const guide = this.gefestRoleGuide(this.heroRoleLabel(hero));
    const gameplay = this.pazGameplayVideo(hero);
    const countersAndCombos = this.pazCountersCombosVideo(hero);

    return [
      guide,
      gameplay,
      countersAndCombos,
    ];
  });

  readonly selectedHeroYoutubeUrl = computed(() =>
    this.youtubeSearchUrl(`Marvel Rivals ${this.selectedHero()?.name ?? ''}`),
  );
  ngOnInit(): void {
    forkJoin({
      heroes: this.heroDataService.getHeroes(),
      heroVideos: this.heroDataService.getHeroVideos(),
    }).subscribe(({ heroes, heroVideos }) => {
      this.heroes.set(heroes.map((hero) => ({
        ...hero,
        buildProfile: hero.buildProfile ?? computeHeroBuildProfile(hero),
      })));
      this.heroVideos.set(heroVideos);
      this.selectedHeroId.set(heroes[0]?.id ?? '');
    });
  }

  selectRole(role: HeroRoleFilter): void {
    this.selectedRole.set(role);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
    this.selectedAbilityKitRole.set(role === 'All' ? 'Vanguard' : role);
    this.closeHeroDetailModal();
  }

  selectHeroGridMode(mode: HeroGridMode): void {
    this.heroGridMode.set(mode);
  }

  selectHero(heroId: string): void {
    this.selectedHeroId.set(heroId);
    const role = this.selectedRole();

    if (role !== 'All') {
      this.selectedAbilityKitRole.set(role);
    }

    this.openHeroDetailModal();
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
    this.closeHeroDetailModal();
  }

  roleClass(role: HeroRole): string {
    return role.toLowerCase();
  }

  heroInitials(hero: Hero): string {
    return hero.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2);
  }

  selectAbilityKit(role: HeroRole): void {
    this.selectedAbilityKitRole.set(role);
  }

  openHeroDetailModal(): void {
    if (this.selectedHero()) {
      this.isHeroDetailModalOpen.set(true);
    }
  }

  closeHeroDetailModal(): void {
    this.isHeroDetailModalOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeHeroDetailModalOnEscape(): void {
    this.closeHeroDetailModal();
  }

  @HostListener('click', ['$event'])
  handleAbilityLinkClick(event: MouseEvent): void {
    const link = (event.target as Element).closest<HTMLAnchorElement>('[data-ability-target]');

    if (!link) {
      return;
    }

    event.preventDefault();
    const targetId = link.dataset['abilityTarget'] ?? '';
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    this.activeAbilityAnchorId.set(targetId);
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  roleAbilityKits(hero: Hero): HeroRoleAbilityKit[] {
    return hero.roleAbilityKits ?? [];
  }

  selectedAbilityKit(hero: Hero): HeroRoleAbilityKit | undefined {
    const kits = this.roleAbilityKits(hero);

    return kits.find((kit) => kit.role === this.selectedAbilityKitRole()) ?? kits[0];
  }

  displayedAbilities(hero: Hero): HeroAbility[] {
    return this.selectedAbilityKit(hero)?.abilities ?? hero.abilities;
  }

  activeAbilities(hero: Hero): HeroAbility[] {
    return this.displayedAbilities(hero).filter((ability) => !this.isPassiveAbility(ability));
  }

  passiveAbilities(hero: Hero): HeroAbility[] {
    return this.displayedAbilities(hero).filter((ability) => this.isPassiveAbility(ability));
  }

  displayedPlaystyle(hero: Hero): string {
    const kit = this.selectedAbilityKit(hero);
    const guide = this.displayedPlaystyleGuides(hero)[0];

    if (guide) {
      return guide.summary;
    }

    if (kit) {
      return this.buildPlaystyle(hero, kit.role, kit.abilities);
    }

    return hero.playstyle;
  }

  displayedPlaystyleGuides(hero: Hero): HeroPlaystyleGuide[] {
    const role = this.selectedAbilityKit(hero)?.role ?? this.heroRoleLabel(hero);

    return (hero.playstyles ?? []).filter((playstyle) => !playstyle.role || playstyle.role === role);
  }

  ultimateStrategies(hero: Hero): UltimateStrategy[] {
    const abilities = this.displayedAbilities(hero);
    const role = this.selectedAbilityKit(hero)?.role ?? this.heroRoleLabel(hero);
    const hasExplicitUltimate = abilities.some((ability) => this.hasUltimateSignal(ability));
    const ultimate = this.findPrimaryUltimate(abilities, hasExplicitUltimate);

    if (!ultimate) {
      return [];
    }

    return [{
      ability: ultimate,
      sourceDescription: this.cleanAbilityDescription(ultimate.description),
      strategy: this.buildUltimateStrategy(hero, role, ultimate),
    }];
  }

  deadpoolUpgradeOrder(hero: Hero): DeadpoolUpgradeStep[] {
    if (hero.id !== 'deadpool') {
      return [];
    }

    const role = this.selectedAbilityKit(hero)?.role;

    if (!role || role === 'Multi-Role') {
      return this.deadpoolUpgradeOrders['Vanguard'];
    }

    return this.deadpoolUpgradeOrders[role];
  }

  deadpoolUpgradeRole(hero: Hero): HeroRole {
    return this.selectedAbilityKit(hero)?.role ?? 'Vanguard';
  }

  highlightedAbilityText(hero: Hero, text: string): SafeHtml {
    const abilities = [...this.displayedAbilities(hero)].sort((a, b) => b.name.length - a.name.length);
    const html = this.escapeHtml(text);

    if (abilities.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    const abilityLookup = new Map(abilities.map((ability) => [this.escapeHtml(ability.name).toLowerCase(), ability]));
    const names = abilities.map((ability) => this.escapeRegExp(this.escapeHtml(ability.name)));
    const pattern = new RegExp(`(^|[^a-zA-Z0-9])(${names.join('|')})(?=[^a-zA-Z0-9]|$)`, 'gi');

    const linkedHtml = html.replace(pattern, (match, prefix: string, abilityName: string) => {
      const ability = abilityLookup.get(abilityName.toLowerCase());

      if (!ability) {
        return match;
      }

      const anchor = this.abilityAnchorId(hero, ability);

      return `${prefix}<a class="ability-text-link" href="#${anchor}" data-ability-target="${anchor}">${abilityName}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(linkedHtml);
  }

  abilityAnchorId(hero: Hero, ability: HeroAbility): string {
    return `ability-${hero.id}-${this.slugify(ability.name)}`;
  }

  technicalDetailType(label: string): string {
    const normalized = label.toLowerCase();

    if (/damage|critical|vulnerability|boost/.test(normalized)) {
      return 'damage';
    }

    if (/cooldown|recharge|interval|rate/.test(normalized)) {
      return 'cooldown';
    }

    if (/duration|time/.test(normalized)) {
      return 'duration';
    }

    if (/heal|health|bonus health/.test(normalized)) {
      return 'healing';
    }

    if (/range|radius|distance|field|width|height/.test(normalized)) {
      return 'range';
    }

    if (/speed|movement|dash|projectile/.test(normalized)) {
      return 'speed';
    }

    if (/ammo|charge|energy|cost/.test(normalized)) {
      return 'resource';
    }

    return 'stat';
  }

  technicalDetailIcon(label: string): string {
    const iconClasses: Record<string, string> = {
      damage: 'fa-solid fa-burst',
      cooldown: 'fa-solid fa-clock-rotate-left',
      duration: 'fa-regular fa-hourglass-half',
      healing: 'fa-solid fa-heart-pulse',
      range: 'fa-solid fa-crosshairs',
      speed: 'fa-solid fa-gauge-high',
      resource: 'fa-solid fa-battery-half',
      stat: 'fa-solid fa-chart-simple',
    };

    return iconClasses[this.technicalDetailType(label)] ?? iconClasses['stat'];
  }

  heroRoleLabel(hero: Hero): HeroRole {
    const role = this.selectedRole();

    return role !== 'All' && this.heroMatchesRole(hero, role) ? role : hero.role;
  }

  heroBuildValue(hero: Hero, type: HeroBuildType): number {
    return (hero.buildProfile ?? computeHeroBuildProfile(hero))[type];
  }

  heroBuildProfileRationale(hero: Hero): HeroBuildProfileRationale {
    return hero.buildProfileRationale ?? buildHeroBuildProfileRationale(hero);
  }

  scoreTone(value: number, max = 10): string {
    const ratio = max > 0 ? value / max : 0;

    if (ratio >= 0.7) {
      return 'score-high';
    }

    if (ratio >= 0.4) {
      return 'score-mid';
    }

    return 'score-low';
  }

  private heroMatchesRole(hero: Hero, role: HeroRole): boolean {
    return hero.role === role || this.roleAbilityKits(hero).some((kit) => kit.role === role);
  }

  private isPassiveAbility(ability: HeroAbility): boolean {
    return ability.type === 'Passive';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private buildPlaystyle(hero: Hero, role: HeroRole, abilities: HeroAbility[]): string {
    if (hero.id === 'deadpool' && role === 'Vanguard') {
      return 'Force attention, make the enemy team uncomfortable, build style points, and cycle in and out of pressure without exploding.';
    }

    const primary = abilities[0]?.name ?? hero.name;
    const utility =
      abilities.find((ability) => ability.type === 'Ability')?.name ??
      abilities.find((ability) => ability.type !== 'Normal Attack' && ability.type !== 'Ultimate')?.name ??
      abilities[1]?.name ??
      primary;
    const weakness = hero.weaknesses[0]?.replace(/\.$/, '').toLowerCase();

    switch (role) {
      case 'Vanguard':
        return `Anchor space with ${utility}, then use ${primary} to pressure targets that overcommit. Respect ${weakness ?? 'cooldown windows'} before taking extended trades.`;
      case 'Strategist':
        return `Play near cover and keep allies in your line of sight while cycling ${primary} and ${utility}. Save your escape or sustain tools for dive pressure instead of spending them early.`;
      case 'Duelist':
        return `Look for off-angles where ${primary} can pressure exposed targets, then commit with ${utility} after enemy peel is forced. Reset to cover before cooldowns are punished.`;
      default:
        return `Flex your role around the selected kit: use ${primary} for baseline pressure and ${utility} to swing the fight when enemies are already committed.`;
    }
  }

  private findPrimaryUltimate(
    abilities: HeroAbility[],
    hasExplicitUltimate: boolean,
  ): HeroAbility | undefined {
    const explicitUltimate = abilities.find((ability) => /ultimate/i.test(ability.type));

    if (explicitUltimate) {
      return explicitUltimate;
    }

    const energyCostUltimate = abilities.find((ability) => this.hasUltimateSignal(ability));

    if (energyCostUltimate) {
      return energyCostUltimate;
    }

    if (hasExplicitUltimate) {
      return undefined;
    }

    return abilities.find((ability) =>
      ability.type !== 'Normal Attack' &&
      ability.type !== 'Mobility' &&
      ability.type !== 'Team-Up Ability' &&
      ability.type !== 'Passive',
    );
  }

  private hasUltimateSignal(ability: HeroAbility): boolean {
    const technicalDetails = ability.technicalDetails ?? [];

    return /ultimate/i.test(ability.type) ||
      /ultimate/i.test(ability.description) ||
      technicalDetails.some((detail) => /energy cost/i.test(detail.label));
  }

  private buildUltimateStrategy(hero: Hero, role: HeroRole, ability: HeroAbility): string {
    const description = this.cleanAbilityDescription(ability.description);
    const lowerText = `${ability.name} ${description}`.toLowerCase();
    const useCase = this.ultimateUseCaseLine(lowerText, ability.name);
    const timing = this.ultimateTimingLine(role, ability.name);

    return `${timing} ${useCase}`;
  }

  private cleanAbilityDescription(description: string): string {
    return description.replace(/\s+/g, ' ').trim();
  }

  private ultimateTimingLine(role: HeroRole, ultimateName: string): string {
    switch (role) {
      case 'Vanguard':
        return `Use ${ultimateName} as your team crosses space or when enemies commit into your frontline.`;
      case 'Strategist':
        return `Hold ${ultimateName} for the enemy engage, a teammate-saving swing, or the fight your team has already chosen to take.`;
      case 'Duelist':
        return `Look for ${ultimateName} after enemy mobility, shields, or defensive cooldowns are forced.`;
      default:
        return `Use ${ultimateName} only after choosing the role job you need to solve in the fight.`;
    }
  }

  private ultimateUseCaseLine(text: string, ultimateName: string): string {
    if (/revival|revive|resurrect/.test(text)) {
      return 'Stay alive before casting, catch multiple fallen allies in range, then call the re-engage as they return.';
    }

    if (/heal|healing|restore|sustain/.test(text)) {
      return 'Start it as burst damage begins, not after allies are already split, and keep cover close while the sustain value builds.';
    }

    if (/shield|barrier|boundary|aegis|protect/.test(text)) {
      return 'Place it to block the strongest enemy angle so your team can cross, stabilize, or finish a target.';
    }

    if (/stun|disable|prison|snare|taunt|seduction|control/.test(text)) {
      return 'Aim it at committed enemies or priority targets with limited escape routes so your team can collapse immediately.';
    }

    if (/transform|darkchild|goddess|legend|living chi|god of thunder|unleashed/.test(text)) {
      return 'Activate before the hard commit, then spend the empowered window aggressively while keeping one exit path.';
    }

    if (/zone|storm|hurricane|inferno|tsunami|rampage|spin|prison/.test(text)) {
      return 'Use the area pressure to split the enemy team, deny a doorway, or force them off the objective.';
    }

    if (/challenge|jackpot|taunt/.test(text)) {
      return 'Choose a target that must fight you or give space, then commit only when your movement route is planned.';
    }

    if (/damage|explode|blast|cannon|impact|meteor|judgement|erasure/.test(text)) {
      return 'Pair it with an off-angle, teammate crowd control, or a forced defensive cooldown so the burst lands before enemies spread.';
    }

    return `Set up the angle first, confirm your team can follow, then commit while enemy answers are limited.`;
  }

  private youtubeSearchUrl(query: string): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  private gefestRoleGuide(role: HeroRole): HeroVideoSearch {
    const roleVideos: Record<HeroRole, { id: string; title: string }> = {
      Vanguard: {
        id: 'TOZZRM5JnSM',
        title: 'How to Carry on Vanguard',
      },
      Duelist: {
        id: '6FGNkCvqhgA',
        title: 'How to Carry on Duelist',
      },
      Strategist: {
        id: 'K9Ce8VTHxuc',
        title: 'How to Carry on Strategist',
      },
      'Multi-Role': {
        id: 'rqxP_tKV2vc',
        title: 'Strategic Cover Usage in Marvel Rivals',
      },
    };
    const video = roleVideos[role];

    return {
      label: role === 'Duelist' ? 'Gefest DPS guide' : `Gefest ${role} guide`,
      query: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: this.youtubeVideoEmbedUrl(video.id),
    };
  }

  private pazGameplayVideo(hero: Hero): HeroVideoSearch {
    return this.pazVideo(hero, 'paz-gameplay');
  }


  private pazCountersCombosVideo(hero: Hero): HeroVideoSearch {
    return this.pazVideo(hero, 'paz-counters-combos');
  }

  private pazVideo(hero: Hero, videoType: HeroVideoType): HeroVideoSearch {
    const video = this.findHeroVideo(hero, videoType);
    const isHeroSpecific = video?.heroId === hero.id;
    const label = videoType === 'paz-gameplay'
      ? isHeroSpecific ? 'PAZ hero gameplay' : `PAZ ${hero.role} gameplay`
      : isHeroSpecific ? 'PAZ counters and combos' : `PAZ ${hero.role} counters and combos`;
    const query = video?.title ?? `Marvel Rivals ${hero.name} ${videoType === 'paz-gameplay' ? 'PAZ gameplay' : 'counters combos'}`;

    if (!video) {
      return {
        label,
        query,
        url: this.youtubeSearchUrl(query),
      };
    }

    return {
      label,
      query: video.title,
      url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      embedUrl: this.youtubeVideoEmbedUrl(video.youtubeId),
    };
  }

  private findHeroVideo(hero: Hero, videoType: HeroVideoType): HeroVideo | undefined {
    const videos = this.heroVideos().filter((video) => video.videoType === videoType);

    return videos.find((video) => video.heroId === hero.id)
      ?? videos.find((video) => !video.heroId && video.role === hero.role);
  }


  private youtubeVideoEmbedUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
