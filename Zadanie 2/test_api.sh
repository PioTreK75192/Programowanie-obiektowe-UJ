#!/bin/bash

BASE_URL="http://localhost:8000"

echo "=== TESTY API ==="

# --- Produkty ---
echo -e "\n--- PRODUKTY ---"
echo "POST /api/products"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" -H "Content-Type: application/json" -d '{"name":"Laptop","price":2999.99}')
echo "$RESPONSE"
PRODUCT_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

echo "GET /api/products"
curl -s "$BASE_URL/api/products"
echo ""

echo "DELETE /api/products/$PRODUCT_ID"
curl -s -X DELETE "$BASE_URL/api/products/$PRODUCT_ID"
echo ""

# --- Kategorie ---
echo -e "\n--- KATEGORIE ---"
echo "POST /api/categories"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/categories" -H "Content-Type: application/json" -d '{"name":"Elektronika"}')
echo "$RESPONSE"
CATEGORY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

echo "GET /api/categories"
curl -s "$BASE_URL/api/categories"
echo ""

echo "DELETE /api/categories/$CATEGORY_ID"
curl -s -X DELETE "$BASE_URL/api/categories/$CATEGORY_ID"
echo ""

# --- Klienci ---
echo -e "\n--- KLIENCI ---"
echo "POST /api/customers"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/customers" -H "Content-Type: application/json" -d '{"email":"jan@example.com"}')
echo "$RESPONSE"
CUSTOMER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

echo "GET /api/customers"
curl -s "$BASE_URL/api/customers"
echo ""

echo "DELETE /api/customers/$CUSTOMER_ID"
curl -s -X DELETE "$BASE_URL/api/customers/$CUSTOMER_ID"
echo ""

# --- Test usuwania nieistniejącego elementu ---
echo -e "\n--- TEST 404 ---"
echo "DELETE /api/products/99999 (nieistniejący)"
curl -s -X DELETE "$BASE_URL/api/products/99999"
echo ""

echo -e "\n=== TESTY ZAKONCZONE ==="