# Decentralized Crowd Funding

Monorepo for an Ethereum crowdfunding dApp using a Solidity smart contract and a React frontend.

## Technical Overview

- Contract runtime: Hardhat + Ethers
- Contract language: Solidity 0.8.24
- Frontend runtime: Vite + React
- Web3 client: ethers v6
- Monorepo: npm workspaces

The application supports:
- Wallet connection (MetaMask)
- On-chain funding via payable transaction
- Contract balance withdrawal by owner only
- Read path for cumulative funded amount

## Repository Layout

```text
.
├─ contracts/
│  ├─ contracts/Funding.sol
│  ├─ scripts/deploy.js
│  ├─ test/Funding.js
│  └─ hardhat.config.js
├─ frontend/
│  ├─ src/App.jsx
│  └─ .env.example
├─ package.json
└─ README.md
```

## Smart Contract Specification

Contract: Funding

State:
- owner (immutable address): deployer and withdraw authority
- totalFunded (uint256): cumulative ETH funded over contract lifetime

Events:
- Funded(address indexed funder, uint256 amount)
- Withdrawn(address indexed to, uint256 amount)

External Functions:
- fund() payable
  - Requires msg.value > 0
  - Increments totalFunded
  - Emits Funded
- lifetimeFunded() view returns (uint256)
  - Alias for totalFunded
- withdraw(address payable to)
  - Only callable by owner
  - Rejects zero address recipient
  - Withdraws full contract balance to recipient
  - Emits Withdrawn

Security and behavior constraints:
- Access control enforced in withdraw
- No partial withdrawals (always full balance)
- Withdrawal uses call and reverts on transfer failure

## Test Coverage

Current tests in contracts/test/Funding.js validate:
- Funding increases totalFunded and lifetimeFunded
- Zero-value funding is rejected
- Owner can withdraw and recipient receives full balance
- Non-owner withdraw is rejected
- Zero-address recipient is rejected
- Withdraw with empty balance is rejected

Run tests:

```bash
npm run contracts:test
```

## Prerequisites

- Node.js 18+
- npm 9+
- MetaMask browser extension (for frontend interaction)

## Installation

```bash
npm install
```

## Development Workflow

1. Compile contracts and generate artifacts/ABI:

```bash
npm run contracts:build
```

2. Run contract tests:

```bash
npm run contracts:test
```

3. Start frontend:

```bash
npm run dev
```

Frontend default dev endpoint: http://127.0.0.1:5173

## Local Deployment

Terminal A:

```bash
cd contracts
npx hardhat node
```

Terminal B:

```bash
npm run contracts:deploy:local
```

After deploy, set frontend contract address in frontend/.env:

```env
VITE_FUNDING_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## Sepolia Deployment

1. Copy environment template:

```bash
copy contracts\\.env.example contracts\\.env
```

2. Configure contracts/.env:
- SEPOLIA_RPC_URL
- PRIVATE_KEY

3. Deploy:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

4. Set frontend/.env:

```env
VITE_FUNDING_CONTRACT_ADDRESS=0xYourSepoliaContractAddress
```

## Frontend-Contract Integration Notes

- Frontend imports ABI from contracts artifacts:
  - contracts/artifacts/contracts/Funding.sol/Funding.json
- Allowed chain is hardcoded to Sepolia chain id 11155111
- Funding action is blocked when wallet is not connected or wrong network

## NPM Workspace Scripts

From repository root:

- npm run dev
- npm run build
- npm run contracts:build
- npm run contracts:test
- npm run contracts:deploy:local


