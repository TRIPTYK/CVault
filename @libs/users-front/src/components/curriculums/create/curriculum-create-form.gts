import Component from '@glimmer/component';

class CurriculumCreateForm extends Component<object> {
  get curriculums() {
    return [];
  }

  <template>
    <div class="flex flex-col gap-4">
      The create form
    </div>
  </template>
}

export default CurriculumCreateForm;
