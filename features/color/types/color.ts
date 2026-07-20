export interface Color {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColorPayload {
  name: string;
  hexCode: string;
  isActive?: boolean;
}

export type UpdateColorPayload = Partial<CreateColorPayload>;
