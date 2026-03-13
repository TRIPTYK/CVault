import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ReturnArrowIcon from '#src/assets/icons/returnArrow.gts';

class CurriculumReturnButton extends Component<object> {
  get curriculumPreview() {
    return [];
  }

  <template>
    <button
      type="button"
      class="flex items-center gap-2 text-sm text-white border border-gray-400 rounded px-3 py-1 hover:bg-gray-700"
    >
      <ReturnArrowIcon />
      {{t "curriculums.edit.returnToList"}}
    </button>
  </template>
}

export default CurriculumReturnButton;
