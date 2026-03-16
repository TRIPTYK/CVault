import { hashPassword, ProposedSectionEntity, UserEntity } from "@libs/users-backend";
import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

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

    em.create(ProposedSectionEntity, {
      id: "e2e-proposed-section-1",
      title: "Informations personnelles",
      position: 1,
    });

    em.create(ProposedSectionEntity, {
      id: "e2e-proposed-section-2",
      title: "Expérience professionnelle",
      position: 2,
    });

    em.create(ProposedSectionEntity, {
      id: "e2e-proposed-section-3",
      title: "Formation et diplômes",
      position: 3,
    });
  }
}
