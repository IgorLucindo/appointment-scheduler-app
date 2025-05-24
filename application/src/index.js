const createPost = require('./utils/create_post');
const fs = require('fs');
const path = require('path');

const backgroundsDir = path.resolve(__dirname, '../../dataset/backgrounds');
const outputDir = path.resolve(__dirname, '../../output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate posts using selected profile and caption
async function generateAllPosts() {
  const bgs = fs.readdirSync(backgroundsDir).filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  // Select profile and caption
  const profileIndex = 1;
  const captionIndex = 1;

  for (let i = 0; i < bgs.length; i++) {
    const bgPath = path.join(backgroundsDir, bgs[i]);
    const outputPath = path.join(outputDir, `post_${i + 1}.webp`);

    await createPost(bgPath, outputPath, captionIndex, profileIndex);
  }
}

generateAllPosts();