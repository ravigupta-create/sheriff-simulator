'use strict';

// ============================================================
// MULTI-TOWN SYSTEM — Sheriff Simulator Extension
// Loaded AFTER game.js, office.js, corruption.js, features.js, minigames.js
// Uses globals: game, ctx, canvas, TILE, MAP_W, MAP_H, WORLD_W, WORLD_H,
// keys, keysJustPressed, consumeKey, clearJustPressed,
// rand, randF, dist, clamp, lerp, angleBetween,
// showNotification, addJournalEntry, addFloatingText,
// addXP, addCombo, audio, canMove, createNPC,
// particles, bullets, triggerShake,
// PALETTE, BUILDING_TYPES, NPC_TYPES, DIFFICULTY,
// generateTown, generateNPCs, _inputBlockedByMinigameOrFeature
// ============================================================

// ─────────────────────────────────────────────
// §1  TOWN DATA — 5 towns with biome configs
// ─────────────────────────────────────────────

const TOWN_DATA = [
  { id: 'dusty_gulch', name: 'Dusty Gulch', biome: 'desert', desc: 'Your home town — where it all began.',
    palette: { sand: '#c4a55a', sandDark: '#a68a3e', road: '#9e8b6e' },
    difficulty: 1, unlocked: true, mapX: 0.2, mapY: 0.5 },
  { id: 'silver_peak', name: 'Silver Peak', biome: 'mountain', desc: 'A mining town in the mountains.',
    palette: { sand: '#8a8a7a', sandDark: '#6a6a5a', road: '#7a7a6a' },
    difficulty: 2, unlocked: false, mapX: 0.4, mapY: 0.25 },
  { id: 'riverside', name: 'Riverside', biome: 'river', desc: 'A prosperous river town.',
    palette: { sand: '#9aaa6a', sandDark: '#7a8a4a', road: '#8a9a5a' },
    difficulty: 3, unlocked: false, mapX: 0.6, mapY: 0.6 },
  { id: 'fort_desolation', name: 'Fort Desolation', biome: 'frontier', desc: 'A lawless frontier fort.',
    palette: { sand: '#b8a080', sandDark: '#988060', road: '#a89070' },
    difficulty: 4, unlocked: false, mapX: 0.8, mapY: 0.35 },
  { id: 'perdition', name: 'Perdition', biome: 'ghost', desc: 'An eerie ghost town where the dead whisper.',
    palette: { sand: '#7a7a8a', sandDark: '#5a5a6a', road: '#6a6a7a' },
    difficulty: 5, unlocked: false, mapX: 0.5, mapY: 0.15 },
];

// ─────────────────────────────────────────────
// §2  CRIME BOSS DATA
// ─────────────────────────────────────────────

const CRIME_BOSSES = [
  { id: 'rattlesnake_pete', name: 'Rattlesnake Pete', town: 'silver_peak',
    personality: 'cunning', gang: 'Sidewinder Gang', weapon: 'Boomstick',
    ability: 'Smoke Bomb', hp: 30, damage: 3,
    lines: [
      'You think you can slither into MY mine?',
      'Every snake has its day, Sheriff.',
      'The Sidewinders will swallow you whole!',
      'I\'ve been waiting for someone stupid enough to challenge me.',
      'You smell that? That\'s fear. Yours.',
    ],
    lieutenants: [
      { id: 'sidewinder_sal', name: 'Sidewinder Sal', hp: 15, damage: 2, weapon: 'Shotgun',
        lines: ['Pete sends his regards.', 'You\'re trespassing on Sidewinder turf.'] },
      { id: 'fangs_mcgee', name: 'Fangs McGee', hp: 18, damage: 2, weapon: 'Twin Pistols',
        lines: ['Fastest draw in the mountains, pal.', 'They call me Fangs for a reason.'] },
    ]
  },
  { id: 'iron_belle', name: 'Iron Belle', town: 'riverside',
    personality: 'ruthless', gang: 'River Rats', weapon: 'Venom Blade',
    ability: 'Poison Cloud', hp: 35, damage: 4,
    lines: [
      'The river runs red when I\'m done with lawmen.',
      'My blade has tasted better blood than yours.',
      'The River Rats own every dock from here to Mexico.',
      'You think a badge makes you brave? How cute.',
      'I\'ll feed you to the catfish.',
    ],
    lieutenants: [
      { id: 'gator_tom', name: 'Gator Tom', hp: 18, damage: 3, weapon: 'Machete',
        lines: ['Belle told me to gut you.', 'Down by the river, nobody hears screaming.'] },
      { id: 'mudcat_mary', name: 'Mudcat Mary', hp: 16, damage: 3, weapon: 'Rifle',
        lines: ['I can hit a fly at 200 yards.', 'River Rats don\'t take prisoners.'] },
    ]
  },
  { id: 'colonel_graves', name: 'Colonel Graves', town: 'fort_desolation',
    personality: 'military', gang: 'Desolation Company', weapon: 'Repeater',
    ability: 'Barrage', hp: 40, damage: 5,
    lines: [
      'Fall in line or fall in the ground, Sheriff.',
      'I didn\'t survive the war to lose to you.',
      'The Desolation Company will march on every town.',
      'Discipline. Precision. Annihilation.',
      'You\'re outgunned, outmanned, and outmatched.',
    ],
    lieutenants: [
      { id: 'sergeant_flint', name: 'Sergeant Flint', hp: 22, damage: 4, weapon: 'Saber',
        lines: ['Colonel\'s orders: eliminate the Sheriff.', 'At attention, maggot!'] },
      { id: 'corporal_black', name: 'Corporal Black', hp: 20, damage: 4, weapon: 'Gatling Pistol',
        lines: ['You\'re walking into a killzone.', 'The Company doesn\'t negotiate.'] },
    ]
  },
  { id: 'the_specter', name: 'The Specter', town: 'perdition',
    personality: 'mysterious', gang: 'Ghost Riders', weapon: 'Ghost Gun',
    ability: 'Vanish', hp: 45, damage: 6,
    lines: [
      '...',
      'You cannot kill what is already dead.',
      'Perdition awaits you, lawman.',
      'The Ghost Riders ride between worlds.',
      'Do you hear them? The whispers? They speak your name.',
    ],
    lieutenants: [
      { id: 'phantom_jack', name: 'Phantom Jack', hp: 24, damage: 5, weapon: 'Spectral Chains',
        lines: ['The Specter sees all.', 'You\'re already a ghost. You just don\'t know it.'] },
      { id: 'banshee_rose', name: 'Banshee Rose', hp: 22, damage: 5, weapon: 'Wailing Whip',
        lines: ['Can you hear my song, Sheriff?', 'The dead don\'t stay dead in Perdition.'] },
    ]
  },
];

// ─────────────────────────────────────────────
// §3  ENDGAME BOSS
// ─────────────────────────────────────────────

const SYNDICATE_BOSS = {
  id: 'the_syndicate', name: 'The Syndicate', hp: 60, damage: 8,
  weapon: 'Golden Revolver', ability: 'Call Reinforcements',
  lines: [
    'You thought the bosses were the real power? Amusing.',
    'I OWN this territory. All of it. Even you.',
    'The badge means nothing against gold.',
    'Every sheriff before you joined or died.',
    'Welcome to the end of the line, Marshal.',
  ],
};

// ─────────────────────────────────────────────
// §4  TRAVEL TIPS
// ─────────────────────────────────────────────

const TRAVEL_TIPS = [
  'Press E near NPCs to talk and gather intel.',
  'Higher difficulty towns have tougher outlaws but better rewards.',
  'Appointing a deputy in a controlled town generates income.',
  'Smuggling routes require 40+ corruption to establish.',
  'Building upgrades boost town prosperity.',
  'Trade routes between controlled towns earn passive income.',
  'Infiltrate a town by talking to 5+ NPCs over 3-5 days.',
  'Each boss has 2 lieutenants — defeat them to weaken the boss.',
  'Weaken missions reduce a boss\'s influence meter.',
  'At 0 influence, you can trigger the final showdown.',
  'Controlled towns may be raided by enemy gangs.',
  'Rival sheriffs can be encountered during travel.',
  'Each town tracks its own reputation separately.',
  'Crimes in one town can make you wanted across borders.',
  'Town festivals boost prosperity and reputation.',
  'The territory control map shows your empire at a glance.',
  'Invest $500 to build the railroad for instant travel.',
  'The stagecoach offers fast travel for a fee.',
  'Conquered towns fly your flag and generate income.',
  'Watch out for bandits on the road between towns.',
  'Rattlesnake Pete controls Silver Peak — cunning and deadly.',
  'Iron Belle rules Riverside with an iron fist.',
  'Colonel Graves runs Fort Desolation like a military camp.',
  'The Specter haunts Perdition — few have seen and survived.',
  'Build a watchtower to see incoming gang raids earlier.',
  'A jail upgrade reduces the chance of prisoner escapes.',
  'The doctor upgrade lets injured NPCs heal faster.',
  'Keep prosperity high to attract traders and events.',
  'Conquer all 5 towns to face the ultimate challenge.',
  'Your empire income is collected at the start of each day.',
];

// ─────────────────────────────────────────────
// §5  WEAKEN MISSION TEMPLATES
// ─────────────────────────────────────────────

const WEAKEN_MISSION_TEMPLATES = [
  { id: 'destroy_cache', name: 'Destroy Supply Cache', desc: 'Find and destroy the gang\'s hidden supply cache.',
    timeLimit: 120, influenceReduction: 20, goldReward: 40, xpReward: 30 },
  { id: 'rescue_npc', name: 'Rescue Hostage', desc: 'Rescue the kidnapped townsperson before time runs out.',
    timeLimit: 90, influenceReduction: 25, goldReward: 50, xpReward: 40 },
  { id: 'intercept_shipment', name: 'Intercept Shipment', desc: 'Intercept the gang\'s weapon shipment at the edge of town.',
    timeLimit: 100, influenceReduction: 20, goldReward: 45, xpReward: 35 },
  { id: 'turn_lieutenant', name: 'Turn a Lieutenant', desc: 'Convince a gang member to betray their boss.',
    timeLimit: 150, influenceReduction: 15, goldReward: 30, xpReward: 25 },
  { id: 'expose_corruption', name: 'Expose Corruption', desc: 'Find evidence of the boss\'s corruption and spread it.',
    timeLimit: 130, influenceReduction: 20, goldReward: 35, xpReward: 30 },
];

// ─────────────────────────────────────────────
// §6  TOWN UPGRADE DEFINITIONS
// ─────────────────────────────────────────────

const TOWN_UPGRADES = {
  watchtower: { name: 'Watchtower', cost: 200, desc: 'Early warning for gang raids (+30s warning)', prosperityBonus: 5 },
  jail:       { name: 'Jail Upgrade', cost: 150, desc: 'Reduce prisoner escapes by 50%', prosperityBonus: 3 },
  doctor:     { name: 'Doctor\'s Office', cost: 250, desc: 'Injured NPCs heal faster, +2 HP tonics', prosperityBonus: 8 },
  saloon:     { name: 'Saloon Expansion', cost: 175, desc: 'More gold from town events', prosperityBonus: 5 },
  stables:    { name: 'Improved Stables', cost: 125, desc: 'Faster horse travel from this town', prosperityBonus: 3 },
};

// ─────────────────────────────────────────────
// §7  TOWN EVENT TEMPLATES
// ─────────────────────────────────────────────

const TOWN_EVENTS = [
  { id: 'harvest_festival', name: 'Harvest Festival', desc: 'The town celebrates the harvest!',
    duration: 1, prosperityBonus: 5, goldBonus: 20, repBonus: 5 },
  { id: 'cattle_drive', name: 'Cattle Drive', desc: 'A cattle drive passes through town.',
    duration: 1, prosperityBonus: 3, goldBonus: 30, repBonus: 2 },
  { id: 'traveling_show', name: 'Traveling Show', desc: 'A traveling show entertains the townsfolk.',
    duration: 1, prosperityBonus: 4, goldBonus: 15, repBonus: 4 },
  { id: 'gold_rush', name: 'Gold Rush Rumor', desc: 'Rumors of gold bring prospectors to town.',
    duration: 2, prosperityBonus: 8, goldBonus: 50, repBonus: 3 },
  { id: 'drought', name: 'Drought', desc: 'A drought hits the town. Prosperity suffers.',
    duration: 2, prosperityBonus: -10, goldBonus: 0, repBonus: -3 },
  { id: 'plague', name: 'Illness Outbreak', desc: 'Sickness spreads through town.',
    duration: 2, prosperityBonus: -8, goldBonus: 0, repBonus: -2 },
  { id: 'market_day', name: 'Market Day', desc: 'Traders set up stalls. Goods are cheap!',
    duration: 1, prosperityBonus: 3, goldBonus: 25, repBonus: 2 },
  { id: 'barn_raising', name: 'Barn Raising', desc: 'The community comes together to build.',
    duration: 1, prosperityBonus: 6, goldBonus: 10, repBonus: 5 },
];

// ─────────────────────────────────────────────
// §8  TRAVEL ENCOUNTER TEMPLATES
// ─────────────────────────────────────────────

const TRAVEL_ENCOUNTER_TYPES = [
  { id: 'bandit_ambush', name: 'Bandit Ambush', weight: 30, minDifficulty: 1 },
  { id: 'broken_wagon', name: 'Broken Wagon', weight: 25, minDifficulty: 1 },
  { id: 'rattlesnake', name: 'Rattlesnake!', weight: 20, minDifficulty: 1 },
  { id: 'fellow_traveler', name: 'Fellow Traveler', weight: 15, minDifficulty: 1 },
  { id: 'sandstorm', name: 'Sandstorm', weight: 10, minDifficulty: 2 },
  { id: 'rival_sheriff', name: 'Rival Sheriff', weight: 8, minDifficulty: 3 },
  { id: 'abandoned_camp', name: 'Abandoned Camp', weight: 12, minDifficulty: 1 },
  { id: 'injured_horse', name: 'Injured Horse', weight: 10, minDifficulty: 1 },
];

// ─────────────────────────────────────────────
// §9  LAZY INIT
// ─────────────────────────────────────────────

function initTowns() {
  if (game._towns) return;

  var towns = {};
  for (var i = 0; i < TOWN_DATA.length; i++) {
    var td = TOWN_DATA[i];
    towns[td.id] = {
      visited: td.id === 'dusty_gulch',
      controlled: td.id === 'dusty_gulch',
      prosperity: td.id === 'dusty_gulch' ? 50 : 30,
      deputy: null,
      upgrades: {},
      reputation: td.id === 'dusty_gulch' ? (game.reputation || 50) : 0,
      bossInfluence: td.id === 'dusty_gulch' ? 0 : 100,
      infiltrationProgress: 0,
      infiltrationDays: 0,
      npcsSpoken: [],
      missionsCompleted: [],
      activeMission: null,
      events: [],
      eventCooldown: 0,
      unlocked: td.unlocked,
      savedMap: null,
      savedBuildings: null,
      savedNpcs: null,
    };
  }

  var bossStates = {};
  for (var b = 0; b < CRIME_BOSSES.length; b++) {
    var boss = CRIME_BOSSES[b];
    bossStates[boss.id] = {
      defeated: false,
      influence: 100,
      lieutenantsDefeated: [],
      showdownPhase: 0,
      showdownActive: false,
      encountered: false,
    };
  }

  game._towns = {
    currentTown: 'dusty_gulch',
    towns: towns,
    travelActive: false,
    travelFrom: '',
    travelTo: '',
    travelProgress: 0,
    travelDuration: 0,
    travelEncounters: [],
    travelEncounterActive: null,
    travelEncounterResolved: false,
    mapOpen: false,
    mapSelected: 0,
    bossStates: bossStates,
    tradeRoutes: [],
    smugglingRoutes: [],
    railroadBuilt: false,
    syndicateDefeated: false,
    syndicateActive: false,
    syndicatePhase: 0,
    totalEmpireIncome: 0,
    dayIncomeCollected: false,
    travelTips: TRAVEL_TIPS.slice(),
    travelTipIndex: 0,
    // travel scene state
    travelParallax: [0, 0, 0],
    travelHorseFrame: 0,
    travelHorseTimer: 0,
    travelSceneBiome: 'desert',
    travelStagecoachAvailable: false,
    travelStagecoachCost: 0,
    travelConfirmStagecoach: false,
    // encounter state
    encounterEnemies: [],
    encounterPlayerHP: 0,
    encounterQTE: null,
    encounterQTETimer: 0,
    encounterQTETarget: 0,
    encounterQTEHits: 0,
    encounterDialog: null,
    encounterDialogChoice: 0,
    encounterResult: null,
    encounterResultTimer: 0,
    // retaliation
    retaliationTimer: 0,
    retaliationActive: null,
    retaliationEnemies: [],
    retaliationWarning: 0,
    // boss fight state
    bossFightActive: false,
    bossFightBoss: null,
    bossFightHP: 0,
    bossFightMaxHP: 0,
    bossFightPlayerHP: 0,
    bossFightPhase: 0,
    bossFightTimer: 0,
    bossFightCooldown: 0,
    bossFightDodgeTimer: 0,
    bossFightAbilityTimer: 0,
    bossFightAbilityActive: false,
    bossFightQTE: false,
    bossFightQTETimer: 0,
    bossFightQTETarget: 0,
    bossFightQTEHits: 0,
    bossFightDialog: '',
    bossFightDialogTimer: 0,
    // lieutenant fight
    lieutenantFightActive: false,
    lieutenantFightData: null,
    lieutenantFightHP: 0,
    lieutenantFightPlayerHP: 0,
    lieutenantFightCooldown: 0,
    // territory overlay
    territoryOverlayOpen: false,
    // empire stats overlay
    empireStatsOpen: false,
    // railroad
    railroadInvestment: 0,
    // previous game state (for overlay restoration)
    _prevState: null,
  };
}

// ─────────────────────────────────────────────
// §10  HELPER FUNCTIONS
// ─────────────────────────────────────────────

function _getTownData(townId) {
  for (var i = 0; i < TOWN_DATA.length; i++) {
    if (TOWN_DATA[i].id === townId) return TOWN_DATA[i];
  }
  return null;
}

function _getTownIndex(townId) {
  for (var i = 0; i < TOWN_DATA.length; i++) {
    if (TOWN_DATA[i].id === townId) return i;
  }
  return -1;
}

function _getBossForTown(townId) {
  for (var i = 0; i < CRIME_BOSSES.length; i++) {
    if (CRIME_BOSSES[i].town === townId) return CRIME_BOSSES[i];
  }
  return null;
}

function _getTravelDistance(fromId, toId) {
  var from = _getTownData(fromId);
  var to = _getTownData(toId);
  if (!from || !to) return 1;
  var dx = from.mapX - to.mapX;
  var dy = from.mapY - to.mapY;
  return Math.sqrt(dx * dx + dy * dy);
}

function _getRouteDifficulty(fromId, toId) {
  var from = _getTownData(fromId);
  var to = _getTownData(toId);
  if (!from || !to) return 1;
  return Math.max(from.difficulty, to.difficulty);
}

function _getDifficultyMultiplier(townId) {
  var td = _getTownData(townId);
  if (!td) return 1;
  return 0.8 + (td.difficulty * 0.3);
}

function _getStagecoachCost(fromId, toId) {
  var distance = _getTravelDistance(fromId, toId);
  return Math.floor(50 + distance * 300);
}

function _isAtTownEdge() {
  if (!game.player) return false;
  var p = game.player;
  return p.x < 48 || p.x > WORLD_W - 48 || p.y < 48 || p.y > WORLD_H - 48;
}

function _countControlledTowns() {
  if (!game._towns) return 0;
  var count = 0;
  for (var id in game._towns.towns) {
    if (game._towns.towns[id].controlled) count++;
  }
  return count;
}

function _countDefeatedBosses() {
  if (!game._towns) return 0;
  var count = 0;
  for (var id in game._towns.bossStates) {
    if (game._towns.bossStates[id].defeated) count++;
  }
  return count;
}

function _getEmpireDailyIncome() {
  if (!game._towns) return 0;
  var income = 0;
  // Controlled towns passive income
  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    var ts = game._towns.towns[tid];
    if (!ts || !ts.controlled || tid === 'dusty_gulch') continue;
    var base = 10 + TOWN_DATA[i].difficulty * 10;
    var prospMult = 0.5 + (ts.prosperity / 100) * 1.0;
    income += Math.floor(base * prospMult);
    if (ts.deputy) income += 5;
  }
  // Trade routes
  for (var r = 0; r < game._towns.tradeRoutes.length; r++) {
    income += game._towns.tradeRoutes[r].income;
  }
  // Smuggling routes
  for (var s = 0; s < game._towns.smugglingRoutes.length; s++) {
    income += game._towns.smugglingRoutes[s].income;
  }
  return income;
}

