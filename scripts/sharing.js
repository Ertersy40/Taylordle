/**
 * Generates a string of emojis representing the user's guesses and their correctness.
 * @returns {string} A string of emojis.
 */
function generateEmojiString() {
    let emojiString = "";

    const decideEmoji = (comparison) => {
        switch (comparison) {
            case "correct":
                return "🟩"; // Green square for correct
            case "before close":
            case "after close":
            case "close":
                return "🟨"; // Yellow square for close
            case "before":
            case "after":
            default:
                return "⬛"; // Black square for incorrect or any other case
        }
    };

    guesses.forEach((guess) => {
        const trackInfo = getTrackInfo(guess); // Get track info based on the guess
        const comparisonResults = compareToTarget(trackInfo); // Compare the guess to the target

        emojiString += decideEmoji(comparisonResults.albumMatch);
        emojiString += decideEmoji(comparisonResults.trackNumberMatch);
        emojiString += decideEmoji(comparisonResults.trackLengthMatch);
        emojiString +=
            comparisonResults.sharedFeatures === "correct"
                ? "🟩"
                : comparisonResults.sharedFeatures === "close"
                ? "🟨"
                : "⬛";
        emojiString += "\n";
    });
    return emojiString;
}

/**
 * Shares the game results content either via the Web Share API or by copying to clipboard.
 */
function shareContent() {
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
        gtag("event", "Share_Click", {
            event_category: "Game Interaction",
            event_label: "Share",
        });
    }
    const emojis = generateEmojiString();

    const startDate = new Date("2023-12-13");
    const currentDate = new Date();
    const timeDiff = currentDate - startDate;
    const dayNumber = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const textToShare = `Taylordle ${dayNumber}${
        hardMode ? " Hard Mode" : ""
    }: ${guesses.length}/8\n\n${emojis}\nwww.Taylordle.xyz`;

    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        if (navigator.share) {
            navigator
                .share({
                    text: textToShare,
                })
                .catch((error) => showBanner("Error sharing content..."));
        } else {
            copyToClipboard(textToShare);
        }
    } else {
        copyToClipboard(textToShare);
    }
}

/**
 * Copies the specified text to the clipboard.
 * @param {string} text - The text to copy to the clipboard.
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch((error) => {
        console.error("Error copying to clipboard:", error);
    });
    showBanner("Copied to clipboard!");
}
