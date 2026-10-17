# Changements de DefilOrdi, rédigés pour l'ergothérapeute

<!--
Ce fichier est lu par scripts/changelog.mjs pour fabriquer CHANGELOG.md et les
notes de chaque Release. Règles de rédaction : voir CLAUDE.md, « Description
des changements ».

- « ## Prochaine version

- Couleurs piégées : nouveau bouton « Indice ». Quand l'enfant doit écrire
  la couleur de l'encre, il peut cliquer dessus s'il bloque : quelques
  couleurs s'affichent, dont toujours la bonne réponse (le mot piège peut
  aussi y figurer). L'enfant doit quand même taper sa réponse au clavier. Les
  propositions restent affichées jusqu'à la fin du mot.
- Couleurs piégées : le bouton n'apparaît pas quand il faut écrire le mot,
  puisqu'il est déjà affiché à l'écran.
- Couleurs piégées : 3 indices au plus par partie. Le premier montre 2
  propositions, le deuxième 3 et le troisième 4. Sans indice, le jeu se
  déroule comme avant.
- Espace ergo, Réglages : on peut choisir le nombre d'indices par partie
  (de 0, ce qui retire le bouton, à 3) et le nombre de propositions du
  premier indice (2, 3 ou 4). Ce réglage vaut pour tous les enfants.
- Statistiques de Couleurs piégées : le nombre d'indices utilisés est
  indiqué pour chaque partie et dans l'export Excel. Il vaut 0 pour les
  parties jouées avant cette version.
- Couleurs piégées : tous les textes du jeu sont nettement plus grands (mot
  en couleur, consignes, réponse, boutons, écran de fin…). Le mot en couleur
  s'adapte à la largeur de l'écran pour ne jamais déborder.

## 0.8.2 ») : texte d'une version déjà publiée,
  prioritaire sur tout le reste ; sert à corriger une version passée.
-->

## Prochaine version

- Mots à retenir : nouvelle option « Aide dys », à choisir avant la partie
  (pour les paliers de 3 à 7 mots). Quand l'enfant tape un mot qu'il a bien
  retenu mais mal écrit, ce n'est pas compté comme une erreur tout de suite :
  trois orthographes s'affichent et il choisit la bonne. S'il se trompe de
  choix, l'erreur est comptée et il peut réessayer.
- Sans l'option, le jeu se déroule exactement comme avant.

## 0.8.2

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

## 0.8.1

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

## 0.8.0

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

## 0.7.5

- Améliorations internes, sans changement visible.

## 0.7.4

- Chaque version publiée est accompagnée d'un journal des modifications.

## 0.7.3

- Installation : chaque version est livrée en un seul fichier, l'installeur
  « DefilOrdi-Installation ». La version portable n'est plus proposée.

## 0.7.2

- Chasse aux lettres, aventure cow-boy : nouveaux sons plus réalistes. Le
  coup de revolver résonne avec un écho, et chaque bouteille vole en éclats
  avec un bruit de verre différent.

## 0.7.1

- Améliorations internes, sans changement visible.

## 0.7.0

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

## 0.6.0

- Espace ergo : nouvelle section « Quiz » pour créer, modifier et supprimer
  ses propres questions Vrai/Faux ou à choix multiples (thème, niveau,
  explication, image facultative).
- Quiz : chaque question fournie peut être activée ou désactivée.
- Quiz : les questions de l'ergothérapeute sont mélangées aux autres et
  apparaissent dans les statistiques. Un thème sans question n'est plus
  proposé à l'enfant.

## 0.5.0

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

## 0.4.0

- Nouveau jeu : Lettres de l'espace. Des lettres-météorites tombent ;
  l'enfant tape la bonne lettre pour que son vaisseau la détruise.
- Lettres de l'espace : choix des lettres (rangées du clavier, toutes,
  accents, majuscules) et de la durée (1 à 3 minutes) ; la vitesse dépend
  du niveau et augmente peu à peu ; pause avec la touche Échap.
- Statistiques : lettres détruites, tirs réussis, lettres tombées et clavier
  coloré des lettres ratées.

## 0.3.0

- Nouveau jeu : Couleurs piégées. L'enfant écrit le mot, ou la couleur de
  l'encre, ou suit une consigne qui change ; le nombre de couleurs dépend du
  niveau.
- Nouveau jeu : Mots à retenir. Des mots s'affichent quelques secondes, puis
  l'enfant les retape de tête (accents et majuscules ne comptent pas).
- Espace ergo : nouvelle section « Mots » pour modifier les listes de mots.
- Statistiques : un onglet par jeu, avec historique et export.

## 0.2.0

- Nouveau jeu : Dactylo. L'enfant choisit une liste et un nombre de phrases,
  puis les tape, avec un clavier à l'écran qui montre la touche à taper et
  le doigt à utiliser.
- Dactylo : temps, frappes par minute et précision en direct ; à la fin,
  record et touches à travailler.
- Espace ergo : listes de phrases modifiables et réglages Dactylo pour
  chaque enfant (accents, majuscules, blocage sur erreur, clavier, son).
- Statistiques de chaque enfant : courbes, clavier des erreurs, historique
  et export.

## 0.1.0

- Première version de DefilOrdi.
- Accueil « Qui joue aujourd'hui ? » et page des jeux.
- Création du profil de l'enfant : prénom, personnage à personnaliser
  (humain ou robot), couleurs préférées qui colorent l'écran, sons de
  réussite et d'erreur.
- Espace ergothérapeute protégé par un code : liste des enfants et de leur
  niveau, volume, changement du code, sauvegarde et restauration des
  données.
- Toutes les données restent sur l'ordinateur.
