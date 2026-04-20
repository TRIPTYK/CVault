import Service from '@ember/service';
import { service } from '@ember/service';
import { type Store } from '@warp-drive/core';
import type { Curriculum } from '#src/schemas/curriculums.ts';
import type { SectionTemplates } from '#src/schemas/section-templates.ts';
import type { Sections } from '#src/schemas/sections.ts';
import SessionService from 'ember-simple-auth/services/session';

const API_BASE = '/api/v1';

const Endpoints = {
  curriculums: `${API_BASE}/curriculums`,
  curriculum: (id: string) => `${API_BASE}/curriculums/${id}`,
  curriculumExport: (id: string) => `${API_BASE}/curriculums/${id}/export`,
  curriculumDuplicate: (id: string) =>
    `${API_BASE}/curriculums/${id}/duplicate`,
  sectionTemplates: `${API_BASE}/section-templates`,
  sections: (curriculumId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections`,
  section: (curriculumId: string, sectionId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections/${sectionId}`,
  sectionsReorder: (curriculumId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections/reorder`,
  items: (curriculumId: string, sectionId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections/${sectionId}/items`,
  item: (curriculumId: string, sectionId: string, itemId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections/${sectionId}/items/${itemId}`,
  itemsReorder: (curriculumId: string, sectionId: string) =>
    `${API_BASE}/curriculums/${curriculumId}/sections/${sectionId}/items/reorder`,
} as const;

export class ServiceError extends Error {
  public readonly status: number;
  public readonly serverMessage: string;

  constructor(status: number, serverMessage: string, context: string) {
    super(`[CurriculumService] ${context} (${status}): ${serverMessage}`);
    this.status = status;
    this.serverMessage = serverMessage;
    this.name = 'ServiceError';
  }
}

function toServiceError(context: string, err: unknown): never {
  if (err instanceof ServiceError) throw err;

  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const status = typeof e['status'] === 'number' ? e['status'] : 500;

    if (Array.isArray(e['errors']) && e['errors'].length > 0) {
      const first = e['errors'][0] as Record<string, unknown>;
      const detail =
        typeof first['detail'] === 'string'
          ? first['detail']
          : JSON.stringify(first);
      throw new ServiceError(status, detail, context);
    }

    if (typeof e['message'] === 'string') {
      throw new ServiceError(status, e['message'], context);
    }
  }

  throw new ServiceError(500, 'Une erreur inattendue est survenue.', context);
}

function isEmptyResponseError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  const msg = typeof e['message'] === 'string' ? e['message'] : '';
  return (
    msg.includes('Expected a JSON:API Document') ||
    msg.includes('JSON:API Document as the content')
  );
}

export default class CurriculumService extends Service {
  @service declare store: Store;
  @service declare session: SessionService;

  // ── Curriculums ───────────────────────────────────────────────────────────
  public async findOne(curriculumId: string): Promise<Curriculum> {
    try {
      const result = await this.store.request<{ data: Curriculum }>({
        method: 'GET',
        url: Endpoints.curriculum(curriculumId),
        cacheOptions: { reload: true },
      });
      return result.content.data;
    } catch (err) {
      toServiceError(`findOne(${curriculumId})`, err);
    }
  }

  public async findAll(): Promise<Curriculum[]> {
    try {
      const result = await this.store.request<{ data: Curriculum[] }>({
        method: 'GET',
        url: Endpoints.curriculums,
        cacheOptions: { reload: true },
      });
      return result.content.data ?? [];
    } catch (err) {
      toServiceError('findAll()', err);
    }
  }

  public async create(
    attributes: Partial<Curriculum> = {}
  ): Promise<Curriculum> {
    try {
      const result = await this.store.request<{ data: Curriculum }>({
        method: 'POST',
        url: Endpoints.curriculums,
        body: JSON.stringify({ data: { type: 'curriculums', attributes } }),
      });
      return result.content.data;
    } catch (err) {
      toServiceError('create()', err);
    }
  }

  public async rename(
    curriculumId: string,
    title: string
  ): Promise<Curriculum> {
    try {
      const result = await this.store.request<{ data: Curriculum }>({
        method: 'PATCH',
        url: Endpoints.curriculum(curriculumId),
        body: JSON.stringify({ data: { attributes: { title } } }),
      });
      return result.content.data;
    } catch (err) {
      toServiceError(`rename(${curriculumId})`, err);
    }
  }

  public async duplicate(curriculumId: string): Promise<void> {
    try {
      await this.store.request({
        method: 'POST',
        url: Endpoints.curriculumDuplicate(curriculumId),
        body: JSON.stringify({}),
      });
    } catch (err) {
      toServiceError(`duplicate(${curriculumId})`, err);
    }
  }

  public async delete(curriculumId: string): Promise<void> {
    try {
      await this.store.request({
        method: 'DELETE',
        url: Endpoints.curriculum(curriculumId),
        body: JSON.stringify({}),
      });
    } catch (err) {
      if (isEmptyResponseError(err)) {
        return;
      }

      toServiceError(`delete(${curriculumId})`, err);
    }
  }

  public async export(curriculumId: string): Promise<Blob> {
    try {
      const url = Endpoints.curriculumExport(curriculumId);

      if (
        !this.session.isAuthenticated ||
        !this.session.data.authenticated.data
      ) {
        throw new Error('User is not authenticated');
      }

      const token = this.session.data.authenticated.data as unknown as {
        accessToken: string;
      };
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (err) {
      toServiceError(`export(${curriculumId})`, err);
    }
  }

  // ── Section templates ─────────────────────────────────────────────────────

  public async findAllTemplates(): Promise<SectionTemplates[]> {
    try {
      const result = await this.store.request<{ data: SectionTemplates[] }>({
        method: 'GET',
        url: Endpoints.sectionTemplates,
        cacheOptions: { reload: true },
      });
      return result.content.data ?? [];
    } catch (err) {
      toServiceError('findAllTemplates()', err);
    }
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  public async findAllSections(curriculumId: string): Promise<Sections[]> {
    try {
      const result = await this.store.request<{ data: Sections[] }>({
        method: 'GET',
        url: Endpoints.sections(curriculumId),
        cacheOptions: { reload: true },
      });
      return result.content.data ?? [];
    } catch (err) {
      toServiceError(`findAllSections(${curriculumId})`, err);
    }
  }

  public async createSection(
    curriculumId: string,
    templateId: string,
    title: string
  ): Promise<Sections> {
    try {
      const result = await this.store.request<{ data: Sections }>({
        method: 'POST',
        url: Endpoints.sections(curriculumId),
        body: JSON.stringify({
          data: { type: 'sections', attributes: { templateId, title } },
        }),
      });
      return result.content.data;
    } catch (err) {
      toServiceError(`createSection(${curriculumId})`, err);
    }
  }

  public async updateOrderSections(
    curriculumId: string,
    order: string[]
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'PATCH',
        url: Endpoints.sectionsReorder(curriculumId),
        body: JSON.stringify({ order }),
      });
    } catch (err) {
      if (isEmptyResponseError(err)) {
        return;
      }
      toServiceError(`updateOrderSections(${curriculumId})`, err);
    }
  }

  public async deleteSection(
    curriculumId: string,
    sectionId: string
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'DELETE',
        url: Endpoints.section(curriculumId, sectionId),
        body: JSON.stringify({}),
      });
    } catch (err) {
      if (isEmptyResponseError(err)) {
        return;
      }
      toServiceError(`deleteSection(${curriculumId}, ${sectionId})`, err);
    }
  }

  public async updateSection(
    curriculumId: string,
    sectionId: string,
    isActive: boolean
  ): Promise<void> {
    console.log('Updating section', { curriculumId, sectionId, isActive });
    try {
      await this.store.request({
        method: 'PATCH',
        url: Endpoints.section(curriculumId, sectionId),
        body: JSON.stringify({ isActive: isActive }),
      });
    } catch (err) {
      toServiceError(`updateSection(${curriculumId}, ${sectionId})`, err);
    }
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  public async createItem(
    curriculumId: string,
    sectionId: string
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'POST',
        url: Endpoints.items(curriculumId, sectionId),
        body: JSON.stringify({}),
      });
    } catch (err) {
      toServiceError(`createItem(${curriculumId}, ${sectionId})`, err);
    }
  }

  public async updateItem(
    curriculumId: string,
    sectionId: string,
    itemId: string,
    attributes: Record<string, string>
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'PATCH',
        url: Endpoints.item(curriculumId, sectionId, itemId),
        body: JSON.stringify({ data: { attributes } }),
      });
    } catch (err) {
      toServiceError(
        `updateItem(${curriculumId}, ${sectionId}, ${itemId})`,
        err
      );
    }
  }

  public async deleteItem(
    curriculumId: string,
    sectionId: string,
    itemId: string
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'DELETE',
        url: Endpoints.item(curriculumId, sectionId, itemId),
        body: JSON.stringify({}),
      });
    } catch (err) {
      if (isEmptyResponseError(err)) {
        return;
      }
      toServiceError(
        `deleteItem(${curriculumId}, ${sectionId}, ${itemId})`,
        err
      );
    }
  }

  public async updateOrderItems(
    curriculumId: string,
    sectionId: string,
    order: string[]
  ): Promise<void> {
    try {
      await this.store.request({
        method: 'PATCH',
        url: Endpoints.itemsReorder(curriculumId, sectionId),
        body: JSON.stringify({ data: { attributes: { order } } }),
      });
    } catch (err) {
      if (isEmptyResponseError(err)) {
        return;
      }
      toServiceError(`updateOrderItems(${curriculumId}, ${sectionId})`, err);
    }
  }

  public async uploadFile(
    curriculumId: string,
    sectionId: string,
    itemId: string,
    file: File
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      await this.store.request({
        method: 'POST',
        url: `${Endpoints.item(curriculumId, sectionId, itemId)}/pdp`,
        body: formData,
      });
    } catch (err) {
      toServiceError(
        `uploadFile(${curriculumId}, ${sectionId}, ${itemId})`,
        err
      );
    }
  }

  public async getFile(
    curriculumId: string,
    sectionId: string,
    itemId: string,
    fieldname: string
  ): Promise<string> {
    try {
      const url = `${Endpoints.item(curriculumId, sectionId, itemId)}/pdp/${fieldname}`;

      if (
        !this.session.isAuthenticated ||
        !this.session.data.authenticated.data
      ) {
        throw new Error('User is not authenticated');
      }

      const token = this.session.data.authenticated.data as unknown as {
        accessToken: string;
      };
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob: Blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      toServiceError(
        `getFile(${curriculumId}, ${sectionId}, ${itemId}, ${fieldname})`,
        err
      );
    }
  }
}
