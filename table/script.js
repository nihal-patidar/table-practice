/* =========================
   STATE MANAGEMENT
========================= */
let num1, num2;
let mode = "random";
let min = 2, max = 20;
let fixedTable = null;

let stats = JSON.parse(localStorage.getItem("stats")) || {};
let startTime = null;

/* =========================
   DOM
========================= */
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const keyboard = document.getElementById("keyboard");
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const weakList = document.getElementById("weakList");

/* =========================
   MENU TOGGLE
========================= */
menuBtn.onclick = () => {
  menuPanel.classList.toggle("hidden");
};

/* =========================
   QUESTION GENERATION
========================= */
function getRandom(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function generateQuestion() {
  if (mode === "single") num1 = fixedTable;
  else num1 = getRandom(min, max);

  // avoid 1 & 10
  num2 = getRandom(2, 9);

  questionEl.innerText = `${num1} × ${num2}`;
  answerInput.value = "";

  startTime = Date.now();
}

/* =========================
   ANSWER CHECK + DELAY
========================= */
function checkAnswer() {
  const correct = num1 * num2;

  if (parseInt(answerInput.value) === correct) {

    // calculate time
    let timeTaken = Date.now() - startTime;

    updateStats(num1, timeTaken);

    answerInput.style.background = "#22c55e";

    setTimeout(() => {
      answerInput.style.background = "white";
      generateQuestion();
    }, 400);
  }
}

/* =========================
   STATS SYSTEM (OPTIMIZED)
========================= */
function updateStats(table, time) {
  if (!stats[table]) {
    stats[table] = { count: 0, slow: 0 };
  }

  stats[table].count++;

  if (time > 2000) {
    stats[table].slow++;
  }

  // immediate localStorage save (optimized small object)
  localStorage.setItem("stats", JSON.stringify(stats));

  renderWeakTables();
}

/* =========================
   WEAK TABLE DETECTION
========================= */
function getWeakTables() {
  let weak = [];

  for (let key in stats) {
    let s = stats[key];

    if (s.slow / s.count > 0.4) {
      weak.push(key);
    }
  }

  return weak;
}

function renderWeakTables() {
  weakList.innerHTML = "";

  let weak = getWeakTables();

  weak.forEach(t => {
    let div = document.createElement("div");
    div.className = "weak-item";
    div.innerText = t;

    div.onclick = () => {
      fixedTable = parseInt(t);
      mode = "single";
      generateQuestion();
    };

    weakList.appendChild(div);
  });
}

/* =========================
   RANGE / SINGLE MODE
========================= */
document.getElementById("rangeBtn").onclick = () => {
  let minVal = parseInt(document.getElementById("minTable").value);
  let maxVal = parseInt(document.getElementById("maxTable").value);

  if (isNaN(minVal) || isNaN(maxVal) || minVal > maxVal) {
    alert("Invalid range");
    return;
  }

  min = minVal;
  max = maxVal;
  mode = "range";

  generateQuestion();
};

document.getElementById("singleBtn").onclick = () => {
  let val = parseInt(document.getElementById("singleTable").value);

  if (isNaN(val)) return;

  fixedTable = val;
  mode = "single";

  generateQuestion();
};

/* =========================
   KEYBOARD
========================= */
function createKey(num) {
  let key = document.createElement("div");
  key.className = "key";
  key.innerText = num;

  key.onclick = () => {
    answerInput.value += num;
    checkAnswer();
  };

  keyboard.appendChild(key);
}

for (let i = 1; i <= 9; i++) createKey(i);
createKey(0);

// delete
let del = document.createElement("div");
del.className = "key";
del.innerText = "⌫";
del.onclick = () => {
  answerInput.value = answerInput.value.slice(0, -1);
};
keyboard.appendChild(del);

/* =========================
   INIT
========================= */
renderWeakTables();
generateQuestion();