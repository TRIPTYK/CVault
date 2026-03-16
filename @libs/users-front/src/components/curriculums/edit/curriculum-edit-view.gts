import Component from '@glimmer/component';
import CurriculumDropdownSection from '#src/components/curriculums/edit/curriculum-edit-section-dropdown.gts';

class CurriculumEditView extends Component<object> {
  get getSections() {
    return {
      data: [
        {
          id: '1',
          title: 'Expériences',
        },
        {
          id: '2',
          title: 'Formations',
        },
        {
          id: '3',
          title: 'Compétences',
        },
      ],
    };
  }

  <template>
    <div class="flex flex-col border-2 border-gray-300 w-full p-4">
      {{#each this.getSections.data as |section|}}
        <CurriculumDropdownSection @title={{section.title}}>
          <p>Contenu de la section</p>
        </CurriculumDropdownSection>
      {{/each}}
    </div>
  </template>
}

export default CurriculumEditView;
