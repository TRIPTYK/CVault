export interface Curriculum {
  id: number;
  title: string;
  lastModified: string;
}

export default {
  curriculums: [
    { id: 1, title: 'Curriculum 1', lastModified: '2026-03-01T08:32:12' },
    { id: 2, title: 'Curriculum 2', lastModified: '2026-03-02T10:15:45' },
    { id: 3, title: 'Curriculum 3', lastModified: '2026-03-03T14:22:30' },
    { id: 4, title: 'Curriculum 4', lastModified: '2026-03-04T09:45:00' },
    { id: 5, title: 'Curriculum 5', lastModified: '2026-03-05T16:10:20' },
    { id: 6, title: 'Curriculum 6', lastModified: '2026-03-06T11:05:55' },
  ],
};
