// Listes de phrases fournies au départ. L'ergothérapeute peut les modifier,
// en ajouter ou les supprimer depuis son espace ; « Restaurer les listes
// d'origine » remet celles-ci.

export interface ListePhrases {
  id: string
  nom: string
  // Niveau conseillé (1 à 4) : la liste est proposée en premier aux enfants de ce niveau.
  niveau: number
  phrases: string[]
}

export function defaultListes(): ListePhrases[] {
  return [
    {
      id: 'origine-1',
      nom: 'Premiers mots',
      niveau: 1,
      phrases: [
        'le chat dort',
        'papa lit un livre',
        'il fait beau',
        'je mange une pomme',
        'la lune brille',
        'mon chien court vite',
        'le bus est rouge',
        'nous jouons dans le jardin',
        'tu as un joli sac',
        'le soleil se couche'
      ]
    },
    {
      id: 'origine-2',
      nom: 'Phrases simples',
      niveau: 2,
      phrases: [
        'Il pleut depuis ce matin.',
        'Le chat noir dort sur le canapé.',
        "J'aime les fraises et les cerises.",
        'Mon frère joue de la guitare.',
        'Nous irons au cinéma samedi.',
        'La voiture bleue roule doucement.',
        'Le facteur apporte une lettre.',
        "Elle a oublié son parapluie à l'école.",
        'Les oiseaux chantent dans les arbres.',
        'Demain, je vais chez ma grand-mère.'
      ]
    },
    {
      id: 'origine-3',
      nom: 'Phrases plus longues',
      niveau: 3,
      phrases: [
        'Le petit garçon a construit une cabane au fond du jardin.',
        "Pendant les vacances, nous sommes allés voir la mer en Bretagne.",
        "Ma cousine prépare un gâteau au chocolat pour l'anniversaire de papa.",
        "Le chien de la voisine aboie dès que quelqu'un passe devant la porte.",
        'Il faut bien se laver les mains avant de passer à table.',
        'La bibliothèque du quartier ouvre ses portes le mercredi après-midi.',
        'Après la pluie, un magnifique arc-en-ciel est apparu dans le ciel.',
        "Les élèves ont fabriqué une fusée en carton pour la fête de fin d'année."
      ]
    },
    {
      id: 'origine-4',
      nom: 'Textes avec ponctuation',
      niveau: 4,
      phrases: [
        'Le train de 8 h 15 est arrivé avec 20 minutes de retard ; personne ne savait pourquoi.',
        "As-tu déjà vu une étoile filante ? Il paraît qu'il faut faire un souhait très vite !",
        'Pour la recette, il faut : 250 g de farine, 2 bananes, du lait et une pincée de sel.',
        '"Attention à la marche !" répète le conducteur à chaque arrêt du bus.',
        "Le 14 juillet, les habitants se réunissent sur la place pour admirer le feu d'artifice.",
        'Quelle surprise ! Le colis que nous attendions depuis deux semaines est enfin arrivé.',
        'Les scientifiques observent les volcans pour prévoir les éruptions et protéger la population.'
      ]
    }
  ]
}

// Listes de mots du jeu « Mots à retenir » (même format : un mot par ligne).
export function defaultListesMots(): ListePhrases[] {
  return [
    {
      id: 'mots-1',
      nom: 'Mots courts',
      niveau: 1,
      phrases: ['chat', 'lune', 'pomme', 'bus', 'lit', 'sac', 'main', 'pain', 'loup', 'robe', 'mur', 'nez', 'lac', 'four', 'jus', 'pont']
    },
    {
      id: 'mots-2',
      nom: 'Animaux',
      niveau: 2,
      phrases: [
        'lapin', 'tigre', 'cheval', 'souris', 'girafe', 'mouton', 'requin', 'canard',
        'renard', 'tortue', 'zèbre', 'hibou', 'singe', 'baleine', 'poule', 'abeille'
      ]
    },
    {
      id: 'mots-3',
      nom: 'À la maison',
      niveau: 3,
      phrases: [
        'fenêtre', 'escalier', 'cuisine', 'téléphone', 'oreiller', 'armoire', 'lumière', 'tapis',
        'bougie', 'étagère', 'grenier', 'cheminée', 'réveil', 'fauteuil', 'baignoire', 'placard'
      ]
    },
    {
      id: 'mots-4',
      nom: 'Mots plus longs',
      niveau: 4,
      phrases: [
        'bibliothèque', 'hélicoptère', 'parapluie', 'anniversaire', 'dictionnaire', 'ordinateur',
        'thermomètre', 'champignon', 'astronaute', 'chocolatier', 'boulangerie', 'trampoline',
        'kangourou', 'aquarium', 'calendrier', 'papillon'
      ]
    }
  ]
}
