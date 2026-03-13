'use strict';

// ============================================================
// CORRUPTION SYSTEM — Alternate dark-path playstyle
// Loaded AFTER game.js. Uses globals: game, TILE, MAP_W, MAP_H,
// BUILDING_TYPES, NPC_TYPES, PALETTE, DIFFICULTY, REPUTATION_MAX,
// audio, showNotification, addJournalEntry, clamp, rand, dist,
// ctx, gameCanvas, keysJustPressed, consumeKey, particles, bullets,
// createNPC
// ============================================================

// ─────────────────────────────────────────────
// §1  CORRUPTION TIERS
// ─────────────────────────────────────────────
const CORRUPTION_TIERS = [
  { name: 'Clean Sheriff',   min: 0,  max: 20, color: '#4488cc', perkDesc: 'Bonus reputation gain' },
  { name: 'Bent Cop',        min: 21, max: 40, color: '#8a6a38', perkDesc: 'Can shakedown shops' },
  { name: 'Crooked Sheriff', min: 41, max: 60, color: '#aa5522', perkDesc: 'Bodyguards + steal from shops' },
  { name: 'Crime Boss',      min: 61, max: 80, color: '#cc2222', perkDesc: 'Outlaws become allies' },
  { name: 'Tyrant',          min: 81, max: 100, color: '#880088', perkDesc: 'Double gold, but assassins hunt you' },
];

function getCorruptionTier(corruption) {
  var c = corruption || 0;
  for (var i = CORRUPTION_TIERS.length - 1; i >= 0; i--) {
    if (c >= CORRUPTION_TIERS[i].min) return CORRUPTION_TIERS[i];
  }
  return CORRUPTION_TIERS[0];
}

// ─────────────────────────────────────────────
// §2  STATE INITIALIZATION
// ─────────────────────────────────────────────
var _corruptionInitialized = false;
var _shakedownCooldown = 0;
var _arrestCivilianCooldown = 0;
var _stealCooldown = 0;
var _bountyHunterTimer = 0;
var _bountyHunterInterval = 120; // seconds between bounty hunter spawns
var _revoltTriggered = false;
var _marshalSpawned = false;
var _bodyguardRespawnTimer = 0;
var _maxBodyguards = 2;
var _buyBodyguardCooldown = 0;
var _lastCorruptionTier = '';
var _corruptionParticleTimer = 0;
var _cowerCheckTimer = 0;
var _shakedownPriceIncrease = {}; // building name -> multiplier
var _outlawAllianceActive = false;
var _townAlarmTimer = 0;
var _townAlarmActive = false;

function _initCorruption() {
  if (_corruptionInitialized) return;
  if (typeof game === 'undefined' || !game.player) return;

  if (game.corruption === undefined) game.corruption = 0;
  if (!game.bodyguards) game.bodyguards = [];
  if (game.corruptionKills === undefined) game.corruptionKills = 0;
  if (game.shakedownsPerformed === undefined) game.shakedownsPerformed = 0;
  if (game.civiliansArrested === undefined) game.civiliansArrested = 0;
  if (game.blackMarketDeals === undefined) game.blackMarketDeals = 0;

  _lastCorruptionTier = getCorruptionTier(game.corruption).name;
  _corruptionInitialized = true;
}

// ─────────────────────────────────────────────
// §3  CORE UPDATE (called every frame)
// ─────────────────────────────────────────────
function updateCorruption(dt) {
  _initCorruption();
  if (!game.player || game.state !== 'playing') return;

  var realDt = dt || (1 / 60);

  // Decrement cooldowns
  if (_shakedownCooldown > 0) _shakedownCooldown -= realDt;
  if (_arrestCivilianCooldown > 0) _arrestCivilianCooldown -= realDt;
  if (_stealCooldown > 0) _stealCooldown -= realDt;
  if (_townAlarmTimer > 0) {
    _townAlarmTimer -= realDt;
    if (_townAlarmTimer <= 0) _townAlarmActive = false;
  }

  var tier = getCorruptionTier(game.corruption);

  // Tier change notification
  if (tier.name !== _lastCorruptionTier) {
    _lastCorruptionTier = tier.name;
    showNotification('Corruption tier: ' + tier.name + ' — ' + tier.perkDesc, 'bad');
    addJournalEntry('Corruption level changed: ' + tier.name + '.');
  }

  // Clean Sheriff perk: bonus rep gain (handled via multiplier check in other systems)
  // Bent Cop: outlaws hesitate (handled in outlaw AI override)

  // G key interactions
  _handleGKeyActions();

  // B key — buy bodyguards
  _handleBuyBodyguard();

  // Update bodyguards
  _updateBodyguards(realDt);

  // Outlaw alliance at 61+
  _updateOutlawAlliance();

  // Bounty hunters at high corruption
  _updateBountyHunters(realDt);

  // Town revolt at 90+
  _updateTownRevolt();

  // Federal marshal at 100
  _updateMarshal();

  // Corruption particles
  _updateCorruptionParticles(realDt);

  // Townspeople cower
  _updateTownspeopleReactions(realDt);

  // Unsolved crimes add corruption
  _checkUnsolvedCrimes();

  // Double gold perk for Tyrant tier
  // (applied when gold is earned elsewhere — we hook into existing gold changes)
}

