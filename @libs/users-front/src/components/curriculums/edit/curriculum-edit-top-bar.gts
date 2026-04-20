import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type CurriculumService from '#src/services/curriculum.ts';
import { on } from '@ember/modifier';
import type RouterService from '@ember/routing/router-service';
import TpkPrefabButton from '@triptyk/ember-input/components/prefabs/tpk-prefab-button';
import { t } from 'ember-intl';

interface CurriculumTopBarArgs {
  Args: {
    curriculum: {
      id: string | null;
      title: string;
      userId: string;
      updatedAt: string;
    } | null;
  };
}

class CurriculumTopBar extends Component<CurriculumTopBarArgs> {
  @service declare curriculum: CurriculumService;
  @service declare router: RouterService;

  @action
  handleReturnClick() {
    this.router.transitionTo('dashboard.curriculums');
  }

  @action
  async handleDownload() {
    try {
      const blob = await this.curriculum.export(this.args.curriculum?.id || '');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.args.curriculum?.title || 'curriculum'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  }

  @action
  async renameOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      await this.rename((event.target as HTMLInputElement).value);
    }
  }

  @action
  async renameOnBlur(event: FocusEvent) {
    await this.rename((event.target as HTMLInputElement).value);
  }

  async rename(title: string) {
    if (!this.args.curriculum?.id || title === this.args.curriculum?.title)
      return;
    await this.curriculum.rename(this.args.curriculum?.id, title);
  }

  <template>
    <div
      class="flex flex-row bg-[#1D1D20] px-4 py-4 items-center justify-between"
    >
      <TpkPrefabButton
        data-test-curriculum-return-button="{{@curriculum?.id}}"
        @onClick={{this.handleReturnClick}}
        @label={{t "curriculums.edit.returnToList"}}
      />
      <input
        aria-label="Curriculum title"
        data-test-curriculum-title="{{@curriculum?.id}}"
        name="curriculum-title-{{@curriculum?.id}}"
        class="font-medium pb-1 text-white hover:text-blue-600 hover:underline hover:underline-offset-6 focus:outline-none transition-colors duration-200 text-center"
        value={{@curriculum.title}}
        {{on "keydown" this.renameOnEnter}}
        {{on "blur" this.renameOnBlur}}
      />
      <TpkPrefabButton
        data-test-curriculum-download-button="{{@curriculum?.id}}"
        @onClick={{this.handleDownload}}
        @label={{t "curriculums.edit.download"}}
      />
    </div>
  </template>
}

export default CurriculumTopBar;
