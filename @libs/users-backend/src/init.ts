import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from "fastify";
import type {
  AuthLibraryContext,
  UserLibraryContext,
  CurriculumLibraryContext,
  SectionTemplatesLibraryContext,
} from "./context.js";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { LoginRoute } from "#src/routes/login.route.js";
import { RefreshRoute } from "#src/routes/refresh.route.js";
import { LogoutRoute } from "#src/routes/logout.route.js";
import { CreateRoute } from "#src/routes/create.route.js";
import { ProfileRoute } from "#src/routes/profile.route.js";
import { ListRoute } from "#src/routes/list.route.js";
import { GetRoute } from "#src/routes/get.route.js";
import { UpdateRoute } from "#src/routes/update.route.js";
import { DeleteRoute } from "#src/routes/delete.route.js";
import { UserEntity } from "./entities/user.entity.js";
import { makeJsonApiError, type ModuleInterface, type Route } from "@libs/backend-shared";
import { handleJsonApiErrors } from "@libs/backend-shared";
import {
  createJwtAuthMiddleware,
  SectionItemsEntity,
  SectionsEntity,
  SectionTemplatesEntity,
} from "./index.ts";
import { CurriculumEntity } from "./entities/curriculum.entity.ts";

import { GetCurriculumRoute } from "./routes/curriculums/get.route.ts";
import { ListCurriculumRoute } from "./routes/curriculums/list.route.ts";
import { CreateCurriculumRoute } from "./routes/curriculums/create.route.ts";
import { UpdateCurriculumRoute } from "./routes/curriculums/update.route.ts";
import { DeleteCurriculumRoute } from "./routes/curriculums/delete.route.ts";
import { DuplicateCurriculumRoute } from "./routes/curriculums/duplicate.route.ts";
import { ExportCurriculumRoute } from "./routes/curriculums/export.route.ts";
import { ListModelsCurriculumRoute } from "./routes/curriculums/list.models.route.ts";

import { GetSectionsRoute } from "./routes/sections/get.route.ts";
import { CreateSectionsRoute } from "./routes/sections/create.route.ts";
import { UpdateSectionsRoute } from "./routes/sections/update.route.ts";
import { DeleteSectionsRoute } from "./routes/sections/delete.route.ts";
import { UpdateReorderSectionsRoute } from "./routes/sections/update.reorder.route.ts";

import { CreateSectionItemRoute } from "./routes/section-items/create.route.ts";
import { UpdateSectionItemRoute } from "./routes/section-items/update.route.ts";
import { DeleteSectionItemRoute } from "./routes/section-items/delete.route.ts";
import { ReorderSectionItemsRoute } from "./routes/section-items/update.reorder.route.ts";
import { UploadPdpRoute } from "./routes/section-items/upload.pdp.route.ts";
import { GetPdpRoute } from "./routes/section-items/get.pdp.route.ts";

import { ListSectionTemplatesRoute } from "./routes/section-templates/list.route.ts";
import type { ResolveFastifyRequestType } from "fastify/types/type-provider.js";
import type { IncomingMessage, ServerResponse } from "node:http";

