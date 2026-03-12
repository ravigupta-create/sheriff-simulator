'use strict';

// ============================================================
// SHERIFF'S OFFICE SYSTEM
// Loaded after game.js — uses globals: game, ctx, TILE, PALETTE, etc.
// ============================================================

// ── Case Templates ──
var CASE_CATEGORIES = ['Murder', 'Robbery', 'Missing Person', 'Land Dispute', 'Supernatural', 'Political', 'Animal Attack'];

var CASE_TEMPLATES = [
  // MURDER (1-5)
  { name: 'The Poisoned Prospector', cat: 'Murder', diff: 3, desc: 'Old Pete was found dead by his claim. His coffee was laced with arsenic. Three people visited him yesterday.', choices: [
    { text: 'Investigate his business partner', outcome: 'partner', gold: 60, rep: 8, result: 'The partner confessed — Pete had found gold and wouldn\'t share.' },
    { text: 'Question the traveling salesman', outcome: 'salesman', gold: 40, rep: 5, result: 'The salesman sold him the "tonic" but claims innocence. Insufficient evidence.' },
    { text: 'Blame the ex-wife', outcome: 'wrong', gold: 20, rep: -5, result: 'She had an alibi. The real killer got away.' }
  ]},
  { name: 'Blood in the Saloon', cat: 'Murder', diff: 2, desc: 'A stranger was stabbed during a card game last night. The bartender saw everything but won\'t talk.', choices: [
    { text: 'Threaten the bartender', outcome: 'threat', gold: 30, rep: -3, result: 'He talks but resents you. The killer was a sore loser named Red McCoy.' },
    { text: 'Buy the bartender a drink first', outcome: 'friend', gold: 50, rep: 8, result: 'He opens up willingly. Red McCoy is arrested peacefully.' },
    { text: 'Search the crime scene for clues', outcome: 'clues', gold: 45, rep: 6, result: 'You find a monogrammed knife. It belongs to Red McCoy.' }
  ]},
  { name: 'The Hanging Tree', cat: 'Murder', diff: 4, desc: 'A body was found hanging from the old oak tree. It looks like murder staged as suicide — rope burns on the wrists.', choices: [
    { text: 'Track footprints from the scene', outcome: 'track', gold: 80, rep: 10, result: 'Boot prints lead to the banker\'s house. He killed to hide embezzlement.' },
    { text: 'Question the widow', outcome: 'widow', gold: 50, rep: 5, result: 'She reveals her husband had debts. Useful but not conclusive.' },
    { text: 'Rule it a suicide', outcome: 'coverup', gold: 10, rep: -10, result: 'The town is suspicious. Rumors spread about your competence.' }
  ]},
  { name: 'Death at Dawn', cat: 'Murder', diff: 5, desc: 'The schoolteacher was found shot in her home. No witnesses. The whole town loved her.', choices: [
    { text: 'Canvas the neighborhood door-to-door', outcome: 'canvas', gold: 100, rep: 15, result: 'A child saw a man in a black coat. It was the preacher\'s secret — she knew too much about the church funds.' },
    { text: 'Check the gun shop records', outcome: 'records', gold: 70, rep: 10, result: 'Recent ammo purchase matches the caliber. You narrow it down.' },
    { text: 'Set a trap at the funeral', outcome: 'trap', gold: 90, rep: 12, result: 'The killer returns to "pay respects." Your deputies nab him.' }
  ]},
  { name: 'The Duel Gone Wrong', cat: 'Murder', diff: 1, desc: 'Two men dueled at noon. The winner claims it was fair. The loser\'s family says the winner cheated.', choices: [
    { text: 'Examine the body for evidence', outcome: 'examine', gold: 30, rep: 5, result: 'Shot in the back. It wasn\'t a fair duel after all.' },
    { text: 'Side with the winner', outcome: 'side', gold: 40, rep: -3, result: 'Quick resolution but the family holds a grudge.' },
    { text: 'Ban all dueling in town', outcome: 'ban', gold: 20, rep: 8, result: 'Controversial but prevents future bloodshed.' }
  ]},

  // ROBBERY (6-10)
  { name: 'The Bank Job', cat: 'Robbery', diff: 4, desc: 'The bank was robbed at gunpoint. $500 missing. Three masked men on horseback fled north.', choices: [
    { text: 'Form a posse and pursue', outcome: 'posse', gold: 120, rep: 12, result: 'You catch them at their hideout. All money recovered!' },
    { text: 'Set up roadblocks', outcome: 'block', gold: 80, rep: 8, result: 'You catch two of three. Most money recovered.' },
    { text: 'Wait for them to spend the money in town', outcome: 'wait', gold: 60, rep: 3, result: 'One returns in disguise. You nab him but the others escape.' }
  ]},
  { name: 'Missing Shipment', cat: 'Robbery', diff: 2, desc: 'A supply wagon was ambushed on the road. The driver was knocked out. Supplies worth $200 are gone.', choices: [
    { text: 'Follow the wagon tracks', outcome: 'tracks', gold: 50, rep: 7, result: 'Tracks lead to an abandoned mine. Supplies found!' },
    { text: 'Interrogate known thieves', outcome: 'interrogate', gold: 40, rep: 5, result: 'One of them cracks. You recover most supplies.' },
    { text: 'Increase road patrols', outcome: 'patrol', gold: 20, rep: 4, result: 'No immediate recovery but future robberies decrease.' }
  ]},
  { name: 'The Horse Thief', cat: 'Robbery', diff: 1, desc: 'Someone\'s been stealing horses from the stable at night. The stable owner is furious.', choices: [
    { text: 'Stake out the stable tonight', outcome: 'stakeout', gold: 35, rep: 6, result: 'You catch the thief red-handed! It\'s a teenager running away from home.' },
    { text: 'Check for tracks leading out of town', outcome: 'tracks', gold: 30, rep: 5, result: 'Tracks lead to a nearby ranch. The horses are recovered.' },
    { text: 'Lock the stable with a better lock', outcome: 'lock', gold: 15, rep: 2, result: 'Problem solved but the thief is still out there.' }
  ]},
  { name: 'Train Robbery Tip', cat: 'Robbery', diff: 5, desc: 'An informant says a gang plans to rob the noon train tomorrow. You have 24 hours to prepare.', choices: [
    { text: 'Ride the train as a hidden guard', outcome: 'guard', gold: 150, rep: 15, result: 'Ambush the ambushers! The gang is captured and you\'re a hero.' },
    { text: 'Alert the railroad company', outcome: 'alert', gold: 80, rep: 8, result: 'They cancel the train. Safe but the gang escapes.' },
    { text: 'Use the informant to set a trap', outcome: 'trap', gold: 120, rep: 12, result: 'The trap works. Gang leader captured. Informant rewarded.' }
  ]},
  { name: 'The General Store Break-in', cat: 'Robbery', diff: 1, desc: 'The general store was broken into overnight. The shopkeeper lost guns, ammo, and $50 cash.', choices: [
    { text: 'Dust for fingerprints', outcome: 'prints', gold: 30, rep: 5, result: 'Primitive but effective — you match prints to a known thief.' },
    { text: 'Ask around if anyone saw anything', outcome: 'ask', gold: 25, rep: 4, result: 'The hotel owner saw someone suspicious. Lead obtained.' },
    { text: 'Replace the stolen goods from your salary', outcome: 'pay', gold: -30, rep: 6, result: 'The shopkeeper is grateful. Your reputation soars.' }
  ]},

  // MISSING PERSON (11-15)
  { name: 'The Vanishing Bride', cat: 'Missing Person', diff: 3, desc: 'A young woman disappeared the night before her wedding. Her fiancé is frantic.', choices: [
    { text: 'Search her room for clues', outcome: 'room', gold: 50, rep: 8, result: 'A packed bag and a love letter to another man. She ran away willingly.' },
    { text: 'Question the fiancé', outcome: 'fiance', gold: 40, rep: 5, result: 'He\'s genuinely worried. No foul play on his end.' },
    { text: 'Organize a search party', outcome: 'search', gold: 60, rep: 10, result: 'Found her at a neighboring town. She begs you not to tell.' }
  ]},
  { name: 'Lost Child', cat: 'Missing Person', diff: 4, desc: 'A 7-year-old boy wandered into the desert yesterday. His parents are desperate.', choices: [
    { text: 'Ride out immediately with water', outcome: 'ride', gold: 40, rep: 15, result: 'You find him sheltered in a canyon. Dehydrated but alive. Hero of the town.' },
    { text: 'Send your deputies to search', outcome: 'deputies', gold: 30, rep: 8, result: 'They find him after several hours. He\'s scared but okay.' },
    { text: 'Ask the native trackers for help', outcome: 'trackers', gold: 50, rep: 12, result: 'Expert trackers find him quickly. Cultural bridges strengthened.' }
  ]},
  { name: 'The Missing Miner', cat: 'Missing Person', diff: 2, desc: 'A miner hasn\'t been seen in 3 days. His partner says he went to check a new vein alone.', choices: [
    { text: 'Search the mine shaft', outcome: 'mine', gold: 45, rep: 7, result: 'Find him trapped behind a cave-in. He discovered a gold vein!' },
    { text: 'Check if he skipped town with gold', outcome: 'skip', gold: 30, rep: 3, result: 'His horse is still here. He didn\'t leave willingly.' },
    { text: 'Lower supplies into the mine', outcome: 'supplies', gold: 40, rep: 8, result: 'Smart move — he\'s alive deeper in. Rescue organized.' }
  ]},
  { name: 'The Preacher Disappeared', cat: 'Missing Person', diff: 3, desc: 'Father Whitmore hasn\'t been seen since Sunday service. His Bible was left at the pulpit.', choices: [
    { text: 'Check the church records', outcome: 'records', gold: 60, rep: 8, result: 'He discovered embezzlement in the church fund. Someone silenced him.' },
    { text: 'Search the graveyard at night', outcome: 'graveyard', gold: 50, rep: 7, result: 'Found him tied up in a crypt! The banker locked him up.' },
    { text: 'Ask the congregation', outcome: 'congregation', gold: 35, rep: 5, result: 'Several people provide useful sightings.' }
  ]},
  { name: 'Ghost Town Survivors', cat: 'Missing Person', diff: 5, desc: 'Three families who went to settle the abandoned town of Dustwell haven\'t been heard from in 2 weeks.', choices: [
    { text: 'Ride to Dustwell alone', outcome: 'solo', gold: 100, rep: 12, result: 'They\'re trapped by a landslide blocking the only road. You organize rescue.' },
    { text: 'Send a telegraph to the nearest fort', outcome: 'telegraph', gold: 60, rep: 7, result: 'Military sends a patrol. Takes time but families are found safe.' },
    { text: 'Assume they chose to stay', outcome: 'ignore', gold: 0, rep: -10, result: 'Two weeks later, a survivor stumbles into town half-dead. Your reputation suffers.' }
  ]},

  // LAND DISPUTES (16-19)
  { name: 'The Water War', cat: 'Land Dispute', diff: 3, desc: 'Two ranchers are fighting over water rights to the creek. Guns have been drawn.', choices: [
    { text: 'Split the creek access evenly', outcome: 'split', gold: 40, rep: 10, result: 'Fair solution. Both ranchers grudgingly accept.' },
    { text: 'Side with the older claim', outcome: 'old', gold: 60, rep: 5, result: 'Legally sound but the newer rancher is furious.' },
    { text: 'Dig a new well for the town', outcome: 'well', gold: -50, rep: 15, result: 'Costs money but solves the problem permanently. Town loves you.' }
  ]},
  { name: 'The Fence Line', cat: 'Land Dispute', diff: 2, desc: 'A farmer claims his neighbor moved the fence 10 feet into his property.', choices: [
    { text: 'Survey the land yourself', outcome: 'survey', gold: 30, rep: 8, result: 'You confirm the fence was moved. Neighbor ordered to move it back.' },
    { text: 'Mediate a compromise', outcome: 'mediate', gold: 25, rep: 6, result: 'They agree to share the disputed strip as a path.' },
    { text: 'Tell them to handle it themselves', outcome: 'ignore', gold: 0, rep: -5, result: 'It escalates into a fistfight the next day.' }
  ]},
  { name: 'Railroad Coming Through', cat: 'Land Dispute', diff: 4, desc: 'The railroad company wants to buy land from resistant farmers. Money vs. livelihoods.', choices: [
    { text: 'Negotiate a fair price for the farmers', outcome: 'negotiate', gold: 80, rep: 12, result: 'Farmers get double the offer. Railroad gets land. Everyone wins.' },
    { text: 'Side with the railroad (they offered you $100)', outcome: 'railroad', gold: 100, rep: -8, result: 'Farmers are displaced. You\'re richer but the town resents you.' },
    { text: 'Block the railroad', outcome: 'block', gold: 20, rep: 8, result: 'Farmers love you. Railroad threatens legal action.' }
  ]},
  { name: 'Gold Claim Jumpers', cat: 'Land Dispute', diff: 3, desc: 'A miner\'s gold claim was taken over by armed men while he was in town for supplies.', choices: [
    { text: 'Ride out and confront them', outcome: 'confront', gold: 70, rep: 10, result: 'Tense standoff but they back down. Claim restored.' },
    { text: 'File legal proceedings', outcome: 'legal', gold: 40, rep: 5, result: 'Slow but lawful. Claim returned after 2 weeks.' },
    { text: 'Offer to buy the claim yourself', outcome: 'buy', gold: -40, rep: 3, result: 'Expensive but you now own a gold mine!' }
  ]},

  // SUPERNATURAL (20-23)
  { name: 'Ghost of Dead Man\'s Gulch', cat: 'Supernatural', diff: 3, desc: 'Miners report seeing a glowing figure in the gulch at night. Three men refuse to work.', choices: [
    { text: 'Investigate at midnight', outcome: 'investigate', gold: 50, rep: 8, result: 'It\'s phosphorescent fungus on a dead tree. Mystery solved!' },
    { text: 'Set up a ghost trap', outcome: 'trap', gold: 30, rep: 5, result: 'You catch a prankster teenager scaring miners for fun.' },
    { text: 'Declare the gulch cursed', outcome: 'cursed', gold: 10, rep: -3, result: 'Miners leave. Mine productivity drops. Bad call.' }
  ]},
  { name: 'The Cursed Coin', cat: 'Supernatural', diff: 2, desc: 'A Spanish doubloon found in the desert. Everyone who\'s touched it has had terrible luck.', choices: [
    { text: 'Lock it in the evidence safe', outcome: 'lock', gold: 30, rep: 5, result: 'Coincidences stop. The coin is safely stored.' },
    { text: 'Melt it down at the blacksmith', outcome: 'melt', gold: 40, rep: 4, result: 'The gold is worth $40. Bad luck is broken — or was it ever real?' },
    { text: 'Touch it yourself to prove it\'s harmless', outcome: 'touch', gold: 20, rep: 8, result: 'Nothing happens. The town admires your bravery. Then your horse throws a shoe...' }
  ]},
  { name: 'UFO Over the Prairie', cat: 'Supernatural', diff: 4, desc: 'Multiple witnesses report strange lights in the sky and a crashed metal object in the desert.', choices: [
    { text: 'Ride out and investigate', outcome: 'investigate', gold: 60, rep: 10, result: 'It\'s a crashed weather balloon from a government experiment. Or is it?' },
    { text: 'Quarantine the area', outcome: 'quarantine', gold: 30, rep: 6, result: 'Military arrives next day and takes over. They thank you for securing the site.' },
    { text: 'Sell viewing tickets', outcome: 'tickets', gold: 80, rep: -5, result: 'You make good money but the townspeople think you\'re exploiting the situation.' }
  ]},
  { name: 'The Witch of Widow\'s Peak', cat: 'Supernatural', diff: 3, desc: 'An old woman living alone on the hill is accused of witchcraft. A mob is forming.', choices: [
    { text: 'Protect the woman from the mob', outcome: 'protect', gold: 20, rep: 12, result: 'She\'s just an herbalist. The mob disperses. She\'s grateful and gives you healing supplies.' },
    { text: 'Investigate the accusations', outcome: 'investigate', gold: 40, rep: 8, result: 'Her "potions" are herbal remedies. The accuser had a personal grudge.' },
    { text: 'Run her out of town', outcome: 'banish', gold: 30, rep: -8, result: 'She leaves peacefully but the real troublemaker remains.' }
  ]},

  // POLITICAL (24-27)
  { name: 'Election Fraud', cat: 'Political', diff: 4, desc: 'The mayoral election results seem suspicious. Candidate B got more votes than there are registered voters.', choices: [
    { text: 'Demand a recount', outcome: 'recount', gold: 60, rep: 12, result: 'Ballot stuffing confirmed. The real winner is installed.' },
    { text: 'Investigate who stuffed the ballots', outcome: 'investigate', gold: 80, rep: 10, result: 'It was the current mayor trying to keep his seat. Scandal!' },
    { text: 'Accept the results', outcome: 'accept', gold: 50, rep: -8, result: 'The corrupt candidate wins. He owes you a favor though...' }
  ]},
  { name: 'The Mayor\'s Secret', cat: 'Political', diff: 5, desc: 'Anonymous letters claim the mayor is embezzling town funds. The treasury is short $300.', choices: [
    { text: 'Audit the books yourself', outcome: 'audit', gold: 100, rep: 15, result: 'Mayor is guilty. Arrested. You\'re acting mayor temporarily.' },
    { text: 'Confront the mayor privately', outcome: 'confront', gold: 70, rep: 5, result: 'He pays it back quietly. Justice... sort of.' },
    { text: 'Ignore it — the mayor is powerful', outcome: 'ignore', gold: 30, rep: -10, result: 'The embezzlement continues. Town suffers.' }
  ]},
  { name: 'Tax Revolt', cat: 'Political', diff: 3, desc: 'Ranchers are refusing to pay the new territory tax. They\'re organizing an armed protest.', choices: [
    { text: 'Negotiate a lower tax rate', outcome: 'negotiate', gold: 40, rep: 10, result: 'Compromise reached. Ranchers pay half. Governor grumbles.' },
    { text: 'Enforce the tax by force', outcome: 'force', gold: 60, rep: -5, result: 'Taxes collected but ranchers despise you now.' },
    { text: 'Join the protest', outcome: 'join', gold: 20, rep: 8, result: 'The governor recalls the tax. You\'re a folk hero but on thin ice with authorities.' }
  ]},
  { name: 'The Deputy\'s Betrayal', cat: 'Political', diff: 4, desc: 'Your deputy has been leaking patrol routes to outlaws. Crimes happen wherever you\'re NOT.', choices: [
    { text: 'Set a trap with false patrol info', outcome: 'trap', gold: 90, rep: 12, result: 'Trap works! Deputy caught meeting outlaws. Arrested and jailed.' },
    { text: 'Confront the deputy directly', outcome: 'confront', gold: 50, rep: 8, result: 'He confesses and begs for mercy. You decide his fate.' },
    { text: 'Transfer him to another town', outcome: 'transfer', gold: 30, rep: 3, result: 'He becomes someone else\'s problem. Not ideal.' }
  ]},

  // ANIMAL ATTACKS (28-32)
  { name: 'The Lone Wolf', cat: 'Animal Attack', diff: 2, desc: 'A large wolf has been attacking livestock on the outskirts. Ranchers demand action.', choices: [
    { text: 'Hunt the wolf yourself', outcome: 'hunt', gold: 40, rep: 8, result: 'After a tense night, you track and shoot the wolf. Ranchers celebrate.' },
    { text: 'Set traps around the ranches', outcome: 'traps', gold: 30, rep: 6, result: 'Wolf caught in a trap. Problem solved humanely... sort of.' },
    { text: 'Offer a bounty to any hunter', outcome: 'bounty', gold: -20, rep: 5, result: 'A skilled hunter bags the wolf. Quick resolution.' }
  ]},
  { name: 'Rattlesnake Nest', cat: 'Animal Attack', diff: 1, desc: 'A nest of rattlesnakes was found under the schoolhouse. Children are in danger.', choices: [
    { text: 'Carefully relocate the snakes', outcome: 'relocate', gold: 20, rep: 10, result: 'Brave and humane. The snakes are moved to the desert.' },
    { text: 'Smoke them out', outcome: 'smoke', gold: 25, rep: 5, result: 'Effective but sets the schoolhouse porch on fire. Oops.' },
    { text: 'Board up the area and call an expert', outcome: 'expert', gold: 30, rep: 7, result: 'Expert handles it professionally. Safe and sound.' }
  ]},
  { name: 'Bear in Town', cat: 'Animal Attack', diff: 3, desc: 'A grizzly bear wandered into town and is terrorizing the market area. People are fleeing.', choices: [
    { text: 'Lure it out with food', outcome: 'lure', gold: 30, rep: 10, result: 'Trail of fish leads it back to the woods. Genius move.' },
    { text: 'Shoot it', outcome: 'shoot', gold: 40, rep: 5, result: 'Bear is dead. Some townsfolk upset but most relieved.' },
    { text: 'Wrangle it and sell to a circus', outcome: 'circus', gold: 80, rep: 3, result: 'Incredibly dangerous but you pull it off. Big payout!' }
  ]},
  { name: 'Stampede Warning', cat: 'Animal Attack', diff: 4, desc: 'A massive cattle herd is stampeding toward town! You have minutes to act.', choices: [
    { text: 'Ride out and divert the herd', outcome: 'divert', gold: 60, rep: 15, result: 'Heroic ride! You turn the herd just in time. Legend status.' },
    { text: 'Evacuate the main street', outcome: 'evacuate', gold: 30, rep: 10, result: 'Buildings damaged but no one hurt. Good leadership.' },
    { text: 'Build barricades', outcome: 'barricade', gold: 20, rep: 6, result: 'Partially effective. Some damage but could have been worse.' }
  ]},
  { name: 'The Scorpion Plague', cat: 'Animal Attack', diff: 2, desc: 'Scorpions are infesting the hotel. Guests are getting stung. The owner begs for help.', choices: [
    { text: 'Organize a thorough cleaning', outcome: 'clean', gold: 25, rep: 6, result: 'Hotel cleared. Owner gives you free room for life.' },
    { text: 'Burn cedar smoke to drive them out', outcome: 'smoke', gold: 30, rep: 5, result: 'Old trick works. Scorpions flee.' },
    { text: 'Close the hotel until it\'s handled', outcome: 'close', gold: 15, rep: 4, result: 'Safe but the owner loses business.' }
  ]}
];

