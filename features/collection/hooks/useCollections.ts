"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCollection,
  deleteCollection,
  getCollections,
  getCollectionById,
  updateCollection,
} from "../api";

import { COLLECTION_QUERY_KEY } from "../constants/collection";

import {
  Collection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "../types/collection";

export const useCollections = () =>
  useQuery<Collection[]>({
    queryKey: COLLECTION_QUERY_KEY,
    queryFn: getCollections,
  });

export const useCollection = (id: string) =>
  useQuery<Collection>({
    queryKey: [...COLLECTION_QUERY_KEY, id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) =>
      createCollection(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEY,
      }),
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCollectionPayload;
    }) => updateCollection(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEY,
      }),
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEY,
      }),
  });
};
