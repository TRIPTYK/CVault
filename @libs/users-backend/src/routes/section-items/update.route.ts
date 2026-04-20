import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string, record } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import {
  SerializedSectionItemSchema,
  jsonApiSerializeSingleSectionItemDocument,
} from "#src/serializers/section-items.serializer.js";

type TemplateField = { key: string; label: string; type: string };

function parseTemplateSchema(raw: unknown): TemplateField[] {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as TemplateField[]);
}

export class UpdateSectionItemRoute implements Route {
  public constructor(private sectionItemRepository: EntityRepository<SectionItemEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.patch(
      "/:itemId",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string(), itemId: string() }),
          body: object({
            data: object({
              attributes: record(string(), string()),
            }),
          }),
          response: {
            200: object({ data: SerializedSectionItemSchema }),
            404: jsonApiErrorDocumentSchema,
            422: jsonApiErrorDocumentSchema,
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
        const { attributes } = request.body.data;

        const item = await this.sectionItemRepository.findOne(
          {
            id: itemId,
            section: { id: sectionId, curriculum: { id: curriculumId, userId: currentUser.id } },
          },
          { populate: ["section.template"] },
        );

        if (!item) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_ITEM_NOT_FOUND",
              detail: `No item found with id ${itemId} for section with id ${sectionId} for curriculum with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        if (attributes) {
          if ('profilePicture' in attributes) {
            delete attributes['profilePicture'];
          }
          const templateSchema = parseTemplateSchema(item.section.template.jsonSchema);
          const allowedKeys = new Set(templateSchema.map((f) => f.key));
          const unknownKeys = Object.keys(attributes).filter((key) => !allowedKeys.has(key));

          if (unknownKeys.length > 0) {
            return reply.code(422).send(
              makeJsonApiError(422, "Unprocessable Entity", {
                code: "INVALID_JSON_DATA",
                detail: `Unknown fields: ${unknownKeys.join(", ")}`,
              }),
            );
          }

          item.jsonData = { ...(item.jsonData as Record<string, string>), ...attributes };
        }

        await this.sectionItemRepository.getEntityManager().flush();

        const updatedItem = await this.sectionItemRepository.findOneOrFail(
          { id: itemId },
          { populate: ["section.template"] },
        );

        return reply.send(jsonApiSerializeSingleSectionItemDocument(updatedItem));
      },
    );
  }
}
