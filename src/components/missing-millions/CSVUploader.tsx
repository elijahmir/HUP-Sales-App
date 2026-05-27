"use client";

/**
 * CSVUploader — Drag-and-drop CSV file uploader for Missing Millions.
 */

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface CSVUploaderProps {
  onParsed: (raw: string, filename: string) => void;
  accept?: string;
  label?: string;
}

export default function CSVUploader({
  onParsed,
  accept = ".csv",
  label = "Upload CSV File",
}: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          onParsed(text, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onParsed],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-[#00ADEF] bg-sky-50/50"
          : "border-slate-200 hover:border-slate-300 bg-white"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      />

      {fileName ? (
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">
            {fileName}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFileName(null);
            }}
            className="p-1 hover:bg-slate-100 rounded"
            aria-label="Clear file"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xs text-slate-400">
            Drag & drop or click to browse
          </p>
        </div>
      )}
    </div>
  );
}
