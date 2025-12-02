# 🎵 Project-2-AJAX-Music

A single-page music information app using Last.fm API

## 📌 Overview

Project-2-AJAX-Music is a lightweight single-page web application built for a school assignment.

I have been introduced with Last.fm almost 20 years ago. This was one of the biggest reasons I decided to make a music app. And on top of that, I really love music. Listen it every day, even while doing this assignment. 

The app uses JavaScript’s fetch() API to load live music data from Last.fm, including:

- Artist search & detailed info
- Track search & track info
- Album search
- Genre (tag) search
- Global Top 10 Artists
- Global Top 10 Tracks

The app demonstrates AJAX calls, DOM manipulation, API integration, and responsive UI styling using HTML, CSS, and vanilla JavaScript.

## 🚀 Quick Start

### ✔️ Requirements

- A modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection (API requests are live)
- No backend server, database, or hosting required

## ▶️ Run the App (MacOS + Windows)

### Option 1: Use VS Code + Live Server (Recommended)
MacOS + Windows:
1. Install VS Code
2. Open the project folder
3. Install the Live Server extension
4. Right-click index.html → Open with Live Server

### Option 2 (MacOS): simple Python server

Open Terminal inside the project folder:

Python 3:
```
python3 -m http.server 5500
```

Then open in browser:
```
http://localhost:5500
````

### Option 3 (Windows): PowerShell

Inside project folder:
```
python -m http.server 5500
````

## 📁 Project Structure
```
Project-2-AJAX-Music/
│
├── index.html      → UI layout + search interface
├── styles.css      → Custom responsive styling
├── app.js          → AJAX logic + API integration
└── README.md       → Documentation
```

## ✨ Features

### 1. Smart Search System

Search by:
- Artist (name, listeners, playcount, biography)
- Track (artist + song title info)
- Album
- Genre (tag) → returns top artists & top tracks for that tag

All results are shown in responsive cards.

### 🧩 2. Global Music Charts

Loaded automatically when the app starts:

🔟 Top 10 Global Artists
Fetched from ```chart.gettopartists```

🔟 Top 10 Global Tracks
Fetched from ```chart.gettoptracks```


### 🔄 3. API Powered

Uses Last.fm API endpoints:
```
- artist.search
- artist.getinfo
- track.search
- track.getInfo
- album.search
- tag.gettopartists
- tag.gettoptracks
- chart.gettopartists
- chart.gettoptracks
```

### 🎨 4. UI/UX Improvements

- Responsive grid layout
- Clean card-based design
- Muted metadata sections
- Works on desktop + mobile
- Clear status messages (loading, errors, empty results)

## 📘 API Documentation (Used by the App)

All API calls follow:
```
https://ws.audioscrobbler.com/2.0/?method=...&api_key=YOUR_KEY&format=json
````

## 🔑 API Key Use

API key is embedded client-side (public), because:

- ✔️ Last.fm API is designed for client-side use
- ✔️ No sensitive data is exposed
- ✔️ No POST requests or write operations
- ✔️ No user accounts or tokens required

## ❌ Why Render is not being used (Backend)

Some APIs require a backend server to hide secret keys — Last.fm does NOT.

You do NOT need Render because:
- API key is not considered sensitive
- Only making read-only public GET requests
- There is no user authentication
- It is a front-end–only school project
- No database or server-side logic is required

Using Render would add unnecessary complexity (deploying Node.js, routing, proxying).

➡️ Storing the key in ```.env``` on a backend would not improve security for this specific assignment.

## 🛠️ Troubleshooting
### ❌ “Error fetching data”

Check:
- Internet connection
- Typing mistakes in search
- Last.fm rate limit (rare)

### ❌ “undefined” in results

Usually means:
- Artist/track/album not found
- API returned an empty object
- Genre/tag may not exist

Try another search term.

### ❌ Nothing loads on startup

Make sure JavaScript is allowed in your browser.

## 🙌 Credits

Data: ```Last.fm API```

Built for: Dynamic Web Applications with JavaScript

#### Stefan Beatović, 2025 - Dynamic Web Applications with Javascript TO00BL10-3028 / Project-2-AJAX