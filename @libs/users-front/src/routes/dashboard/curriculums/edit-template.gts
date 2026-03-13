import type { TOC } from '@ember/component/template-only';
import type CurriculumsEdit from './edit.gts';

import CurriculumPreview from '#src/components/curriculums/edit/curriculum-preview.gts';
import CurriculumEditView from '#src/components/curriculums/edit/curriculum-edit-view.gts';
import CurriculumEditTopBar from '#src/components/curriculums/edit/curriculum-edit-top-bar.gts';

export default <template>
  <div class="flex flex-col">
    <CurriculumEditTopBar />
    <div class="flex flex-row">
      <CurriculumEditView />
      <CurriculumPreview />
    </div>
  </div>
</template> as TOC<{
  model: Awaited<ReturnType<CurriculumsEdit['model']>>;
  controller: undefined;
}>
