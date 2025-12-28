/**
 * CartModal - Shopping Cart Modal with Note Management
 * 
 * This component displays the shopping cart with:
 * - List of all items with quantities
 * - Individual item notes
 * - General order notes
 * - Total price calculation
 * - Order submission
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getBasket, updateItemNote, updateGeneralNote, prepareOrderRequest } from "../lib/services/basketService";

export interface CartItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
  note?: string;
}

export interface CartModalProps {
  modalId: string;
  qrToken: string;
  items: CartItem[];
  generalNote: string;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateGeneralNote: (note: string) => void;
  onSubmitOrder: () => void;
}

export default function CartModal({
  modalId,
  qrToken,
  items,
  generalNote,
  onUpdateQuantity,
  onUpdateGeneralNote,
  onSubmitOrder,
  theme = 'DEFAULT'
}: CartModalProps & { theme?: 'DEFAULT' | 'MODERN' | 'ELEGANT' }) {
  const [itemsWithNotes, setItemsWithNotes] = useState<CartItem[]>(items);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState("");
  const [isEditingGeneralNote, setIsEditingGeneralNote] = useState(false);
  const [tempGeneralNote, setTempGeneralNote] = useState(generalNote);

  // Theme Configuration
  const themeStyles = {
    DEFAULT: {
      bg: "bg-white",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
      cardBg: "bg-gray-50",
      noteBg: "bg-orange-50",
      primaryButton: "bg-pink-500 hover:bg-pink-600",
      primaryText: "text-pink-500 hover:text-pink-600",
      iconColor: "text-gray-900",
      inputBg: "bg-white",
      inputText: "text-gray-900",
      inputBorder: "border-gray-300",
      buttonClose: "text-gray-500 hover:bg-gray-100",
      secondaryButton: "btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    },
    MODERN: {
      bg: "bg-[#1f1f1f]",
      text: "text-white",
      textSecondary: "text-gray-300",
      border: "border-gray-700",
      cardBg: "bg-[#2d2d2d]",
      noteBg: "bg-[#333333]", // Darker neutral
      primaryButton: "bg-[#ea580c] hover:bg-[#c2410c]", // Orange
      primaryText: "text-[#ea580c] hover:text-[#c2410c]",
      iconColor: "text-white",
      inputBg: "bg-[#1a1a1a]",
      inputText: "text-gray-100",
      inputBorder: "border-gray-600",
      buttonClose: "text-gray-400 hover:bg-gray-700 hover:text-white",
      secondaryButton: "text-gray-300 border-gray-500 hover:bg-gray-700 hover:text-white"
    },
    ELEGANT: {
      bg: "bg-[#f5f5dc]",
      text: "text-[#5c4033]",
      textSecondary: "text-[#8b4513]",
      border: "border-[#d2b48c]",
      cardBg: "bg-[#fdfbf7] border border-[#e6dcc3]",
      noteBg: "bg-[#fdfbf7] border border-[#e6dcc3]",
      primaryButton: "bg-[#9C6644] hover:bg-[#7f5539]", // Coffee Brown
      primaryText: "text-[#9C6644] hover:text-[#7f5539]",
      iconColor: "text-[#5c4033]",
      inputBg: "bg-[#fdfbf7]",
      inputText: "text-[#5c4033]",
      inputBorder: "border-[#d2b48c]",
      buttonClose: "text-[#8b4513] hover:bg-[#d2b48c]/20",
      secondaryButton: "border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-[#fdfbf7]"
    }
  };

  const styles = themeStyles[theme] || themeStyles.DEFAULT;

  // Sync items with notes from localStorage
  useEffect(() => {
    const basket = getBasket(qrToken);
    const itemsWithNotesFromBasket = items.map(item => {
      const basketItem = basket.items.find(b => b.menuItemId === item.id);
      return {
        ...item,
        note: basketItem?.note
      };
    });
    setItemsWithNotes(itemsWithNotesFromBasket);
    setTempGeneralNote(generalNote);
  }, [items, qrToken, generalNote]);

  const totalPrice = itemsWithNotes.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = itemsWithNotes.reduce((sum, item) => sum + item.quantity, 0);

  const handleEditItemNote = (itemId: number, currentNote: string = "") => {
    setEditingItemId(itemId);
    setTempItemNote(currentNote);
  };

  const handleSaveItemNote = (itemId: number) => {
    updateItemNote(qrToken, itemId, tempItemNote);
    // Update local state immediately
    setItemsWithNotes(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, note: tempItemNote } : item
      )
    );
    setEditingItemId(null);
  };

  const handleEditGeneralNote = () => {
    setIsEditingGeneralNote(true);
    setTempGeneralNote(generalNote);
  };

  const handleSaveGeneralNote = () => {
    updateGeneralNote(qrToken, tempGeneralNote);
    onUpdateGeneralNote(tempGeneralNote);
    setIsEditingGeneralNote(false);
  };

  const handleOrder = () => {
    // Prepare order data
    const orderData = prepareOrderRequest(qrToken);

    // Call the parent's submit handler
    onSubmitOrder();

    // Close modal
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  };

  return (
    <dialog id={modalId} className="modal modal-bottom">
      <div className={`modal-box w-full max-w-md h-[70vh] max-h-[70vh] flex flex-col p-0 rounded-t-3xl rounded-b-none m-0 mx-auto ${styles.bg}`}>
        {/* Header */}
        <div className={`p-6 pb-4 border-b flex justify-between items-center shrink-0 ${styles.border}`}>
          <h2 className={`text-2xl font-bold ${styles.text}`}>Sepetim</h2>
          <form method="dialog">
            <button className={`btn btn-ghost btn-sm btn-circle ${styles.buttonClose}`}>
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
          </form>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {itemsWithNotes.length === 0 ? (
            <div className="text-center py-12">
              <p className={`${styles.textSecondary} text-lg`}>Sepetiniz boş</p>
            </div>
          ) : (
            <>
              {itemsWithNotes.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.cardBg} rounded-xl p-4 space-y-3`}
                >
                  <div className="flex gap-3">
                    {/* Item Image */}
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.imageUrl || "/images/cappucino.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className={`font-semibold ${styles.text}`}>
                        {item.name}
                      </h3>
                      <p className={`${styles.textSecondary} text-sm mt-1`}>
                        {item.price} TL
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`inline-flex items-center rounded-xl shadow-md h-8 ${styles.primaryButton}`}>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-black/20 rounded-xl transition-colors"
                          >
                            {item.quantity === 1 ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            ) : (
                              <span className="text-2xl font-light">−</span>
                            )}
                          </button>
                          <span className="px-3 text-white font-bold text-sm min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-black/20 rounded-xl transition-colors"
                          >
                            <span className="text-2xl font-light">+</span>
                          </button>
                        </div>
                        <span className={`${styles.text} font-semibold`}>
                          {(item.price * item.quantity).toFixed(2)} TL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item Note Section */}
                  {editingItemId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        className={`textarea textarea-bordered w-full text-sm h-16 resize-none ${styles.inputBg} ${styles.inputText} placeholder-gray-400 ${styles.inputBorder}`}
                        placeholder="Özel istek yazın..."
                        value={tempItemNote}
                        onChange={(e) => setTempItemNote(e.target.value)}
                        maxLength={200}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveItemNote(item.id)}
                          className={`btn btn-sm ${styles.primaryButton} text-white border-none flex-1`}
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className={`btn btn-sm btn-outline flex-1 ${styles.secondaryButton}`}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditItemNote(item.id, item.note)}
                      className={`${styles.primaryText} text-sm font-medium flex items-center gap-1 transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {item.note ? `Not: ${item.note}` : "Not ekle"}
                    </button>
                  )}
                </div>
              ))}

              {/* General Note Section */}
              <div className={`${styles.noteBg} rounded-xl p-4 space-y-3`}>
                <h3 className={`font-semibold ${styles.text} flex items-center gap-2`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Genel Not
                </h3>

                {isEditingGeneralNote ? (
                  <div className="space-y-2">
                    <textarea
                      className={`textarea textarea-bordered w-full text-sm h-20 resize-none ${styles.inputBg} ${styles.inputText} placeholder-gray-400 ${styles.inputBorder}`}
                      placeholder="Siparişiniz için genel bir not yazın..."
                      value={tempGeneralNote}
                      onChange={(e) => setTempGeneralNote(e.target.value)}
                      maxLength={500}
                    />
                    <div className={`text-right text-xs ${styles.textSecondary} mb-2`}>
                      {tempGeneralNote.length}/500
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveGeneralNote}
                        className={`btn btn-sm ${styles.primaryButton} text-white border-none flex-1`}
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setIsEditingGeneralNote(false)}
                        className={`btn btn-sm btn-outline flex-1 ${styles.secondaryButton}`}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleEditGeneralNote}
                    className={`${styles.primaryText} text-sm font-medium flex items-center gap-1 transition-colors`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {generalNote ? generalNote : "Genel not ekle"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer - Total and Order Button */}
        {itemsWithNotes.length > 0 && (
          <div className={`p-6 pt-4 border-t ${styles.border} space-y-3 shrink-0`}>
            <div className="flex justify-between items-center">
              <span className={styles.textSecondary}>Toplam ({totalItems} ürün)</span>
              <span className={`text-2xl font-bold ${styles.text}`}>
                {totalPrice.toFixed(2)} TL
              </span>
            </div>
            <button
              onClick={handleOrder}
              className={`btn w-full ${styles.primaryButton} text-white border-none text-lg h-14`}
            >
              Siparişi Tamamla
            </button>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
