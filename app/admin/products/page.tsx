"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useBrands } from "@/features/brand/hooks/useBrands";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useColors } from "@/features/color/hooks/useColors";
import { useSizes } from "@/features/size/hooks/useSizes";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/features/products/hooks/useProducts";
import {
  createProductVariant,
  deleteProductImage,
  deleteProductVariant,
  updateProductVariant,
  uploadProductImage,
} from "@/features/products/api";
import { Product, ProductVariant } from "@/features/products/types/product";
import { ProductFormData } from "@/features/products/validation/product.schema";
import ProductForm from "@/features/products/components/ProductForm";
import {
  PRODUCT_DEFAULT_VALUES,
  PRODUCT_QUERY_KEY,
} from "@/features/products/constants/product";
import ProductTable from "@/features/products/components/ProductTable";
import DeleteProductModal from "@/features/products/components/DeleteProductModal";
import { mapProductToForm } from "@/features/products/mapper";

const ProductsPage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: colors = [] } = useColors();
  const { data: sizes = [] } = useSizes();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const { images, variants, ...productData } = data;

      let processedImages = images || [];

      const fileImages = images?.filter(
        (img: unknown) => img instanceof File
      ) as unknown as File[] || [];

      if (fileImages.length > 0) {
        setUploadingImages(true);
        const uploadedResults = await Promise.all(
          fileImages.map(async (file: File, index: number) => {
            const result = await uploadProductImage(
              editingProduct?.id || "temp",
              file
            );
            return {
              imageUrl: result.imageUrl,
              altText: result.altText || file.name,
              displayOrder: (images as any[]).findIndex(i => i === file) + index,
            };
          })
        );
        const existingImageUrls = (images as any[]).filter(
          (img: unknown) => !(img instanceof File)
        );
        processedImages = [...existingImageUrls, ...uploadedResults] as any;
        setUploadingImages(false);
      }

      const finalProductData = {
        ...productData,
        images: processedImages,
      };

      if (editingProduct) {
        const updatedProduct = await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: finalProductData,
        });

        if (updatedProduct) {
          toast.success("Product updated successfully");
        }
      } else {
        const createdProduct = await createMutation.mutateAsync(finalProductData);
        if (createdProduct) {
          toast.success("Product created successfully");
          setEditingProduct(null);
        }
      }

      await queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await deleteMutation.mutateAsync(deleteProduct.id);
      setDeleteProduct(null);
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="mt-2 text-slate-500">Manage all products</p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        defaultValues={
          editingProduct ? mapProductToForm(editingProduct) : PRODUCT_DEFAULT_VALUES
        }
        loading={
          createMutation.isPending || updateMutation.isPending || uploadingImages
        }
        uploading={uploadingImages}
        categories={categories}
        brands={brands}
        colors={colors}
        sizes={sizes}
        collections={[]}
        editingProduct={editingProduct}
        onCancel={() => setEditingProduct(null)}
      />

      {isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center">Loading...</div>
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
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProductsPage;