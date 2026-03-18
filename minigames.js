'use strict';

// ============================================================
// 30 NEW MINIGAMES — Sheriff Simulator Mega Expansion
// Loaded after features.js — uses globals: game, ctx, TILE, etc.
// ============================================================

// ── Lazy State Init ──
function initMinigames() {
  if (game._minigames) return;
  game._minigames = {

    // 1. Train Robbery Heist
    trainHeist: false,
    trainHeistPhase: 0, // 0=board, 1=fight guards, 2=crack safe, 3=escape
    trainHeistTimer: 0,
    trainHeistGuards: 3,
    trainHeistSafeProgress: 0,
    trainHeistLoot: 0,
    trainHeistAlarm: false,
    trainHeistCooldown: 0,

    // 2. Lasso Rodeo
    lassoRodeo: false,
    lassoRodeoPhase: 0,
    lassoRodeoTimer: 0,
    lassoRodeoScore: 0,
    lassoRodeoTargets: [],
    lassoRodeoRound: 0,

    // 3. Quick Draw Tournament
    quickDrawTourney: false,
    quickDrawRound: 0,
    quickDrawPhase: 0, // 0=staredown, 1=draw, 2=result
    quickDrawTimer: 0,
    quickDrawWindow: 0,
    quickDrawOpponent: '',
    quickDrawWins: 0,

    // 4. Cattle Rustling Defense
    cattleDefense: false,
    cattleDefenseTimer: 0,
    cattleCount: 10,
    cattleStolenCount: 0,
    cattleRustlers: [],
    cattlePositions: [],

    // 5. Saloon Brawl
    saloonBrawl: false,
    saloonBrawlTimer: 0,
    saloonBrawlHP: 10,
    saloonBrawlEnemies: [],
    saloonBrawlScore: 0,
    saloonBrawlCombo: 0,

    // 6. Stagecoach Defense
    stagecoachDefense: false,
    stagecoachTimer: 0,
    stagecoachHP: 100,
    stagecoachDistance: 0,
    stagecoachBandits: [],
    stagecoachAmmo: 30,

    // 7. Dynamite Defusal
    dynamiteDefusal: false,
    dynamiteDefusalTimer: 0,
    dynamiteWires: [],
    dynamiteCorrectWire: 0,
    dynamitePhase: 0,
    dynamiteScore: 0,

    // 8. Knife Throwing Contest
    knifeContest: false,
    knifeContestPhase: 0,
    knifeContestPower: 0,
    knifeContestAngle: 0,
    knifeContestDir: 1,
    knifeContestScore: 0,
    knifeContestRound: 0,
    knifeContestTarget: { x: 0, y: 0, radius: 30 },

    // 9. Horseshoe Toss
    horseshoeToss: false,
    horseshoePhase: 0,
    horseshoePower: 0,
    horseshoeAngle: 50,
    horseshoeAngleDir: 1,
    horseshoeScore: 0,
    horseshoeRound: 0,
    horseshoeFlying: false,
    horseshoePos: { x: 0, y: 0 },
    horseshoeStakeX: 250,

    // 10. Sharpshooting Contest
    sharpshootContest: false,
    sharpshootTimer: 30,
    sharpshootTargets: [],
    sharpshootScore: 0,
    sharpshootMisses: 0,
    sharpshootRound: 0,

    // 11. Bandit Hideout Raid
    hideoutRaid: false,
    hideoutRoom: 0,
    hideoutRooms: 5,
    hideoutEnemies: [],
    hideoutPlayerX: 150,
    hideoutPlayerY: 100,
    hideoutHP: 10,
    hideoutLoot: 0,
    hideoutCooldown: 0,

    // 12. Rodeo Bronco
    rodeoBronco: false,
    rodeoBroncoTimer: 0,
    rodeoBroncoBalance: 50,
    rodeoBroncoBuckDir: 0,
    rodeoBroncoBuckTimer: 0,
    rodeoBroncoScore: 0,

    // 13. Telegraph Decoder
    telegraphDecode: false,
    telegraphMessage: '',
    telegraphInput: '',
    telegraphTimer: 0,
    telegraphScore: 0,
    telegraphRound: 0,
    telegraphDots: [],

    // 14. Bank Vault Cracking
    vaultCrack: false,
    vaultPhase: 0,
    vaultDials: [0, 0, 0],
    vaultTargets: [0, 0, 0],
    vaultCurrentDial: 0,
    vaultTimer: 0,
    vaultClicks: [],

    // 15. Town Defense Wave
    townDefense: false,
    townDefenseWave: 0,
    townDefenseTimer: 0,
    townDefenseEnemies: [],
    townDefenseHP: 100,
    townDefenseKills: 0,
    townDefenseCooldown: 0,

    // 16. Wanted Poster Match
    posterMatch: false,
    posterMatchCards: [],
    posterMatchFlipped: [],
    posterMatchMatched: 0,
    posterMatchMoves: 0,
    posterMatchTimer: 60,

    // 17. Supply Run
    supplyRun: false,
    supplyRunTimer: 0,
    supplyRunDistance: 0,
    supplyRunObstacles: [],
    supplyRunLane: 1,
    supplyRunScore: 0,
    supplyRunHP: 3,

    // 18. Rattlesnake Roundup
    snakeRoundup: false,
    snakeRoundupTimer: 30,
    snakeRoundupSnakes: [],
    snakeRoundupCaught: 0,
    snakeRoundupBitten: 0,
    snakeRoundupPlayerX: 150,
    snakeRoundupPlayerY: 100,

    // 19. Gold Rush Auction
    goldAuction: false,
    goldAuctionItems: [],
    goldAuctionCurrent: 0,
    goldAuctionBid: 0,
    goldAuctionTimer: 0,
    goldAuctionWon: [],

    // 20. Moonshine Bust
    moonshineBust: false,
    moonshineClues: [],
    moonshineSearched: [],
    moonshineFound: false,
    moonshineTimer: 60,
    moonshineLocations: [],

    // 21. Prospector's Claim
    prospectorClaim: false,
    prospectorTimer: 0,
    prospectorGold: 0,
    prospectorDepth: 0,
    prospectorRocks: [],
    prospectorTool: 0, // 0=pickaxe, 1=dynamite, 2=sluice

    // 22. Poker Tournament
    pokerTourney: false,
    pokerTourneyRound: 0,
    pokerTourneyChips: 500,
    pokerTourneyHand: [],
    pokerTourneyDealer: [],
    pokerTourneyPot: 0,
    pokerTourneyPhase: 0,
    pokerTourneyHeld: [],

    // 23. High Noon Standoff
    highNoonStandoff: false,
    highNoonPhase: 0,
    highNoonEnemies: [],
    highNoonTimer: 0,
    highNoonPlayerAngle: 0,
    highNoonShots: 6,
    highNoonScore: 0,

    // 24. Wagon Wheel Repair
    wagonRepair: false,
    wagonRepairTimer: 30,
    wagonRepairPhase: 0,
    wagonRepairProgress: 0,
    wagonRepairTarget: 0,
    wagonRepairHits: 0,
    wagonRepairScore: 0,

    // 25. Cattle Branding
    cattleBranding: false,
    cattleBrandingTimer: 30,
    cattleBrandingTarget: 0,
    cattleBrandingSelected: 0,
    cattleBrandingScore: 0,
    cattleBrandingRound: 0,
    cattleBrandingBrands: [],

    // 26. Medicine Man
    medicineMan: false,
    medicineTimer: 45,
    medicinePatients: [],
    medicineCurrentPatient: 0,
    medicineScore: 0,
    medicineItems: [],

    // 27. Jail Escape Prevention
    jailEscape: false,
    jailEscapeTimer: 60,
    jailEscapePrisoners: [],
    jailEscapeBlocked: 0,
    jailEscapeEscaped: 0,
    jailEscapePlayerX: 150,
    jailEscapePlayerY: 100,

    // 28. Card Slinger (Blackjack variant)
    cardSlinger: false,
    cardSlingerHand: [],
    cardSlingerDealer: [],
    cardSlingerBet: 0,
    cardSlingerPhase: 0,
    cardSlingerWins: 0,
    cardSlingerRound: 0,

    // 29. Shootout at Sundown
    sundownShootout: false,
    sundownPhase: 0,
    sundownTimer: 0,
    sundownEnemies: [],
    sundownAmmo: 12,
    sundownScore: 0,
    sundownWave: 0,

    // 30. Treasure Map Puzzle
    treasurePuzzle: false,
    treasurePuzzleGrid: [],
    treasurePuzzleMoves: 0,
    treasurePuzzleTimer: 60,
    treasurePuzzleSolved: false,
    treasurePuzzleReward: 0,

    // Global
    activeMinigame: null,
    minigameCooldowns: {},
    totalMinigamesPlayed: 0,
    totalMinigamesWon: 0,

    initialized: true
  };
}

// ============================================================
// HELPER: Check if any minigame is active
// ============================================================
function isMinigameActive() {
  if (!game._minigames) return false;
  return game._minigames.activeMinigame !== null;
}

// ============================================================
// HELPER: Start a minigame
// ============================================================
function startMinigame(name) {
  initMinigames();
  var m = game._minigames;
  if (m.activeMinigame) return false;
  if (m.minigameCooldowns[name] && m.minigameCooldowns[name] > 0) {
    showNotification('This activity is on cooldown. Try again later.');
    return false;
  }
  m.activeMinigame = name;
  m.totalMinigamesPlayed++;
  // Switch to minigame state — completely disables player movement/shooting
  game.state = 'minigame';
  return true;
}

// ============================================================
// HELPER: End a minigame
// ============================================================
function endMinigame(name, won, cooldown) {
  var m = game._minigames;
  m.activeMinigame = null;
  m[name] = false;
  if (won) m.totalMinigamesWon++;
  if (cooldown) m.minigameCooldowns[name] = cooldown;
  // Restore playing state
  if (game.state === 'minigame') game.state = 'playing';
}

// ============================================================
// MINIGAME MENU SYSTEM
// ============================================================
var MINIGAME_CATALOG = [
  { key: 'trainHeist', name: 'Train Heist', desc: 'Rob a train! Fight guards, crack the safe, escape.', cost: 0 },
  { key: 'lassoRodeo', name: 'Lasso Rodeo', desc: 'Lasso cattle in the arena.', cost: 10 },
  { key: 'quickDrawTourney', name: 'Quick Draw Tournament', desc: '5-round quick draw dueling tournament.', cost: 50 },
  { key: 'saloonBrawl', name: 'Saloon Brawl', desc: 'Fistfight in the saloon! Punch, dodge, combo.', cost: 0 },
  { key: 'stagecoachDefense', name: 'Stagecoach Defense', desc: 'Defend a stagecoach from bandits.', cost: 0 },
  { key: 'knifeContest', name: 'Knife Throwing', desc: 'Throw knives at targets for points.', cost: 15 },
  { key: 'horseshoeToss', name: 'Horseshoe Toss', desc: 'Toss horseshoes at the stake.', cost: 10 },
  { key: 'sharpshootContest', name: 'Sharpshooting Contest', desc: 'Timed target shooting challenge.', cost: 30 },
  { key: 'hideoutRaid', name: 'Bandit Hideout Raid', desc: 'Clear 5 rooms of bandits for loot.', cost: 0 },
  { key: 'rodeoBronco', name: 'Bronco Riding', desc: 'Stay on a bucking bronco for 8 seconds.', cost: 20 },
  { key: 'vaultCrack', name: 'Vault Cracking', desc: 'Crack a bank vault. Corrupt path (+corruption).', cost: 0 },
  { key: 'posterMatch', name: 'Wanted Poster Match', desc: 'Memory card matching game. Find pairs.', cost: 0 },
  { key: 'supplyRun', name: 'Supply Run', desc: 'Deliver supplies, dodge obstacles on the trail.', cost: 0 },
  { key: 'pokerTourney', name: 'Poker Tournament', desc: '5-round poker tournament.', cost: 100 },
  { key: 'cardSlinger', name: 'Blackjack', desc: '5-round blackjack.', cost: 25 },
  { key: 'cattleBranding', name: 'Cattle Branding', desc: 'Match the right brand to each cow.', cost: 10 },
  { key: 'cattleDefense', name: 'Cattle Rustling Defense', desc: 'Protect cattle from rustlers.', cost: 0 },
  { key: 'dynamiteDefusal', name: 'Dynamite Defusal', desc: 'Cut the right wire before it blows!', cost: 0 },
  { key: 'townDefense', name: 'Town Defense', desc: 'Defend town from 3 waves of bandits.', cost: 0 },
  { key: 'highNoonStandoff', name: 'High Noon Standoff', desc: '4 gunmen surround you. Aim and shoot!', cost: 0 },
  { key: 'sundownShootout', name: 'Sundown Shootout', desc: '3 waves of outlaws at dusk.', cost: 0 },
  { key: 'snakeRoundup', name: 'Rattlesnake Roundup', desc: 'Catch snakes, avoid bites!', cost: 0 },
  { key: 'wagonRepair', name: 'Wagon Wheel Repair', desc: 'Fix a broken wagon wheel with timing.', cost: 0 },
  { key: 'medicineMan', name: 'Medicine Man', desc: 'Treat patients with correct remedies.', cost: 0 },
  { key: 'jailEscape', name: 'Jail Escape Prevention', desc: 'Stop prisoners from escaping!', cost: 0 },
  { key: 'telegraphDecode', name: 'Telegraph Decoder', desc: 'Type words to decode urgent telegrams.', cost: 0 },
  { key: 'moonshineBust', name: 'Moonshine Bust', desc: 'Search locations to find illegal still.', cost: 0 },
  { key: 'goldAuction', name: 'Gold Rush Auction', desc: 'Bid on valuable items at auction.', cost: 0 },
  { key: 'prospectorClaim', name: "Prospector's Claim", desc: 'Mine rocks for gold nuggets.', cost: 0 },
  { key: 'treasurePuzzle', name: 'Treasure Map Puzzle', desc: 'Solve a 3x3 sliding puzzle for reward.', cost: 0 }
];

