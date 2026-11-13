
/* =====================================
   R-MANS - MAIN APPLICATION
   Firebase SDK 10.14.1
===================================== */

import {
  sendOTP,
  verifyOTP,
  logout,
  getCurrentUser
} from "./firebase/auth.js";

import {
  getProducts,
  getProductById,
  saveCustomerProfile,
  getCustomerProfile,
  placeOrder,
  getMyOrders
} from "./firebase/database.js";

import {
  initAdminPanel,
  loadAdminProducts
} from "./admin/admin.js";


// =====================================
// ADMIN PASSWORD SETTINGS
// =====================================

const ADMIN_PASSWORD = "CHANGE_THIS_PASSWORD";


// =====================================
// DATA TYPES
// =====================================

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} [imageUrl]
 * @property {string} [description]
 * @property {string} [collection]
 * @property {string} [department]
 * @property {string} [category]
 * @property {string} [sizes]
 * @property {number} [stock]
 * @property {boolean} [active]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} imageUrl
 * @property {number} quantity
 */

/**
 * @typedef {Object} CustomerOrder
 * @property {string} id
 * @property {number} total
 * @property {string} status
 */


// =====================================
// APPLICATION STATE
// =====================================

/** @type {string} */
let currentScreen = "welcome";

/** @type {string[]} */
let previousScreens = [];

/** @type {Product[]} */
let products = [];

/** @type {CartItem[]} */
let cart = [];

/** @type {string} */
let currentLanguage = "en";

/** @type {boolean} */
let adminInitialized = false;


// Load saved cart
try {
  const savedCart = localStorage.getItem("rmans_cart");
  const parsedCart = savedCart ? JSON.parse(savedCart) : [];

  if (Array.isArray(parsedCart)) {
    cart = parsedCart;
  }
} catch (error) {
  console.error("Cart loading error:", error);
}


// =====================================
// BASIC HELPERS
// =====================================

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * @param {string} message
 */
