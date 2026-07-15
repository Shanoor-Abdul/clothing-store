export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandPayload {
  name: string;
  slug: string;

  logo?: string;
  description?: string;

  isActive?: boolean;
}

export type UpdateBrandPayload =
  Partial<CreateBrandPayload>;