import { Cascade, defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { CurriculumEntity } from "./curriculum.entity.ts";
import { SectionItemsEntity } from "./section-items.entity.ts";
import { SectionTemplatesEntity } from "./section-templates.entity.ts";

export const SectionsEntity = defineEntity({
  name: "Sections",
  properties: {
    id: p.string().primary(),
    curriculum: () => p.manyToOne(CurriculumEntity).inversedBy("sections").deleteRule("cascade"),
    template: () => p.manyToOne(SectionTemplatesEntity),
    title: p.string(),
    position: p.integer(),
    items: () => p.oneToMany(SectionItemsEntity).mappedBy("section").cascade(Cascade.ALL),
    isActive: p.boolean(),
  },
});

export type SectionEntityType = InferEntity<typeof SectionsEntity>;
