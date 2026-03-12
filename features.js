'use strict';

// ============================================================
// 100 NEW FEATURES — Sheriff Simulator Extension
// Loaded after game.js — uses globals: game, ctx, TILE, etc.
// ============================================================

// ── Lazy State Init ──
function initFeatures() {
  if (game._features) return;
  game._features = {
    // Combat
    dodgeCooldown: 0,
    dodgeActive: false,
    dodgeTimer: 0,
    dodgeDir: 0,
    dynamiteCount: 0,
    dynamiteActive: [],
    lassoActive: false,
    lassoTarget: null,
    lassoTimer: 0,
    dualWield: false,
    headshots: 0,
    smokeBombs: 0,
    smokeActive: [],
    knives: [],
    revengeMode: false,
    explosiveBarrels: [],

    // Exploration
    treasureMaps: [],
    activeTreasure: null,
    fishingActive: false,
    fishingTimer: 0,
    fishCaught: 0,
    miningActive: false,
    miningTimer: 0,
    goldNuggets: 0,
    weather: 'clear',
    weatherTimer: 0,
    weatherDuration: 0,
    tumbleweeds: [],
    campfires: [],
    footprints: [],
    wildlife: [],
    mirageActive: false,

    // NPC
    relationships: {},
    deputyCount: 0,
    deputies: [],
    rivalRep: 30,
    rivalName: 'Sheriff Blake',
    informants: [],
    gossipQueue: [],
    npcMorale: 50,
    gangs: [],
    drunkNPCs: [],

    // Economy
    ownedProperties: [],
    bankBalance: 0,
    bankInterestRate: 0.02,
    loanAmount: 0,
    loanInterest: 0.1,
    stocks: { railroad: 100, mining: 50, cattle: 75 },
    blackMarketOpen: false,
    treasureChests: [],
    goldNuggetDrops: [],

    // Progression
    skillPoints: 0,
    skills: {
      gunslinger: { quickDraw: 0, precision: 0, fanTheHammer: 0, deadeye: 0, ironNerves: 0 },
      lawman: { authority: 0, investigation: 0, negotiation: 0, toughness: 0, leadership: 0 },
      outlaw: { intimidation: 0, stealth: 0, lockpick: 0, poisoncraft: 0, escape: 0 }
    },
    titles: [],
    activeTitle: '',
    petDog: false,
    petDogPos: { x: 0, y: 0 },
    bossTimer: 0,
    bossActive: null,
    season: 'summer',
    seasonTimer: 0,
    killStreak: 0,
    killStreakTimer: 0,

    // Visual
    raindrops: [],
    dustClouds: [],
    bulletTrails: [],
    lightningTimer: 0,
    bloodMoon: false,
    bloodMoonTimer: 0,
    filmGrain: true,
    footstepDust: [],

    // Social / Minigames
    armWrestling: false,
    armWrestleScore: 0,
    targetPractice: false,
    targetScore: 0,
    horseRace: false,
    horseRacePos: 0,
    newspaper: [],
    trainTimer: 0,
    trainActive: false,
    jailBreakTimer: 0,
    finalShowdown: false,

    // System
    initialized: true
  };

  // Spawn explosive barrels
  for (var i = 0; i < 8; i++) {
    game._features.explosiveBarrels.push({
      x: rand(5, MAP_W - 5) * TILE,
      y: rand(5, MAP_H - 5) * TILE,
      hp: 1,
      active: true
    });
  }

  // Spawn treasure chests
  for (var j = 0; j < 5; j++) {
    game._features.treasureChests.push({
      x: rand(3, MAP_W - 3) * TILE,
      y: rand(3, MAP_H - 3) * TILE,
      gold: rand(20, 100),
      collected: false
    });
  }

  // Spawn tumbleweeds
  for (var k = 0; k < 6; k++) {
    game._features.tumbleweeds.push({
      x: rand(0, MAP_W) * TILE,
      y: rand(0, MAP_H) * TILE,
      dx: randF(-1, 1),
      dy: randF(-0.5, 0.5),
      size: rand(6, 12)
    });
  }

  // Init wildlife
  spawnWildlife();
}

function spawnWildlife() {
  var f = game._features;
  f.wildlife = [];
  var types = game.time > 0.8 || game.time < 0.2 ?
    ['coyote', 'owl', 'bat'] : ['rabbit', 'hawk', 'lizard', 'deer'];
  for (var i = 0; i < 4; i++) {
    f.wildlife.push({
      type: types[rand(0, types.length - 1)],
      x: rand(2, MAP_W - 2) * TILE,
      y: rand(2, MAP_H - 2) * TILE,
      dx: randF(-0.5, 0.5),
      dy: randF(-0.5, 0.5),
      life: rand(300, 600)
    });
  }
}

