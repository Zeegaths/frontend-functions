import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Task.sol/Task.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [owner, setOwner] = useState("");
  const [address, setAddress] = useState("");

  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
      // setAddress(address);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
    }
  }

  const getOwner = async() => {
    if (atm) {
      setOwner(await atm.getOwner());
    }
  }

  const transferOwnership = async() => {
      if (atm) {
        let tx = await atm.transferOwnership(address);
        console.log(owner)
        await tx.wait();
        // getOwner();
      }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect Metamask Wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <input type="text" placeholder="new owner address" onChange={(e) => setAddress(e.target.value) }/>
          <button onClick={transferOwnership}>Submit</button>
        </div>
        <button onClick={getOwner}>Owner</button>
        <p>New owner: {owner}</p>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx global>{`
        body {
          min-height: 100vh;
          display: flex;
          width: 100%;
          text-align: center; 
          justify-content: center;
          align-items: center;
        }
        main {
          background-color: rgba(0,0,0,0.4);
          backdrop-filter: blur;
          padding: 20px;
          border-radius: 40px;
          box-shadow: 10px 10px -20px black;
        }
        input{
          padding: 20px;
          border-radius: 13px;
          border: 0;
        }
        button {
          background-color: #333;
          padding: 20px;
          border-radius: 13px;
          border: 0;
          margin: 10px;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </main>
  )
}
