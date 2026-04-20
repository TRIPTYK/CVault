import type { FastifyInstanceTypeForModule } from "#src/init.js";
import { object, array, string } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";

export class ListModelsCurriculumRoute implements Route {
  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/models",
      {
        schema: {
          response: {
            200: object({
              data: array(string()),
            }),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const templatesPath = path.join(process.cwd(), "src", "templates");

        const entries = await fs.readdir(templatesPath, { withFileTypes: true });
        const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

        if (!folders.length) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CV_TEMPLATES_NOT_FOUND",
              detail: "No CV templates found",
            }),
          );
        }

        return reply.send({ data: folders });
      },
    );
  }
}
