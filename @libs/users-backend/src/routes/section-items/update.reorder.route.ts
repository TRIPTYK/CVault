import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string, array } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import type { SectionEntityType } from "#src/entities/sections.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class ReorderSectionItemsRoute implements Route {
  public constructor(
    private sectionItemRepository: EntityRepository<SectionItemEntityType>,
    private sectionRepository: EntityRepository<SectionEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.patch(
      "/reorder",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string() }),
          body: object({
            data: object({
              attributes: object({
                order: array(string()),
              }),
            }),
          }),
          response: {
            204: object({}),
            400: jsonApiErrorDocumentSchema,
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId, sectionId } = request.params as {
          curriculumId: string;
          sectionId: string;
        };
        const { order } = request.body.data.attributes;

        const section = await this.sectionRepository.findOne({
          id: sectionId,
          curriculum: { id: curriculumId, userId: currentUser.id },
        });

        if (!section) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_NOT_FOUND",
              detail: `No section found with id ${sectionId} in curriculum ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        const items = await this.sectionItemRepository.find({
          section: sectionId,
        });

        const itemMap = new Map(items.map((i) => [i.id, i]));

        if (order.length !== items.length) {
          return reply.code(400).send(
            makeJsonApiError(400, "Bad Request", {
              code: "INVALID_ORDER",
              detail: `Order must contain exactly ${items.length} item ids, got ${order.length}`,
            }),
          );
        }

        for (const itemId of order) {
          if (!itemMap.has(itemId)) {
            return reply.code(400).send(
              makeJsonApiError(400, "Bad Request", {
                code: "INVALID_ITEM_ID",
                detail: `Item with id ${itemId} does not belong to section ${sectionId} in curriculum ${curriculumId}`,
              }),
            );
          }
        }

        for (const [index, itemId] of order.entries()) {
          itemMap.get(itemId)!.position = index;
        }

        await this.sectionItemRepository.getEntityManager().flush();

        return reply.code(204).send({});
      },
    );
  }
}
