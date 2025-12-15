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
}: CartModalProps) {
  const [itemsWithNotes, setItemsWithNotes] = useState<CartItem[]>(items);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState("");
  const [isEditingGeneralNote, setIsEditingGeneralNote] = useState(false);
  const [tempGeneralNote, setTempGeneralNote] = useState(generalNote);

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
    console.log("Order data:", orderData);
    
    // Call the parent's submit handler
    onSubmitOrder();
    
    // Close modal
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  };

  return (
    <dialog id={modalId} className="modal modal-bottom">
      <div className="modal-box w-full max-w-md h-[60vh] max-h-[60vh] flex flex-col p-0 bg-white rounded-t-3xl rounded-b-none m-0 mx-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Sepetim</h2>
          <form method="dialog">
            <button className="btn btn-ghost btn-sm btn-circle">
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
                <p className="text-gray-400 text-lg">Sepetiniz boş</p>
              </div>
            ) : (
              <>
                {itemsWithNotes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl p-4 space-y-3"
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
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {item.price} TL
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center bg-pink-500 rounded-xl shadow-md h-8">
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-pink-600 rounded-xl transition-colors"
                            >
                              <span className="text-xl font-light">−</span>
                            </button>
                            <span className="px-3 text-white font-bold text-sm min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-pink-600 rounded-xl transition-colors"
                            >
                              <span className="text-xl font-light">+</span>
                            </button>
                          </div>
                          <span className="text-gray-900 font-semibold">
                             {(item.price * item.quantity).toFixed(2)} TL
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item Note Section */}
                    {editingItemId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="textarea textarea-bordered w-full text-sm h-16 resize-none bg-white text-gray-900 placeholder-gray-400 border-gray-300"
                          placeholder="Özel istek yazın..."
                          value={tempItemNote}
                          onChange={(e) => setTempItemNote(e.target.value)}
                          maxLength={200}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveItemNote(item.id)}
                            className="btn btn-sm bg-pink-500 hover:bg-pink-600 text-white border-none flex-1"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="btn btn-sm btn-outline flex-1"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditItemNote(item.id, item.note)}
                        className="text-pink-500 text-sm font-medium flex items-center gap-1 hover:text-pink-600"
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
                <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
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
                        className="textarea textarea-bordered w-full text-sm h-20 resize-none bg-white text-gray-900 placeholder-gray-400 border-gray-300"
                        placeholder="Siparişiniz için genel bir not yazın..."
                        value={tempGeneralNote}
                        onChange={(e) => setTempGeneralNote(e.target.value)}
                        maxLength={500}
                      />
                      <div className="text-right text-xs text-gray-400 mb-2">
                        {tempGeneralNote.length}/500
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveGeneralNote}
                          className="btn btn-sm bg-pink-500 hover:bg-pink-600 text-white border-none flex-1"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setIsEditingGeneralNote(false)}
                          className="btn btn-sm btn-outline flex-1"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditGeneralNote}
                      className="text-pink-500 text-sm font-medium flex items-center gap-1 hover:text-pink-600"
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
            <div className="p-6 pt-4 border-t border-gray-200 space-y-3 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam ({totalItems} ürün)</span>
                <span className="text-2xl font-bold text-gray-900">
                  {totalPrice.toFixed(2)} TL
                </span>
              </div>
              <button
                onClick={handleOrder}
                className="btn w-full bg-pink-500 hover:bg-pink-600 text-white border-none text-lg h-14"
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
