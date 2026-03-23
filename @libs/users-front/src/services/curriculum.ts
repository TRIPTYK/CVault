import Service from '@ember/service';
import { service } from '@ember/service';
import { cacheKeyFor, type Store } from '@warp-drive/core';
import {
  createRecord,
  query,
  deleteRecord,
  updateRecord,
  findRecord,
} from '@warp-drive/utilities/json-api';
import type { Curriculum } from '#src/schemas/curriculums.ts';
import type { SectionTemplates } from '#src/schemas/section-templates.ts';
import type { Sections } from '#src/schemas/sections.ts';

export default class CurriculumService extends Service {
  @service declare store: Store;

  public async findOne(curriculumId: string): Promise<Curriculum | null> {
    const result = await this.store.request(
      findRecord('curriculums', curriculumId, { reload: true })
    );
    const content = result.content as { data: Curriculum };
    return content.data ?? null;
  }

  public async duplicate(curriculumId: string): Promise<void> {
    await this.store.request({
      method: 'POST',
      url: `/api/v1/curriculums/${curriculumId}/duplicate`,
      body: JSON.stringify({}),
    });
  }

  public async rename(curriculumId: string, title: string): Promise<void> {
    const result = await this.store.request(
      findRecord<Curriculum>('curriculums', curriculumId)
    );
    const curriculum = (result.content as { data: Curriculum }).data;
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
    const result = await this.store.request(
      findRecord<Curriculum>('curriculums', curriculumId)
    );
    const curriculum = (result.content as { data: Curriculum }).data;
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

  public async create() {
    const curriculum = this.store.createRecord<Curriculum>('curriculums', {});
    const request = createRecord(curriculum);

    request.body = JSON.stringify({
      data: this.store.cache.peek(cacheKeyFor(curriculum)),
    });

    try {
      const response = await this.store.request(request);
      const content = response.content as unknown as { data: Curriculum };
      return content.data;
    } catch (e) {
      this.store.unloadRecord(curriculum);
      throw e;
    }
  }

  public async findAllTemplates(): Promise<SectionTemplates[]> {
    const result = await this.store.request<{ data: SectionTemplates[] }>({
      method: 'GET',
      url: `/api/v1/section-templates/`,
    });
    return result.content.data ?? [];
  }

  public async findAllSections(curriculumId: string): Promise<Sections[]> {
    const result = await this.store.request<{ data: Sections[] }>({
      method: 'GET',
      url: `/api/v1/curriculums/${curriculumId}/sections`,
      cacheOptions: { reload: true },
    });
    return result.content.data ?? [];
  }

  public async createSection(
    curriculumId: string,
    templateId: string,
    title: string
  ): Promise<Sections> {
    const section = this.store.createRecord<Sections>('sections', {
      templateId,
      title,
    });
    const request = createRecord(section);

    request.url = `/api/v1/curriculums/${curriculumId}/sections`;
    request.method = 'POST';

    request.body = JSON.stringify({
      data: this.store.cache.peek(cacheKeyFor(section)),
    });

    try {
      const response = await this.store.request(request);
      const content = response.content as unknown as { data: Sections };
      return content.data;
    } catch (e) {
      this.store.unloadRecord(section);
      throw e;
    }
  }

  public async createItem(
    curriculumId: string | null,
    sectionId: string | null
  ): Promise<void> {
    if (!sectionId) return;

    await this.store.request({
      url: `/api/v1/curriculums/${curriculumId}/sections/${sectionId}/items/`,
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  public async deleteSection(
    curriculumId: string,
    sectionId: string | null
  ): Promise<void> {
    if (!sectionId) return;

    try {
      await this.store.request({
        url: `/api/v1/curriculums/${curriculumId}/sections/${sectionId}`,
        method: 'DELETE',
        body: JSON.stringify({}),
      });
    } catch {
      /* pas propre, temporaire */
    }

    const section = this.store.peekRecord<Sections>('sections', sectionId);
    if (section) this.store.unloadRecord(section);
  }

  public async deleteItem(
    curriculumId: string | null,
    sectionId: string | null,
    itemId: string | null
  ): Promise<void> {
    if (!sectionId || !itemId || !curriculumId) return;

    try {
      await this.store.request({
        url: `/api/v1/curriculums/${curriculumId}/sections/${sectionId}/items/${itemId}`,
        method: 'DELETE',
        body: JSON.stringify({}),
      });
    } catch {
      /* pas propre, temporaire */
    }
  }

  public async updateItem(
    key: string,
    value: string,
    curriculumId: string | null,
    sectionId: string | null,
    itemId: string | null
  ): Promise<void> {
    if (!sectionId || !itemId) return;

    await this.store.request({
      url: `/api/v1/curriculums/${curriculumId}/sections/${sectionId}/items/${itemId}`,
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          attributes: {
            [key]: value,
          },
        },
      }),
      op: 'updateRecord',
    });
  }
}
