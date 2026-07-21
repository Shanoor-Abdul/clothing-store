"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBrands } from "@/features/brand/hooks/useBrands";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useColors } from "@/features/color/hooks/useColors";
import { useSizes } from "@/features/size/hooks/useSizes";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "@/features/products/hooks/useProducts";
import {
  createProductVariant,
  deleteProductImage,
  deleteProductVariant,
  updateProductVariant,
  uploadProductImage,
} from "@/features/products/api";
import ProductVariantForm from "@/features/products/components/ProductVariantForm";
import { Product, ProductVariant } from "@/features/products/types/product";
import { ProductFormData } from "@/features/products/validation/product.schema";
import ProductForm from "@/features/products/components/ProductForm";
import ProductImageUpload from "@/features/products/components/ProductImageUpload";
import {
  PRODUCT_DEFAULT_VALUES,
  PRODUCT_QUERY_KEY,
} from "@/features/products/constants/product";
import ProductTable from "@/features/products/components/ProductTable";
import DeleteProductModal from "@/features/products/components/DeleteProductModal";
import { mapProductToForm } from "@/features/products/mapper";
// import { useCollections } from '@/features/collection/hooks/useCollections';

const ProductsPage = () => {
  const { data: products = [], isLoading } =
    useProducts();

  const { data: categories = [] } =
    useCategories();

  const { data: brands = [] } =
    useBrands();

  const { data: colors = [] } =
    useColors();

  const { data: sizes = [] } =
    useSizes();

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
        const updatedProduct = await updateMutation.mutateAsync({
          id: editingProduct.id,
          data,
        });

        if (updatedProduct) {
          setEditingProduct((current) =>
            current
              ? {
                  ...current,
                  ...updatedProduct,
                  variants: current.variants,
                  images: current.images,
                }
              : current
          );
        }
      } else {
        const createdProduct = await createMutation.mutateAsync(data);
        if (createdProduct) {
          setEditingProduct(createdProduct);
        }
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

  const handleAddVariant = async () => {
    if (!editingProduct) return;

    const generatedSku = `${editingProduct.sku}-${Date.now().toString().slice(-4)}`;

    try {
      const createdVariant = await createProductVariant({
        productId: editingProduct.id,
        sku: generatedSku,
        stock: 0,
        isActive: true,
      });

      setEditingProduct((current) =>
        current
          ? {
              ...current,
              variants: [
                ...(current.variants ?? []),
                createdVariant,
              ],
            }
          : current
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to add variant", error);
    }
  };

  const handleUpdateVariant = async (
    index: number,
    field: keyof ProductVariant,
    value: string | number | boolean
  ) => {
    const variant = editingProduct?.variants?.[index];
    if (!variant?.id) return;

    const updatedVariant = {
      ...variant,
      [field]: value,
    } as ProductVariant;

    try {
      const response = await updateProductVariant({
        id: variant.id,
        colorId: updatedVariant.colorId ?? undefined,
        sizeId: updatedVariant.sizeId ?? undefined,
        sku: updatedVariant.sku,
        barcode: updatedVariant.barcode ?? undefined,
        stock: Number(updatedVariant.stock),
        price: updatedVariant.price ?? undefined,
        isActive: updatedVariant.isActive,
      });

      setEditingProduct((current) =>
        current
          ? {
              ...current,
              variants: current.variants?.map((item, i) =>
                i === index ? response : item
              ),
            }
          : current
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to update variant", error);
    }
  };

  const handleRemoveVariant = async (index: number) => {
    const variant = editingProduct?.variants?.[index];
    if (!variant?.id) return;

    try {
      await deleteProductVariant(variant.id);
      setEditingProduct((current) =>
        current
          ? {
              ...current,
              variants: current.variants?.filter(
                (_, i) => i !== index
              ),
            }
          : current
      );
      await queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    } catch (error) {
      console.error("Failed to delete variant", error);
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
        <>
          <ProductImageUpload
            images={productImages}
            onUpload={handleUploadImages}
            onDelete={handleDeleteImage}
            onFeatured={() => undefined}
          />

          <ProductVariantForm
            variants={editingProduct.variants ?? []}
            colors={colors}
            sizes={sizes}
            onAdd={handleAddVariant}
            onRemove={handleRemoveVariant}
            onChange={handleUpdateVariant}
          />
        </>
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