// ── Office State ──
var officeState = {
  isInOffice: false,
  sittingAtDesk: false,
  caseTimer: 0,
  caseInterval: 300, // frames between cases
  currentCase: null,
  completedCases: [],
  activeCases: [],
  upgradeLevel: 0,
  typewriterText: '',
  typewriterTarget: '',
  typewriterIndex: 0,
  typewriterTimer: 0,
  showJail: false,
  caseResult: null,
  resultTimer: 0
};

// ── Typewriter Effect ──
function tickTypewriter() {
  if (officeState.typewriterIndex < officeState.typewriterTarget.length) {
    officeState.typewriterTimer++;
    if (officeState.typewriterTimer % 2 === 0) {
      officeState.typewriterText += officeState.typewriterTarget[officeState.typewriterIndex];
      officeState.typewriterIndex++;
    }
  }
}

function startTypewriter(text) {
  officeState.typewriterText = '';
  officeState.typewriterTarget = text;
  officeState.typewriterIndex = 0;
  officeState.typewriterTimer = 0;
}

// ── Enter/Exit Office ──
function enterOffice() {
  officeState.isInOffice = true;
  officeState.sittingAtDesk = false;
  officeState.showJail = false;
  officeState.currentCase = null;
  officeState.caseResult = null;
  game.state = 'office';
  document.getElementById('office-overlay').classList.remove('hidden');
  renderOfficeInterior();
}

