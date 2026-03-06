import { expect, describe, vi } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render, click } from '@ember/test-helpers';
import CurriculumAdd from '#src/components/curriculums/curriculum-add.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumAddPageObject } from '#src/components/curriculums/curriculum-add.gts';

describe('curriculum-add', function () {
  renderingTest.scoped({
    // eslint-disable-next-line no-empty-pattern
    app: ({}, use) => use(TestApp),
  });

  renderingTest('it renders the add button', async function ({ context }) {
    await initializeTestApp(context.owner, 'en-us');

    await render(<template><CurriculumAdd /></template>);

    expect(CurriculumAddPageObject.addButton).toBeDefined();
  });

  renderingTest(
    'clicking the add button triggers navigation',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      const router = context.owner.lookup('service:router');
      const transitionToSpy = vi.spyOn(router, 'transitionTo');

      await render(<template><CurriculumAdd /></template>);

      await click(CurriculumAddPageObject.addButton);

      expect(transitionToSpy).toHaveBeenCalledWith(
        'dashboard.curriculums.create'
      );
    }
  );
});
