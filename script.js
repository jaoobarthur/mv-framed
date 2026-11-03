
let currentFrame = 1;
let unlockedFrames = 1;
let gameWon = false;

const imageBase =
  "https://raw.githubusercontent.com/jaoobarthur/mv-framed/main/";

const frameImage = document.getElementById("frameImage");
const guessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const message = document.getElementById("message");
const frameButtons = document.getElementById("frameButtons");
const suggestions = document.getElementById("suggestions");
let selectedSuggestion = -1;

// Desafio diário: um novo MV por dia, em sequência.
const startDate = new Date(2026, 10, 2); // 02/11/2026
const today = new Date();

startDate.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);

const daysPassed = Math.floor(
  (today - startDate) / (1000 * 60 * 60 * 24)
);

const currentMV = daysPassed >= 0 && daysPassed < catalog.length
  ? catalog[daysPassed]
  : null;

if (!currentMV) {
  document.body.innerHTML = `
    <h1>OnRepeat</h1>
    <h2>New challenges soon! 💿</h2>
    <p>We're preparing more frames for you!</p>
  `;
} else {

function showFrame(number) {
  currentFrame = number;
  const fileName = currentMV.frames[number - 1];
  frameImage.src = imageBase + currentMV.imageFolder + fileName;
  renderButtons();
}

function renderButtons() {
  frameButtons.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "frame-button";
    button.disabled = !gameWon && i > unlockedFrames;
    if (i === currentFrame) button.classList.add("active");
    button.addEventListener("click", function() {
      showFrame(i);
    });
    frameButtons.appendChild(button);
  }
}

function normalizeAnswer(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function showSuggestions() {
  const search = normalizeAnswer(guessInput.value);
  suggestions.innerHTML = "";
  selectedSuggestion = -1;

  if (search === "") {
    suggestions.classList.remove("show");
    return;
  }

  const matches = catalog.filter(mv => {
    const title = normalizeAnswer(mv.title);
    return title.includes(search);
  });

  if (matches.length === 0) {
    suggestions.classList.remove("show");
    return;
  }

  matches.forEach(mv => {
    const item = document.createElement("div");
    item.className = "suggestion-item";

    const title = document.createElement("div");
    title.textContent = mv.title;

    const artist = document.createElement("div");
    artist.className = "suggestion-artist";
    artist.textContent = mv.artist;

    item.appendChild(title);
    item.appendChild(artist);

    item.addEventListener("click", function() {
      guessInput.value = mv.title;
      suggestions.classList.remove("show");
      selectedSuggestion = -1;
      guessInput.focus();
    });

    suggestions.appendChild(item);
  });

  suggestions.classList.add("show");
}

function updateSelectedSuggestion(items) {
  items.forEach((item, index) => {
    item.classList.toggle(
      "selected",
      index === selectedSuggestion
    );
  });

  if (selectedSuggestion >= 0) {
    items[selectedSuggestion].scrollIntoView({
      block: "nearest"
    });
  }
}

function checkGuess() {
  if (gameWon) return;
  const guess = normalizeAnswer(guessInput.value);
  if (guess === "") {
    message.textContent = "Enter your guess first!";
    return;
  }

  const acceptedAnswers = [
    currentMV.title,
    ...currentMV.answers
  ].map(normalizeAnswer);

  if (acceptedAnswers.includes(guess)) {
  gameWon = true;
  message.innerHTML = `
    <h2>You got it!</h2>
    <p>Grammy-worthy performance! ✨</p>
  `;
  guessInput.disabled = true;
  guessButton.disabled = true;
  renderButtons();
  return;
}

if (unlockedFrames === 6) {
  message.innerHTML = `
  <h3>❌ Wrong! The answer was:</h3>
  <h2>${currentMV.title}</h2>
  <p>${currentMV.artist}</p>
  <p>${currentMV.album} • ${currentMV.year}</p>
`;
  guessInput.disabled = true;
  guessButton.disabled = true;
  return;
}

  unlockedFrames++;
  message.textContent = "Wrong! Here's your next frame.";
  guessInput.value = "";
  showFrame(unlockedFrames);
  guessInput.focus();
}

guessInput.addEventListener("input", showSuggestions);

guessButton.addEventListener("click", checkGuess);

guessInput.addEventListener("keydown", function(event) {
  const items = suggestions.querySelectorAll(".suggestion-item");

  if (event.key === "ArrowDown") {
    if (items.length === 0) return;
    event.preventDefault();
    selectedSuggestion++;
    if (selectedSuggestion >= items.length) selectedSuggestion = 0;
    updateSelectedSuggestion(items);
  }
  else if (event.key === "ArrowUp") {
    if (items.length === 0) return;
    event.preventDefault();
    selectedSuggestion--;
    if (selectedSuggestion < 0) selectedSuggestion = items.length - 1;
    updateSelectedSuggestion(items);
  }
  else if (event.key === "Enter") {
    if (selectedSuggestion >= 0 && items.length > 0) {
      event.preventDefault();
      items[selectedSuggestion].click();
    } else {
      suggestions.classList.remove("show");
      checkGuess();
    }
  }
  else if (event.key === "Escape") {
    suggestions.classList.remove("show");
    selectedSuggestion = -1;
  }
});

document.addEventListener("click", function(event) {
  if (!event.target.closest(".autocomplete")) {
    suggestions.classList.remove("show");
  }
});

showFrame(1);

}
