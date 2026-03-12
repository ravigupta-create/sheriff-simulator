// ============================================================
// SHERIFF SIMULATOR - Complete Game Engine
// 100% free, zero external dependencies
// ============================================================

'use strict';

// ---- CONSTANTS ----
const TILE = 32;
const MAP_W = 80, MAP_H = 60;
const PLAYER_SPEED = 2.5;
const DAY_LENGTH = 180; // seconds per game day
const CRIMES_PER_DAY_MIN = 2, CRIMES_PER_DAY_MAX = 5;

const PALETTE = {
  sand: '#c4a55a', sandDark: '#a68a3e', sandLight: '#dbc278',
  wood: '#6b4226', woodDark: '#4a2e1a', woodLight: '#8b6340',
  stone: '#7a7062', stoneDark: '#5a5248', stoneLight: '#9a9082',
  roof: '#8b4513', roofDark: '#6b3010', roofLight: '#a85a28',
  cactus: '#4a7a2e', cactusD: '#3a6020',
  sky: '#d4a050', skyNight: '#1a1030', skyDusk: '#c06030',
  water: '#4a6a8a', blood: '#8b0000',
  gold: '#ffd700', uiDark: '#140c04', uiBorder: '#5a3a18',
  skin: '#d4a574', skinDark: '#b8844a',
  hat: '#3a2a14', cloth: '#8b1a1a', badge: '#ffd700',
  outlaw: '#2a2a2a', outlawHat: '#1a1a1a'
};

const RANKS = [
  { name: 'Deputy', rep: 0 },
  { name: 'Sheriff', rep: 25 },
  { name: 'Marshal', rep: 50 },
  { name: 'Legend', rep: 75 },
  { name: 'Wyatt Earp', rep: 95 }
];

const BUILDING_TYPES = {
  SHERIFF: 0, SALOON: 1, BANK: 2, GENERAL: 3, JAIL: 4,
  CHURCH: 5, STABLE: 6, HOTEL: 7, HOUSE: 8, BLACKSMITH: 9,
  WELL: 10, GALLOWS: 11
};

const NPC_TYPES = {
  TOWNSPERSON: 'townsperson', OUTLAW: 'outlaw', BARTENDER: 'bartender',
  SHOPKEEPER: 'shopkeeper', MAYOR: 'mayor', DEPUTY: 'deputy',
  BANKER: 'banker', PREACHER: 'preacher', STRANGER: 'stranger',
  BOUNTY: 'bounty'
};

