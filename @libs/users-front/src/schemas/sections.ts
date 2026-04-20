import {
  withDefaults,
  type WithLegacy,
} from '@warp-drive/legacy/model/migration-support';
import type { Type } from '@warp-drive/core/types/symbols';

const SectionsSchema = withDefaults({
  type: 'sections',
  fields: [
    { name: 'curriculumId', kind: 'attribute' },
    { name: 'templateId', kind: 'attribute' },
    { name: 'title', kind: 'attribute' },
    { name: 'position', kind: 'attribute' },
    { name: 'isActive', kind: 'attribute' },
    { name: 'items', kind: 'attribute' },
  ],
});

export default SectionsSchema;

export type Sections = WithLegacy<{
  curriculumId: string;
  templateId: string;
  title: string;
  position: number;
  isActive: boolean;
  items: Items[];
  [Type]: 'sections';
}>;

export interface Items {
  id: string;
  position: number;
  jsonData: Record<string, string>;
}
