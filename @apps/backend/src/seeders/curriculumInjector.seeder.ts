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
  isActive: boolean,
) {
  return em.create<SectionEntityType>("Sections", {
    id,
    curriculum,
    template,
    title,
    position,
    isActive,
  });
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
    id: "e2e-c1",
    userId: "e2e-login-user",
    title: "CV Complet - Amaury Deflorenne",
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
  }) as CurriculumEntityType;

  const c1Perso = createSection(
    em,
    "e2e-c1-s1-perso",
    cv1,
    tPerso!,
    "Informations personnelles",
    0,
    true,
  );
  const c1Profil = createSection(em, "e2e-c1-s2-profil", cv1, tProfil!, "Profil", 1, true);
  const c1Exp = createSection(em, "e2e-c1-s3-exp", cv1, tExperiences!, "Expériences", 2, true);
  const c1Form = createSection(em, "e2e-c1-s4-form", cv1, tFormation!, "Formations", 3, true);
  const c1Comp = createSection(em, "e2e-c1-s5-comp", cv1, tCompetences!, "Compétences", 4, true);
  const c1Langue = createSection(em, "e2e-c1-s6-langue", cv1, tLangue!, "Langues", 5, true);
  const c1Centres = createSection(
    em,
    "e2e-c1-s7-centres",
    cv1,
    tCentres!,
    "Centres d'intérêt",
    6,
    true,
  );
  const c1Refs = createSection(em, "e2e-c1-s8-refs", cv1, tReferences!, "Références", 7, true);

  createItem(em, "e2e-c1-s1-perso-i1", c1Perso, 0, {
    firstName: "Amaury",
    lastName: "Deflorenne",
    email: "amaury@gmail.com",
    phone: "0601020304",
    address: "123 rue de la paix, 75000 Paris",
  });
  createItem(em, "e2e-c1-s2-profil-i1", c1Profil, 0, {
    description:
      "Développeur fullstack passionné avec 5 ans d'expérience en JavaScript et TypeScript. Spécialisé dans les architectures modernes et les applications web performantes.",
  });
  createItem(em, "e2e-c1-s3-exp-i1", c1Exp, 0, {
    employer: "Triptyk",
    position: "Développeur Fullstack",
    city: "Lyon",
    startDate: "2022-03-01",
    endDate: "",
    description:
      "Développement d'applications web avec Ember.js et Node.js. Mise en place d'architectures microservices.",
  });
  createItem(em, "e2e-c1-s3-exp-i2", c1Exp, 1, {
    employer: "WebAgency",
    position: "Développeur Frontend",
    city: "Paris",
    startDate: "2020-06-01",
    endDate: "2022-02-28",
    description:
      "Intégration et développement d'interfaces React. Optimisation des performances frontend.",
  });
  createItem(em, "e2e-c1-s3-exp-i3", c1Exp, 2, {
    employer: "StartupX",
    position: "Stagiaire Développeur",
    city: "Lyon",
    startDate: "2019-01-01",
    endDate: "2019-12-31",
    description:
      "Stage de fin d'études axé sur le développement d'une application mobile en React Native.",
  });
  createItem(em, "e2e-c1-s3-exp-i4", c1Exp, 3, {
    employer: "Freelance",
    position: "Développeur Web",
    city: "Lyon",
    startDate: "2018-01-01",
    endDate: "2018-12-31",
    description:
      "Réalisation de plusieurs projets web pour des clients locaux, principalement en JavaScript.",
  });
  createItem(em, "e2e-c1-s3-exp-i5", c1Exp, 4, {
    employer: "Université de Lyon",
    position: "Assistant de Recherche",
    city: "Lyon",
    startDate: "2017-01-01",
    endDate: "2017-12-31",
    description:
      "Participation à un projet de recherche sur les systèmes distribués. Publication d'un article dans une conférence internationale.",
  });
  createItem(em, "e2e-c1-s4-form-i1", c1Form, 0, {
    school: "Université de Lyon",
    degree: "Master Informatique",
    field: "Génie Logiciel",
    startDate: "2018-09-01",
    endDate: "2020-06-30",
    description: "Spécialisation en architecture logicielle et développement web.",
  });
  createItem(em, "e2e-c1-s4-form-i2", c1Form, 1, {
    school: "Université de Paris",
    degree: "Licence Informatique",
    field: "Informatique",
    startDate: "2015-09-01",
    endDate: "2018-06-30",
    description: "Formation généraliste en informatique.",
  });
  createItem(em, "e2e-c1-s4-form-i3", c1Form, 2, {
    school: "Lycée Jean Moulin",
    degree: "Baccalauréat Scientifique",
    field: "Sciences de l'ingénieur",
    startDate: "2012-09-01",
    endDate: "2015-06-30",
    description: "Mention Bien.",
  });
  createItem(em, "e2e-c1-s5-comp-i1", c1Comp, 0, { competence: "TypeScript", level: "Expert" });
  createItem(em, "e2e-c1-s5-comp-i2", c1Comp, 1, { competence: "Ember.js", level: "Avancé" });
  createItem(em, "e2e-c1-s5-comp-i3", c1Comp, 2, { competence: "Node.js", level: "Avancé" });
  createItem(em, "e2e-c1-s6-langue-i1", c1Langue, 0, { language: "Français", level: "Natif" });
  createItem(em, "e2e-c1-s6-langue-i2", c1Langue, 1, { language: "Anglais", level: "C1" });
  createItem(em, "e2e-c1-s7-centres-i1", c1Centres, 0, { name: "Open source" });
  createItem(em, "e2e-c1-s7-centres-i2", c1Centres, 1, { name: "Randonnée" });
  createItem(em, "e2e-c1-s8-ref-i1", c1Refs, 0, {
    name: "Jean Dupont",
    entreprise: "Triptyk",
    email: "jean.dupont@triptyk.eu",
    phone: "0612345678",
    city: "Lyon",
  });
}
