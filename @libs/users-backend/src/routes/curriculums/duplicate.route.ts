import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
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

export class DuplicateCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

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

        const original = await this.curriculumRepository.findOne({
          id,
          userId: currentUser.id,
        });

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

        await this.curriculumRepository.getEntityManager().flush();

        return reply.send(jsonApiSerializeSingleCurriculumDocument(duplicate));
      },
    );
  }
}
