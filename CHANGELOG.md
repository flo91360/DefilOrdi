# Journal des modifications de DefilOrdi

## 0.8.6 — 2026-10-15
<!-- planifikateur:c27f01ee-84e7-4a48-ae7e-93e0f4e998e7 -->

- **Amélioration couleurs piégées** : Couleurs piégées a maintenant un bouton « Indice », réglable dans l'espace ergo, et des textes nettement plus grands. Le typecheck, les tests et le build passent. Je n'ai pas pu voir l'affichage à l'écran (aucun navigateur de test sur cette machine) : la taille des textes et l'absence de débordement restent à vérifier sur le PC. **Bouton Indice (selon vos réponses : 1A, progression proposée, deux réglages)** - Le bouton apparaît pendant la saisie seulement quand il faut écrire la couleur de l'encre et qu'elle diffère du mot. Quand la réponse est le mot affiché (mode « Le mot », consigne « MOT », ou mot et encre identiques), il n'apparaît pas et aucun indice n'est compté. - Un clic affiche « C'est peut-être : … » avec des couleurs. La bonne réponse y figure toujours, sans doublon, et le mot piège peut y figurer. Ce sont de simples étiquettes : l'enfant tape toujours sa réponse au clavier. Elles restent affichées jusqu'à la fin du mot, correction comprise. - 3 indices au plus par partie, et le compteur repart à zéro à chaque nouvelle partie. Le 1er indice montre 2 propositions, le 2e 3, le 3e 4 (jamais plus de 4). Le bouton indique combien d'indices il reste. Une fois tout utilisé, il reste grisé avec « plus d'indice, tu vas y arriver ! ». Aucun son n'est ajouté. - Sans clic sur Indice, le jeu se déroule comme avant. **Espace ergo, Réglages** (même réglage pour tous les enfants) - Nombre d'indices par partie : 0 (le bouton disparaît), 1, 2 ou 3. Par défaut : 3. - Nombre de propositions au premier indice : 2, 3 ou 4. Il augmente ensuite d'une proposition par indice, jusqu'à 4. Par défaut : 2. - Une phrase sous les réglages montre la progression qui en résulte. - Une ancienne sauvegarde ou une valeur invalide reprend ces valeurs par défaut. **Statistiques** - Chaque partie enregistre le nombre d'indices utilisés. Les parties jouées avant cette version comptent 0. - Statistiques de Couleurs piégées : nouvelle tuile (indices de la dernière partie, total, nombre de parties

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
