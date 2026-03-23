import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string, number, array, record, unknown } from "zod";
import type { SectionEntityType } from "#src/entities/sections.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

// Devrais être un list route, car récupère tous les sections d'un curriculum, pas une section spécifique.

export class GetSectionsRoute implements Route {
  public constructor(private sectionRepository: EntityRepository<SectionEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/",
      {
        schema: {
          params: object({
            curriculumId: string(),
          }),
          response: {
            200: object({
              data: array(
                object({
                  id: string(),
                  type: string(),
                  attributes: object({
                    curriculumId: string(),
                    templateId: string(),
                    title: string(),
                    position: number(),
                    items: array(
                      object({
                        id: string(),
                        position: number(),
                        jsonData: record(string(), unknown()),
                      }),
                    ),
                  }),
                }),
              ),
            }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId } = request.params as { curriculumId: string };

        const sections = await this.sectionRepository.find(
          {
            curriculum: {
              id: curriculumId,
              userId: currentUser.id,
            },
          },
          {
            populate: ["template", "items"],
            orderBy: { position: "ASC", items: { position: "ASC" } },
          },
        );

        if (!sections.length) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `No curriculum found with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        const data = sections.map((section) => ({
          id: section.id,
          type: "sections" as const,
          attributes: {
            curriculumId: curriculumId,
            templateId: section.template.id,
            title: section.title,
            position: section.position,
            items: section.items.map((item) => ({
              id: item.id,
              position: item.position,
              jsonData: item.jsonData as Record<string, unknown>,
            })),
          },
        }));

        return reply.send({ data });
      },
    );
  }
}
