// Get the checkbox element
const hardSwitch = document.getElementById('HardSwitch');

// Add an event listener for the 'change' event
hardSwitch.addEventListener('change', function() {
    changingModes = true
    guesses = [];
    let gridHTML = '<div class="grid-header">Track Name</div><div class="grid-header">Album</div><div class="grid-header">Track Number</div><div class="grid-header">Track Length</div><div class="grid-header">Features</div>';

    for (let i = 0; i < 5 * MAX_GUESSES; i++) {
        gridHTML += '<div class="grid-cell empty"></div>';
    }
    document.querySelector('.grid-table').innerHTML = gridHTML
    localStorage.setItem('hard', this.checked)
    hardMode = this.checked
    
    const today = new Date();
    const formattedToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); // Format YYYY-MM-DD

    const lastGame = localStorage.getItem(hardMode ? 'lastHardGame' : 'lastGame');

    if ((lastGame && lastGame === formattedToday.toString())){
        disableGameInput();
    }else{
        enableGameInput();
    }
    
    if (this.checked) {
        hardLayer.style.opacity = 1;
        easyLayer.style.opacity = 0;
        
        fetchAlbums('hardSongs.json').then(trackNames => {
            allTrackNames = trackNames;
            pickRandomSong();
            checkAndUpdateDate();
            updateGuessCounterDisplay();
        });
        
        
    } else {
        easyLayer.style.opacity = 1;
        hardLayer.style.opacity = 0;
        
        fetchAlbums('songs.json').then(trackNames => {
            allTrackNames = trackNames;
            pickRandomSong();
            checkAndUpdateDate();
            updateGuessCounterDisplay();
        });
        
    }
    setTimeout(() => {
        changingModes = false;
    }, 1000)
});
/**
 * Toggles track number order and updates local storage.
 */
const trackNumSwitch = document.getElementById('TrackNumSwitch');

trackNumSwitch.addEventListener('change', function() {
    trackNumOrder = !this.checked;
    localStorage.setItem('NumericTrackNumbers', this.checked)
    let tempGuesses = guesses;
    guesses = [];
    document.querySelector('.grid-table').innerHTML = '<div class="grid-header">Track Name</div><div class="grid-header">Album</div><div class="grid-header">Track Number</div><div class="grid-header">Track Length</div><div class="grid-header">Features</div>'
    checkAndUpdateDate();
})