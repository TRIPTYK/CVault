import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const ProposedSectionEntity = defineEntity({
  name: "ProposedSection",
  properties: {
    id: p.string().primary(),
    title: p.string(),
    position: p.integer(),
  },
});

export type ProposedSectionEntityType = InferEntity<typeof ProposedSectionEntity>;
