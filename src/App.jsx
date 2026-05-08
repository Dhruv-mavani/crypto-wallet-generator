import { useState } from "react";
import { generateMnemonic } from "bip39";
import SolWallet from "./SWG";
import EthWallet from "./EWG";

export default function App() {
    const [mnemonic, setMnemonic] = useState("");

    return (
        <div className="min-h-screen bg-black text-white p-10">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-5xl font-black text-orange-600">Dhruv's Wallet Creator</h1>
                    <button 
                        onClick={() => setMnemonic(generateMnemonic(128))}
                        className="px-8 py-4 bg-white text-black font-black rounded-full hover:bg-orange-600 hover:text-white transition-all"
                    >
                        GENERATE SEED PHRASE
                    </button>
                </div>

                {mnemonic && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl mb-8">
                            <p className="text-center font-mono text-orange-200 text-lg leading-loose tracking-wide">
                                {mnemonic}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <SolWallet mnemonic={mnemonic} />
                            <EthWallet mnemonic={mnemonic} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}