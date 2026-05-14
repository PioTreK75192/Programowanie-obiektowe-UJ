import axios from "axios";
import type { PaymentPayload, Product } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const getProducts = async () => {
  const response = await api.get<Product[]>("/products");
  return response.data;
};

export const sendPayment = async (payload: PaymentPayload) => {
  const response = await api.post("/payments", payload);
  return response.data;
};
