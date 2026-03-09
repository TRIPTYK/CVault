import { type AuthModule, type UserModule, type CurriculumModule } from "@libs/users-backend";
import type { FastifyInstanceType } from "./app.js";
import { statusRoute } from "./status.route.js";

interface AppRouterOptions {
  authModule: AuthModule;
  userModule: UserModule;
  curriculumModule: CurriculumModule;
}

export async function appRouter(
  fastify: FastifyInstanceType,
  { authModule, userModule, curriculumModule }: AppRouterOptions,
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
    },
    {
      prefix: "api/v1",
    },
  );
}
