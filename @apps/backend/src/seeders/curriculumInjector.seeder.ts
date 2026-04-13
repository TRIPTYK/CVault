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
  );
  const c1Profil = createSection(em, "e2e-c1-s2-profil", cv1, tProfil!, "Profil", 1);
  const c1Exp = createSection(em, "e2e-c1-s3-exp", cv1, tExperiences!, "Expériences", 2);
  const c1Form = createSection(em, "e2e-c1-s4-form", cv1, tFormation!, "Formations", 3);
  const c1Comp = createSection(em, "e2e-c1-s5-comp", cv1, tCompetences!, "Compétences", 4);
  const c1Langue = createSection(em, "e2e-c1-s6-langue", cv1, tLangue!, "Langues", 5);
  const c1Centres = createSection(em, "e2e-c1-s7-centres", cv1, tCentres!, "Centres d'intérêt", 6);
  const c1Refs = createSection(em, "e2e-c1-s8-refs", cv1, tReferences!, "Références", 7);

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

  // ── CV 2 : CV junior (moins de sections) ─────────────
  const cv2 = em.create(CurriculumEntity, {
    id: "e2e-c2",
    userId: "e2e-login-user",
    title: "CV Junior - Sophie Martin",
    createdAt: new Date("2025-09-15"),
    updatedAt: new Date("2025-09-15"),
  }) as CurriculumEntityType;

  const s2Perso = createSection(
    em,
    "e2e-c2-s1-perso",
    cv2,
    tPerso!,
    "Informations personnelles",
    0,
  );
  const s2Profil = createSection(em, "e2e-c2-s2-profil", cv2, tProfil!, "Profil", 1);
  const s2Form = createSection(em, "e2e-c2-s3-form", cv2, tFormation!, "Formations", 2);
  const s2Comp = createSection(em, "e2e-c2-s4-comp", cv2, tCompetences!, "Compétences", 3);
  const s2Langue = createSection(em, "e2e-c2-s5-langue", cv2, tLangue!, "Langues", 4);

  createItem(em, "e2e-c2-s1-perso-i1", s2Perso, 0, {
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@outlook.com",
    phone: "0698765432",
    address: "45 avenue Foch, 69000 Lyon",
  });
  createItem(em, "e2e-c2-s2-profil-i1", s2Profil, 0, {
    description:
      "Étudiante en master informatique à la recherche d'une alternance. Motivée, rigoureuse et passionnée par le développement web.",
  });
  createItem(em, "e2e-c2-s3-form-i1", s2Form, 0, {
    school: "INSA Lyon",
    degree: "Master Ingénierie Logicielle",
    field: "Informatique",
    startDate: "2023-09-01",
    endDate: "2025-06-30",
    description: "Formation en alternance, spécialisation web et cloud.",
  });
  createItem(em, "e2e-c2-s3-form-i2", s2Form, 1, {
    school: "IUT de Lyon",
    degree: "BUT Informatique",
    field: "Informatique",
    startDate: "2020-09-01",
    endDate: "2023-06-30",
    description: "Formation pratique en développement logiciel.",
  });
  createItem(em, "e2e-c2-s4-comp-i1", s2Comp, 0, { competence: "React", level: "Intermédiaire" });
  createItem(em, "e2e-c2-s4-comp-i2", s2Comp, 1, { competence: "Python", level: "Intermédiaire" });
  createItem(em, "e2e-c2-s5-langue-i1", s2Langue, 0, { language: "Français", level: "Natif" });
  createItem(em, "e2e-c2-s5-langue-i2", s2Langue, 1, { language: "Anglais", level: "B2" });
  createItem(em, "e2e-c2-s5-langue-i3", s2Langue, 2, { language: "Espagnol", level: "B1" });

  // ── CV 3 : CV senior (expériences longues) ────────────
  const cv3 = em.create(CurriculumEntity, {
    id: "e2e-c3",
    userId: "e2e-login-user",
    title: "CV Senior - Marc Leblanc",
    createdAt: new Date("2025-11-01"),
    updatedAt: new Date("2025-11-01"),
  }) as CurriculumEntityType;
  const s3Perso = createSection(
    em,
    "e2e-c3-s1-perso",
    cv3,
    tPerso!,
    "Informations personnelles",
    1,
  );
  const s3Profil = createSection(em, "e2e-c3-s2-profil", cv3, tProfil!, "Profil", 2);
  const s3Exp = createSection(em, "e2e-c3-s3-exp", cv3, tExperiences!, "Expériences", 3);
  const s3Form = createSection(em, "e2e-c3-s4-form", cv3, tFormation!, "Formations", 4);
  const s3Comp = createSection(em, "e2e-c3-s5-comp", cv3, tCompetences!, "Compétences", 5);
  const s3Refs = createSection(em, "e2e-c3-s6-refs", cv3, tReferences!, "Références", 6);

  createItem(em, "e2e-c3-s1-perso-i1", s3Perso, 0, {
    firstName: "Marc",
    lastName: "Leblanc",
    email: "marc.leblanc@gmail.com",
    phone: "0677889900",
    address: "8 place Bellecour, 69002 Lyon",
  });
  createItem(em, "e2e-c3-s2-profil-i1", s3Profil, 0, {
    description:
      "Architecte logiciel avec 15 ans d'expérience. Expert en conception de systèmes distribués, microservices et cloud AWS. Passionné par les bonnes pratiques et le mentoring.",
  });
  createItem(em, "e2e-c3-s3-exp-i1", s3Exp, 0, {
    employer: "BNP Paribas",
    position: "Architecte Solutions",
    city: "Paris",
    startDate: "2019-01-01",
    endDate: "",
    description:
      "Conception et supervision de l'architecture SI pour les services de paiement en ligne. Équipe de 12 développeurs.",
  });
  createItem(em, "e2e-c3-s3-exp-i2", s3Exp, 1, {
    employer: "Capgemini",
    position: "Tech Lead Java",
    city: "Lyon",
    startDate: "2014-04-01",
    endDate: "2018-12-31",
    description:
      "Lead technique sur des projets grands comptes. Mise en place CI/CD et pratiques DevOps.",
  });
  createItem(em, "e2e-c3-s3-exp-i3", s3Exp, 2, {
    employer: "Sopra Steria",
    position: "Développeur Backend",
    city: "Lyon",
    startDate: "2010-09-01",
    endDate: "2014-03-31",
    description: "Développement d'applications Java EE pour le secteur bancaire.",
  });
  createItem(em, "e2e-c3-s4-form-i1", s3Form, 0, {
    school: "École Centrale Paris",
    degree: "Diplôme d'ingénieur",
    field: "Informatique & Systèmes",
    startDate: "2007-09-01",
    endDate: "2010-06-30",
    description: "Grande école d'ingénieurs, majeure systèmes d'information.",
  });
  createItem(em, "e2e-c3-s5-comp-i1", s3Comp, 0, { competence: "Java / Spring", level: "Expert" });
  createItem(em, "e2e-c3-s5-comp-i2", s3Comp, 1, { competence: "AWS", level: "Expert" });
  createItem(em, "e2e-c3-s5-comp-i3", s3Comp, 2, { competence: "Kubernetes", level: "Avancé" });
  createItem(em, "e2e-c3-s6-refs-i1", s3Refs, 0, {
    name: "Claire Morin",
    entreprise: "BNP Paribas",
    email: "c.morin@bnp.fr",
    phone: "0145678901",
    city: "Paris",
  });
  createItem(em, "e2e-c3-s6-refs-i2", s3Refs, 1, {
    name: "Thomas Renard",
    entreprise: "Capgemini",
    email: "t.renard@capgemini.com",
    phone: "0472345678",
    city: "Lyon",
  });
}