// ============================================================
// LAUNCH MINIGAME — starts any minigame directly from menu
// ============================================================
function launchMinigame(key) {
  initMinigames();
  var m = game._minigames;
  var p = game.player;

  // Find catalog entry for cost
  var catEntry = null;
  for (var ci = 0; ci < MINIGAME_CATALOG.length; ci++) {
    if (MINIGAME_CATALOG[ci].key === key) { catEntry = MINIGAME_CATALOG[ci]; break; }
  }
  if (catEntry && catEntry.cost > 0) {
    if (game.gold < catEntry.cost) {
      showNotification('Need $' + catEntry.cost + ' to play ' + catEntry.name + '.');
      return false;
    }
    game.gold -= catEntry.cost;
  }

  if (!startMinigame(key)) return false;

  switch (key) {
    case 'trainHeist':
      m.trainHeist = true; m.trainHeistPhase = 0; m.trainHeistTimer = 0;
      m.trainHeistGuards = rand(2, 4); m.trainHeistSafeProgress = 0;
      m.trainHeistLoot = rand(200, 600); m.trainHeistAlarm = false;
      showNotification('TRAIN HEIST! Fight guards, crack the safe, escape!');
      break;
    case 'lassoRodeo':
      m.lassoRodeo = true; m.lassoRodeoPhase = 0; m.lassoRodeoTimer = 3;
      m.lassoRodeoScore = 0; m.lassoRodeoRound = 0; m.lassoRodeoTargets = [];
      m._lassoX = 150; m._lassoY = 90;
      for (var li = 0; li < 5; li++) {
        m.lassoRodeoTargets.push({ x: rand(50, 250), y: rand(40, 140), dx: randF(-2, 2), dy: randF(-1, 1), caught: false, size: rand(8, 16) });
      }
      showNotification('LASSO RODEO! Catch the cattle! WASD + SPACE to lasso.');
      break;
    case 'quickDrawTourney':
      m.quickDrawTourney = true; m.quickDrawRound = 1; m.quickDrawPhase = 0;
      m.quickDrawTimer = rand(2, 5); m.quickDrawWins = 0; m.quickDrawWindow = 600;
      m.quickDrawOpponent = 'Dusty Dan';
      showNotification('QUICK DRAW TOURNAMENT! Round 1 vs Dusty Dan. Wait for DRAW!');
      break;
    case 'cattleDefense':
      m.cattleDefense = true; m.cattleDefenseTimer = 45; m.cattleCount = 10; m.cattleStolenCount = 0;
      m.cattleRustlers = []; m.cattlePositions = []; m._cattleAimX = 150; m._cattleAimY = 90;
      for (var ci2 = 0; ci2 < 10; ci2++) m.cattlePositions.push({ x: rand(60, 240), y: rand(50, 140), alive: true });
      for (var ri = 0; ri < 4; ri++) m.cattleRustlers.push({ x: ri < 2 ? -10 : 310, y: rand(40, 150), hp: 2, target: rand(0, 9), speed: randF(0.8, 1.5), carrying: false });
      showNotification('CATTLE RUSTLERS! Protect the herd! WASD aim, SPACE shoot!');
      break;
    case 'saloonBrawl':
      m.saloonBrawl = true; m.saloonBrawlTimer = 45; m.saloonBrawlHP = 10;
      m.saloonBrawlScore = 0; m.saloonBrawlCombo = 0; m.saloonBrawlEnemies = [];
      m._brawlX = 150; m._brawlY = 90; m._brawlDodge = 0;
      var brawlNames = ['Rowdy Jake', 'Big Mike', 'Dirty Pete', 'Slim Jim', 'Two-Fist Tony', 'Crazy Carl'];
      for (var bei = 0; bei < 4; bei++) m.saloonBrawlEnemies.push({ name: brawlNames[rand(0, brawlNames.length - 1)], hp: 3, x: rand(40, 260), y: rand(40, 140), attackTimer: randF(1, 3), stunTimer: 0 });
      showNotification('SALOON BRAWL! SPACE=punch, Q=dodge, WASD=move.');
      break;
    case 'stagecoachDefense':
      m.stagecoachDefense = true; m.stagecoachTimer = 0; m.stagecoachHP = 100;
      m.stagecoachDistance = 0; m.stagecoachAmmo = 30; m.stagecoachBandits = [];
      m._stageAimX = 150; m._stageAimY = 90;
      showNotification('STAGECOACH DEFENSE! Protect the coach! WASD aim, SPACE shoot!');
      break;
    case 'dynamiteDefusal':
      m.dynamiteDefusal = true; m.dynamiteDefusalTimer = 20; m.dynamitePhase = 0; m.dynamiteScore = 0;
      m.dynamiteWires = []; var colors = ['Red', 'Blue', 'Green', 'Yellow'];
      for (var dwi = 0; dwi < 4; dwi++) m.dynamiteWires.push({ color: colors[dwi], cut: false });
      m.dynamiteCorrectWire = rand(0, 3);
      showNotification('DYNAMITE! Cut the right wire (1-4)! Check the hint!');
      break;
    case 'knifeContest':
      m.knifeContest = true; m.knifeContestPhase = 0; m.knifeContestScore = 0;
      m.knifeContestRound = 0; m.knifeContestAngle = 50; m.knifeContestDir = 1;
      m.knifeContestPower = 0; m.knifeContestTarget = { x: 250, y: 90, radius: 30 };
      showNotification('KNIFE THROWING! SPACE to set angle, SPACE again for power!');
      break;
    case 'horseshoeToss':
      m.horseshoeToss = true; m.horseshoePhase = 0; m.horseshoeScore = 0;
      m.horseshoeRound = 0; m.horseshoeAngle = 50; m.horseshoeAngleDir = 1;
      m.horseshoeFlying = false; m.horseshoePower = 0;
      showNotification('HORSESHOE TOSS! SPACE to set angle, then power!');
      break;
    case 'sharpshootContest':
      m.sharpshootContest = true; m.sharpshootTimer = 30; m.sharpshootScore = 0;
      m.sharpshootMisses = 0; m.sharpshootTargets = [];
      m._sharpAimX = 150; m._sharpAimY = 90;
      for (var sti = 0; sti < 3; sti++) m.sharpshootTargets.push({ x: rand(40, 260), y: rand(30, 140), size: rand(10, 20), dx: randF(-1.5, 1.5), dy: randF(-0.5, 0.5), hp: 1 });
      showNotification('SHARPSHOOTING! Hit targets! WASD aim, SPACE shoot!');
      break;
    case 'hideoutRaid':
      m.hideoutRaid = true; m.hideoutRoom = 0; m.hideoutPlayerX = 30; m.hideoutPlayerY = 90;
      m.hideoutHP = 10; m.hideoutLoot = 0; m.hideoutEnemies = [];
      for (var hei = 0; hei < 3; hei++) m.hideoutEnemies.push({ x: rand(150, 280), y: rand(30, 150), hp: 2, attackTimer: randF(1, 3) });
      showNotification('HIDEOUT RAID! Clear 5 rooms! WASD move, SPACE shoot, E advance.');
      break;
    case 'rodeoBronco':
      m.rodeoBronco = true; m.rodeoBroncoTimer = 0; m.rodeoBroncoBalance = 50;
      m.rodeoBroncoBuckDir = 1; m.rodeoBroncoBuckTimer = 0; m.rodeoBroncoScore = 0;
      showNotification('BRONCO RIDING! Stay on for 8 seconds! A/D to balance!');
      break;
    case 'telegraphDecode':
      m.telegraphDecode = true; m.telegraphTimer = 30; m.telegraphRound = 0; m.telegraphScore = 0;
      var words = ['OUTLAW', 'AMBUSH', 'GOLD', 'WANTED', 'BANDIT', 'HEIST', 'POSSE', 'REWARD', 'DEPUTY', 'DANGER'];
      m.telegraphMessage = words[rand(0, words.length - 1)]; m.telegraphInput = '';
      showNotification('TELEGRAPH! Type the word: ' + m.telegraphMessage);
      break;
    case 'vaultCrack':
      m.vaultCrack = true; m.vaultPhase = 0; m.vaultDials = [0, 0, 0];
      m.vaultTargets = [rand(10, 90), rand(10, 90), rand(10, 90)]; m.vaultCurrentDial = 0; m.vaultTimer = 30;
      showNotification('VAULT CRACKING! A/D to turn dial, SPACE to lock tumblers.');
      break;
    case 'townDefense':
      m.townDefense = true; m.townDefenseWave = 1; m.townDefenseTimer = 0;
      m.townDefenseHP = 100; m.townDefenseKills = 0; m.townDefenseEnemies = [];
      m._townAimX = 150; m._townAimY = 90;
      for (var tdi = 0; tdi < 5; tdi++) m.townDefenseEnemies.push({ x: Math.random() < 0.5 ? -10 : 310, y: rand(20, 160), hp: 2, speed: randF(0.5, 1.5), attackTimer: randF(2, 4) });
      showNotification('TOWN UNDER ATTACK! Defend! 3 waves! WASD aim, SPACE shoot!');
      break;
    case 'posterMatch':
      m.posterMatch = true; m.posterMatchTimer = 60; m.posterMatchMatched = 0;
      m.posterMatchMoves = 0; m.posterMatchFlipped = []; m._posterSelected = -1; m._posterCursor = 0;
      var faces = ['Bandit', 'Outlaw', 'Rustler', 'Gunman', 'Thief', 'Rogue', 'Killer', 'Crook'];
      var cards = [];
      for (var fi = 0; fi < faces.length; fi++) { cards.push(faces[fi]); cards.push(faces[fi]); }
      for (var shi = cards.length - 1; shi > 0; shi--) { var sj = rand(0, shi); var tmp = cards[shi]; cards[shi] = cards[sj]; cards[sj] = tmp; }
      m.posterMatchCards = [];
      for (var pci = 0; pci < 16; pci++) m.posterMatchCards.push({ name: cards[pci], revealed: false, matched: false });
      showNotification('POSTER MATCH! Find pairs! WASD move, SPACE flip. 4x4 grid.');
      break;
    case 'supplyRun':
      m.supplyRun = true; m.supplyRunTimer = 0; m.supplyRunDistance = 0;
      m.supplyRunLane = 1; m.supplyRunHP = 3; m.supplyRunScore = 0; m.supplyRunObstacles = [];
      showNotification('SUPPLY RUN! W/S change lanes, avoid obstacles!');
      break;
    case 'snakeRoundup':
      m.snakeRoundup = true; m.snakeRoundupTimer = 30; m.snakeRoundupCaught = 0;
      m.snakeRoundupBitten = 0; m.snakeRoundupPlayerX = 150; m.snakeRoundupPlayerY = 90;
      m.snakeRoundupSnakes = [];
      for (var sni = 0; sni < 8; sni++) m.snakeRoundupSnakes.push({ x: rand(30, 270), y: rand(30, 150), dx: randF(-2, 2), dy: randF(-2, 2), caught: false, strikeTimer: randF(2, 5) });
      showNotification('RATTLESNAKE ROUNDUP! WASD move, SPACE catch!');
      break;
    case 'goldAuction':
      m.goldAuction = true; m.goldAuctionCurrent = 0; m.goldAuctionWon = [];
      m.goldAuctionItems = [
        { name: 'Gold Mine Deed', value: rand(200, 500), bid: rand(50, 100) },
        { name: 'Stallion Horse', value: rand(100, 300), bid: rand(30, 80) },
        { name: 'Map to Outlaw Cache', value: rand(150, 400), bid: rand(40, 90) },
        { name: 'Silver Pocket Watch', value: rand(50, 150), bid: rand(20, 50) },
        { name: 'Crate of Dynamite', value: rand(80, 200), bid: rand(25, 60) }
      ];
      m.goldAuctionBid = m.goldAuctionItems[0].bid; m.goldAuctionTimer = 10;
      showNotification('AUCTION! D=bid up, SPACE=buy, S=pass.');
      break;
    case 'moonshineBust':
      m.moonshineBust = true; m.moonshineTimer = 60; m.moonshineFound = false;
      m.moonshineSearched = []; m.moonshineLocations = [];
      var locNames = ['Behind Saloon', 'Under Church', 'Old Barn', 'Mine Entrance', 'Hotel Cellar', 'Stable Loft'];
      var stillLoc = rand(0, 5);
      for (var mli = 0; mli < 6; mli++) m.moonshineLocations.push({ name: locNames[mli], hasStill: mli === stillLoc, searched: false });
      showNotification('MOONSHINE BUST! Search locations (1-6). Find the still!');
      break;
    case 'prospectorClaim':
      m.prospectorClaim = true; m.prospectorTimer = 40; m.prospectorGold = 0;
      m.prospectorDepth = 0; m.prospectorRocks = []; m.prospectorTool = 0;
      m._prospectX = 150; m._prospectY = 90;
      for (var pri = 0; pri < 12; pri++) m.prospectorRocks.push({ x: rand(30, 270), y: rand(30, 150), hasGold: Math.random() < 0.3, goldAmount: rand(10, 50), mined: false });
      showNotification("PROSPECTOR'S CLAIM! WASD move, SPACE mine, 1=Pickaxe 2=Dynamite.");
      break;
    case 'pokerTourney':
      m.pokerTourney = true; m.pokerTourneyRound = 1; m.pokerTourneyChips = 500;
      m.pokerTourneyPhase = 0; m.pokerTourneyPot = 100; m.pokerTourneyHeld = [];
      m.pokerTourneyChips -= 50;
      var deck = newDeck();
      m.pokerTourneyHand = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
      m.pokerTourneyDealer = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
      showNotification('POKER TOURNAMENT! 1-5 hold, SPACE draw, D raise.');
      break;
    case 'highNoonStandoff':
      m.highNoonStandoff = true; m.highNoonPhase = 0; m.highNoonTimer = 3;
      m.highNoonShots = 6; m.highNoonScore = 0; m.highNoonEnemies = []; m.highNoonPlayerAngle = 0;
      var standoffNames = ['Snake Eyes', 'The Viper', 'Dead-Eye Doug', 'Rattlesnake Rita', 'Tombstone Terry'];
      for (var hni = 0; hni < 4; hni++) {
        var angle = (hni / 4) * Math.PI * 2;
        m.highNoonEnemies.push({ name: standoffNames[rand(0, standoffNames.length - 1)], angle: angle, distance: 120, hp: 1, drawTimer: randF(1, 4), drawing: false });
      }
      showNotification('HIGH NOON STANDOFF! Wait... then A/D aim, SPACE shoot!');
      break;
    case 'wagonRepair':
      m.wagonRepair = true; m.wagonRepairTimer = 25; m.wagonRepairPhase = 0;
      m.wagonRepairProgress = 0; m.wagonRepairTarget = rand(40, 80);
      m.wagonRepairHits = 0; m.wagonRepairScore = 0; m._hammerPos = 0;
      showNotification('WAGON REPAIR! Tap SPACE when hammer hits the green zone!');
      break;
    case 'cattleBranding':
      m.cattleBranding = true; m.cattleBrandingTimer = 30; m.cattleBrandingScore = 0;
      m.cattleBrandingRound = 0; m.cattleBrandingSelected = 0;
      m.cattleBrandingBrands = ['Circle S', 'Double T', 'Bar M', 'Diamond K', 'Lazy R'];
      m.cattleBrandingTarget = rand(0, 4);
      showNotification('CATTLE BRANDING! Target: ' + m.cattleBrandingBrands[m.cattleBrandingTarget] + '. 1-5 pick, SPACE brand.');
      break;
    case 'medicineMan':
      m.medicineMan = true; m.medicineTimer = 45; m.medicineScore = 0; m.medicineCurrentPatient = 0;
      var ailments = ['Fever', 'Snakebite', 'Broken Arm', 'Cough', 'Headache', 'Stomachache'];
      m.medicinePatients = []; m.medicineItems = ['Willow Bark', 'Anti-venom', 'Splint', 'Honey Tea', 'Cool Cloth', 'Ginger Root'];
      for (var mpi = 0; mpi < 5; mpi++) { var aidx = rand(0, ailments.length - 1); m.medicinePatients.push({ ailment: ailments[aidx], remedy: aidx, treated: false }); }
      showNotification('MEDICINE MAN! Patient: ' + m.medicinePatients[0].ailment + '. Pick remedy 1-6!');
      break;
    case 'jailEscape':
      m.jailEscape = true; m.jailEscapeTimer = 45; m.jailEscapeBlocked = 0;
      m.jailEscapeEscaped = 0; m.jailEscapePlayerX = 150; m.jailEscapePlayerY = 90;
      m.jailEscapePrisoners = [];
      for (var jpi = 0; jpi < 5; jpi++) m.jailEscapePrisoners.push({ x: rand(20, 280), y: rand(20, 40), speed: randF(1, 2.5), escaped: false, blocked: false });
      showNotification('JAIL BREAK! WASD move, SPACE to block prisoners!');
      break;
    case 'cardSlinger':
      m.cardSlinger = true; m.cardSlingerRound = 1; m.cardSlingerWins = 0;
      m.cardSlingerBet = 25; m.cardSlingerPhase = 0;
      m._bjDeck = newDeck();
      m.cardSlingerHand = [m._bjDeck.pop(), m._bjDeck.pop()];
      m.cardSlingerDealer = [m._bjDeck.pop(), m._bjDeck.pop()];
      showNotification('BLACKJACK! Hand: ' + handValue(m.cardSlingerHand) + '. 1=Hit, 2=Stand, 3=Double.');
      break;
    case 'sundownShootout':
      m.sundownShootout = true; m.sundownPhase = 0; m.sundownTimer = 2;
      m.sundownAmmo = 12; m.sundownScore = 0; m.sundownWave = 1; m.sundownEnemies = [];
      m._sunAimX = 150; m._sunAimY = 90;
      for (var sdi = 0; sdi < 4; sdi++) m.sundownEnemies.push({ x: Math.random() < 0.5 ? rand(-10, 20) : rand(280, 310), y: rand(30, 150), hp: 2, speed: randF(0.5, 1.5), attackTimer: randF(2, 4) });
      showNotification('SUNDOWN SHOOTOUT! 3 waves! WASD aim, SPACE shoot!');
      break;
    case 'treasurePuzzle':
      m.treasurePuzzle = true; m.treasurePuzzleMoves = 0; m.treasurePuzzleTimer = 60;
      m.treasurePuzzleSolved = false; m.treasurePuzzleReward = rand(100, 400);
      m.treasurePuzzleGrid = [1,2,3,4,5,6,7,8,0];
      for (var pzi = 0; pzi < 30; pzi++) {
        var emptyIdx = m.treasurePuzzleGrid.indexOf(0);
        var row = Math.floor(emptyIdx / 3), col = emptyIdx % 3;
        var moves = [];
        if (row > 0) moves.push(emptyIdx - 3); if (row < 2) moves.push(emptyIdx + 3);
        if (col > 0) moves.push(emptyIdx - 1); if (col < 2) moves.push(emptyIdx + 1);
        var swapIdx = moves[rand(0, moves.length - 1)];
        m.treasurePuzzleGrid[emptyIdx] = m.treasurePuzzleGrid[swapIdx]; m.treasurePuzzleGrid[swapIdx] = 0;
      }
      showNotification('TREASURE MAP PUZZLE! WASD slide tiles. Prize: $' + m.treasurePuzzleReward);
      break;
    default:
      showNotification('Unknown minigame: ' + key);
      endMinigame(key, false, 0);
      return false;
  }
  addJournalEntry('Started minigame: ' + key);
  return true;
}

function openMinigameMenu() {
  initMinigames();
  if (game._minigames.activeMinigame) return;
  game._minigameMenuOpen = true;
  game._minigameMenuScroll = 0;
  game._minigameMenuCursor = 0;
  game.state = 'minigame';
}

function closeMinigameMenu() {
  game._minigameMenuOpen = false;
  if (!game._minigames || !game._minigames.activeMinigame) {
    game.state = 'playing';
  }
}

function updateMinigameMenu() {
  if (!game._minigameMenuOpen) return;

  // Scroll
  if (consumeKey('KeyW') || consumeKey('ArrowUp')) {
    game._minigameMenuCursor = Math.max(0, game._minigameMenuCursor - 1);
  }
  if (consumeKey('KeyS') || consumeKey('ArrowDown')) {
    game._minigameMenuCursor = Math.min(MINIGAME_CATALOG.length - 1, game._minigameMenuCursor + 1);
  }

  // Keep cursor in visible scroll window
  if (game._minigameMenuCursor < game._minigameMenuScroll) game._minigameMenuScroll = game._minigameMenuCursor;
  if (game._minigameMenuCursor >= game._minigameMenuScroll + 12) game._minigameMenuScroll = game._minigameMenuCursor - 11;

  // Select — launch the minigame directly
  if (consumeKey('Space') || consumeKey('Enter') || consumeKey('KeyE')) {
    var item = MINIGAME_CATALOG[game._minigameMenuCursor];
    var m2 = game._minigames;
    if (m2.minigameCooldowns[item.key] && m2.minigameCooldowns[item.key] > 0) {
      showNotification(item.name + ' is on cooldown. Try again later.');
    } else {
      closeMinigameMenu();
      launchMinigame(item.key);
    }
  }

  // Close
  if (consumeKey('Escape') || consumeKey('KeyM')) {
    closeMinigameMenu();
  }
}

function renderMinigameMenu() {
  if (!game._minigameMenuOpen) return;
  var w = gameCanvas.width, h = gameCanvas.height;

  // Full overlay
  ctx.fillStyle = 'rgba(10, 6, 2, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MINIGAMES & ACTIVITIES', w / 2, 30);
  ctx.font = '9px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('W/S: Navigate | SPACE: Select | M/ESC: Close', w / 2, 46);

  // Stats
  initMinigames();
  var m = game._minigames;
  ctx.fillStyle = '#888';
  ctx.fillText('Played: ' + m.totalMinigamesPlayed + ' | Won: ' + m.totalMinigamesWon, w / 2, 60);

  // List
  var startY = 75;
  var lineH = 18;
  var visible = Math.min(12, MINIGAME_CATALOG.length);
  var scroll = game._minigameMenuScroll || 0;

  for (var i = 0; i < visible; i++) {
    var idx = scroll + i;
    if (idx >= MINIGAME_CATALOG.length) break;
    var item = MINIGAME_CATALOG[idx];
    var y = startY + i * lineH;
    var selected = idx === game._minigameMenuCursor;

    // Highlight
    if (selected) {
      ctx.fillStyle = 'rgba(139, 105, 20, 0.4)';
      ctx.fillRect(20, y - 11, w - 40, lineH);
    }

    // Cooldown check
    var onCooldown = m.minigameCooldowns[item.key] && m.minigameCooldowns[item.key] > 0;

    // Name
    ctx.textAlign = 'left';
    ctx.font = selected ? 'bold 10px monospace' : '10px monospace';
    ctx.fillStyle = onCooldown ? '#666' : '#ffd700';
    ctx.fillText((selected ? '> ' : '  ') + item.name, 30, y);

    // Cost and status
    ctx.textAlign = 'right';
    ctx.font = '9px monospace';
    if (onCooldown) {
      ctx.fillStyle = '#884444';
      ctx.fillText('COOLDOWN', w - 30, y);
    } else if (item.cost > 0) {
      ctx.fillStyle = '#cc8833';
      ctx.fillText('$' + item.cost, w - 30, y);
    } else {
      ctx.fillStyle = '#44aa44';
      ctx.fillText('FREE', w - 30, y);
    }
  }

  // Scroll indicators
  ctx.textAlign = 'center';
  ctx.fillStyle = '#665533';
  if (scroll > 0) ctx.fillText('^ more ^', w / 2, startY - 5);
  if (scroll + visible < MINIGAME_CATALOG.length) ctx.fillText('v more v', w / 2, startY + visible * lineH + 5);

  // Selected item description
  var sel = MINIGAME_CATALOG[game._minigameMenuCursor];
  if (sel) {
    var descY = startY + visible * lineH + 22;
    ctx.fillStyle = 'rgba(30, 20, 8, 0.9)';
    ctx.fillRect(20, descY - 12, w - 40, 40);
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, descY - 12, w - 40, 40);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(sel.name, w / 2, descY + 2);
    ctx.fillStyle = '#c8b888';
    ctx.font = '9px monospace';
    ctx.fillText(sel.desc, w / 2, descY + 16);
    ctx.fillStyle = '#aa8855';
    ctx.fillText(sel.cost > 0 ? 'Entry fee: $' + sel.cost : 'Free to play', w / 2, descY + 28);
  }

  ctx.textAlign = 'left';
}

