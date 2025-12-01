# Project-2-AJAX-Music

Simple Last.fm-based music search app.
Search artists, tracks and albums and open detail panels for additional artist/track/album info.

## Quick start

1. Open [index.html](index.html) in your browser (no build step).
2. Type an artist, track or album into the search field and press "Search".
3. Click result cards or buttons to open details in the side panel.

## Features

- Multi-result search (artist / track / album).
- Detail views via Last.fm endpoints (artist.getInfo, track.getInfo, album.getInfo).
- Top tracks, top albums and similar artists for an artist.
- Graceful handling of missing fields and loading / error messages.

## Files

- [index.html](index.html) — main HTML UI.
- [styles.css](styles.css) — layout and visual styles.
- [app.js](app.js) — application logic and API calls.

#### Path
```
Project-2-AJAX-Music/
├── index.html
├── app.js
└── styles.css
```

Key functions in the code:
- [`doSearch`](app.js) — orchestrates searches and renders results.
- [`buildLastFmUrl`](app.js) — builds request URLs for Last.fm API.
- [`fetchJson`](app.js) — generic fetch + error handling.
- [`fetchAndShowArtistInfo`](app.js), [`fetchAndShowTrackInfo`](app.js), [`fetchAndShowAlbumInfo`](app.js) — load and render detail views.

(Open the above links to inspect the implementations.)

## Usage notes

- The Last.fm API key is set in [app.js](app.js) for convenience. For production repositories avoid committing secrets; use environment variables or a server proxy.
- The app relies on the Last.fm JSON API (BASE_URL = `https://ws.audioscrobbler.com/2.0/`). Network errors and non-OK HTTP responses are shown in the status area.

## Deployment

- Static site — can be deployed to GitHub Pages or any static host.
- Ensure CORS/network access to Last.fm from the deployed origin.

## Troubleshooting

- If searches return "No results found." or "Error fetching data", check browser console for detailed errors.
- If API calls fail with HTTP status errors, confirm the API key in [app.js](app.js) and Last.fm service availability.

## Notes for evaluators / maintainers

- All events are attached dynamically via `addEventListener` in [app.js](app.js).
- Rendering is done via DOM creation / innerHTML in detail panels and result cards.
- Utility helpers: `escapeHtml`, `escapeAttr`, `stripHtml`, `msToTime` are in [app.js](app.js).

License: MIT