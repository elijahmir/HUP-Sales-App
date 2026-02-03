"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  variant?: "default" | "compact";
}

export default function FileUpload({
  onFileSelect,
  variant = "default",
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 10,
    multiple: true,
  });

  if (variant === "compact") {
    return (
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl h-full w-full min-h-[140px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
          ${
            isDragActive
              ? "border-[#00ADEF] bg-sky-50"
              : "border-slate-200 hover:border-[#00ADEF] hover:bg-sky-50/50"
          }
        `}
      >
        <input {...getInputProps()} aria-label="Upload additional files" />
        <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
          <Upload className="w-4 h-4 text-[#00ADEF]" />
        </div>
        <span className="text-xs font-semibold text-slate-600">Add Pages</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer min-h-[240px] flex flex-col items-center justify-center gap-4
        ${
          isDragActive
            ? "border-[#00ADEF] bg-sky-50"
            : "border-slate-200 hover:border-[#00ADEF]/60 hover:bg-slate-50/50"
        }
      `}
    >
      <input {...getInputProps()} aria-label="Upload listing documents" />

      <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center transition-transform duration-300">
        <Upload className="w-7 h-7 text-[#00ADEF]" />
      </div>

      <div>
        <p className="font-display text-lg font-bold text-[#001F49] mb-1.5">
          {isDragActive ? "Drop files here" : "Upload Front Sheet"}
        </p>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Drag & drop scanned documents (PDF, JPG, PNG, HEIC)
        </p>
      </div>

      <div className="mt-2 flex gap-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
        <span>JPG</span>
        <span className="w-px h-4 bg-slate-200" />
        <span>PNG</span>
        <span className="w-px h-4 bg-slate-200" />
        <span>HEIC</span>
        <span className="w-px h-4 bg-slate-200" />
        <span>PDF</span>
      </div>
    </div>
  );
}