function _allTownsControlled() {
  if (!game._towns) return false;
  for (var i = 0; i < TOWN_DATA.length; i++) {
    if (!game._towns.towns[TOWN_DATA[i].id].controlled) return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// §11  BIOME TOWN GENERATION
// ─────────────────────────────────────────────

function generateBiomeTown(townId) {
  var td = _getTownData(townId);
  if (!td) return generateTown();

  var result = generateTown();
  var map = result.map;
  var buildings = result.buildings;

  // Recolor sand tiles based on biome
  // Tile types: 0=sand, 1=road, 5=water, 6=cactus, 7=rock, 9=grass
  // We store the palette in game._towns for rendering

  if (td.biome === 'mountain') {
    // More rocks, add pine tree tiles (use rock tile), fewer cacti
    for (var y = 0; y < MAP_H; y++) {
      for (var x = 0; x < MAP_W; x++) {
        if (map[y][x] === 6) {
          // Replace cacti with rocks (pines) 70% of time
          if (Math.random() < 0.7) map[y][x] = 7;
        }
      }
    }
    // Add extra rocks
    var placed = 0;
    while (placed < 30) {
      var rx = rand(1, MAP_W - 2);
      var ry = rand(1, MAP_H - 2);
      if (map[ry][rx] === 0) { map[ry][rx] = 7; placed++; }
    }
  } else if (td.biome === 'river') {
    // Add river through town, more grass
    var riverY = 25;
    for (var x = 0; x < MAP_W; x++) {
      var wy = riverY + Math.floor(Math.sin(x * 0.15) * 2);
      for (var dy = -1; dy <= 1; dy++) {
        var ty = wy + dy;
        if (ty >= 0 && ty < MAP_H) {
          if (map[ty][x] === 0 || map[ty][x] === 6 || map[ty][x] === 7) {
            map[ty][x] = 5;
          }
        }
      }
      // Grass borders
      for (var dy2 = -3; dy2 <= 3; dy2++) {
        var ty2 = wy + dy2;
        if (ty2 >= 0 && ty2 < MAP_H && map[ty2][x] === 0) {
          if (Math.random() < 0.4) map[ty2][x] = 9;
        }
      }
    }
    // Replace some cacti with grass
    for (var y = 0; y < MAP_H; y++) {
      for (var x = 0; x < MAP_W; x++) {
        if (map[y][x] === 6 && Math.random() < 0.6) map[y][x] = 9;
      }
    }
  } else if (td.biome === 'frontier') {
    // Add barricade tiles (using fence tile 10), extra defenses
    // Perimeter barricades
    for (var x = 5; x < MAP_W - 5; x++) {
      if (map[5][x] === 0) map[5][x] = 10;
      if (map[MAP_H - 6][x] === 0) map[MAP_H - 6][x] = 10;
    }
    for (var y = 5; y < MAP_H - 5; y++) {
      if (map[y][5] === 0) map[y][5] = 10;
      if (map[y][MAP_W - 6] === 0) map[y][MAP_W - 6] = 10;
    }
    // Gate openings
    var gatePositions = [
      { x: Math.floor(MAP_W / 2), y: 5 },
      { x: Math.floor(MAP_W / 2), y: MAP_H - 6 },
      { x: 5, y: Math.floor(MAP_H / 2) },
      { x: MAP_W - 6, y: Math.floor(MAP_H / 2) },
    ];
    for (var g = 0; g < gatePositions.length; g++) {
      var gp = gatePositions[g];
      for (var gd = -1; gd <= 1; gd++) {
        if (gp.x === 5 || gp.x === MAP_W - 6) {
          if (gp.y + gd >= 0 && gp.y + gd < MAP_H) map[gp.y + gd][gp.x] = 1;
        } else {
          if (gp.x + gd >= 0 && gp.x + gd < MAP_W) map[gp.y][gp.x + gd] = 1;
        }
      }
    }
  } else if (td.biome === 'ghost') {
    // Replace some walls with broken walls (sand), remove some cacti, add fog effect
    for (var y = 0; y < MAP_H; y++) {
      for (var x = 0; x < MAP_W; x++) {
        // Random wall destruction
        if (map[y][x] === 3 && Math.random() < 0.15) {
          map[y][x] = 7; // rubble (rock)
        }
        // Remove many cacti — ghost towns are barren
        if (map[y][x] === 6 && Math.random() < 0.5) {
          map[y][x] = 0;
        }
        // Darken grass to dead
        if (map[y][x] === 9 && Math.random() < 0.7) {
          map[y][x] = 0;
        }
      }
    }
    // Scatter more rocks (rubble)
    var placed2 = 0;
    while (placed2 < 25) {
      var rx2 = rand(1, MAP_W - 2);
      var ry2 = rand(1, MAP_H - 2);
      if (map[ry2][rx2] === 0) { map[ry2][rx2] = 7; placed2++; }
    }
  }

  return { map: map, buildings: buildings };
}

// ─────────────────────────────────────────────
// §12  TOWN SWITCHING
// ─────────────────────────────────────────────

function _saveCurrTown() {
  if (!game._towns) return;
  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts) return;
  ts.savedMap = game.map;
  ts.savedBuildings = game.buildings;
  ts.savedNpcs = game.npcs;
}

function _loadTown(townId) {
  if (!game._towns) return;
  var ts = game._towns.towns[townId];
  if (!ts) return;

  game._towns.currentTown = townId;

  if (ts.savedMap && ts.savedBuildings && ts.savedNpcs) {
    // Restore saved state
    game.map = ts.savedMap;
    game.buildings = ts.savedBuildings;
    game.npcs = ts.savedNpcs;
  } else {
    // Generate new town
    var result = generateBiomeTown(townId);
    game.map = result.map;
    game.buildings = result.buildings;
    game.npcs = generateNPCs(result.buildings);
    ts.savedMap = game.map;
    ts.savedBuildings = game.buildings;
    ts.savedNpcs = game.npcs;

    // Scale NPCs for difficulty
    var mult = _getDifficultyMultiplier(townId);
    for (var n = 0; n < game.npcs.length; n++) {
      var npc = game.npcs[n];
      if (npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) {
        npc.hp = Math.ceil(npc.hp * mult);
        npc.maxHp = npc.hp;
      }
    }
  }

  // Place player at town entrance
  game.player.x = WORLD_W / 2;
  game.player.y = WORLD_H - 64;

  ts.visited = true;

  var td = _getTownData(townId);
  if (td) {
    showNotification('Arrived in ' + td.name + ' — ' + td.desc, 'good');
    addJournalEntry('Arrived in ' + td.name + '.');
  }
}

// ─────────────────────────────────────────────
// §13  TRAVEL MAP SCREEN
// ─────────────────────────────────────────────

function _openTravelMap() {
  if (!game._towns) return;
  if (game._towns.mapOpen) return;
  if (game._towns.travelActive) return;
  if (game._towns.bossFightActive) return;

  game._towns.mapOpen = true;
  game._towns.mapSelected = _getTownIndex(game._towns.currentTown);
  if (game._towns.mapSelected < 0) game._towns.mapSelected = 0;
  game._towns._prevState = game.state;
}

function _closeTravelMap() {
  if (!game._towns) return;
  game._towns.mapOpen = false;
  game._towns.travelConfirmStagecoach = false;
}

function _updateTravelMap() {
  if (!game._towns || !game._towns.mapOpen) return;

  // Navigation
  if (consumeKey('ArrowLeft') || consumeKey('KeyA')) {
    game._towns.mapSelected = (game._towns.mapSelected - 1 + TOWN_DATA.length) % TOWN_DATA.length;
    game._towns.travelConfirmStagecoach = false;
    if (audio && audio.playDing) audio.playDing();
  }
  if (consumeKey('ArrowRight') || consumeKey('KeyD')) {
    game._towns.mapSelected = (game._towns.mapSelected + 1) % TOWN_DATA.length;
    game._towns.travelConfirmStagecoach = false;
    if (audio && audio.playDing) audio.playDing();
  }
  if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
    game._towns.mapSelected = (game._towns.mapSelected - 1 + TOWN_DATA.length) % TOWN_DATA.length;
    game._towns.travelConfirmStagecoach = false;
    if (audio && audio.playDing) audio.playDing();
  }
  if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
    game._towns.mapSelected = (game._towns.mapSelected + 1) % TOWN_DATA.length;
    game._towns.travelConfirmStagecoach = false;
    if (audio && audio.playDing) audio.playDing();
  }

  // Travel (E key)
  if (consumeKey('KeyE')) {
    var selTown = TOWN_DATA[game._towns.mapSelected];
    if (!selTown) return;

    if (selTown.id === game._towns.currentTown) {
      showNotification('You are already in ' + selTown.name + '.', 'bad');
      return;
    }

    if (!game._towns.towns[selTown.id].unlocked) {
      showNotification(selTown.name + ' is not yet accessible.', 'bad');
      return;
    }

    // Check for railroad instant travel
    if (game._towns.railroadBuilt) {
      _startTownTransition(selTown.id, true);
      return;
    }

    // Check for stagecoach option
    var fromTs = game._towns.towns[game._towns.currentTown];
    var toTs = game._towns.towns[selTown.id];
    if (toTs.visited && !game._towns.travelConfirmStagecoach) {
      // Offer stagecoach
      var cost = _getStagecoachCost(game._towns.currentTown, selTown.id);
      game._towns.travelStagecoachCost = cost;
      game._towns.travelStagecoachAvailable = true;
      // Start horse travel
      _startTravel(selTown.id);
      return;
    }

    _startTravel(selTown.id);
  }

  // Stagecoach (F key)
  if (consumeKey('KeyF')) {
    var selTown2 = TOWN_DATA[game._towns.mapSelected];
    if (!selTown2 || selTown2.id === game._towns.currentTown) return;
    if (!game._towns.towns[selTown2.id].unlocked) return;
    if (!game._towns.towns[selTown2.id].visited) {
      showNotification('Must visit ' + selTown2.name + ' first for stagecoach.', 'bad');
      return;
    }
    var cost2 = _getStagecoachCost(game._towns.currentTown, selTown2.id);
    if (game.gold < cost2) {
      showNotification('Not enough gold! Need $' + cost2 + '.', 'bad');
      return;
    }
    game.gold -= cost2;
    showNotification('Paid $' + cost2 + ' for stagecoach to ' + selTown2.name + '.', 'good');
    _startTownTransition(selTown2.id, false);
  }

  // Close (Escape)
  if (consumeKey('Escape')) {
    _closeTravelMap();
  }
}

