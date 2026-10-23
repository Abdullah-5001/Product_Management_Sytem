import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { CreateProduct } from "../services/api";
import Loading from "./Loading";
import { ProductSchema } from "../Schema/ProductSchema";
import "./AddProducts.css";

interface AddProductsProps {
  onProductCreated?: () => void;
  onCancel?: () => void;
}

const AddProducts: React.FC<AddProductsProps> = ({
  onProductCreated,
  onCancel,
}) => {
  const [productData, setProductData] = useState({
    Title: "",
    Description: "",
    ImageFile: null as File | null,
    Quantity: 0,
    Price: 0,
    Status: "",
    ImageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProductData((prevData) => {
      return {
        ...prevData,
        [name]: name === "Quantity" || name === "Price" ? Number(value) : value,
      };
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProductData((prevData) => {
        return {
          ...prevData,
          ImageFile: e.target.files![0],
        };
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      const dataToValidate = {
        ...productData,
        ImageUrl: productData.ImageUrl || undefined,
      };
      const validateProduct = ProductSchema.parse(dataToValidate);
      const formData = new FormData();

      // Append keys matching the backend model properties.
      formData.append("Title", validateProduct.Title);
      formData.append("Description", validateProduct.Description);
      formData.append("Quantity", String(validateProduct.Quantity));
      formData.append("Price", String(validateProduct.Price));
      if (validateProduct.ImageUrl) {
        formData.append("ImageUrl", validateProduct.ImageUrl);
      }
      if (validateProduct.ImageFile) {
        formData.append("ImageFile", validateProduct.ImageFile);
      }
      console.log("Validated product data:", validateProduct);
      const response = await CreateProduct(formData);
      if (response instanceof Error) {
        throw response;
      }
      console.log("Product created successfully:", response);
      onProductCreated?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "Unable to add the product.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="add-product">
          <div className="add-product__header">
            <p className="add-product__eyebrow">Inventory</p>
            <h1>Add a product</h1>
            <p className="add-product__description">
              Add a new item to your catalog with the details customers need.
            </p>
          </div>

          <form className="add-product__form" onSubmit={handleSubmit}>
            {error && (
              <div className="add-product__error" role="alert">
                {error}
              </div>
            )}
            <div className="add-product__fields">
              <div className="form-field">
                <label htmlFor="title">Product title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Wireless headphones"
                  name="Title"
                  required
                  value={productData.Title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field form-field--wide">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Describe the product, its features, and condition"
                  name="Description"
                  required
                  value={productData.Description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-field">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  placeholder="e.g. 100"
                  required
                  name="Quantity"
                  min="0"
                  step="1"
                  value={productData.Quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  placeholder="e.g. 100.00"
                  name="Price"
                  min="0"
                  step="0.01"
                  required
                  value={productData.Price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field form-field--wide">
                <label htmlFor="image">Product image</label>
                <input
                  id="image"
                  className="file-input"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                />
                <span className="form-field__hint">
                  PNG, JPG, or WEBP. Choose a clear product image.
                </span>
              </div>
            </div>

            <div className="add-product__actions">
              {onCancel && (
                <button
                  className="add-product__cancel"
                  type="button"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              <button className="add-product__submit" type="submit">
                Add product
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
export default AddProducts;
