import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/common/RouteGuards';
import { AuthProvider } from './providers/AuthProvider';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AddressesPage } from './pages/AddressesPage';
import { ProfilePage } from './pages/ProfilePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyResetOtpPage } from './pages/auth/VerifyResetOtpPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F5F7FA] font-sans selection:bg-indigo-600 selection:text-white">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Guest Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/verify-otp"
                  element={
                    <GuestRoute>
                      <VerifyOtpPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPasswordPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password/verify-otp"
                  element={
                    <GuestRoute>
                      <VerifyResetOtpPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password/reset"
                  element={
                    <GuestRoute>
                      <ResetPasswordPage />
                    </GuestRoute>
                  }
                />

                {/* Protected User Routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Staff Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/new"
                  element={
                    <AdminRoute>
                      <AdminAddProductPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/:id/edit"
                  element={
                    <AdminRoute>
                      <AdminAddProductPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategoriesPage />
                    </AdminRoute>
                  }
                />

                {/* Fallback Catch-all Route */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            <Footer />
            <ToastContainer />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