// ─────────────────────────────────────────────
// §4  G KEY ACTIONS (shakedown / arrest / steal)
// ─────────────────────────────────────────────
function _handleGKeyActions() {
  if (!consumeKey('KeyG')) return;
  if (game.state !== 'playing') return;

  var p = game.player;
  var corruption = game.corruption || 0;
  var tier = getCorruptionTier(corruption);

  // Priority 1: Steal from shop (inside a shop building, corruption 41+)
  if (corruption >= 41) {
    var shopBuilding = _getPlayerInsideShop();
    if (shopBuilding) {
      _attemptSteal(shopBuilding);
      return;
    }
  }

  // Priority 2: Find nearest interactable NPC
  var nearest = null;
  var nearestDist = Infinity;
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.state === 'dead' || npc.dead || npc.state === 'arrested' || npc.arrested) continue;
    var d = dist(p, npc);
    if (d < 48 && d < nearestDist) {
      nearest = npc;
      nearestDist = d;
    }
  }

  if (!nearest) {
    showNotification('No one nearby to intimidate.');
    return;
  }

  // Shopkeeper/bartender/banker = shakedown
  var isShopNPC = nearest.type === NPC_TYPES.SHOPKEEPER ||
                  nearest.type === NPC_TYPES.BARTENDER ||
                  nearest.type === NPC_TYPES.BANKER;

  if (isShopNPC) {
    if (corruption < 21) {
      showNotification('You\'re too clean to shakedown anyone. (Need 21+ corruption)');
      return;
    }
    _attemptShakedown(nearest);
    return;
  }

  // Townsperson = arrest civilian
  if (nearest.type === NPC_TYPES.TOWNSPERSON) {
    _attemptArrestCivilian(nearest);
    return;
  }

  // Outlaw (at 61+ corruption) = black market deal
  if ((nearest.type === NPC_TYPES.OUTLAW || nearest.type === NPC_TYPES.BOUNTY) && corruption >= 61) {
    _blackMarketDeal(nearest);
    return;
  }

  showNotification('Can\'t intimidate ' + nearest.name + '.');
}

// ─────────────────────────────────────────────
// §5  SHAKEDOWN SYSTEM
// ─────────────────────────────────────────────
function _attemptShakedown(npc) {
  if (_shakedownCooldown > 0) {
    showNotification('Wait before shaking down again...');
    return;
  }

  var corruption = game.corruption || 0;

  var priceMult = _shakedownPriceIncrease[npc.name] || 1;

  // Shopkeepers never fight back — they always comply
  var goldAmount = rand(20, 80);
  // More gold at higher corruption
  goldAmount = Math.floor(goldAmount * (1 + corruption / 100));
  game.gold += goldAmount;
  game.totalGoldEarned = (game.totalGoldEarned || 0) + goldAmount;
  _addCorruption(10);
  game.shakedownsPerformed++;

  // Increase prices at this shop
  _shakedownPriceIncrease[npc.name] = priceMult + 0.2;

  showNotification('Shook down ' + npc.name + ' for $' + goldAmount + '!', 'bad');
  addJournalEntry('Shook down ' + npc.name + ' for $' + goldAmount + '. Corruption +10.');
  if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();

  // NPC cowers briefly
  npc.fleeing = true;
  npc.state = 'fleeing';
  setTimeout(function() {
    if (npc && !npc.dead) {
      npc.fleeing = false;
      npc.state = 'idle';
    }
  }, 3000);

  _shakedownCooldown = 5;
}

// ─────────────────────────────────────────────
// §6  ARREST CIVILIANS
// ─────────────────────────────────────────────
function _attemptArrestCivilian(npc) {
  if (_arrestCivilianCooldown > 0) {
    showNotification('Wait before arresting again...');
    return;
  }

  // Some civilians fight back (30% chance)
  if (Math.random() < 0.3) {
    npc.hostile = true;
    npc.weapon = 'pistol';
    npc.hp = Math.max(npc.hp, 3);
    showNotification(npc.name + ' resists arrest!', 'bad');
    addJournalEntry(npc.name + ' fought back when you tried to arrest them!');
    if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
    _arrestCivilianCooldown = 3;
    return;
  }

  // Arrest successful
  npc.state = 'arrested';
  npc.arrested = true;
  npc.hostile = false;

  _addCorruption(8);
  game.civiliansArrested++;
  game.reputation = clamp((game.reputation || 50) - 5, 0, REPUTATION_MAX);

  showNotification('Arrested ' + npc.name + '! Rep -5, Corruption +8.', 'bad');
  addJournalEntry('Falsely arrested ' + npc.name + '. Corruption +8.');
  if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();

  _arrestCivilianCooldown = 4;
}

// ─────────────────────────────────────────────
// §7  STEAL FROM SHOPS
// ─────────────────────────────────────────────
function _getPlayerInsideShop() {
  var p = game.player;
  if (!game.buildings) return null;
  for (var i = 0; i < game.buildings.length; i++) {
    var b = game.buildings[i];
    if (b.type !== BUILDING_TYPES.GENERAL && b.type !== BUILDING_TYPES.BLACKSMITH &&
        b.type !== BUILDING_TYPES.SALOON) continue;
    var bx = b.x * TILE;
    var by = b.y * TILE;
    var bw = b.w * TILE;
    var bh = b.h * TILE;
    if (p.x >= bx && p.x <= bx + bw && p.y >= by && p.y <= by + bh) {
      return b;
    }
  }
  return null;
}

var _stolenItems = [
  { name: 'Health Tonic',     effect: 'heal',  value: 2 },
  { name: 'Ammo Stash',      effect: 'ammo',  value: 12 },
  { name: 'Gold Watch',      effect: 'gold',  value: 40 },
  { name: 'Silver Flask',    effect: 'gold',  value: 25 },
  { name: 'Whiskey Bottle',  effect: 'heal',  value: 1 },
  { name: 'Gunpowder Keg',   effect: 'ammo',  value: 20 },
  { name: 'Jeweled Ring',    effect: 'gold',  value: 60 },
  { name: 'Fancy Hat',       effect: 'gold',  value: 15 },
];

