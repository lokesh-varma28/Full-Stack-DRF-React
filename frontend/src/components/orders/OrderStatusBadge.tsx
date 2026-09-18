import React from 'react';
import { OrderStatus } from '../../types/order';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertOctagon, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const configs: Record<OrderStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    created: {
      label: 'Created',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    },
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    processing: {
      label: 'Processing',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
    },
    shipped: {
      label: 'Shipped',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      icon: <Truck className="w-3.5 h-3.5 text-indigo-600" />,
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-teal-50 border-teal-200',
      text: 'text-teal-700',
      icon: <PackageCheck className="w-3.5 h-3.5 text-teal-600" />,
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      icon: <XCircle className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const config = configs[status] || configs.created;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${config.bg} ${config.text}`}
    >
      {config.icon} {config.label}
    </span>
  );
};
