# Swipe AI-Powered Interview Assistant

An AI-powered interview assistant for candidates and interviewers built with React, Node.js, and Google Gemini API.

---

## Project Overview

It is a web application that helps simulate real-world technical interviews for full-stack roles (React/Node). The app provides:

### Interviewee Tab
- Upload resume (PDF/DOCX)
- Automatic extraction of Name, Email, and Phone
- Timed AI-generated interview questions (Easy → Medium → Hard)
- Real-time scoring and AI feedback

### Interviewer Tab (Dashboard)
- List of all candidates with final score and summary
- Detailed chat history and question-by-question scoring
- Search and sort candidates

### Persistence
- Local storage ensures progress is saved even if the page is closed
- Welcome Back modal for unfinished interviews

---

## Features
- Resume parsing and missing field prompts
- AI-generated interview questions using Gemini API
- Timed interview flow:
  - Easy → 20s  
  - Medium → 60s  
  - Hard → 120s per question
- Candidate score calculation and summary generation
- Responsive UI with chat and dashboard tables
- Local state persistence using Redux + redux-persist
- Friendly error handling for invalid files or missing data

---

## Tech Stack
- **Frontend:** React, Vite, Redux, Ant Design (or shadcn)  
- **Backend:** Node.js, Express  
- **AI:** Google Gemini API (`text-bison-001`)  
- **State Management:** Redux with persistence (localStorage)  
- **File Parsing:** PDF/DOCX extraction (e.g., `pdf-parse`, `docx` libraries)

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Gemini API key from Google Generative AI

---

### Setup

#### Backend (Server)
1. Navigate to server folder:
   ```bash
   cd server

2. Install dependencies:
npm install

3. Configure environment variables:
cp .env.example .env

4. Set the following in .env:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=text-bison-001
PORT=4000

6. Start the server:
npm run dev

Server runs at: http://localhost:4000

#### Frontend (Client)
1. Navigate to client folder:
   ```bash
   cd client

2. Install dependencies:
npm install

3. Start the frontend:
npm run dev

Frontend runs at: http://localhost:5173
