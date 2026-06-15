import { Injectable } from '@angular/core';

import glossaryTerms from '../data/glossary.mock.json';
import { GlossaryTerm } from './glossary.model';

@Injectable({ providedIn: 'root' })
export class GlossaryDataService {
  getTerms(): GlossaryTerm[] {
    return glossaryTerms as GlossaryTerm[];
  }
}
