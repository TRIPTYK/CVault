import { hashPassword, UserEntity } from "@libs/users-backend";
import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import curriculumInjectorSeeder from "./curriculumInjector.seeder.ts";

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
      role: "admin",
    });

    em.create(UserEntity, {
      id: "e2e-login-user-2",
      email: "jean@triptyk.eu",
      firstName: "Jean",
      lastName: "Bourgies",
      password: hashedPassword,
      role: "user",
    });

    curriculumInjectorSeeder(em);
  }
}
