import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { renderCv } from '#src/helpers/cv-renderer.ts';
import type CurriculumService from '#src/services/curriculum.ts';
import type { Sections } from '#src/schemas/sections.ts';

interface CurriculumPreviewSignature {
  Args: { curriculumId: string; haveToUpdate: boolean };
}

class CurriculumPreview extends Component<CurriculumPreviewSignature> {
  @service declare curriculum: CurriculumService;
  @tracked renderedHtml = '';

  constructor(owner: Owner, args: CurriculumPreviewSignature['Args']) {
    super(owner, args);
    void this.render();
  }

  updateHaveToUpdate(value: boolean) {
    console.log('Updating haveToUpdate to:', value);
    void this.render();
  }

  get triggerUpdate() {
    if (this.args.haveToUpdate) {
      void this.render();
    }
    return null;
  }

  render = async () => {
    const sections: Sections[] = await this.curriculum.findAllSections(
      this.args.curriculumId
    );
    this.renderedHtml = await renderCv(sections); // <-- await ajouté
  };

  <template>
    {{this.triggerUpdate}}
    <div class="cv-preview-container">
      {{! template-lint-disable no-triple-curlies }}
      {{{this.renderedHtml}}}
    </div>
  </template>
}

export default CurriculumPreview;
