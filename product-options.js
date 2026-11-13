
/**
 * R-MANS Product Options
 */

export const PRODUCT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "Free Size"
];

export const PRODUCT_COLORS = [
  "Black",
  "White",
  "Blue",
  "Navy Blue",
  "Red",
  "Green",
  "Grey",
  "Brown",
  "Beige",
  "Pink",
  "Yellow",
  "Other"
];

export const PRODUCT_CATEGORIES = [
  "Men",
  "Women",
  "Kids",
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Trousers",
  "Traditional Wear",
  "Accessories"
];

export const PRODUCT_FILTERS = {
  SORT_OPTIONS: [
    {
      label: "Recommended",
      value: "recommended"
    },
    {
      label: "Price: Low to High",
      value: "price-low"
    },
    {
      label: "Price: High to Low",
      value: "price-high"
    },
    {
      label: "Newest First",
      value: "newest"
    }
  ],

  PRICE_RANGES: [
    {
      label: "Under ₹500",
      min: 0,
      max: 500
    },
    {
      label: "₹500 - ₹1,000",
      min: 500,
      max: 1000
    },
    {
      label: "₹1,000 - ₹2,000",
      min: 1000,
      max: 2000
    },
    {
      label: "Above ₹2,000",
      min: 2000,
      max: Infinity
    }
  ]
};

/**
 * Get available sizes.
 * @returns {string[]}
 */
export function getProductSizes() {
  return [...PRODUCT_SIZES];
}

/**
 * Get available colors.
 * @returns {string[]}
 */
export function getProductColors() {
  return [...PRODUCT_COLORS];
}

/**
 * Get available categories.
 * @returns {string[]}
 */
export function getProductCategories() {
  return [...PRODUCT_CATEGORIES];
}
