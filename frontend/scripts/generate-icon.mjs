import sharp from "sharp";
import fs from "fs";
import path from "path";

async function generateZoomedIcons() {
  const size = 512;
  const radius = size / 2;

  // Circle background and mask SVGs
  const circleBg = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff" />
    </svg>
  `);

  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff" />
    </svg>
  `);

  // Extract the exact bounding box of the logo: 377, 529, 361, 272
  // We apply sharp lanczos3 resampling and sharpening for crisp favicon rendering at 16x16 / 32x32 / 48x48 / 512x512
  const croppedLogo = await sharp("C:\\Users\\kusha\\Downloads\\RB(LOGO).png")
    .extract({ left: 377, top: 529, width: 361, height: 272 })
    .resize(460, null, { fit: "inside", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.5 })
    .toBuffer();

  const logoMeta = await sharp(croppedLogo).metadata();
  const left = Math.round((size - (logoMeta.width || 460)) / 2);
  const top = Math.round((size - (logoMeta.height || 345)) / 2);

  // Composite into 512x512 circular badge
  const compositeImage = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: circleBg, top: 0, left: 0 },
      { input: croppedLogo, top: top, left: left },
    ])
    .png()
    .toBuffer();

  // Apply circular mask so outside edges are perfectly transparent
  const finalCircularIcon = await sharp(compositeImage)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const baseDir = process.cwd();
  const destinations = [
    path.join(baseDir, "src/app/icon.png"),
    path.join(baseDir, "src/app/apple-icon.png"),
    path.join(baseDir, "public/favicon.ico"),
    path.join(baseDir, "public/favicon.png"),
    path.join(baseDir, "public/logo/roombazar-icon.png"),
    path.join(baseDir, "public/logo/rb-logo.png"),
  ];

  for (const dest of destinations) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, finalCircularIcon);
    console.log("Updated:", dest);
  }

  // Also save a preview in scripts
  fs.writeFileSync(path.join(baseDir, "scripts/zoomed-icon-preview.png"), finalCircularIcon);

  console.log("Done generating zoomed circular icons!");
}

generateZoomedIcons().catch(console.error);
