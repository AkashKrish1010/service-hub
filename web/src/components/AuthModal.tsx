import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'customer' | 'provider' | 'admin';
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'customer',
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'customer' | 'provider' | 'admin'>(
    initialMode === 'signup' && initialRole === 'admin' ? 'customer' : initialRole
  );

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialMode === 'signup' && initialRole === 'admin' ? 'customer' : initialRole);
    }
  }, [isOpen, initialRole, initialMode]);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    if (newMode === 'signup' && role === 'admin') {
      setRole('customer');
    }
  };
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter your name/email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login({ identifier, password, role });
      showToast(`Signed in successfully as ${role.toUpperCase()}!`, 'success');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      showToast('Please fill in your name, email, and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = signupPhone.trim()
        ? (signupPhone.trim().startsWith('+91') ? signupPhone.trim() : `+91 ${signupPhone.trim()}`)
        : '';
      const finalRole = role === 'admin' ? 'customer' : role;
      await register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: formattedPhone,
        password: signupPassword.trim(),
        role: finalRole,
      });
      showToast(
        finalRole === 'provider'
          ? 'Registration successful! Your provider profile will be reviewed by admin.'
          : 'Account created successfully! Welcome to Service Hub.',
        'success'
      );
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-floating border border-borderSubtle p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 mx-auto mb-3 shadow-md shadow-slate-100">
            <img src="/logo.png" alt="Service Hub Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access your verified dashboard and service orders'
              : 'Join the most reliable on-demand home service network'}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
          {(mode === 'login'
            ? (['customer', 'provider', 'admin'] as const)
            : (['customer', 'provider'] as const)
          ).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                role === r
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r === 'provider' && mode === 'signup' ? 'Service Provider' : r}
            </button>
          ))}
        </div>


        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Name or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your name or email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 text-slate-500 font-semibold text-xs pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700">+91</span>
                  <span className="text-slate-300">|</span>
                </div>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^\+91\s*/, '').replace(/[^\d\s-]/g, '');
                    setSignupPhone(clean);
                  }}
                  placeholder="98765 43210"
                  maxLength={12}
                  className="w-full pl-20 pr-4 py-2 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-borderSubtle bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </form>
        )}

        {/* Switch Mode Footer */}
        <div className="mt-5 text-center text-xs text-slate-500 border-t border-borderSubtle pt-4">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-primary font-bold hover:underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-primary font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
