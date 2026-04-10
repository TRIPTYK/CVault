import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import type { SectionEntityType } from "#src/entities/sections.entity.js";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import type { EntityRepository } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import {
  jsonApiSerializeSingleCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import {
  jsonApiErrorDocumentSchema,
  makeSingleJsonApiTopDocument,
  makeJsonApiError,
  type Route,
} from "@libs/backend-shared";
import { object, string } from "zod";
import fs from "fs";

export class DuplicateCurriculumRoute implements Route {
  public constructor(
    private curriculumRepository: EntityRepository<CurriculumEntityType>,
    private sectionsRepository: EntityRepository<SectionEntityType>,
    private SectionItemsRepository: EntityRepository<SectionItemEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/:id/duplicate",
      {
        schema: {
          params: object({
            id: string(),
          }),
          response: {
            200: makeSingleJsonApiTopDocument(SerializedCurriculumSchema),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params;
        const currentUser = request.user!;

        const original = await this.curriculumRepository.findOne(
          {
            id,
            userId: currentUser.id,
          },
          {
            populate: ["sections", "sections.items"],
          },
        );

        if (!original) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `A curriculum with id "${id}" was not found`,
            }),
          );
        }

        const duplicateTitle = `${original.title} (copy)`;

        const duplicate = this.curriculumRepository.create({
          id: randomUUID(),
          userId: currentUser.id,
          title: duplicateTitle,
          updatedAt: new Date(),
          createdAt: new Date(),
        });

        for (const section of original.sections) {
          const newSection = this.sectionsRepository.create({
            id: randomUUID(),
            curriculum: duplicate,
            template: section.template,
            title: section.title,
            position: section.position,
          });

          for (const item of section.items) {
            const newItem = this.SectionItemsRepository.create({
              id: randomUUID(),
              section: newSection,
              position: item.position,
              jsonData: item.jsonData,
            });

            const fields = item.jsonData as Record<string, string>;
            if (fields["profilePicture"] !== "" && fields["profilePicture"] !== undefined) {
              const oldFilePath = fields["profilePicture"] as string;
              const fileExtension = oldFilePath.split(".").pop();
              const newFileName = `${newItem.id}.${fileExtension}`;
              const newFilePath = `uploads/${newFileName}`;

              await fs.promises.copyFile(oldFilePath, newFilePath);

              fields["profilePicture"] = newFilePath;
            }

            newSection.items.add(newItem);
          }

          duplicate.sections.add(newSection);
        }

        await this.curriculumRepository.getEntityManager().persist(duplicate).flush();

        return reply.send(jsonApiSerializeSingleCurriculumDocument(duplicate));
      },
    );
  }
}
