/*
  app.js
  Expanded music app using Last.fm:
  - multi-result search (artist / track / album)
  - details views via artist.getInfo, track.getInfo, album.getInfo
  - top tracks / top albums / similar artists
  - graceful handling of missing fields
*/

const API_KEY = "f83c0a91d770c95791c7bbdf93dd0055";
const BASE_URL = "https://ws.audioscrobbler.com/2.0/";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsGrid = document.getElementById("results");
const statusEl = document.getElementById("status");
const detailsPanel = document.getElementById("detailsPanel");
const detailsContent = document.getElementById("detailsContent");
const closeDetailsBtn = document.getElementById("closeDetails");

// Helper: build URL with method + params
function buildLastFmUrl(params = {}) {
  params.api_key = API_KEY;
  params.format = "json";

  const query = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  return `${BASE_URL}?${query}`;
}

// Utility: safe access for nested properties
const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);

// UI Helpers
function setStatus(text) {
  statusEl.textContent = text;
}
function clearStatus() {
  statusEl.textContent = "";
}
function clearResults() {
  resultsGrid.innerHTML = "";
}

// Show details panel
function openDetails(html) {
  detailsContent.innerHTML = html;
  detailsPanel.setAttribute("aria-hidden", "false");
}
function closeDetails() {
  detailsContent.innerHTML = "";
  detailsPanel.setAttribute("aria-hidden", "true");
}
closeDetailsBtn.addEventListener("click", closeDetails);

// ------------------------------
// Search flow
// ------------------------------
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (!q) {
    setStatus("Type an artist, track or album to search.");
    return;
  }
  // get selected type
  const type = document.querySelector('input[name="searchType"]:checked').value;
  doSearch(q, type);
});

async function doSearch(query, type = "all") {
  setStatus("Searching...");
  clearResults();

  try {
    // run the three searches in parallel (artist/track/album)
    const promises = [];
    if (type === "all" || type === "artist") promises.push(searchArtist(query));
    else promises.push(Promise.resolve(null));

    if (type === "all" || type === "track") promises.push(searchTrack(query));
    else promises.push(Promise.resolve(null));

    if (type === "all" || type === "album") promises.push(searchAlbum(query));
    else promises.push(Promise.resolve(null));

    const [artistData, trackData, albumData] = await Promise.all(promises);

    let any = false;

    // render artists (up to 6)
    const artists = artistData?.results?.artistmatches?.artist || [];
    if (artists.length) {
      any = true;
      const fragment = document.createDocumentFragment();
      artists.slice(0,6).forEach(a => {
        fragment.appendChild(createArtistCard(a));
      });
      resultsGrid.appendChild(fragment);
    }

    // render tracks (up to 6)
    const tracks = trackData?.results?.trackmatches?.track || [];
    if (tracks.length) {
      any = true;
      const fragment = document.createDocumentFragment();
      tracks.slice(0,6).forEach(t => {
        fragment.appendChild(createTrackCard(t));
      });
      resultsGrid.appendChild(fragment);
    }

    // render albums (up to 6)
    const albums = albumData?.results?.albummatches?.album || [];
    if (albums.length) {
      any = true;
      const fragment = document.createDocumentFragment();
      albums.slice(0,6).forEach(al => {
        fragment.appendChild(createAlbumCard(al));
      });
      resultsGrid.appendChild(fragment);
    }

    if (!any) {
      setStatus("No results found.");
    } else {
      clearStatus();
    }

  } catch (err) {
    console.error("Search error:", err);
    setStatus("Error fetching data. See console for details.");
  }
}

