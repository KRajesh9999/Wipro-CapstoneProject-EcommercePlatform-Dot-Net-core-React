# E-Commerce Platform

A full-stack **E-Commerce application** powered by **ASP.NET Core (Backend)** and **React (Frontend)**.  
It supports **user authentication, product management, shopping cart, orders, and secure payments** — all wrapped in a modern UI.

---

## Features

### User Management
-  User registration & login
-  JWT-based authentication
-  Role-based access control (Admin / Customer)
-  Profile management

### Product Management
-  Product catalog with categories
-  Search & filtering
-  Product details with images
-  Admin CRUD operations
-  Stock tracking

###  Shopping Experience
-  Add/remove items from cart
-  Cart persistence across sessions
-  Real-time cart updates
-  Quantity management

### Order Management
-  Order creation & tracking
-  Order history
-  Status updates
-  Cancellations
-  Admin controls

###  Payments
-  Multiple methods supported
-  Secure transactions
-  Payment confirmation
-  Transaction history

###  Frontend UI
-  Responsive & mobile-friendly
-  Modern React components
-  Redux state management

---

##  Architecture Overview

---

###  Backend (ASP.NET Core 8)

```
E-CommercePlatform_Core
├── AuthenticationService/ # JWT Authentication
├── ProductService/ # Products API
├── CartService/ # Cart operations
├── OrderService/ # Order handling
├── PaymentService/ # Payment gateway
├── Common/ # Shared DTOs & contracts
├── Database/ # EF Core models & context
└── API/Controllers/ # REST endpoints

```
---

###  Frontend

```
E-CommercePlatform_React
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│ ├── favicon.ico
│ ├── index.html
|
└── src
├── components/ # Reusable UI elements
├── pages/ # Page-level components
├── redux/ # State slices
├── services/ # API integrations
└── utils/ # Helpers & utilities
├── App.css
├── App.js
├── App.test.js
├── index.css
├── index.js
├── serviceWorker.js
└── setupTests.js

```
---


---

## Tools

### Backend
-  **ASP.NET Core 8**
-  **SQL Server + EF Core**
-  **JWT Authentication**
-  **BCrypt Password Hashing**
-  **Swagger/OpenAPI Docs**

### Frontend
-  **React 18**
-  **Redux Toolkit**
-  **React Router v6**
-  **Axios HTTP Client**
-  **Bootstrap 5**

---

## Getting Started

###  Prerequisites
-  .NET 8 SDK  
-  Node.js 18+  
-  SQL Server (LocalDB or full)  
-  Visual Studio 2022 / VS Code  

###  Backend Setup
```bash
# Clone repo
git clone <repository-url>
cd E-CommercePlatform/Backend
```
# Update appsettings.json connection string
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ECommerceDB;Trusted_Connection=true;"
}

# Apply migrations
dotnet ef database update

# Run API
dotnet run --project E-CommercePlatform

API URL → https://localhost:5165

```
---

### Frontend Setup

cd E-CommercePlatform/Frontend/EcommercePlatform_react
```bash
npm install
```

# Update API base URL in src/services/api.js
const API_BASE_URL = 'https://localhost:5168/api';
``` bash
npm start
```
---

### Authentication Flow

1.  User registers → email & password

2.  Login returns JWT token

3.  Token added to API requests

4.  Server validates token

5.  Role-based permissions enforced

---

### Shopping Flow

1. Browse catalog
2. View product details
3. Add to cart
4. Manage cart (update/remove items)
5. Checkout & enter shipping info
6. Secure payment
7. Receive order confirmation

---

###  Testing
---
## Backend
```
dotnet test
dotnet test --collect:"XPlat Code Coverage"
```
---

## Frontend
```
npm test
npm test -- --coverage
```