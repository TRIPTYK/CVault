import Component from '@glimmer/component';
import CurriculumDropdownSection from '#src/components/curriculums/edit/curriculum-edit-section-dropdown.gts';
import CurriculumEditSectionItem from '#src/components/curriculums/edit/curriculum-edit-section-item.gts';
import type { SectionTemplates } from '#src/schemas/section-templates.ts';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';
import type { Sections } from '#src/schemas/sections.ts';
import type CurriculumService from '#src/services/curriculum.ts';
import { service } from '@ember/service';
import { fn } from '@ember/helper';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface CurriculumEditViewSignature {
  Element: HTMLDivElement;
  Args: {
    curriculumId: string;
    onUpdate: () => void;
  };
}

const isSectionInTemplate = (sections: Sections[], templateId: string | null) =>
  sections.some((s) => s.templateId === templateId);

class CurriculumEditView extends Component<CurriculumEditViewSignature> {
  @service declare curriculum: CurriculumService;
  @tracked sectionTemplates: SectionTemplates[] = [];
  @tracked sections: Sections[] = [];
  dragSourceIndex: number | null = null;

  constructor(owner: Owner, args: CurriculumEditViewSignature['Args']) {
    super(owner, args);
    void this.loadSectionTemplates();
    void this.loadSections();
  }

  async loadSectionTemplates() {
    this.sectionTemplates = await this.curriculum.findAllTemplates();
  }

  async loadSections() {
    this.sections = await this.curriculum.findAllSections(
      this.args.curriculumId
    );
  }

  onAddSection = async (templateId: string | null, title: string) => {
    if (!templateId) return;
    await this.curriculum.createSection(
      this.args.curriculumId,
      templateId,
      title
    );
    await this.loadSections();
  };

  onAddItem = async (templateId: string | null) => {
    if (!templateId) return;
    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    if (!sectionId) return;
    await this.curriculum.createItem(this.args.curriculumId, sectionId);
    await this.loadSections();
  };

  getItemsByTemplate(templateId: string | null, sections: Sections[]) {
    if (!templateId) return [];
    return sections.filter((s) => s.templateId === templateId)[0]?.items || [];
  }

  getSectionIdByTemplate(templateId: string | null, sections: Sections[]) {
    if (!templateId) return null;
    return sections.filter((s) => s.templateId === templateId)[0]?.id || null;
  }

  onDeleteItem = async (templateId: string | null, itemId: string | null) => {
    if (!templateId || !itemId) return;
    await this.curriculum.deleteItem(
      this.args.curriculumId,
      this.getSectionIdByTemplate(templateId, this.sections)!,
      itemId
    );
    await this.loadSections();
  };

  onDeleteSection = async (templateId: string | null) => {
    if (!templateId) return;
    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    await this.curriculum.deleteSection(this.args.curriculumId, sectionId!);
    await this.loadSections();
  };

  @action
  onDragStart(index: number) {
    this.dragSourceIndex = index;
  }

  @action
  onDrop(targetIndex: number) {
    const sourceIndex = this.dragSourceIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reordered = [...this.sectionTemplates];
    const [moved] = reordered.splice(sourceIndex, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    // await this.curriculum.updateOrderSections(this.args.curriculumId, reordered);

    this.sectionTemplates = reordered;
    this.dragSourceIndex = null;
  }

  @action
  onDragEnd() {
    this.dragSourceIndex = null;
  }

  <template>
    <div class="flex flex-col border-2 border-gray-300 w-full p-4 gap-4">
      {{#each this.sectionTemplates as |template index|}}
        <CurriculumDropdownSection
          @title={{template.label}}
          @isActive={{isSectionInTemplate this.sections template.id}}
          @onActivate={{fn this.onAddSection template.id template.label}}
          @onDesactivate={{fn this.onDeleteSection template.id}}
          @onDragStart={{fn this.onDragStart index}}
          @onDrop={{fn this.onDrop index}}
          @onDragEnd={{this.onDragEnd}}
        >
          {{#each
            (this.getItemsByTemplate template.id this.sections)
            as |item|
          }}
            <CurriculumEditSectionItem
              @fields={{template.jsonSchema}}
              @onDelete={{fn this.onDeleteItem template.id item.id}}
              @fillInfos={{item.jsonData}}
              @curriculumId={{@curriculumId}}
              @sectionId={{this.getSectionIdByTemplate
                template.id
                this.sections
              }}
              @itemId={{item.id}}
              @onUpdate={{@onUpdate}}
            />
          {{/each}}
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200 self-start px-1"
            {{on "click" (fn this.onAddItem template.id)}}
          >
            +
            {{t "curriculums.edit.addItem"}}
            {{template.label}}
          </button>
        </CurriculumDropdownSection>
      {{/each}}
    </div>
  </template>
}

export default CurriculumEditView;
