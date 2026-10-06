(() => {
  const duration = 3000;
  const initialized = new WeakSet();
  const timers = new WeakMap();
  const disappointed = /\b(?:nope|wrong|reject|rejected|denied|disappoint(?:ed|ing)?|failed|failure|mistake|incorrect|try again|did not|won't)\b/i;
  const dialogueSelector = ".commentator, [class*='-pedro'], .rabbit-commentator, .pedro-intro-dialogue, .inventory-drop-comment";

  function dialogueFor(avatar) {
    return avatar.closest(dialogueSelector) || avatar.parentElement;
  }

  function showForThreeSeconds(avatar, text, openingLine = false) {
    window.clearTimeout(timers.get(avatar));
    avatar.dataset.pedroState = !openingLine && disappointed.test(text) ? "disappointed" : "talking";
    timers.set(avatar, window.setTimeout(() => {
      avatar.dataset.pedroState = "default";
    }, duration));
  }

  function addAvatar(avatar) {
    if (initialized.has(avatar)) return;
    initialized.add(avatar);
    const dialogue = dialogueFor(avatar);
    showForThreeSeconds(avatar, dialogue?.textContent || "", true);
  }

  function scan(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches(".commentator-avatar")) addAvatar(node);
    node.querySelectorAll(".commentator-avatar").forEach(addAvatar);
  }

  document.querySelectorAll(".commentator-avatar").forEach(addAvatar);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") mutation.addedNodes.forEach(scan);
      if (mutation.type === "attributes") continue;
      const element = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
      const dialogue = element?.closest(dialogueSelector);
      if (!dialogue) continue;
      const text = dialogue.textContent || "";
      dialogue.querySelectorAll(".commentator-avatar").forEach((avatar) => showForThreeSeconds(avatar, text));
    }
  });

  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
})();
