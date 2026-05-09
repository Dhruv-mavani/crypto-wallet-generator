import { JsonRpcProvider, Wallet, parseEther } from "ethers";

export async function signEthToken(privateKey: string, toAddress: string, amount: number, network: string) {
    try {
        const url = network === "mainnet" 
            ? `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
            : `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        const provider = new JsonRpcProvider(url);
        const wallet = new Wallet(privateKey, provider);

        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: parseEther(amount.toString())
        });

        const receipt = await tx.wait();
        return { success: true, hash: receipt?.hash };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export default signEthToken;