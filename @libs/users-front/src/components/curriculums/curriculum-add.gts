import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

class CurriculumAdd extends Component<object> {
    @service declare router: RouterService;

    addCurriculum = () => {
        this.router.transitionTo('dashboard.curriculums.create');
    };

    <template>
        <button
            type="button"
            class="flex flex-col cursor-pointer items-center justify-center w-51 m-5 mb-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
            {{on "click" this.addCurriculum}}
        >
            <span class="text-3xl font-bold">+</span>
            <span class="mt-2 text-sm font-medium">
                {{t "curriculums.view.createNewCV"}}
            </span>
        </button>
    </template>
}

export default CurriculumAdd;