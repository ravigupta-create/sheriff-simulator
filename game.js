// === PART 1: CORE ENGINE ===
// ============================================================
// SHERIFF SIMULATOR — 2D Top-Down Western Lawman Game
// Pure HTML5 Canvas + Web Audio API, zero external dependencies
// ============================================================

'use strict';

// ─────────────────────────────────────────────
// §1  CONSTANTS
// ─────────────────────────────────────────────
const TILE = 32;
const MAP_W = 80, MAP_H = 60;
const WORLD_W = MAP_W * TILE, WORLD_H = MAP_H * TILE;

const PLAYER_SPEED       = 2.5;
const PLAYER_RUN_SPEED   = 4.0;
const HORSE_SPEED        = 6.0;
const NPC_SPEED          = 1.2;
const OUTLAW_SPEED       = 1.8;
const BULLET_SPEED       = 8;
const SHOTGUN_SPREAD     = 0.25;   // radians
const RIFLE_RANGE        = 400;    // pixels
const MELEE_RANGE        = 40;     // pixels
const MELEE_COOLDOWN     = 500;    // ms
const INTERACT_RANGE     = 48;     // pixels

const DAY_LENGTH          = 180;   // seconds per game day
const DAWN_HOUR           = 6;
const DUSK_HOUR           = 19;
const MIDNIGHT_HOUR       = 0;
const HOURS_PER_DAY       = 24;

const CRIMES_PER_DAY_MIN  = 2;
const CRIMES_PER_DAY_MAX  = 5;
const CRIME_RESOLVE_TIME  = 120;   // seconds before crime auto-fails

const STARTING_HP         = 10;
const STARTING_AMMO       = 24;
const STARTING_MONEY      = 50;
const MAX_HP_CAP          = 20;
const MAX_AMMO_CAP        = 99;

const DUEL_WINDOW_DEFAULT = 600;   // ms to draw
const REPUTATION_MAX      = 100;

const WANTED_LEVEL_DECAY  = 0.05;  // per second of good behavior
const HORSE_HEAL_AMOUNT   = 3;
const TONIC_HEAL_AMOUNT   = 2;

const SAVE_KEY = 'sheriff_sim_save';

// ─────────────────────────────────────────────
// §2  COLOR PALETTE  (spaghetti-western tones)
// ─────────────────────────────────────────────
const PALETTE = {
  // terrain
  sand:        '#c4a55a',
  sandDark:    '#a68a3e',
  sandLight:   '#dbc278',
  dirt:        '#8b7355',
  dirtDark:    '#6b5335',
  wood:        '#6b4226',
  woodDark:    '#4a2e1a',
  woodLight:   '#8b6340',
  stone:       '#7a7062',
  stoneDark:   '#5a5248',
  stoneLight:  '#9a9082',
  road:        '#9e8b6e',
  roadDark:    '#7e6b4e',

  // structures
  roof:        '#8b4513',
  roofDark:    '#6b3010',
  roofLight:   '#a85a28',
  roofTile:    '#a0522d',
  wallAdobe:   '#c8a882',
  wallAdobeD:  '#a88862',
  plank:       '#7a5a3a',
  plankDark:   '#5a3a1a',

  // nature
  cactus:      '#4a7a2e',
  cactusD:     '#3a6020',
  tumbleweed:  '#a89060',
  grass:       '#6a8a3a',
  water:       '#4a6a8a',
  waterLight:  '#6a8aaa',

  // sky
  sky:         '#d4a050',
  skyNight:    '#1a1030',
  skyDusk:     '#c06030',
  skyDawn:     '#e0a060',
  skyNoon:     '#87ceeb',

  // characters
  skin:        '#d4a574',
  skinDark:    '#b8844a',
  skinLight:   '#e8c8a0',
  hat:         '#3a2a14',
  hatBrim:     '#2a1a0a',
  cloth:       '#8b1a1a',
  clothDark:   '#5b0a0a',
  denim:       '#4a5a8a',
  leather:     '#6a4a2a',
  badge:       '#ffd700',
  badgeShine:  '#fff8c0',
  outlaw:      '#2a2a2a',
  outlawHat:   '#1a1a1a',
  bandana:     '#8b0000',

  // effects
  blood:       '#8b0000',
  muzzleFlash: '#ffcc00',
  dust:        '#c8b898',
  gold:        '#ffd700',
  silver:      '#c0c0c0',

  // UI
  uiDark:      '#140c04',
  uiPanel:     '#1e1208',
  uiBorder:    '#5a3a18',
  uiBorderLt:  '#8a6a38',
  uiText:      '#e8d8b8',
  uiTextDim:   '#a09070',
  uiHighlight: '#ffd700',
  uiDanger:    '#cc3030',
  uiSuccess:   '#30aa30',
  uiHealth:    '#cc3030',
  uiHealthBg:  '#440000',
  uiAmmo:      '#ccaa30',
  uiMoney:     '#ffd700',
  uiRep:       '#4488cc',
};

// ─────────────────────────────────────────────
// §3  RANK SYSTEM
// ─────────────────────────────────────────────
const RANKS = [
  { name: 'Deputy',     rep: 0,   payBonus: 1.0, badge: '⭐' },
  { name: 'Sheriff',    rep: 25,  payBonus: 1.25, badge: '🌟' },
  { name: 'Marshal',    rep: 50,  payBonus: 1.5, badge: '🔱' },
  { name: 'Legend',     rep: 75,  payBonus: 2.0, badge: '💫' },
  { name: 'Wyatt Earp', rep: 95, payBonus: 3.0, badge: '👑' },
];

function getRank(reputation) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (reputation >= r.rep) rank = r;
  }
  return rank;
}

// ─────────────────────────────────────────────
// §4  BUILDING TYPES
// ─────────────────────────────────────────────
const BUILDING_TYPES = {
  SHERIFF:      0,
  SALOON:       1,
  BANK:         2,
  GENERAL:      3,
  JAIL:         4,
  CHURCH:       5,
  STABLE:       6,
  HOTEL:        7,
  HOUSE:        8,
  BLACKSMITH:   9,
  WELL:         10,
  GALLOWS:      11,
  WANTED_BOARD: 12,
};

const BUILDING_COLORS = {
  [BUILDING_TYPES.SHERIFF]:      { wall: '#a88862', roof: '#6b3010', trim: '#ffd700' },
  [BUILDING_TYPES.SALOON]:       { wall: '#8b6340', roof: '#8b4513', trim: '#cc3030' },
  [BUILDING_TYPES.BANK]:         { wall: '#9a9082', roof: '#5a5248', trim: '#ffd700' },
  [BUILDING_TYPES.GENERAL]:      { wall: '#c8a882', roof: '#a0522d', trim: '#4a7a2e' },
  [BUILDING_TYPES.JAIL]:         { wall: '#7a7062', roof: '#5a5248', trim: '#444444' },
  [BUILDING_TYPES.CHURCH]:       { wall: '#ddd8cc', roof: '#8b4513', trim: '#ffffff' },
  [BUILDING_TYPES.STABLE]:       { wall: '#6b4226', roof: '#4a2e1a', trim: '#8b6340' },
  [BUILDING_TYPES.HOTEL]:        { wall: '#b8844a', roof: '#8b4513', trim: '#cc8844' },
  [BUILDING_TYPES.HOUSE]:        { wall: '#c8a882', roof: '#a0522d', trim: '#6b4226' },
  [BUILDING_TYPES.BLACKSMITH]:   { wall: '#5a5248', roof: '#3a3028', trim: '#cc6600' },
  [BUILDING_TYPES.WELL]:         { wall: '#7a7062', roof: '#5a5248', trim: '#4a6a8a' },
  [BUILDING_TYPES.GALLOWS]:      { wall: '#4a2e1a', roof: '#3a2010', trim: '#2a1a0a' },
  [BUILDING_TYPES.WANTED_BOARD]: { wall: '#6b4226', roof: '#4a2e1a', trim: '#c8a882' },
};

// ─────────────────────────────────────────────
// §5  NPC TYPES
// ─────────────────────────────────────────────
const NPC_TYPES = {
  TOWNSPERSON: 'townsperson',
  OUTLAW:      'outlaw',
  BARTENDER:   'bartender',
  SHOPKEEPER:  'shopkeeper',
  MAYOR:       'mayor',
  DEPUTY:      'deputy',
  BANKER:      'banker',
  PREACHER:    'preacher',
  STRANGER:    'stranger',
  BOUNTY:      'bounty',
};

// ─────────────────────────────────────────────
// §6  ACHIEVEMENTS  (25 definitions)
// ─────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'gunslinger',       name: 'Gunslinger',        desc: 'Win 10 duels',                         icon: '🔫', check: 'checkDuelsWon',       target: 10 },
  { id: 'peacekeeper',      name: 'Peacekeeper',       desc: 'Arrest 10 outlaws',                    icon: '⛓️', check: 'checkArrests',        target: 10 },
  { id: 'protector',        name: 'Protector',         desc: 'Resolve 15 crimes',                    icon: '🛡️', check: 'checkCrimesResolved', target: 15 },
  { id: 'quick_draw',       name: 'Quick Draw',        desc: 'Win a duel in under 200ms',            icon: '⚡', check: 'checkQuickDraw',       target: 200 },
  { id: 'pacifist',         name: 'Pacifist',          desc: 'Arrest 5 outlaws without killing any', icon: '🕊️', check: 'checkPacifist',       target: 5 },
  { id: 'wealthy',          name: 'Wealthy',           desc: 'Have $500 or more at once',            icon: '💰', check: 'checkWealth',          target: 500 },
  { id: 'iron_sheriff',     name: 'Iron Sheriff',      desc: 'Survive 30 days',                      icon: '🏋️', check: 'checkDaysSurvived',   target: 30 },
  { id: 'legend',           name: 'Legend',             desc: 'Reach Wyatt Earp rank',                icon: '🏆', check: 'checkMaxRank',         target: 95 },
  { id: 'night_owl',        name: 'Night Owl',         desc: 'Complete 3 night watches',             icon: '🦉', check: 'checkNightWatches',    target: 3 },
  { id: 'sharpshooter',     name: 'Sharpshooter',      desc: 'Land 50 shots on target',              icon: '🎯', check: 'checkShotsHit',        target: 50 },
  { id: 'brawler',          name: 'Brawler',           desc: 'Win 10 melee fights',                  icon: '👊', check: 'checkMeleeWins',        target: 10 },
  { id: 'card_shark',       name: 'Card Shark',        desc: 'Win 10 poker hands',                   icon: '🃏', check: 'checkPokerWins',        target: 10 },
  { id: 'horse_whisperer',  name: 'Horse Whisperer',   desc: 'Ride 1000 tiles on horseback',         icon: '🐴', check: 'checkTilesRidden',      target: 1000 },
  { id: 'corrupt',          name: 'Corrupt',           desc: 'Accept 5 bribes',                      icon: '🤑', check: 'checkBribesAccepted',   target: 5 },
  { id: 'feared',           name: 'Feared',            desc: 'Reach 95+ reputation',                 icon: '😈', check: 'checkReputation',       target: 95 },
  { id: 'incorruptible',    name: 'Incorruptible',     desc: 'Never accept a bribe (day 10+)',       icon: '⚖️', check: 'checkIncorruptible',   target: 0 },
  { id: 'explorer',         name: 'Explorer',          desc: 'Visit every building in town',         icon: '🗺️', check: 'checkAllBuildings',    target: 0 },
  { id: 'socialite',        name: 'Socialite',         desc: 'Talk to 20 different NPCs',            icon: '🗣️', check: 'checkNpcsTalkedTo',    target: 20 },
  { id: 'survivor',         name: 'Survivor',          desc: 'Win a fight with only 1 HP left',      icon: '💀', check: 'checkSurvivor',         target: 1 },
  { id: 'hangman',          name: 'Hangman',           desc: 'Capture 3 bounty targets',             icon: '📜', check: 'checkBountiesCaptured', target: 3 },
  { id: 'speed_demon',      name: 'Speed Demon',       desc: 'Resolve a crime in under 10 seconds',  icon: '💨', check: 'checkSpeedResolve',     target: 10 },
  { id: 'gold_rush',        name: 'Gold Rush',         desc: 'Earn $1000 total across the game',     icon: '🪙', check: 'checkTotalEarnings',    target: 1000 },
  { id: 'frontier_doctor',  name: 'Frontier Doctor',   desc: 'Buy 10 health tonics',                 icon: '🧪', check: 'checkTonicsBought',     target: 10 },
  { id: 'town_hero',        name: 'Town Hero',         desc: 'Reach day 50',                         icon: '🌅', check: 'checkDaysSurvived50',   target: 50 },
  { id: 'untouchable',      name: 'Untouchable',       desc: 'Complete a full day without damage',   icon: '✨', check: 'checkNoDamageDay',      target: 0 },
];

// ─────────────────────────────────────────────
// §7  SHOP ITEMS
// ─────────────────────────────────────────────
const SHOP_ITEMS = {
  general: [
    { id: 'health_tonic', name: 'Health Tonic',      price: 25,  desc: 'Restores 2 HP',              icon: '🧴', effect: 'healHP',       value: 2,  oneTime: false },
    { id: 'ammo_pack',    name: 'Ammo Pack',         price: 10,  desc: '+12 rounds of ammunition',   icon: '🔹', effect: 'addAmmo',      value: 12, oneTime: false },
    { id: 'horse_feed',   name: 'Horse Feed',        price: 15,  desc: 'Heals your horse',           icon: '🌾', effect: 'healHorse',    value: HORSE_HEAL_AMOUNT, oneTime: false },
    { id: 'gun_repair',   name: 'Gun Repair Kit',    price: 30,  desc: 'Restore full accuracy',      icon: '🔧', effect: 'repairGun',    value: 1,  oneTime: false },
    { id: 'supplies',     name: 'Campfire Supplies', price: 15,  desc: 'Cook food at campfire +3 HP', icon: '🍖', effect: 'addSupplies',  value: 3,  oneTime: false },
  ],
  blacksmith: [
    { id: 'vest',         name: 'Bulletproof Vest',  price: 100, desc: '+2 max HP',                  icon: '🦺', effect: 'addMaxHP',     value: 2,  oneTime: true },
    { id: 'speed_boots',  name: 'Speed Boots',       price: 75,  desc: '+15% movement speed',        icon: '👢', effect: 'addSpeed',     value: 0.15, oneTime: true },
    { id: 'shotgun',      name: 'Shotgun',           price: 150, desc: 'Spread shot, close range',   icon: '🔫', effect: 'unlockShotgun', value: 1, oneTime: true },
    { id: 'rifle',        name: 'Rifle',             price: 200, desc: 'Long range precision shots',  icon: '🎯', effect: 'unlockRifle',  value: 1, oneTime: true },
  ],
};

// ─────────────────────────────────────────────
// §8  DIFFICULTY CONFIGS
// ─────────────────────────────────────────────
const DIFFICULTY = {
  easy: {
    label:           'Easy',
    crimeFreqMult:   0.7,
    outlawHPMult:    0.7,
    playerHP:        14,
    startingAmmo:    36,
    startingMoney:   100,
    duelWindow:      900,   // ms
    outlawDamageMult: 0.6,
    rewardMult:      1.3,
    repGainMult:     1.3,
    repLossMult:     0.7,
    nightCrimeMult:  1.0,
  },
  normal: {
    label:           'Normal',
    crimeFreqMult:   1.0,
    outlawHPMult:    1.0,
    playerHP:        STARTING_HP,
    startingAmmo:    STARTING_AMMO,
    startingMoney:   STARTING_MONEY,
    duelWindow:      DUEL_WINDOW_DEFAULT,
    outlawDamageMult: 1.0,
    rewardMult:      1.0,
    repGainMult:     1.0,
    repLossMult:     1.0,
    nightCrimeMult:  1.3,
  },
  hard: {
    label:           'Hard',
    crimeFreqMult:   1.4,
    outlawHPMult:    1.5,
    playerHP:        8,
    startingAmmo:    18,
    startingMoney:   30,
    duelWindow:      400,
    outlawDamageMult: 1.4,
    rewardMult:      0.8,
    repGainMult:     0.8,
    repLossMult:     1.4,
    nightCrimeMult:  1.8,
  },
  hardcore: {
    label:           'Hardcore',
    crimeFreqMult:   1.8,
    outlawHPMult:    2.0,
    playerHP:        6,
    startingAmmo:    12,
    startingMoney:   20,
    duelWindow:      280,
    outlawDamageMult: 1.8,
    rewardMult:      0.6,
    repGainMult:     0.6,
    repLossMult:     2.0,
    nightCrimeMult:  2.5,
  },
};

// ─────────────────────────────────────────────
// §9  AUDIO ENGINE  (procedural Web Audio API)
// ─────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
    this._windSource = null;
    this._cricketSource = null;
    this._riffInterval = null;
    this._gallopInterval = null;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) { return; }
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

  setMasterVolume(v)  { if (this.master) this.master.gain.value = clamp(v, 0, 1); }
  setMusicVolume(v)   { if (this.musicGain) this.musicGain.gain.value = clamp(v, 0, 1); }
  setSfxVolume(v)     { if (this.sfxGain) this.sfxGain.gain.value = clamp(v, 0, 1); }

  // ── Core helpers ──

  playNote(freq, duration, type = 'square', destGain = null) {
    if (!this.initialized) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(destGain || this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  _noiseBuffer(seconds, shapeFunc) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = shapeFunc(i, len, this.ctx.sampleRate);
    }
    return buf;
  }

  _playBuffer(buf, gain, dest) {
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(dest || this.sfxGain);
    src.start();
    return src;
  }

  // ── Sound Effects ──

  playGunshot() {
    if (!this.initialized) return;
    const buf = this._noiseBuffer(0.35, (i, len) => {
      const t = i / len;
      const crack = (Math.random() * 2 - 1) * Math.pow(1 - t, 4);
      const rumble = (Math.random() * 2 - 1) * 0.3 * Math.pow(1 - t, 2) * Math.sin(t * 120);
      return crack + rumble;
    });
    this._playBuffer(buf, 0.6, this.sfxGain);
  }

  playStep(tileType) {
    if (!this.initialized) return;
    // Vary pitch/texture by tile:  sand=low+soft, wood=high+sharp, stone=mid+hard
    let pitchMult = 1.0, vol = 0.15, dur = 0.05;
    switch (tileType) {
      case 0: // sand
        pitchMult = 0.6; vol = 0.10; dur = 0.07;
        break;
      case 1: // road / dirt
        pitchMult = 0.85; vol = 0.14; dur = 0.05;
        break;
      case 8: // wood floor
        pitchMult = 1.4; vol = 0.18; dur = 0.04;
        break;
      case 3: case 7: // stone / rock
        pitchMult = 1.0; vol = 0.16; dur = 0.035;
        break;
      default:
        pitchMult = 0.8; vol = 0.12; dur = 0.05;
    }
    const buf = this._noiseBuffer(dur, (i, len, sr) => {
      const env = 1 - i / len;
      const raw = Math.random() * 2 - 1;
      // Crude low-pass by averaging with previous — pitchMult controls cutoff feel
      return raw * env * 0.3 * pitchMult;
    });
    this._playBuffer(buf, vol, this.sfxGain);
  }

  playMelee() {
    if (!this.initialized) return;
    const buf = this._noiseBuffer(0.12, (i, len) => {
      const t = i / len;
      return (Math.random() * 2 - 1) * Math.pow(1 - t, 2) * 0.5
             + Math.sin(t * 600) * 0.3 * (1 - t);
    });
    this._playBuffer(buf, 0.45, this.sfxGain);
  }

  playDing() {
    if (!this.initialized) return;
    this.playNote(880, 0.15, 'sine');
    setTimeout(() => this.playNote(1108, 0.2, 'sine'), 100);
  }

  playBad() {
    if (!this.initialized) return;
    this.playNote(220, 0.2, 'sawtooth');
    setTimeout(() => this.playNote(165, 0.3, 'sawtooth'), 150);
  }

  playDuelDraw() {
    if (!this.initialized) return;
    this.playNote(440, 0.1, 'square');
    setTimeout(() => this.playNote(660, 0.1, 'square'), 80);
    setTimeout(() => this.playNote(880, 0.15, 'square'), 160);
  }

  playVictory() {
    if (!this.initialized) return;
    const melody = [523, 659, 784, 1047, 1318];
    melody.forEach((f, i) => {
      setTimeout(() => this.playNote(f, 0.3, 'sine', this.sfxGain), i * 100);
    });
  }

  playPanic() {
    if (!this.initialized) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.playNote(800 + i * 80, 0.08, 'square'), i * 70);
    }
  }

  playCheer() {
    if (!this.initialized) return;
    const notes = [392, 494, 588, 784];
    notes.forEach((f, i) => {
      setTimeout(() => this.playNote(f, 0.2, 'triangle', this.sfxGain), i * 120);
    });
  }

  playHorseNeigh() {
    if (!this.initialized) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t0);
    osc.frequency.linearRampToValueAtTime(1200, t0 + 0.15);
    osc.frequency.linearRampToValueAtTime(400, t0 + 0.5);
    g.gain.setValueAtTime(0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.55);
  }

  playHorseGallop() {
    if (!this.initialized) return;
    const buf = this._noiseBuffer(0.08, (i, len) => {
      const t = i / len;
      return (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * 0.4;
    });
    this._playBuffer(buf, 0.25, this.sfxGain);
  }

  playPokerChip() {
    if (!this.initialized) return;
    this.playNote(2200, 0.06, 'sine');
    setTimeout(() => this.playNote(3300, 0.04, 'sine'), 40);
  }

  playBellAlarm() {
    if (!this.initialized) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playNote(1400, 0.15, 'sine');
        this.playNote(1760, 0.15, 'sine');
      }, i * 250);
    }
  }

  playWhistle() {
    if (!this.initialized) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t0);
    osc.frequency.linearRampToValueAtTime(1200, t0 + 0.3);
    osc.frequency.linearRampToValueAtTime(600, t0 + 0.8);
    g.gain.setValueAtTime(0.2, t0);
    g.gain.setValueAtTime(0.2, t0 + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.85);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.85);
  }

  playDoorOpen() {
    if (!this.initialized) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t0);
    osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.25);
    g.gain.setValueAtTime(0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.3);
    // creak noise overlay
    const buf = this._noiseBuffer(0.2, (i, len) => {
      const t = i / len;
      return (Math.random() * 2 - 1) * 0.08 * Math.sin(t * 300) * (1 - t);
    });
    this._playBuffer(buf, 0.15, this.sfxGain);
  }

  playDrink() {
    if (!this.initialized) return;
    // gulp sounds
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playNote(150 + i * 20, 0.08, 'sine'), i * 100);
    }
  }

  playReload() {
    if (!this.initialized) return;
    // metallic click sequence
    const clicks = [3200, 2800, 4000, 2400];
    clicks.forEach((f, i) => {
      setTimeout(() => this.playNote(f, 0.03, 'square'), i * 80);
    });
    // finishing snap
    setTimeout(() => {
      const buf = this._noiseBuffer(0.04, (i, len) => {
        return (Math.random() * 2 - 1) * (1 - i / len) * 0.3;
      });
      this._playBuffer(buf, 0.3, this.sfxGain);
    }, 350);
  }

  // ── Ambient / Music ──

  playAmbientWind() {
    if (!this.initialized || this._windSource) return;
    const dur = 4;
    const buf = this._noiseBuffer(dur, (i, len, sr) => {
      const t = i / len;
      // Modulated noise: sine swell gives organic wind feel
      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * 0.5);
      const gust = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * 2.3);
      return (Math.random() * 2 - 1) * 0.04 * swell * (0.6 + 0.4 * gust);
    });
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // Crossfade-safe loop: the buffer is designed to wrap smoothly
    // because both endpoints sit near zero amplitude via the sine swell
    const g = this.ctx.createGain();
    g.gain.value = 0.3;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    src.connect(lp);
    lp.connect(g);
    g.connect(this.musicGain);
    src.start();
    this._windSource = src;
  }

  stopAmbientWind() {
    if (this._windSource) {
      try { this._windSource.stop(); } catch (_) {}
      this._windSource = null;
    }
  }

  playCrickets() {
    if (!this.initialized || this._cricketSource) return;
    const dur = 3;
    const buf = this._noiseBuffer(dur, (i, len, sr) => {
      const t = i / sr;
      // Chirp pattern: bursts of high-freq sine modulated by on/off envelope
      const chirpRate = 12;        // chirps per second
      const chirpDuty = 0.3;
      const phase = (t * chirpRate) % 1;
      const on = phase < chirpDuty ? 1 : 0;
      const carrier = Math.sin(2 * Math.PI * 4800 * t) * 0.3;
      const mod = Math.sin(2 * Math.PI * 80 * t);
      // Volume swell so loop point is seamless
      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * (i / len));
      return carrier * on * mod * swell * 0.08;
    });
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0.2;
    src.connect(g);
    g.connect(this.musicGain);
    src.start();
    this._cricketSource = src;
  }

  stopCrickets() {
    if (this._cricketSource) {
      try { this._cricketSource.stop(); } catch (_) {}
      this._cricketSource = null;
    }
  }

  playWesternRiff() {
    if (!this.initialized) return;
    // Ennio Morricone-style repeating melody
    // Notes: E4 – G4 – E4 – D4 – C4 – D4 – E4 – D4 – C4 – A3 – C4 – rest – (repeat)
    const melody = [
      { f: 330, d: 0.28 },  // E4
      { f: 0,   d: 0.12 },  // rest
      { f: 392, d: 0.28 },  // G4
      { f: 0,   d: 0.12 },  // rest
      { f: 330, d: 0.24 },  // E4
      { f: 294, d: 0.24 },  // D4
      { f: 262, d: 0.40 },  // C4
      { f: 0,   d: 0.16 },  // rest
      { f: 294, d: 0.24 },  // D4
      { f: 330, d: 0.24 },  // E4
      { f: 294, d: 0.24 },  // D4
      { f: 262, d: 0.36 },  // C4
      { f: 220, d: 0.40 },  // A3
      { f: 0,   d: 0.16 },  // rest
      { f: 262, d: 0.36 },  // C4
      { f: 0,   d: 0.40 },  // rest (breathing room before repeat)
    ];

    let totalDur = 0;
    for (const n of melody) totalDur += n.d;

    const playOnce = (offset) => {
      let t = offset;
      for (const n of melody) {
        if (n.f > 0) {
          setTimeout(() => {
            if (!this.initialized) return;
            this.playNote(n.f, n.d * 0.9, 'triangle', this.musicGain);
          }, t * 1000);
        }
        t += n.d;
      }
    };

    // Play and repeat
    playOnce(0);
    this._riffInterval = setInterval(() => playOnce(0), totalDur * 1000);
  }

  stopWesternRiff() {
    if (this._riffInterval) {
      clearInterval(this._riffInterval);
      this._riffInterval = null;
    }
  }

  // Stop all ambient loops
  stopAllAmbient() {
    this.stopAmbientWind();
    this.stopCrickets();
    this.stopWesternRiff();
  }
}

const audio = new AudioEngine();

// ─────────────────────────────────────────────
// §10  INPUT SYSTEM
// ─────────────────────────────────────────────
const keys = {};
const keysJustPressed = {};

document.addEventListener('keydown', e => {
  if (!keys[e.code]) keysJustPressed[e.code] = true;
  keys[e.code] = true;
});
document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function consumeKey(code) {
  if (keysJustPressed[code]) {
    keysJustPressed[code] = false;
    return true;
  }
  return false;
}

function clearJustPressed() {
  for (const k in keysJustPressed) keysJustPressed[k] = false;
}

// ─────────────────────────────────────────────
// §11  UTILITY FUNCTIONS
// ─────────────────────────────────────────────
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randF(a, b) { return Math.random() * (b - a) + a; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function lerpColor(hexA, hexB, t) {
  const parse = h => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = parse(hexA), b = parse(hexB);
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px < rx + rw && py >= ry && py < ry + rh;
}

function tileAt(map, px, py) {
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return 3; // out-of-bounds = wall
  return map[ty][tx];
}

function isSolid(tile) {
  return tile === 2 || tile === 3 || tile === 6 || tile === 7;
}

// === END PART 1 ===
// === PART 2: MAP, NPCS, CRIMES, QUESTS ===

// ─────────────────────────────────────────────
// §A  TOWN GENERATION
// ─────────────────────────────────────────────

function generateTown() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    map[y] = new Uint8Array(MAP_W);
    // fill with sand (0)
  }

  // --- Main roads: horizontal y=28-31, vertical x=38-41 ---
  for (let y = 28; y <= 31; y++) {
    for (let x = 0; x < MAP_W; x++) map[y][x] = 1;
  }
  for (let x = 38; x <= 41; x++) {
    for (let y = 0; y < MAP_H; y++) map[y][x] = 1;
  }

  // --- Secondary roads ---
  const secHoriz = [[15, 16], [43, 44]];
  const secVert  = [[20, 21], [58, 59]];
  for (const pair of secHoriz) {
    for (const y of pair) {
      for (let x = 0; x < MAP_W; x++) map[y][x] = 1;
    }
  }
  for (const pair of secVert) {
    for (const x of pair) {
      for (let y = 0; y < MAP_H; y++) map[y][x] = 1;
    }
  }

  // --- Buildings ---
  const buildings = [];

  const bldgDefs = [
    { type: BUILDING_TYPES.SHERIFF,    name: "Sheriff's Office", x: 10, y: 8,  w: 8,  h: 6 },
    { type: BUILDING_TYPES.SALOON,     name: 'Saloon',           x: 24, y: 7,  w: 10, h: 7 },
    { type: BUILDING_TYPES.BANK,       name: 'Bank',             x: 44, y: 8,  w: 8,  h: 6 },
    { type: BUILDING_TYPES.GENERAL,    name: 'General Store',    x: 55, y: 8,  w: 8,  h: 5 },
    { type: BUILDING_TYPES.JAIL,       name: 'Jail',             x: 10, y: 34, w: 7,  h: 6 },
    { type: BUILDING_TYPES.CHURCH,     name: 'Church',           x: 24, y: 34, w: 8,  h: 8 },
    { type: BUILDING_TYPES.STABLE,     name: 'Stable',           x: 44, y: 34, w: 10, h: 6 },
    { type: BUILDING_TYPES.HOTEL,      name: 'Hotel',            x: 55, y: 34, w: 8,  h: 7 },
    { type: BUILDING_TYPES.BLACKSMITH, name: 'Blacksmith',       x: 65, y: 8,  w: 7,  h: 5 },
    { type: BUILDING_TYPES.HOUSE,      name: 'House 1',          x: 10, y: 47, w: 6,  h: 5 },
    { type: BUILDING_TYPES.HOUSE,      name: 'House 2',          x: 24, y: 47, w: 6,  h: 5 },
    { type: BUILDING_TYPES.HOUSE,      name: 'House 3',          x: 44, y: 47, w: 6,  h: 5 },
    { type: BUILDING_TYPES.WELL,       name: 'Well',             x: 39, y: 24, w: 3,  h: 3 },
    { type: BUILDING_TYPES.GALLOWS,    name: 'Gallows',          x: 34, y: 34, w: 4,  h: 4 },
  ];

  for (const def of bldgDefs) {
    const bx = def.x, by = def.y, bw = def.w, bh = def.h;

    // walls around perimeter, wood floor inside
    for (let dy = 0; dy < bh; dy++) {
      for (let dx = 0; dx < bw; dx++) {
        const tx = bx + dx, ty = by + dy;
        if (tx >= MAP_W || ty >= MAP_H) continue;
        if (dy === 0 || dy === bh - 1 || dx === 0 || dx === bw - 1) {
          map[ty][tx] = 3; // wall
        } else {
          map[ty][tx] = 8; // wood floor
        }
      }
    }

    // door at bottom-center
    const doorX = bx + Math.floor(bw / 2);
    const doorY = by + bh - 1;
    if (doorX < MAP_W && doorY < MAP_H) {
      map[doorY][doorX] = 4; // door
    }

    buildings.push({
      type: def.type,
      name: def.name,
      w: bw,
      h: bh,
      x: bx,
      y: by,
      doorX: doorX,
      doorY: doorY,
    });
  }

  // --- Fences around stable ---
  const stable = buildings.find(b => b.type === BUILDING_TYPES.STABLE);
  if (stable) {
    const fx1 = stable.x - 1, fy1 = stable.y - 1;
    const fx2 = stable.x + stable.w, fy2 = stable.y + stable.h;
    for (let x = fx1; x <= fx2; x++) {
      if (x >= 0 && x < MAP_W) {
        if (fy1 >= 0 && fy1 < MAP_H && map[fy1][x] === 0) map[fy1][x] = 10;
        if (fy2 >= 0 && fy2 < MAP_H && map[fy2][x] === 0) map[fy2][x] = 10;
      }
    }
    for (let y = fy1; y <= fy2; y++) {
      if (y >= 0 && y < MAP_H) {
        if (fx1 >= 0 && fx1 < MAP_W && map[y][fx1] === 0) map[y][fx1] = 10;
        if (fx2 >= 0 && fx2 < MAP_W && map[y][fx2] === 0) map[y][fx2] = 10;
      }
    }
    // gate opening at front-center
    const gateX = stable.doorX;
    if (fy2 >= 0 && fy2 < MAP_H && gateX >= 0 && gateX < MAP_W) {
      map[fy2][gateX] = 1;
    }
  }

  // --- Scatter 60 cacti on sand ---
  let placed = 0;
  while (placed < 60) {
    const cx = rand(1, MAP_W - 2);
    const cy = rand(1, MAP_H - 2);
    if (map[cy][cx] === 0) {
      map[cy][cx] = 6; // cactus
      placed++;
    }
  }

  // --- Scatter 40 rocks on sand ---
  placed = 0;
  while (placed < 40) {
    const rx = rand(1, MAP_W - 2);
    const ry = rand(1, MAP_H - 2);
    if (map[ry][rx] === 0) {
      map[ry][rx] = 7; // rock
      placed++;
    }
  }

  // --- Clear rocks/cacti in front of building doors ---
  for (const b of buildings) {
    for (let dy = -1; dy <= 2; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cy = b.doorY + dy, cx = b.doorX + dx;
        if (cy >= 0 && cy < MAP_H && cx >= 0 && cx < MAP_W) {
          if (map[cy][cx] === 6 || map[cy][cx] === 7) map[cy][cx] = 0;
        }
      }
    }
  }

  // --- Pond at (70,50) radius 3, with grass border ---
  const pondCX = 70, pondCY = 50, pondR = 3;
  for (let dy = -pondR - 1; dy <= pondR + 1; dy++) {
    for (let dx = -pondR - 1; dx <= pondR + 1; dx++) {
      const px = pondCX + dx, py = pondCY + dy;
      if (px < 0 || px >= MAP_W || py < 0 || py >= MAP_H) continue;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= pondR) {
        map[py][px] = 5; // water
      } else if (d <= pondR + 1.5 && map[py][px] === 0) {
        map[py][px] = 9; // grass
      }
    }
  }

  // --- Train tracks at y=54-55 ---
  for (let x = 0; x < MAP_W; x++) {
    if (map[54][x] === 0 || map[54][x] === 1) map[54][x] = 11;
    if (map[55][x] === 0 || map[55][x] === 1) map[55][x] = 11;
  }

  return { map: map, buildings: buildings };
}

// ─────────────────────────────────────────────
// §B  NPC SYSTEM
// ─────────────────────────────────────────────

const NPC_NAMES = {
  townsperson: [
    'Earl', 'Martha', 'Jeb', 'Clara', 'Hank', 'Abigail', 'Roscoe', 'Ellie',
    'Virgil', 'Daisy', 'Cletus', 'Mabel', 'Otis', 'Sadie', 'Luther', 'Prudence',
    'Floyd', 'Nettie', 'Gus', 'Hattie', 'Wilbur', 'Opal', 'Chester', 'Birdie',
  ],
  outlaw: [
    'Snake', 'Rattler', 'Coyote', 'Buzzard', 'Scar', 'Viper', 'Jackal', 'Fang',
    'Crow', 'Grim', 'Bones', 'Dusty', 'Reno', 'Blaze', 'Copper', 'Slade',
    'Dagger', 'Flint', 'Slash', 'Rook', 'Bane', 'Spike',
  ],
  stranger: [
    'The Drifter', 'The Stranger', 'Shadow', 'Whisper', 'No-Name', 'The Ghost',
    'Silent Jack', 'Pale Rider', 'The Wanderer', 'Tombstone', 'Phantom', 'Ash',
    'The Revenant', 'Dustwalker', 'The Nomad', 'Wraith', 'Holloway', 'Graves',
    'Dusk', 'The Vagrant', 'Cipher', 'Zero',
  ],
};

