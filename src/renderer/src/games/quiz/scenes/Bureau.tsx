import { Ico, PATHS, Zone } from './commun'

// Bureau Windows (style Windows 11). Menus : demarrer, alimentation, usb.
export function Bureau({ menu }: { menu: string | null }) {
  const startOuvert = menu === 'demarrer' || menu === 'alimentation'
  return (
    <div className="sc-bureau">
      <div className="sc-bureau-icones">
        <Zone id="corbeille" className="sc-icone-bureau" titre="Corbeille">
          <span className="sc-icone-image" style={{ background: '#dbe7f5' }}>
            <Ico d={PATHS.corbeille} size={30} stroke="#4a6b8f" />
          </span>
          Corbeille
        </Zone>
        <Zone id="icone-documents" className="sc-icone-bureau" titre="Documents">
          <span className="sc-icone-image" style={{ background: '#ffe39a' }}>
            <Ico d={PATHS.dossier} size={30} stroke="#a77b00" fill="#ffd45a" />
          </span>
          Documents
        </Zone>
      </div>

      {startOuvert && (
        <div className="sc-start">
          <div className="sc-start-recherche">
            <Ico d={PATHS.loupe} size={16} /> Rechercher des applications
          </div>
          <p className="sc-start-titre">Épinglé</p>
          <div className="sc-start-grille">
            {[
              ['app-navigateur', 'Navigateur', '#2f80ed'],
              ['app-texte', 'Traitement de texte', '#2b579a'],
              ['app-explorateur', 'Explorateur', '#e8a800'],
              ['parametres', 'Paramètres', '#6b7280'],
              ['app-calculatrice', 'Calculatrice', '#374151'],
              ['app-photos', 'Photos', '#0ea5e9']
            ].map(([id, nom, c]) => (
              <Zone key={id} id={id} className="sc-start-app" titre={nom}>
                <span className="sc-start-app-icone" style={{ background: c }}>
                  {id === 'parametres' ? <Ico d={PATHS.engrenage} size={20} stroke="#fff" /> : nom[0]}
                </span>
                {nom}
              </Zone>
            ))}
          </div>
          <div className="sc-start-bas">
            <span className="sc-start-user">
              <span className="sc-avatar-rond">L</span> Léa
            </span>
            <Zone id="alimentation" className="sc-bouton-rond" titre="Marche/Arrêt">
              <Ico d={PATHS.alimentation} size={18} />
            </Zone>
            {menu === 'alimentation' && (
              <div className="sc-popup sc-popup-alim">
                <Zone id="veille" className="sc-popup-item" titre="Mettre en veille">
                  Mettre en veille
                </Zone>
                <Zone id="arreter" className="sc-popup-item" titre="Arrêter">
                  Arrêter
                </Zone>
                <Zone id="redemarrer" className="sc-popup-item" titre="Redémarrer">
                  Redémarrer
                </Zone>
              </div>
            )}
          </div>
        </div>
      )}

      {menu === 'usb' && (
        <div className="sc-popup sc-popup-usb">
          <p className="sc-popup-titre">Clé USB (E:)</p>
          <Zone id="ejecter" className="sc-popup-item" titre="Éjecter Clé USB">
            <Ico d={PATHS.usb} size={16} /> Éjecter Clé USB
          </Zone>
          <Zone id="ouvrir-usb" className="sc-popup-item" titre="Ouvrir la clé USB">
            Ouvrir dans l’Explorateur
          </Zone>
        </div>
      )}

      <div className="sc-taskbar">
        <div className="sc-taskbar-centre">
          <Zone id="demarrer" className="sc-tb-bouton" titre="Démarrer">
            <span className="sc-logo-windows">
              <i />
              <i />
              <i />
              <i />
            </span>
          </Zone>
          <Zone id="recherche" className="sc-tb-bouton" titre="Rechercher">
            <Ico d={PATHS.loupe} size={20} />
          </Zone>
          <Zone id="explorateur" className="sc-tb-bouton" titre="Explorateur de fichiers">
            <Ico d={PATHS.dossier} size={22} stroke="#a77b00" fill="#ffd45a" />
          </Zone>
          <Zone id="navigateur" className="sc-tb-bouton" titre="Navigateur internet">
            <span className="sc-globe" />
          </Zone>
          <Zone id="texte" className="sc-tb-bouton" titre="Traitement de texte">
            <span className="sc-app-lettre" style={{ background: '#2b579a' }}>
              W
            </span>
          </Zone>
        </div>
        <div className="sc-tray">
          <Zone id="usb" className="sc-tb-petit" titre="Clé USB">
            <Ico d={PATHS.usb} size={16} />
          </Zone>
          <Zone id="wifi" className="sc-tb-petit" titre="Wi-Fi">
            <Ico d={PATHS.wifi} size={16} />
          </Zone>
          <Zone id="son" className="sc-tb-petit" titre="Volume">
            <Ico d={PATHS.son} size={16} />
          </Zone>
          <Zone id="horloge" className="sc-tb-horloge" titre="Date et heure">
            <span>14:30</span>
            <span>12/10/2026</span>
          </Zone>
        </div>
      </div>
    </div>
  )
}
