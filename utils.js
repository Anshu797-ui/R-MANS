
/**
 * R-MANS Utility Functions
 * Common helper functions used throughout the app.
 */

/**
 * Get an HTML element by its ID.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function getElement(id) {
  return document.getElementById(id);
}

/**
 * Safely convert a value to a number.
 * @param {*} value
 * @returns {number}
 */
export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Format a number as Indian Rupees.
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(toNumber(amount));
}

/**
 * Create a unique ID.
 * @returns {string}
 */
export function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "rmans-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 9);
}

/**
 * Check whether a value is empty.
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  return value === null ||
    value === undefined ||
    String(value).trim() === "";
}

/**
 * Safely display text inside an HTML element.
 * @param {HTMLElement|null} element
 * @param {*} value
 */
export function setText(element, value) {
  if (!element) return;
  element.textContent = String(value ?? "");
}

/**
 * Wait for a specified duration.
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
export function delay(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, Math.max(0, milliseconds));
  });
}

/**
 * Capitalize the first letter of a string.
 * @param {string} value
 * @returns {string}
 */
export function capitalize(value) {
  const text = String(value ?? "").trim();

  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
}
