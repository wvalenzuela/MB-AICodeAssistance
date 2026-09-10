import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Landmark, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, displayName: string) => void;
  defaultEmail?: string;
  onShowToast?: (message: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = 'waldo.valenzuela.pinilla@gmail.com',
  onShowToast,
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const namePart = email.split('@')[0];
      const displayName = namePart
        .split('.')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      onLoginSuccess(email, displayName);
      onShowToast?.(`Signed in successfully as ${displayName}`);
      onClose();
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header with Medical-Blocks brand styling */}
        <div className="bg-[#00486b] text-white px-6 py-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Landmark className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Medical-Blocks Auth</h2>
              <p className="text-xs text-white/80">Clinical workstation sign-in & JWT access</p>
            </div>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-zinc-800">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700">
              User Email / Identity
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-zinc-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@medicalblocks.ai"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486b] focus:border-transparent transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700">
                Password / Key
              </label>
              <button
                type="button"
                onClick={() => onShowToast?.('Password reset instructions sent to domain administrator.')}
                className="text-[11px] text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-zinc-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486b] focus:border-transparent transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Node Target */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-[#00486b] focus:ring-[#00486b]"
              />
              <span className="text-xs text-zinc-600">Keep session active</span>
            </label>

            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Cluster: TLS 1.3
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#00486b] hover:bg-[#003854] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Credentials hint */}
          <div className="pt-2 text-center text-[11px] text-zinc-400">
            For testing: any password works with your email.
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
