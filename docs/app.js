/* ================================================================
   Who is the Imposter? — Progressive Web App
   ================================================================ */

// ---- Word lists with hints (10+ per category) --------------------
const WORD_LISTS = {
  Animals: [
    { word: "Elephant", hint: "trunk" },
    { word: "Penguin", hint: "ice" },
    { word: "Giraffe", hint: "tall" },
    { word: "Dolphin", hint: "ocean" },
    { word: "Chameleon", hint: "camouflage" },
    { word: "Kangaroo", hint: "pouch" },
    { word: "Octopus", hint: "tentacles" },
    { word: "Flamingo", hint: "pink" },
    { word: "Hedgehog", hint: "spiky" },
    { word: "Panther", hint: "stealth" },
    { word: "Koala", hint: "eucalyptus" },
    { word: "Cheetah", hint: "speed" }
  ],
  Food: [
    { word: "Sushi", hint: "rice" },
    { word: "Pancake", hint: "flat" },
    { word: "Burrito", hint: "wrapped" },
    { word: "Croissant", hint: "buttery" },
    { word: "Dumpling", hint: "stuffed" },
    { word: "Lasagna", hint: "layers" },
    { word: "Pretzel", hint: "twisted" },
    { word: "Waffle", hint: "grid" },
    { word: "Tiramisu", hint: "coffee" },
    { word: "Falafel", hint: "chickpea" },
    { word: "Ramen", hint: "noodles" },
    { word: "Guacamole", hint: "avocado" }
  ],
  Sports: [
    { word: "Basketball", hint: "hoop" },
    { word: "Cricket", hint: "wicket" },
    { word: "Fencing", hint: "sword" },
    { word: "Surfing", hint: "waves" },
    { word: "Archery", hint: "arrow" },
    { word: "Badminton", hint: "shuttlecock" },
    { word: "Hockey", hint: "puck" },
    { word: "Volleyball", hint: "net" },
    { word: "Gymnastics", hint: "flips" },
    { word: "Boxing", hint: "gloves" },
    { word: "Rowing", hint: "oars" },
    { word: "Skateboarding", hint: "wheels" }
  ],
  Places: [
    { word: "Library", hint: "books" },
    { word: "Volcano", hint: "eruption" },
    { word: "Lighthouse", hint: "beacon" },
    { word: "Castle", hint: "royalty" },
    { word: "Aquarium", hint: "fish" },
    { word: "Pyramid", hint: "pharaoh" },
    { word: "Rainforest", hint: "tropical" },
    { word: "Glacier", hint: "frozen" },
    { word: "Colosseum", hint: "gladiator" },
    { word: "Waterfall", hint: "cascade" },
    { word: "Carnival", hint: "rides" },
    { word: "Observatory", hint: "stars" }
  ],
  Movies: [
    { word: "Inception", hint: "dreams" },
    { word: "Titanic", hint: "iceberg" },
    { word: "Jaws", hint: "shark" },
    { word: "Frozen", hint: "snow" },
    { word: "Gladiator", hint: "arena" },
    { word: "Shrek", hint: "ogre" },
    { word: "Psycho", hint: "motel" },
    { word: "Avatar", hint: "Pandora" },
    { word: "Ratatouille", hint: "rat" },
    { word: "Interstellar", hint: "wormhole" },
    { word: "Rocky", hint: "boxing" },
    { word: "Bambi", hint: "deer" }
  ],
  Occupations: [
    { word: "Astronaut", hint: "space" },
    { word: "Detective", hint: "clues" },
    { word: "Blacksmith", hint: "forge" },
    { word: "Pilot", hint: "cockpit" },
    { word: "Surgeon", hint: "scalpel" },
    { word: "Librarian", hint: "shelves" },
    { word: "Magician", hint: "illusion" },
    { word: "Firefighter", hint: "hose" },
    { word: "Archaeologist", hint: "ruins" },
    { word: "Chef", hint: "kitchen" },
    { word: "Electrician", hint: "wires" },
    { word: "Journalist", hint: "headline" }
  ],
  Minecraft: [
    { word: "Diamond", hint: "precious" },
    { word: "Creeper", hint: "explosive" },
    { word: "Ender Pearl", hint: "throwable" },
    { word: "Obsidian", hint: "black" },
    { word: "Redstone", hint: "dust" },
    { word: "Enchanting Table", hint: "magical" },
    { word: "Nether Portal", hint: "pig" },
    { word: "Golden Apple", hint: "ingot" },
    { word: "Elytra", hint: "endgame" },
    { word: "Crafting Table", hint: "grid" },
    { word: "Bed", hint: "explodes" },
    { word: "Torch", hint: "texture pack" },
    { word: "Bucket", hint: "iron" },
    { word: "Minecart", hint: "villager" },
    { word: "TNT", hint: "water" },
    { word: "Chest", hint: "hopper" },
    { word: "Sword", hint: "cobweb" },
    { word: "Cake", hint: "milk" }
  ]
};

