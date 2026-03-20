import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import type { EntityRepository } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import {
  jsonApiSerializeSingleCurriculumDocument,
  SerializedCurriculumSchema,
} from "#src/serializers/curriculum.serializer.js";
import { makeSingleJsonApiTopDocument, type Route } from "@libs/backend-shared";

export class CreateCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/",
      {
        schema: {
          response: {
            200: makeSingleJsonApiTopDocument(SerializedCurriculumSchema),
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;

        const curriculum = this.curriculumRepository.create({
          id: randomUUID(),
          userId: currentUser.id,
          title: "New Curriculum",
          updatedAt: new Date(),
          createdAt: new Date(),
        });

        await this.curriculumRepository.getEntityManager().flush();

        return reply.send(jsonApiSerializeSingleCurriculumDocument(curriculum));
      },
    );
  }
}