function exitOffice() {
  officeState.isInOffice = false;
  officeState.sittingAtDesk = false;
  officeState.currentCase = null;
  officeState.caseResult = null;
  game.state = 'playing';
  document.getElementById('office-overlay').classList.add('hidden');
  document.getElementById('case-panel').classList.add('hidden');
  document.getElementById('jail-panel').classList.add('hidden');
}

// ── Render Office Interior ──
function renderOfficeInterior() {
  var interior = document.getElementById('office-interior');
  var html = '<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;">';

  // Desk
  html += '<div style="text-align:center;cursor:pointer;" onclick="sitAtDesk()">';
  html += '<div style="width:80px;height:60px;background:#6b4226;border:2px solid #4a2e1a;display:flex;align-items:center;justify-content:center;font-size:24px;">📋</div>';
  html += '<div style="color:#e8d5a3;font-size:11px;margin-top:4px;">Sit at Desk</div>';
  html += '</div>';

  // Case Board
  html += '<div style="text-align:center;cursor:pointer;" onclick="showCaseBoard()">';
  html += '<div style="width:80px;height:60px;background:#4a2e1a;border:2px solid #2a1a0a;display:flex;align-items:center;justify-content:center;font-size:24px;">📌</div>';
  html += '<div style="color:#e8d5a3;font-size:11px;margin-top:4px;">Case Board (' + officeState.completedCases.length + ')</div>';
  html += '</div>';

  // Jail
  var prisonerCount = (game.prisoners || []).length;
  html += '<div style="text-align:center;cursor:pointer;" onclick="showJailPanel()">';
  html += '<div style="width:80px;height:60px;background:#5a5248;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:24px;">⛓️</div>';
  html += '<div style="color:#e8d5a3;font-size:11px;margin-top:4px;">Jail (' + prisonerCount + ' prisoners)</div>';
  html += '</div>';

  // Gun Rack
  html += '<div style="text-align:center;cursor:pointer;" onclick="checkGunRack()">';
  html += '<div style="width:80px;height:60px;background:#3a2a14;border:2px solid #2a1a0a;display:flex;align-items:center;justify-content:center;font-size:24px;">🔫</div>';
  html += '<div style="color:#e8d5a3;font-size:11px;margin-top:4px;">Gun Rack</div>';
  html += '</div>';

  // Upgrade Office
  var upgradeCost = (officeState.upgradeLevel + 1) * 100;
  html += '<div style="text-align:center;cursor:pointer;" onclick="upgradeOffice()">';
  html += '<div style="width:80px;height:60px;background:#2a2a08;border:2px solid #5a5a18;display:flex;align-items:center;justify-content:center;font-size:24px;">🔨</div>';
  html += '<div style="color:#ffd700;font-size:11px;margin-top:4px;">Upgrade ($' + upgradeCost + ')</div>';
  html += '</div>';

  html += '</div>';

  // Status bar
  html += '<div style="margin-top:15px;text-align:center;color:#a09070;font-size:11px;">';
  html += 'Office Level: ' + (officeState.upgradeLevel + 1) + ' | Cases Solved: ' + officeState.completedCases.length;
  html += ' | ' + (officeState.sittingAtDesk ? 'Sitting at desk — waiting for visitors...' : 'Standing in the office');
  html += '</div>';

  interior.innerHTML = html;
}

