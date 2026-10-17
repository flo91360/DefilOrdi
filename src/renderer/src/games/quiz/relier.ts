// Thème « Points reliés » : l'enfant relie des actions faites sur l'ordinateur
// au logiciel adapté. Ce thème est à part des thèmes de questions (pas de
// questions de l'ergothérapeute, pas d'éditeur) : le référentiel ci-dessous
// est la seule source. La même liste est fournie pour relecture dans
// docs/points-relies-actions.md : la garder à jour avec ce fichier.

import { melanger } from '../commun'

export const THEME_RELIER = 'relier' as const
export const NOM_THEME_RELIER = 'Points reliés'
export const NB_ACTIONS_RELIER = 10

export type LogicielId = 'powerpoint' | 'word' | 'xmind' | 'pdf' | 'exchange' | 'souris' | 'scan' | 'cle' | 'capture'

// Tous les logiciels sont affichés à chaque partie, dans cet ordre.
export const LOGICIELS: { id: LogicielId; nom: string; precision?: string }[] = [
  { id: 'powerpoint', nom: 'PowerPoint' },
  { id: 'word', nom: 'Word' },
  { id: 'xmind', nom: 'XMind', precision: 'cartes mentales' },
  { id: 'pdf', nom: 'PDF X-Change Editor' },
  { id: 'exchange', nom: 'Exchange', precision: 'messagerie' },
  { id: 'souris', nom: 'Souris' },
  { id: 'scan', nom: 'Scan' },
  { id: 'cle', nom: 'Clé USB' },
  { id: 'capture', nom: 'Outil capture' }
]

export interface ActionRelier {
  id: string
  texte: string
  logiciel: LogicielId
}

export const ACTIONS_RELIER: ActionRelier[] = [
  { id: 'ppt-expose', texte: 'Faire un exposé', logiciel: 'powerpoint' },
  { id: 'ppt-diapo', texte: 'Créer un diaporama', logiciel: 'powerpoint' },
  { id: 'ppt-presenter', texte: 'Présenter mon travail avec des diapositives', logiciel: 'powerpoint' },
  { id: 'word-cours', texte: 'Écrire un cours', logiciel: 'word' },
  { id: 'word-lettre', texte: 'Écrire une lettre', logiciel: 'word' },
  { id: 'word-tableau', texte: 'Créer un tableau', logiciel: 'word' },
  { id: 'word-forme', texte: 'Mettre en forme un texte', logiciel: 'word' },
  { id: 'xmind-carte', texte: 'Faire une carte mentale', logiciel: 'xmind' },
  { id: 'xmind-idees', texte: 'Organiser mes idées avec des branches', logiciel: 'xmind' },
  { id: 'xmind-plan', texte: 'Faire le plan d’une leçon en schéma', logiciel: 'xmind' },
  { id: 'pdf-annoter', texte: 'Écrire sur une fiche PDF', logiciel: 'pdf' },
  { id: 'pdf-surligner', texte: 'Surligner un document PDF', logiciel: 'pdf' },
  { id: 'pdf-formulaire', texte: 'Remplir un formulaire PDF', logiciel: 'pdf' },
  { id: 'mail-envoyer', texte: 'Envoyer un mail à mon enseignant', logiciel: 'exchange' },
  { id: 'mail-lire', texte: 'Lire mes messages', logiciel: 'exchange' },
  { id: 'mail-piece', texte: 'Envoyer un mail avec une pièce jointe', logiciel: 'exchange' },
  { id: 'souris-pointeur', texte: 'Déplacer le pointeur sur l’écran', logiciel: 'souris' },
  { id: 'souris-droit', texte: 'Faire un clic droit', logiciel: 'souris' },
  { id: 'souris-double', texte: 'Double-cliquer pour ouvrir un dossier', logiciel: 'souris' },
  { id: 'scan-feuille', texte: 'Numériser une feuille de papier', logiciel: 'scan' },
  { id: 'scan-fichier', texte: 'Transformer une feuille en fichier sur l’ordinateur', logiciel: 'scan' },
  { id: 'cle-emporter', texte: 'Emporter mon travail chez moi', logiciel: 'cle' },
  { id: 'cle-copier', texte: 'Copier des fichiers pour les donner à un camarade', logiciel: 'cle' },
  { id: 'cap-ecran', texte: 'Prendre une photo de l’écran', logiciel: 'capture' },
  { id: 'cap-zone', texte: 'Copier un morceau de l’écran', logiciel: 'capture' },
  { id: 'cap-web', texte: 'Garder l’image d’une page web', logiciel: 'capture' }
]

// Une partie « Points reliés » : 10 actions tirées au hasard dans le référentiel.
export interface QuestionRelier {
  type: 'relier'
  id: string
  question: string
  explication: string
  actions: ActionRelier[]
}

export function tirerRelier(random: () => number = Math.random): QuestionRelier {
  return {
    type: 'relier',
    id: 'relier',
    question: 'Relie chaque action au bon logiciel',
    explication: 'Chaque action se fait avec un logiciel précis : regarde la correction pour les retenir.',
    actions: melanger(ACTIONS_RELIER, random).slice(0, NB_ACTIONS_RELIER)
  }
}

// Liaisons faites par l'enfant : identifiant d'action -> logiciel choisi.
export type Liaisons = Record<string, LogicielId>

export function toutesReliees(q: QuestionRelier, liaisons: Liaisons): boolean {
  return q.actions.every((a) => liaisons[a.id] !== undefined)
}

// Contrôle fait uniquement une fois les 10 liaisons posées : réussi seulement
// si les 10 sont justes.
export function verifierRelier(q: QuestionRelier, liaisons: Liaisons): { juste: boolean; fausses: ActionRelier[] } {
  if (!toutesReliees(q, liaisons)) return { juste: false, fausses: [] }
  const fausses = q.actions.filter((a) => liaisons[a.id] !== a.logiciel)
  return { juste: fausses.length === 0, fausses }
}

export function nomLogiciel(id: LogicielId): string {
  return LOGICIELS.find((l) => l.id === id)?.nom ?? id
}
