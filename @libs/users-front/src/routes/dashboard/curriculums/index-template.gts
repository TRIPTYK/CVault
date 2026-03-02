import CurriculumList from '#src/components/curriculums/curriculum-list.gts';
import type { TOC } from '@ember/component/template-only';
import type CurriculumsIndex from './index.gts';

export default <template><CurriculumList /></template> as TOC<{
  model: Awaited<ReturnType<CurriculumsIndex['model']>>;
  controller: undefined;
}>
