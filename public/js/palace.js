
"use strict";

(() => {
  const STORAGE_PREFIX = "beautyLanaPalaceV1";
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

  function load(key, fallback = []) {
    try {
      const result = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:${key}`));
      return result ?? fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
      return true;
    } catch {
      showToast("Your browser couldn't save this. Check its storage settings.");
      return false;
    }
  }

  let toastTimeout;

  function showToast(message) {
    const toast = $("#palaceToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
  }

  // -------------------------------------------------------
  // MOBILE NAVIGATION
  // -------------------------------------------------------

  const menuButton = $("#palaceMenuButton");
  const nav = $("#palaceNav");

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  // -------------------------------------------------------
  // WELCOME MESSAGE
  // -------------------------------------------------------

  const welcomeMessages = [
    "Welcome, Lana. May your day be filled with courage and wonder.",
    "A new day is another page in your story. Make it yours. ♡",
    "May you find something to learn, something to love, and a reason to smile.",
    "Your dreams deserve patience, your heart deserves kindness, and your ideas deserve a chance.",
    "You don't need to have everything figured out to take your next step. ✧"
  ];

  const dayNumber = Math.floor(Date.now() / 86400000);
  $("#palaceWelcomeMessage").textContent =
    welcomeMessages[Math.abs(dayNumber) % welcomeMessages.length];

  // -------------------------------------------------------
  // THRONE ROOM THEMES
  // -------------------------------------------------------

  const throneStage = $("#throneStage");

  const throneMottos = [
    "Grace in your heart. Courage in your steps. Magic in your dreams.",
    "Let curiosity lead you and kindness walk beside you.",
    "A small step taken today can become a beautiful journey tomorrow.",
    "Be proud of the progress nobody else gets to see.",
    "Make room for wonder, laughter, learning, and rest.",
    "You can be gentle and brave at the same time.",
    "Your future is built from the little choices you make with care.",
    "You are allowed to begin again as many times as you need."
  ];

  let lastMottoIndex = -1;

  function chooseDifferentIndex(length, previous) {
    if (length < 2) return 0;

    let index = Math.floor(Math.random() * length);
    while (index === previous) {
      index = Math.floor(Math.random() * length);
    }
    return index;
  }

  $("[data-throne-theme]").addEventListener("click", () => {});
  document.querySelectorAll("[data-throne-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.throneTheme;

      throneStage.dataset.theme = theme;
      document.querySelectorAll("[data-throne-theme]").forEach((choice) => {
        choice.setAttribute("aria-pressed", String(choice === button));
      });

      try {
        localStorage.setItem(`${STORAGE_PREFIX}:throneTheme`, theme);
      } catch {
        // The theme still works for this page view if storage is unavailable.
      }

      showToast(`Throne room changed to ${button.textContent.trim()}.`);
    });
  });

  try {
    const savedTheme = localStorage.getItem(`${STORAGE_PREFIX}:throneTheme`);
    const validThemes = ["rose", "moon", "gold", "forest"];

    if (validThemes.includes(savedTheme)) {
      throneStage.dataset.theme = savedTheme;
      document.querySelectorAll("[data-throne-theme]").forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.throneTheme === savedTheme)
        );
      });
    }
  } catch {
    // Ignore unavailable local storage.
  }

  $("#newMottoButton").addEventListener("click", () => {
    lastMottoIndex = chooseDifferentIndex(throneMottos.length, lastMottoIndex);
    $("#royalMotto").textContent = throneMottos[lastMottoIndex];
  });

  // -------------------------------------------------------
  // ROTATING ROYAL COMPLIMENTS
  // -------------------------------------------------------

  const compliments = [
    "Your kindness is a quiet kind of magic, and the world is better when you let it shine.",
    "You don't need to be perfect to be worthy of patience, respect, and care.",
    "Your curiosity is a strength. Keep asking questions and discovering new things.",
    "You can celebrate your progress even when there is still more to learn.",
    "Your ideas are worth exploring. Give yourself permission to create.",
    "Being brave doesn't mean never feeling afraid. It means choosing your next step with care.",
    "You are allowed to rest. Rest is part of a healthy journey, not a failure.",
    "The effort you put into learning today can open doors you haven't imagined yet.",
    "Your voice matters, and your boundaries matter too.",
    "A little kindness toward yourself can change the way a difficult day feels.",
    "You can change your mind, learn something new, and begin again.",
    "You bring your own perspective to the world. There is value in that."
  ];

  let lastComplimentIndex = -1;

  $("#newComplimentButton").addEventListener("click", () => {
    lastComplimentIndex = chooseDifferentIndex(compliments.length, lastComplimentIndex);

    const quote = $("#royalCompliment");
    quote.classList.remove("compliment-arrive");

    // Trigger a fresh CSS animation without using unsafe HTML.
    void quote.offsetWidth;

    quote.textContent = compliments[lastComplimentIndex];
    quote.classList.add("compliment-arrive");
  });

  // -------------------------------------------------------
  // WISH GARDEN
  // -------------------------------------------------------

  let wishes = load("wishes");
  if (!Array.isArray(wishes)) wishes = [];

  const wishForm = $("#wishForm");
  const wishList = $("#wishList");
  const wishEmpty = $("#wishEmpty");

  const wishCategoryLabels = {
    dream: "Big dream",
    learn: "Something to learn",
    kindness: "Act of kindness",
    adventure: "New adventure"
  };

  function renderWishes() {
    const filter = $("#wishFilter").value;

    const filtered = wishes.filter((wish) => {
      return filter === "all" || wish.status === filter;
    });

    const bloomedCount = wishes.filter((wish) => wish.status === "bloomed").length;
    const percent = wishes.length
      ? Math.round((bloomedCount / wishes.length) * 100)
      : 0;

    $("#wishCountLabel").textContent = wishes.length
      ? `${wishes.length} wish${wishes.length === 1 ? "" : "es"} planted`
      : "No wishes planted yet.";

    $("#wishProgressText").textContent = `${percent}%`;
    $("#wishProgressBar").style.width = `${percent}%`;

    wishList.innerHTML = filtered.map((wish) => {
      const isBloomed = wish.status === "bloomed";

      return `
        <article class="wish-card ${isBloomed ? "wish-bloomed" : ""}"
          data-wish-id="${escapeHTML(wish.id)}">
          <div class="wish-card-flower">${isBloomed ? "🌸" : "🌱"}</div>
          <div class="wish-card-content">
            <span class="wish-category">${escapeHTML(wishCategoryLabels[wish.category] || "Personal wish")}</span>
            <h4>${escapeHTML(wish.title)}</h4>
            ${wish.details
              ? `<p>${escapeHTML(wish.details)}</p>`
              : ""}
            <small>Planted ${escapeHTML(formatDate(wish.createdAt))}</small>
            <span class="wish-status-pill">${isBloomed ? "Bloomed ✿" : "Growing 🌱"}</span>
          </div>
          <div class="wish-card-actions">
            <button type="button" data-wish-action="toggle">
              ${isBloomed ? "Mark Growing" : "Mark Bloomed"}
            </button>
            <button type="button" data-wish-action="delete" class="wish-remove">
              Remove
            </button>
          </div>
        </article>
      `;
    }).join("");

    const hasWishes = filtered.length > 0;
    wishEmpty.hidden = hasWishes;
    wishList.hidden = !hasWishes;

    if (!wishes.length) {
      wishEmpty.querySelector("h3").textContent =
        "Every garden starts with one seed.";
      wishEmpty.querySelector("p").textContent =
        "Plant your first wish and watch your ideas grow.";
    } else if (!hasWishes) {
      wishEmpty.querySelector("h3").textContent = "Nothing in this section yet.";
      wishEmpty.querySelector("p").textContent =
        "Try another filter to see the rest of your garden.";
    }
  }

  wishForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = $("#wishTitle").value.trim();
    const details = $("#wishDetails").value.trim();

    if (!title) return;

    const wish = {
      id: makeId(),
      title,
      details,
      category: $("#wishCategory").value,
      status: "growing",
      createdAt: new Date().toISOString()
    };

    wishes.unshift(wish);

    if (!save("wishes", wishes)) {
      wishes.shift();
      return;
    }

    wishForm.reset();
    $("#wishStatus").textContent = "Your wish has been planted. 🌱";
    renderWishes();
    showToast("A new wish has taken root!");
  });

  $("#wishFilter").addEventListener("change", renderWishes);

  wishList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-wish-action]");
    if (!button) return;

    const card = button.closest("[data-wish-id]");
    if (!card) return;

    const index = wishes.findIndex((wish) => wish.id === card.dataset.wishId);
    if (index < 0) return;

    const previous = wishes.map((wish) => ({ ...wish }));
    const action = button.dataset.wishAction;

    if (action === "toggle") {
      wishes[index].status =
        wishes[index].status === "bloomed" ? "growing" : "bloomed";
    } else if (action === "delete") {
      if (!window.confirm(`Remove "${wishes[index].title}" from your garden?`)) {
        return;
      }
      wishes.splice(index, 1);
    }

    if (!save("wishes", wishes)) {
      wishes = previous;
      return;
    }

    renderWishes();
    showToast(action === "toggle" ? "Your garden has been updated. ✿" : "Wish removed.");
  });

  // -------------------------------------------------------
  // ROYAL DECREE GENERATOR
  // -------------------------------------------------------

  const decreePresets = {
    kindness: {
      title: "A Decree of Kindness",
      text: "Let kindness guide my words, patience guide my actions, and compassion guide the way I treat myself and others."
    },
    courage: {
      title: "A Decree of Courage",
      text: "I shall meet new challenges one step at a time, ask for help when I need it, and remember that mistakes are part of learning."
    },
    rest: {
      title: "A Decree of Rest",
      text: "I shall make room for rest without guilt, listen to my needs, and remember that caring for myself helps me care for others."
    },
    learning: {
      title: "A Decree of Learning",
      text: "I shall remain curious, welcome new ideas, and allow myself to be a beginner while I build new skills."
    },
    joy: {
      title: "A Decree of Joy",
      text: "I shall make space for laughter, celebrate small victories, and notice the little things that make an ordinary day feel special."
    },
    custom: {
      title: "A Personal Royal Decree",
      text: "Today, I choose to move forward with intention, treat myself with care, and take one small step toward what matters to me."
    }
  };

  function createDecree() {
    const type = $("#decreeType").value;
    const preset = decreePresets[type] || decreePresets.custom;
    const customText = $("#customDecree").value.trim();
    const signature = $("#decreeName").value.trim() || "The Queen";

    $("#royalDecree").querySelector("h3").textContent = preset.title;
    $("#decreeText").textContent =
      type === "custom" && customText ? customText : preset.text;
    $("#decreeSignature").textContent = `${signature} ♡`;

    $("#decreeStatus").textContent = "Your royal decree has been prepared. ♛";
  }

  $("#createDecreeButton").addEventListener("click", createDecree);

  $("#copyDecreeButton").addEventListener("click", async () => {
    const title = $("#royalDecree").querySelector("h3").textContent;
    const text = $("#decreeText").textContent;
    const signature = $("#decreeSignature").textContent;
    const copyText = `BY THE AUTHORITY OF THE ROYAL HEART\n\n${title}\n\n${text}\n\n${signature}`;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(copyText);
      $("#decreeStatus").textContent = "Copied! Your decree is ready to share.";
      showToast("Royal decree copied!");
    } catch {
      $("#decreeStatus").textContent =
        "Automatic copying isn't available here. You can select the decree text and copy it manually.";
    }
  });

  // -------------------------------------------------------
  // DREAM JOURNAL
  // -------------------------------------------------------

  let journalEntries = load("journal");
  if (!Array.isArray(journalEntries)) journalEntries = [];

  const moodLabels = {
    hopeful: "✨ Hopeful",
    happy: "☀️ Happy",
    thoughtful: "🌙 Thoughtful",
    determined: "🔥 Determined",
    peaceful: "🌿 Peaceful"
  };

  function renderJournal() {
    const list = $("#dreamJournalList");

    if (!journalEntries.length) {
      list.innerHTML = `
        <article class="dream-journal-empty">
          <span>📖</span>
          <h3>Your royal library awaits.</h3>
          <p>Your reflections and dreams will appear here after you save them.</p>
        </article>`;
      return;
    }

    list.innerHTML = journalEntries.map((entry) => `
      <article class="dream-entry" data-entry-id="${escapeHTML(entry.id)}">
        <div class="dream-entry-top">
          <span>${escapeHTML(moodLabels[entry.mood] || "✧ Reflecting")}</span>
          <small>${escapeHTML(formatDate(entry.createdAt))}</small>
        </div>
        <h3>${escapeHTML(entry.title)}</h3>
        <p>${escapeHTML(entry.content)}</p>
        <button type="button" class="dream-entry-delete" data-delete-entry>
          Remove entry
        </button>
      </article>
    `).join("");
  }

  $("#dreamJournalForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const entry = {
      id: makeId(),
      title: $("#dreamEntryTitle").value.trim(),
      mood: $("#dreamEntryMood").value,
      content: $("#dreamEntryText").value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.title || !entry.content) return;

    journalEntries.unshift(entry);

    if (!save("journal", journalEntries)) {
      journalEntries.shift();
      return;
    }

    $("#dreamJournalForm").reset();
    $("#journalStatus").textContent = "Your entry has been placed in the royal library. ♡";
    renderJournal();
    showToast("Dream journal entry saved.");
  });

  $("#dreamJournalList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-entry]");
    if (!button) return;

    const card = button.closest("[data-entry-id]");
    if (!card) return;

    const previous = journalEntries;
    journalEntries = journalEntries.filter(
      (entry) => entry.id !== card.dataset.entryId
    );

    if (!save("journal", journalEntries)) {
      journalEntries = previous;
      return;
    }

    renderJournal();
    showToast("Journal entry removed.");
  });

  // -------------------------------------------------------
  // START THE PALACE
  // -------------------------------------------------------

  renderWishes();
  renderJournal();
  createDecree();
})();