function showToast(message) {
  const toast = getElement("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

function saveCart() {
  localStorage.setItem("rmans_cart", JSON.stringify(cart));
}

/**
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
  return "₹" + Number(price || 0).toLocaleString("en-IN");
}


// =====================================
// SCREEN NAVIGATION
// =====================================

/**
 * @param {string} screenId
 * @param {boolean} [addHistory]
 */
function showScreen(screenId, addHistory = true) {
  const target = getElement(screenId);

  if (!target) {
    console.warn("Screen not found:", screenId);
    return;
  }

  if (currentScreen !== screenId && addHistory) {
    previousScreens.push(currentScreen);

    history.pushState(
      { screen: screenId },
      "",
      "#" + screenId
    );
  }

  document.querySelectorAll(
    "#welcome, #login, #home, #shop, #productDetails, #cart, #orders, #profile, #adminLogin, #admin"
  ).forEach(
    /** @param {HTMLElement} screen */
    function (screen) {
      screen.hidden = true;
      screen.classList.remove("active");
    }
  );

  target.hidden = false;
  target.classList.add("active");

  currentScreen = screenId;

  updateBackButton();
  updateCartDisplay();
}


// =====================================
// BACK ARROW
// =====================================

function updateBackButton() {
  const screenIds = [
    "login",
    "home",
    "shop",
    "productDetails",
    "cart",
    "orders",
    "profile",
    "adminLogin",
    "admin"
  ];

  screenIds.forEach(
    /** @param {string} screenId */
    function (screenId) {
      const screen = getElement(screenId);

      if (!screen) return;

      let backButton = screen.querySelector(".rmans-back-button");

      if (!backButton) {
        backButton = document.createElement("button");
        backButton.type = "button";
        backButton.className = "rmans-back-button";
        backButton.textContent = "←";
        backButton.setAttribute("aria-label", "Go back");

        backButton.style.cssText =
          "display:inline-flex;align-items:center;justify-content:center;" +
          "width:38px;height:38px;border:1px solid #c5a45a;" +
          "border-radius:50%;background:#111;color:#d6b56d;" +
          "font-size:24px;cursor:pointer;margin:8px;";

        backButton.addEventListener("click", goBack);

        screen.insertBefore(backButton, screen.firstChild);
      }

      backButton.hidden = screenId === "home";
    }
  );
}


function goBack() {
  if (previousScreens.length > 0) {
    history.back();
  } else {
    showScreen("home", false);
  }
}


// Browser and mobile Back Button
window.addEventListener("popstate", function () {
  const previous = previousScreens.pop();

  if (previous && getElement(previous)) {
    showScreen(previous, false);
  } else {
    showScreen("home", false);
  }
});


// =====================================
// LANGUAGE
// =====================================

/**
 * @param {string} language
 */
function setLanguage(language) {
  currentLanguage = language;

  document.querySelectorAll("[data-lang]").forEach(
    /** @param {HTMLElement} element */
    function (element) {
      element.hidden = element.dataset.lang !== language;
    }
  );

  localStorage.setItem("rmans_language", language);
}


function initializeLanguage() {
  const savedLanguage =
    localStorage.getItem("rmans_language") || "en";

  setLanguage(savedLanguage);

  document.querySelectorAll("[data-lang]").forEach(
    /** @param {HTMLElement} element */
    function (element) {
      element.addEventListener("click", function () {
        if (element.dataset.lang) {
          setLanguage(element.dataset.lang);
        }
      });
    }
  );

  const languageButton = getElement("settingsLanguageBtn");

  if (languageButton) {
    languageButton.addEventListener("click", function () {
      setLanguage(currentLanguage === "en" ? "hi" : "en");
    });
  }
}


// =====================================
// PHONE OTP LOGIN
// =====================================

const sendOtpButton = getElement("sendOtpBtn");
const verifyOtpButton = getElement("verifyOtpBtn");


if (sendOtpButton) {
  sendOtpButton.addEventListener("click", async function () {
    const phoneInput = getElement("phoneNumber");
    const message = getElement("loginMessage");

    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      sendOtpButton.disabled = true;

      if (message) {
        message.textContent = "Sending OTP...";
      }

      // auth.js formats the Indian number automatically
      const result = await sendOTP(phone);

      if (!result.success) {
        throw new Error(result.message || "Unable to send OTP.");
      }

      if (message) {
        message.textContent = "OTP sent. Please verify it.";
      }

      showToast("OTP sent successfully.");

    } catch (error) {
      console.error("OTP error:", error);

      if (message) {
        message.textContent =
          error.message || "Unable to send OTP.";
      }

      showToast(error.message || "Unable to send OTP.");

    } finally {
      sendOtpButton.disabled = false;
    }
  });
}


if (verifyOtpButton) {
  verifyOtpButton.addEventListener("click", async function () {
    const otpInput = getElement("otpCode");
    const nameInput = getElement("customerName");
    const phoneInput = getElement("phoneNumber");
    const message = getElement("loginMessage");

    const otp = otpInput ? otpInput.value.trim() : "";

    if (!/^\d{6}$/.test(otp)) {
      showToast("Enter the 6-digit OTP.");
      return;
    }

    try {
      verifyOtpButton.disabled = true;

      if (message) {
        message.textContent = "Verifying OTP...";
      }

      const result = await verifyOTP(otp);

      if (!result.success) {
        throw new Error(
          result.message || "OTP verification failed."
        );
      }

      const name = nameInput ? nameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";

      if (name.length >= 2 && phone) {
        await saveCustomerProfile(name, phone);
      }

      if (message) {
        message.textContent = "Login successful.";
      }

      showToast("Welcome to R-MANS!");

      await loadProducts();
      showScreen("home");

    } catch (error) {
      console.error("Login error:", error);

      if (message) {
        message.textContent =
          error.message || "OTP verification failed.";
      }

      showToast(error.message || "OTP verification failed.");

    } finally {
      verifyOtpButton.disabled = false;
    }
  });
}


// =====================================
// PRODUCTS
// =====================================

async function loadProducts() {
  try {
    products = await getProducts();

    renderProducts(products);
    renderFeaturedProducts(products);

  } catch (error) {
    console.error("Products error:", error);
    showToast("Unable to load products.");
  }
}


/**
 * @param {Product} product
 * @returns {HTMLElement}
 */
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("img");
  image.src = product.imageUrl || "";
  image.alt = product.name || "Product";
  image.loading = "lazy";

  const name = document.createElement("h3");
  name.textContent = product.name || "Product";

  const price = document.createElement("p");
  price.textContent = formatPrice(product.price);

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "View Product";

  button.addEventListener("click", function () {
    openProduct(product.id);
  });

  card.append(image, name, price, button);

  return card;
}


