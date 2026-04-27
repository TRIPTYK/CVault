import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { t, type IntlService } from 'ember-intl';

import TpkForm from '@triptyk/ember-input-validation/components/tpk-form';
import TpkInputPrefab from '@triptyk/ember-input-validation/components/tpk-validation-input';
import TpkTextareaPrefab from '@triptyk/ember-input-validation/components/tpk-validation-textarea';
import TpkFilePrefab from '@triptyk/ember-input-validation/components/tpk-validation-file';
import TpkDatepickerPrefab from '@triptyk/ember-input-validation/components/tpk-validation-datepicker';

import type { SchemaField } from '#src/schemas/section-templates.ts';
import { getPrefabForField } from '#src/helpers/schema-field-map.ts';
import {
  buildChangeset,
  buildValidationSchema,
} from '#src/helpers/schema-to-changeset.ts';

const PREFAB_COMPONENTS = {
  TpkInputPrefab,
  TpkTextareaPrefab,
  TpkDatepickerPrefab,
  TpkFilePrefab,
} as const;

interface DynamicSectionFormSignature {
  Element: HTMLDivElement;
  Args: {
    fields: SchemaField[];
    fillInfos?: Record<string, string | FileList>;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
  };
}

const eq = (a: unknown, b: unknown) => a === b;

class DynamicSectionForm extends Component<DynamicSectionFormSignature> {
  @service declare intl: IntlService;

  @cached
  get changeset() {
    return buildChangeset(this.args.fields, this.args.fillInfos);
  }

  @cached
  get validationSchema() {
    return buildValidationSchema(this.args.fields);
  }

  getPrefabComponent(field: SchemaField) {
    const prefabType = getPrefabForField(field);
    return PREFAB_COMPONENTS[prefabType];
  }

  getPrefabType(field: SchemaField) {
    return getPrefabForField(field);
  }

  <template>
    <TpkForm
      @changeset={{this.changeset}}
      @onSubmit={{@onSubmit}}
      @validationSchema={{this.validationSchema}}
      as |F|
    >
      {{#each @fields as |field|}}
        {{#let (this.getPrefabType field) as |prefabType|}}
          {{#if (eq prefabType "TpkTextareaPrefab")}}
            <F.TpkTextareaPrefab
              @label={{field.label}}
              @validationField={{field.key}}
              class="col-span-12"
            />
          {{else if (eq prefabType "TpkFilePrefab")}}
            <F.TpkFilePrefab
              @label={{field.label}}
              @validationField={{field.key}}
              class="col-span-12"
            />
          {{else if (eq prefabType "TpkDatepickerPrefab")}}
            <F.TpkDatepickerPrefab
              @label={{field.label}}
              @validationField={{field.key}}
              class="col-span-12"
            />
          {{else}}
            <F.TpkInputPrefab
              @label={{field.label}}
              @validationField={{field.key}}
              class="col-span-12"
            />
          {{/if}}
        {{/let}}
      {{/each}}

      <button type="submit" class="btn btn-primary">
        {{t "curriculums.edit.saveItem"}}
      </button>
    </TpkForm>
  </template>
}

export default DynamicSectionForm;
