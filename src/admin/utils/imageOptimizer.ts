export interface OptimizedImage {
  blob: Blob;
  fileName: string;
  url: string;
  originalSize: number;
  optimizedSize: number;
  warning?: string;
}

export const optimizeImage = async (file: File): Promise<OptimizedImage> => {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;
        const maxWidth = 1200;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // WebP failed, try JPEG fallback
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    reject(new Error('Could not create blob'));
                    return;
                  }

                  processBlob(jpegBlob, 'jpeg', originalSize, resolve, reject, canvas, ctx);
                },
                'image/jpeg',
                0.85
              );
              return;
            }

            processBlob(blob, 'webp', originalSize, resolve, reject, canvas, ctx);
          },
          'image/webp',
          0.85
        );
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
};

const processBlob = (
  blob: Blob,
  format: 'webp' | 'jpeg',
  originalSize: number,
  resolve: (value: OptimizedImage) => void,
  reject: (reason: Error) => void,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  const extension = format === 'webp' ? 'webp' : 'jpg';

  // If file is still too large, compress more aggressively
  if (blob.size > 500000) {
    canvas.toBlob(
      (compressedBlob) => {
        if (!compressedBlob) {
          reject(new Error('Could not create compressed blob'));
          return;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        const url = URL.createObjectURL(compressedBlob);
        const warning = compressedBlob.size > 500000
          ? `Image is ${(compressedBlob.size / 1024).toFixed(0)}KB. Consider using a smaller image for faster loading.`
          : undefined;

        resolve({
          blob: compressedBlob,
          fileName,
          url,
          originalSize,
          optimizedSize: compressedBlob.size,
          warning
        });
      },
      `image/${format}`,
      0.7
    );
  } else {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const url = URL.createObjectURL(blob);
    resolve({
      blob,
      fileName,
      url,
      originalSize,
      optimizedSize: blob.size
    });
  }
};

export const validateImageFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPG, PNG, WebP, or GIF)';
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'Image size must be less than 10MB';
  }

  return null;
};
