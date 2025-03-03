/**
 * Displays an autocomplete list of track name suggestions based on the user input.
 * @param {Array} trackNames - The array of track names to display as suggestions.
 */
function displaySuggestions(trackNames) {
    const suggestionsBox = document.getElementById("suggestions");
    suggestionsBox.innerHTML = "";
    if (trackNames.length > 0) {
        document.getElementById("suggestions").style.display = "block";
        const suggestionsHTML = trackNames
            .map((name) => `<div class="suggestion-item">${name}</div>`)
            .join("");
        suggestionsBox.innerHTML = suggestionsHTML;

        document.querySelectorAll(".suggestion-item").forEach((item) => {
            item.addEventListener("click", function () {
                document.getElementById("songInput").value = this.innerText;
                displaySuggestions([]);
            });
        });
    } else {
        document.getElementById("suggestions").style.display = "none";
    }
}

/**
 * Handles the submission of a guess and updates the game state.
 */
function handleSubmit() {
    console.log("Submitting guess...")
    const consentString = localStorage.getItem("cookieConsent");
    let consent = null;
    if (consentString) {
        try {
            consent = JSON.parse(consentString);
        } catch (e) {
            console.error("Error parsing cookieConsent from localStorage:", e);
        }
    }
    if (consent && consent.analytics) {
        console.log("sending event")
        gtag("event", "submit_word", {
            event_category: "Game Interaction",
            event_label: "Word Submission",
        });
    }

    const songInput = document.getElementById("songInput").value.trim();
    const inputInfo = getTrackInfo(songInput);

    if (guesses.includes(songInput)) {
        showBanner("you've already guessed this song!");
        document.getElementById("songInput").value = "";
        document.getElementById("suggestions").style.display = "none";
    } else if (allTrackNames.includes(songInput)) {
        document.getElementById("songInput").value = "";
        document.getElementById("suggestions").style.display = "none";
        addGuess(songInput);
        guesses.push(songInput);
        updateGuessCounterDisplay();
        localStorage.setItem(
            hardMode ? "hardguesses" : "guesses",
            JSON.stringify(guesses)
        );
    } else {
        showBanner("Invalid song name!");
    }

    if (
        guesses.length >= MAX_GUESSES &&
        JSON.stringify(inputInfo) !== JSON.stringify(targetInfo)
    ) {
        const consentString = localStorage.getItem("cookieConsent");
        let consent = null;
        if (consentString) {
            try {
                consent = JSON.parse(consentString);
            } catch (e) {
                console.error("Error parsing cookieConsent from localStorage:", e);
            }
        }
        if (consent && consent.analytics) {
            gtag("event", "game_lose", {
                event_category: "Game Outcome",
                event_label: "Lose",
                game_mode: hardMode ? "hard" : "easy",
            });
        }
        gameLost();
    }
}

/**
 * Retrieves detailed information about a track.
 * @param {string} trackName - The name of the track to retrieve information for.
 * @returns {Object} An object containing the track information.
 */
function getTrackInfo(trackName) {
    let trackInfo = {
        track_name: trackName,
        img_url: "",
        album_name: "",
        track_number: -1,
        track_length: "",
        features: [],
    };

    for (let album of albumsData) {
        let tracks = album.tracks;
        for (let i = 0; i < tracks.length; i++) {
            if (
                tracks[i].track_name.toLowerCase() === trackName.toLowerCase()
            ) {
                trackInfo.img_url = album.img_url;
                trackInfo.album_name = album.album_name;
                trackInfo.track_number = i + 1; // Track number in the album
                trackInfo.track_length = tracks[i].track_length;
                trackInfo.features = tracks[i].features;
                return trackInfo; // Return the track info as soon as we find the track
            }
        }
    }
    return trackInfo; // Return default track info if not found
}

/**
 * Compares the track information to the target track information.
 * @param {Object} trackInfo - The track information to compare.
 * @returns {Object} An object containing the comparison results.
 */
