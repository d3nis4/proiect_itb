# TokenBridge

TokenBridge is a blockchain interoperability project that enables seamless transfer of IBT tokens between the Ethereum and Sui networks. The project consists of two smart contracts—one deployed on Ethereum and one on Sui—that facilitate the minting and burning of IBT tokens. Users can interact with the bridge via a web application, where they authenticate using MetaMask (Ethereum) or SUI Wallet (Sui) to initiate cross-chain transfers.

When a user bridges tokens, they are burned on the source chain and minted on the destination chain, ensuring a secure, trustless, and decentralized transfer process.

## Features
🌉 Cross-Chain Token Transfers: Transfer IBT tokens between Ethereum and Sui networks.

🔒 Secure and Trustless: Tokens are burned on the source chain and minted on the destination chain, ensuring data integrity.

🦊 MetaMask Authentication: Ethereum users can authenticate using MetaMask.

🦄 SUI Wallet Authentication: Sui users can authenticate using the SUI Wallet.

🔄 Smooth User Experience: Simple, intuitive web interface for token bridging.

## Architecture
### Smart Contracts:

One smart contract deployed on Ethereum to mint and burn IBT tokens.

One smart contract deployed on Sui to mint and burn IBT tokens.

### Web Application:

Users can connect their wallets.

Interface for initiating cross-chain transfers of IBT tokens.

### Security & Trustlessness:

Burn: IBT tokens are burned on the source chain.

Mint: IBT tokens are minted on the destination chain.

## Technologies Used

### Blockchain
Ethereum: For the Ethereum-based smart contract and network.

Sui: For the Sui-based smart contract and network.

### Smart Contracts
Solidity (Ethereum)

Move (Sui)

### Web Application

React.js: Frontend for the web application.

Web3.js: Ethereum Web3 library for interacting with MetaMask.

SUI SDK: Sui SDK for interacting with the SUI Wallet.

### Wallet Integration
MetaMask: For Ethereum-based authentication and interaction.

SUI Wallet: For Sui-based authentication and interaction.

### How It Works
User Authentication:

The user connects their wallet (MetaMask for Ethereum or SUI Wallet for Sui).

Bridge Tokens:

The user selects the amount of IBT tokens they wish to bridge and chooses the source and destination chain (Ethereum or Sui).
Token Burn and Mint:

The IBT tokens are burned on the source chain.
The equivalent amount of IBT tokens is minted on the destination chain.
