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

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const { images, variants, ...productData } = data;

      const processedImages = (images || []).map((img: any, index: number) => {
        if (img instanceof File) {
          return {
            imageUrl: URL.createObjectURL(img),
            altText: img.name,
            displayOrder: index,
          };
        }
        if (typeof img === "object" && img.imageUrl) {
          return {
            imageUrl: img.imageUrl,
            altText: img.altText,
            displayOrder: img.displayOrder || index,
          };
        }
        return {
          imageUrl: "",
          altText: "",
          displayOrder: index,
        };
      });

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
          createMutation.isPending || updateMutation.isPending
        }
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