// ── Sit at Desk ──
function sitAtDesk() {
  officeState.sittingAtDesk = true;
  officeState.caseTimer = rand(60, 180);
  renderOfficeInterior();
  showNotification('You sit at your desk. Visitors will arrive with cases...');
}

// ── Generate a New Case ──
function generateCase() {
  var pool = CASE_TEMPLATES.filter(function(c) {
    return officeState.completedCases.indexOf(c.name) === -1;
  });
  if (pool.length === 0) pool = CASE_TEMPLATES; // Replay if all done
  var template = pool[rand(0, pool.length - 1)];

  officeState.currentCase = {
    name: template.name,
    cat: template.cat,
    diff: template.diff,
    desc: template.desc,
    choices: template.choices
  };

  startTypewriter(template.desc);

  // Show case panel
  document.getElementById('case-title').textContent = '📜 ' + template.name + ' [' + template.cat + ' - Difficulty ' + template.diff + '/5]';
  document.getElementById('case-panel').classList.remove('hidden');

  var choicesEl = document.getElementById('case-choices');
  choicesEl.innerHTML = '';

  for (var i = 0; i < template.choices.length; i++) {
    var choice = template.choices[i];
    var btn = document.createElement('button');
    btn.textContent = (i + 1) + '. ' + choice.text;
    btn.onclick = (function(ch) { return function() { resolveCase(ch); }; })(choice);
    choicesEl.appendChild(btn);
  }

  if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
}

