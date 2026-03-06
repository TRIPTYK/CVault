import Component from '@glimmer/component';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import CurriculumAdd from '#src/components/curriculums/curriculum-add.gts';
import { create, collection, clickable, text } from 'ember-cli-page-object';
import t from 'ember-intl/helpers/t';
import { CurriculumItemPageObject } from './curriculum-item.gts';

interface CurriculumListSignature {
  Element: HTMLDivElement;

  Args: {
    curriculums?: Array<{
      id: number;
      title: string;
      lastModified: string;
    }>;
  };
}

class CurriculumList extends Component<CurriculumListSignature> {
  get curriculums() {
    const sortedCurriculums = [...(this.args.curriculums || [])].sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
    return sortedCurriculums;
  }

  <template>
    <div data-test-curriculums-list class="flex flex-col gap-4">
      <h2 data-test-curriculums-title class="text-xl font-bold">
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

export const CurriculumListPageObject = create({
  scope: '[data-test-curriculums-list]',
  title: text('[data-test-curriculums-title]'),
  addButton: clickable('[data-test-curriculum-add-button]'),
  items: collection('[data-test-curriculum-item]', CurriculumItemPageObject),
});
