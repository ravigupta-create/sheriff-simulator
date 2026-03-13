'use strict';

// ============================================================
// SHERIFF'S OFFICE INTERIOR SYSTEM
// Loaded after game.js — uses globals: game, ctx, gameCanvas,
// TILE, PALETTE, BUILDING_TYPES, consumeKey, keysJustPressed,
// showNotification, addJournalEntry, clamp, rand, audio, particles
// Exports: updateOffice(dt), renderOfficeOverlay()
// ============================================================

// ─────────────────────────────────────────────
// §1  OFFICE STATE
// ─────────────────────────────────────────────
var office = {
  active: false,
  sittingAtDesk: false,
  selectedZone: 0,
  zones: ['desk', 'caseBoard', 'gunRack', 'jailCells', 'bed', 'records', 'wanted', 'notices', 'exit'],
  zoneLabels: ['Desk', 'Case Board', 'Gun Rack', 'Jail Cells', 'Bed', 'Records', 'Wanted Board', 'Notice Board', 'Exit'],

  // Walkable office player state
  playerX: 400,
  playerY: 520,
  playerDir: 0,  // 0=down,1=up,2=left,3=right
  playerMoving: false,
  playerAnimTimer: 0,
  nearFurniture: null,  // name of nearest interactable, or null

  // Case system
  activeCases: [],
  completedCases: [],
  currentCase: null,
  caseChoiceVisible: false,
  showingOutcome: false,
  caseOutcomeTimer: 0,

  // Case board
  viewingBoard: false,
  boardScroll: 0,
  boardTab: 0,

  // Jail
  prisoners: [],
  viewingJail: false,
  selectedPrisoner: 0,

  // Gun rack
  viewingGunRack: false,

  // Upgrades
  upgrades: {
    desk: 0,
    gunRack: 0,
    jailCells: 0,
    decor: 0,
    bed: 0,
    security: 0,
  },
  upgradeMenuOpen: false,
  selectedUpgrade: 0,

  // NPC visitor
  visitorNPCName: '',

  // Waiting for case
  waitingForCase: false,
  waitTimer: 0,

  // Animations
  clockSwing: 0,
  lampFlicker: 0,
  dustMotes: [],
  fadeIn: 0,

  // Ammo tracking
  _ammoGivenDay: -1,

  // Bed / Sleep
  viewingBed: false,
  sleeping: false,
  sleepTimer: 0,
  sleepHours: 6,
  _lastSleepDay: -1,
  dreamText: '',
  nightmareActive: false,

  // Desk sub-menu
  deskMode: 'main', // 'main','meeting','coffee','letters','telegraph','drawers'
  meetingQueue: [],
  currentMeeting: null,
  meetingChoiceVisible: false,
  _lastMeetingDay: -1,
  _coffeeBrewedDay: -1,
  _drawerSearchedDay: -1,
  telegrams: [],
  letters: [],

  // Records / Stats
  viewingStats: false,
  statsTab: 0,
  repHistory: [],
  prisonerLog: [],

  // Deputies
  deputies: [],
  viewingDeputies: false,
  selectedDeputy: 0,

  // Office events
  officeEvent: null,
  _lastEventDay: -1,
  officeDog: false,
  dogName: '',

  // Trophies
  trophies: [],

  // Mini-games
  playingDarts: false,
  dartPhase: 0,
  dartPower: 0,
  dartAngle: 0,
  dartScore: 0,
  dartRounds: 0,
  targetPractice: false,
  targetPhase: 0,
  targetTimer: 0,
  targetScore: 0,

  // Crafting
  craftingOpen: false,
  _badgePolished: false,
  _polishDay: -1,
  pendingRequisitions: [],

  // Ambient
  flies: [],
  smokeParticles: [],
  musicBoxOn: false,

  // Bookshelf / Lore
  readingBook: false,
  selectedBook: 0,
  bookRead: {},  // track which books were read

  // Trophy system
  trophyCheckDone: false,

  // Wanted poster board
  viewingWanted: false,
  wantedPosters: [],

  // Prisoner events
  prisonerEventTimer: 0,
  prisonerEvent: null,

  // Solitaire
  playingSolitaire: false,
  solitaireCards: [],
  solitaireScore: 0,
  solitaireFlipped: 0,
  solitaireMatches: 0,

  // Office safe
  safeGold: 0,
  _safeOpened: false,

  // Notice board
  viewingNotices: false,
  notices: [],

  // Spittoon mini-game
  spittoonStreak: 0,
  _spittoonDay: -1,
};

// ─────────────────────────────────────────────
// §1b  WALKABLE OFFICE — FURNITURE LAYOUT
// ─────────────────────────────────────────────
// Each item: { key, label, action, x/y/w/h as fractions of room W/H }
// x,y is top-left corner. Player interacts when within INTERACT_DIST of center.
var OFFICE_FURNITURE = [
  { key: 'desk',       label: 'Desk',           x: 0.30, y: 0.50, w: 0.40, h: 0.16 },
  { key: 'caseBoard',  label: 'Case Board',     x: 0.18, y: 0.04, w: 0.13, h: 0.16 },
  { key: 'gunRack',    label: 'Gun Rack',       x: 0.78, y: 0.04, w: 0.17, h: 0.16 },
  { key: 'jailCells',  label: 'Jail Cells',     x: 0.62, y: 0.24, w: 0.32, h: 0.20 },
  { key: 'bed',        label: 'Bed',            x: 0.80, y: 0.56, w: 0.16, h: 0.12 },
  { key: 'records',    label: 'Filing Cabinet',  x: 0.04, y: 0.36, w: 0.09, h: 0.28 },
  { key: 'wanted',     label: 'Wanted Board',   x: 0.34, y: 0.04, w: 0.10, h: 0.14 },
  { key: 'notices',    label: 'Notice Board',   x: 0.46, y: 0.04, w: 0.10, h: 0.14 },
  { key: 'bookshelf',  label: 'Bookshelf',      x: 0.15, y: 0.36, w: 0.10, h: 0.24 },
  { key: 'stove',      label: 'Stove',          x: 0.04, y: 0.70, w: 0.08, h: 0.16 },
  { key: 'exit',       label: 'Exit Door',      x: 0.44, y: 0.90, w: 0.12, h: 0.08 },
];

var OFFICE_INTERACT_DIST = 50; // pixel distance to show [E] prompt
var OFFICE_PLAYER_SPEED = 2.8;
var OFFICE_PLAYER_SIZE = 10; // half-size of player collision box

// Check if any sub-view is currently active (player is interacting with furniture)
function isOfficeSubViewActive() {
  return office.sittingAtDesk || office.viewingBoard || office.viewingGunRack ||
         office.viewingJail || office.viewingBed || office.viewingStats ||
         office.viewingDeputies || office.craftingOpen || office.readingBook ||
         office.viewingWanted || office.viewingNotices || office.upgradeMenuOpen ||
         office.sleeping || office.showingOutcome || office.currentCase ||
         office.currentMeeting || office.officeEvent || office.prisonerEvent ||
         office.playingSolitaire || office.playingDarts || office.targetPractice;
}

// Find nearest furniture within interaction range
function findNearFurniture(W, H) {
  var bestDist = Infinity;
  var best = null;
  for (var i = 0; i < OFFICE_FURNITURE.length; i++) {
    var f = OFFICE_FURNITURE[i];
    var fcx = f.x * W + (f.w * W) / 2;
    var fcy = f.y * H + (f.h * H) / 2;
    var dx = office.playerX - fcx;
    var dy = office.playerY - fcy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < OFFICE_INTERACT_DIST && dist < bestDist) {
      bestDist = dist;
      best = f;
    }
  }
  return best;
}