// ============================================================
// CARD HELPERS
// ============================================================
var CARD_SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
var CARD_RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
function newDeck() {
  var deck = [];
  for (var s = 0; s < 4; s++) for (var r = 0; r < 13; r++) deck.push({ suit: CARD_SUITS[s], rank: CARD_RANKS[r], value: Math.min(r + 2, 10) });
  // Aces = 11
  for (var i = 0; i < deck.length; i++) if (deck[i].rank === 'A') deck[i].value = 11;
  // Face cards = 10
  for (var j = 0; j < deck.length; j++) if ('JQK'.indexOf(deck[j].rank) >= 0) deck[j].value = 10;
  // Shuffle
  for (var k = deck.length - 1; k > 0; k--) { var ri = rand(0, k); var tmp = deck[k]; deck[k] = deck[ri]; deck[ri] = tmp; }
  return deck;
}
function handValue(hand) {
  var total = 0, aces = 0;
  for (var i = 0; i < hand.length; i++) { total += hand[i].value; if (hand[i].rank === 'A') aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

// ============================================================
// UPDATE MINIGAMES (called every frame from features)
// ============================================================
function updateMinigames(dt) {
  initMinigames();
  if (game.state !== 'playing' && game.state !== 'dialog' && game.state !== 'minigame') return;
  var m = game._minigames;
  var p = game.player;

  // Handle minigame menu
  if (game._minigameMenuOpen) {
    updateMinigameMenu();
    return;
  }

  // Update cooldowns
  for (var cd in m.minigameCooldowns) {
    if (m.minigameCooldowns[cd] > 0) m.minigameCooldowns[cd] -= dt;
  }

  // ════════════════════════════════════════
  // 1. TRAIN ROBBERY HEIST
  // ════════════════════════════════════════
  // Trigger: press T near a stopped train
  if (!m.trainHeist && game.train && game.train.state === 'stopped' && !game.train.robbed && m.trainHeistCooldown <= 0) {
    var nearT = Math.abs(p.y - game.train.y) < 50 && p.x > game.train.x - 20 && p.x < game.train.x + (game.train.cars + 1) * 80 + 20;
    if (nearT && consumeKey('KeyT')) {
      if (startMinigame('trainHeist')) {
        m.trainHeist = true;
        m.trainHeistPhase = 0;
        m.trainHeistTimer = 0;
        m.trainHeistGuards = rand(2, 4);
        m.trainHeistSafeProgress = 0;
        m.trainHeistLoot = game.train.lootGold || rand(200, 600);
        m.trainHeistAlarm = false;
        showNotification('TRAIN HEIST! Fight guards, crack the safe, escape!');
        addJournalEntry('Attempting a train robbery heist...');
      }
    }
  }
  if (m.trainHeist) {
    m.trainHeistTimer += dt;
    if (m.trainHeistPhase === 0) {
      // Phase 0: Fight guards — mash SPACE to defeat them
      if (consumeKey('Space')) {
        m.trainHeistGuards -= (1 + Math.random() * 0.5);
        if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
      }
      // Guards fight back
      if (Math.random() < 0.02) {
        if (!game._cheatMode) p.hp -= 1;
        showNotification('Guard hits you! -1 HP');
      }
      if (m.trainHeistGuards <= 0) {
        m.trainHeistPhase = 1;
        m.trainHeistTimer = 0;
        showNotification('Guards down! Crack the safe — tap SPACE rhythmically!');
      }
    } else if (m.trainHeistPhase === 1) {
      // Phase 1: Crack safe — tap SPACE with timing
      if (consumeKey('Space')) {
        // Good timing bonus — sinusoidal sweet spot
        var sweetSpot = Math.abs(Math.sin(m.trainHeistTimer * 3));
        if (sweetSpot > 0.7) {
          m.trainHeistSafeProgress += 20;
          showNotification('Click! (' + Math.min(100, Math.floor(m.trainHeistSafeProgress)) + '%)');
        } else {
          m.trainHeistSafeProgress += 5;
          m.trainHeistAlarm = m.trainHeistAlarm || Math.random() < 0.3;
        }
      }
      if (m.trainHeistAlarm && Math.random() < 0.01) {
        if (!game._cheatMode) p.hp -= 1;
        showNotification('Alarm reinforcements! -1 HP');
      }
      if (m.trainHeistSafeProgress >= 100) {
        m.trainHeistPhase = 2;
        m.trainHeistTimer = 0;
        showNotification('Safe cracked! Grab the loot and press E to escape!');
      }
      if (m.trainHeistTimer > 30) {
        // Timeout
        endMinigame('trainHeist', false, 60);
        game.reputation = clamp(game.reputation - 10, 0, REPUTATION_MAX);
        game.corruption = clamp((game.corruption || 0) + 5, 0, 100);
        showNotification('Train heist failed! Ran out of time. -10 Rep');
        return;
      }
    } else if (m.trainHeistPhase === 2) {
      // Phase 2: Escape — press E
      if (consumeKey('KeyE')) {
        game.gold += m.trainHeistLoot;
        game.totalGoldEarned += m.trainHeistLoot;
        game.corruption = clamp((game.corruption || 0) + 20, 0, 100);
        game.reputation = clamp(game.reputation - 25, 0, REPUTATION_MAX);
        if (game.train) { game.train.robbed = true; game.train.state = 'departing'; game.train.speed = 20; }
        showNotification('HEIST COMPLETE! Stole $' + m.trainHeistLoot + '! +20 Corruption');
        addJournalEntry('Successfully robbed train for $' + m.trainHeistLoot);
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        endMinigame('trainHeist', true, 120);
        m.trainHeistCooldown = 120;
        // Spawn pursuers
        for (var gi = 0; gi < 2; gi++) {
          var guard = createNPC(game.npcs.length, NPC_TYPES.OUTLAW, 'Pinkerton Agent', Math.floor(p.x / TILE) + gi * 3, Math.floor(p.y / TILE), null);
          guard.hostile = true; guard.hp = 6; guard.maxHp = 6; game.npcs.push(guard);
        }
      }
      if (m.trainHeistTimer > 10) {
        endMinigame('trainHeist', false, 60);
        showNotification('Too slow! The train departed without you getting the loot.');
      }
    }
    if (consumeKey('Escape') && m.trainHeist) {
      endMinigame('trainHeist', false, 30);
      showNotification('Abandoned the train heist.');
    }
  }

  // ════════════════════════════════════════
  // 2. LASSO RODEO
  // ════════════════════════════════════════
  // Trigger: near stable, press L
  if (m.lassoRodeo) {
    if (m.lassoRodeoPhase === 0) {
      m.lassoRodeoTimer -= dt;
      if (m.lassoRodeoTimer <= 0) {
        m.lassoRodeoPhase = 1;
        m.lassoRodeoTimer = 30;
      }
    } else if (m.lassoRodeoPhase === 1) {
      m.lassoRodeoTimer -= dt;
      // Move targets
      for (var lti = 0; lti < m.lassoRodeoTargets.length; lti++) {
        var lt = m.lassoRodeoTargets[lti];
        if (lt.caught) continue;
        lt.x += lt.dx;
        lt.y += lt.dy;
        if (lt.x < 20 || lt.x > 280) lt.dx = -lt.dx;
        if (lt.y < 20 || lt.y > 160) lt.dy = -lt.dy;
        lt.dx += randF(-0.3, 0.3);
        lt.dy += randF(-0.2, 0.2);
        lt.dx = clamp(lt.dx, -3, 3);
        lt.dy = clamp(lt.dy, -2, 2);
      }
      // Player cursor follows mouse-like WASD control
      m._lassoX = m._lassoX || 150;
      m._lassoY = m._lassoY || 90;
      if (keys['KeyW'] || keys['ArrowUp']) m._lassoY -= 3;
      if (keys['KeyS'] || keys['ArrowDown']) m._lassoY += 3;
      if (keys['KeyA'] || keys['ArrowLeft']) m._lassoX -= 3;
      if (keys['KeyD'] || keys['ArrowRight']) m._lassoX += 3;
      m._lassoX = clamp(m._lassoX, 10, 290);
      m._lassoY = clamp(m._lassoY, 10, 170);
      // Space to throw lasso
      if (consumeKey('Space')) {
        var lassoed = false;
        for (var lci = 0; lci < m.lassoRodeoTargets.length; lci++) {
          var lc = m.lassoRodeoTargets[lci];
          if (!lc.caught && Math.hypot(m._lassoX - lc.x, m._lassoY - lc.y) < lc.size + 15) {
            lc.caught = true;
            m.lassoRodeoScore++;
            lassoed = true;
            showNotification('Lassoed! (' + m.lassoRodeoScore + '/5)');
            if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
            break;
          }
        }
        if (!lassoed) {
          showNotification('Missed!');
        }
      }
      // Check all caught
      var allCaught = true;
      for (var aci = 0; aci < m.lassoRodeoTargets.length; aci++) {
        if (!m.lassoRodeoTargets[aci].caught) allCaught = false;
      }
      if (allCaught || m.lassoRodeoTimer <= 0) {
        var rodeoReward = m.lassoRodeoScore * 30;
        game.gold += rodeoReward;
        game.totalGoldEarned += rodeoReward;
        if (m.lassoRodeoScore >= 4) game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
        showNotification('Rodeo over! Caught ' + m.lassoRodeoScore + '/5! +$' + rodeoReward);
        endMinigame('lassoRodeo', m.lassoRodeoScore >= 3, 90);
      }
    }
    if (consumeKey('Escape') && m.lassoRodeo) {
      endMinigame('lassoRodeo', false, 30);
      showNotification('Left the rodeo.');
    }
  }

  // ════════════════════════════════════════
  // 3. QUICK DRAW TOURNAMENT
  // ════════════════════════════════════════
  // Trigger: near gallows/wanted board, press U
  if (m.quickDrawTourney) {
    if (m.quickDrawPhase === 0) {
      // Staredown — wait
      m.quickDrawTimer -= dt;
      if (consumeKey('Space')) {
        // Early draw = disqualified
        showNotification('Drew too early! Disqualified! -5 Rep');
        game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
        endMinigame('quickDrawTourney', false, 60);
        return;
      }
      if (m.quickDrawTimer <= 0) {
        m.quickDrawPhase = 1;
        m.quickDrawTimer = 0;
        m.quickDrawWindow = Math.max(200, 600 - m.quickDrawRound * 80);
        showNotification('DRAW!!!');
        if (typeof audio !== 'undefined' && audio.playDuelDraw) audio.playDuelDraw();
      }
    } else if (m.quickDrawPhase === 1) {
      m.quickDrawTimer += dt * 1000;
      if (consumeKey('Space')) {
        if (m.quickDrawTimer < m.quickDrawWindow) {
          // Win this round
          m.quickDrawWins++;
          if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
          showNotification('You drew faster! Round ' + m.quickDrawRound + ' won! (' + Math.floor(m.quickDrawTimer) + 'ms)');
          m.quickDrawPhase = 2;
          m.quickDrawTimer = 2;
        } else {
          showNotification('Too slow! You were shot! -2 HP');
          if (!game._cheatMode) p.hp -= 2;
          m.quickDrawPhase = 2;
          m.quickDrawTimer = 2;
        }
      }
      if (m.quickDrawTimer > m.quickDrawWindow + 200) {
        showNotification('Too slow! Shot by ' + m.quickDrawOpponent + '! -2 HP');
        if (!game._cheatMode) p.hp -= 2;
        m.quickDrawPhase = 2;
        m.quickDrawTimer = 2;
      }
    } else if (m.quickDrawPhase === 2) {
      m.quickDrawTimer -= dt;
      if (m.quickDrawTimer <= 0) {
        m.quickDrawRound++;
        if (m.quickDrawRound > 5) {
          // Tournament over
          var prize = m.quickDrawWins * 80;
          game.gold += prize;
          game.totalGoldEarned += prize;
          if (m.quickDrawWins >= 4) game.reputation = clamp(game.reputation + 10, 0, REPUTATION_MAX);
          showNotification('Tournament over! Won ' + m.quickDrawWins + '/5 rounds! +$' + prize);
          if (m.quickDrawWins >= 4 && typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
          endMinigame('quickDrawTourney', m.quickDrawWins >= 3, 120);
        } else {
          var opponents2 = ['Dusty Dan', 'Quick Pete', 'Lightning Lou', 'Viper Vic', 'The Shadow'];
          m.quickDrawOpponent = opponents2[Math.min(m.quickDrawRound - 1, opponents2.length - 1)];
          m.quickDrawPhase = 0;
          m.quickDrawTimer = rand(2, 5);
          showNotification('Round ' + m.quickDrawRound + ' vs ' + m.quickDrawOpponent + '. Wait for DRAW!');
        }
      }
    }
    if (consumeKey('Escape') && m.quickDrawTourney && m.quickDrawPhase !== 1) {
      endMinigame('quickDrawTourney', false, 30);
      showNotification('Withdrew from tournament.');
    }
  }

  // ════════════════════════════════════════
  // 4. CATTLE RUSTLING DEFENSE
  // ════════════════════════════════════════
  if (m.cattleDefense) {
    m.cattleDefenseTimer -= dt;
    // Player aims with WASD
    m._cattleAimX = m._cattleAimX || 150;
    m._cattleAimY = m._cattleAimY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._cattleAimY -= 4;
    if (keys['KeyS'] || keys['ArrowDown']) m._cattleAimY += 4;
    if (keys['KeyA'] || keys['ArrowLeft']) m._cattleAimX -= 4;
    if (keys['KeyD'] || keys['ArrowRight']) m._cattleAimX += 4;
    m._cattleAimX = clamp(m._cattleAimX, 10, 290);
    m._cattleAimY = clamp(m._cattleAimY, 10, 170);
    // Move rustlers toward cattle
    for (var cri = 0; cri < m.cattleRustlers.length; cri++) {
      var cr = m.cattleRustlers[cri];
      if (cr.hp <= 0) continue;
      if (!cr.carrying) {
        var ct = m.cattlePositions[cr.target];
        if (ct && ct.alive) {
          var crdx = ct.x - cr.x, crdy = ct.y - cr.y;
          var crlen = Math.hypot(crdx, crdy) || 1;
          cr.x += (crdx / crlen) * cr.speed;
          cr.y += (crdy / crlen) * cr.speed;
          if (crlen < 12) { ct.alive = false; cr.carrying = true; m.cattleStolenCount++; }
        } else {
          // Find new target
          for (var nti = 0; nti < m.cattlePositions.length; nti++) {
            if (m.cattlePositions[nti].alive) { cr.target = nti; break; }
          }
        }
      } else {
        // Run away with cattle
        cr.x += cr.x < 150 ? -cr.speed * 1.5 : cr.speed * 1.5;
      }
    }
    // Shoot
    if (consumeKey('Space')) {
      for (var sci = 0; sci < m.cattleRustlers.length; sci++) {
        var sc = m.cattleRustlers[sci];
        if (sc.hp > 0 && Math.hypot(m._cattleAimX - sc.x, m._cattleAimY - sc.y) < 20) {
          sc.hp--;
          if (sc.hp <= 0) {
            showNotification('Rustler down!');
            if (sc.carrying) { m.cattleStolenCount--; }
            if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
          }
          break;
        }
      }
    }
    // End conditions
    var rustlersAlive = 0;
    for (var rai = 0; rai < m.cattleRustlers.length; rai++) if (m.cattleRustlers[rai].hp > 0) rustlersAlive++;
    if (rustlersAlive === 0 || m.cattleDefenseTimer <= 0) {
      var saved = m.cattleCount - m.cattleStolenCount;
      var cattleReward = saved * 15;
      game.gold += cattleReward;
      game.totalGoldEarned += cattleReward;
      if (saved >= 7) game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
      showNotification('Cattle defense over! Saved ' + saved + '/' + m.cattleCount + '! +$' + cattleReward);
      endMinigame('cattleDefense', saved >= 5, 180);
    }
    if (consumeKey('Escape') && m.cattleDefense) {
      endMinigame('cattleDefense', false, 60);
      showNotification('Abandoned the cattle.');
    }
  }

  // ════════════════════════════════════════
  // 5. SALOON BRAWL
  // ════════════════════════════════════════
  if (m.saloonBrawl) {
    m.saloonBrawlTimer -= dt;
    // Player movement
    m._brawlX = m._brawlX || 150;
    m._brawlY = m._brawlY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._brawlY -= 3;
    if (keys['KeyS'] || keys['ArrowDown']) m._brawlY += 3;
    if (keys['KeyA'] || keys['ArrowLeft']) m._brawlX -= 3;
    if (keys['KeyD'] || keys['ArrowRight']) m._brawlX += 3;
    m._brawlX = clamp(m._brawlX, 20, 280);
    m._brawlY = clamp(m._brawlY, 20, 160);
    m._brawlDodge = (m._brawlDodge || 0) - dt;
    // Dodge
    if (consumeKey('KeyQ') && m._brawlDodge <= 0) {
      m._brawlDodge = 1.5;
      showNotification('Dodge!');
    }
    // Punch
    if (consumeKey('Space')) {
      var punched = false;
      for (var pei = 0; pei < m.saloonBrawlEnemies.length; pei++) {
        var pe = m.saloonBrawlEnemies[pei];
        if (pe.hp > 0 && pe.stunTimer <= 0 && Math.hypot(m._brawlX - pe.x, m._brawlY - pe.y) < 30) {
          pe.hp--;
          pe.stunTimer = 0.5;
          m.saloonBrawlCombo++;
          punched = true;
          if (pe.hp <= 0) {
            m.saloonBrawlScore += 10 * m.saloonBrawlCombo;
            showNotification(pe.name + ' KO! Combo x' + m.saloonBrawlCombo);
          }
          break;
        }
      }
      if (!punched) m.saloonBrawlCombo = 0;
    }
    // Enemy AI
    for (var eai = 0; eai < m.saloonBrawlEnemies.length; eai++) {
      var ea = m.saloonBrawlEnemies[eai];
      if (ea.hp <= 0) continue;
      if (ea.stunTimer > 0) { ea.stunTimer -= dt; continue; }
      // Move toward player
      var edx = m._brawlX - ea.x, edy = m._brawlY - ea.y;
      var elen = Math.hypot(edx, edy) || 1;
      ea.x += (edx / elen) * 1.2;
      ea.y += (edy / elen) * 1.2;
      ea.attackTimer -= dt;
      if (ea.attackTimer <= 0 && elen < 35) {
        ea.attackTimer = randF(1, 2.5);
        if (m._brawlDodge <= 0) {
          m.saloonBrawlHP--;
          m.saloonBrawlCombo = 0;
          showNotification('Punched by ' + ea.name + '! HP: ' + m.saloonBrawlHP);
        }
      }
    }
    // End conditions
    var brawlersAlive = 0;
    for (var bai = 0; bai < m.saloonBrawlEnemies.length; bai++) if (m.saloonBrawlEnemies[bai].hp > 0) brawlersAlive++;
    if (brawlersAlive === 0 || m.saloonBrawlHP <= 0 || m.saloonBrawlTimer <= 0) {
      var brawlReward = m.saloonBrawlScore + (brawlersAlive === 0 ? 50 : 0);
      game.gold += brawlReward;
      game.totalGoldEarned += brawlReward;
      if (brawlersAlive === 0) {
        game.reputation = clamp(game.reputation + 3, 0, REPUTATION_MAX);
        showNotification('BRAWL WON! +$' + brawlReward);
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
      } else {
        showNotification('Brawl over. Score: ' + m.saloonBrawlScore);
      }
      endMinigame('saloonBrawl', brawlersAlive === 0, 60);
    }
    if (consumeKey('Escape') && m.saloonBrawl) {
      endMinigame('saloonBrawl', false, 30);
      showNotification('Fled the brawl.');
    }
  }

  // ════════════════════════════════════════
  // 6. STAGECOACH DEFENSE
  // ════════════════════════════════════════
  if (m.stagecoachDefense) {
    m.stagecoachTimer += dt;
    m.stagecoachDistance += dt * 20;
    // Spawn bandits
    if (Math.random() < 0.04 && m.stagecoachBandits.length < 6) {
      var side = Math.random() < 0.5 ? 0 : 300;
      m.stagecoachBandits.push({
        x: side, y: rand(30, 150), hp: 2, attackTimer: randF(1.5, 3),
        speed: randF(1, 2.5)
      });
    }
    // Aim
    m._stageAimX = m._stageAimX || 150;
    m._stageAimY = m._stageAimY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._stageAimY -= 4;
    if (keys['KeyS'] || keys['ArrowDown']) m._stageAimY += 4;
    if (keys['KeyA'] || keys['ArrowLeft']) m._stageAimX -= 4;
    if (keys['KeyD'] || keys['ArrowRight']) m._stageAimX += 4;
    m._stageAimX = clamp(m._stageAimX, 10, 290);
    m._stageAimY = clamp(m._stageAimY, 10, 170);
    // Shoot
    if (consumeKey('Space') && m.stagecoachAmmo > 0) {
      m.stagecoachAmmo--;
      for (var sbi2 = 0; sbi2 < m.stagecoachBandits.length; sbi2++) {
        var sb = m.stagecoachBandits[sbi2];
        if (sb.hp > 0 && Math.hypot(m._stageAimX - sb.x, m._stageAimY - sb.y) < 22) {
          sb.hp--;
          if (sb.hp <= 0) showNotification('Bandit down!');
          if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
          break;
        }
      }
    }
    // Bandit AI
    var sbWrite = 0;
    for (var sbi3 = 0; sbi3 < m.stagecoachBandits.length; sbi3++) {
      var sb2 = m.stagecoachBandits[sbi3];
      if (sb2.hp <= 0) continue;
      m.stagecoachBandits[sbWrite++] = sb2;
      // Move toward center
      sb2.x += (150 - sb2.x) * 0.01 * sb2.speed;
      sb2.attackTimer -= dt;
      if (sb2.attackTimer <= 0) {
        sb2.attackTimer = randF(1.5, 3);
        m.stagecoachHP -= rand(5, 12);
      }
    }
    m.stagecoachBandits.length = sbWrite;
    // End
    if (m.stagecoachDistance >= 500 || m.stagecoachHP <= 0) {
      if (m.stagecoachHP > 0) {
        var stageReward = 150 + Math.floor(m.stagecoachHP);
        game.gold += stageReward;
        game.totalGoldEarned += stageReward;
        game.reputation = clamp(game.reputation + 10, 0, REPUTATION_MAX);
        showNotification('Stagecoach delivered safely! +$' + stageReward + ' +10 Rep!');
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
      } else {
        game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
        showNotification('Stagecoach destroyed! -5 Rep');
      }
      endMinigame('stagecoachDefense', m.stagecoachHP > 0, 240);
    }
    if (consumeKey('Escape') && m.stagecoachDefense) {
      endMinigame('stagecoachDefense', false, 60);
      showNotification('Abandoned the stagecoach.');
    }
  }

  // ════════════════════════════════════════
  // 7. DYNAMITE DEFUSAL
  // ════════════════════════════════════════
  if (m.dynamiteDefusal) {
    m.dynamiteDefusalTimer -= dt;
    if (m.dynamiteDefusalTimer <= 0) {
      // BOOM
      if (!game._cheatMode) p.hp -= 3;
      game.reputation = clamp(game.reputation - 10, 0, REPUTATION_MAX);
      showNotification('BOOM! Dynamite exploded! -3 HP, -10 Rep');
      endMinigame('dynamiteDefusal', false, 300);
      return;
    }
    // Cut wire with 1-4
    for (var dwc = 0; dwc < 4; dwc++) {
      if (consumeKey('Digit' + (dwc + 1))) {
        if (dwc === m.dynamiteCorrectWire) {
          game.gold += 75;
          game.totalGoldEarned += 75;
          game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
          showNotification('Correct wire! Dynamite defused! +$75 +8 Rep');
          if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
          endMinigame('dynamiteDefusal', true, 300);
        } else {
          if (!game._cheatMode) p.hp -= 2;
          game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
          showNotification('WRONG WIRE! Explosion! -2 HP, -5 Rep');
          endMinigame('dynamiteDefusal', false, 300);
        }
        return;
      }
    }
    if (consumeKey('Escape')) {
      endMinigame('dynamiteDefusal', false, 120);
      showNotification('Ran away from the dynamite!');
    }
  }

  // ════════════════════════════════════════
  // 8. KNIFE THROWING CONTEST
  // ════════════════════════════════════════
  if (m.knifeContest) {
    if (m.knifeContestPhase === 0) {
      // Angle selection — oscillates
      m.knifeContestAngle += m.knifeContestDir * dt * 80;
      if (m.knifeContestAngle >= 80) m.knifeContestDir = -1;
      if (m.knifeContestAngle <= 20) m.knifeContestDir = 1;
      if (consumeKey('Space')) {
        m.knifeContestPhase = 1;
        m.knifeContestPower = 0;
      }
    } else if (m.knifeContestPhase === 1) {
      // Power selection
      m.knifeContestPower += dt * 120;
      if (m.knifeContestPower > 100) m.knifeContestPower = 0; // wraps
      if (consumeKey('Space')) {
        m.knifeContestPhase = 2;
        // Calculate where knife lands
        var kAngleRad = m.knifeContestAngle * Math.PI / 180;
        var kPow = m.knifeContestPower / 100;
        var landX = 50 + Math.cos(kAngleRad) * kPow * 220;
        var landY = 160 - Math.sin(kAngleRad) * kPow * 160;
        var distToTarget = Math.hypot(landX - m.knifeContestTarget.x, landY - m.knifeContestTarget.y);
        if (distToTarget < 10) { m.knifeContestScore += 50; showNotification('BULLSEYE! +50'); }
        else if (distToTarget < 20) { m.knifeContestScore += 30; showNotification('Great shot! +30'); }
        else if (distToTarget < 35) { m.knifeContestScore += 15; showNotification('Hit! +15'); }
        else { showNotification('Miss!'); }
        m.knifeContestRound++;
        m._knifeResultTimer = 1.5;
      }
    } else if (m.knifeContestPhase === 2) {
      m._knifeResultTimer -= dt;
      if (m._knifeResultTimer <= 0) {
        if (m.knifeContestRound >= 5) {
          game.gold += m.knifeContestScore;
          game.totalGoldEarned += m.knifeContestScore;
          showNotification('Knife contest over! Score: ' + m.knifeContestScore + ' +$' + m.knifeContestScore);
          endMinigame('knifeContest', m.knifeContestScore >= 100, 60);
        } else {
          m.knifeContestPhase = 0;
          m.knifeContestAngle = 50;
          m.knifeContestDir = 1;
          showNotification('Round ' + (m.knifeContestRound + 1) + '/5 — SPACE to throw!');
        }
      }
    }
    if (consumeKey('Escape') && m.knifeContest) {
      endMinigame('knifeContest', false, 30);
      showNotification('Left knife throwing.');
    }
  }

  // ════════════════════════════════════════
  // 9. HORSESHOE TOSS
  // ════════════════════════════════════════
  if (m.horseshoeToss) {
    if (m.horseshoePhase === 0 && !m.horseshoeFlying) {
      m.horseshoeAngle += m.horseshoeAngleDir * dt * 60;
      if (m.horseshoeAngle >= 80) m.horseshoeAngleDir = -1;
      if (m.horseshoeAngle <= 20) m.horseshoeAngleDir = 1;
      if (consumeKey('Space')) { m.horseshoePhase = 1; m.horseshoePower = 0; }
    } else if (m.horseshoePhase === 1) {
      m.horseshoePower += dt * 100;
      if (m.horseshoePower > 100) m.horseshoePower = 0;
      if (consumeKey('Space')) {
        m.horseshoeFlying = true;
        m.horseshoePhase = 2;
        m._horseshoeResult = Math.abs(m.horseshoePower - 65) + Math.abs(m.horseshoeAngle - 50) * 0.5;
      }
    } else if (m.horseshoePhase === 2) {
      if (m._horseshoeAnimTimer > 1) {
        m._horseshoeAnimTimer = 0;
        m.horseshoeFlying = false;
        var hResult = m._horseshoeResult;
        if (hResult < 8) { m.horseshoeScore += 50; showNotification('RINGER! +50 points!'); }
        else if (hResult < 20) { m.horseshoeScore += 25; showNotification('Leaner! +25 points!'); }
        else if (hResult < 35) { m.horseshoeScore += 10; showNotification('Close! +10 points!'); }
        else { showNotification('Miss!'); }
        m.horseshoeRound++;
        if (m.horseshoeRound >= 5) {
          var hReward = Math.floor(m.horseshoeScore * 0.5);
          game.gold += hReward;
          game.totalGoldEarned += hReward;
          showNotification('Horseshoe toss over! Score: ' + m.horseshoeScore + ' +$' + hReward);
          endMinigame('horseshoeToss', m.horseshoeScore >= 100, 60);
        } else {
          m.horseshoePhase = 0;
          m.horseshoeAngle = 50;
          m.horseshoeAngleDir = 1;
        }
      }
    }
    if (consumeKey('Escape') && m.horseshoeToss) {
      endMinigame('horseshoeToss', false, 30);
      showNotification('Left horseshoe toss.');
    }
  }

  // ════════════════════════════════════════
  // 10. SHARPSHOOTING CONTEST
  // ════════════════════════════════════════
  if (m.sharpshootContest) {
    m.sharpshootTimer -= dt;
    m._sharpAimX = m._sharpAimX || 150;
    m._sharpAimY = m._sharpAimY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._sharpAimY -= 4;
    if (keys['KeyS'] || keys['ArrowDown']) m._sharpAimY += 4;
    if (keys['KeyA'] || keys['ArrowLeft']) m._sharpAimX -= 4;
    if (keys['KeyD'] || keys['ArrowRight']) m._sharpAimX += 4;
    m._sharpAimX = clamp(m._sharpAimX, 10, 290);
    m._sharpAimY = clamp(m._sharpAimY, 10, 170);
    // Move targets
    for (var mti = 0; mti < m.sharpshootTargets.length; mti++) {
      var mt = m.sharpshootTargets[mti];
      if (mt.hp <= 0) continue;
      mt.x += mt.dx;
      mt.y += mt.dy;
      if (mt.x < 20 || mt.x > 280) mt.dx = -mt.dx;
      if (mt.y < 20 || mt.y > 160) mt.dy = -mt.dy;
    }
    // Shoot
    if (consumeKey('Space')) {
      var hitSharp = false;
      for (var hsi2 = 0; hsi2 < m.sharpshootTargets.length; hsi2++) {
        var hs = m.sharpshootTargets[hsi2];
        if (hs.hp > 0 && Math.hypot(m._sharpAimX - hs.x, m._sharpAimY - hs.y) < hs.size) {
          hs.hp = 0;
          m.sharpshootScore += 20;
          hitSharp = true;
          if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
          // Respawn
          hs.x = rand(40, 260); hs.y = rand(30, 140); hs.hp = 1;
          hs.dx = randF(-2, 2); hs.dy = randF(-1, 1);
          hs.size = rand(8, 18);
          showNotification('Hit! Score: ' + m.sharpshootScore);
          break;
        }
      }
      if (!hitSharp) m.sharpshootMisses++;
    }
    if (m.sharpshootTimer <= 0) {
      var sharpReward = m.sharpshootScore * 2;
      game.gold += sharpReward;
      game.totalGoldEarned += sharpReward;
      if (m.sharpshootScore >= 100) game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Contest over! Score: ' + m.sharpshootScore + ' +$' + sharpReward);
      endMinigame('sharpshootContest', m.sharpshootScore >= 80, 120);
    }
    if (consumeKey('Escape') && m.sharpshootContest) {
      endMinigame('sharpshootContest', false, 30);
      showNotification('Left the contest.');
    }
  }

  // ════════════════════════════════════════
  // 11. BANDIT HIDEOUT RAID
  // ════════════════════════════════════════
  if (m.hideoutRaid) {
    // Movement
    if (keys['KeyW'] || keys['ArrowUp']) m.hideoutPlayerY -= 2.5;
    if (keys['KeyS'] || keys['ArrowDown']) m.hideoutPlayerY += 2.5;
    if (keys['KeyA'] || keys['ArrowLeft']) m.hideoutPlayerX -= 2.5;
    if (keys['KeyD'] || keys['ArrowRight']) m.hideoutPlayerX += 2.5;
    m.hideoutPlayerX = clamp(m.hideoutPlayerX, 10, 290);
    m.hideoutPlayerY = clamp(m.hideoutPlayerY, 10, 170);
    // Shoot
    m._hideoutShootCd = (m._hideoutShootCd || 0) - dt;
    if (consumeKey('Space') && m._hideoutShootCd <= 0) {
      m._hideoutShootCd = 0.3;
      // Hit nearest enemy in front
      var nearestHE = null, nearestHD = 999;
      for (var nei = 0; nei < m.hideoutEnemies.length; nei++) {
        var ne = m.hideoutEnemies[nei];
        if (ne.hp <= 0) continue;
        var ned = Math.hypot(m.hideoutPlayerX - ne.x, m.hideoutPlayerY - ne.y);
        if (ned < nearestHD) { nearestHD = ned; nearestHE = ne; }
      }
      if (nearestHE && nearestHD < 120) {
        nearestHE.hp--;
        if (nearestHE.hp <= 0) {
          m.hideoutLoot += rand(10, 30);
          showNotification('Bandit down! Loot: $' + m.hideoutLoot);
        }
        if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
      }
    }
    // Enemy AI
    for (var hai = 0; hai < m.hideoutEnemies.length; hai++) {
      var he = m.hideoutEnemies[hai];
      if (he.hp <= 0) continue;
      var hdx = m.hideoutPlayerX - he.x, hdy = m.hideoutPlayerY - he.y;
      var hlen = Math.hypot(hdx, hdy) || 1;
      he.x += (hdx / hlen) * 0.8;
      he.y += (hdy / hlen) * 0.8;
      he.attackTimer -= dt;
      if (he.attackTimer <= 0 && hlen < 40) {
        he.attackTimer = randF(1.5, 3);
        m.hideoutHP--;
      }
    }
    // Next room
    var allDead = true;
    for (var adi = 0; adi < m.hideoutEnemies.length; adi++) if (m.hideoutEnemies[adi].hp > 0) allDead = false;
    if (allDead && consumeKey('KeyE')) {
      m.hideoutRoom++;
      if (m.hideoutRoom >= m.hideoutRooms) {
        game.gold += m.hideoutLoot + 100;
        game.totalGoldEarned += m.hideoutLoot + 100;
        game.reputation = clamp(game.reputation + 15, 0, REPUTATION_MAX);
        showNotification('HIDEOUT CLEARED! +$' + (m.hideoutLoot + 100) + ' +15 Rep!');
        addJournalEntry('Cleared a bandit hideout. Found $' + (m.hideoutLoot + 100));
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        endMinigame('hideoutRaid', true, 300);
        m.hideoutCooldown = 300;
      } else {
        m.hideoutPlayerX = 30;
        m.hideoutEnemies = [];
        var enemyCount = 3 + m.hideoutRoom;
        for (var nri = 0; nri < enemyCount; nri++) {
          m.hideoutEnemies.push({ x: rand(150, 280), y: rand(30, 150), hp: 2 + Math.floor(m.hideoutRoom / 2), attackTimer: randF(1, 3) });
        }
        showNotification('Room ' + (m.hideoutRoom + 1) + '/' + m.hideoutRooms + '!');
      }
    }
    if (m.hideoutHP <= 0) {
      game.gold += Math.floor(m.hideoutLoot * 0.5);
      game.totalGoldEarned += Math.floor(m.hideoutLoot * 0.5);
      showNotification('Defeated in the hideout! Kept $' + Math.floor(m.hideoutLoot * 0.5));
      endMinigame('hideoutRaid', false, 180);
      m.hideoutCooldown = 180;
    }
    if (consumeKey('Escape') && m.hideoutRaid) {
      game.gold += Math.floor(m.hideoutLoot * 0.3);
      game.totalGoldEarned += Math.floor(m.hideoutLoot * 0.3);
      endMinigame('hideoutRaid', false, 120);
      m.hideoutCooldown = 120;
      showNotification('Retreated from hideout. Kept $' + Math.floor(m.hideoutLoot * 0.3));
    }
  }

  // ════════════════════════════════════════
  // 12. RODEO BRONCO
  // ════════════════════════════════════════
  if (m.rodeoBronco) {
    m.rodeoBroncoTimer += dt;
    m.rodeoBroncoBuckTimer += dt;
    // Buck randomly
    if (m.rodeoBroncoBuckTimer > randF(0.3, 0.8)) {
      m.rodeoBroncoBuckTimer = 0;
      m.rodeoBroncoBuckDir = Math.random() < 0.5 ? -1 : 1;
      var buckForce = 15 + m.rodeoBroncoTimer * 3;
      m.rodeoBroncoBalance += m.rodeoBroncoBuckDir * buckForce;
    }
    // Natural drift
    m.rodeoBroncoBalance += m.rodeoBroncoBuckDir * dt * 20;
    // Player controls
    if (keys['KeyA'] || keys['ArrowLeft']) m.rodeoBroncoBalance -= dt * 60;
    if (keys['KeyD'] || keys['ArrowRight']) m.rodeoBroncoBalance += dt * 60;
    // Clamp and check
    if (m.rodeoBroncoBalance <= 0 || m.rodeoBroncoBalance >= 100) {
      var broncoTime = m.rodeoBroncoTimer.toFixed(1);
      if (m.rodeoBroncoTimer >= 8) {
        var broncoReward = 200;
        game.gold += broncoReward;
        game.totalGoldEarned += broncoReward;
        game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
        showNotification('FULL RIDE! ' + broncoTime + 's! +$' + broncoReward + ' +8 Rep!');
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        endMinigame('rodeoBronco', true, 90);
      } else {
        showNotification('Bucked off at ' + broncoTime + 's! Need 8s to win.');
        endMinigame('rodeoBronco', false, 60);
      }
    }
    if (m.rodeoBroncoTimer >= 8 && m.rodeoBroncoBalance > 0 && m.rodeoBroncoBalance < 100) {
      var broncoReward2 = 200;
      game.gold += broncoReward2;
      game.totalGoldEarned += broncoReward2;
      game.reputation = clamp(game.reputation + 8, 0, REPUTATION_MAX);
      showNotification('FULL RIDE! 8.0s! +$' + broncoReward2 + ' +8 Rep!');
      if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
      endMinigame('rodeoBronco', true, 90);
    }
    if (consumeKey('Escape') && m.rodeoBronco) {
      endMinigame('rodeoBronco', false, 30);
      showNotification('Jumped off the bronco.');
    }
  }

  // ════════════════════════════════════════
  // 13. TELEGRAPH DECODER
  // ════════════════════════════════════════
  if (m.telegraphDecode) {
    m.telegraphTimer -= dt;
    // Check letter keys
    for (var tki = 65; tki <= 90; tki++) {
      var kCode = 'Key' + String.fromCharCode(tki);
      if (consumeKey(kCode)) {
        var letter = String.fromCharCode(tki);
        var expected = m.telegraphMessage[m.telegraphInput.length];
        if (letter === expected) {
          m.telegraphInput += letter;
          if (m.telegraphInput === m.telegraphMessage) {
            m.telegraphScore += 50;
            m.telegraphRound++;
            if (m.telegraphRound >= 3) {
              game.gold += m.telegraphScore;
              game.totalGoldEarned += m.telegraphScore;
              game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
              showNotification('All telegrams decoded! +$' + m.telegraphScore + ' +5 Rep');
              endMinigame('telegraphDecode', true, 200);
            } else {
              var words2 = ['SHERIFF', 'MARSHAL', 'OUTLAW', 'WANTED', 'BOUNTY', 'PRISON', 'SALOON', 'BANDIT', 'DANGER', 'POSSE'];
              m.telegraphMessage = words2[rand(0, words2.length - 1)];
              m.telegraphInput = '';
              showNotification('Good! Next word: ' + m.telegraphMessage);
            }
          }
        } else {
          m.telegraphInput = '';
          showNotification('Wrong letter! Start over: ' + m.telegraphMessage);
        }
      }
    }
    if (m.telegraphTimer <= 0) {
      showNotification('Telegram timed out!');
      endMinigame('telegraphDecode', false, 200);
    }
    if (consumeKey('Escape') && m.telegraphDecode) {
      endMinigame('telegraphDecode', false, 120);
      showNotification('Abandoned telegram.');
    }
  }

  // ════════════════════════════════════════
  // 14. BANK VAULT CRACKING
  // ════════════════════════════════════════
  if (m.vaultCrack) {
    m.vaultTimer -= dt;
    var dial = m.vaultCurrentDial;
    // Turn dial
    if (keys['KeyA'] || keys['ArrowLeft']) m.vaultDials[dial] = (m.vaultDials[dial] - dt * 40 + 100) % 100;
    if (keys['KeyD'] || keys['ArrowRight']) m.vaultDials[dial] = (m.vaultDials[dial] + dt * 40) % 100;
    // Lock
    if (consumeKey('Space')) {
      var diff = Math.abs(m.vaultDials[dial] - m.vaultTargets[dial]);
      if (diff < 5 || diff > 95) {
        showNotification('Click! Tumbler ' + (dial + 1) + ' unlocked!');
        m.vaultCurrentDial++;
        if (m.vaultCurrentDial >= 3) {
          var vaultLoot = rand(200, 500);
          game.gold += vaultLoot;
          game.totalGoldEarned += vaultLoot;
          game.corruption = clamp((game.corruption || 0) + 25, 0, 100);
          game.reputation = clamp(game.reputation - 20, 0, REPUTATION_MAX);
          showNotification('VAULT CRACKED! Stole $' + vaultLoot + '! +25 Corruption, -20 Rep');
          addJournalEntry('Cracked the bank vault for $' + vaultLoot);
          endMinigame('vaultCrack', true, 600);
        }
      } else {
        showNotification('Wrong! Dial reset. Target hint: ~' + Math.round(m.vaultTargets[dial] / 10) * 10);
        m.vaultDials[dial] = 0;
      }
    }
    if (m.vaultTimer <= 0) {
      game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
      showNotification('Alarm triggered! Fled the bank. -5 Rep');
      endMinigame('vaultCrack', false, 300);
    }
    if (consumeKey('Escape') && m.vaultCrack) {
      endMinigame('vaultCrack', false, 120);
      showNotification('Left the vault.');
    }
  }

  // ════════════════════════════════════════
  // 15. TOWN DEFENSE WAVE
  // ════════════════════════════════════════
  if (m.townDefense) {
    m.townDefenseTimer += dt;
    m._townAimX = m._townAimX || 150;
    m._townAimY = m._townAimY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._townAimY -= 4;
    if (keys['KeyS'] || keys['ArrowDown']) m._townAimY += 4;
    if (keys['KeyA'] || keys['ArrowLeft']) m._townAimX -= 4;
    if (keys['KeyD'] || keys['ArrowRight']) m._townAimX += 4;
    m._townAimX = clamp(m._townAimX, 10, 290);
    m._townAimY = clamp(m._townAimY, 10, 170);
    // Move enemies toward center (town)
    var tdWrite = 0;
    for (var tei = 0; tei < m.townDefenseEnemies.length; tei++) {
      var te = m.townDefenseEnemies[tei];
      if (te.hp <= 0) { m.townDefenseKills++; continue; }
      m.townDefenseEnemies[tdWrite++] = te;
      te.x += (150 - te.x) * 0.005 * te.speed;
      te.y += (90 - te.y) * 0.003 * te.speed;
      te.attackTimer -= dt;
      if (te.attackTimer <= 0 && Math.abs(te.x - 150) < 80) {
        te.attackTimer = randF(2, 4);
        m.townDefenseHP -= rand(3, 8);
      }
    }
    m.townDefenseEnemies.length = tdWrite;
    // Shoot
    if (consumeKey('Space')) {
      for (var tsi = 0; tsi < m.townDefenseEnemies.length; tsi++) {
        var ts = m.townDefenseEnemies[tsi];
        if (ts.hp > 0 && Math.hypot(m._townAimX - ts.x, m._townAimY - ts.y) < 20) {
          ts.hp--;
          if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
          break;
        }
      }
    }
    // Wave progression
    if (m.townDefenseEnemies.length === 0) {
      m.townDefenseWave++;
      if (m.townDefenseWave > 3) {
        var tdReward = 200 + m.townDefenseKills * 10 + Math.floor(m.townDefenseHP);
        game.gold += tdReward;
        game.totalGoldEarned += tdReward;
        game.reputation = clamp(game.reputation + 20, 0, REPUTATION_MAX);
        showNotification('TOWN SAVED! +$' + tdReward + ' +20 Rep! Kills: ' + m.townDefenseKills);
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        endMinigame('townDefense', true, 300);
        m.townDefenseCooldown = 300;
      } else {
        var waveEnemies = 5 + m.townDefenseWave * 2;
        for (var nwi = 0; nwi < waveEnemies; nwi++) {
          m.townDefenseEnemies.push({
            x: Math.random() < 0.5 ? -10 : 310, y: rand(20, 160),
            hp: 2 + Math.floor(m.townDefenseWave / 2), speed: randF(0.5, 1.5 + m.townDefenseWave * 0.3),
            attackTimer: randF(1.5, 3.5)
          });
        }
        showNotification('Wave ' + m.townDefenseWave + '! ' + waveEnemies + ' bandits incoming!');
      }
    }
    if (m.townDefenseHP <= 0) {
      game.reputation = clamp(game.reputation - 15, 0, REPUTATION_MAX);
      showNotification('Town overrun! -15 Rep. Killed ' + m.townDefenseKills + ' bandits.');
      endMinigame('townDefense', false, 300);
      m.townDefenseCooldown = 300;
    }
    if (consumeKey('Escape') && m.townDefense) {
      endMinigame('townDefense', false, 120);
      m.townDefenseCooldown = 120;
      showNotification('Fled the battle.');
    }
  }

  // ════════════════════════════════════════
  // 16. WANTED POSTER MATCH (Memory game)
  // ════════════════════════════════════════
  if (m.posterMatch) {
    m.posterMatchTimer -= dt;
    // Move cursor
    if (consumeKey('KeyD') || consumeKey('ArrowRight')) m._posterCursor = Math.min(15, m._posterCursor + 1);
    if (consumeKey('KeyA') || consumeKey('ArrowLeft')) m._posterCursor = Math.max(0, m._posterCursor - 1);
    if (consumeKey('KeyS') || consumeKey('ArrowDown')) m._posterCursor = Math.min(15, m._posterCursor + 4);
    if (consumeKey('KeyW') || consumeKey('ArrowUp')) m._posterCursor = Math.max(0, m._posterCursor - 4);
    // Flip
    if (consumeKey('Space')) {
      var card = m.posterMatchCards[m._posterCursor];
      if (!card.matched && !card.revealed) {
        card.revealed = true;
        m.posterMatchMoves++;
        if (m._posterSelected === -1) {
          m._posterSelected = m._posterCursor;
        } else {
          var prev = m.posterMatchCards[m._posterSelected];
          if (prev.name === card.name) {
            prev.matched = true;
            card.matched = true;
            m.posterMatchMatched++;
            showNotification('Match! ' + card.name + '! (' + m.posterMatchMatched + '/8)');
          } else {
            // Flip both back after delay
            var prevIdx = m._posterSelected;
            var curIdx = m._posterCursor;
            setTimeout(function() {
              if (m.posterMatchCards[prevIdx]) m.posterMatchCards[prevIdx].revealed = false;
              if (m.posterMatchCards[curIdx]) m.posterMatchCards[curIdx].revealed = false;
            }, 800);
          }
          m._posterSelected = -1;
        }
      }
    }
    if (m.posterMatchMatched >= 8) {
      var matchReward = Math.max(20, 100 - m.posterMatchMoves * 3);
      game.gold += matchReward;
      game.totalGoldEarned += matchReward;
      game.reputation = clamp(game.reputation + 3, 0, REPUTATION_MAX);
      showNotification('All posters matched! +$' + matchReward + ' in ' + m.posterMatchMoves + ' moves!');
      endMinigame('posterMatch', true, 120);
    }
    if (m.posterMatchTimer <= 0) {
      showNotification('Time\'s up! Matched ' + m.posterMatchMatched + '/8.');
      endMinigame('posterMatch', false, 120);
    }
    if (consumeKey('Escape') && m.posterMatch) {
      endMinigame('posterMatch', false, 60);
      showNotification('Left the poster board.');
    }
  }

  // ════════════════════════════════════════
  // 17. SUPPLY RUN (endless runner style)
  // ════════════════════════════════════════
  if (m.supplyRun) {
    m.supplyRunTimer += dt;
    m.supplyRunDistance += dt * 100;
    // Lane change
    if (consumeKey('KeyW') || consumeKey('ArrowUp')) m.supplyRunLane = Math.max(0, m.supplyRunLane - 1);
    if (consumeKey('KeyS') || consumeKey('ArrowDown')) m.supplyRunLane = Math.min(2, m.supplyRunLane + 1);
    // Spawn obstacles
    if (Math.random() < 0.03) {
      var obsTypes = ['rock', 'bandit', 'cactus', 'snake'];
      m.supplyRunObstacles.push({
        x: 320, lane: rand(0, 2), type: obsTypes[rand(0, obsTypes.length - 1)],
        speed: 3 + m.supplyRunTimer * 0.1
      });
    }
    // Spawn coins
    if (Math.random() < 0.02) {
      m.supplyRunObstacles.push({ x: 320, lane: rand(0, 2), type: 'coin', speed: 3 + m.supplyRunTimer * 0.1 });
    }
    // Move obstacles
    var srWrite = 0;
    for (var ori = 0; ori < m.supplyRunObstacles.length; ori++) {
      var ob = m.supplyRunObstacles[ori];
      ob.x -= ob.speed;
      if (ob.x < -20) continue;
      m.supplyRunObstacles[srWrite++] = ob;
      // Collision with player (at x=50)
      if (ob.x < 60 && ob.x > 30 && ob.lane === m.supplyRunLane) {
        if (ob.type === 'coin') {
          m.supplyRunScore += 10;
          ob.x = -100; // remove
        } else {
          m.supplyRunHP--;
          ob.x = -100;
          showNotification('Hit! HP: ' + m.supplyRunHP);
        }
      }
    }
    m.supplyRunObstacles.length = srWrite;
    // End
    if (m.supplyRunHP <= 0) {
      var srReward = m.supplyRunScore;
      game.gold += srReward;
      game.totalGoldEarned += srReward;
      showNotification('Supplies lost! Score: ' + m.supplyRunScore + ' +$' + srReward);
      endMinigame('supplyRun', false, 90);
    }
    if (m.supplyRunDistance >= 1000) {
      var srReward2 = m.supplyRunScore + 100;
      game.gold += srReward2;
      game.totalGoldEarned += srReward2;
      game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Supplies delivered! +$' + srReward2 + ' +5 Rep!');
      if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
      endMinigame('supplyRun', true, 90);
    }
    if (consumeKey('Escape') && m.supplyRun) {
      endMinigame('supplyRun', false, 30);
      showNotification('Abandoned supply run.');
    }
  }

  // ════════════════════════════════════════
  // 18. RATTLESNAKE ROUNDUP
  // ════════════════════════════════════════
  if (m.snakeRoundup) {
    m.snakeRoundupTimer -= dt;
    if (keys['KeyW'] || keys['ArrowUp']) m.snakeRoundupPlayerY -= 3;
    if (keys['KeyS'] || keys['ArrowDown']) m.snakeRoundupPlayerY += 3;
    if (keys['KeyA'] || keys['ArrowLeft']) m.snakeRoundupPlayerX -= 3;
    if (keys['KeyD'] || keys['ArrowRight']) m.snakeRoundupPlayerX += 3;
    m.snakeRoundupPlayerX = clamp(m.snakeRoundupPlayerX, 10, 290);
    m.snakeRoundupPlayerY = clamp(m.snakeRoundupPlayerY, 10, 170);
    for (var ssi = 0; ssi < m.snakeRoundupSnakes.length; ssi++) {
      var sn = m.snakeRoundupSnakes[ssi];
      if (sn.caught) continue;
      sn.x += sn.dx; sn.y += sn.dy;
      if (sn.x < 10 || sn.x > 290) sn.dx = -sn.dx;
      if (sn.y < 10 || sn.y > 170) sn.dy = -sn.dy;
      sn.dx += randF(-0.3, 0.3); sn.dy += randF(-0.3, 0.3);
      sn.dx = clamp(sn.dx, -3, 3); sn.dy = clamp(sn.dy, -3, 3);
      // Strike player
      sn.strikeTimer -= dt;
      if (sn.strikeTimer <= 0 && Math.hypot(m.snakeRoundupPlayerX - sn.x, m.snakeRoundupPlayerY - sn.y) < 25) {
        sn.strikeTimer = randF(3, 6);
        m.snakeRoundupBitten++;
        showNotification('Bitten! (' + m.snakeRoundupBitten + ')');
      }
    }
    if (consumeKey('Space')) {
      for (var sci2 = 0; sci2 < m.snakeRoundupSnakes.length; sci2++) {
        var sc2 = m.snakeRoundupSnakes[sci2];
        if (!sc2.caught && Math.hypot(m.snakeRoundupPlayerX - sc2.x, m.snakeRoundupPlayerY - sc2.y) < 22) {
          sc2.caught = true;
          m.snakeRoundupCaught++;
          showNotification('Caught! (' + m.snakeRoundupCaught + '/8)');
          break;
        }
      }
    }
    if (m.snakeRoundupTimer <= 0 || m.snakeRoundupCaught >= 8 || m.snakeRoundupBitten >= 5) {
      var snakeReward = m.snakeRoundupCaught * 15 - m.snakeRoundupBitten * 5;
      if (snakeReward < 0) snakeReward = 0;
      game.gold += snakeReward;
      game.totalGoldEarned += snakeReward;
      if (m.snakeRoundupCaught >= 6) game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Roundup over! Caught ' + m.snakeRoundupCaught + '/8, bitten ' + m.snakeRoundupBitten + ' times. +$' + snakeReward);
      endMinigame('snakeRoundup', m.snakeRoundupCaught >= 5, 250);
    }
    if (consumeKey('Escape') && m.snakeRoundup) {
      endMinigame('snakeRoundup', false, 60);
      showNotification('Fled the snakes.');
    }
  }

  // ════════════════════════════════════════
  // 19. GOLD RUSH AUCTION
  // ════════════════════════════════════════
  if (m.goldAuction) {
    m.goldAuctionTimer -= dt;
    var item = m.goldAuctionItems[m.goldAuctionCurrent];
    // AI bids
    if (Math.random() < 0.04 && m.goldAuctionBid < item.value * 0.9) {
      m.goldAuctionBid += rand(5, 20);
    }
    // Player bid up
    if (consumeKey('KeyD')) {
      m.goldAuctionBid += rand(10, 25);
      m.goldAuctionTimer = 5; // reset timer on bid
      showNotification('Bid: $' + m.goldAuctionBid + ' for ' + item.name);
    }
    // Buy
    if (consumeKey('Space')) {
      if (game.gold >= m.goldAuctionBid) {
        game.gold -= m.goldAuctionBid;
        m.goldAuctionWon.push(item);
        showNotification('WON ' + item.name + ' for $' + m.goldAuctionBid + '! (worth ~$' + item.value + ')');
        m.goldAuctionCurrent++;
      } else {
        showNotification('Not enough gold! Need $' + m.goldAuctionBid);
      }
      m.goldAuctionTimer = 0;
    }
    // Pass
    if (consumeKey('KeyS') || m.goldAuctionTimer <= 0) {
      if (m.goldAuctionTimer > 0) showNotification('Passed on ' + item.name);
      m.goldAuctionCurrent++;
      m.goldAuctionTimer = 10;
    }
    if (m.goldAuctionCurrent >= m.goldAuctionItems.length) {
      // Auction over — reward won items
      var totalValue = 0;
      for (var awi = 0; awi < m.goldAuctionWon.length; awi++) {
        totalValue += m.goldAuctionWon[awi].value;
        if (m.goldAuctionWon[awi].name === 'Crate of Dynamite') {
          if (game._features) game._features.dynamiteCount += 5;
        }
        if (m.goldAuctionWon[awi].name === 'Map to Outlaw Cache') {
          if (game._features) game._features.activeTreasure = { x: rand(5, MAP_W - 5) * TILE, y: rand(5, MAP_H - 5) * TILE, gold: rand(100, 300) };
        }
      }
      game.gold += totalValue;
      game.totalGoldEarned += totalValue;
      showNotification('Auction over! Won ' + m.goldAuctionWon.length + ' items worth $' + totalValue + '!');
      endMinigame('goldAuction', m.goldAuctionWon.length > 0, 300);
    }
    if (consumeKey('Escape') && m.goldAuction) {
      endMinigame('goldAuction', false, 120);
      showNotification('Left the auction.');
    }
  }

  // ════════════════════════════════════════
  // 20. MOONSHINE BUST
  // ════════════════════════════════════════
  if (m.moonshineBust) {
    m.moonshineTimer -= dt;
    for (var mki = 1; mki <= 6; mki++) {
      if (consumeKey('Digit' + mki)) {
        var loc = m.moonshineLocations[mki - 1];
        if (loc.searched) { showNotification('Already searched ' + loc.name); continue; }
        loc.searched = true;
        if (loc.hasStill) {
          m.moonshineFound = true;
          game.gold += 150;
          game.totalGoldEarned += 150;
          game.reputation = clamp(game.reputation + 12, 0, REPUTATION_MAX);
          showNotification('FOUND the still at ' + loc.name + '! +$150 +12 Rep!');
          if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
          addJournalEntry('Busted a moonshine operation at ' + loc.name);
          endMinigame('moonshineBust', true, 280);
          break;
        } else {
          // Give clue
          var stillIdx = -1;
          for (var fsi2 = 0; fsi2 < m.moonshineLocations.length; fsi2++) if (m.moonshineLocations[fsi2].hasStill) stillIdx = fsi2;
          var distHint = Math.abs(mki - 1 - stillIdx);
          var clue = distHint <= 1 ? 'Smell of corn mash nearby!' : distHint <= 2 ? 'Faint fumes in the air...' : 'Nothing here.';
          showNotification(loc.name + ': ' + clue);
        }
      }
    }
    if (m.moonshineTimer <= 0 && !m.moonshineFound) {
      game.reputation = clamp(game.reputation - 5, 0, REPUTATION_MAX);
      showNotification('Moonshine trail went cold! -5 Rep');
      endMinigame('moonshineBust', false, 280);
    }
    if (consumeKey('Escape') && m.moonshineBust) {
      endMinigame('moonshineBust', false, 120);
      showNotification('Gave up the investigation.');
    }
  }

  // ════════════════════════════════════════
  // 21. PROSPECTOR'S CLAIM
  // ════════════════════════════════════════
  if (m.prospectorClaim) {
    m.prospectorTimer -= dt;
    m._prospectX = m._prospectX || 150;
    m._prospectY = m._prospectY || 90;
    if (keys['KeyW'] || keys['ArrowUp']) m._prospectY -= 3;
    if (keys['KeyS'] || keys['ArrowDown']) m._prospectY += 3;
    if (keys['KeyA'] || keys['ArrowLeft']) m._prospectX -= 3;
    if (keys['KeyD'] || keys['ArrowRight']) m._prospectX += 3;
    m._prospectX = clamp(m._prospectX, 10, 290);
    m._prospectY = clamp(m._prospectY, 10, 170);
    // Tool selection
    if (consumeKey('Digit1')) m.prospectorTool = 0;
    if (consumeKey('Digit2')) m.prospectorTool = 1;
    // Mine
    if (consumeKey('Space')) {
      for (var rmi = 0; rmi < m.prospectorRocks.length; rmi++) {
        var rk = m.prospectorRocks[rmi];
        if (!rk.mined && Math.hypot(m._prospectX - rk.x, m._prospectY - rk.y) < 20) {
          rk.mined = true;
          if (rk.hasGold) {
            var bonus = m.prospectorTool === 1 ? 2 : 1;
            m.prospectorGold += rk.goldAmount * bonus;
            showNotification('GOLD! +$' + (rk.goldAmount * bonus));
          } else {
            showNotification(m.prospectorTool === 1 ? 'Boom! Just rubble.' : 'Just rock.');
          }
          break;
        }
      }
    }
    if (m.prospectorTimer <= 0) {
      game.gold += m.prospectorGold;
      game.totalGoldEarned += m.prospectorGold;
      showNotification('Claim expired! Found $' + m.prospectorGold + ' in gold!');
      endMinigame('prospectorClaim', m.prospectorGold > 50, 200);
    }
    if (consumeKey('Escape') && m.prospectorClaim) {
      game.gold += Math.floor(m.prospectorGold * 0.5);
      game.totalGoldEarned += Math.floor(m.prospectorGold * 0.5);
      endMinigame('prospectorClaim', false, 120);
      showNotification('Left the claim. Kept $' + Math.floor(m.prospectorGold * 0.5));
    }
  }

  // ════════════════════════════════════════
  // 22. POKER TOURNAMENT
  // ════════════════════════════════════════
  if (m.pokerTourney) {
    if (m.pokerTourneyPhase === 0) {
      // Hold cards with 1-5
      for (var phi = 1; phi <= 5; phi++) {
        if (consumeKey('Digit' + phi)) {
          var idx = phi - 1;
          var hi = m.pokerTourneyHeld.indexOf(idx);
          if (hi >= 0) { m.pokerTourneyHeld.splice(hi, 1); showNotification('Unholding card ' + phi); }
          else { m.pokerTourneyHeld.push(idx); showNotification('Holding card ' + phi + ': ' + m.pokerTourneyHand[idx].rank + ' of ' + m.pokerTourneyHand[idx].suit); }
        }
      }
      // Raise
      if (consumeKey('KeyD') && m.pokerTourneyChips >= 50) {
        m.pokerTourneyChips -= 50;
        m.pokerTourneyPot += 100;
        showNotification('Raised! Pot: $' + m.pokerTourneyPot);
      }
      // Draw
      if (consumeKey('Space')) {
        var deck2 = newDeck();
        for (var di = 0; di < 5; di++) {
          if (m.pokerTourneyHeld.indexOf(di) === -1) {
            m.pokerTourneyHand[di] = deck2.pop();
          }
        }
        m.pokerTourneyPhase = 1;
        // Evaluate
        var pVal = handValue(m.pokerTourneyHand);
        var dVal = handValue(m.pokerTourneyDealer);
        if (pVal > 21) pVal = 0;
        if (dVal > 21) dVal = 0;
        // Simple comparison (higher non-bust total wins)
        m._pokerResultTimer = 2;
        if (pVal > dVal) {
          m.pokerTourneyChips += m.pokerTourneyPot;
          showNotification('You win round ' + m.pokerTourneyRound + '! +$' + m.pokerTourneyPot + '! (' + pVal + ' vs ' + dVal + ')');
        } else if (pVal < dVal) {
          showNotification('Dealer wins round ' + m.pokerTourneyRound + '! (' + pVal + ' vs ' + dVal + ')');
        } else {
          m.pokerTourneyChips += Math.floor(m.pokerTourneyPot / 2);
          showNotification('Push! Split pot. (' + pVal + ' vs ' + dVal + ')');
        }
      }
    } else if (m.pokerTourneyPhase === 1) {
      m._pokerResultTimer -= dt;
      if (m._pokerResultTimer <= 0) {
        m.pokerTourneyRound++;
        if (m.pokerTourneyRound > 5 || m.pokerTourneyChips <= 0) {
          var netGain = m.pokerTourneyChips - 500 + 100; // subtract buy-in adjustment
          if (netGain > 0) {
            game.gold += netGain;
            game.totalGoldEarned += netGain;
            showNotification('Tournament over! Net gain: +$' + netGain);
            if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
          } else {
            showNotification('Tournament over! Lost $' + Math.abs(netGain));
          }
          endMinigame('pokerTourney', netGain > 0, 120);
        } else {
          m.pokerTourneyPhase = 0;
          m.pokerTourneyHeld = [];
          var deck3 = newDeck();
          m.pokerTourneyHand = [deck3.pop(), deck3.pop(), deck3.pop(), deck3.pop(), deck3.pop()];
          m.pokerTourneyDealer = [deck3.pop(), deck3.pop(), deck3.pop(), deck3.pop(), deck3.pop()];
          m.pokerTourneyPot = 100;
          m.pokerTourneyChips -= 50;
          showNotification('Round ' + m.pokerTourneyRound + '! Chips: $' + m.pokerTourneyChips + '. 1-5 hold, SPACE draw.');
        }
      }
    }
    if (consumeKey('Escape') && m.pokerTourney) {
      var cashout = Math.floor(m.pokerTourneyChips * 0.5);
      game.gold += cashout;
      game.totalGoldEarned += cashout;
      endMinigame('pokerTourney', false, 60);
      showNotification('Cashed out with $' + cashout);
    }
  }

  // ════════════════════════════════════════
  // 23. HIGH NOON STANDOFF
  // ════════════════════════════════════════
  if (m.highNoonStandoff) {
    if (m.highNoonPhase === 0) {
      m.highNoonTimer -= dt;
      if (m.highNoonTimer <= 0) {
        m.highNoonPhase = 1;
        showNotification('DRAW!');
      }
    } else if (m.highNoonPhase === 1) {
      m.highNoonTimer += dt;
      // Rotate aim
      if (keys['KeyA'] || keys['ArrowLeft']) m.highNoonPlayerAngle -= dt * 3;
      if (keys['KeyD'] || keys['ArrowRight']) m.highNoonPlayerAngle += dt * 3;
      // Enemies draw
      for (var eni = 0; eni < m.highNoonEnemies.length; eni++) {
        var en = m.highNoonEnemies[eni];
        if (en.hp <= 0) continue;
        en.drawTimer -= dt;
        if (en.drawTimer <= 0 && !en.drawing) {
          en.drawing = true;
          en._shootTimer = 1.5;
        }
        if (en.drawing) {
          en._shootTimer -= dt;
          if (en._shootTimer <= 0) {
            if (!game._cheatMode) p.hp -= 2;
            showNotification(en.name + ' shot you! -2 HP');
            en.drawing = false;
            en.drawTimer = randF(2, 5);
          }
        }
      }
      // Shoot
      if (consumeKey('Space') && m.highNoonShots > 0) {
        m.highNoonShots--;
        if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
        // Check if aiming at an enemy
        for (var tai = 0; tai < m.highNoonEnemies.length; tai++) {
          var ta = m.highNoonEnemies[tai];
          if (ta.hp <= 0) continue;
          var angleDiff = Math.abs(m.highNoonPlayerAngle - ta.angle) % (Math.PI * 2);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
          if (angleDiff < 0.4) {
            ta.hp = 0;
            m.highNoonScore++;
            showNotification(ta.name + ' down! (' + m.highNoonScore + '/4)');
            break;
          }
        }
      }
      // Check end
      var aliveEn = 0;
      for (var cei = 0; cei < m.highNoonEnemies.length; cei++) if (m.highNoonEnemies[cei].hp > 0) aliveEn++;
      if (aliveEn === 0) {
        game.gold += 300;
        game.totalGoldEarned += 300;
        game.reputation = clamp(game.reputation + 15, 0, REPUTATION_MAX);
        showNotification('HIGH NOON VICTORY! All 4 gunmen down! +$300 +15 Rep!');
        if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
        addJournalEntry('Won the high noon standoff!');
        endMinigame('highNoonStandoff', true, 600);
      }
      if (m.highNoonShots <= 0 && aliveEn > 0) {
        showNotification('Out of bullets! ' + aliveEn + ' gunmen remaining!');
        endMinigame('highNoonStandoff', false, 300);
      }
      if (p.hp <= 0 && !game._cheatMode) {
        endMinigame('highNoonStandoff', false, 300);
      }
    }
    if (consumeKey('Escape') && m.highNoonStandoff) {
      endMinigame('highNoonStandoff', false, 120);
      showNotification('Fled the standoff! Coward! -10 Rep');
      game.reputation = clamp(game.reputation - 10, 0, REPUTATION_MAX);
    }
  }

  // ════════════════════════════════════════
  // 24. WAGON WHEEL REPAIR
  // ════════════════════════════════════════
  if (m.wagonRepair) {
    m.wagonRepairTimer -= dt;
    // Hammer oscillates
    m._hammerPos = (m._hammerPos || 0) + dt * 3;
    var hammerVal = (Math.sin(m._hammerPos) + 1) * 50; // 0-100
    if (consumeKey('Space')) {
      m.wagonRepairHits++;
      if (Math.abs(hammerVal - m.wagonRepairTarget) < 15) {
        m.wagonRepairProgress += 25;
        showNotification('Good hit! (' + Math.min(100, m.wagonRepairProgress) + '%)');
      } else {
        m.wagonRepairProgress += 5;
        showNotification('Weak hit. (' + Math.min(100, m.wagonRepairProgress) + '%)');
      }
    }
    if (m.wagonRepairProgress >= 100) {
      var wagonReward = 60 + Math.max(0, 25 - m.wagonRepairHits) * 3;
      game.gold += wagonReward;
      game.totalGoldEarned += wagonReward;
      game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Wagon fixed! +$' + wagonReward + ' +5 Rep!');
      endMinigame('wagonRepair', true, 180);
    }
    if (m.wagonRepairTimer <= 0) {
      showNotification('Wagon couldn\'t be fixed in time!');
      endMinigame('wagonRepair', false, 180);
    }
    if (consumeKey('Escape') && m.wagonRepair) {
      endMinigame('wagonRepair', false, 60);
      showNotification('Left the wagon.');
    }
  }

  // ════════════════════════════════════════
  // 25. CATTLE BRANDING
  // ════════════════════════════════════════
  if (m.cattleBranding) {
    m.cattleBrandingTimer -= dt;
    // Select brand
    for (var cbs = 1; cbs <= 5; cbs++) {
      if (consumeKey('Digit' + cbs)) m.cattleBrandingSelected = cbs - 1;
    }
    if (consumeKey('Space')) {
      if (m.cattleBrandingSelected === m.cattleBrandingTarget) {
        m.cattleBrandingScore += 20;
        showNotification('Correct brand! +20 (' + m.cattleBrandingScore + ')');
      } else {
        m.cattleBrandingScore -= 5;
        showNotification('Wrong brand!');
      }
      m.cattleBrandingRound++;
      if (m.cattleBrandingRound >= 8) {
        var brandReward = Math.max(0, m.cattleBrandingScore);
        game.gold += brandReward;
        game.totalGoldEarned += brandReward;
        showNotification('Branding done! Score: ' + m.cattleBrandingScore + ' +$' + brandReward);
        endMinigame('cattleBranding', m.cattleBrandingScore >= 100, 90);
      } else {
        m.cattleBrandingTarget = rand(0, 4);
        showNotification('Next: ' + m.cattleBrandingBrands[m.cattleBrandingTarget] + '! (1-5 then SPACE)');
      }
    }
    if (m.cattleBrandingTimer <= 0) {
      showNotification('Branding time expired! Score: ' + m.cattleBrandingScore);
      endMinigame('cattleBranding', false, 90);
    }
    if (consumeKey('Escape') && m.cattleBranding) {
      endMinigame('cattleBranding', false, 30);
      showNotification('Left cattle branding.');
    }
  }

  // ════════════════════════════════════════
  // 26. MEDICINE MAN
  // ════════════════════════════════════════
  if (m.medicineMan) {
    m.medicineTimer -= dt;
    var patient = m.medicinePatients[m.medicineCurrentPatient];
    for (var rxi = 1; rxi <= 6; rxi++) {
      if (consumeKey('Digit' + rxi)) {
        if (rxi - 1 === patient.remedy) {
          patient.treated = true;
          m.medicineScore += 25;
          showNotification('Correct! ' + m.medicineItems[rxi - 1] + ' for ' + patient.ailment + '! +25');
        } else {
          m.medicineScore -= 10;
          showNotification('Wrong remedy! -10');
        }
        m.medicineCurrentPatient++;
        if (m.medicineCurrentPatient >= m.medicinePatients.length) {
          var medReward = Math.max(0, m.medicineScore);
          game.gold += medReward;
          game.totalGoldEarned += medReward;
          game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
          showNotification('All patients treated! +$' + medReward + ' +5 Rep');
          endMinigame('medicineMan', m.medicineScore >= 75, 200);
        } else {
          showNotification('Next patient: ' + m.medicinePatients[m.medicineCurrentPatient].ailment + '! (1-6)');
        }
        break;
      }
    }
    if (m.medicineTimer <= 0) {
      showNotification('Ran out of time! Score: ' + m.medicineScore);
      endMinigame('medicineMan', false, 200);
    }
    if (consumeKey('Escape') && m.medicineMan) {
      endMinigame('medicineMan', false, 60);
      showNotification('Left the patients.');
    }
  }

  // ════════════════════════════════════════
  // 27. JAIL ESCAPE PREVENTION
  // ════════════════════════════════════════
  if (m.jailEscape) {
    m.jailEscapeTimer -= dt;
    if (keys['KeyW'] || keys['ArrowUp']) m.jailEscapePlayerY -= 3;
    if (keys['KeyS'] || keys['ArrowDown']) m.jailEscapePlayerY += 3;
    if (keys['KeyA'] || keys['ArrowLeft']) m.jailEscapePlayerX -= 3;
    if (keys['KeyD'] || keys['ArrowRight']) m.jailEscapePlayerX += 3;
    m.jailEscapePlayerX = clamp(m.jailEscapePlayerX, 10, 290);
    m.jailEscapePlayerY = clamp(m.jailEscapePlayerY, 10, 170);
    for (var jei = 0; jei < m.jailEscapePrisoners.length; jei++) {
      var jp = m.jailEscapePrisoners[jei];
      if (jp.escaped || jp.blocked) continue;
      jp.y += jp.speed;
      jp.x += randF(-0.5, 0.5);
      if (jp.y > 180) { jp.escaped = true; m.jailEscapeEscaped++; }
    }
    if (consumeKey('Space')) {
      for (var jbi = 0; jbi < m.jailEscapePrisoners.length; jbi++) {
        var jb = m.jailEscapePrisoners[jbi];
        if (!jb.escaped && !jb.blocked && Math.hypot(m.jailEscapePlayerX - jb.x, m.jailEscapePlayerY - jb.y) < 25) {
          jb.blocked = true;
          m.jailEscapeBlocked++;
          showNotification('Prisoner recaptured! (' + m.jailEscapeBlocked + ')');
          break;
        }
      }
    }
    var allDone = true;
    for (var jdi = 0; jdi < m.jailEscapePrisoners.length; jdi++) {
      if (!m.jailEscapePrisoners[jdi].escaped && !m.jailEscapePrisoners[jdi].blocked) allDone = false;
    }
    if (allDone || m.jailEscapeTimer <= 0) {
      var jailReward = m.jailEscapeBlocked * 20;
      game.gold += jailReward;
      game.totalGoldEarned += jailReward;
      if (m.jailEscapeEscaped > 0) game.reputation = clamp(game.reputation - m.jailEscapeEscaped * 3, 0, REPUTATION_MAX);
      if (m.jailEscapeBlocked > m.jailEscapeEscaped) game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('Jail break over! Blocked ' + m.jailEscapeBlocked + ', escaped ' + m.jailEscapeEscaped + '. +$' + jailReward);
      endMinigame('jailEscape', m.jailEscapeEscaped === 0, 150);
    }
    if (consumeKey('Escape') && m.jailEscape) {
      endMinigame('jailEscape', false, 60);
      showNotification('Gave up on the jail break.');
    }
  }

  // ════════════════════════════════════════
  // 28. CARD SLINGER (Blackjack)
  // ════════════════════════════════════════
  if (m.cardSlinger) {
    if (m.cardSlingerPhase === 0) {
      var pv = handValue(m.cardSlingerHand);
      if (consumeKey('Digit1')) {
        m.cardSlingerHand.push(m._bjDeck.pop());
        pv = handValue(m.cardSlingerHand);
        showNotification('Hit! Hand: ' + pv);
        if (pv > 21) {
          showNotification('BUST! Lost $' + m.cardSlingerBet);
          m.cardSlingerPhase = 1;
          m._bjResultTimer = 1.5;
        }
      }
      if (consumeKey('Digit2')) {
        // Dealer draws to 17
        while (handValue(m.cardSlingerDealer) < 17) m.cardSlingerDealer.push(m._bjDeck.pop());
        var dv = handValue(m.cardSlingerDealer);
        if (dv > 21 || pv > dv) {
          game.gold += m.cardSlingerBet * 2;
          game.totalGoldEarned += m.cardSlingerBet * 2;
          m.cardSlingerWins++;
          showNotification('You win! ' + pv + ' vs ' + dv + '! +$' + (m.cardSlingerBet * 2));
        } else if (pv === dv) {
          game.gold += m.cardSlingerBet;
          showNotification('Push! ' + pv + ' vs ' + dv);
        } else {
          showNotification('Dealer wins! ' + pv + ' vs ' + dv + '. Lost $' + m.cardSlingerBet);
        }
        m.cardSlingerPhase = 1;
        m._bjResultTimer = 2;
      }
      if (consumeKey('Digit3') && m.cardSlingerHand.length === 2 && game.gold >= m.cardSlingerBet) {
        game.gold -= m.cardSlingerBet;
        m.cardSlingerBet *= 2;
        m.cardSlingerHand.push(m._bjDeck.pop());
        pv = handValue(m.cardSlingerHand);
        while (handValue(m.cardSlingerDealer) < 17) m.cardSlingerDealer.push(m._bjDeck.pop());
        var dv2 = handValue(m.cardSlingerDealer);
        if (pv > 21) {
          showNotification('BUST on double! Lost $' + m.cardSlingerBet);
        } else if (dv2 > 21 || pv > dv2) {
          game.gold += m.cardSlingerBet * 2;
          game.totalGoldEarned += m.cardSlingerBet * 2;
          m.cardSlingerWins++;
          showNotification('Double down WIN! +$' + (m.cardSlingerBet * 2));
        } else {
          showNotification('Double down loss! ' + pv + ' vs ' + dv2);
        }
        m.cardSlingerPhase = 1;
        m._bjResultTimer = 2;
      }
    } else if (m.cardSlingerPhase === 1) {
      m._bjResultTimer -= dt;
      if (m._bjResultTimer <= 0) {
        m.cardSlingerRound++;
        if (m.cardSlingerRound > 5) {
          showNotification('Blackjack over! Won ' + m.cardSlingerWins + '/5 rounds!');
          endMinigame('cardSlinger', m.cardSlingerWins >= 3, 60);
        } else if (game.gold >= 25) {
          m.cardSlingerBet = 25;
          game.gold -= 25;
          m._bjDeck = newDeck();
          m.cardSlingerHand = [m._bjDeck.pop(), m._bjDeck.pop()];
          m.cardSlingerDealer = [m._bjDeck.pop(), m._bjDeck.pop()];
          m.cardSlingerPhase = 0;
          showNotification('Round ' + m.cardSlingerRound + '! Hand: ' + handValue(m.cardSlingerHand) + '. 1=Hit, 2=Stand, 3=Double.');
        } else {
          showNotification('Out of gold! Blackjack over.');
          endMinigame('cardSlinger', false, 60);
        }
      }
    }
    if (consumeKey('Escape') && m.cardSlinger) {
      endMinigame('cardSlinger', false, 30);
      showNotification('Left the table.');
    }
  }

  // ════════════════════════════════════════
  // 29. SHOOTOUT AT SUNDOWN
  // ════════════════════════════════════════
  if (m.sundownShootout) {
    if (m.sundownPhase === 0) {
      m.sundownTimer -= dt;
      if (m.sundownTimer <= 0) { m.sundownPhase = 1; showNotification('Wave ' + m.sundownWave + '!'); }
    } else if (m.sundownPhase === 1) {
      m.sundownTimer += dt;
      m._sunAimX = m._sunAimX || 150;
      m._sunAimY = m._sunAimY || 90;
      if (keys['KeyW'] || keys['ArrowUp']) m._sunAimY -= 4;
      if (keys['KeyS'] || keys['ArrowDown']) m._sunAimY += 4;
      if (keys['KeyA'] || keys['ArrowLeft']) m._sunAimX -= 4;
      if (keys['KeyD'] || keys['ArrowRight']) m._sunAimX += 4;
      m._sunAimX = clamp(m._sunAimX, 10, 290);
      m._sunAimY = clamp(m._sunAimY, 10, 170);
      // Enemy movement
      var seWrite = 0;
      for (var sei = 0; sei < m.sundownEnemies.length; sei++) {
        var se = m.sundownEnemies[sei];
        if (se.hp <= 0) { m.sundownScore++; continue; }
        m.sundownEnemies[seWrite++] = se;
        se.x += (150 - se.x) * 0.008 * se.speed;
        se.attackTimer -= dt;
        if (se.attackTimer <= 0 && Math.abs(se.x - 150) < 100) {
          se.attackTimer = randF(1.5, 3.5);
          if (!game._cheatMode) p.hp -= 1;
        }
      }
      m.sundownEnemies.length = seWrite;
      if (consumeKey('Space') && m.sundownAmmo > 0) {
        m.sundownAmmo--;
        if (typeof audio !== 'undefined' && audio.playGunshot) audio.playGunshot();
        for (var shi = 0; shi < m.sundownEnemies.length; shi++) {
          var sh = m.sundownEnemies[shi];
          if (sh.hp > 0 && Math.hypot(m._sunAimX - sh.x, m._sunAimY - sh.y) < 20) {
            sh.hp--; break;
          }
        }
      }
      if (m.sundownEnemies.length === 0) {
        m.sundownWave++;
        if (m.sundownWave > 3) {
          var sunReward = 200 + m.sundownScore * 15;
          game.gold += sunReward;
          game.totalGoldEarned += sunReward;
          game.reputation = clamp(game.reputation + 12, 0, REPUTATION_MAX);
          showNotification('SUNDOWN SURVIVED! +$' + sunReward + ' +12 Rep! Kills: ' + m.sundownScore);
          if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
          endMinigame('sundownShootout', true, 300);
        } else {
          m.sundownAmmo += 6;
          for (var nwi2 = 0; nwi2 < 4 + m.sundownWave * 2; nwi2++) {
            m.sundownEnemies.push({
              x: Math.random() < 0.5 ? rand(-10, 20) : rand(280, 310),
              y: rand(30, 150), hp: 2 + Math.floor(m.sundownWave / 2), speed: randF(0.5 + m.sundownWave * 0.3, 2),
              attackTimer: randF(1.5, 3)
            });
          }
          showNotification('Wave ' + m.sundownWave + '! +6 ammo. ' + m.sundownAmmo + ' rounds left.');
        }
      }
      if (m.sundownAmmo <= 0 && m.sundownEnemies.length > 0) {
        showNotification('Out of ammo! Score: ' + m.sundownScore);
        endMinigame('sundownShootout', false, 200);
      }
    }
    if (consumeKey('Escape') && m.sundownShootout) {
      endMinigame('sundownShootout', false, 120);
      showNotification('Fled the shootout.');
    }
  }

  // ════════════════════════════════════════
  // 30. TREASURE MAP PUZZLE (Sliding puzzle)
  // ════════════════════════════════════════
  if (m.treasurePuzzle) {
    m.treasurePuzzleTimer -= dt;
    var emptyI = m.treasurePuzzleGrid.indexOf(0);
    var eRow = Math.floor(emptyI / 3), eCol = emptyI % 3;
    // WASD slides tile INTO the empty space
    if (consumeKey('KeyW') || consumeKey('ArrowUp')) {
      if (eRow < 2) { m.treasurePuzzleGrid[emptyI] = m.treasurePuzzleGrid[emptyI + 3]; m.treasurePuzzleGrid[emptyI + 3] = 0; m.treasurePuzzleMoves++; }
    }
    if (consumeKey('KeyS') || consumeKey('ArrowDown')) {
      if (eRow > 0) { m.treasurePuzzleGrid[emptyI] = m.treasurePuzzleGrid[emptyI - 3]; m.treasurePuzzleGrid[emptyI - 3] = 0; m.treasurePuzzleMoves++; }
    }
    if (consumeKey('KeyA') || consumeKey('ArrowLeft')) {
      if (eCol < 2) { m.treasurePuzzleGrid[emptyI] = m.treasurePuzzleGrid[emptyI + 1]; m.treasurePuzzleGrid[emptyI + 1] = 0; m.treasurePuzzleMoves++; }
    }
    if (consumeKey('KeyD') || consumeKey('ArrowRight')) {
      if (eCol > 0) { m.treasurePuzzleGrid[emptyI] = m.treasurePuzzleGrid[emptyI - 1]; m.treasurePuzzleGrid[emptyI - 1] = 0; m.treasurePuzzleMoves++; }
    }
    // Check solved
    var solved = true;
    for (var chi2 = 0; chi2 < 8; chi2++) {
      if (m.treasurePuzzleGrid[chi2] !== chi2 + 1) { solved = false; break; }
    }
    if (solved) {
      game.gold += m.treasurePuzzleReward;
      game.totalGoldEarned += m.treasurePuzzleReward;
      game.reputation = clamp(game.reputation + 5, 0, REPUTATION_MAX);
      showNotification('PUZZLE SOLVED in ' + m.treasurePuzzleMoves + ' moves! +$' + m.treasurePuzzleReward + ' +5 Rep!');
      if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
      addJournalEntry('Solved a treasure map puzzle for $' + m.treasurePuzzleReward);
      endMinigame('treasurePuzzle', true, 250);
    }
    if (m.treasurePuzzleTimer <= 0) {
      showNotification('Puzzle timed out! Map crumbled to dust.');
      endMinigame('treasurePuzzle', false, 250);
    }
    if (consumeKey('Escape') && m.treasurePuzzle) {
      endMinigame('treasurePuzzle', false, 120);
      showNotification('Discarded the puzzle.');
    }
  }

  // ════════════════════════════════════════
  // FEATURE 162: FORGERY DETECTION
  // ════════════════════════════════════════
  _initForgeryMinigame();
  if (m.forgeryCooldown > 0) m.forgeryCooldown -= dt;
  if (m.forgery) _updateForgery(dt);
}

// ============================================================
// RENDER MINIGAMES OVERLAY
// ============================================================
function renderMinigamesOverlay() {
  // Render menu if open
  if (game._minigameMenuOpen) {
    renderMinigameMenu();
    return;
  }
  if (!game._minigames || !game._minigames.activeMinigame) return;
  var m = game._minigames;
  var w = gameCanvas.width, h = gameCanvas.height;
  var mg = m.activeMinigame;

  // Semi-transparent background for all minigames
  ctx.fillStyle = 'rgba(15, 10, 5, 0.85)';
  ctx.fillRect(w / 2 - 160, 30, 320, 200);
  ctx.strokeStyle = '#aa8844';
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 160, 30, 320, 200);

  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';

  // ── TRAIN HEIST ──
  if (mg === 'trainHeist' && m.trainHeist) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('TRAIN HEIST', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    if (m.trainHeistPhase === 0) {
      ctx.fillText('Fight the guards! Mash SPACE!', w / 2, 70);
      ctx.fillText('Guards remaining: ' + Math.ceil(Math.max(0, m.trainHeistGuards)), w / 2, 85);
      // Guard bar
      ctx.fillStyle = '#442222';
      ctx.fillRect(w / 2 - 80, 95, 160, 12);
      ctx.fillStyle = '#cc4444';
      ctx.fillRect(w / 2 - 80, 95, Math.max(0, m.trainHeistGuards / 4) * 160, 12);
    } else if (m.trainHeistPhase === 1) {
      ctx.fillText('Crack the safe! Tap SPACE in rhythm!', w / 2, 70);
      ctx.fillText('Progress: ' + Math.min(100, Math.floor(m.trainHeistSafeProgress)) + '%', w / 2, 85);
      // Safe progress bar
      ctx.fillStyle = '#333';
      ctx.fillRect(w / 2 - 80, 95, 160, 12);
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(w / 2 - 80, 95, Math.min(1, m.trainHeistSafeProgress / 100) * 160, 12);
      // Sweet spot indicator
      var sweet = Math.abs(Math.sin(m.trainHeistTimer * 3));
      ctx.fillStyle = sweet > 0.7 ? '#00ff00' : '#ff4444';
      ctx.fillRect(w / 2 - 5, 115, 10, 10);
      ctx.fillStyle = '#aaa';
      ctx.fillText('Green = good timing', w / 2, 140);
      ctx.fillText('Time: ' + Math.ceil(30 - m.trainHeistTimer) + 's', w / 2, 155);
      if (m.trainHeistAlarm) { ctx.fillStyle = '#ff4444'; ctx.fillText('ALARM!', w / 2, 170); }
    } else {
      ctx.fillStyle = '#44ff44';
      ctx.fillText('Safe cracked! Press E to grab $' + m.trainHeistLoot + ' and escape!', w / 2, 70);
    }
  }

  // ── LASSO RODEO ──
  if (mg === 'lassoRodeo' && m.lassoRodeo) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('LASSO RODEO', w / 2, 50);
    ctx.font = '9px monospace';
    if (m.lassoRodeoPhase === 0) {
      ctx.fillStyle = '#ddd';
      ctx.fillText('Starting in ' + Math.ceil(m.lassoRodeoTimer) + '...', w / 2, 70);
    } else {
      ctx.fillStyle = '#ddd';
      ctx.fillText('Time: ' + Math.ceil(m.lassoRodeoTimer) + 's | Caught: ' + m.lassoRodeoScore + '/5', w / 2, 70);
      // Draw field
      for (var dti = 0; dti < m.lassoRodeoTargets.length; dti++) {
        var dt2 = m.lassoRodeoTargets[dti];
        var ox = w / 2 - 150 + dt2.x;
        var oy = 55 + dt2.y;
        if (dt2.caught) {
          ctx.fillStyle = '#666';
          ctx.fillText('X', ox, oy);
        } else {
          ctx.fillStyle = '#884422';
          ctx.beginPath(); ctx.arc(ox, oy, dt2.size / 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#aa6633';
          ctx.beginPath(); ctx.arc(ox, oy, dt2.size / 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      // Lasso cursor
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2 - 150 + m._lassoX, 55 + m._lassoY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.fillText('+', w / 2 - 150 + m._lassoX, 58 + m._lassoY);
    }
  }

  // ── QUICK DRAW TOURNAMENT ──
  if (mg === 'quickDrawTourney' && m.quickDrawTourney) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('QUICK DRAW TOURNAMENT', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Round ' + m.quickDrawRound + '/5 vs ' + m.quickDrawOpponent, w / 2, 70);
    ctx.fillText('Wins: ' + m.quickDrawWins, w / 2, 85);
    if (m.quickDrawPhase === 0) {
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('WAIT...', w / 2, 130);
    } else if (m.quickDrawPhase === 1) {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('DRAW!', w / 2, 130);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#ddd';
      ctx.fillText('Press SPACE NOW!', w / 2, 150);
    } else {
      ctx.fillStyle = '#aaa';
      ctx.fillText('Next round...', w / 2, 130);
    }
  }

  // ── CATTLE DEFENSE ──
  if (mg === 'cattleDefense' && m.cattleDefense) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('CATTLE DEFENSE', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.cattleDefenseTimer) + 's | Stolen: ' + m.cattleStolenCount + '/' + m.cattleCount, w / 2, 70);
    // Draw cattle
    for (var dci = 0; dci < m.cattlePositions.length; dci++) {
      var cp = m.cattlePositions[dci];
      var cpx = w / 2 - 150 + cp.x, cpy = 55 + cp.y;
      ctx.fillStyle = cp.alive ? '#ddbb88' : '#555';
      ctx.fillRect(cpx - 4, cpy - 3, 8, 6);
      if (cp.alive) { ctx.fillStyle = '#fff'; ctx.fillRect(cpx - 1, cpy - 5, 2, 3); }
    }
    // Rustlers
    for (var dri = 0; dri < m.cattleRustlers.length; dri++) {
      var dr = m.cattleRustlers[dri];
      if (dr.hp <= 0) continue;
      var drx = w / 2 - 150 + dr.x, dry = 55 + dr.y;
      ctx.fillStyle = '#cc3333';
      ctx.beginPath(); ctx.arc(drx, dry, 6, 0, Math.PI * 2); ctx.fill();
      if (dr.carrying) { ctx.fillStyle = '#ffd700'; ctx.fillText('!', drx, dry - 8); }
    }
    // Crosshair
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1;
    var cx = w / 2 - 150 + m._cattleAimX, cy = 55 + m._cattleAimY;
    ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); ctx.stroke();
  }

  // ── SALOON BRAWL ──
  if (mg === 'saloonBrawl' && m.saloonBrawl) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('SALOON BRAWL', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('HP: ' + m.saloonBrawlHP + ' | Score: ' + m.saloonBrawlScore + ' | Combo: x' + m.saloonBrawlCombo + ' | ' + Math.ceil(m.saloonBrawlTimer) + 's', w / 2, 70);
    // Player
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2 - 150 + m._brawlX, 55 + m._brawlY, 8, 0, Math.PI * 2); ctx.fill();
    if (m._brawlDodge > 0) { ctx.strokeStyle = '#44ffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w / 2 - 150 + m._brawlX, 55 + m._brawlY, 12, 0, Math.PI * 2); ctx.stroke(); }
    // Enemies
    for (var bei2 = 0; bei2 < m.saloonBrawlEnemies.length; bei2++) {
      var be = m.saloonBrawlEnemies[bei2];
      if (be.hp <= 0) continue;
      ctx.fillStyle = be.stunTimer > 0 ? '#888' : '#cc4444';
      ctx.beginPath(); ctx.arc(w / 2 - 150 + be.x, 55 + be.y, 7, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── STAGECOACH DEFENSE ──
  if (mg === 'stagecoachDefense' && m.stagecoachDefense) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('STAGECOACH DEFENSE', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Coach HP: ' + m.stagecoachHP + ' | Ammo: ' + m.stagecoachAmmo + ' | Distance: ' + Math.floor(m.stagecoachDistance) + '/500', w / 2, 70);
    // Progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 100, 78, 200, 8);
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(w / 2 - 100, 78, Math.min(1, m.stagecoachDistance / 500) * 200, 8);
    // Coach
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(w / 2 - 20, 140, 40, 20);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(w / 2 - 25, 145, 50, 12);
    // Bandits
    for (var dbi = 0; dbi < m.stagecoachBandits.length; dbi++) {
      var db = m.stagecoachBandits[dbi];
      if (db.hp <= 0) continue;
      ctx.fillStyle = '#cc3333';
      ctx.beginPath(); ctx.arc(w / 2 - 150 + db.x, 55 + db.y, 6, 0, Math.PI * 2); ctx.fill();
    }
    // Crosshair
    ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1;
    var scx = w / 2 - 150 + m._stageAimX, scy = 55 + m._stageAimY;
    ctx.beginPath(); ctx.moveTo(scx - 8, scy); ctx.lineTo(scx + 8, scy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(scx, scy - 8); ctx.lineTo(scx, scy + 8); ctx.stroke();
  }

  // ── DYNAMITE DEFUSAL ──
  if (mg === 'dynamiteDefusal' && m.dynamiteDefusal) {
    ctx.fillStyle = '#ff4444';
    ctx.fillText('DYNAMITE DEFUSAL', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.dynamiteDefusalTimer) + 's', w / 2, 70);
    // Draw wires
    var wireColors = ['#ff3333', '#3333ff', '#33ff33', '#ffff33'];
    for (var dwi2 = 0; dwi2 < m.dynamiteWires.length; dwi2++) {
      var wx = w / 2 - 75 + dwi2 * 50;
      ctx.strokeStyle = wireColors[dwi2];
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(wx, 90); ctx.lineTo(wx, 140); ctx.stroke();
      ctx.fillStyle = '#ddd';
      ctx.fillText('[' + (dwi2 + 1) + '] ' + m.dynamiteWires[dwi2].color, wx, 160);
    }
    // Hint based on correct wire color
    ctx.fillStyle = '#aaa';
    var hintColor = m.dynamiteWires[m.dynamiteCorrectWire].color;
    var hintFirst = hintColor[0];
    ctx.fillText('Hint: starts with "' + hintFirst + '"', w / 2, 180);
    // Pulsing danger
    ctx.fillStyle = 'rgba(255,0,0,' + (0.3 + Math.sin(Date.now() / 200) * 0.3) + ')';
    ctx.fillRect(w / 2 - 30, 90, 60, 30);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TNT', w / 2, 110);
  }

  // ── KNIFE THROWING ──
  if (mg === 'knifeContest' && m.knifeContest) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('KNIFE THROWING', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Round ' + (m.knifeContestRound + 1) + '/5 | Score: ' + m.knifeContestScore, w / 2, 70);
    // Target
    var tx = w / 2 + 70, ty = 130;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx, ty, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(tx, ty, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
    if (m.knifeContestPhase < 2) {
      // Angle indicator
      var aRad = m.knifeContestAngle * Math.PI / 180;
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w / 2 - 120, 180); ctx.lineTo(w / 2 - 120 + Math.cos(aRad) * 60, 180 - Math.sin(aRad) * 60); ctx.stroke();
      if (m.knifeContestPhase === 1) {
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(w / 2 - 130, 185, m.knifeContestPower * 1.2, 8);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(w / 2 - 130, 185, 120, 8);
      }
    }
  }

  // ── HORSESHOE TOSS ──
  if (mg === 'horseshoeToss' && m.horseshoeToss) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('HORSESHOE TOSS', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Round ' + (m.horseshoeRound + 1) + '/5 | Score: ' + m.horseshoeScore, w / 2, 70);
    // Stake
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(w / 2 + 80, 100, 4, 50);
    // Angle/power indicators
    if (!m.horseshoeFlying) {
      var haRad = m.horseshoeAngle * Math.PI / 180;
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w / 2 - 100, 180); ctx.lineTo(w / 2 - 100 + Math.cos(haRad) * 50, 180 - Math.sin(haRad) * 50); ctx.stroke();
      if (m.horseshoePhase === 1) {
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(w / 2 - 110, 185, m.horseshoePower * 1.2, 8);
      }
    }
  }

  // ── SHARPSHOOTING ──
  if (mg === 'sharpshootContest' && m.sharpshootContest) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('SHARPSHOOTING CONTEST', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.sharpshootTimer) + 's | Score: ' + m.sharpshootScore + ' | Misses: ' + m.sharpshootMisses, w / 2, 70);
    // Targets
    for (var dsti = 0; dsti < m.sharpshootTargets.length; dsti++) {
      var dst = m.sharpshootTargets[dsti];
      if (dst.hp <= 0) continue;
      var stx = w / 2 - 150 + dst.x, sty = 55 + dst.y;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(stx, sty, dst.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(stx, sty, dst.size * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(stx, sty, dst.size * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    // Crosshair
    ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1;
    var shx = w / 2 - 150 + m._sharpAimX, shy = 55 + m._sharpAimY;
    ctx.beginPath(); ctx.moveTo(shx - 10, shy); ctx.lineTo(shx + 10, shy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(shx, shy - 10); ctx.lineTo(shx, shy + 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(shx, shy, 8, 0, Math.PI * 2); ctx.stroke();
  }

  // ── HIDEOUT RAID ──
  if (mg === 'hideoutRaid' && m.hideoutRaid) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('BANDIT HIDEOUT — Room ' + (m.hideoutRoom + 1) + '/' + m.hideoutRooms, w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('HP: ' + m.hideoutHP + ' | Loot: $' + m.hideoutLoot, w / 2, 70);
    // Room walls
    ctx.strokeStyle = '#665533'; ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 150, 80, 300, 140);
    // Player
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2 - 150 + m.hideoutPlayerX, 80 + m.hideoutPlayerY, 6, 0, Math.PI * 2); ctx.fill();
    // Enemies
    for (var hei2 = 0; hei2 < m.hideoutEnemies.length; hei2++) {
      var he2 = m.hideoutEnemies[hei2];
      if (he2.hp <= 0) continue;
      ctx.fillStyle = '#cc3333';
      ctx.beginPath(); ctx.arc(w / 2 - 150 + he2.x, 80 + he2.y, 5, 0, Math.PI * 2); ctx.fill();
    }
    var allCleared = true;
    for (var aci2 = 0; aci2 < m.hideoutEnemies.length; aci2++) if (m.hideoutEnemies[aci2].hp > 0) allCleared = false;
    if (allCleared) {
      ctx.fillStyle = '#44ff44';
      ctx.fillText('Room cleared! Press E to advance.', w / 2, 215);
    }
  }

  // ── BRONCO RIDING ──
  if (mg === 'rodeoBronco' && m.rodeoBronco) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('BRONCO RIDING', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + m.rodeoBroncoTimer.toFixed(1) + 's / 8.0s', w / 2, 70);
    // Balance bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 100, 90, 200, 20);
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(w / 2 - 100 + 70, 90, 60, 20); // safe zone
    ctx.fillStyle = '#ff4444';
    var balX = (m.rodeoBroncoBalance / 100) * 200;
    ctx.fillRect(w / 2 - 100 + balX - 3, 88, 6, 24);
    ctx.fillStyle = '#ddd';
    ctx.fillText('A/D to balance — Stay centered!', w / 2, 130);
    // Horse
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(w / 2 - 15, 145, 30, 20);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(w / 2 - 10, 140, 20, 10);
    var bOff = Math.sin(m.rodeoBroncoTimer * 8) * 5;
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2, 140 + bOff, 6, 0, Math.PI * 2); ctx.fill();
  }

  // ── TELEGRAPH DECODE ──
  if (mg === 'telegraphDecode' && m.telegraphDecode) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('TELEGRAPH DECODER', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.telegraphTimer) + 's | Round: ' + (m.telegraphRound + 1) + '/3', w / 2, 70);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffaa44';
    // Show word with typed letters highlighted
    var display = '';
    for (var tdi2 = 0; tdi2 < m.telegraphMessage.length; tdi2++) {
      if (tdi2 < m.telegraphInput.length) display += m.telegraphMessage[tdi2];
      else display += '_';
    }
    ctx.fillText(display, w / 2, 120);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Type: ' + m.telegraphMessage, w / 2, 145);
    ctx.fillText('Score: ' + m.telegraphScore, w / 2, 165);
  }

  // ── VAULT CRACKING ──
  if (mg === 'vaultCrack' && m.vaultCrack) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('VAULT CRACKING', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.vaultTimer) + 's | Tumbler: ' + (m.vaultCurrentDial + 1) + '/3', w / 2, 70);
    // Draw dial
    ctx.strokeStyle = '#aa8844'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w / 2, 130, 40, 0, Math.PI * 2); ctx.stroke();
    // Dial position
    var dAngle = (m.vaultDials[m.vaultCurrentDial] / 100) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w / 2, 130); ctx.lineTo(w / 2 + Math.cos(dAngle) * 35, 130 + Math.sin(dAngle) * 35); ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.fillText('A/D to turn, SPACE to lock', w / 2, 185);
    ctx.fillText('Dial value: ' + Math.floor(m.vaultDials[m.vaultCurrentDial]), w / 2, 200);
  }

  // ── TOWN DEFENSE ──
  if (mg === 'townDefense' && m.townDefense) {
    ctx.fillStyle = '#ff4444';
    ctx.fillText('TOWN DEFENSE — Wave ' + m.townDefenseWave + '/3', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Town HP: ' + m.townDefenseHP + ' | Kills: ' + m.townDefenseKills, w / 2, 70);
    // Town (center)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(w / 2 - 20, 125, 40, 30);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(w / 2 - 25, 130, 50, 20);
    // Enemies
    for (var tei2 = 0; tei2 < m.townDefenseEnemies.length; tei2++) {
      var te2 = m.townDefenseEnemies[tei2];
      if (te2.hp <= 0) continue;
      ctx.fillStyle = '#cc3333';
      ctx.beginPath(); ctx.arc(w / 2 - 150 + te2.x, 55 + te2.y, 5, 0, Math.PI * 2); ctx.fill();
    }
    // Crosshair
    ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1;
    var tdcx = w / 2 - 150 + m._townAimX, tdcy = 55 + m._townAimY;
    ctx.beginPath(); ctx.moveTo(tdcx - 8, tdcy); ctx.lineTo(tdcx + 8, tdcy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tdcx, tdcy - 8); ctx.lineTo(tdcx, tdcy + 8); ctx.stroke();
  }

  // ── POSTER MATCH ──
  if (mg === 'posterMatch' && m.posterMatch) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('WANTED POSTER MATCH', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.posterMatchTimer) + 's | Matched: ' + m.posterMatchMatched + '/8 | Moves: ' + m.posterMatchMoves, w / 2, 70);
    // 4x4 grid
    for (var pgi = 0; pgi < 16; pgi++) {
      var pgr = Math.floor(pgi / 4), pgc = pgi % 4;
      var pgx = w / 2 - 80 + pgc * 40, pgy = 85 + pgr * 28;
      var pc = m.posterMatchCards[pgi];
      ctx.strokeStyle = pgi === m._posterCursor ? '#ffd700' : '#665533';
      ctx.lineWidth = pgi === m._posterCursor ? 2 : 1;
      ctx.strokeRect(pgx, pgy, 36, 24);
      if (pc.revealed || pc.matched) {
        ctx.fillStyle = pc.matched ? '#44cc44' : '#aa8844';
        ctx.fillRect(pgx + 1, pgy + 1, 34, 22);
        ctx.fillStyle = '#fff';
        ctx.font = '7px monospace';
        ctx.fillText(pc.name.substring(0, 6), pgx + 18, pgy + 15);
        ctx.font = '9px monospace';
      } else {
        ctx.fillStyle = '#332211';
        ctx.fillRect(pgx + 1, pgy + 1, 34, 22);
        ctx.fillStyle = '#665533';
        ctx.fillText('?', pgx + 18, pgy + 15);
      }
    }
  }

  // ── SUPPLY RUN ──
  if (mg === 'supplyRun' && m.supplyRun) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('SUPPLY RUN', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Distance: ' + Math.floor(m.supplyRunDistance) + '/1000 | HP: ' + m.supplyRunHP + ' | Score: ' + m.supplyRunScore, w / 2, 70);
    // Progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 100, 78, 200, 6);
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(w / 2 - 100, 78, Math.min(1, m.supplyRunDistance / 1000) * 200, 6);
    // Lanes
    for (var sli = 0; sli < 3; sli++) {
      var ly = 100 + sli * 40;
      ctx.strokeStyle = '#554433'; ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 - 140, ly, 280, 35);
      // Player wagon in current lane
      if (sli === m.supplyRunLane) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(w / 2 - 120, ly + 8, 25, 18);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(w / 2 - 117, ly + 10, 8, 5);
      }
    }
    // Obstacles
    for (var soi = 0; soi < m.supplyRunObstacles.length; soi++) {
      var so = m.supplyRunObstacles[soi];
      var sox = w / 2 - 140 + so.x * 280 / 320;
      var soy = 100 + so.lane * 40 + 17;
      if (so.type === 'coin') { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(sox, soy, 5, 0, Math.PI * 2); ctx.fill(); }
      else if (so.type === 'rock') { ctx.fillStyle = '#888'; ctx.fillRect(sox - 6, soy - 5, 12, 10); }
      else if (so.type === 'bandit') { ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(sox, soy, 6, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillStyle = '#338833'; ctx.fillRect(sox - 3, soy - 8, 6, 16); }
    }
  }

  // ── SNAKE ROUNDUP ──
  if (mg === 'snakeRoundup' && m.snakeRoundup) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('RATTLESNAKE ROUNDUP', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.snakeRoundupTimer) + 's | Caught: ' + m.snakeRoundupCaught + '/8 | Bitten: ' + m.snakeRoundupBitten, w / 2, 70);
    // Player
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2 - 150 + m.snakeRoundupPlayerX, 55 + m.snakeRoundupPlayerY, 7, 0, Math.PI * 2); ctx.fill();
    // Snakes
    for (var dsi2 = 0; dsi2 < m.snakeRoundupSnakes.length; dsi2++) {
      var ds = m.snakeRoundupSnakes[dsi2];
      if (ds.caught) continue;
      var snx = w / 2 - 150 + ds.x, sny = 55 + ds.y;
      ctx.fillStyle = '#44aa44';
      ctx.beginPath();
      ctx.moveTo(snx, sny);
      ctx.quadraticCurveTo(snx + 6, sny - 4, snx + 12, sny);
      ctx.quadraticCurveTo(snx + 6, sny + 4, snx, sny);
      ctx.fill();
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(snx + 11, sny - 1, 3, 2);
    }
  }

  // ── GOLD AUCTION ──
  if (mg === 'goldAuction' && m.goldAuction) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('GOLD RUSH AUCTION', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    var aItem = m.goldAuctionItems[m.goldAuctionCurrent];
    if (aItem) {
      ctx.fillText('Item ' + (m.goldAuctionCurrent + 1) + '/5: ' + aItem.name, w / 2, 75);
      ctx.fillText('Current bid: $' + m.goldAuctionBid + ' | Your gold: $' + game.gold, w / 2, 95);
      ctx.fillText('Time: ' + Math.ceil(m.goldAuctionTimer) + 's', w / 2, 115);
      ctx.fillStyle = '#aaa';
      ctx.fillText('D = Bid up | SPACE = Buy | S = Pass', w / 2, 140);
      ctx.fillText('Won so far: ' + m.goldAuctionWon.length + ' items', w / 2, 160);
    }
  }

  // ── MOONSHINE BUST ──
  if (mg === 'moonshineBust' && m.moonshineBust) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('MOONSHINE BUST', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.moonshineTimer) + 's | Search locations with 1-6', w / 2, 70);
    for (var mli2 = 0; mli2 < m.moonshineLocations.length; mli2++) {
      var ml = m.moonshineLocations[mli2];
      ctx.fillStyle = ml.searched ? '#666' : '#ccaa66';
      ctx.fillText('[' + (mli2 + 1) + '] ' + ml.name + (ml.searched ? ' (searched)' : ''), w / 2, 95 + mli2 * 18);
    }
  }

  // ── PROSPECTOR'S CLAIM ──
  if (mg === 'prospectorClaim' && m.prospectorClaim) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('PROSPECTOR\'S CLAIM', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.prospectorTimer) + 's | Gold: $' + m.prospectorGold + ' | Tool: ' + (m.prospectorTool === 0 ? 'Pickaxe' : 'Dynamite'), w / 2, 70);
    // Player
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2 - 150 + m._prospectX, 55 + m._prospectY, 6, 0, Math.PI * 2); ctx.fill();
    // Rocks
    for (var dri2 = 0; dri2 < m.prospectorRocks.length; dri2++) {
      var dr2 = m.prospectorRocks[dri2];
      if (dr2.mined) continue;
      ctx.fillStyle = dr2.hasGold ? '#887744' : '#777';
      ctx.fillRect(w / 2 - 150 + dr2.x - 6, 55 + dr2.y - 5, 12, 10);
    }
  }

  // ── POKER TOURNAMENT ──
  if (mg === 'pokerTourney' && m.pokerTourney) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('POKER TOURNAMENT — Round ' + m.pokerTourneyRound + '/5', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Chips: $' + m.pokerTourneyChips + ' | Pot: $' + m.pokerTourneyPot, w / 2, 70);
    if (m.pokerTourneyPhase === 0) {
      // Show hand
      for (var phi2 = 0; phi2 < m.pokerTourneyHand.length; phi2++) {
        var pc2 = m.pokerTourneyHand[phi2];
        var held = m.pokerTourneyHeld.indexOf(phi2) >= 0;
        var pcx = w / 2 - 100 + phi2 * 45;
        ctx.fillStyle = held ? '#44aa44' : '#ddd';
        ctx.fillRect(pcx, 90, 38, 50);
        ctx.fillStyle = pc2.suit === 'Hearts' || pc2.suit === 'Diamonds' ? '#cc3333' : '#333';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(pc2.rank, pcx + 19, 108);
        ctx.font = '7px monospace';
        ctx.fillText(pc2.suit[0], pcx + 19, 125);
        ctx.font = '9px monospace';
        if (held) { ctx.fillStyle = '#ffd700'; ctx.fillText('HOLD', pcx + 19, 85); }
        ctx.fillStyle = '#aaa';
        ctx.fillText('[' + (phi2 + 1) + ']', pcx + 19, 148);
      }
      ctx.fillStyle = '#ddd';
      ctx.fillText('Hand value: ' + handValue(m.pokerTourneyHand) + ' | 1-5=Hold SPACE=Draw D=Raise', w / 2, 170);
    }
  }

  // ── HIGH NOON STANDOFF ──
  if (mg === 'highNoonStandoff' && m.highNoonStandoff) {
    ctx.fillStyle = '#ff4444';
    ctx.fillText('HIGH NOON STANDOFF', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Ammo: ' + m.highNoonShots + ' | Score: ' + m.highNoonScore + '/4', w / 2, 70);
    if (m.highNoonPhase === 0) {
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('WAIT... ' + Math.ceil(m.highNoonTimer) + 's', w / 2, 130);
    } else {
      // Draw circle with enemies
      ctx.strokeStyle = '#665533'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(w / 2, 130, 60, 0, Math.PI * 2); ctx.stroke();
      // Player at center
      ctx.fillStyle = '#44aaff';
      ctx.beginPath(); ctx.arc(w / 2, 130, 6, 0, Math.PI * 2); ctx.fill();
      // Aim line
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w / 2, 130);
      ctx.lineTo(w / 2 + Math.cos(m.highNoonPlayerAngle) * 55, 130 + Math.sin(m.highNoonPlayerAngle) * 55);
      ctx.stroke();
      // Enemies around circle
      for (var eni2 = 0; eni2 < m.highNoonEnemies.length; eni2++) {
        var en2 = m.highNoonEnemies[eni2];
        var enx = w / 2 + Math.cos(en2.angle) * 55, eny = 130 + Math.sin(en2.angle) * 55;
        ctx.fillStyle = en2.hp > 0 ? (en2.drawing ? '#ff4444' : '#cc6633') : '#555';
        ctx.beginPath(); ctx.arc(enx, eny, 8, 0, Math.PI * 2); ctx.fill();
        if (en2.drawing && en2.hp > 0) { ctx.fillStyle = '#ff0000'; ctx.fillText('!', enx, eny - 12); }
      }
    }
  }

  // ── WAGON REPAIR ──
  if (mg === 'wagonRepair' && m.wagonRepair) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('WAGON WHEEL REPAIR', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.wagonRepairTimer) + 's | Progress: ' + Math.min(100, m.wagonRepairProgress) + '%', w / 2, 70);
    // Hammer position (oscillating bar)
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 100, 90, 200, 20);
    // Sweet spot
    var sweetX = (m.wagonRepairTarget / 100) * 200;
    ctx.fillStyle = 'rgba(68,204,68,0.4)';
    ctx.fillRect(w / 2 - 100 + sweetX - 15, 90, 30, 20);
    // Hammer
    var hamVal = (Math.sin(m._hammerPos || 0) + 1) * 50;
    var hamX = (hamVal / 100) * 200;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(w / 2 - 100 + hamX - 3, 88, 6, 24);
    // Progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 80, 120, 160, 10);
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(w / 2 - 80, 120, Math.min(1, m.wagonRepairProgress / 100) * 160, 10);
    ctx.fillStyle = '#ddd';
    ctx.fillText('Hit SPACE when hammer is in the green zone!', w / 2, 150);
  }

  // ── CATTLE BRANDING ──
  if (mg === 'cattleBranding' && m.cattleBranding) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('CATTLE BRANDING', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.cattleBrandingTimer) + 's | Score: ' + m.cattleBrandingScore + ' | Round: ' + (m.cattleBrandingRound + 1) + '/8', w / 2, 70);
    ctx.fillStyle = '#ffaa44';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Brand needed: ' + m.cattleBrandingBrands[m.cattleBrandingTarget], w / 2, 100);
    ctx.font = '9px monospace';
    for (var cbi2 = 0; cbi2 < m.cattleBrandingBrands.length; cbi2++) {
      ctx.fillStyle = cbi2 === m.cattleBrandingSelected ? '#ffd700' : '#aaa';
      ctx.fillText('[' + (cbi2 + 1) + '] ' + m.cattleBrandingBrands[cbi2], w / 2, 125 + cbi2 * 16);
    }
    ctx.fillStyle = '#ddd';
    ctx.fillText('Select with 1-5, SPACE to brand', w / 2, 210);
  }

  // ── MEDICINE MAN ──
  if (mg === 'medicineMan' && m.medicineMan) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('MEDICINE MAN', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.medicineTimer) + 's | Score: ' + m.medicineScore + ' | Patient: ' + (m.medicineCurrentPatient + 1) + '/' + m.medicinePatients.length, w / 2, 70);
    if (m.medicineCurrentPatient < m.medicinePatients.length) {
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Ailment: ' + m.medicinePatients[m.medicineCurrentPatient].ailment, w / 2, 95);
      ctx.font = '9px monospace';
      var remedies = ['Willow Bark', 'Anti-venom', 'Splint', 'Honey Tea', 'Cool Cloth', 'Ginger Root'];
      for (var rmi2 = 0; rmi2 < remedies.length; rmi2++) {
        ctx.fillStyle = '#ccaa66';
        ctx.fillText('[' + (rmi2 + 1) + '] ' + remedies[rmi2], w / 2, 115 + rmi2 * 15);
      }
    }
  }

  // ── JAIL ESCAPE ──
  if (mg === 'jailEscape' && m.jailEscape) {
    ctx.fillStyle = '#ff4444';
    ctx.fillText('JAIL BREAK!', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.jailEscapeTimer) + 's | Blocked: ' + m.jailEscapeBlocked + ' | Escaped: ' + m.jailEscapeEscaped, w / 2, 70);
    // Jail area
    ctx.strokeStyle = '#665533'; ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 150, 80, 300, 140);
    // Exit line
    ctx.strokeStyle = '#cc3333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2 - 150, 225); ctx.lineTo(w / 2 + 150, 225); ctx.stroke();
    ctx.fillStyle = '#ff4444'; ctx.fillText('EXIT', w / 2, 228);
    // Player
    ctx.fillStyle = '#44aaff';
    ctx.beginPath(); ctx.arc(w / 2 - 150 + m.jailEscapePlayerX, 80 + m.jailEscapePlayerY, 7, 0, Math.PI * 2); ctx.fill();
    // Prisoners
    for (var jpi2 = 0; jpi2 < m.jailEscapePrisoners.length; jpi2++) {
      var jp2 = m.jailEscapePrisoners[jpi2];
      if (jp2.blocked || jp2.escaped) continue;
      ctx.fillStyle = '#cc8833';
      ctx.beginPath(); ctx.arc(w / 2 - 150 + jp2.x, 80 + jp2.y, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── BLACKJACK ──
  if (mg === 'cardSlinger' && m.cardSlinger) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('BLACKJACK — Round ' + m.cardSlingerRound + '/5', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Bet: $' + m.cardSlingerBet + ' | Wins: ' + m.cardSlingerWins, w / 2, 70);
    if (m.cardSlingerPhase === 0) {
      ctx.fillText('Your hand (' + handValue(m.cardSlingerHand) + '):', w / 2, 90);
      for (var bji = 0; bji < m.cardSlingerHand.length; bji++) {
        var bc = m.cardSlingerHand[bji];
        var bcx = w / 2 - 60 + bji * 35;
        ctx.fillStyle = '#ddd';
        ctx.fillRect(bcx, 98, 30, 40);
        ctx.fillStyle = bc.suit === 'Hearts' || bc.suit === 'Diamonds' ? '#cc3333' : '#333';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(bc.rank, bcx + 15, 115);
        ctx.font = '7px monospace';
        ctx.fillText(bc.suit[0], bcx + 15, 130);
        ctx.font = '9px monospace';
      }
      ctx.fillStyle = '#aaa';
      ctx.fillText('Dealer shows: ' + m.cardSlingerDealer[0].rank + ' of ' + m.cardSlingerDealer[0].suit, w / 2, 155);
      ctx.fillText('1=Hit 2=Stand 3=Double', w / 2, 175);
    }
  }

  // ── SUNDOWN SHOOTOUT ──
  if (mg === 'sundownShootout' && m.sundownShootout) {
    ctx.fillStyle = '#ff8844';
    ctx.fillText('SUNDOWN SHOOTOUT — Wave ' + m.sundownWave + '/3', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Ammo: ' + m.sundownAmmo + ' | Score: ' + m.sundownScore, w / 2, 70);
    if (m.sundownPhase === 0) {
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('INCOMING...', w / 2, 130);
    } else {
      // Enemies
      for (var sei2 = 0; sei2 < m.sundownEnemies.length; sei2++) {
        var se2 = m.sundownEnemies[sei2];
        if (se2.hp <= 0) continue;
        ctx.fillStyle = '#cc3333';
        ctx.beginPath(); ctx.arc(w / 2 - 150 + se2.x, 55 + se2.y, 6, 0, Math.PI * 2); ctx.fill();
      }
      // Crosshair
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1;
      var sux = w / 2 - 150 + m._sunAimX, suy = 55 + m._sunAimY;
      ctx.beginPath(); ctx.moveTo(sux - 8, suy); ctx.lineTo(sux + 8, suy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sux, suy - 8); ctx.lineTo(sux, suy + 8); ctx.stroke();
    }
  }

  // ── TREASURE PUZZLE ──
  if (mg === 'treasurePuzzle' && m.treasurePuzzle) {
    ctx.fillStyle = '#ffd700';
    ctx.fillText('TREASURE MAP PUZZLE', w / 2, 50);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#ddd';
    ctx.fillText('Time: ' + Math.ceil(m.treasurePuzzleTimer) + 's | Moves: ' + m.treasurePuzzleMoves + ' | Prize: $' + m.treasurePuzzleReward, w / 2, 70);
    // 3x3 grid
    for (var tpi = 0; tpi < 9; tpi++) {
      var tpr = Math.floor(tpi / 3), tpc = tpi % 3;
      var tpx = w / 2 - 55 + tpc * 38, tpy = 85 + tpr * 38;
      var val = m.treasurePuzzleGrid[tpi];
      if (val === 0) {
        ctx.fillStyle = '#221100';
        ctx.fillRect(tpx, tpy, 34, 34);
      } else {
        ctx.fillStyle = val === tpi + 1 ? '#44aa44' : '#886644';
        ctx.fillRect(tpx, tpy, 34, 34);
        ctx.strokeStyle = '#aa8844'; ctx.lineWidth = 1;
        ctx.strokeRect(tpx, tpy, 34, 34);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('' + val, tpx + 17, tpy + 22);
        ctx.font = '9px monospace';
      }
    }
    ctx.fillStyle = '#aaa';
    ctx.fillText('WASD to slide tiles', w / 2, 210);
  }

  // Forgery Detection
  if (mg === 'forgery') _renderForgery();

  ctx.textAlign = 'left';
}

// ============================================================
// FEATURE 162: FORGERY DETECTION MINIGAME
// Spot-the-difference on bank bills. Catch forgers for reward.
// ============================================================
function _initForgeryMinigame() {
  var m = game._minigames;
  if (m.forgery !== undefined) return;
  m.forgery = false;
  m.forgeryBills = [];
  m.forgerySelected = -1;
  m.forgeryTimer = 30;
  m.forgeryScore = 0;
  m.forgeryRound = 0;
  m.forgeryDifferences = [];
  m.forgeryCooldown = 0;
}

function _generateForgeryBill() {
  // Generate two "bills" as arrays of features — one real, one forged
  var features = [];
  var differences = [];
  var numFeatures = 8;
  for (var i = 0; i < numFeatures; i++) {
    features.push({
      x: 30 + rand(0, 140),
      y: 20 + rand(0, 60),
      type: rand(0, 3), // 0=line, 1=circle, 2=rect, 3=text
      size: rand(4, 12),
      color: ['#2a4a2a', '#4a2a2a', '#2a2a4a', '#4a4a2a'][rand(0, 3)]
    });
  }
  // Pick 2-3 features to change in the forged version
  var numDiffs = rand(2, 3);
  var diffIndices = [];
  while (diffIndices.length < numDiffs) {
    var idx = rand(0, numFeatures - 1);
    if (diffIndices.indexOf(idx) === -1) diffIndices.push(idx);
  }
  var forgedFeatures = JSON.parse(JSON.stringify(features));
  for (var di = 0; di < diffIndices.length; di++) {
    var fi = diffIndices[di];
    // Alter the feature
    forgedFeatures[fi].x += rand(-8, 8);
    forgedFeatures[fi].size += rand(-3, 3);
    forgedFeatures[fi].color = ['#3a5a3a', '#5a3a3a', '#3a3a5a', '#5a5a3a'][rand(0, 3)];
    differences.push({ index: fi, x: forgedFeatures[fi].x, y: forgedFeatures[fi].y });
  }
  return { real: features, forged: forgedFeatures, differences: differences, isLeft: Math.random() < 0.5 };
}

function startForgeryMinigame() {
  _initForgeryMinigame();
  var m = game._minigames;
  if (m.forgeryCooldown > 0) {
    showNotification('Forgery detection on cooldown.');
    return;
  }
  m.forgery = true;
  m.forgeryScore = 0;
  m.forgeryRound = 0;
  m.forgeryTimer = 30;
  m.forgerySelected = -1;
  m.forgeryBills = _generateForgeryBill();
  m.activeMinigame = 'forgery';
  game.state = 'minigame';
  showNotification('FORGERY DETECTION: Find the fake bill!');
}

function _updateForgery(dt) {
  var m = game._minigames;
  if (!m.forgery) return;
  m.forgeryTimer -= dt;
  if (m.forgeryTimer <= 0) {
    // Time up
    m.forgery = false;
    m.activeMinigame = null;
    m.forgeryCooldown = 60;
    game.state = 'playing';
    var reward = m.forgeryScore * 15;
    if (reward > 0) {
      game.gold += reward;
      game.totalGoldEarned += reward;
      addXP(m.forgeryScore * 20);
      showNotification('Forgery detection complete! ' + m.forgeryScore + ' caught, +$' + reward, 'good');
    } else {
      showNotification('Failed to catch any forgers.');
    }
    return;
  }
  // Cooldown decrement
  if (m.forgeryCooldown > 0) m.forgeryCooldown -= dt;

  // 1 = select left, 2 = select right
  if (consumeKey('Digit1')) m.forgerySelected = 0;
  if (consumeKey('Digit2')) m.forgerySelected = 1;
  if (consumeKey('KeyE') && m.forgerySelected >= 0) {
    // Check if selected the forged bill
    var isForged = (m.forgerySelected === 0 && !m.forgeryBills.isLeft) ||
                   (m.forgerySelected === 1 && m.forgeryBills.isLeft);
    if (isForged) {
      m.forgeryScore++;
      addFloatingText(game.player.x, game.player.y - 30, 'FORGERY FOUND!', '#44cc44');
      if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
    } else {
      addFloatingText(game.player.x, game.player.y - 30, 'WRONG BILL!', '#cc4444');
      m.forgeryTimer -= 5; // penalty
    }
    m.forgeryRound++;
    if (m.forgeryRound >= 5) {
      m.forgeryTimer = 0; // end
    } else {
      m.forgeryBills = _generateForgeryBill();
      m.forgerySelected = -1;
    }
  }
  if (consumeKey('Escape')) {
    var reward = m.forgeryScore * 15;
    if (reward > 0) { game.gold += reward; game.totalGoldEarned += reward; addXP(m.forgeryScore * 10); }
    m.forgery = false;
    m.activeMinigame = null;
    m.forgeryCooldown = 60;
    game.state = 'playing';
  }
}

function _renderForgery() {
  var m = game._minigames;
  if (!m.forgery) return;
  var w = canvas.width, h = canvas.height;

  // Background
  ctx.fillStyle = 'rgba(10, 6, 2, 0.92)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('FORGERY DETECTION', w / 2, 30);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#cc8800';
  ctx.fillText('Round ' + (m.forgeryRound + 1) + '/5 | Score: ' + m.forgeryScore + ' | Time: ' + Math.ceil(m.forgeryTimer) + 's', w / 2, 50);

  // Draw two bills side by side
  var billW = 200, billH = 100;
  var leftX = w / 2 - billW - 20, rightX = w / 2 + 20;
  var billY = h / 2 - billH / 2;

  function drawBill(features, x, y, selected) {
    ctx.fillStyle = '#f4e8c8';
    ctx.fillRect(x, y, billW, billH);
    ctx.strokeStyle = selected ? '#ffd700' : '#8a6a38';
    ctx.lineWidth = selected ? 3 : 1;
    ctx.strokeRect(x, y, billW, billH);
    // Border pattern
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, billW - 8, billH - 8);
    // Features
    for (var fi = 0; fi < features.length; fi++) {
      var f = features[fi];
      ctx.fillStyle = f.color;
      switch (f.type) {
        case 0: // line
          ctx.fillRect(x + f.x, y + f.y, f.size * 2, 2);
          break;
        case 1: // circle
          ctx.beginPath();
          ctx.arc(x + f.x, y + f.y, f.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 2: // rect
          ctx.fillRect(x + f.x, y + f.y, f.size, f.size);
          break;
        case 3: // text squiggle
          ctx.fillRect(x + f.x, y + f.y, f.size * 3, 3);
          ctx.fillRect(x + f.x + 2, y + f.y + 4, f.size * 2, 2);
          break;
      }
    }
    // "$100" text
    ctx.fillStyle = '#2a4a2a';
    ctx.font = 'bold 18px serif';
    ctx.fillText('$100', x + billW / 2, y + billH / 2 + 6);
    ctx.font = '9px monospace';
  }

  var leftFeatures = m.forgeryBills.isLeft ? m.forgeryBills.real : m.forgeryBills.forged;
  var rightFeatures = m.forgeryBills.isLeft ? m.forgeryBills.forged : m.forgeryBills.real;

  drawBill(leftFeatures, leftX, billY, m.forgerySelected === 0);
  drawBill(rightFeatures, rightX, billY, m.forgerySelected === 1);

  // Labels
  ctx.fillStyle = '#b8944a';
  ctx.font = '11px monospace';
  ctx.fillText('[1] Bill A', leftX + billW / 2, billY + billH + 20);
  ctx.fillText('[2] Bill B', rightX + billW / 2, billY + billH + 20);
  ctx.fillText('Select the FORGED bill, then press E', w / 2, billY + billH + 45);
  ctx.textAlign = 'left';
}

// ============================================================
// HOOK INTO GAME LOOP (called from features.js updateFeatures)
// ============================================================
// We'll hook this by modifying the existing updateFeatures and renderFeaturesOverlay
// to call our functions. This is done via the wrapper pattern.

(function() {
  // Hook updateMinigames into the game loop
  var origUpdateFeatures = window.updateFeatures;
  window.updateFeatures = function(dt) {
    if (origUpdateFeatures) origUpdateFeatures(dt);
    updateMinigames(dt);
  };

  var origRenderFeaturesOverlay = window.renderFeaturesOverlay;
  window.renderFeaturesOverlay = function() {
    if (origRenderFeaturesOverlay) origRenderFeaturesOverlay();
    renderMinigamesOverlay();
  };
})();
