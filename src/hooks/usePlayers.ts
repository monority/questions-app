import { useState, useCallback } from 'react';
import type { Player } from '../types/game';
import { PLAYER_SERVICE } from '../services';

interface UsePlayersReturn {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, name: string) => void;
  canAddMore: boolean;
  canStart: boolean;
}

export function usePlayers(): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = useCallback((name: string) => {
    if (!PLAYER_SERVICE.canAddPlayer(players.length)) return;
    if (!PLAYER_SERVICE.isValidName(name)) return;

    const newPlayer = PLAYER_SERVICE.create(name, players.length);
    setPlayers(prev => [...prev, newPlayer]);
  }, [players.length]);

  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return filtered.map((p, i) => ({
        ...p,
        color: PLAYER_SERVICE.getPlayerColor(i),
      }));
    });
  }, []);

  const updatePlayer = useCallback((id: string, name: string) => {
    if (!PLAYER_SERVICE.isValidName(name)) return;
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  return {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    canAddMore: PLAYER_SERVICE.canAddPlayer(players.length),
    canStart: PLAYER_SERVICE.canStartGame(players.length),
  };
}
