
const API_KEY = "f83c0a91d770c95791c7bbdf93dd0055";
const BASE_URL = "https://ws.audioscrobbler.com/2.0/";

const searchInput = document.getElementById("searchInput");
const searchType = document.getElementById("searchType");
const searchBtn = document.getElementById("searchBtn");
const resultsGrid = document.getElementById("results");
const statusEl = document.getElementById("status");

const topArtistsEl = document.getElementById("topArtists");
const topTracksEl = document.getElementById("topTracks");

const detailsOverlay = document.getElementById("detailsOverlay");
const detailsContent = document.getElementById("detailsContent");
const closeDetailsBtn = document.getElementById("closeDetails");

// Utility helpers
const safe = (v, f = "") => (v === undefined || v === null ? f : v);
function escapeHtml(s){ if (s===undefined||s===null) return ""; return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'", "&#39;"); }
function stripHtml(html){ if(!html) return ""; return html.replace(/<[^>]*>/g,""); }
function buildUrl(params = {}){
  params.api_key = API_KEY;
  params.format = "json";
  const q = Object.keys(params).map(k=> `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
  return `${BASE_URL}?${q}`;
}
async function fetchJson(url){ const r = await fetch(url); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function setStatus(t){ statusEl.textContent = t; } 
function clearStatus(){ statusEl.textContent = ""; }
function clearResults(){ resultsGrid.innerHTML = ""; }

// Modal controls
function openDetails(html){
  detailsContent.innerHTML = html;
  detailsOverlay.setAttribute("aria-hidden","false");
}
function closeDetails(){ detailsContent.innerHTML = ""; detailsOverlay.setAttribute("aria-hidden","true"); }
closeDetailsBtn.addEventListener("click", closeDetails);
detailsOverlay.addEventListener("click", (e)=>{ if(e.target === detailsOverlay) closeDetails(); });

// ----------------------
// Startup: load top charts
// ----------------------
window.addEventListener("load", () => {
  loadTopCharts();
});

// Top charts
async function loadTopCharts(){
  try {
    topArtistsEl.innerHTML = "<li>Loading...</li>";
    topTracksEl.innerHTML = "<li>Loading...</li>";

    const [artistsData, tracksData] = await Promise.all([
      fetchJson(buildUrl({ method: "chart.gettopartists", limit: 10 })),
      fetchJson(buildUrl({ method: "chart.gettoptracks", limit: 10 }))
    ]);

    const artists = artistsData?.artists?.artist || [];
    const tracks = tracksData?.tracks?.track || [];

    topArtistsEl.innerHTML = artists.map((a, i) => {
      const name = safe(a.name, "Unknown");
      return `<li><span>${i+1}. ${escapeHtml(name)}</span><button data-action="open-artist" data-artist="${escapeHtml(name)}">Details</button></li>`;
    }).join("") || "<li>No top artists available.</li>";

    topTracksEl.innerHTML = tracks.map((t,i) => {
      const title = safe(t.name, "Unknown");
      const artist = (t.artist && t.artist.name) ? t.artist.name : (t.artist || "");
      return `<li><span>${i+1}. ${escapeHtml(title)} — ${escapeHtml(artist)}</span><button data-action="open-track" data-artist="${escapeHtml(artist)}" data-track="${escapeHtml(title)}">Details</button></li>`;
    }).join("") || "<li>No top tracks available.</li>";

    // attach click listeners
    topArtistsEl.querySelectorAll("button[data-action]").forEach(btn=>{
      btn.addEventListener("click", ()=> fetchAndShowArtistInfo(btn.dataset.artist));
    });
    topTracksEl.querySelectorAll("button[data-action]").forEach(btn=>{
      btn.addEventListener("click", ()=> fetchAndShowTrackInfo(btn.dataset.artist, btn.dataset.track));
    });

    clearStatus();
  } catch(err){
    console.error("Top charts error:", err);
    topArtistsEl.innerHTML = "<li>Error loading top artists.</li>";
    topTracksEl.innerHTML = "<li>Error loading top tracks.</li>";
    setStatus("Could not load top charts.");
  }
}

// ----------------------
// Event: Search
// ----------------------
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  const type = searchType.value;
  if(!q){ setStatus("Type a search term."); return; }
  doSearch(q, type);
});

// Main search handler
async function doSearch(q, type="all"){
  setStatus("Searching...");
  clearResults();
  try {
    const tasks = [];
    if(type === "all" || type === "artist") tasks.push(searchArtist(q)); else tasks.push(Promise.resolve(null));
    if(type === "all" || type === "track") tasks.push(searchTrack(q)); else tasks.push(Promise.resolve(null));
    if(type === "all" || type === "album") tasks.push(searchAlbum(q)); else tasks.push(Promise.resolve(null));
    if(type === "all" || type === "genre") tasks.push(searchGenre(q)); else tasks.push(Promise.resolve(null));

    const [artistData, trackData, albumData, genreData] = await Promise.all(tasks);

    let any = false;

    // Artists
    const artists = artistData?.results?.artistmatches?.artist || [];
    if(artists.length){
      any = true;
      const frag = document.createDocumentFragment();
      artists.slice(0,8).forEach(a => frag.appendChild(createArtistCard(a)));
      resultsGrid.appendChild(frag);
    }

    // Tracks
    const tracks = trackData?.results?.trackmatches?.track || [];
    if(tracks.length){
      any = true;
      const frag = document.createDocumentFragment();
      tracks.slice(0,8).forEach(t => frag.appendChild(createTrackCard(t)));
      resultsGrid.appendChild(frag);
    }

    // Albums
    const albums = albumData?.results?.albummatches?.album || [];
    if(albums.length){
      any = true;
      const frag = document.createDocumentFragment();
      albums.slice(0,8).forEach(al => frag.appendChild(createAlbumCard(al)));
      resultsGrid.appendChild(frag);
    }

    // Genre results (tag-based): tag.gettoptracks + tag.gettopartists combined
    const genreTracks = genreData?.tracks || [];
    const genreArtists = genreData?.artists || [];
    if((genreTracks && genreTracks.length) || (genreArtists && genreArtists.length)){
      any = true;
      // render genre section
      const sec = document.createElement("div");
      sec.className = "card";
      sec.innerHTML = `<h3>Genre results for "${escapeHtml(q)}"</h3>`;
      if(genreArtists && genreArtists.length){
        const list = genreArtists.slice(0,6).map(a => `<button class="btn-ghost" data-action="open-artist" data-artist="${escapeHtml(a.name)}">${escapeHtml(a.name)}</button>`).join(" ");
        sec.innerHTML += `<div class="section"><h4>Artists</h4><div class="tag-list">${list}</div></div>`;
      }
      if(genreTracks && genreTracks.length){
        const list = genreTracks.slice(0,8).map(t => `<div style="margin:6px 0;"><button class="btn-ghost" data-action="open-track" data-artist="${escapeHtml(t.artist.name || t.artist)}" data-track="${escapeHtml(t.name)}">${escapeHtml(t.name)}</button> — ${escapeHtml(t.artist.name || t.artist)}</div>`).join("");
        sec.innerHTML += `<div class="section"><h4>Tracks</h4>${list}</div>`;
      }
      resultsGrid.appendChild(sec);

      // attach listeners
      sec.querySelectorAll("[data-action]").forEach(btn=>{
        const action = btn.getAttribute("data-action");
        btn.addEventListener("click", ()=>{
          if(action === "open-artist") fetchAndShowArtistInfo(btn.getAttribute("data-artist"));
          if(action === "open-track") fetchAndShowTrackInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-track"));
        });
      });
    }

    if(!any) setStatus("No results found.");
    else clearStatus();

  } catch(err){
    console.error("Search error:", err);
    setStatus("Error fetching data. See console for details.");
  }
}

// ----------------------
// Create cards
// ----------------------
function createArtistCard(a){
  const el = document.createElement("article"); el.className = "result-card";
  const img = (a.image && a.image.length && a.image[a.image.length-1]["#text"]) || "";
  const name = safe(a.name, "Unknown");
  const listeners = safe(a.listeners, "—");
  el.innerHTML = `
    ${img ? `<img class="thumb" src="${img}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Listeners: ${escapeHtml(listeners)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="open-artist" data-artist="${escapeHtml(name)}">Details</button>
      <button class="btn-ghost" data-action="open-artist-top" data-artist="${escapeHtml(name)}">Top tracks</button>
    </div>
  `;
  el.querySelectorAll("button[data-action]").forEach(btn=>{
    const aName = btn.getAttribute("data-artist");
    if(btn.getAttribute("data-action") === "open-artist") btn.addEventListener("click", ()=> fetchAndShowArtistInfo(aName));
    if(btn.getAttribute("data-action") === "open-artist-top") btn.addEventListener("click", ()=> fetchAndShowArtistTopTracks(aName));
  });
  return el;
}
function createTrackCard(t){
  const el = document.createElement("article"); el.className = "result-card";
  const img = (t.image && t.image.length && t.image[t.image.length-1]["#text"]) || "";
  const name = safe(t.name, "Unknown");
  const artist = (t.artist && t.artist.name) ? t.artist.name : (t.artist || "");
  el.innerHTML = `
    ${img ? `<img class="thumb" src="${img}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Artist: ${escapeHtml(artist)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="open-track" data-artist="${escapeHtml(artist)}" data-track="${escapeHtml(name)}">Details</button>
    </div>
  `;
  el.querySelector("button").addEventListener("click", ()=> fetchAndShowTrackInfo(artist, name));
  return el;
}
function createAlbumCard(al){
  const el = document.createElement("article"); el.className = "result-card";
  const img = (al.image && al.image.length && al.image[al.image.length-1]["#text"]) || "";
  const name = safe(al.name, "Unknown");
  const artist = safe(al.artist, "Unknown");
  el.innerHTML = `
    ${img ? `<img class="thumb" src="${img}" alt="${escapeHtml(name)}">` : `<div class="thumb" aria-hidden="true"></div>`}
    <h3>${escapeHtml(name)}</h3>
    <p>Artist: ${escapeHtml(artist)}</p>
    <div class="action-row">
      <button class="btn-ghost" data-action="open-album" data-artist="${escapeHtml(artist)}" data-album="${escapeHtml(name)}">Details</button>
    </div>
  `;
  el.querySelector("button").addEventListener("click", ()=> fetchAndShowAlbumInfo(artist, name));
  return el;
}

// ----------------------
// Low-level search functions
// ----------------------
async function searchArtist(q){ return fetchJson(buildUrl({ method: "artist.search", artist: q, limit: 12 })); }
async function searchTrack(q){ return fetchJson(buildUrl({ method: "track.search", track: q, limit: 12 })); }
async function searchAlbum(q){ return fetchJson(buildUrl({ method: "album.search", album: q, limit: 12 })); }
// genre combined: tag.gettoptracks + tag.gettopartists
async function searchGenre(q){
  try {
    const [tracksData, artistsData] = await Promise.all([
      fetchJson(buildUrl({ method: "tag.gettoptracks", tag: q, limit: 12 })),
      fetchJson(buildUrl({ method: "tag.gettopartists", tag: q, limit: 12 }))
    ]);
    return { tracks: tracksData?.toptracks?.track || [], artists: artistsData?.topartists?.artist || [] };
  } catch(err){
    console.error("Genre search error:", err);
    return { tracks: [], artists: [] };
  }
}

// ----------------------
// Detail fetchers & views
// ----------------------
async function fetchArtistInfo(artistName){ return fetchJson(buildUrl({ method: "artist.getinfo", artist: artistName, autocorrect: 1 })); }
async function fetchTrackInfo(artistName, trackName){ return fetchJson(buildUrl({ method: "track.getInfo", artist: artistName, track: trackName, autocorrect: 1 })); }
async function fetchAlbumInfo(artistName, albumName){ return fetchJson(buildUrl({ method: "album.getInfo", artist: artistName, album: albumName, autocorrect: 1 })); }
async function fetchArtistTopTracks(artistName, limit=15){ return fetchJson(buildUrl({ method: "artist.getTopTracks", artist: artistName, limit })); }

async function fetchAndShowArtistInfo(artistName){
  try {
    setStatus("Loading artist details...");
    const [info, topTracks, topAlbums, similar] = await Promise.all([
      fetchArtistInfo(artistName),
      fetchArtistTopTracks(artistName, 10).catch(()=>({ toptracks:{ track: [] } })),
      fetchJson(buildUrl({ method: "artist.getTopAlbums", artist: artistName, limit: 8 })).catch(()=>({ toppalbums:{ album: [] } })),
      fetchJson(buildUrl({ method: "artist.getSimilar", artist: artistName, limit: 8 })).catch(()=>({ similarartists:{ artist: [] } }))
    ]);

    const art = info?.artist;
    if(!art){ setStatus("Artist details not available."); return; }

    const img = (art.image && art.image.length && art.image[art.image.length-1]["#text"]) || "";
    const bio = art.bio?.summary ? stripHtml(art.bio.summary) : "";
    const tags = art.tags?.tag || [];
    const topArr = topTracks?.toptracks?.track || [];
    const albumsArr = (await fetchJson(buildUrl({ method: "artist.getTopAlbums", artist: artistName, limit: 8 }))).topalbums?.album || [];
    const similarArr = similar?.similarartists?.artist || [];

    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(art.name)}">` : `<div style="width:120px;height:120px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2 id="detailsTitle">${escapeHtml(art.name)}</h2>
          <div class="details-meta">Listeners: ${escapeHtml(art.stats?.listeners || "—")} • Playcount: ${escapeHtml(art.stats?.playcount || "—")}</div>
          <div class="section tag-list">${tags.slice(0,6).map(t=>`<span class="tag">${escapeHtml(t.name)}</span>`).join("")}</div>
        </div>
      </div>
      <div class="section"><h4>Biography</h4><div>${escapeHtml(bio || "No biography available.")}</div></div>
    `;

    if(topArr.length){
      html += `<div class="section"><h4>Top tracks</h4><ol>`;
      topArr.slice(0,10).forEach(tr => {
        const tname = tr.name || ""; const tart = tr.artist?.name || artistName;
        html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeHtml(tart)}" data-track="${escapeHtml(tname)}">${escapeHtml(tname)}</button></li>`;
      });
      html += `</ol></div>`;
    }

    if(albumsArr.length){
      html += `<div class="section"><h4>Top albums</h4><div class="tag-list">`;
      albumsArr.slice(0,8).forEach(al => {
        const aname = al.name || ""; const aartist = al.artist?.name || artistName;
        html += `<button class="tag btn-ghost" data-action="open-album" data-artist="${escapeHtml(aartist)}" data-album="${escapeHtml(aname)}">${escapeHtml(aname)}</button>`;
      });
      html += `</div></div>`;
    }

    if(similarArr.length){
      html += `<div class="section"><h4>Similar artists</h4><div class="tag-list">`;
      similarArr.slice(0,8).forEach(s => {
        html += `<button class="tag btn-ghost" data-action="open-artist" data-artist="${escapeHtml(s.name)}">${escapeHtml(s.name)}</button>`;
      });
      html += `</div></div>`;
    }

    openDetails(html);
    clearStatus();

    // Delegated bindings inside details
    detailsContent.querySelectorAll("[data-action]").forEach(btn=>{
      const action = btn.getAttribute("data-action");
      btn.addEventListener("click", ()=>{
        if(action === "open-track") fetchAndShowTrackInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-track"));
        if(action === "open-album") fetchAndShowAlbumInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-album"));
        if(action === "open-artist") fetchAndShowArtistInfo(btn.getAttribute("data-artist"));
      });
    });

  } catch(err){
    console.error("Artist detail error:", err);
    setStatus("Could not load artist details.");
  }
}

async function fetchAndShowTrackInfo(artistName, trackName){
  try {
    setStatus("Loading track details...");
    const data = await fetchTrackInfo(artistName, trackName);
    const tr = data?.track;
    if(!tr){ setStatus("Track details not available."); return; }

    const img = (tr.album?.image && tr.album.image.length && tr.album.image[tr.album.image.length-1]["#text"]) || "";
    const durationMs = parseInt(tr.duration || 0, 10);
    const duration = durationMs ? msToTime(durationMs) : "—";
    const albumName = tr.album?.title || "—";
    const listeners = tr.listeners || "—";
    const playcount = tr.playcount || "—";

    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(tr.name)}">` : `<div style="width:120px;height:120px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2 id="detailsTitle">${escapeHtml(tr.name)}</h2>
          <div class="details-meta">Artist: ${escapeHtml(tr.artist?.name || artistName)} • Album: ${escapeHtml(albumName)}</div>
          <div class="details-meta">Duration: ${escapeHtml(duration)} • Listeners: ${escapeHtml(listeners)} • Playcount: ${escapeHtml(playcount)}</div>
        </div>
      </div>
    `;
    if(tr.toptags?.tag?.length){
      html += `<div class="section"><h4>Tags</h4><div class="tag-list">${tr.toptags.tag.map(t=>`<span class="tag">${escapeHtml(t.name)}</span>`).join("")}</div></div>`;
    }
    if(tr.wiki?.summary){
      html += `<div class="section"><h4>About this track</h4><div>${escapeHtml(stripHtml(tr.wiki.summary))}</div></div>`;
    }

    openDetails(html);
    clearStatus();

  } catch(err){
    console.error("Track detail error:", err);
    setStatus("Could not load track details.");
  }
}

async function fetchAndShowAlbumInfo(artistName, albumName){
  try {
    setStatus("Loading album details...");
    const data = await fetchAlbumInfo(artistName, albumName);
    const al = data?.album;
    if(!al){ setStatus("Album details not available."); return; }

    const img = (al.image && al.image.length && al.image[al.image.length-1]["#text"]) || "";
    const tracksArr = al.tracks?.track || [];
    const wiki = al.wiki?.summary ? stripHtml(al.wiki.summary) : "";

    let html = `
      <div class="details-hero">
        ${img ? `<img src="${img}" alt="${escapeHtml(al.name)}">` : `<div style="width:120px;height:120px;border-radius:8px;background:#f1f5f9"></div>`}
        <div>
          <h2 id="detailsTitle">${escapeHtml(al.name)}</h2>
          <div class="details-meta">Artist: ${escapeHtml(al.artist)}</div>
          <div class="details-meta">Listeners: ${escapeHtml(al.listeners || "—")}</div>
        </div>
      </div>
    `;
    if(tracksArr.length){
      html += `<div class="section"><h4>Tracks</h4><ol>`;
      tracksArr.forEach(t => {
        const tname = t.name || "";
        html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeHtml(al.artist)}" data-track="${escapeHtml(tname)}">${escapeHtml(tname)}</button></li>`;
      });
      html += `</ol></div>`;
    }
    if(wiki) html += `<div class="section"><h4>Album notes</h4><div>${escapeHtml(wiki)}</div></div>`;

    openDetails(html);
    clearStatus();

    detailsContent.querySelectorAll("[data-action]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        if(btn.getAttribute("data-action") === "open-track"){
          fetchAndShowTrackInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-track"));
        }
      });
    });

  } catch(err){
    console.error("Album detail error:", err);
    setStatus("Could not load album details.");
  }
}

