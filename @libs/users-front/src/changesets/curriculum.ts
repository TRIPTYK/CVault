import ImmerChangeset from 'ember-immer-changeset';

export interface DraftCurriculum {
  id?: string;
  userId?: string;
  title?: string;
  updatedAt?: string;
}

export class CompleteCurriculumChangeset extends ImmerChangeset<DraftCurriculum> {}

type FormCurriculum = { title: string };

export class CurriculumChangeset extends ImmerChangeset<FormCurriculum> {}
