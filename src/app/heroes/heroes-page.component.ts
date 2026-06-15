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
import { Hero, HeroAbility, HeroRole, HeroRoleAbilityKit, HeroVideo, HeroVideoType } from './hero.model';

type HeroRoleFilter = HeroRole | 'All';
type HeroGridMode = 'rows' | 'thumbs';

interface HeroVideoSearch {
  label: string;
  query: string;
  url: string;
  embedUrl?: SafeResourceUrl;
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
      this.heroes.set(heroes);
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

  displayedPlaystyle(hero: Hero): string {
    const kit = this.selectedAbilityKit(hero);

    if (kit) {
      return this.buildPlaystyle(hero, kit.role, kit.abilities);
    }

    return hero.playstyle;
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

  heroRoleLabel(hero: Hero): HeroRole {
    const role = this.selectedRole();

    return role !== 'All' && this.heroMatchesRole(hero, role) ? role : hero.role;
  }

  private heroMatchesRole(hero: Hero, role: HeroRole): boolean {
    return hero.role === role || this.roleAbilityKits(hero).some((kit) => kit.role === role);
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
