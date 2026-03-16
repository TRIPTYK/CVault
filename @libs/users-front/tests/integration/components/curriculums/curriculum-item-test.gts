import { expect, describe, assert, vi } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render } from '@ember/test-helpers';
import CurriculumItem from '#src/components/curriculums/curriculum-item.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumItemPageObject } from '#src/components/curriculums/curriculum-item.gts';
import curriculumsList from '#src/http-mocks/curriculums.ts';

const curriculum = curriculumsList.curriculums[0]!;
const onRefresh = vi.fn();

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
        <template>
          <CurriculumItem @curriculum={{curriculum}} @onRefresh={{onRefresh}} />
        </template>
      );

      expect(CurriculumItemPageObject.titleInput).toBeDefined();
      expect(CurriculumItemPageObject.enterButton).toBeDefined();
      expect(CurriculumItemPageObject.moreActionsButton).toBeDefined();
    }
  );

  renderingTest('The buttons are clickable', async function ({ context }) {
    await initializeTestApp(context.owner, 'en-us');

    await render(
      <template>
        <CurriculumItem @curriculum={{curriculum}} @onRefresh={{onRefresh}} />
      </template>
    );

    await CurriculumItemPageObject.enterButton();

    assert(true, 'Buttons are clickable');
  });
});
