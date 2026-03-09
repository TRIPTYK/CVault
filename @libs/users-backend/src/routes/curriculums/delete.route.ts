import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class DeleteCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.delete(
      "/:id",
      {
        schema: {
          params: object({
            id: string(),
          }),
          response: {
            204: object({}),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params as { id: string };
        const currentUser = request.user!;

        const curriculum = await this.curriculumRepository.findOne({ id, userId: currentUser.id });

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `Curriculum with id ${id} not found`,
            }),
          );
        }

        await this.curriculumRepository.getEntityManager().removeAndFlush(curriculum);

        return reply.code(204).send({});
      },
    );
  }
}
