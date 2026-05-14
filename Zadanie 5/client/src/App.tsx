import { NavLink, Route, Routes } from "react-router-dom";
import { ShoppingBag, ShoppingCart, CreditCard } from "lucide-react";
import { Cart } from "./components/Cart";
import { Payments } from "./components/Payments";
import { Products } from "./components/Products";
import { useCart } from "./context/CartContext";

export const App = () => {
  const { totalItems } = useCart();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <ShoppingBag size={24} />
          <span>Sklep elektroniczny</span>
        </div>

        <nav>
          <NavLink to="/" end>
            Produkty
          </NavLink>
          <NavLink to="/cart">
            Koszyk <span className="badge">{totalItems}</span>
          </NavLink>
          <NavLink to="/payments">Płatności</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </main>

      <footer>
        <span>
          <ShoppingCart size={16} /> React hooks, routing, axios, CORS i Docker Compose.
        </span>
        <span>
          <CreditCard size={16} /> Widok płatności wysyła dane do backendu.
        </span>
      </footer>
    </div>
  );
};