// ---- AUDIO ENGINE ----
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.4;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.25;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.master);
    this.initialized = true;
  }

  playNote(freq, duration, type = 'square', gainNode = null) {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(gainNode || this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playGunshot() {
    if (!this.initialized) return;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 0.6;
    src.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  playStep() {
    if (!this.initialized) return;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2 * (1 - i / data.length);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 0.15;
    src.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  playDing() {
    this.playNote(880, 0.15, 'sine');
    setTimeout(() => this.playNote(1108, 0.2, 'sine'), 100);
  }

  playBad() {
    this.playNote(220, 0.2, 'sawtooth');
    setTimeout(() => this.playNote(165, 0.3, 'sawtooth'), 150);
  }

  playDuelDraw() {
    this.playNote(440, 0.1, 'square');
    setTimeout(() => this.playNote(660, 0.1, 'square'), 80);
    setTimeout(() => this.playNote(880, 0.15, 'square'), 160);
  }

  playVictory() {
    [0, 100, 200, 300, 400].forEach((t, i) => {
      setTimeout(() => this.playNote([523, 659, 784, 1047, 1318][i], 0.3, 'sine'), t);
    });
  }

  playAmbientWind() {
    if (!this.initialized) return;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 4, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03 * (0.5 + 0.5 * Math.sin(i / 5000));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0.3;
    src.connect(g);
    g.connect(this.musicGain);
    src.start();
  }

  playWesternRiff() {
    if (!this.initialized) return;
    const notes = [330, 0, 392, 0, 330, 294, 262, 0, 294, 330, 294, 262, 220, 0, 262, 0];
    notes.forEach((n, i) => {
      if (n > 0) setTimeout(() => this.playNote(n, 0.25, 'triangle', this.musicGain), i * 200);
    });
  }
}

const audio = new AudioEngine();

// ---- INPUT ----
const keys = {};
const keysJustPressed = {};
document.addEventListener('keydown', e => {
  if (!keys[e.code]) keysJustPressed[e.code] = true;
  keys[e.code] = true;
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
function consumeKey(code) {
  if (keysJustPressed[code]) { keysJustPressed[code] = false; return true; }
  return false;
}

// ---- UTILITY ----
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randF(a, b) { return Math.random() * (b - a) + a; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ---- PROCEDURAL TOWN MAP ----
function generateTown() {
  // 0=sand, 1=road, 2=building, 3=wall, 4=door, 5=water, 6=cactus, 7=rock, 8=wood floor
  const map = Array.from({ length: MAP_H }, () => new Uint8Array(MAP_W));
  const buildings = [];

  // Fill with sand
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      map[y][x] = 0;

  // Main road horizontal
  for (let x = 0; x < MAP_W; x++)
    for (let y = 28; y <= 31; y++)
      map[y][x] = 1;

  // Cross road vertical
  for (let y = 0; y < MAP_H; y++)
    for (let x = 38; x <= 41; x++)
      map[y][x] = 1;

  // Secondary roads
  for (let x = 10; x < 70; x++) { map[15][x] = 1; map[16][x] = 1; }
  for (let x = 10; x < 70; x++) { map[43][x] = 1; map[44][x] = 1; }
  for (let y = 5; y < 55; y++) { map[y][20] = 1; map[y][21] = 1; }
  for (let y = 5; y < 55; y++) { map[y][58] = 1; map[y][59] = 1; }

  // Building placement
  const bDefs = [
    { type: BUILDING_TYPES.SHERIFF, name: "Sheriff's Office", w: 8, h: 6, x: 10, y: 8 },
    { type: BUILDING_TYPES.SALOON, name: 'Saloon', w: 10, h: 7, x: 24, y: 7 },
    { type: BUILDING_TYPES.BANK, name: 'Bank', w: 8, h: 6, x: 44, y: 8 },
    { type: BUILDING_TYPES.GENERAL, name: 'General Store', w: 8, h: 5, x: 55, y: 8 },
    { type: BUILDING_TYPES.JAIL, name: 'Jail', w: 7, h: 6, x: 10, y: 34 },
    { type: BUILDING_TYPES.CHURCH, name: 'Church', w: 8, h: 8, x: 24, y: 34 },
    { type: BUILDING_TYPES.STABLE, name: 'Stables', w: 10, h: 6, x: 44, y: 34 },
    { type: BUILDING_TYPES.HOTEL, name: 'Hotel', w: 8, h: 7, x: 55, y: 34 },
    { type: BUILDING_TYPES.BLACKSMITH, name: 'Blacksmith', w: 7, h: 5, x: 65, y: 8 },
    { type: BUILDING_TYPES.HOUSE, name: 'House', w: 6, h: 5, x: 10, y: 47 },
    { type: BUILDING_TYPES.HOUSE, name: 'House', w: 6, h: 5, x: 24, y: 47 },
    { type: BUILDING_TYPES.HOUSE, name: 'House', w: 6, h: 5, x: 44, y: 47 },
    { type: BUILDING_TYPES.WELL, name: 'Well', w: 3, h: 3, x: 39, y: 24 },
    { type: BUILDING_TYPES.GALLOWS, name: 'Gallows', w: 4, h: 4, x: 34, y: 34 },
  ];

  for (const b of bDefs) {
    // Walls
    for (let dy = 0; dy < b.h; dy++) {
      for (let dx = 0; dx < b.w; dx++) {
        const mx = b.x + dx, my = b.y + dy;
        if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H) {
          if (dy === 0 || dy === b.h - 1 || dx === 0 || dx === b.w - 1) {
            map[my][mx] = 3; // wall
          } else {
            map[my][mx] = 8; // wood floor
          }
        }
      }
    }
    // Door at bottom center
    const doorX = b.x + Math.floor(b.w / 2);
    const doorY = b.y + b.h - 1;
    if (doorX >= 0 && doorX < MAP_W && doorY >= 0 && doorY < MAP_H) {
      map[doorY][doorX] = 4;
    }
    buildings.push({ ...b, doorX, doorY });
  }

  // Scatter cacti
  for (let i = 0; i < 60; i++) {
    const x = rand(1, MAP_W - 2), y = rand(1, MAP_H - 2);
    if (map[y][x] === 0) map[y][x] = 6;
  }

  // Scatter rocks
  for (let i = 0; i < 40; i++) {
    const x = rand(1, MAP_W - 2), y = rand(1, MAP_H - 2);
    if (map[y][x] === 0) map[y][x] = 7;
  }

  // Small pond
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const x = 70 + dx, y = 50 + dy;
      if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H && Math.hypot(dx, dy) < 3) {
        map[y][x] = 5;
      }
    }
  }

  return { map, buildings };
}

// ---- NPC GENERATION ----
const NPC_NAMES = {
  townsperson: ['Martha', 'Hank', 'Clara', 'Jeb', 'Eliza', 'Silas', 'Ada', 'Gus', 'Pearl', 'Clem', 'Maude', 'Buck'],
  outlaw: ['Black Jack', 'Rattlesnake Pete', 'El Diablo', 'Scarface McGee', 'Dead-Eye Dan', 'Bloody Mary'],
  bartender: ['Big Jim'],
  shopkeeper: ['Mr. Chen'],
  mayor: ['Mayor Hargrove'],
  deputy: ['Deputy Barnes'],
  banker: ['Mr. Whitmore'],
  preacher: ['Father O\'Brien'],
  stranger: ['The Stranger', 'Mysterious Drifter', 'One-Eyed Jack'],
  bounty: ['Wanted: El Lobo', 'Wanted: The Viper', 'Wanted: Mad Dog Murphy', 'Wanted: Coyote Bill']
};

const DIALOGS = {
  townsperson: {
    idle: [
      "Fine day, Sheriff. Watch yourself out there.",
      "Heard there's trouble brewin' at the edge of town.",
      "Thank the Lord we got a lawman 'round here.",
      "My chickens been real nervous lately. Somethin' ain't right.",
      "You keep this town safe, Sheriff. We're countin' on ya.",
      "Seen some shady characters near the saloon last night."
    ],
    crime: [
      "Sheriff! There's trouble! You gotta help!",
      "Quick, Sheriff! Someone's causin' a ruckus!",
      "Thank goodness you're here! We need you!"
    ]
  },
  bartender: {
    idle: [
      "What'll it be, Sheriff? First one's on the house.",
      "Word travels fast in these parts. Keep your ears open.",
      "A cowboy walked in yesterday askin' about the bank vault...",
      "You look like you could use a drink, lawman."
    ],
    tip: [
      "Between you and me, I heard {name} is plannin' somethin' at {place}.",
      "Watch the {place} tonight, Sheriff. Somethin's brewin'.",
      "There's a stranger in town been askin' a lot of questions about the {place}."
    ]
  },
  outlaw: {
    hostile: [
      "This town ain't big enough for the both of us!",
      "You're gonna regret wearin' that badge, lawman.",
      "Draw, Sheriff! Let's settle this like men!",
      "I've killed better men than you for less."
    ],
    surrender: [
      "Alright, alright! I give up! Don't shoot!",
      "You got me, Sheriff. I'll come quietly.",
      "I ain't lookin' for trouble no more."
    ]
  },
  mayor: {
    idle: [
      "Sheriff, this town needs order. Don't let me down.",
      "The governor is watchin'. Keep the peace, and there'll be a bonus.",
      "Folks are talkin' about your work. Keep it up.",
      "I need this town runnin' smooth for the railroad investors."
    ],
    quest: [
      "Sheriff, I got a job for you. Interested?",
      "There's a matter that needs your... personal attention."
    ]
  },
  shopkeeper: {
    idle: [
      "Welcome, Sheriff! Got some new stock today.",
      "Business has been slow since those outlaws showed up.",
      "Need supplies? I got the best prices this side of the Pecos."
    ]
  },
  deputy: {
    idle: [
      "Ready for duty, Sheriff!",
      "All quiet on my end. You need anything?",
      "I've been keepin' an eye on the prisoners. They're behavin'.",
      "Heard gunshots earlier. Everything alright?"
    ]
  },
  banker: {
    idle: [
      "Good day, Sheriff. The vault is secure.",
      "Your salary's been deposited. $50 for the week.",
      "We've had some suspicious characters casing the bank..."
    ]
  },
  preacher: {
    idle: [
      "Bless you, Sheriff. The Lord's work takes many forms.",
      "Even a lawman needs salvation, friend.",
      "I pray for peace in this town every night."
    ]
  },
  stranger: {
    idle: [
      "...",
      "You don't want to know my business, lawman.",
      "I'm just passin' through. Don't mind me.",
      "Nice badge. Be a shame if somethin' happened to it."
    ]
  }
};

function generateNPCs(buildings) {
  const npcs = [];
  let id = 0;

  // Fixed NPCs
  const saloon = buildings.find(b => b.type === BUILDING_TYPES.SALOON);
  if (saloon) {
    npcs.push(createNPC(id++, NPC_TYPES.BARTENDER, 'Big Jim', saloon.x + 5, saloon.y + 2, saloon));
  }

  const bank = buildings.find(b => b.type === BUILDING_TYPES.BANK);
  if (bank) {
    npcs.push(createNPC(id++, NPC_TYPES.BANKER, 'Mr. Whitmore', bank.x + 4, bank.y + 2, bank));
  }

  const church = buildings.find(b => b.type === BUILDING_TYPES.CHURCH);
  if (church) {
    npcs.push(createNPC(id++, NPC_TYPES.PREACHER, "Father O'Brien", church.x + 4, church.y + 3, church));
  }

  const general = buildings.find(b => b.type === BUILDING_TYPES.GENERAL);
  if (general) {
    npcs.push(createNPC(id++, NPC_TYPES.SHOPKEEPER, 'Mr. Chen', general.x + 4, general.y + 2, general));
  }

  const sheriff = buildings.find(b => b.type === BUILDING_TYPES.SHERIFF);
  if (sheriff) {
    npcs.push(createNPC(id++, NPC_TYPES.DEPUTY, 'Deputy Barnes', sheriff.x + 4, sheriff.y + 3, sheriff));
  }

  // Mayor wanders
  npcs.push(createNPC(id++, NPC_TYPES.MAYOR, 'Mayor Hargrove', 40, 26, null));

  // Townspeople
  for (let i = 0; i < 12; i++) {
    const name = NPC_NAMES.townsperson[i % NPC_NAMES.townsperson.length];
    const x = rand(5, MAP_W - 5), y = rand(5, MAP_H - 5);
    npcs.push(createNPC(id++, NPC_TYPES.TOWNSPERSON, name, x, y, null));
  }

  // Stranger
  npcs.push(createNPC(id++, NPC_TYPES.STRANGER, 'The Stranger', 60, 30, null));

  return npcs;
}

function createNPC(id, type, name, tileX, tileY, building) {
  return {
    id, type, name,
    x: tileX * TILE + TILE / 2,
    y: tileY * TILE + TILE / 2,
    homeX: tileX * TILE + TILE / 2,
    homeY: tileY * TILE + TILE / 2,
    building,
    dir: rand(0, 3), // 0=down 1=up 2=left 3=right
    state: 'idle', // idle, walking, fleeing, hostile, arrested, dead
    moveTimer: rand(60, 180),
    animFrame: 0,
    animTimer: 0,
    hp: type === NPC_TYPES.OUTLAW || type === NPC_TYPES.BOUNTY ? 3 : 1,
    hostile: false,
    wantsToFight: false,
    surrendered: false,
    speed: type === NPC_TYPES.OUTLAW ? 1.8 : 1.2,
    dialogCooldown: 0,
    questGiver: type === NPC_TYPES.MAYOR || type === NPC_TYPES.BARTENDER,
    colors: getNPCColors(type)
  };
}

function getNPCColors(type) {
  switch (type) {
    case NPC_TYPES.OUTLAW:
    case NPC_TYPES.BOUNTY:
      return { hat: '#1a1a1a', body: '#2a2a2a', skin: '#c49464', pants: '#3a2a1a' };
    case NPC_TYPES.BARTENDER:
      return { hat: null, body: '#f0e0c0', skin: '#d4a574', pants: '#4a3a2a' };
    case NPC_TYPES.MAYOR:
      return { hat: '#2a2a4a', body: '#3a3a5a', skin: '#d4a574', pants: '#2a2a3a' };
    case NPC_TYPES.DEPUTY:
      return { hat: '#5a4a2a', body: '#6a5a3a', skin: '#c49464', pants: '#4a3a2a' };
    case NPC_TYPES.PREACHER:
      return { hat: '#1a1a1a', body: '#1a1a1a', skin: '#d4a574', pants: '#1a1a1a' };
    case NPC_TYPES.SHOPKEEPER:
      return { hat: null, body: '#8a7050', skin: '#c49a64', pants: '#5a4a3a' };
    case NPC_TYPES.STRANGER:
      return { hat: '#2a1a0a', body: '#4a3a2a', skin: '#b08050', pants: '#2a1a0a' };
    case NPC_TYPES.BANKER:
      return { hat: '#2a2a2a', body: '#4a4a5a', skin: '#d4a574', pants: '#2a2a3a' };
    default:
      const hue = rand(0, 5);
      const bodies = ['#8b1a1a', '#1a5a1a', '#4a3a8a', '#8a6a2a', '#2a4a6a', '#6a2a4a'];
      return { hat: '#5a4a2a', body: bodies[hue], skin: '#d4a574', pants: '#5a4030' };
  }
}

// ---- CRIME SYSTEM ----
const CRIME_TYPES = [
  {
    name: 'Bank Robbery', building: BUILDING_TYPES.BANK, severity: 3,
    desc: 'Outlaws are robbing the bank!', repGain: 15, repLoss: -10, gold: 100,
    outlawCount: 2
  },
  {
    name: 'Bar Fight', building: BUILDING_TYPES.SALOON, severity: 1,
    desc: 'A fight has broken out in the saloon!', repGain: 5, repLoss: -3, gold: 20,
    outlawCount: 1
  },
  {
    name: 'Horse Theft', building: BUILDING_TYPES.STABLE, severity: 2,
    desc: 'Someone is stealing horses from the stables!', repGain: 10, repLoss: -7, gold: 50,
    outlawCount: 1
  },
  {
    name: 'Shootout', building: null, severity: 3,
    desc: 'Gunfight in the streets!', repGain: 12, repLoss: -8, gold: 75,
    outlawCount: 2
  },
  {
    name: 'Store Holdup', building: BUILDING_TYPES.GENERAL, severity: 2,
    desc: 'The general store is being held up!', repGain: 8, repLoss: -5, gold: 40,
    outlawCount: 1
  },
  {
    name: 'Jail Break', building: BUILDING_TYPES.JAIL, severity: 3,
    desc: 'Prisoners are trying to escape!', repGain: 15, repLoss: -12, gold: 80,
    outlawCount: 3
  },
  {
    name: 'Kidnapping', building: BUILDING_TYPES.HOUSE, severity: 3,
    desc: 'A citizen has been taken hostage!', repGain: 18, repLoss: -15, gold: 120,
    outlawCount: 2
  },
  {
    name: 'Arson', building: BUILDING_TYPES.HOTEL, severity: 2,
    desc: "Someone's trying to burn down the hotel!", repGain: 10, repLoss: -8, gold: 60,
    outlawCount: 1
  }
];

function generateCrime(buildings, gameState) {
  const type = CRIME_TYPES[rand(0, CRIME_TYPES.length - 1)];
  let targetBuilding = null;
  if (type.building !== null) {
    targetBuilding = buildings.find(b => b.type === type.building);
  }
  if (!targetBuilding) {
    targetBuilding = buildings[rand(0, buildings.length - 1)];
  }

  return {
    ...type,
    targetBuilding,
    x: targetBuilding.doorX * TILE,
    y: targetBuilding.doorY * TILE,
    active: true,
    timer: 30 + type.severity * 15, // seconds to respond
    responded: false,
    resolved: false,
    outlaws: []
  };
}

// ---- QUEST SYSTEM ----
const QUEST_TEMPLATES = [
  {
    name: 'Patrol the Town',
    desc: 'Walk past all major buildings to check for trouble.',
    type: 'patrol',
    repReward: 8, goldReward: 30,
    targets: [BUILDING_TYPES.BANK, BUILDING_TYPES.SALOON, BUILDING_TYPES.GENERAL, BUILDING_TYPES.STABLE]
  },
  {
    name: 'Collect Taxes',
    desc: 'Visit the shopkeepers and collect this week\'s taxes.',
    type: 'visit',
    repReward: 5, goldReward: 50,
    targets: [BUILDING_TYPES.SALOON, BUILDING_TYPES.GENERAL, BUILDING_TYPES.HOTEL]
  },
  {
    name: 'Bounty Hunt',
    desc: 'A dangerous outlaw has been spotted near town. Hunt them down!',
    type: 'bounty',
    repReward: 20, goldReward: 150,
    targets: []
  },
  {
    name: 'Escort Duty',
    desc: 'Escort the mayor safely across town.',
    type: 'escort',
    repReward: 10, goldReward: 60,
    targets: []
  },
  {
    name: 'Night Watch',
    desc: 'Patrol the streets during the night hours.',
    type: 'nightwatch',
    repReward: 12, goldReward: 40,
    targets: []
  }
];

// ---- PARTICLE SYSTEM ----
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, color, speed = 2, life = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: randF(-speed, speed),
        vy: randF(-speed, speed),
        life,
        maxLife: life,
        color,
        size: randF(1, 3)
      });
    }
  }

  emitDust(x, y) {
    this.emit(x, y, 5, '#c4a55a88', 1, 20);
  }

  emitBlood(x, y) {
    this.emit(x, y, 8, '#8b0000', 3, 25);
  }

  emitSpark(x, y) {
    this.emit(x, y, 6, '#ffd700', 4, 15);
  }

  emitSmoke(x, y) {
    this.emit(x, y, 10, '#88888888', 0.5, 60);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.98;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx, camX, camY) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - camX - p.size / 2, p.y - camY - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}

