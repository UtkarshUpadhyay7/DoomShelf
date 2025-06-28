
import { Product, ExpiryStatus, DashboardStats } from '@/types/product';

export const calculateExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      daysUntilExpiry,
      color: 'text-red-600 bg-red-50'
    };
  } else if (daysUntilExpiry <= 7) {
    return {
      status: 'warning',
      daysUntilExpiry,
      color: 'text-yellow-600 bg-yellow-50'
    };
  } else {
    return {
      status: 'fresh',
      daysUntilExpiry,
      color: 'text-green-600 bg-green-50'
    };
  }
};

export const calculateDashboardStats = (products: Product[]): DashboardStats => {
  const stats = products.reduce(
    (acc, product) => {
      const expiryStatus = calculateExpiryStatus(product.expiry_date);
      const productValue = product.price * product.quantity;
      
      acc.totalValue += productValue;
      
      switch (expiryStatus.status) {
        case 'expired':
          acc.expiredProducts++;
          break;
        case 'warning':
          acc.warningProducts++;
          break;
        case 'fresh':
          acc.freshProducts++;
          break;
      }
      
      return acc;
    },
    {
      totalProducts: products.length,
      expiredProducts: 0,
      warningProducts: 0,
      freshProducts: 0,
      totalValue: 0
    }
  );
  
  return stats;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const generateProductId = (): string => {
  return 'prod_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// New utility functions for enhanced features
export const categorizeProductsByExpiry = (products: Product[]) => {
  const fresh: Product[] = [];
  const warning: Product[] = [];
  const expired: Product[] = [];

  products.forEach(product => {
    const status = calculateExpiryStatus(product.expiry_date);
    switch (status.status) {
      case 'fresh':
        fresh.push(product);
        break;
      case 'warning':
        warning.push(product);
        break;
      case 'expired':
        expired.push(product);
        break;
    }
  });

  return { fresh, warning, expired };
};

export const getProductsByCategory = (products: Product[]) => {
  return products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + (product.price * product.quantity), 0);
};

export const getLowStockProducts = (products: Product[], threshold: number = 5): Product[] => {
  return products.filter(product => product.quantity <= threshold);
};

export const exportToCSV = (products: Product[]): string => {
  const headers = [
    'Name',
    'Category',
    'Barcode',
    'Expiry Date',
    'Purchase Date',
    'Price',
    'Quantity',
    'Supplier',
    'Alert Days',
    'Status'
  ];

  const rows = products.map(product => {
    const status = calculateExpiryStatus(product.expiry_date);
    return [
      product.name,
      product.category,
      product.barcode || '',
      product.expiry_date,
      product.purchase_date,
      product.price.toString(),
      product.quantity.toString(),
      product.supplier || '',
      product.alert_days.toString(),
      status.status
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};

export const importFromCSV = (csvContent: string): Omit<Product, 'id' | 'created_at' | 'updated_at'>[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, ''));
    
    return {
      name: values[0] || '',
      category: values[1] || 'Others',
      barcode: values[2] || undefined,
      expiry_date: values[3] || new Date().toISOString().split('T')[0],
      purchase_date: values[4] || new Date().toISOString().split('T')[0],
      price: parseFloat(values[5]) || 0,
      quantity: parseInt(values[6]) || 1,
      supplier: values[7] || undefined,
      alert_days: parseInt(values[8]) || 7
    };
  }).filter(product => product.name); // Filter out empty rows
};
