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
const cases_list = await fetch_json("/store/blob.json");
const n_cases = cases_list.length;
const id_list = [];
const c1_list = {};
const c2_list = {};
const cases = {};
const n_clues = {};
for (const { id, c1, c2, ...deets } of cases_list) {
    id_list.push(id);
    c1_list[id] = c1;
    c2_list[id] = c2;
    cases[id] = deets;
    n_clues[id] = deets.clues.length;
}

// Pull case history from localStorage
const history = JSON.parse(localStorage.getItem('caseHistory')) || {};

// Create case manager object
const caseManager = {
    // Index info
    n_cases,
    id: id_list,
    c1: c1_list,
    c2: c2_list,
    n_clues,
    dict: await fetch_json("/store/dict.json"),
    history,
    cases,
    img_urls: await fetch_json("/store/img.json"),
    
    // Fetch case details from remote
    fetch_case(case_id) {
        return this.cases[case_id];
    },

    // Get image URL
    get_image_URL(case_id, clue_num) {
        return `https://drive.google.com/thumbnail?id=${atob(this.img_urls[`${case_id}_${clue_num}`])}&sz=w1600`;
    },

    // Check if case exists
    case_exists(case_id) {
        return !isNaN(case_id) && this.id.includes(case_id);
    },

    // Navigate to case
    goto_case(case_id) {
        window.location.href = `?case=${case_id}`;
    },

    // Get valid answers for case
    valid_answers(case_id) {
        const case_category = this.c1[case_id];
        return this.dict[case_category];
    },

    // Update case history
    update_history(case_id, case_status) {
        this.history[case_id] = case_status;
        localStorage.setItem('caseHistory', JSON.stringify(this.history));
    },

    // Reset case history
    reset_history() {
        this.history = [];
        localStorage.setItem('caseHistory', '{}');
    },

    // Update a case queue in sessionStorage based on active filters, and returns the queue
    update_queue(case_idxs, randomize = false) {
        const caseQueueIdxs = randomize ? shuffle(case_idxs) : case_idxs;
        const caseQueue = caseQueueIdxs.map(index => this.id[index]);
        sessionStorage.setItem("case_queue", JSON.stringify(caseQueue));
        return caseQueue
    },

    // Get adjacent cases in the case queue
    adjacent_cases(case_id) {
        const caseQueue = JSON.parse(sessionStorage.getItem("case_queue"));

        const curr_idx = caseQueue.indexOf(case_id);
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
