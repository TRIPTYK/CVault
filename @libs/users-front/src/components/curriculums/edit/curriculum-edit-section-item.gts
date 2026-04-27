import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import type { SchemaField } from '#src/schemas/section-templates.ts';
import { service } from '@ember/service';
import type CurriculumService from '#src/services/curriculum.ts';
import { type IntlService } from 'ember-intl';
import DynamicSectionForm from '#src/components/curriculums/edit/dynamic-section-item-form.gts';

interface CurriculumEditSectionItemSignature {
  Element: HTMLDivElement;
  Args: {
    fields: SchemaField[];
    fillInfos?: Record<string, string>;
    curriculumId: string;
    sectionId: string | null;
    itemId: string;
    onDelete: () => void;
    onUpdate: () => void;
    onDragStart?: (event: DragEvent) => void;
    onDrop?: (event: DragEvent) => void;
    onDragEnd?: (event: DragEvent) => void;
  };
}

class CurriculumEditSectionItem extends Component<CurriculumEditSectionItemSignature> {
  @service declare curriculum: CurriculumService;
  @service declare intl: IntlService;
  @tracked isOpen = false;
  @tracked firstFieldKey = this.args.fields[0]?.key || '';
  @tracked isDragOver = false;

  @action
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  @action
  async uploadFile(key: string, event: Event) {
    if (key !== 'profilePicture') return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      await this.curriculum.uploadFile(
        this.args.curriculumId,
        this.args.sectionId!,
        this.args.itemId,
        file!
      );
      this.args.onUpdate();
    }
  }

  @action
  getFileName(key: string | undefined) {
    return (
      key?.split('/').pop() || this.intl.t('curriculums.edit.noFileChosen')
    );
  }

  get firstFieldValue() {
    const firstFieldKey = this.args.fields[0]?.key;
    if (!firstFieldKey || !this.args.fillInfos) {
      return this.intl.t('curriculums.edit.newItem');
    }
    return (
      this.args.fillInfos[firstFieldKey]?.substring(0, 25) ||
      this.intl.t('curriculums.edit.noTitle')
    );
  }

  @action handleDragStart(event: DragEvent) {
    event.stopPropagation();
    this.args.onDragStart?.(event);
  }

  @action handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  @action handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    this.args.onDrop?.(event);
  }

  @action handleDragEnd(event: DragEvent) {
    this.isDragOver = false;
    this.args.onDragEnd?.(event);
  }

  @action handleDragLeave() {
    this.isDragOver = false;
  }

  @action
  async handleSubmit(data: Record<string, unknown>) {
    for (const [, value] of Object.entries(data)) {
      if (value instanceof File) {
        await this.curriculum.uploadFile(
          this.args.curriculumId,
          this.args.sectionId!,
          this.args.itemId,
          value
        );
      }
    }

    const stringData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => typeof v === 'string')
    ) as Record<string, string>;

    await this.curriculum.updateItem(
      this.args.curriculumId,
      this.args.sectionId!,
      this.args.itemId,
      stringData
    );

    this.args.onUpdate();
  }

  <template>
    <div
      draggable="true"
      class="flex flex-col w-full border rounded-lg bg-white shadow-sm overflow-hidden transition-colors duration-150
        {{if this.isDragOver 'border-blue-400 bg-blue-50' 'border-gray-300'}}"
      {{on "dragstart" this.handleDragStart}}
      {{on "dragover" this.handleDragOver}}
      {{on "drop" this.handleDrop}}
      {{on "dragend" this.handleDragEnd}}
      {{on "dragleave" this.handleDragLeave}}
    >
      <div
        class="flex flex-row items-center justify-between px-4 py-2 bg-white-50 border-b border-gray-200"
      >
        <span class="text-sm font-medium text-gray-700">
          {{this.firstFieldValue}}
        </span>

        <div class="flex flex-row items-center gap-2">

          <button
            type="button"
            title={{if this.isOpen "Replier" "Déplier"}}
            class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200 text-xs"
            {{on "click" this.toggleOpen}}
          >
            {{if this.isOpen "▲" "▼"}}
          </button>

          <button
            type="button"
            title="Supprimer"
            class="w-6 h-6 flex items-center justify-center border border-red-300 rounded-full text-red-400 hover:border-red-500 hover:bg-red-50 transition-colors duration-200 text-sm"
            {{on "click" @onDelete}}
          >
            ×
          </button>
        </div>
      </div>

      {{#if this.isOpen}}
        <div class="flex flex-col gap-3 px-4 py-3">
          {{#if this.isOpen}}
            <DynamicSectionForm
              @fields={{@fields}}
              @fillInfos={{@fillInfos}}
              @onSubmit={{this.handleSubmit}}
            />
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}

export default CurriculumEditSectionItem;
