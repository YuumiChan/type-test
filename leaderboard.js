const supabaseUrl = 'https://blirxpadaaamigqtykhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXJ4cGFkYWFhbWlncXR5a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjUzNTIsImV4cCI6MjA2MTc0MTM1Mn0.h8vCuk5pzCFxAPn8IoZ1JEIRsyEqsxXl5S2HLCBRDYE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const gameFilter = document.getElementById('gameFilter');
const sentenceFilterContainer = document.getElementById('sentenceFilterContainer');
const sentenceFilter = document.getElementById('sentenceFilter');
const leaderboardHeader = document.getElementById('leaderboardHeader');
const leaderboardBody = document.getElementById('leaderboardBody');

async function fetchSentences() {
    const { data, error } = await supabase.from('sentences').select('*');
    return data || [];
}

async function fetchFallingScores() {
    const { data, error } = await supabase
        .from('falling_scores')
        .select('score, user_id, users(username)')
        .order('score', { ascending: false })
        .limit(5);
    return data || [];
}

async function fetchSpeedTestScores(sentenceId) {
    let query = supabase
        .from('speedtest_scores')
        .select('wpm, time_taken, user_id, sentence_id, users(username), sentences(text)')
        .order('wpm', { ascending: false })
        .limit(5);
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
        leaderboardHeader.innerHTML = '<th>Rank</th><th>Username</th><th>Score</th>';
        const scores = await fetchFallingScores();
        scores.forEach((row, i) => {
            leaderboardBody.innerHTML += `<tr><td>${i + 1}</td><td>${row.users?.username || row.user_id || 'Unknown'}</td><td>${row.score}</td></tr>`;
        });
    } else if (game === 'speedtest') {
        sentenceFilterContainer.style.display = '';
        // Populate sentence filter
        const sentences = await fetchSentences();
        sentenceFilter.innerHTML = '<option value="">All Sentences</option>' +
            sentences.map(s => `<option value="${s.id}">${s.text.slice(0, 30)}${s.text.length > 30 ? '...' : ''}</option>`).join('');
        const selectedSentenceId = sentenceFilter.value;
        leaderboardHeader.innerHTML = '<th>Rank</th><th>Username</th><th>Sentence</th><th>WPM</th><th>Time (s)</th>';
        const scores = await fetchSpeedTestScores(selectedSentenceId);
        scores.forEach((row, i) => {
            leaderboardBody.innerHTML += `<tr><td>${i + 1}</td><td>${row.users?.username || row.user_id || 'Unknown'}</td><td>${row.sentences?.text ? row.sentences.text.slice(0, 30) : row.sentence_id}</td><td>${row.wpm}</td><td>${row.time_taken}</td></tr>`;
        });
    }
}

gameFilter.addEventListener('change', renderLeaderboard);
sentenceFilter.addEventListener('change', renderLeaderboard);

document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
});