/**
 * @param {Product[]} productArray
 */
function renderProducts(productArray) {
  const productList = getElement("productList");

  if (!productList) return;

  productList.replaceChildren();

  const visibleProducts = productArray.filter(
    /** @param {Product} product */
    function (product) {
      return product.active !== false;
    }
  );

  if (visibleProducts.length === 0) {
    productList.textContent = "No products available.";
    return;
  }

  visibleProducts.forEach(
    /** @param {Product} product */
    function (product) {
      productList.appendChild(createProductCard(product));
    }
  );
}


/**
 * @param {Product[]} productArray
 */
function renderFeaturedProducts(productArray) {
  const featured = getElement("featuredProducts");

  if (!featured) return;

  featured.replaceChildren();

  productArray
    .filter(
      /** @param {Product} product */
      function (product) {
        return product.active !== false;
      }
    )
    .slice(0, 6)
    .forEach(
      /** @param {Product} product */
      function (product) {
        featured.appendChild(createProductCard(product));
      }
    );
}


// =====================================
// PRODUCT FILTERS
// =====================================

function applyProductFilters() {
  const collectionFilter = getElement("collectionFilter");
  const departmentFilter = getElement("departmentFilter");
  const sizeFilter = getElement("sizeFilter");

  let filtered = products.filter(
    /** @param {Product} product */
    function (product) {
      return product.active !== false;
    }
  );

  if (collectionFilter && collectionFilter.value) {
    filtered = filtered.filter(
      /** @param {Product} product */
      function (product) {
        return product.collection === collectionFilter.value;
      }
    );
  }

  if (departmentFilter && departmentFilter.value) {
    filtered = filtered.filter(
      /** @param {Product} product */
      function (product) {
        return product.department === departmentFilter.value;
      }
    );
  }

  if (sizeFilter && sizeFilter.value) {
    filtered = filtered.filter(
      /** @param {Product} product */
      function (product) {
        return String(product.sizes || "")
          .toLowerCase()
          .includes(sizeFilter.value.toLowerCase());
      }
    );
  }

  renderProducts(filtered);
}


// =====================================
// PRODUCT DETAILS
// =====================================

/**
 * @param {string} productId
 */
async function openProduct(productId) {
  try {
    const product = await getProductById(productId);

    if (!product) {
      showToast("Product not found.");
      return;
    }

    const content = getElement("productDetailContent");

    if (content) {
      content.replaceChildren();

      const image = document.createElement("img");
      image.src = product.imageUrl || "";
      image.alt = product.name || "Product";

      const name = document.createElement("h2");
      name.textContent = product.name || "Product";

      const price = document.createElement("h3");
      price.textContent = formatPrice(product.price);

      const description = document.createElement("p");
      description.textContent = product.description || "";

      const addButton = document.createElement("button");
      addButton.textContent = "Add to Cart";

      addButton.addEventListener("click", function () {
        addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || "",
          quantity: 1
        });
      });

      content.append(image, name, price, description, addButton);
    }

    showScreen("productDetails");

  } catch (error) {
    console.error("Product details error:", error);
    showToast("Unable to open product.");
  }
}


// =====================================
// CART
// =====================================

/**
 * @param {CartItem} product
 */
function addToCart(product) {
  const existing = cart.find(
    /** @param {CartItem} item */
    function (item) {
      return item.id === product.id;
    }
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl || "",
      quantity: 1
    });
  }

  saveCart();
  updateCartDisplay();

  showToast("Product added to cart.");
}


/**
 * @param {string} productId
 * @param {number} amount
 */
function changeQuantity(productId, amount) {
  const item = cart.find(
    /** @param {CartItem} entry */
    function (entry) {
      return entry.id === productId;
    }
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(
      /** @param {CartItem} entry */
      function (entry) {
        return entry.id !== productId;
      }
    );
  }

  saveCart();
  updateCartDisplay();
}


function updateCartDisplay() {
  const cartItems = getElement("cartItems");
  const cartTotal = getElement("cartTotal");

  if (!cartItems) return;

  cartItems.replaceChildren();

  let total = 0;

  cart.forEach(
    /** @param {CartItem} item */
    function (item) {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      const row = document.createElement("div");
      row.className = "cart-item";

      const name = document.createElement("p");
      name.textContent = item.name;

      const price = document.createElement("p");
      price.textContent = formatPrice(lineTotal);

      const minus = document.createElement("button");
      minus.textContent = "−";
      minus.addEventListener("click", function () {
        changeQuantity(item.id, -1);
      });

      const quantity = document.createElement("span");
      quantity.textContent = String(item.quantity);

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.addEventListener("click", function () {
        changeQuantity(item.id, 1);
      });

      row.append(name, price, minus, quantity, plus);
      cartItems.appendChild(row);
    }
  );

  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }
}


