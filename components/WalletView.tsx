import React, { useState } from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History, DollarSign, ShieldCheck, Loader2, CheckCircle, Lock } from 'lucide-react';

const WalletView: React.FC = () => {
  const [balance, setBalance] = useState(14250.80);
  const [depositAmount, setDepositAmount] = useState('');
  const [method, setMethod] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<'processing' | 'success'>('processing');

  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
        // Use a simple native alert for validation if needed, or better, just return
        alert("Please enter a valid amount.");
        return;
    }
    if (!method) {
        alert("Please select a deposit method.");
        return;
    }

    // Start Simulation
    setShowModal(true);
    setModalState('processing');
    
    // Simulate API/Bank delay (2.5 seconds)
    setTimeout(() => {
        setModalState('success');
        setBalance(prev => prev + Number(depositAmount));
    }, 2500);
  };

  const closeModal = () => {
      setShowModal(false);
      // Reset form only on success
      if (modalState === 'success') {
          setDepositAmount('');
          setMethod('');
      }
  };

  return (
    <div className="h-full p-6 overflow-y-auto custom-scrollbar animate-fade-in relative">
        <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
            <Wallet className="text-gaming-accent" size={28} />
            Wallet & Transfers
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="lg:col-span-3 bg-gradient-to-r from-gaming-900 to-gaming-800 border border-gaming-700 rounded-xl p-6 relative overflow-hidden shadow-xl">
                 <div className="absolute right-0 top-0 p-32 bg-gaming-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                 <div className="relative z-10">
                     <div className="text-gaming-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-gaming-accent" /> Total Available Equity
                     </div>
                     <div className="text-5xl font-black text-white font-mono tracking-tighter">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                     <div className="flex gap-6 mt-6">
                        <div className="flex items-center gap-2 text-xs text-gaming-400 font-mono">
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> USDT: ${(balance * 0.82).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gaming-400 font-mono">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div> FIAT: ${(balance * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                     </div>
                 </div>
            </div>

            {/* Deposit Section */}
            <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-6 shadow-lg lg:col-span-2">
                <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <ArrowDownLeft className="text-gaming-accent" size={16} /> Fund Account
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gaming-500 uppercase mb-1.5 ml-1">Payment Method</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 text-gaming-500 pointer-events-none" size={16} />
                                <select 
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full bg-gaming-950 border border-gaming-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none appearance-none transition-colors cursor-pointer hover:border-gaming-600"
                                >
                                    <option value="">Select Method...</option>
                                    <option value="usdt">USDT Transfer (TRC20/ERC20)</option>
                                    <option value="card">Credit Card (Visa/Mastercard)</option>
                                    <option value="bank">Bank Wire Transfer</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gaming-500 uppercase mb-1.5 ml-1">Amount (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gaming-500 pointer-events-none" size={16} />
                                <input 
                                    type="number" 
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="Amount USD"
                                    min="0"
                                    className="w-full bg-gaming-950 border border-gaming-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent outline-none placeholder-gaming-700 font-mono transition-colors hover:border-gaming-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end">
                        <button 
                            onClick={handleDeposit}
                            className="w-full bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black py-3 rounded-lg text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 h-[46px]"
                        >
                            Deposit Now
                        </button>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gaming-600 mt-3">
                            <Lock size={12} /> 
                            <span>Secure 256-bit Encrypted Transaction</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Section */}
            <div className="bg-gaming-800 border border-gaming-700 rounded-xl p-6 shadow-lg flex flex-col">
                 <h3 className="text-sm font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <ArrowUpRight className="text-gaming-danger" size={16} /> Withdraw
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-gaming-700 rounded-lg bg-gaming-900/30 text-center">
                    <Wallet size={32} className="text-gaming-600 mb-3" />
                    <p className="text-xs text-gaming-500 mb-4 px-4 leading-relaxed">
                        Withdrawals are processed to your linked bank account or crypto wallet within 24 hours.
                    </p>
                    <button className="px-6 py-2 bg-gaming-700 hover:bg-gaming-600 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-gaming-600 uppercase tracking-wide">
                        Request Withdrawal
                    </button>
                </div>
            </div>
            
            {/* Transaction History */}
            <div className="lg:col-span-3 bg-gaming-800 border border-gaming-700 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-gaming-700 bg-gaming-900/50 flex items-center gap-2">
                    <History size={16} className="text-gaming-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gaming-900 text-gaming-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-3 pl-4">Type</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-right pr-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gaming-700 text-gray-300">
                            <tr className="hover:bg-gaming-700/50 transition-colors">
                                <td className="p-3 pl-4"><span className="text-gaming-accent font-bold flex items-center gap-1"><ArrowDownLeft size={12} /> Deposit</span></td>
                                <td className="p-3">USDT (TRC20)</td>
                                <td className="p-3">Oct 24, 2023 14:30</td>
                                <td className="p-3 text-right font-mono font-bold text-white">+$5,000.00</td>
                                <td className="p-3 text-right pr-4"><span className="px-2 py-0.5 rounded-full bg-green-500/10 text-gaming-accent border border-green-500/20 text-[9px] font-bold uppercase">Completed</span></td>
                            </tr>
                            <tr className="hover:bg-gaming-700/50 transition-colors">
                                <td className="p-3 pl-4"><span className="text-gaming-danger font-bold flex items-center gap-1"><ArrowUpRight size={12} /> Withdrawal</span></td>
                                <td className="p-3">Bank Wire</td>
                                <td className="p-3">Oct 10, 2023 09:15</td>
                                <td className="p-3 text-right font-mono font-bold text-white">-$1,200.00</td>
                                <td className="p-3 text-right pr-4"><span className="px-2 py-0.5 rounded-full bg-green-500/10 text-gaming-accent border border-green-500/20 text-[9px] font-bold uppercase">Completed</span></td>
                            </tr>
                            <tr className="hover:bg-gaming-700/50 transition-colors">
                                <td className="p-3 pl-4"><span className="text-gaming-accent font-bold flex items-center gap-1"><ArrowDownLeft size={12} /> Deposit</span></td>
                                <td className="p-3">Credit Card</td>
                                <td className="p-3">Sep 28, 2023 18:45</td>
                                <td className="p-3 text-right font-mono font-bold text-white">+$500.00</td>
                                <td className="p-3 text-right pr-4"><span className="px-2 py-0.5 rounded-full bg-green-500/10 text-gaming-accent border border-green-500/20 text-[9px] font-bold uppercase">Completed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- SIMULATION MODAL OVERLAY --- */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                <div className="bg-gaming-900 border border-gaming-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gaming-accent to-transparent"></div>

                    {modalState === 'processing' ? (
                        <div className="flex flex-col items-center py-4">
                            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-wider animate-pulse">Processing Deposit...</h3>
                            
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-gaming-accent/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 size={64} className="text-gaming-accent animate-spin relative z-10" strokeWidth={1.5} />
                            </div>
                            
                            <p className="text-gray-300 font-bold mb-2">Verifying transaction with banking partner...</p>
                            <small className="text-gaming-500 text-xs">(This usually takes under a minute)</small>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4 animate-fade-in">
                             <div className="w-20 h-20 bg-gaming-accent/10 rounded-full flex items-center justify-center mb-6 border border-gaming-accent/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                <CheckCircle size={40} className="text-gaming-accent" strokeWidth={2.5} />
                             </div>
                             
                             <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Success!</h3>
                             
                             <div className="bg-gaming-950/50 border border-gaming-800 rounded-lg p-3 w-full mb-6">
                                <p className="text-gaming-400 text-sm mb-1 uppercase tracking-wide font-bold">Amount Added</p>
                                <p className="text-3xl text-white font-mono font-black tracking-tighter">
                                    ${Number(depositAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                             </div>

                             <button 
                                onClick={closeModal}
                                className="w-full py-3 bg-gaming-accent hover:bg-gaming-accentHover text-gaming-950 font-black rounded-lg text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-green-500/20"
                             >
                                Continue Trading
                             </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}

export default WalletView;