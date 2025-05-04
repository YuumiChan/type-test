const keys = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

const timestamps = [];

timestamps.unshift(getTimestamp());

function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey() {
  return keys[getRandomNumber(0, keys.length - 1)];
}

let currentKey = null;

function targetRandomKey() {
  // Remove previous highlight
  const prev = document.querySelector(".selected");
  if (prev) prev.classList.remove("selected");
  // Highlight new random key
  currentKey = getRandomKey();
  const key = document.getElementById(currentKey);
  if (key) key.classList.add("selected");
  // Show current key to press
  const currentKeyDiv = document.getElementById("current-key");
  if (currentKeyDiv) currentKeyDiv.textContent = currentKey;
}

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

document.addEventListener("keyup", event => {
  const keyPressed = String.fromCharCode(event.keyCode);
  const keyElement = document.getElementById(keyPressed);
  const highlightedKey = document.querySelector(".selected");

  if (keyElement) {
    keyElement.classList.add("hit");
    keyElement.addEventListener('animationend', () => {
      keyElement.classList.remove("hit");
    }, { once: true });
  }

  if (highlightedKey && keyPressed === highlightedKey.innerHTML) {
    timestamps.unshift(getTimestamp());
    const elapsedTime = timestamps[0] - timestamps[1];
    console.log(`Character per minute ${60 / elapsedTime}`);
    highlightedKey.classList.remove("selected");
    targetRandomKey();
  }
});

// Always highlight a key at start
targetRandomKey();