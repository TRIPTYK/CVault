import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type CurriculumService from '#src/services/curriculum.ts';
import type { Curriculum } from '#src/schemas/curriculums.ts';
import CurriculumPreview from '#src/components/curriculums/edit/curriculum-preview.gts';
import CurriculumEditView from '#src/components/curriculums/edit/curriculum-edit-view.gts';
import CurriculumEditTopBar from '#src/components/curriculums/edit/curriculum-edit-top-bar.gts';

interface CurriculumEditSectionSignature {
  Element: HTMLDivElement;

  Args: {
    curriculumId: string;
  };
}

class CurriculumEditSection extends Component<CurriculumEditSectionSignature> {
  @service declare curriculum: CurriculumService;
  @tracked curriculumItem: Curriculum | null = null;

  constructor(owner: Owner, args: CurriculumEditSectionSignature['Args']) {
    super(owner, args);
    void this.loadCurriculum();
  }

  async loadCurriculum() {
    this.curriculumItem = await this.curriculum.findOne(this.args.curriculumId);
  }

  <template>
    <div class="flex flex-col">
      <CurriculumEditTopBar @curriculum={{this.curriculumItem}} />
      <div class="flex flex-row">
        <CurriculumEditView />
        <CurriculumPreview />
      </div>
    </div>
  </template>
}

export default CurriculumEditSection;
