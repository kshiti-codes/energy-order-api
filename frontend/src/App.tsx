import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/orders`
  : 'http://localhost:3000/orders';
const PRODUCTS_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/products`
  : 'http://localhost:3000/products';

type Product = 'SOLAR_PANEL' | 'HEAT_PUMP' | 'EV_CHARGER';
type Status = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'COMPLETED';
type RouteStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';

interface Order {
  id: string;
  customerId?: string;
  customerEmail?: string;
  customerName: string;
  product: Product;
  status: Status;
  routeStatus: RouteStatus;
  deliveryAddress?: string;
  createdAt: string;
}

interface ProductItem {
  id: string;
  name: string;
}

const PRODUCT_LABELS: Record<Product, string> = {
  SOLAR_PANEL: '☀️ Solar Panel',
  HEAT_PUMP: '🌡️ Heat Pump',
  EV_CHARGER: '⚡ EV Charger',
};

const STATUS_COLORS: Record<Status, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#0ea5e9',
  DELIVERED: '#22c55e',
  CANCELED: '#ef4444',
  COMPLETED: '#22c55e',
};

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([
    { id: 'SOLAR_PANEL', name: '☀️ Solar Panel' },
    { id: 'HEAT_PUMP', name: '🌡️ Heat Pump' },
    { id: 'EV_CHARGER', name: '⚡ EV Charger' },
  ]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [product, setProduct] = useState<Product>('SOLAR_PANEL');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setOrders(data);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAvailableProducts(data);
      }
    } catch {
      // fallback to static list; no crash
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const customerHasSolar = () => {
    const email = customerEmail.trim().toLowerCase();
    return orders.some((order) =>
      order.product === 'SOLAR_PANEL' &&
      (order.customerEmail?.toLowerCase() === email || order.customerName.toLowerCase() === customerName.trim().toLowerCase()),
    );
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (!customerEmail.trim()) { setError('Customer email is required.'); return; }

    if ((product === 'HEAT_PUMP' || product === 'EV_CHARGER') && !customerHasSolar()) {
      setError('Dependency missing: you need a Solar Panel order first.');
      return;
    }

    setError('');
    setLoading(true);

    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        product,
        deliveryAddress,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      setError(err.message || 'Failed to place order');
      setLoading(false);
      return;
    }

    setCustomerName('');
    setCustomerEmail('');
    setDeliveryAddress('');
    await fetchOrders();
    setLoading(false);
  };

  const handleAdvance = async (id: string) => {
    await fetch(`${API}/${id}/status`, { method: 'PATCH' });
    await fetchOrders();
  };

  const assignRoute = async (id: string) => {
    await fetch(`${API}/${id}/assign-route`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routeId: `route-${Math.random().toString(36).slice(2, 8)}` }),
    });
    await fetchOrders();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>⚡ EnergyOrder</h1>
        <p style={styles.tagline}>NestJS + React Order Booking System</p>
      </header>
      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>New Order</h2>
          <label style={styles.label}>Customer Name</label>
          <input style={styles.input} type="text" placeholder="e.g. Anna Müller"
            value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <label style={styles.label}>Customer Email</label>
          <input style={styles.input} type="email" placeholder="e.g. anna@example.com"
            value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />

          <label style={styles.label}>Product</label>
          <select style={styles.input} value={product} onChange={(e) => setProduct(e.target.value as Product)}>
            {availableProducts.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>

          <label style={styles.label}>Delivery Address</label>
          <input style={styles.input} type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="e.g. 123 Main St" />

          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </section>

        <section style={styles.ordersSection}>
          <h2 style={styles.sectionTitle}>Orders <span style={styles.badge}>{orders.length}</span></h2>
          {orders.length === 0 && <p style={styles.empty}>No orders yet. Place your first one!</p>}
          <div style={styles.grid}>
            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <span style={styles.customerName}>{order.customerName}</span>
                  <span style={{ ...styles.statusBadge, backgroundColor: STATUS_COLORS[order.status] }}>
                    {order.status}
                  </span>
                </div>
                <p style={styles.productLabel}>{PRODUCT_LABELS[order.product]}</p>
                <p style={styles.subLabel}>Route: {order.routeStatus}</p>
                {order.deliveryAddress && <p style={styles.subLabel}>Delivery: {order.deliveryAddress}</p>}
                <p style={styles.date}>{new Date(order.createdAt).toLocaleString()}</p>
                {order.routeStatus === 'UNASSIGNED' && (
                  <button style={styles.assignBtn} onClick={() => assignRoute(order.id)}>
                    Assign Route
                  </button>
                )}

                {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                  <button style={styles.advanceBtn} onClick={() => handleAdvance(order.id)}>
                    Advance → {order.status === 'PENDING' ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'PROCESSING' : order.status === 'PROCESSING' ? 'SHIPPED' : 'DELIVERED'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" },
  header: { backgroundColor: '#1e293b', padding: '24px 40px', borderBottom: '1px solid #334155' },
  logo: { margin: 0, fontSize: '28px', fontWeight: 700, color: '#facc15', textAlign: 'center' },
  tagline: { margin: '4px 0 0', color: '#94a3b8', fontSize: '14px', textAlign: 'center' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
  card: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '28px', marginBottom: '40px', border: '1px solid #334155' },
  sectionTitle: { marginTop: 0, fontSize: '20px', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' },
  label: { display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f1f5f9', fontSize: '15px', boxSizing: 'border-box' },
  button: { marginTop: '20px', padding: '12px 28px', backgroundColor: '#facc15', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' },
  error: { color: '#f87171', fontSize: '13px', marginTop: '8px' },
  ordersSection: { marginTop: '0' },
  badge: { backgroundColor: '#334155', color: '#94a3b8', borderRadius: '999px', padding: '2px 10px', fontSize: '13px' },
  empty: { color: '#64748b', textAlign: 'center', padding: '40px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' },
  orderCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  customerName: { fontWeight: 600, fontSize: '16px' },
  statusBadge: { fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', color: '#fff', letterSpacing: '0.05em' },
  productLabel: { margin: '4px 0', color: '#94a3b8', fontSize: '14px' },
  subLabel: { margin: '2px 0', color: '#cbd5e1', fontSize: '12px' },
  date: { fontSize: '12px', color: '#475569', margin: '4px 0 12px' },
  advanceBtn: { width: '100%', padding: '8px', backgroundColor: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', marginTop: '4px' },
  assignBtn: { width: '100%', padding: '8px', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', marginTop: '4px' },
};
