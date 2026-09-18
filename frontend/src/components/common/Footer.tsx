import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111418] text-[#A7ADB7] border-t border-[#252A31]">
      {/* Main Footer Content */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
        <div className="sm:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-[#F5F7FA] tracking-tight">
              APEX<span className="text-indigo-400 font-semibold">STORE</span>
            </span>
          </div>
          <p className="text-xs text-[#747B87] leading-relaxed max-w-sm font-normal">
            ApexStore is a modern ecommerce platform built for discerning shoppers. Discover curated top-tier products across electronics and home goods.
          </p>
        </div>

        <div>
          <h5 className="text-[#F5F7FA] font-semibold text-xs uppercase tracking-wider mb-3.5">Quick Links</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Browse Products</Link></li>
            <li><Link to="/cart" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Shopping Cart</Link></li>
            <li><Link to="/wishlist" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Wishlist</Link></li>
            <li><Link to="/orders" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Track Orders</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-[#F5F7FA] font-semibold text-xs uppercase tracking-wider mb-3.5">Account & Care</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/addresses" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Saved Addresses</Link></li>
            <li><Link to="/profile" className="text-[#747B87] hover:text-[#F5F7FA] transition-colors">Profile Settings</Link></li>
            <li><span className="text-[#747B87]">Privacy Policy</span></li>
            <li><span className="text-[#747B87]">Terms of Service</span></li>
          </ul>
        </div>

        <div>
          <h5 className="text-[#F5F7FA] font-semibold text-xs uppercase tracking-wider mb-3.5">Payment Methods</h5>
          <p className="text-[11px] text-[#747B87] mb-2.5">Secured with Razorpay:</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-[#171B20] text-[#A7ADB7] text-[10px] font-medium rounded border border-[#252A31]">UPI</span>
            <span className="px-2 py-0.5 bg-[#171B20] text-[#A7ADB7] text-[10px] font-medium rounded border border-[#252A31]">Credit Card</span>
            <span className="px-2 py-0.5 bg-[#171B20] text-[#A7ADB7] text-[10px] font-medium rounded border border-[#252A31]">Debit Card</span>
            <span className="px-2 py-0.5 bg-[#171B20] text-[#A7ADB7] text-[10px] font-medium rounded border border-[#252A31]">NetBanking</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#252A31] py-5 text-center text-xs text-[#747B87]">
        <p className="flex items-center justify-center gap-1.5">
          © {new Date().getFullYear()} ApexStore. Curated essentials with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </p>
      </div>
    </footer>
  );
};

