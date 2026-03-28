# Funding dApp Starter

Monorepo with:

- Hardhat smart contracts
- React + Vite frontend
- ethers.js wallet and contract interactions

## Structure

- contracts: Solidity source, tests, and deploy script
- frontend: dApp UI

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build contracts (generates ABI artifact used by frontend):

   ```bash
   npm run contracts:build
   ```

3. Run tests:

   ```bash
   npm run contracts:test
   ```

4. Start frontend:

   ```bash
   npm run dev
   ```

## Deploy

### Local

1. Start local node:

   ```bash
   cd contracts
   npx hardhat node
   ```

2. Deploy:

   ```bash
   npm run contracts:deploy:local
   ```

3. Set frontend contract address in frontend/.env:

   ```env
   VITE_FUNDING_CONTRACT_ADDRESS=0xYourContractAddress
   ```

### Sepolia

1. Copy contracts/.env.example to contracts/.env
2. Fill values:
   - SEPOLIA_RPC_URL
   - PRIVATE_KEY
3. Deploy:

   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## Notes

- Frontend enforces Sepolia for funding transactions.
- Frontend imports ABI directly from contracts artifacts via workspace package dependency.
