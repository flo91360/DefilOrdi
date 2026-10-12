# DefilOrdi

Logiciel Windows (Electron) pour une ergothérapeute : hub de jeux pour apprendre
le clavier à des enfants de 8 à 18 ans. Tout le texte visible est en français ;
le code et les commentaires aussi.

## Structure

- `src/main/` : processus principal Electron (fenêtre, IPC, `storage.ts` qui
  écrit `%APPDATA%\DefilOrdi\donnees.json` de façon atomique).
- `src/preload/` : expose `window.defilordi` (interface `DefilOrdiApi` dans
  `src/shared/api.ts`).
- `src/shared/data.ts` : modèle des données et `normalizeAppData`, par lequel
  passe toute donnée lue (fichier, import). Ajouter un champ = lui donner une
  valeur par défaut ici.
- `src/renderer/` : interface React. `api.ts` retombe sur localStorage hors
  Electron (`npm run dev:web`), ce qui permet de tester l'interface dans
  Chromium avec Playwright.
- `src/renderer/src/avatar/` : personnage SVG par calques.
- `src/renderer/src/sounds.ts` : sons synthétisés (Web Audio), pas de fichiers.
- `src/renderer/src/theme.ts` : couleurs de l'enfant en variables CSS.
- `src/renderer/src/games/dactylo/` : jeu Dactylo ; `engine.ts` contient toute
  la logique et les règles de comptage (testées dans `tests/engine.test.ts`).
- `src/renderer/src/games/couleurs/` (Stroop) et `games/memoire/` (Mots à
  retenir) : chacun a son `engine.ts` testé dans `tests/jeux.test.ts`.
  `games/ui.tsx` et `games/commun.ts` : morceaux partagés par les jeux.
- Résultats : union `Resultat` (champ `jeu`) dans `src/shared/data.ts` ;
  statistiques par jeu dans `screens/ErgoStats.tsx`.
- `src/renderer/src/keyboard/` : clavier AZERTY (disposition, doigts, touches à
  presser pour chaque caractère) et son affichage.
- `src/shared/phrases.ts` : listes de phrases et de mots d'origine (uniquement des
  caractères tapables sur un clavier AZERTY Windows).
- Espace ergo : `screens/ErgoSpace.tsx`, `ErgoStats.tsx`, `PhrasesEditor.tsx`.

## Commandes

`npm run typecheck`, `npm test`, `npm run dev:web`, `npm run dist:portable`
(exe portable, marche sous Linux sans wine), `npm run dist:win` (installeur +
portable ; l'installeur NSIS a besoin de wine 32 bits sous Linux, il est
fabriqué par la CI Windows `.github/workflows/build-windows.yml`).

## Règles

- Données d'enfants : rien ne doit quitter le PC (pas de réseau, pas de télémétrie).
- Les sons d'erreur restent doux, jamais punitifs.
- Les jeux sont déclarés dans `GAMES` (`src/renderer/src/screens/Hub.tsx`).
- Chaque livraison : augmenter `version` dans `package.json` ; la CI publie la
  Release `v<version>` à chaque mise à jour de main.
