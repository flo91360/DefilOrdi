# Journal des modifications de DefilOrdi

## 0.8.3 — 2026-10-14
<!-- planifikateur:9524ec89-6195-437f-9014-bf132ac3a18a -->

- **Changelog** : À partir de la prochaine version, le journal des modifications et les notes de chaque Release contiennent une description en français clair des changements, à la place du simple nom de la carte. Comme demandé, les versions déjà publiées n'ont pas été réécrites. Rien n'a pu être exécuté : ni le script, ni la vérification de types, ni les tests, ni la fabrication. Dans cet environnement, toute commande échoue (bwrap: Can't mount proc), ce sont donc les vérifications du worker qui feront foi. Ce qui a changé : - **Nouveau fichier `changements.md`** : à chaque livraison, on remplace entièrement sa section « Prochaine version » par la description de ce que voit l'ergothérapeute. Il n'y a pas besoin de connaître le numéro de version, donc cela marche aussi quand le worker le choisit. - **`scripts/changelog.mjs`** : pour chaque version publiée, le script reprend la section « Prochaine version » telle qu'elle était au moment de la publication. Il ne le fait que si ce texte a changé depuis la version précédente, ce qui évite de répéter une description oubliée. Pour la version pas encore publiée, il prend le fichier actuel. Une section « ## &lt;version> » permet aussi de corriger plus tard le texte d'une version déjà publiée. - **Sans description**, le script reprend les sujets des commits comme avant : c'est ce que gardent les anciennes versions. - **Notes de Release** : elles reprennent exactement le même texte que le journal. Le fichier de la CI n'a pas eu besoin d'être modifié. - **CLAUDE.md** : la nouvelle section « Description des changements » donne les règles de rédaction. Elles s'adressent à une lectrice non technicienne : une puce par changement visible, en commençant par le jeu ou l'écran concerné, sans jargon ni titre de carte. Un changement interne tient en une seule puce courte. `changements.md` contient déjà la description de cette livraison : « le journal des modifications décrit maintenant en clair ce qui change ». Le worker ajoute aussi lui-même une section dan

## 0.8.2 (2026-10-14)

- Carte amélioration jeu "mot à retenir" (b145c7e9-ab21-48e6-8ceb-06c8bc306917) (#11)

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
