// Création par clic droit sur un emplacement vide (zone « fond » des écrans
// Explorateur et Bureau) : menu contextuel avec « Nouveau », qui ouvre la
// liste des éléments à créer. Menus : contexte-fond, contexte-fond-nouveau.
export const MENU_FOND = 'contexte-fond'
export const MENU_FOND_NOUVEAU = 'contexte-fond-nouveau'

// Types proposés par « Nouveau » ; seul « Dossier » crée un dossier, les
// autres créent un fichier (une question qui demande de créer un fichier
// accepte NOUVEAUX_FICHIERS_FOND).
export const NOUVEAUX_TYPES = [
  { id: 'ctx-nouveau-dossier', nom: 'Dossier', icone: '📁', dossier: true },
  { id: 'ctx-nouveau-raccourci', nom: 'Raccourci', icone: '↗', dossier: false },
  { id: 'ctx-nouveau-image', nom: 'Image', icone: '🖼️', dossier: false },
  { id: 'ctx-nouveau-word', nom: 'Document Word', icone: 'W', dossier: false },
  { id: 'ctx-nouveau-pdf', nom: 'PDF', icone: 'PDF', dossier: false },
  { id: 'ctx-nouveau-ppt', nom: 'Document PPT', icone: 'P', dossier: false },
  { id: 'ctx-nouveau-zip', nom: 'Dossier compressé', icone: '🗜️', dossier: false }
]
export const NOUVEAU_DOSSIER_FOND = 'ctx-nouveau-dossier'
export const NOUVEAUX_FICHIERS_FOND = NOUVEAUX_TYPES.filter((t) => !t.dossier).map((t) => t.id)
