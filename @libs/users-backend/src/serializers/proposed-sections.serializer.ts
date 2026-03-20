import type { ProposedSectionEntityType } from "#src/entities/proposed-sections.entity.js";
import { object, string, number } from "zod";
import { z } from "zod";
import { makeJsonApiDocumentSchema } from "@libs/backend-shared";

export const SerializedProposedSectionSchema = makeJsonApiDocumentSchema(
  "proposed-sections",
  object({
    title: string(),
    position: number(),
  }),
);

export function jsonApiSerializeProposedSection(
  proposedSection: ProposedSectionEntityType,
): z.infer<typeof SerializedProposedSectionSchema> {
  return {
    id: proposedSection.id,
    type: "proposed-sections" as const,
    attributes: {
      title: proposedSection.title,
      position: proposedSection.position,
    },
  };
}

export function jsonApiSerializeManyProposedSections(
  proposedSections: ProposedSectionEntityType[],
) {
  return proposedSections.map(jsonApiSerializeProposedSection);
}

export function jsonApiSerializeSingleProposedSectionDocument(
  proposedSection: ProposedSectionEntityType,
) {
  return {
    data: jsonApiSerializeProposedSection(proposedSection),
  };
}

export function jsonApiSerializeManyProposedSectionDocument(
  proposedSections: ProposedSectionEntityType[],
) {
  return {
    data: jsonApiSerializeManyProposedSections(proposedSections),
  };
}
