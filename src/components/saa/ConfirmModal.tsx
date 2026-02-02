import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "warning" | "danger";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      button: "bg-harcourts-blue hover:bg-harcourts-blue-dark",
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
  };

  const theme = colors[variant];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in" />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
          {/* Header */}
          <div
            className={`flex items-start gap-3 p-6 ${theme.bg} border-b ${theme.border} rounded-t-xl`}
          >
            <AlertCircle
              className={`w-6 h-6 ${theme.icon} flex-shrink-0 mt-0.5`}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${theme.button} text-white rounded-lg font-medium transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
