import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { action } from '@ember/object';

import CvIcon from '#src/assets/icons/cv.gts';
import relativeTime from '#src/helpers/relative-time.ts';
import CurriculumMoreActions from '#src/components/curriculums/curriculum-more-actions.gts';

interface CurriculumItemSignature {
  Args: {
    curriculum: {
      id: number;
      title: string;
      lastModified: string;
    };
  };
}

class CurriculumItem extends Component<CurriculumItemSignature> {
    @service declare router: RouterService;

    @action
    focusTitle() {
        const input = document.querySelector(
            `input[name="curriculum-title-${this.args.curriculum.id}"]`
        );

        if (input) {
            (input as HTMLInputElement).focus();
            (input as HTMLInputElement).select();
        }
    }

    goToCurriculum = () => {
        const curriculumId = this.args.curriculum.id;
        this.router.transitionTo('dashboard.curriculums.edit', curriculumId);
    };

    <template>
        <div class="flex flex-col p-5">
            <div class="relative inline-block">
                <button 
                    type="button"
                    class="cursor-pointer mb-3 hover:shadow-lg transition-shadow duration-200" 
                    {{on "click" this.goToCurriculum}}
                >
                    <CvIcon/>
                </button>
                <div class="absolute bottom-5 right-2 z-10">
                    <CurriculumMoreActions @curriculumId={{@curriculum.id}} @onRename={{this.focusTitle}}/>
                </div>
            </div>
            
            <input
                aria-label="Curriculum title"
                name="curriculum-title-{{@curriculum.id}}"
                class="font-medium pb-1 hover:text-blue-600 hover:underline hover:underline-offset-6 focus:outline-none transition-colors duration-200"
                value={{@curriculum.title}}
            />
            <span class="text-sm text-gray-500">
                {{t "curriculums.view.lastModified"}} 
                {{relativeTime @curriculum.lastModified}}
            </span>
        </div>
    </template>
}

export default CurriculumItem;