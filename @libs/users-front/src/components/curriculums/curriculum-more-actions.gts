import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { clickOutside } from 'ember-click-outside-modifier';

import EditIcon from '#src/assets/icons/edit.gts';
import RenameIcon from '#src/assets/icons/rename.gts';
import DuplicateIcon from '#src/assets/icons/duplicate.gts';
import DownloadIcon from '#src/assets/icons/download.gts';
import DeleteIcon from '#src/assets/icons/delete.gts';

interface CurriculumMoreActionsSignature {
  Args: {
    curriculumId: number;
    onRename: () => void;
  };
}

class CurriculumMoreActions extends Component<CurriculumMoreActionsSignature> {
  @service declare router: RouterService;

  @tracked isOpen = false;

  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }

  @action
  rename(event: MouseEvent) {
    event.stopPropagation();

    this.isOpen = false;
    this.args.onRename?.();
  }

  @action
  gotToEdit() {
    const curriculumId = this.args.curriculumId;
    this.router.transitionTo('dashboard.curriculums.edit', curriculumId);
  }

  @action
  close() {
    this.isOpen = false;
  }

  <template>
    <button
      type="button"
      class="cursor-pointer p-2 rounded-full w-8 h-8 flex items-center justify-center bg-white shadow-lg hover:border-blue-500 hover:bg-blue-50 hover:border transition-colors duration-200"
      {{clickOutside this.close}}
      {{on "click" this.toggle}}
    >
      <span class="text-lg">⋮</span>
    </button>
    {{#if this.isOpen}}
      <div
        class="curriculum-popup absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-20"
      >
        <button
          {{on "click" this.gotToEdit}}
          type="button"
          class="w-full text-left px-4 py-2 flex flex-row items-center cursor-pointer hover:bg-gray-100"
        >
          <EditIcon class="size-4 mr-2" />
          {{t "curriculums.moreActions.edit"}}
        </button>

        <button
          {{on "click" this.rename}}
          type="button"
          class="w-full text-left px-4 py-2 flex flex-row items-center cursor-pointer hover:bg-gray-100"
        >
          <RenameIcon class="size-4 mr-2" />
          {{t "curriculums.moreActions.rename"}}
        </button>

        <button
          type="button"
          class="w-full text-left px-4 py-2 flex flex-row items-center cursor-pointer hover:bg-gray-100"
        >
          <DuplicateIcon class="size-4 mr-2" />
          {{t "curriculums.moreActions.duplicate"}}
        </button>

        <button
          type="button"
          class="w-full text-left px-4 py-2 flex flex-row items-center cursor-pointer hover:bg-gray-100"
        >
          <DownloadIcon class="size-4 mr-2" />
          {{t "curriculums.moreActions.download"}}
        </button>

        <button
          type="button"
          class="w-full text-left px-4 py-2 flex flex-row items-center cursor-pointer hover:bg-gray-100"
        >
          <DeleteIcon class="size-4 mr-2" />
          {{t "curriculums.moreActions.delete"}}
        </button>
      </div>
    {{/if}}
  </template>
}

export default CurriculumMoreActions;
