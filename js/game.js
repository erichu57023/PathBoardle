/* -------- SETUP -------- */
// Core imports
import { DOM } from "./elements.js"
import caseManager from './case_manager.js';
import { returnHome } from './main.js';

// Locals
let currentID, answer, clues, gameState, dictionary;
const rootStyles = getComputedStyle(DOM.root);
const correctStyle = {
    msgTxt: "Correct!",
    colorStr: rootStyles.getPropertyValue('--solved-color')
};
const incorrectStyle = {
    msgTxt: "Out of guesses", 
    colorStr: rootStyles.getPropertyValue('--failed-color')
};
const prevCaseTxt = "\u2190 Previous case";
const nextCaseTxt = "Next case \u2192";
const goHomeTxt = "Back to menu";

/* -------- RENDERING HELPER FUNCTIONS -------- */
// Close autocomplete dropdown menu
function closeDropdown() {
    DOM.autoDropdown.replaceChildren();
    DOM.autoDropdown.classList.add('hidden');
}

// Draws the clues based on the guess count
async function renderCaseDetails() {
    gameState = caseManager.history[currentID] || {
        completed: 0, // 0 = 'in_progress', 1 = 'solved', -1 = 'failed'
        guessesTaken: 0,
        guessList: []
    };

    // Set the title
    DOM.caseTitle.textContent = `Case #${currentID}`;

    // Render clues (1 initial clue plus 1 for every incorrect guess, or all if game over)
    const numVisibleClues = gameState.completed ? clues.length : Math.min(gameState.guessesTaken + 1, clues.length);
    const cluesFragment = document.createDocumentFragment();
    for (let i = 0; i < numVisibleClues; i++) {
        const clueDiv = document.createElement('div');
        clueDiv.className = 'clue';
        
        // Parse clue for internal images
        let clueText = atob(clues[i]);
        if (clueText.includes("[image]")) {
            const clueImgURL = caseManager.get_image_URL(currentID, i + 1);
            const clueImgHTML = `<br><div class=clueimg><img src=${clueImgURL}></div>`;
            clueText = clueText.replace("[image]", clueImgHTML);
        }
        clueDiv.innerHTML = clueText;
        cluesFragment.appendChild(clueDiv);
    }
    DOM.cluesContainer.replaceChildren(cluesFragment);
}

// Draws the incorrect guesses
function renderGuesses() {
    // Update the guess counter
    let incorrectCount = gameState.guessesTaken;
    const guessesLeft = clues.length - incorrectCount;

    switch (gameState.completed) {
        case 0:
            DOM.guessCounter.textContent = `${guessesLeft} ${guessesLeft == 1 ? "guess" : "guesses"} remaining`;
            DOM.guessCounter.style.color = `${guessesLeft < 3 ? rootStyles.getPropertyValue('--incomplete-color') : ""}`;
            break;
        case 1:
            incorrectCount--;
            DOM.guessCounter.textContent = `Solved in ${incorrectCount} / ${clues.length}`;
            DOM.guessCounter.style.color = correctStyle.colorStr;
            break;
        case -1:
            DOM.guessCounter.textContent = "No guesses remaining";
            DOM.guessCounter.style.color = incorrectStyle.colorStr;
            break;
    }

    // Render guess history
    const guessHistoryFragment = document.createDocumentFragment();
    for (let i = 0; i < incorrectCount; i++) {
        const li = document.createElement('li');
        li.textContent = `Guess ${i + 1}: ${gameState.guessList[i]}`;
        guessHistoryFragment.appendChild(li);
    }
    DOM.guessHistory.replaceChildren(guessHistoryFragment);
}

// Draws the game over dialog
function renderGameOver() {
    // Green dialog if correct, otherwise red
    const {msgTxt, colorStr} = (gameState.completed === 1) ? correctStyle : incorrectStyle;
    DOM.gameOverMsg.innerHTML = `<h3>${msgTxt}</h3><p>The diagnosis was <strong>${atob(answer)}</strong>.</p>`;
    DOM.gameOverMsg.style.color = colorStr; // Green
    DOM.gameOverMsg.style.borderColor = colorStr;

    DOM.inputContainer.classList.add('hidden');     // Close input container
    DOM.gameOverMsg.classList.remove('hidden');     // Show game over message
}

