// Vérifie, sur une PR, qu'une nouvelle version est accompagnée de sa
// description dans changements.md. Sans elle, scripts/changelog.mjs retombe
// sur les sujets des commits (souvent le simple titre de la carte).
//
// Usage : node scripts/verifier-changements.mjs <référence de la branche cible>
// (par exemple origin/main). Sort en erreur si package.json change de version
// sans que la section « ## Prochaine version » (ou « ## <version> ») de
// changements.md ait changé, ou si « ## Prochaine version » reprend des puces
// de la version déjà publiée (section complétée au lieu d'être remplacée).

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { lireSections, pucesReprises } from './sections.mjs'

const base = process.argv[2]
if (!base) {
  console.error('Usage : node scripts/verifier-changements.mjs <référence de la branche cible>')
  process.exit(2)
}

function fichierA(ref, chemin) {
  try {
    return execFileSync('git', ['show', `${ref}:${chemin}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

const version = JSON.parse(readFileSync('package.json', 'utf8')).version
const versionBase = JSON.parse(fichierA(base, 'package.json') || '{}').version

if (version === versionBase) {
  console.log(`Version inchangée (${version}) : rien à vérifier.`)
  process.exit(0)
}

const avant = lireSections(fichierA(base, 'changements.md'))
const apres = lireSections(readFileSync('changements.md', 'utf8'))
const cles = ['prochaine version', version.toLowerCase()]
const decrite = cles.some((cle) => (apres.get(cle) ?? '') !== '' && apres.get(cle) !== avant.get(cle))

// La section « Prochaine version » doit être remplacée, pas complétée : sur la
// branche cible, elle décrit la version déjà publiée.
const reprises = (apres.get(version.toLowerCase()) ?? '') !== '' ? [] : pucesReprises(avant.get('prochaine version'), apres.get('prochaine version'))
if (decrite && reprises.length > 0) {
  console.log(
    `::error file=changements.md::La section « ## Prochaine version » reprend ${reprises.length} puce(s) de la version déjà publiée : la remplacer entièrement par ce que cette livraison change.`
  )
  console.error(['Puces déjà publiées avec la version précédente :', ...reprises.map((p) => `- ${p}`)].join('\n'))
  process.exit(1)
}

if (decrite) {
  console.log(`Version ${version} : description trouvée dans changements.md.`)
  process.exit(0)
}

console.log(
  `::error file=changements.md::La version passe à ${version}, mais la section « ## Prochaine version » de changements.md n'a pas été réécrite.`
)
console.error(
  [
    `La version passe de ${versionBase ?? '?'} à ${version} sans description des changements.`,
    "Remplacer entièrement le contenu de la section « ## Prochaine version » de changements.md",
    "par la description de ce que cette livraison change, rédigée pour l'ergothérapeute :",
    'français clair, sans jargon ni nom de fichier, une puce par changement visible, en commençant',
    'par le nom du jeu ou de l\'écran (ex. « Petit bac : les catégories peuvent être modifiées dans',
    "l'espace ergo. »). Ne pas reprendre le titre de la carte. Voir CLAUDE.md, « Description des",
    'changements ». CHANGELOG.md, lui, est fabriqué automatiquement : ne pas le modifier.'
  ].join('\n')
)
process.exit(1)
