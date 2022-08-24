import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import devil from '../public/GBC-2437.png'
import green from '../public/outbreak-green.svg'
import pink from '../public/outbreak-pink.svg'
import orange from '../public/outbreak-orange.svg'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import { useEffect, useState } from "react"
import { BigNumber, Contract, providers, utils } from "ethers";
import { useAccount } from 'wagmi';



export default function Home() {

  const zero = BigNumber.from(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [eligibility, setEligibility] = useState(undefined);
  const [balanceOfBlueberryTokens, setbalanceOfBlueberryTokens] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const { address, isConnected} = useAccount();

  async function getTokenToBeClaim() {
    if(typeof window.ethereum !== 'undefined') {
      setLoading2(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
      try {
        const balance = await nftContract.balanceOf(address);
        console.log(balance, 'balance');
        
        if (balance === zero || tokensToBeClaimed == 'none') {
          setTokensToBeClaimed('none');
          setEligibility(false);
        } else {
          var amount = 0;
          for (var i = 0; i < balance; i++) {
            const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
            const claimed = await tokenContract.tokenIdsClaimed(tokenId);
            if (!claimed) {
              amount++;
            }
          }
          if (amount > 0) {
          const toBeClaim = parseInt(amount, 16);
          setTokensToBeClaimed(toBeClaim);
          setEligibility(true);
          return true;
          }
          setLoading2(false);
          setEligibility(false);
        }
      } catch (err) {
        console.error(err);
        setLoading2(false);
        setTokensToBeClaimed(zero);
      }
    }
  }

  const claimBlueberryTokens = async () => {
    try {
      setLoading2(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
      const tx = await tokenContract.claim();
      

      await tx.wait();
      setLoading2(false);
      await getbalanceOfBlueberryTokens();
      await getTotalTokensMinted();
    } catch (err) {
      console.error(err);
      setLoading2(false);
    }
  };

  const mintGBCT = async (amount) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
      console.log('y')
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });


      await tx.wait();
      setLoading(false);

      await getTotalTokensMinted();
      await getBalanceOfBlueberryTokens();
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };



const getTotalTokensMinted = async () => {
  try {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
    const _tokensMinted = await tokenContract.totalSupply();
    setTokensMinted(_tokensMinted);
  } catch (err) {
    console.error(err);
  }
};
const getBalanceOfBlueberryTokens = async () => {
  try {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
    const signer = provider.getSigner();

    const address = await signer.getAddress();
    const balance = await tokenContract.balanceOf(address);
    setbalanceOfBlueberryTokens(balance);
  } catch (err) {
    console.error(err);
    setbalanceOfBlueberryTokens(zero);
  }
};

  useEffect (() => {
    getTotalTokensMinted();
    getBalanceOfBlueberryTokens();
  }, [isConnected]);

  function Load({prop}) {
    return (
      <button className={`${styles.transacButton} ${styles.loadButton} ${prop}`}>
      <svg className={styles.load} version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 100 100" enable-background="new 0 0 0 0" xmlSpace="preserve">
                <path fill="#010101" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                  <animateTransform 
                    attributeName="transform" 
                    attributeType="XML" 
                    type="rotate"
                    dur="1s" 
                    from="0 50 50"
                    to="360 50 50" 
                    repeatCount="indefinite" />
              </path>
      </svg>
      </button>
    )
  }
  const mintSection = () => {
    if (loading) {
      return (
        <div className={styles.center}>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
          <Load prop={styles.transacButtonB}/>
        </div>
      );
    }
    if (isConnected) {
      return (
        <div className={styles.center}>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
          <button className={`${styles.transacButton} ${styles.transacButtonB}`} onClick={() => mintGBCT(tokenAmount)}>
            MINT
          </button>
          
        </div>
        
      );
    }
  }
  const airdropSection = () => {

    if (loading2) {
      return (
        <div className={styles.center}>
          <Load prop = {styles.main}/>
        </div>
      );
      
      }
      if (isConnected && eligibility == undefined) {
        return (
          <div className={styles.center}>
            <button className={styles.transacButton} onClick={getTokenToBeClaim}>AIRDROP ?</button>
          </div>
        );
      }
      if (isConnected && eligibility == false) {
        return (
          <div className={styles.center}>
            <button className={styles.transacButton}>No</button>
          </div>
        );
      }
      if (tokensToBeClaimed > 0) {
        return (
          <div className={styles.center}>
            <div className={styles.description}>
              {tokensToBeClaimed * 10} Tokens can be claimed!
            </div>
            <button className={styles.transacButton} onClick={claimBlueberryTokens}>
              Claim Tokens
            </button>
          </div>
        );
      }
  }
    
  return (
    <div className={styles.container}>
      <Head>
        <title>Blueberry Coin</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css"></link>
        <link href="https://fonts.googleapis.com/css2?family=Oswald&family=VT323&display=swap" rel="stylesheet"></link>
      </Head>

      <div className={styles.main}>
        <div className={styles.header}>
          <p>Johra / GBC#2437</p>
        </div>
        <div className={styles.line}></div>
        <div className={styles.hero}>
        <img src={pink.src} className={`${styles.pink} ${styles.banner}`} alt="banner" />
        <img src={green.src} className={`${styles.green} ${styles.banner}`} alt="banner" />
        <img src={orange.src} className={`${styles.orange} ${styles.banner}`} alt="banner" />
        <div className={styles.imageContainer}>
          <Image src={devil} className={styles.image} alt="img" layout="fill" objectFit="cover" />
        </div>
        <div className={styles.opacity}>
            <h1 className={styles.title}>BLUEBERRY COIN</h1>
            <div className={styles.para}>
              <p className={styles.description}>This coin is purely fictional and fanmade </p>
            </div>
        </div>
        </div>

        <div className={styles.hero2}>
          <div className={styles.center}>
            <div>
            <h1 className={styles.title2}>AIRDROP AND MINT ARE LIVE</h1>

            {isConnected ? (
            <div className={styles.pad}>
              <div className={`${styles.center} ${styles.pad2}`}>
                <div className={`${styles.description} ${styles.descriptio}`}>
                If you own a GBC (from the testnet) you are eligible for an airdrop!
                </div>
              </div>
              <div className={`${styles.airdropSection} ${styles.pad2}`}>
                {airdropSection()}
              </div>
        
              <div className={`${styles.center} ${styles.pad2}`}>
                <div>
                <div className={styles.description}>
                  You have minted {utils.formatEther(balanceOfBlueberryTokens)} Blueberry Token 
                </div>
                <div className={styles.description}>
                  Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
                </div>
                </div>
              </div>

              <div className={`${styles.mintSection} ${styles.pad2}`}>
              {mintSection()}
              </div>
            
              
            </div>
          ) : (
            <div className={styles.center}>
              <ConnectButton />
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
