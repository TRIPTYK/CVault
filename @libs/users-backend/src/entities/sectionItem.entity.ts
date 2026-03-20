import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const SectionItemEntity = defineEntity({
  name: "SectionItem",
  properties: {
    id: p.string().primary(),
    sectionId: p.string().index(),
    position: p.integer(),
    jsonData: p.json(),
  },
});

export type SectionItemEntityType = InferEntity<typeof SectionItemEntity>;
