import { env } from "cloudflare:workers";

const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export async function uploadFiles(
  files: File | File[],
  folder = "cache"
): Promise<R2Object[]> {
  const fileList = Array.isArray(files) ? Array.from(files) : [files];

  const uploadPromises = fileList.map((file) => {
    const path = `${folder}/${file.name}`;
    return env.R2.put(path, file);
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(isDefined);
}

export async function downloadFilesToBucket(
  files: { src: string; fileName: string; ext: string }[],
  type: string
): Promise<R2Object[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file.src);
      const blob = await response.blob();
      if (!blob) return null;

      const path = `${type}/${file.fileName}.${file.ext}`;
      return env.R2.put(path, blob);
    })
  );

  return results.filter(isDefined);
}

export async function getFile(env: Env, key: string) {
  const file = await env.R2.get(key);
  if (!file) return null;
  const blob = await file.blob();
  const fileName = file.key.split("/").pop()!;

  return new File([blob], fileName);
}
