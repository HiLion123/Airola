
import React, { useState, useEffect } from 'react';
import { Page, User } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Info, Briefcase, User as UserIcon, Phone } from 'lucide-react';
import { db } from '../db';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminDetected, setIsAdminDetected] = useState(false);
  const [error, setError] = useState('');

  // Special Admin Credential
  const ADMIN_EMAIL = 'admin@airola.co.uk';
  const ADMIN_PASSWORD = 'admin'; // You can change this to any secure password

  useEffect(() => {
    setIsAdminDetected(email.toLowerCase() === ADMIN_EMAIL);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // Handle Signup
        if (email.toLowerCase() === ADMIN_EMAIL) {
          setError('This email is reserved for administrative use.');
          return;
        }

        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
          setError('An account with this email already exists.');
          return;
        }

        const newUser: User = {
          name,
          email,
          phone,
          password,
          isLoggedIn: true,
          role: 'owner'
        };

        await db.saveUser(newUser);
        onLogin(newUser);
      } else {
        // Handle Login
        // 1. Check Admin
        if (email.toLowerCase() === ADMIN_EMAIL) {
          if (password === ADMIN_PASSWORD) {
            const adminUser: User = {
              name: 'Airola Provider',
              email: ADMIN_EMAIL,
              isLoggedIn: true,
              role: 'admin'
            };
            onLogin(adminUser);
            return;
          } else {
            setError('Invalid administrative credentials.');
            return;
          }
        }

        // 2. Check regular user
        const user = await db.findUserByEmail(email);
        if (user && user.password === password) {
          const loggedInUser: User = { ...user, isLoggedIn: true };
          onLogin(loggedInUser);
        } else {
          setError('Invalid email or password.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An error occurred during authentication.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border transition-all duration-500 ${isAdminDetected ? 'border-[rgb(172,216,206)] ring-4 ring-[rgb(235,247,244)]' : 'border-slate-100'}`}>
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-6 transition-all duration-500 ${isAdminDetected ? 'bg-[rgb(61,141,122)] text-white' : 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)]'}`}>
              {isAdminDetected ? <Briefcase className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isAdminDetected ? 'Provider Access' : isSignUp ? 'Join Airola' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isAdminDetected 
                ? 'Authorized personnel only. Managing UK Operations.' 
                : isSignUp 
                  ? 'Start automating your turnover management' 
                  : 'Securely log in to manage your portfolio'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && !isAdminDetected && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                      required={isSignUp}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                      required={isSignUp}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isAdminDetected ? 'text-[rgb(235,247,244)]0' : 'text-slate-300'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                {!isSignUp && (
                  <button type="button" className="text-xs font-bold text-[rgb(61,141,122)] hover:text-[rgb(45,110,95)] hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isAdminDetected ? 'text-[rgb(235,247,244)]0' : 'text-slate-300'}`} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[rgb(61,141,122)] transition-colors focus:outline-none p-1 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center ${
                isAdminDetected 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-[rgb(204,236,229)] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]' 
                  : 'bg-[rgb(61,141,122)] text-white hover:bg-[rgb(45,110,95)] shadow-[rgb(204,236,229)] hover:shadow-[0_0_20px_rgba(61,141,122,0.7)]'
              }`}
            >
              {isAdminDetected ? 'Access Command Center' : isSignUp ? 'Create Account' : 'Secure Login'} 
              <ArrowRight className="ml-3 w-5 h-5" />
            </button>
          </form>

          {!isAdminDetected && (
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                {isSignUp ? 'Already a Host?' : "New to Airola?"}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="ml-2 font-black text-[rgb(61,141,122)] hover:text-[rgb(45,110,95)] uppercase tracking-widest text-xs hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center flex items-center justify-center space-x-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured by Airola UK Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
