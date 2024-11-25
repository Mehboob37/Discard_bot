const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const solanaWeb3 = require('@solana/web3.js');
const watchlistPath = path.join(__dirname, '../../data/watchlists.json');

// Solana RPC URL and API Key
const rpcUrl = 'https://solana-api.instantnodes.io/token-jAF2BcY1j09ePW0MmubqHgeeZ3WkS1ao';

// Initialize watchlists if not present
if (!fs.existsSync(watchlistPath)) {
    fs.writeFileSync(watchlistPath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Manage wallet watchlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a wallet to your watchlist')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to watch')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a wallet from your watchlist')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to remove')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your watched wallets')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const address = interaction.options.getString('address')?.toLowerCase();
        let watchlists = JSON.parse(fs.readFileSync(watchlistPath));

        // Initialize user's watchlist if it doesn't exist
        if (!watchlists[userId]) {
            watchlists[userId] = [];
        }

        let replyContent = '';  // Store the reply content

        if (subcommand === 'add') {
            if (!address) {
                replyContent = 'Please provide a wallet address.';
            } else if (watchlists[userId].includes(address)) {
                replyContent = 'This wallet is already in your watchlist.';
            } else {
                watchlists[userId].push(address);
                fs.writeFileSync(watchlistPath, JSON.stringify(watchlists, null, 2));
                replyContent = `Wallet ${address} has been added to your watchlist.`;
            }
        } else if (subcommand === 'remove') {
            if (!address) {
                replyContent = 'Please provide a wallet address.';
            } else if (!watchlists[userId].includes(address)) {
                replyContent = 'This wallet is not in your watchlist.';
            } else {
                watchlists[userId] = watchlists[userId].filter(addr => addr !== address);
                fs.writeFileSync(watchlistPath, JSON.stringify(watchlists, null, 2));
                replyContent = `Wallet ${address} has been removed from your watchlist.`;
            }
        } else if (subcommand === 'list') {
            const wallets = watchlists[userId];
            if (wallets.length === 0) {
                replyContent = 'Your watchlist is empty.';
            } else {
                const walletList = wallets.map(addr => `• ${addr}`).join('\n');
                replyContent = `**Your Watched Wallets:**\n${walletList}`;
            }
        } else {
            replyContent = 'Unknown subcommand.';
        }

        // Reply only once after handling the interaction
        if (replyContent) {
            await interaction.reply({ content: replyContent, ephemeral: true });
        }

        // Monitor wallet transactions and notify about large transfers
        if (address) {
            const transactionData = await fetchTransactionData(address);
            if (transactionData) {
                await handleLargeTransaction(interaction, transactionData, address);
            }
        }

        // Monitor all wallets in the user's watchlist
        for (const watchAddress of watchlists[userId]) {
            const transactions = await fetchTransactionData(watchAddress);
            if (transactions) {
                await handleLargeTransaction(interaction, transactions, watchAddress);
            }
        }
    },
};

// Function to fetch transaction data from Solana
async function fetchTransactionData(walletAddress) {
    try {
        const response = await axios.post(rpcUrl, {
            jsonrpc: "2.0",
            id: 1,
            method: "getConfirmedSignaturesForAddress2",
            params: [walletAddress, { limit: 5 }]
        });

        console.log("Fetched transaction data:", response.data);  // Log the transaction data fetched

        return response.data.result || [];
    } catch (error) {
        console.error("Error fetching transaction data:", error);
        return null;
    }
}

// Function to handle large transactions and notify
async function handleLargeTransaction(interaction, transactions, address) {
    let largeTransactionsFound = false;

    for (const tx of transactions) {
        const transactionValue = await getTransactionValue(tx.signature); // Fetch the transaction value based on signature
        const transactionValueUSD = await convertSolToUsd(transactionValue); // Optionally convert SOL to USD

        console.log(`Checking transaction ${tx.signature}: Value = ${transactionValue} SOL`);  // Log the transaction being processed

        if (transactionValue >= 10000) { // Threshold for large transfers
            const solscanLink = `https://solscan.io/tx/${tx.signature}`;
            const message = `🚨 **Large Transaction Detected** 🚨\n\nWallet: ${address}\nTransaction Value: ${transactionValue} SOL (~${transactionValueUSD} USD)\n[View on Solscan](${solscanLink})`;

            // Ensure that we don't reply multiple times for the same interaction
            if (!interaction.replied) {
                await interaction.reply({ content: message, ephemeral: true });
            }
            largeTransactionsFound = true;
        }
    }

    // If no large transactions were found, inform the user
    if (!largeTransactionsFound) {
        if (!interaction.replied) {
            await interaction.reply({ content: 'No large transactions found for this wallet.', ephemeral: true });
        }
    }
}

// Function to get the value of the transaction (you might need to adjust based on your response data structure)
async function getTransactionValue(signature) {
    try {
        const response = await axios.post(rpcUrl, {
            jsonrpc: "2.0",
            id: 1,
            method: "getTransaction",
            params: [signature]
        });

        // Assume the transaction value is in the `lamports` field, convert to SOL
        const transaction = response.data.result;
        const transactionValueInLamports = transaction.meta?.postBalances?.[0] || 0;
        const transactionValueInSol = transactionValueInLamports / solanaWeb3.LAMPORTS_PER_SOL;

        return transactionValueInSol;
    } catch (error) {
        console.error("Error fetching transaction value:", error);
        return 0;
    }
}

// Function to convert SOL to USD (optional)
async function convertSolToUsd(amountInSol) {
    try {
        // Use an actual API for SOL to USD conversion (e.g., CoinGecko, CryptoCompare)
        const solToUsdRate = 20; // Assuming 1 SOL = 20 USD for example purposes
        return amountInSol * solToUsdRate;
    } catch (error) {
        console.error("Error converting SOL to USD:", error);
        return 0;
    }
}
