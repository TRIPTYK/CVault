import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { action } from '@ember/object';

import EditIcon from '#src/assets/icons/edit.gts';
import RenameIcon from '#src/assets/icons/rename.gts';
import DuplicateIcon from '#src/assets/icons/duplicate.gts';
import DownloadIcon from '#src/assets/icons/download.gts';
import DeleteIcon from '#src/assets/icons/delete.gts';

import CvIcon from '#src/assets/icons/cv.gts';
import {
  clickable,
  create,
  fillable,
  text,
  value,
} from 'ember-cli-page-object';
import type CurriculumService from '#src/services/curriculum.ts';
import TpkActionsMenu from '@triptyk/ember-ui/components/tpk-actions-menu';
import relativeTime from '#src/helpers/relative-time.ts';
import type ImmerChangeset from 'ember-immer-changeset';
import TpkForm from '@triptyk/ember-input-validation/components/tpk-form';
import { CurriculumChangeset } from '#src/changesets/curriculum.ts';
import { createCurriculumValidationSchema } from '#src/components/curriculums/curriculum-validation.ts';
import type { IntlService } from 'ember-intl';
import type Owner from '@ember/owner';
import type {
  UpdatedCurriculum,
  ValidatedCurriculum,
} from '#src/components/curriculums/curriculum-validation.ts';
import HandleSaveService from '@libs/shared-front/services/handle-save';

interface CurriculumItemSignature {
  Element: HTMLDivElement;

  Args: {
    curriculum: {
      id: string | null;
      title: string;
      updatedAt: string;
      createdAt: string;
    };
    onRefresh: () => void;
  };
}

class CurriculumItem extends Component<CurriculumItemSignature> {
  @service declare router: RouterService;
  @service declare curriculum: CurriculumService;
  @service declare intl: IntlService;
  @service declare handleSave: HandleSaveService;

  validationSchema: ReturnType<typeof createCurriculumValidationSchema>;
  changeset = new CurriculumChangeset({
    title: this.args.curriculum.title,
  });

  constructor(owner: Owner, args: CurriculumItemSignature['Args']) {
    super(owner, args);
    this.validationSchema = createCurriculumValidationSchema(this.intl);
  }

  @action
  async renameOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      await this.rename((event.target as HTMLInputElement).value);
    }
  }

  @action
  gotToEdit() {
    if (!this.args.curriculum.id) return;
    this.router.transitionTo(
      'dashboard.curriculums.edit',
      this.args.curriculum.id
    );
  }

  @action
  async delete() {
    if (!this.args.curriculum.id) return;
    await this.curriculum.delete(this.args.curriculum.id);
    this.args.onRefresh?.();
  }

  @action
  async duplicate() {
    if (!this.args.curriculum.id) return;
    await this.curriculum.duplicate(this.args.curriculum.id);
    this.args.onRefresh?.();
  }

  @action
  async renameOnBlur(event: FocusEvent) {
    await this.rename((event.target as HTMLInputElement).value);
  }

  @action
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

  onSubmit = async (
    data: UpdatedCurriculum,
    c: ImmerChangeset<ValidatedCurriculum | UpdatedCurriculum>
  ) => {
    await this.handleSave.handleSave({
      saveAction: async () => await this.rename(data.title),
      changeset: c,
      successMessage: 'curriculums.edit.renameSuccess',
      transitionOnSuccess: 'dashboard.curriculums',
    });
  };

  @action
  refresh() {
    this.args.onRefresh?.();
  }

  <template>
    <div data-test-curriculum-item class="flex flex-col p-5">
      <div class="relative inline-block">
        <button
          data-test-curriculum-enter
          type="button"
          class="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          {{on "click" this.gotToEdit}}
        >
          <CvIcon />
        </button>
        <div class="absolute bottom-5 right-2 z-10">
          <TpkActionsMenu as |Action|>
            <Action @action={{this.gotToEdit}}>
              <EditIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.edit"}}
            </Action>
            <Action @action={{this.focusTitle}}>
              <RenameIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.rename"}}
            </Action>
            <Action @action={{this.duplicate}}>
              <DuplicateIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.duplicate"}}
            </Action>
            <Action @action={{this.refresh}}>
              <DownloadIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.download"}}
            </Action>
            <Action @action={{this.delete}}>
              <DeleteIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.delete"}}
            </Action>
          </TpkActionsMenu>
        </div>
      </div>

      <TpkForm
        @changeset={{this.changeset}}
        @onSubmit={{this.onSubmit}}
        @validationSchema={{this.validationSchema}}
        data-test-todos-form
        as |F|
      >
        <F.TpkInputPrefab
          @label={{t "curriculums.edit.title"}}
          @validationField="title"
          class="col-span-12 md:col-span-4"
        />
      </TpkForm>

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
