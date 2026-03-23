import {
  withDefaults,
  type WithLegacy,
} from '@warp-drive/legacy/model/migration-support';
import type { Type } from '@warp-drive/core/types/symbols';

const SectionItemsSchema = withDefaults({
  type: 'section-items',
  fields: [
    { name: 'sectionId', kind: 'attribute' },
    { name: 'position', kind: 'attribute' },
    { name: 'jsonData', kind: 'attribute' },
  ],
});

export default SectionItemsSchema;

export type SectionItems = WithLegacy<{
  sectionId: string;
  position: number;
  jsonData: Record<string, string>;
  [Type]: 'section-items';
}>;
