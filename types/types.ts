export interface ProductInfo {
  name: string;
  price: number;
  detailLink?: any;  // Locator for detail link
  addButton?: any;  // Locator for add to cart button
}

export interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export interface Thresholds {
  low_price: number;
  low_price_qty: number;
  high_price: number;
  default_qty: number;
}

export interface FixturesType {
  products: string[];
  thresholds: Thresholds;
}