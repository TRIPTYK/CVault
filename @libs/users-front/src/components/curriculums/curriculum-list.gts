import Component from '@glimmer/component';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import { on } from '@ember/modifier';
import { create, collection, clickable, text } from 'ember-cli-page-object';
import t from 'ember-intl/helpers/t';
import { CurriculumItemPageObject } from './curriculum-item.gts';
import { service } from '@ember/service';
import type CurriculumService from '#src/services/curriculum.ts';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import type { Curriculum } from '#src/schemas/curriculums.ts';
import type RouterService from '@ember/routing/router-service';

interface CurriculumListSignature {
  Element: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Args: {};
}

class CurriculumList extends Component<CurriculumListSignature> {
  @service declare curriculum: CurriculumService;
  @service declare router: RouterService;
  @tracked curriculums: Curriculum[] = [];

  constructor(owner: Owner, args: CurriculumListSignature['Args']) {
    super(owner, args);
    void this.loadCurriculums();
  }

  async loadCurriculums() {
    this.curriculums = await this.curriculum.findAll();
  }

  createCurriculum = async () => {
    const curriculum = await this.curriculum.create();
    if (curriculum?.id) {
      this.router.transitionTo('dashboard.curriculums.edit', curriculum.id);
    }
  };

  onRefresh = async () => {
    await this.loadCurriculums();
  };

  <template>
    <div data-test-curriculums-list class="flex flex-col gap-4">
      <h2 data-test-curriculums-title class="text-xl font-bold">
        {{t "curriculums.view.curriculumsVitae"}}
      </h2>
      <div class="flex flex-row flex-wrap">
        <button
          data-test-curriculum-add-button
          type="submit"
          {{on "click" this.createCurriculum}}
          class="flex flex-col cursor-pointer items-center justify-center w-51 m-5 p-2 mb-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
        >
          <span class="text-3xl font-bold">+</span>
          <span class="mt-2 text-sm font-medium">
            {{t "curriculums.view.createNewCV"}}
          </span>
        </button>
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
