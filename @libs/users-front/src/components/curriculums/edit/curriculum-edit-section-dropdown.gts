import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import type Owner from '@ember/owner';
import DragIcon from '#src/assets/icons/drag.gts';

interface CurriculumDropdownSectionSignature {
  Element: HTMLDivElement;
  Args: {
    title: string;
    isActive: boolean;
    onActivate?: () => void;
    onDesactivate?: () => void;
  };
  Blocks: {
    default: [];
  };
}

class CurriculumDropdownSection extends Component<CurriculumDropdownSectionSignature> {
  @tracked isOpen = false;

  constructor(owner: Owner, args: CurriculumDropdownSectionSignature['Args']) {
    super(owner, args);
  }

  @action
  activate() {
    this.args.onActivate?.();
    this.isOpen = true;
  }

  @action
  desactivate() {
    this.args.onDesactivate?.();
    this.isOpen = false;
  }

  @action
  open() {
    this.isOpen = true;
  }

  @action
  close() {
    this.isOpen = false;
  }

  @action
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  <template>
    <div
      draggable="true"
      class="flex flex-col w-full border border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm"
    >
      <div
        class="flex flex-row items-center justify-between w-full px-5 py-4 bg-white"
      >
        <DragIcon class="drag-handle" />
        <span
          class="font-bold text-lg transition-colors duration-200
            {{if @isActive 'text-black' 'text-gray-400'}}"
        >
          {{@title}}
        </span>

        <div class="flex flex-row items-center gap-2">
          {{#if @isActive}}
            <button
              type="button"
              title="Désactiver"
              class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:border-red-400 hover:text-red-400 hover:bg-red-50 transition-colors duration-200"
              {{on "click" this.desactivate}}
            >
              −
            </button>
            {{#if this.isOpen}}
              <button
                type="button"
                title="Replier"
                class="w-7 h-7 flex items-center justify-center border border-black rounded-full text-black hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                {{on "click" this.close}}
              >
                ▲
              </button>
            {{else}}
              <button
                type="button"
                title="Déplier"
                class="w-7 h-7 flex items-center justify-center border border-black rounded-full text-black hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                {{on "click" this.open}}
              >
                ▼
              </button>
            {{/if}}
          {{else}}
            <button
              type="button"
              title="Activer"
              class="w-7 h-7 flex items-center justify-center border border-gray-400 rounded-full text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
              {{on "click" this.activate}}
            >
              +
            </button>
          {{/if}}
        </div>
      </div>

      {{#if this.isOpen}}
        <div
          class="border-t border-gray-200 px-5 py-4 bg-gray-50 flex flex-col gap-4"
        >
          {{yield}}
        </div>
      {{/if}}
    </div>
  </template>
}

export default CurriculumDropdownSection;
