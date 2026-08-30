import api from "../lib/axios";

/**
 * POST /admin/upload-image — multipart, field name `file`.
 * Returns the stored path the backend saved the file under, which is what
 * slider rows and the `image` fields inside block content store.
 */
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("upload-image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data?.data;
  const path =
    typeof data === "string"
      ? data
      : data?.path ?? data?.url ?? data?.image ?? data?.image_url ?? data?.file;
  if (!path) {
    throw new Error(res.data?.message || "Image upload failed");
  }
  return path as string;
}
