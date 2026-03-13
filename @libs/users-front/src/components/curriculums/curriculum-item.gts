import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { action } from '@ember/object';

import CvIcon from '#src/assets/icons/cv.gts';
import relativeTime from '#src/helpers/relative-time.ts';
import CurriculumMoreActions from '#src/components/curriculums/curriculum-more-actions.gts';
import {
  clickable,
  create,
  fillable,
  text,
  value,
} from 'ember-cli-page-object';
import type CurriculumService from '#src/services/curriculum.ts';

interface CurriculumItemSignature {
  Element: HTMLDivElement;

  Args: {
    curriculum: {
      id: string | null;
      title: string;
      updatedAt: string;
    };
    onRefresh: () => void;
  };
}

class CurriculumItem extends Component<CurriculumItemSignature> {
  @service declare router: RouterService;
  @service declare curriculum: CurriculumService;

  @action
  async renameOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      await this.rename((event.target as HTMLInputElement).value);
    }
  }

  @action
  async renameOnBlur(event: FocusEvent) {
    await this.rename((event.target as HTMLInputElement).value);
  }

  async rename(title: string) {
    if (!this.args.curriculum.id || title === this.args.curriculum.title)
      return;
    await this.curriculum.rename(this.args.curriculum.id, title);
    this.args.onRefresh?.();
  }

  @action
  focusTitle() {
    const input = document.querySelector(
      `input[name="curriculum-title-${this.args.curriculum.id}"]`
    );

    if (input) {
      (input as HTMLInputElement).focus();
      (input as HTMLInputElement).select();
    }
  }

  @action
  refresh() {
    this.args.onRefresh?.();
  }

  goToCurriculum = () => {
    const curriculumId = this.args.curriculum.id;
    this.router.transitionTo('dashboard.curriculums.edit', curriculumId);
  };

  <template>
    <div data-test-curriculum-item class="flex flex-col p-5">
      <div class="relative inline-block">
        <button
          data-test-curriculum-enter
          type="button"
          class="cursor-pointer mb-3 hover:shadow-lg transition-shadow duration-200"
          {{on "click" this.goToCurriculum}}
        >
          <CvIcon />
        </button>
        <div class="absolute bottom-5 right-2 z-10">
          <CurriculumMoreActions
            @curriculumId={{@curriculum.id}}
            @onRename={{this.focusTitle}}
            @onDelete={{this.refresh}}
            @onDuplicate={{this.refresh}}
          />
        </div>
      </div>

      <input
        aria-label="Curriculum title"
        data-test-curriculum-title="{{@curriculum.id}}"
        name="curriculum-title-{{@curriculum.id}}"
        class="font-medium pb-1 hover:text-blue-600 hover:underline hover:underline-offset-6 focus:outline-none transition-colors duration-200"
        value={{@curriculum.title}}
        {{on "keydown" this.renameOnEnter}}
        {{on "blur" this.renameOnBlur}}
      />
      <span data-test-curriculum-last-modified class="text-sm text-gray-500">
        {{t "curriculums.view.lastModified"}}
        {{relativeTime @curriculum.updatedAt}}
      </span>
    </div>
  </template>
}

export default CurriculumItem;

export const CurriculumItemPageObject = create({
  scope: '[data-test-curriculum-item]',
  enterButton: clickable('[data-test-curriculum-enter]'),
  titleInput: fillable('[data-test-curriculum-title] input'),
  titleValue: value('[data-test-curriculum-title]'),
  lastModified: text('[data-test-curriculum-last-modified]'),
  moreActionsButton: clickable('[data-test-curriculum-more-action-button]'),
});
