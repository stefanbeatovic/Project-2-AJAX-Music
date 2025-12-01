// Get references to the elements we created in index.html
const queryInput = document.querySelector("#query");       // 1) Find the text input by id so we can read what user typed
const typeSelect = document.querySelector("#projectType"); // 2) Find the select element to know which API (weather, movies, etc.) is chosen
const searchBtn  = document.querySelector("#searchBtn");   // 3) Find the button that will start the AJAX request
const statusEl   = document.querySelector("#status");      // 4) Find the status paragraph where we show messages
const resultsEl  = document.querySelector("#results");     // 5) Find the results container where cards will be inserted

// Attach a click listener so something happens when the user presses the button
searchBtn.addEventListener("click", () => {                // 6) When the button is clicked, run this arrow function
  const query = queryInput.value.trim();                   // 7) Read the text from the input and remove spaces at both ends
  const kind  = typeSelect.value;                          // 8) Read which option value is selected in the drop-down

  // 1. Simple validation: do not call the API with an empty search
  if (!query) {                                            // 9) If query is an empty string
    statusEl.textContent = "Please type a city, artist, station or movie title."; // 10) Show a helpful message
    resultsEl.innerHTML = "";                              // 11) Clear any old results from the page
    return;                                                // 12) Stop here so we never send a useless request
  }

  // 2. Show a short loading message so the page does not feel frozen
  statusEl.textContent = "Loading live data...";           // 13) Tell the user that we are contacting the server
  resultsEl.innerHTML = "";                                // 14) Clear previous cards before showing new ones

  // 3. Call our helper function that will build the URL and fetch data
  fetchLiveData(kind, query);                              // 15) Start the AJAX flow with selected kind and user query
});                                                         // 16) End of click event listener

// Helper: build the correct URL for the chosen project type
function buildUrl(kind, query) {                           // 1) Receive kind (weather/movies/...) and user query text
  const trimmed = query.trim();                            // 2) Remove extra spaces again to be safe
  }

  // NOTE: Replace YOUR_KEY_HERE with real keys where needed.
  // Keep real keys out of public GitHub repositories (use .env or similar)

  if (kind === "music") {                                  // 15) If the user chose the Music app
    // Last.fm: artist info
    const apiKey = "YOUR_LASTFM_KEY_HERE";                 // 16) Your Last.fm API key
    return "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" // 17) Base URL and method parameter
           + encodeURIComponent(trimmed)                   // 18) Add artist name, URL-encoded
           + "&api_key="                               // 19) Parameter name for the API key
           + apiKey                                        // 20) Attach your Last.fm key
           + "&format=json";                           // 21) Ask the API to send JSON instead of XML
  }

// Main AJAX function: send request and parse response
async function fetchLiveData(kind, query) {                // 27) Async function so we can use await inside
  try {                                                    // 28) Start try-catch to handle network and parsing errors
    const url = buildUrl(kind, query);                     // 29) Ask helper to build the correct URL

    if (!url) {                                            // 30) If URL is empty (unsupported kind)
      statusEl.textContent = "Unknown project type selected."; // 31) Inform the user
      return;                                              // 32) Stop the function because we cannot call anything
    }

    // Send HTTP GET request (AJAX) using fetch
    const response = await fetch(url);                     // 33) Send request and pause until response comes back

    // This is like checking xhr.status in the textbook
    if (!response.ok) {                                    // 34) If HTTP status is not 200-299
      statusEl.textContent =                               // 35) Show friendly error message with status code
        "The server responded with an error (" + response.status + "). Please try again.";
      return;                                              // 36) Stop here, there is no usable data
    }

    // Decide how to read the body: JSON for most APIs, plain text when we want raw XML
    let rawData;                                           // 37) Declare a variable to store the raw response data

    if (kind === "movies" || kind === "music" || kind === "weather") { // 38) For these kinds, response body is JSON
      rawData = await response.json();                     // 39) Parse the body as a JavaScript object
    } else {                                               // 40) For traffic or XML cases
      rawData = await response.text();                     // 41) Read the body as plain text (XML or JSON string)
    }

    // Pass data to a separate function that understands each API
    handleApiResponse(kind, rawData);                      // 42) Hand over data plus kind to another function
  } catch (err) {                                          // 43) If fetch throws or JSON parsing fails
    // Network error or invalid JSON or XML
    console.error(err);                                    // 44) Log the technical details for debugging
    statusEl.textContent = "Network problem. Check your connection or API key."; // 45) Friendly message for user
  }                                                        // 46) End of try-catch
}                                                          // 47) End of fetchLiveData function

// Turn each API response into a normalised array of items
function handleApiResponse(kind, rawData) {                // 1) Decide how to handle the response based on the kind
  let items = [];                                          // 2) Start with an empty list of items

  if (kind === "music") {                                  // 16) Music app (Last.fm JSON)
    // Last.fm JSON: artist info
    const artist = rawData.artist;                         // 17) Shortcut variable for rawData.artist
    if (artist) {                                          // 18) Only proceed if artist data exists
      const cleanSummary = artist.bio.summary              // 19) Original HTML summary
        .replace(/<[^>]*>/g, "");                    // 20) Remove any HTML tags from the summary
      items = [{                                           // 21) Build one item for the artist
        title: artist.name,                                // 22) Artist name as title
        line1: "Listeners: " + artist.stats.listeners,     // 23) Number of listeners
        line2: "Playcount: " + artist.stats.playcount,     // 24) Total play count
        extra: cleanSummary                                // 25) Cleaned summary as extra text
      }];
    }
  }

  if (!items.length) {                                     // 42) If we still have zero items after all that
    statusEl.textContent = "No results found for that search."; // 43) Inform the user
    resultsEl.innerHTML = "";                              // 44) Clear any old results from the page
    return;                                                // 45) Stop here (nothing to render)
  }

  statusEl.textContent = "Showing " + items.length + " result(s)."; // 46) Show how many items we are about to display
  renderCards(items);                                      // 47) Call helper to actually create HTML cards
}

// Render an array of items into the results container
function renderCards(items) {                              // 48) Take our normalised items and display them
  const html = items.map(item => {                         // 49) Map each item to an HTML string
    return (                                               // 50) Build the HTML string for one card
      '<article class="result-card">' +                 // 51) Card wrapper with CSS class
        '<h3>' + item.title + '</h3>' +        // 52) Card title
        '<p>' + item.line1 + '</p>' +          // 53) First line of details
        '<p>' + item.line2 + '</p>' +          // 54) Second line of details
        '<p class="muted">' + item.extra + '</p>' + // 55) Extra info with muted style
      '</article>'                                   // 56) End of card
    );
  }).join("");                                             // 57) Concatenate all card strings into one big HTML block

  resultsEl.innerHTML = html;                              // 58) Replace the inner HTML of the results container
}                                                          // 59) End of renderCards function