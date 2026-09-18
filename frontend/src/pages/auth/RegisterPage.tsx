import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';
import { PasswordInput } from '../../components/common/PasswordInput';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    setLoading(true);

    try {
      const res = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      toast.success(res.message || 'Registration successful. OTP sent to your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      const normalized = normalizeError(err);
      setErrorMessage(normalized.message);
      if (normalized.fieldErrors) {
        setFieldErrors(normalized.fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#111418] p-8 sm:p-10 rounded-2xl shadow-2xl border border-[#252A31]">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#747B87]">
            Join ApexStore and start shopping today
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
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose_username"
                autoComplete="username"
                className={`w-full pl-10 pr-4 py-3 bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border ${
                  fieldErrors.username
                    ? 'border-rose-500/70 bg-rose-950/20'
                    : 'border-[#252A31]'
                } rounded-xl text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/50 transition-colors`}
              />
              <User className="w-4 h-4 text-[#747B87] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.username}</p>
            )}
          </div>

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
                className={`w-full pl-10 pr-4 py-3 bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border ${
                  fieldErrors.email
                    ? 'border-rose-500/70 bg-rose-950/20'
                    : 'border-[#252A31]'
                } rounded-xl text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/50 transition-colors`}
              />
              <Mail className="w-4 h-4 text-[#747B87] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7ADB7] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              hasError={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Register & Send OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#252A31]">
          <p className="text-xs text-[#747B87]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

