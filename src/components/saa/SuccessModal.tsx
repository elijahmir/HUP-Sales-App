import {
  CheckCircle,
  X,
  Mail,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface SuccessModalProps {
  vendorName: string;
  docusignUrl?: string;
  onClose: () => void;
  onNewAgreement: () => void;
}

export function SuccessModal({
  vendorName,
  docusignUrl,
  onClose,
  onNewAgreement,
}: SuccessModalProps) {
  const handleOpenDocuSign = () => {
    if (docusignUrl) {
      window.open(docusignUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agreement Created!</h2>
              <p className="text-white/80 text-sm">
                Successfully sent for signing
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Mail className="w-5 h-5 text-harcourts-blue mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700">
                An email has been sent to{" "}
                <strong className="text-harcourts-navy">{vendorName}</strong>{" "}
                for ID Verification and Signing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-600 text-sm">
              You will be notified via Teams when they complete it.
            </p>
          </div>

          {/* In-Person Signing Option */}
          {docusignUrl && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <ExternalLink className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                <strong className="text-amber-700">In-Person Signing:</strong>{" "}
                Use the button below to open DocuSign on this device for
                immediate vendor signing.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* DocuSign Button (if URL available) */}
          {docusignUrl && (
            <button
              onClick={handleOpenDocuSign}
              className="w-full px-4 py-3 bg-harcourts-blue text-white font-medium rounded-lg hover:bg-harcourts-blue-dark transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Open DocuSign for In-Person Signing
            </button>
          )}

          {/* Bottom Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button onClick={onNewAgreement} className="flex-1 btn-primary">
              New Agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
