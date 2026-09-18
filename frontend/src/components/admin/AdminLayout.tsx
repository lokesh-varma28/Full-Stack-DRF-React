import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Layers, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product', path: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA]">
      {/* Top Operations Nav Header */}
      <header className="sticky top-0 z-30 bg-[#111418] border-b border-[#252A31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left Brand / Operational Context */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-[#747B87] hover:text-[#F5F7FA] text-xs font-medium transition-colors"
                title="Return to Customer Storefront"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
              <span className="text-[#252A31]">|</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6366F1]" />
                <span className="text-xs font-bold tracking-wide uppercase text-[#F5F7FA]">
                  Admin Control Panel
                </span>
              </div>
            </div>

            {/* Right Staff Info */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#747B87] hidden md:inline">
                Operator: <span className="text-[#A7ADB7] font-semibold">{user?.username || 'Staff'}</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 rounded">
                LIVE OPS
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 border-t border-[#252A31]/60 pt-1 -mb-px overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? 'border-[#6366F1] text-[#F5F7FA] bg-[#171B20]/80'
                      : 'border-transparent text-[#A7ADB7] hover:text-[#F5F7FA] hover:bg-[#171B20]/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#6366F1]' : 'text-[#747B87]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};
