# CV Manager MVP — Notes de cadrage

## Perimetre

Outil interne centralise de gestion des CV pour l'equipe commerciale. Permet de creer, modifier, dupliquer et exporter les CV des collaborateurs dans des formats standardises pour les appels d'offres.

### Inclus dans le MVP

- CRUD complet des CV
- Editeur split-panel (formulaire + apercu temps reel)
- Modele de donnees Europass complet
- Export PDF en deux formats (Europass + Classique)
- Duplication de CV
- Authentification simple (email/mot de passe)
- Gestion des utilisateurs par admin

### Hors perimetre MVP (Phase 2)

- Recherche et filtres avances (par competences, poste, experience)
- Edition assistee par IA (suggestions d'adaptation par appel d'offres)
- Import de CV existants (Word, PDF)
- Historique des modifications

## Decisions

- **Layout editeur** : Split-panel inspire de l'editeur Europass officiel de l'UE. Formulaire avec sections depliables a gauche, apercu formate en temps reel a droite.
- **Modele de donnees** : Calque sur le format Europass complet pour couvrir tous les cas (infos personnelles, profil, formation, experience, langues CECRL, competences avec niveaux, soft skills, competences numeriques, references, permis de conduire).
- **Deux formats d'export** : Europass (fidele au modele officiel UE) et Classique (format professionnel epure, adaptable a la charte entreprise).
- **Duplication** : Copie independante (pas de lien avec le CV source). Permet de creer des variantes par appel d'offres.
- **Authentification** : Login simple email/mot de passe. Pas de SSO ni OAuth pour le MVP. Deux roles : admin et utilisateur.
- **Niveaux de langue** : Grille CECRL standard (A1-C2) avec decomposition en comprehension orale, comprehension ecrite, expression orale interaction, expression orale production, expression ecrite.
- **Niveaux de competences** : Echelle 1-10 avec indicateurs visuels (barres ou points).
- **Stack technique** : A definir lors de l'implementation.

## Contexte

- **Visuals** : Capture d'ecran de l'editeur Europass officiel (voir `visuals/`)
- **References** : Editeur Europass officiel de l'UE (europa.eu)
- **Alignement produit** : Correspond a la Phase 1 de la roadmap produit (voir `agent-os/product/roadmap.md`)

## Contraintes

- Les CV doivent pouvoir etre exportes rapidement (pas de temps d'attente long pour la generation PDF)
- L'apercu temps reel doit etre fidele au rendu final du PDF
- L'interface doit etre utilisable sans formation prealable
- Les donnees des CV sont sensibles (donnees personnelles) : securisation adequat requise
