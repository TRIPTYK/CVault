import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { t, type IntlService } from 'ember-intl';

import TpkForm from '@triptyk/ember-input-validation/components/tpk-form';

import { type SchemaField } from '#src/schemas/section-templates.ts';
import getPrefabForField from '#src/services/schema-field-map.ts';
import { buildChangeset } from '#src/services/schema-to-changeset.ts';
import buildValidationSchema from '#src/services/schema-to-changeset.ts';

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
    return buildValidationSchema(this.args.fields, this.intl);
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
