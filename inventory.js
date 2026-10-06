(() => {
  const maxSlots = 4;
  const storageKey = "ganimes-tower-inventory-v1";
  const itemMeta = {
    "pixel-knight": { label: "CHESS KNIGHT", name: "chess knight", image: "/assets/knight-transparent.png" },
    stone: { label: "STONE", name: "stone", image: "/assets/stone-transparent.png" },
    stick: { label: "STICK", name: "stick", image: "/assets/stick.png" },
  };

  const itemArrivalLevel = { "pixel-knight": 8, stone: 10, stick: 11 };
  const pageLevel = {
    "/key": 2,
    "/fibo": 3,
    "/durin": 4,
    "/hammer": 5,
    "/dragthemousethroughthelabyrinth": 6,
    "/mechanics-101": 7,
    "/chess": 8,
    "/seriously-what-is-that": 9,
    "/smile": 10,
    "/abcdefghijklmnopqrstuvwxyz": 11,
    "/movienight": 12,
    "/zodiac": 13,
    "/zodiac1": 13,
    "/zodiac2": 13,
    "/zodiac3": 13,
    "/haiku": 14,
  };

  function currentLevel() {
    return pageLevel[window.location.pathname.replace(/\/$/, "").toLowerCase()] || 0;
  }

  const level = currentLevel();
  let savedState = { items: [], used: [] };
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
    if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.used)) savedState = parsed;
  } catch { /* storage may be unavailable; inventory stays in memory */ }
  const ownedItems = [...new Set(savedState.items)].filter((item) => itemMeta[item]);
  const usedItems = new Set(savedState.used.filter((item) => itemMeta[item]));

  // Later assignments assume earlier rewards have been collected, even when a
  // recruit opens a level URL directly instead of following every link.
  for (const [item, arrivalLevel] of Object.entries(itemArrivalLevel)) {
    if (arrivalLevel < level && !usedItems.has(item) && !ownedItems.includes(item)) ownedItems.push(item);
  }
  let items = visibleItems();

  function visibleItems() {
    return ownedItems.filter((item) => itemArrivalLevel[item] <= level && !usedItems.has(item)).slice(0, maxSlots);
  }

  function persist() {
    try { window.sessionStorage.setItem(storageKey, JSON.stringify({ items: ownedItems, used: [...usedItems] })); }
    catch { /* storage may be unavailable; inventory stays in memory */ }
  }
  persist();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
  });

  const inventory = document.createElement("aside");
  inventory.className = "tower-inventory";
  inventory.setAttribute("aria-label", "Personnel inventory");
  inventory.classList.add("is-collapsed");
  inventory.innerHTML = '<button class="inventory-toggle" type="button" aria-expanded="false" aria-controls="inventory-slots"><span>INVENTORY</span><span class="inventory-count"></span><span class="inventory-fold" aria-hidden="true">+</span></button><div class="inventory-slots" id="inventory-slots" hidden></div>';
  document.body.append(inventory);

  const pedroComment = document.createElement("aside");
  pedroComment.className = "inventory-drop-comment";
  pedroComment.setAttribute("role", "status");
  pedroComment.setAttribute("aria-live", "polite");
  pedroComment.hidden = true;
  pedroComment.innerHTML = '<div class="commentator-avatar" aria-hidden="true">P<span>•</span><i class="tv-mouth"></i></div><div><strong>PEDRO <small>// TOWER COMMENTARY</small></strong><p></p></div>';
  document.body.append(pedroComment);

  const slots = inventory.querySelector(".inventory-slots");
  const count = inventory.querySelector(".inventory-count");
  const toggle = inventory.querySelector(".inventory-toggle");
  const pedroText = pedroComment.querySelector("p");
  let activeDragItem = null;

  function render() {
    count.textContent = `${items.length}/${maxSlots}`;
    slots.replaceChildren();
    for (let index = 0; index < maxSlots; index += 1) {
      const item = items[index];
      const meta = itemMeta[item];
      const slot = document.createElement("div");
      slot.className = `inventory-slot${item ? " has-item" : ""}`;
      slot.setAttribute("aria-label", meta ? `Slot ${index + 1}: ${meta.name}` : `Empty slot ${index + 1}`);
      if (meta) {
        slot.draggable = true;
        slot.dataset.itemId = item;
        slot.setAttribute("role", "button");
        slot.tabIndex = 0;
        slot.innerHTML = `<img class="inventory-item-icon" src="${meta.image}" alt="" /><span>${meta.label}</span>`;
      }
      else slot.innerHTML = `<span class="slot-number">SLOT 0${index + 1}</span>`;
      slots.append(slot);
    }
  }

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(expanded));
    slots.hidden = !expanded;
    inventory.classList.toggle("is-collapsed", !expanded);
    inventory.querySelector(".inventory-fold").textContent = expanded ? "−" : "+";
  });

  slots.addEventListener("dragstart", (event) => {
    const slot = event.target.closest(".inventory-slot.has-item[draggable='true']");
    if (!slot) return;
    activeDragItem = slot.dataset.itemId;
    slot.classList.add("is-dragging");
    inventory.classList.add("has-active-drag");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", activeDragItem);
  });

  slots.addEventListener("dragend", (event) => {
    event.target.closest(".inventory-slot")?.classList.remove("is-dragging");
    inventory.classList.remove("has-active-drag");
    activeDragItem = null;
  });

  document.addEventListener("dragover", (event) => {
    if (activeDragItem) event.preventDefault();
  });

  document.addEventListener("drop", (event) => {
    if (!activeDragItem) return;
    event.preventDefault();
    const target = event.target.closest("[data-accept-item]");
    if (target && target.dataset.acceptItem === activeDragItem) {
      target.dispatchEvent(new CustomEvent("tower:inventory-drop", { bubbles: true, detail: { itemId: activeDragItem } }));
      return;
    }
    if (event.target.closest(".tower-inventory")) return;
    const itemName = itemMeta[activeDragItem]?.name || "that item";
    pedroText.textContent = `Oh, employee. You brought the ${itemName} to the wrong level. I expected nothing, and I’m still disappointed.`;
    pedroComment.hidden = false;
    pedroComment.classList.remove("is-visible");
    requestAnimationFrame(() => pedroComment.classList.add("is-visible"));
  });

  render();
  window.GanimesInventory = {
    has(itemId) { return items.includes(itemId); },
    add(itemId) {
      if (!itemMeta[itemId] || usedItems.has(itemId)) return false;
      if (!ownedItems.includes(itemId)) {
        if (visibleItems().length >= maxSlots) return false;
        ownedItems.push(itemId);
      }
      items = visibleItems();
      persist();
      render();
      return true;
    },
    remove(itemId) {
      const index = ownedItems.indexOf(itemId);
      if (index === -1 || !items.includes(itemId)) return false;
      ownedItems.splice(index, 1);
      usedItems.add(itemId);
      items = visibleItems();
      persist();
      render();
      return true;
    },
    getItems() { return [...items]; },
  };
})();
