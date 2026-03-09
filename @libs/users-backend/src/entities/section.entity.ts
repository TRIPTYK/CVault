import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const SectionEntity = defineEntity({
  name: "Section",
  properties: {
    id: p.string().primary(),
    curriculumId: p.string().index(),
    title: p.string(),
    position: p.integer(),
  },
});

export type SectionEntityType = InferEntity<typeof SectionEntity>;
