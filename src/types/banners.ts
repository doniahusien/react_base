export interface LocalizedText {
  ar: string;
  en: string;
}

/**
 * A single global slider image.
 *
 * Slider images are a shared pool of images used by every page header/banner
 * across the website. The backend returns them as a plain array of images
 * (`sliders`) with EVERY page response — pages themselves never store images,
 * they only store the header/banner texts.
 */
export interface SliderImage {
  id: number;
  image: string;
  alt?: LocalizedText;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
