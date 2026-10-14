# Journal des modifications de DefilOrdi

## 0.8.1 — 2026-10-14
<!-- planifikateur:de5d4639-893c-48e6-b92e-930c430b5caa -->

- **score du jeu dactylo** : Dans Dactylo, chaque phrase a maintenant son score : vitesse en frappes par minute et précision, chacune avec son smiley. Le score est calculé selon la classe de l'enfant. Je n'ai pas pu lancer la vérification des types, les tests ni la compilation : ici, toutes les commandes du terminal étaient bloquées par le bac à sable. Ces vérifications restent donc à faire par le worker. **Profil de l'enfant** - Une étape « Classe » a été ajoutée juste après le prénom. L'enfant choisit sa classe (CP à Terminale), sans laquelle il ne peut pas continuer. Il peut aussi choisir son âge, de 6 à 18 ans, mais ce n'est pas obligatoire. C'est la même étape à la création et à la modification. - Au chargement des données, les profils sans classe valide sont supprimés, avec leurs résultats. La version des données passe de 3 à 4. - L'écran de statistiques affiche aussi la classe et l'âge sous le prénom. **Seuils** - Toutes les valeurs (vitesse par classe et précision : 65, 75 et 90 %) sont réunies dans une seule constante, `SEUILS_DACTYLO`, dans le nouveau fichier `src/renderer/src/games/dactylo/seuils.ts`. On peut les changer à un seul endroit. - La règle suit la demande : strictement en dessous de la valeur rouge, smiley rouge ; ensuite orange ; puis vert ; à partir de la valeur étoile, 🌟. - Le smiley est choisi d'après la vitesse arrondie, c'est-à-dire le nombre que l'enfant voit à l'écran. - Les smileys rouge, orange et vert sont des visages colorés qui sourient toujours, même le rouge. Leur info-bulle est encourageante, par exemple « Continue, tu vas y arriver ! ». **Pendant la partie et à la fin** - Quand une phrase est réussie, son score apparaît dans sa carte. J'ai allongé la pause avant la phrase suivante de 1,1 à 2,5 secondes pour laisser le temps de le lire. - Pendant la phrase suivante, un rappel « Phrase précédente : … » reste affiché sous la carte. - L'écran de fin a un récapitulatif « Phrase par phrase » : numéro, texte, vitesse, précision et les deux smileys. - Les scores 

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
