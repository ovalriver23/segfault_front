/**
 * ItemNoteModal - Modal for adding notes to menu items
 * 
 * This component allows users to add custom notes/instructions
 * for individual menu items (e.g., "No onions", "Extra spicy")
 */

"use client";

import { useState, useEffect } from "react";

export interface ItemNoteModalProps {
  isOpen: boolean;
  itemName: string;
  currentNote?: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

export default function ItemNoteModal({
  isOpen,
  itemName,
  currentNote = "",
  onClose,
  onSave,
}: ItemNoteModalProps) {
  const [note, setNote] = useState(currentNote);

  useEffect(() => {
    setNote(currentNote);
  }, [currentNote, isOpen]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const handleClear = () => {
    setNote("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto">
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 pb-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Not Ekle</h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Item Name */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">Ürün:</p>
            <p className="text-gray-900 font-semibold">{itemName}</p>
          </div>

          {/* Note Input */}
          <div className="mb-6">
            <label className="text-gray-600 text-sm mb-2 block">
              Özel istek (Opsiyonel)
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24 resize-none"
              placeholder="Örn: Soğansız, ekstra baharatlı..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {note.length}/200
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {note && (
              <button
                onClick={handleClear}
                className="btn btn-outline flex-1"
              >
                Temizle
              </button>
            )}
            <button
              onClick={handleSave}
              className="btn bg-pink-500 hover:bg-pink-600 text-white border-none flex-1"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
