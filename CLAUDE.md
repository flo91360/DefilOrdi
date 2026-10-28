# DefilOrdi

Logiciel Windows (Electron) pour une ergothérapeute : hub de jeux pour apprendre
le clavier à des enfants de 8 à 18 ans. Tout le texte visible est en français ;
le code et les commentaires aussi.

## Structure

- `src/main/` : processus principal Electron (fenêtre, IPC, `storage.ts` qui
  écrit `%APPDATA%\DefilOrdi\donnees.json` de façon atomique et garde des
  copies datées dans `sauvegardes/` : premier démarrage du jour, données d'une
  autre version, avant restauration ; `COPIES_MAX` gardées). Données d'une
  version plus récente : `load` le signale (`plusRecente`) et l'interface
  prévient au démarrage.
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
- `src/renderer/src/styles.css` : n'importe que `styles/*.css` (un fichier par
  écran ou jeu), dans l'ordre de leur numéro, qui compte pour la cascade.
- `src/renderer/src/games/dactylo/` : jeu Dactylo ; `engine.ts` contient toute
  la logique et les règles de comptage (testées dans `tests/engine.test.ts`) ;
  `seuils.ts` réunit dans `SEUILS_DACTYLO` les seuils des smileys du score de
  chaque phrase (vitesse selon la classe du profil, précision), testés dans
  `tests/score.test.ts`. Les scores par phrase ne sont pas enregistrés.
