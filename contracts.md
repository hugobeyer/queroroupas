# API Contracts - Quero Roupas Admin System

## Backend Implementation

### 1. Product Model
```python
{
    "id": "uuid",
    "name": "string",
    "price": "float",
    "image": "string (URL)",
    "category": "string",
    "isNew": "boolean",
    "createdAt": "datetime"
}
```

### 2. API Endpoints

#### GET /api/products
- Returns all products
- Response: List[Product]

#### POST /api/products
- Create new product
- Body: { name, price, image, category, isNew }
- Response: Product

#### PUT /api/products/{id}
- Update product
- Body: { name, price, image, category, isNew }
- Response: Product

#### DELETE /api/products/{id}
- Delete product
- Response: { message: "Product deleted" }

## Frontend Integration

### Mock Data Replacement
- Remove mock.js data usage
- Replace with API calls to backend
- Update Home.jsx and Catalog.jsx to fetch from API

### Admin Page
- New route: /admin
- Protected (simple password for now)
- Features:
  - Add new product form
  - List all products with edit/delete buttons
  - Toggle "isNew" status
  - Image URL input (placeholder-based)

### Categories
Fixed list: "Vestidos", "Blusas", "Calças", "Saias", "Conjuntos", "Blazers", "Tops", "Shorts", "Jaquetas"
