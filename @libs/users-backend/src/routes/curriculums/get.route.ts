import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import {
  jsonApiSerializeSingleCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class GetCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/:id",
      {
        schema: {
          params: object({
            id: string(),
          }),
          response: {
            200: object({
              data: SerializedCurriculumSchema,
            }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params as { id: string };

        const curriculum = await this.curriculumRepository.findOne({ id });

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `Curriculum with id ${id} not found`,
            }),
          );
        }

        return reply.send(jsonApiSerializeSingleCurriculumDocument(curriculum));
      },
    );
  }
}
