import type { SectionItemEntityType } from "#src/entities/section-items.entity.js";
import { object, string } from "zod";
import { z } from "zod";
import { makeJsonApiDocumentSchema } from "@libs/backend-shared";

export const SerializedSectionItemSchema = makeJsonApiDocumentSchema(
  "section-items",
  object({
    sectionId: string(),
    position: z.number(),
    jsonData: z.record(string(), string()),
  }),
);

export function jsonApiSerializeSectionItem(
  sectionItem: SectionItemEntityType,
): z.infer<typeof SerializedSectionItemSchema> {
  return {
    id: sectionItem.id,
    type: "section-items" as const,
    attributes: {
      sectionId: sectionItem.section.id,
      position: sectionItem.position,
      jsonData: sectionItem.jsonData as Record<string, string>,
    },
  };
}

export function jsonApiSerializeManySectionItems(sectionItems: SectionItemEntityType[]) {
  return sectionItems.map(jsonApiSerializeSectionItem);
}

export function jsonApiSerializeSingleSectionItemDocument(sectionItem: SectionItemEntityType) {
  return {
    data: jsonApiSerializeSectionItem(sectionItem),
  };
}

export function jsonApiSerializeManySectionItemDocument(sectionItems: SectionItemEntityType[]) {
  return {
    data: jsonApiSerializeManySectionItems(sectionItems),
  };
}
