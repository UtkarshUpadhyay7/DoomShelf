
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, BarChart3, Settings, Download, Upload, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { calculateDashboardStats, exportToCSV, importFromCSV } from '@/utils/productUtils';
import Dashboard from '@/components/Dashboard';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import Scanner from '@/components/Scanner';
import { toast } from '@/hooks/use-toast';
import { ProductService } from '@/services/productService';

const Index = () => {
  const {
    products,
    expiringProducts,
    expiredProducts,
    lowStockProducts,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting
  } = useProducts();

  const [showProductForm, setShowProductForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const dashboardStats = calculateDashboardStats(products);

  const handleSaveProduct = (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      updateProduct({ 
        id: editingProduct.id, 
        updates: product 
      });
    } else {
      createProduct(product);
    }
    setShowProductForm(false);
    setEditingProduct(undefined);
    setScannedBarcode('');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const handleScanComplete = async (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
    
    // Check if product with this barcode already exists
    const existingProduct = await ProductService.getProductByBarcode(barcode);
    if (existingProduct) {
      toast({
        title: "Product Found",
        description: `Found existing product: ${existingProduct.name}`,
      });
      setEditingProduct(existingProduct);
    }
    
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setScannedBarcode('');
    setShowProductForm(true);
  };

  const handleExportData = () => {
    try {
      const csvContent = exportToCSV(products);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Inventory data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const importedProducts = importFromCSV(csvContent);
        
        if (importedProducts.length > 0) {
          await ProductService.bulkCreateProducts(importedProducts);
          toast({
            title: "Import Complete",
            description: `Successfully imported ${importedProducts.length} products.`
          });
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Expiry Wise Shelf Guardian
              </h1>
              <p className="text-green-100 mt-1">
                Smart inventory management with database storage
              </p>
            </div>
            <div className="flex gap-2">
              {(expiredProducts.length > 0 || expiringProducts.length > 0) && (
                <Button
                  variant="outline"
                  className="bg-red-500 text-white border-red-600 hover:bg-red-600"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {expiredProducts.length + expiringProducts.length} Alerts
                </Button>
              )}
              <Button
                onClick={handleAddProduct}
                className="bg-white text-green-600 hover:bg-green-50"
                disabled={isCreating}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              stats={dashboardStats} 
              expiringProducts={expiringProducts}
              expiredProducts={expiredProducts}
              lowStockProducts={lowStockProducts}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <ProductList
              products={products}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              isLoading={isLoading}
              isDeleting={isDeleting}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings & Data Management</h3>
                <p className="text-gray-500 mb-6">
                  Export your data, import from CSV, or manage your inventory preferences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportData}
                      className="hidden"
                      id="csv-import"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('csv-import')?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </Button>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Database Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Real-time data synchronization</li>
                    <li>• Automatic backup and recovery</li>
                    <li>• Advanced search and filtering</li>
                    <li>• Bulk operations support</li>
                    <li>• Data export and import</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
            setScannedBarcode('');
          }}
          onOpenScanner={() => setShowScanner(true)}
          scannedBarcode={scannedBarcode}
          isLoading={isCreating || isUpdating}
        />
      )}

      {showScanner && (
        <Scanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Index;
