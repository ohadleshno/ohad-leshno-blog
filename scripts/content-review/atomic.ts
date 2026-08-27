import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function atomicWriteFile(filePath: string, contents: string): Promise<void> {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
  const tempPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  await writeFile(tempPath, contents, { encoding: 'utf8' });
  await rename(tempPath, filePath);
}
