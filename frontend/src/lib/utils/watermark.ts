/**
 * Stamps a clean 'roombazar' watermark directly onto an image file using HTML5 Canvas.
 * This physically embeds the watermark into the image pixels before uploading to cloud storage.
 */
export async function stampWatermarkOnImage(
  file: File,
  watermarkText = "roombazar",
): Promise<File> {
  // If it's not an image, return original file
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark typography scaling based on image width
        const fontSize = Math.max(16, Math.round(canvas.width * 0.032));
        ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";

        const text = watermarkText.toUpperCase();
        const paddingRight = Math.max(12, Math.round(canvas.width * 0.025));
        const paddingBottom = Math.max(12, Math.round(canvas.height * 0.025));
        const x = canvas.width - paddingRight;
        const y = canvas.height - paddingBottom;

        // Draw soft shadow for contrast
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = Math.max(4, Math.round(fontSize * 0.25));
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw watermark text in bright semi-transparent white
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillText(text, x, y);

        // Export back to File object
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(watermarkedFile);
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          0.92,
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
