# CV Manager MVP — Specification technique

## 1. Modele de donnees

### 1.1 Utilisateur (`User`)

| Champ          | Type     | Requis | Description                          |
|----------------|----------|--------|--------------------------------------|
| id             | UUID     | oui    | Identifiant unique                   |
| email          | string   | oui    | Email (unique, sert de login)        |
| passwordHash   | string   | oui    | Mot de passe hashe (bcrypt)          |
| firstName      | string   | oui    | Prenom                               |
| lastName       | string   | oui    | Nom                                  |
| role           | enum     | oui    | `admin` ou `user`                    |
| createdAt      | datetime | oui    | Date de creation                     |
| updatedAt      | datetime | oui    | Date de derniere modification        |

### 1.2 CV (`Resume`)

| Champ          | Type     | Requis | Description                          |
|----------------|----------|--------|--------------------------------------|
| id             | UUID     | oui    | Identifiant unique                   |
| title          | string   | oui    | Titre du CV (ex: "CV Jean Dupont - Dev Java") |
| createdBy      | UUID     | oui    | Reference vers User                  |
| createdAt      | datetime | oui    | Date de creation                     |
| updatedAt      | datetime | oui    | Date de derniere modification        |

### 1.3 Informations personnelles (`PersonalInfo`)

Relation : un CV a une seule fiche d'informations personnelles.

| Champ           | Type     | Requis | Description                         |
|-----------------|----------|--------|-------------------------------------|
| photo           | string   | non    | URL ou base64 de la photo           |
| firstName       | string   | oui    | Prenom                              |
| lastName        | string   | oui    | Nom                                 |
| email           | string   | non    | Email de contact                    |
| jobTitle        | string   | non    | Titre du poste / intitule           |
| phone           | string   | non    | Telephone                           |
| address         | string   | non    | Adresse                             |
| postalCode      | string   | non    | Code postal                         |
| city            | string   | non    | Ville                               |
| country         | string   | non    | Pays                                |
| dateOfBirth     | date     | non    | Date de naissance                   |
| placeOfBirth    | string   | non    | Lieu de naissance                   |
| drivingLicense  | string[] | non    | Permis de conduire (A, B, C, etc.)  |
| gender          | enum     | non    | `male`, `female`, `other`           |
| nationality     | string   | non    | Nationalite                         |
| maritalStatus   | string   | non    | Etat civil                          |
| website         | string   | non    | Site internet                       |
| linkedin        | string   | non    | Profil LinkedIn                     |
| customFields    | object[] | non    | Champs personnalises (label + valeur)|

### 1.4 Profil (`Profile`)

| Champ       | Type   | Requis | Description                              |
|-------------|--------|--------|------------------------------------------|
| summary     | text   | non    | Resume professionnel / objectifs         |

### 1.5 Formation (`Education`)

Liste ordonnee. Chaque entree :

| Champ         | Type     | Requis | Description                            |
|---------------|----------|--------|----------------------------------------|
| id            | UUID     | oui    | Identifiant unique                     |
| degree        | string   | oui    | Diplome / qualification                |
| institution   | string   | oui    | Etablissement                          |
| city          | string   | non    | Ville                                  |
| country       | string   | non    | Pays                                   |
| startDate     | date     | non    | Date de debut                          |
| endDate       | date     | non    | Date de fin (null = en cours)          |
| current       | boolean  | non    | En cours actuellement                  |
| description   | text     | non    | Description / details                  |
| sortOrder     | integer  | oui    | Ordre d'affichage                      |

### 1.6 Experience professionnelle (`WorkExperience`)

Liste ordonnee. Chaque entree :

| Champ            | Type     | Requis | Description                         |
|------------------|----------|--------|-------------------------------------|
| id               | UUID     | oui    | Identifiant unique                  |
| jobTitle         | string   | oui    | Titre du poste                      |
| employer         | string   | oui    | Employeur                           |
| city             | string   | non    | Ville                               |
| country          | string   | non    | Pays                                |
| startDate        | date     | non    | Date de debut                       |
| endDate          | date     | non    | Date de fin (null = en cours)       |
| current          | boolean  | non    | Poste actuel                        |
| responsibilities | string[] | non    | Liste des responsabilites / realisations |
| sortOrder        | integer  | oui    | Ordre d'affichage                   |

