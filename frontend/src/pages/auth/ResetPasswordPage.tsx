import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';
import { PasswordInput } from '../../components/common/PasswordInput';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email] = useState(searchParams.get('email') || '');
  const [resetToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !resetToken) {
      setErrorMessage('Invalid password reset link or missing parameters. Please start over.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        email,
        reset_token: resetToken,
        password,
        confirm_password: confirmPassword,
      });

      toast.success(res.message || 'Password reset successfully. You can now login.');
      navigate('/login');
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
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#747B87]">
            Set a new secure password for{' '}
            <span className="font-semibold text-[#F5F7FA]">{email}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 chars, 1 upper, 1 number"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <PasswordInput
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
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
                <CheckCircle2 className="w-4 h-4" /> Save New Password
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

