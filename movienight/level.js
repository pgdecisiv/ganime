const scenes = [
  {
    face: "/assets/faces/t800.png",
    alt: "Pixel-art portrait of a cyborg",
    line: "- Do you really have to go out for snacks?",
    answer: "I'll be back",
    reaction: "-awwww, thanks buddy!",
  },
  {
    face: "/assets/faces/taxi.png",
    alt: "Pixel-art portrait of a New York taxi driver",
    line: "Hey Iris!",
    answer: "Are you talking to me?",
    reaction: "Oh, sorry... I thought you were someone else",
  },
  {
    face: "/assets/faces/neo1.png",
    alt: "Pixel-art portrait of a man wearing dark glasses",
    line: "you going for the snacks? I fancy a bowl o' soup",
    answer: "There is no spoon",
    reaction: "sad Keanu is sad",
  },
  {
    face: "/assets/faces/tyler-1.png",
    alt: "Pixel-art portrait split between two faces",
    line: "Hey champ, did you bring your friend with you? Bobby Loaf Meat or whatever his name is?",
    answer: "his name is robert paulson",
    reaction: "Yeah, that guy!",
  },
  {
    face: "/assets/faces/godfather1.png",
    alt: "Pixel-art portrait of a suited man",
    line: "When buying snacks, just make them an offer they can't refuse.",
    final: true,
  },
];

const stageCount = document.querySelector("#movie-stage-count");
const face = document.querySelector("#movie-face");
const dialog = document.querySelector("#movie-dialog");
const form = document.querySelector("#movie-answer-form");
const answerInput = document.querySelector("#movie-answer");
const feedback = document.querySelector("#movie-feedback");
const nextButton = document.querySelector("#movie-next");
const pedroLine = document.querySelector("#movie-pedro-line");

let currentScene = 0;
let transitioning = false;
let completed = false;

function showScene() {
  const scene = scenes[currentScene];
  stageCount.textContent = `SCENE ${String(currentScene + 1).padStart(2, "0")} / 05`;
  face.src = scene.face;
  face.alt = scene.alt;
  dialog.textContent = scene.line;
  dialog.classList.remove("is-reacting", "is-triumphant");
  answerInput.value = "";
  answerInput.disabled = false;
  form.querySelector("button").disabled = false;
  form.hidden = false;
  feedback.textContent = "";
  pedroLine.textContent = scene.final
    ? "A tempting proposal. You may want to inspect your inventory before accepting the terms."
    : "Choose your words carefully. Or don't. I have already made my peace with the evening.";
}

function normalize(text) {
  return text
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[’‘`]/g, "'")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bshan't\b/g, "shall not")
    .replace(/\bain't\b/g, "is not")
    .replace(/\b([a-z]+)n't\b/g, "$1 not")
    .replace(/\b(i)'m\b/g, "$1 am")
    .replace(/\b(you|we|they)'re\b/g, "$1 are")
    .replace(/\b(he|she|it|there|here|that|what|who|where|when|why|how)'s\b/g, "$1 is")
    .replace(/\b(i|you|we|they|he|she|it)'ll\b/g, "$1 will")
    .replace(/\b(i|you|we|they|he|she|it)'ve\b/g, "$1 have")
    .replace(/\b(i|you|we|they|he|she|it)'d\b/g, "$1 would")
    .replace(/'/g, "")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (transitioning || completed) return;

  const scene = scenes[currentScene];
  const response = answerInput.value.trim();
  if (scene.final) {
    if (!response) {
      feedback.textContent = "A RESPONSE IS REQUIRED";
      return;
    }
    dialog.textContent = "Meh... I would refuse that one";
    dialog.classList.remove("is-reacting");
    void dialog.offsetWidth;
    dialog.classList.add("is-reacting");
    feedback.textContent = "OFFER REVIEWED // TERMS DECLINED";
    pedroLine.textContent = "Well, that went about as well as every other negotiation in this room.";
    return;
  }

  if (normalize(response) !== normalize(scene.answer)) {
    feedback.textContent = "RESPONSE NOT RECOGNIZED // TRY AGAIN";
    pedroLine.textContent = "Nope. The correct response is apparently famous. This is awkward for both of us.";
    answerInput.select();
    return;
  }

  transitioning = true;
  answerInput.disabled = true;
  form.querySelector("button").disabled = true;
  feedback.textContent = "RESPONSE ACCEPTED";
  dialog.textContent = scene.reaction;
  dialog.classList.remove("is-reacting");
  void dialog.offsetWidth;
  dialog.classList.add("is-reacting");
  pedroLine.textContent = "Look at that. Cultural literacy. HR will be thrilled.";
  window.setTimeout(() => {
    currentScene += 1;
    transitioning = false;
    showScene();
  }, 3000);
});

document.addEventListener("tower:inventory-drop", (event) => {
  if (event.detail.itemId !== "pixel-knight") return;
  if (currentScene !== scenes.length - 1) {
    feedback.textContent = "ITEM NOT REQUIRED IN THIS SCENE";
    pedroLine.textContent = "The knight is not in this conversation. Do try to keep up.";
    return;
  }
  if (completed) return;
  completed = true;
  window.GanimesInventory.remove("pixel-knight");
  dialog.textContent = "HAHAHAHA, Not even Michael could have pulled that off. I'm proud of you, Bambino!!";
  dialog.classList.remove("is-reacting");
  dialog.classList.add("is-triumphant");
  feedback.textContent = "UNEXPECTED TERMS ACCEPTED";
  nextButton.hidden = false;
  answerInput.disabled = true;
  form.querySelector("button").disabled = true;
  pedroLine.textContent = "A chess knight in a negotiation. Somehow, that was the right move. Let's never discuss it again.";
});

showScene();