function compareToTarget(trackInfo) {
    let comparisonResults = {
        albumMatch: "correct", // Assume correct to start, will adjust based on logic
        trackNumberMatch: "correct", // Same assumption
        trackLengthMatch: "correct", // Same assumption
        featuresMatch: "incorrect", // Start with "incorrect" and adjust based on logic below
    };

    const trackLengthToSeconds = (trackLength) => {
        const [minutes, seconds] = trackLength.split(":").map(Number);
        return minutes * 60 + seconds;
    };

    const targetAlbumIndex = albumsData.findIndex(
        (album) => album.album_name === targetInfo.album_name
    );
    const comparedAlbumIndex = albumsData.findIndex(
        (album) => album.album_name === trackInfo.album_name
    );
    if (targetAlbumIndex === comparedAlbumIndex) {
        comparisonResults.albumMatch = "correct";
    } else if (
        Math.abs(targetAlbumIndex - comparedAlbumIndex) === 1 ||
        Math.abs(targetAlbumIndex - comparedAlbumIndex) === 2
    ) {
        comparisonResults.albumMatch =
            targetAlbumIndex > comparedAlbumIndex
                ? "before close"
                : "after close";
    } else {
        comparisonResults.albumMatch =
            targetAlbumIndex > comparedAlbumIndex ? "before" : "after";
    }

    const trackNumberDifference = Math.abs(
        targetInfo.track_number - trackInfo.track_number
    );
    if (trackNumberDifference === 0) {
        comparisonResults.trackNumberMatch = "correct";
    } else if (trackNumberDifference === 1 || trackNumberDifference === 2) {
        comparisonResults.trackNumberMatch =
            (trackNumOrder &&
                targetInfo.track_number < trackInfo.track_number) ||
            (!trackNumOrder && targetInfo.track_number > trackInfo.track_number)
                ? "before close"
                : "after close";
    } else {
        comparisonResults.trackNumberMatch =
            (trackNumOrder &&
                targetInfo.track_number < trackInfo.track_number) ||
            (!trackNumOrder && targetInfo.track_number > trackInfo.track_number)
                ? "before"
                : "after";
    }

    const targetTrackLengthSeconds = trackLengthToSeconds(
        targetInfo.track_length
    );
    const comparedTrackLengthSeconds = trackLengthToSeconds(
        trackInfo.track_length
    );
    const trackLengthDifference = Math.abs(
        targetTrackLengthSeconds - comparedTrackLengthSeconds
    );
    if (trackLengthDifference === 0) {
        comparisonResults.trackLengthMatch = "correct";
    } else if (trackLengthDifference <= 30) {
        comparisonResults.trackLengthMatch =
            targetTrackLengthSeconds > comparedTrackLengthSeconds
                ? "before close"
                : "after close";
    } else {
        comparisonResults.trackLengthMatch =
            targetTrackLengthSeconds > comparedTrackLengthSeconds
                ? "before"
                : "after";
    }

    const targetFeaturesSet = new Set(targetInfo.features);
    const trackFeaturesSet = new Set(trackInfo.features);
    const intersection = new Set(
        [...targetFeaturesSet].filter((x) => trackFeaturesSet.has(x))
    );

    if (targetFeaturesSet.size === 0 && trackFeaturesSet.size === 0) {
        comparisonResults.sharedFeatures = "correct";
    } else if (intersection.size > 0) {
        if (
            targetFeaturesSet.size === trackFeaturesSet.size &&
            intersection.size === targetFeaturesSet.size
        ) {
            comparisonResults.sharedFeatures = "correct";
        } else {
            comparisonResults.sharedFeatures = "close";
        }
    } else {
        comparisonResults.sharedFeatures = "incorrect";
    }

    return comparisonResults;
}

/**
 * Updates the display of the guess counter.
 */
function updateGuessCounterDisplay() {
    document.getElementById(
        "guesses"
    ).innerHTML = `Guess: ${guesses.length}<span class="alternate-font">/</span>8`;
}

/**
 * Adds a guess to the game grid and checks for win or loss conditions.
 * @param {string} guess - The guessed track name.
 */