function _attemptSteal(building) {
  if (_stealCooldown > 0) {
    showNotification('Wait before stealing again...');
    return;
  }

  var corruption = game.corruption || 0;
  // Risk of getting caught: 50% at corruption 41, decreasing to 10% at 100
  var catchChance = 0.5 - ((corruption - 41) / 59) * 0.4;
  catchChance = Math.max(catchChance, 0.1);

  var item = _stolenItems[rand(0, _stolenItems.length - 1)];

  if (Math.random() < catchChance) {
    // Caught! Town alarm
    showNotification('Caught stealing! Town alarm raised!', 'bad');
    addJournalEntry('Caught stealing from ' + building.name + '! Bounty hunters alerted.');
    if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
    _townAlarmActive = true;
    _townAlarmTimer = 30;
    _spawnBountyHunters(2);
    _addCorruption(5);
    _stealCooldown = 10;
    return;
  }

  // Success
  if (item.effect === 'heal') {
    game.player.hp = Math.min(game.player.hp + item.value, game.player.maxHp);
  } else if (item.effect === 'ammo') {
    game.ammo = Math.min((game.ammo || 24) + item.value, 99);
  } else if (item.effect === 'gold') {
    var goldVal = item.value;
    if (corruption >= 81) goldVal *= 2; // Tyrant double gold
    game.gold += goldVal;
    game.totalGoldEarned = (game.totalGoldEarned || 0) + goldVal;
  }

  showNotification('Stole ' + item.name + ' from ' + building.name + '!');
  addJournalEntry('Stole ' + item.name + ' from ' + building.name + '.');
  if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();

  _stealCooldown = 6;
}

// ─────────────────────────────────────────────
// §8  OUTLAW ALLIANCE
// ─────────────────────────────────────────────
function _updateOutlawAlliance() {
  if (!game.npcs) return;
  var corruption = game.corruption || 0;
  var shouldBeAllied = corruption >= 61;

  if (shouldBeAllied !== _outlawAllianceActive) {
    _outlawAllianceActive = shouldBeAllied;
    if (shouldBeAllied) {
      showNotification('Outlaws now see you as one of their own.', 'bad');
      addJournalEntry('The outlaws recognize your corruption. They are now allies.');
    } else {
      showNotification('Outlaws no longer trust you.');
      addJournalEntry('Lost outlaw alliance. They see you as a lawman again.');
    }
  }

  // Modify outlaw behavior
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.type !== NPC_TYPES.OUTLAW && npc.type !== NPC_TYPES.BOUNTY) continue;
    if (npc.state === 'dead' || npc.dead || npc.state === 'arrested' || npc.arrested) continue;

    if (shouldBeAllied) {
      // Don't attack the player
      if (npc.hostile && !npc._corruptionForced) {
        npc.hostile = false;
      }
    }

    // Bent Cop perk: outlaws hesitate (less aggressive)
    if (corruption >= 21 && corruption < 61) {
      if (npc.hostile && !npc._corruptionForced) {
        // 50% chance to un-aggro every few seconds
        if (Math.random() < 0.002) {
          npc.hostile = false;
        }
      }
    }
  }
}

function _blackMarketDeal(npc) {
  var deals = [
    { name: 'Stolen Gold',      gold: rand(30, 100), corruption: 3 },
    { name: 'Contraband Ammo',   ammo: rand(10, 24),  corruption: 2 },
    { name: 'Outlaw Intel',      rep: -5,             corruption: 4, intel: true },
    { name: 'Dirty Money',       gold: rand(50, 150), corruption: 5 },
  ];

  var deal = deals[rand(0, deals.length - 1)];
  game.blackMarketDeals++;

  if (deal.gold) {
    var goldVal = deal.gold;
    if ((game.corruption || 0) >= 81) goldVal *= 2;
    game.gold += goldVal;
    game.totalGoldEarned = (game.totalGoldEarned || 0) + goldVal;
    showNotification('Black market: ' + deal.name + ' (+$' + goldVal + ')', 'bad');
  }
  if (deal.ammo) {
    game.ammo = Math.min((game.ammo || 24) + deal.ammo, 99);
    showNotification('Black market: ' + deal.name + ' (+' + deal.ammo + ' ammo)', 'bad');
  }
  if (deal.rep) {
    game.reputation = clamp((game.reputation || 50) + deal.rep, 0, REPUTATION_MAX);
  }
  if (deal.intel && game.activeCrime) {
    showNotification('Outlaw tips you off about the crime...', 'bad');
  }

  _addCorruption(deal.corruption);
  addJournalEntry('Black market deal with ' + npc.name + ': ' + deal.name + '. Corruption +' + deal.corruption + '.');
  if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();

  npc.dialogCooldown = 300;
}

