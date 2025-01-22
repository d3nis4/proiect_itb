import { SuiClient } from "@mysten/sui/client";
import Web3 from "web3";

interface Account {
  address: string;
}

/**
 * @param walletType        Tipul portofelului: "MetaMask" | "SuiWallet"
 * @param destinationAddress Adresa de destinație (de exemplu, adresa Ethereum dacă bridge-uiești)
 * @param tokenAmount       Cantitatea de tokeni de mintat/ars
 * @param targetChain       Chain-ul de destinație, de exemplu, "Sui" sau "Ethereum"
 * @param userAccount       Detalii cont curent Sui, poate fi null dacă nu există
 */

//gestioneaza procesul de bridge, verificam portofelul utilizat,
export async function bridgeTokens(
  walletType: "MetaMask" | "SuiWallet",
  destinationAddress: string,
  tokenAmount: number,
  targetChain: string,
  userAccount: Account | null
): Promise<any> {
  if (walletType === "MetaMask") {
    return burnTokensOnEthereum(tokenAmount, targetChain);
  } else if (walletType === "SuiWallet") {
    const burnResult = await burnTokensOnSuiNetwork(tokenAmount, userAccount);

    console.log("Minting tokens on Ethereum...");
    const mintResult = await mintTokensOnEthereum(destinationAddress, tokenAmount);
    console.log("Minting completed:", mintResult);

    return { burnResult, mintResult };
  } else {
    throw new Error("Unsupported wallet type");
  }
}

/**
 * Mint tokens on Ethereum via server.
 * @param destinationAddress  Adresa pentru mintarea tokenilor
 * @param tokenAmount         Cantitatea de tokeni
 */
async function mintTokensOnEthereum(destinationAddress: string, tokenAmount: number): Promise<any> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const mintResponse = await fetch("http://localhost:3000/api/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationAddress,
        tokenAmount,
        targetChain: "Ethereum"
      }),
    });

    if (!mintResponse.ok) {
      throw new Error(await mintResponse.text());
    }

    const result = await mintResponse.json();
    console.log("Minting successful via server:", result);
    return result;
  } catch (error) {
    console.error("Error minting tokens on Ethereum:", error);
    throw error;
  }
}

/**
 * @param tokenAmount    Cantitatea de tokeni de ars
 * @param targetChain    Chain-ul de destinație, ex. "Sui"
 */
async function burnTokensOnEthereum(tokenAmount: number, targetChain: string): Promise<any> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];
    console.log("Connected Address (MetaMask):", userAddress);

    const metamaskAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Contract address on MetaMask
    const web3 = new Web3(window.ethereum as any);

    const contractABI = [
      {
        constant: false,
        inputs: [
          { name: "amount", type: "uint256" },
          { name: "destinationChain", type: "string" },
        ],
        name: "burnForBridge",
        outputs: [],
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(contractABI as any, metamaskAddr);

    const weiAmount = web3.utils.toWei(tokenAmount.toString(), "ether");

    const estimatedGas = await contract.methods.burnForBridge(weiAmount, targetChain).estimateGas({
      from: userAddress,
    });

    console.log("Estimated Gas:", estimatedGas);

    const tx = await contract.methods.burnForBridge(weiAmount, targetChain).send({
      from: userAddress,
      gas: Math.round(Number(estimatedGas) * 1.2).toString(),
      gasPrice: web3.utils.toWei("20", "gwei"),
    });

    console.log("Burn for Bridge Transaction Successful:", tx);
    return tx;
  } catch (error: any) {
    console.error("Error burning tokens on Ethereum:", error);

    if (error.message.includes("User denied transaction signature")) {
      console.error("Transaction rejected by the user.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("Insufficient funds for gas or token balance.");
    } else if (error.message.includes("reverted")) {
      console.error("Transaction reverted. Check contract logic or balance.");
    }

    throw error;
  }
}

/**
 * @param tokenAmount   Cantitatea de tokeni de ars
 * @param userAccount   Contul utilizatorului pe Sui (include adresa)
 */
async function burnTokensOnSuiNetwork(tokenAmount: number, userAccount: Account | null): Promise<any> {
  try {
    if (!userAccount || !userAccount.address) {
      throw new Error("No account connected to Sui Wallet");
    }

    const userAddress = userAccount.address;
    const client = new SuiClient({ url: "http://127.0.0.1:9000" });

    //  token Sui
    const IBTTokenType = "0x93fe10baea8f2442a06de6da331d9b09f69785d0fb51fba5be3efce5b533b51b::IBTToken::IBTToken";

    const coins = await client.getCoins({
      owner: userAddress,
      coinType: IBTTokenType,
    });

    if (!coins.data || coins.data.length === 0) {
      throw new Error("No IBTToken coins found to burn");
    }

    const coinToBurn = coins.data[0].coinObjectId;

    // Apel endpoint-ul /api/burn de pe server
    const burnResponse = await fetch("http://localhost:3000/api/burn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenAmount,
        userAddress,
        coinObjectId: coinToBurn
      }),
    });

    if (!burnResponse.ok) {
      throw new Error(await burnResponse.text());
    }

    return await burnResponse.json();
  } catch (error) {
    console.error("Error in burnTokensOnSuiNetwork:", error);
    throw error;
  }
}
