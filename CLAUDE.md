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
- `src/renderer/src/games/espace/` : « Chasse aux lettres » (identifiant `espace`
  conservé), jeu en canvas. `engine.ts` = logique, commune aux aventures
  (testée dans `tests/espace.test.ts`) ; `themes.ts` = les aventures (noms,
  sons, scène) ; `scenes/` = dessin uniquement : `base.ts` (classe
  `SceneTheme`, particules, fond mis en cache), `Spatial.ts` (fusée),
  `Western.ts` (cow-boy), `Ocean.ts` (sous-marin). Ajouter une aventure =
  l'ajouter à `THEMES_CHASSE` (`src/shared/data.ts`), à `THEMES_JEU` et écrire
  sa scène.
- `src/renderer/src/games/quiz/` : quiz. `questions.ts` = banque de questions
  (identifiants stables, utilisés dans les statistiques) ; `scenes/` = faux
  écrans cliquables, chaque élément est une `Zone` nommée. `tests/quiz.test.tsx`
  vérifie que chaque zone attendue existe à chaque étape. Questions de
  l'ergothérapeute : `questionsPerso` / `questionsMasquees` dans les données,
  fusionnées par `construireBanque` ; éditeur dans `screens/QuizEditor.tsx`.
- Résultats : union `Resultat` (champ `jeu`) dans `src/shared/data.ts` ;
  statistiques par jeu dans `screens/ErgoStats.tsx`.
- `src/renderer/src/keyboard/` : clavier AZERTY (disposition, doigts, touches à
  presser pour chaque caractère) et son affichage.
- `src/shared/phrases.ts` : listes de phrases et de mots d'origine (uniquement des
  caractères tapables sur un clavier AZERTY Windows).
- Espace ergo : `screens/ErgoSpace.tsx`, `ErgoStats.tsx`, `PhrasesEditor.tsx`.

## Commandes

`npm run typecheck`, `npm test`, `npm run dev:web`, `npm run dist:portable`
(exe portable pour essai local, marche sous Linux sans wine, jamais livré),
`npm run dist:win` (installeur complet seul ; l'installeur NSIS a besoin de
wine 32 bits sous Linux, il est fabriqué par la CI Windows
`.github/workflows/build-windows.yml`). Livraison = uniquement
`DefilOrdi-Installation-<version>.exe` (artefact CI et Release).

## Règles

- Données d'enfants : rien ne doit quitter le PC (pas de réseau, pas de télémétrie).
- Les sons d'erreur restent doux, jamais punitifs.
- Les jeux sont déclarés dans `GAMES` (`src/renderer/src/screens/Hub.tsx`).
- Chaque livraison : augmenter `version` dans `package.json` ; la CI publie la
  Release `v<version>` quand une nouvelle version arrive sur main (une version
  déjà publiée n'est pas remplacée). Elle crée d'abord le tag annoté
  `v<version>`, puis la Release dont les notes listent les commits depuis le tag
  précédent ; `CHANGELOG.md` (toutes les versions) est joint, fabriqué par
  `scripts/changelog.mjs` à partir des tags : écrire des messages de commit
  lisibles par l'ergothérapeute. PlaniFiKateur archive ses .exe dans Google Drive.
