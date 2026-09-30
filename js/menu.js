/* -------- SETUP -------- */
// Core imports
import { DOM, categoryClassMap } from "./elements.js"
import caseManager from './case_manager.js';

// Locals
let active_filter = "All Cases";
const filterEmptyNode = document.createElement("p")
filterEmptyNode.textContent = "No cases found for this category.";

/* -------- RENDERING HELPER FUNCTIONS -------- */

// Get a valid list of cases which match a filter category
function getCaseList(filt_label) {
    const allCases = Array.from({length: caseManager.n_cases}, (_, index) => index);
    // If filter is not specified, show all cases
    if (filt_label == undefined || filt_label === "All Cases" ) {
        return allCases;
    }
    // Otherwise, return a filtered list of case indices
    return allCases.filter((element) => {
        return caseManager.c1[element] === filt_label || caseManager.c2[element] === filt_label
    });
}

// Build a single case card element in memory
function buildCaseCardElement(list_idx) {
    const case_1id = list_idx + 1;
    const caseProgress = caseManager.fetch_history(list_idx);

    // Load progress values if the player has seen this case
    let statusCls, statusTxt;
    if (caseProgress) {
        switch (caseProgress.completed) {
            case 1: 
                statusCls = 'solved';
                statusTxt = `Solved in ${caseProgress.guessesTaken} / ${caseManager.n_clues[list_idx]}`;
                break;
            case -1:             
                statusCls = 'failed';
                statusTxt = 'Failed';
                break;
            default:
                statusCls = 'in-progress';
                statusTxt = 'In Progress';
        }

    // Otherwise, load default values
    } else {
        statusCls = 'unattempted';
        statusTxt = 'New Case';
    }

    // Create case card as a clickable element
    const caseCard = document.createElement('a');
    caseCard.href = `?case=${case_1id}`; 
    caseCard.className = `case-card ${statusCls}`;

    // Extract category and subcategory
    const catDiv = caseManager.c1[list_idx];
    const catCls = catDiv.toLowerCase();
    const subCatDiv = caseManager.c2[list_idx];
    const subCatCls = categoryClassMap[subCatDiv] ?? "hidden";
    
    // Populate the inner HTML and append to DOM
    caseCard.innerHTML = `
        <div class="case-title">Case ${case_1id}</div>
        <div class="case-category ${catCls}">${catDiv}</div>
        <div class="case-category case-subcategory ${subCatCls}">${subCatDiv}</div>
        <div class="case-status">${statusTxt}</div>
    `;
    // DOM.menuContainer.appendChild(caseCard);
    return caseCard
}

/* -------- EVENT LISTENERS -------- */
// Filter button click listener
DOM.filterBtn.addEventListener('click', () => {
    DOM.filterDropdown.classList.toggle('hidden');  // Toggle the dropdown menu
    DOM.filterIcon.classList.toggle('transformed'); // Transform the button
});

// Filter dropdown selection handler
DOM.filterDropdown.addEventListener('click', (event) => {
    // Identify clicked element and return if no buttons were clicked
    const selectedElement = event.target.closest('a');
    if (!selectedElement) return;
    
    // Update UI contents
    active_filter = selectedElement.textContent;                // Update active filter based on selection
    DOM.filterSelection.textContent = active_filter;            // Update filter selection label
    DOM.filterSelection.className = selectedElement.className;  // Update filter selection style
    DOM.filterDropdown.classList.add('hidden');                 // Hide the dropdown menu
    DOM.filterIcon.classList.remove('transformed');             // Detransform the button

    // Rerender UI
    renderMenu();
});

// Play in order button
DOM.playOrderBtn.addEventListener('click', () => {
    const filt_idxs = getCaseList(active_filter);               // Get case indices
    const case_queue = caseManager.update_queue(filt_idxs);     // Update and retrieve the case queue
    caseManager.goto_case(case_queue[0])                        // Redirect to the first case
});

// Play randomized button
DOM.playRandomBtn.addEventListener('click', () => {
    const filt_idxs = getCaseList(active_filter);                   // Get case indices
    const case_queue = caseManager.update_queue(filt_idxs, true);   // Update and retrieve the case queue with randomization
    caseManager.goto_case(case_queue[0])                            // Redirect to the first case
});



/* -------- MAIN -------- */
// Render the menu with a list of cases and filter dropdown
export function renderMenu() {
    // Get id list indices matching active filter
    const filt_idxs = getCaseList(active_filter);
    if (filt_idxs.length) {
        // Build a card element for each case id and append to a fragment
        const caseCards = document.createDocumentFragment();
        for (let i = 0; i < filt_idxs.length; i++) {
            caseCards.appendChild(buildCaseCardElement(filt_idxs[i]));
        }

        // Store the case queue in the case manager
        caseManager.update_queue(filt_idxs);

        // Update the entire menu in one draw
        DOM.menuContainer.replaceChildren(caseCards)
        
        // Enable buttons
        DOM.playOrderBtn.disabled = false;
        DOM.playRandomBtn.disabled = false;
    
    // Handle empty states (e.g. if a filter has no cases)
    } else {
        DOM.playOrderBtn.disabled = true;
        DOM.playRandomBtn.disabled = true;
        DOM.menuContainer.replaceChildren(filterEmptyNode);
    }
}