// ─────────────────────────────────────────────
// §9  BODYGUARD SYSTEM
// ─────────────────────────────────────────────
function _updateBodyguards(dt) {
  var corruption = game.corruption || 0;
  if (corruption < 41) {
    // Remove bodyguards if corruption dropped below threshold
    if (game.bodyguards && game.bodyguards.length > 0) {
      game.bodyguards = [];
      showNotification('Your bodyguards have left.');
    }
    return;
  }

  if (!game.bodyguards) game.bodyguards = [];

  // Respawn timer for dead bodyguards
  var aliveCount = 0;
  for (var i = 0; i < game.bodyguards.length; i++) {
    if (!game.bodyguards[i].dead) aliveCount++;
  }

  if (aliveCount < _maxBodyguards) {
    _bodyguardRespawnTimer += dt;
    // Respawn after ~1 game day (DAY_LENGTH seconds)
    if (_bodyguardRespawnTimer >= 180 || game.bodyguards.length === 0) {
      _bodyguardRespawnTimer = 0;
      // Clear dead bodyguards
      game.bodyguards = game.bodyguards.filter(function(bg) { return !bg.dead; });
      // Spawn up to max
      while (game.bodyguards.length < _maxBodyguards) {
        _spawnBodyguard(game.bodyguards.length);
      }
    }
  }

  // Buy bodyguard cooldown
  if (_buyBodyguardCooldown > 0) _buyBodyguardCooldown -= dt;

  // Move bodyguards to follow player
  var p = game.player;
  for (var j = 0; j < game.bodyguards.length; j++) {
    var bg = game.bodyguards[j];
    if (bg.dead) continue;

    // Formation: offset left/right of player
    var offsetAngle = (j === 0) ? -2.3 : -0.8; // behind-left and behind-right
    var followDist = 40 + j * 15;
    var targetX = p.x + Math.cos(offsetAngle) * followDist;
    var targetY = p.y + Math.sin(offsetAngle) * followDist;

    var d = Math.hypot(targetX - bg.x, targetY - bg.y);
    if (d > 5) {
      var speed = (d > 80) ? 4.0 : 2.0; // run to catch up
      var moveX = ((targetX - bg.x) / d) * speed;
      var moveY = ((targetY - bg.y) / d) * speed;
      bg.x += moveX;
      bg.y += moveY;
      bg.moving = true;
      bg.facingRight = moveX >= 0;
    } else {
      bg.moving = false;
    }

    // Fight hostile NPCs nearby
    bg.shootCooldown = (bg.shootCooldown || 0) - dt;
    for (var k = 0; k < game.npcs.length; k++) {
      var npc = game.npcs[k];
      if (!npc.hostile || npc.state === 'dead' || npc.dead) continue;
      // Don't attack allied outlaws
      if (_outlawAllianceActive && (npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) && !npc._corruptionForced) continue;

      var nd = dist(bg, npc);
      if (nd < 200 && bg.shootCooldown <= 0) {
        // Shoot at hostile NPC
        if (typeof bullets !== 'undefined' && bullets.fire) {
          var angle = Math.atan2(npc.y - bg.y, npc.x - bg.x);
          bullets.fire(bg.x, bg.y, angle, true, 'bodyguard');
        } else {
          // Fallback direct damage if bullet system unavailable
          npc.hp--;
          if (npc.hp <= 0) {
            npc.state = 'dead';
            npc.dead = true;
            if (particles.emitBlood) particles.emitBlood(npc.x, npc.y);
          }
        }
        bg.shootCooldown = 1.0;
        bg.lastShotTime = Date.now();
        break;
      }
    }

    // Bodyguard takes damage from hostile NPCs (only if cheat mode is OFF)
    if (!game._cheatMode) {
      for (var m = 0; m < game.npcs.length; m++) {
        var hostileNPC = game.npcs[m];
        if (!hostileNPC.hostile || hostileNPC.state === 'dead' || hostileNPC.dead) continue;
        if (dist(bg, hostileNPC) < 30 && Math.random() < 0.01) {
          bg.hp--;
          if (particles.emitBlood) particles.emitBlood(bg.x, bg.y);
          if (bg.hp <= 0) {
            bg.dead = true;
            showNotification('A bodyguard was killed!', 'bad');
            if (particles.emitBlood) particles.emitBlood(bg.x, bg.y);
            break;
          }
        }
      }
    }

    // Animate
    bg.animTimer = (bg.animTimer || 0) + 1;
  }
}

var _bodyguardNames = ['Bruno', 'Vince', 'Rocco', 'Sal', 'Knuckles', 'Big Tony', 'The Hammer', 'Grim', 'Ox', 'Blade'];

function _spawnBodyguard(index) {
  var p = game.player;
  // Spread bodyguards in a fan behind the player
  var angleStep = Math.PI / (Math.max(_maxBodyguards, 2) + 1);
  var offsetAngle = Math.PI + angleStep * (index + 1) - (Math.PI / 2);
  var bg = {
    x: p.x + Math.cos(offsetAngle) * 45,
    y: p.y + Math.sin(offsetAngle) * 45,
    hp: 6,
    maxHp: 6,
    dead: false,
    moving: false,
    facingRight: true,
    animTimer: 0,
    shootCooldown: 0,
    lastShotTime: 0,
    name: _bodyguardNames[index % _bodyguardNames.length],
  };
  game.bodyguards.push(bg);
  showNotification('Bodyguard ' + bg.name + ' has arrived.');
}

// ─────────────────────────────────────────────
// §10  BOUNTY HUNTERS
// ─────────────────────────────────────────────
function _updateBountyHunters(dt) {
  var corruption = game.corruption || 0;
  if (corruption < 41) {
    _bountyHunterTimer = 0;
    return;
  }

  // Interval decreases with higher corruption
  var interval = 120 - ((corruption - 41) / 59) * 80; // 120s at 41, 40s at 100
  interval = Math.max(interval, 30);

  _bountyHunterTimer += dt;
  if (_bountyHunterTimer >= interval) {
    _bountyHunterTimer = 0;
    var count = corruption >= 81 ? 3 : (corruption >= 61 ? 2 : 1);
    _spawnBountyHunters(count);
  }
}

function _spawnBountyHunters(count) {
  if (!game.npcs) return;
  var p = game.player;
  var hunterNames = ['Marshal Hank', 'Ranger Cole', 'Agent Shaw', 'Tracker Jed', 'Deputy Frost', 'Lawman Pike'];

  for (var i = 0; i < count; i++) {
    // Spawn at map edges
    var edge = rand(0, 3);
    var spawnX, spawnY;
    if (edge === 0) { spawnX = rand(2, MAP_W - 2); spawnY = 2; }
    else if (edge === 1) { spawnX = rand(2, MAP_W - 2); spawnY = MAP_H - 2; }
    else if (edge === 2) { spawnX = 2; spawnY = rand(2, MAP_H - 2); }
    else { spawnX = MAP_W - 2; spawnY = rand(2, MAP_H - 2); }

    var name = hunterNames[rand(0, hunterNames.length - 1)];
    var npc = createNPC(game.npcs.length + 900 + i, NPC_TYPES.BOUNTY, name, spawnX, spawnY, null);
    npc.hp = 6 + Math.floor((game.corruption || 0) / 20);
    npc.maxHp = npc.hp;
    npc.hostile = true;
    npc._corruptionForced = true; // won't be un-aggroed by alliance
    npc._isBountyHunter = true;
    npc.speed = 2.2;
    npc.weapon = 'pistol';
    // Target the player
    npc.targetX = p.x;
    npc.targetY = p.y;
    game.npcs.push(npc);
  }

  if (count > 0) {
    showNotification('Bounty hunters are after you!', 'bad');
    addJournalEntry(count + ' bounty hunter' + (count > 1 ? 's' : '') + ' have arrived to collect your bounty.');
    if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
  }
}

