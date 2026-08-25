import api from "./axios";

const GENERAL_BASE = (import.meta.env.VITE_BASE_URL_GENERAL as string) ?? "";

/** Upload blog image via guest endpoint; returns relative `image_url` from API. */
export async function uploadBlogImage(
  blogId: number | string,
  file: File
): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`guest/blogs/${blogId}/upload-image`, fd, {
    baseURL: GENERAL_BASE,
    headers: { "Content-Type": "multipart/form-data" },
  });
  const imageUrl = res.data?.data?.image_url as string | undefined;
  if (!imageUrl) {
    throw new Error(res.data?.message || "Image upload failed");
  }
  return imageUrl;
}
