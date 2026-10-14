# Journal des modifications de DefilOrdi

## 0.8.2 — 2026-10-14
<!-- planifikateur:b145c7e9-ab21-48e6-8ceb-06c8bc306917 -->

- **amélioration jeu "mot à retenir"** : « Mots à retenir » a maintenant une difficulté progressive, mémorisée dans le profil de chaque enfant. Je n'ai pas pu lancer la vérification des types, les tests ni le build : le bac à sable bloque toutes les commandes. C'est le worker qui les lancera. **Règles de progression** (écrites dans le moteur `games/memoire/engine.ts`) - Les paliers vont de 3 à 7 mots. Le palier suivant est la phrase, qui remplace l'ancien choix « 8 mots ». - Une partie est réussie quand tous les mots, ou toute la phrase, sont retrouvés. - 3 réussites consécutives font monter d'un palier, quel que soit le nombre de mots de départ. - Un échec fait rejouer au même palier. Un 2e échec consécutif fait descendre d'un palier, même sous le palier de départ, mais jamais sous 3 mots. - Une réussite remet les échecs à zéro, et un échec remet les réussites à zéro. À chaque changement de palier, les deux compteurs repartent à zéro. - Arrêter pendant la recherche des mots compte comme un échec. Arrêter pendant le temps de mémorisation ne compte pas. - Au palier phrase, on reste à la phrase même après d'autres réussites. **Vérification des réponses** - Moins de 5 mots : le mot doit être écrit exactement, accents et majuscules compris. C'est un changement : avant, ils ne comptaient jamais. - De 5 à 7 mots : accents et majuscules ne comptent pas. - Phrase : accents, majuscules et ponctuation ne comptent pas. Elle est réussie seulement si tous les mots sont justes, dans l'ordre et sans mot en trop. Un mot oublié ne décale pas les suivants. L'enfant peut réessayer : les mots bien placés de son meilleur essai s'affichent. - Les sons d'erreur restent ceux choisis par l'enfant, avec le même délai entre deux sons. **Phrases fournies** - 12 phrases de 10 à 12 mots, toutes tapables au clavier AZERTY. - L'ergothérapeute les modifie dans l'espace ergothérapeute, section Mots, sous les listes de mots. Il y a aussi un bouton « Restaurer les phrases d'origine ». - Si la liste est vide, le jeu reprend les phrases d'orig

## 0.8.1 (2026-10-14)

- Carte score du jeu dactylo (de5d4639-893c-48e6-b92e-930c430b5caa) (#10)
- CHANGELOG.md dans le dépôt, mis à jour à chaque nouvelle version (#9)

## 0.8.0 (2026-10-13)

- Nouveau jeu : Petit bac (#8)
- CI : joindre NOTES.md au build au lieu d'un 2ᵉ CHANGELOG.md (#7)

## 0.7.5 (2026-10-13)

- Test (#6)
- CLAUDE.md : Claude fusionne ses PR quand la CI est verte

## 0.7.4 (2026-10-13)

- Journal des modifications et tag pour chaque nouvelle version (#4)

## 0.7.3 (2026-10-13)

- Production .exe (#3)

## 0.7.2 (2026-10-12)

- Carte Son chasse aux lettres cowboy (a7aba366-f9ed-4bf3-8760-d878261536be) (#2)
- Publier une Release seulement pour une nouvelle version, sans job Drive

## 0.7.1 (2026-10-12)

- Publish versioned Windows executables to the configured Google Drive folder
- Validate agent pull requests on their exact head commit

## 0.7.0 (2026-10-12)

- Chasse aux lettres : trois aventures (fusée, cow-boy, sous-marin)

## 0.6.0 (2026-10-12)

- Quiz : éditeur de questions pour l'ergothérapeute

## 0.5.0 (2026-10-12)

- Quiz de l'ordinateur : vrai/faux, QCM, visuels et mises en situation

## 0.4.0 (2026-10-12)

- Étape 4 : jeu Lettres de l'espace

## 0.3.0 (2026-10-12)

- Étape 3 : jeux Couleurs piégées et Mots à retenir

## 0.2.0 (2026-10-11)

- Étape 2 : jeu Dactylo, listes de phrases et statistiques

## 0.1.0 (2026-10-11)

- CI : publie les .exe dans les Releases à chaque mise à jour de main
- Étape 1 : hub, profils des enfants et fabrication du .exe Windows
- Implement Godot V0 and automatic Windows executable export
- Initial commit