// ---- Game state ---------------------------------------------------
let state = {
  numPlayers: 4,
  numImposters: 1,
  names: [],        // player names
  selectedCategories: new Set(Object.keys(WORD_LISTS)), // all on by default
  roles: [],        // boolean[] — true = imposter
  category: "",
  word: "",
  hint: "",
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

// ---- Category selection screen ------------------------------------
function showCategoriesScreen() {
  const list = $("#category-list");
  list.innerHTML = "";
  Object.keys(WORD_LISTS).forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-toggle" + (state.selectedCategories.has(cat) ? " selected" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      if (state.selectedCategories.has(cat)) {
        // don't allow deselecting the last one
        if (state.selectedCategories.size > 1) {
          state.selectedCategories.delete(cat);
          btn.classList.remove("selected");
        }
      } else {
        state.selectedCategories.add(cat);
        btn.classList.add("selected");
      }
    });
    list.appendChild(btn);
  });
  showScreen("categories");
}

// ---- Role assignment ----------------------------------------------
function assignRoles() {
  const cats = [...state.selectedCategories];
  state.category = pick(cats);
  const entry = pick(WORD_LISTS[state.category]);
  state.word = entry.word;
  state.hint = entry.hint;

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
        <p class="role-detail">Hint: <strong>${state.hint}</strong></p>
        <p class="role-detail">You do NOT know the word. Bluff!</p>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="role-card civilian">
        <div class="role-emoji">\u{1f60a}</div>
        <div class="role-label">CIVILIAN</div>
        <p class="role-name">${name}</p>
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

$("#btn-categories").addEventListener("click", () => {
  collectNames();
  showCategoriesScreen();
});

$("#btn-play").addEventListener("click", () => {
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

// ---- Check roles screen -------------------------------------------
$("#btn-check-roles").addEventListener("click", () => {
  const list = $("#check-list");
  list.innerHTML = "";
  for (let i = 0; i < state.numPlayers; i++) {
    const btn = document.createElement("button");
    btn.className = "check-player-btn";
    btn.textContent = getName(i);
    btn.addEventListener("click", () => showCheckRole(i));
    list.appendChild(btn);
  }
  showScreen("check");
});

function showCheckRole(index) {
  const isImposter = state.roles[index];
  const name = getName(index);
  const content = $("#check-role-content");

  if (isImposter) {
    content.innerHTML = `
      <div class="role-card imposter">
        <div class="role-emoji">\u{1f575}\u{fe0f}</div>
        <div class="role-label">IMPOSTER</div>
        <p class="role-name">${name}</p>
        <p class="role-detail">Hint: <strong>${state.hint}</strong></p>
        <p class="role-detail">You do NOT know the word. Bluff!</p>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="role-card civilian">
        <div class="role-emoji">\u{1f60a}</div>
        <div class="role-label">CIVILIAN</div>
        <p class="role-name">${name}</p>
        <div class="role-word">${state.word}</div>
      </div>`;
  }
  showScreen("check-role");
}

$("#btn-back-check").addEventListener("click", () => showScreen("check"));
$("#btn-back-game").addEventListener("click", () => showScreen("start-player"));

// ---- Service worker registration ----------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
