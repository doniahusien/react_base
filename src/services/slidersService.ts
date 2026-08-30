import api from "../lib/axios";
import { normalizeResponse } from "../lib/normalizeResponse";
import { sliderMockService } from "../mocks/bannerMock";
import { USE_MOCK_PAGE_BUILDER } from "./apiMode";
import type { SliderImage } from "../types/sliders";

const RESOURCE = "sliders";

/** A slide to create: an uploaded file (or an existing stored path) plus its meta. */
export interface NewSlide {
  image: string | File;
  alt?: { ar: string; en: string };
  is_active?: boolean;
}

/** The API builds slider URLs by concatenation, which yields `storage//images/...`. */
function cleanImageUrl(url: string): string {
  return url?.replace(/([^:])\/{2,}/g, "$1/") ?? url;
}

function normalizeSlider(slide: SliderImage): SliderImage {
  return { ...slide, image: cleanImageUrl(slide.image) };
}

export const slidersService = {
  /** GET /admin/sliders — in the order they were added (ascending id) */
  async list(activeOnly = false): Promise<SliderImage[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.getSliders(activeOnly);
    }
    const res = await api.get(RESOURCE, {
      params: { is_active: activeOnly ? 1 : undefined },
    });
    return normalizeResponse<SliderImage>(res.data).data.map(normalizeSlider);
  },

  /**
   * POST /admin/sliders — one slide per request, multipart with `image`,
   * `alt[ar]`, `alt[en]`, and `is_active`.
   */
  async add(slides: NewSlide[]): Promise<SliderImage[]> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.addSliders(
        slides.map((s) =>
          typeof s.image === "string" ? s.image : URL.createObjectURL(s.image)
        )
      );
    }
    const created: SliderImage[] = [];
    for (const slide of slides) {
      const fd = new FormData();
      fd.append("image", slide.image);
      fd.append("alt[ar]", slide.alt?.ar ?? "");
      fd.append("alt[en]", slide.alt?.en ?? "");
      fd.append("is_active", slide.is_active === false ? "0" : "1");
      const res = await api.post(RESOURCE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const row = res.data?.data;
      if (row) created.push(normalizeSlider(row));
    }
    return created;
  },

  /**
   * POST /admin/sliders/{id} — the API exposes update over POST, not PUT, so
   * the same route accepts multipart when the image itself changes.
   */
  async update(payload: Partial<SliderImage> & { id: number }): Promise<SliderImage> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.updateSlider(payload);
    }
    const { id, ...body } = payload;
    const res = await api.post(`${RESOURCE}/${id}`, body);
    return normalizeSlider(res.data?.data);
  },

  /** DELETE /admin/sliders/{id} */
  async remove(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.deleteSlider(id);
    }
    await api.delete(`${RESOURCE}/${id}`);
    return true;
  },

  /** PATCH /admin/sliders/{id}/toggle-status — returns the new is_active */
  async toggleStatus(id: number): Promise<boolean> {
    if (USE_MOCK_PAGE_BUILDER) {
      return sliderMockService.toggleSliderStatus(id);
    }
    const res = await api.patch(`${RESOURCE}/${id}/toggle-status`);
    return res.data?.data?.is_active ?? false;
  },
};
