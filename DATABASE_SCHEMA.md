# Database Schema

Nebula ERP uses a **NoSQL-like Document Store** approach, currently implemented via `localStorage` for the browser demo. Below are the core entities and their relationships.

## Core Entities

### 1. Product
Represents an item in inventory.
*   `id`: string (PK)
*   `name`: string
*   `sku`: string (Unique)
*   `price`: number
*   `costPrice`: number
*   `stock`: number
*   `category`: string
*   `customFields`: Map<string, any> (Dynamic properties)

### 2. Order
Represents a sales transaction (POS or E-commerce).
*   `id`: string (PK)
*   `date`: string (ISO Date)
*   `customerName`: string
*   `items`: Array<OrderItem>
    *   `productId`: string (FK -> Product)
    *   `quantity`: number
    *   `priceAtPurchase`: number
*   `total`: number
*   `status`: 'pending' | 'shipped' | 'delivered'
*   `fiscalSignature`: string (Nullable, for OBR/EBMS)

### 3. Customer
*   `id`: string (PK)
*   `name`: string
*   `email`: string
*   `nif`: string (Tax ID)
*   `vatAssured`: boolean

### 4. Vendor
*   `id`: string (PK)
*   `name`: string
*   `contactPerson`: string

### 5. PurchaseOrder
Tracks stock replenishment from vendors.
*   `id`: string (PK)
*   `vendorId`: string (FK -> Vendor)
*   `status`: 'ordered' | 'received'
*   `items`: Array<{ productName, quantity, cost }>

## Configuration Entities

### 6. User
System users for RBAC.
*   `id`: string (PK)
*   `email`: string
*   `roleId`: string (FK -> RoleDefinition)

### 7. RoleDefinition
Defines access control.
*   `id`: string (PK)
*   `name`: string
*   `permissions`: string[] (e.g., 'manage_pos', 'view_dashboard')

### 8. InvoiceTemplate
Stores HTML/CSS for fiscal document generation.
*   `id`: string (PK)
*   `htmlContent`: string (Template with placeholders)
*   `cssContent`: string

## Relationships

*   **Product -> Order**: One-to-Many (via OrderItem).
*   **Customer -> Order**: One-to-Many.
*   **Vendor -> PurchaseOrder**: One-to-Many.
*   **User -> Role**: Many-to-One.

## Persistence Key Map
The following keys are used in `localStorage`:
*   `products`
*   `orders`
*   `customers`
*   `users`
*   `roles`
*   `templates`
*   `nebula_settings` (StoreProfile)
