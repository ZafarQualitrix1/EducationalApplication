# 🚀 Code Warrior - Application Launcher Guide

This guide explains how to launch the Code Warrior application (Backend & Frontend servers).

---

## 📋 Quick Start

### Option 1: PowerShell Script (Recommended for Windows)

1. **Open PowerShell** as Administrator
2. **Navigate to the project directory:**
   ```powershell
   cd "C:\Users\Admin\Downloads\code_warrier_03-20260213T152959Z-3-001\code_warrier_03"
   ```
3. **Run the launcher script:**
   ```powershell
   .\Launch.ps1
   ```
4. **Two terminal windows will open** showing:
   - ✅ Backend Server on `http://localhost:5000`
   - ✅ Frontend Server on `http://localhost:3000`

---

## 🔧 Alternative Launch Methods

### Option 2: Batch File (Simple for Windows)

1. **Navigate to the project folder** in File Explorer
2. **Double-click `Launch.bat`**
3. **Two Command Prompt windows will open** with the servers

---

### Option 3: Bash Script (macOS/Linux)

1. **Open Terminal**
2. **Navigate to project directory:**
   ```bash
   cd /path/to/code_warrier_03
   ```
3. **Make the script executable:**
   ```bash
   chmod +x Launch.sh
   ```
4. **Run the launcher:**
   ```bash
   ./Launch.sh
   ```

---

### Option 4: HTML Launcher (Visual Interface)

1. **Open `Launcher.html`** in your web browser
   - Double-click the file, OR
   - Right-click → Open with → Your preferred browser
2. **Click the "Launch Servers" button**
3. **Follow the on-screen instructions**
4. **Check server status** by clicking "Check Status"
5. **Access the application** using the provided links

---

### Option 5: Manual Launch (Command Line)

#### Start Backend:
```powershell
# Windows PowerShell
cd backend
$env:NODE_ENV='development'
node server.js
```

```bash
# macOS/Linux
cd backend
export NODE_ENV=development
node server.js
```

#### Start Frontend (in a new terminal):
```powershell
# Windows PowerShell
cd frontend
npm start
```

```bash
# macOS/Linux
cd frontend
npm start
```

---

## 📍 Access Your Application

Once both servers are running:

- **Frontend (React App):** http://localhost:3000
- **Backend (API Server):** http://localhost:5000

---

## 🛑 Stopping the Servers

### Method 1: Close Terminal Windows
Simply close the terminal/command prompt windows where the servers are running.

### Method 2: PowerShell Command
```powershell
Stop-Process -Name node -Force
```

### Method 3: Task Manager (Windows)
1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Find "node.exe" processes
3. Select and click "End Task"

### Method 4: Kill Command (macOS/Linux)
```bash
pkill -f "node"
```

---

## 📊 Server Information

### Backend Server
- **Framework:** Express.js 5.1.0
- **Language:** Node.js
- **Port:** 5000
- **Database:** MySQL
- **Environment:** Development (http://localhost:5000)

### Frontend Server
- **Framework:** React 19.1.1
- **Port:** 3000
- **URL:** http://localhost:3000
- **Build Tool:** Create React App (Webpack)

---

## 🔍 Troubleshooting

### Servers fail to start
1. **Check if ports are already in use:**
   ```powershell
   netstat -ano | Select-String "(3000|5000)"
   ```
2. **Kill existing Node processes:**
   ```powershell
   Stop-Process -Name node -Force
   ```
3. **Try again**

### Port Already in Use
- **Change port** or kill the process using your port
- For Windows: Use Process ID (PID) from netstat output:
  ```powershell
  Get-Process | Where-Object {$_.Id -eq PROCESS_ID} | Stop-Process -Force
  ```

### MySQL Connection Error
1. Ensure MySQL is running (port 3306)
2. Check `.env.development` file has correct credentials
3. Verify database `student_app` exists

### Frontend shows "Cannot GET /"
- Backend server may not be running
- Check that port 5000 is listening
- Click "Check Status" in Launcher.html

---

## 📝 Logs & Debugging

### View Backend Logs
The backend server displays logs in its terminal:
- Database connections
- API requests
- Errors

### View Frontend Logs
The frontend shows logs in:
- Browser Console (F12 → Console tab)
- Terminal output during compilation

---

## ✨ Features

### Available Launch Scripts

| File | OS | Type | How to Use |
|------|--------|------|-----------|
| `Launch.ps1` | Windows | PowerShell | `.\Launch.ps1` |
| `Launch.bat` | Windows | Batch | Double-click |
| `Launch.sh` | macOS/Linux | Bash | `./Launch.sh` |
| `Launcher.html` | All | Web UI | Open in browser |

---

## 🎯 Next Steps

1. **Launch the application** using one of the methods above
2. **Open the frontend** at http://localhost:3000
3. **Register or Login** to access the dashboard
4. **Explore features:**
   - Student Registration & Login
   - Dashboard with Profile
   - Study Tracking
   - Rankings System
   - Course Management

---

## 📞 Support

If you encounter issues:

1. Check the terminal output for error messages
2. Verify MySQL is running
3. Ensure ports 3000 and 5000 are available
4. Check environment files (`.env.development`)
5. Review the DATABASE_SCHEMA.md for database setup

---

## 🎉 You're All Set!

Your Code Warrior application is ready to launch. Choose any method above and get started!

**Happy Coding! 🚀**
