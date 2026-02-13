# CVault

Outil interne de gestion centralisée des CV d'entreprise, conçu pour accélérer la préparation des réponses aux appels d'offres.

## Problème

Les entreprises qui répondent à des appels d'offres doivent fréquemment fournir les CV de leurs collaborateurs. La gestion de ces CV est souvent dispersée (Word, Google Docs, emails), entraînant des incohérences de format, des informations obsolètes et une perte de temps considérable.

## Fonctionnalités

### MVP (Phase 1)

- **Gestion des CV (CRUD)** — Créer, modifier, dupliquer et supprimer des CV
- **Export PDF** — Deux formats : Europass (modèle officiel UE) et Classique (professionnel épuré)
- **Éditeur split-panel** — Formulaire à gauche, aperçu en temps réel à droite
- **Templates personnalisables** — Modèles configurables pour adapter la présentation
- **Authentification** — Login email/mot de passe, JWT, rôles admin/utilisateur
- **Administration** — Gestion des comptes utilisateurs (création, rôles, réinitialisation)

### Post-lancement (Phase 2)

- **Recherche et filtres** — Par compétences, poste, expérience, certifications
- **Édition assistée par IA** — Suggestions pour adapter les CV aux exigences des appels d'offres

## Structure du projet

```
CVault/
├── agent-os/
│   ├── product/          # Documentation produit (mission, roadmap, stack)
│   ├── specs/            # Spécifications techniques
│   └── standards/        # Standards de développement
└── .claude/
    └── commands/         # Commandes Agent OS
```

## Développement

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run test     # Lancer les tests
npm run lint     # Lancer le linter
```

## Licence

Projet interne — Tous droits réservés.
