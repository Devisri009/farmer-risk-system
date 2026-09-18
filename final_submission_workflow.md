# 🚀 Final Submission Workflow: Stable FarmVista System

This guide provides the exact "Proper Workflow" you need to follow to ensure the FarmVista system runs perfectly for your project submission.

## 1. 🧹 The "Clean Slate" Process (Do this first)
Before starting the app, you must clear out older versions that might be "stuck" in the background.

1.  **Close ALL** Command Prompts, PowerShells, and Terminals on your computer.
2.  In VS Code, go to the **Terminal** tab and kill any active processes by clicking the 🗑️ (trash can) icon.

---

## 2. 🐍 VS Code Interpreter Sync (Prevent "Red Lines")
If you still see "red lines" or "import errors" in `main.py`, follow this:
1.  Click inside `backend/app/main.py`.
2.  Press `Ctrl + Shift + P`.
3.  Search for **Python: Select Interpreter**.
4.  Choose the one that points to `.\backend\venv\Scripts\python.exe`.
    *   *If you don't see it, choose 'Enter interpreter path' and select that file manually.*

---

## 3. 🚦 Starting the System
Always use the optimized `start_all.bat` script.

1.  Open your file explorer to `C:\Users\acer\Documents\Farmer-Risk-System\`.
2.  **Double-click `start_all.bat`**.
3.  Two black windows will open: one for the **Backend (Port 5000)** and one for the **Frontend (Port 5173)**.
4.  **Wait** until the Backend shows: `Uvicorn running on http://127.0.0.1:5000`.

---

## 4. 🔑 Troubleshooting the "Unauthorized" (401) Error
If you see **"Request failed with status code 401"** or **"Action Failed"**:
*   **Cause:** Your browser has an old "Security Token" that doesn't match the new, fixed backend.
*   **The Fix:**
    1.  Click the **Logout** button (bottom left of the sidebar).
    2.  Refresh the page (`F5`).
    3.  **Login again** with your username (e.g., `sri1` or `sneha1`).
    4.  Your session is now "Fresh" and will stay active for **24 hours**.

---

## 5. 💎 Verifying the Features
Once you are logged in, here is how you prove its working:

### **A. Blockchain Registration** (Farmer Role)
1.  Go to **Post Crop**.
2.  Fill in the details and click **Submit**.
3.  **Success Banner:** You will see "Crop Posted Successfully."
4.  **Check Terminal:** Look at the Backend black window. You will see:
    > `BLOCKCHAIN: SUCCESS! Tx Hash: 0x...`
5.  Go to **My Batches**; after 5-10 seconds, the crop will show a **Verified** badge.

### **B. AI Assistant** (Global)
1.  Open the Chatbot (Green bubble bottom right).
2.  Ask: *"What is the best way to grow tomatoes?"*
3.  The system uses **Gemini 1.5 Flash** to provide a professional agricultural response.

---

## ✅ You are Ready for Submission!
I have verified the code logic, established a permanent fix for the CORS policy, and increased the session security token time. Your system is now **technically solid** for your submission tomorrow.
