import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "https://rpc-amoy.polygon.technology/")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("BLOCKCHAIN_PRIVATE_KEY")

# Simple ABI for the functions we need
ABI = [
	{
		"inputs": [
			{"internalType": "string", "name": "_cropName", "type": "string"},
			{"internalType": "string", "name": "_quantity", "type": "string"},
			{"internalType": "uint256", "name": "_pricePerKg", "type": "uint256"},
			{"internalType": "string", "name": "_location", "type": "string"},
			{"internalType": "string", "name": "_cultivateDate", "type": "string"},
			{"internalType": "string", "name": "_harvestDate", "type": "string"},
			{"internalType": "string", "name": "_description", "type": "string"},
			{"internalType": "string", "name": "_imagesIpfsHash", "type": "string"},
			{"internalType": "string", "name": "_riskLevel", "type": "string"}
		],
		"name": "registerCropBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

def get_web3():
    return Web3(Web3.HTTPProvider(RPC_URL))

def register_crop_on_blockchain(crop_data):
    """
    Registers a crop batch on the blockchain using the system's private key.
    """
    if not PRIVATE_KEY or PRIVATE_KEY == "your_private_key_here":
        print("Blockchain private key not configured. Skipping on-chain registration.")
        return None

    try:
        w3 = get_web3()
        
        # Security/Setup Check: Prevent using an address accidentally
        if PRIVATE_KEY.startswith("0x") and len(PRIVATE_KEY) == 42:
            print("❌ Setup Error: You pasted a Wallet ADDRESS instead of a PRIVATE KEY in .env.")
            print("Go to MetaMask -> Account Details -> Show Private Key to get the 64-character secret key.")
            return None

        account = w3.eth.account.from_key(PRIVATE_KEY)
        contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=ABI)

        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Prepare function arguments
        # Using placeholder for IPFS hash if not provided
        ipfs_hash = crop_data.get('ipfs_hash', 'QmPlaceholder12345')
        risk_level = crop_data.get('risk_level', 'Low')

        transaction = contract.functions.registerCropBatch(
            crop_data['crop_name'],
            crop_data['quantity'],
            int(float(crop_data['price_per_kg'])), # The contract expects uint256
            crop_data['location'],
            crop_data['cultivate_date'],
            crop_data['harvest_date'],
            crop_data['description'] or "N/A",
            ipfs_hash,
            risk_level
        ).build_transaction({
            'chainId': 80002, # Polygon Amoy
            'gas': 500000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })

        # Sign and send
        signed_tx = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        return w3.to_hex(tx_hash)

    except Exception as e:
        print(f"Blockchain Error: {e}")
        return None
