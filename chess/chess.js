const pickup = document.querySelector("#knight-pickup");
const pickupPrompt = document.querySelector("#pickup-prompt");
const unlock = document.querySelector("#chess-unlock");
const knightItem = "pixel-knight";

function showCollectedState() {
  pickup.classList.add("is-collected");
  pickup.disabled = true;
  pickup.setAttribute("aria-label", "Pixel-art chess knight added to inventory");
  pickupPrompt.textContent = "ADDED TO INVENTORY";
  unlock.hidden = false;
}

pickup.addEventListener("click", () => {
  if (window.GanimesInventory.add(knightItem)) showCollectedState();
});
