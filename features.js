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

    // ── NEW FEATURE STATE (15 features) ──

    // 1. Wanted Poster Bounty Hunting
    wantedNPCs: [],
    wantedSpawnedToday: false,
    wantedLastDay: -1,
    bountiesCollected: 0,

    // 2. Weather System (enhanced — fog & dust storm)
    // (weather, weatherTimer, weatherDuration, raindrops already exist)
    fogParticles: [],
    dustStormParticles: [],

    // 3. Horse Racing
    horseRaceActive: false,
    horseRacePhase: 0, // 0=countdown, 1=racing, 2=finished
    horseRaceTimer: 0,
    horseRacePlayerPos: 0,
    horseRaceAI: [0, 0, 0],
    horseRaceBoost: 0,
    horseRaceNotifyTimer: 0,
    horseRaceLastDay: -1,

    // 4. Bank Robbery Event
    bankRobberyActive: false,
    bankRobberyTimer: 0,
    bankRobberyOutlaws: [],
    bankRobberyLastDay: -1,
    bankClosedUntilDay: -1,

    // 5. Campfire Rest System (enhanced)
    campfireResting: false,
    campfireRestTimer: 0,
    campfireCookTimer: 0,
    campfireSupplies: 0,

    // 6. Deputy System (World) — deputies in world
    worldDeputies: [],
    worldDeputyMax: 3,

    // 7. Fishing Mini-Game (enhanced with timing bar)
    fishingMiniGame: false,
    fishingBarPos: 0,
    fishingBarDir: 1,
    fishingGreenZone: 0.4,
    fishingGreenStart: 0.3,
    fishCount: 0,

    // 8. Arm Wrestling
    armWrestlingActive: false,
    armWrestlePower: 50,
    armWrestleOpponentPower: 50,
    armWrestleOpponentStr: 0,
    armWrestleOpponentName: '',
    armWrestleBet: 0,
    armWrestleTimer: 0,

    // 9. Dynamic NPC Relationships (enhanced)
    // relationships{} already exists, this adds tracking
    npcRelColors: true,

    // 10. Mine Exploration
    mineActive: false,
    mineRoom: 0,
    mineRooms: [],
    minePlayerX: 0,
    minePlayerY: 0,
    mineGoldCollected: 0,
    mineEnemies: [],
    mineCaveIns: [],
    mineExitTimer: 0,

    // 11. Newspaper System (enhanced with popup)
    newspaperShowDay: -1,
    newspaperReady: false,
    newspaperHeadlines: [],

    // 12. Execution/Gallows (handled in office.js)

    // 13. Gold Panning
    goldPanningActive: false,
    goldPanningRocks: [],
    goldPanningScore: 0,
    goldPanningRound: 0,
    goldPanningMaxPerDay: 3,
    goldPanningDoneToday: 0,
    goldPanningLastDay: -1,

    // 14. Town Events / Festivals
    festivalActive: false,
    festivalType: '',
    festivalTimer: 0,
    festivalLastDay: -1,
    festivalDecorations: [],
    festivalFireworks: [],

    // 15. Revenge System
    revengeSeekers: [],
    revengeQueue: [], // { spawnDay, name }
    revengeKills: 0,

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
  if (game.state !== 'playing' && game.state !== 'dialog' && game.state !== 'tutorial' && game.state !== 'minigame') return;
  // During minigame state, skip all features — only let the wrapper call updateMinigames
  if (game.state === 'minigame') return;
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
    if (Math.random() < 0.3 && f.footstepDust.length < 20) {
      f.footstepDust.push({ x: p.x, y: p.y + 8, life: 15, size: 4 });
    }
  }
  var _mgBlocked = (typeof _inputBlockedByMinigameOrFeature === 'function') && _inputBlockedByMinigameOrFeature();
  if (!_mgBlocked && !f.dodgeActive && f.dodgeCooldown <= 0 && game.state === 'playing' && consumeKey('KeyQ')) {
    f.dodgeActive = true;
    f.dodgeTimer = 0.2;
    f.dodgeCooldown = 2;
    f.dodgeDir = p.dir;
  }

  // 2. Dynamite (Digit3 when not in dialog) — compact
  var dynWrite = 0;
  for (var di = 0; di < f.dynamiteActive.length; di++) {
    var dyn = f.dynamiteActive[di];
    dyn.timer -= dt;
    if (dyn.timer <= 0) {
      particles.emit(dyn.x, dyn.y, 20, '#ff6600', 4, 30);
      particles.emit(dyn.x, dyn.y, 10, '#ffcc00', 3, 20);
      if (typeof audio !== 'undefined' && audio.playExplosion) audio.playExplosion();
      for (var ni = 0; ni < game.npcs.length; ni++) {
        var npc = game.npcs[ni];
        if (npc.state === 'dead') continue;
        if (dist(npc, dyn) < 80) {
          npc.hp -= 5;
          if (npc.hp <= 0) { npc.state = 'dead'; game.outlawsKilled++; }
        }
      }
    } else {
      f.dynamiteActive[dynWrite++] = dyn;
    }
  }
  f.dynamiteActive.length = dynWrite;
  if (f.dynamiteCount > 0 && game.state === 'playing' && consumeKey('Digit3')) {
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
  if (!f.lassoActive && game.state === 'playing' && consumeKey('KeyR')) {
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
  var smWrite = 0;
  for (var si = 0; si < f.smokeActive.length; si++) {
    f.smokeActive[si].life -= dt;
    if (f.smokeActive[si].life > 0) f.smokeActive[smWrite++] = f.smokeActive[si];
  }
  f.smokeActive.length = smWrite;
  if (f.smokeBombs > 0 && game.state === 'playing' && consumeKey('Minus')) {
    f.smokeBombs--;
    f.smokeActive.push({ x: p.x, y: p.y, life: 5, radius: 60 });
    showNotification('Smoke bomb! (' + f.smokeBombs + ' left)');
  }

  // 8. Knife Throw (V key) — compact instead of splice
  var knWrite = 0;
  for (var ki = 0; ki < f.knives.length; ki++) {
    var kn = f.knives[ki];
    kn.x += kn.dx * 5;
    kn.y += kn.dy * 5;
    kn.life--;
    if (kn.life <= 0) continue;
    var knHit = false;
    for (var kni = 0; kni < game.npcs.length; kni++) {
      var knpc = game.npcs[kni];
      if (knpc.state === 'dead' || !knpc.hostile) continue;
      if (dist(kn, knpc) < 20) {
        knpc.hp -= 3;
        if (knpc.hp <= 0) { knpc.state = 'dead'; game.outlawsKilled++; }
        knHit = true;
        break;
      }
    }
    if (!knHit) f.knives[knWrite++] = kn;
  }
  f.knives.length = knWrite;
  if (!_mgBlocked && consumeKey('KeyV') && game.state === 'playing') {
    var kDirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    var kd = kDirs[p.dir] || [1, 0];
    f.knives.push({ x: p.x, y: p.y, dx: kd[0], dy: kd[1], life: 40 });
  }

  // 12. Explosive Barrels (check every frame, but only when bullets exist)
  var bList = (typeof bullets !== 'undefined') ? bullets.bullets : null;
  if (bList && bList.length > 0) {
    for (var bi = 0; bi < f.explosiveBarrels.length; bi++) {
      var barrel = f.explosiveBarrels[bi];
      if (!barrel.active) continue;
      for (var bli = 0; bli < bList.length; bli++) {
        var blt = bList[bli];
        if (dist(blt, barrel) < 20) {
          barrel.active = false;
          particles.emit(barrel.x, barrel.y, 25, '#ff4400', 5, 25);
          particles.emit(barrel.x, barrel.y, 15, '#ffaa00', 3, 15);
          if (typeof audio !== 'undefined' && audio.playExplosion) audio.playExplosion();
          for (var bni = 0; bni < game.npcs.length; bni++) {
            if (game.npcs[bni].state !== 'dead' && dist(game.npcs[bni], barrel) < 70) {
              game.npcs[bni].hp -= 4;
              if (game.npcs[bni].hp <= 0) { game.npcs[bni].state = 'dead'; game.outlawsKilled++; }
            }
          }
          if (dist(p, barrel) < 70 && !game._cheatMode) { p.hp -= 2; showNotification('Caught in the explosion! -2 HP'); }
          showNotification('BOOM! Barrel exploded!');
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

  // Generate rain particles (capped at 60, recycle instead of splice)
  if (f.weather === 'rain') {
    var maxRain = 60;
    if (f.raindrops.length < maxRain) {
      f.raindrops.push({
        x: rand(0, gameCanvas.width),
        y: 0,
        speed: randF(8, 14),
        life: rand(30, 50)
      });
    }
  }
  var rdWrite = 0;
  for (var rdi = 0; rdi < f.raindrops.length; rdi++) {
    var rdrop = f.raindrops[rdi];
    rdrop.y += rdrop.speed;
    rdrop.life--;
    if (rdrop.life > 0 && rdrop.y <= gameCanvas.height) {
      f.raindrops[rdWrite++] = rdrop;
    }
  }
  f.raindrops.length = rdWrite;

  // 21. Tumbleweeds
  for (var ti = 0; ti < f.tumbleweeds.length; ti++) {
    var tw = f.tumbleweeds[ti];
    tw.x += tw.dx;
    tw.y += tw.dy;
    if (tw.x < 0 || tw.x > MAP_W * TILE) tw.dx = -tw.dx;
    if (tw.y < 0 || tw.y > MAP_H * TILE) tw.dy = -tw.dy;
  }

  // 22. Campfire healing (throttled particle emission)
  var cfWrite = 0;
  for (var ci = 0; ci < f.campfires.length; ci++) {
    var cf = f.campfires[ci];
    cf.life -= dt;
    if (cf.life <= 0) continue;
    f.campfires[cfWrite++] = cf;
    if (dist(p, cf) < 40 && p.hp < p.maxHp) {
      cf.healTimer = (cf.healTimer || 0) + dt;
      if (cf.healTimer > 3) {
        p.hp = Math.min(p.hp + 1, p.maxHp);
        cf.healTimer = 0;
        showNotification('Campfire heals you. +1 HP');
      }
    }
    cf._emitTimer = (cf._emitTimer || 0) + dt;
    if (cf._emitTimer > 0.3) {
      cf._emitTimer = 0;
      particles.emit(cf.x + randF(-5, 5), cf.y - 5, 1, '#ff6600', 1, 10);
    }
  }
  f.campfires.length = cfWrite;

  // 25. Day/Night wildlife (compact instead of splice)
  f._wildlifeTimer = (f._wildlifeTimer || 0) + dt;
  if (f._wildlifeTimer > 60) {
    f._wildlifeTimer = 0;
    spawnWildlife();
  }
  var wlWrite = 0;
  for (var wi = 0; wi < f.wildlife.length; wi++) {
    var wl2 = f.wildlife[wi];
    wl2.x += wl2.dx;
    wl2.y += wl2.dy;
    wl2.life--;
    if (wl2.life > 0 && wl2.x >= 0 && wl2.x <= MAP_W * TILE && wl2.y >= 0 && wl2.y <= MAP_H * TILE) {
      f.wildlife[wlWrite++] = wl2;
    }
  }
  f.wildlife.length = wlWrite;

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

  // 35. Deputy System (NPC scan throttled to every 0.5s, movement every frame)
  f._deputyScanTimer = (f._deputyScanTimer || 0) + dt;
  var depRescan = f._deputyScanTimer > 0.5;
  if (depRescan) f._deputyScanTimer = 0;
  var dpWrite = 0;
  for (var dpi = 0; dpi < f.deputies.length; dpi++) {
    var dep = f.deputies[dpi];
    if (dep.state === 'dead') continue;
    f.deputies[dpWrite++] = dep;
    // Rescan for hostile target periodically
    if (depRescan || !dep._cachedTarget) {
      dep._cachedTarget = null;
      var closestDist = 200;
      for (var chi = 0; chi < game.npcs.length; chi++) {
        var cn = game.npcs[chi];
        if (cn.hostile && cn.state !== 'dead') {
          var cd = dist(dep, cn);
          if (cd < closestDist) { closestDist = cd; dep._cachedTarget = cn; }
        }
      }
    }
    var closestHostile = dep._cachedTarget;
    if (closestHostile && closestHostile.state !== 'dead') {
      var ddx = closestHostile.x - dep.x;
      var ddy = closestHostile.y - dep.y;
      var dlen = Math.hypot(ddx, ddy) || 1;
      dep.x += (ddx / dlen) * 1.5;
      dep.y += (ddy / dlen) * 1.5;
      if (dlen < 30) {
        closestHostile.hp -= 1;
        if (closestHostile.hp <= 0) {
          closestHostile.state = 'dead';
          game.outlawsKilled++;
          dep._cachedTarget = null;
        }
      }
    } else {
      dep._cachedTarget = null;
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
  f.deputies.length = dpWrite;

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

  // 40. NPC Fights (only compute when timer fires)
  f._npcFightTimer = (f._npcFightTimer || 0) + dt;
  if (f._npcFightTimer > 45) {
    f._npcFightTimer = 0;
    if (Math.random() < 0.1) {
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

  // 60. Gold Nugget Drops from killed outlaws (compact)
  var gnWrite = 0;
  for (var gni = 0; gni < f.goldNuggetDrops.length; gni++) {
    var gn = f.goldNuggetDrops[gni];
    if (dist(p, gn) < 20) {
      game.gold += gn.value;
      game.totalGoldEarned += gn.value;
      showNotification('+$' + gn.value);
      particles.emit(gn.x, gn.y, 5, '#ffd700', 2, 15);
    } else {
      f.goldNuggetDrops[gnWrite++] = gn;
    }
  }
  f.goldNuggetDrops.length = gnWrite;

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

  // 77. Footstep Dust (capped at 20, swap-remove)
  if (p.speed > 0 && (Math.abs(p.vx || 0) > 0 || Math.abs(p.vy || 0) > 0 || game._isMoving)) {
    if (Math.random() < 0.15 && f.footstepDust.length < 20) {
      f.footstepDust.push({ x: p.x + randF(-3, 3), y: p.y + 8, life: 12, size: rand(2, 4) });
    }
  }
  var fdWrite = 0;
  for (var fdi = 0; fdi < f.footstepDust.length; fdi++) {
    f.footstepDust[fdi].life--;
    if (f.footstepDust[fdi].life > 0) f.footstepDust[fdWrite++] = f.footstepDust[fdi];
  }
  f.footstepDust.length = fdWrite;

  // 78. Bullet Trails (compact instead of splice)
  var btWrite = 0;
  for (var bti = 0; bti < f.bulletTrails.length; bti++) {
    f.bulletTrails[bti].life--;
    if (f.bulletTrails[bti].life > 0) f.bulletTrails[btWrite++] = f.bulletTrails[bti];
  }
  f.bulletTrails.length = btWrite;

  // Dust clouds (compact instead of splice)
  var dcWrite = 0;
  for (var dci = 0; dci < f.dustClouds.length; dci++) {
    f.dustClouds[dci].life--;
    f.dustClouds[dci].y -= 0.3;
    if (f.dustClouds[dci].life > 0) f.dustClouds[dcWrite++] = f.dustClouds[dci];
  }
  f.dustClouds.length = dcWrite;

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
  var prisonerList = (typeof office !== 'undefined' && office.prisoners && office.prisoners.length > 0) ? office.prisoners : game.prisoners;
  if (prisonerList && prisonerList.length > 0) {
    f.jailBreakTimer += dt;
    if (f.jailBreakTimer > 90 && Math.random() < 0.02) {
      f.jailBreakTimer = 0;
      var escapee = prisonerList[rand(0, prisonerList.length - 1)];
      showNotification('JAIL BREAK! ' + (escapee.name || 'A prisoner') + ' is trying to escape!');
      game.reputation = clamp(game.reputation - 3, 0, REPUTATION_MAX);
      // Remove prisoner from both lists
      var idx2 = prisonerList.indexOf(escapee);
      if (idx2 !== -1) prisonerList.splice(idx2, 1);
      if (prisonerList !== game.prisoners) {
        var idx3 = game.prisoners.indexOf(escapee);
        if (idx3 !== -1) game.prisoners.splice(idx3, 1);
      }
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

  // ════════════════════════════════════════════════════
  // ══ NEW 15 FEATURES — UPDATE LOGIC ══
  // ════════════════════════════════════════════════════

  // ── FEATURE 1: WANTED POSTER BOUNTY HUNTING ──
  if (f.wantedLastDay !== game.dayCount) {
    f.wantedLastDay = game.dayCount;
    f.wantedSpawnedToday = false;
  }
  if (!f.wantedSpawnedToday && game.dayCount > 0) {
    f.wantedSpawnedToday = true;
    var wantedCount = rand(1, 2);
    var wantedNames = ['Dead-Eye Dan', 'Mad Dog McGee', 'Bloody Bill', 'Iron Kate', 'The Scorpion',
      'Switchblade Sam', 'Red Handed Rex', 'Powder Pete', 'Tombstone Tom', 'Venom Vera',
      'Six-Gun Sally', 'Coffin Cal', 'Black Widow', 'Dynamite Dave', 'Noose Nick'];
    for (var wi = 0; wi < wantedCount; wi++) {
      var wName = wantedNames[rand(0, wantedNames.length - 1)];
      var bountyAmt = rand(100, 500);
      var wNPC = createNPC(game.npcs.length + wi + 900, NPC_TYPES.BOUNTY, wName,
        rand(3, MAP_W - 3), rand(3, MAP_H - 3), null);
      wNPC.hostile = true;
      wNPC.hp = rand(8, 12);
      wNPC.maxHp = wNPC.hp;
      wNPC.speed = 2.2;
      wNPC._wantedBounty = bountyAmt;
      wNPC._isWanted = true;
      game.npcs.push(wNPC);
      f.wantedNPCs.push(wNPC);
    }
  }
  // Check if wanted NPCs killed/arrested — award bounty (compact)
  var wnWrite = 0;
  for (var wni = 0; wni < f.wantedNPCs.length; wni++) {
    var wn = f.wantedNPCs[wni];
    if (wn.state === 'dead' || wn.state === 'arrested') {
      if (!wn._bountyClaimed) {
        wn._bountyClaimed = true;
        var bountyReward = wn._wantedBounty || 200;
        game.gold += bountyReward;
        game.totalGoldEarned += bountyReward;
        game.reputation = clamp(game.reputation + 10, 0, REPUTATION_MAX);
        f.bountiesCollected++;
        showNotification('BOUNTY COLLECTED: $' + bountyReward + '!');
        addJournalEntry('Collected bounty on ' + wn.name + ' ($' + bountyReward + ')');
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        f._bountyFloatText = { text: 'BOUNTY: $' + bountyReward, x: wn.x, y: wn.y, life: 90 };
      }
    } else {
      f.wantedNPCs[wnWrite++] = wn;
    }
  }
  f.wantedNPCs.length = wnWrite;
  // Bounty float text decay
  if (f._bountyFloatText) {
    f._bountyFloatText.life--;
    f._bountyFloatText.y -= 0.5;
    if (f._bountyFloatText.life <= 0) f._bountyFloatText = null;
  }

  // ── FEATURE 2: ENHANCED WEATHER (fog & dust storm) ──
  // Modify weather pool to include fog and dust_storm
  if (f.weatherTimer <= 0) {
    // Already handled above, but let's enhance the pool
  }
  // Override the weather generation pool with new types
  f._weatherOverrideTimer = (f._weatherOverrideTimer || 0) + dt;
  if (f._weatherOverrideTimer > 200 && f.weather === 'clear' && Math.random() < 0.02) {
    f._weatherOverrideTimer = 0;
    var newWeathers = ['fog', 'dust_storm'];
    var picked = newWeathers[rand(0, newWeathers.length - 1)];
    f.weather = picked;
    f.weatherDuration = rand(40, 100);
    showNotification('Weather: ' + (picked === 'fog' ? 'Fog rolling in...' : 'Dust storm approaching!'));
  }
  // Fog particles
  if (f.weather === 'fog') {
    if (f.fogParticles.length < 15) {
      f.fogParticles.push({
        x: rand(0, gameCanvas.width),
        y: rand(0, gameCanvas.height),
        size: rand(60, 150),
        alpha: randF(0.05, 0.15),
        dx: randF(-0.3, 0.3),
        dy: randF(-0.1, 0.1)
      });
    }
    for (var fpi = f.fogParticles.length - 1; fpi >= 0; fpi--) {
      var fp = f.fogParticles[fpi];
      fp.x += fp.dx;
      fp.y += fp.dy;
      if (fp.x < -200 || fp.x > gameCanvas.width + 200) fp.dx = -fp.dx;
      if (fp.y < -200 || fp.y > gameCanvas.height + 200) fp.dy = -fp.dy;
    }
  } else {
    f.fogParticles = [];
  }
  // Dust storm particles (capped at 20, compact)
  if (f.weather === 'dust_storm') {
    if (f.dustStormParticles.length < 20) {
      f.dustStormParticles.push({
        x: -20,
        y: rand(0, gameCanvas.height),
        speed: randF(4, 10),
        size: rand(2, 6),
        alpha: randF(0.2, 0.6)
      });
    }
    var dsWrite = 0;
    for (var dsi = 0; dsi < f.dustStormParticles.length; dsi++) {
      var dsp = f.dustStormParticles[dsi];
      dsp.x += dsp.speed;
      dsp.y += randF(-0.5, 0.5);
      if (dsp.x <= gameCanvas.width + 30) { f.dustStormParticles[dsWrite++] = dsp; }
    }
    f.dustStormParticles.length = dsWrite;
  } else if (f.dustStormParticles.length > 0) {
    f.dustStormParticles.length = 0;
  }
  // Weather affects NPC behavior (throttled to every 5 seconds)
  f._weatherNpcTimer = (f._weatherNpcTimer || 0) + dt;
  if (f._weatherNpcTimer > 5) {
    f._weatherNpcTimer = 0;
    if (f.weather === 'fog' || f.weather === 'dust_storm' || f.weather === 'rain' || f.weather === 'sandstorm') {
      var homeB2 = null;
      for (var wni2 = 0; wni2 < game.npcs.length; wni2++) {
        var wnpc = game.npcs[wni2];
        if (wnpc.type === NPC_TYPES.TOWNSPERSON && wnpc.state === 'walking' && !wnpc._weatherFled && Math.random() < 0.3) {
          wnpc._weatherFled = true;
          if (!homeB2) homeB2 = game.buildings.filter(function(b) { return b.type === BUILDING_TYPES.HOUSE; });
          if (homeB2.length > 0) {
            var tgt = homeB2[wnpc.id % homeB2.length];
            wnpc.targetX = tgt.doorX * TILE;
            wnpc.targetY = tgt.doorY * TILE;
          }
        }
      }
    } else {
      for (var wni3 = 0; wni3 < game.npcs.length; wni3++) {
        game.npcs[wni3]._weatherFled = false;
      }
    }
  }

  // ── FEATURE 3: HORSE RACING ──
  if (f.horseRaceLastDay !== game.dayCount) {
    f.horseRaceLastDay = game.dayCount;
    f.horseRaceNotifyTimer = 0;
  }
  if (!f.horseRaceActive && game.dayCount > 1 && game.dayCount % 3 === 0 && f.horseRaceNotifyTimer === 0) {
    f.horseRaceNotifyTimer = 1;
    showNotification('Horse race at the edge of town! Press N to join ($25 entry).');
  }
  if (!f.horseRaceActive && f.horseRaceNotifyTimer > 0 && game.state === 'playing' && consumeKey('KeyN')) {
    if (game.gold >= 25) {
      game.gold -= 25;
      f.horseRaceActive = true;
      f.horseRacePhase = 0;
      f.horseRaceTimer = 3; // 3 second countdown
      f.horseRacePlayerPos = 0;
      f.horseRaceAI = [0, 0, 0];
      f.horseRaceBoost = 0;
      showNotification('Race starting! Get ready...');
    } else {
      showNotification('Need $25 entry fee for the race.');
    }
  }
  if (f.horseRaceActive) {
    if (f.horseRacePhase === 0) {
      // Countdown
      f.horseRaceTimer -= dt;
      if (f.horseRaceTimer <= 0) {
        f.horseRacePhase = 1;
        f.horseRaceTimer = 0;
        showNotification('GO! Press SPACE to boost!');
      }
    } else if (f.horseRacePhase === 1) {
      // Racing
      f.horseRaceTimer += dt;
      // Player moves at base speed + boosts
      f.horseRacePlayerPos += (2.5 + f.horseRaceBoost) * dt * 60;
      f.horseRaceBoost *= 0.95; // decay
      // Space for boost
      if (consumeKey('Space')) {
        f.horseRaceBoost = 3 + Math.random() * 2;
        if (typeof audio !== 'undefined' && audio.playHorseGallop) audio.playHorseGallop();
      }
      // AI horses
      for (var ai = 0; ai < 3; ai++) {
        f.horseRaceAI[ai] += (2.0 + Math.random() * 1.5 + ai * 0.3) * dt * 60;
      }
      // Check finish (race length = 600)
      var raceLen = 600;
      if (f.horseRacePlayerPos >= raceLen) {
        f.horseRacePhase = 2;
        // Check placement
        var beaten = 0;
        for (var ai2 = 0; ai2 < 3; ai2++) {
          if (f.horseRacePlayerPos > f.horseRaceAI[ai2]) beaten++;
        }
        if (beaten === 3) {
          game.gold += 200;
          game.totalGoldEarned += 200;
          game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
          showNotification('You WON the race! +$200, +5 Rep!');
          if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        } else {
          showNotification('You lost the race. Better luck next time!');
          if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
        }
        setTimeout(function() { f.horseRaceActive = false; }, 2000);
      }
      // AI finish check
      for (var ai3 = 0; ai3 < 3; ai3++) {
        if (f.horseRaceAI[ai3] >= raceLen && f.horseRacePhase === 1) {
          // AI finished first, continue until player finishes
        }
      }
    }
  }

  // ── FEATURE 4: BANK ROBBERY EVENT ──
  if (f.bankRobberyLastDay !== game.dayCount) {
    f.bankRobberyLastDay = game.dayCount;
  }
  if (!f.bankRobberyActive && !game.activeCrime && game.dayCount > 2 && Math.random() < 0.0003) {
    // Start bank robbery
    var bank = null;
    for (var bbi = 0; bbi < game.buildings.length; bbi++) {
      if (game.buildings[bbi].type === BUILDING_TYPES.BANK) { bank = game.buildings[bbi]; break; }
    }
    if (bank && f.bankClosedUntilDay < game.dayCount) {
      f.bankRobberyActive = true;
      f.bankRobberyTimer = 90;
      f.bankRobberyOutlaws = [];
      var robberCount = rand(3, 5);
      for (var rbi = 0; rbi < robberCount; rbi++) {
        var robberNPC = createNPC(game.npcs.length + rbi + 800, NPC_TYPES.OUTLAW,
          'Bank Robber ' + (rbi + 1), bank.doorX + rand(-2, 2), bank.doorY + rand(-1, 2), null);
        robberNPC.hostile = true;
        robberNPC.hp = rand(5, 8);
        robberNPC.maxHp = robberNPC.hp;
        robberNPC._bankRobber = true;
        game.npcs.push(robberNPC);
        f.bankRobberyOutlaws.push(robberNPC);
      }
      showNotification('BANK ROBBERY! Outlaws are robbing the bank! Stop them!');
      addJournalEntry('Bank robbery in progress! ' + robberCount + ' armed outlaws at the bank.');
      if (typeof audio !== 'undefined' && audio.playBellAlarm) audio.playBellAlarm();
    }
  }
  if (f.bankRobberyActive) {
    f.bankRobberyTimer -= dt;
    // Check if all robbers dead/arrested
    var robbersAlive = 0;
    for (var rci = 0; rci < f.bankRobberyOutlaws.length; rci++) {
      if (f.bankRobberyOutlaws[rci].state !== 'dead' && f.bankRobberyOutlaws[rci].state !== 'arrested') robbersAlive++;
    }
    if (robbersAlive === 0) {
      f.bankRobberyActive = false;
      game.gold += 200;
      game.totalGoldEarned += 200;
      game.reputation = clamp(game.reputation + 15, 0, REPUTATION_MAX);
      showNotification('Bank saved! +$200, +15 Rep!');
      addJournalEntry('Stopped the bank robbery! Saved the gold.');
      if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
    } else if (f.bankRobberyTimer <= 0) {
      f.bankRobberyActive = false;
      f.bankClosedUntilDay = game.dayCount + 2;
      game.reputation = clamp(game.reputation - 10, 0, REPUTATION_MAX);
      showNotification('Bank robbery succeeded! Bank closed for 2 days. -10 Rep');
      addJournalEntry('Failed to stop the bank robbery. Bank closed.');
      if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
      // Remove remaining robbers
      for (var rri = 0; rri < f.bankRobberyOutlaws.length; rri++) {
        if (f.bankRobberyOutlaws[rri].state !== 'dead') f.bankRobberyOutlaws[rri].state = 'dead';
      }
    }
  }

  // ── FEATURE 5: CAMPFIRE REST SYSTEM (Enhanced) ──
  // F key near open ground to set up campfire and rest
  if (!f.campfireResting && game.state === 'playing' && consumeKey('KeyF') && !game.dialogState) {
    // Check if near open ground (sand tile) and not near buildings
    var ptx = Math.floor(p.x / TILE);
    var pty = Math.floor(p.y / TILE);
    var nearBld = false;
    for (var cbi = 0; cbi < game.buildings.length; cbi++) {
      var cb = game.buildings[cbi];
      if (ptx >= cb.x - 2 && ptx <= cb.x + cb.w + 2 && pty >= cb.y - 2 && pty <= cb.y + cb.h + 2) {
        nearBld = true; break;
      }
    }
    var tileHere = (game.map && game.map[pty]) ? game.map[pty][ptx] : 0;
    if (!nearBld && (tileHere === 0 || tileHere === 1 || tileHere === 9)) {
      // Check if we're near water for fishing instead
      var nearWater = false;
      for (var wdx = -2; wdx <= 2; wdx++) {
        for (var wdy = -2; wdy <= 2; wdy++) {
          var wtx = ptx + wdx, wty = pty + wdy;
          if (wtx >= 0 && wtx < MAP_W && wty >= 0 && wty < MAP_H && game.map[wty][wtx] === 5) nearWater = true;
        }
      }
      if (!nearWater) {
        f.campfireResting = true;
        f.campfireRestTimer = 0;
        // Add campfire at current position
        f.campfires.push({ x: p.x, y: p.y + 10, life: 120, healTimer: 0 });
        showNotification('Resting by campfire. HP restores over time. ESC to stand.');
      }
    }
  }
  if (f.campfireResting) {
    f.campfireRestTimer += dt;
    // Time passes 3x faster
    if (typeof game.time !== 'undefined') {
      game.time += (dt / DAY_LENGTH) * 2; // extra 2x on top of normal 1x
    }
    // ESC to stand up
    if (consumeKey('Escape')) {
      f.campfireResting = false;
      showNotification('You stand up from the campfire.');
    }
    // Cook food if have supplies
    if (f.campfireSupplies > 0) {
      f.campfireCookTimer += dt;
      if (f.campfireCookTimer >= 5) {
        f.campfireCookTimer = 0;
        f.campfireSupplies--;
        p.hp = Math.min(p.hp + 3, p.maxHp);
        showNotification('Cooked a meal! +3 HP (' + f.campfireSupplies + ' supplies left)');
      }
    }
  }

  // ── FEATURE 6: DEPUTY SYSTEM (WORLD) ──
  // Sync deputies from office into world
  if (typeof office !== 'undefined' && office.deputies && office.deputies.length > 0) {
    while (f.worldDeputies.length < Math.min(office.deputies.length, f.worldDeputyMax)) {
      var depIdx = f.worldDeputies.length;
      var depInfo = office.deputies[depIdx];
      f.worldDeputies.push({
        x: p.x + rand(-60, 60),
        y: p.y + rand(-60, 60),
        hp: 6,
        maxHp: 6,
        name: depInfo.name || ('Deputy ' + (depIdx + 1)),
        state: 'patrol',
        dir: rand(0, 3),
        moveTimer: rand(30, 90),
        animTimer: 0
      });
    }
  }
  // Update world deputies — patrol, fight outlaws (throttled NPC scan)
  f._wdScanTimer = (f._wdScanTimer || 0) + dt;
  var wdRescan = f._wdScanTimer > 0.5;
  if (wdRescan) f._wdScanTimer = 0;
  var wdWrite = 0;
  for (var wdi = 0; wdi < f.worldDeputies.length; wdi++) {
    var wd = f.worldDeputies[wdi];
    if (wd.hp <= 0) {
      showNotification('Deputy ' + wd.name + ' has been killed!');
      if (typeof office !== 'undefined' && office.deputies && office.deputies.length > wdi) {
        office.deputies.splice(wdi, 1);
      }
      continue;
    }
    f.worldDeputies[wdWrite++] = wd;
    // Rescan for target periodically
    if (wdRescan || !wd._cachedTarget) {
      wd._cachedTarget = null;
      var depClosestDist = 250;
      for (var dchi = 0; dchi < game.npcs.length; dchi++) {
        var dcn = game.npcs[dchi];
        if (dcn.hostile && dcn.state !== 'dead') {
          var dcd = dist(wd, dcn);
          if (dcd < depClosestDist) { depClosestDist = dcd; wd._cachedTarget = dcn; }
        }
      }
    }
    var depClosest = wd._cachedTarget;
    if (depClosest && depClosest.state !== 'dead') {
      var wddx = depClosest.x - wd.x;
      var wddy = depClosest.y - wd.y;
      var wdlen = Math.hypot(wddx, wddy) || 1;
      wd.x += (wddx / wdlen) * 2;
      wd.y += (wddy / wdlen) * 2;
      wd.state = 'fighting';
      wd.animTimer++;
      if (wdlen < 35) {
        depClosest.hp -= 1;
        if (depClosest.hp <= 0) {
          depClosest.state = 'dead';
          game.outlawsKilled++;
          showNotification(wd.name + ' took down ' + depClosest.name + '!');
          wd._cachedTarget = null;
        }
        if (Math.random() < 0.1) wd.hp--;
      }
    } else {
      wd._cachedTarget = null;
      var wdpDist = dist(wd, p);
      if (wdpDist > 120) {
        var wdpx = p.x - wd.x;
        var wdpy = p.y - wd.y;
        var wdplen = Math.hypot(wdpx, wdpy) || 1;
        wd.x += (wdpx / wdplen) * 1.5;
        wd.y += (wdpy / wdplen) * 1.5;
      } else {
        wd.moveTimer--;
        if (wd.moveTimer <= 0) {
          wd.dir = rand(0, 3);
          wd.moveTimer = rand(30, 90);
        }
        var wdDirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
        var wdd2 = wdDirs[wd.dir];
        var wdnx = wd.x + wdd2[0] * 1.2;
        var wdny = wd.y + wdd2[1] * 1.2;
        if (canMove(wdnx, wdny, 5)) { wd.x = wdnx; wd.y = wdny; }
      }
      wd.state = 'patrol';
      wd.animTimer++;
    }
  }
  f.worldDeputies.length = wdWrite;

  // ── FEATURE 7: FISHING MINI-GAME ──
  if (f.fishingMiniGame) {
    // Bar oscillates
    f.fishingBarPos += f.fishingBarDir * dt * 2.5;
    if (f.fishingBarPos >= 1) { f.fishingBarPos = 1; f.fishingBarDir = -1; }
    if (f.fishingBarPos <= 0) { f.fishingBarPos = 0; f.fishingBarDir = 1; }
    // Space to catch
    if (consumeKey('Space')) {
      var inGreen = f.fishingBarPos >= f.fishingGreenStart && f.fishingBarPos <= f.fishingGreenStart + f.fishingGreenZone;
      if (inGreen) {
        f.fishingMiniGame = false;
        f.fishCount++;
        // Determine catch
        var fishRoll = Math.random();
        if (fishRoll < 0.05) {
          // Golden fish!
          game.gold += 100;
          game.totalGoldEarned += 100;
          showNotification('GOLDEN FISH! +$100!');
          if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        } else {
          var fishVal = rand(5, 20);
          game.gold += fishVal;
          game.totalGoldEarned += fishVal;
          var fishNames = ['Catfish', 'Trout', 'Bass', 'Sunfish', 'Perch', 'Carp'];
          showNotification('Caught a ' + fishNames[rand(0, fishNames.length - 1)] + '! +$' + fishVal);
          if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
        }
      } else {
        f.fishingMiniGame = false;
        showNotification('Fish got away! Missed the green zone.');
        if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
      }
    }
    if (consumeKey('Escape')) {
      f.fishingMiniGame = false;
      showNotification('Stopped fishing.');
    }
  }
  // Start fishing near water with F key (if not already resting)
  if (!f.fishingMiniGame && !f.campfireResting && !f.goldPanningActive && game.state === 'playing' && consumeKey('KeyF')) {
    var ptx2 = Math.floor(p.x / TILE);
    var pty2 = Math.floor(p.y / TILE);
    var nearWater2 = false;
    for (var wdx2 = -2; wdx2 <= 2; wdx2++) {
      for (var wdy2 = -2; wdy2 <= 2; wdy2++) {
        var wtx2 = ptx2 + wdx2, wty2 = pty2 + wdy2;
        if (wtx2 >= 0 && wtx2 < MAP_W && wty2 >= 0 && wty2 < MAP_H && game.map[wty2][wtx2] === 5) nearWater2 = true;
      }
    }
    if (nearWater2) {
      f.fishingMiniGame = true;
      f.fishingBarPos = 0;
      f.fishingBarDir = 1;
      f.fishingGreenStart = randF(0.2, 0.5);
      f.fishingGreenZone = 0.25;
      showNotification('Fishing! Press SPACE when bar is in the green zone.');
    }
  }

  // ── FEATURE 8: ARM WRESTLING IN SALOON ──
  // Countdown phase: 3... 2... 1... GO!
  if (f._armWrestleCountdownActive) {
    f.armWrestleCountdown -= dt;
    if (f.armWrestleCountdown <= 2 && f.armWrestleCountdown > 1 && !f._awCountdown2) {
      f._awCountdown2 = true;
      showNotification('2...');
    }
    if (f.armWrestleCountdown <= 1 && f.armWrestleCountdown > 0 && !f._awCountdown1) {
      f._awCountdown1 = true;
      showNotification('1...');
    }
    if (f.armWrestleCountdown <= 0) {
      f._armWrestleCountdownActive = false;
      f._awCountdown2 = false;
      f._awCountdown1 = false;
      f.armWrestlingActive = true;
      f.armWrestleTimer = 0;
      f.armWrestlePower = 50;
      showNotification('GO! MASH SPACE to win!');
      if (typeof audio !== 'undefined' && audio.playDuelDraw) audio.playDuelDraw();
    }
    // Consume any early space presses during countdown
    consumeKey('Space');
  }
  if (f.armWrestlingActive) {
    f.armWrestleTimer += dt;
    // Opponent pushes back
    f.armWrestlePower -= f.armWrestleOpponentStr * dt * 30;
    // Decay player power
    f.armWrestlePower -= dt * 5;
    // Space to push
    if (consumeKey('Space')) {
      f.armWrestlePower += 8 + Math.random() * 4;
    }
    f.armWrestlePower = clamp(f.armWrestlePower, 0, 100);
    // Win/lose check
    if (f.armWrestlePower >= 95) {
      f.armWrestlingActive = false;
      game.gold += f.armWrestleBet;
      game.totalGoldEarned += f.armWrestleBet;
      showNotification('You WON arm wrestling! +$' + f.armWrestleBet + '!');
      if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
    } else if (f.armWrestlePower <= 5) {
      f.armWrestlingActive = false;
      showNotification('You LOST arm wrestling! -$25');
      if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
    }
    if (f.armWrestleTimer > 15) {
      // Timeout — draw, refund
      f.armWrestlingActive = false;
      game.gold += 25;
      showNotification('Arm wrestling draw! $25 refunded.');
    }
  }

  // ── FEATURE 9: DYNAMIC NPC RELATIONSHIPS (throttled to every 3s) ──
  f._relTimer = (f._relTimer || 0) + dt;
  if (game.activeCrime && f._relTimer > 3) {
    f._relTimer = 0;
    var crimePos = { x: game.activeCrime.x, y: game.activeCrime.y };
    var pNearCrime = dist(p, crimePos) < 150;
    for (var rni = 0; rni < game.npcs.length; rni++) {
      var rnpc = game.npcs[rni];
      if (rnpc.type === NPC_TYPES.TOWNSPERSON && rnpc.state !== 'dead' && dist(rnpc, crimePos) < 150) {
        rnpc.relationship = clamp((rnpc.relationship || 50) + (pNearCrime ? 1.5 : -0.6), -100, 100);
      }
    }
  }

  // ── FEATURE 10: MINE EXPLORATION ──
  if (f.mineActive) {
    // Player movement in mine
    var mSpeed = 2;
    if (keys['KeyW'] || keys['ArrowUp']) f.minePlayerY -= mSpeed;
    if (keys['KeyS'] || keys['ArrowDown']) f.minePlayerY += mSpeed;
    if (keys['KeyA'] || keys['ArrowLeft']) f.minePlayerX -= mSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) f.minePlayerX += mSpeed;
    f.minePlayerX = clamp(f.minePlayerX, 20, 280);
    f.minePlayerY = clamp(f.minePlayerY, 20, 180);

    // Collect gold nuggets
    var room = f.mineRooms[f.mineRoom];
    if (room) {
      for (var mgi = room.gold.length - 1; mgi >= 0; mgi--) {
        var mg = room.gold[mgi];
        if (!mg.collected && Math.hypot(f.minePlayerX - mg.x, f.minePlayerY - mg.y) < 15) {
          mg.collected = true;
          var mVal = rand(10, 50);
          f.mineGoldCollected += mVal;
          game.gold += mVal;
          game.totalGoldEarned += mVal;
          showNotification('Found gold nugget! +$' + mVal);
          if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
        }
      }
      // Fight mine enemies
      for (var mei = room.enemies.length - 1; mei >= 0; mei--) {
        var me = room.enemies[mei];
        if (me.hp <= 0) continue;
        // Enemy moves toward player
        var medx = f.minePlayerX - me.x;
        var medy = f.minePlayerY - me.y;
        var melen = Math.hypot(medx, medy) || 1;
        me.x += (medx / melen) * 0.8;
        me.y += (medy / melen) * 0.8;
        // Damage player
        if (Math.hypot(medx, medy) < 15 && Math.random() < 0.02) {
          if (!game._cheatMode) p.hp--;
          showNotification('Mine bandit hits you! -1 HP');
        }
        // Player attacks with Space
        if (consumeKey('Space') && Math.hypot(medx, medy) < 30) {
          me.hp -= 2;
          if (me.hp <= 0) {
            showNotification('Defeated mine bandit!');
            game.outlawsKilled++;
          }
        }
      }
      // Cave-in avoidance
      for (var mci = 0; mci < room.caveIns.length; mci++) {
        var mc = room.caveIns[mci];
        if (!mc.triggered && Math.hypot(f.minePlayerX - mc.x, f.minePlayerY - mc.y) < 20) {
          mc.triggered = true;
          if (Math.random() < 0.5 && !game._cheatMode) {
            p.hp -= 2;
            showNotification('Cave-in! -2 HP!');
          } else {
            showNotification('Narrowly avoided a cave-in!');
          }
        }
      }
    }
    // Move to next room (right edge)
    if (f.minePlayerX >= 275 && f.mineRoom < f.mineRooms.length - 1) {
      f.mineRoom++;
      f.minePlayerX = 25;
      showNotification('Entering mine room ' + (f.mineRoom + 1) + '...');
    }
    // Exit mine (left edge of room 0, or Escape)
    if ((f.mineRoom === 0 && f.minePlayerX <= 25) || consumeKey('Escape')) {
      f.mineActive = false;
      showNotification('Left the mine. Collected $' + f.mineGoldCollected + ' in gold.');
    }
  }
  // Start mine exploration — check for mine building or area
  if (!f.mineActive && game.state === 'playing') {
    // Check if near blacksmith (mine entrance) BEFORE consuming E
    var ptx3 = Math.floor(p.x / TILE);
    var pty3 = Math.floor(p.y / TILE);
    var nearMine = false;
    for (var mbi = 0; mbi < game.buildings.length; mbi++) {
      var mb = game.buildings[mbi];
      if (mb.type === BUILDING_TYPES.BLACKSMITH) {
        var mdist = Math.hypot(ptx3 - (mb.x + mb.w / 2), pty3 - (mb.y + mb.h));
        if (mdist < 4) nearMine = true;
      }
    }
    if (nearMine && consumeKey('KeyE')) {
      f.mineActive = true;
      f.mineRoom = 0;
      f.minePlayerX = 30;
      f.minePlayerY = 100;
      f.mineGoldCollected = 0;
      // Generate 3 rooms
      f.mineRooms = [];
      for (var mri = 0; mri < 3; mri++) {
        var roomGold = [];
        for (var rgi = 0; rgi < rand(2, 4); rgi++) {
          roomGold.push({ x: rand(40, 260), y: rand(30, 160), collected: false });
        }
        var roomEnemies = [];
        if (mri > 0 && Math.random() < 0.6) {
          roomEnemies.push({ x: rand(100, 200), y: rand(50, 140), hp: 4 });
        }
        var roomCaveIns = [];
        for (var rcci = 0; rcci < rand(1, 3); rcci++) {
          roomCaveIns.push({ x: rand(50, 250), y: rand(40, 150), triggered: false });
        }
        f.mineRooms.push({ gold: roomGold, enemies: roomEnemies, caveIns: roomCaveIns });
      }
      showNotification('Entered the mine! Collect gold, avoid cave-ins. ESC to exit.');
    }
  }

  // ── FEATURE 11: NEWSPAPER SYSTEM (Enhanced) ──
  if (game.dayCount > 0 && game.dayCount % 3 === 0 && f.newspaperShowDay !== game.dayCount) {
    f.newspaperShowDay = game.dayCount;
    f.newspaperReady = true;
    // Generate headlines
    f.newspaperHeadlines = [];
    var headlinePool = [
      game.crimesResolved + ' crimes resolved — Sheriff\'s reputation ' + (game.reputation > 60 ? 'soaring' : 'under scrutiny'),
      f.bountiesCollected > 0 ? f.bountiesCollected + ' bounties collected by the Sheriff' : 'Wanted criminals still at large',
      game.outlawsKilled + ' outlaws killed, ' + (game.outlawsArrested || 0) + ' arrested this season',
      'Weather forecast: ' + (f.weather !== 'clear' ? f.weather : 'clear skies ahead'),
      game.gold > 300 ? 'Town economy thriving under Sheriff\'s watch' : 'Economic downturn grips frontier town',
      game.reputation > 70 ? 'Citizens praise Sheriff as hero' : (game.reputation < 30 ? 'Citizens demand new sheriff' : 'Mixed feelings about local law enforcement'),
      f.festivalActive ? 'Town festival brings joy to citizens!' : 'Citizens await next town celebration',
      (typeof game.corruption !== 'undefined' && game.corruption > 30) ? 'CORRUPTION SCANDAL: Sheriff under investigation!' : 'Sheriff\'s office maintains clean record'
    ];
    for (var nhi = 0; nhi < Math.min(4, headlinePool.length); nhi++) {
      f.newspaperHeadlines.push(headlinePool[rand(0, headlinePool.length - 1)]);
    }
    showNotification('The Frontier Gazette has been published! Check your journal.');
  }
  // Show newspaper popup (P key or auto)
  if (f.newspaperReady && game.state === 'playing' && consumeKey('KeyP')) {
    f.newspaperReady = false;
    game.reputation = clamp(game.reputation + 1, 0, REPUTATION_MAX);
    var newsEl = document.getElementById('newspaper-popup');
    var newsContent = document.getElementById('newspaper-content');
    if (newsEl && newsContent) {
      var newsHTML = '<p style="text-align:center;font-style:italic;margin-bottom:8px;">Day ' + game.dayCount + ' Edition</p>';
      for (var nci = 0; nci < f.newspaperHeadlines.length; nci++) {
        newsHTML += '<p style="margin:6px 0;border-bottom:1px solid #8a7a5a;padding-bottom:4px;">' + f.newspaperHeadlines[nci] + '</p>';
      }
      newsHTML += '<p style="font-size:10px;color:#5a4a3a;text-align:center;margin-top:8px;">Reading the paper: +1 Rep</p>';
      newsContent.innerHTML = newsHTML;
      newsEl.classList.remove('hidden');
    }
  }

  // ── FEATURE 13: GOLD PANNING ──
  if (f.goldPanningLastDay !== game.dayCount) {
    f.goldPanningLastDay = game.dayCount;
    f.goldPanningDoneToday = 0;
  }
  if (f.goldPanningActive) {
    // Rocks scroll by, press E when gold flashes
    f._goldPanTimer = (f._goldPanTimer || 0) + dt;
    // Generate rocks
    if (f.goldPanningRocks.length < 8) {
      var isGold = Math.random() < 0.15;
      var isGem = Math.random() < 0.03;
      f.goldPanningRocks.push({
        x: 310,
        y: 90 + rand(-20, 20),
        speed: randF(1.5, 3),
        isGold: isGold,
        isGem: isGem,
        flash: isGold || isGem ? rand(5, 15) : 0
      });
    }
    var gpWrite = 0;
    for (var gpi = 0; gpi < f.goldPanningRocks.length; gpi++) {
      var gr = f.goldPanningRocks[gpi];
      gr.x -= gr.speed;
      if (gr.flash > 0) gr.flash--;
      if (gr.x >= -20) f.goldPanningRocks[gpWrite++] = gr;
    }
    f.goldPanningRocks.length = gpWrite;
    // Press E to grab
    if (consumeKey('KeyE')) {
      // Check if any gold/gem rock is near center (x=140-170)
      var grabbed = false;
      for (var ggi = f.goldPanningRocks.length - 1; ggi >= 0; ggi--) {
        var ggr = f.goldPanningRocks[ggi];
        if (ggr.x >= 120 && ggr.x <= 180) {
          if (ggr.isGem) {
            game.gold += 100;
            game.totalGoldEarned += 100;
            f.goldPanningScore += 100;
            showNotification('RARE GEMSTONE! +$100!');
            if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
            grabbed = true;
          } else if (ggr.isGold) {
            var gpVal = rand(5, 25);
            game.gold += gpVal;
            game.totalGoldEarned += gpVal;
            f.goldPanningScore += gpVal;
            showNotification('Gold nugget! +$' + gpVal);
            if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
            grabbed = true;
          } else {
            showNotification('Just a rock...');
          }
          f.goldPanningRocks.splice(ggi, 1);
          break;
        }
      }
      if (!grabbed) {
        showNotification('Nothing to grab! Wait for rocks to pass the center.');
      }
    }
    // Escape to stop
    if (consumeKey('Escape') || f._goldPanTimer > 20) {
      f.goldPanningActive = false;
      f.goldPanningDoneToday++;
      showNotification('Gold panning done. Earned $' + f.goldPanningScore + ' this session.');
    }
  }
  // Start gold panning near water with E key (same area as fishing but different key logic)
  // Actually triggered by pressing E near water when not in mine — handled alongside fishing
  // We'll use a separate trigger: if near water and no dialog, pressing G starts gold panning
  if (!f.goldPanningActive && !f.fishingMiniGame && !f.mineActive && game.state === 'playing' && consumeKey('KeyG')) {
    var ptx4 = Math.floor(p.x / TILE);
    var pty4 = Math.floor(p.y / TILE);
    var nearWater3 = false;
    for (var wdx3 = -2; wdx3 <= 2; wdx3++) {
      for (var wdy3 = -2; wdy3 <= 2; wdy3++) {
        var wtx3 = ptx4 + wdx3, wty3 = pty4 + wdy3;
        if (wtx3 >= 0 && wtx3 < MAP_W && wty3 >= 0 && wty3 < MAP_H && game.map[wty3][wtx3] === 5) nearWater3 = true;
      }
    }
    if (nearWater3 && f.goldPanningDoneToday < f.goldPanningMaxPerDay) {
      f.goldPanningActive = true;
      f.goldPanningRocks = [];
      f.goldPanningScore = 0;
      f._goldPanTimer = 0;
      showNotification('Gold panning! Press E when gold nuggets pass the center. (' + (f.goldPanningMaxPerDay - f.goldPanningDoneToday) + ' pans left today)');
    } else if (nearWater3 && f.goldPanningDoneToday >= f.goldPanningMaxPerDay) {
      showNotification('Already panned ' + f.goldPanningMaxPerDay + ' times today. Come back tomorrow.');
    }
  }

  // ── FEATURE 14: TOWN EVENTS / FESTIVALS ──
  if (game.dayCount > 0 && game.dayCount % 7 === 0 && f.festivalLastDay !== game.dayCount && !f.festivalActive) {
    f.festivalLastDay = game.dayCount;
    f.festivalActive = true;
    var festTypes = ['Rodeo', 'Harvest Festival', 'Independence Day', 'County Fair'];
    f.festivalType = festTypes[rand(0, festTypes.length - 1)];
    f.festivalTimer = DAY_LENGTH; // lasts 1 full day
    // Generate decorations on buildings
    f.festivalDecorations = [];
    for (var fdi = 0; fdi < game.buildings.length; fdi++) {
      var fb = game.buildings[fdi];
      f.festivalDecorations.push({
        x: fb.x * TILE + (fb.w * TILE) / 2,
        y: fb.y * TILE - 5,
        type: rand(0, 2) // 0=bunting, 1=flag, 2=banner
      });
    }
    showNotification('TOWN FESTIVAL: ' + f.festivalType + '! Bonus gold from all sources today!');
    addJournalEntry('Town festival: ' + f.festivalType + ' celebration!');
    if (typeof audio !== 'undefined' && audio.playCheer) audio.playCheer();
  }
  if (f.festivalActive) {
    f.festivalTimer -= dt;
    // Fireworks at night during festival
    if ((game.time > 0.8 || game.time < 0.15) && Math.random() < 0.03) {
      f.festivalFireworks.push({
        x: rand(100, gameCanvas.width - 100),
        y: rand(30, 150),
        color: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'][rand(0, 5)],
        life: 40,
        sparks: []
      });
      // Generate sparks for the firework
      var fw = f.festivalFireworks[f.festivalFireworks.length - 1];
      for (var fsi2 = 0; fsi2 < 12; fsi2++) {
        var fAngle = (fsi2 / 12) * Math.PI * 2;
        fw.sparks.push({
          x: fw.x, y: fw.y,
          dx: Math.cos(fAngle) * randF(1, 3),
          dy: Math.sin(fAngle) * randF(1, 3),
          life: rand(15, 30)
        });
      }
    }
    // Update fireworks (compact instead of splice)
    var fwWrite = 0;
    for (var fwi = 0; fwi < f.festivalFireworks.length; fwi++) {
      var fwork = f.festivalFireworks[fwi];
      fwork.life--;
      var spWrite = 0;
      for (var fsi3 = 0; fsi3 < fwork.sparks.length; fsi3++) {
        var sp = fwork.sparks[fsi3];
        sp.x += sp.dx;
        sp.y += sp.dy;
        sp.dy += 0.05;
        sp.life--;
        if (sp.life > 0) fwork.sparks[spWrite++] = sp;
      }
      fwork.sparks.length = spWrite;
      if (fwork.life > 0 || fwork.sparks.length > 0) f.festivalFireworks[fwWrite++] = fwork;
    }
    f.festivalFireworks.length = fwWrite;
    // Festival bonus gold — periodic bonus
    f._festBonusTimer = (f._festBonusTimer || 0) + dt;
    if (f._festBonusTimer > 30) {
      f._festBonusTimer = 0;
      var festBonus = rand(10, 25);
      game.gold += festBonus;
      game.totalGoldEarned += festBonus;
      showNotification('Festival commerce bonus: +$' + festBonus);
    }
    // NPC special festival dialogs are handled via relationship boost (throttled)
    f._festRelTimer = (f._festRelTimer || 0) + dt;
    if (f._festRelTimer > 10) {
      f._festRelTimer = 0;
      for (var fnpc = 0; fnpc < game.npcs.length; fnpc++) {
        if (game.npcs[fnpc].type === NPC_TYPES.TOWNSPERSON) {
          game.npcs[fnpc].relationship = clamp((game.npcs[fnpc].relationship || 50) + 1, -100, 100);
        }
      }
    }
    // End festival
    if (f.festivalTimer <= 0) {
      f.festivalActive = false;
      f.festivalFireworks = [];
      f.festivalDecorations = [];
      showNotification('The ' + f.festivalType + ' festival has ended.');
    }
  }

  // ── FEATURE 15: REVENGE SYSTEM ──
  // When outlaw killed/arrested, chance to queue revenge seeker
  f._lastOutlawsKilledRevenge = f._lastOutlawsKilledRevenge || 0;
  f._lastOutlawsArrestedRevenge = f._lastOutlawsArrestedRevenge || 0;
  var totalNeutralized = (game.outlawsKilled || 0) + (game.outlawsArrested || 0);
  var prevNeutralized = f._lastOutlawsKilledRevenge + f._lastOutlawsArrestedRevenge;
  if (totalNeutralized > prevNeutralized) {
    f._lastOutlawsKilledRevenge = game.outlawsKilled || 0;
    f._lastOutlawsArrestedRevenge = game.outlawsArrested || 0;
    // 30% chance of revenge (10% if intimidated bosses = high rep)
    var revengeChance = game.reputation > 80 ? 0.10 : 0.30;
    if (Math.random() < revengeChance) {
      var revDay = game.dayCount + rand(2, 3);
      var revNames = ['Vengeance Vic', 'Grudge Grady', 'Payback Pete', 'Fury Frank', 'Wrath Warren',
        'Retribution Ray', 'Malice Mike', 'Rancor Russ', 'Spite Steve', 'Vendetta Val'];
      f.revengeQueue.push({
        spawnDay: revDay,
        name: revNames[rand(0, revNames.length - 1)]
      });
    }
  }
  // Spawn queued revenge seekers (compact)
  var rqWrite = 0;
  for (var rqi = 0; rqi < f.revengeQueue.length; rqi++) {
    if (game.dayCount >= f.revengeQueue[rqi].spawnDay) {
      var revInfo = f.revengeQueue[rqi];
      var revNPC = createNPC(game.npcs.length + 950 + rqi, NPC_TYPES.OUTLAW, revInfo.name,
        rand(2, MAP_W - 2), rand(2, MAP_H - 2), null);
      revNPC.hostile = true;
      revNPC.hp = 10;
      revNPC.maxHp = 10;
      revNPC.speed = 2.5;
      revNPC._revengeSeeker = true;
      game.npcs.push(revNPC);
      f.revengeSeekers.push(revNPC);
      showNotification('REVENGE! ' + revInfo.name + ' is hunting you!');
      addJournalEntry('A revenge seeker named ' + revInfo.name + ' is after you!');
      if (typeof audio !== 'undefined' && audio.playPanic) audio.playPanic();
    } else {
      f.revengeQueue[rqWrite++] = f.revengeQueue[rqi];
    }
  }
  f.revengeQueue.length = rqWrite;
  // Revenge seekers actively hunt player (compact)
  var rsWrite = 0;
  for (var rsi = 0; rsi < f.revengeSeekers.length; rsi++) {
    var rs = f.revengeSeekers[rsi];
    if (rs.state === 'dead') {
      if (!rs._revengeRewardGiven) {
        rs._revengeRewardGiven = true;
        var revReward = rand(50, 150);
        game.gold += revReward;
        game.totalGoldEarned += revReward;
        game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
        f.revengeKills++;
        showNotification('Revenge seeker defeated! +$' + revReward + ', +5 Rep (FEARED)');
      }
      continue;
    }
    if (rs.state === 'arrested') continue;
    f.revengeSeekers[rsWrite++] = rs;
    // Active hunting — move toward player
    var rsdx = p.x - rs.x;
    var rsdy = p.y - rs.y;
    var rslen = Math.hypot(rsdx, rsdy) || 1;
    if (rslen > 30) {
      var rnx = rs.x + (rsdx / rslen) * rs.speed;
      var rny = rs.y + (rsdy / rslen) * rs.speed;
      if (canMove(rnx, rs.y, 5)) rs.x = rnx;
      if (canMove(rs.x, rny, 5)) rs.y = rny;
    }
  }
  f.revengeSeekers.length = rsWrite;

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
  if (game.state === 'playing' && consumeKey('KeyK')) {
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
  if (game.state === 'office' || game.state === 'gameover' || game.state === 'paused') return;
  var f = game._features;
  var w = gameCanvas.width;
  var h = gameCanvas.height;
  var camX = game.camera ? game.camera.x : 0;
  var camY = game.camera ? game.camera.y : 0;
  var now = Date.now();
  var sinNow = Math.sin(now * 0.005);

  // ── Weather Effects ──

  // Rain (batched single path)
  if (f.weather === 'rain') {
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < f.raindrops.length; i++) {
      var rd = f.raindrops[i];
      ctx.moveTo(rd.x, rd.y);
      ctx.lineTo(rd.x - 1, rd.y + 8);
    }
    ctx.stroke();
    // Rain overlay
    ctx.fillStyle = 'rgba(40, 60, 80, 0.15)';
    ctx.fillRect(0, 0, w, h);
  }

  // Sandstorm (reduced particle count)
  if (f.weather === 'sandstorm') {
    ctx.fillStyle = 'rgba(180, 150, 100, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(200, 170, 120, 0.25)';
    for (var si = 0; si < 8; si++) {
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

  // ── Tumbleweeds (simplified — no per-frame trig) ──
  ctx.fillStyle = PALETTE.tumbleweed || '#a89060';
  for (var ti = 0; ti < f.tumbleweeds.length; ti++) {
    var tw = f.tumbleweeds[ti];
    var sx = tw.x - camX;
    var sy = tw.y - camY;
    if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
    ctx.beginPath();
    ctx.arc(sx, sy, tw.size, 0, Math.PI * 2);
    ctx.fill();
    // Simple cross lines instead of 6 trig spikes
    ctx.strokeStyle = '#8a7050';
    ctx.lineWidth = 1;
    var ts = tw.size * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx - ts, sy); ctx.lineTo(sx + ts, sy);
    ctx.moveTo(sx, sy - ts); ctx.lineTo(sx, sy + ts);
    ctx.stroke();
  }

  // ── Wildlife (simple colored shapes instead of expensive emoji) ──
  var animalColors = { rabbit: '#c8b090', hawk: '#8b5e3c', lizard: '#6b8e23', deer: '#a0522d', coyote: '#808080', owl: '#d2b48c', bat: '#444' };
  var animalSizes = { rabbit: 3, hawk: 4, lizard: 3, deer: 5, coyote: 4, owl: 3, bat: 3 };
  for (var wii = 0; wii < f.wildlife.length; wii++) {
    var wl = f.wildlife[wii];
    var wx = wl.x - camX;
    var wy = wl.y - camY;
    if (wx < -20 || wx > w + 20 || wy < -20 || wy > h + 20) continue;
    ctx.fillStyle = animalColors[wl.type] || '#999';
    var aSize = animalSizes[wl.type] || 3;
    ctx.fillRect(wx - aSize, wy - aSize, aSize * 2, aSize * 2);
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
    // Sparkle (reduced frequency)
    if (sinNow > 0.3) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(tcx + 3, tcy - 4, 2, 2);
    }
  }

  // ── Gold Nugget Drops ──
  for (var gni = 0; gni < f.goldNuggetDrops.length; gni++) {
    var gn = f.goldNuggetDrops[gni];
    var gnx = gn.x - camX;
    var gny = gn.y - camY;
    if (gnx < -20 || gnx > w + 20 || gny < -20 || gny > h + 20) continue;
    // Bobbing
    gny += sinNow * 2;
    // Gold nugget
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(gnx, gny, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8c0';
    ctx.fillRect(gnx - 1, gny - 1, 2, 2);
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
    var tailAngle = sinNow * 0.5;
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
      ctx.fillStyle = 'rgba(255, 0, 0, ' + (0.2 + sinNow * 0.1) + ')';
      ctx.beginPath();
      ctx.arc(tmx, tmy, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Film Grain (reduced) ──
  if (f.filmGrain) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (var gri = 0; gri < 10; gri++) {
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
    ctx.fillStyle = 'rgba(200, 0, 0, ' + (0.1 + sinNow * 0.05) + ')';
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

  // ── Season & Weather HUD (no emoji — text only for performance) ──
  ctx.fillStyle = '#a09070';
  ctx.font = '9px monospace';
  ctx.fillText(f.season.toUpperCase(), w - 80, 55);
  if (f.weather !== 'clear') {
    ctx.fillText(f.weather.toUpperCase(), w - 80, 68);
  }

  // ── Rival Sheriff Status ──
  if (f.rivalRep > 0) {
    ctx.fillStyle = f.rivalRep > game.reputation ? '#cc4444' : '#44cc44';
    ctx.font = '8px monospace';
    ctx.fillText('Rival: ' + f.rivalName + ' (' + f.rivalRep + ')', w - 150, 82);
  }

  // ════════════════════════════════════════════════════
  // ══ NEW 15 FEATURES — RENDER ══
  // ════════════════════════════════════════════════════

  // ── FEATURE 1: WANTED NPC indicators + bounty float text ──
  for (var wri = 0; wri < f.wantedNPCs.length; wri++) {
    var wrn = f.wantedNPCs[wri];
    if (wrn.state === 'dead' || wrn.state === 'arrested') continue;
    var wsx = wrn.x - camX;
    var wsy = wrn.y - camY;
    if (wsx < -30 || wsx > w + 30 || wsy < -30 || wsy > h + 30) continue;
    // Pulsing red "WANTED" label
    ctx.fillStyle = 'rgba(200, 0, 0, ' + (0.6 + sinNow * 0.3) + ')';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WANTED $' + (wrn._wantedBounty || 200), wsx, wsy - 22);
    // Skull icon
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(wsx, wsy - 28, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = 'left';
  }
  // Bounty collected float text
  if (f._bountyFloatText) {
    var bft = f._bountyFloatText;
    var bfx = bft.x - camX;
    var bfy = bft.y - camY;
    var bfAlpha = bft.life / 90;
    ctx.globalAlpha = bfAlpha;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bft.text, bfx, bfy);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
  // HUD: wanted NPC counter
  if (f.wantedNPCs.length > 0) {
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('WANTED: ' + f.wantedNPCs.length + ' targets', 10, h - 60);
  }

  // ── FEATURE 2: FOG & DUST STORM rendering ──
  if (f.weather === 'fog') {
    // White semi-transparent overlay
    ctx.fillStyle = 'rgba(200, 210, 220, 0.25)';
    ctx.fillRect(0, 0, w, h);
    // Fog blobs
    for (var fgi = 0; fgi < f.fogParticles.length; fgi++) {
      var fg = f.fogParticles[fgi];
      ctx.fillStyle = 'rgba(220, 230, 240, ' + fg.alpha + ')';
      ctx.beginPath();
      ctx.arc(fg.x, fg.y, fg.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (f.weather === 'dust_storm') {
    // Orange-brown overlay
    ctx.fillStyle = 'rgba(160, 120, 60, 0.35)';
    ctx.fillRect(0, 0, w, h);
    // Blowing particles
    for (var dsri = 0; dsri < f.dustStormParticles.length; dsri++) {
      var dsp = f.dustStormParticles[dsri];
      ctx.fillStyle = 'rgba(180, 140, 80, ' + dsp.alpha + ')';
      ctx.fillRect(dsp.x, dsp.y, dsp.size * 2, dsp.size);
    }
  }

  // ── FEATURE 3: HORSE RACING overlay ──
  if (f.horseRaceActive) {
    // Draw race track overlay
    ctx.fillStyle = 'rgba(10, 6, 2, 0.85)';
    ctx.fillRect(w * 0.05, h * 0.3, w * 0.9, h * 0.4);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.05, h * 0.3, w * 0.9, h * 0.4);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HORSE RACE', w / 2, h * 0.3 + 20);

    var trackLeft = w * 0.1;
    var trackRight = w * 0.85;
    var trackW = trackRight - trackLeft;
    var raceLen2 = 600;

    // Draw lanes
    var laneNames = ['YOU', 'Horse A', 'Horse B', 'Horse C'];
    var lanePositions = [f.horseRacePlayerPos, f.horseRaceAI[0], f.horseRaceAI[1], f.horseRaceAI[2]];
    var laneColors = ['#ffd700', '#cc4444', '#44cc44', '#4488cc'];
    for (var li = 0; li < 4; li++) {
      var ly = h * 0.38 + li * 28;
      // Track lane
      ctx.fillStyle = '#3a2a14';
      ctx.fillRect(trackLeft, ly - 5, trackW, 16);
      ctx.strokeStyle = '#5a3a18';
      ctx.strokeRect(trackLeft, ly - 5, trackW, 16);
      // Horse position
      var hx = trackLeft + (lanePositions[li] / raceLen2) * trackW;
      hx = Math.min(hx, trackRight);
      ctx.fillStyle = laneColors[li];
      ctx.fillRect(hx - 6, ly - 3, 12, 12);
      // Label
      ctx.fillStyle = laneColors[li];
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(laneNames[li], trackLeft - 5, ly + 6);
    }
    // Finish line
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(trackRight, h * 0.35);
    ctx.lineTo(trackRight, h * 0.65);
    ctx.stroke();
    ctx.setLineDash([]);

    // Phase text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    if (f.horseRacePhase === 0) {
      ctx.fillText('Starting in ' + Math.ceil(f.horseRaceTimer) + '...', w / 2, h * 0.68);
    } else if (f.horseRacePhase === 1) {
      ctx.fillText('PRESS SPACE TO BOOST!', w / 2, h * 0.68);
    } else {
      ctx.fillText('RACE OVER!', w / 2, h * 0.68);
    }
    ctx.textAlign = 'left';
  }

  // ── FEATURE 4: BANK ROBBERY timer ──
  if (f.bankRobberyActive) {
    ctx.fillStyle = 'rgba(150, 0, 0, 0.8)';
    ctx.fillRect(w / 2 - 110, 105, 220, 30);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BANK ROBBERY: ' + Math.ceil(f.bankRobberyTimer) + 's remaining', w / 2, 125);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 5: CAMPFIRE RESTING indicator ──
  if (f.campfireResting) {
    ctx.fillStyle = 'rgba(20, 12, 4, 0.6)';
    ctx.fillRect(w / 2 - 100, h - 80, 200, 24);
    ctx.fillStyle = '#ffcc00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RESTING... (ESC to stand)', w / 2, h - 64);
    if (f.campfireSupplies > 0) {
      ctx.fillText('Cooking... (' + f.campfireSupplies + ' supplies)', w / 2, h - 52);
    }
    ctx.textAlign = 'left';
  }

  // ── FEATURE 6: WORLD DEPUTIES rendering ──
  for (var wdri = 0; wdri < f.worldDeputies.length; wdri++) {
    var wdr = f.worldDeputies[wdri];
    var wdx4 = wdr.x - camX;
    var wdy4 = wdr.y - camY;
    if (wdx4 < -20 || wdx4 > w + 20 || wdy4 < -20 || wdy4 > h + 20) continue;
    // Body
    ctx.fillStyle = '#4a5a8a';
    ctx.fillRect(wdx4 - 5, wdy4 - 3, 10, 12);
    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.beginPath();
    ctx.arc(wdx4, wdy4 - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    // Hat
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(wdx4 - 6, wdy4 - 12, 12, 3);
    ctx.fillRect(wdx4 - 4, wdy4 - 15, 8, 4);
    // Badge
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(wdx4 - 1, wdy4 - 1, 3, 3);
    // Name & HP
    ctx.fillStyle = '#88aacc';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(wdr.name, wdx4, wdy4 - 18);
    // HP bar
    ctx.fillStyle = '#440000';
    ctx.fillRect(wdx4 - 10, wdy4 + 12, 20, 3);
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(wdx4 - 10, wdy4 + 12, (wdr.hp / wdr.maxHp) * 20, 3);
    ctx.textAlign = 'left';
    // Fighting indicator
    if (wdr.state === 'fighting') {
      ctx.fillStyle = '#ff4444';
      ctx.font = '6px monospace';
      ctx.fillText('!', wdx4 + 8, wdy4 - 10);
    }
  }

  // ── FEATURE 7: FISHING MINI-GAME overlay ──
  if (f.fishingMiniGame) {
    ctx.fillStyle = 'rgba(10, 30, 50, 0.85)';
    ctx.fillRect(w / 2 - 120, h / 2 - 60, 240, 120);
    ctx.strokeStyle = '#4a8aaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 120, h / 2 - 60, 240, 120);

    ctx.fillStyle = '#88ccff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FISHING', w / 2, h / 2 - 40);

    // Bar background
    var barX = w / 2 - 90;
    var barY = h / 2 - 15;
    var barW = 180;
    var barH = 20;
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(barX, barY, barW, barH);
    // Green zone
    ctx.fillStyle = 'rgba(50, 200, 50, 0.5)';
    ctx.fillRect(barX + f.fishingGreenStart * barW, barY, f.fishingGreenZone * barW, barH);
    // Cursor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barX + f.fishingBarPos * barW - 2, barY - 3, 4, barH + 6);

    ctx.fillStyle = '#88ccff';
    ctx.font = '10px monospace';
    ctx.fillText('Press SPACE in the green zone!', w / 2, h / 2 + 35);
    ctx.fillText('ESC to cancel', w / 2, h / 2 + 50);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 8: ARM WRESTLING overlay ──
  if (f._armWrestleCountdownActive) {
    ctx.fillStyle = 'rgba(30, 18, 6, 0.9)';
    ctx.fillRect(w / 2 - 150, h / 2 - 80, 300, 160);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 150, h / 2 - 80, 300, 160);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARM WRESTLING vs ' + f.armWrestleOpponentName, w / 2, h / 2 - 55);
    ctx.fillStyle = '#ddd';
    ctx.font = '10px monospace';
    ctx.fillText('Bet: $25 each — Winner takes $' + f.armWrestleBet, w / 2, h / 2 - 30);
    // Big countdown number
    var countNum = Math.ceil(f.armWrestleCountdown);
    if (countNum < 1) countNum = 'GO!';
    ctx.fillStyle = countNum === 'GO!' ? '#44ff44' : '#ff8844';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('' + countNum, w / 2, h / 2 + 30);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Get ready to MASH SPACE!', w / 2, h / 2 + 60);
    ctx.textAlign = 'left';
  }
  if (f.armWrestlingActive) {
    ctx.fillStyle = 'rgba(30, 18, 6, 0.9)';
    ctx.fillRect(w / 2 - 150, h / 2 - 80, 300, 160);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 150, h / 2 - 80, 300, 160);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARM WRESTLING vs ' + f.armWrestleOpponentName, w / 2, h / 2 - 55);

    // Power bar
    var awBarX = w / 2 - 120;
    var awBarY = h / 2 - 20;
    var awBarW = 240;
    var awBarH = 25;
    ctx.fillStyle = '#1a0a04';
    ctx.fillRect(awBarX, awBarY, awBarW, awBarH);
    // Player side (left=lose, right=win)
    var awPct = f.armWrestlePower / 100;
    ctx.fillStyle = awPct > 0.5 ? '#44cc44' : (awPct > 0.25 ? '#cccc44' : '#cc4444');
    ctx.fillRect(awBarX, awBarY, awPct * awBarW, awBarH);
    // Center line
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w / 2, awBarY);
    ctx.lineTo(w / 2, awBarY + awBarH);
    ctx.stroke();
    // Win/lose labels
    ctx.fillStyle = '#cc4444';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LOSE', awBarX + 5, awBarY + 16);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#44cc44';
    ctx.fillText('WIN', awBarX + awBarW - 5, awBarY + 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8d5a3';
    ctx.font = '11px monospace';
    ctx.fillText('MASH SPACE! Bet: $' + f.armWrestleBet, w / 2, h / 2 + 40);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 9: NPC RELATIONSHIP colors (only near player) ──
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  for (var reli = 0; reli < game.npcs.length; reli++) {
    var relNPC = game.npcs[reli];
    if (relNPC.state === 'dead' || relNPC.state === 'arrested') continue;
    if (relNPC.type === NPC_TYPES.OUTLAW || relNPC.type === NPC_TYPES.BOUNTY) continue;
    var relX = relNPC.x - camX;
    var relY = relNPC.y - camY;
    if (relX < -30 || relX > w + 30 || relY < -30 || relY > h + 30) continue;
    var rel = relNPC.relationship || 50;
    ctx.fillStyle = rel > 70 ? '#44cc44' : (rel > 30 ? '#cccc44' : '#cc4444');
    ctx.fillText(relNPC.name, relX, relY - 16);
  }
  ctx.textAlign = 'left';

  // ── FEATURE 10: MINE EXPLORATION overlay ──
  if (f.mineActive) {
    // Full screen mine view
    ctx.fillStyle = '#0a0804';
    ctx.fillRect(0, 0, w, h);
    // Mine room
    var mOffX = (w - 300) / 2;
    var mOffY = (h - 200) / 2;
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(mOffX, mOffY, 300, 200);
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 2;
    ctx.strokeRect(mOffX, mOffY, 300, 200);
    // Room label
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MINE - Room ' + (f.mineRoom + 1) + '/3', w / 2, mOffY - 10);
    // Draw room contents
    var room2 = f.mineRooms[f.mineRoom];
    if (room2) {
      // Gold nuggets
      for (var mgr = 0; mgr < room2.gold.length; mgr++) {
        var mg2 = room2.gold[mgr];
        if (mg2.collected) continue;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(mOffX + mg2.x, mOffY + mg2.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff8c0';
        ctx.fillRect(mOffX + mg2.x - 1, mOffY + mg2.y - 1, 2, 2);
      }
      // Enemies
      for (var mer = 0; mer < room2.enemies.length; mer++) {
        var me2 = room2.enemies[mer];
        if (me2.hp <= 0) continue;
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(mOffX + me2.x - 5, mOffY + me2.y - 6, 10, 12);
        ctx.fillStyle = '#880000';
        ctx.fillRect(mOffX + me2.x - 6, mOffY + me2.y - 10, 12, 4);
        ctx.fillStyle = '#ff4444';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BANDIT', mOffX + me2.x, mOffY + me2.y - 12);
      }
      // Cave-ins
      for (var mcr = 0; mcr < room2.caveIns.length; mcr++) {
        var mc2 = room2.caveIns[mcr];
        if (mc2.triggered) continue;
        ctx.fillStyle = 'rgba(100, 80, 50, 0.4)';
        ctx.beginPath();
        ctx.arc(mOffX + mc2.x, mOffY + mc2.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6a5a3a';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('crack', mOffX + mc2.x, mOffY + mc2.y + 3);
      }
    }
    // Player
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(mOffX + f.minePlayerX - 4, mOffY + f.minePlayerY - 6, 8, 12);
    ctx.fillStyle = PALETTE.skin;
    ctx.beginPath();
    ctx.arc(mOffX + f.minePlayerX, mOffY + f.minePlayerY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    // Instructions
    ctx.fillStyle = '#a09070';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WASD: Move | SPACE: Attack | ESC: Exit | Right edge: Next room', w / 2, mOffY + 218);
    ctx.fillText('Gold collected: $' + f.mineGoldCollected, w / 2, mOffY + 230);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 13: GOLD PANNING overlay ──
  if (f.goldPanningActive) {
    ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
    ctx.fillRect(w / 2 - 160, h / 2 - 70, 320, 140);
    ctx.strokeStyle = '#8a7a5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 160, h / 2 - 70, 320, 140);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GOLD PANNING', w / 2, h / 2 - 50);

    // Pan area
    var panLeft = w / 2 - 140;
    var panY = h / 2 - 15;
    ctx.fillStyle = '#2a1a08';
    ctx.fillRect(panLeft, panY, 280, 40);
    // Center zone marker
    ctx.strokeStyle = '#ffd700';
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(panLeft + 110, panY - 3, 60, 46);
    ctx.setLineDash([]);

    // Rocks
    for (var gpr = 0; gpr < f.goldPanningRocks.length; gpr++) {
      var grock = f.goldPanningRocks[gpr];
      var grx = panLeft + (grock.x / 310) * 280;
      var gry = panY + 20 + (grock.y - 90);
      if (grock.isGem) {
        ctx.fillStyle = '#ff44ff';
        ctx.beginPath();
        ctx.arc(grx, gry, 5, 0, Math.PI * 2);
        ctx.fill();
        if (grock.flash > 0) {
          ctx.fillStyle = 'rgba(255, 100, 255, 0.5)';
          ctx.beginPath();
          ctx.arc(grx, gry, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (grock.isGold) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(grx, gry, 4, 0, Math.PI * 2);
        ctx.fill();
        if (grock.flash > 0) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(grx, gry, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#6a5a4a';
        ctx.beginPath();
        ctx.arc(grx, gry, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#e8d5a3';
    ctx.font = '10px monospace';
    ctx.fillText('Press E when GOLD passes the center! ESC to stop.', w / 2, h / 2 + 55);
    ctx.fillText('Score: $' + f.goldPanningScore, w / 2, h / 2 + 68);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 14: FESTIVAL decorations & fireworks ──
  if (f.festivalActive) {
    // Festival banner
    ctx.fillStyle = 'rgba(20, 12, 4, 0.8)';
    ctx.fillRect(w / 2 - 100, 60, 200, 22);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FESTIVAL: ' + f.festivalType.toUpperCase(), w / 2, 76);
    ctx.textAlign = 'left';

    // Building decorations (bunting/flags)
    for (var fdi2 = 0; fdi2 < f.festivalDecorations.length; fdi2++) {
      var fdec = f.festivalDecorations[fdi2];
      var fdx2 = fdec.x - camX;
      var fdy2 = fdec.y - camY;
      if (fdx2 < -30 || fdx2 > w + 30 || fdy2 < -30 || fdy2 > h + 30) continue;
      if (fdec.type === 0) {
        // Bunting
        ctx.strokeStyle = '#cc4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fdx2 - 15, fdy2);
        ctx.quadraticCurveTo(fdx2, fdy2 + 8, fdx2 + 15, fdy2);
        ctx.stroke();
        ctx.strokeStyle = '#4444cc';
        ctx.beginPath();
        ctx.moveTo(fdx2 - 10, fdy2);
        ctx.quadraticCurveTo(fdx2, fdy2 + 6, fdx2 + 10, fdy2);
        ctx.stroke();
      } else if (fdec.type === 1) {
        // Flag
        ctx.fillStyle = '#cc4444';
        ctx.fillRect(fdx2, fdy2 - 10, 2, 12);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(fdx2 + 2, fdy2 - 10, 8, 6);
      } else {
        // Banner
        ctx.fillStyle = '#ffd700';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FEST', fdx2, fdy2 - 2);
        ctx.textAlign = 'left';
      }
    }

    // Fireworks
    for (var fwri = 0; fwri < f.festivalFireworks.length; fwri++) {
      var fwk = f.festivalFireworks[fwri];
      for (var fsi4 = 0; fsi4 < fwk.sparks.length; fsi4++) {
        var sp2 = fwk.sparks[fsi4];
        var spAlpha = sp2.life / 30;
        ctx.globalAlpha = spAlpha;
        ctx.fillStyle = fwk.color;
        ctx.beginPath();
        ctx.arc(sp2.x, sp2.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── FEATURE 15: REVENGE SEEKER indicators ──
  for (var rsri = 0; rsri < f.revengeSeekers.length; rsri++) {
    var rsr = f.revengeSeekers[rsri];
    if (rsr.state === 'dead') continue;
    var rsx = rsr.x - camX;
    var rsy = rsr.y - camY;
    if (rsx < -30 || rsx > w + 30 || rsy < -30 || rsy > h + 30) continue;
    // Pulsing danger label
    ctx.fillStyle = 'rgba(255, 0, 0, ' + (0.6 + sinNow * 0.3) + ')';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REVENGE', rsx, rsy - 22);
    ctx.textAlign = 'left';
  }

  // ── FEATURE 11: Newspaper HUD hint ──
  if (f.newspaperReady) {
    ctx.fillStyle = '#ccaa55';
    ctx.font = '9px monospace';
    ctx.fillText('Press P to read the Frontier Gazette', 10, h - 75);
  }

  // ── Bank closed indicator ──
  if (f.bankClosedUntilDay >= game.dayCount) {
    ctx.fillStyle = '#cc4444';
    ctx.font = '9px monospace';
    ctx.fillText('BANK CLOSED (reopens day ' + (f.bankClosedUntilDay + 1) + ')', 10, h - 90);
  }

  // ── Hidden Crates from telegram events ──
  if (game._hiddenCrates && game._hiddenCrates.length > 0) {
    for (var ci = 0; ci < game._hiddenCrates.length; ci++) {
      var crate = game._hiddenCrates[ci];
      if (crate.found) continue;
      var cx = crate.x - camX;
      var cy = crate.y - camY;
      if (cx < -30 || cx > w + 30 || cy < -30 || cy > h + 30) continue;
      // Sparkle effect to hint at location
      var sparkle = 0.3 + sinNow * 0.3;
      ctx.globalAlpha = sparkle;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + sinNow * 5, cy - 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Crate box
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(cx - 6, cy - 2, 12, 10);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(cx - 5, cy - 1, 10, 8);
      ctx.fillStyle = '#3a2a0a';
      ctx.fillRect(cx - 6, cy + 2, 12, 1);
    }
  }
}

// ── Newspaper Close ──
var newsCloseBtn = document.getElementById('newspaper-close');
if (newsCloseBtn) {
  newsCloseBtn.addEventListener('click', function() {
    document.getElementById('newspaper-popup').classList.add('hidden');
  });
}

// ============================================================
// FEATURES V2 — 143 New Features Extension
// Appended after original features.js (line 2978)
// ============================================================

// ── Perk Roulette definitions (kept outside game state so functions survive JSON round-trip) ──
var PERK_ROULETTE_DEFS = [
  { name: '+5 Max HP', applyFn: function(p, f2) { p.maxHp += 5; p.hp += 5; } },
  { name: '+$50 Gold', applyFn: function(p, f2) { game.gold += 50; } },
  { name: '+5 Arrows', applyFn: function(p, f2) { f2.arrows += 5; } },
  { name: '+3 Bear Traps', applyFn: function(p, f2) { f2.bearTrapCount += 3; } },
  { name: '+2 Throwing Stars', applyFn: function(p, f2) { f2.throwingStars += 2; } },
  { name: '+10% Armor', applyFn: function(p, f2) { f2.armor.vest = Math.min(3, f2.armor.vest + 1); } }
];

// ── V2 Lazy State Init ──
function initFeaturesV2() {
  if (game._featuresV2) return;
  initFeatures(); // ensure base is init'd
  game._featuresV2 = {
    // ── PHASE 3: Combat Depth (26-50) ──
    arrows: 0, bowCharging: false, bowChargeTime: 0, bowArrows: [],
    tomahawkActive: false, tomahawkPos: { x: 0, y: 0 }, tomahawkReturn: false,
    tomahawkCooldown: 0, tomahawkAngle: 0, tomahawkStartX: 0, tomahawkStartY: 0,
    tomahawkDx: 0, tomahawkDy: 0, tomahawkDist: 0,
    turrets: [],
    cannonBalls: 5, cannonCooldown: 0, cannonProjectiles: [],
    weaponUpgrades: { revolver: 0, shotgun: 0, rifle: 0 },
    weaponSkins: { revolver: 'default', shotgun: 'default', rifle: 'default' },
    unlockedSkins: [],
    critCount: 0,
    armor: { hat: 0, vest: 0, boots: 0, gloves: 0 }, armorDR: 0,
    hasShield: false, shieldBashCooldown: 0,
    poisonBullets: 0, venomCount: 0, poisonedTargets: [],
    incendiaryRounds: 0, firePatches: [],
    bulletTimeActive: false, bulletTimeTimer: 0,
    executionCount: 0,
    dualPistols: false,
    inCover: false, coverPos: null,
    ricochetUnlocked: false,
    bearTraps: [], bearTrapCount: 0,
    trampleCooldown: 0,
    throwingStars: 0, thrownStars: [],
    warCryCooldown: 0,
    comboFinisherReady: false,
    styleKills: 0,
    bossWeapons: [],
    weaponWheelOpen: false,
    lastStandActive: false, lastStandTimer: 0,

    // ── PHASE 4: NPC & Social (51-75) ──
    friendships: {},
    giftCooldown: 0,
    romanceTargets: [], romanceStage: {},
    homeVisitActive: false, homeVisitNPC: null, homeVisitTimer: 0,
    npcMoods: {},
    factions: { townsfolk: 50, ranchers: 50, merchants: 50, church: 50 },
    factionMissions: {}, activeFactionMission: null,
    rivalryPairs: [], activeMediation: null,
    informantsPaid: [],
    companion: null, companionCooldown: 0, companionPos: { x: 0, y: 0 },
    npcStories: {}, storyProgress: {},
    meetingDay: 0, meetingActive: false, meetingIssue: null,
    barterActive: false, barterNPC: null,
    witnesses: [],
    npcAges: {},
    hiredGuns: [], hiredGunTimer: 0,
    rumorQueue: [], activeRumors: [],
    shopRotationDay: 0, shopRareItem: null,
    merchantDay: 0, merchantActive: false, merchantItems: [],
    posseCooldown: 0, posseActive: false, posseMembers: [], posseTimer: 0,
    memorials: [],

    // ── PHASE 4: Exploration & World (101-125) ──
    caves: [], caveActive: false, caveRoom: 0, caveEnemies: [], caveLoot: [],
    cavePlayerX: 150, cavePlayerY: 100,
    mineV2Active: false, mineV2Level: 0,
    ghostSightings: [], ghostQuestActive: false, ghostTimer: 0,
    weatherEvent: null, weatherEventTimer: 0,
    season: 'spring', seasonDay: 0,
    huntedAnimals: 0, pelts: { rabbit: 0, deer: 0, wolf: 0, bear: 0 },
    fishLog: {}, rodLevel: 0,
    fishSpecies: ['Catfish','Bass','Trout','Salmon','Perch','Bluegill','Pike','Walleye','Sturgeon','GoldenCarp'],
    prospectingActive: false, prospectCount: 0, prospectTimer: 0,
    storiesHeard: [], storyActive: false, storyText: '', storyTimer: 0,
    vistasFound: [], vistaLocations: [],
    inQuicksand: false, quicksandTimer: 0, quicksandLocations: [],
    bridges: [],
    disasterActive: null, disasterTimer: 0,
    posterPieces: {}, completedPosters: 0,
    oasisFound: [], oasisLocations: [],
    propsFound: [], propLocations: [],
    tunnelDiscovered: [], inTunnel: false, tunnelLocations: [],
    landmarksFound: [], landmarkLocations: [],
    onRooftop: false, rooftopTimer: 0,
    capsulesFound: [], capsuleLocations: [],
    meteorShowerActive: false, meteoriteFound: false, meteorParticles: [],
    peacefulMoment: false, peacefulTimer: 0, peacefulStandStill: 0,

    // ── PHASE 5: Economy & Property (76-100) ──
    ownedPropertiesV2: [], propertyIncome: 0,
    saloonOwned: false, saloonPricing: 'normal', saloonStaff: 0,
    ranchOwned: false, cattle: 0, cattleFed: true, cattleFeedDay: -1,
    miningClaim: false, mineYield: 0, pickLevel: 0,
    storeOwned: false, storeMarkup: 'normal',
    stocks: {
      railroad: { price: 100, owned: 0 },
      mining: { price: 50, owned: 0 },
      cattle: { price: 75, owned: 0 }
    },
    loan: 0, loanPaymentsMissed: 0, loanDay: -1,
    insured: false,
    taxDay: 0, taxStyle: 'fair',
    postedBounties: [],
    treasureMapsV2: [], activeTreasureHunt: null,
    craftingRecipes: [
      { name: 'Poison Rounds', needs: ['venom','bullets'], result: 'poisonBullets' },
      { name: 'Gold Bar', needs: ['nugget3'], result: 'goldBar' },
      { name: 'Health Tonic', needs: ['herbs','water'], result: 'tonic' },
      { name: 'Incendiary Rounds', needs: ['moonshine','bullets'], result: 'incendiaryRounds' },
      { name: 'Bear Trap', needs: ['iron','spring'], result: 'bearTrap' }
    ],
    craftingOpen: false,
    craftingInventory: { venom: 0, bullets: 10, nugget3: 0, herbs: 0, water: 0, moonshine: 0, iron: 0, spring: 0 },
    priceMultipliers: { ammo: 1, food: 1, weapons: 1, supplies: 1 },
    auctionDay: 0, auctionActive: false, auctionItems: [], auctionBid: 0,
    bankVaultGold: 0,
    horseTier: 0, horseName: 'Nag',
    horseTiers: [
      { name: 'Nag', cost: 50, speed: 1.0, hp: 30 },
      { name: 'Mustang', cost: 150, speed: 1.3, hp: 50 },
      { name: 'Stallion', cost: 300, speed: 1.6, hp: 70 },
      { name: 'Thoroughbred', cost: 600, speed: 2.0, hp: 100 },
      { name: 'Legendary', cost: 1000, speed: 2.5, hp: 150 }
    ],
    propertyLevels: {},
    debtQuests: [],
    economyCycle: 'normal', cycleTimer: 0,
    incomeHistory: [],

    // ── Crime Features (153-174) ──
    undercover: false, undercoverTimer: 0,
    serialCriminal: null, serialCatchCount: 0, serialSpawnDay: 0,
    witnessEscort: null, witnessEscortTarget: null,
    patrolActive: false, patrolPoints: [], patrolIndex: 0, patrolTimer: 0,
    crimeNetwork: [], networkBusted: 0,
    contrabandCheck: false, contrabandTimer: 0,
    executionsPerformed: 0,
    vigilanteActive: false, vigilanteNPC: null,
    customBounties: [],
    crimeRingOp: null, crimeRingProgress: 0,

    // ── PHASE 6: RPG & Polish (127-150, 176-200) ──
    prestige: 0,
    playerClass: null,
    classPerks: {
      gunslinger: ['Fire Rate +20%','Crit +10%','Fan the Hammer','Deadeye','Bullet Ricochet'],
      lawman: ['Arrest Speed +30%','Rep Gain +20%','Backup Call','Evidence Sense','Immunity'],
      outlaw: ['Steal +25%','Intimidate +30%','Smoke Bomb','Lockpick','Vanish'],
      ranger: ['Tracking +25%','Animal Taming','Eagle Eye','Nature Heal','Mount Mastery']
    },
    classSkillPoints: 0, classSkills: {},
    passives: [],
    dailyBonusUsed: { crime: false, quest: false },
    masteryChallenges: {},
    equipmentRarity: {},
    legendaryPieces: {},
    xpMultiplier: 1, xpEventTimer: 0,
    lastRespecDay: -99,
    weaponProf: { revolver: 0, shotgun: 0, rifle: 0 },
    achievementPoints: 0,
    loginDays: 0, loginStreak: 0, lastLoginDay: -1,
    mentee: null, menteeLevel: 0,
    bountyRank: 0, bountyXP: 0,
    bountyRankNames: ['Novice','Tracker','Hunter','Stalker','Legend'],
    survivalSkills: { foraging: 0, tracking: 0, camping: 0, riding: 0, cooking: 0 },
    fearAuraActive: false,
    perkRouletteActive: false, availablePerks: [], selectedPerk: null, perkRouletteAngle: 0,
    lastCombatRating: '', combatRatingTimer: 0, combatHits: 0, combatMisses: 0, combatDamageTaken: 0,
    flashbacksCompleted: [],
    calendarDay: 0, calendarClaimed: [],
    showStats: false,
    photoMode: false, photoFilter: 'none', photoCamOffset: { x: 0, y: 0 },
    cards: [], cardSets: {},
    hats: [], activeHat: null,
    hatList: [
      { name: 'Cowboy', buff: 'none', color: '#8B4513' },
      { name: 'Stetson', buff: 'rep+5%', color: '#D2691E' },
      { name: 'Top Hat', buff: 'gold+5%', color: '#1a1a1a' },
      { name: 'Bandana', buff: 'stealth+10%', color: '#cc2222' },
      { name: 'Cavalry', buff: 'speed+5%', color: '#2244aa' },
      { name: 'Derby', buff: 'charm+10%', color: '#444444' },
      { name: 'Sombrero', buff: 'heat resist', color: '#DAA520' },
      { name: 'Fur Cap', buff: 'cold resist', color: '#654321' },
      { name: 'Crown', buff: 'all+3%', color: '#FFD700' },
      { name: 'Ghost Hat', buff: 'night vision', color: '#aaaacc' },
      { name: 'Iron Helm', buff: 'armor+10%', color: '#888888' },
      { name: 'Feathered', buff: 'crit+5%', color: '#228B22' },
      { name: 'Pirate', buff: 'loot+10%', color: '#2a2a2a' },
      { name: 'Sheriff Gold', buff: 'authority+15%', color: '#FFD700' },
      { name: 'Outlaw Black', buff: 'intimidate+15%', color: '#0a0a0a' },
      { name: 'Ranger Green', buff: 'track+15%', color: '#2E8B57' },
      { name: 'Prospector', buff: 'mine+15%', color: '#B8860B' },
      { name: 'Gambler', buff: 'luck+10%', color: '#800020' },
      { name: 'Witch', buff: 'poison+20%', color: '#4B0082' },
      { name: 'Legend', buff: 'all+10%', color: '#FF4500' }
    ],
    titles: [], activeTitle: '',
    titleList: [
      'Greenhorn','Deputy','Sheriff','Marshal','Legend','Peacekeeper','Outlaw','Bounty Hunter',
      'Rancher','Prospector','Sharpshooter','Quick Draw','Iron Fist','Silver Tongue','Shadow',
      'Trailblazer','Pioneer','Desperado','Vigilante','Ghost','Warden','Commander','Drifter',
      'Maverick','Wrangler','Gunslinger','Lawbringer','Phantom','Champion','Overlord'
    ],
    badges: [], activeBadge: 0,
    challengeScores: {},
    codex: { npcs: [], weapons: [], locations: [], creatures: [] },
    codexOpen: false,
    loreEntries: [],
    loreTexts: [
      'The town was founded by gold prospectors in 1849...',
      'Sheriff Morgan was the first lawman here, died in a duel...',
      'The old mine collapsed in 1862, trapping 12 miners...',
      'Legend says a fortune in gold lies beneath the church...',
      'The Perdition gang ruled these parts for a decade...',
      'A mysterious stranger built the well under a full moon...',
      'The railroad brought civilization... and outlaws...',
      'Old Pete claims he saw a ghost in the abandoned mine...',
      'The bank was robbed seven times in its first year...',
      'The hanging tree has witnessed over fifty executions...',
      'Native tribes once called this valley sacred ground...',
      'The blacksmith forged weapons for both sides of the war...',
      'A drought in 1871 nearly wiped out the entire town...',
      'The church bell was cast from melted-down outlaw guns...',
      'They say the Devil himself played cards at the saloon...',
      'The tunnel system was dug by escaped prisoners...',
      'A meteor fell here in 1855, locals kept the fragments...',
      'The general store owner was once a notorious bandit...',
      'Wild horses roam the canyon, untamed and free...',
      'The cemetery holds more secrets than the living know...',
      'A hidden spring feeds the oasis in the desert...',
      'The fort was abandoned after the great battle of 1867...',
      'Cowboys would gather at the campfire to share tales...',
      'The reward for Black Bart was the highest ever posted...',
      'The stagecoach route was the lifeline of the frontier...',
      'Some nights you can hear piano music from the empty saloon...',
      'The marshal badge carries the weight of a hundred lives...',
      'Rattlesnake Ridge got its name the hard way...',
      'The old windmill marks the boundary of safe territory...',
      'Every sunset paints the canyon walls with fire...',
      'The river changes course every spring after the floods...',
      'Outlaws used mirror signals to coordinate raids...',
      'The doctor arrived on the same train as the preacher...',
      'Coyotes howl at midnight when trouble is near...',
      'The livery stable has seen more deals than the bank...',
      'A hermit lives in the caves, trading herbs for news...',
      'The wanted posters fade but the crimes are never forgotten...',
      'Every building in town has a bullet hole somewhere...',
      'The telegraph changed everything - outlaws had less time...',
      'Some say the golden carp grants wishes to the worthy...',
      'The abandoned mines connect to a vast underground river...',
      'Frontier justice was swift but not always fair...',
      'The ranch outside town raises the finest horses...',
      'A traveling show passed through - three townsfolk vanished...',
      'The water tower was the site of the famous last stand...',
      'Old maps show a route to a hidden valley of gold...',
      'The saloon keeper knows every secret in town...',
      'Dust devils are omens - or so the old-timers say...',
      'The jail was built from the same stone as the church...',
      'Under the stars, the frontier feels infinite...'
    ],
    easterEggsFound: [], konamiBuffer: [], konamiCode: [38,38,40,40,37,39,37,39,66,65],
    skullsFound: 0, devilDefeated: false, devilFightActive: false, devilHP: 0,
    skullLocations: [],
    completionPct: 0,
    lastDayProcessed: -1,
    v2Initialized: true
  };
  _v2GenerateWorldLocations();
}

// ── Generate world locations for exploration features ──
function _v2GenerateWorldLocations() {
  var f2 = game._featuresV2;
  var i, q, o, pr, t, lm, tc, cv, sk, cn, pp;
  for (i = 0; i < 5; i++) {
    f2.vistaLocations.push({ x: rand(4, MAP_W - 4) * TILE, y: rand(4, MAP_H - 4) * TILE });
  }
  for (q = 0; q < 4; q++) {
    f2.quicksandLocations.push({ x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE });
  }
  for (o = 0; o < 3; o++) {
    f2.oasisLocations.push({ x: rand(3, MAP_W - 3) * TILE, y: rand(3, MAP_H - 3) * TILE, used: false });
  }
  var propNames = ['Skeleton','Old Diary','Wrecked Wagon','Broken Lantern','Rusted Badge',
    'Torn Map','Empty Canteen','Bullet Casing','Faded Letter','Abandoned Campsite',
    'Carved Tree','Grave Marker','Old Boots','Horseshoe','Weathered Sign'];
  for (pr = 0; pr < 15; pr++) {
    f2.propLocations.push({
      x: rand(3, MAP_W - 3) * TILE, y: rand(3, MAP_H - 3) * TILE,
      name: propNames[pr], found: false, reward: rand(5, 25)
    });
  }
  for (t = 0; t < 4; t++) {
    f2.tunnelLocations.push({
      x1: rand(5, MAP_W / 2 - 2) * TILE, y1: rand(5, MAP_H - 5) * TILE,
      x2: rand(MAP_W / 2 + 2, MAP_W - 5) * TILE, y2: rand(5, MAP_H - 5) * TILE
    });
  }
  var lmNames = ['Lone Pine','Devil\'s Rock','Eagle Bluff','Sunset Arch','Skull Canyon',
    'Whispering Falls','Thunder Mesa','Coyote Bridge','Petrified Tree','Golden Spire'];
  for (lm = 0; lm < 10; lm++) {
    f2.landmarkLocations.push({
      x: rand(2, MAP_W - 2) * TILE, y: rand(2, MAP_H - 2) * TILE,
      name: lmNames[lm], found: false
    });
  }
  for (tc = 0; tc < 3; tc++) {
    f2.capsuleLocations.push({ x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE, found: false });
  }
  for (cv = 0; cv < 3; cv++) {
    f2.caves.push({
      x: rand(4, MAP_W - 4) * TILE, y: rand(4, MAP_H - 4) * TILE,
      discovered: false,
      rooms: [
        { enemies: rand(1, 3), loot: rand(30, 80), cleared: false },
        { enemies: rand(2, 4), loot: rand(50, 120), cleared: false },
        { enemies: rand(3, 5), loot: rand(80, 200), cleared: false }
      ]
    });
  }
  for (sk = 0; sk < 5; sk++) {
    f2.skullLocations.push({ x: rand(3, MAP_W - 3) * TILE, y: rand(3, MAP_H - 3) * TILE, found: false });
  }
  for (cn = 0; cn < 3; cn++) {
    f2.crimeNetwork.push({
      x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE,
      level: cn + 1, busted: false, name: ['Smuggler','Dealer','Kingpin'][cn]
    });
  }
  for (pp = 0; pp < 6; pp++) {
    f2.patrolPoints.push({ x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE });
  }
  if (game.npcs && game.npcs.length > 4) {
    for (var rv = 0; rv < 3; rv++) {
      var a = rand(0, game.npcs.length - 1);
      var b = rand(0, game.npcs.length - 1);
      if (a !== b) f2.rivalryPairs.push({ a: a, b: b, resolved: false });
    }
  }
  if (game.npcs) {
    var townsfolk = [];
    for (var ri = 0; ri < game.npcs.length; ri++) {
      if (!game.npcs[ri].hostile && game.npcs[ri].role !== 'outlaw') townsfolk.push(ri);
    }
    for (var rt = 0; rt < Math.min(3, townsfolk.length); rt++) {
      var idx = townsfolk[rand(0, townsfolk.length - 1)];
      if (f2.romanceTargets.indexOf(idx) === -1) f2.romanceTargets.push(idx);
    }
    for (var rs = 0; rs < f2.romanceTargets.length; rs++) {
      f2.romanceStage[f2.romanceTargets[rs]] = 0;
    }
  }
}

// ============================================================
// UPDATE FEATURES V2 — called every frame
// ============================================================
function updateFeaturesV2(dt) {
  initFeaturesV2();
  if (game.state !== 'playing') return;
  var f2 = game._featuresV2;
  var p = game.player;
  var _mgB = (typeof _inputBlockedByMinigameOrFeature === 'function') && _inputBlockedByMinigameOrFeature();

  // ── Photo Mode blocks everything else ──
  if (f2.photoMode) {
    _updatePhotoMode(dt);
    return;
  }
  // ── Weapon Wheel slows time ──
  if (f2.weaponWheelOpen) {
    _updateWeaponWheel(dt);
    // Don't return — other things still tick slowly
  }

  // ──────────── PHASE 3: COMBAT DEPTH ────────────
  _updateCombatV2(dt, f2, p, _mgB);

  // ──────────── PHASE 4: NPC & SOCIAL ────────────
  _updateNPCSocial(dt, f2, p, _mgB);

  // ──────────── PHASE 4: EXPLORATION & WORLD ────────────
  _updateExploration(dt, f2, p, _mgB);

  // ──────────── PHASE 5: ECONOMY & PROPERTY ────────────
  _updateEconomy(dt, f2, p, _mgB);

  // ──────────── CRIME FEATURES ────────────
  _updateCrimeFeatures(dt, f2, p, _mgB);

  // ──────────── PHASE 6: RPG & POLISH ────────────
  _updateRPGPolish(dt, f2, p, _mgB);

  // ──────────── DAILY PROCESSING ────────────
  _updateDailyProcessing(f2, p);

  // ──────────── COMPLETION TRACKING ────────────
  _updateCompletion(f2);
}

// ════════════════════════════════════════════════════════════
// COMBAT V2 UPDATE (Features 26-50)
// ════════════════════════════════════════════════════════════
function _updateCombatV2(dt, f2, p, blocked) {
  // 26: Bow & Arrow — B key (not near NPC)
  if (f2.bowCharging) {
    f2.bowChargeTime += dt;
    if (f2.bowChargeTime > 2) f2.bowChargeTime = 2;
    if (!keys['KeyB']) {
      // Release arrow
      if (f2.bowChargeTime >= 0.5 && f2.arrows > 0) {
        f2.arrows--;
        var bDmg = Math.floor(2 + (f2.bowChargeTime - 0.5) * 1.33);
        if (bDmg > 4) bDmg = 4;
        var dirs = [[0,1],[0,-1],[-1,0],[1,0]];
        var bd = dirs[p.dir] || [1,0];
        f2.bowArrows.push({
          x: p.x, y: p.y, dx: bd[0] * 7, dy: bd[1] * 7,
          damage: bDmg, life: 60
        });
        showNotification('Arrow fired! (Charge: ' + f2.bowChargeTime.toFixed(1) + 's, Dmg: ' + bDmg + ')');
      }
      f2.bowCharging = false;
      f2.bowChargeTime = 0;
    }
  }
  if (!blocked && !f2.bowCharging && f2.arrows > 0 && keys['KeyB']) {
    // Check no NPC nearby for dialog
    var nearNPC = false;
    for (var bn = 0; bn < game.npcs.length; bn++) {
      if (dist(p, game.npcs[bn]) < 40 && game.npcs[bn].state !== 'dead') { nearNPC = true; break; }
    }
    if (!nearNPC) {
      f2.bowCharging = true;
      f2.bowChargeTime = 0;
    }
  }
  // Update bow arrows in flight
  var bwWrite = 0;
  for (var bai = 0; bai < f2.bowArrows.length; bai++) {
    var ba = f2.bowArrows[bai];
    ba.x += ba.dx; ba.y += ba.dy; ba.life--;
    if (ba.life <= 0) continue;
    var baHit = false;
    for (var bni = 0; bni < game.npcs.length; bni++) {
      var bnpc = game.npcs[bni];
      if (bnpc.state === 'dead' || !bnpc.hostile) continue;
      if (dist(ba, bnpc) < 18) {
        bnpc.hp -= ba.damage;
        addFloatingText(bnpc.x, bnpc.y - 10, '-' + ba.damage, '#88ff88');
        if (bnpc.hp <= 0) { bnpc.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; addXP(15); }
        baHit = true; break;
      }
    }
    if (!baHit) f2.bowArrows[bwWrite++] = ba;
  }
  f2.bowArrows.length = bwWrite;

  // 27: Tomahawk — T key
  if (f2.tomahawkCooldown > 0) f2.tomahawkCooldown -= dt;
  if (f2.tomahawkActive) {
    f2.tomahawkAngle += 0.3;
    if (!f2.tomahawkReturn) {
      f2.tomahawkPos.x += f2.tomahawkDx * 6;
      f2.tomahawkPos.y += f2.tomahawkDy * 6;
      f2.tomahawkDist += 6;
      // Check hits
      for (var ti = 0; ti < game.npcs.length; ti++) {
        var tnpc = game.npcs[ti];
        if (tnpc.state === 'dead' || !tnpc.hostile) continue;
        if (dist(f2.tomahawkPos, tnpc) < 20) {
          tnpc.hp -= 2;
          addFloatingText(tnpc.x, tnpc.y - 10, '-2', '#ff8844');
          if (tnpc.hp <= 0) { tnpc.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; addXP(12); }
        }
      }
      if (f2.tomahawkDist > 200) f2.tomahawkReturn = true;
    } else {
      // Return to player
      var tdx = p.x - f2.tomahawkPos.x;
      var tdy = p.y - f2.tomahawkPos.y;
      var tdd = Math.sqrt(tdx * tdx + tdy * tdy);
      if (tdd < 15) {
        f2.tomahawkActive = false;
        f2.tomahawkCooldown = 3;
      } else {
        f2.tomahawkPos.x += (tdx / tdd) * 7;
        f2.tomahawkPos.y += (tdy / tdd) * 7;
      }
    }
  }
  if (!blocked && !f2.tomahawkActive && f2.tomahawkCooldown <= 0 && consumeKey('KeyT')) {
    // Check not near train
    if (!game._features || !game._features.trainActive) {
      var dirs2 = [[0,1],[0,-1],[-1,0],[1,0]];
      var td2 = dirs2[p.dir] || [1,0];
      f2.tomahawkActive = true;
      f2.tomahawkReturn = false;
      f2.tomahawkPos.x = p.x;
      f2.tomahawkPos.y = p.y;
      f2.tomahawkDx = td2[0];
      f2.tomahawkDy = td2[1];
      f2.tomahawkDist = 0;
      f2.tomahawkAngle = 0;
      f2.tomahawkStartX = p.x;
      f2.tomahawkStartY = p.y;
    }
  }

  // 28: Gatling Gun Turrets
  for (var gi = 0; gi < f2.turrets.length; gi++) {
    var turret = f2.turrets[gi];
    if (turret.rounds <= 0) { f2.turrets.splice(gi, 1); gi--; showNotification('Turret out of ammo!'); continue; }
    turret.fireCooldown -= dt;
    if (turret.fireCooldown <= 0) {
      // Find nearest hostile
      var tNearest = null, tNearDist = 150;
      for (var tni = 0; tni < game.npcs.length; tni++) {
        var tn = game.npcs[tni];
        if (tn.state === 'dead' || !tn.hostile) continue;
        var tnd = dist(turret, tn);
        if (tnd < tNearDist) { tNearDist = tnd; tNearest = tn; }
      }
      if (tNearest) {
        tNearest.hp -= 1;
        turret.rounds--;
        turret.fireCooldown = 0.15;
        addFloatingText(tNearest.x, tNearest.y - 8, '-1', '#ffaa00');
        if (tNearest.hp <= 0) { tNearest.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; addXP(8); }
        // Bullet trail
        if (game._features && game._features.bulletTrails) {
          game._features.bulletTrails.push({ x1: turret.x, y1: turret.y, x2: tNearest.x, y2: tNearest.y, life: 5 });
        }
      } else {
        turret.fireCooldown = 0.5;
      }
    }
  }
  // Place turret: G+Shift
  if (!blocked && keys['ShiftLeft'] && consumeKey('KeyG') && f2.turrets.length < 2) {
    // Check if player has turret (would be bought at blacksmith — check gold)
    if (game.gold >= 200) {
      game.gold -= 200;
      f2.turrets.push({ x: p.x, y: p.y, rounds: 100, fireCooldown: 0 });
      showNotification('Gatling turret placed! (100 rounds) -$200');
    } else {
      showNotification('Need $200 for Gatling turret!');
    }
  }

  // 29: Cannon
  if (f2.cannonCooldown > 0) f2.cannonCooldown -= dt;
  var cpWrite = 0;
  for (var ci = 0; ci < f2.cannonProjectiles.length; ci++) {
    var cp = f2.cannonProjectiles[ci];
    cp.x += cp.dx * 4; cp.y += cp.dy * 4; cp.life--;
    if (cp.life <= 0) {
      // AOE explosion
      particles.emit(cp.x, cp.y, 25, '#ff4400', 5, 40);
      particles.emit(cp.x, cp.y, 15, '#ffaa00', 3, 25);
      triggerShake(8, 15);
      for (var cni = 0; cni < game.npcs.length; cni++) {
        var cnpc = game.npcs[cni];
        if (cnpc.state === 'dead') continue;
        if (dist(cp, cnpc) < 80) {
          var cDmg = cnpc.hostile ? 5 : 3;
          cnpc.hp -= cDmg;
          addFloatingText(cnpc.x, cnpc.y - 10, '-' + cDmg, '#ff2200');
          if (cnpc.hp <= 0) { cnpc.state = 'dead'; if (cnpc.hostile && typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
        }
      }
      continue;
    }
    f2.cannonProjectiles[cpWrite++] = cp;
  }
  f2.cannonProjectiles.length = cpWrite;

  // 30: Weapon Upgrades — handled at blacksmith (passive effect applied in damage calc)

  // 31: Weapon Skins — check unlock conditions
  if (f2.unlockedSkins.indexOf('gold_revolver') === -1 && (typeof game.outlawsKilled !== 'undefined') && game.outlawsKilled >= 50) {
    f2.unlockedSkins.push('gold_revolver');
    f2.weaponSkins.revolver = 'gold';
    showNotification('Unlocked Gold Revolver skin! (50 kills)');
  }
  if (f2.unlockedSkins.indexOf('silver_shotgun') === -1 && (typeof game.arrestsMade !== 'undefined') && game.arrestsMade >= 25) {
    f2.unlockedSkins.push('silver_shotgun');
    f2.weaponSkins.shotgun = 'silver';
    showNotification('Unlocked Silver Shotgun skin! (25 arrests)');
  }
  if (f2.unlockedSkins.indexOf('obsidian_rifle') === -1 && f2.bountyRank >= 4) {
    f2.unlockedSkins.push('obsidian_rifle');
    f2.weaponSkins.rifle = 'obsidian';
    showNotification('Unlocked Obsidian Rifle skin! (Bounty Legend)');
  }

  // 32: Critical Hits — checked when bullets hit (passive system)
  // Applied externally when damage is dealt

  // 33: Armor DR calculation
  f2.armorDR = (f2.armor.hat + f2.armor.vest + f2.armor.boots + f2.armor.gloves) * 3;
  if (f2.armorDR > 60) f2.armorDR = 60;

  // 34: Shield Bash — Q near enemy (only if has shield)
  if (f2.shieldBashCooldown > 0) f2.shieldBashCooldown -= dt;
  if (!blocked && f2.hasShield && f2.shieldBashCooldown <= 0 && keys['ShiftLeft'] && consumeKey('KeyQ')) {
    // Only if not dodge-rolling (V1 uses Q for dodge)
    var bashTarget = null, bashDist = 40;
    for (var sbi = 0; sbi < game.npcs.length; sbi++) {
      var sbn = game.npcs[sbi];
      if (sbn.state === 'dead') continue;
      var sbd = dist(p, sbn);
      if (sbd < bashDist) { bashDist = sbd; bashTarget = sbn; }
    }
    if (bashTarget) {
      bashTarget.state = 'stunned';
      bashTarget._stunTimer = 2;
      f2.shieldBashCooldown = 5;
      addFloatingText(bashTarget.x, bashTarget.y - 10, 'STUNNED', '#ffff00');
      showNotification('Shield bash! ' + bashTarget.name + ' stunned for 2s!');
      triggerShake(3, 8);
    }
  }
  // Update stun timers
  for (var stni = 0; stni < game.npcs.length; stni++) {
    var stn = game.npcs[stni];
    if (stn.state === 'stunned' && stn._stunTimer !== undefined) {
      stn._stunTimer -= dt;
      if (stn._stunTimer <= 0) { stn.state = 'idle'; stn._stunTimer = undefined; }
    }
  }

  // 35: Poison Bullets — DOT on poisoned targets
  var ptWrite = 0;
  for (var pi = 0; pi < f2.poisonedTargets.length; pi++) {
    var pt = f2.poisonedTargets[pi];
    pt.timer -= dt;
    pt.tickTimer -= dt;
    if (pt.tickTimer <= 0 && pt.target && pt.target.state !== 'dead') {
      pt.target.hp -= 1;
      pt.tickTimer = 1;
      addFloatingText(pt.target.x, pt.target.y - 8, '-1', '#44ff44');
      if (pt.target.hp <= 0) { pt.target.state = 'dead'; if (pt.target.hostile && typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
    }
    if (pt.timer > 0 && pt.target && pt.target.state !== 'dead') {
      f2.poisonedTargets[ptWrite++] = pt;
    }
  }
  f2.poisonedTargets.length = ptWrite;

  // 36: Incendiary Rounds — fire patches tick
  var fpWrite = 0;
  for (var fi = 0; fi < f2.firePatches.length; fi++) {
    var fp = f2.firePatches[fi];
    fp.life -= dt;
    if (fp.life > 0) {
      // Damage NPCs in range
      fp.tickTimer -= dt;
      if (fp.tickTimer <= 0) {
        fp.tickTimer = 0.5;
        for (var fni = 0; fni < game.npcs.length; fni++) {
          var fnpc = game.npcs[fni];
          if (fnpc.state === 'dead') continue;
          if (dist(fp, fnpc) < 40) {
            fnpc.hp -= 1;
            addFloatingText(fnpc.x, fnpc.y - 8, '-1', '#ff6600');
            if (fnpc.hp <= 0) { fnpc.state = 'dead'; if (fnpc.hostile && typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
          }
        }
      }
      f2.firePatches[fpWrite++] = fp;
    }
  }
  f2.firePatches.length = fpWrite;

  // 37: Bullet Time
  if (f2.bulletTimeActive) {
    f2.bulletTimeTimer -= dt;
    if (f2.bulletTimeTimer <= 0) {
      f2.bulletTimeActive = false;
      showNotification('Bullet Time ended');
    }
  }
  // Trigger: kill streak of 5 (uses game._features.killStreak)
  if (!f2.bulletTimeActive && game._features && game._features.killStreak >= 5) {
    f2.bulletTimeActive = true;
    f2.bulletTimeTimer = 3;
    game._features.killStreak = 0;
    showNotification('BULLET TIME! 3 seconds of slow motion!');
  }

  // 38: Execution Moves — E on stunned/low-hp enemy (only consume E if valid target found)
  if (!blocked) {
    var execTarget = null, execDist = 35;
    for (var exi = 0; exi < game.npcs.length; exi++) {
      var exn = game.npcs[exi];
      if (exn.state === 'dead') continue;
      if ((exn.state === 'stunned' || exn.hp <= 2) && exn.hostile) {
        var exd = dist(p, exn);
        if (exd < execDist) { execDist = exd; execTarget = exn; }
      }
    }
    if (execTarget && consumeKey('KeyE')) {
      execTarget.state = 'dead';
      execTarget.hp = 0;
      f2.executionCount++;
      if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++;
      var execXP = 25;
      var execGold = rand(10, 30);
      addXP(execXP);
      game.gold += execGold;
      addFloatingText(execTarget.x, execTarget.y - 15, 'EXECUTION! +' + execXP + 'XP +$' + execGold, '#ff0000');
      showNotification('Execution on ' + execTarget.name + '! +' + execXP + 'XP +$' + execGold);
      triggerShake(5, 12);
      particles.emit(execTarget.x, execTarget.y, 15, '#cc0000', 3, 20);
    }
  }

  // 39: Dual Pistols — D toggle
  if (!blocked && keys['ShiftLeft'] && consumeKey('KeyD')) {
    f2.dualPistols = !f2.dualPistols;
    showNotification(f2.dualPistols ? 'Dual Pistols: ON (2x fire rate, less accuracy)' : 'Dual Pistols: OFF');
  }

  // 40: Cover System — C near walls/barrels
  if (!blocked && consumeKey('KeyC')) {
    if (f2.inCover) {
      f2.inCover = false;
      f2.coverPos = null;
      showNotification('Left cover');
    } else {
      // Check nearby walls/barrels
      var coverFound = false;
      // Check barrels
      if (game._features && game._features.explosiveBarrels) {
        for (var cbi = 0; cbi < game._features.explosiveBarrels.length; cbi++) {
          var cb = game._features.explosiveBarrels[cbi];
          if (cb.active && dist(p, cb) < 40) {
            coverFound = true;
            f2.inCover = true;
            f2.coverPos = { x: p.x, y: p.y };
            break;
          }
        }
      }
      // Check walls
      if (!coverFound) {
        var tileX = Math.floor(p.x / TILE);
        var tileY = Math.floor(p.y / TILE);
        for (var wdx = -1; wdx <= 1; wdx++) {
          for (var wdy = -1; wdy <= 1; wdy++) {
            if (wdx === 0 && wdy === 0) continue;
            var wx = tileX + wdx, wy = tileY + wdy;
            if (wx >= 0 && wx < MAP_W && wy >= 0 && wy < MAP_H) {
              if (game.map[wy] && game.map[wy][wx] >= 10) {
                coverFound = true;
                f2.inCover = true;
                f2.coverPos = { x: p.x, y: p.y };
                break;
              }
            }
          }
          if (coverFound) break;
        }
      }
      if (coverFound) {
        showNotification('In cover! -50% damage taken. Move to shoot.');
      }
    }
  }
  // Leave cover if moved too far
  if (f2.inCover && f2.coverPos) {
    var covDist = Math.sqrt((p.x - f2.coverPos.x) * (p.x - f2.coverPos.x) + (p.y - f2.coverPos.y) * (p.y - f2.coverPos.y));
    if (covDist > 50) {
      f2.inCover = false;
      f2.coverPos = null;
    }
  }

  // 41: Ricochet Shots — unlock at level 20
  if (!f2.ricochetUnlocked && game.level >= 20) {
    f2.ricochetUnlocked = true;
    showNotification('Ricochet Shots unlocked! Bullets bounce off walls!');
  }

  // 42: Bear Traps — 7 key to place
  if (!blocked && f2.bearTrapCount > 0 && f2.bearTraps.length < 5 && consumeKey('Digit7')) {
    f2.bearTrapCount--;
    f2.bearTraps.push({ x: p.x, y: p.y, armed: true });
    showNotification('Bear trap placed! (' + f2.bearTrapCount + ' left)');
  }
  for (var bti = 0; bti < f2.bearTraps.length; bti++) {
    var bt = f2.bearTraps[bti];
    if (!bt.armed) {
      bt.holdTimer -= dt;
      if (bt.holdTimer <= 0) {
        if (bt.trappedNPC) { bt.trappedNPC.state = 'idle'; bt.trappedNPC = null; }
        f2.bearTraps.splice(bti, 1); bti--;
      }
      continue;
    }
    for (var btni = 0; btni < game.npcs.length; btni++) {
      var btn = game.npcs[btni];
      if (btn.state === 'dead' || !btn.hostile) continue;
      if (dist(bt, btn) < 20) {
        bt.armed = false;
        bt.holdTimer = 5;
        bt.trappedNPC = btn;
        btn.state = 'stunned';
        btn._stunTimer = 5;
        btn.hp -= 2;
        addFloatingText(btn.x, btn.y - 10, 'TRAPPED! -2', '#ff8800');
        if (btn.hp <= 0) { btn.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
        break;
      }
    }
  }

  // 43: Mounted Combat — F while mounted = trample
  if (f2.trampleCooldown > 0) f2.trampleCooldown -= dt;
  if (!blocked && game.mounted && f2.trampleCooldown <= 0 && consumeKey('KeyF')) {
    f2.trampleCooldown = 2;
    for (var mci = 0; mci < game.npcs.length; mci++) {
      var mcn = game.npcs[mci];
      if (mcn.state === 'dead') continue;
      if (dist(p, mcn) < 35 && mcn.hostile) {
        mcn.hp -= 3;
        addFloatingText(mcn.x, mcn.y - 10, 'TRAMPLE -3', '#ffaa00');
        if (mcn.hp <= 0) { mcn.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; addXP(10); }
      }
    }
    showNotification('Horse trample!');
    triggerShake(4, 10);
  }

  // 44: Throwing Stars — 8 key
  if (!blocked && f2.throwingStars > 0 && consumeKey('Digit8')) {
    f2.throwingStars--;
    var dirs3 = [[0,1],[0,-1],[-1,0],[1,0]];
    var sd = dirs3[p.dir] || [1,0];
    f2.thrownStars.push({ x: p.x, y: p.y, dx: sd[0] * 8, dy: sd[1] * 8, life: 40 });
    showNotification('Throwing star! (' + f2.throwingStars + ' left)');
  }
  var tsWrite = 0;
  for (var tsi = 0; tsi < f2.thrownStars.length; tsi++) {
    var ts = f2.thrownStars[tsi];
    ts.x += ts.dx; ts.y += ts.dy; ts.life--;
    if (ts.life <= 0) continue;
    var tsHit = false;
    for (var tsni = 0; tsni < game.npcs.length; tsni++) {
      var tsn = game.npcs[tsni];
      if (tsn.state === 'dead' || !tsn.hostile) continue;
      if (dist(ts, tsn) < 18) {
        tsn.hp -= 1;
        addFloatingText(tsn.x, tsn.y - 8, '-1', '#ccccff');
        if (tsn.hp <= 0) { tsn.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
        tsHit = true; break;
      }
    }
    if (!tsHit) f2.thrownStars[tsWrite++] = ts;
  }
  f2.thrownStars.length = tsWrite;

  // 45: War Cry — Z key
  if (f2.warCryCooldown > 0) f2.warCryCooldown -= dt;
  if (!blocked && f2.warCryCooldown <= 0 && consumeKey('KeyZ')) {
    f2.warCryCooldown = 30;
    var criedCount = 0;
    for (var wci = 0; wci < game.npcs.length; wci++) {
      var wcn = game.npcs[wci];
      if (wcn.state === 'dead') continue;
      if (dist(p, wcn) < 100 && wcn.hostile) {
        if (wcn.hp <= 5) {
          wcn.state = 'fleeing';
          wcn._fleeTimer = 5;
          criedCount++;
        }
      }
    }
    showNotification('WAR CRY! ' + criedCount + ' enemies flee in terror!');
    triggerShake(3, 8);
    addFloatingText(p.x, p.y - 20, 'WAR CRY!', '#ff4444');
  }
  // Update fleeing timers
  for (var fli = 0; fli < game.npcs.length; fli++) {
    var fln = game.npcs[fli];
    if (fln.state === 'fleeing' && fln._fleeTimer !== undefined) {
      fln._fleeTimer -= dt;
      // Move away from player
      var flDx = fln.x - p.x, flDy = fln.y - p.y;
      var flDist = Math.sqrt(flDx * flDx + flDy * flDy);
      if (flDist > 1) {
        var nx = fln.x + (flDx / flDist) * 2;
        var ny = fln.y + (flDy / flDist) * 2;
        if (canMove(nx, ny, 5)) { fln.x = nx; fln.y = ny; }
      }
      if (fln._fleeTimer <= 0) { fln.state = 'idle'; fln._fleeTimer = undefined; }
    }
  }

  // 46: Combo Finishers
  if (typeof game.combo !== 'undefined' && game.combo >= 10 && !f2.comboFinisherReady) {
    f2.comboFinisherReady = true;
    showNotification('COMBO FINISHER ready! Press 9 for special attack!');
  }
  if (!blocked && f2.comboFinisherReady && consumeKey('Digit9')) {
    f2.comboFinisherReady = false;
    if (typeof game.combo !== 'undefined') game.combo = 0;
    // Spinning melee — 360 damage in radius
    for (var cfi = 0; cfi < game.npcs.length; cfi++) {
      var cfn = game.npcs[cfi];
      if (cfn.state === 'dead') continue;
      if (dist(p, cfn) < 60 && cfn.hostile) {
        cfn.hp -= 4;
        addFloatingText(cfn.x, cfn.y - 10, 'COMBO -4', '#ff00ff');
        if (cfn.hp <= 0) { cfn.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; addXP(20); }
      }
    }
    showNotification('COMBO FINISHER! Spinning attack!');
    triggerShake(6, 15);
    particles.emit(p.x, p.y, 20, '#ff00ff', 4, 30);
  }

  // 47: Environmental Kills — automatic detection near hazards
  // (Checked during combat — if enemy dies near well/fire/chandelier, bonus)

  // 49: Weapon Wheel — TAB hold
  if (keys['Tab']) {
    f2.weaponWheelOpen = true;
  } else {
    f2.weaponWheelOpen = false;
  }

  // 50: Last Stand
  if (f2.lastStandActive) {
    f2.lastStandTimer -= dt;
    if (f2.lastStandTimer <= 0) {
      f2.lastStandActive = false;
      showNotification('Last Stand ended');
    }
  }
  if (!f2.lastStandActive && p.hp <= 1 && p.hp > 0) {
    f2.lastStandActive = true;
    f2.lastStandTimer = 5;
    // Mark all currently-dead hostiles so only NEW kills during Last Stand grant healing
    for (var lsm = 0; lsm < game.npcs.length; lsm++) {
      if (game.npcs[lsm].state === 'dead' && game.npcs[lsm].hostile) {
        game.npcs[lsm]._lastStandChecked = true;
      }
    }
    showNotification('LAST STAND! 5 seconds of 2x damage!');
  }
  // Last stand kill = recover HP
  if (f2.lastStandActive) {
    for (var lsi = 0; lsi < game.npcs.length; lsi++) {
      var lsn = game.npcs[lsi];
      if (lsn.state === 'dead' && lsn._lastStandChecked !== true && lsn.hostile) {
        lsn._lastStandChecked = true;
        p.hp = Math.min(p.hp + 2, p.maxHp);
        addFloatingText(p.x, p.y - 15, '+2 HP', '#00ff00');
      }
    }
  }
}

// ════════════════════════════════════════════════════════════
// NPC & SOCIAL UPDATE (Features 51-75)
// ════════════════════════════════════════════════════════════
function _updateNPCSocial(dt, f2, p, blocked) {
  // 51: NPC Friendship — incremented when talking (dialog triggers)
  // Track friendships per NPC id
  for (var ni = 0; ni < game.npcs.length; ni++) {
    var npc = game.npcs[ni];
    if (!npc._id) npc._id = 'npc_' + ni;
    if (f2.friendships[npc._id] === undefined) f2.friendships[npc._id] = 0;
    // Check for friendship perks
    var fr = f2.friendships[npc._id];
    if (fr >= 100 && !npc._allyActive && !npc.hostile && npc.state !== 'dead') {
      // Ally — will fight for player
      npc._allyActive = true;
    }
    if (npc._allyActive && npc.state !== 'dead') {
      // Find nearest hostile and move toward it
      var nearHostile = null, nhDist = 200;
      for (var hni = 0; hni < game.npcs.length; hni++) {
        var hn = game.npcs[hni];
        if (hn.hostile && hn.state !== 'dead') {
          var hd = dist(npc, hn);
          if (hd < nhDist) { nhDist = hd; nearHostile = hn; }
        }
      }
      if (nearHostile && nhDist < 150) {
        var adx = nearHostile.x - npc.x, ady = nearHostile.y - npc.y;
        var adist = Math.sqrt(adx * adx + ady * ady);
        if (adist > 25) {
          npc.x += (adx / adist) * 1.5;
          npc.y += (ady / adist) * 1.5;
        } else {
          // Attack
          if (!npc._attackCd || npc._attackCd <= 0) {
            nearHostile.hp -= 1;
            npc._attackCd = 1;
            addFloatingText(nearHostile.x, nearHostile.y - 8, '-1', '#44cc44');
            if (nearHostile.hp <= 0) { nearHostile.state = 'dead'; }
          }
        }
      }
      if (npc._attackCd > 0) npc._attackCd -= dt;
    }
  }

  // 52: NPC Gift System — G near friendly NPC
  if (f2.giftCooldown > 0) f2.giftCooldown -= dt;
  if (!blocked && f2.giftCooldown <= 0 && consumeKey('KeyG') && !keys['ShiftLeft']) {
    var giftTarget = null, giftDist = 40;
    for (var gi = 0; gi < game.npcs.length; gi++) {
      var gn = game.npcs[gi];
      if (gn.state === 'dead' || gn.hostile) continue;
      var gd = dist(p, gn);
      if (gd < giftDist) { giftDist = gd; giftTarget = gn; }
    }
    if (giftTarget && giftTarget._id) {
      // Give cheapest gift (flowers = free, +3)
      var giftAmt = 3;
      var giftCost = 0;
      var giftName = 'flowers';
      if (game.gold >= 25) {
        giftAmt = 15; giftCost = 25; giftName = 'jewelry';
      } else if (game.gold >= 5) {
        giftAmt = 5; giftCost = 5; giftName = 'whiskey';
      }
      game.gold -= giftCost;
      f2.friendships[giftTarget._id] = Math.min(100, (f2.friendships[giftTarget._id] || 0) + giftAmt);
      f2.giftCooldown = 3;
      addFloatingText(giftTarget.x, giftTarget.y - 15, '+' + giftAmt + ' friendship', '#ff88cc');
      showNotification('Gave ' + giftName + ' to ' + giftTarget.name + '! (' + (giftCost > 0 ? '-$' + giftCost : 'free') + ')');
      // 53: Romance check
      if (f2.romanceTargets.indexOf(gi) !== -1) {
        var stage = f2.romanceStage[gi] || 0;
        var newFr = f2.friendships[giftTarget._id];
        var newStage = newFr < 26 ? 0 : (newFr < 51 ? 1 : (newFr < 76 ? 2 : 3));
        if (newStage > stage) {
          f2.romanceStage[gi] = newStage;
          var stageNames = ['Acquaintance','Friend','Courting','Partner'];
          showNotification('Romance with ' + giftTarget.name + ': ' + stageNames[newStage] + '!');
          if (newStage === 3) {
            addJournalEntry(giftTarget.name + ' is now your partner! Free heals & extra gold.');
          }
        }
      }
      // Faction bonus
      _v2AdjustFaction(f2, 'townsfolk', 1);
    }
  }

  // 54: NPC Home Visits — E near NPC's home
  if (f2.homeVisitActive) {
    f2.homeVisitTimer -= dt;
    if (f2.homeVisitTimer <= 0 || consumeKey('Escape')) {
      f2.homeVisitActive = false;
      f2.homeVisitNPC = null;
      showNotification('Left home visit');
    }
  }

  // 56: NPC Moods — update based on time/weather
  for (var mi = 0; mi < game.npcs.length; mi++) {
    var mn = game.npcs[mi];
    if (!mn._id) mn._id = 'npc_' + mi;
    if (f2.npcMoods[mn._id] === undefined) f2.npcMoods[mn._id] = 'neutral';
    // Weather affects mood
    var weather = game._features ? game._features.weather : 'clear';
    if (weather === 'rain' || weather === 'storm') f2.npcMoods[mn._id] = 'sad';
    else if (game.time > 0.3 && game.time < 0.7) f2.npcMoods[mn._id] = 'happy';
    else if (game.time > 0.8 || game.time < 0.2) f2.npcMoods[mn._id] = 'neutral';
    // Reputation affects mood
    if (game.reputation < 20) f2.npcMoods[mn._id] = 'angry';
    else if (game.reputation > 80) f2.npcMoods[mn._id] = 'happy';
  }

  // 57: Faction System — passive rep changes
  // Factions shift slightly based on actions (handled in specific actions)

  // 58: Faction Missions
  if (f2.activeFactionMission) {
    var afm = f2.activeFactionMission;
    afm.timer -= dt;
    if (afm.timer <= 0) {
      f2.activeFactionMission = null;
      showNotification('Faction mission expired!');
    }
  }

  // 59: NPC Rivalries — mediation
  if (!blocked && f2.activeMediation === null) {
    for (var rvi = 0; rvi < f2.rivalryPairs.length; rvi++) {
      var rv = f2.rivalryPairs[rvi];
      if (rv.resolved) continue;
      var rvA = game.npcs[rv.a], rvB = game.npcs[rv.b];
      if (!rvA || !rvB || rvA.state === 'dead' || rvB.state === 'dead') continue;
      if (dist(p, rvA) < 50 || dist(p, rvB) < 50) {
        // Offer mediation
        if (Math.random() < 0.001) { // rare prompt
          f2.activeMediation = rvi;
          showNotification(rvA.name + ' and ' + rvB.name + ' are feuding! Press M to mediate.');
        }
      }
    }
  }
  if (!blocked && f2.activeMediation !== null && consumeKey('KeyM')) {
    var med = f2.rivalryPairs[f2.activeMediation];
    if (med) {
      med.resolved = true;
      addXP(30);
      game.reputation = Math.min(REPUTATION_MAX, game.reputation + 5);
      showNotification('Mediation successful! +30XP +5 Rep');
      _v2AdjustFaction(f2, 'townsfolk', 5);
    }
    f2.activeMediation = null;
  }

  // 60: Informant Network
  // Informants reveal crimes early — checked in crime features

  // 62: Companion System
  if (f2.companion) {
    // Companion follows player
    var cdx = p.x - f2.companionPos.x;
    var cdy = p.y - f2.companionPos.y;
    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
    if (cdist > 40) {
      f2.companionPos.x += (cdx / cdist) * 2.5;
      f2.companionPos.y += (cdy / cdist) * 2.5;
    }
    // Companion ability
    if (f2.companionCooldown > 0) f2.companionCooldown -= dt;
    if (f2.companionCooldown <= 0) {
      f2.companionCooldown = 60;
      if (f2.companion === 'bartender') {
        p.hp = Math.min(p.hp + 3, p.maxHp);
        addFloatingText(p.x, p.y - 15, '+3 HP (Bartender)', '#00ff88');
      } else if (f2.companion === 'blacksmith') {
        // Repair armor
        f2.armor.vest = Math.min(3, f2.armor.vest + 1);
        addFloatingText(p.x, p.y - 15, 'Armor repaired!', '#aaaaff');
      } else if (f2.companion === 'preacher') {
        // Buff — temp rep boost
        game.reputation = Math.min(REPUTATION_MAX, game.reputation + 2);
        addFloatingText(p.x, p.y - 15, '+2 Rep (Blessing)', '#ffff88');
      }
    }
  }

  // 63: NPC Stories — talk chains (triggered on dialog, tracked here)

  // 64: Town Meetings — every 7 days
  if (game.dayCount > 0 && game.dayCount % 7 === 0 && !f2.meetingActive && f2.meetingDay !== game.dayCount) {
    var issues = ['Raise taxes', 'Repair saloon', 'Hire more deputies', 'Build school', 'Host festival'];
    f2.meetingIssue = issues[rand(0, issues.length - 1)];
    f2.meetingActive = true;
    f2.meetingDay = game.dayCount;
    showNotification('Town meeting today! Issue: ' + f2.meetingIssue);
  }
  if (f2.meetingActive && consumeKey('KeyY')) {
    f2.meetingActive = false;
    game.reputation = Math.min(REPUTATION_MAX, game.reputation + 3);
    showNotification('You voted YES on: ' + f2.meetingIssue + ' (+3 Rep)');
    _v2AdjustFaction(f2, 'townsfolk', 3);
  }
  if (f2.meetingActive && consumeKey('KeyN')) {
    f2.meetingActive = false;
    showNotification('You voted NO on: ' + f2.meetingIssue);
  }

  // 66: Witness System — NPCs see crimes
  var wWrite = 0;
  for (var wi = 0; wi < f2.witnesses.length; wi++) {
    var w = f2.witnesses[wi];
    w.timer -= dt;
    if (w.timer > 0) {
      f2.witnesses[wWrite++] = w;
    } else {
      // Witness reports if not dealt with
      game.reputation = Math.max(0, game.reputation - 10);
      showNotification(w.name + ' reported your crime! -10 Rep');
    }
  }
  f2.witnesses.length = wWrite;

  // 67: NPC Aging
  if (game.dayCount >= 50) {
    for (var ai = 0; ai < game.npcs.length; ai++) {
      var an = game.npcs[ai];
      if (!an._id) an._id = 'npc_' + ai;
      if (f2.npcAges[an._id] === undefined) f2.npcAges[an._id] = rand(25, 55);
      if (game.dayCount > 50) f2.npcAges[an._id] = Math.min(90, f2.npcAges[an._id] + 0.0001);
      // Elder death
      if (game.dayCount > 100 && f2.npcAges[an._id] > 85 && Math.random() < 0.0001 && an.state !== 'dead') {
        an.state = 'dead';
        f2.memorials.push({ name: an.name, daysAlive: game.dayCount });
        showNotification(an.name + ' has passed away of old age. A memorial was placed.');
      }
    }
  }

  // 68: Hired Guns
  if (f2.hiredGunTimer > 0) f2.hiredGunTimer -= dt;
  var hgWrite = 0;
  for (var hgi = 0; hgi < f2.hiredGuns.length; hgi++) {
    var hg = f2.hiredGuns[hgi];
    hg.dayTimer -= dt;
    if (hg.dayTimer <= 0) continue;
    // Move toward hostiles and fight
    var hgTarget = null, hgDist = 200;
    for (var hgni = 0; hgni < game.npcs.length; hgni++) {
      var hgn = game.npcs[hgni];
      if (hgn.hostile && hgn.state !== 'dead') {
        var hgd = dist(hg, hgn);
        if (hgd < hgDist) { hgDist = hgd; hgTarget = hgn; }
      }
    }
    if (hgTarget) {
      var hgdx = hgTarget.x - hg.x, hgdy = hgTarget.y - hg.y;
      var hgdd = Math.sqrt(hgdx * hgdx + hgdy * hgdy);
      if (hgdd > 30) { hg.x += (hgdx / hgdd) * 2; hg.y += (hgdy / hgdd) * 2; }
      else {
        if (!hg._atkCd || hg._atkCd <= 0) {
          hgTarget.hp -= 2;
          hg._atkCd = 0.8;
          addFloatingText(hgTarget.x, hgTarget.y - 8, '-2', '#ff8844');
          if (hgTarget.hp <= 0) { hgTarget.state = 'dead'; if (typeof game.outlawsKilled !== 'undefined') game.outlawsKilled++; }
        }
      }
    } else {
      // Follow player
      var phgdx = p.x - hg.x, phgdy = p.y - hg.y;
      var phgdd = Math.sqrt(phgdx * phgdx + phgdy * phgdy);
      if (phgdd > 60) { hg.x += (phgdx / phgdd) * 1.5; hg.y += (phgdy / phgdd) * 1.5; }
    }
    if (hg._atkCd > 0) hg._atkCd -= dt;
    f2.hiredGuns[hgWrite++] = hg;
  }
  f2.hiredGuns.length = hgWrite;

  // 69: NPC Rumors
  // Process rumor queue
  if (f2.rumorQueue.length > 0) {
    var rumor = f2.rumorQueue.shift();
    f2.activeRumors.push({ text: rumor.text, type: rumor.type, timer: 300 });
    if (rumor.type === 'good') {
      _v2AdjustFaction(f2, 'townsfolk', 2);
    } else {
      f2.priceMultipliers.ammo = Math.min(2, f2.priceMultipliers.ammo + 0.05);
    }
  }
  // Decay rumors
  var rWrite = 0;
  for (var rri = 0; rri < f2.activeRumors.length; rri++) {
    f2.activeRumors[rri].timer -= dt;
    if (f2.activeRumors[rri].timer > 0) f2.activeRumors[rWrite++] = f2.activeRumors[rri];
  }
  f2.activeRumors.length = rWrite;

  // 72: Traveling Merchants
  if (game.dayCount > 0 && game.dayCount % 5 === 0 && !f2.merchantActive && f2.merchantDay !== game.dayCount) {
    f2.merchantActive = true;
    f2.merchantDay = game.dayCount;
    f2.merchantItems = [
      { name: 'Exotic Scope', cost: 80, type: 'scope' },
      { name: 'Fine Armor', cost: 120, type: 'armor' },
      { name: 'Rare Hat', cost: 60, type: 'hat' },
      { name: 'Poison Vial', cost: 30, type: 'venom' },
      { name: 'Map Fragment', cost: 40, type: 'map' }
    ];
    showNotification('A traveling merchant has arrived in town!');
  }
  if (f2.merchantActive && game.dayCount !== f2.merchantDay) {
    f2.merchantActive = false;
  }

  // 73: NPC Weather Reactions
  if (game._features) {
    var currWeather = game._features.weather;
    for (var nwi = 0; nwi < game.npcs.length; nwi++) {
      var nw = game.npcs[nwi];
      if (nw.state === 'dead' || nw.hostile) continue;
      if (currWeather === 'storm' || currWeather === 'rain') {
        // NPCs move toward buildings
        if (!nw._sheltering) {
          var nearBldg = null, nbDist = 300;
          for (var nbi = 0; nbi < game.buildings.length; nbi++) {
            var bd = dist(nw, game.buildings[nbi]);
            if (bd < nbDist) { nbDist = bd; nearBldg = game.buildings[nbi]; }
          }
          if (nearBldg && nbDist > 30) {
            var nwdx = nearBldg.x - nw.x, nwdy = nearBldg.y - nw.y;
            var nwdd = Math.sqrt(nwdx * nwdx + nwdy * nwdy);
            if (nwdd > 1) { nw.x += (nwdx / nwdd) * 0.8; nw.y += (nwdy / nwdd) * 0.8; }
          } else {
            nw._sheltering = true;
          }
        }
      } else {
        nw._sheltering = false;
      }
    }
  }

  // 74: Posse System — P key at marshal rank
  if (f2.posseCooldown > 0) f2.posseCooldown -= dt;
  if (f2.posseActive) {
    f2.posseTimer -= dt;
    if (f2.posseTimer <= 0) {
      f2.posseActive = false;
      f2.posseMembers = [];
      showNotification('Posse disbanded');
    } else {
      // Posse members follow and fight
      for (var pmi = 0; pmi < f2.posseMembers.length; pmi++) {
        var pm = f2.posseMembers[pmi];
        var pmTarget = null, pmDist = 150;
        for (var pmni = 0; pmni < game.npcs.length; pmni++) {
          var pmn = game.npcs[pmni];
          if (pmn.hostile && pmn.state !== 'dead') {
            var pmd = dist(pm, pmn);
            if (pmd < pmDist) { pmDist = pmd; pmTarget = pmn; }
          }
        }
        if (pmTarget) {
          var pmdx = pmTarget.x - pm.x, pmdy = pmTarget.y - pm.y;
          var pmdd = Math.sqrt(pmdx * pmdx + pmdy * pmdy);
          if (pmdd > 25) { pm.x += (pmdx / pmdd) * 2; pm.y += (pmdy / pmdd) * 2; }
          else {
            if (!pm._atkCd || pm._atkCd <= 0) {
              pmTarget.hp -= 1;
              pm._atkCd = 1;
              addFloatingText(pmTarget.x, pmTarget.y - 8, '-1', '#88aaff');
              if (pmTarget.hp <= 0) { pmTarget.state = 'dead'; }
            }
          }
        } else {
          var ppdx = p.x - pm.x, ppdy = p.y - pm.y;
          var ppdd = Math.sqrt(ppdx * ppdx + ppdy * ppdy);
          if (ppdd > 50) { pm.x += (ppdx / ppdd) * 2; pm.y += (ppdy / ppdd) * 2; }
        }
        if (pm._atkCd > 0) pm._atkCd -= dt;
      }
    }
  }
  if (!blocked && !f2.posseActive && f2.posseCooldown <= 0 && game.level >= 15 && keys['ShiftLeft'] && consumeKey('KeyP')) {
    f2.posseActive = true;
    f2.posseTimer = 60;
    f2.posseCooldown = 300;
    f2.posseMembers = [];
    for (var psi = 0; psi < 3; psi++) {
      f2.posseMembers.push({ x: p.x + rand(-30, 30), y: p.y + rand(-30, 30), _atkCd: 0 });
    }
    showNotification('Posse summoned! 3 deputies for 60 seconds!');
  }
}

// Helper: adjust faction standing
function _v2AdjustFaction(f2, faction, amount) {
  if (f2.factions[faction] !== undefined) {
    f2.factions[faction] = clamp(f2.factions[faction] + amount, 0, 100);
  }
}

// ════════════════════════════════════════════════════════════
// EXPLORATION & WORLD UPDATE (Features 101-125)
// ════════════════════════════════════════════════════════════
function _updateExploration(dt, f2, p, blocked) {
  // 101: Hidden Caves
  if (f2.caveActive) {
    // Cave mini-dungeon logic
    if (consumeKey('Escape')) {
      f2.caveActive = false;
      showNotification('Exited cave');
      return;
    }
    // Move in cave
    var cSpeed = 2;
    if (keys['KeyW'] || keys['ArrowUp']) f2.cavePlayerY -= cSpeed;
    if (keys['KeyS'] || keys['ArrowDown']) f2.cavePlayerY += cSpeed;
    if (keys['KeyA'] || keys['ArrowLeft']) f2.cavePlayerX -= cSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) f2.cavePlayerX += cSpeed;
    f2.cavePlayerX = clamp(f2.cavePlayerX, 10, 290);
    f2.cavePlayerY = clamp(f2.cavePlayerY, 10, 190);
    // Collect loot
    for (var cli = 0; cli < f2.caveLoot.length; cli++) {
      var cl = f2.caveLoot[cli];
      if (!cl.collected && Math.abs(f2.cavePlayerX - cl.x) < 15 && Math.abs(f2.cavePlayerY - cl.y) < 15) {
        cl.collected = true;
        game.gold += cl.value;
        addFloatingText(p.x, p.y - 10, '+$' + cl.value, '#ffd700');
      }
    }
    // Fight cave enemies
    for (var cei = 0; cei < f2.caveEnemies.length; cei++) {
      var ce = f2.caveEnemies[cei];
      if (ce.hp <= 0) continue;
      // Enemy AI
      var cedx = f2.cavePlayerX - ce.x, cedy = f2.cavePlayerY - ce.y;
      var cedd = Math.sqrt(cedx * cedx + cedy * cedy);
      if (cedd > 20 && cedd < 120) {
        ce.x += (cedx / cedd) * 1;
        ce.y += (cedy / cedd) * 1;
      }
      if (cedd < 20) {
        if (!ce._atkCd || ce._atkCd <= 0) {
          p.hp -= 1;
          ce._atkCd = 1.5;
          addFloatingText(p.x, p.y - 10, '-1', '#ff4444');
        }
      }
      if (ce._atkCd > 0) ce._atkCd -= dt;
      // Player attack in cave
      if (consumeKey('Space') && cedd < 30) {
        ce.hp -= 2;
        addFloatingText(p.x, p.y - 10, '-2', '#88ff88');
        if (ce.hp <= 0) { addXP(15); }
      }
    }
    // Next room
    if (f2.cavePlayerX > 280 && f2.caveRoom < 2) {
      f2.caveRoom++;
      f2.cavePlayerX = 20;
      _v2PopulateCaveRoom(f2);
      showNotification('Cave Room ' + (f2.caveRoom + 1) + '/3');
    }
    // Exit cave
    if (f2.caveRoom >= 2 && f2.cavePlayerX > 280) {
      var allDead = true;
      for (var adci = 0; adci < f2.caveEnemies.length; adci++) {
        if (f2.caveEnemies[adci].hp > 0) allDead = false;
      }
      if (allDead) {
        f2.caveActive = false;
        showNotification('Cave cleared! Great loot!');
        addXP(50);
      }
    }
    return; // block other exploration while in cave
  }
  // Enter caves
  if (!blocked) {
    for (var cvi = 0; cvi < f2.caves.length; cvi++) {
      var cave = f2.caves[cvi];
      if (cave.discovered && dist(p, cave) < 30 && consumeKey('KeyE')) {
        f2.caveActive = true;
        f2.caveRoom = 0;
        f2.cavePlayerX = 20;
        f2.cavePlayerY = 100;
        _v2PopulateCaveRoom(f2);
        showNotification('Entered hidden cave! (ESC to exit)');
        return;
      }
      if (!cave.discovered && dist(p, cave) < 25) {
        cave.discovered = true;
        showNotification('Discovered a hidden cave! Press E to enter.');
        addXP(20);
      }
    }
  }

  // 103: Ghost Events — night only
  if (f2.ghostTimer > 0) f2.ghostTimer -= dt;
  if (game.time > 0.8 || game.time < 0.15) {
    if (f2.ghostTimer <= 0 && Math.random() < 0.0003) {
      f2.ghostSightings.push({
        x: p.x + rand(-150, 150), y: p.y + rand(-150, 150),
        life: 5, alpha: 0.7
      });
      f2.ghostTimer = 30;
      showNotification('A ghostly apparition appears...');
    }
  }
  var gsWrite = 0;
  for (var gsi = 0; gsi < f2.ghostSightings.length; gsi++) {
    var gs = f2.ghostSightings[gsi];
    gs.life -= dt;
    gs.alpha -= dt * 0.1;
    if (gs.life > 0) {
      // Follow ghost for loot
      if (dist(p, gs) < 25) {
        game.gold += rand(10, 40);
        addFloatingText(p.x, p.y - 10, 'Ghost loot!', '#aaaaff');
        addXP(15);
        continue;
      }
      f2.ghostSightings[gsWrite++] = gs;
    }
  }
  f2.ghostSightings.length = gsWrite;

  // 104: Dynamic Weather Events
  if (f2.weatherEventTimer > 0) {
    f2.weatherEventTimer -= dt;
    if (f2.weatherEventTimer <= 0) {
      f2.weatherEvent = null;
      showNotification('Weather event has passed');
    } else {
      // Apply weather event effects
      if (f2.weatherEvent === 'tornado') {
        // Push player randomly
        if (Math.random() < 0.05) {
          var nx = p.x + rand(-3, 3);
          var ny = p.y + rand(-3, 3);
          if (canMove(nx, ny, 5)) { p.x = nx; p.y = ny; }
        }
      } else if (f2.weatherEvent === 'heatwave') {
        // Stamina drain placeholder
        if (Math.random() < 0.002) {
          p.hp = Math.max(1, p.hp - 1);
          addFloatingText(p.x, p.y - 10, 'Heat!', '#ff8800');
        }
      } else if (f2.weatherEvent === 'blizzard') {
        // Slow + cold damage
        if (Math.random() < 0.002) {
          p.hp = Math.max(1, p.hp - 1);
          addFloatingText(p.x, p.y - 10, 'Cold!', '#88ccff');
        }
      }
    }
  } else if (Math.random() < 0.00005) {
    var events = ['tornado', 'heatwave', 'blizzard', 'flood'];
    f2.weatherEvent = events[rand(0, events.length - 1)];
    f2.weatherEventTimer = rand(15, 30);
    showNotification('WEATHER EVENT: ' + f2.weatherEvent.toUpperCase() + '! Take cover!');
  }

  // 105: Seasonal Changes
  f2.seasonDay += dt * 0.01;
  if (f2.seasonDay >= 20) {
    f2.seasonDay = 0;
    var seasons = ['spring', 'summer', 'autumn', 'winter'];
    var si = seasons.indexOf(f2.season);
    f2.season = seasons[(si + 1) % 4];
    showNotification('Season changed to ' + f2.season.toUpperCase() + '!');
  }

  // 106: Wildlife Hunting — interact with existing wildlife
  if (game._features && game._features.wildlife) {
    for (var whi = 0; whi < game._features.wildlife.length; whi++) {
      var wh = game._features.wildlife[whi];
      if (wh._hunted) continue;
      // Check if player shoots nearby wildlife (simplified — if clicking/shooting near them)
      if (dist(p, wh) < 30 && game.player.shootCooldown <= 0 && keys['Space']) {
        wh._hunted = true;
        f2.huntedAnimals++;
        var peltValues = { rabbit: 5, deer: 15, wolf: 25, bear: 50, coyote: 20, hawk: 10, lizard: 3, owl: 8, bat: 5 };
        var peltType = wh.type;
        var peltVal = peltValues[peltType] || 5;
        if (f2.pelts[peltType] !== undefined) f2.pelts[peltType]++;
        game.gold += peltVal;
        addFloatingText(p.x, p.y - 10, '+$' + peltVal + ' (' + peltType + ' pelt)', '#cc8844');
        f2.survivalSkills.tracking = Math.min(100, f2.survivalSkills.tracking + 1);
      }
    }
  }

  // 107: Fishing Expansion — enhance existing fishing
  if (game._features && game._features.fishingActive) {
    // Log species on catch
    if (game._features.fishCaught > 0 && !f2._lastFishCount) f2._lastFishCount = 0;
    if (game._features.fishCaught > (f2._lastFishCount || 0)) {
      var species = f2.fishSpecies[rand(0, f2.fishSpecies.length - 1)];
      f2.fishLog[species] = (f2.fishLog[species] || 0) + 1;
      f2._lastFishCount = game._features.fishCaught;
      var fishValue = species === 'GoldenCarp' ? 100 : (species === 'Sturgeon' ? 50 : rand(5, 20));
      fishValue += f2.rodLevel * 5;
      game.gold += fishValue;
      addFloatingText(p.x, p.y - 15, 'Caught ' + species + '! +$' + fishValue, '#44aaff');
    }
  }

  // 108: Prospecting — near water tiles
  if (f2.prospectingActive) {
    f2.prospectTimer -= dt;
    if (f2.prospectTimer <= 0) {
      f2.prospectingActive = false;
      var roll = Math.random();
      var prospectGold = 0;
      if (roll < 0.6) { showNotification('Nothing found...'); }
      else if (roll < 0.85) { prospectGold = 5; }
      else if (roll < 0.95) { prospectGold = 15; }
      else if (roll < 0.99) { prospectGold = 40; }
      else { prospectGold = 200; showNotification('LEGENDARY GOLD NUGGET! +$200!'); }
      if (prospectGold > 0) {
        game.gold += prospectGold;
        addFloatingText(p.x, p.y - 10, '+$' + prospectGold, '#ffd700');
        f2.prospectCount++;
        f2.survivalSkills.foraging = Math.min(100, f2.survivalSkills.foraging + 2);
      }
    }
  }

  // 109: Campfire Storytelling
  if (f2.storyActive) {
    f2.storyTimer -= dt;
    if (f2.storyTimer <= 0 || consumeKey('Escape')) {
      f2.storyActive = false;
    }
  }
  if (!blocked && !f2.storyActive && game._features && game._features.campfires) {
    for (var csi = 0; csi < game._features.campfires.length; csi++) {
      var cf = game._features.campfires[csi];
      if (dist(p, cf) < 30 && (game.time > 0.75 || game.time < 0.2) && consumeKey('KeyE')) {
        // Pick unheard story
        var unheard = [];
        for (var usi = 0; usi < f2.loreTexts.length; usi++) {
          if (f2.storiesHeard.indexOf(usi) === -1) unheard.push(usi);
        }
        if (unheard.length > 0) {
          var storyIdx = unheard[rand(0, unheard.length - 1)];
          f2.storiesHeard.push(storyIdx);
          f2.storyActive = true;
          f2.storyText = f2.loreTexts[storyIdx];
          f2.storyTimer = 8;
          addXP(10);
          showNotification('Campfire story...');
        } else {
          showNotification('You\'ve heard all the stories.');
        }
      }
    }
  }

  // 110: Scenic Viewpoints
  for (var vvi = 0; vvi < f2.vistaLocations.length; vvi++) {
    var vv = f2.vistaLocations[vvi];
    if (f2.vistasFound.indexOf(vvi) === -1 && dist(p, vv) < 25) {
      f2.vistasFound.push(vvi);
      addXP(50);
      showNotification('Vista discovered! "' + ['Sunrise Point','Eagle\'s Perch','Canyon View','Desert Overlook','River Bend'][vvi % 5] + '" +50 XP');
    }
  }

  // 111: Quicksand Hazards
  if (f2.inQuicksand) {
    f2.quicksandTimer -= dt;
    // Slow movement
    p.x = lerp(p.x, f2._qsX, 0.02);
    p.y = lerp(p.y, f2._qsY, 0.02);
    if (consumeKey('Space')) f2.quicksandTimer -= 0.5;
    if (f2.quicksandTimer <= 0) {
      f2.inQuicksand = false;
      showNotification('Escaped quicksand!');
    }
  } else {
    for (var qsi = 0; qsi < f2.quicksandLocations.length; qsi++) {
      var qs = f2.quicksandLocations[qsi];
      if (dist(p, qs) < 20) {
        f2.inQuicksand = true;
        f2.quicksandTimer = 3;
        f2._qsX = qs.x;
        f2._qsY = qs.y;
        showNotification('QUICKSAND! Tap SPACE rapidly to escape!');
      }
    }
  }

  // 112: Bridge Building — simplified
  // Bridges persist and create shortcuts (stored in bridges[])

  // 114: Natural Disasters
  if (f2.disasterActive) {
    f2.disasterTimer -= dt;
    if (f2.disasterTimer <= 0) {
      f2.disasterActive = null;
      showNotification('The disaster has ended.');
    } else {
      if (f2.disasterActive === 'earthquake') {
        triggerShake(2, 3);
        if (Math.random() < 0.003) {
          p.hp = Math.max(1, p.hp - 1);
          addFloatingText(p.x, p.y - 10, 'Quake!', '#cc8844');
        }
      } else if (f2.disasterActive === 'wildfire') {
        // Spread fire patches
        if (Math.random() < 0.01 && f2.firePatches.length < 20) {
          f2.firePatches.push({ x: p.x + rand(-200, 200), y: p.y + rand(-200, 200), life: 10, tickTimer: 0.5 });
        }
      } else if (f2.disasterActive === 'locusts') {
        // Visual + economy hit
        if (Math.random() < 0.001) {
          f2.priceMultipliers.food = Math.min(3, f2.priceMultipliers.food + 0.1);
          showNotification('Locusts destroying crops! Food prices rising!');
        }
      }
    }
  } else if (Math.random() < 0.00002) {
    var disasters = ['earthquake', 'wildfire', 'locusts'];
    f2.disasterActive = disasters[rand(0, disasters.length - 1)];
    f2.disasterTimer = rand(20, 40);
    showNotification('DISASTER: ' + f2.disasterActive.toUpperCase() + '!');
  }

  // 116: Wanted Poster Pieces
  // Pieces drop from outlaws (handled externally) — track collection
  var pieceSets = Object.keys(f2.posterPieces);
  for (var ppi = 0; ppi < pieceSets.length; ppi++) {
    if (f2.posterPieces[pieceSets[ppi]] >= 3 && f2.completedPosters < 5) {
      f2.completedPosters++;
      delete f2.posterPieces[pieceSets[ppi]];
      showNotification('Wanted poster completed! Bounty location revealed! (+$50)');
      game.gold += 50;
      addXP(25);
    }
  }

  // 117: Oasis Rest Points
  for (var oi = 0; oi < f2.oasisLocations.length; oi++) {
    var oasis = f2.oasisLocations[oi];
    if (!oasis.used && dist(p, oasis) < 25) {
      oasis.used = true;
      f2.oasisFound.push(oi);
      p.hp = p.maxHp;
      showNotification('Oasis found! Fully healed!');
      addXP(20);
    }
  }

  // 119: Environmental Storytelling — props
  for (var epi = 0; epi < f2.propLocations.length; epi++) {
    var ep = f2.propLocations[epi];
    if (!ep.found && dist(p, ep) < 20) {
      ep.found = true;
      f2.propsFound.push(epi);
      game.gold += ep.reward;
      addFloatingText(p.x, p.y - 10, 'Found: ' + ep.name + ' +$' + ep.reward, '#ccaa88');
      addXP(10);
      // Add lore entry
      if (f2.loreEntries.length < 50) {
        var loreIdx = f2.loreEntries.length;
        if (loreIdx < f2.loreTexts.length) {
          f2.loreEntries.push(f2.loreTexts[loreIdx]);
        }
      }
    }
  }

  // 120: Underground Tunnels
  if (f2.inTunnel) {
    if (consumeKey('Escape') || consumeKey('KeyE')) {
      f2.inTunnel = false;
      // Teleport to other end
      for (var tli = 0; tli < f2.tunnelLocations.length; tli++) {
        var tl = f2.tunnelLocations[tli];
        if (Math.abs(p.x - tl.x1) < 40 && Math.abs(p.y - tl.y1) < 40) {
          p.x = tl.x2; p.y = tl.y2; break;
        } else if (Math.abs(p.x - tl.x2) < 40 && Math.abs(p.y - tl.y2) < 40) {
          p.x = tl.x1; p.y = tl.y1; break;
        }
      }
      showNotification('Exited tunnel!');
    }
    return;
  }
  for (var tdi = 0; tdi < f2.tunnelLocations.length; tdi++) {
    var td = f2.tunnelLocations[tdi];
    if ((dist(p, {x: td.x1, y: td.y1}) < 20 || dist(p, {x: td.x2, y: td.y2}) < 20)) {
      if (f2.tunnelDiscovered.indexOf(tdi) === -1) {
        f2.tunnelDiscovered.push(tdi);
        showNotification('Tunnel entrance discovered! Press E to enter.');
        addXP(15);
      }
      if (consumeKey('KeyE')) {
        f2.inTunnel = true;
        showNotification('Entered tunnel. Press E to exit at the other end.');
      }
    }
  }

  // 121: Landmark Discovery
  for (var ldi = 0; ldi < f2.landmarkLocations.length; ldi++) {
    var ld = f2.landmarkLocations[ldi];
    if (!ld.found && dist(p, ld) < 30) {
      ld.found = true;
      f2.landmarksFound.push(ldi);
      addXP(30);
      showNotification('Landmark discovered: ' + ld.name + '! (' + f2.landmarksFound.length + '/10)');
      // Codex entry
      if (f2.codex.locations.indexOf(ld.name) === -1) f2.codex.locations.push(ld.name);
      // Check Explorer title
      if (f2.landmarksFound.length >= 10 && f2.titles.indexOf('Explorer') === -1) {
        f2.titles.push('Explorer');
        showNotification('Title earned: Explorer!');
      }
    }
  }

  // 122: Bird's Eye View — E near tall buildings
  if (f2.onRooftop) {
    f2.rooftopTimer -= dt;
    if (f2.rooftopTimer <= 0 || consumeKey('Escape') || consumeKey('KeyE')) {
      f2.onRooftop = false;
      showNotification('Climbed down from rooftop');
    }
  }
  if (!blocked && !f2.onRooftop) {
    for (var rbi = 0; rbi < game.buildings.length; rbi++) {
      var rb = game.buildings[rbi];
      if (dist(p, rb) < 35 && consumeKey('KeyE')) {
        f2.onRooftop = true;
        f2.rooftopTimer = 15;
        showNotification('Climbed to rooftop! Extended view + accuracy bonus for 15s');
        break;
      }
    }
  }

  // 123: Time Capsule
  for (var tci = 0; tci < f2.capsuleLocations.length; tci++) {
    var tc = f2.capsuleLocations[tci];
    if (!tc.found && dist(p, tc) < 20) {
      tc.found = true;
      f2.capsulesFound.push(tci);
      game.gold += 250;
      addFloatingText(p.x, p.y - 10, 'Time Capsule! +$250', '#ffd700');
      showNotification('Found a time capsule! Historical letter + rare item + $250!');
      addXP(40);
    }
  }

  // 124: Meteor Shower
  if (f2.meteorShowerActive) {
    // Spawn visual particles
    if (Math.random() < 0.3) {
      f2.meteorParticles.push({
        x: rand(0, canvas.width), y: 0,
        dx: rand(-2, 2), dy: rand(3, 7),
        life: rand(20, 40), size: rand(1, 3)
      });
    }
    f2.meteorShowerActive = f2.meteorParticles.length > 0;
    // One meteor lands
    if (!f2.meteoriteFound && Math.random() < 0.001) {
      f2.meteoriteFound = true;
      game.gold += 300;
      showNotification('A meteorite landed nearby! +$300 (or unique weapon)');
      addXP(50);
      // Give boss weapon
      if (f2.bossWeapons.length < 5) {
        f2.bossWeapons.push({ name: 'Meteor Hammer', damage: 5, special: 'fire' });
        showNotification('Found Meteor Hammer!');
      }
    }
  }
  // Meteor shower trigger
  if (!f2.meteorShowerActive && (game.time > 0.8 || game.time < 0.15) && Math.random() < 0.0002) {
    f2.meteorShowerActive = true;
    showNotification('METEOR SHOWER! Watch the sky!');
  }
  // Update meteor particles
  var mpWrite = 0;
  for (var mpi = 0; mpi < f2.meteorParticles.length; mpi++) {
    var mp = f2.meteorParticles[mpi];
    mp.x += mp.dx; mp.y += mp.dy; mp.life--;
    if (mp.life > 0 && mp.y < canvas.height) f2.meteorParticles[mpWrite++] = mp;
  }
  f2.meteorParticles.length = mpWrite;

  // 125: Sunset/Sunrise Bonus
  if (f2.peacefulMoment) {
    f2.peacefulTimer -= dt;
    if (f2.peacefulTimer <= 0) {
      f2.peacefulMoment = false;
    }
  }
  var isSunEvent = (game.time > 0.22 && game.time < 0.28) || (game.time > 0.72 && game.time < 0.78);
  if (isSunEvent && !p.moving) {
    f2.peacefulStandStill += dt;
    if (f2.peacefulStandStill >= 5 && !f2.peacefulMoment) {
      f2.peacefulMoment = true;
      f2.peacefulTimer = 60; // 1 game hour approx
      showNotification('Peaceful Moment... +10% reputation gain for a while');
    }
  } else {
    f2.peacefulStandStill = 0;
  }

  // 195: Skull collection for Devil boss
  for (var ski = 0; ski < f2.skullLocations.length; ski++) {
    var sk = f2.skullLocations[ski];
    if (!sk.found && dist(p, sk) < 20) {
      sk.found = true;
      f2.skullsFound++;
      showNotification('Skull found! (' + f2.skullsFound + '/5)');
      addXP(20);
    }
  }
  // Devil fight trigger — 5 skulls + at midnight
  if (f2.skullsFound >= 5 && !f2.devilDefeated && !f2.devilFightActive) {
    if (game.time > 0.95 || game.time < 0.05) {
      // Check if near cemetery/church area
      for (var dbi = 0; dbi < game.buildings.length; dbi++) {
        var db = game.buildings[dbi];
        if (db.type === 'church' && dist(p, db) < 60) {
          f2.devilFightActive = true;
          f2.devilHP = 50;
          showNotification('THE DEVIL APPEARS! Prepare for battle!');
          triggerShake(10, 30);
          break;
        }
      }
    }
  }
  // Devil fight
  if (f2.devilFightActive) {
    // Devil attacks
    if (Math.random() < 0.02) {
      p.hp -= 2;
      addFloatingText(p.x, p.y - 10, 'Devil -2', '#ff0000');
      triggerShake(3, 5);
    }
    // Player can shoot devil (check space/attack)
    if (keys['Space'] && Math.random() < 0.1) {
      var dDmg = f2.lastStandActive ? 4 : 2;
      f2.devilHP -= dDmg;
      addFloatingText(p.x + rand(-30, 30), p.y - 30, '-' + dDmg, '#ffff00');
      if (f2.devilHP <= 0) {
        f2.devilFightActive = false;
        f2.devilDefeated = true;
        game.gold += 1000;
        addXP(500);
        showNotification('THE DEVIL IS DEFEATED! +$1000 +500XP');
        addJournalEntry('Defeated The Devil in the cemetery at midnight.');
        if (f2.titles.indexOf('Devil Slayer') === -1) f2.titles.push('Devil Slayer');
      }
    }
  }
}

// Helper: populate cave room
function _v2PopulateCaveRoom(f2) {
  var room = f2.caves[0] ? f2.caves[0].rooms[f2.caveRoom] : null;
  f2.caveEnemies = [];
  f2.caveLoot = [];
  if (room) {
    for (var i = 0; i < room.enemies; i++) {
      f2.caveEnemies.push({ x: rand(50, 250), y: rand(30, 170), hp: 3, _atkCd: 0 });
    }
    var lootCount = rand(2, 4);
    for (var j = 0; j < lootCount; j++) {
      f2.caveLoot.push({ x: rand(30, 270), y: rand(20, 180), value: rand(10, 40), collected: false });
    }
  }
}

// ════════════════════════════════════════════════════════════
// ECONOMY & PROPERTY UPDATE (Features 76-100)
// ════════════════════════════════════════════════════════════
function _updateEconomy(dt, f2, p, blocked) {
  // 76: Property Purchasing — handled at buildings via interaction
  // Property income ticks daily (see daily processing)

  // 77: Saloon Management
  if (f2.saloonOwned) {
    // Income calculated in daily processing
  }

  // 82: Stock Market — price fluctuation each frame (tiny)
  if (Math.random() < 0.001) {
    var stockNames = ['railroad', 'mining', 'cattle'];
    var sn = stockNames[rand(0, 2)];
    var change = randF(-0.05, 0.05);
    f2.stocks[sn].price = Math.max(5, Math.round(f2.stocks[sn].price * (1 + change)));
  }

  // 83: Loan System — interest accrues
  if (f2.loan > 0) {
    // Interest calculated in daily processing
  }

  // 89: Crafting System — open/close
  if (!blocked && keys['ShiftLeft'] && consumeKey('KeyN')) {
    f2.craftingOpen = !f2.craftingOpen;
    showNotification(f2.craftingOpen ? 'Crafting menu opened (1-5 to craft, Shift+N to close)' : 'Crafting menu closed');
  }
  if (f2.craftingOpen) {
    // Number keys 1-5 to craft recipes
    for (var ci = 0; ci < f2.craftingRecipes.length; ci++) {
      if (consumeKey('Digit' + (ci + 1))) {
        var recipe = f2.craftingRecipes[ci];
        var canCraft = true;
        for (var ni = 0; ni < recipe.needs.length; ni++) {
          var need = recipe.needs[ni];
          if (!f2.craftingInventory[need] || f2.craftingInventory[need] <= 0) {
            canCraft = false; break;
          }
        }
        if (canCraft) {
          for (var di = 0; di < recipe.needs.length; di++) {
            f2.craftingInventory[recipe.needs[di]]--;
          }
          if (recipe.result === 'poisonBullets') { f2.poisonBullets += 5; showNotification('Crafted 5 Poison Bullets!'); }
          else if (recipe.result === 'goldBar') { game.gold += 100; showNotification('Crafted Gold Bar! +$100'); }
          else if (recipe.result === 'tonic') { p.hp = Math.min(p.maxHp, p.hp + 5); showNotification('Health Tonic! +5 HP'); }
          else if (recipe.result === 'incendiaryRounds') { f2.incendiaryRounds += 3; showNotification('Crafted 3 Incendiary Rounds!'); }
          else if (recipe.result === 'bearTrap') { f2.bearTrapCount += 2; showNotification('Crafted 2 Bear Traps!'); }
          f2.survivalSkills.cooking = Math.min(100, f2.survivalSkills.cooking + 3);
        } else {
          showNotification('Missing ingredients for ' + recipe.name + '!');
        }
      }
    }
  }

  // 91: Auction House — every 5 days
  if (game.dayCount > 0 && game.dayCount % 5 === 0 && !f2.auctionActive && f2.auctionDay !== game.dayCount) {
    f2.auctionActive = true;
    f2.auctionDay = game.dayCount;
    f2.auctionItems = [
      { name: 'Fine Horse', basePrice: rand(200, 400), type: 'horse' },
      { name: 'Rare Weapon', basePrice: rand(100, 300), type: 'weapon' },
      { name: 'Property Deed', basePrice: rand(300, 600), type: 'property' }
    ];
    f2.auctionBid = 0;
    showNotification('Auction House is open today! Press U to bid.');
  }
  if (f2.auctionActive) {
    if (game.dayCount !== f2.auctionDay) {
      f2.auctionActive = false;
    }
    if (!blocked && consumeKey('KeyU') && f2.auctionItems.length > 0) {
      var item = f2.auctionItems[0];
      var bidPrice = item.basePrice + rand(0, 50);
      var npcBid = item.basePrice + rand(10, 80);
      if (game.gold >= bidPrice && bidPrice >= npcBid) {
        game.gold -= bidPrice;
        showNotification('Won auction: ' + item.name + ' for $' + bidPrice + '!');
        if (item.type === 'horse') {
          f2.horseTier = Math.min(4, f2.horseTier + 1);
          f2.horseName = f2.horseTiers[f2.horseTier].name;
        } else if (item.type === 'weapon') {
          f2.bossWeapons.push({ name: item.name, damage: rand(3, 6), special: 'none' });
        } else if (item.type === 'property') {
          f2.ownedPropertiesV2.push({ name: 'Auction Property', income: rand(15, 35), level: 1 });
        }
        f2.auctionItems.shift();
      } else if (game.gold < bidPrice) {
        showNotification('Not enough gold! Need $' + bidPrice);
      } else {
        showNotification('Outbid by NPC! ($' + npcBid + ' vs your $' + bidPrice + ')');
        f2.auctionItems.shift();
      }
    }
  }

  // 93: Bank Vault
  // Deposit/withdraw handled via bank building interaction

  // 95: Horse Trading
  // Tier affects speed — applied in movement code

  // 96: Property Renovation
  // Upgrade via building interaction

  // 99: Boom/Bust Cycle
  f2.cycleTimer += dt;
  if (f2.cycleTimer > 900) { // ~15 days in game time
    f2.cycleTimer = 0;
    var roll = Math.random();
    if (roll < 0.4) {
      f2.economyCycle = 'boom';
      showNotification('ECONOMIC BOOM! +50% income, +30% prices!');
    } else if (roll < 0.8) {
      f2.economyCycle = 'bust';
      showNotification('ECONOMIC BUST! -30% income, -20% prices.');
    } else {
      f2.economyCycle = 'normal';
    }
  }
}

// ════════════════════════════════════════════════════════════
// CRIME FEATURES UPDATE (Features 153-174)
// ════════════════════════════════════════════════════════════
function _updateCrimeFeatures(dt, f2, p, blocked) {
  // 153: Undercover Operations
  if (f2.undercover) {
    f2.undercoverTimer -= dt;
    if (f2.undercoverTimer <= 0) {
      f2.undercover = false;
      showNotification('Undercover disguise worn off!');
    }
    // While undercover, hostiles ignore player
    for (var uci = 0; uci < game.npcs.length; uci++) {
      var ucn = game.npcs[uci];
      if (ucn.hostile && ucn.state === 'chasing') {
        ucn.state = 'idle';
      }
    }
  }

  // 157: Serial Criminal — spawns every 3 days
  if (game.dayCount > 0 && game.dayCount % 3 === 0 && f2.serialSpawnDay !== game.dayCount) {
    f2.serialSpawnDay = game.dayCount;
    if (!f2.serialCriminal || f2.serialCriminal.state === 'dead') {
      var scNames = ['The Shadow','Red Hand','Snake Eyes','Iron Mask','Ghost Rider'];
      f2.serialCriminal = {
        x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE,
        name: scNames[f2.serialCatchCount % scNames.length],
        hp: 8 + f2.serialCatchCount * 2, hostile: true, state: 'idle',
        _serial: true
      };
      showNotification('Serial criminal "' + f2.serialCriminal.name + '" spotted in town!');
    }
  }
  if (f2.serialCriminal && f2.serialCriminal.state !== 'dead') {
    var sc = f2.serialCriminal;
    // Move around
    sc.x += randF(-1, 1);
    sc.y += randF(-1, 1);
    sc.x = clamp(sc.x, TILE, (MAP_W - 1) * TILE);
    sc.y = clamp(sc.y, TILE, (MAP_H - 1) * TILE);
    // Player can fight (with cooldown to prevent every-frame damage)
    if (sc._attackCd > 0) sc._attackCd -= dt;
    if (dist(p, sc) < 25 && keys['Space'] && (!sc._attackCd || sc._attackCd <= 0)) {
      sc._attackCd = 0.35;
      var scDmg = 2 + (f2.weaponUpgrades[game.currentWeapon] || 0);
      sc.hp -= scDmg;
      addFloatingText(sc.x, sc.y - 10, '-' + scDmg, '#ff4444');
      if (sc.hp <= 0) {
        sc.state = 'dead';
        f2.serialCatchCount++;
        var reward = 50 + f2.serialCatchCount * 25;
        game.gold += reward;
        addXP(40);
        game.reputation = Math.min(REPUTATION_MAX, game.reputation + 10);
        showNotification('Serial criminal captured! +$' + reward + ' +10 Rep');
        f2.bountyXP += 20;
      }
    }
    // Serial attacks player
    if (dist(p, sc) < 30 && Math.random() < 0.02) {
      p.hp -= 1;
      addFloatingText(p.x, p.y - 10, '-1', '#ff0000');
    }
  }

  // 159: Witness Protection — escort active witness
  if (f2.witnessEscort) {
    var we = f2.witnessEscort;
    // Move witness toward target
    if (f2.witnessEscortTarget) {
      var wedx = f2.witnessEscortTarget.x - we.x;
      var wedy = f2.witnessEscortTarget.y - we.y;
      var wedd = Math.sqrt(wedx * wedx + wedy * wedy);
      if (wedd > 30) {
        we.x += (wedx / wedd) * 1.5;
        we.y += (wedy / wedd) * 1.5;
      } else {
        // Arrived safely
        f2.witnessEscort = null;
        f2.witnessEscortTarget = null;
        addXP(30);
        game.gold += 40;
        game.reputation = Math.min(REPUTATION_MAX, game.reputation + 5);
        showNotification('Witness delivered safely! +$40 +5 Rep');
      }
    }
  }

  // 160: Crime Prevention Patrols
  if (f2.patrolActive) {
    f2.patrolTimer -= dt;
    if (f2.patrolTimer <= 0) {
      f2.patrolActive = false;
      addXP(20);
      game.reputation = Math.min(REPUTATION_MAX, game.reputation + 3);
      showNotification('Patrol complete! +20 XP +3 Rep');
    } else {
      // Check if player is near patrol point
      if (f2.patrolPoints.length > 0) {
        var pp = f2.patrolPoints[f2.patrolIndex % f2.patrolPoints.length];
        if (dist(p, pp) < 30) {
          f2.patrolIndex++;
          if (f2.patrolIndex >= f2.patrolPoints.length) {
            f2.patrolActive = false;
            addXP(30);
            game.reputation = Math.min(REPUTATION_MAX, game.reputation + 5);
            showNotification('Full patrol route completed! +30 XP +5 Rep');
          } else {
            showNotification('Checkpoint ' + f2.patrolIndex + '/' + f2.patrolPoints.length);
          }
        }
      }
    }
  }
  // Start patrol at night
  if (!blocked && !f2.patrolActive && (game.time > 0.8 || game.time < 0.2) && consumeKey('Digit0')) {
    f2.patrolActive = true;
    f2.patrolIndex = 0;
    f2.patrolTimer = 120;
    showNotification('Crime prevention patrol started! Visit all checkpoints.');
  }

  // 161: Organized Crime Network
  for (var cni = 0; cni < f2.crimeNetwork.length; cni++) {
    var cn = f2.crimeNetwork[cni];
    if (cn.busted) continue;
    if (dist(p, cn) < 30 && consumeKey('KeyE')) {
      if (game.level >= cn.level * 10) {
        cn.busted = true;
        f2.networkBusted++;
        var cnReward = cn.level * 75;
        game.gold += cnReward;
        addXP(cn.level * 30);
        game.reputation = Math.min(REPUTATION_MAX, game.reputation + cn.level * 5);
        showNotification('Busted ' + cn.name + '! +$' + cnReward);
        if (f2.networkBusted >= 3) {
          showNotification('CRIME NETWORK DISMANTLED! Bonus $200!');
          game.gold += 200;
          addXP(100);
        }
      } else {
        showNotification('Need level ' + (cn.level * 10) + ' to bust ' + cn.name + '!');
      }
    }
  }

  // 163: Contraband Seizure
  if (f2.contrabandCheck) {
    f2.contrabandTimer -= dt;
    if (f2.contrabandTimer <= 0) {
      f2.contrabandCheck = false;
      var found = Math.random() < 0.4;
      if (found) {
        game.gold += 30;
        addXP(15);
        game.reputation = Math.min(REPUTATION_MAX, game.reputation + 3);
        showNotification('Contraband found! Seized! +$30 +3 Rep');
      } else {
        showNotification('No contraband found. Stagecoach is clean.');
      }
    }
  }

  // 165: Public Execution — handled at gallows
  // 168: Vigilante Encounters
  if (!f2.vigilanteActive && Math.random() < 0.0001 && game.time > 0.75) {
    f2.vigilanteActive = true;
    f2.vigilanteNPC = {
      x: p.x + rand(-100, 100), y: p.y + rand(-100, 100),
      name: 'Vigilante', hp: 10
    };
    showNotification('A vigilante has appeared! They\'re taking justice into their own hands!');
  }
  if (f2.vigilanteActive && f2.vigilanteNPC) {
    var vig = f2.vigilanteNPC;
    // Vigilante fights outlaws
    var vigTarget = null, vigDist = 150;
    for (var vni = 0; vni < game.npcs.length; vni++) {
      var vn = game.npcs[vni];
      if (vn.hostile && vn.state !== 'dead') {
        var vd = dist(vig, vn);
        if (vd < vigDist) { vigDist = vd; vigTarget = vn; }
      }
    }
    if (vigTarget) {
      var vdx = vigTarget.x - vig.x, vdy = vigTarget.y - vig.y;
      var vdd = Math.sqrt(vdx * vdx + vdy * vdy);
      if (vdd > 20) { vig.x += (vdx / vdd) * 2; vig.y += (vdy / vdd) * 2; }
      else {
        if (!vig._atkCd) vig._atkCd = 0;
        if (vig._atkCd > 0) { vig._atkCd -= dt; }
        else {
          vigTarget.hp -= 2;
          addFloatingText(vigTarget.x, vigTarget.y - 8, '-2', '#ffaa00');
          if (vigTarget.hp <= 0) { vigTarget.state = 'dead'; }
          vig._atkCd = 1.0;
        }
      }
    }
    if (!vigTarget) {
      f2.vigilanteActive = false;
      f2.vigilanteNPC = null;
      showNotification('The vigilante has left.');
    }
  }

  // 174: Crime Ring Takedown
  if (f2.crimeRingOp) {
    f2.crimeRingProgress += dt * 0.01;
    if (f2.crimeRingProgress >= 1) {
      f2.crimeRingOp = null;
      f2.crimeRingProgress = 0;
      game.gold += 300;
      addXP(100);
      game.reputation = Math.min(REPUTATION_MAX, game.reputation + 15);
      showNotification('Crime ring takedown complete! +$300 +100XP +15 Rep!');
    }
  }
  // Start crime ring op if all network busted
  if (!f2.crimeRingOp && f2.networkBusted >= 3 && Math.random() < 0.0001) {
    f2.crimeRingOp = { name: 'Operation Clean Sweep' };
    f2.crimeRingProgress = 0;
    showNotification('Crime ring takedown operation started! Stay active to progress.');
  }
}

// ════════════════════════════════════════════════════════════
// RPG & POLISH UPDATE (Features 127-150, 176-200)
// ════════════════════════════════════════════════════════════
function _updateRPGPolish(dt, f2, p, blocked) {
  // 127: Prestige System — level 50 triggers option
  if (game.level >= 50 && f2.prestige < 10 && !blocked && consumeKey('F5')) {
    f2.prestige++;
    // Reset level with permanent bonus
    game.level = 1;
    game.xp = 0;
    showNotification('PRESTIGE ' + f2.prestige + '! Reset to level 1 with +' + (f2.prestige * 5) + '% permanent stat bonus!');
    addJournalEntry('Prestige level ' + f2.prestige + ' achieved!');
  }

  // 128: Class System — level 10 choose
  if (game.level >= 10 && !f2.playerClass && !blocked) {
    if (consumeKey('F1')) {
      f2.playerClass = 'gunslinger';
      showNotification('Class chosen: GUNSLINGER! +fire rate, +crit chance');
      addJournalEntry('Became a Gunslinger');
    } else if (consumeKey('F2')) {
      f2.playerClass = 'lawman';
      showNotification('Class chosen: LAWMAN! +arrest speed, +rep gain');
      addJournalEntry('Became a Lawman');
    } else if (consumeKey('F3')) {
      f2.playerClass = 'outlaw';
      showNotification('Class chosen: OUTLAW! +steal, +intimidate');
      addJournalEntry('Became an Outlaw');
    } else if (consumeKey('F4')) {
      f2.playerClass = 'ranger';
      showNotification('Class chosen: RANGER! +tracking, +animal taming');
      addJournalEntry('Became a Ranger');
    }
    if (f2.playerClass) {
      f2.classSkillPoints = 2;
      f2.classSkills = {};
      for (var cpi = 0; cpi < 10; cpi++) {
        f2.classSkills['node_' + cpi] = false;
      }
    }
  }

  // 129: Class Skill Trees — skill points on level up
  // Award class skill point every 5 levels after 10
  if (f2.playerClass && game.level > 10 && (game.level - 10) % 5 === 0) {
    if (!f2._lastClassSPLevel || f2._lastClassSPLevel < game.level) {
      f2._lastClassSPLevel = game.level;
      f2.classSkillPoints++;
      showNotification('Class skill point earned! (' + f2.classSkillPoints + ' available)');
    }
  }

  // 130: Passive Abilities — milestone perks
  var passiveLevels = [3, 5, 8, 10, 13, 16, 19, 22, 25, 30, 35, 40, 45, 50, 60];
  var passiveNames = [
    'Quick Feet (+5% speed)', 'Tough Skin (+5 max HP)', 'Eagle Eye (+10% accuracy)',
    'Haggler (-10% shop prices)', 'Lucky (+3% crit)', 'Iron Will (+10 max HP)',
    'Fleet Foot (+10% speed)', 'Sharp Shooter (+15% accuracy)', 'Charming (+5 rep/day)',
    'Wealthy (+10% gold)', 'Unstoppable (+20 max HP)', 'Master Aim (+20% accuracy)',
    'Fortune (+20% gold)', 'Titan (+30 max HP)', 'Legendary (+all stats)'
  ];
  for (var pli = 0; pli < passiveLevels.length; pli++) {
    if (game.level >= passiveLevels[pli] && f2.passives.indexOf(passiveNames[pli]) === -1) {
      f2.passives.push(passiveNames[pli]);
      showNotification('Passive unlocked: ' + passiveNames[pli]);
      // Apply passive
      if (pli === 1 || pli === 5 || pli === 10 || pli === 13) {
        var hpBonus = pli === 1 ? 5 : (pli === 5 ? 10 : (pli === 10 ? 20 : 30));
        p.maxHp += hpBonus;
        p.hp += hpBonus;
      }
    }
  }

  // 131: Daily XP Bonus
  // Reset daily bonuses when day changes
  if (f2.lastDayProcessed !== game.dayCount) {
    f2.dailyBonusUsed.crime = false;
    f2.dailyBonusUsed.quest = false;
  }

  // 136: XP Multiplier Events
  if (f2.xpEventTimer > 0) {
    f2.xpEventTimer -= dt;
    if (f2.xpEventTimer <= 0) {
      f2.xpMultiplier = 1;
      showNotification('Double XP event ended');
    }
  }
  if (f2.xpMultiplier === 1 && Math.random() < 0.00005) {
    f2.xpMultiplier = 2;
    f2.xpEventTimer = 120;
    showNotification('DOUBLE XP EVENT! 2 minutes!');
  }

  // 138: Weapon Proficiency — increases with use
  if (game.currentWeapon && f2.weaponProf[game.currentWeapon] !== undefined) {
    if (keys['Space'] && Math.random() < 0.01) {
      f2.weaponProf[game.currentWeapon] = Math.min(100, f2.weaponProf[game.currentWeapon] + 0.1);
    }
  }

  // 140: Achievement Points — aggregate from achievements
  if (game.achievements) {
    var pts = 0;
    for (var ai = 0; ai < game.achievements.length; ai++) {
      pts += 10; // 10 pts per achievement
    }
    f2.achievementPoints = pts;
    // Thresholds
    if (pts >= 100 && f2.badges.indexOf('gold') === -1) {
      f2.badges.push('gold');
      showNotification('Gold Badge earned! (100 Achievement Points)');
    }
    if (pts >= 500 && f2.titles.indexOf('Achiever') === -1) {
      f2.titles.push('Achiever');
      showNotification('Title earned: Achiever! (500 AP)');
    }
  }

  // 142: Daily Streak Bonus
  if (f2.lastLoginDay !== game.dayCount) {
    if (f2.lastLoginDay === game.dayCount - 1) {
      f2.loginStreak++;
    } else {
      f2.loginStreak = 1;
    }
    f2.lastLoginDay = game.dayCount;
    f2.loginDays++;
    var streakBonus = Math.min(20, f2.loginStreak) * 5;
    if (streakBonus > 0) {
      game.gold += streakBonus;
      showNotification('Day ' + f2.loginStreak + ' streak! +$' + streakBonus + ' gold bonus');
    }
  }

  // 143: Mentor System
  if (game.level >= 25 && !f2.mentee) {
    f2.mentee = { name: 'Deputy ' + ['Jake','Emma','Cole','Rose','Hank'][rand(0, 4)], level: 1 };
    showNotification('You can now mentor ' + f2.mentee.name + '!');
  }
  if (f2.mentee && f2.menteeLevel < game.level) {
    // Mentee levels up slowly
    if (Math.random() < 0.001) {
      f2.menteeLevel++;
      f2.mentee.level = f2.menteeLevel;
      if (f2.menteeLevel % 5 === 0) {
        showNotification(f2.mentee.name + ' reached level ' + f2.menteeLevel + '!');
      }
    }
  }

  // 144: Bounty Hunter Rank
  var rankThresholds = [0, 50, 150, 300, 500];
  for (var bri = rankThresholds.length - 1; bri >= 0; bri--) {
    if (f2.bountyXP >= rankThresholds[bri]) {
      if (f2.bountyRank < bri) {
        f2.bountyRank = bri;
        showNotification('Bounty Hunter rank: ' + f2.bountyRankNames[bri] + '!');
      }
      break;
    }
  }

  // 145: Survival Skills — passive gain from activities
  // (Tracked in individual feature updates)

  // 146: Fear Aura — level 40+
  if (game.level >= 40) {
    f2.fearAuraActive = true;
    for (var fai = 0; fai < game.npcs.length; fai++) {
      var fan = game.npcs[fai];
      if (fan.hostile && fan.hp <= 3 && fan.state !== 'dead' && fan.state !== 'fleeing' && dist(p, fan) < 80) {
        fan.state = 'fleeing';
        fan._fleeTimer = 3;
      }
    }
  }

  // 147: Perk Roulette — every 5 levels
  if (game.level % 5 === 0 && game.level > 0 && !f2.perkRouletteActive && !f2._lastPerkLevel) {
    f2._lastPerkLevel = 0;
  }
  if (game.level % 5 === 0 && game.level > (f2._lastPerkLevel || 0)) {
    f2.perkRouletteActive = true;
    f2._lastPerkLevel = game.level;
    f2.availablePerks = PERK_ROULETTE_DEFS.map(function(d, i) { return { name: d.name, defIdx: i }; });
    f2.perkRouletteAngle = 0;
    showNotification('PERK ROULETTE! Press SPACE to spin, then SPACE to stop!');
  }
  if (f2.perkRouletteActive) {
    f2.perkRouletteAngle += dt * 5;
    if (consumeKey('Space')) {
      var selectedIdx = Math.floor((f2.perkRouletteAngle * 10) % f2.availablePerks.length);
      var perk = f2.availablePerks[selectedIdx];
      PERK_ROULETTE_DEFS[perk.defIdx].applyFn(p, f2);
      f2.perkRouletteActive = false;
      f2.selectedPerk = perk;
      showNotification('Perk selected: ' + perk.name + '!');
    }
  }

  // 148: Combat Rating
  if (f2.combatRatingTimer > 0) {
    f2.combatRatingTimer -= dt;
    if (f2.combatRatingTimer <= 0) {
      // Calculate rating
      var total = f2.combatHits + f2.combatMisses;
      var accuracy = total > 0 ? f2.combatHits / total : 0;
      var dmgFactor = Math.max(0, 1 - f2.combatDamageTaken * 0.1);
      var score = accuracy * 0.6 + dmgFactor * 0.4;
      if (score > 0.9) f2.lastCombatRating = 'S';
      else if (score > 0.75) f2.lastCombatRating = 'A';
      else if (score > 0.6) f2.lastCombatRating = 'B';
      else if (score > 0.4) f2.lastCombatRating = 'C';
      else if (score > 0.2) f2.lastCombatRating = 'D';
      else f2.lastCombatRating = 'F';
      showNotification('Combat Rating: ' + f2.lastCombatRating + (f2.lastCombatRating === 'S' ? ' — Perfect! Bonus loot!' : ''));
      if (f2.lastCombatRating === 'S') {
        game.gold += 25;
        addXP(15);
      }
      f2.combatHits = 0;
      f2.combatMisses = 0;
      f2.combatDamageTaken = 0;
    }
  }

  // 149: Flashback Missions
  var fbLevels = [20, 40, 60, 80];
  for (var fbi = 0; fbi < fbLevels.length; fbi++) {
    if (game.level >= fbLevels[fbi] && f2.flashbacksCompleted.indexOf(fbi) === -1) {
      // Auto-complete flashback (simplified — no separate level)
      f2.flashbacksCompleted.push(fbi);
      addXP(50);
      showNotification('Flashback memory unlocked! (Level ' + fbLevels[fbi] + ' backstory)');
      addJournalEntry('Flashback: You remembered your past at level ' + fbLevels[fbi] + '...');
    }
  }

  // 176: Daily Reward Calendar
  if (f2.calendarDay < game.dayCount && f2.calendarClaimed.indexOf(game.dayCount) === -1) {
    f2.calendarDay = game.dayCount;
    var dayReward = Math.min(30, game.dayCount);
    var rewardGold = 5 + dayReward * 2;
    f2.calendarClaimed.push(game.dayCount);
    game.gold += rewardGold;
    showNotification('Daily reward (Day ' + game.dayCount + '): +$' + rewardGold);
    if (game.dayCount % 7 === 0) {
      // Weekly bonus
      addXP(50);
      showNotification('Weekly bonus! +50 XP');
    }
  }

  // 179: Photo Mode — F12
  if (consumeKey('F12')) {
    f2.photoMode = !f2.photoMode;
    if (f2.photoMode) {
      f2.photoCamOffset = { x: 0, y: 0 };
      f2.photoFilter = 'none';
      showNotification('Photo Mode ON — Arrow keys: pan, 1-3: filter, Enter: capture, F12: exit');
    }
  }

  // 180: Collectible Cards — random drops
  if (Math.random() < 0.0001 && f2.cards.length < 50) {
    var setNames = ['Outlaws','Lawmen','Legends','Creatures','Landmarks','Weapons','Events','Towns','Heroes','Artifacts'];
    var setIdx = rand(0, 9);
    var cardNum = rand(1, 5);
    var cardId = setNames[setIdx] + '_' + cardNum;
    if (f2.cards.indexOf(cardId) === -1) {
      f2.cards.push(cardId);
      showNotification('Collectible card found: ' + setNames[setIdx] + ' #' + cardNum + '! (' + f2.cards.length + '/50)');
      // Check set completion
      var setCount = 0;
      for (var sci = 0; sci < f2.cards.length; sci++) {
        if (f2.cards[sci].indexOf(setNames[setIdx]) === 0) setCount++;
      }
      if (setCount >= 5 && !f2.cardSets[setNames[setIdx]]) {
        f2.cardSets[setNames[setIdx]] = true;
        showNotification('Card set complete: ' + setNames[setIdx] + '! Bonus $100 + special buff!');
        game.gold += 100;
        addXP(50);
      }
    }
  }

  // 181: Hat Collection — random drops or purchases
  if (Math.random() < 0.00005 && f2.hats.length < f2.hatList.length) {
    var hatIdx = rand(0, f2.hatList.length - 1);
    if (f2.hats.indexOf(hatIdx) === -1) {
      f2.hats.push(hatIdx);
      showNotification('Hat found: ' + f2.hatList[hatIdx].name + '! (' + f2.hatList[hatIdx].buff + ')');
    }
  }

  // 182: Title Collection — earned through play
  // Various titles awarded by actions throughout the code
  // Check kill-based titles
  if (typeof game.outlawsKilled !== 'undefined') {
    if (game.outlawsKilled >= 10 && f2.titles.indexOf('Gunfighter') === -1) f2.titles.push('Gunfighter');
    if (game.outlawsKilled >= 50 && f2.titles.indexOf('Sharpshooter') === -1) f2.titles.push('Sharpshooter');
    if (game.outlawsKilled >= 100 && f2.titles.indexOf('Legend') === -1) f2.titles.push('Legend');
  }
  if (game.reputation >= 90 && f2.titles.indexOf('Peacekeeper') === -1) f2.titles.push('Peacekeeper');
  if (game.gold >= 1000 && f2.titles.indexOf('Wealthy') === -1) f2.titles.push('Wealthy');
  if (game.level >= 25 && f2.titles.indexOf('Veteran') === -1) f2.titles.push('Veteran');

  // 187: Codex/Encyclopedia — toggle (Backquote key to avoid conflict with Journal)
  if (!blocked && consumeKey('Backquote')) {
    f2.codexOpen = !f2.codexOpen;
  }
  // Auto-populate codex
  for (var cdi = 0; cdi < game.npcs.length; cdi++) {
    var cdn = game.npcs[cdi];
    if (cdn.name && f2.codex.npcs.indexOf(cdn.name) === -1 && dist(p, cdn) < 60) {
      f2.codex.npcs.push(cdn.name);
    }
  }
  if (game.currentWeapon && f2.codex.weapons.indexOf(game.currentWeapon) === -1) {
    f2.codex.weapons.push(game.currentWeapon);
  }
  // Add wildlife to codex
  if (game._features && game._features.wildlife) {
    for (var cwi = 0; cwi < game._features.wildlife.length; cwi++) {
      var cw = game._features.wildlife[cwi];
      if (f2.codex.creatures.indexOf(cw.type) === -1 && dist(p, cw) < 80) {
        f2.codex.creatures.push(cw.type);
      }
    }
  }

  // 193: Lore Journal — entries added via exploration and props

  // 194: Easter Eggs
  // Konami code detection (via keyboard events)
  // Well UFO at midnight
  if (game.time > 0.95 || game.time < 0.05) {
    for (var ebi = 0; ebi < game.buildings.length; ebi++) {
      var eb = game.buildings[ebi];
      if (eb.type === 'well' && dist(p, eb) < 20) {
        if (f2.easterEggsFound.indexOf('well_ufo') === -1) {
          f2.easterEggsFound.push('well_ufo');
          showNotification('EASTER EGG: You see a strange light in the well... UFO!');
          addXP(100);
          game.gold += 50;
        }
      }
    }
  }
  // Church bell melody
  for (var chi = 0; chi < game.buildings.length; chi++) {
    var ch = game.buildings[chi];
    if (ch.type === 'church' && dist(p, ch) < 25) {
      if (!f2._bellCount) f2._bellCount = 0;
      if (consumeKey('KeyE')) {
        f2._bellCount++;
        if (f2._bellCount >= 3 && f2.easterEggsFound.indexOf('bell_melody') === -1) {
          f2.easterEggsFound.push('bell_melody');
          showNotification('EASTER EGG: The bells play a mysterious melody! +100 XP');
          addXP(100);
          f2._bellCount = 0;
        }
      }
    }
  }

  // 197: Game Completion % — calculated in _updateCompletion
}

// ════════════════════════════════════════════════════════════
// DAILY PROCESSING — runs once per new day
// ════════════════════════════════════════════════════════════
function _updateDailyProcessing(f2, p) {
  if (f2.lastDayProcessed === game.dayCount) return;
  f2.lastDayProcessed = game.dayCount;

  // 76: Property income
  var totalIncome = 0;
  for (var pi = 0; pi < f2.ownedPropertiesV2.length; pi++) {
    var prop = f2.ownedPropertiesV2[pi];
    var income = prop.income * (prop.level || 1);
    if (f2.economyCycle === 'boom') income = Math.round(income * 1.5);
    else if (f2.economyCycle === 'bust') income = Math.round(income * 0.7);
    totalIncome += income;
  }

  // 77: Saloon income
  if (f2.saloonOwned) {
    var saloonIncome = 20;
    if (f2.saloonPricing === 'cheap') saloonIncome = 15;
    else if (f2.saloonPricing === 'expensive') saloonIncome = 40;
    saloonIncome += f2.saloonStaff * 10;
    if (f2.economyCycle === 'boom') saloonIncome = Math.round(saloonIncome * 1.5);
    else if (f2.economyCycle === 'bust') saloonIncome = Math.round(saloonIncome * 0.7);
    totalIncome += saloonIncome;
  }

  // 78: Ranch income
  if (f2.ranchOwned && f2.cattle > 0) {
    if (f2.cattleFed) {
      var cattleIncome = f2.cattle * rand(30, 50);
      // Sell one cattle per day
      if (f2.cattle > 1 && Math.random() < 0.3) {
        totalIncome += cattleIncome;
        f2.cattle--;
      }
    }
    // Feed cost
    var feedCost = f2.cattle * 5;
    totalIncome -= feedCost;
    f2.cattleFed = game.gold >= feedCost;
  }

  // 79: Mining claim income
  if (f2.miningClaim) {
    f2.mineYield = rand(5, 30) + f2.pickLevel * 10;
    totalIncome += f2.mineYield;
    // Cave-in risk
    if (Math.random() < 0.05) {
      f2.miningClaim = false;
      showNotification('Mining cave-in! Your claim is lost!');
    }
  }

  // 80: General Store income
  if (f2.storeOwned) {
    var storeIncome = 25;
    if (f2.storeMarkup === 'low') { storeIncome = 15; }
    else if (f2.storeMarkup === 'high') { storeIncome = 45; game._features.npcMorale = Math.max(0, game._features.npcMorale - 2); }
    totalIncome += storeIncome;
  }

  // 83: Loan interest
  if (f2.loan > 0) {
    var interest = Math.ceil(f2.loan * 0.1);
    if (game.gold >= interest) {
      game.gold -= interest;
    } else {
      f2.loanPaymentsMissed++;
      if (f2.loanPaymentsMissed >= 3) {
        showNotification('Missed 3 loan payments! Bounty hunters are after you!');
        // Spawn hostile NPC
      }
    }
  }

  // 84: Insurance cost
  if (f2.insured) {
    game.gold -= 10;
  }

  // 85: Tax collection every 7 days
  if (game.dayCount % 7 === 0) {
    f2.taxDay = game.dayCount;
    if (f2.taxStyle === 'fair') {
      game.gold += 20;
      game.reputation = Math.min(REPUTATION_MAX, game.reputation + 2);
    } else {
      game.gold += 50;
      game.reputation = Math.max(0, game.reputation - 5);
    }
  }

  // 93: Bank vault interest
  if (f2.bankVaultGold > 0) {
    var vaultInterest = Math.ceil(f2.bankVaultGold * 0.02);
    f2.bankVaultGold += vaultInterest;
  }

  // 71: Rotating shop stock
  if (game.dayCount % 3 === 0) {
    f2.shopRotationDay = game.dayCount;
    var rareItems = ['Scope', 'Fine Armor', 'Golden Bullets', 'Health Kit', 'Mystery Box'];
    f2.shopRareItem = rareItems[rand(0, rareItems.length - 1)];
  }

  // 82: Stock market daily shift
  var stockKeys = ['railroad', 'mining', 'cattle'];
  for (var si = 0; si < stockKeys.length; si++) {
    var sk = stockKeys[si];
    var pctChange = randF(-0.15, 0.15);
    // Events affect stocks
    if (f2.economyCycle === 'boom') pctChange += 0.05;
    else if (f2.economyCycle === 'bust') pctChange -= 0.05;
    f2.stocks[sk].price = Math.max(5, Math.round(f2.stocks[sk].price * (1 + pctChange)));
  }

  // Apply total income
  if (totalIncome !== 0) {
    game.gold += totalIncome;
    f2.propertyIncome = totalIncome;
    f2.incomeHistory.push({ day: game.dayCount, amount: totalIncome });
    if (f2.incomeHistory.length > 30) f2.incomeHistory.shift();
    if (totalIncome > 0) showNotification('Daily income: +$' + totalIncome);
    else if (totalIncome < 0) showNotification('Daily expenses: -$' + Math.abs(totalIncome));
  }

  // 90: Supply & Demand — normalize prices slowly
  f2.priceMultipliers.ammo = lerp(f2.priceMultipliers.ammo, 1, 0.1);
  f2.priceMultipliers.food = lerp(f2.priceMultipliers.food, 1, 0.1);
  f2.priceMultipliers.weapons = lerp(f2.priceMultipliers.weapons, 1, 0.1);
  f2.priceMultipliers.supplies = lerp(f2.priceMultipliers.supplies, 1, 0.1);

  // 97: Debt Collection quests
  if (Math.random() < 0.15 && f2.debtQuests.length < 3) {
    var debtNames = ['Old Pete','Widow Johnson','Farmer Brown','Doc Holiday','Slim Jim'];
    f2.debtQuests.push({
      name: debtNames[rand(0, debtNames.length - 1)],
      amount: rand(20, 80),
      collected: false
    });
  }
}

// ════════════════════════════════════════════════════════════
// COMPLETION TRACKING (Feature 197)
// ════════════════════════════════════════════════════════════
function _updateCompletion(f2) {
  var total = 0, done = 0;
  // Landmarks
  total += 10; done += f2.landmarksFound.length;
  // Vistas
  total += 5; done += f2.vistasFound.length;
  // Lore
  total += 50; done += f2.loreEntries.length;
  // Cards
  total += 50; done += f2.cards.length;
  // Props
  total += 15; done += f2.propsFound.length;
  // Caves
  total += 3;
  for (var ci = 0; ci < f2.caves.length; ci++) { if (f2.caves[ci].discovered) done++; }
  // Skulls
  total += 5; done += f2.skullsFound;
  // Devil
  total += 1; if (f2.devilDefeated) done++;
  // Easter eggs
  total += 3; done += f2.easterEggsFound.length;
  // Tunnels
  total += 4; done += f2.tunnelDiscovered.length;
  // Capsules
  total += 3; done += f2.capsulesFound.length;
  // Oasis
  total += 3; done += f2.oasisFound.length;
  // Crime network
  total += 3; done += f2.networkBusted;
  // Serial criminals
  total += 5; done += Math.min(5, f2.serialCatchCount);
  // Prestige
  total += 10; done += f2.prestige;
  // Flashbacks
  total += 4; done += f2.flashbacksCompleted.length;
  // Hats
  total += 20; done += f2.hats.length;

  f2.completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
}

// ════════════════════════════════════════════════════════════
// PHOTO MODE UPDATE (Feature 179)
// ════════════════════════════════════════════════════════════
function _updatePhotoMode(dt) {
  var f2 = game._featuresV2;
  // Arrow keys pan camera
  if (keys['ArrowUp']) f2.photoCamOffset.y -= 3;
  if (keys['ArrowDown']) f2.photoCamOffset.y += 3;
  if (keys['ArrowLeft']) f2.photoCamOffset.x -= 3;
  if (keys['ArrowRight']) f2.photoCamOffset.x += 3;
  // 1-3 for filters
  if (consumeKey('Digit1')) { f2.photoFilter = 'none'; showNotification('Filter: Normal'); }
  if (consumeKey('Digit2')) { f2.photoFilter = 'sepia'; showNotification('Filter: Sepia'); }
  if (consumeKey('Digit3')) { f2.photoFilter = 'noir'; showNotification('Filter: Noir'); }
  // Enter to capture
  if (consumeKey('Enter')) {
    // Download canvas as PNG
    try {
      var link = document.createElement('a');
      link.download = 'sheriff_photo_' + Date.now() + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showNotification('Photo captured!');
    } catch (e) {
      showNotification('Photo capture failed');
    }
  }
  // F12 to exit
  if (consumeKey('F12') || consumeKey('Escape')) {
    f2.photoMode = false;
    f2.photoCamOffset = { x: 0, y: 0 };
    showNotification('Photo Mode OFF');
  }
}

// ════════════════════════════════════════════════════════════
// WEAPON WHEEL UPDATE (Feature 49)
// ════════════════════════════════════════════════════════════
function _updateWeaponWheel(dt) {
  var f2 = game._featuresV2;
  // Select weapon with number keys while wheel is open
  if (consumeKey('Digit1')) { game.currentWeapon = 'revolver'; showNotification('Weapon: Revolver'); }
  if (consumeKey('Digit2') && game.hasShotgun) { game.currentWeapon = 'shotgun'; showNotification('Weapon: Shotgun'); }
  if (consumeKey('Digit3') && game.hasRifle) { game.currentWeapon = 'rifle'; showNotification('Weapon: Rifle'); }
  if (consumeKey('Digit4') && f2.arrows > 0) { showNotification('Bow ready (B to use)'); }
  if (consumeKey('Digit5') && f2.bossWeapons.length > 0) {
    showNotification('Boss weapon: ' + f2.bossWeapons[0].name);
  }
}

// ============================================================
// RENDER FEATURES V2 OVERLAY
// ============================================================
function renderFeaturesV2Overlay() {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  var p = game.player;
  var w = canvas.width, h = canvas.height;
  var camX = game.camera ? game.camera.x : 0;
  var camY = game.camera ? game.camera.y : 0;

  // ── Photo Mode offset ──
  if (f2.photoMode) {
    camX -= f2.photoCamOffset.x;
    camY -= f2.photoCamOffset.y;
  }

  // ── Seasonal tint ──
  _renderSeasonalOverlay(f2, w, h);

  // ── Weather events ──
  _renderWeatherEvent(f2, w, h);

  // ── Bullet Time vignette ──
  if (f2.bulletTimeActive) {
    ctx.fillStyle = 'rgba(180, 0, 0, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BULLET TIME', w / 2, 30);
    ctx.fillText(f2.bulletTimeTimer.toFixed(1) + 's', w / 2, 48);
    ctx.textAlign = 'left';
  }

  // ── Last Stand effect ──
  if (f2.lastStandActive) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    // Red edges
    var grad = ctx.createRadialGradient(w/2, h/2, w*0.3, w/2, h/2, w*0.6);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(200,0,0,0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff2222';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LAST STAND!', w / 2, 65);
    ctx.textAlign = 'left';
  }

  // ── World objects (relative to camera) ──
  _renderWorldObjectsV2(f2, p, camX, camY, w, h);

  // ── Cover indicator ──
  if (f2.inCover) {
    ctx.fillStyle = 'rgba(0, 100, 200, 0.3)';
    ctx.fillRect(0, h - 30, w, 30);
    ctx.fillStyle = '#88ccff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('IN COVER (-50% damage)', w / 2, h - 12);
    ctx.textAlign = 'left';
  }

  // ── Bow charge bar ──
  if (f2.bowCharging) {
    var bcX = w / 2 - 40;
    var bcY = h - 60;
    ctx.fillStyle = '#333';
    ctx.fillRect(bcX, bcY, 80, 10);
    var chargePct = Math.min(1, f2.bowChargeTime / 2);
    ctx.fillStyle = chargePct >= 0.25 ? '#44ff44' : '#ff4444';
    ctx.fillRect(bcX, bcY, 80 * chargePct, 10);
    ctx.strokeStyle = '#888';
    ctx.strokeRect(bcX, bcY, 80, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHARGE', w / 2, bcY - 2);
    ctx.textAlign = 'left';
  }

  // ── Dual Pistols indicator ──
  if (f2.dualPistols) {
    ctx.fillStyle = '#ffaa00';
    ctx.font = '10px monospace';
    ctx.fillText('DUAL PISTOLS', 10, h - 80);
  }

  // ── Rooftop indicator ──
  if (f2.onRooftop) {
    ctx.fillStyle = 'rgba(100, 150, 255, 0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#88aaff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROOFTOP VIEW (' + f2.rooftopTimer.toFixed(0) + 's)', w / 2, 20);
    ctx.textAlign = 'left';
  }

  // ── Undercover indicator ──
  if (f2.undercover) {
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px monospace';
    ctx.fillText('UNDERCOVER (' + f2.undercoverTimer.toFixed(0) + 's)', 10, h - 95);
  }

  // ── Quicksand ──
  if (f2.inQuicksand) {
    ctx.fillStyle = 'rgba(139, 119, 42, 0.4)';
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QUICKSAND! TAP SPACE!', w / 2, h / 2);
    ctx.fillText(f2.quicksandTimer.toFixed(1) + 's', w / 2, h / 2 + 20);
    ctx.textAlign = 'left';
  }

  // ── Campfire Story ──
  if (f2.storyActive) {
    ctx.fillStyle = 'rgba(20, 10, 5, 0.85)';
    ctx.fillRect(w / 2 - 180, h / 2 - 50, 360, 100);
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 180, h / 2 - 50, 360, 100);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPFIRE STORY', w / 2, h / 2 - 35);
    ctx.fillStyle = '#ccaa88';
    ctx.font = '9px monospace';
    // Word wrap story text
    var words = f2.storyText.split(' ');
    var line = '', lineY = h / 2 - 15;
    for (var swi = 0; swi < words.length; swi++) {
      var testLine = line + words[swi] + ' ';
      if (testLine.length > 45) {
        ctx.fillText(line, w / 2, lineY);
        line = words[swi] + ' ';
        lineY += 14;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, w / 2, lineY);
    ctx.textAlign = 'left';
  }

  // ── Peaceful Moment ──
  if (f2.peacefulMoment) {
    ctx.fillStyle = 'rgba(255, 200, 100, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffcc88';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Peaceful Moment (+10% rep gain)', w / 2, h - 5);
    ctx.textAlign = 'left';
  }

  // ── Meteor Shower ──
  if (f2.meteorShowerActive || f2.meteorParticles.length > 0) {
    ctx.fillStyle = '#ffffff';
    for (var mi = 0; mi < f2.meteorParticles.length; mi++) {
      var mp = f2.meteorParticles[mi];
      ctx.globalAlpha = mp.life / 40;
      ctx.fillRect(mp.x, mp.y, mp.size, mp.size * 3);
    }
    ctx.globalAlpha = 1;
  }

  // ── Ghost sightings ──
  for (var gsi = 0; gsi < f2.ghostSightings.length; gsi++) {
    var gs = f2.ghostSightings[gsi];
    var gx = gs.x - camX, gy = gs.y - camY;
    if (gx < -30 || gx > w + 30 || gy < -30 || gy > h + 30) continue;
    ctx.globalAlpha = Math.max(0, gs.alpha);
    ctx.fillStyle = '#aaccff';
    ctx.beginPath();
    ctx.arc(gx, gy - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(gx - 5, gy + 3, 10, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GHOST', gx, gy - 18);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // ── Cave overlay ──
  if (f2.caveActive) {
    _renderCaveOverlay(f2, w, h);
    return; // cave is full-screen
  }

  // ── Crafting menu ──
  if (f2.craftingOpen) {
    _renderCraftingMenu(f2, w, h);
  }

  // ── Weapon Wheel ──
  if (f2.weaponWheelOpen) {
    _renderWeaponWheel(f2, w, h);
  }

  // ── Codex ──
  if (f2.codexOpen) {
    _renderCodex(f2, w, h);
  }

  // ── Perk Roulette ──
  if (f2.perkRouletteActive) {
    _renderPerkRoulette(f2, w, h);
  }

  // ── Combat Rating ──
  if (f2.lastCombatRating && f2.combatRatingTimer > -3) {
    _renderCombatRating(f2, w, h);
  }

  // ── Devil Fight ──
  if (f2.devilFightActive) {
    _renderDevilFight(f2, w, h);
  }

  // ── Photo Mode UI ──
  if (f2.photoMode) {
    _renderPhotoMode(f2, w, h);
  }

  // ── Meeting overlay ──
  if (f2.meetingActive) {
    _renderMeeting(f2, w, h);
  }

  // ── Faction/Status HUD ──
  _renderStatusHUD(f2, w, h);

  // ── NPC mood indicators ──
  _renderNPCMoods(f2, camX, camY, w, h);

  // ── Patrol waypoints ──
  if (f2.patrolActive) {
    _renderPatrolWaypoints(f2, camX, camY, w, h);
  }

  // ── Serial Criminal indicator ──
  if (f2.serialCriminal && f2.serialCriminal.state !== 'dead') {
    _renderSerialCriminal(f2, camX, camY, w, h);
  }

  // ── Auction overlay ──
  if (f2.auctionActive) {
    _renderAuction(f2, w, h);
  }

  // ── Class info ──
  if (f2.playerClass) {
    ctx.fillStyle = '#ccaa44';
    ctx.font = '9px monospace';
    ctx.fillText(f2.playerClass.toUpperCase() + (f2.prestige > 0 ? ' P' + f2.prestige : ''), 10, h - 110);
  }

  // ── Companion ──
  if (f2.companion) {
    _renderCompanion(f2, camX, camY);
  }

  // ── Hired Guns ──
  _renderHiredGuns(f2, camX, camY, w, h);

  // ── Posse ──
  if (f2.posseActive) {
    _renderPosse(f2, camX, camY, w, h);
  }

  // ── Turrets ──
  _renderTurrets(f2, camX, camY, w, h);

  // ── Bear Traps ──
  _renderBearTraps(f2, camX, camY, w, h);

  // ── Tomahawk ──
  if (f2.tomahawkActive) {
    _renderTomahawk(f2, camX, camY);
  }

  // ── Thrown Stars ──
  _renderThrownStars(f2, camX, camY, w, h);

  // ── Bow Arrows in flight ──
  _renderBowArrows(f2, camX, camY, w, h);

  // ── Cannon projectiles ──
  _renderCannonProjectiles(f2, camX, camY, w, h);

  // ── Fire patches ──
  _renderFirePatches(f2, camX, camY, w, h);

  // ── Memorials ──
  if (f2.memorials && f2.memorials.length > 0) {
    _renderMemorials(f2, camX, camY, w, h);
  }

  // ── Completion % in corner ──
  ctx.fillStyle = '#888';
  ctx.font = '8px monospace';
  ctx.fillText(f2.completionPct + '% Complete', w - 85, h - 5);
}

// ── Render: Seasonal Overlay ──
function _renderSeasonalOverlay(f2, w, h) {
  if (f2.season === 'winter') {
    ctx.fillStyle = 'rgba(200, 220, 255, 0.06)';
    ctx.fillRect(0, 0, w, h);
    // Snowflakes
    if (Math.random() < 0.3) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.6;
      for (var si = 0; si < 5; si++) {
        ctx.fillRect(rand(0, w), rand(0, h), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  } else if (f2.season === 'autumn') {
    ctx.fillStyle = 'rgba(180, 100, 30, 0.04)';
    ctx.fillRect(0, 0, w, h);
  } else if (f2.season === 'summer') {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.03)';
    ctx.fillRect(0, 0, w, h);
  }
  // Season indicator
  ctx.fillStyle = '#aa8866';
  ctx.font = '8px monospace';
  ctx.fillText(f2.season.charAt(0).toUpperCase() + f2.season.slice(1), 10, 12);
}

// ── Render: Weather Event ──
function _renderWeatherEvent(f2, w, h) {
  if (!f2.weatherEvent) return;
  if (f2.weatherEvent === 'tornado') {
    ctx.fillStyle = 'rgba(80, 80, 60, 0.2)';
    ctx.fillRect(0, 0, w, h);
    // Funnel visual
    var tx = w / 2 + Math.sin(Date.now() * 0.003) * 100;
    ctx.fillStyle = 'rgba(100, 90, 70, 0.5)';
    ctx.beginPath();
    ctx.moveTo(tx - 30, 0);
    ctx.lineTo(tx + 30, 0);
    ctx.lineTo(tx + 8, h);
    ctx.lineTo(tx - 8, h);
    ctx.fill();
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TORNADO! TAKE COVER!', w / 2, 30);
    ctx.textAlign = 'left';
  } else if (f2.weatherEvent === 'heatwave') {
    // Heat shimmer
    ctx.fillStyle = 'rgba(255, 150, 50, 0.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff8844';
    ctx.font = '10px monospace';
    ctx.fillText('HEAT WAVE', 10, 25);
  } else if (f2.weatherEvent === 'blizzard') {
    ctx.fillStyle = 'rgba(200, 220, 255, 0.15)';
    ctx.fillRect(0, 0, w, h);
    for (var bi = 0; bi < 15; bi++) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3));
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#88ccff';
    ctx.font = '10px monospace';
    ctx.fillText('BLIZZARD', 10, 25);
  } else if (f2.weatherEvent === 'flood') {
    ctx.fillStyle = 'rgba(30, 80, 150, 0.1)';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.fillStyle = '#4488cc';
    ctx.font = '10px monospace';
    ctx.fillText('FLASH FLOOD', 10, 25);
  }
}

// ── Render: World Objects (camera-relative) ──
function _renderWorldObjectsV2(f2, p, camX, camY, w, h) {
  // Landmarks
  for (var li = 0; li < f2.landmarkLocations.length; li++) {
    var lm = f2.landmarkLocations[li];
    var lx = lm.x - camX, ly = lm.y - camY;
    if (lx < -30 || lx > w + 30 || ly < -30 || ly > h + 30) continue;
    if (lm.found) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(lx, ly - 12);
      ctx.lineTo(lx - 6, ly + 4);
      ctx.lineTo(lx + 6, ly + 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffee88';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lm.name, lx, ly - 15);
      ctx.textAlign = 'left';
    } else {
      // Subtle shimmer for undiscovered
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Oasis points
  for (var oi = 0; oi < f2.oasisLocations.length; oi++) {
    var oa = f2.oasisLocations[oi];
    var ox = oa.x - camX, oy = oa.y - camY;
    if (ox < -30 || ox > w + 30 || oy < -30 || oy > h + 30) continue;
    if (!oa.used) {
      ctx.fillStyle = '#2288aa';
      ctx.beginPath();
      ctx.arc(ox, oy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(ox - 10, oy - 3, 3, 6);
      ctx.fillRect(ox + 7, oy - 4, 3, 7);
    }
  }

  // Quicksand
  for (var qi = 0; qi < f2.quicksandLocations.length; qi++) {
    var qs = f2.quicksandLocations[qi];
    var qx = qs.x - camX, qy = qs.y - camY;
    if (qx < -30 || qx > w + 30 || qy < -30 || qy > h + 30) continue;
    ctx.fillStyle = 'rgba(180, 150, 80, 0.4)';
    ctx.beginPath();
    ctx.arc(qx, qy, 12, 0, Math.PI * 2);
    ctx.fill();
    var ripple = Math.sin(Date.now() * 0.005) * 3;
    ctx.strokeStyle = 'rgba(150, 120, 60, 0.3)';
    ctx.beginPath();
    ctx.arc(qx, qy, 8 + ripple, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Props
  for (var pi = 0; pi < f2.propLocations.length; pi++) {
    var pp = f2.propLocations[pi];
    if (pp.found) continue;
    var px = pp.x - camX, py = pp.y - camY;
    if (px < -30 || px > w + 30 || py < -30 || py > h + 30) continue;
    ctx.fillStyle = '#8a7a5a';
    ctx.fillRect(px - 4, py - 4, 8, 8);
    ctx.fillStyle = '#aa9a7a';
    ctx.fillRect(px - 3, py - 3, 6, 6);
    // Sparkle
    if (Math.random() < 0.05) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(px + rand(-5, 5), py + rand(-5, 5), 1, 1);
    }
  }

  // Tunnel entrances
  for (var ti = 0; ti < f2.tunnelLocations.length; ti++) {
    var tl = f2.tunnelLocations[ti];
    if (f2.tunnelDiscovered.indexOf(ti) === -1) continue;
    // Entry 1
    var t1x = tl.x1 - camX, t1y = tl.y1 - camY;
    if (t1x > -30 && t1x < w + 30 && t1y > -30 && t1y < h + 30) {
      ctx.fillStyle = '#2a1a0a';
      ctx.beginPath();
      ctx.arc(t1x, t1y, 8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#5a4a3a';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TUNNEL', t1x, t1y - 10);
      ctx.textAlign = 'left';
    }
    // Entry 2
    var t2x = tl.x2 - camX, t2y = tl.y2 - camY;
    if (t2x > -30 && t2x < w + 30 && t2y > -30 && t2y < h + 30) {
      ctx.fillStyle = '#2a1a0a';
      ctx.beginPath();
      ctx.arc(t2x, t2y, 8, 0, Math.PI);
      ctx.fill();
    }
  }

  // Cave entrances
  for (var ci = 0; ci < f2.caves.length; ci++) {
    var cave = f2.caves[ci];
    var cx = cave.x - camX, cy = cave.y - camY;
    if (cx < -30 || cx > w + 30 || cy < -30 || cy > h + 30) continue;
    ctx.fillStyle = cave.discovered ? '#3a2a1a' : '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 7, Math.PI, 0);
    ctx.fill();
    if (cave.discovered) {
      ctx.fillStyle = '#aa8844';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CAVE', cx, cy - 10);
      ctx.textAlign = 'left';
    }
  }

  // Skull locations
  for (var ski = 0; ski < f2.skullLocations.length; ski++) {
    var sk = f2.skullLocations[ski];
    if (sk.found) continue;
    var skx = sk.x - camX, sky = sk.y - camY;
    if (skx < -30 || skx > w + 30 || sky < -30 || sky > h + 30) continue;
    ctx.fillStyle = '#ddddcc';
    ctx.beginPath();
    ctx.arc(skx, sky - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(skx - 2, sky - 4, 1, 1);
    ctx.fillRect(skx + 1, sky - 4, 1, 1);
    // Glow
    ctx.fillStyle = 'rgba(255, 0, 0, ' + (0.2 + Math.sin(Date.now() * 0.005) * 0.1) + ')';
    ctx.beginPath();
    ctx.arc(skx, sky - 3, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Time capsules
  for (var tci = 0; tci < f2.capsuleLocations.length; tci++) {
    var tc = f2.capsuleLocations[tci];
    if (tc.found) continue;
    var tcx = tc.x - camX, tcy = tc.y - camY;
    if (tcx < -30 || tcx > w + 30 || tcy < -30 || tcy > h + 30) continue;
    ctx.fillStyle = '#886622';
    ctx.fillRect(tcx - 5, tcy - 3, 10, 6);
    ctx.fillStyle = '#aa8833';
    ctx.fillRect(tcx - 4, tcy - 2, 8, 4);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(tcx - 1, tcy - 1, 2, 2);
  }

  // Vista points
  for (var vi = 0; vi < f2.vistaLocations.length; vi++) {
    if (f2.vistasFound.indexOf(vi) !== -1) continue;
    var vp = f2.vistaLocations[vi];
    var vx = vp.x - camX, vy = vp.y - camY;
    if (vx < -30 || vx > w + 30 || vy < -30 || vy > h + 30) continue;
    ctx.fillStyle = 'rgba(255, 255, 100, ' + (0.3 + Math.sin(Date.now() * 0.004) * 0.2) + ')';
    ctx.beginPath();
    ctx.moveTo(vx, vy - 10);
    ctx.lineTo(vx - 5, vy);
    ctx.lineTo(vx + 5, vy);
    ctx.closePath();
    ctx.fill();
  }

  // Crime network nodes
  for (var cni = 0; cni < f2.crimeNetwork.length; cni++) {
    var cn = f2.crimeNetwork[cni];
    if (cn.busted) continue;
    var cnx = cn.x - camX, cny = cn.y - camY;
    if (cnx < -30 || cnx > w + 30 || cny < -30 || cny > h + 30) continue;
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.arc(cnx, cny, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4444';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cn.name, cnx, cny - 10);
    ctx.textAlign = 'left';
  }
}

// ── Render: Cave Overlay ──
function _renderCaveOverlay(f2, w, h) {
  ctx.fillStyle = '#0a0804';
  ctx.fillRect(0, 0, w, h);
  var mOffX = (w - 300) / 2, mOffY = (h - 200) / 2;
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(mOffX, mOffY, 300, 200);
  ctx.strokeStyle = '#4a3218';
  ctx.lineWidth = 2;
  ctx.strokeRect(mOffX, mOffY, 300, 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HIDDEN CAVE - Room ' + (f2.caveRoom + 1) + '/3', w / 2, mOffY - 10);

  // Loot
  for (var li = 0; li < f2.caveLoot.length; li++) {
    var cl = f2.caveLoot[li];
    if (cl.collected) continue;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(mOffX + cl.x, mOffY + cl.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8c0';
    ctx.fillRect(mOffX + cl.x - 1, mOffY + cl.y - 1, 2, 2);
  }

  // Enemies
  for (var ei = 0; ei < f2.caveEnemies.length; ei++) {
    var ce = f2.caveEnemies[ei];
    if (ce.hp <= 0) continue;
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(mOffX + ce.x - 5, mOffY + ce.y - 6, 10, 12);
    ctx.fillStyle = '#881111';
    ctx.fillRect(mOffX + ce.x - 6, mOffY + ce.y - 10, 12, 4);
    // HP bar
    ctx.fillStyle = '#440000';
    ctx.fillRect(mOffX + ce.x - 8, mOffY + ce.y - 14, 16, 3);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(mOffX + ce.x - 8, mOffY + ce.y - 14, (ce.hp / 3) * 16, 3);
  }

  // Player
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(mOffX + f2.cavePlayerX - 4, mOffY + f2.cavePlayerY - 6, 8, 12);
  ctx.fillStyle = PALETTE ? PALETTE.skin : '#dda577';
  ctx.beginPath();
  ctx.arc(mOffX + f2.cavePlayerX, mOffY + f2.cavePlayerY - 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Instructions
  ctx.fillStyle = '#a09070';
  ctx.font = '9px monospace';
  ctx.fillText('WASD: Move | SPACE: Attack | ESC: Exit | Right edge: Next room', w / 2, mOffY + 218);
  ctx.textAlign = 'left';
}

// ── Render: Crafting Menu ──
function _renderCraftingMenu(f2, w, h) {
  var mx = w / 2 - 150, my = h / 2 - 100;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
  ctx.fillRect(mx, my, 300, 200);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 300, 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRAFTING (K to close)', w / 2, my + 20);

  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  for (var ri = 0; ri < f2.craftingRecipes.length; ri++) {
    var r = f2.craftingRecipes[ri];
    var needs = r.needs.join(' + ');
    var canCraft = true;
    for (var ni = 0; ni < r.needs.length; ni++) {
      if (!f2.craftingInventory[r.needs[ni]] || f2.craftingInventory[r.needs[ni]] <= 0) canCraft = false;
    }
    ctx.fillStyle = canCraft ? '#88ff88' : '#888888';
    ctx.fillText((ri + 1) + '. ' + r.name + ' (' + needs + ')', mx + 15, my + 45 + ri * 22);
  }

  // Inventory
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Inventory:', mx + 15, my + 165);
  var invStr = '';
  var invKeys = Object.keys(f2.craftingInventory);
  for (var ii = 0; ii < invKeys.length; ii++) {
    if (f2.craftingInventory[invKeys[ii]] > 0) {
      invStr += invKeys[ii] + ':' + f2.craftingInventory[invKeys[ii]] + '  ';
    }
  }
  ctx.fillStyle = '#cccccc';
  ctx.fillText(invStr || 'Empty', mx + 15, my + 180);
}

// ── Render: Weapon Wheel ──
function _renderWeaponWheel(f2, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, w, h);

  var cx = w / 2, cy = h / 2, radius = 70;
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  var weapons = ['Revolver', 'Shotgun', 'Rifle', 'Bow', 'Boss Wpn'];
  var available = [true, !!game.hasShotgun, !!game.hasRifle, f2.arrows > 0, f2.bossWeapons.length > 0];
  var colors = ['#ffaa00', '#ff6600', '#4488ff', '#44ff44', '#ff44ff'];
  for (var wi = 0; wi < weapons.length; wi++) {
    var angle = (wi / weapons.length) * Math.PI * 2 - Math.PI / 2;
    var wx = cx + Math.cos(angle) * radius;
    var wy = cy + Math.sin(angle) * radius;
    ctx.fillStyle = available[wi] ? colors[wi] : '#555555';
    ctx.beginPath();
    ctx.arc(wx, wy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = available[wi] ? '#ffffff' : '#888888';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(weapons[wi], wx, wy + 3);
    ctx.fillText('[' + (wi + 1) + ']', wx, wy + 13);
  }
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('WEAPON WHEEL', cx, cy - radius - 15);
  ctx.fillText('Hold TAB, press 1-5', cx, cy + radius + 20);
  ctx.textAlign = 'left';
}

// ── Render: Codex/Encyclopedia ──
function _renderCodex(f2, w, h) {
  var mx = 30, my = 30, mw = w - 60, mh = h - 60;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, mw, mh);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CODEX / ENCYCLOPEDIA (J to close)', w / 2, my + 22);

  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  var ly = my + 45;

  // NPCs
  ctx.fillStyle = '#88ccff';
  ctx.fillText('NPCs Discovered: ' + f2.codex.npcs.length, mx + 15, ly);
  ly += 14;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText(f2.codex.npcs.slice(0, 15).join(', '), mx + 25, ly);
  ly += 18;

  // Weapons
  ctx.fillStyle = '#ff8844';
  ctx.font = '10px monospace';
  ctx.fillText('Weapons: ' + f2.codex.weapons.length, mx + 15, ly);
  ly += 14;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText(f2.codex.weapons.join(', '), mx + 25, ly);
  ly += 18;

  // Locations
  ctx.fillStyle = '#44ff88';
  ctx.font = '10px monospace';
  ctx.fillText('Locations: ' + f2.codex.locations.length, mx + 15, ly);
  ly += 14;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText(f2.codex.locations.slice(0, 10).join(', '), mx + 25, ly);
  ly += 18;

  // Creatures
  ctx.fillStyle = '#ffaa44';
  ctx.font = '10px monospace';
  ctx.fillText('Creatures: ' + f2.codex.creatures.length, mx + 15, ly);
  ly += 14;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText(f2.codex.creatures.join(', '), mx + 25, ly);
  ly += 25;

  // Lore
  ctx.fillStyle = '#ccaa88';
  ctx.font = '10px monospace';
  ctx.fillText('Lore Entries: ' + f2.loreEntries.length + '/50', mx + 15, ly);
  ly += 14;
  ctx.font = '8px monospace';
  for (var lei = 0; lei < Math.min(5, f2.loreEntries.length); lei++) {
    ctx.fillStyle = '#998877';
    ctx.fillText('- ' + f2.loreEntries[lei].substring(0, 60) + '...', mx + 25, ly);
    ly += 12;
  }
  ly += 10;

  // Cards
  ctx.fillStyle = '#ff88ff';
  ctx.font = '10px monospace';
  ctx.fillText('Cards: ' + f2.cards.length + '/50', mx + 15, ly);
  ly += 14;
  var completedSets = Object.keys(f2.cardSets).length;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText('Complete Sets: ' + completedSets + '/10', mx + 25, ly);
  ly += 18;

  // Hats
  ctx.fillStyle = '#ffcc44';
  ctx.font = '10px monospace';
  ctx.fillText('Hats: ' + f2.hats.length + '/20', mx + 15, ly);
  ly += 14;
  // Titles
  ctx.fillStyle = '#88ff88';
  ctx.fillText('Titles: ' + f2.titles.length, mx + 15, ly);
  ly += 14;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.fillText(f2.titles.join(', '), mx + 25, ly);
  ly += 18;

  // Stats
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('Completion: ' + f2.completionPct + '%', mx + 15, ly);
  ly += 14;
  ctx.fillText('Prestige: ' + f2.prestige + '/10', mx + 15, ly);
  ly += 14;
  ctx.fillText('Class: ' + (f2.playerClass || 'None'), mx + 15, ly);
  ly += 14;
  ctx.fillText('Bounty Rank: ' + f2.bountyRankNames[f2.bountyRank], mx + 15, ly);
  ly += 14;
  ctx.fillText('Achievement Points: ' + f2.achievementPoints, mx + 15, ly);
}

// ── Render: Perk Roulette ──
function _renderPerkRoulette(f2, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, w, h);

  var cx = w / 2, cy = h / 2;
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERK ROULETTE!', cx, cy - 80);

  var perks = f2.availablePerks;
  var angleStep = (Math.PI * 2) / perks.length;
  var selectedIdx = Math.floor((f2.perkRouletteAngle * 10) % perks.length);

  for (var pi = 0; pi < perks.length; pi++) {
    var angle = pi * angleStep + f2.perkRouletteAngle;
    var px = cx + Math.cos(angle) * 60;
    var py = cy + Math.sin(angle) * 40;
    ctx.fillStyle = pi === selectedIdx ? '#ffd700' : '#888888';
    ctx.font = pi === selectedIdx ? 'bold 11px monospace' : '9px monospace';
    ctx.fillText(perks[pi].name, px, py);
  }

  // Arrow
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50);
  ctx.lineTo(cx - 5, cy - 58);
  ctx.lineTo(cx + 5, cy - 58);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('Press SPACE to select!', cx, cy + 70);
  ctx.textAlign = 'left';
}

// ── Render: Combat Rating ──
function _renderCombatRating(f2, w, h) {
  if (!f2.lastCombatRating) return;
  var colors = { S: '#ffd700', A: '#44ff44', B: '#88ccff', C: '#ffffff', D: '#ff8844', F: '#ff4444' };
  ctx.fillStyle = colors[f2.lastCombatRating] || '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RANK: ' + f2.lastCombatRating, w / 2, 100);
  ctx.textAlign = 'left';
}

// ── Render: Devil Fight ──
function _renderDevilFight(f2, w, h) {
  // Red tint
  ctx.fillStyle = 'rgba(100, 0, 0, 0.2)';
  ctx.fillRect(0, 0, w, h);

  // Devil HP bar
  var barW = 200, barH = 12;
  var barX = (w - barW) / 2, barY = 40;
  ctx.fillStyle = '#440000';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#ff0000';
  var hpPct = Math.max(0, f2.devilHP / 50);
  ctx.fillRect(barX, barY, barW * hpPct, barH);
  ctx.strokeStyle = '#880000';
  ctx.strokeRect(barX, barY, barW, barH);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THE DEVIL', w / 2, barY - 5);
  ctx.fillText('HP: ' + f2.devilHP + '/50', w / 2, barY + barH + 15);

  // Devil visual (center screen)
  ctx.fillStyle = '#aa0000';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 40, 20, 0, Math.PI * 2);
  ctx.fill();
  // Horns
  ctx.fillStyle = '#660000';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 15, h / 2 - 55);
  ctx.lineTo(w / 2 - 10, h / 2 - 70);
  ctx.lineTo(w / 2 - 5, h / 2 - 55);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w / 2 + 5, h / 2 - 55);
  ctx.lineTo(w / 2 + 10, h / 2 - 70);
  ctx.lineTo(w / 2 + 15, h / 2 - 55);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(w / 2 - 8, h / 2 - 44, 4, 3);
  ctx.fillRect(w / 2 + 4, h / 2 - 44, 4, 3);
  // Body
  ctx.fillStyle = '#880000';
  ctx.fillRect(w / 2 - 12, h / 2 - 20, 24, 30);

  ctx.textAlign = 'left';
}

// ── Render: Photo Mode UI ──
function _renderPhotoMode(f2, w, h) {
  // Apply filter
  if (f2.photoFilter === 'sepia') {
    ctx.fillStyle = 'rgba(112, 66, 20, 0.2)';
    ctx.fillRect(0, 0, w, h);
  } else if (f2.photoFilter === 'noir') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);
  }

  // UI frame
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, w, 25);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('PHOTO MODE | Arrows: Pan | 1: Normal | 2: Sepia | 3: Noir | Enter: Capture | F12: Exit', 10, 16);
  ctx.fillText('Filter: ' + f2.photoFilter, w - 120, 16);
}

// ── Render: Town Meeting ──
function _renderMeeting(f2, w, h) {
  ctx.fillStyle = 'rgba(10, 10, 30, 0.85)';
  ctx.fillRect(w / 2 - 160, h / 2 - 50, 320, 100);
  ctx.strokeStyle = '#8888aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 160, h / 2 - 50, 320, 100);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TOWN MEETING', w / 2, h / 2 - 32);
  ctx.fillStyle = '#cccccc';
  ctx.font = '10px monospace';
  ctx.fillText('Issue: ' + f2.meetingIssue, w / 2, h / 2 - 10);
  ctx.fillStyle = '#88ff88';
  ctx.fillText('Y = Vote YES    N = Vote NO', w / 2, h / 2 + 15);
  ctx.textAlign = 'left';
}

// ── Render: Status HUD ──
function _renderStatusHUD(f2, w, h) {
  var hx = w - 130, hy = 10;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(hx - 5, hy - 2, 125, 75);
  ctx.font = '8px monospace';

  // Factions
  var factionNames = ['Town', 'Ranch', 'Merch', 'Church'];
  var factionKeys = ['townsfolk', 'ranchers', 'merchants', 'church'];
  for (var fi = 0; fi < 4; fi++) {
    var fv = f2.factions[factionKeys[fi]];
    ctx.fillStyle = fv > 70 ? '#44ff44' : (fv > 30 ? '#ffff44' : '#ff4444');
    ctx.fillText(factionNames[fi] + ': ' + fv, hx, hy + 10 + fi * 11);
  }

  // Economy cycle
  ctx.fillStyle = f2.economyCycle === 'boom' ? '#44ff44' : (f2.economyCycle === 'bust' ? '#ff4444' : '#aaaaaa');
  ctx.fillText('Economy: ' + f2.economyCycle, hx, hy + 56);

  // Arrows/stars count
  if (f2.arrows > 0) {
    ctx.fillStyle = '#88ccff';
    ctx.fillText('Arrows: ' + f2.arrows, hx, hy + 67);
  }
}

// ── Render: NPC Mood indicators ──
function _renderNPCMoods(f2, camX, camY, w, h) {
  var moodIcons = { happy: '+', neutral: '=', sad: '-', angry: '!' };
  var moodColors = { happy: '#44ff44', neutral: '#ffff44', sad: '#8888ff', angry: '#ff4444' };
  for (var ni = 0; ni < game.npcs.length; ni++) {
    var npc = game.npcs[ni];
    if (npc.state === 'dead') continue;
    if (!npc._id) npc._id = 'npc_' + ni;
    var mood = f2.npcMoods[npc._id];
    if (!mood) continue;
    var nx = npc.x - camX, ny = npc.y - camY;
    if (nx < -20 || nx > w + 20 || ny < -20 || ny > h + 20) continue;
    ctx.fillStyle = moodColors[mood] || '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(moodIcons[mood] || '?', nx, ny - 20);
    // Friendship bar
    var fr = f2.friendships[npc._id] || 0;
    if (fr > 0) {
      ctx.fillStyle = '#333';
      ctx.fillRect(nx - 10, ny - 25, 20, 2);
      ctx.fillStyle = fr > 70 ? '#44ff44' : (fr > 30 ? '#ffff44' : '#ff4444');
      ctx.fillRect(nx - 10, ny - 25, (fr / 100) * 20, 2);
    }
    ctx.textAlign = 'left';
  }
}

// ── Render: Patrol Waypoints ──
function _renderPatrolWaypoints(f2, camX, camY, w, h) {
  for (var pi = 0; pi < f2.patrolPoints.length; pi++) {
    var pp = f2.patrolPoints[pi];
    var px = pp.x - camX, py = pp.y - camY;
    if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
    var isNext = pi === (f2.patrolIndex % f2.patrolPoints.length);
    ctx.fillStyle = isNext ? '#ffff00' : '#666666';
    ctx.beginPath();
    ctx.arc(px, py, isNext ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();
    if (isNext) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NEXT', px, py - 12);
      ctx.textAlign = 'left';
    }
  }
}

// ── Render: Serial Criminal ──
function _renderSerialCriminal(f2, camX, camY, w, h) {
  var sc = f2.serialCriminal;
  var sx = sc.x - camX, sy = sc.y - camY;
  if (sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) return;
  // Body
  ctx.fillStyle = '#440044';
  ctx.fillRect(sx - 5, sy - 6, 10, 12);
  // Head
  ctx.fillStyle = '#550055';
  ctx.beginPath();
  ctx.arc(sx, sy - 9, 5, 0, Math.PI * 2);
  ctx.fill();
  // Hat
  ctx.fillStyle = '#220022';
  ctx.fillRect(sx - 7, sy - 14, 14, 3);
  // Name
  ctx.fillStyle = '#ff44ff';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(sc.name, sx, sy - 18);
  // HP bar
  var maxHP = 8 + f2.serialCatchCount * 2;
  ctx.fillStyle = '#440044';
  ctx.fillRect(sx - 10, sy - 22, 20, 3);
  ctx.fillStyle = '#ff44ff';
  ctx.fillRect(sx - 10, sy - 22, (sc.hp / maxHP) * 20, 3);
  ctx.textAlign = 'left';
}

// ── Render: Auction ──
function _renderAuction(f2, w, h) {
  ctx.fillStyle = 'rgba(10, 10, 30, 0.8)';
  ctx.fillRect(w / 2 - 140, 40, 280, 80);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  ctx.strokeRect(w / 2 - 140, 40, 280, 80);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AUCTION HOUSE', w / 2, 55);
  if (f2.auctionItems.length > 0) {
    var item = f2.auctionItems[0];
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('Current: ' + item.name + ' (Base: $' + item.basePrice + ')', w / 2, 72);
    ctx.fillStyle = '#88ff88';
    ctx.fillText('Press U to bid | ' + f2.auctionItems.length + ' items left', w / 2, 88);
  } else {
    ctx.fillStyle = '#888888';
    ctx.font = '9px monospace';
    ctx.fillText('All items sold!', w / 2, 75);
  }
  ctx.textAlign = 'left';
}

// ── Render: Companion ──
function _renderCompanion(f2, camX, camY) {
  var cx = f2.companionPos.x - camX, cy = f2.companionPos.y - camY;
  ctx.fillStyle = '#44aaff';
  ctx.fillRect(cx - 4, cy - 5, 8, 10);
  ctx.fillStyle = '#dda577';
  ctx.beginPath();
  ctx.arc(cx, cy - 7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#88ccff';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(f2.companion.toUpperCase(), cx, cy - 14);
  ctx.textAlign = 'left';
}

// ── Render: Hired Guns ──
function _renderHiredGuns(f2, camX, camY, w, h) {
  for (var hi = 0; hi < f2.hiredGuns.length; hi++) {
    var hg = f2.hiredGuns[hi];
    var hx = hg.x - camX, hy = hg.y - camY;
    if (hx < -20 || hx > w + 20 || hy < -20 || hy > h + 20) continue;
    ctx.fillStyle = '#aa6633';
    ctx.fillRect(hx - 4, hy - 5, 8, 10);
    ctx.fillStyle = '#dda577';
    ctx.beginPath();
    ctx.arc(hx, hy - 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc8844';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MERC', hx, hy - 14);
    ctx.textAlign = 'left';
  }
}

// ── Render: Posse Members ──
function _renderPosse(f2, camX, camY, w, h) {
  for (var pi = 0; pi < f2.posseMembers.length; pi++) {
    var pm = f2.posseMembers[pi];
    var px = pm.x - camX, py = pm.y - camY;
    if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
    ctx.fillStyle = '#4466aa';
    ctx.fillRect(px - 4, py - 5, 8, 10);
    ctx.fillStyle = '#dda577';
    ctx.beginPath();
    ctx.arc(px, py - 7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6688cc';
    ctx.fillRect(px - 6, py - 12, 12, 3);
    ctx.fillStyle = '#88aaff';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPUTY', px, py - 15);
    ctx.textAlign = 'left';
  }
}

// ── Render: Turrets ──
function _renderTurrets(f2, camX, camY, w, h) {
  for (var ti = 0; ti < f2.turrets.length; ti++) {
    var t = f2.turrets[ti];
    var tx = t.x - camX, ty = t.y - camY;
    if (tx < -20 || tx > w + 20 || ty < -20 || ty > h + 20) continue;
    // Base
    ctx.fillStyle = '#555555';
    ctx.fillRect(tx - 8, ty - 4, 16, 8);
    // Barrel
    ctx.fillStyle = '#888888';
    ctx.fillRect(tx - 2, ty - 10, 4, 8);
    // Ammo count
    ctx.fillStyle = '#ffaa00';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.rounds, tx, ty + 12);
    ctx.textAlign = 'left';
  }
}

// ── Render: Bear Traps ──
function _renderBearTraps(f2, camX, camY, w, h) {
  for (var bi = 0; bi < f2.bearTraps.length; bi++) {
    var bt = f2.bearTraps[bi];
    var bx = bt.x - camX, by = bt.y - camY;
    if (bx < -20 || bx > w + 20 || by < -20 || by > h + 20) continue;
    ctx.fillStyle = bt.armed ? '#884400' : '#664400';
    ctx.fillRect(bx - 6, by - 3, 12, 6);
    if (bt.armed) {
      ctx.strokeStyle = '#cc6600';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 5, by - 3);
      ctx.lineTo(bx, by - 7);
      ctx.lineTo(bx + 5, by - 3);
      ctx.stroke();
    }
  }
}

// ── Render: Tomahawk ──
function _renderTomahawk(f2, camX, camY) {
  var tx = f2.tomahawkPos.x - camX, ty = f2.tomahawkPos.y - camY;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(f2.tomahawkAngle);
  ctx.fillStyle = '#888888';
  ctx.fillRect(-3, -8, 6, 16);
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(-5, -8, 10, 4);
  ctx.restore();
}

// ── Render: Thrown Stars ──
function _renderThrownStars(f2, camX, camY, w, h) {
  ctx.fillStyle = '#ccccff';
  for (var si = 0; si < f2.thrownStars.length; si++) {
    var s = f2.thrownStars[si];
    var sx = s.x - camX, sy = s.y - camY;
    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Date.now() * 0.01);
    for (var pi = 0; pi < 4; pi++) {
      ctx.fillRect(-1, -4, 2, 8);
      ctx.rotate(Math.PI / 4);
    }
    ctx.restore();
  }
}

// ── Render: Bow Arrows ──
function _renderBowArrows(f2, camX, camY, w, h) {
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  for (var ai = 0; ai < f2.bowArrows.length; ai++) {
    var a = f2.bowArrows[ai];
    var ax = a.x - camX, ay = a.y - camY;
    if (ax < -20 || ax > w + 20 || ay < -20 || ay > h + 20) continue;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - a.dx * 2, ay - a.dy * 2);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#aaaaaa';
    ctx.beginPath();
    ctx.moveTo(ax + (a.dx > 0 ? 3 : -3), ay + (a.dy > 0 ? 3 : -3));
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax + (a.dy > 0 ? 2 : -2), ay + (a.dx > 0 ? -2 : 2));
    ctx.fill();
  }
}

// ── Render: Cannon Projectiles ──
function _renderCannonProjectiles(f2, camX, camY, w, h) {
  for (var ci = 0; ci < f2.cannonProjectiles.length; ci++) {
    var c = f2.cannonProjectiles[ci];
    var cx = c.x - camX, cy = c.y - camY;
    if (cx < -20 || cx > w + 20 || cy < -20 || cy > h + 20) continue;
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    // Trail
    ctx.fillStyle = '#ff6600';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx - c.dx, cy - c.dy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ── Render: Fire Patches ──
function _renderFirePatches(f2, camX, camY, w, h) {
  for (var fi = 0; fi < f2.firePatches.length; fi++) {
    var fp = f2.firePatches[fi];
    var fx = fp.x - camX, fy = fp.y - camY;
    if (fx < -30 || fx > w + 30 || fy < -30 || fy > h + 30) continue;
    ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(fx, fy, 15 + Math.sin(Date.now() * 0.01) * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();
    // Flame flicker
    for (var ffi = 0; ffi < 3; ffi++) {
      ctx.fillStyle = 'rgba(255, ' + rand(50, 200) + ', 0, 0.5)';
      ctx.fillRect(fx + rand(-10, 10), fy + rand(-15, 0), rand(2, 4), rand(3, 8));
    }
  }
}

// ── Render: Memorials at church ──
function _renderMemorials(f2, camX, camY, w, h) {
  for (var mi = 0; mi < f2.memorials.length; mi++) {
    var mem = f2.memorials[mi];
    // Find church building
    for (var bi = 0; bi < game.buildings.length; bi++) {
      var b = game.buildings[bi];
      if (b.type === 'church') {
        var mx = b.x + 20 + mi * 15 - camX;
        var my = b.y + 30 - camY;
        if (mx < -20 || mx > w + 20 || my < -20 || my > h + 20) continue;
        ctx.fillStyle = '#888888';
        ctx.fillRect(mx - 3, my - 8, 6, 10);
        ctx.fillRect(mx - 5, my - 6, 10, 2);
        break;
      }
    }
  }
}

// ── V2 Damage modifier (called externally from game.js) ──
function v2GetDamageModifier() {
  if (!game._featuresV2) return 1;
  var f2 = game._featuresV2;
  var mod = 1;
  // Prestige bonus
  mod += f2.prestige * 0.05;
  // Last Stand
  if (f2.lastStandActive) mod *= 2;
  // Dual pistols
  if (f2.dualPistols) mod *= 0.7; // less per shot but more shots
  // Weapon upgrades
  var wu = f2.weaponUpgrades[game.currentWeapon] || 0;
  mod += wu * 0.15;
  // Weapon proficiency
  var wp = f2.weaponProf[game.currentWeapon] || 0;
  mod += wp * 0.005;
  // Rooftop bonus
  if (f2.onRooftop) mod *= 1.2;
  // Class bonus
  if (f2.playerClass === 'gunslinger') mod *= 1.1;
  // XP multiplier (for XP, not damage, but we'll use it)
  return mod;
}

// ── V2 Damage reduction (called when player takes damage) ──
function v2GetDamageReduction() {
  if (!game._featuresV2) return 0;
  var f2 = game._featuresV2;
  var dr = f2.armorDR;
  // Cover
  if (f2.inCover) dr += 50;
  // Class bonus
  if (f2.playerClass === 'lawman') dr += 5;
  return Math.min(80, dr); // Cap at 80% reduction
}

// ── V2 Critical hit check ──
function v2CheckCritical() {
  if (!game._featuresV2) return false;
  var f2 = game._featuresV2;
  var chance = 0.05;
  if (f2.playerClass === 'gunslinger') chance += 0.1;
  // Hat buff
  if (f2.activeHat !== null && f2.hatList[f2.activeHat] && f2.hatList[f2.activeHat].buff === 'crit+5%') chance += 0.05;
  // Weapon proficiency
  var wp = f2.weaponProf[game.currentWeapon] || 0;
  chance += wp * 0.001;
  if (Math.random() < chance) {
    f2.critCount++;
    return true;
  }
  return false;
}

// ── V2 Get speed modifier ──
function v2GetSpeedModifier() {
  if (!game._featuresV2) return 1;
  var f2 = game._featuresV2;
  var mod = 1;
  // Horse tier
  if (game.mounted && f2.horseTier > 0) {
    mod = f2.horseTiers[f2.horseTier].speed;
  }
  // Quicksand
  if (f2.inQuicksand) mod *= 0.3;
  // Bullet time (player moves normal speed)
  // Season effects
  if (f2.season === 'winter') mod *= 0.9;
  // Class bonus
  if (f2.playerClass === 'ranger' && game.mounted) mod *= 1.15;
  // Passive
  if (f2.passives.indexOf('Quick Feet (+5% speed)') !== -1) mod *= 1.05;
  if (f2.passives.indexOf('Fleet Foot (+10% speed)') !== -1) mod *= 1.1;
  return mod;
}

// ── V2 Get gold modifier ──
function v2GetGoldModifier() {
  if (!game._featuresV2) return 1;
  var f2 = game._featuresV2;
  var mod = 1;
  if (f2.economyCycle === 'boom') mod *= 1.3;
  else if (f2.economyCycle === 'bust') mod *= 0.8;
  if (f2.peacefulMoment) mod *= 1.1;
  // Login streak
  mod += Math.min(20, f2.loginStreak) * 0.01;
  // Class
  if (f2.playerClass === 'outlaw') mod *= 1.1;
  // Passives
  if (f2.passives.indexOf('Wealthy (+10% gold)') !== -1) mod *= 1.1;
  if (f2.passives.indexOf('Fortune (+20% gold)') !== -1) mod *= 1.2;
  return mod;
}

// ── V2 Get reputation modifier ──
function v2GetRepModifier() {
  if (!game._featuresV2) return 1;
  var f2 = game._featuresV2;
  var mod = 1;
  if (f2.peacefulMoment) mod *= 1.1;
  if (f2.playerClass === 'lawman') mod *= 1.2;
  return mod;
}

// ── V2 XP modifier ──
function v2GetXPModifier() {
  if (!game._featuresV2) return 1;
  return game._featuresV2.xpMultiplier || 1;
}

// ── V2 Add friendship (called from dialog system) ──
function v2AddFriendship(npcIdx, amount) {
  if (!game._featuresV2) return;
  var npc = game.npcs[npcIdx];
  if (!npc) return;
  if (!npc._id) npc._id = 'npc_' + npcIdx;
  var f2 = game._featuresV2;
  f2.friendships[npc._id] = Math.min(100, (f2.friendships[npc._id] || 0) + amount);
}

// ── V2 Add witness (called when player commits crime near NPC) ──
function v2AddWitness(npc) {
  if (!game._featuresV2) return;
  game._featuresV2.witnesses.push({
    name: npc.name || 'NPC',
    timer: 30,
    npc: npc
  });
  showNotification(npc.name + ' witnessed your crime! Bribe or intimidate before they report!');
}

// ── V2 Add rumor ──
function v2AddRumor(text, type) {
  if (!game._featuresV2) return;
  game._featuresV2.rumorQueue.push({ text: text, type: type || 'neutral' });
}

// ── V2 Start combat rating ──
function v2StartCombatRating() {
  if (!game._featuresV2) return;
  game._featuresV2.combatRatingTimer = 10;
  game._featuresV2.combatHits = 0;
  game._featuresV2.combatMisses = 0;
  game._featuresV2.combatDamageTaken = 0;
}

// ── V2 Record combat hit/miss ──
function v2RecordHit() { if (game._featuresV2) game._featuresV2.combatHits++; }
function v2RecordMiss() { if (game._featuresV2) game._featuresV2.combatMisses++; }
function v2RecordDamageTaken(amount) { if (game._featuresV2) game._featuresV2.combatDamageTaken += amount; }

// ── V2 Check if bullet time active (for game speed) ──
function v2IsBulletTime() {
  return game._featuresV2 && game._featuresV2.bulletTimeActive;
}

// ── V2 Get fire rate modifier ──
function v2GetFireRateModifier() {
  if (!game._featuresV2) return 1;
  var f2 = game._featuresV2;
  var mod = 1;
  if (f2.dualPistols) mod *= 2;
  if (f2.playerClass === 'gunslinger') mod *= 1.2;
  var wu = f2.weaponUpgrades[game.currentWeapon] || 0;
  mod += wu * 0.1;
  return mod;
}

// ── V2 Buy property (called from building interaction) ──
function v2BuyProperty(name, cost, income) {
  if (!game._featuresV2) return false;
  if (game.gold < cost) { showNotification('Not enough gold! Need $' + cost); return false; }
  game.gold -= cost;
  game._featuresV2.ownedPropertiesV2.push({ name: name, income: income, level: 1 });
  showNotification('Bought ' + name + '! Generates $' + income + '/day. -$' + cost);
  return true;
}

// ── V2 Upgrade weapon (called from blacksmith) ──
function v2UpgradeWeapon(weapon) {
  if (!game._featuresV2) return false;
  var f2 = game._featuresV2;
  var tier = f2.weaponUpgrades[weapon] || 0;
  if (tier >= 3) { showNotification(weapon + ' already max upgraded!'); return false; }
  var costs = [50, 100, 200];
  var cost = costs[tier];
  if (game.gold < cost) { showNotification('Need $' + cost + ' for upgrade!'); return false; }
  game.gold -= cost;
  f2.weaponUpgrades[weapon] = tier + 1;
  showNotification(weapon + ' upgraded to tier ' + (tier + 1) + '! -$' + cost);
  return true;
}

// ── V2 Buy arrows ──
function v2BuyArrows(count) {
  if (!game._featuresV2) return;
  var cost = count * 2;
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  game._featuresV2.arrows = Math.min(30, game._featuresV2.arrows + count);
  showNotification('Bought ' + count + ' arrows! -$' + cost);
}

// ── V2 Buy bear traps ──
function v2BuyBearTraps(count) {
  if (!game._featuresV2) return;
  var cost = count * 10;
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  game._featuresV2.bearTrapCount += count;
  showNotification('Bought ' + count + ' bear traps! -$' + cost);
}

// ── V2 Hire mercenary ──
function v2HireMerc(tier) {
  if (!game._featuresV2) return;
  var costs = [100, 200, 300];
  var cost = costs[tier] || 100;
  if (game.gold < cost) { showNotification('Need $' + cost + ' to hire!'); return; }
  game.gold -= cost;
  var p = game.player;
  game._featuresV2.hiredGuns.push({
    x: p.x + rand(-30, 30), y: p.y + rand(-30, 30),
    dayTimer: 600, // roughly 1 game day
    _atkCd: 0
  });
  showNotification('Hired mercenary! -$' + cost);
}

// ── V2 Deposit to vault ──
function v2VaultDeposit(amount) {
  if (!game._featuresV2) return;
  if (game.gold < amount) { showNotification('Not enough gold!'); return; }
  if (game._featuresV2.bankVaultGold + amount > 5000) { showNotification('Vault max is $5000!'); return; }
  game.gold -= amount;
  game._featuresV2.bankVaultGold += amount;
  showNotification('Deposited $' + amount + ' to vault (Total: $' + game._featuresV2.bankVaultGold + ')');
}

// ── V2 Withdraw from vault ──
function v2VaultWithdraw(amount) {
  if (!game._featuresV2) return;
  if (game._featuresV2.bankVaultGold < amount) { showNotification('Not enough in vault!'); return; }
  game._featuresV2.bankVaultGold -= amount;
  game.gold += amount;
  showNotification('Withdrew $' + amount + ' from vault (Remaining: $' + game._featuresV2.bankVaultGold + ')');
}

// ── V2 Take loan ──
function v2TakeLoan(amount) {
  if (!game._featuresV2) return;
  if (amount > 500) amount = 500;
  if (game._featuresV2.loan > 0) { showNotification('Already have a loan!'); return; }
  game._featuresV2.loan = amount;
  game._featuresV2.loanPaymentsMissed = 0;
  game.gold += amount;
  showNotification('Borrowed $' + amount + '. 10% daily interest!');
}

// ── V2 Repay loan ──
function v2RepayLoan() {
  if (!game._featuresV2 || game._featuresV2.loan <= 0) return;
  if (game.gold < game._featuresV2.loan) { showNotification('Need $' + game._featuresV2.loan + ' to repay!'); return; }
  game.gold -= game._featuresV2.loan;
  showNotification('Loan repaid! -$' + game._featuresV2.loan);
  game._featuresV2.loan = 0;
  game._featuresV2.loanPaymentsMissed = 0;
}

// ── V2 Buy stock ──
function v2BuyStock(stockName, shares) {
  if (!game._featuresV2) return;
  var stock = game._featuresV2.stocks[stockName];
  if (!stock) return;
  var cost = stock.price * shares;
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  stock.owned += shares;
  showNotification('Bought ' + shares + ' ' + stockName + ' at $' + stock.price + '/share. -$' + cost);
}

// ── V2 Sell stock ──
function v2SellStock(stockName, shares) {
  if (!game._featuresV2) return;
  var stock = game._featuresV2.stocks[stockName];
  if (!stock || stock.owned < shares) { showNotification('Not enough shares!'); return; }
  var revenue = stock.price * shares;
  stock.owned -= shares;
  game.gold += revenue;
  showNotification('Sold ' + shares + ' ' + stockName + ' at $' + stock.price + '/share. +$' + revenue);
}

// ── V2 Toggle undercover ──
function v2ToggleUndercover() {
  if (!game._featuresV2) return;
  if (game._featuresV2.undercover) return;
  game._featuresV2.undercover = true;
  game._featuresV2.undercoverTimer = 60;
  showNotification('Undercover disguise active for 60s!');
}

// ── V2 Start prospecting ──
function v2StartProspecting() {
  if (!game._featuresV2) return;
  if (game._featuresV2.prospectingActive) return;
  game._featuresV2.prospectingActive = true;
  game._featuresV2.prospectTimer = 3;
  showNotification('Panning for gold...');
}

// ── V2 Recruit companion ──
function v2RecruitCompanion(type) {
  if (!game._featuresV2) return;
  if (game._featuresV2.companion) { showNotification('Already have a companion!'); return; }
  game._featuresV2.companion = type;
  game._featuresV2.companionPos = { x: game.player.x, y: game.player.y };
  game._featuresV2.companionCooldown = 0;
  showNotification('Recruited ' + type + ' as companion!');
}

// ── V2 Buy insurance ──
function v2BuyInsurance() {
  if (!game._featuresV2) return;
  game._featuresV2.insured = true;
  showNotification('Insurance purchased! $10/day, covers 80% property damage.');
}

// ── V2 Set tax style ──
function v2SetTaxStyle(style) {
  if (!game._featuresV2) return;
  game._featuresV2.taxStyle = style;
  showNotification('Tax collection set to: ' + style);
}

// ── V2 Skill respec ──
function v2SkillRespec() {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (game.gold < 200) { showNotification('Need $200 for respec!'); return; }
  if (game.dayCount - f2.lastRespecDay < 7) { showNotification('Respec on 7-day cooldown!'); return; }
  game.gold -= 200;
  f2.lastRespecDay = game.dayCount;
  // Reset class skills
  if (f2.classSkills) {
    var refunded = 0;
    var keys = Object.keys(f2.classSkills);
    for (var ki = 0; ki < keys.length; ki++) {
      if (f2.classSkills[keys[ki]]) { refunded++; f2.classSkills[keys[ki]] = false; }
    }
    f2.classSkillPoints += refunded;
  }
  showNotification('Skills respecced! -$200');
}

// ── V2 Post bounty ──
function v2PostBounty(name, reward) {
  if (!game._featuresV2) return;
  if (game.gold < reward) { showNotification('Need $' + reward + '!'); return; }
  game.gold -= reward;
  game._featuresV2.postedBounties.push({ name: name, reward: reward, timer: 300 });
  showNotification('Bounty posted: ' + name + ' ($' + reward + ')');
}

// ── V2 Set active title ──
function v2SetTitle(title) {
  if (!game._featuresV2) return;
  if (game._featuresV2.titles.indexOf(title) !== -1) {
    game._featuresV2.activeTitle = title;
    showNotification('Title set: ' + title);
  }
}

// ── V2 Set active hat ──
function v2SetHat(hatIdx) {
  if (!game._featuresV2) return;
  if (game._featuresV2.hats.indexOf(hatIdx) !== -1) {
    game._featuresV2.activeHat = hatIdx;
    showNotification('Hat equipped: ' + game._featuresV2.hatList[hatIdx].name);
  }
}

// ── V2 Konami code handler ──
function v2HandleKeyCode(code) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  f2.konamiBuffer.push(code);
  if (f2.konamiBuffer.length > 10) f2.konamiBuffer.shift();
  if (f2.konamiBuffer.length === 10) {
    var match = true;
    for (var ki = 0; ki < 10; ki++) {
      if (f2.konamiBuffer[ki] !== f2.konamiCode[ki]) { match = false; break; }
    }
    if (match && f2.easterEggsFound.indexOf('konami') === -1) {
      f2.easterEggsFound.push('konami');
      game.gold += 500;
      showNotification('EASTER EGG: KONAMI CODE! Gold rain! +$500!');
      particles.emit(game.player.x, game.player.y - 50, 50, '#ffd700', 3, 60);
      f2.konamiBuffer = [];
    }
  }
}

// ════════════════════════════════════════════════════════════
// EXTENDED IMPLEMENTATIONS — Features needing more detail
// ════════════════════════════════════════════════════════════

// ── Feature 30: Weapon Upgrade Shop UI (at blacksmith) ──
function v2RenderWeaponUpgradeShop(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 170, my = h / 2 - 120;
  ctx.fillStyle = 'rgba(15, 10, 5, 0.92)';
  ctx.fillRect(mx, my, 340, 240);
  ctx.strokeStyle = '#aa6633';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 340, 240);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BLACKSMITH — WEAPON UPGRADES', w / 2, my + 20);

  var weapons = ['revolver', 'shotgun', 'rifle'];
  var weaponLabels = ['Revolver', 'Shotgun', 'Rifle'];
  var tierNames = ['Base', 'Tier I', 'Tier II', 'Tier III (MAX)'];
  var costs = [50, 100, 200];
  var bonuses = [
    ['+1 dmg', '+accuracy', '+reload speed'],
    ['+spread', '+pellets', '+range'],
    ['+2 damage', '+scope', '+reload speed']
  ];

  for (var wi = 0; wi < weapons.length; wi++) {
    var tier = f2.weaponUpgrades[weapons[wi]] || 0;
    var yOff = my + 45 + wi * 60;

    // Weapon name
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(weaponLabels[wi], mx + 15, yOff);

    // Current tier
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '9px monospace';
    ctx.fillText('Current: ' + tierNames[tier], mx + 15, yOff + 14);

    // Tier progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(mx + 15, yOff + 18, 120, 6);
    ctx.fillStyle = tier === 0 ? '#666' : (tier === 1 ? '#44aa44' : (tier === 2 ? '#4488ff' : '#ff8800'));
    ctx.fillRect(mx + 15, yOff + 18, (tier / 3) * 120, 6);

    // Upgrade info
    if (tier < 3) {
      ctx.fillStyle = '#88ff88';
      ctx.fillText('Upgrade: ' + bonuses[wi][tier] + ' ($' + costs[tier] + ')', mx + 150, yOff + 7);
      ctx.fillStyle = game.gold >= costs[tier] ? '#44ff44' : '#ff4444';
      ctx.fillText('[' + (wi + 1) + '] Buy', mx + 150, yOff + 22);
    } else {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('MAXED OUT', mx + 150, yOff + 14);
    }

    // Skin display
    var skin = f2.weaponSkins[weapons[wi]];
    if (skin !== 'default') {
      ctx.fillStyle = skin === 'gold' ? '#ffd700' : (skin === 'silver' ? '#c0c0c0' : '#333333');
      ctx.fillText('Skin: ' + skin.toUpperCase(), mx + 260, yOff + 14);
    }
  }

  // Shield
  ctx.fillStyle = '#88ccff';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(f2.hasShield ? 'Shield: OWNED' : 'Shield ($120) [4]', mx + 15, my + 220);

  // Turret
  ctx.fillText('Gatling Turret ($200) [5]', mx + 180, my + 220);

  ctx.textAlign = 'left';
}

// ── Feature 33: Armor Shop UI ──
function v2RenderArmorShop(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 150, my = h / 2 - 100;
  ctx.fillStyle = 'rgba(15, 10, 5, 0.92)';
  ctx.fillRect(mx, my, 300, 200);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 300, 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ARMOR SHOP', w / 2, my + 18);

  var slots = ['hat', 'vest', 'boots', 'gloves'];
  var slotNames = ['Hat', 'Vest', 'Boots', 'Gloves'];
  var tierNames = ['None', 'Leather', 'Chain', 'Plate'];
  var costs = [30, 60, 100];
  var drPerTier = [0, 3, 6, 9];

  for (var si = 0; si < slots.length; si++) {
    var tier = f2.armor[slots[si]];
    var yOff = my + 40 + si * 35;

    ctx.fillStyle = '#ccaa88';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(slotNames[si] + ': ' + tierNames[tier] + ' (DR +' + drPerTier[tier] + '%)', mx + 15, yOff);

    // Upgrade bar
    ctx.fillStyle = '#333';
    ctx.fillRect(mx + 15, yOff + 5, 100, 5);
    var colors = ['#666', '#88aa44', '#4488cc', '#ff8800'];
    ctx.fillStyle = colors[tier];
    ctx.fillRect(mx + 15, yOff + 5, (tier / 3) * 100, 5);

    if (tier < 3) {
      var cost = costs[tier];
      ctx.fillStyle = game.gold >= cost ? '#88ff88' : '#ff6666';
      ctx.fillText('Upgrade to ' + tierNames[tier + 1] + ' ($' + cost + ')', mx + 130, yOff);
    } else {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('MAX', mx + 130, yOff);
    }
  }

  // Total DR
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Total Damage Reduction: ' + f2.armorDR + '% (max 60%)', w / 2, my + 185);
  ctx.textAlign = 'left';
}

// ── V2 Buy armor piece ──
function v2BuyArmor(slot) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  var tier = f2.armor[slot] || 0;
  if (tier >= 3) { showNotification(slot + ' already at max tier!'); return; }
  var costs = [30, 60, 100];
  var cost = costs[tier];
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  f2.armor[slot] = tier + 1;
  var tierNames = ['Leather', 'Chain', 'Plate'];
  showNotification(slot + ' upgraded to ' + tierNames[tier] + '! -$' + cost);
}

// ── Feature 53: Romance Dialog Rendering ──
function v2RenderRomanceDialog(f2, npcIdx, w, h) {
  if (!f2 || f2.romanceTargets.indexOf(npcIdx) === -1) return;
  var stage = f2.romanceStage[npcIdx] || 0;
  var stageNames = ['Acquaintance', 'Friend', 'Courting', 'Partner'];
  var stageColors = ['#aaaaaa', '#88ccff', '#ff88cc', '#ff4488'];
  var npc = game.npcs[npcIdx];
  if (!npc) return;

  var mx = w / 2 - 100, my = h - 60;
  ctx.fillStyle = 'rgba(30, 10, 20, 0.8)';
  ctx.fillRect(mx, my, 200, 25);
  ctx.strokeStyle = stageColors[stage];
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 200, 25);

  // Heart icon
  ctx.fillStyle = stageColors[stage];
  ctx.font = '12px monospace';
  ctx.fillText('\u2665', mx + 5, my + 17);

  ctx.fillStyle = stageColors[stage];
  ctx.font = '9px monospace';
  ctx.fillText(npc.name + ' — ' + stageNames[stage], mx + 20, my + 10);

  // Friendship bar
  var fr = f2.friendships[npc._id] || 0;
  ctx.fillStyle = '#333';
  ctx.fillRect(mx + 20, my + 15, 160, 4);
  ctx.fillStyle = stageColors[stage];
  ctx.fillRect(mx + 20, my + 15, (fr / 100) * 160, 4);

  // Partner perks
  if (stage === 3) {
    ctx.fillStyle = '#ff88cc';
    ctx.font = '7px monospace';
    ctx.fillText('Free heals + bonus gold', mx + 55, my + 24);
  }
}

// ── Feature 57: Faction Detail Panel ──
function v2RenderFactionPanel(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 160, my = 50;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
  ctx.fillRect(mx, my, 320, 200);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 320, 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FACTION STANDINGS', w / 2, my + 18);

  var factions = [
    { key: 'townsfolk', name: 'Townsfolk', perk: 'Free info', color: '#88ccff' },
    { key: 'ranchers', name: 'Ranchers', perk: 'Horse buffs', color: '#88ff88' },
    { key: 'merchants', name: 'Merchants', perk: 'Discounts', color: '#ffcc44' },
    { key: 'church', name: 'Church', perk: 'Healing', color: '#ffaaff' }
  ];

  for (var fi = 0; fi < factions.length; fi++) {
    var fac = factions[fi];
    var val = f2.factions[fac.key];
    var yOff = my + 40 + fi * 38;

    ctx.fillStyle = fac.color;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(fac.name, mx + 15, yOff);

    // Rep bar
    ctx.fillStyle = '#222';
    ctx.fillRect(mx + 100, yOff - 8, 150, 10);
    ctx.fillStyle = val > 70 ? '#44ff44' : (val > 30 ? '#ffff44' : '#ff4444');
    ctx.fillRect(mx + 100, yOff - 8, (val / 100) * 150, 10);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(mx + 100, yOff - 8, 150, 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText(val + '/100', mx + 260, yOff);

    // Perk status
    ctx.fillStyle = val >= 70 ? '#44ff44' : '#666666';
    ctx.font = '8px monospace';
    ctx.fillText('Perk: ' + fac.perk + (val >= 70 ? ' (ACTIVE)' : ' (Need 70)'), mx + 100, yOff + 8);
  }

  // Faction missions available
  ctx.fillStyle = '#ccaa88';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  if (f2.activeFactionMission) {
    ctx.fillText('Active Mission: ' + f2.activeFactionMission.name, w / 2, my + 195);
  } else {
    ctx.fillText('Talk to faction leaders for missions', w / 2, my + 195);
  }
  ctx.textAlign = 'left';
}

// ── Feature 82: Stock Market UI ──
function v2RenderStockMarket(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 170, my = h / 2 - 100;
  ctx.fillStyle = 'rgba(5, 10, 20, 0.92)';
  ctx.fillRect(mx, my, 340, 200);
  ctx.strokeStyle = '#446688';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 340, 200);

  ctx.fillStyle = '#44aaff';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STOCK EXCHANGE', w / 2, my + 18);

  var stocks = ['railroad', 'mining', 'cattle'];
  var labels = ['Railroad Co.', 'Mining Corp.', 'Cattle Co.'];
  var colors = ['#4488ff', '#ffaa44', '#88ff44'];

  for (var si = 0; si < stocks.length; si++) {
    var stock = f2.stocks[stocks[si]];
    var yOff = my + 40 + si * 50;

    ctx.fillStyle = colors[si];
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(labels[si], mx + 15, yOff);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('Price: $' + stock.price, mx + 15, yOff + 14);
    ctx.fillText('Owned: ' + stock.owned + ' shares', mx + 15, yOff + 26);
    ctx.fillText('Value: $' + (stock.price * stock.owned), mx + 15, yOff + 38);

    // Buy/Sell buttons
    ctx.fillStyle = '#44ff44';
    ctx.fillText('[B] Buy 1 ($' + stock.price + ')', mx + 180, yOff + 14);
    ctx.fillStyle = '#ff8844';
    ctx.fillText('[S] Sell 1 (+$' + stock.price + ')', mx + 180, yOff + 26);

    // Price indicator
    ctx.fillStyle = stock.price > 80 ? '#44ff44' : (stock.price > 30 ? '#ffff44' : '#ff4444');
    var barW = Math.min(80, (stock.price / 150) * 80);
    ctx.fillRect(mx + 180, yOff + 32, barW, 4);
  }

  // Cycle indicator
  ctx.fillStyle = f2.economyCycle === 'boom' ? '#44ff44' : (f2.economyCycle === 'bust' ? '#ff4444' : '#aaaaaa');
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Market: ' + f2.economyCycle.toUpperCase(), w / 2, my + 193);
  ctx.textAlign = 'left';
}

// ── Feature 88: Treasure Hunt UI ──
function v2RenderTreasureHunt(f2, w, h) {
  if (!f2 || !f2.activeTreasureHunt) return;
  var hunt = f2.activeTreasureHunt;
  var mx = 10, my = h - 80;

  ctx.fillStyle = 'rgba(20, 15, 5, 0.8)';
  ctx.fillRect(mx, my, 200, 70);
  ctx.strokeStyle = '#aa8844';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 200, 70);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('TREASURE HUNT', mx + 10, my + 14);

  ctx.fillStyle = '#ccaa88';
  ctx.font = '8px monospace';
  ctx.fillText('Clue ' + hunt.clueNum + '/3:', mx + 10, my + 28);
  ctx.fillText(hunt.currentClue || 'Follow the map...', mx + 10, my + 40);
  ctx.fillText('Reward: $' + hunt.reward, mx + 10, my + 54);

  // Distance hint
  if (hunt.targetX && hunt.targetY) {
    var d = Math.sqrt(
      (game.player.x - hunt.targetX) * (game.player.x - hunt.targetX) +
      (game.player.y - hunt.targetY) * (game.player.y - hunt.targetY)
    );
    ctx.fillStyle = d < 50 ? '#44ff44' : (d < 150 ? '#ffff44' : '#ff4444');
    ctx.fillText(d < 50 ? 'Very close!' : (d < 150 ? 'Getting warm...' : 'Cold...'), mx + 10, my + 65);
  }
}

// ── Feature 95: Horse Trading UI ──
function v2RenderHorseTrading(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 150, my = h / 2 - 100;
  ctx.fillStyle = 'rgba(20, 15, 5, 0.92)';
  ctx.fillRect(mx, my, 300, 200);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 300, 200);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HORSE TRADING', w / 2, my + 18);

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('Current: ' + f2.horseName + ' (Tier ' + f2.horseTier + ')', w / 2, my + 38);

  for (var hi = 0; hi < f2.horseTiers.length; hi++) {
    var ht = f2.horseTiers[hi];
    var yOff = my + 55 + hi * 26;
    var owned = f2.horseTier >= hi;

    ctx.fillStyle = owned ? '#44ff44' : '#cccccc';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(ht.name, mx + 15, yOff);
    ctx.fillText('Speed: ' + ht.speed.toFixed(1) + 'x  HP: ' + ht.hp, mx + 90, yOff);

    if (!owned && f2.horseTier === hi - 1) {
      ctx.fillStyle = game.gold >= ht.cost ? '#88ff88' : '#ff6666';
      ctx.fillText('$' + ht.cost + ' [' + (hi + 1) + ']', mx + 230, yOff);
    } else if (owned) {
      ctx.fillStyle = '#666';
      ctx.fillText('OWNED', mx + 240, yOff);
    }
  }
  ctx.textAlign = 'left';
}

// ── V2 Buy horse ──
function v2BuyHorse(tier) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (tier !== f2.horseTier + 1) { showNotification('Must buy next tier!'); return; }
  if (tier < 0 || tier >= f2.horseTiers.length) return;
  var ht = f2.horseTiers[tier];
  if (game.gold < ht.cost) { showNotification('Need $' + ht.cost + '!'); return; }
  game.gold -= ht.cost;
  f2.horseTier = tier;
  f2.horseName = ht.name;
  showNotification('Bought ' + ht.name + '! Speed: ' + ht.speed.toFixed(1) + 'x, HP: ' + ht.hp);
}

// ── Feature 96: Property Renovation UI ──
function v2RenderPropertyManager(f2, w, h) {
  if (!f2 || f2.ownedPropertiesV2.length === 0) return;
  var mx = w / 2 - 160, my = h / 2 - 80;
  var propH = f2.ownedPropertiesV2.length * 30 + 50;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
  ctx.fillRect(mx, my, 320, propH);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 320, propH);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PROPERTY MANAGER', w / 2, my + 18);

  for (var pi = 0; pi < f2.ownedPropertiesV2.length; pi++) {
    var prop = f2.ownedPropertiesV2[pi];
    var yOff = my + 40 + pi * 28;
    var lvl = prop.level || 1;

    ctx.fillStyle = '#ccaa88';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(prop.name + ' (Lv.' + lvl + ')', mx + 15, yOff);
    ctx.fillText('Income: $' + (prop.income * lvl) + '/day', mx + 160, yOff);

    if (lvl < 3) {
      var upgCost = lvl * 75;
      ctx.fillStyle = game.gold >= upgCost ? '#88ff88' : '#ff6666';
      ctx.fillText('Upgrade $' + upgCost, mx + 260, yOff);
    } else {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('MAX', mx + 270, yOff);
    }
  }

  // Total daily income
  var total = 0;
  for (var ti = 0; ti < f2.ownedPropertiesV2.length; ti++) {
    total += f2.ownedPropertiesV2[ti].income * (f2.ownedPropertiesV2[ti].level || 1);
  }
  ctx.fillStyle = '#44ff44';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Total Property Income: $' + total + '/day', w / 2, my + propH - 10);
  ctx.textAlign = 'left';
}

// ── V2 Upgrade property ──
function v2UpgradeProperty(propIdx) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (propIdx < 0 || propIdx >= f2.ownedPropertiesV2.length) return;
  var prop = f2.ownedPropertiesV2[propIdx];
  var lvl = prop.level || 1;
  if (lvl >= 3) { showNotification('Property already at max level!'); return; }
  var cost = lvl * 75;
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  prop.level = lvl + 1;
  showNotification(prop.name + ' upgraded to Lv.' + prop.level + '! -$' + cost);
}

// ── Feature 100: Empire Income Summary UI ──
function v2RenderIncomeSummary(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 150, my = h / 2 - 110;
  ctx.fillStyle = 'rgba(5, 10, 15, 0.92)';
  ctx.fillRect(mx, my, 300, 220);
  ctx.strokeStyle = '#446644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 300, 220);

  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EMPIRE INCOME SUMMARY', w / 2, my + 18);

  // Income sources
  var sources = [];
  // Properties
  var propInc = 0;
  for (var pi = 0; pi < f2.ownedPropertiesV2.length; pi++) {
    var pp = f2.ownedPropertiesV2[pi];
    propInc += pp.income * (pp.level || 1);
  }
  if (propInc > 0) sources.push({ name: 'Properties', amount: propInc });

  // Saloon
  if (f2.saloonOwned) {
    var salInc = f2.saloonPricing === 'cheap' ? 15 : (f2.saloonPricing === 'expensive' ? 40 : 20);
    salInc += f2.saloonStaff * 10;
    sources.push({ name: 'Saloon', amount: salInc });
  }

  // Ranch
  if (f2.ranchOwned && f2.cattle > 0) {
    sources.push({ name: 'Ranch (' + f2.cattle + ' cattle)', amount: f2.cattle * 10 });
  }

  // Mining
  if (f2.miningClaim) {
    sources.push({ name: 'Mining Claim', amount: f2.mineYield || 15 });
  }

  // Store
  if (f2.storeOwned) {
    var stInc = f2.storeMarkup === 'low' ? 15 : (f2.storeMarkup === 'high' ? 45 : 25);
    sources.push({ name: 'General Store', amount: stInc });
  }

  // Bank vault interest
  if (f2.bankVaultGold > 0) {
    sources.push({ name: 'Vault Interest', amount: Math.ceil(f2.bankVaultGold * 0.02) });
  }

  // Loan cost
  if (f2.loan > 0) {
    sources.push({ name: 'Loan Interest', amount: -Math.ceil(f2.loan * 0.1) });
  }

  // Insurance
  if (f2.insured) {
    sources.push({ name: 'Insurance', amount: -10 });
  }

  // Render sources
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  var totalIncome = 0;
  for (var si = 0; si < sources.length; si++) {
    var src = sources[si];
    totalIncome += src.amount;
    var yOff = my + 40 + si * 16;
    ctx.fillStyle = src.amount >= 0 ? '#88ff88' : '#ff6666';
    ctx.fillText(src.name, mx + 15, yOff);
    ctx.fillText((src.amount >= 0 ? '+' : '') + '$' + src.amount + '/day', mx + 200, yOff);
  }

  // Divider
  ctx.fillStyle = '#666';
  ctx.fillRect(mx + 15, my + 45 + sources.length * 16, 270, 1);

  // Total
  ctx.fillStyle = totalIncome >= 0 ? '#44ff44' : '#ff4444';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('TOTAL: ' + (totalIncome >= 0 ? '+' : '') + '$' + totalIncome + '/day', mx + 15, my + 58 + sources.length * 16);

  // Economy cycle modifier
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  var cycleText = f2.economyCycle === 'boom' ? '(+50% during Boom)' : (f2.economyCycle === 'bust' ? '(-30% during Bust)' : '(Normal economy)');
  ctx.fillText(cycleText, mx + 15, my + 74 + sources.length * 16);

  // Income history graph (last 10 days)
  if (f2.incomeHistory.length > 1) {
    var gx = mx + 15, gy = my + 180, gw = 270, gh = 30;
    ctx.fillStyle = '#111';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(gx, gy, gw, gh);

    var maxVal = 1;
    for (var hi = 0; hi < f2.incomeHistory.length; hi++) {
      maxVal = Math.max(maxVal, Math.abs(f2.incomeHistory[hi].amount));
    }

    var barCount = Math.min(10, f2.incomeHistory.length);
    var barWidth = gw / barCount;
    for (var bi = 0; bi < barCount; bi++) {
      var entry = f2.incomeHistory[f2.incomeHistory.length - barCount + bi];
      var barH = (Math.abs(entry.amount) / maxVal) * (gh - 5);
      ctx.fillStyle = entry.amount >= 0 ? '#44aa44' : '#aa4444';
      if (entry.amount >= 0) {
        ctx.fillRect(gx + bi * barWidth + 2, gy + gh - barH - 2, barWidth - 4, barH);
      } else {
        ctx.fillRect(gx + bi * barWidth + 2, gy + 2, barWidth - 4, barH);
      }
    }
    ctx.fillStyle = '#666';
    ctx.font = '7px monospace';
    ctx.fillText('Last ' + barCount + ' days', gx, gy - 2);
  }

  // Stocks portfolio
  ctx.fillStyle = '#88ccff';
  ctx.font = '8px monospace';
  var stockVal = 0;
  var stockKeys = ['railroad', 'mining', 'cattle'];
  for (var ski = 0; ski < stockKeys.length; ski++) {
    stockVal += f2.stocks[stockKeys[ski]].price * f2.stocks[stockKeys[ski]].owned;
  }
  ctx.fillText('Stock Portfolio: $' + stockVal, mx + 15, my + 215);
  ctx.fillText('Vault: $' + f2.bankVaultGold, mx + 160, my + 215);

  ctx.textAlign = 'left';
}

// ── Feature 128: Class Selection UI ──
function v2RenderClassSelection(f2, w, h) {
  if (!f2 || f2.playerClass) return;
  if (game.level < 10) return;

  var mx = w / 2 - 180, my = h / 2 - 120;
  ctx.fillStyle = 'rgba(10, 5, 20, 0.92)';
  ctx.fillRect(mx, my, 360, 240);
  ctx.strokeStyle = '#8844aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 360, 240);

  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE YOUR CLASS', w / 2, my + 22);
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '9px monospace';
  ctx.fillText('Press F1-F4 to select (permanent choice!)', w / 2, my + 38);

  var classes = [
    { key: 'F1', name: 'GUNSLINGER', color: '#ff4444',
      desc: '+20% fire rate, +10% crit, fan the hammer, deadeye, ricochet' },
    { key: 'F2', name: 'LAWMAN', color: '#4488ff',
      desc: '+30% arrest speed, +20% rep gain, backup call, evidence sense, immunity' },
    { key: 'F3', name: 'OUTLAW', color: '#888888',
      desc: '+25% steal, +30% intimidate, smoke bomb, lockpick, vanish' },
    { key: 'F4', name: 'RANGER', color: '#44aa44',
      desc: '+25% tracking, animal taming, eagle eye, nature heal, mount mastery' }
  ];

  for (var ci = 0; ci < classes.length; ci++) {
    var cls = classes[ci];
    var yOff = my + 55 + ci * 45;

    ctx.fillStyle = cls.color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[' + cls.key + '] ' + cls.name, mx + 15, yOff);

    ctx.fillStyle = '#cccccc';
    ctx.font = '8px monospace';
    // Word wrap description
    var words = cls.desc.split(', ');
    var line1 = words.slice(0, 3).join(', ');
    var line2 = words.slice(3).join(', ');
    ctx.fillText(line1, mx + 25, yOff + 14);
    if (line2) ctx.fillText(line2, mx + 25, yOff + 24);
  }
  ctx.textAlign = 'left';
}

// ── Feature 129: Class Skill Tree UI ──
function v2RenderClassSkillTree(f2, w, h) {
  if (!f2 || !f2.playerClass) return;
  var mx = w / 2 - 160, my = h / 2 - 100;
  ctx.fillStyle = 'rgba(10, 5, 20, 0.92)';
  ctx.fillRect(mx, my, 320, 200);
  ctx.strokeStyle = '#8844aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 320, 200);

  var perks = f2.classPerks[f2.playerClass] || [];
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(f2.playerClass.toUpperCase() + ' SKILL TREE', w / 2, my + 18);
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '9px monospace';
  ctx.fillText('Points: ' + f2.classSkillPoints + ' | Press 1-5 to unlock', w / 2, my + 32);

  for (var pi = 0; pi < Math.min(perks.length, 5); pi++) {
    var yOff = my + 50 + pi * 28;
    var unlocked = f2.classSkills['node_' + pi];

    // Node circle
    ctx.fillStyle = unlocked ? '#44ff44' : '#333';
    ctx.beginPath();
    ctx.arc(mx + 25, yOff, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = unlocked ? '#88ff88' : '#666';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Connection line
    if (pi > 0) {
      ctx.strokeStyle = f2.classSkills['node_' + (pi - 1)] ? '#44ff44' : '#333';
      ctx.beginPath();
      ctx.moveTo(mx + 25, yOff - 20);
      ctx.lineTo(mx + 25, yOff - 8);
      ctx.stroke();
    }

    // Perk name
    ctx.fillStyle = unlocked ? '#ffffff' : '#888888';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText((pi + 1) + '. ' + perks[pi], mx + 40, yOff + 4);

    if (!unlocked && f2.classSkillPoints > 0) {
      var canUnlock = pi === 0 || f2.classSkills['node_' + (pi - 1)];
      if (canUnlock) {
        ctx.fillStyle = '#ffff44';
        ctx.fillText('[AVAILABLE]', mx + 230, yOff + 4);
      }
    }
  }

  // Second row (nodes 5-9) for deeper tree
  for (var pi2 = 5; pi2 < Math.min(10, perks.length + 5); pi2++) {
    var yOff2 = my + 50 + (pi2 - 5) * 28;
    var nodeKey = 'node_' + pi2;
    var unlocked2 = f2.classSkills[nodeKey];

    ctx.fillStyle = unlocked2 ? '#ffaa00' : '#222';
    ctx.beginPath();
    ctx.arc(mx + 295, yOff2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'left';
}

// ── V2 Unlock class skill ──
function v2UnlockClassSkill(nodeIdx) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (!f2.playerClass) return;
  if (f2.classSkillPoints <= 0) { showNotification('No skill points!'); return; }
  var key = 'node_' + nodeIdx;
  if (f2.classSkills[key]) { showNotification('Already unlocked!'); return; }
  // Check prerequisite
  if (nodeIdx > 0 && !f2.classSkills['node_' + (nodeIdx - 1)]) {
    showNotification('Unlock previous node first!');
    return;
  }
  f2.classSkillPoints--;
  f2.classSkills[key] = true;
  var perks = f2.classPerks[f2.playerClass] || [];
  var perkName = nodeIdx < perks.length ? perks[nodeIdx] : 'Advanced ' + nodeIdx;
  showNotification('Class skill unlocked: ' + perkName + '!');
}

// ── Feature 132: Mastery Challenges ──
function v2RenderMasteryChallenges(f2, w, h) {
  if (!f2) return;
  var challenges = [
    { name: 'Sharpshooter', desc: 'Kill enemies from far', key: 'sharpshooter', tiers: [10, 25, 50] },
    { name: 'Brawler', desc: 'Melee kills', key: 'brawler', tiers: [5, 15, 30] },
    { name: 'Prospector', desc: 'Gold from mining/panning', key: 'prospector', tiers: [100, 500, 1000] },
    { name: 'Explorer', desc: 'Landmarks discovered', key: 'explorer', tiers: [3, 7, 10] },
    { name: 'Social', desc: 'NPC friendships at 50+', key: 'social', tiers: [3, 7, 15] },
    { name: 'Trader', desc: 'Total gold earned', key: 'trader', tiers: [500, 2000, 5000] },
    { name: 'Bounty', desc: 'Bounties completed', key: 'bounty', tiers: [5, 15, 30] },
    { name: 'Survivor', desc: 'Days survived', key: 'survivor', tiers: [10, 30, 100] },
    { name: 'Lawkeeper', desc: 'Arrests made', key: 'lawkeeper', tiers: [10, 30, 50] },
    { name: 'Collector', desc: 'Cards collected', key: 'collector', tiers: [10, 25, 50] }
  ];

  var mx = w / 2 - 160, my = 30;
  ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
  ctx.fillRect(mx, my, 320, challenges.length * 18 + 30);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 320, challenges.length * 18 + 30);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MASTERY CHALLENGES', w / 2, my + 15);

  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  for (var ci = 0; ci < challenges.length; ci++) {
    var ch = challenges[ci];
    var progress = f2.masteryChallenges[ch.key] || 0;
    var tier = 0;
    for (var ti = 0; ti < ch.tiers.length; ti++) {
      if (progress >= ch.tiers[ti]) tier = ti + 1;
    }
    var yOff = my + 28 + ci * 18;

    ctx.fillStyle = tier >= 3 ? '#ffd700' : (tier >= 2 ? '#4488ff' : (tier >= 1 ? '#44aa44' : '#888888'));
    ctx.fillText(ch.name, mx + 10, yOff);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(ch.desc, mx + 90, yOff);

    // Tier stars
    for (var si = 0; si < 3; si++) {
      ctx.fillStyle = si < tier ? '#ffd700' : '#333';
      ctx.fillText('*', mx + 260 + si * 10, yOff);
    }

    // Progress
    var nextTier = tier < 3 ? ch.tiers[tier] : ch.tiers[2];
    ctx.fillStyle = '#666';
    ctx.fillText(progress + '/' + nextTier, mx + 290, yOff);
  }
  ctx.textAlign = 'left';
}

// ── Feature 134: Equipment Rarity Colors ──
function v2GetRarityColor(rarity) {
  var colors = {
    common: '#ffffff',
    uncommon: '#44ff44',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ff8800'
  };
  return colors[rarity] || '#ffffff';
}

function v2RollRarity() {
  var roll = Math.random();
  if (roll < 0.5) return 'common';
  if (roll < 0.8) return 'uncommon';
  if (roll < 0.95) return 'rare';
  if (roll < 0.99) return 'epic';
  return 'legendary';
}

// ── Feature 144: Bounty Hunter Rank UI ──
function v2RenderBountyRank(f2, w, h) {
  if (!f2) return;
  var mx = 10, my = 10;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.7)';
  ctx.fillRect(mx, my, 140, 50);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 140, 50);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('Bounty Rank', mx + 5, my + 12);

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText(f2.bountyRankNames[f2.bountyRank], mx + 5, my + 26);

  // XP bar
  var thresholds = [0, 50, 150, 300, 500];
  var nextThreshold = f2.bountyRank < 4 ? thresholds[f2.bountyRank + 1] : 500;
  var currentBase = thresholds[f2.bountyRank];
  var pct = (f2.bountyXP - currentBase) / (nextThreshold - currentBase);
  pct = clamp(pct, 0, 1);

  ctx.fillStyle = '#333';
  ctx.fillRect(mx + 5, my + 32, 130, 6);
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(mx + 5, my + 32, 130 * pct, 6);
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '7px monospace';
  ctx.fillText(f2.bountyXP + '/' + nextThreshold + ' XP', mx + 5, my + 47);
}

// ── Feature 145: Survival Skills UI ──
function v2RenderSurvivalSkills(f2, w, h) {
  if (!f2) return;
  var skills = ['foraging', 'tracking', 'camping', 'riding', 'cooking'];
  var labels = ['Foraging', 'Tracking', 'Camping', 'Riding', 'Cooking'];
  var colors = ['#44aa44', '#ffaa44', '#ff6644', '#4488ff', '#ff88cc'];

  var mx = w / 2 - 100, my = h / 2 - 60;
  ctx.fillStyle = 'rgba(10, 15, 5, 0.9)';
  ctx.fillRect(mx, my, 200, skills.length * 22 + 30);
  ctx.strokeStyle = '#448844';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 200, skills.length * 22 + 30);

  ctx.fillStyle = '#88ff88';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SURVIVAL SKILLS', w / 2, my + 15);

  ctx.textAlign = 'left';
  ctx.font = '9px monospace';
  for (var si = 0; si < skills.length; si++) {
    var val = f2.survivalSkills[skills[si]] || 0;
    var yOff = my + 30 + si * 22;

    ctx.fillStyle = colors[si];
    ctx.fillText(labels[si], mx + 10, yOff);

    // Bar
    ctx.fillStyle = '#222';
    ctx.fillRect(mx + 80, yOff - 7, 100, 8);
    ctx.fillStyle = colors[si];
    ctx.fillRect(mx + 80, yOff - 7, (val / 100) * 100, 8);

    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(val + '/100', mx + 185, yOff);
  }
  ctx.textAlign = 'left';
}

// ── Feature 178: Statistics Dashboard ──
function v2RenderStatsDashboard(f2, w, h) {
  if (!f2) return;
  var mx = 20, my = 20, mw = w - 40, mh = h - 40;
  ctx.fillStyle = 'rgba(5, 5, 15, 0.94)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#446688';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, mw, mh);

  ctx.fillStyle = '#44aaff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STATISTICS DASHBOARD', w / 2, my + 22);

  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  var col1 = mx + 15, col2 = mx + mw / 2 + 15;
  var ly = my + 45;

  // Left column
  ctx.fillStyle = '#88ccff';
  ctx.fillText('COMBAT:', col1, ly); ly += 14;
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Kills: ' + (typeof game.outlawsKilled !== 'undefined' ? game.outlawsKilled : 0), col1, ly); ly += 12;
  ctx.fillText('Critical Hits: ' + f2.critCount, col1, ly); ly += 12;
  ctx.fillText('Executions: ' + f2.executionCount, col1, ly); ly += 12;
  ctx.fillText('Style Kills: ' + f2.styleKills, col1, ly); ly += 12;
  ctx.fillText('Last Rating: ' + (f2.lastCombatRating || 'N/A'), col1, ly); ly += 18;

  ctx.fillStyle = '#88ff88';
  ctx.fillText('EXPLORATION:', col1, ly); ly += 14;
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Landmarks: ' + f2.landmarksFound.length + '/10', col1, ly); ly += 12;
  ctx.fillText('Vistas: ' + f2.vistasFound.length + '/5', col1, ly); ly += 12;
  ctx.fillText('Props Found: ' + f2.propsFound.length + '/15', col1, ly); ly += 12;
  ctx.fillText('Caves Cleared: ' + f2.caves.filter(function(c){ return c.discovered; }).length + '/3', col1, ly); ly += 12;
  ctx.fillText('Tunnels: ' + f2.tunnelDiscovered.length + '/4', col1, ly); ly += 12;
  ctx.fillText('Capsules: ' + f2.capsulesFound.length + '/3', col1, ly); ly += 18;

  // Right column
  var ry = my + 45;
  ctx.fillStyle = '#ffaa44';
  ctx.fillText('ECONOMY:', col2, ry); ry += 14;
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Gold: $' + game.gold, col2, ry); ry += 12;
  ctx.fillText('Vault: $' + f2.bankVaultGold, col2, ry); ry += 12;
  ctx.fillText('Properties: ' + f2.ownedPropertiesV2.length, col2, ry); ry += 12;
  ctx.fillText('Daily Income: $' + f2.propertyIncome, col2, ry); ry += 12;
  var stockVal = 0;
  var sKeys = ['railroad','mining','cattle'];
  for (var ski = 0; ski < sKeys.length; ski++) { stockVal += f2.stocks[sKeys[ski]].price * f2.stocks[sKeys[ski]].owned; }
  ctx.fillText('Stock Value: $' + stockVal, col2, ry); ry += 18;

  ctx.fillStyle = '#ff88cc';
  ctx.fillText('SOCIAL:', col2, ry); ry += 14;
  ctx.fillStyle = '#cccccc';
  var friendCount = 0;
  var fKeys = Object.keys(f2.friendships);
  for (var fki = 0; fki < fKeys.length; fki++) { if (f2.friendships[fKeys[fki]] >= 50) friendCount++; }
  ctx.fillText('Friends (50+): ' + friendCount, col2, ry); ry += 12;
  ctx.fillText('Memorials: ' + f2.memorials.length, col2, ry); ry += 12;
  ctx.fillText('Romances: ' + f2.romanceTargets.length, col2, ry); ry += 18;

  ctx.fillStyle = '#ccaa88';
  ctx.fillText('PROGRESSION:', col2, ry); ry += 14;
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Level: ' + game.level, col2, ry); ry += 12;
  ctx.fillText('Prestige: ' + f2.prestige, col2, ry); ry += 12;
  ctx.fillText('Class: ' + (f2.playerClass || 'None'), col2, ry); ry += 12;
  ctx.fillText('Bounty Rank: ' + f2.bountyRankNames[f2.bountyRank], col2, ry); ry += 12;
  ctx.fillText('Login Streak: ' + f2.loginStreak + ' days', col2, ry); ry += 12;

  // Completion bar at bottom
  ctx.fillStyle = '#333';
  ctx.fillRect(mx + 15, my + mh - 25, mw - 30, 12);
  ctx.fillStyle = '#44aaff';
  ctx.fillRect(mx + 15, my + mh - 25, ((mw - 30) * f2.completionPct / 100), 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Completion: ' + f2.completionPct + '%', w / 2, my + mh - 16);

  ctx.textAlign = 'left';
}

// ── Feature 181: Hat Collection UI ──
function v2RenderHatCollection(f2, w, h) {
  if (!f2) return;
  var mx = w / 2 - 160, my = h / 2 - 130;
  ctx.fillStyle = 'rgba(10, 10, 15, 0.92)';
  ctx.fillRect(mx, my, 320, 260);
  ctx.strokeStyle = '#aa8844';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 320, 260);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HAT COLLECTION (' + f2.hats.length + '/' + f2.hatList.length + ')', w / 2, my + 18);

  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  for (var hi = 0; hi < f2.hatList.length; hi++) {
    var hat = f2.hatList[hi];
    var owned = f2.hats.indexOf(hi) !== -1;
    var equipped = f2.activeHat === hi;
    var col = Math.floor(hi / 10);
    var row = hi % 10;
    var hx = mx + 10 + col * 155;
    var hy = my + 32 + row * 22;

    // Hat icon
    ctx.fillStyle = owned ? hat.color : '#333';
    ctx.fillRect(hx, hy - 6, 12, 4);
    ctx.fillRect(hx + 2, hy - 10, 8, 5);

    // Name
    ctx.fillStyle = equipped ? '#ffd700' : (owned ? '#ffffff' : '#555555');
    ctx.fillText(hat.name, hx + 16, hy - 2);

    // Buff
    ctx.fillStyle = owned ? '#88cc88' : '#444444';
    ctx.fillText(hat.buff, hx + 75, hy - 2);

    // Equipped marker
    if (equipped) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText('*', hx + 140, hy - 2);
    }
  }

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Hats drop randomly from exploration and combat', w / 2, my + 252);
  ctx.textAlign = 'left';
}

// ── Feature 186: Challenge Mode Scenarios ──
function v2GetChallengeScenarios() {
  return [
    { id: 'quickdraw', name: 'Quick Draw', desc: 'Kill 5 outlaws in 30 seconds', timeLimit: 30, target: 5 },
    { id: 'defend', name: 'Town Defense', desc: 'Survive 60 seconds of attack', timeLimit: 60, target: 1 },
    { id: 'stealth', name: 'Shadow Run', desc: 'Reach the objective undetected', timeLimit: 45, target: 1 },
    { id: 'arrest', name: 'Arrest Spree', desc: 'Arrest 3 criminals in 60 seconds', timeLimit: 60, target: 3 },
    { id: 'treasure', name: 'Gold Rush', desc: 'Collect $200 in 90 seconds', timeLimit: 90, target: 200 },
    { id: 'horse', name: 'Horseback Pursuit', desc: 'Chase down the bandit leader', timeLimit: 40, target: 1 },
    { id: 'sniper', name: 'Sniper Alley', desc: 'Headshot 3 targets from range', timeLimit: 45, target: 3 },
    { id: 'brawl', name: 'Bar Brawl', desc: 'Win melee vs 5 opponents', timeLimit: 60, target: 5 },
    { id: 'escort', name: 'VIP Escort', desc: 'Protect the witness for 45 seconds', timeLimit: 45, target: 1 },
    { id: 'demo', name: 'Demolition', desc: 'Destroy 8 barrels in 30 seconds', timeLimit: 30, target: 8 }
  ];
}

function v2RenderChallengeMode(f2, w, h) {
  if (!f2) return;
  var scenarios = v2GetChallengeScenarios();
  var mx = w / 2 - 170, my = 20;
  ctx.fillStyle = 'rgba(5, 5, 15, 0.92)';
  ctx.fillRect(mx, my, 340, scenarios.length * 20 + 40);
  ctx.strokeStyle = '#884444';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, 340, scenarios.length * 20 + 40);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHALLENGE MODE', w / 2, my + 18);

  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  for (var si = 0; si < scenarios.length; si++) {
    var sc = scenarios[si];
    var score = f2.challengeScores[sc.id] || 0;
    var yOff = my + 35 + si * 20;

    var rating = score >= 3 ? 'GOLD' : (score >= 2 ? 'SILVER' : (score >= 1 ? 'BRONZE' : '--'));
    var rColor = score >= 3 ? '#ffd700' : (score >= 2 ? '#c0c0c0' : (score >= 1 ? '#cd7f32' : '#444'));

    ctx.fillStyle = '#cccccc';
    ctx.fillText(sc.name, mx + 10, yOff);
    ctx.fillStyle = '#888888';
    ctx.fillText(sc.desc, mx + 100, yOff);
    ctx.fillStyle = rColor;
    ctx.fillText(rating, mx + 300, yOff);
  }
  ctx.textAlign = 'left';
}

// ── Feature 193: Lore Journal Rendering ──
function v2RenderLoreJournal(f2, w, h) {
  if (!f2) return;
  var mx = 30, my = 30, mw = w - 60, mh = h - 60;
  ctx.fillStyle = 'rgba(20, 15, 10, 0.94)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, mw, mh);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LORE JOURNAL (' + f2.loreEntries.length + '/50)', w / 2, my + 22);

  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  var maxEntries = Math.min(f2.loreEntries.length, Math.floor((mh - 50) / 14));
  for (var li = 0; li < maxEntries; li++) {
    var entry = f2.loreEntries[li];
    ctx.fillStyle = '#ccaa88';
    ctx.fillText((li + 1) + '. ' + entry.substring(0, 70), mx + 15, my + 42 + li * 14);
  }

  if (f2.loreEntries.length > maxEntries) {
    ctx.fillStyle = '#888888';
    ctx.fillText('... and ' + (f2.loreEntries.length - maxEntries) + ' more entries', mx + 15, my + mh - 15);
  }

  ctx.textAlign = 'left';
}

// ── Feature 97: Debt Collection Quest UI ──
function v2RenderDebtQuests(f2, w, h) {
  if (!f2 || f2.debtQuests.length === 0) return;
  var mx = w - 180, my = 90;
  ctx.fillStyle = 'rgba(20, 10, 5, 0.8)';
  ctx.fillRect(mx, my, 170, f2.debtQuests.length * 25 + 20);
  ctx.strokeStyle = '#886644';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, 170, f2.debtQuests.length * 25 + 20);

  ctx.fillStyle = '#ffcc44';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('DEBT COLLECTION', mx + 5, my + 12);

  ctx.font = '8px monospace';
  for (var di = 0; di < f2.debtQuests.length; di++) {
    var dq = f2.debtQuests[di];
    if (dq.collected) continue;
    var yOff = my + 25 + di * 25;
    ctx.fillStyle = '#cccccc';
    ctx.fillText(dq.name + ' owes $' + dq.amount, mx + 5, yOff);
    ctx.fillStyle = '#ff8844';
    ctx.fillText('Collect or Forgive', mx + 5, yOff + 12);
  }
}

// ── V2 Collect debt ──
function v2CollectDebt(questIdx) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (questIdx < 0 || questIdx >= f2.debtQuests.length) return;
  var dq = f2.debtQuests[questIdx];
  if (dq.collected) return;
  dq.collected = true;
  game.gold += dq.amount;
  showNotification('Collected $' + dq.amount + ' debt from ' + dq.name + '!');
  // Lose friendship
  for (var ni = 0; ni < game.npcs.length; ni++) {
    if (game.npcs[ni].name === dq.name && game.npcs[ni]._id) {
      f2.friendships[game.npcs[ni]._id] = Math.max(0, (f2.friendships[game.npcs[ni]._id] || 0) - 15);
      showNotification(dq.name + ' is unhappy (-15 friendship)');
    }
  }
}

// ── V2 Forgive debt ──
function v2ForgiveDebt(questIdx) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (questIdx < 0 || questIdx >= f2.debtQuests.length) return;
  var dq = f2.debtQuests[questIdx];
  if (dq.collected) return;
  dq.collected = true;
  showNotification('Forgave ' + dq.name + '\'s $' + dq.amount + ' debt');
  // Gain friendship
  for (var ni = 0; ni < game.npcs.length; ni++) {
    if (game.npcs[ni].name === dq.name && game.npcs[ni]._id) {
      f2.friendships[game.npcs[ni]._id] = Math.min(100, (f2.friendships[game.npcs[ni]._id] || 0) + 20);
      showNotification(dq.name + ' is grateful (+20 friendship)');
    }
  }
  game.reputation = Math.min(REPUTATION_MAX, game.reputation + 3);
}

// ── V2 Buy saloon ──
function v2BuySaloon() {
  if (!game._featuresV2) return;
  if (game._featuresV2.saloonOwned) { showNotification('Already own the saloon!'); return; }
  if (game.gold < 350) { showNotification('Need $350 to buy saloon!'); return; }
  game.gold -= 350;
  game._featuresV2.saloonOwned = true;
  showNotification('Bought the saloon! Set prices with 1=cheap, 2=normal, 3=expensive. -$350');
}

// ── V2 Buy ranch ──
function v2BuyRanch() {
  if (!game._featuresV2) return;
  if (game._featuresV2.ranchOwned) { showNotification('Already own a ranch!'); return; }
  if (game.gold < 300) { showNotification('Need $300!'); return; }
  game.gold -= 300;
  game._featuresV2.ranchOwned = true;
  showNotification('Bought ranch! Buy cattle for $20 each, sell for $30-50.');
}

// ── V2 Buy cattle ──
function v2BuyCattle(count) {
  if (!game._featuresV2 || !game._featuresV2.ranchOwned) return;
  var cost = count * 20;
  if (game.gold < cost) { showNotification('Need $' + cost + '!'); return; }
  game.gold -= cost;
  game._featuresV2.cattle += count;
  showNotification('Bought ' + count + ' cattle! -$' + cost);
}

// ── V2 Stake mining claim ──
function v2StakeMiningClaim() {
  if (!game._featuresV2) return;
  if (game._featuresV2.miningClaim) { showNotification('Already have a mining claim!'); return; }
  if (game.gold < 100) { showNotification('Need $100!'); return; }
  game.gold -= 100;
  game._featuresV2.miningClaim = true;
  showNotification('Mining claim staked! Generates $5-30/day. -$100');
}

// ── V2 Buy general store ──
function v2BuyGeneralStore() {
  if (!game._featuresV2) return;
  if (game._featuresV2.storeOwned) { showNotification('Already own the store!'); return; }
  if (game.gold < 400) { showNotification('Need $400!'); return; }
  game.gold -= 400;
  game._featuresV2.storeOwned = true;
  showNotification('Bought the general store! -$400');
}

// ── V2 Start treasure hunt ──
function v2StartTreasureHunt(mapItem) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (f2.activeTreasureHunt) { showNotification('Already on a treasure hunt!'); return; }
  var clues = [
    'Head north from the saloon to find the first marker...',
    'The second clue lies where the sun sets over the canyon...',
    'Dig where the old oak tree casts its longest shadow...'
  ];
  var reward = rand(100, 500);
  f2.activeTreasureHunt = {
    clueNum: 1,
    currentClue: clues[0],
    clues: clues,
    reward: reward,
    targetX: rand(5, MAP_W - 5) * TILE,
    targetY: rand(5, MAP_H - 5) * TILE
  };
  showNotification('Treasure hunt started! Follow the clues!');
}

// ── V2 Check treasure hunt progress ──
function v2CheckTreasureHunt() {
  if (!game._featuresV2 || !game._featuresV2.activeTreasureHunt) return;
  var f2 = game._featuresV2;
  var hunt = f2.activeTreasureHunt;
  var p = game.player;
  var d = Math.sqrt(
    (p.x - hunt.targetX) * (p.x - hunt.targetX) +
    (p.y - hunt.targetY) * (p.y - hunt.targetY)
  );

  if (d < 30) {
    if (hunt.clueNum < 3) {
      hunt.clueNum++;
      hunt.currentClue = hunt.clues[hunt.clueNum - 1];
      hunt.targetX = rand(5, MAP_W - 5) * TILE;
      hunt.targetY = rand(5, MAP_H - 5) * TILE;
      showNotification('Clue ' + hunt.clueNum + '/3 found!');
    } else {
      // Treasure found!
      game.gold += hunt.reward;
      addXP(40);
      showNotification('TREASURE FOUND! +$' + hunt.reward + ' +40 XP!');
      f2.activeTreasureHunt = null;
      f2.bountyXP += 15;
    }
  }
}

// ── V2 Start faction mission ──
function v2StartFactionMission(faction) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (f2.activeFactionMission) { showNotification('Complete current faction mission first!'); return; }
  var missions = {
    townsfolk: [
      { name: 'Help the Townsfolk', desc: 'Patrol the town', timer: 120, reward: 50, repReward: 5 },
      { name: 'Community Aid', desc: 'Donate food to the needy', timer: 90, reward: 30, repReward: 8 },
      { name: 'Town Beautification', desc: 'Visit all landmarks', timer: 180, reward: 75, repReward: 10 }
    ],
    ranchers: [
      { name: 'Cattle Drive', desc: 'Herd cattle safely', timer: 120, reward: 60, repReward: 5 },
      { name: 'Wolf Hunt', desc: 'Clear predators', timer: 90, reward: 45, repReward: 7 },
      { name: 'Horse Breaking', desc: 'Tame a wild horse', timer: 150, reward: 80, repReward: 10 }
    ],
    merchants: [
      { name: 'Trade Route', desc: 'Escort goods safely', timer: 120, reward: 70, repReward: 5 },
      { name: 'Market Day', desc: 'Sell goods at market', timer: 60, reward: 40, repReward: 6 },
      { name: 'Supply Run', desc: 'Deliver supplies', timer: 100, reward: 55, repReward: 8 }
    ],
    church: [
      { name: 'Charity Work', desc: 'Help the poor', timer: 90, reward: 25, repReward: 10 },
      { name: 'Peace Mission', desc: 'Resolve conflicts', timer: 120, reward: 40, repReward: 12 },
      { name: 'Pilgrimage', desc: 'Visit sacred sites', timer: 180, reward: 60, repReward: 15 }
    ]
  };

  var factionMissions = missions[faction];
  if (!factionMissions || factionMissions.length === 0) return;
  var mission = factionMissions[rand(0, factionMissions.length - 1)];
  f2.activeFactionMission = {
    faction: faction,
    name: mission.name,
    desc: mission.desc,
    timer: mission.timer,
    reward: mission.reward,
    repReward: mission.repReward
  };
  showNotification('Faction mission: ' + mission.name + ' (' + faction + ')');
}

// ── V2 Complete faction mission ──
function v2CompleteFactionMission() {
  if (!game._featuresV2 || !game._featuresV2.activeFactionMission) return;
  var f2 = game._featuresV2;
  var mission = f2.activeFactionMission;
  game.gold += mission.reward;
  addXP(25);
  _v2AdjustFaction(f2, mission.faction, mission.repReward);
  showNotification('Mission complete: ' + mission.name + '! +$' + mission.reward + ' +' + mission.repReward + ' ' + mission.faction + ' rep');
  f2.activeFactionMission = null;
}

// ── V2 Add poster piece ──
function v2AddPosterPiece(setId) {
  if (!game._featuresV2) return;
  var f2 = game._featuresV2;
  if (f2.posterPieces[setId] === undefined) f2.posterPieces[setId] = 0;
  f2.posterPieces[setId]++;
  showNotification('Poster piece found! (' + f2.posterPieces[setId] + '/3 for set ' + setId + ')');
}

// ── V2 Add venom (from killing snakes) ──
function v2AddVenom() {
  if (!game._featuresV2) return;
  game._featuresV2.venomCount++;
  game._featuresV2.craftingInventory.venom++;
  showNotification('Venom collected! (' + game._featuresV2.venomCount + ')');
}

// ── V2 Add crafting material ──
function v2AddCraftingMaterial(material, count) {
  if (!game._featuresV2) return;
  if (game._featuresV2.craftingInventory[material] !== undefined) {
    game._featuresV2.craftingInventory[material] += (count || 1);
  }
}

// ── V2 Environmental kill bonus ──
function v2EnvironmentalKill() {
  if (!game._featuresV2) return;
  game._featuresV2.styleKills++;
  addXP(50);
  addFloatingText(game.player.x, game.player.y - 20, 'STYLE KILL! +50 XP', '#ff00ff');
  showNotification('Style Kill! +50 XP bonus!');
}

// ── V2 Get bullet time speed multiplier ──
function v2GetGameSpeedMultiplier() {
  if (!game._featuresV2) return 1;
  if (game._featuresV2.bulletTimeActive) return 0.3;
  if (game._featuresV2.weaponWheelOpen) return 0.2;
  return 1;
}
