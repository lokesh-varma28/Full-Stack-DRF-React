import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertCircle } from 'lucide-react';
import { Address, AddressInput } from '../../types/address';
import { normalizeError } from '../../utils/error';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressInput) => Promise<void>;
  initialData?: Address | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setPhone(initialData.phone || '');
      setAddressLine(initialData.address_line || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setPostalCode(initialData.postal_code || '');
      setCountry(initialData.country || 'India');
      setIsDefault(initialData.is_default || false);
    } else {
      setFullName('');
      setPhone('');
      setAddressLine('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('India');
      setIsDefault(false);
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (postalCode.length !== 6 || !/^\d+$/.test(postalCode)) {
      setErrorMessage('Postal code must be a 6-digit number.');
      return;
    }

    if (phone.length < 10 || phone.length > 15 || !/^\d+$/.test(phone)) {
      setErrorMessage('Phone number must contain between 10 and 15 digits.');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim() || 'India',
        is_default: isDefault,
      });
      onClose();
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07080A]/80 backdrop-blur-xs">
      <div className="bg-[#111418] rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#252A31] space-y-6 relative max-h-[90vh] overflow-y-auto text-[#F5F7FA]">
        <div className="flex items-center justify-between border-b border-[#252A31] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#F5F7FA] text-lg">
              {initialData ? 'Edit Address' : 'Add New Address'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#747B87] hover:text-[#F5F7FA] hover:bg-[#171B20] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-lg flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lokesh Varma"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
              Address Line *
            </label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat 102, Sunrise Apartments, Main Road"
              className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Hyderabad"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Telangana"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                Postal Code (6 digits) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                placeholder="500001"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="w-full px-3.5 py-2.5 bg-[#171B20] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-lg text-xs focus:outline-none focus:border-[#3B424E]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#F5F7FA]">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-500 rounded border-[#252A31] bg-[#171B20] focus:ring-indigo-500"
              />
              Set as default shipping address
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#252A31]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#171B20] hover:bg-[#20252D] text-[#A7ADB7] border border-[#252A31] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