// =====================================
// PLACE ORDER
// =====================================

const bookNowButton = getElement("bookNowBtn");

if (bookNowButton) {
  bookNowButton.addEventListener("click", async function () {
    try {
      if (!getCurrentUser()) {
        showToast("Please login first.");
        showScreen("login");
        return;
      }

      if (cart.length === 0) {
        showToast("Your cart is empty.");
        return;
      }

      const profile = await getCustomerProfile();

      const address = prompt(
        "Enter your complete delivery address:"
      );

      if (!address || address.trim().length < 10) {
        showToast("Please enter a complete address.");
        return;
      }

      const customerName =
        profile?.name ||
        getElement("customerName")?.value.trim() ||
        "";

      const phone =
        profile?.phone ||
        getCurrentUser()?.phoneNumber ||
        "";

      if (!customerName || !phone) {
        showToast("Please complete your customer profile first.");
        showScreen("profile");
        return;
      }

      const total = cart.reduce(
        /**
         * @param {number} sum
         * @param {CartItem} item
         */
        function (sum, item) {
          return sum + item.price * item.quantity;
        },
        0
      );

      bookNowButton.disabled = true;

      const result = await placeOrder({
        customerName: customerName,
        phone: phone,
        deliveryAddress: address.trim(),
        items: cart,
        total: total
      });

      cart = [];
      saveCart();
      updateCartDisplay();

      showToast("Order placed: " + result.orderId);

      await loadMyOrders();
      showScreen("orders");

    } catch (error) {
      console.error("Order error:", error);
      showToast(error.message || "Unable to place order.");

    } finally {
      bookNowButton.disabled = false;
    }
  });
}


// =====================================
// CUSTOMER ORDERS
// =====================================

async function loadMyOrders() {
  const orderList = getElement("orderList");

  if (!orderList) return;

  try {
    const orders = await getMyOrders();

    orderList.replaceChildren();

    if (orders.length === 0) {
      orderList.textContent = "No orders yet.";
      return;
    }

    orders.forEach(
      /** @param {CustomerOrder} order */
      function (order) {
        const card = document.createElement("div");
        card.className = "order-card";

        const orderId = document.createElement("p");
        orderId.textContent = "Order ID: " + order.id;

        const total = document.createElement("p");
        total.textContent = "Total: " + formatPrice(order.total);

        const status = document.createElement("p");
        status.textContent = "Status: " + order.status;

        card.append(orderId, total, status);
        orderList.appendChild(card);
      }
    );

  } catch (error) {
    console.error("Orders error:", error);
    orderList.textContent = "Unable to load orders.";
  }
}


// =====================================
// CUSTOMER PROFILE
// =====================================

async function loadProfile() {
  const profileInfo = getElement("profileInfo");

  if (!profileInfo) return;

  try {
    const user = getCurrentUser();

    if (!user) {
      profileInfo.textContent = "Please login first.";
      return;
    }

    const profile = await getCustomerProfile();

    profileInfo.replaceChildren();

    const name = document.createElement("p");
    name.textContent = "Name: " + (profile?.name || "Not added");

    const phone = document.createElement("p");
    phone.textContent =
      "Phone: " + (profile?.phone || user.phoneNumber || "Not available");

    profileInfo.append(name, phone);

  } catch (error) {
    console.error("Profile error:", error);
    profileInfo.textContent = error.message;
  }
}


// =====================================
// ADMIN PANEL AND PASSWORD LOGIN
// =====================================

function openAdminPanel() {
  showScreen("admin");

  if (!adminInitialized) {
    initAdminPanel();
    adminInitialized = true;
  }

  loadAdminProducts();
}


// Open Admin Password Screen
const developerButton = getElement("developerBtn");

if (developerButton) {
  developerButton.addEventListener("click", function () {
    if (!getCurrentUser()) {
      showToast("Please login first.");
      showScreen("login");
      return;
    }

    const passwordInput = getElement("adminPassword");
    const message = getElement("adminLoginMessage");

    if (passwordInput) {
      passwordInput.value = "";
    }

    if (message) {
      message.textContent = "";
    }

    showScreen("adminLogin");
  });
}


