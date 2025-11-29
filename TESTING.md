# Testing Guide

## Testing Strategy

Since Nebula ERP allows deep customization (custom fields, templates), testing focuses on **Critical User Journeys (CUJ)**.

## Manual Testing Scripts

### 1. Point of Sale (POS) Flow
1.  Navigate to **POS**.
2.  Add items to cart by clicking product cards.
3.  Search for a product using the search bar.
4.  Verify Subtotal and VAT calculations.
5.  Click **Checkout**.
6.  Select **Cash Payment**.
7.  Verify "Sale Complete" toast appears.
8.  Go to **Orders** and verify the new transaction exists with status 'delivered'.

### 2. Custom Field Logic
1.  Navigate to **Settings** -> **Form Builder**.
2.  Add a new field: Label="Warranty", Type="Number", Target="Product".
3.  Go to **Inventory** -> **Add Product**.
4.  Verify the "Warranty" field input appears.
5.  Save the product.
6.  Verify the "Warranty" value appears in the Inventory table.

### 3. Invoice Template Rendering
1.  Navigate to **Settings** -> **Invoice Templates**.
2.  Edit the HTML: Change `<h1>INVOICE</h1>` to `<h1>TAX RECEIPT</h1>`.
3.  Go to **Fiscal**.
4.  Click an invoice to view/print.
5.  Verify the title now says "TAX RECEIPT".

### 4. RBAC (Role Based Access Control)
1.  Navigate to **Settings** -> **Roles**.
2.  Create a role "Intern" with only `view_dashboard` permission.
3.  Go to **User Roles** (Admin Users).
4.  Create a user with the "Intern" role.
5.  Log out and log in as the Intern.
6.  Verify that POS, Inventory, and Settings are inaccessible/hidden.

## Automated Testing (Roadmap)

### Unit Tests (Jest)
*   `services/utils.ts`: Test currency conversion logic.
*   `services/geminiService.ts`: Test mock responses when API key is missing.

### Integration Tests (React Testing Library)
*   **Inventory Component**: Test adding/editing products updates the list.
*   **Cart Component**: Test adding duplicates increments quantity.

### E2E Tests (Playwright)
*   Full checkout flow.
*   Admin login flow.
