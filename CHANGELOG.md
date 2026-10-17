# Journal des modifications de DefilOrdi

## 0.8.14 — 2026-10-17
<!-- planifikateur:bfea0f26-a487-4dc7-a1ad-b1ee849aec56 -->

- **dans le jeu chasse aux lettres** : Le clavier à l'écran est maintenant masqué par défaut, et Chasse aux lettres propose de le retirer avant la partie. Le typecheck et les tests passent (117 tests). Je n'ai pas lancé `npm run build` : il fait partie des commandes que le worker exécute. Je n'ai pas non plus essayé l'écran dans l'application. - **Nouveaux profils** : le réglage « afficher le clavier » est désactivé à la création. - **Profils existants** : j'ai fait passer `DATA_VERSION` à 5. `normalizeAppData` met le clavier à « masqué » pour les données de version inférieure à 5. Après cette migration, la valeur choisie par l'ergothérapeute dans les Réglages est conservée. - **Chasse aux lettres, avant la partie** : l'écran « Quelles lettres vont tomber ? » affiche un choix « Avec le clavier / Sans le clavier », seulement si le réglage du profil est activé. Il est sur « avec » par défaut. Le choix reste local à l'écran de jeu et n'est pas enregistré dans le profil. Il est remis sur « avec » à la fin de chaque partie. - **Réglage désactivé** : l'option n'est pas proposée et le clavier n'est pas affiché. J'ai aussi masqué le bouton « Clavier : affiché/masqué » de la barre de jeu dans ce cas. Sans cela, l'enfant pouvait activer le clavier malgré le réglage de l'ergothérapeute. - **Autres jeux** : Dactylo et les autres jeux ne sont pas modifiés. - **Tests** : j'ai mis à jour les tests qui attendaient la version 4 et ajouté trois tests sur le clavier masqué par défaut, la migration et la conservation du réglage après migration. Le code est dans `src/shared/data.ts` et `src/renderer/src/games/espace/Espace.tsx`.

## 0.8.13 (2026-10-17)