// ---- BULLET SYSTEM ----
class BulletSystem {
  constructor() {
    this.bullets = [];
  }

  fire(x, y, dir, fromPlayer = true) {
    const speed = 6;
    const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    const [dx, dy] = dirs[dir] || [0, 1];
    this.bullets.push({
      x, y, vx: dx * speed, vy: dy * speed,
      life: 40, fromPlayer
    });
    audio.playGunshot();
  }

  update(npcs, player, particles, gameState) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Check NPC hits (from player)
      if (b.fromPlayer) {
        for (const npc of npcs) {
          if (npc.state === 'dead' || npc.state === 'arrested') continue;
          if (dist(b, npc) < 16) {
            npc.hp--;
            particles.emitBlood(npc.x, npc.y);
            if (npc.hp <= 0) {
              npc.state = 'dead';
              if (npc.hostile || npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) {
                gameState.reputation = clamp(gameState.reputation + 5, 0, 100);
                gameState.gold += 25;
                gameState.outlawsKilled++;
                showNotification('Outlaw eliminated! +5 Rep, +$25');
              } else {
                gameState.reputation = clamp(gameState.reputation - 20, 0, 100);
                showNotification('You killed an innocent! -20 Rep');
                audio.playBad();
              }
            }
            b.life = 0;
            break;
          }
        }
      } else {
        // Check player hits (from NPC)
        if (dist(b, player) < 14) {
          player.hp--;
          particles.emitBlood(player.x, player.y);
          b.life = 0;
          if (player.hp <= 0) {
            gameState.state = 'gameover';
            gameState.gameOverReason = 'You were killed in the line of duty.';
          }
        }
      }

