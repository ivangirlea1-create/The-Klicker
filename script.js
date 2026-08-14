let game = {
  coins: 0,
  totalCoins: 0,
  clicks: 0,

  level: 1,
  xp: 0,

  perClick: 1,
  perSecond: 0,

  critChance: 5,

  clickCost: 25,
  autoCost: 100,
  critCost: 500,
  superCost: 2500,

  combo: 0,
  achievements: []
};

const $ = id => document.getElementById(id);

function formatNumber(number) {
  if (number < 1000) {
    return Math.floor(number).toLocaleString("ru-RU");
  }

  if (number < 1000000) {
    return (number / 1000).toFixed(1) + "K";
  }

  if (number < 1000000000) {
    return (number / 1000000).toFixed(2) + "M";
  }

  if (number < 1000000000000) {
    return (number / 1000000000).toFixed(2) + "B";
  }

  return (number / 1000000000000).toFixed(2) + "T";
}

function update() {

  $("coins").textContent = formatNumber(game.coins);
  $("level").textContent = game.level;
  $("perClick").textContent = formatNumber(game.perClick);
  $("perSecond").textContent = formatNumber(game.perSecond);
  $("critChance").textContent = game.critChance + "%";

  $("clickCost").textContent = formatNumber(game.clickCost);
  $("autoCost").textContent = formatNumber(game.autoCost);
  $("critCost").textContent = formatNumber(game.critCost);
  $("superCost").textContent = formatNumber(game.superCost);

  let neededXP = game.level * 100;

  $("xpText").textContent =
    `${Math.floor(game.xp)} / ${neededXP}`;

  $("xpBar").style.width =
    Math.min(100, (game.xp / neededXP) * 100) + "%";

  $("clickUpgrade").disabled =
    game.coins < game.clickCost;

  $("autoUpgrade").disabled =
    game.coins < game.autoCost;

  $("critUpgrade").disabled =
    game.coins < game.critCost || game.critChance >= 50;

  $("superUpgrade").disabled =
    game.coins < game.superCost;

  $("combo").textContent =
    "🔥 Комбо: " + game.combo;
}

function addXP(amount) {

  game.xp += amount;

  while (game.xp >= game.level * 100) {

    game.xp -= game.level * 100;
    game.level++;

    game.coins += game.level * 50;

    showFloat(
      "+" + (game.level * 50) + " 💰",
      window.innerWidth / 2,
      150
    );
  }
}

function showFloat(text, x, y) {

  const el = document.createElement("div");

  el.className = "float";
  el.textContent = text;

  el.style.left = x + "px";
  el.style.top = y + "px";

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 800);
}

function clickMoney(event) {

  game.clicks++;

  let reward = game.perClick;

  game.combo++;

  if (game.combo > 50) {
    reward *= 3;
  } else if (game.combo > 20) {
    reward *= 2;
  }

  const critical =
    Math.random() * 100 < game.critChance;

  if (critical) {
    reward *= 5;

    showFloat(
      "💥 CRITICAL +" + formatNumber(reward),
      event.clientX,
      event.clientY
    );
  } else {

    showFloat(
      "+" + formatNumber(reward) + " 💰",
      event.clientX,
      event.clientY
    );
  }

  game.coins += reward;
  game.totalCoins += reward;

  addXP(2);

  update();
  checkAchievements();
}

$("clickButton").addEventListener("click", clickMoney);

$("clickUpgrade").addEventListener("click", () => {

  if (game.coins < game.clickCost) return;

  game.coins -= game.clickCost;

  game.perClick++;

  game.clickCost =
    Math.floor(game.clickCost * 1.35);

  update();
});

$("autoUpgrade").addEventListener("click", () => {

  if (game.coins < game.autoCost) return;

  game.coins -= game.autoCost;

  game.perSecond++;

  game.autoCost =
    Math.floor(game.autoCost * 1.45);

  update();
});

$("critUpgrade").addEventListener("click", () => {

  if (
    game.coins < game.critCost ||
    game.critChance >= 50
  ) return;

  game.coins -= game.critCost;

  game.critChance += 5;

  game.critCost =
    Math.floor(game.critCost * 2);

  update();
});

$("superUpgrade").addEventListener("click", () => {

  if (game.coins < game.superCost) return;

  game.coins -= game.superCost;

  game.perClick += 10;

  game.superCost =
    Math.floor(game.superCost * 1.8);

  update();
});

setInterval(() => {

  if (game.perSecond > 0) {

    game.coins += game.perSecond;
    game.totalCoins += game.perSecond;

    addXP(game.perSecond / 2);
  }

  update();
  checkAchievements();

}, 1000);

let comboTimer;

$("clickButton").addEventListener("click", () => {

  clearTimeout(comboTimer);

  comboTimer = setTimeout(() => {
    game.combo = 0;
    update();
  }, 2000);

});

function unlock(id) {

  if (game.achievements.includes(id)) return;

  game.achievements.push(id);

  $(id).classList.add("unlocked");

  showFloat(
    "🏆 ДОСТИЖЕНИЕ!",
    window.innerWidth / 2 - 70,
    100
  );
}

function checkAchievements() {

  if (game.clicks >= 1) {
    unlock("ach1");
  }

  if (game.totalCoins >= 1000) {
    unlock("ach2");
  }

  if (game.totalCoins >= 1000000) {
    unlock("ach3");
  }

  if (game.clicks >= 1000) {
    unlock("ach4");
  }
}

function saveGame() {

  localStorage.setItem(
    "megaClickerSave",
    JSON.stringify(game)
  );

  showFloat(
    "💾 Сохранено!",
    window.innerWidth / 2,
    120
  );
}

function loadGame() {

  const save =
    localStorage.getItem("megaClickerSave");

  if (!save) return;

  try {

    game = JSON.parse(save);

    game.achievements.forEach(id => {
      if ($(id)) {
        $(id).classList.add("unlocked");
      }
    });

  } catch (error) {

    console.log("Ошибка загрузки");

  }

  update();
}

$("save").addEventListener("click", saveGame);

$("reset").addEventListener("click", () => {

  const answer =
    confirm("Точно удалить весь прогресс?");

  if (!answer) return;

  localStorage.removeItem("megaClickerSave");

  location.reload();
});

setInterval(saveGame, 10000);

loadGame();
update();
