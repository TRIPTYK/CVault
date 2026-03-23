import {
  type AuthModule,
  type UserModule,
  type CurriculumModule,
  type SectionTemplatesModule,
  type SectionsModule,
  type SectionItemsModule,
} from "@libs/users-backend";
import type { FastifyInstanceType } from "./app.js";
import { statusRoute } from "./status.route.js";

interface AppRouterOptions {
  authModule: AuthModule;
  userModule: UserModule;
  curriculumModule: CurriculumModule;
  sectionTemplatesModule: SectionTemplatesModule;
  sectionsModule: SectionsModule;
  sectionItemsModule: SectionItemsModule;
}

export async function appRouter(
  fastify: FastifyInstanceType,
  {
    authModule,
    userModule,
    curriculumModule,
    sectionTemplatesModule,
    sectionsModule,
    sectionItemsModule,
  }: AppRouterOptions,
) {
  await fastify.register(
    async function (fastify) {
      await fastify.register(statusRoute);
      await authModule.setupRoutes(fastify);
      await fastify.register(async (fastify) => {
        // Resource routes
        fastify.addHook("onRoute", (routeOptions) => {
          if (routeOptions.schema) {
            routeOptions.schema.tags ??= ["resource"];
          }
        });
      });

      await userModule.setupRoutes(fastify);
      await curriculumModule.setupRoutes(fastify);
      await sectionTemplatesModule.setupRoutes(fastify);
      await sectionsModule.setupRoutes(fastify);
      await sectionItemsModule.setupRoutes(fastify);
    },
    {
      prefix: "api/v1",
    },
  );
}
