export interface OptimizedImage {
  blob: Blob;
  fileName: string;
  url: string;
}

export const optimizeImage = async (file: File): Promise<OptimizedImage> => {
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

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob'));
              return;
            }

            if (blob.size > 500000) {
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Could not create compressed blob'));
                    return;
                  }

                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
                  const url = URL.createObjectURL(compressedBlob);
                  resolve({ blob: compressedBlob, fileName, url });
                },
                'image/webp',
                0.7
              );
            } else {
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
              const url = URL.createObjectURL(blob);
              resolve({ blob, fileName, url });
            }
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
