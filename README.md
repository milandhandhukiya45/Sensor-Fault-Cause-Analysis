# Project Bolt SB1

A full-stack web application with a React (Vite + TypeScript) frontend and a Flask (Python) backend.

---

## Features
- Modern React frontend (Vite, TypeScript, Tailwind CSS)
- Python Flask backend with REST API
- Example endpoint: `/api/hello`

---

Sensor-Fault-Cause-Analysis/
├── .gitignore
├── App.tsx
├── DataAnalysis.tsx
├── DataUpload.tsx
├── ModelResults.tsx
├── RootCauseAnalysis.tsx
├── app.py
├── config.json
├── eslint.config.js
├── index.css
├── index.html
├── main.tsx
├── package-lock.json
├── package.json
├── postcss.config.js
├── requirements.txt
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── README.md

---

## Getting Started

### 1. Backend (Flask)

#### Setup
```sh
cd backend
python -m pip install -r requirements.txt
```

#### Run the backend
```sh
python app.py
```
- The backend will run at `http://127.0.0.1:5000`
- Test endpoint: [http://127.0.0.1:5000/api/hello](http://127.0.0.1:5000/api/hello)

---

### 2. Frontend (React + Vite)

#### Prerequisite
- **Node.js and npm must be installed.**
- Download from [https://nodejs.org/](https://nodejs.org/)

#### Setup
```sh
cd project
npm install
```

#### Run the frontend
```sh
npm run dev
```
- The frontend will run at `http://localhost:5173`

---

## Troubleshooting
- If `npm` is not recognized, install Node.js and restart your terminal.
- If `pip` is not recognized, ensure Python is installed and added to your PATH.
- If ports 5000 or 5173 are in use, change them in the respective configs.

---

## Deployment
- **Frontend:** Deploy to Vercel, Netlify, or GitHub Pages.
- **Backend:** Deploy to Render, Heroku, or any Python-friendly host.

---

## License
MIT
