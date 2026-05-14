import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch(() => {
        setError("Nie udało się pobrać produktów z serwera.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p className="status">Ładowanie produktów...</p>;
  }

  if (error) {
    return <p className="status status-error">{error}</p>;
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Produkty</h1>
        <p>Lista jest pobierana z aplikacji serwerowej.</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>
            <div className="product-card-footer">
              <strong>{product.price.toFixed(2)} zł</strong>
              <button type="button" onClick={() => addItem(product)}>
                <ShoppingCart size={18} />
                Dodaj
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
