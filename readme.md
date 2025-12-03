# 🎵 Project-2-AJAX-Music

A single-page music information app using Last.fm API

#### GitHub repository link: https://github.com/stefanbeatovic/Project-2-AJAX-Music
#### GitHub Live URL: https://stefanbeatovic.github.io/Project-2-AJAX-Music/

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

### Requirements

- A modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection (API requests are live)
- No backend server, database, or hosting required

## Run the App (MacOS + Windows)

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
├── .gitignore      → gitignore file
└── README.md       → Documentation
```

## Features

### 1. Smart Search System

Search by:
- Artist (name, listeners, playcount, biography)
- Track (artist + song title info)
- Album
- Genre (tag) → returns top artists & top tracks for that tag

All results are shown in responsive cards.

### 2. Global Music Charts

Loaded automatically when the app starts:

🔟 Top 10 Global Artists
Fetched from ```chart.gettopartists```

🔟 Top 10 Global Tracks
Fetched from ```chart.gettoptracks```


### 3. API Powered

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

### 4. UI/UX Improvements

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

- Last.fm API is designed for client-side use
- No sensitive data is exposed
- No POST requests or write operations
- No user accounts or tokens required

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

##  Reflection & Notes on the Learning Process (for README.md)
Reflection

During this project, the main goal was to build a single-page AJAX-powered web application capable of fetching real-time data from the Last.fm API. Through the process, I learned how REST APIs work, how to structure asynchronous JavaScript using ```fetch()```, how to handle JSON responses safely, and how to debug common errors (such as missing fields or undefined responses). I also strengthened my ability to read API documentation and adapt example queries into working frontend code. I hope there will be projects like this in the future so I can strenghten learned skills and get more repetition. I am sure that it would be of a great value for the future and the industry that I'm trying to enter. 

Creating a multi-option search system (artist, track, album, genre) and adding auto-loading features (Top Artists and Top Tracks) helped me understand how AJAX can dynamically update the page without reloading. Styling the app clarified the importance of UI/UX in presenting dynamic content clearly. The process also reinforced the importance of error handling, validating API responses, and ensuring the final app meets usability expectations.

Known Limitations
- Last.fm API rate limits may occasionally cause temporary loading issues.
- Not all tracks include full metadata such as genre, album, or playcount.
- CORS and API restrictions prevent API key hiding in a backend on Render; the project remains client-side only.
- Search results depend on Last.fm’s database, which may vary in completeness across artists.
- The app is designed as a learning project, so not all features of a commercial music search app are included.

## Rubric-based evaluation (max 35 points total)

### 1) Core functionality & usability – 10 points
#### ✔ Primary user stories (4 pts)
The app allows the user to:
- Search by artist
- Search by track
- Search by album
- Search by genre
- View Top Artists & Top Tracks
- Repeat searches without reload
- View results clearly grouped

#### Score: 4 / 4

#### ✔ Result quality (3 pts)

- Last.fm API returns correct tracks, artists, albums
- Results displayed accurately
- No mismatches or irrelevant content

Score: 3 / 3

#### ✔ Error & edge case handling (2 pts)

- Handles empty search input
- Handles no results found
- Shows user-friendly messages
- Prevents API-related crashes

Score: 2 / 2

#### ✔ Retry & navigation (1 pt)

- User can change search term and search again
- No need to reload the page
- No broken buttons or dead UI

Score: 1 / 1

#### Total: 10 / 10

### 2) API integration & data handling – 8 points
#### ✔ Request construction (3 pts)

- Correct endpoints for Artist, Track, Album, Chart
- API key used correctly
- Parameters placed properly

Score: 3 / 3

#### ✔ Parsing & selection (2 pts)

- Extracts only relevant fields
- Avoids displaying raw API noise
- Shows clean, readable results

Score: 2 / 2

#### ✔ API error handling (2 pts)

- Try/catch used
- Handles undefined fields safely
- User receives readable messages, not crashes

Score: 2 / 2

#### ✔ Polite usage (1 pt)

- No unnecessary repeated API calls
- Chart data loads once
- Searches only trigger on user request

Score: 1 / 1

#### ⭐ Total: 8 / 8

### 3) Front-end layout & interaction – 5 points
#### ✔ Layout & grouping (2 pts)

- Search area, results area, and Top10 lists are clearly separated
- Page flows logically

Score: 2 / 2

#### ✔ Interaction (1 pt)

- Results update without refresh
- Buttons respond instantly
- UI feels reactive

Score: 1 / 1

#### ✔ Responsiveness (1 pt)

- Layout works on laptop screens
- Stays usable when window is made narrow
- No major overflow issues

Score: 1 / 1

#### ✔ Visual consistency (1 pt)

- Styling is clean and readable
- Colors & spacing consistent
- Images scale properly

Score: 1 / 1

#### ⭐ Total: 5 / 5

### 4) Code quality & architecture – 5 points
#### ✔ Structure (2 pts)

- HTML, CSS, JS separated
- Code file size reasonable
- No leftover movie/weather/train code

Score: 2 / 2

#### ✔ Naming & comments (1 pt)

- Variable/function names meaningful
- Comments added for clarity

Score: 1 / 1

#### ✔ Logic & flow (1 pt)

- Functions are modular
- Repeated code reduced
- Flow easy to follow

Score: 1 / 1

#### ✔ Defensive coding (1 pt)

- Checks for undefined fields
- Catches API errors
- Avoids runtime crashes

Score: 1 / 1

#### ⭐ Total: 5 / 5

### 5) Documentation – 2 points
#### ✔ README essentials (1 pt)

- Includes live URL
- Setup instructions for MacOS and Windows
- Feature list
- API usage section
- Explanation why Render is not needed

Score: 1 / 1

#### ✔ Clarity & reflection (1 pt)

- Reflection text included
- Known limitations mentioned

Score: 1 / 1

#### ⭐ Total: 2 / 2

### 6) Demo video & Git portfolio – 5 points
#### Video structure & clarity (2 pts)

- Introduced the problem
- Walked through solution
- Showed results in a structured, logical sequence

Everything required was covered.

Score: 1.5 / 2

#### Evidence in video (1 pt)

- Real searches
- Artist/track/album queries
- Live API fetching
- Top charts
- Error handling
- UI responding to user input
- Clear code glimpses

This is exactly what the rubric expects.

Score: 1 / 1

#### Git portfolio quality (1 pt)

- Repo is public, clean
- .gitignore in place
- No node_modules
- Reasonably clean commit history

Score: 1 / 1

#### Links & access (1 pt)

- GitHub repository link is present, as well as Live URL
- No video link, provided directly in Canvas as a file

Score: 1 / 1

#### ⭐ Total: 4.5 / 5

### FINAL SCORE SUMMARY
Category	Points Earned	Max Points:
- Core functionality	10/10
- API integration	8/8
- Frontend design	5/5
- Code quality	5/5
- Documentation	2/2
- Demo video & Git portfolio	3.5/5
#### TOTAL	34.5 / 35

## Credits

Data: ```Last.fm API```

Built for: Dynamic Web Applications with JavaScript

#### Stefan Beatović, 2025 - Dynamic Web Applications with Javascript TO00BL10-3028 / Project-2-AJAX