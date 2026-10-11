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

## Ce que contient la version actuelle (étape 1)

- Écran d'accueil « Qui joue aujourd'hui ? » avec les profils des enfants.
- Création et modification de profil : prénom, personnage (humain ou robot,
  personnalisable), deux couleurs préférées qui colorent l'interface, son de
  réussite et son d'erreur.
- Hub des jeux (les jeux arrivent aux étapes suivantes).
- Espace ergothérapeute protégé par un code à 4 chiffres (**0000 par défaut**,
  à changer dans *Réglages*) : liste des patients, niveau de difficulté par
  enfant, volume, sauvegarde et restauration.

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
