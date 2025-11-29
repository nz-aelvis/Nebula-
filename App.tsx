
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, ClipboardList, Settings as SettingsIcon, 
  Search, Bell, Menu, X, CheckCircle, AlertCircle, Users, LogOut, 
  ScanBarcode, Container, Landmark, Building2, Puzzle, Globe, Lock, MessagesSquare, Cpu
} from 'lucide-react';
import { 
    AppView, Product, Order, OrderItem, SalesStat, Customer, Vendor, PurchaseOrder, 
    Shipment, Invoice, StoreProfile, User, IntegrationConfig, BlogPost, Review,
    InvoiceTemplate, RoleDefinition, CustomFieldDefinition, StockMovement
} from './types.ts';
import { 
    CURRENCY_RATES, INITIAL_ADMIN_USER, DEFAULT_ROLES, DEFAULT_INVOICE_TEMPLATE, DEMO_DATA 
} from './constants.ts';
import Dashboard from './components/Dashboard.tsx';
import Inventory from './components/Inventory.tsx';
import Storefront from './components/Storefront.tsx';
import Settings from './components/Settings.tsx';
import AIChat from './components/AIChat.tsx';
import Customers from './components/Customers.tsx';
import Orders from './components/Orders.tsx';
import Login from './components/Login.tsx';
import POS from './components/POS.tsx';
import Vendors from './components/Vendors.tsx';
import Logistics from './components/Logistics.tsx';
import Fiscal from './components/Fiscal.tsx';
import AdminUsers from './components/AdminUsers.tsx';
import Integrations from './components/Integrations.tsx';
import Community from './components/Community.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import { formatCurrency } from './services/utils.ts';

// --- Reusable Toast ---
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
    <div className={`fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-4 py-3 border shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300 ${type === 'success' ? 'bg-dark-surface border-nvidia text-nvidia' : 'bg-dark-surface border-red-500 text-red-500'}`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="text-sm font-bold tracking-wide uppercase">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
    </div>
);

