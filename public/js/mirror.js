(() => {
  const $ = selector => document.querySelector(selector);
  const key = 'beauty:mirror:favorites';

  const lines = [
    'You deserve the same kindness you so freely give.',
    'Your worth is not measured by how much you do for others.',
    'You are allowed to rest and still be wonderful.',
    'There is courage in beginning again.',
    'You bring something to this world that nobody else can.',
    'You do not have to be perfect to be deeply loved.',
    'Your feelings deserve space, care, and respect.',
    'Little steps still move you forward.',
    'You are more than one difficult day.',
    'You deserve friendships that let you be yourself.',
    'Your laughter is a lovely thing.',
    'There is no deadline for becoming who you want to be.'
  ];

  let favorites = read();
  let current = '';

  function read() {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function render() {
    const box = $('#collectionList');
    box.replaceChildren();

    favorites.forEach((affirmation, index) => {
      const card = document.createElement('article');
      card.className = 'item-card';

      const text = document.createElement('p');
      text.textContent = '✨ ' + affirmation;

      const remove = document.createElement('button');
      remove.className = 'quiet-button';
      remove.textContent = 'Remove favorite';

      remove.onclick = () => {
        favorites.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(favorites));
        render();
        sync();
      };

      card.append(text, remove);
      box.append(card);
    });

    $('#emptyState').hidden = favorites.length > 0;
  }

  $('#appArea').innerHTML = `
    <div class="item-card">
      <p class="item-meta">A KIND REMINDER FOR YOU</p>

      <div class="compliment" id="compliment">
        Tap the mirror to reveal a message.
      </div>

      <div class="pill-row" style="justify-content:center">
        <button class="action-button" id="reveal" type="button">
          Reveal a compliment ✨
        </button>

        <button class="quiet-button" id="saveFavorite" type="button" disabled>
          ♡ Save favorite
        </button>
      </div>
    </div>
  `;

  function sync() {
    const saved = favorites.includes(current);

    $('#saveFavorite').disabled = !current || saved;
    $('#saveFavorite').textContent = saved
      ? '♥ Saved to favorites'
      : '♡ Save favorite';
  }

  $('#reveal').onclick = () => {
    let next = lines[Math.floor(Math.random() * lines.length)];

    if (lines.length > 1) {
      while (next === current) {
        next = lines[Math.floor(Math.random() * lines.length)];
      }
    }

    current = next;
    $('#compliment').textContent = current;

    sync();

    $('#status').textContent = 'A new reminder, just for you.';
  };

  $('#saveFavorite').onclick = () => {
    if (!current || favorites.includes(current)) return;

    favorites.unshift(current);
    localStorage.setItem(key, JSON.stringify(favorites));

    render();
    sync();

    $('#status').textContent = 'Saved to your mirror favorites.';
  };

  $('#clearItems').onclick = () => {
    if (confirm('Clear all favorite affirmations?')) {
      favorites = [];
      localStorage.setItem(key, '[]');

      render();
      sync();
    }
  };

  render();
  sync();
})();
