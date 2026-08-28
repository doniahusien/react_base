import api from "../lib/axios";
import { normalizeResponse } from "../lib/normalizeResponse";
import { blockTemplatesMockService } from "../mocks/blockTemplatesMock";
import { USE_MOCK_PAGE_BUILDER } from "./apiMode";
import type { BlockTemplate } from "../types/blocks";

// Screens call these functions only. The signatures are the final ones, so
// flipping USE_MOCK_PAGE_BUILDER swaps the data source with no UI change.

const RESOURCE = "block-templates";

export const blockTemplatesService = {
  /** GET /admin/block-templates?category= */
  async list(category?: string): Promise<BlockTemplate[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return blockTemplatesMockService.getTemplates(category);
    }
    const res = await api.get(RESOURCE, {
      params: { category: category && category !== "all" ? category : undefined },
    });
    return normalizeResponse<BlockTemplate>(res.data).data;
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
