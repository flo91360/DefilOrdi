# DéfilOrdi — V0

Application de bureau en français pour découvrir le clavier avec une ergothérapeute.
Projet **Godot 4.6**, en GDScript, sans dépendances externes ni connexion obligatoire.

## Essayer sur Windows

Le fichier utilisateur est **`exports/DefilOrdi.exe`**, un exécutable Windows 64 bits
avec les ressources intégrées. Double-cliquer dessus : aucune installation de Godot requise.
Les profils sont enregistrés automatiquement dans le dossier utilisateur Windows.

À chaque push sur `main`, GitHub Actions exécute les tests, construit l’exécutable et
le publie comme artefact **DefilOrdi-Windows** (archive contenant uniquement le `.exe`).
Le workflow peut aussi être lancé manuellement. Il doit être poussé sur GitHub pour être actif.

Pour reconstruire localement avec Godot 4.6.3 et ses modèles d’export installés :
`bash scripts/export_windows.sh`. Le projet utilise le préréglage Windows Desktop avec
`embed_pck=true`. L’exécution sur un PC Windows reste à vérifier.

## État des lieux

- Menu principal et sélection de plusieurs profils.
- Création/édition : pseudonyme, personnage (choix textuel provisoire), couleur, son de réussite avec écoute.
- Banque de phrases commune modifiable dans l’espace ergothérapeute.
- Dactylographie avec accents, ponctuation et correction par Retour arrière.
- Départ du chronomètre à la première saisie ; arrêt lorsque la phrase est exacte.
- Temps, frappes/minute et précision ; historique par profil.
- Sons synthétisés localement ; mode silencieux.

Les frappes sont les caractères insérés, y compris les erreurs et les remplacements.
Retour arrière ne compte pas comme une frappe. La précision est le rapport entre les
caractères corrects au moment de leur insertion et tous les caractères insérés : corriger
une erreur ne l’efface pas des statistiques. Les espaces comptent. Il ne s’agit pas encore
 d’une mesure de touches physiques. Les raccourcis de collage sont désactivés dans l’exercice.

## Données

Cette V0 utilise un fichier JSON local (`user://profiles.json`), adapté au prototype,
plutôt que SQLite. Sur Windows, Godot le place généralement dans
`%APPDATA%/Godot/app_userdata/DéfilOrdi/`. Les profils utilisent uniquement un pseudonyme ;
aucune fiche médicale n’est prévue dans cette version. L’espace ergothérapeute n’a pas
 encore de protection d’accès. Pas de synchronisation, chiffrement ou sauvegarde automatique.

## Vérification dans l’environnement cloud

```bash
cd /workspace/DefilOrdi
export XDG_DATA_HOME=/workspace/.defilordi/data
export XDG_CONFIG_HOME=/workspace/.defilordi/config
export XDG_CACHE_HOME=/workspace/.defilordi/cache
godot --headless --path . --editor --quit
# Données de test séparées des profils réels, neuves à chaque exécution :
TEST_DATA_DIR=$(mktemp -d /tmp/defilordi-test.XXXXXX)
XDG_DATA_HOME="$TEST_DATA_DIR" godot --headless --path . --script tests/smoke.gd
```

Le test exerce la sauvegarde/relecture, les accents, une faute corrigée, le chronomètre,
les statistiques, la navigation et l’enregistrement unique d’un résultat.
Il ne vérifie pas le rendu visuel, le son audible ni le clavier physique Windows.

## Prochaines étapes

- Illustrations des personnages et accessoires ; son d’erreur optionnel.
- Réglages d’accessibilité, taille du texte, difficultés et pauses.
- Gestion/suppression des profils, sauvegardes et export des résultats.
- Jeux de mémoire, couleurs, petit bac et lettres spatiales.
- Validation visuelle et export Windows.

## Organisation

- `scripts/main.gd` : interface et navigation du prototype.
- `scripts/store.gd` : persistance locale.
- `scripts/typing_session.gd` : logique de l’exercice et statistiques.
- `tests/smoke.gd` : test fonctionnel sans interface graphique.

Les prochains jeux pourront utiliser des scènes séparées tout en conservant les profils
et la banque de données partagée.