// Check collision with furniture bounding box (returns true if blocked)
function officeCollides(px, py, W, H) {
  var ps = OFFICE_PLAYER_SIZE;
  // Room walls
  if (px - ps < 0 || px + ps > W || py - ps < 0 || py + ps > H) return true;
  // Furniture collision
  for (var i = 0; i < OFFICE_FURNITURE.length; i++) {
    var f = OFFICE_FURNITURE[i];
    if (f.key === 'exit') continue; // exit door has no collision
    var fx = f.x * W, fy = f.y * H, fw = f.w * W, fh = f.h * H;
    // Shrink collision box slightly so player can get close
    var margin = 2;
    if (px + ps > fx + margin && px - ps < fx + fw - margin &&
        py + ps > fy + margin && py - ps < fy + fh - margin) {
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// §2  UPGRADE DEFINITIONS
// ─────────────────────────────────────────────
var OFFICE_UPGRADES = [
  {
    key: 'desk', name: 'Desk', levels: [
      { name: 'Pine Desk', desc: 'Basic pine desk', cost: 0 },
      { name: 'Oak Desk', desc: 'Sturdy oak. Hints at best choice.', cost: 75 },
      { name: 'Mahogany Desk', desc: 'Grand mahogany. Cases pay 20% more.', cost: 200 },
    ]
  },
  {
    key: 'gunRack', name: 'Gun Rack', levels: [
      { name: 'Pegs on Wall', desc: 'A few pegs for guns.', cost: 0 },
      { name: 'Rack Cabinet', desc: '+5 ammo when entering office.', cost: 100 },
      { name: 'Full Armory', desc: '+10 ammo per visit, free repairs.', cost: 250 },
    ]
  },
  {
    key: 'jailCells', name: 'Jail Cells', levels: [
      { name: '2 Cells', desc: 'Hold 2 prisoners.', cost: 0 },
      { name: '4 Cells', desc: 'Hold 4. Better interrogations.', cost: 120 },
      { name: '6 Cells', desc: 'Hold 6. Double interrogation rewards.', cost: 300 },
    ]
  },
  {
    key: 'decor', name: 'Office Decor', levels: [
      { name: 'Bare Floors', desc: 'Dusty wooden floor.', cost: 0 },
      { name: 'Carpet & Curtains', desc: '+5% case rep gains.', cost: 60 },
      { name: 'Luxurious Interior', desc: '+15% rep gains from cases.', cost: 180 },
    ]
  },
  {
    key: 'bed', name: 'Bed', levels: [
      { name: 'Bedroll', desc: 'A thin bedroll on the floor.', cost: 0 },
      { name: 'Iron Cot', desc: 'Restores +3 HP. Fewer nightmares.', cost: 80 },
      { name: 'Four-Poster Bed', desc: 'Full HP restore. Dream clues.', cost: 250 },
    ]
  },
  {
    key: 'security', name: 'Office Security', levels: [
      { name: 'Wooden Door', desc: 'A simple wooden door.', cost: 0 },
      { name: 'Iron Door + Bars', desc: 'Fewer break-ins. +2 jail capacity.', cost: 150 },
      { name: 'Reinforced Vault', desc: 'No break-ins. Safe stores gold.', cost: 350 },
    ]
  },
];

// ─────────────────────────────────────────────
// §3  CASE TEMPLATES (32 unique cases)
// ─────────────────────────────────────────────
var CASE_TEMPLATES = [
  // ── MURDER (6) ──
  {
    name: 'The Saloon Stabbing', category: 'murder', difficulty: 2,
    description: 'A drifter was found dead behind the saloon, knife wound to the chest. Barkeep saw two men arguing over a poker debt. One is a local rancher, the other a passing gambler still in town.',
    choices: [
      { text: 'Arrest the gambler — outsiders are trouble', outcome: 'The gambler protests innocence. Evidence later shows the rancher owed money everywhere. Wrong man jailed.', gold: 15, rep: -8, arrest: false },
      { text: 'Investigate both men thoroughly', outcome: 'Patient questioning reveals the rancher\'s bloody shirt hidden in his barn. Justice served properly.', gold: 40, rep: 12, arrest: true },
      { text: 'Shake down both until one confesses', outcome: 'The gambler breaks first but his confession is coerced. Real killer walks free. Town uneasy.', gold: 25, rep: -3, arrest: false },
    ]
  },
  {
    name: 'Poison at the Parsonage', category: 'murder', difficulty: 3,
    description: 'The preacher\'s wife collapsed during Sunday supper and died within the hour. Doc says arsenic. The preacher is devastated — or is he? His eye was seen wandering toward the widow Henderson.',
    choices: [
      { text: 'Arrest the preacher — motive is clear', outcome: 'The preacher is innocent. The real poisoner was the church organist, jealous of the wife\'s singing voice. Travesty of justice.', gold: 10, rep: -15, arrest: false },
      { text: 'Question the whole congregation', outcome: 'The organist cracks under scrutiny. Confesses to rat poison in the sugar bowl. Case closed cleanly.', gold: 50, rep: 15, arrest: true },
      { text: 'Keep it quiet to avoid scandal', outcome: 'No one punished. The organist poisons again three weeks later. Blood on your hands, Sheriff.', gold: 0, rep: -20, arrest: false },
    ]
  },
  {
    name: 'Death in the Mine', category: 'murder', difficulty: 4,
    description: 'A miner found crushed by a collapsed beam, but the timbers were sawed halfway through. The mine owner says accident. The dead man\'s brother says the owner wanted to silence a wage dispute.',
    choices: [
      { text: 'Rule it an accident — the mine owner is powerful', outcome: 'You pocket a "gift" from the owner, but word gets around. Miners despise you. The brother swears revenge.', gold: 80, rep: -18, arrest: false },
      { text: 'Investigate the sawed timbers', outcome: 'The foreman confesses — ordered by the owner. Both arrested. Miners cheer. A dangerous enemy made.', gold: 35, rep: 20, arrest: true },
      { text: 'Offer the brother compensation', outcome: 'Pragmatic solution. Neither side happy but violence avoided. Truth stays buried like the miner.', gold: 40, rep: -2, arrest: false },
    ]
  },
  {
    name: 'The Midnight Strangler', category: 'murder', difficulty: 5,
    description: 'Two women strangled on consecutive nights, both saloon workers. Town is terrified. A traveling medicine man arrived three days ago, and a ranch hand was seen lurking near both scenes.',
    choices: [
      { text: 'Set a trap at the saloon with a decoy', outcome: 'The ranch hand strikes again — caught red-handed. Madness behind quiet eyes. Town sleeps safer.', gold: 60, rep: 22, arrest: true },
      { text: 'Run the medicine man out of town', outcome: 'Killings continue. You chased an innocent man while a murderer walks free. Panic spreads.', gold: 0, rep: -15, arrest: false },
      { text: 'Arrest both suspects, sort it out later', outcome: 'Real killer among them, but wrongly accused sues for false imprisonment. Messy but effective.', gold: 30, rep: 5, arrest: true },
    ]
  },
  {
    name: 'The Preacher\'s Confession', category: 'murder', difficulty: 5,
    description: 'Reverend Josiah comes to your office, ashen-faced. Twenty years ago, before finding God, he killed a man in a bar fight in Missouri. He wants to turn himself in.',
    choices: [
      { text: 'Contact Missouri authorities', outcome: 'Statute has expired. He\'s free legally. But confession is public now. His congregation is shaken. He thanks you.', gold: 15, rep: 12, arrest: false },
      { text: 'Tell him to keep it between him and God', outcome: 'He finds peace. Town keeps its preacher. Sometimes mercy is the higher law.', gold: 10, rep: 8, arrest: false },
      { text: 'Use the information as leverage', outcome: 'Blackmailing a preacher. Special place in hell for this. But free "donations" flow your way.', gold: 60, rep: -22, arrest: false },
    ]
  },
  {
    name: 'The Duel Gone Wrong', category: 'murder', difficulty: 1,
    description: 'Two men dueled at noon. Winner claims it was fair. The loser\'s family says the winner cheated — they say the loser was shot before "draw" was called.',
    choices: [
      { text: 'Examine the body for evidence', outcome: 'Shot in the back. It wasn\'t a fair duel. The "winner" is arrested for murder.', gold: 30, rep: 10, arrest: true },
      { text: 'Side with the winner — duels are legal', outcome: 'Quick resolution but the family holds a permanent grudge against you.', gold: 20, rep: -5, arrest: false },
      { text: 'Ban all dueling in town limits', outcome: 'Controversial but prevents future bloodshed. Some mock you, others respect the courage.', gold: 10, rep: 8, arrest: false },
    ]
  },

  // ── ROBBERY (5) ──
  {
    name: 'Bank Vault Breach', category: 'robbery', difficulty: 3,
    description: 'Bank robbed overnight — $500 missing from the vault. No forced entry. Banker says only he and his assistant have keys. The assistant bought a new horse yesterday.',
    choices: [
      { text: 'Arrest the assistant immediately', outcome: 'Assistant confesses, most money recovered. Quick justice. Banker is grateful.', gold: 55, rep: 12, arrest: true },
      { text: 'Investigate who else had access', outcome: 'You discover the banker staged it himself for insurance. Assistant was a patsy. Deep corruption exposed.', gold: 70, rep: 18, arrest: true },
      { text: 'Offer to split the take if it shows up', outcome: 'Corrupt and foolish. Word leaks. Your badge means nothing now.', gold: 100, rep: -25, arrest: false },
    ]
  },
  {
    name: 'The Stagecoach Heist', category: 'robbery', difficulty: 2,
    description: 'Noon stagecoach held up at gunpoint two miles east. Driver says three masked men on horseback. They took a strongbox for the railroad company. Tracks lead toward the canyon.',
    choices: [
      { text: 'Ride out and track them immediately', outcome: 'Catch two hiding in a canyon camp. Strongbox recovered. One escapes but railroad is satisfied.', gold: 45, rep: 10, arrest: true },
      { text: 'Post a bounty and wait for informants', outcome: 'Tip comes after two days. Raid their hideout but money mostly spent. Partial recovery.', gold: 25, rep: 5, arrest: true },
      { text: 'Tell the railroad to hire private security', outcome: 'Not your problem? Town disagrees. Railroad pulls out of the route. Commerce suffers.', gold: 0, rep: -12, arrest: false },
    ]
  },
  {
    name: 'The Payroll Ambush', category: 'robbery', difficulty: 4,
    description: 'Mining company payroll — $2,000 in gold — ambushed on the north road. Three guards dead. Company threatens shutdown if gold isn\'t recovered. Half the town works that mine.',
    choices: [
      { text: 'Organize a posse and track the robbers', outcome: 'Three-day pursuit. Corner the gang in an abandoned homestead. Fierce shootout but gold recovered. Town hero.', gold: 80, rep: 20, arrest: true },
      { text: 'Negotiate through an intermediary', outcome: 'They return half for safe passage. Mine stays open but justice isn\'t served.', gold: 40, rep: -5, arrest: false },
      { text: 'Investigate the mine foreman (inside job?)', outcome: 'Brilliant instinct. Foreman planned everything. "Robbers" were his cousins. All gold recovered.', gold: 90, rep: 22, arrest: true },
    ]
  },
  {
    name: 'Dynamite at the Bridge', category: 'robbery', difficulty: 4,
    description: 'Someone rigged the only bridge over Deadman\'s Creek with dynamite. Ransom note demands $300 or the bridge blows at noon. Without it, trade routes cut for months.',
    choices: [
      { text: 'Defuse the dynamite yourself', outcome: 'Steady hands save the day. Cut the right wire with seconds to spare. Town watches in breathless silence. Legend.', gold: 50, rep: 25, arrest: false },
      { text: 'Pay the ransom and track the collector', outcome: 'Money paid. Follow collector to a disgraced Army demolitions expert. Bridge saved, criminal caught.', gold: 20, rep: 12, arrest: true },
      { text: 'Evacuate the area and let it blow', outcome: 'Bridge destroyed. Three months of isolation. Town survives but barely. Bomber never found.', gold: 0, rep: -8, arrest: false },
    ]
  },
  {
    name: 'The Counterfeit Ring', category: 'robbery', difficulty: 3,
    description: 'Fake gold coins circulating through town. General store took $40 in counterfeit last week. Coins are nearly perfect — whoever\'s making them knows metallurgy.',
    choices: [
      { text: 'Check the blacksmith\'s forge after hours', outcome: 'Find molds, shavings, a fortune in fakes. Blacksmith funding daughter\'s medical treatment back East. Arrest him anyway.', gold: 45, rep: 12, arrest: true },
      { text: 'Set up a sting with marked coins', outcome: 'Marked coins lead to a traveling tinker, part of a larger network. Federal marshals take over. Commendation earned.', gold: 55, rep: 18, arrest: true },
      { text: 'Warn businesses but don\'t investigate deeply', outcome: 'Counterfeiting continues for months. Trust in local commerce erodes.', gold: 5, rep: -8, arrest: false },
    ]
  },

  // ── MISSING PERSONS (4) ──
  {
    name: 'The Vanishing Bride', category: 'missing', difficulty: 2,
    description: 'Young Clara Whitfield disappeared the night before her wedding. Her fiance is frantic, her father the mayor is furious. Her diary mentions wanting to "escape this prison."',
    choices: [
      { text: 'Organize a search party across the territory', outcome: 'Find Clara two towns over, working at a bookshop. She left willingly. Returning her feels wrong. Mayor demands it.', gold: 30, rep: 5, arrest: false },
      { text: 'Tell the mayor she ran away by choice', outcome: 'Mayor is livid but respects your honesty. Clara writes a thank-you letter months later. Freedom is justice.', gold: 10, rep: 8, arrest: false },
      { text: 'Suspect the fiance of foul play', outcome: 'Investigation clears fiance but wastes three days. Clara gets further away. Mayor blames you.', gold: 0, rep: -8, arrest: false },
    ]
  },
  {
    name: 'Lost Prospector', category: 'missing', difficulty: 3,
    description: 'Old Pete hasn\'t been seen in two weeks. Was prospecting in the hills, always comes back Saturdays for supplies. His burro found wandering near the creek, saddlebags empty.',
    choices: [
      { text: 'Search the hills yourself', outcome: 'Find Pete alive in a collapsed mine shaft, leg broken. He whispers about a gold vein. Saved a life, earned a friend.', gold: 35, rep: 15, arrest: false },
      { text: 'Send the deputy to look', outcome: 'Deputy finds Pete too late. Exposure took him. If only someone had gone sooner.', gold: 15, rep: -5, arrest: false },
      { text: 'Check if anyone had reason to harm Pete', outcome: 'His claim-jumping neighbor looks guilty but Pete is found alive — just an accident. Neighbor is angry at you.', gold: 25, rep: 8, arrest: false },
    ]
  },
  {
    name: 'The Missing Children', category: 'missing', difficulty: 4,
    description: 'Three children haven\'t come home from the swimming hole. Been four hours, sun is setting. Parents hysterical. Wolves spotted in the area recently.',
    choices: [
      { text: 'Drop everything and lead the search', outcome: 'Find them hiding in a cave, scared but safe — they\'d seen a mountain lion. Your calm brings them home. Town celebrates.', gold: 20, rep: 25, arrest: false },
      { text: 'Organize townsfolk into search parties', outcome: 'Efficient but slow to organize. Children found at dawn, cold and frightened but alive.', gold: 15, rep: 12, arrest: false },
      { text: 'Fire warning shots to scare predators', outcome: 'Shots guide children toward town. They stumble out of darkness within the hour. Quick thinking.', gold: 20, rep: 18, arrest: false },
    ]
  },
  {
    name: 'The Runaway Slave', category: 'missing', difficulty: 5,
    description: 'A man arrives from the south, scarred and exhausted. A bounty hunter follows, claiming the man is escaped "property" with legal papers. Federal law is on the hunter\'s side. Morality is not.',
    choices: [
      { text: 'Refuse to cooperate with the bounty hunter', outcome: 'Hunter threatens federal consequences. You stand firm. The man escapes north. May lose your badge. Keep your soul.', gold: 0, rep: 25, arrest: false },
      { text: 'Enforce the law as written', outcome: 'You hand over a human being. Town is split. Some praise adherence to law. Others never speak to you again.', gold: 50, rep: -15, arrest: false },
      { text: 'Delay the hunter with bureaucratic paperwork', outcome: 'Creative obstruction. By the time papers are "processed," the man is three states away. Hunter can\'t prove anything.', gold: 10, rep: 18, arrest: false },
    ]
  },

  // ── LAND DISPUTES (4) ──
  {
    name: 'The Fence Line War', category: 'land', difficulty: 2,
    description: 'Two ranchers at each other\'s throats over a property boundary. Jenkins says the creek is the line; Morrison says the old oak tree. Both have guns and hot tempers. Shots fired yesterday.',
    choices: [
      { text: 'Side with Jenkins — the creek is natural', outcome: 'Morrison furious. Starts rustling Jenkins\' cattle in retaliation. Solved one problem, created another.', gold: 25, rep: -3, arrest: false },
      { text: 'Split the disputed land evenly', outcome: 'Neither man happy but both can live with it. Solomon\'s wisdom kind of day. Peace holds.', gold: 20, rep: 10, arrest: false },
      { text: 'Find the original land deed', outcome: 'Deed clearly shows Morrison is right. Jenkins accepts grudgingly. Rule of law prevails.', gold: 30, rep: 14, arrest: false },
    ]
  },
  {
    name: 'Railroad vs. Homesteaders', category: 'land', difficulty: 4,
    description: 'Railroad company has a federal grant to lay tracks through four family homesteads. Families refuse to move. Railroad\'s hired men getting aggressive. Confrontation brewing.',
    choices: [
      { text: 'Side with the railroad — progress can\'t stop', outcome: 'Families displaced, paid poorly. Seen as a corporate lackey. But town gets a station.', gold: 80, rep: -15, arrest: false },
      { text: 'Negotiate fair compensation for families', outcome: 'Weeks of tense negotiation. Families get triple the offer. Railroad grumbles but complies. Everyone respects you.', gold: 30, rep: 20, arrest: false },
      { text: 'Propose an alternate route around them', outcome: 'Costs railroad more but saves families. Railroad boss remembers your name — not fondly.', gold: 20, rep: 15, arrest: false },
    ]
  },
  {
    name: 'Water Rights Feud', category: 'land', difficulty: 3,
    description: 'Upstream rancher dammed the creek, cutting off water to three downstream farms. Crops dying. Rancher says it\'s his land, his water. Farmers say he\'s killing their families.',
    choices: [
      { text: 'Order the dam torn down', outcome: 'Rancher resists but complies under threat. Water flows. Rancher becomes your bitter enemy.', gold: 20, rep: 12, arrest: false },
      { text: 'Propose a water-sharing schedule', outcome: 'Both sides agree reluctantly. Arrangement holds through dry season. Practical justice.', gold: 25, rep: 15, arrest: false },
      { text: 'Look the other way — civil matter', outcome: 'Two farmers lose everything. One shoots the rancher. Now you have a murder because you did nothing.', gold: 0, rep: -18, arrest: false },
    ]
  },
  {
    name: 'Gold Claim Jumpers', category: 'land', difficulty: 3,
    description: 'A miner\'s gold claim taken over by armed men while he was in town for supplies. They say they found it abandoned. He says he has the deed.',
    choices: [
      { text: 'Ride out and confront them', outcome: 'Tense standoff but they back down when they see the badge. Claim restored to rightful owner.', gold: 50, rep: 12, arrest: true },
      { text: 'File legal proceedings', outcome: 'Slow but lawful. Claim returned after two weeks of paperwork.', gold: 30, rep: 6, arrest: false },
      { text: 'Offer to buy the claim yourself', outcome: 'Ethically questionable but you now own a small gold mine.', gold: -40, rep: -3, arrest: false },
    ]
  },

  // ── SUPERNATURAL (4) ──
  {
    name: 'Ghost of Hangman\'s Hill', category: 'supernatural', difficulty: 2,
    description: 'Multiple witnesses report a glowing figure near the old hanging tree at midnight. Livestock dying. Old Mabel says it\'s Black Bart\'s ghost, hanged twenty years ago. Town terrified.',
    choices: [
      { text: 'Stake out Hangman\'s Hill at midnight', outcome: 'The "ghost" is a prospector with a phosphorus lamp, using the legend to keep people from his claim. Mystery solved.', gold: 30, rep: 12, arrest: true },
      { text: 'Declare the hill off-limits', outcome: 'Mysterious deaths stop but legend grows. People whisper the sheriff fears ghosts.', gold: 10, rep: -5, arrest: false },
      { text: 'Hire a priest to perform an exorcism', outcome: 'Reverend Josiah prays all night. Prospector, spooked, abandons his operation. Problem solved by accident.', gold: 5, rep: 8, arrest: false },
    ]
  },
  {
    name: 'Cattle Mutilations', category: 'supernatural', difficulty: 3,
    description: 'Six cattle found dead and mutilated on three ranches. Clean surgical cuts, organs removed, no blood on the ground. Ranchers talk of demons and witchcraft. Fear spreading.',
    choices: [
      { text: 'Investigate the cuts scientifically', outcome: 'A passing veterinarian identifies predator scavenging on disease-killed cattle. Quarantine saves the herds.', gold: 40, rep: 15, arrest: false },
      { text: 'Blame it on coyotes and move on', outcome: 'More cattle die. It WAS disease, and your dismissal let it spread. Ranchers devastated and furious.', gold: 0, rep: -12, arrest: false },
      { text: 'Confront the local "witch" everyone suspects', outcome: 'Old Agatha is just an herbalist. Harassing her makes you look superstitious and cruel.', gold: 0, rep: -10, arrest: false },
    ]
  },
  {
    name: 'Lights Over the Desert', category: 'supernatural', difficulty: 1,
    description: 'Strange lights in the night sky have the town buzzing. Some say angels, some say demons, one man insists it\'s "sky ships from beyond the stars." Preacher wants a statement.',
    choices: [
      { text: 'Tell people it\'s ball lightning — stay calm', outcome: 'Sensible explanation. Most accept it. True believers grumble but panic subsides.', gold: 10, rep: 8, arrest: false },
      { text: 'Investigate the source of the lights', outcome: 'A Chinese railroad crew launching sky lanterns for a festival. Cultural misunderstanding. Beautiful, actually.', gold: 15, rep: 12, arrest: false },
      { text: 'Declare a town curfew until it stops', outcome: 'Overreaction. People resent the curfew more than the lights. Lights stop on their own.', gold: 5, rep: -6, arrest: false },
    ]
  },
  {
    name: 'The Talking Skull', category: 'supernatural', difficulty: 3,
    description: 'A prospector found a human skull in the desert that he swears whispered his name. Brought it to town — half the saloon says they heard it too. Skull sits on the bar as patrons take turns.',
    choices: [
      { text: 'Confiscate the skull and investigate', outcome: 'Skull belongs to a missing federal marshal from five years ago. Case reopened. His killer brought to justice.', gold: 60, rep: 15, arrest: true },
      { text: 'Smash the skull — this is nonsense', outcome: 'Destroying evidence of a potential crime. Half the town thinks you angered a spirit. Bad move.', gold: 0, rep: -10, arrest: false },
      { text: 'Let the curiosity run its course', outcome: 'Skull becomes a tourist attraction. Revenue increases. The dead man is never identified.', gold: 25, rep: -2, arrest: false },
    ]
  },

  // ── POLITICAL (4) ──
  {
    name: 'The Mayor\'s Secret', category: 'political', difficulty: 4,
    description: 'Anonymous letter on your desk: the mayor has been embezzling from the town treasury. Includes bank records that look legitimate. Election is next month.',
    choices: [
      { text: 'Confront the mayor with the evidence', outcome: 'Mayor tries to bribe you, then threatens you. You arrest him. Deputy mayor takes over. True justice against power.', gold: 30, rep: 25, arrest: true },
      { text: 'Verify the records independently first', outcome: 'Records check out. You build an airtight case. Mayor resigns in disgrace. Clean, by-the-book work.', gold: 45, rep: 22, arrest: true },
      { text: 'Bury the letter — the mayor is your ally', outcome: 'Corruption festers. Mayor grows bolder. Eventually state sends investigators. Your complicity noted.', gold: 60, rep: -20, arrest: false },
    ]
  },
  {
    name: 'Election Fraud', category: 'political', difficulty: 3,
    description: 'Challenger claims ballot box was stuffed overnight. Found town hall door unlocked at dawn with extra ballots inside. Current mayor won by 47 votes in a town of 200.',
    choices: [
      { text: 'Impound ballots and order a recount', outcome: 'Recount reveals 52 fraudulent ballots. New election ordered. Democracy, messy but functional.', gold: 25, rep: 18, arrest: false },
      { text: 'Investigate who had town hall access', outcome: 'Mayor\'s nephew seen with a key. He confesses. Election voided and re-held. Clean outcome.', gold: 35, rep: 20, arrest: true },
      { text: 'Dismiss the claim — elections are over', outcome: 'Challenger rallies supporters. Near-riot in the street. You look like you\'re protecting the corrupt.', gold: 0, rep: -15, arrest: false },
    ]
  },
  {
    name: 'The Deserter', category: 'political', difficulty: 3,
    description: 'A cavalry soldier seeking refuge claims his unit massacred a peaceful native village. He deserted rather than participate. Army wants him back for court-martial. He begs for asylum.',
    choices: [
      { text: 'Hand him over to the Army', outcome: 'Court-martialed and hanged. Months later, a journalist exposes the massacre. Army covers it up. You helped silence a witness.', gold: 40, rep: -5, arrest: false },
      { text: 'Hide him and send word to a federal judge', outcome: 'Risky but righteous. Judge investigates. Massacre exposed. Soldier becomes key witness. Justice, eventually.', gold: 15, rep: 20, arrest: false },
      { text: 'Tell him to keep running — never saw him', outcome: 'He disappears. Truth dies with him. Maybe mercy, maybe cowardice. Army doesn\'t ask twice.', gold: 0, rep: 2, arrest: false },
    ]
  },
  {
    name: 'The Hanging Judge', category: 'political', difficulty: 5,
    description: 'Circuit judge sentences three men to hang — two outlaws and a boy who stole bread. Sentences wildly disproportionate. Judge is known for cruelty but has legal authority.',
    choices: [
      { text: 'Challenge the boy\'s sentence publicly', outcome: 'Judge furious but public pressure forces commutation. Boy gets labor instead. Powerful enemy in the judiciary.', gold: 10, rep: 22, arrest: false },
      { text: 'Help the boy escape quietly', outcome: 'Boy vanishes in the night. Judge suspects you, can\'t prove it. Small rebellion against injustice.', gold: 0, rep: 12, arrest: false },
      { text: 'Carry out all sentences — law is law', outcome: 'A child hangs for bread. Town will never look at you the same. Law was followed. Was justice served?', gold: 30, rep: -20, arrest: false },
    ]
  },

  // ── ANIMAL ATTACKS (5) ──
  {
    name: 'Wolf Pack on the Ridge', category: 'animal', difficulty: 2,
    description: 'Wolves killed three sheep and a calf this week. Pack getting bolder, seen near schoolhouse at dusk. Parents keeping children home. Ranchers want a hunt organized.',
    choices: [
      { text: 'Lead a hunting party into the hills', outcome: 'Track and scatter the pack, killing the alpha. Wolves retreat to wilder territory. Livestock safe again.', gold: 25, rep: 12, arrest: false },
      { text: 'Hire a professional trapper', outcome: 'Expensive but effective. Trapper relocates pack humanely. Some ranchers wanted blood, not mercy.', gold: 10, rep: 8, arrest: false },
      { text: 'Set out poisoned meat', outcome: 'Kills wolves but also two ranch dogs and a hawk. Ranchers\' solution causes new problems.', gold: 20, rep: -3, arrest: false },
    ]
  },
  {
    name: 'Grizzly in Town', category: 'animal', difficulty: 3,
    description: 'Grizzly bear wandered into the general store at dawn, drawn by smoked meat. Still inside. Shopkeeper on the roof. Bear seems calm but enormous. Crowd gathering.',
    choices: [
      { text: 'Shoot the bear — public safety first', outcome: 'One clean shot. Bear drops. Town safe. Pelt hangs in saloon as reminder of wilderness at the door.', gold: 30, rep: 10, arrest: false },
      { text: 'Lure it out with a meat trail', outcome: 'Patient work with salt pork. Bear follows trail back to the hills. Humane and effective.', gold: 20, rep: 15, arrest: false },
      { text: 'Clear the area and wait for it to leave', outcome: 'Bear destroys half the inventory before wandering off at noon. Shopkeeper furious.', gold: 5, rep: -5, arrest: false },
    ]
  },
  {
    name: 'Rattlesnake Nest Under the Church', category: 'animal', difficulty: 2,
    description: 'A rattlesnake bit a child during Sunday school. She\'ll live, but doc found a whole nest under the church foundation. Services canceled. Reverend wants action fast.',
    choices: [
      { text: 'Smoke them out and relocate', outcome: 'Messy, smelly work but effective. Snakes driven to desert. Services resume. You smell of sulfur for a week.', gold: 20, rep: 12, arrest: false },
      { text: 'Hire a snake handler from the next town', outcome: 'Professional job. Every snake removed safely. Costs money but no one else bitten.', gold: 10, rep: 10, arrest: false },
      { text: 'Pour kerosene and light it — scorched earth', outcome: 'Snakes dead but so is the church foundation. Partially collapses. Reverend weeps.', gold: 15, rep: -10, arrest: false },
    ]
  },
  {
    name: 'The Stampede Warning', category: 'animal', difficulty: 4,
    description: 'Massive cattle herd stampeding toward town from the north! You have minutes to act. Dust cloud visible on the horizon. The ground is shaking.',
    choices: [
      { text: 'Ride out and divert the herd', outcome: 'Heroic ride! You turn the herd just in time with gunshots and rope. Legend status earned.', gold: 60, rep: 22, arrest: false },
      { text: 'Evacuate the main street', outcome: 'Buildings damaged but no one hurt. Good leadership under pressure.', gold: 25, rep: 12, arrest: false },
      { text: 'Build barricades with wagons', outcome: 'Partially effective. Some damage but could have been far worse.', gold: 15, rep: 6, arrest: false },
    ]
  },
  {
    name: 'The Scorpion Plague', category: 'animal', difficulty: 1,
    description: 'Scorpions infesting the hotel. Three guests stung. Owner begs for help before word spreads and ruins his business.',
    choices: [
      { text: 'Organize a thorough cleaning', outcome: 'Hotel cleared top to bottom. Owner gives you free room for life. Practical solution.', gold: 25, rep: 8, arrest: false },
      { text: 'Burn cedar smoke to drive them out', outcome: 'Old trick works. Scorpions flee. Smells nice too.', gold: 30, rep: 6, arrest: false },
      { text: 'Close the hotel until it\'s handled', outcome: 'Safe but owner loses a week of business and blames you.', gold: 10, rep: 2, arrest: false },
    ]
  },
];

// ─────────────────────────────────────────────
// §3B  VILLAIN PROPOSAL TEMPLATES
// ─────────────────────────────────────────────
var VILLAIN_NAMES = [
  'Scar McKenzie', 'Black Finger Reeves', 'El Cuchillo', 'Rattlesnake Hank',
  'The Whisper', 'Bloody Agnes', 'One-Arm Malone', 'Shadow Jack',
  'Copperhead Cole', 'Gentleman Jim', 'The Vulture', 'Iron Tooth Maggie',
];

var VILLAIN_PROPOSALS = [
  {
    name: 'Bank Heist Proposition',
    villain: null,
    desc: '{villain} leans in close. "Sheriff, we\'re hitting the bank tonight. $2,000 haul. You get 30% just for looking the other way. Lock the back door at midnight. Easy money."',
    choices: [
      { text: 'Accept — leave the back door open', outcome: 'The heist goes smooth. {villain} slides you $600 in a paper bag the next morning. The bank blames drifters.', gold: 600, rep: -15, corruption: 12 },
      { text: 'Accept — but demand 50%', outcome: '{villain} grumbles but agrees. You get $1,000. The banker is devastated. You sleep on a bed of cash.', gold: 1000, rep: -20, corruption: 18 },
      { text: 'Arrest this fool', outcome: 'You slap the cuffs on {villain}. "Shoulda known better than to trust a lawman." +$50 bounty.', gold: 50, rep: 15, corruption: -10 },
    ]
  },
  {
    name: 'Protection Racket',
    villain: null,
    desc: '{villain} drops a list on your desk. "These shops pay us protection money. We want to go legit — through YOU. You collect, we split 60/40. Shopkeepers won\'t argue with a badge."',
    choices: [
      { text: 'Accept — become the collector', outcome: 'You visit shops with {villain}\'s list. $80 a week, like clockwork. Shopkeepers look at you with dead eyes.', gold: 400, rep: -12, corruption: 15 },
      { text: 'Accept — but YOU get 70%', outcome: '{villain} laughs. "I like your style, Sheriff." You pocket the lion\'s share. Crime pays well.', gold: 550, rep: -15, corruption: 20 },
      { text: 'Burn the list and arrest them', outcome: 'You tear up the list. {villain} goes quietly — knows when they\'re beat. Shops breathe easy.', gold: 30, rep: 12, corruption: -8 },
    ]
  },
  {
    name: 'Stagecoach Robbery',
    villain: null,
    desc: '{villain} traces a route on your map. "Gold shipment. Thursday. Three guards. If you send your deputies elsewhere that day... we\'ll leave $500 under the water trough."',
    choices: [
      { text: 'Accept — reassign the deputies', outcome: 'Thursday comes and goes. Stagecoach robbed clean. $500 appears under the trough. Clean and quiet.', gold: 500, rep: -10, corruption: 12 },
      { text: 'Accept — but ride with the gang for a bigger cut', outcome: 'You ride masked with the gang. Thrilling and profitable. $800 in your saddlebag. If anyone recognized you...', gold: 800, rep: -25, corruption: 25 },
      { text: 'Set an ambush for the gang', outcome: 'Your deputies catch the whole gang at the pass. $200 reward from the stagecoach company. Hero.', gold: 200, rep: 20, corruption: -12 },
    ]
  },
  {
    name: 'Jailbreak Deal',
    villain: null,
    desc: '{villain} slides an envelope across the desk. "$300 to leave the jail cell unlocked tonight. My brother\'s in there. He ain\'t a bad man — just got caught up."',
    choices: [
      { text: 'Accept — unlock the cell', outcome: 'You "forget" to lock the cell. Brother escapes at 2AM. $300 richer, conscience $300 poorer.', gold: 300, rep: -8, corruption: 10 },
      { text: 'Accept — but demand $500', outcome: '"Fine." The envelope gets fatter. Cell magically unlocks. Brother vanishes into the night.', gold: 500, rep: -12, corruption: 14 },
      { text: 'Arrest them for bribery', outcome: 'Now you have TWO family members in jail. {villain} swears revenge from behind bars.', gold: 40, rep: 10, corruption: -6 },
    ]
  },
  {
    name: 'Smuggling Operation',
    villain: null,
    desc: '{villain} opens a crate. Guns. Lots of guns. "Mexican army pays triple for these. We run them across the border. You make sure nobody checks wagons leaving south."',
    choices: [
      { text: 'Accept — turn a blind eye to wagons', outcome: 'Wagons roll south unmolested. $700 appears in your desk drawer each month. Very lucrative.', gold: 700, rep: -15, corruption: 18 },
      { text: 'Accept — but you want a cut AND a gun', outcome: 'You pick the finest repeater from the crate. Plus $500 cash. Armed and dangerous.', gold: 500, rep: -18, corruption: 22 },
      { text: 'Confiscate the weapons', outcome: 'You seize the whole shipment. {villain} flees. Armory stocked. +30 ammo.', gold: 80, rep: 15, corruption: -10 },
    ]
  },
  {
    name: 'Land Grab Scheme',
    villain: null,
    desc: '{villain} shows you forged deeds. "Scare the homesteaders off Cooper Creek and these deeds become real. We sell the land to the railroad. $1,000 easy."',
    choices: [
      { text: 'Accept — threaten the homesteaders', outcome: 'Badge-backed intimidation works. Families flee. Land sold. $1,000 split. You can\'t look at the empty farmhouses.', gold: 1000, rep: -25, corruption: 25 },
      { text: 'Accept — but forge better deeds first', outcome: 'Your legal knowledge makes the forgeries bulletproof. $1,200 and no one can prove a thing.', gold: 1200, rep: -30, corruption: 30 },
      { text: 'Arrest them for forgery', outcome: 'You tear the fake deeds in half. {villain} goes to jail. Homesteaders thank you with apple pie.', gold: 20, rep: 18, corruption: -15 },
    ]
  },
  {
    name: 'Outlaw Hideout Pass',
    villain: null,
    desc: '{villain} needs safe passage through town for their gang. "We won\'t cause trouble. Just passing through. $200 for a quiet night and no questions."',
    choices: [
      { text: 'Accept — tell your deputies to stay inside', outcome: 'Gang passes through peacefully. $200 for doing nothing. Easiest money you ever made.', gold: 200, rep: -5, corruption: 8 },
      { text: 'Accept — but charge $400 for the whole gang', outcome: '"Highway robbery," {villain} mutters, paying up. Ironic, really. $400 in your pocket.', gold: 400, rep: -8, corruption: 12 },
      { text: 'Tell them to go around — or go to jail', outcome: 'Gang detours. No money but no trouble either. Your authority holds.', gold: 0, rep: 8, corruption: -5 },
    ]
  },
  {
    name: 'Assassination Contract',
    villain: null,
    desc: '{villain} drops a photo on your desk. The mayor. "He\'s been skimming from our operation. We want him gone. You arrange an \'accident.\' $2,000."',
    choices: [
      { text: 'Accept — arrange the "accident"', outcome: 'The mayor has a tragic fall from his balcony. $2,000 under your mattress. You are now the most powerful person in town.', gold: 2000, rep: -35, corruption: 35 },
      { text: 'Decline — too risky', outcome: '{villain} nods. "Smart man. Forget I was here." They disappear into the night.', gold: 0, rep: 0, corruption: 0 },
      { text: 'Warn the mayor and arrest {villain}', outcome: 'Mayor is shaken but grateful. Doubles your salary. {villain} swears vengeance from jail.', gold: 100, rep: 25, corruption: -20 },
    ]
  },
];

// ─────────────────────────────────────────────
// §4  VISITOR NPC NAMES
// ─────────────────────────────────────────────
var VISITOR_NAMES = [
  'Dusty McGraw', 'Widow Hawkins', 'Rancher Briggs', 'Old Jebediah',
  'Schoolmarm Rose', 'Cattle Boss Hank', 'Prospector Silas', 'Miss Evangeline',
  'Doc Holliday Jr.', 'Slim Perkins', 'Madam Beaumont', 'Undertaker Grimm',
  'One-Eyed Pete', 'Deacon Frost', 'Sgt. Wheeler', 'Martha Clearwater',
  'Chinese Charlie', 'Senora Delgado', 'Railroad Jim', 'Crazy Ethel',
  'Judge Parker', 'Blacksmith Brody', 'Trapper Hays', 'Nell from the Saloon',
  'Apache Joe', 'Fancy Dan', 'Grizzled Gus', 'Sister Mary', 'Tinker Tom',
  'Peg-Leg Murphy', 'Prairie Rose', 'Silent Sam', 'Doc Patches', 'Whistle Willie',
];

// ─────────────────────────────────────────────
// §4B  NEW CASE TEMPLATES (12 more)
// ─────────────────────────────────────────────
var NEW_CASE_TEMPLATES = [
  // ── ARSON (2) ──
  { name: 'The Barn Burner', category: 'arson', difficulty: 3,
    description: 'Three barns burned in two nights. Ranchers are arming themselves. A recently fired ranch hand was seen buying kerosene, but the local insurance agent has been pushing policies hard.',
    choices: [
      { text: 'Arrest the fired hand immediately', outcome: 'He confesses under pressure but reveals the insurance agent hired him. Both arrested. Conspiracy exposed.', gold: 55, rep: 18, arrest: true },
      { text: 'Investigate the insurance angle', outcome: 'Paper trail leads straight to the agent. He burned barns to sell policies. Brilliant detective work.', gold: 65, rep: 22, arrest: true },
      { text: 'Set a night watch and catch them red-handed', outcome: 'You catch the hand mid-torch at the fourth barn. Clean collar, no doubt about guilt.', gold: 45, rep: 15, arrest: true },
    ] },
  { name: 'Fire at the Schoolhouse', category: 'arson', difficulty: 4,
    description: 'The schoolhouse is ablaze at midnight. No students inside, thank God. But the teacher\'s personal library — her life\'s work — is destroyed. She suspects the father of a boy she disciplined.',
    choices: [
      { text: 'Confront the father', outcome: 'He breaks down crying. Did it in a drunken rage. Remorse is genuine. The teacher forgives him, barely.', gold: 25, rep: 12, arrest: true },
      { text: 'Investigate the ashes for clues', outcome: 'Find a whiskey bottle with a rag — classic firebomb. Fingerprints in soot. Father identified.', gold: 40, rep: 16, arrest: true },
      { text: 'Organize rebuilding, investigate later', outcome: 'Community rallies. School rebuilt in a week. Arsonist never found but the town\'s spirit is unbroken.', gold: 15, rep: 10, arrest: false },
    ] },
  // ── SMUGGLING (2) ──
  { name: 'The Whiskey Run', category: 'smuggling', difficulty: 3,
    description: 'Untaxed whiskey flooding the saloons, undercutting the legitimate distributor. Wagons come in at night from the hills. The moonshine is good but the tax revenue is vanishing.',
    choices: [
      { text: 'Raid the still in the hills', outcome: 'Find a massive operation run by three brothers. They fight back but you prevail. Barrels of moonshine seized.', gold: 60, rep: 14, arrest: true },
      { text: 'Tax the moonshine — make it legal', outcome: 'Pragmatic solution. Brothers pay tax, town gets revenue, saloons get cheap whiskey. Everyone wins.', gold: 45, rep: 8, arrest: false },
      { text: 'Confiscate and sell it yourself', outcome: 'You become the middleman. Profitable but corrupt. The brothers owe you "favors."', gold: 120, rep: -15, arrest: false },
    ] },
  { name: 'Opium Den Discovery', category: 'smuggling', difficulty: 5,
    description: 'A hidden room beneath the laundry is an opium den. Twelve addicts, some prominent citizens. The owner claims it\'s "medicine." Federal law is murky. Morality is not.',
    choices: [
      { text: 'Shut it down and arrest the owner', outcome: 'Den closed. Owner jailed. Addicts left without help, some turn to worse. But the law is clear.', gold: 40, rep: 15, arrest: true },
      { text: 'Close it quietly — protect reputations', outcome: 'Prominent citizens grateful. Owner relocated. Addiction continues in the shadows.', gold: 80, rep: -5, arrest: false },
      { text: 'Set up a treatment program', outcome: 'Radical idea. Doc helps addicts recover. Owner fined, not jailed. Progressive justice.', gold: 20, rep: 20, arrest: false },
    ] },
  // ── KIDNAPPING (2) ──
  { name: 'The Banker\'s Daughter', category: 'kidnapping', difficulty: 4,
    description: 'Banker\'s daughter taken from her bedroom. Ransom note demands $5,000 in the canyon by midnight. Banker can\'t pay. You have 8 hours.',
    choices: [
      { text: 'Ride to the canyon with fake money', outcome: 'The switch works. Kidnappers grab the bag, you grab the girl. Shootout, but she\'s safe.', gold: 70, rep: 25, arrest: true },
      { text: 'Track the kidnappers to their hideout', outcome: 'Follow hoof prints. Find a cabin. Rescue the girl before deadline. No shots fired.', gold: 55, rep: 22, arrest: true },
      { text: 'Negotiate down the ransom', outcome: 'Talk them to $1,000. Banker pays. Girl returned. Kidnappers escape but she lives.', gold: 30, rep: 8, arrest: false },
    ] },
  { name: 'The Missing Preacher', category: 'kidnapping', difficulty: 3,
    description: 'Reverend vanished after evening service. His horse found tied to a tree outside town. Boot prints suggest he was dragged. A note nailed to the church door: "He knows what he did."',
    choices: [
      { text: 'Investigate the reverend\'s past', outcome: 'He witnessed a murder years ago. The killer has returned. Find them in a homestead, reverend tied up but alive.', gold: 50, rep: 18, arrest: true },
      { text: 'Organize a search posse immediately', outcome: 'Posse finds reverend in an abandoned mine. Kidnapper fled but reverend is shaken but alive.', gold: 35, rep: 14, arrest: false },
      { text: 'Follow the boot prints alone', outcome: 'Brave and effective. Confront the kidnapper one-on-one. He surrenders when he sees the badge.', gold: 45, rep: 20, arrest: true },
    ] },
  // ── FRAUD (2) ──
  { name: 'Snake Oil Salesman', category: 'fraud', difficulty: 2,
    description: 'A traveling salesman selling "miracle elixir" that cured nothing and made three people sick. He\'s packing his wagon to leave at dawn. Sold $200 worth of colored water.',
    choices: [
      { text: 'Arrest him before he leaves', outcome: 'Catch him hitching his horse. Money mostly recovered. Town folk get refunds.', gold: 35, rep: 12, arrest: true },
      { text: 'Run him out of town at gunpoint', outcome: 'He leaves fast. No refunds but no more victims. Quick and effective.', gold: 10, rep: 6, arrest: false },
      { text: 'Buy the "elixir" recipe for yourself', outcome: 'It\'s colored water with pepper. You now sell it at a markup. Profitable but shameless.', gold: 80, rep: -12, arrest: false },
    ] },
  { name: 'The Fake Marshal', category: 'fraud', difficulty: 4,
    description: 'A man with a convincing badge has been collecting "federal taxes" from businesses. Claims Washington sent him. His papers look real. The businesses paid $500 total.',
    choices: [
      { text: 'Telegraph Washington to verify', outcome: 'No such marshal exists. Arrest the imposter. Most money recovered. Federal commendation.', gold: 60, rep: 22, arrest: true },
      { text: 'Confront him directly with your suspicions', outcome: 'He draws on you! Quick shootout. He\'s wounded and arrested. Badge was stolen from a dead marshal.', gold: 50, rep: 18, arrest: true },
      { text: 'Let him continue — maybe he IS real', outcome: 'He\'s not. Skips town with the money. You look incompetent.', gold: 0, rep: -15, arrest: false },
    ] },
  // ── NATIVE AFFAIRS (2) ──
  { name: 'The Broken Treaty', category: 'native', difficulty: 4,
    description: 'Settlers building on treaty land. The tribe sends a delegation — calm but firm. Settlers cite a new territorial law. Both sides have legitimate claims. Tensions rising daily.',
    choices: [
      { text: 'Enforce the treaty — remove settlers', outcome: 'Settlers furious but law is law. Tribe respects your word. Federal authorities back you up.', gold: 20, rep: 18, arrest: false },
      { text: 'Negotiate a compromise — shared land', outcome: 'Both sides grudgingly accept. Not perfect but blood is avoided. Solomon would be proud.', gold: 30, rep: 15, arrest: false },
      { text: 'Side with settlers — progress marches on', outcome: 'Tribe withdraws in bitter silence. Raids begin two weeks later. Blood on your hands.', gold: 50, rep: -20, arrest: false },
    ] },
  { name: 'Sacred Ground Dispute', category: 'native', difficulty: 3,
    description: 'Miners discovered gold on land the tribe considers sacred burial ground. Mining company wants to dig. Tribe threatens war. Both sides armed.',
    choices: [
      { text: 'Declare the land protected', outcome: 'Mining company pulls out. Tribe grateful. Company lobbies against you in territorial capital.', gold: 10, rep: 20, arrest: false },
      { text: 'Broker a deal — mine the edges only', outcome: 'Careful negotiation. Sacred center untouched, gold extracted from periphery. Tense peace holds.', gold: 40, rep: 12, arrest: false },
      { text: 'Let the mining company proceed', outcome: 'Gold flows but so does blood. Tribe attacks miners. You\'ve started a war.', gold: 80, rep: -25, arrest: false },
    ] },
];
// Append new cases to main array
for (var _nci = 0; _nci < NEW_CASE_TEMPLATES.length; _nci++) {
  CASE_TEMPLATES.push(NEW_CASE_TEMPLATES[_nci]);
}

// ─────────────────────────────────────────────
// §4C  MEETING TEMPLATES
// ─────────────────────────────────────────────
var BOSS_NAMES = [
  'Don Vittorio', 'El Diablo', 'Madame Noir', 'The Kingpin',
  'Black Jack Barnes', 'Iron Fist Fontaine', 'Red Widow', 'The Colonel',
];

var MEETING_TEMPLATES = [
  // Crime Boss Meetings (show bodyguards)
  { type: 'boss', name: 'Territory Negotiation', bodyguards: 2,
    desc: '{boss} arrives flanked by armed men. "Sheriff, let\'s discuss territory. My people stay south of Main Street, your law stays north. Everyone prospers."',
    choices: [
      { text: 'Accept the deal — divided town', outcome: 'An uneasy truce. Crime drops on your side but flourishes on theirs. You sleep easier. The town doesn\'t.', gold: 200, rep: -10, corruption: 15 },
      { text: 'Counter-offer — you get 20% of their take', outcome: '{boss} smiles. "A businessman." Monthly payments begin. You\'re on the payroll now.', gold: 400, rep: -18, corruption: 22 },
      { text: 'Arrest everyone in this room', outcome: 'Bold move! A tense standoff. Bodyguards think twice. {boss} surrenders. Legendary courage.', gold: 60, rep: 25, corruption: -15 },
    ] },
  { type: 'boss', name: 'Weapons Deal', bodyguards: 3,
    desc: '{boss} opens a case of gleaming new rifles. "Army surplus. Fell off a wagon. I need storage — your evidence locker would be perfect. $800 for the inconvenience."',
    choices: [
      { text: 'Accept — store the weapons', outcome: 'Illegal arms in your evidence locker. $800 richer, soul considerably poorer.', gold: 800, rep: -15, corruption: 20 },
      { text: 'Take the weapons for yourself', outcome: 'You confiscate the lot. {boss} is furious but can\'t report stolen contraband. +30 ammo.', gold: 0, rep: 5, corruption: 5 },
      { text: 'Arrest them for arms trafficking', outcome: 'Three armed criminals in your office. The arrest is harrowing but successful.', gold: 80, rep: 20, corruption: -12 },
    ] },
  { type: 'boss', name: 'The Protection Offer', bodyguards: 2,
    desc: '{boss} slides a cigar across the desk. "Sheriff, things are about to get... dangerous in this town. New gang moving in from the east. My boys can protect you. For a fee."',
    choices: [
      { text: 'Accept protection — pay $100/week', outcome: 'The eastern gang backs off when they see {boss}\'s men around. Expensive peace.', gold: -100, rep: -8, corruption: 12 },
      { text: 'Refuse — you don\'t need protection', outcome: '{boss} shrugs. "Your funeral, Sheriff." The eastern gang arrives next week. You handle it alone.', gold: 0, rep: 8, corruption: 0 },
      { text: 'Tell them to deal with the gang — prove their worth', outcome: '{boss} grins. Two gangs clash. The eastern gang is destroyed. {boss}\'s power doubles.', gold: 50, rep: -5, corruption: 8 },
    ] },
  { type: 'boss', name: 'The Grand Heist', bodyguards: 3,
    desc: '{boss} unfurls blueprints of the railroad payroll office. "The big score, Sheriff. $10,000. We need you to be somewhere else that night. Your cut: $3,000."',
    choices: [
      { text: 'Accept — be conveniently elsewhere', outcome: 'The heist goes perfectly. $3,000 appears in your safe. The railroad never suspects you.', gold: 3000, rep: -25, corruption: 30 },
      { text: 'Demand half — $5,000', outcome: '{boss} whistles. "Greedy lawman." But pays. You\'re now their most expensive asset.', gold: 5000, rep: -35, corruption: 40 },
      { text: 'Alert the railroad and set a trap', outcome: 'Epic ambush. The gang walks into a wall of railroad security. {boss} barely escapes. You\'re a hero.', gold: 150, rep: 30, corruption: -20 },
    ] },
  // Informant Meetings
  { type: 'informant', name: 'Tip About a Robbery', bodyguards: 0,
    desc: 'A nervous man in a hat pulled low whispers: "There\'s gonna be a hit on the general store tonight. Three men, armed. I\'m telling you because they cheated me out of my cut."',
    choices: [
      { text: 'Stake out the store tonight', outcome: 'You catch all three mid-robbery. Clean arrests. The informant disappears into the night.', gold: 45, rep: 15, corruption: 0 },
      { text: 'Pay him for more information', outcome: 'For $20 he gives names, hideout location, and the fence they use. Goldmine of intel.', gold: -20, rep: 8, corruption: 0 },
      { text: 'Ignore it — could be a setup', outcome: 'It wasn\'t. Store robbed clean. Owner blames you. Should have listened.', gold: 0, rep: -10, corruption: 0 },
    ] },
  // Town Council Meeting
  { type: 'council', name: 'Budget Review', bodyguards: 0,
    desc: 'The town council convenes in your office. Mayor speaks: "Sheriff, we need to discuss your budget. Crime is down but so are our coffers. Justify your spending."',
    choices: [
      { text: 'Present your case statistics professionally', outcome: 'Council impressed by your record-keeping. Budget maintained. Even a small raise. +$50.', gold: 50, rep: 10, corruption: 0 },
      { text: 'Threaten to resign if they cut funding', outcome: 'Risky gambit. Council backs down — they can\'t afford to lose you. But resentment brews.', gold: 30, rep: -3, corruption: 0 },
      { text: 'Accept the cuts gracefully', outcome: 'Budget reduced but council respects your selflessness. Tighter belt, warmer hearts.', gold: -30, rep: 12, corruption: 0 },
    ] },
  // Bounty Hunter Visit
  { type: 'bounty_hunter', name: 'The Hunter\'s Bargain', bodyguards: 0,
    desc: 'A dusty bounty hunter drops a stack of wanted posters on your desk. "I\'ve got three of these men in a wagon outside. $200 each or I take them to the next county."',
    choices: [
      { text: 'Pay $600 for all three prisoners', outcome: 'Three dangerous criminals behind bars. Your jail fills up but the streets are safer.', gold: -600, rep: 15, corruption: 0 },
      { text: 'Negotiate — $150 each', outcome: 'Hunter grumbles but accepts. $450 for three prisoners. Good deal.', gold: -450, rep: 12, corruption: 0 },
      { text: 'Tell him to move along', outcome: 'Hunter takes them to the next county. Their problem now. But your bounty board stays full.', gold: 0, rep: -3, corruption: 0 },
    ] },
  // Journalist Interview
  { type: 'journalist', name: 'Newspaper Interview', bodyguards: 0,
    desc: 'A reporter from the Frontier Gazette adjusts her spectacles. "Sheriff, our readers want to know: how do you feel about the state of law and order in this town? On the record."',
    choices: [
      { text: 'Give an honest, humble interview', outcome: 'Article paints you as dedicated and competent. Reputation boosted across the territory.', gold: 10, rep: 15, corruption: 0 },
      { text: 'Boast about your achievements', outcome: 'Article calls you "the greatest sheriff this side of the Pecos." Ego stroked, some eye-rolls.', gold: 5, rep: 8, corruption: 0 },
      { text: 'Refuse the interview — no comment', outcome: 'Article speculates wildly. "What is the sheriff hiding?" Rumors spread.', gold: 0, rep: -8, corruption: 0 },
    ] },
  // Deputy Report
  { type: 'deputy_report', name: 'Patrol Report', bodyguards: 0,
    desc: 'Your deputy returns from patrol, hat dusty and eyes tired. "Boss, I found tracks heading north. At least six riders. They\'ve set up camp in the old silver mine. Could be the Dalton gang."',
    choices: [
      { text: 'Ride out with a posse at dawn', outcome: 'Dawn raid on the mine. Dalton gang caught sleeping. Six arrests, zero casualties. Textbook.', gold: 80, rep: 22, corruption: 0 },
      { text: 'Send word to the Army', outcome: 'Army arrives in three days. Gang has moved by then. Professional but slow.', gold: 20, rep: 5, corruption: 0 },
      { text: 'Ignore it — outside our jurisdiction', outcome: 'Gang raids the town two days later. Your inaction had consequences.', gold: 0, rep: -15, corruption: 0 },
    ] },
  // Merchant Deal
  { type: 'merchant', name: 'Arms Dealer Offer', bodyguards: 0,
    desc: 'A well-dressed merchant opens a velvet-lined case. "Finest firearms from back East. I\'ll give you a lawman\'s discount — 40% off. These guns will keep your town safe."',
    choices: [
      { text: 'Buy a batch for the office (+20 ammo)', outcome: 'Quality weapons at a fair price. Your armory is well-stocked.', gold: -60, rep: 3, corruption: 0 },
      { text: 'Buy and resell at markup', outcome: 'Entrepreneurial spirit! You make $40 profit. Merchant respects the hustle.', gold: 40, rep: -2, corruption: 3 },
      { text: 'Inspect for stolen goods', outcome: 'Serial numbers filed off two pistols. Merchant arrested for trafficking. Good eye, Sheriff.', gold: 30, rep: 12, corruption: 0 },
    ] },
  // Citizen Petitions
  { type: 'petition', name: 'Build a School', bodyguards: 0,
    desc: 'A group of mothers arrives at your desk. "Sheriff, this town needs a proper school. Our children deserve better than a barn. We need your support at the council meeting."',
    choices: [
      { text: 'Champion the cause — attend the meeting', outcome: 'Your endorsement sways the council. School funded! Children cheer. Parents grateful.', gold: -20, rep: 18, corruption: 0 },
      { text: 'Promise to help — then forget about it', outcome: 'Empty promises remembered at election time. Trust eroded.', gold: 0, rep: -8, corruption: 0 },
      { text: 'Tell them it\'s not your jurisdiction', outcome: 'Technically true but heartless. The mothers leave disappointed.', gold: 0, rep: -5, corruption: 0 },
    ] },
  { type: 'petition', name: 'Clean Up Main Street', bodyguards: 0,
    desc: 'Business owners petition: "Sheriff, the drunks sleeping on Main Street are scaring customers. The horse manure is ankle-deep. We need law and order AND cleanliness."',
    choices: [
      { text: 'Organize a cleanup crew', outcome: 'Streets gleaming. Business booms. Small cost, big impact.', gold: -15, rep: 12, corruption: 0 },
      { text: 'Arrest the public drunks', outcome: 'Jail fills with harmless drunks. Real criminals get less attention. Questionable priorities.', gold: 10, rep: 3, corruption: 0 },
      { text: 'Tell them to hire a street sweeper', outcome: 'Passing the buck. But they do hire one. Problem solved without your help.', gold: 0, rep: -3, corruption: 0 },
    ] },
];

// ─────────────────────────────────────────────
// §4D  DREAM TEMPLATES
// ─────────────────────────────────────────────
var DREAM_TEMPLATES = [
  'You dream of wide-open plains stretching forever. A lone eagle circles overhead. Peace fills your chest.',
  'In the dream, your father hands you his badge. "Protect them," he says. "Even when they don\'t deserve it."',
  'You dream of a poker game with Death himself. He folds. You wake with a gold coin in your hand... wait, that\'s just a button.',
  'A vast desert. A single cactus blooms with golden flowers. You reach for one and it turns to dust.',
  'You dream of the town — but it\'s empty. Wind blows through open doors. Tumbleweeds roll down Main Street. Something terrible happened here.',
  'In the dream, you ride a horse made of lightning across a purple sky. It feels like freedom. You don\'t want to wake up.',
  'You dream of a woman singing in the saloon. Her voice is so beautiful that the clock stops. Time stands still.',
  'The dream is simple: you\'re fishing by a creek. No badge. No gun. Just water and sky. The fish aren\'t biting. You don\'t care.',
  'You dream you\'re defending the office against a hundred outlaws. Your guns never run out. Dawn breaks and they\'re all gone.',
  'In the dream, a coyote speaks to you. "The man with the scar knows the truth." You wake trying to remember what truth.',
  'You dream of gold — mountains of it — but every coin you touch turns to sand. Greed is a desert.',
  'The dream is a courtroom. You\'re the accused. The judge is your reflection. The verdict... you wake before it comes.',
];

var NIGHTMARE_TEMPLATES = [
  'You wake in a cold sweat. The faces of everyone you\'ve wronged stared from the darkness.',
  'A nightmare — the jail cells were empty and the outlaws were coming. You couldn\'t find your gun.',
  'You dreamed the town burned and you could only watch. The screams still echo.',
  'Nightmare: you looked in the mirror and saw a wanted poster with YOUR face. The bounty was $1,000.',
  'You dreamed you were buried alive. The dirt tasted like guilt.',
  'The nightmare showed you twenty years from now. The badge was tarnished. The town was gone.',
];

// ─────────────────────────────────────────────
// §4E  OFFICE EVENT TEMPLATES
// ─────────────────────────────────────────────
var OFFICE_EVENT_TEMPLATES = [
  { name: 'Rat Infestation', desc: 'Rats are everywhere! Chewing on case files and scurrying across your desk. Something must be done.',
    choices: [
      { text: 'Get a cat from the general store', outcome: 'A scrawny tabby takes up residence. Rats gone within a week. New office pet.', gold: -5, rep: 2 },
      { text: 'Set traps and clean the office', outcome: 'Messy work but effective. Office smells of cheese for days.', gold: -3, rep: 1 },
      { text: 'Ignore it — they were here first', outcome: 'Rats multiply. Case files chewed. Evidence contaminated. Not your finest moment.', gold: 0, rep: -5 },
    ] },
  { name: 'Stray Dog', desc: 'A mangy but friendly dog wanders into the office, tail wagging. It curls up by the stove and refuses to leave.',
    choices: [
      { text: 'Adopt it — every sheriff needs a dog', outcome: 'You name him and he becomes the office mascot. Prisoners like him. Visitors smile.', gold: -5, rep: 5, dog: true },
      { text: 'Feed it but don\'t keep it', outcome: 'The dog eats, wags its tail, and leaves. You feel oddly lonely.', gold: -2, rep: 0 },
      { text: 'Shoo it away', outcome: 'The dog whimpers and slinks out. Even the prisoners look disappointed.', gold: 0, rep: -3 },
    ] },
  { name: 'Broken Window', desc: 'You arrive to find your office window shattered. A rock with a note: "LEAVE TOWN OR ELSE." Threatening, but cowardly.',
    choices: [
      { text: 'Investigate — find who threw it', outcome: 'Fingerprints on the rock. A recently released prisoner. Re-arrested for threatening an officer.', gold: 10, rep: 8 },
      { text: 'Board it up and move on', outcome: 'Practical but the threat lingers. Town wonders if you\'re scared.', gold: -5, rep: -2 },
      { text: 'Display the note publicly — show no fear', outcome: '"Come get me." Bold move. The town respects your courage. The coward never tries again.', gold: 0, rep: 12 },
    ] },
  { name: 'Anonymous Tip', desc: 'An envelope slipped under the door. Inside: a map marking an outlaw hideout in the hills, with "ACT FAST" scrawled on it.',
    choices: [
      { text: 'Ride out immediately', outcome: 'The tip is good! Find a cache of stolen goods worth $200. The anonymous helper is never identified.', gold: 200, rep: 10 },
      { text: 'Set up surveillance first', outcome: 'Patient approach pays off. You catch the outlaws returning AND find the cache. Double win.', gold: 250, rep: 15 },
      { text: 'Ignore it — probably a trap', outcome: 'It wasn\'t a trap. The outlaws move the cache. Opportunity wasted.', gold: 0, rep: -5 },
    ] },
  { name: 'Flood Warning', desc: 'The creek is rising fast. Rain hasn\'t stopped in two days. The bridge might not hold. Your office is on high ground but the saloon district isn\'t.',
    choices: [
      { text: 'Organize an evacuation of low ground', outcome: 'Everyone moved to safety before the flood hits. Property damaged but no lives lost. Leadership.', gold: -10, rep: 20 },
      { text: 'Reinforce the bridge', outcome: 'Sandbagging works! Bridge holds. Town commerce continues. Exhausting but effective.', gold: -15, rep: 12 },
      { text: 'Wait and see — might not be that bad', outcome: 'It was that bad. Saloon flooded. Three horses drowned. You should have acted.', gold: 0, rep: -15 },
    ] },
  { name: 'Town Drunk Incident', desc: 'Old Jeb stumbled into your office, knocked over the filing cabinet, and passed out on the floor. He\'s snoring loudly.',
    choices: [
      { text: 'Let him sleep it off in a cell', outcome: 'Jeb wakes up grateful. Brings you apple pie next week. Kindness remembered.', gold: 0, rep: 5 },
      { text: 'Carry him to Doc\'s office', outcome: 'Doc checks him out. Jeb has a bad liver. Doc starts treating him. You might have saved his life.', gold: -5, rep: 8 },
      { text: 'Throw him out', outcome: 'Jeb stumbles into a horse trough. Whole town sees. You look heartless.', gold: 0, rep: -5 },
    ] },
  { name: 'Federal Inspector', desc: 'A stern man in a federal suit surveys your office. "I\'m Inspector Hayes. I\'m here to evaluate your operation. Show me your records."',
    choices: [
      { text: 'Present everything transparently', outcome: 'Inspector impressed with your thoroughness. Commendation letter sent to the governor.', gold: 50, rep: 15 },
      { text: 'Show him the highlights, hide the problems', outcome: 'He finds the problems anyway. "Integrity matters, Sheriff." Stern warning issued.', gold: 0, rep: -8 },
      { text: 'Refuse — your office, your rules', outcome: 'Inspector threatens to revoke your commission. You back down. Embarrassing.', gold: 0, rep: -12 },
    ] },
  { name: 'Office Fire', desc: 'The stove pipe burst! Flames lick the back wall. Smoke fills the room. Act fast or lose everything!',
    choices: [
      { text: 'Save the case files first', outcome: 'Files saved but the gun rack takes damage. One weapon lost. But the records survive.', gold: -20, rep: 5 },
      { text: 'Put out the fire immediately', outcome: 'Quick thinking with a bucket brigade. Minimal damage. Your desk is singed but intact.', gold: -10, rep: 8 },
      { text: 'Save the weapons and ammo', outcome: 'Guns saved but half your case files are ash. Completed cases lost from record.', gold: 0, rep: -5 },
    ] },
];

// ─────────────────────────────────────────────
// §4F  DEPUTY NAMES & TELEGRAM TEMPLATES
// ─────────────────────────────────────────────
var DEPUTY_NAMES = [
  'Jake Cooper', 'Billy Red Cloud', 'Tom Fitzgerald', 'Carlos Mendez',
  'Henry "Hank" Mitchell', 'Elijah Stone', 'Young Sam Porter', 'Dutch Williams',
  'Frank "Deadeye" Ross', 'Patrick O\'Brien', 'Isaiah Freeman', 'Cody Barnes',
];

var DOG_NAMES = ['Bandit', 'Dusty', 'Scout', 'Copper', 'Rex', 'Sheriff Jr.', 'Whiskey', 'Bullet'];

var TELEGRAM_TEMPLATES = [
  { text: 'STOP — Gang heading your direction from Tombstone STOP — Armed and dangerous STOP — Be prepared STOP', event: 'gang_raid' },
  { text: 'STOP — Federal bounty increased on a wanted outlaw STOP — Now $500 dead or alive STOP', event: 'bounty_target' },
  { text: 'STOP — Governor commends your service STOP — Keep up the good work STOP — $100 bonus enclosed STOP', event: 'governor_bonus' },
  { text: 'STOP — Smallpox outbreak in Silver Creek STOP — Quarantine advised STOP — Sick traveler heading your way STOP', event: 'sick_traveler' },
  { text: 'STOP — Railroad sending train through your town STOP — Expect arrival today STOP — High value cargo STOP', event: 'train_arriving' },
  { text: 'STOP — State prison break STOP — Three convicts heading west STOP — Armed and dangerous STOP', event: 'prison_break' },
  { text: 'STOP — Gold discovered in hills north of town STOP — Prospectors flooding in STOP — Prepare for trouble STOP', event: 'gold_rush' },
  { text: 'STOP — Circuit judge arriving STOP — Will hold trial for any prisoners STOP — Formal attire required STOP', event: 'judge_arrival' },
  { text: 'STOP — A stranger is hiding stolen goods in your town STOP — Investigate buildings STOP', event: 'hidden_goods' },
  { text: 'STOP — Mysterious drifter spotted heading toward town STOP — May be dangerous STOP — Watch closely STOP', event: 'mysterious_stranger' },
  { text: 'STOP — Cattle baron sending herd through town STOP — Keep roads clear STOP — Paying $50 for safe passage STOP', event: 'cattle_drive' },
  { text: 'STOP — Weapons shipment en route STOP — Bandits may intercept STOP — Guard the road STOP', event: 'arms_shipment' },
];

var LORE_BOOKS = [
  { title: 'The Lawman\'s Code', text: 'A worn leather book detailing proper procedure for arrests, interrogations, and evidence handling. You feel more competent. (+2 Rep)', rep: 2 },
  { title: 'Wild West Legends', text: 'Stories of Wyatt Earp, Doc Holliday, and Billy the Kid. Thrilling tales that remind you why you took the badge.', rep: 1 },
  { title: 'Frontier Medicine', text: 'A guide to treating gunshot wounds, snake bites, and consumption. Practical knowledge. (+1 HP next sleep)', hp: 1 },
  { title: 'The Art of War (translated)', text: 'Sun Tzu\'s ancient strategies applied to frontier conflict. "Know your enemy." (+5% case rewards today)', gold: 5 },
  { title: 'Town Charter', text: 'The founding document of your town. Reading it reminds you what you\'re protecting. (+3 Rep)', rep: 3 },
  { title: 'Criminal Psychology', text: 'A professor\'s notes on the criminal mind. Understanding motive helps solve cases faster.', rep: 2 },
  { title: 'Territorial Law Compendium', text: 'Every law on the books. Dry reading but essential reference for complex cases.', rep: 1 },
  { title: 'Personal Journal', text: 'Your own journal. Reading old entries reminds you of how far you\'ve come. Or how far you\'ve fallen.', rep: 0 },
];

// ─────────────────────────────────────────────
// §5  TYPEWRITER ENGINE
// ─────────────────────────────────────────────
var typewriter = {
  text: '',
  revealed: 0,
  speed: 25,
  timer: 0,
  done: false,
};

function twReset(text) {
  typewriter.text = text;
  typewriter.revealed = 0;
  typewriter.timer = 0;
  typewriter.done = false;
}

function twUpdate(dt) {
  if (typewriter.done) return;
  typewriter.timer += dt * 1000;
  while (typewriter.timer >= typewriter.speed && typewriter.revealed < typewriter.text.length) {
    typewriter.timer -= typewriter.speed;
    typewriter.revealed++;
  }
  if (typewriter.revealed >= typewriter.text.length) {
    typewriter.done = true;
  }
}

function twGetVisible() {
  return typewriter.text.substring(0, typewriter.revealed);
}

// ─────────────────────────────────────────────
// §6  DUST MOTES (ambient particles)
// ─────────────────────────────────────────────
function initDustMotes() {
  office.dustMotes = [];
  for (var i = 0; i < 25; i++) {
    office.dustMotes.push({
      x: Math.random() * gameCanvas.width,
      y: Math.random() * gameCanvas.height,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 2,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.25 + 0.05,
    });
  }
}

function initFlies() {
  office.flies = [];
  for (var i = 0; i < 4; i++) {
    office.flies.push({
      x: Math.random() * gameCanvas.width * 0.3 + gameCanvas.width * 0.05,
      y: Math.random() * gameCanvas.height * 0.3,
      angle: Math.random() * Math.PI * 2,
      speed: 15 + Math.random() * 25,
      turnTimer: 0,
    });
  }
  office.smokeParticles = [];
}

function updateFlies(dt) {
  for (var i = 0; i < office.flies.length; i++) {
    var f = office.flies[i];
    f.turnTimer -= dt;
    if (f.turnTimer <= 0) {
      f.angle += (Math.random() - 0.5) * 2.5;
      f.turnTimer = 0.1 + Math.random() * 0.3;
    }
    f.x += Math.cos(f.angle) * f.speed * dt;
    f.y += Math.sin(f.angle) * f.speed * dt;
    var w = gameCanvas.width, h = gameCanvas.height;
    if (f.x < 10 || f.x > w * 0.4 || f.y < 5 || f.y > h * 0.35) {
      f.angle += Math.PI;
      f.x = clamp(f.x, 15, w * 0.35);
      f.y = clamp(f.y, 10, h * 0.3);
    }
  }
  // Smoke from stove
  if (Math.random() < 0.15) {
    office.smokeParticles.push({
      x: gameCanvas.width * 0.08 + Math.random() * 10,
      y: gameCanvas.height * 0.28,
      vy: -8 - Math.random() * 12,
      vx: (Math.random() - 0.5) * 4,
      life: 1.5 + Math.random(),
      maxLife: 2.5,
      size: 2 + Math.random() * 3,
    });
  }
  for (var s = office.smokeParticles.length - 1; s >= 0; s--) {
    var sp = office.smokeParticles[s];
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.life -= dt;
    if (sp.life <= 0) office.smokeParticles.splice(s, 1);
  }
}

function updateDustMotes(dt) {
  var w = gameCanvas.width, h = gameCanvas.height;
  for (var i = 0; i < office.dustMotes.length; i++) {
    var m = office.dustMotes[i];
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.alpha += (Math.random() - 0.5) * 0.01;
    if (m.alpha < 0.03) m.alpha = 0.03;
    if (m.alpha > 0.35) m.alpha = 0.35;
    if (m.y > h) { m.y = -2; m.x = Math.random() * w; }
    if (m.x < 0) m.x = w;
    if (m.x > w) m.x = 0;
  }
}

// ─────────────────────────────────────────────
// §7  ENTER / EXIT OFFICE
// ─────────────────────────────────────────────
function enterSheriffOffice() {
  office.active = true;
  office.sittingAtDesk = false;
  office.selectedZone = 0;
  office.viewingBoard = false;
  office.viewingJail = false;
  office.viewingGunRack = false;
  office.viewingBed = false;
  office.viewingStats = false;
  office.viewingDeputies = false;
  office.upgradeMenuOpen = false;
  office.craftingOpen = false;
  office.currentCase = null;
  office.currentMeeting = null;
  office.showingOutcome = false;
  office.caseChoiceVisible = false;
  office.meetingChoiceVisible = false;
  office.waitingForCase = false;
  office.sleeping = false;
  office.deskMode = 'main';
  office.playingDarts = false;
  office.targetPractice = false;
  office.fadeIn = 1;
  office.nearFurniture = null;
  // Start player near the exit door (bottom center)
  var W = gameCanvas.width, H = gameCanvas.height;
  office.playerX = W * 0.50;
  office.playerY = H * 0.86;
  office.playerDir = 1; // facing up
  office.playerMoving = false;
  office.playerAnimTimer = 0;
  game.state = 'office';
  initDustMotes();
  initFlies();

  // Daily ammo bonus from gun rack upgrade
  if (office._ammoGivenDay !== game.dayCount) {
    if (office.upgrades.gunRack >= 1) {
      var bonus = office.upgrades.gunRack >= 2 ? 10 : 5;
      game.ammo = Math.min((game.ammo || 0) + bonus, MAX_AMMO_CAP);
      showNotification('+' + bonus + ' ammo from gun rack');
    }
    if (office.upgrades.gunRack >= 2) {
      game.gunDurability = 100;
    }
    office._ammoGivenDay = game.dayCount;
  }

  // Record rep history
  if (office.repHistory.length === 0 || office.repHistory[office.repHistory.length - 1].day !== (game.dayCount || 1)) {
    office.repHistory.push({ day: game.dayCount || 1, rep: game.reputation || 50 });
    if (office.repHistory.length > 30) office.repHistory.shift();
  }

  // Generate daily meeting queue
  if (office._lastMeetingDay !== (game.dayCount || 1)) {
    office._lastMeetingDay = game.dayCount || 1;
    office.meetingQueue = [];
    var meetCount = rand(1, 3);
    for (var mi = 0; mi < meetCount; mi++) {
      var mt = MEETING_TEMPLATES[rand(0, MEETING_TEMPLATES.length - 1)];
      // Boss meetings only if corruption > 20 or corrupt mode
      if (mt.type === 'boss' && (game.corruption || 0) < 20 && !game._corruptMode) {
        mt = MEETING_TEMPLATES[rand(4, MEETING_TEMPLATES.length - 1)]; // pick non-boss
      }
      var bossName = BOSS_NAMES[rand(0, BOSS_NAMES.length - 1)];
      office.meetingQueue.push({
        type: mt.type,
        name: mt.name,
        bodyguards: mt.bodyguards || 0,
        desc: mt.desc.replace(/\{boss\}/g, bossName),
        choices: mt.choices.map(function(c) {
          return {
            text: c.text, outcome: c.outcome.replace(/\{boss\}/g, bossName),
            gold: c.gold, rep: c.rep, corruption: c.corruption || 0
          };
        }),
        bossName: bossName,
      });
    }
  }

  // Generate daily telegram (now triggers real world events)
  if (office.telegrams.length === 0 || (office.telegrams[office.telegrams.length - 1].day !== (game.dayCount || 1) && Math.random() < 0.5)) {
    var tmpl = TELEGRAM_TEMPLATES[rand(0, TELEGRAM_TEMPLATES.length - 1)];
    office.telegrams.push({
      text: tmpl.text,
      event: tmpl.event,
      day: game.dayCount || 1,
      read: false,
      triggered: false,
    });
    if (office.telegrams.length > 10) office.telegrams.shift();
  }

  // Deputy salary deduction
  for (var di = 0; di < office.deputies.length; di++) {
    var dep = office.deputies[di];
    if (dep._lastPaidDay !== (game.dayCount || 1)) {
      dep._lastPaidDay = game.dayCount || 1;
      var salary = 10 + dep.skill * 5;
      if ((game.gold || 0) >= salary) {
        game.gold -= salary;
        dep.loyalty = Math.min(100, dep.loyalty + 2);
      } else {
        dep.loyalty = Math.max(0, dep.loyalty - 15);
        if (dep.loyalty <= 0) {
          showNotification(dep.name + ' quit — you couldn\'t pay them!');
          office.deputies.splice(di, 1);
          di--;
        }
      }
    }
  }

  // Prisoner mood decay
  for (var pi = 0; pi < office.prisoners.length; pi++) {
    var pr = office.prisoners[pi];
    if (pr.mood === undefined) pr.mood = 60;
    pr.mood = Math.max(0, pr.mood - rand(2, 8));
    if (pr.fed) { pr.fed = false; } // reset daily feeding
  }

  // Random office event
  if (office._lastEventDay !== (game.dayCount || 1) && Math.random() < 0.18) {
    office._lastEventDay = game.dayCount || 1;
    office.officeEvent = OFFICE_EVENT_TEMPLATES[rand(0, OFFICE_EVENT_TEMPLATES.length - 1)];
  }

  // Requisition delivery
  for (var ri = office.pendingRequisitions.length - 1; ri >= 0; ri--) {
    var req = office.pendingRequisitions[ri];
    if ((game.dayCount || 1) >= req.deliveryDay) {
      if (req.type === 'ammo') {
        game.ammo = Math.min((game.ammo || 0) + req.amount, MAX_AMMO_CAP);
        showNotification('Ammo requisition arrived! +' + req.amount);
      } else if (req.type === 'tonic') {
        game.healthTonics = (game.healthTonics || 0) + req.amount;
        showNotification('Health tonics delivered! +' + req.amount);
      }
      office.pendingRequisitions.splice(ri, 1);
    }
  }

  // Check for trophies
  checkTrophies();

  // Random prisoner event (bribe/escape attempt)
  if (office.prisoners.length > 0 && Math.random() < 0.15) {
    var evtPrisoner = office.prisoners[rand(0, office.prisoners.length - 1)];
    if (evtPrisoner.mood < 30 && Math.random() < 0.5) {
      office.prisonerEvent = {
        type: 'escape',
        prisoner: evtPrisoner,
        desc: evtPrisoner.name + ' is attempting to escape from the jail!',
        choices: ['[1] Subdue (+5 Rep, prisoner mood -20)', '[2] Let them go (prisoner released, -3 Rep)']
      };
    } else if (Math.random() < 0.4) {
      var bribeAmt = rand(20, 80);
      office.prisonerEvent = {
        type: 'bribe',
        prisoner: evtPrisoner,
        amount: bribeAmt,
        desc: evtPrisoner.name + ' offers you $' + bribeAmt + ' for their freedom.',
        choices: ['[1] Accept bribe (+$' + bribeAmt + ', +5 Corruption, prisoner released)', '[2] Refuse (+3 Rep, prisoner mood -10)']
      };
    }
  }

  // Reset new views
  office.readingBook = false;
  office.viewingWanted = false;
  office.viewingNotices = false;
  office.prisonerEvent = null;
  office.playingSolitaire = false;
}

function exitSheriffOffice() {
  office.active = false;
  office.sittingAtDesk = false;
  office.currentCase = null;
  office.showingOutcome = false;
  game.state = 'playing';
}

// ─────────────────────────────────────────────
// §8  CASE GENERATION
// ─────────────────────────────────────────────
function generateNewCase() {
  // Check if a villain proposal should appear instead
  var corruption = game.corruption || 0;
  var corruptCode = game._corruptStart || game._corruptMode;

  // Villain chance: with corrupt code = 50%, otherwise scales with corruption
  var villainChance = corruptCode ? 0.5 : (corruption >= 40 ? (corruption / 200) : 0);
  if (Math.random() < villainChance && VILLAIN_PROPOSALS.length > 0) {
    return generateVillainProposal();
  }

  var activeNames = office.activeCases.map(function(c) { return c.name; });
  var recentNames = office.completedCases.slice(-8).map(function(c) { return c.name; });
  var pool = CASE_TEMPLATES.filter(function(t) {
    return activeNames.indexOf(t.name) === -1 && recentNames.indexOf(t.name) === -1;
  });
  if (pool.length === 0) pool = CASE_TEMPLATES.slice();

  // Weight by difficulty vs day count
  var dayFactor = Math.min((game.dayCount || 1) / 12, 1);
  var weighted = [];
  var totalW = 0;
  for (var i = 0; i < pool.length; i++) {
    var t = pool[i];
    var w = 1;
    if (t.difficulty <= 2) w = 1.5 - dayFactor * 0.8;
    else if (t.difficulty >= 4) w = 0.4 + dayFactor * 1.0;
    w = Math.max(0.1, w);
    totalW += w;
    weighted.push({ template: t, weight: w });
  }

  var r = Math.random() * totalW;
  var chosen = weighted[0].template;
  for (var j = 0; j < weighted.length; j++) {
    r -= weighted[j].weight;
    if (r <= 0) { chosen = weighted[j].template; break; }
  }

  return {
    name: chosen.name,
    category: chosen.category,
    difficulty: chosen.difficulty,
    description: chosen.description,
    choices: chosen.choices.slice(),
    resolved: false,
    choiceMade: -1,
    outcome: '',
    rewardGold: 0,
    rewardRep: 0,
    day: game.dayCount || 1,
  };
}

function generateVillainProposal() {
  var villainName = VILLAIN_NAMES[rand(0, VILLAIN_NAMES.length - 1)];
  var template = VILLAIN_PROPOSALS[rand(0, VILLAIN_PROPOSALS.length - 1)];

  // Replace {villain} in all strings
  var desc = template.desc.replace(/\{villain\}/g, villainName);
  var choices = [];
  for (var i = 0; i < template.choices.length; i++) {
    var ch = template.choices[i];
    choices.push({
      text: ch.text,
      outcome: ch.outcome.replace(/\{villain\}/g, villainName),
      gold: ch.gold,
      rep: ch.rep,
      corruption: ch.corruption || 0,
      arrest: false
    });
  }

  return {
    name: template.name,
    category: 'villain',
    difficulty: 5,
    description: desc,
    choices: choices,
    resolved: false,
    choiceMade: -1,
    outcome: '',
    rewardGold: 0,
    rewardRep: 0,
    day: game.dayCount || 1,
    isVillainProposal: true,
    villainName: villainName,
  };
}

function getMaxPrisoners() {
  return 2 + office.upgrades.jailCells * 2;
}

// ─────────────────────────────────────────────
// §9  UPDATE OFFICE — called every frame
// ─────────────────────────────────────────────
function updateOffice(dt) {
  // ── Check if player is near sheriff office door and presses E ──
  if (game.state === 'playing' && !office.active) {
    // Check for world events from telegrams
    updateHiddenCrates();
    updateMysteryStrangers();
    // Draw hidden crate indicators
    if (game._hiddenCrates && game._hiddenCrates.length > 0) {
      game._hasHiddenCrates = true;
    }

    var sheriffBuilding = null;
    for (var bi = 0; bi < game.buildings.length; bi++) {
      if (game.buildings[bi].type === BUILDING_TYPES.SHERIFF) {
        sheriffBuilding = game.buildings[bi];
        break;
      }
    }
    if (sheriffBuilding) {
      var px = game.player.x / TILE;
      var py = game.player.y / TILE;
      var ddx = Math.abs(px - sheriffBuilding.doorX);
      var ddy = Math.abs(py - (sheriffBuilding.doorY + 1));
      // Auto-enter when walking right into the door (skip first 2 seconds to avoid spawn-enter)
      if (ddx < 1.2 && ddy < 1.2 && (game._gameTime || 0) > 2) {
        enterSheriffOffice();
        return;
      }
      // Also allow E key from a bit further away
      if (ddx < 3 && ddy < 3 && consumeKey('KeyE')) {
        enterSheriffOffice();
        return;
      }
    }
    return;
  }

  if (game.state !== 'office') return;

  // Fade in
  if (office.fadeIn < 1) office.fadeIn = Math.min(1, office.fadeIn + dt * 3);

  // Animation timers
  office.clockSwing += dt * 2.2;
  office.lampFlicker += dt * 8;
  updateDustMotes(dt);
  updateFlies(dt);

  // ── SHOWING OUTCOME ──
  if (office.showingOutcome) {
    twUpdate(dt);
    if (typewriter.done && (consumeKey('KeyE') || consumeKey('Space') || consumeKey('Enter'))) {
      office.showingOutcome = false;
      office.currentCase = null;
      office.caseChoiceVisible = false;
      office.sittingAtDesk = true;
      office.waitingForCase = false;
    }
    return;
  }

  // ── ACTIVE CASE (typewriter reveal + choices) ──
  if (office.currentCase && !office.currentCase.resolved) {
    twUpdate(dt);
    if (typewriter.done && !office.caseChoiceVisible) {
      office.caseChoiceVisible = true;
    }
    if (office.caseChoiceVisible) {
      for (var ci = 0; ci < office.currentCase.choices.length; ci++) {
        if (consumeKey('Digit' + (ci + 1))) {
          resolveCaseChoice(ci);
          return;
        }
      }
    }
    if (!typewriter.done && (consumeKey('Space') || consumeKey('Enter'))) {
      typewriter.revealed = typewriter.text.length;
      typewriter.done = true;
    }
    return;
  }

  // ── UPGRADE MENU ──
  if (office.upgradeMenuOpen) {
    if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
      office.selectedUpgrade = (office.selectedUpgrade - 1 + OFFICE_UPGRADES.length) % OFFICE_UPGRADES.length;
    }
    if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
      office.selectedUpgrade = (office.selectedUpgrade + 1) % OFFICE_UPGRADES.length;
    }
    if (consumeKey('KeyE') || consumeKey('Enter')) {
      purchaseOfficeUpgrade(office.selectedUpgrade);
    }
    if (consumeKey('Escape') || consumeKey('KeyQ')) {
      office.upgradeMenuOpen = false;
    }
    return;
  }

  // ── CASE BOARD ──
  if (office.viewingBoard) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) {
      office.viewingBoard = false;
    }
    if (consumeKey('Tab')) {
      office.boardTab = 1 - office.boardTab;
    }
    if (consumeKey('ArrowUp') || consumeKey('KeyW')) office.boardScroll = Math.max(0, office.boardScroll - 1);
    if (consumeKey('ArrowDown') || consumeKey('KeyS')) office.boardScroll++;
    return;
  }

  // ── JAIL VIEW ──
  if (office.viewingJail) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) {
      office.viewingJail = false;
    }
    if (office.prisoners.length > 0) {
      if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
        office.selectedPrisoner = (office.selectedPrisoner - 1 + office.prisoners.length) % office.prisoners.length;
      }
      if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
        office.selectedPrisoner = (office.selectedPrisoner + 1) % office.prisoners.length;
      }
      if (consumeKey('Digit1')) doJailAction(0); // Release
      if (consumeKey('Digit2')) doJailAction(1); // Interrogate
      if (consumeKey('Digit3')) doJailAction(2); // Execute
      if (consumeKey('KeyF')) doJailAction(3);   // Feed
      if (consumeKey('KeyT')) doJailAction(4);   // Transfer
      if (consumeKey('KeyX')) doJailAction(5);   // Work detail
    }
    return;
  }

  // ── GUN RACK ──
  if (office.viewingGunRack) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) {
      office.viewingGunRack = false;
    }
    if (consumeKey('KeyU')) {
      office.upgradeMenuOpen = true;
      office.selectedUpgrade = 0;
    }
    if (consumeKey('KeyD')) {
      office.playingDarts = true;
      office.dartPhase = 0;
      office.dartPower = 0;
      office.dartRounds = 0;
      office.dartScore = 0;
      office.viewingGunRack = false;
    }
    if (consumeKey('KeyT')) {
      office.targetPractice = true;
      office.targetPhase = 0;
      office.targetTimer = 0;
      office.targetScore = 0;
      office.viewingGunRack = false;
    }
    return;
  }

  // ── SLEEPING ──
  if (office.sleeping) {
    office.sleepTimer -= dt;
    if (office.sleepTimer <= 0) {
      office.sleeping = false;
      var bedLvl = office.upgrades.bed || 0;
      var hpRestore = bedLvl >= 2 ? (game.player.maxHp || 5) : (bedLvl >= 1 ? 3 : 2);
      if (office.nightmareActive) { hpRestore = 1; office.nightmareActive = false; }
      game.player.hp = Math.min((game.player.maxHp || 5), (game.player.hp || 1) + hpRestore);
      game.time = Math.min(1, (game.time || 0) + office.sleepHours / 24);
      if (game.time >= 1) { game.time -= 1; game.dayCount = (game.dayCount || 1) + 1; }
      showNotification('Rested! +' + hpRestore + ' HP');
      if (office.dreamText) {
        twReset(office.dreamText);
        office.showingOutcome = true;
      }
      office.viewingBed = true;
    }
    return;
  }

  // ── OFFICE EVENT ──
  if (office.officeEvent) {
    if (!office._eventShown) {
      office._eventShown = true;
      twReset(office.officeEvent.name + '\n\n' + office.officeEvent.desc);
      office.caseChoiceVisible = false;
    }
    twUpdate(dt);
    if (typewriter.done && !office.caseChoiceVisible) office.caseChoiceVisible = true;
    if (office.caseChoiceVisible) {
      for (var ei = 0; ei < office.officeEvent.choices.length; ei++) {
        if (consumeKey('Digit' + (ei + 1))) {
          resolveOfficeEvent(ei);
          return;
        }
      }
    }
    if (!typewriter.done && (consumeKey('Space') || consumeKey('Enter'))) {
      typewriter.revealed = typewriter.text.length; typewriter.done = true;
    }
    return;
  }

  // ── MEETING ──
  if (office.currentMeeting) {
    twUpdate(dt);
    if (typewriter.done && !office.meetingChoiceVisible) office.meetingChoiceVisible = true;
    if (office.meetingChoiceVisible) {
      for (var mci = 0; mci < office.currentMeeting.choices.length; mci++) {
        if (consumeKey('Digit' + (mci + 1))) {
          resolveMeeting(mci);
          return;
        }
      }
    }
    if (!typewriter.done && (consumeKey('Space') || consumeKey('Enter'))) {
      typewriter.revealed = typewriter.text.length; typewriter.done = true;
    }
    return;
  }

  // ── BED VIEW ──
  if (office.viewingBed) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.viewingBed = false; }
    if (consumeKey('KeyE') || consumeKey('Enter')) {
      if (office._lastSleepDay === (game.dayCount || 1)) {
        showNotification('You already slept today. Can\'t sleep again until tomorrow.');
      } else {
        office._lastSleepDay = game.dayCount || 1;
        office.sleeping = true;
        office.sleepTimer = 2.5;
        // Dream or nightmare
        var corruption = game.corruption || 0;
        if (corruption > 50 && Math.random() < 0.3) {
          office.nightmareActive = true;
          office.dreamText = NIGHTMARE_TEMPLATES[rand(0, NIGHTMARE_TEMPLATES.length - 1)];
          office.sleepTimer = 1.5;
        } else if (office.upgrades.bed >= 2 && Math.random() < 0.6) {
          office.dreamText = DREAM_TEMPLATES[rand(0, DREAM_TEMPLATES.length - 1)];
        } else {
          office.dreamText = '';
        }
      }
    }
    return;
  }

  // ── STATS / RECORDS VIEW ──
  if (office.viewingStats) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.viewingStats = false; }
    if (consumeKey('Tab')) { office.statsTab = (office.statsTab + 1) % 4; }
    return;
  }

  // ── DEPUTIES VIEW ──
  if (office.viewingDeputies) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.viewingDeputies = false; }
    if (office.deputies.length > 0) {
      if (consumeKey('ArrowUp') || consumeKey('KeyW')) office.selectedDeputy = (office.selectedDeputy - 1 + office.deputies.length) % office.deputies.length;
      if (consumeKey('ArrowDown') || consumeKey('KeyS')) office.selectedDeputy = (office.selectedDeputy + 1) % office.deputies.length;
      if (consumeKey('Digit1')) deputyAction('patrol');
      if (consumeKey('Digit2')) deputyAction('train');
      if (consumeKey('Digit3')) deputyAction('fire');
    }
    if (consumeKey('KeyH')) hireDeputy();
    return;
  }

  // ── CRAFTING VIEW ──
  if (office.craftingOpen) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.craftingOpen = false; }
    if (consumeKey('Digit1')) craftItem('silver_bullets');
    if (consumeKey('Digit2')) craftItem('tonic');
    if (consumeKey('Digit3')) craftItem('badge_polish');
    if (consumeKey('Digit4') && (game.corruption || 0) >= 30) craftItem('forge_documents');
    if (consumeKey('Digit5')) craftItem('requisition_ammo');
    if (consumeKey('Digit6')) craftItem('requisition_tonic');
    return;
  }

  // ── READING A BOOK ──
  if (office.readingBook) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.readingBook = false; }
    if (consumeKey('ArrowDown') || consumeKey('KeyS')) {
      office.selectedBook = (office.selectedBook + 1) % LORE_BOOKS.length;
    }
    if (consumeKey('ArrowUp') || consumeKey('KeyW')) {
      office.selectedBook = (office.selectedBook - 1 + LORE_BOOKS.length) % LORE_BOOKS.length;
    }
    if (consumeKey('KeyE') || consumeKey('Enter')) {
      office.bookRead[office.selectedBook] = true;
      // Reading grants small rep bonus first time
      if (!office.bookRead['_bonus_' + office.selectedBook]) {
        office.bookRead['_bonus_' + office.selectedBook] = true;
        game.reputation = clamp((game.reputation || 50) + 1, 0, REPUTATION_MAX);
        showNotification('Interesting read! +1 Rep (knowledge is power)');
      }
    }
    return;
  }

  // ── WANTED POSTER BOARD ──
  if (office.viewingWanted) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.viewingWanted = false; }
    return;
  }

  // ── NOTICE BOARD ──
  if (office.viewingNotices) {
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.viewingNotices = false; }
    return;
  }

  // ── PRISONER EVENT ──
  if (office.prisonerEvent) {
    if (consumeKey('Digit1')) {
      resolvePrisonerEvent(0);
    }
    if (consumeKey('Digit2')) {
      resolvePrisonerEvent(1);
    }
    return;
  }

  // ── SOLITAIRE ──
  if (office.playingSolitaire) {
    updateSolitaire(dt);
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.playingSolitaire = false; }
    return;
  }

  // ── DARTS MINI-GAME ──
  if (office.playingDarts) {
    updateDarts(dt);
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.playingDarts = false; }
    return;
  }

  // ── TARGET PRACTICE ──
  if (office.targetPractice) {
    updateTargetPractice(dt);
    if (consumeKey('Escape') || consumeKey('KeyQ')) { office.targetPractice = false; }
    return;
  }

  // ── SITTING AT DESK (expanded with sub-menu) ──
  if (office.sittingAtDesk) {
    if (office.deskMode === 'telegraph') {
      if (consumeKey('Escape') || consumeKey('KeyQ')) { office.deskMode = 'main'; }
      // Mark telegrams read and trigger events
      for (var ti = 0; ti < office.telegrams.length; ti++) {
        office.telegrams[ti].read = true;
        if (!office.telegrams[ti].triggered && office.telegrams[ti].event) {
          office.telegrams[ti].triggered = true;
          triggerTelegramEvent(office.telegrams[ti].event);
        }
      }
      return;
    }
    if (office.deskMode === 'drawers') {
      if (consumeKey('Escape') || consumeKey('KeyQ')) { office.deskMode = 'main'; }
      if (consumeKey('KeyE') || consumeKey('Enter')) {
        if (office._drawerSearchedDay === (game.dayCount || 1)) {
          showNotification('Nothing new in the drawers today.');
        } else {
          office._drawerSearchedDay = game.dayCount || 1;
          var drawerGold = rand(2, 15);
          game.gold = (game.gold || 0) + drawerGold;
          game.totalGoldEarned = (game.totalGoldEarned || 0) + drawerGold;
          showNotification('Found $' + drawerGold + ' in the desk drawer!');
          if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
        }
      }
      return;
    }
    if (office.deskMode === 'coffee') {
      if (consumeKey('Escape') || consumeKey('KeyQ')) { office.deskMode = 'main'; }
      if (consumeKey('KeyE') || consumeKey('Enter')) {
        if (office._coffeeBrewedDay === (game.dayCount || 1)) {
          showNotification('Already had coffee today. Any more and you\'ll vibrate.');
        } else {
          office._coffeeBrewedDay = game.dayCount || 1;
          office._coffeeCount = (office._coffeeCount || 0) + 1;
          game._coffeeBoost = true;
          game._coffeeTimer = 120;
          showNotification('Coffee brewed! Speed boost for 2 minutes.');
          if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
        }
      }
      return;
    }
    if (office.deskMode === 'meetings') {
      if (consumeKey('Escape') || consumeKey('KeyQ')) { office.deskMode = 'main'; }
      if (office.meetingQueue.length > 0) {
        for (var mqi = 0; mqi < Math.min(office.meetingQueue.length, 3); mqi++) {
          if (consumeKey('Digit' + (mqi + 1))) {
            var mtg = office.meetingQueue.splice(mqi, 1)[0];
            office.currentMeeting = mtg;
            office.meetingChoiceVisible = false;
            var bodyguardText = mtg.bodyguards > 0 ? ' [' + mtg.bodyguards + ' armed bodyguards present]' : '';
            twReset('[MEETING: ' + mtg.name + ']' + bodyguardText + '\n\n' + mtg.desc);
            office.deskMode = 'main';
            return;
          }
        }
      }
      return;
    }

    // Main desk menu
    if (office.waitingForCase) {
      office.waitTimer += dt;
      if (office.waitTimer >= 1.8) {
        var newCase = generateNewCase();
        office.currentCase = newCase;
        office.activeCases.push(newCase);
        office.visitorNPCName = newCase.isVillainProposal ? newCase.villainName : VISITOR_NAMES[rand(0, VISITOR_NAMES.length - 1)];
        var catLabel = newCase.isVillainProposal ? '⚠ VILLAIN PROPOSAL' : (newCase.category.charAt(0).toUpperCase() + newCase.category.slice(1));
        var stars = '';
        for (var si = 0; si < newCase.difficulty; si++) stars += '*';
        twReset('[' + catLabel + ' | Difficulty: ' + stars + ']\n\n' + newCase.name + '\n\n' + newCase.description);
        office.caseChoiceVisible = false;
        office.showingOutcome = false;
        office.waitingForCase = false;
        if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      }
    } else if (!office.currentCase) {
      if (consumeKey('KeyE') || consumeKey('Enter')) {
        office.waitingForCase = true;
        office.waitTimer = 0;
        office.visitorNPCName = VISITOR_NAMES[rand(0, VISITOR_NAMES.length - 1)];
      }
      if (consumeKey('KeyC')) { office.deskMode = 'coffee'; }
      if (consumeKey('KeyT')) { office.deskMode = 'telegraph'; }
      if (consumeKey('KeyX')) { office.deskMode = 'drawers'; }
      if (consumeKey('KeyM')) { office.deskMode = 'meetings'; }
      if (consumeKey('KeyN')) { office.craftingOpen = true; }
      if (consumeKey('KeyP')) { office.viewingDeputies = true; office.selectedDeputy = 0; }
      if (consumeKey('KeyB')) { office.readingBook = true; office.selectedBook = 0; }
      if (consumeKey('KeyL')) { office.playingSolitaire = true; initSolitaire(); }
      if (consumeKey('KeyO')) { toggleMusicBox(); }
      if (consumeKey('KeyG')) { interactWithDog(); }
      if (consumeKey('KeyJ')) { useSpittoon(); }
      if (consumeKey('Escape') || consumeKey('KeyQ')) {
        office.sittingAtDesk = false;
        office.deskMode = 'main';
      }
    }
    return;
  }

  // ── WALKABLE OFFICE — WASD MOVEMENT ──
  var W = gameCanvas.width, H = gameCanvas.height;
  var dx = 0, dy = 0;

  if (keys['KeyW'] || keys['ArrowUp'])    { dy = -1; office.playerDir = 1; }
  if (keys['KeyS'] || keys['ArrowDown'])   { dy = 1;  office.playerDir = 0; }
  if (keys['KeyA'] || keys['ArrowLeft'])   { dx = -1; office.playerDir = 2; }
  if (keys['KeyD'] || keys['ArrowRight'])  { dx = 1;  office.playerDir = 3; }

  office.playerMoving = dx !== 0 || dy !== 0;

  if (office.playerMoving) {
    var len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    var nx = office.playerX + dx * OFFICE_PLAYER_SPEED;
    var ny = office.playerY + dy * OFFICE_PLAYER_SPEED;
    if (!officeCollides(nx, office.playerY, W, H)) office.playerX = nx;
    if (!officeCollides(office.playerX, ny, W, H)) office.playerY = ny;
    office.playerAnimTimer++;
  }

  // Find nearest furniture
  office.nearFurniture = findNearFurniture(W, H);

  // E key — interact with nearest furniture
  if (office.nearFurniture && consumeKey('KeyE')) {
    switch (office.nearFurniture.key) {
      case 'desk': office.sittingAtDesk = true; office.waitingForCase = false; office.deskMode = 'main'; break;
      case 'caseBoard': office.viewingBoard = true; office.boardScroll = 0; break;
      case 'gunRack': office.viewingGunRack = true; break;
      case 'jailCells': office.viewingJail = true; office.selectedPrisoner = 0; break;
      case 'bed': office.viewingBed = true; break;
      case 'records': office.viewingStats = true; office.statsTab = 0; break;
      case 'wanted': office.viewingWanted = true; generateWantedPosters(); break;
      case 'notices': office.viewingNotices = true; generateNotices(); break;
      case 'bookshelf': office.readingBook = true; office.selectedBook = 0; break;
      case 'stove': office.deskMode = 'coffee'; office.sittingAtDesk = true; break;
      case 'exit': exitSheriffOffice(); break;
    }
    return;
  }

  // ESC — only exit if near exit door, otherwise do nothing
  if (consumeKey('Escape')) {
    exitSheriffOffice();
    return;
  }

  // U key for upgrades while walking
  if (consumeKey('KeyU')) { office.upgradeMenuOpen = true; office.selectedUpgrade = 0; return; }
}

