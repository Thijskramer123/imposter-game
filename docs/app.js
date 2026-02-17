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
  names: [],        // player names
  roles: [],        // boolean[] — true = imposter
  category: "",
  word: "",
  currentPlayer: 0, // index during reveal
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

function getName(i) {
  return state.names[i] || `Player ${i + 1}`;
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

// ---- Names screen -------------------------------------------------
function showNamesScreen() {
  const list = $("#names-list");
  list.innerHTML = "";
  for (let i = 0; i < state.numPlayers; i++) {
    const row = document.createElement("div");
    row.className = "name-row";

    const label = document.createElement("span");
    label.className = "name-label";
    label.textContent = `Player ${i + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = `Player ${i + 1}`;
    input.maxLength = 16;
    input.dataset.index = i;
    // Preserve previously entered names
    if (state.names[i]) {
      input.value = state.names[i];
    }

    row.appendChild(label);
    row.appendChild(input);
    list.appendChild(row);
  }
  showScreen("names");
}

function collectNames() {
  const inputs = $$("#names-list .name-input");
  state.names = [];
  inputs.forEach((inp) => {
    const val = inp.value.trim();
    state.names.push(val || "");
  });
}

// ---- Role assignment ----------------------------------------------
function assignRoles() {
  const cats = Object.keys(WORD_LISTS);
  state.category = pick(cats);
  state.word = pick(WORD_LISTS[state.category]);

  const indices = Array.from({ length: state.numPlayers }, (_, i) => i);
  const imposterSet = new Set(shuffle(indices).slice(0, state.numImposters));
  state.roles = indices.map((i) => imposterSet.has(i));
}

// ---- Reveal phase -------------------------------------------------
function startReveal() {
  state.currentPlayer = 0;
  showPassScreen();
}

function showPassScreen() {
  $("#pass-title").textContent = `Pass to ${getName(state.currentPlayer)}`;
  showScreen("pass");
}

function showRole() {
  const isImposter = state.roles[state.currentPlayer];
  const name = getName(state.currentPlayer);
  const content = $("#role-content");

  if (isImposter) {
    content.innerHTML = `
      <div class="role-card imposter">
        <div class="role-emoji">\u{1f575}\u{fe0f}</div>
        <div class="role-label">IMPOSTER</div>
        <p class="role-name">${name}</p>
        <p class="role-detail">Category: <strong>${state.category}</strong></p>
        <p class="role-detail">You do NOT know the word. Bluff!</p>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="role-card civilian">
        <div class="role-emoji">\u{1f60a}</div>
        <div class="role-label">CIVILIAN</div>
        <p class="role-name">${name}</p>
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
    showStartPlayer();
  }
}

// ---- Who starts screen --------------------------------------------
function showStartPlayer() {
  const starterIdx = Math.floor(Math.random() * state.numPlayers);
  const starterName = getName(starterIdx);

  $("#start-player-card").innerHTML = `
    <div class="starter-name">${starterName}</div>
    <div class="starter-label">goes first!</div>`;

  showScreen("start-player");
}

// ---- Wiring -------------------------------------------------------
$("#btn-start").addEventListener("click", () => {
  clampSetup();
  showScreen("setup");
});

$("#btn-names").addEventListener("click", () => {
  showNamesScreen();
});

$("#btn-play").addEventListener("click", () => {
  collectNames();
  assignRoles();
  startReveal();
});

$("#btn-reveal").addEventListener("click", showRole);
$("#btn-hide").addEventListener("click", hideAndPass);

$("#btn-again").addEventListener("click", () => {
  assignRoles();
  startReveal();
});

$("#btn-new-game").addEventListener("click", () => {
  state.names = [];
  clampSetup();
  showScreen("setup");
});

// ---- Service worker registration ----------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
