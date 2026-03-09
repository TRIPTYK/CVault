import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import type { EntityRepository } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import {
  jsonApiSerializeSingleCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import { object, string } from "zod";
import {
  jsonApiErrorDocumentSchema,
  makeJsonApiError,
  makeSingleJsonApiTopDocument,
  type Route,
} from "@libs/backend-shared";

export class CreateCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/",
      {
        schema: {
          body: makeSingleJsonApiTopDocument(
            object({
              id: string().optional().nullable(),
              attributes: object({
                title: string(),
              }),
            }),
          ),
          response: {
            200: makeSingleJsonApiTopDocument(SerializedCurriculumSchema),
            409: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const body = request.body.data.attributes;
        const currentUser = request.user!;

        const existingCurriculum = await this.curriculumRepository.findOne({
          userId: currentUser.id,
          title: body.title,
        });

        if (existingCurriculum) {
          return reply.code(409).send(
            makeJsonApiError(409, "Conflict", {
              code: "CURRICULUM_ALREADY_EXISTS",
              detail: `A curriculum with title "${body.title}" already exists for this user`,
            }),
          );
        }

        const curriculum = this.curriculumRepository.create({
          id: request.body.data.id || randomUUID(),
          userId: currentUser.id,
          title: body.title,
          updatedAt: new Date(),
        });

        await this.curriculumRepository.getEntityManager().flush();

        return reply.send(jsonApiSerializeSingleCurriculumDocument(curriculum));
      },
    );
  }
}
