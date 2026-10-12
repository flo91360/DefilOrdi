import { Ico, PATHS, Zone } from './commun'

// Traitement de texte (style Word). Menus : fichier, nouveau, imprimer, pdf,
// insertion.
const BACKSTAGE = new Set(['fichier', 'nouveau', 'imprimer', 'pdf'])

export function TraitementTexte({ menu }: { menu: string | null }) {
  return (
    <div className="sc-fenetre sc-texte">
      <div className="sc-titre sc-titre-bleu">
        <Zone id="enregistrer" className="sc-titre-bouton" titre="Enregistrer">
          <Ico d={PATHS.disquette} size={16} />
        </Zone>
        <Zone id="annuler" className="sc-titre-bouton" titre="Annuler">
          <Ico d={PATHS.annuler} size={16} />
        </Zone>
        <Zone id="retablir" className="sc-titre-bouton" titre="Rétablir">
          <Ico d={PATHS.retablir} size={16} />
        </Zone>
        <span className="sc-titre-texte">Exposé volcans - Traitement de texte</span>
        <Zone id="fermer-fenetre" className="sc-titre-fermer" titre="Fermer">
          <Ico d={PATHS.croix} size={16} />
        </Zone>
      </div>

      {BACKSTAGE.has(menu ?? '') ? <Backstage menu={menu as string} /> : <Ruban menu={menu} />}
    </div>
  )
}

