// Fetch a json from a remote database
async function fetch_json(db_site) {
    const response = await fetch(db_site);
    if (!response.ok) {
        console.warn("Could not fetch remote json");
        return {};
    }
    return await response.json();
}

// Shuffle an array using Fisher-Yates algorithm
function shuffle(array) {
    // Loop from the back of the array down to the second element
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements i and j using destructuring
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Pull case index information from remote
const [n_clues, c1, c2] = await fetch_json("./store/idx.json");
const n_cases = n_clues.length;

// Pull case history from localStorage
const history = JSON.parse(localStorage.getItem('caseHistory')) || {};

// Create case manager object
const caseManager = {
    n_cases,
    c1,
    c2,
    n_clues,
    dict: await fetch_json("./store/dict.json"),
    history,
    store: {},
    imgs: await fetch_json("./store/img.json"),
    
    async fetch_case(case_0id) {
        const storeid = Math.floor(case_0id / 100);
        const idx = case_0id % 100;
        
        if (!Object.hasOwn(this.store, storeid)) { // Cache blobs
            this.store[storeid] = await fetch_json(`./store/blob${storeid}.json`);
        }
        return this.store[storeid][idx];
    },

    get_image_URL(img_name) {
        return `https://drive.google.com/thumbnail?id=${atob(this.imgs[img_name])}&sz=w1600`;
    },

    case_exists(case_0id) {
        return !isNaN(case_0id) && case_0id < this.n_cases;
    },

    goto_case(case_0id) {
        window.location.href = `?case=${case_0id + 1}`;
    },

    valid_answers(case_0id) {
        const case_category = this.c1[case_0id];
        return this.dict[case_category];
    },

    update_history(case_0id, case_status) {
        this.history[case_0id + 1] = case_status;
        localStorage.setItem('caseHistory', JSON.stringify(this.history));
    },

    reset_history() {
        this.history = [];
        localStorage.setItem('caseHistory', '{}');
    },

    fetch_history(case_0id) {
        return JSON.parse(localStorage.getItem('caseHistory'))?.[case_0id + 1];
    },

    // Update a case queue in sessionStorage based on active filters, and returns the queue
    update_queue(case_0idxs, randomize = false) {
        const caseQueue = randomize ? shuffle(case_0idxs) : case_0idxs;
        sessionStorage.setItem("case_queue", JSON.stringify(caseQueue));
        return caseQueue
    },

    // Get adjacent cases in the case queue
    adjacent_cases(case_0id) {
        const caseQueue = JSON.parse(sessionStorage.getItem("case_queue"));

        const curr_idx = caseQueue.indexOf(case_0id);
        const prev_idx = curr_idx - 1;
        const prev_case = (prev_idx === undefined || prev_idx < 0) ? 
                        NaN : caseQueue[prev_idx];
        
        const next_idx = curr_idx + 1;
        const next_case = (next_idx === undefined || next_idx === caseQueue.length) ? 
                        NaN : caseQueue[next_idx];

        return [prev_case, next_case];
    }
}

export default caseManager;
