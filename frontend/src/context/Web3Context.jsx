import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contractConfig';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const checkNetwork = async (provider) => {
        const network = await provider.getNetwork();
        // Polygon Amoy Chain ID is 80002
        if (network.chainId !== 80002n) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x13882' }], // 80002 in hex
                });
            } catch (switchError) {
                // If the chain hasn't been added to MetaMask
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x13882',
                                chainName: 'Polygon Amoy Testnet',
                                nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                                blockExplorerUrls: ['https://amoy.polygonscan.com/']
                            }],
                        });
                    } catch (addError) {
                        console.error("Failed to add Amoy network", addError);
                    }
                }
            }
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                await checkNetwork(_provider);
                
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();
                const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
                
                setProvider(_provider);
                setSigner(_signer);
                setAccount(accounts[0]);
                setContract(_contract);

                // Check registration status
                const registered = await _contract.registeredFarmers(accounts[0]);
                setIsRegistered(registered);

            } catch (error) {
                console.error("Wallet connection failed", error);
            }
        } else {
            alert("Please install MetaMask or another Web3 wallet.");
        }
    };

    const registerFarmerOnChain = async () => {
        if (!contract) return;
        try {
            const tx = await contract.registerFarmer();
            await tx.wait();
            setIsRegistered(true);
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    return (
        <Web3Context.Provider value={{ account, provider, signer, contract, isRegistered, connectWallet, registerFarmerOnChain }}>
            {children}
        </Web3Context.Provider>
    );
};
