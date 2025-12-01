# Project-2-AJAX-Music

Simple Last.fm-based music search app. I have been introduced with Last-fm almost 20 years ago. This was one of the biggest reasons I decided to make a mucis app. And on top of that, I really love music. Listen it every day, even while doing this assignments. 

Search artists, tracks and albums and open detail panels for additional artist/track/album info.

## Quick start

1. Open ```index.html``` in your browser (no build step).
2. Type an artist, track or album into the search field and press "Search".
3. Click result cards or buttons to open details in the side panel.

## Features

- Multi-result search (artist / track / album).
- Detail views via Last.fm endpoints (artist.getInfo, track.getInfo, album.getInfo).
- Top tracks, top albums and similar artists for an artist.
- Graceful handling of missing fields and loading / error messages.

## Files

- ```index.html```— main HTML UI.
- ```styles.css``` — layout and visual styles.
- ```app.js``` — application logic and API calls.

#### Path
```
Project-2-AJAX-Music/
├── index.html
├── app.js
└── styles.css
```

Key functions in the code:
- `doSearch` — orchestrates searches and renders results.
- `buildLastFmUrl` — builds request URLs for Last.fm API.
- `fetchJson` — generic fetch + error handling.
- `fetchAndShowArtistInfo`, `fetchAndShowTrackInfo`, `fetchAndShowAlbumInfo` — load and render detail views.

(Open the above links to inspect the implementations.)

## Usage notes

- The Last.fm API key is set in [app.js] for convenience. For production repositories avoid committing secrets; use environment variables or a server proxy.
- The app relies on the Last.fm JSON API (BASE_URL = `https://ws.audioscrobbler.com/2.0/`). Network errors and non-OK HTTP responses are shown in the status area.

## Deployment

- Static site — can be deployed to GitHub Pages or any static host.
- Ensure CORS/network access to Last.fm from the deployed origin.

Launch locally from ```Visual Studio Code``` (Windows and macOS)

- Option A — Live Server (recommended)
  1. Install the ```Live Server``` extension (Ritwick Dey) in VS Code.
  2. Open the project folder in VS Code:
     - macOS / Linux: open Terminal in the project folder and run `code .` (if CLI is installed).
     - Windows: open the folder in VS Code via File → Open Folder... or use `code .` in Command Prompt / PowerShell.
  3. Open `index.html` in the editor and click "Go Live" in the status bar or right-click the file → "Open with Live Server".
  4. The app will open at a local address (e.g. `http://127.0.0.1:5500`) and auto-reload on file changes.

- Option B — VS Code integrated terminal (no extension)
  1. Open the integrated terminal (View → Terminal or Ctrl+` / Cmd+`).
  2. Run a simple static server from the project root:
     - Python 3 (macOS / Linux / Windows with Python installed):
       - `python3 -m http.server 5500` or on some Windows installs `python -m http.server 5500`
     - Node (no global install required):
       - `npx http-server -p 5500`
  3. Open the URL in your browser:
     - macOS: `open http://localhost:5500`
     - Windows (PowerShell): `Start-Process "http://localhost:5500"`
     - Or manually paste `http://localhost:5500` into the browser address bar.

Tips:
- Live Server provides the easiest workflow (auto-reload and integrated browser preview).
- If `code .` is not available, enable the "code" command from VS Code: Command Palette → "Shell Command: Install 'code' command in PATH" (macOS) or use File → Open Folder... (Windows).
- When deploying to GitHub Pages, push the repository and enable Pages in repository settings.

## Troubleshooting

- If searches return "No results found." or "Error fetching data", check browser console for detailed errors.
- If API calls fail with HTTP status errors, confirm the API key in ```app.js``` and Last.fm service availability.

#### Stefan Beatović, 2025 - Dynamic Web Applications with Javascript TO00BL10-3028 / Project-2-AJAX