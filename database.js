
/* =====================================
   R-MANS - FIREBASE DATABASE
   Firebase SDK 10.14.1
===================================== */

import { db, auth } from "./firebase-config.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const PRODUCTS = "products";
const CUSTOMERS = "customers";
const ORDERS = "orders";

/**
 * Get logged-in user.
 */
function getLoggedInUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  return user;
}

// Get all products
export async function getProducts() {
  try {
    const snapshot = await getDocs(
      collection(db, PRODUCTS)
    );

    return snapshot.docs.map(
      /**
       * @param {import("firebase/firestore").QueryDocumentSnapshot} item
       */
      function (item) {
        return {
          id: item.id,
          ...item.data()
        };
      }
    );

  } catch (error) {
    console.error("Get products error:", error);
    throw error;
  }
}

// Get one product
/**
 * @param {string} productId
 */
export async function getProductById(productId) {
  try {
    if (!productId) {
      throw new Error("Product ID is required.");
    }

    const snapshot = await getDoc(
      doc(db, PRODUCTS, productId)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };

  } catch (error) {
    console.error("Get product error:", error);
    throw error;
  }
}

// Save customer profile
/**
 * @param {string} name
 * @param {string} phone
 */
export async function saveCustomerProfile(name, phone) {
  try {
    const user = getLoggedInUser();

    const customerName = String(name || "").trim();
    const customerPhone = String(phone || "").trim();

    if (customerName.length < 2) {
      throw new Error("Please enter a valid name.");
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      throw new Error("Please enter a valid Indian mobile number.");
    }

    const customerData = {
      uid: user.uid,
      name: customerName,
      phone: customerPhone,
      updatedAt: serverTimestamp()
    };

    await setDoc(
      doc(db, CUSTOMERS, user.uid),
      customerData,
      { merge: true }
    );

    return {
      success: true,
      message: "Customer profile saved."
    };

  } catch (error) {
    console.error("Save customer error:", error);
    throw error;
  }
}

// Get customer profile
export async function getCustomerProfile() {
  try {
    const user = getLoggedInUser();

    const snapshot = await getDoc(
      doc(db, CUSTOMERS, user.uid)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data();

  } catch (error) {
    console.error("Get customer error:", error);
    throw error;
  }
}

// Place order
/**
 * @param {{
 *   customerName: string,
 *   phone: string,
 *   deliveryAddress: string,
 *   items: Array<object>,
 *   total: number
 * }} orderDetails
 */
export async function placeOrder(orderDetails) {
  try {
    const user = getLoggedInUser();

    if (!orderDetails || !Array.isArray(orderDetails.items)) {
      throw new Error("Invalid order details.");
    }

    if (orderDetails.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const customerName = String(
      orderDetails.customerName || ""
    ).trim();

    const phone = String(
      orderDetails.phone || user.phoneNumber || ""
    ).trim();

    const deliveryAddress = String(
      orderDetails.deliveryAddress || ""
    ).trim();

    const total = Number(orderDetails.total);

    if (customerName.length < 2) {
      throw new Error("Please enter your name.");
    }

    if (deliveryAddress.length < 10) {
      throw new Error("Please enter a complete delivery address.");
    }

    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("Invalid order total.");
    }

    const orderData = {
      uid: user.uid,
      customerId: user.uid,
      customerName: customerName,
      phone: phone,
      deliveryAddress: deliveryAddress,
      items: orderDetails.items,
      total: total,
      status: "Pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const result = await addDoc(
      collection(db, ORDERS),
      orderData
    );

    return {
      success: true,
      orderId: result.id,
      message: "Order placed successfully."
    };

  } catch (error) {
    console.error("Place order error:", error);
    throw error;
  }
}

// Get logged-in customer's orders
export async function getMyOrders() {
  try {
    const user = getLoggedInUser();

    const ordersQuery = query(
      collection(db, ORDERS),
      where("customerId", "==", user.uid)
    );

    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map(
      /**
       * @param {import("firebase/firestore").QueryDocumentSnapshot} item
       */
      function (item) {
        return {
          id: item.id,
          ...item.data()
        };
      }
    );

  } catch (error) {
    console.error("Get orders error:", error);
    throw error;
  }
}