// ─────────────────────────────────────────────
// §11  TOWN REVOLT & MARSHAL
// ─────────────────────────────────────────────
function _updateTownRevolt() {
  if (_revoltTriggered) return;
  if ((game.corruption || 0) < 90) return;

  _revoltTriggered = true;
  showNotification('THE TOWN REVOLTS! Everyone is hostile!', 'bad');
  addJournalEntry('The townspeople have had enough! They rise up against your tyranny!');
  if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();

  // Make all townspeople hostile
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.type === NPC_TYPES.TOWNSPERSON || npc.type === NPC_TYPES.DEPUTY ||
        npc.type === NPC_TYPES.MAYOR || npc.type === NPC_TYPES.PREACHER) {
      if (npc.state === 'dead' || npc.dead || npc.state === 'arrested') continue;
      npc.hostile = true;
      npc.weapon = npc.weapon || 'pistol';
      npc.hp = Math.max(npc.hp, 4);
      npc._corruptionForced = true;
    }
  }
}

function _updateMarshal() {
  if (_marshalSpawned) return;
  if ((game.corruption || 0) < 100) return;

  _marshalSpawned = true;

  // Spawn the Federal Marshal — the final boss
  var spawnX = 2;
  var spawnY = Math.floor(MAP_H / 2);
  var marshal = createNPC(game.npcs.length + 999, NPC_TYPES.BOUNTY, 'Federal Marshal Kane', spawnX, spawnY, null);
  marshal.hp = 15;
  marshal.maxHp = 15;
  marshal.hostile = true;
  marshal._corruptionForced = true;
  marshal._isMarshal = true;
  marshal.speed = 2.5;
  marshal.weapon = 'pistol';
  game.npcs.push(marshal);

  showNotification('FEDERAL MARSHAL KANE HAS ARRIVED! Final showdown!', 'bad');
  addJournalEntry('Federal Marshal Kane rides into town. He has a warrant for your arrest — dead or alive.');
  if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();

  // Also spawn 3 deputies with him
  _spawnBountyHunters(3);
}

// ─────────────────────────────────────────────
// §12  CORRUPTION PARTICLES & VISUAL EFFECTS
// ─────────────────────────────────────────────
function _updateCorruptionParticles(dt) {
  if ((game.corruption || 0) < 30) return;

  _corruptionParticleTimer += dt;
  // More particles at higher corruption
  var interval = 0.5 - ((game.corruption - 30) / 70) * 0.4;
  interval = Math.max(interval, 0.08);

  if (_corruptionParticleTimer >= interval) {
    _corruptionParticleTimer = 0;
    var p = game.player;
    // Red/purple smoke around player
    var colors = ['#8b0000', '#660033', '#440022', '#993333', '#772244'];
    var color = colors[rand(0, colors.length - 1)];
    var count = game.corruption >= 81 ? 3 : (game.corruption >= 61 ? 2 : 1);
    particles.emit(
      p.x + (Math.random() - 0.5) * 16,
      p.y + (Math.random() - 0.5) * 12,
      count,
      color,
      0.5,
      25
    );
  }
}

function _updateTownspeopleReactions(dt) {
  if ((game.corruption || 0) < 41) return;

  _cowerCheckTimer += dt;
  if (_cowerCheckTimer < 0.5) return;
  _cowerCheckTimer = 0;

  var p = game.player;
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.type !== NPC_TYPES.TOWNSPERSON) continue;
    if (npc.state === 'dead' || npc.dead || npc.state === 'arrested' || npc.hostile) continue;

    var d = dist(p, npc);
    // Townspeople flee when corrupt sheriff walks by
    if (d < 120 && !npc.fleeing) {
      npc.fleeing = true;
      npc.state = 'fleeing';
      // Run away from player
      var angle = Math.atan2(npc.y - p.y, npc.x - p.x);
      npc.targetX = npc.x + Math.cos(angle) * 150;
      npc.targetY = npc.y + Math.sin(angle) * 150;
      npc.targetX = clamp(npc.targetX, TILE * 2, (MAP_W - 2) * TILE);
      npc.targetY = clamp(npc.targetY, TILE * 2, (MAP_H - 2) * TILE);
    }
    // Reset after they're far enough away
    if (d > 200 && npc.fleeing && !npc.hostile) {
      npc.fleeing = false;
      npc.state = 'idle';
    }
  }
}

// ─────────────────────────────────────────────
// §13  UNSOLVED CRIME HOOK
// ─────────────────────────────────────────────
var _lastCrimeState = null;

function _checkUnsolvedCrimes() {
  // Track when a crime expires/fails => +5 corruption
  if (game.activeCrime && !_lastCrimeState) {
    _lastCrimeState = game.activeCrime;
  }
  if (!game.activeCrime && _lastCrimeState) {
    // Crime was either resolved or failed
    // If crimesIgnored counter went up, it was ignored
    if (game.crimesIgnored > (_lastCrimeState._trackedIgnored || 0)) {
      _addCorruption(5);
    }
    _lastCrimeState = null;
  }
  if (_lastCrimeState) {
    _lastCrimeState._trackedIgnored = game.crimesIgnored;
  }
}

// ─────────────────────────────────────────────
// §14  CORRUPTION CHANGE HELPERS
// ─────────────────────────────────────────────
function _addCorruption(amount) {
  game.corruption = clamp((game.corruption || 0) + amount, 0, 100);
}

function _removeCorruption(amount) {
  game.corruption = clamp((game.corruption || 0) - amount, 0, 100);
}

// Public API for game.js to call
function addCorruption(amount) {
  _addCorruption(amount);
}

function removeCorruption(amount) {
  _removeCorruption(amount);
}

// Called from game.js when crimes are resolved honestly
function onCrimeResolved() {
  _removeCorruption(3);
}

// Called from game.js when player helps a townsperson
function onHelpedTownsperson() {
  _removeCorruption(2);
}

// Called from game.js when player accepts a bribe
function onBribeAccepted() {
  _addCorruption(15);
}

// Get clean sheriff rep bonus multiplier
function getCorruptionRepMultiplier() {
  if ((game.corruption || 0) <= 20) return 1.25; // Clean Sheriff bonus
  return 1.0;
}