function _renderTravelMap() {
  if (!game._towns || !game._towns.mapOpen) return;

  var w = canvas.width;
  var h = canvas.height;

  // Parchment background
  ctx.fillStyle = 'rgba(20, 12, 4, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // Parchment inner
  var mx = 40, my = 30;
  var pw = w - mx * 2, ph = h - my * 2;
  ctx.fillStyle = '#d4b896';
  ctx.fillRect(mx, my, pw, ph);

  // Parchment border
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 4;
  ctx.strokeRect(mx + 2, my + 2, pw - 4, ph - 4);
  ctx.strokeStyle = '#8b6340';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx + 6, my + 6, pw - 12, ph - 12);

  // Parchment texture lines
  ctx.strokeStyle = 'rgba(139, 99, 64, 0.15)';
  ctx.lineWidth = 1;
  for (var i = 0; i < 20; i++) {
    var ly = my + 20 + i * (ph / 20);
    ctx.beginPath();
    ctx.moveTo(mx + 10, ly);
    ctx.lineTo(mx + pw - 10, ly);
    ctx.stroke();
  }

  // Title
  ctx.fillStyle = '#3a2a14';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TERRITORY MAP', w / 2, my + 40);

  // Subtitle
  ctx.font = '14px serif';
  ctx.fillStyle = '#6b4226';
  ctx.fillText('Arrow keys to select \u2022 E to ride \u2022 F for stagecoach \u2022 ESC to close', w / 2, my + 60);

  // Draw trails between towns
  ctx.strokeStyle = 'rgba(107, 66, 38, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  for (var t1 = 0; t1 < TOWN_DATA.length; t1++) {
    for (var t2 = t1 + 1; t2 < TOWN_DATA.length; t2++) {
      var td1 = TOWN_DATA[t1];
      var td2 = TOWN_DATA[t2];
      var x1 = mx + 40 + td1.mapX * (pw - 80);
      var y1 = my + 90 + td1.mapY * (ph - 160);
      var x2 = mx + 40 + td2.mapX * (pw - 80);
      var y2 = my + 90 + td2.mapY * (ph - 160);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  // Railroad overlay if built
  if (game._towns.railroadBuilt) {
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    for (var t1r = 0; t1r < TOWN_DATA.length; t1r++) {
      for (var t2r = t1r + 1; t2r < TOWN_DATA.length; t2r++) {
        var td1r = TOWN_DATA[t1r];
        var td2r = TOWN_DATA[t2r];
        if (!game._towns.towns[td1r.id].controlled && !game._towns.towns[td2r.id].controlled) continue;
        var xr1 = mx + 40 + td1r.mapX * (pw - 80);
        var yr1 = my + 90 + td1r.mapY * (ph - 160);
        var xr2 = mx + 40 + td2r.mapX * (pw - 80);
        var yr2 = my + 90 + td2r.mapY * (ph - 160);
        ctx.beginPath();
        ctx.moveTo(xr1, yr1);
        ctx.lineTo(xr2, yr2);
        ctx.stroke();
        // Cross ties
        var segs = 8;
        for (var s = 1; s < segs; s++) {
          var frac = s / segs;
          var sx = xr1 + (xr2 - xr1) * frac;
          var sy = yr1 + (yr2 - yr1) * frac;
          var angle = Math.atan2(yr2 - yr1, xr2 - xr1) + Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(sx + Math.cos(angle) * 4, sy + Math.sin(angle) * 4);
          ctx.lineTo(sx - Math.cos(angle) * 4, sy - Math.sin(angle) * 4);
          ctx.stroke();
        }
      }
    }
  }

  // Draw town markers
  for (var ti = 0; ti < TOWN_DATA.length; ti++) {
    var td = TOWN_DATA[ti];
    var ts = game._towns.towns[td.id];
    var tx = mx + 40 + td.mapX * (pw - 80);
    var ty = my + 90 + td.mapY * (ph - 160);
    var selected = ti === game._towns.mapSelected;
    var isCurrent = td.id === game._towns.currentTown;

    // Marker circle
    var radius = selected ? 18 : 14;
    ctx.beginPath();
    ctx.arc(tx, ty, radius, 0, Math.PI * 2);
    if (!ts.unlocked) {
      ctx.fillStyle = '#888';
    } else if (ts.controlled) {
      ctx.fillStyle = '#ffd700';
    } else if (ts.visited) {
      ctx.fillStyle = td.palette.sand;
    } else {
      ctx.fillStyle = '#aaa';
    }
    ctx.fill();
    ctx.strokeStyle = selected ? '#ffd700' : (isCurrent ? '#cc3030' : '#3a2a14');
    ctx.lineWidth = selected ? 3 : 2;
    ctx.stroke();

    // Current town indicator
    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(tx, ty, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#cc3030';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Town name
    ctx.fillStyle = selected ? '#3a2a14' : '#5a4a3a';
    ctx.font = selected ? 'bold 14px serif' : '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(td.name, tx, ty + radius + 18);

    // Controlled flag
    if (ts.controlled) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '10px serif';
      ctx.fillText('CONTROLLED', tx, ty + radius + 30);
    } else if (!ts.unlocked) {
      ctx.fillStyle = '#888';
      ctx.font = '10px serif';
      ctx.fillText('LOCKED', tx, ty + radius + 30);
    }
  }

  // Selected town info panel
  var selTd = TOWN_DATA[game._towns.mapSelected];
  var selTs = game._towns.towns[selTd.id];
  var panelX = mx + 20;
  var panelY = my + ph - 140;
  var panelW = pw - 40;
  var panelH = 120;

  ctx.fillStyle = 'rgba(58, 42, 20, 0.15)';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#3a2a14';
  ctx.font = 'bold 18px serif';
  ctx.fillText(selTd.name, panelX + 10, panelY + 24);

  ctx.font = '13px serif';
  ctx.fillStyle = '#5a4a3a';
  ctx.fillText(selTd.desc, panelX + 10, panelY + 42);

  ctx.fillText('Biome: ' + selTd.biome.charAt(0).toUpperCase() + selTd.biome.slice(1) +
    '    Danger: ' + '\u2605'.repeat(selTd.difficulty) + '\u2606'.repeat(5 - selTd.difficulty), panelX + 10, panelY + 60);

  if (selTs.controlled) {
    ctx.fillStyle = '#2a6a2a';
    ctx.fillText('Status: Under your control  |  Prosperity: ' + selTs.prosperity + '/100  |  Deputy: ' + (selTs.deputy || 'None'), panelX + 10, panelY + 78);
  } else if (selTs.visited) {
    var boss = _getBossForTown(selTd.id);
    var bossInfo = boss ? ('  |  Boss: ' + boss.name + ' (' + (game._towns.bossStates[boss.id].influence) + '% influence)') : '';
    ctx.fillStyle = '#6a3a2a';
    ctx.fillText('Status: Visited  |  Reputation: ' + selTs.reputation + bossInfo, panelX + 10, panelY + 78);
  } else if (selTs.unlocked) {
    ctx.fillStyle = '#5a4a3a';
    ctx.fillText('Status: Unexplored', panelX + 10, panelY + 78);
  } else {
    ctx.fillStyle = '#888';
    ctx.fillText('Status: Locked — Defeat the previous town\'s boss to unlock.', panelX + 10, panelY + 78);
  }

  // Distance and cost
  if (selTd.id !== game._towns.currentTown && selTs.unlocked) {
    var distance = _getTravelDistance(game._towns.currentTown, selTd.id);
    var travelTime = Math.floor(30 + distance * 60);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillText('Travel time: ~' + travelTime + 's by horse', panelX + 10, panelY + 96);
    if (selTs.visited) {
      var scCost = _getStagecoachCost(game._towns.currentTown, selTd.id);
      ctx.fillText('  |  Stagecoach: $' + scCost + ' (press F)', panelX + 220, panelY + 96);
    }
    if (game._towns.railroadBuilt) {
      ctx.fillStyle = '#2a6a2a';
      ctx.fillText('  |  Railroad: Instant travel!', panelX + 400, panelY + 96);
    }
  }

  // Empire income
  ctx.fillStyle = '#3a2a14';
  ctx.font = '12px serif';
  ctx.textAlign = 'right';
  ctx.fillText('Empire Income: $' + _getEmpireDailyIncome() + '/day  |  Towns Controlled: ' + _countControlledTowns() + '/5', mx + pw - 20, my + ph - 10);
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §14  HORSE TRAVEL SYSTEM
// ─────────────────────────────────────────────

function _startTravel(toTownId) {
  if (!game._towns) return;

  _saveCurrTown();

  var fromId = game._towns.currentTown;
  var distance = _getTravelDistance(fromId, toTownId);
  var duration = 30 + distance * 60;

  // Check if destination town has improved stables (reduces travel time)
  var fromTs = game._towns.towns[fromId];
  if (fromTs && fromTs.upgrades && fromTs.upgrades.stables) {
    duration *= 0.7;
  }

  game._towns.travelActive = true;
  game._towns.travelFrom = fromId;
  game._towns.travelTo = toTownId;
  game._towns.travelProgress = 0;
  game._towns.travelDuration = duration;
  game._towns.travelParallax = [0, 0, 0];
  game._towns.travelHorseFrame = 0;
  game._towns.travelHorseTimer = 0;
  game._towns.mapOpen = false;
  game._towns.travelConfirmStagecoach = false;
  game._towns.travelEncounterActive = null;
  game._towns.encounterResult = null;
  game._towns.encounterResultTimer = 0;

  // Determine biome for travel scene
  var toTd = _getTownData(toTownId);
  game._towns.travelSceneBiome = toTd ? toTd.biome : 'desert';

  // Generate encounters
  _generateTravelEncounters(fromId, toTownId);

  // Pick travel tip
  game._towns.travelTipIndex = rand(0, game._towns.travelTips.length - 1);

  showNotification('Riding to ' + (toTd ? toTd.name : 'unknown') + '...', 'good');
}

function _startTownTransition(toTownId, isInstant) {
  if (!game._towns) return;
  _saveCurrTown();
  _closeTravelMap();
  game._towns.travelActive = false;
  _loadTown(toTownId);
}

function _generateTravelEncounters(fromId, toId) {
  if (!game._towns) return;

  var difficulty = _getRouteDifficulty(fromId, toId);
  var numEncounters = rand(1, Math.min(3, difficulty));
  var encounters = [];

  for (var i = 0; i < numEncounters; i++) {
    // Weighted random selection
    var totalWeight = 0;
    var eligible = [];
    for (var e = 0; e < TRAVEL_ENCOUNTER_TYPES.length; e++) {
      var et = TRAVEL_ENCOUNTER_TYPES[e];
      if (et.minDifficulty <= difficulty) {
        eligible.push(et);
        totalWeight += et.weight;
      }
    }
    var roll = Math.random() * totalWeight;
    var cumulative = 0;
    var chosen = eligible[0];
    for (var j = 0; j < eligible.length; j++) {
      cumulative += eligible[j].weight;
      if (roll <= cumulative) { chosen = eligible[j]; break; }
    }

    // Trigger at evenly spaced progress points
    var triggerAt = (i + 1) / (numEncounters + 1);
    encounters.push({
      type: chosen.id,
      name: chosen.name,
      triggerProgress: triggerAt,
      triggered: false,
      resolved: false,
    });
  }

  game._towns.travelEncounters = encounters;
}

function _updateTravel(dt) {
  if (!game._towns || !game._towns.travelActive) return;

  // Handle active encounter
  if (game._towns.travelEncounterActive) {
    _updateTravelEncounter(dt);
    return;
  }

  // Handle encounter result display
  if (game._towns.encounterResult) {
    game._towns.encounterResultTimer -= dt;
    if (game._towns.encounterResultTimer <= 0) {
      game._towns.encounterResult = null;
    }
    return;
  }

  // Advance travel
  game._towns.travelProgress += dt / game._towns.travelDuration;

  // Update parallax
  game._towns.travelParallax[0] += dt * 20;  // Sky (slow)
  game._towns.travelParallax[1] += dt * 60;  // Mountains (medium)
  game._towns.travelParallax[2] += dt * 150; // Ground (fast)

  // Update horse animation
  game._towns.travelHorseTimer += dt;
  if (game._towns.travelHorseTimer > 0.15) {
    game._towns.travelHorseTimer = 0;
    game._towns.travelHorseFrame = (game._towns.travelHorseFrame + 1) % 4;
  }

  // Check for encounters
  for (var i = 0; i < game._towns.travelEncounters.length; i++) {
    var enc = game._towns.travelEncounters[i];
    if (!enc.triggered && !enc.resolved && game._towns.travelProgress >= enc.triggerProgress) {
      enc.triggered = true;
      _triggerTravelEncounter(enc);
      break;
    }
  }

  // Check completion
  if (game._towns.travelProgress >= 1.0) {
    game._towns.travelProgress = 1.0;
    game._towns.travelActive = false;
    _loadTown(game._towns.travelTo);
  }
}

function _renderTravel() {
  if (!game._towns || !game._towns.travelActive) return;

  var w = canvas.width;
  var h = canvas.height;
  var biome = game._towns.travelSceneBiome;

  // Sky layer
  var skyColor1, skyColor2;
  if (biome === 'ghost') {
    skyColor1 = '#2a2030'; skyColor2 = '#4a3a5a';
  } else if (biome === 'mountain') {
    skyColor1 = '#4a6a9a'; skyColor2 = '#8aaccc';
  } else if (biome === 'river') {
    skyColor1 = '#5a8aba'; skyColor2 = '#aaccee';
  } else if (biome === 'frontier') {
    skyColor1 = '#c08040'; skyColor2 = '#e0a060';
  } else {
    skyColor1 = '#d4a050'; skyColor2 = '#e8c880';
  }

  var grad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  grad.addColorStop(0, skyColor1);
  grad.addColorStop(1, skyColor2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Mountain/hill layer (parallax 1)
  var p1 = game._towns.travelParallax[1] % w;
  ctx.fillStyle = _getBiomeMountainColor(biome);
  _drawMountains(ctx, -p1, h * 0.35, w, h * 0.25, biome);
  _drawMountains(ctx, w - p1, h * 0.35, w, h * 0.25, biome);

  // Ground layer (parallax 2)
  var groundY = h * 0.6;
  var td = _getTownData(game._towns.travelTo);
  var groundColor = td ? td.palette.sand : '#c4a55a';
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Road
  var roadY = h * 0.72;
  ctx.fillStyle = td ? td.palette.road : '#9e8b6e';
  ctx.fillRect(0, roadY - 10, w, 20);
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, roadY - 2, w, 4);

  // Ground details scrolling
  var p2 = game._towns.travelParallax[2] % 120;
  ctx.fillStyle = td ? td.palette.sandDark : '#a68a3e';
  for (var gx = -p2; gx < w + 120; gx += 120) {
    _drawGroundDetail(ctx, gx, groundY + 15, biome);
    _drawGroundDetail(ctx, gx + 60, groundY + 40, biome);
  }

  // Horse and rider
  _drawHorseAndRider(ctx, w * 0.35, roadY - 20, game._towns.travelHorseFrame);

  // Dust particles behind horse
  var dustX = w * 0.35 - 30;
  for (var d = 0; d < 5; d++) {
    var dx = dustX - d * 12 - Math.random() * 10;
    var dy = roadY - 5 + Math.random() * 10;
    var ds = 3 + Math.random() * 4;
    ctx.globalAlpha = 0.3 - d * 0.05;
    ctx.fillStyle = '#c8b898';
    ctx.beginPath();
    ctx.arc(dx, dy, ds, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Progress bar
  var barX = w * 0.1;
  var barY = h - 40;
  var barW = w * 0.8;
  var barH = 12;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(barX, barY, barW * game._towns.travelProgress, barH);

  // Town labels on progress bar
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '11px serif';
  ctx.textAlign = 'center';
  var fromTd = _getTownData(game._towns.travelFrom);
  var toTd = _getTownData(game._towns.travelTo);
  if (fromTd) ctx.fillText(fromTd.name, barX, barY - 6);
  if (toTd) ctx.fillText(toTd.name, barX + barW, barY - 6);

  // Travel tip
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  var tip = game._towns.travelTips[game._towns.travelTipIndex % game._towns.travelTips.length];
  ctx.fillText('TIP: ' + tip, w / 2, h - 55);

  // Title
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Traveling to ' + (toTd ? toTd.name : '...'), w / 2, 30);

  ctx.textAlign = 'left';

  // Encounter result overlay
  if (game._towns.encounterResult) {
    _renderEncounterResult();
  }

  // Active encounter overlay
  if (game._towns.travelEncounterActive) {
    _renderTravelEncounter();
  }
}

function _getBiomeMountainColor(biome) {
  if (biome === 'ghost') return '#3a3040';
  if (biome === 'mountain') return '#5a6a5a';
  if (biome === 'river') return '#4a7a4a';
  if (biome === 'frontier') return '#8a7060';
  return '#8a6a4a';
}

function _drawMountains(context, offsetX, baseY, width, height, biome) {
  context.beginPath();
  context.moveTo(offsetX, baseY + height);
  var peaks = 6;
  for (var i = 0; i <= peaks; i++) {
    var px = offsetX + (i / peaks) * width;
    var peakH = height * (0.3 + Math.sin(i * 1.7 + 0.5) * 0.5 + Math.sin(i * 3.1) * 0.2);
    if (i % 2 === 0) {
      context.lineTo(px, baseY + height - peakH);
    } else {
      context.lineTo(px, baseY + height - peakH * 0.3);
    }
  }
  context.lineTo(offsetX + width, baseY + height);
  context.closePath();
  context.fill();

  // Snow caps for mountains
  if (biome === 'mountain') {
    context.fillStyle = 'rgba(255,255,255,0.4)';
    for (var j = 0; j <= peaks; j += 2) {
      var spx = offsetX + (j / peaks) * width;
      var spH = height * (0.3 + Math.sin(j * 1.7 + 0.5) * 0.5 + Math.sin(j * 3.1) * 0.2);
      context.beginPath();
      context.arc(spx, baseY + height - spH, 12, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = _getBiomeMountainColor(biome);
  }
}

function _drawGroundDetail(context, x, y, biome) {
  if (biome === 'desert' || biome === 'frontier') {
    // Cactus
    context.fillStyle = '#4a7a2e';
    context.fillRect(x, y - 15, 4, 15);
    context.fillRect(x - 5, y - 10, 5, 3);
    context.fillRect(x + 4, y - 7, 5, 3);
  } else if (biome === 'mountain') {
    // Rock
    context.fillStyle = '#6a6a5a';
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 6, y - 8);
    context.lineTo(x + 12, y);
    context.closePath();
    context.fill();
  } else if (biome === 'river') {
    // Tree
    context.fillStyle = '#5a3a1a';
    context.fillRect(x + 3, y - 10, 3, 10);
    context.fillStyle = '#3a7a2a';
    context.beginPath();
    context.arc(x + 4, y - 14, 7, 0, Math.PI * 2);
    context.fill();
  } else if (biome === 'ghost') {
    // Dead tree
    context.fillStyle = '#4a4040';
    context.fillRect(x + 2, y - 12, 3, 12);
    context.fillRect(x - 2, y - 10, 5, 2);
    context.fillRect(x + 5, y - 8, 4, 2);
  }
}

function _drawHorseAndRider(context, x, y, frame) {
  // Horse body
  var bobY = (frame === 0 || frame === 2) ? -2 : 0;
  var legOff1 = (frame === 0) ? -3 : (frame === 2) ? 3 : 0;
  var legOff2 = (frame === 1) ? -3 : (frame === 3) ? 3 : 0;

  // Horse legs
  context.fillStyle = '#5a3a1a';
  context.fillRect(x - 12 + legOff1, y + 8 + bobY, 4, 14);
  context.fillRect(x - 4 + legOff2, y + 8 + bobY, 4, 14);
  context.fillRect(x + 8 + legOff1, y + 8 + bobY, 4, 14);
  context.fillRect(x + 16 + legOff2, y + 8 + bobY, 4, 14);

  // Horse body
  context.fillStyle = '#8b6340';
  context.fillRect(x - 14, y - 4 + bobY, 36, 14);

  // Horse neck/head
  context.fillStyle = '#7a5a35';
  context.fillRect(x + 18, y - 12 + bobY, 8, 12);
  context.fillRect(x + 22, y - 18 + bobY, 10, 10);

  // Horse eye
  context.fillStyle = '#1a1a1a';
  context.fillRect(x + 28, y - 16 + bobY, 2, 2);

  // Horse mane
  context.fillStyle = '#3a2a14';
  context.fillRect(x + 18, y - 14 + bobY, 3, 8);

  // Tail
  context.fillStyle = '#3a2a14';
  context.fillRect(x - 18, y - 4 + bobY, 6, 3);
  context.fillRect(x - 20, y - 2 + bobY, 4, 6);

  // Rider body
  context.fillStyle = '#8b1a1a';
  context.fillRect(x - 2, y - 18 + bobY, 10, 14);

  // Rider head
  context.fillStyle = '#d4a574';
  context.fillRect(x, y - 26 + bobY, 8, 8);

  // Rider hat
  context.fillStyle = '#3a2a14';
  context.fillRect(x - 2, y - 30 + bobY, 12, 4);
  context.fillRect(x + 1, y - 33 + bobY, 6, 4);

  // Badge
  context.fillStyle = '#ffd700';
  context.fillRect(x + 5, y - 15 + bobY, 3, 3);
}

// ─────────────────────────────────────────────
// §15  TRAVEL ENCOUNTERS
// ─────────────────────────────────────────────

function _triggerTravelEncounter(encounter) {
  if (!game._towns) return;

  game._towns.travelEncounterActive = encounter;
  game._towns.encounterQTETimer = 0;
  game._towns.encounterQTEHits = 0;
  game._towns.encounterDialog = null;
  game._towns.encounterDialogChoice = 0;
  game._towns.encounterEnemies = [];

  var difficulty = _getRouteDifficulty(game._towns.travelFrom, game._towns.travelTo);
  var mult = _getDifficultyMultiplier(game._towns.travelTo);

  switch (encounter.type) {
    case 'bandit_ambush':
      var numBandits = rand(2, 2 + difficulty);
      game._towns.encounterPlayerHP = game.player ? game.player.hp : 10;
      for (var b = 0; b < numBandits; b++) {
        game._towns.encounterEnemies.push({
          name: 'Bandit',
          hp: Math.ceil(3 * mult),
          maxHp: Math.ceil(3 * mult),
          damage: Math.ceil(1 * mult),
          x: 0.6 + b * 0.1,
          y: 0.4 + (b % 2) * 0.15,
          attackTimer: 2 + Math.random() * 2,
          dead: false,
        });
      }
      break;
    case 'broken_wagon':
      game._towns.encounterDialog = {
        text: 'A settler\'s wagon has broken down on the trail. They plead for help.',
        choices: ['Help them (+rep, +gold)', 'Ride on past'],
      };
      game._towns.encounterDialogChoice = 0;
      break;
    case 'rattlesnake':
      game._towns.encounterQTE = 'mash_space';
      game._towns.encounterQTETimer = 5;
      game._towns.encounterQTETarget = 15;
      game._towns.encounterQTEHits = 0;
      break;
    case 'fellow_traveler':
      var hints = [
        'I heard the boss in Silver Peak has a weakness for smoke bombs.',
        'Riverside\'s docks are unguarded at night.',
        'The Colonel posts sentries every 50 paces.',
        'Perdition\'s ghosts ain\'t what they seem — just tricks and mirrors.',
        'There\'s a hidden stash behind the church in every town.',
      ];
      game._towns.encounterDialog = {
        text: 'A fellow traveler rides alongside you. "Howdy, Sheriff! Let me share what I know... ' + hints[rand(0, hints.length - 1)] + '"',
        choices: ['Thank them and ride on'],
      };
      game._towns.encounterDialogChoice = 0;
      break;
    case 'sandstorm':
      game._towns.encounterQTE = 'hold_steady';
      game._towns.encounterQTETimer = 8;
      game._towns.encounterQTETarget = 0;
      game._towns.encounterQTEHits = 0;
      break;
    case 'rival_sheriff':
      game._towns.encounterDialog = {
        text: 'A rival sheriff blocks the road. "This territory is mine, lawman. Turn back or draw!"',
        choices: ['Draw! (Fight)', 'Negotiate (Rep check)', 'Turn back (lose progress)'],
      };
      game._towns.encounterDialogChoice = 0;
      break;
    case 'abandoned_camp':
      game._towns.encounterDialog = {
        text: 'You come across an abandoned camp. Supplies and gold glint in the firelight.',
        choices: ['Search the camp (+gold)', 'Leave it alone'],
      };
      game._towns.encounterDialogChoice = 0;
      break;
    case 'injured_horse':
      game._towns.encounterDialog = {
        text: 'A wild horse stands injured on the trail, a rattlesnake bite on its leg.',
        choices: ['Help the horse (+rep)', 'Ride past'],
      };
      game._towns.encounterDialogChoice = 0;
      break;
  }
}

function _updateTravelEncounter(dt) {
  if (!game._towns || !game._towns.travelEncounterActive) return;

  var enc = game._towns.travelEncounterActive;

  switch (enc.type) {
    case 'bandit_ambush':
      _updateBanditEncounter(dt);
      break;
    case 'broken_wagon':
    case 'fellow_traveler':
    case 'abandoned_camp':
    case 'injured_horse':
      _updateDialogEncounter(dt);
      break;
    case 'rival_sheriff':
      _updateRivalSheriffEncounter(dt);
      break;
    case 'rattlesnake':
      _updateRattlesnakeEncounter(dt);
      break;
    case 'sandstorm':
      _updateSandstormEncounter(dt);
      break;
  }
}

function _updateBanditEncounter(dt) {
  if (!game._towns) return;

  var enemies = game._towns.encounterEnemies;
  var allDead = true;

  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (e.dead) continue;
    allDead = false;

    // Enemy attacks
    e.attackTimer -= dt;
    if (e.attackTimer <= 0) {
      e.attackTimer = 1.5 + Math.random() * 2;
      game._towns.encounterPlayerHP -= e.damage;
      if (audio && audio.playHit) audio.playHit();

      if (game._towns.encounterPlayerHP <= 0) {
        // Player defeated — lose some gold, return to previous town
        game._towns.encounterPlayerHP = 0;
        var lostGold = Math.min(game.gold, rand(20, 50));
        game.gold -= lostGold;
        if (game.player) game.player.hp = Math.max(1, game.player.hp - 2);
        _resolveEncounter('Ambushed! Lost $' + lostGold + ' and took damage.', 'bad');
        return;
      }
    }
  }

  // Player attacks (Space to shoot)
  if (consumeKey('Space')) {
    for (var j = 0; j < enemies.length; j++) {
      if (!enemies[j].dead) {
        enemies[j].hp -= 2;
        if (audio && audio.playShoot) audio.playShoot();
        if (enemies[j].hp <= 0) {
          enemies[j].dead = true;
          enemies[j].hp = 0;
          addFloatingText(
            canvas.width * enemies[j].x,
            canvas.height * enemies[j].y,
            'DEFEATED', '#ff4444'
          );
        }
        break;
      }
    }
  }

  // Dodge (Shift)
  if (consumeKey('ShiftLeft') || consumeKey('ShiftRight')) {
    // Dodge next attack — reset all timers
    for (var k = 0; k < enemies.length; k++) {
      if (!enemies[k].dead) enemies[k].attackTimer += 1;
    }
  }

  if (allDead) {
    var goldReward = rand(15, 30 + _getRouteDifficulty(game._towns.travelFrom, game._towns.travelTo) * 10);
    game.gold += goldReward;
    addXP(20);
    _resolveEncounter('Bandits defeated! Earned $' + goldReward + ' and 20 XP.', 'good');
  }
}

function _updateDialogEncounter(dt) {
  if (!game._towns || !game._towns.encounterDialog) return;

  var dialog = game._towns.encounterDialog;

  // Navigate choices
  if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
    game._towns.encounterDialogChoice = Math.max(0, game._towns.encounterDialogChoice - 1);
  }
  if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
    game._towns.encounterDialogChoice = Math.min(dialog.choices.length - 1, game._towns.encounterDialogChoice + 1);
  }

  // Select choice
  if (consumeKey('KeyE') || consumeKey('Enter') || consumeKey('Space')) {
    var enc = game._towns.travelEncounterActive;
    var choice = game._towns.encounterDialogChoice;

    switch (enc.type) {
      case 'broken_wagon':
        if (choice === 0) {
          var rep = rand(3, 8);
          var gold = rand(10, 25);
          game.gold += gold;
          game.reputation = clamp((game.reputation || 50) + rep, 0, 100);
          _resolveEncounter('Helped the settlers. +$' + gold + ', +' + rep + ' rep.', 'good');
        } else {
          _resolveEncounter('You ride on past the broken wagon.', 'neutral');
        }
        break;
      case 'fellow_traveler':
        addXP(5);
        _resolveEncounter('Learned a useful tip. +5 XP.', 'good');
        break;
      case 'abandoned_camp':
        if (choice === 0) {
          var loot = rand(15, 40);
          game.gold += loot;
          _resolveEncounter('Found $' + loot + ' in the abandoned camp.', 'good');
        } else {
          _resolveEncounter('You leave the camp undisturbed.', 'neutral');
        }
        break;
      case 'injured_horse':
        if (choice === 0) {
          var rep2 = rand(5, 10);
          game.reputation = clamp((game.reputation || 50) + rep2, 0, 100);
          _resolveEncounter('You tend to the horse\'s wound. +' + rep2 + ' rep.', 'good');
        } else {
          _resolveEncounter('You ride past the injured horse.', 'neutral');
        }
        break;
      case 'rival_sheriff':
        // Handled in _updateRivalSheriffEncounter
        break;
    }
  }
}

function _updateRivalSheriffEncounter(dt) {
  if (!game._towns || !game._towns.encounterDialog) return;

  var dialog = game._towns.encounterDialog;

  if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
    game._towns.encounterDialogChoice = Math.max(0, game._towns.encounterDialogChoice - 1);
  }
  if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
    game._towns.encounterDialogChoice = Math.min(dialog.choices.length - 1, game._towns.encounterDialogChoice + 1);
  }

  if (consumeKey('KeyE') || consumeKey('Enter') || consumeKey('Space')) {
    var choice = game._towns.encounterDialogChoice;

    if (choice === 0) {
      // Fight — simple duel outcome
      var playerRoll = Math.random() + (game.level || 1) * 0.05;
      var enemyRoll = Math.random() + _getRouteDifficulty(game._towns.travelFrom, game._towns.travelTo) * 0.1;
      if (playerRoll > enemyRoll) {
        var gold = rand(20, 40);
        game.gold += gold;
        addXP(25);
        _resolveEncounter('You outdrawed the rival sheriff! +$' + gold + ', +25 XP.', 'good');
      } else {
        if (game.player) game.player.hp = Math.max(1, game.player.hp - 3);
        _resolveEncounter('The rival sheriff got the better of you. Lost 3 HP.', 'bad');
      }
    } else if (choice === 1) {
      // Negotiate
      if ((game.reputation || 50) >= 60) {
        _resolveEncounter('Your reputation precedes you. The sheriff lets you pass.', 'good');
      } else {
        _resolveEncounter('The sheriff isn\'t impressed. You lose time detouring.', 'neutral');
        game._towns.travelProgress -= 0.1;
        if (game._towns.travelProgress < 0) game._towns.travelProgress = 0;
      }
    } else {
      // Turn back
      game._towns.travelProgress -= 0.15;
      if (game._towns.travelProgress < 0) game._towns.travelProgress = 0;
      _resolveEncounter('You backtrack to avoid confrontation.', 'neutral');
    }
  }
}

