export interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionPayload {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateCollectionPayload =
  Partial<CreateCollectionPayload>;
