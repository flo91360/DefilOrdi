import type { Question } from './types'

// Banque de questions du quiz. Chaque question a un identifiant stable
// (utilisé dans les statistiques) : ne pas le changer une fois publié.

export const QUESTIONS: Question[] = [
  // ---------- Le matériel ----------
  {
    id: 'mat-souris',
    type: 'choix',
    theme: 'materiel',
    niveau: 1,
    visuel: { icone: 'souris' },
    question: 'Comment s’appelle cet objet ?',
    choix: ['Une souris', 'Un clavier', 'Une webcam', 'Une clé USB'],
    bonne: 0,
    explication: 'C’est une souris : on la déplace pour bouger le pointeur à l’écran, et on clique avec ses boutons.'
  },
  {
    id: 'mat-usb',
    type: 'choix',
    theme: 'materiel',
    niveau: 1,
    visuel: { icone: 'usb' },
    question: 'À quoi sert cet objet ?',
    choix: ['À transporter des fichiers', 'À charger la souris', 'À se connecter au Wi-Fi', 'À imprimer'],
    bonne: 0,
    explication: 'C’est une clé USB : une petite mémoire qu’on branche sur l’ordinateur pour enregistrer et transporter des fichiers.'
  },
  {
    id: 'mat-webcam',
    type: 'choix',
    theme: 'materiel',
    niveau: 1,
    visuel: { icone: 'webcam' },
    question: 'Qu’est-ce que c’est ?',
    choix: ['Une webcam', 'Un haut-parleur', 'Un micro', 'Une imprimante'],
    bonne: 0,
    explication: 'C’est une webcam, une petite caméra pour filmer ou faire des appels vidéo.'
  },
  {
    id: 'mat-imprimante',
    type: 'vraifaux',
    theme: 'materiel',
    niveau: 1,
    visuel: { icone: 'imprimante' },
    question: 'Cet appareil sert à mettre sur papier ce qu’il y a à l’écran.',
    reponse: true,
    explication: 'Oui, c’est une imprimante : elle imprime les documents sur du papier.'
  },
  {
    id: 'mat-clavier-ecrire',
    type: 'vraifaux',
    theme: 'materiel',
    niveau: 1,
    question: 'Le clavier sert à écrire des lettres et des chiffres.',
    reponse: true,
    explication: 'Oui ! Le clavier sert à taper du texte, des chiffres, et aussi à donner des ordres avec des raccourcis.'
  },
  {
    id: 'mat-ecran-sortie',
    type: 'choix',
    theme: 'materiel',
    niveau: 2,
    question: 'Lequel de ces appareils affiche des images mais ne sert pas à écrire ?',
    choix: ['L’écran', 'Le clavier', 'La souris', 'Le micro'],
    bonne: 0,
    explication: 'L’écran affiche ce que fait l’ordinateur. Le clavier, la souris et le micro servent au contraire à lui envoyer des informations.'
  },
  {
    id: 'mat-unite',
    type: 'choix',
    theme: 'materiel',
    niveau: 2,
    visuel: { icone: 'unite-centrale' },
    question: 'Comment appelle-t-on ce boîtier d’ordinateur fixe ?',
    choix: ['L’unité centrale', 'La box internet', 'Le chargeur', 'Le disque dur externe'],
    bonne: 0,
    explication: 'C’est l’unité centrale (ou « tour ») : elle contient le processeur, la mémoire et le disque. C’est le cerveau de l’ordinateur.'
  },
  {
    id: 'mat-eteindre-bouton',
    type: 'vraifaux',
    theme: 'materiel',
    niveau: 2,
    question: 'Pour éteindre l’ordinateur, le mieux est de débrancher la prise.',
    reponse: false,
    explication: 'Non : il faut passer par Démarrer puis « Arrêter ». Débrancher d’un coup peut abîmer les fichiers en cours.'
  },
  {
    id: 'mat-wifi',
    type: 'choix',
    theme: 'materiel',
    niveau: 2,
    visuel: { icone: 'wifi' },
    question: 'Que montre ce symbole ?',
    choix: ['La connexion sans fil à Internet (Wi-Fi)', 'Le volume du son', 'La batterie', 'La luminosité'],
    bonne: 0,
    explication: 'C’est le symbole du Wi-Fi : il montre que l’ordinateur est connecté à Internet sans fil.'
  },
  {
    id: 'mat-bluetooth',
    type: 'choix',
    theme: 'materiel',
    niveau: 3,
    visuel: { icone: 'bluetooth' },
    question: 'Ce symbole sert à…',
    choix: ['Connecter sans fil un casque ou une souris', 'Imprimer', 'Envoyer un e-mail', 'Recharger la batterie'],
    bonne: 0,
    explication: 'C’est le Bluetooth : il permet de relier sans fil des appareils proches, comme un casque, une enceinte ou une souris.'
  },
  {
    id: 'mat-memoire-usb-retirer',
    type: 'vraifaux',
    theme: 'materiel',
    niveau: 2,
    question: 'On peut retirer une clé USB à tout moment, même pendant qu’on copie un fichier dessus.',
    reponse: false,
    explication: 'Non : il faut d’abord l’« éjecter » pour être sûr que la copie est terminée, sinon le fichier peut être abîmé.'
  },

  // ---------- Windows et les fichiers ----------
  {
    id: 'win-demarrer',
    type: 'situation',
    theme: 'windows',
    niveau: 1,
    scene: 'bureau',
    question: 'Ouvre le menu Démarrer.',
    etapes: [{ cibles: ['demarrer'], ouvre: 'demarrer', aide: 'C’est le bouton avec les quatre carrés bleus, en bas de l’écran.' }],
    explication: 'Le bouton Démarrer (les quatre carrés) ouvre la liste des applications et permet d’éteindre l’ordinateur.'
  },
  {
    id: 'win-eteindre',
    type: 'situation',
    theme: 'windows',
    niveau: 2,
    scene: 'bureau',
    question: 'Éteins correctement l’ordinateur.',
    etapes: [
      { cibles: ['demarrer'], ouvre: 'demarrer', aide: 'Commence par le bouton Démarrer, en bas.' },
      { cibles: ['alimentation'], ouvre: 'alimentation', aide: 'Cherche le bouton rond « Marche/Arrêt », en bas à droite du menu.' },
      { cibles: ['arreter'], aide: 'Choisis « Arrêter ».' }
    ],
    explication: 'Démarrer → bouton Marche/Arrêt → Arrêter. L’ordinateur ferme proprement tous les programmes avant de s’éteindre.'
  },
  {
    id: 'win-ejecter-usb',
    type: 'situation',
    theme: 'windows',
    niveau: 2,
    scene: 'bureau',
    question: 'Tu as fini de copier tes fichiers : éjecte la clé USB avant de la retirer.',
    etapes: [
      { cibles: ['usb'], ouvre: 'usb', aide: 'Cherche le petit symbole de clé USB, en bas à droite près de l’heure.' },
      { cibles: ['ejecter'], aide: 'Clique sur « Éjecter Clé USB ».' }
    ],
    explication: 'On clique sur le symbole de la clé, en bas à droite, puis sur « Éjecter ». Quand Windows le dit, on peut la retirer sans risque.'
  },
  {
    id: 'win-explorateur',
    type: 'situation',
    theme: 'windows',
    niveau: 1,
    scene: 'bureau',
    question: 'Ouvre l’Explorateur de fichiers pour voir tes documents.',
    etapes: [{ cibles: ['explorateur', 'icone-documents'], aide: 'C’est l’icône du dossier jaune dans la barre des tâches.' }],
    explication: 'L’Explorateur de fichiers (le dossier jaune) permet de voir, ranger et retrouver tous ses fichiers.'
  },
  {
    id: 'win-parametres',
    type: 'situation',
    theme: 'windows',
    niveau: 3,
    scene: 'bureau',
    question: 'Ouvre les Paramètres de l’ordinateur.',
    etapes: [
      { cibles: ['demarrer'], ouvre: 'demarrer', aide: 'Les Paramètres se trouvent dans le menu Démarrer.' },
      { cibles: ['parametres'], aide: 'C’est la roue dentée.' }
    ],
    explication: 'Démarrer → Paramètres (la roue dentée). On y règle le Wi-Fi, le son, l’écran…'
  },
  {
    id: 'win-nouveau-dossier',
    type: 'situation',
    theme: 'windows',
    niveau: 2,
    scene: 'explorateur',
    question: 'Crée un nouveau dossier pour ranger tes fichiers de l’école.',
    etapes: [
      { cibles: ['nouveau'], ouvre: 'nouveau', aide: 'Clique sur « Nouveau », en haut à gauche.' },
      { cibles: ['nouveau-dossier'], aide: 'Choisis « Dossier ».' }
    ],
    explication: 'Nouveau → Dossier. On peut ensuite lui donner un nom, par exemple « Exposés ».'
  },
  {
    id: 'win-supprimer',
    type: 'situation',
    theme: 'windows',
    niveau: 2,
    scene: 'explorateur',
    question: 'Supprime le fichier « brouillon.txt ».',
    etapes: [
      {
        cibles: ['fichier-brouillon', 'fichier-brouillon@droit'],
        ouvre: 'selection-brouillon',
        ouvrePar: { 'fichier-brouillon@droit': 'contexte-brouillon' },
        aide: 'Clique d’abord sur le fichier « brouillon.txt » (clic gauche pour le sélectionner, ou clic droit pour ouvrir son menu).'
      },
      { cibles: ['supprimer', 'ctx-supprimer'], aide: 'Clique ensuite sur la corbeille en haut, ou sur « Supprimer » dans le menu du clic droit.' }
    ],
    explication: 'On sélectionne le fichier puis on clique sur la corbeille, ou on fait un clic droit sur le fichier et on choisit « Supprimer » (ou on appuie sur la touche Suppr). Il part dans la Corbeille.'
  },
  {
    id: 'win-renommer',
    type: 'situation',
    theme: 'windows',
    niveau: 3,
    scene: 'explorateur',
    question: 'Change le nom du fichier « Exposé volcans.docx ».',
    etapes: [
      { cibles: ['fichier-expose'], ouvre: 'selection-expose', aide: 'Sélectionne d’abord le fichier « Exposé volcans.docx ».' },
      { cibles: ['renommer'], aide: 'Clique sur le crayon « Renommer ».' }
    ],
    explication: 'On sélectionne le fichier puis « Renommer » (le crayon). La touche F2 fait la même chose.'
  },
  {
    id: 'win-ouvrir-usb',
    type: 'situation',
    theme: 'windows',
    niveau: 2,
    scene: 'explorateur',
    question: 'Ouvre ta clé USB pour voir ce qu’il y a dessus.',
    etapes: [{ cibles: ['cle-usb'], aide: 'Regarde dans la colonne de gauche.' }],
    explication: 'La clé USB apparaît dans la colonne de gauche de l’Explorateur, souvent avec une lettre comme (E:).'
  },
  {
    id: 'win-telechargements',
    type: 'situation',
    theme: 'windows',
    niveau: 3,
    scene: 'explorateur',
    question: 'Tu viens de télécharger une image sur Internet. Où vas-tu la chercher ?',
    etapes: [{ cibles: ['telechargements'], aide: 'Les fichiers téléchargés vont dans un dossier spécial, à gauche.' }],
    explication: 'Les fichiers récupérés sur Internet arrivent par défaut dans le dossier « Téléchargements ».'
  },
  {
    id: 'win-corbeille',
    type: 'vraifaux',
    theme: 'windows',
    niveau: 2,
    visuel: { icone: 'corbeille' },
    question: 'Un fichier supprimé va d’abord dans la Corbeille : on peut encore le récupérer.',
    reponse: true,
    explication: 'Oui. Tant que la Corbeille n’est pas vidée, on peut restaurer un fichier supprimé par erreur.'
  },
  {
    id: 'win-dossier-icone',
    type: 'choix',
    theme: 'windows',
    niveau: 1,
    visuel: { icone: 'dossier' },
    question: 'Que représente cette icône ?',
    choix: ['Un dossier', 'Une image', 'Une application', 'Un e-mail'],
    bonne: 0,
    explication: 'C’est un dossier : comme une pochette, il sert à ranger plusieurs fichiers ensemble.'
  },
  {
    id: 'win-extension',
    type: 'choix',
    theme: 'windows',
    niveau: 4,
    question: 'Dans « vacances.jpg », que signifie « .jpg » ?',
    choix: ['C’est le type du fichier : une image', 'C’est le nom de l’auteur', 'C’est la date', 'C’est la taille du fichier'],
    bonne: 0,
    explication: 'Ce qui suit le point est l’extension : elle indique le type de fichier. .jpg et .png sont des images, .docx un texte, .pdf un document PDF.'
  },
  {
    id: 'win-bureau-visuel',
    type: 'choix',
    theme: 'windows',
    niveau: 2,
    visuel: { scene: 'bureau', surligne: 'horloge' },
    question: 'Que trouve-t-on dans la zone entourée ?',
    choix: ['L’heure et la date', 'La météo', 'Les fichiers récents', 'Le niveau de son'],
    bonne: 0,
    explication: 'En bas à droite de la barre des tâches, Windows affiche l’heure et la date.'
  },

  // ---------- Internet et sécurité ----------
  {
    id: 'net-mot-de-passe-partage',
    type: 'vraifaux',
    theme: 'internet',
    niveau: 1,
    visuel: { icone: 'mot-de-passe' },
    question: 'Je peux donner mon mot de passe à mon meilleur ami.',
    reponse: false,
    explication: 'Non : un mot de passe est secret. On ne le donne à personne, sauf éventuellement à ses parents.'
  },
  {
    id: 'net-pub-gagne',
    type: 'choix',
    theme: 'internet',
    niveau: 1,
    visuel: { scene: 'navigateur', surligne: 'pub' },
    question: 'Ce message dit que tu as gagné un téléphone. Que fais-tu ?',
    choix: ['Je ne clique pas : c’est sûrement un piège', 'Je clique vite avant que ça disparaisse', 'Je donne mon adresse pour le recevoir', 'Je l’envoie à mes amis'],
    bonne: 0,
    explication: 'On ne gagne pas de cadeau sans avoir joué ! Ces publicités cherchent à récupérer des informations ou à installer des virus. On ne clique pas.'
  },
  {
    id: 'net-cadenas',
    type: 'choix',
    theme: 'internet',
    niveau: 3,
    visuel: { scene: 'navigateur', surligne: 'cadenas' },
    question: 'Que signifie le petit cadenas à côté de l’adresse ?',
    choix: ['La connexion au site est chiffrée (protégée)', 'Le site est payant', 'La page est bloquée', 'Il faut un mot de passe'],
    bonne: 0,
    explication: 'Le cadenas (et « https ») veut dire que les échanges avec le site sont chiffrés. Attention : cela ne prouve pas que le site soit honnête.'
  },
  {
    id: 'net-adresse',
    type: 'choix',
    theme: 'internet',
    niveau: 2,
    visuel: { scene: 'navigateur', surligne: 'adresse' },
    question: 'Comment s’appelle la zone entourée ?',
    choix: ['La barre d’adresse', 'La barre des tâches', 'Le menu Démarrer', 'La barre de défilement'],
    bonne: 0,
    explication: 'C’est la barre d’adresse : on y lit l’adresse du site, et on peut y taper une adresse ou une recherche.'
  },
  {
    id: 'net-nouvel-onglet',
    type: 'situation',
    theme: 'internet',
    niveau: 1,
    scene: 'navigateur',
    question: 'Ouvre un nouvel onglet.',
    etapes: [{ cibles: ['nouvel-onglet'], aide: 'C’est le petit « + » à côté de l’onglet, en haut.' }],
    explication: 'Le « + » à côté des onglets ouvre une nouvelle page sans fermer celle qu’on regarde. Raccourci : Ctrl + T.'
  },
  {
    id: 'net-retour',
    type: 'situation',
    theme: 'internet',
    niveau: 1,
    scene: 'navigateur',
    question: 'Reviens à la page précédente.',
    etapes: [{ cibles: ['retour'], aide: 'C’est la flèche vers la gauche, en haut à gauche.' }],
    explication: 'La flèche vers la gauche ramène à la page d’avant.'
  },
  {
    id: 'net-favori',
    type: 'situation',
    theme: 'internet',
    niveau: 2,
    scene: 'navigateur',
    question: 'Ce site t’aide pour ton exposé : ajoute-le à tes favoris.',
    etapes: [{ cibles: ['favori'], aide: 'Cherche l’étoile, au bout de la barre d’adresse.' }],
    explication: 'L’étoile ajoute la page aux favoris pour la retrouver facilement plus tard.'
  },
  {
    id: 'net-actualiser',
    type: 'situation',
    theme: 'internet',
    niveau: 2,
    scene: 'navigateur',
    question: 'La page ne s’affiche pas bien : recharge-la.',
    etapes: [{ cibles: ['actualiser'], aide: 'C’est la flèche qui tourne en rond.' }],
    explication: 'La flèche en rond (ou la touche F5) recharge la page.'
  },
  {
    id: 'net-historique',
    type: 'situation',
    theme: 'internet',
    niveau: 3,
    scene: 'navigateur',
    question: 'Retrouve la liste des sites que tu as visités hier.',
    etapes: [
      { cibles: ['menu-nav'], ouvre: 'menu', aide: 'Ouvre le menu avec les trois petits points, en haut à droite.' },
      { cibles: ['historique'], aide: 'Choisis « Historique ».' }
    ],
    explication: 'Menu (les trois points) → Historique. On y retrouve tous les sites visités. Raccourci : Ctrl + H.'
  },
  {
    id: 'net-arobase',
    type: 'choix',
    theme: 'internet',
    niveau: 2,
    visuel: { icone: 'arobase' },
    question: 'Ce signe se trouve dans…',
    choix: ['Les adresses e-mail', 'Les numéros de téléphone', 'Les mots de passe uniquement', 'Les adresses de sites web'],
    bonne: 0,
    explication: 'L’arobase @ sépare le nom de la personne et le fournisseur dans une adresse e-mail, comme lea@exemple.fr. Sur un clavier AZERTY : Alt Gr + à.'
  },
  {
    id: 'net-inconnu',
    type: 'vraifaux',
    theme: 'internet',
    niveau: 1,
    question: 'Si quelqu’un que je ne connais pas me demande mon adresse sur Internet, je la donne.',
    reponse: false,
    explication: 'Non ! On ne donne jamais ses informations personnelles (adresse, école, téléphone) à un inconnu. On en parle à un adulte.'
  },
  {
    id: 'net-mot-de-passe-solide',
    type: 'choix',
    theme: 'internet',
    niveau: 3,
    question: 'Quel mot de passe est le plus solide ?',
    choix: ['Lune!Vélo7Chocolat', '123456', 'lea2014', 'motdepasse'],
    bonne: 0,
    explication: 'Un bon mot de passe est long, mélange plusieurs mots, des majuscules, des chiffres et des symboles, et ne contient pas son prénom ni sa date de naissance.'
  },
  {
    id: 'net-hameconnage',
    type: 'choix',
    theme: 'internet',
    niveau: 4,
    visuel: { icone: 'hameconnage' },
    question: 'Un e-mail te demande ton mot de passe « pour vérifier ton compte ». C’est…',
    choix: ['Une arnaque (hameçonnage)', 'Normal, il faut répondre', 'Un message de ton école', 'Une publicité sans danger'],
    bonne: 0,
    explication: 'Aucun site sérieux ne demande ton mot de passe par e-mail : c’est de l’hameçonnage (« phishing »). On supprime le message et on prévient un adulte.'
  },
  {
    id: 'net-tout-vrai',
    type: 'vraifaux',
    theme: 'internet',
    niveau: 2,
    question: 'Tout ce qui est écrit sur Internet est vrai.',
    reponse: false,
    explication: 'Non : n’importe qui peut publier sur Internet. Il faut vérifier les informations sur plusieurs sites sérieux.'
  },
  {
    id: 'net-telechargements-nav',
    type: 'situation',
    theme: 'internet',
    niveau: 3,
    scene: 'navigateur',
    question: 'Affiche les fichiers que tu viens de télécharger.',
    etapes: [
      { cibles: ['menu-nav'], ouvre: 'menu', aide: 'Ouvre le menu avec les trois petits points, en haut à droite.' },
      { cibles: ['telechargements-menu'], aide: 'Choisis « Téléchargements ».' }
    ],
    explication: 'Menu (les trois points) → Téléchargements montre les fichiers récupérés. La flèche vers le bas, à côté, fait la même chose. Raccourci : Ctrl + J.'
  },

  // ---------- Traitement de texte ----------
  {
    id: 'txt-icone',
    type: 'choix',
    theme: 'bureautique',
    niveau: 1,
    visuel: { icone: 'texte' },
    question: 'Ce genre d’icône ouvre un logiciel pour…',
    choix: ['Écrire des textes (traitement de texte, comme Word)', 'Faire des calculs', 'Regarder des vidéos', 'Aller sur Internet'],
    bonne: 0,
    explication: 'Le « W » bleu fait penser à Word, un traitement de texte : on l’utilise pour écrire des lettres, des exposés…'
  },
  {
    id: 'txt-tableur',
    type: 'choix',
    theme: 'bureautique',
    niveau: 3,
    visuel: { icone: 'tableur' },
    question: 'Un logiciel avec cette icône verte (comme Excel) sert surtout à…',
    choix: ['Faire des tableaux et des calculs', 'Écrire une lettre', 'Retoucher des photos', 'Jouer'],
    bonne: 0,
    explication: 'C’est un tableur : il range des données dans des cases et peut faire des calculs automatiquement.'
  },
  {
    id: 'txt-presentation',
    type: 'choix',
    theme: 'bureautique',
    niveau: 3,
    visuel: { icone: 'presentation' },
    question: 'Et cette icône orange (comme PowerPoint) ?',
    choix: ['Créer un diaporama pour un exposé', 'Envoyer des e-mails', 'Faire des calculs', 'Dessiner des plans'],
    bonne: 0,
    explication: 'C’est un logiciel de présentation : on crée des diapositives à projeter pendant un exposé.'
  },
  {
    id: 'txt-gras',
    type: 'situation',
    theme: 'bureautique',
    niveau: 1,
    scene: 'texte',
    question: 'Le titre « Les volcans » est sélectionné. Mets-le en gras.',
    etapes: [{ cibles: ['gras'], aide: 'C’est le bouton « G », comme Gras.' }],
    explication: 'Le bouton G met le texte sélectionné en gras. Raccourci : Ctrl + G.'
  },
  {
    id: 'txt-centrer',
    type: 'situation',
    theme: 'bureautique',
    niveau: 2,
    scene: 'texte',
    question: 'Le titre est sélectionné. Centre-le au milieu de la page.',
    etapes: [{ cibles: ['centrer'], aide: 'Cherche le bouton avec des lignes centrées.' }],
    explication: 'Le bouton « Centrer » place le texte au milieu de la ligne. Pratique pour les titres.'
  },
  {
    id: 'txt-annuler',
    type: 'situation',
    theme: 'bureautique',
    niveau: 2,
    scene: 'texte',
    question: 'Oups, tu as effacé une phrase par erreur ! Annule la dernière action.',
    etapes: [{ cibles: ['annuler'], aide: 'C’est la flèche qui revient en arrière, tout en haut à gauche.' }],
    explication: 'La flèche « Annuler » revient en arrière. Raccourci très utile : Ctrl + Z.'
  },
  {
    id: 'txt-enregistrer',
    type: 'situation',
    theme: 'bureautique',
    niveau: 1,
    scene: 'texte',
    question: 'Enregistre ton travail pour ne pas le perdre.',
    etapes: [{ cibles: ['enregistrer'], aide: 'C’est la petite disquette, tout en haut à gauche.' }],
    explication: 'La disquette enregistre le document. Raccourci : Ctrl + S. Pense à enregistrer souvent !'
  },
  {
    id: 'txt-nouveau',
    type: 'situation',
    theme: 'bureautique',
    niveau: 2,
    scene: 'texte',
    question: 'Ouvre un nouveau document vierge.',
    etapes: [
      { cibles: ['fichier'], ouvre: 'fichier', aide: 'Tout commence par l’onglet « Fichier ».' },
      { cibles: ['nouveau'], ouvre: 'nouveau', aide: 'Choisis « Nouveau ».' },
      { cibles: ['document-vierge'], aide: 'Clique sur « Document vierge ».' }
    ],
    explication: 'Fichier → Nouveau → Document vierge. Raccourci : Ctrl + N.'
  },
  {
    id: 'txt-pdf',
    type: 'situation',
    theme: 'bureautique',
    niveau: 3,
    scene: 'texte',
    question: 'Ton professeur veut ton exposé en PDF. Crée le fichier PDF.',
    etapes: [
      { cibles: ['fichier'], ouvre: 'fichier', aide: 'Commence par l’onglet « Fichier ».' },
      { cibles: ['exporter', 'enregistrer-sous'], ouvre: 'pdf', aide: 'Choisis « Exporter » (ou « Enregistrer sous »).' },
      { cibles: ['creer-pdf'], aide: 'Clique sur « Créer un PDF ».' }
    ],
    explication: 'Fichier → Exporter → Créer un PDF (ou Enregistrer sous, en choisissant le type PDF). Le PDF garde la mise en page sur tous les ordinateurs.'
  },
  {
    id: 'txt-imprimer',
    type: 'situation',
    theme: 'bureautique',
    niveau: 2,
    scene: 'texte',
    question: 'Imprime ton exposé.',
    etapes: [
      { cibles: ['fichier'], ouvre: 'fichier', aide: 'Commence par l’onglet « Fichier ».' },
      { cibles: ['imprimer'], ouvre: 'imprimer', aide: 'Choisis « Imprimer ».' },
      { cibles: ['bouton-imprimer'], aide: 'Clique sur le gros bouton « Imprimer ».' }
    ],
    explication: 'Fichier → Imprimer → Imprimer. Raccourci : Ctrl + P.'
  },
  {
    id: 'txt-image',
    type: 'situation',
    theme: 'bureautique',
    niveau: 3,
    scene: 'texte',
    question: 'Ajoute une image de volcan dans ton exposé.',
    etapes: [
      { cibles: ['insertion'], ouvre: 'insertion', aide: 'Les images s’ajoutent depuis l’onglet « Insertion ».' },
      { cibles: ['image'], aide: 'Clique sur « Images ».' }
    ],
    explication: 'Onglet Insertion → Images. Cet onglet permet aussi d’ajouter des tableaux et des formes.'
  },
  {
    id: 'txt-bouton-italique',
    type: 'choix',
    theme: 'bureautique',
    niveau: 2,
    visuel: { scene: 'texte', surligne: 'italique' },
    question: 'À quoi sert le bouton entouré ?',
    choix: ['Écrire en italique (penché)', 'Écrire en gras', 'Souligner', 'Changer la couleur'],
    bonne: 0,
    explication: 'Le I signifie Italique : le texte est penché. Raccourci : Ctrl + I.'
  },
  {
    id: 'txt-bouton-coller',
    type: 'choix',
    theme: 'bureautique',
    niveau: 3,
    visuel: { scene: 'texte', surligne: 'coller' },
    question: 'Que fait le bouton entouré ?',
    choix: ['Il colle ce qu’on a copié avant', 'Il supprime le texte', 'Il ouvre un fichier', 'Il enregistre'],
    bonne: 0,
    explication: '« Coller » ajoute à l’endroit du curseur ce qu’on a copié ou coupé. Raccourci : Ctrl + V.'
  },
  {
    id: 'txt-pdf-modif',
    type: 'vraifaux',
    theme: 'bureautique',
    niveau: 4,
    visuel: { icone: 'pdf' },
    question: 'Un fichier PDF s’affiche de la même façon sur tous les ordinateurs.',
    reponse: true,
    explication: 'Oui : c’est tout l’intérêt du PDF. La mise en page ne bouge pas, et le fichier est difficile à modifier par erreur.'
  },
  {
    id: 'txt-enregistrer-souvent',
    type: 'vraifaux',
    theme: 'bureautique',
    niveau: 1,
    visuel: { icone: 'disquette' },
    question: 'Ce symbole sert à enregistrer son travail.',
    reponse: true,
    explication: 'Oui, la disquette est le symbole de l’enregistrement, même si plus personne n’utilise de vraies disquettes !'
  },

  // ---------- Raccourcis clavier ----------
  {
    id: 'clv-ctrl-c',
    type: 'choix',
    theme: 'clavier',
    niveau: 2,
    visuel: { icone: 'ctrl-c' },
    question: 'Que fait ce raccourci ?',
    choix: ['Copier', 'Coller', 'Couper', 'Fermer'],
    bonne: 0,
    explication: 'Ctrl + C copie ce qui est sélectionné. Ensuite, Ctrl + V le colle ailleurs.'
  },
  {
    id: 'clv-ctrl-v',
    type: 'choix',
    theme: 'clavier',
    niveau: 2,
    visuel: { icone: 'ctrl-v' },
    question: 'Que fait ce raccourci ?',
    choix: ['Coller', 'Copier', 'Vérifier l’orthographe', 'Valider'],
    bonne: 0,
    explication: 'Ctrl + V colle ce qu’on a copié (Ctrl + C) ou coupé (Ctrl + X).'
  },
  {
    id: 'clv-ctrl-z',
    type: 'choix',
    theme: 'clavier',
    niveau: 2,
    visuel: { icone: 'ctrl-z' },
    question: 'Que fait ce raccourci ?',
    choix: ['Annuler la dernière action', 'Zoomer', 'Fermer la fenêtre', 'Enregistrer'],
    bonne: 0,
    explication: 'Ctrl + Z annule la dernière action. On peut l’utiliser plusieurs fois de suite.'
  },
  {
    id: 'clv-ctrl-s',
    type: 'choix',
    theme: 'clavier',
    niveau: 3,
    visuel: { icone: 'ctrl-s' },
    question: 'Que fait ce raccourci ?',
    choix: ['Enregistrer', 'Supprimer', 'Sélectionner tout', 'Souligner'],
    bonne: 0,
    explication: 'Ctrl + S enregistre le document (S comme « Save », enregistrer en anglais).'
  },
  {
    id: 'clv-ctrl-p',
    type: 'choix',
    theme: 'clavier',
    niveau: 3,
    visuel: { icone: 'ctrl-p' },
    question: 'Que fait ce raccourci ?',
    choix: ['Imprimer', 'Coller', 'Ouvrir une page', 'Mettre en pause'],
    bonne: 0,
    explication: 'Ctrl + P ouvre la fenêtre d’impression (P comme « Print », imprimer en anglais).'
  },
  {
    id: 'clv-alt-tab',
    type: 'choix',
    theme: 'clavier',
    niveau: 4,
    visuel: { icone: 'alt-tab' },
    question: 'Que fait ce raccourci ?',
    choix: ['Passer d’une fenêtre ouverte à une autre', 'Fermer l’ordinateur', 'Faire une tabulation', 'Ouvrir le menu Démarrer'],
    bonne: 0,
    explication: 'Alt + Tab permet de passer rapidement d’une application ouverte à une autre.'
  },
  {
    id: 'clv-windows-d',
    type: 'choix',
    theme: 'clavier',
    niveau: 4,
    visuel: { icone: 'windows-d' },
    question: 'La touche Windows + D permet de…',
    choix: ['Afficher le bureau', 'Supprimer un fichier', 'Dessiner', 'Télécharger'],
    bonne: 0,
    explication: 'Windows + D réduit toutes les fenêtres pour afficher le bureau (D comme « Desktop »).'
  },
  {
    id: 'clv-maj',
    type: 'choix',
    theme: 'clavier',
    niveau: 1,
    visuel: { icone: 'maj' },
    question: 'Si je garde cette touche enfoncée en tapant « a », j’obtiens…',
    choix: ['A (majuscule)', 'à', 'é', 'Rien'],
    bonne: 0,
    explication: 'La touche Maj (ou Shift) donne la majuscule. Sur un clavier AZERTY, elle donne aussi les chiffres de la rangée du haut.'
  },
  {
    id: 'clv-verr-maj',
    type: 'vraifaux',
    theme: 'clavier',
    niveau: 2,
    visuel: { icone: 'verr-maj' },
    question: 'Cette touche fait écrire toutes les lettres en majuscules jusqu’à ce qu’on appuie à nouveau dessus.',
    reponse: true,
    explication: 'Oui, c’est le verrouillage des majuscules. Si tout s’écrit en MAJUSCULES sans le vouloir, c’est souvent elle qui est activée !'
  },
  {
    id: 'clv-retour',
    type: 'choix',
    theme: 'clavier',
    niveau: 1,
    visuel: { icone: 'retour' },
    question: 'À quoi sert cette touche ?',
    choix: ['Effacer la lettre avant le curseur', 'Revenir à la page d’accueil', 'Aller à la ligne', 'Faire un espace'],
    bonne: 0,
    explication: 'C’est la touche Retour arrière : elle efface la lettre juste avant le curseur.'
  },
  {
    id: 'clv-entree',
    type: 'choix',
    theme: 'clavier',
    niveau: 1,
    visuel: { icone: 'entree' },
    question: 'Dans un texte, la touche Entrée sert à…',
    choix: ['Aller à la ligne', 'Effacer une lettre', 'Écrire en majuscule', 'Fermer le document'],
    bonne: 0,
    explication: 'Entrée crée une nouvelle ligne (un nouveau paragraphe). Dans une case à remplir, elle sert souvent à valider.'
  },
  {
    id: 'clv-echap',
    type: 'choix',
    theme: 'clavier',
    niveau: 3,
    visuel: { icone: 'echap' },
    question: 'La touche Échap sert souvent à…',
    choix: ['Annuler ou fermer un menu, quitter le plein écran', 'Éteindre l’ordinateur', 'Écrire un accent', 'Copier'],
    bonne: 0,
    explication: 'Échap (« Échappement ») permet de sortir : fermer un menu, annuler une fenêtre, quitter le plein écran d’une vidéo.'
  },
  {
    id: 'clv-accent-circonflexe',
    type: 'choix',
    theme: 'clavier',
    niveau: 3,
    question: 'Sur un clavier AZERTY, comment écrit-on « ê » ?',
    choix: ['On tape ^ puis e', 'On tape e puis ^', 'Maj + e', 'Ctrl + e'],
    bonne: 0,
    explication: 'On appuie d’abord sur la touche ^ (rien ne s’affiche), puis sur e : le « ê » apparaît.'
  }
]