const DIALOGS = {
  townsperson: {
    idle: [
      "Fine day, ain't it, Sheriff?",
      "Watch yourself out there, law man.",
      "My crops ain't doin' so good this year.",
      "Thank the lord we got a sheriff in this town.",
      "The well water's been tastin' funny lately.",
      "You keepin' this town safe? Sure feels like it.",
      "Good to see you makin' your rounds, Sheriff.",
    ],
    // These only trigger when the claim is true (checked at dialog open time)
    threat_hints: [
      "I heard there's trouble brewin' at the {place}.",
      "I saw some shady characters near the {place}.",
      "Heard tell of outlaws roamin' near the {place}.",
      "Somebody's hidin' somethin' behind the {place}, I swear it.",
      "A crime boss was spotted near the {place}. Watch yourself!",
      "Saw someone tryin' to escape near the {place}!",
    ],
    crime: [
      "Sheriff! There's trouble! You gotta help!",
      "Outlaws! They got guns! Do somethin'!",
      "For the love of God, Sheriff, save us!",
      "I saw 'em run toward the bank! Hurry!",
      "They're shootin' up the place! Help!",
    ],
    repHigh: [
      "You're the best sheriff we ever had!",
      "My children look up to you, Sheriff.",
      "This town is blessed to have you.",
    ],
    repLow: [
      "You ain't doin' much for this town, are ya?",
      "Some sheriff you turned out to be...",
      "Maybe we need a new law man around here.",
    ],
  },

  bartender: {
    idle: [
      "What'll it be, Sheriff? Whiskey's on the house.",
      "Belly up to the bar, partner.",
      "Things have been mighty rowdy in here lately.",
      "I water down the drinks for the mean ones.",
      "You look like you could use a stiff one.",
      "Business is boomin'... mostly fights though.",
      "The piano player quit. Shame, that.",
      "Don't mind the bullet holes. Character, I say.",
    ],
    tips: [
      "Word is {name} been actin' suspicious near the {place}.",
      "I overheard some fellas talkin' about hittin' the {place}.",
      "Keep your eye on {name}. Somethin' ain't right.",
      "Saw {name} hidin' somethin' behind the {place}.",
      "A stranger was askin' about the {place}'s layout.",
    ],
  },

  outlaw: {
    hostile: [
      "You ain't takin' me alive, Sheriff!",
      "Draw, you yellow-bellied tin star!",
      "This town ain't big enough for both of us!",
      "I'll put you in a pine box!",
      "You're gonna regret wearin' that badge!",
      "Say your prayers, law dog!",
      "I've killed better men than you!",
      "Your badge won't stop a bullet!",
    ],
    surrender: [
      "Alright, alright! I give up! Don't shoot!",
      "I surrender! Just... just don't hurt me!",
      "You win, Sheriff. I'm done runnin'.",
      "Take me to jail. I ain't got no fight left.",
    ],
  },

  mayor: {
    idle: [
      "Sheriff, the town council appreciates your service.",
      "We need law and order to prosper.",
      "The governor is watching our little town.",
      "I've got political ambitions, Sheriff. Keep things clean.",
      "Revenue is up since you started keepin' the peace.",
      "The townspeople are countin' on us both.",
    ],
    quest: [
      "Sheriff, I have a task that requires your... expertise.",
      "There's a matter of some delicacy I need handled.",
      "The town needs you for a special assignment.",
    ],
  },

  shopkeeper: {
    idle: [
      "Got fresh supplies in just this mornin'.",
      "Prices are fair, Sheriff. No gougin' here.",
      "Need ammo? Tonics? I got it all.",
      "Business is steady. Outlaws are good for sales, oddly.",
      "Best goods this side of the Pecos.",
    ],
  },

  deputy: {
    idle: [
      "Ready for duty, Sheriff.",
      "All quiet on my end, boss.",
      "I'll keep an eye on the jail.",
      "Need backup? Just say the word.",
      "Prisoners are fed and accounted for.",
    ],
  },

  banker: {
    idle: [
      "The vault is secure, Sheriff. For now.",
      "Gold shipment coming in next week.",
      "Interest rates are holding steady.",
      "We've had some... concerning visitors lately.",
      "Your account is in good standing, Sheriff.",
    ],
  },

  preacher: {
    idle: [
      "The Lord watches over this town, Sheriff.",
      "Come to Sunday service. It'll do your soul good.",
      "I pray for the souls of those outlaws.",
      "Peace be upon you, Sheriff.",
      "Even in the desert, there is grace.",
    ],
  },

  stranger: {
    idle: [
      "...I've seen things out there in the desert.",
      "Don't ask where I came from. It don't matter.",
      "This town... it reminds me of another. Before the fire.",
      "You got a look about you, Sheriff. Seen it before.",
      "I ain't lookin' for trouble. Trouble finds me.",
      "Keep your friends close, Sheriff. And your gun closer.",
      "The desert takes everything eventually.",
      "I'll be movin' on soon. Maybe.",
    ],
  },
};

function getNPCColors(type) {
  const variations = {
    townsperson: [
      { hat: '#5a4a2a', shirt: '#8b6b4b', pants: '#4a4a6a', skin: '#d4a574' },
      { hat: '#3a3a3a', shirt: '#6a3a2a', pants: '#4a3a2a', skin: '#c49464' },
      { hat: '#7a5a30', shirt: '#4a6a4a', pants: '#5a4a3a', skin: '#e8c8a0' },
      { hat: '#4a3020', shirt: '#8a4a3a', pants: '#3a3a5a', skin: '#b8844a' },
      { hat: '#6a4a28', shirt: '#5a5a7a', pants: '#4a4a4a', skin: '#d4a574' },
    ],
    outlaw: [
      { hat: '#1a1a1a', shirt: '#2a2a2a', pants: '#1a1a2a', skin: '#c49464', bandana: '#8b0000' },
      { hat: '#2a1a0a', shirt: '#3a2a1a', pants: '#2a2a2a', skin: '#d4a574', bandana: '#600000' },
      { hat: '#0a0a0a', shirt: '#1a1a1a', pants: '#0a0a1a', skin: '#b8844a', bandana: '#aa2020' },
    ],
    bartender: [
      { hat: '#4a3020', shirt: '#ffffff', pants: '#2a2a2a', skin: '#d4a574', apron: '#c8c8c8' },
    ],
    shopkeeper: [
      { hat: '#6a5a3a', shirt: '#7a6a4a', pants: '#4a4a4a', skin: '#d4a574', apron: '#8a7a5a' },
    ],
    mayor: [
      { hat: '#1a1a1a', shirt: '#2a2a4a', pants: '#1a1a1a', skin: '#d4a574', vest: '#8b0000' },
    ],
    deputy: [
      { hat: '#4a3a1a', shirt: '#6a5a3a', pants: '#4a4a5a', skin: '#c49464', badge: '#ffd700' },
    ],
    banker: [
      { hat: '#2a2a2a', shirt: '#3a3a5a', pants: '#2a2a2a', skin: '#e8c8a0', vest: '#4a4a4a' },
    ],
    preacher: [
      { hat: '#1a1a1a', shirt: '#1a1a1a', pants: '#1a1a1a', skin: '#d4a574', collar: '#ffffff' },
    ],
    stranger: [
      { hat: '#2a2010', shirt: '#4a3a2a', pants: '#3a3020', skin: '#b8844a', cloak: '#3a2a1a' },
      { hat: '#1a1a1a', shirt: '#2a2a2a', pants: '#1a1a1a', skin: '#c49464', cloak: '#1a1a2a' },
    ],
    bounty: [
      { hat: '#1a0a0a', shirt: '#3a1a1a', pants: '#2a1a0a', skin: '#c49464', bandana: '#660000' },
    ],
  };
  const pool = variations[type] || variations.townsperson;
  return pool[rand(0, pool.length - 1)];
}

function createNPC(id, type, name, tileX, tileY, building) {
  const personalities = ['friendly', 'grumpy', 'nervous', 'suspicious'];
  return {
    id: id,
    type: type,
    name: name,
    x: tileX * TILE + TILE / 2,
    y: tileY * TILE + TILE / 2,
    homeX: tileX * TILE + TILE / 2,
    homeY: tileY * TILE + TILE / 2,
    building: building,
    dir: rand(0, 3), // 0=down,1=up,2=left,3=right
    state: 'idle',
    moveTimer: rand(60, 180),
    animFrame: 0,
    animTimer: 0,
    hp: type === NPC_TYPES.OUTLAW || type === NPC_TYPES.BOUNTY ? 4 : 3,
    maxHp: type === NPC_TYPES.OUTLAW || type === NPC_TYPES.BOUNTY ? 4 : 3,
    hostile: false,
    surrendered: false,
    speed: type === NPC_TYPES.OUTLAW ? OUTLAW_SPEED : NPC_SPEED,
    dialogCooldown: 0,
    personality: personalities[rand(0, personalities.length - 1)],
    relationship: 50,
    colors: getNPCColors(type),
    schedule: [],
    lastDialogIndex: -1,
    visible: true,
    arrested: false,
    dead: false,
    fleeing: false,
    targetX: 0,
    targetY: 0,
    pathTimer: 0,
    awareness: 0,
    weapon: type === NPC_TYPES.OUTLAW || type === NPC_TYPES.BOUNTY ? 'pistol' : null,
    shootCooldown: 0,
    wanderRadius: building ? 3 * TILE : 6 * TILE,
  };
}

function generateNPCs(buildings) {
  const npcs = [];
  let npcId = 0;

  // --- Fixed building NPCs ---

  // Bartender in Saloon
  const saloon = buildings.find(b => b.type === BUILDING_TYPES.SALOON);
  if (saloon) {
    const npc = createNPC(npcId++, NPC_TYPES.BARTENDER, 'Barkeep Bill', saloon.x + 3, saloon.y + 2, saloon);
    npc.questGiver = true;
    npc.schedule = [
      { startHour: 8, endHour: 2, buildingType: BUILDING_TYPES.SALOON },
    ];
    npcs.push(npc);
  }

  // Shopkeeper in General Store
  const general = buildings.find(b => b.type === BUILDING_TYPES.GENERAL);
  if (general) {
    const npc = createNPC(npcId++, NPC_TYPES.SHOPKEEPER, 'Merchant Mae', general.x + 3, general.y + 2, general);
    npc.schedule = [
      { startHour: 7, endHour: 19, buildingType: BUILDING_TYPES.GENERAL },
    ];
    npcs.push(npc);
  }

  // Deputy in Sheriff's Office
  const sheriff = buildings.find(b => b.type === BUILDING_TYPES.SHERIFF);
  if (sheriff) {
    const npc = createNPC(npcId++, NPC_TYPES.DEPUTY, 'Deputy Dan', sheriff.x + 3, sheriff.y + 2, sheriff);
    npc.schedule = [
      { startHour: 6, endHour: 18, buildingType: BUILDING_TYPES.SHERIFF },
      { startHour: 18, endHour: 22, buildingType: BUILDING_TYPES.SALOON },
    ];
    npcs.push(npc);
  }

  // Banker in Bank
  const bank = buildings.find(b => b.type === BUILDING_TYPES.BANK);
  if (bank) {
    const npc = createNPC(npcId++, NPC_TYPES.BANKER, 'Banker Beauregard', bank.x + 3, bank.y + 2, bank);
    npc.schedule = [
      { startHour: 8, endHour: 17, buildingType: BUILDING_TYPES.BANK },
    ];
    npcs.push(npc);
  }

  // Preacher in Church
  const church = buildings.find(b => b.type === BUILDING_TYPES.CHURCH);
  if (church) {
    const npc = createNPC(npcId++, NPC_TYPES.PREACHER, 'Reverend Josiah', church.x + 3, church.y + 3, church);
    npc.schedule = [
      { startHour: 6, endHour: 21, buildingType: BUILDING_TYPES.CHURCH },
    ];
    npcs.push(npc);
  }

  // Blacksmith shopkeeper
  const blacksmith = buildings.find(b => b.type === BUILDING_TYPES.BLACKSMITH);
  if (blacksmith) {
    const npc = createNPC(npcId++, NPC_TYPES.SHOPKEEPER, 'Iron Mike', blacksmith.x + 3, blacksmith.y + 2, blacksmith);
    npc.schedule = [
      { startHour: 6, endHour: 20, buildingType: BUILDING_TYPES.BLACKSMITH },
    ];
    npcs.push(npc);
  }

  // --- Mayor ---
  const hotel = buildings.find(b => b.type === BUILDING_TYPES.HOTEL);
  if (hotel) {
    const npc = createNPC(npcId++, NPC_TYPES.MAYOR, 'Mayor Whitfield', hotel.x + 3, hotel.y + 3, hotel);
    npc.questGiver = true;
    npc.schedule = [
      { startHour: 9, endHour: 12, buildingType: BUILDING_TYPES.HOTEL },
      { startHour: 12, endHour: 17, buildingType: BUILDING_TYPES.SHERIFF },
      { startHour: 17, endHour: 21, buildingType: BUILDING_TYPES.SALOON },
    ];
    npcs.push(npc);
  }

  // --- Stranger ---
  const strangerNames = NPC_NAMES.stranger;
  const sName = strangerNames[rand(0, strangerNames.length - 1)];
  const strangerNPC = createNPC(npcId++, NPC_TYPES.STRANGER, sName, 60, 30, null);
  strangerNPC.schedule = [
    { startHour: 20, endHour: 6, buildingType: BUILDING_TYPES.SALOON },
  ];
  npcs.push(strangerNPC);

  // --- 15 Townspeople scattered around town ---
  const townNames = NPC_NAMES.townsperson.slice();
  const houses = buildings.filter(b => b.type === BUILDING_TYPES.HOUSE);

  for (let i = 0; i < 15; i++) {
    const nameIdx = rand(0, townNames.length - 1);
    const tName = townNames.splice(nameIdx, 1)[0] || ('Townsfolk ' + i);

    // Place near roads or buildings
    let tx, ty;
    if (i < houses.length) {
      tx = houses[i].x + rand(1, houses[i].w - 2);
      ty = houses[i].y + rand(1, houses[i].h - 2);
    } else {
      // scatter along roads
      const roadChoice = rand(0, 3);
      if (roadChoice === 0) { tx = rand(2, MAP_W - 3); ty = rand(28, 31); }
      else if (roadChoice === 1) { tx = rand(38, 41); ty = rand(2, MAP_H - 3); }
      else if (roadChoice === 2) { tx = rand(2, MAP_W - 3); ty = rand(15, 16); }
      else { tx = rand(2, MAP_W - 3); ty = rand(43, 44); }
    }

    const home = i < houses.length ? houses[i] : null;
    const npc = createNPC(npcId++, NPC_TYPES.TOWNSPERSON, tName, tx, ty, home);
    npc.schedule = [
      { startHour: 7, endHour: 12, buildingType: BUILDING_TYPES.GENERAL },
      { startHour: 12, endHour: 18, buildingType: null }, // wander
      { startHour: 18, endHour: 22, buildingType: BUILDING_TYPES.SALOON },
      { startHour: 22, endHour: 7, buildingType: BUILDING_TYPES.HOUSE },
    ];
    npcs.push(npc);
  }

  return npcs;
}

// ─────────────────────────────────────────────
// §C  CRIME SYSTEM
// ─────────────────────────────────────────────

const CRIME_TYPES = [
  {
    name: 'Bank Robbery',
    buildingType: BUILDING_TYPES.BANK,
    severity: 5,
    desc: 'Outlaws are robbing the bank! Stop them before they crack the vault!',
    repGain: 15,
    repLoss: 12,
    goldReward: 80,
    outlawCount: 3,
    mechanic: 'timed_vault',
  },
  {
    name: 'Bar Fight',
    buildingType: BUILDING_TYPES.SALOON,
    severity: 2,
    desc: 'A violent brawl has broken out in the saloon!',
    repGain: 5,
    repLoss: 3,
    goldReward: 20,
    outlawCount: 2,
    mechanic: 'standard',
  },
  {
    name: 'Horse Theft',
    buildingType: BUILDING_TYPES.STABLE,
    severity: 3,
    desc: 'Someone is stealing horses from the stable! Chase them down!',
    repGain: 8,
    repLoss: 6,
    goldReward: 40,
    outlawCount: 1,
    mechanic: 'chase',
  },
  {
    name: 'Shootout',
    buildingType: null,
    severity: 4,
    desc: 'Outlaws are having a shootout in the street!',
    repGain: 12,
    repLoss: 10,
    goldReward: 60,
    outlawCount: 3,
    mechanic: 'standard',
  },
  {
    name: 'Store Holdup',
    buildingType: BUILDING_TYPES.GENERAL,
    severity: 3,
    desc: 'Armed bandits are holding up the general store!',
    repGain: 8,
    repLoss: 6,
    goldReward: 35,
    outlawCount: 2,
    mechanic: 'standard',
  },
  {
    name: 'Jail Break',
    buildingType: BUILDING_TYPES.JAIL,
    severity: 4,
    desc: 'Prisoners are attempting to break out of jail!',
    repGain: 12,
    repLoss: 10,
    goldReward: 50,
    outlawCount: 4,
    mechanic: 'waves',
  },
  {
    name: 'Kidnapping',
    buildingType: BUILDING_TYPES.HOUSE,
    severity: 4,
    desc: 'A townsperson has been kidnapped! Rescue them before it is too late!',
    repGain: 14,
    repLoss: 12,
    goldReward: 65,
    outlawCount: 2,
    mechanic: 'hostage',
  },
  {
    name: 'Arson',
    buildingType: BUILDING_TYPES.HOTEL,
    severity: 4,
    desc: 'Someone set the hotel on fire! Put out the flames and catch the arsonist!',
    repGain: 13,
    repLoss: 10,
    goldReward: 55,
    outlawCount: 1,
    mechanic: 'fire',
  },
  {
    name: 'Stagecoach Robbery',
    buildingType: null,
    severity: 3,
    desc: 'Bandits are attacking the incoming stagecoach on the main road!',
    repGain: 10,
    repLoss: 8,
    goldReward: 45,
    outlawCount: 3,
    mechanic: 'chase',
  },
  {
    name: 'Assassination',
    buildingType: BUILDING_TYPES.HOTEL,
    severity: 5,
    desc: 'An assassin is targeting someone important in town!',
    repGain: 16,
    repLoss: 14,
    goldReward: 90,
    outlawCount: 1,
    mechanic: 'standard',
  },
];

function generateCrime(buildings, gameState) {
  // pick a crime type weighted by day and difficulty
  const day = gameState.day || 1;
  const maxSeverity = Math.min(5, 2 + Math.floor(day / 3));

  // filter crimes by severity the player can handle
  const eligible = CRIME_TYPES.filter(c => c.severity <= maxSeverity);
  const crime = eligible[rand(0, eligible.length - 1)];

  // find target building
  let targetBuilding = null;
  if (crime.buildingType !== null) {
    const candidates = buildings.filter(b => b.type === crime.buildingType);
    if (candidates.length > 0) {
      targetBuilding = candidates[rand(0, candidates.length - 1)];
    }
  }

  // if no building, pick a road location
  let crimeX, crimeY;
  if (targetBuilding) {
    crimeX = targetBuilding.doorX;
    crimeY = targetBuilding.doorY;
  } else {
    // spawn on main road intersection area
    crimeX = rand(30, 50);
    crimeY = rand(25, 35);
  }

  // generate outlaw names
  const outlawPool = NPC_NAMES.outlaw.slice();
  const outlaws = [];
  for (let i = 0; i < crime.outlawCount; i++) {
    const idx = rand(0, outlawPool.length - 1);
    outlaws.push(outlawPool.splice(idx, 1)[0]);
  }

  // time limit based on mechanic
  let timeLimit = CRIME_RESOLVE_TIME;
  if (crime.mechanic === 'timed_vault') timeLimit = 90;
  else if (crime.mechanic === 'fire') timeLimit = 60;
  else if (crime.mechanic === 'hostage') timeLimit = 100;
  else if (crime.mechanic === 'chase') timeLimit = 80;

  return {
    type: crime,
    building: targetBuilding,
    x: crimeX * TILE + TILE / 2,
    y: crimeY * TILE + TILE / 2,
    outlawNames: outlaws,
    outlawNPCs: [], // filled when spawned
    timeLimit: timeLimit,
    timeRemaining: timeLimit,
    started: false,
    resolved: false,
    failed: false,
    mechanic: crime.mechanic,
    mechanicState: {}, // extra state per mechanic (vault progress, fire tiles, etc.)
    spawnTime: Date.now(),
  };
}

// ─────────────────────────────────────────────
// §D  QUEST SYSTEM
// ─────────────────────────────────────────────

const QUEST_TEMPLATES = [
  {
    name: 'Town Patrol',
    desc: 'Walk the streets and visit {count} buildings to ensure order.',
    type: 'patrol',
    repReward: 5,
    goldReward: 15,
    targets: 4,
  },
  {
    name: 'Collect Taxes',
    desc: 'Visit {count} businesses and collect their weekly taxes.',
    type: 'collect_taxes',
    repReward: 4,
    goldReward: 30,
    targets: 3,
  },
  {
    name: 'Bounty Hunt',
    desc: 'Track down and capture the wanted outlaw: {target}.',
    type: 'bounty',
    repReward: 12,
    goldReward: 60,
    targets: 1,
  },
  {
    name: 'Escort Duty',
    desc: 'Escort {target} safely from the {start} to the {end}.',
    type: 'escort',
    repReward: 8,
    goldReward: 35,
    targets: 1,
  },
  {
    name: 'Night Watch',
    desc: 'Patrol the town between dusk and dawn. Keep the peace through the night.',
    type: 'nightwatch',
    repReward: 7,
    goldReward: 25,
    targets: 0,
  },
  {
    name: 'Investigation',
    desc: 'Investigate suspicious activity. Talk to {count} witnesses for clues.',
    type: 'investigation',
    repReward: 6,
    goldReward: 20,
    targets: 3,
  },
  {
    name: 'Defend the Town',
    desc: 'A gang raid is coming. Prepare defenses and repel {count} waves of attackers.',
    type: 'defend',
    repReward: 15,
    goldReward: 75,
    targets: 3,
  },
  {
    name: 'Poker Tournament',
    desc: 'Enter the saloon poker tournament and win {count} hands.',
    type: 'poker_tournament',
    repReward: 3,
    goldReward: 50,
    targets: 3,
  },
];

const WANTED_OUTLAWS = [
  {
    name: 'Black Bart',
    desc: 'Notorious stagecoach robber. Wears all black. Armed and extremely dangerous.',
    bounty: 100,
    danger: 5,
    hp: 8,
  },
  {
    name: 'Dynamite Dolly',
    desc: 'Explosives expert. Wanted for blowing up three banks across the territory.',
    bounty: 120,
    danger: 5,
    hp: 6,
  },
  {
    name: 'Iron Tom McGraw',
    desc: 'Former blacksmith turned killer. Massive build. Crushes men with bare hands.',
    bounty: 90,
    danger: 4,
    hp: 10,
  },
  {
    name: 'Sidewinder Pete',
    desc: 'Snake-fast draw. Never been beaten in a fair fight. Prefers unfair ones.',
    bounty: 110,
    danger: 5,
    hp: 6,
  },
  {
    name: 'Red Mary',
    desc: 'Leads a gang of cattle rustlers. Deadly shot with a Winchester rifle.',
    bounty: 80,
    danger: 4,
    hp: 7,
  },
  {
    name: 'El Diablo',
    desc: 'Mexican outlaw who crossed the border. Wanted for murder and robbery.',
    bounty: 130,
    danger: 5,
    hp: 9,
  },
  {
    name: 'Doc Hollister',
    desc: 'Disgraced doctor turned poisoner. Charming but absolutely ruthless.',
    bounty: 70,
    danger: 3,
    hp: 5,
  },
  {
    name: 'One-Eye Jack',
    desc: 'Lost an eye in a knife fight. Swore revenge on all lawmen. Carries a sawed-off.',
    bounty: 95,
    danger: 4,
    hp: 7,
  },
];

// === END PART 2 ===
// === PART 3: RENDERING ===

// ─────────────────────────────────────────────
// §A  CANVAS SETUP
// ─────────────────────────────────────────────
const gameCanvas = document.getElementById('gameCanvas');
const canvas = gameCanvas; // alias used by Parts 4-5
const ctx = gameCanvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const mmCtx = minimapCanvas.getContext('2d');

function resizeCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─────────────────────────────────────────────
// §B  PARTICLE SYSTEM
// ─────────────────────────────────────────────
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, color, speed, life) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: life * (0.5 + Math.random() * 0.5),
        maxLife: life,
        color: color,
        size: 1 + Math.random() * 2,
        gravity: 0
      });
    }
  }

  emitDust(x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.3 + Math.random() * 0.6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.3,
        life: 20 + Math.random() * 20,
        maxLife: 40,
        color: PALETTE.sand,
        size: 1 + Math.random() * 2,
        gravity: 0.01
      });
    }
  }

  emitBlood(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 2.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 30 + Math.random() * 30,
        maxLife: 60,
        color: PALETTE.blood,
        size: 1.5 + Math.random() * 2,
        gravity: 0.08
      });
    }
  }

  emitSpark(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        life: 10 + Math.random() * 15,
        maxLife: 25,
        color: '#ffcc00',
        size: 1 + Math.random(),
        gravity: 0.05
      });
    }
  }

  emitSmoke(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.4 - Math.random() * 0.5,
        life: 40 + Math.random() * 40,
        maxLife: 80,
        color: '#888888',
        size: 2 + Math.random() * 3,
        gravity: -0.01
      });
    }
  }

  emitMuzzleFlash(x, y, dir) {
    for (let i = 0; i < 10; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const angle = dir + spread;
      const spd = 2 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 4 + Math.random() * 6,
        maxLife: 10,
        color: i < 5 ? '#ffcc00' : '#ff8800',
        size: 1.5 + Math.random() * 2,
        gravity: 0
      });
    }
    // white core flash
    this.particles.push({
      x: x + Math.cos(dir) * 6,
      y: y + Math.sin(dir) * 6,
      vx: 0, vy: 0,
      life: 3, maxLife: 3,
      color: '#ffffff',
      size: 5,
      gravity: 0
    });
  }

  emitTumbleweed(x, y) {
    this.particles.push({
      x: x,
      y: y,
      vx: 0.8 + Math.random() * 1.2,
      vy: (Math.random() - 0.5) * 0.3,
      life: 300 + Math.random() * 200,
      maxLife: 500,
      color: PALETTE.tumbleweed || '#a89060',
      size: 6 + Math.random() * 4,
      gravity: 0,
      isTumbleweed: true,
      rotation: 0,
      rotSpeed: 0.05 + Math.random() * 0.05
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.isTumbleweed) {
        p.rotation += p.rotSpeed;
        p.vy += Math.sin(p.life * 0.1) * 0.02;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, camX, camY) {
    for (const p of this.particles) {
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      const sx = p.x - camX;
      const sy = p.y - camY;
      if (sx < -20 || sx > gameCanvas.width + 20 || sy < -20 || sy > gameCanvas.height + 20) continue;
      ctx.globalAlpha = alpha;
      if (p.isTumbleweed) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-p.size / 3, -p.size / 4);
        ctx.lineTo(p.size / 3, p.size / 4);
        ctx.moveTo(p.size / 3, -p.size / 4);
        ctx.lineTo(-p.size / 3, p.size / 4);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────
// §C  BULLET SYSTEM
// ─────────────────────────────────────────────
class BulletSystem {
  constructor() {
    this.bullets = [];
  }

  fire(x, y, dir, fromPlayer, type) {
    type = type || 'revolver';
    if (type === 'shotgun') {
      for (let i = -1; i <= 1; i++) {
        const spread = i * SHOTGUN_SPREAD;
        this.bullets.push({
          x: x, y: y,
          vx: Math.cos(dir + spread) * BULLET_SPEED,
          vy: Math.sin(dir + spread) * BULLET_SPEED,
          fromPlayer: fromPlayer,
          type: type,
          life: 18,
          maxLife: 18,
          damage: 2
        });
      }
    } else if (type === 'rifle') {
      this.bullets.push({
        x: x, y: y,
        vx: Math.cos(dir) * (BULLET_SPEED * 1.5),
        vy: Math.sin(dir) * (BULLET_SPEED * 1.5),
        fromPlayer: fromPlayer,
        type: type,
        life: 40,
        maxLife: 40,
        damage: 4
      });
    } else {
      this.bullets.push({
        x: x, y: y,
        vx: Math.cos(dir) * BULLET_SPEED,
        vy: Math.sin(dir) * BULLET_SPEED,
        fromPlayer: fromPlayer,
        type: type,
        life: 35,
        maxLife: 35,
        damage: 2
      });
    }
  }

  update(npcs, player, particles, gameState, map) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Wall collision
      const tx = Math.floor(b.x / TILE);
      const ty = Math.floor(b.y / TILE);
      if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
        const tile = map[ty][tx];
        if (tile === 3 || tile === 10) {
          particles.emitSpark(b.x, b.y);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Out of bounds
      if (b.x < 0 || b.x > WORLD_W || b.y < 0 || b.y > WORLD_H || b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Player bullet hitting NPCs
      if (b.fromPlayer) {
        let hit = false;
        for (const npc of npcs) {
          if (npc.state === 'dead' || npc.state === 'arrested') continue;
          const isHostile = npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY || npc.hostile;
          // Cheat mode: bullets pass through innocents
          if (gameState._cheatMode && !isHostile) continue;
          // Larger hit radius for more reliable hits (20px)
          if (dist(b, npc) < 20) {
            npc.hp = (npc.hp || 3) - b.damage;
            particles.emitBlood(npc.x, npc.y);
            if (typeof triggerShake === 'function') triggerShake(3, 5);
            hit = true;
            // Track last NPC the player hit — bodyguards will assist
            gameState._playerLastHitNPC = npc;
            gameState._playerLastHitTime = Date.now();
            if (npc.hp <= 0) {
              npc.state = 'dead';
              npc.dead = true;
              if (isHostile) {
                const reward = Math.floor((10 + rand(5, 20)));
                gameState.gold = (gameState.gold || 0) + reward;
                gameState.totalGoldEarned = (gameState.totalGoldEarned || 0) + reward;
                gameState.reputation = clamp((gameState.reputation || 50) + 3, 0, REPUTATION_MAX);
                gameState.outlawsKilled = (gameState.outlawsKilled || 0) + 1;
                gameState.totalHits = (gameState.totalHits || 0) + 1;
                addFloatingText(npc.x, npc.y - 20, '+$' + reward, PALETTE.gold);
                addFloatingText(npc.x, npc.y - 36, '+3 REP', '#44ff44');
              } else {
                // Killed an innocent
                gameState.reputation = clamp((gameState.reputation || 50) - 15, 0, REPUTATION_MAX);
                addFloatingText(npc.x, npc.y - 20, '-15 REP', '#ff4444');
                showNotification('You killed an innocent!', 'bad');
              }
            } else {
              gameState.stats = gameState.stats || {};
              gameState.stats.shotsHit = (gameState.stats.shotsHit || 0) + 1;
            }
            this.bullets.splice(i, 1);
            break;
          }
        }
        if (hit) continue;
      }

      // NPC bullet hitting player
      if (!b.fromPlayer && player) {
        if (dist(b, player) < 14) {
          if (gameState._cheatMode) {
            // Invincible — absorb bullet with no damage
            this.bullets.splice(i, 1);
            particles.emit(player.x, player.y, 3, '#ffd700', 2, 10);
            continue;
          }
          const dmgMult = gameState.difficulty ? gameState.difficulty.outlawDamageMult || 1 : 1;
          const dmg = Math.max(1, Math.round(b.damage * dmgMult));
          player.hp -= dmg;
          particles.emitBlood(player.x, player.y);
          if (typeof triggerShake === 'function') triggerShake(6, 10);
          this.bullets.splice(i, 1);
          if (player.hp <= 0 && !gameState._cheatMode) {
            player.hp = 0;
            player.dead = true;
          } else if (player.hp <= 0 && gameState._cheatMode) {
            player.hp = player.maxHp || 99;
          }
          continue;
        }
      }
    }
  }

  draw(ctx, camX, camY) {
    for (const b of this.bullets) {
      const sx = b.x - camX;
      const sy = b.y - camY;
      if (sx < -10 || sx > gameCanvas.width + 10 || sy < -10 || sy > gameCanvas.height + 10) continue;
      const alpha = clamp(b.life / b.maxLife, 0.3, 1);
      ctx.globalAlpha = alpha;
      // Bullet trail
      ctx.strokeStyle = b.type === 'rifle' ? '#ffaa00' : '#ffcc44';
      ctx.lineWidth = b.type === 'rifle' ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - b.vx * 2, sy - b.vy * 2);
      ctx.stroke();
      // Bullet head
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}

const particles = new ParticleSystem();
const bullets = new BulletSystem();

// ─────────────────────────────────────────────
// §D  BLOOD DECAL SYSTEM
// ─────────────────────────────────────────────
const bloodDecals = [];

function addBloodDecal(x, y) {
  bloodDecals.push({
    x: x,
    y: y,
    size: 4 + Math.random() * 8,
    life: 3600, // 60 seconds at 60fps
    maxLife: 3600
  });
}

function updateBloodDecals() {
  for (let i = bloodDecals.length - 1; i >= 0; i--) {
    bloodDecals[i].life--;
    if (bloodDecals[i].life <= 0) {
      bloodDecals.splice(i, 1);
    }
  }
}

function drawBloodDecals(ctx, camX, camY) {
  for (const d of bloodDecals) {
    const sx = d.x - camX;
    const sy = d.y - camY;
    if (sx < -20 || sx > gameCanvas.width + 20 || sy < -20 || sy > gameCanvas.height + 20) continue;
    const alpha = clamp(d.life / d.maxLife, 0, 0.6);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.blood;
    ctx.beginPath();
    ctx.ellipse(sx, sy, d.size, d.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Darker center
    ctx.fillStyle = '#550000';
    ctx.beginPath();
    ctx.ellipse(sx, sy, d.size * 0.4, d.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────
// §E  FLOATING TEXT SYSTEM
// ─────────────────────────────────────────────
const floatingTexts = [];

function addFloatingText(x, y, text, color) {
  floatingTexts.push({
    x: x,
    y: y,
    text: text,
    color: color || '#ffffff',
    life: 60,
    maxLife: 60
  });
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.8;
    ft.life--;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function drawFloatingTexts(ctx, camX, camY) {
  for (const ft of floatingTexts) {
    const sx = ft.x - camX;
    const sy = ft.y - camY;
    if (sx < -100 || sx > gameCanvas.width + 100 || sy < -50 || sy > gameCanvas.height + 50) continue;
    const alpha = clamp(ft.life / ft.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    // Shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, sx + 1, sy + 1);
    // Text
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, sx, sy);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────
// §F  SCREEN SHAKE SYSTEM
// ─────────────────────────────────────────────
const shake = { intensity: 0, duration: 0, timer: 0 };

function triggerShake(intensity, duration) {
  shake.intensity = intensity;
  shake.duration = duration;
  shake.timer = duration;
}

function updateShake() {
  if (shake.timer > 0) {
    shake.timer--;
    const t = shake.timer / shake.duration;
    const mag = shake.intensity * t;
    return {
      dx: (Math.random() - 0.5) * mag * 2,
      dy: (Math.random() - 0.5) * mag * 2
    };
  }
  return { dx: 0, dy: 0 };
}

// ─────────────────────────────────────────────
// §G  NOTIFICATION SYSTEM
// ─────────────────────────────────────────────
let _notifTimer = null;

function showNotification(text, type) {
  type = type || 'neutral';
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = text;
  el.className = '';
  el.classList.add('notif-' + type);
  el.classList.remove('hidden');
  if (_notifTimer) clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => {
    el.classList.add('hidden');
    _notifTimer = null;
  }, 3000);
}

// ─────────────────────────────────────────────
// §H  TILE DRAWING
// ─────────────────────────────────────────────
const _tileRandCache = {};
function _tileRand(tx, ty, idx) {
  const key = tx * 10000 + ty * 100 + idx;
  if (_tileRandCache[key] !== undefined) return _tileRandCache[key];
  // Deterministic pseudo-random per tile
  let h = (tx * 374761 + ty * 668265 + idx * 982451) & 0x7fffffff;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  const v = (h & 0xffff) / 0xffff;
  _tileRandCache[key] = v;
  return v;
}

function drawTile(x, y, camX, camY, tileType, timeOfDay) {
  const sx = x * TILE - camX;
  const sy = y * TILE - camY;
  if (sx < -TILE || sx > gameCanvas.width || sy < -TILE || sy > gameCanvas.height) return;

  switch (tileType) {
    case 0: { // Sand
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Texture dots
      for (let i = 0; i < 6; i++) {
        const dx = _tileRand(x, y, i) * (TILE - 2) + 1;
        const dy = _tileRand(x, y, i + 10) * (TILE - 2) + 1;
        ctx.fillStyle = _tileRand(x, y, i + 20) > 0.5 ? PALETTE.sandDark : PALETTE.sandLight;
        ctx.fillRect(sx + dx, sy + dy, 1, 1);
      }
      break;
    }
    case 1: { // Road
      ctx.fillStyle = PALETTE.road || '#9e8b6e';
      ctx.fillRect(sx, sy, TILE, TILE);
      // Wagon rut lines
      ctx.fillStyle = PALETTE.roadDark || '#7e6b4e';
      ctx.fillRect(sx, sy + 10, TILE, 1);
      ctx.fillRect(sx, sy + 21, TILE, 1);
      // Scattered pebbles
      for (let i = 0; i < 3; i++) {
        const dx = _tileRand(x, y, i + 30) * (TILE - 4) + 2;
        const dy = _tileRand(x, y, i + 40) * (TILE - 4) + 2;
        ctx.fillStyle = PALETTE.sandDark;
        ctx.fillRect(sx + dx, sy + dy, 2, 1);
      }
      break;
    }
    case 3: { // Wall
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Horizontal plank lines
      ctx.fillStyle = PALETTE.woodDark;
      for (let py = 0; py < TILE; py += 8) {
        ctx.fillRect(sx, sy + py, TILE, 1);
      }
      // Dark edges
      ctx.fillRect(sx, sy, 1, TILE);
      ctx.fillRect(sx + TILE - 1, sy, 1, TILE);
      // Knot details
      if (_tileRand(x, y, 50) > 0.6) {
        const kx = _tileRand(x, y, 51) * (TILE - 8) + 4;
        const ky = _tileRand(x, y, 52) * (TILE - 8) + 4;
        ctx.fillStyle = PALETTE.woodDark;
        ctx.beginPath();
        ctx.arc(sx + kx, sy + ky, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 4: { // Door
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Inset
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(sx + 3, sy + 2, TILE - 6, TILE - 3);
      // Plank lines
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(sx + TILE / 2, sy + 2, 1, TILE - 3);
      // Gold handle
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(sx + TILE - 10, sy + TILE / 2 - 1, 3, 3);
      ctx.fillStyle = PALETTE.badgeShine || '#fff8c0';
      ctx.fillRect(sx + TILE - 9, sy + TILE / 2, 1, 1);
      break;
    }
    case 5: { // Water
      ctx.fillStyle = PALETTE.water;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Animated shimmer
      const t = Date.now() * 0.002;
      const wl = PALETTE.waterLight || '#6a8aaa';
      ctx.fillStyle = wl;
      for (let wy = 0; wy < TILE; wy += 6) {
        const offset = Math.sin(t + x * 0.5 + wy * 0.3) * 4;
        ctx.fillRect(sx + 8 + offset, sy + wy, 6, 1);
        const offset2 = Math.sin(t + x * 0.7 + wy * 0.2 + 2) * 5;
        ctx.fillRect(sx + 20 + offset2, sy + wy + 3, 4, 1);
      }
      break;
    }
    case 6: { // Cactus on sand
      // Sand base
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Cactus body
      ctx.fillStyle = PALETTE.cactus;
      ctx.fillRect(sx + 12, sy + 6, 8, 22);
      // Left arm
      ctx.fillRect(sx + 5, sy + 10, 7, 5);
      ctx.fillRect(sx + 5, sy + 6, 5, 4);
      // Right arm
      ctx.fillRect(sx + 20, sy + 12, 7, 5);
      ctx.fillRect(sx + 22, sy + 8, 5, 4);
      // Darker shading
      ctx.fillStyle = PALETTE.cactusD;
      ctx.fillRect(sx + 12, sy + 6, 2, 22);
      ctx.fillRect(sx + 5, sy + 10, 2, 5);
      ctx.fillRect(sx + 20, sy + 12, 2, 5);
      // Spines
      ctx.fillStyle = '#9ab060';
      const spines = [[14, 8], [16, 12], [14, 18], [18, 15], [7, 9], [24, 11], [25, 16]];
      for (const [spx, spy] of spines) {
        ctx.fillRect(sx + spx, sy + spy, 1, 1);
      }
      break;
    }
    case 7: { // Rock on sand
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Irregular rock shape
      ctx.fillStyle = PALETTE.stone;
      ctx.beginPath();
      ctx.moveTo(sx + 6, sy + 24);
      ctx.lineTo(sx + 4, sy + 16);
      ctx.lineTo(sx + 8, sy + 8);
      ctx.lineTo(sx + 16, sy + 5);
      ctx.lineTo(sx + 24, sy + 7);
      ctx.lineTo(sx + 28, sy + 14);
      ctx.lineTo(sx + 26, sy + 22);
      ctx.lineTo(sx + 18, sy + 26);
      ctx.closePath();
      ctx.fill();
      // Highlight
      ctx.fillStyle = PALETTE.stoneLight;
      ctx.beginPath();
      ctx.moveTo(sx + 10, sy + 10);
      ctx.lineTo(sx + 16, sy + 8);
      ctx.lineTo(sx + 22, sy + 9);
      ctx.lineTo(sx + 20, sy + 14);
      ctx.lineTo(sx + 12, sy + 14);
      ctx.closePath();
      ctx.fill();
      // Dark crevice
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(sx + 12, sy + 15, 8, 1);
      ctx.fillRect(sx + 14, sy + 19, 6, 1);
      break;
    }
    case 8: { // Wood floor
      ctx.fillStyle = PALETTE.plank || PALETTE.wood;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Alternating plank shading
      const dark = PALETTE.plankDark || PALETTE.woodDark;
      for (let py = 0; py < TILE; py += 8) {
        const shade = (Math.floor(py / 8) + x) % 2 === 0;
        if (shade) {
          ctx.fillStyle = dark;
          ctx.globalAlpha = 0.2;
          ctx.fillRect(sx, sy + py, TILE, 8);
          ctx.globalAlpha = 1;
        }
        // Plank line
        ctx.fillStyle = dark;
        ctx.fillRect(sx, sy + py, TILE, 1);
      }
      // Stagger vertical joins
      const joinX = ((x + y) % 3) * 10 + 6;
      ctx.fillStyle = dark;
      ctx.fillRect(sx + joinX, sy, 1, TILE);
      break;
    }
    case 9: { // Grass on sand
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Green tufts
      ctx.fillStyle = PALETTE.grass;
      for (let i = 0; i < 8; i++) {
        const gx = _tileRand(x, y, i + 60) * (TILE - 4) + 2;
        const gy = _tileRand(x, y, i + 70) * (TILE - 6) + 4;
        const gh = 3 + _tileRand(x, y, i + 80) * 4;
        ctx.fillRect(sx + gx, sy + gy - gh, 1, gh);
        ctx.fillRect(sx + gx - 1, sy + gy - gh + 1, 1, gh - 2);
        ctx.fillRect(sx + gx + 1, sy + gy - gh + 2, 1, gh - 3);
      }
      break;
    }
    case 10: { // Fence on sand
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      // Vertical posts
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(sx + 2, sy + 6, 4, 22);
      ctx.fillRect(sx + TILE - 6, sy + 6, 4, 22);
      // Horizontal rails
      ctx.fillRect(sx, sy + 10, TILE, 3);
      ctx.fillRect(sx, sy + 20, TILE, 3);
      // Post tops
      ctx.fillStyle = PALETTE.woodLight;
      ctx.fillRect(sx + 2, sy + 5, 4, 2);
      ctx.fillRect(sx + TILE - 6, sy + 5, 4, 2);
      // Nail details
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(sx + 3, sy + 11, 1, 1);
      ctx.fillRect(sx + TILE - 5, sy + 11, 1, 1);
      ctx.fillRect(sx + 3, sy + 21, 1, 1);
      ctx.fillRect(sx + TILE - 5, sy + 21, 1, 1);
      break;
    }
    case 11: { // Railroad track
      // Gravel base
      ctx.fillStyle = '#7a7060';
      ctx.fillRect(sx, sy, TILE, TILE);
      // Gravel texture
      for (var gi = 0; gi < 6; gi++) {
        var gx2 = _tileRand(x, y, gi + 90) * (TILE - 2) + 1;
        var gy2 = _tileRand(x, y, gi + 100) * (TILE - 2) + 1;
        ctx.fillStyle = _tileRand(x, y, gi + 110) > 0.5 ? '#6a6050' : '#8a8070';
        ctx.fillRect(sx + gx2, sy + gy2, 2, 1);
      }
      // Wooden ties (horizontal brown rectangles)
      ctx.fillStyle = '#5a3a1a';
      for (var ti = 0; ti < TILE; ti += 8) {
        ctx.fillRect(sx + ti, sy + 6, 6, 3);
        ctx.fillRect(sx + ti, sy + TILE - 9, 6, 3);
      }
      // Steel rails (two thin grey lines)
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(sx, sy + 8, TILE, 2);
      ctx.fillRect(sx, sy + TILE - 10, TILE, 2);
      // Rail highlight
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(sx, sy + 8, TILE, 1);
      ctx.fillRect(sx, sy + TILE - 10, TILE, 1);
      break;
    }
    default: {
      ctx.fillStyle = PALETTE.sand;
      ctx.fillRect(sx, sy, TILE, TILE);
      break;
    }
  }
}

// ─────────────────────────────────────────────
// §I  BUILDING ROOF DRAWING
// ─────────────────────────────────────────────
function drawBuildingRoof(b, camX, camY, timeOfDay) {
  const sx = b.x * TILE - camX;
  const sy = b.y * TILE - camY;
  const sw = b.w * TILE;
  const sh = b.h * TILE;

  // Skip if off screen
  if (sx + sw < -TILE || sx > gameCanvas.width + TILE || sy + sh < -TILE || sy > gameCanvas.height + TILE) return;

  const colors = BUILDING_COLORS ? BUILDING_COLORS[b.type] : null;
  const roofColor = colors ? colors.roof : PALETTE.roof;
  const trimColor = colors ? colors.trim : PALETTE.gold;

  // Wooden boardwalk / porch floor in front of building
  const porchY = sy + sh;
  ctx.fillStyle = PALETTE.woodLight || '#8b6340';
  ctx.fillRect(sx - 4, porchY, sw + 8, 5);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(sx - 4, porchY, sw + 8, 1);
  // Plank lines on boardwalk
  for (let pi = 0; pi < sw + 8; pi += 8) {
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx - 4 + pi, porchY, 1, 5);
  }

  // Awning / porch overhang with support posts
  const awningDepth = 10;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(sx - 2, porchY - awningDepth, sw + 4, awningDepth); // shadow under awning
  ctx.fillStyle = roofColor;
  ctx.fillRect(sx - 4, porchY - awningDepth - 2, sw + 8, 3); // awning top
  ctx.fillStyle = PALETTE.roofDark;
  ctx.fillRect(sx - 4, porchY - awningDepth - 2, sw + 8, 1);
  // Support posts
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(sx - 2, porchY - awningDepth, 3, awningDepth);
  ctx.fillRect(sx + sw - 1, porchY - awningDepth, 3, awningDepth);
  // Post highlight
  ctx.fillStyle = PALETTE.woodLight || '#8b6340';
  ctx.fillRect(sx - 1, porchY - awningDepth, 1, awningDepth);
  ctx.fillRect(sx + sw, porchY - awningDepth, 1, awningDepth);

  // Hitching post in front of porch
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(sx + 4, porchY + 5, 2, 8); // left post
  ctx.fillRect(sx + sw - 6, porchY + 5, 2, 8); // right post
  ctx.fillStyle = PALETTE.woodLight || '#8b6340';
  ctx.fillRect(sx + 4, porchY + 8, sw - 8, 2); // horizontal bar
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(sx + 4, porchY + 10, sw - 8, 1); // bar shadow

  // Overhanging roof
  const overhang = 8;
  ctx.fillStyle = roofColor;
  ctx.fillRect(sx - overhang, sy - 14, sw + overhang * 2, 16);
  // Roof ridge (lighter top edge)
  ctx.fillStyle = PALETTE.roofLight;
  ctx.fillRect(sx - overhang + 1, sy - 13, sw + overhang * 2 - 2, 2);
  // Roof shading
  ctx.fillStyle = PALETTE.roofDark;
  ctx.fillRect(sx - overhang, sy - 14, sw + overhang * 2, 2);
  ctx.fillRect(sx - overhang, sy + 1, sw + overhang * 2, 2);
  // Roof tile lines
  for (let ri = 0; ri < sw + overhang * 2; ri += 6) {
    ctx.fillStyle = PALETTE.roofDark;
    ctx.fillRect(sx - overhang + ri, sy - 12, 1, 14);
  }

  // Building-specific top details
  if (b.type === BUILDING_TYPES.CHURCH) {
    // Steeple + cross
    const cx = sx + sw / 2;
    ctx.fillStyle = PALETTE.wallAdobe || '#c8a882';
    ctx.fillRect(cx - 4, sy - 30, 8, 16);
    ctx.fillStyle = PALETTE.wallAdobeD || '#a88862';
    ctx.fillRect(cx - 4, sy - 30, 8, 1);
    ctx.fillRect(cx - 4, sy - 30, 1, 16);
    // Cross
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, sy - 38, 2, 10);
    ctx.fillRect(cx - 4, sy - 35, 8, 2);
  }

  // Chimney on some buildings
  if (b.type === BUILDING_TYPES.SALOON || b.type === BUILDING_TYPES.BLACKSMITH || b.type === BUILDING_TYPES.HOTEL || b.type === BUILDING_TYPES.HOUSE) {
    const chimX = sx + sw - 12;
    ctx.fillStyle = PALETTE.stoneDark;
    ctx.fillRect(chimX, sy - 22, 6, 10);
    ctx.fillStyle = PALETTE.stone;
    ctx.fillRect(chimX + 1, sy - 22, 4, 1);
    ctx.fillRect(chimX + 1, sy - 18, 4, 1);
    // Smoke (subtle)
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#aaaaaa';
    const smokeT = Date.now() * 0.001;
    ctx.fillRect(chimX + 1 + Math.sin(smokeT) * 2, sy - 26, 3, 3);
    ctx.fillRect(chimX + Math.sin(smokeT + 1) * 3, sy - 30, 2, 2);
    ctx.globalAlpha = 1;
  }

  // SALOON: balcony with railing + swinging doors
  if (b.type === BUILDING_TYPES.SALOON) {
    // Balcony
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(sx, sy + 2, sw, 3); // balcony floor
    // Railing posts
    for (let rp = 0; rp < sw; rp += 8) {
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(sx + rp, sy + 2, 2, -8);
    }
    // Railing bar
    ctx.fillStyle = PALETTE.woodLight || '#8b6340';
    ctx.fillRect(sx, sy - 4, sw, 2);
    // Swinging doors at entrance
    const doorX = sx + sw / 2 - 6;
    const doorSwing = Math.sin(Date.now() * 0.002) * 0.5;
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(doorX, porchY - 10, 5 + doorSwing, 10);
    ctx.fillRect(doorX + 7, porchY - 10, 5 - doorSwing, 10);
    // Door slats
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(doorX, porchY - 7, 5, 1);
    ctx.fillRect(doorX + 7, porchY - 7, 5, 1);
  }

  // BANK: columns/pillars
  if (b.type === BUILDING_TYPES.BANK) {
    ctx.fillStyle = PALETTE.stoneLight;
    ctx.fillRect(sx + 2, sy + 2, 4, sh - 2);
    ctx.fillRect(sx + sw - 6, sy + 2, 4, sh - 2);
    // Column caps
    ctx.fillStyle = PALETTE.stone;
    ctx.fillRect(sx + 1, sy + 2, 6, 2);
    ctx.fillRect(sx + sw - 7, sy + 2, 6, 2);
    ctx.fillRect(sx + 1, porchY - 2, 6, 2);
    ctx.fillRect(sx + sw - 7, porchY - 2, 6, 2);
  }

  // SHERIFF: porch badge symbol
  if (b.type === BUILDING_TYPES.SHERIFF) {
    ctx.fillStyle = PALETTE.badge;
    const bx = sx + sw / 2;
    const by = porchY - awningDepth + 4;
    // Simple 5-point star shape
    ctx.beginPath();
    for (let si = 0; si < 5; si++) {
      const angle = -Math.PI / 2 + si * (Math.PI * 2 / 5);
      const px = bx + Math.cos(angle) * 4;
      const ppy = by + Math.sin(angle) * 4;
      if (si === 0) ctx.moveTo(px, ppy); else ctx.lineTo(px, ppy);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(bx + Math.cos(innerAngle) * 2, by + Math.sin(innerAngle) * 2);
    }
    ctx.closePath();
    ctx.fill();
  }

  // HOTEL: second-floor windows with curtains
  if (b.type === BUILDING_TYPES.HOTEL) {
    const numFloorWins = Math.max(2, Math.floor(sw / 16));
    for (let wi = 0; wi < numFloorWins; wi++) {
      const wx = sx + 6 + wi * Math.floor((sw - 12) / numFloorWins);
      const wy = sy + 4;
      // Window frame
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(wx - 1, wy - 1, 10, 12);
      ctx.fillStyle = '#aabbcc';
      ctx.fillRect(wx, wy, 8, 10);
      // Cross pane
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(wx + 3, wy, 2, 10);
      ctx.fillRect(wx, wy + 4, 8, 2);
      // Curtains (small colored triangles on sides)
      ctx.fillStyle = '#cc4444';
      ctx.fillRect(wx, wy, 2, 6);
      ctx.fillRect(wx + 6, wy, 2, 6);
    }
  }

  // Building name sign - wooden hanging board
  const names = {
    [BUILDING_TYPES.SHERIFF]: 'SHERIFF',
    [BUILDING_TYPES.SALOON]: 'SALOON',
    [BUILDING_TYPES.BANK]: 'BANK',
    [BUILDING_TYPES.GENERAL]: 'GENERAL STORE',
    [BUILDING_TYPES.JAIL]: 'JAIL',
    [BUILDING_TYPES.CHURCH]: 'CHURCH',
    [BUILDING_TYPES.STABLE]: 'STABLE',
    [BUILDING_TYPES.HOTEL]: 'HOTEL',
    [BUILDING_TYPES.HOUSE]: 'HOUSE',
    [BUILDING_TYPES.BLACKSMITH]: 'BLACKSMITH',
    [BUILDING_TYPES.WELL]: 'WELL',
    [BUILDING_TYPES.GALLOWS]: 'GALLOWS',
    [BUILDING_TYPES.WANTED_BOARD]: 'WANTED'
  };
  const name = names[b.type] || 'BUILDING';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  const signW = ctx.measureText(name).width + 10;
  const signX = sx + sw / 2 - signW / 2;
  const signY = sy - 16;
  // Hanging chains/lines
  ctx.fillStyle = '#888888';
  ctx.fillRect(signX + 2, signY - 4, 1, 4);
  ctx.fillRect(signX + signW - 3, signY - 4, 1, 4);
  // Wooden sign board
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(signX, signY, signW, 12);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(signX + 1, signY + 1, signW - 2, 10);
  // Sign border
  ctx.fillStyle = trimColor;
  ctx.fillRect(signX, signY, signW, 1);
  ctx.fillRect(signX, signY + 11, signW, 1);
  ctx.fillRect(signX, signY, 1, 12);
  ctx.fillRect(signX + signW - 1, signY, 1, 12);
  // Sign text
  ctx.fillStyle = '#000000';
  ctx.fillText(name, sx + sw / 2 + 1, signY + 9);
  ctx.fillStyle = trimColor;
  ctx.fillText(name, sx + sw / 2, signY + 8);
  ctx.textAlign = 'left';

  // Night: lit windows
  timeOfDay = timeOfDay || 0;
  const isNight = timeOfDay < 0.2 || timeOfDay > 0.8;
  if (isNight) {
    const winColor = '#ffdd66';
    const winGlow = '#ffeeaa';
    const numWins = Math.floor(sw / (TILE * 1.5));
    for (let wi = 0; wi < numWins; wi++) {
      const wx = sx + 12 + wi * Math.floor(sw / (numWins + 1));
      const wy = sy + 6;
      // Glow
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = winGlow;
      ctx.fillRect(wx - 3, wy - 3, 14, 16);
      ctx.globalAlpha = 1;
      // Window
      ctx.fillStyle = winColor;
      ctx.fillRect(wx, wy, 8, 10);
      // Cross pane
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(wx + 3, wy, 2, 10);
      ctx.fillRect(wx, wy + 4, 8, 2);
      // Shutters
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(wx - 2, wy, 2, 10);
      ctx.fillRect(wx + 8, wy, 2, 10);
    }
  }
}

// ─────────────────────────────────────────────
// §J  PLAYER DRAWING
// ─────────────────────────────────────────────
function drawPlayer(player, camX, camY) {
  const sx = player.x - camX;
  const sy = player.y - camY;
  if (sx < -TILE * 2 || sx > gameCanvas.width + TILE * 2 || sy < -TILE * 2 || sy > gameCanvas.height + TILE * 2) return;

  const now = Date.now();
  const bobOffset = player.moving ? Math.sin(now * 0.01) * 2 : 0;
  const dirToRadMap = [Math.PI / 2, -Math.PI / 2, Math.PI, 0]; // 0=down,1=up,2=left,3=right
  const dir = dirToRadMap[player.dir] || 0;
  const facingRight = player.dir === 0 || player.dir === 3 || player.dir === undefined;

  ctx.save();
  ctx.translate(sx, sy);

  if (player.mounted) {
    // ── Mounted on horse ──
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horse body
    const hBob = player.moving ? Math.sin(now * 0.015) * 2 : 0;
    const gallop = player.moving ? 1 : 0;
    // Horse body - rounded contour using multiple rects
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(-14, 2 + hBob, 28, 12);
    ctx.fillStyle = '#7e5434';
    ctx.fillRect(-12, 0 + hBob, 24, 2); // upper body contour
    ctx.fillRect(-12, 14 + hBob, 24, 1); // belly
    // Horse belly highlight
    ctx.fillStyle = '#9a6e4c';
    ctx.fillRect(-10, 8 + hBob, 20, 3);

    // Horse legs - 4 distinct legs with hoof animation
    ctx.fillStyle = '#6b4226';
    const legPhase1 = player.moving ? Math.sin(now * 0.02) * 4 : 0;
    const legPhase2 = player.moving ? Math.sin(now * 0.02 + Math.PI) * 4 : 0;
    // Front legs
    ctx.fillRect(facingRight ? 8 : -12, 14 + hBob, 3, 9 + legPhase1 * gallop);
    ctx.fillRect(facingRight ? 12 : -16, 14 + hBob, 3, 9 + legPhase2 * gallop);
    // Rear legs
    ctx.fillRect(facingRight ? -10 : 6, 14 + hBob, 3, 9 + legPhase2 * gallop);
    ctx.fillRect(facingRight ? -6 : 2, 14 + hBob, 3, 9 + legPhase1 * gallop);
    // Hooves (darker tips)
    ctx.fillStyle = '#2a1a0a';
    const h1 = 9 + legPhase1 * gallop;
    const h2 = 9 + legPhase2 * gallop;
    ctx.fillRect(facingRight ? 8 : -12, 14 + hBob + h1 - 2, 3, 2);
    ctx.fillRect(facingRight ? 12 : -16, 14 + hBob + h2 - 2, 3, 2);
    ctx.fillRect(facingRight ? -10 : 6, 14 + hBob + h2 - 2, 3, 2);
    ctx.fillRect(facingRight ? -6 : 2, 14 + hBob + h1 - 2, 3, 2);

    // Horse neck
    const neckX = facingRight ? 12 : -18;
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(neckX, -4 + hBob, 8, 10);
    // Horse head - rounded snout
    const headX = facingRight ? 16 : -24;
    ctx.fillStyle = '#8b5e3c';
    ctx.fillRect(headX, -6 + hBob, 8, 8);
    ctx.fillStyle = '#7e5434';
    ctx.fillRect(headX + (facingRight ? 6 : 0), -4 + hBob, 3, 5); // snout extension
    // Nostril
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(headX + (facingRight ? 7 : 1), -2 + hBob, 1, 1);
    // Horse eye
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(headX + (facingRight ? 4 : 2), -4 + hBob, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX + (facingRight ? 5 : 2), -4 + hBob, 1, 1);
    // Horse ears
    ctx.fillStyle = '#7a4e2c';
    ctx.fillRect(headX + 1, -9 + hBob, 2, 4);
    ctx.fillRect(headX + 4, -9 + hBob, 2, 4);
    // Ear inner
    ctx.fillStyle = '#9a6e5c';
    ctx.fillRect(headX + 1, -8 + hBob, 1, 2);
    ctx.fillRect(headX + 4, -8 + hBob, 1, 2);

    // Mane flowing
    ctx.fillStyle = '#2a1a0a';
    const maneWave = player.moving ? Math.sin(now * 0.01) * 2 : 0;
    ctx.fillRect(neckX + 2, -6 + hBob + maneWave, 3, 2);
    ctx.fillRect(neckX + 1, -4 + hBob - maneWave, 3, 2);
    ctx.fillRect(neckX, -2 + hBob + maneWave, 3, 2);
    ctx.fillRect(neckX - 1, 0 + hBob, 3, 2);

    // Saddle blanket
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(-6, -1 + hBob, 14, 4);
    ctx.fillStyle = '#aa3333';
    ctx.fillRect(-6, 0 + hBob, 14, 1); // blanket stripe
    // Saddle
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(-4, -3 + hBob, 10, 4);
    ctx.fillStyle = '#4a2508';
    ctx.fillRect(-4, -3 + hBob, 10, 1); // saddle top edge
    // Saddle horn
    ctx.fillStyle = '#6a4020';
    ctx.fillRect(facingRight ? 4 : -3, -5 + hBob, 2, 3);

    // Stirrups
    ctx.fillStyle = '#888888';
    ctx.fillRect(-3, 10 + hBob, 1, 4);
    ctx.fillRect(3, 10 + hBob, 1, 4);
    ctx.fillRect(-4, 13 + hBob, 3, 1);
    ctx.fillRect(2, 13 + hBob, 3, 1);

    // Bridle/reins
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(headX + 2, -1 + hBob, 4, 1); // bridle on face
    ctx.fillRect(headX + (facingRight ? 2 : 4), -1 + hBob, 1, 3);
    // Reins line from head to player hands
    ctx.strokeStyle = '#3a2010';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX + 3, 1 + hBob);
    ctx.lineTo(facingRight ? 4 : -4, -4 + hBob + bobOffset);
    ctx.stroke();

    // Horse tail with swish
    const tailSwish = Math.sin(now * 0.008) * 3;
    const tailBaseX = facingRight ? -16 : 16;
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(tailBaseX, 2 + hBob, 3, 4);
    ctx.fillRect(tailBaseX + tailSwish * (facingRight ? -1 : 1), 6 + hBob, 2, 5);
    ctx.fillRect(tailBaseX + tailSwish * (facingRight ? -1.5 : 1.5), 10 + hBob, 2, 3);

    // Player on top of horse
    const py = -14 + hBob + bobOffset;
    // Player legs hanging down (on stirrups)
    ctx.fillStyle = PALETTE.denim || '#4a5a8a';
    ctx.fillRect(-4, py + 10, 3, 6);
    ctx.fillRect(2, py + 10, 3, 6);
    // Boots on stirrups
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-5, py + 15, 4, 3);
    ctx.fillRect(2, py + 15, 4, 3);
    // Torso/vest
    ctx.fillStyle = PALETTE.cloth || '#8b1a1a';
    ctx.fillRect(-6, py, 12, 10);
    // Shirt
    ctx.fillStyle = '#d8c8a0';
    ctx.fillRect(-5, py + 1, 10, 7);
    // Vest edges
    ctx.fillStyle = PALETTE.clothDark || '#5b0a0a';
    ctx.fillRect(-6, py, 2, 10);
    ctx.fillRect(4, py, 2, 10);
    // Vest buttons
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(0, py + 2, 1, 1);
    ctx.fillRect(0, py + 5, 1, 1);
    // Badge star
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(facingRight ? 1 : -4, py + 2, 3, 3);
    ctx.fillStyle = PALETTE.badgeShine || '#fff8c0';
    ctx.fillRect(facingRight ? 2 : -3, py + 3, 1, 1);
    // Arms
    ctx.fillStyle = '#d8c8a0';
    ctx.fillRect(-8, py + 2, 2, 5);
    ctx.fillRect(6, py + 2, 2, 5);
    // Hands (holding reins)
    ctx.fillStyle = PALETTE.skin;
    ctx.fillRect(-8, py + 7, 2, 2);
    ctx.fillRect(6, py + 7, 2, 2);
    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.fillRect(-4, py - 7, 8, 7);
    // Hat shadow on face
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(-4, py - 7, 8, 2);
    // Eyes
    ctx.fillStyle = '#000000';
    if (facingRight) {
      ctx.fillRect(1, py - 5, 2, 1);
      ctx.fillRect(-2, py - 5, 2, 1);
    } else {
      ctx.fillRect(-3, py - 5, 2, 1);
      ctx.fillRect(0, py - 5, 2, 1);
    }
    // Mustache
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-2, py - 2, 4, 1);
    // Hat
    ctx.fillStyle = PALETTE.hat;
    ctx.fillRect(-8, py - 11, 16, 4);
    ctx.fillRect(-5, py - 15, 10, 4);
    // Hat crease
    ctx.fillStyle = PALETTE.hatBrim || '#2a1a0a';
    ctx.fillRect(-4, py - 14, 8, 1);
    // Hat brim
    ctx.fillStyle = PALETTE.hatBrim || '#2a1a0a';
    ctx.fillRect(-9, py - 11, 18, 1);
    // Hat band with star
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(-5, py - 12, 10, 1);
    ctx.fillRect(-1, py - 13, 2, 1); // tiny star on band
  } else {
    // ── On foot ──
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const py = bobOffset;

    // Boots - detailed with heels and spurs
    ctx.fillStyle = '#3a2a14';
    const lBob = player.moving ? Math.sin(now * 0.01) * 3 : 0;
    // Left boot
    ctx.fillRect(-5, 10 + py - lBob, 4, 6);
    // Right boot
    ctx.fillRect(1, 10 + py + lBob, 4, 6);
    // Boot heels (darker, slightly back)
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-5, 14 + py - lBob, 4, 2);
    ctx.fillRect(1, 14 + py + lBob, 4, 2);
    // Darker toe cap
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(facingRight ? -3 : -5, 12 + py - lBob, 2, 2);
    ctx.fillRect(facingRight ? 3 : 1, 12 + py + lBob, 2, 2);
    // Spur circles
    ctx.fillStyle = '#cccccc';
    ctx.beginPath();
    ctx.arc(-5, 14 + py - lBob, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 14 + py + lBob, 1, 0, Math.PI * 2);
    ctx.fill();

    // Pants / denim
    ctx.fillStyle = PALETTE.denim || '#4a5a8a';
    ctx.fillRect(-5, 3 + py, 4, 8);
    ctx.fillRect(1, 3 + py, 4, 8);
    // Denim seam
    ctx.fillStyle = '#3a4a7a';
    ctx.fillRect(-3, 3 + py, 1, 8);
    ctx.fillRect(3, 3 + py, 1, 8);

    // Belt with buckle
    ctx.fillStyle = PALETTE.leather || '#6a4a2a';
    ctx.fillRect(-6, 2 + py, 12, 2);
    // Belt buckle
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(-1, 2 + py, 2, 2);

    // Gun belt (diagonal across hips)
    ctx.fillStyle = PALETTE.leather || '#6a4a2a';
    ctx.fillRect(-6, 3 + py, 12, 1);
    // Gun holster on side
    const holsterX = facingRight ? 6 : -8;
    ctx.fillStyle = PALETTE.leather || '#6a4a2a';
    ctx.fillRect(holsterX, 1 + py, 3, 6);
    ctx.fillStyle = '#555555';
    ctx.fillRect(holsterX, 1 + py, 3, 3); // gun handle visible

    // Vest / torso
    ctx.fillStyle = PALETTE.cloth || '#8b1a1a';
    ctx.fillRect(-6, -6 + py, 12, 9);
    // Shirt underneath (visible in front)
    ctx.fillStyle = '#d8c8a0';
    ctx.fillRect(-4, -5 + py, 8, 7);
    // Vest edges (lapels)
    ctx.fillStyle = PALETTE.clothDark || '#5b0a0a';
    ctx.fillRect(-6, -6 + py, 2, 9);
    ctx.fillRect(4, -6 + py, 2, 9);
    // Vest buttons
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(0, -4 + py, 1, 1);
    ctx.fillRect(0, -2 + py, 1, 1);
    ctx.fillRect(0, 0 + py, 1, 1);

    // Bandolier / ammo belt across chest (diagonal dots)
    ctx.fillStyle = '#6a4a2a';
    for (let ai = 0; ai < 5; ai++) {
      const ax = -4 + ai * 2;
      const ay = -5 + ai * 1 + py;
      ctx.fillRect(ax, ay, 1, 2);
    }
    // Ammo shells (brass color)
    ctx.fillStyle = '#b8943a';
    for (let ai = 0; ai < 5; ai++) {
      const ax = -4 + ai * 2;
      const ay = -5 + ai * 1 + py;
      ctx.fillRect(ax, ay, 1, 1);
    }

    // Star badge
    ctx.fillStyle = PALETTE.badge;
    const badgeX = facingRight ? 1 : -4;
    const badgeY = -3 + py;
    // Draw small star shape
    ctx.beginPath();
    for (let si = 0; si < 5; si++) {
      const angle = -Math.PI / 2 + si * (Math.PI * 2 / 5);
      const px = badgeX + 1.5 + Math.cos(angle) * 2;
      const ppy = badgeY + 1.5 + Math.sin(angle) * 2;
      if (si === 0) ctx.moveTo(px, ppy); else ctx.lineTo(px, ppy);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(badgeX + 1.5 + Math.cos(innerAngle) * 1, badgeY + 1.5 + Math.sin(innerAngle) * 1);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.badgeShine || '#fff8c0';
    ctx.fillRect(badgeX + 1, badgeY + 1, 1, 1);

    // Arms on both sides
    ctx.fillStyle = '#d8c8a0'; // shirt sleeve
    ctx.fillRect(-8, -5 + py, 2, 7);
    ctx.fillRect(6, -5 + py, 2, 7);
    // Hands (skin colored dots)
    ctx.fillStyle = PALETTE.skin;
    ctx.beginPath();
    ctx.arc(-7, 3 + py, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, 3 + py, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.fillRect(-4, -13 + py, 8, 7);
    // Hat brim shadow on face
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(-4, -13 + py, 8, 2);

    // Darker jaw line
    ctx.fillStyle = PALETTE.skinDark;
    ctx.fillRect(-4, -7 + py, 8, 1);

    // Eyes based on direction (two eyes)
    ctx.fillStyle = '#000000';
    if (facingRight) {
      ctx.fillRect(1, -11 + py, 2, 1);
      ctx.fillRect(-2, -11 + py, 2, 1);
    } else {
      ctx.fillRect(-3, -11 + py, 2, 1);
      ctx.fillRect(0, -11 + py, 2, 1);
    }
    // Eyebrows (thin dark lines above eyes)
    ctx.fillStyle = '#2a1a0a';
    if (facingRight) {
      ctx.fillRect(0, -12 + py, 3, 1);
      ctx.fillRect(-3, -12 + py, 3, 1);
    } else {
      ctx.fillRect(-4, -12 + py, 3, 1);
      ctx.fillRect(-1, -12 + py, 3, 1);
    }
    // Mustache
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-2, -9 + py, 5, 1);
    ctx.fillRect(-3, -8 + py, 2, 1);
    ctx.fillRect(2, -8 + py, 2, 1);

    // Hat (wider brim, more detail)
    ctx.fillStyle = PALETTE.hat;
    ctx.fillRect(-9, -17 + py, 18, 4); // brim
    ctx.fillRect(-5, -21 + py, 10, 4); // crown
    // Hat crease in crown (darker line)
    ctx.fillStyle = PALETTE.hatBrim || '#2a1a0a';
    ctx.fillRect(-4, -20 + py, 8, 1);
    // Hat brim edge
    ctx.fillStyle = PALETTE.hatBrim || '#2a1a0a';
    ctx.fillRect(-10, -17 + py, 20, 1);
    // Hat band with star
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(-5, -17 + py, 10, 1);
    // Small star on hat band
    ctx.fillRect(-1, -18 + py, 2, 1);
    ctx.fillRect(0, -19 + py, 1, 1);
  }

  // HP bar when damaged
  if (player.hp < player.maxHp) {
    const barW = 20;
    const barH = 3;
    const barY = player.mounted ? -28 : -22 + bobOffset;
    const hpPct = clamp(player.hp / player.maxHp, 0, 1);
    ctx.fillStyle = '#440000';
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = hpPct > 0.3 ? '#cc3030' : '#ff0000';
    ctx.fillRect(-barW / 2, barY, barW * hpPct, barH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-barW / 2, barY, barW, barH);
  }

  // Muzzle flash when just shot
  if (player.lastShotTime && now - player.lastShotTime < 80) {
    const flashDist = 14;
    const fx = Math.cos(dir) * flashDist;
    const fy = Math.sin(dir) * flashDist - 4;
    ctx.fillStyle = '#ffcc00';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(fx, fy + bobOffset, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fx, fy + bobOffset, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
// §K  NPC DRAWING
// ─────────────────────────────────────────────
function drawNPC(npc, camX, camY, playerDist) {
  const sx = npc.x - camX;
  const sy = npc.y - camY;
  if (sx < -TILE * 2 || sx > gameCanvas.width + TILE * 2 || sy < -TILE * 2 || sy > gameCanvas.height + TILE * 2) return;

  const now = Date.now();

  ctx.save();
  ctx.translate(sx, sy);

  if (npc.state === 'dead' || npc.dead) {
    // Body on ground
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Blood pool
    ctx.fillStyle = PALETTE.blood;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(2, 3, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Fallen body (side view)
    const isOutlaw = npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY;
    ctx.fillStyle = isOutlaw ? PALETTE.outlaw : PALETTE.cloth || '#8b1a1a';
    ctx.fillRect(-10, -3, 20, 6);
    // Fallen arms
    ctx.fillStyle = '#d8c8a0';
    ctx.fillRect(-12, -1, 3, 2);
    ctx.fillRect(10, -1, 3, 2);
    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.fillRect(-14, -2, 5, 4);
    // X eyes on dead NPC
    ctx.fillStyle = '#000000';
    ctx.fillRect(-13, -1, 1, 1);
    ctx.fillRect(-12, 0, 1, 1);
    ctx.fillRect(-12, -1, 1, 1);
    ctx.fillRect(-13, 0, 1, 1);
    // Hat fallen off
    ctx.fillStyle = isOutlaw ? PALETTE.outlawHat : PALETTE.hat;
    ctx.fillRect(10, -5, 6, 3);
    ctx.fillRect(11, -7, 4, 2);
    ctx.restore();
    return;
  }

  if (npc.state === 'arrested' || npc.arrested) {
    // Sitting with hands bound
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body sitting
    ctx.fillStyle = PALETTE.outlaw;
    ctx.fillRect(-4, -2, 8, 8);
    // Head
    ctx.fillStyle = PALETTE.skin;
    ctx.fillRect(-3, -8, 6, 6);
    // Bound hands
    ctx.fillStyle = '#888888';
    ctx.fillRect(-3, 4, 6, 2);
    ctx.fillStyle = '#666666';
    ctx.fillRect(-2, 4, 1, 2);
    ctx.fillRect(1, 4, 1, 2);
    ctx.restore();
    return;
  }

  const bobOffset = (npc.moving || npc.state === 'walking') ? Math.sin(now * 0.008 + npc.x) * 1.5 : 0;
  const isOutlaw = npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY;
  const isShopkeeper = npc.type === NPC_TYPES.SHOPKEEPER || npc.type === NPC_TYPES.BARTENDER || npc.type === NPC_TYPES.BANKER;
  const facingRight = npc.facingRight !== undefined ? npc.facingRight : true;

  // Breathing animation for idle NPCs (subtle scale)
  const breathScale = (!npc.moving && npc.state !== 'walking') ? 1 + Math.sin(now * 0.003 + npc.x * 7) * 0.008 : 1;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body size variety based on NPC hash (use id + homeX/homeY for stable appearance)
  const npcHash = ((npc.id * 37 + (npc.homeX || 0) * 17 + (npc.homeY || 0) * 13) & 0xff);
  const bodyW = 8 + (npcHash % 3); // 8-10 wide
  const halfW = bodyW / 2;

  // Determine if female townsperson (for dress variation)
  const isFemale = npc.type === NPC_TYPES.TOWNSPERSON && (npcHash % 4 === 0);

  // Boots
  ctx.fillStyle = isOutlaw ? '#1a1a1a' : '#5a3a1a';
  const lBob = (npc.moving || npc.state === 'walking') ? Math.sin(now * 0.008 + npc.x) * 3 : 0;
  if (!isFemale) {
    ctx.fillRect(-4, 10 + bobOffset - lBob, 4, 5);
    ctx.fillRect(1, 10 + bobOffset + lBob, 4, 5);
    // Boot heels
    ctx.fillStyle = isOutlaw ? '#111111' : '#3a2010';
    ctx.fillRect(-4, 13 + bobOffset - lBob, 4, 2);
    ctx.fillRect(1, 13 + bobOffset + lBob, 4, 2);
  } else {
    // Smaller boots for dress NPCs
    ctx.fillRect(-3, 12 + bobOffset - lBob, 3, 3);
    ctx.fillRect(1, 12 + bobOffset + lBob, 3, 3);
  }

  // Pants / legs
  if (isFemale) {
    // Dress (longer, wider)
    const dressHue = (npcHash * 3) & 0xff;
    const dr = 120 + (dressHue & 0x3f);
    const dg = 80 + ((dressHue >> 2) & 0x3f);
    const db = 90 + ((dressHue >> 4) & 0x3f);
    ctx.fillStyle = 'rgb(' + dr + ',' + dg + ',' + db + ')';
    ctx.fillRect(-halfW - 1, 0 + bobOffset, bodyW + 2, 13);
    // Dress hem detail
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(-halfW - 1, 11 + bobOffset, bodyW + 2, 2);
  } else {
    ctx.fillStyle = isOutlaw ? '#2a2a2a' : (isShopkeeper ? '#5a4a3a' : PALETTE.denim || '#4a5a8a');
    ctx.fillRect(-4, 3 + bobOffset, 4, 8);
    ctx.fillRect(1, 3 + bobOffset, 4, 8);
  }

  // Torso
  if (isOutlaw) {
    ctx.fillStyle = PALETTE.outlaw;
  } else if (isShopkeeper) {
    ctx.fillStyle = '#6a5a4a';
  } else if (npc.type === NPC_TYPES.PREACHER) {
    ctx.fillStyle = '#222222';
  } else if (npc.type === NPC_TYPES.MAYOR) {
    ctx.fillStyle = '#4a3a6a';
  } else if (npc.type === NPC_TYPES.DEPUTY) {
    ctx.fillStyle = '#5a4a2a';
  } else if (npc.type === NPC_TYPES.STRANGER) {
    ctx.fillStyle = '#5a4a3a';
  } else if (isFemale) {
    const dressHue = (npcHash * 3) & 0xff;
    const dr = 120 + (dressHue & 0x3f);
    const dg = 80 + ((dressHue >> 2) & 0x3f);
    const db = 90 + ((dressHue >> 4) & 0x3f);
    ctx.fillStyle = 'rgb(' + dr + ',' + dg + ',' + db + ')';
  } else {
    const r = 80 + (npcHash & 0x3f);
    const g = 60 + ((npcHash >> 2) & 0x3f);
    const b = 50 + ((npcHash >> 4) & 0x3f);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  ctx.save();
  ctx.translate(0, 0);
  ctx.scale(breathScale, breathScale);
  ctx.fillRect(-halfW, -6 + bobOffset, bodyW, 10);
  ctx.restore();

  // Bartender apron
  if (npc.type === NPC_TYPES.BARTENDER) {
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(-halfW + 1, -2 + bobOffset, bodyW - 2, 10);
    ctx.fillStyle = '#c8c0b0';
    ctx.fillRect(-halfW + 1, -2 + bobOffset, bodyW - 2, 1);
    ctx.fillStyle = '#b8b0a0';
    ctx.fillRect(-halfW, -2 + bobOffset, 1, 2);
    ctx.fillRect(halfW - 1, -2 + bobOffset, 1, 2);
  }

  // Stranger poncho/cloak
  if (npc.type === NPC_TYPES.STRANGER) {
    ctx.fillStyle = '#7a6a4a';
    ctx.fillRect(-halfW - 3, -6 + bobOffset, bodyW + 6, 8);
    ctx.fillStyle = '#6a5a3a';
    ctx.fillRect(-halfW - 3, -5 + bobOffset, bodyW + 6, 1);
    ctx.fillRect(-halfW - 3, -2 + bobOffset, bodyW + 6, 1);
    ctx.fillStyle = '#8a7a5a';
    for (let fi = 0; fi < bodyW + 6; fi += 2) {
      ctx.fillRect(-halfW - 3 + fi, 2 + bobOffset, 1, 2);
    }
  }

  // Townsperson clothing variety
  if (npc.type === NPC_TYPES.TOWNSPERSON && !isFemale) {
    const clothStyle = npcHash % 3;
    if (clothStyle === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-halfW, -6 + bobOffset, 2, 10);
      ctx.fillRect(halfW - 2, -6 + bobOffset, 2, 10);
    } else if (clothStyle === 1) {
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(-halfW + 1, -6 + bobOffset, 2, 16);
      ctx.fillRect(halfW - 3, -6 + bobOffset, 2, 16);
    }
  }

  // Outlaw crossed ammo belts + skull bandana
  if (isOutlaw) {
    ctx.fillStyle = '#4a3a2a';
    for (let ai = 0; ai < 5; ai++) {
      ctx.fillRect(-halfW + ai * 2, -5 + ai + bobOffset, 2, 2);
    }
    for (let ai = 0; ai < 5; ai++) {
      ctx.fillRect(halfW - 2 - ai * 2, -5 + ai + bobOffset, 2, 2);
    }
    ctx.fillStyle = '#b8943a';
    for (let ai = 0; ai < 5; ai++) {
      ctx.fillRect(-halfW + ai * 2, -5 + ai + bobOffset, 1, 1);
      ctx.fillRect(halfW - 2 - ai * 2, -5 + ai + bobOffset, 1, 1);
    }
    ctx.fillStyle = PALETTE.bandana || '#8b0000';
    ctx.fillRect(-4, -7 + bobOffset, 8, 2);
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(-1, -7 + bobOffset, 2, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-1, -7 + bobOffset, 1, 1);
    ctx.fillRect(1, -7 + bobOffset, 1, 1);
  }

  // Mayor fancy vest + pocket watch
  if (npc.type === NPC_TYPES.MAYOR) {
    ctx.fillStyle = '#6a4a8a';
    ctx.fillRect(-halfW, -6 + bobOffset, 2, 10);
    ctx.fillRect(halfW - 2, -6 + bobOffset, 2, 10);
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(-1, -3 + bobOffset, 1, 1);
    ctx.fillRect(0, -2 + bobOffset, 1, 1);
    ctx.fillRect(1, -1 + bobOffset, 1, 1);
    ctx.fillRect(2, -1 + bobOffset, 2, 2);
  }

  // Preacher white collar + book
  if (npc.type === NPC_TYPES.PREACHER) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -6 + bobOffset, 6, 2);
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(facingRight ? halfW + 1 : -halfW - 4, -2 + bobOffset, 3, 4);
    ctx.fillStyle = '#f0e8d0';
    ctx.fillRect(facingRight ? halfW + 2 : -halfW - 3, -1 + bobOffset, 1, 2);
  }

  // Shopkeeper suspenders
  if (npc.type === NPC_TYPES.SHOPKEEPER) {
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(-halfW + 1, -6 + bobOffset, 2, 14);
    ctx.fillRect(halfW - 3, -6 + bobOffset, 2, 14);
  }

  // Deputy holster
  if (npc.type === NPC_TYPES.DEPUTY) {
    ctx.fillStyle = PALETTE.leather || '#6a4a2a';
    const depHolsterX = facingRight ? halfW : -halfW - 2;
    ctx.fillRect(depHolsterX, 0 + bobOffset, 2, 5);
    ctx.fillStyle = '#555555';
    ctx.fillRect(depHolsterX, 0 + bobOffset, 2, 2);
  }

  // Arms (not for stranger - poncho covers them)
  if (npc.type !== NPC_TYPES.STRANGER) {
    ctx.fillStyle = isOutlaw ? '#2a2a2a' : '#d8c8a0';
    ctx.fillRect(-halfW - 2, -4 + bobOffset, 2, 6);
    ctx.fillRect(halfW, -4 + bobOffset, 2, 6);
    ctx.fillStyle = PALETTE.skin;
    ctx.beginPath();
    ctx.arc(-halfW - 1, 3 + bobOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(halfW + 1, 3 + bobOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = PALETTE.skin;
  ctx.fillRect(-4, -13 + bobOffset, 8, 7);

  // Eyes (both visible)
  ctx.fillStyle = '#000000';
  if (facingRight) {
    ctx.fillRect(1, -11 + bobOffset, 2, 1);
    ctx.fillRect(-2, -11 + bobOffset, 2, 1);
  } else {
    ctx.fillRect(-3, -11 + bobOffset, 2, 1);
    ctx.fillRect(0, -11 + bobOffset, 2, 1);
  }

  // Mayor monocle
  if (npc.type === NPC_TYPES.MAYOR) {
    ctx.strokeStyle = PALETTE.badge;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(facingRight ? 2 : -2, -10 + bobOffset, 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(facingRight ? 3 : -4, -9 + bobOffset, 1, 3);
  }

  // Beard for some NPCs
  const hasBeard = (npcHash % 5 === 0) && !isFemale;
  if (hasBeard) {
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-3, -7 + bobOffset, 6, 3);
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-2, -6 + bobOffset, 4, 2);
  }

  // Hat variation
  if (isOutlaw) {
    ctx.fillStyle = PALETTE.outlawHat;
    ctx.fillRect(-6, -17 + bobOffset, 12, 4);
    ctx.fillRect(-4, -20 + bobOffset, 8, 3);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-7, -17 + bobOffset, 14, 1);
  } else if (npc.type === NPC_TYPES.PREACHER) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(-5, -21 + bobOffset, 10, 8);
    ctx.fillRect(-6, -14 + bobOffset, 12, 1);
    ctx.fillStyle = '#333333';
    ctx.fillRect(-5, -15 + bobOffset, 10, 1);
  } else if (npc.type === NPC_TYPES.MAYOR) {
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(-5, -22 + bobOffset, 10, 9);
    ctx.fillRect(-6, -14 + bobOffset, 12, 1);
    ctx.fillStyle = PALETTE.badge;
    ctx.fillRect(-5, -15 + bobOffset, 10, 1);
  } else if (npc.type === NPC_TYPES.DEPUTY) {
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(-6, -17 + bobOffset, 12, 4);
    ctx.fillRect(-4, -20 + bobOffset, 8, 3);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(-7, -17 + bobOffset, 14, 1);
    // Proper star badge
    ctx.fillStyle = PALETTE.badge;
    const starX = facingRight ? 1 : -3;
    const starY = -4 + bobOffset;
    ctx.beginPath();
    for (let si = 0; si < 5; si++) {
      const angle = -Math.PI / 2 + si * (Math.PI * 2 / 5);
      const px = starX + 1 + Math.cos(angle) * 2;
      const ppy = starY + 1 + Math.sin(angle) * 2;
      if (si === 0) ctx.moveTo(px, ppy); else ctx.lineTo(px, ppy);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(starX + 1 + Math.cos(innerAngle) * 1, starY + 1 + Math.sin(innerAngle) * 1);
    }
    ctx.closePath();
    ctx.fill();
  } else if (npc.type === NPC_TYPES.SHOPKEEPER) {
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(-5, -15 + bobOffset, 10, 2);
    ctx.fillStyle = '#7a6050';
    ctx.fillRect(facingRight ? -2 : -7, -15 + bobOffset, 8, 1);
    ctx.fillRect(-4, -16 + bobOffset, 8, 2);
  } else if (npc.type === NPC_TYPES.BARTENDER) {
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-4, -14 + bobOffset, 8, 2);
    ctx.fillRect(facingRight ? -4 : 2, -13 + bobOffset, 3, 1);
  } else if (npc.type === NPC_TYPES.STRANGER) {
    ctx.fillStyle = '#3a3028';
    ctx.fillRect(-7, -17 + bobOffset, 14, 4);
    ctx.fillRect(-4, -20 + bobOffset, 8, 3);
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(-8, -17 + bobOffset, 16, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-4, -13 + bobOffset, 8, 3);
  } else if (isFemale) {
    const bonnetHue = (npcHash * 5) & 0xff;
    const br = 140 + (bonnetHue & 0x3f);
    const bg = 100 + ((bonnetHue >> 2) & 0x3f);
    const bb = 120 + ((bonnetHue >> 4) & 0x3f);
    ctx.fillStyle = 'rgb(' + br + ',' + bg + ',' + bb + ')';
    ctx.fillRect(-5, -15 + bobOffset, 10, 3);
    ctx.fillRect(-4, -16 + bobOffset, 8, 2);
    ctx.fillStyle = 'rgb(' + (br - 20) + ',' + (bg - 20) + ',' + (bb - 20) + ')';
    ctx.fillRect(-5, -13 + bobOffset, 1, 2);
    ctx.fillRect(4, -13 + bobOffset, 1, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -15 + bobOffset, 8, 1);
  } else {
    const hasHat = ((npc.x * 13 + npc.y * 7) % 3) !== 0;
    if (hasHat) {
      const hatShade = 30 + ((npc.x * 17 + npc.y * 31) & 0x3f);
      ctx.fillStyle = 'rgb(' + hatShade + ',' + Math.floor(hatShade * 0.8) + ',' + Math.floor(hatShade * 0.5) + ')';
      ctx.fillRect(-6, -17 + bobOffset, 12, 4);
      ctx.fillRect(-4, -20 + bobOffset, 8, 3);
      ctx.fillStyle = 'rgb(' + Math.floor(hatShade * 0.7) + ',' + Math.floor(hatShade * 0.5) + ',' + Math.floor(hatShade * 0.3) + ')';
      ctx.fillRect(-7, -17 + bobOffset, 14, 1);
    }
  }

  // Hostile red indicator
  if (npc.hostile) {
    const pulse = 0.6 + Math.sin(now * 0.006) * 0.4;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, -20 + bobOffset, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -22 + bobOffset, 1, 3);
    ctx.fillRect(-0.5, -18 + bobOffset, 1, 1);
  }

  // HP bar when damaged (for outlaws)
  if (isOutlaw && npc.hp !== undefined && npc.maxHp !== undefined && npc.hp < npc.maxHp) {
    const barW = 16;
    const barH = 2;
    const barY = -24 + bobOffset;
    const hpPct = clamp(npc.hp / npc.maxHp, 0, 1);
    ctx.fillStyle = '#440000';
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = '#cc3030';
    ctx.fillRect(-barW / 2, barY, barW * hpPct, barH);
  }

  // Interaction prompt [E] when player is near
  playerDist = playerDist || Infinity;
  if (playerDist < INTERACT_RANGE && !npc.hostile && !npc.dead && !npc.arrested) {
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText('[E]', 1, -26 + bobOffset);
    ctx.fillStyle = '#ffdd44';
    ctx.fillText('[E]', 0, -27 + bobOffset);
  }

  // Name tag when close
  if (playerDist < INTERACT_RANGE * 2 && npc.name) {
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(npc.name, 1, -30 + bobOffset);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(npc.name, 0, -31 + bobOffset);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ─────────────────────────────────────────────
// §L  AMBIENT PARTICLE SYSTEM
// ─────────────────────────────────────────────
const ambientParticles = [];
let _ambientTimer = 0;

// updateAmbientParticles defined in Part 5 (more complete version)

function drawAmbientParticles(ctx, camX, camY) {
  const now = Date.now();
  for (const p of ambientParticles) {
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx < -20 || sx > gameCanvas.width + 20 || sy < -20 || sy > gameCanvas.height + 20) continue;

    if (p.type === 'tumbleweed') {
      const alpha = clamp(p.life / 100, 0, 0.7);
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.rotation);
      ctx.strokeStyle = PALETTE.tumbleweed || '#a89060';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-p.size / 3, -p.size / 4);
      ctx.lineTo(p.size / 3, p.size / 4);
      ctx.moveTo(p.size / 3, -p.size / 4);
      ctx.lineTo(-p.size / 3, p.size / 4);
      ctx.moveTo(0, -p.size / 3);
      ctx.lineTo(0, p.size / 3);
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'dust') {
      const alpha = clamp(p.life / 80, 0, 0.3);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = PALETTE.dust || '#c8b898';
      ctx.fillRect(sx, sy, p.size, p.size);
    } else if (p.type === 'firefly') {
      const pulse = 0.3 + Math.sin(now * 0.005 + (p.phase || 0)) * 0.7;
      ctx.globalAlpha = clamp(pulse * (p.life / 120), 0, 1);
      ctx.fillStyle = '#eeff55';
      ctx.beginPath();
      ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
      ctx.fill();
      // Small glow
      ctx.globalAlpha *= 0.3;
      ctx.fillStyle = '#ffffaa';
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ─────────────────────────────────────────────
// §M  DAY/NIGHT OVERLAY
// ─────────────────────────────────────────────
function getSkyColor(t) {
  // t: 0=midnight, 0.25=dawn, 0.5=noon, 0.75=dusk, 1=midnight
  if (t < 0.2) {
    return PALETTE.skyNight;
  } else if (t < 0.3) {
    const p = (t - 0.2) / 0.1;
    return lerpColor(PALETTE.skyNight, PALETTE.skyDawn || '#e0a060', p);
  } else if (t < 0.4) {
    const p = (t - 0.3) / 0.1;
    return lerpColor(PALETTE.skyDawn || '#e0a060', PALETTE.skyNoon || '#87ceeb', p);
  } else if (t < 0.65) {
    return PALETTE.skyNoon || '#87ceeb';
  } else if (t < 0.75) {
    const p = (t - 0.65) / 0.1;
    return lerpColor(PALETTE.skyNoon || '#87ceeb', PALETTE.skyDusk || '#c06030', p);
  } else if (t < 0.85) {
    const p = (t - 0.75) / 0.1;
    return lerpColor(PALETTE.skyDusk || '#c06030', PALETTE.skyNight, p);
  } else {
    return PALETTE.skyNight;
  }
}

function drawDayNightOverlay(timeOfDay) {
  const t = timeOfDay || 0;
  let overlayColor = null;
  let alpha = 0;

  if (t < 0.2) {
    // Night
    overlayColor = '#0a0820';
    alpha = 0.5;
  } else if (t < 0.3) {
    // Dawn transition
    const p = (t - 0.2) / 0.1;
    overlayColor = lerpColor('#0a0820', '#cc6622', p);
    alpha = lerp(0.5, 0.15, p);
  } else if (t < 0.35) {
    // Dawn to clear
    const p = (t - 0.3) / 0.05;
    overlayColor = '#cc6622';
    alpha = lerp(0.15, 0, p);
  } else if (t < 0.7) {
    // Clear day
    alpha = 0;
  } else if (t < 0.75) {
    // Approaching dusk
    const p = (t - 0.7) / 0.05;
    overlayColor = '#cc4400';
    alpha = lerp(0, 0.15, p);
  } else if (t < 0.85) {
    // Dusk
    const p = (t - 0.75) / 0.1;
    overlayColor = lerpColor('#cc4400', '#0a0820', p);
    alpha = lerp(0.15, 0.5, p);
  } else {
    // Night
    overlayColor = '#0a0820';
    alpha = 0.5;
  }

  if (alpha > 0 && overlayColor) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────
// §N  MINIMAP DRAWING
// ─────────────────────────────────────────────
function drawMinimap(game) {
  if (!game) return;
  const mw = minimapCanvas.width;
  const mh = minimapCanvas.height;
  const scaleX = mw / WORLD_W;
  const scaleY = mh / WORLD_H;

  // Background
  mmCtx.fillStyle = PALETTE.sand;
  mmCtx.fillRect(0, 0, mw, mh);

  // Roads
  if (game.map) {
    for (let ty = 0; ty < MAP_H; ty += 2) {
      for (let tx = 0; tx < MAP_W; tx += 2) {
        const tile = game.map[ty][tx];
        if (tile === 1) {
          mmCtx.fillStyle = PALETTE.road || '#9e8b6e';
          mmCtx.fillRect(tx * TILE * scaleX, ty * TILE * scaleY, Math.max(2, TILE * 2 * scaleX), Math.max(2, TILE * 2 * scaleY));
        } else if (tile === 5) {
          mmCtx.fillStyle = PALETTE.water;
          mmCtx.fillRect(tx * TILE * scaleX, ty * TILE * scaleY, Math.max(2, TILE * 2 * scaleX), Math.max(2, TILE * 2 * scaleY));
        }
      }
    }
  }

  // Buildings
  if (game.buildings) {
    for (const b of game.buildings) {
      const colors = BUILDING_COLORS ? BUILDING_COLORS[b.type] : null;
      const bColor = colors ? colors.wall : '#8b6340';
      mmCtx.fillStyle = bColor;
      const bx = b.x * TILE * scaleX;
      const by = b.y * TILE * scaleY;
      const bw = Math.max(3, b.w * TILE * scaleX);
      const bh = Math.max(3, b.h * TILE * scaleY);
      mmCtx.fillRect(bx, by, bw, bh);

      // Quest target building highlighted
      if (game.activeQuest && game.activeQuest.targetBuilding === b.type) {
        mmCtx.strokeStyle = '#ffff00';
        mmCtx.lineWidth = 1;
        mmCtx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
      }
    }
  }

  // NPCs as colored dots
  if (game.npcs) {
    for (const npc of game.npcs) {
      if (npc.dead) continue;
      const nx = npc.x * scaleX;
      const ny = npc.y * scaleY;
      if (npc.hostile) {
        mmCtx.fillStyle = '#ff0000';
      } else if (npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) {
        mmCtx.fillStyle = '#ff8800';
      } else {
        mmCtx.fillStyle = '#44cc44';
      }
      mmCtx.fillRect(nx - 1, ny - 1, 2, 2);
    }
  }

  // Crime location as flashing red
  if (game.activeCrime && game.activeCrime.x !== undefined) {
    const pulse = Math.sin(Date.now() * 0.008) > 0;
    if (pulse) {
      mmCtx.fillStyle = '#ff0000';
      const cx = game.activeCrime.x * scaleX;
      const cy = game.activeCrime.y * scaleY;
      mmCtx.beginPath();
      mmCtx.arc(cx, cy, 3, 0, Math.PI * 2);
      mmCtx.fill();
    }
  }

  // Horse location as brown dot
  if (game.horse && !game.player.mounted) {
    mmCtx.fillStyle = '#8b5e3c';
    const hx = game.horse.x * scaleX;
    const hy = game.horse.y * scaleY;
    mmCtx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
  }

  // Train on minimap
  if (game.train) {
    mmCtx.fillStyle = '#ffd700';
    var trainMX = game.train.x * scaleX;
    var trainMY = game.train.y * scaleY;
    var trainML = (game.train.cars + 1) * 80 * scaleX;
    mmCtx.fillRect(trainMX - trainML, trainMY - 1, trainML + 10, 3);
  }

  // Player as gold dot
  if (game.player) {
    mmCtx.fillStyle = PALETTE.gold;
    const px = game.player.x * scaleX;
    const py = game.player.y * scaleY;
    mmCtx.fillRect(px - 2, py - 2, 4, 4);
    // Border
    mmCtx.strokeStyle = '#000000';
    mmCtx.lineWidth = 0.5;
    mmCtx.strokeRect(px - 2, py - 2, 4, 4);
  }

  // Minimap border
  mmCtx.strokeStyle = PALETTE.uiBorder;
  mmCtx.lineWidth = 2;
  mmCtx.strokeRect(0, 0, mw, mh);
}

// === END PART 3 ===// === PART 4: GAMEPLAY SYSTEMS ===

// ─────────────────────────────────────────────
// §A  GAME STATE OBJECT
// ─────────────────────────────────────────────
const game = {
  state: 'title',
  map: null,
  buildings: [],
  npcs: [],
  player: null,
  camera: { x: 0, y: 0 },
  time: 0.25,
  dayCount: 1,
  timeSpeed: 1 / (DAY_LENGTH * 60),
  reputation: 50,
  gold: 0,
  rank: 'Deputy',
  activeCrime: null,
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
  dialogState: null,
  duelState: null,
  showMinimap: true,
  stepTimer: 0,
  difficulty: 'normal',
  ammo: 24,
  totalGoldEarned: 0,
  totalShots: 0,
  totalHits: 0,
  meleeFights: 0,
  pokerWins: 0,
  pokerLosses: 0,
  healthTonics: 0,
  bribesTaken: 0,
  npcstalkedTo: new Set(),
  noDamageToday: true,
  achievements: [],
  wantedList: [],
  horse: null,
  mounted: false,
  currentWeapon: 'revolver',
  hasVest: false,
  hasSpeedBoots: false,
  hasShotgun: false,
  hasRifle: false,
  gunDurability: 100,
  shopOpen: false,
  shopType: null,
  pokerState: null,
  tutorialShown: {},
  ngPlusLevel: 0,
  ambientParticles: [],
  fireEffects: [],
  hostageNPC: null,
  waveCount: 0,
  journalTab: 'stats',
  duelsWon: 0,
  quickDrawTime: Infinity,
  nightWatchesCompleted: 0,
  tilesRidden: 0,
  bountiesCaptured: 0,
  speedResolveTime: Infinity,
  noDamageDays: 0,
  prayedToday: false,
  crimeStartTime: 0,
  train: null,
  _nearTrain: false
};

// ─────────────────────────────────────────────
// §B  CREATE PLAYER
// ─────────────────────────────────────────────
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
    interactCooldown: 0,
    meleeCooldown: 0,
    justShot: 0
  };
}

// ─────────────────────────────────────────────
// §C  HORSE SYSTEM
// ─────────────────────────────────────────────
function spawnHorse(x, y) {
  game.horse = {
    x: x * TILE + TILE / 2,
    y: y * TILE + TILE / 2,
    hp: 8,
    maxHp: 8,
    dir: 0,
    animFrame: 0,
    animTimer: 0,
    gallopTimer: 0
  };
}

function mountHorse() {
  if (!game.horse || game.mounted) return;
  if (dist(game.player, game.horse) > INTERACT_RANGE + 16) return;
  game.mounted = true;
  audio.playHorseNeigh();
  showNotification('Mounted up! Press H to dismount.');
  if (!game.tutorialShown.horse) {
    showTutorial('horse', 'You are now mounted! You move 2x faster but cannot shoot or interact. Press H to dismount.');
  }
}

function dismountHorse() {
  if (!game.mounted) return;
  game.mounted = false;
  game.horse.x = game.player.x + 20;
  game.horse.y = game.player.y;
  showNotification('Dismounted.');
}

// ─────────────────────────────────────────────
// §D  COLLISION SYSTEM
// ─────────────────────────────────────────────
function isSolidTile(tileX, tileY) {
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) return true;
  const t = game.map[tileY][tileX];
  return t === 3 || t === 5 || t === 6 || t === 7 || t === 10;
}

// Add arrested NPC to prisoners list (office.prisoners + game.prisoners)
function addPrisoner(name, crime, npc) {
  var prisoner = {
    name: name,
    crime: crime || 'Unknown',
    day: game.dayCount || 1,
    interrogated: false,
    npcRef: npc || null
  };
  game.prisoners.push(prisoner);
  if (typeof office !== 'undefined' && office.prisoners) {
    office.prisoners.push(prisoner);
  }
}

function canMove(x, y, radius) {
  const r = radius || 6;
  const corners = [
    [Math.floor((x - r) / TILE), Math.floor((y - r) / TILE)],
    [Math.floor((x + r) / TILE), Math.floor((y - r) / TILE)],
    [Math.floor((x - r) / TILE), Math.floor((y + r) / TILE)],
    [Math.floor((x + r) / TILE), Math.floor((y + r) / TILE)]
  ];
  return corners.every(function(c) { return !isSolidTile(c[0], c[1]); });
}

// ─────────────────────────────────────────────
// §E  DIALOG SYSTEM
// ─────────────────────────────────────────────
function openDialog(npc) {
  if (npc.dialogCooldown > 0) return;
  if (game.mounted) {
    showNotification('Dismount first to talk.');
    return;
  }
  npc.dialogCooldown = 120;
  game.npcstalkedTo.add(npc.id);

  var dialogEl = document.getElementById('dialog-box');
  var nameEl = document.getElementById('dialog-name');
  var textEl = document.getElementById('dialog-text');
  var choicesEl = document.getElementById('dialog-choices');
  var portraitEl = document.getElementById('dialog-portrait');

  // Draw portrait
  var pCanvas = document.createElement('canvas');
  pCanvas.width = 64; pCanvas.height = 64;
  var pCtx = pCanvas.getContext('2d');
  pCtx.fillStyle = '#140c04';
  pCtx.fillRect(0, 0, 64, 64);
  pCtx.fillStyle = npc.colors.skin;
  pCtx.fillRect(20, 20, 24, 24);
  pCtx.fillStyle = npc.colors.shirt || npc.colors.body || '#6a4a2a';
  pCtx.fillRect(16, 44, 32, 20);
  if (npc.colors.hat) {
    pCtx.fillStyle = npc.colors.hat;
    pCtx.fillRect(14, 12, 36, 10);
    pCtx.fillRect(18, 4, 28, 12);
  }
  pCtx.fillStyle = '#1a1008';
  pCtx.fillRect(24, 28, 4, 4);
  pCtx.fillRect(36, 28, 4, 4);
  portraitEl.style.background = 'url(' + pCanvas.toDataURL() + ') center/cover';

  nameEl.textContent = npc.name;
  choicesEl.innerHTML = '';

  var dialogs = DIALOGS[npc.type] || DIALOGS.townsperson;
  var text = '';
  var choices = [];

  // Personality modifier
  var personality = npc.personality || 'neutral';
  var repMod = '';
  if (game.reputation < 20) {
    repMod = 'low';
  } else if (game.reputation > 80) {
    repMod = 'high';
  }

  if (npc.hostile) {
    text = dialogs.hostile ? dialogs.hostile[rand(0, dialogs.hostile.length - 1)] : "I'll get you, lawman!";
    choices = [
      { text: '1. Draw your weapon! [Duel]', action: 'duel' },
      { text: '2. "Stand down, partner."', action: 'intimidate' },
      { text: '3. Walk away', action: 'leave' }
    ];
  } else if (npc.type === NPC_TYPES.OUTLAW && !npc.hostile) {
    var isAlly = typeof isOutlawAlly === 'function' && isOutlawAlly();
    if (isAlly) {
      var allyDialogs = [
        "Hey boss, need anything? I got some goods...",
        "Sheriff! Good to see a friend. What's the play?",
        "We're on the same side now, right?",
        "Got a deal for you, partner. Unless you got other plans...",
        "The boys and I are laying low. What do you need?"
      ];
      text = allyDialogs[rand(0, allyDialogs.length - 1)];
      choices = [
        { text: '1. "You\'re under arrest." [Betray]', action: 'arrest' },
        { text: '2. Black market deal', action: 'ally_deal' },
        { text: '3. "Keep your head down."', action: 'leave' }
      ];
    } else {
      var surrenderDialogs = dialogs.surrender;
      text = surrenderDialogs[rand(0, surrenderDialogs.length - 1)];
      choices = [
        { text: '1. "You\'re under arrest."', action: 'arrest' },
        { text: '2. "Get out of my town."', action: 'banish' },
        { text: '3. Accept bribe ($50)', action: 'bribe' }
      ];
    }
  } else if (npc.questGiver && !game.activeQuest && Math.random() > 0.4) {
    text = dialogs.quest ? dialogs.quest[rand(0, dialogs.quest.length - 1)] : dialogs.idle[rand(0, dialogs.idle.length - 1)];
    choices = [
      { text: "1. What's the job?", action: 'accept_quest' },
      { text: "2. Not right now.", action: 'leave' }
    ];
  } else if (npc.type === NPC_TYPES.BARTENDER) {
    if (Math.random() > 0.5 && dialogs.tips) {
      // Pick or spawn a REAL suspicious NPC and make the tip truthful
      var tipTemplates = dialogs.tips;
      var suspectNPC = null;
      var suspectBuilding = null;
      // Always spawn a fresh hiding NPC near a random building
      // This guarantees the person is ACTUALLY there when the bartender says so
      suspectBuilding = game.buildings[rand(0, game.buildings.length - 1)];
      var spawnX = suspectBuilding.doorX || (suspectBuilding.x + Math.floor(suspectBuilding.w / 2));
      var spawnY = suspectBuilding.doorY || (suspectBuilding.y + suspectBuilding.h);
      var hiddenNames = ['Shady Jake', 'Mystery Man', 'The Lurker', 'Sneaky Pete', 'Shadow', 'The Rat', 'Slippery Sam', 'Crooked Carl', 'Two-Face Tom', 'Whisper'];
      suspectNPC = createNPC(game.npcs.length + 500 + rand(0, 999), NPC_TYPES.OUTLAW, hiddenNames[rand(0, hiddenNames.length - 1)], spawnX + rand(-2, 2), spawnY + rand(1, 3), null);
      suspectNPC.hostile = false; // Hiding — not hostile yet
      suspectNPC._hiding = true;
      suspectNPC._hideBuilding = suspectBuilding;
      suspectNPC._hidingTimer = 0;
      suspectNPC.hp = rand(4, 7);
      suspectNPC.maxHp = suspectNPC.hp;
      game.npcs.push(suspectNPC);
      addJournalEntry('Bartender tip: ' + suspectNPC.name + ' acting suspicious near ' + suspectBuilding.name + '.');
      text = tipTemplates[rand(0, tipTemplates.length - 1)]
        .replace('{name}', suspectNPC.name)
        .replace('{place}', suspectBuilding.name);
    } else {
      text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    }
    choices = [
      { text: "1. Buy a drink ($5)", action: 'buy_drink' },
      { text: '2. Play Poker ($10)', action: 'poker' },
      { text: "3. Arm wrestle ($25)", action: 'arm_wrestle' }
    ];
  } else if (npc.type === NPC_TYPES.SHOPKEEPER) {
    text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    if (repMod === 'low') {
      text = "You got a lot of nerve showin' your face in here, Sheriff.";
    } else if (repMod === 'high') {
      text = "Sheriff! Always a pleasure. Got some special deals for you today.";
    }
    choices = [
      { text: '1. Open Shop', action: 'shop' },
      { text: '2. Buy Health Tonic ($25)', action: 'buy_health' },
      { text: '3. Buy Ammo ($10)', action: 'buy_ammo' },
    ];
  } else if (npc.type === NPC_TYPES.PREACHER) {
    text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    choices = [
      { text: '1. Pray (+2 Rep)', action: 'pray' },
      { text: '2. "Bless you, Father."', action: 'leave' }
    ];
  } else if (npc.type === NPC_TYPES.STRANGER) {
    text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    if (repMod === 'low') {
      text = "Heh. Heard you're not exactly a model lawman...";
    }
    choices = [
      { text: '1. "Who are you?"', action: 'investigate' },
      { text: '2. "Move along."', action: 'leave' },
      { text: '3. Challenge to duel', action: 'duel' }
    ];
  } else if (npc.type === NPC_TYPES.BOUNTY) {
    text = "You'll never take me alive!";
    choices = [
      { text: '1. "Surrender peacefully!"', action: 'intimidate' },
      { text: '2. Draw! [Duel]', action: 'duel' },
      { text: '3. "You\'re under arrest."', action: 'arrest' }
    ];
  } else {
    // Check if there's a real threat to hint about
    var _hasThreat = false;
    var _threatNPC = null;
    var _threatBuilding = null;
    for (var _ti = 0; _ti < game.npcs.length; _ti++) {
      var _tn = game.npcs[_ti];
      if ((_tn.hostile || _tn._hiding || _tn._isWanted || _tn.type === NPC_TYPES.BOUNTY) && _tn.state !== 'dead' && _tn.state !== 'arrested') {
        _hasThreat = true; _threatNPC = _tn; break;
      }
    }
    // 30% chance to give a threat hint if one exists, or 15% to spawn one
    if (_hasThreat && Math.random() < 0.3 && dialogs.threat_hints) {
      // Pick a building and MOVE the threat NPC to it so the tip is truthful
      _threatBuilding = game.buildings[rand(0, game.buildings.length - 1)];
      var _mvX = (_threatBuilding.doorX || (_threatBuilding.x + Math.floor(_threatBuilding.w / 2))) * TILE;
      var _mvY = ((_threatBuilding.doorY || (_threatBuilding.y + _threatBuilding.h)) + rand(1, 3)) * TILE;
      _threatNPC.x = _mvX + rand(-20, 20);
      _threatNPC.y = _mvY + rand(0, 30);
      _threatNPC._hiding = true;
      _threatNPC._hideBuilding = _threatBuilding;
      _threatNPC._hidingTimer = 0;
      _threatNPC.hostile = false;
      text = dialogs.threat_hints[rand(0, dialogs.threat_hints.length - 1)].replace('{place}', _threatBuilding.name);
    } else if (!_hasThreat && Math.random() < 0.15 && dialogs.threat_hints) {
      // Spawn a real hidden outlaw so the hint is truthful
      _threatBuilding = game.buildings[rand(0, game.buildings.length - 1)];
      var _spX = (_threatBuilding.doorX || (_threatBuilding.x + Math.floor(_threatBuilding.w / 2)));
      var _spY = (_threatBuilding.doorY || (_threatBuilding.y + _threatBuilding.h));
      var _hNames = ['Shady Stranger', 'The Drifter', 'Masked Figure', 'Wanted Man', 'Suspicious Joe'];
      var _newOutlaw = createNPC(game.npcs.length + 600, NPC_TYPES.OUTLAW, _hNames[rand(0, _hNames.length - 1)], _spX + rand(-2, 2), _spY + rand(1, 3), null);
      _newOutlaw._hiding = true;
      _newOutlaw._hideBuilding = _threatBuilding;
      _newOutlaw._hidingTimer = 0;
      _newOutlaw.hostile = false;
      _newOutlaw.hp = rand(4, 7);
      _newOutlaw.maxHp = _newOutlaw.hp;
      game.npcs.push(_newOutlaw);
      text = dialogs.threat_hints[rand(0, dialogs.threat_hints.length - 1)].replace('{place}', _threatBuilding.name);
      addJournalEntry('Townsfolk report: ' + _newOutlaw.name + ' spotted near ' + _threatBuilding.name + '.');
    } else {
      text = dialogs.idle[rand(0, dialogs.idle.length - 1)];
    }
    if (personality === 'grumpy') {
      text = "What do you want? I'm busy.";
    } else if (personality === 'friendly' && repMod === 'high') {
      text = "Sheriff! You're the best thing that ever happened to this town!";
    } else if (repMod === 'low') {
      text = "I don't trust you much, Sheriff...";
    }
    choices = [
      { text: '1. "Stay safe out there."', action: 'leave' },
      { text: '2. "Seen any trouble?"', action: 'ask_trouble' }
    ];
    if (game.activeQuest && game.activeQuest.type === 'bounty') {
      choices.push({ text: '3. Ask about bounty', action: 'investigate' });
    }
  }

  textEl.textContent = text;

  for (var ci = 0; ci < choices.length; ci++) {
    var choice = choices[ci];
    var btn = document.createElement('button');
    btn.className = 'dialog-choice';
    btn.textContent = choice.text;
    btn.setAttribute('data-action', choice.action);
    btn.onclick = (function(act, n) { return function() { handleDialogChoice(act, n); }; })(choice.action, npc);
    choicesEl.appendChild(btn);
  }

  dialogEl.classList.remove('hidden');
  game.state = 'dialog';
  game.dialogState = { npc: npc };
}

function handleDialogChoice(action, npc) {
  var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;

  switch (action) {
    case 'leave':
      closeDialog();
      break;

    case 'duel':
      closeDialog();
      startDuel(npc);
      break;

    case 'intimidate':
      var successChance = game.reputation >= 60 ? 0.7 : (game.reputation >= 40 ? 0.4 : 0.15);
      if (Math.random() < successChance) {
        npc.hostile = false;
        npc.surrendered = true;
        showNotification(npc.name + ' backs down! +3 Rep');
        game.reputation = clamp(game.reputation + Math.round(3 * diff.repGainMult), 0, REPUTATION_MAX);
        audio.playDing();
        closeDialog();
      } else {
        showNotification("They ain't scared of you!");
        closeDialog();
        startDuel(npc);
        return;
      }
      break;

    case 'arrest':
      var wasAlly = typeof isOutlawAlly === 'function' && isOutlawAlly();
      npc.state = 'arrested';
      npc.hostile = false;
      game.reputation = clamp(game.reputation + Math.round(8 * diff.repGainMult), 0, REPUTATION_MAX);
      game.gold += 30;
      game.totalGoldEarned += 30;
      game.outlawsArrested++;
      addPrisoner(npc.name, npc.type === NPC_TYPES.BOUNTY ? 'Wanted Criminal' : (npc.type === NPC_TYPES.OUTLAW ? 'Outlaw' : 'Civilian'), npc);
      if (npc.type === NPC_TYPES.BOUNTY) {
        game.bountiesCaptured++;
        game.gold += 70;
        game.totalGoldEarned += 70;
        showNotification(npc.name + ' captured! +8 Rep, +$100 bounty');
      } else if (wasAlly) {
        game.corruption = clamp((game.corruption || 0) - 10, 0, 100);
        showNotification('Betrayed ' + npc.name + '! +8 Rep, +$30, -10 Corruption');
      } else {
        showNotification(npc.name + ' arrested! +8 Rep, +$30');
      }
      audio.playDing();
      addJournalEntry(wasAlly ? 'Betrayed and arrested ally ' + npc.name + '.' : 'Arrested ' + npc.name + '.');
      closeDialog();
      break;

    case 'ally_deal':
      if (typeof _blackMarketDeal === 'function') {
        _blackMarketDeal(npc);
      } else {
        game.gold += rand(20, 60);
        showNotification('Shady deal with ' + npc.name + '. Got some gold.');
      }
      closeDialog();
      break;

    case 'banish':
      npc.state = 'dead';
      game.reputation = clamp(game.reputation + Math.round(2 * diff.repGainMult), 0, REPUTATION_MAX);
      showNotification(npc.name + ' ran out of town. +2 Rep');
      closeDialog();
      break;

    case 'bribe':
      npc.state = 'dead';
      game.gold += 50;
      game.totalGoldEarned += 50;
      game.reputation = clamp(game.reputation - Math.round(10 * diff.repLossMult), 0, REPUTATION_MAX);
      game.bribesTaken++;
      showNotification('Took the bribe. +$50, -10 Rep');
      audio.playBad();
      addJournalEntry('Accepted bribe from ' + npc.name + '.');
      closeDialog();
      break;

    case 'arm_wrestle':
      if (game.gold >= 25) {
        if (typeof game._features !== 'undefined') {
          game.gold -= 25;
          var awOpponents = [
            { name: 'Big Buck', str: 1.2 },
            { name: 'Iron Arm Pete', str: 1.5 },
            { name: 'Mighty Mike', str: 1.8 },
            { name: 'Gentle Jim', str: 0.8 }
          ];
          var awOpp = awOpponents[rand(0, awOpponents.length - 1)];
          game._features.armWrestleOpponentStr = awOpp.str;
          game._features.armWrestleOpponentName = awOpp.name;
          game._features.armWrestleBet = 50; // pot is $50 (both put in $25)
          game._features.armWrestleTimer = 0;
          game._features.armWrestlePower = 50;
          game._features.armWrestleOpponentPower = 50;
          // Start with countdown phase, not active yet
          game._features.armWrestleCountdown = 3;
          game._features.armWrestlingActive = false;
          game._features._armWrestleCountdownActive = true;
          closeDialog();
          showNotification('Arm wrestling vs ' + awOpp.name + '! Get ready...');
        }
      } else {
        showNotification("You can't afford the $25 bet.");
        closeDialog();
      }
      break;

    case 'accept_quest':
      var quest = QUEST_TEMPLATES[rand(0, QUEST_TEMPLATES.length - 1)];
      // Build target building array for visit-type quests
      var questTargets = quest.targets;
      var questTargetBuildings = [];
      if (typeof quest.targets === 'number' && (quest.type === 'patrol' || quest.type === 'visit' || quest.type === 'collect_taxes' || quest.type === 'investigation')) {
        var allTypes = game.buildings.map(function(b) { return b.type; });
        var shuffled = allTypes.sort(function() { return Math.random() - 0.5; });
        var unique = [];
        for (var qi = 0; qi < shuffled.length; qi++) {
          if (unique.indexOf(shuffled[qi]) === -1) unique.push(shuffled[qi]);
          if (unique.length >= quest.targets) break;
        }
        questTargetBuildings = unique;
      }
      game.activeQuest = {
        name: quest.name,
        desc: quest.desc,
        type: quest.type,
        repReward: quest.repReward,
        goldReward: quest.goldReward,
        targets: questTargets,
        targetBuildings: questTargetBuildings,
        visited: new Set(),
        startTime: game.time,
        startDay: game.dayCount,
        startKills: game.outlawsKilled,
        nightTime: 0
      };
      showNotification('New Mission: ' + quest.name);
      addJournalEntry('Accepted mission: ' + quest.name);
      document.getElementById('quest-tracker').classList.remove('hidden');
      document.getElementById('quest-text').textContent = quest.desc;
      if (!game.tutorialShown.quest) {
        showTutorial('quest', 'You accepted a mission! Complete it for reputation and gold. Check your journal [J] for details.');
      }
      closeDialog();
      break;

    case 'buy_drink':
      if (game.gold >= 5) {
        game.gold -= 5;
        game.reputation = clamp(game.reputation + 1, 0, REPUTATION_MAX);
        showNotification('Enjoyed a whiskey. -$5, +1 Rep');
        if (typeof audio.playDrink === 'function') audio.playDrink();
      } else {
        showNotification("You can't afford that.");
      }
      closeDialog();
      break;

    case 'ask_trouble':
      if (game.activeCrime) {
        showNotification('Heard about trouble near the ' + (game.activeCrime.building ? game.activeCrime.building.name : 'streets') + '!');
      } else {
        // Check for hidden/hostile NPCs and report them truthfully
        var _troubleNPC = null, _troubleBuilding = null;
        for (var _tri = 0; _tri < game.npcs.length; _tri++) {
          var _trn = game.npcs[_tri];
          if ((_trn._hiding || _trn._isWanted || (_trn.hostile && _trn.type === NPC_TYPES.OUTLAW) || _trn.type === NPC_TYPES.BOUNTY) && _trn.state !== 'dead' && _trn.state !== 'arrested') {
            _troubleNPC = _trn; break;
          }
        }
        if (_troubleNPC) {
          // Find nearest building to this NPC
          var _trBDist = 9999;
          for (var _trbi = 0; _trbi < game.buildings.length; _trbi++) {
            var _trbd = Math.hypot(_troubleNPC.x - game.buildings[_trbi].x * TILE, _troubleNPC.y - game.buildings[_trbi].y * TILE);
            if (_trbd < _trBDist) { _trBDist = _trbd; _troubleBuilding = game.buildings[_trbi]; }
          }
          var _troubleMsgs = [
            'Saw ' + _troubleNPC.name + ' lurkin\' near the ' + (_troubleBuilding ? _troubleBuilding.name : 'edge of town') + '!',
            _troubleNPC.name + ' is hidin\' out near the ' + (_troubleBuilding ? _troubleBuilding.name : 'outskirts') + '. Watch yourself!',
            'Word is ' + _troubleNPC.name + ' been causin\' trouble near the ' + (_troubleBuilding ? _troubleBuilding.name : 'desert') + '.',
          ];
          showNotification(_troubleMsgs[rand(0, _troubleMsgs.length - 1)]);
          // If they were hiding, now they become hostile (cover blown)
          if (_troubleNPC._hiding) {
            _troubleNPC._hiding = false;
            _troubleNPC.hostile = true;
            showNotification(_troubleNPC.name + '\'s cover is blown! They\'re now hostile!');
          }
        } else {
          showNotification('All quiet for now, Sheriff.');
        }
      }
      closeDialog();
      break;

    case 'buy_health':
      var healthPrice = game.reputation < 20 ? 50 : (game.reputation > 80 ? 20 : 25);
      if (game.gold >= healthPrice) {
        game.gold -= healthPrice;
        game.player.hp = Math.min(game.player.hp + TONIC_HEAL_AMOUNT, game.player.maxHp);
        game.healthTonics++;
        showNotification('Health restored! -$' + healthPrice);
        audio.playDing();
      } else {
        showNotification("You can't afford that. ($" + healthPrice + ')');
      }
      closeDialog();
      break;

    case 'buy_ammo':
      var ammoPrice = game.reputation < 20 ? 20 : (game.reputation > 80 ? 8 : 10);
      if (game.gold >= ammoPrice) {
        game.gold -= ammoPrice;
        game.ammo = Math.min(game.ammo + 12, MAX_AMMO_CAP);
        showNotification('Ammo restocked! -$' + ammoPrice);
        if (typeof audio.playReload === 'function') audio.playReload();
      } else {
        showNotification("You can't afford that. ($" + ammoPrice + ')');
      }
      closeDialog();
      break;

    case 'pray':
      if (!game.prayedToday) {
        game.prayedToday = true;
        game.reputation = clamp(game.reputation + 2, 0, REPUTATION_MAX);
        showNotification('You pray for the town. +2 Rep');
        audio.playDing();
      } else {
        showNotification("You've already prayed today.");
      }
      closeDialog();
      break;

    case 'poker':
      closeDialog();
      openPoker();
      break;

    case 'shop':
      closeDialog();
      if (npc.type === NPC_TYPES.SHOPKEEPER) {
        openShop('general');
      } else {
        openShop('blacksmith');
      }
      break;

    case 'investigate':
      if (game.activeQuest && game.activeQuest.type === 'bounty') {
        // Give a real direction to an actual wanted NPC
        var _wantedNPC = null;
        for (var _wi = 0; _wi < game.npcs.length; _wi++) {
          if ((game.npcs[_wi]._isWanted || game.npcs[_wi].type === NPC_TYPES.BOUNTY) && game.npcs[_wi].state !== 'dead' && game.npcs[_wi].state !== 'arrested') {
            _wantedNPC = game.npcs[_wi]; break;
          }
        }
        if (_wantedNPC) {
          var _dx = _wantedNPC.x - game.player.x;
          var _dy = _wantedNPC.y - game.player.y;
          var _realDir = Math.abs(_dx) > Math.abs(_dy) ? (_dx > 0 ? 'east' : 'west') : (_dy > 0 ? 'south' : 'north');
          showNotification('They say ' + _wantedNPC.name + ' was seen heading ' + _realDir + ' of here.');
        } else {
          showNotification('No bounties to track right now.');
        }
      } else if (npc.type === NPC_TYPES.STRANGER) {
        if (Math.random() < 0.3) {
          npc.hostile = true;
          showNotification(npc.name + ' draws a weapon!');
          closeDialog();
          return;
        }
        // Check if this stranger knows about a real threat
        var _nearbyThreat = null;
        for (var _ni = 0; _ni < game.npcs.length; _ni++) {
          var _nn = game.npcs[_ni];
          if ((_nn._hiding || _nn._isWanted) && _nn.state !== 'dead' && _nn.state !== 'arrested' && _nn !== npc) {
            _nearbyThreat = _nn; break;
          }
        }
        if (_nearbyThreat) {
          showNotification('"Fine... I saw ' + _nearbyThreat.name + ' skulkin\' around. That\'s all I know."');
        } else {
          showNotification('"I told you, mind your own business."');
        }
      } else {
        // Check for any hidden threats to report
        var _hiddenThreat = null;
        for (var _hi = 0; _hi < game.npcs.length; _hi++) {
          if (game.npcs[_hi]._hiding && game.npcs[_hi].state !== 'dead') { _hiddenThreat = game.npcs[_hi]; break; }
        }
        if (_hiddenThreat) {
          showNotification('Come to think of it... ' + _hiddenThreat.name + ' has been acting strange.');
        } else {
          showNotification('Nothing suspicious here.');
        }
      }
      closeDialog();
      break;
  }
}

function closeDialog() {
  document.getElementById('dialog-box').classList.add('hidden');
  if (game.state === 'dialog') game.state = 'playing';
  game.dialogState = null;
}

// ─────────────────────────────────────────────
// §F  SHOP SYSTEM
// ─────────────────────────────────────────────
function openShop(type) {
  game.shopOpen = true;
  game.shopType = type;
  game.state = 'shop';

  var shopUI = document.getElementById('shop-ui');
  var titleEl = document.getElementById('shop-title');
  var itemsEl = document.getElementById('shop-items');

  titleEl.textContent = type === 'general' ? 'GENERAL STORE' : 'BLACKSMITH';
  shopUI.classList.remove('hidden');
  itemsEl.innerHTML = '';

  var items = SHOP_ITEMS[type] || [];
  var priceMult = game.reputation < 20 ? 2 : (game.reputation > 80 ? 0.8 : 1);

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var adjustedPrice = Math.round(item.price * priceMult);
    var alreadyOwned = false;
    if (item.oneTime) {
      if (item.id === 'vest' && game.hasVest) alreadyOwned = true;
      if (item.id === 'speed_boots' && game.hasSpeedBoots) alreadyOwned = true;
      if (item.id === 'shotgun' && game.hasShotgun) alreadyOwned = true;
      if (item.id === 'rifle' && game.hasRifle) alreadyOwned = true;
    }

    var div = document.createElement('div');
    div.className = 'shop-item';
    var canAfford = game.gold >= adjustedPrice && !alreadyOwned;

    div.innerHTML = '<span class="shop-icon">' + item.icon + '</span>' +
      '<span class="shop-name">' + item.name + '</span>' +
      '<span class="shop-desc">' + item.desc + '</span>' +
      '<span class="shop-price' + (!canAfford ? ' too-expensive' : '') + '">$' + adjustedPrice +
      (alreadyOwned ? ' (OWNED)' : '') + '</span>';

    if (canAfford) {
      var buyBtn = document.createElement('button');
      buyBtn.className = 'menu-btn shop-buy';
      buyBtn.textContent = 'BUY';
      buyBtn.onclick = (function(itm, price) {
        return function() { buyItem(itm, price); };
      })(item, adjustedPrice);
      div.appendChild(buyBtn);
    }

    itemsEl.appendChild(div);
  }

  if (!game.tutorialShown.shop) {
    showTutorial('shop', 'Welcome to the shop! Buy supplies and equipment. Prices change based on your reputation.');
  }
}

function buyItem(item, price) {
  if (game.gold < price) {
    showNotification("You can't afford that!");
    return;
  }
  game.gold -= price;

  switch (item.effect) {
    case 'healHP':
      game.player.hp = Math.min(game.player.hp + item.value, game.player.maxHp);
      game.healthTonics++;
      showNotification('Health restored!');
      audio.playDing();
      break;
    case 'addAmmo':
      game.ammo = Math.min(game.ammo + item.value, MAX_AMMO_CAP);
      showNotification('+' + item.value + ' ammo!');
      if (typeof audio.playReload === 'function') audio.playReload();
      break;
    case 'healHorse':
      if (game.horse) {
        game.horse.hp = Math.min(game.horse.hp + item.value, game.horse.maxHp);
        showNotification('Horse healed!');
      } else {
        showNotification("You don't have a horse nearby.");
        game.gold += price;
        return;
      }
      break;
    case 'repairGun':
      game.gunDurability = 100;
      showNotification('Gun repaired to full condition!');
      break;
    case 'addMaxHP':
      game.player.maxHp += item.value;
      game.player.hp += item.value;
      if (game.player.maxHp > MAX_HP_CAP) game.player.maxHp = MAX_HP_CAP;
      game.hasVest = true;
      showNotification('Bulletproof vest equipped! +2 Max HP');
      break;
    case 'addSpeed':
      game.hasSpeedBoots = true;
      showNotification('Speed boots equipped! +15% speed');
      break;
    case 'unlockShotgun':
      game.hasShotgun = true;
      showNotification('Shotgun unlocked! Spread shot available.');
      break;
    case 'unlockRifle':
      game.hasRifle = true;
      showNotification('Rifle unlocked! Long range precision.');
      break;
    case 'addSupplies':
      if (typeof game._features !== 'undefined') {
        game._features.campfireSupplies = (game._features.campfireSupplies || 0) + item.value;
        showNotification('+' + item.value + ' campfire supplies! (' + game._features.campfireSupplies + ' total)');
      } else {
        showNotification('+' + item.value + ' campfire supplies!');
      }
      break;
  }

  // Refresh shop display
  openShop(game.shopType);
}

function closeShop() {
  document.getElementById('shop-ui').classList.add('hidden');
  game.shopOpen = false;
  game.shopType = null;
  game.state = 'playing';
}

// ─────────────────────────────────────────────
// §G  POKER MINI-GAME
// ─────────────────────────────────────────────
var SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
var RANK_NAMES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
var SUIT_SYMBOLS = { hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663', spades: '\u2660' };
var SUIT_COLORS = { hearts: '#cc3030', diamonds: '#cc3030', clubs: '#222', spades: '#222' };

function makeDeck() {
  var deck = [];
  for (var s = 0; s < 4; s++) {
    for (var r = 0; r < 13; r++) {
      deck.push({ suit: SUITS[s], rank: r, held: false });
    }
  }
  // Shuffle
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
  }
  return deck;
}

function openPoker() {
  if (game.gold < 10) {
    showNotification("You need $10 to play poker.");
    return;
  }
  game.gold -= 10;
  game.state = 'poker';

  var deck = makeDeck();
  var hand = deck.splice(0, 5);
  game.pokerState = {
    deck: deck,
    hand: hand,
    phase: 'hold', // hold, result
    result: null,
    payout: 0
  };

  renderPokerUI();
  document.getElementById('poker-ui').classList.remove('hidden');
  if (typeof audio.playPokerChip === 'function') audio.playPokerChip();
}

function renderPokerUI() {
  var ps = game.pokerState;
  if (!ps) return;
  var content = document.getElementById('poker-content');
  var html = '<div class="poker-hand">';

  for (var i = 0; i < ps.hand.length; i++) {
    var card = ps.hand[i];
    var suitSym = SUIT_SYMBOLS[card.suit];
    var suitCol = SUIT_COLORS[card.suit];
    var rankStr = RANK_NAMES[card.rank];
    var heldClass = card.held ? ' held' : '';

    html += '<div class="poker-card' + heldClass + '" data-idx="' + i + '">';
    html += '<span class="card-rank" style="color:' + suitCol + '">' + rankStr + '</span>';
    html += '<span class="card-suit" style="color:' + suitCol + '">' + suitSym + '</span>';
    if (card.held) html += '<span class="card-held-label">HELD</span>';
    html += '</div>';
  }
  html += '</div>';

  if (ps.phase === 'hold') {
    html += '<p class="poker-info">Click cards to hold, then draw.</p>';
    html += '<button class="menu-btn" id="poker-draw-btn">DRAW</button>';
    html += '<button class="menu-btn" id="poker-quit-btn">FOLD</button>';
  } else {
    html += '<p class="poker-result">' + (ps.result || 'No winning hand') + '</p>';
    if (ps.payout > 0) {
      html += '<p class="poker-payout">Won $' + ps.payout + '!</p>';
    } else {
      html += '<p class="poker-payout">Better luck next time.</p>';
    }
    html += '<button class="menu-btn" id="poker-again-btn">PLAY AGAIN ($10)</button>';
    html += '<button class="menu-btn" id="poker-leave-btn">LEAVE TABLE</button>';
  }

  content.innerHTML = html;

  // Attach card click handlers
  var cards = content.querySelectorAll('.poker-card');
  for (var c = 0; c < cards.length; c++) {
    cards[c].addEventListener('click', (function(idx) {
      return function() { toggleHold(idx); };
    })(c));
  }

  // Attach button handlers
  if (ps.phase === 'hold') {
    var drawBtn = document.getElementById('poker-draw-btn');
    if (drawBtn) drawBtn.addEventListener('click', drawCards);
    var quitBtn = document.getElementById('poker-quit-btn');
    if (quitBtn) quitBtn.addEventListener('click', closePoker);
  } else {
    var againBtn = document.getElementById('poker-again-btn');
    if (againBtn) againBtn.addEventListener('click', function() {
      closePoker();
      openPoker();
    });
    var leaveBtn = document.getElementById('poker-leave-btn');
    if (leaveBtn) leaveBtn.addEventListener('click', closePoker);
  }
}

function toggleHold(index) {
  if (!game.pokerState || game.pokerState.phase !== 'hold') return;
  game.pokerState.hand[index].held = !game.pokerState.hand[index].held;
  if (typeof audio.playPokerChip === 'function') audio.playPokerChip();
  renderPokerUI();
}

function drawCards() {
  var ps = game.pokerState;
  if (!ps || ps.phase !== 'hold') return;

  for (var i = 0; i < ps.hand.length; i++) {
    if (!ps.hand[i].held && ps.deck.length > 0) {
      ps.hand[i] = ps.deck.shift();
    }
  }

  var eval_result = evaluateHand(ps.hand);
  ps.result = eval_result.name;
  ps.payout = eval_result.payout;
  ps.phase = 'result';

  if (ps.payout > 0) {
    game.gold += ps.payout;
    game.totalGoldEarned += ps.payout;
    game.pokerWins++;
    audio.playDing();
  } else {
    game.pokerLosses++;
  }

  renderPokerUI();
}

function evaluateHand(hand) {
  var ranks = hand.map(function(c) { return c.rank; }).sort(function(a, b) { return a - b; });
  var suits = hand.map(function(c) { return c.suit; });

  // Count rank occurrences
  var counts = {};
  for (var i = 0; i < ranks.length; i++) {
    counts[ranks[i]] = (counts[ranks[i]] || 0) + 1;
  }
  var vals = Object.values(counts).sort(function(a, b) { return b - a; });

  // Check flush
  var isFlush = suits.every(function(s) { return s === suits[0]; });

  // Check straight
  var isStraight = false;
  var uniqueRanks = Object.keys(counts).map(Number).sort(function(a, b) { return a - b; });
  if (uniqueRanks.length === 5) {
    if (uniqueRanks[4] - uniqueRanks[0] === 4) {
      isStraight = true;
    }
    // Ace-low straight: A,2,3,4,5
    if (uniqueRanks[0] === 0 && uniqueRanks[1] === 1 && uniqueRanks[2] === 2 && uniqueRanks[3] === 3 && uniqueRanks[4] === 12) {
      isStraight = true;
    }
  }

  // Four of a kind
  if (vals[0] === 4) return { name: 'Four of a Kind!', payout: 200 };
  // Full house
  if (vals[0] === 3 && vals[1] === 2) return { name: 'Full House!', payout: 100 };
  // Straight flush
  if (isFlush && isStraight) return { name: 'Straight Flush!', payout: 500 };
  // Flush
  if (isFlush) return { name: 'Flush!', payout: 80 };
  // Straight
  if (isStraight) return { name: 'Straight!', payout: 60 };
  // Three of a kind
  if (vals[0] === 3) return { name: 'Three of a Kind!', payout: 40 };
  // Two pair
  if (vals[0] === 2 && vals[1] === 2) return { name: 'Two Pair!', payout: 25 };
  // Pair
  if (vals[0] === 2) return { name: 'Pair!', payout: 15 };

  return { name: null, payout: 0 };
}

function closePoker() {
  document.getElementById('poker-ui').classList.add('hidden');
  game.pokerState = null;
  game.state = 'playing';
}

// ─────────────────────────────────────────────
// §H  DUEL SYSTEM
// ─────────────────────────────────────────────
function startDuel(npc) {
  game.state = 'duel';
  var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
  var repBonus = Math.floor(game.reputation / 20) * 3;

  game.duelState = {
    npc: npc,
    phase: 'staredown',
    timer: 0,
    drawTime: rand(120, 240),
    playerDrew: false,
    npcDrew: false,
    result: null,
    reactionWindow: Math.floor(diff.duelWindow / 16.67) + repBonus
  };

  document.getElementById('duel-ui').classList.remove('hidden');
  document.getElementById('duel-prompt').textContent = 'STARE DOWN...';
  document.getElementById('duel-timer').textContent = 'Wait for it...';
  document.getElementById('duel-instructions').textContent = '';

  if (!game.tutorialShown.duel) {
    showTutorial('duel', 'DUEL! Wait for "DRAW!" to appear, then press SPACE as fast as you can. Shooting early is dishonorable (-15 Rep)!');
    game.tutorialShown.duel = true;
  }

  if (typeof audio.playWesternRiff === 'function') audio.playWesternRiff();
}

function updateDuel() {
  var d = game.duelState;
  if (!d) return;

  d.timer++;

  if (d.phase === 'staredown') {
    if (consumeKey('Space')) {
      d.phase = 'result';
      d.result = 'dishonorable';
      document.getElementById('duel-prompt').textContent = 'DISHONORABLE!';
      document.getElementById('duel-timer').textContent = 'You shot before the draw!';
      var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
      game.reputation = clamp(game.reputation - Math.round(15 * diff.repLossMult), 0, REPUTATION_MAX);
      d.npc.state = 'dead';
      game.outlawsKilled++;
      audio.playGunshot();
      audio.playBad();
      showNotification('Dishonorable kill! -15 Rep');
      addJournalEntry('Dishonorably shot ' + d.npc.name + ' before the draw.');
      setTimeout(endDuel, 2000);
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
      var reactionMs = Math.round(d.timer * 16.67);

      if (d.timer < d.reactionWindow) {
        d.result = 'win';
        document.getElementById('duel-prompt').textContent = 'YOU WIN!';
        document.getElementById('duel-timer').textContent = 'Quick draw! ' + reactionMs + 'ms';
        d.npc.state = 'dead';
        d.npc.hostile = false;
        var diff2 = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
        game.reputation = clamp(game.reputation + Math.round(10 * diff2.repGainMult), 0, REPUTATION_MAX);
        game.gold += 50;
        game.totalGoldEarned += 50;
        game.outlawsKilled++;
        game.duelsWon++;
        if (reactionMs < game.quickDrawTime) game.quickDrawTime = reactionMs;
        audio.playGunshot();
        setTimeout(function() { audio.playVictory(); }, 300);
        showNotification('Duel won! +10 Rep, +$50');
        addJournalEntry('Won duel against ' + d.npc.name + ' (' + reactionMs + 'ms).');
      } else {
        if (game._cheatMode) {
          d.result = 'win';
          document.getElementById('duel-prompt').textContent = 'INVINCIBLE!';
          document.getElementById('duel-timer').textContent = 'Bullet bounced off you!';
          d.npc.state = 'dead';
          d.npc.hostile = false;
          game.outlawsKilled++;
          game.duelsWon++;
          audio.playGunshot();
          showNotification('Cheat mode: You won anyway!');
        } else {
          d.result = 'lose';
          document.getElementById('duel-prompt').textContent = 'TOO SLOW!';
          document.getElementById('duel-timer').textContent = 'They got you...';
          game.player.hp -= 2;
          game.noDamageToday = false;
          audio.playGunshot();
          particles.emitBlood(game.player.x, game.player.y);
          if (game.player.hp <= 0) {
            game.gameOverReason = 'Killed in a duel by ' + d.npc.name + '.';
          }
        }
      }
      setTimeout(endDuel, 2000);
    }

    if (d.timer >= d.reactionWindow && !d.playerDrew) {
      d.phase = 'result';
      if (game._cheatMode) {
        d.result = 'win';
        document.getElementById('duel-prompt').textContent = 'INVINCIBLE!';
        document.getElementById('duel-timer').textContent = 'Bullet bounced off you!';
        d.npc.state = 'dead';
        d.npc.hostile = false;
        game.outlawsKilled++;
        game.duelsWon++;
        audio.playGunshot();
        showNotification('Cheat mode: You won anyway!');
      } else {
        d.result = 'lose';
        document.getElementById('duel-prompt').textContent = 'TOO SLOW!';
        document.getElementById('duel-timer').textContent = 'They drew first!';
        game.player.hp -= 2;
        game.noDamageToday = false;
        audio.playGunshot();
        particles.emitBlood(game.player.x, game.player.y);
        if (game.player.hp <= 0) {
          game.gameOverReason = 'Killed in a duel by ' + d.npc.name + '.';
        }
      }
      setTimeout(endDuel, 2000);
    }
  }
}

function endDuel() {
  document.getElementById('duel-ui').classList.add('hidden');
  if (typeof audio.stopWesternRiff === 'function') audio.stopWesternRiff();
  game.duelState = null;
  if (game.player.hp <= 0 && !game._cheatMode) {
    game.state = 'gameover';
  } else {
    if (game._cheatMode && game.player.hp <= 0) game.player.hp = game.player.maxHp;
    game.state = 'playing';
  }
}

// ─────────────────────────────────────────────
// §I  MELEE SYSTEM
// ─────────────────────────────────────────────
function playerMelee() {
  if (game.player.meleeCooldown > 0) return;
  game.player.meleeCooldown = Math.floor(MELEE_COOLDOWN / 16.67);

  audio.playMelee();
  game.meleeFights++;

  // Melee particles
  var dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  var dd = dirs[game.player.dir];
  var mx = game.player.x + dd[0] * MELEE_RANGE;
  var my = game.player.y + dd[1] * MELEE_RANGE;
  particles.emitSpark(mx, my);

  // Check NPC hits in melee range (generous 40px range)
  var hitAny = false;
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.state === 'dead' || npc.state === 'arrested') continue;
    var isHostile = npc.hostile || npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY;
    // Cheat mode: can't hit innocents
    if (game._cheatMode && !isHostile) continue;
    var d = dist(game.player, npc);
    if (d < MELEE_RANGE + 20) {
      npc.hp--;
      hitAny = true;
      particles.emitBlood(npc.x, npc.y);

      // Knockback
      var angle = angleBetween(game.player, npc);
      npc.x += Math.cos(angle) * 15;
      npc.y += Math.sin(angle) * 15;

      if (npc.hp <= 0) {
        // If hostile or outlaw, auto-arrest at 0 HP via melee
        if (npc.hostile || npc.type === NPC_TYPES.OUTLAW || npc.type === NPC_TYPES.BOUNTY) {
          npc.state = 'arrested';
          npc.hostile = false;
          game.outlawsArrested++;
          game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
          game.gold += 20;
          game.totalGoldEarned += 20;
          if (npc.type === NPC_TYPES.BOUNTY) game.bountiesCaptured++;
          addPrisoner(npc.name, npc.type === NPC_TYPES.BOUNTY ? 'Wanted Criminal' : 'Outlaw', npc);
          showNotification(npc.name + ' knocked out and arrested! +5 Rep');
          addJournalEntry('Melee arrested ' + npc.name + '.');
        } else {
          npc.state = 'arrested';
          npc.hostile = false;
          game.reputation = clamp(game.reputation - 15, 0, REPUTATION_MAX);
          addPrisoner(npc.name, 'Wrongful Arrest', npc);
          showNotification('You arrested an innocent! -15 Rep');
          audio.playBad();
        }
      } else if (npc.hp === 1 && (npc.hostile || npc.type === NPC_TYPES.OUTLAW)) {
        // Auto-arrest at 1 HP
        npc.state = 'arrested';
        npc.hostile = false;
        game.outlawsArrested++;
        game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
        game.gold += 30;
        game.totalGoldEarned += 30;
        if (npc.type === NPC_TYPES.BOUNTY) game.bountiesCaptured++;
        addPrisoner(npc.name, npc.type === NPC_TYPES.BOUNTY ? 'Wanted Criminal' : 'Outlaw', npc);
        showNotification(npc.name + ' subdued and arrested! +8 Rep');
        addJournalEntry('Subdued and arrested ' + npc.name + '.');
      }
      break; // Hit one NPC per melee swing
    }
  }
}

// ─────────────────────────────────────────────
// §J  UPDATE FUNCTIONS
// ─────────────────────────────────────────────

// J.1 - Update Player
// Helper: check if a minigame or feature is capturing input
function _inputBlockedByMinigameOrFeature() {
  if (game._minigames && game._minigames.activeMinigame) return true;
  if (game._features) {
    var _f = game._features;
    if (_f.armWrestlingActive || _f._armWrestleCountdownActive || _f.fishingMiniGame ||
        _f.horseRaceActive || _f.mineActive || _f.goldPanningActive) return true;
  }
  return false;
}
function updatePlayer(dt) {
  var p = game.player;
  var dx = 0, dy = 0;
  var _blocked = _inputBlockedByMinigameOrFeature();

  if (!_blocked) {
    if (keys['KeyW'] || keys['ArrowUp'])    { dy = -1; p.dir = 1; }
    if (keys['KeyS'] || keys['ArrowDown'])   { dy = 1;  p.dir = 0; }
    if (keys['KeyA'] || keys['ArrowLeft'])   { dx = -1; p.dir = 2; }
    if (keys['KeyD'] || keys['ArrowRight'])  { dx = 1;  p.dir = 3; }
  }

  p.moving = dx !== 0 || dy !== 0;

  // Speed calculation (dt-independent: multiply by dt*60 to normalize to 60fps)
  var speed = PLAYER_SPEED;
  if (game.hasSpeedBoots) speed *= 1.15;
  if (game.mounted) speed = HORSE_SPEED;
  var dtSpeed = speed * dt * 60;

  if (p.moving) {
    var len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    var nx = p.x + dx * dtSpeed;
    var ny = p.y + dy * dtSpeed;

    if (canMove(nx, p.y, 6)) p.x = nx;
    if (canMove(p.x, ny, 6)) p.y = ny;

    p.animTimer++;
    game.stepTimer++;

    var stepInterval = game.mounted ? 8 : 15;
    if (game.stepTimer >= stepInterval) {
      game.stepTimer = 0;
      particles.emitDust(p.x, p.y + 10);
      if (game.mounted) {
        if (typeof audio.playHorseGallop === 'function') audio.playHorseGallop();
        // Galloping particles
        particles.emit(p.x - dx * 10, p.y + 12, 3, PALETTE.dust, 1.5, 15);
        game.tilesRidden++;
      } else {
        var tileType = tileAt(game.map, p.x, p.y);
        if (typeof audio.playStep === 'function') {
          audio.playStep(tileType);
        }
      }
    }

    // Update horse position when mounted
    if (game.mounted && game.horse) {
      game.horse.x = p.x;
      game.horse.y = p.y;
      game.horse.dir = p.dir;
      game.horse.animTimer++;
    }
  }

  // Clamp to map
  p.x = clamp(p.x, 8, WORLD_W - 8);
  p.y = clamp(p.y, 8, WORLD_H - 8);

  // Shooting
  if (p.shootCooldown > 0) p.shootCooldown--;
  if (p.justShot > 0) p.justShot--;
  // Don't shoot when a feature or minigame needs SPACE input
  var _featureBlocksShoot = false;
  if (game._features) {
    var _f = game._features;
    if (_f.armWrestlingActive || _f._armWrestleCountdownActive || _f.fishingMiniGame ||
        _f.horseRaceActive || _f.mineActive || _f.goldPanningActive) _featureBlocksShoot = true;
  }
  if (game._minigames && game._minigames.activeMinigame) _featureBlocksShoot = true;
  if (!game.mounted && !_featureBlocksShoot && consumeKey('Space') && game.state === 'playing' && p.shootCooldown <= 0) {
    if (game.ammo > 0) {
      game.ammo--;
      game.totalShots++;
      p.shootCooldown = 12;
      p.justShot = 8;

      // Convert cardinal dir (0=down,1=up,2=left,3=right) to radians
      var dirToRad = [Math.PI / 2, -Math.PI / 2, Math.PI, 0];
      var aimRad = dirToRad[p.dir] || 0;

      // Weapon-specific shooting
      if (game.currentWeapon === 'shotgun' && game.hasShotgun) {
        bullets.fire(p.x, p.y, aimRad, true, 'shotgun');
        game.ammo = Math.max(0, game.ammo - 1); // Extra ammo cost
      } else if (game.currentWeapon === 'rifle' && game.hasRifle) {
        bullets.fire(p.x, p.y, aimRad, true, 'rifle');
      } else {
        bullets.fire(p.x, p.y, aimRad, true, 'revolver');
      }
      p.lastShotTime = Date.now();

      // Gun durability
      game.gunDurability = Math.max(0, game.gunDurability - 1);
      if (game.gunDurability <= 20) {
        showNotification('Gun is wearing out! Visit the blacksmith.');
      }
    } else {
      showNotification('Out of ammo! Reloading...');
      // Auto-reload: give 6 ammo after a short delay
      game._reloading = true;
      p.shootCooldown = 60; // 1 second reload time
      setTimeout(function() {
        game.ammo += 6;
        game._reloading = false;
        if (typeof audio.playReload === 'function') audio.playReload();
        showNotification('Reloaded! +6 ammo');
      }, 1000);
    }
  }

  // Melee — don't consume F if near water (fishing) or open ground (campfire)
  if (p.meleeCooldown > 0) p.meleeCooldown--;
  if (!game.mounted && !_blocked && game.state === 'playing') {
    var _fKeyWanted = false;
    if (keysJustPressed['KeyF']) {
      // Check if features want F key (near water=fishing, open ground=campfire)
      var _ptx = Math.floor(p.x / TILE);
      var _pty = Math.floor(p.y / TILE);
      var _nearWater = false;
      for (var _wx = -2; _wx <= 2; _wx++) {
        for (var _wy = -2; _wy <= 2; _wy++) {
          var _twx = _ptx + _wx, _twy = _pty + _wy;
          if (_twx >= 0 && _twx < MAP_W && _twy >= 0 && _twy < MAP_H && game.map[_twy][_twx] === 5) _nearWater = true;
        }
      }
      var _nearBld = false;
      for (var _bi = 0; _bi < game.buildings.length; _bi++) {
        var _cb = game.buildings[_bi];
        if (_ptx >= _cb.x - 2 && _ptx <= _cb.x + _cb.w + 2 && _pty >= _cb.y - 2 && _pty <= _cb.y + _cb.h + 2) { _nearBld = true; break; }
      }
      var _tileHere = (game.map && game.map[_pty]) ? game.map[_pty][_ptx] : 0;
      var _canCamp = !_nearBld && (_tileHere === 0 || _tileHere === 1 || _tileHere === 9) && !_nearWater;
      _fKeyWanted = _nearWater || _canCamp; // features want this F press
    }
    if (!_fKeyWanted && consumeKey('KeyF')) {
      playerMelee();
    }
  }

  // Interact
  if (p.interactCooldown > 0) p.interactCooldown--;
  if (!_blocked && consumeKey('KeyE') && p.interactCooldown <= 0 && game.state === 'playing') {
    p.interactCooldown = 15;

    if (game.shopOpen) {
      closeShop();
      return;
    }

    if (!game.mounted) {
      // Find nearest NPC
      var nearest = null, nearDist = INTERACT_RANGE;
      for (var ni = 0; ni < game.npcs.length; ni++) {
        var npc = game.npcs[ni];
        if (npc.state === 'dead' || npc.state === 'arrested') continue;
        var d = dist(p, npc);
        if (d < nearDist) { nearest = npc; nearDist = d; }
      }
      if (nearest) {
        openDialog(nearest);
      } else {
        // Check building door
        var tx = Math.floor(p.x / TILE);
        var ty = Math.floor((p.y + 10) / TILE);
        if (game.map[ty] && game.map[ty][tx] === 4) {
          var building = null;
          for (var bi = 0; bi < game.buildings.length; bi++) {
            if (game.buildings[bi].doorX === tx && game.buildings[bi].doorY === ty) {
              building = game.buildings[bi];
              break;
            }
          }
          if (building) {
            game.visitedBuildings.add(building.type);
            if (typeof audio.playDoorOpen === 'function') audio.playDoorOpen();
            // Quest progress
            if (game.activeQuest && (game.activeQuest.type === 'patrol' || game.activeQuest.type === 'visit')) {
              game.activeQuest.visited.add(building.type);
            }
            // Jail building → open jail interior
            if (building.type === BUILDING_TYPES.JAIL && typeof office !== 'undefined') {
              game.state = 'jail';
              game._jailInterior = true;
              game._jailPlayerX = gameCanvas.width * 0.5;
              game._jailPlayerY = gameCanvas.height * 0.75;
              game._jailNearCell = -1;
              game._jailBribeOffer = null;
              showNotification('Entered Jail — ' + (office.prisoners.length > 0 ? office.prisoners.length + ' prisoner(s)' : 'Empty'));
            } else {
              showNotification('Entered ' + building.name);
            }
          }
        }
      }
    }
  }

  // Mount/dismount horse
  if (!_blocked && consumeKey('KeyH') && game.state === 'playing') {
    if (game.mounted) {
      dismountHorse();
    } else {
      mountHorse();
    }
  }

  // Quick shop via TAB near store
  if (consumeKey('Tab') && game.state === 'playing') {
    // Check if near a shop building
    for (var bsi = 0; bsi < game.buildings.length; bsi++) {
      var b = game.buildings[bsi];
      var bdist = Math.hypot(p.x - (b.x * TILE + b.w * TILE / 2), p.y - (b.y * TILE + b.h * TILE / 2));
      if (bdist < INTERACT_RANGE * 2) {
        if (b.type === BUILDING_TYPES.GENERAL) {
          openShop('general');
          return;
        }
        if (b.type === BUILDING_TYPES.BLACKSMITH) {
          openShop('blacksmith');
          return;
        }
      }
    }
    showNotification('No shop nearby. Walk closer to a store.');
  }

  // Weapon switch with number keys 4-6
  if (consumeKey('Digit4')) { game.currentWeapon = 'revolver'; showNotification('Switched to Revolver'); }
  if (consumeKey('Digit5') && game.hasShotgun) { game.currentWeapon = 'shotgun'; showNotification('Switched to Shotgun'); }
  if (consumeKey('Digit6') && game.hasRifle) { game.currentWeapon = 'rifle'; showNotification('Switched to Rifle'); }
}

// J.2 - Update NPCs
function updateNPCs(dt) {
  var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;

  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc.state === 'dead' || npc.state === 'arrested') continue;
    if (npc.dialogCooldown > 0) npc.dialogCooldown--;

    // Hiding NPC behavior — lurk near building, become hostile when player is close
    if (npc._hiding) {
      npc._hidingTimer = (npc._hidingTimer || 0) + dt;
      var hideDist = dist(npc, game.player);
      // Become hostile if player gets close or after hiding too long
      if (hideDist < 80 || npc._hidingTimer > 120) {
        npc._hiding = false;
        npc.hostile = true;
        if (hideDist < 120) {
          showNotification(npc.name + ' attacks from hiding!');
          addJournalEntry(npc.name + ' ambushed you from their hiding spot!');
        } else {
          showNotification(npc.name + ' has been flushed out and is now hostile!');
        }
      } else {
        // Lurk near their hiding building, move slowly
        if (npc._hideBuilding) {
          var hbx = (npc._hideBuilding.x + npc._hideBuilding.w / 2) * TILE;
          var hby = (npc._hideBuilding.y + npc._hideBuilding.h) * TILE;
          var hdx2 = hbx - npc.x, hdy2 = hby - npc.y;
          var hlen = Math.hypot(hdx2, hdy2);
          if (hlen > 40) { npc.x += (hdx2 / hlen) * 0.3; npc.y += (hdy2 / hlen) * 0.3; }
          else { npc.x += randF(-0.2, 0.2); npc.y += randF(-0.2, 0.2); }
        }
        continue; // Skip normal NPC behavior while hiding
      }
    }

    // Schedule system: NPCs move toward buildings at certain times
    if (npc.building && npc.type !== NPC_TYPES.OUTLAW) {
      // Night: go home
      if (game.time > 0.85 || game.time < 0.2) {
        if (npc.type === NPC_TYPES.TOWNSPERSON) {
          var homeB = game.buildings.filter(function(b) { return b.type === BUILDING_TYPES.HOUSE; });
          if (homeB.length > 0) {
            var target = homeB[npc.id % homeB.length];
            var tdx = (target.doorX * TILE) - npc.x;
            var tdy = (target.doorY * TILE) - npc.y;
            var tlen = Math.hypot(tdx, tdy);
            if (tlen > 16) {
              npc.x += (tdx / tlen) * npc.speed * 0.5;
              npc.y += (tdy / tlen) * npc.speed * 0.5;
              npc.state = 'walking';
              npc.animTimer++;
              continue;
            }
          }
        }
      }
      // Morning: bartender goes to saloon, shopkeeper to store, etc.
      if (game.time > 0.25 && game.time < 0.8) {
        var homeDist = Math.hypot(npc.x - npc.homeX, npc.y - npc.homeY);
        if (homeDist > 100) {
          var hdx = npc.homeX - npc.x;
          var hdy = npc.homeY - npc.y;
          var hlen = Math.hypot(hdx, hdy);
          npc.x += (hdx / hlen) * npc.speed;
          npc.y += (hdy / hlen) * npc.speed;
          npc.state = 'walking';
          npc.animTimer++;
          continue;
        }
      }
    }

    // Hostile NPC behavior
    if (npc.hostile && game.state === 'playing') {
      var playerDist = dist(npc, game.player);
      if (playerDist < 200) {
        var cdx = game.player.x - npc.x;
        var cdy = game.player.y - npc.y;
        var clen = Math.hypot(cdx, cdy);
        if (clen > 40) {
          var nnx = npc.x + (cdx / clen) * npc.speed;
          var nny = npc.y + (cdy / clen) * npc.speed;
          if (canMove(nnx, npc.y, 5)) npc.x = nnx;
          if (canMove(npc.x, nny, 5)) npc.y = nny;
          npc.state = 'walking';
          npc.facingRight = cdx >= 0;
          npc.animTimer++;
        }
        // Shoot at player occasionally (difficulty-scaled accuracy)
        var shootChance = 0.015 * diff.outlawDamageMult * (game.time > 0.8 || game.time < 0.2 ? diff.nightCrimeMult : 1);
        // Weather reduces accuracy (Feature 2)
        var weatherPenalty = 0;
        if (game._features) {
          var cw = game._features.weather;
          if (cw === 'fog') { shootChance *= 0.5; weatherPenalty = 0.3; }
          else if (cw === 'dust_storm' || cw === 'sandstorm') { shootChance *= 0.4; weatherPenalty = 0.4; }
          else if (cw === 'rain') { shootChance *= 0.7; weatherPenalty = 0.15; }
        }
        if (playerDist < 150 && Math.random() < shootChance) {
          var shootAngle = Math.atan2(cdy, cdx) + (weatherPenalty > 0 ? randF(-weatherPenalty, weatherPenalty) : 0);
          bullets.fire(npc.x, npc.y, shootAngle, false);
        }
      }
      continue;
    }

    // Escaped prisoner — flee toward map edge
    if (npc._escapee && npc._fleeTargetX !== undefined) {
      var fdx = npc._fleeTargetX - npc.x;
      var fdy = npc._fleeTargetY - npc.y;
      var flen = Math.hypot(fdx, fdy);
      if (flen > 20) {
        var fnx = npc.x + (fdx / flen) * npc.speed * 1.5;
        var fny = npc.y + (fdy / flen) * npc.speed * 1.5;
        if (canMove(fnx, npc.y, 5)) npc.x = fnx;
        if (canMove(npc.x, fny, 5)) npc.y = fny;
        npc.state = 'walking';
        npc.facingRight = fdx >= 0;
        npc.animTimer++;
      } else {
        // Reached edge — remove from world
        npc.state = 'dead';
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
      var wDirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
      var wd = wDirs[npc.dir];
      var wnx = npc.x + wd[0] * npc.speed;
      var wny = npc.y + wd[1] * npc.speed;

      if (canMove(wnx, wny, 5) && wnx > TILE && wnx < (MAP_W - 1) * TILE && wny > TILE && wny < (MAP_H - 1) * TILE) {
        npc.x = wnx;
        npc.y = wny;
        npc.facingRight = npc.dir === 3 || npc.dir === 0;
      } else {
        npc.dir = rand(0, 3);
      }
      npc.animTimer++;

      // Don't stray too far from home
      if (npc.building) {
        var hd = Math.hypot(npc.x - npc.homeX, npc.y - npc.homeY);
        if (hd > 80) {
          npc.dir = (npc.x > npc.homeX ? 2 : 3);
          if (Math.abs(npc.y - npc.homeY) > Math.abs(npc.x - npc.homeX)) {
            npc.dir = (npc.y > npc.homeY ? 1 : 0);
          }
        }
      }
    }

    // Flee from active crimes (townspeople)
    if (game.activeCrime && npc.type === NPC_TYPES.TOWNSPERSON) {
      var crimeDist = dist(npc, { x: game.activeCrime.x, y: game.activeCrime.y });
      if (crimeDist < 120) {
        var fdx = npc.x - game.activeCrime.x;
        var fdy = npc.y - game.activeCrime.y;
        var flen = Math.hypot(fdx, fdy) || 1;
        npc.x += (fdx / flen) * 2;
        npc.y += (fdy / flen) * 2;
        npc.state = 'walking';
      }
    }
  }
}

// J.3 - Update Crimes
function updateCrimes(dt) {
  var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
  game.crimeSpawnTimer -= dt;

  var ngMult = 1 + game.ngPlusLevel * 0.3;
  var interval = rand(20, 45) / diff.crimeFreqMult / ngMult;

  if (game.crimeSpawnTimer <= 0 && !game.activeCrime) {
    game.crimeSpawnTimer = interval;

    var crime = generateCrime(game.buildings, game);
    game.activeCrime = crime;
    game.crimeStartTime = Date.now();

    // Spawn outlaws for the crime
    for (var i = 0; i < crime.type.outlawCount; i++) {
      var name = NPC_NAMES.outlaw[rand(0, NPC_NAMES.outlaw.length - 1)];
      var npc = createNPC(
        game.npcs.length + i,
        NPC_TYPES.OUTLAW,
        name,
        Math.floor(crime.x / TILE) + rand(-2, 2),
        Math.floor(crime.y / TILE) + rand(-2, 2),
        null
      );
      npc.hostile = true;
      var hpVal = Math.ceil((2 + Math.floor(game.dayCount / 3)) * diff.outlawHPMult * ngMult);
      npc.hp = hpVal;
      npc.maxHp = hpVal;
      crime.outlawNPCs.push(npc);
      game.npcs.push(npc);
    }

    // Crime-type specific setups
    if (crime.type.name === 'Kidnapping') {
      // Find a townsperson to be hostage
      for (var hi = 0; hi < game.npcs.length; hi++) {
        if (game.npcs[hi].type === NPC_TYPES.TOWNSPERSON && game.npcs[hi].state !== 'dead') {
          game.hostageNPC = game.npcs[hi];
          game.hostageNPC.state = 'hostage';
          break;
        }
      }
    }

    if (crime.type.name === 'Arson') {
      game.fireEffects.push({
        x: crime.x,
        y: crime.y,
        life: crime.timeRemaining * 60,
        radius: 30
      });
    }

    showNotification('CRIME: ' + crime.type.desc);
    addJournalEntry(crime.type.name + ' at ' + (crime.building ? crime.building.name : 'the streets') + '!');
    if (typeof audio.playBellAlarm === 'function') audio.playBellAlarm();
    else audio.playBad();

    if (!game.tutorialShown.crime) {
      showTutorial('crime', 'A crime is in progress! Head to the red marker on your minimap. Deal with the outlaws to resolve it. Time is limited!');
    }
  }

  // Update active crime
  if (game.activeCrime) {
    var crime = game.activeCrime;
    crime.timeRemaining -= dt;

    // Update crime timer UI
    document.getElementById('crime-timer').classList.remove('hidden');
    document.getElementById('crime-timer-label').textContent = 'CRIME: ' + crime.type.name;
    document.getElementById('crime-timer-value').textContent = Math.max(0, Math.ceil(crime.timeRemaining)) + 's';

    // Crime-specific mechanics
    // Arson: fire spreads, damages nearby
    if (crime.type.name === 'Arson') {
      for (var fi = 0; fi < game.fireEffects.length; fi++) {
        var fire = game.fireEffects[fi];
        fire.life--;
        particles.emit(fire.x + randF(-fire.radius, fire.radius), fire.y + randF(-fire.radius, fire.radius), 1, '#ff6600', 2, 20);
        // Damage player if close
        if (dist(game.player, fire) < fire.radius + 10) {
          if (Math.random() < 0.01 && !game._cheatMode) {
            game.player.hp--;
            game.noDamageToday = false;
            showNotification('Burned by the fire! -1 HP');
          }
        }
      }
    }

    // Kidnapping: hostage slowly loses HP
    if (crime.type.name === 'Kidnapping' && game.hostageNPC && game.hostageNPC.state === 'hostage') {
      if (Math.random() < 0.002) {
        game.hostageNPC.hp--;
        if (game.hostageNPC.hp <= 0) {
          game.hostageNPC.state = 'dead';
          game.hostageNPC = null;
          game.reputation = clamp(game.reputation - 15, 0, REPUTATION_MAX);
          showNotification('The hostage was killed! -15 Rep');
          audio.playBad();
        }
      }
    }

    // Check if all outlaws dealt with
    var outlawsRemaining = crime.outlawNPCs.filter(function(o) {
      return o.state !== 'dead' && o.state !== 'arrested';
    }).length;

    if (outlawsRemaining === 0) {
      crime.resolved = true;
      game.activeCrime = null;
      game.crimesResolved++;

      var resolveTime = (Date.now() - game.crimeStartTime) / 1000;
      if (resolveTime < game.speedResolveTime) game.speedResolveTime = resolveTime;

      var goldReward = Math.round(crime.type.goldReward * diff.rewardMult);
      game.reputation = clamp(game.reputation + Math.round(crime.type.repGain * diff.repGainMult), 0, REPUTATION_MAX);
      game.gold += goldReward;
      game.totalGoldEarned += goldReward;
      showNotification('Crime resolved! +' + crime.type.repGain + ' Rep, +$' + goldReward);
      audio.playVictory();
      addJournalEntry('Resolved: ' + crime.type.name + '. Earned $' + goldReward + '.');

      // Clean up
      if (game.hostageNPC && game.hostageNPC.state === 'hostage') {
        game.hostageNPC.state = 'idle';
        game.hostageNPC = null;
      }
      game.fireEffects = [];

      document.getElementById('crime-timer').classList.add('hidden');
      return;
    }

    // Time ran out
    if (crime.timeRemaining <= 0) {
      game.activeCrime = null;
      game.crimesIgnored++;
      game.reputation = clamp(game.reputation - Math.round(crime.type.repLoss * diff.repLossMult), 0, REPUTATION_MAX);
      showNotification('Crime went unresolved! -' + crime.type.repLoss + ' Rep');
      audio.playBad();
      addJournalEntry('Failed to resolve: ' + crime.type.name + '.');
      // Remove crime outlaws
      for (var oi = 0; oi < crime.outlawNPCs.length; oi++) {
        if (crime.outlawNPCs[oi].state !== 'dead' && crime.outlawNPCs[oi].state !== 'arrested') {
          crime.outlawNPCs[oi].state = 'dead';
        }
      }
      if (game.hostageNPC) {
        game.hostageNPC.state = 'idle';
        game.hostageNPC = null;
      }
      game.fireEffects = [];
      document.getElementById('crime-timer').classList.add('hidden');
    }
  }
}

// J.4 - Update Quests
function updateQuests() {
  if (!game.activeQuest) return;
  var q = game.activeQuest;
  var complete = false;

  switch (q.type) {
    case 'patrol':
    case 'visit':
    case 'collect_taxes':
      if (q.visited.size >= q.targets) {
        complete = true;
      }
      document.getElementById('quest-text').textContent =
        q.desc + ' (' + q.visited.size + '/' + q.targets + ')';
      break;
    case 'investigation':
      if (q.visited.size >= q.targets) {
        complete = true;
      }
      document.getElementById('quest-text').textContent =
        q.desc + ' (' + q.visited.size + '/' + q.targets + ' witnesses)';
      break;
    case 'defend':
      if ((game.waveCount || 0) >= q.targets) complete = true;
      break;
    case 'poker_tournament':
      if ((game.pokerWins || 0) >= q.targets) complete = true;
      break;

    case 'bounty':
      if (game.outlawsKilled > (q.startKills || 0)) {
        complete = true;
      }
      if (!q.startKills) q.startKills = game.outlawsKilled;
      break;

    case 'nightwatch':
      if (game.time > 0.8 || game.time < 0.2) {
        q.nightTime = (q.nightTime || 0) + 1;
        if (q.nightTime > 300) {
          complete = true;
          game.nightWatchesCompleted++;
        }
      }
      break;

    case 'escort':
      if (game.visitedBuildings.has(BUILDING_TYPES.CHURCH)) {
        complete = true;
      }
      break;
  }

  if (complete) {
    var diff = DIFFICULTY[game.difficulty] || DIFFICULTY.normal;
    var repR = Math.round(q.repReward * diff.repGainMult);
    var goldR = Math.round(q.goldReward * diff.rewardMult);
    game.reputation = clamp(game.reputation + repR, 0, REPUTATION_MAX);
    game.gold += goldR;
    game.totalGoldEarned += goldR;
    showNotification('Mission Complete: ' + q.name + '! +' + repR + ' Rep, +$' + goldR);
    audio.playVictory();
    addJournalEntry('Completed mission: ' + q.name + '.');
    game.completedQuests.push(q);
    game.activeQuest = null;
    document.getElementById('quest-tracker').classList.add('hidden');
  }
}

// J.5 - Update Time
function updateTime(dt) {
  game.time += game.timeSpeed * dt * 60;
  if (game.time >= 1) {
    game.time -= 1;
    game.dayCount++;
    game.daysServed++;
    addJournalEntry('A new day dawns.');

    // Streaks & daily challenge
    checkDayStreaks();
    generateDailyChallenge();
    initDailyChallengeTracking();

    // Track no damage day
    if (game.noDamageToday) {
      game.noDamageDays++;
    }
    game.noDamageToday = true;
    game.prayedToday = false;

    // Weekly salary
    game.salaryTimer++;
    if (game.salaryTimer >= 7) {
      game.salaryTimer = 0;
      var rankData = getRank(game.reputation);
      var salary = Math.round((50 + game.reputation) * rankData.payBonus);
      game.gold += salary;
      game.totalGoldEarned += salary;
      showNotification('Weekly salary: $' + salary);
      addJournalEntry('Received weekly salary: $' + salary + '.');
    }

    // Heal overnight
    game.player.hp = Math.min(game.player.hp + 1, game.player.maxHp);

    // Random stranger arrival
    if (Math.random() > 0.7) {
      var stranger = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        NPC_NAMES.stranger[rand(0, NPC_NAMES.stranger.length - 1)],
        rand(5, MAP_W - 5), rand(5, MAP_H - 5), null
      );
      game.npcs.push(stranger);
      showNotification('A stranger has arrived in town...');
    }

    // Refresh wanted list periodically
    if (game.dayCount % 5 === 0) {
      generateWantedList();
    }

    // Train spawn check every 2 days
    if (!game.train && (game.dayCount || 1) % 2 === 0 && Math.random() < 0.6) {
      spawnTrain();
    }
  }

  // Update rank
  var newRank = getRank(game.reputation);
  if (newRank.name !== game.rank) {
    var promoted = RANKS.findIndex(function(r) { return r.name === newRank.name; }) >
                   RANKS.findIndex(function(r) { return r.name === game.rank; });
    game.rank = newRank.name;
    if (promoted) {
      showNotification('Promoted to ' + game.rank + '!');
      audio.playVictory();
      addJournalEntry('Promoted to ' + game.rank + '.');
    }
  }

  // Game over conditions
  if (game.reputation <= 0 && !game._cheatMode) {
    game.state = 'gameover';
    game.gameOverReason = 'Your reputation hit rock bottom. The town ran you out.';
  }
}

// J.5b - Train System
function spawnTrain() {
  if (game.train) return;
  game.train = {
    x: -400,
    y: 54 * TILE + TILE / 2,
    speed: 120,
    state: 'arriving',
    timer: 0,
    stopX: 38 * TILE,
    cars: rand(3, 5),
    lootGold: rand(100, 400),
    robbed: false,
    passengers: rand(5, 15)
  };
  showNotification('A TRAIN is approaching town!');
  addJournalEntry('A train is heading into town.');
}

function updateTrain(dt) {
  var t = game.train;
  if (!t) return;

  if (t.state === 'arriving') {
    t.x += t.speed * dt;
    if (t.x > t.stopX - 200) {
      t.speed = Math.max(10, t.speed - 80 * dt);
    }
    if (t.x >= t.stopX) {
      t.x = t.stopX;
      t.state = 'stopped';
      t.timer = 0;
      t.speed = 0;
      showNotification('Train stopped at the station! (1 minute)');
    }
  } else if (t.state === 'stopped') {
    t.timer += dt;
    if (t.timer >= 60) {
      t.state = 'departing';
      t.speed = 0;
      showNotification('The train is departing!');
    }
  } else if (t.state === 'departing') {
    t.speed = Math.min(200, t.speed + 60 * dt);
    t.x += t.speed * dt;
    if (t.x > MAP_W * TILE + 500) {
      game.train = null;
      game._nearTrain = false;
    }
  }

  // Train interaction check
  if (game.train && game.train.state === 'stopped') {
    var tr = game.train;
    var nearTrain = Math.abs(game.player.y - tr.y) < 50 &&
                    game.player.x > tr.x - 20 &&
                    game.player.x < tr.x + (tr.cars + 1) * 80 + 20;
    if (nearTrain) {
      game._nearTrain = true;
      if (consumeKey('KeyR') && !tr.robbed) {
        tr.robbed = true;
        var loot = tr.lootGold;
        game.gold = (game.gold || 0) + loot;
        game.totalGoldEarned = (game.totalGoldEarned || 0) + loot;
        game.corruption = clamp((game.corruption || 0) + 15, 0, 100);
        game.reputation = clamp((game.reputation || 50) - 20, 0, REPUTATION_MAX);
        showNotification('TRAIN ROBBERY! Stole $' + loot + '! +15 Corruption, -20 Rep');
        addJournalEntry('Robbed a train for $' + loot);
        // Spawn hostile guards
        for (var gi = 0; gi < 3; gi++) {
          var guard = createNPC(
            game.npcs.length, NPC_TYPES.OUTLAW,
            'Train Guard',
            Math.floor(tr.x / TILE) + gi * 2, 53, null
          );
          guard.hostile = true;
          guard.hp = 5;
          guard.maxHp = 5;
          game.npcs.push(guard);
        }
        tr.state = 'departing';
        tr.speed = 20;
      }
      if (consumeKey('KeyE') && !tr.robbed) {
        showNotification('The train is stopped. Press [R] to rob it, or wait and let it pass.');
      }
    } else {
      game._nearTrain = false;
    }
  }
}

function drawTrain(camX, camY) {
  var t = game.train;
  if (!t) return;

  var sx = t.x - camX;
  var sy = t.y - camY;

  var trainLen = (t.cars + 1) * 80;
  if (sx + trainLen < -50 || sx > canvas.width + 50) return;
  if (sy < -80 || sy > canvas.height + 80) return;

  ctx.save();

  var lx = sx, ly = sy;

  // Smoke (when moving)
  if (t.state !== 'stopped' || t.speed > 0) {
    var now = Date.now();
    for (var si = 0; si < 5; si++) {
      var smokeAge = (now * 0.003 + si * 0.5) % 3;
      var smokeX = lx + 10 - smokeAge * 20;
      var smokeY = ly - 35 - smokeAge * 15;
      var smokeSize = 4 + smokeAge * 6;
      ctx.globalAlpha = Math.max(0, 0.4 - smokeAge * 0.13);
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Locomotive body
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(lx - 10, ly - 20, 70, 28);
  // Boiler
  ctx.fillStyle = '#333333';
  ctx.fillRect(lx + 40, ly - 24, 25, 32);
  ctx.beginPath();
  ctx.arc(lx + 65, ly - 8, 16, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  // Cab
  ctx.fillStyle = '#4a2a1a';
  ctx.fillRect(lx - 10, ly - 28, 30, 8);
  ctx.fillStyle = '#6a4a2a';
  ctx.fillRect(lx - 8, ly - 26, 12, 6);
  // Smokestack
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(lx + 30, ly - 34, 8, 14);
  ctx.fillRect(lx + 27, ly - 37, 14, 4);
  // Cowcatcher
  ctx.fillStyle = '#555555';
  ctx.beginPath();
  ctx.moveTo(lx + 65, ly + 4);
  ctx.lineTo(lx + 78, ly + 8);
  ctx.lineTo(lx + 65, ly + 12);
  ctx.closePath();
  ctx.fill();
  // Headlight
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath();
  ctx.arc(lx + 68, ly - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(lx + 68, ly - 6, 2, 0, Math.PI * 2);
  ctx.fill();
  // Wheels
  ctx.fillStyle = '#1a1a1a';
  for (var wi = 0; wi < 3; wi++) {
    ctx.beginPath();
    ctx.arc(lx + 10 + wi * 22, ly + 12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    var rot = t.x * 0.05 + wi;
    ctx.beginPath();
    ctx.moveTo(lx + 10 + wi * 22 + Math.cos(rot) * 5, ly + 12 + Math.sin(rot) * 5);
    ctx.lineTo(lx + 10 + wi * 22 - Math.cos(rot) * 5, ly + 12 - Math.sin(rot) * 5);
    ctx.stroke();
  }
  // Connecting rod
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx + 10, ly + 12);
  ctx.lineTo(lx + 54, ly + 12);
  ctx.stroke();
  // Red trim
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(lx - 10, ly - 20, 70, 2);
  ctx.fillRect(lx - 10, ly + 6, 70, 2);

  // Cars
  for (var ci = 0; ci < t.cars; ci++) {
    var cx2 = lx - 25 - ci * 80;
    // Coupling
    ctx.fillStyle = '#555555';
    ctx.fillRect(cx2 + 55, ly + 2, 10, 3);

    if (ci === 0 && !t.robbed) {
      // Gold/cargo car
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(cx2, ly - 16, 55, 24);
      ctx.fillStyle = '#4a3a1a';
      ctx.fillRect(cx2 + 2, ly - 14, 51, 20);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('$', cx2 + 27, ly + 2);
    } else {
      // Passenger car
      ctx.fillStyle = '#6a3a1a';
      ctx.fillRect(cx2, ly - 16, 55, 24);
      ctx.fillStyle = '#8a5a2a';
      ctx.fillRect(cx2 + 2, ly - 14, 51, 20);
      // Windows
      ctx.fillStyle = '#aaccee';
      for (var ww = 0; ww < 4; ww++) {
        ctx.fillRect(cx2 + 6 + ww * 13, ly - 12, 8, 8);
      }
    }

    // Car wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx2 + 12, ly + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx2 + 42, ly + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rob prompt
  if (game._nearTrain && t.state === 'stopped' && !t.robbed) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[R] ROB TRAIN  |  [E] Inspect', sx + trainLen / 2, sy - 40);
    var remaining = Math.max(0, Math.ceil(60 - t.timer));
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('Departing in: ' + remaining + 's', sx + trainLen / 2, sy - 52);
  }

  if (t.robbed) {
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROBBED!', sx + 20, sy - 35);
  }

  ctx.restore();
}

// J.6 - Update Achievements
function updateAchievements() {
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var ach = ACHIEVEMENTS[i];
    if (game.achievements.indexOf(ach.id) !== -1) continue;

    var unlocked = false;

    switch (ach.check) {
      case 'checkDuelsWon':       unlocked = game.duelsWon >= ach.target; break;
      case 'checkArrests':        unlocked = game.outlawsArrested >= ach.target; break;
      case 'checkCrimesResolved': unlocked = game.crimesResolved >= ach.target; break;
      case 'checkQuickDraw':      unlocked = game.quickDrawTime <= ach.target; break;
      case 'checkPacifist':       unlocked = game.outlawsArrested >= ach.target && game.outlawsKilled === 0; break;
      case 'checkWealth':         unlocked = game.gold >= ach.target; break;
      case 'checkDaysSurvived':   unlocked = game.daysServed >= ach.target; break;
      case 'checkMaxRank':        unlocked = game.reputation >= ach.target; break;
      case 'checkNightWatches':   unlocked = game.nightWatchesCompleted >= ach.target; break;
      case 'checkShotsHit':       unlocked = game.totalHits >= ach.target; break;
      case 'checkMeleeWins':      unlocked = game.meleeFights >= ach.target; break;
      case 'checkPokerWins':      unlocked = game.pokerWins >= ach.target; break;
      case 'checkTilesRidden':    unlocked = game.tilesRidden >= ach.target; break;
      case 'checkBribesAccepted': unlocked = game.bribesTaken >= ach.target; break;
      case 'checkReputation':     unlocked = game.reputation >= ach.target; break;
      case 'checkIncorruptible':  unlocked = game.bribesTaken === 0 && game.daysServed >= 10; break;
      case 'checkAllBuildings':
        var totalBuildingTypes = new Set();
        for (var bi = 0; bi < game.buildings.length; bi++) {
          totalBuildingTypes.add(game.buildings[bi].type);
        }
        unlocked = game.visitedBuildings.size >= totalBuildingTypes.size;
        break;
      case 'checkNpcsTalkedTo':   unlocked = game.npcstalkedTo.size >= ach.target; break;
      case 'checkSurvivor':       unlocked = game.player && game.player.hp === 1 && game.daysServed > 0; break;
      case 'checkBountiesCaptured': unlocked = game.bountiesCaptured >= ach.target; break;
      case 'checkSpeedResolve':   unlocked = game.speedResolveTime <= ach.target; break;
      case 'checkTotalEarnings':  unlocked = game.totalGoldEarned >= ach.target; break;
      case 'checkTonicsBought':   unlocked = game.healthTonics >= ach.target; break;
      case 'checkDaysSurvived50': unlocked = game.daysServed >= ach.target; break;
      case 'checkNoDamageDay':    unlocked = game.noDamageDays >= 1; break;
    }

    if (unlocked) {
      game.achievements.push(ach.id);
      showNotification('Achievement Unlocked: ' + ach.icon + ' ' + ach.name);
      audio.playVictory();
      addJournalEntry('Earned badge: ' + ach.name + '.');
    }
  }
}

// J.7 - updateAmbientParticles defined in Part 5

// J.8 - Update Camera
function updateCamera() {
  var target = game.player;
  var shakeX = 0, shakeY = 0;
  if (typeof screenShake !== 'undefined' && screenShake > 0) {
    shakeX = randF(-screenShake, screenShake);
    shakeY = randF(-screenShake, screenShake);
  }
  game.camera.x = lerp(game.camera.x, target.x - canvas.width / 2, 0.08) + shakeX;
  game.camera.y = lerp(game.camera.y, target.y - canvas.height / 2, 0.08) + shakeY;
}

// ─────────────────────────────────────────────
// §K  UI UPDATE
// ─────────────────────────────────────────────
function updateUI() {
  document.getElementById('rep-bar-inner').style.width = game.reputation + '%';
  document.getElementById('rep-value').textContent = game.reputation;
  document.getElementById('day-count').textContent = 'Day ' + game.dayCount;
  document.getElementById('clock').textContent = getTimeString(game.time);

  var hpEl = document.getElementById('hp-display');
  hpEl.textContent = 'HP: ' + game.player.hp + '/' + game.player.maxHp;
  if (game.player.hp <= 2) {
    hpEl.style.color = PALETTE.uiDanger;
  } else {
    hpEl.style.color = '';
  }

  var ammoEl = document.getElementById('ammo-display');
  ammoEl.textContent = 'Ammo: ' + game.ammo;
  if (game.ammo <= 6) {
    ammoEl.style.color = PALETTE.uiDanger;
  } else {
    ammoEl.style.color = '';
  }

  document.getElementById('gold-display').textContent = '$' + game.gold;
  document.getElementById('rank-display').textContent = game.rank;

  // Crime timer UI
  if (game.activeCrime) {
    document.getElementById('crime-timer').classList.remove('hidden');
    document.getElementById('crime-timer-value').textContent = Math.max(0, Math.ceil(game.activeCrime.timeRemaining)) + 's';
  } else {
    document.getElementById('crime-timer').classList.add('hidden');
  }

  // Notification timer
  if (typeof notifTimer !== 'undefined' && notifTimer > 0) {
    notifTimer--;
    if (notifTimer <= 0) {
      document.getElementById('notification').classList.add('hidden');
    }
  }
}

// ─────────────────────────────────────────────
// §L  JOURNAL SYSTEM
// ─────────────────────────────────────────────
function addJournalEntry(text) {
  game.journalEntries.push({
    text: text,
    day: game.dayCount,
    time: getTimeString(game.time)
  });
}

function openJournal(tab) {
  game.state = 'journal';
  game.journalTab = tab || game.journalTab || 'stats';

  var panel = document.getElementById('journal-panel');
  var content = document.getElementById('journal-content');
  panel.classList.remove('hidden');

  // Update tab buttons
  var tabs = document.querySelectorAll('.jtab');
  for (var ti = 0; ti < tabs.length; ti++) {
    tabs[ti].classList.remove('active');
    if (tabs[ti].getAttribute('data-tab') === game.journalTab) {
      tabs[ti].classList.add('active');
    }
  }

  var html = '';

  switch (game.journalTab) {
    case 'stats':
      html += '<div class="journal-section">';
      html += '<div class="journal-entry">Rank: ' + game.rank + '</div>';
      html += '<div class="journal-entry">Days Served: ' + game.daysServed + '</div>';
      html += '<div class="journal-entry">Reputation: ' + game.reputation + '/' + REPUTATION_MAX + '</div>';
      html += '<div class="journal-entry">Gold: $' + game.gold + ' (Total earned: $' + game.totalGoldEarned + ')</div>';
      html += '<div class="journal-entry">Outlaws Killed: ' + game.outlawsKilled + '</div>';
      html += '<div class="journal-entry">Outlaws Arrested: ' + game.outlawsArrested + '</div>';
      html += '<div class="journal-entry">Crimes Resolved: ' + game.crimesResolved + '</div>';
      html += '<div class="journal-entry">Crimes Failed: ' + game.crimesIgnored + '</div>';
      html += '<div class="journal-entry">Duels Won: ' + game.duelsWon + '</div>';
      html += '<div class="journal-entry">Shots Fired: ' + game.totalShots + ' | Hits: ' + game.totalHits + '</div>';
      html += '<div class="journal-entry">Melee Fights: ' + game.meleeFights + '</div>';
      html += '<div class="journal-entry">Poker: ' + game.pokerWins + 'W / ' + game.pokerLosses + 'L</div>';
      html += '<div class="journal-entry">Bribes Taken: ' + game.bribesTaken + '</div>';
      html += '<div class="journal-entry">NPCs Talked To: ' + game.npcstalkedTo.size + '</div>';
      html += '<div class="journal-entry">Ammo: ' + game.ammo + '</div>';
      html += '<div class="journal-entry">Weapon: ' + game.currentWeapon + '</div>';
      if (game.ngPlusLevel > 0) {
        html += '<div class="journal-entry">NG+ Level: ' + game.ngPlusLevel + '</div>';
      }
      html += '</div>';
      break;

    case 'missions':
      html += '<div class="journal-section"><h4>ACTIVE MISSION</h4>';
      if (game.activeQuest) {
        html += '<div class="journal-entry">' + game.activeQuest.name + ': ' + game.activeQuest.desc + '</div>';
      } else {
        html += '<div class="journal-entry dim">No active mission. Talk to the Mayor or Bartender.</div>';
      }
      html += '</div>';
      if (game.completedQuests.length > 0) {
        html += '<div class="journal-section"><h4>COMPLETED</h4>';
        for (var qi = game.completedQuests.length - 1; qi >= Math.max(0, game.completedQuests.length - 10); qi--) {
          html += '<div class="journal-entry completed">' + game.completedQuests[qi].name + '</div>';
        }
        html += '</div>';
      }
      break;

    case 'wanted':
      html += '<div class="journal-section"><h4>WANTED LIST</h4>';
      if (game.wantedList.length === 0) {
        html += '<div class="journal-entry dim">No active bounties.</div>';
      }
      for (var wi = 0; wi < game.wantedList.length; wi++) {
        var w = game.wantedList[wi];
        html += '<div class="journal-entry wanted-entry">';
        html += '<strong>' + w.name + '</strong><br>';
        html += '<span class="wanted-desc">' + w.desc + '</span><br>';
        html += '<span class="wanted-bounty">Bounty: $' + w.bounty + '</span>';
        if (w.captured) html += ' <span class="captured">[CAPTURED]</span>';
        html += '</div>';
      }
      html += '</div>';
      break;

    case 'achievements':
      html += '<div class="journal-section"><h4>BADGES (' + game.achievements.length + '/' + ACHIEVEMENTS.length + ')</h4>';
      for (var ai = 0; ai < ACHIEVEMENTS.length; ai++) {
        var ach = ACHIEVEMENTS[ai];
        var unlocked = game.achievements.indexOf(ach.id) !== -1;
        html += '<div class="journal-entry achievement-entry' + (unlocked ? ' unlocked' : ' locked') + '">';
        html += '<span class="ach-icon">' + (unlocked ? ach.icon : '?') + '</span> ';
        html += '<span class="ach-name">' + (unlocked ? ach.name : '???') + '</span>';
        html += '<span class="ach-desc">' + (unlocked ? ach.desc : 'Keep playing to unlock') + '</span>';
        html += '</div>';
      }
      html += '</div>';
      break;

    case 'log':
      html += '<div class="journal-section"><h4>SHERIFF\'S LOG</h4>';
      if (game.journalEntries.length === 0) {
        html += '<div class="journal-entry dim">No entries yet.</div>';
      }
      var logEntries = game.journalEntries.slice(-20).reverse();
      for (var li = 0; li < logEntries.length; li++) {
        var e = logEntries[li];
        html += '<div class="journal-entry">Day ' + e.day + ', ' + e.time + ': ' + e.text + '</div>';
      }
      html += '</div>';
      break;
  }

  content.innerHTML = html;
}

function closeJournal() {
  document.getElementById('journal-panel').classList.add('hidden');
  game.state = 'playing';
}

// Tab switching
(function() {
  var jtabs = document.querySelectorAll('.jtab');
  for (var i = 0; i < jtabs.length; i++) {
    jtabs[i].addEventListener('click', function() {
      var tab = this.getAttribute('data-tab');
      game.journalTab = tab;
      openJournal(tab);
    });
  }
})();

// ─────────────────────────────────────────────
// §M  TUTORIAL SYSTEM
// ─────────────────────────────────────────────
var _preTutorialState = null;

function showTutorial(key, text) {
  if (game.tutorialShown[key]) return;
  game.tutorialShown[key] = true;

  // Save current state so we can restore it on dismiss
  _preTutorialState = game.state;
  game.state = 'tutorial';

  var overlay = document.getElementById('tutorial-overlay');
  var textEl = document.getElementById('tutorial-text');
  textEl.textContent = text;
  overlay.classList.remove('hidden');

  var _dismissed = false;
  var dismissBtn = document.getElementById('tutorial-dismiss');
  var dismiss = function() {
    if (_dismissed) return;
    _dismissed = true;
    overlay.classList.add('hidden');
    game.state = _preTutorialState || 'playing';
    _preTutorialState = null;
    dismissBtn.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', dismissKey);
  };
  var dismissKey = function(e) {
    dismiss();
  };

  dismissBtn.addEventListener('click', dismiss);
  document.addEventListener('keydown', dismissKey, { once: true });
}

// ─────────────────────────────────────────────
// §N  SAVE / LOAD
// ─────────────────────────────────────────────
function saveGame() {
  var npcstalkedArr = [];
  game.npcstalkedTo.forEach(function(v) { npcstalkedArr.push(v); });

  var visitedArr = [];
  game.visitedBuildings.forEach(function(v) { visitedArr.push(v); });

  var data = {
    reputation: game.reputation,
    gold: game.gold,
    dayCount: game.dayCount,
    daysServed: game.daysServed,
    time: game.time,
    outlawsKilled: game.outlawsKilled,
    outlawsArrested: game.outlawsArrested,
    crimesResolved: game.crimesResolved,
    crimesIgnored: game.crimesIgnored,
    completedQuests: game.completedQuests.map(function(q) { return q.name; }),
    journalEntries: game.journalEntries,
    playerX: game.player.x,
    playerY: game.player.y,
    playerHp: game.player.hp,
    playerMaxHp: game.player.maxHp,
    difficulty: game.difficulty,
    ammo: game.ammo,
    totalGoldEarned: game.totalGoldEarned,
    totalShots: game.totalShots,
    totalHits: game.totalHits,
    meleeFights: game.meleeFights,
    pokerWins: game.pokerWins,
    pokerLosses: game.pokerLosses,
    healthTonics: game.healthTonics,
    bribesTaken: game.bribesTaken,
    npcstalkedTo: npcstalkedArr,
    achievements: game.achievements,
    hasVest: game.hasVest,
    hasSpeedBoots: game.hasSpeedBoots,
    hasShotgun: game.hasShotgun,
    hasRifle: game.hasRifle,
    gunDurability: game.gunDurability,
    currentWeapon: game.currentWeapon,
    ngPlusLevel: game.ngPlusLevel,
    duelsWon: game.duelsWon,
    quickDrawTime: game.quickDrawTime,
    nightWatchesCompleted: game.nightWatchesCompleted,
    tilesRidden: game.tilesRidden,
    bountiesCaptured: game.bountiesCaptured,
    speedResolveTime: game.speedResolveTime,
    noDamageDays: game.noDamageDays,
    tutorialShown: game.tutorialShown,
    visitedBuildings: visitedArr,
    rank: game.rank
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  showNotification('Game saved!');
}

function loadGame() {
  var raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    var data = JSON.parse(raw);
    initGame(data.difficulty || 'normal', false);

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
    game.player.maxHp = data.playerMaxHp || 5;
    game.ammo = data.ammo || STARTING_AMMO;
    game.totalGoldEarned = data.totalGoldEarned || 0;
    game.totalShots = data.totalShots || 0;
    game.totalHits = data.totalHits || 0;
    game.meleeFights = data.meleeFights || 0;
    game.pokerWins = data.pokerWins || 0;
    game.pokerLosses = data.pokerLosses || 0;
    game.healthTonics = data.healthTonics || 0;
    game.bribesTaken = data.bribesTaken || 0;
    game.achievements = data.achievements || [];
    game.hasVest = data.hasVest || false;
    game.hasSpeedBoots = data.hasSpeedBoots || false;
    game.hasShotgun = data.hasShotgun || false;
    game.hasRifle = data.hasRifle || false;
    game.gunDurability = data.gunDurability || 100;
    game.currentWeapon = data.currentWeapon || 'revolver';
    game.ngPlusLevel = data.ngPlusLevel || 0;
    game.duelsWon = data.duelsWon || 0;
    game.quickDrawTime = data.quickDrawTime || Infinity;
    game.nightWatchesCompleted = data.nightWatchesCompleted || 0;
    game.tilesRidden = data.tilesRidden || 0;
    game.bountiesCaptured = data.bountiesCaptured || 0;
    game.speedResolveTime = data.speedResolveTime || Infinity;
    game.noDamageDays = data.noDamageDays || 0;
    game.tutorialShown = data.tutorialShown || {};
    game.rank = data.rank || 'Deputy';

    if (data.npcstalkedTo) {
      game.npcstalkedTo = new Set(data.npcstalkedTo);
    }
    if (data.visitedBuildings) {
      game.visitedBuildings = new Set(data.visitedBuildings);
    }

    return true;
  } catch (e) {
    return false;
  }
}

// ─────────────────────────────────────────────
// §O  WANTED LIST GENERATION (uses WANTED_OUTLAWS from Part 2)
// ─────────────────────────────────────────────

function generateWantedList() {
  game.wantedList = [];
  var count = Math.min(3 + game.ngPlusLevel, WANTED_OUTLAWS.length);
  var shuffled = WANTED_OUTLAWS.slice().sort(function() { return Math.random() - 0.5; });
  for (var i = 0; i < count; i++) {
    game.wantedList.push({
      name: shuffled[i].name,
      desc: shuffled[i].desc,
      bounty: Math.round(shuffled[i].bounty * (1 + game.ngPlusLevel * 0.5)),
      captured: false
    });
  }
}

// ─────────────────────────────────────────────
// §P  GAME INIT
// ─────────────────────────────────────────────
function initGame(difficulty, ngPlus) {
  var diff = DIFFICULTY[difficulty || 'normal'] || DIFFICULTY.normal;
  game.difficulty = difficulty || 'normal';

  var townData = generateTown();
  game.map = townData.map;
  game.buildings = townData.buildings;

  // Player starts at sheriff office door
  var sheriffOffice = null;
  for (var i = 0; i < game.buildings.length; i++) {
    if (game.buildings[i].type === BUILDING_TYPES.SHERIFF) {
      sheriffOffice = game.buildings[i];
      break;
    }
  }
  game.player = createPlayer(sheriffOffice.doorX, sheriffOffice.doorY + 1);
  game.player.hp = diff.playerHP;
  game.player.maxHp = diff.playerHP;

  game.npcs = generateNPCs(game.buildings);
  game.activeCrime = null;
  game.activeQuest = null;
  game.completedQuests = [];
  game.reputation = 50;
  game.gold = diff.startingMoney;
  game.ammo = diff.startingAmmo;
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
  game.dialogState = null;
  game.duelState = null;
  game.showMinimap = true;
  game.stepTimer = 0;
  game.totalGoldEarned = 0;
  game._gameOverShown = false;
  game.totalShots = 0;
  game.totalHits = 0;
  game.meleeFights = 0;
  game.pokerWins = 0;
  game.pokerLosses = 0;
  game.healthTonics = 0;
  game.bribesTaken = 0;
  game.npcstalkedTo = new Set();
  game.noDamageToday = true;
  game.noDamageDays = 0;
  game.duelsWon = 0;
  game.quickDrawTime = Infinity;
  game.nightWatchesCompleted = 0;
  game.tilesRidden = 0;
  game.bountiesCaptured = 0;
  game.speedResolveTime = Infinity;
  game.gameOverReason = '';
  game.fireEffects = [];
  game.hostageNPC = null;
  game.waveCount = 0;
  game.ambientParticles = [];
  game.prayedToday = false;
  game.crimeStartTime = 0;
  game.train = null;
  game._nearTrain = false;
  game.shopOpen = false;
  game.shopType = null;
  game.pokerState = null;
  game.corruption = 0;
  game.bodyguards = [];
  game.prisoners = [];
  game.mounted = game.mounted || false;
  // Corrupt start code
  if (game._corruptStart) {
    game.corruption = game._corruptStartLevel || 80;
    game._corruptMode = true;
    var tierNames = ['Bent Cop', 'Crooked Sheriff', 'Crime Boss', 'Tyrant'];
    var tierIdx = game.corruption <= 20 ? 0 : game.corruption <= 60 ? 1 : game.corruption <= 80 ? 2 : 3;
    showNotification('CORRUPT MODE: You start as ' + tierNames[tierIdx] + '! (Corruption: ' + game.corruption + ')');
    addJournalEntry('You arrived in town with dark intentions... (Corruption: ' + game.corruption + ')');
  }

  // NG+ carry-overs
  if (ngPlus && ngPlus.level) {
    game.ngPlusLevel = ngPlus.level;
    game.rank = ngPlus.rank || 'Deputy';
    game.gold = Math.floor((ngPlus.gold || 0) * 0.3);
    game.totalGoldEarned = game.gold;
    game.hasVest = ngPlus.hasVest || false;
    game.hasSpeedBoots = ngPlus.hasSpeedBoots || false;
    game.hasShotgun = ngPlus.hasShotgun || false;
    game.hasRifle = ngPlus.hasRifle || false;
    game.achievements = ngPlus.achievements || [];
    game.tutorialShown = ngPlus.tutorialShown || {};
    if (game.hasVest) {
      game.player.maxHp += 2;
      game.player.hp = game.player.maxHp;
    }
  } else {
    game.ngPlusLevel = 0;
    game.achievements = [];
    game.hasVest = false;
    game.hasSpeedBoots = false;
    game.hasShotgun = false;
    game.hasRifle = false;
    game.tutorialShown = {};
  }

  game.gunDurability = 100;
  game.currentWeapon = 'revolver';
  game.mounted = false;

  // Spawn horse at stables
  var stable = null;
  for (var si = 0; si < game.buildings.length; si++) {
    if (game.buildings[si].type === BUILDING_TYPES.STABLE) {
      stable = game.buildings[si];
      break;
    }
  }
  if (stable) {
    spawnHorse(stable.doorX + 2, stable.doorY + 1);
  }

  // Generate wanted list
  generateWantedList();

  // Set camera
  game.camera.x = game.player.x - canvas.width / 2;
  game.camera.y = game.player.y - canvas.height / 2;

  // XP/Level system init
  game.xp = 0;
  game.level = 1;

  // Daily challenge
  generateDailyChallenge();
  initDailyChallengeTracking();

  // Combo reset
  combo.count = 0;
  combo.timer = 0;
  combo.maxCombo = 0;
  streak.crimeDays = 0;
  streak.noDamageDays = 0;

  addJournalEntry('Pinned on the badge. Time to keep the peace.');

  particles.particles = [];
  bullets.bullets = [];
  floatingTexts.length = 0;

  // Apply cheat code if activated
  if (cheatActivated) {
    applyCheatCode();
    cheatActivated = false;
  }

  updateXPBar();
}

// ─────────────────────────────────────────────
// §ADDICTION  COMBO, STREAKS, XP, DAILY CHALLENGES
// ─────────────────────────────────────────────

// --- Cheat code ---
var cheatActivated = false;

function applyCheatCode() {
  game.reputation = 100;
  game.gold = 9999;
  game.totalGoldEarned = 9999;
  game.ammo = 999;
  game.player.hp = 99;
  game.player.maxHp = 99;
  game.hasVest = true;
  game.hasSpeedBoots = true;
  game.hasShotgun = true;
  game.hasRifle = true;
  game.gunDurability = 100;
  game.xp = 0;
  game.level = 50;
  game.rank = 'Wyatt Earp';
  game._cheatMode = true; // bullets pass through innocents
  showNotification('CHEAT ACTIVATED: Max everything!', 'good');
  addJournalEntry('A mysterious power surges through you...');
}

// --- Combo System ---
// Chaining kills/arrests within a time window multiplies rewards
var combo = {
  count: 0,
  timer: 0, // frames remaining
  window: 180, // 3 seconds at 60fps
  maxCombo: 0,
  display: false
};

function addCombo() {
  combo.count++;
  combo.timer = combo.window;
  combo.display = true;
  if (combo.count > combo.maxCombo) combo.maxCombo = combo.count;

  var el = document.getElementById('combo-display');
  var countEl = document.getElementById('combo-count');
  if (el && countEl && combo.count >= 2) {
    el.classList.remove('hidden');
    countEl.textContent = 'x' + combo.count;
    // Re-trigger animation
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';

    if (combo.count >= 5) {
      countEl.style.color = '#ff0000';
      countEl.style.fontSize = '56px';
    } else if (combo.count >= 3) {
      countEl.style.color = '#ff6600';
      countEl.style.fontSize = '48px';
    } else {
      countEl.style.color = '#ffaa00';
      countEl.style.fontSize = '44px';
    }
  }

  // Combo bonus
  var bonus = Math.floor(combo.count * 5);
  game.gold += bonus;
  game.totalGoldEarned += bonus;
  addFloatingText(game.player.x, game.player.y - 40, 'COMBO x' + combo.count + ' +$' + bonus, '#ff6600');

  if (combo.count === 3) audio.playDing();
  if (combo.count === 5) { audio.playVictory(); showNotification('KILLING SPREE!', 'good'); }
  if (combo.count === 10) { showNotification('UNSTOPPABLE!', 'good'); triggerShake(6, 15); }
}

function updateCombo() {
  if (combo.timer > 0) {
    combo.timer--;
    if (combo.timer <= 0) {
      combo.count = 0;
      combo.display = false;
      var el = document.getElementById('combo-display');
      if (el) el.classList.add('hidden');
    }
  }
}

function getComboMultiplier() {
  if (combo.count < 2) return 1;
  return 1 + (combo.count - 1) * 0.25; // x1.25, x1.5, x1.75, x2...
}

// --- Streak System ---
// Track consecutive days with good performance
var streak = {
  crimeDays: 0, // consecutive days resolving at least 1 crime
  noDamageDays: 0,
  active: null, // current streak type displayed
  timer: 0
};

function checkDayStreaks() {
  if (game.crimesResolved > (game._lastDayCrimes || 0)) {
    streak.crimeDays++;
    game._lastDayCrimes = game.crimesResolved;
    if (streak.crimeDays >= 3) {
      showStreak('CRIME STREAK', streak.crimeDays + ' days!');
      var streakBonus = streak.crimeDays * 10;
      game.gold += streakBonus;
      game.totalGoldEarned += streakBonus;
      showNotification(streak.crimeDays + '-day crime streak! +$' + streakBonus, 'good');
    }
  } else {
    streak.crimeDays = 0;
  }

  if (game.noDamageToday) {
    streak.noDamageDays++;
    if (streak.noDamageDays >= 2) {
      showStreak('UNTOUCHABLE', streak.noDamageDays + ' days!');
      game.reputation = clamp(game.reputation + streak.noDamageDays, 0, REPUTATION_MAX);
    }
  } else {
    streak.noDamageDays = 0;
  }
  game.noDamageToday = true;
}

function showStreak(icon, text) {
  var el = document.getElementById('streak-display');
  var iconEl = document.getElementById('streak-icon');
  var textEl = document.getElementById('streak-text');
  if (el && iconEl && textEl) {
    iconEl.textContent = icon;
    textEl.textContent = text;
    el.classList.remove('hidden');
    streak.timer = 240; // 4 seconds
  }
}

function updateStreak() {
  if (streak.timer > 0) {
    streak.timer--;
    if (streak.timer <= 0) {
      var el = document.getElementById('streak-display');
      if (el) el.classList.add('hidden');
    }
  }
}

// --- XP & Level System ---
// Earn XP from everything, level up for permanent bonuses
var XP_PER_LEVEL = 100;
var LEVEL_CAP = 50;

function addXP(amount) {
  if (!game.xp) game.xp = 0;
  if (!game.level) game.level = 1;

  game.xp += Math.floor(amount * getComboMultiplier());

  while (game.xp >= xpForLevel(game.level) && game.level < LEVEL_CAP) {
    game.xp -= xpForLevel(game.level);
    game.level++;
    onLevelUp();
  }

  updateXPBar();
}

function xpForLevel(level) {
  return XP_PER_LEVEL + (level - 1) * 20; // 100, 120, 140, 160...
}

function onLevelUp() {
  showNotification('LEVEL UP! Now level ' + game.level, 'good');
  audio.playVictory();
  triggerShake(4, 10);
  addFloatingText(game.player.x, game.player.y - 50, 'LEVEL ' + game.level, '#88ccff');

  // Permanent bonuses every few levels
  if (game.level % 5 === 0) {
    game.player.maxHp++;
    game.player.hp = game.player.maxHp;
    showNotification('+1 Max HP!', 'good');
  }
  if (game.level % 3 === 0) {
    game.ammo += 6;
    showNotification('+6 Ammo!', 'good');
  }
  if (game.level % 10 === 0) {
    var goldBonus = game.level * 10;
    game.gold += goldBonus;
    game.totalGoldEarned += goldBonus;
    showNotification('Level ' + game.level + ' bonus: +$' + goldBonus, 'good');
  }
}

function updateXPBar() {
  var container = document.getElementById('xp-bar-container');
  var levelEl = document.getElementById('level-display');
  var barInner = document.getElementById('xp-bar-inner');
  if (container && levelEl && barInner) {
    container.classList.remove('hidden');
    levelEl.textContent = 'Lv.' + (game.level || 1);
    var needed = xpForLevel(game.level || 1);
    var pct = Math.min(100, ((game.xp || 0) / needed) * 100);
    barInner.style.width = pct + '%';
  }
}

// --- Daily Challenge System ---
var DAILY_CHALLENGES = [
  { desc: 'Kill 3 outlaws', type: 'kill', target: 3, reward: 50, repReward: 5 },
  { desc: 'Arrest 2 outlaws', type: 'arrest', target: 2, reward: 40, repReward: 8 },
  { desc: 'Resolve 2 crimes', type: 'crimes', target: 2, reward: 60, repReward: 6 },
  { desc: 'Win a duel', type: 'duel', target: 1, reward: 40, repReward: 5 },
  { desc: 'Talk to 5 NPCs', type: 'talk', target: 5, reward: 25, repReward: 3 },
  { desc: 'Win 3 poker hands', type: 'poker', target: 3, reward: 45, repReward: 2 },
  { desc: 'Earn $100', type: 'gold', target: 100, reward: 30, repReward: 4 },
  { desc: 'Survive until night', type: 'night', target: 1, reward: 35, repReward: 5 },
  { desc: 'Visit all buildings', type: 'explore', target: 8, reward: 50, repReward: 6 },
  { desc: 'Get a 3x combo', type: 'combo', target: 3, reward: 40, repReward: 4 },
  { desc: 'Take no damage today', type: 'nodamage', target: 1, reward: 60, repReward: 8 },
  { desc: 'Melee 3 outlaws', type: 'melee', target: 3, reward: 35, repReward: 3 },
];

function generateDailyChallenge() {
  var idx = (game.dayCount - 1) % DAILY_CHALLENGES.length;
  game.dailyChallenge = {
    desc: DAILY_CHALLENGES[idx].desc,
    type: DAILY_CHALLENGES[idx].type,
    target: DAILY_CHALLENGES[idx].target,
    reward: DAILY_CHALLENGES[idx].reward,
    repReward: DAILY_CHALLENGES[idx].repReward,
    progress: 0,
    completed: false,
    day: game.dayCount
  };

  var el = document.getElementById('daily-challenge');
  var textEl = document.getElementById('daily-text');
  if (el && textEl) {
    el.classList.remove('hidden');
    textEl.textContent = game.dailyChallenge.desc;
  }
}

function updateDailyChallenge() {
  var dc = game.dailyChallenge;
  if (!dc || dc.completed) return;

  var prev = dc.progress;

  switch (dc.type) {
    case 'kill': dc.progress = game.outlawsKilled - (dc._startKills || 0); break;
    case 'arrest': dc.progress = game.outlawsArrested - (dc._startArrests || 0); break;
    case 'crimes': dc.progress = game.crimesResolved - (dc._startCrimes || 0); break;
    case 'duel': dc.progress = game.duelsWon - (dc._startDuels || 0); break;
    case 'talk': dc.progress = game.npcstalkedTo.size; break;
    case 'poker': dc.progress = game.pokerWins - (dc._startPoker || 0); break;
    case 'gold': dc.progress = game.totalGoldEarned - (dc._startGold || 0); break;
    case 'night': dc.progress = (game.time > 0.8 || game.time < 0.2) ? 1 : 0; break;
    case 'explore': dc.progress = game.visitedBuildings.size; break;
    case 'combo': dc.progress = combo.maxCombo; break;
    case 'nodamage': dc.progress = game.noDamageToday ? 1 : 0; break;
    case 'melee': dc.progress = game.meleeFights - (dc._startMelee || 0); break;
  }

  // Update UI
  var progEl = document.getElementById('daily-progress');
  if (progEl) {
    progEl.textContent = Math.min(dc.progress, dc.target) + '/' + dc.target;
  }

  if (dc.progress >= dc.target && !dc.completed) {
    dc.completed = true;
    game.gold += dc.reward;
    game.totalGoldEarned += dc.reward;
    game.reputation = clamp(game.reputation + dc.repReward, 0, REPUTATION_MAX);
    showNotification('DAILY BOUNTY COMPLETE! +$' + dc.reward + ', +' + dc.repReward + ' Rep', 'good');
    audio.playVictory();
    addXP(50);
    addJournalEntry('Completed daily bounty: ' + dc.desc);

    var el = document.getElementById('daily-challenge');
    if (el) el.classList.add('hidden');
  }
}

function initDailyChallengeTracking() {
  var dc = game.dailyChallenge;
  if (!dc) return;
  dc._startKills = game.outlawsKilled;
  dc._startArrests = game.outlawsArrested;
  dc._startCrimes = game.crimesResolved;
  dc._startDuels = game.duelsWon;
  dc._startPoker = game.pokerWins;
  dc._startGold = game.totalGoldEarned;
  dc._startMelee = game.meleeFights;
}

// --- Hook into existing systems to grant XP ---
// These get called from the existing code via a wrapper
var _origShowNotif = showNotification;
showNotification = function(text, type) {
  _origShowNotif(text, type);
  // Grant XP for positive actions
  if (type === 'good' || (text && text.indexOf('+') === 0)) {
    addXP(5);
  }
  if (text && text.indexOf('Crime resolved') !== -1) addXP(30);
  if (text && text.indexOf('arrested') !== -1) { addXP(20); addCombo(); }
  if (text && text.indexOf('Duel won') !== -1) addXP(25);
  if (text && text.indexOf('Mission Complete') !== -1) addXP(40);
  if (text && text.indexOf('LEVEL UP') !== -1) return; // Don't loop
};

// Hook into bullet kills for combo
var _origBulletUpdate = bullets.update.bind(bullets);
bullets.update = function(npcs, player, particlesRef, gameState, map) {
  var killsBefore = gameState.outlawsKilled || 0;
  _origBulletUpdate(npcs, player, particlesRef, gameState, map);
  var killsAfter = gameState.outlawsKilled || 0;
  if (killsAfter > killsBefore) {
    for (var k = 0; k < killsAfter - killsBefore; k++) {
      addCombo();
      addXP(15);
    }
  }
};

// ─────────────────────────────────────────────
// §Q  GAME OVER & NG+
// ─────────────────────────────────────────────
function showGameOver() {
  var screen = document.getElementById('game-over-screen');
  screen.classList.remove('hidden');

  document.getElementById('go-title').textContent =
    game.player.hp <= 0 ? 'YOU DIED' : 'GAME OVER';
  document.getElementById('go-reason').textContent = game.gameOverReason;

  var accuracy = game.totalShots > 0 ? Math.round((game.totalHits / game.totalShots) * 100) : 0;
  document.getElementById('go-stats').innerHTML =
    'Days Served: ' + game.daysServed + '<br>' +
    'Final Rank: ' + game.rank + '<br>' +
    'Reputation: ' + game.reputation + '<br>' +
    'Outlaws Killed: ' + game.outlawsKilled + '<br>' +
    'Outlaws Arrested: ' + game.outlawsArrested + '<br>' +
    'Crimes Resolved: ' + game.crimesResolved + '<br>' +
    'Duels Won: ' + game.duelsWon + '<br>' +
    'Accuracy: ' + accuracy + '%<br>' +
    'Total Gold Earned: $' + game.totalGoldEarned + '<br>' +
    'Badges Earned: ' + game.achievements.length + '/' + ACHIEVEMENTS.length + '<br>' +
    (game.ngPlusLevel > 0 ? 'NG+ Level: ' + game.ngPlusLevel + '<br>' : '');

  // NG+ button
  var ngBtn = document.getElementById('btn-ng-plus');
  if (game.reputation >= 50 || game.daysServed >= 10) {
    ngBtn.classList.remove('hidden');
    ngBtn.style.display = '';
    ngBtn.onclick = function() {
      screen.classList.add('hidden');
      var ngData = {
        level: game.ngPlusLevel + 1,
        rank: game.rank,
        gold: game.gold,
        hasVest: game.hasVest,
        hasSpeedBoots: game.hasSpeedBoots,
        hasShotgun: game.hasShotgun,
        hasRifle: game.hasRifle,
        achievements: game.achievements.slice(),
        tutorialShown: Object.assign({}, game.tutorialShown)
      };
      initGame(game.difficulty, ngData);
      game.state = 'playing';
      showNotification('New Game+ (Level ' + game.ngPlusLevel + ') - Outlaws are tougher!');
      addJournalEntry('Started New Game+ level ' + game.ngPlusLevel + '.');
    };
  } else {
    ngBtn.classList.add('hidden');
    ngBtn.style.display = 'none';
  }
}

// ─────────────────────────────────────────────
// §R  HELPER: getTimeString (shared)
// ─────────────────────────────────────────────
function getTimeString(t) {
  var totalMinutes = t * 24 * 60;
  var hours = Math.floor(totalMinutes / 60);
  var minutes = Math.floor(totalMinutes % 60);
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return hours + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
}

// === END PART 4 ===// === PART 5: MAIN LOOP ===

// ─────────────────────────────────────────────
// §A  AMBIENT PARTICLE STORAGE
// ─────────────────────────────────────────────
// ambientParticles already declared in Part 3
const bloodDecalList = (typeof bloodDecals !== 'undefined') ? bloodDecals : [];
const screenShakeState = (typeof screenShake !== 'undefined') ? screenShake : { x: 0, y: 0, intensity: 0, update() { this.intensity *= 0.9; this.x = (Math.random() - 0.5) * this.intensity; this.y = (Math.random() - 0.5) * this.intensity; } };

// Seed initial ambient particles
function seedAmbientParticles() {
  // Tumbleweeds
  for (let i = 0; i < 4; i++) {
    ambientParticles.push({
      type: 'tumbleweed',
      x: Math.random() * MAP_W * TILE,
      y: Math.random() * MAP_H * TILE,
      vx: 0.3 + Math.random() * 0.6,
      vy: Math.sin(Math.random() * Math.PI * 2) * 0.15,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.02 + Math.random() * 0.03,
      life: Infinity
    });
  }
  // Dust motes
  for (let i = 0; i < 30; i++) {
    ambientParticles.push({
      type: 'dust',
      x: Math.random() * MAP_W * TILE,
      y: Math.random() * MAP_H * TILE,
      vx: 0.1 + Math.random() * 0.3,
      vy: -0.05 + Math.random() * 0.1,
      size: 1 + Math.random() * 2,
      alpha: 0.15 + Math.random() * 0.25,
      life: Infinity,
      drift: Math.random() * Math.PI * 2
    });
  }
}

function updateAmbientParticles() {
  const isNight = game.time < 0.2 || game.time > 0.8;

  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const p = ambientParticles[i];

    if (p.type === 'tumbleweed') {
      p.x += p.vx;
      p.y += p.vy + Math.sin(Date.now() * 0.001 + p.rotation) * 0.1;
      p.rotation += p.rotSpeed;
      // Wrap around map
      if (p.x > MAP_W * TILE + 50) p.x = -50;
      if (p.x < -50) p.x = MAP_W * TILE + 50;
      if (p.y < 0) p.y = MAP_H * TILE;
      if (p.y > MAP_H * TILE) p.y = 0;
    } else if (p.type === 'dust') {
      p.drift += 0.01;
      p.x += p.vx + Math.sin(p.drift) * 0.1;
      p.y += p.vy + Math.cos(p.drift * 0.7) * 0.05;
      if (p.x > MAP_W * TILE + 20) p.x = -20;
      if (p.x < -20) p.x = MAP_W * TILE + 20;
      if (p.y < -20) p.y = MAP_H * TILE + 20;
      if (p.y > MAP_H * TILE + 20) p.y = -20;
    } else if (p.type === 'firefly') {
      p.drift += 0.03;
      p.x += Math.sin(p.drift) * 0.4;
      p.y += Math.cos(p.drift * 1.3) * 0.3;
      p.alpha = 0.3 + Math.sin(Date.now() * 0.005 + p.phase) * 0.3;
      if (!isNight) {
        ambientParticles.splice(i, 1);
        continue;
      }
    } else if (p.type === 'star') {
      p.alpha = 0.4 + Math.sin(Date.now() * 0.002 + p.phase) * 0.35;
      if (!isNight) {
        ambientParticles.splice(i, 1);
        continue;
      }
    }
  }

  // Spawn fireflies at night
  if (isNight) {
    const fireflyCount = ambientParticles.filter(p => p.type === 'firefly').length;
    if (fireflyCount < 20 && Math.random() < 0.05) {
      ambientParticles.push({
        type: 'firefly',
        x: game.camera.x + Math.random() * canvas.width,
        y: game.camera.y + Math.random() * canvas.height,
        size: 2,
        alpha: 0.5,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * Math.PI * 2,
        life: Infinity
      });
    }
    // Spawn stars
    const starCount = ambientParticles.filter(p => p.type === 'star').length;
    if (starCount < 40) {
      for (let i = starCount; i < 40; i++) {
        ambientParticles.push({
          type: 'star',
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          size: 0.5 + Math.random() * 1.5,
          alpha: 0.4 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          life: Infinity,
          screenFixed: true
        });
      }
    }
  }
}

// ─────────────────────────────────────────────
// §A  MAIN RENDER FUNCTION
// ─────────────────────────────────────────────
function render() {
  // 1. Camera with screen shake offset
  screenShakeState.update();
  const camX = game.camera.x + screenShakeState.x;
  const camY = game.camera.y + screenShakeState.y;

  // 2. Sky background
  const skyColor = getSkyColor(game.time);
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars at night (screen-fixed, drawn before world)
  const isNight = game.time < 0.2 || game.time > 0.8;
  if (isNight) {
    for (const p of ambientParticles) {
      if (p.type === 'star' && p.screenFixed) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffffee';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // 3. Calculate visible tile range
  const startX = Math.max(0, Math.floor(camX / TILE));
  const startY = Math.max(0, Math.floor(camY / TILE));
  const endX = Math.min(MAP_W, Math.ceil((camX + canvas.width) / TILE) + 1);
  const endY = Math.min(MAP_H, Math.ceil((camY + canvas.height) / TILE) + 1);

  // 4. Draw all visible tiles
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      drawTile(x, y, camX, camY, game.map[y][x], game.time);
    }
  }

  // 5. Draw blood decals on ground
  for (const decal of bloodDecalList) {
    const sx = decal.x - camX;
    const sy = decal.y - camY;
    if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) continue;
    ctx.globalAlpha = decal.alpha || 0.4;
    ctx.fillStyle = '#5a0000';
    ctx.beginPath();
    ctx.ellipse(sx, sy, decal.size || 6, (decal.size || 6) * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Splatter details
    for (let s = 0; s < 3; s++) {
      const angle = (decal.seed || 0) + s * 2.1;
      const dist2 = (decal.size || 6) * 0.8;
      ctx.fillRect(
        sx + Math.cos(angle) * dist2 - 1,
        sy + Math.sin(angle) * dist2 * 0.5 - 1,
        2, 2
      );
    }
    ctx.globalAlpha = 1;
  }

  // 6. Draw building roofs
  for (const b of game.buildings) {
    drawBuildingRoof(b, camX, camY);
  }

  // 6b. Draw train
  if (game.train) drawTrain(camX, camY);

  // 7. Crime indicator (pulsing red circle + offscreen arrow)
  if (game.activeCrime) {
    const cx = game.activeCrime.x - camX;
    const cy = game.activeCrime.y - camY;
    const now = Date.now();
    const pulse = 20 + Math.sin(now / 200) * 10;
    const pulseAlpha = 0.5 + Math.sin(now / 150) * 0.3;

    // Outer glow
    ctx.strokeStyle = `rgba(255, 0, 0, ${pulseAlpha * 0.3})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha * 0.1})`;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.fill();

    // Crime timer text
    if (game.activeCrime.timeRemaining > 0) {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.ceil(game.activeCrime.timeRemaining) + 's', cx, cy - pulse - 8);
    }

    // Arrow pointing to crime if offscreen
    if (cx < 0 || cx > canvas.width || cy < 0 || cy > canvas.height) {
      const angle = Math.atan2(cy - canvas.height / 2, cx - canvas.width / 2);
      const edgeDist = 60;
      const arrowX = clamp(
        canvas.width / 2 + Math.cos(angle) * (canvas.width / 2 - edgeDist),
        edgeDist, canvas.width - edgeDist
      );
      const arrowY = clamp(
        canvas.height / 2 + Math.sin(angle) * (canvas.height / 2 - edgeDist),
        edgeDist, canvas.height - edgeDist
      );

      // Pulsing arrow background
      ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(now / 200) * 0.3})`;
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Arrow triangle pointing toward crime
      ctx.fillStyle = '#ffffff';
      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Distance text
      const crimeDist = Math.round(Math.hypot(
        game.activeCrime.x - game.player.x,
        game.activeCrime.y - game.player.y
      ) / TILE);
      ctx.fillStyle = '#ff4444';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(crimeDist + 'm', arrowX, arrowY + 22);
    }
  }

  // 8. Quest target indicators on buildings (pulsing gold)
  if (game.activeQuest && game.activeQuest.targetBuildings && game.activeQuest.targetBuildings.length > 0) {
    const now = Date.now();
    for (const targetType of game.activeQuest.targetBuildings) {
      if (game.activeQuest.visited && game.activeQuest.visited.has(targetType)) continue;
      const building = game.buildings.find(b => b.type === targetType);
      if (!building) continue;

      const bx = building.x * TILE + (building.w * TILE) / 2 - camX;
      const by = building.y * TILE - 20 - camY;
      const qPulse = 0.5 + Math.sin(now / 300) * 0.4;

      // Gold diamond marker
      ctx.fillStyle = `rgba(255, 215, 0, ${qPulse})`;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      // Glow ring
      ctx.strokeStyle = `rgba(255, 215, 0, ${qPulse * 0.5})`;
      ctx.lineWidth = 1.5;
      const qRing = 10 + Math.sin(now / 250) * 4;
      ctx.beginPath();
      ctx.arc(bx, by, qRing, 0, Math.PI * 2);
      ctx.stroke();

      // Exclamation
      ctx.fillStyle = `rgba(255, 215, 0, ${qPulse})`;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', bx, by + 4);
    }
  }

  // 9. Sort and draw all NPCs by Y position (depth sort)
  const sortedNPCs = [];
  for (let i = 0; i < game.npcs.length; i++) {
    const npc = game.npcs[i];
    // Cull offscreen NPCs
    const sx = npc.x - camX;
    const sy = npc.y - camY;
    if (sx > -60 && sx < canvas.width + 60 && sy > -60 && sy < canvas.height + 60) {
      sortedNPCs.push(npc);
    }
  }
  sortedNPCs.sort((a, b) => a.y - b.y);

  // Interleave player into NPC draw order by Y
  let playerDrawn = false;
  for (const npc of sortedNPCs) {
    if (!playerDrawn && game.player.y < npc.y) {
      // 10. Draw horse if exists and not mounted
      if (game.horse && !game.mounted) {
        drawHorse(game.horse, camX, camY);
      }
      // 11. Draw player
      drawPlayer(game.player, camX, camY);
      playerDrawn = true;
    }
    var npcPlayerDist = dist(game.player, npc);
    drawNPC(npc, camX, camY, npcPlayerDist);
  }
  if (!playerDrawn) {
    if (game.horse && !game.mounted) {
      drawHorse(game.horse, camX, camY);
    }
    drawPlayer(game.player, camX, camY);
  }

  // 12. Draw bullets
  bullets.draw(ctx, camX, camY);

  // 13. Draw particles
  particles.draw(ctx, camX, camY);

  // 14. Draw floating texts (fade up + shrink)
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.5;
    ft.life--;
    const lifeRatio = ft.life / 60;
    ctx.globalAlpha = lifeRatio;
    const fontSize = Math.max(8, Math.round(12 * (0.6 + lifeRatio * 0.4)));
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(ft.text, ft.x - camX + 1, ft.y - camY + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
    ctx.globalAlpha = 1;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  // 15. Draw ambient particles (tumbleweeds, dust, fireflies)
  for (const p of ambientParticles) {
    if (p.screenFixed) continue; // Already drawn (stars)

    const sx = p.type === 'star' ? p.x : p.x - camX;
    const sy = p.type === 'star' ? p.y : p.y - camY;

    if (sx < -50 || sx > canvas.width + 50 || sy < -50 || sy > canvas.height + 50) continue;

    if (p.type === 'tumbleweed') {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(p.rotation);
      // Draw tumbleweed as a rough circle of lines
      ctx.strokeStyle = '#a89060';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.5) {
        const r = p.size * (0.7 + Math.sin(a * 3.7) * 0.3);
        if (a === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
      // Internal strands
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.5, 0);
      ctx.lineTo(p.size * 0.5, 0);
      ctx.moveTo(0, -p.size * 0.5);
      ctx.lineTo(0, p.size * 0.5);
      ctx.moveTo(-p.size * 0.3, -p.size * 0.3);
      ctx.lineTo(p.size * 0.3, p.size * 0.3);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    } else if (p.type === 'dust') {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#c4a55a';
      ctx.beginPath();
      ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (p.type === 'firefly') {
      ctx.globalAlpha = p.alpha;
      // Glow
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
      gradient.addColorStop(0, 'rgba(200, 255, 100, 0.6)');
      gradient.addColorStop(0.3, 'rgba(180, 255, 50, 0.2)');
      gradient.addColorStop(1, 'rgba(180, 255, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(sx - 8, sy - 8, 16, 16);
      // Core
      ctx.fillStyle = '#ccff66';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // 16. Fire effects if arson crime active
  if (game.activeCrime && game.activeCrime.type && game.activeCrime.type.name === 'Arson') {
    const fireX = game.activeCrime.x - camX;
    const fireY = game.activeCrime.y - camY;
    const now = Date.now();
    const building = game.activeCrime.building;
    const bw = building ? building.w * TILE : 64;
    const bh = building ? building.h * TILE : 48;
    const bsx = building ? building.x * TILE - camX : fireX - 32;
    const bsy = building ? building.y * TILE - camY : fireY - 24;

    // Draw multiple fire particles across the building
    for (let f = 0; f < 35; f++) {
      const fx = bsx + Math.random() * bw;
      const baseY = bsy + bh * 0.3 + Math.random() * bh * 0.7;
      const flicker = Math.sin(now * 0.01 + f * 1.7) * 0.3;
      const height = 15 + Math.random() * 25 + Math.sin(now * 0.008 + f) * 8;
      const width = 4 + Math.random() * 8;

      // Flame gradient from yellow to orange to red
      const lifePhase = (Math.sin(now * 0.006 + f * 2.3) + 1) / 2;
      let r, g, b;
      if (lifePhase < 0.3) {
        // Red base
        r = 200 + Math.random() * 55;
        g = 20 + Math.random() * 40;
        b = 0;
      } else if (lifePhase < 0.7) {
        // Orange middle
        r = 255;
        g = 100 + Math.random() * 80;
        b = 0;
      } else {
        // Yellow tip
        r = 255;
        g = 200 + Math.random() * 55;
        b = 50 + Math.random() * 50;
      }

      const alpha = 0.5 + flicker * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

      // Draw flame tongue shape
      ctx.beginPath();
      ctx.moveTo(fx - width / 2, baseY);
      ctx.quadraticCurveTo(
        fx - width * 0.3 + Math.sin(now * 0.005 + f) * 3,
        baseY - height * 0.5,
        fx + Math.sin(now * 0.007 + f * 1.1) * 4,
        baseY - height
      );
      ctx.quadraticCurveTo(
        fx + width * 0.3 + Math.sin(now * 0.006 + f + 1) * 3,
        baseY - height * 0.5,
        fx + width / 2,
        baseY
      );
      ctx.closePath();
      ctx.fill();
    }

    // Ember particles floating up
    for (let e = 0; e < 15; e++) {
      const ex = bsx + Math.random() * bw;
      const ey = bsy + Math.random() * bh * 0.5;
      const emberOff = (now * 0.003 + e * 37) % 60;
      const emberY = ey - emberOff;
      const emberAlpha = 1 - (emberOff / 60);
      ctx.globalAlpha = emberAlpha * 0.8;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffaa00' : '#ff4400';
      ctx.fillRect(
        ex + Math.sin(now * 0.004 + e * 2) * 6,
        emberY,
        1.5, 1.5
      );
    }

    // Fire glow on surrounding area
    ctx.globalAlpha = 0.12 + Math.sin(now * 0.004) * 0.05;
    const glowGrad = ctx.createRadialGradient(
      bsx + bw / 2, bsy + bh / 2, 10,
      bsx + bw / 2, bsy + bh / 2, bw * 1.5
    );
    glowGrad.addColorStop(0, 'rgba(255, 120, 0, 0.4)');
    glowGrad.addColorStop(0.5, 'rgba(255, 60, 0, 0.15)');
    glowGrad.addColorStop(1, 'rgba(255, 30, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(bsx - bw, bsy - bh, bw * 3, bh * 3);

    // Smoke rising above fire
    ctx.globalAlpha = 1;
    for (let s = 0; s < 12; s++) {
      const sx2 = bsx + bw * 0.2 + Math.random() * bw * 0.6;
      const smokeOff = (now * 0.002 + s * 29) % 80;
      const smokeY = bsy - smokeOff;
      const smokeAlpha = (1 - smokeOff / 80) * 0.25;
      const smokeSize = 4 + smokeOff * 0.3;
      ctx.globalAlpha = smokeAlpha;
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(
        sx2 + Math.sin(now * 0.001 + s) * 10,
        smokeY,
        smokeSize, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 17. Day/night overlay
  drawDayNightOverlay(game.time);

  // 18. Draw minimap
  drawMinimap(game);

  // Draw crime timer in HUD if active
  if (game.activeCrime) {
    const timerEl = document.getElementById('crime-timer');
    if (timerEl) {
      timerEl.classList.remove('hidden');
      const valueEl = document.getElementById('crime-timer-value');
      if (valueEl) valueEl.textContent = Math.ceil(game.activeCrime.timeRemaining) + 's';
    }
  } else {
    const timerEl = document.getElementById('crime-timer');
    if (timerEl) timerEl.classList.add('hidden');
  }

  // Train countdown HUD
  if (game.train && game.train.state === 'stopped') {
    var trainRemaining = Math.max(0, Math.ceil(60 - game.train.timer));
    ctx.fillStyle = 'rgba(40,30,10,0.85)';
    ctx.fillRect(canvas.width / 2 - 100, 50, 200, 30);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - 100, 50, 200, 30);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRAIN: ' + trainRemaining + 's remaining', canvas.width / 2, 70);
  }

  // "Press E / Walk in" prompt near sheriff office
  if (game.state === 'playing' && game.player) {
    var sheriffB = null;
    for (var sbi = 0; sbi < game.buildings.length; sbi++) {
      if (game.buildings[sbi].type === BUILDING_TYPES.SHERIFF) { sheriffB = game.buildings[sbi]; break; }
    }
    if (sheriffB) {
      var pxT = game.player.x / TILE, pyT = game.player.y / TILE;
      var distToSheriff = Math.abs(pxT - sheriffB.doorX) + Math.abs(pyT - (sheriffB.doorY + 1));
      if (distToSheriff < 6) {
        var promptX = sheriffB.doorX * TILE - camX;
        var promptY = sheriffB.doorY * TILE - camY - 20;
        var promptPulse = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
        ctx.globalAlpha = promptPulse;
        // Big dark background panel
        ctx.fillStyle = 'rgba(10,8,2,0.9)';
        ctx.fillRect(promptX - 110, promptY - 32, 220, 50);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(promptX - 110, promptY - 32, 220, 50);
        // Arrow pointing down
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(promptX - 6, promptY + 20);
        ctx.lineTo(promptX + 6, promptY + 20);
        ctx.lineTo(promptX, promptY + 30);
        ctx.closePath();
        ctx.fill();
        // Text
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER SHERIFF OFFICE', promptX, promptY - 12);
        ctx.fillStyle = '#e8d8b8';
        ctx.font = '11px monospace';
        ctx.fillText('Walk to door or press [E]', promptX, promptY + 4);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Draw HP display
  if (game.player) {
    const hpEl = document.getElementById('hp-display');
    if (hpEl) hpEl.textContent = `HP: ${game.player.hp}/${game.player.maxHp}`;
  }
}

// Fallback drawHorse if not defined elsewhere
if (typeof drawHorse === 'undefined') {
  var drawHorse = function(horse, camX, camY) {
    const sx = horse.x - camX;
    const sy = horse.y - camY;
    const now = Date.now();
    const bob = Math.sin(now * 0.003) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 18, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs - 4 distinct with hooves and idle sway
    ctx.fillStyle = '#5a3a1a';
    const legSway = Math.sin(now * 0.004) * 1;
    // Back left
    ctx.fillRect(sx - 11, sy + 8 + bob, 3, 10 + legSway);
    // Back right
    ctx.fillRect(sx - 5, sy + 8 + bob, 3, 10 - legSway);
    // Front left
    ctx.fillRect(sx + 5, sy + 8 + bob, 3, 10 - legSway);
    // Front right
    ctx.fillRect(sx + 11, sy + 8 + bob, 3, 10 + legSway);
    // Hooves (dark)
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(sx - 11, sy + 16 + bob + legSway, 3, 2);
    ctx.fillRect(sx - 5, sy + 16 + bob - legSway, 3, 2);
    ctx.fillRect(sx + 5, sy + 16 + bob - legSway, 3, 2);
    ctx.fillRect(sx + 11, sy + 16 + bob + legSway, 3, 2);

    // Body - rounded contour with multiple rects
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(sx - 14, sy - 2 + bob, 28, 12);
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(sx - 12, sy - 4 + bob, 24, 4); // upper body
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(sx - 10, sy + 4 + bob, 20, 3); // belly highlight

    // Neck
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(sx + 12, sy - 14 + bob, 8, 16);
    // Neck highlight
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(sx + 13, sy - 12 + bob, 2, 12);

    // Head - detailed shape
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(sx + 16, sy - 20 + bob, 10, 10);
    // Snout (extending forward)
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(sx + 22, sy - 18 + bob, 6, 7);
    // Mouth line
    ctx.fillStyle = '#4a2a10';
    ctx.fillRect(sx + 23, sy - 12 + bob, 5, 1);
    // Nostril
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(sx + 26, sy - 15 + bob, 2, 1);
    // Eye
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(sx + 20, sy - 18 + bob, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 21, sy - 18 + bob, 1, 1);
    // Ears
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(sx + 17, sy - 23 + bob, 2, 4);
    ctx.fillRect(sx + 21, sy - 23 + bob, 2, 4);
    // Ear inner
    ctx.fillStyle = '#9a7a5a';
    ctx.fillRect(sx + 17, sy - 22 + bob, 1, 2);
    ctx.fillRect(sx + 21, sy - 22 + bob, 1, 2);

    // Mane
    ctx.fillStyle = '#2a1a0a';
    const maneWave = Math.sin(now * 0.005) * 1;
    ctx.fillRect(sx + 12, sy - 18 + bob, 3, 2);
    ctx.fillRect(sx + 11 + maneWave, sy - 16 + bob, 3, 2);
    ctx.fillRect(sx + 12 - maneWave, sy - 14 + bob, 3, 2);
    ctx.fillRect(sx + 11, sy - 12 + bob, 3, 2);
    ctx.fillRect(sx + 12 + maneWave, sy - 10 + bob, 3, 2);
    ctx.fillRect(sx + 11, sy - 8 + bob, 3, 2);

    // Saddle blanket
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(sx - 6, sy - 5 + bob, 16, 4);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(sx - 6, sy - 4 + bob, 16, 1); // decorative stripe

    // Saddle
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(sx - 4, sy - 8 + bob, 12, 5);
    ctx.fillStyle = '#4a2508';
    ctx.fillRect(sx - 4, sy - 8 + bob, 12, 1); // top edge
    // Saddle horn
    ctx.fillStyle = '#6a4020';
    ctx.fillRect(sx + 6, sy - 10 + bob, 2, 3);
    // Stirrups
    ctx.fillStyle = '#888888';
    ctx.fillRect(sx - 2, sy + 2 + bob, 1, 6);
    ctx.fillRect(sx + 6, sy + 2 + bob, 1, 6);
    ctx.fillRect(sx - 3, sy + 7 + bob, 3, 1);
    ctx.fillRect(sx + 5, sy + 7 + bob, 3, 1);

    // Bridle/reins hanging down
    ctx.strokeStyle = '#3a2010';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 22, sy - 12 + bob);
    ctx.lineTo(sx + 18, sy - 6 + bob);
    ctx.lineTo(sx + 10, sy - 4 + bob);
    ctx.stroke();

    // Tail with swish
    const tailSwish = Math.sin(now * 0.006) * 3;
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(sx - 16, sy - 2 + bob, 4, 4);
    ctx.fillRect(sx - 18 + tailSwish, sy + 2 + bob, 3, 4);
    ctx.fillRect(sx - 19 + tailSwish * 1.5, sy + 6 + bob, 2, 4);

    // Interaction hint if player is close
    if (game.player) {
      const d = Math.hypot(game.player.x - horse.x, game.player.y - horse.y);
      if (d < 50) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[H] Mount', sx, sy - 28);
      }
    }
  };
}

// ─────────────────────────────────────────────
// §B.0  JAIL INTERIOR (standalone, entered from jail building)
// ─────────────────────────────────────────────
function updateJailInterior(dt) {
  var W = gameCanvas.width;
  var H = gameCanvas.height;
  var prisoners = (typeof office !== 'undefined' && office.prisoners) ? office.prisoners : game.prisoners;
  var jSpeed = 3 * dt * 60;

  // WASD movement
  if (keys['KeyW'] || keys['ArrowUp']) game._jailPlayerY -= jSpeed;
  if (keys['KeyS'] || keys['ArrowDown']) game._jailPlayerY += jSpeed;
  if (keys['KeyA'] || keys['ArrowLeft']) game._jailPlayerX -= jSpeed;
  if (keys['KeyD'] || keys['ArrowRight']) game._jailPlayerX += jSpeed;
  game._jailPlayerX = clamp(game._jailPlayerX, 30, W - 30);
  game._jailPlayerY = clamp(game._jailPlayerY, 80, H - 30);

  // Find nearest cell
  game._jailNearCell = -1;
  var cellCount = prisoners.length;
  if (cellCount > 0) {
    var cellW = Math.min(100, (W - 80) / cellCount);
    var cellStartX = 40;
    var cellY = 80;
    var bestDist = 80;
    for (var ci = 0; ci < cellCount; ci++) {
      var cx = cellStartX + ci * (cellW + 10) + cellW / 2;
      var cy = cellY + 50;
      var d = Math.hypot(game._jailPlayerX - cx, game._jailPlayerY - cy);
      if (d < bestDist) {
        bestDist = d;
        game._jailNearCell = ci;
      }
    }
  }

  // E to interact with prisoner (bribe if have key)
  if (game._jailNearCell >= 0 && consumeKey('KeyE')) {
    var pr = prisoners[game._jailNearCell];
    if (game._hasJailKey) {
      if (!game._jailBribeOffer) {
        var bribeAmt = rand(30, 150);
        game._jailBribeOffer = { index: game._jailNearCell, name: pr.name, crime: pr.crime, amount: bribeAmt };
      }
    } else {
      showNotification(pr.name + ' — Jailed for: ' + pr.crime + ' (Day ' + pr.day + ')');
    }
  }

  // Bribe dialog
  if (game._jailBribeOffer) {
    if (consumeKey('KeyY') || consumeKey('Digit1')) {
      var bribe = game._jailBribeOffer;
      game.gold += bribe.amount;
      game.totalGoldEarned += bribe.amount;
      game.corruption = clamp((game.corruption || 0) + 8, 0, 100);
      showNotification('Accepted $' + bribe.amount + ' bribe. Released ' + bribe.name + '. +Corruption');
      prisoners.splice(bribe.index, 1);
      game._jailBribeOffer = null;
      game._jailNearCell = -1;
    } else if (consumeKey('KeyN') || consumeKey('Digit2') || consumeKey('Escape')) {
      game.reputation = clamp((game.reputation || 50) + 4, 0, REPUTATION_MAX);
      showNotification('Refused bribe from ' + game._jailBribeOffer.name + '. +4 Rep');
      game._jailBribeOffer = null;
    }
    return;
  }

  // ESC to exit
  if (consumeKey('Escape')) {
    game.state = 'playing';
    game._jailInterior = false;
    // Move player south of jail building to avoid re-entry
    for (var bi = 0; bi < game.buildings.length; bi++) {
      var b = game.buildings[bi];
      if (b.type === BUILDING_TYPES.JAIL) {
        game.player.x = (b.x + b.w / 2) * TILE;
        game.player.y = (b.y + b.h + 2) * TILE;
        break;
      }
    }
  }
}

function renderJailInterior() {
  var W = gameCanvas.width;
  var H = gameCanvas.height;
  var prisoners = (typeof office !== 'undefined' && office.prisoners) ? office.prisoners : game.prisoners;

  // Background — stone floor
  ctx.fillStyle = '#3a3228';
  ctx.fillRect(0, 0, W, H);
  // Stone floor tiles
  ctx.strokeStyle = '#2a2218';
  ctx.lineWidth = 1;
  for (var fy = 0; fy < H; fy += 20) {
    ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
  }
  for (var fx = 0; fx < W; fx += 20) {
    ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx, H); ctx.stroke();
  }

  // Back wall
  ctx.fillStyle = '#5a4a38';
  ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = '#4a3a28';
  ctx.fillRect(0, 65, W, 5);

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('JAIL', W / 2, 30);
  ctx.fillStyle = '#a09070';
  ctx.font = '10px monospace';
  ctx.fillText(prisoners.length + ' prisoner' + (prisoners.length !== 1 ? 's' : ''), W / 2, 48);
  ctx.textAlign = 'left';

  // Draw cells — auto-expand for each prisoner
  var cellCount = prisoners.length;
  if (cellCount === 0) {
    ctx.fillStyle = '#8a7a5a';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('The jail is empty.', W / 2, H / 2);
    ctx.fillText('Press ESC to leave.', W / 2, H / 2 + 20);
    ctx.textAlign = 'left';
  } else {
    var maxPerRow = Math.floor((W - 60) / 110);
    var cellW = Math.min(100, (W - 60) / Math.min(cellCount, maxPerRow));
    var cellH = 100;
    var cellStartX = 30;
    var cellY = 80;

    for (var ci = 0; ci < cellCount; ci++) {
      var row = Math.floor(ci / maxPerRow);
      var col = ci % maxPerRow;
      var cx = cellStartX + col * (cellW + 10);
      var cy = cellY + row * (cellH + 15);
      var pr = prisoners[ci];
      var isNear = (ci === game._jailNearCell);

      // Cell background
      ctx.fillStyle = isNear ? '#4a3a20' : '#2a1a0a';
      ctx.fillRect(cx, cy, cellW, cellH);
      ctx.strokeStyle = isNear ? '#ffd700' : '#6a5a3a';
      ctx.lineWidth = isNear ? 2 : 1;
      ctx.strokeRect(cx, cy, cellW, cellH);

      // Bars
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      var barSpacing = cellW / 5;
      for (var bi2 = 1; bi2 < 5; bi2++) {
        ctx.beginPath();
        ctx.moveTo(cx + bi2 * barSpacing, cy);
        ctx.lineTo(cx + bi2 * barSpacing, cy + cellH);
        ctx.stroke();
      }

      // Prisoner sprite (simple)
      var px = cx + cellW / 2;
      var py = cy + cellH / 2;
      // Body (striped prison clothes)
      ctx.fillStyle = '#cc8833';
      ctx.fillRect(px - 5, py - 3, 10, 14);
      // Stripes
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(px - 5, py, 10, 2);
      ctx.fillRect(px - 5, py + 5, 10, 2);
      ctx.fillRect(px - 5, py + 10, 10, 2);
      // Head
      ctx.fillStyle = '#d2a87a';
      ctx.beginPath();
      ctx.arc(px, py - 7, 5, 0, Math.PI * 2);
      ctx.fill();
      // Angry eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(px - 3, py - 8, 2, 2);
      ctx.fillRect(px + 1, py - 8, 2, 2);

      // Name and crime
      ctx.fillStyle = '#e8d5a3';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pr.name, px, cy + cellH - 12);
      ctx.fillStyle = '#aa8855';
      ctx.font = '7px monospace';
      ctx.fillText(pr.crime, px, cy + cellH - 3);
      ctx.textAlign = 'left';

      // Interaction prompt
      if (isNear) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        if (game._hasJailKey) {
          ctx.fillText('[E] Talk (have key)', px, cy - 5);
        } else {
          ctx.fillText('[E] Check prisoner', px, cy - 5);
        }
        ctx.textAlign = 'left';
      }
    }
  }

  // Bribe dialog overlay
  if (game._jailBribeOffer) {
    var bo = game._jailBribeOffer;
    ctx.fillStyle = 'rgba(10, 6, 2, 0.9)';
    ctx.fillRect(W / 2 - 140, H / 2 - 50, 280, 100);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 140, H / 2 - 50, 280, 100);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bo.name + ' offers $' + bo.amount, W / 2, H / 2 - 25);
    ctx.fillStyle = '#e8d5a3';
    ctx.font = '10px monospace';
    ctx.fillText('"Let me out, Sheriff... I got money."', W / 2, H / 2 - 5);
    ctx.fillStyle = '#44cc44';
    ctx.fillText('[Y/1] Accept bribe (+Corruption)', W / 2, H / 2 + 20);
    ctx.fillStyle = '#cc4444';
    ctx.fillText('[N/2] Refuse (+4 Rep)', W / 2, H / 2 + 38);
    ctx.textAlign = 'left';
  }

  // Player
  var jpx = game._jailPlayerX;
  var jpy = game._jailPlayerY;
  // Body
  ctx.fillStyle = '#5a4a2a';
  ctx.fillRect(jpx - 5, jpy - 3, 10, 14);
  // Head
  ctx.fillStyle = '#d2a87a';
  ctx.beginPath();
  ctx.arc(jpx, jpy - 7, 5, 0, Math.PI * 2);
  ctx.fill();
  // Hat
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(jpx - 7, jpy - 14, 14, 4);
  ctx.fillRect(jpx - 5, jpy - 18, 10, 5);
  // Badge
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(jpx - 1, jpy, 3, 3);

  // HUD
  ctx.fillStyle = '#a09070';
  ctx.font = '9px monospace';
  ctx.fillText('WASD: Move | E: Interact | ESC: Exit Jail', 10, H - 10);
  if (game._hasJailKey) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('KEY', W - 40, H - 10);
  }
}

// ─────────────────────────────────────────────
// §B  MAIN GAME LOOP
// ─────────────────────────────────────────────
let lastTime = 0;
let loopStarted = false;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  game._gameTime = (game._gameTime || 0) + dt;

  try {
  switch (game.state) {
    case 'playing':
      // Run all update systems
      updatePlayer(dt);
      updateNPCs(dt);
      updateCrimes(dt);
      updateQuests();
      updateTime(dt);
      if (typeof updateAchievements === 'function') updateAchievements();
      updateCombo();
      updateStreak();
      updateDailyChallenge();
      updateAmbientParticles();
      bullets.update(game.npcs, game.player, particles, game, game.map);
      // Check if player died from bullets
      if (game.player.dead && game.player.hp <= 0 && !game._cheatMode) {
        game.state = 'gameover';
        game.gameOverReason = 'You were gunned down!';
        break;
      }
      particles.update();
      updateCamera();
      updateUI();
      // Update extension systems
      // Periodic train spawn timer (every ~90 seconds of gameplay)
      game._trainSpawnTimer = (game._trainSpawnTimer || 0) + dt;
      if (!game.train && game._trainSpawnTimer > 90) {
        game._trainSpawnTimer = 0;
        if (Math.random() < 0.5) spawnTrain();
      }
      if (game.train) updateTrain(dt);
      if (typeof updateOffice === 'function') updateOffice(dt);
      if (typeof updateCorruption === 'function') updateCorruption(dt);
      if (typeof updateFeatures === 'function') updateFeatures(dt);
      render();
      // Render extension systems
      if (typeof renderOfficeOverlay === 'function') renderOfficeOverlay();
      if (typeof renderCorruptionOverlay === 'function') renderCorruptionOverlay();
      if (typeof renderFeaturesOverlay === 'function') renderFeaturesOverlay();

      // Escape -> pause
      if (consumeKey('Escape')) {
        game.state = 'paused';
        document.getElementById('pause-screen').classList.remove('hidden');
      }
      // J -> journal
      if (consumeKey('KeyJ')) {
        openJournal();
      }
      // M -> minimap toggle or open minigame menu
      if (consumeKey('KeyM')) {
        if (typeof openMinigameMenu === 'function' && !_inputBlockedByMinigameOrFeature()) {
          openMinigameMenu();
        } else if (!_inputBlockedByMinigameOrFeature()) {
          game.showMinimap = !game.showMinimap;
        }
      }
      // TAB -> shop if near a store building
      if (consumeKey('Tab')) {
        if (typeof openShop === 'function') {
          const p = game.player;
          const tx = Math.floor(p.x / TILE);
          const ty = Math.floor((p.y + 10) / TILE);
          let nearShop = null;
          for (const b of game.buildings) {
            if (b.type === BUILDING_TYPES.GENERAL || b.type === BUILDING_TYPES.BLACKSMITH) {
              const bCenterX = b.x + b.w / 2;
              const bCenterY = b.y + b.h / 2;
              const d = Math.hypot(tx - bCenterX, ty - bCenterY);
              if (d < 8) {
                nearShop = b;
                break;
              }
            }
          }
          if (nearShop) {
            openShop(nearShop.type === BUILDING_TYPES.BLACKSMITH ? 'blacksmith' : 'general');
          } else {
            showNotification('No shop nearby. Walk closer to a store.');
          }
        }
      }
      break;

    case 'minigame':
      // Only run minigame logic, time, and rendering — NO player movement/shooting
      updateTime(dt);
      updateAmbientParticles();
      particles.update();
      updateCamera();
      // updateMinigames is called via the updateFeatures wrapper
      if (typeof updateFeatures === 'function') updateFeatures(dt);
      render();
      if (typeof renderFeaturesOverlay === 'function') renderFeaturesOverlay();
      // If minigame ended (activeMinigame became null), go back to playing
      if (game.state === 'minigame' && (!game._minigames || !game._minigames.activeMinigame) && !game._minigameMenuOpen) {
        game.state = 'playing';
      }
      // ESC during minigame → handled by individual minigames, but also close menu
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
      // Number keys for dialog choices
      if (consumeKey('Digit1')) {
        const btn = document.querySelector('#dialog-choices .dialog-choice:nth-child(1)');
        if (btn) btn.click();
      }
      if (consumeKey('Digit2')) {
        const btn = document.querySelector('#dialog-choices .dialog-choice:nth-child(2)');
        if (btn) btn.click();
      }
      if (consumeKey('Digit3')) {
        const btn = document.querySelector('#dialog-choices .dialog-choice:nth-child(3)');
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

    case 'shop':
      render();
      if (consumeKey('Escape') || consumeKey('KeyE') || consumeKey('Tab')) {
        if (typeof closeShop === 'function') closeShop();
      }
      break;

    case 'poker':
      render();
      // Poker input: number keys for actions, escape to quit
      if (consumeKey('Escape')) {
        if (typeof closePoker === 'function') closePoker();
      }
      if (consumeKey('Digit1')) {
        const pokerBtn = document.querySelector('#poker-content button:nth-child(1)');
        if (pokerBtn) pokerBtn.click();
      }
      if (consumeKey('Digit2')) {
        const pokerBtn = document.querySelector('#poker-content button:nth-child(2)');
        if (pokerBtn) pokerBtn.click();
      }
      if (consumeKey('Digit3')) {
        const pokerBtn = document.querySelector('#poker-content button:nth-child(3)');
        if (pokerBtn) pokerBtn.click();
      }
      break;

    case 'tutorial':
      render();
      if (typeof renderOfficeOverlay === 'function') renderOfficeOverlay();
      if (typeof renderCorruptionOverlay === 'function') renderCorruptionOverlay();
      if (typeof renderFeaturesOverlay === 'function') renderFeaturesOverlay();
      // Allow any key to dismiss tutorial
      if (consumeKey('KeyE') || consumeKey('Space') || consumeKey('Enter') || consumeKey('Escape') ||
          consumeKey('Digit1') || consumeKey('Digit2') || consumeKey('Digit3')) {
        var tutOverlay = document.getElementById('tutorial-overlay');
        if (tutOverlay) tutOverlay.classList.add('hidden');
        game.state = _preTutorialState || 'playing';
        _preTutorialState = null;
      }
      break;

    case 'gameover':
      render();
      if (!game._gameOverShown) { game._gameOverShown = true; showGameOver(); }
      break;

    case 'office':
      if (typeof updateOffice === 'function') updateOffice(dt);
      // Don't render the world — office overlay fills the whole screen
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (typeof renderOfficeOverlay === 'function') renderOfficeOverlay();
      break;

    case 'jail':
      updateJailInterior(dt);
      renderJailInterior();
      break;

    case 'title':
      // Title screen handled entirely by HTML/CSS
      break;
  }
  } catch (e) { console.error('Game loop error:', e); }

  // Clear keysJustPressed at end of frame
  for (const k in keysJustPressed) {
    keysJustPressed[k] = false;
  }

  requestAnimationFrame(gameLoop);
}

// ─────────────────────────────────────────────
// §C  UI EVENT HANDLERS
// ─────────────────────────────────────────────

// 0. Cheat code input
var cheatInput = document.getElementById('cheat-input');
if (cheatInput) {
  cheatInput.addEventListener('keydown', function(e) {
    e.stopPropagation(); // Don't trigger game controls while typing
  });
  cheatInput.addEventListener('keyup', function(e) {
    e.stopPropagation();
    var code = this.value.toLowerCase();
    if (code === 'srg2') {
      cheatActivated = true;
      this.style.borderColor = '#ffd700';
      this.style.color = '#ffd700';
      this.value = 'ACTIVATED';
      this.disabled = true;
      setTimeout(function() {
        if (cheatInput) {
          cheatInput.style.borderColor = '#5a3a18';
          cheatInput.style.color = '#b8944a';
        }
      }, 2000);
    } else if (code === 'corrupt') {
      var level = prompt('How corrupt do you want to start?\n\nEnter a number 1-100:\n\n1-20: Bent Cop (shakedowns)\n21-60: Crooked Sheriff (bodyguards + stealing)\n61-80: Crime Boss (outlaw allies)\n81-100: Tyrant (double gold, assassins hunt you)');
      var parsed = parseInt(level, 10);
      if (isNaN(parsed) || parsed < 1) parsed = 50;
      if (parsed > 100) parsed = 100;
      game._corruptStart = true;
      game._corruptStartLevel = parsed;
      this.style.borderColor = '#880088';
      this.style.color = '#cc66ff';
      this.value = 'CORRUPT (' + parsed + ')';
      this.disabled = true;
      setTimeout(function() {
        if (cheatInput) {
          cheatInput.style.borderColor = '#5a3a18';
          cheatInput.style.color = '#b8944a';
        }
      }, 2000);
    }
  });
}

// 1. New game button -> show difficulty select
document.getElementById('btn-new').addEventListener('click', function() {
  const diffSelect = document.getElementById('difficulty-select');
  const titleMenu = document.getElementById('title-menu');
  if (diffSelect && titleMenu) {
    diffSelect.classList.remove('hidden');
    titleMenu.classList.add('hidden');
  } else {
    // Fallback: no difficulty select, start directly
    audio.init();
    initGame();
    game.state = 'playing';
    document.getElementById('title-screen').classList.add('hidden');
    audio.playAmbientWind();
    audio.playWesternRiff();
    seedAmbientParticles();
  }
});

// 2. Difficulty button clicks
document.querySelectorAll('.diff-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const selectedDiff = this.getAttribute('data-diff') || 'normal';
    audio.init();
    if (typeof initGame === 'function') {
      if (initGame.length >= 1) {
        initGame(selectedDiff);
      } else {
        initGame();
        // Apply difficulty settings manually if initGame doesn't accept params
        if (typeof DIFFICULTY !== 'undefined' && DIFFICULTY[selectedDiff]) {
          const diff = DIFFICULTY[selectedDiff];
          if (diff.playerHP) game.player.hp = diff.playerHP;
          if (diff.playerHP) game.player.maxHp = diff.playerHP;
          if (diff.startingMoney) game.gold = diff.startingMoney;
        }
      }
    }
    game.state = 'playing';
    game.difficulty = selectedDiff;
    document.getElementById('title-screen').classList.add('hidden');
    audio.playAmbientWind();
    audio.playWesternRiff();
    seedAmbientParticles();

    // Show tutorial on first game
    if (typeof showTutorial === 'function') {
      showTutorial('intro', 'Welcome, Sheriff! Use WASD to move, E to interact with NPCs, SPACE to shoot, F for melee. Keep the peace and build your reputation!');
    }
  });
});

// 3. Continue button
document.getElementById('btn-continue').addEventListener('click', function() {
  audio.init();
  if (typeof loadGame === 'function' && loadGame()) {
    game.state = 'playing';
    document.getElementById('title-screen').classList.add('hidden');
    audio.playAmbientWind();
    seedAmbientParticles();
  } else {
    showNotification('No save data found!');
  }
});

// 4. Controls / Back toggle
document.getElementById('btn-controls').addEventListener('click', function() {
  const controlsPanel = document.getElementById('controls-panel');
  const titleMenu = document.getElementById('title-menu');
  const diffSelect = document.getElementById('difficulty-select');
  controlsPanel.classList.remove('hidden');
  titleMenu.classList.add('hidden');
  if (diffSelect) diffSelect.classList.add('hidden');
});

document.getElementById('btn-back').addEventListener('click', function() {
  document.getElementById('controls-panel').classList.add('hidden');
  document.getElementById('title-menu').classList.remove('hidden');
});

// 5. Resume from pause
document.getElementById('btn-resume').addEventListener('click', function() {
  game.state = 'playing';
  document.getElementById('pause-screen').classList.add('hidden');
});

// 6. Save & Quit
document.getElementById('btn-save').addEventListener('click', function() {
  if (typeof saveGame === 'function') saveGame();
  game.state = 'title';
  document.getElementById('pause-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
  document.getElementById('game-over-screen').classList.add('hidden');
});

// 7. Restart after game over
document.getElementById('btn-restart').addEventListener('click', function() {
  document.getElementById('game-over-screen').classList.add('hidden');
  if (typeof initGame === 'function') {
    if (game.difficulty) {
      initGame(game.difficulty);
    } else {
      initGame();
    }
  }
  game.state = 'playing';
  seedAmbientParticles();
});

// 8. New Game+ button
var ngPlusBtn = document.getElementById('btn-ng-plus');
if (ngPlusBtn) {
  ngPlusBtn.addEventListener('click', function() {
    document.getElementById('game-over-screen').classList.add('hidden');
    var ngLevel = (game.ngPlusLevel || 0) + 1;
    var ngData = {
      level: ngLevel,
      rank: game.rank,
      gold: game.gold,
      hasVest: game.hasVest,
      hasSpeedBoots: game.hasSpeedBoots,
      hasShotgun: game.hasShotgun,
      hasRifle: game.hasRifle,
      achievements: game.achievements ? game.achievements.slice() : [],
      tutorialShown: Object.assign({}, game.tutorialShown)
    };
    if (typeof initGame === 'function') {
      initGame(game.difficulty || 'normal', ngData);
    }
    game.state = 'playing';
    seedAmbientParticles();
    showNotification('New Game+ (Level ' + ngLevel + ') started!');
  });
}

// 9. Journal close
document.getElementById('journal-close').addEventListener('click', function() {
  closeJournal();
});

// 10. Journal tab clicks
document.querySelectorAll('.jtab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    // Remove active from all tabs
    document.querySelectorAll('.jtab').forEach(function(t) {
      t.classList.remove('active');
    });
    this.classList.add('active');

    var tabName = this.getAttribute('data-tab');
    var content = document.getElementById('journal-content');
    var html = '';

    switch (tabName) {
      case 'stats':
        html += '<div class="journal-section"><h4>STATS</h4>';
        html += '<div class="journal-entry">Rank: ' + game.rank + '</div>';
        html += '<div class="journal-entry">Days Served: ' + game.daysServed + '</div>';
        html += '<div class="journal-entry">Reputation: ' + game.reputation + '/100</div>';
        html += '<div class="journal-entry">Gold: $' + game.gold + '</div>';
        html += '<div class="journal-entry">Outlaws Killed: ' + game.outlawsKilled + '</div>';
        html += '<div class="journal-entry">Outlaws Arrested: ' + game.outlawsArrested + '</div>';
        html += '<div class="journal-entry">Crimes Resolved: ' + game.crimesResolved + '</div>';
        html += '<div class="journal-entry">Crimes Ignored: ' + game.crimesIgnored + '</div>';
        if (game.ngPlusLevel) {
          html += '<div class="journal-entry">NG+ Level: ' + game.ngPlusLevel + '</div>';
        }
        html += '</div>';
        break;

      case 'missions':
        if (game.activeQuest) {
          html += '<div class="journal-section"><h4>ACTIVE MISSION</h4>';
          html += '<div class="journal-entry">' + game.activeQuest.name + ': ' + game.activeQuest.desc + '</div>';
          html += '</div>';
        }
        if (game.completedQuests.length > 0) {
          html += '<div class="journal-section"><h4>COMPLETED MISSIONS (' + game.completedQuests.length + ')</h4>';
          for (var i = game.completedQuests.length - 1; i >= Math.max(0, game.completedQuests.length - 15); i--) {
            html += '<div class="journal-entry completed">' + game.completedQuests[i].name + '</div>';
          }
          html += '</div>';
        }
        if (!game.activeQuest && game.completedQuests.length === 0) {
          html += '<div class="journal-section"><p>No missions yet. Talk to the Mayor or Bartender.</p></div>';
        }
        break;

      case 'wanted':
        html += '<div class="journal-section"><h4>WANTED OUTLAWS</h4>';
        var outlaws = game.npcs.filter(function(n) {
          return (n.type === NPC_TYPES.OUTLAW || n.type === NPC_TYPES.BOUNTY) && n.state !== 'dead' && n.state !== 'arrested';
        });
        if (outlaws.length > 0) {
          for (var j = 0; j < outlaws.length; j++) {
            var status = outlaws[j].hostile ? ' (HOSTILE)' : ' (At large)';
            html += '<div class="journal-entry">' + outlaws[j].name + status + '</div>';
          }
        } else {
          html += '<div class="journal-entry">No known outlaws in town.</div>';
        }
        html += '</div>';
        break;

      case 'achievements':
        html += '<div class="journal-section"><h4>BADGES</h4>';
        if (typeof ACHIEVEMENTS !== 'undefined') {
          for (var k = 0; k < ACHIEVEMENTS.length; k++) {
            var ach = ACHIEVEMENTS[k];
            var unlocked = game.achievements && game.achievements.indexOf(ach.id) !== -1;
            var cls = unlocked ? 'journal-entry completed' : 'journal-entry';
            var icon = unlocked ? ach.icon : '?';
            html += '<div class="' + cls + '">' + icon + ' ' + ach.name + ' — ' + ach.desc + (unlocked ? ' [UNLOCKED]' : '') + '</div>';
          }
        } else {
          html += '<div class="journal-entry">No badges defined.</div>';
        }
        html += '</div>';
        break;

      case 'log':
        html += '<div class="journal-section"><h4>LOG</h4>';
        if (game.journalEntries.length > 0) {
          var entries = game.journalEntries.slice(-20).reverse();
          for (var m = 0; m < entries.length; m++) {
            html += '<div class="journal-entry">Day ' + entries[m].day + ', ' + entries[m].time + ': ' + entries[m].text + '</div>';
          }
        } else {
          html += '<div class="journal-entry">No entries yet.</div>';
        }
        html += '</div>';
        break;
    }

    content.innerHTML = html;
  });
});

// 11. Shop close
var shopCloseBtn = document.getElementById('shop-close');
if (shopCloseBtn) {
  shopCloseBtn.addEventListener('click', function() {
    if (typeof closeShop === 'function') closeShop();
  });
}

// 12. Tutorial dismiss
// Tutorial dismiss is handled inside showTutorial() directly

// 13. Volume sliders
var volMaster = document.getElementById('vol-master');
if (volMaster) {
  volMaster.addEventListener('input', function() {
    if (audio.master) {
      audio.master.gain.setValueAtTime(this.value / 100, audio.ctx.currentTime);
    }
  });
}

var volMusic = document.getElementById('vol-music');
if (volMusic) {
  volMusic.addEventListener('input', function() {
    if (audio.musicGain) {
      audio.musicGain.gain.setValueAtTime(this.value / 100, audio.ctx.currentTime);
    }
  });
}

var volSfx = document.getElementById('vol-sfx');
if (volSfx) {
  volSfx.addEventListener('input', function() {
    if (audio.sfxGain) {
      audio.sfxGain.gain.setValueAtTime(this.value / 100, audio.ctx.currentTime);
    }
  });
}

// 14. Show continue button if save data exists
if (localStorage.getItem(SAVE_KEY)) {
  document.getElementById('btn-continue').classList.remove('hidden');
}

// Prevent default on Tab key so it doesn't shift focus
document.addEventListener('keydown', function(e) {
  if (e.code === 'Tab' && game.state !== 'title') {
    e.preventDefault();
  }
});

// ─────────────────────────────────────────────
// §D  START THE LOOP
// ─────────────────────────────────────────────
if (!loopStarted) {
  loopStarted = true;
  requestAnimationFrame(gameLoop);
}

// === END PART 5 ===