- Phrases personnelles de Dactylo (proposées après une médaille) : règles par
  niveau dans `src/shared/regles.ts`, correcteur hors ligne (lexique intégré +
  mots des listes) dans `src/shared/orthographe.ts`, tests dans
  `tests/regles.test.ts`. Stockées dans `phrasesEnfants` (statut `a_verifier` =
  notification pour l'ergo, section « Phrases des enfants »), fusionnées aux
  listes du même niveau par `listesAvecPhrasesEnfants`. Réglage
  `settings.relirePhrasesEnfants` (activé par défaut) : même acceptée par le
  correcteur, une phrase reste à vérifier (sans motif) jusqu'à l'accord de
  l'ergo (`statutPhrase`), pour qu'aucune phrase blessante n'atteigne les
  autres enfants. Option
  `afficherErreurs` des réglages Dactylo de l'enfant.
- `src/renderer/src/games/couleurs/` (Stroop) et `games/memoire/` (Mots à
  retenir) : chacun a son `engine.ts` testé dans `tests/jeux.test.ts`.
  `games/ui.tsx` et `games/commun.ts` : morceaux partagés par les jeux.
  `games/pause.tsx` : pause quand la fenêtre perd le focus, ou demandée avec
  le bouton « Pause » (`BoutonPause`) ou Échap (`usePauseAuto`, `useChrono`,
  `EcranPause`), utilisée par tous les jeux sauf la Chasse aux lettres, qui a
  sa propre pause (Échap).
  Couleurs piégées : bouton Indice (`indiceUtile`, `nbPropositions`,
  `propositionsIndice`), réglé pour tous les profils par `couleurs` dans les
  données (section Réglages de l'espace ergo) ; textes agrandis via la classe
  `couleurs-jeu`. Entraînement à la souris (choisi avant la partie, état local,
  modes « La couleur » et « Les deux ») : les manches « couleur de l'encre »
  se répondent en cliquant (`reponseALaSouris`, `clicValide`) ; gauche par défaut,
  droit ou double clic au choix, les autres clics sont ignorés.
  Mots à retenir : difficulté progressive (paliers 3 à 7 mots puis phrase,
  `avancerProgression`), progression mémorisée dans `Profile.memoire`, chaque
  partie porte son `progressionId` ; phrases du palier phrase dans
  `phrasesMemoire` (éditeur `screens/PhrasesMemoireEditor.tsx`, section Mots).
  `memoire/images.ts` : emoji de chaque mot (`imageDuMot`, dictionnaire
  intégré + repli pour un mot inconnu, testé dans `tests/images.test.ts`),
  affiché pendant la mémorisation des paliers 3 à 7 si l'option « Avec
  images » est choisie avant la partie (état local, non enregistré).
- `src/renderer/src/games/espace/` : « Chasse aux lettres » (identifiant `espace`
  conservé), jeu en canvas. `engine.ts` = logique, commune aux aventures
  (testée dans `tests/espace.test.ts`) ; `themes.ts` = les aventures (noms,
  sons, scène) ; `scenes/` = dessin uniquement : `base.ts` (classe
  `SceneTheme`, particules, fond mis en cache), `Spatial.ts` (fusée),
  `Western.ts` (cow-boy), `Ocean.ts` (sous-marin). Ajouter une aventure =
  l'ajouter à `THEMES_CHASSE` (`src/shared/data.ts`), à `THEMES_JEU` et écrire
  sa scène. Modes (`ModeChasse` : chrono, vies, pieges) et paliers (8 réussites
  d'affilée : vitesse puis lettres doubles) dans `engine.ts` ; pièges et
  cadeaux = `Lettre.type`, dessinés par `SceneTheme.dessinerSpecial`. Les
  records sont séparés par série, aventure et mode (`mesureRecord`).
  Vitesse adaptative `Etat.vitesse` (ne dépend plus du niveau) : monte si la
  lettre est attrapée tôt, baisse si tard ou tombée ; sous
  `VITESSE_UNE_PAR_UNE`, les lettres arrivent une par une. Celle atteinte en fin
  de partie terminée est mémorisée dans `Profile.vitesseChasse` (une seule par
  enfant) ; `vitesseDeDepart` la reprend ou, à défaut, la déduit de la dernière
  partie.
- `src/renderer/src/games/quiz/` : quiz. `questions.ts` = banque de questions
  (identifiants stables, utilisés dans les statistiques) ; `scenes/` = faux
  écrans cliquables, chaque élément est une `Zone` nommée. `tests/quiz.test.tsx`
  vérifie que chaque zone attendue existe à chaque étape. Questions de
  l'ergothérapeute : `questionsPerso` / `questionsMasquees` dans les données,
  fusionnées par `construireBanque` ; éditeur dans `screens/QuizEditor.tsx`.
  Thème à part « Points reliés » : `relier.ts` (logiciels, référentiel
  d’actions, tirage de 10, vérification) et `RelierVue.tsx` ; liste à relire dans
  `docs/points-relies-actions.md` (à garder identique).
- `src/renderer/src/games/petitbac/` : Petit bac. `engine.ts` (tirage, vérification
  de la première lettre) testé dans `tests/petitbac.test.ts`. Catégories et
  lettres réglées par l'ergothérapeute : `petitBac` dans les données, éditeur
  dans `screens/PetitBacEditor.tsx`.
- Résultats : union `Resultat` (champ `jeu`) dans `src/shared/data.ts` ;
  statistiques dans `screens/ErgoStats.tsx` (onglets, exports, accès au bilan)
  et `screens/stats/` : un fichier par jeu (colonnes de l'export, écran,
  indicateurs du bilan), `parJeu.tsx` (tout ce qui dépend du jeu), `commun.tsx`,
  `calculBilan.ts` (calcul du bilan imprimable, testé dans `tests/bilan.test.ts`) et
  `Bilan.tsx`. Le bilan ne compare que les parties terminées d'un même groupe
  (`GROUPE_<JEU>` de chaque fichier : mode, liste, palier…). Chaque résultat
  porte `complete` (faux = partie arrêtée), signalé dans l'historique et
  l'export.
- `src/renderer/src/keyboard/` : clavier AZERTY (disposition, doigts, touches à
  presser pour chaque caractère) et son affichage.
- `src/shared/phrases.ts` : listes de phrases et de mots d'origine (uniquement des
  caractères tapables sur un clavier AZERTY Windows).
- Espace ergo : `screens/ErgoSpace.tsx`, `ErgoStats.tsx`, `PhrasesEditor.tsx`,
  `QuizEditor.tsx`, `PetitBacEditor.tsx`.
- `e2e/` : tests de parcours Playwright sur `npm run dev:web` (`*.e2e.ts`,
  `e2e/outils.ts` pour préparer les données).

## Commandes

`npm run typecheck`, `npm test`, `npm run test:e2e` (Playwright ; dans le
conteneur, Chromium est déjà installé), `npm run dev:web`, `npm run dist:portable`
(exe portable pour essai local, marche sous Linux sans wine, jamais livré),
`npm run dist:win` (installeur complet seul ; l'installeur NSIS a besoin de
wine 32 bits sous Linux, il est fabriqué par la CI Windows
`.github/workflows/build-windows.yml`). Livraison = uniquement
`DefilOrdi-Installation-<version>.exe` (artefact CI et Release).

## Règles

- Données d'enfants : rien ne doit quitter le PC (pas de réseau, pas de télémétrie).
- Les sons d'erreur restent doux, jamais punitifs.
- Les jeux sont déclarés dans `JEUX` (`src/renderer/src/games/jeux.ts`, nom,
  description, ordre). Ajouter un jeu à l'union `Resultat` fait échouer le
  typecheck partout où il manque (`switch` terminés par `jamais(...)`).
- « Arrêter » enregistre la partie commencée dans tous les jeux (si quelque
  chose a été joué).
- Fin de partie : une partie n'est enregistrée qu'une fois. Une fin différée
  (le temps d'un « Bravo ») annule son minuteur au démontage et rend
  « Arrêter » sans effet.
- Code de l'espace ergo : tant qu'il vaut `CODE_DEFAUT` (0000), l'espace ergo
  impose d'en choisir un autre avant de s'afficher.
- Chaque livraison : augmenter `version` dans `package.json` ; la CI publie la
  Release `v<version>` quand une nouvelle version arrive sur main (une version
  déjà publiée n'est pas remplacée). Elle crée d'abord le tag annoté
  `v<version>`, puis la Release dont les notes listent les commits depuis le tag
  précédent ; `CHANGELOG.md` (toutes les versions) est joint, fabriqué par
  `scripts/changelog.mjs` à partir des tags, puis recopié par la CI à la racine
  du dépôt sur main (ne pas le modifier à la main). Le texte de chaque version
  vient de `changements.md` (voir « Description des changements ») ; à défaut,
  des sujets de commit. PlaniFiKateur archive ses .exe dans Google Drive.
- Fusion des PR (demandé par le propriétaire du dépôt) : quand la CI d'une PR
  ouverte par Claude est verte et qu'aucun commentaire de relecture n'attend de
  réponse, Claude la fusionne lui-même dans main (squash), sans demander.

## Description des changements

À chaque livraison, remplacer entièrement le contenu de la section
`## Prochaine version` de `changements.md` par la description de ce que la
livraison change. Le numéro de version n'est pas nécessaire (il peut être
choisi par le worker). Au tag de la version, `scripts/changelog.mjs` lit cette
section telle qu'elle était à ce tag : elle devient le texte de la version
dans `CHANGELOG.md` et dans les notes de la Release.

- Lectrice : l'ergothérapeute, non technicienne. Français clair, sans jargon
  (pas de nom de fichier, de fonction, de CI, de PR, d'identifiant de carte).
- Une puce par changement visible, qui dit ce qu'elle verra ou pourra faire :
  « Petit bac : les catégories peuvent être modifiées dans l'espace ergo. »
  Commencer par le nom du jeu ou de l'écran concerné quand il y en a un.
- Distinguer si utile nouveautés, améliorations et corrections ; ne jamais
  reprendre le simple titre de la carte.
- Changement purement interne (fabrication du .exe, tests…) : une seule puce
  courte, par exemple « Améliorations internes, sans changement visible. »
- N'écrire que ce que la livraison change réellement.
- Corriger une version déjà publiée : ajouter une section `## <version>` (ex.
  `## 0.8.2`), prioritaire sur le reste ; ne jamais modifier les tags.
- Sur une PR, la CI échoue si `version` change dans `package.json` sans que
  la section `## Prochaine version` (ou `## <version>`) de `changements.md`
  change, ou si elle reprend des puces de la version déjà publiée
  (`scripts/verifier-changements.mjs`). `AGENTS.md` renvoie à ce
  fichier pour les agents qui ne lisent pas `CLAUDE.md` (Codex, utilisé par
  PlaniFiKateur).
