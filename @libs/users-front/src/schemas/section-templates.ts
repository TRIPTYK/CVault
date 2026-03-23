import {
  withDefaults,
  type WithLegacy,
} from '@warp-drive/legacy/model/migration-support';
import type { Type } from '@warp-drive/core/types/symbols';

const SectionTemplatesSchema = withDefaults({
  type: 'section-templates',
  fields: [
    { name: 'label', kind: 'attribute' },
    { name: 'position', kind: 'attribute' },
    { name: 'jsonSchema', kind: 'attribute' },
  ],
});

export default SectionTemplatesSchema;

export type SectionTemplates = WithLegacy<{
  label: string;
  position: number;
  jsonSchema: SchemaField[];
  [Type]: 'section-templates';
}>;

export interface SchemaField {
  key: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea';
  label: string;
}
