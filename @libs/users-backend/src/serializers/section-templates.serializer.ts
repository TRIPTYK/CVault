import type { SectionTemplatesEntityType } from "#src/entities/section-templates.entity.ts";
import { object, string, number } from "zod";
import { z } from "zod";
import { makeJsonApiDocumentSchema } from "@libs/backend-shared";

export const SerializedSectionTemplateSchema = makeJsonApiDocumentSchema(
  "section-templates",
  object({
    label: string(),
    jsonSchema: z.any(),
    position: number(),
  }),
);

export function jsonApiSerializeSectionTemplate(
  sectionTemplate: SectionTemplatesEntityType,
): z.infer<typeof SerializedSectionTemplateSchema> {
  return {
    id: sectionTemplate.id,
    type: "section-templates" as const,
    attributes: {
      label: sectionTemplate.label,
      jsonSchema: sectionTemplate.jsonSchema,
      position: sectionTemplate.position,
    },
  };
}

export function jsonApiSerializeManySectionTemplates(
  sectionTemplates: SectionTemplatesEntityType[],
) {
  return sectionTemplates.map(jsonApiSerializeSectionTemplate);
}

export function jsonApiSerializeSingleSectionTemplateDocument(
  sectionTemplate: SectionTemplatesEntityType,
) {
  return {
    data: jsonApiSerializeSectionTemplate(sectionTemplate),
  };
}

export function jsonApiSerializeManySectionTemplatesDocument(
  sectionTemplates: SectionTemplatesEntityType[],
) {
  return {
    data: jsonApiSerializeManySectionTemplates(sectionTemplates),
  };
}
