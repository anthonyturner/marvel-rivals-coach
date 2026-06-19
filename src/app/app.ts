import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly primaryNavItems = [
    { label: 'Home', path: '/', enabled: true },
    { label: 'Heroes', path: '/heroes', enabled: true },
  ];

  readonly navGroups = [
    {
      label: 'Learn',
      items: [
        { label: 'Guides', path: '/hero-guides', enabled: true },
        { label: 'Techniques', path: '/techniques', enabled: true },
        { label: 'Build Theory', path: '/build-theory', enabled: true },
        { label: 'Learning Paths', path: '/learning-paths', enabled: true },
        { label: 'Power Positions', path: '/power-positions', enabled: true },
        { label: 'Strategic Cover', path: '/strategic-cover', enabled: true },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Media Tutorials', path: '/media-tutorials', enabled: true },
        { label: 'Game Stats', path: '/game-stats', enabled: true },
        { label: 'Glossary', path: '/glossary', enabled: true },
      ],
    },
    {
      label: 'Tools',
      items: [
        { label: 'Watch Next Quiz', path: '/watch-next', enabled: true },
        { label: 'Counters', path: '/counters', enabled: false },
        { label: 'Team Builder', path: '/team-builder', enabled: true },
        { label: 'AI Coach', path: '/ai-coach', enabled: false },
      ],
    },
  ];
}