- Carte Interface de présentation des jeux (e8a7f9f8-b46b-4e89-a36b-0b0d8ce66867) (#22)

## 0.8.12 (2026-10-17)

- Carte Ajout d'un bouton « Indice » pour faciliter la récupération en mémoire (5fc5dc1a-1b85-4ffa-8a39-31fb2a7de82b) (#21)

## 0.8.11 (2026-10-17)

- Mots à retenir : nouvelle option « Aide dys », à choisir avant la partie
  (pour les paliers de 3 à 7 mots). Quand l'enfant tape un mot qu'il a bien
  retenu mais mal écrit, ce n'est pas compté comme une erreur tout de suite :
  trois orthographes s'affichent et il choisit la bonne. S'il se trompe de
  choix, l'erreur est comptée et il peut réessayer.
- Sans l'option, le jeu se déroule exactement comme avant.

## 0.8.10 (2026-10-17)

- Amélioration sur certaine mise en situation (#19)

## 0.8.9 (2026-10-17)

- Amélioration chasse aux lettres SOUS-MARIN (#18)

## 0.8.8 (2026-10-17)

- Chasse aux lettres (les trois aventures) : pendant la partie, un bouton
  permet d'afficher ou de masquer le clavier à l'écran. Au départ, il suit le
  réglage de l'enfant, et ce choix ne vaut que pour la partie en cours.
- Chasse aux lettres : trois nouveaux niveaux de lettres. Niveau 5 :
  minuscules et majuscules. Niveau 6 : majuscules et lettres accentuées.
  Niveau 7 : tout mélangé (minuscules, majuscules, accents).
- Chasse aux lettres : après 8 lettres réussies de suite sans erreur, le jeu
  va plus vite ; après 8 autres, deux lettres tombent en même temps. Une
  erreur remet seulement le compte des 8 lettres à zéro, le palier atteint
  est conservé. Un message encourageant s'affiche à chaque palier.
- Chasse aux lettres : nouveau mode « 3 vies », sans durée. Une faute ou une
  lettre tombée fait perdre une vie ; la partie s'arrête à zéro vie et le jeu
  devient plus difficile à chaque palier.
- Chasse aux lettres : nouveau mode « Pièges et cadeaux », comme le mode 3
  vies avec en plus des pièges à ne pas taper (en taper un fait perdre une
  vie, les laisser tomber ne coûte rien) et des cadeaux dorés à taper pour
  regagner une vie (5 vies au maximum).
- Les sons d'erreur restent doux. Les records sont comptés séparément pour
  chaque mode, en plus de la série de lettres et de l'aventure : lettres par
  minute en mode chrono, nombre de lettres attrapées dans les modes à vies.
- Statistiques de Chasse aux lettres : le mode, les pièges tapés, les cadeaux
  et le palier atteint sont indiqués (et dans l'export Excel). Les parties
  jouées avant cette version comptent comme des parties chrono.

## 0.8.7 (2026-10-17)

- Carte Amélioration compréhension couleurs piégées (7ac00861-ded1-4ff3-af38-7d79b9fda221) (#16)

## 0.8.6 (2026-10-15)

- Carte Amélioration couleurs piégées (c27f01ee-84e7-4a48-ae7e-93e0f4e998e7) (#15)

## 0.8.5 (2026-10-15)

- Mots à retenir : avant chaque partie, on peut choisir « Avec images » ou
  « Sans images ». Avec images, une petite image représentant chaque mot
  s'affiche au-dessus du mot pendant qu'il faut le mémoriser (de 3 à 7 mots).
  Le choix se fait à chaque partie et n'est pas enregistré dans le profil.
- Mots à retenir : pas d'image pour la phrase à retenir, ni pendant que
  l'enfant retape les mots de tête.
- Espace ergo, section Mots : chaque mot ajouté ou modifié reçoit
  automatiquement une image, visible sous la liste. Un mot inconnu reçoit tout
  de même un petit dessin d'aide (étoile, ampoule, smiley…).
- Les images sont intégrées au logiciel : rien n'est téléchargé.

## 0.8.4 (2026-10-14)

- Le journal des modifications décrit maintenant aussi toutes les anciennes
  versions (0.1.0 à 0.8.2) en français clair.

## 0.8.3 (2026-10-14)

- Le journal des modifications joint à chaque version décrit maintenant en
  français clair ce qui change dans l'application, au lieu du simple nom de la
  demande traitée.

## 0.8.2 (2026-10-14)

- Mots à retenir : la difficulté augmente petit à petit. Trois réussites de
  suite ajoutent un mot ; deux échecs de suite en retirent un (jamais moins
  de 3). On commence à 3 mots et on peut monter jusqu'à 7.
- Mots à retenir : après 7 mots, l'enfant doit retenir une vraie phrase
  d'environ 10 mots et la retaper entière, dans l'ordre.
- Mots à retenir : en dessous de 5 mots, les mots doivent être écrits
  exactement ; à partir de 5 mots, accents et majuscules ne comptent pas.
- Mots à retenir : la progression de chaque enfant est mémorisée ; il peut
  « Reprendre ma partie » là où il s'était arrêté, ou repartir de zéro.
- Espace ergo, section Mots : les phrases à retenir peuvent être ajoutées,
  modifiées ou supprimées.
- Statistiques de Mots à retenir : palier atteint, réussites et échecs, et
  historique de chaque progression.

## 0.8.1 (2026-10-14)

- Profil de l'enfant : nouvelle étape « Classe » (du CP à la Terminale),
  obligatoire, juste après le prénom. L'âge peut aussi être indiqué.
- Attention : les profils créés sans classe avant cette version ont été
  retirés, avec leurs résultats.
- Dactylo : chaque phrase réussie affiche son score (vitesse et précision),
  chacun avec un smiley qui sourit toujours, même en rouge, et une étoile
  pour une grande réussite. La vitesse attendue dépend de la classe.
- Dactylo : un peu plus de temps entre deux phrases pour lire son score ;
  le score de la phrase précédente reste affiché pendant la suivante.
- Dactylo : l'écran de fin montre le score de chaque phrase.
- Statistiques de Dactylo : nouvelles courbes et tableau des moyennes par
  jour d'utilisation (vitesse et précision). La classe et l'âge de l'enfant
  sont indiqués sous son prénom.

## 0.8.0 (2026-10-13)

- Nouveau jeu : Petit bac. Une roue tire une lettre au sort ; pour chaque
  catégorie, l'enfant tape un mot qui commence par cette lettre (3 à 10
  catégories, temps au choix).
- Petit bac : le jeu vérifie la première lettre (accents, majuscules et
  article du début ne comptent pas) ; à la fin, on peut refuser ensemble les
  mots qui ne vont pas dans la catégorie.
- Espace ergo : nouvelle section « Petit bac » pour choisir les lettres et
  les catégories.
- Statistiques du Petit bac : mots acceptés, réussite et dernières grilles ;
  export Excel avec les réponses.

## 0.7.5 (2026-10-13)

- Améliorations internes, sans changement visible.

## 0.7.4 (2026-10-13)

- Chaque version publiée est accompagnée d'un journal des modifications.

## 0.7.3 (2026-10-13)

- Installation : chaque version est livrée en un seul fichier, l'installeur
  « DefilOrdi-Installation ». La version portable n'est plus proposée.

## 0.7.2 (2026-10-12)

- Chasse aux lettres, aventure cow-boy : nouveaux sons plus réalistes. Le
  coup de revolver résonne avec un écho, et chaque bouteille vole en éclats
  avec un bruit de verre différent.

## 0.7.1 (2026-10-12)

- Améliorations internes, sans changement visible.

## 0.7.0 (2026-10-12)

- Le jeu « Lettres de l'espace » devient « Chasse aux lettres » : l'enfant
  choisit son aventure avant de jouer, avec un aperçu animé de chacune.
- Mission spatiale (refaite) : une fusée aux couleurs de l'enfant détruit
  des météorites pour protéger sa planète.
- Nouvelle aventure, Stand de tir : un cow-boy tire sur des bouteilles en
  verre suspendues.
- Nouvelle aventure, Plongée sous-marine : un sous-marin attrape poissons,
  coquillages, pièces et coffres avec son rayon.
- Compte à rebours 3-2-1 avant la partie, sons propres à chaque aventure
  (toujours doux en cas d'erreur), records par série de lettres et par
  aventure.
- Statistiques : l'aventure jouée est indiquée pour chaque partie.

## 0.6.0 (2026-10-12)

- Espace ergo : nouvelle section « Quiz » pour créer, modifier et supprimer
  ses propres questions Vrai/Faux ou à choix multiples (thème, niveau,
  explication, image facultative).
- Quiz : chaque question fournie peut être activée ou désactivée.
- Quiz : les questions de l'ergothérapeute sont mélangées aux autres et
  apparaissent dans les statistiques. Un thème sans question n'est plus
  proposé à l'enfant.

## 0.5.0 (2026-10-12)

- Nouveau jeu : Quiz de l'ordinateur. 68 questions sur 5 thèmes (matériel,
  Windows et fichiers, Internet et sécurité, traitement de texte, raccourcis
  clavier), choisies selon le niveau de l'enfant.
- Quiz : questions Vrai/Faux, à choix multiples, avec images, et mises en
  situation sur de faux écrans où l'enfant clique (éteindre l'ordinateur,
  éjecter une clé USB, créer un dossier…), avec un indice après deux
  erreurs.
- Quiz : une explication après chaque réponse et un récapitulatif
  « À retenir » à la fin.
- Statistiques du Quiz : les questions le plus souvent ratées.

## 0.4.0 (2026-10-12)

- Nouveau jeu : Lettres de l'espace. Des lettres-météorites tombent ;
  l'enfant tape la bonne lettre pour que son vaisseau la détruise.
- Lettres de l'espace : choix des lettres (rangées du clavier, toutes,
  accents, majuscules) et de la durée (1 à 3 minutes) ; la vitesse dépend
  du niveau et augmente peu à peu ; pause avec la touche Échap.
- Statistiques : lettres détruites, tirs réussis, lettres tombées et clavier
  coloré des lettres ratées.

## 0.3.0 (2026-10-12)

- Nouveau jeu : Couleurs piégées. L'enfant écrit le mot, ou la couleur de
  l'encre, ou suit une consigne qui change ; le nombre de couleurs dépend du
  niveau.
- Nouveau jeu : Mots à retenir. Des mots s'affichent quelques secondes, puis
  l'enfant les retape de tête (accents et majuscules ne comptent pas).
- Espace ergo : nouvelle section « Mots » pour modifier les listes de mots.
- Statistiques : un onglet par jeu, avec historique et export.

## 0.2.0 (2026-10-11)

- Nouveau jeu : Dactylo. L'enfant choisit une liste et un nombre de phrases,
  puis les tape, avec un clavier à l'écran qui montre la touche à taper et
  le doigt à utiliser.
- Dactylo : temps, frappes par minute et précision en direct ; à la fin,
  record et touches à travailler.
- Espace ergo : listes de phrases modifiables et réglages Dactylo pour
  chaque enfant (accents, majuscules, blocage sur erreur, clavier, son).
- Statistiques de chaque enfant : courbes, clavier des erreurs, historique
  et export.

## 0.1.0 (2026-10-11)

- Première version de DefilOrdi.
- Accueil « Qui joue aujourd'hui ? » et page des jeux.
- Création du profil de l'enfant : prénom, personnage à personnaliser
  (humain ou robot), couleurs préférées qui colorent l'écran, sons de
  réussite et d'erreur.
- Espace ergothérapeute protégé par un code : liste des enfants et de leur
  niveau, volume, changement du code, sauvegarde et restauration des
  données.
- Toutes les données restent sur l'ordinateur.
