import JSZip from 'jszip';

/**
 * Utility to extract images from a ZIP file and naturally sort them.
 * Single Responsibility: ZIP Archive Processing & Natural File Sorting.
 */

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

/**
 * Checks whether a given File is a ZIP archive
 */
export const isZipFile = (file: File): boolean => {
  return (
    file.name.toLowerCase().endsWith('.zip') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.type === 'application/zip-compressed'
  );
};

/**
 * Extract image files from a ZIP archive and return them sorted naturally
 */
export const extractImagesFromZip = async (
  zipFile: File,
  onProgress?: (extractedCount: number, totalEntries: number) => void
): Promise<File[]> => {
  const zip = new JSZip();
  const content = await zip.loadAsync(zipFile);

  // Filter valid image entries, discarding directories & OS junk (__MACOSX, .DS_Store, etc.)
  const imageEntries = Object.keys(content.files).filter((relativePath) => {
    const entry = content.files[relativePath];
    if (entry.dir) return false;

    // Filter out macOS metadata & hidden system files
    if (
      relativePath.includes('__MACOSX/') ||
      relativePath.split('/').some((part) => part.startsWith('.'))
    ) {
      return false;
    }

    const lower = relativePath.toLowerCase();
    return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
  });

  // Natural Alphanumeric Sorting (e.g. 1.jpg, 2.jpg, 10.jpg instead of 1.jpg, 10.jpg, 2.jpg)
  imageEntries.sort((a, b) => {
    const filenameA = a.split('/').pop() || a;
    const filenameB = b.split('/').pop() || b;
    return filenameA.localeCompare(filenameB, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  const extractedFiles: File[] = [];
  const total = imageEntries.length;

  for (let i = 0; i < total; i++) {
    const path = imageEntries[i];
    const zipEntry = content.files[path];
    const filename = path.split('/').pop() || path;

    const blob = await zipEntry.async('blob');

    // Infer MIME type from file extension
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.bmp') mimeType = 'image/bmp';

    const extractedFile = new File([blob], filename, {
      type: mimeType,
      lastModified: Date.now(),
    });

    extractedFiles.push(extractedFile);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return extractedFiles;
};
