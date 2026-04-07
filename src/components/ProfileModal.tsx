import { motion } from 'framer-motion';
import type { UserProfile } from '../services/authService';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const validDate = profile.createdAt && !isNaN(Date.parse(profile.createdAt)) ? new Date(profile.createdAt) : null;
  const memberSince = validDate 
    ? validDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Inconnu';

  const avatarLetter = profile.username?.[0]?.toUpperCase() ?? profile.email?.[0]?.toUpperCase() ?? '?';
  const displayName = profile.username || profile.email?.split('@')[0] || 'Joueur';

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content profile-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarLetter}
          </div>
          <h2>{displayName}</h2>
          <p className="profile-member-since">Membre depuis {memberSince}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{profile.totalScore.toLocaleString()}</span>
            <span className="stat-label">Score total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{profile.gamesPlayed}</span>
            <span className="stat-label">Parties jouées</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{profile.bestScore.toLocaleString()}</span>
            <span className="stat-label">Meilleur score</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
