function editDistance(left, right) {
  const matrix = Array.from({ length: left.length + 1 }, (_, i) =>
    Array.from({ length: right.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[left.length][right.length];
}

export function matchesOpportunitySearch(text, query) {
  const normalized = String(text ?? "").toLowerCase();
  const needle = String(query ?? "").toLowerCase().trim();
  const terms = needle.split(/\s+/).filter(Boolean);
  if (!terms.length || normalized.includes(needle)) return true;
  const words = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return terms.every(term => words.some(word => word.includes(term) || (term.length >= 4 && editDistance(word, term) <= Math.max(1, Math.floor(term.length / 3)))));
}
