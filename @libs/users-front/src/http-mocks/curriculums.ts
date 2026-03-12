// #src/models/curriculums/curriculums-list.mock.ts
import type { Curriculum } from '#src/schemas/curriculums.ts';

const curriculumsList: { curriculums: Curriculum[] } = {
  curriculums: [
    {
      id: '31745a59-c528-478a-b588-0dd0f041300b',
      title: 'Mon CV 1',
      updatedAt: '2026-03-11T16:20:45.778Z',
      userId: 'e2e-login-user',
    },
    {
      id: '33f45610-33e4-4a8d-92cf-b8b419dbd44e',
      title: 'Mon CV 2',
      updatedAt: '2026-03-11T16:22:52.381Z',
      userId: 'e2e-login-user',
    },
    {
      id: '44f9f254-7ff8-457a-838c-29c4e9703900',
      title: 'Mon CV 3',
      updatedAt: '2026-03-11T16:23:16.747Z',
      userId: 'e2e-login-user',
    },
  ] as unknown as Curriculum[],
};

export default curriculumsList;
