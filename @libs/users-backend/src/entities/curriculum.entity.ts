import { Cascade, defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { SectionsEntity } from "./sections.entity.ts";

export const CurriculumEntity = defineEntity({
  name: "Curriculum",
  properties: {
    id: p.string().primary(),
    userId: p.string().index(),
    title: p.string(),
    updatedAt: p.datetime(),
    createdAt: p.datetime(),
    sections: () => p.oneToMany(SectionsEntity).mappedBy("curriculum").cascade(Cascade.ALL),
  },
});

export type CurriculumEntityType = InferEntity<typeof CurriculumEntity>;
