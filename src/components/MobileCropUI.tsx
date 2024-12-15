import React from 'react';
import { Check, X } from 'lucide-react';

interface MobileCropUIProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MobileCropUI({ onConfirm, onCancel }: MobileCropUIProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 flex justify-between items-center">
      <button
        onClick={onCancel}
        className="flex items-center justify-center w-1/2 p-4 text-red-600 font-medium"
      >
        <X className="w-6 h-6 mr-2" />
        Cancel
      </button>
      <div className="w-px h-12 bg-gray-200" />
      <button
        onClick={onConfirm}
        className="flex items-center justify-center w-1/2 p-4 text-green-600 font-medium"
      >
        <Check className="w-6 h-6 mr-2" />
        Apply
      </button>
    </div>
  );
}