// ── Resolve a Case ──
function resolveCase(choice) {
  var c = officeState.currentCase;
  if (!c) return;

  var goldChange = choice.gold || 0;
  var repChange = choice.rep || 0;

  game.gold += goldChange;
  if (goldChange > 0) game.totalGoldEarned += goldChange;
  game.reputation = clamp(game.reputation + repChange, 0, REPUTATION_MAX);

  var resultText = choice.result;
  resultText += '\n\n';
  if (goldChange > 0) resultText += '+$' + goldChange + ' ';
  if (goldChange < 0) resultText += '-$' + Math.abs(goldChange) + ' ';
  if (repChange > 0) resultText += '+' + repChange + ' Rep';
  if (repChange < 0) resultText += repChange + ' Rep';

  officeState.completedCases.push(c.name);
  addJournalEntry('Case closed: ' + c.name + ' (' + (repChange >= 0 ? 'Good' : 'Poor') + ' outcome)');

  // Show result
  officeState.caseResult = resultText;
  officeState.resultTimer = 300;

  document.getElementById('case-text').textContent = resultText;
  var choicesEl = document.getElementById('case-choices');
  choicesEl.innerHTML = '<button onclick="dismissCaseResult()">Continue</button>';

  if (repChange >= 0) {
    if (typeof audio !== 'undefined' && audio.playVictory) audio.playVictory();
  } else {
    if (typeof audio !== 'undefined' && audio.playBad) audio.playBad();
  }

  showNotification('Case closed: ' + c.name);
}

