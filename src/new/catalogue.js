// Published inventory always takes priority over the sample fallback.
export function catalogueState(liveProducts, samples, sampleEnabled, loading = false, error = "") {
  const published = liveProducts.filter((product) => product.published !== false);
  const isSampleCatalogue = !loading && !error && published.length === 0 && sampleEnabled === true;
  return { products: isSampleCatalogue ? samples : published, isSampleCatalogue };
}
