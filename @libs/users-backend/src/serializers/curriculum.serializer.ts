import type { CurriculumEntityType } from "#src/entities/curriculum.entity.js";
import { object, string } from "zod";
import { z } from "zod";
import { makeJsonApiDocumentSchema } from "@libs/backend-shared";

export const SerializedCurriculumSchema = makeJsonApiDocumentSchema(
  "curriculums",
  object({
    userId: string(),
    title: string(),
    updatedAt: string(),
    createdAt: string(),
  }),
);

export function jsonApiSerializeCurriculum(
  curriculum: CurriculumEntityType,
): z.infer<typeof SerializedCurriculumSchema> {
  return {
    id: curriculum.id,
    type: "curriculums" as const,
    attributes: {
      userId: curriculum.userId,
      title: curriculum.title,
      updatedAt: curriculum.updatedAt.toISOString(),
      createdAt: curriculum.createdAt.toISOString(),
    },
  };
}

export function jsonApiSerializeManyCurriculums(curriculums: CurriculumEntityType[]) {
  return curriculums.map(jsonApiSerializeCurriculum);
}

export function jsonApiSerializeSingleCurriculumDocument(curriculum: CurriculumEntityType) {
  return {
    data: jsonApiSerializeCurriculum(curriculum),
  };
}

export function jsonApiSerializeManyCurriculumDocument(curriculums: CurriculumEntityType[]) {
  return {
    data: jsonApiSerializeManyCurriculums(curriculums),
  };
}
