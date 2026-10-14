// Fabrique le journal des modifications à partir de l'historique git et du
// fichier changements.md (descriptions rédigées pour l'ergothérapeute).
//
// Chaque tag v<version> marque une version publiée. Si la version de
// package.json n'a pas encore de tag, elle forme une section de plus (HEAD).
//
// Texte d'une version, par ordre de priorité :
//   1. la section « ## <version> » de changements.md (version actuelle du
//      fichier) : sert aux versions déjà publiées, réécrites après coup ;
//   2. la section « ## Prochaine version » de changements.md telle qu'elle
//      était au tag de la version (HEAD pour la version pas encore publiée),
//      si elle diffère de celle de la version précédente ;
//   3. à défaut, les sujets des commits entre les deux tags.
//
// Usage : node scripts/changelog.mjs [dossier]   (par défaut : dist)
// Écrit <dossier>/CHANGELOG.md (toutes les versions) et
// <dossier>/NOTES.md (la version de package.json seulement).

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dossier = process.argv[2] ?? 'dist'
const version = JSON.parse(readFileSync('package.json', 'utf8')).version
const tagCourant = `v${version}`
const FICHIER_CHANGEMENTS = 'changements.md'
const SECTION_PROCHAINE = 'prochaine version'
// Début du message du commit par lequel la CI met à jour CHANGELOG.md sur main
// (même texte dans .github/workflows/build-windows.yml).
const SUJET_COMMIT_JOURNAL = 'Journal des modifications : version '

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

function lignes(texte) {
  return texte.split('\n').map((l) => l.trim()).filter(Boolean)
}

// Découpe changements.md en sections « ## titre » -> texte (commentaires HTML
// retirés). Les titres sont mis en minuscules.
function lireSections(texte) {
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

// changements.md tel qu'il était à une référence git (undefined = fichier courant).
function changementsA(ref) {
  try {
    if (ref === undefined) {
      return existsSync(FICHIER_CHANGEMENTS) ? readFileSync(FICHIER_CHANGEMENTS, 'utf8') : ''
    }
    return git('show', `${ref}:${FICHIER_CHANGEMENTS}`)
  } catch {
    return ''
  }
}

function prochaineA(ref) {
  return lireSections(changementsA(ref)).get(SECTION_PROCHAINE) ?? ''
}

// Tags du plus ancien au plus récent, triés par numéro de version.
const tags = lignes(git('tag', '--list', 'v*', '--sort=v:refname'))

// Sections : nom de version, référence de fin (git log) et référence où lire
// changements.md (undefined = fichier courant, pour la version non publiée).
const sections = tags.map((tag) => ({
  version: tag.slice(1),
  fin: tag,
  source: tag,
  date: git('log', '-1', '--format=%cs', `${tag}^{commit}`)
}))
if (!tags.includes(tagCourant)) {
  sections.push({
    version,
    fin: 'HEAD',
    source: undefined,
    date: git('log', '-1', '--format=%cs', 'HEAD')
  })
}

function commits(debut, fin) {
  const plage = debut ? `${debut}..${fin}` : fin
  return lignes(git('log', '--no-merges', '--format=%s', plage))
    .filter((sujet) => !/^Merge /.test(sujet))
    // Commit de la CI qui recopie ce journal dans le dépôt : pas une modification.
    .filter((sujet) => !sujet.startsWith(SUJET_COMMIT_JOURNAL))
    .map((sujet) => `- ${sujet}`)
    .join('\n')
}

const actuelles = lireSections(changementsA(undefined))

const blocs = sections.map((section, i) => {
  const precedente = i > 0 ? sections[i - 1] : undefined
  let corps = actuelles.get(section.version.toLowerCase()) ?? ''
  if (!corps) {
    const prochaine = prochaineA(section.source)
    const avant = precedente ? prochaineA(precedente.source) : ''
    if (prochaine && prochaine !== avant) corps = prochaine
  }
  if (!corps) corps = commits(precedente?.fin, section.fin)
  if (!corps) corps = '- Aucune modification notable'
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
