import api from "../lib/axios";
import { normalizeResponse } from "../lib/normalizeResponse";
import { blockTemplatesMockService } from "../mocks/blockTemplatesMock";
import { USE_MOCK_PAGE_BUILDER } from "./apiMode";
import type { BlockTemplate } from "../types/blocks";

// Screens call these functions only. The signatures are the final ones, so
// flipping USE_MOCK_PAGE_BUILDER swaps the data source with no UI change.

const RESOURCE = "block-templates";

export interface BlockTemplateListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
}

export interface BlockTemplateListResult {
  data: BlockTemplate[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from?: number;
    to?: number;
  };
  /** Category slugs the API reports as available, used to build the filter. */
  categories: string[];
}

export const blockTemplatesService = {
  /** GET /admin/block-templates?category= */
  async list(category?: string): Promise<BlockTemplate[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.getTemplates(category);
    }
    const res = await api.get(RESOURCE, {
      params: {
        category: category && category !== "all" ? category : undefined,
        per_page: 100,
      },
    });
    return normalizeResponse<BlockTemplate>(res.data, "templates").data;
  },

  /** GET /admin/block-templates?page=&per_page=&search=&category= */
  async listPaged(
    params: BlockTemplateListParams = {}
  ): Promise<BlockTemplateListResult> {
    const { page = 1, per_page = 15, search, category } = params;

    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.getTemplatesPaged({
        page,
        per_page,
        search,
        category,
      });
    }

    const res = await api.get(RESOURCE, {
      params: {
        page,
        per_page,
        search: search?.trim() || undefined,
        category: category && category !== "all" ? category : undefined,
      },
    });

    const normalized = normalizeResponse<BlockTemplate>(res.data, "templates");
    const rawMeta: any = normalized.meta ?? {};
    return {
      data: normalized.data,
      meta: {
        total: rawMeta.total ?? normalized.data.length,
        current_page: rawMeta.current_page ?? page,
        last_page: rawMeta.last_page ?? 1,
        per_page: rawMeta.per_page ?? per_page,
        from: rawMeta.from,
        to: rawMeta.to,
      },
      categories: Array.isArray(rawMeta.categories) ? rawMeta.categories : [],
    };
  },

  /** GET /admin/block-templates/{id} */
  async get(id: string): Promise<BlockTemplate | null> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.getTemplateById(id);
    }
    const res = await api.get(`${RESOURCE}/${id}`);
    return res.data?.data ?? null;
  },

  /** POST /admin/block-templates on create, PUT /{id} on update */
  async save(
    payload: Partial<BlockTemplate> & { id: string },
    isNew: boolean
  ): Promise<BlockTemplate> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.saveTemplate(payload);
    }
    const res = isNew
      ? await api.post(RESOURCE, payload)
      : await api.put(`${RESOURCE}/${payload.id}`, payload);
    return res.data?.data;
  },

  /** PATCH /admin/block-templates/{id}/toggle-status — returns the new is_active */
  async toggleStatus(id: string): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.toggleTemplateStatus(id);
    }
    const res = await api.patch(`${RESOURCE}/${id}/toggle-status`);
    return res.data?.data?.is_active ?? false;
  },

  /** DELETE /admin/block-templates/{id} */
  async remove(id: string): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.deleteTemplate(id);
    }
    await api.delete(`${RESOURCE}/${id}`);
    return true;
  },
};
