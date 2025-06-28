
export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  expiry_date: string; // Changed from expiryDate to match database
  purchase_date: string; // Changed from purchaseDate to match database
  price: number;
  quantity: number;
  supplier?: string;
  alert_days: number; // Changed from alertDays to match database
  created_at: string; // Changed from createdAt to match database
  updated_at: string; // Changed from updatedAt to match database
}

export interface ExpiryStatus {
  status: 'fresh' | 'warning' | 'expired';
  daysUntilExpiry: number;
  color: string;
}

export interface DashboardStats {
  totalProducts: number;
  expiredProducts: number;
  warningProducts: number;
  freshProducts: number;
  totalValue: number;
}
