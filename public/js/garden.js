(() => {
  const $ = selector => document.querySelector(selector);
  const key = 'beauty:garden';

  let items = read();

  function read() {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(key, JSON.stringify(items));
  }

  $('#appArea').innerHTML = `
    <form class="app-form" id="roseForm">
      <label for="roseColor">Choose your rose</label>
      <select id="roseColor">
        <option>🌹 Classic Red Rose</option>
        <option>🌷 Pink Tulip</option>
        <option>🌼 Golden Sunshine</option>
        <option>💜 Lavender Dream</option>
        <option>🤍 White Rose</option>
      </select>

      <label for="roseNote">Compliment or little note</label>
      <textarea
        id="roseNote"
        maxlength="300"
        placeholder="A beautiful thing to remember…"
        required
      ></textarea>

      <button class="action-button" type="submit">Plant a rose 🌱</button>
    </form>

    <div class="pill-row">
      <button class="option-button" id="randomCompliment" type="button">
        Surprise me with a compliment ✨
      </button>
    </div>
  `;

  const compliments = [
    'Your kindness makes a difference.',
    'You deserve love that feels safe and true.',
    'Your smile brings warmth into a room.',
    'You are allowed to grow at your own pace.',
    'There is something special about the way you see the world.'
  ];

  $('#randomCompliment').onclick = () => {
    $('#roseNote').value =
      compliments[Math.floor(Math.random() * compliments.length)];
  };

  $('#roseForm').onsubmit = event => {
    event.preventDefault();

    items.unshift({
      id: Date.now(),
      title: $('#roseColor').value,
      note: $('#roseNote').value.trim(),
      date: new Date().toLocaleDateString()
    });

    save();
    render();

    $('#roseNote').value = '';
    $('#status').textContent =
      'A new little bloom has joined your garden.';
  };

  function render() {
    const box = $('#collectionList');
    box.replaceChildren();

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'item-card';

      const heading = document.createElement('h3');
      heading.textContent = item.title;

      const note = document.createElement('p');
      note.textContent = item.note;

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = `Planted ${item.date}`;

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const remove = document.createElement('button');
      remove.className = 'quiet-button';
      remove.textContent = 'Remove';

      remove.onclick = () => {
        items = items.filter(entry => entry.id !== item.id);
        save();
        render();
      };

      actions.append(remove);
      card.append(heading, note, meta, actions);
      box.append(card);
    });

    $('#emptyState').hidden = items.length > 0;
  }

  $('#clearItems').onclick = () => {
    if (confirm('Clear every rose in this garden?')) {
      items = [];
      save();
      render();
      $('#status').textContent =
        'Your garden is ready for a fresh start.';
    }
  };

  render();
})();
