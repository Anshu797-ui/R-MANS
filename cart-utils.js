
/**
 * R-MANS Cart Utility Functions
 */

import { toNumber } from "./utils.js";

/**
 * Calculate the total quantity of cart items.
 * @param {Array<object>} cart
 * @returns {number}
 */
export function getCartCount(cart = []) {
  return cart.reduce(function (total, item) {
    return total + Math.max(0, toNumber(item.quantity));
  }, 0);
}

/**
 * Calculate the subtotal of the cart.
 * @param {Array<object>} cart
 * @returns {number}
 */
export function getCartSubtotal(cart = []) {
  return cart.reduce(function (total, item) {
    const price = toNumber(item.price);
    const quantity = Math.max(0, toNumber(item.quantity));

    return total + price * quantity;
  }, 0);
}

/**
 * Calculate delivery charges.
 * @param {number} subtotal
 * @returns {number}
 */
export function getDeliveryCharge(subtotal) {
  const amount = toNumber(subtotal);

  if (amount <= 0) return 0;

  return amount >= 999 ? 0 : 50;
}

/**
 * Calculate the final cart total.
 * @param {Array<object>} cart
 * @returns {number}
 */
export function getCartTotal(cart = []) {
  const subtotal = getCartSubtotal(cart);
  return subtotal + getDeliveryCharge(subtotal);
}

/**
 * Add a product to the cart.
 * @param {Array<object>} cart
 * @param {object} product
 * @param {number} quantity
 * @returns {Array<object>}
 */
export function addToCart(cart = [], product, quantity = 1) {
  if (!product || !product.id) return [...cart];

  const updatedCart = [...cart];
  const existingIndex = updatedCart.findIndex(function (item) {
    return item.id === product.id;
  });

  const amount = Math.max(1, Math.floor(toNumber(quantity)));

  if (existingIndex >= 0) {
    updatedCart[existingIndex] = {
      ...updatedCart[existingIndex],
      quantity: toNumber(updatedCart[existingIndex].quantity) + amount
    };
  } else {
    updatedCart.push({
      ...product,
      quantity: amount
    });
  }

  return updatedCart;
}

/**
 * Update the quantity of a cart item.
 * @param {Array<object>} cart
 * @param {string} productId
 * @param {number} quantity
 * @returns {Array<object>}
 */
export function updateCartQuantity(cart = [], productId, quantity) {
  const amount = Math.floor(toNumber(quantity));

  if (amount <= 0) {
    return removeFromCart(cart, productId);
  }

  return cart.map(function (item) {
    if (item.id !== productId) return item;

    return {
      ...item,
      quantity: amount
    };
  });
}

/**
 * Remove a product from the cart.
 * @param {Array<object>} cart
 * @param {string} productId
 * @returns {Array<object>}
 */
export function removeFromCart(cart = [], productId) {
  return cart.filter(function (item) {
    return item.id !== productId;
  });
}

/**
 * Clear the shopping cart.
 * @returns {Array<object>}
 */
export function clearCart() {
  return [];
}