// ------------------------------
// Create result cards
// ------------------------------
function createArtistCard(a) {
  const el = document.createElement("article");
  el.className = "result-card";

  const imgUrl = (a.image && a.image.length && a.image[a.image.length-1]["#text"]) || "";
  const name = safe(a.name, "Unknown");
  const listeners = safe(a.listeners, "—");

  el.innerHTML = `
    ${imgUrl ? `<img class="thumb" src="${imgUrl}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Listeners: ${escapeHtml(listeners)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="artist-details" data-artist="${escapeAttr(name)}">Details</button>
      <button class="btn-ghost" data-action="artist-toptracks" data-artist="${escapeAttr(name)}">Top tracks</button>
    </div>
  `;

  // Events (delegated)
  el.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      const action = btn.getAttribute("data-action");
      const artistName = btn.getAttribute("data-artist");
      if (action === "artist-details") fetchAndShowArtistInfo(artistName);
      if (action === "artist-toptracks") fetchAndShowArtistTopTracks(artistName);
    });
  });

  return el;
}

function createTrackCard(t) {
  const el = document.createElement("article");
  el.className = "result-card";

  const imgUrl = (t.image && t.image.length && t.image[t.image.length-1]["#text"]) || "";
  const name = safe(t.name, "Unknown");
  const artist = safe(t.artist, "Unknown");

  el.innerHTML = `
    ${imgUrl ? `<img class="thumb" src="${imgUrl}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Artist: ${escapeHtml(artist)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="track-details" data-artist="${escapeAttr(artist)}" data-track="${escapeAttr(name)}">Details</button>
    </div>
  `;

  el.querySelector("button").addEventListener("click", () => {
    fetchAndShowTrackInfo(artist, name);
  });

  return el;
}

function createAlbumCard(al) {
  const el = document.createElement("article");
  el.className = "result-card";

  const imgUrl = (al.image && al.image.length && al.image[al.image.length-1]["#text"]) || "";
  const name = safe(al.name, "Unknown");
  const artist = safe(al.artist, "Unknown");

  el.innerHTML = `
    ${imgUrl ? `<img class="thumb" src="${imgUrl}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Artist: ${escapeHtml(artist)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="album-details" data-artist="${escapeAttr(artist)}" data-album="${escapeAttr(name)}">Details</button>
    </div>
  `;

  el.querySelector("button").addEventListener("click", () => {
    fetchAndShowAlbumInfo(artist, name);
  });

  return el;
}

// ------------------------------
// Fetch helper functions
// ------------------------------
async function searchArtist(q) {
  const url = buildLastFmUrl({ method: "artist.search", artist: q });
  return fetchJson(url);
}
async function searchTrack(q) {
  const url = buildLastFmUrl({ method: "track.search", track: q });
  return fetchJson(url);
}
async function searchAlbum(q) {
  const url = buildLastFmUrl({ method: "album.search", album: q });
  return fetchJson(url);
}

async function fetchArtistInfo(artistName) {
  const url = buildLastFmUrl({ method: "artist.getinfo", artist: artistName, autocorrect: 1 });
  return fetchJson(url);
}
async function fetchTrackInfo(artistName, trackName) {
  const url = buildLastFmUrl({ method: "track.getInfo", artist: artistName, track: trackName, autocorrect: 1 });
  return fetchJson(url);
}
async function fetchAlbumInfo(artistName, albumName) {
  const url = buildLastFmUrl({ method: "album.getInfo", artist: artistName, album: albumName, autocorrect: 1 });
  return fetchJson(url);
}
async function fetchArtistTopTracks(artistName, limit = 10) {
  const url = buildLastFmUrl({ method: "artist.getTopTracks", artist: artistName, limit });
  return fetchJson(url);
}
async function fetchArtistTopAlbums(artistName, limit = 8) {
  const url = buildLastFmUrl({ method: "artist.getTopAlbums", artist: artistName, limit });
  return fetchJson(url);
}
async function fetchArtistSimilar(artistName, limit = 8) {
  const url = buildLastFmUrl({ method: "artist.getSimilar", artist: artistName, limit });
  return fetchJson(url);
}

// Generic JSON fetch with error handling
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ------------------------------
// Detail views
// ------------------------------
async function fetchAndShowArtistInfo(artistName) {
  try {
    setStatus("Loading artist info...");
    const [info, topTracks, topAlbums, similar] = await Promise.all([
      fetchArtistInfo(artistName),
      fetchArtistTopTracks(artistName, 8),
      fetchArtistTopAlbums(artistName, 8),
      fetchArtistSimilar(artistName, 8)
    ]);

    const art = info?.artist;
    if (!art) {
      setStatus("Artist details not available.");
      return;
    }

    // gather images (choose largest available)
    const img = (art.image && art.image.length && art.image[art.image.length-1]["#text"]) || "";

    const bio = (art.bio && art.bio.summary) ? stripHtml(art.bio.summary) : "No biography available.";
    const tags = art.tags?.tag || [];

    const topTracksArr = topTracks?.toptracks?.track || [];
    const topAlbumsArr = topAlbums?.topalbums?.album || [];
    const similarArr = similar?.similarartists?.artist || [];

    // build html
    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(art.name)}">` : `<div style="width:110px;height:110px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2>${escapeHtml(art.name)}</h2>
          <div class="details-meta">Listeners: ${escapeHtml(art.stats?.listeners || "—")} • Playcount: ${escapeHtml(art.stats?.playcount || "—")}</div>
          <div class="section tag-list" style="margin-top:8px">
            ${tags.slice(0,6).map(t => `<span class="tag">${escapeHtml(t.name)}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="section">
        <h4>Biography</h4>
        <div>${escapeHtml(bio)}</div>
      </div>
    `;

    if (topTracksArr.length) {
      html += `<div class="section"><h4>Top tracks</h4><ol>`;
      topTracksArr.slice(0,8).forEach(tr => {
        const tname = tr.name || "";
        const tart = tr.artist?.name || artistName;
        html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeAttr(tart)}" data-track="${escapeAttr(tname)}">${escapeHtml(tname)}</button></li>`;
      });
      html += `</ol></div>`;
    }

    if (topAlbumsArr.length) {
      html += `<div class="section"><h4>Top albums</h4><div class="tag-list">`;
      topAlbumsArr.slice(0,8).forEach(al => {
        const aname = al.name || "";
        const aartist = al.artist?.name || artistName;
        html += `<button class="tag btn-ghost" data-action="open-album" data-artist="${escapeAttr(aartist)}" data-album="${escapeAttr(aname)}">${escapeHtml(aname)}</button>`;
      });
      html += `</div></div>`;
    }

    if (similarArr.length) {
      html += `<div class="section"><h4>Similar artists</h4><div class="tag-list">`;
      similarArr.slice(0,8).forEach(s => {
        html += `<button class="tag btn-ghost" data-action="open-artist" data-artist="${escapeAttr(s.name)}">${escapeHtml(s.name)}</button>`;
      });
      html += `</div></div>`;
    }

    openDetails(html);
    clearStatus();

    // delegate clicks inside details panel (track / album / artist buttons)
    detailsContent.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const action = btn.getAttribute("data-action");
        if (action === "open-track") {
          const artist = btn.getAttribute("data-artist");
          const track = btn.getAttribute("data-track");
          fetchAndShowTrackInfo(artist, track);
        } else if (action === "open-album") {
          fetchAndShowAlbumInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-album"));
        } else if (action === "open-artist") {
          fetchAndShowArtistInfo(btn.getAttribute("data-artist"));
        }
      });
    });

  } catch (err) {
    console.error("Artist info error:", err);
    setStatus("Could not load artist details.");
  }
}

