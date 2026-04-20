import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import renderCv from '#src/helpers/cv-renderer.ts';
import type CurriculumService from '#src/services/curriculum.ts';
import type { Sections } from '#src/schemas/sections.ts';
import { t, type IntlService } from 'ember-intl';
import { on } from '@ember/modifier';

interface CurriculumPreviewSignature {
  Args: { curriculumId: string; haveToUpdate: boolean };
}

const egal = (a: string, b: string) => a === b;

class CurriculumPreview extends Component<CurriculumPreviewSignature> {
  @service declare curriculum: CurriculumService;
  @service declare intl: IntlService;
  @tracked renderedHtml = '';
  @tracked selectedTemplate = '';
  @tracked models: string[] = [];

  constructor(owner: Owner, args: CurriculumPreviewSignature['Args']) {
    super(owner, args);
    void this.loadModels();
  }

  get triggerUpdate() {
    if (this.args.haveToUpdate) {
      void this.render();
    }
    return null;
  }

  loadModels = async () => {
    this.models = await this.curriculum.listModels();
    this.selectedTemplate = this.models[0] ?? '';
    this.curriculum.setModel(this.selectedTemplate);
    await this.render();
  };

  @action
  onTemplateChange(event: Event) {
    this.selectedTemplate = (event.target as HTMLSelectElement).value;
    this.curriculum.setModel(this.selectedTemplate);
    void this.render();
  }

  render = async () => {
    const sections: Sections[] = await this.curriculum.findAllSections(
      this.args.curriculumId
    );

    for (const section of sections) {
      for (const item of section.items) {
        for (const [key, value] of Object.entries(item.jsonData)) {
          if (key === 'profilePicture' && value !== '' && value !== null) {
            const res = await this.curriculum.getFile(
              this.args.curriculumId,
              section.id!,
              item.id,
              key
            );
            item.jsonData[key] = res;
          }
        }
      }
    }

    this.renderedHtml = await renderCv(sections, this.selectedTemplate);
  };

  <template>
    {{this.triggerUpdate}}
    <div class="cv-preview-container">
      {{! template-lint-disable no-triple-curlies }}
      {{{this.renderedHtml}}}
    </div>
    <div
      class="flex items-center rounded-lg gap-4 px-6 py-3 bg-white border-t border-gray-300 m-4 sticky bottom-0 z-10"
    >
      <label
        class="text-sm text-gray-400 whitespace-nowrap"
        for="template-select"
      >{{t "curriculums.edit.selectTemplate"}}</label>
      <select
        id="template-select"
        class="bg-gray-400 text-gray-100 border border-gray-400 rounded-md px-3 py-1.5 text-sm cursor-pointer focus:outline-none"
        {{on "change" this.onTemplateChange}}
      >
        {{#each this.models as |model|}}
          <option
            value={{model}}
            selected={{egal model this.selectedTemplate}}
          >{{model}}</option>
        {{/each}}
      </select>
    </div>
  </template>
}

export default CurriculumPreview;
