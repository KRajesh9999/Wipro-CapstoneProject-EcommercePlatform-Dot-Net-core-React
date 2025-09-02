# E-Commerce Platform API Documentation

## Base URL
```
https://localhost:7000/api
```

## Authentication
All protected endpoints require JWT Bearer token in header:
```
Authorization: Bearer <your-jwt-token>
```

---

##  Authentication Endpoints

### POST /api/Auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

### POST /api/Auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

##  Product Endpoints

### GET /api/Product
Get all products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in name/description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "price": 99.99,
    "category": "Electronics",
    "stock": 50,
    "imageUrl": "https://example.com/headphones.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/Product/{id}
Get product by ID.

**Response (200):**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/headphones.jpg",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### POST /api/Product (Admin Only)
Create a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "category": "Category Name",
  "stock": 100,
  "imageUrl": "https://example.com/product.jpg"
}
```

### PUT /api/Product/{id} (Admin Only)
Update existing product.

### DELETE /api/Product/{id} (Admin Only)
Delete a product.

---

## Cart Endpoints

### GET /api/Cart
Get current user's cart items.

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Wireless Headphones",
      "price": 99.99,
      "quantity": 2,
      "subtotal": 199.98
    }
  ],
  "totalAmount": 199.98
}
```

### POST /api/Cart
Add item to cart.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### PUT /api/Cart/{itemId}
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/Cart/{itemId}
Remove item from cart.

### DELETE /api/Cart/clear
Clear entire cart.

---

## Order Endpoints

### GET /api/Order
Get current user's orders.

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "totalAmount": 199.98,
    "status": "Processing",
    "shippingAddress": "123 Main St, City, State 12345",
    "createdAt": "2024-01-15T14:30:00Z",
    "orderItems": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "price": 99.99
      }
    ]
  }
]
```

### GET /api/Order/{id}
Get specific order details.

### POST /api/Order
Create new order.

**Request Body:**
```json
{
  "shippingAddress": "123 Main St, City, State 12345",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

### PUT /api/Order/{id}/cancel
Cancel an order (only Pending/Processing orders).

### GET /api/Order/admin/all (Admin Only)
Get all orders for admin panel.

### PUT /api/Order/{id}/status (Admin Only)
Update order status.

**Request Body:**
```json
{
  "status": "Shipped"
}
```

---

## Payment Endpoints

### POST /api/Payment/process
Process payment for an order.

**Request Body:**
```json
{
  "orderId": 1,
  "paymentMethod": "CreditCard",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardName": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "transactionId": "txn_1234567890",
  "message": "Payment processed successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Status Codes

| Code | Description  |
|------|------------- |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  |IServer Error |

---

## Order Status Values

| Status     | Description    |
|------------|-------------   |
| Pending    | Order created  |
| Processing | Order prepared |
| Shipped    | Order dispatched |
| Delivered  | Order delivered  |
| Cancelled  | Order cancelled  |
| Return Requested | Customer requested|

---

##  Testing with Postman

1. Import the API collection
2. Set environment variables:
   - `baseUrl`: https://localhost:7000/api
   - `token`: Your JWT token after login
3. Run authentication endpoints first
4. Use the token for protected endpoints

---