      // Check map collision
      const tx = Math.floor(b.x / TILE), ty = Math.floor(b.y / TILE);
      if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) { b.life = 0; continue; }
      const tile = gameState.map[ty]?.[tx];
      if (tile === 3) {
        particles.emitSpark(b.x, b.y);
        b.life = 0;
      }

      if (b.life <= 0) this.bullets.splice(i, 1);
    }
  }

  draw(ctx, camX, camY) {
    ctx.fillStyle = '#ffd700';
    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.x - camX, b.y - camY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---- FLOATING TEXT ----
const floatingTexts = [];
function addFloatingText(x, y, text, color = '#ffd700') {
  floatingTexts.push({ x, y, text, color, life: 60 });
}

// ---- NOTIFICATION ----
let notifTimer = 0;
function showNotification(text) {
  const el = document.getElementById('notification');
  el.textContent = text;
  el.classList.remove('hidden');
  notifTimer = 180;
}

// ---- MAIN GAME STATE ----
const game = {
  state: 'title', // title, playing, paused, dialog, duel, journal, gameover
  map: null,
  buildings: [],
  npcs: [],
  player: null,
  camera: { x: 0, y: 0 },
  time: 0.25, // 0-1, starts at 6AM
  dayCount: 1,
  timeSpeed: 1 / (DAY_LENGTH * 60),
  reputation: 50,
  gold: 0,
  rank: 'Deputy',
  crimes: [],
  activeCrime: null,
  quests: [],
  activeQuest: null,
  completedQuests: [],
  outlawsKilled: 0,
  outlawsArrested: 0,
  crimesResolved: 0,
  crimesIgnored: 0,
  daysServed: 0,
  crimeSpawnTimer: 0,
  salaryTimer: 0,
  gameOverReason: '',
  journalEntries: [],
  visitedBuildings: new Set(),
  questProgress: {},
  dialogState: null,
  duelState: null,
  showMinimap: true,
  stepTimer: 0
};

// ---- PLAYER ----
function createPlayer(x, y) {
  return {
    x: x * TILE + TILE / 2,
    y: y * TILE + TILE / 2,
    dir: 0,
    moving: false,
    animFrame: 0,
    animTimer: 0,
    hp: 5,
    maxHp: 5,
    shootCooldown: 0,
    interactCooldown: 0
  };
}

// ---- CANVAS SETUP ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mmCanvas = document.getElementById('minimapCanvas');
const mmCtx = mmCanvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---- DRAWING HELPERS ----
function drawTile(x, y, camX, camY, tileType, timeOfDay) {
  const sx = x * TILE - camX, sy = y * TILE - camY;
  if (sx < -TILE || sx > canvas.width || sy < -TILE || sy > canvas.height) return;

  switch (tileType) {
    case 0: // Sand
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Sand detail
      if ((x + y) % 7 === 0) {
        ctx.fillStyle = PALETTE.sandDark;
        ctx.fillRect(sx + 4, sy + 4, 2, 1);
      }
      if ((x * 3 + y * 7) % 11 === 0) {
        ctx.fillStyle = PALETTE.sandLight;
        ctx.fillRect(sx + 12, sy + 8, 3, 1);
      }
      break;
    case 1: // Road
      ctx.fillStyle = '#a08850';
      ctx.fillRect(sx, sy, TILE, TILE);
      // Road detail - wagon ruts
      ctx.fillStyle = '#907840';
      if (x % 3 === 0) ctx.fillRect(sx + 8, sy, 2, TILE);
      if (x % 3 === 1) ctx.fillRect(sx + 20, sy, 2, TILE);
      break;
    case 3: // Wall
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(sx, sy, TILE, 2);
      ctx.fillRect(sx, sy, 2, TILE);
      // Plank lines
      ctx.fillStyle = PALETTE.woodLight;
      for (let py = 4; py < TILE; py += 8) {
        ctx.fillRect(sx + 2, sy + py, TILE - 4, 1);
      }
      break;
    case 4: // Door
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(sx + 4, sy + 2, TILE - 8, TILE - 4);
      // Door handle
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(sx + TILE - 10, sy + TILE / 2, 3, 3);
      break;
    case 5: // Water
      ctx.fillStyle = PALETTE.water;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Shimmer
      const shimmer = Math.sin(Date.now() / 500 + x + y) * 0.15;
      ctx.fillStyle = `rgba(150,200,255,${0.2 + shimmer})`;
      ctx.fillRect(sx + 4, sy + 8 + Math.sin(Date.now() / 300 + x) * 2, 8, 2);
      break;
    case 6: // Cactus
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PALETTE.cactus;
      ctx.fillRect(sx + 12, sy + 4, 8, 24);
      ctx.fillRect(sx + 4, sy + 8, 8, 6);
      ctx.fillRect(sx + 20, sy + 12, 8, 6);
      ctx.fillStyle = PALETTE.cactusD;
      ctx.fillRect(sx + 14, sy + 4, 2, 24);
      break;
    case 7: // Rock
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PALETTE.stone;
      ctx.fillRect(sx + 6, sy + 10, 20, 16);
      ctx.fillStyle = PALETTE.stoneLight;
      ctx.fillRect(sx + 8, sy + 10, 16, 4);
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(sx + 6, sy + 22, 20, 4);
      break;
    case 8: // Wood floor
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#6a4a20';
      for (let py = 0; py < TILE; py += 8) {
        ctx.fillRect(sx, sy + py, TILE, 1);
      }
      break;
  }
}

function drawBuildingRoof(b, camX, camY) {
  const sx = b.x * TILE - camX;
  const sy = b.y * TILE - camY - 8;

  // Roof
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(sx - 4, sy, b.w * TILE + 8, 12);
  ctx.fillStyle = PALETTE.roofDark;
  ctx.fillRect(sx - 4, sy, b.w * TILE + 8, 3);

  // Sign
  ctx.fillStyle = '#2a1a08';
  ctx.fillRect(sx + 8, sy + 14, b.w * TILE - 16, 14);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(b.name, sx + b.w * TILE / 2, sy + 24);
}

function drawPlayer(player, camX, camY) {
  const sx = player.x - camX;
  const sy = player.y - camY;
  const bob = player.moving ? Math.sin(player.animTimer * 0.3) * 2 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(sx - 7, sy + 12, 14, 4);

  // Boots
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx - 5, sy + 8 + bob, 4, 6);
  ctx.fillRect(sx + 1, sy + 8 + bob, 4, 6);

  // Pants
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(sx - 6, sy + 2 + bob, 12, 8);

  // Body (vest)
  ctx.fillStyle = '#6a4a2a';
  ctx.fillRect(sx - 7, sy - 6 + bob, 14, 10);

  // Shirt
  ctx.fillStyle = '#c8b898';
  ctx.fillRect(sx - 5, sy - 4 + bob, 10, 6);

  // Badge
  ctx.fillStyle = PALETTE.badge;
  ctx.fillRect(sx + 2, sy - 3 + bob, 3, 3);

  // Head
  ctx.fillStyle = PALETTE.skin;
  ctx.fillRect(sx - 4, sy - 12 + bob, 8, 8);

  // Hat
  ctx.fillStyle = '#5a4020';
  ctx.fillRect(sx - 8, sy - 16 + bob, 16, 4);
  ctx.fillRect(sx - 5, sy - 20 + bob, 10, 5);

  // Eyes based on direction
  ctx.fillStyle = '#1a1008';
  if (player.dir === 0) { // down
    ctx.fillRect(sx - 2, sy - 10 + bob, 2, 2);
    ctx.fillRect(sx + 1, sy - 10 + bob, 2, 2);
  } else if (player.dir === 1) { // up
    // back of head, no eyes
  } else if (player.dir === 2) { // left
    ctx.fillRect(sx - 3, sy - 10 + bob, 2, 2);
  } else { // right
    ctx.fillRect(sx + 2, sy - 10 + bob, 2, 2);
  }

  // Gun
  ctx.fillStyle = '#3a3a3a';
  if (player.dir === 0) ctx.fillRect(sx + 6, sy + bob, 3, 6);
  else if (player.dir === 1) ctx.fillRect(sx - 8, sy + bob, 3, 6);
  else if (player.dir === 2) ctx.fillRect(sx - 12, sy - 2 + bob, 6, 3);
  else ctx.fillRect(sx + 7, sy - 2 + bob, 6, 3);

  // HP bar
  if (player.hp < player.maxHp) {
    ctx.fillStyle = '#300000';
    ctx.fillRect(sx - 10, sy - 24, 20, 3);
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(sx - 10, sy - 24, 20 * (player.hp / player.maxHp), 3);
  }
}

function drawNPC(npc, camX, camY) {
  if (npc.state === 'dead') {
    // Dead body on ground
    const sx = npc.x - camX, sy = npc.y - camY;
    ctx.fillStyle = npc.colors.body;
    ctx.fillRect(sx - 10, sy + 4, 20, 6);
    ctx.fillStyle = npc.colors.skin;
    ctx.fillRect(sx + 10, sy + 2, 6, 6);
    ctx.fillStyle = '#600000';
    ctx.fillRect(sx - 2, sy + 6, 8, 3);
    return;
  }

  if (npc.state === 'arrested') {
    // Sitting in place
    const sx = npc.x - camX, sy = npc.y - camY;
    ctx.fillStyle = npc.colors.body;
    ctx.fillRect(sx - 6, sy, 12, 10);
    ctx.fillStyle = npc.colors.skin;
    ctx.fillRect(sx - 4, sy - 8, 8, 8);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(sx - 6, sy + 2, 2, 4);
    ctx.fillRect(sx + 5, sy + 2, 2, 4);
    return;
  }

  const sx = npc.x - camX;
  const sy = npc.y - camY;
  const bob = npc.state === 'walking' ? Math.sin(npc.animTimer * 0.3) * 1.5 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(sx - 6, sy + 10, 12, 3);

  // Boots
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx - 4, sy + 6 + bob, 3, 5);
  ctx.fillRect(sx + 1, sy + 6 + bob, 3, 5);

  // Pants
  ctx.fillStyle = npc.colors.pants;
  ctx.fillRect(sx - 5, sy + 1 + bob, 10, 7);

  // Body
  ctx.fillStyle = npc.colors.body;
  ctx.fillRect(sx - 6, sy - 6 + bob, 12, 9);

  // Head
  ctx.fillStyle = npc.colors.skin;
  ctx.fillRect(sx - 4, sy - 12 + bob, 8, 7);

  // Hat
  if (npc.colors.hat) {
    ctx.fillStyle = npc.colors.hat;
    ctx.fillRect(sx - 7, sy - 15 + bob, 14, 3);
    ctx.fillRect(sx - 4, sy - 18 + bob, 8, 4);
  }

  // Hostile indicator
  if (npc.hostile) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(sx - 1, sy - 22, 3, 3);
  }

  // Interaction indicator
  if (!npc.hostile && npc.dialogCooldown <= 0) {
    const playerDist = game.player ? dist(npc, game.player) : 999;
    if (playerDist < 50) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E]', sx, sy - 24);
    }
  }

  // Name above head
  if (game.player && dist(npc, game.player) < 80) {
    ctx.fillStyle = npc.hostile ? '#ff4444' : '#e8d5a3';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, sx, sy - 28);
  }
}