function dismissCaseResult() {
  officeState.currentCase = null;
  officeState.caseResult = null;
  officeState.caseTimer = rand(120, 300);
  document.getElementById('case-panel').classList.add('hidden');
  renderOfficeInterior();
}

// ── Case Board ──
function showCaseBoard() {
  var panel = document.getElementById('case-panel');
  var title = document.getElementById('case-title');
  var text = document.getElementById('case-text');
  var choices = document.getElementById('case-choices');

  title.textContent = '📌 CASE BOARD — ' + officeState.completedCases.length + ' Cases Solved';

  if (officeState.completedCases.length === 0) {
    text.textContent = 'No cases completed yet. Sit at your desk to receive visitors.';
  } else {
    var list = officeState.completedCases.slice(-10).reverse();
    text.textContent = list.map(function(n, i) { return (i + 1) + '. ' + n; }).join('\n');
  }

  choices.innerHTML = '<button onclick="dismissCaseResult()">Close</button>';
  panel.classList.remove('hidden');
}

// ── Gun Rack ──
function checkGunRack() {
  var weapons = ['Revolver'];
  if (game.hasShotgun) weapons.push('Shotgun');
  if (game.hasRifle) weapons.push('Rifle');

  showNotification('Gun Rack: ' + weapons.join(', ') + ' | Ammo: ' + game.ammo);
  if (game.ammo < 12) {
    game.ammo += 6;
    showNotification('Grabbed some extra ammo from the rack! +6');
  }
}