function _updateRattlesnakeEncounter(dt) {
  if (!game._towns) return;

  game._towns.encounterQTETimer -= dt;

  // Mash space
  if (consumeKey('Space')) {
    game._towns.encounterQTEHits++;
    if (audio && audio.playDing) audio.playDing();
  }

  if (game._towns.encounterQTETimer <= 0) {
    if (game._towns.encounterQTEHits >= game._towns.encounterQTETarget) {
      addXP(10);
      _resolveEncounter('You scared off the rattlesnake! +10 XP.', 'good');
    } else {
      if (game.player) game.player.hp = Math.max(1, game.player.hp - 2);
      _resolveEncounter('The rattlesnake bit you! Lost 2 HP.', 'bad');
    }
  }
}

function _updateSandstormEncounter(dt) {
  if (!game._towns) return;

  game._towns.encounterQTETimer -= dt;

  // Hold W to push through
  if (keys && keys['KeyW']) {
    game._towns.encounterQTEHits += dt * 3;
  }
  // Blow back if not pressing
  if (!keys || !keys['KeyW']) {
    game._towns.encounterQTEHits -= dt * 1;
    if (game._towns.encounterQTEHits < 0) game._towns.encounterQTEHits = 0;
  }

  if (game._towns.encounterQTETimer <= 0) {
    if (game._towns.encounterQTEHits >= 10) {
      addXP(15);
      _resolveEncounter('You pushed through the sandstorm! +15 XP.', 'good');
    } else {
      game._towns.travelProgress -= 0.08;
      if (game._towns.travelProgress < 0) game._towns.travelProgress = 0;
      _resolveEncounter('The sandstorm pushed you back. Lost travel progress.', 'bad');
    }
  }
}

function _resolveEncounter(message, type) {
  if (!game._towns) return;

  var enc = game._towns.travelEncounterActive;
  if (enc) enc.resolved = true;

  game._towns.travelEncounterActive = null;
  game._towns.encounterResult = { text: message, type: type };
  game._towns.encounterResultTimer = 3;

  if (type === 'good') {
    showNotification(message, 'good');
  } else if (type === 'bad') {
    showNotification(message, 'bad');
  } else {
    showNotification(message);
  }
}

function _renderTravelEncounter() {
  if (!game._towns || !game._towns.travelEncounterActive) return;

  var w = canvas.width;
  var h = canvas.height;
  var enc = game._towns.travelEncounterActive;

  // Darken background
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, w, h);

  // Encounter panel
  var px = w * 0.1;
  var py = h * 0.15;
  var pw = w * 0.8;
  var ph = h * 0.7;

  ctx.fillStyle = '#1e1208';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#8a6a38';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText(enc.name, w / 2, py + 35);

  switch (enc.type) {
    case 'bandit_ambush':
      _renderBanditEncounter(px, py, pw, ph);
      break;
    case 'broken_wagon':
    case 'fellow_traveler':
    case 'abandoned_camp':
    case 'injured_horse':
    case 'rival_sheriff':
      _renderDialogEncounter(px, py, pw, ph);
      break;
    case 'rattlesnake':
      _renderRattlesnakeEncounter(px, py, pw, ph);
      break;
    case 'sandstorm':
      _renderSandstormEncounter(px, py, pw, ph);
      break;
  }

  ctx.textAlign = 'left';
}

function _renderBanditEncounter(px, py, pw, ph) {
  var w = canvas.width;
  var enemies = game._towns.encounterEnemies;

  // Player HP
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '14px serif';
  ctx.textAlign = 'left';
  ctx.fillText('Your HP: ' + game._towns.encounterPlayerHP, px + 20, py + 65);

  // Controls hint
  ctx.fillStyle = '#a09070';
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPACE to shoot  |  SHIFT to dodge', w / 2, py + ph - 20);

  // Enemies
  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    var ex = px + 50 + i * 100;
    var ey = py + 120;

    if (e.dead) {
      ctx.fillStyle = '#666';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('X DEAD X', ex + 20, ey + 20);
      continue;
    }

    // Bandit sprite
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(ex + 10, ey, 20, 30);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ex + 8, ey - 8, 24, 10);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(ex + 12, ey - 5, 16, 12);
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(ex + 12, ey + 3, 16, 5);

    // HP bar
    ctx.fillStyle = '#440000';
    ctx.fillRect(ex + 5, ey + 35, 30, 5);
    ctx.fillStyle = '#cc3030';
    var hpFrac = e.hp / e.maxHp;
    ctx.fillRect(ex + 5, ey + 35, 30 * hpFrac, 5);

    ctx.fillStyle = '#e8d8b8';
    ctx.font = '11px serif';
    ctx.textAlign = 'center';
    ctx.fillText(e.name, ex + 20, ey + 52);
  }

  ctx.textAlign = 'left';
}

function _renderDialogEncounter(px, py, pw, ph) {
  if (!game._towns.encounterDialog) return;

  var dialog = game._towns.encounterDialog;
  var w = canvas.width;

  // Dialog text
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '14px serif';
  ctx.textAlign = 'center';

  // Word wrap
  var words = dialog.text.split(' ');
  var lines = [];
  var currentLine = '';
  var maxWidth = pw - 60;
  for (var wd = 0; wd < words.length; wd++) {
    var testLine = currentLine + (currentLine ? ' ' : '') + words[wd];
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[wd];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  for (var l = 0; l < lines.length; l++) {
    ctx.fillText(lines[l], w / 2, py + 70 + l * 20);
  }

  // Choices
  var choiceY = py + 70 + lines.length * 20 + 30;
  for (var c = 0; c < dialog.choices.length; c++) {
    var selected = c === game._towns.encounterDialogChoice;
    ctx.fillStyle = selected ? '#ffd700' : '#a09070';
    ctx.font = selected ? 'bold 15px serif' : '14px serif';
    ctx.fillText((selected ? '> ' : '  ') + dialog.choices[c], w / 2, choiceY + c * 25);
  }

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '12px serif';
  ctx.fillText('W/S to select  |  E/ENTER to choose', w / 2, py + ph - 20);

  ctx.textAlign = 'left';
}

function _renderRattlesnakeEncounter(px, py, pw, ph) {
  var w = canvas.width;

  // Rattlesnake ASCII art
  ctx.fillStyle = '#4a7a2e';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('~<:>~~~~', w / 2, py + 90);

  // Timer
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '16px serif';
  ctx.fillText('Time: ' + Math.max(0, game._towns.encounterQTETimer).toFixed(1) + 's', w / 2, py + 130);

  // Progress
  var progFrac = game._towns.encounterQTEHits / game._towns.encounterQTETarget;
  var barX = px + 40;
  var barY = py + 150;
  var barW = pw - 80;
  var barH = 20;
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = progFrac >= 1 ? '#30aa30' : '#ffd700';
  ctx.fillRect(barX, barY, barW * Math.min(1, progFrac), barH);

  ctx.fillStyle = '#e8d8b8';
  ctx.font = '13px serif';
  ctx.fillText('MASH SPACE to scare it off! (' + game._towns.encounterQTEHits + '/' + game._towns.encounterQTETarget + ')', w / 2, barY + barH + 25);

  ctx.textAlign = 'left';
}

function _renderSandstormEncounter(px, py, pw, ph) {
  var w = canvas.width;

  // Sandstorm visual
  ctx.fillStyle = 'rgba(200, 184, 152, 0.4)';
  for (var p = 0; p < 30; p++) {
    var sx = px + Math.random() * pw;
    var sy = py + 60 + Math.random() * (ph - 100);
    ctx.fillRect(sx, sy, rand(3, 12), 2);
  }

  ctx.fillStyle = '#e8d8b8';
  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Time: ' + Math.max(0, game._towns.encounterQTETimer).toFixed(1) + 's', w / 2, py + 100);

  // Progress bar
  var progFrac2 = game._towns.encounterQTEHits / 10;
  var barX2 = px + 40;
  var barY2 = py + 120;
  var barW2 = pw - 80;
  var barH2 = 20;
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(barX2, barY2, barW2, barH2);
  ctx.fillStyle = progFrac2 >= 1 ? '#30aa30' : '#e0a060';
  ctx.fillRect(barX2, barY2, barW2 * Math.min(1, progFrac2), barH2);

  ctx.fillStyle = '#e8d8b8';
  ctx.font = '13px serif';
  ctx.fillText('HOLD W to push through the storm!', w / 2, barY2 + barH2 + 25);

  ctx.textAlign = 'left';
}

function _renderEncounterResult() {
  if (!game._towns || !game._towns.encounterResult) return;

  var w = canvas.width;
  var h = canvas.height;
  var result = game._towns.encounterResult;

  var color = result.type === 'good' ? '#30aa30' : (result.type === 'bad' ? '#cc3030' : '#e8d8b8');

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(w * 0.1, h * 0.4, w * 0.8, 50);
  ctx.fillStyle = color;
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText(result.text, w / 2, h * 0.4 + 30);
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §16  INFILTRATION PHASE
// ─────────────────────────────────────────────

function _updateInfiltration(dt) {
  if (!game._towns) return;

  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || ts.controlled) return;

  var boss = _getBossForTown(ct);
  if (!boss) return;

  var bs = game._towns.bossStates[boss.id];
  if (!bs || bs.defeated) return;

  // Track NPC conversations for infiltration
  // This is checked passively — when player talks to NPCs, game.js
  // calls showDialog, which we hook into
  // For now, track it via a manual check each frame

  // Update infiltration days
  if (!ts._lastInfilDay || ts._lastInfilDay !== game.dayCount) {
    if (ts._lastInfilDay && ts.infiltrationProgress > 0) {
      ts.infiltrationDays++;
    }
    ts._lastInfilDay = game.dayCount;
  }
}

function _checkNPCSpoken(npcId) {
  if (!game._towns) return;

  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || ts.controlled) return;

  if (ts.npcsSpoken.indexOf(npcId) === -1) {
    ts.npcsSpoken.push(npcId);
    ts.infiltrationProgress = ts.npcsSpoken.length;

    if (ts.npcsSpoken.length === 3) {
      showNotification('Gathering intel... Talk to more townsfolk.', 'good');
    }
    if (ts.npcsSpoken.length >= 5 && ts.infiltrationDays >= 3) {
      showNotification('Intel gathered! Weaken missions now available.', 'good');
      addJournalEntry('Infiltrated ' + (_getTownData(ct) || {}).name + '. Ready for weaken missions.');
    }
  }
}

function _canStartWeakenMission(townId) {
  if (!game._towns) return false;
  var ts = game._towns.towns[townId];
  if (!ts) return false;
  if (ts.controlled) return false;
  if (ts.infiltrationProgress < 5 || ts.infiltrationDays < 3) return false;
  if (ts.activeMission) return false;
  return true;
}

// ─────────────────────────────────────────────
// §17  WEAKEN BOSS MISSIONS
// ─────────────────────────────────────────────

function _startWeakenMission(townId, missionIndex) {
  if (!game._towns) return;
  if (!_canStartWeakenMission(townId)) return;

  var ts = game._towns.towns[townId];
  var boss = _getBossForTown(townId);
  if (!boss) return;

  var template = WEAKEN_MISSION_TEMPLATES[missionIndex % WEAKEN_MISSION_TEMPLATES.length];
  if (ts.missionsCompleted.indexOf(template.id) !== -1) {
    showNotification('Already completed this mission here.', 'bad');
    return;
  }

  ts.activeMission = {
    templateId: template.id,
    name: template.name,
    desc: template.desc,
    timer: template.timeLimit,
    influenceReduction: template.influenceReduction,
    goldReward: template.goldReward,
    xpReward: template.xpReward,
    progress: 0,
    targetProgress: 100,
    objectiveX: rand(5, MAP_W - 5) * TILE,
    objectiveY: rand(5, MAP_H - 5) * TILE,
    completed: false,
    failed: false,
  };

  showNotification('Mission started: ' + template.name, 'good');
  addJournalEntry('Started mission: ' + template.name + ' in ' + (_getTownData(townId) || {}).name + '.');
}

function _updateWeakenMission(dt) {
  if (!game._towns) return;

  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || !ts.activeMission) return;

  var mission = ts.activeMission;
  if (mission.completed || mission.failed) return;

  // Countdown
  mission.timer -= dt;
  if (mission.timer <= 0) {
    mission.failed = true;
    ts.activeMission = null;
    showNotification('Mission failed! Time ran out.', 'bad');
    addJournalEntry('Failed mission: ' + mission.name + '.');
    return;
  }

  // Check if player is near objective
  if (game.player) {
    var dx = game.player.x - mission.objectiveX;
    var dy = game.player.y - mission.objectiveY;
    var d = Math.sqrt(dx * dx + dy * dy);

    if (d < 64) {
      // Near objective — progress by being there and pressing E
      if (consumeKey('KeyE')) {
        mission.progress += 34;
        if (audio && audio.playDing) audio.playDing();
        addFloatingText(game.player.x, game.player.y - 20, '+33%', '#ffd700');

        if (mission.progress >= mission.targetProgress) {
          _completeWeakenMission(ct);
        }
      }
    }
  }
}

function _completeWeakenMission(townId) {
  if (!game._towns) return;

  var ts = game._towns.towns[townId];
  if (!ts || !ts.activeMission) return;

  var mission = ts.activeMission;
  var boss = _getBossForTown(townId);

  mission.completed = true;
  ts.missionsCompleted.push(mission.templateId);

  // Reduce boss influence
  if (boss) {
    var bs = game._towns.bossStates[boss.id];
    if (bs) {
      bs.influence = Math.max(0, bs.influence - mission.influenceReduction);
      showNotification(boss.name + '\'s influence reduced to ' + bs.influence + '%!', 'good');

      if (bs.influence <= 0 && !bs.defeated) {
        showNotification(boss.name + ' is vulnerable! Confront them for the final showdown!', 'good');
        addJournalEntry(boss.name + '\'s influence is broken. Final showdown available!');
      }
    }
  }

  // Rewards
  game.gold += mission.goldReward;
  addXP(mission.xpReward);

  showNotification('Mission complete! +$' + mission.goldReward + ', +' + mission.xpReward + ' XP.', 'good');
  addJournalEntry('Completed mission: ' + mission.name + '.');

  ts.activeMission = null;
}

function _renderMissionObjective() {
  if (!game._towns) return;

  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || !ts.activeMission) return;

  var mission = ts.activeMission;
  if (mission.completed || mission.failed) return;

  // Draw objective marker on screen (relative to camera)
  var sx = mission.objectiveX - (game.camera ? game.camera.x : 0);
  var sy = mission.objectiveY - (game.camera ? game.camera.y : 0);

  // Pulsing marker
  var pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(sx, sy - 16, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a14';
  ctx.font = 'bold 10px serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', sx, sy - 13);
  ctx.globalAlpha = 1;

  // Mission timer HUD
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(canvas.width / 2 - 120, 60, 240, 40);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillText(mission.name + ' — ' + Math.ceil(mission.timer) + 's', canvas.width / 2, 78);

  // Progress bar
  var barX = canvas.width / 2 - 80;
  var barY = 85;
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(barX, barY, 160, 8);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(barX, barY, 160 * (mission.progress / mission.targetProgress), 8);

  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §18  LIEUTENANT BATTLES
// ─────────────────────────────────────────────

function _startLieutenantFight(bossId, lieutenantIndex) {
  if (!game._towns) return;

  var boss = null;
  for (var i = 0; i < CRIME_BOSSES.length; i++) {
    if (CRIME_BOSSES[i].id === bossId) { boss = CRIME_BOSSES[i]; break; }
  }
  if (!boss) return;

  var lt = boss.lieutenants[lieutenantIndex];
  if (!lt) return;

  var bs = game._towns.bossStates[bossId];
  if (!bs) return;
  if (bs.lieutenantsDefeated.indexOf(lt.id) !== -1) {
    showNotification(lt.name + ' has already been defeated.', 'bad');
    return;
  }

  var mult = _getDifficultyMultiplier(boss.town);

  game._towns.lieutenantFightActive = true;
  game._towns.lieutenantFightData = {
    bossId: bossId,
    lieutenant: lt,
    ltIndex: lieutenantIndex,
    mult: mult,
  };
  game._towns.lieutenantFightHP = Math.ceil(lt.hp * mult);
  game._towns.lieutenantFightPlayerHP = game.player ? game.player.hp : 10;
  game._towns.lieutenantFightCooldown = 0;
  game._towns._prevState = game.state;

  showNotification(lt.name + ' challenges you!', 'bad');
  addJournalEntry('Confronting ' + lt.name + ' of the ' + boss.gang + '.');
}

function _updateLieutenantFight(dt) {
  if (!game._towns || !game._towns.lieutenantFightActive) return;

  var data = game._towns.lieutenantFightData;
  var lt = data.lieutenant;
  var mult = data.mult;

  // Cooldown
  game._towns.lieutenantFightCooldown -= dt;

  // Lieutenant attacks
  if (game._towns.lieutenantFightCooldown <= 0) {
    game._towns.lieutenantFightCooldown = 1.5 + Math.random();
    var dmg = Math.ceil(lt.damage * mult);
    game._towns.lieutenantFightPlayerHP -= dmg;
    if (audio && audio.playHit) audio.playHit();

    if (game._towns.lieutenantFightPlayerHP <= 0) {
      game._towns.lieutenantFightPlayerHP = 0;
      game._towns.lieutenantFightActive = false;
      if (game.player) game.player.hp = Math.max(1, game.player.hp - 3);
      showNotification('Defeated by ' + lt.name + '! Lost 3 HP.', 'bad');
      return;
    }
  }

  // Player attacks (Space)
  if (consumeKey('Space')) {
    var playerDmg = 3 + (game.level || 1);
    game._towns.lieutenantFightHP -= playerDmg;
    if (audio && audio.playShoot) audio.playShoot();

    if (game._towns.lieutenantFightHP <= 0) {
      game._towns.lieutenantFightHP = 0;
      _defeatLieutenant(data.bossId, data.ltIndex);
      return;
    }
  }

  // Dodge (Shift)
  if (consumeKey('ShiftLeft') || consumeKey('ShiftRight')) {
    game._towns.lieutenantFightCooldown += 1.0;
  }

  // Escape (Escape)
  if (consumeKey('Escape')) {
    game._towns.lieutenantFightActive = false;
    showNotification('Fled from ' + lt.name + '.', 'bad');
  }
}

