"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  variant?: "default" | "compact";
}

export default function FileUpload({
  onFileSelect,
  variant = "default",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

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
          relative border-2 border-dashed rounded-2xl h-full w-full min-h-[160px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300
          ${
            isDragActive
              ? "border-[#00ADEF] bg-blue-50/50"
              : "border-blue-200/50 hover:border-[#00ADEF] hover:bg-blue-50/30"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5 text-[#00ADEF]" />
        </div>
        <span className="text-xs font-semibold text-[#001F49]">Add Pages</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer min-h-[300px] flex flex-col items-center justify-center gap-4
        ${
          isDragActive
            ? "border-[#00ADEF] bg-blue-50/50 scale-[1.02]"
            : "border-gray-200 hover:border-[#00ADEF]/50 hover:bg-gray-50/50"
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="w-20 h-20 bg-blue-50/80 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-10 h-10 text-[#00ADEF]" />
      </div>

      <div>
        <p className="text-xl font-semibold text-[#001F49] mb-2">
          {isDragActive ? "Drop files here" : "Upload Listing Authority"}
        </p>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Drag & drop your scanned documents here (PDF, JPG, PNG)
        </p>
      </div>

      <div className="mt-4 flex gap-3 text-xs text-gray-400">
        <span className="uppercase tracking-wider">JPG</span>
        <span className="w-px h-4 bg-gray-200"></span>
        <span className="uppercase tracking-wider">PNG</span>
        <span className="w-px h-4 bg-gray-200"></span>
        <span className="uppercase tracking-wider">PDF</span>
      </div>
    </div>
  );
}
