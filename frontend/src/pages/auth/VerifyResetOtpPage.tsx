import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';

export const VerifyResetOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMessage('OTP must be a 6-digit number.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.verifyPasswordResetOtp({ email: email.trim(), otp });
      const resetToken = res.data?.reset_token;

      if (resetToken) {
        toast.success('OTP verified. Please set your new password.');
        navigate(
          `/forgot-password/reset?email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(resetToken)}`
        );
      } else {
        setErrorMessage('Failed to obtain reset token.');
      }
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#111418] p-8 sm:p-10 rounded-2xl shadow-2xl border border-[#252A31]">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Verify Reset OTP
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#747B87]">
            Enter the 6-digit password reset code sent to your email
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleVerify}>
          <div>
            <label className="block text-xs font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-xl text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/50 transition-colors"
              />
              <Mail className="w-4 h-4 text-[#747B87] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1.5">
              6-Digit Reset OTP
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              className="w-full tracking-widest text-center py-3.5 bg-[#111418] border border-[#252A31] rounded-xl text-xl font-bold text-[#F5F7FA] placeholder:text-[#747B87] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Verify OTP & Continue
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#252A31]">
          <Link to="/login" className="text-xs font-semibold text-[#747B87] hover:text-[#F5F7FA] transition-colors">
            Cancel & Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
