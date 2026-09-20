import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  LogOut,
  Shield,
  Menu,
  X,
  PackageCheck,
  MapPin,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D10] border-b border-[#252A31] transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between h-16 gap-4 sm:gap-6 lg:gap-8">
          {/* Brand Logo & Core Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0 justify-self-start">
            <Link
              to="/"
              className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg py-1"
              aria-label="ApexStore Home"
            >
              <span className="font-bold text-xl tracking-tight text-[#F5F7FA]">
                APEX<span className="text-indigo-400 font-semibold">STORE</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium" aria-label="Primary navigation">
              <a
                href="/#categories"
                className="text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors focus:outline-none focus-visible:text-[#F5F7FA]"
              >
                Categories
              </a>
              <Link
                to="/products"
                className="text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors focus:outline-none focus-visible:text-[#F5F7FA]"
              >
                Products
              </Link>
            </nav>
          </div>

          {/* Search Bar — Mathematically Centered Grid Item */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex justify-self-center w-[260px] lg:w-[360px] relative">
            <input
              type="text"
              name="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 py-1.5 text-xs bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#38404B] focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#747B87] absolute left-3 top-3 pointer-events-none" />
          </form>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 justify-self-end">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-[#A7ADB7] hover:text-[#F5F7FA] rounded-lg hover:bg-[#171B20] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-[#A7ADB7] hover:text-[#F5F7FA] rounded-lg hover:bg-[#171B20] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#252A31] bg-[#111418] hover:bg-[#171B20] hover:border-[#38404B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <User className="w-3.5 h-3.5 text-[#A7ADB7]" />
                  <span className="text-xs font-medium text-[#F5F7FA] max-w-[90px] truncate">
                    {user?.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#747B87]" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-[#111418] rounded-xl shadow-xl border border-[#252A31] py-2 z-20">
                      <div className="px-4 py-2 border-b border-[#252A31]">
                        <p className="text-xs font-semibold text-[#F5F7FA] truncate">{user?.username}</p>
                        <p className="text-[11px] text-[#A7ADB7] truncate">{user?.email}</p>
                        {isStaff && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 text-[10px] font-medium rounded">
                            Staff Account
                          </span>
                        )}
                      </div>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#A7ADB7] hover:text-[#F5F7FA] hover:bg-[#171B20] font-medium"
                      >
                        <PackageCheck className="w-4 h-4 text-[#747B87]" /> My Orders
                      </Link>

                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#A7ADB7] hover:text-[#F5F7FA] hover:bg-[#171B20] font-medium"
                      >
                        <MapPin className="w-4 h-4 text-[#747B87]" /> Saved Addresses
                      </Link>

                      {isStaff && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-indigo-400 font-semibold hover:bg-indigo-950/40"
                        >
                          <Shield className="w-4 h-4 text-indigo-400" /> Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-[#252A31] mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="h-9 px-3.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 md:hidden">
            <Link
              to="/wishlist"
              className="relative p-2 text-[#A7ADB7] hover:text-[#F5F7FA] rounded-lg hover:bg-[#171B20] transition-colors focus:outline-none"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative p-2 text-[#A7ADB7] hover:text-[#F5F7FA] rounded-lg hover:bg-[#171B20] transition-colors focus:outline-none"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A7ADB7] hover:text-[#F5F7FA] rounded-lg hover:bg-[#171B20] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252A31] bg-[#111418] px-4 pt-3 pb-6 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              name="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#171B20] text-[#F5F7FA] border border-[#252A31] rounded-lg focus:border-[#3B424E] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#747B87] absolute left-3 top-3.5" />
          </form>

          <div className="space-y-1 pt-1">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5F7FA] hover:bg-[#171B20]"
            >
              Browse All Products
            </Link>
            <a
              href="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#A7ADB7] hover:text-[#F5F7FA] hover:bg-[#171B20]"
            >
              Shop by Category
            </a>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#F5F7FA] hover:bg-[#171B20]"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#A7ADB7]" /> Wishlist
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 bg-[#171B20] text-[#A7ADB7] border border-[#252A31] text-xs font-semibold rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#F5F7FA] hover:bg-[#171B20]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" /> Cart
              </div>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-xs font-semibold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#A7ADB7] hover:bg-[#171B20]"
                >
                  <PackageCheck className="w-4 h-4 text-[#747B87]" /> My Orders
                </Link>
                <Link
                  to="/addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#A7ADB7] hover:bg-[#171B20]"
                >
                  <MapPin className="w-4 h-4 text-[#747B87]" /> Saved Addresses
                </Link>
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-400 hover:bg-indigo-950/40"
                  >
                    <Shield className="w-4 h-4 text-indigo-400" /> Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="border-t border-[#252A31] pt-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({user?.username})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-[#F5F7FA] bg-[#171B20] border border-[#252A31] rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


