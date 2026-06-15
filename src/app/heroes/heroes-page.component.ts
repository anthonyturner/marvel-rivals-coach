import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { HeroDataService } from './hero-data.service';
import { Hero, HeroAbility, HeroRole, HeroRoleAbilityKit } from './hero.model';

type HeroRoleFilter = HeroRole | 'All';

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
  ],
})
export class HeroesPageComponent implements OnInit {
  private readonly heroDataService = inject(HeroDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly heroes = signal<Hero[]>([]);

  readonly roles: HeroRoleFilter[] = ['All', 'Vanguard', 'Duelist', 'Strategist'];
  readonly selectedRole = signal<HeroRoleFilter>('All');
  readonly searchTerm = signal('');
  readonly selectedHeroId = signal(this.heroes()[0]?.id ?? '');
  readonly selectedAbilityKitRole = signal<HeroRole>('Vanguard');

  readonly filteredHeroes = computed(() => {
    const role = this.selectedRole();
    const searchTerm = this.searchTerm().trim().toLowerCase();

    return this.heroes().filter((hero) => {
      const matchesRole = role === 'All' || hero.role === role;
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

    const guide = this.gefestRoleGuide(hero.role);
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
    this.heroDataService.getHeroes().subscribe((heroes) => {
      this.heroes.set(heroes);
      this.selectedHeroId.set(heroes[0]?.id ?? '');
    });
  }

  selectRole(role: HeroRoleFilter): void {
    this.selectedRole.set(role);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
    this.selectedAbilityKitRole.set('Vanguard');
  }

  selectHero(heroId: string): void {
    this.selectedHeroId.set(heroId);
    this.selectedAbilityKitRole.set('Vanguard');
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
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
    const heroVideos: Record<string, { id: string; title: string }> = {
      'adam-warlock': {
        id: 'GqRusLyDjL0',
        title: 'Adam Warlock Guide | The BEST Comprehensive Guide to ADAM WARLOCK in Marvel Rivals',
      },
      angela: {
        id: 'HRkY4e6CFow',
        title: 'Angela Guide | The BEST Comprehensive Guide to ANGELA in Marvel Rivals',
      },
      'black-cat': {
        id: 'pL7mAWytrB0',
        title: 'Black Cat Guide | The BEST Comprehensive Guide to BLACK CAT in Marvel Rivals',
      },
      'black-panther': {
        id: '0AkMzA-n-EA',
        title: 'Black Panther Guide | The BEST Comprehensive Guide to BLACK PANTHER in Marvel Rivals',
      },
      'black-widow': {
        id: 'LMej9-pVFek',
        title: 'Black Widow Guide | The BEST Comprehensive Guide to BLACK WIDOW in Marvel Rivals',
      },
      blade: {
        id: 'WPEDkYY4eGA',
        title: 'Blade Guide | The BEST Comprehensive Guide to BLADE in Marvel Rivals',
      },
      hulk: {
        id: 'YZf3psRKPmE',
        title: 'Hulk Guide | The BEST Comprehensive Guide to HULK in Marvel Rivals',
      },
      'captain-america': {
        id: 'HZrBVN4tuik',
        title: 'Captain America Guide | The BEST Comprehensive Guide to CAPTAIN AMERICA in Marvel Rivals',
      },
      'cloak-and-dagger': {
        id: 'E9lKTfRFJ6s',
        title: 'Cloak and Dagger Guide | The BEST Comprehensive Guide to CLOAK AND DAGGER in Marvel Rivals',
      },
      daredevil: {
        id: 'HRXsRdVXMVo',
        title: 'Daredevil Guide | The BEST Comprehensive Guide to DAREDEVIL in Marvel Rivals',
      },
      deadpool: {
        id: 'JfrdVuQ5mn0',
        title: 'Deadpool Guide | The BEST Comprehensive Guide to DEADPOOL in Marvel Rivals',
      },
      'doctor-strange': {
        id: '8ZyNSU1fBAk',
        title: 'Doctor Strange Guide | The BEST Comprehensive Guide to DOCTOR STRANGE in Marvel Rivals',
      },
      'elsa-bloodstone': {
        id: 'XTUTGUIFfUY',
        title: 'Elsa Bloodstone Guide | The BEST Comprehensive Guide to ELSA BLOODSTONE in Marvel Rivals',
      },
      'emma-frost': {
        id: 'geqHn_q6k7w',
        title: 'Emma Frost Guide | The BEST Comprehensive Guide to EMMA FROST in Marvel Rivals',
      },
      gambit: {
        id: 'WIHDdJujzUs',
        title: 'Gambit Guide | The BEST Comprehensive Guide to GAMBIT in Marvel Rivals',
      },
      groot: {
        id: 'l6xG6WAsYMU',
        title: 'Groot Guide | The BEST Comprehensive Guide to GROOT in Marvel Rivals',
      },
      hawkeye: {
        id: 'L10v3F9r5Hs',
        title: 'Hawkeye Guide | The BEST Comprehensive Guide to HAWKEYE in Marvel Rivals',
      },
      hela: {
        id: 'KD6ORSun0ZE',
        title: 'Hela Guide | The BEST Comprehensive Guide to HELA in Marvel Rivals',
      },
      'human-torch': {
        id: 'P9NvGuL_cho',
        title: 'Human Torch Guide | The BEST Comprehensive Guide to HUMAN TORCH in Marvel Rivals',
      },
      'invisible-woman': {
        id: 'mRt2zFGqrws',
        title: 'Invisible Woman Guide | The BEST Comprehensive Guide to INVISIBLE WOMAN in Marvel Rivals',
      },
      'iron-fist': {
        id: 'xfZl57O8_OQ',
        title: 'Iron Fist Guide | The BEST Comprehensive Guide to IRON FIST in Marvel Rivals',
      },
      'iron-man': {
        id: '3hV4kz3Repc',
        title: 'Iron Man Guide | The BEST Comprehensive Guide to IRON MAN in Marvel Rivals',
      },
      'jeff-the-land-shark': {
        id: 'bEtshLmrVyw',
        title: 'Jeff the Shark Guide | The BEST Comprehensive Guide to JEFF THE SHARK in Marvel Rivals',
      },
      loki: {
        id: 'zwM6YQ4v_SI',
        title: 'Loki Guide | The BEST Comprehensive Guide to Loki in Marvel Rivals',
      },
      'luna-snow': {
        id: 'jzICK22y7Is',
        title: 'Luna Snow Guide | The BEST Comprehensive Guide to LUNA SNOW in Marvel Rivals',
      },
      magik: {
        id: '4vilAy9tSwY',
        title: 'Magik Guide | The BEST Comprehensive Guide to MAGIK in Marvel Rivals',
      },
      magneto: {
        id: '7qG9KH9UkNc',
        title: 'Magneto Guide | The BEST Comprehensive Guide to MAGNETO in Marvel Rivals',
      },
      mantis: {
        id: 'Fifg2W8-PO4',
        title: 'Mantis Guide | The BEST Comprehensive Guide to MANTIS in Marvel Rivals',
      },
      'mister-fantastic': {
        id: 'V4DFywKwdFk',
        title: 'Mister Fantastic Guide | The BEST Comprehensive Guide to MISTER FANTASTIC in Marvel Rivals',
      },
      'moon-knight': {
        id: 'yHH6KBvciPg',
        title: 'Moon Knight Guide | The BEST Comprehensive Guide to MOON KNIGHT in Marvel Rivals',
      },
      namor: {
        id: 'FPPs-i1ee-g',
        title: 'Namor Guide | The BEST Comprehensive Guide to NAMOR in Marvel Rivals',
      },
      'peni-parker': {
        id: 'fHwTq8w2FVU',
        title: 'Peni Parker Guide | The BEST Comprehensive Guide to PENI PARKER in Marvel Rivals',
      },
      phoenix: {
        id: 'OoQyu_WzbBY',
        title: 'Phoenix Guide | The BEST Comprehensive Guide to PHOENIX in Marvel Rivals',
      },
      psylocke: {
        id: 'Vsua14VUmGg',
        title: 'Psylocke Guide | The BEST Comprehensive Guide to PSYLOCKE in Marvel Rivals',
      },
      'rocket-raccoon': {
        id: 'CGw4ZlAMAF4',
        title: 'Rocket Raccoon Guide | The BEST Comprehensive Guide to ROCKET RACCOON in Marvel Rivals',
      },
      rogue: {
        id: 'LGAj_h43m5A',
        title: 'Rogue Guide | The BEST Comprehensive Guide to ROGUE in Marvel Rivals',
      },
      'scarlet-witch': {
        id: 'cPujUz0S7nQ',
        title: 'Scarlet Witch Guide | The BEST Comprehensive Guide to SCARLET WITCH in Marvel Rivals',
      },
      'squirrel-girl': {
        id: 'hfHY0afkEUg',
        title: 'Squirrel Girl Guide | The BEST Comprehensive Guide to SQUIRREL GIRL in Marvel Rivals',
      },
      'star-lord': {
        id: '71rolJfkehc',
        title: 'Starlord Guide | The BEST Comprehensive Guide to STARLORD in Marvel Rivals',
      },
      storm: {
        id: 'mlewjqlw91c',
        title: 'Storm Guide | The BEST Comprehensive Guide to STORM in Marvel Rivals',
      },
      'the-punisher': {
        id: 'T0d2S3gRW-M',
        title: 'Punisher Guide | The BEST Comprehensive Guide to THE PUNISHER in Marvel Rivals',
      },
      'the-thing': {
        id: '8IJGdtB9s2s',
        title: 'The Thing Guide | The BEST Comprehensive Guide to THE THING in Marvel Rivals',
      },
      thor: {
        id: '_F5nOfRLy8A',
        title: 'Thor Guide | The BEST Comprehensive Guide to THOR in Marvel Rivals',
      },
      ultron: {
        id: 'YKcxUGf25Es',
        title: 'Ultron Guide | The BEST Comprehensive Guide to ULTRON in Marvel Rivals',
      },
      venom: {
        id: '3HMlrN1UxIc',
        title: 'Venom Guide | The BEST Comprehensive Guide to VENOM in Marvel Rivals',
      },
      'white-fox': {
        id: 'agc2g5G7fwM',
        title: 'White Fox Guide | The BEST Comprehensive Guide to WHITE FOX in Marvel Rivals',
      },
      'winter-soldier': {
        id: 'mc--EjMwJgA',
        title: 'Winter Soldier Guide | The BEST Comprehensive Guide to WINTER SOLDIER in Marvel Rivals',
      },
      wolverine: {
        id: 'J2sqWAV2ubs',
        title: 'Wolverine Guide | The BEST Comprehensive Guide to WOLVERINE in Marvel Rivals',
      },
    };
    const roleFallbacks: Record<HeroRole, { id: string; title: string }> = {
      Vanguard: {
        id: '8-bMoxrVxYs',
        title: 'How To Get So Good At Vanguard It Feels Like Cheating',
      },
      Duelist: {
        id: '0WpZvJ8lrmU',
        title: 'How To Get So Good At Duelist It Feels Like Cheating',
      },
      Strategist: {
        id: 'uefyKm8Mo-U',
        title: 'How To Get So Good At Strategist It Feels Like Cheating',
      },
      'Multi-Role': {
        id: 'vZqiGZ_FPTQ',
        title: 'I Finished Marvel Rivals: This is What I Learned',
      },
    };
    const video = heroVideos[hero.id] ?? roleFallbacks[hero.role];

    return {
      label: heroVideos[hero.id] ? 'PAZ hero gameplay' : `PAZ ${hero.role} gameplay`,
      query: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: this.youtubeVideoEmbedUrl(video.id),
    };
  }

  private pazCountersCombosVideo(hero: Hero): HeroVideoSearch {
    const counterVideos: Record<string, { id: string; title: string }> = {
      'adam-warlock': {
        id: 'LuEGHIx6aC4',
        title: 'Educational Bronze to GM ADAM WARLOCK',
      },
      angela: {
        id: 'j1poGPZirqE',
        title: 'Educational Bronze to GM ANGELA',
      },
      'black-cat': {
        id: 'AGjGhs4xKZc',
        title: 'Educational Unranked to GM Black Cat',
      },
      'black-widow': {
        id: 'OMxg_6cOgHE',
        title: 'Educational Bronze to GM BLACK WIDOW',
      },
      blade: {
        id: 'p0TXluOIHsQ',
        title: 'Educational Bronze to GM BLADE',
      },
      hulk: {
        id: '0um39F2qrvc',
        title: 'Educational Bronze to GM HULK',
      },
      'captain-america': {
        id: 'Tq9XO0AkX0g',
        title: 'Educational Bronze to GM CAPTAIN AMERICA',
      },
      'cloak-and-dagger': {
        id: 'brM9gglIoHQ',
        title: 'Educational Bronze to GM CLOAK and DAGGER',
      },
      daredevil: {
        id: '7j3URa0QWME',
        title: 'Educational Bronze to GM DAREDEVIL',
      },
      deadpool: {
        id: 'mNiE-e1hlRg',
        title: 'Educational Unranked to GM DEADPOOL',
      },
      'doctor-strange': {
        id: 'u63eVJWqobU',
        title: 'Educational Bronze to GM DOCTOR STRANGE',
      },
      'elsa-bloodstone': {
        id: 'N0BWg3QMgck',
        title: 'Educational Unranked to GM ELSA BLOODSTONE',
      },
      'emma-frost': {
        id: 'MK92QI-J93k',
        title: '1 EMMA FROST TIP vs EVERY HERO',
      },
      gambit: {
        id: '9B-oqk3geJU',
        title: 'Educational Unranked to GM GAMBIT',
      },
      groot: {
        id: 'AGjm_wf73QA',
        title: 'Educational Bronze to GM GROOT',
      },
      hawkeye: {
        id: 'OHHMfZxg8GU',
        title: 'Educational Bronze to GM HAWKEYE',
      },
      hela: {
        id: 'fCejAJQes48',
        title: 'Educational Bronze to GM HELA',
      },
      'human-torch': {
        id: 'f-uOmTTKj88',
        title: 'Educational Bronze to GM HUMAN TORCH',
      },
      'invisible-woman': {
        id: 'm0okEiF55cY',
        title: 'Educational Bronze to GM INVISIBLE WOMAN',
      },
      'iron-fist': {
        id: 'jMZxADS98q0',
        title: 'Educational Bronze to GM IRON FIST',
      },
      'iron-man': {
        id: 'E-4Je_ZXQ0s',
        title: 'Educational Bronze to GM IRON MAN',
      },
      'jeff-the-land-shark': {
        id: 'GTluIg_FnZ8',
        title: 'Educational Bronze to GM JEFF THE SHARK',
      },
      loki: {
        id: '7kn6SNEqwXI',
        title: 'Educational Bronze to GM LOKI',
      },
      'luna-snow': {
        id: 'iBbgVSrHutM',
        title: 'Educational Bronze to GM LUNA SNOW',
      },
      magik: {
        id: 'q7VFwFPnwLc',
        title: 'Educational Bronze to GM MAGIK',
      },
      magneto: {
        id: '9W22wgE_V7Y',
        title: 'Educational Bronze to GM MAGNETO',
      },
      mantis: {
        id: '63S6wxKAhDU',
        title: 'Educational Bronze to GM MANTIS',
      },
      'mister-fantastic': {
        id: 'xkqZERUI3Gc',
        title: 'Educational Unranked to GM MISTER FANTASTIC',
      },
      'moon-knight': {
        id: 'lDZ7MxKBVms',
        title: 'Educational Bronze to GM MOON KNIGHT',
      },
      namor: {
        id: 'JgrH8_ajMFY',
        title: 'Educational Bronze to GM NAMOR',
      },
      'peni-parker': {
        id: '1vfUB84qOcQ',
        title: 'Educational Unranked to GM Peni Parker',
      },
      phoenix: {
        id: 'kP-596xnD5o',
        title: 'Educational Bronze to GM PHOENIX',
      },
      psylocke: {
        id: '-VxfFAYW3v8',
        title: 'Educational Bronze to GM Psylocke',
      },
      'rocket-raccoon': {
        id: '_T9rY3Gqi2M',
        title: 'Educational Bronze to GM ROCKET RACCOON',
      },
      rogue: {
        id: 'pUaLtWfMR7A',
        title: 'Educational Unranked to GM ROGUE',
      },
      'scarlet-witch': {
        id: 'f2Y2V6tCmBM',
        title: 'Educational Unranked to GM SCARLET WITCH',
      },
      'squirrel-girl': {
        id: 'K4u47PLU8sg',
        title: 'Educational Bronze to GM SQUIRREL GIRL',
      },
      'star-lord': {
        id: '_NYL8s6iGjw',
        title: 'Educational Bronze to GM STARLORD',
      },
      storm: {
        id: 'YccqF6OvAKE',
        title: 'Educational Bronze to GM STORM',
      },
      'the-punisher': {
        id: '8eANxhLYzaI',
        title: 'Educational Bronze to GM THE PUNISHER',
      },
      'the-thing': {
        id: 'sixEechHfpw',
        title: 'Educational Bronze to GM THE THING',
      },
      thor: {
        id: 'qHKZJtE_ZDs',
        title: 'Educational Unranked to GM THOR',
      },
      ultron: {
        id: 'hLcY7FlofGI',
        title: '1 ULTRON TIP vs EVERY HERO',
      },
      venom: {
        id: 'v5lTA4VxgvA',
        title: 'Educational Bronze to GM VENOM',
      },
      'white-fox': {
        id: 'Yt8Tn07MeLA',
        title: 'Educational Unranked to GM WHITE FOX',
      },
      'winter-soldier': {
        id: 'RzNES06svys',
        title: 'Educational Bronze to GM WINTER SOLDIER',
      },
      wolverine: {
        id: 'Q8xdV5RguZQ',
        title: 'Educational Unranked to GM WOLVERINE',
      },
    };
    const roleFallbacks: Record<HeroRole, { id: string; title: string }> = {
      Vanguard: {
        id: 'iY2Yb9juP5w',
        title: '#1 Vanguard Mains Share Their BEST TIPS',
      },
      Duelist: {
        id: 'UWGwFFN0-pQ',
        title: '#1 Duelist Mains Share Their BEST TIPS',
      },
      Strategist: {
        id: 'eBmUlAWmwoI',
        title: '#1 Strategist Mains Share Their BEST TIPS',
      },
      'Multi-Role': {
        id: 'cUslZkGVsLA',
        title: 'One Tip For EVERY RANK in Marvel Rivals',
      },
    };
    const video = counterVideos[hero.id] ?? roleFallbacks[hero.role];

    return {
      label: counterVideos[hero.id] ? 'PAZ counters and combos' : `PAZ ${hero.role} counters and combos`,
      query: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: this.youtubeVideoEmbedUrl(video.id),
    };
  }

  private youtubeVideoEmbedUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