function drawDayNightOverlay(timeOfDay) {
  // timeOfDay 0-1: 0=midnight, 0.25=6AM, 0.5=noon, 0.75=6PM
  let alpha = 0;
  let color = '0,0,30';

  if (timeOfDay < 0.2) { // Night (midnight to ~5AM)
    alpha = 0.5;
  } else if (timeOfDay < 0.3) { // Dawn
    alpha = lerp(0.5, 0, (timeOfDay - 0.2) / 0.1);
    color = '60,20,0';
  } else if (timeOfDay < 0.7) { // Day
    alpha = 0;
  } else if (timeOfDay < 0.8) { // Dusk
    alpha = lerp(0, 0.3, (timeOfDay - 0.7) / 0.1);
    color = '80,30,0';
  } else { // Night
    alpha = lerp(0.3, 0.5, (timeOfDay - 0.8) / 0.2);
    color = '0,0,30';
  }

  if (alpha > 0) {
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function getTimeString(t) {
  const totalMinutes = t * 24 * 60;
  let hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// ---- MINIMAP ----
function drawMinimap() {
  if (!game.showMinimap) {
    document.getElementById('minimap-container').classList.add('hidden');
    return;
  }
  document.getElementById('minimap-container').classList.remove('hidden');

  mmCtx.fillStyle = '#1a1008';
  mmCtx.fillRect(0, 0, 150, 150);

  const scale = 150 / (MAP_W * TILE);
  // Draw buildings
  for (const b of game.buildings) {
    mmCtx.fillStyle = '#5a3a18';
    mmCtx.fillRect(b.x * TILE * scale, b.y * TILE * scale, b.w * TILE * scale, b.h * TILE * scale);
  }
  // Roads
  mmCtx.fillStyle = '#706040';
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (game.map[y][x] === 1) {
        mmCtx.fillRect(x * TILE * scale, y * TILE * scale, TILE * scale + 1, TILE * scale + 1);
      }
    }
  }
  // NPCs
  for (const npc of game.npcs) {
    if (npc.state === 'dead') continue;
    mmCtx.fillStyle = npc.hostile ? '#ff0000' : (npc.type === NPC_TYPES.OUTLAW ? '#ff8800' : '#44aa44');
    mmCtx.fillRect(npc.x * scale - 1, npc.y * scale - 1, 3, 3);
  }
  // Crime
  if (game.activeCrime) {
    mmCtx.fillStyle = Date.now() % 500 < 250 ? '#ff0000' : '#ff880088';
    mmCtx.fillRect(game.activeCrime.x * scale - 3, game.activeCrime.y * scale - 3, 6, 6);
  }
  // Player
  mmCtx.fillStyle = '#ffd700';
  mmCtx.fillRect(game.player.x * scale - 2, game.player.y * scale - 2, 4, 4);
}

// ---- DIALOG SYSTEM ----
function openDialog(npc) {
  if (npc.dialogCooldown > 0) return;
  npc.dialogCooldown = 120;

  const dialogEl = document.getElementById('dialog-box');
  const nameEl = document.getElementById('dialog-name');
  const textEl = document.getElementById('dialog-text');
  const choicesEl = document.getElementById('dialog-choices');
  const portraitEl = document.getElementById('dialog-portrait');

  // Draw portrait
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64; pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  pCtx.fillStyle = '#140c04';
  pCtx.fillRect(0, 0, 64, 64);
  pCtx.fillStyle = npc.colors.skin;
  pCtx.fillRect(20, 20, 24, 24);
  pCtx.fillStyle = npc.colors.body;
  pCtx.fillRect(16, 44, 32, 20);
  if (npc.colors.hat) {
    pCtx.fillStyle = npc.colors.hat;
    pCtx.fillRect(14, 12, 36, 10);
    pCtx.fillRect(18, 4, 28, 12);
  }
  pCtx.fillStyle = '#1a1008';
  pCtx.fillRect(24, 28, 4, 4);
  pCtx.fillRect(36, 28, 4, 4);
  portraitEl.style.background = `url(${pCanvas.toDataURL()}) center/cover`;

  nameEl.textContent = npc.name;
  choicesEl.innerHTML = '';

  const dialogs = DIALOGS[npc.type] || DIALOGS.townsperson;
  let text = '';
  let choices = [];

  if (npc.hostile) {
    text = dialogs.hostile ? dialogs.hostile[rand(0, dialogs.hostile.length - 1)] : "I'll get you, lawman!";
    choices = [
      { text: '1. Draw your weapon! [Duel]', action: 'duel' },
      { text: '2. "Stand down, partner."', action: 'intimidate' },
      { text: '3. Walk away', action: 'leave' }
    ];
  } else if (npc.questGiver && !game.activeQuest && Math.random() > 0.4) {
    text = dialogs.quest ? dialogs.quest[rand(0, dialogs.quest.length - 1)] : dialogs.idle[rand(0, dialogs.idle.length - 1)];
    choices = [
      { text: "1. What's the job?", action: 'accept_quest' },
      { text: "2. Not right now.", action: 'leave' }
    ];
  } else if (npc.type === NPC_TYPES.BARTENDER && Math.random() > 0.5) {
    const tipTemplates = dialogs.tip;
    const randomNPC = game.npcs[rand(0, game.npcs.length - 1)];
    const randomBuilding = game.buildings[rand(0, game.buildings.length - 1)];
    text = tipTemplates[rand(0, tipTemplates.length - 1)]
      .replace('{name}', randomNPC.name)
      .replace('{place}', randomBuilding.name);
    choices = [
      { text: "1. Thanks for the tip.", action: 'leave' },
      { text: "2. Buy a drink ($5)", action: 'buy_drink' }
    ];
  } else if (npc.type === NPC_TYPES.SHOPKEEPER) {
    text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    choices = [
      { text: '1. Buy Health Tonic ($25)', action: 'buy_health' },
      { text: '2. Buy Ammo ($10)', action: 'buy_ammo' },
      { text: '3. Just browsing.', action: 'leave' }
    ];
  } else if (npc.type === NPC_TYPES.OUTLAW && !npc.hostile) {
    const surrenderDialogs = dialogs.surrender;
    text = surrenderDialogs[rand(0, surrenderDialogs.length - 1)];
    choices = [
      { text: '1. "You\'re under arrest."', action: 'arrest' },
      { text: '2. "Get out of my town."', action: 'banish' },
      { text: '3. Accept bribe ($50)', action: 'bribe' }
    ];
  } else {
    text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    choices = [
      { text: '1. "Stay safe out there."', action: 'leave' },
      { text: '2. "Seen any trouble?"', action: 'ask_trouble' }
    ];
  }

  textEl.textContent = text;

  for (const choice of choices) {
    const btn = document.createElement('button');
    btn.className = 'dialog-choice';
    btn.textContent = choice.text;
    btn.onclick = () => handleDialogChoice(choice.action, npc);
    choicesEl.appendChild(btn);
  }

  dialogEl.classList.remove('hidden');
  game.state = 'dialog';
  game.dialogState = { npc };
}

function handleDialogChoice(action, npc) {
  const dialogEl = document.getElementById('dialog-box');

  switch (action) {
    case 'leave':
      closeDialog();
      break;

    case 'duel':
      closeDialog();
      startDuel(npc);
      break;

    case 'intimidate':
      if (game.reputation >= 60 && Math.random() > 0.3) {
        npc.hostile = false;
        npc.surrendered = true;
        showNotification(npc.name + ' backs down! +3 Rep');
        game.reputation = clamp(game.reputation + 3, 0, 100);
        audio.playDing();
      } else {
        showNotification("They ain't scared of you!");
        closeDialog();
        startDuel(npc);
        return;
      }
      closeDialog();
      break;

    case 'arrest':
      npc.state = 'arrested';
      npc.hostile = false;
      game.reputation = clamp(game.reputation + 8, 0, 100);
      game.gold += 30;
      game.outlawsArrested++;
      showNotification(npc.name + ' arrested! +8 Rep, +$30');
      audio.playDing();
      addJournalEntry(`Arrested ${npc.name}.`);
      closeDialog();
      break;

    case 'banish':
      npc.state = 'dead'; // remove from town
      game.reputation = clamp(game.reputation + 2, 0, 100);
      showNotification(npc.name + ' ran out of town. +2 Rep');
      closeDialog();
      break;

    case 'bribe':
      npc.state = 'dead';
      game.gold += 50;
      game.reputation = clamp(game.reputation - 10, 0, 100);
      showNotification('Took the bribe. +$50, -10 Rep');
      audio.playBad();
      addJournalEntry('Accepted bribe from ' + npc.name + '.');
      closeDialog();
      break;

    case 'accept_quest':
      const quest = QUEST_TEMPLATES[rand(0, QUEST_TEMPLATES.length - 1)];
      game.activeQuest = { ...quest, visited: new Set(), startTime: game.time, startDay: game.dayCount };
      game.questProgress = {};
      showNotification('New Mission: ' + quest.name);
      addJournalEntry('Accepted mission: ' + quest.name);
      document.getElementById('quest-tracker').classList.remove('hidden');
      document.getElementById('quest-text').textContent = quest.desc;
      closeDialog();
      break;

    case 'buy_drink':
      if (game.gold >= 5) {
        game.gold -= 5;
        showNotification('Enjoyed a whiskey. -$5');
        // Small rep boost for being social
        game.reputation = clamp(game.reputation + 1, 0, 100);
      } else {
        showNotification("You can't afford that.");
      }
      closeDialog();
      break;

    case 'buy_health':
      if (game.gold >= 25) {
        game.gold -= 25;
        game.player.hp = Math.min(game.player.hp + 2, game.player.maxHp);
        showNotification('Health restored! -$25');
        audio.playDing();
      } else {
        showNotification("You can't afford that.");
      }
      closeDialog();
      break;

    case 'buy_ammo':
      if (game.gold >= 10) {
        game.gold -= 10;
        showNotification('Stocked up on ammo. -$10');
      } else {
        showNotification("You can't afford that.");
      }
      closeDialog();
      break;

    case 'ask_trouble':
      if (game.activeCrime) {
        showNotification('Heard about trouble near the ' + game.activeCrime.targetBuilding.name + '!');
      } else {
        showNotification("All quiet for now, Sheriff.");
      }
      closeDialog();
      break;
  }
}

function closeDialog() {
  document.getElementById('dialog-box').classList.add('hidden');
  game.state = 'playing';
  game.dialogState = null;
}

// ---- DUEL SYSTEM ----
function startDuel(npc) {
  game.state = 'duel';
  game.duelState = {
    npc,
    phase: 'staredown', // staredown, draw, result
    timer: 0,
    drawTime: rand(120, 240), // frames until "DRAW!" appears
    playerDrew: false,
    npcDrew: false,
    result: null,
    reactionWindow: 45 // frames to react
  };

  document.getElementById('duel-ui').classList.remove('hidden');
  document.getElementById('duel-prompt').textContent = 'STARE DOWN...';
  document.getElementById('duel-timer').textContent = 'Wait for it...';

  audio.playWesternRiff();
}

function updateDuel() {
  const d = game.duelState;
  if (!d) return;

  d.timer++;

  if (d.phase === 'staredown') {
    // Check if player shoots early (dishonorable)
    if (consumeKey('Space')) {
      d.phase = 'result';
      d.result = 'dishonorable';
      document.getElementById('duel-prompt').textContent = 'DISHONORABLE!';
      document.getElementById('duel-timer').textContent = 'You shot before the draw!';
      game.reputation = clamp(game.reputation - 15, 0, 100);
      d.npc.state = 'dead';
      game.outlawsKilled++;
      audio.playGunshot();
      audio.playBad();
      showNotification('Dishonorable kill! -15 Rep');
      setTimeout(() => endDuel(), 2000);
      return;
    }

    if (d.timer >= d.drawTime) {
      d.phase = 'draw';
      d.timer = 0;
      document.getElementById('duel-prompt').textContent = 'DRAW!';
      document.getElementById('duel-timer').textContent = 'Press SPACE!';
      audio.playDuelDraw();
    }
  } else if (d.phase === 'draw') {
    if (consumeKey('Space') && !d.playerDrew) {
      d.playerDrew = true;
      d.phase = 'result';
      // Speed determines outcome
      if (d.timer < d.reactionWindow) {
        d.result = 'win';
        document.getElementById('duel-prompt').textContent = 'YOU WIN!';
        const speed = d.reactionWindow - d.timer;
        document.getElementById('duel-timer').textContent = `Quick draw! ${Math.round(d.timer * 16.67)}ms`;
        d.npc.state = 'dead';
        d.npc.hostile = false;
        game.reputation = clamp(game.reputation + 10, 0, 100);
        game.gold += 50;
        game.outlawsKilled++;
        audio.playGunshot();
        setTimeout(() => audio.playVictory(), 300);
        showNotification('Duel won! +10 Rep, +$50');
        addJournalEntry(`Won duel against ${d.npc.name}.`);
      } else {
        d.result = 'lose';
        document.getElementById('duel-prompt').textContent = 'TOO SLOW!';
        document.getElementById('duel-timer').textContent = 'They got you...';
        game.player.hp -= 2;
        audio.playGunshot();
        if (game.player.hp <= 0) {
          game.gameOverReason = `Killed in a duel by ${d.npc.name}.`;
        }
      }
      setTimeout(() => endDuel(), 2000);
    }

    if (d.timer >= d.reactionWindow && !d.playerDrew) {
      d.phase = 'result';
      d.result = 'lose';
      document.getElementById('duel-prompt').textContent = 'TOO SLOW!';
      document.getElementById('duel-timer').textContent = 'They drew first!';
      game.player.hp -= 2;
      audio.playGunshot();
      if (game.player.hp <= 0) {
        game.gameOverReason = `Killed in a duel by ${d.npc.name}.`;
      }
      setTimeout(() => endDuel(), 2000);
    }
  }
}

function endDuel() {
  document.getElementById('duel-ui').classList.add('hidden');
  game.duelState = null;
  if (game.player.hp <= 0) {
    game.state = 'gameover';
  } else {
    game.state = 'playing';
  }
}

// ---- JOURNAL ----
function addJournalEntry(text) {
  game.journalEntries.push({ text, day: game.dayCount, time: getTimeString(game.time) });
}

function openJournal() {
  game.state = 'journal';
  const panel = document.getElementById('journal-panel');
  const content = document.getElementById('journal-content');
  panel.classList.remove('hidden');

  let html = '';

  // Stats
  html += '<div class="journal-section"><h4>STATS</h4>';
  html += `<div class="journal-entry">Rank: ${game.rank}</div>`;
  html += `<div class="journal-entry">Days Served: ${game.daysServed}</div>`;
  html += `<div class="journal-entry">Reputation: ${game.reputation}/100</div>`;
  html += `<div class="journal-entry">Gold: $${game.gold}</div>`;
  html += `<div class="journal-entry">Outlaws Killed: ${game.outlawsKilled}</div>`;
  html += `<div class="journal-entry">Outlaws Arrested: ${game.outlawsArrested}</div>`;
  html += `<div class="journal-entry">Crimes Resolved: ${game.crimesResolved}</div>`;
  html += '</div>';

  // Active quest
  if (game.activeQuest) {
    html += '<div class="journal-section"><h4>ACTIVE MISSION</h4>';
    html += `<div class="journal-entry">${game.activeQuest.name}: ${game.activeQuest.desc}</div>`;
    html += '</div>';
  }

  // Completed quests
  if (game.completedQuests.length > 0) {
    html += '<div class="journal-section"><h4>COMPLETED MISSIONS</h4>';
    for (const q of game.completedQuests.slice(-10)) {
      html += `<div class="journal-entry completed">${q.name}</div>`;
    }
    html += '</div>';
  }

  // Log
  if (game.journalEntries.length > 0) {
    html += '<div class="journal-section"><h4>LOG</h4>';
    for (const e of game.journalEntries.slice(-15).reverse()) {
      html += `<div class="journal-entry">Day ${e.day}, ${e.time}: ${e.text}</div>`;
    }
    html += '</div>';
  }

  content.innerHTML = html;
}

function closeJournal() {
  document.getElementById('journal-panel').classList.add('hidden');
  game.state = 'playing';
}

// ---- COLLISION ----
function isSolid(tileX, tileY) {
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) return true;
  const t = game.map[tileY][tileX];
  return t === 3 || t === 5 || t === 6 || t === 7;
}

