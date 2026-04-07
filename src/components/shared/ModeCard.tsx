import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
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
    <motion.button
      className={`mode-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="mode-icon">{icon}</span>
      <span className="mode-name">{name}</span>
      <span className="mode-desc">{description}</span>
    </motion.button>
  );
}
