/* -------- SETUP -------- */
// Core imports
import { DOM, switchTheme } from './elements.js';
import caseManager from './case_manager.js';
import { renderMenu } from './menu.js';
import { renderGame } from './game.js';

/* -------- RENDERING HELPER FUNCTIONS -------- */
// Return to homepage
export function returnHome() {
    window.location.href = "/";
}

// Transition the UI to the menu state
function showMenu() {
    // Call the menu rendering logic
    renderMenu();

    // Unhide the menu
    DOM.gameView.classList.add('hidden');
    DOM.backBtn.classList.add('hidden');
    DOM.menuView.classList.remove('hidden');
}

// Set the UI to the game state
async function showGame(selectedCase) {
    DOM.menuView.classList.add('hidden');
    DOM.backBtn.classList.remove('hidden');
    DOM.gameView.classList.remove('hidden');
    
    // Start the game loop, passing in the specific case
    await renderGame(selectedCase);
}


/* -------- EVENT LISTENERS -------- */
function hookListeners() {
    // Close menus when clicking anywhere else on the page
    document.addEventListener('click', (evt) => {
        // Close Options menu
        if (evt.target.id !== "opts-btn") {
            DOM.optsDropdown.classList.add('hidden');           // Hide the dropdown menu
            DOM.optsBtn.classList.remove('transformed');        // Detransform the button
        }

        // Close Filter menu
        if (!DOM.filterBtn.contains(evt.target)) {
            DOM.filterDropdown.classList.add('hidden');         // Hide the dropdown menu
            DOM.filterIcon.classList.remove('transformed');     // Detransform the button
        }
    });

    // Toggle options dropdown 
    DOM.optsBtn.addEventListener('click', (evt) => {
        DOM.optsDropdown.classList.toggle('hidden');            // Toggle the dropdown menu
        DOM.optsBtn.classList.toggle('transformed');            // Transform the button
    });

    // Options dropdown selection handlers
    DOM.optsDropdown.addEventListener("click", (evt) => {
        switch (evt.target.id) {
            case "opts-theme":  // Toggle theme
                switchTheme();
                break;

            case "opts-reset":  // Open Reset modal
                DOM.optsDropdown.classList.add('hidden');       // Hide the dropdown menu
                DOM.optsBtn.classList.remove('transformed');    // Detransform the button
                DOM.resetModal.classList.remove('hidden');      // Show the modal
                break;

            case "opts-about":  // Open About modal
                DOM.optsDropdown.classList.add('hidden');       // Hide the dropdown menu
                DOM.optsBtn.classList.remove('transformed');    // Detransform the button
                DOM.aboutModal.classList.remove('hidden');      // Show the modal
        }
    });

    // Close Reset modal
    DOM.resetModal.addEventListener("click", (evt) => {
        if (evt.target.matches('#reset-overlay, #close-reset-btn')) {
            DOM.resetModal.classList.add('hidden');             // Close the modal
        } else if (evt.target.id === 'confirm-reset-btn') {
            localStorage.setItem('caseHistory', '{}');          // Wipe the cached history
            returnHome();                                       // Return to homepage
        }
    });

    // Close About modal
    DOM.aboutModal.addEventListener("click", (evt) => {
        if (evt.target.matches('#about-overlay, #close-about-btn')) {
            DOM.aboutModal.classList.add('hidden');             // Close the modal
        }
    });
}

/* -------- MAIN -------- */
async function main() {
    // Parse the URL to see if a specific case is requested (e.g., ?case=1)
    const caseNum = parseInt((new URLSearchParams(window.location.search)).get('case'));

    // Transition to game UI if case id is valid, otherwise transition to menu
    caseManager.case_exists(caseNum) ? await showGame(caseNum) : showMenu();

    // Connect listeners to make elements interactible
    hookListeners()
}

// Main function call
try {
    await main();
} catch (error) {
    console.error(`Initialization Error: ${error}`);
    DOM.mainElement.innerHTML = 
        `<p style="color:red;"> An error occurred while loading the site:<br> \
        ${error}<br> \
        <u>Traceback:</u><br> \
        ${error.stack}</p>`;
}