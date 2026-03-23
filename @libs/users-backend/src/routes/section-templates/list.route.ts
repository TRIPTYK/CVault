import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, array } from "zod";
import {
  jsonApiSerializeManySectionTemplatesDocument,
  SerializedSectionTemplateSchema,
} from "#src/serializers/section-templates.serializer.js";
import type { SectionTemplatesEntityType } from "#src/entities/section-templates.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class ListSectionTemplatesRoute implements Route {
  public constructor(
    private sectionTemplatesRepository: EntityRepository<SectionTemplatesEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/",
      {
        schema: {
          response: {
            200: object({
              data: array(SerializedSectionTemplateSchema),
            }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const sectionTemplates = await this.sectionTemplatesRepository.findAll({
          orderBy: { position: "ASC" },
        });

        if (!sectionTemplates.length) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_TEMPLATES_NOT_FOUND",
              detail: `No section templates found`,
            }),
          );
        }

        return reply.send(jsonApiSerializeManySectionTemplatesDocument(sectionTemplates));
      },
    );
  }
}
