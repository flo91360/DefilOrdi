# DefilOrdi

Logiciel pédagogique pour apprendre à se servir du clavier d'un ordinateur.
Il aide une ergothérapeute à faire travailler des enfants de 8 à 18 ans sur
ordinateur, à travers un hub de petits jeux et un profil personnalisé par enfant.

## Installer le logiciel (Windows 10 / 11)

Deux versions du programme sont fabriquées automatiquement :

- **`DefilOrdi-Installation-x.y.z.exe`** (recommandé) : installe le logiciel et
  crée un raccourci sur le bureau. Aucun droit administrateur n'est nécessaire.
- **`DefilOrdi-Portable-x.y.z.exe`** : se lance directement, sans installation
  (pratique sur une clé USB). Le démarrage est un peu plus lent.

Où les trouver sur GitHub : onglet **Releases** pour les versions publiées, ou
onglet **Actions** → dernier passage de « Windows .exe » → section *Artifacts*.

Au premier lancement, Windows peut afficher « Windows a protégé votre
ordinateur », car le programme n'est pas signé numériquement : cliquer sur
**Informations complémentaires**, puis **Exécuter quand même**.

## Ce que contient la version actuelle

**Étape 1 — hub et profils**

- Écran d'accueil « Qui joue aujourd'hui ? » avec les profils des enfants.
- Création et modification de profil : prénom, personnage (humain ou robot,
  personnalisable), deux couleurs préférées qui colorent l'interface, son de
  réussite et son d'erreur.
- Espace ergothérapeute protégé par un code à 4 chiffres (**0000 par défaut**,
  à changer dans *Réglages*).

**Étape 2 — jeu Dactylo**

- L'enfant choisit une liste de phrases (celles de son niveau sont proposées en
  premier) et le nombre de phrases (3, 5 ou 10), puis les tape.
- Clavier AZERTY à l'écran : la touche à taper est mise en évidence, avec les
  couleurs des doigts et une aide pour les touches spéciales (« Maj + a »,
  « ^ puis e »).
- Temps, frappes par minute et précision en direct ; écran de fin avec le
  résultat, les records et les touches à travailler.
- Espace ergothérapeute :
  - **Phrases** : modifier les listes (une phrase par ligne), en créer, en
    supprimer, restaurer les listes d'origine ;
  - **Réglages** de chaque enfant : exiger ou non les accents et les majuscules,
    bloquer sur les erreurs ou faire effacer avec ⌫, afficher le clavier, son à
    chaque erreur ;
  - **Statistiques** de chaque enfant : courbes de vitesse et de précision,
    clavier des erreurs par touche, historique des parties, export Excel (CSV).

**Étape 3 — Couleurs piégées et Mots à retenir**

- **Couleurs piégées** (effet Stroop) : un nom de couleur est écrit dans une
  autre couleur. Selon le mode, l'enfant tape le mot, la couleur de l'encre,
  ou les deux selon une consigne qui change à chaque manche (mode « difficile »).
  10 ou 20 manches ; 4 couleurs au niveau 1, jusqu'à 8 au niveau 4. Sont
  mesurés : bonnes réponses, pièges déjoués (mot et encre différents), temps
  moyen de réponse.
- **Mots à retenir** : quelques mots s'affichent (3 à 8, selon le niveau par
  défaut), l'enfant les mémorise puis les retape de tête dans l'ordre qu'il
  veut. Accents et majuscules ne comptent pas. Sont mesurés : mots retrouvés,
  mots proposés en trop, temps.
- Espace ergothérapeute : section **Mots** pour modifier les listes de mots, et
  un onglet par jeu dans les statistiques de chaque enfant (courbes,
  historique, export Excel).

**Étape 4 — Lettres de l'espace**

- Des lettres-météorites tombent ; taper la bonne touche envoie un laser depuis
  le vaisseau (aux couleurs de l'enfant) et détruit la lettre la plus basse.
- Séries : rangée du milieu, du haut, du bas, toutes les lettres, lettres
  accentuées, majuscules. Mission de 1, 2 ou 3 minutes ; la vitesse dépend du
  niveau et augmente doucement pendant la partie. Pas de « game over » : une
  lettre qui touche le sol est simplement comptée comme tombée.
- Clavier à l'écran avec la touche à taper (si activé dans les réglages de
  l'enfant). Échap ou la perte du focus met le jeu en pause.
- Sont mesurés : lettres détruites (et par minute), tirs réussis, lettres
  tombées, et les lettres ratées (clavier coloré dans les statistiques).

### Règles de comptage (Dactylo)

- Une frappe = un caractère tapé, erreurs comprises. « ^ puis e » donne « ê » et
  compte pour une seule frappe. Retour arrière ne compte pas.
- Précision = caractères justes au moment de la frappe / frappes : corriger une
  erreur ne l'efface pas des statistiques.
- Vitesse = frappes justes par minute ; mots par minute = caractères des phrases
  réussies / 5 par minute (convention habituelle).
- Le chronomètre d'une phrase part à la première frappe et s'arrête quand elle
  est entièrement juste ; les pauses entre les phrases ne comptent pas.
- Les majuscules accentuées (É, À…) ne se tapent pas simplement sur un clavier
  Windows : la majuscule sans accent est acceptée.

## Données et confidentialité

Toutes les données restent sur le PC, dans `%APPDATA%\DefilOrdi\donnees.json`.
Rien n'est envoyé sur Internet. Seul le prénom de l'enfant est enregistré.
L'espace ergothérapeute permet d'enregistrer une sauvegarde (par exemple sur une
clé USB) et de la restaurer sur ce PC ou sur un autre.

## Développement

Electron + React + TypeScript, construit avec electron-vite et electron-builder.

```bash
npm install
npm run dev          # lance l'application Electron en mode développement
npm run dev:web      # lance seulement l'interface dans un navigateur (données dans localStorage)
npm run typecheck
npm test
npm run dist:win     # fabrique les .exe dans dist/ (sous Linux : nécessite wine 32 bits pour l'installeur)
npm run dist:portable  # fabrique seulement le .exe portable (fonctionne sous Linux sans wine)
```
