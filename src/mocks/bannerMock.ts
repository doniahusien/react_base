import type { SliderImage } from "../types/banners";

/**
 * Global Slider Images pool.
 *
 * These images are shared across ALL website pages. The backend attaches them
 * as a plain array (`sliders`) to every page API response, and each page header
 * / banner block simply renders its own texts over this rotating carousel.
 */
export const INITIAL_MOCK_SLIDERS: SliderImage[] = [
  {
    id: 1,
    image: "/images/slider1.webp",
    alt: { ar: "قاعة محكمة", en: "Court hall" },
    sort_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    image: "/images/slider2.webp",
    alt: { ar: "اجتماع قانوني", en: "Legal meeting" },
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    image: "/images/slider3.webp",
    alt: { ar: "توقيع عقد", en: "Contract signing" },
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    image: "/images/slider4.webp",
    alt: { ar: "مكتب محاماة", en: "Law firm office" },
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    image: "/images/slider5.webp",
    alt: { ar: "استشارة قانونية", en: "Legal consultation" },
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    image: "/images/slider6.webp",
    alt: { ar: "مرافعة قضائية", en: "Court pleading" },
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    image: "/images/slider7.webp",
    alt: { ar: "وثائق قانونية", en: "Legal documents" },
    sort_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = "elwaseet_sliders_storage_v1";

function loadSliders(): SliderImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load slider images from localStorage", e);
  }
  saveSliders(INITIAL_MOCK_SLIDERS);
  return INITIAL_MOCK_SLIDERS;
}

function saveSliders(sliders: SliderImage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sliders));
  } catch (e) {
    console.error("Failed to save slider images", e);
  }
}

export const sliderMockService = {
  getSliders: async (activeOnly = false): Promise<SliderImage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sliders = loadSliders()
          .filter((s) => (activeOnly ? s.is_active : true))
          .sort((a, b) => a.sort_order - b.sort_order);
        resolve(sliders);
      }, 150);
    });
  },

  /** Exactly what backend attaches to every page response. */
  getSliderImages: async (): Promise<string[]> => {
    const sliders = await sliderMockService.getSliders(true);
    return sliders.map((s) => s.image);
  },

  addSliders: async (images: string[]): Promise<SliderImage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sliders = loadSliders();
        let maxId = sliders.reduce((max, s) => Math.max(max, s.id), 0);
        const created = images.map((image, i) => ({
          id: ++maxId,
          image,
          sort_order: sliders.length + i,
          is_active: true,
          created_at: new Date().toISOString(),
        }));
        const updated = [...sliders, ...created];
        saveSliders(updated);
        resolve(created);
      }, 200);
    });
  },

  updateSlider: async (
    payload: Partial<SliderImage> & { id: number }
  ): Promise<SliderImage> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sliders = loadSliders();
        const index = sliders.findIndex((s) => s.id === payload.id);
        if (index === -1) {
          reject(new Error(`Slider image ${payload.id} not found`));
          return;
        }
        const saved: SliderImage = {
          ...sliders[index],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        sliders[index] = saved;
        saveSliders(sliders);
        resolve(saved);
      }, 200);
    });
  },

  deleteSlider: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sliders = loadSliders()
          .filter((s) => s.id !== id)
          .map((s, idx) => ({ ...s, sort_order: idx }));
        saveSliders(sliders);
        resolve(true);
      }, 150);
    });
  },

  toggleSliderStatus: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sliders = loadSliders().map((s) =>
          s.id === id ? { ...s, is_active: !s.is_active } : s
        );
        saveSliders(sliders);
        resolve(true);
      }, 120);
    });
  },

  reorderSliders: async (
    order: { id: number; sort_order: number }[]
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sliders = loadSliders().map((s) => {
          const found = order.find((o) => o.id === s.id);
          return found ? { ...s, sort_order: found.sort_order } : s;
        });
        saveSliders(sliders.sort((a, b) => a.sort_order - b.sort_order));
        resolve(true);
      }, 150);
    });
  },
};
