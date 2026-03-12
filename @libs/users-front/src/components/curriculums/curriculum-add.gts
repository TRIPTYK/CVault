import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import { service } from '@ember/service';
import TpkForm from '@triptyk/ember-input-validation/components/tpk-form';
import type HandleSaveService from '@libs/shared-front/services/handle-save';
import type CurriculumService from '#src/services/curriculum.ts';
import ImmerChangeset from 'ember-immer-changeset';
import { createCurriculumValidationSchema } from '#src/components/curriculums/curriculum-validation.ts';
import type { ValidatedCurriculum } from '#src/components/curriculums/curriculum-validation.ts';
import type Owner from '@ember/owner';
import type { IntlService } from 'ember-intl';

interface CurriculumAddSignature {
  Element: HTMLDivElement;
  Args: {
    onAdd: () => void;
  };
}

class CurriculumAdd extends Component<CurriculumAddSignature> {
  @service declare handleSave: HandleSaveService;
  @service declare curriculum: CurriculumService;
  @service declare intl: IntlService;

  changeset = new ImmerChangeset<ValidatedCurriculum>(
    {} as ValidatedCurriculum
  );
  validationSchema: ReturnType<typeof createCurriculumValidationSchema>;

  constructor(owner: Owner, args: CurriculumAddSignature['Args']) {
    super(owner, args);
    this.validationSchema = createCurriculumValidationSchema(this.intl);
  }

  onSubmit = async (
    data: ValidatedCurriculum,
    c: ImmerChangeset<ValidatedCurriculum>
  ) => {
    await this.handleSave.handleSave({
      saveAction: () => this.curriculum.create(data),
      changeset: c,
      successMessage: 'curriculums.create.createSuccess',
    });

    this.args.onAdd?.();
  };

  <template>
    <TpkForm
      class="flex flex-col cursor-pointer items-center justify-center w-51 m-5 p-2 mb-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
      @changeset={{this.changeset}}
      @onSubmit={{this.onSubmit}}
      @validationSchema={{this.validationSchema}}
      data-test-todos-form
      as |F|
    >
      <F.TpkInputPrefab
        @label={{t "curriculums.create.title"}}
        @validationField="title"
        class="col-span-12 m-2 md:col-span-4"
      />
      <button
        data-test-curriculum-add-button
        type="submit"
        class="border-gray-300 hover:border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-200 w-full mt-4"
      >
        <span class="text-3xl font-bold">+</span>
        <span class="mt-2 text-sm font-medium">
          {{t "curriculums.view.createNewCV"}}
        </span>
      </button>
    </TpkForm>
  </template>
}

export default CurriculumAdd;

export const CurriculumAddPageObject = {
  addButton: '[data-test-curriculum-add-button]',
};
