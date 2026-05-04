import type { SchemaField } from '#src/schemas/section-templates.ts';

export type PrefabType =
  | 'TpkInputPrefab'
  | 'TpkTextareaPrefab'
  | 'TpkFilePrefab'
  | 'TpkDatepickerPrefab';

export const FIELD_TYPE_TO_PREFAB: Record<string, PrefabType> = {
  text: 'TpkInputPrefab',
  tel: 'TpkInputPrefab',
  email: 'TpkInputPrefab',
  date: 'TpkDatepickerPrefab',
  textarea: 'TpkTextareaPrefab',
  file: 'TpkFilePrefab',
};

export default function getPrefabForField(field: SchemaField): PrefabType {
  return FIELD_TYPE_TO_PREFAB[field.type] ?? 'TpkInputPrefab';
}
