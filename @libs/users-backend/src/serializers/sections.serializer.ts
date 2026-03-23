import type { SectionEntityType } from "#src/entities/sections.entity.js";
import { object, string, number } from "zod";
import { z } from "zod";
import { makeJsonApiDocumentSchema } from "@libs/backend-shared";

export const SerializedSectionsSchema = makeJsonApiDocumentSchema(
  "sections",
  object({
    curriculumId: string(),
    templateId: string(),
    title: string(),
    position: number(),
  }),
);

export function jsonApiSerializeSection(
  section: SectionEntityType,
): z.infer<typeof SerializedSectionsSchema> {
  return {
    id: section.id,
    type: "sections" as const,
    attributes: {
      curriculumId: section.curriculum.id,
      templateId: section.template.id,
      title: section.title,
      position: section.position,
    },
  };
}

export function jsonApiSerializeManySections(sections: SectionEntityType[]) {
  return sections.map(jsonApiSerializeSection);
}

export function jsonApiSerializeSingleSectionDocument(section: SectionEntityType) {
  return {
    data: jsonApiSerializeSection(section),
  };
}

export function jsonApiSerializeManySectionsDocument(sections: SectionEntityType[]) {
  return {
    data: jsonApiSerializeManySections(sections),
  };
}
