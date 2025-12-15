/**
 * Basket Service - localStorage-based Shopping Cart Management
 * 
 * This service manages the user's shopping basket using localStorage.
 * It stores basket items with menuItemId, quantity, and notes.
 * 
 * Expected Order Format:
 * {
 *   "qrToken": "a6c165be-01ad-4d4b-bb0f-ee3e9a24dccb",
 *   "items": [{
 *     "menuItemId": 3,
 *     "quantity": 2,
 *     "note": "Soğansız"
 *   }],
 *   "generalNote": "Acılı olsun lütfen"
 * }
 */

export interface BasketItem {
  menuItemId: number;
  quantity: number;
  note?: string;
}

export interface Basket {
  qrToken: string;
  items: BasketItem[];
  generalNote?: string;
}

export interface OrderRequest {
  qrToken: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
    note?: string;
  }>;
  generalNote?: string;
}

const BASKET_STORAGE_KEY = 'qrinyo_basket';

/**
 * Get the current basket from localStorage
 */
export const getBasket = (qrToken: string): Basket => {
  if (typeof window === 'undefined') {
    return { qrToken, items: [], generalNote: '' };
  }

  try {
    const stored = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!stored) {
      return { qrToken, items: [], generalNote: '' };
    }

    const basket: Basket = JSON.parse(stored);
    
    // Ensure basket is for the current table (qrToken)
    if (basket.qrToken !== qrToken) {
      return { qrToken, items: [], generalNote: '' };
    }

    return basket;
  } catch (error) {
    console.error('Error reading basket from localStorage:', error);
    return { qrToken, items: [], generalNote: '' };
  }
};

/**
 * Save the basket to localStorage
 */
export const saveBasket = (basket: Basket): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  } catch (error) {
    console.error('Error saving basket to localStorage:', error);
  }
};

/**
 * Add an item to the basket or update quantity if it already exists
 */
export const addItemToBasket = (
  qrToken: string,
  menuItemId: number,
  quantity: number = 1,
  note?: string
): Basket => {
  const basket = getBasket(qrToken);
  
  const existingItemIndex = basket.items.findIndex(
    item => item.menuItemId === menuItemId
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    basket.items[existingItemIndex].quantity += quantity;
    if (note !== undefined) {
      basket.items[existingItemIndex].note = note;
    }
  } else {
    // Add new item
    basket.items.push({ menuItemId, quantity, note });
  }

  saveBasket(basket);
  return basket;
};

/**
 * Update the quantity of an item in the basket
 */
export const updateItemQuantity = (
  qrToken: string,
  menuItemId: number,
  quantity: number
): Basket => {
  const basket = getBasket(qrToken);
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    basket.items = basket.items.filter(item => item.menuItemId !== menuItemId);
  } else {
    const itemIndex = basket.items.findIndex(
      item => item.menuItemId === menuItemId
    );
    
    if (itemIndex >= 0) {
      basket.items[itemIndex].quantity = quantity;
    }
  }

  saveBasket(basket);
  return basket;
};

/**
 * Update the note for a specific item
 */
export const updateItemNote = (
  qrToken: string,
  menuItemId: number,
  note: string
): Basket => {
  const basket = getBasket(qrToken);
  
  const itemIndex = basket.items.findIndex(
    item => item.menuItemId === menuItemId
  );
  
  if (itemIndex >= 0) {
    basket.items[itemIndex].note = note;
    saveBasket(basket);
  }

  return basket;
};

/**
 * Remove an item from the basket
 */
export const removeItemFromBasket = (
  qrToken: string,
  menuItemId: number
): Basket => {
  const basket = getBasket(qrToken);
  basket.items = basket.items.filter(item => item.menuItemId !== menuItemId);
  saveBasket(basket);
  return basket;
};

/**
 * Update the general note for the entire order
 */
export const updateGeneralNote = (
  qrToken: string,
  generalNote: string
): Basket => {
  const basket = getBasket(qrToken);
  basket.generalNote = generalNote;
  saveBasket(basket);
  return basket;
};

/**
 * Clear the entire basket
 */
export const clearBasket = (qrToken: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(BASKET_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing basket:', error);
  }
};

/**
 * Get the basket item count
 */
export const getBasketItemCount = (qrToken: string): number => {
  const basket = getBasket(qrToken);
  return basket.items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Prepare order request object for backend
 */
export const prepareOrderRequest = (qrToken: string): OrderRequest => {
  const basket = getBasket(qrToken);
  
  return {
    qrToken: basket.qrToken,
    items: basket.items.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      ...(item.note && { note: item.note })
    })),
    ...(basket.generalNote && { generalNote: basket.generalNote })
  };
};
