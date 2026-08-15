import { generateImage } from './server/_core/imageGeneration.ts';

const result = await generateImage({
  prompt: 'Create a simple original chibi manga mascot on a fully transparent background, centered, no text, no logo, clean silhouette.',
  model: 'MODEL_GPT_IMAGE_2',
  quality: 'medium',
});
if (!result.url) throw new Error('No image URL returned');
console.log(JSON.stringify({ ok: true, url: result.url }));