function _defeatLieutenant(bossId, ltIndex) {
  if (!game._towns) return;

  game._towns.lieutenantFightActive = false;

  var boss = null;
  for (var i = 0; i < CRIME_BOSSES.length; i++) {
    if (CRIME_BOSSES[i].id === bossId) { boss = CRIME_BOSSES[i]; break; }
  }
  if (!boss) return;

  var lt = boss.lieutenants[ltIndex];
  var bs = game._towns.bossStates[bossId];
  if (!bs || !lt) return;

  bs.lieutenantsDefeated.push(lt.id);
  bs.influence = Math.max(0, bs.influence - 10);

  var goldReward = rand(25, 50);
  game.gold += goldReward;
  addXP(35);

  showNotification(lt.name + ' defeated! Boss influence -10%. +$' + goldReward + ', +35 XP.', 'good');
  addJournalEntry('Defeated lieutenant ' + lt.name + ' of the ' + boss.gang + '.');

  if (audio && audio.playVictory) audio.playVictory();

  if (bs.influence <= 0 && !bs.defeated) {
    showNotification(boss.name + ' is vulnerable! Final showdown awaits!', 'good');
    addJournalEntry(boss.name + '\'s empire crumbles. Confront them!');
  }
}

function _renderLieutenantFight() {
  if (!game._towns || !game._towns.lieutenantFightActive) return;

  var w = canvas.width;
  var h = canvas.height;
  var data = game._towns.lieutenantFightData;
  var lt = data.lieutenant;

  // Full screen overlay
  ctx.fillStyle = 'rgba(20, 12, 4, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = '#cc3030';
  ctx.font = 'bold 26px serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIEUTENANT BATTLE: ' + lt.name, w / 2, 50);

  // Lieutenant dialog
  var line = lt.lines[rand(0, lt.lines.length - 1)];
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'italic 14px serif';
  ctx.fillText('"' + line + '"', w / 2, 80);

  // Lieutenant sprite
  var lx = w * 0.65;
  var ly = h * 0.35;
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(lx - 15, ly, 30, 40);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(lx - 18, ly - 12, 36, 14);
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(lx - 10, ly - 6, 20, 16);
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(lx - 10, ly + 5, 20, 6);

  // Lieutenant HP bar
  var ltMaxHp = Math.ceil(lt.hp * data.mult);
  var ltHpFrac = game._towns.lieutenantFightHP / ltMaxHp;
  ctx.fillStyle = '#440000';
  ctx.fillRect(lx - 40, ly + 50, 80, 10);
  ctx.fillStyle = '#cc3030';
  ctx.fillRect(lx - 40, ly + 50, 80 * ltHpFrac, 10);
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '11px serif';
  ctx.fillText(lt.name + ' HP: ' + game._towns.lieutenantFightHP + '/' + ltMaxHp, lx, ly + 75);

  // Player sprite
  var px = w * 0.3;
  var py = h * 0.35;
  ctx.fillStyle = '#8b1a1a';
  ctx.fillRect(px - 12, py, 24, 35);
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(px - 14, py - 12, 28, 14);
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(px - 8, py - 6, 16, 14);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(px + 6, py + 5, 4, 4);

  // Player HP
  var phpMax = game.player ? game.player.maxHp : 10;
  var phpFrac = game._towns.lieutenantFightPlayerHP / phpMax;
  ctx.fillStyle = '#004400';
  ctx.fillRect(px - 40, py + 50, 80, 10);
  ctx.fillStyle = '#30aa30';
  ctx.fillRect(px - 40, py + 50, 80 * phpFrac, 10);
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '11px serif';
  ctx.fillText('Your HP: ' + game._towns.lieutenantFightPlayerHP + '/' + phpMax, px, py + 75);

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '13px serif';
  ctx.fillText('SPACE to attack  |  SHIFT to dodge  |  ESC to flee', w / 2, h - 30);

  // Weapon info
  ctx.fillStyle = '#ffd700';
  ctx.font = '12px serif';
  ctx.fillText('Weapon: ' + lt.weapon, lx, ly + 90);

  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §19  BOSS FINAL SHOWDOWN
// ─────────────────────────────────────────────

function _startBossShowdown(bossId) {
  if (!game._towns) return;

  var boss = null;
  for (var i = 0; i < CRIME_BOSSES.length; i++) {
    if (CRIME_BOSSES[i].id === bossId) { boss = CRIME_BOSSES[i]; break; }
  }
  if (!boss) return;

  var bs = game._towns.bossStates[bossId];
  if (!bs || bs.defeated) return;
  if (bs.influence > 0) {
    showNotification('Weaken ' + boss.name + '\'s influence to 0 first!', 'bad');
    return;
  }

  var mult = _getDifficultyMultiplier(boss.town);

  game._towns.bossFightActive = true;
  game._towns.bossFightBoss = boss;
  game._towns.bossFightHP = Math.ceil(boss.hp * mult);
  game._towns.bossFightMaxHP = Math.ceil(boss.hp * mult);
  game._towns.bossFightPlayerHP = game.player ? game.player.hp : 10;
  game._towns.bossFightPhase = 1; // 1=melee, 2=ranged, 3=QTE duel
  game._towns.bossFightTimer = 0;
  game._towns.bossFightCooldown = 0;
  game._towns.bossFightDodgeTimer = 0;
  game._towns.bossFightAbilityTimer = 10;
  game._towns.bossFightAbilityActive = false;
  game._towns.bossFightQTE = false;
  game._towns.bossFightQTETimer = 0;
  game._towns.bossFightQTETarget = 0;
  game._towns.bossFightQTEHits = 0;
  game._towns.bossFightDialog = boss.lines[0];
  game._towns.bossFightDialogTimer = 3;
  game._towns._prevState = game.state;

  bs.showdownActive = true;
  bs.showdownPhase = 1;

  showNotification('BOSS FIGHT: ' + boss.name + '!', 'bad');
  addJournalEntry('Final showdown with ' + boss.name + '!');
  if (audio && audio.playShoot) audio.playShoot();
  triggerShake(5, 20);
}

function _updateBossShowdown(dt) {
  if (!game._towns || !game._towns.bossFightActive) return;

  var boss = game._towns.bossFightBoss;
  if (!boss) return;

  var mult = _getDifficultyMultiplier(boss.town);

  // Dialog timer
  if (game._towns.bossFightDialogTimer > 0) {
    game._towns.bossFightDialogTimer -= dt;
  }

  // Boss ability timer
  game._towns.bossFightAbilityTimer -= dt;
  if (game._towns.bossFightAbilityTimer <= 0 && !game._towns.bossFightAbilityActive) {
    _triggerBossAbility(boss);
  }

  // Handle ability active state
  if (game._towns.bossFightAbilityActive) {
    game._towns.bossFightTimer -= dt;
    if (game._towns.bossFightTimer <= 0) {
      game._towns.bossFightAbilityActive = false;
      game._towns.bossFightAbilityTimer = 8 + Math.random() * 5;
    }
    // During ability, cannot attack
    return;
  }

  // Phase transitions
  var hpFrac = game._towns.bossFightHP / game._towns.bossFightMaxHP;
  if (hpFrac <= 0.6 && game._towns.bossFightPhase === 1) {
    game._towns.bossFightPhase = 2;
    game._towns.bossFightDialog = boss.lines[Math.min(1, boss.lines.length - 1)];
    game._towns.bossFightDialogTimer = 2;
    showNotification('Phase 2: ' + boss.name + ' switches to ranged combat!', 'bad');
    triggerShake(3, 10);
  }
  if (hpFrac <= 0.25 && game._towns.bossFightPhase === 2) {
    game._towns.bossFightPhase = 3;
    game._towns.bossFightQTE = true;
    game._towns.bossFightQTETimer = 8;
    game._towns.bossFightQTETarget = 20;
    game._towns.bossFightQTEHits = 0;
    game._towns.bossFightDialog = boss.lines[Math.min(2, boss.lines.length - 1)];
    game._towns.bossFightDialogTimer = 2;
    showNotification('FINAL PHASE: Quick-draw duel! MASH SPACE!', 'bad');
    triggerShake(5, 15);
  }

  // Phase-specific logic
  if (game._towns.bossFightPhase === 3) {
    // QTE final phase
    game._towns.bossFightQTETimer -= dt;

    if (consumeKey('Space')) {
      game._towns.bossFightQTEHits++;
      game._towns.bossFightHP -= 2;
      if (audio && audio.playShoot) audio.playShoot();
    }

    if (game._towns.bossFightQTETimer <= 0) {
      if (game._towns.bossFightQTEHits >= game._towns.bossFightQTETarget) {
        _defeatBoss(boss.id);
      } else {
        // Boss wins the duel
        game._towns.bossFightPlayerHP -= Math.ceil(boss.damage * mult * 2);
        if (game._towns.bossFightPlayerHP <= 0) {
          _loseBossFight(boss);
        } else {
          // Reset QTE
          game._towns.bossFightQTETimer = 8;
          game._towns.bossFightQTEHits = 0;
          showNotification('Not fast enough! Try again!', 'bad');
        }
      }
      return;
    }
  } else {
    // Phase 1 & 2: combat
    game._towns.bossFightCooldown -= dt;

    // Boss attacks
    if (game._towns.bossFightCooldown <= 0) {
      var dmgMult = game._towns.bossFightPhase === 2 ? 1.5 : 1.0;
      var dmg = Math.ceil(boss.damage * mult * dmgMult);

      // Check dodge
      if (game._towns.bossFightDodgeTimer > 0) {
        game._towns.bossFightDodgeTimer -= dt;
        // Dodged
      } else {
        game._towns.bossFightPlayerHP -= dmg;
        if (audio && audio.playHit) audio.playHit();
        triggerShake(2, 5);
      }

      game._towns.bossFightCooldown = game._towns.bossFightPhase === 1 ? 2.0 : 1.5;
      game._towns.bossFightCooldown += Math.random() * 0.5;
    }

    // Player attacks (Space)
    if (consumeKey('Space')) {
      var pDmg = game._towns.bossFightPhase === 1 ? (2 + (game.level || 1)) : (3 + (game.level || 1));
      game._towns.bossFightHP -= pDmg;
      if (audio && audio.playShoot) audio.playShoot();

      if (game._towns.bossFightHP <= 0 && game._towns.bossFightPhase < 3) {
        // Force transition to QTE
        game._towns.bossFightHP = 1;
      }
    }

    // Dodge (Shift)
    if (consumeKey('ShiftLeft') || consumeKey('ShiftRight')) {
      game._towns.bossFightDodgeTimer = 0.5;
    }

    // Check player death
    if (game._towns.bossFightPlayerHP <= 0) {
      _loseBossFight(boss);
      return;
    }
  }

  // Random dialog
  game._towns.bossFightTimer += dt;
  if (game._towns.bossFightTimer > 6) {
    game._towns.bossFightTimer = 0;
    game._towns.bossFightDialog = boss.lines[rand(0, boss.lines.length - 1)];
    game._towns.bossFightDialogTimer = 2;
  }
}

function _triggerBossAbility(boss) {
  if (!game._towns) return;

  game._towns.bossFightAbilityActive = true;
  game._towns.bossFightTimer = 3;

  var ability = boss.ability;
  switch (ability) {
    case 'Smoke Bomb':
      showNotification(boss.name + ' throws a Smoke Bomb! Can\'t see!', 'bad');
      break;
    case 'Poison Cloud':
      showNotification(boss.name + ' releases Poison Cloud! -2 HP!', 'bad');
      game._towns.bossFightPlayerHP -= 2;
      break;
    case 'Barrage':
      showNotification(boss.name + ' fires a Barrage! Dodge now!', 'bad');
      game._towns.bossFightPlayerHP -= 3;
      break;
    case 'Vanish':
      showNotification(boss.name + ' vanishes into thin air!', 'bad');
      break;
    default:
      showNotification(boss.name + ' uses ' + ability + '!', 'bad');
      break;
  }

  triggerShake(4, 15);
}

function _defeatBoss(bossId) {
  if (!game._towns) return;

  game._towns.bossFightActive = false;

  var boss = null;
  for (var i = 0; i < CRIME_BOSSES.length; i++) {
    if (CRIME_BOSSES[i].id === bossId) { boss = CRIME_BOSSES[i]; break; }
  }
  if (!boss) return;

  var bs = game._towns.bossStates[bossId];
  if (bs) {
    bs.defeated = true;
    bs.showdownActive = false;
    bs.influence = 0;
  }

  // Take over town
  var townId = boss.town;
  var ts = game._towns.towns[townId];
  if (ts) {
    ts.controlled = true;
    ts.prosperity = Math.min(100, ts.prosperity + 20);
  }

  // Unlock next town
  var currIdx = _getTownIndex(townId);
  if (currIdx >= 0 && currIdx + 1 < TOWN_DATA.length) {
    var nextTown = TOWN_DATA[currIdx + 1];
    game._towns.towns[nextTown.id].unlocked = true;
    showNotification(nextTown.name + ' is now accessible!', 'good');
    addJournalEntry('Unlocked ' + nextTown.name + '.');
  }

  var goldReward = 100 + boss.hp * 2;
  game.gold += goldReward;
  addXP(100);

  showNotification('BOSS DEFEATED: ' + boss.name + '! +$' + goldReward + ', +100 XP!', 'good');
  addJournalEntry('Defeated ' + boss.name + '! ' + (_getTownData(townId) || {}).name + ' is now under your control!');

  if (audio && audio.playVictory) audio.playVictory();
  triggerShake(8, 30);

  // Check if all bosses defeated -> Syndicate
  if (_allTownsControlled() && !game._towns.syndicateDefeated) {
    showNotification('All towns conquered! The Syndicate emerges...', 'bad');
    addJournalEntry('A shadowy figure known as The Syndicate has revealed themselves.');
  }
}

function _loseBossFight(boss) {
  if (!game._towns) return;

  game._towns.bossFightActive = false;
  game._towns.bossFightPlayerHP = 0;

  if (game.player) game.player.hp = Math.max(1, game.player.hp - 4);

  var bs = game._towns.bossStates[boss.id];
  if (bs) {
    bs.showdownActive = false;
    bs.influence = Math.min(100, bs.influence + 15);
  }

  showNotification('Defeated by ' + boss.name + '! Influence restored +15%.', 'bad');
  addJournalEntry('Lost to ' + boss.name + '. Must weaken them further.');
}