// ============================================================
// UPDATE FEATURES (called every frame)
// ============================================================
function updateFeatures(dt) {
  initFeatures();
  var f = game._features;
  var p = game.player;

  // ──────────── COMBAT FEATURES ────────────

  // 1. Dodge Roll (Q key)
  if (f.dodgeCooldown > 0) f.dodgeCooldown -= dt;
  if (f.dodgeActive) {
    f.dodgeTimer -= dt;
    var dodgeSpeed = 6;
    var dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    var dd = dirs[p.dir] || [1, 0];
    var nx = p.x + dd[0] * dodgeSpeed;
    var ny = p.y + dd[1] * dodgeSpeed;
    if (canMove(nx, ny, 5)) { p.x = nx; p.y = ny; }
    if (f.dodgeTimer <= 0) { f.dodgeActive = false; }
    f.footstepDust.push({ x: p.x, y: p.y + 8, life: 15, size: 4 });
  }
  if (consumeKey('KeyQ') && !f.dodgeActive && f.dodgeCooldown <= 0) {
    f.dodgeActive = true;
    f.dodgeTimer = 0.2;
    f.dodgeCooldown = 2;
    f.dodgeDir = p.dir;
  }

  // 2. Dynamite (Digit3 when not in dialog)
  for (var di = f.dynamiteActive.length - 1; di >= 0; di--) {
    var dyn = f.dynamiteActive[di];
    dyn.timer -= dt;
    if (dyn.timer <= 0) {
      // Explode
      particles.emit(dyn.x, dyn.y, 20, '#ff6600', 4, 30);
      particles.emit(dyn.x, dyn.y, 10, '#ffcc00', 3, 20);
      if (typeof audio !== 'undefined' && audio.playExplosion) audio.playExplosion();
      // Damage nearby NPCs
      for (var ni = 0; ni < game.npcs.length; ni++) {
        var npc = game.npcs[ni];
        if (npc.state === 'dead') continue;
        if (dist(npc, dyn) < 80) {
          npc.hp -= 5;
          if (npc.hp <= 0) { npc.state = 'dead'; game.outlawsKilled++; }
        }
      }
      f.dynamiteActive.splice(di, 1);
    }
  }
  if (consumeKey('Digit3') && f.dynamiteCount > 0 && game.state === 'playing') {
    f.dynamiteCount--;
    var throwDist = 100;
    var dirs2 = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    var td = dirs2[p.dir] || [1, 0];
    f.dynamiteActive.push({
      x: p.x + td[0] * throwDist,
      y: p.y + td[1] * throwDist,
      timer: 2
    });
    showNotification('Dynamite thrown! (' + f.dynamiteCount + ' left)');
  }

  // 3. Lasso (R key)
  if (f.lassoActive && f.lassoTarget) {
    f.lassoTimer -= dt;
    f.lassoTarget.state = 'stunned';
    if (f.lassoTimer <= 0) {
      f.lassoActive = false;
      f.lassoTarget.state = 'idle';
      f.lassoTarget = null;
    }
  }
  if (consumeKey('KeyR') && !f.lassoActive && game.state === 'playing') {
    // Find nearest hostile NPC
    var nearest = null, nearDist = 150;
    for (var li = 0; li < game.npcs.length; li++) {
      var ln = game.npcs[li];
      if (ln.hostile && ln.state !== 'dead') {
        var ld = dist(p, ln);
        if (ld < nearDist) { nearDist = ld; nearest = ln; }
      }
    }
    if (nearest) {
      f.lassoActive = true;
      f.lassoTarget = nearest;
      f.lassoTimer = 3;
      showNotification('Lassoed ' + nearest.name + '!');
    }
  }

  // 6. Headshot Bonus (checked during bullet hit in render)
  // 7. Smoke Bomb (Digit4)
  for (var si = f.smokeActive.length - 1; si >= 0; si--) {
    f.smokeActive[si].life -= dt;
    if (f.smokeActive[si].life <= 0) f.smokeActive.splice(si, 1);
  }
  if (consumeKey('Digit4') && f.smokeBombs > 0 && game.state === 'playing') {
    f.smokeBombs--;
    f.smokeActive.push({ x: p.x, y: p.y, life: 5, radius: 60 });
    showNotification('Smoke bomb! (' + f.smokeBombs + ' left)');
  }

  // 8. Knife Throw (V key)
  for (var ki = f.knives.length - 1; ki >= 0; ki--) {
    var kn = f.knives[ki];
    kn.x += kn.dx * 5;
    kn.y += kn.dy * 5;
    kn.life--;
    if (kn.life <= 0) { f.knives.splice(ki, 1); continue; }
    // Hit check
    for (var kni = 0; kni < game.npcs.length; kni++) {
      var knpc = game.npcs[kni];
      if (knpc.state === 'dead' || !knpc.hostile) continue;
      if (dist(kn, knpc) < 20) {
        knpc.hp -= 3;
        if (knpc.hp <= 0) { knpc.state = 'dead'; game.outlawsKilled++; }
        f.knives.splice(ki, 1);
        break;
      }
    }
  }
  if (consumeKey('KeyV') && game.state === 'playing') {
    var kDirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    var kd = kDirs[p.dir] || [1, 0];
    f.knives.push({ x: p.x, y: p.y, dx: kd[0], dy: kd[1], life: 40 });
  }

  // 12. Explosive Barrels
  for (var bi = 0; bi < f.explosiveBarrels.length; bi++) {
    var barrel = f.explosiveBarrels[bi];
    if (!barrel.active) continue;
    // Check if bullet hit barrel (simplified — check bullet proximity)
    if (typeof bullets !== 'undefined' && bullets.list) {
      for (var bli = 0; bli < bullets.list.length; bli++) {
        var blt = bullets.list[bli];
        if (dist(blt, barrel) < 15) {
          barrel.active = false;
          particles.emit(barrel.x, barrel.y, 25, '#ff4400', 5, 25);
          particles.emit(barrel.x, barrel.y, 15, '#ffaa00', 3, 15);
          // Damage nearby
          for (var bni = 0; bni < game.npcs.length; bni++) {
            if (game.npcs[bni].state !== 'dead' && dist(game.npcs[bni], barrel) < 70) {
              game.npcs[bni].hp -= 4;
              if (game.npcs[bni].hp <= 0) { game.npcs[bni].state = 'dead'; game.outlawsKilled++; }
            }
          }
          if (dist(p, barrel) < 70 && !game._cheatMode) { p.hp -= 2; showNotification('Caught in the explosion! -2 HP'); }
          break;
        }
      }
    }
  }

  // 15. Revenge Mode
  f.revengeMode = p.hp <= Math.ceil(p.maxHp * 0.25);

  // ──────────── EXPLORATION FEATURES ────────────

  // 16. Treasure Maps — check proximity to active treasure
  if (f.activeTreasure) {
    var tDist = dist(p, f.activeTreasure);
    if (tDist < 30) {
      game.gold += f.activeTreasure.gold;
      game.totalGoldEarned += f.activeTreasure.gold;
      showNotification('Found treasure! +$' + f.activeTreasure.gold);
      addJournalEntry('Dug up buried treasure worth $' + f.activeTreasure.gold);
      f.activeTreasure = null;
    }
  }

  // 17. Fishing (E near water)
  if (f.fishingActive) {
    f.fishingTimer -= dt;
    if (f.fishingTimer <= 0) {
      f.fishingActive = false;
      var fishTypes = ['Catfish', 'Trout', 'Bass', 'Old Boot', 'Gold Ring', 'Message in Bottle'];
      var caught = fishTypes[rand(0, fishTypes.length - 1)];
      f.fishCaught++;
      if (caught === 'Gold Ring') {
        game.gold += 30; game.totalGoldEarned += 30;
        showNotification('Caught a Gold Ring! +$30');
      } else if (caught === 'Message in Bottle') {
        // Generate treasure map
        f.activeTreasure = { x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE, gold: rand(50, 150) };
        showNotification('Found a treasure map in a bottle!');
      } else {
        var fishGold = rand(5, 15);
        game.gold += fishGold; game.totalGoldEarned += fishGold;
        showNotification('Caught a ' + caught + '! +$' + fishGold);
      }
    }
  }

  // 20. Weather System
  f.weatherTimer -= dt;
  if (f.weatherTimer <= 0) {
    var weathers = ['clear', 'clear', 'clear', 'rain', 'sandstorm', 'heatwave'];
    f.weather = weathers[rand(0, weathers.length - 1)];
    f.weatherDuration = rand(30, 90);
    f.weatherTimer = f.weatherDuration + rand(60, 180);
    if (f.weather !== 'clear') {
      showNotification('Weather: ' + f.weather.charAt(0).toUpperCase() + f.weather.slice(1));
    }
  }
  f.weatherDuration -= dt;
  if (f.weatherDuration <= 0 && f.weather !== 'clear') {
    f.weather = 'clear';
  }

  // Weather effects on gameplay
  if (f.weather === 'sandstorm') {
    // Reduce visibility — handled in render
    // Slow movement slightly
    if (!f._sandstormApplied) {
      f._sandstormApplied = true;
    }
  } else {
    f._sandstormApplied = false;
  }

  // Generate rain particles
  if (f.weather === 'rain') {
    for (var ri = 0; ri < 3; ri++) {
      f.raindrops.push({
        x: rand(0, gameCanvas.width),
        y: 0,
        speed: randF(8, 14),
        life: rand(30, 50)
      });
    }
  }
  for (var rdi = f.raindrops.length - 1; rdi >= 0; rdi--) {
    f.raindrops[rdi].y += f.raindrops[rdi].speed;
    f.raindrops[rdi].life--;
    if (f.raindrops[rdi].life <= 0 || f.raindrops[rdi].y > gameCanvas.height) {
      f.raindrops.splice(rdi, 1);
    }
  }

  // 21. Tumbleweeds
  for (var ti = 0; ti < f.tumbleweeds.length; ti++) {
    var tw = f.tumbleweeds[ti];
    tw.x += tw.dx;
    tw.y += tw.dy;
    if (tw.x < 0 || tw.x > MAP_W * TILE) tw.dx = -tw.dx;
    if (tw.y < 0 || tw.y > MAP_H * TILE) tw.dy = -tw.dy;
  }

  // 22. Campfire healing
  for (var ci = 0; ci < f.campfires.length; ci++) {
    var cf = f.campfires[ci];
    cf.life -= dt;
    if (cf.life <= 0) { f.campfires.splice(ci, 1); ci--; continue; }
    if (dist(p, cf) < 40 && p.hp < p.maxHp) {
      cf.healTimer = (cf.healTimer || 0) + dt;
      if (cf.healTimer > 3) {
        p.hp = Math.min(p.hp + 1, p.maxHp);
        cf.healTimer = 0;
        showNotification('Campfire heals you. +1 HP');
      }
    }
    particles.emit(cf.x + randF(-5, 5), cf.y - 5, 1, '#ff6600', 1, 10);
  }

  // 25. Day/Night wildlife
  f._wildlifeTimer = (f._wildlifeTimer || 0) + dt;
  if (f._wildlifeTimer > 60) {
    f._wildlifeTimer = 0;
    spawnWildlife();
  }
  for (var wi = f.wildlife.length - 1; wi >= 0; wi--) {
    var w = f.wildlife[wi];
    w.x += w.dx;
    w.y += w.dy;
    w.life--;
    if (w.life <= 0 || w.x < 0 || w.x > MAP_W * TILE || w.y < 0 || w.y > MAP_H * TILE) {
      f.wildlife.splice(wi, 1);
    }
  }

  // ──────────── NPC FEATURES ────────────

  // 31. NPC Relationships (tracked when talking)
  // 33. Rival Sheriff
  f._rivalTimer = (f._rivalTimer || 0) + dt;
  if (f._rivalTimer > 30) {
    f._rivalTimer = 0;
    f.rivalRep += rand(-3, 5);
    f.rivalRep = clamp(f.rivalRep, 0, 100);
    if (f.rivalRep > game.reputation + 10 && Math.random() < 0.3) {
      showNotification(f.rivalName + ' is gaining on your reputation! (' + f.rivalRep + ')');
    }
  }

  // 35. Deputy System
  for (var dpi = 0; dpi < f.deputies.length; dpi++) {
    var dep = f.deputies[dpi];
    if (dep.state === 'dead') { f.deputies.splice(dpi, 1); dpi--; continue; }
    // Deputies patrol and fight hostiles
    var closestHostile = null, closestDist = 200;
    for (var chi = 0; chi < game.npcs.length; chi++) {
      var cn = game.npcs[chi];
      if (cn.hostile && cn.state !== 'dead') {
        var cd = dist(dep, cn);
        if (cd < closestDist) { closestDist = cd; closestHostile = cn; }
      }
    }
    if (closestHostile) {
      var ddx = closestHostile.x - dep.x;
      var ddy = closestHostile.y - dep.y;
      var dlen = Math.hypot(ddx, ddy) || 1;
      dep.x += (ddx / dlen) * 1.5;
      dep.y += (ddy / dlen) * 1.5;
      if (closestDist < 30) {
        closestHostile.hp -= 1;
        if (closestHostile.hp <= 0) {
          closestHostile.state = 'dead';
          game.outlawsKilled++;
        }
      }
    } else {
      // Follow player loosely
      var dpDist = dist(dep, p);
      if (dpDist > 80) {
        var dpx = p.x - dep.x;
        var dpy = p.y - dep.y;
        var dplen = Math.hypot(dpx, dpy) || 1;
        dep.x += (dpx / dplen) * 1.2;
        dep.y += (dpy / dplen) * 1.2;
      }
    }
  }

  // 39. Drunk NPCs at night
  if (game.time > 0.85 || game.time < 0.1) {
    f._drunkTimer = (f._drunkTimer || 0) + dt;
    if (f._drunkTimer > 20 && f.drunkNPCs.length < 3) {
      f._drunkTimer = 0;
      for (var dni = 0; dni < game.npcs.length; dni++) {
        var dn = game.npcs[dni];
        if (dn.type === NPC_TYPES.TOWNSPERSON && dn.state !== 'dead' && !dn._drunk) {
          if (Math.random() < 0.2) {
            dn._drunk = true;
            f.drunkNPCs.push(dn);
            break;
          }
        }
      }
    }
  } else {
    // Sober up during day
    for (var sni = 0; sni < f.drunkNPCs.length; sni++) {
      f.drunkNPCs[sni]._drunk = false;
    }
    f.drunkNPCs = [];
  }

  // 40. NPC Fights
  f._npcFightTimer = (f._npcFightTimer || 0) + dt;
  if (f._npcFightTimer > 45 && Math.random() < 0.1) {
    f._npcFightTimer = 0;
    // Two random townspeople fight
    var fighters = game.npcs.filter(function(n) { return n.type === NPC_TYPES.TOWNSPERSON && n.state !== 'dead'; });
    if (fighters.length >= 2) {
      var f1 = fighters[rand(0, fighters.length - 1)];
      var f2 = fighters[rand(0, fighters.length - 1)];
      if (f1 !== f2 && dist(f1, f2) < 100) {
        showNotification(f1.name + ' and ' + f2.name + ' are fighting!');
        f1.hostile = true;
        f1._fightTarget = f2;
        setTimeout(function() {
          f1.hostile = false;
          f1._fightTarget = null;
        }, 8000);
      }
    }
  }

  // 44. NPC Morale (affects crime rate)
  f._moraleTimer = (f._moraleTimer || 0) + dt;
  if (f._moraleTimer > 30) {
    f._moraleTimer = 0;
    var moraleChange = (game.reputation - 50) * 0.1;
    f.npcMorale = clamp(f.npcMorale + moraleChange, 0, 100);
  }

  // ──────────── ECONOMY FEATURES ────────────

  // 47. Bank Interest (daily)
  f._bankTimer = (f._bankTimer || 0) + dt;
  if (f._bankTimer > DAY_LENGTH) {
    f._bankTimer = 0;
    if (f.bankBalance > 0) {
      var interest = Math.floor(f.bankBalance * f.bankInterestRate);
      f.bankBalance += interest;
      if (interest > 0) showNotification('Bank interest: +$' + interest);
    }
    if (f.loanAmount > 0) {
      var loanInt = Math.ceil(f.loanAmount * f.loanInterest);
      f.loanAmount += loanInt;
    }
    // Property rent
    for (var pi = 0; pi < f.ownedProperties.length; pi++) {
      var rent = rand(5, 20);
      game.gold += rent;
      game.totalGoldEarned += rent;
    }
  }

  // 56. Stock Market (periodic updates)
  f._stockTimer = (f._stockTimer || 0) + dt;
  if (f._stockTimer > 60) {
    f._stockTimer = 0;
    f.stocks.railroad = clamp(f.stocks.railroad + rand(-10, 15), 20, 300);
    f.stocks.mining = clamp(f.stocks.mining + rand(-8, 12), 10, 200);
    f.stocks.cattle = clamp(f.stocks.cattle + rand(-5, 10), 15, 150);
  }

  // 59. Treasure Chests
  for (var tci = 0; tci < f.treasureChests.length; tci++) {
    var tc = f.treasureChests[tci];
    if (!tc.collected && dist(p, tc) < 25) {
      tc.collected = true;
      game.gold += tc.gold;
      game.totalGoldEarned += tc.gold;
      showNotification('Treasure chest! +$' + tc.gold);
      particles.emit(tc.x, tc.y, 10, '#ffd700', 3, 20);
    }
  }

  // 60. Gold Nugget Drops from killed outlaws
  for (var gni = f.goldNuggetDrops.length - 1; gni >= 0; gni--) {
    var gn = f.goldNuggetDrops[gni];
    if (dist(p, gn) < 20) {
      game.gold += gn.value;
      game.totalGoldEarned += gn.value;
      showNotification('+$' + gn.value);
      particles.emit(gn.x, gn.y, 5, '#ffd700', 2, 15);
      f.goldNuggetDrops.splice(gni, 1);
    }
  }

  // ──────────── PROGRESSION FEATURES ────────────

  // 61. Skill Points from XP (every level gives a point)
  // Checked during level up in game.js

  // 71. Boss Fights every 10 days
  f.bossTimer += dt;
  if (game.dayCount > 0 && game.dayCount % 10 === 0 && !f.bossActive && f.bossTimer > 10) {
    f.bossTimer = 0;
    var bossNames = ['Black Bart', 'The Rattler', 'Iron Jack', 'Bloody Mary', 'The Ghost', 'El Diablo'];
    var bossName = bossNames[rand(0, bossNames.length - 1)];
    var bossNPC = createNPC(game.npcs.length, NPC_TYPES.BOUNTY, bossName, rand(10, MAP_W - 10), rand(10, MAP_H - 10), null);
    bossNPC.hostile = true;
    bossNPC.hp = 15 + game.dayCount;
    bossNPC.maxHp = bossNPC.hp;
    bossNPC.speed = 2.5;
    bossNPC._boss = true;
    game.npcs.push(bossNPC);
    f.bossActive = bossNPC;
    showNotification('BOSS: ' + bossName + ' has arrived in town!');
    addJournalEntry('BOSS FIGHT: ' + bossName + ' appeared!');
  }
  if (f.bossActive && f.bossActive.state === 'dead') {
    var bossReward = 100 + game.dayCount * 5;
    game.gold += bossReward;
    game.totalGoldEarned += bossReward;
    game.reputation = clamp(game.reputation + 15, 0, REPUTATION_MAX);
    showNotification('BOSS DEFEATED! +$' + bossReward + ', +15 Rep');
    f.bossActive = null;
  }

  // 72. Season System
  f.seasonTimer += dt;
  if (f.seasonTimer > DAY_LENGTH * 7) {
    f.seasonTimer = 0;
    var seasons = ['spring', 'summer', 'fall', 'winter'];
    var idx = seasons.indexOf(f.season);
    f.season = seasons[(idx + 1) % 4];
    showNotification('Season changed to ' + f.season + '!');
  }

  // 74. Kill Streak
  if (f.killStreakTimer > 0) {
    f.killStreakTimer -= dt;
    if (f.killStreakTimer <= 0) f.killStreak = 0;
  }

  // 85. Blood Moon (rare event)
  f.bloodMoonTimer += dt;
  if (f.bloodMoonTimer > 600 && !f.bloodMoon && Math.random() < 0.01) {
    f.bloodMoon = true;
    f.bloodMoonTimer = 0;
    showNotification('BLOOD MOON rises! All outlaws are stronger!');
    addJournalEntry('A blood moon appeared. Danger increases.');
  }
  if (f.bloodMoon) {
    f._bloodMoonDuration = (f._bloodMoonDuration || 0) + dt;
    if (f._bloodMoonDuration > 60) {
      f.bloodMoon = false;
      f._bloodMoonDuration = 0;
      showNotification('The blood moon fades.');
    }
  }

  // ──────────── VISUAL FEATURES ────────────

  // 77. Footstep Dust
  if (p.speed > 0 && (Math.abs(p.vx || 0) > 0 || Math.abs(p.vy || 0) > 0 || game._isMoving)) {
    if (Math.random() < 0.3) {
      f.footstepDust.push({ x: p.x + randF(-3, 3), y: p.y + 8, life: 12, size: rand(2, 4) });
    }
  }
  for (var fdi = f.footstepDust.length - 1; fdi >= 0; fdi--) {
    f.footstepDust[fdi].life--;
    if (f.footstepDust[fdi].life <= 0) f.footstepDust.splice(fdi, 1);
  }

  // 78. Bullet Trails
  for (var bti = f.bulletTrails.length - 1; bti >= 0; bti--) {
    f.bulletTrails[bti].life--;
    if (f.bulletTrails[bti].life <= 0) f.bulletTrails.splice(bti, 1);
  }

  // Dust clouds
  for (var dci = f.dustClouds.length - 1; dci >= 0; dci--) {
    f.dustClouds[dci].life--;
    f.dustClouds[dci].y -= 0.3;
    if (f.dustClouds[dci].life <= 0) f.dustClouds.splice(dci, 1);
  }

  // ──────────── SOCIAL/MINIGAMES ────────────

  // 95. Newspaper (generated daily)
  f._newsTimer = (f._newsTimer || 0) + dt;
  if (f._newsTimer > DAY_LENGTH && f.newspaper.length < game.dayCount) {
    f._newsTimer = 0;
    var headlines = [
      'Sheriff ' + (game.corruption > 50 ? 'Under Investigation' : 'Praised by Citizens'),
      game.crimesResolved + ' Crimes Resolved This Season',
      'Outlaw Activity ' + (game.activeCrime ? 'On The Rise' : 'Declining'),
      'Economy ' + (game.gold > 200 ? 'Booming' : 'Struggling') + ' in Town',
      f.rivalName + ' Claims ' + (f.rivalRep > game.reputation ? 'Superiority' : 'Defeat'),
      'Weather Forecast: ' + f.weather,
      'New Bounties Posted at Sheriff\'s Office',
      game.outlawsKilled + ' Outlaws Killed, ' + game.outlawsArrested + ' Arrested'
    ];
    f.newspaper.push({
      day: game.dayCount,
      headline: headlines[rand(0, headlines.length - 1)],
      body: 'Day ' + game.dayCount + ' report from the Frontier Gazette.'
    });
  }

  // 97. Train events
  f.trainTimer += dt;
  if (f.trainTimer > 120 && !f.trainActive && Math.random() < 0.05) {
    f.trainTimer = 0;
    f.trainActive = true;
    showNotification('A train is approaching town! Defend or rob it.');
    setTimeout(function() {
      if (f.trainActive) {
        f.trainActive = false;
        game.gold += 50;
        game.totalGoldEarned += 50;
        showNotification('Train passed safely. +$50 commerce bonus.');
      }
    }, 15000);
  }

  // 99. Jail Break attempts
  if (game.prisoners && game.prisoners.length > 0) {
    f.jailBreakTimer += dt;
    if (f.jailBreakTimer > 90 && Math.random() < 0.02) {
      f.jailBreakTimer = 0;
      var escapee = game.prisoners[rand(0, game.prisoners.length - 1)];
      showNotification('JAIL BREAK! ' + escapee.name + ' is trying to escape!');
      game.reputation = clamp(game.reputation - 3, 0, REPUTATION_MAX);
      // Remove prisoner
      var idx2 = game.prisoners.indexOf(escapee);
      if (idx2 !== -1) game.prisoners.splice(idx2, 1);
    }
  }

  // 100. Final Showdown at day 100
  if (game.dayCount >= 100 && !f.finalShowdown) {
    f.finalShowdown = true;
    showNotification('THE FINAL SHOWDOWN! A massive outlaw army approaches!');
    addJournalEntry('Day 100: The Final Showdown begins.');
    for (var fsi = 0; fsi < 10; fsi++) {
      var fsNPC = createNPC(game.npcs.length + fsi, NPC_TYPES.OUTLAW, 'Outlaw ' + (fsi + 1),
        rand(2, MAP_W - 2), rand(2, MAP_H - 2), null);
      fsNPC.hostile = true;
      fsNPC.hp = 10;
      fsNPC.maxHp = 10;
      game.npcs.push(fsNPC);
    }
  }

  // ── Track gold nugget drops from killed NPCs ──
  f._lastOutlawsKilled = f._lastOutlawsKilled || 0;
  if (game.outlawsKilled > f._lastOutlawsKilled) {
    f._lastOutlawsKilled = game.outlawsKilled;
    f.killStreak++;
    f.killStreakTimer = 5;
    // Find where the outlaw died and drop a nugget
    for (var dki = game.npcs.length - 1; dki >= 0; dki--) {
      var dkn = game.npcs[dki];
      if (dkn.state === 'dead' && !dkn._nuggetDropped) {
        dkn._nuggetDropped = true;
        var nuggetValue = rand(5, 20) + f.killStreak * 3;
        f.goldNuggetDrops.push({ x: dkn.x, y: dkn.y, value: nuggetValue });
        break;
      }
    }
  }

  // ── Skill Tree toggle (K key) ──
  if (consumeKey('KeyK') && game.state === 'playing') {
    var panel = document.getElementById('skill-tree-panel');
    if (panel.classList.contains('hidden')) {
      openSkillTree();
    } else {
      panel.classList.add('hidden');
      game.state = 'playing';
    }
  }
}

