import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import { makeJsonApiError, type Route } from "@libs/backend-shared";
import fs from "fs";
import path from "path";

export class GetPdpRoute implements Route {
  public constructor(private sectionItemRepository: EntityRepository<SectionItemEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/:itemId/pdp/:fieldname",
      {
        schema: {
          params: object({
            curriculumId: string(),
            sectionId: string(),
            itemId: string(),
            fieldname: string(),
          }),
        },
      },
      async (request, reply) => {
        const currentUser = request.user!;
        const { curriculumId, sectionId, itemId, fieldname } = request.params as {
          curriculumId: string;
          sectionId: string;
          itemId: string;
          fieldname: string;
        };

        const item = await this.sectionItemRepository.findOne({
          id: itemId,
          section: { id: sectionId, curriculum: { id: curriculumId, userId: currentUser.id } },
        });

        if (!item) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_ITEM_NOT_FOUND",
              detail: `No item found with id ${itemId} for section with id ${sectionId} for curriculum with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        const jsonData = item.jsonData as Record<string, string> | null;
        const filePath = jsonData?.[fieldname];
        console.log("filePath", filePath);
        if (!filePath) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "FILE_NOT_FOUND",
              detail: `No file found for field "${fieldname}" on item with id ${itemId}`,
            }),
          );
        }

        if (!fs.existsSync(filePath)) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "FILE_NOT_FOUND",
              detail: `File for field "${fieldname}" no longer exists on disk`,
            }),
          );
        }

        const ext = path.extname(filePath).toLowerCase().slice(1);
        const mimeTypes: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
          pdf: "application/pdf",
        };
        const contentType = mimeTypes[ext] ?? "application/octet-stream";

        const stream = fs.createReadStream(filePath);
        return reply.type(contentType).send(stream);
      },
    );
  }
}
