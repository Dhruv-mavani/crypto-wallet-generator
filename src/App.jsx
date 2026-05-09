import { useState, useEffect } from "react";
import { generateMnemonic } from "bip39";
import { AlertTriangle, Sun, Moon, EyeOff, Sparkles } from "lucide-react";
import SolWallet from "./SWG";
import EthWallet from "./EWG";

export default function App() {
    const [mnemonic, setMnemonic] = useState("");
    const [network, setNetwork] = useState("devnet"); // "devnet" | "mainnet"
    const [theme, setTheme] = useState("dark"); // "dark" | "light"
    const [activeChain, setActiveChain] = useState("both"); // "both" | "sol" | "eth"
    const [isSeedRevealed, setIsSeedRevealed] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }
        document.startViewTransition(() => {
            setTheme(newTheme);
        });
    };

    useEffect(() => {
        const themeMeta = document.getElementById("theme-color-meta");
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            if (themeMeta) themeMeta.setAttribute("content", "#0f172a");
        } else {
            document.documentElement.classList.remove("dark");
            if (themeMeta) themeMeta.setAttribute("content", "#f8fafc");
        }
    }, [theme]);

    return (
        <div className={`min-h-screen relative overflow-hidden text-slate-900 dark:text-white p-2 sm:p-4 md:p-10 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
            
            {/* Ambient Background Blobs */}
            <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-[120px] opacity-50 dark:opacity-20 animate-blob ${theme === 'dark' ? 'bg-indigo-600' : 'bg-purple-300'}`}></div>
            <div className={`absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-[120px] opacity-50 dark:opacity-20 animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-orange-600' : 'bg-yellow-300'}`}></div>
            <div className={`absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-[120px] opacity-50 dark:opacity-20 animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-cyan-600' : 'bg-blue-300'}`}></div>

            <div className="w-full max-w-[1600px] mx-auto space-y-8 sm:space-y-12 relative z-10">
                
                {/* Premium Control Panel */}
                <div className="flex flex-row flex-wrap justify-center md:justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-3xl gap-4 sm:gap-6 shadow-sm">
                    {/* Network Filter */}
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
                        <button 
                            onClick={() => setNetwork("devnet")}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${network === "devnet" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                            Devnet
                        </button>
                        <button 
                            onClick={() => setNetwork("mainnet")}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${network === "mainnet" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                            Mainnet
                        </button>
                    </div>

                    {/* Chain Filter */}
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
                        <button 
                            onClick={() => setActiveChain("all")}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChain === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setActiveChain("sol")}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChain === "sol" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                            Solana
                        </button>
                        <button 
                            onClick={() => setActiveChain("eth")}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChain === "eth" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                        >
                            Ethereum
                        </button>
                    </div>

                    {/* Theme Toggle (Mind-Boggling) */}
                    <div 
                        onClick={toggleTheme}
                        className="relative flex items-center cursor-pointer w-20 h-10 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner transition-colors duration-500 shrink-0"
                    >
                        {/* Background ripple */}
                        <div className={`absolute inset-0 transition-opacity duration-500 ${theme === 'dark' ? 'bg-indigo-900/40 opacity-100' : 'bg-amber-100/40 opacity-100'}`}></div>
                        
                        {/* Thumb */}
                        <div className={`absolute left-1 w-8 h-8 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'translate-x-10 rotate-[360deg]' : 'translate-x-0 rotate-0'}`}>
                            {/* Sun */}
                            <Sun 
                                className={`absolute text-amber-500 transition-all duration-500 ${theme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} 
                                size={18} 
                            />
                            {/* Moon */}
                            <Moon 
                                className={`absolute text-blue-400 transition-all duration-500 ${theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}`} 
                                size={18} 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-center flex justify-center items-center gap-2 sm:gap-3 tracking-tight">
                        <Sparkles className="text-orange-500 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        OmniWallet
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto text-xs sm:text-sm md:text-lg px-2">
                        Your secure, multi-chain crypto generator. Instantly create and manage wallets across Solana and Ethereum.
                    </p>
                    <button 
                        onClick={() => {
                            setMnemonic(generateMnemonic(128));
                            setIsSeedRevealed(false);
                        }}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-full hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                    >
                        GENERATE SEED PHRASE
                    </button>
                </div>

                {mnemonic && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative overflow-hidden bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl mb-8 shadow-sm transition-colors duration-300">
                            
                            <div className="flex flex-col items-center justify-center gap-2 mb-4">
                                <div className="flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-full border border-red-200 dark:border-red-500/20 max-w-[430px] w-full">
                                    <AlertTriangle size={20} />
                                    <span className="text-xs sm:text-sm text-center">WARNING: Never share your seed phrase!</span>
                                </div>
                            </div>

                            <p className="text-center font-mono text-slate-800 dark:text-orange-200 text-lg leading-loose tracking-wide break-words relative z-0">
                                {mnemonic}
                            </p>

                            {!isSeedRevealed && (
                                <div 
                                    onClick={() => setIsSeedRevealed(true)}
                                    className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all z-10"
                                >
                                    <span className="text-slate-900 dark:text-white font-bold text-xl drop-shadow-md">Click to Reveal Seed Phrase</span>
                                    <span className="text-slate-700 dark:text-slate-300 text-sm mt-2 font-medium">Anyone with these words can steal your assets.</span>
                                </div>
                            )}

                            {isSeedRevealed && (
                                <div className="flex justify-center mt-6 relative z-0">
                                    <button
                                        onClick={() => setIsSeedRevealed(false)}
                                        className="px-6 py-2 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                                    >
                                        <EyeOff size={16} />
                                        Hide Seed Phrase
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className={`grid grid-cols-1 gap-4 sm:gap-8 ${activeChain === 'both' ? 'lg:grid-cols-2 2xl:grid-cols-2' : ''}`}>
                            <div className={`transition-all duration-500 ${activeChain === "eth" ? "hidden" : "block animate-in fade-in zoom-in-95"}`}>
                                <SolWallet mnemonic={mnemonic} network={network} />
                            </div>
                            <div className={`transition-all duration-500 ${activeChain === "sol" ? "hidden" : "block animate-in fade-in zoom-in-95"}`}>
                                <EthWallet mnemonic={mnemonic} network={network} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}