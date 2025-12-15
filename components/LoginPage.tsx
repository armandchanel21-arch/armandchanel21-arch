import React, { useState } from 'react';
import { Bot, ArrowRight, Lock, Mail, ShieldCheck, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans text-white px-6">
      
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gaming-900 to-black pointer-events-none"></div>

      <div className="w-full max-w-sm z-10 flex flex-col">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-gaming-800 rounded-2xl flex items-center justify-center border border-gaming-700 mb-4 shadow-xl">
            <Bot size={32} className="text-gaming-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bot X <span className="text-gaming-accent">Pro</span>
          </h1>
          <p className="text-gaming-500 text-xs font-medium uppercase tracking-widest mt-1">Mobile Trading Intelligence</p>
        </div>

        {/* Card */}
        <div className="space-y-6">
           {/* Toggle */}
           <div className="flex p-1 bg-gaming-900 rounded-lg border border-gaming-800">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${isLogin ? 'bg-gaming-800 text-white shadow-sm' : 'text-gaming-500 hover:text-gray-300'}`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${!isLogin ? 'bg-gaming-800 text-white shadow-sm' : 'text-gaming-500 hover:text-gray-300'}`}
              >
                REGISTER
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 text-gaming-500" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    id="email"
                    autoComplete="username"
                    required 
                    className="w-full bg-gaming-900 border border-gaming-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all placeholder-gaming-600"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 text-gaming-500" size={18} />
                  <input 
                    type="password" 
                    name="password"
                    id="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required 
                    className="w-full bg-gaming-900 border border-gaming-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all placeholder-gaming-600"
                    placeholder="Password"
                  />
                </div>
              </div>

              {!isLogin && (
                 <div className="flex items-start gap-2 pt-2 px-1">
                    <ShieldCheck size={14} className="text-gaming-accent shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gaming-500 leading-tight">
                        I agree to the Terms of Service.
                    </p>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={18} />
                    </>
                )}
              </button>
           </form>

           <div className="flex justify-center items-center gap-2 mt-6 opacity-60">
               <Shield size={12} className="text-gaming-accent" />
               <span className="text-[10px] font-mono text-gaming-600 uppercase">SHA-256 Encrypted Connection</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;