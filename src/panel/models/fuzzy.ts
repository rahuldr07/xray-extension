// A small, fast subsequence fuzzy matcher with scoring and highlight ranges.
// Rewards consecutive matches and word-boundary hits (so "opr" ranks
// "Open Rules" over "Open Reports"), and returns the matched character spans
// so the UI can highlight them.

export interface FuzzyResult {
  score: number;
  ranges: Array<[number, number]>;
}

const BOUNDARY = /[\s\-_/.:]/;

export function fuzzyMatch(query: string, text: string): FuzzyResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 1, ranges: [] };
  const t = text.toLowerCase();
  if (t.includes(q)) {
    // Exact substring: strong score, single highlighted range.
    const at = t.indexOf(q);
    const boundaryBonus = at === 0 || BOUNDARY.test(t[at - 1]) ? 40 : 0;
    return { score: 120 + boundaryBonus - at - Math.max(0, t.length - q.length) * 0.2, ranges: [[at, at + q.length]] };
  }

  let qi = 0;
  let score = 0;
  let lastIndex = -2;
  const ranges: Array<[number, number]> = [];
  for (let ti = 0; ti < t.length && qi < q.length; ti += 1) {
    if (t[ti] !== q[qi]) continue;
    score += lastIndex === ti - 1 ? 6 : 1;
    if (ti === 0 || BOUNDARY.test(t[ti - 1])) score += 10;
    const prev = ranges[ranges.length - 1];
    if (prev && prev[1] === ti) prev[1] = ti + 1;
    else ranges.push([ti, ti + 1]);
    lastIndex = ti;
    qi += 1;
  }
  if (qi < q.length) return null;
  score += Math.max(0, 18 - t.length / 4);
  return { score, ranges };
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

// Split a label into matched / unmatched segments for rendering.
export function highlightSegments(text: string, ranges: Array<[number, number]>): HighlightSegment[] {
  if (!ranges.length) return [{ text, match: false }];
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
