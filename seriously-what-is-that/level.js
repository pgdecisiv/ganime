const answerForm = document.querySelector("#stone-form");
const answerInput = document.querySelector("#stone-answer");
const feedback = document.querySelector("#stone-feedback");
const nextButton = document.querySelector("#stone-next");
const correctAnswer = "stonehenge";

function updateAnswer() {
  const isCorrect = answerInput.value.trim().toLowerCase() === correctAnswer;
  nextButton.hidden = !isCorrect;
  feedback.classList.toggle("is-correct", isCorrect);
  feedback.textContent = isCorrect ? "ENTRY ACCEPTED // CONTINUE WHEN READY" : "";
}

answerInput.addEventListener("input", updateAnswer);
answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateAnswer();
});
