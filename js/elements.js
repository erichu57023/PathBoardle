// Cache page elements
export const DOM = {
    root:               document.documentElement,
    headerElement:      document.querySelector('header'),
    backBtn:            document.getElementById('back-btn'),
    optsBtn:            document.getElementById('opts-btn'),
    optsDropdown:       document.getElementById('opts-dropdown'),
    optsThemeBtn:       document.getElementById('opts-theme'),
    optsResetBtn:       document.getElementById('opts-reset'),
    optsAboutBtn:       document.getElementById('opts-about'),

    mainElement:        document.querySelector('main'),
    aboutModal:         document.getElementById('about-modal'),
    aboutOverlay:       document.getElementById('about-overlay'),
    closeAboutBtn:      document.getElementById('close-about-btn'),
    resetModal:         document.getElementById('reset-modal'),
    closeResetBtn:      document.getElementById('close-reset-btn'),
    confirmResetBtn:    document.getElementById('confirm-reset-btn'),
    menuView:           document.getElementById('menu-view'),
    filterBtn:          document.getElementById('filter-btn'),
    filterIcon:         document.getElementById('filter-icon'),
    filterLabel:        document.getElementById('filter-label'),
    filterSelection:    document.getElementById('filter-selection'),
    filterDropdown:     document.getElementById('filter-dropdown'),
    playOrderBtn:       document.getElementById('play-order-btn'),
    playRandomBtn:      document.getElementById('play-random-btn'),
    menuContainer:      document.getElementById('menu-container'),
    
    gameView:           document.getElementById('game-view'),
    caseTitle:          document.getElementById('case-title'),
    guessCounter:       document.getElementById('guess-counter'),
    cluesContainer:     document.getElementById('clues-container'),
    guessHistory:       document.getElementById('guess-history'),
    gameOverMsg:        document.getElementById('game-over-message'),

    inputContainer:     document.getElementById('input-container'),
    inputBox:           document.getElementById('input-box'),
    autoDropdown:       document.getElementById('autocomplete-dropdown'),
    submitBtn:          document.getElementById('submit-btn'),
    
    navigationBtns:     document.getElementById('navigation-btns'),
    prevCaseBtn:        document.getElementById('prev-case-btn'),
    nextCaseBtn:        document.getElementById('next-case-btn')
};


// Set theme based on user preference
export function switchTheme(theme) {
    switch (theme) {
        case undefined: // If theme specified, toggle between light and dark
            theme = DOM.root.getAttribute('data-theme') === "dark" ? "light" : "dark";
            break;
        case "dark":    // If valid themes specified, break early
        case "light":
            break
        default:        // If invalid theme specified, warn and fall back to default
            console.warn(`An invalid theme "${theme}" was requested. Falling back to default.`);
        case "browser-default": // Default to user setting if present, otherwise browser preference
            let browserDefault = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
            let userSetting = localStorage.getItem('theme');
            theme = userSetting || browserDefault;
            break;
    }

    DOM.optsThemeBtn.textContent = (theme === "dark") ? "\u{1f31e} Light mode" : "\u{1f319} Dark mode";
    DOM.root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}
