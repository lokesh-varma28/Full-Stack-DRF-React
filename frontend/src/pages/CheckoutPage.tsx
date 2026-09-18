import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Plus, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { useOrders } from '../hooks/useOrders';
import { useProduct } from '../hooks/useProducts';
import { loadRazorpayScript } from '../lib/razorpay';
import { AddressModal } from '../components/address/AddressModal';
import { AddressInput } from '../types/address';
import { formatCurrency } from '../utils/formatters';
import { normalizeError } from '../utils/error';
import { toast } from '../stores/useToastStore';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if Buy Now mode
  const directProductId = searchParams.get('direct_product')
    ? parseInt(searchParams.get('direct_product')!, 10)
    : null;
  const directQuantity = searchParams.get('quantity')
    ? parseInt(searchParams.get('quantity')!, 10)
    : 1;

  const { cart } = useCart();
  const { product: directProduct } = useProduct(directProductId);
  const { addresses, defaultAddress, createAddress, isLoading: addressesLoading } = useAddresses();
  const { createOrder, buyNow, verifyPayment } = useOrders();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    defaultAddress?.id || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  // Sync default address ID when loaded
  React.useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, selectedAddressId]);

  // Determine items and total price
  const isDirect = !!directProductId && !!directProduct;
  const cartItems = cart?.items || [];

  if (!isDirect && cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#F5F7FA]">Your Cart is Empty</h2>
        <p className="text-xs text-[#747B87]">Please add items to your cart before proceeding to checkout.</p>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const subtotal = isDirect
    ? (typeof directProduct.price === 'string' ? parseFloat(directProduct.price) : directProduct.price) *
      directQuantity
    : typeof cart?.total_price === 'string'
    ? parseFloat(cart.total_price)
    : cart?.total_price || 0;

  const handleCreateAddress = async (data: AddressInput) => {
    const newAddr = await createAddress(data);
    if (newAddr.data) {
      setSelectedAddressId(newAddr.data.id);
    }
    toast.success('Address created successfully!');
  };

  const handlePayWithRazorpay = async () => {
    setErrorMessage(null);

    if (!selectedAddressId) {
      setErrorMessage('Please select or add a delivery address to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Order on Backend
      const checkoutRes = isDirect
        ? await buyNow({
            product_id: directProductId,
            quantity: directQuantity,
            address_id: selectedAddressId,
          })
        : await createOrder({ address_id: selectedAddressId });

      const checkoutData = checkoutRes.data;
      if (!checkoutData) {
        throw new Error('Failed to initialize checkout payload from server.');
      }

      // Step 2: Load Razorpay SDK Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      // Step 3: Open Razorpay Popup
      const options = {
        key: checkoutData.razorpay_key_id,
        amount: checkoutData.amount,
        currency: checkoutData.currency || 'INR',
        name: 'ApexStore',
        description: `Payment for Order #${checkoutData.order_id}`,
        order_id: checkoutData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Step 4: Verify Payment Signature on Backend
            const verifiedOrder = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment verified successfully!', 'Order Placed');
            navigate(`/order-success/${verifiedOrder.data?.id || checkoutData.order_id}`);
          } catch (verifyErr: any) {
            const normalized = normalizeError(verifyErr);
            toast.error(normalized.message, 'Payment Verification Failed');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: addresses.find((a) => a.id === selectedAddressId)?.full_name || '',
          contact: addresses.find((a) => a.id === selectedAddressId)?.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled by user.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#747B87] mt-1">Select delivery address and pay securely with Razorpay</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Address Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111418] p-6 sm:p-8 rounded-xl border border-[#252A31] space-y-6">
            <div className="flex items-center justify-between border-b border-[#252A31] pb-4">
              <h2 className="font-semibold text-[#F5F7FA] text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" /> Delivery Address
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {addressesLoading ? (
              <div className="h-24 bg-[#171B20] rounded-xl border border-[#252A31] animate-pulse" />
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-[#252A31] rounded-xl space-y-3">
                <p className="text-xs text-[#747B87]">No saved addresses found. Please add a shipping address.</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#252A31] bg-[#171B20] hover:border-[#3B424E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#F5F7FA] text-xs">{addr.full_name}</span>
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="w-4 h-4 text-indigo-500"
                      />
                    </div>
                    <p className="text-[11px] text-[#A7ADB7] leading-snug">{addr.address_line}</p>
                    <p className="text-[11px] text-[#A7ADB7]">
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-[11px] text-[#747B87] font-medium mt-1">Ph: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items Summary Box */}
          <div className="bg-[#111418] p-6 sm:p-8 rounded-xl border border-[#252A31] space-y-4">
            <h3 className="font-semibold text-[#F5F7FA] text-base">Items in Order</h3>
            {isDirect ? (
              <div className="flex items-center justify-between text-xs py-2">
                <div>
                  <span className="font-semibold text-[#F5F7FA]">{directProduct.name}</span>
                  <span className="text-[#747B87] ml-2">x {directQuantity}</span>
                </div>
                <span className="font-semibold text-[#F5F7FA]">{formatCurrency(subtotal)}</span>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-[#252A31] last:border-0">
                  <div>
                    <span className="font-semibold text-[#F5F7FA]">{item.product_name}</span>
                    <span className="text-[#747B87] ml-2">x {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-[#F5F7FA]">{formatCurrency(item.total_price)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary & Payment Button */}
        <div className="bg-[#111418] p-6 sm:p-8 rounded-xl border border-[#252A31] space-y-6 sticky top-24">
          <h2 className="font-bold text-[#F5F7FA] text-lg border-b border-[#252A31] pb-4">Payment Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#A7ADB7]">
              <span>Items Total</span>
              <span className="font-semibold text-[#F5F7FA]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#A7ADB7]">
              <span>Delivery Charges</span>
              <span className="font-semibold text-emerald-400 uppercase">FREE</span>
            </div>
            <div className="border-t border-[#252A31] pt-3 flex justify-between text-[#F5F7FA] font-bold text-base">
              <span>Total Payable</span>
              <span className="text-indigo-400">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayWithRazorpay}
            disabled={isProcessing || !selectedAddressId}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" /> Pay {formatCurrency(subtotal)} via Razorpay <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#747B87] font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant Razorpay Signature Verification
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateAddress}
      />
    </div>
  );
};

