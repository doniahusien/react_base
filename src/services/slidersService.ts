import api from "../lib/axios";
import { normalizeResponse } from "../lib/normalizeResponse";
import { sliderMockService } from "../mocks/bannerMock";
import { USE_MOCK_PAGE_BUILDER } from "./apiMode";
import type { SliderImage } from "../types/banners";

const RESOURCE = "sliders";

export const slidersService = {
  /** GET /admin/sliders — in the order they were added (ascending id) */
  async list(activeOnly = false): Promise<SliderImage[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.getSliders(activeOnly);
    }
    const res = await api.get(RESOURCE, {
      params: { is_active: activeOnly ? 1 : undefined },
    });
    return normalizeResponse<SliderImage>(res.data).data;
  },

  /** POST /admin/sliders — body { images: [path, ...] } */
  async add(images: string[]): Promise<SliderImage[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.addSliders(images);
    }
    const res = await api.post(RESOURCE, { images });
    return normalizeResponse<SliderImage>(res.data).data;
  },

  /** PUT /admin/sliders/{id} — image, alt text, is_active */
  async update(payload: Partial<SliderImage> & { id: number }): Promise<SliderImage> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.updateSlider(payload);
    }
    const res = await api.put(`${RESOURCE}/${payload.id}`, payload);
    return res.data?.data;
  },

  /** DELETE /admin/sliders/{id} */
  async remove(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.deleteSlider(id);
    }
    await api.delete(`${RESOURCE}/${id}`);
    return true;
  },

  /** PATCH /admin/sliders/{id}/toggle-status */
  async toggleStatus(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.toggleSliderStatus(id);
    }
    await api.patch(`${RESOURCE}/${id}/toggle-status`);
    return true;
  },
};
