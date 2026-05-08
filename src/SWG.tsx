import { useState } from "react";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";

type SolWalletProps = {
    mnemonic: string;
}

export const SolWallet = ({ mnemonic }: SolWalletProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [addresses, setAddresses] = useState<string[]>([]);

    const addWallet = () => {
        const seed = mnemonicToSeedSync(mnemonic);
        const path = `m/44'/501'/${currentIndex}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;
        const keyPair = Keypair.fromSeed(derivedSeed);
        
        setAddresses([...addresses, keyPair.publicKey.toBase58()]);
        setCurrentIndex(currentIndex + 1);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
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
                {addresses.map((p, i) => (
                    <div key={i} className="bg-black/40 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account {i}: </span>
                        <span className="font-mono text-sm break-all text-slate-300">{p}</span>
                    </div>
                ))}
                {addresses.length === 0 && (
                    <p className="text-slate-600 text-sm text-center py-4">No wallets generated yet.</p>
                )}
            </div>
        </div>
    );
}

export default SolWallet;