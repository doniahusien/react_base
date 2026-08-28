import api from "../lib/axios";
import { normalizeResponse } from "../lib/normalizeResponse";
import { pageBuilderMockService } from "../mocks/pageBuilderMock";
import { normalizeBlockType } from "../mocks/blockTemplatesMock";
import { GUEST_BASE_URL, USE_MOCK_PAGE_BUILDER } from "./apiMode";
import type { Page, PageSection } from "../types/pageBuilder";

const RESOURCE = "pages";

export interface PageListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  is_published?: boolean;
}

/** Legacy block ids are rewritten on read so old rows keep working. */
function migrateSections(page: Page): Page {
  return {
    ...page,
    sections: page.sections?.map((s) => ({ ...s, type: normalizeBlockType(s.type) })),
  };
}

export const pagesService = {
  /** GET /admin/pages */
  async list(params?: PageListParams): Promise<Page[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.getPages();
    }
    const res = await api.get(RESOURCE, {
      params: {
        page: params?.page,
        per_page: params?.per_page ?? 100,
        search: params?.search || undefined,
        type: params?.type && params.type !== "all" ? params.type : undefined,
        is_published: params?.is_published,
      },
    });
    return normalizeResponse<Page>(res.data).data;
  },

  /** GET /admin/pages/{id} — includes sections in stored order */
  async get(id: number): Promise<Page | null> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.getPageById(id);
    }
    const res = await api.get(`${RESOURCE}/${id}`);
    const page = res.data?.data;
    return page ? migrateSections(page) : null;
  },

  /** GET /guest/pages/{slug} — public read, used for preview */
  async getBySlug(slug: string): Promise<Page | null> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.getPageBySlug(slug);
    }
    const res = await api.get(`${GUEST_BASE_URL}/guest/pages/${slug}`);
    const page = res.data?.data;
    return page ? migrateSections(page) : null;
  },

  /** POST /admin/pages on create, PUT /{id} on update */
  async save(payload: Partial<Page> & { id?: number }): Promise<Page> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.savePage(payload);
    }
    const res = payload.id
      ? await api.put(`${RESOURCE}/${payload.id}`, payload)
      : await api.post(RESOURCE, payload);
    return res.data?.data;
  },

  /** DELETE /admin/pages/{id} */
  async remove(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.deletePage(id);
    }
    await api.delete(`${RESOURCE}/${id}`);
    return true;
  },

  /** PATCH /admin/pages/{id}/toggle-status — returns the new is_published */
  async toggleStatus(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.togglePageStatus(id);
    }
    const res = await api.patch(`${RESOURCE}/${id}/toggle-status`);
    return res.data?.data?.is_published ?? false;
  },

  /**
   * PUT /admin/pages/{id}/sections — replaces the whole section list.
   * The array order IS the render order; the server must persist it as sent.
   */
  async saveSections(pageId: number, sections: PageSection[]): Promise<PageSection[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return pageBuilderMockService.savePageSections(pageId, sections);
    }
    const res = await api.put(`${RESOURCE}/${pageId}/sections`, {
      sections: sections.map((s) => ({
        id: s.id,
        type: normalizeBlockType(s.type),
        is_active: s.is_active,
        content: s.content,
      })),
    });
    return normalizeResponse<PageSection>(res.data).data;
  },
};
