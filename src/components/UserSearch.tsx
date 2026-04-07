import { motion } from 'framer-motion';

interface UserSearchProps {
  query: string;
  setQuery: (q: string) => void;
  results: { id: string; username: string; score: number; totalScore: number; createdAt: string }[];
  loading: boolean;
  selectedUser: { id: string; username: string; score: number; totalScore: number; createdAt: string } | null;
  onSelectUser: (user: { id: string; username: string; score: number; totalScore: number; createdAt: string }) => void;
  onClose: () => void;
}

export function UserSearch({ query, setQuery, results, loading, selectedUser, onSelectUser, onClose }: UserSearchProps) {
  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content user-search-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Rechercher un joueur</h2>
        
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Entrez un pseudo..."
          className="search-input"
          autoFocus
        />
        
        <div className="search-results">
          {loading && <p className="loading-text">Recherche en cours...</p>}
          
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="no-results">Aucun joueur trouvé</p>
          )}
          
          {results.map(user => (
            <button
              key={user.id}
              className="user-result"
              onClick={() => onSelectUser(user)}
            >
              <span className="user-result-name">{user.username}</span>
              <span className="user-result-score">Best: {user.score} • Total: {user.totalScore}</span>
            </button>
          ))}
        </div>

        {selectedUser && (
          <div className="selected-user-profile">
            <h3>Profil de {selectedUser.username}</h3>
            <p>Meilleur score: {selectedUser.score} points</p>
            <p>Score total: {selectedUser.totalScore} points</p>
            <p>Membre depuis: {
            selectedUser.createdAt && !isNaN(Date.parse(selectedUser.createdAt))
              ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')
              : 'Inconnu'
          }</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}