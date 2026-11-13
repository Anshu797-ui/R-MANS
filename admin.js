
/* =====================================
   R-MANS - ADMIN PANEL
   Firebase SDK 10.14.1
===================================== */

import { db, auth } from "../firebase/firebase-config.js";
import { uploadProductImage } from "../firebase/storage.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const PRODUCTS = "products";
const ORDERS = "orders";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled"
];

/**
 * @typedef {Object} AdminProduct
 * @property {string} name
 * @property {number} price
 * @property {string} collection
 * @property {string} department
 * @property {string} category
 * @property {string} sizes
 * @property {string} color
 * @property {number} stock
 * @property {string} description
 * @property {File|null} image
 */

/**
 * @typedef {Object} AdminOrder
 * @property {string} [customerName]
 * @property {string} [phone]
 * @property {string} [deliveryAddress]
 * @property {number} [total]
 * @property {string} [status]
 * @property {Array<{name?: string, quantity?: number|string}>} [items]
 * @property {{toDate?: () => Date, toMillis?: () => number}|null} [createdAt]
 */

/**
 * @typedef {Object} AdminOrderDocument
 * @property {string} id
 * @property {() => AdminOrder} data
 */

/**
 * Get element by ID.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Check Firebase admin access.
 * @returns {Promise<boolean>}
 */
async function isAdminUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const tokenResult = await user.getIdTokenResult(true);

  if (tokenResult.claims.admin !== true) {
    throw new Error("Admin access is not authorized.");
  }

  return true;
}

/**
 * Get product form values.
 * @returns {AdminProduct}
 */
function getAdminFormData() {
  const name = getElement("adminProductName");
  const price = getElement("adminProductPrice");
  const collectionField = getElement("adminCollection");
  const department = getElement("adminDepartment");
  const category = getElement("adminCategory");
  const sizes = getElement("adminSizes");
  const color = getElement("adminColor");
  const stock = getElement("adminStock");
  const description = getElement("adminDescription");
  const image = getElement("adminImage");

  if (
    !name || !price || !collectionField ||
    !department || !category || !sizes ||
    !color || !stock || !description || !image
  ) {
    throw new Error("Admin product form is incomplete.");
  }

  if (
    !(name instanceof HTMLInputElement) ||
    !(price instanceof HTMLInputElement) ||
    !(collectionField instanceof HTMLSelectElement) ||
    !(department instanceof HTMLSelectElement) ||
    !(category instanceof HTMLInputElement) ||
    !(sizes instanceof HTMLInputElement) ||
    !(color instanceof HTMLInputElement) ||
    !(stock instanceof HTMLInputElement) ||
    !(description instanceof HTMLTextAreaElement) ||
    !(image instanceof HTMLInputElement)
  ) {
    throw new Error("Some product form fields have incorrect HTML types.");
  }

  return {
    name: name.value.trim(),
    price: Number(price.value),
    collection: collectionField.value,
    department: department.value,
    category: category.value.trim(),
    sizes: sizes.value.trim(),
    color: color.value.trim(),
    stock: Number(stock.value),
    description: description.value.trim(),
    image: image.files ? image.files[0] || null : null
  };
}

/**
 * Validate product information.
 * @param {AdminProduct} product
 * @returns {boolean}
 */
function validateAdminProduct(product) {
  if (!product.name || product.name.length < 2) {
    throw new Error("Enter a valid product name.");
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    throw new Error("Enter a valid product price.");
  }

  if (
    !product.collection ||
    !product.department ||
    !product.category
  ) {
    throw new Error("Select collection, department and category.");
  }

  if (!Number.isFinite(product.stock) || product.stock < 0) {
    throw new Error("Enter a valid stock quantity.");
  }

  if (!product.image) {
    throw new Error("Please select a product image.");
  }

  if (!product.image.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  if (product.image.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be below 5 MB.");
  }

  return true;
}

/**
 * Clear product form.
 */
function clearAdminForm() {
  const fields = [
    "adminProductName",
    "adminProductPrice",
    "adminSizes",
    "adminColor",
    "adminStock",
    "adminDescription",
    "adminImage"
  ];

  fields.forEach(function (id) {
    const element = getElement(id);

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.value = "";
    }
  });
}

