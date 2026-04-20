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

const isSectionActive = (sections: Sections[], templateId: string | null) =>
  sections.some((s) => s.templateId === templateId && s.isActive);

class CurriculumEditView extends Component<CurriculumEditViewSignature> {
  @service declare curriculum: CurriculumService;
  @tracked sectionTemplates: SectionTemplates[] = [];
  @tracked sections: Sections[] = [];
  dragSourceIndex: number | null = null;
  dragSourceItemIndex: number | null = null;
  dragSourceTemplateId: string | null = null;

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

  onAddSection = async (templateId: string | null) => {
    if (!templateId) return;
    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    if (!sectionId) return;
    await this.curriculum.updateSection(
      this.args.curriculumId,
      sectionId,
      true
    );
    this.args.onUpdate();
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
    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    if (!sectionId) return;
    await this.curriculum.deleteItem(this.args.curriculumId, sectionId, itemId);
    await this.loadSections();
  };

  onDeleteSection = async (templateId: string | null) => {
    if (!templateId) return;
    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    if (!sectionId) return;
    await this.curriculum.updateSection(
      this.args.curriculumId,
      sectionId,
      false
    );
    this.args.onUpdate();
  };

  @action
  onDragStart(index: number) {
    this.dragSourceIndex = index;
  }

  @action
  async onDrop(targetIndex: number) {
    const sourceIndex = this.dragSourceIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reordered = [...this.sectionTemplates];
    const [moved] = reordered.splice(sourceIndex, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    const newOrder = reordered.map((t) =>
      this.getSectionIdByTemplate(t.id, this.sections)
    );

    if (newOrder.some((id) => typeof id !== 'string')) return;
    await this.curriculum.updateOrderSections(
      this.args.curriculumId,
      newOrder as string[]
    );

    this.sectionTemplates = reordered;
    this.dragSourceIndex = null;

    this.args.onUpdate();
  }

  @action
  async onItemDrop(templateId: string | null, targetIndex: number) {
    if (!templateId) return;
    const sourceIndex = this.dragSourceItemIndex;
    if (
      sourceIndex === null ||
      sourceIndex === targetIndex ||
      this.dragSourceTemplateId !== templateId
    )
      return;

    const sectionId = this.getSectionIdByTemplate(templateId, this.sections);
    if (!sectionId) return;

    const items = this.getItemsByTemplate(templateId, this.sections);
    const reordered = [...items];
    const [moved] = reordered.splice(sourceIndex, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    const newOrder = reordered.map((i) => i.id);

    await this.curriculum.updateOrderItems(
      this.args.curriculumId,
      sectionId,
      newOrder
    );

    this.dragSourceItemIndex = null;
    this.dragSourceTemplateId = null;

    await this.loadSections();
    this.args.onUpdate();
  }

  @action
  onItemDragEnd() {
    this.dragSourceItemIndex = null;
    this.dragSourceTemplateId = null;
  }

  @action
  onItemDragStart(templateId: string | null, itemIndex: number) {
    if (!templateId) return;
    this.dragSourceItemIndex = itemIndex;
    this.dragSourceTemplateId = templateId;
  }

  get sortedSectionTemplates() {
    return this.sectionTemplates.slice().sort((a, b) => {
      const sectionA = this.sections.find((s) => s.templateId === a.id);
      const sectionB = this.sections.find((s) => s.templateId === b.id);

      const positionA = sectionA?.position ?? Infinity;
      const positionB = sectionB?.position ?? Infinity;

      return positionA - positionB;
    });
  }

  @action
  onDragEnd() {
    this.dragSourceIndex = null;
  }

  getTemplateLabel(templateId: string | null) {
    return this.sectionTemplates.find((t) => t.id === templateId)?.label || '';
  }

  <template>
    <div class="flex flex-col border-2 border-gray-300 w-full p-4 gap-4">
      {{#each this.sortedSectionTemplates as |template index|}}
        <CurriculumDropdownSection
          @title={{template.label}}
          @isActive={{isSectionActive this.sections template.id}}
          @onActivate={{fn this.onAddSection template.id}}
          @onDesactivate={{fn this.onDeleteSection template.id}}
          @onDragStart={{fn this.onDragStart index}}
          @onDrop={{fn this.onDrop index}}
          @onDragEnd={{this.onDragEnd}}
        >
          {{#each
            (this.getItemsByTemplate template.id this.sections)
            as |item indexItem|
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
              @onDragStart={{fn this.onItemDragStart template.id indexItem}}
              @onDrop={{fn this.onItemDrop template.id indexItem}}
              @onDragEnd={{this.onItemDragEnd}}
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
