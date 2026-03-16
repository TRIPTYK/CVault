// edit.gts
import Route from '@ember/routing/route';

export default class CurriculumsEditRoute extends Route {
  model(params: { curriculum_id: string }) {
    return { id: params.curriculum_id };
  }
}
