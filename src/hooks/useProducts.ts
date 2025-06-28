
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { ProductService } from '@/services/productService';
import { toast } from '@/hooks/use-toast';

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Query to get all products
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query to get expiring products
  const { data: expiringProducts = [] } = useQuery({
    queryKey: ['products', 'expiring'],
    queryFn: ProductService.getExpiringProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Query to get expired products
  const { data: expiredProducts = [] } = useQuery({
    queryKey: ['products', 'expired'],
    queryFn: ProductService.getExpiredProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Query to get low stock products
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: ProductService.getLowStockProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to create product
  const createProductMutation = useMutation({
    mutationFn: ProductService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Added",
        description: "Product has been successfully added to inventory.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating product:', error);
    },
  });

  // Mutation to update product
  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      ProductService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating product:', error);
    },
  });

  // Mutation to delete product
  const deleteProductMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Deleted",
        description: "Product has been removed from inventory.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting product:', error);
    },
  });

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [] } = useQuery({
    queryKey: ['products', 'search', searchQuery],
    queryFn: () => ProductService.searchProducts(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    // Data
    products,
    expiringProducts,
    expiredProducts,
    lowStockProducts,
    searchResults,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Utility
    refetch,
  };
};
