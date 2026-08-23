import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

/** Drag-and-drop area with an equivalent file picker button (text only, no icons). */
export function FileDropzone({ onFile, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (files && files[0]) onFile(files[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`panel flex flex-col items-center gap-4 px-6 py-12 text-center transition-colors ${
        dragging ? "border-primary bg-accent/40" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <p className="max-w-sm text-sm text-muted-foreground">
        Drag and drop a PDF or a scanned image here. Accepted formats: PDF, JPG, PNG.
      </p>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Choose a file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
