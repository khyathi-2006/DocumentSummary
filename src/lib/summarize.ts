/**
 * Extractive summarisation.
 *
 * Runs entirely in the browser: no API key, no network call, no rate limits.
 * Sentences are scored with a TF-ISF (term frequency / inverse sentence
 * frequency) weighting plus small bonuses for position and length, then the
 * best-scoring sentences are returned in their original document order.
 */

export type SummaryLength = "short" | "medium" | "long";

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

const STOP_WORDS = new Set(
  `a about above after again against all am an and any are as at be because been before being below
   between both but by could did do does doing down during each few for from further had has have
   having he her here hers herself him himself his how i if in into is it its itself me more most my
   myself nor not of off on once only or other ought our ours ourselves out over own same she should
   so some such than that the their theirs them themselves then there these they this those through
   to too under until up very was we were what when where which while who whom why will with you your
   yours yourself yourselves`.split(/\s+/),
);

const RATIOS: Record<SummaryLength, number> = { short: 0.12, medium: 0.25, long: 0.45 };
const CAPS: Record<SummaryLength, [number, number]> = {
  short: [2, 4],
  medium: [4, 8],
  long: [8, 16],
};

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length > 3);
}

function words(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function summarize(text: string, length: SummaryLength): SummaryResult {
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { summary: "", keyPoints: [] };
  }

  // Document-level term frequencies.
  const frequency = new Map<string, number>();
  const tokenised = sentences.map((sentence) => {
    const tokens = words(sentence);
    for (const token of tokens) frequency.set(token, (frequency.get(token) ?? 0) + 1);
    return tokens;
  });

  const maxFrequency = Math.max(1, ...frequency.values());

  const scored = tokenised.map((tokens, index) => {
    const unique = new Set(tokens);
    let score = 0;
    for (const token of unique) score += (frequency.get(token) ?? 0) / maxFrequency;
    score /= Math.sqrt(unique.size || 1);
    // Opening sentences usually carry the thesis of a document.
    if (index < 3) score *= 1.15;
    // Penalise very short or run-on sentences.
    const wordCount = tokens.length;
    if (wordCount < 6) score *= 0.7;
    if (wordCount > 60) score *= 0.85;
    return { index, score, sentence: sentences[index] ?? "" };
  });

  const [min, max] = CAPS[length];
  const target = Math.min(max, Math.max(min, Math.round(sentences.length * RATIOS[length])));

  const ranked = [...scored].sort((a, b) => b.score - a.score);
  const chosen = ranked.slice(0, target).sort((a, b) => a.index - b.index);

  // Key points: the highest scoring sentences that are not already too long,
  // trimmed into compact bullet lines.
  const keyPoints = ranked
    .slice(0, Math.min(6, Math.max(3, Math.ceil(target * 0.75))))
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => {
      const clean = sentence.replace(/\s+/g, " ").trim();
      return clean.length > 180 ? `${clean.slice(0, 177).trimEnd()}...` : clean;
    });

  return { summary: chosen.map((s) => s.sentence).join(" "), keyPoints };
}
