import { Ico, PATHS, Zone } from './commun'

// Explorateur de fichiers. Menus : nouveau, selection-brouillon,
// selection-expose, contexte-brouillon, contexte-expose (clic droit sur le fichier).
const FICHIERS = [
  { id: 'dossier-ecole', nom: 'École', type: 'Dossier de fichiers', date: '02/10/2026', dossier: true },
  { id: 'fichier-expose', nom: 'Exposé volcans.docx', type: 'Document texte', date: '10/10/2026' },
  { id: 'fichier-photo', nom: 'Vacances.jpg', type: 'Image', date: '28/08/2026' },
  { id: 'fichier-brouillon', nom: 'brouillon.txt', type: 'Texte', date: '11/10/2026' }
]

export function Explorateur({ menu }: { menu: string | null }) {
  const selection =
    menu === 'selection-brouillon' || menu === 'contexte-brouillon'
      ? 'fichier-brouillon'
      : menu === 'selection-expose' || menu === 'contexte-expose'
        ? 'fichier-expose'
        : null
  return (
    <div className="sc-fenetre sc-explo">
      <div className="sc-titre sc-titre-clair">
        <Ico d={PATHS.dossier} size={16} stroke="#a77b00" fill="#ffd45a" />
        <span className="sc-titre-texte">Documents - Explorateur de fichiers</span>
        <Zone id="fermer-fenetre" className="sc-titre-fermer" titre="Fermer">
          <Ico d={PATHS.croix} size={16} />
        </Zone>
      </div>
      <div className="sc-explo-barre">
        <Zone id="nouveau" className="sc-explo-nouveau" titre="Nouveau">
          <Ico d={PATHS.plus} size={16} /> Nouveau ▾
        </Zone>
        <span className="sc-separateur" />
        <Zone id="couper" className="sc-explo-bouton" titre="Couper">
          <Ico d={PATHS.ciseaux} size={17} />
        </Zone>
        <Zone id="copier" className="sc-explo-bouton" titre="Copier">
          <Ico d={PATHS.copier} size={17} />
        </Zone>
        <Zone id="coller" className="sc-explo-bouton" titre="Coller">
          <Ico d={PATHS.coller} size={17} />
        </Zone>
        <Zone id="renommer" className="sc-explo-bouton" titre="Renommer">
          <Ico d={PATHS.crayon} size={17} />
        </Zone>
        <Zone id="supprimer" className="sc-explo-bouton" titre="Supprimer">
          <Ico d={PATHS.corbeille} size={17} />
        </Zone>
        {menu === 'nouveau' && (
          <div className="sc-popup sc-popup-nouveau">
            <Zone id="nouveau-dossier" className="sc-popup-item" titre="Dossier">
              <Ico d={PATHS.dossier} size={16} stroke="#a77b00" fill="#ffd45a" /> Dossier
            </Zone>
            <Zone id="nouveau-texte" className="sc-popup-item" titre="Document texte">
              📄 Document texte
            </Zone>
            <Zone id="nouveau-raccourci" className="sc-popup-item" titre="Raccourci">
              ↗ Raccourci
            </Zone>
          </div>
        )}
      </div>
      <div className="sc-explo-corps">
        <div className="sc-explo-cote">
          {[
            ['accueil-explo', 'Accueil'],
            ['bureau-explo', 'Bureau'],
            ['documents', 'Documents'],
            ['telechargements', 'Téléchargements'],
            ['images', 'Images'],
            ['cle-usb', 'Clé USB (E:)']
          ].map(([id, nom]) => (
            <Zone key={id} id={id} className={id === 'documents' ? 'sc-explo-lien actif' : 'sc-explo-lien'} titre={nom}>
              {id === 'cle-usb' ? <Ico d={PATHS.usb} size={15} /> : <Ico d={PATHS.dossier} size={15} stroke="#a77b00" fill="#ffd45a" />}
              {nom}
            </Zone>
          ))}
        </div>
        <div className="sc-explo-liste">
          <div className="sc-explo-entete">
            <span>Nom</span>
            <span>Modifié le</span>
            <span>Type</span>
          </div>
          {FICHIERS.map((f) => (
            <Zone key={f.id} id={f.id} className={selection === f.id ? 'sc-explo-ligne selection' : 'sc-explo-ligne'} titre={f.nom}>
              <span>
                {f.dossier ? <Ico d={PATHS.dossier} size={16} stroke="#a77b00" fill="#ffd45a" /> : '📄'} {f.nom}
              </span>
              <span>{f.date}</span>
              <span>{f.type}</span>
            </Zone>
          ))}
        </div>
      </div>
      {(menu === 'contexte-brouillon' || menu === 'contexte-expose') && (
        <div className="sc-popup sc-popup-contexte">
          <Zone id="ctx-ouvrir" className="sc-popup-item" titre="Ouvrir">
            Ouvrir
          </Zone>
          <Zone id="ctx-copier" className="sc-popup-item" titre="Copier">
            Copier
          </Zone>
          <Zone id="ctx-renommer" className="sc-popup-item" titre="Renommer">
            Renommer
          </Zone>
          <Zone id="ctx-supprimer" className="sc-popup-item" titre="Supprimer">
            <Ico d={PATHS.corbeille} size={16} /> Supprimer
          </Zone>
        </div>
      )}
    </div>
  )
}
