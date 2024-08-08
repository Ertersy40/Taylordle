/**
 * Displays the settings modal and disables scrolling.
 */
function showSettingsModal() {
    document.getElementById('HardSwitch').checked = hardMode;
    document.getElementById('TrackNumSwitch').checked = !trackNumOrder
    disableScrolling();
    document.getElementById('settingsModal').style.display = "flex";
}

/**
 * Shows the appropriate result modal based on game status.
 */
function showResults() {
    if ((gameWonCheck && !hardMode) || (hardGameWonCheck && hardMode)){
        showWinModal()
    } else {
        showLoseModal()
    }
}

/**
 * Displays the help modal and disables scrolling.
 */
function showHelpModal() {
    disableScrolling();
    document.getElementById('helpModal').style.display = "flex";
}

/**
 * Displays the win modal, reveals the target song, and shows game statistics.
 */
function showWinModal() {
    disableScrolling();
    document.getElementById('winModal').style.display = "flex";
    revealTarget("Win");
    showStats("Win")
    const hardModeNotifier = document.getElementById('hardModeNotifier')
    hardModeNotifier.textContent = ""
    if (!hardMode && !hardGameWonCheck){
        hardModeNotifier.textContent = "Try out hard mode in settings!"
    }
}

/**
 * Displays the lose modal, reveals the target song, and shows game statistics.
 */
function showLoseModal() {
    disableScrolling();
    document.getElementById('loseModal').style.display = "flex";
    revealTarget('Lose');
    showStats('Lose')
}

/**
 * Closes all modals and enables scrolling.
 */
function closeModals() {
    enableScroll();
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = "none";
    });
}

/**
 * Disables scrolling on the page.
 */
function disableScrolling(){
    document.body.classList.add("stop-scrolling");
}

/**
 * Enables scrolling on the page.
 */
function enableScroll() {
    document.body.classList.remove("stop-scrolling");
}

/**
 * Reveals the target song information in the specified modal.
 * @param {string} modal - The modal to display the target information in.
 */
function revealTarget(modal) {
    const container = document.getElementById(`correctSong${modal}`);
    container.innerHTML = ""
    const img = document.createElement('img');
    img.src = targetInfo.img_url;
    img.style.width = '150px';
    img.style.height = 'auto';
    img.classList.add('target-image');
    container.appendChild(img);

    const track_name = document.createElement('p');
    track_name.textContent = targetInfo.track_name;
    container.appendChild(track_name);

    if (targetInfo.features && targetInfo.features.length > 0) {
        const ft = document.createElement('p');
        ft.textContent = `ft. ${targetInfo.features.join(', ')}`;
        container.appendChild(ft);
    }
}

/**
 * Displays game statistics in the specified modal.
 * @param {string} modal - The modal to display the statistics in.
 */
function showStats(modal) {
    const streak = document.getElementById(`streak${modal}`)
    streak.textContent = localStorage.getItem('streak') || 0;
    
    const correct = document.getElementById(`correct${modal}`)
    correct.textContent = localStorage.getItem('correct') || 0;
    
    const gamesPlayed = document.getElementById(`games${modal}`)
    gamesPlayed.textContent = localStorage.getItem('gamesPlayed') || 0;
}