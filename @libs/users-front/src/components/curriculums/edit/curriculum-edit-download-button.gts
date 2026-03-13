import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import DownloadIcon from '#src/assets/icons/download.gts';

class CurriculumDownloadButton extends Component<object> {
  get curriculumPreview() {
    return [];
  }

  <template>
    <button
      type="button"
      class="flex items-center gap-2 text-sm text-white border border-gray-400 rounded px-3 py-1 hover:bg-gray-700"
    >
      <DownloadIcon />
      {{t "curriculums.edit.download"}}
    </button>
  </template>
}

export default CurriculumDownloadButton;
