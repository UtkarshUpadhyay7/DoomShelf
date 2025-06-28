
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  TrendingDown,
  ShoppingCart,
  Calendar,
  BarChart3
} from 'lucide-react';
import { DashboardStats } from '@/types/product';
import { Product } from '@/types/product';
import { formatCurrency, formatDate } from '@/utils/productUtils';

interface DashboardProps {
  stats: DashboardStats;
  expiringProducts: Product[];
  expiredProducts: Product[];
  lowStockProducts: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  expiringProducts, 
  expiredProducts, 
  lowStockProducts 
}) => {
  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Fresh Items',
      value: stats.freshProducts,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Warning Items',
      value: stats.warningProducts,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Expired Items',
      value: stats.expiredProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Low Stock',
      value: lowStockProducts.length,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isAmount: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Badge variant="outline" className="text-primary border-primary">
          Live Database
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.isAmount ? card.value : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expired Products */}
        {expiredProducts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Expired Products ({expiredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiredProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-red-800">{product.name}</span>
                  <span className="text-red-600">{formatDate(product.expiry_date)}</span>
                </div>
              ))}
              {expiredProducts.length > 3 && (
                <p className="text-xs text-red-600">
                  +{expiredProducts.length - 3} more expired products
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon */}
        {expiringProducts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-700 flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Expiring Soon ({expiringProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiringProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-yellow-800">{product.name}</span>
                  <span className="text-yellow-600">{formatDate(product.expiry_date)}</span>
                </div>
              ))}
              {expiringProducts.length > 3 && (
                <p className="text-xs text-yellow-600">
                  +{expiringProducts.length - 3} more expiring products
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Low Stock */}
        {lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-700 flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5" />
                Low Stock ({lowStockProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-orange-800">{product.name}</span>
                  <span className="text-orange-600">{product.quantity} left</span>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <p className="text-xs text-orange-600">
                  +{lowStockProducts.length - 3} more low stock products
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {((stats.freshProducts / stats.totalProducts) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Fresh Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalValue / stats.totalProducts || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg. Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