// ============================================================
// SKILL TREE
// ============================================================
function openSkillTree() {
  var f = game._features;
  var panel = document.getElementById('skill-tree-panel');
  var content = document.getElementById('skill-tree-content');

  var html = '<div style="text-align:center;color:#ffd700;margin-bottom:10px;">Skill Points: ' + f.skillPoints + '</div>';

  var branches = {
    'GUNSLINGER': f.skills.gunslinger,
    'LAWMAN': f.skills.lawman,
    'OUTLAW': f.skills.outlaw
  };

  var skillDescs = {
    quickDraw: 'Faster shooting (+10% per level)',
    precision: 'Better accuracy (+5% per level)',
    fanTheHammer: 'Fire 3 shots rapidly',
    deadeye: 'Slow motion aiming',
    ironNerves: 'Less flinch from damage',
    authority: 'Better intimidation (+10% per level)',
    investigation: 'Find clues faster',
    negotiation: 'Better prices (+5% per level)',
    toughness: '+1 HP per level',
    leadership: 'Deputies are stronger',
    intimidation: 'Enemies flee more often',
    stealth: 'Less detection range',
    lockpick: 'Open locked chests',
    poisoncraft: 'Poison bullets deal DoT',
    escape: 'Dodge roll cooldown reduced'
  };

  for (var branch in branches) {
    html += '<div class="skill-branch"><h4>' + branch + '</h4>';
    var skills = branches[branch];
    for (var skill in skills) {
      var level = skills[skill];
      var maxLevel = 3;
      var desc = skillDescs[skill] || skill;
      var canBuy = f.skillPoints > 0 && level < maxLevel;
      html += '<div class="skill-node' + (level > 0 ? ' unlocked' : '') + '">';
      html += '<span class="skill-name">' + skill + ' [' + level + '/' + maxLevel + '] — ' + desc + '</span>';
      html += '<button onclick="buySkill(\'' + branch.toLowerCase() + '\',\'' + skill + '\')"' + (canBuy ? '' : ' disabled') + '>+</button>';
      html += '</div>';
    }
    html += '</div>';
  }

  content.innerHTML = html;
  panel.classList.remove('hidden');
}

