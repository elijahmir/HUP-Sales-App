import { X, History, Trash2, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import type { HistoryEntry } from "@/lib/saa/historyStorage";
import {
  getRelativeTime,
  deleteSubmission,
  clearAllHistory,
} from "@/lib/saa/historyStorage";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (id: string) => void;
  entries: HistoryEntry[];
  onUpdate: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  onLoad,
  entries,
  onUpdate,
}: HistoryDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const handleDelete = (id: string) => {
    deleteSubmission(id);
    setConfirmDelete(null);
    onUpdate();
  };

  const handleClearAll = () => {
    clearAllHistory();
    setConfirmClearAll(false);
    onUpdate();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-harcourts-navy text-white">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Submission History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Disclaimer */}
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              <strong>Privacy Notice:</strong> History is saved locally on your
              device only. No client data is stored in the cloud or shared
              externally. Clearing your browser data will erase this history.
            </p>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <History className="w-16 h-16 mb-4" />
              <p className="text-sm">No saved submissions yet</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-harcourts-navy">
                        {entry.vendorName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {entry.propertyAddress}
                      </p>
                      <p className="text-sm font-medium text-harcourts-blue mt-1">
                        ${entry.listingPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {getRelativeTime(entry.timestamp)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoad(entry.id)}
                        className="px-3 py-1.5 text-sm bg-harcourts-blue text-white rounded hover:bg-harcourts-blue-dark transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => setConfirmDelete(entry.id)}
                        className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {confirmDelete === entry.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-800">
                        Delete this submission from history?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            {confirmClearAll ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Clear all {entries.length} submissions from history?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 font-medium"
              >
                Clear All History
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
