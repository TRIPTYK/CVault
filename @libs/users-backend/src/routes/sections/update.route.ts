import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionEntityType } from "#src/entities/sections.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import {
  jsonApiSerializeSingleSectionDocument,
  SerializedSectionsSchema,
} from "#src/serializers/sections.serializer.js";

export class UpdateSectionsRoute implements Route {
  public constructor(private sectionRepository: EntityRepository<SectionEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.patch(
      "/:sectionId",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string() }),
          body: object({ title: string() }),
          response: {
            200: object({ data: SerializedSectionsSchema }),
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
        const { title } = request.body as { title: string };

        const section = await this.sectionRepository.findOne({
          id: sectionId,
          curriculum: { id: curriculumId, userId: currentUser.id },
        });

        if (!section) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_NOT_FOUND",
              detail: `No section found with id ${sectionId} for curriculum with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        section.title = title;

        await this.sectionRepository.getEntityManager().flush();

        return reply.send(jsonApiSerializeSingleSectionDocument(section));
      },
    );
  }
}