/**
 * Save a new product.
 * @returns {Promise<void>}
 */
export async function saveAdminProduct() {
  const message = getElement("adminMessage");
  const saveButton = getElement("saveProductBtn");

  try {
    await isAdminUser();

    const product = getAdminFormData();
    validateAdminProduct(product);

    if (saveButton instanceof HTMLButtonElement) {
      saveButton.disabled = true;
    }

    if (message) {
      message.textContent = "Uploading product image...";
    }

    if (!product.image) {
      throw new Error("Please select a product image.");
    }

    const imageUrl = await uploadProductImage(product.image);

    if (!imageUrl) {
      throw new Error("Image upload failed.");
    }

    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login again.");
    }

    const productData = {
      name: product.name,
      price: product.price,
      collection: product.collection,
      department: product.department,
      category: product.category,
      sizes: product.sizes,
      color: product.color,
      stock: product.stock,
      description: product.description,
      imageUrl: imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid,
      active: true
    };

    await addDoc(collection(db, PRODUCTS), productData);

    if (message) {
      message.textContent = "Product saved successfully.";
    }

    clearAdminForm();
    await loadAdminProducts();

  } catch (error) {
    console.error("Admin save error:", error);

    if (message) {
      message.textContent =
        error instanceof Error
          ? error.message
          : "Unable to save product.";
    }

  } finally {
    if (saveButton instanceof HTMLButtonElement) {
      saveButton.disabled = false;
    }
  }
}

/**
 * Load products in admin panel.
 * @returns {Promise<void>}
 */
export async function loadAdminProducts() {
  const productList = getElement("adminProductList");

  if (!productList) {
    return;
  }

  try {
    await isAdminUser();

    productList.textContent = "Loading products...";

    const snapshot = await getDocs(collection(db, PRODUCTS));

    productList.replaceChildren();

    if (snapshot.empty) {
      productList.textContent = "No products added yet.";
      return;
    }

    snapshot.forEach(
      /**
       * @param {import("firebase/firestore").QueryDocumentSnapshot} productDoc
       */
      function (productDoc) {
        const product = productDoc.data();

        const card = document.createElement("div");
        card.className = "admin-product-card";

        const image = document.createElement("img");
        image.src =
          typeof product.imageUrl === "string"
            ? product.imageUrl
            : "";
        image.alt = product.name || "Product";
        image.loading = "lazy";

        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed product";

        const price = document.createElement("p");
        price.textContent = "Price: ₹" + Number(product.price || 0);

        const stock = document.createElement("p");
        stock.textContent = "Stock: " + Number(product.stock || 0);

        card.append(image, name, price, stock);
        productList.appendChild(card);
      }
    );

  } catch (error) {
    console.error("Admin products error:", error);

    productList.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load products.";
  }
}

/**
 * Format order date.
 * @param {AdminOrder} order
 * @returns {string}
 */
function formatOrderDate(order) {
  try {
    if (
      order.createdAt &&
      typeof order.createdAt.toDate === "function"
    ) {
      return order.createdAt.toDate().toLocaleString("en-IN");
    }
  } catch (error) {
    console.warn("Order date formatting error:", error);
  }

  return "Date unavailable";
}

/**
 * Change order status.
 * @param {string} orderId
 * @param {string} newStatus
 * @returns {Promise<void>}
 */
async function changeOrderStatus(orderId, newStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error("Invalid order status.");
  }

  await isAdminUser();

  await updateDoc(
    doc(db, ORDERS, orderId),
    {
      status: newStatus,
      updatedAt: serverTimestamp()
    }
  );
}

/**
 * Load all customer orders in admin panel.
 * @returns {Promise<void>}
 */
