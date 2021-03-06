import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // wallet Connected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether current address is in WL or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to complete/get mined
  const [loading, setLoading] = useState(false);
  // numberOfWhitelisted tracks number of addresses whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // create a reference to the Web3 Modal (for connecting to metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   * 
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask
    // since we store 'web3Modal' as a reference, we need to access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // if user is not connected to Rinkeby network, let them know and throw error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 4) {
      window.alert("Change network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  /**
 * addAddressToWhitelist: Adds the current connected address to the whitelist
 */
  const addAddressToWhitelist = async () => {
    try {
      // need a signer here since it is a write transaction
      const signer = await getProviderOrSigner(true);
      // create new instance of contract with a signer which allows update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // wait for transaction to get mined
      await tx.wait();
      setLoading(false);
      // get updated number of addresses in WL
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };
/**
 * getNumberOfWhitelisted:  gets the number of whitelisted addresses
 */
  const getNumberOfWhitelisted = async () => {
    try {
      // get provider from web3Modal/metamask
      // no need for signer, only read function
      const provider = await getProviderOrSigner();
      // connect to contract with provider so will have read-only access
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call numAddressesWhitelisted from the contract
      const _numberofWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberofWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      // will need signer later to get user's address
      //signer can also perform read transactions
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // get address associated to the signer which is connected to metamask
      const address = await signer.getAddress();
      // call the whitelistedAddresses mapping from contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  }; 

  /* connectWallet: connects metamask wallet
  */
  const connectWallet = async () => {
    try {
      // get provider from web3Modal/metamask
      // first time use prompts user to connect wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };
  
  /*
  renderButton: returns a button based on the state of dapp
  */
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(()=> {
    // if wallet is not conencted, create new instance of Web3Modal and connect the Metamask wallet
    if (!walletConnected) {
      // assign the Web3Modal class to reference object by setting its 'current' value
      // the 'current' value is persisted throughout as long as page is open
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}