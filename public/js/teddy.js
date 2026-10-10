(() => {
  const $ = selector => document.querySelector(selector);
  const key = 'beauty:teddy';

  let items = load();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(key, JSON.stringify(items));
  }

  $('#appArea').innerHTML = `
    <form class="app-form" id="teddyForm">
      <div class="two-col">
        <div>
          <label for="bearName">Teddy name</label>
          <input
            id="bearName"
            maxlength="40"
            placeholder="Buttons, Honey, Star…"
            required
          >
        </div>

        <div>
          <label for="bearType">Teddy style</label>
          <select id="bearType">
            <option>🧸 Classic Teddy</option>
            <option>🐻 Honey Bear</option>
            <option>🐼 Panda Pal</option>
            <option>🐨 Koala Cuddle</option>
            <option>🦄 Dream Bear</option>
          </select>
        </div>
      </div>

      <label for="bearStory">Their little story</label>
      <textarea
        id="bearStory"
        maxlength="500"
        placeholder="What makes this teddy special?"
        required
      ></textarea>

      <button class="action-button" type="submit">
        Adopt your teddy 🧸
      </button>
    </form>

    <p>
      Tip: each teddy can have their own personality, backstory,
      and place in your forest.
    </p>
  `;

  $('#teddyForm').onsubmit = event => {
    event.preventDefault();

    items.unshift({
      id: Date.now(),
      name: $('#bearName').value.trim(),
      type: $('#bearType').value,
      story: $('#bearStory').value.trim(),
      date: new Date().toLocaleDateString()
    });

    persist();
    render();
    event.target.reset();

    $('#status').textContent = 'Your new teddy friend is home!';
  };

  function render() {
    const box = $('#collectionList');
    box.replaceChildren();

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'item-card';

      const heading = document.createElement('h3');
      heading.textContent = `${item.type} — ${item.name}`;

      const story = document.createElement('p');
      story.textContent = item.story;

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = `Adopted ${item.date}`;

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const remove = document.createElement('button');
      remove.className = 'quiet-button';
      remove.textContent = 'Say goodbye';

      remove.onclick = () => {
        items = items.filter(entry => entry.id !== item.id);
        persist();
        render();
      };

      actions.append(remove);
      card.append(heading, story, meta, actions);
      box.append(card);
    });

    $('#emptyState').hidden = items.length > 0;
  }

  $('#clearItems').onclick = () => {
    if (confirm('Release all your teddy friends from this forest?')) {
      items = [];
      persist();
      render();
    }
  };

  render();
})();
