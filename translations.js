
/**
 * R-MANS English Text Library
 */

export const translations = {
  en: {
    appName: "R-MANS",
    tagline: "Style That Defines You",

    home: "Home",
    shop: "Shop",
    cart: "Cart",
    orders: "My Orders",
    profile: "Profile",

    welcome: "Welcome to R-MANS",
    explore: "Explore Our Collection",
    featured: "Featured Products",
    newArrivals: "New Arrivals",
    bestSellers: "Best Sellers",

    search: "Search products...",
    categories: "Categories",
    allProducts: "All Products",
    viewAll: "View All",

    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    remove: "Remove",
    quantity: "Quantity",
    size: "Size",
    color: "Color",
    price: "Price",

    myCart: "My Shopping Cart",
    emptyCart: "Your cart is empty.",
    subtotal: "Subtotal",
    delivery: "Delivery Charges",
    total: "Total Amount",
    checkout: "Proceed to Checkout",

    login: "Login",
    logout: "Logout",
    enterName: "Enter your name",
    enterPhone: "Enter mobile number",
    enterOTP: "Enter 6-digit OTP",
    sendOTP: "Send OTP",
    verifyOTP: "Verify OTP",

    deliveryAddress: "Delivery Address",
    placeOrder: "Place Order",
    paymentMethod: "Payment Method",
    cashOnDelivery: "Cash on Delivery",
    upiPayment: "UPI Payment",

    orderPlaced: "Your order has been placed.",
    orderPending: "Pending",
    orderConfirmed: "Confirmed",
    orderProcessing: "Processing",
    orderShipped: "Shipped",
    orderDelivered: "Delivered",
    orderCancelled: "Cancelled",

    adminPanel: "Admin Panel",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    uploadImage: "Upload Product Image",
    saveProduct: "Save Product",

    settings: "Settings",
    changeTheme: "Change Theme",

    loading: "Loading...",
    noProducts: "No products available.",
    error: "Something went wrong.",
    tryAgain: "Please try again."
  }
};

/**
 * Get translated text.
 * @param {string} key
 * @param {string} language
 * @returns {string}
 */
export function translate(key, language = "en") {
  const selectedLanguage = translations[language] || translations.en;
  return selectedLanguage[key] || translations.en[key] || key;
}

/**
 * Get all available translations.
 * @returns {object}
 */
export function getTranslations() {
  return translations;
}
