import {
  CurriculumEntity,
  type SectionTemplatesEntityType,
  type SectionEntityType,
  type SectionItemEntityType,
  type CurriculumEntityType,
} from "@libs/users-backend";
import type { EntityManager } from "@mikro-orm/core";

import personnalInformationsJsonSchema from "./models/personal-informations.schema.json" with { type: "json" };
import formationsJsonSchema from "./models/formations.schema.json" with { type: "json" };
import langueJsonSchema from "./models/langues.schema.json" with { type: "json" };
import centresInteretsJsonSchema from "./models/centres-interets.schema.json" with { type: "json" };
import competencesJsonSchema from "./models/competences.schema.json" with { type: "json" };
import experiencesJsonSchema from "./models/experiences.schema.json" with { type: "json" };
import profilJsonSchema from "./models/profil.schema.json" with { type: "json" };
import referencesJsonSchema from "./models/references.schema.json" with { type: "json" };

const schemas = [
  personnalInformationsJsonSchema,
  formationsJsonSchema,
  langueJsonSchema,
  centresInteretsJsonSchema,
  competencesJsonSchema,
  experiencesJsonSchema,
  profilJsonSchema,
  referencesJsonSchema,
];

function createTemplate(em: EntityManager, schema: (typeof schemas)[number], position: number) {
  return em.create<SectionTemplatesEntityType>("SectionTemplates", {
    id: `e2e-section-template-${schema.title.toLowerCase().replace(/\s/g, "-")}`,
    label: schema.title,
    jsonSchema: schema.properties,
    position,
  });
}

function createSection(
  em: EntityManager,
  id: string,
  curriculum: CurriculumEntityType,
  template: SectionTemplatesEntityType,
  title: string,
  position: number,
) {
  return em.create<SectionEntityType>("Sections", { id, curriculum, template, title, position });
}

function createItem(
  em: EntityManager,
  id: string,
  section: SectionEntityType,
  position: number,
  jsonData: Record<string, unknown>,
) {
  em.create<SectionItemEntityType>("SectionItems", { id, section, position, jsonData });
}