// --- Notification Dropdown ---
const NotificationDropdown: React.FC<{ notifications: any[]; isOpen: boolean; onClose: () => void; onMarkAllRead: () => void; }> = ({ notifications, isOpen, onClose, onMarkAllRead }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute right-0 top-12 w-80 bg-dark-surface border border-dark-border z-50 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="p-4 border-b border-dark-border flex justify-between items-center"><h3 className="font-bold text-white uppercase tracking-wider text-xs">Notifications</h3><button onClick={onMarkAllRead} className="text-xs text-nvidia hover:text-white font-mono uppercase">Mark read</button></div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? <div className="p-8 text-center text-dark-muted text-xs uppercase">No new signals</div> : notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-dark-border hover:bg-white/5 transition-colors ${!n.read ? 'border-l-2 border-l-nvidia bg-nvidia/5' : ''}`}>
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        <p className="text-xs text-dark-muted mt-1 font-mono">{n.message}</p>
                    </div>
                ))}
            </div>
            {notifications.length > 0 && <div className="p-2 border-t border-dark-border text-center"><button onClick={onClose} className="text-xs text-dark-muted hover:text-white py-1 uppercase">Close</button></div>}
        </div>
    );
};

// --- Footer ---
const Footer: React.FC<{ storeName: string }> = ({ storeName }) => (
    <footer className="bg-black text-dark-muted py-12 border-t border-dark-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><div className="flex items-center gap-2 mb-4 text-white"><Cpu className="w-8 h-8 text-nvidia" /><span className="text-xl font-bold uppercase tracking-tighter">{storeName}</span></div><p className="text-sm text-dark-muted">Powered by Nebula ERP.</p></div>
            <div><h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Shop</h4><ul className="space-y-2 text-sm"><li>New Arrivals</li><li>Best Sellers</li></ul></div>
            <div><h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4><ul className="space-y-2 text-sm"><li>Help Center</li><li>Returns</li></ul></div>
            <div><h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Newsletter</h4><div className="flex gap-2"><input type="email" placeholder="EMAIL" className="bg-dark-surface border border-dark-border rounded-none px-4 py-2 text-sm w-full text-white focus:border-nvidia outline-none" /><button className="bg-nvidia text-black px-4 py-2 font-bold uppercase">Join</button></div></div>
        </div>
    </footer>
);

// --- Cart Sidebar ---
const CartSidebar: React.FC<{ isOpen: boolean; onClose: () => void; cart: OrderItem[]; products: Product[]; onCheckout: () => void; removeFromCart: (id: string) => void; currency: string; }> = ({ isOpen, onClose, cart, products, onCheckout, removeFromCart, currency }) => {
  if (!isOpen) return null;
  const cartItemsFull = cart.map(item => ({ ...item, product: products.find(p => p.id === item.productId) })).filter(item => item.product);
  const total = cartItemsFull.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-dark-surface border-l border-dark-border shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        <div className="p-5 border-b border-dark-border flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide"><ShoppingCart className="w-5 h-5 text-nvidia" /> Cart</h2><button onClick={onClose}><X className="w-5 h-5 text-dark-muted hover:text-white" /></button></div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItemsFull.length === 0 && <p className="text-center text-dark-muted py-10 uppercase text-xs">Cart Empty</p>}
          {cartItemsFull.map((item) => (
              <div key={item.productId} className="flex gap-4 p-3 bg-black border border-dark-border">
                <div className="w-16 h-16 bg-dark-surface border border-dark-border overflow-hidden"><img src={item.product?.imageUrl} className="w-full h-full object-cover" /></div>
                <div className="flex-1"><h4 className="text-sm font-bold text-white uppercase">{item.product?.name}</h4><p className="text-xs text-dark-muted font-mono">{item.quantity} × {formatCurrency(item.priceAtPurchase, currency)}</p></div>
                <div className="flex flex-col items-end"><span className="text-sm font-bold text-nvidia font-mono">{formatCurrency(item.quantity * item.priceAtPurchase, currency)}</span><button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:text-red-400 mt-1 uppercase">Remove</button></div>
              </div>
          ))}
        </div>
        <div className="p-5 border-t border-dark-border bg-black"><div className="flex justify-between items-center mb-4"><span className="text-dark-muted uppercase text-xs font-bold">Subtotal</span><span className="text-xl font-bold text-white font-mono">{formatCurrency(total, currency)}</span></div><button onClick={onCheckout} disabled={cart.length === 0} className="w-full py-3 bg-nvidia text-black font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50">Checkout</button></div>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Data State with Persistence (Defaulting to empty arrays for real-world usage)
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('products') || '[]'));
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('orders') || '[]'));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('customers') || '[]'));
  const [salesData, setSalesData] = useState<SalesStat[]>(() => JSON.parse(localStorage.getItem('salesData') || '[]'));
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => JSON.parse(localStorage.getItem('nebula_settings') || JSON.stringify({ storeName: 'Nebula Shop', currency: 'USD', baseCurrency: 'USD', vatAssured: true, email: 'admin@example.com', address: '123 Main St', phone: '555-0123', nif: '123456789' })));
  const [vendors, setVendors] = useState<Vendor[]>(() => JSON.parse(localStorage.getItem('vendors') || '[]'));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => JSON.parse(localStorage.getItem('purchaseOrders') || '[]'));
  const [shipments, setShipments] = useState<Shipment[]>(() => JSON.parse(localStorage.getItem('shipments') || '[]'));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('invoices') || '[]'));
  
  // New Feature States
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('users') || JSON.stringify([INITIAL_ADMIN_USER])));
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => JSON.parse(localStorage.getItem('integrations') || '[]'));
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => JSON.parse(localStorage.getItem('blogPosts') || '[]'));
  const [reviews, setReviews] = useState<Review[]>(() => JSON.parse(localStorage.getItem('reviews') || '[]'));
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(() => JSON.parse(localStorage.getItem('templates') || JSON.stringify([DEFAULT_INVOICE_TEMPLATE])));
  const [roles, setRoles] = useState<RoleDefinition[]>(() => JSON.parse(localStorage.getItem('roles') || JSON.stringify(DEFAULT_ROLES)));
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => JSON.parse(localStorage.getItem('customFields') || '[]'));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => JSON.parse(localStorage.getItem('stockMovements') || '[]'));

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_ADMIN_USER);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('salesData', JSON.stringify(salesData)), [salesData]);
  useEffect(() => localStorage.setItem('vendors', JSON.stringify(vendors)), [vendors]);
  useEffect(() => localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)), [purchaseOrders]);
  useEffect(() => localStorage.setItem('shipments', JSON.stringify(shipments)), [shipments]);
  useEffect(() => localStorage.setItem('invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('integrations', JSON.stringify(integrations)), [integrations]);
  useEffect(() => localStorage.setItem('blogPosts', JSON.stringify(blogPosts)), [blogPosts]);
  useEffect(() => localStorage.setItem('reviews', JSON.stringify(reviews)), [reviews]);
  useEffect(() => localStorage.setItem('templates', JSON.stringify(templates)), [templates]);
  useEffect(() => localStorage.setItem('roles', JSON.stringify(roles)), [roles]);
  useEffect(() => localStorage.setItem('customFields', JSON.stringify(customFields)), [customFields]);
  useEffect(() => localStorage.setItem('stockMovements', JSON.stringify(stockMovements)), [stockMovements]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleSeedData = () => {
    setProducts(DEMO_DATA.products);
    setOrders(DEMO_DATA.orders);
    setCustomers(DEMO_DATA.customers);
    setSalesData(DEMO_DATA.salesData);
    setVendors(DEMO_DATA.vendors);
    showToast('Demo data loaded successfully!', 'success');
  };

  const handleClearData = () => {
    if(confirm('Are you sure you want to wipe all system data?')) {
        setProducts([]);
        setOrders([]);
        setCustomers([]);
        setSalesData([]);
        setVendors([]);
        setPurchaseOrders([]);
        setShipments([]);
        setInvoices([]);
        setStockMovements([]);
        showToast('System factory reset complete.', 'error');
    }
  };
  
  const handleBackupData = () => {
      const data = {
          products, orders, customers, salesData, vendors, purchaseOrders, shipments, invoices, stockMovements,
          users, integrations, blogPosts, reviews, templates, roles, customFields, storeProfile
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nebula-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Backup exported successfully.', 'success');
  };
  
  const handleRestoreData = (jsonString: string) => {
      try {
          const data = JSON.parse(jsonString);
          if(data.products) setProducts(data.products);
          if(data.orders) setOrders(data.orders);
          if(data.customers) setCustomers(data.customers);
          if(data.salesData) setSalesData(data.salesData);
          if(data.vendors) setVendors(data.vendors);
          if(data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
          if(data.shipments) setShipments(data.shipments);
          if(data.invoices) setInvoices(data.invoices);
          if(data.stockMovements) setStockMovements(data.stockMovements);
          if(data.users) setUsers(data.users);
          if(data.integrations) setIntegrations(data.integrations);
          if(data.blogPosts) setBlogPosts(data.blogPosts);
          if(data.reviews) setReviews(data.reviews);
          if(data.templates) setTemplates(data.templates);
          if(data.roles) setRoles(data.roles);
          if(data.customFields) setCustomFields(data.customFields);
          if(data.storeProfile) setStoreProfile(data.storeProfile);
          showToast('System restored from backup.', 'success');
      } catch(e) {
          showToast('Failed to restore data. Invalid JSON.', 'error');
      }
  };

  const handleAdjustStock = (productId: string, quantity: number, type: StockMovement['type'], reason: string) => {
      setProducts(prev => prev.map(p => {
          if(p.id === productId) {
              return { ...p, stock: p.stock + quantity };
          }
          return p;
      }));
      setStockMovements(prev => [...prev, {
          id: `MOV-${Date.now()}`,
          productId,
          quantity,
          type,
          reason,
          date: new Date().toISOString(),
          userId: currentUser.id
      }]);
      showToast(`Stock updated: ${quantity > 0 ? '+' : ''}${quantity}`, 'success');
  };
  
  const handleImportProducts = (newProducts: Product[]) => {
      setProducts(prev => [...prev, ...newProducts]);
      newProducts.forEach(p => {
          setStockMovements(prev => [...prev, {
              id: `MOV-${Date.now()}-${p.id}`,
              productId: p.id,
              quantity: p.stock,
              type: 'adjustment',
              reason: 'Initial Import',
              date: new Date().toISOString(),
              userId: currentUser.id
          }]);
      });
  };
  
  const handleCancelOrder = (orderId: string, reason: string) => {
      const order = orders.find(o => o.id === orderId);
      if(!order) return;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      
      // Restore Stock
      order.items.forEach(item => {
          handleAdjustStock(item.productId, item.quantity, 'return', `Order Cancelled: ${orderId} - ${reason}`);
      });
      showToast(`Order ${orderId} cancelled and stock restored.`, 'success');
  };
  
  const handleRefundOrder = (orderId: string, reason: string) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'refunded', refundReason: reason } : o));
      showToast(`Order ${orderId} marked as refunded.`, 'success');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: product.id, quantity: 1, priceAtPurchase: product.price }];
    });
    setIsCartOpen(true);
    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast('Item removed', 'error');
  };

  const handleCompleteCheckout = (details: any) => {
    const totalBase = cart.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0);
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: [...cart],
      total: totalBase,
      currency: storeProfile.currency,
      customerName: details.name || 'Guest',
      paymentMethod: details.paymentMethod,
      shippingAddress: details.address
    };

    setOrders(prev => [newOrder, ...prev]);
    if (isAuthenticated) setNotifications(prev => [{ id: Date.now(), title: 'New Order', message: `#${newOrder.id} - ${formatCurrency(totalBase, storeProfile.currency)}`, read: false }, ...prev]);
    
    // Update Sales
    setSalesData(prev => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      const existingDay = prev.find(d => d.date === today);
      return existingDay ? prev.map(d => d.date === today ? { ...d, amount: d.amount + totalBase } : d) : [...prev, { date: today, amount: totalBase }];
    });

    // Reduce Stock
    setProducts(prev => prev.map(p => {
        const inCart = cart.find(c => c.productId === p.id);
        if(inCart) {
             // Record movement
             setStockMovements(prevSm => [...prevSm, {
                 id: `MOV-${Date.now()}-${p.id}`,
                 productId: p.id,
                 quantity: -inCart.quantity,
                 type: 'sale',
                 reason: `Online Order ${newOrder.id}`,
                 date: new Date().toISOString()
             }]);
             return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
    }));

    setCart([]);
    setIsCheckoutOpen(false);
    showToast('Order placed successfully!', 'success');
  };

  const handlePOSComplete = (items: OrderItem[], total: number, payment: string, fiscalSig: string) => {
      const newOrder: Order = {
          id: `POS-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: 'delivered',
          items: items,
          total: total,
          currency: storeProfile.currency,
          customerName: 'Walk-in',
          fiscalSignature: fiscalSig,
          ebmsResponseId: `EBMS-${Date.now().toString().slice(-6)}`,
          paymentMethod: payment
      };
      setProducts(prev => prev.map(p => {
          const inSale = items.find(i => i.productId === p.id);
          if(inSale) {
               setStockMovements(prevSm => [...prevSm, {
                 id: `MOV-${Date.now()}-${p.id}`,
                 productId: p.id,
                 quantity: -inSale.quantity,
                 type: 'sale',
                 reason: `POS Sale ${newOrder.id}`,
                 date: new Date().toISOString()
             }]);
             return { ...p, stock: Math.max(0, p.stock - inSale.quantity) };
          }
          return p;
      }));
      setOrders(prev => [newOrder, ...prev]);
      setInvoices(prev => [{
          id: `INV-${Date.now().toString().slice(-6)}`,
          orderId: newOrder.id,
          fiscalSignature: fiscalSig,
          obrTime: new Date().toISOString(),
          customerName: 'Walk-in',
          tin: 'N/A',
          items: items,
          total: total,
          vat: 0,
          currency: storeProfile.currency
      }, ...prev]);
      showToast(`Sale complete!`, 'success');
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${currentView === view ? 'bg-white/5 border-nvidia text-white font-bold' : 'border-transparent text-dark-muted hover:text-white hover:bg-white/5'}`}>
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-nvidia' : ''}`} />
      <span className="uppercase text-xs tracking-wider">{label}</span>
    </button>
  );

  if (!isAuthenticated && currentView !== AppView.STOREFRONT) {
    return <Login onLogin={handleLogin} onNavigateToStore={() => setCurrentView(AppView.STOREFRONT)} users={users} />;
  }

  return (
    <div className="min-h-screen bg-black text-dark-text flex font-sans flex-col sm:flex-row">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {currentView !== AppView.STOREFRONT && currentView !== AppView.POS && <AIChat products={products} orders={orders} />}

      {currentView !== AppView.STOREFRONT && (
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-dark-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-dark-border flex items-center gap-3">
                <div className="w-8 h-8 bg-black border border-nvidia rounded flex items-center justify-center text-nvidia font-bold shadow-[0_0_10px_rgba(118,185,0,0.3)]">N</div>
                <span className="text-xl font-bold text-white tracking-tighter uppercase">Nebula <span className="text-nvidia">ERP</span></span>
              </div>
              <nav className="flex-1 p-0 space-y-1 overflow-y-auto py-4">
                <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2 px-4 mt-2">Core</div>
                <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                <NavItem view={AppView.POS} icon={ScanBarcode} label="Point of Sale" />
                <NavItem view={AppView.INVENTORY} icon={Package} label="Inventory" />
                
                <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2 px-4 mt-6">Enterprise</div>
                <NavItem view={AppView.VENDORS} icon={Building2} label="Vendors" />
                <NavItem view={AppView.LOGISTICS} icon={Container} label="Logistics" />
                <NavItem view={AppView.FISCAL} icon={Landmark} label="Fiscal" />

                <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2 px-4 mt-6">Management</div>
                <NavItem view={AppView.ORDERS} icon={ClipboardList} label="Orders" />
                <NavItem view={AppView.CUSTOMERS} icon={Users} label="Customers" />
                <NavItem view={AppView.COMMUNITY} icon={MessagesSquare} label="Community" />
                <NavItem view={AppView.ADMIN_USERS} icon={Lock} label="User Roles" />
                <NavItem view={AppView.INTEGRATIONS} icon={Puzzle} label="Integrator" />
                
                <div className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2 px-4 mt-6">System</div>
                <NavItem view={AppView.SETTINGS} icon={SettingsIcon} label="Settings" />
                <NavItem view={AppView.STOREFRONT} icon={ShoppingCart} label="View Store" />
              </nav>
              <div className="p-4 border-t border-dark-border"><button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-900/10 rounded transition-colors uppercase text-xs font-bold tracking-wider"><LogOut className="w-5 h-5" /><span>Sign Out</span></button></div>
            </div>
          </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {currentView !== AppView.STOREFRONT && <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 lg:hidden text-white hover:bg-white/10 rounded"><Menu className="w-6 h-6" /></button>}
            {currentView === AppView.STOREFRONT && <div className="flex items-center gap-2 mr-4"><Cpu className="w-8 h-8 text-nvidia" /><span className="text-xl font-bold text-white hidden sm:block uppercase tracking-tighter">{storeProfile.storeName}</span><button onClick={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.DASHBOARD)} className="ml-4 text-xs font-bold text-dark-muted border border-dark-border hover:border-nvidia hover:text-nvidia px-2 py-1 uppercase">{isAuthenticated ? 'Dashboard' : 'Admin Login'}</button></div>}
            <div className="relative w-full max-w-md hidden sm:block"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" /><input type="text" placeholder="SEARCH SYSTEM..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-nvidia placeholder:text-dark-muted/50 rounded-none" /></div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
             <div className="px-3 py-1 bg-white/5 rounded text-xs font-bold text-nvidia border border-nvidia/30 flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3" /> {storeProfile.currency}
             </div>

             {currentView === AppView.STOREFRONT ? (
                 <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-dark-muted hover:text-white transition-colors"><ShoppingCart className="w-5 h-5" />{cart.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-nvidia rounded-full box-content border-2 border-black"></span>}</button>
             ) : (
                 <div className="relative"><button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 text-dark-muted hover:text-white transition-colors relative"><Bell className="w-5 h-5" />{notifications.filter(n=>!n.read).length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nvidia rounded-full"></span>}</button><NotificationDropdown notifications={notifications} isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} /></div>
             )}
             <div className="w-8 h-8 rounded bg-dark-surface border border-dark-border overflow-hidden"><img src={currentUser.avatarUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-black">
           <div className="p-4 sm:p-6 lg:p-8 min-h-full flex flex-col text-dark-text">
            {currentView === AppView.DASHBOARD && <Dashboard products={products} salesData={salesData} orders={orders} currency={storeProfile.currency} />}
            {currentView === AppView.POS && <POS products={products} onCompleteSale={handlePOSComplete} storeProfile={storeProfile} />}
            {currentView === AppView.INVENTORY && <Inventory products={products} setProducts={setProducts} searchTerm={searchQuery} customFields={customFields} stockMovements={stockMovements} onAdjustStock={handleAdjustStock} onImportProducts={handleImportProducts} />}
            {currentView === AppView.VENDORS && <Vendors vendors={vendors} purchaseOrders={purchaseOrders} onAddPO={(po) => setPurchaseOrders(prev => [po, ...prev])} onReceivePO={(id) => { /* logic */ }} />}
            {currentView === AppView.LOGISTICS && <Logistics shipments={shipments} onAddShipment={(s) => setShipments(prev => [s, ...prev])} onUpdateStatus={(id, st) => setShipments(prev => prev.map(s => s.id === id ? {...s, status: st} : s))} />}
            {currentView === AppView.FISCAL && <Fiscal invoices={invoices} products={products} orders={orders} activeTemplate={templates.find(t => t.isActive) || templates[0]} storeProfile={storeProfile} />}
            {currentView === AppView.ADMIN_USERS && <AdminUsers users={users} setUsers={setUsers} />}
            {currentView === AppView.INTEGRATIONS && <Integrations integrations={integrations} setIntegrations={setIntegrations} />}
            {currentView === AppView.STOREFRONT && <><Storefront products={products} cart={cart} addToCart={addToCart} cartTotal={0} searchTerm={searchQuery} currency={storeProfile.currency} blogPosts={blogPosts} reviews={reviews} /><Footer storeName={storeProfile.storeName} /></>}
            {currentView === AppView.SETTINGS && <Settings 
                initialProfile={storeProfile} onSaveProfile={setStoreProfile} 
                currentUser={currentUser} setCurrentUser={setCurrentUser} 
                users={users} setUsers={setUsers}
                templates={templates} setTemplates={setTemplates}
                roles={roles} setRoles={setRoles}
                customFields={customFields} setCustomFields={setCustomFields}
                onSeedData={handleSeedData} onClearData={handleClearData}
                onBackupData={handleBackupData} onRestoreData={handleRestoreData}
            />}
            {currentView === AppView.CUSTOMERS && <Customers customers={customers} orders={orders} />}
            {currentView === AppView.ORDERS && <Orders orders={orders} setOrders={setOrders} products={products} onCancelOrder={handleCancelOrder} onRefundOrder={handleRefundOrder} />}
            {currentView === AppView.COMMUNITY && <Community posts={blogPosts} setPosts={setBlogPosts} reviews={reviews} setReviews={setReviews} products={products} />}
           </div>
        </main>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} products={products} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} removeFromCart={removeFromCart} currency={storeProfile.currency} />
      
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cartTotal={cart.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0)} currency={storeProfile.currency} onComplete={handleCompleteCheckout} />
    </div>
  );
}

export default App;
