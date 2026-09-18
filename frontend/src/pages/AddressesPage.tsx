import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, Star } from 'lucide-react';
import { useAddresses } from '../hooks/useAddresses';
import { AddressModal } from '../components/address/AddressModal';
import { Address, AddressInput } from '../types/address';
import { toast } from '../stores/useToastStore';

export const AddressesPage: React.FC = () => {
  const { addresses, isLoading, createAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddresses();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSave = async (data: AddressInput) => {
    if (editingAddress) {
      await updateAddress({ id: editingAddress.id, data });
      toast.success('Address updated successfully!');
    } else {
      await createAddress(data);
      toast.success('Address added successfully!');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast.info('Address deleted successfully.');
      } catch {
        toast.error('Failed to delete address.');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated!');
    } catch {
      toast.error('Failed to set default address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Saved Addresses</h1>
          <p className="text-xs text-[#747B87] mt-1">Manage your shipping and delivery addresses</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-[#111418] rounded-xl border border-[#252A31] p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 rounded-xl flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-[#F5F7FA] text-lg">No Addresses Found</h3>
          <p className="text-xs text-[#747B87] leading-relaxed">
            You haven't saved any delivery addresses yet. Add one now to speed up checkout!
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 bg-[#111418] rounded-xl border ${
                addr.is_default ? 'border-indigo-500 bg-indigo-950/20' : 'border-[#252A31]'
              } flex flex-col justify-between space-y-4 relative`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5F7FA] text-sm">{addr.full_name}</span>
                  {addr.is_default && (
                    <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-[10px] font-semibold rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-indigo-400" /> Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A7ADB7] leading-relaxed">{addr.address_line}</p>
                <p className="text-xs text-[#A7ADB7]">
                  {addr.city}, {addr.state} - {addr.postal_code}
                </p>
                <p className="text-xs text-[#747B87] font-medium">Phone: {addr.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#252A31] text-xs font-medium">
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Make Default
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-2 text-[#A7ADB7] hover:text-[#F5F7FA] hover:bg-[#171B20] rounded-lg"
                    title="Edit Address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-[#747B87] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingAddress}
      />
    </div>
  );
};

