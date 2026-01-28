"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentPreviewProps {
  files: { file: File; preview: string }[];
  onClose: () => void;
}

export default function DocumentPreview({
  files,
  onClose,
}: DocumentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFile = files[currentIndex];
  const isPdf =
    currentFile.file.type === "application/pdf" ||
    currentFile.file.name.toLowerCase().endsWith(".pdf");

  const nextFile = () => {
    if (currentIndex < files.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const prevFile = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 text-white">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm">
            Original Document ({currentIndex + 1}/{files.length})
          </h3>
          {files.length > 1 && (
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={prevFile}
                disabled={currentIndex === 0}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextFile}
                disabled={currentIndex === files.length - 1}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors"
        >
          Close Preview
        </button>
      </div>

      {/* Viewer */}
      <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
        {isPdf ? (
          <iframe
            src={currentFile.preview}
            className="w-full h-full rounded shadow-sm border border-slate-200"
            title="PDF Preview"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentFile.preview}
            alt="Document Preview"
            className="max-w-full max-h-full object-contain shadow-lg rounded border border-slate-200"
          />
        )}
      </div>
    </div>
  );
}
