
"use strict";

(() => {
  const STORAGE_KEY = "beautyLanaVaultV1";
  const LOCK_KEY = "beautyLanaVaultLockV1";

  const $ = (selector, root = document) => root.querySelector(selector);

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const makeId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const readList = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const writeList = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Your browser could not save this entry. Check its storage settings.");
      return false;
    }
  };

  const state = {
    treasures: readList(`${STORAGE_KEY}:treasures`),
    memories: readList(`${STORAGE_KEY}:memories`),
    journal: readList(`${STORAGE_KEY}:journal`),
    filter: "all",
    search: ""
  };

  const form = $("#treasureForm");
  const grid = $("#vaultTreasureGrid");
  const emptyState = $("#vaultEmptyState");
  const toast = $("#vaultToast");
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function saveCollection(name) {
    return writeList(`${STORAGE_KEY}:${name}`, state[name]);
  }

  function formatDate(value) {
    if (!value) return "A timeless moment";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? "A timeless moment"
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
  }

  function updateStats() {
    $("#vaultTreasureCount").textContent = state.treasures.length;
    $("#vaultFavoriteCount").textContent =
      state.treasures.filter((item) => item.favorite).length;
    $("#vaultMemoryCount").textContent = state.memories.length;
    $("#vaultWishCount").textContent =
      state.treasures.filter((item) => item.category === "wish").length;
  }

  function categoryLabel(category) {
    return ({
      memory: "Memory",
      message: "Message",
      wish: "Wish"
    })[category] || "Treasure";
  }

  function renderTreasures() {
    const query = state.search.trim().toLowerCase();

    const filtered = state.treasures.filter((item) => {
      const matchesSearch = [item.title, item.content, item.category]
        .some((part) => String(part || "").toLowerCase().includes(query));

      const matchesCategory =
        state.filter === "all" ||
        (state.filter === "favorite" && item.favorite) ||
        item.category === state.filter;

      return matchesSearch && matchesCategory;
    });

    grid.innerHTML = filtered.map((item) => `
      <article class="vault-treasure-card ${item.favorite ? "is-favorite" : ""}"
        data-treasure-id="${escapeHTML(item.id)}">
        <div class="treasure-card-top">
          <span class="treasure-symbol">${escapeHTML(item.symbol || "♢")}</span>
          <span class="treasure-category">${escapeHTML(categoryLabel(item.category))}</span>
          <button class="treasure-favorite" data-action="favorite"
            aria-label="${item.favorite ? "Remove from favorites" : "Add to favorites"}"
            aria-pressed="${Boolean(item.favorite)}">
            ${item.favorite ? "♥" : "♡"}
          </button>
        </div>
        <h3>${escapeHTML(item.title)}</h3>
        <p class="treasure-content">${escapeHTML(item.content)}</p>
        <div class="treasure-card-bottom">
          <small>${escapeHTML(formatDate(item.date || item.createdAt?.slice(0, 10)))}</small>
          <button class="treasure-delete" data-action="delete">Remove</button>
        </div>
      </article>
    `).join("");

    const hasItems = filtered.length > 0;
    emptyState.hidden = hasItems;
    grid.hidden = !hasItems;

    if (!hasItems) {
      const isSearching = Boolean(query) || state.filter !== "all";
      const heading = $("h3", emptyState);
      const paragraph = $("p", emptyState);

      heading.textContent = isSearching
        ? "No treasures found."
        : "This chamber is waiting for a treasure.";

      paragraph.textContent = isSearching
        ? "Try another search or category, or add something new."
        : "Add your first memory, message, or wish to begin your collection.";
    }

    updateStats();
  }

  function addTreasure({ title, content, category, symbol, date }) {
    state.treasures.unshift({
      id: makeId(),
      title: title.trim(),
      content: content.trim(),
      category,
      symbol: symbol || "♢",
      date: date || "",
      createdAt: new Date().toISOString(),
      favorite: false
    });

    if (!saveCollection("treasures")) {
      state.treasures.shift();
      return false;
    }

    renderTreasures();
    return true;
  }

  $("#showTreasureForm").addEventListener("click", () => {
    form.hidden = false;
    $("#treasureTitle").focus();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $("#emptyAddTreasure").addEventListener("click", () => {
    form.hidden = false;
    $("#treasureTitle").focus();
  });

  $("#closeTreasureForm").addEventListener("click", () => {
    form.hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const success = addTreasure({
      title: $("#treasureTitle").value,
      content: $("#treasureContent").value,
      category: $("#treasureCategory").value,
      symbol: $("#treasureSymbol").value
    });

    if (!success) return;

    form.reset();
    form.hidden = true;
    $("#treasureFormStatus").textContent = "Your treasure has been saved. ♢";
    showToast("A new treasure has been placed in the vault!");
  });

  $("#vaultSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTreasures();
  });

  $("#vaultCategoryFilter").addEventListener("change", (event) => {
    state.filter = event.target.value;
    renderTreasures();
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const card = button.closest("[data-treasure-id]");
    if (!card) return;

    const item = state.treasures.find((entry) => entry.id === card.dataset.treasureId);
    if (!item) return;

    if (button.dataset.action === "favorite") {
      item.favorite = !item.favorite;
      if (saveCollection("treasures")) {
        renderTreasures();
        showToast(item.favorite ? "Added to your favorites. ♡" : "Favorite removed.");
      }
    }

    if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Remove "${item.title}" from your vault?`);
      if (!confirmed) return;

      const previous = state.treasures;
      state.treasures = previous.filter((entry) => entry.id !== item.id);

      if (!saveCollection("treasures")) {
        state.treasures = previous;
        return;
      }

      renderTreasures();
      showToast("Treasure removed.");
    }
  });

  // MEMORY CHAMBER
  $("#memoryForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const memory = {
      id: makeId(),
      title: $("#memoryTitle").value.trim(),
      content: $("#memoryText").value.trim(),
      date: $("#memoryDate").value,
      createdAt: new Date().toISOString()
    };

    if (!memory.title || !memory.content) return;

    state.memories.unshift(memory);

    if (!saveCollection("memories")) {
      state.memories.shift();
      return;
    }

    const saved = addTreasure({
      title: memory.title,
      content: memory.content,
      category: "memory",
      symbol: "♡",
      date: memory.date
    });

    if (!saved) {
      state.memories.shift();
      saveCollection("memories");
      return;
    }

    $("#memoryForm").reset();
    $("#memoryStatus").textContent = "Your memory has been preserved. ♡";
    showToast("Memory saved in your collection!");
    updateStats();
  });

  // JOURNAL
  function renderJournal() {
    const container = $("#vaultJournalList");

    if (!state.journal.length) {
      container.innerHTML = `
        <article class="vault-journal-empty">
          <span>✧</span>
          <h3>Your journal starts here.</h3>
          <p>Your saved thoughts will appear in this space.</p>
        </article>`;
      return;
    }

    container.innerHTML = state.journal.map((entry) => `
      <article class="vault-journal-entry" data-journal-id="${escapeHTML(entry.id)}">
        <div class="journal-entry-symbol">✧</div>
        <div class="journal-entry-body">
          <small>${escapeHTML(formatDate(entry.createdAt?.slice(0, 10)))}</small>
          <h3>${escapeHTML(entry.title)}</h3>
          <p>${escapeHTML(entry.content)}</p>
        </div>
        <button class="journal-delete" data-delete-journal
          aria-label="Delete journal entry">×</button>
      </article>
    `).join("");
  }

  $("#journalForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const entry = {
      id: makeId(),
      title: $("#journalTitle").value.trim(),
      content: $("#journalEntry").value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.title || !entry.content) return;

    state.journal.unshift(entry);
    if (!saveCollection("journal")) {
      state.journal.shift();
      return;
    }

    $("#journalForm").reset();
    $("#journalStatus").textContent = "Your journal entry has been saved. ✧";
    renderJournal();
    showToast("A new thought has been saved.");
  });

  $("#vaultJournalList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-journal]");
    if (!button) return;

    const card = button.closest("[data-journal-id]");
    if (!card) return;

    const previous = state.journal;
    state.journal = previous.filter((entry) => entry.id !== card.dataset.journalId);

    if (!saveCollection("journal")) {
      state.journal = previous;
      return;
    }

    renderJournal();
    showToast("Journal entry removed.");
  });

  // SIMPLE COMBINATION PUZZLE
  // This is intentionally a playful local feature, not secure access control.
  function readLock() {
    try {
      return JSON.parse(localStorage.getItem(LOCK_KEY) || "null");
    } catch {
      return null;
    }
  }

  function setLock(value) {
    try {
      localStorage.setItem(LOCK_KEY, JSON.stringify(value));
      return true;
    } catch {
      $("#lockStatus").textContent = "Your browser could not save the combination.";
      return false;
    }
  }

  function updateLockUI() {
    const lock = readLock();
    $("#lockSetupForm").hidden = Boolean(lock);
    $("#lockOpenForm").hidden = !lock;
    $("#lockHeading").textContent = lock
      ? "The chamber is waiting for its keeper."
      : "Create your own combination.";
    $("#lockDescription").textContent = lock
      ? "Enter the combination you created to open the chamber."
      : "Choose a combination of at least four characters. This is a local puzzle, not a secure password system.";
  }

  $("#lockSetupForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const code = $("#lockSetupCode").value;
    const confirmation = $("#lockSetupConfirm").value;

    if (code.length < 4) {
      $("#lockStatus").textContent = "Choose at least four characters.";
      return;
    }

    if (code !== confirmation) {
      $("#lockStatus").textContent = "The combinations don't match. Try again.";
      return;
    }

    if (setLock({ code })) {
      $("#lockSetupForm").reset();
      $("#lockStatus").textContent = "Combination created. Your chamber is ready. ♢";
      updateLockUI();
      showToast("Your combination has been set.");
    }
  });

  $("#lockOpenForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const lock = readLock();
    const code = $("#lockEntryCode").value;

    if (lock && code === lock.code) {
      $("#secretRoom").hidden = false;
      $("#lockStatus").textContent = "Combination accepted. Welcome, Keeper!";
      $("#lockEntryCode").value = "";
      showToast("The secret chamber is open! ✧");
    } else {
      $("#lockStatus").textContent = "That combination didn't work. Try again.";
    }
  });

  $("#closeSecretRoom").addEventListener("click", () => {
    $("#secretRoom").hidden = true;
    $("#lockStatus").textContent = "The chamber has been closed.";
  });

  // MOBILE NAVIGATION
  const menuButton = $("#vaultMenuButton");
  const nav = $(".vault-nav");

  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  // INITIAL RENDER
  renderTreasures();
  renderJournal();
  updateStats();
  updateLockUI();
})();
