
/**
 * R-MANS Form Validation Utilities
 */

/**
 * Validate customer name.
 * @param {string} name
 * @returns {boolean}
 */
export function isValidName(name) {
  return typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 60;
}

/**
 * Validate an Indian mobile number.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(String(phone).trim());
}

/**
 * Validate a 6-digit OTP.
 * @param {string} otp
 * @returns {boolean}
 */
export function isValidOTP(otp) {
  return /^\d{6}$/.test(String(otp).trim());
}

/**
 * Validate product price.
 * @param {number|string} price
 * @returns {boolean}
 */
export function isValidPrice(price) {
  const amount = Number(price);

  return Number.isFinite(amount) && amount > 0;
}

/**
 * Validate product name.
 * @param {string} name
 * @returns {boolean}
 */
export function isValidProductName(name) {
  return typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 100;
}

/**
 * Validate delivery address.
 * @param {string} address
 * @returns {boolean}
 */
export function isValidAddress(address) {
  return typeof address === "string" &&
    address.trim().length >= 10 &&
    address.trim().length <= 500;
}

/**
 * Validate product quantity.
 * @param {number|string} quantity
 * @returns {boolean}
 */
export function isValidQuantity(quantity) {
  const amount = Number(quantity);

  return Number.isInteger(amount) && amount >= 1 && amount <= 100;
}

/**
 * Validate an email address.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}
