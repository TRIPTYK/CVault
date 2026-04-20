import type { FastifyInstanceTypeForModule } from "#src/init.js";
import type { EntityRepository } from "@mikro-orm/core";
import { object, string } from "zod";
import type { CurriculumEntityType } from "#src/entities/curriculum.entity.ts";
import { jsonApiErrorDocumentSchema, makeJsonApiError, type Route } from "@libs/backend-shared";
import renderCv from "#src/services/template.service.js";
import pdfService from "#src/services/pdf.service.js";
import { z } from "zod";

export class ExportCurriculumRoute implements Route {
  public constructor(private curriculumRepository: EntityRepository<CurriculumEntityType>) {}

  public routeDefinition(f: FastifyInstanceTypeForModule) {
    return f.get(
      "/:id/export",
      {
        schema: {
          params: object({
            id: string(),
          }),
          response: {
            200: z.instanceof(Buffer),
            404: jsonApiErrorDocumentSchema,
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params as { id: string };

        const curriculum = await this.curriculumRepository.findOne(
          { id },
          { populate: ["sections", "sections.template", "sections.items"] },
        );

        if (!curriculum) {
          return reply.code(404).send(
            makeJsonApiError(404, "Not Found", {
              code: "CURRICULUM_NOT_FOUND",
              detail: `Curriculum with id ${id} not found`,
            }),
          );
        }

        const html = await renderCv(curriculum.sections.getItems());
        const pdf = await pdfService.renderHtmlToPdf(html);

        return reply
          .code(200)
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", `attachment; filename="curriculum-${id}.pdf"`)
          .serializer((payload) => payload)
          .send(pdf);
      },
    );
  }
}
