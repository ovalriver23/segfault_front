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
import { getBasket, updateItemNote, updateGeneralNote } from "../lib/services/basketService";

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
  const [activeNoteEditor, setActiveNoteEditor] = useState<
    { type: "item"; itemId: number } | { type: "general" } | null
  >(null);
  const [noteDraft, setNoteDraft] = useState("");

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
      buttonClose: "text-gray-500 hover:bg-gray-100"
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
      buttonClose: "text-gray-400 hover:bg-gray-700 hover:text-white"
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
      buttonClose: "text-[#8b4513] hover:bg-[#d2b48c]/20"
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
  }, [items, qrToken]);

  const totalPrice = itemsWithNotes.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = itemsWithNotes.reduce((sum, item) => sum + item.quantity, 0);

  const handleEditItemNote = (itemId: number, currentNote: string = "") => {
    setActiveNoteEditor({ type: "item", itemId });
    setNoteDraft(currentNote);
  };

  const handleEditGeneralNote = () => {
    setActiveNoteEditor({ type: "general" });
    setNoteDraft(generalNote);
  };

  const handleNoteChange = (note: string) => {
    setNoteDraft(note);

    if (activeNoteEditor?.type === "item") {
      updateItemNote(qrToken, activeNoteEditor.itemId, note);
      setItemsWithNotes(prev =>
        prev.map(item =>
          item.id === activeNoteEditor.itemId ? { ...item, note } : item
        )
      );
      return;
    }

    if (activeNoteEditor?.type === "general") {
      updateGeneralNote(qrToken, note);
      onUpdateGeneralNote(note);
    }
  };

  const handleNoteBlur = () => {
    setActiveNoteEditor(null);
  };

  const handleNoteFocus = (element: HTMLTextAreaElement) => {
    window.setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  };

  const handleOrder = () => {
    // Call the parent's submit handler
    onSubmitOrder();

    // Close modal
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  };

  return (
    <dialog id={modalId} className="modal modal-bottom">
      <div className={`modal-box w-full max-w-md h-[82dvh] max-h-[calc(100dvh-0.75rem)] flex flex-col p-0 rounded-t-3xl rounded-b-none m-0 mx-auto overflow-hidden ${styles.bg}`}>
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:p-6 space-y-4">
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
                  {activeNoteEditor?.type === "item" && activeNoteEditor.itemId === item.id ? (
                    <div className={`rounded-xl border p-3 ${styles.inputBg} ${styles.inputBorder}`}>
                      <label
                        htmlFor={`item-note-${item.id}`}
                        className={`mb-2 block text-sm font-semibold ${styles.text}`}
                      >
                        Ürün notu
                      </label>
                      <textarea
                        id={`item-note-${item.id}`}
                        autoFocus
                        enterKeyHint="done"
                        className={`textarea w-full min-h-20 resize-none border-0 bg-transparent p-0 text-base leading-6 shadow-none outline-none focus:outline-none ${styles.inputText} placeholder:text-gray-400`}
                        placeholder="Örn. soğansız, az acılı..."
                        value={noteDraft}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        onBlur={handleNoteBlur}
                        onFocus={(e) => handleNoteFocus(e.currentTarget)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") e.currentTarget.blur();
                        }}
                        maxLength={200}
                        aria-describedby={`item-note-help-${item.id}`}
                      />
                      <div
                        id={`item-note-help-${item.id}`}
                        className={`mt-2 text-right text-xs ${styles.textSecondary}`}
                      >
                        <span>{noteDraft.length}/200</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditItemNote(item.id, item.note)}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${styles.inputBorder} ${styles.inputBg}`}
                      aria-label={item.note ? `${item.name} notunu düzenle` : `${item.name} için not ekle`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 shrink-0 ${styles.primaryText}`}
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
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium ${styles.text}`}>
                          {item.note ? "Ürün notu" : "Not ekle"}
                        </span>
                        {item.note && (
                          <span className={`mt-0.5 block line-clamp-2 text-sm leading-5 ${styles.textSecondary}`}>
                            {item.note}
                          </span>
                        )}
                      </span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-5 w-5 shrink-0 ${styles.textSecondary}`}
                      >
                        <path d="m7.5 5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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

                {activeNoteEditor?.type === "general" ? (
                  <div className={`rounded-xl border p-3 ${styles.inputBg} ${styles.inputBorder}`}>
                    <label htmlFor="general-order-note" className="sr-only">
                      Genel sipariş notu
                    </label>
                    <textarea
                      id="general-order-note"
                      autoFocus
                      enterKeyHint="done"
                      className={`textarea w-full min-h-24 resize-none border-0 bg-transparent p-0 text-base leading-6 shadow-none outline-none focus:outline-none ${styles.inputText} placeholder:text-gray-400`}
                      placeholder="Örn. hepsi aynı anda gelsin..."
                      value={noteDraft}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      onBlur={handleNoteBlur}
                      onFocus={(e) => handleNoteFocus(e.currentTarget)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") e.currentTarget.blur();
                      }}
                      maxLength={500}
                      aria-describedby="general-note-help"
                    />
                    <div
                      id="general-note-help"
                      className={`mt-2 text-right text-xs ${styles.textSecondary}`}
                    >
                      <span>{noteDraft.length}/500</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditGeneralNote}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${styles.inputBorder} ${styles.inputBg}`}
                    aria-label={generalNote ? "Genel sipariş notunu düzenle" : "Genel sipariş notu ekle"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 shrink-0 ${styles.primaryText}`}
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
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium ${styles.text}`}>
                        {generalNote ? "Notu düzenle" : "Genel not ekle"}
                      </span>
                      {generalNote && (
                        <span className={`mt-0.5 block line-clamp-2 text-sm leading-5 ${styles.textSecondary}`}>
                          {generalNote}
                        </span>
                      )}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      className={`h-5 w-5 shrink-0 ${styles.textSecondary}`}
                    >
                      <path d="m7.5 5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer - Total and Order Button */}
        {itemsWithNotes.length > 0 && !activeNoteEditor && (
          <div className={`px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 border-t ${styles.border} space-y-2.5 shrink-0`}>
            <div className="flex justify-between items-center">
              <span className={styles.textSecondary}>Toplam ({totalItems} ürün)</span>
              <span className={`text-[1.375rem] leading-tight font-bold ${styles.text}`}>
                {totalPrice.toFixed(2)} TL
              </span>
            </div>
            <button
              onClick={handleOrder}
              className={`btn h-[3.25rem] min-h-[3.25rem] w-full border-none text-base font-semibold text-white ${styles.primaryButton}`}
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