// ── Upgrade Office ──
function upgradeOffice() {
  var cost = (officeState.upgradeLevel + 1) * 100;
  if (game.gold >= cost) {
    game.gold -= cost;
    officeState.upgradeLevel++;
    officeState.caseInterval = Math.max(60, officeState.caseInterval - 30);
    showNotification('Office upgraded to level ' + (officeState.upgradeLevel + 1) + '! Cases come faster.');
    addJournalEntry('Upgraded the Sheriff\'s Office to level ' + (officeState.upgradeLevel + 1));
    if (typeof audio !== 'undefined' && audio.playDing) audio.playDing();
    renderOfficeInterior();
  } else {
    showNotification('Need $' + cost + ' to upgrade. You have $' + game.gold);
  }
}

// ── Jail Panel ──
function showJailPanel() {
  officeState.showJail = true;
  var panel = document.getElementById('jail-panel');
  var inmates = document.getElementById('jail-inmates');
  panel.classList.remove('hidden');

  if (!game.prisoners || game.prisoners.length === 0) {
    inmates.innerHTML = '<div style="color:#888;font-size:12px;">No prisoners. Arrest outlaws to fill the cells.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < game.prisoners.length; i++) {
    var p = game.prisoners[i];
    html += '<div class="inmate-row">';
    html += '<span class="inmate-name">' + (p.name || 'Unknown') + ' — ' + (p.crime || 'Outlaw') + '</span>';
    html += '<div class="inmate-actions">';
    html += '<button onclick="interrogatePrisoner(' + i + ')">Interrogate</button>';
    html += '<button onclick="releasePrisoner(' + i + ')">Release</button>';
    html += '</div></div>';
  }
  inmates.innerHTML = html;
}

