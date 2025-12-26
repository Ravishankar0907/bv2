import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { Button } from '../components/UI';
import { Shield, User, Facebook, Mail, Loader2 } from 'lucide-react';

import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

const Login: React.FC<{ onLoginSuccess: (role?: Role) => void }> = ({ onLoginSuccess }) => {
  const { login, register } = useStore();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'social'>('social');

  const handleEmailAuth = async () => {
    if (!email || !password) {
      alert("Please enter all fields");
      return;
    }

    if (authMode === 'register') {
      if (!name) {
        alert("Please enter your name");
        return;
      }
      const success = await register(name, email, password);
      // Register calls login internally, but we can't easily get the user object back from register currently (returns boolean).
      // But for NEW registration, role is always Role.USER.
      if (success) onLoginSuccess(Role.USER);
    } else {
      const user = await login(email, Role.USER, undefined, password);
      if (user) onLoginSuccess(user.role);
    }
  };

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      alert("Please enter email and password");
      return;
    }
    const user = await login(adminEmail, Role.ADMIN, undefined, adminPassword);
    if (user) {
      onLoginSuccess(user.role);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Facebook') => {
    setSocialLoading(provider);

    if (provider === 'Google') {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (user.email) {
          // Determine if we need to login or register (store handles this 'social' logic safely)
          // We pass 'Google' as provider so StoreContext knows to create user if missing
          const contextUser = await login(user.email, Role.USER, 'Google');
          if (contextUser) onLoginSuccess(contextUser.role);
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert("Google Sign-In failed. Please try again.");
      } finally {
        setSocialLoading(null);
      }
    } else {
      // Facebook fallback (simulated for now, or add Firebase Facebook provider later)
      setTimeout(async () => {
        const contextUser = await login(`${provider.toLowerCase()}@example.com`, Role.USER, provider);
        setSocialLoading(null);
        if (contextUser) onLoginSuccess(contextUser.role);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-violet-400">
          Welcome to BattleVault
        </h1>
        <p className="text-slate-400 max-w-md">
          Sign in to access premium gaming gear.
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-dark-card p-8 rounded-2xl border border-slate-700/50 hover:border-brand-500/50 transition-colors flex flex-col items-center gap-6 text-center shadow-xl">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500">
            <User size={32} />
          </div>
          <h3 className="text-xl font-semibold">Sign In</h3>

          {/* Social Login Section */}
          <div className="w-full space-y-3">
            <button
              onClick={() => handleSocialLogin('Google')}
              disabled={!!socialLoading}
              className="w-full bg-white text-gray-800 hover:bg-gray-100 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {socialLoading === 'Google' ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          <div className="relative py-2 w-full">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-dark-card px-2 text-slate-500">Or using email</span></div>
          </div>

          {/* Email Login Form */}
          <div className="w-full space-y-4 animate-fadeIn">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
            />

            <Button onClick={handleEmailAuth} className="w-full py-3">
              <Mail size={18} className="mr-2" />
              {authMode === 'register' ? 'Create Account' : 'Sign In'}
            </Button>

            <div className="flex justify-center text-sm pt-2">
              <span className="text-slate-400">
                {authMode === 'register' ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                className="text-brand-400 hover:text-brand-300 ml-2 font-medium"
              >
                {authMode === 'register' ? "Log In" : "Sign Up"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;