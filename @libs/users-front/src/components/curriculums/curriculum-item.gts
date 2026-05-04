import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { action } from '@ember/object';

import EditIcon from '#src/assets/icons/edit.gts';
import DuplicateIcon from '#src/assets/icons/duplicate.gts';
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
import { editCurriculumValidationSchema } from '#src/components/curriculums/curriculum-validation.ts';
import type { IntlService } from 'ember-intl';
import type Owner from '@ember/owner';
import type { UpdatedCurriculum } from '#src/components/curriculums/curriculum-validation.ts';
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

  validationSchema: ReturnType<typeof editCurriculumValidationSchema>;
  changeset = new CurriculumChangeset({
    title: this.args.curriculum.title,
  });

  constructor(owner: Owner, args: CurriculumItemSignature['Args']) {
    super(owner, args);
    this.validationSchema = editCurriculumValidationSchema(this.intl);
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
  async rename(title: string) {
    if (!this.args.curriculum.id || title === this.args.curriculum.title)
      return;
    await this.curriculum.rename(this.args.curriculum.id, title);
    this.args.onRefresh?.();
  }

  onSubmit = async (
    data: UpdatedCurriculum,
    c: ImmerChangeset<UpdatedCurriculum>
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
          data-test-curriculum-item-more-action-button
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
            <Action @action={{this.duplicate}}>
              <DuplicateIcon class="size-4 mr-2" />
              {{t "curriculums.moreActions.duplicate"}}
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
        as |F|
      >
        <F.TpkInputPrefab
          data-test-curriculum-item-title
          @label={{t "curriculums.edit.title"}}
          @validationField="title"
          class="col-span-12 md:col-span-4"
        />
      </TpkForm>

      <span
        data-test-curriculum-item-last-modified
        class="text-sm text-gray-500"
      >
        {{t "curriculums.view.lastModified"}}
        {{relativeTime @curriculum.updatedAt}}
      </span>
    </div>
  </template>
}

export default CurriculumItem;

export const CurriculumItemPageObject = create({
  scope: '[data-test-curriculum-item]',
  moreActionsButton: clickable(
    '[data-test-curriculum-item-more-action-button]'
  ),
  titleInput: fillable('[data-test-curriculum-item-title] input'),
  titleValue: value('[data-test-curriculum-item-title]'),
  lastModified: text('[data-test-curriculum-item-last-modified]'),
});
