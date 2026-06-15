import { Injectable } from '@angular/core';

import heroes from '../data/heroes.mock.json';
import { Hero } from './hero.model';

@Injectable({ providedIn: 'root' })
export class HeroDataService {
  getHeroes(): Hero[] {
    return heroes as Hero[];
  }
}
