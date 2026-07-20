export interface Size {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSizePayload {
  name: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateSizePayload = Partial<CreateSizePayload>;
