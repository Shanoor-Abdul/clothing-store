"use client";

import { useState } from "react";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "@/features/products/hooks/useProducts";
import { Product } from "@/features/products/types/product";
import { ProductFormData } from "@/features/products/validation/product.schema";
import ProductForm from "@/features/products/components/ProductForm";
import { PRODUCT_DEFAULT_VALUES } from "@/features/products/constants/product";
import ProductTable from "@/features/products/components/ProductTable";
import DeleteProductModal from "@/features/products/components/DeleteProductModal";
import { useBrands } from "@/features/brand/hooks/useBrands";
// import { useCollections } from '@/features/collection/hooks/useCollections';

const ProductsPage = () => {
  const { data: products = [], isLoading } =
    useProducts();

  const { data: categories = [] } =
    useCategories();

  const { data: brands = [] } =
    useBrands();

  // const { data: collections = [] } =
  //   useCollections();

  const createMutation =
    useCreateProduct();

  const updateMutation =
    useUpdateProduct();

  const deleteMutation =
    useDeleteProduct();

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const handleSubmit = async (
    data: ProductFormData
  ) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data,
        });

        setEditingProduct(null);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      await deleteMutation.mutateAsync(
        deleteProduct.id
      );

      setDeleteProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Product Management
        </h1>

        <p className="mt-2 text-slate-500">
          Manage all products
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        defaultValues={
          editingProduct ??
          PRODUCT_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending ||
          updateMutation.isPending
        }
        categories={categories}
        brands={brands}
        // collections={collections}
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={setEditingProduct}
          onDelete={setDeleteProduct}
        />
      )}

      <DeleteProductModal
        open={!!deleteProduct}
        product={deleteProduct}
        loading={deleteMutation.isPending}
        onClose={() =>
          setDeleteProduct(null)
        }
        onConfirm={handleDelete}
      />

    </div>
  );
};

export default ProductsPage;