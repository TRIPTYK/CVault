import {
  withDefaults,
  type WithLegacy,
} from '@warp-drive/legacy/model/migration-support';
import type { Type } from '@warp-drive/core/types/symbols';

const CurriculumSchema = withDefaults({
  type: 'curriculums',
  fields: [
    { name: 'updatedAt', kind: 'attribute' },
    { name: 'title', kind: 'attribute' },
    { name: 'userId', kind: 'attribute' },
    { name: 'createdAt', kind: 'attribute' },
  ],
});

export default CurriculumSchema;

export type Curriculum = WithLegacy<{
  updatedAt: string;
  title: string;
  userId: string;
  createdAt: string;
  [Type]: 'curriculums';
}>;
