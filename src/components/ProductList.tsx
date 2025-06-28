
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Package2, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Trash2,
  Filter,
  Loader2
} from 'lucide-react';
import { Product } from '@/types/product';
import { calculateExpiryStatus, formatCurrency, formatDate } from '@/utils/productUtils';

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onEditProduct, 
  onDeleteProduct,
  isLoading = false,
  isDeleting = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('expiry_date');

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.includes(searchTerm)) ||
                           (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterStatus === 'all') return matchesSearch;
      
      const expiryStatus = calculateExpiryStatus(product.expiry_date);
      return matchesSearch && expiryStatus.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'expiry_date':
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'price':
          return b.price - a.price;
        case 'quantity':
          return a.quantity - b.quantity;
        default:
          return 0;
      }
    });

  const getStatusBadge = (product: Product) => {
    const expiryStatus = calculateExpiryStatus(product.expiry_date);
    
    const badgeProps = {
      fresh: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      warning: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      expired: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const statusText = {
      fresh: `Fresh (${expiryStatus.daysUntilExpiry} days)`,
      warning: `Expires in ${expiryStatus.daysUntilExpiry} days`,
      expired: `Expired ${Math.abs(expiryStatus.daysUntilExpiry)} days ago`
    };

    return (
      <Badge 
        variant={badgeProps[expiryStatus.status].variant}
        className={badgeProps[expiryStatus.status].className}
      >
        {statusText[expiryStatus.status]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
        <Badge variant="outline" className="text-primary border-primary">
          {filteredProducts.length} items
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, categories, barcodes, or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="fresh">Fresh</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry_date">Expiry Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding your first product to the inventory.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProduct(product)}
                      disabled={isDeleting}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getStatusBadge(product)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {formatDate(product.expiry_date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(product.price)} × {product.quantity}</span>
                </div>
                
                {product.quantity <= 5 && (
                  <div className="bg-orange-50 text-orange-800 text-xs px-2 py-1 rounded">
                    Low Stock: {product.quantity} remaining
                  </div>
                )}
                
                {product.barcode && (
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    {product.barcode}
                  </div>
                )}
                
                {product.supplier && (
                  <div className="text-xs text-gray-600">
                    Supplier: {product.supplier}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
