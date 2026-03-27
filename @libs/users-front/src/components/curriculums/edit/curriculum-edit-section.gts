import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type CurriculumService from '#src/services/curriculum.ts';
import type { Curriculum } from '#src/schemas/curriculums.ts';
import CurriculumPreview from '#src/components/curriculums/edit/curriculum-preview.gts';
import CurriculumEditView from '#src/components/curriculums/edit/curriculum-edit-view.gts';
import CurriculumEditTopBar from '#src/components/curriculums/edit/curriculum-edit-top-bar.gts';
import type { SectionTemplates } from '#src/schemas/section-templates.ts';
import type { Sections } from '#src/schemas/sections.ts';

interface CurriculumEditSectionSignature {
  Element: HTMLDivElement;

  Args: {
    curriculumId: string;
  };
}

class CurriculumEditSection extends Component<CurriculumEditSectionSignature> {
  @service declare curriculum: CurriculumService;
  @tracked curriculumItem: Curriculum | null = null;
  @tracked sectionTemplates: SectionTemplates[] = [];
  @tracked sections: Sections[] = [];
  @tracked haveToUpdate = false;

  constructor(owner: Owner, args: CurriculumEditSectionSignature['Args']) {
    super(owner, args);
    void this.loadCurriculum();
  }

  loadCurriculum = async () => {
    this.curriculumItem = await this.curriculum.findOne(this.args.curriculumId);
  };

  loadSectionTemplates = async () => {
    this.sectionTemplates = await this.curriculum.findAllTemplates();
  };

  loadSections = async () => {
    this.sections = await this.curriculum.findAllSections(
      this.args.curriculumId
    );
  };

  onUpdate = () => {
    this.haveToUpdate = !this.haveToUpdate;
  };

  <template>
    <div class="flex flex-col h-[calc(100vh-115px)]">
      <CurriculumEditTopBar @curriculum={{this.curriculumItem}} />
      <div class="flex flex-row flex-1 overflow-hidden">
        <div class="flex-1 overflow-y-auto">
          <CurriculumEditView
            @curriculumId={{@curriculumId}}
            @onUpdate={{this.onUpdate}}
          />
        </div>
        <div class="flex-1 overflow-y-auto border-l">
          <CurriculumPreview
            @curriculumId={{@curriculumId}}
            @haveToUpdate={{this.haveToUpdate}}
          />
        </div>
      </div>
    </div>
  </template>
}

export default CurriculumEditSection;
