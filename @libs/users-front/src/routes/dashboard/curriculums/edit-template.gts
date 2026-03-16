import type { TOC } from '@ember/component/template-only';
import type CurriculumsEdit from './edit.gts';
import CurriculumEditSection from '#src/components/curriculums/edit/curriculum-edit-section.gts';

export default <template>
  <CurriculumEditSection @curriculumId={{@model.id}} />
</template> as TOC<{
  model: Awaited<ReturnType<CurriculumsEdit['model']>>;
  controller: undefined;
}>
