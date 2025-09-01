import path from 'path';
import { fileURLToPath } from 'url';

export function getPath(relativePath) {
  const baseDir = fileURLToPath(new URL('..', import.meta.url));
  return path.join(baseDir, relativePath);
}

