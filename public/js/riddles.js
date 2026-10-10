(() => {
  const $ = selector => document.querySelector(selector);
  const key = 'beauty:riddles:best';

  const questions = [
    {
      q: 'I have a face and two hands, but no arms or legs. What am I?',
      a: ['A clock', 'A teddy bear', 'A painting', 'A book'],
      correct: 0,
      why: 'A clock has a face and hands that show the time.'
    },
    {
      q: 'The more you take, the more you leave behind. What are they?',
      a: ['Coins', 'Footsteps', 'Pictures', 'Breaths'],
      correct: 1,
      why: 'Each step you take leaves another footprint behind.'
    },
    {
      q: 'I sparkle in the night but disappear in the day. What am I?',
      a: ['A candle', 'A star', 'A flower', 'A rainbow'],
      correct: 1,
      why: 'Stars are easiest to see when the sky is dark.'
    },
    {
      q: 'What has many keys but cannot open a single lock?',
      a: ['A treasure chest', 'A piano', 'A map', 'A crown'],
      correct: 1,
      why: 'A piano has musical keys.'
    },
    {
      q: 'What gets wetter the more it dries?',
      a: ['A towel', 'Rain', 'A cloud', 'A sponge cake'],
      correct: 0,
      why: 'A towel gets wet as it dries something else.'
    },
    {
      q: 'I am full of holes but still hold water. What am I?',
      a: ['A net', 'A sponge', 'A basket', 'A sieve'],
      correct: 1,
      why: 'A sponge can absorb and hold water.'
    }
  ];

  let index = 0;
  let score = 0;
  let answered = false;
  let best = Number(localStorage.getItem(key) || 0);

  $('#appArea').innerHTML = `
    <div class="scoreline">
      <span id="progress">Riddle 1 of ${questions.length}</span>
      <span>
        Score: <b id="score">0</b>
        · Best: <b id="best">${best}</b>
      </span>
    </div>

    <h3 id="question" class="compliment"></h3>

    <div id="answers" class="app-area"></div>

    <p id="feedback" aria-live="polite"></p>

    <button class="action-button" id="nextRiddle" type="button" disabled>
      Next riddle →
    </button>

    <button class="quiet-button" id="restartRiddles" type="button">
      Start over
    </button>
  `;

  function show() {
    answered = false;

    const question = questions[index];

    $('#progress').textContent =
      `Riddle ${index + 1} of ${questions.length}`;

    $('#question').textContent = question.q;
    $('#feedback').textContent = '';
    $('#nextRiddle').disabled = true;

    const box = $('#answers');
    box.replaceChildren();

    question.a.forEach((answerText, answerIndex) => {
      const button = document.createElement('button');

      button.className = 'option-button';
      button.textContent = answerText;
      button.onclick = () => answer(answerIndex, button);

      box.append(button);
    });
  }

  function answer(answerIndex, selectedButton) {
    if (answered) return;

    answered = true;

    const question = questions[index];
    const buttons = [...$('#answers').children];

    buttons.forEach(button => {
      button.disabled = true;
    });

    if (answerIndex === question.correct) {
      score += 10;

      $('#feedback').textContent =
        '✨ Correct! ' + question.why;

      selectedButton.style.borderColor = '#a8e6b0';
    } else {
      $('#feedback').textContent =
        'Not quite. ' + question.why;

      buttons[question.correct].style.borderColor = '#a8e6b0';
    }

    $('#score').textContent = score;
    $('#nextRiddle').disabled = false;

    if (index === questions.length - 1) {
      const newBest = Math.max(score, best);

      best = newBest;
      localStorage.setItem(key, String(newBest));

      $('#best').textContent = newBest;
      $('#nextRiddle').textContent = 'Play again ↻';

      $('#status').textContent =
        `You earned ${score} points out of ${questions.length * 10}.`;
    }
  }

  $('#nextRiddle').onclick = () => {
    if (index === questions.length - 1) {
      index = 0;
      score = 0;

      $('#score').textContent = '0';
      $('#nextRiddle').textContent = 'Next riddle →';

      show();
    } else {
      index++;
      show();
    }
  };

  $('#restartRiddles').onclick = () => {
    index = 0;
    score = 0;

    $('#score').textContent = '0';
    $('#status').textContent = '';

    show();
  };

  $('#clearItems').hidden = true;
  $('#emptyState').hidden = true;

  $('#collectionList').innerHTML = `
    <div class="item-card">
      <h3>How to play</h3>
      <p>
        Choose one answer for each riddle. Correct answers are worth
        10 points. Your best score is saved in this browser.
      </p>
    </div>
  `;

  show();
})();