// fetch info wrappers
async function fetchTrackInfo(artistName, trackName){ return fetchJson(buildUrl({ method: "track.getInfo", artist: artistName, track: trackName, autocorrect: 1 })); }
async function fetchArtistInfo(artistName){ return fetchJson(buildUrl({ method: "artist.getinfo", artist: artistName, autocorrect: 1 })); }
async function fetchAlbumInfo(artistName, albumName){ return fetchJson(buildUrl({ method: "album.getInfo", artist: artistName, album: albumName, autocorrect: 1 })); }
async function msToTime(ms){ if(!ms || isNaN(ms) || ms <= 0) return "—"; const total = Math.floor(ms/1000); const m = Math.floor(total/60); const s = total%60; return `${m}:${String(s).padStart(2,"0")}`; }

// convenience: top tracks view for an artist
async function fetchAndShowArtistTopTracks(artistName){
  try {
    setStatus("Loading top tracks...");
    const data = await fetchJson(buildUrl({ method: "artist.getTopTracks", artist: artistName, limit: 20 }));
    const arr = data?.toptracks?.track || [];
    if(!arr.length){ setStatus("No top tracks available."); return; }
    let html = `<h2 id="detailsTitle">${escapeHtml(artistName)} — Top tracks</h2><ol>`;
    arr.slice(0,20).forEach(tr => {
      const tname = tr.name || "";
      const tart = tr.artist?.name || artistName;
      html += `<li><button class="btn-ghost" data-action="open-track" data-artist="${escapeHtml(tart)}" data-track="${escapeHtml(tname)}">${escapeHtml(tname)}</button></li>`;
    });
    html += `</ol>`;
    openDetails(html);
    clearStatus();
    detailsContent.querySelectorAll("[data-action]").forEach(btn=>{
      btn.addEventListener("click", ()=> fetchAndShowTrackInfo(btn.getAttribute("data-artist"), btn.getAttribute("data-track")));
    });
  } catch(err){
    console.error("Top tracks error:", err);
    setStatus("Could not load top tracks.");
  }
}
