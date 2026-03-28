import { useMemo, useState } from 'react'
import { ethers } from 'ethers'
import fundingArtifact from 'contracts/artifacts/contracts/Funding.sol/Funding.json'
import './App.css'

const CONTRACT_ADDRESS =
  import.meta.env.VITE_FUNDING_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000'
const ALLOWED_CHAIN_ID = 11155111n
const ALLOWED_CHAIN_LABEL = 'Sepolia (11155111)'

function getReadableError(error, fallback) {
  if (!error) return fallback

  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected in wallet.'
  }

  const message = error.shortMessage || error.reason || error.message
  if (!message) return fallback

  return message.length > 180 ? `${message.slice(0, 180)}...` : message
}

function App() {
  const [account, setAccount] = useState('')
  const [network, setNetwork] = useState('')
  const [totalFunded, setTotalFunded] = useState('0')
  const [fundAmount, setFundAmount] = useState('0.01')
  const [status, setStatus] = useState('Connect your wallet to begin.')
  const [busy, setBusy] = useState(false)

  const hasWallet = typeof window !== 'undefined' && Boolean(window.ethereum)
  const hasContractAddress =
    CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'

  const provider = useMemo(() => {
    if (!hasWallet) {
      return null
    }

    return new ethers.BrowserProvider(window.ethereum)
  }, [hasWallet])

  const isAllowedChain = async () => {
    if (!provider) {
      return false
    }

    const currentNetwork = await provider.getNetwork()
    return currentNetwork.chainId === ALLOWED_CHAIN_ID
  }

  const getFundingContract = async (signerRequired = false) => {
    if (!provider) {
      throw new Error('MetaMask not detected')
    }

    const runner = signerRequired ? await provider.getSigner() : provider
    return new ethers.Contract(CONTRACT_ADDRESS, fundingArtifact.abi, runner)
  }

  const refreshContractData = async () => {
    if (!provider || !hasContractAddress) {
      return
    }

    try {
      const contract = await getFundingContract(false)
      const value = await contract.totalFunded()
      setTotalFunded(ethers.formatEther(value))
    } catch (error) {
      setStatus(getReadableError(error, 'Failed to read contract data.'))
    }
  }

  const connectWallet = async () => {
    if (!provider) {
      setStatus('Please install MetaMask first.')
      return
    }

    try {
      setBusy(true)
      setStatus('Requesting wallet connection...')

      const accounts = await provider.send('eth_requestAccounts', [])
      const activeAccount = accounts[0] || ''
      const currentNetwork = await provider.getNetwork()

      setAccount(activeAccount)
      setNetwork(`${currentNetwork.name} (${currentNetwork.chainId.toString()})`)
      setStatus(
        currentNetwork.chainId === ALLOWED_CHAIN_ID
          ? 'Wallet connected.'
          : `Wrong network. Please switch to ${ALLOWED_CHAIN_LABEL}.`
      )
      await refreshContractData()
    } catch (error) {
      setStatus(getReadableError(error, 'Could not connect wallet.'))
    } finally {
      setBusy(false)
    }
  }

  const submitFunding = async () => {
    if (!hasContractAddress) {
      setStatus('Set VITE_FUNDING_CONTRACT_ADDRESS in frontend/.env first.')
      return
    }

    if (!fundAmount || Number(fundAmount) <= 0) {
      setStatus('Enter a funding amount greater than 0.')
      return
    }

    try {
      const allowedChain = await isAllowedChain()
      if (!allowedChain) {
        setStatus(`Wrong network. Please switch to ${ALLOWED_CHAIN_LABEL}.`)
        return
      }

      setBusy(true)
      setStatus('Sending transaction...')
      const contract = await getFundingContract(true)
      const tx = await contract.fund({ value: ethers.parseEther(fundAmount) })
      await tx.wait()
      setStatus(`Success: ${tx.hash}`)
      await refreshContractData()
    } catch (error) {
      setStatus(getReadableError(error, 'Funding transaction failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="panel panel-hero">
        <p className="kicker">Ethereum Funding Starter</p>
        <h1>Ship your first Solidity + React + ethers flow</h1>
        <p className="lede">
          Connect MetaMask, read contract state, and fund the contract in one
          click.
        </p>
        <div className="button-row">
          <button onClick={connectWallet} disabled={busy || !hasWallet}>
            {busy ? 'Working...' : 'Connect Wallet'}
          </button>
          <button
            className="ghost"
            onClick={refreshContractData}
            disabled={busy || !hasContractAddress}
          >
            Refresh Total
          </button>
        </div>
      </section>

      <section className="panel panel-data">
        <h2>Wallet + Contract</h2>
        <dl>
          <div>
            <dt>Wallet</dt>
            <dd>{account || 'Not connected'}</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>{network || 'N/A'}</dd>
          </div>
          <div>
            <dt>Contract Address</dt>
            <dd>{CONTRACT_ADDRESS}</dd>
          </div>
          <div>
            <dt>Total Funded</dt>
            <dd>{totalFunded} ETH</dd>
          </div>
          <div>
            <dt>Allowed Chain</dt>
            <dd>{ALLOWED_CHAIN_LABEL}</dd>
          </div>
        </dl>
      </section>

      <section className="panel panel-action">
        <h2>Fund Contract</h2>
        <label htmlFor="fundAmount">Amount in ETH</label>
        <input
          id="fundAmount"
          type="number"
          min="0"
          step="0.001"
          value={fundAmount}
          onChange={(event) => setFundAmount(event.target.value)}
        />
        <button
          onClick={submitFunding}
          disabled={busy || !account || !hasContractAddress}
        >
          Send ETH
        </button>
        <p className="status">{status}</p>
      </section>
    </main>
  )
}

export default App
