import type { TOC } from '@ember/component/template-only';
import type CurriculumsCreate from './create.gts';
import CurriculumCreateForm from '#src/components/curriculums/create/curriculum-create-form.gts';

export default <template>
    <CurriculumCreateForm />
</template> as TOC<{
  model: Awaited<ReturnType<CurriculumsCreate['model']>>;
  controller: undefined;
}>
