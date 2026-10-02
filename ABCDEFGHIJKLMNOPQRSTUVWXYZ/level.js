const phraseStage = document.querySelector("#phrase-stage");
const phraseForm = document.querySelector("#phrase-form");
const phraseAnswer = document.querySelector("#phrase-answer");
const phraseFeedback = document.querySelector("#phrase-feedback");
const stickStage = document.querySelector("#stick-stage");
const stickPickup = document.querySelector("#stick-pickup");
const stickPrompt = document.querySelector("#stick-prompt");
const nextLevel = document.querySelector("#level-eleven-next");
const pedroLine = document.querySelector("#level-eleven-pedro");

const acceptedPhrase = "the quick brown fox jumps over the lazy dog";

function showStickStage() {
  phraseStage.hidden = true;
  stickStage.hidden = false;
}

function showCollectedState() {
  stickPickup.disabled = true;
  stickPickup.classList.add("is-collected");
  stickPrompt.textContent = "ADDED TO INVENTORY";
  nextLevel.hidden = false;
  pedroLine.textContent = "There. The dog’s belongings have been responsibly filed. Let’s keep this between us.";
}

phraseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = phraseAnswer.value.trim().toLowerCase().replace(/\s+/g, " ");
  if (answer !== acceptedPhrase) {
    phraseFeedback.textContent = "PHRASE NOT RECOGNIZED // TRY AGAIN";
    pedroLine.textContent = "Not quite. The fox, the dog, and every letter of the alphabet are waiting patiently.";
    phraseAnswer.focus();
    return;
  }

  phraseFeedback.textContent = "OBSERVATION ACCEPTED";
  pedroLine.textContent = "Well spotted. Try not to look so pleased with yourself; there's still paperwork.";
  phraseStage.classList.add("is-fading");
  window.setTimeout(showStickStage, 500);
});

stickPickup.addEventListener("click", () => {
  if (window.GanimesInventory.add("stick")) showCollectedState();
  else pedroLine.textContent = "Your inventory is full. The stick will have to remain tragically uncollected.";
});