// Verify Admin Password
const adminLoginButton = getElement("adminLoginBtn");

if (adminLoginButton) {
  adminLoginButton.addEventListener("click", function () {
    const passwordInput = getElement("adminPassword");
    const message = getElement("adminLoginMessage");

    if (!passwordInput) {
      showToast("Password field not found.");
      return;
    }

    const enteredPassword = passwordInput.value;

    if (!enteredPassword) {
      if (message) {
        message.textContent = "Please enter admin password.";
      }

      return;
    }

    if (enteredPassword === ADMIN_PASSWORD) {
      if (message) {
        message.textContent = "Password verified.";
      }

      passwordInput.value = "";
      showToast("Admin access granted.");

      openAdminPanel();

    } else {
      if (message) {
        message.textContent = "Incorrect admin password.";
      }

      passwordInput.value = "";
      showToast("Incorrect admin password.");
    }
  });
}


// Allow Enter key to submit password
const adminPasswordInput = getElement("adminPassword");

if (adminPasswordInput) {
  adminPasswordInput.addEventListener(
    "keydown",
    /**
     * @param {KeyboardEvent} event
     */
    function (event) {
      if (event.key === "Enter" && adminLoginButton) {
        adminLoginButton.click();
      }
    }
  );
}


// =====================================
// NAVIGATION BUTTONS
// =====================================

document.querySelectorAll("[data-screen]").forEach(
  /** @param {HTMLElement} button */
  function (button) {
    button.addEventListener("click", async function () {
      const screen = button.dataset.screen;

      if (!screen) return;

      if (screen === "orders") {
        await loadMyOrders();
      }

      if (screen === "profile") {
        await loadProfile();
      }

      if (screen === "admin") {
        if (developerButton) {
          developerButton.click();
        }
        return;
      }

      showScreen(screen);
    });
  }
);


document.querySelectorAll("[data-collection]").forEach(
  /** @param {HTMLElement} button */
  function (button) {
    button.addEventListener("click", function () {
      const filter = getElement("collectionFilter");

      if (filter) {
        filter.value = button.dataset.collection || "";
      }

      applyProductFilters();
      showScreen("shop");
    });
  }
);


[
  "collectionFilter",
  "departmentFilter",
  "sizeFilter"
].forEach(
  /** @param {string} id */
  function (id) {
    const element = getElement(id);

    if (element) {
      element.addEventListener("change", applyProductFilters);
    }
  }
);


// =====================================
// WELCOME AND SETTINGS
// =====================================

const continueButton = getElement("continueBtn");

if (continueButton) {
  continueButton.addEventListener("click", function () {
    if (getCurrentUser()) {
      showScreen("home");
    } else {
      showScreen("login");
    }
  });
}


const settingsButton = getElement("settingsBtn");
const settingsPanel = getElement("settingsPanel");
const closeSettings = getElement("closeSettings");

if (settingsButton && settingsPanel) {
  settingsButton.addEventListener("click", function () {
    settingsPanel.hidden = false;
  });
}

if (closeSettings && settingsPanel) {
  closeSettings.addEventListener("click", function () {
    settingsPanel.hidden = true;
  });
}


const themeButton = getElement("themeBtn");

if (themeButton) {
  themeButton.addEventListener("click", function () {
    document.body.classList.toggle("light-theme");
  });
}


// =====================================
// LOGOUT
// =====================================

const logoutButton = getElement("logoutBtn");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    try {
      await logout();

      previousScreens = [];
      showScreen("welcome", false);

      showToast("Logged out successfully.");

    } catch (error) {
      console.error("Logout error:", error);
      showToast("Unable to logout.");
    }
  });
}


// =====================================
// HELP BUTTON
// =====================================

const helpButton = getElement("helpBtn");

if (helpButton) {
  helpButton.addEventListener("click", function () {
    showToast("Please contact the R-MANS store for assistance.");
  });
}


// =====================================
// START APPLICATION
// =====================================

async function startApp() {
  initializeLanguage();
  updateBackButton();
  updateCartDisplay();

  if (getCurrentUser()) {
    showScreen("home", false);
    await loadProducts();
  } else {
    showScreen("welcome", false);
  }
}

startApp();
