// Redirect to register if not logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'acc.html';
}

const words = [
    "algorithm", "api", "cloud computing", "database",
    "encryption", "firewall", "frontend", "backend", "bug", "code",
    "compiler", "debugging", "blockchain", "bit", "byte", "cache",
    "devops", "framework", "git", "hacker", "java", "linux",
    "operating system", "protocol", "ram", "router", "server", "sql",
    "url", "web", "python", "c++",
    "vpn", "ui", "ux", "html", "css", "programming", "code", "web", "developer"
];

let score = 0;
let currentWord = "";
let gameActive = true;
let isPaused = false;
let gameStarted = false;
// words limiter
function getActiveWordCount() {
    return 2 + Math.floor(score / 100);
}
// spawner
function spawnWords() {
    const currentWords = document.getElementsByClassName("word").length;
    const targetWords = getActiveWordCount();

    for (let i = currentWords; i < targetWords; i++) {
        createWord();
    }
}
// fall speed
function calculateFallSpeed(baseSpeed) {
    const scoreMultiplier = 1 + score / 200;
    const randomOffset = (Math.random() - 0.5) * 0.5;
    return baseSpeed * scoreMultiplier + randomOffset;
}

// Initialize Supabase client
const supabaseUrl = 'https://blirxpadaaamigqtykhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXJ4cGFkYWFhbWlncXR5a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjUzNTIsImV4cCI6MjA2MTc0MTM1Mn0.h8vCuk5pzCFxAPn8IoZ1JEIRsyEqsxXl5S2HLCBRDYE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// When saving scores, always use the current user's ID from Supabase Auth
async function saveFallingScore(score) {
    const userId = localStorage.getItem('userId');
    await supabase.from('falling_scores').insert([
        {
            user_id: userId ? parseInt(userId) : null,
            score: score
        }
    ]);
}

async function saveSpeedTestScore(sentenceId, timeTaken, wpm) {
    const user = supabase.auth.user ? supabase.auth.user() : null;
    await supabase.from('speedtest_scores').insert([
        {
            user_id: user ? user.id : null,
            sentence_id: sentenceId,
            time_taken: timeTaken,
            wpm: wpm
        }
    ]);
}

function createWord() {
    if (!gameActive || isPaused) return;

    const word = words[Math.floor(Math.random() * words.length)];
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.innerHTML = word
        .split("")
        .map((char) => `<span class="untyped">${char}</span>`)
        .join("");
    wordElement.style.left = Math.random() * (window.innerWidth - 100) + "px";
    wordElement.style.top = "0px";
    document.getElementById("game-container").appendChild(wordElement);

    let fallSpeed = calculateFallSpeed(1);

    function fall() {
        if (!gameActive || isPaused) return;

        const top = parseFloat(wordElement.style.top);
        if (top > window.innerHeight && !wordElement.classList.contains("completed")) {
            endGame();
        } else {
            if (top > window.innerHeight * 0.7) {
                wordElement.classList.add("danger");
            }
            fallSpeed = calculateFallSpeed(1);
            wordElement.style.top = top + fallSpeed + "px";
            if (gameActive && !wordElement.classList.contains("completed")) {
                requestAnimationFrame(fall);
            }
        }
    }

    requestAnimationFrame(fall);
}

document.addEventListener("keydown", (e) => {
    if (!gameStarted || isPaused || !gameActive || e.key.length !== 1) return;

    currentWord += e.key;
    const words = document.getElementsByClassName("word");
    let foundMatch = false;

    Array.from(words).forEach((wordElement) => {
        const word = wordElement.textContent;
        if (word.startsWith(currentWord) && !wordElement.classList.contains("completed")) {
            foundMatch = true;
            const spans = wordElement.getElementsByTagName("span");
            for (let i = 0; i < spans.length; i++) {
                if (i < currentWord.length) {
                    spans[i].className = "typed";
                } else {
                    spans[i].className = "untyped";
                }
            }

            if (currentWord === word) {
                wordElement.classList.add("completed");
                setTimeout(() => {
                    wordElement.remove();
                    createWord();
                }, 300);
                score += word.length * 2;
                updateScore();
                currentWord = "";
                spawnWords();
            }
        } else if (!wordElement.classList.contains("completed")) {
            const spans = wordElement.getElementsByTagName("span");
            Array.from(spans).forEach((span) => (span.className = "untyped"));
        }
    });

    if (!foundMatch) {
        currentWord = e.key;
        Array.from(words).forEach((wordElement) => {
            if (wordElement.textContent.startsWith(currentWord) && !wordElement.classList.contains("completed")) {
                const spans = wordElement.getElementsByTagName("span");
                spans[0].className = "typed";
            }
        });
    }
});

function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
}

// Add this function to save score to Supabase
async function saveScore(score) {
    // Replace 'falling_word_scores' with your actual Supabase table name
    const { data, error } = await supabase
        .from('falling_word_scores')
        .insert([{ score: score, created_at: new Date().toISOString() }]);
    if (error) {
        console.error('Failed to save score:', error.message);
    }
}

function endGame() {
    gameActive = false;
    document.getElementById("game-container").style.opacity = "0.5";
    document.getElementById("game-over").style.display = "block";
    document.getElementById("final-score").textContent = score;

    // Save score to database
    saveFallingScore(score);
}

function restartGame() {
    location.reload();
}

function goHome() {
    location.href = "index.html";
}

function startGame() {
    // Hide start screen and game over screen
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('pause-button').style.display = 'block';
    // Reset score and state
    score = 0;
    updateScore();
    gameStarted = true;
    gameActive = true;
    isPaused = false;
    currentWord = '';
    // Remove any existing words
    Array.from(document.getElementsByClassName('word')).forEach(el => el.remove());
    // Spawn initial words
    spawnWords();
}

function togglePause() {
    isPaused = !isPaused;
    const gameContainer = document.getElementById('game-container');
    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');

    if (isPaused) {
        gameContainer.classList.add('game-paused');
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
        // Stop all animations
        const words = document.getElementsByClassName('word');
        Array.from(words).forEach(word => {
            word.style.animationPlayState = 'paused';
            word.style.top = word.offsetTop + 'px'; // Freeze current position
        });
    } else {
        gameContainer.classList.remove('game-paused');
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        // Resume animations
        const words = document.getElementsByClassName('word');
        Array.from(words).forEach(word => {
            if (!word.classList.contains('completed')) {
                word.style.animationPlayState = 'running';
                requestAnimationFrame(() => fall(word));
            }
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.getElementById('checkbox').checked = savedTheme === 'light';

    // Event listeners
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.getElementById('checkbox').addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'light' : 'dark');
    });

    // Don't auto-spawn words, wait for game start
    gameStarted = false;
    gameActive = false;

    // Add resume button listener
    document.getElementById('resume-button').addEventListener('click', () => {
        if (isPaused) {
            togglePause();
        }
    });
});

// Update fall function to check for pause state
function fall(wordElement) {
    if (!gameActive || isPaused) return;

    const top = parseFloat(wordElement.style.top);
    if (top > window.innerHeight && !wordElement.classList.contains("completed")) {
        endGame();
    } else {
        if (top > window.innerHeight * 0.7) {
            wordElement.classList.add("danger");
        }
        const fallSpeed = calculateFallSpeed(1);
        wordElement.style.top = (top + fallSpeed) + "px";
        if (gameActive && !isPaused && !wordElement.classList.contains("completed")) {
            requestAnimationFrame(() => fall(wordElement));
        }
    }
}
