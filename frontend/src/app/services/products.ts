import { Product } from "../data/products";
import { apiFetch } from "./api";

/** Fetch all products from the backend */
export const fetchProducts = (): Promise<Product[]> =>
  apiFetch<Product[]>("/products");
