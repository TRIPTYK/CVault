import { expect, describe, vi } from 'vitest';
import { renderingTest } from 'ember-vitest';
import { render, click } from '@ember/test-helpers';
import CurriculumMoreActions from '#src/components/curriculums/curriculum-more-actions.gts';
import { initializeTestApp, TestApp } from '../../../app.ts';
import { CurriculumMoreActionsPageObject } from '#src/components/curriculums/curriculum-more-actions.gts';
import curriculumsList from '#src/models/curriculums/curriculums-list.mock.ts';

const curriculumId = curriculumsList.curriculums[0]!.id;
const onRename = vi.fn();
const onDelete = vi.fn();

describe('curriculum-more-actions', function () {
  renderingTest.scoped({
    // eslint-disable-next-line no-empty-pattern
    app: ({}, use) => use(TestApp),
  });

  renderingTest(
    'it renders the more actions button',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      expect(CurriculumMoreActionsPageObject.scope).toBeDefined();
    }
  );

  renderingTest(
    'the dropdown menu is hidden by default',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      expect(CurriculumMoreActionsPageObject.popup).toBeNull();
    }
  );

  renderingTest(
    'clicking the button opens the dropdown menu',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      await click('[data-test-curriculum-more-action-button]');

      expect(document.querySelector('.curriculum-popup')).toBeDefined();
      expect(
        document.querySelector('[data-test-curriculum-more-action-edit-button]')
      ).toBeDefined();
      expect(
        document.querySelector(
          '[data-test-curriculum-more-action-rename-button]'
        )
      ).toBeDefined();
      expect(
        document.querySelector(
          '[data-test-curriculum-more-action-duplicate-button]'
        )
      ).toBeDefined();
      expect(
        document.querySelector(
          '[data-test-curriculum-more-action-download-button]'
        )
      ).toBeDefined();
      expect(
        document.querySelector(
          '[data-test-curriculum-more-action-delete-button]'
        )
      ).toBeDefined();
    }
  );

  renderingTest(
    'clicking the button twice closes the dropdown menu',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      await click('[data-test-curriculum-more-action-button]');
      expect(document.querySelector('.curriculum-popup')).toBeDefined();

      await click('[data-test-curriculum-more-action-button]');
      expect(document.querySelector('.curriculum-popup')).toBeNull();
    }
  );

  renderingTest(
    'clicking edit navigates to the edit route',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      const router = context.owner.lookup('service:router');
      const transitionToSpy = vi.spyOn(router, 'transitionTo');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      await click('[data-test-curriculum-more-action-button]');
      await CurriculumMoreActionsPageObject.editButton();

      expect(transitionToSpy).toHaveBeenCalledWith(
        'dashboard.curriculums.edit',
        curriculumId
      );
    }
  );

  renderingTest(
    'clicking rename calls the onRename callback and closes the menu',
    async function ({ context }) {
      await initializeTestApp(context.owner, 'en-us');

      await render(
        <template>
          <CurriculumMoreActions
            @curriculumId={{curriculumId}}
            @onRename={{onRename}}
            @onDelete={{onDelete}}
          />
        </template>
      );

      await click('[data-test-curriculum-more-action-button]');
      await CurriculumMoreActionsPageObject.renameButton();

      expect(onRename).toHaveBeenCalledOnce();
      expect(document.querySelector('.curriculum-popup')).toBeNull();
    }
  );
});
