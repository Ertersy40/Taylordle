/**
 * Checks if help has been shown before and shows the help modal if not.
 */
if (!localStorage.getItem("helpShown")) {
    localStorage.setItem("helpShown", true);
    showHelpModal();
}

const MAX_GUESSES = 8;
let targetInfo = {};
let guesses = [];
let gameWonCheck = false;
let gameLostCheck = false;
let hardGameWonCheck = false;
let hardGameLostCheck = false;
let changingModes = false;
let albumsData = [];
let allTrackNames = [];

const easyLayer = document.querySelector(".background .easy");
const hardLayer = document.querySelector(".background .hard");

let hardMode = false;
if (localStorage.getItem("hard") && localStorage.getItem("hard") === "true") {
    hardMode = true;
    hardLayer.style.opacity = 1;
    easyLayer.style.opacity = 0;
} else {
    localStorage.setItem("hard", false);
    easyLayer.style.opacity = 1;
    hardLayer.style.opacity = 0;
}

let trackNumOrder = false;
if (
    localStorage.getItem("NumericTrackNumbers") &&
    localStorage.getItem("NumericTrackNumbers") === "false"
) {
    trackNumOrder = true;
}

/**
 * Initializes the game on DOM content loaded by fetching album data and setting up event listeners.
 */
document.addEventListener("DOMContentLoaded", function () {
    fetchAlbums(hardMode ? "hardSongs.json" : "songs.json").then(
        (trackNames) => {
            allTrackNames = trackNames;
            pickRandomSong();
            checkAndUpdateDate();
            updateGuessCounterDisplay();
        }
    );

    // Add event listener to the submit button
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", handleSubmit);
});

document.getElementById("songInput").addEventListener("input", function () {
    const inputVal = this.value.toLowerCase();
    if (inputVal.trim() !== "") {
        const filteredTracks = allTrackNames
            .filter((name) => name.toLowerCase().startsWith(inputVal))
            .slice(0, 5);
        displaySuggestions(filteredTracks);
    } else {
        displaySuggestions([]);
    }
});

document.addEventListener("click", function (e) {
    const searchInput = document.getElementById("songInput");
    const suggestionsBox = document.getElementById("suggestions");
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = "none";
    }
});

/**
 * Picks a random song based on a pseudo-random seed and sets target information.
 */
function pickRandomSong() {
    // Generate a seed from today's date
    const today = new Date();

    // If today is Nov 22 (fan's anniversary), choose lover
    if (
        !hardMode &&
        today.getFullYear() === 2024 &&
        today.getMonth() === 10 && // November is month 10 in zero-based indexing
        today.getDate() === 22
    ) {
        randomSong = "Lover";
        targetInfo = getTrackInfo(randomSong);
        return; // Exit the function early
    }


    const seed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate() +
        (hardMode ? 1 : 2);

    // Simple seeded random function
    const pseudoRandom = (seed) => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Generate a list of indices to exclude based on the last 40 days
    let excludeIndices = new Set();
    for (let daysAgo = 1; daysAgo <= 40; daysAgo++) {
        const seedForDay = seed - daysAgo; // Adjust seed for each day in the past 40 days
        const indexToExclude = Math.floor(
            pseudoRandom(seedForDay) * allTrackNames.length
        );
        excludeIndices.add(indexToExclude);
    }
    // Filter out songs to exclude
    const availableSongs = allTrackNames.filter(
        (_, index) => !excludeIndices.has(index)
    );

    if (availableSongs.length > 0) {
        // Use the pseudo-random function to get a random index from the available songs
        const randomIndex = Math.floor(
            pseudoRandom(seed) * availableSongs.length
        );
        randomSong = availableSongs[randomIndex];
        targetInfo = getTrackInfo(randomSong);
    } else {
        // Handle the case where no songs are available
        const randomIndex = Math.floor(
            pseudoRandom(seed) * allTrackNames.length
        );
        randomSong = allTrackNames[randomIndex];
        targetInfo = getTrackInfo(randomSong);
    }
}

/**
 * Checks the current date and updates or resets the game state accordingly.
 */
function checkAndUpdateDate() {
    const today = new Date();
    const formattedToday =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0"); // Format YYYY-MM-DD

    const lastVisit = localStorage.getItem("lastVisit");

    if (formattedToday === lastVisit) {
        loadGuesses(); // Load guesses from localStorage if it's the same day
    } else {
        localStorage.setItem("guesses", JSON.stringify([])); // Reset guesses
        localStorage.setItem("hardguesses", JSON.stringify([])); // Reset hard mode guesses
        localStorage.setItem("lastVisit", formattedToday); // Update the last visit date
    }
}

/**
 * Loads previous guesses from local storage and adds them to the game.
 */
function loadGuesses() {
    guesses = JSON.parse(
        localStorage.getItem((hardMode ? "hard" : "") + "guesses") || "[]"
    );
    guesses.forEach((guess) => addGuess(guess));
}

/**
 * Fetches album data from the specified file and populates albumsData.
 * @param {string} file - The file to fetch album data from.
 * @returns {Promise<Array>} A promise that resolves to an array of track names.
 */
function fetchAlbums(file) {
    return fetch(file) // Start the fetch operation
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // Parse the JSON of the response
        })
        .then((albums) => {
            albumsData = albums; // Set the global albumsData variable
            populateAlbumsDiv(albumsData);
            const trackNames = getAllTrackNames(albums); // Process the albums to get track names
            return trackNames; // Return the track names for the next .then()
        })
        .catch((error) => {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        });
}

/**
 * Populates the floating album container below the title with album images.
 * @param {Array} albumsData - The array of album data to populate the div with.
 */
function populateAlbumsDiv(albumsData) {
    const albumsContainer = document.getElementById("albumContainer");
    albumsContainer.innerHTML = "";
    albumsData.forEach((album, index) => {
        const img = document.createElement("img");
        img.className = "album";
        img.src = album.img_url;
        img.alt = album.album_name;
        if (
            album.album_name.toLowerCase().includes("edition") ||
            album.album_name.toLowerCase().includes("deluxe")
        ) {
            img.classList.add("deluxe");
        }

        // Apply the wave animation with a dynamic delay
        img.style.animation = "wave 2s infinite";
        img.style.animationDelay = `${index * 0.2}s`;

        albumsContainer.appendChild(img);
    });
}

/**
 * Retrieves all track names from the album data.
 * @param {Array} albums - The array of album data.
 * @returns {Array} An array of all track names.
 */
function getAllTrackNames(albums) {
    let trackNames = []; // Initialize an empty array to hold all track names
    albums.forEach((album) => {
        album.tracks.forEach((track) => {
            trackNames.push(track.track_name);
        });
    });
    return trackNames;
}
