import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, PackageCheck, MapPin, Heart, Shield, LogOut, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../stores/useToastStore';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isStaff, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info('You have logged out.');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Account Overview</h1>
        <p className="text-xs text-[#747B87] mt-1">Manage your account profile and quick settings</p>
      </div>

      <div className="bg-[#111418] p-8 rounded-xl border border-[#252A31] flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-xl bg-[#171B20] text-indigo-400 border border-[#252A31] font-bold text-3xl flex items-center justify-center shrink-0">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-[#F5F7FA]">{user?.username}</h2>
            {isStaff && (
              <span className="px-2.5 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 text-[10px] font-medium rounded">
                Staff User
              </span>
            )}
          </div>
          <p className="text-xs text-[#A7ADB7] flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5 text-[#747B87]" /> {user?.email}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center justify-center sm:justify-start gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified & Active Account
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-5 py-2.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/orders"
          className="p-6 bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#3B424E] hover:bg-[#171B20] transition-all space-y-3 block group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#171B20] border border-[#252A31] text-indigo-400 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F5F7FA] text-sm group-hover:text-indigo-400 transition-colors">My Orders</h3>
            <p className="text-xs text-[#747B87] mt-0.5">Track active orders & history</p>
          </div>
        </Link>

        <Link
          to="/addresses"
          className="p-6 bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#3B424E] hover:bg-[#171B20] transition-all space-y-3 block group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#171B20] border border-[#252A31] text-indigo-400 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F5F7FA] text-sm group-hover:text-indigo-400 transition-colors">Saved Addresses</h3>
            <p className="text-xs text-[#747B87] mt-0.5">Manage delivery addresses</p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-6 bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#3B424E] hover:bg-[#171B20] transition-all space-y-3 block group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#171B20] border border-[#252A31] text-rose-400 flex items-center justify-center group-hover:border-rose-500/50 transition-colors">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F5F7FA] text-sm group-hover:text-indigo-400 transition-colors">Saved Wishlist</h3>
            <p className="text-xs text-[#747B87] mt-0.5">View your saved items</p>
          </div>
        </Link>
      </div>

      {isStaff && (
        <div className="bg-[#171B20] border border-[#252A31] rounded-xl p-6 sm:p-8 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-[#F5F7FA] text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Admin & Staff Portal
            </h3>
            <p className="text-xs text-[#A7ADB7]">
              Manage product listings, categories, inventory, and staff operations.
            </p>
          </div>
          <Link
            to="/admin"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shrink-0 transition-all"
          >
            Access Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
};