// Draws the navigation buttons
function renderNavButtons() {
    // Next and previous navigation button logic
    const [prevID, nextID] = caseManager.adjacent_cases(currentID);
    if (!isNaN(prevID)) {
        DOM.prevCaseBtn.textContent = prevCaseTxt;
        DOM.prevCaseBtn.onclick = (() => {
            caseManager.goto_case(prevID);
        });
    } else {
        DOM.prevCaseBtn.textContent = goHomeTxt;
        DOM.prevCaseBtn.onclick = returnHome;
    }
    if (!isNaN(nextID)) {
        DOM.nextCaseBtn.textContent = nextCaseTxt;
        DOM.nextCaseBtn.onclick = (() => {
            caseManager.goto_case(nextID);
        });
    } else {
        DOM.nextCaseBtn.textContent = goHomeTxt;
        DOM.nextCaseBtn.onclick = returnHome;
    }

    DOM.navigationBtns.classList.remove('hidden');  // Show nav buttons
}

// Render the input box with autocomplete
function updateAutoDropdown() {
    // Reset state on every keystroke
    closeDropdown();
    DOM.submitBtn.disabled = true; // Lock the submit button

    const query = DOM.inputBox.value.trim().toLowerCase();
    if (!query) return;

    // Find all dictionary terms that contain the typed letters and haven't been guessed
    const guessedLower = gameState.guessList.map(guess => guess.toLowerCase());
    const matches = dictionary.filter(term => {
        const termLower = term.toLowerCase();
        return termLower.includes(query) && !guessedLower.includes(termLower)
    });

    // If there are matches, show the dropdown
    if (matches.length) {
        // Limit to top 10 results to keep the UI clean
        const autoListFragment = document.createDocumentFragment();
        matches.slice(0, 10).forEach(match => {
            const listItem = document.createElement('li');
            
            // Highlight the matching letters
            const regex = new RegExp(`(${query})`, "gi");
            listItem.innerHTML = match.replace(regex, "<strong>$1</strong>");

            // Attach an on-click listener to autofill input box
            listItem.addEventListener('click', () => {
                DOM.inputBox.value = match;   // Autofill input box
                closeDropdown();                    // Hide the list
                DOM.submitBtn.disabled = false;         // Unlock the submit button
            });
            autoListFragment.appendChild(listItem);
        });
        DOM.autoDropdown.replaceChildren(autoListFragment); // Redraw dropdown box
        DOM.autoDropdown.classList.remove('hidden');        // Show dropdown box
    }
}

// Guess submission handler
function handleGuess() {
    const userGuess = DOM.inputBox.value.trim();
    if (!userGuess) return;

    // Add guess to state
    gameState.guessList.push(userGuess);
    gameState.guessesTaken++;

    // Check if correct (case-insensitive comparison)
    if (userGuess.toLowerCase() === atob(answer).toLowerCase()) {
        gameState.completed = 1;
    } else if (gameState.guessesTaken === clues.length) {
        gameState.completed = -1;
    }
    
    // Clear input
    DOM.inputBox.value = '';
    DOM.submitBtn.disabled = true;

    // Update history and rerender
    caseManager.update_history(currentID, gameState);
    renderGame();
}

/* -------- EVENT LISTENERS -------- */
function hookListeners() {
    // Handle Enter key submission
    DOM.inputContainer.addEventListener('keypress', (event) => {
        // Check if enter was pressed while submit button was active
        if (event.key === 'Enter' && !DOM.submitBtn.disabled) {
            handleGuess();
            DOM.autoDropdown.classList.add('hidden'); // Close dropdown
        }
    });

    // Handle click submission
    DOM.submitBtn.addEventListener('click', handleGuess);

    // Handle inputs in the input box
    DOM.inputBox.addEventListener('input', updateAutoDropdown);

    // Close the dropdown if the user clicks anywhere else on the page
    document.addEventListener('click', (event) => {
        if (event.target !== DOM.inputBox) {
            closeDropdown();

            // Ensure submit button disables if user pastes an already-guessed or invalid item
            const currentInputLower = DOM.inputBox.value.toLowerCase();
            const isValidDictionaryTerm = dictionary.some(text => text.toLowerCase() === currentInputLower);
            const isAlreadyGuessed = gameState.guessList.map(guess => guess.toLowerCase()).includes(currentInputLower);
            DOM.submitBtn.disabled = !isValidDictionaryTerm || isAlreadyGuessed;
        }
    });
}

/* -------- MAIN -------- */
export function renderGame(caseID) {
    // Populate locals with selected case
    if (caseID !== undefined) {
        currentID = caseID;
        ({answer, clues} = caseManager.fetch_case(currentID));
        dictionary = caseManager.valid_answers(currentID);
    } else if (currentID === undefined) {
        throw new Error("Attempted to render a case without a valid ID");
    }

    // Render the case details
    renderCaseDetails();

    // Render the guesses
    renderGuesses();

    // Render the game over buttons if complete
    if (gameState.completed) {renderGameOver();}

    // Render the navigation buttons
    renderNavButtons();

    // Attach event listeners
    hookListeners();
}