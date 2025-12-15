import React, { useState } from 'react';
import { Bot, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

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
    }, 1500);
  };

  return (
    <div className="h-screen w-screen bg-gaming-950 flex items-center justify-center relative overflow-hidden font-sans text-white">
      {/* Background FX */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gaming-accent/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #2A2A2A 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-md p-8 z-10 relative">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gaming-accent rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Bot size={40} className="text-gaming-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            BOT <span className="text-gaming-accent">X</span> AGENT
          </h1>
          <p className="text-gaming-500 text-sm font-medium tracking-widest uppercase">Automated Trading Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-gaming-900/80 backdrop-blur-xl border border-gaming-700 rounded-2xl p-8 shadow-2xl">
           <div className="flex gap-4 mb-8 border-b border-gaming-800 pb-1">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${isLogin ? 'text-gaming-accent border-gaming-accent' : 'text-gaming-500 border-transparent hover:text-white'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${!isLogin ? 'text-gaming-accent border-gaming-accent' : 'text-gaming-500 border-transparent hover:text-white'}`}
              >
                Sign Up
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gaming-500 uppercase tracking-wider pl-1">Email Access</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-gaming-600 group-focus-within:text-gaming-accent transition-colors" size={18} />
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-gaming-950 border border-gaming-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all placeholder-gaming-700"
                    placeholder="agent@botx.ai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gaming-500 uppercase tracking-wider pl-1">Secure Key</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-gaming-600 group-focus-within:text-gaming-accent transition-colors" size={18} />
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-gaming-950 border border-gaming-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all placeholder-gaming-700"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                 <div className="flex items-start gap-2 pt-2">
                    <div className="mt-0.5 text-gaming-accent">
                        <ShieldCheck size={14} />
                    </div>
                    <p className="text-[10px] text-gaming-500 leading-tight">
                        By registering, you agree to the Automated Trading Risk Disclosure and Terms of Service.
                    </p>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black py-3 rounded-lg text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gaming-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isLogin ? 'Initialize' : 'Create Agent'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>
           </form>
        </div>

        <div className="mt-8 flex justify-center gap-4 text-gaming-600">
            <span className="h-1 w-1 bg-gaming-700 rounded-full"></span>
            <span className="h-1 w-1 bg-gaming-700 rounded-full"></span>
            <span className="h-1 w-1 bg-gaming-700 rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;