/**
 * Utility to process, resize and compress image files uploaded from PC or mobile.
 * Ensures each base64 data URL stays compact (~80-180KB) so documents with multiple
 * images stay safely under Firestore's 1 MiB document size limit.
 */
export async function processImageFile(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.72,
  maxDataUrlBytes = 110_000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Impossible de lire le fichier sélectionné.'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error("Le fichier sélectionné n'est pas une image valide."));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Scale down if larger than max boundaries while preserving ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Step quality down if needed so each image remains compact for Firestore
          let currentQuality = quality;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

          while (compressedDataUrl.length > maxDataUrlBytes && currentQuality > 0.45) {
            currentQuality = Number((currentQuality - 0.1).toFixed(2));
            compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          }

          // If still too large, scale dimensions down by 25% once more
          if (compressedDataUrl.length > maxDataUrlBytes) {
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = Math.round(width * 0.75);
            smallCanvas.height = Math.round(height * 0.75);
            const sCtx = smallCanvas.getContext('2d');
            if (sCtx) {
              sCtx.imageSmoothingEnabled = true;
              sCtx.imageSmoothingQuality = 'high';
              sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
              compressedDataUrl = smallCanvas.toDataURL('image/jpeg', 0.65);
            }
          }

          resolve(compressedDataUrl);
        } catch {
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
