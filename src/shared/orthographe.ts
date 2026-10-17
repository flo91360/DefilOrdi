// Correcteur orthographique hors ligne des phrases personnelles.
//
// Aucun service en ligne : un lexique de mots courants est intégré, complété
// par tous les mots des listes de phrases de l'ergothérapeute (fournies ou
// ajoutées par elle). Un mot absent est signalé comme « inconnu » : la phrase
// est alors refusée et l'ergothérapeute est prévenue pour la vérifier.
// Testé dans tests/regles.test.ts.

const LEXIQUE_BASE = `
a à au aux avec ce ces cet cette ci comme dans de des du elle elles en et eux il ils je la le les leur leurs lui ma mais me même mes moi mon ne nos notre nous on ou où par pas pour qu que qui sa se ses si son sur ta te tes toi ton tu un une vos votre vous y
être suis es est sommes êtes sont étais était étions étaient sera seront serait été étant
avoir ai as avons avez ont avais avait avaient aura auront aurait eu ayant
aller vais vas va allons allez vont irai iras ira irons irez iront allé allée allés allées
faire fais fait faisons faites font faisait ferai fera feront faite faites
dire dit dis disons dites disent voir vois voit voyons voyez voient vu vue
pouvoir peux peut pouvons pouvez peuvent veux veut voulons voulez veulent vouloir devoir dois doit devons devez doivent
savoir sais sait savons savez savent venir viens vient venons venez viennent venu prendre prends prend prenons prenez prennent pris
mettre mets met mettons mettez mettent mis finir finis finit finissons grandir choisir réussir
un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente cent mille premier première dernier dernière
oui non très trop peu plus moins aussi bien mal vite lentement doucement beaucoup assez toujours jamais souvent parfois déjà encore ici là hier aujourd'hui demain maintenant puis alors ensuite après avant pendant depuis jusque jusqu bientôt tard tôt tout toute tous toutes rien quelque quelques quelqu'un chaque autre autres plusieurs même quand comment pourquoi parce car donc or ni
sous entre vers chez devant derrière contre sans selon dès loin près autour dessus dessous dedans dehors
grand grande grands grandes petit petite petits petites gros grosse gras beau belle beaux belles bel joli jolie jolis jolies bon bonne bons bonnes mauvais mauvaise nouveau nouvelle nouveaux nouvelles vieux vieille jeune jeunes long longue longs longues court courte courts courtes haut haute bas basse large étroit lourd lourde léger légère fort forte faible dur dure doux douce chaud chaude froid froide frais fraîche sec sèche mouillé propre sale vide plein pleine ouvert ouverte fermé fermée libre seul seule heureux heureuse content contente triste gentil gentille drôle amusant amusante rapide lent lente facile difficile magnifique énorme minuscule rond ronde carré carrée
rouge bleu bleue bleus bleues vert verte verts vertes jaune jaunes noir noire noirs noires blanc blanche blancs blanches gris grise grises rose roses orange marron violet violette brun brune doré dorée argenté
chat chats chatte chien chiens chienne cheval chevaux vache vaches cochon mouton moutons chèvre lapin lapins souris oiseau oiseaux poule poules coq canard canards oie poisson poissons requin baleine dauphin tortue grenouille serpent lion lions tigre tigres éléphant éléphants girafe singe singes ours loup loups renard renards écureuil hibou papillon papillons abeille abeilles fourmi fourmis araignée escargot mouche moustique insecte animal animaux zèbre kangourou crocodile dinosaure dragon licorne
maison maisons appartement jardin jardins porte portes fenêtre fenêtres mur toit escalier chambre cuisine salon salle bain toilettes garage grenier cave lit lits table tables chaise chaises fauteuil canapé armoire placard étagère tapis lampe lumière miroir rideau coussin couverture oreiller télévision télé ordinateur clavier écran souris téléphone radio livre livres cahier cahiers crayon crayons stylo stylos gomme règle cartable trousse feuille feuilles papier ciseaux colle peinture pinceau dessin dessins image images photo photos jeu jeux jouet jouets ballon ballons poupée voiture voitures camion train trains avion avions bateau bateaux vélo moto bus autobus gare route routes rue rues ville villes village campagne forêt forêts montagne montagnes mer plage sable vague vagues rivière lac étang champ champs pré ferme arbre arbres fleur fleurs herbe feuille branche jardin colline île océan désert
école écoles classe classes élève élèves maître maîtresse professeur directeur cour récréation cantine bibliothèque leçon leçons devoir devoirs lecture écriture mathématiques histoire géographie sport musique chanson chansons chanteur danse spectacle cinéma théâtre cirque musée fête fêtes anniversaire cadeau cadeaux gâteau gâteaux bonbon bonbons
famille père mère papa maman parents frère frères sœur soeur sœurs soeurs fils fille filles enfant enfants bébé bébés grand-père grand-mère grands-parents papy mamie papi oncle tante cousin cousine cousins cousines ami amie amis amies copain copine copains voisin voisine voisins voisines garçon garçons homme hommes femme femmes monsieur madame personne personnes gens facteur docteur médecin boulanger boulangère pompier policier fermier cuisinier cuisinière chef roi reine prince princesse pirate pirates chevalier magicien sorcier fée géant
tête cheveux visage yeux œil oeil nez bouche dent dents oreille oreilles cou épaule bras main mains doigt doigts jambe jambes pied pieds genou dos ventre cœur coeur corps peau
pain baguette beurre fromage lait œuf oeuf oeufs œufs viande jambon poulet poisson riz pâtes pâte soupe salade légume légumes carotte carottes tomate tomates pomme pommes poire poires banane bananes orange oranges fraise fraises cerise cerises raisin citron fruit fruits gâteau chocolat sucre sel poivre miel confiture crêpe crêpes tarte tartes glace glaces bonbon eau jus thé café repas déjeuner dîner goûter petit-déjeuner assiette verre couteau fourchette cuillère bol tasse bouteille casserole
soleil lune étoile étoiles ciel nuage nuages pluie neige vent orage tonnerre éclair arc-en-ciel temps jour jours nuit nuits matin midi soir semaine semaines mois année années saison saisons printemps été automne hiver heure heures minute minutes seconde lundi mardi mercredi jeudi vendredi samedi dimanche janvier février mars avril mai juin juillet août septembre octobre novembre décembre vacances
vêtement vêtements pantalon robe jupe chemise pull manteau veste chapeau casquette bonnet écharpe gants chaussette chaussettes chaussure chaussures botte bottes basket baskets sac sacs lunettes montre parapluie
couleur couleurs forme formes mot mots phrase phrases lettre lettres nombre nombres chiffre histoire histoires conte contes aventure aventures secret secrets rêve rêves idée idées question réponse problème travail travaux métier vie monde terre planète fusée espace lune astronaute robot robots machine machines outil outils marteau clou
football foot basket tennis natation piscine course vélo ski patin jeu partie équipe but match champion coupe médaille
chante chantent chanter joue jouent jouer joué mange mangent manger mangé boit boivent boire bu court courent courir couru dort dorment dormir dormi lit lisent lire lu écrit écrivent écrire parle parlent parler parlé regarde regardent regarder regardé écoute écoutent écouter marche marchent marcher saute sautent sauter nage nagent nager rit rient rire ri pleure pleurent pleurer crie crient crier ouvre ouvrent ouvrir ouvert ferme ferment fermer cherche cherchent chercher trouve trouvent trouver trouvé donne donnent donner donné porte portent porter apporte apportent apporter aime aiment aimer aimé adore adorent adorer déteste préfère préfèrent habite habitent habiter travaille travaillent travailler passe passent passer arrive arrivent arriver arrivé entre entrent entrer entré sort sortent sortir sorti reste restent rester resté tombe tombent tomber tombé monte montent monter descend descendent descendre commence commencent commencer continue continuent continuer termine terminent terminer attend attendent attendre attendu achète achètent acheter vend vendent vendre apprend apprennent apprendre appris comprend comprennent comprendre compris pense pensent penser crois croit croire oublie oublient oublier oublié rêve rêvent rêver rêvé dessine dessinent dessiner dessiné peint peignent peindre construit construisent construire construire fabrique fabriquent fabriquer prépare préparent préparer cuisine cuisinent cuisiner mange lave lavent laver lavé coupe coupent couper tire tirent tirer pousse poussent pousser tourne tournent tourner brille brillent briller éclaire éclairent pleut neige souffle soufflent souffler vole volent voler volé flotte flottent flotter coule coulent couler grimpe grimpent grimper glisse glissent glisser rencontre rencontrent rencontrer visite visitent visiter voyage voyagent voyager raconte racontent raconter demande demandent demander répond répondent répondre répondu appelle appellent appeler aide aident aider partage partagent partager prête prêtent prêter offre offrent offrir offert ramasse ramassent ramasser range rangent ranger mets rentre rentrent rentrer rentré quitte quittent quitter protège protègent protéger observe observent observer découvre découvrent découvrir découvert gagne gagnent gagner gagné perd perdent perdre perdu réussit réussissent réussi
ai-je as-tu est-ce
oh ah hélas bravo merci bonjour bonsoir salut bonne nuit s'il plaît
sac vite voici voilà cela ça ceci celui celle ceux celles
n'a n'est ne n'ont j'ai j'aime l'école qu'il qu'elle d'un d'une l'ai m'a t'a s'est c'est
`

