const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');


// SVG generator with dynamic positions
const textOverlaySVG = (main, sub, brand, positions) => `
  <svg width="1080" height="1920">
    <style>
      .main { fill: white; font-size: 90px; font-weight: bold; font-family: sans-serif; }
      .sub { fill: white; font-size: 60px; font-weight: normal; font-family: sans-serif; }
      .brand { fill: white; font-size: 50px; font-weight: bold; font-family: sans-serif; }
    </style>
    <text x="60" y="${positions.mainText}" class="main">${main}</text>
    <text x="60" y="${positions.subText}" class="sub">${sub}</text>
    <text x="60" y="${positions.brandText}" class="brand">${brand}</text>
  </svg>
`;


// Load captions from CSV
async function loadCaptions() {
  const captionsPath = path.resolve(__dirname, '../../../dataset/captions.csv');
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(captionsPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}


// Main function
async function createPost(bgPath, outputPath, captionIndex, profileName) {
  const captions = await loadCaptions();
  const profiles = require(path.resolve(__dirname, '../../../dataset/profiles.json'));

  const { mainText, subText, brandText } = captions[captionIndex];
  const profile = profiles[profileName];
  if (!profile) throw new Error(`Profile "${profileName}" not found.`);

  const image = sharp(bgPath);
  const stats = await image.stats();
  const { r, g, b } = stats.dominant;

  const gradientSVG = `
    <svg width="1080" height="1920">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.8" />
          <stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#grad)" />
    </svg>
  `;
  const gradientBuffer = Buffer.from(gradientSVG);
  const textBuffer = Buffer.from(textOverlaySVG(mainText, subText, brandText, profile.positions));
  const webpOutput = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  await image
    .resize(1080, 1920, { fit: 'cover' })
    .modulate({ brightness: 1.05, saturation: 1.2 })
    .composite([
      { input: gradientBuffer, blend: 'over' },
      { input: textBuffer, blend: 'over' }
    ])
    .toFile(webpOutput);

  console.log(`Created WebP post: ${webpOutput}`);
}

module.exports = createPost;