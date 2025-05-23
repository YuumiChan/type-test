const supabaseUrl = 'https://blirxpadaaamigqtykhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXJ4cGFkYWFhbWlncXR5a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjUzNTIsImV4cCI6MjA2MTc0MTM1Mn0.h8vCuk5pzCFxAPn8IoZ1JEIRsyEqsxXl5S2HLCBRDYE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const gameFilter = document.getElementById('gameFilter');
const sentenceFilterContainer = document.getElementById('sentenceFilterContainer');
const sentenceFilter = document.getElementById('sentenceFilter');
const leaderboardHeader = document.getElementById('leaderboardHeader');
const leaderboardBody = document.getElementById('leaderboardBody');
const sortFilterContainer = document.getElementById('sortFilterContainer');
const sortFilter = document.getElementById('sortFilter');

async function fetchSentences() {
    const { data, error } = await supabase.from('sentences').select('*');
    return data || [];
}

async function fetchFallingScores() {
    const { data, error } = await supabase
        .from('falling_scores')
        .select('score, user_id, users(username)')
        .order('score', { ascending: false })
        .limit(15);
    return data || [];
}

async function fetchSpeedTestScores(sentenceId, sortBy) {
    let query = supabase
        .from('speedtest_scores')
        .select('wpm, time_taken, user_id, sentence_id, users(username), sentences(text)');

    // Sorting
    if (sortBy === 'time') {
        query = query.order('time_taken', { ascending: true });
    } else {
        query = query.order('wpm', { ascending: false });
    }

    // Limit to top 10
    query = query.limit(10);

    if (sentenceId) query = query.eq('sentence_id', sentenceId);
    const { data, error } = await query;
    return data || [];
}

async function renderLeaderboard() {
    const game = gameFilter.value;
    leaderboardHeader.innerHTML = '';
    leaderboardBody.innerHTML = '';

    if (game === 'falling') {
        sentenceFilterContainer.style.display = 'none';
        sortFilterContainer.style.display = 'none';
        leaderboardHeader.innerHTML = '<th>Rank</th><th>Username</th><th>Score</th>';
        const scores = await fetchFallingScores();
        scores.forEach((row, i) => {
            leaderboardBody.innerHTML += `<tr><td>${i + 1}</td><td>${row.users?.username || row.user_id || 'Unknown'}</td><td>${row.score}</td></tr>`;
        });
    } else if (game === 'speedtest') {
        sentenceFilterContainer.style.display = '';
        sortFilterContainer.style.display = '';
        // Populate sentence filter only if not already populated
        if (!sentenceFilter.options.length) {
            const sentences = await fetchSentences();
            sentenceFilter.innerHTML = '<option value="">All Sentences</option>' +
                sentences.map(s => `<option value="${s.id}">${s.text.slice(0, 30)}${s.text.length > 30 ? '...' : ''}</option>`).join('');
        }
        // Use the currently selected sentenceId and sortBy
        const selectedSentenceId = sentenceFilter.value;
        const sortBy = sortFilter.value || 'wpm';
        leaderboardHeader.innerHTML = '<th>Rank</th><th>Username</th><th>Sentence</th><th>WPM</th><th>Time (s)</th>';
        const scores = await fetchSpeedTestScores(selectedSentenceId, sortBy);
        scores.forEach((row, i) => {
            leaderboardBody.innerHTML += `<tr><td>${i + 1}</td><td>${row.users?.username || row.user_id || 'Unknown'}</td><td>${row.sentences?.text ? row.sentences.text.slice(0, 30) : row.sentence_id}</td><td>${row.wpm}</td><td>${row.time_taken}</td></tr>`;
        });
    }
}

// Ensure sentence filter is populated and leaderboard is shown for the selected sentence
gameFilter.addEventListener('change', async () => {
    if (gameFilter.value === 'speedtest') {
        // Always repopulate sentences and keep the selected value
        const sentences = await fetchSentences();
        const prevValue = sentenceFilter.value;
        sentenceFilter.innerHTML = '<option value="">All Sentences</option>' +
            sentences.map(s => `<option value="${s.id}">${s.text.slice(0, 30)}${s.text.length > 30 ? '...' : ''}</option>`).join('');
        // Restore previous selection if possible
        if (prevValue) sentenceFilter.value = prevValue;
        sortFilterContainer.style.display = '';
    } else {
        sortFilterContainer.style.display = 'none';
    }
    renderLeaderboard();
});

sentenceFilter.addEventListener('change', renderLeaderboard);
if (sortFilter) sortFilter.addEventListener('change', renderLeaderboard);

document.addEventListener('DOMContentLoaded', async () => {
    // Always populate sentences on load if speedtest is selected
    if (gameFilter.value === 'speedtest') {
        const sentences = await fetchSentences();
        sentenceFilter.innerHTML = '<option value="">All Sentences</option>' +
            sentences.map(s => `<option value="${s.id}">${s.text.slice(0, 30)}${s.text.length > 30 ? '...' : ''}</option>`).join('');
        sortFilterContainer.style.display = '';
    } else {
        sortFilterContainer.style.display = 'none';
    }
    renderLeaderboard();
});