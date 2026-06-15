import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { Hero } from './hero.model';

@Injectable({ providedIn: 'root' })
export class HeroDataService {
  private readonly http = inject(HttpClient);

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>('/api/heroes').pipe(
      catchError(() => of([])),
    );
  }
}
