import { put } from "@vercel/blob";

export async function uploadImage(
  data: Buffer,
  originalName: string,
  folder: string = "foods"
): Promise<string> {
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const pathname = `${folder}/${timestamp}-${safeName}`;

  const blob = await put(pathname, data, {
    access: "public",
  });

  return blob.url;
}
