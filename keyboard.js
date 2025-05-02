const supabaseUrl = 'https://blirxpadaaamigqtykhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXJ4cGFkYWFhbWlncXR5a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjUzNTIsImV4cCI6MjA2MTc0MTM1Mn0.h8vCuk5pzCFxAPn8IoZ1JEIRsyEqsxXl5S2HLCBRDYE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Redirect to register if not logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'acc.html';
}

async function fetchSentences() {
  const { data, error } = await supabase.from('sentences').select('*');
  if (error) {
    console.error('Error fetching sentences:', error);
    return [];
  }
  return data;
}

// When saving scores, always use the current user's ID from Supabase Auth
async function saveSpeedTestScore(sentenceId, timeTaken, wpm) {
  const userId = localStorage.getItem('userId');
  await supabase.from('speedtest_scores').insert([
    {
      user_id: userId ? parseInt(userId) : null,
      sentence_id: sentenceId,
      time_taken: timeTaken,
      wpm: wpm
    }
  ]);
}

let timer;
let startTime;
let currentIndex = 0;
let testText;
let testSentenceId;

document.addEventListener('DOMContentLoaded', async () => {
  const textDisplay = document.getElementById('text-display');
  const inputField = document.getElementById('input-field');
  const timerDisplay = document.getElementById('timer-display');
  const resultDisplay = document.getElementById('result-display');
  const resetButton = document.createElement('button');

  const sentencesData = await fetchSentences();
  if (!sentencesData || sentencesData.length === 0) {
    textDisplay.textContent = 'No sentences available. Please contact admin.';
    inputField.disabled = true;
    return;
  }
  let sentences = sentencesData.map(s => s.text);
  let sentenceIds = sentencesData.map(s => s.id);

  let randomIndex = Math.floor(Math.random() * sentences.length);
  testText = sentences[randomIndex];
  testSentenceId = sentenceIds[randomIndex];
  textDisplay.textContent = testText;

  inputField.addEventListener('input', () => {
    const inputText = inputField.value;
    if (inputText === testText) {
      clearInterval(timer);
      const elapsedTime = getElapsedTime();
      const wordsCount = testText.trim().split(/\s+/).length;
      const wordsPerMinute = Math.round((wordsCount / elapsedTime) * 60);

      resultDisplay.textContent = `Congratulations! You completed the test in ${elapsedTime} seconds. Your typing speed: ${wordsPerMinute} WPM`;

      // Upload result to Supabase
      saveSpeedTestScore(testSentenceId, elapsedTime, wordsPerMinute);

      showResetButton();
    } else {
      currentIndex = inputText.length;
      updateTextDisplay();
    }
  });

  inputField.addEventListener('focus', startTimer);

  function startTimer() {
    if (!timer) {
      startTime = new Date();
      timer = setInterval(() => {
        timerDisplay.textContent = getElapsedTime();
      }, 1000);
    }
  }

  function getElapsedTime() {
    return Math.floor((new Date() - startTime) / 1000);
  }

  function updateTextDisplay() {
    const inputText = inputField.value;
    let displayHtml = '';

    for (let i = 0; i < testText.length; i++) {
      if (i < inputText.length) {
        if (inputText[i] === testText[i]) {
          displayHtml += `<span class="correct">${testText[i]}</span>`;
        } else {
          displayHtml += `<span class="incorrect">${testText[i]}</span>`;
        }
      } else {
        displayHtml += testText[i];
      }
    }

    textDisplay.innerHTML = displayHtml;
  }

  function showResetButton() {
    resetButton.textContent = 'Reset';
    resetButton.classList.add('reset-button');
    document.body.appendChild(resetButton);
    resetButton.addEventListener('click', resetTest);
  }

  function resetTest() {
    clearInterval(timer);
    timer = null;
    startTime = null;
    currentIndex = 0;
    inputField.value = '';
    let randomIndex = Math.floor(Math.random() * sentences.length);
    testText = sentences[randomIndex];
    testSentenceId = sentenceIds[randomIndex];
    textDisplay.textContent = testText;
    timerDisplay.textContent = '0';
    resultDisplay.textContent = '';
    resetButton.remove();
  }
});

async function saveTypingScore(paragraphNumber, paragraphText, elapsedTime, wordsPerMinute) {
  const { data, error } = await supabase
    .from('paragraph_scores')
    .insert([{
      paragraph_number: paragraphNumber,
      paragraph_text: paragraphText,
      time_elapsed: formatTime(elapsedTime),
      words_per_minute: wordsPerMinute,
      created_at: new Date().toISOString()
    }]);
  if (error) {
    console.error('Failed to save score:', error.message);
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
