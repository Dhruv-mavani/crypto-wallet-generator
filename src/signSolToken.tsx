import { Connection, Keypair, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export async function signSolToken(secretKeyString: string, toAddress: string, amount: number, network: string) {
    try {
        const url = network === "mainnet" 
            ? `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
            : `https://solana-devnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
        const connection = new Connection(url, "confirmed");
        
        const secretKey = bs58.decode(secretKeyString);
        const fromKeypair = Keypair.fromSecretKey(secretKey);
        
        const toPublicKey = new PublicKey(toAddress);

        const latestBlockhash = await connection.getLatestBlockhash();
        
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports: amount * 1_000_000_000, // Convert SOL to lamports
            })
        );
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = fromKeypair.publicKey;
        
        transaction.sign(fromKeypair);

        const signature = await connection.sendRawTransaction(transaction.serialize(), { 
            skipPreflight: false,
            maxRetries: 3 
        });

        try {
            await connection.confirmTransaction({
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                signature: signature
            }, 'confirmed');
        } catch (e: any) {
            // Solana Devnet RPCs often timeout waiting for confirmation.
            // If we get "block height exceeded", we manually check if it actually succeeded.
            const status = await connection.getSignatureStatus(signature);
            if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
                // The transaction actually landed on-chain!
                console.log("Transaction confirmed despite timeout!");
            } else {
                throw e; // It truly failed/expired
            }
        }

        return { success: true, signature };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export default signSolToken;