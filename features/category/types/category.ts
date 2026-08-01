export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  icon?: string | null;
  parentId?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
  }>;
  subCategoryProducts?: Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  icon?: string;
  parentId?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;