async function fetchAndShowTrackInfo(artistName, trackName) {
  try {
    setStatus("Loading track info...");
    const data = await fetchTrackInfo(artistName, trackName);

    const tr = data?.track;
    if (!tr) {
      setStatus("Track details not available.");
      return;
    }

    const img = (tr.album?.image && tr.album.image.length && tr.album.image[tr.album.image.length-1]["#text"]) || "";
    const durationMs = parseInt(tr.duration || 0, 10);
    const duration = durationMs ? msToTime(durationMs) : (tr.duration ? tr.duration + "ms" : "—");
    const listeners = tr.listeners || "—";
    const playcount = tr.playcount || "—";
    const albumName = tr.album?.title || "—";
    const artist = tr.artist?.name || artistName;

    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(tr.name)}">` : `<div style="width:110px;height:110px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2>${escapeHtml(tr.name)}</h2>
          <div class="details-meta">Artist: ${escapeHtml(artist)}</div>
          <div class="details-meta">Album: ${escapeHtml(albumName)}</div>
          <div class="details-meta">Duration: ${escapeHtml(duration)} • Listeners: ${escapeHtml(listeners)}</div>
        </div>
      </div>
    `;

    if (tr.toptags?.tag?.length) {
      html += `<div class="section"><h4>Tags</h4><div class="tag-list">${tr.toptags.tag.map(t => `<span class="tag">${escapeHtml(t.name)}</span>`).join("")}</div></div>`;
    }

    if (tr.wiki?.summary) {
      html += `<div class="section"><h4>About this track</h4><div>${escapeHtml(stripHtml(tr.wiki.summary))}</div></div>`;
    }

    openDetails(html);
    clearStatus();

  } catch (err) {
    console.error("Track info error:", err);
    setStatus("Could not load track details.");
  }
}

async function fetchAndShowAlbumInfo(artistName, albumName) {
  try {
    setStatus("Loading album info...");
    const data = await fetchAlbumInfo(artistName, albumName);

    const al = data?.album;
    if (!al) {
      setStatus("Album details not available.");
      return;
    }

    const img = (al.image && al.image.length && al.image[al.image.length-1]["#text"]) || "";
    const listeners = al.listeners || "—";
    const tracksArr = al.tracks?.track || [];
    const wikiSummary = al.wiki?.summary ? stripHtml(al.wiki.summary) : "";

    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(al.name)}">` : `<div style="width:110px;height:110px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2>${escapeHtml(al.name)}</h2>
          <div class="details-meta">Artist: ${escapeHtml(al.artist)}</div>
          <div class="details-meta">Listeners: ${escapeHtml(listeners)}</div>
        </div>
      </div>
    `;

    if (tracksArr.length) {
      html += `<div class="section"><h4>Tracks</h4><ol>`;
      tracksArr.forEach(t => {
        const tname = t.name || "";
        const tart = al.artist || artistName;
        html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeAttr(tart)}" data-track="${escapeAttr(tname)}">${escapeHtml(tname)}</button></li>`;
      });
      html += `</ol></div>`;
    }

    if (wikiSummary) {
      html += `<div class="section"><h4>Album notes</h4><div>${escapeHtml(wikiSummary)}</div></div>`;
    }

    openDetails(html);
    clearStatus();

    detailsContent.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const action = btn.getAttribute("data-action");
        if (action === "open-track") {
          const artist = btn.getAttribute("data-artist");
          const track = btn.getAttribute("data-track");
          fetchAndShowTrackInfo(artist, track);
        }
      });
    });

  } catch (err) {
    console.error("Album info error:", err);
    setStatus("Could not load album details.");
  }
}