function addGuess(guess) {
    const trackInfo = getTrackInfo(guess); // Assuming guess is the track name
    const correctness = compareToTarget(trackInfo);

    // Create a row for the new guess

    // Add guess name cell
    let songNameCell = document.createElement("div");
    songNameCell.textContent = guess;
    songNameCell.className =
        "grid-cell " + (guess === targetInfo.track_name ? "correct" : "");

    // Add album comparison cell with image and arrow
    let albumCoverCell = document.createElement("div");
    albumCoverCell.className =
        "grid-cell " + correctness.albumMatch.replace(" ", "-") + " album_cell";

    const albumContainer = document.createElement("div"); // Create a new div for the album image and arrow
    albumContainer.style.display = "flex"; // Use flexbox to align items inline
    albumContainer.style.alignItems = "center"; // Center items vertically

    const img = document.createElement("img");
    img.src = trackInfo.img_url; // Ensure you have an img_url property
    img.style.width = "50px"; // Adjust size as needed
    img.style.height = "auto";
    img.style.marginRight = "10px"; // Add some space between the image and the arrow
    if (
        trackInfo.album_name.toLowerCase().includes("edition") ||
        trackInfo.album_name.toLowerCase().includes("deluxe")
    ) {
        img.classList.add("deluxe");
    }

    let arrowSpan = document.createElement("span"); // Create a new span for the symbol
    arrowSpan.className = "arrow"; // Assign a base class for styling

    if (correctness.albumMatch.includes("before")) {
        arrowSpan.textContent = "↑"; // Up arrow for before
        arrowSpan.classList.add("up-arrow"); // Add class for up arrow
    } else if (correctness.albumMatch.includes("after")) {
        arrowSpan.textContent = "↓"; // Down arrow for after
        arrowSpan.classList.add("down-arrow"); // Add class for down arrow
    }

    albumContainer.appendChild(img);
    albumContainer.appendChild(arrowSpan);
    albumCoverCell.appendChild(albumContainer);

    const appendCorrectnessCell = (criteria, value) => {
        let correctnessCell = document.createElement("div");
        let symbolSpan = document.createElement("span"); // Create a new span for the arrow symbol
        symbolSpan.className = "arrow-container"; // Reuse the arrow-container class for styling

        let symbol = ""; // Default, no symbol
        if (criteria.includes("before")) {
            symbol = "↑"; // Up arrow for before
            symbolSpan.className += " arrow up-arrow"; // Add classes for up arrow
        } else if (criteria.includes("after")) {
            symbol = "↓"; // Down arrow for after
            symbolSpan.className += " arrow down-arrow"; // Add classes for down arrow
        }
        symbolSpan.textContent = symbol; // Set the text content of the span to the arrow symbol

        correctnessCell.textContent = value + " "; // Add a space for separation
        correctnessCell.appendChild(symbolSpan); // Append the arrow span next to the value
        correctnessCell.className = criteria.replace(" ", "-"); // Use className for styling based on the criteria
        correctnessCell.className += " grid-cell";
        return correctnessCell;
    };

    let trackNumCell = appendCorrectnessCell(
        correctness.trackNumberMatch,
        trackInfo.track_number.toString()
    );
    let trackLengthCell = appendCorrectnessCell(
        correctness.trackLengthMatch,
        trackInfo.track_length
    );

    let featuresCell = document.createElement("div");
    featuresCell.textContent = trackInfo.features.join(", ") || "No features";
    featuresCell.className = "grid-cell " + correctness.sharedFeatures;

    const empty = document.querySelectorAll(".empty");
    for (let i = 0; i < 5; i++) {
        empty[i].remove();
    }

    let gridTable = document.querySelector(".grid-table");
    let firstEmptyCell = document.querySelectorAll(".empty")[0];

    gridTable.insertBefore(songNameCell, firstEmptyCell);
    gridTable.insertBefore(albumCoverCell, firstEmptyCell);
    gridTable.insertBefore(trackNumCell, firstEmptyCell);
    gridTable.insertBefore(trackLengthCell, firstEmptyCell);
    gridTable.insertBefore(featuresCell, firstEmptyCell);

    if (JSON.stringify(trackInfo) === JSON.stringify(targetInfo)) {
        gameWon();
    } else if (
        guesses.length >= MAX_GUESSES &&
        guesses[guesses.length - 1] === guess
    ) {
        gameLost();
        disableGameInput();
    }
}

/**
 * Displays a message in a banner for a specified duration. Good for errors or just general messages
 * @param {string} message - The error message to display.
 * @param {number} [seconds=2.5] - The duration to display the message.
 */
