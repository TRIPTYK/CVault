import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import {
  SerializedSectionItemSchema,
  jsonApiSerializeSingleSectionItemDocument,
} from "#src/serializers/section-items.serializer.js";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";
import path from "path";

const pump = util.promisify(pipeline);

type TemplateField = { key: string; label: string; type: string };

function parseTemplateSchema(raw: unknown): TemplateField[] {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as TemplateField[]);
}

export class UploadPdpRoute implements Route {
  public constructor(private sectionItemRepository: EntityRepository<SectionItemEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.post(
      "/:itemId/pdp",
      {
        schema: {
          params: object({ curriculumId: string(), sectionId: string(), itemId: string() }),
          response: {
            200: object({ data: SerializedSectionItemSchema }),
            404: jsonApiErrorDocumentSchema,
            406: jsonApiErrorDocumentSchema,
            413: jsonApiErrorDocumentSchema,
            422: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const uploadDir = "uploads";
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const currentUser = request.user!;
        const { curriculumId, sectionId, itemId } = request.params as {
          curriculumId: string;
          sectionId: string;
          itemId: string;
        };

        const item = await this.sectionItemRepository.findOne(
          {
            id: itemId,
            section: { id: sectionId, curriculum: { id: curriculumId, userId: currentUser.id } },
          },
          { populate: ["section.template"] },
        );

        if (!item) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "SECTION_ITEM_NOT_FOUND",
              detail: `No item found with id ${itemId} for section with id ${sectionId} for curriculum with id ${curriculumId} belonging to user with id ${currentUser.id}`,
            }),
          );
        }

        const templateSchema = parseTemplateSchema(item.section.template.jsonSchema);
        const fileFields = new Set(
          templateSchema.filter((f) => f.type === "file").map((f) => f.key),
        );

        const uploadedFiles: Record<string, string> = {};
        const unknownKeys: string[] = [];

        const parts = (request as any).parts();

        for await (const part of parts) {
          if (part.type === "file") {
            if (!fileFields.has(part.fieldname)) {
              unknownKeys.push(part.fieldname);
              part.file.resume();
              continue;
            }

            const ext = path.extname(part.filename);
            const savedFilename = `${itemId}-${part.fieldname}${ext}`;
            const savePath = path.join("uploads", savedFilename);

            await pump(part.file, fs.createWriteStream(savePath));
            uploadedFiles[part.fieldname] = savePath;
          }
        }

        if (unknownKeys.length > 0) {
          return reply.code(422).send(
            makeJsonApiError(422, "Unprocessable Entity", {
              code: "INVALID_JSON_DATA",
              detail: `Unknown file fields: ${unknownKeys.join(", ")}`,
            }),
          );
        }

        if (Object.keys(uploadedFiles).length > 0) {
          item.jsonData = {
            ...(item.jsonData as Record<string, string>),
            ...uploadedFiles,
          };

          await this.sectionItemRepository.getEntityManager().flush();
        }

        const updatedItem = await this.sectionItemRepository.findOneOrFail(
          { id: itemId },
          { populate: ["section.template"] },
        );

        return reply.send(jsonApiSerializeSingleSectionItemDocument(updatedItem));
      },
    );
  }
}
