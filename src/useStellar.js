import { useState, useEffect } from 'react';
import { isConnected, getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Asset, Operation, Networks } from "@stellar/stellar-sdk";

const SERVER_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(SERVER_URL);

export const useStellar = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // 1. Connection Logic
  const connect = async () => {
    try {
      if (!(await isConnected())) throw new Error("Freighter not found");
      const publicKey = await getPublicKey();
      setAddress(publicKey);
      fetchBalance(publicKey);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance("0");
    setStatus({ type: '', message: '' });
  };

  // 2. Fetch Balance
  const fetchBalance = async (publicKey) => {
    try {
      const account = await server.loadAccount(publicKey);
      const native = account.balances.find(b => b.asset_type === 'native');
      setBalance(native ? native.balance : "0");
    } catch (err) {
      setStatus({ type: 'error', message: "Account not active. Send Testnet XLM." });
    }
  };

  // 3. Transaction Logic
  const sendXLM = async (destination, amount) => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Building transaction...' });
    try {
      const account = await server.loadAccount(address);
      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination,
          asset: Asset.native(),
          amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();
      const signedXDR = await signTransaction(xdr, { network: "TESTNET" });
      
      const result = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
      );

      setStatus({ type: 'success', message: `Sent! Hash: ${result.hash.substring(0, 8)}...` });
      fetchBalance(address); // Refresh balance
    } catch (err) {
      setStatus({ type: 'error', message: "Transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  return { address, balance, connect, disconnect, sendXLM, loading, status };
};