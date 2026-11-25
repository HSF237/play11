const HIDDEN_DUPLICATE_IDS = new Set([
  "provided-j005",
  "provided-j009",
  "provided-j012",
  "provided-j014",
  "provided-j018",
  "provided-j019",
  "provided-j021",
]);

const IMAGE_URL_OVERRIDES = {
  "/products/jersey-collection/inter-third-forlan-front.webp":
    "https://lh3.googleusercontent.com/d/1Iz0K6anA9io7BlLy_gQq2yi54IIZ2Mve",
  "/products/jersey-collection/inter-third-forlan-back.webp":
    "https://lh3.googleusercontent.com/d/1-8kNqE2z0ybJmxXtSb097jCLbv9qQe1S",
  "https://lh3.googleusercontent.com/d/1GeQL6OnUbS_EuPREGVUP6FofhI4OZ0kT":
    "https://lh3.googleusercontent.com/d/11E_YMfpYngBExvF_53m54rLG3fdofvev",
  "https://lh3.googleusercontent.com/d/10X6Hbmf3ZLlMGOV08lASP1ZaardSvjCQ":
    "https://lh3.googleusercontent.com/d/1RhEqVJOKTlD0v0y7rLTifPq2cvtCUYIP",
};

function normalizeProduct(product) {
  const mapUrl = (url) =>
    typeof url === "string" && IMAGE_URL_OVERRIDES[url]
      ? IMAGE_URL_OVERRIDES[url]
      : url;
  const rawImages = Array.isArray(product.images)
    ? product.images.map(mapUrl)
    : product.images;
  const images =
    product.id === "provided-j006" &&
    Array.isArray(rawImages) &&
    !rawImages.includes("/products/user-collection/j005-back.jpg")
      ? [...rawImages, "/products/user-collection/j005-back.jpg"]
      : rawImages;
  return {
    ...product,
    image: mapUrl(product.image),
    ...(images !== undefined ? { images } : {}),
  };
}

// Published inventory always takes priority over the sample fallback.
export function catalogueState(
  liveProducts,
  samples,
  sampleEnabled,
  loading = false,
  error = ""
) {
  const published = liveProducts
    .filter(
      (product) =>
        product.published !== false && !HIDDEN_DUPLICATE_IDS.has(product.id)
    )
    .map(normalizeProduct);
  const isSampleCatalogue =
    !loading && !error && published.length === 0 && sampleEnabled === true;
  return {
    products: isSampleCatalogue ? samples : published,
    isSampleCatalogue,
  };
}
