export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type PaymentPayload = {
  customerName: string;
  email: string;
  cardNumber: string;
  amount: number;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
};
