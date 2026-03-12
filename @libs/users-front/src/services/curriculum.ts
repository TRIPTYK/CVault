import Service from '@ember/service';
import { service } from '@ember/service';
import { cacheKeyFor, type Store } from '@warp-drive/core';
import {
  createRecord,
  query,
  deleteRecord,
  updateRecord,
} from '@warp-drive/utilities/json-api';
import type { ValidatedCurriculum } from '#src/components/curriculums/curriculum-validation.ts';
import type { Curriculum } from '#src/schemas/curriculums.ts';

export default class CurriculumService extends Service {
  @service declare store: Store;

  public async rename(curriculumId: string, title: string): Promise<void> {
    const curriculum = this.store.peekRecord<Curriculum>(
      'curriculums',
      curriculumId
    );
    if (!curriculum) return;

    const request = updateRecord(curriculum);
    Object.assign(request, { method: 'PATCH' });
    request.body = JSON.stringify({
      data: {
        attributes: { title },
      },
    });

    await this.store.request(request);
  }

  public async delete(curriculumId: string): Promise<void> {
    const curriculum = this.store.peekRecord<Curriculum>(
      'curriculums',
      curriculumId
    );
    if (!curriculum) return;

    const request = deleteRecord(curriculum);
    request.body = JSON.stringify({});

    await this.store.request(request);
    this.store.unloadRecord(curriculum);
  }

  public async findAll(): Promise<Curriculum[]> {
    const result = await this.store.request(
      query('curriculums', {}, { reload: true })
    );
    const content = result.content as unknown as { data: Curriculum[] };
    return content.data ?? [];
  }

  public async create(data: ValidatedCurriculum) {
    const curriculum = this.store.createRecord<Curriculum>('curriculums', data);
    const request = createRecord(curriculum);

    request.body = JSON.stringify({
      data: this.store.cache.peek(cacheKeyFor(curriculum)),
    });

    await this.store.request(request);
  }
}
