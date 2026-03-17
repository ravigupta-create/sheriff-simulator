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
  if (game.state !== 'playing' && game.state !== 'dialog' && game.state !== 'tutorial') return;
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
  if (!f.dodgeActive && f.dodgeCooldown <= 0 && game.state === 'playing' && consumeKey('KeyQ')) {
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
  if (f.smokeBombs > 0 && game.state === 'playing' && consumeKey('Digit4')) {
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
  if (consumeKey('KeyV') && game.state === 'playing') {
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
  if (!f.mineActive && game.state === 'playing' && consumeKey('KeyE')) {
    // Check if near blacksmith (mine entrance)
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
    if (nearMine) {
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
