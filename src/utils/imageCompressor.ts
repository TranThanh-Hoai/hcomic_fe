/**
 * Utility to compress and resize image files client-side using HTML5 Canvas API.
 * Keeps CPU/RAM usage off Vercel server and drastically speeds up upload speeds.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0 (default 0.8 = 80%)
  outputType?: 'image/webp' | 'image/jpeg';
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Compress a single image file
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 2560,
    quality = 0.8,
    outputType = 'image/webp',
  } = options;

  // If not an image file (e.g. SVG or non-image), skip compression
  if (!file.type.startsWith('image/')) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original if canvas context unavailable
          return;
        }

        // Draw and resize image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with 80% quality (0.8)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const ext = outputType === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${baseName}${ext}`;

            const compressedFile = new File([blob], newFileName, {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

/**
 * Compress multiple images sequentially with progress tracking
 */
export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> => {
  const compressedFiles: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i], options);
    compressedFiles.push(compressed);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return compressedFiles;
};
