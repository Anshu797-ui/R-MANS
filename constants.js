
/* =====================================
   R-MANS STORE CONSTANTS
   ===================================== */

// Store Information
export const STORE = Object.freeze({
  name: "R-MANS",
  location: "Hochar Overbridge, Ranchi, Jharkhand",
  currency: "INR",
  currencySymbol: "₹"
});

// Product Collections
export const COLLECTIONS = Object.freeze([
  {
    id: "wedding",
    name: "Wedding Special"
  },
  {
    id: "festival",
    name: "Festival Special"
  },
  {
    id: "normal",
    name: "Normal Wear"
  }
]);

// Departments
export const DEPARTMENTS = Object.freeze([
  {
    id: "women",
    name: "Women"
  },
  {
    id: "men",
    name: "Men"
  },
  {
    id: "teen-boys",
    name: "Teen Boys"
  },
  {
    id: "teen-girls",
    name: "Teen Girls"
  },
  {
    id: "kids-boys",
    name: "Kids Boys"
  },
  {
    id: "kids-girls",
    name: "Kids Girls"
  }
]);

// Available Sizes
export const SIZES = Object.freeze([
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size"
]);

// Order Status
export const ORDER_STATUS = Object.freeze([
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
]);

// Supported Languages
export const LANGUAGES = Object.freeze([
  {
    code: "en",
    name: "English"
  },
  {
    code: "hi",
    name: "हिन्दी"
  }
]);

// Bottom Navigation
export const NAVIGATION = Object.freeze([
  {
    id: "home",
    label: "Home",
    icon: "house"
  },
  {
    id: "shop",
    label: "Shop",
    icon: "shopping-bag"
  },
  {
    id: "cart",
    label: "Cart",
    icon: "shopping-cart"
  },
  {
    id: "orders",
    label: "Orders",
    icon: "package"
  },
  {
    id: "profile",
    label: "Profile",
    icon: "user-round"
  }
]);
