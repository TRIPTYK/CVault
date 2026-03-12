import Component from '@glimmer/component';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import CurriculumAdd from '#src/components/curriculums/curriculum-add.gts';
import { create, collection, clickable, text } from 'ember-cli-page-object';
import t from 'ember-intl/helpers/t';
import { CurriculumItemPageObject } from './curriculum-item.gts';
import { service } from '@ember/service';
import type CurriculumService from '#src/services/curriculum.ts';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import type { Curriculum } from '#src/schemas/curriculums.ts';

interface CurriculumListSignature {
  Element: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Args: {};
}

class CurriculumList extends Component<CurriculumListSignature> {
  @service declare curriculum: CurriculumService;
  @tracked curriculums: Curriculum[] = [];

  constructor(owner: Owner, args: CurriculumListSignature['Args']) {
    super(owner, args);
    void this.loadCurriculums();
  }

  async loadCurriculums() {
    this.curriculums = this.sortCurriculums(await this.curriculum.findAll());
  }

  onRefresh = async () => {
    await this.loadCurriculums();
  };

  sortCurriculums(curriculums: Curriculum[] = this.curriculums): Curriculum[] {
    const sortedCurriculums = [...(curriculums || [])].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sortedCurriculums;
  }

  onAdd = async () => {
    await this.loadCurriculums();
  };

  <template>
    <div data-test-curriculums-list class="flex flex-col gap-4">
      <h2 data-test-curriculums-title class="text-xl font-bold">
        {{t "curriculums.view.curriculumsVitae"}}
      </h2>
      <div class="flex flex-row flex-wrap">
        <CurriculumAdd @onAdd={{this.onAdd}} />
        {{#each this.curriculums as |curriculum|}}
          <CurriculumItem
            @curriculum={{curriculum}}
            @onRefresh={{this.onRefresh}}
          />
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
