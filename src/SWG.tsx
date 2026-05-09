import { useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Copy, X, Camera, Loader2, AlertCircle, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import signSolToken from './signSolToken';

type SolWalletProps = {
    mnemonic: string;
    network: string;
}
export const SolWallet = ({ mnemonic, network }: SolWalletProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    type Wallet = {
        address: string;
        balance: number;
        secretKey: string;
    }

    const [wallets, setWallets] = useState<Wallet[]>([]);

    const addWallet = () => {
        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/${currentIndex}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const keyPair = Keypair.fromSeed(derivedSeed);

        setWallets([...wallets, {
            address: keyPair.publicKey.toBase58(),
            balance: 0,
            secretKey: bs58.encode(keyPair.secretKey)
        }]);
        setCurrentIndex(currentIndex + 1);


    };

    const deleteWallet = (indexToDelete: number) => {
        setWallets(prev => prev.filter((_, idx) => idx !== indexToDelete));
    };



    const refreshBalance = async (address: string) => {
        const url = network === "mainnet" 
            ? `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
            : `https://solana-devnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        const payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [
                address
            ]
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        const balance = data.result.value;

        setWallets(prev =>
            prev.map(wallet =>
                wallet.address === address
                    ? { ...wallet, balance }
                    : wallet
            )
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-500">Solana</h2>
                <button
                    onClick={addWallet}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-500 transition-all active:scale-95"
                >
                    Add Wallet
                </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {wallets.map((wallet, i) => (
                    <SolWalletRow key={i} wallet={wallet} i={i} refreshBalance={refreshBalance} network={network} deleteWallet={deleteWallet} />
                ))}
                {wallets.length === 0 && (
                    <p className="text-slate-600 text-sm text-center py-4">No wallets generated yet.</p>
                )}
            </div>
        </div>
    );
}

const SolWalletRow = ({ wallet, i, refreshBalance, network, deleteWallet }: { wallet: any, i: number, refreshBalance: any, network: string, deleteWallet: any }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Modal states
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Send states
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [error, setError] = useState("");

    const copyToClipboard = () => {
        navigator.clipboard.writeText(wallet.address);
    };

    const handleSend = async () => {
        if (!toAddress || !amount) return;
        setError("");
        setTxHash("");
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Please enter a valid amount greater than 0.");
            return;
        }

        const solBalance = wallet.balance / 1_000_000_000;
        if (numAmount > solBalance) {
            setError(`Insufficient balance. You only have ${solBalance.toFixed(4)} SOL.`);
            return;
        }

        try {
            new PublicKey(toAddress);
        } catch (e) {
            setError("Invalid Solana address format.");
            return;
        }

        if (toAddress === wallet.address) {
            setError("You cannot send SOL to yourself.");
            return;
        }

        setIsSending(true);
        const result = await signSolToken(wallet.secretKey, toAddress, numAmount, network);
        if (result.success) {
            setTxHash(result.signature || "");
            setAmount(""); // Clear input on success
            refreshBalance(wallet.address);
        } else {
            setError(result.error || "Transaction failed");
        }
        setIsSending(false);
    };

    return (
        <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-colors duration-300">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account {i + 1}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Balance: {(wallet.balance / 1_000_000_000).toFixed(4)} SOL
                    </span>
                    <button
                        onClick={() => refreshBalance(wallet.address)}
                        className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 text-white"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => setDeleteOpen(true)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-400/10 p-1 rounded transition-colors"
                        title="Delete Wallet"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Public Key:</span>
                <span className="font-mono text-sm break-all text-slate-700 dark:text-slate-300">{wallet.address}</span>
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Secret Key:</span>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 uppercase font-bold transition-colors"
                    >
                        {isVisible ? "Hide" : "Reveal"}
                    </button>
                </div>
                <span className="font-mono text-sm break-all text-slate-700 dark:text-slate-300">
                    {isVisible ? wallet.secretKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                </span>
            </div>

            <div className="flex gap-3 mt-2">
                <button onClick={() => { setSendOpen(true); setError(""); setTxHash(""); setToAddress(""); setAmount(""); }} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition-all active:scale-95">Send</button>
                <button onClick={() => setReceiveOpen(true)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition-all active:scale-95">Receive</button>
            </div>

            {/* Receive Modal */}
            {receiveOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-sm flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="w-full flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Receive SOL</h3>
                            <button onClick={() => setReceiveOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <QRCodeSVG value={wallet.address} size={200} />
                        </div>
                        <div className="w-full flex flex-col gap-2 mt-4">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">Your Public Key</span>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span className="font-mono text-xs break-all text-slate-700 dark:text-slate-300 flex-1">{wallet.address}</span>
                                <button onClick={copyToClipboard} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-2 bg-slate-200 dark:bg-slate-700 rounded-md transition-colors" title="Copy">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Modal */}
            {sendOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send SOL {network === "mainnet" ? "(Mainnet)" : "(Devnet)"}</h3>
                            <button disabled={isSending} onClick={() => { setSendOpen(false); setIsScanning(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><X size={24} /></button>
                        </div>

                        {isScanning ? (
                            <div className="flex flex-col gap-2">
                                <div className="rounded-xl overflow-hidden aspect-square border border-slate-700 bg-black">
                                    <Scanner onScan={(result) => {
                                        setToAddress(result[0].rawValue);
                                        setIsScanning(false);
                                    }} />
                                </div>
                                <button onClick={() => setIsScanning(false)} className="text-sm text-slate-400 hover:text-white text-center mt-2">Cancel Scan</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Recipient Address</label>
                                    <div className="flex gap-2">
                                        <input
                                            disabled={isSending}
                                            value={toAddress}
                                            onChange={(e) => setToAddress(e.target.value)}
                                            placeholder="Paste or scan address"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <button disabled={isSending} onClick={() => setIsScanning(true)} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" title="Scan QR">
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Amount (SOL)</label>
                                    <input
                                        disabled={isSending}
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-xs text-slate-500">Balance: {(wallet.balance / 1_000_000_000).toFixed(4)} SOL</span>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg break-all">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                {txHash && (
                                    <div className="flex items-start gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 p-3 rounded-lg break-all">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold">Transaction Successful!</span>
                                            <span className="font-mono text-[10px] text-green-500">{txHash}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSend}
                                    disabled={isSending || !toAddress || !amount}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-2 flex justify-center items-center gap-2"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="animate-spin text-blue-200" size={20} />
                                            <span>Processing...</span>
                                        </>
                                    ) : "Confirm Send"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-red-500/30 dark:border-red-500/20 p-6 rounded-2xl w-full max-w-sm flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">Delete Account?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            Are you absolutely sure you want to remove this wallet? If you haven't backed up the secret key, your funds will be lost forever.
                        </p>
                        <div className="flex gap-3 w-full mt-4">
                            <button 
                                onClick={() => setDeleteOpen(false)}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setDeleteOpen(false);
                                    deleteWallet(i);
                                }}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolWallet;