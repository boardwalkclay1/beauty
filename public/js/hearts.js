(() => {
  const $ = selector => document.querySelector(selector);
  const key = 'beauty:hearts:best';

  let score = 0;
  let time = 20;
  let active = false;
  let timer = null;
  let spawn = null;
  let pos = 50;

  let best = Number(localStorage.getItem(key) || 0);

  $('#appArea').innerHTML = `
    <div class="scoreline">
      <span>Score: <b id="gameScore">0</b></span>
      <span>
        Time: <b id="gameTime">20</b>s
        · Best: <b id="gameBest">${best}</b>
      </span>
    </div>

    <div class="game-board" id="board" aria-label="Heart catching game area"></div>

    <div class="catcher" id="catcher">🧺</div>

    <div class="heart-controls">
      <button class="option-button" id="left" aria-label="Move left">←</button>
      <button class="action-button" id="startGame">Start game ▶</button>
      <button class="option-button" id="right" aria-label="Move right">→</button>
    </div>

    <p>
      Catch hearts by clicking them, or move the basket with the arrow
      keys and buttons.
    </p>
  `;

  const board = $('#board');
  const catcher = $('#catcher');

  function move(amount) {
    pos = Math.max(8, Math.min(92, pos + amount));
    catcher.style.transform = `translateX(${(pos - 50) * 2}px)`;
  }

  $('#left').onclick = () => move(-8);
  $('#right').onclick = () => move(8);

  document.addEventListener('keydown', event => {
    if (!active) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-7);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(7);
    }
  });

  function makeHeart() {
    if (!active) return;

    const heart = document.createElement('button');

    heart.className = 'falling-heart';
    heart.type = 'button';
    heart.textContent = Math.random() > 0.15 ? '💗' : '💔';
    heart.style.left = (Math.random() * 86 + 5) + '%';
    heart.style.animationDuration = (2.2 + Math.random() * 1.5) + 's';
    heart.setAttribute('aria-label', 'Catch heart');

    heart.onclick = () => {
      if (!active) return;

      score += heart.textContent === '💗' ? 1 : -1;
      score = Math.max(0, score);

      $('#gameScore').textContent = score;
      heart.remove();
    };

    board.append(heart);

    setTimeout(() => heart.remove(), 4000);
  }

  function end() {
    active = false;

    clearInterval(timer);
    clearInterval(spawn);

    board.querySelectorAll('.falling-heart').forEach(heart => {
      heart.remove();
    });

    best = Math.max(best, score);
    localStorage.setItem(key, String(best));

    $('#gameBest').textContent = best;
    $('#startGame').textContent = 'Play again ↻';

    $('#status').textContent =
      `Time's up! You caught ${score} points worth of hearts.`;
  }

  function start() {
    clearInterval(timer);
    clearInterval(spawn);

    board.querySelectorAll('.falling-heart').forEach(heart => {
      heart.remove();
    });

    score = 0;
    time = 20;
    active = true;
    pos = 50;

    catcher.style.transform = 'translateX(0)';

    $('#gameScore').textContent = score;
    $('#gameTime').textContent = time;
    $('#startGame').textContent = 'Playing…';
    $('#status').textContent = 'Go catch some hearts!';

    spawn = setInterval(makeHeart, 650);

    timer = setInterval(() => {
      time--;

      $('#gameTime').textContent = time;

      if (time <= 0) {
        end();
      }
    }, 1000);
  }

  $('#startGame').onclick = () => {
    if (!active) start();
  };

  $('#clearItems').hidden = true;
  $('#emptyState').hidden = true;

  $('#collectionList').innerHTML = `
    <div class="item-card">
      <h3>Personal best</h3>
      <p>Best score saved on this device: <strong>${best}</strong></p>
      <p>
        Tip: tap hearts to catch them quickly.
        💗 gives one point; 💔 takes one away.
      </p>
    </div>
  `;
})();
