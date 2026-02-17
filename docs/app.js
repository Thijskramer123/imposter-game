/* ================================================================
   Who is the Imposter? — Progressive Web App
   ================================================================ */

// ---- Word lists with hints (10+ per category) --------------------
const WORD_LISTS = {
  Animals: [
    { word: "Elephant", hint: "Biggest land animal" },
    { word: "Penguin", hint: "Waddles on ice" },
    { word: "Giraffe", hint: "Tallest living animal" },
    { word: "Dolphin", hint: "Smart swimmer with a blowhole" },
    { word: "Chameleon", hint: "Changes its appearance" },
    { word: "Kangaroo", hint: "Carries babies in a pouch" },
    { word: "Octopus", hint: "Eight arms in the ocean" },
    { word: "Flamingo", hint: "Stands on one leg, pink" },
    { word: "Hedgehog", hint: "Curls into a spiky ball" },
    { word: "Panther", hint: "Stealthy big cat in the dark" },
    { word: "Koala", hint: "Sleeps in eucalyptus trees" },
    { word: "Cheetah", hint: "Fastest runner on land" }
  ],
  Food: [
    { word: "Sushi", hint: "Raw fish on rice" },
    { word: "Pancake", hint: "Flat, fluffy breakfast" },
    { word: "Burrito", hint: "Wrapped in a tortilla" },
    { word: "Croissant", hint: "Buttery French pastry" },
    { word: "Dumpling", hint: "Stuffed dough pocket" },
    { word: "Lasagna", hint: "Layered pasta bake" },
    { word: "Pretzel", hint: "Twisted and salted" },
    { word: "Waffle", hint: "Grid-patterned breakfast" },
    { word: "Tiramisu", hint: "Italian coffee dessert" },
    { word: "Falafel", hint: "Fried chickpea balls" },
    { word: "Ramen", hint: "Japanese noodle soup" },
    { word: "Guacamole", hint: "Mashed green dip" }
  ],
  Sports: [
    { word: "Basketball", hint: "Shoot through a hoop" },
    { word: "Cricket", hint: "Bat, ball, and wickets" },
    { word: "Fencing", hint: "Sword fighting sport" },
    { word: "Surfing", hint: "Riding ocean waves" },
    { word: "Archery", hint: "Bow and arrow target" },
    { word: "Badminton", hint: "Hit a shuttlecock over a net" },
    { word: "Hockey", hint: "Puck on ice" },
    { word: "Volleyball", hint: "Hit the ball over the net" },
    { word: "Gymnastics", hint: "Flips and balance beams" },
    { word: "Boxing", hint: "Punch with gloves in a ring" },
    { word: "Rowing", hint: "Oars in the water" },
    { word: "Skateboarding", hint: "Tricks on four wheels" }
  ],
  Places: [
    { word: "Library", hint: "Quiet place full of books" },
    { word: "Volcano", hint: "Mountain that erupts" },
    { word: "Lighthouse", hint: "Guides ships at night" },
    { word: "Castle", hint: "Kings and queens lived here" },
    { word: "Aquarium", hint: "Fish behind glass" },
    { word: "Pyramid", hint: "Ancient triangular tomb" },
    { word: "Rainforest", hint: "Dense tropical jungle" },
    { word: "Glacier", hint: "Massive slow-moving ice" },
    { word: "Colosseum", hint: "Ancient Roman arena" },
    { word: "Waterfall", hint: "Water plunging off a cliff" },
    { word: "Carnival", hint: "Rides, games, and cotton candy" },
    { word: "Observatory", hint: "Watch the stars from here" }
  ],
  Movies: [
    { word: "Inception", hint: "Dreams within dreams" },
    { word: "Titanic", hint: "Ship hits an iceberg" },
    { word: "Jaws", hint: "Deadly shark at the beach" },
    { word: "Frozen", hint: "Let it go, ice queen" },
    { word: "Gladiator", hint: "Fighting in ancient Rome" },
    { word: "Shrek", hint: "Green ogre in a swamp" },
    { word: "Psycho", hint: "Scary motel shower scene" },
    { word: "Avatar", hint: "Blue aliens on Pandora" },
    { word: "Ratatouille", hint: "A rat that cooks" },
    { word: "Interstellar", hint: "Space travel through a wormhole" },
    { word: "Rocky", hint: "Underdog boxer from Philly" },
    { word: "Bambi", hint: "Young deer in the forest" }
  ],
  Occupations: [
    { word: "Astronaut", hint: "Works in outer space" },
    { word: "Detective", hint: "Solves crimes and mysteries" },
    { word: "Blacksmith", hint: "Forges metal with fire" },
    { word: "Pilot", hint: "Flies planes in the sky" },
    { word: "Surgeon", hint: "Operates in a hospital" },
    { word: "Librarian", hint: "Organizes books for a living" },
    { word: "Magician", hint: "Performs tricks and illusions" },
    { word: "Firefighter", hint: "Puts out blazes" },
    { word: "Archaeologist", hint: "Digs up ancient artifacts" },
    { word: "Chef", hint: "Cooks in a restaurant kitchen" },
    { word: "Electrician", hint: "Works with wires and circuits" },
    { word: "Journalist", hint: "Writes the news" }
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
        <p class="role-detail">You do NOT know the word. Bluff!</p>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="role-card civilian">
        <div class="role-emoji">\u{1f60a}</div>
        <div class="role-label">CIVILIAN</div>
        <p class="role-name">${name}</p>
        <p class="role-detail">Hint: <strong>${state.hint}</strong></p>
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

// ---- Service worker registration ----------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
