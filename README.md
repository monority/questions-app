# Culture Quiz

Un jeu de quiz interactif développé avec React, TypeScript et Vite.

## Fonctionnalités

- **Modes de jeu** : Solo ou Multiplayer (jusqu'à 8 joueurs)
- **Questions** : Plus de 200 questions en français sur la géographie, l'histoire, les sciences et les arts
- **Système de progression** : XP, niveaux et badges
- **Classement** : Leaderboard local avec persistence
- **Thème** : Mode sombre/clair
- **Haptique** : Feedback vibratoire sur mobile

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Commandes disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Compiler pour la production
- `npm run lint` - Vérifier le code avec ESLint
- `npm run typecheck` - Vérifier les types TypeScript
- `npm run test` - Lancer les tests unitaires
- `npm run test:watch` - Mode watch pour les tests

## Structure du projet

```
src/
├── components/     # Composants React
├── config/         # Configuration et constantes
├── hooks/          # Hooks personnalisés
├── services/       # Services (questions, joueur)
├── styles/         # Fichiers CSS
├── test/           # Tests unitaires
└── types/          # Types TypeScript
```

## Licence

MIT