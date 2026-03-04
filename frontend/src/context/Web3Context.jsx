import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();
                setProvider(_provider);
                setSigner(_signer);
                setAccount(accounts[0]);
            } catch (error) {
                console.error("Wallet connection failed", error);
            }
        } else {
            alert("Please install MetaMask or another Web3 wallet.");
        }
    };

    return (
        <Web3Context.Provider value={{ account, provider, signer, connectWallet }}>
            {children}
        </Web3Context.Provider>
    );
};
