import React, { useState, useEffect } from "react";
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import './Bridge.css';
import { bridgeTokens } from '../../scripts/bridgeHelper.ts';

//pub obj: 0x93fe10baea8f2442a06de6da331d9b09f69785d0fb51fba5be3efce5b533b51b 
//admin cap: 0xd6bcac449c2931ecba4b336c29f8cb1102e1aa24558a4424a52205d2e7ef97ba 

const Bridge: React.FC = () => {
  const [sourceChain, setSourceChain] = useState<string>("Ethereum");
  const [destinationChain, setDestinationChain] = useState<string>("Sui");
  const [amount, setAmount] = useState<number>(0);

  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);      // pt. MetaMask 
  const [suiWalletAddress, setSuiWalletAddress] = useState<string | null>(null); // pt. Sui
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loggedOut, setLoggedOut] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState<boolean>(false);

  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (currentAccount && !loggedOut) {
      setSuiWalletAddress(currentAccount.address);
      setConnectedWalletType('sui');
      console.log("Sui Wallet connected with address:", currentAccount.address);
    }
  }, [currentAccount, loggedOut]);

  useEffect(() => {

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
    
            setIsMetaMaskConnected(true);
          }
        })
        .catch(console.error);
    }
  }, []);


  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsMetaMaskConnected(true);
        console.log("MetaMask Account Connected:", accounts[0]);
      } catch (error) {
        console.error('Error connecting MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  const handleTransfer = async () => {
    try {
        let walletType: string | null = null;
        let recvAddress: string | null = null;
        const bridgeAmount = amount; 

        if (sourceChain === "Ethereum") {
            walletType = "MetaMask";
            recvAddress = suiWalletAddress || "";
        } else if (sourceChain === "Sui") {
            walletType = "SuiWallet";
            recvAddress = walletAddress || "";
        }

        if (!walletType) {
            setErrorMessage("Tipul de portofel nu a putut fi determinat .");
            return;
        }
        if (!recvAddress) {
            setErrorMessage("Nu a fost un destinatar.");
            return;
        }

        let bridgeResult: any;

        if (walletType === "MetaMask") {
            console.log("Metamask wallet conected!");

            bridgeResult = await bridgeTokens(
                walletType,
                recvAddress,
                bridgeAmount,
                destinationChain,
                currentAccount
            );

            console.log("Rezultatul transferului de tokeni:", bridgeResult);

            const mintResponse = await fetch("http://localhost:3000/api/mint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recvAddress,
                    amount: bridgeAmount,
                    destinationChain: "Sui",
                }),
            });

            if (!mintResponse.ok) {
                throw new Error(await mintResponse.text());
            }

            const mintedData = await mintResponse.json();
            console.log("Raspuns mint:", mintedData);
        } else if (walletType === "SuiWallet") {
            console.log("sui wallet detected");

            bridgeResult = await bridgeTokens(
                walletType,
                recvAddress,
                bridgeAmount,
                destinationChain,
                currentAccount
            );
            console.log("Rezultatul transferului de ibt:", bridgeResult);
        }
    } catch (error: any) {
        console.error("Eroare în procesul de transfer:", error);

        setErrorMessage(error?.message || "A apărut o eroare în timpul procesului de transfer.");
    }
};



  return (
    <div className="bridge-container">
      {/* Connect Wallets Section */}
      <div className="wallets-section mb-6 p-6 rounded-lg shadow-lg bg-white">
  <h3 className="text-xl font-semibold mb-4 text-gray-700">Connect Wallets</h3>
  <div className="flex gap-4 justify-start"> {/* Folosim 'gap-4' pentru distanțare și 'justify-start' pentru aliniere orizontală */}
    {/* MetaMask Button */}
    <div className="wallet-container">
      <button
        onClick={connectMetaMask}
        className="wallet-button"
        disabled={!!walletAddress}
      >
        {walletAddress ? "Connected to MetaMask" : "Connect MetaMask"}
      </button>
      {walletAddress && (
        <p className="text-gray-700 text-sm mt-2">{`MetaMask Address: ${walletAddress}`}</p>
      )}
    </div>

    {/* Sui Wallet Button */}
    <div className="wallet-container">
      <ConnectModal
        trigger={
          <button
            className="wallet-button"
            disabled={!!suiWalletAddress}
          >
            {suiWalletAddress ? "Connected Sui Wallet" : "Connect Sui Wallet"}
          </button>
        }
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
      {suiWalletAddress && (
        <p className="text-gray-700 text-sm mt-2">{`Sui Wallet Address: ${suiWalletAddress}`}</p>
      )}
    </div>
  </div>
  {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        <div className="form-group mb-6">
          <button
            onClick={() => {
              // Switch the source and destination
              const temp = sourceChain;
              setSourceChain(destinationChain);
              setDestinationChain(temp);
            }}
            className="transfer-button"
            disabled={sourceChain === destinationChain}
          >
            {`Transfer from ${sourceChain} to ${destinationChain}`}
          </button>
        </div>

        <div className="form-group mb-6">
          <label className="block text-gray-600 mb-2">Amount</label>
          <input
            type="text"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input-field"
            placeholder="Enter the amount"
          />
        </div>

        <button
          onClick={handleTransfer}
          className="transfer-button"
          disabled={sourceChain === "Ethereum" ? !walletAddress : !suiWalletAddress}
        >
          Transfer
        </button>
      </div>
      </div>
  );
};

export default Bridge;
