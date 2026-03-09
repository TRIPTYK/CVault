import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import {
  jsonApiSerializeSingleCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import {
  jsonApiErrorDocumentSchema,
  makeJsonApiError,
  makeSingleJsonApiTopDocument,
  type Route,
} from "@libs/backend-shared";

export class UpdateCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.patch(
      "/:id",
      {
        schema: {
          params: object({
            id: string(),
          }),
          body: makeSingleJsonApiTopDocument(
            object({
              attributes: object({
                title: string(),
              }),
            }),
          ),
          response: {
            200: makeSingleJsonApiTopDocument(SerializedCurriculumSchema),
            404: jsonApiErrorDocumentSchema,
            409: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params as { id: string };
        const currentUser = request.user!;
        const { title } = request.body.data.attributes;

        const curriculum = await this.curriculumRepository.findOne({ id, userId: currentUser.id });

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `Curriculum with id ${id} not found`,
            }),
          );
        }

        const existingCurriculum = await this.curriculumRepository.findOne({
          userId: currentUser.id,
          title,
          id: { $ne: id },
        });

        if (existingCurriculum) {
          return reply.code(409).send(
            makeJsonApiError(409, "Conflict", {
              code: "CURRICULUM_ALREADY_EXISTS",
              detail: `A curriculum with title "${title}" already exists for this user`,
            }),
          );
        }

        curriculum.title = title;
        curriculum.updatedAt = new Date();

        await this.curriculumRepository.getEntityManager().flush();

        return reply.send(jsonApiSerializeSingleCurriculumDocument(curriculum));
      },
    );
  }
}