// ─────────────────────────────────────────────
// §10  RESOLVE CASE CHOICE
// ─────────────────────────────────────────────
function resolveCaseChoice(choiceIdx) {
  var c = office.currentCase;
  if (!c || c.resolved) return;
  var choice = c.choices[choiceIdx];
  c.resolved = true;
  c.choiceMade = choiceIdx;
  c.outcome = choice.outcome;

  // Reward multipliers
  var goldMult = office.upgrades.desk >= 2 ? 1.2 : 1.0;
  var repMult = 1.0;
  if (office.upgrades.decor >= 2) repMult = 1.15;
  else if (office.upgrades.decor >= 1) repMult = 1.05;

  var diffObj = (typeof DIFFICULTY !== 'undefined' && game.difficulty && DIFFICULTY[game.difficulty]) ? DIFFICULTY[game.difficulty] : null;
  var rewardM = diffObj ? (diffObj.rewardMult || 1) : 1;
  var repGainM = diffObj ? (diffObj.repGainMult || 1) : 1;
  var repLossM = diffObj ? (diffObj.repLossMult || 1) : 1;

  var earnedGold = Math.max(0, Math.round(choice.gold * goldMult * rewardM));
  var earnedRep = choice.rep > 0
    ? Math.round(choice.rep * repMult * repGainM)
    : Math.round(choice.rep * repLossM);

  c.rewardGold = earnedGold;
  c.rewardRep = earnedRep;

  game.gold = (game.gold || 0) + earnedGold;
  game.reputation = clamp((game.reputation || 50) + earnedRep, 0, REPUTATION_MAX);
  if (earnedGold > 0) game.totalGoldEarned = (game.totalGoldEarned || 0) + earnedGold;

  // Move from active to completed
  var idx = office.activeCases.indexOf(c);
  if (idx !== -1) office.activeCases.splice(idx, 1);
  office.completedCases.push(c);

  // Arrest -> prisoner
  if (choice.arrest && office.prisoners.length < getMaxPrisoners()) {
    office.prisoners.push({
      name: c.isVillainProposal ? c.villainName : randomPrisonerName(),
      crime: c.name,
      day: game.dayCount || 1,
      interrogated: false,
    });
  }

  // Apply corruption change from villain proposals
  if (c.isVillainProposal && choice.corruption) {
    game.corruption = clamp((game.corruption || 0) + choice.corruption, 0, 100);
    var corrSign = choice.corruption > 0 ? '+' : '';
    addJournalEntry('Case closed: ' + c.name + '. ' + (earnedRep >= 0 ? '+' : '') + earnedRep + ' Rep, +$' + earnedGold + ', ' + corrSign + choice.corruption + ' Corruption');
    if (choice.corruption > 0) {
      showNotification(corrSign + choice.corruption + ' Corruption');
    }
  } else {
    addJournalEntry('Case closed: ' + c.name + '. ' + (earnedRep >= 0 ? '+' : '') + earnedRep + ' Rep, +$' + earnedGold);
  }

  if (earnedRep >= 0) {
    if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
  } else {
    if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
  }

  var rewardLine = '\n\n' + (earnedRep >= 0 ? '+' : '') + earnedRep + ' Reputation  |  +$' + earnedGold + ' Gold';
  twReset(choice.outcome + rewardLine);
  office.showingOutcome = true;
  office.caseOutcomeTimer = 0;
}

