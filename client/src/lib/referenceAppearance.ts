export type ReferenceAppearance = {
  hairstyle: string;
  hairColor: string;
  faceAndExpression: string;
  clothing: string;
  palette: string;
  accessories: string;
  proportions: string;
  identityTraits: string;
};

export function referenceAppearancePrompt(appearance: ReferenceAppearance | null) {
  if (!appearance) return "";
  return `Reference appearance lock: hairstyle ${appearance.hairstyle}; hair color ${appearance.hairColor}; face and expression ${appearance.faceAndExpression}; clothing silhouette ${appearance.clothing}; clothing color palette ${appearance.palette}; accessories ${appearance.accessories}; body proportions ${appearance.proportions}; defining identity traits ${appearance.identityTraits}. Preserve these visible traits consistently in every cell and frame while redrawing an original clean transparent cursor asset. Do not copy the reference background, text, watermark, logo, or unrelated objects.`;
}

const GENERIC_REFERENCE_SUFFIX = " Use the uploaded reference image as the identity reference: preserve the same character face, hairstyle, hair color, costume silhouette, clothing color palette, accessories, proportions, and recognizable design language across every cell and frame. Do not copy the reference background, text, watermark, or unrelated objects; redraw the character cleanly in transparent RGBA.";

export function withReferenceAppearance(basePrompt: string, appearance: ReferenceAppearance | null, hasReference = true) {
  return basePrompt + (referenceAppearancePrompt(appearance) || (hasReference ? GENERIC_REFERENCE_SUFFIX : ""));
}

export function buildStandardCursorPrompt(basePrompt: string, appearance: ReferenceAppearance | null, hasReference: boolean) {
  return withReferenceAppearance(basePrompt, appearance, hasReference);
}

export function buildDynamicCursorPrompt(basePrompt: string, appearance: ReferenceAppearance | null, hasReference: boolean) {
  return withReferenceAppearance(basePrompt, appearance, hasReference);
}
