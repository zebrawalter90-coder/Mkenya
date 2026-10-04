import { useQuery } from "@tanstack/react-query";

export interface FlashSaleProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: string;
  ownerId: string;
  ownerName: string;
}

export interface FlashSale {
  id: string;
  productId: string;
  salePrice: number;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  product: FlashSaleProduct;
}

export interface FlashSaleInput {
  productId: string;
  salePrice: number;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
  createdBy: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : `Request failed (${response.status})`);
  }
  return body as T;
}

export function useActiveFlashSales() {
  return useQuery({
    queryKey: ["flash-sales", "active"],
    queryFn: () => request<FlashSale[]>("/api/flash-sales/active"),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAdminFlashSales() {
  return useQuery({
    queryKey: ["flash-sales", "admin"],
    queryFn: () => request<FlashSale[]>("/api/flash-sales/admin"),
  });
}

export async function createFlashSale(input: FlashSaleInput) {
  return request<FlashSale>("/api/flash-sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateFlashSale(id: string, input: FlashSaleInput) {
  return request<FlashSale>(`/api/flash-sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteFlashSale(id: string) {
  return request<void>(`/api/flash-sales/${id}`, { method: "DELETE" });
}