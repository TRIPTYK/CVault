import Component from '@glimmer/component';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import CurriculumAdd from '#src/components/curriculums/curriculum-add.gts';
import t from 'ember-intl/helpers/t';

class CurriculumList extends Component<object> {
  get curriculums() {
    return [
      { id: 1, title: 'Curriculum 1', lastModified: '2026-03-01T08:32:12' },
      { id: 2, title: 'Curriculum 2', lastModified: '2026-03-02T10:15:45' },
      { id: 3, title: 'Curriculum 3', lastModified: '2026-03-03T14:22:30' },
      { id: 4, title: 'Curriculum 4', lastModified: '2026-03-04T16:45:18' },
      { id: 5, title: 'Curriculum 5', lastModified: '2026-03-05T09:58:57' },
    ];
  }

  <template>
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">
        {{t "curriculums.view.curriculumsVitae"}}
      </h2>
      <div class="flex flex-row flex-wrap">
        <CurriculumAdd />
        {{#each this.curriculums as |curriculum|}}
          <CurriculumItem @curriculum={{curriculum}} />
        {{/each}}
      </div>
    </div>
  </template>
}

export default CurriculumList;
