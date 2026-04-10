// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, CartProvider } from './utils/context';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/shop/CartDrawer';

// Public pages
import Home from './pages/Home';
import Tienda from './pages/Tienda';
import ProductoDetalle from './pages/ProductoDetalle';
import Checkout from './pages/Checkout';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminLayout, { DashboardHome } from './pages/admin/Dashboard';
import AdminProductos from './pages/admin/Productos';
import AdminOrdenes from './pages/admin/Ordenes';
import AdminMetodosPago from './pages/admin/MetodosPago';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/tienda" element={<PublicLayout><Tienda /></PublicLayout>} />
            <Route path="/producto/:id" element={<PublicLayout><ProductoDetalle /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />

            {/* Admin auth */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Admin protected */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="ordenes" element={<AdminOrdenes />} />
              <Route path="metodos-pago" element={<AdminMetodosPago />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}