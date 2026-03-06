import { expect, describe, assert } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render } from '@ember/test-helpers';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumItemPageObject } from '#src/components/curriculums/curriculum-item.gts';
import curriculumsList from '#src/models/curriculums/curriculums-list.mock.ts';

const curriculum = curriculumsList.curriculums[0]!;

describe('curriculum-item', function () {
  renderingTest.scoped({
    // eslint-disable-next-line no-empty-pattern
    app: ({}, use) => use(TestApp),
  });

  renderingTest(
    'it renders the curriculum and more action button',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template><CurriculumItem @curriculum={{curriculum}} /></template>
      );

      expect(CurriculumItemPageObject.titleInput).toBeDefined();
      expect(CurriculumItemPageObject.lastModified).toBeDefined();
      expect(CurriculumItemPageObject.enterButton).toBeDefined();
      expect(CurriculumItemPageObject.moreActionsButton).toBeDefined();

      expect(CurriculumItemPageObject.titleValue).toBe(curriculum.title);
    }
  );

  renderingTest('The buttons are clickable', async function ({ context }) {
    await initializeTestApp(context.owner, 'en-us');

    await render(
      <template><CurriculumItem @curriculum={{curriculum}} /></template>
    );

    await CurriculumItemPageObject.enterButton();
    await CurriculumItemPageObject.moreActionsButton();

    assert(true, 'Buttons are clickable');
  });
});
