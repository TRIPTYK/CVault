# CV Manager — Plan MVP

## Contexte

L'equipe commerciale perd du temps a assembler et formater les CV des collaborateurs pour repondre aux appels d'offres. Les CV sont disperses dans des documents Word, Google Docs et emails, sans coherence de format. L'objectif est de creer un outil interne centralise pour gerer les CV de l'entreprise.

## Perimetre

MVP complet : CRUD des CV, editeur avec apercu en temps reel, templates personnalisables, export PDF (format classique + Europass), authentification simple.

## Decisions prises

- **Editeur** : Formulaire avec sections depliables a gauche + apercu en temps reel a droite (inspire de l'editeur Europass officiel)
- **Champs CV** : Format Europass complet (infos personnelles, profil, formation, experience pro, langues avec niveaux CECRL, competences avec indicateurs, soft skills, references, competences numeriques, permis de conduire)
- **Formats d'export** : Europass (fidele au modele EU) + Classique (format simple et professionnel)
- **Authentification** : Login simple (email + mot de passe), comptes crees par un admin
- **Utilisateurs cibles** : Equipe commerciale / business dev
- **Stack technique** : A definir

## Taches

### Tache 1 : Sauvegarder la documentation du spec

Creer `agent-os/specs/2026-02-13-cv-manager-mvp/` avec :
- **plan.md** — Ce plan complet
- **shape.md** — Notes de cadrage (perimetre, decisions, contexte)
- **references.md** — Reference a l'editeur Europass officiel de l'UE
- **visuals/** — Captures d'ecran de l'editeur Europass

### Tache 2 : Definir le modele de donnees CV

Specifier la structure de donnees complete d'un CV :
- **Informations personnelles** : photo, prenom, nom, email, titre, telephone, adresse, code postal, ville, date de naissance, permis de conduire, sexe, nationalite, etat civil
- **Champs optionnels** : lieu de naissance, site internet, LinkedIn, champs personnalises
- **Profil** : texte de resume professionnel
- **Formation** : liste d'entrees (diplome, etablissement, lieu, dates, description)
- **Experience professionnelle** : liste d'entrees (titre, employeur, lieu, dates, liste de responsabilites)
- **Langues** : liste (langue, niveau CECRL : comprehension orale/ecrite, expression orale/ecrite)
- **Competences** : liste groupees par categorie (nom, niveau 1-10)
- **Soft skills** : liste (nom, niveau)
- **Competences numeriques** : liste (nom, niveau)
- **References** : liste (nom, poste, entreprise, contact)

### Tache 3 : Concevoir l'interface utilisateur

Specifier les ecrans et interactions :
- **Page de connexion** : email + mot de passe
- **Liste des CV** : tableau/grille avec nom, titre, date de modification, actions (editer, dupliquer, exporter, supprimer)
- **Editeur de CV** : layout split-panel
  - Gauche : formulaire avec sections depliables (comme Europass)
  - Droite : apercu en temps reel du CV formate
  - Possibilite de choisir le template d'apercu (classique/Europass)
- **Gestion des templates** : selection du format, personnalisation des couleurs/polices
- **Administration** : gestion des comptes utilisateurs (creation par admin)

### Tache 4 : Specifier l'export PDF

Detailler les deux formats d'export :
- **Format Europass** : fidele au modele officiel de l'UE (en-tetes bleus, photo a gauche, indicateurs de niveau par points, structure standardisee)
- **Format Classique** : format professionnel epure, sans contrainte Europass, adapte a la charte de l'entreprise
- Generation cote serveur ou client
- Nommage des fichiers exportes

### Tache 5 : Specifier la duplication de CV

- Dupliquer un CV existant pour creer une variante (ex: CV adapte a un appel d'offres specifique)
- Possibilite de renommer le CV duplique
- Lien ou non avec le CV source

### Tache 6 : Specifier l'authentification et les roles

- Login simple : email + mot de passe
- Roles : admin (gestion des utilisateurs + tout) et utilisateur standard (CRUD sur les CV)
- Creation de comptes par l'admin uniquement
- Reinitialisation de mot de passe

## Verification

Pour valider la spec :
- Relire chaque fichier du dossier spec pour s'assurer de la coherence
- Verifier que tous les champs Europass sont couverts dans le modele de donnees
- Verifier que les deux formats d'export sont bien documentes
- S'assurer que le parcours utilisateur est complet (connexion -> liste -> edition -> export)
