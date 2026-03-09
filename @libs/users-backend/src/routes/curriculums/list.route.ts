import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, array } from "zod";
import {
  jsonApiSerializeManyCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class ListCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/",
      {
        schema: {
          response: {
            200: object({
              data: array(SerializedCurriculumSchema),
            }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;

        const curriculums = await this.curriculumRepository.find({
          userId: currentUser.id,
        });

        if (!curriculums.length) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUMS_NOT_FOUND",
              detail: `No curriculums found for user with id ${currentUser.id}`,
            }),
          );
        }

        return reply.send(jsonApiSerializeManyCurriculumDocument(curriculums));
      },
    );
  }
}
