import cors from "cors";
import express from "express";

const app = express();
const port = process.env.API_PORT || process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:8000";

app.use(
  cors({
    origin: clientOrigin,
    methods: ["GET", "POST"],
  }),
);
app.use(express.json());

const products = [
  {
    id: 1,
    name: "Klawiatura mechaniczna",
    description: "Cicha klawiatura TKL do pracy i gier.",
    price: 249.99,
  },
  {
    id: 2,
    name: "Mysz ergonomiczna",
    description: "Lekka mysz bezprzewodowa z regulowanym DPI.",
    price: 129.99,
  },
  {
    id: 3,
    name: "Monitor 27 cali",
    description: "Panel IPS QHD z odswiezaniem 144 Hz.",
    price: 1199,
  },
  {
    id: 4,
    name: "Stacja dokujaca USB-C",
    description: "HDMI, Ethernet, czytnik kart i ladowanie laptopa.",
    price: 349,
  },
];

const payments = [];

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/payments", (req, res) => {
  const { customerName, email, cardNumber, amount, items } = req.body;

  if (!customerName || !email || !cardNumber || !amount || !Array.isArray(items)) {
    return res.status(400).json({
      message: "Brakuje wymaganych danych platnosci.",
    });
  }

  const payment = {
    id: payments.length + 1,
    customerName,
    email,
    amount,
    items,
    status: "accepted",
    createdAt: new Date().toISOString(),
  };

  payments.push(payment);

  return res.status(201).json({
    message: "Platnosc zostala przyjeta.",
    payment,
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
