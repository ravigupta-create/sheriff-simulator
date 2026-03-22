(function() {
'use strict';

// ============================================================
// 30 NEW FEATURES — Sheriff Simulator Extension Pack 2
// Hooks into existing updateFeatures / renderFeaturesOverlay
// ============================================================

var _origUpdateFeatures = window.updateFeatures;
var _origRenderFeaturesOverlay = window.renderFeaturesOverlay;

// ── State Init ──
function initFeatures2() {
  if (game._features2) return;
  game._features2 = {
    // 1. Tornado
    tornadoTimer: 0,
    tornadoActive: false,
    tornadoX: 0, tornadoY: 0,
    tornadoDX: 0, tornadoDY: 0,
    tornadoLife: 0,
    tornadoDebris: [],

    // 2. Earthquake
    quakeTimer: 0,
    quakeActive: false,
    quakeLife: 0,
    quakeDrops: [],
    quakeShakeX: 0, quakeShakeY: 0,

    // 3. Mysterious Stranger
    strangerActive: false,
    strangerX: 0, strangerY: 0,
    strangerTimer: 0,
    strangerOffered: false,

    // 4. Snake Bite
    snakeTimer: 0,
    snakeBitten: false,
    snakePoisonTimer: 0,
    snakePoisonTicks: 0,

    // 5. Carrier Pigeon
    pigeonTimer: 0,
    pigeonActive: false,
    pigeonX: 0, pigeonY: 0,
    pigeonMsg: '',
    pigeonBountyTip: false,

    // 6. Sandstorm Treasure
    sandTreasures: [],
    sandTreasureTimer: 0,

    // 7. Outlaw Gang Raids
    gangRaidTimer: 0,
    gangRaidActive: false,
    gangRaidEnemies: [],
    gangRaidKilled: 0,
    gangRaidTotal: 0,

    // 8. Drought
    droughtTimer: 0,
    droughtActive: false,
    droughtLife: 0,

    // 9. Saloon Piano
    pianoActive: false,
    pianoNotes: [],
    pianoScore: 0,
    pianoCombo: 0,
    pianoTimer: 0,
    pianoLane: -1,

    // 10. Cattle Drive
    cattleDriveActive: false,
    cattle: [],
    cattleDelivered: 0,
    cattleTarget: { x: 0, y: 0 },

    // 11. Tumbleweed Racing
    twRaceActive: false,
    twRacers: [],
    twRaceBet: -1,
    twRaceTimer: 0,
    twRaceFinished: false,

    // 12. Shooting Gallery
    sgActive: false,
    sgTargets: [],
    sgScore: 0,
    sgTimer: 0,
    sgShots: 0,
    sgHits: 0,

    // 13. Dynamite Fishing
    dynFishCooldown: 0,

    // 14. Stagecoach Escort
    escortActive: false,
    escortCoach: null,
    escortBandits: [],
    escortHP: 0,
    escortTimer: 0,

    // 15. Moonshine Bust
    moonshineTimer: 0,
    moonshineTip: false,
    moonshineX: 0, moonshineY: 0,
    moonshineFound: false,

    // 16. Campfire Stories
    campfireStoryReady: false,
    campfireStoryCooldown: 0,
    campfireStoryText: '',
    campfireStoryShow: false,
    campfireStoryTimer: 0,

    // 17. Eagle Eye
    eagleEyeActive: false,
    eagleEyeTimer: 0,
    eagleEyeCooldown: 0,

    // 18. Town Bell
    bellCooldown: 0,
    bellRinging: false,
    bellTimer: 0,

    // 19. Wanted Poster
    wantedPosters: [],

    // 20. Outlaw Disguise
    disguiseOwned: false,
    disguiseActive: false,

    // 21. Medicine Man
    medManActive: false,
    medManX: 0, medManY: 0,
    medManTimer: 0,
    medManDayLast: -1,
    luckyCharmTimer: 0,
    staminaTimer: 0,

    // 22. Town Election
    electionTimer: 0,
    electionActive: false,
    electionVotes: 0,
    electionOpponent: 0,
    electionDay: 15,

    // 23. Prospecting Claims
    claims: [],
    claimIncomeTimer: 0,

    // 24. Tumbleweed Pet
    twPetActive: false,
    twPetX: 0, twPetY: 0,
    twPetGoldTimer: 0,
    goldenTWSpawned: false,
    goldenTWX: 0, goldenTWY: 0,

    // 25. Legendary Outlaws
    legendaryTimer: 0,
    legendaryActive: null,
    legendaryDay: 15,
    legendaryIndex: 0,

    // 26. Dual Pistol
    dualPistolUnlocked: false,
    dualPistolActive: false,

    // 27. Shield
    shieldOwned: false,
    shieldHP: 0,
    shieldRegenTimer: 0,

    // 28. Bounty Streak
    bountyStreak: 0,
    bountyStreakInvTimer: 0,

    // 29. War Cry
    warCryCooldown: 0,
    warCryActive: false,
    warCryTimer: 0,

    // 30. Loot Crates
    lootCrates: [],

    // internal
    _tickAccum: 0,
    _slowTick: 0
  };
}

// ── Helper: find nearest building of type ──
function findBuilding(type) {
  var p = game.player;
  var best = null, bestD = 999999;
  for (var i = 0; i < game.buildings.length; i++) {
    var b = game.buildings[i];
    if (b.type === type) {
      var d = Math.hypot(p.x - (b.x + b.w * TILE / 2), p.y - (b.y + b.h * TILE / 2));
      if (d < bestD) { bestD = d; best = b; }
    }
  }
  return bestD < 80 ? best : null;
}

function findAnyBuildingNear() {
  var p = game.player;
  for (var i = 0; i < game.buildings.length; i++) {
    var b = game.buildings[i];
    if (Math.hypot(p.x - (b.x + b.w * TILE / 2), p.y - (b.y + b.h * TILE / 2)) < 60) return b;
  }
  return null;
}

function isNight() {
  return game.time < 0.25 || game.time > 0.79;
}

function playSound(fn) {
  if (typeof audio !== 'undefined' && typeof audio[fn] === 'function') audio[fn]();
}

function screenToWorld(sx, sy) {
  return { x: sx + game.camera.x, y: sy + game.camera.y };
}

function worldToScreen(wx, wy) {
  return { x: wx - game.camera.x, y: wy - game.camera.y };
}

// ── LEGENDARY OUTLAW DEFINITIONS ──
var LEGENDARY_OUTLAWS = [
  { name: 'Shadow', title: 'the Phantom', hp: 12, speed: 2.5, bounty: 300, ability: 'teleport', color: '#2a0040' },
  { name: 'Tank', title: 'the Juggernaut', hp: 30, speed: 1.0, bounty: 350, ability: 'armor', color: '#4a3020' },
  { name: 'Quickdraw', title: 'Lightning Fingers', hp: 8, speed: 2.0, bounty: 250, ability: 'rapidfire', color: '#8b0000' },
  { name: 'Ghost', title: 'the Unseen', hp: 10, speed: 1.8, bounty: 280, ability: 'invisible', color: '#606060' },
  { name: 'Bomber', title: 'Dynamite Dan', hp: 15, speed: 1.5, bounty: 320, ability: 'explosives', color: '#cc6600' }
];

// ── PIANO SONGS ──
var PIANO_SONGS = [
  [0,1,2,3,2,1,0,3,1,2,0,3,2,1,3,0,1,2,3,0],
  [3,2,1,0,1,2,3,0,3,1,2,0,1,3,0,2,3,1,0,2],
  [0,0,1,1,2,2,3,3,0,1,2,3,3,2,1,0,0,3,1,2],
  [1,3,0,2,1,3,0,2,3,1,2,0,3,0,1,2,0,3,2,1]
];

// ── CAMPFIRE STORIES ──
var CAMPFIRE_STORIES = [
  'Old Pete swears he buried gold near the church... maybe under a loose stone.',
  'They say a tornado unearthed ancient treasure last time it hit. Keep your eyes open after storms.',
  'The mysterious stranger only appears on moonless nights. Some say he knows the future.',
  'A gang is planning a raid soon. Stock up on ammo and rally the deputies.',
  'There\'s a golden tumbleweed out there somewhere... they say it brings luck to whoever catches it.',
  'The doc says rattlesnakes are thick near the desert edge this time of year. Watch your step.',
  'I heard the bank has a hidden vault... but you didn\'t hear that from me.',
  'Prospectors found a rich vein east of town. Might be worth staking a claim.',
  'A legendary outlaw called Shadow has been spotted heading this way...',
  'The medicine man carries rare tonics. He passes through every few days near the church.'
];

// ============================================================
// UPDATE LOGIC
// ============================================================
function updateFeatures2(dt) {
  var f = game._features2;
  var p = game.player;
  f._tickAccum += dt;
  f._slowTick += dt;

  // ── 1. TORNADO EVENT ──
  f.tornadoTimer += dt;
  if (!f.tornadoActive && f.tornadoTimer > 200) {
    f.tornadoTimer = 0;
    if (Math.random() < 0.05) {
      f.tornadoActive = true;
      f.tornadoLife = 15;
      // Start from map edge
      var side = rand(0, 3);
      if (side === 0) { f.tornadoX = 0; f.tornadoY = rand(100, WORLD_H - 100); }
      else if (side === 1) { f.tornadoX = WORLD_W; f.tornadoY = rand(100, WORLD_H - 100); }
      else if (side === 2) { f.tornadoX = rand(100, WORLD_W - 100); f.tornadoY = 0; }
      else { f.tornadoX = rand(100, WORLD_W - 100); f.tornadoY = WORLD_H; }
      f.tornadoDX = (WORLD_W / 2 - f.tornadoX) / 15 * randF(0.5, 1.5);
      f.tornadoDY = (WORLD_H / 2 - f.tornadoY) / 15 * randF(0.5, 1.5);
      f.tornadoDebris = [];
      showNotification('TORNADO! Take shelter in a building!');
      playSound('playBellAlarm');
      addJournalEntry('A tornado swept through town!');
    }
  }
  if (f.tornadoActive) {
    f.tornadoLife -= dt;
    f.tornadoX += f.tornadoDX * dt;
    f.tornadoY += f.tornadoDY * dt;
    // Spawn debris
    if (Math.random() < 0.4) {
      f.tornadoDebris.push({
        x: f.tornadoX + randF(-40, 40),
        y: f.tornadoY + randF(-40, 40),
        angle: randF(0, 6.28),
        speed: randF(2, 5),
        life: randF(0.5, 2)
      });
    }
    // Update debris
    var wi = 0;
    for (var di = 0; di < f.tornadoDebris.length; di++) {
      var db = f.tornadoDebris[di];
      db.life -= dt;
      db.angle += dt * 5;
      db.x += Math.cos(db.angle) * db.speed;
      db.y += Math.sin(db.angle) * db.speed;
      if (db.life > 0) f.tornadoDebris[wi++] = db;
    }
    f.tornadoDebris.length = wi;
    // Damage NPCs in range
    if (f._slowTick > 0.5) {
      for (var ni = 0; ni < game.npcs.length; ni++) {
        var npc = game.npcs[ni];
        if (npc.dead) continue;
        if (Math.hypot(npc.x - f.tornadoX, npc.y - f.tornadoY) < 80) {
          npc.hp -= 2;
          npc.x += randF(-30, 30);
          npc.y += randF(-30, 30);
          particles.emit(npc.x, npc.y, 5, PALETTE.dust, 2, 15);
        }
      }
    }
    // Damage player if not in building
    if (!findAnyBuildingNear() && Math.hypot(p.x - f.tornadoX, p.y - f.tornadoY) < 70) {
      if (!game._cheatMode && f._slowTick > 1) {
        p.hp -= 1;
        showNotification('The tornado hits you! -1 HP. Get indoors!');
        particles.emit(p.x, p.y, 8, PALETTE.dust, 3, 20);
      }
    }
    if (f.tornadoLife <= 0) {
      f.tornadoActive = false;
      f.tornadoDebris = [];
      showNotification('The tornado has passed.');
      // Feature 6 tie-in: spawn sandstorm treasures
      for (var sti = 0; sti < rand(3, 5); sti++) {
        f.sandTreasures.push({
          x: rand(100, WORLD_W - 100),
          y: rand(100, WORLD_H - 100),
          life: 60,
          gold: rand(10, 40)
        });
      }
    }
  }

  // ── 2. EARTHQUAKE EVENT ──
  f.quakeTimer += dt;
  if (!f.quakeActive && !f.tornadoActive && f.quakeTimer > 250) {
    f.quakeTimer = 0;
    if (Math.random() < 0.04) {
      f.quakeActive = true;
      f.quakeLife = 5;
      f.quakeDrops = [];
      showNotification('EARTHQUAKE! Buildings are dropping items!');
      playSound('playExplosion');
      // Drop items near buildings
      for (var bi = 0; bi < game.buildings.length; bi++) {
        var bld = game.buildings[bi];
        if (Math.random() < 0.5) {
          f.quakeDrops.push({
            x: bld.x + rand(0, bld.w * TILE),
            y: bld.y + bld.h * TILE + rand(5, 20),
            gold: rand(5, 20),
            life: 30
          });
        }
      }
      // Panic NPCs
      for (var qn = 0; qn < game.npcs.length; qn++) {
        var qnpc = game.npcs[qn];
        if (!qnpc.dead) {
          qnpc.fleeing = true;
          qnpc.fleeTimer = 8;
        }
      }
      addJournalEntry('An earthquake shook the town!');
    }
  }
  if (f.quakeActive) {
    f.quakeLife -= dt;
    f.quakeShakeX = randF(-4, 4);
    f.quakeShakeY = randF(-4, 4);
    if (f.quakeLife <= 0) {
      f.quakeActive = false;
      f.quakeShakeX = 0;
      f.quakeShakeY = 0;
    }
  }
  // Collect quake drops
  wi = 0;
  for (var qi = 0; qi < f.quakeDrops.length; qi++) {
    var qd = f.quakeDrops[qi];
    qd.life -= dt;
    if (Math.hypot(p.x - qd.x, p.y - qd.y) < 24) {
      game.gold += qd.gold;
      showNotification('Picked up $' + qd.gold + ' from the rubble!');
      particles.emit(qd.x, qd.y, 5, PALETTE.gold, 2, 15);
      playSound('playDing');
      continue;
    }
    if (qd.life > 0) f.quakeDrops[wi++] = qd;
  }
  f.quakeDrops.length = wi;

  // ── 3. MYSTERIOUS STRANGER ──
  if (!f.strangerActive && isNight() && game.dayCount > 1) {
    f.strangerTimer += dt;
    if (f.strangerTimer > 120 && Math.random() < 0.01) {
      f.strangerActive = true;
      f.strangerTimer = 60; // stays for 60s
      f.strangerOffered = false;
      f.strangerX = p.x + randF(-200, 200);
      f.strangerY = p.y + randF(-200, 200);
      f.strangerX = clamp(f.strangerX, 50, WORLD_W - 50);
      f.strangerY = clamp(f.strangerY, 50, WORLD_H - 50);
      showNotification('A mysterious cloaked stranger has appeared nearby...');
    }
  }
  if (f.strangerActive) {
    f.strangerTimer -= dt;
    if (f.strangerTimer <= 0) {
      f.strangerActive = false;
      f.strangerOffered = false;
    }
    // Interact
    if (!f.strangerOffered && Math.hypot(p.x - f.strangerX, p.y - f.strangerY) < 48 && consumeKey('KeyE')) {
      f.strangerOffered = true;
      var choice = rand(0, 2);
      if (choice === 0) {
        // Gamble
        if (game.gold >= 30) {
          game.gold -= 30;
          if (Math.random() < 0.4) {
            game.gold += 90;
            showNotification('The stranger grins. You won $90! (+$60 profit)');
            playSound('playCheer');
          } else {
            showNotification('The stranger vanishes... You lost $30.');
            playSound('playBad');
          }
        } else {
          showNotification('The stranger says: "Come back when you have $30..."');
        }
      } else if (choice === 1) {
        // Free weapon upgrade
        p.speed += 0.2;
        showNotification('The stranger enchants your boots! +Speed!');
        particles.emit(p.x, p.y, 15, '#aa00ff', 3, 25);
        playSound('playVictory');
      } else {
        // Treasure map
        var tx = rand(100, WORLD_W - 100);
        var ty = rand(100, WORLD_H - 100);
        if (game._features && game._features.treasureMaps) {
          game._features.treasureMaps.push({ x: tx, y: ty, gold: rand(50, 150) });
          showNotification('The stranger gives you a treasure map!');
        } else {
          game.gold += 50;
          showNotification('The stranger gives you $50 in gold!');
        }
        playSound('playDing');
      }
      f.strangerActive = false;
    }
  }

  // ── 4. SNAKE BITE ENCOUNTERS ──
  f.snakeTimer += dt;
  if (!f.snakeBitten && f.snakeTimer > 90 && game.dayCount > 0) {
    f.snakeTimer = 0;
    // Check if player is in desert area (sand tiles)
    var ptx = Math.floor(p.x / TILE);
    var pty = Math.floor(p.y / TILE);
    var onSand = (game.map && game.map[pty] && game.map[pty][ptx] <= 1);
    if (onSand && Math.random() < 0.08) {
      f.snakeBitten = true;
      f.snakePoisonTimer = 0;
      f.snakePoisonTicks = 0;
      showNotification('A rattlesnake bit you! Find the doctor or general store for antivenom!');
      playSound('playBad');
      particles.emit(p.x, p.y, 8, '#228B22', 2, 20);
      addJournalEntry('Bitten by a rattlesnake! Need antivenom.');
    }
  }
  if (f.snakeBitten) {
    f.snakePoisonTimer += dt;
    if (f.snakePoisonTimer >= 5 && f.snakePoisonTicks < 4) {
      f.snakePoisonTimer = 0;
      f.snakePoisonTicks++;
      if (!game._cheatMode) {
        p.hp -= 1;
        showNotification('Snake venom! -1 HP (' + (4 - f.snakePoisonTicks) + ' ticks left)');
        particles.emit(p.x, p.y, 3, '#228B22', 2, 10);
      }
    }
    if (f.snakePoisonTicks >= 4) {
      f.snakeBitten = false;
    }
    // Cure: near doctor or general store
    var nearDoc = findBuilding(BUILDING_TYPES.HOTEL); // doctors typically at hotel
    var nearStore = findBuilding(BUILDING_TYPES.GENERAL);
    if ((nearDoc || nearStore) && consumeKey('KeyE')) {
      if (game.gold >= 15) {
        game.gold -= 15;
        f.snakeBitten = false;
        f.snakePoisonTicks = 0;
        showNotification('Antivenom applied! Cured. (-$15)');
        playSound('playDing');
      } else {
        showNotification('Antivenom costs $15. You don\'t have enough!');
      }
    }
  }

  // ── 5. CARRIER PIGEON ──
  f.pigeonTimer += dt;
  if (!f.pigeonActive && f.pigeonTimer > DAY_LENGTH * 2) {
    f.pigeonTimer = 0;
    f.pigeonActive = true;
    f.pigeonX = p.x + randF(-150, 150);
    f.pigeonY = p.y - 100;
    f.pigeonX = clamp(f.pigeonX, 50, WORLD_W - 50);
    f.pigeonY = clamp(f.pigeonY, 50, WORLD_H - 50);
    var msgs = [
      'BOUNTY TIP: An outlaw was spotted near the saloon. Apprehend for bonus!',
      'WEATHER WARNING: A storm approaches. Seek shelter soon.',
      'SUPPLY REQUEST: The next town needs 3 crates of goods. Deliver to the general store for $75.',
      'GOSSIP: The mayor has been seen meeting with shady characters at night...',
      'BOUNTY TIP: A wanted man is hiding near the stables. Be careful!',
      'SUPPLY REQUEST: Ammunition shortage in the territory. Prices may rise.'
    ];
    f.pigeonMsg = msgs[rand(0, msgs.length - 1)];
    f.pigeonBountyTip = f.pigeonMsg.indexOf('BOUNTY TIP') === 0;
    showNotification('A carrier pigeon has arrived with a message!');
  }
  if (f.pigeonActive) {
    if (Math.hypot(p.x - f.pigeonX, p.y - f.pigeonY) < 40 && consumeKey('KeyE')) {
      showNotification(f.pigeonMsg);
      addJournalEntry('Pigeon message: ' + f.pigeonMsg);
      if (f.pigeonBountyTip) {
        game.gold += 10;
        showNotification('Bounty tip bonus: +$10');
      }
      f.pigeonActive = false;
      playSound('playDing');
    }
  }

  // ── 6. SANDSTORM TREASURE ──
  wi = 0;
  for (var si = 0; si < f.sandTreasures.length; si++) {
    var st = f.sandTreasures[si];
    st.life -= dt;
    if (Math.hypot(p.x - st.x, p.y - st.y) < 24) {
      game.gold += st.gold;
      showNotification('Found storm treasure! +$' + st.gold);
      particles.emit(st.x, st.y, 10, PALETTE.gold, 3, 20);
      playSound('playDing');
      continue;
    }
    if (st.life > 0) f.sandTreasures[wi++] = st;
  }
  f.sandTreasures.length = wi;

  // ── 7. OUTLAW GANG RAIDS ──
  f.gangRaidTimer += dt;
  if (!f.gangRaidActive && f.gangRaidTimer > DAY_LENGTH * 8 && game.dayCount >= 3) {
    f.gangRaidTimer = 0;
    f.gangRaidActive = true;
    f.gangRaidKilled = 0;
    var count = rand(5, 8);
    f.gangRaidTotal = count;
    f.gangRaidEnemies = [];
    var edgeSide = rand(0, 3);
    for (var gi = 0; gi < count; gi++) {
      var gx, gy;
      if (edgeSide === 0) { gx = 20; gy = rand(100, WORLD_H - 100); }
      else if (edgeSide === 1) { gx = WORLD_W - 20; gy = rand(100, WORLD_H - 100); }
      else if (edgeSide === 2) { gx = rand(100, WORLD_W - 100); gy = 20; }
      else { gx = rand(100, WORLD_W - 100); gy = WORLD_H - 20; }
      f.gangRaidEnemies.push({
        x: gx, y: gy, hp: 4, maxHp: 4, dead: false,
        speed: randF(1.2, 2.0),
        shootTimer: randF(1, 3)
      });
    }
    showNotification('GANG RAID! ' + count + ' outlaws attacking the town!');
    playSound('playBellAlarm');
    playSound('playPanic');
    addJournalEntry('An outlaw gang of ' + count + ' attacked the town!');
  }
  if (f.gangRaidActive) {
    var allDead = true;
    for (var ge = 0; ge < f.gangRaidEnemies.length; ge++) {
      var enemy = f.gangRaidEnemies[ge];
      if (enemy.dead) continue;
      allDead = false;
      // Move toward town center
      var centerX = WORLD_W / 2, centerY = WORLD_H / 2;
      var edx = centerX - enemy.x, edy = centerY - enemy.y;
      var elen = Math.hypot(edx, edy);
      if (elen > 1) {
        enemy.x += (edx / elen) * enemy.speed;
        enemy.y += (edy / elen) * enemy.speed;
      }
      // Shoot at player
      enemy.shootTimer -= dt;
      if (enemy.shootTimer <= 0 && Math.hypot(p.x - enemy.x, p.y - enemy.y) < 300) {
        enemy.shootTimer = randF(2, 4);
        if (typeof bullets !== 'undefined') {
          var bdx2 = p.x - enemy.x, bdy2 = p.y - enemy.y;
          var blen = Math.hypot(bdx2, bdy2);
          if (blen > 0) {
            bullets.bullets.push({
              x: enemy.x, y: enemy.y,
              dx: (bdx2 / blen) * 5, dy: (bdy2 / blen) * 5,
              fromPlayer: false, life: 2, damage: 1
            });
          }
        }
        playSound('playGunshot');
      }
      // Check if hit by player bullets
      if (typeof bullets !== 'undefined') {
        for (var bk = 0; bk < bullets.bullets.length; bk++) {
          var bl = bullets.bullets[bk];
          if (bl.fromPlayer && Math.hypot(bl.x - enemy.x, bl.y - enemy.y) < 20) {
            enemy.hp -= 1;
            bl.life = 0;
            particles.emit(enemy.x, enemy.y, 5, PALETTE.blood, 2, 15);
            if (enemy.hp <= 0) {
              enemy.dead = true;
              f.gangRaidKilled++;
              particles.emit(enemy.x, enemy.y, 10, '#ff4400', 3, 20);
            }
            break;
          }
        }
      }
    }
    if (allDead) {
      f.gangRaidActive = false;
      var raidGold = f.gangRaidTotal * 20;
      game.gold += raidGold;
      game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
      showNotification('Gang raid repelled! +$' + raidGold + ' +8 Rep!');
      playSound('playVictory');
      playSound('playCheer');
      addJournalEntry('Defeated an outlaw gang of ' + f.gangRaidTotal + '. Earned $' + raidGold + '.');
    }
  }

  // ── 8. DROUGHT EVENT ──
  f.droughtTimer += dt;
  if (!f.droughtActive && !f.tornadoActive && f.droughtTimer > 300) {
    f.droughtTimer = 0;
    if (Math.random() < 0.03) {
      f.droughtActive = true;
      f.droughtLife = 60;
      showNotification('DROUGHT! Water is drying up. Prices increase.');
      addJournalEntry('A drought has hit the area. Water sources dried up temporarily.');
    }
  }
  if (f.droughtActive) {
    f.droughtLife -= dt;
    if (f.droughtLife <= 0) {
      f.droughtActive = false;
      showNotification('The drought has ended. Water returns to normal.');
    }
  }

  // ── 9. SALOON PIANO ──
  if (!f.pianoActive && game.state === 'playing' && findBuilding(BUILDING_TYPES.SALOON)) {
    // P key is used by newspaper in features.js, use Digit8 area or check if near saloon specifically
    // We'll use a combo: must be near saloon + press specific unused key combo
    // Actually, just check near saloon specifically
    if (consumeKey('KeyP') && findBuilding(BUILDING_TYPES.SALOON)) {
      f.pianoActive = true;
      f.pianoScore = 0;
      f.pianoCombo = 0;
      f.pianoTimer = 30;
      f.pianoNotes = [];
      var song = PIANO_SONGS[rand(0, PIANO_SONGS.length - 1)];
      for (var pni = 0; pni < song.length; pni++) {
        f.pianoNotes.push({ lane: song[pni], time: 1.5 + pni * 1.4, hit: false, missed: false });
      }
      showNotification('Piano mini-game! Press 1-4 to hit the notes!');
      playSound('playDing');
    }
  }
  if (f.pianoActive) {
    f.pianoTimer -= dt;
    // Move notes down
    for (var pn = 0; pn < f.pianoNotes.length; pn++) {
      var note = f.pianoNotes[pn];
      note.time -= dt;
      // Check hit window
      if (!note.hit && !note.missed && note.time < 0.3 && note.time > -0.3) {
        if (consumeKey('Digit' + (note.lane + 1))) {
          note.hit = true;
          f.pianoCombo++;
          var mult = Math.min(f.pianoCombo, 5);
          f.pianoScore += 10 * mult;
          playSound('playDing');
          particles.emit(
            gameCanvas.width / 2 - 90 + note.lane * 60,
            gameCanvas.height - 100,
            5, PALETTE.gold, 2, 10
          );
        }
      }
      if (!note.hit && note.time < -0.4) {
        note.missed = true;
        f.pianoCombo = 0;
      }
    }
    if (f.pianoTimer <= 0) {
      f.pianoActive = false;
      var pianoGold = Math.floor(f.pianoScore / 5);
      game.gold += pianoGold;
      showNotification('Piano finished! Score: ' + f.pianoScore + ' | Earned $' + pianoGold);
      if (pianoGold > 30) playSound('playCheer');
    }
  }

  // ── 10. CATTLE DRIVE ──
  if (!f.cattleDriveActive && game.state === 'playing' && findBuilding(BUILDING_TYPES.STABLE) && consumeKey('KeyC')) {
    f.cattleDriveActive = true;
    f.cattleDelivered = 0;
    f.cattle = [];
    var stableB = findBuilding(BUILDING_TYPES.STABLE);
    for (var ci = 0; ci < 5; ci++) {
      f.cattle.push({
        x: stableB.x + rand(-60, 60),
        y: stableB.y + stableB.h * TILE + rand(20, 80),
        dx: 0, dy: 0, wanderTimer: 0
      });
    }
    // Target: opposite side of map
    f.cattleTarget.x = p.x < WORLD_W / 2 ? WORLD_W - 100 : 100;
    f.cattleTarget.y = rand(200, WORLD_H - 200);
    showNotification('Cattle drive started! Herd 5 cattle to the delivery point. Stay close to them!');
    addJournalEntry('Started a cattle drive. $15 per cow delivered.');
  }
  if (f.cattleDriveActive) {
    var deliveredAll = true;
    for (var cci = 0; cci < f.cattle.length; cci++) {
      var cow = f.cattle[cci];
      if (!cow) continue;
      // Wander randomly
      cow.wanderTimer -= dt;
      if (cow.wanderTimer <= 0) {
        cow.wanderTimer = randF(1, 3);
        cow.dx = randF(-0.8, 0.8);
        cow.dy = randF(-0.8, 0.8);
      }
      // If player is close, push cow away from player toward target
      var cowDist = Math.hypot(p.x - cow.x, p.y - cow.y);
      if (cowDist < 80 && cowDist > 10) {
        var pushX = cow.x - p.x, pushY = cow.y - p.y;
        var pushLen = Math.hypot(pushX, pushY);
        // Blend push direction with target direction
        var tgtX = f.cattleTarget.x - cow.x, tgtY = f.cattleTarget.y - cow.y;
        var tgtLen = Math.hypot(tgtX, tgtY);
        if (pushLen > 0 && tgtLen > 0) {
          cow.dx = (pushX / pushLen * 0.5 + tgtX / tgtLen * 0.5) * 1.2;
          cow.dy = (pushY / pushLen * 0.5 + tgtY / tgtLen * 0.5) * 1.2;
        }
      }
      cow.x += cow.dx;
      cow.y += cow.dy;
      cow.x = clamp(cow.x, 20, WORLD_W - 20);
      cow.y = clamp(cow.y, 20, WORLD_H - 20);
      // Check delivery
      if (Math.hypot(cow.x - f.cattleTarget.x, cow.y - f.cattleTarget.y) < 50) {
        f.cattle[cci] = null;
        f.cattleDelivered++;
        game.gold += 15;
        showNotification('Cow delivered! +$15 (' + f.cattleDelivered + '/5)');
        playSound('playDing');
      } else {
        deliveredAll = false;
      }
    }
    // Remove nulls
    if (deliveredAll || f.cattleDelivered >= 5) {
      f.cattleDriveActive = false;
      showNotification('Cattle drive complete! Delivered ' + f.cattleDelivered + ' cows for $' + (f.cattleDelivered * 15));
      if (f.cattleDelivered >= 5) { playSound('playCheer'); game.reputation = clamp(game.reputation + 3, 0, REPUTATION_MAX); }
      addJournalEntry('Completed a cattle drive. Delivered ' + f.cattleDelivered + '/5 cows.');
    }
  }

  // ── 11. TUMBLEWEED RACING ──
  if (!f.twRaceActive && game.state === 'playing' && findBuilding(BUILDING_TYPES.WELL) && consumeKey('KeyT')) {
    if (game.gold >= 10) {
      game.gold -= 10;
      f.twRaceActive = true;
      f.twRaceFinished = false;
      f.twRaceTimer = 0;
      f.twRaceBet = rand(0, 3);
      f.twRacers = [];
      for (var tri = 0; tri < 4; tri++) {
        f.twRacers.push({
          x: 50,
          y: 0, // assigned in render
          speed: randF(1.5, 3.5),
          boostTimer: randF(2, 6),
          finished: false,
          place: 0
        });
      }
      showNotification('Tumbleweed race! You bet $10 on #' + (f.twRaceBet + 1) + '. Go!');
    } else {
      showNotification('Tumbleweed racing costs $10. Not enough gold!');
    }
  }
  if (f.twRaceActive) {
    f.twRaceTimer += dt;
    var placesGiven = 0;
    for (var rr = 0; rr < f.twRacers.length; rr++) {
      if (f.twRacers[rr].place > 0) placesGiven++;
    }
    for (var ri = 0; ri < f.twRacers.length; ri++) {
      var racer = f.twRacers[ri];
      if (racer.finished) continue;
      racer.boostTimer -= dt;
      var spd = racer.speed;
      if (racer.boostTimer <= 0) {
        spd *= 2;
        if (racer.boostTimer < -0.5) racer.boostTimer = randF(2, 5);
      }
      racer.x += spd * dt * 60;
      if (racer.x >= gameCanvas.width - 80) {
        racer.finished = true;
        racer.place = placesGiven + 1;
        placesGiven++;
      }
    }
    var allFinished = true;
    for (var rf = 0; rf < f.twRacers.length; rf++) {
      if (!f.twRacers[rf].finished) allFinished = false;
    }
    if (allFinished && !f.twRaceFinished) {
      f.twRaceFinished = true;
      // Find winner
      var winner = -1;
      for (var rw = 0; rw < f.twRacers.length; rw++) {
        if (f.twRacers[rw].place === 1) winner = rw;
      }
      if (winner === f.twRaceBet) {
        game.gold += 40;
        showNotification('Your tumbleweed #' + (f.twRaceBet + 1) + ' won! +$40!');
        playSound('playCheer');
      } else {
        showNotification('Tumbleweed #' + (winner + 1) + ' won. Better luck next time!');
        playSound('playBad');
      }
      // Auto-close after a moment
      setTimeout(function() { f.twRaceActive = false; }, 2000);
    }
  }

  // ── 12. SHOOTING GALLERY ──
  if (!f.sgActive && game.state === 'playing' && findBuilding(BUILDING_TYPES.GALLOWS) && consumeKey('KeyX')) {
    if (game.gold >= 5) {
      game.gold -= 5;
      f.sgActive = true;
      f.sgScore = 0;
      f.sgTimer = 20;
      f.sgShots = 0;
      f.sgHits = 0;
      f.sgTargets = [];
      showNotification('Shooting gallery! Click SPACE to shoot targets! 20 seconds!');
    } else {
      showNotification('Shooting gallery costs $5!');
    }
  }
  if (f.sgActive) {
    f.sgTimer -= dt;
    // Spawn targets
    if (Math.random() < 0.08) {
      f.sgTargets.push({
        x: rand(100, gameCanvas.width - 100),
        y: rand(80, gameCanvas.height - 150),
        life: randF(1.0, 2.5),
        size: rand(15, 30),
        hit: false
      });
    }
    // Update targets
    wi = 0;
    for (var tgi = 0; tgi < f.sgTargets.length; tgi++) {
      var tgt = f.sgTargets[tgi];
      tgt.life -= dt;
      if (tgt.life > 0 && !tgt.hit) f.sgTargets[wi++] = tgt;
    }
    f.sgTargets.length = wi;
    // Shoot
    if (consumeKey('Space')) {
      f.sgShots++;
      playSound('playGunshot');
      // Check if we hit a target (closest to center of screen)
      var cx = gameCanvas.width / 2, cy = gameCanvas.height / 2;
      var bestTgt = -1, bestTgtD = 40;
      for (var th = 0; th < f.sgTargets.length; th++) {
        var td = Math.hypot(f.sgTargets[th].x - cx, f.sgTargets[th].y - cy);
        if (td < f.sgTargets[th].size + 15 && td < bestTgtD) {
          bestTgtD = td;
          bestTgt = th;
        }
      }
      if (bestTgt >= 0) {
        f.sgTargets[bestTgt].hit = true;
        f.sgHits++;
        f.sgScore += 10;
        particles.emit(f.sgTargets[bestTgt].x + game.camera.x, f.sgTargets[bestTgt].y + game.camera.y, 8, '#ff6600', 2, 15);
        playSound('playDing');
      }
    }
    if (f.sgTimer <= 0) {
      f.sgActive = false;
      var sgPrize = f.sgScore;
      var accuracy = f.sgShots > 0 ? Math.round(f.sgHits / f.sgShots * 100) : 0;
      game.gold += sgPrize;
      if (f.sgHits >= 8) { game.ammo = Math.min(game.ammo + 12, 99); showNotification('Bonus: +12 ammo for great shooting!'); }
      showNotification('Gallery done! Hits: ' + f.sgHits + ' Accuracy: ' + accuracy + '% | +$' + sgPrize);
      if (accuracy >= 70) playSound('playCheer');
      addJournalEntry('Shooting gallery: ' + f.sgHits + ' hits, ' + accuracy + '% accuracy.');
    }
  }

  // ── 13. DYNAMITE FISHING ──
  if (f.dynFishCooldown > 0) f.dynFishCooldown -= dt;
  if (game._features && game._features.dynamiteCount > 0 && f.dynFishCooldown <= 0 && game.state === 'playing' && consumeKey('KeyD')) {
    // Check near water
    var pfx = Math.floor(p.x / TILE);
    var pfy = Math.floor(p.y / TILE);
    var nearWaterD = false;
    for (var dfw = -2; dfw <= 2; dfw++) {
      for (var dfh = -2; dfh <= 2; dfh++) {
        var wx = pfx + dfw, wy = pfy + dfh;
        if (wx >= 0 && wx < MAP_W && wy >= 0 && wy < MAP_H && game.map[wy][wx] === 5) nearWaterD = true;
      }
    }
    if (nearWaterD) {
      game._features.dynamiteCount--;
      f.dynFishCooldown = 10;
      playSound('playExplosion');
      particles.emit(p.x, p.y + 20, 25, '#ff6600', 4, 25);
      particles.emit(p.x, p.y + 20, 15, '#4a6a8a', 3, 20);
      var fishCount = rand(3, 5);
      var fishGold2 = fishCount * rand(8, 15);
      game.gold += fishGold2;
      game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
      showNotification('BOOM! Caught ' + fishCount + ' fish with dynamite! +$' + fishGold2 + ' but -5 Rep (illegal!)');
      addJournalEntry('Used dynamite fishing. Caught ' + fishCount + ' fish. Lost 5 reputation.');
    }
  }

  // ── 14. STAGECOACH ESCORT ──
  f.escortTimer += dt;
  if (!f.escortActive && f.escortTimer > DAY_LENGTH * 5 && game.dayCount >= 2) {
    f.escortTimer = 0;
    if (Math.random() < 0.5) {
      f.escortActive = true;
      f.escortHP = 10;
      var fromLeft = Math.random() < 0.5;
      f.escortCoach = {
        x: fromLeft ? 30 : WORLD_W - 30,
        y: WORLD_H / 2 + randF(-200, 200),
        targetX: fromLeft ? WORLD_W - 30 : 30,
        speed: 1.5
      };
      f.escortBandits = [];
      for (var eb = 0; eb < 4; eb++) {
        f.escortBandits.push({
          x: f.escortCoach.x + randF(-200, 200),
          y: f.escortCoach.y + randF(-200, 200),
          hp: 3, dead: false,
          shootTimer: randF(2, 4)
        });
      }
      showNotification('ESCORT MISSION: Protect the stagecoach! ($150 reward)');
      playSound('playBellAlarm');
      addJournalEntry('Stagecoach escort mission started. Reward: $150.');
    }
  }
  if (f.escortActive) {
    var coach = f.escortCoach;
    // Move coach
    var cdx = coach.targetX - coach.x;
    var clen = Math.abs(cdx);
    if (clen > 5) {
      coach.x += (cdx > 0 ? 1 : -1) * coach.speed;
    } else {
      // Arrived!
      f.escortActive = false;
      game.gold += 150;
      game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Stagecoach delivered safely! +$150 +5 Rep!');
      playSound('playVictory');
      addJournalEntry('Successfully escorted stagecoach. Earned $150.');
    }
    // Bandits attack coach
    for (var bdi = 0; bdi < f.escortBandits.length; bdi++) {
      var bandit = f.escortBandits[bdi];
      if (bandit.dead) continue;
      // Move toward coach
      var bcdx = coach.x - bandit.x, bcdy = coach.y - bandit.y;
      var bclen = Math.hypot(bcdx, bcdy);
      if (bclen > 40) {
        bandit.x += (bcdx / bclen) * 1.5;
        bandit.y += (bcdy / bclen) * 1.5;
      }
      // Shoot at coach
      bandit.shootTimer -= dt;
      if (bandit.shootTimer <= 0 && bclen < 200) {
        bandit.shootTimer = randF(2, 4);
        f.escortHP -= 1;
        particles.emit(coach.x, coach.y, 3, PALETTE.wood, 2, 10);
        if (f.escortHP <= 0) {
          f.escortActive = false;
          showNotification('The stagecoach was destroyed! Mission failed.');
          playSound('playBad');
          addJournalEntry('Failed to protect the stagecoach.');
        }
      }
      // Check player bullets
      if (typeof bullets !== 'undefined') {
        for (var bb = 0; bb < bullets.bullets.length; bb++) {
          var bul = bullets.bullets[bb];
          if (bul.fromPlayer && Math.hypot(bul.x - bandit.x, bul.y - bandit.y) < 20) {
            bandit.hp -= 1;
            bul.life = 0;
            particles.emit(bandit.x, bandit.y, 5, PALETTE.blood, 2, 12);
            if (bandit.hp <= 0) {
              bandit.dead = true;
              particles.emit(bandit.x, bandit.y, 8, '#ff4400', 3, 15);
            }
            break;
          }
        }
      }
    }
  }

  // ── 15. MOONSHINE BUST ──
  f.moonshineTimer += dt;
  if (!f.moonshineTip && f.moonshineTimer > DAY_LENGTH * 4 && game.dayCount >= 2) {
    f.moonshineTimer = 0;
    f.moonshineTip = true;
    f.moonshineX = rand(100, WORLD_W - 100);
    f.moonshineY = rand(100, WORLD_H - 100);
    f.moonshineFound = false;
    showNotification('TIP: Moonshine still spotted! Look for smoke near the edge of town.');
    addJournalEntry('Received tip about illegal moonshine operation.');
  }
  if (f.moonshineTip && !f.moonshineFound) {
    if (Math.hypot(p.x - f.moonshineX, p.y - f.moonshineY) < 50 && consumeKey('KeyE')) {
      f.moonshineFound = true;
      // Choice: destroy or bribe
      var destroy = Math.random() < 0.6; // auto-choose for simplicity, or use dialog
      if (destroy) {
        game.gold += 40;
        game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
        showNotification('Moonshine still destroyed! +$40 +5 Rep');
        playSound('playExplosion');
        particles.emit(f.moonshineX, f.moonshineY, 20, '#ff6600', 4, 25);
      } else {
        game.gold += 80;
        game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
        showNotification('Took the bribe. +$80 but -5 Rep');
        playSound('playDing');
      }
      f.moonshineTip = false;
      addJournalEntry('Resolved moonshine bust.');
    }
  }

  // ── 16. CAMPFIRE STORIES ──
  f.campfireStoryCooldown -= dt;
  if (!f.campfireStoryShow && isNight() && game._features && game._features.campfires) {
    for (var cfi = 0; cfi < game._features.campfires.length; cfi++) {
      var cf = game._features.campfires[cfi];
      if (Math.hypot(p.x - cf.x, p.y - cf.y) < 50) {
        f.campfireStoryReady = true;
        break;
      }
    }
  }
  if (f.campfireStoryReady && f.campfireStoryCooldown <= 0 && consumeKey('KeyE')) {
    f.campfireStoryReady = false;
    f.campfireStoryShow = true;
    f.campfireStoryTimer = 8;
    f.campfireStoryText = CAMPFIRE_STORIES[rand(0, CAMPFIRE_STORIES.length - 1)];
    f.campfireStoryCooldown = 60;
    showNotification('Story: ' + f.campfireStoryText);
    addJournalEntry('Campfire story: ' + f.campfireStoryText);
    // Boost NPC morale
    if (game._features) game._features.npcMorale = Math.min((game._features.npcMorale || 50) + 5, 100);
    playSound('playDing');
  }
  if (f.campfireStoryShow) {
    f.campfireStoryTimer -= dt;
    if (f.campfireStoryTimer <= 0) f.campfireStoryShow = false;
  }

  // ── 17. EAGLE EYE MODE ──
  if (f.eagleEyeCooldown > 0) f.eagleEyeCooldown -= dt;
  if (!f.eagleEyeActive && f.eagleEyeCooldown <= 0 && game.state === 'playing' && consumeKey('KeyZ')) {
    if (game.ammo > 0) {
      game.ammo--;
      f.eagleEyeActive = true;
      f.eagleEyeTimer = 3;
      showNotification('EAGLE EYE activated! Enemies glow red, treasures glow gold.');
      playSound('playDuelDraw');
    } else {
      showNotification('Need 1 ammo to activate Eagle Eye!');
    }
  }
  if (f.eagleEyeActive) {
    f.eagleEyeTimer -= dt;
    if (f.eagleEyeTimer <= 0) {
      f.eagleEyeActive = false;
      f.eagleEyeCooldown = 10;
      showNotification('Eagle Eye wore off. Cooldown: 10s');
    }
  }

  // ── 18. TOWN BELL ──
  if (f.bellCooldown > 0) f.bellCooldown -= dt;
  if (!f.bellRinging && f.bellCooldown <= 0 && game.state === 'playing' && findBuilding(BUILDING_TYPES.CHURCH) && consumeKey('KeyB')) {
    f.bellRinging = true;
    f.bellTimer = 5;
    f.bellCooldown = 120;
    showNotification('TOWN BELL rung! NPCs running indoors. Crime timer paused.');
    playSound('playBellAlarm');
    // Make NPCs flee
    for (var bn = 0; bn < game.npcs.length; bn++) {
      var bnpc = game.npcs[bn];
      if (!bnpc.dead && bnpc.type !== NPC_TYPES.OUTLAW) {
        bnpc.fleeing = true;
        bnpc.fleeTimer = 8;
      }
    }
  }
  if (f.bellRinging) {
    f.bellTimer -= dt;
    if (f.bellTimer <= 0) {
      f.bellRinging = false;
      showNotification('Bell effect ended.');
    }
  }

  // ── 19. WANTED POSTER CREATOR ──
  if (game.state === 'playing' && findBuilding(BUILDING_TYPES.SHERIFF) && consumeKey('KeyW')) {
    // Find a random outlaw NPC that isn't already on a poster
    var candidates = [];
    for (var wn = 0; wn < game.npcs.length; wn++) {
      var wnpc = game.npcs[wn];
      if ((wnpc.type === NPC_TYPES.OUTLAW || wnpc.type === NPC_TYPES.BOUNTY) && !wnpc.dead) {
        var alreadyPosted = false;
        for (var wp = 0; wp < f.wantedPosters.length; wp++) {
          if (f.wantedPosters[wp].name === wnpc.name) alreadyPosted = true;
        }
        if (!alreadyPosted) candidates.push(wnpc);
      }
    }
    if (candidates.length > 0) {
      var target = candidates[rand(0, candidates.length - 1)];
      var bountyAmt = rand(50, 150);
      f.wantedPosters.push({ name: target.name, bounty: bountyAmt });
      showNotification('Created wanted poster for ' + target.name + '! Bounty: $' + bountyAmt);
      addJournalEntry('Posted wanted poster: ' + target.name + ' ($' + bountyAmt + ')');
      playSound('playDing');
    } else {
      showNotification('No outlaws to create posters for right now.');
    }
  }

  // ── 20. OUTLAW DISGUISE ──
  if (game.state === 'playing' && findBuilding(BUILDING_TYPES.GENERAL) && !f.disguiseOwned && consumeKey('KeyO')) {
    if (game.gold >= 50) {
      game.gold -= 50;
      f.disguiseOwned = true;
      showNotification('Bought outlaw disguise for $50! Press O to toggle.');
    } else {
      showNotification('Disguise costs $50!');
    }
  }
  if (f.disguiseOwned && !findBuilding(BUILDING_TYPES.GENERAL) && consumeKey('KeyO')) {
    f.disguiseActive = !f.disguiseActive;
    if (f.disguiseActive) {
      showNotification('Disguise ON. Outlaws won\'t attack. You can\'t arrest anyone.');
    } else {
      showNotification('Disguise OFF. Back to being the Sheriff.');
    }
  }
  // Break disguise on shooting
  if (f.disguiseActive && typeof bullets !== 'undefined') {
    for (var db2 = 0; db2 < bullets.bullets.length; db2++) {
      if (bullets.bullets[db2].fromPlayer) {
        f.disguiseActive = false;
        showNotification('Disguise blown! You fired your weapon.');
        break;
      }
    }
  }

  // ── 21. MEDICINE MAN NPC ──
  f.medManTimer += dt;
  if (!f.medManActive && f.medManTimer > DAY_LENGTH * 3 && game.dayCount > f.medManDayLast + 3) {
    f.medManTimer = 0;
    f.medManActive = true;
    f.medManDayLast = game.dayCount;
    var church = null;
    for (var mbi = 0; mbi < game.buildings.length; mbi++) {
      if (game.buildings[mbi].type === BUILDING_TYPES.CHURCH) { church = game.buildings[mbi]; break; }
    }
    if (church) {
      f.medManX = church.x + rand(-50, 50);
      f.medManY = church.y + church.h * TILE + rand(10, 40);
    } else {
      f.medManX = WORLD_W / 2 + rand(-100, 100);
      f.medManY = WORLD_H / 2 + rand(-100, 100);
    }
    showNotification('The Medicine Man has arrived near the church!');
  }
  if (f.medManActive) {
    // Disappears after 1 day
    if (game.dayCount > f.medManDayLast + 1) {
      f.medManActive = false;
    }
    if (Math.hypot(p.x - f.medManX, p.y - f.medManY) < 48 && consumeKey('KeyE')) {
      // Sell items in priority order based on what player needs
      if (f.snakeBitten && game.gold >= 15) {
        game.gold -= 15;
        f.snakeBitten = false;
        f.snakePoisonTicks = 0;
        showNotification('Medicine Man: Snake Antivenom applied! (-$15)');
        playSound('playDing');
      } else if (p.hp < p.maxHp && game.gold >= 10) {
        game.gold -= 10;
        p.hp = Math.min(p.hp + 2, p.maxHp);
        showNotification('Medicine Man: Healing Herbs! +2 HP (-$10)');
        playSound('playDing');
      } else if (game.gold >= 20 && f.staminaTimer <= 0) {
        game.gold -= 20;
        f.staminaTimer = 30;
        showNotification('Medicine Man: Stamina Tonic! 2x speed for 30s (-$20)');
        playSound('playDing');
      } else if (game.gold >= 30 && f.luckyCharmTimer <= 0) {
        game.gold -= 30;
        f.luckyCharmTimer = DAY_LENGTH;
        showNotification('Medicine Man: Lucky Charm! +10% gold for 1 day (-$30)');
        playSound('playVictory');
      } else {
        showNotification('Medicine Man: "Come back with more gold, friend."');
      }
    }
  }
  // Stamina tonic effect
  if (f.staminaTimer > 0) {
    f.staminaTimer -= dt;
    p.speed = PLAYER_SPEED * 2;
    if (f.staminaTimer <= 0) {
      p.speed = PLAYER_SPEED;
      showNotification('Stamina tonic wore off.');
    }
  }
  // Lucky charm effect handled in gold additions (checked in loot crate, etc.)

  // ── 22. TOWN ELECTION ──
  if (!f.electionActive && game.dayCount >= f.electionDay) {
    f.electionActive = true;
    f.electionVotes = 0;
    f.electionOpponent = rand(30, 60);
    showNotification('TOWN ELECTION today! Campaign near the church (press E) to win votes!');
    addJournalEntry('Town election started. Need more votes than opponent (' + f.electionOpponent + ').');
  }
  if (f.electionActive) {
    if (findBuilding(BUILDING_TYPES.CHURCH) && consumeKey('KeyE')) {
      f.electionVotes += rand(5, 15);
      game.reputation = clamp(game.reputation + 1, 0, REPUTATION_MAX);
      showNotification('Campaigned! Votes: ' + f.electionVotes + ' (need > ' + f.electionOpponent + ')');
    }
    // End election at night
    if (game.time > 0.79 && f.electionActive) {
      f.electionActive = false;
      f.electionDay = game.dayCount + 15;
      if (f.electionVotes > f.electionOpponent) {
        var electionGold = rand(50, 100);
        game.gold += electionGold;
        game.reputation = clamp(game.reputation + 10, 0, REPUTATION_MAX);
        showNotification('YOU WON the election! +$' + electionGold + ' from town treasury! +10 Rep');
        playSound('playVictory');
        addJournalEntry('Won the town election! Earned $' + electionGold + '.');
      } else {
        showNotification('You lost the election. Next one in 15 days.');
        playSound('playBad');
        addJournalEntry('Lost the town election.');
      }
    }
  }

  // ── 23. PROSPECTING CLAIMS ──
  f.claimIncomeTimer += dt;
  if (f.claimIncomeTimer > DAY_LENGTH) {
    f.claimIncomeTimer = 0;
    var claimIncome = 0;
    wi = 0;
    for (var cli = 0; cli < f.claims.length; cli++) {
      var claim = f.claims[cli];
      // 10% chance of being robbed
      if (Math.random() < 0.1) {
        showNotification('Claim at (' + Math.floor(claim.x / TILE) + ',' + Math.floor(claim.y / TILE) + ') was robbed!');
        continue; // remove claim
      }
      var income = rand(5, 15);
      claimIncome += income;
      f.claims[wi++] = claim;
    }
    f.claims.length = wi;
    if (claimIncome > 0) {
      var bonus = f.luckyCharmTimer > 0 ? Math.floor(claimIncome * 0.1) : 0;
      game.gold += claimIncome + bonus;
      showNotification('Prospecting income: +$' + (claimIncome + bonus));
    }
  }
  // Stake a claim at map edge
  if (game.state === 'playing' && f.claims.length < 3) {
    var atEdge = (p.x < 100 || p.x > WORLD_W - 100 || p.y < 100 || p.y > WORLD_H - 100);
    if (atEdge && consumeKey('KeyE')) {
      // Check not too close to existing claims
      var tooClose = false;
      for (var ce = 0; ce < f.claims.length; ce++) {
        if (Math.hypot(p.x - f.claims[ce].x, p.y - f.claims[ce].y) < 200) tooClose = true;
      }
      if (!tooClose && game.gold >= 30) {
        game.gold -= 30;
        f.claims.push({ x: p.x, y: p.y });
        showNotification('Staked a prospecting claim! (-$30) Income: $5-15/day. (' + f.claims.length + '/3)');
        addJournalEntry('Staked prospecting claim #' + f.claims.length + '.');
      }
    }
  }

  // ── 24. TUMBLEWEED PET ──
  if (!f.twPetActive && !f.goldenTWSpawned && game.dayCount >= 3 && Math.random() < 0.0001) {
    f.goldenTWSpawned = true;
    f.goldenTWX = rand(100, WORLD_W - 100);
    f.goldenTWY = rand(100, WORLD_H - 100);
    showNotification('A GOLDEN TUMBLEWEED has appeared somewhere on the map!');
  }
  if (f.goldenTWSpawned && !f.twPetActive) {
    if (Math.hypot(p.x - f.goldenTWX, p.y - f.goldenTWY) < 30) {
      f.twPetActive = true;
      f.goldenTWSpawned = false;
      f.twPetX = p.x;
      f.twPetY = p.y;
      showNotification('You adopted the Golden Tumbleweed! It follows you and finds gold!');
      playSound('playVictory');
      addJournalEntry('Adopted a golden tumbleweed pet!');
    }
  }
  if (f.twPetActive) {
    // Follow player with slight lag
    var petDx = p.x - 30 - f.twPetX, petDy = p.y - 30 - f.twPetY;
    f.twPetX += petDx * 0.05;
    f.twPetY += petDy * 0.05;
    // Find gold nuggets
    f.twPetGoldTimer += dt;
    if (f.twPetGoldTimer > 20) {
      f.twPetGoldTimer = 0;
      var nugget = rand(1, 5);
      var bonus2 = f.luckyCharmTimer > 0 ? 1 : 0;
      game.gold += nugget + bonus2;
      particles.emit(f.twPetX, f.twPetY, 3, PALETTE.gold, 2, 12);
      showNotification('Tumbleweed pet found $' + (nugget + bonus2) + '!');
    }
    // Distract enemies
    for (var eni = 0; eni < game.npcs.length; eni++) {
      var enpc = game.npcs[eni];
      if (enpc.type === NPC_TYPES.OUTLAW && !enpc.dead && Math.hypot(enpc.x - f.twPetX, enpc.y - f.twPetY) < 60) {
        // Slow enemy
        enpc.speed = 0.5;
      }
    }
  }

  // ── 25. LEGENDARY OUTLAWS ──
  f.legendaryTimer += dt;
  if (!f.legendaryActive && f.legendaryTimer > DAY_LENGTH * 15 && game.dayCount >= f.legendaryDay && f.legendaryIndex < LEGENDARY_OUTLAWS.length) {
    f.legendaryTimer = 0;
    var lo = LEGENDARY_OUTLAWS[f.legendaryIndex];
    f.legendaryActive = {
      name: lo.name,
      title: lo.title,
      hp: lo.hp,
      maxHp: lo.hp,
      speed: lo.speed,
      bounty: lo.bounty,
      ability: lo.ability,
      color: lo.color,
      x: rand(100, WORLD_W - 100),
      y: rand(100, WORLD_H - 100),
      shootTimer: 2,
      abilityTimer: 5,
      visible: true,
      dead: false
    };
    f.legendaryDay = game.dayCount + 15;
    f.legendaryIndex++;
    showNotification('LEGENDARY OUTLAW: ' + lo.name + ' ' + lo.title + ' has arrived! Bounty: $' + lo.bounty);
    playSound('playBellAlarm');
    addJournalEntry('Legendary outlaw ' + lo.name + ' ' + lo.title + ' appeared!');
  }
  if (f.legendaryActive && !f.legendaryActive.dead) {
    var leg = f.legendaryActive;
    // Move toward player
    var ldx = p.x - leg.x, ldy = p.y - leg.y;
    var llen = Math.hypot(ldx, ldy);
    if (llen > 80) {
      leg.x += (ldx / llen) * leg.speed;
      leg.y += (ldy / llen) * leg.speed;
    }
    // Abilities
    leg.abilityTimer -= dt;
    if (leg.abilityTimer <= 0) {
      leg.abilityTimer = randF(3, 6);
      if (leg.ability === 'teleport') {
        leg.x = p.x + randF(-150, 150);
        leg.y = p.y + randF(-150, 150);
        leg.x = clamp(leg.x, 50, WORLD_W - 50);
        leg.y = clamp(leg.y, 50, WORLD_H - 50);
        particles.emit(leg.x, leg.y, 10, '#aa00ff', 3, 20);
      } else if (leg.ability === 'invisible') {
        leg.visible = !leg.visible;
        if (!leg.visible) particles.emit(leg.x, leg.y, 8, '#888888', 2, 15);
      } else if (leg.ability === 'explosives') {
        // Throw dynamite at player
        particles.emit(p.x, p.y, 15, '#ff6600', 4, 20);
        particles.emit(p.x, p.y, 10, '#ffcc00', 3, 15);
        playSound('playExplosion');
        if (!game._cheatMode && Math.hypot(p.x - leg.x, p.y - leg.y) < 120) {
          p.hp -= 2;
          showNotification(leg.name + ' threw dynamite! -2 HP');
        }
      }
    }
    // Shoot at player
    leg.shootTimer -= dt;
    if (leg.shootTimer <= 0 && llen < 250 && leg.visible) {
      leg.shootTimer = leg.ability === 'rapidfire' ? 0.5 : 2;
      if (typeof bullets !== 'undefined' && llen > 0) {
        bullets.bullets.push({
          x: leg.x, y: leg.y,
          dx: (ldx / llen) * 6, dy: (ldy / llen) * 6,
          fromPlayer: false, life: 2, damage: leg.ability === 'armor' ? 1 : 2
        });
        playSound('playGunshot');
      }
    }
    // Check player bullets
    if (typeof bullets !== 'undefined') {
      for (var lb = 0; lb < bullets.bullets.length; lb++) {
        var lbul = bullets.bullets[lb];
        if (lbul.fromPlayer && Math.hypot(lbul.x - leg.x, lbul.y - leg.y) < 22) {
          var dmg = 1;
          if (f.eagleEyeActive) dmg = 2;
          if (f.dualPistolActive) dmg += 1;
          if (leg.ability === 'armor') dmg = Math.max(1, dmg - 1);
          leg.hp -= dmg;
          lbul.life = 0;
          particles.emit(leg.x, leg.y, 5, PALETTE.blood, 2, 15);
          if (leg.hp <= 0) {
            leg.dead = true;
            var lbounty = leg.bounty;
            var bonus3 = f.luckyCharmTimer > 0 ? Math.floor(lbounty * 0.1) : 0;
            game.gold += lbounty + bonus3;
            game.reputation = clamp(game.reputation + 15, 0, REPUTATION_MAX);
            showNotification('LEGENDARY OUTLAW ' + leg.name + ' defeated! +$' + (lbounty + bonus3) + ' +15 Rep!');
            playSound('playVictory');
            playSound('playCheer');
            particles.emit(leg.x, leg.y, 25, PALETTE.gold, 4, 30);
            addJournalEntry('Defeated legendary outlaw: ' + leg.name + ' ' + leg.title + '. Bounty: $' + lbounty + '.');
            // Feature 30: drop loot crate
            f.lootCrates.push({ x: leg.x, y: leg.y, life: 60, legendary: true });
          }
          break;
        }
      }
    }
  }

  // ── 26. DUAL PISTOL MODE ──
  if (!f.dualPistolUnlocked && game.outlawsKilled >= 25) {
    f.dualPistolUnlocked = true;
    showNotification('DUAL PISTOLS unlocked! Press 5 to toggle. Fires 2 bullets, costs 2 ammo.');
    addJournalEntry('Unlocked dual pistols after eliminating 25 outlaws.');
  }
  if (f.dualPistolUnlocked && consumeKey('Digit5')) {
    f.dualPistolActive = !f.dualPistolActive;
    showNotification('Dual Pistols: ' + (f.dualPistolActive ? 'ON' : 'OFF'));
  }
  // Dual pistol effect: hook into bullet system
  if (f.dualPistolActive && typeof bullets !== 'undefined') {
    // Check for new player bullets and duplicate them
    var bArr = bullets.bullets;
    var newBullets = [];
    for (var dpi = 0; dpi < bArr.length; dpi++) {
      var dpb = bArr[dpi];
      if (dpb.fromPlayer && dpb._noDupe === undefined && dpb.life > 1.9) {
        dpb._noDupe = true;
        // Add offset bullet
        newBullets.push({
          x: dpb.x + randF(-5, 5), y: dpb.y + randF(-5, 5),
          dx: dpb.dx + randF(-0.3, 0.3), dy: dpb.dy + randF(-0.3, 0.3),
          fromPlayer: true, life: dpb.life, damage: dpb.damage || 1,
          _noDupe: true
        });
        // Cost extra ammo
        if (game.ammo > 0) game.ammo--;
      }
    }
    for (var nbi = 0; nbi < newBullets.length; nbi++) bArr.push(newBullets[nbi]);
  }

  // ── 27. SHIELD SYSTEM ──
  if (!f.shieldOwned && game.state === 'playing' && findBuilding(BUILDING_TYPES.BLACKSMITH) && consumeKey('KeyE')) {
    // Check if player can afford (only trigger if they don't have other interactions pending)
    if (game.gold >= 100 && !f.shieldOwned) {
      // This might conflict with other E interactions — we gate it behind Blacksmith proximity
      // Actually, let's not consume the key for everything — use a different check
    }
  }
  // Alternative: shield auto-purchased from blacksmith shop (already has shop UI)
  // Instead, check if player has spent $100 at blacksmith
  if (!f.shieldOwned && game.gold >= 100 && findBuilding(BUILDING_TYPES.BLACKSMITH) && consumeKey('Digit9')) {
    game.gold -= 100;
    f.shieldOwned = true;
    f.shieldHP = 1;
    showNotification('Sheriff\'s Badge Shield purchased! Absorbs 1 hit. Regens after 30s.');
    addJournalEntry('Purchased badge shield upgrade from the blacksmith.');
    playSound('playDing');
  }
  if (f.shieldOwned && f.shieldHP <= 0) {
    f.shieldRegenTimer += dt;
    if (f.shieldRegenTimer >= 30) {
      f.shieldHP = 1;
      f.shieldRegenTimer = 0;
      showNotification('Shield regenerated!');
      playSound('playDing');
    }
  }

  // ── 28. BOUNTY STREAK ──
  // Track when outlaws killed/arrested (check game stats periodically)
  if (f.bountyStreakInvTimer > 0) {
    f.bountyStreakInvTimer -= dt;
    if (f.bountyStreakInvTimer <= 0) {
      showNotification('Invincibility from bounty streak wore off.');
    }
  }

  // ── 29. WAR CRY ──
  if (f.warCryCooldown > 0) f.warCryCooldown -= dt;
  if (!f.warCryActive && f.warCryCooldown <= 0 && game.state === 'playing' && consumeKey('KeyY')) {
    f.warCryActive = true;
    f.warCryTimer = 2;
    f.warCryCooldown = 60;
    showNotification('WAR CRY! Nearby enemies stunned!');
    playSound('playBellAlarm');
    // Screen shake
    f.quakeShakeX = 3;
    f.quakeShakeY = 3;
    // Stun enemies
    for (var wci = 0; wci < game.npcs.length; wci++) {
      var wcnpc = game.npcs[wci];
      if (!wcnpc.dead && wcnpc.type === NPC_TYPES.OUTLAW && Math.hypot(wcnpc.x - p.x, wcnpc.y - p.y) < 200) {
        wcnpc.stunTimer = 2;
        wcnpc.speed = 0;
      }
    }
    // Stun gang raid enemies
    if (f.gangRaidActive) {
      for (var wgi = 0; wgi < f.gangRaidEnemies.length; wgi++) {
        if (!f.gangRaidEnemies[wgi].dead && Math.hypot(f.gangRaidEnemies[wgi].x - p.x, f.gangRaidEnemies[wgi].y - p.y) < 200) {
          f.gangRaidEnemies[wgi].shootTimer = 3;
        }
      }
    }
    // Stun legendary
    if (f.legendaryActive && !f.legendaryActive.dead) {
      if (Math.hypot(f.legendaryActive.x - p.x, f.legendaryActive.y - p.y) < 200) {
        f.legendaryActive.shootTimer = 3;
      }
    }
    particles.emit(p.x, p.y, 20, '#ffcc00', 4, 25);
  }
  if (f.warCryActive) {
    f.warCryTimer -= dt;
    if (f.warCryTimer <= 0) {
      f.warCryActive = false;
      f.quakeShakeX = 0;
      f.quakeShakeY = 0;
    }
  }

  // ── 30. LOOT CRATE SYSTEM ──
  // Monitor for killed outlaws — check every 2 seconds
  if (f._slowTick > 2) {
    f._slowTick = 0;
    // Spawn crates near dead NPCs that were outlaws
    for (var lci = 0; lci < game.npcs.length; lci++) {
      var lcnpc = game.npcs[lci];
      if (lcnpc.dead && lcnpc.type === NPC_TYPES.OUTLAW && !lcnpc._lootChecked) {
        lcnpc._lootChecked = true;
        if (Math.random() < 0.3) {
          f.lootCrates.push({ x: lcnpc.x, y: lcnpc.y, life: 45, legendary: false });
        }
        // Bounty streak tracking
        f.bountyStreak++;
        if (f.bountyStreak === 3) { showNotification('BOUNTY STREAK x3! +50% gold!'); playSound('playDing'); }
        if (f.bountyStreak === 5) { game.ammo = Math.min(game.ammo + 12, 99); showNotification('BOUNTY STREAK x5! Free ammo refill!'); playSound('playCheer'); }
        if (f.bountyStreak === 7) { f.bountyStreakInvTimer = 10; showNotification('BOUNTY STREAK x7! INVINCIBLE for 10s!'); playSound('playVictory'); }
      }
    }
  }
  // Collect loot crates
  wi = 0;
  for (var lti = 0; lti < f.lootCrates.length; lti++) {
    var crate = f.lootCrates[lti];
    crate.life -= dt;
    if (Math.hypot(p.x - crate.x, p.y - crate.y) < 28) {
      // Open crate
      var lootRoll = Math.random();
      var lootBonus = f.luckyCharmTimer > 0 ? 1.1 : 1.0;
      if (crate.legendary || lootRoll < 0.05) {
        // Rare: golden gun skin
        showNotification('RARE LOOT: Golden Gun! Permanent +10% damage!');
        playSound('playVictory');
        f._goldenGun = true;
        particles.emit(crate.x, crate.y, 20, PALETTE.gold, 4, 30);
      } else if (lootRoll < 0.25) {
        var lootGold = Math.floor(rand(20, 60) * lootBonus);
        game.gold += lootGold;
        showNotification('Loot: +$' + lootGold + ' gold!');
        playSound('playDing');
      } else if (lootRoll < 0.45) {
        var lootAmmo = rand(6, 18);
        game.ammo = Math.min(game.ammo + lootAmmo, 99);
        showNotification('Loot: +' + lootAmmo + ' ammo!');
        playSound('playDing');
      } else if (lootRoll < 0.60) {
        if (game._features) game._features.dynamiteCount = (game._features.dynamiteCount || 0) + rand(1, 3);
        showNotification('Loot: +Dynamite!');
        playSound('playDing');
      } else if (lootRoll < 0.75) {
        if (game._features) game._features.smokeBombs = (game._features.smokeBombs || 0) + rand(1, 2);
        showNotification('Loot: +Smoke bombs!');
        playSound('playDing');
      } else {
        var lootSupply = rand(10, 30);
        game.gold += Math.floor(lootSupply * lootBonus);
        showNotification('Loot: Supplies worth $' + Math.floor(lootSupply * lootBonus) + '!');
        playSound('playDing');
      }
      particles.emit(crate.x, crate.y, 12, '#cc8844', 3, 20);
      continue;
    }
    if (crate.life > 0) f.lootCrates[wi++] = crate;
  }
  f.lootCrates.length = wi;

  // ── SHIELD DAMAGE INTERCEPT ──
  // Check if player took damage this frame (compare HP)
  if (f.shieldOwned && f.shieldHP > 0 && p.hp < p._prevHP2) {
    // Absorb the hit
    p.hp = p._prevHP2;
    f.shieldHP = 0;
    f.shieldRegenTimer = 0;
    showNotification('Shield absorbed the hit!');
    playSound('playDing');
    particles.emit(p.x, p.y, 10, PALETTE.badge, 3, 20);
  }
  p._prevHP2 = p.hp;

  // ── BOUNTY STREAK INVINCIBILITY ──
  if (f.bountyStreakInvTimer > 0 && p.hp < (p._prevHP3 || p.hp)) {
    p.hp = p._prevHP3;
  }
  p._prevHP3 = p.hp;

  // ── EARTHQUAKE SCREEN SHAKE (apply to camera) ──
  if (f.quakeActive || f.warCryActive) {
    game.camera.x += f.quakeShakeX;
    game.camera.y += f.quakeShakeY;
  }
}

// ============================================================
// RENDER LOGIC
// ============================================================
function renderFeatures2Overlay() {
  var f = game._features2;
  var p = game.player;
  var w = gameCanvas.width;
  var h = gameCanvas.height;

  // ── 1. TORNADO ──
  if (f.tornadoActive) {
    var ts = worldToScreen(f.tornadoX, f.tornadoY);
    // Funnel
    ctx.save();
    ctx.globalAlpha = 0.7;
    var gradient = ctx.createRadialGradient(ts.x, ts.y, 5, ts.x, ts.y, 50);
    gradient.addColorStop(0, '#2a1a0a');
    gradient.addColorStop(0.5, '#5a4a3a');
    gradient.addColorStop(1, 'rgba(90,70,50,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ts.x, ts.y, 50, 0, Math.PI * 2);
    ctx.fill();
    // Spinning lines
    var tAngle = Date.now() * 0.01;
    for (var ti = 0; ti < 8; ti++) {
      var ta = tAngle + ti * 0.785;
      ctx.strokeStyle = 'rgba(80,60,40,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ts.x + Math.cos(ta) * 10, ts.y + Math.sin(ta) * 10);
      ctx.lineTo(ts.x + Math.cos(ta) * 45, ts.y + Math.sin(ta) * 45);
      ctx.stroke();
    }
    ctx.restore();
    // Debris
    ctx.fillStyle = PALETTE.tumbleweed;
    for (var dbi = 0; dbi < f.tornadoDebris.length; dbi++) {
      var deb = f.tornadoDebris[dbi];
      var ds = worldToScreen(deb.x, deb.y);
      ctx.fillRect(ds.x - 2, ds.y - 2, 4, 4);
    }
    // Warning text
    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TORNADO WARNING', w / 2, 50);
    ctx.restore();
  }

  // ── 2. EARTHQUAKE ──
  if (f.quakeActive) {
    ctx.save();
    ctx.fillStyle = 'rgba(139,69,19,0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EARTHQUAKE!', w / 2, 45);
    ctx.restore();
  }
  // Quake drops sparkle
  for (var qri = 0; qri < f.quakeDrops.length; qri++) {
    var qrd = f.quakeDrops[qri];
    var qs = worldToScreen(qrd.x, qrd.y);
    if (qs.x < -20 || qs.x > w + 20 || qs.y < -20 || qs.y > h + 20) continue;
    ctx.fillStyle = PALETTE.gold;
    ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    ctx.beginPath();
    ctx.arc(qs.x, qs.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── 3. MYSTERIOUS STRANGER ──
  if (f.strangerActive) {
    var ss = worldToScreen(f.strangerX, f.strangerY);
    if (ss.x > -30 && ss.x < w + 30 && ss.y > -30 && ss.y < h + 30) {
      ctx.save();
      // Cloak body
      ctx.fillStyle = '#1a0a2a';
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y - 18);
      ctx.lineTo(ss.x - 10, ss.y + 12);
      ctx.lineTo(ss.x + 10, ss.y + 12);
      ctx.closePath();
      ctx.fill();
      // Hood
      ctx.fillStyle = '#2a1040';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y - 14, 8, Math.PI, 0);
      ctx.fill();
      // Glow
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
      ctx.fillStyle = '#aa00ff';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 20, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(ss.x - 4, ss.y - 14, 2, 2);
      ctx.fillRect(ss.x + 2, ss.y - 14, 2, 2);
      // Label
      if (Math.hypot(p.x - f.strangerX, p.y - f.strangerY) < 80) {
        ctx.fillStyle = '#ddccff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Talk to Stranger', ss.x, ss.y - 25);
      }
      ctx.restore();
    }
  }

  // ── 4. SNAKE BITE INDICATOR ──
  if (f.snakeBitten) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(Date.now() * 0.005) * 0.1;
    ctx.fillStyle = '#004400';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#44ff44';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POISONED - Find a doctor!', w / 2, h - 50);
    ctx.restore();
  }

  // ── 5. CARRIER PIGEON ──
  if (f.pigeonActive) {
    var ps2 = worldToScreen(f.pigeonX, f.pigeonY);
    if (ps2.x > -30 && ps2.x < w + 30 && ps2.y > -30 && ps2.y < h + 30) {
      ctx.save();
      // Bird body
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.ellipse(ps2.x, ps2.y, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      var wingAngle = Math.sin(Date.now() * 0.01) * 0.3;
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.ellipse(ps2.x - 5, ps2.y - 3, 5, 2, wingAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ps2.x + 5, ps2.y - 3, 5, 2, -wingAngle, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(ps2.x + 5, ps2.y - 1, 3, 2);
      // Label
      if (Math.hypot(p.x - f.pigeonX, p.y - f.pigeonY) < 80) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Read Message', ps2.x, ps2.y - 15);
      }
      ctx.restore();
    }
  }

  // ── 6. SANDSTORM TREASURES ──
  for (var sti2 = 0; sti2 < f.sandTreasures.length; sti2++) {
    var stc = f.sandTreasures[sti2];
    var sts = worldToScreen(stc.x, stc.y);
    if (sts.x < -20 || sts.x > w + 20 || sts.y < -20 || sts.y > h + 20) continue;
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.008 + sti2) * 0.3;
    ctx.fillStyle = PALETTE.gold;
    var sparkAngle = Date.now() * 0.005;
    for (var sk = 0; sk < 4; sk++) {
      var sa = sparkAngle + sk * 1.57;
      ctx.fillRect(sts.x + Math.cos(sa) * 8 - 1, sts.y + Math.sin(sa) * 8 - 1, 3, 3);
    }
    ctx.fillStyle = '#cc8800';
    ctx.beginPath();
    ctx.arc(sts.x, sts.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── 7. GANG RAID ENEMIES ──
  if (f.gangRaidActive) {
    for (var gri = 0; gri < f.gangRaidEnemies.length; gri++) {
      var ge2 = f.gangRaidEnemies[gri];
      if (ge2.dead) continue;
      var gs = worldToScreen(ge2.x, ge2.y);
      if (gs.x < -20 || gs.x > w + 20 || gs.y < -20 || gs.y > h + 20) continue;
      // Body
      ctx.fillStyle = '#2a0000';
      ctx.fillRect(gs.x - 5, gs.y - 4, 10, 12);
      // Hat
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(gs.x - 7, gs.y - 8, 14, 4);
      ctx.fillRect(gs.x - 4, gs.y - 12, 8, 4);
      // HP bar
      ctx.fillStyle = '#440000';
      ctx.fillRect(gs.x - 8, gs.y - 16, 16, 3);
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(gs.x - 8, gs.y - 16, 16 * (ge2.hp / ge2.maxHp), 3);
    }
    // Raid counter
    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GANG RAID: ' + f.gangRaidKilled + '/' + f.gangRaidTotal + ' eliminated', w / 2, 35);
    ctx.restore();
  }

  // ── 8. DROUGHT ──
  if (f.droughtActive) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#cc8800';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#cc6600';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DROUGHT ' + Math.ceil(f.droughtLife) + 's', w - 10, 35);
    ctx.restore();
  }

  // ── 9. SALOON PIANO ──
  if (f.pianoActive) {
    ctx.save();
    // Background
    ctx.fillStyle = 'rgba(10,5,0,0.85)';
    ctx.fillRect(w / 2 - 150, 60, 300, h - 140);
    // Lanes
    for (var pl = 0; pl < 4; pl++) {
      ctx.fillStyle = pl % 2 === 0 ? 'rgba(60,40,20,0.8)' : 'rgba(80,60,30,0.8)';
      ctx.fillRect(w / 2 - 120 + pl * 60, 80, 55, h - 180);
      // Lane label
      ctx.fillStyle = '#aa9060';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('' + (pl + 1), w / 2 - 93 + pl * 60, h - 80);
    }
    // Hit line
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 125, h - 100);
    ctx.lineTo(w / 2 + 125, h - 100);
    ctx.stroke();
    // Notes
    for (var pni2 = 0; pni2 < f.pianoNotes.length; pni2++) {
      var pn2 = f.pianoNotes[pni2];
      if (pn2.hit || pn2.missed) continue;
      var ny = h - 100 - pn2.time * 200;
      if (ny < 60 || ny > h - 80) continue;
      var nx = w / 2 - 93 + pn2.lane * 60;
      ctx.fillStyle = pn2.time < 0.3 && pn2.time > -0.3 ? '#ffd700' : '#cc8844';
      ctx.beginPath();
      ctx.arc(nx, ny, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a0a00';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('' + (pn2.lane + 1), nx, ny + 4);
    }
    // Score
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PIANO: ' + f.pianoScore + ' pts | Combo x' + f.pianoCombo, w / 2, 75);
    ctx.fillText(Math.ceil(f.pianoTimer) + 's', w / 2, h - 55);
    ctx.restore();
  }

  // ── 10. CATTLE DRIVE ──
  if (f.cattleDriveActive) {
    // Cattle
    for (var cdi = 0; cdi < f.cattle.length; cdi++) {
      var cow2 = f.cattle[cdi];
      if (!cow2) continue;
      var cs = worldToScreen(cow2.x, cow2.y);
      if (cs.x < -20 || cs.x > w + 20 || cs.y < -20 || cs.y > h + 20) continue;
      // Body
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(cs.x - 7, cs.y - 3, 14, 8);
      // Head
      ctx.fillStyle = '#6B3010';
      ctx.fillRect(cs.x + 6, cs.y - 5, 5, 6);
      // Spots
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cs.x - 3, cs.y - 1, 4, 3);
      // Legs
      ctx.fillStyle = '#5a2a10';
      ctx.fillRect(cs.x - 5, cs.y + 5, 2, 4);
      ctx.fillRect(cs.x + 3, cs.y + 5, 2, 4);
    }
    // Target marker
    var cts = worldToScreen(f.cattleTarget.x, f.cattleTarget.y);
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cts.x, cts.y, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00ff00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DELIVERY', cts.x, cts.y - 30);
    ctx.restore();
    // HUD
    ctx.save();
    ctx.fillStyle = '#88cc44';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CATTLE DRIVE: ' + f.cattleDelivered + '/5 delivered', w / 2, h - 40);
    ctx.restore();
  }

  // ── 11. TUMBLEWEED RACE ──
  if (f.twRaceActive) {
    ctx.save();
    ctx.fillStyle = 'rgba(10,5,0,0.9)';
    ctx.fillRect(20, h / 2 - 100, w - 40, 200);
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, h / 2 - 100, w - 40, 200);
    // Finish line
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w - 80, h / 2 - 95);
    ctx.lineTo(w - 80, h / 2 + 95);
    ctx.stroke();
    ctx.setLineDash([]);
    // Racers
    var colors = ['#c8a060', '#aa8040', '#e0b870', '#907030'];
    for (var rci = 0; rci < f.twRacers.length; rci++) {
      var rc = f.twRacers[rci];
      var ry = h / 2 - 70 + rci * 40;
      rc.y = ry; // store for reference
      // Track
      ctx.fillStyle = 'rgba(90,70,50,0.3)';
      ctx.fillRect(40, ry - 12, w - 110, 24);
      // Tumbleweed
      var twAngle = Date.now() * 0.01 + rci;
      ctx.save();
      ctx.translate(rc.x, ry);
      ctx.rotate(twAngle);
      ctx.fillStyle = colors[rci];
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(-8, -2); ctx.lineTo(8, 2);
      ctx.moveTo(-2, -8); ctx.lineTo(2, 8);
      ctx.stroke();
      ctx.restore();
      // Label
      ctx.fillStyle = rci === f.twRaceBet ? '#ffd700' : '#aa9070';
      ctx.font = rci === f.twRaceBet ? 'bold 12px monospace' : '11px monospace';
      ctx.textAlign = 'left';
      var placeStr = rc.place > 0 ? ' (#' + rc.place + ')' : '';
      ctx.fillText('#' + (rci + 1) + (rci === f.twRaceBet ? ' (YOUR BET)' : '') + placeStr, 42, ry + 4);
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUMBLEWEED RACE', w / 2, h / 2 - 85);
    ctx.restore();
  }

  // ── 12. SHOOTING GALLERY ──
  if (f.sgActive) {
    // Targets
    for (var sgi = 0; sgi < f.sgTargets.length; sgi++) {
      var sgt = f.sgTargets[sgi];
      if (sgt.hit) continue;
      ctx.save();
      // Target circle
      ctx.fillStyle = '#cc2200';
      ctx.beginPath();
      ctx.arc(sgt.x, sgt.y, sgt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sgt.x, sgt.y, sgt.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc2200';
      ctx.beginPath();
      ctx.arc(sgt.x, sgt.y, sgt.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Crosshair
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 15, h / 2); ctx.lineTo(w / 2 + 15, h / 2);
    ctx.moveTo(w / 2, h / 2 - 15); ctx.lineTo(w / 2, h / 2 + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // HUD
    ctx.save();
    ctx.fillStyle = '#ff8844';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHOOTING GALLERY | Hits: ' + f.sgHits + ' | Time: ' + Math.ceil(f.sgTimer) + 's | SPACE to shoot', w / 2, 30);
    ctx.restore();
  }

  // ── 14. STAGECOACH ESCORT ──
  if (f.escortActive && f.escortCoach) {
    var ec = f.escortCoach;
    var ecs = worldToScreen(ec.x, ec.y);
    // Coach
    ctx.save();
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(ecs.x - 15, ecs.y - 10, 30, 16);
    ctx.fillStyle = '#4a2e1a';
    ctx.fillRect(ecs.x - 12, ecs.y - 16, 24, 6);
    // Wheels
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ecs.x - 10, ecs.y + 8, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ecs.x + 10, ecs.y + 8, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // HP bar
    ctx.fillStyle = '#440000';
    ctx.fillRect(ecs.x - 15, ecs.y - 22, 30, 4);
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(ecs.x - 15, ecs.y - 22, 30 * (f.escortHP / 10), 4);
    // Bandits
    for (var ebi = 0; ebi < f.escortBandits.length; ebi++) {
      var eb2 = f.escortBandits[ebi];
      if (eb2.dead) continue;
      var ebs = worldToScreen(eb2.x, eb2.y);
      if (ebs.x < -20 || ebs.x > w + 20 || ebs.y < -20 || ebs.y > h + 20) continue;
      ctx.fillStyle = '#440000';
      ctx.fillRect(ebs.x - 4, ebs.y - 4, 8, 10);
      ctx.fillStyle = '#220000';
      ctx.fillRect(ebs.x - 5, ebs.y - 7, 10, 3);
    }
    // HUD
    ctx.save();
    ctx.fillStyle = '#44aaff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESCORT: Coach HP ' + f.escortHP + '/10', w / 2, h - 35);
    ctx.restore();
  }

  // ── 15. MOONSHINE LOCATION ──
  if (f.moonshineTip && !f.moonshineFound) {
    var ms = worldToScreen(f.moonshineX, f.moonshineY);
    if (ms.x > -30 && ms.x < w + 30 && ms.y > -30 && ms.y < h + 30) {
      // Smoke particles
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.003) * 0.15;
      ctx.fillStyle = '#888888';
      for (var smi = 0; smi < 3; smi++) {
        var smokeY = ms.y - 10 - smi * 8 - Math.sin(Date.now() * 0.002 + smi) * 5;
        ctx.beginPath();
        ctx.arc(ms.x + Math.sin(Date.now() * 0.001 + smi) * 5, smokeY, 4 + smi * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Still
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#6b4226';
      ctx.fillRect(ms.x - 8, ms.y - 5, 16, 12);
      ctx.fillStyle = '#888';
      ctx.fillRect(ms.x - 2, ms.y - 10, 4, 6);
      ctx.restore();
      if (Math.hypot(p.x - f.moonshineX, p.y - f.moonshineY) < 80) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Bust Moonshine', ms.x, ms.y - 20);
      }
    }
  }

  // ── 17. EAGLE EYE OVERLAY ──
  if (f.eagleEyeActive) {
    ctx.save();
    // Sepia + slow-mo overlay
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    // Highlight hostile NPCs in red
    for (var ee = 0; ee < game.npcs.length; ee++) {
      var eenpc = game.npcs[ee];
      if (eenpc.dead) continue;
      var ees = worldToScreen(eenpc.x, eenpc.y);
      if (ees.x < -20 || ees.x > w + 20 || ees.y < -20 || ees.y > h + 20) continue;
      if (eenpc.type === NPC_TYPES.OUTLAW || eenpc.type === NPC_TYPES.BOUNTY) {
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.008) * 0.2;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(ees.x, ees.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Highlight loot/treasures in gold
    for (var el = 0; el < f.lootCrates.length; el++) {
      var elc = f.lootCrates[el];
      var els = worldToScreen(elc.x, elc.y);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(els.x, els.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Timer bar
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(w / 2 - 50, 55, 100 * (f.eagleEyeTimer / 3), 4);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EAGLE EYE', w / 2, 52);
    ctx.restore();
  }

  // ── 18. BELL RINGING ──
  if (f.bellRinging) {
    ctx.save();
    var bellAlpha = Math.sin(Date.now() * 0.015) * 0.3 + 0.3;
    ctx.globalAlpha = bellAlpha;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(w / 2, 25, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BELL RINGING ' + Math.ceil(f.bellTimer) + 's', w / 2, 25);
    ctx.restore();
  }

  // ── 20. DISGUISE INDICATOR ──
  if (f.disguiseActive) {
    ctx.save();
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DISGUISED', 10, h - 50);
    // Draw mask over player
    var dps = worldToScreen(p.x, p.y);
    ctx.fillStyle = '#333333';
    ctx.fillRect(dps.x - 5, dps.y - 14, 10, 5);
    ctx.restore();
  }

  // ── 21. MEDICINE MAN ──
  if (f.medManActive) {
    var mms = worldToScreen(f.medManX, f.medManY);
    if (mms.x > -30 && mms.x < w + 30 && mms.y > -30 && mms.y < h + 30) {
      ctx.save();
      // Robe
      ctx.fillStyle = '#228B22';
      ctx.fillRect(mms.x - 6, mms.y - 5, 12, 14);
      // Head
      ctx.fillStyle = PALETTE.skinDark;
      ctx.beginPath();
      ctx.arc(mms.x, mms.y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      // Feather
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(mms.x + 3, mms.y - 18, 2, 8);
      // Bag
      ctx.fillStyle = '#6b4226';
      ctx.fillRect(mms.x - 9, mms.y + 2, 6, 6);
      // Label
      if (Math.hypot(p.x - f.medManX, p.y - f.medManY) < 80) {
        ctx.fillStyle = '#88ff88';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Medicine Man', mms.x, mms.y - 22);
      }
      ctx.restore();
    }
  }

  // ── 22. ELECTION ──
  if (f.electionActive) {
    ctx.save();
    ctx.fillStyle = '#4488cc';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ELECTION | Votes: ' + f.electionVotes + '/' + f.electionOpponent, w - 10, 50);
    ctx.restore();
  }

  // ── 23. PROSPECTING CLAIMS ──
  for (var pci = 0; pci < f.claims.length; pci++) {
    var pc = f.claims[pci];
    var pcs = worldToScreen(pc.x, pc.y);
    if (pcs.x < -20 || pcs.x > w + 20 || pcs.y < -20 || pcs.y > h + 20) continue;
    ctx.save();
    // Flag
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(pcs.x, pcs.y - 15, 2, 15);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(pcs.x + 2, pcs.y - 15, 8, 6);
    ctx.fillStyle = '#1a0a00';
    ctx.font = '6px monospace';
    ctx.fillText('$', pcs.x + 4, pcs.y - 10);
    ctx.restore();
  }

  // ── 24. TUMBLEWEED PET ──
  if (f.goldenTWSpawned && !f.twPetActive) {
    var gts = worldToScreen(f.goldenTWX, f.goldenTWY);
    if (gts.x > -20 && gts.x < w + 20 && gts.y > -20 && gts.y < h + 20) {
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
      ctx.fillStyle = '#ffd700';
      var twAngle2 = Date.now() * 0.005;
      ctx.beginPath();
      ctx.arc(gts.x, gts.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cc8800';
      ctx.lineWidth = 1;
      for (var gt = 0; gt < 4; gt++) {
        var ga = twAngle2 + gt * 1.57;
        ctx.beginPath();
        ctx.moveTo(gts.x + Math.cos(ga) * 3, gts.y + Math.sin(ga) * 3);
        ctx.lineTo(gts.x + Math.cos(ga) * 7, gts.y + Math.sin(ga) * 7);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  if (f.twPetActive) {
    var tps = worldToScreen(f.twPetX, f.twPetY);
    ctx.save();
    var petAngle = Date.now() * 0.008;
    ctx.translate(tps.x, tps.y);
    ctx.rotate(petAngle);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cc9900';
    ctx.lineWidth = 1;
    for (var pti = 0; pti < 4; pti++) {
      var pta = pti * 1.57;
      ctx.beginPath();
      ctx.moveTo(Math.cos(pta) * 2, Math.sin(pta) * 2);
      ctx.lineTo(Math.cos(pta) * 5, Math.sin(pta) * 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 25. LEGENDARY OUTLAW ──
  if (f.legendaryActive && !f.legendaryActive.dead) {
    var lo2 = f.legendaryActive;
    if (lo2.visible) {
      var ls = worldToScreen(lo2.x, lo2.y);
      if (ls.x > -30 && ls.x < w + 30 && ls.y > -30 && ls.y < h + 30) {
        ctx.save();
        // Body
        ctx.fillStyle = lo2.color;
        ctx.fillRect(ls.x - 7, ls.y - 5, 14, 14);
        // Hat
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(ls.x - 9, ls.y - 10, 18, 5);
        ctx.fillRect(ls.x - 5, ls.y - 15, 10, 5);
        // Glow
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.004) * 0.15;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(ls.x, ls.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Name
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lo2.name + ' ' + lo2.title, ls.x, ls.y - 20);
        // HP bar
        ctx.fillStyle = '#440000';
        ctx.fillRect(ls.x - 15, ls.y - 28, 30, 4);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(ls.x - 15, ls.y - 28, 30 * (lo2.hp / lo2.maxHp), 4);
        ctx.restore();
      }
    }
  }

  // ── 26. DUAL PISTOL INDICATOR ──
  if (f.dualPistolActive) {
    ctx.save();
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DUAL PISTOLS', 10, h - 65);
    ctx.restore();
  }

  // ── 27. SHIELD INDICATOR ──
  if (f.shieldOwned) {
    ctx.save();
    ctx.fillStyle = f.shieldHP > 0 ? '#4488ff' : '#444444';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    var shieldText = f.shieldHP > 0 ? 'SHIELD: READY' : 'SHIELD: ' + Math.ceil(30 - f.shieldRegenTimer) + 's';
    ctx.fillText(shieldText, 10, h - 80);
    ctx.restore();
  }

  // ── 28. BOUNTY STREAK ──
  if (f.bountyStreak >= 2) {
    ctx.save();
    ctx.fillStyle = f.bountyStreak >= 7 ? '#ffd700' : f.bountyStreak >= 5 ? '#ff8800' : '#ffcc44';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('STREAK x' + f.bountyStreak, w - 10, 65);
    ctx.restore();
  }
  if (f.bountyStreakInvTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(Date.now() * 0.01) * 0.1;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INVINCIBLE ' + Math.ceil(f.bountyStreakInvTimer) + 's', w / 2, 70);
    ctx.restore();
  }

  // ── 29. WAR CRY ──
  if (f.warCryActive) {
    ctx.save();
    var wcAlpha = f.warCryTimer / 2;
    ctx.globalAlpha = wcAlpha * 0.3;
    var wcGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 200);
    wcGrad.addColorStop(0, '#ffcc00');
    wcGrad.addColorStop(1, 'rgba(255,200,0,0)');
    ctx.fillStyle = wcGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // War cry cooldown
  if (f.warCryCooldown > 0 && f.warCryCooldown < 5) {
    ctx.save();
    ctx.fillStyle = '#ffcc00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('War Cry: ' + Math.ceil(f.warCryCooldown) + 's', 10, h - 95);
    ctx.restore();
  }

  // ── 30. LOOT CRATES ──
  for (var lri = 0; lri < f.lootCrates.length; lri++) {
    var lrc = f.lootCrates[lri];
    var lrs = worldToScreen(lrc.x, lrc.y);
    if (lrs.x < -20 || lrs.x > w + 20 || lrs.y < -20 || lrs.y > h + 20) continue;
    ctx.save();
    // Crate
    var crateColor = lrc.legendary ? '#ffd700' : '#8b6340';
    ctx.fillStyle = crateColor;
    ctx.fillRect(lrs.x - 8, lrs.y - 6, 16, 12);
    ctx.strokeStyle = lrc.legendary ? '#cc9900' : '#4a2e1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(lrs.x - 8, lrs.y - 6, 16, 12);
    // Cross strap
    ctx.beginPath();
    ctx.moveTo(lrs.x - 8, lrs.y); ctx.lineTo(lrs.x + 8, lrs.y);
    ctx.moveTo(lrs.x, lrs.y - 6); ctx.lineTo(lrs.x, lrs.y + 6);
    ctx.stroke();
    // Glow
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.005 + lri) * 0.2;
    ctx.fillStyle = lrc.legendary ? '#ffd700' : '#cc8844';
    ctx.beginPath();
    ctx.arc(lrs.x, lrs.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── MEDICINE MAN TONIC TIMERS ──
  if (f.staminaTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#44ff44';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('STAMINA: ' + Math.ceil(f.staminaTimer) + 's', 10, h - 110);
    ctx.restore();
  }
  if (f.luckyCharmTimer > 0) {
    f.luckyCharmTimer -= 0.016; // approximate dt since render doesn't get dt
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LUCKY CHARM: ' + Math.ceil(f.luckyCharmTimer) + 's', 10, h - 125);
    ctx.restore();
  }

  // ── EAGLE EYE COOLDOWN ──
  if (f.eagleEyeCooldown > 0 && !f.eagleEyeActive) {
    ctx.save();
    ctx.fillStyle = '#aa8844';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Eagle Eye: ' + Math.ceil(f.eagleEyeCooldown) + 's', 10, h - 140);
    ctx.restore();
  }
}

// ============================================================
// HOOK INTO EXISTING SYSTEM
// ============================================================
window.updateFeatures = function(dt) {
  _origUpdateFeatures(dt);
  initFeatures2();
  if (game.state !== 'playing') return;
  updateFeatures2(dt);
};

window.renderFeaturesOverlay = function() {
  _origRenderFeaturesOverlay();
  if (!game._features2) return;
  renderFeatures2Overlay();
};

})();
