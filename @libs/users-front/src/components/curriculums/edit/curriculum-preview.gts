import Component from '@glimmer/component';
import CvIcon from '#src/assets/icons/cvBig.gts';

class CurriculumPreview extends Component<object> {
  get curriculumPreview() {
    return [];
  }

  <template>
    <div
      class="flex flex-col border-2 border-gray-300 w-full p-4 items-center justify-center"
    >
      <CvIcon />
    </div>
  </template>
}

export default CurriculumPreview;
