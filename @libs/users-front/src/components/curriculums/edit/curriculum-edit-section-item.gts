import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { get } from '@ember/helper';
import type { SchemaField } from '#src/schemas/section-templates.ts';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import type CurriculumService from '#src/services/curriculum.ts';

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
  };
}

const isTextarea = (field: SchemaField) => field.type === 'textarea';

class CurriculumEditSectionItem extends Component<CurriculumEditSectionItemSignature> {
  @service declare curriculum: CurriculumService;
  @tracked isOpen = false;
  @tracked firstFieldKey = this.args.fields[0]?.key || '';

  @action
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  @action
  async updateField(key: string, event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    await this.curriculum.updateItem(
      this.args.curriculumId,
      this.args.sectionId!,
      this.args.itemId,
      { [key]: input.value }
    );
    this.args.onUpdate();
  }

  get firstFieldValue() {
    const firstFieldKey = this.args.fields[0]?.key;
    if (!firstFieldKey || !this.args.fillInfos) {
      return 'Nouvel élément';
    }
    return this.args.fillInfos[firstFieldKey]?.substring(0, 25) || 'Sans titre';
  }

  <template>
    <div
      class="flex flex-col w-full border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden"
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
          {{#each @fields as |field|}}
            <div class="flex flex-col gap-1">
              <label
                class="text-xs font-medium text-gray-600"
                for={{field.key}}
              >
                {{field.label}}
              </label>
              {{#if (isTextarea field)}}
                <textarea
                  id={{field.key}}
                  name={{field.key}}
                  value={{get @fillInfos field.key}}
                  class="border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
                  rows="3"
                  {{on "blur" (fn this.updateField field.key)}}
                />
              {{else}}
                <input
                  id={{field.key}}
                  name={{field.key}}
                  type={{field.type}}
                  value={{get @fillInfos field.key}}
                  class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  {{on "blur" (fn this.updateField field.key)}}
                />
              {{/if}}
            </div>
          {{/each}}
        </div>
      {{/if}}
    </div>
  </template>
}

export default CurriculumEditSectionItem;