function canMove(x, y, r) {
  const tiles = [
    [Math.floor((x - r) / TILE), Math.floor((y - r) / TILE)],
    [Math.floor((x + r) / TILE), Math.floor((y - r) / TILE)],
    [Math.floor((x - r) / TILE), Math.floor((y + r) / TILE)],
    [Math.floor((x + r) / TILE), Math.floor((y + r) / TILE)]
  ];
  return tiles.every(([tx, ty]) => !isSolid(tx, ty));
}

// ---- UPDATE SYSTEMS ----
const particles = new ParticleSystem();
const bullets = new BulletSystem();

function updatePlayer(dt) {
  const p = game.player;
  let dx = 0, dy = 0;

  if (keys['KeyW'] || keys['ArrowUp']) { dy = -1; p.dir = 1; }
  if (keys['KeyS'] || keys['ArrowDown']) { dy = 1; p.dir = 0; }
  if (keys['KeyA'] || keys['ArrowLeft']) { dx = -1; p.dir = 2; }
  if (keys['KeyD'] || keys['ArrowRight']) { dx = 1; p.dir = 3; }

  p.moving = dx !== 0 || dy !== 0;

  if (p.moving) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    const nx = p.x + dx * PLAYER_SPEED;
    const ny = p.y + dy * PLAYER_SPEED;

    if (canMove(nx, p.y, 6)) p.x = nx;
    if (canMove(p.x, ny, 6)) p.y = ny;

    p.animTimer++;
    game.stepTimer++;
    if (game.stepTimer >= 15) {
      game.stepTimer = 0;
      particles.emitDust(p.x, p.y + 10);
      audio.playStep();
    }
  }

  // Clamp to map
  p.x = clamp(p.x, 8, MAP_W * TILE - 8);
  p.y = clamp(p.y, 8, MAP_H * TILE - 8);

  // Shoot
  if (p.shootCooldown > 0) p.shootCooldown--;
  if (consumeKey('Space') && game.state === 'playing' && p.shootCooldown <= 0) {
    bullets.fire(p.x, p.y, p.dir, true);
    p.shootCooldown = 20;
  }

  // Interact
  if (p.interactCooldown > 0) p.interactCooldown--;
  if (consumeKey('KeyE') && p.interactCooldown <= 0) {
    p.interactCooldown = 15;
    // Find nearest NPC
    let nearest = null, nearDist = 50;
    for (const npc of game.npcs) {
      if (npc.state === 'dead' || npc.state === 'arrested') continue;
      const d = dist(p, npc);
      if (d < nearDist) { nearest = npc; nearDist = d; }
    }
    if (nearest) {
      openDialog(nearest);
    } else {
      // Check if near building door
      const tx = Math.floor(p.x / TILE), ty = Math.floor((p.y + 10) / TILE);
      if (game.map[ty]?.[tx] === 4) {
        const building = game.buildings.find(b => b.doorX === tx && b.doorY === ty);
        if (building) {
          game.visitedBuildings.add(building.type);
          showNotification('Entered ' + building.name);
          // Quest progress
          if (game.activeQuest && game.activeQuest.type === 'patrol') {
            game.activeQuest.visited.add(building.type);
          }
          if (game.activeQuest && game.activeQuest.type === 'visit') {
            game.activeQuest.visited.add(building.type);
          }
        }
      }
    }
  }
}

