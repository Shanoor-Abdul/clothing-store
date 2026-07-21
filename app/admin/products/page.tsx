"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "@/features/products/hooks/useProducts";
import { Product } from "@/features/products/types/product";
import { uploadProductImage, deleteProductImage } from "@/features/products/api";
import { ProductFormData } from "@/features/products/validation/product.schema";
import ProductForm from "@/features/products/components/ProductForm";
import ProductImageUpload from "@/features/products/components/ProductImageUpload";
import {
  PRODUCT_DEFAULT_VALUES,
  PRODUCT_QUERY_KEY,
} from "@/features/products/constants/product";
import ProductTable from "@/features/products/components/ProductTable";
import DeleteProductModal from "@/features/products/components/DeleteProductModal";
import { useBrands } from "@/features/brand/hooks/useBrands";
import { mapProductToForm } from "@/features/products/mapper";
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

  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProduct();

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

  const productImages = editingProduct?.images ?? [];

  const handleUploadImages = async (
    files: FileList
  ) => {
    if (!editingProduct) return;

    try {
      const uploadedImages = await Promise.all(
        Array.from(files).map((file) =>
          uploadProductImage(editingProduct.id, file)
        )
      );

      setEditingProduct((current) =>
        current
          ? {
              ...current,
              images: [
                ...(current.images ?? []),
                ...uploadedImages,
              ],
            }
          : current
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to upload product images", error);
    }
  };

  const handleDeleteImage = async (index: number) => {
    const image = productImages[index];
    if (!image?.id) return;

    try {
      await deleteProductImage(image.id);
      setEditingProduct((current) =>
        current
          ? {
              ...current,
              images: current.images?.filter(
                (_, i) => i !== index
              ),
            }
          : current
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to delete product image", error);
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
          editingProduct
            ? mapProductToForm(editingProduct)
            : PRODUCT_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending ||
          updateMutation.isPending
        }
        categories={categories}
        brands={brands}
        collections={[]}
      />

      {editingProduct && (
        <ProductImageUpload
          images={productImages}
          onUpload={handleUploadImages}
          onDelete={handleDeleteImage}
          onFeatured={() => undefined}
        />
      )}

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