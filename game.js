const riddles = [
  {
    category: "TOWER ORIENTATION // FIRST ASSIGNMENT",
    prompt: `<figure class="key-riddle-figure"><img src="/assets/key.png" alt="An ornate vintage brass key" /><figcaption>the answer is key</figcaption></figure>`,
    byline: "",
    image: true,
    note: "ADD THE ANSWER TO THE ADDRESS BAR",
    answers: ["key"],
    nearAnswers: ["lock", "door", "keyhole"],
    hint: "It is small, metallic, and rarely invited to a staff meeting."
  },
  {
    category: "THE NATURAL WORLD",
    prompt: "The more of me there is, the less you see.<br>What am I?",
    byline: "Look for what hides the view",
    answers: ["darkness", "dark", "the dark"],
    nearAnswers: ["night", "shadow", "black", "dim", "dusk"],
    hint: "It arrives when the light leaves. Dramatic, really."
  },
  {
    category: "A MATTER OF TIME",
    prompt: "I have cities, but no houses; forests, but no trees;<br>and water, but no fish. What am I?",
    byline: "A familiar place, seen another way",
    answers: ["map", "a map", "atlas", "a map of the world"],
    nearAnswers: ["globe", "chart", "compass", "route", "geography", "country"],
    hint: "You might unfold one before a journey. Pedro uses GPS, naturally."
  }
];

const elements = {
  main: document.querySelector("main"),
  level: document.querySelector("#level-indicator"),
  welcomeScreen: document.querySelector("#welcome-screen"),
  disclaimer: document.querySelector("#disclaimer-screen"),
  welcomeHero: document.querySelector("#welcome-hero"),
  welcomeProtocol: document.querySelector("#welcome-protocol"),
  slideKicker: document.querySelector("#slide-kicker"),
  slideCount: document.querySelector("#slide-count"),
  slideContent: document.querySelector("#slide-content"),
  slideProgress: document.querySelector("#slide-progress"),
  slidePrevious: document.querySelector("#slide-prev"),
  slideNext: document.querySelector("#slide-next"),
  game: document.querySelector("#game"),
  form: document.querySelector("#answer-form"),
  input: document.querySelector("#answer-input"),
  feedback: document.querySelector("#feedback"),
  hint: document.querySelector("#hint-button"),
  prompt: document.querySelector("#riddle-text"),
  category: document.querySelector("#riddle-category"),
  number: document.querySelector("#riddle-number"),
  quote: document.querySelector(".quote-mark"),
  byline: document.querySelector("#riddle-byline"),
  hintRow: document.querySelector("#hint-button"),
  progress: document.querySelector("#progress-label"),
  fill: document.querySelector("#progress-fill"),
  attempt: document.querySelector("#attempt-note"),
  commentary: document.querySelector("#commentator-line")
};

const onboardingSlides = [
  {
    kind: "disclaimer",
    kicker: "PERSONNEL NOTICE // 01",
    title: "Disclaimer",
    body: ""
  },
  {
    kind: "welcome",
    kicker: "GANIME’S TOWER CORPORATION // 02",
    title: "",
    body: ""
  },
  {
    kind: "protocol",
    kicker: "PERSONNEL ORIENTATION // 03",
    title: "Welcome aboard, recruit.",
    body: `<p>Welcome to Ganime’s Tower Corporation. Your appointment is effective immediately. Please proceed through this orientation before beginning your duties.</p><p class="slide-aside">We appreciate your cooperation. We have already recorded it.</p>`
  },
  {
    kind: "protocol",
    kicker: "ASSIGNED ORIENTATION GUIDE // 04",
    title: "Meet Pedro.",
    body: `<div class="pedro-intro-dialogue"><div class="commentator-avatar" aria-hidden="true">P<span>•</span><i class="tv-mouth"></i></div><div><p>Pedro is your commentator and guide through the Tower. He’ll offer hints, let you know when you’re getting warmer, and explain your duties.</p><p>He knows every answer. He will not simply give you one. Management calls this “professional development.”</p><p class="pedro-quote">“Try not to disappoint me. I have a very low bar and a long afternoon.”</p></div></div>`
  }
];

let current = 0;
let solved = false;
let hintShown = false;
let attempts = 0;
let slideIndex = 0;

function renderSlide() {
  const slide = onboardingSlides[slideIndex];
  const slideNumber = String(slideIndex + 1).padStart(2, "0");
  elements.disclaimer.hidden = slide.kind !== "disclaimer";
  elements.welcomeHero.hidden = slide.kind !== "welcome";
  elements.welcomeProtocol.hidden = slide.kind !== "protocol";
  elements.welcomeScreen.dataset.slide = String(slideIndex);
  elements.slideKicker.textContent = slide.kicker;
  elements.slideCount.textContent = `${slideNumber} / ${String(onboardingSlides.length).padStart(2, "0")}`;
  if (slide.kind === "protocol") elements.slideContent.innerHTML = `<h2 id="protocol-title">${slide.title}</h2>${slide.body}`;
  elements.slideProgress.style.width = `${((slideIndex + 1) / onboardingSlides.length) * 100}%`;
  elements.level.innerHTML = `LEVEL 00 <span>// ONBOARDING ${slideNumber}/${String(onboardingSlides.length).padStart(2, "0")}</span>`;
  elements.slidePrevious.disabled = slideIndex === 0;
  elements.slideNext.textContent = slideIndex === onboardingSlides.length - 1 ? "Accept assignment →" : "Continue →";
}