export type FastifyInstanceTypeForModule = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export class AuthModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: AuthLibraryContext) {}

  public static init(context: AuthLibraryContext): AuthModule {
    return new AuthModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const authRoutes: Route<FastifyInstanceTypeForModule>[] = [
      new LoginRoute(
        this.context.em.getRepository(UserEntity),
        this.context.em,
        this.context.configuration.jwtSecret,
        this.context.configuration.jwtRefreshSecret,
      ),
      new RefreshRoute(
        this.context.em,
        this.context.configuration.jwtSecret,
        this.context.configuration.jwtRefreshSecret,
      ),
      new LogoutRoute(this.context.em, this.context.configuration.jwtRefreshSecret),
    ];

    await fastify.register(
      async (f) => {
        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        for (const route of authRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/auth" },
    );
  }
}

export class UserModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: UserLibraryContext) {}

  public static init(context: UserLibraryContext): UserModule {
    return new UserModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const repository = this.context.em.getRepository(UserEntity);

    await fastify.register(
      async (f) => {
        const userRoutes: Route<FastifyInstanceTypeForModule>[] = [
          new CreateRoute(repository),
          new ProfileRoute(),
          new ListRoute(this.context.em),
          new GetRoute(repository),
          new UpdateRoute(repository),
          new DeleteRoute(repository),
        ];

        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        const jwtAuthMiddleware = createJwtAuthMiddleware(
          this.context.em,
          this.context.configuration.jwtSecret,
        );

        f.addHook("preValidation", jwtAuthMiddleware);

        const adminUserMiddleware = async (
          request: FastifyRequest<
            RouteGenericInterface,
            RawServerDefault,
            IncomingMessage,
            FastifySchema,
            FastifyTypeProviderDefault,
            unknown,
            FastifyBaseLogger,
            ResolveFastifyRequestType<
              FastifyTypeProviderDefault,
              FastifySchema,
              RouteGenericInterface
            >
          >,
          reply: FastifyReply<
            RouteGenericInterface,
            RawServerDefault,
            IncomingMessage,
            ServerResponse<IncomingMessage>,
            unknown,
            FastifySchema,
            FastifyTypeProviderDefault,
            unknown
          >,
        ) => {
          if (request.url === "/api/v1/users/profile") {
            return;
          }
          const user = request.user;

          if (!user) {
            return reply.code(401).send(
              handleJsonApiErrors(
                makeJsonApiError(401, "Unauthorized", {
                  code: "UNAUTHORIZED",
                  detail: "You must be authenticated to access this resource",
                }),
                request,
                reply,
              ),
            );
          }
          if (user.role !== "admin") {
            return reply.code(403).send(
              handleJsonApiErrors(
                makeJsonApiError(403, "Forbidden", {
                  code: "FORBIDDEN",
                  detail: "You do not have permission to access this resource",
                }),
                request,
                reply,
              ),
            );
          }
        };

        f.addHook("preValidation", adminUserMiddleware);

        for (const route of userRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/users" },
    );
  }
}

export class CurriculumModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: CurriculumLibraryContext) {}

  public static init(context: CurriculumLibraryContext): CurriculumModule {
    return new CurriculumModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const repository = this.context.em.getRepository(CurriculumEntity);

    await fastify.register(
      async (f) => {
        const curriculumRoutes: Route<FastifyInstanceTypeForModule>[] = [
          new GetCurriculumRoute(repository),
          new ListCurriculumRoute(repository),
          new CreateCurriculumRoute(
            repository,
            this.context.em.getRepository(SectionsEntity),
            this.context.em.getRepository(SectionTemplatesEntity),
          ),
          new UpdateCurriculumRoute(repository),
          new DeleteCurriculumRoute(repository),
          new DuplicateCurriculumRoute(
            repository,
            this.context.em.getRepository(SectionsEntity),
            this.context.em.getRepository(SectionItemsEntity),
          ),
          new ExportCurriculumRoute(repository),
          new ListModelsCurriculumRoute(),
        ];

        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        const jwtAuthMiddleware = createJwtAuthMiddleware(
          this.context.em,
          this.context.configuration.jwtSecret,
        );

        f.addHook("preValidation", jwtAuthMiddleware);

        for (const route of curriculumRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/curriculums" },
    );
  }
}

export class SectionTemplatesModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: SectionTemplatesLibraryContext) {}

  public static init(context: SectionTemplatesLibraryContext): SectionTemplatesModule {
    return new SectionTemplatesModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const repository = this.context.em.getRepository(SectionTemplatesEntity);

    await fastify.register(
      async (f) => {
        const sectionTemplateRoutes: Route<FastifyInstanceTypeForModule>[] = [
          new ListSectionTemplatesRoute(repository),
        ];

        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        const jwtAuthMiddleware = createJwtAuthMiddleware(
          this.context.em,
          this.context.configuration.jwtSecret,
        );

        f.addHook("preValidation", jwtAuthMiddleware);

        for (const route of sectionTemplateRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/section-templates" },
    );
  }
}

export class SectionsModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: SectionTemplatesLibraryContext) {}

  public static init(context: SectionTemplatesLibraryContext): SectionsModule {
    return new SectionsModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const repository = this.context.em.getRepository(SectionsEntity);

    await fastify.register(
      async (f) => {
        const sectionsRoutes: Route<FastifyInstanceTypeForModule>[] = [
          new GetSectionsRoute(repository, this.context.em.getRepository(CurriculumEntity)),
          new CreateSectionsRoute(
            repository,
            this.context.em.getRepository(CurriculumEntity),
            this.context.em.getRepository(SectionTemplatesEntity),
          ),
          new UpdateSectionsRoute(repository),
          new DeleteSectionsRoute(repository),
          new UpdateReorderSectionsRoute(
            repository,
            this.context.em.getRepository(CurriculumEntity),
          ),
        ];

        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        const jwtAuthMiddleware = createJwtAuthMiddleware(
          this.context.em,
          this.context.configuration.jwtSecret,
        );

        f.addHook("preValidation", jwtAuthMiddleware);

        for (const route of sectionsRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/curriculums/:curriculumId/sections" },
    );
  }
}

export class SectionItemsModule implements ModuleInterface<FastifyInstanceTypeForModule> {
  private constructor(private context: SectionTemplatesLibraryContext) {}

  public static init(context: SectionTemplatesLibraryContext): SectionItemsModule {
    return new SectionItemsModule(context);
  }

  public async setupRoutes(fastify: FastifyInstanceTypeForModule): Promise<void> {
    const repository = this.context.em.getRepository(SectionItemsEntity);

    await fastify.register(
      async (f) => {
        const sectionsRoutes: Route<FastifyInstanceTypeForModule>[] = [
          new CreateSectionItemRoute(repository, this.context.em.getRepository(SectionsEntity)),
          new UpdateSectionItemRoute(repository),
          new DeleteSectionItemRoute(repository),
          new ReorderSectionItemsRoute(repository, this.context.em.getRepository(SectionsEntity)),
          new UploadPdpRoute(repository),
          new GetPdpRoute(repository),
        ];

        f.setErrorHandler((error, request, reply) => {
          handleJsonApiErrors(error, request, reply);
        });

        const jwtAuthMiddleware = createJwtAuthMiddleware(
          this.context.em,
          this.context.configuration.jwtSecret,
        );

        f.addHook("preValidation", jwtAuthMiddleware);

        for (const route of sectionsRoutes) {
          route.routeDefinition(f);
        }
      },
      { prefix: "/curriculums/:curriculumId/sections/:sectionId/items" },
    );
  }
}
