/* ================================================================
   Who is the Imposter? — Progressive Web App
   ================================================================ */

// ---- Word lists (10+ per category) --------------------------------
const WORD_LISTS = {
  Animals: [
    "Elephant","Penguin","Giraffe","Dolphin","Chameleon",
    "Kangaroo","Octopus","Flamingo","Hedgehog","Panther","Koala","Cheetah"
  ],
  Food: [
    "Sushi","Pancake","Burrito","Croissant","Dumpling",
    "Lasagna","Pretzel","Waffle","Tiramisu","Falafel","Ramen","Guacamole"
  ],
  Sports: [
    "Basketball","Cricket","Fencing","Surfing","Archery",
    "Badminton","Hockey","Volleyball","Gymnastics","Boxing","Rowing","Skateboarding"
  ],
  Places: [
    "Library","Volcano","Lighthouse","Castle","Aquarium",
    "Pyramid","Rainforest","Glacier","Colosseum","Waterfall","Carnival","Observatory"
  ],
  Movies: [
    "Inception","Titanic","Jaws","Frozen","Gladiator",
    "Shrek","Psycho","Avatar","Ratatouille","Interstellar","Rocky","Bambi"
  ],
  Occupations: [
    "Astronaut","Detective","Blacksmith","Pilot","Surgeon",
    "Librarian","Magician","Firefighter","Archaeologist","Chef","Electrician","Journalist"
  ]
};

// ---- Game state ---------------------------------------------------
let state = {
  numPlayers: 4,
  numImposters: 1,
  roles: [],        // boolean[] — true = imposter
  category: "",
  word: "",
  currentPlayer: 0, // index during reveal & voting
  votes: [],        // vote tally per player
  scores: [],       // persistent across rounds
};

// ---- Helpers ------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(`#screen-${id}`).classList.add("active");
}

// ---- Setup stepper logic ------------------------------------------
function clampSetup() {
  const maxImp = state.numPlayers - 2;
  if (state.numImposters > maxImp) state.numImposters = Math.max(1, maxImp);
  if (state.numImposters < 1) state.numImposters = 1;
  if (state.numPlayers < 3) state.numPlayers = 3;

  $("#input-players").textContent = state.numPlayers;
  $("#input-imposters").textContent = state.numImposters;
  $("#setup-info").textContent =
    `${state.numPlayers - state.numImposters} civilians vs ${state.numImposters} imposter${state.numImposters > 1 ? "s" : ""}`;
}

$$(".btn-stepper").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir, 10);
    if (target === "input-players") {
      state.numPlayers = Math.max(3, state.numPlayers + dir);
    } else {
      state.numImposters += dir;
    }
    clampSetup();
  });
});

// ---- Role assignment ----------------------------------------------
function assignRoles() {
  const cats = Object.keys(WORD_LISTS);
  state.category = pick(cats);
  state.word = pick(WORD_LISTS[state.category]);

  // pick imposter indices
  const indices = Array.from({ length: state.numPlayers }, (_, i) => i);
  const imposterSet = new Set(shuffle(indices).slice(0, state.numImposters));
  state.roles = indices.map((i) => imposterSet.has(i));

  state.votes = new Array(state.numPlayers).fill(0);
}

// ---- Reveal phase -------------------------------------------------
function startReveal() {
  state.currentPlayer = 0;
  showPassScreen();
}

function showPassScreen() {
  $("#pass-title").textContent = `Pass to Player ${state.currentPlayer + 1}`;
  showScreen("pass");
}

function showRole() {
  const isImposter = state.roles[state.currentPlayer];
  const content = $("#role-content");

  if (isImposter) {
    content.innerHTML = `
      <div class="role-card imposter">
        <div class="role-emoji">\u{1f575}\u{fe0f}</div>
        <div class="role-label">IMPOSTER</div>
        <p class="role-detail">Category: <strong>${state.category}</strong></p>
        <p class="role-detail">You do NOT know the word. Bluff!</p>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="role-card civilian">
        <div class="role-emoji">\u{1f60a}</div>
        <div class="role-label">CIVILIAN</div>
        <p class="role-detail">Category: <strong>${state.category}</strong></p>
        <div class="role-word">${state.word}</div>
      </div>`;
  }
  showScreen("role");
}

function hideAndPass() {
  state.currentPlayer++;
  if (state.currentPlayer < state.numPlayers) {
    showPassScreen();
  } else {
    showScreen("discuss");
  }
}

// ---- Voting phase -------------------------------------------------
function startVoting() {
  state.currentPlayer = 0;
  state.votes = new Array(state.numPlayers).fill(0);
  showVoteFor();
}

function showVoteFor() {
  const p = state.currentPlayer;
  $("#voting-title").textContent = `Player ${p + 1}, vote!`;

  const grid = $("#vote-buttons");
  grid.innerHTML = "";
  for (let i = 0; i < state.numPlayers; i++) {
    const btn = document.createElement("button");
    btn.className = "vote-btn" + (i === p ? " disabled" : "");
    btn.textContent = `Player ${i + 1}`;
    if (i !== p) {
      btn.addEventListener("click", () => castVote(i));
    }
    grid.appendChild(btn);
  }
  showScreen("voting");
}

function castVote(targetIdx) {
  state.votes[targetIdx]++;
  state.currentPlayer++;
  if (state.currentPlayer < state.numPlayers) {
    showVoteFor();
  } else {
    showResults();
  }
}

// ---- Results ------------------------------------------------------
function showResults() {
  const maxVotes = Math.max(...state.votes);
  const accused = state.votes
    .map((v, i) => (v === maxVotes ? i : -1))
    .filter((i) => i >= 0);

  let caught = false;
  let verdictHTML = "";

  if (accused.length > 1) {
    const names = accused.map((i) => `Player ${i + 1}`).join(", ");
    verdictHTML = `<div class="result-verdict survived">It's a tie between ${names}!<br>The imposters survive!</div>`;
  } else {
    const t = accused[0];
    if (state.roles[t]) {
      caught = true;
      verdictHTML = `<div class="result-verdict caught">Player ${t + 1} was voted out &mdash; and they WERE an imposter!</div>`;
    } else {
      verdictHTML = `<div class="result-verdict survived">Player ${t + 1} was voted out &mdash; but they were INNOCENT!</div>`;
    }
  }

  // Tally bars
  let tallyHTML = "";
  for (let i = 0; i < state.numPlayers; i++) {
    const pct = maxVotes > 0 ? (state.votes[i] / maxVotes) * 100 : 0;
    tallyHTML += `
      <div class="tally-row">
        <span class="tally-name">Player ${i + 1}</span>
        <div class="tally-bar"><div class="tally-fill" style="width:${pct}%"></div></div>
        <span class="tally-count">${state.votes[i]}</span>
      </div>`;
  }

  // Reveal
  const impNums = state.roles.map((r, i) => (r ? `Player ${i + 1}` : null)).filter(Boolean).join(", ");
  const civNums = state.roles.map((r, i) => (!r ? `Player ${i + 1}` : null)).filter(Boolean).join(", ");

  // Score
  if (caught) {
    for (let i = 0; i < state.numPlayers; i++) {
      if (!state.roles[i]) state.scores[i]++;
    }
  } else {
    for (let i = 0; i < state.numPlayers; i++) {
      if (state.roles[i]) state.scores[i]++;
    }
  }

  const pointsMsg = caught
    ? `<p class="points-msg green">+1 to all civilians for catching an imposter!</p>`
    : `<p class="points-msg red">+1 to the imposter(s) for surviving!</p>`;

  $("#results-content").innerHTML = `
    ${verdictHTML}
    ${tallyHTML}
    <div class="reveal-section">
      <p class="red">Imposter(s): ${impNums}</p>
      <p class="green">Civilians: ${civNums}</p>
      <p style="margin-top:12px;color:var(--dim)">Category: ${state.category}</p>
      <div class="reveal-word">${state.word}</div>
    </div>
    ${pointsMsg}`;

  showScreen("results");
}

// ---- Scoreboard ---------------------------------------------------
function showScoreboard() {
  const ranking = Array.from({ length: state.numPlayers }, (_, i) => i)
    .sort((a, b) => state.scores[b] - state.scores[a]);

  let html = "";
  ranking.forEach((i, rank) => {
    html += `
      <div class="score-row">
        <span class="score-rank">${rank + 1}</span>
        <span class="score-name">Player ${i + 1}</span>
        <span class="score-pts">${state.scores[i]} pts</span>
      </div>`;
  });

  $("#scoreboard-content").innerHTML = html;
  showScreen("scoreboard");
}

// ---- Wiring -------------------------------------------------------
$("#btn-start").addEventListener("click", () => {
  clampSetup();
  showScreen("setup");
});

$("#btn-play").addEventListener("click", () => {
  if (!state.scores.length || state.scores.length !== state.numPlayers) {
    state.scores = new Array(state.numPlayers).fill(0);
  }
  assignRoles();
  startReveal();
});

$("#btn-reveal").addEventListener("click", showRole);
$("#btn-hide").addEventListener("click", hideAndPass);
$("#btn-vote").addEventListener("click", startVoting);
$("#btn-scores").addEventListener("click", showScoreboard);

$("#btn-again").addEventListener("click", () => {
  assignRoles();
  startReveal();
});

$("#btn-new-game").addEventListener("click", () => {
  state.scores = [];
  clampSetup();
  showScreen("setup");
});

// ---- Service worker registration ----------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
