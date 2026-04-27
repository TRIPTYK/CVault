import ImmerChangeset from 'ember-immer-changeset';
import { z } from 'zod';
import type { SchemaField } from '#src/schemas/section-templates.ts';

export type DynamicFormData = Record<string, string | FileList>;

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function buildValidationSchema(
  fields: SchemaField[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let rule: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
        rule = z.string().max(255, 'Maximum length is 255 characters');
        break;
      case 'tel':
        rule = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
        break;
      case 'email':
        rule = z.string().email('Invalid email address');
        break;
      case 'date':
        // TODO : gérer la validation de date (format, pas dans le futur...)
        rule = z.any();
        break;
      case 'textarea':
        rule = z.string().max(4000, 'Maximum length is 4000 characters');
        break;
      case 'file':
        // TODO : gérer la validation de fichier (taille, type)
        rule = z.any();
        break;
      default:
        rule = z.string();
    }

    if ('minLength' in field && typeof field.minLength === 'number') {
      rule = (rule as z.ZodString).min(field.minLength);
    }
    if ('maxLength' in field && typeof field.maxLength === 'number') {
      rule = (rule as z.ZodString).max(field.maxLength);
    }

    shape[field.key] = rule;
  }

  return z.object(shape);
}

export function buildChangeset(
  fields: SchemaField[],
  fillInfos?: Record<string, string | FileList>
): ImmerChangeset<DynamicFormData> {
  const initial: DynamicFormData = Object.fromEntries(
    fields.map((f) => [f.key, fillInfos?.[f.key] ?? ''])
  );
  return new ImmerChangeset<DynamicFormData>(initial);
}
