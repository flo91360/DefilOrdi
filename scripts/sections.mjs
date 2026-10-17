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