// Forme sans accent ni majuscule, pour comparer.
export function forme(mot: string): string {
  return mot
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
}

function decouperMots(texte: string): string[] {
  return texte.toLocaleLowerCase('fr').match(/[\p{L}]+(?:['’-][\p{L}]+)*/gu) ?? []
}

// Terminaisons acceptées après un mot connu (pluriel, féminin, verbes en -er).
const SUFFIXES = [
  's', 'x', 'e', 'es', 'ee', 'ees', 'ent', 'ons', 'ez', 'ais', 'ait', 'ions', 'iez', 'aient', 'ai', 'as', 'a', 'a', 'era', 'eras', 'erai', 'erons', 'erez', 'eront', 'erait', 'ant', 'er', 'ez', 'ee', 'es'
]

export class Dictionnaire {
  private readonly formes = new Set<string>() // sans accent ni majuscule
  private readonly exactes = new Set<string>() // minuscules, accents conservés

  constructor(motsSupplementaires: Iterable<string> = []) {
    this.ajouter(LEXIQUE_BASE)
    for (const m of motsSupplementaires) this.ajouter(m)
  }

  ajouter(texte: string): void {
    for (const m of decouperMots(texte)) {
      this.formes.add(forme(m))
      this.exactes.add(m.normalize('NFC'))
      // « l'école » : l'élision et le mot seul sont connus.
      for (const part of m.split(/['’-]/)) {
        if (!part) continue
        this.formes.add(forme(part))
        this.exactes.add(part.normalize('NFC'))
      }
    }
  }

  private connuSimple(m: string, accents: boolean): boolean {
    const f = accents ? m.toLocaleLowerCase('fr').normalize('NFC') : forme(m)
    const formes = accents ? this.exactes : this.formes
    if (formes.has(f)) return true
    // Radical connu + terminaison courante : « chats », « mangeons ».
    for (const suf of SUFFIXES) {
      if (f.length > suf.length + 2 && f.endsWith(suf)) {
        const radical = f.slice(0, -suf.length)
        if (formes.has(radical) || formes.has(radical + 'e') || formes.has(radical + 'er')) return true
        // « mange » -> « mangeons » ; « nager » -> « nageons »
        if (formes.has(radical + 'r') || formes.has(radical.replace(/e$/, '') + 'er')) return true
      }
    }
    // Verbes en -er connus par leur infinitif (« chante » -> « chanter »)
    for (const fin of ['e', 'es', 'ent', 'ons', 'ez', 'ais', 'ait', 'aient', 'ions', 'iez', 'era', 'eront', 'ee', 'ees', 'e', 'ant', 'ai']) {
      if (f.endsWith(fin) && formes.has(f.slice(0, -fin.length) + 'er')) return true
    }
    return false
  }

  // Mots de la phrase absents du dictionnaire (sans doublon, tels qu'écrits).
  // `accents` : les accents comptent (« ecole » est alors une faute) ; sans
  // accents autorisés (niveau 1), ils sont ignorés.
  inconnus(texte: string, accents = true): string[] {
    const out: string[] = []
    for (const m of decouperMots(texte)) {
      if (/^\p{L}$/u.test(m) && ['a', 'à', 'y', 'o', 'ô'].includes(m)) continue
      const parts = m.split(/['’-]/).filter(Boolean)
      const ok = this.connuSimple(m, accents) || parts.every((p) => p.length === 1 || this.connuSimple(p, accents))
      if (!ok && !out.includes(m)) out.push(m)
    }
    return out
  }
}

// Message pour l'enfant à propos des mots inconnus.
export function messageOrthographe(inconnus: string[]): string {
  const liste = inconnus.map((m) => `« ${m} »`).join(', ')
  return inconnus.length === 1
    ? `Je ne connais pas le mot ${liste} : est-il bien écrit ?`
    : `Je ne connais pas ces mots : ${liste}. Sont-ils bien écrits ?`
}
