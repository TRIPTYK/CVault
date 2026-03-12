import { describe, expect, vi } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render } from '@ember/test-helpers';
import CurriculumList from '#src/components/curriculums/curriculum-list.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumListPageObject } from '#src/components/curriculums/curriculum-list.gts';
import type CurriculumService from '#src/services/curriculum.ts';
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

      const curriculumService = context.owner.lookup(
        'service:curriculum'
      ) as CurriculumService;
      curriculumService.findAll = vi
        .fn()
        .mockResolvedValue(curriculumsList.curriculums);

      await render(<template><CurriculumList /></template>);

      expect(CurriculumListPageObject.addButton).toBeDefined();
      expect(CurriculumListPageObject.items).toBeDefined();
    }
  );
});