function Ruban({ menu }: { menu: string | null }) {
  const insertion = menu === 'insertion'
  return (
    <>
      <div className="sc-onglets">
        <Zone id="fichier" className="sc-onglet sc-onglet-fichier" titre="Fichier">
          Fichier
        </Zone>
        <Zone id="accueil" className={insertion ? 'sc-onglet' : 'sc-onglet actif'} titre="Accueil">
          Accueil
        </Zone>
        <Zone id="insertion" className={insertion ? 'sc-onglet actif' : 'sc-onglet'} titre="Insertion">
          Insertion
        </Zone>
        <Zone id="mise-en-page" className="sc-onglet" titre="Mise en page">
          Mise en page
        </Zone>
        <Zone id="revision" className="sc-onglet" titre="Révision">
          Révision
        </Zone>
      </div>
      <div className="sc-ruban">
        {insertion ? (
          <>
            <Zone id="image" className="sc-gros-bouton" titre="Images">
              <Ico d={PATHS.image} size={26} />
              Images
            </Zone>
            <Zone id="tableau" className="sc-gros-bouton" titre="Tableau">
              <Ico d={PATHS.tableau} size={26} />
              Tableau
            </Zone>
            <Zone id="forme" className="sc-gros-bouton" titre="Formes">
              <span className="sc-forme" />
              Formes
            </Zone>
            <Zone id="numero-page" className="sc-gros-bouton" titre="Numéro de page">
              <span className="sc-numero">#</span>
              Numéro de page
            </Zone>
          </>
        ) : (
          <>
            <div className="sc-groupe">
              <Zone id="coller" className="sc-gros-bouton" titre="Coller">
                <Ico d={PATHS.coller} size={26} />
                Coller
              </Zone>
              <div className="sc-pile">
                <Zone id="couper" className="sc-petit-bouton" titre="Couper">
                  <Ico d={PATHS.ciseaux} size={15} />
                </Zone>
                <Zone id="copier" className="sc-petit-bouton" titre="Copier">
                  <Ico d={PATHS.copier} size={15} />
                </Zone>
              </div>
            </div>
            <div className="sc-groupe sc-groupe-police">
              <div className="sc-ligne">
                <Zone id="police" className="sc-liste-deroulante" titre="Police">
                  Calibri ▾
                </Zone>
                <Zone id="taille" className="sc-liste-deroulante sc-taille" titre="Taille">
                  11 ▾
                </Zone>
              </div>
              <div className="sc-ligne">
                <Zone id="gras" className="sc-petit-bouton sc-gras" titre="Gras">
                  G
                </Zone>
                <Zone id="italique" className="sc-petit-bouton sc-italique" titre="Italique">
                  I
                </Zone>
                <Zone id="souligne" className="sc-petit-bouton sc-souligne" titre="Souligné">
                  S
                </Zone>
                <Zone id="couleur" className="sc-petit-bouton sc-couleur" titre="Couleur de police">
                  A
                </Zone>
              </div>
            </div>
            <div className="sc-groupe">
              <div className="sc-ligne">
                <Zone id="aligner-gauche" className="sc-petit-bouton" titre="Aligner à gauche">
                  <Ico d={PATHS.gauche} size={15} />
                </Zone>
                <Zone id="centrer" className="sc-petit-bouton" titre="Centrer">
                  <Ico d={PATHS.centre} size={15} />
                </Zone>
                <Zone id="aligner-droite" className="sc-petit-bouton" titre="Aligner à droite">
                  <Ico d={PATHS.droite} size={15} />
                </Zone>
                <Zone id="liste" className="sc-petit-bouton" titre="Liste à puces">
                  <Ico d={PATHS.liste} size={15} />
                </Zone>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="sc-page-fond">
        <div className="sc-page">
          <p className="sc-page-titre">
            <span className="sc-selection">Les volcans</span>
          </p>
          <p>Un volcan est une montagne qui crache de la lave, des cendres et des gaz.</p>
          <p>Il en existe des milliers sur la Terre, et certains dorment depuis très longtemps.</p>
        </div>
      </div>
    </>
  )
}

function Backstage({ menu }: { menu: string }) {
  const item = (id: string, nom: string, actif: boolean) => (
    <Zone id={id} className={actif ? 'sc-bs-item actif' : 'sc-bs-item'} titre={nom}>
      {nom}
    </Zone>
  )
  return (
    <div className="sc-backstage">
      <div className="sc-bs-gauche">
        <Zone id="retour-document" className="sc-bs-retour" titre="Retour au document">
          <Ico d={PATHS.retour} size={22} stroke="#fff" />
        </Zone>
        {item('nouveau', 'Nouveau', menu === 'nouveau')}
        {item('ouvrir', 'Ouvrir', false)}
        {item('enregistrer-sous', 'Enregistrer sous', false)}
        {item('imprimer', 'Imprimer', menu === 'imprimer')}
        {item('exporter', 'Exporter', menu === 'pdf')}
        {item('fermer', 'Fermer', false)}
      </div>
      <div className="sc-bs-droite">
        {menu === 'fichier' && (
          <>
            <h3>Bonjour</h3>
            <p>Documents récents</p>
            <div className="sc-bs-recents">
              <span>Exposé volcans.docx</span>
              <span>Lettre à mamie.docx</span>
              <span>Liste de courses.docx</span>
            </div>
          </>
        )}
        {menu === 'nouveau' && (
          <>
            <h3>Nouveau</h3>
            <div className="sc-bs-modeles">
              <Zone id="document-vierge" className="sc-modele" titre="Document vierge">
                <span className="sc-modele-page" />
                Document vierge
              </Zone>
              <Zone id="modele-lettre" className="sc-modele" titre="Lettre">
                <span className="sc-modele-page sc-modele-lignes" />
                Lettre
              </Zone>
              <Zone id="modele-cv" className="sc-modele" titre="CV">
                <span className="sc-modele-page sc-modele-cv" />
                CV
              </Zone>
            </div>
          </>
        )}
        {menu === 'imprimer' && (
          <>
            <h3>Imprimer</h3>
            <Zone id="bouton-imprimer" className="sc-bs-gros" titre="Imprimer">
              <Ico d={PATHS.imprimante} size={34} />
              Imprimer
            </Zone>
            <p>Copies : 1 · Imprimante : Imprimante du bureau</p>
          </>
        )}
        {menu === 'pdf' && (
          <>
            <h3>Exporter</h3>
            <p>Garde la mise en page et empêche les modifications faciles.</p>
            <Zone id="creer-pdf" className="sc-bs-gros" titre="Créer un document PDF">
              <span className="sc-pdf">PDF</span>
              Créer un PDF
            </Zone>
          </>
        )}
      </div>
    </div>
  )
}
