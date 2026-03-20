import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, array } from "zod";
import {
  jsonApiSerializeManyProposedSectionDocument,
  SerializedProposedSectionSchema,
} from "#src/serializers/proposed-sections.serializer.js";
import type { ProposedSectionEntityType } from "#src/entities/proposed-sections.entity.ts";
import { type Route } from "@libs/backend-shared";

export class ListProposedSectionRoute implements Route {
  public constructor(
    private proposedSectionRepository: EntityRepository<ProposedSectionEntityType>,
  ) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/",
      {
        schema: {
          response: {
            200: object({
              data: array(SerializedProposedSectionSchema),
            }),
          },
        },
      },
      async (request, reply) => {
        const proposedSections = await this.proposedSectionRepository.findAll({
          orderBy: { position: "ASC" },
        });

        return reply.send(jsonApiSerializeManyProposedSectionDocument(proposedSections));
      },
    );
  }
}