function renderRiddle() {
  const riddle = riddles[current];
  elements.category.textContent = riddle.category;
  elements.prompt.innerHTML = riddle.prompt;
  elements.prompt.classList.toggle("image-riddle", Boolean(riddle.image));
  elements.quote.hidden = Boolean(riddle.image);
  elements.byline.hidden = Boolean(riddle.image);
  elements.form.hidden = Boolean(riddle.image);
  elements.hintRow.hidden = Boolean(riddle.image);
  elements.number.textContent = `№ ${String(current + 1).padStart(2, "0")}`;
  elements.progress.textContent = `RIDDLE ${String(current + 1).padStart(2, "0")} / ${String(riddles.length).padStart(2, "0")}`;
  elements.level.innerHTML = `LEVEL ${String(current + 1).padStart(2, "0")} <span>// ACTIVE</span>`;
  elements.fill.style.width = `${(current / riddles.length) * 100}%`;
  elements.feedback.textContent = "";
  elements.feedback.classList.remove("error");
  elements.input.value = "";
  elements.input.disabled = false;
  elements.attempt.textContent = riddle.note || "EVERY GUESS IS A CLUE";
  elements.commentary.textContent = [
    "Let’s start with the basics. The answer is right in front of you. You may find it useful to add that to the address.",
    "A new level. Same tower. Try to keep up.",
    "Nearly at the end of this corridor. Don't start celebrating; it upsets the wallpaper."
  ][current];
  solved = false;
  hintShown = false;
  attempts = 0;
  elements.input.focus({ preventScroll: true });
}

function normalizeAnswer(value) {
  return value.trim().toLocaleLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}

function isNearAnswer(guess, riddle) {
  if (riddle.nearAnswers.includes(guess)) return true;
  return riddle.answers.some((answer) => {
    const candidate = normalizeAnswer(answer).replace(/^a /, "").replace(/^the /, "");
    return candidate.length > 3 && Math.abs(candidate.length - guess.length) <= 1 && editDistance(guess, candidate) <= 1;
  });
}

elements.slidePrevious.addEventListener("click", () => {
  if (slideIndex === 0) return;
  slideIndex -= 1;
  renderSlide();
});

elements.slideNext.addEventListener("click", () => {
  if (slideIndex < onboardingSlides.length - 1) {
    slideIndex += 1;
    renderSlide();
    return;
  }
  elements.main.classList.add("is-playing");
  renderRiddle();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (solved) return;
  const guess = normalizeAnswer(elements.input.value);
  if (!guess) {
    elements.feedback.textContent = "The box is empty. Astounding deduction, I know.";
    elements.feedback.classList.add("error");
    elements.commentary.textContent = "Planning to submit absolutely nothing? Bold strategy. Try typing something first.";
    elements.input.focus();
    return;
  }
  attempts += 1;
  const accepted = riddles[current].answers.some((answer) => answer === guess);
  if (!accepted) {
    const close = isNearAnswer(guess, riddles[current]);
    elements.feedback.textContent = close ? "Close. You’re in the right neighborhood." : "The tower rejects your offering.";
    elements.feedback.classList.add("error");
    elements.commentary.textContent = close
      ? "Ooh, close. You're circling it. One small turn and you might actually arrive."
      : [
          "No. But I admire the commitment to being wrong with confidence.",
          "Not even the same corridor. Do try to keep your thoughts indoors.",
          "That's a destination, all right. Just not one with a door in this tower."
        ][current];
    elements.attempt.textContent = `${attempts} ${attempts === 1 ? "GUESS" : "GUESSES"} SO FAR`;
    elements.input.select();
    return;
  }
  solved = true;
  elements.feedback.classList.remove("error");
  elements.feedback.textContent = "Well read. Try not to look smug; it's unbecoming.";
  elements.commentary.textContent = current === riddles.length - 1
    ? "There we are. You've survived three riddles and my company. A rare double achievement."
    : "Correct. Don't get used to the praise; it was an administrative error.";
  elements.input.disabled = true;
  elements.fill.style.width = `${((current + 1) / riddles.length) * 100}%`;
  elements.attempt.textContent = "RIDDLE UNLOCKED";
  if (current < riddles.length - 1) {
    const next = document.createElement("button");
    next.type = "button";
    next.className = "text-button next-button";
    next.textContent = "Continue to the next riddle →";
    next.addEventListener("click", () => {
      current += 1;
      renderRiddle();
    }, { once: true });
    elements.feedback.append(document.createElement("br"), next);
  } else {
    elements.feedback.append(document.createElement("br"));
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "text-button next-button";
    restart.textContent = "Begin again ↺";
    restart.addEventListener("click", () => {
      current = 0;
      renderRiddle();
    }, { once: true });
    elements.feedback.append(restart);
  }
});

// The first assignment is solved by using its answer as the next subpage.
// Keep its picture-only presentation separate from the typed-answer riddles.
elements.form.hidden = true;

elements.hint.addEventListener("click", () => {
  if (solved) return;
  const message = riddles[current].hint;
  elements.feedback.classList.remove("error");
  elements.feedback.textContent = hintShown ? "Pedro has already used his one (1) hint." : "Pedro has a hint for you.";
  elements.commentary.textContent = hintShown
    ? "I gave you a hint. Repeating it won't make it more obvious. Probably."
    : `Fine, a hint: ${message}`;
  hintShown = true;
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderSlide();
