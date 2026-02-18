"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { jsPDF } from "jspdf";
import {
  X,
  Upload,
  FileText,
  Loader2,
  Download,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface ImageMergerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileWithPreview extends File {
  preview: string;
}

export function ImageMergerModal({ isOpen, onClose }: ImageMergerModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add new files to existing ones, creating preview URLs
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      }),
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview); // Cleanup
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleMergeAndDownload = async () => {
    if (files.length === 0) return;

    setIsMerging(true);
    try {
      const doc = new jsPDF();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Add new page for each image except the first one
        if (i > 0) {
          doc.addPage();
        }

        const imgProps = await getImageProperties(file.preview);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        // Calculate dimensions to fit page while maintaining aspect ratio
        const ratio = Math.min(
          pdfWidth / imgProps.width,
          pdfHeight / imgProps.height,
        );
        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;

        // Center image
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        const format = file.type === "image/png" ? "PNG" : "JPEG";
        doc.addImage(file.preview, format, x, y, imgWidth, imgHeight);
      }

      doc.save("merged-images.pdf");
      toast.success("PDF generated successfully!");
      onClose();
      // Cleanup all previews
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      setFiles([]);
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to merge images.");
    } finally {
      setIsMerging(false);
    }
  };

  // Helper to get image dimensions
  const getImageProperties = (
    url: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = url;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Merge Images to PDF
                </h2>
                <p className="text-sm text-slate-500">
                  Combine multiple photos into a single document
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragActive
                  ? "border-[#00ADEF] bg-sky-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4 text-[#00ADEF]">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {isDragActive
                  ? "Drop images here"
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP</p>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-700">
                    Selected Images ({files.length})
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeFile(index)}
                          className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 backdrop-blur-sm">
                        <p className="text-[10px] text-white truncate text-center">
                          {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMergeAndDownload}
              disabled={files.length === 0 || isMerging}
              className="px-6 py-2 bg-[#00ADEF] hover:bg-[#0099d4] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Merging...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Merge & Download PDF
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
