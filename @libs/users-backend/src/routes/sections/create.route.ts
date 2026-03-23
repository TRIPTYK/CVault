import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionEntityType } from "#src/entities/sections.entity.ts";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import {
  jsonApiSerializeSingleSectionDocument,
  SerializedSectionsSchema,
} from "#src/serializers/sections.serializer.js";
import { randomUUID } from "crypto";
import type { SectionTemplatesEntityType } from "#src/entities/section-templates.entity.ts";

export class CreateSectionsRoute implements Route {
  public constructor(
    private sectionRepository: EntityRepository<SectionEntityType>,
    private curriculumRepository: EntityRepository<CurriculumEntityType>,
    private sectionTemplatesRepository: EntityRepository<SectionTemplatesEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/",
      {
        schema: {
          params: object({ curriculumId: string() }),
          body: object({
            data: object({
              attributes: object({
                templateId: string(),
                title: string(),
              }),
            }),
          }),
          response: {
            201: object({ data: SerializedSectionsSchema }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId } = request.params as { curriculumId: string };
        const { templateId, title } = request.body.data.attributes as {
          templateId: string;
          title: string;
        };

        const curriculum = await this.curriculumRepository.findOne({
          id: curriculumId,
          userId: currentUser.id,
        });

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `No curriculum found with id ${curriculumId}`,
            }),
          );
        }

        const template = await this.sectionTemplatesRepository.findOne({ id: templateId });

        if (!template) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_TEMPLATE_NOT_FOUND",
              detail: `No section template found with id ${templateId}`,
            }),
          );
        }

        const section = this.sectionRepository.create({
          id: randomUUID(),
          curriculum,
          template: template,
          title,
          position: await this.sectionRepository.count({ curriculum: curriculumId }),
        });

        await this.sectionRepository.getEntityManager().persist(section).flush();

        const savedSection = await this.sectionRepository.findOneOrFail(
          { id: section.id },
          { populate: ["template"] },
        );

        return reply.code(201).send(jsonApiSerializeSingleSectionDocument(savedSection));
      },
    );
  }
}
