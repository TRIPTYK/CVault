import CurriculumList from '#src/components/curriculums/curriculum-list.gts';
import type { TOC } from '@ember/component/template-only';
import type CurriculumsIndex from './index.gts';
import curriculumsList from '#src/models/curriculums/curriculums-list.mock.ts';

export default <template>
  <CurriculumList @curriculums={{curriculumsList.curriculums}} />
</template> as TOC<{
  model: Awaited<ReturnType<CurriculumsIndex['model']>>;
  controller: undefined;
}>