// Get tyrant gold multiplier
function getCorruptionGoldMultiplier() {
  if ((game.corruption || 0) >= 81) return 2.0; // Tyrant double gold
  return 1.0;
}

// ─────────────────────────────────────────────
// §15  RENDER OVERLAY
// ─────────────────────────────────────────────
function renderCorruptionOverlay() {
  _initCorruption();
  if (!game.player) return;
  if (game.state !== 'playing') return;

  var corruption = game.corruption || 0;
  var tier = getCorruptionTier(corruption);

  _renderCorruptionHUD(corruption, tier);
  _renderBodyguards();
  _renderCorruptionVisualEffects(corruption);

  // Town alarm flashing border
  if (_townAlarmActive) {
    _renderTownAlarm();
  }
}

// ─────────────────────────────────────────────
// §16  CORRUPTION HUD BAR
// ─────────────────────────────────────────────
function _renderCorruptionHUD(corruption, tier) {
  var cw = gameCanvas.width;

  // Position: top-right area, below other HUD elements
  var barX = cw - 185;
  var barY = 110;
  var barW = 160;
  var barH = 14;
  var padding = 6;

  // Background panel
  ctx.save();
  ctx.fillStyle = 'rgba(20, 12, 4, 0.85)';
  ctx.strokeStyle = '#5a3a18';
  ctx.lineWidth = 1.5;
  var panelX = barX - padding;
  var panelY = barY - 20;
  var panelW = barW + padding * 2;
  var panelH = barH + 28 + padding;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Title
  ctx.fillStyle = tier.color;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tier.name.toUpperCase(), barX, barY - 6);

  // Corruption value
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(Math.floor(corruption) + '/100', barX + barW, barY - 6);

  // Bar background
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(barX, barY, barW, barH);

  // Bar fill — purple to red gradient
  if (corruption > 0) {
    var gradient = ctx.createLinearGradient(barX, barY, barX + barW * (corruption / 100), barY);
    gradient.addColorStop(0, '#6a2a8a');
    gradient.addColorStop(0.5, '#aa2244');
    gradient.addColorStop(1, '#cc1111');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * (corruption / 100), barH);
  }

  // Bar border
  ctx.strokeStyle = '#8a6a38';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // Tier markers
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  for (var i = 1; i < 5; i++) {
    var mx = barX + (barW * (i * 20) / 100);
    ctx.beginPath();
    ctx.moveTo(mx, barY);
    ctx.lineTo(mx, barY + barH);
    ctx.stroke();
  }

  // Perk description
  ctx.fillStyle = '#a09070';
  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tier.perkDesc, barX, barY + barH + 10);

  ctx.restore();
}