function _renderBossShowdown() {
  if (!game._towns || !game._towns.bossFightActive) return;

  var w = canvas.width;
  var h = canvas.height;
  var boss = game._towns.bossFightBoss;
  if (!boss) return;

  // Full screen dark overlay
  ctx.fillStyle = 'rgba(10, 5, 0, 0.95)';
  ctx.fillRect(0, 0, w, h);

  // Phase indicator
  var phaseNames = ['', 'MELEE COMBAT', 'RANGED COMBAT', 'QUICK-DRAW DUEL'];
  ctx.fillStyle = '#cc3030';
  ctx.font = 'bold 14px serif';
  ctx.textAlign = 'center';
  ctx.fillText('PHASE ' + game._towns.bossFightPhase + ': ' + phaseNames[game._towns.bossFightPhase], w / 2, 25);

  // Boss name and title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 30px serif';
  ctx.fillText(boss.name, w / 2, 65);
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'italic 14px serif';
  ctx.fillText('Leader of the ' + boss.gang, w / 2, 85);

  // Boss dialog
  if (game._towns.bossFightDialogTimer > 0) {
    ctx.fillStyle = '#cc3030';
    ctx.font = 'italic 15px serif';
    ctx.fillText('"' + game._towns.bossFightDialog + '"', w / 2, 110);
  }

  // Boss sprite (larger)
  var bx = w * 0.65;
  var by = h * 0.3;
  // Body
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(bx - 20, by, 40, 50);
  // Head
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(bx - 12, by - 20, 24, 22);
  // Hat
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(bx - 22, by - 30, 44, 12);
  ctx.fillRect(bx - 10, by - 38, 20, 10);
  // Weapon
  ctx.fillStyle = '#888';
  ctx.fillRect(bx + 20, by + 15, 18, 5);
  // Eyes (red for bosses)
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(bx - 6, by - 14, 4, 3);
  ctx.fillRect(bx + 2, by - 14, 4, 3);

  // Ability active effect
  if (game._towns.bossFightAbilityActive) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
    if (boss.ability === 'Smoke Bomb') {
      ctx.fillStyle = '#666';
      for (var s = 0; s < 20; s++) {
        ctx.beginPath();
        ctx.arc(bx + (Math.random() - 0.5) * 100, by + (Math.random() - 0.5) * 80, 15 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (boss.ability === 'Poison Cloud') {
      ctx.fillStyle = '#3a6a2a';
      for (var p = 0; p < 15; p++) {
        ctx.beginPath();
        ctx.arc(w * 0.5 + (Math.random() - 0.5) * 200, h * 0.5 + (Math.random() - 0.5) * 100, 10 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (boss.ability === 'Barrage') {
      ctx.fillStyle = '#ffcc00';
      for (var b = 0; b < 10; b++) {
        ctx.fillRect(bx + 20, by + 15, Math.random() * w * 0.3, 2);
      }
    } else if (boss.ability === 'Vanish') {
      ctx.globalAlpha = 0.1;
    }
    ctx.globalAlpha = 1;
  }

  // Boss HP bar
  var bossHpFrac = game._towns.bossFightHP / game._towns.bossFightMaxHP;
  ctx.fillStyle = '#440000';
  ctx.fillRect(w * 0.3, h * 0.65, w * 0.4, 16);
  ctx.fillStyle = '#cc3030';
  ctx.fillRect(w * 0.3, h * 0.65, w * 0.4 * bossHpFrac, 16);
  ctx.strokeStyle = '#8a6a38';
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.3, h * 0.65, w * 0.4, 16);
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '12px serif';
  ctx.fillText(boss.name + ': ' + game._towns.bossFightHP + '/' + game._towns.bossFightMaxHP, w / 2, h * 0.65 + 36);

  // Player sprite
  var px = w * 0.3;
  var py = h * 0.3;
  ctx.fillStyle = '#8b1a1a';
  ctx.fillRect(px - 15, py, 30, 45);
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(px - 10, py - 18, 20, 20);
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(px - 14, py - 26, 28, 10);
  ctx.fillRect(px - 8, py - 32, 16, 8);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(px + 8, py + 8, 5, 5);

  // Player HP bar
  var phpMax = game.player ? game.player.maxHp : 10;
  var phpFrac = game._towns.bossFightPlayerHP / phpMax;
  ctx.fillStyle = '#004400';
  ctx.fillRect(w * 0.3, h * 0.72, w * 0.4, 12);
  ctx.fillStyle = '#30aa30';
  ctx.fillRect(w * 0.3, h * 0.72, w * 0.4 * phpFrac, 12);
  ctx.fillStyle = '#e8d8b8';
  ctx.font = '12px serif';
  ctx.fillText('Your HP: ' + game._towns.bossFightPlayerHP + '/' + phpMax, w / 2, h * 0.72 + 28);

  // QTE Phase rendering
  if (game._towns.bossFightPhase === 3 && game._towns.bossFightQTE) {
    var qteBarX = w * 0.2;
    var qteBarY = h * 0.82;
    var qteBarW = w * 0.6;
    var qteBarH = 20;

    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(qteBarX, qteBarY, qteBarW, qteBarH);
    var qteFrac = game._towns.bossFightQTEHits / game._towns.bossFightQTETarget;
    ctx.fillStyle = qteFrac >= 1 ? '#30aa30' : '#ffd700';
    ctx.fillRect(qteBarX, qteBarY, qteBarW * Math.min(1, qteFrac), qteBarH);

    ctx.fillStyle = '#e8d8b8';
    ctx.font = 'bold 15px serif';
    ctx.fillText('MASH SPACE! ' + game._towns.bossFightQTEHits + '/' + game._towns.bossFightQTETarget +
      ' — Time: ' + Math.max(0, game._towns.bossFightQTETimer).toFixed(1) + 's', w / 2, qteBarY + qteBarH + 25);
  }

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '13px serif';
  if (game._towns.bossFightPhase < 3) {
    ctx.fillText('SPACE to attack  |  SHIFT to dodge', w / 2, h - 20);
  } else {
    ctx.fillText('MASH SPACE as fast as you can!', w / 2, h - 20);
  }

  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §20  TOWN TAKEOVER STATE
// ─────────────────────────────────────────────

function _updateControlledTowns(dt) {
  if (!game._towns) return;

  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    var ts = game._towns.towns[tid];
    if (!ts || !ts.controlled) continue;

    // Prosperity drift toward baseline
    if (ts.prosperity < 50) {
      ts.prosperity += dt * 0.01; // Very slow recovery
    }

    // Event cooldown
    if (ts.eventCooldown > 0) {
      ts.eventCooldown -= dt;
    }
  }
}

// ─────────────────────────────────────────────
// §21  TOWN PROSPERITY
// ─────────────────────────────────────────────

function _updateProsperity(dt) {
  if (!game._towns) return;

  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    var ts = game._towns.towns[tid];
    if (!ts || !ts.controlled) continue;

    // Upgrades boost prosperity
    var upgradeBonus = 0;
    for (var uid in ts.upgrades) {
      if (ts.upgrades[uid] && TOWN_UPGRADES[uid]) {
        upgradeBonus += TOWN_UPGRADES[uid].prosperityBonus;
      }
    }
    // Slowly approach prosperity cap based on upgrades
    var target = Math.min(100, 50 + upgradeBonus);
    if (ts.prosperity < target) {
      ts.prosperity = Math.min(target, ts.prosperity + dt * 0.02);
    }

    // Clamp
    ts.prosperity = clamp(ts.prosperity, 0, 100);
  }
}

// ─────────────────────────────────────────────
// §22  DEPUTY SYSTEM
// ─────────────────────────────────────────────

function _appointDeputy(townId, npcName) {
  if (!game._towns) return;

  var ts = game._towns.towns[townId];
  if (!ts || !ts.controlled) {
    showNotification('You must control this town to appoint a deputy.', 'bad');
    return;
  }

  if (ts.deputy) {
    showNotification('Deputy ' + ts.deputy + ' is already serving here.', 'bad');
    return;
  }

  ts.deputy = npcName;
  showNotification('Appointed ' + npcName + ' as deputy of ' + (_getTownData(townId) || {}).name + '.', 'good');
  addJournalEntry('Appointed Deputy ' + npcName + ' in ' + (_getTownData(townId) || {}).name + '.');
}

// ─────────────────────────────────────────────
// §23  TOWN UPGRADES
// ─────────────────────────────────────────────

function _buyTownUpgrade(townId, upgradeId) {
  if (!game._towns) return;

  var ts = game._towns.towns[townId];
  if (!ts || !ts.controlled) {
    showNotification('You must control this town to buy upgrades.', 'bad');
    return;
  }

  var upgrade = TOWN_UPGRADES[upgradeId];
  if (!upgrade) return;

  if (ts.upgrades[upgradeId]) {
    showNotification(upgrade.name + ' is already built.', 'bad');
    return;
  }

  if (game.gold < upgrade.cost) {
    showNotification('Not enough gold! Need $' + upgrade.cost + '.', 'bad');
    return;
  }

  game.gold -= upgrade.cost;
  ts.upgrades[upgradeId] = true;
  ts.prosperity = Math.min(100, ts.prosperity + upgrade.prosperityBonus);

  showNotification('Built ' + upgrade.name + ' in ' + (_getTownData(townId) || {}).name + '! -$' + upgrade.cost, 'good');
  addJournalEntry('Built ' + upgrade.name + ' in ' + (_getTownData(townId) || {}).name + '.');
  addXP(15);
}

// ─────────────────────────────────────────────
// §24  TRADE ROUTES
// ─────────────────────────────────────────────

function _establishTradeRoute(town1Id, town2Id) {
  if (!game._towns) return;

  var ts1 = game._towns.towns[town1Id];
  var ts2 = game._towns.towns[town2Id];

  if (!ts1 || !ts2 || !ts1.controlled || !ts2.controlled) {
    showNotification('Both towns must be under your control.', 'bad');
    return;
  }

  // Check if route already exists
  for (var r = 0; r < game._towns.tradeRoutes.length; r++) {
    var route = game._towns.tradeRoutes[r];
    if ((route.from === town1Id && route.to === town2Id) ||
        (route.from === town2Id && route.to === town1Id)) {
      showNotification('Trade route already exists.', 'bad');
      return;
    }
  }

  var cost = 75;
  if (game.gold < cost) {
    showNotification('Need $' + cost + ' to establish a trade route.', 'bad');
    return;
  }

  game.gold -= cost;
  var income = rand(5, 20);
  game._towns.tradeRoutes.push({
    from: town1Id,
    to: town2Id,
    income: income,
    active: true,
  });

  var td1 = _getTownData(town1Id);
  var td2 = _getTownData(town2Id);
  showNotification('Trade route: ' + (td1 ? td1.name : town1Id) + ' <-> ' + (td2 ? td2.name : town2Id) + ' ($' + income + '/day).', 'good');
  addJournalEntry('Established trade route earning $' + income + '/day.');
}

// ─────────────────────────────────────────────
// §25  GANG RETALIATION
// ─────────────────────────────────────────────

function _updateRetaliation(dt) {
  if (!game._towns) return;

  // Only happens in controlled non-home towns
  if (_countControlledTowns() <= 1) return;

  game._towns.retaliationTimer += dt;

  // Check for retaliation every 120-240 seconds
  var retaliationInterval = 120 + (_countDefeatedBosses() * -10);
  retaliationInterval = Math.max(60, retaliationInterval);

  if (game._towns.retaliationTimer >= retaliationInterval) {
    game._towns.retaliationTimer = 0;

    // Random chance based on defeated bosses
    if (Math.random() < 0.3 + _countDefeatedBosses() * 0.1) {
      _triggerRetaliation();
    }
  }

  // Update active retaliation
  if (game._towns.retaliationActive) {
    _updateActiveRetaliation(dt);
  }
}

function _triggerRetaliation() {
  if (!game._towns) return;
  if (game._towns.retaliationActive) return;

  // Pick a random controlled town (not current)
  var candidates = [];
  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    if (tid === game._towns.currentTown) continue;
    if (game._towns.towns[tid].controlled) candidates.push(tid);
  }

  if (candidates.length === 0) return;

  var targetTown = candidates[rand(0, candidates.length - 1)];
  var td = _getTownData(targetTown);
  var ts = game._towns.towns[targetTown];

  // Check for watchtower (gives warning)
  var warningTime = ts.upgrades && ts.upgrades.watchtower ? 30 : 10;

  game._towns.retaliationActive = {
    targetTown: targetTown,
    warningTimer: warningTime,
    fightTimer: 0,
    enemyCount: rand(3, 5 + _countDefeatedBosses()),
    resolved: false,
  };

  game._towns.retaliationWarning = warningTime;

  showNotification('WARNING: ' + (td ? td.name : 'A town') + ' is under attack!', 'bad');
  addJournalEntry((td ? td.name : 'A controlled town') + ' is being raided by a gang!');
}

function _updateActiveRetaliation(dt) {
  if (!game._towns || !game._towns.retaliationActive) return;

  var ret = game._towns.retaliationActive;
  if (ret.resolved) return;

  ret.warningTimer -= dt;

  if (ret.warningTimer <= 0) {
    // Resolve automatically
    var ts = game._towns.towns[ret.targetTown];
    if (!ts) { ret.resolved = true; return; }

    // Deputy defense
    var defense = 0;
    if (ts.deputy) defense += 2;
    if (ts.upgrades && ts.upgrades.jail) defense += 1;
    if (ts.upgrades && ts.upgrades.watchtower) defense += 1;

    var attackPower = ret.enemyCount;
    if (defense >= attackPower) {
      // Successfully defended
      showNotification((_getTownData(ret.targetTown) || {}).name + '\'s defenses held!', 'good');
      ts.prosperity = Math.min(100, ts.prosperity + 3);
    } else {
      // Town damaged
      var damage = (attackPower - defense) * 5;
      ts.prosperity = Math.max(0, ts.prosperity - damage);
      showNotification((_getTownData(ret.targetTown) || {}).name + ' suffered a raid! Prosperity -' + damage + '.', 'bad');
    }

    ret.resolved = true;
    game._towns.retaliationActive = null;
  }
}

// ─────────────────────────────────────────────
// §26  PER-TOWN REPUTATION
// ─────────────────────────────────────────────

function _adjustTownReputation(townId, amount) {
  if (!game._towns) return;

  var ts = game._towns.towns[townId];
  if (!ts) return;

  ts.reputation = clamp(ts.reputation + amount, -100, 100);
}

// ─────────────────────────────────────────────
// §27  WANTED ACROSS BORDERS
// ─────────────────────────────────────────────

function _spreadWanted(originTown, severity) {
  if (!game._towns) return;

  // Crimes in one town can affect reputation in nearby towns
  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    if (tid === originTown) continue;

    var ts = game._towns.towns[tid];
    if (!ts || !ts.visited) continue;

    var distance = _getTravelDistance(originTown, tid);
    var impact = Math.max(0, severity * (1 - distance * 2));
    if (impact > 0) {
      _adjustTownReputation(tid, -Math.ceil(impact));
    }
  }
}

// ─────────────────────────────────────────────
// §28  TOWN EVENTS
// ─────────────────────────────────────────────

function _updateTownEvents(dt) {
  if (!game._towns) return;

  for (var i = 0; i < TOWN_DATA.length; i++) {
    var tid = TOWN_DATA[i].id;
    var ts = game._towns.towns[tid];
    if (!ts || !ts.controlled) continue;

    // Event cooldown
    if (ts.eventCooldown > 0) {
      ts.eventCooldown -= dt;
      continue;
    }

    // Random event chance (once per ~120 seconds)
    if (Math.random() < dt / 120) {
      var event = TOWN_EVENTS[rand(0, TOWN_EVENTS.length - 1)];
      ts.events.push({
        id: event.id,
        name: event.name,
        timer: event.duration * 60, // convert to seconds
      });

      ts.prosperity = clamp(ts.prosperity + event.prosperityBonus, 0, 100);
      if (event.goldBonus > 0) game.gold += event.goldBonus;
      if (event.repBonus !== 0) _adjustTownReputation(tid, event.repBonus);

      ts.eventCooldown = 60;

      var tdName = (_getTownData(tid) || {}).name || tid;
      if (tid === game._towns.currentTown) {
        showNotification(tdName + ': ' + event.name + '! ' + event.desc, event.goldBonus > 0 ? 'good' : 'bad');
      }
      addJournalEntry(tdName + ' event: ' + event.name + '.');
    }

    // Tick active events
    for (var e = ts.events.length - 1; e >= 0; e--) {
      ts.events[e].timer -= dt;
      if (ts.events[e].timer <= 0) {
        ts.events.splice(e, 1);
      }
    }
  }
}

// ─────────────────────────────────────────────
// §29  TERRITORY CONTROL MAP OVERLAY
// ─────────────────────────────────────────────

function _renderTerritoryOverlay() {
  if (!game._towns || !game._towns.territoryOverlayOpen) return;

  var w = canvas.width;
  var h = canvas.height;

  ctx.fillStyle = 'rgba(20, 12, 4, 0.92)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TERRITORY CONTROL', w / 2, 40);

  // Draw each town as a territory block
  var blockW = (w - 100) / TOWN_DATA.length;
  for (var i = 0; i < TOWN_DATA.length; i++) {
    var td = TOWN_DATA[i];
    var ts = game._towns.towns[td.id];
    var bx = 50 + i * blockW;
    var by = 80;
    var bw = blockW - 10;
    var bh = h - 140;

    // Background
    ctx.fillStyle = ts.controlled ? 'rgba(48, 170, 48, 0.3)' : (ts.visited ? 'rgba(200, 168, 130, 0.2)' : 'rgba(100, 100, 100, 0.2)');
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = ts.controlled ? '#30aa30' : '#5a3a18';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // Town name
    ctx.fillStyle = ts.controlled ? '#ffd700' : '#e8d8b8';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText(td.name, bx + bw / 2, by + 20);

    // Status
    ctx.font = '11px serif';
    ctx.fillStyle = '#a09070';
    if (ts.controlled) {
      ctx.fillStyle = '#30aa30';
      ctx.fillText('CONTROLLED', bx + bw / 2, by + 38);
    } else if (ts.visited) {
      ctx.fillStyle = '#ccaa30';
      ctx.fillText('VISITED', bx + bw / 2, by + 38);
    } else if (ts.unlocked) {
      ctx.fillText('UNEXPLORED', bx + bw / 2, by + 38);
    } else {
      ctx.fillStyle = '#666';
      ctx.fillText('LOCKED', bx + bw / 2, by + 38);
    }

    // Biome
    ctx.fillStyle = '#a09070';
    ctx.fillText('Biome: ' + td.biome, bx + bw / 2, by + 56);

    // Difficulty stars
    ctx.fillText('Danger: ' + '\u2605'.repeat(td.difficulty), bx + bw / 2, by + 72);

    // Prosperity bar
    if (ts.controlled) {
      var pBarX = bx + 10;
      var pBarY = by + 85;
      var pBarW = bw - 20;
      ctx.fillStyle = '#3a2a14';
      ctx.fillRect(pBarX, pBarY, pBarW, 8);
      ctx.fillStyle = '#30aa30';
      ctx.fillRect(pBarX, pBarY, pBarW * (ts.prosperity / 100), 8);
      ctx.fillText('Prosperity: ' + Math.floor(ts.prosperity), bx + bw / 2, pBarY + 22);

      // Deputy
      ctx.fillText('Deputy: ' + (ts.deputy || 'None'), bx + bw / 2, pBarY + 38);

      // Upgrades
      var upgradeList = [];
      for (var uid in ts.upgrades) {
        if (ts.upgrades[uid]) upgradeList.push(uid);
      }
      ctx.fillText('Upgrades: ' + (upgradeList.length > 0 ? upgradeList.join(', ') : 'None'), bx + bw / 2, pBarY + 54);
    }

    // Boss info
    var boss = _getBossForTown(td.id);
    if (boss) {
      var bs = game._towns.bossStates[boss.id];
      ctx.fillStyle = bs.defeated ? '#30aa30' : '#cc3030';
      ctx.fillText(boss.name + (bs.defeated ? ' (DEFEATED)' : ' (' + bs.influence + '%)'), bx + bw / 2, by + bh - 30);
    }

    // Current town indicator
    if (td.id === game._towns.currentTown) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText('>> YOU ARE HERE <<', bx + bw / 2, by + bh - 10);
    }
  }

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Press ESC to close', w / 2, h - 15);

  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §30  EMPIRE STATISTICS
// ─────────────────────────────────────────────

