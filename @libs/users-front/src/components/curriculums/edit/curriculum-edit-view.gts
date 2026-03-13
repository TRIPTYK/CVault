import Component from '@glimmer/component';

class CurriculumEditView extends Component<object> {
  get curriculumInfos() {
    return [];
  }

  <template>
    <div class="flex flex-col border-2 border-gray-300 w-full">
      The edit page
    </div>
  </template>
}

export default CurriculumEditView;
