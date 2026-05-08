import { supabase } from "@/integrations/supabase/client";

export type Bucket = "hero" | "galeri" | "cms-media" | "ppdb-docs";

export function getStoragePath(bucket: Bucket, value: string) {
  let storagePath = value.trim();
  const marker = `/object/public/${bucket}/`;
  const idx = storagePath.indexOf(marker);
  if (idx >= 0) storagePath = storagePath.substring(idx + marker.length);
  return decodeURIComponent(storagePath.split("?")[0]).replace(/^\/+/, "");
}

export async function uploadFile(bucket: Bucket, file: File, folder = "") {
  const ext = file.name.split(".").pop();
  const path = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function listFiles(bucket: Bucket, folder = ""): Promise<Array<{ name: string; path: string; publicUrl: string; created_at: string | null }>> {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  const files = await Promise.all((data ?? []).filter((f) => !f.name.startsWith(".")).map(async (f) => {
    const fullPath = folder ? `${folder}/${f.name}` : f.name;
    if (!f.id) return listFiles(bucket, fullPath);
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return [{ name: f.name, path: fullPath, publicUrl: pub.publicUrl, created_at: f.created_at }];
  }));
  return files.flat();
}

export async function deleteFile(bucket: Bucket, path: string) {
  const storagePath = getStoragePath(bucket, path);
  const { data, error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw error;
  if (data && data.length > 0) return [storagePath];

  const slash = storagePath.lastIndexOf("/");
  const parent = slash >= 0 ? storagePath.slice(0, slash) : "";
  const name = slash >= 0 ? storagePath.slice(slash + 1) : storagePath;
  const { data: siblings, error: listError } = await supabase.storage.from(bucket).list(parent, { limit: 200 });
  if (listError) throw listError;
  const existing = (siblings ?? []).find((item) => item.name === name);
  if (!existing) return [storagePath];
  if (existing.id) throw new Error("File tidak terhapus dari Supabase Storage");

  const nested = await listFiles(bucket, storagePath);
  if (nested.length === 0) return [storagePath];
  const { error: nestedError } = await supabase.storage.from(bucket).remove(nested.map((f) => f.path));
  if (nestedError) throw nestedError;
  return nested.map((f) => f.path);
}
