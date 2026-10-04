type ProductWithId = { id: string };

function stableProductScore(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export function getFeaturedProductIds(products: readonly ProductWithId[]) {
  if (products.length === 0) return new Set<string>();

  const ranked = products.map((product) => ({
    id: product.id,
    score: stableProductScore(product.id),
  }));
  const featured = ranked.filter((product) => product.score % 5 === 0);

  if (featured.length === 0) {
    featured.push(ranked.reduce((lowest, product) => product.score < lowest.score ? product : lowest));
  }
  if (featured.length === products.length && products.length > 1) featured.pop();

  return new Set(featured.map((product) => product.id));
}