import type { GameMode } from '../types/game';
import type { ReactNode } from 'react';

export interface GameModeInfo {
  id: GameMode;
  name: string;
  description: string;
  icon: ReactNode;
}

export const GAME_MODES: GameModeInfo[] = [
  { id: 'solo', name: 'Solo', description: 'Testez vos connaissances', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> },
  { id: 'duel', name: 'Duel', description: '1v1 en vitesse', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg> },
  { id: 'party', name: 'Party', description: 'Plusieurs joueurs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="19" cy="7" r="2"/></svg> },
  { id: 'tournament', name: 'Tournoi', description: 'Elimination progressive', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/><path d="M12 15V3"/><path d="M21 15v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/><path d="M18 21a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2h4z"/></svg> },
  { id: 'competitive', name: 'Compétitif', description: 'Le plus rapide marque', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.8 14-3.5 2"/><path d="m20.7 16-3.5-2"/><path d="m6.8 10 3.3-2"/><path d="m20.7 8-3.5 2"/><path d="m9 22 3-8 3 8"/><path d="M8 6h8"/></svg> },
  { id: 'cooperative', name: 'Coopératif', description: 'Jouez ensemble', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M12 12v.01"/></svg> },
];

export function isMultiplayerMode(mode: GameMode): boolean {
  return ['duel', 'party', 'tournament', 'competitive', 'cooperative'].includes(mode);
}
