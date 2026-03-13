import Component from '@glimmer/component';
import EditReturnButton from '#src/components/curriculums/edit/curriculum-edit-return-button.gts';
import EditDownloadButton from '#src/components/curriculums/edit/curriculum-edit-download-button.gts';

class CurriculumTopBar extends Component<object> {
  get curriculumPreview() {
    return [];
  }

  <template>
    <div
      class="flex flex-row bg-[#1D1D20] px-4 py-4 items-center justify-between"
    >
      <EditReturnButton />
      <div class="text-center text-sm font-medium text-white size-fit">
        Titre du CV
      </div>
      <EditDownloadButton />
    </div>
  </template>
}

export default CurriculumTopBar;