export async function loadAdminOrders() {
  const orderList = getElement("adminOrderList");

  if (!orderList) {
    console.warn("Admin order list element not found.");
    return;
  }

  try {
    await isAdminUser();

    orderList.textContent = "Loading orders...";

    const snapshot = await getDocs(
      collection(db, ORDERS)
    );

    orderList.replaceChildren();

    if (snapshot.empty) {
      orderList.textContent = "No customer orders yet.";
      return;
    }

    const orderDocs = snapshot.docs.slice();

    orderDocs.sort(
      /**
       * @param {AdminOrderDocument} a
       * @param {AdminOrderDocument} b
       */
      function (a, b) {
        const dateA = a.data().createdAt;
        const dateB = b.data().createdAt;

        const timeA =
          dateA && typeof dateA.toMillis === "function"
            ? dateA.toMillis()
            : 0;

        const timeB =
          dateB && typeof dateB.toMillis === "function"
            ? dateB.toMillis()
            : 0;

        return timeB - timeA;
      }
    );

    orderDocs.forEach(
      /**
       * @param {import("firebase/firestore").QueryDocumentSnapshot} orderDoc
       */
      function (orderDoc) {
        /** @type {AdminOrder} */
        const order = orderDoc.data();

        const card = document.createElement("article");
        card.className = "admin-order-card";

        const title = document.createElement("h3");
        title.textContent = "Order #" + orderDoc.id;

        const customer = document.createElement("p");
        customer.textContent =
          "Customer: " + (order.customerName || "Not provided");

        const phone = document.createElement("p");
        phone.textContent =
          "Phone: " + (order.phone || "Not provided");

        const address = document.createElement("p");
        address.textContent =
          "Delivery Address: " +
          (order.deliveryAddress || "Not provided");

        const total = document.createElement("p");
        total.textContent =
          "Total: ₹" + Number(order.total || 0);

        const date = document.createElement("p");
        date.textContent = "Date: " + formatOrderDate(order);

        const itemsHeading = document.createElement("h4");
        itemsHeading.textContent = "Ordered Products";

        const itemsList = document.createElement("ul");

        if (Array.isArray(order.items)) {
          order.items.forEach(function (item) {
            const listItem = document.createElement("li");

            const itemName =
              item && typeof item.name === "string"
                ? item.name
                : "Product";

            const quantity =
              item && Number.isFinite(Number(item.quantity))
                ? Number(item.quantity)
                : 1;

            listItem.textContent =
              itemName + " × " + quantity;

            itemsList.appendChild(listItem);
          });
        }

        const statusLabel = document.createElement("label");
        statusLabel.textContent = "Order Status: ";

        const statusSelect = document.createElement("select");
        statusSelect.setAttribute("aria-label", "Order status");

        ORDER_STATUSES.forEach(function (status) {
          const option = document.createElement("option");
          option.value = status;
          option.textContent = status;
          statusSelect.appendChild(option);
        });

        statusSelect.value = ORDER_STATUSES.includes(
          order.status || ""
        )
          ? order.status
          : "Pending";

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.textContent = "Update Status";

        const statusMessage = document.createElement("p");
        statusMessage.setAttribute("aria-live", "polite");

        updateButton.addEventListener("click", async function () {
          updateButton.disabled = true;
          statusMessage.textContent = "Updating status...";

          try {
            await changeOrderStatus(
              orderDoc.id,
              statusSelect.value
            );

            statusMessage.textContent = "Order status updated.";
          } catch (error) {
            console.error("Order status error:", error);

            statusMessage.textContent =
              error instanceof Error
                ? error.message
                : "Unable to update order status.";
          } finally {
            updateButton.disabled = false;
          }
        });

        statusLabel.appendChild(statusSelect);

        card.append(
          title,
          customer,
          phone,
          address,
          total,
          date,
          itemsHeading,
          itemsList,
          statusLabel,
          updateButton,
          statusMessage
        );

        orderList.appendChild(card);
      }
    );

  } catch (error) {
    console.error("Admin orders error:", error);

    orderList.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load customer orders.";
  }
}

/**
 * Initialize admin panel.
 */
export function initAdminPanel() {
  const saveButton = getElement("saveProductBtn");

  if (
    saveButton &&
    saveButton.dataset.initialized !== "true"
  ) {
    saveButton.dataset.initialized = "true";

    saveButton.addEventListener("click", function () {
      saveAdminProduct();
    });
  }

  loadAdminOrders();
}
