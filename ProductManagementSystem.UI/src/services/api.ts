import axios from "axios";
import type { Product } from "../Schema/ProductSchema";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

const CreateProduct = async (formData: FormData) => {
  try {
    const response = await api.post("/products", formData);
    return response.data;
  } catch (error) {
    return new Error(`Failed to create product ${error}`);
  }
};

const GetProducts = async () => {
  try {
    const response = await api.get("/products");
    return response;
  } catch (error) {
    return new Error(`Failed to get products ${error}`);
  }
};

const GetProductById = async (id: number): Promise<Product | Error> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    return new Error(`Failed to get product by id ${error}`);
  }
};

const UpdateProduct = async (id: number, formData: FormData) => {
  try {
    const response = await api.put(`/products/${id}`, formData);
    return response;
  } catch (error) {
    return new Error(`Failed to update product ${error}`);
  }
};

const DeleteProduct = async (id: number) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response;
  } catch (error) {
    return new Error(`Failed to delete product ${error}`);
  }
};

export {
  CreateProduct,
  GetProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
};
