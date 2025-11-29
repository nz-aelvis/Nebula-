# Nebula ERP & Shop - Technical Documentation

## Overview

**Nebula ERP & Shop** is a comprehensive, browser-based Enterprise Resource Planning (ERP) and Ecommerce platform built with React 19. It leverages **Google Gemini AI** to provide intelligent insights, risk analysis, and content generation.

The application is designed as a **Progressive Web App (SPA)** that persists data locally (LocalStorage) for immediate utility, simulating a full-stack environment. It features a dual-interface architecture:
1.  **Admin Panel**: For business management (POS, Inventory, Logistics, Fiscal).
2.  **Storefront**: A public-facing e-commerce interface for customers.

## Key Features

### 1. Core ERP
*   **Dashboard**: Real-time visualization of sales, inventory risks, and AI-driven revenue forecasts using `recharts`.
*   **Inventory Management**: CRUD operations for products with support for dynamic **Custom Fields** (defined in Settings).
*   **Point of Sale (POS)**: fast checkout interface with barcode simulation, multi-currency support, and fiscal receipt generation.

### 2. Enterprise Modules
*   **Vendors**: Supplier management and Purchase Order (PO) tracking.
*   **Logistics**: Shipment tracking (Incoming/Outgoing) with status timelines.
*   **Fiscal**: OBR/EBMS compliance simulation, generating crypto-signed invoices.

### 3. CRM & Users
*   **Customers**: Transaction history, Lifetime Value (LTV) calculation, and AI-generated marketing emails.
*   **RBAC System**: Granular permission management (Admin, Manager, Cashier) defined in `types.ts`.

### 4. Customization & Community
*   **Form Builder**: Add custom fields to products/customers without code changes.
*   **Template Engine**: Edit Invoice HTML/CSS layouts directly in the browser.
*   **Community**: CMS for Blog posts and Product Reviews.

## Technical Stack

*   **Frontend Library**: React 19
*   **Styling**: Tailwind CSS (via CDN/Config)
*   **State Management**: React `useState` + `useEffect` (Persistence via LocalStorage)
*   **AI Engine**: Google Gemini API (`@google/genai`)
*   **Visualization**: Recharts
*   **Icons**: Lucide React
*   **Routing**: Custom conditional rendering (State-based routing)

## Architecture

### Data Flow
The app uses a **Lifted State** pattern. The root `App.tsx` component holds the master state for `products`, `orders`, `users`, etc., and passes them down to child components.

### AI Integration
AI logic is encapsulated in `services/geminiService.ts`. It handles:
*   Sales Forecasting (JSON mode)
*   Inventory Risk Analysis
*   Natural Language Chat (RAG-lite on client data)
*   Semantic Search
*   Fiscal Signature Simulation

### Security
*   **Frontend**: API Key is loaded via `process.env`.
*   **Backend (Production)**: A `worker.ts` is provided to offload AI calls to a Cloudflare Worker, keeping the API key secret.

## Directory Structure

*   `components/`: UI Modules (Dashboard, Inventory, POS, etc.)
*   `services/`: Logic layer (Gemini, Utilities)
*   `types.ts`: TypeScript interfaces for the entire domain.
*   `constants.ts`: System defaults and configurations.
*   `worker.ts`: Backend proxy code.
