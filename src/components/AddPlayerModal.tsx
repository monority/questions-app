import React, { useState } from 'react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: { bg: string; border: string; name: string }) => void;
}

const PLAYER_COLORS: Array<{ bg: string; border: string; name: string }> = [
  { bg: '#06b6d4', border: '#22d3ee', name: 'Cyan' },
  { bg: '#84cc16', border: '#a3e635', name: 'Lime' },
  { bg: '#f97316', border: '#fb923c', name: 'Orange' },
  { bg: '#14b8a6', border: '#2dd4bf', name: 'Teal' },
  { bg: '#a855f7', border: '#c084fc', name: 'Purple' },
  { bg: '#eab308', border: '#facc15', name: 'Yellow' },
  { bg: '#ef4444', border: '#f87171', name: 'Red' },
  { bg: '#3b82f6', border: '#60a5fa', name: 'Blue' },
];

const PLAYER_AVATARS = ['🎮', '🎯', '🏆', '⭐', '🔥', '⚡', '🎲', '🎪'];

const RANDOM_NAMES = ['Phoenix', 'Shadow', 'Storm', 'Viper', 'Ghost', 'Blaze', 'Ice', 'Thunder', 'Raven', 'Wolf', 'Tiger', 'Dragon'];

const sanitizeName = (input: string): string => {
    return input
      .trim()
      .replace(/[<>'"&;]/g, '')
      .slice(0, 15);
  };

export function AddPlayerModal({ isOpen, onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0]!);
  const [selectedAvatar, setSelectedAvatar] = useState(PLAYER_AVATARS[0]!);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedName = sanitizeName(name);
    if (sanitizedName) {
      onAdd(sanitizedName, selectedColor);
      setName('');
      setSelectedColor(PLAYER_COLORS[0]!);
      setSelectedAvatar(PLAYER_AVATARS[0]!);
      onClose();
    }
  };

  const handleRandom = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] ?? 'Player';
    const randomAvatar = PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)] ?? '🎮';
    const randomColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] ?? PLAYER_COLORS[0]!;
    setName(randomName);
    setSelectedAvatar(randomAvatar);
    setSelectedColor(randomColor);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nouveau Joueur</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Choisis ton avatar</label>
            <div className="avatar-grid">
              {PLAYER_AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  style={{ backgroundColor: selectedColor.bg }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Choisis ton pseudo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(sanitizeName(e.target.value))}
              placeholder="Tape ton pseudo..."
              maxLength={15}
              autoFocus
              className="modal-input"
            />
            <div className="name-preview" style={{ borderColor: selectedColor.bg }}>
              <span style={{ backgroundColor: selectedColor.bg }} className="preview-avatar">
                {selectedAvatar}
              </span>
              <span style={{ color: selectedColor.bg }}>{name || 'Ton pseudo'}</span>
            </div>
            <button type="button" className="random-btn" onClick={handleRandom}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                <path d="M21 3v5h-5"/>
              </svg>
              Générer un pseudo aléatoire
            </button>
          </div>

          <div className="form-group color-section">
            <label>Couleur préférée</label>
            <div className="color-grid">
              {PLAYER_COLORS.map(color => (
                <button
                  key={color.name}
                  type="button"
                  className={`color-option ${selectedColor.name === color.name ? 'selected' : ''}`}
                  style={{ backgroundColor: color.bg }}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Rejoindre la partie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}