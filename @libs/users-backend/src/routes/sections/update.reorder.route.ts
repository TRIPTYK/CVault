import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string, array } from "zod";
import type { SectionEntityType } from "#src/entities/sections.entity.ts";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class UpdateReorderSectionsRoute implements Route {
  public constructor(
    private sectionRepository: EntityRepository<SectionEntityType>,
    private curriculumRepository: EntityRepository<CurriculumEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.patch(
      "/reorder",
      {
        schema: {
          params: object({ curriculumId: string() }),
          body: object({ order: array(string()) }),
          response: {
            204: object({}),
            400: jsonApiErrorDocumentSchema,
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId } = request.params as { curriculumId: string };
        const { order } = request.body as { order: string[] };

        const curriculum = await this.curriculumRepository.findOne({
          id: curriculumId,
          userId: currentUser.id,
        });

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `No curriculum found with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        const sections = await this.sectionRepository.find({
          curriculum: curriculumId,
        });

        const sectionMap = new Map(sections.map((s) => [s.id, s]));

        if (order.length !== sections.length) {
          return reply.code(400).send(
            makeJsonApiError(400, "Bad Request", {
              code: "INVALID_ORDER",
              detail: `Order must contain exactly ${sections.length} section ids, got ${order.length}`,
            }),
          );
        }

        for (const sectionId of order) {
          if (!sectionMap.has(sectionId)) {
            return reply.code(400).send(
              makeJsonApiError(400, "Bad Request", {
                code: "INVALID_SECTION_ID",
                detail: `Section with id ${sectionId} does not belong to curriculum ${curriculumId}`,
              }),
            );
          }
        }

        for (const [index, sectionId] of order.entries()) {
          sectionMap.get(sectionId)!.position = index;
        }

        await this.sectionRepository.getEntityManager().flush();

        return reply.code(204).send({});
      },
    );
  }
}
