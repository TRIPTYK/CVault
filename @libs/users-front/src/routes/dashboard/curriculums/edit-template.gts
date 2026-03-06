import type { TOC } from '@ember/component/template-only';
import type CurriculumsEdit from './edit.gts';

import CurriculumPreview from '#src/components/curriculums/edit/curriculum-preview.gts';
import CurriculumEditView from '#src/components/curriculums/edit/curriculum-edit-view.gts';

export default <template>
  <CurriculumEditView />
  <CurriculumPreview />
</template> as TOC<{
  model: Awaited<ReturnType<CurriculumsEdit['model']>>;
  controller: undefined;
}>