### 1.7 Langues (`Language`)

Liste ordonnee. Chaque entree :

| Champ                  | Type   | Requis | Description                        |
|------------------------|--------|--------|------------------------------------|
| id                     | UUID   | oui    | Identifiant unique                 |
| name                   | string | oui    | Nom de la langue                   |
| listeningLevel         | enum   | non    | Comprehension orale (A1-C2)       |
| readingLevel           | enum   | non    | Comprehension ecrite (A1-C2)      |
| spokenInteraction      | enum   | non    | Expression orale interaction (A1-C2)|
| spokenProduction       | enum   | non    | Expression orale production (A1-C2)|
| writingLevel           | enum   | non    | Expression ecrite (A1-C2)         |
| isMotherTongue         | boolean| non    | Langue maternelle                  |
| sortOrder              | integer| oui    | Ordre d'affichage                  |

**Niveaux CECRL** : `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

### 1.8 Competences (`Skill`)

Liste groupee par categorie. Chaque entree :

| Champ      | Type    | Requis | Description                           |
|------------|---------|--------|---------------------------------------|
| id         | UUID    | oui    | Identifiant unique                    |
| category   | string  | oui    | Categorie (ex: "Langages", "Frameworks") |
| name       | string  | oui    | Nom de la competence                  |
| level      | integer | non    | Niveau (1-10)                         |
| sortOrder  | integer | oui    | Ordre d'affichage                     |

### 1.9 Soft skills (`SoftSkill`)

| Champ      | Type    | Requis | Description                           |
|------------|---------|--------|---------------------------------------|
| id         | UUID    | oui    | Identifiant unique                    |
| name       | string  | oui    | Nom du soft skill                     |
| level      | integer | non    | Niveau (1-10)                         |
| sortOrder  | integer | oui    | Ordre d'affichage                     |

### 1.10 Competences numeriques (`DigitalSkill`)

| Champ      | Type    | Requis | Description                           |
|------------|---------|--------|---------------------------------------|
| id         | UUID    | oui    | Identifiant unique                    |
| name       | string  | oui    | Nom de la competence numerique        |
| level      | integer | non    | Niveau (1-10)                         |
| sortOrder  | integer | oui    | Ordre d'affichage                     |

### 1.11 References (`Reference`)

| Champ      | Type   | Requis | Description                            |
|------------|--------|--------|----------------------------------------|
| id         | UUID   | oui    | Identifiant unique                     |
| name       | string | oui    | Nom du referent                        |
| jobTitle   | string | non    | Poste du referent                      |
| company    | string | non    | Entreprise du referent                 |
| email      | string | non    | Email de contact                       |
| phone      | string | non    | Telephone de contact                   |
| sortOrder  | integer| oui    | Ordre d'affichage                      |

---

## 2. Interface utilisateur

### 2.1 Page de connexion

- Formulaire centre : champs email + mot de passe + bouton "Se connecter"
- Lien "Mot de passe oublie ?" sous le formulaire
- Pas de creation de compte en libre-service (comptes crees par admin)
- Redirect vers la liste des CV apres connexion reussie
- Message d'erreur generique en cas d'echec ("Email ou mot de passe incorrect")

### 2.2 Reinitialisation de mot de passe

- Formulaire avec champ email
- Envoi d'un lien de reinitialisation par email (token a duree limitee)
- Page de saisie du nouveau mot de passe (2 champs : nouveau + confirmation)

### 2.3 Liste des CV

**Layout** : Page principale apres connexion.

**En-tete** :
- Titre "CV Manager"
- Bouton "Nouveau CV" (action principale)
- Menu utilisateur (nom, deconnexion)
- Si admin : lien vers "Administration"

**Liste/Tableau** :
- Colonnes : Nom complet, Titre du poste, Titre du CV, Derniere modification, Actions
- Tri par defaut : derniere modification (plus recent en premier)
- Actions par ligne :
  - **Editer** : ouvre l'editeur
  - **Dupliquer** : cree une copie (voir section 4)
  - **Exporter** : menu deroulant avec choix du format (Europass / Classique)
  - **Supprimer** : avec confirmation ("Etes-vous sur de vouloir supprimer ce CV ?")

**Etat vide** : Message d'accueil + bouton "Creer votre premier CV"

### 2.4 Editeur de CV (split-panel)

**Layout** : Deux panneaux cote a cote, redimensionnables.

#### Panneau gauche : Formulaire

Sections depliables (accordeon), dans cet ordre :

1. **Informations personnelles**
   - Upload photo (drag & drop ou clic)
   - Champs : prenom, nom, email, titre, telephone, adresse, code postal, ville, pays
   - Section depliable "Informations complementaires" : date de naissance, lieu de naissance, nationalite, sexe, etat civil, permis de conduire
   - Section depliable "Liens" : site internet, LinkedIn, champs personnalises

2. **Profil**
   - Zone de texte (resume professionnel)

3. **Experience professionnelle**
   - Liste d'entrees avec bouton "Ajouter une experience"
   - Chaque entree : titre, employeur, ville, pays, dates (debut/fin avec checkbox "En cours"), liste de responsabilites (ajout/suppression dynamique)
   - Drag & drop pour reordonner
   - Bouton supprimer par entree

4. **Formation**
   - Liste d'entrees avec bouton "Ajouter une formation"
   - Chaque entree : diplome, etablissement, ville, pays, dates, description
   - Drag & drop pour reordonner
   - Bouton supprimer par entree

5. **Langues**
   - Liste avec bouton "Ajouter une langue"
   - Chaque entree : nom de la langue, checkbox "Langue maternelle"
   - Si pas langue maternelle : grille CECRL (5 competences x niveaux A1-C2 en selects ou boutons)
   - Drag & drop pour reordonner

6. **Competences**
   - Groupees par categorie
   - Bouton "Ajouter une categorie" + "Ajouter une competence"
   - Chaque competence : nom + slider ou select de niveau (1-10)
   - Drag & drop pour reordonner (competences et categories)

7. **Soft skills**
   - Liste avec bouton "Ajouter"
   - Chaque entree : nom + niveau (1-10)

8. **Competences numeriques**
   - Liste avec bouton "Ajouter"
   - Chaque entree : nom + niveau (1-10)

9. **References**
   - Liste avec bouton "Ajouter une reference"
   - Chaque entree : nom, poste, entreprise, email, telephone

**Barre d'actions du formulaire** (en haut ou sticky) :
- Titre du CV (editable)
- Bouton "Sauvegarder" (sauvegarde manuelle)
- Indicateur de sauvegarde automatique
- Bouton "Retour a la liste"

#### Panneau droit : Apercu en temps reel

- Rendu du CV formate, mis a jour en temps reel a chaque modification du formulaire
- Selecteur de template en haut de l'apercu : "Europass" / "Classique"
- Zoom in/out sur l'apercu
- Bouton "Exporter PDF" directement depuis l'apercu
- L'apercu reflette fidelement le rendu final du PDF

### 2.5 Page d'administration (admin uniquement)

**Gestion des utilisateurs** :
- Liste des comptes : nom, email, role, date de creation
- Bouton "Creer un compte"
  - Formulaire : prenom, nom, email, role (admin/utilisateur), mot de passe temporaire
  - L'utilisateur devra changer son mot de passe a la premiere connexion
- Actions par utilisateur : modifier le role, reinitialiser le mot de passe, desactiver le compte

---

## 3. Export PDF

### 3.1 Format Europass

Rendu fidele au modele officiel de l'UE :

**Structure du document** :
- **En-tete** : Bande bleue Europass avec logo
- **Photo** : A gauche, format portrait
- **Informations personnelles** : Nom, titre, coordonnees a cote de la photo
- **Profil** : Section resume sous les infos personnelles
- **Experience professionnelle** : Timeline inversee (plus recent en premier), avec dates a gauche et details a droite
- **Formation** : Meme layout que l'experience
- **Competences linguistiques** : Tableau avec grille CECRL (niveaux representes par indicateurs visuels)
- **Competences numeriques** : Liste avec niveaux
- **Competences** : Groupees par categorie avec indicateurs de niveau (points ou barres)
- **Soft skills** : Liste avec indicateurs
- **Autres informations** : Permis de conduire, references

**Style visuel** :
- Couleur principale : bleu Europass (#004494)
- Police : sans-serif (Calibri ou equivalent)
- Indicateurs de niveau : ronds pleins/vides (comme l'original Europass)
- Mise en page A4, marges standard

### 3.2 Format Classique

Format professionnel epure, adaptable :

**Structure du document** :
- **En-tete** : Nom en grand, titre du poste, coordonnees
- **Photo** : Optionnelle, en haut a droite
- **Profil** : Resume sous l'en-tete
- **Experience professionnelle** : Liste chronologique inversee
- **Formation** : Liste chronologique inversee
- **Competences** : Colonnes ou liste a puces, avec niveaux en barres de progression
- **Langues** : Liste avec niveaux textuels
- **Informations complementaires** : References, permis

**Style visuel** :
- Couleurs personnalisables (couleur principale par defaut : noir/gris)
- Police personnalisable (defaut : sans-serif propre)
- Niveaux en barres de progression horizontales
- Mise en page A4, marges standard

### 3.3 Generation

- Generation cote serveur (HTML -> PDF via un moteur de rendu)
- Le rendu HTML de l'apercu sert de base pour la generation PDF
- Temps de generation cible : < 3 secondes

### 3.4 Nommage des fichiers

Format : `CV_{Prenom}_{Nom}_{Format}_{Date}.pdf`

Exemples :
- `CV_Jean_Dupont_Europass_2026-02-13.pdf`
- `CV_Jean_Dupont_Classique_2026-02-13.pdf`

---

## 4. Duplication de CV

### 4.1 Comportement

- Accessible depuis la liste des CV (action "Dupliquer") ou depuis l'editeur
- Cree une **copie independante** du CV (aucun lien avec le CV source)
- Toutes les donnees sont copiees (infos personnelles, experience, formation, competences, etc.)
- La photo est egalement dupliquee

### 4.2 Nommage

- Le CV duplique recoit le titre : `{titre original} (copie)`
- L'utilisateur peut renommer immediatement apres la duplication
- Un dialogue de confirmation s'affiche avec le champ titre pre-rempli

### 4.3 Cas d'usage

- Adapter un CV pour un appel d'offres specifique (retirer certaines experiences, mettre en avant d'autres competences)
- Creer une version dans une autre langue
- Tester un format different sans modifier l'original

---

## 5. Authentification et roles

### 5.1 Mecanisme d'authentification

- Login par email + mot de passe
- Sessions avec token JWT (stocke en httpOnly cookie)
- Duree de session : 24h (configurable)
- Deconnexion : suppression du cookie cote client + invalidation cote serveur

### 5.2 Roles

**Admin** :
- Tout ce qu'un utilisateur peut faire
- Creer / modifier / desactiver des comptes utilisateurs
- Modifier le role d'un utilisateur
- Reinitialiser le mot de passe d'un utilisateur

**Utilisateur** :
- Creer, modifier, dupliquer, supprimer ses propres CV
- Exporter ses CV en PDF
- Modifier son mot de passe

### 5.3 Creation de comptes

- Comptes crees uniquement par un admin
- L'admin saisit : email, prenom, nom, role, mot de passe temporaire
- A la premiere connexion, l'utilisateur est invite a changer son mot de passe
- Pas d'inscription en libre-service

### 5.4 Reinitialisation de mot de passe

- L'utilisateur clique "Mot de passe oublie" sur la page de connexion
- Saisit son email
- Recoit un lien de reinitialisation par email
- Le lien contient un token a usage unique, valide 1 heure
- L'utilisateur saisit son nouveau mot de passe (avec confirmation)

### 5.5 Securite

- Mots de passe hashes avec bcrypt (cost factor >= 12)
- Protection CSRF sur les formulaires
- Rate limiting sur les endpoints de connexion (5 tentatives max par minute)
- Validation des tokens JWT a chaque requete authentifiee
- Les donnees personnelles des CV ne sont accessibles qu'aux utilisateurs authentifies