function updateNPCs(dt) {
  for (const npc of game.npcs) {
    if (npc.state === 'dead' || npc.state === 'arrested') continue;
    if (npc.dialogCooldown > 0) npc.dialogCooldown--;

    // Hostile NPC behavior
    if (npc.hostile && game.state === 'playing') {
      const d = dist(npc, game.player);
      if (d < 200) {
        // Move toward player
        const dx = game.player.x - npc.x;
        const dy = game.player.y - npc.y;
        const len = Math.hypot(dx, dy);
        if (len > 40) {
          const nx = npc.x + (dx / len) * npc.speed;
          const ny = npc.y + (dy / len) * npc.speed;
          if (canMove(nx, npc.y, 5)) npc.x = nx;
          if (canMove(npc.x, ny, 5)) npc.y = ny;
          npc.state = 'walking';
          npc.animTimer++;
        }
        // Shoot at player occasionally
        if (d < 150 && Math.random() < 0.015) {
          const dir = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 3 : 2)
            : (dy > 0 ? 0 : 1);
          bullets.fire(npc.x, npc.y, dir, false);
        }
      }
      continue;
    }

    // Idle NPC wandering
    npc.moveTimer--;
    if (npc.moveTimer <= 0) {
      if (npc.state === 'walking') {
        npc.state = 'idle';
        npc.moveTimer = rand(60, 180);
      } else {
        npc.state = 'walking';
        npc.dir = rand(0, 3);
        npc.moveTimer = rand(30, 90);
      }
    }

    if (npc.state === 'walking') {
      const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
      const [ddx, ddy] = dirs[npc.dir];
      const nx = npc.x + ddx * npc.speed;
      const ny = npc.y + ddy * npc.speed;

      if (canMove(nx, ny, 5) && nx > TILE && nx < (MAP_W - 1) * TILE && ny > TILE && ny < (MAP_H - 1) * TILE) {
        npc.x = nx;
        npc.y = ny;
      } else {
        npc.dir = rand(0, 3);
      }
      npc.animTimer++;

      // If building-bound, don't stray too far
      if (npc.building) {
        const homeDist = Math.hypot(npc.x - npc.homeX, npc.y - npc.homeY);
        if (homeDist > 80) {
          npc.dir = (npc.x > npc.homeX ? 2 : 3);
          if (Math.abs(npc.y - npc.homeY) > Math.abs(npc.x - npc.homeX)) {
            npc.dir = (npc.y > npc.homeY ? 1 : 0);
          }
        }
      }
    }

    // Flee from active crimes
    if (game.activeCrime && npc.type === NPC_TYPES.TOWNSPERSON) {
      const crimeDist = dist(npc, { x: game.activeCrime.x, y: game.activeCrime.y });
      if (crimeDist < 120) {
        const dx = npc.x - game.activeCrime.x;
        const dy = npc.y - game.activeCrime.y;
        const len = Math.hypot(dx, dy) || 1;
        npc.x += (dx / len) * 2;
        npc.y += (dy / len) * 2;
        npc.state = 'walking';
      }
    }
  }
}

function updateCrimes(dt) {
  game.crimeSpawnTimer -= dt;

  if (game.crimeSpawnTimer <= 0 && !game.activeCrime) {
    game.crimeSpawnTimer = rand(20, 45); // seconds between crimes

    const crime = generateCrime(game.buildings, game);
    game.activeCrime = crime;

    // Spawn outlaws for the crime
    for (let i = 0; i < crime.outlawCount; i++) {
      const name = NPC_NAMES.outlaw[rand(0, NPC_NAMES.outlaw.length - 1)];
      const npc = createNPC(
        game.npcs.length + i,
        NPC_TYPES.OUTLAW,
        name,
        Math.floor(crime.x / TILE) + rand(-2, 2),
        Math.floor(crime.y / TILE) + rand(-2, 2),
        null
      );
      npc.hostile = true;
      npc.hp = 2 + Math.floor(game.dayCount / 3);
      crime.outlaws.push(npc);
      game.npcs.push(npc);
    }

    showNotification('CRIME: ' + crime.desc);
    addJournalEntry(crime.name + ' at ' + crime.targetBuilding.name + '!');
    audio.playBad();
  }

  // Update active crime
  if (game.activeCrime) {
    const crime = game.activeCrime;
    crime.timer -= dt;

    // Check if all outlaws dealt with
    const outlawsRemaining = crime.outlaws.filter(o => o.state !== 'dead' && o.state !== 'arrested').length;
    if (outlawsRemaining === 0) {
      crime.resolved = true;
      crime.active = false;
      game.activeCrime = null;
      game.crimesResolved++;
      game.reputation = clamp(game.reputation + crime.repGain, 0, 100);
      game.gold += crime.goldReward;
      showNotification(`Crime resolved! +${crime.repGain} Rep, +$${crime.goldReward}`);
      audio.playVictory();
      addJournalEntry(`Resolved: ${crime.name}. Earned $${crime.goldReward}.`);
      return;
    }

    // Time ran out
    if (crime.timer <= 0) {
      crime.active = false;
      game.activeCrime = null;
      game.crimesIgnored++;
      game.reputation = clamp(game.reputation + crime.repLoss, 0, 100);
      showNotification(`Crime went unresolved! ${crime.repLoss} Rep`);
      audio.playBad();
      addJournalEntry(`Failed to resolve: ${crime.name}.`);
      // Remove crime outlaws
      for (const o of crime.outlaws) {
        if (o.state !== 'dead' && o.state !== 'arrested') o.state = 'dead';
      }
    }
  }
}

function updateQuests() {
  if (!game.activeQuest) return;
  const q = game.activeQuest;

  let complete = false;

  switch (q.type) {
    case 'patrol':
    case 'visit':
      if (q.targets.every(t => q.visited.has(t))) {
        complete = true;
      }
      document.getElementById('quest-text').textContent =
        `${q.desc} (${q.visited.size}/${q.targets.length})`;
      break;

    case 'bounty':
      // Check if any bounty NPC killed recently
      if (game.outlawsKilled > (q.startKills || 0)) {
        complete = true;
      }
      if (!q.startKills) q.startKills = game.outlawsKilled;
      break;

    case 'nightwatch':
      // Complete after patrolling at night
      if (game.time > 0.8 || game.time < 0.2) {
        q.nightTime = (q.nightTime || 0) + 1;
        if (q.nightTime > 300) complete = true;
      }
      break;

    case 'escort':
      // Simplified: just walk to church
      const church = game.buildings.find(b => b.type === BUILDING_TYPES.CHURCH);
      if (church && game.visitedBuildings.has(BUILDING_TYPES.CHURCH)) {
        complete = true;
      }
      break;
  }

  if (complete) {
    game.reputation = clamp(game.reputation + q.repReward, 0, 100);
    game.gold += q.goldReward;
    showNotification(`Mission Complete: ${q.name}! +${q.repReward} Rep, +$${q.goldReward}`);
    audio.playVictory();
    addJournalEntry(`Completed mission: ${q.name}.`);
    game.completedQuests.push(q);
    game.activeQuest = null;
    document.getElementById('quest-tracker').classList.add('hidden');
  }
}

function updateTime(dt) {
  game.time += game.timeSpeed * dt * 60;
  if (game.time >= 1) {
    game.time -= 1;
    game.dayCount++;
    game.daysServed++;
    addJournalEntry('A new day dawns.');

    // Weekly salary
    game.salaryTimer++;
    if (game.salaryTimer >= 7) {
      game.salaryTimer = 0;
      const salary = 50 + game.reputation;
      game.gold += salary;
      showNotification(`Weekly salary: $${salary}`);
      addJournalEntry(`Received weekly salary: $${salary}.`);
    }

    // Heal overnight
    game.player.hp = Math.min(game.player.hp + 1, game.player.maxHp);

    // Random events at dawn
    if (Math.random() > 0.7) {
      const stranger = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        NPC_NAMES.stranger[rand(0, NPC_NAMES.stranger.length - 1)],
        rand(5, MAP_W - 5), rand(5, MAP_H - 5), null
      );
      game.npcs.push(stranger);
      showNotification('A stranger has arrived in town...');
    }
  }

  // Update rank
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (game.reputation >= RANKS[i].rep) {
      game.rank = RANKS[i].name;
      break;
    }
  }

  // Game over conditions
  if (game.reputation <= 0) {
    game.state = 'gameover';
    game.gameOverReason = 'Your reputation hit rock bottom. The town ran you out.';
  }
}

function updateUI() {
  document.getElementById('rep-bar-inner').style.width = game.reputation + '%';
  document.getElementById('rep-value').textContent = game.reputation;
  document.getElementById('day-count').textContent = 'Day ' + game.dayCount;
  document.getElementById('clock').textContent = getTimeString(game.time);
  document.getElementById('gold-display').textContent = '$' + game.gold;
  document.getElementById('rank-display').textContent = game.rank;

  // Notification timer
  if (notifTimer > 0) {
    notifTimer--;
    if (notifTimer <= 0) {
      document.getElementById('notification').classList.add('hidden');
    }
  }
}

function updateCamera() {
  const target = game.player;
  game.camera.x = lerp(game.camera.x, target.x - canvas.width / 2, 0.08);
  game.camera.y = lerp(game.camera.y, target.y - canvas.height / 2, 0.08);
}

