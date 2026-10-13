// Fabrique le journal des modifications à partir de l'historique git.
// Chaque tag v<version> marque une version publiée ; les commits entre deux
// tags forment la section de cette version. Si la version de package.json
// n'a pas encore de tag, les commits depuis le dernier tag forment sa section.
//
// Usage : node scripts/changelog.mjs [dossier]   (par défaut : dist)
// Écrit <dossier>/CHANGELOG.md (toutes les versions) et
// <dossier>/NOTES.md (la version de package.json seulement).

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dossier = process.argv[2] ?? 'dist'
const version = JSON.parse(readFileSync('package.json', 'utf8')).version
const tagCourant = `v${version}`

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function lignes(texte) {
  return texte.split('\n').map((l) => l.trim()).filter(Boolean)
}

// Tags du plus ancien au plus récent, triés par numéro de version.
const tags = lignes(git('tag', '--list', 'v*', '--sort=v:refname'))

// Sections : [nom de version, référence de fin, date].
const sections = tags.map((tag) => ({
  version: tag.slice(1),
  fin: tag,
  date: git('log', '-1', '--format=%cs', `${tag}^{commit}`)
}))
if (!tags.includes(tagCourant)) {
  sections.push({ version, fin: 'HEAD', date: git('log', '-1', '--format=%cs', 'HEAD') })
}

function modifications(debut, fin) {
  const plage = debut ? `${debut}..${fin}` : fin
  return lignes(git('log', '--no-merges', '--format=%s', plage))
    .filter((sujet) => !/^Merge /.test(sujet))
    .map((sujet) => `- ${sujet}`)
}

const blocs = sections.map((section, i) => {
  const precedent = i > 0 ? sections[i - 1].fin : undefined
  const liste = modifications(precedent, section.fin)
  const corps = liste.length > 0 ? liste.join('\n') : '- Aucune modification notable'
  return { version: section.version, texte: `## ${section.version} (${section.date})\n\n${corps}\n` }
})

const journal = ['# Journal des modifications de DefilOrdi', '']
  .concat(blocs.reverse().map((b) => b.texte))
  .join('\n')
const notes = blocs.find((b) => b.version === version)?.texte ?? ''

mkdirSync(dossier, { recursive: true })
writeFileSync(join(dossier, 'CHANGELOG.md'), journal)
writeFileSync(join(dossier, 'NOTES.md'), notes)
console.log(notes)