// convenience wrappers for quickly loading top tracks view
async function fetchAndShowArtistTopTracks(artistName) {
  try {
    setStatus("Loading top tracks...");
    const topTracks = await fetchArtistTopTracks(artistName, 20);
    const arr = topTracks?.toptracks?.track || [];
    if (!arr.length) {
      setStatus("No top tracks available.");
      return;
    }
    let html = `<h2>${escapeHtml(artistName)} — Top tracks</h2><ol>`;
    arr.slice(0,20).forEach(tr => {
      const tname = tr.name || "";
      const tart = tr.artist?.name || artistName;
      html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeAttr(tart)}" data-track="${escapeAttr(tname)}">${escapeHtml(tname)}</button></li>`;
    });
    html += `</ol>`;
    openDetails(html);
    clearStatus();
    detailsContent.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const artist = btn.getAttribute("data-artist");
        const track = btn.getAttribute("data-track");
        fetchAndShowTrackInfo(artist, track);
      });
    });

  } catch (err) {
    console.error("Top tracks error:", err);
    setStatus("Could not load top tracks.");
  }
}

// ------------------------------
// Utilities
// ------------------------------
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(s) { return escapeHtml(s).replaceAll('"', "&quot;"); }
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}
function msToTime(ms){
  if (!ms || isNaN(ms) || ms <= 0) return "—";
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2,"0")}`;
}
