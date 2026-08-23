import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { extractText, isPdf, isSupported } from "@/lib/extract";
import { summarize, type SummaryLength, type SummaryResult } from "@/lib/summarize";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Document Summary Assistant - PDF & Image Summaries" },
      {
        name: "description",
        content:
          "Upload a PDF or scanned image, extract its text with OCR, and get a short, medium, or long summary with key points - all in your browser.",
      },
      { property: "og:title", content: "Document Summary Assistant" },
      {
        property: "og:description",
        content:
          "Extract text from PDFs and scanned images, then generate summaries with key points instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/** High level state machine for the whole flow. */
type Status = "idle" | "uploading" | "processing" | "summarizing" | "ready" | "error";

const LENGTHS: { value: SummaryLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

function Index() {
  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [text, setText] = useState("");
  const [length, setLength] = useState<SummaryLength>("medium");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState("");

  // Keep the last accepted file around so the error state can offer a retry.
  const lastFile = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runExtraction = useCallback(async (incoming: File) => {
    setStatus("processing");
    setProgress("Preparing document");
    setError("");
    setResult(null);
    setText("");

    try {
      const extracted = await extractText(incoming, (message) => setProgress(message));

      if (!extracted || extracted.replace(/\s/g, "").length < 20) {
        setStatus("error");
        setError(
          "This document appears to be blank or contains no readable text. Try a clearer scan or a text-based PDF.",
        );
        return;
      }

      setText(extracted);
      setStatus("summarizing");
      // Yield to the browser so the loading state paints before scoring runs.
      await new Promise((resolve) => setTimeout(resolve, 30));
      setResult(summarize(extracted, length));
      setStatus("ready");
    } catch {
      setStatus("error");
      setError(
        "Something went wrong while reading this document. Check your connection and try again.",
      );
    }
  }, [length]);

  function handleFile(incoming: File) {
    if (!isSupported(incoming)) {
      setFile(null);
      setPreviewUrl(null);
      setStatus("error");
      setError(
        `Unsupported file type: ${incoming.name}. Please upload a PDF, JPG, or PNG file.`,
      );
      return;
    }

    lastFile.current = incoming;
    setFile(incoming);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return isPdf(incoming) ? null : URL.createObjectURL(incoming);
    });
    setStatus("uploading");
    void runExtraction(incoming);
  }

  /** Re-summarise already extracted text when the length option changes. */
  function changeLength(next: SummaryLength) {
    setLength(next);
    if (text) setResult(summarize(text, next));
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setText("");
    setResult(null);
    setError("");
    setProgress("");
    setStatus("idle");
  }

  const busy = status === "uploading" || status === "processing" || status === "summarizing";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="border-b border-border pb-8">
        <p className="label-caps">Document Summary Assistant</p>
        <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
          Turn documents into summaries you can actually read.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Upload a PDF or a scanned image. The text is extracted in your browser, then condensed
          into a summary with the main ideas listed separately.
        </p>
      </header>

      <section className="mt-8">
        {status === "idle" ? (
          <FileDropzone onFile={handleFile} />
        ) : (
          <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Preview of ${file?.name ?? "the uploaded document"}`}
                  className="h-16 w-16 rounded border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded border border-border bg-secondary">
                  <span className="label-caps">PDF</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="label-caps">Uploaded file</p>
                <p className="mt-1 truncate text-sm font-medium">
                  {file?.name ?? "No file selected"}
                </p>
                {file ? (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                ) : null}
              </div>
            </div>
            <Button variant="outline" onClick={reset} disabled={busy}>
              Upload another
            </Button>
          </div>
        )}
      </section>

      {busy ? (
        <p className="mt-6 text-sm text-muted-foreground" role="status" aria-live="polite">
          Processing... {status === "summarizing" ? "Generating summary" : progress}
        </p>
      ) : null}

      {status === "error" ? (
        <div
          className="panel mt-6 border-destructive/40 p-5"
          role="alert"
        >
          <p className="label-caps">Error</p>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lastFile.current ? (
              <Button onClick={() => runExtraction(lastFile.current as File)}>Retry</Button>
            ) : null}
            <Button variant="outline" onClick={reset}>
              Start over
            </Button>
          </div>
        </div>
      ) : null}

      {status === "ready" && result ? (
        <>
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl">Summary</h2>
              <div className="flex gap-2" role="group" aria-label="Summary length">
                {LENGTHS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={length === option.value ? "default" : "outline"}
                    onClick={() => changeLength(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="panel mt-4 p-5">
              <p className="text-sm leading-relaxed">
                {result.summary || "No summary could be generated for this document."}
              </p>
            </div>
          </section>

          {result.keyPoints.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-xl">Key points</h2>
              <ul className="panel mt-4 list-disc space-y-2 p-5 pl-9 text-sm leading-relaxed">
                {result.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-8 pb-6">
            <h2 className="text-xl">Extracted text</h2>
            <pre className="panel mt-4 max-h-96 overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed">
              {text}
            </pre>
          </section>
        </>
      ) : null}
    </main>
  );
}
