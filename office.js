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
  zones: ['desk', 'caseBoard', 'gunRack', 'jailCells', 'exit'],
  zoneLabels: ['Desk [1]', 'Case Board [2]', 'Gun Rack [3]', 'Jail Cells [4]', 'Exit [ESC]'],

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
};

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
  office.upgradeMenuOpen = false;
  office.currentCase = null;
  office.showingOutcome = false;
  office.caseChoiceVisible = false;
  office.waitingForCase = false;
  office.fadeIn = 0;
  game.state = 'office';
  initDustMotes();

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
      var ddy = Math.abs(py - sheriffBuilding.doorY);
      if (ddx < 2 && ddy < 2 && consumeKey('KeyE')) {
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
      if (consumeKey('Digit1')) doJailAction(0);
      if (consumeKey('Digit2')) doJailAction(1);
      if (consumeKey('Digit3')) doJailAction(2);
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
    return;
  }

  // ── SITTING AT DESK ──
  if (office.sittingAtDesk) {
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
      if (consumeKey('Escape') || consumeKey('KeyQ')) {
        office.sittingAtDesk = false;
      }
    }
    return;
  }

  // ── MAIN ZONE NAV ──
  if (consumeKey('Digit1')) { office.sittingAtDesk = true; office.waitingForCase = false; return; }
  if (consumeKey('Digit2')) { office.viewingBoard = true; office.boardScroll = 0; return; }
  if (consumeKey('Digit3')) { office.viewingGunRack = true; return; }
  if (consumeKey('Digit4')) { office.viewingJail = true; office.selectedPrisoner = 0; return; }
  if (consumeKey('Escape')) { exitSheriffOffice(); return; }
  if (consumeKey('KeyU')) { office.upgradeMenuOpen = true; office.selectedUpgrade = 0; return; }

  if (consumeKey('ArrowLeft') || consumeKey('KeyA')) {
    office.selectedZone = (office.selectedZone - 1 + office.zones.length) % office.zones.length;
  }
  if (consumeKey('ArrowRight') || consumeKey('KeyD')) {
    office.selectedZone = (office.selectedZone + 1) % office.zones.length;
  }
  if (consumeKey('KeyE') || consumeKey('Enter')) {
    switch (office.zones[office.selectedZone]) {
      case 'desk': office.sittingAtDesk = true; office.waitingForCase = false; break;
      case 'caseBoard': office.viewingBoard = true; office.boardScroll = 0; break;
      case 'gunRack': office.viewingGunRack = true; break;
      case 'jailCells': office.viewingJail = true; office.selectedPrisoner = 0; break;
      case 'exit': exitSheriffOffice(); break;
    }
  }
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
      office.prisoners.splice(office.selectedPrisoner, 1);
      if (office.selectedPrisoner >= office.prisoners.length) {
        office.selectedPrisoner = Math.max(0, office.prisoners.length - 1);
      }
      if (typeof audio !== 'undefined' && typeof audio.playBad === 'function') audio.playBad();
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
  if (office.showingOutcome) {
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
  } else if (office.sittingAtDesk) {
    drawDeskView(W, H);
  } else {
    drawMainNavigation(W, H);
  }

  // Dust motes overlay
  for (var i = 0; i < office.dustMotes.length; i++) {
    var m = office.dustMotes[i];
    ctx.globalAlpha = m.alpha * alpha;
    ctx.fillStyle = '#e8d8b8';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
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

// ── Main navigation (zone selection) ──
function drawMainNavigation(W, H) {
  var pw = Math.min(W * 0.52, 500), ph = Math.min(H * 0.32, 260);
  var px = (W - pw) / 2, py = H * 0.6;
  drawUIPanel(px, py, pw, ph, "SHERIFF'S OFFICE");

  var fs = Math.max(11, Math.min(15, pw * 0.028));
  ctx.textAlign = 'center';

  for (var i = 0; i < office.zoneLabels.length; i++) {
    var sel = i === office.selectedZone;
    ctx.fillStyle = sel ? PALETTE.uiHighlight : PALETTE.uiText;
    ctx.font = (sel ? 'bold ' : '') + fs + 'px monospace';
    var label = (sel ? '>> ' : '   ') + office.zoneLabels[i] + (sel ? ' <<' : '');
    ctx.fillText(label, px + pw / 2, py + 52 + i * (fs + 9));
  }

  ctx.fillStyle = PALETTE.uiTextDim;
  ctx.font = (fs - 2) + 'px monospace';
  ctx.fillText('A/D: Select  |  E: Enter  |  U: Upgrades  |  ESC: Leave', px + pw / 2, py + ph - 28);
  ctx.fillText('Gold: $' + (game.gold || 0) + '  |  Rep: ' + (game.reputation || 50) + '  |  Day ' + (game.dayCount || 1), px + pw / 2, py + ph - 12);
}

// ── Sitting at desk ──
function drawDeskView(W, H) {
  var pw = Math.min(W * 0.55, 520), ph = Math.min(H * 0.3, 220);
  var px = (W - pw) / 2, py = H * 0.6;
  drawUIPanel(px, py, pw, ph, 'AT YOUR DESK');

  var fs = Math.max(11, Math.min(15, pw * 0.027));
  ctx.textAlign = 'center';

  if (office.waitingForCase) {
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    var dots = '';
    var dotCount = Math.floor((office.waitTimer * 3) % 4);
    for (var d = 0; d < dotCount; d++) dots += '.';
    ctx.fillText('A knock at the door' + dots, px + pw / 2, py + 58);
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = 'italic ' + (fs - 1) + 'px monospace';
    ctx.fillText(office.visitorNPCName + ' is approaching...', px + pw / 2, py + 80);
  } else {
    ctx.fillStyle = PALETTE.uiText;
    ctx.font = fs + 'px monospace';
    ctx.fillText('You sit at your desk. Papers piled high.', px + pw / 2, py + 55);
    ctx.fillText('The lamp casts long shadows across the room.', px + pw / 2, py + 73);
    ctx.fillStyle = PALETTE.uiHighlight;
    ctx.font = 'bold ' + fs + 'px monospace';
    ctx.fillText('[E] Wait for a case    [Q/ESC] Stand up', px + pw / 2, py + ph - 38);
    ctx.fillStyle = PALETTE.uiTextDim;
    ctx.font = (fs - 2) + 'px monospace';
    ctx.fillText('Cases solved: ' + office.completedCases.length + '  |  Active: ' + office.activeCases.length + '  |  Prisoners: ' + office.prisoners.length + '/' + getMaxPrisoners(), px + pw / 2, py + ph - 14);
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
    var catColors = { murder: '#cc3030', robbery: '#ccaa30', missing: '#4488cc', land: '#30aa30', supernatural: '#aa44cc', political: '#cc6600', animal: '#886644' };
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
      ctx.fillText('    Crime: ' + p.crime + '  |  Day ' + p.day + (p.interrogated ? '  |  INTERROGATED' : ''), px + margin, iy + fs * 2 + 3);

      if (isSel) {
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = (fs - 1) + 'px monospace';
        ctx.fillText('    [1] Release (+mercy)  [2] Interrogate (intel)  [3] Execute (fear)', px + margin, iy + fs * 3 + 5);
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
  ctx.fillText('[U] Upgrade Menu  |  [Q/ESC] Close', px + pw / 2, py + ph - 8);
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
