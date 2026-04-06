import type { ReactNode } from 'react';
import type { GameMode } from '../../types/game';

interface ModeCardProps {
  id: GameMode;
  name: string;
  description: string;
  icon: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export function ModeCard({ name, description, icon, isSelected, onClick }: ModeCardProps) {
  return (
    <button
      className={`mode-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="mode-icon">{icon}</span>
      <span className="mode-name">{name}</span>
      <span className="mode-desc">{description}</span>
    </button>
  );
}
