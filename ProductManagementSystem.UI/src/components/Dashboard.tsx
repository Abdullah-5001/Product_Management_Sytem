import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { DeleteProduct, GetProducts, UpdateProduct } from "../services/api";
import { ProductSchema, type Product } from "../Schema/ProductSchema";
import AddProducts from "./AddProducts";
import Loading from "./Loading";
import "./Dashboard.css";

type ProductForm = {
  Title: string;
  Description: string;
  Quantity: number;
  Price: number;
  ImageUrl?: string;
};

const emptyForm: ProductForm = {
  Title: "",
  Description: "",
  Quantity: 0,
  Price: 0,
  ImageUrl: "",
};

const resolveImageUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const apiOrigin = apiUrl ? new URL(apiUrl).origin : window.location.origin;
    return new URL(value, apiOrigin).toString();
  } catch {
    return value;
  }
};

const normalizeProduct = (value: unknown): Product | null => {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const read = (name: string) =>
    item[name] ??
    item[`${name.slice(0, 1).toLowerCase()}${name.slice(1)}`] ??
    item[name.toLowerCase()];
  const title = read("Title");
  const description = read("Description");
  const quantity = Number(read("Quantity") ?? 0);
  const price = Number(read("Price") ?? 0);
  const id = Number(read("Id"));

  if (typeof title !== "string" || !title.trim()) return null;

  return {
    Id: Number.isInteger(id) ? id : undefined,
    Title: title,
    Description:
      typeof description === "string" && description.trim()
        ? description
        : "No description provided",
    Quantity: Number.isInteger(quantity) && quantity >= 0 ? quantity : 0,
    Price: Number.isFinite(price) && price >= 0 ? price : 0,
    ImageUrl: resolveImageUrl(
      item.ImageUrl ??
        item.imageUrl ??
        item.ImageURL ??
        item.imageURL ??
        item.image_url ??
        item.ImagePath ??
        item.imagePath ??
        item.Url ??
        item.url,
    ),
    ImageFile: null,
  };
};

const getProductList = (data: unknown): Product[] => {
  if (Array.isArray(data)) {
    return data
      .map(normalizeProduct)
      .filter((product): product is Product => product !== null);
  }

  if (data && typeof data === "object") {
    const response = data as Record<string, unknown>;
    const nested = response.products ?? response.Products ?? response.$values;
    return getProductList(nested);
  }

  return [];
};

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const response = await GetProducts();

    if (response instanceof Error) {
      setError(response.message);
    } else {
      setProducts(getProductList(response.data));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(request);
  }, [loadProducts]);

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      Title: product.Title,
      Description: product.Description,
      Quantity: product.Quantity,
      Price: product.Price,
      ImageUrl: product.ImageUrl ?? "",
    });
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "Quantity" || name === "Price" ? Number(value) : value,
    }));
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProduct?.Id) return;

    setIsSaving(true);
    setIsLoading(true);
    setError("");
    try {
      const product = ProductSchema.parse({
        ...formData,
        Id: editingProduct.Id,
        ImageUrl: formData.ImageUrl || undefined,
        ImageFile: editingProduct.ImageFile ?? null,
      });
      const updateData = new FormData();
      updateData.append("Title", product.Title);
      updateData.append("Description", product.Description);
      updateData.append("Quantity", String(product.Quantity));
      updateData.append("Price", String(product.Price));
      if (product.ImageUrl) updateData.append("ImageUrl", product.ImageUrl);
      if (product.ImageFile) updateData.append("ImageFile", product.ImageFile);
      const response = await UpdateProduct(editingProduct.Id, updateData);
      if (response instanceof Error) throw response;
      setEditingProduct(null);
      await loadProducts();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update product.",
      );
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!product.Id || !window.confirm(`Delete "${product.Title}"?`)) return;

    setDeletingId(product.Id);
    setIsLoading(true);
    setError("");
    try {
      const response = await DeleteProduct(product.Id);
      if (response instanceof Error) {
        setError(response.message);
      } else {
        setProducts((current) =>
          current.filter((item) => item.Id !== product.Id),
        );
      }
    } finally {
      setIsLoading(false);
      setDeletingId(null);
    }
  };

  const handleProductCreated = async () => {
    setIsAddModalOpen(false);
    await loadProducts();
  };

  return (
    <section className="dashboard">
      {isLoading && <Loading />}
      <div className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Catalog overview</p>
          <h1>Product dashboard</h1>
          <p className="dashboard__description">
            Manage your inventory, pricing, and product information in one
            place.
          </p>
        </div>
        <div className="dashboard__header-actions">
          <div className="dashboard__count">
            <strong>{products.length}</strong>
            <span>{products.length === 1 ? "product" : "products"}</span>
          </div>
          <button
            className="dashboard__add-button"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span aria-hidden="true">+</span>
            Add product
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard__alert" role="alert">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="dashboard__state">
          <strong>No products yet</strong>
          <span>Add your first product to see it here.</span>
        </div>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="product-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.Id ?? `${product.Title}-${index}`}>
                  <td>
                    <div className="product-cell">
                      {product.ImageUrl ? (
                        <img
                          src={product.ImageUrl}
                          alt={`${product.Title} product`}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span
                          className="product-cell__placeholder"
                          aria-hidden="true"
                        >
                          {product.Title.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <strong>{product.Title}</strong>
                        <span>{product.Description}</span>
                        {product.ImageUrl && (
                          <a
                            className="product-cell__image-url"
                            href={product.ImageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {product.ImageUrl}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="product-table__price">
                    ${product.Price.toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${product.Quantity === 0 ? "stock-badge--empty" : ""}`}
                    >
                      {product.Quantity} in stock
                    </span>
                  </td>
                  <td className="product-table__actions">
                    <button
                      className="table-action table-action--edit"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-action table-action--delete"
                      disabled={deletingId === product.Id}
                      onClick={() => void handleDelete(product)}
                    >
                      {deletingId === product.Id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingProduct(null);
          }}
        >
          <form className="edit-modal" onSubmit={handleUpdate}>
            <div className="edit-modal__header">
              <div>
                <p className="dashboard__eyebrow">Product details</p>
                <h2>Edit product</h2>
              </div>
              <button
                type="button"
                className="edit-modal__close"
                onClick={() => setEditingProduct(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="edit-modal__fields">
              <label>
                Title
                <input
                  name="Title"
                  value={formData.Title}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Price
                <input
                  name="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.Price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Quantity
                <input
                  name="Quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.Quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Image URL
                <input
                  name="ImageUrl"
                  type="url"
                  value={formData.ImageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>
              <label className="edit-modal__wide">
                Description
                <textarea
                  name="Description"
                  rows={4}
                  value={formData.Description}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            <div className="edit-modal__actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="add-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsAddModalOpen(false);
            }
          }}
        >
          <div className="add-modal">
            <button
              className="add-modal__close"
              type="button"
              aria-label="Close add product form"
              onClick={() => setIsAddModalOpen(false)}
            >
              ×
            </button>
            <AddProducts
              onProductCreated={() => void handleProductCreated()}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