function interrogatePrisoner(idx) {
  var p = game.prisoners[idx];
  if (!p) return;
  var tips = [
    p.name + ' says: "The gang hideout is north of town."',
    p.name + ' says: "There\'s gold buried near the old well."',
    p.name + ' says: "The mayor is in on it, I tell you!"',
    p.name + ' says: "I ain\'t talking. Do your worst."',
    p.name + ' says: "Let me go and I\'ll give you $50."',
    p.name + ' says: "More are coming. You can\'t stop \'em all."',
    p.name + ' says: "Check under the saloon floorboards."',
    p.name + ' reveals the location of a hidden stash! +$30'
  ];
  var tip = tips[rand(0, tips.length - 1)];
  showNotification(tip);
  if (tip.indexOf('+$30') !== -1) {
    game.gold += 30;
    game.totalGoldEarned += 30;
  }
  addJournalEntry('Interrogated prisoner: ' + p.name);
}

function releasePrisoner(idx) {
  var p = game.prisoners.splice(idx, 1)[0];
  if (!p) return;
  game.reputation = clamp(game.reputation + 2, 0, REPUTATION_MAX);
  showNotification('Released ' + p.name + '. +2 Rep (mercy)');
  addJournalEntry('Released prisoner: ' + p.name);
  showJailPanel();
}

// ── Main Update (called from game loop) ──
function updateOffice(dt) {
  // Check if player is near sheriff office and presses E
  if (game.state === 'playing' && !officeState.isInOffice) {
    var p = game.player;
    for (var i = 0; i < game.buildings.length; i++) {
      var b = game.buildings[i];
      if (b.type === BUILDING_TYPES.SHERIFF) {
        var bx = (b.x + b.w / 2) * TILE;
        var by = (b.y + b.h) * TILE;
        var d = Math.hypot(p.x - bx, p.y - by);
        if (d < TILE * 2.5 && typeof keysJustPressed !== 'undefined' && keysJustPressed['KeyE']) {
          keysJustPressed['KeyE'] = false;
          enterOffice();
          return;
        }
      }
    }
    return;
  }

  // In office — handle cases
  if (game.state === 'office') {
    if (consumeKey('Escape')) {
      exitOffice();
      return;
    }

    // Typewriter tick
    tickTypewriter();
    if (officeState.typewriterIndex < officeState.typewriterTarget.length) {
      var caseText = document.getElementById('case-text');
      if (caseText && !officeState.caseResult) {
        caseText.textContent = officeState.typewriterText + '█';
      }
    }

    // Case generation while sitting
    if (officeState.sittingAtDesk && !officeState.currentCase && !officeState.caseResult) {
      officeState.caseTimer--;
      if (officeState.caseTimer <= 0) {
        generateCase();
      }
    }

    // Number key shortcuts for case choices
    if (officeState.currentCase && !officeState.caseResult) {
      var choices = officeState.currentCase.choices;
      if (consumeKey('Digit1') && choices.length >= 1) resolveCase(choices[0]);
      else if (consumeKey('Digit2') && choices.length >= 2) resolveCase(choices[1]);
      else if (consumeKey('Digit3') && choices.length >= 3) resolveCase(choices[2]);
    }

    // Result dismiss
    if (officeState.caseResult) {
      if (consumeKey('Space') || consumeKey('Enter')) {
        dismissCaseResult();
      }
    }
  }
}

// ── Render Overlay (called from game loop) ──
function renderOfficeOverlay() {
  // Nothing extra to render on the canvas for office — it's all HTML overlay
  // But we can add a subtle vignette when in office
  if (game.state === 'office') {
    var w = gameCanvas.width;
    var h = gameCanvas.height;
    // Dark overlay behind HTML
    ctx.fillStyle = 'rgba(10, 6, 2, 0.3)';
    ctx.fillRect(0, 0, w, h);
  }
}

// ── Hook arrested NPCs into prisoners ──
var _origHandleDialogChoice = typeof handleDialogChoice === 'function' ? handleDialogChoice : null;
(function() {
  // Patch: when an outlaw is arrested, add to prisoners
  var origArrests = game.outlawsArrested || 0;
  setInterval(function() {
    if (game.outlawsArrested > origArrests) {
      origArrests = game.outlawsArrested;
      // Add most recent arrested NPC to prisoners
      for (var i = game.npcs.length - 1; i >= 0; i--) {
        var npc = game.npcs[i];
        if (npc.state === 'arrested' && !npc._jailed) {
          npc._jailed = true;
          if (!game.prisoners) game.prisoners = [];
          game.prisoners.push({
            name: npc.name,
            crime: npc.type === 'bounty' ? 'Wanted Fugitive' : 'Outlaw',
            arrestDay: game.dayCount
          });
          break;
        }
      }
    }
  }, 1000);
})();

// ── Office Exit Button ──
var officeExitBtn = document.getElementById('office-exit');
if (officeExitBtn) {
  officeExitBtn.addEventListener('click', function() {
    exitOffice();
  });
}
