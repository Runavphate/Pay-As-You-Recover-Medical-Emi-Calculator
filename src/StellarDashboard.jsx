import React, { useState } from 'react';
import { useStellar } from './hooks/useStellar';

const StellarDashboard = () => {
  const { address, balance, connect, disconnect, sendXLM, loading, status } = useStellar();
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Stellar Testnet</h2>

      {!address ? (
        <button 
          onClick={connect}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
        >
          Connect Freighter
        </button>
      ) : (
        <div className="space-y-6">
          {/* Balance Display */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 font-medium">Your Balance</p>
            <h3 className="text-3xl font-bold text-blue-900">{balance} XLM</h3>
            <p className="text-xs text-gray-500 mt-2 truncate">ID: {address}</p>
            <button onClick={disconnect} className="text-xs text-red-500 mt-1 hover:underline">Disconnect</button>
          </div>

          {/* Transaction Form */}
          <div className="space-y-4">
            <input 
              type="text" placeholder="Destination Address (G...)"
              className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setDest(e.target.value)}
            />
            <input 
              type="number" placeholder="Amount in XLM"
              className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button 
              disabled={loading}
              onClick={() => sendXLM(dest, amount)}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Processing...' : 'Send Payment'}
            </button>
          </div>

          {/* Feedback Section */}
          {status.message && (
            <div className={`p-3 rounded-lg text-xs font-mono ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {status.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StellarDashboard;