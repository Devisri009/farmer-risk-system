FarmVista – Climate-Aware Agricultural Supply Chain Platform

FarmVista is a climate-aware, blockchain-enabled agricultural supply chain platform designed to empower farmers with transparency, climate insights, and intelligent decision support.
The platform enables farmers to track crops, receive climate alerts, and make better selling decisions while ensuring transparent crop transactions between farmers and retailers.

🚜 Problem Statement

Farmers today face several major challenges in agricultural supply chains:

Lack of Supply Chain Transparency

Farmers do not know how crop prices increase from farm to market.
Multiple intermediaries increase prices, reducing farmer income.

Climate Uncertainty

Sudden rainfall, extreme heat, and humidity can damage crops after harvest.

Poor Selling Decisions

Farmers often sell crops at lower prices due to lack of market intelligence.

Language & Digital Barriers

Many farmers are not comfortable using English-based digital platforms.

Lack of Verifiable Tracking

Traditional agricultural markets lack a secure system to track crop ownership and price history.

These problems result in:

Reduced farmer income

Post-harvest losses

Market distrust

Financial instability

🌱 Proposed Solution

FarmVista introduces a Climate-Aware Blockchain Agricultural Platform that integrates:

Blockchain-based crop tracking

Climate risk monitoring

AI-based decision guidance

Financial sell vs wait comparison

Multilingual accessibility

QR-based supply chain transparency

This system helps farmers protect crops, make smarter decisions, and participate in a transparent marketplace.

⚙️ Key Features
🌾 Blockchain Crop Tracking

Farmers create crop batches after harvest.

Each transaction is recorded on blockchain.

Ownership transfers are permanently stored.

Supply chain flow:

Farmer → Retailer → Buyer

🌦 Climate Risk Monitoring

The system monitors environmental conditions using weather data:

Rain probability

Temperature

Humidity

Risk levels are displayed as:

🟢 Low
🟡 Moderate
🔴 High

Farmers receive alerts when climate risks may damage crops.

🤖 AI Guidance Assistant

The assistant provides real-time advice such as:

Whether to sell crops immediately

Storage recommendations

Market suggestions

Risk explanations

💰 Sell vs Wait Financial Comparison

FarmVista helps farmers compare profits.

Example:

Sell Today
₹20 × 1000 kg = ₹20,000

Wait 3 Days
₹24 × 1000 kg = ₹24,000

Potential Gain: ₹4,000

This enables data-driven decisions.

🌍 Multilingual Support

To improve rural accessibility, the platform supports:

English

Tamil

Users can switch languages directly from the dashboard.

🔎 QR-Based Crop Tracking

Each crop batch has a QR code.

When scanned, it shows:

Harvest date

Ownership history

Price journey

Blockchain verification

🏗 System Architecture
Frontend (React + Tailwind)
        │
        │ API Requests
        ▼
Backend (FastAPI)
        │
 ┌──────┼─────────┐
 │      │         │
 ▼      ▼         ▼
Blockchain   Neo4j DB   Weather API
(Polygon)
🧑‍💻 Tech Stack
Frontend

React.js

Tailwind CSS

React Router

Axios

Ethers.js

react-i18next

Backend

FastAPI

Python

Uvicorn

Blockchain

Solidity

Polygon Network

MetaMask

Databases

Neo4j (graph relationships)

PostgreSQL

External APIs

OpenWeatherMap API

📂 Project Structure
farmvista-climate-agri-platform
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── app
│   │   ├── routes
│   │   ├── services
│   │   ├── models
│   │   └── main.py
│   └── requirements.txt
│
├── blockchain
│   ├── contracts
│   │   └── CropTracking.sol
│   └── scripts
│
└── README.md