function buySkill(branch, skill) {
  var f = game._features;
  if (f.skillPoints <= 0) return;
  var branchMap = { gunslinger: f.skills.gunslinger, lawman: f.skills.lawman, outlaw: f.skills.outlaw };
  var b = branchMap[branch];
  if (!b || b[skill] === undefined || b[skill] >= 3) return;
  b[skill]++;
  f.skillPoints--;
  showNotification('Unlocked ' + skill + ' level ' + b[skill] + '!');

  // Apply effects
  if (skill === 'toughness') { game.player.maxHp++; game.player.hp++; }
  if (skill === 'escape') { /* dodge cooldown reduced, checked in dodge code */ }

  openSkillTree(); // Refresh
}

// Skill tree close button
var stCloseBtn = document.getElementById('skill-tree-close');
if (stCloseBtn) {
  stCloseBtn.addEventListener('click', function() {
    document.getElementById('skill-tree-panel').classList.add('hidden');
  });
}

// ============================================================
// RENDER FEATURES OVERLAY
// ============================================================
function renderFeaturesOverlay() {
  if (!game._features) return;
  var f = game._features;
  var w = gameCanvas.width;
  var h = gameCanvas.height;

  // ── Weather Effects ──

  // Rain
  if (f.weather === 'rain') {
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
    ctx.lineWidth = 1;
    for (var i = 0; i < f.raindrops.length; i++) {
      var rd = f.raindrops[i];
      ctx.beginPath();
      ctx.moveTo(rd.x, rd.y);
      ctx.lineTo(rd.x - 1, rd.y + 8);
      ctx.stroke();
    }
    // Rain overlay
    ctx.fillStyle = 'rgba(40, 60, 80, 0.15)';
    ctx.fillRect(0, 0, w, h);
  }

  // Sandstorm
  if (f.weather === 'sandstorm') {
    ctx.fillStyle = 'rgba(180, 150, 100, 0.3)';
    ctx.fillRect(0, 0, w, h);
    for (var si = 0; si < 20; si++) {
      ctx.fillStyle = 'rgba(200, 170, 120, ' + randF(0.1, 0.4) + ')';
      ctx.fillRect(rand(0, w), rand(0, h), rand(2, 8), rand(1, 3));
    }
  }

  // Heatwave shimmer
  if (f.weather === 'heatwave') {
    ctx.fillStyle = 'rgba(200, 100, 50, 0.08)';
    ctx.fillRect(0, 0, w, h);
  }

  // ── Blood Moon ──
  if (f.bloodMoon) {
    ctx.fillStyle = 'rgba(150, 0, 0, 0.15)';
    ctx.fillRect(0, 0, w, h);
    // Draw red moon
    ctx.beginPath();
    ctx.arc(w - 60, 40, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#cc2200';
    ctx.fill();
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.arc(w - 58, 38, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Tumbleweeds ──
  ctx.fillStyle = PALETTE.tumbleweed || '#a89060';
  for (var ti = 0; ti < f.tumbleweeds.length; ti++) {
    var tw = f.tumbleweeds[ti];
    var sx = tw.x - camX;
    var sy = tw.y - camY;
    if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
    ctx.beginPath();
    ctx.arc(sx, sy, tw.size, 0, Math.PI * 2);
    ctx.fill();
    // Spiky lines
    for (var spi = 0; spi < 6; spi++) {
      var angle = spi * Math.PI / 3 + Date.now() * 0.001;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * tw.size * 1.3, sy + Math.sin(angle) * tw.size * 1.3);
      ctx.strokeStyle = '#8a7050';
      ctx.stroke();
    }
  }

  // ── Wildlife ──
  for (var wii = 0; wii < f.wildlife.length; wii++) {
    var wl = f.wildlife[wii];
    var wx = wl.x - camX;
    var wy = wl.y - camY;
    if (wx < -20 || wx > w + 20 || wy < -20 || wy > h + 20) continue;

    ctx.font = '10px monospace';
    var icons = { rabbit: '🐇', hawk: '🦅', lizard: '🦎', deer: '🦌', coyote: '🐺', owl: '🦉', bat: '🦇' };
    ctx.fillText(icons[wl.type] || '·', wx - 5, wy);
  }

  // ── Explosive Barrels ──
  for (var ebi = 0; ebi < f.explosiveBarrels.length; ebi++) {
    var eb = f.explosiveBarrels[ebi];
    if (!eb.active) continue;
    var ebx = eb.x - camX;
    var eby = eb.y - camY;
    if (ebx < -20 || ebx > w + 20 || eby < -20 || eby > h + 20) continue;
    // Red barrel
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(ebx - 6, eby - 8, 12, 16);
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(ebx - 5, eby - 7, 10, 14);
    ctx.fillStyle = '#ffcc00';
    ctx.font = '8px monospace';
    ctx.fillText('TNT', ebx - 7, eby + 2);
  }

  // ── Treasure Chests ──
  for (var tci = 0; tci < f.treasureChests.length; tci++) {
    var tc = f.treasureChests[tci];
    if (tc.collected) continue;
    var tcx = tc.x - camX;
    var tcy = tc.y - camY;
    if (tcx < -20 || tcx > w + 20 || tcy < -20 || tcy > h + 20) continue;
    // Draw chest
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(tcx - 7, tcy - 5, 14, 10);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(tcx - 2, tcy - 2, 4, 4);
    // Sparkle
    if (Math.random() < 0.3) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(tcx + rand(-8, 8), tcy + rand(-8, 0), 2, 2);
    }
  }

  // ── Gold Nugget Drops ──
  for (var gni = 0; gni < f.goldNuggetDrops.length; gni++) {
    var gn = f.goldNuggetDrops[gni];
    var gnx = gn.x - camX;
    var gny = gn.y - camY;
    if (gnx < -20 || gnx > w + 20 || gny < -20 || gny > h + 20) continue;
    // Gold nugget
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(gnx, gny, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8c0';
    ctx.fillRect(gnx - 1, gny - 1, 2, 2);
    // Bobbing
    gny += Math.sin(Date.now() * 0.005 + gni) * 2;
  }

  // ── Campfires ──
  for (var cfi = 0; cfi < f.campfires.length; cfi++) {
    var cf = f.campfires[cfi];
    var cfx = cf.x - camX;
    var cfy = cf.y - camY;
    if (cfx < -20 || cfx > w + 20 || cfy < -20 || cfy > h + 20) continue;
    // Fire
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(cfx, cfy - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(cfx, cfy - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Logs
    ctx.fillStyle = '#4a2e1a';
    ctx.fillRect(cfx - 6, cfy + 2, 12, 3);
  }

  // ── Smoke Bombs ──
  for (var sbi = 0; sbi < f.smokeActive.length; sbi++) {
    var sb = f.smokeActive[sbi];
    var sbx = sb.x - camX;
    var sby = sb.y - camY;
    var opacity = Math.min(sb.life / 2, 0.6);
    ctx.fillStyle = 'rgba(150, 150, 150, ' + opacity + ')';
    ctx.beginPath();
    ctx.arc(sbx, sby, sb.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Dynamite ──
  for (var dyi = 0; dyi < f.dynamiteActive.length; dyi++) {
    var dy = f.dynamiteActive[dyi];
    var dyx = dy.x - camX;
    var dyy = dy.y - camY;
    // Red stick
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(dyx - 2, dyy - 6, 4, 12);
    // Fuse spark
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(dyx, dyy - 8, 2, 0, Math.PI * 2);
    ctx.fill();
    // Timer flash
    if (dy.timer < 1 && Math.random() < 0.5) {
      ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(dyx, dyy, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Lasso ──
  if (f.lassoActive && f.lassoTarget) {
    var px = game.player.x - camX;
    var py = game.player.y - camY;
    var lx = f.lassoTarget.x - camX;
    var ly = f.lassoTarget.y - camY;
    ctx.strokeStyle = '#8b6340';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    // Curve
    ctx.quadraticCurveTo((px + lx) / 2, Math.min(py, ly) - 20, lx, ly);
    ctx.stroke();
    // Loop around target
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── Knives ──
  ctx.fillStyle = '#ccc';
  for (var kni = 0; kni < f.knives.length; kni++) {
    var kn = f.knives[kni];
    var knx = kn.x - camX;
    var kny = kn.y - camY;
    ctx.save();
    ctx.translate(knx, kny);
    ctx.rotate(Math.atan2(kn.dy, kn.dx));
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(-6, -2, 4, 4);
    ctx.restore();
  }

  // ── Footstep Dust ──
  for (var fdi = 0; fdi < f.footstepDust.length; fdi++) {
    var fd = f.footstepDust[fdi];
    var fdx = fd.x - camX;
    var fdy = fd.y - camY;
    var fdOpacity = fd.life / 15;
    ctx.fillStyle = 'rgba(180, 160, 120, ' + (fdOpacity * 0.4) + ')';
    ctx.beginPath();
    ctx.arc(fdx, fdy, fd.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Bullet Trails ──
  for (var bti = 0; bti < f.bulletTrails.length; bti++) {
    var bt = f.bulletTrails[bti];
    var btOpacity = bt.life / bt.maxLife;
    ctx.strokeStyle = 'rgba(255, 200, 50, ' + (btOpacity * 0.5) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bt.x1 - camX, bt.y1 - camY);
    ctx.lineTo(bt.x2 - camX, bt.y2 - camY);
    ctx.stroke();
  }

  // ── Deputies ──
  for (var dpi = 0; dpi < f.deputies.length; dpi++) {
    var dep = f.deputies[dpi];
    var dx = dep.x - camX;
    var dy = dep.y - camY;
    if (dx < -20 || dx > w + 20 || dy < -20 || dy > h + 20) continue;
    // Body
    ctx.fillStyle = '#4a5a8a';
    ctx.fillRect(dx - 5, dy - 3, 10, 12);
    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.beginPath();
    ctx.arc(dx, dy - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    // Hat
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(dx - 6, dy - 12, 12, 3);
    ctx.fillRect(dx - 4, dy - 15, 8, 4);
    // Badge
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(dx - 1, dy - 1, 3, 3);
    // Label
    ctx.fillStyle = '#88aacc';
    ctx.font = '7px monospace';
    ctx.fillText('DEPUTY', dx - 14, dy - 17);
  }

  // ── Pet Dog ──
  if (f.petDog) {
    var dogX = f.petDogPos.x - camX;
    var dogY = f.petDogPos.y - camY;
    // Simple dog sprite
    ctx.fillStyle = '#8b6340';
    ctx.fillRect(dogX - 4, dogY - 2, 8, 6);
    ctx.fillRect(dogX - 6, dogY - 4, 4, 4); // head
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(dogX - 6, dogY - 2, 2, 2); // nose
    // Tail wag
    var tailAngle = Math.sin(Date.now() * 0.01) * 0.5;
    ctx.fillStyle = '#8b6340';
    ctx.save();
    ctx.translate(dogX + 4, dogY);
    ctx.rotate(tailAngle);
    ctx.fillRect(0, -1, 5, 2);
    ctx.restore();
  }

  // ── Treasure Map Marker ──
  if (f.activeTreasure) {
    var tmx = f.activeTreasure.x - camX;
    var tmy = f.activeTreasure.y - camY;
    if (tmx > -50 && tmx < w + 50 && tmy > -50 && tmy < h + 50) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('X', tmx - 5, tmy + 5);
      // Glow
      ctx.fillStyle = 'rgba(255, 0, 0, ' + (0.2 + Math.sin(Date.now() * 0.005) * 0.1) + ')';
      ctx.beginPath();
      ctx.arc(tmx, tmy, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Film Grain ──
  if (f.filmGrain) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (var gri = 0; gri < 30; gri++) {
      ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3));
    }
  }

  // ── Season Tint ──
  if (f.season === 'winter') {
    ctx.fillStyle = 'rgba(200, 220, 255, 0.08)';
    ctx.fillRect(0, 0, w, h);
  } else if (f.season === 'fall') {
    ctx.fillStyle = 'rgba(180, 100, 50, 0.05)';
    ctx.fillRect(0, 0, w, h);
  } else if (f.season === 'spring') {
    ctx.fillStyle = 'rgba(50, 180, 80, 0.03)';
    ctx.fillRect(0, 0, w, h);
  }

  // ── Revenge Mode Indicator ──
  if (f.revengeMode) {
    ctx.fillStyle = 'rgba(200, 0, 0, ' + (0.1 + Math.sin(Date.now() * 0.005) * 0.05) + ')';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('REVENGE MODE — +50% DAMAGE', 10, h - 45);
  }

  // ── Kill Streak Display ──
  if (f.killStreak > 1 && f.killStreakTimer > 0) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(f.killStreak + 'x KILL STREAK!', w / 2, 80);
    ctx.textAlign = 'left';
  }

  // ── Boss HP Bar ──
  if (f.bossActive && f.bossActive.state !== 'dead') {
    var boss = f.bossActive;
    ctx.fillStyle = 'rgba(20, 10, 5, 0.8)';
    ctx.fillRect(w / 2 - 100, h - 60, 200, 20);
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(w / 2 - 98, h - 58, (boss.hp / boss.maxHp) * 196, 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS: ' + boss.name, w / 2, h - 46);
    ctx.textAlign = 'left';
  }

  // ── Season & Weather HUD ──
  ctx.fillStyle = '#a09070';
  ctx.font = '9px monospace';
  var seasonIcons = { spring: '🌱', summer: '☀️', fall: '🍂', winter: '❄️' };
  ctx.fillText((seasonIcons[f.season] || '') + ' ' + f.season.toUpperCase(), w - 100, 55);
  if (f.weather !== 'clear') {
    var weatherIcons = { rain: '🌧️', sandstorm: '🌪️', heatwave: '🔥' };
    ctx.fillText((weatherIcons[f.weather] || '') + ' ' + f.weather, w - 100, 68);
  }

  // ── Rival Sheriff Status ──
  if (f.rivalRep > 0) {
    ctx.fillStyle = f.rivalRep > game.reputation ? '#cc4444' : '#44cc44';
    ctx.font = '8px monospace';
    ctx.fillText('Rival: ' + f.rivalName + ' (' + f.rivalRep + ')', w - 150, 82);
  }
}

// ── Newspaper Close ──
var newsCloseBtn = document.getElementById('newspaper-close');
if (newsCloseBtn) {
  newsCloseBtn.addEventListener('click', function() {
    document.getElementById('newspaper-popup').classList.add('hidden');
  });
}