function _renderEmpireStats() {
  if (!game._towns || !game._towns.empireStatsOpen) return;

  var w = canvas.width;
  var h = canvas.height;

  ctx.fillStyle = 'rgba(20, 12, 4, 0.92)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('EMPIRE STATISTICS', w / 2, 40);

  var lineY = 80;
  var lineH = 22;
  ctx.font = '14px serif';
  ctx.textAlign = 'left';
  var lx = w * 0.15;

  var stats = [
    ['Towns Controlled', _countControlledTowns() + ' / 5'],
    ['Bosses Defeated', _countDefeatedBosses() + ' / 4'],
    ['Daily Empire Income', '$' + _getEmpireDailyIncome()],
    ['Total Empire Gold Earned', '$' + game._towns.totalEmpireIncome],
    ['Trade Routes', game._towns.tradeRoutes.length + ''],
    ['Smuggling Routes', game._towns.smugglingRoutes.length + ''],
    ['Railroad Built', game._towns.railroadBuilt ? 'Yes' : 'No'],
    ['Syndicate Defeated', game._towns.syndicateDefeated ? 'Yes' : 'No'],
  ];

  for (var s = 0; s < stats.length; s++) {
    ctx.fillStyle = '#e8d8b8';
    ctx.fillText(stats[s][0] + ':', lx, lineY + s * lineH);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(stats[s][1], lx + 250, lineY + s * lineH);
  }

  // Per-town stats
  lineY += stats.length * lineH + 20;
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px serif';
  ctx.fillText('Town Details:', lx, lineY);
  lineY += 25;

  for (var t = 0; t < TOWN_DATA.length; t++) {
    var td = TOWN_DATA[t];
    var ts = game._towns.towns[td.id];

    ctx.fillStyle = ts.controlled ? '#30aa30' : (ts.visited ? '#e8d8b8' : '#666');
    ctx.font = 'bold 13px serif';
    ctx.fillText(td.name, lx, lineY);

    ctx.font = '12px serif';
    ctx.fillStyle = '#a09070';
    var details = 'Visited: ' + (ts.visited ? 'Yes' : 'No') +
      '  |  Controlled: ' + (ts.controlled ? 'Yes' : 'No') +
      '  |  Prosperity: ' + Math.floor(ts.prosperity) +
      '  |  Rep: ' + ts.reputation;
    ctx.fillText(details, lx + 140, lineY);

    lineY += 20;
  }

  // Boss status
  lineY += 15;
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px serif';
  ctx.fillText('Boss Status:', lx, lineY);
  lineY += 25;

  for (var b = 0; b < CRIME_BOSSES.length; b++) {
    var boss = CRIME_BOSSES[b];
    var bs = game._towns.bossStates[boss.id];

    ctx.fillStyle = bs.defeated ? '#30aa30' : '#cc3030';
    ctx.font = '13px serif';
    ctx.fillText(boss.name + ' (' + boss.gang + ')', lx, lineY);

    ctx.fillStyle = '#a09070';
    var bDetails = bs.defeated ? 'DEFEATED' :
      'Influence: ' + bs.influence + '%  |  Lieutenants: ' + bs.lieutenantsDefeated.length + '/2';
    ctx.fillText(bDetails, lx + 250, lineY);

    lineY += 18;
  }

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Press ESC to close', w / 2, h - 15);

  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §31  ENDGAME — THE SYNDICATE
// ─────────────────────────────────────────────

function _startSyndicateFight() {
  if (!game._towns) return;
  if (!_allTownsControlled()) {
    showNotification('You must control all 5 towns first.', 'bad');
    return;
  }
  if (game._towns.syndicateDefeated) {
    showNotification('The Syndicate has already been defeated.', 'bad');
    return;
  }

  game._towns.syndicateActive = true;
  game._towns.bossFightActive = true;
  game._towns.bossFightBoss = SYNDICATE_BOSS;
  game._towns.bossFightHP = SYNDICATE_BOSS.hp;
  game._towns.bossFightMaxHP = SYNDICATE_BOSS.hp;
  game._towns.bossFightPlayerHP = game.player ? game.player.hp : 10;
  game._towns.bossFightPhase = 1;
  game._towns.bossFightTimer = 0;
  game._towns.bossFightCooldown = 0;
  game._towns.bossFightDodgeTimer = 0;
  game._towns.bossFightAbilityTimer = 8;
  game._towns.bossFightAbilityActive = false;
  game._towns.bossFightQTE = false;
  game._towns.bossFightQTETimer = 0;
  game._towns.bossFightQTETarget = 25;
  game._towns.bossFightQTEHits = 0;
  game._towns.bossFightDialog = SYNDICATE_BOSS.lines[0];
  game._towns.bossFightDialogTimer = 3;

  showNotification('THE SYNDICATE: Final battle for the territory!', 'bad');
  addJournalEntry('Confronting The Syndicate — the true power behind the territory.');
  triggerShake(8, 30);
}

function _updateSyndicate(dt) {
  if (!game._towns || !game._towns.syndicateActive) return;

  // Syndicate uses same boss fight system but with reinforcements
  // The ability "Call Reinforcements" spawns temporary enemies
  // We handle this in the boss fight update with a special check

  _updateBossShowdown(dt);

  // Check if defeated
  if (game._towns.bossFightActive === false && game._towns.syndicateActive) {
    if (game._towns.bossFightHP <= 0 || game._towns.bossFightPlayerHP <= 0) {
      if (game._towns.bossFightHP <= 0) {
        game._towns.syndicateDefeated = true;
        game._towns.syndicateActive = false;
        var goldReward = 500;
        game.gold += goldReward;
        addXP(500);
        showNotification('THE SYNDICATE DEFEATED! You are the true Marshal! +$' + goldReward + ', +500 XP!', 'good');
        addJournalEntry('Defeated The Syndicate! You are the undisputed Marshal of the territory!');
        if (audio && audio.playVictory) audio.playVictory();
        triggerShake(10, 40);
      } else {
        game._towns.syndicateActive = false;
        showNotification('The Syndicate proved too powerful... for now.', 'bad');
      }
    }
  }
}

// ─────────────────────────────────────────────
// §32  SMUGGLING ROUTES (Corruption 40+)
// ─────────────────────────────────────────────

function _establishSmugglingRoute(town1Id, town2Id) {
  if (!game._towns) return;

  if ((game.corruption || 0) < 40) {
    showNotification('Need 40+ corruption to establish smuggling routes.', 'bad');
    return;
  }

  var ts1 = game._towns.towns[town1Id];
  var ts2 = game._towns.towns[town2Id];

  if (!ts1 || !ts2 || !ts1.controlled || !ts2.controlled) {
    showNotification('Both towns must be under your control.', 'bad');
    return;
  }

  // Check existing
  for (var r = 0; r < game._towns.smugglingRoutes.length; r++) {
    var route = game._towns.smugglingRoutes[r];
    if ((route.from === town1Id && route.to === town2Id) ||
        (route.from === town2Id && route.to === town1Id)) {
      showNotification('Smuggling route already exists.', 'bad');
      return;
    }
  }

  var income = rand(25, 75);
  game._towns.smugglingRoutes.push({
    from: town1Id,
    to: town2Id,
    income: income,
    active: true,
    interceptRisk: 0.1,
  });

  showNotification('Smuggling route established! $' + income + '/day (risky).', 'good');
  addJournalEntry('Established smuggling route earning $' + income + '/day.');
}

function _updateSmugglingRoutes(dt) {
  if (!game._towns) return;

  // Check for interceptions on new day
  if (game._towns.dayIncomeCollected) return;

  for (var r = game._towns.smugglingRoutes.length - 1; r >= 0; r--) {
    var route = game._towns.smugglingRoutes[r];
    if (Math.random() < route.interceptRisk) {
      var td1 = _getTownData(route.from);
      var td2 = _getTownData(route.to);
      showNotification('Smuggling route ' + (td1 ? td1.name : '?') + ' - ' + (td2 ? td2.name : '?') + ' was intercepted!', 'bad');
      game._towns.smugglingRoutes.splice(r, 1);
      game.reputation = Math.max(0, (game.reputation || 50) - 5);
    }
  }
}

// ─────────────────────────────────────────────
// §33  RAILROAD EXPANSION
// ─────────────────────────────────────────────

function _investInRailroad() {
  if (!game._towns) return;

  if (game._towns.railroadBuilt) {
    showNotification('Railroad already built!', 'bad');
    return;
  }

  // Check if Fort Desolation is conquered
  var ftTs = game._towns.towns['fort_desolation'];
  if (!ftTs || !ftTs.controlled) {
    showNotification('Must conquer Fort Desolation first to build the railroad.', 'bad');
    return;
  }

  var cost = 500;
  if (game.gold < cost) {
    showNotification('Need $' + cost + ' to build the railroad.', 'bad');
    return;
  }

  game.gold -= cost;
  game._towns.railroadBuilt = true;

  showNotification('RAILROAD BUILT! Instant travel between all towns!', 'good');
  addJournalEntry('Built the railroad! Can now travel instantly between towns.');
  addXP(50);
}

// ─────────────────────────────────────────────
// §34  DAILY INCOME COLLECTION
// ─────────────────────────────────────────────

function _collectDailyIncome() {
  if (!game._towns) return;
  if (game._towns.dayIncomeCollected) return;

  var income = _getEmpireDailyIncome();
  if (income > 0) {
    game.gold += income;
    game._towns.totalEmpireIncome += income;
    showNotification('Daily empire income: +$' + income, 'good');
  }

  game._towns.dayIncomeCollected = true;
}

function _resetDailyIncome() {
  if (!game._towns) return;
  game._towns.dayIncomeCollected = false;
}

// ─────────────────────────────────────────────
// §35  TOWN MANAGEMENT MENU (G key at sheriff's office)
// ─────────────────────────────────────────────

var _townMgmtOpen = false;
var _townMgmtTab = 0; // 0=overview, 1=upgrades, 2=routes, 3=boss
var _townMgmtSelected = 0;

function _openTownManagement() {
  if (!game._towns) return;
  _townMgmtOpen = true;
  _townMgmtTab = 0;
  _townMgmtSelected = 0;
}

function _closeTownManagement() {
  _townMgmtOpen = false;
}

function _updateTownManagement() {
  if (!_townMgmtOpen) return;

  // Tab switching
  if (consumeKey('Digit1')) { _townMgmtTab = 0; _townMgmtSelected = 0; }
  if (consumeKey('Digit2')) { _townMgmtTab = 1; _townMgmtSelected = 0; }
  if (consumeKey('Digit3')) { _townMgmtTab = 2; _townMgmtSelected = 0; }
  if (consumeKey('Digit4')) { _townMgmtTab = 3; _townMgmtSelected = 0; }

  // Navigation
  if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
    _townMgmtSelected = Math.max(0, _townMgmtSelected - 1);
  }
  if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
    _townMgmtSelected++;
  }

  // Actions
  if (consumeKey('KeyE') || consumeKey('Enter')) {
    var ct = game._towns.currentTown;
    var ts = game._towns.towns[ct];

    if (_townMgmtTab === 1) {
      // Buy upgrade
      var upgradeKeys = Object.keys(TOWN_UPGRADES);
      if (_townMgmtSelected < upgradeKeys.length) {
        _buyTownUpgrade(ct, upgradeKeys[_townMgmtSelected]);
      }
    } else if (_townMgmtTab === 2) {
      // Establish trade/smuggling route
      var controlledTowns = [];
      for (var i = 0; i < TOWN_DATA.length; i++) {
        if (TOWN_DATA[i].id !== ct && game._towns.towns[TOWN_DATA[i].id].controlled) {
          controlledTowns.push(TOWN_DATA[i].id);
        }
      }
      if (_townMgmtSelected < controlledTowns.length) {
        _establishTradeRoute(ct, controlledTowns[_townMgmtSelected]);
      } else if (_townMgmtSelected === controlledTowns.length && (game.corruption || 0) >= 40) {
        // Smuggling
        if (controlledTowns.length > 0) {
          _establishSmugglingRoute(ct, controlledTowns[0]);
        }
      }
    } else if (_townMgmtTab === 3) {
      // Boss actions
      var boss = _getBossForTown(ct);
      if (boss) {
        var bs = game._towns.bossStates[boss.id];
        if (_townMgmtSelected === 0 && _canStartWeakenMission(ct)) {
          var missionIdx = ts.missionsCompleted.length % WEAKEN_MISSION_TEMPLATES.length;
          _startWeakenMission(ct, missionIdx);
          _closeTownManagement();
        } else if (_townMgmtSelected === 1) {
          // Fight lieutenant
          var ltIdx = 0;
          for (var li = 0; li < boss.lieutenants.length; li++) {
            if (bs.lieutenantsDefeated.indexOf(boss.lieutenants[li].id) === -1) {
              ltIdx = li;
              break;
            }
          }
          _startLieutenantFight(boss.id, ltIdx);
          _closeTownManagement();
        } else if (_townMgmtSelected === 2 && bs.influence <= 0) {
          _startBossShowdown(boss.id);
          _closeTownManagement();
        }
      }
    }
  }

  // Close
  if (consumeKey('Escape')) {
    _closeTownManagement();
  }
}

function _renderTownManagement() {
  if (!_townMgmtOpen || !game._towns) return;

  var w = canvas.width;
  var h = canvas.height;
  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  var td = _getTownData(ct);

  // Background
  ctx.fillStyle = 'rgba(20, 12, 4, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOWN MANAGEMENT: ' + (td ? td.name : ct), w / 2, 35);

  // Tabs
  var tabs = ['1:Overview', '2:Upgrades', '3:Routes', '4:Boss'];
  ctx.font = '13px serif';
  for (var t = 0; t < tabs.length; t++) {
    ctx.fillStyle = _townMgmtTab === t ? '#ffd700' : '#a09070';
    ctx.fillText(tabs[t], w * 0.1 + t * (w * 0.8 / tabs.length), 60);
  }

  ctx.textAlign = 'left';
  var startY = 90;
  var lineH = 22;

  if (_townMgmtTab === 0) {
    // Overview
    ctx.fillStyle = '#e8d8b8';
    ctx.font = '14px serif';
    ctx.fillText('Status: ' + (ts.controlled ? 'Controlled' : (ts.visited ? 'Visited' : 'Unknown')), 60, startY);
    ctx.fillText('Prosperity: ' + Math.floor(ts.prosperity) + '/100', 60, startY + lineH);
    ctx.fillText('Reputation: ' + ts.reputation, 60, startY + lineH * 2);
    ctx.fillText('Deputy: ' + (ts.deputy || 'None — Talk to an NPC to appoint'), 60, startY + lineH * 3);
    ctx.fillText('Infiltration: ' + ts.infiltrationProgress + ' NPCs spoken', 60, startY + lineH * 4);
    ctx.fillText('Missions Completed: ' + ts.missionsCompleted.length + '/5', 60, startY + lineH * 5);

    // Active events
    if (ts.events.length > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText('Active Events:', 60, startY + lineH * 7);
      for (var e = 0; e < ts.events.length; e++) {
        ctx.fillStyle = '#e8d8b8';
        ctx.fillText('  ' + ts.events[e].name + ' (' + Math.ceil(ts.events[e].timer) + 's remaining)', 60, startY + lineH * (8 + e));
      }
    }
  } else if (_townMgmtTab === 1) {
    // Upgrades
    ctx.fillStyle = '#e8d8b8';
    ctx.font = '14px serif';
    ctx.fillText('Gold: $' + game.gold, 60, startY);

    var upgradeKeys = Object.keys(TOWN_UPGRADES);
    for (var u = 0; u < upgradeKeys.length; u++) {
      var uid = upgradeKeys[u];
      var upgrade = TOWN_UPGRADES[uid];
      var bought = ts.upgrades && ts.upgrades[uid];
      var sel = u === _townMgmtSelected;

      ctx.fillStyle = sel ? '#ffd700' : (bought ? '#30aa30' : '#e8d8b8');
      ctx.font = sel ? 'bold 14px serif' : '14px serif';
      var prefix = sel ? '> ' : '  ';
      var status = bought ? ' [BUILT]' : ' ($' + upgrade.cost + ')';
      ctx.fillText(prefix + upgrade.name + status + ' — ' + upgrade.desc, 60, startY + lineH * (u + 1));
    }

    if (!ts.controlled) {
      ctx.fillStyle = '#cc3030';
      ctx.fillText('Must control this town to build upgrades.', 60, startY + lineH * (upgradeKeys.length + 2));
    }
  } else if (_townMgmtTab === 2) {
    // Trade routes
    ctx.fillStyle = '#e8d8b8';
    ctx.font = '14px serif';

    // Existing routes
    ctx.fillText('Existing Trade Routes:', 60, startY);
    var routeY = startY + lineH;
    for (var r = 0; r < game._towns.tradeRoutes.length; r++) {
      var rt = game._towns.tradeRoutes[r];
      var f = _getTownData(rt.from);
      var t2 = _getTownData(rt.to);
      ctx.fillText('  ' + (f ? f.name : '?') + ' <-> ' + (t2 ? t2.name : '?') + ' ($' + rt.income + '/day)', 60, routeY);
      routeY += lineH;
    }

    ctx.fillText('Smuggling Routes:', 60, routeY + 10);
    routeY += lineH + 10;
    for (var sr = 0; sr < game._towns.smugglingRoutes.length; sr++) {
      var srt = game._towns.smugglingRoutes[sr];
      var sf = _getTownData(srt.from);
      var st = _getTownData(srt.to);
      ctx.fillStyle = '#cc3030';
      ctx.fillText('  ' + (sf ? sf.name : '?') + ' <-> ' + (st ? st.name : '?') + ' ($' + srt.income + '/day, risky)', 60, routeY);
      routeY += lineH;
    }

    // Establish new
    ctx.fillStyle = '#ffd700';
    ctx.fillText('Establish New:', 60, routeY + 15);
    routeY += lineH + 15;

    var controlledTowns = [];
    for (var ct2 = 0; ct2 < TOWN_DATA.length; ct2++) {
      if (TOWN_DATA[ct2].id !== ct && game._towns.towns[TOWN_DATA[ct2].id].controlled) {
        controlledTowns.push(TOWN_DATA[ct2]);
      }
    }

    for (var c = 0; c < controlledTowns.length; c++) {
      var sel2 = c === _townMgmtSelected;
      ctx.fillStyle = sel2 ? '#ffd700' : '#e8d8b8';
      ctx.font = sel2 ? 'bold 14px serif' : '14px serif';
      ctx.fillText((sel2 ? '> ' : '  ') + 'Trade with ' + controlledTowns[c].name + ' ($75)', 60, routeY);
      routeY += lineH;
    }

    if ((game.corruption || 0) >= 40 && controlledTowns.length > 0) {
      var selSmug = _townMgmtSelected === controlledTowns.length;
      ctx.fillStyle = selSmug ? '#cc3030' : '#aa5522';
      ctx.fillText((selSmug ? '> ' : '  ') + 'Smuggling route (free, risky, corruption 40+)', 60, routeY);
    }

    // Railroad
    routeY += lineH * 2;
    ctx.fillStyle = game._towns.railroadBuilt ? '#30aa30' : '#e8d8b8';
    ctx.fillText('Railroad: ' + (game._towns.railroadBuilt ? 'BUILT — Instant travel!' : 'Not built ($500, need Fort Desolation)'), 60, routeY);
  } else if (_townMgmtTab === 3) {
    // Boss
    var boss = _getBossForTown(ct);
    if (!boss) {
      ctx.fillStyle = '#a09070';
      ctx.fillText('No crime boss in this town.', 60, startY);
    } else {
      var bs = game._towns.bossStates[boss.id];

      ctx.fillStyle = '#cc3030';
      ctx.font = 'bold 16px serif';
      ctx.fillText(boss.name + ' — ' + boss.gang, 60, startY);

      ctx.fillStyle = '#e8d8b8';
      ctx.font = '14px serif';
      ctx.fillText('Influence: ' + bs.influence + '%', 60, startY + lineH);
      ctx.fillText('Lieutenants Defeated: ' + bs.lieutenantsDefeated.length + '/2', 60, startY + lineH * 2);
      ctx.fillText('Status: ' + (bs.defeated ? 'DEFEATED' : (bs.influence <= 0 ? 'VULNERABLE' : 'Active')), 60, startY + lineH * 3);
      ctx.fillText('Infiltration: ' + ts.infiltrationProgress + '/5 NPCs (' + ts.infiltrationDays + ' days)', 60, startY + lineH * 4);

      // Actions
      var actionY = startY + lineH * 6;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px serif';
      ctx.fillText('Actions:', 60, actionY);
      actionY += lineH;

      var actions = [];
      if (_canStartWeakenMission(ct)) {
        actions.push({ label: 'Start Weaken Mission', available: true });
      } else {
        actions.push({ label: 'Weaken Mission (need 5+ NPCs, 3+ days)', available: false });
      }

      // Lieutenant fight
      var hasUndefeatedLt = false;
      for (var li = 0; li < boss.lieutenants.length; li++) {
        if (bs.lieutenantsDefeated.indexOf(boss.lieutenants[li].id) === -1) {
          hasUndefeatedLt = true;
          actions.push({ label: 'Fight ' + boss.lieutenants[li].name + ' (HP:' + boss.lieutenants[li].hp + ')', available: true });
          break;
        }
      }
      if (!hasUndefeatedLt) {
        actions.push({ label: 'All lieutenants defeated', available: false });
      }

      // Boss showdown
      if (bs.influence <= 0 && !bs.defeated) {
        actions.push({ label: 'FINAL SHOWDOWN with ' + boss.name + '!', available: true });
      } else if (bs.defeated) {
        actions.push({ label: boss.name + ' has been defeated!', available: false });
      } else {
        actions.push({ label: 'Showdown (need 0% influence)', available: false });
      }

      for (var a = 0; a < actions.length; a++) {
        var selA = a === _townMgmtSelected;
        ctx.fillStyle = selA ? '#ffd700' : (actions[a].available ? '#e8d8b8' : '#666');
        ctx.font = selA ? 'bold 14px serif' : '14px serif';
        ctx.fillText((selA ? '> ' : '  ') + actions[a].label, 60, actionY);
        actionY += lineH;
      }
    }
  }

  // Controls
  ctx.fillStyle = '#a09070';
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('1-4: Tabs  |  W/S: Navigate  |  E: Select  |  ESC: Close', w / 2, h - 15);
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §36  BIOME RENDERING OVERRIDE
// ─────────────────────────────────────────────

function _getBiomePalette() {
  if (!game._towns) return null;
  var td = _getTownData(game._towns.currentTown);
  if (!td) return null;
  return td.palette;
}

// Override sand color based on current town biome
function _getTownSandColor() {
  var p = _getBiomePalette();
  return p ? p.sand : PALETTE.sand;
}

function _getTownSandDarkColor() {
  var p = _getBiomePalette();
  return p ? p.sandDark : PALETTE.sandDark;
}

function _getTownRoadColor() {
  var p = _getBiomePalette();
  return p ? p.road : PALETTE.road;
}

// ─────────────────────────────────────────────
// §37  NPC DIALOG HOOK — Track conversations
// ─────────────────────────────────────────────

// This is called from the main game when NPC dialog is shown
function _onNPCDialog(npcId) {
  if (!game._towns) return;
  _checkNPCSpoken(npcId);
}

// ─────────────────────────────────────────────
// §38  DEPUTY APPOINTMENT ON NPC TALK
// ─────────────────────────────────────────────

function _tryAppointDeputy(npcName) {
  if (!game._towns) return;
  var ct = game._towns.currentTown;
  _appointDeputy(ct, npcName);
}

// ─────────────────────────────────────────────
// §39  DIFFICULTY SCALING PER TOWN
// ─────────────────────────────────────────────

function _getScaledEnemyHP(baseHP) {
  if (!game._towns) return baseHP;
  var mult = _getDifficultyMultiplier(game._towns.currentTown);
  return Math.ceil(baseHP * mult);
}

function _getScaledEnemyDamage(baseDamage) {
  if (!game._towns) return baseDamage;
  var mult = _getDifficultyMultiplier(game._towns.currentTown);
  return Math.ceil(baseDamage * mult);
}

// ─────────────────────────────────────────────
// §40  MAIN UPDATE FUNCTION
// ─────────────────────────────────────────────

function updateTowns(dt) {
  initTowns();
  if (!game.player) return;

  var realDt = dt || (1 / 60);

  // Handle overlays first (they block other input)
  if (game._towns.bossFightActive) {
    if (game._towns.syndicateActive) {
      _updateSyndicate(realDt);
    } else {
      _updateBossShowdown(realDt);
    }
    return;
  }

  if (game._towns.lieutenantFightActive) {
    _updateLieutenantFight(realDt);
    return;
  }

  if (game._towns.travelActive) {
    _updateTravel(realDt);
    return;
  }

  if (game._towns.mapOpen) {
    _updateTravelMap();
    return;
  }

  if (_townMgmtOpen) {
    _updateTownManagement();
    return;
  }

  if (game._towns.territoryOverlayOpen) {
    if (consumeKey('Escape')) game._towns.territoryOverlayOpen = false;
    return;
  }

  if (game._towns.empireStatsOpen) {
    if (consumeKey('Escape')) game._towns.empireStatsOpen = false;
    return;
  }

  if (game.state !== 'playing') return;

  // Check if input is blocked by other systems
  if (typeof _inputBlockedByMinigameOrFeature === 'function' && _inputBlockedByMinigameOrFeature()) return;

  // T key to open travel map (at town edge)
  if (consumeKey('KeyT')) {
    if (_isAtTownEdge()) {
      _openTravelMap();
    } else {
      showNotification('Go to the edge of town to travel (T key).', 'bad');
    }
  }

  // N key for territory overview
  if (consumeKey('KeyN')) {
    game._towns.territoryOverlayOpen = !game._towns.territoryOverlayOpen;
  }

  // B key for empire stats
  if (consumeKey('KeyB')) {
    game._towns.empireStatsOpen = !game._towns.empireStatsOpen;
  }

  // G key at sheriff's office for town management
  // (Only if near sheriff's office building — check building proximity)
  if (consumeKey('KeyG')) {
    var p = game.player;
    var ptx = Math.floor(p.x / TILE);
    var pty = Math.floor((p.y + 10) / TILE);
    var nearSheriff = false;
    for (var bi = 0; bi < game.buildings.length; bi++) {
      var bld = game.buildings[bi];
      if (bld.type === BUILDING_TYPES.SHERIFF) {
        var bCX = bld.x + bld.w / 2;
        var bCY = bld.y + bld.h / 2;
        var d = Math.hypot(ptx - bCX, pty - bCY);
        if (d < 8) { nearSheriff = true; break; }
      }
    }
    if (nearSheriff) {
      _openTownManagement();
    }
  }

  // R key to invest in railroad
  if (consumeKey('KeyR')) {
    if (!game._towns.railroadBuilt && game._towns.towns['fort_desolation'].controlled) {
      _investInRailroad();
    }
  }

  // Daily income on new day
  if (game.dayCount && game._towns._lastDay !== game.dayCount) {
    game._towns._lastDay = game.dayCount;
    _resetDailyIncome();
    _collectDailyIncome();
    _updateSmugglingRoutes(0);
  }

  // Update sub-systems
  _updateInfiltration(realDt);
  _updateWeakenMission(realDt);
  _updateControlledTowns(realDt);
  _updateProsperity(realDt);
  _updateRetaliation(realDt);
  _updateTownEvents(realDt);
}

