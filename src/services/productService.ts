
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export class ProductService {
  // Create a new product
  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      return null;
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return [];
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return [];
    }
  }

  // Get products expiring soon (within alert days)
  static async getExpiringProducts(): Promise<Product[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gte('expiry_date', today)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching expiring products:', error);
        throw error;
      }

      // Filter products that are within their alert days
      const expiringProducts = (data || []).filter(product => {
        const expiryDate = new Date(product.expiry_date);
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + product.alert_days);
        return expiryDate <= alertDate;
      });

      return expiringProducts;
    } catch (error) {
      console.error('Error in getExpiringProducts:', error);
      return [];
    }
  }

  // Get expired products
  static async getExpiredProducts(): Promise<Product[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('expiry_date', today)
        .order('expiry_date', { ascending: false });

      if (error) {
        console.error('Error fetching expired products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExpiredProducts:', error);
      return [];
    }
  }

  // Update a product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return null;
    }
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  }

  // Search products by name, barcode, or supplier
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,barcode.ilike.%${query}%,supplier.ilike.%${query}%`)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return [];
    }
  }

  // Get product by barcode
  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching product by barcode:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getProductByBarcode:', error);
      return null;
    }
  }

  // Bulk operations
  static async bulkCreateProducts(products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (error) {
        console.error('Error bulk creating products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in bulkCreateProducts:', error);
      return [];
    }
  }

  // Get low stock products (quantity <= 5)
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('quantity', 5)
        .order('quantity', { ascending: true });

      if (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLowStockProducts:', error);
      return [];
    }
  }
}
