const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');
//iniliaze theme
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
}
// switcher
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}

toggleSwitch.addEventListener('change', switchTheme);

// Add falling letters code
const canvas = document.getElementById('letterCanvas');
const ctx = canvas.getContext('2d');
const letters = [];

// Resize canvas to window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Add Caps Lock detection
let capsLockOn = false;

document.addEventListener('keydown', (e) => {
  if (e.getModifierState('CapsLock')) {
    capsLockOn = true;
    // Update all existing letters
    letters.forEach(letter => {
      letter.letter = letter.letter.toUpperCase();
    });
  }
});

document.addEventListener('keyup', (e) => {
  if (e.getModifierState('CapsLock') === false) {
    capsLockOn = false;
    // Update all existing letters
    letters.forEach(letter => {
      letter.letter = letter.letter.toLowerCase();
    });
  }
});

class FallingLetter {
  constructor() {
    this.reset();
  }

  reset() {
    let letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    // Use current Caps Lock state for new letters
    this.letter = capsLockOn ? letter.toUpperCase() : letter.toLowerCase();
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.speed = 0.3 + Math.random() * 0.7; // Slow speed
    this.size = 20 + Math.random() * 20; // Original size
    this.opacity = 0.15 + Math.random() * 0.15; // Low opacity
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark'
      ? `rgba(255, 255, 255, ${this.opacity})`
      : `rgba(0, 0, 0, ${this.opacity})`;
    ctx.font = `${this.size}px monospace`;
    ctx.fillText(this.letter, this.x, this.y);
  }
}

// Create falling letters
for (let i = 0; i < 15; i++) {
  letters.push(new FallingLetter());
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  letters.forEach(letter => {
    letter.update();
    letter.draw();
  });
  requestAnimationFrame(animate);
}

// Typing listener
document.addEventListener('keypress', (e) => {
  const key = capsLockOn ? e.key.toUpperCase() : e.key.toLowerCase();
  for (let i = letters.length - 1; i >= 0; i--) {
    if (letters[i].letter === key) {
      letters[i].reset();
      break;
    }
  }
});

animate();

// Add scroll-based rotation for keyboard image
const keyboardImage = document.querySelector('.img-background');
let lastScrollPosition = window.scrollY;
const rotationSpeed = 0.1;
let currentRotation = 130; // Initial rotation

window.addEventListener('scroll', () => {
  const scrollDelta = window.scrollY - lastScrollPosition;
  lastScrollPosition = window.scrollY;

  // Update rotation based on scroll
  currentRotation += scrollDelta * rotationSpeed;

  // Apply the rotation
  keyboardImage.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
});

// Show/hide Account and Logout buttons based on login state
function updateHeaderAuthUI() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const accountBtn = document.getElementById('accountBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if (accountBtn && logoutBtn) {
    if (isLoggedIn) {
      accountBtn.style.display = 'none';
      logoutBtn.style.display = '';
    } else {
      accountBtn.style.display = '';
      logoutBtn.style.display = 'none';
    }
  }
}

// Call on DOMContentLoaded and after login/logout
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateHeaderAuthUI);
} else {
  updateHeaderAuthUI();
}

// Logout logic for Supabase
if (typeof supabase !== 'undefined') {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      localStorage.removeItem('isLoggedIn');
      updateHeaderAuthUI();
      if (!error) {
        window.location.href = 'login.html';
      } else {
        alert('Logout failed: ' + error.message);
      }
    });
  }
}

// Load header and footer, and update header UI after header loads
function loadFragment(id, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (typeof callback === 'function') callback();
    });
}

loadFragment('header', 'header.html', updateHeaderAuthUI);
loadFragment('footer', 'footer.html');