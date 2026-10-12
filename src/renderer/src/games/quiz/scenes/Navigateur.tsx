import { Ico, PATHS, Zone } from './commun'

// Navigateur internet. Menu : menu (les trois points).
export function Navigateur({ menu }: { menu: string | null }) {
  return (
    <div className="sc-fenetre sc-nav">
      <div className="sc-nav-onglets">
        <div className="sc-nav-onglet actif">
          <span className="sc-globe sc-globe-petit" /> Exposés pour l’école
          <Zone id="fermer-onglet" className="sc-nav-x" titre="Fermer l’onglet">
            <Ico d={PATHS.croix} size={12} />
          </Zone>
        </div>
        <Zone id="nouvel-onglet" className="sc-nav-plus" titre="Nouvel onglet">
          <Ico d={PATHS.plus} size={16} />
        </Zone>
      </div>
      <div className="sc-nav-barre">
        <Zone id="retour" className="sc-nav-bouton" titre="Page précédente">
          <Ico d={PATHS.retour} size={18} />
        </Zone>
        <Zone id="avancer" className="sc-nav-bouton" titre="Page suivante">
          <Ico d={PATHS.avancer} size={18} />
        </Zone>
        <Zone id="actualiser" className="sc-nav-bouton" titre="Actualiser">
          <Ico d={PATHS.actualiser} size={18} />
        </Zone>
        <Zone id="accueil-nav" className="sc-nav-bouton" titre="Accueil">
          <Ico d={PATHS.maison} size={18} />
        </Zone>
        <div className="sc-nav-adresse">
          <Zone id="cadenas" className="sc-nav-cadenas" titre="Connexion sécurisée">
            <Ico d={PATHS.cadenas} size={14} />
          </Zone>
          <Zone id="adresse" className="sc-nav-url" titre="Barre d’adresse">
            https://www.exposes-ecole.fr/volcans
          </Zone>
          <Zone id="favori" className="sc-nav-etoile" titre="Ajouter aux favoris">
            <Ico d={PATHS.etoile} size={16} />
          </Zone>
        </div>
        <Zone id="telechargements-nav" className="sc-nav-bouton" titre="Téléchargements">
          <Ico d={PATHS.telechargement} size={18} />
        </Zone>
        <Zone id="menu-nav" className="sc-nav-bouton" titre="Menu">
          <Ico d={PATHS.points} size={18} />
        </Zone>
        {menu === 'menu' && (
          <div className="sc-popup sc-popup-nav">
            {[
              ['nouvelle-fenetre', 'Nouvelle fenêtre'],
              ['historique', 'Historique'],
              ['telechargements-menu', 'Téléchargements'],
              ['favoris-menu', 'Favoris'],
              ['imprimer-page', 'Imprimer…'],
              ['parametres-nav', 'Paramètres']
            ].map(([id, nom]) => (
              <Zone key={id} id={id} className="sc-popup-item" titre={nom}>
                {nom}
              </Zone>
            ))}
          </div>
        )}
      </div>
      <div className="sc-nav-page">
        <div className="sc-nav-site">
          <h2>Exposés pour l’école</h2>
          <p className="sc-nav-chapo">Les volcans : comment se forment-ils ?</p>
          <div className="sc-nav-texte">
            <span />
            <span />
            <span />
            <span className="court" />
          </div>
          <Zone id="lien" className="sc-nav-lien" titre="Lien">
            Lire la suite : les volcans d’Auvergne →
          </Zone>
        </div>
        <Zone id="pub" className="sc-nav-pub" titre="Publicité">
          <strong>🎁 FÉLICITATIONS !</strong>
          <span>Tu as gagné un téléphone !</span>
          <span className="sc-nav-pub-bouton">CLIQUE ICI</span>
        </Zone>
      </div>
    </div>
  )
}
