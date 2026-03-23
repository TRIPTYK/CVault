import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import type { SectionEntityType } from "#src/entities/sections.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import {
  SerializedSectionItemSchema,
  jsonApiSerializeSingleSectionItemDocument,
} from "#src/serializers/section-items.serializer.js";
import { randomUUID } from "crypto";

function initializeJsonDataFromSchema(
  schema: Array<{ key: string; label: string; type: string }>,
): Record<string, string> {
  return Object.fromEntries(schema.map((field) => [field.key, ""]));
}

export class CreateSectionItemRoute implements Route {
  public constructor(
    private sectionItemRepository: EntityRepository<SectionItemEntityType>,
    private sectionRepository: EntityRepository<SectionEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string() }),
          body: object({}).strict(),
          response: {
            201: object({ data: SerializedSectionItemSchema }),
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

        const section = await this.sectionRepository.findOne(
          {
            id: sectionId,
            curriculum: { id: curriculumId, userId: currentUser.id },
          },
          { populate: ["template"] },
        );

        if (!section) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_NOT_FOUND",
              detail: `No section found with id ${sectionId} for curriculum ${curriculumId} belonging to user ${currentUser.id}`,
            }),
          );
        }

        const templateSchema = section.template.jsonSchema as Array<{
          key: string;
          label: string;
          type: string;
        }>;

        const item = this.sectionItemRepository.create({
          id: randomUUID(),
          section: sectionId,
          position: await this.sectionItemRepository.count({ section: sectionId }),
          jsonData: initializeJsonDataFromSchema(templateSchema),
        });

        await this.sectionItemRepository.getEntityManager().persist(item).flush();

        return reply.code(201).send(jsonApiSerializeSingleSectionItemDocument(item));
      },
    );
  }
}
