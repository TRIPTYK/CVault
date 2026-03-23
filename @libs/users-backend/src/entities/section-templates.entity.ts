import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const SectionTemplatesEntity = defineEntity({
  name: "SectionTemplates",
  properties: {
    id: p.string().primary(),
    label: p.string(),
    jsonSchema: p.json(),
    position: p.integer(),
  },
});

export type SectionTemplatesEntityType = InferEntity<typeof SectionTemplatesEntity>;
