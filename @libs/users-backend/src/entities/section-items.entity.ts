import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { SectionsEntity } from "./sections.entity.ts";

export const SectionItemsEntity = defineEntity({
  name: "SectionItems",
  properties: {
    id: p.string().primary(),
    section: () => p.manyToOne(SectionsEntity).inversedBy("items").deleteRule("cascade"),
    position: p.integer(),
    jsonData: p.json(),
  },
});

export type SectionItemEntityType = InferEntity<typeof SectionItemsEntity>;
