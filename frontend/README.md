# Frontend

React + Vite dApp UI for the Funding contract.

## Requirements

- MetaMask installed
- Contract deployed and address configured
- Sepolia network selected in wallet for funding transactions

## Configure

1. Copy .env.example to .env
2. Set:

```env
VITE_FUNDING_CONTRACT_ADDRESS=0xYourContractAddress
```

## Run

From workspace root:

```bash
npm run contracts:build
npm run dev
```

The frontend reads contract ABI from contracts artifacts through npm workspaces.
