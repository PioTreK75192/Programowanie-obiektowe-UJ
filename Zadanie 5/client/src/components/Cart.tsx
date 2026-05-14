import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Cart = () => {
  const { items, addItem, removeItem, clearCart, totalPrice } = useCart();

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Koszyk</h1>
        <p>Stan koszyka jest współdzielony między widokami przez React Context.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Koszyk jest pusty.</p>
          <Link className="button-link" to="/">
            Wróć do produktów
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.price.toFixed(2)} zł za sztukę</p>
                </div>
                <div className="quantity-controls">
                  <button
                    type="button"
                    aria-label={`Usuń jedną sztukę: ${item.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Dodaj jedną sztukę: ${item.name}`}
                    onClick={() => addItem(item)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <strong>{(item.price * item.quantity).toFixed(2)} zł</strong>
              </article>
            ))}
          </div>

          <div className="summary-bar">
            <button className="secondary" type="button" onClick={clearCart}>
              <Trash2 size={18} />
              Wyczyść
            </button>
            <div>
              <span>Razem</span>
              <strong>{totalPrice.toFixed(2)} zł</strong>
            </div>
            <Link className="button-link" to="/payments">
              Przejdź do płatności
            </Link>
          </div>
        </>
      )}
    </section>
  );
};
