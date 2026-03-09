import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const CurriculumEntity = defineEntity({
  name: "Curriculum",
  properties: {
    id: p.string().primary(),
    userId: p.string().index(),
    title: p.string(),
    updatedAt: p.datetime(),
  },
});

export type CurriculumEntityType = InferEntity<typeof CurriculumEntity>;