// ---- MAIN RENDER ----
function render() {
  const camX = game.camera.x;
  const camY = game.camera.y;

  // Sky
  const skyColor = getSkyColor(game.time);
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Tiles
  const startX = Math.max(0, Math.floor(camX / TILE));
  const startY = Math.max(0, Math.floor(camY / TILE));
  const endX = Math.min(MAP_W, Math.ceil((camX + canvas.width) / TILE) + 1);
  const endY = Math.min(MAP_H, Math.ceil((camY + canvas.height) / TILE) + 1);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      drawTile(x, y, camX, camY, game.map[y][x], game.time);
    }
  }

  // Building roofs
  for (const b of game.buildings) {
    drawBuildingRoof(b, camX, camY);
  }

  // Crime indicator
  if (game.activeCrime) {
    const cx = game.activeCrime.x - camX;
    const cy = game.activeCrime.y - camY;
    ctx.strokeStyle = Date.now() % 500 < 250 ? '#ff0000' : '#ff000044';
    ctx.lineWidth = 2;
    const pulse = 20 + Math.sin(Date.now() / 200) * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Arrow pointing to crime if offscreen
    if (cx < 0 || cx > canvas.width || cy < 0 || cy > canvas.height) {
      const angle = Math.atan2(cy - canvas.height / 2, cx - canvas.width / 2);
      const arrowX = canvas.width / 2 + Math.cos(angle) * 200;
      const arrowY = canvas.height / 2 + Math.sin(angle) * 150;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', arrowX, arrowY + 4);
    }
  }

  // NPCs (sort by Y for depth)
  const sortedNPCs = [...game.npcs].sort((a, b) => a.y - b.y);
  for (const npc of sortedNPCs) {
    drawNPC(npc, camX, camY);
  }

  // Player
  drawPlayer(game.player, camX, camY);

  // Bullets
  bullets.draw(ctx, camX, camY);

  // Particles
  particles.draw(ctx, camX, camY);

  // Floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.5;
    ft.life--;
    ctx.globalAlpha = ft.life / 60;
    ctx.fillStyle = ft.color;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
    ctx.globalAlpha = 1;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  // Day/night overlay
  drawDayNightOverlay(game.time);

  // Minimap
  drawMinimap();
}

function getSkyColor(t) {
  if (t < 0.2) return '#1a1020';
  if (t < 0.25) return lerpColor('#1a1020', '#c06838', (t - 0.2) / 0.05);
  if (t < 0.3) return lerpColor('#c06838', '#d4a050', (t - 0.25) / 0.05);
  if (t < 0.7) return '#d4a050';
  if (t < 0.75) return lerpColor('#d4a050', '#c06838', (t - 0.7) / 0.05);
  if (t < 0.8) return lerpColor('#c06838', '#2a1830', (t - 0.75) / 0.05);
  return '#1a1020';
}

function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ---- SAVE / LOAD ----
function saveGame() {
  const data = {
    reputation: game.reputation,
    gold: game.gold,
    dayCount: game.dayCount,
    daysServed: game.daysServed,
    time: game.time,
    outlawsKilled: game.outlawsKilled,
    outlawsArrested: game.outlawsArrested,
    crimesResolved: game.crimesResolved,
    crimesIgnored: game.crimesIgnored,
    completedQuests: game.completedQuests.map(q => q.name),
    journalEntries: game.journalEntries,
    playerX: game.player.x,
    playerY: game.player.y,
    playerHp: game.player.hp
  };
  localStorage.setItem('sheriff_save', JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem('sheriff_save');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    initGame();
    game.reputation = data.reputation;
    game.gold = data.gold;
    game.dayCount = data.dayCount;
    game.daysServed = data.daysServed;
    game.time = data.time;
    game.outlawsKilled = data.outlawsKilled;
    game.outlawsArrested = data.outlawsArrested;
    game.crimesResolved = data.crimesResolved;
    game.crimesIgnored = data.crimesIgnored;
    game.journalEntries = data.journalEntries || [];
    game.player.x = data.playerX;
    game.player.y = data.playerY;
    game.player.hp = data.playerHp;
    return true;
  } catch (e) {
    return false;
  }
}

// ---- GAME INIT ----
function initGame() {
  const { map, buildings } = generateTown();
  game.map = map;
  game.buildings = buildings;

  // Player starts at sheriff office door
  const sheriffOffice = buildings.find(b => b.type === BUILDING_TYPES.SHERIFF);
  game.player = createPlayer(sheriffOffice.doorX, sheriffOffice.doorY + 1);

  game.npcs = generateNPCs(buildings);
  game.crimes = [];
  game.activeCrime = null;
  game.activeQuest = null;
  game.completedQuests = [];
  game.reputation = 50;
  game.gold = 20;
  game.time = 0.25;
  game.dayCount = 1;
  game.daysServed = 0;
  game.outlawsKilled = 0;
  game.outlawsArrested = 0;
  game.crimesResolved = 0;
  game.crimesIgnored = 0;
  game.crimeSpawnTimer = 15;
  game.salaryTimer = 0;
  game.journalEntries = [];
  game.visitedBuildings = new Set();
  game.camera.x = game.player.x - canvas.width / 2;
  game.camera.y = game.player.y - canvas.height / 2;

  addJournalEntry('Pinned on the badge. Time to keep the peace.');

  particles.particles = [];
  bullets.bullets = [];
  floatingTexts.length = 0;
}

// ---- GAME OVER ----
function showGameOver() {
  const screen = document.getElementById('game-over-screen');
  screen.classList.remove('hidden');
  document.getElementById('go-title').textContent =
    game.player.hp <= 0 ? 'YOU DIED' : 'GAME OVER';
  document.getElementById('go-reason').textContent = game.gameOverReason;
  document.getElementById('go-stats').innerHTML = `
    Days Served: ${game.daysServed}<br>
    Final Rank: ${game.rank}<br>
    Outlaws Killed: ${game.outlawsKilled}<br>
    Outlaws Arrested: ${game.outlawsArrested}<br>
    Crimes Resolved: ${game.crimesResolved}<br>
    Gold Earned: $${game.gold}
  `;
}

// ---- MAIN LOOP ----
let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  // Clear keys just pressed at end of frame
  const frameClear = () => { for (const k in keysJustPressed) keysJustPressed[k] = false; };

  switch (game.state) {
    case 'playing':
      updatePlayer(dt);
      updateNPCs(dt);
      updateCrimes(dt);
      updateQuests();
      updateTime(dt);
      bullets.update(game.npcs, game.player, particles, game);
      particles.update();
      updateCamera();
      updateUI();
      render();

      // Pause
      if (consumeKey('Escape')) {
        game.state = 'paused';
        document.getElementById('pause-screen').classList.remove('hidden');
      }
      // Journal
      if (consumeKey('KeyJ')) {
        openJournal();
      }
      // Minimap toggle
      if (consumeKey('KeyM')) {
        game.showMinimap = !game.showMinimap;
      }
      break;

    case 'paused':
      render();
      if (consumeKey('Escape')) {
        game.state = 'playing';
        document.getElementById('pause-screen').classList.add('hidden');
      }
      break;

    case 'dialog':
      render();
      if (consumeKey('Escape') || consumeKey('KeyE')) {
        closeDialog();
      }
      // Number keys for choices
      if (consumeKey('Digit1')) {
        const btn = document.querySelector('.dialog-choice:nth-child(1)');
        if (btn) btn.click();
      }
      if (consumeKey('Digit2')) {
        const btn = document.querySelector('.dialog-choice:nth-child(2)');
        if (btn) btn.click();
      }
      if (consumeKey('Digit3')) {
        const btn = document.querySelector('.dialog-choice:nth-child(3)');
        if (btn) btn.click();
      }
      break;

    case 'duel':
      updateDuel();
      render();
      break;

    case 'journal':
      render();
      if (consumeKey('Escape') || consumeKey('KeyJ')) {
        closeJournal();
      }
      break;

    case 'gameover':
      render();
      showGameOver();
      break;

    case 'title':
      // Title screen handled by HTML
      break;
  }

  frameClear();
  requestAnimationFrame(gameLoop);
}

// ---- UI EVENTS ----
document.getElementById('btn-new').addEventListener('click', () => {
  audio.init();
  initGame();
  game.state = 'playing';
  document.getElementById('title-screen').classList.add('hidden');
  audio.playAmbientWind();
  audio.playWesternRiff();
});

document.getElementById('btn-continue').addEventListener('click', () => {
  audio.init();
  if (loadGame()) {
    game.state = 'playing';
    document.getElementById('title-screen').classList.add('hidden');
    audio.playAmbientWind();
  } else {
    showNotification('No save found!');
  }
});

document.getElementById('btn-controls').addEventListener('click', () => {
  document.getElementById('controls-panel').classList.toggle('hidden');
  document.getElementById('title-menu').classList.toggle('hidden');
});

document.getElementById('btn-back').addEventListener('click', () => {
  document.getElementById('controls-panel').classList.add('hidden');
  document.getElementById('title-menu').classList.remove('hidden');
});

document.getElementById('btn-resume').addEventListener('click', () => {
  game.state = 'playing';
  document.getElementById('pause-screen').classList.add('hidden');
});

document.getElementById('btn-save').addEventListener('click', () => {
  saveGame();
  game.state = 'title';
  document.getElementById('pause-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
});

document.getElementById('btn-restart').addEventListener('click', () => {
  document.getElementById('game-over-screen').classList.add('hidden');
  initGame();
  game.state = 'playing';
});

document.getElementById('journal-close').addEventListener('click', () => {
  closeJournal();
});

// Show continue button if save exists
if (localStorage.getItem('sheriff_save')) {
  document.getElementById('btn-continue').classList.remove('hidden');
}

// Start the loop
requestAnimationFrame(gameLoop);
