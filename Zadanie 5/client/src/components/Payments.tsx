import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { sendPayment } from "../api";
import { useCart } from "../context/CartContext";

export const Payments = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await sendPayment({
        customerName,
        email,
        cardNumber,
        amount: totalPrice,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      clearCart();
      setCustomerName("");
      setEmail("");
      setCardNumber("");
      setMessage("Płatność została wysłana do serwera.");
    } catch {
      setMessage("Nie udało się wysłać płatności.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !message) {
    return (
      <section className="page-section">
        <div className="section-heading">
          <h1>Płatności</h1>
          <p>Najpierw dodaj produkty do koszyka.</p>
        </div>
        <Link className="button-link" to="/">
          Przejdź do produktów
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Płatności</h1>
        <p>Dane formularza są wysyłane do aplikacji serwerowej przez axios.</p>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <label>
          Imię i nazwisko
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Jan Kowalski"
          />
        </label>

        <label>
          E-mail
          <input
            required
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jan@example.com"
          />
        </label>

        <label>
          Numer karty
          <input
            required
            inputMode="numeric"
            minLength={12}
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="4242424242424242"
          />
        </label>

        <div className="payment-total">
          <span>Do zapłaty</span>
          <strong>{totalPrice.toFixed(2)} zł</strong>
        </div>

        <button disabled={isSubmitting || items.length === 0} type="submit">
          <CreditCard size={18} />
          {isSubmitting ? "Wysyłanie..." : "Zapłać"}
        </button>

        {message && <p className="status">{message}</p>}
      </form>
    </section>
  );
};
