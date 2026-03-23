import {
  hashPassword,
  SectionTemplatesEntity,
  UserEntity,
  CurriculumEntity,
  SectionsEntity,
  SectionItemsEntity,
} from "@libs/users-backend";
import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import personnalInformationsJsonSchema from "./models/personal-informations.schema.json" with { type: "json" };
import formationsJsonSchema from "./models/formations.schema.json" with { type: "json" };
import langueJsonSchema from "./models/langues.schema.json" with { type: "json" };
import centresInteretsJsonSchema from "./models/centres-interets.schema.json" with { type: "json" };
import competencesJsonSchema from "./models/competences.schema.json" with { type: "json" };
import experiencesJsonSchema from "./models/experiences.schema.json" with { type: "json" };
import profilJsonSchema from "./models/profil.schema.json" with { type: "json" };
import referencesJsonSchema from "./models/references.schema.json" with { type: "json" };

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager) {
    const hashedPassword = await hashPassword("123456789");

    // Login user for e2e tests
    em.create(UserEntity, {
      id: "e2e-login-user",
      email: "deflorenne.amaury@triptyk.eu",
      firstName: "Amaury",
      lastName: "Deflorenne",
      password: hashedPassword,
    });

    // Curriculum for e2e tests
    em.create(CurriculumEntity, {
      id: "e2e-curriculum",
      userId: "e2e-login-user",
      title: "Mon CV",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const template1 = em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-1",
      label: "Informations personnelles",
      jsonSchema: personnalInformationsJsonSchema,
      position: 1,
    });

    const template2 = em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-2",
      label: "Formations",
      jsonSchema: formationsJsonSchema,
      position: 2,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-3",
      label: "Expériences professionnelles",
      jsonSchema: experiencesJsonSchema,
      position: 3,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-4",
      label: "Compétences",
      jsonSchema: competencesJsonSchema,
      position: 4,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-5",
      label: "Centres d'intérêts",
      jsonSchema: centresInteretsJsonSchema,
      position: 5,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-6",
      label: "Profil",
      jsonSchema: profilJsonSchema,
      position: 6,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-7",
      label: "Références",
      jsonSchema: referencesJsonSchema,
      position: 7,
    });

    em.create(SectionTemplatesEntity, {
      id: "e2e-section-template-3",
      label: "Langues",
      jsonSchema: langueJsonSchema,
      position: 3,
    });

    const curriculum = em.create(CurriculumEntity, {
      id: "e2e-curriculum",
      userId: "e2e-login-user",
      title: "Mon CV",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const section1 = em.create(SectionsEntity, {
      id: "e2e-section-1",
      curriculum,
      template: template1,
      title: "Informations personnelles",
      position: 1,
    });

    const section2 = em.create(SectionsEntity, {
      id: "e2e-section-2",
      curriculum,
      template: template2,
      title: "Formations",
      position: 2,
    });

    em.create(SectionItemsEntity, {
      id: "e2e-section-item-1",
      section: section1,
      position: 1,
      jsonData: {
        firstName: "Amaury",
        lastName: "Deflorenne",
        email: "test@gmail.com",
        phone: "0601020304",
        address: "123 rue de la paix, 75000 Paris",
      },
    });

    em.create(SectionItemsEntity, {
      id: "e2e-section-item-2",
      section: section2,
      position: 1,
      jsonData: {
        school: "Université de Lyon",
        degree: "Master Informatique",
        field: "Informatique",
        startDate: "2021-09-01",
        endDate: "2023-06-30",
        description: "Description de ma formation en informatique à l'Université de Lyon.",
      },
    });

    em.create(SectionItemsEntity, {
      id: "e2e-section-item-3",
      section: section2,
      position: 2,
      jsonData: {
        school: "Université de Paris",
        degree: "Licence Informatique",
        field: "Informatique",
        startDate: "2018-09-01",
        endDate: "2021-06-30",
        description: "Description de ma formation en informatique à l'Université de Paris.",
      },
    });
  }
}