// ─────────────────────────────────────────────
// §41  MAIN RENDER FUNCTION
// ─────────────────────────────────────────────

function renderTownsOverlay() {
  if (!game._towns) return;

  // Boss fight overlays (highest priority)
  if (game._towns.bossFightActive) {
    _renderBossShowdown();
    return;
  }

  // Lieutenant fight
  if (game._towns.lieutenantFightActive) {
    _renderLieutenantFight();
    return;
  }

  // Travel scene
  if (game._towns.travelActive) {
    _renderTravel();
    return;
  }

  // Travel map
  if (game._towns.mapOpen) {
    _renderTravelMap();
    return;
  }

  // Town management
  if (_townMgmtOpen) {
    _renderTownManagement();
    return;
  }

  // Territory overlay
  if (game._towns.territoryOverlayOpen) {
    _renderTerritoryOverlay();
    return;
  }

  // Empire stats
  if (game._towns.empireStatsOpen) {
    _renderEmpireStats();
    return;
  }

  // In-game overlays (mission objective, etc.)
  if (game.state === 'playing') {
    _renderMissionObjective();
    _renderTownHUD();
  }
}

// ─────────────────────────────────────────────
// §42  TOWN HUD (current town info)
// ─────────────────────────────────────────────

function _renderTownHUD() {
  if (!game._towns) return;

  var td = _getTownData(game._towns.currentTown);
  if (!td) return;

  // Town name in top-left
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(5, 105, 160, 44);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px serif';
  ctx.textAlign = 'left';
  ctx.fillText(td.name, 10, 118);

  // Difficulty stars
  ctx.fillStyle = '#a09070';
  ctx.font = '10px serif';
  ctx.fillText('Danger: ' + '\u2605'.repeat(td.difficulty), 10, 132);

  // Travel hint at edge
  if (_isAtTownEdge()) {
    ctx.fillStyle = '#ffd700';
    ctx.font = '11px serif';
    ctx.fillText('Press T to travel', 10, 145);
  }

  // Active retaliation warning
  if (game._towns.retaliationActive && !game._towns.retaliationActive.resolved) {
    var ret = game._towns.retaliationActive;
    var retTd = _getTownData(ret.targetTown);
    ctx.fillStyle = 'rgba(200, 0, 0, 0.6)';
    ctx.fillRect(canvas.width / 2 - 150, 100, 300, 30);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.fillText('RAID on ' + (retTd ? retTd.name : '?') + ' in ' + Math.ceil(ret.warningTimer) + 's!', canvas.width / 2, 120);
    ctx.textAlign = 'left';
  }

  // Syndicate hint
  if (_allTownsControlled() && !game._towns.syndicateDefeated && !game._towns.syndicateActive) {
    ctx.fillStyle = 'rgba(100, 0, 100, 0.5)';
    ctx.fillRect(canvas.width / 2 - 160, canvas.height - 80, 320, 25);
    ctx.fillStyle = '#cc88ff';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('The Syndicate awaits... Visit the Sheriff\'s Office.', canvas.width / 2, canvas.height - 63);
    ctx.textAlign = 'left';
  }

  // Key hints
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(canvas.width - 175, canvas.height - 80, 170, 75);
  ctx.fillStyle = '#a09070';
  ctx.font = '10px serif';
  ctx.textAlign = 'right';
  var kx = canvas.width - 10;
  ctx.fillText('T — Travel Map (at edge)', kx, canvas.height - 65);
  ctx.fillText('N — Territory Overview', kx, canvas.height - 52);
  ctx.fillText('B — Empire Statistics', kx, canvas.height - 39);
  ctx.fillText('G — Town Management (office)', kx, canvas.height - 26);
  ctx.fillText('R — Build Railroad', kx, canvas.height - 13);
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §43  SYNDICATE TRIGGER FROM SHERIFF'S OFFICE
// ─────────────────────────────────────────────

function _checkSyndicateTrigger() {
  if (!game._towns) return;
  if (game._towns.syndicateDefeated || game._towns.syndicateActive) return;
  if (!_allTownsControlled()) return;

  // Triggered when player enters sheriff's office after controlling all towns
  var p = game.player;
  if (!p) return;
  var ptx = Math.floor(p.x / TILE);
  var pty = Math.floor((p.y + 10) / TILE);

  for (var bi = 0; bi < game.buildings.length; bi++) {
    var bld = game.buildings[bi];
    if (bld.type === BUILDING_TYPES.SHERIFF) {
      if (ptx >= bld.x && ptx < bld.x + bld.w && pty >= bld.y && pty < bld.y + bld.h) {
        // Player is inside sheriff's office with all towns controlled
        if (consumeKey('KeyE')) {
          _startSyndicateFight();
        }
        return;
      }
    }
  }
}

// ─────────────────────────────────────────────
// §44  GHOST TOWN FOG EFFECT
// ─────────────────────────────────────────────

function _renderBiomeEffects() {
  if (!game._towns) return;
  var td = _getTownData(game._towns.currentTown);
  if (!td) return;

  if (td.biome === 'ghost') {
    // Eerie fog overlay
    ctx.fillStyle = 'rgba(100, 100, 120, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floating fog particles
    var time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(150, 150, 170, 0.06)';
    for (var f = 0; f < 8; f++) {
      var fx = (Math.sin(time * 0.3 + f * 1.7) * 0.5 + 0.5) * canvas.width;
      var fy = (Math.cos(time * 0.2 + f * 2.3) * 0.5 + 0.5) * canvas.height;
      ctx.beginPath();
      ctx.arc(fx, fy, 40 + Math.sin(time + f) * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (td.biome === 'mountain') {
    // Slight cool tint
    ctx.fillStyle = 'rgba(100, 120, 140, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (td.biome === 'river') {
    // Slight green tint
    ctx.fillStyle = 'rgba(100, 140, 100, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (td.biome === 'frontier') {
    // Warm dusty tint
    ctx.fillStyle = 'rgba(140, 120, 90, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ─────────────────────────────────────────────
// §45  CONTROLLED TOWN FLAG RENDERING
// ─────────────────────────────────────────────

function _renderTownFlags() {
  if (!game._towns) return;
  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || !ts.controlled) return;

  // Draw a flag on the sheriff's office
  for (var bi = 0; bi < game.buildings.length; bi++) {
    var bld = game.buildings[bi];
    if (bld.type !== BUILDING_TYPES.SHERIFF) continue;

    var fx = (bld.x + bld.w / 2) * TILE - (game.camera ? game.camera.x : 0);
    var fy = bld.y * TILE - 16 - (game.camera ? game.camera.y : 0);

    // Flag pole
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(fx, fy, 3, 30);

    // Flag
    var flagWave = Math.sin(Date.now() * 0.003) * 2;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(fx + 3, fy);
    ctx.lineTo(fx + 20 + flagWave, fy + 4);
    ctx.lineTo(fx + 18 + flagWave, fy + 12);
    ctx.lineTo(fx + 3, fy + 10);
    ctx.closePath();
    ctx.fill();

    // Star on flag
    ctx.fillStyle = '#3a2a14';
    ctx.font = '8px serif';
    ctx.fillText('\u2605', fx + 8, fy + 10);
  }
}

// ─────────────────────────────────────────────
// §46  CHEERING NPCs AFTER TAKEOVER
// ─────────────────────────────────────────────

var _cheerTimer = 0;

function _updateNPCCheering(dt) {
  if (!game._towns) return;
  var ct = game._towns.currentTown;
  var ts = game._towns.towns[ct];
  if (!ts || !ts.controlled || ct === 'dusty_gulch') return;

  _cheerTimer += dt;
  if (_cheerTimer > 10) {
    _cheerTimer = 0;
    // Random NPC cheers
    if (game.npcs && game.npcs.length > 0 && Math.random() < 0.2) {
      var npc = game.npcs[rand(0, game.npcs.length - 1)];
      if (!npc.dead && !npc.hostile && npc.visible) {
        var cheers = ['Hooray for the Sheriff!', 'Long live the law!', 'We\'re free!', 'Thank you, Sheriff!', 'Justice prevails!'];
        addFloatingText(npc.x, npc.y - 20, cheers[rand(0, cheers.length - 1)], '#30aa30');
      }
    }
  }
}

// ─────────────────────────────────────────────
// §47  SAVE/LOAD HOOKS
// ─────────────────────────────────────────────

// These functions can be called by game.js to save/load town state

function getTownsSaveData() {
  if (!game._towns) return null;

  // Create a serializable copy
  var save = {
    currentTown: game._towns.currentTown,
    towns: {},
    bossStates: {},
    tradeRoutes: game._towns.tradeRoutes,
    smugglingRoutes: game._towns.smugglingRoutes,
    railroadBuilt: game._towns.railroadBuilt,
    syndicateDefeated: game._towns.syndicateDefeated,
    totalEmpireIncome: game._towns.totalEmpireIncome,
  };

  for (var tid in game._towns.towns) {
    var ts = game._towns.towns[tid];
    save.towns[tid] = {
      visited: ts.visited,
      controlled: ts.controlled,
      prosperity: ts.prosperity,
      deputy: ts.deputy,
      upgrades: ts.upgrades,
      reputation: ts.reputation,
      bossInfluence: ts.bossInfluence,
      infiltrationProgress: ts.infiltrationProgress,
      infiltrationDays: ts.infiltrationDays,
      npcsSpoken: ts.npcsSpoken,
      missionsCompleted: ts.missionsCompleted,
      unlocked: ts.unlocked,
    };
  }

  for (var bid in game._towns.bossStates) {
    var bs = game._towns.bossStates[bid];
    save.bossStates[bid] = {
      defeated: bs.defeated,
      influence: bs.influence,
      lieutenantsDefeated: bs.lieutenantsDefeated,
    };
  }

  return save;
}

function loadTownsSaveData(save) {
  if (!save) return;

  initTowns();

  game._towns.currentTown = save.currentTown || 'dusty_gulch';
  game._towns.railroadBuilt = save.railroadBuilt || false;
  game._towns.syndicateDefeated = save.syndicateDefeated || false;
  game._towns.totalEmpireIncome = save.totalEmpireIncome || 0;
  game._towns.tradeRoutes = save.tradeRoutes || [];
  game._towns.smugglingRoutes = save.smugglingRoutes || [];

  if (save.towns) {
    for (var tid in save.towns) {
      if (game._towns.towns[tid]) {
        var st = save.towns[tid];
        var ts = game._towns.towns[tid];
        ts.visited = st.visited || false;
        ts.controlled = st.controlled || false;
        ts.prosperity = st.prosperity || 30;
        ts.deputy = st.deputy || null;
        ts.upgrades = st.upgrades || {};
        ts.reputation = st.reputation || 0;
        ts.bossInfluence = st.bossInfluence || 100;
        ts.infiltrationProgress = st.infiltrationProgress || 0;
        ts.infiltrationDays = st.infiltrationDays || 0;
        ts.npcsSpoken = st.npcsSpoken || [];
        ts.missionsCompleted = st.missionsCompleted || [];
        ts.unlocked = st.unlocked || false;
      }
    }
  }

  if (save.bossStates) {
    for (var bid in save.bossStates) {
      if (game._towns.bossStates[bid]) {
        var sb = save.bossStates[bid];
        var bs = game._towns.bossStates[bid];
        bs.defeated = sb.defeated || false;
        bs.influence = sb.influence !== undefined ? sb.influence : 100;
        bs.lieutenantsDefeated = sb.lieutenantsDefeated || [];
      }
    }
  }
}

// ─────────────────────────────────────────────
// §48  TOWN-SPECIFIC NPC NAMES
// ─────────────────────────────────────────────

const TOWN_NPC_NAMES = {
  silver_peak: [
    'Miner Mike', 'Pickaxe Pete', 'Nugget Nancy', 'Shaft Sam',
    'Boulder Betty', 'Ore Oscar', 'Tunnel Tom', 'Gem Gertie',
  ],
  riverside: [
    'Fisher Frank', 'Dock Diana', 'Captain Carl', 'Anchor Annie',
    'Harbor Hank', 'Wave Wendy', 'Boat Bob', 'Reed Rachel',
  ],
  fort_desolation: [
    'Sentry Steve', 'Guard Grace', 'Patrol Paul', 'Scout Sarah',
    'Warden Walt', 'Trooper Tina', 'Ranger Rick', 'Lookout Lucy',
  ],
  perdition: [
    'Whisper Will', 'Shadow Sue', 'Phantom Phil', 'Ghost Greta',
    'Haunt Harry', 'Wraith Wanda', 'Specter Stan', 'Shade Shelly',
  ],
};

// ─────────────────────────────────────────────
// §49  ENCOUNTER: RIVAL SHERIFF NAMES
// ─────────────────────────────────────────────

const RIVAL_SHERIFF_NAMES = [
  'Sheriff Blake', 'Sheriff Morgan', 'Sheriff Dawson', 'Sheriff Reeves',
  'Sheriff Hardin', 'Sheriff Masterson', 'Sheriff Holliday', 'Sheriff Hickok',
];

// ─────────────────────────────────────────────
// §50  TOWN UNLOCK NOTIFICATIONS
// ─────────────────────────────────────────────

function _checkTownUnlocks() {
  if (!game._towns) return;

  // Silver Peak unlocks after day 5
  if (game.dayCount >= 5 && !game._towns.towns['silver_peak'].unlocked) {
    game._towns.towns['silver_peak'].unlocked = true;
    showNotification('Silver Peak is now accessible! Ride to the town edge and press T.', 'good');
    addJournalEntry('Heard rumors of trouble in Silver Peak. Time to investigate.');
  }

  // Other towns unlock via boss defeat (handled in _defeatBoss)
}

// ─────────────────────────────────────────────
// §51  INTEGRATION HOOKS
// ─────────────────────────────────────────────

// These are thin wrappers that can be called from the main game loop
// to integrate with the town system without modifying game.js heavily.

function townsBlocksInput() {
  if (!game._towns) return false;
  return game._towns.mapOpen ||
    game._towns.travelActive ||
    game._towns.bossFightActive ||
    game._towns.lieutenantFightActive ||
    game._towns.territoryOverlayOpen ||
    game._towns.empireStatsOpen ||
    _townMgmtOpen;
}

function townsBlocksMovement() {
  if (!game._towns) return false;
  return game._towns.mapOpen ||
    game._towns.travelActive ||
    game._towns.bossFightActive ||
    game._towns.lieutenantFightActive ||
    _townMgmtOpen;
}

// Public API for other systems to adjust town rep
function adjustCurrentTownRep(amount) {
  if (!game._towns) return;
  _adjustTownReputation(game._towns.currentTown, amount);
}

// Public API for crime spreading
function spreadCrimesAcrossTowns(severity) {
  if (!game._towns) return;
  _spreadWanted(game._towns.currentTown, severity);
}

// Public API for NPC dialog tracking
function onTownNPCDialog(npcId) {
  if (!game._towns) return;
  _onNPCDialog(npcId);
}

// Public API for current town name
function getCurrentTownName() {
  if (!game._towns) return 'Dusty Gulch';
  var td = _getTownData(game._towns.currentTown);
  return td ? td.name : 'Unknown';
}

// Public API for difficulty multiplier
function getCurrentTownDifficultyMult() {
  if (!game._towns) return 1;
  return _getDifficultyMultiplier(game._towns.currentTown);
}

// ─────────────────────────────────────────────
// §52  BIOME-SPECIFIC AMBIENT SOUNDS
// ─────────────────────────────────────────────

var _biomeAmbientTimer = 0;

function _updateBiomeAmbience(dt) {
  if (!game._towns) return;
  var td = _getTownData(game._towns.currentTown);
  if (!td) return;

  _biomeAmbientTimer += dt;
  if (_biomeAmbientTimer < 15) return;
  _biomeAmbientTimer = 0;

  // Ghost town has eerie sounds
  if (td.biome === 'ghost' && audio && audio.playDing) {
    // Low-pitched ding for creepiness
    if (Math.random() < 0.3) audio.playDing();
  }
}

// ─────────────────────────────────────────────
// §53  TOWN-SPECIFIC CRIME FREQUENCY
// ─────────────────────────────────────────────

function getTownCrimeFrequencyMultiplier() {
  if (!game._towns) return 1;
  var td = _getTownData(game._towns.currentTown);
  if (!td) return 1;

  // Higher difficulty = more crime
  var mult = 1 + (td.difficulty - 1) * 0.2;

  // Controlled towns with deputy have less crime
  var ts = game._towns.towns[game._towns.currentTown];
  if (ts && ts.controlled && ts.deputy) {
    mult *= 0.7;
  }

  // High prosperity reduces crime
  if (ts && ts.prosperity > 70) {
    mult *= 0.8;
  }

  return mult;
}

// ─────────────────────────────────────────────
// §54  BOSS ENCOUNTER TRIGGER (RANDOM IN-TOWN)
// ─────────────────────────────────────────────

var _bossEncounterTimer = 0;

function _updateBossEncounters(dt) {
  if (!game._towns) return;

  var ct = game._towns.currentTown;
  if (ct === 'dusty_gulch') return;

  var boss = _getBossForTown(ct);
  if (!boss) return;

  var bs = game._towns.bossStates[boss.id];
  if (!bs || bs.defeated) return;

  // Boss appears occasionally to taunt
  _bossEncounterTimer += dt;
  if (_bossEncounterTimer > 60 && !bs.encountered) {
    _bossEncounterTimer = 0;
    bs.encountered = true;
    showNotification(boss.name + ': "' + boss.lines[rand(0, boss.lines.length - 1)] + '"', 'bad');
    addJournalEntry('Encountered ' + boss.name + ' in ' + (_getTownData(ct) || {}).name + '.');
  }
}

// ─────────────────────────────────────────────
// §55  PASSIVE INCOME DISPLAY
// ─────────────────────────────────────────────

function _renderPassiveIncomePopup() {
  if (!game._towns) return;
  // This gets called when daily income is collected
  // The actual popup is handled by showNotification in _collectDailyIncome
}

// ─────────────────────────────────────────────
// §56  EXTENDED UPDATE (sub-systems that need per-frame update)
// ─────────────────────────────────────────────

function _updateTownsSubsystems(dt) {
  if (!game._towns) return;
  if (game.state !== 'playing') return;

  _checkTownUnlocks();
  _updateNPCCheering(dt);
  _updateBiomeAmbience(dt);
  _updateBossEncounters(dt);
  _checkSyndicateTrigger();
}

// Patch into updateTowns at the end
var _origUpdateTowns = updateTowns;
updateTowns = function(dt) {
  _origUpdateTowns(dt);
  if (game._towns && game.state === 'playing') {
    _updateTownsSubsystems(dt || (1/60));
  }
};

// Patch into renderTownsOverlay to add biome effects and flags
var _origRenderTownsOverlay = renderTownsOverlay;
renderTownsOverlay = function() {
  _origRenderTownsOverlay();

  // Additional render passes that don't block other overlays
  if (game._towns && game.state === 'playing' &&
      !game._towns.mapOpen && !game._towns.travelActive &&
      !game._towns.bossFightActive && !game._towns.lieutenantFightActive &&
      !_townMgmtOpen && !game._towns.territoryOverlayOpen && !game._towns.empireStatsOpen) {
    _renderBiomeEffects();
    _renderTownFlags();
  }
};

// ─────────────────────────────────────────────
// §57  CONSOLE LOG — System loaded
// ─────────────────────────────────────────────

console.log('[Sheriff Simulator] Towns system loaded — 5 towns, 4 bosses, ' + TRAVEL_TIPS.length + ' tips');