var PRISONER_NAMES = [
  'Hank "Snake-Eyes" Ritter', 'Crazy Clem Foss', 'Big Nose Bartley',
  'Whiskey Jack Monroe', 'Rattlesnake Reeves', 'Iron Mike Conroy',
  'Two-Finger Tommy', 'Scarface Sal Ruiz', 'Lefty Patterson',
  'Gila Bill Harmon', 'Dusty Dan Blackwood', 'One-Shot O\'Brien',
  'Mad Dog Murray', 'Switchblade Stevens', 'Pistol Pete Rawlins',
];

function randomPrisonerName() {
  return PRISONER_NAMES[rand(0, PRISONER_NAMES.length - 1)];
}

// ─────────────────────────────────────────────
// §11  JAIL ACTIONS
// ─────────────────────────────────────────────
function doJailAction(action) {
  if (office.prisoners.length === 0) return;
  var p = office.prisoners[office.selectedPrisoner];
  if (!p) return;

  switch (action) {
    case 0: // Release
      showNotification('Released ' + p.name + '. +3 Rep (mercy)');
      game.reputation = clamp((game.reputation || 50) + 3, 0, REPUTATION_MAX);
      addJournalEntry('Released prisoner ' + p.name + '.');
      office.prisoners.splice(office.selectedPrisoner, 1);
      if (office.selectedPrisoner >= office.prisoners.length) {
        office.selectedPrisoner = Math.max(0, office.prisoners.length - 1);
      }
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      break;

    case 1: // Interrogate
      if (p.interrogated) {
        showNotification(p.name + ' has nothing more to say.');
        return;
      }
      p.interrogated = true;
      var intelMult = office.upgrades.jailCells >= 2 ? 2 : 1;
      var gReward = rand(10, 30) * intelMult;
      var rReward = rand(2, 6) * intelMult;
      game.gold = (game.gold || 0) + gReward;
      game.reputation = clamp((game.reputation || 50) + rReward, 0, REPUTATION_MAX);
      game.totalGoldEarned = (game.totalGoldEarned || 0) + gReward;
      showNotification(p.name + ' talks! +$' + gReward + ', +' + rReward + ' Rep');
      addJournalEntry('Interrogated ' + p.name + ': intel worth $' + gReward);
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      break;

    case 2: // Execute
      showNotification(p.name + ' hanged. -8 Rep. Fear keeps order.');
      game.reputation = clamp((game.reputation || 50) - 8, 0, REPUTATION_MAX);
      addJournalEntry('Executed prisoner ' + p.name + ' by hanging.');
      office.prisonerLog.push({ name: p.name, crime: p.crime, fate: 'executed', day: game.dayCount || 1 });
      office.prisoners.splice(office.selectedPrisoner, 1);
      if (office.selectedPrisoner >= office.prisoners.length) {
        office.selectedPrisoner = Math.max(0, office.prisoners.length - 1);
      }
      if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
      break;

    case 3: // Feed
      if (p.fed) {
        showNotification(p.name + ' already fed today.');
        return;
      }
      if ((game.gold || 0) < 5) {
        showNotification('Need $5 to feed a prisoner.');
        return;
      }
      game.gold -= 5;
      p.fed = true;
      p.mood = Math.min(100, (p.mood || 50) + 20);
      showNotification('Fed ' + p.name + '. Mood improved. -$5');
      if (p.mood >= 80 && !p.informant && Math.random() < 0.3) {
        p.informant = true;
        showNotification(p.name + ' is now an informant! +$5/day intel.');
      }
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      break;

    case 4: // Transfer to federal custody
      var bounty = 30 + rand(10, 50);
      game.gold = (game.gold || 0) + bounty;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + bounty;
      game.reputation = clamp((game.reputation || 50) + 5, 0, REPUTATION_MAX);
      showNotification('Transferred ' + p.name + ' to federal custody. +$' + bounty);
      addJournalEntry('Transferred ' + p.name + ' to federal prison.');
      office.prisonerLog.push({ name: p.name, crime: p.crime, fate: 'transferred', day: game.dayCount || 1 });
      office.prisoners.splice(office.selectedPrisoner, 1);
      if (office.selectedPrisoner >= office.prisoners.length) {
        office.selectedPrisoner = Math.max(0, office.prisoners.length - 1);
      }
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      break;

    case 5: // Work detail
      if (p.working) {
        p.working = false;
        showNotification(p.name + ' removed from work detail.');
      } else {
        p.working = true;
        p.mood = Math.max(0, (p.mood || 50) - 10);
        showNotification(p.name + ' assigned to work detail. +$5/day income.');
      }
      break;
  }
}

// ─────────────────────────────────────────────
// §12  PURCHASE UPGRADE
// ─────────────────────────────────────────────
function purchaseOfficeUpgrade(idx) {
  var upDef = OFFICE_UPGRADES[idx];
  if (!upDef) return;
  var currentLvl = office.upgrades[upDef.key];
  var nextLvl = currentLvl + 1;
  if (nextLvl >= upDef.levels.length) {
    showNotification('Already fully upgraded!');
    return;
  }
  var cost = upDef.levels[nextLvl].cost;
  if ((game.gold || 0) < cost) {
    showNotification('Need $' + cost + '. You have $' + (game.gold || 0) + '.');
    if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
    return;
  }
  game.gold -= cost;
  office.upgrades[upDef.key] = nextLvl;
  showNotification('Upgraded ' + upDef.name + ' to ' + upDef.levels[nextLvl].name + '!');
  addJournalEntry('Office upgrade: ' + upDef.levels[nextLvl].name);
  if (typeof audio !== 'undefined' && typeof audio.playVictory === 'function') audio.playVictory();
}

