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
  { id: 'party', name: 'Party', description: 'Plusieurs joueurs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="19" cy="7" r="2"/></svg> },
];

export function isMultiplayerMode(mode: GameMode): boolean {
  return mode === 'party';
}