function showBanner(message, seconds = 2.5) {
    if (!document.querySelector("#errorBox")) {
        const errorBox = document.createElement("div");
        errorBox.id = "errorBox";
        document.body.appendChild(errorBox);
    }

    const errorBox = document.querySelector("#errorBox");
    errorBox.textContent = message;

    errorBox.style.animation = "slideIn 0.5s ease-in-out forwards";

    setTimeout(() => {
        errorBox.style.animation = "slideOut 0.5s ease-in-out forwards";
    }, seconds * 1000);
    setTimeout(() => {
        errorBox.textContent = "";
    }, seconds * 1000 + 500);
}

/**
 * Disables game input fields and buttons.
 */
function disableGameInput() {
    const songInputField = document.getElementById("songInput");
    songInputField.disabled = true;
    songInputField.style.display = "none";

    const inputUnderline = document.getElementById("underline");
    inputUnderline.style.display = "none";

    const submitButton = document.getElementById("submitBtn");
    submitButton.disabled = true;
    submitButton.style.display = "none";

    const resultsButton = document.getElementById("results");
    resultsButton.style.display = "block";
}

/**
 * Enables game input fields and buttons.
 */
function enableGameInput() {
    const songInputField = document.getElementById("songInput");
    songInputField.disabled = false;
    songInputField.style.display = "block";

    const inputUnderline = document.getElementById("underline");
    inputUnderline.style.display = "block";

    const submitButton = document.getElementById("submitBtn");
    submitButton.disabled = false;
    submitButton.style.display = "block";

    const resultsButton = document.getElementById("results");
    resultsButton.style.display = "none";
}

/**
 * Handles the game win scenario and updates the game state.
 */
function gameWon() {
    const consentString = localStorage.getItem("cookieConsent");
    let consent = null;
    if (consentString) {
        try {
            consent = JSON.parse(consentString);
        } catch (e) {
            console.error("Error parsing cookieConsent from localStorage:", e);
        }
    }
    if (consent && consent.analytics) {
        gtag("event", "game_won", {
            event_category: "Game Outcome",
            event_label: "Win",
        });
    }

    const today = new Date();
    const formattedToday =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    const lastGame = localStorage.getItem(
        hardMode ? "lastHardGame" : "lastGame"
    );
    if (!(lastGame && lastGame === formattedToday.toString())) {
        localStorage.setItem(
            hardMode ? "lastHardGame" : "lastGame",
            formattedToday
        );
        localStorage.setItem(
            "streak",
            parseInt(localStorage.getItem("streak") || 0) + 1
        );
        localStorage.setItem(
            "correct",
            parseInt(localStorage.getItem("correct") || 0) + 1
        );
        localStorage.setItem(
            "gamesPlayed",
            parseInt(localStorage.getItem("gamesPlayed") || 0) + 1
        );
    }
    disableGameInput();

    if (!gameWonCheck && !hardMode) {
        gameWonCheck = true;
        if (!changingModes) {
            showWinModal();
        }
    } else if (!hardGameWonCheck && hardMode) {
        hardGameWonCheck = true;
        if (!changingModes) {
            showWinModal();
        }
    }
}

/**
 * Handles the game loss scenario and updates the game state.
 */
function gameLost() {
    const consentString = localStorage.getItem("cookieConsent");
    let consent = null;
    if (consentString) {
        try {
            consent = JSON.parse(consentString);
        } catch (e) {
            console.error("Error parsing cookieConsent from localStorage:", e);
        }
    }
    if (consent && consent.analytics) {
        gtag("event", "game_lose", {
            event_category: "Game Outcome",
            event_label: "Lose",
        });
    }

    disableGameInput();
    const today = new Date();
    const formattedToday =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
    const lastGame = localStorage.getItem(
        hardMode ? "lastHardGame" : "lastGame"
    );
    if (!(lastGame && lastGame === formattedToday.toString())) {
        localStorage.setItem(
            hardMode ? "lastHardGame" : "lastGame",
            formattedToday
        );
        localStorage.setItem("streak", 0);
        localStorage.setItem(
            "gamesPlayed",
            parseInt(localStorage.getItem("gamesPlayed") || 0) + 1
        );
    }

    if (!gameLostCheck && !hardMode) {
        gameLostCheck = true;
        showLoseModal();
    } else if (!hardGameLostCheck && hardMode) {
        hardGameLostCheck = true;
        showLoseModal();
    }
}
