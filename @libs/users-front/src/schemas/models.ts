import {
  withDefaults,
  type WithLegacy,
} from '@warp-drive/legacy/model/migration-support';
import type { Type } from '@warp-drive/core/types/symbols';

const ModelsSchema = withDefaults({
  type: 'models',
  fields: [{ name: 'id', kind: 'attribute' }],
});

export default ModelsSchema;

export type Model = WithLegacy<{
  id: string;
  [Type]: 'models';
}>;
