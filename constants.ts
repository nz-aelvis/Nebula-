
import { RoleDefinition, InvoiceTemplate, User, Product, Customer, Order, SalesStat, Vendor, PurchaseOrder, Shipment, Invoice } from './types.ts';

export const CURRENCY_RATES: Record<string, number> = {
    'USD': 1,
    'BIF': 2850,
    'EUR': 0.92
};

// System Default Roles (RBAC)
export const DEFAULT_ROLES: RoleDefinition[] = [
    {
        id: 'ROLE_ADMIN',
        name: 'Administrator',
        permissions: [
            'view_dashboard', 'manage_inventory', 'manage_pos', 
            'manage_orders', 'manage_customers', 'manage_finance', 
            'manage_settings', 'manage_users', 'manage_content'
        ]
    },
    {
        id: 'ROLE_MANAGER',
        name: 'Store Manager',
        permissions: [
            'view_dashboard', 'manage_inventory', 'manage_pos', 
            'manage_orders', 'manage_customers', 'manage_content'
        ]
    },
    {
        id: 'ROLE_CASHIER',
        name: 'Cashier',
        permissions: ['manage_pos', 'manage_orders', 'view_dashboard']
    }
];

// Initial Admin User to prevent lockout on fresh install
export const INITIAL_ADMIN_USER: User = {
    id: 'USR-ADMIN', 
    name: 'System Admin', 
    email: 'admin@nebula.com', 
    roleId: 'ROLE_ADMIN', 
    status: 'active', 
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    password: 'admin' 
};

// Default Invoice Template
export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplate = {
    id: 'TMPL-DEFAULT',
    name: 'Standard Retail',
    isActive: true,
    cssContent: `
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .top-title { font-size: 45px; line-height: 45px; color: #333; }
        .heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .total td { border-top: 2px solid #eee; font-weight: bold; }
    `,
    htmlContent: `
        <div class="invoice-box">
            <table>
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="top-title">INVOICE</td>
                                <td>
                                    Invoice #: {{invoiceId}}<br>
                                    Created: {{date}}<br>
                                    NIF: {{storeNif}}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                    {{storeName}}<br>
                                    {{storeAddress}}<br>
                                    {{storePhone}}
                                </td>
                                <td>
                                    {{customerName}}<br>
                                    {{customerTin}}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="heading">
                    <td>Item</td>
                    <td>Price</td>
                </tr>
                {{itemsRow}}
                <tr class="total">
                    <td></td>
                    <td>Total: {{total}}</td>
                </tr>
            </table>
            <div style="text-align:center; margin-top:20px; font-size:10px;">
                Fiscal Signature: {{fiscalSig}}<br>
                OBR/EBMS ID: {{ebmsId}}
            </div>
        </div>
    `
};

// --- DEMO DATA ---
export const DEMO_DATA = {
    products: [
        { id: 'PROD-001', name: 'RTX 4090 Gaming PC', sku: 'PC-ULT-01', price: 3499, costPrice: 2800, stock: 5, category: 'Computers', description: 'Ultimate gaming rig with liquid cooling.', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=500', uom: 'Unit' },
        { id: 'PROD-002', name: 'ErgoChair Pro', sku: 'FUR-CHR-02', price: 499, costPrice: 250, stock: 45, category: 'Furniture', description: 'Ergonomic office chair with lumbar support.', imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=500', uom: 'Pcs' },
        { id: 'PROD-003', name: 'Mechanical Keyboard', sku: 'ACC-KB-03', price: 129, costPrice: 60, stock: 120, category: 'Accessories', description: 'RGB Mechanical keyboard with Cherry MX Red switches.', imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=500', uom: 'Pcs' },
        { id: 'PROD-004', name: '4K Monitor 27"', sku: 'MON-4K-04', price: 399, costPrice: 280, stock: 2, category: 'Monitors', description: 'IPS Panel, 144Hz, 1ms response time.', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=500', uom: 'Unit' },
        { id: 'PROD-005', name: 'Wireless Mouse', sku: 'ACC-MS-05', price: 49, costPrice: 20, stock: 200, category: 'Accessories', description: 'Ultra-lightweight wireless gaming mouse.', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500', uom: 'Pcs' },
        { id: 'PROD-006', name: 'Standing Desk', sku: 'FUR-DSK-06', price: 650, costPrice: 400, stock: 10, category: 'Furniture', description: 'Electric height adjustable desk.', imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=500', uom: 'Unit' },
    ] as Product[],
    customers: [
        { id: 'CUST-001', name: 'John Doe', email: 'john@example.com', phone: '+257 79 000 001', nif: '400012345', address: '12 Av de la Revolution', vatAssured: true, joinDate: '2023-01-15', status: 'active' },
        { id: 'CUST-002', name: 'Jane Smith', email: 'jane@example.com', phone: '+257 76 123 456', nif: '', address: 'Rohero I, Bujumbura', vatAssured: false, joinDate: '2023-03-22', status: 'active' },
        { id: 'CUST-003', name: 'Acme Corp', email: 'procurement@acme.bi', phone: '+257 22 222 222', nif: '400099999', address: 'Zone Industrielle', vatAssured: true, joinDate: '2023-05-10', status: 'active' },
    ] as Customer[],
    salesData: [
        { date: 'Mon', amount: 1200 },
        { date: 'Tue', amount: 2100 },
        { date: 'Wed', amount: 800 },
        { date: 'Thu', amount: 1600 },
        { date: 'Fri', amount: 2800 },
        { date: 'Sat', amount: 3200 },
        { date: 'Sun', amount: 1900 },
    ] as SalesStat[],
    vendors: [
        { id: 'VEND-001', name: 'Global Tech Supplies', contactPerson: 'Mike Ross', email: 'sales@globaltech.com', phone: '+1 555 0192', category: 'Electronics', address: 'Shenzhen, China' },
        { id: 'VEND-002', name: 'Office Comfort Ltd', contactPerson: 'Sarah Lee', email: 'sarah@officecomfort.co', phone: '+44 20 7946 0958', category: 'Furniture', address: 'London, UK' },
    ] as Vendor[],
    orders: [
        { id: 'ORD-1001', date: '2023-10-25', status: 'delivered', customerName: 'John Doe', total: 3499, currency: 'USD', items: [{ productId: 'PROD-001', quantity: 1, priceAtPurchase: 3499 }], paymentMethod: 'card' },
        { id: 'ORD-1002', date: '2023-10-26', status: 'shipped', customerName: 'Jane Smith', total: 178, currency: 'USD', items: [{ productId: 'PROD-003', quantity: 1, priceAtPurchase: 129 }, { productId: 'PROD-005', quantity: 1, priceAtPurchase: 49 }], paymentMethod: 'ecocash' },
        { id: 'ORD-1003', date: '2023-10-27', status: 'pending', customerName: 'Acme Corp', total: 6500, currency: 'USD', items: [{ productId: 'PROD-006', quantity: 10, priceAtPurchase: 650 }], paymentMethod: 'bank_transfer' },
    ] as Order[]
};