// ─────────────────────────────────────────────
// §13  RENDER OFFICE OVERLAY — called after render()
// ─────────────────────────────────────────────
function renderOfficeOverlay() {
  if (game.state !== 'office') return;

  var W = gameCanvas.width;
  var H = gameCanvas.height;
  var alpha = Math.min(1, office.fadeIn);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw full office interior
  drawOfficeRoom(W, H);

  // Draw current sub-view on top
  if (office.sleeping) {
    drawSleepOverlay(W, H);
  } else if (office.officeEvent && office._eventShown) {
    drawOfficeEventPanel(W, H);
  } else if (office.currentMeeting) {
    drawMeetingPanel(W, H);
  } else if (office.showingOutcome) {
    drawOutcomePanel(W, H);
  } else if (office.currentCase && !office.currentCase.resolved) {
    drawCasePanel(W, H);
  } else if (office.upgradeMenuOpen) {
    drawUpgradeMenu(W, H);
  } else if (office.viewingBoard) {
    drawCaseBoard(W, H);
  } else if (office.viewingJail) {
    drawJailView(W, H);
  } else if (office.viewingGunRack) {
    drawGunRackView(W, H);
  } else if (office.viewingBed) {
    drawBedView(W, H);
  } else if (office.viewingStats) {
    drawStatsView(W, H);
  } else if (office.viewingDeputies) {
    drawDeputiesView(W, H);
  } else if (office.craftingOpen) {
    drawCraftingView(W, H);
  } else if (office.readingBook) {
    drawBookshelfView(W, H);
  } else if (office.viewingWanted) {
    drawWantedBoard(W, H);
  } else if (office.viewingNotices) {
    drawNoticeBoard(W, H);
  } else if (office.prisonerEvent) {
    drawPrisonerEventPanel(W, H);
  } else if (office.playingSolitaire) {
    drawSolitaireView(W, H);
  } else if (office.playingDarts) {
    drawDartsView(W, H);
  } else if (office.targetPractice) {
    drawTargetPracticeView(W, H);
  } else if (office.sittingAtDesk) {
    drawDeskView(W, H);
  } else {
    // Walkable mode — draw player and interaction prompts
    drawOfficePlayer(W, H);
    drawOfficeInteractPrompt(W, H);
    drawOfficeHUD(W, H);
  }

  // Dust motes overlay
  ctx.globalAlpha = alpha;
  for (var i = 0; i < office.dustMotes.length; i++) {
    var m = office.dustMotes[i];
    ctx.globalAlpha = m.alpha * alpha;
    ctx.fillStyle = '#e8d8b8';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flies near window
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#222';
  for (var fi = 0; fi < office.flies.length; fi++) {
    var fly = office.flies[fi];
    ctx.beginPath();
    ctx.arc(fly.x, fly.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke from stove
  for (var si = 0; si < office.smokeParticles.length; si++) {
    var sp = office.smokeParticles[si];
    var sa = (sp.life / sp.maxLife) * 0.2 * alpha;
    ctx.globalAlpha = sa;
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─────────────────────────────────────────────
// §14  DRAW OFFICE ROOM — full procedural interior
// ─────────────────────────────────────────────
function drawOfficeRoom(W, H) {
  // ── FLOOR ──
  var floorCol = office.upgrades.decor >= 2 ? '#5a3218' : (office.upgrades.decor >= 1 ? '#6b4226' : '#8b7355');
  ctx.fillStyle = floorCol;
  ctx.fillRect(0, 0, W, H);

  // Floor planks
  ctx.strokeStyle = office.upgrades.decor >= 2 ? '#4a2810' : '#6b5335';
  ctx.lineWidth = 1;
  for (var fy = 0; fy < H; fy += 26) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(W, fy);
    ctx.stroke();
    for (var fx = (fy % 52 === 0 ? 0 : 55); fx < W; fx += 110) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, fy + 26);
      ctx.stroke();
    }
  }

  // ── CARPET (if upgraded) ──
  if (office.upgrades.decor >= 1) {
    var cx = W * 0.2, cy = H * 0.35, cw = W * 0.6, ch = H * 0.38;
    ctx.fillStyle = office.upgrades.decor >= 2 ? '#6b1818' : '#5a3a1a';
    ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = office.upgrades.decor >= 2 ? '#ffd700' : '#8a6a38';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx + 4, cy + 4, cw - 8, ch - 8);
    ctx.strokeRect(cx + 9, cy + 9, cw - 18, ch - 18);
    // Corner medallions
    if (office.upgrades.decor >= 2) {
      var corners = [[cx + 18, cy + 18], [cx + cw - 18, cy + 18], [cx + 18, cy + ch - 18], [cx + cw - 18, cy + ch - 18]];
      ctx.fillStyle = '#ffd700';
      for (var co = 0; co < corners.length; co++) {
        ctx.beginPath();
        ctx.arc(corners[co][0], corners[co][1], 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── WALLS (top portion) ──
  var wallH = H * 0.22;
  ctx.fillStyle = PALETTE.wallAdobe;
  ctx.fillRect(0, 0, W, wallH);
  // Wainscoting
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, wallH - 10, W, 10);
  // Wall base trim
  ctx.fillStyle = PALETTE.uiBorder;
  ctx.fillRect(0, wallH, W, 3);

  // ── WINDOW (left side) ──
  var winX = W * 0.04, winY = wallH * 0.18;
  var winW = W * 0.11, winH = wallH * 0.58;
  // Frame
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(winX - 3, winY - 3, winW + 6, winH + 6);
  // Sky color based on time of day
  var hour = game.time ? game.time * 24 : 12;
  var skyCol;
  if (hour < 6 || hour > 20) skyCol = PALETTE.skyNight;
  else if (hour < 8) skyCol = PALETTE.skyDawn;
  else if (hour > 17) skyCol = PALETTE.skyDusk;
  else skyCol = PALETTE.skyNoon;
  ctx.fillStyle = skyCol;
  ctx.fillRect(winX, winY, winW, winH);
  // Sun or moon
  if (hour >= 6 && hour <= 20) {
    ctx.fillStyle = '#ffe870';
    ctx.beginPath();
    ctx.arc(winX + winW * 0.7, winY + winH * 0.3, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(winX + winW * 0.5, winY + winH * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Cross bars
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(winX + winW / 2 - 1.5, winY, 3, winH);
  ctx.fillRect(winX, winY + winH / 2 - 1.5, winW, 3);
  // Curtains if upgraded
  if (office.upgrades.decor >= 1) {
    ctx.fillStyle = '#7a1515';
    ctx.fillRect(winX - 2, winY - 4, winW * 0.22, winH + 6);
    ctx.fillRect(winX + winW * 0.78 + 2, winY - 4, winW * 0.22, winH + 6);
    // Rod
    ctx.fillStyle = office.upgrades.decor >= 2 ? '#ffd700' : '#8b6340';
    ctx.fillRect(winX - 6, winY - 6, winW + 12, 3);
  }

  // ── WANTED / CASE BOARD (on wall, left-center) ──
  var brdX = W * 0.18, brdY = wallH * 0.1, brdW = W * 0.13, brdH = wallH * 0.72;
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(brdX, brdY, brdW, brdH);
  ctx.strokeStyle = '#2a1a08';
  ctx.lineWidth = 2;
  ctx.strokeRect(brdX, brdY, brdW, brdH);
  // Papers pinned to board
  var paperCols = ['#e8d8b8', '#ddd0a8', '#f0e0c0', '#d4c4a0', '#eedcbc'];
  for (var pi = 0; pi < 6; pi++) {
    var ppx = brdX + 5 + (pi % 3) * (brdW * 0.3);
    var ppy = brdY + 5 + Math.floor(pi / 3) * (brdH * 0.46);
    var ppw = brdW * 0.26, pph = brdH * 0.38;
    ctx.save();
    ctx.translate(ppx + ppw / 2, ppy + pph / 2);
    ctx.rotate(((pi * 1.7) % 1 - 0.5) * 0.12);
    ctx.fillStyle = paperCols[pi % paperCols.length];
    ctx.fillRect(-ppw / 2, -pph / 2, ppw, pph);
    // Tack
    ctx.fillStyle = pi % 2 === 0 ? '#cc3030' : '#3060cc';
    ctx.beginPath();
    ctx.arc(0, -pph / 2 + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Label
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'bold ' + Math.max(9, brdW * 0.1) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CASE BOARD', brdX + brdW / 2, brdY - 3);

  // ── CLOCK (center wall) ──
  var clkX = W * 0.48, clkY = wallH * 0.33;
  var clkR = Math.min(wallH * 0.2, 24);
  // Pendulum
  var pendA = Math.sin(office.clockSwing) * 0.3;
  ctx.strokeStyle = '#c0a030';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(clkX, clkY + clkR);
  ctx.lineTo(clkX + Math.sin(pendA) * clkR * 1.1, clkY + clkR + Math.cos(pendA) * clkR * 1.1);
  ctx.stroke();
  ctx.fillStyle = '#c0a030';
  ctx.beginPath();
  ctx.arc(clkX + Math.sin(pendA) * clkR * 1.1, clkY + clkR + Math.cos(pendA) * clkR * 1.1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Clock face
  ctx.fillStyle = '#f5eedd';
  ctx.beginPath();
  ctx.arc(clkX, clkY, clkR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Hour ticks
  ctx.fillStyle = '#222';
  for (var hi = 0; hi < 12; hi++) {
    var ha = (hi / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(clkX + Math.cos(ha) * clkR * 0.78, clkY + Math.sin(ha) * clkR * 0.78, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hands
  var gHour = game.time ? game.time * 24 : 12;
  var hourA = ((gHour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  var minA = ((gHour % 1) * 60 / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(clkX, clkY);
  ctx.lineTo(clkX + Math.cos(hourA) * clkR * 0.48, clkY + Math.sin(hourA) * clkR * 0.48);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(clkX, clkY);
  ctx.lineTo(clkX + Math.cos(minA) * clkR * 0.65, clkY + Math.sin(minA) * clkR * 0.65);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(clkX, clkY, 2, 0, Math.PI * 2); ctx.fill();

  // ── GUN RACK (right wall) ──
  var grX = W * 0.78, grY = wallH * 0.12, grW = W * 0.17, grH = wallH * 0.72;
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(grX, grY, grW, grH);
  ctx.strokeStyle = '#2a1608';
  ctx.lineWidth = 2;
  ctx.strokeRect(grX, grY, grW, grH);
  var gunCt = office.upgrades.gunRack >= 2 ? 5 : (office.upgrades.gunRack >= 1 ? 3 : 2);
  for (var gi = 0; gi < gunCt; gi++) {
    var gy = grY + 8 + gi * ((grH - 16) / Math.max(1, gunCt - 1));
    // Pegs
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(grX + 6, gy - 2, 8, 4);
    ctx.fillRect(grX + grW - 14, gy - 2, 8, 4);
    // Gun barrel
    ctx.fillStyle = '#555';
    ctx.fillRect(grX + 16, gy - 1, grW - 32, 2.5);
    // Stock
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(grX + grW - 24, gy - 3, 10, 7);
  }
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'bold ' + Math.max(9, grW * 0.08) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GUN RACK', grX + grW / 2, grY - 3);

  // ── DESK (center-lower) ──
  var dkX = W * 0.3, dkY = H * 0.52;
  var dkW = W * 0.4, dkH = H * 0.16;
  var deskCol = office.upgrades.desk >= 2 ? '#4a1a08' : (office.upgrades.desk >= 1 ? '#5a3218' : '#6b4a30');
  var deskTop = office.upgrades.desk >= 2 ? '#6a3018' : (office.upgrades.desk >= 1 ? '#7a5238' : '#8b6a50');
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(dkX + 3, dkY + 3, dkW, dkH);
  // Body
  ctx.fillStyle = deskCol;
  ctx.fillRect(dkX, dkY, dkW, dkH);
  // Top surface edge
  ctx.fillStyle = deskTop;
  ctx.fillRect(dkX - 3, dkY - 3, dkW + 6, 6);
  // Drawers
  ctx.strokeStyle = office.upgrades.desk >= 2 ? '#c0a030' : '#4a3018';
  ctx.lineWidth = 1;
  for (var di = 0; di < 3; di++) {
    var ddx = dkX + 8 + di * ((dkW - 16) / 3);
    var ddw = (dkW - 28) / 3;
    ctx.strokeRect(ddx, dkY + 8, ddw, dkH * 0.4);
    ctx.fillStyle = office.upgrades.desk >= 2 ? '#c0a030' : '#7a5a3a';
    ctx.fillRect(ddx + ddw / 2 - 5, dkY + 8 + dkH * 0.18, 10, 3);
  }
  // Legs
  ctx.fillStyle = deskCol;
  ctx.fillRect(dkX + 5, dkY + dkH, 6, H * 0.07);
  ctx.fillRect(dkX + dkW - 11, dkY + dkH, 6, H * 0.07);

  // ── Items on desk ──
  // Desk lamp
  var lpX = dkX + dkW - 35, lpY = dkY - 28;
  var flk = Math.sin(office.lampFlicker) * 0.12 + 0.88;
  // Glow
  ctx.fillStyle = 'rgba(255, 200, 80, ' + (0.07 * flk) + ')';
  ctx.beginPath();
  ctx.arc(lpX + 8, lpY + 4, 50, 0, Math.PI * 2);
  ctx.fill();
  // Lamp base
  ctx.fillStyle = '#333';
  ctx.fillRect(lpX - 2, dkY - 5, 22, 5);
  // Pole
  ctx.fillRect(lpX + 7, lpY + 10, 3, dkY - lpY - 15);
  // Shade
  ctx.fillStyle = '#1a4a1a';
  ctx.beginPath();
  ctx.moveTo(lpX - 4, lpY + 11);
  ctx.lineTo(lpX + 22, lpY + 11);
  ctx.lineTo(lpX + 18, lpY - 1);
  ctx.lineTo(lpX, lpY - 1);
  ctx.closePath();
  ctx.fill();
  // Light strip
  ctx.fillStyle = 'rgba(255, 220, 100, ' + (0.85 * flk) + ')';
  ctx.fillRect(lpX - 1, lpY + 11, 20, 2);

  // Papers
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(dkX + 15, dkY - 18, 30, 40);
  ctx.fillRect(dkX + 22, dkY - 16, 30, 40);
  // Paper lines
  ctx.strokeStyle = '#bba888';
  ctx.lineWidth = 0.5;
  for (var li = 0; li < 5; li++) {
    ctx.beginPath();
    ctx.moveTo(dkX + 19, dkY - 10 + li * 6);
    ctx.lineTo(dkX + 42, dkY - 10 + li * 6);
    ctx.stroke();
  }

  // Badge
  ctx.fillStyle = PALETTE.badge;
  drawStarShape(dkX + dkW / 2, dkY - 8, 5, 9, 4.5);
  ctx.fillStyle = '#fff8c0';
  drawStarShape(dkX + dkW / 2, dkY - 8, 5, 4, 2);

  // Inkwell
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(dkX + dkW / 2 + 18, dkY - 12, 10, 12);
  ctx.beginPath();
  ctx.arc(dkX + dkW / 2 + 23, dkY - 12, 5, Math.PI, 0);
  ctx.fill();
  // Quill
  ctx.strokeStyle = '#e8d8b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dkX + dkW / 2 + 23, dkY - 16);
  ctx.lineTo(dkX + dkW / 2 + 35, dkY - 36);
  ctx.stroke();
  ctx.fillStyle = '#e8d8b8';
  ctx.beginPath();
  ctx.moveTo(dkX + dkW / 2 + 35, dkY - 36);
  ctx.lineTo(dkX + dkW / 2 + 32, dkY - 30);
  ctx.lineTo(dkX + dkW / 2 + 38, dkY - 30);
  ctx.closePath();
  ctx.fill();

  // ── CHAIR (below desk) ──
  var chX = dkX + dkW / 2 - 14, chY = dkY + dkH + 6;
  ctx.fillStyle = '#3a2010';
  // Chair seat
  ctx.fillRect(chX, chY, 28, 20);
  // Chair back
  ctx.fillRect(chX + 2, chY - 18, 24, 20);
  // Cushion
  ctx.fillStyle = office.upgrades.desk >= 1 ? '#7a1515' : '#5a3a1a';
  ctx.fillRect(chX + 4, chY - 15, 20, 14);

  // ── JAIL CELLS (right side, below wall) ──
  var cellStartX = W * 0.62, cellY = wallH + 6;
  var cellW = W * 0.1, cellH = H * 0.2;
  var cellCt = Math.min(getMaxPrisoners(), 3);
  for (var ci = 0; ci < cellCt; ci++) {
    var ccx = cellStartX + ci * (cellW + 5);
    // Floor
    ctx.fillStyle = '#4a4238';
    ctx.fillRect(ccx, cellY, cellW, cellH);
    // Bars
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2.5;
    for (var bar = 0; bar < 5; bar++) {
      var bx = ccx + 3 + bar * (cellW - 6) / 4;
      ctx.beginPath();
      ctx.moveTo(bx, cellY);
      ctx.lineTo(bx, cellY + cellH);
      ctx.stroke();
    }
    // Cross bar
    ctx.beginPath();
    ctx.moveTo(ccx, cellY + cellH * 0.35);
    ctx.lineTo(ccx + cellW, cellY + cellH * 0.35);
    ctx.stroke();
    // Prisoner sprite if occupied
    if (ci < office.prisoners.length) {
      drawTinyPrisoner(ccx + cellW / 2, cellY + cellH * 0.62, cellH * 0.28);
    }
  }
  // Second row for 4+ cells
  if (getMaxPrisoners() > 3) {
    for (var ci2 = 3; ci2 < Math.min(getMaxPrisoners(), 6); ci2++) {
      var ccx2 = cellStartX + (ci2 - 3) * (cellW + 5);
      var ccy2 = cellY + cellH + 6;
      ctx.fillStyle = '#4a4238';
      ctx.fillRect(ccx2, ccy2, cellW, cellH);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2.5;
      for (var bar2 = 0; bar2 < 5; bar2++) {
        var bx2 = ccx2 + 3 + bar2 * (cellW - 6) / 4;
        ctx.beginPath();
        ctx.moveTo(bx2, ccy2);
        ctx.lineTo(bx2, ccy2 + cellH);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(ccx2, ccy2 + cellH * 0.35);
      ctx.lineTo(ccx2 + cellW, ccy2 + cellH * 0.35);
      ctx.stroke();
      if (ci2 < office.prisoners.length) {
        drawTinyPrisoner(ccx2 + cellW / 2, ccy2 + cellH * 0.62, cellH * 0.28);
      }
    }
  }

  // ── FILING CABINET (far left) ──
  var fcX = W * 0.06, fcY = H * 0.38, fcW = W * 0.07, fcH = H * 0.32;
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(fcX, fcY, fcW, fcH);
  ctx.strokeStyle = '#4a4238';
  ctx.lineWidth = 1;
  for (var fi = 0; fi < 4; fi++) {
    var ffy = fcY + 3 + fi * (fcH - 6) / 4;
    var ffh = (fcH - 10) / 4;
    ctx.strokeRect(fcX + 3, ffy, fcW - 6, ffh);
    ctx.fillStyle = '#8b6340';
    ctx.fillRect(fcX + fcW / 2 - 5, ffy + ffh / 2 - 1.5, 10, 3);
    ctx.fillStyle = '#5a5248';
  }

  // ── STOVE (left side, below filing cabinet) ──
  var stX = W * 0.04, stY = H * 0.72, stW = W * 0.08, stH = H * 0.16;
  ctx.fillStyle = '#333';
  ctx.fillRect(stX, stY, stW, stH);
  ctx.fillStyle = '#222';
  ctx.fillRect(stX + 2, stY + 2, stW - 4, stH * 0.3);
  // Fire glow
  var fireFlk = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
  ctx.fillStyle = 'rgba(255, 80, 20, ' + (0.6 * fireFlk) + ')';
  ctx.fillRect(stX + 4, stY + 4, stW - 8, stH * 0.25);
  ctx.fillStyle = 'rgba(255, 180, 40, ' + (0.4 * fireFlk) + ')';
  ctx.fillRect(stX + 6, stY + 6, stW - 12, stH * 0.15);
  // Stovepipe
  ctx.fillStyle = '#333';
  ctx.fillRect(stX + stW / 2 - 3, stY - H * 0.44, 6, H * 0.44);
  // Coffee pot on stove
  ctx.fillStyle = '#444';
  ctx.fillRect(stX + stW - 14, stY - 6, 10, 8);
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(stX + stW - 9, stY - 6, 5, Math.PI, 0);
  ctx.fill();

  // ── BED (right side, below jail cells) ──
  var bedX = W * 0.8, bedY = H * 0.58, bedW = W * 0.16, bedH = H * 0.12;
  var bedLvl = office.upgrades.bed || 0;
  // Frame
  ctx.fillStyle = bedLvl >= 2 ? '#4a1a08' : (bedLvl >= 1 ? '#5a3a1a' : '#7a6a50');
  ctx.fillRect(bedX, bedY, bedW, bedH);
  // Mattress
  ctx.fillStyle = bedLvl >= 2 ? '#e8d8c0' : (bedLvl >= 1 ? '#c0b090' : '#8a7a60');
  ctx.fillRect(bedX + 3, bedY + 2, bedW - 6, bedH - 5);
  // Pillow
  ctx.fillStyle = bedLvl >= 2 ? '#fff8e8' : '#d0c8b0';
  ctx.fillRect(bedX + 4, bedY + 3, bedW * 0.2, bedH * 0.5);
  // Blanket
  ctx.fillStyle = bedLvl >= 2 ? '#6a1818' : (bedLvl >= 1 ? '#5a4a3a' : '#6a5a40');
  ctx.fillRect(bedX + bedW * 0.3, bedY + 3, bedW * 0.65, bedH - 6);
  // Headboard for four-poster
  if (bedLvl >= 2) {
    ctx.fillStyle = '#3a1008';
    ctx.fillRect(bedX - 3, bedY - 10, 4, bedH + 12);
    ctx.fillRect(bedX + bedW - 1, bedY - 10, 4, bedH + 12);
    ctx.fillRect(bedX - 3, bedY - 12, bedW + 6, 4);
    // Drapes
    ctx.fillStyle = '#7a1515';
    ctx.fillRect(bedX - 2, bedY - 8, 8, bedH + 6);
    ctx.fillRect(bedX + bedW - 6, bedY - 8, 8, bedH + 6);
  }
  // Label
  ctx.fillStyle = '#e8d8b8';
  ctx.font = 'bold ' + Math.max(8, bedW * 0.07) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BED', bedX + bedW / 2, bedY - 3);

  // ── AMERICAN FLAG (right wall, near window) ──
  var flgX = W * 0.58, flgY = wallH * 0.08;
  var flgW = W * 0.06, flgH = flgW * 0.55;
  // Pole
  ctx.fillStyle = '#c0a030';
  ctx.fillRect(flgX - 2, flgY - 4, 3, flgH + 12);
  // Flag body - waving
  var wave = Math.sin(Date.now() * 0.002) * 2;
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(flgX + 1, flgY + wave * 0.5, flgW, flgH);
  // Stripes
  ctx.fillStyle = '#ffffff';
  for (var si2 = 0; si2 < 6; si2 += 2) {
    ctx.fillRect(flgX + 1, flgY + si2 * (flgH / 7) + wave * 0.5, flgW, flgH / 7);
  }
  // Blue canton
  ctx.fillStyle = '#224488';
  ctx.fillRect(flgX + 1, flgY + wave * 0.5, flgW * 0.4, flgH * 0.55);

  // ── BOOKSHELF (left wall, below case board) ──
  var bsX = W * 0.15, bsY = H * 0.38, bsW = W * 0.1, bsH = H * 0.28;
  ctx.fillStyle = '#4a2810';
  ctx.fillRect(bsX, bsY, bsW, bsH);
  ctx.strokeStyle = '#3a1808';
  ctx.lineWidth = 1;
  // Shelves
  for (var shi = 0; shi < 4; shi++) {
    var shY = bsY + shi * (bsH / 4);
    ctx.fillStyle = '#5a3818';
    ctx.fillRect(bsX, shY, bsW, 3);
    // Books
    var bookColors = ['#882222', '#224488', '#228844', '#886622', '#662288', '#cc8833', '#336666'];
    for (var bi2 = 0; bi2 < 5; bi2++) {
      var bx = bsX + 3 + bi2 * (bsW - 6) / 5;
      var bh = bsH / 5 - 4 + rand(-3, 3);
      ctx.fillStyle = bookColors[(shi * 5 + bi2) % bookColors.length];
      ctx.fillRect(bx, shY + 4, (bsW - 8) / 5 - 2, bh);
    }
  }

  // ── DARTBOARD (right wall, near gun rack) ──
  var dbX = W * 0.74, dbY = wallH * 0.35, dbR = Math.min(wallH * 0.2, 18);
  ctx.fillStyle = '#2a1808';
  ctx.beginPath();
  ctx.arc(dbX, dbY, dbR + 3, 0, Math.PI * 2);
  ctx.fill();
  // Rings
  var dartCols = ['#cc2222', '#e8d8b8', '#222288', '#e8d8b8', '#cc2222'];
  for (var dri = 0; dri < 5; dri++) {
    ctx.fillStyle = dartCols[dri];
    ctx.beginPath();
    ctx.arc(dbX, dbY, dbR * (1 - dri * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }
  // Bullseye
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.arc(dbX, dbY, 3, 0, Math.PI * 2);
  ctx.fill();

  // ── OFFICE DOG (if adopted) ──
  if (office.officeDog) {
    var dogX = stX + stW + 10, dogY = stY + stH - 8;
    var dogBob = Math.sin(Date.now() * 0.003) * 1;
    // Body
    ctx.fillStyle = '#8b6340';
    ctx.fillRect(dogX - 6, dogY + dogBob, 12, 6);
    // Head
    ctx.fillStyle = '#7a5230';
    ctx.beginPath();
    ctx.arc(dogX + 8, dogY - 2 + dogBob, 5, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(dogX + 4, dogY - 6 + dogBob, 3, 4);
    ctx.fillRect(dogX + 10, dogY - 6 + dogBob, 3, 4);
    // Tail wag
    var tailAngle = Math.sin(Date.now() * 0.01) * 0.5;
    ctx.strokeStyle = '#8b6340';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dogX - 6, dogY + 2 + dogBob);
    ctx.lineTo(dogX - 10 + Math.sin(tailAngle) * 4, dogY - 2 + dogBob);
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#111';
    ctx.fillRect(dogX + 6, dogY - 3 + dogBob, 1.5, 1.5);
    ctx.fillRect(dogX + 9, dogY - 3 + dogBob, 1.5, 1.5);
  }

  // ── TROPHY WALL (above bookshelf) ──
  if (office.trophies.length > 0) {
    ctx.fillStyle = '#e8d8b8';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    for (var tri = 0; tri < Math.min(office.trophies.length, 4); tri++) {
      var trX = bsX + tri * 22 + 12;
      var trY = bsY - 14;
      // Small trophy
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(trX - 3, trY, 6, 8);
      ctx.beginPath();
      ctx.arc(trX, trY, 4, Math.PI, 0);
      ctx.fill();
    }
  }

  // ── SPITTOON (near desk) ──
  var spX = W * 0.3 + W * 0.4 + 12, spY = H * 0.52 + H * 0.16 + H * 0.07;
  ctx.fillStyle = '#8b6340';
  ctx.beginPath();
  ctx.arc(spX, spY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6a4a28';
  ctx.beginPath();
  ctx.arc(spX, spY, 4, 0, Math.PI * 2);
  ctx.fill();

  // ── COAT/HAT RACK (near exit) ──
  var rkX = W * 0.95, rkY = H * 0.28;
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(rkX - 1, rkY, 3, H * 0.3);
  // Pegs
  ctx.fillRect(rkX - 6, rkY + 8, 12, 3);
  ctx.fillRect(rkX - 6, rkY + 28, 12, 3);
  // Hat
  ctx.fillStyle = '#4a3218';
  ctx.fillRect(rkX - 8, rkY + 2, 16, 5);
  ctx.fillRect(rkX - 5, rkY - 4, 10, 7);
  // Coat
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(rkX - 4, rkY + 30, 8, 22);

  // ── VIGNETTE ──
  var grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.18, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// ─────────────────────────────────────────────
// §15  DRAWING HELPERS
// ─────────────────────────────────────────────
function drawStarShape(cx, cy, spikes, outerR, innerR) {
  ctx.beginPath();
  for (var i = 0; i < spikes * 2; i++) {
    var r = i % 2 === 0 ? outerR : innerR;
    var angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    else ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTinyPrisoner(x, y, size) {
  // Head
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Body (striped)
  ctx.fillStyle = '#999';
  ctx.fillRect(x - size * 0.18, y - size * 0.32, size * 0.36, size * 0.45);
  ctx.fillStyle = '#444';
  for (var s = 0; s < 3; s++) {
    ctx.fillRect(x - size * 0.18, y - size * 0.32 + s * size * 0.15, size * 0.36, size * 0.06);
  }
  // Legs
  ctx.fillStyle = '#777';
  ctx.fillRect(x - size * 0.12, y + size * 0.13, size * 0.1, size * 0.25);
  ctx.fillRect(x + size * 0.02, y + size * 0.13, size * 0.1, size * 0.25);
}

function drawUIPanel(x, y, w, h, title) {
  // Background
  ctx.fillStyle = 'rgba(20, 12, 4, 0.93)';
  ctx.fillRect(x, y, w, h);
  // Double border
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = PALETTE.uiBorderLt;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  // Title
  if (title) {
    var tfs = Math.max(13, Math.min(20, w * 0.032));
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + tfs + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 26);
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 34);
    ctx.lineTo(x + w - 18, y + 34);
    ctx.stroke();
  }
}

function wrapTextLines(text, maxWidth, fontSize) {
  ctx.font = fontSize + 'px monospace';
  var words = text.split(' ');
  var lines = [];
  var cur = '';
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var parts = word.split('\n');
    for (var p = 0; p < parts.length; p++) {
      if (p > 0) { lines.push(cur); cur = ''; }
      var test = cur ? cur + ' ' + parts[p] : parts[p];
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = parts[p];
      } else {
        cur = test;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─────────────────────────────────────────────
// §16  SUB-VIEW RENDERERS
// ─────────────────────────────────────────────

// ── Draw player character inside office ──
function drawOfficePlayer(W, H) {
  var px = office.playerX;
  var py = office.playerY;
  var now = Date.now();
  var bobOffset = office.playerMoving ? Math.sin(now * 0.01) * 2 : 0;
  var facingRight = office.playerDir === 0 || office.playerDir === 3;

  ctx.save();
  ctx.translate(px, py);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  var oy = bobOffset;
  var lBob = office.playerMoving ? Math.sin(now * 0.01) * 2 : 0;

  // Boots
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(-4, 8 + oy - lBob, 3, 5);
  ctx.fillRect(1, 8 + oy + lBob, 3, 5);
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(-4, 11 + oy - lBob, 3, 2);
  ctx.fillRect(1, 11 + oy + lBob, 3, 2);

  // Pants
  ctx.fillStyle = PALETTE.denim || '#4a5a8a';
  ctx.fillRect(-4, 2 + oy, 3, 7);
  ctx.fillRect(1, 2 + oy, 3, 7);

  // Belt
  ctx.fillStyle = PALETTE.leather || '#6a4a2a';
  ctx.fillRect(-5, 1 + oy, 10, 2);
  ctx.fillStyle = PALETTE.badge;
  ctx.fillRect(-1, 1 + oy, 2, 2);

  // Torso
  ctx.fillStyle = PALETTE.cloth || '#8b1a1a';
  ctx.fillRect(-5, -6 + oy, 10, 8);
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(-4, -5 + oy, 8, 6);
  ctx.fillStyle = PALETTE.clothDark || '#5b0a0a';
  ctx.fillRect(-5, -6 + oy, 2, 8);
  ctx.fillRect(3, -6 + oy, 2, 8);
  // Badge
  ctx.fillStyle = PALETTE.badge;
  ctx.fillRect(facingRight ? 1 : -3, -4 + oy, 2, 2);

  // Arms
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(-7, -4 + oy, 2, 5);
  ctx.fillRect(5, -4 + oy, 2, 5);
  ctx.fillStyle = PALETTE.skin;
  ctx.fillRect(-7, 1 + oy, 2, 2);
  ctx.fillRect(5, 1 + oy, 2, 2);

  // Head
  ctx.fillStyle = PALETTE.skin;
  ctx.fillRect(-3, -12 + oy, 6, 6);
  // Eyes
  ctx.fillStyle = '#000';
  if (facingRight) {
    ctx.fillRect(0, -10 + oy, 1, 1);
    ctx.fillRect(-2, -10 + oy, 1, 1);
  } else {
    ctx.fillRect(-2, -10 + oy, 1, 1);
    ctx.fillRect(1, -10 + oy, 1, 1);
  }
  // Mustache
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(-2, -8 + oy, 4, 1);

  // Hat
  ctx.fillStyle = PALETTE.hat;
  ctx.fillRect(-7, -16 + oy, 14, 3);
  ctx.fillRect(-4, -19 + oy, 8, 3);
  ctx.fillStyle = PALETTE.hatBrim || '#2a1a0a';
  ctx.fillRect(-8, -16 + oy, 16, 1);
  ctx.fillStyle = PALETTE.badge;
  ctx.fillRect(-4, -17 + oy, 8, 1);

  ctx.restore();
}

// ── Draw interaction prompt above nearest furniture ──
function drawOfficeInteractPrompt(W, H) {
  if (!office.nearFurniture) return;
  var f = office.nearFurniture;
  var fcx = f.x * W + (f.w * W) / 2;
  var fcy = f.y * H;

  var label = '[E] ' + f.label;
  var fs = Math.max(11, Math.min(15, W * 0.018));
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.textAlign = 'center';

  // Background pill
  var tw = ctx.measureText(label).width + 16;
  var th = fs + 8;
  var tx = fcx - tw / 2;
  var ty = fcy - th - 6;
  ctx.fillStyle = 'rgba(20, 12, 4, 0.85)';
  ctx.fillRect(tx, ty, tw, th);
  ctx.strokeStyle = PALETTE.uiHighlight;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tx, ty, tw, th);

  // Text
  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.fillText(label, fcx, ty + th - 5);

  // Highlight furniture outline
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(f.x * W, f.y * H, f.w * W, f.h * H);
}

// ── Draw office HUD (gold, rep, controls) ──
function drawOfficeHUD(W, H) {
  var fs = Math.max(9, Math.min(12, W * 0.014));
  ctx.font = fs + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(20, 12, 4, 0.7)';
  ctx.fillRect(0, H - 22, W, 22);
  ctx.fillStyle = PALETTE.uiTextDim;
  var statusLine = 'WASD: Move  |  E: Interact  |  ESC: Leave  |  U: Upgrades';
  statusLine += '  |  Gold: $' + (game.gold || 0) + '  |  Rep: ' + (game.reputation || 50) + '  |  Day ' + (game.dayCount || 1);
  ctx.fillText(statusLine, W / 2, H - 7);
}

// ── Sitting at desk ──
function drawDeskView(W, H) {
  var pw = Math.min(W * 0.62, 580), ph = Math.min(H * 0.45, 360);
  var px = (W - pw) / 2, py = H * 0.5;
  drawUIPanel(px, py, pw, ph, 'AT YOUR DESK');

  var fs = Math.max(10, Math.min(14, pw * 0.024));
  ctx.textAlign = 'center';

  if (office.waitingForCase) {
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    var dots = '';
    var dotCount = Math.floor((office.waitTimer * 3) % 4);
    for (var d = 0; d < dotCount; d++) dots += '.';
    ctx.fillText('A knock at the door' + dots, px + pw / 2, py + 50);
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + (fs - 1) + 'px monospace';
    ctx.fillText(office.visitorNPCName + ' is approaching...', px + pw / 2, py + 68);
  } else if (office.deskMode === 'telegraph') {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('TELEGRAPH', px + pw / 2, py + 48);
    ctx.textAlign = 'left';
    var ty = py + 65;
    if (office.telegrams.length === 0) {
      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = 'italic ' + (fs - 1) + 'px monospace';
      ctx.fillText('  No telegrams received yet.', px + 18, ty);
    } else {
      for (var ti = office.telegrams.length - 1; ti >= Math.max(0, office.telegrams.length - 4); ti--) {
        var tg = office.telegrams[ti];
        ctx.fillStyle = tg.read ? PALETTE.uiTextDim : PALETTE.uiHighlight;
        ctx.font = (fs - 1) + 'px monospace';
        var eventTag = (tg.event && !tg.triggered) ? ' [!]' : (tg.triggered ? ' [ACTIVE]' : '');
        var tLines = wrapTextLines('Day ' + tg.day + ': ' + tg.text + eventTag, pw - 40, fs - 1);
        for (var tl = 0; tl < tLines.length; tl++) {
          if (ty > py + ph - 30) break;
          ctx.fillText(tLines[tl], px + 18, ty);
          ty += fs + 2;
        }
        ty += 6;
      }
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('[Q/ESC] Back', px + pw / 2, py + ph - 10);
  } else if (office.deskMode === 'coffee') {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('COFFEE POT', px + pw / 2, py + 55);
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    if (office._coffeeBrewedDay === (game.dayCount || 1)) {
      ctx.fillText('Already caffeinated today.', px + pw / 2, py + 80);
    } else {
      ctx.fillText('A fresh pot is ready. Brew a cup?', px + pw / 2, py + 80);
      ctx.fillStyle = PALETTE.uiHighlight;
      ctx.font = 'bold ' + fs + 'px monospace';
      ctx.fillText('[E] Brew Coffee (Speed boost 2 min)', px + pw / 2, py + 105);
    }
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('[Q/ESC] Back', px + pw / 2, py + ph - 10);
  } else if (office.deskMode === 'drawers') {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('DESK DRAWERS', px + pw / 2, py + 55);
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    if (office._drawerSearchedDay === (game.dayCount || 1)) {
      ctx.fillText('Nothing else of interest in the drawers today.', px + pw / 2, py + 80);
    } else {
      ctx.fillText('Rummage through the desk drawers?', px + pw / 2, py + 80);
      ctx.fillStyle = PALETTE.uiHighlight;
      ctx.font = 'bold ' + fs + 'px monospace';
      ctx.fillText('[E] Search Drawers', px + pw / 2, py + 105);
    }
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('[Q/ESC] Back', px + pw / 2, py + ph - 10);
  } else if (office.deskMode === 'meetings') {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('MEETING REQUESTS', px + pw / 2, py + 48);
    if (office.meetingQueue.length === 0) {
      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = 'italic ' + fs + 'px monospace';
      ctx.fillText('No meetings scheduled today.', px + pw / 2, py + 80);
    } else {
      var my = py + 65;
      ctx.textAlign = 'left';
      for (var mqi = 0; mqi < Math.min(office.meetingQueue.length, 3); mqi++) {
        var mtg = office.meetingQueue[mqi];
        ctx.fillStyle = mtg.type === 'boss' ? '#cc3030' : PALETTE.uiText;
        ctx.font = 'bold ' + (fs - 1) + 'px monospace';
        var typeLabel = mtg.type === 'boss' ? 'BOSS' : mtg.type.toUpperCase();
        ctx.fillText('[' + (mqi + 1) + '] ' + typeLabel + ': ' + mtg.name, px + 18, my);
        if (mtg.bodyguards > 0) {
          ctx.fillStyle = '#cc6600';
          ctx.font = (fs - 2) + 'px monospace';
          ctx.fillText('    ' + mtg.bodyguards + ' armed bodyguards', px + 18, my + fs + 2);
        }
        my += fs * 2 + 10;
      }
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('[Q/ESC] Back', px + pw / 2, py + ph - 10);
  } else {
    // Main desk menu
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    var unreadTelegrams = office.telegrams.filter(function(t) { return !t.read; }).length;
    var pendingMeetings = office.meetingQueue.length;
    var y = py + 48;

    var menuItems = [
      { key: 'E', label: 'Wait for a case', highlight: true },
      { key: 'M', label: 'Meetings' + (pendingMeetings > 0 ? ' (' + pendingMeetings + ' waiting)' : ''), warn: pendingMeetings > 0 },
      { key: 'C', label: 'Brew Coffee' + (office._coffeeBrewedDay === (game.dayCount || 1) ? ' (done)' : '') },
      { key: 'T', label: 'Telegraph' + (unreadTelegrams > 0 ? ' (' + unreadTelegrams + ' NEW)' : '') },
      { key: 'X', label: 'Search Drawers' },
      { key: 'N', label: 'Crafting & Supplies' },
      { key: 'P', label: 'Deputy Management (' + office.deputies.length + ')' },
      { key: 'B', label: 'Read a Book (' + Object.keys(office.bookRead).filter(function(k){return k[0]!=='_';}).length + '/' + LORE_BOOKS.length + ')' },
      { key: 'L', label: 'Play Solitaire' },
      { key: 'O', label: 'Music Box ' + (office.musicBoxOn ? '(ON)' : '(OFF)') },
      { key: 'G', label: office.officeDog ? ('Pet ' + office.dogName) : '' },
      { key: 'J', label: 'Spittoon Challenge' },
    ];
    // Filter empty labels
    menuItems = menuItems.filter(function(m) { return m.label !== ''; });

    for (var mi = 0; mi < menuItems.length; mi++) {
      var item = menuItems[mi];
      ctx.fillStyle = item.highlight ? PALETTE.uiHighlight : (item.warn ? '#ccaa30' : PALETTE.uiText);
      ctx.font = (mi === 0 ? 'bold ' : '') + (fs - 1) + 'px monospace';
      ctx.fillText('[' + item.key + '] ' + item.label, px + pw / 2, y);
      y += fs + 4;
    }

    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('[Q/ESC] Stand up', px + pw / 2, py + ph - 25);
    ctx.fillText('Cases: ' + office.completedCases.length + '  |  Prisoners: ' + office.prisoners.length + '/' + getMaxPrisoners() + '  |  Gold: $' + (game.gold || 0), px + pw / 2, py + ph - 10);
  }
}

// ── Case reveal with typewriter ──
function drawCasePanel(W, H) {
  var pw = Math.min(W * 0.68, 640), ph = Math.min(H * 0.68, 520);
  var px = (W - pw) / 2, py = H * 0.16;
  drawUIPanel(px, py, pw, ph, '');

  var fs = Math.max(10, Math.min(14, pw * 0.021));
  var margin = 18;
  var textW = pw - margin * 2;
  var startY = py + 18;

  // Visitor header
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = 'italic ' + (fs - 1) + 'px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(office.visitorNPCName + ' walks in, hat in hand:', px + margin, startY);
  startY += 18;

  // Typewriter text
  var visible = twGetVisible();
  ctx.font = fs + 'px monospace';
  var lines = wrapTextLines(visible, textW, fs);
  for (var i = 0; i < lines.length; i++) {
    var ly = startY + i * (fs + 4);
    if (ly > py + ph - 110) break;
    // Color the header line
    if (i === 0 && lines[i].charAt(0) === '[') {
      ctx.fillStyle = PALETTE.uiHighlight;
      ctx.font = 'bold ' + fs + 'px monospace';
    } else if (i === 2 && lines.length > 3) {
      ctx.fillStyle = '#ffcc88';
      ctx.font = 'bold ' + (fs + 1) + 'px monospace';
    } else {
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = fs + 'px monospace';
    }
    ctx.fillText(lines[i], px + margin, ly);
  }

  // Blinking cursor
  if (!typewriter.done && lines.length > 0) {
    var lastLine = lines[lines.length - 1];
    var cursorX = px + margin + ctx.measureText(lastLine).width + 2;
    var cursorY = startY + (lines.length - 1) * (fs + 4);
    if (Math.floor(Date.now() / 350) % 2 === 0) {
      ctx.fillStyle = PALETTE.uiHighlight;
      ctx.fillRect(cursorX, cursorY - fs + 2, 2, fs);
    }
  }

  // Choices
  if (office.caseChoiceVisible && office.currentCase) {
    var choiceY = py + ph - 95;
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + (fs - 1) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('YOUR DECISION:', px + margin, choiceY);
    choiceY += fs + 5;

    var choices = office.currentCase.choices;
    var bestIdx = getBestCaseChoice(office.currentCase);
    for (var ci = 0; ci < choices.length; ci++) {
      var choiceText = '[' + (ci + 1) + '] ' + choices[ci].text;
      // Hint from oak desk upgrade
      if (office.upgrades.desk >= 1 && ci === bestIdx) {
        ctx.fillStyle = '#88cc88';
        choiceText += ' *';
      } else {
        ctx.fillStyle = PALETTE.uiText;
      }
      ctx.font = (fs - 1) + 'px monospace';
      var cLines = wrapTextLines(choiceText, textW, fs - 1);
      for (var cl = 0; cl < cLines.length; cl++) {
        ctx.fillText(cLines[cl], px + margin, choiceY);
        choiceY += fs + 2;
      }
      choiceY += 2;
    }
  }

  // Skip hint
  if (!typewriter.done) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[SPACE] Skip text', px + pw / 2, py + ph - 8);
  }
}

function getBestCaseChoice(caseObj) {
  if (!caseObj) return -1;
  var best = -1, bestVal = -Infinity;
  for (var i = 0; i < caseObj.choices.length; i++) {
    var val = caseObj.choices[i].rep + caseObj.choices[i].gold * 0.15;
    if (val > bestVal) { bestVal = val; best = i; }
  }
  return best;
}

// ── Outcome panel ──
function drawOutcomePanel(W, H) {
  var pw = Math.min(W * 0.6, 560), ph = Math.min(H * 0.48, 380);
  var px = (W - pw) / 2, py = H * 0.26;
  drawUIPanel(px, py, pw, ph, 'OUTCOME');

  var fs = Math.max(10, Math.min(14, pw * 0.023));
  var margin = 18;
  var textW = pw - margin * 2;

  var visible = twGetVisible();
  ctx.font = fs + 'px monospace';
  ctx.textAlign = 'left';
  var lines = wrapTextLines(visible, textW, fs);
  for (var i = 0; i < lines.length; i++) {
    var ly = py + 50 + i * (fs + 5);
    if (ly > py + ph - 35) break;
    // Color reward line
    if (lines[i].indexOf('Reputation') !== -1 || lines[i].indexOf('Gold') !== -1) {
      var hasPlus = lines[i].indexOf('+') !== -1 && (lines[i].indexOf('-') === -1 || lines[i].indexOf('+') < lines[i].indexOf('-'));
      ctx.fillStyle = hasPlus ? PALETTE.uiSuccess : PALETTE.uiDanger;
      ctx.font = 'bold ' + fs + 'px monospace';
    } else {
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = fs + 'px monospace';
    }
    ctx.fillText(lines[i], px + margin, ly);
  }

  if (typewriter.done) {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[E / SPACE / ENTER] Continue', px + pw / 2, py + ph - 12);
  }
}

// ── Case board ──
function drawCaseBoard(W, H) {
  var pw = Math.min(W * 0.65, 600), ph = Math.min(H * 0.72, 540);
  var px = (W - pw) / 2, py = H * 0.14;
  drawUIPanel(px, py, pw, ph, 'CASE BOARD');

  var fs = Math.max(10, Math.min(13, pw * 0.021));
  var margin = 18;
  var tabY = py + 42;

  // Tabs
  var tabs = ['Active (' + office.activeCases.length + ')', 'Completed (' + office.completedCases.length + ')'];
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.textAlign = 'center';
  for (var t = 0; t < tabs.length; t++) {
    ctx.fillStyle = t === office.boardTab ? PALETTE.uiHighlight : PALETTE.uiTextDim;
    ctx.fillText(tabs[t], px + pw * (0.28 + t * 0.44), tabY);
  }
  ctx.fillStyle = PALETTE.uiBorder;
  ctx.fillRect(px + margin, tabY + 8, pw - margin * 2, 1);

  var cases = office.boardTab === 0 ? office.activeCases : office.completedCases;
  var listY = tabY + 22;
  var entryH = fs * 3 + 12;
  var visibleCt = Math.floor((py + ph - listY - 28) / entryH);
  var scrollMax = Math.max(0, cases.length - visibleCt);
  if (office.boardScroll > scrollMax) office.boardScroll = scrollMax;

  if (cases.length === 0) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + fs + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(office.boardTab === 0 ? 'No active cases. Sit at your desk to receive one.' : 'No completed cases yet.', px + pw / 2, listY + 20);
  } else {
    ctx.textAlign = 'left';
    var catColors = { murder: '#cc3030', robbery: '#ccaa30', missing: '#4488cc', land: '#30aa30', supernatural: '#aa44cc', political: '#cc6600', animal: '#886644', arson: '#ff6600', smuggling: '#7744bb', kidnapping: '#cc4488', fraud: '#44aacc', native: '#aa8844' };
    for (var ci = office.boardScroll; ci < Math.min(cases.length, office.boardScroll + visibleCt); ci++) {
      var c = cases[ci];
      var cy = listY + (ci - office.boardScroll) * entryH;
      // Category
      ctx.fillStyle = catColors[c.category] || PALETTE.uiText;
      ctx.font = 'bold ' + (fs - 2) + 'px monospace';
      ctx.fillText(c.category.toUpperCase(), px + margin, cy);
      // Difficulty
      ctx.fillStyle = PALETTE.uiHighlight;
      var dStars = '';
      for (var ds = 0; ds < c.difficulty; ds++) dStars += '*';
      ctx.fillText(dStars, px + margin + 110, cy);
      // Name
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = 'bold ' + fs + 'px monospace';
      ctx.fillText(c.name, px + margin, cy + fs + 3);
      // Result
      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = (fs - 2) + 'px monospace';
      if (c.resolved) {
        ctx.fillText('Day ' + c.day + '  |  ' + (c.rewardRep >= 0 ? '+' : '') + c.rewardRep + ' Rep, +$' + c.rewardGold, px + margin, cy + fs * 2 + 5);
      } else {
        ctx.fillStyle = '#ccaa30';
        ctx.fillText('PENDING - assigned Day ' + c.day, px + margin, cy + fs * 2 + 5);
      }
      // Separator
      ctx.fillStyle = 'rgba(90,58,24,0.5)';
      ctx.fillRect(px + margin, cy + fs * 3 + 8, pw - margin * 2, 1);
    }
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[TAB] Switch tab  |  [W/S] Scroll  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ── Jail view ──
function drawJailView(W, H) {
  var pw = Math.min(W * 0.6, 560), ph = Math.min(H * 0.58, 440);
  var px = (W - pw) / 2, py = H * 0.2;
  drawUIPanel(px, py, pw, ph, 'JAIL CELLS  (' + office.prisoners.length + '/' + getMaxPrisoners() + ')');

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var listY = py + 48;

  if (office.prisoners.length === 0) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + fs + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No prisoners. Solve cases to fill the cells.', px + pw / 2, listY + 20);
  } else {
    ctx.textAlign = 'left';
    for (var i = 0; i < office.prisoners.length; i++) {
      var p = office.prisoners[i];
      var iy = listY + i * (fs * 4 + 8);
      var isSel = i === office.selectedPrisoner;

      if (isSel) {
        ctx.fillStyle = 'rgba(255,215,0,0.06)';
        ctx.fillRect(px + margin - 3, iy - 4, pw - margin * 2 + 6, fs * 4 + 4);
      }

      ctx.fillStyle = isSel ? PALETTE.uiHighlight : PALETTE.uiText;
      ctx.font = 'bold ' + fs + 'px monospace';
      ctx.fillText((isSel ? '> ' : '  ') + p.name, px + margin, iy + fs);

      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = (fs - 2) + 'px monospace';
      var mood = p.mood !== undefined ? p.mood : 50;
      var moodCol = mood > 60 ? '#44aa44' : (mood > 30 ? '#aaaa44' : '#aa4444');
      var moodLabel = mood > 60 ? 'Content' : (mood > 30 ? 'Restless' : 'Hostile');
      var statusBits = 'Day ' + p.day;
      if (p.interrogated) statusBits += ' | TALKED';
      if (p.informant) statusBits += ' | INFORMANT';
      if (p.working) statusBits += ' | WORKING';
      if (p.fed) statusBits += ' | FED';
      ctx.fillText('    ' + p.crime + '  |  ' + statusBits, px + margin, iy + fs * 2 + 3);
      // Mood bar
      var mbarX = px + pw - margin - 80, mbarY = iy + 2, mbarW = 60, mbarH = 6;
      ctx.fillStyle = '#222';
      ctx.fillRect(mbarX, mbarY, mbarW, mbarH);
      ctx.fillStyle = moodCol;
      ctx.fillRect(mbarX, mbarY, mbarW * (mood / 100), mbarH);
      ctx.fillStyle = moodCol;
      ctx.font = (fs - 3) + 'px monospace';
      ctx.fillText(moodLabel, mbarX, mbarY + mbarH + 8);

      if (isSel) {
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = (fs - 1) + 'px monospace';
        ctx.fillText('    [1]Release [2]Interrogate [3]Execute [F]Feed [T]Transfer [X]Work', px + margin, iy + fs * 3 + 5);
      }
    }
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[W/S] Select  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ── Gun rack view ──
function drawGunRackView(W, H) {
  var pw = Math.min(W * 0.55, 500), ph = Math.min(H * 0.48, 360);
  var px = (W - pw) / 2, py = H * 0.26;
  drawUIPanel(px, py, pw, ph, 'GUN RACK');

  var fs = Math.max(10, Math.min(14, pw * 0.025));
  var margin = 18;
  var y = py + 52;

  ctx.textAlign = 'left';
  ctx.font = fs + 'px monospace';

  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.fillText('Current Weapon: ' + (game.currentWeapon || 'revolver').toUpperCase(), px + margin, y);
  y += fs + 8;

  ctx.fillStyle = PALETTE.uiText;
  ctx.fillText('Ammo: ' + (game.ammo || 0) + ' / ' + MAX_AMMO_CAP, px + margin, y);
  y += fs + 5;
  ctx.fillText('Gun Condition: ' + (game.gunDurability || 100) + '%', px + margin, y);
  y += fs + 12;

  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.fillText('Available Weapons:', px + margin, y);
  y += fs + 5;

  ctx.fillStyle = PALETTE.uiText;
  ctx.font = (fs - 1) + 'px monospace';
  ctx.fillText('  - Revolver', px + margin, y); y += fs + 3;
  if (game.hasShotgun) { ctx.fillText('  - Shotgun', px + margin, y); y += fs + 3; }
  if (game.hasRifle) { ctx.fillText('  - Rifle', px + margin, y); y += fs + 3; }

  y += 8;
  var lvlDef = OFFICE_UPGRADES[1].levels[office.upgrades.gunRack];
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.fillText('Rack Level: ' + lvlDef.name, px + margin, y);
  y += fs + 5;

  if (office.upgrades.gunRack >= 2 && (game.gunDurability || 100) < 100) {
    ctx.fillStyle = PALETTE.uiSuccess;
    ctx.fillText('Free repair active! Gun restored to 100%.', px + margin, y);
    game.gunDurability = 100;
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[U] Upgrade  |  [D] Darts  |  [T] Target Practice  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ── Upgrade menu ──
function drawUpgradeMenu(W, H) {
  var pw = Math.min(W * 0.62, 580), ph = Math.min(H * 0.62, 460);
  var px = (W - pw) / 2, py = H * 0.19;
  drawUIPanel(px, py, pw, ph, 'OFFICE UPGRADES   |   Gold: $' + (game.gold || 0));

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 52;

  ctx.textAlign = 'left';

  for (var i = 0; i < OFFICE_UPGRADES.length; i++) {
    var upDef = OFFICE_UPGRADES[i];
    var curLvl = office.upgrades[upDef.key];
    var isSel = i === office.selectedUpgrade;
    var nextLvl = curLvl + 1;
    var maxed = nextLvl >= upDef.levels.length;

    if (isSel) {
      ctx.fillStyle = 'rgba(255,215,0,0.06)';
      ctx.fillRect(px + margin - 3, y - 5, pw - margin * 2 + 6, fs * 4 + 6);
    }

    // Name
    ctx.fillStyle = isSel ? PALETTE.uiHighlight : PALETTE.uiText;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText((isSel ? '>> ' : '   ') + upDef.name, px + margin, y + fs);

    // Current
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('      Current: ' + upDef.levels[curLvl].name, px + margin, y + fs * 2 + 2);

    if (maxed) {
      ctx.fillStyle = PALETTE.uiSuccess;
      ctx.fillText('      MAX LEVEL', px + margin, y + fs * 3 + 2);
    } else {
      var nDef = upDef.levels[nextLvl];
      ctx.fillStyle = (game.gold || 0) >= nDef.cost ? PALETTE.uiText : PALETTE.uiDanger;
      ctx.fillText('      Next: ' + nDef.name + ' - $' + nDef.cost + ' - ' + nDef.desc, px + margin, y + fs * 3 + 2);
    }

    y += fs * 4 + 14;
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[W/S] Select  |  [E] Purchase  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ─────────────────────────────────────────────
// §17  HOOK: Arrested NPCs become prisoners
// ─────────────────────────────────────────────
(function hookArrestSystem() {
  var lastArrestCount = 0;
  setInterval(function() {
    if (!game || !game.npcs) return;
    var currentCount = game.outlawsArrested || 0;
    if (currentCount > lastArrestCount) {
      lastArrestCount = currentCount;
      if (office.prisoners.length < getMaxPrisoners()) {
        // Find the most recently arrested NPC
        for (var i = game.npcs.length - 1; i >= 0; i--) {
          var npc = game.npcs[i];
          if (npc.state === 'arrested' && !npc._officePrisoner) {
            npc._officePrisoner = true;
            office.prisoners.push({
              name: npc.name || randomPrisonerName(),
              crime: npc.type === 'bounty' ? 'Wanted Fugitive' : 'Outlaw Activity',
              day: game.dayCount || 1,
              interrogated: false,
            });
            break;
          }
        }
      }
    }
  }, 1200);
})();

// Add mood to new prisoners
var _origPush = office.prisoners.push;
office.prisoners.push = function(p) {
  if (p.mood === undefined) p.mood = 60 + rand(-10, 10);
  return _origPush.call(office.prisoners, p);
};

// ─────────────────────────────────────────────
// §18  BED & SLEEP SYSTEM
// ─────────────────────────────────────────────
function drawBedView(W, H) {
  var pw = Math.min(W * 0.55, 500), ph = Math.min(H * 0.42, 320);
  var px = (W - pw) / 2, py = H * 0.3;
  var bedLvl = office.upgrades.bed || 0;
  var bedNames = ['Bedroll', 'Iron Cot', 'Four-Poster Bed'];
  drawUIPanel(px, py, pw, ph, 'BED — ' + bedNames[bedLvl]);

  var fs = Math.max(10, Math.min(14, pw * 0.025));
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.uiText;
  ctx.font = fs + 'px monospace';

  var hpRestore = bedLvl >= 2 ? 'Full HP' : (bedLvl >= 1 ? '+3 HP' : '+2 HP');
  ctx.fillText('Rest and recover your strength.', px + pw / 2, py + 52);
  ctx.fillText('Current HP: ' + (game.player.hp || 1) + '/' + (game.player.maxHp || 5), px + pw / 2, py + 72);
  ctx.fillText('Sleep restores: ' + hpRestore, px + pw / 2, py + 92);

  if (office._lastSleepDay === (game.dayCount || 1)) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + fs + 'px monospace';
    ctx.fillText('You already slept today.', px + pw / 2, py + 120);
  } else {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('[E] Sleep (advances 6 hours)', px + pw / 2, py + 120);
  }

  if (bedLvl >= 2) {
    ctx.fillStyle = '#8888cc';
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('Four-poster bed grants vivid dreams with clues.', px + pw / 2, py + 145);
  }

  // Time display
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  var timeStr = typeof getTimeString === 'function' ? getTimeString(game.time || 0) : 'Unknown';
  ctx.fillText('Current time: ' + timeStr + '  |  Day ' + (game.dayCount || 1), px + pw / 2, py + ph - 30);
  ctx.fillText('[Q/ESC] Back', px + pw / 2, py + ph - 10);
}

function drawSleepOverlay(W, H) {
  // Black screen with Zzz
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = Math.min(1, office.fadeIn);
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  var zzz = 'Z';
  var zCount = Math.floor((2.5 - office.sleepTimer) * 3) + 1;
  for (var zi = 0; zi < Math.min(zCount, 6); zi++) zzz += 'z';
  ctx.fillText(zzz, W / 2, H / 2 - 10);
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = '14px monospace';
  ctx.fillText('Sleeping...', W / 2, H / 2 + 20);
  if (office.nightmareActive) {
    ctx.fillStyle = '#cc3030';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('* Restless sleep... nightmares... *', W / 2, H / 2 + 45);
  }
}

// ─────────────────────────────────────────────
// §19  MEETING SYSTEM
// ─────────────────────────────────────────────
function resolveMeeting(choiceIdx) {
  var m = office.currentMeeting;
  if (!m) return;
  var choice = m.choices[choiceIdx];

  var earnedGold = choice.gold || 0;
  var earnedRep = choice.rep || 0;

  if (earnedGold > 0) {
    game.gold = (game.gold || 0) + earnedGold;
    game.totalGoldEarned = (game.totalGoldEarned || 0) + earnedGold;
  } else if (earnedGold < 0) {
    if ((game.gold || 0) < Math.abs(earnedGold)) {
      showNotification('Not enough gold!');
      return;
    }
    game.gold = (game.gold || 0) + earnedGold;
  }

  game.reputation = clamp((game.reputation || 50) + earnedRep, 0, REPUTATION_MAX);

  if (choice.corruption) {
    game.corruption = clamp((game.corruption || 0) + choice.corruption, 0, 100);
  }

  // Add prisoners from bounty hunter meetings
  if (m.type === 'bounty_hunter' && choiceIdx <= 1 && earnedGold < 0) {
    for (var pi = 0; pi < 3; pi++) {
      if (office.prisoners.length < getMaxPrisoners()) {
        office.prisoners.push({
          name: randomPrisonerName(), crime: 'Bounty Capture',
          day: game.dayCount || 1, interrogated: false, mood: 40,
        });
      }
    }
  }

  // Add ammo from arms dealer
  if (m.type === 'merchant' && choiceIdx === 0) {
    game.ammo = Math.min((game.ammo || 0) + 20, MAX_AMMO_CAP);
  }

  var rewardLine = '\n\n' + (earnedRep >= 0 ? '+' : '') + earnedRep + ' Rep  |  ' + (earnedGold >= 0 ? '+' : '') + '$' + Math.abs(earnedGold);
  if (choice.corruption) rewardLine += '  |  ' + (choice.corruption > 0 ? '+' : '') + choice.corruption + ' Corruption';
  twReset(choice.outcome + rewardLine);
  addJournalEntry('Meeting: ' + m.name + '. ' + (earnedRep >= 0 ? '+' : '') + earnedRep + ' Rep');
  office.currentMeeting = null;
  office.meetingChoiceVisible = false;
  office.showingOutcome = true;

  if (earnedRep >= 0) {
    if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
  } else {
    if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
  }
}

function drawMeetingPanel(W, H) {
  var pw = Math.min(W * 0.7, 660), ph = Math.min(H * 0.7, 540);
  var px = (W - pw) / 2, py = H * 0.15;
  var m = office.currentMeeting;
  drawUIPanel(px, py, pw, ph, 'MEETING: ' + (m ? m.name : ''));

  if (!m) return;
  var fs = Math.max(10, Math.min(14, pw * 0.021));
  var margin = 18;

  // Draw bodyguards if present
  if (m.bodyguards > 0) {
    for (var bg = 0; bg < m.bodyguards; bg++) {
      var bgX = px + margin + bg * 30 + 10;
      var bgY = py + 42;
      // Bodyguard silhouette
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(bgX, bgY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(bgX - 4, bgY + 6, 8, 12);
      // Gun
      ctx.fillStyle = '#555';
      ctx.fillRect(bgX + 4, bgY + 8, 8, 2);
    }
    ctx.fillStyle = '#cc3030';
    ctx.font = 'bold ' + (fs - 2) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(m.bodyguards + ' armed bodyguards stand by the door.', px + margin + m.bodyguards * 30 + 20, py + 52);
  }

  // Boss name
  if (m.bossName) {
    ctx.fillStyle = '#cc6600';
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(m.bossName + ' speaks:', px + margin, py + (m.bodyguards > 0 ? 75 : 50));
  }

  // Typewriter text
  var startY = py + (m.bodyguards > 0 ? 90 : 65);
  var visible = twGetVisible();
  ctx.font = fs + 'px monospace';
  ctx.fillStyle = PALETTE.uiText;
  ctx.textAlign = 'left';
  var lines = wrapTextLines(visible, pw - margin * 2, fs);
  for (var i = 0; i < lines.length; i++) {
    var ly = startY + i * (fs + 4);
    if (ly > py + ph - 100) break;
    ctx.fillText(lines[i], px + margin, ly);
  }

  // Choices
  if (office.meetingChoiceVisible) {
    var choiceY = py + ph - 90;
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + (fs - 1) + 'px monospace';
    ctx.fillText('YOUR RESPONSE:', px + margin, choiceY);
    choiceY += fs + 5;
    for (var ci = 0; ci < m.choices.length; ci++) {
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = (fs - 1) + 'px monospace';
      var choiceText = '[' + (ci + 1) + '] ' + m.choices[ci].text;
      var cLines = wrapTextLines(choiceText, pw - margin * 2, fs - 1);
      for (var cl = 0; cl < cLines.length; cl++) {
        ctx.fillText(cLines[cl], px + margin, choiceY);
        choiceY += fs + 2;
      }
      choiceY += 2;
    }
  }

  if (!typewriter.done) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[SPACE] Skip text', px + pw / 2, py + ph - 8);
  }
}

// ─────────────────────────────────────────────
// §20  OFFICE EVENTS
// ─────────────────────────────────────────────
function resolveOfficeEvent(choiceIdx) {
  var evt = office.officeEvent;
  if (!evt) return;
  var choice = evt.choices[choiceIdx];

  if (choice.gold) {
    if (choice.gold < 0 && (game.gold || 0) < Math.abs(choice.gold)) {
      showNotification('Not enough gold!');
      return;
    }
    game.gold = (game.gold || 0) + choice.gold;
    if (choice.gold > 0) game.totalGoldEarned = (game.totalGoldEarned || 0) + choice.gold;
  }
  if (choice.rep) game.reputation = clamp((game.reputation || 50) + choice.rep, 0, REPUTATION_MAX);

  if (choice.dog) {
    office.officeDog = true;
    office.dogName = DOG_NAMES[rand(0, DOG_NAMES.length - 1)];
    showNotification('You adopted ' + office.dogName + '! Good boy.');
  }

  addJournalEntry('Office event: ' + evt.name + '. ' + choice.outcome.substring(0, 60) + '...');

  var rewardLine = '';
  if (choice.gold || choice.rep) {
    rewardLine = '\n\n' + (choice.rep ? ((choice.rep >= 0 ? '+' : '') + choice.rep + ' Rep') : '') +
      (choice.gold ? ('  |  ' + (choice.gold >= 0 ? '+' : '') + '$' + Math.abs(choice.gold)) : '');
  }
  twReset(choice.outcome + rewardLine);
  office.officeEvent = null;
  office._eventShown = false;
  office.showingOutcome = true;

  if ((choice.rep || 0) >= 0) {
    if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
  } else {
    if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
  }
}

function drawOfficeEventPanel(W, H) {
  var pw = Math.min(W * 0.65, 600), ph = Math.min(H * 0.6, 460);
  var px = (W - pw) / 2, py = H * 0.2;
  drawUIPanel(px, py, pw, ph, 'OFFICE EVENT');

  var fs = Math.max(10, Math.min(14, pw * 0.022));
  var margin = 18;

  var visible = twGetVisible();
  ctx.font = fs + 'px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.uiText;
  var lines = wrapTextLines(visible, pw - margin * 2, fs);
  for (var i = 0; i < lines.length; i++) {
    var ly = py + 48 + i * (fs + 4);
    if (ly > py + ph - 100) break;
    if (i === 0) { ctx.fillStyle = PALETTE.uiHighlight; ctx.font = 'bold ' + fs + 'px monospace'; }
    else { ctx.fillStyle = PALETTE.uiText; ctx.font = fs + 'px monospace'; }
    ctx.fillText(lines[i], px + margin, ly);
  }

  if (office.caseChoiceVisible && office.officeEvent) {
    var choiceY = py + ph - 85;
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + (fs - 1) + 'px monospace';
    ctx.fillText('YOUR CHOICE:', px + margin, choiceY);
    choiceY += fs + 5;
    for (var ci = 0; ci < office.officeEvent.choices.length; ci++) {
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = (fs - 1) + 'px monospace';
      ctx.fillText('[' + (ci + 1) + '] ' + office.officeEvent.choices[ci].text, px + margin, choiceY);
      choiceY += fs + 5;
    }
  }
}

// ─────────────────────────────────────────────
// §21  STATS / RECORDS VIEW
// ─────────────────────────────────────────────
function drawStatsView(W, H) {
  var pw = Math.min(W * 0.7, 640), ph = Math.min(H * 0.75, 560);
  var px = (W - pw) / 2, py = H * 0.12;
  drawUIPanel(px, py, pw, ph, 'SHERIFF\'S RECORDS');

  var fs = Math.max(10, Math.min(13, pw * 0.02));
  var margin = 18;

  // Tabs
  var tabs = ['Cases', 'Jail Log', 'Finances', 'Rep History'];
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.textAlign = 'center';
  for (var t = 0; t < tabs.length; t++) {
    ctx.fillStyle = t === office.statsTab ? PALETTE.uiHighlight : PALETTE.uiTextDim;
    ctx.fillText(tabs[t], px + pw * (0.14 + t * 0.24), py + 44);
  }
  ctx.fillStyle = PALETTE.uiBorder;
  ctx.fillRect(px + margin, py + 52, pw - margin * 2, 1);

  var y = py + 68;
  ctx.textAlign = 'left';
  ctx.font = fs + 'px monospace';
  ctx.fillStyle = PALETTE.uiText;

  if (office.statsTab === 0) {
    // Case stats
    var catCounts = {};
    for (var ci = 0; ci < office.completedCases.length; ci++) {
      var cat = office.completedCases[ci].category;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    ctx.fillText('Total cases solved: ' + office.completedCases.length, px + margin, y); y += fs + 5;
    ctx.fillText('Active cases: ' + office.activeCases.length, px + margin, y); y += fs + 5;
    ctx.fillText('Villain proposals handled: ' + office.completedCases.filter(function(c) { return c.isVillainProposal; }).length, px + margin, y); y += fs + 10;
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.fillText('By Category:', px + margin, y); y += fs + 5;
    ctx.fillStyle = PALETTE.uiText;
    var catKeys = Object.keys(catCounts);
    for (var ck = 0; ck < catKeys.length; ck++) {
      ctx.fillText('  ' + catKeys[ck] + ': ' + catCounts[catKeys[ck]], px + margin, y); y += fs + 3;
    }
  } else if (office.statsTab === 1) {
    // Prisoner log
    ctx.fillText('Total prisoners: ' + (office.prisonerLog.length + office.prisoners.length), px + margin, y); y += fs + 5;
    ctx.fillText('Currently held: ' + office.prisoners.length, px + margin, y); y += fs + 5;
    var informants = office.prisoners.filter(function(p) { return p.informant; }).length;
    var working = office.prisoners.filter(function(p) { return p.working; }).length;
    ctx.fillText('Informants: ' + informants + '  |  Working: ' + working, px + margin, y); y += fs + 10;
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.fillText('Recent History:', px + margin, y); y += fs + 5;
    ctx.fillStyle = PALETTE.uiText;
    var logSlice = office.prisonerLog.slice(-8);
    for (var pl = logSlice.length - 1; pl >= 0; pl--) {
      var entry = logSlice[pl];
      ctx.fillText('  Day ' + entry.day + ': ' + entry.name + ' — ' + entry.fate, px + margin, y);
      y += fs + 3;
      if (y > py + ph - 30) break;
    }
  } else if (office.statsTab === 2) {
    // Finances
    ctx.fillText('Gold on hand: $' + (game.gold || 0), px + margin, y); y += fs + 5;
    ctx.fillText('Total earned: $' + (game.totalGoldEarned || 0), px + margin, y); y += fs + 5;
    var dailyIncome = office.prisoners.filter(function(p) { return p.working; }).length * 5;
    var dailyInfoIncome = office.prisoners.filter(function(p) { return p.informant; }).length * 5;
    var deputyCost = 0;
    for (var d = 0; d < office.deputies.length; d++) deputyCost += 10 + office.deputies[d].skill * 5;
    ctx.fillText('Daily prison labor income: $' + dailyIncome, px + margin, y); y += fs + 5;
    ctx.fillText('Daily informant income: $' + dailyInfoIncome, px + margin, y); y += fs + 5;
    ctx.fillText('Daily deputy salary cost: -$' + deputyCost, px + margin, y); y += fs + 5;
    ctx.fillStyle = dailyIncome + dailyInfoIncome - deputyCost >= 0 ? PALETTE.uiSuccess : PALETTE.uiDanger;
    ctx.fillText('Net daily: $' + (dailyIncome + dailyInfoIncome - deputyCost), px + margin, y); y += fs + 10;
    ctx.fillStyle = PALETTE.uiText;
    ctx.fillText('Pending requisitions: ' + office.pendingRequisitions.length, px + margin, y);
  } else if (office.statsTab === 3) {
    // Rep history (ASCII bar chart)
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.fillText('Reputation over time:', px + margin, y); y += fs + 8;
    var maxBarW = pw - margin * 2 - 60;
    for (var ri = 0; ri < office.repHistory.length; ri++) {
      var rh = office.repHistory[ri];
      var barW = Math.max(2, (rh.rep / 100) * maxBarW);
      var barCol = rh.rep > 70 ? '#44aa44' : (rh.rep > 40 ? '#aaaa44' : '#aa4444');
      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = (fs - 2) + 'px monospace';
      ctx.fillText('D' + rh.day, px + margin, y + 4);
      ctx.fillStyle = barCol;
      ctx.fillRect(px + margin + 35, y - 4, barW, 8);
      ctx.fillStyle = PALETTE.uiText;
      ctx.font = (fs - 3) + 'px monospace';
      ctx.fillText(rh.rep + '', px + margin + 40 + barW, y + 3);
      y += 12;
      if (y > py + ph - 30) break;
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.fillText('[TAB] Switch tab  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ─────────────────────────────────────────────
// §22  DEPUTY SYSTEM
// ─────────────────────────────────────────────
function hireDeputy() {
  if (office.deputies.length >= 3) {
    showNotification('Maximum 3 deputies!');
    return;
  }
  var cost = 100 + office.deputies.length * 75;
  if ((game.gold || 0) < cost) {
    showNotification('Need $' + cost + ' to hire a deputy.');
    return;
  }
  game.gold -= cost;
  var name = DEPUTY_NAMES[rand(0, DEPUTY_NAMES.length - 1)];
  // Ensure unique name
  var existingNames = office.deputies.map(function(d) { return d.name; });
  while (existingNames.indexOf(name) !== -1) {
    name = DEPUTY_NAMES[rand(0, DEPUTY_NAMES.length - 1)];
  }
  office.deputies.push({
    name: name,
    skill: 1,
    loyalty: 70,
    onPatrol: false,
    patrolReturn: 0,
    _lastPaidDay: game.dayCount || 1,
  });
  showNotification('Hired Deputy ' + name + '! -$' + cost);
  addJournalEntry('Hired deputy: ' + name);
  if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
}

function deputyAction(action) {
  if (office.deputies.length === 0) return;
  var dep = office.deputies[office.selectedDeputy];
  if (!dep) return;

  switch (action) {
    case 'patrol':
      if (dep.onPatrol) {
        showNotification(dep.name + ' is already on patrol.');
        return;
      }
      dep.onPatrol = true;
      dep.patrolReturn = (game.dayCount || 1) + 1;
      showNotification(dep.name + ' sent on patrol. Returns tomorrow.');
      break;
    case 'train':
      if (dep.skill >= 5) {
        showNotification(dep.name + ' is at max skill!');
        return;
      }
      var trainCost = dep.skill * 50;
      if ((game.gold || 0) < trainCost) {
        showNotification('Training costs $' + trainCost + '.');
        return;
      }
      game.gold -= trainCost;
      dep.skill++;
      dep.loyalty = Math.min(100, dep.loyalty + 10);
      showNotification(dep.name + ' trained to skill ' + dep.skill + '! -$' + trainCost);
      break;
    case 'fire':
      showNotification('Fired Deputy ' + dep.name + '. -3 Rep.');
      game.reputation = clamp((game.reputation || 50) - 3, 0, REPUTATION_MAX);
      addJournalEntry('Fired deputy: ' + dep.name);
      office.deputies.splice(office.selectedDeputy, 1);
      if (office.selectedDeputy >= office.deputies.length) {
        office.selectedDeputy = Math.max(0, office.deputies.length - 1);
      }
      break;
  }
}

// Process deputy patrol returns
(function deputyPatrolLoop() {
  setInterval(function() {
    if (!game || !office.deputies) return;
    for (var i = 0; i < office.deputies.length; i++) {
      var dep = office.deputies[i];
      if (dep.onPatrol && (game.dayCount || 1) >= dep.patrolReturn) {
        dep.onPatrol = false;
        var success = Math.random() < (0.4 + dep.skill * 0.12);
        if (success) {
          var goldEarned = rand(15, 40) + dep.skill * 10;
          var repEarned = rand(3, 8);
          game.gold = (game.gold || 0) + goldEarned;
          game.totalGoldEarned = (game.totalGoldEarned || 0) + goldEarned;
          game.reputation = clamp((game.reputation || 50) + repEarned, 0, REPUTATION_MAX);
          dep.loyalty = Math.min(100, dep.loyalty + 3);
          showNotification(dep.name + ' returned: resolved a crime! +$' + goldEarned + ', +' + repEarned + ' Rep');
        } else {
          dep.loyalty = Math.max(0, dep.loyalty - 5);
          showNotification(dep.name + ' returned: patrol was uneventful.');
        }
      }
    }
    // Prisoner work/informant daily income
    for (var p = 0; p < office.prisoners.length; p++) {
      var pr = office.prisoners[p];
      if (pr.working && pr._lastWorkDay !== (game.dayCount || 1)) {
        pr._lastWorkDay = game.dayCount || 1;
        game.gold = (game.gold || 0) + 5;
        game.totalGoldEarned = (game.totalGoldEarned || 0) + 5;
      }
      if (pr.informant && pr._lastIntelDay !== (game.dayCount || 1)) {
        pr._lastIntelDay = game.dayCount || 1;
        game.gold = (game.gold || 0) + 5;
        game.totalGoldEarned = (game.totalGoldEarned || 0) + 5;
      }
    }
  }, 2000);
})();

function drawDeputiesView(W, H) {
  var pw = Math.min(W * 0.65, 600), ph = Math.min(H * 0.65, 480);
  var px = (W - pw) / 2, py = H * 0.17;
  drawUIPanel(px, py, pw, ph, 'DEPUTY MANAGEMENT (' + office.deputies.length + '/3)');

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 48;

  ctx.textAlign = 'left';
  if (office.deputies.length === 0) {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + fs + 'px monospace';
    ctx.fillText('No deputies hired yet.', px + margin, y);
    y += fs + 10;
  } else {
    for (var i = 0; i < office.deputies.length; i++) {
      var dep = office.deputies[i];
      var isSel = i === office.selectedDeputy;
      if (isSel) {
        ctx.fillStyle = 'rgba(255,215,0,0.06)';
        ctx.fillRect(px + margin - 3, y - 5, pw - margin * 2 + 6, fs * 4 + 6);
      }
      ctx.fillStyle = isSel ? PALETTE.uiHighlight : PALETTE.uiText;
      ctx.font = 'bold ' + fs + 'px monospace';
      ctx.fillText((isSel ? '> ' : '  ') + dep.name, px + margin, y + fs);
      ctx.fillStyle = PALETTE.uiTextDim;
      ctx.font = (fs - 2) + 'px monospace';
      ctx.fillText('    Skill: ' + dep.skill + '/5  |  Loyalty: ' + dep.loyalty + '%  |  Salary: $' + (10 + dep.skill * 5) + '/day', px + margin, y + fs * 2 + 2);
      ctx.fillStyle = dep.onPatrol ? '#ccaa30' : '#44aa44';
      ctx.fillText('    Status: ' + (dep.onPatrol ? 'On Patrol (returns Day ' + dep.patrolReturn + ')' : 'Available'), px + margin, y + fs * 3 + 2);
      if (isSel && !dep.onPatrol) {
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = (fs - 1) + 'px monospace';
        ctx.fillText('    [1] Send on Patrol  [2] Train ($' + (dep.skill * 50) + ')  [3] Fire', px + margin, y + fs * 4 + 2);
      }
      y += fs * 5 + 10;
    }
  }

  var hireCost = 100 + office.deputies.length * 75;
  if (office.deputies.length < 3) {
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('[H] Hire Deputy ($' + hireCost + ')', px + margin, py + ph - 45);
  }
  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[W/S] Select  |  [Q/ESC] Close', px + pw / 2, py + ph - 10);
}

// ─────────────────────────────────────────────
// §23  CRAFTING & SUPPLIES
// ─────────────────────────────────────────────
function craftItem(type) {
  switch (type) {
    case 'silver_bullets':
      if ((game.gold || 0) < 30) { showNotification('Need $30 for silver bullets.'); return; }
      game.gold -= 30;
      game.ammo = Math.min((game.ammo || 0) + 6, MAX_AMMO_CAP);
      showNotification('Crafted 6 silver bullets! -$30');
      break;
    case 'tonic':
      if ((game.gold || 0) < 20) { showNotification('Need $20 for a tonic.'); return; }
      game.gold -= 20;
      game.healthTonics = (game.healthTonics || 0) + 1;
      showNotification('Brewed a health tonic! -$20');
      break;
    case 'badge_polish':
      if ((game.gold || 0) < 5) { showNotification('Need $5 for badge polish.'); return; }
      if (office._polishDay === (game.dayCount || 1)) { showNotification('Badge already polished today.'); return; }
      game.gold -= 5;
      office._badgePolished = true;
      office._polishDay = game.dayCount || 1;
      showNotification('Badge polished! +5% rep gains today. -$5');
      break;
    case 'forge_documents':
      if ((game.gold || 0) < 50) { showNotification('Need $50 for forged documents.'); return; }
      game.gold -= 50;
      game.corruption = clamp((game.corruption || 0) + 5, 0, 100);
      game.gold = (game.gold || 0) + 120;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + 120;
      showNotification('Forged documents sold on black market! +$120, +5 Corruption');
      break;
    case 'requisition_ammo':
      if ((game.gold || 0) < 15) { showNotification('Need $15 for ammo requisition.'); return; }
      game.gold -= 15;
      office.pendingRequisitions.push({ type: 'ammo', amount: 12, deliveryDay: (game.dayCount || 1) + 1 });
      showNotification('Ammo requisition sent! +12 ammo arrives tomorrow. -$15');
      break;
    case 'requisition_tonic':
      if ((game.gold || 0) < 25) { showNotification('Need $25 for tonic requisition.'); return; }
      game.gold -= 25;
      office.pendingRequisitions.push({ type: 'tonic', amount: 2, deliveryDay: (game.dayCount || 1) + 1 });
      showNotification('Tonic requisition sent! +2 tonics arrive tomorrow. -$25');
      break;
  }
  if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
}

function drawCraftingView(W, H) {
  var pw = Math.min(W * 0.6, 560), ph = Math.min(H * 0.65, 480);
  var px = (W - pw) / 2, py = H * 0.17;
  drawUIPanel(px, py, pw, ph, 'CRAFTING & SUPPLIES  |  Gold: $' + (game.gold || 0));

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 52;

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.fillText('Crafting:', px + margin, y); y += fs + 6;

  var items = [
    { key: '1', name: 'Silver Bullets', desc: '+6 ammo', cost: '$30' },
    { key: '2', name: 'Health Tonic', desc: '+1 tonic', cost: '$20' },
    { key: '3', name: 'Badge Polish', desc: '+5% rep today', cost: '$5' },
  ];
  if ((game.corruption || 0) >= 30) {
    items.push({ key: '4', name: 'Forge Documents', desc: 'Sell fakes +$120 +5 corruption', cost: '$50', corrupt: true });
  }

  for (var i = 0; i < items.length; i++) {
    ctx.fillStyle = items[i].corrupt ? '#cc3030' : PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    ctx.fillText('[' + items[i].key + '] ' + items[i].name + ' — ' + items[i].desc + ' (' + items[i].cost + ')', px + margin, y);
    y += fs + 5;
  }

  y += 10;
  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.fillText('Requisitions (arrive next day):', px + margin, y); y += fs + 6;

  ctx.fillStyle = PALETTE.uiText;
  ctx.font = fs + 'px monospace';
  ctx.fillText('[5] Ammo Requisition — +12 ammo ($15)', px + margin, y); y += fs + 5;
  ctx.fillText('[6] Tonic Requisition — +2 tonics ($25)', px + margin, y); y += fs + 10;

  if (office.pendingRequisitions.length > 0) {
    ctx.fillStyle = '#ccaa30';
    ctx.font = (fs - 1) + 'px monospace';
    ctx.fillText('Pending deliveries:', px + margin, y); y += fs + 3;
    for (var r = 0; r < office.pendingRequisitions.length; r++) {
      var req = office.pendingRequisitions[r];
      ctx.fillText('  ' + req.type + ' x' + req.amount + ' — arrives Day ' + req.deliveryDay, px + margin, y);
      y += fs + 3;
    }
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[Q/ESC] Close', px + pw / 2, py + ph - 10);
}

// ─────────────────────────────────────────────
// §24  MINI-GAMES: DARTS
// ─────────────────────────────────────────────
function updateDarts(dt) {
  if (office.dartPhase === 0) {
    // Swinging power bar
    office.dartPower += dt * 120;
    if (office.dartPower > 100) office.dartPower = 100;
    if (consumeKey('Space') || consumeKey('KeyE')) {
      office.dartPhase = 1;
      office.dartAngle = 0;
    }
  } else if (office.dartPhase === 1) {
    // Swinging aim
    office.dartAngle += dt * 180;
    if (consumeKey('Space') || consumeKey('KeyE')) {
      // Calculate score
      var aimError = Math.abs(Math.sin(office.dartAngle * Math.PI / 180)) * 50;
      var powerError = Math.abs(office.dartPower - 75) * 0.5;
      var totalError = aimError + powerError;
      var score = totalError < 5 ? 50 : (totalError < 15 ? 25 : (totalError < 30 ? 10 : (totalError < 50 ? 5 : 1)));
      office.dartScore += score;
      office.dartRounds++;
      showNotification('Dart hit! +' + score + ' points (Total: ' + office.dartScore + ')');
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      if (office.dartRounds >= 5) {
        var goldReward = Math.floor(office.dartScore / 10);
        game.gold = (game.gold || 0) + goldReward;
        game.totalGoldEarned = (game.totalGoldEarned || 0) + goldReward;
        if (!office._dartHighScore || office.dartScore > office._dartHighScore) office._dartHighScore = office.dartScore;
        showNotification('Darts finished! Score: ' + office.dartScore + ', Earned $' + goldReward);
        office.playingDarts = false;
        office.dartScore = 0;
        office.dartRounds = 0;
      }
      office.dartPhase = 0;
      office.dartPower = 0;
    }
  }
}

function drawDartsView(W, H) {
  var pw = Math.min(W * 0.5, 440), ph = Math.min(H * 0.55, 400);
  var px = (W - pw) / 2, py = H * 0.22;
  drawUIPanel(px, py, pw, ph, 'DART BOARD  |  Round ' + (office.dartRounds + 1) + '/5');

  var fs = Math.max(10, Math.min(14, pw * 0.028));
  ctx.textAlign = 'center';

  // Dart board
  var bx = px + pw / 2, by = py + ph * 0.35, br = ph * 0.2;
  var dartCols2 = ['#cc2222', '#e8d8b8', '#222288', '#e8d8b8', '#cc2222'];
  for (var dri = 0; dri < 5; dri++) {
    ctx.fillStyle = dartCols2[dri];
    ctx.beginPath();
    ctx.arc(bx, by, br * (1 - dri * 0.18), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fill();

  // Aim indicator
  if (office.dartPhase === 1) {
    var aimX = bx + Math.sin(office.dartAngle * Math.PI / 180) * br * 0.8;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(aimX, by - br);
    ctx.lineTo(aimX, by + br);
    ctx.stroke();
  }

  // Power bar
  ctx.fillStyle = '#222';
  ctx.fillRect(px + 20, py + ph - 70, pw - 40, 16);
  var powerCol = office.dartPower > 60 && office.dartPower < 90 ? '#44aa44' : '#aaaa44';
  ctx.fillStyle = powerCol;
  ctx.fillRect(px + 20, py + ph - 70, (pw - 40) * office.dartPower / 100, 16);
  // Sweet spot indicator
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(px + 20 + (pw - 40) * 0.7, py + ph - 70, (pw - 40) * 0.15, 16);

  ctx.fillStyle = PALETTE.uiText;
  ctx.font = fs + 'px monospace';
  ctx.fillText(office.dartPhase === 0 ? '[SPACE] Set Power' : '[SPACE] Throw!', px + pw / 2, py + ph - 36);
  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.fillText('Score: ' + office.dartScore, px + pw / 2, py + ph - 18);
}

// ─────────────────────────────────────────────
// §25  MINI-GAME: TARGET PRACTICE
// ─────────────────────────────────────────────
function updateTargetPractice(dt) {
  if (office.targetPhase === 0) {
    // Countdown
    office.targetTimer += dt;
    if (office.targetTimer >= 2) {
      office.targetPhase = 1;
      office.targetTimer = 0;
    }
  } else if (office.targetPhase === 1) {
    // Random delay before "DRAW!"
    office.targetTimer += dt;
    var drawTime = 0.5 + Math.random() * 2;
    if (consumeKey('Space') || consumeKey('KeyE')) {
      // Too early!
      showNotification('Too early! -5 Rep for recklessness.');
      game.reputation = clamp((game.reputation || 50) - 5, 0, REPUTATION_MAX);
      office.targetPractice = false;
      office.targetPhase = 0;
      office.targetTimer = 0;
      return;
    }
    if (office.targetTimer >= drawTime) {
      office.targetPhase = 2;
      office.targetTimer = 0;
    }
  } else if (office.targetPhase === 2) {
    // DRAW! Time reaction
    office.targetTimer += dt;
    if (consumeKey('Space') || consumeKey('KeyE')) {
      var reactionMs = Math.round(office.targetTimer * 1000);
      var score = reactionMs < 200 ? 50 : (reactionMs < 400 ? 30 : (reactionMs < 700 ? 15 : 5));
      office.targetScore += score;
      var goldReward = Math.floor(score / 5);
      game.gold = (game.gold || 0) + goldReward;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + goldReward;
      showNotification('BANG! ' + reactionMs + 'ms reaction! +' + score + ' pts, +$' + goldReward);
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
      office.targetPractice = false;
      office.targetPhase = 0;
      office.targetTimer = 0;
    }
    if (office.targetTimer > 2) {
      showNotification('Too slow! The bottle fell on its own.');
      office.targetPractice = false;
      office.targetPhase = 0;
      office.targetTimer = 0;
    }
  }
}

function drawTargetPracticeView(W, H) {
  var pw = Math.min(W * 0.5, 440), ph = Math.min(H * 0.45, 340);
  var px = (W - pw) / 2, py = H * 0.27;
  drawUIPanel(px, py, pw, ph, 'TARGET PRACTICE');

  var fs = Math.max(12, Math.min(18, pw * 0.035));
  ctx.textAlign = 'center';

  if (office.targetPhase === 0) {
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    ctx.fillText('Get ready...', px + pw / 2, py + ph / 2);
  } else if (office.targetPhase === 1) {
    // Bottles on shelf
    ctx.fillStyle = '#44aa44';
    for (var bi = 0; bi < 5; bi++) {
      ctx.fillRect(px + pw * 0.2 + bi * pw * 0.12, py + ph * 0.3, 10, 20);
      ctx.beginPath();
      ctx.arc(px + pw * 0.2 + bi * pw * 0.12 + 5, py + ph * 0.3, 5, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = '#ccaa30';
    ctx.font = 'bold ' + (fs + 4) + 'px monospace';
    ctx.fillText('WAIT...', px + pw / 2, py + ph * 0.7);
  } else if (office.targetPhase === 2) {
    ctx.fillStyle = '#ff4400';
    ctx.font = 'bold ' + (fs + 8) + 'px monospace';
    ctx.fillText('DRAW!', px + pw / 2, py + ph * 0.45);
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = fs + 'px monospace';
    ctx.fillText('[SPACE] Shoot!', px + pw / 2, py + ph * 0.65);
  }
}

// ─────────────────────────────────────────────
// §27  BOOKSHELF / LORE READING
// ─────────────────────────────────────────────
function drawBookshelfView(W, H) {
  var pw = Math.min(W * 0.68, 620), ph = Math.min(H * 0.72, 540);
  var px = (W - pw) / 2, py = H * 0.14;
  drawUIPanel(px, py, pw, ph, 'BOOKSHELF');

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 48;

  ctx.textAlign = 'left';
  for (var i = 0; i < LORE_BOOKS.length; i++) {
    var sel = i === office.selectedBook;
    var read = office.bookRead[i];
    ctx.fillStyle = sel ? PALETTE.uiHighlight : (read ? PALETTE.uiTextDim : PALETTE.uiText);
    ctx.font = (sel ? 'bold ' : '') + fs + 'px monospace';
    ctx.fillText((sel ? '> ' : '  ') + LORE_BOOKS[i].title + (read ? ' [READ]' : ''), px + margin, y);
    y += fs + 4;
  }

  y += 8;
  ctx.fillStyle = PALETTE.uiText;
  ctx.font = (fs - 1) + 'px monospace';
  var book = LORE_BOOKS[office.selectedBook];
  if (office.bookRead[office.selectedBook]) {
    var lines = wrapTextLines(book.text || book.content || '', pw - margin * 2, fs - 1);
    for (var li = 0; li < lines.length; li++) {
      if (y > py + ph - 30) break;
      ctx.fillText(lines[li], px + margin, y);
      y += fs + 2;
    }
  } else {
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + (fs - 1) + 'px monospace';
    ctx.fillText('Press [E] to read this book.', px + margin, y);
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[W/S] Select  |  [E] Read  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ─────────────────────────────────────────────
// §28  WANTED POSTER BOARD
// ─────────────────────────────────────────────
var WANTED_NAMES = [
  'Black Bart', 'One-Eyed Pete', 'Cactus Jack', 'The Diamondback Kid',
  'Whiskey Slim', 'Mad Dog McGraw', 'Iron Jaw Jenkins', 'Rattlesnake Ruby',
  'Dusty Rhodes', 'The Silver Fox', 'Two-Gun Torres', 'Dynamite Dan'
];
var WANTED_CRIMES = [
  'Train robbery', 'Bank heist', 'Horse theft', 'Murder', 'Cattle rustling',
  'Stagecoach holdup', 'Arson', 'Counterfeiting', 'Jail break', 'Kidnapping'
];

function generateWantedPosters() {
  if (office.wantedPosters.length > 0 && office.wantedPosters[0]._day === (game.dayCount || 1)) return;
  office.wantedPosters = [];
  var count = rand(3, 6);
  for (var i = 0; i < count; i++) {
    office.wantedPosters.push({
      name: WANTED_NAMES[rand(0, WANTED_NAMES.length - 1)],
      crime: WANTED_CRIMES[rand(0, WANTED_CRIMES.length - 1)],
      bounty: rand(50, 500),
      dead: Math.random() < 0.3,
      _day: game.dayCount || 1
    });
  }
}

function drawWantedBoard(W, H) {
  var pw = Math.min(W * 0.65, 600), ph = Math.min(H * 0.7, 520);
  var px = (W - pw) / 2, py = H * 0.15;
  drawUIPanel(px, py, pw, ph, 'WANTED BOARD');

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 48;

  ctx.textAlign = 'left';
  for (var i = 0; i < office.wantedPosters.length; i++) {
    var wp = office.wantedPosters[i];
    // Mini poster look
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(px + margin, y - 4, pw - margin * 2, fs * 3 + 12);
    ctx.fillStyle = '#e8d8b8';
    ctx.fillRect(px + margin + 2, y - 2, pw - margin * 2 - 4, fs * 3 + 8);

    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('WANTED: ' + wp.name, px + margin + 8, y + fs);
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('Crime: ' + wp.crime, px + margin + 8, y + fs * 2);
    ctx.fillStyle = '#cc3030';
    ctx.fillText('$' + wp.bounty + ' — ' + (wp.dead ? 'DEAD OR ALIVE' : 'ALIVE ONLY'), px + margin + 8, y + fs * 3);
    y += fs * 3 + 18;
    if (y > py + ph - 30) break;
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ─────────────────────────────────────────────
// §29  NOTICE BOARD
// ─────────────────────────────────────────────
var NOTICE_TEMPLATES = [
  'Town dance this Saturday at the saloon.',
  'Church services moved to 10 AM Sundays.',
  'Cattle auction next week — best prices guaranteed.',
  'New schoolteacher needed. Apply at town hall.',
  'Doc Williams now offering dental extractions ($3).',
  'MISSING: One brown mule, answers to "Biscuit".',
  'Land for sale — 40 acres north of the creek.',
  'Temperance Society meeting every Wednesday.',
  'Railroad company seeking laborers. $2/day.',
  'FOUND: Gold pocket watch near the general store.',
  'WARNING: Coyotes spotted near livestock pens.',
  'Blacksmith offering 20% off horseshoes this week.',
  'Town council elections in 2 weeks. Register to vote.',
  'Piano recital by Miss Eleanor — Friday evening.',
  'Reward for information on missing shipment of dynamite.',
];

function generateNotices() {
  if (office.notices.length > 0 && office.notices[0]._day === (game.dayCount || 1)) return;
  office.notices = [];
  var count = rand(4, 7);
  var used = {};
  for (var i = 0; i < count; i++) {
    var idx = rand(0, NOTICE_TEMPLATES.length - 1);
    while (used[idx]) idx = (idx + 1) % NOTICE_TEMPLATES.length;
    used[idx] = true;
    office.notices.push({ text: NOTICE_TEMPLATES[idx], _day: game.dayCount || 1 });
  }
}

function drawNoticeBoard(W, H) {
  var pw = Math.min(W * 0.6, 560), ph = Math.min(H * 0.65, 480);
  var px = (W - pw) / 2, py = H * 0.17;
  drawUIPanel(px, py, pw, ph, 'NOTICE BOARD');

  var fs = Math.max(10, Math.min(13, pw * 0.022));
  var margin = 18;
  var y = py + 52;

  ctx.textAlign = 'left';
  for (var i = 0; i < office.notices.length; i++) {
    ctx.fillStyle = (i % 2 === 0) ? PALETTE.uiText : PALETTE.uiTextDim;
    ctx.font = fs + 'px monospace';
    var lines = wrapTextLines('- ' + office.notices[i].text, pw - margin * 2, fs);
    for (var l = 0; l < lines.length; l++) {
      if (y > py + ph - 30) break;
      ctx.fillText(lines[l], px + margin, y);
      y += fs + 2;
    }
    y += 6;
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[Q/ESC] Close', px + pw / 2, py + ph - 8);
}

// ─────────────────────────────────────────────
// §30  PRISONER EVENTS (bribe / escape)
// ─────────────────────────────────────────────
function resolvePrisonerEvent(choice) {
  var evt = office.prisonerEvent;
  if (!evt) return;

  if (evt.type === 'escape') {
    if (choice === 0) {
      // Subdue
      game.reputation = clamp((game.reputation || 50) + 5, 0, REPUTATION_MAX);
      evt.prisoner.mood = Math.max(0, (evt.prisoner.mood || 50) - 20);
      showNotification('You subdued ' + evt.prisoner.name + '! +5 Rep');
      addJournalEntry('Stopped escape attempt by ' + evt.prisoner.name);
    } else {
      // Let go
      game.reputation = clamp((game.reputation || 50) - 3, 0, REPUTATION_MAX);
      var idx = office.prisoners.indexOf(evt.prisoner);
      if (idx >= 0) {
        office.prisonerLog.push({ name: evt.prisoner.name, day: game.dayCount || 1, fate: 'Escaped' });
        office.prisoners.splice(idx, 1);
      }
      showNotification(evt.prisoner.name + ' escaped. -3 Rep');
    }
  } else if (evt.type === 'bribe') {
    if (choice === 0) {
      // Accept bribe
      game.gold = (game.gold || 0) + evt.amount;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + evt.amount;
      game.corruption = clamp((game.corruption || 0) + 5, 0, 100);
      var idx2 = office.prisoners.indexOf(evt.prisoner);
      if (idx2 >= 0) {
        office.prisonerLog.push({ name: evt.prisoner.name, day: game.dayCount || 1, fate: 'Bribed out' });
        office.prisoners.splice(idx2, 1);
      }
      showNotification('Accepted $' + evt.amount + ' bribe. +5 Corruption');
      addJournalEntry('Accepted bribe from ' + evt.prisoner.name);
    } else {
      // Refuse
      game.reputation = clamp((game.reputation || 50) + 3, 0, REPUTATION_MAX);
      evt.prisoner.mood = Math.max(0, (evt.prisoner.mood || 50) - 10);
      showNotification('Refused bribe. +3 Rep');
    }
  }

  office.prisonerEvent = null;
}

function drawPrisonerEventPanel(W, H) {
  var evt = office.prisonerEvent;
  if (!evt) return;
  var pw = Math.min(W * 0.55, 500), ph = Math.min(H * 0.4, 300);
  var px = (W - pw) / 2, py = H * 0.3;
  drawUIPanel(px, py, pw, ph, evt.type === 'escape' ? 'ESCAPE ATTEMPT!' : 'BRIBE OFFER');

  var fs = Math.max(11, Math.min(14, pw * 0.025));
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.uiText;
  ctx.font = fs + 'px monospace';
  var descLines = wrapTextLines(evt.desc, pw - 36, fs);
  var y = py + 55;
  for (var i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], px + pw / 2, y);
    y += fs + 3;
  }
  y += 12;
  ctx.fillStyle = PALETTE.uiHighlight;
  ctx.font = (fs - 1) + 'px monospace';
  ctx.fillText(evt.choices[0], px + pw / 2, y); y += fs + 6;
  ctx.fillText(evt.choices[1], px + pw / 2, y);
}

// ─────────────────────────────────────────────
// §31  SOLITAIRE (memory match card game)
// ─────────────────────────────────────────────
var CARD_SUITS = ['♠', '♥', '♦', '♣', '★', '☆', '♪', '♫'];

function initSolitaire() {
  var pairs = CARD_SUITS.slice(0, 6); // 6 pairs = 12 cards
  var deck = [];
  for (var i = 0; i < pairs.length; i++) {
    deck.push({ suit: pairs[i], flipped: false, matched: false });
    deck.push({ suit: pairs[i], flipped: false, matched: false });
  }
  // Shuffle
  for (var s = deck.length - 1; s > 0; s--) {
    var j = rand(0, s);
    var tmp = deck[s]; deck[s] = deck[j]; deck[j] = tmp;
  }
  office.solitaireCards = deck;
  office.solitaireScore = 0;
  office.solitaireFlipped = 0;
  office.solitaireMatches = 0;
  office._solFirst = -1;
  office._solSecond = -1;
  office._solWait = 0;
  office._solCursor = 0;
}

function updateSolitaire(dt) {
  if (office._solWait > 0) {
    office._solWait -= dt;
    if (office._solWait <= 0) {
      var c1 = office.solitaireCards[office._solFirst];
      var c2 = office.solitaireCards[office._solSecond];
      if (c1.suit === c2.suit) {
        c1.matched = true;
        c2.matched = true;
        office.solitaireMatches++;
        office.solitaireScore += 10;
        if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
        if (office.solitaireMatches >= 6) {
          var goldReward = Math.max(5, 60 - office.solitaireFlipped * 2);
          game.gold = (game.gold || 0) + goldReward;
          game.totalGoldEarned = (game.totalGoldEarned || 0) + goldReward;
          office._solitaireWins = (office._solitaireWins || 0) + 1;
          showNotification('Solitaire complete! Earned $' + goldReward);
          office.playingSolitaire = false;
          return;
        }
      } else {
        c1.flipped = false;
        c2.flipped = false;
      }
      office._solFirst = -1;
      office._solSecond = -1;
    }
    return;
  }

  // Cursor movement
  if (consumeKey('ArrowLeft') || consumeKey('KeyA')) office._solCursor = Math.max(0, office._solCursor - 1);
  if (consumeKey('ArrowRight') || consumeKey('KeyD')) office._solCursor = Math.min(11, office._solCursor + 1);
  if (consumeKey('ArrowUp') || consumeKey('KeyW')) office._solCursor = Math.max(0, office._solCursor - 4);
  if (consumeKey('ArrowDown') || consumeKey('KeyS')) office._solCursor = Math.min(11, office._solCursor + 4);

  if (consumeKey('KeyE') || consumeKey('Space') || consumeKey('Enter')) {
    var card = office.solitaireCards[office._solCursor];
    if (!card || card.flipped || card.matched) return;
    card.flipped = true;
    office.solitaireFlipped++;
    if (office._solFirst === -1) {
      office._solFirst = office._solCursor;
    } else {
      office._solSecond = office._solCursor;
      office._solWait = 0.8;
    }
  }
}

function drawSolitaireView(W, H) {
  var pw = Math.min(W * 0.6, 520), ph = Math.min(H * 0.55, 400);
  var px = (W - pw) / 2, py = H * 0.22;
  drawUIPanel(px, py, pw, ph, 'MEMORY MATCH  |  Pairs: ' + office.solitaireMatches + '/6');

  var fs = Math.max(12, Math.min(18, pw * 0.03));
  var cardW = (pw - 80) / 4, cardH = cardW * 1.3;
  var startX = px + 30, startY = py + 50;

  for (var i = 0; i < office.solitaireCards.length; i++) {
    var card = office.solitaireCards[i];
    var col = i % 4, row = Math.floor(i / 4);
    var cx = startX + col * (cardW + 8), cy = startY + row * (cardH + 8);
    var isCursor = i === office._solCursor;

    if (isCursor) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 2, cy - 2, cardW + 4, cardH + 4);
    }

    if (card.matched) {
      ctx.fillStyle = 'rgba(68,170,68,0.3)';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.fillStyle = '#44aa44';
      ctx.font = 'bold ' + (fs + 4) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(card.suit, cx + cardW / 2, cy + cardH / 2 + 6);
    } else if (card.flipped) {
      ctx.fillStyle = '#e8d8b8';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cardW, cardH);
      ctx.fillStyle = '#3a2a1a';
      ctx.font = 'bold ' + (fs + 4) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(card.suit, cx + cardW / 2, cy + cardH / 2 + 6);
    } else {
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cardW, cardH);
      ctx.fillStyle = '#6a5a4a';
      ctx.font = (fs - 2) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx + cardW / 2, cy + cardH / 2 + 4);
    }
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 4) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Flips: ' + office.solitaireFlipped + '  |  [WASD] Move  [E] Flip  [Q/ESC] Quit', px + pw / 2, py + ph - 10);
}

// ─────────────────────────────────────────────
// §32  TROPHY SYSTEM
// ─────────────────────────────────────────────
var TROPHY_DEFS = [
  { id: 'first_case', name: 'First Case', desc: 'Solve your first case', check: function() { return office.completedCases.length >= 1; } },
  { id: '10_cases', name: 'Veteran Lawman', desc: 'Solve 10 cases', check: function() { return office.completedCases.length >= 10; } },
  { id: '25_cases', name: 'Legend of the Law', desc: 'Solve 25 cases', check: function() { return office.completedCases.length >= 25; } },
  { id: 'first_prisoner', name: 'Jailkeeper', desc: 'Jail your first prisoner', check: function() { return office.prisonerLog.length > 0 || office.prisoners.length > 0; } },
  { id: '5_prisoners', name: 'Full House', desc: 'Have 5 prisoners at once', check: function() { return office.prisoners.length >= 5; } },
  { id: 'first_deputy', name: 'Delegation', desc: 'Hire your first deputy', check: function() { return office.deputies.length >= 1; } },
  { id: '3_deputies', name: 'Full Force', desc: 'Have 3 deputies at once', check: function() { return office.deputies.length >= 3; } },
  { id: 'max_rep', name: 'Beloved Sheriff', desc: 'Reach max reputation', check: function() { return (game.reputation || 0) >= REPUTATION_MAX; } },
  { id: 'rich', name: 'Gold Rush', desc: 'Have $1000 gold', check: function() { return (game.gold || 0) >= 1000; } },
  { id: 'reader', name: 'Bookworm', desc: 'Read all lore books', check: function() { for (var i = 0; i < LORE_BOOKS.length; i++) { if (!office.bookRead[i]) return false; } return true; } },
  { id: 'darts_50', name: 'Bullseye', desc: 'Score 50+ in one dart round', check: function() { return office._dartHighScore >= 50; } },
  { id: 'coffee', name: 'Caffeinated', desc: 'Brew 10 cups of coffee', check: function() { return (office._coffeeCount || 0) >= 10; } },
  { id: 'corrupt', name: 'Crooked Sheriff', desc: 'Reach 50+ corruption', check: function() { return (game.corruption || 0) >= 50; } },
  { id: 'dog_owner', name: 'Man\'s Best Friend', desc: 'Adopt an office dog', check: function() { return office.officeDog; } },
  { id: 'solitaire', name: 'Card Sharp', desc: 'Win a game of solitaire', check: function() { return (office._solitaireWins || 0) >= 1; } },
];

function checkTrophies() {
  for (var i = 0; i < TROPHY_DEFS.length; i++) {
    var td = TROPHY_DEFS[i];
    var already = false;
    for (var t = 0; t < office.trophies.length; t++) {
      if (office.trophies[t].id === td.id) { already = true; break; }
    }
    if (!already && td.check()) {
      office.trophies.push({ id: td.id, name: td.name, desc: td.desc, day: game.dayCount || 1 });
      showNotification('TROPHY EARNED: ' + td.name + '!');
      if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
    }
  }
}

// ─────────────────────────────────────────────
// §33  MUSIC BOX
// ─────────────────────────────────────────────
function toggleMusicBox() {
  office.musicBoxOn = !office.musicBoxOn;
  showNotification(office.musicBoxOn ? 'Music box playing...' : 'Music box stopped.');
  // Integrate with game audio if available
  if (typeof audio !== 'undefined') {
    if (office.musicBoxOn && typeof audio.playMusicBox === 'function') {
      audio.playMusicBox();
    } else if (!office.musicBoxOn && typeof audio.stopMusicBox === 'function') {
      audio.stopMusicBox();
    }
  }
}

// ─────────────────────────────────────────────
// §34  OFFICE DOG INTERACTION
// ─────────────────────────────────────────────
function interactWithDog() {
  if (!office.officeDog) {
    showNotification('No dog in the office yet. Maybe one will visit...');
    return;
  }
  var actions = [
    'You pet ' + office.dogName + '. Tail wags happily! +1 Rep',
    office.dogName + ' fetches your hat. Good boy!',
    office.dogName + ' rolls over for belly rubs.',
    'You toss ' + office.dogName + ' a treat.',
    office.dogName + ' barks excitedly and runs in circles!',
    office.dogName + ' licks your hand affectionately.',
  ];
  var msg = actions[rand(0, actions.length - 1)];
  showNotification(msg);
  if (msg.indexOf('+1 Rep') >= 0) {
    game.reputation = clamp((game.reputation || 50) + 1, 0, REPUTATION_MAX);
  }
}

// ─────────────────────────────────────────────
// §35  SPITTOON CHALLENGE
// ─────────────────────────────────────────────
function useSpittoon() {
  if (office._spittoonDay === (game.dayCount || 1)) {
    showNotification('Already used the spittoon today, partner.');
    return;
  }
  office._spittoonDay = game.dayCount || 1;
  var hit = Math.random() < 0.6;
  if (hit) {
    office.spittoonStreak++;
    var reward = office.spittoonStreak * 2;
    game.gold = (game.gold || 0) + reward;
    game.totalGoldEarned = (game.totalGoldEarned || 0) + reward;
    showNotification('DING! Hit the spittoon! Streak: ' + office.spittoonStreak + ' (+$' + reward + ')');
    if (typeof audio !== 'undefined' && typeof audio.playDing === 'function') audio.playDing();
  } else {
    office.spittoonStreak = 0;
    showNotification('Missed the spittoon. Streak reset!');
  }
}

// ─────────────────────────────────────────────
// §36  OFFICE SAFE
// ─────────────────────────────────────────────
// Safe accessed from drawers with upgrade
function depositToSafe(amount) {
  if ((game.gold || 0) < amount) {
    showNotification('Not enough gold to deposit.');
    return;
  }
  game.gold -= amount;
  office.safeGold += amount;
  showNotification('Deposited $' + amount + ' in safe. Safe total: $' + office.safeGold);
}

function withdrawFromSafe(amount) {
  if (office.safeGold < amount) {
    showNotification('Not enough in the safe.');
    return;
  }
  office.safeGold -= amount;
  game.gold = (game.gold || 0) + amount;
  showNotification('Withdrew $' + amount + ' from safe. Remaining: $' + office.safeGold);
}

// ─────────────────────────────────────────────
// §37  TELEGRAM WORLD EVENTS
// ─────────────────────────────────────────────
// When a telegram is read, this triggers real gameplay events in the world
function triggerTelegramEvent(eventType) {
  if (!game || !game.npcs) return;
  var MAP_W = 80, MAP_H = 60, TILE_SZ = typeof TILE !== 'undefined' ? TILE : 32;

  switch (eventType) {

    case 'gang_raid':
      // Spawn 4-6 hostile outlaws at edge of map heading toward town
      var gangSize = rand(4, 6);
      for (var gi = 0; gi < gangSize; gi++) {
        var spawnEdge = Math.random() < 0.5 ? 2 : MAP_W - 3;
        var gangNpc = createNPC(
          game.npcs.length, NPC_TYPES.OUTLAW,
          'Tombstone Gang #' + (gi + 1),
          spawnEdge, rand(25, 35), null
        );
        gangNpc.hostile = true;
        gangNpc.hp = 4 + rand(0, 2);
        gangNpc.maxHp = gangNpc.hp;
        gangNpc.targetX = 40 * TILE_SZ;
        gangNpc.targetY = 30 * TILE_SZ;
        game.npcs.push(gangNpc);
      }
      showNotification('ALERT: Armed gang of ' + gangSize + ' spotted heading toward town!');
      addJournalEntry('Gang raid incoming — ' + gangSize + ' armed outlaws approaching from Tombstone.');
      break;

    case 'bounty_target':
      // Spawn a high-value bounty target NPC hiding in town
      var bountyNames = ['Rattlesnake Hank', 'Dead-Eye Dixon', 'Mad Dog Murphy', 'Iron Jack Keller'];
      var bName = bountyNames[rand(0, bountyNames.length - 1)];
      var bountyNpc = createNPC(
        game.npcs.length, NPC_TYPES.BOUNTY,
        bName,
        rand(10, 65), rand(10, 50), null
      );
      bountyNpc.hostile = false; // Not hostile until confronted
      bountyNpc.hp = 6;
      bountyNpc.maxHp = 6;
      bountyNpc._isBountyTarget = true;
      bountyNpc._bountyReward = 500;
      game.npcs.push(bountyNpc);
      showNotification('WANTED: ' + bName + ' — $500 bounty. Last seen near town.');
      addJournalEntry('Bounty target ' + bName + ' reported in area. $500 reward.');
      break;

    case 'governor_bonus':
      // Actually give the $100 bonus
      game.gold = (game.gold || 0) + 100;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + 100;
      game.reputation = clamp((game.reputation || 50) + 5, 0, REPUTATION_MAX);
      showNotification('Governor\'s bonus received: +$100, +5 Rep!');
      addJournalEntry('Received $100 bonus and commendation from the Governor.');
      break;

    case 'sick_traveler':
      // Spawn a sick stranger NPC — if player interacts, choice to help or turn away
      var sickNpc = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        'Sick Traveler',
        rand(3, 8), rand(26, 34), null
      );
      sickNpc._isSick = true;
      sickNpc.state = 'walking';
      game.npcs.push(sickNpc);
      showNotification('A sick traveler has been spotted approaching from the east.');
      addJournalEntry('Sick traveler approaching town. Smallpox outbreak reported nearby.');
      break;

    case 'train_arriving':
      // Spawn a train if the game supports it
      if (typeof spawnTrain === 'function') {
        spawnTrain();
      } else {
        // Fallback: gold shipment arrives
        game.gold = (game.gold || 0) + 75;
        game.totalGoldEarned = (game.totalGoldEarned || 0) + 75;
        showNotification('Train cargo delivered: +$75 from railroad company.');
        addJournalEntry('Railroad shipment delivered to town.');
      }
      break;

    case 'prison_break':
      // Spawn 3 hostile escaped convicts
      var convictNames = ['Convict #117', 'Convict #232', 'Convict #089'];
      for (var ci = 0; ci < 3; ci++) {
        var convict = createNPC(
          game.npcs.length, NPC_TYPES.OUTLAW,
          convictNames[ci],
          rand(1, 5), rand(20, 40), null
        );
        convict.hostile = true;
        convict.hp = 5;
        convict.maxHp = 5;
        convict._isEscapee = true;
        game.npcs.push(convict);
      }
      showNotification('ALERT: 3 escaped convicts heading this way! Armed and dangerous!');
      addJournalEntry('State prison break — 3 convicts heading west toward town.');
      break;

    case 'gold_rush':
      // Spawn several prospector NPCs (non-hostile but cause trouble)
      var prospectorCount = rand(4, 7);
      for (var pi = 0; pi < prospectorCount; pi++) {
        var prospector = createNPC(
          game.npcs.length, NPC_TYPES.STRANGER,
          'Prospector',
          rand(5, MAP_W - 10), rand(5, MAP_H - 10), null
        );
        prospector._isProspector = true;
        game.npcs.push(prospector);
      }
      // Also scatter some gold nuggets if the feature exists
      if (game.goldNuggets) {
        for (var gn = 0; gn < 5; gn++) {
          game.goldNuggets.push({
            x: rand(5, MAP_W - 5) * TILE_SZ,
            y: rand(5, MAP_H - 5) * TILE_SZ,
            value: rand(10, 30),
            collected: false,
          });
        }
      }
      showNotification(prospectorCount + ' prospectors flooding into town! Gold fever has taken hold.');
      addJournalEntry('Gold rush — ' + prospectorCount + ' prospectors arrived. Expect increased crime.');
      break;

    case 'judge_arrival':
      // Spawn a judge NPC and auto-process prisoners
      var judge = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        'Circuit Judge Williams',
        38, 26, null
      );
      judge._isJudge = true;
      game.npcs.push(judge);
      // Process prisoners: release those with high mood, keep dangerous ones
      var releasedCount = 0;
      for (var ji = office.prisoners.length - 1; ji >= 0; ji--) {
        var pr = office.prisoners[ji];
        if ((pr.mood || 50) > 40 && Math.random() < 0.5) {
          office.prisonerLog.push({ name: pr.name, day: game.dayCount || 1, fate: 'Released by judge' });
          office.prisoners.splice(ji, 1);
          releasedCount++;
        }
      }
      var judgeGold = releasedCount * 15;
      game.gold = (game.gold || 0) + judgeGold;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + judgeGold;
      game.reputation = clamp((game.reputation || 50) + releasedCount * 2, 0, REPUTATION_MAX);
      showNotification('Circuit Judge arrived! ' + releasedCount + ' prisoners processed. +$' + judgeGold);
      addJournalEntry('Judge Williams held court. ' + releasedCount + ' prisoners sentenced/released.');
      break;

    case 'hidden_goods':
      // Spawn hidden loot crates near random buildings
      var crateCount = rand(2, 4);
      if (!game._hiddenCrates) game._hiddenCrates = [];
      for (var hi = 0; hi < crateCount; hi++) {
        var bldg = game.buildings ? game.buildings[rand(0, game.buildings.length - 1)] : null;
        if (bldg) {
          game._hiddenCrates.push({
            x: (bldg.x + bldg.w / 2) * TILE_SZ + rand(-40, 40),
            y: (bldg.y + bldg.h) * TILE_SZ + rand(10, 30),
            gold: rand(20, 60),
            found: false,
          });
        }
      }
      showNotification('Stolen goods hidden somewhere in town. Investigate!');
      addJournalEntry('Report of stolen goods hidden in town. Search near buildings.');
      break;

    case 'mysterious_stranger':
      // Spawn a mysterious armed stranger who may be friendly or hostile
      var strangerNames = ['The Man With No Name', 'Shadow Walker', 'Pale Rider', 'The Drifter'];
      var mystNpc = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        strangerNames[rand(0, strangerNames.length - 1)],
        rand(1, 5), rand(26, 34), null
      );
      mystNpc.hp = 8;
      mystNpc.maxHp = 8;
      mystNpc._isMystery = true;
      // 30% chance they turn hostile later
      if (Math.random() < 0.3) {
        mystNpc._turnsHostile = true;
        mystNpc._hostileDay = (game.dayCount || 1) + 1;
      }
      game.npcs.push(mystNpc);
      showNotification('A mysterious drifter has entered town. Watch them carefully.');
      addJournalEntry('Mysterious stranger arrived. Could be trouble.');
      break;

    case 'cattle_drive':
      // Give $50 for safe passage, spawn some "cattle" decoration NPCs
      game.gold = (game.gold || 0) + 50;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + 50;
      showNotification('Cattle baron paid $50 for safe passage through town.');
      addJournalEntry('Cattle drive passed through. Earned $50 for keeping the peace.');
      // Spawn a friendly rancher
      var rancher = createNPC(
        game.npcs.length, NPC_TYPES.STRANGER,
        'Cattle Baron McAllister',
        rand(35, 45), 28, null
      );
      game.npcs.push(rancher);
      break;

    case 'arms_shipment':
      // Give the player bonus ammo + spawn bandits trying to steal it
      game.ammo = Math.min((game.ammo || 0) + 20, typeof MAX_AMMO_CAP !== 'undefined' ? MAX_AMMO_CAP : 99);
      showNotification('Weapons shipment arrived: +20 ammo! But bandits are after it!');
      addJournalEntry('Arms shipment received. Bandits reported en route to intercept.');
      // Spawn 2-3 bandits
      var banditCount = rand(2, 3);
      for (var bi = 0; bi < banditCount; bi++) {
        var bandit = createNPC(
          game.npcs.length, NPC_TYPES.OUTLAW,
          'Bandit',
          rand(MAP_W - 5, MAP_W - 2), rand(25, 35), null
        );
        bandit.hostile = true;
        bandit.hp = 4;
        bandit.maxHp = 4;
        game.npcs.push(bandit);
      }
      break;
  }
}

// Handle hidden crates discovery (check each frame from features or main update)
// This is called from the update loop to check if player walks over hidden crates
function updateHiddenCrates() {
  if (!game._hiddenCrates || game._hiddenCrates.length === 0) return;
  var px = game.player.x, py = game.player.y;
  for (var i = game._hiddenCrates.length - 1; i >= 0; i--) {
    var c = game._hiddenCrates[i];
    if (!c.found && Math.abs(px - c.x) < 30 && Math.abs(py - c.y) < 30) {
      c.found = true;
      game.gold = (game.gold || 0) + c.gold;
      game.totalGoldEarned = (game.totalGoldEarned || 0) + c.gold;
      game.reputation = clamp((game.reputation || 50) + 3, 0, REPUTATION_MAX);
      showNotification('Found hidden stolen goods! +$' + c.gold + ', +3 Rep');
      addJournalEntry('Recovered stolen goods worth $' + c.gold);
      game._hiddenCrates.splice(i, 1);
    }
  }
}

// Handle mysterious stranger turning hostile (check periodically)
function updateMysteryStrangers() {
  if (!game.npcs) return;
  for (var i = 0; i < game.npcs.length; i++) {
    var npc = game.npcs[i];
    if (npc._turnsHostile && !npc.hostile && !npc.dead &&
        (game.dayCount || 1) >= npc._hostileDay) {
      npc.hostile = true;
      npc._turnsHostile = false;
      showNotification(npc.name + ' has turned hostile! They were a bandit all along!');
      addJournalEntry(npc.name + ' revealed as a dangerous outlaw.');
    }
  }
}

