
/* =====================================
   R-MANS - FIREBASE STORAGE
   Firebase SDK 10.14.1
===================================== */

import { storage, auth } from "./firebase-config.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";


// Upload product image
/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadProductImage(file) {
  try {
    if (!auth.currentUser) {
      throw new Error("Please login first.");
    }

    if (!file) {
      throw new Error("Please select an image.");
    }

    if (!file.type || !file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must be below 5 MB.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const imagePath =
      "products/" +
      Date.now() +
      "_" +
      safeName;

    const imageRef = ref(storage, imagePath);

    await uploadBytes(imageRef, file);

    const imageUrl = await getDownloadURL(imageRef);

    return imageUrl;

  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}


// Delete product image
/**
 * @param {string} imagePath
 */
export async function deleteProductImage(imagePath) {
  try {
    if (!auth.currentUser) {
      throw new Error("Please login first.");
    }

    if (!imagePath) {
      throw new Error("Image path is required.");
    }

    const imageRef = ref(storage, imagePath);

    await deleteObject(imageRef);

    return true;

  } catch (error) {
    console.error("Image delete error:", error);
    throw error;
  }
}
