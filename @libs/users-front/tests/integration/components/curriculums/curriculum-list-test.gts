import { expect, describe, assert } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render } from '@ember/test-helpers';
import CurriculumList from '#src/components/curriculums/curriculum-list.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumListPageObject } from '#src/components/curriculums/curriculum-list.gts';
import curriculumsList from '#src/models/curriculums/curriculums-list.mock.ts';

describe('curriculum-list', function () {
  renderingTest.scoped({
    // eslint-disable-next-line no-empty-pattern
    app: ({}, use) => use(TestApp),
  });

  renderingTest(
    'it renders the list of curriculums and add button',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumList @curriculums={{curriculumsList.curriculums}} />
        </template>
      );

      expect(CurriculumListPageObject.addButton).toBeDefined();

      expect(CurriculumListPageObject.items).toBeDefined();
      expect(CurriculumListPageObject.items.length).toBe(
        curriculumsList.curriculums.length
      );

      // the first item in the list should be the most recently modified curriculum
      const sortedByDate = [...curriculumsList.curriculums].sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
      );

      // verify descending order
      assert(
        CurriculumListPageObject.items.length > 1,
        'There should be at least 2 curriculums to test the order'
      );
      for (let i = 1; i < CurriculumListPageObject.items.length; i++) {
        expect(CurriculumListPageObject.items[i]!.titleValue).toBe(
          sortedByDate[i]!.title
        );
      }
    }
  );
});
