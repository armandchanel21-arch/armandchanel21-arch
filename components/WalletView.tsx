import React, { useState } from 'react';
import { CreditCard, ArrowDownLeft, DollarSign, CheckCircle } from 'lucide-react';

const WalletView: React.FC = () => {
  const [balance, setBalance] = useState(14250.80);
  const [depositAmount, setDepositAmount] = useState('');
  const [method, setMethod] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleDeposit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    if (!method) return;

    // Instant update - no fake loading
    setBalance(prev => prev + Number(depositAmount));
    setDepositAmount('');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto custom-scrollbar animate-fade-in relative pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
             <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Wallet
            </h1>
            <div className="px-3 py-1 bg-gaming-900 rounded-full border border-gaming-800 text-[10px] text-gaming-500 font-mono">
                ID: 883-291-00
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Balance Card - Mobile Optimized */}
            <div className="lg:col-span-3 bg-gradient-to-br from-gaming-900 to-black border border-gaming-800 rounded-2xl p-6 relative overflow-hidden">
                 <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                     <div className="text-gaming-500 text-xs font-bold uppercase tracking-wider mb-2">Total Balance</div>
                     <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tighter mb-4">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                     <div className="flex gap-4 w-full justify-center md:justify-start">
                        <button className="flex-1 md:flex-none py-2.5 px-6 bg-white text-black rounded-lg text-sm font-bold shadow hover:bg-gray-200 transition-colors">
                            Deposit
                        </button>
                        <button className="flex-1 md:flex-none py-2.5 px-6 bg-gaming-800 text-white rounded-lg text-sm font-bold border border-gaming-700 hover:bg-gaming-700 transition-colors">
                            Withdraw
                        </button>
                     </div>
                 </div>
            </div>

            {/* Quick Deposit Form */}
            <div className="bg-gaming-900/50 border border-gaming-800 rounded-2xl p-5 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-bold text-white mb-4">Quick Fund</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3.5 text-gaming-500" size={16} />
                            <select 
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full bg-black border border-gaming-700 rounded-xl py-3 pl-10 pr-3 text-sm text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none appearance-none"
                            >
                                <option value="">Method...</option>
                                <option value="usdt">USDT (TRC20)</option>
                                <option value="card">Visa/Mastercard</option>
                            </select>
                        </div>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 text-gaming-500" size={16} />
                            <input 
                                type="number" 
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full bg-black border border-gaming-700 rounded-xl py-3 pl-10 pr-3 text-sm text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none font-mono"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleDeposit}
                        className="h-full min-h-[50px] bg-gaming-800 hover:bg-gaming-700 text-white font-bold rounded-xl text-sm border border-gaming-700 transition-all active:scale-95"
                    >
                        Confirm Transaction
                    </button>
                </div>
            </div>

            {/* Recent History */}
            <div className="lg:col-span-3">
                <h3 className="text-sm font-bold text-gaming-500 mb-3 ml-1 uppercase tracking-wider text-[10px]">Recent Activity</h3>
                <div className="bg-gaming-900/30 border border-gaming-800 rounded-2xl overflow-hidden">
                    {[1,2,3].map((_, i) => (
                        <div key={i} className="p-4 border-b border-gaming-800 last:border-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gaming-800 rounded-full text-white">
                                    <ArrowDownLeft size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Deposit USDT</div>
                                    <div className="text-[10px] text-gaming-500">Today, 14:30</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gaming-accent">+$500.00</div>
                                <div className="text-[10px] text-gaming-500">Completed</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Success Toast */}
        {showToast && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gaming-accent text-black px-6 py-3 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-fade-in z-50">
                <CheckCircle size={18} /> Fund Added Successfully
            </div>
        )}
    </div>
  );
}

export default WalletView;