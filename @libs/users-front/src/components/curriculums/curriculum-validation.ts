import { object, string } from 'zod';
import type z from 'zod';
import type { IntlService } from 'ember-intl';

export const editCurriculumValidationSchema = (intl: IntlService) =>
  object({
    title: string(intl.t('curriculums.validation.titleRequired'))
      .min(1, intl.t('curriculums.validation.minimumTitleLength'))
      .max(255, intl.t('curriculums.validation.maximumTitleLength')),
  });

export type UpdatedCurriculum = z.infer<
  ReturnType<typeof editCurriculumValidationSchema>
>;
