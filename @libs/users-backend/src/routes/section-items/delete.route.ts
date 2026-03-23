import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class DeleteSectionItemRoute implements Route {
  public constructor(private sectionItemRepository: EntityRepository<SectionItemEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.delete(
      "/:itemId",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string(), itemId: string() }),
          response: {
            204: object({}),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId, sectionId, itemId } = request.params as {
          curriculumId: string;
          sectionId: string;
          itemId: string;
        };

        const item = await this.sectionItemRepository.findOne({
          id: itemId,
          section: { id: sectionId, curriculum: { id: curriculumId, userId: currentUser.id } },
        });

        if (!item) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_ITEM_NOT_FOUND",
              detail: `No item found with id ${itemId} in section ${sectionId} for curriculum ${curriculumId} for user ${currentUser.id}`,
            }),
          );
        }

        await this.sectionItemRepository.getEntityManager().remove(item).flush();

        return reply.code(204).send({});
      },
    );
  }
}
