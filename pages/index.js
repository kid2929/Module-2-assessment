import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceWei = await atm.getBalance();
      const balanceEth = ethers.utils.formatUnits(balanceWei, "ether");
      setBalance(balanceEth);
    }
  };
  

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  // New function: increaseBalance
  const increaseBalance = async () => {
    if (atm) {
      const amount = prompt("Enter amount to increase balance:");
      if (amount) {
        let tx = await atm.increaseBalance(ethers.utils.parseEther(amount));
        await tx.wait();
        getBalance();
      }
    }
  };

  // New function: decreaseBalance
  const decreaseBalance = async () => {
    if (atm) {
      const amount = prompt("Enter amount to decrease balance:");
      if (amount) {
        let tx = await atm.decreaseBalance(ethers.utils.parseEther(amount));
        await tx.wait();
        getBalance();
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div className="account-info">
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit} className="action-button">Deposit 1 ETH</button>
        <button onClick={withdraw} className="action-button">Withdraw 1 ETH</button>
        <button onClick={increaseBalance} className="action-button">Increase Balance</button>
        <button onClick={decreaseBalance} className="action-button">Decrease Balance</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background: linear-gradient(45deg, #ff0000, #0000ff);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        header {
          background-color: #4caf50;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        h1 {
          color: white;
        }
        .account-info {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        p {
          margin: 10px 0;
        }
        .action-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .action-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </main>
  );
}
