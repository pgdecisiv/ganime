const grid = document.querySelector("#keypad-grid");
const legend = document.querySelector("#legend");
const stageLabel = document.querySelector("#stage-label");
const feedback = document.querySelector("#keypad-feedback");
const commentator = document.querySelector("#commentator-line");
const nextLevel = document.createElement("a");

const sequences = [
  {
    label: "SEQUENCE 01 // UNLABELED",
    legend: "What are the odds?",
    // Before labels appear, count physical button positions from 1 to 12.
    order: [0, 2, 4, 6, 8, 10],
    complete: "Only primes can defeat the fallen",
    pedro: "There. Even the odds look impressed. Don't get comfortable."
  },
  {
    label: "SEQUENCE 02 // PRIME ACCESS",
    legend: "Only primes can defeat the fallen",
    order: [1, 2, 4, 6, 10],
    complete: "How many pairs of rabbits can be produced from a single pair in a year?",
    pedro: "Prime work. A new instruction is coming. Try to contain your excitement."
  },
  {
    label: "SEQUENCE 03 // NUMBERED ACCESS",
    legend: "How many pairs of rabbits can be produced from a single pair in a year?",
    // Once numbered, the button labels run from 0 to 11.
    order: [0, 1, 1, 2, 3, 5, 8],
    complete: null,
    pedro: "You did it. Arithmetic has finally earned its keep. Your next assignment is ready."
  }
];

let stage = 0;
let progress = 0;
let locked = false;
const buttons = [];

nextLevel.className = "next-level-button";
nextLevel.href = "/fibo";
nextLevel.textContent = "NEXT LEVEL";
nextLevel.hidden = true;

function setStage(nextStage) {
  stage = nextStage;
  progress = 0;
  locked = false;
  legend.textContent = sequences[stage].legend;
  stageLabel.textContent = sequences[stage].label;
  feedback.textContent = "";
  buttons.forEach((button) => {
    button.classList.remove("is-lit", "is-wrong");
    button.textContent = stage === 2 ? String(button.dataset.index) : "";
    button.setAttribute("aria-label", stage === 2 ? `Button ${button.dataset.index}` : `Unlabeled button, position ${Number(button.dataset.index) + 1}`);
  });
  grid.classList.toggle("is-numbered", stage === 2);
  nextLevel.hidden = true;
  commentator.textContent = stage === 0
    ? "Oh good, you found the right door. Let's see if you can count."
    : stage === 1
      ? "The odds are done. Now we find out if you know a prime from a corporate lunch break."
      : "Numbers at last. This is usually where people start feeling clever.";
}

function completeStage() {
  const current = sequences[stage];
  if (current.complete) {
    locked = true;
    feedback.textContent = current.complete;
    commentator.textContent = current.pedro;
    window.setTimeout(() => setStage(stage + 1), 950);
    return;
  }
  feedback.textContent = "SEQUENCE ACCEPTED // ACCESS GRANTED";
  commentator.textContent = current.pedro;
  locked = true;
  nextLevel.hidden = false;
  grid.append(nextLevel);
}

function pressButton(button) {
  if (locked) return;
  const sequence = sequences[stage].order;
  const expected = sequence[progress];
  const pressed = Number(button.dataset.index);
  if (pressed !== expected) {
    locked = true;
    button.classList.add("is-wrong");
    feedback.textContent = "ACCESS DENIED // SEQUENCE RESET";
    commentator.textContent = "Nope. The buttons were doing so well until you got involved. Start this sequence again.";
    window.setTimeout(() => {
      buttons.forEach((key) => key.classList.remove("is-lit", "is-wrong"));
      progress = 0;
      feedback.textContent = "";
      locked = false;
    }, 550);
    return;
  }
  button.classList.remove("is-wrong");
  button.classList.add("is-lit");
  progress += 1;
  feedback.textContent = `ACCESS ${String(progress).padStart(2, "0")} / ${String(sequence.length).padStart(2, "0")}`;
  if (progress === sequence.length) completeStage();
}

for (let index = 0; index < 12; index += 1) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "keypad-button";
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `Unlabeled button, position ${index + 1}`);
  button.addEventListener("click", () => pressButton(button));
  buttons.push(button);
  grid.append(button);
}

setStage(0);
document.querySelector("#year").textContent = new Date().getFullYear();
