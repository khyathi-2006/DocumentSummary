/**
 * Text extraction utilities.
 *
 * All heavy libraries (PDF parser, OCR engine) are imported dynamically so that
 * they never end up in the server render bundle and only load in the browser
 * when the user actually uploads a file.
 */

export type ExtractProgress = (message: string, percent?: number) => void;

export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function isSupported(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Some browsers report an empty MIME type; fall back to the extension.
  return /\.(pdf|jpe?g|png)$/i.test(file.name);
}

export function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/**
 * Extract text from a PDF, keeping paragraph and line breaks roughly intact.
 * Line breaks are inferred from vertical position changes between text items.
 */
async function extractPdf(file: File, onProgress: ExtractProgress): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    onProgress(`Reading page ${pageNumber} of ${pdf.numPages}`, pageNumber / pdf.numPages);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    let text = "";
    let lastY: number | null = null;

    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      if (!("str" in item)) continue;
      const y = item.transform[5] ?? 0;
      if (lastY !== null && Math.abs(y - lastY) > 1) {
        // A large vertical jump usually means a new paragraph.
        text += Math.abs(y - lastY) > 14 ? "\n\n" : "\n";
      } else if (text && !text.endsWith(" ")) {
        text += " ";
      }
      text += item.str;
      lastY = y;
    }

    pages.push(text.trim());
  }

  return pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Run OCR on an image file using the browser-side recognition engine. */
async function extractImage(file: File, onProgress: ExtractProgress): Promise<string> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng", {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress("Reading text from image", m.progress);
      } else {
        onProgress(m.status.charAt(0).toUpperCase() + m.status.slice(1));
      }
    },
  });
  return result.data.text.replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractText(file: File, onProgress: ExtractProgress): Promise<string> {
  return isPdf(file) ? extractPdf(file, onProgress) : extractImage(file, onProgress);
}
