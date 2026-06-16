import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly navItems = [
    { label: 'Home', path: '/', enabled: true },
    { label: 'Heroes', path: '/heroes', enabled: true },
    { label: 'Techniques', path: '/techniques', enabled: true },
    { label: 'Builds', path: '/build-theory', enabled: true },
    { label: 'Paths', path: '/learning-paths', enabled: true },
    { label: 'Media', path: '/media-tutorials', enabled: true },
    { label: 'Quiz', path: '/watch-next', enabled: true },
    { label: 'Glossary', path: '/glossary', enabled: true },
    { label: 'Counters', path: '/counters', enabled: false },
    { label: 'Team Builder', path: '/team-builder', enabled: false },
    { label: 'AI Coach', path: '/ai-coach', enabled: false },
  ];
}
