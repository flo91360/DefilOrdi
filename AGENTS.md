# Consignes pour les agents

Toutes les consignes de ce dépôt sont dans `CLAUDE.md` : le lire en entier
avant de commencer.

Le plus souvent oublié : chaque livraison qui augmente `version` dans
`package.json` doit remplacer entièrement la section `## Prochaine version`
de `changements.md` par la description de ce qu'elle change, rédigée pour
l'ergothérapeute (voir « Description des changements » dans `CLAUDE.md`). Ne
pas y reprendre le titre de la carte ni un compte rendu technique. Ne pas
modifier `CHANGELOG.md` : il est fabriqué automatiquement à partir de
`changements.md`. Sur une PR, la CI échoue si cette description manque.
