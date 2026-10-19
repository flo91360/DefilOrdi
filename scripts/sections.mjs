// Découpe changements.md en sections « ## titre » -> texte (commentaires HTML
// retirés). Les titres sont mis en minuscules.
export function lireSections(texte) {
  const sections = new Map()
  let titre
  let corps = []
  const fermer = () => {
    if (titre !== undefined) sections.set(titre, corps.join('\n').trim())
  }
  for (const ligne of texte.replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '').split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(ligne)
    if (m) {
      fermer()
      titre = m[1].toLowerCase()
      corps = []
    } else if (titre !== undefined) {
      corps.push(ligne)
    }
  }
  fermer()
  return sections
}

// Puces d'une section déjà présentes dans une autre (comparées sans les
// espaces superflus). Sert à repérer une « Prochaine version » complétée au
// lieu d'être réécrite : ses anciennes puces ont déjà été publiées.
export function pucesReprises(avant, apres) {
  const puces = (texte) =>
    (texte ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[-*]\s+/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, '').replace(/\s+/g, ' '))
  const deja = new Set(puces(avant))
  // La puce type d'une livraison sans changement visible peut revenir d'une version à l'autre.
  return puces(apres).filter((p) => deja.has(p) && !/^améliorations internes/i.test(p))
}