// ─────────────────────────────────────────────
// §17  BODYGUARD RENDERING
// ─────────────────────────────────────────────
function _renderBodyguards() {
  if (!game.bodyguards || game.bodyguards.length === 0) return;

  var camX = game.camera.x;
  var camY = game.camera.y;

  for (var i = 0; i < game.bodyguards.length; i++) {
    var bg = game.bodyguards[i];
    if (bg.dead) continue;

    var sx = bg.x - camX;
    var sy = bg.y - camY;
    if (sx < -TILE * 2 || sx > gameCanvas.width + TILE * 2 ||
        sy < -TILE * 2 || sy > gameCanvas.height + TILE * 2) continue;

    var now = Date.now();
    var bobOffset = bg.moving ? Math.sin(now * 0.008 + i * 100) * 1.5 : 0;

    ctx.save();
    ctx.translate(sx, sy);

    // Shadow (bigger than normal NPCs)
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boots — heavy black
    ctx.fillStyle = '#111111';
    var lBob = bg.moving ? Math.sin(now * 0.008 + i * 100) * 2 : 0;
    ctx.fillRect(-4, 8 + bobOffset - lBob, 4, 4);
    ctx.fillRect(1, 8 + bobOffset + lBob, 4, 4);

    // Pants — dark
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4, 2 + bobOffset, 4, 7);
    ctx.fillRect(1, 2 + bobOffset, 4, 7);

    // Torso — big, dark coat
    ctx.fillStyle = '#222222';
    ctx.fillRect(-6, -6 + bobOffset, 12, 9);
    // Coat collar
    ctx.fillStyle = '#333333';
    ctx.fillRect(-5, -6 + bobOffset, 10, 2);

    // Suspenders/belt
    ctx.fillStyle = '#444444';
    ctx.fillRect(-1, -4 + bobOffset, 2, 7);

    // Head
    ctx.fillStyle = PALETTE.skinDark || '#b8844a';
    ctx.fillRect(-3, -12 + bobOffset, 6, 6);

    // Stubble/tough look
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-3, -8 + bobOffset, 6, 2);

    // Eyes — menacing
    ctx.fillStyle = '#000000';
    if (bg.facingRight) {
      ctx.fillRect(1, -10 + bobOffset, 1, 1);
      ctx.fillRect(-1, -10 + bobOffset, 1, 1);
    } else {
      ctx.fillRect(-2, -10 + bobOffset, 1, 1);
      ctx.fillRect(0, -10 + bobOffset, 1, 1);
    }

    // Hat — wide brim, dark
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-7, -16 + bobOffset, 14, 3);
    ctx.fillRect(-4, -19 + bobOffset, 8, 3);
    // Hat brim
    ctx.fillStyle = '#050505';
    ctx.fillRect(-8, -16 + bobOffset, 16, 1);

    // Gun in hand
    ctx.fillStyle = '#555555';
    var gunX = bg.facingRight ? 6 : -8;
    ctx.fillRect(gunX, -2 + bobOffset, 3, 6);
    ctx.fillStyle = '#333333';
    ctx.fillRect(gunX, -2 + bobOffset, 3, 2);

    // HP bar
    if (bg.hp < bg.maxHp) {
      var barW = 22;
      var barH = 3;
      var hpPct = clamp(bg.hp / bg.maxHp, 0, 1);
      ctx.fillStyle = '#440000';
      ctx.fillRect(-barW / 2, -24 + bobOffset, barW, barH);
      ctx.fillStyle = hpPct > 0.3 ? '#cc3030' : '#ff0000';
      ctx.fillRect(-barW / 2, -24 + bobOffset, barW * hpPct, barH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-barW / 2, -24 + bobOffset, barW, barH);
    }

    // Name tag
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bg.name, 0, -26 + bobOffset);

    // Muzzle flash
    if (bg.lastShotTime && now - bg.lastShotTime < 100) {
      ctx.fillStyle = '#ffcc00';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(bg.facingRight ? 8 : -8, -2 + bobOffset, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// §18  VISUAL CORRUPTION EFFECTS
// ─────────────────────────────────────────────
function _renderCorruptionVisualEffects(corruption) {
  if (corruption < 10) return;

  var p = game.player;
  var camX = game.camera.x;
  var camY = game.camera.y;
  var sx = p.x - camX;
  var sy = p.y - camY;

  // Red/purple aura around player
  if (corruption >= 30) {
    var intensity = (corruption - 30) / 70; // 0 to 1
    var radius = 20 + intensity * 25;
    var now = Date.now();
    var pulse = 0.15 + Math.sin(now * 0.003) * 0.08;
    var alpha = pulse * intensity;

    ctx.save();
    var gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
    if (corruption >= 81) {
      gradient.addColorStop(0, 'rgba(120, 0, 120, ' + (alpha * 0.6) + ')');
      gradient.addColorStop(0.5, 'rgba(80, 0, 40, ' + (alpha * 0.3) + ')');
    } else if (corruption >= 61) {
      gradient.addColorStop(0, 'rgba(150, 20, 20, ' + (alpha * 0.5) + ')');
      gradient.addColorStop(0.5, 'rgba(100, 0, 0, ' + (alpha * 0.25) + ')');
    } else {
      gradient.addColorStop(0, 'rgba(120, 40, 20, ' + (alpha * 0.4) + ')');
      gradient.addColorStop(0.5, 'rgba(80, 20, 10, ' + (alpha * 0.2) + ')');
    }
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Screen tint at very high corruption
  if (corruption >= 61) {
    var tintAlpha = ((corruption - 61) / 39) * 0.06;
    ctx.save();
    ctx.fillStyle = 'rgba(60, 0, 20, ' + tintAlpha + ')';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.restore();
  }

  // Vignette darkening at high corruption
  if (corruption >= 50) {
    var vigAlpha = ((corruption - 50) / 50) * 0.25;
    ctx.save();
    var vignette = ctx.createRadialGradient(
      gameCanvas.width / 2, gameCanvas.height / 2, gameCanvas.width * 0.3,
      gameCanvas.width / 2, gameCanvas.height / 2, gameCanvas.width * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, ' + vigAlpha + ')');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.restore();
  }
}

function _renderTownAlarm() {
  var now = Date.now();
  var flash = Math.sin(now * 0.008) > 0;
  if (!flash) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, gameCanvas.width - 4, gameCanvas.height - 4);
  ctx.restore();
}

// ─────────────────────────────────────────────
// §19  PLAYER VISUAL CORRUPTION (hat/badge)
// ─────────────────────────────────────────────
// Override badge/hat colors based on corruption level.
// These are checked dynamically so the drawPlayer function
// uses the modified PALETTE values.

var _originalHat = null;
var _originalHatBrim = null;
var _originalBadge = null;
var _originalBadgeShine = null;
var _visualUpdateTimer = 0;

function _updatePlayerVisuals() {
  var corruption = game.corruption || 0;

  // Save originals on first call
  if (_originalHat === null) {
    _originalHat = PALETTE.hat;
    _originalHatBrim = PALETTE.hatBrim;
    _originalBadge = PALETTE.badge;
    _originalBadgeShine = PALETTE.badgeShine;
  }

  if (corruption <= 20) {
    // Clean — original colors
    PALETTE.hat = _originalHat;
    PALETTE.hatBrim = _originalHatBrim;
    PALETTE.badge = _originalBadge;
    PALETTE.badgeShine = _originalBadgeShine;
  } else if (corruption <= 40) {
    // Bent — slightly darker hat, bronze badge
    PALETTE.hat = '#2a1a0a';
    PALETTE.hatBrim = '#1a0a00';
    PALETTE.badge = '#cd7f32'; // bronze
    PALETTE.badgeShine = '#daa520';
  } else if (corruption <= 60) {
    // Crooked — dark hat, tarnished badge
    PALETTE.hat = '#1a1008';
    PALETTE.hatBrim = '#0a0804';
    PALETTE.badge = '#8b6914'; // dark bronze
    PALETTE.badgeShine = '#a0842a';
  } else if (corruption <= 80) {
    // Crime Boss — near-black hat, dark badge
    PALETTE.hat = '#0e0806';
    PALETTE.hatBrim = '#060402';
    PALETTE.badge = '#555555'; // gunmetal
    PALETTE.badgeShine = '#777777';
  } else {
    // Tyrant — black hat, black badge
    PALETTE.hat = '#060404';
    PALETTE.hatBrim = '#020202';
    PALETTE.badge = '#222222'; // black
    PALETTE.badgeShine = '#333333';
  }

  // Also tint the cloth color darker
  if (corruption > 40) {
    var darkFactor = Math.max(0.3, 1.0 - (corruption - 40) / 100);
    var r = Math.floor(0x8b * darkFactor);
    var g = Math.floor(0x1a * darkFactor);
    var b = Math.floor(0x1a * darkFactor);
    PALETTE.cloth = 'rgb(' + r + ',' + g + ',' + b + ')';
  } else {
    PALETTE.cloth = '#8b1a1a';
  }
}

// Hook visuals update into main update cycle
var _origUpdateCorruption = updateCorruption;

// We need to wrap updateCorruption to also handle visuals
// But since we're defining it fresh, just add visual update to the main function.
// We do this by replacing the function and calling both.

// Actually, let's just call it inside updateCorruption directly.
// We already defined updateCorruption above — let's modify it.

// The simplest approach: update visuals in the render overlay instead.
// This way we don't need to wrap anything.

// ─────────────────────────────────────────────
// §20  COMBINED RENDER (override renderCorruptionOverlay)
// ─────────────────────────────────────────────

// We already defined renderCorruptionOverlay above. Let's make the visual
// update happen there since it's called every frame too.

// Save reference to our original render function
var _baseRenderCorruptionOverlay = renderCorruptionOverlay;

// Redefine to include visual updates
renderCorruptionOverlay = function() {
  _initCorruption();
  if (!game.player) return;
  if (game.state !== 'playing') return;

  // Update player hat/badge visuals based on corruption
  _visualUpdateTimer++;
  if (_visualUpdateTimer % 30 === 0) {
    _updatePlayerVisuals();
  }

  var corruption = game.corruption || 0;
  var tier = getCorruptionTier(corruption);

  _renderCorruptionHUD(corruption, tier);
  _renderBodyguards();
  _renderCorruptionVisualEffects(corruption);

  if (_townAlarmActive) {
    _renderTownAlarm();
  }

  // G key hint when near interactable targets
  _renderGKeyHint();
};

// ─────────────────────────────────────────────
// §21  INTERACTION HINTS
// ─────────────────────────────────────────────
function _renderGKeyHint() {
  var p = game.player;
  var corruption = game.corruption || 0;
  var camX = game.camera.x;
  var camY = game.camera.y;

  // Check for nearby NPCs we can interact with via G
  var hintText = null;
  var hintX = 0;
  var hintY = 0;

  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.state === 'dead' || npc.dead || npc.state === 'arrested') continue;
    var d = dist(p, npc);
    if (d > 48) continue;

    var isShopNPC = npc.type === NPC_TYPES.SHOPKEEPER ||
                    npc.type === NPC_TYPES.BARTENDER ||
                    npc.type === NPC_TYPES.BANKER;

    if (isShopNPC && corruption >= 21) {
      hintText = '[G] Shakedown';
      hintX = npc.x - camX;
      hintY = npc.y - camY - 30;
      break;
    }
    if (npc.type === NPC_TYPES.TOWNSPERSON) {
      hintText = '[G] Arrest';
      hintX = npc.x - camX;
      hintY = npc.y - camY - 30;
      break;
    }
    if ((npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) && corruption >= 61 && !npc._corruptionForced) {
      hintText = '[G] Black Market';
      hintX = npc.x - camX;
      hintY = npc.y - camY - 30;
      break;
    }
  }

  // Check for shop stealing
  if (!hintText && corruption >= 41) {
    var shop = _getPlayerInsideShop();
    if (shop) {
      hintText = '[G] Steal';
      hintX = p.x - camX;
      hintY = p.y - camY - 35;
    }
  }

  if (hintText) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    var tw = ctx.measureText(hintText).width;
    ctx.fillRect(hintX - tw / 2 - 4, hintY - 8, tw + 8, 14);
    ctx.fillStyle = '#ff6644';
    ctx.fillText(hintText, hintX, hintY + 2);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// §22  CORRUPTION ACHIEVEMENT HOOKS
// ─────────────────────────────────────────────
// The game.js already has achievement checks. We add support for
// corruption-related achievements by exposing state.

function getCorruptionLevel() {
  return game.corruption || 0;
}

function isOutlawAlly() {
  return _outlawAllianceActive;
}

function getShakedownCount() {
  return game.shakedownsPerformed || 0;
}

// ─────────────────────────────────────────────
// §23  SAVE/LOAD SUPPORT
// ─────────────────────────────────────────────
// Hook into existing save/load by storing corruption data on game object.
// Since game.js serializes the game object, corruption/bodyguards/etc.
// are already included if they're properties of game.

// On load, re-initialize transient state
function onCorruptionLoad() {
  _corruptionInitialized = false;
  _revoltTriggered = (game.corruption || 0) >= 90;
  _marshalSpawned = (game.corruption || 0) >= 100;
  _outlawAllianceActive = (game.corruption || 0) >= 61;
  _lastCorruptionTier = getCorruptionTier(game.corruption || 0).name;
  _shakedownPriceIncrease = {};
  _townAlarmActive = false;
  _bodyguardRespawnTimer = 0;
  _bountyHunterTimer = 0;
  // Restore bodyguards array if not present
  if (!game.bodyguards) game.bodyguards = [];
  _maxBodyguards = game._maxBodyguards || 2;
}

// ─────────────────────────────────────────────
// §24  BUY BODYGUARDS (B key)
// ─────────────────────────────────────────────
function _handleBuyBodyguard() {
  if (!consumeKey('KeyB')) return;
  if (game.state !== 'playing') return;

  var corruption = game.corruption || 0;
  if (corruption < 21) {
    showNotification('You need corruption 21+ to hire bodyguards. (Press G near NPCs to build corruption)');
    return;
  }

  if (_buyBodyguardCooldown > 0) {
    showNotification('Wait before hiring another bodyguard.');
    return;
  }

  var aliveCount = 0;
  for (var i = 0; i < game.bodyguards.length; i++) {
    if (!game.bodyguards[i].dead) aliveCount++;
  }

  // Pricing: each additional bodyguard costs more
  var baseCost = 100;
  var cost = baseCost + (_maxBodyguards - 2) * 75;
  var maxCap = 10;

  if (_maxBodyguards >= maxCap) {
    showNotification('Maximum bodyguards reached (' + maxCap + '). You have an army!');
    return;
  }

  if (game.gold < cost) {
    showNotification('Need $' + cost + ' to hire a bodyguard. You have $' + game.gold + '.');
    return;
  }

  game.gold -= cost;
  _maxBodyguards++;
  game._maxBodyguards = _maxBodyguards;
  _spawnBodyguard(game.bodyguards.length);
  _buyBodyguardCooldown = 3;

  var nextCost = baseCost + (_maxBodyguards - 2) * 75;
  showNotification('Hired bodyguard #' + _maxBodyguards + '! -$' + cost + ' (Next: $' + nextCost + ')');
  addJournalEntry('Hired bodyguard #' + _maxBodyguards + ' for $' + cost + '.');
  if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
}
