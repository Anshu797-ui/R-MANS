
/* =====================================
   R-MANS - FIREBASE AUTHENTICATION
   Customer Phone Login & OTP Verification
   Firebase SDK 10.14.1
===================================== */

import { auth } from "./firebase-config.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";


// Store reCAPTCHA and OTP confirmation
let recaptchaVerifier = null;
let confirmationResult = null;


// Format Indian mobile number

/**
 * @param {string} phone
 * @returns {string}
 */
function formatPhoneNumber(phone) {
  let number = String(phone || "").replace(/[^\d+]/g, "");

  if (/^[6-9]\d{9}$/.test(number)) {
    number = "+91" + number;
  } else if (/^91[6-9]\d{9}$/.test(number)) {
    number = "+" + number;
  }

  if (!/^\+[1-9]\d{7,14}$/.test(number)) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  return number;
}


// Setup reCAPTCHA

/**
 * @param {string} containerId
 * @returns {Promise<object>}
 */
async function getRecaptcha(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error("reCAPTCHA container not found.");
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "normal",

        callback: function () {
          console.log("reCAPTCHA verified.");
        },

        "expired-callback": function () {
          console.log("reCAPTCHA expired. Please try again.");
        }
      }
    );
  }

  await recaptchaVerifier.render();

  return recaptchaVerifier;
}


// Send OTP

/**
 * @param {string} phone
 * @param {string} containerId
 * @returns {Promise<{success: boolean, message: string, errorCode?: string}>}
 */
export async function sendOTP(
  phone,
  containerId = "recaptcha-container"
) {
  try {
    confirmationResult = null;

    const formattedPhone = formatPhoneNumber(phone);

    console.log("Sending OTP to:", formattedPhone);

    const verifier = await getRecaptcha(containerId);

    confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      verifier
    );

    console.log("Firebase accepted OTP request.");

    return {
      success: true,
      message: "OTP request accepted by Firebase. Please check your SMS."
    };

  } catch (error) {
    console.error("OTP sending error:", error);

    resetRecaptcha();

    return {
      success: false,
      message: getAuthErrorMessage(error),
      errorCode:
        error && typeof error.code === "string"
          ? error.code
          : "unknown"
    };
  }
}


// Verify OTP

/**
 * @param {string} otp
 * @returns {Promise<{success: boolean, user?: object, message: string, errorCode?: string}>}
 */
export async function verifyOTP(otp) {
  try {
    if (!confirmationResult) {
      throw new Error("Please request an OTP first.");
    }

    const code = String(otp || "").trim();

    if (!/^\d{6}$/.test(code)) {
      throw new Error("Please enter a valid 6-digit OTP.");
    }

    const userCredential = await confirmationResult.confirm(code);

    confirmationResult = null;

    resetRecaptcha();

    return {
      success: true,
      user: userCredential.user,
      message: "Login successful."
    };

  } catch (error) {
    console.error("OTP verification error:", error);

    return {
      success: false,
      message: getAuthErrorMessage(error),
      errorCode:
        error && typeof error.code === "string"
          ? error.code
          : "unknown"
    };
  }
}


// Logout customer

/**
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function logout() {
  try {
    await signOut(auth);

    confirmationResult = null;
    resetRecaptcha();

    return {
      success: true,
      message: "Logged out successfully."
    };

  } catch (error) {
    console.error("Logout error:", error);

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


// Get currently logged-in user

export function getCurrentUser() {
  return auth.currentUser;
}


// Listen for login status changes

/**
 * @param {Function} callback
 * @returns {Function}
 */
export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}


// Reset reCAPTCHA

export function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}


// Firebase error messages

/**
 * @param {Error & {code?: string}} error
 * @returns {string}
 */
function getAuthErrorMessage(error) {
  const code = error && error.code ? error.code : "";

  const messages = {
    "auth/invalid-phone-number":
      "Invalid mobile number. Please check your number.",

    "auth/missing-phone-number":
      "Please enter your mobile number.",

    "auth/invalid-verification-code":
      "Incorrect OTP. Please try again.",

    "auth/code-expired":
      "OTP expired. Please request a new OTP.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/quota-exceeded":
      "Firebase SMS quota exceeded. Please try again later.",

    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please try again.",

    "auth/operation-not-allowed":
      "Phone login is not enabled in Firebase.",

    "auth/unauthorized-domain":
      "This website domain is not authorized in Firebase.",

    "auth/billing-not-enabled":
      "Firebase requires billing setup for this SMS operation.",

    "auth/app-not-authorized":
      "This app or domain is not authorized for phone authentication."
  };

  return messages[code] ||
    (error && error.message) ||
    "Authentication failed. Please try again.";
}
