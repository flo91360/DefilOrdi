# Journal des modifications de DefilOrdi

## 0.8.22 — 2026-10-18
<!-- planifikateur:e514bc6e-fa06-4185-a0e0-7ee994498765 -->

- **amélioration quizz sur les mise en situation** : Je n'ai rien modifié ce tour-ci. Le travail est déjà dans le dépôt (PR n°31) et je n'ai trouvé aucun marqueur de conflit. Le worker n'a transmis aucune nouvelle erreur. Les mises en situation du quiz se valident par clic ou par raccourci clavier : - Gras : Ctrl+G - Centrer : Ctrl+E - Annuler : Ctrl+Z - Enregistrer : Ctrl+S - Nouveau document : Ctrl+N Après la réponse, le message de correction ajoute « Ça peut aussi se faire avec Ctrl+X » (avec le raccourci de la question). Rien n'est affiché avant la réponse. La validation par clic n'a pas changé. Copier, Coller, Couper et Tout sélectionner n'ont pas de mise en situation dans la banque : ce sont des QCM, hors du périmètre de la carte. Il suffira de renseigner `raccourci` si on en ajoute.

## 0.8.21 (2026-10-18)

- Quiz : nouveau thème « Points reliés », séparé des autres thèmes. L'enfant voit les 9 logiciels (PowerPoint, Word, XMind, PDF X-Change Editor, Exchange, Souris, Scan, Clé USB, Outil capture) et 10 actions ; il clique sur une action, puis sur le logiciel qui convient.
- Points reliés : la vérification se fait seulement une fois les 10 liaisons faites, avec la correction des erreurs. La partie n'est réussie qu'avec 10 liaisons justes sur 10.
- Points reliés : les 10 actions sont tirées au hasard dans une liste de 26 actions, pour que les parties varient. La liste est fournie dans un document à relire (docs/points-relies-actions.md).
- Quiz, « Tout mélanger » : le thème « Points reliés » peut apparaître, au plus une fois par partie.
- Mots à retenir : quand l'enfant ne se souvient d'aucun mot et clique sur « Je ne me souviens plus », la partie ne s'arrête plus. Un indice s'affiche : la première lettre d'un mot, le nombre de lettres et l'image si elle existe (avec une phrase, la première lettre du premier mot et le nombre de mots). Un second clic sur le bouton termine la partie.
- Couleurs piégées : les réponses possibles ne sont plus affichées sous la consigne. Les couleurs proposées n'apparaissent que si l'enfant clique sur le bouton « Indice ».
- Couleurs piégées : nouveau 4e mode, « Couleurs piégées timer ». Il fonctionne comme « Les deux » (le mot ou la couleur de l'encre), mais contre la montre : l'enfant choisit 1, 2 ou 3 minutes et réussit un maximum de manches. Le temps restant s'affiche en haut de l'écran.
- Couleurs piégées timer : à la fin du temps, le score est le nombre de bonnes réponses. Une erreur n'est pas comptée et n'entraîne aucune autre pénalité.
- Couleurs piégées timer : le bouton « Indice » reste disponible, à raison d'un indice par minute (2 indices pour une partie de 2 minutes). Si le nombre d'indices est réglé à 0 dans l'espace ergo, le bouton reste retiré.
- Couleurs piégées timer : l'écran de fin annonce un nouveau record quand l'enfant bat son meilleur score pour la même durée.
- Statistiques de Couleurs piégées : les parties chronométrées s'affichent sous la forme « Couleurs piégées timer », durée en minutes et nombre de bonnes réponses. Un encadré « Records » donne le meilleur score pour chaque durée. L'export Excel contient les mêmes informations.
- Couleurs piégées, modes « Les deux » et timer : la consigne (écrire le mot ou la couleur de l'encre) est tirée au hasard à chaque manche, pour que l'enfant ne puisse pas deviner la suite.

## 0.8.20 (2026-10-18)

- Mots à retenir : quand l'enfant ne se souvient d'aucun mot et clique sur « Je ne me souviens plus », la partie ne s'arrête plus. Un indice s'affiche : la première lettre d'un mot, le nombre de lettres et l'image si elle existe (avec une phrase, la première lettre du premier mot et le nombre de mots). Un second clic sur le bouton termine la partie.
- Couleurs piégées : les réponses possibles ne sont plus affichées sous la consigne. Les couleurs proposées n'apparaissent que si l'enfant clique sur le bouton « Indice ».
- Couleurs piégées : nouveau 4e mode, « Couleurs piégées timer ». Il fonctionne comme « Les deux » (le mot ou la couleur de l'encre), mais contre la montre : l'enfant choisit 1, 2 ou 3 minutes et réussit un maximum de manches. Le temps restant s'affiche en haut de l'écran.
- Couleurs piégées timer : à la fin du temps, le score est le nombre de bonnes réponses. Une erreur n'est pas comptée et n'entraîne aucune autre pénalité.
- Couleurs piégées timer : le bouton « Indice » reste disponible, à raison d'un indice par minute (2 indices pour une partie de 2 minutes). Si le nombre d'indices est réglé à 0 dans l'espace ergo, le bouton reste retiré.
- Couleurs piégées timer : l'écran de fin annonce un nouveau record quand l'enfant bat son meilleur score pour la même durée.
- Statistiques de Couleurs piégées : les parties chronométrées s'affichent sous la forme « Couleurs piégées timer », durée en minutes et nombre de bonnes réponses. Un encadré « Records » donne le meilleur score pour chaque durée. L'export Excel contient les mêmes informations.
- Couleurs piégées, modes « Les deux » et timer : la consigne (écrire le mot ou la couleur de l'encre) est tirée au hasard à chaque manche, pour que l'enfant ne puisse pas deviner la suite.

## 0.8.19 (2026-10-18)

- Couleurs piégées : les réponses possibles ne sont plus affichées sous la consigne. Les couleurs proposées n'apparaissent que si l'enfant clique sur le bouton « Indice ».
- Couleurs piégées : nouveau 4e mode, « Couleurs piégées timer ». Il fonctionne comme « Les deux » (le mot ou la couleur de l'encre), mais contre la montre : l'enfant choisit 1, 2 ou 3 minutes et réussit un maximum de manches. Le temps restant s'affiche en haut de l'écran.
- Couleurs piégées timer : à la fin du temps, le score est le nombre de bonnes réponses. Une erreur n'est pas comptée et n'entraîne aucune autre pénalité.
- Couleurs piégées timer : le bouton « Indice » reste disponible, à raison d'un indice par minute (2 indices pour une partie de 2 minutes). Si le nombre d'indices est réglé à 0 dans l'espace ergo, le bouton reste retiré.
- Couleurs piégées timer : l'écran de fin annonce un nouveau record quand l'enfant bat son meilleur score pour la même durée.
- Statistiques de Couleurs piégées : les parties chronométrées s'affichent sous la forme « Couleurs piégées timer », durée en minutes et nombre de bonnes réponses. Un encadré « Records » donne le meilleur score pour chaque durée. L'export Excel contient les mêmes informations.
- Couleurs piégées, modes « Les deux » et timer : la consigne (écrire le mot ou la couleur de l'encre) est tirée au hasard à chaque manche, pour que l'enfant ne puisse pas deviner la suite.

## 0.8.18 (2026-10-18)

- Dactylo : le nombre d'erreurs de chaque phrase s'affiche à la fin de la phrase (jamais pendant la frappe) et dans le récapitulatif. L'ergothérapeute peut le masquer pour chaque enfant : Patients, réglages Dactylo, « Afficher le nombre d'erreurs ».
- Dactylo : dans le récapitulatif, la meilleure vitesse de frappe de la série est en gras.
- Dactylo : les grandes cartes de moyennes (vitesse et précision) affichent aussi le smiley correspondant.
- Dactylo : après une médaille, l'enfant peut écrire sa propre phrase (une phrase par médaille). Le logiciel lui rappelle la règle du niveau, dont le nombre maximal de mots : niveau 1, 6 mots sans accent, majuscule ni ponctuation ; niveau 2, 10 mots, une majuscule au début et au plus un signe de ponctuation ; niveau 3, 14 mots, au plus 3 signes ; niveau 4, sans maximum.
- Dactylo : la phrase est vérifiée sans connexion Internet (règles du niveau, caractères du clavier, orthographe). Si elle est refusée, l'enfant est averti avec douceur et peut la corriger. Le correcteur connaît les mots courants et ceux de vos listes de phrases : un mot rare peut être signalé à tort, vous pouvez alors valider la phrase.
- Dactylo : une phrase acceptée rejoint les phrases du niveau et peut être tirée pour tous les enfants.
- Espace ergo : nouvelle section « Phrases des enfants ». Les phrases refusées y apparaissent comme une notification (pastille rouge sur la section) ; vous pouvez les corriger, les valider, changer leur niveau ou les supprimer, ainsi que les phrases déjà ajoutées.

## 0.8.17 (2026-10-18)

- Journal des modifications : les versions 0.8.6, 0.8.7, 0.8.9, 0.8.10 et
  0.8.12 à 0.8.16 décrivent maintenant ce qui a vraiment changé, au lieu de
  reprendre le titre de la carte.
- Améliorations internes : une nouvelle version ne peut plus être livrée
  sans sa description pour le journal.

## 0.8.16 (2026-10-17)

- Dactylo : un message prévient l'enfant quand les majuscules sont
  verrouillées (touche Verr. Maj) et disparaît dès qu'il les enlève.
- Dactylo : nouvelles médailles. Une partie de 5 phrases réussie avec une
  vitesse et une précision moyennes au niveau étoile rapporte une médaille :
  chocolat, bronze, argent ou or selon le niveau de la liste jouée. La
  vitesse attendue dépend de la classe de l'enfant.
- La médaille gagnée s'affiche sur l'écran de fin et rejoint le coffre à
  médailles de l'enfant, ouvert depuis la page des jeux.
- Espace ergo : un bouton « Médailles » montre, pour chaque enfant, les
  médailles gagnées et leur date.

## 0.8.15 (2026-10-17)

- Profil de l'enfant : nouvelle étape « Lettres » pour choisir la police où
  il voit le mieux les lettres (Verdana, Arial, Calibri ou Comic Sans MS),
  avec un aperçu des lettres J, L, I, l, T et F. Verdana est choisie pour les
  profils existants.
- Chasse aux lettres : les lettres qui tombent utilisent cette police, dans
  les trois aventures.

## 0.8.14 (2026-10-17)

- Clavier à l'écran : il est maintenant masqué par défaut, pour les nouveaux
  profils comme pour les profils existants. Il peut être réactivé pour chaque
  enfant dans ses réglages.
- Chasse aux lettres : quand le clavier est activé pour l'enfant, on choisit
  avant chaque partie « Avec le clavier » ou « Sans le clavier ». Quand il
  est désactivé, il n'est pas proposé pendant la partie non plus.

## 0.8.13 (2026-10-17)

- Page des jeux : nouvel ordre des jeux. Chasse aux lettres, Mots à retenir,
  Couleurs piégées, Petit bac, Dactylo, puis Quiz de l'ordinateur.

## 0.8.12 (2026-10-17)

- Mots à retenir : nouveau bouton « Indice » quand il ne reste qu'un mot à
  retrouver (paliers de 3 à 7 mots). Il montre l'image du mot quand elle
  existe, sa première lettre et son nombre de lettres, sans jamais donner le
  mot entier.
- Un seul indice par partie, sans effet sur le score ni sur la progression.

## 0.8.11 (2026-10-17)

- Mots à retenir : nouvelle option « Aide dys », à choisir avant la partie
  (pour les paliers de 3 à 7 mots). Quand l'enfant tape un mot qu'il a bien
  retenu mais mal écrit, ce n'est pas compté comme une erreur tout de suite :
  trois orthographes s'affichent et il choisit la bonne. S'il se trompe de
  choix, l'erreur est comptée et il peut réessayer.
- Sans l'option, le jeu se déroule exactement comme avant.

## 0.8.10 (2026-10-17)

- Quiz, mise en situation « Supprime le fichier brouillon.txt » : on peut
  aussi faire un clic droit sur le fichier puis choisir « Supprimer » dans
  le menu. L'ancienne façon (sélectionner le fichier puis cliquer sur la
  corbeille) reste acceptée.

## 0.8.9 (2026-10-17)

- Chasse aux lettres, Plongée sous-marine : le sous-marin est maintenant en
  haut de l'écran, son rayon vise vers le bas et les objets remontent du
  fond. Les poissons vont plus vite que les autres objets.

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

- Couleurs piégées : nouvelle case « Entraînement à la souris », à cocher
  avant la partie (modes « La couleur » et « Les deux »). Pour donner la
  couleur de l'encre, l'enfant clique sur le bon nom de couleur au lieu de
  le taper.
- On choisit le clic à travailler : clic gauche (par défaut), clic droit ou
  double clic. Les autres clics sont ignorés. Ce choix n'est pas enregistré.
- Couleurs piégées : le message après une erreur dit « Tu as répondu » au
  lieu de « Tu as écrit ».

## 0.8.6 (2026-10-15)

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