export default function curriculumInjectorSeeder(em: EntityManager) {
  const [tPerso, tFormation, tLangue, tCentres, tCompetences, tExperiences, tProfil, tReferences] =
    schemas.map((s, i) => createTemplate(em, s, i + 1));

  // ── CV 1 : CV complet (toutes sections) ──────────────
  const cv1 = em.create(CurriculumEntity, {
    id: "e2e-curriculum-1",
    userId: "e2e-login-user",
    title: "CV Complet - Amaury Deflorenne",
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  }) as CurriculumEntityType;

  const s1Perso = createSection(em, "e2e-s1-perso", cv1, tPerso!, "Informations personnelles", 1);
  const s1Profil = createSection(em, "e2e-s1-profil", cv1, tProfil!, "Profil", 2);
  const s1Exp = createSection(em, "e2e-s1-exp", cv1, tExperiences!, "Expériences", 3);
  const s1Form = createSection(em, "e2e-s1-form", cv1, tFormation!, "Formations", 4);
  const s1Comp = createSection(em, "e2e-s1-comp", cv1, tCompetences!, "Compétences", 5);
  const s1Langue = createSection(em, "e2e-s1-langue", cv1, tLangue!, "Langues", 6);
  const s1Centres = createSection(em, "e2e-s1-centres", cv1, tCentres!, "Centres d'intérêt", 7);
  const s1Refs = createSection(em, "e2e-s1-refs", cv1, tReferences!, "Références", 8);

  createItem(em, "e2e-item-1-perso", s1Perso, 1, {
    firstName: "Amaury",
    lastName: "Deflorenne",
    email: "amaury@gmail.com",
    phone: "0601020304",
    address: "123 rue de la paix, 75000 Paris",
  });
  createItem(em, "e2e-item-1-profil", s1Profil, 1, {
    description:
      "Développeur fullstack passionné avec 5 ans d'expérience en JavaScript et TypeScript. Spécialisé dans les architectures modernes et les applications web performantes.",
  });
  createItem(em, "e2e-item-1-exp-1", s1Exp, 1, {
    employer: "Triptyk",
    position: "Développeur Fullstack",
    city: "Lyon",
    startDate: "2022-03-01",
    endDate: "",
    description:
      "Développement d'applications web avec Ember.js et Node.js. Mise en place d'architectures microservices.",
  });
  createItem(em, "e2e-item-1-exp-2", s1Exp, 2, {
    employer: "WebAgency",
    position: "Développeur Frontend",
    city: "Paris",
    startDate: "2020-06-01",
    endDate: "2022-02-28",
    description:
      "Intégration et développement d'interfaces React. Optimisation des performances frontend.",
  });
  createItem(em, "e2e-item-1-exp-3", s1Exp, 3, {
    employer: "StartupX",
    position: "Stagiaire Développeur",
    city: "Lyon",
    startDate: "2019-01-01",
    endDate: "2019-12-31",
    description:
      "Stage de fin d'études axé sur le développement d'une application mobile en React Native.",
  });
  createItem(em, "e2e-item-1-exp-4", s1Exp, 4, {
    employer: "Freelance",
    position: "Développeur Web",
    city: "Lyon",
    startDate: "2018-01-01",
    endDate: "2018-12-31",
    description:
      "Réalisation de plusieurs projets web pour des clients locaux, principalement en JavaScript.",
  });
  createItem(em, "e2e-item-1-exp-5", s1Exp, 5, {
    employer: "Université de Lyon",
    position: "Assistant de Recherche",
    city: "Lyon",
    startDate: "2017-01-01",
    endDate: "2017-12-31",
    description:
      "Participation à un projet de recherche sur les systèmes distribués. Publication d'un article dans une conférence internationale.",
  });
  createItem(em, "e2e-item-1-form-1", s1Form, 1, {
    school: "Université de Lyon",
    degree: "Master Informatique",
    field: "Génie Logiciel",
    startDate: "2018-09-01",
    endDate: "2020-06-30",
    description: "Spécialisation en architecture logicielle et développement web.",
  });
  createItem(em, "e2e-item-1-form-2", s1Form, 2, {
    school: "Université de Paris",
    degree: "Licence Informatique",
    field: "Informatique",
    startDate: "2015-09-01",
    endDate: "2018-06-30",
    description: "Formation généraliste en informatique.",
  });
  createItem(em, "e2e-item-1-form-3", s1Form, 3, {
    school: "Lycée Jean Moulin",
    degree: "Baccalauréat Scientifique",
    field: "Sciences de l'ingénieur",
    startDate: "2012-09-01",
    endDate: "2015-06-30",
    description: "Mention Bien.",
  });
  createItem(em, "e2e-item-1-comp-1", s1Comp, 1, { competence: "TypeScript", level: "Expert" });
  createItem(em, "e2e-item-1-comp-1", s1Comp, 1, { competence: "TypeScript", level: "Expert" });
  createItem(em, "e2e-item-1-comp-2", s1Comp, 2, { competence: "Ember.js", level: "Avancé" });
  createItem(em, "e2e-item-1-comp-3", s1Comp, 3, { competence: "Node.js", level: "Avancé" });
  createItem(em, "e2e-item-1-langue-1", s1Langue, 1, { language: "Français", level: "Natif" });
  createItem(em, "e2e-item-1-langue-2", s1Langue, 2, { language: "Anglais", level: "C1" });
  createItem(em, "e2e-item-1-centres-1", s1Centres, 1, { name: "Open source" });
  createItem(em, "e2e-item-1-centres-2", s1Centres, 2, { name: "Randonnée" });
  createItem(em, "e2e-item-1-ref-1", s1Refs, 1, {
    name: "Jean Dupont",
    entreprise: "Triptyk",
    email: "jean.dupont@triptyk.eu",
    phone: "0612345678",
    city: "Lyon",
  });

  // ── CV 2 : CV junior (moins de sections) ─────────────
  const cv2 = em.create(CurriculumEntity, {
    id: "e2e-curriculum-2",
    userId: "e2e-login-user",
    title: "CV Junior - Sophie Martin",
    createdAt: new Date("2025-09-15"),
    updatedAt: new Date("2025-09-15"),
  }) as CurriculumEntityType;

  const s2Perso = createSection(em, "e2e-s2-perso", cv2, tPerso!, "Informations personnelles", 1);
  const s2Profil = createSection(em, "e2e-s2-profil", cv2, tProfil!, "Profil", 2);
  const s2Form = createSection(em, "e2e-s2-form", cv2, tFormation!, "Formations", 3);
  const s2Comp = createSection(em, "e2e-s2-comp", cv2, tCompetences!, "Compétences", 4);
  const s2Langue = createSection(em, "e2e-s2-langue", cv2, tLangue!, "Langues", 5);

  createItem(em, "e2e-item-2-perso", s2Perso, 1, {
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@outlook.com",
    phone: "0698765432",
    address: "45 avenue Foch, 69000 Lyon",
  });
  createItem(em, "e2e-item-2-profil", s2Profil, 1, {
    description:
      "Étudiante en master informatique à la recherche d'une alternance. Motivée, rigoureuse et passionnée par le développement web.",
  });
  createItem(em, "e2e-item-2-form-1", s2Form, 1, {
    school: "INSA Lyon",
    degree: "Master Ingénierie Logicielle",
    field: "Informatique",
    startDate: "2023-09-01",
    endDate: "2025-06-30",
    description: "Formation en alternance, spécialisation web et cloud.",
  });
  createItem(em, "e2e-item-2-form-2", s2Form, 2, {
    school: "IUT de Lyon",
    degree: "BUT Informatique",
    field: "Informatique",
    startDate: "2020-09-01",
    endDate: "2023-06-30",
    description: "Formation pratique en développement logiciel.",
  });
  createItem(em, "e2e-item-2-comp-1", s2Comp, 1, { competence: "React", level: "Intermédiaire" });
  createItem(em, "e2e-item-2-comp-2", s2Comp, 2, { competence: "Python", level: "Intermédiaire" });
  createItem(em, "e2e-item-2-langue-1", s2Langue, 1, { language: "Français", level: "Natif" });
  createItem(em, "e2e-item-2-langue-2", s2Langue, 2, { language: "Anglais", level: "B2" });
  createItem(em, "e2e-item-2-langue-3", s2Langue, 3, { language: "Espagnol", level: "B1" });

  // ── CV 3 : CV senior (expériences longues) ────────────
  const cv3 = em.create(CurriculumEntity, {
    id: "e2e-curriculum-3",
    userId: "e2e-login-user",
    title: "CV Senior - Marc Leblanc",
    createdAt: new Date("2025-11-01"),
    updatedAt: new Date("2025-11-01"),
  }) as CurriculumEntityType;
  const s3Perso = createSection(em, "e2e-s3-perso", cv3, tPerso!, "Informations personnelles", 1);
  const s3Profil = createSection(em, "e2e-s3-profil", cv3, tProfil!, "Profil", 2);
  const s3Exp = createSection(em, "e2e-s3-exp", cv3, tExperiences!, "Expériences", 3);
  const s3Form = createSection(em, "e2e-s3-form", cv3, tFormation!, "Formations", 4);
  const s3Comp = createSection(em, "e2e-s3-comp", cv3, tCompetences!, "Compétences", 5);
  const s3Refs = createSection(em, "e2e-s3-refs", cv3, tReferences!, "Références", 6);

  createItem(em, "e2e-item-3-perso", s3Perso, 1, {
    firstName: "Marc",
    lastName: "Leblanc",
    email: "marc.leblanc@gmail.com",
    phone: "0677889900",
    address: "8 place Bellecour, 69002 Lyon",
  });
  createItem(em, "e2e-item-3-profil", s3Profil, 1, {
    description:
      "Architecte logiciel avec 15 ans d'expérience. Expert en conception de systèmes distribués, microservices et cloud AWS. Passionné par les bonnes pratiques et le mentoring.",
  });
  createItem(em, "e2e-item-3-exp-1", s3Exp, 1, {
    employer: "BNP Paribas",
    position: "Architecte Solutions",
    city: "Paris",
    startDate: "2019-01-01",
    endDate: "",
    description:
      "Conception et supervision de l'architecture SI pour les services de paiement en ligne. Équipe de 12 développeurs.",
  });
  createItem(em, "e2e-item-3-exp-2", s3Exp, 2, {
    employer: "Capgemini",
    position: "Tech Lead Java",
    city: "Lyon",
    startDate: "2014-04-01",
    endDate: "2018-12-31",
    description:
      "Lead technique sur des projets grands comptes. Mise en place CI/CD et pratiques DevOps.",
  });
  createItem(em, "e2e-item-3-exp-3", s3Exp, 3, {
    employer: "Sopra Steria",
    position: "Développeur Backend",
    city: "Lyon",
    startDate: "2010-09-01",
    endDate: "2014-03-31",
    description: "Développement d'applications Java EE pour le secteur bancaire.",
  });
  createItem(em, "e2e-item-3-form-1", s3Form, 1, {
    school: "École Centrale Paris",
    degree: "Diplôme d'ingénieur",
    field: "Informatique & Systèmes",
    startDate: "2007-09-01",
    endDate: "2010-06-30",
    description: "Grande école d'ingénieurs, majeure systèmes d'information.",
  });
  createItem(em, "e2e-item-3-comp-1", s3Comp, 1, { competence: "Java / Spring", level: "Expert" });
  createItem(em, "e2e-item-3-comp-2", s3Comp, 2, { competence: "AWS", level: "Expert" });
  createItem(em, "e2e-item-3-comp-3", s3Comp, 3, { competence: "Kubernetes", level: "Avancé" });
  createItem(em, "e2e-item-3-ref-1", s3Refs, 1, {
    name: "Claire Morin",
    entreprise: "BNP Paribas",
    email: "c.morin@bnp.fr",
    phone: "0145678901",
    city: "Paris",
  });
  createItem(em, "e2e-item-3-ref-2", s3Refs, 2, {
    name: "Thomas Renard",
    entreprise: "Capgemini",
    email: "t.renard@capgemini.com",
    phone: "0472345678",
    city: "Lyon",
  });
}
