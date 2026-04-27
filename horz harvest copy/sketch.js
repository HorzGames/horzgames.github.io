// --- Input Priority Utility ---
// Returns true if a physical keyboard is likely present and should be prioritized over touch
function isKeyboardPreferred() {
  // If any key is pressed, or a real keyboard event is detected, prefer keyboard
  // Otherwise, if only touch events are present, prefer touch
  // This can be improved with heuristics, but this is a simple version
  // On desktop, most browsers report 'any' keyboard
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) return true;
  if (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer:fine)').matches) return false;
  return true; // fallback: default to keyboard
}

// Usage: In your input handling, check isKeyboardPreferred() to decide which input to prioritize

let staler; 
let apples = [], logs = [];
let score = 0, gameOver = false;
let magicActive = false, cursedActive = false, qBuffActive = false;
let magicTimer = 0;
let alertMessage = "", alertColor, alertTimer = 0;
let levelPopup = { active: false, start: 0, duration: 2000, title: '', subtitle: '', horse: 1 };
let screenShake = 0;
let CyberHorseChanged = false; // Set to false since we're starting from default horse
let VolcanicHorseChanged = false; // Reset to allow volcanic transition
let AquaticHorseChanged = false; // New aquatic stage flag
let HolyHorseChanged = false;
let horseType = 1; // Force default horse since score is 0
let stickyActive = false, stickyTimer = 0;
let superCursedActive = false, superCursedTimer = 0; // For invisible logs
let concreteActive = false, concreteTimer = 0; // For concrete apple effect
let logImmunity = true; // For blessed apple protection
let pearlProtection = 0; // For pearl apple - 3 rounds of protection
let vortexes = []; // Hell vortexes for holy stage
let vortexWarnings = []; // Warning indicators before vortex spawns
let lavaStreams = []; // Lava streams for volcanic stage
let lavaStreamChance = 120; // Chance to spawn lava stream every 120 frames
let lavaWarnings = []; // Warning indicators before lava stream spawns
let fireTrails = []; // Fire trails left behind by lava streams
let smokeCloud = false; // Ash apple smoke cloud effect
let smokeTimer = 0; // Timer for smoke cloud duration
let smokeParticles = []; // Smoke particles for ash effect
let vortexSize = 1; // Size of the vortex for scaling 
let vortexChance = 0.2; // Chance to spawn a vortex (20%)
let whirlpools = []; // Whirlpools for aquatic stage
let whirlpoolSpawnTimer = 0; // Timer for whirlpool spawning
let multiplier = 1 ; // Default score multiplier
let nutcrackerActive = false; // Nutcracker effect active
let nutcrackerSpawned = false; // Track if nutcracker has been spawned this game
let isAllergic = true; // Track if player is allergic to nuts
let stackOverflowTriggered = false; // Track if stack overflow easter egg has been triggered
let error404Triggered = false; // Track if 404 error easter egg has been triggered
let retroModeActive = false; // Jerry Lawson tribute retro mode
let retroModeTimer = 0; // Timer for retro mode duration
let fairchildSpawned = false; // Track if Fairchild apple has spawned this game
let worldRecord = 44581; // Global world record 
let showAlmanac = false; // Track if almanac is open
let almanacScroll = 0; // Track scroll position in almanac
let roboGrabActive = false; // Track if robo grab animation is active
let roboGrabTimer = 0; // Timer for robo grab animation
let roboGrabbedApples = []; // Store positions of apples being grabbed
let roboGrabStartX = 0; // Player X position when animation started
let roboGrabStartY = 0; // Player Y position when animation started
let frenzyActive = false; // Frenzy effect active
let frenzyTimer = 0; // Timer for frenzy duration
let riskyRoadActive = false; // Risky road effect active
let riskyRoadTimer = 0; // Timer for risky road duration
let fatActive = false; // Fat effect active
let fatTimer = 0; // Timer for fat duration
let originalSize = 40; // Store original player size
let secretStageActive = false; // Track if player is in a secret stage
let secretStageType = ''; // Type of secret stage (meadow, cyberspace, apocalypse, deepsea, demonic)
let secretStageTimer = 0; // Timer for secret stage duration
let secretStageStartTime = 0; // When the secret stage started
let originalScore = 0; // Store score before entering secret stage for penalty
let butterflies = []; // Butterflies for Endless Meadow
let jellyfish = []; // Jellyfish for Deep Sea
let seaMines = []; // Sea mines for Deep Sea
let bubbles = []; // Rising bubbles for Deep Sea
let debris = []; // Falling debris for Apocalypse
let toxicClouds = []; // Toxic clouds for Apocalypse
let dustParticles = []; // Dust particles for Apocalypse
let woozyActive = false; // Woozy screen wobble effect
let woozyTimer = 0; // Timer for woozy duration
let shelterActive = false; // Player is inside fallout shelter
let shelterX = 0; // Shelter X position
let shelterY = 0; // Shelter Y position
let shelterTimer = 0; // Shelter duration timer
let laserGrids = []; // Laser grids for Cyberspace
let dataPackets = []; // Fast-moving data packets for Cyberspace
let scanLines = []; // Scan line effects for Cyberspace
let glitchEffect = false; // Glitch visual effect
let glitchTimer = 0; // Timer for glitch duration
let firewallActive = false; // Firewall shield protection
let firewallTimer = 0; // Firewall duration timer
let demonMissiles = []; // Homing missiles for Demonic stage
let flameWaves = []; // Vertical flame walls for Demonic stage
let bloodOverlay = false; // Blood screen effect
let bloodOverlayTimer = 0; // Blood overlay duration
let satanActive = false; // Satan boss hazard
let satanY = 0; // Satan's Y position
let satanSpeed = 0; // Satan's descent speed
let hellFog = []; // Blood fog particles for Demonic stage
let haveShownPrintCert = false; // Prevent multiple print prompts
let haveShownPrintRoyalCert = false; // Prevent multiple print prompts for Royal Reward
let pickupSound = null; // Sound played when picking up an apple
let magicSound = null; // Sound for magic apple
let qSound = null; // Sound for Queztelkonatol (Q) apple
let portalSound = null; // Sound for portal woosh
let santaSound = null; // Sound for santa apple
let cursedSound = null; // Sound for cursed apples
let magmaSound = null; // Sound for magma-related apples
let tickySound = null; // Sound for sticky apple
let lastCustomSoundPlayed = false; // Tracks whether the last apple effect played a custom sound
let almanacOpenSound = null; // Sound when opening the almanac
let almanacCloseSound = null; // Sound when closing the almanac
let stoneSound = null; // Sound for stone apple
let robotSound = null; // Sound for robo/data/firewall apples
let glitchSound = null; // Sound for glitch and cursed-robo apples
let oceanSound = null; // Ambient ocean waves for Deep Sea stage
let meadowSound = null; // Ambient meadow soundtrack for Meadow secret stage
let demonicSound = null; // Ambient hell soundtrack for Demonic secret stage
let apocalypseSound = null; // Ambient apocalypse soundtrack
let cyberspaceSound = null; // Ambient cyberspace soundtrack

const LAVA_STREAM_CHANCE_MULTIPLIER = 10; 
const SPEEDBOOST = 1; 
const PLAYER_SIZE = 40;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const MAGIC_DURATION = 10000;
const Q_DURATION = 120000;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  textFont('Courier New');
  alertColor = color('blue');
  if(day() === 15 && month() === 2) {
    multiplier *= 2; // Double points on Creator's Birthday
  }
  if (day() === 1 && month() === 1) {
    score = year() // on Nex years day, start with points equal to the year
  }
alert ('Welcome to the Horz Harvest game! Use the left and right arrow keys to move your horse. Collect apples and avoid logs. Good luck! Questelkonatol apples are very rare but they give a lot of points! legend says that they grant you special powers. There are many other apples, too! '); // Added alert for player instructions
  staler = createPlayer();
}

function preload() {
  // Load pickup sound from Game sounds folder
  if (typeof loadSound === 'function') {
    soundFormats('mp3', 'wav');
    try {
      pickupSound = loadSound('Game sounds(V 1.8.1)/coin-collect-retro-8-bit-sound-effect-145251.mp3');
      // Load magic apple sound if present
      try {
        magicSound = loadSound('Game sounds(V 1.8.1)/Magic apple.mp3');
      } catch (e) {
        // Non-fatal if magic sound missing
        magicSound = null;
      }
      // Load Q apple sound (Queztelkonatol) if present
      try {
        qSound = loadSound('Game sounds(V 1.8.1)/Q apple.mp3');
      } catch (e) {
        qSound = null; // Non-fatal fallback
      }
      // Load portal woosh sound for portal entrances
      try {
        portalSound = loadSound('Game sounds(V 1.8.1)/Portal Woosh.mp3');
      } catch (e) {
        portalSound = null;
      }
      // Load Santa sound if present
      try {
        santaSound = loadSound('Game sounds(V 1.8.1)/santa.mp3');
      } catch (e) {
        santaSound = null;
      }
      // Load cursed sound for cursed-style apples
      try {
        cursedSound = loadSound('Game sounds(V 1.8.1)/cursed .mp3');
      } catch (e) {
        cursedSound = null;
      }
      // Load magma sound for magma-related apples
      try {
        magmaSound = loadSound('Game sounds(V 1.8.1)/magma sound.wav');
      } catch (e) {
        magmaSound = null;
      }
      // Load sticky apple sound if present
      try {
        tickySound = loadSound('Game sounds(V 1.8.1)/sticky.mp3');
      } catch (e) {
        tickySound = null;
      }
      // Load stone apple sound if present
      try {
        stoneSound = loadSound('Game sounds(V 1.8.1)/stone apple.mp3');
      } catch (e) {
        stoneSound = null;
      }
      // Load robot sound for robo/data/firewall apples
      try {
        robotSound = loadSound('Game sounds(V 1.8.1)/robot.mp3');
      } catch (e) {
        robotSound = null;
      }
      // Load glitch sound for glitch and cursed-robo
      try {
        glitchSound = loadSound('Game sounds(V 1.8.1)/glitch-sfx-312910.mp3');
      } catch (e) {
        glitchSound = null;
      }
      // Load ocean ambient for deep sea stage
      try {
        oceanSound = loadSound('Game sounds(V 1.8.1)/ocean-waves-01-27176.mp3');
      } catch (e) {
        oceanSound = null;
      }
      // Load demonic ambient soundtrack if present
      try {
        demonicSound = loadSound('Game sounds(V 1.8.1)/lightning-tiger-god-loop-50249.mp3');
      } catch (e) {
        demonicSound = null;
      }
      // Load meadow ambient soundtrack if present
      try {
        meadowSound = loadSound('Game sounds(V 1.8.1)/meadow-field-summer-insects-birds-notl-190716-57929.mp3');
      } catch (e) {
        meadowSound = null;
      }
      // Load almanac open/close sounds if present
      try {
        almanacOpenSound = loadSound('Game sounds(V 1.8.1)/almanac-opening.mp3');
      } catch (e) {
        almanacOpenSound = null;
      }
      try {
        almanacCloseSound = loadSound('Game sounds(V 1.8.1)/almanac-closing.mp3');
      } catch (e) {
        almanacCloseSound = null;
      }
    } catch (e) {
      console.warn('Could not load pickup sound:', e);
      pickupSound = null;
    }
  }
}

function createPlayer() {
  return {
    x: width / 2,
    y: height - 30,
    size: PLAYER_SIZE
  };
}

function drawAerialHorse(x, y, s = 1) {
  push();
  translate(x, y);
  // Apply fat effect scaling (wider but same height)
  if (fatActive) {
    scale(s * 2.5, s); // Width 2.5x, height normal (obese)
  } else {
    scale(s);
  }
  noStroke();

  // Colors
 // let bodyColor = color(160, 82, 45); // Saddle brown
  //let maneTailColor = color('rgb(148,44,0)'); // Dark mane
  
  
  if (horseType == 1) { // DEFAULT
     bodyColor = color(160, 82, 45); // Saddle brown
   maneTailColor = color('rgb(71, 21, 0)'); // Dark mane
  }
  
  if (horseType == 2) { //  CYBER-HORSE
     bodyColor = color('rgb(173,173,173)'); // robo-gray
   maneTailColor = color('rgb(0,255,255)'); //bright-blue mane-tail color
  }
  
  if (horseType == 3) { //  VOLCANIC HORSE
     bodyColor = color('rgb(105,25,25)'); // dark volcanic red
   maneTailColor = color('rgb(255,140,0)'); // molten orange mane
  }
    
  if (horseType == 4) { //  AQUATIC HORSE
     bodyColor = color('rgb(0,100,150)'); // ocean blue
   maneTailColor = color('rgb(100,200,255)'); // light blue mane
  }
    
  if (horseType == 5) { //  HOLY HORSE
     bodyColor = color('rgb(173,75,4)'); // beautiful chestnut 
   maneTailColor = color('rgb(0,0,0)'); //black mane
  }

  // BODY
  fill(bodyColor);
  ellipse(0, 0, 60, 120); // Torso from top

  // HEAD + NECK
  ellipse(0, -70, 25, 35); // Neck from top
  ellipse(0, -95, 20, 25); // Head (no eyes, it's top-down!)

  //HALO 😇 (HOLY HORSE ONLY)
  if (horseType == 5) {
     noFill();                    // no fill inside the circle
  stroke(255, 223, 0, 200);   // gold-yellow stroke with some transparency
  strokeWeight(6);            // a good visible thickness for halo
  circle(0, -95, 40);
    noStroke()
    fill (0)
  }
  
  // MANE (down the neck)
  fill(maneTailColor);
  ellipse(sin (frameCount *0.5)*3, -70, 8, 30);

  // TAIL
  fill(maneTailColor);
  ellipse(sin (frameCount *0.5) *2, 75, sin (frameCount *0.5)*3 + 10, 40 +sin (frameCount *0.5)*2); // Tail behind body

  // LEGS (top of them only, no hooves from below!)
  fill(bodyColor);
  ellipse(-15, 45, 10, 25); // Front left
  ellipse(15, 45, 10, 25);  // Front right
  ellipse(-15, -10, 10, 25); // Back left
  ellipse(15, -10, 10, 25);  // Back right

  pop();
}

function draw() {
  if (showAlmanac) {
    drawAppleAlmanac();
    return; // Don't draw the game when almanac is open
  }
  
  if (gameOver) return drawGameOverScreen();
 if(day() === 15 && month() === 2) {
    multiplier = 2; // Double points on Creator's Birthday
  }
  drawBattlefield();
  push();
  
  // Woozy screen wobble effect from toxic clouds
  if (woozyActive) {
    translate(sin(frameCount * 0.1) * 8, 0); // Slow wobble
  }
  
  if (screenShake > 0) {
    translate(random(-10, 10), random(-10, 10)); // Adjusted for more noticeable shake
    screenShake--;
  }
  
  // Update lava stream spawn rate for volcanic stage
  if (horseType === 3 && score >= 2000) {
    lavaStreamChance = 0.000000000000000000001//max(1, 120 - (sqrt(score - 2000) * LAVA_STREAM_CHANCE_MULTIPLIER)); // increase chance as score increases, minimum 30 frames
  }

  if (score >= 750 && score < 2000 && CyberHorseChanged == false) { // Stage 2: Cyber Horse (750-1999)
    horseType = 2;
    showLevelPopup('CYBER-HORSE', 'The cyber horse increases the chance of spawning platinum apples. however the cyber horse also adds the chance of spawning bombs!', 2);
    staler.size = 40;
    CyberHorseChanged = true; // Prevents multiple alerts
  }
  if (score >= 2000 && score < 3500 && VolcanicHorseChanged == false) { // Stage 3: Volcanic Horse (2000-3499)
    horseType = 3;
    showLevelPopup('VOLCANIC HORSE', 'The volcanic horse increases the spawn rate of the obsidian apple, but faces molten hazards!', 3);
    staler.size = 40;
    VolcanicHorseChanged = true; // Prevents multiple alerts
  }
  if (score >= 3500 && score < 5000 && AquaticHorseChanged == false) { // Stage 4: Aquatic Horse (3500-4999)
    horseType = 4;
    showLevelPopup('AQUATIC HORSE', 'The aquatic horse navigates treacherous waters with deadly whirlpools!', 4);
    staler.size = 40;
    AquaticHorseChanged = true; // Prevents multiple alerts
  }
  if (score >= 5000 && HolyHorseChanged == false) { // Stage 5: Holy Horse (5000+)
    horseType = 5;
    showLevelPopup('HOLY HORSE', 'The holy horse has the default catch area however it also increases abundancy of the queztelkonatol apple', 5);
    staler.size = 40;
    HolyHorseChanged = true; // Prevents multiple alerts
  }
  
  // Stack Overflow Easter Egg
  if (score === 64 && !stackOverflowTriggered) {
    stackOverflowTriggered = true;
    score = 128;
    
    alert("STACK OVERFLOW!");
   
  }
  
  // 404 Error Easter Egg
  if (score === 404 && !error404Triggered) {
    error404Triggered = true;
    showAlert("ERROR: POINTS NOT FOUND", color(255, 0, 0));
    gameOver = true;
  }
  
  // World Record Check
  if (score > worldRecord) {
    worldRecord = score;
    showAlert("NEW WORLD RECORD! " + worldRecord, color(255, 215, 0));
  }

  // Adjust collection-related sound volumes during secret stages
  // Makes pickup/magic/Q/Santa/Cursed sounds quieter when in any secret stage
  let collectionTargetVol = secretStageActive ? 0.25 : 1.0;
  const setVolSafe = (s) => {
    if (typeof s !== 'undefined' && s && typeof s.setVolume === 'function') {
      try { s.setVolume(collectionTargetVol); } catch (e) { }
    }
  };
  setVolSafe(pickupSound);
  setVolSafe(magicSound);
  setVolSafe(qSound);
  setVolSafe(santaSound);
  setVolSafe(cursedSound);
  setVolSafe(tickySound);
  setVolSafe(stoneSound);
  setVolSafe(robotSound);
  setVolSafe(glitchSound);
  setVolSafe(oceanSound);
  setVolSafe(meadowSound);
  setVolSafe(demonicSound);
  setVolSafe(almanacOpenSound);
  setVolSafe(almanacCloseSound);

  handleInput();
  spawnApples();
  spawnLogs();
  spawnLavaStreams(); // Lava streams for volcanic stage
  spawnWhirlpools(); // Whirlpools for aquatic stage
  spawnVortexes(); // Hell vortexes for holy stage
  spawnNuts(); // Spawn nuts if nutcracker effect is active

  updateApples();
  updateLogs();
  updateLavaStreams(); // Update lava stream warnings and active streams
  updateWhirlpools(); // Update whirlpools for aquatic stage
  updateVortexes(); // Update vortex warnings and active vortexes
  updateEffects();

  drawPlayer();
  drawDemonicEffects(); // Draw Demonic stage effects AFTER updates
  drawSmokeCloud(); // Draw smoke cloud effect from ash apple
  drawRoboGrabAnimation(); // Draw robo grab animation
  
  // Retro Mode Visual Effects
  if (retroModeActive) {
    drawRetroEffects();
  }
  
  drawScore();
  drawAlert();
  drawLevelPopup();
  pop();
}


  function drawBattlefield() {
 background(
  secretStageActive && secretStageType === "meadow"
    ? color(34, 100, 34) // Rich, lush, darker green for Endless Meadow
    : (secretStageActive && secretStageType === "deepsea"
      ? color(10, 40, 80) // Deep dark blue for Deep Sea
      : (secretStageActive && secretStageType === "apocalypse"
        ? color(80, 40, 20) // Apocalyptic red-orange sky
        : (secretStageActive && secretStageType === "cyberspace"
          ? color(5, 5, 25) // Deep dark blue-black for Cyberspace
          : (secretStageActive && secretStageType === "demonic"
            ? color(20, 5, 5) // Blood-soaked darkness for Hell
            : (retroModeActive
              ? color(139, 90, 43) // Retro brown/tan color for Jerry Lawson tribute
            : (magicActive
              ? color(60, 0, 60)
              : (cursedActive
                ? color(0, 0, 0)
                : (qBuffActive
                  ? lerpColor(color('blue'), color('green'), (frameCount / 4) % 255 / 255) //slower for better visibility and focus
                  : (horseType === 4 // Aquatic stage
                    ? color(194, 154, 108) // Sandy background
                    : color(40, 40, 40))))))))))
);
  
  // Apply light gray overlay during risky road effect
  if (riskyRoadActive) {
    fill(150, 150, 150, 100); // Light gray with transparency
    rect(0, 0, width, height);
  }
  
  noStroke();
  for (let i = 0; i < 25; i++) {
    fill(100, 100, 100, 15);
    ellipse(random(width), random(height), random(60, 150));
  }
  
  // Draw butterflies in Endless Meadow
  if (secretStageActive && secretStageType === "meadow") {
    for (let butterfly of butterflies) {
      push();
      translate(butterfly.x, butterfly.y);
      
      // Butterfly wings (flutter animation)
      let wingFlutter = sin(frameCount * 0.3 + butterfly.offset) * 2;
      
      // Left wing
      fill(255, 182, 193, 180);
      ellipse(-butterfly.size/4, 0, butterfly.size/2 + wingFlutter, butterfly.size/1.5);
      
      // Right wing
      fill(255, 182, 193, 180);
      ellipse(butterfly.size/4, 0, butterfly.size/2 + wingFlutter, butterfly.size/1.5);
      
      // Body
      fill(75, 0, 130);
      ellipse(0, 0, butterfly.size/6, butterfly.size/2);
      
      pop();
    }
  }
  
  // Draw Deep Sea effects
  if (secretStageActive && secretStageType === "deepsea") {
    // Draw bubbles rising
    for (let bubble of bubbles) {
      noStroke();
      fill(200, 230, 255, 150);
      ellipse(bubble.x, bubble.y, bubble.size);
      fill(220, 240, 255, 80);
      ellipse(bubble.x - bubble.size/4, bubble.y - bubble.size/4, bubble.size/2);
    }
    
    // Draw jellyfish
    for (let jelly of jellyfish) {
      push();
      translate(jelly.x, jelly.y);
      
      // Jellyfish bell (translucent pink/purple)
      fill(255, 105, 180, 150);
      ellipse(0, 0, jelly.size, jelly.size * 0.8);
      fill(200, 80, 150, 100);
      ellipse(0, -jelly.size/6, jelly.size * 0.7, jelly.size * 0.5);
      
      // Tentacles (wavy)
      stroke(255, 105, 180, 180);
      strokeWeight(2);
      for (let i = 0; i < 6; i++) {
        let angle = (TWO_PI / 6) * i - PI/2;
        let baseX = cos(angle) * (jelly.size/3);
        let baseY = jelly.size/2.5;
        
        for (let j = 0; j < 3; j++) {
          let wave = sin(frameCount * 0.1 + i + j) * 3;
          let x1 = baseX + wave;
          let y1 = baseY + j * (jelly.size/4);
          let x2 = baseX + wave + sin(frameCount * 0.1 + i + j + 1) * 3;
          let y2 = baseY + (j + 1) * (jelly.size/4);
          line(x1, y1, x2, y2);
        }
      }
      noStroke();
      
      pop();
    }
    
    // Draw sea mines
    for (let mine of seaMines) {
      push();
      translate(mine.x, mine.y);
      
      // Mine body (dark gray sphere)
      fill(60, 60, 60);
      ellipse(0, 0, mine.size);
      fill(40, 40, 40);
      ellipse(-mine.size/4, -mine.size/4, mine.size/2);
      
      // Spikes
      fill(80, 80, 80);
      for (let i = 0; i < 8; i++) {
        let angle = (TWO_PI / 8) * i;
        let x = cos(angle) * (mine.size/2);
        let y = sin(angle) * (mine.size/2);
        push();
        translate(x, y);
        rotate(angle + PI/2);
        triangle(-3, 0, 3, 0, 0, mine.size/3);
        pop();
      }
      
      pop();
    }
  }
  
  // Draw Apocalypse effects
  if (secretStageActive && secretStageType === "apocalypse") {
    // Draw dust particles drifting
    for (let dust of dustParticles) {
      noStroke();
      fill(100, 80, 60, 120);
      ellipse(dust.x, dust.y, dust.size);
    }
    
    // Draw toxic clouds
    for (let cloud of toxicClouds) {
      push();
      translate(cloud.x, cloud.y);
      
      // Outer cloud (lighter green)
      fill(150, 200, 50, 100);
      ellipse(0, 0, cloud.size);
      
      // Middle layer
      fill(120, 180, 40, 130);
      ellipse(0, 0, cloud.size * 0.7);
      
      // Toxic center (darker, more dangerous)
      fill(90, 150, 30, 160);
      ellipse(0, 0, cloud.size * 0.4);
      
      // Pulsing effect
      let pulse = sin(frameCount * 0.1 + cloud.x) * 2;
      fill(180, 220, 60, 60);
      ellipse(0, 0, cloud.size + pulse);
      
      pop();
    }
    
    // Draw debris chunks (scrap piles)
    for (let debrisChunk of debris) {
      push();
      translate(debrisChunk.x, debrisChunk.y);
      rotate(debrisChunk.rotation);
      
      // Main scrap body (rusty metal)
      fill(100, 80, 60);
      beginShape();
      for (let i = 0; i < 7; i++) {
        let angle = (TWO_PI / 7) * i;
        let radius = debrisChunk.size/2 + random(-4, 6);
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
      }
      endShape(CLOSE);
      
      // Metal panels/plates
      fill(120, 100, 80);
      rect(-debrisChunk.size/3, -debrisChunk.size/5, debrisChunk.size/2.5, debrisChunk.size/4, 2);
      
      // Rust patches
      fill(140, 70, 40);
      ellipse(-debrisChunk.size/6, debrisChunk.size/6, debrisChunk.size/5);
      ellipse(debrisChunk.size/5, -debrisChunk.size/8, debrisChunk.size/6);
      
      // Dark scorch marks
      fill(40, 35, 30, 150);
      ellipse(debrisChunk.size/6, debrisChunk.size/5, debrisChunk.size/4);
      
      // Metal screws/bolts
      fill(60, 60, 55);
      ellipse(-debrisChunk.size/4, -debrisChunk.size/4, 3);
      ellipse(debrisChunk.size/4, debrisChunk.size/4, 3);
      
      // Sharp edges/rivets
      stroke(80, 70, 60);
      strokeWeight(2);
      line(-debrisChunk.size/3, -debrisChunk.size/6, -debrisChunk.size/5, -debrisChunk.size/3);
      line(debrisChunk.size/4, 0, debrisChunk.size/3, debrisChunk.size/5);
      noStroke();
      
      pop();
    }
    
    // Draw fallout shelter/bunker if active
    if (shelterActive) {
      push();
      translate(shelterX, shelterY);
      
      // Bunker main structure (reinforced concrete)
      fill(90, 90, 85);
      rect(-70, -50, 140, 60, 5);
      
      // Reinforced door
      fill(110, 110, 100);
      rect(-25, -45, 50, 50, 3);
      
      // Door details
      stroke(80, 80, 70);
      strokeWeight(2);
      line(-25, -20, 25, -20);
      line(0, -45, 0, 5);
      noStroke();
      
      // Rivets
      fill(70, 70, 65);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ellipse(-15 + i * 15, -35 + j * 20, 4);
        }
      }
      
      // Hazard stripes
      fill(255, 200, 0);
      for (let i = 0; i < 5; i++) {
        triangle(-70 + i * 35, -50, -60 + i * 35, -50, -65 + i * 35, -42);
      }
      fill(0, 0, 0);
      for (let i = 0; i < 5; i++) {
        triangle(-60 + i * 35, -50, -50 + i * 35, -50, -55 + i * 35, -42);
      }
      
      // Ventilation grates
      stroke(60, 60, 55);
      strokeWeight(1);
      for (let i = 0; i < 8; i++) {
        line(-60, -35 + i * 4, -40, -35 + i * 4);
        line(40, -35 + i * 4, 60, -35 + i * 4);
      }
      noStroke();
      
      // Shelter radius indicator (semi-transparent)
      fill(100, 150, 200, 30);
      ellipse(0, 0, 160);
      
      // Warning light (blinking)
      if (frameCount % 30 < 15) {
        fill(255, 0, 0);
        ellipse(0, -48, 6);
      }
      
      pop();
    }
  }
  
  // Draw Cyberspace effects
  if (secretStageActive && secretStageType === "cyberspace") {
      // Draw neon grid floor
      stroke(0, 255, 255, 80);
      strokeWeight(1);
      for (let i = 0; i < width; i += 40) {
        line(i, 0, i, height);
      }
      for (let i = 0; i < height; i += 40) {
        line(0, i, width, i);
      }
      noStroke();
      
      // Draw scan lines
      for (let line of scanLines) {
        fill(0, 255, 255, line.opacity);
        rect(0, line.y, width, 2);
      }
      
      // Draw laser grids (horizontal beams with gaps)
      for (let laser of laserGrids) {
        // Only draw if laser is visible on screen
        if (laser.y > -20 && laser.y < height + 20) {
          push();
          
          // Draw laser glow background
          fill(255, 0, 255, 50);
          rect(0, laser.y - 8, width, 16);
          
          // Draw laser beam segments (with gaps)
          fill(255, 0, 255);
          let segments = [];
          
          // Create segments between gaps
          let sortedGaps = [...laser.gaps].sort((a, b) => a - b);
          
          // First segment: from 0 to first gap
          if (sortedGaps[0] - laser.gapWidth/2 > 0) {
            segments.push({start: 0, end: sortedGaps[0] - laser.gapWidth/2});
          }
          
          // Middle segments: between gaps
          for (let i = 0; i < sortedGaps.length - 1; i++) {
            let segStart = sortedGaps[i] + laser.gapWidth/2;
            let segEnd = sortedGaps[i + 1] - laser.gapWidth/2;
            if (segEnd > segStart) {
              segments.push({start: segStart, end: segEnd});
            }
          }
          
          // Last segment: from last gap to width
          let lastGap = sortedGaps[sortedGaps.length - 1];
          if (lastGap + laser.gapWidth/2 < width) {
            segments.push({start: lastGap + laser.gapWidth/2, end: width});
          }
          
          // Draw all segments
          for (let seg of segments) {
            rect(seg.start, laser.y - laser.thickness/2, seg.end - seg.start, laser.thickness);
            // Edge glow
            fill(255, 100, 255, 150);
            rect(seg.start, laser.y - laser.thickness/2 - 1, seg.end - seg.start, 1);
            rect(seg.start, laser.y + laser.thickness/2, seg.end - seg.start, 1);
            fill(255, 0, 255);
          }
          
          pop();
        }
      }
      
      // Draw data packets
      for (let packet of dataPackets) {
        // Debug: show packet position above screen
        if (packet.y < 0) {
          fill(255, 0, 0);
          ellipse(packet.x, 10, 5);
        }
        
        push();
        translate(packet.x, packet.y);
        rotate(packet.rotation);
        
        // Packet glow
        fill(0, 255, 255, 80);
        rect(-packet.size/2 - 4, -packet.size/2 - 4, packet.size + 8, packet.size + 8, 3);
        
        // Main packet body
        fill(0, 200, 255);
        rect(-packet.size/2, -packet.size/2, packet.size, packet.size, 3);
        
        // Binary data pattern
        fill(0, 100, 150);
        textSize(8);
        textAlign(CENTER, CENTER);
        text("01", 0, -packet.size/4);
        text("10", 0, packet.size/4);
        
        // Corner accents
        fill(0, 255, 255);
        ellipse(-packet.size/2.5, -packet.size/2.5, 3);
        ellipse(packet.size/2.5, -packet.size/2.5, 3);
        ellipse(-packet.size/2.5, packet.size/2.5, 3);
        ellipse(packet.size/2.5, packet.size/2.5, 3);
        
        pop();
      }
      
      // Draw firewall shield if active
      if (firewallActive) {
        push();
        translate(staler.x, staler.y);
        
        // Shield hexagon
        let pulse = sin(frameCount * 0.2) * 5;
        stroke(255, 100, 0, 180);
        strokeWeight(3);
        noFill();
        beginShape();
        for (let i = 0; i < 6; i++) {
          let angle = (TWO_PI / 6) * i - PI/2;
          let x = cos(angle) * (40 + pulse);
          let y = sin(angle) * (40 + pulse);
          vertex(x, y);
        }
        endShape(CLOSE);
        
        // Shield glow layers
        strokeWeight(1);
        stroke(255, 150, 50, 100);
        ellipse(0, 0, 70 + pulse);
        ellipse(0, 0, 55 + pulse);
        
        noStroke();
        pop();
      }
      
      // Glitch effect overlay
      if (glitchEffect) {
        for (let i = 0; i < 5; i++) {
          fill(random(255), random(255), random(255), 100);
          rect(random(width), random(height), random(20, 50), random(2, 5));
        }
      }
      
      textAlign(LEFT, BASELINE);
    }
  }

function drawDemonicEffects() {
  // Draw Demonic effects
  console.log('Checking Demonic draw:', secretStageActive, secretStageType);
  if (secretStageActive && secretStageType === "demonic") {
    console.log('INSIDE DEMONIC DRAW BLOCK');
    // Draw hell fog particles
    for (let fog of hellFog) {
      noStroke();
      fill(100, 0, 0, fog.opacity);
      ellipse(fog.x, fog.y, fog.size);
    }
    
    // Draw flame waves (vertical like logs)
    for (let flame of flameWaves) {
      push();
      translate(flame.x, 0);
      
      // Flame gradient (orange to yellow)
      for (let i = 0; i < flame.width; i+= 5) {
        let t = i / flame.width;
        let c = lerpColor(color(255, 50, 0), color(255, 200, 0), t);
        fill(c, 180);
        rect(i - flame.width/2, 0, 5, height);
      }
      
      // Flame particles
      for (let i = 0; i < 15; i++) {
        let x = random(-flame.width/2, flame.width/2);
        let y = random(height);
        fill(255, random(100, 200), 0, random(150, 250));
        ellipse(x, y, random(3, 8));
      }
      
      pop();
    }
    
    // Draw demon missiles
    console.log('Drawing missiles, count:', demonMissiles.length);
    for (let missile of demonMissiles) {
      console.log('Drawing missile at', missile.x, missile.y);
      push();
      translate(missile.x, missile.y);
      rotate(missile.angle);
      
      // Flame trail
      for (let i = 0; i < 5; i++) {
        fill(255, 100 - i * 20, 0, 200 - i * 40);
        ellipse(-i * 5, 0, missile.size/2 - i * 2);
      }
      
      // Missile body
      fill(80, 0, 0);
      ellipse(0, 0, missile.size);
      
      // Demon skull face
      fill(139, 0, 0);
      ellipse(0, 0, missile.size * 0.8);
      
      // Eyes (glowing red)
      fill(255, 0, 0);
      ellipse(-missile.size/5, -missile.size/6, missile.size/4);
      ellipse(missile.size/5, -missile.size/6, missile.size/4);
      
      // Dark eye centers
      fill(0, 0, 0);
      ellipse(-missile.size/5, -missile.size/6, missile.size/6);
      ellipse(missile.size/5, -missile.size/6, missile.size/6);
      
      // Grin
      stroke(0, 0, 0);
      strokeWeight(2);
      noFill();
      arc(0, missile.size/6, missile.size/2, missile.size/4, 0, PI);
      noStroke();
      
      pop();
    }
    
    // Draw Satan if active
    if (satanActive) {
      push();
      translate(width/2, satanY);
      
      // Satan's massive head (300px wide)
      let satanSize = 150; // Radius (300px diameter)
      
      // Dark aura
      fill(0, 0, 0, 150);
      ellipse(0, 0, satanSize * 3);
      
      // Head
      fill(139, 0, 0);
      ellipse(0, 0, satanSize * 2);
      
      // Darker face details
      fill(100, 0, 0);
      ellipse(0, 0, satanSize * 1.6);
      
      // Horns
      fill(50, 0, 0);
      // Left horn
      beginShape();
      vertex(-satanSize * 0.5, -satanSize * 0.8);
      vertex(-satanSize * 0.7, -satanSize * 1.5);
      vertex(-satanSize * 0.3, -satanSize * 0.9);
      endShape(CLOSE);
      // Right horn
      beginShape();
      vertex(satanSize * 0.5, -satanSize * 0.8);
      vertex(satanSize * 0.7, -satanSize * 1.5);
      vertex(satanSize * 0.3, -satanSize * 0.9);
      endShape(CLOSE);
      
      // Eyes (glowing infernal)
      fill(255, 200, 0);
      ellipse(-satanSize * 0.4, -satanSize * 0.2, satanSize * 0.4);
      ellipse(satanSize * 0.4, -satanSize * 0.2, satanSize * 0.4);
      
      // Eye pupils (vertical slits)
      fill(0, 0, 0);
      rect(-satanSize * 0.4 - 3, -satanSize * 0.4, 6, satanSize * 0.4);
      rect(satanSize * 0.4 - 3, -satanSize * 0.4, 6, satanSize * 0.4);
      
      // Nose (demonic)
      fill(80, 0, 0);
      triangle(-satanSize * 0.1, satanSize * 0.1,
               satanSize * 0.1, satanSize * 0.1,
               0, satanSize * 0.3);
      
      // Mouth (fanged grin)
      fill(0, 0, 0);
      arc(0, satanSize * 0.5, satanSize * 1.2, satanSize * 0.8, 0, PI);
      
      // Fangs
      fill(255, 255, 255);
      triangle(-satanSize * 0.3, satanSize * 0.4,
               -satanSize * 0.2, satanSize * 0.4,
               -satanSize * 0.25, satanSize * 0.6);
      triangle(satanSize * 0.3, satanSize * 0.4,
               satanSize * 0.2, satanSize * 0.4,
               satanSize * 0.25, satanSize * 0.6);
      
      // Fire breath effect
      for (let i = 0; i < 20; i++) {
        let fireX = random(-satanSize * 0.6, satanSize * 0.6);
        let fireY = satanSize + random(0, satanSize * 0.5);
        fill(255, random(50, 150), 0, random(100, 200));
        ellipse(fireX, fireY, random(10, 25));
      }
      
      pop();
    }
    
    // Blood overlay effect
    if (bloodOverlay) {
      fill(139, 0, 0, 120);
      rect(0, 0, width, height);
      
      // Blood drips
      for (let i = 0; i < 20; i++) {
        let x = random(width);
        let y = random(height/2);
        fill(100, 0, 0, 180);
        ellipse(x, y, 3, random(10, 30));
      }
    }
    
    // Red vignette
    let vignetteStrength = 100;
    for (let i = 0; i < 50; i++) {
      let alpha = map(i, 0, 50, vignetteStrength, 0);
      noFill();
      stroke(100, 0, 0, alpha);
      strokeWeight(3);
      rect(i, i, width - i * 2, height - i * 2);
    }
    noStroke();
  }
}

function handleInput() {
  if (!stickyActive) { // Only allow movement if not stuck
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65) && staler.x > 0 ) staler.x -= 5; // 65 is the keyCode for 'A'
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68) && staler.x < 400 ) staler.x += 5; // 68 is the keyCode for 'D'
    //if (gameModeType === mobile) staler.x = mouseX; // Mobile controls - move player with mouse
  }
   // if (keyPressed (SHIFT)) alert ('THE GAME IS CURRENTLY PAUSED. PRESS OK TO RESUME.');
}

function keyPressed() {
  if (keyCode === SHIFT) {
    alert('THE GAME IS CURRENTLY PAUSED. PRESS OK TO RESUME.');
  }
  if (keyCode === TAB) {
    showAlmanac = !showAlmanac; // Toggle almanac
    if (showAlmanac) {
      almanacScroll = 0; // Reset scroll when opening
      // Play almanac opening sound if available
      if (typeof almanacOpenSound !== 'undefined' && almanacOpenSound && typeof almanacOpenSound.play === 'function') {
        try { almanacOpenSound.play(); } catch (e) { console.warn('almanacOpenSound play failed:', e); }
      }
    } else {
      // Play almanac closing sound if available
      if (typeof almanacCloseSound !== 'undefined' && almanacCloseSound && typeof almanacCloseSound.play === 'function') {
        try { almanacCloseSound.play(); } catch (e) { console.warn('almanacCloseSound play failed:', e); }
      }
    }
    return false; // Prevent default tab behavior
  }
  
  // Scroll almanac with arrow keys
  if (showAlmanac) {
    if (keyCode === UP_ARROW) {
      almanacScroll -= 30;
      return false;
    } else if (keyCode === DOWN_ARROW) {
      almanacScroll += 30;
      return false;
    }
  }
}

function mouseWheel(event) {
  // Scroll almanac with mouse wheel
  if (showAlmanac) {
    almanacScroll += event.delta * 0.5; // Scale down for smoother scrolling
    return false; // Prevent page scrolling
  }
  return true; // Allow default behavior when almanac is closed
}

function drawPlayer() {
  fill(255);
  //ellipse(staler.x, staler.y, staler.size);
  drawAerialHorse(staler.x, staler.y, 0.5); // Draws the horse at half size for better visibility
}

function spawnApples() {
  // Secret Stage: 3x spawn rate for Endless Meadow, 1.8x for Deep Sea, 0.5x for Apocalypse
  let spawnRate = 10;
  if (secretStageActive && secretStageType === "meadow") spawnRate = 3;
  else if (secretStageActive && secretStageType === "deepsea") spawnRate = 6;
  else if (secretStageActive && secretStageType === "apocalypse") spawnRate = 20; // 0.5x (half rate - scarcity!)
  else if (secretStageActive && secretStageType === "cyberspace") spawnRate = 5; // 2x (double rate - digital abundance!)
  else if (frenzyActive) spawnRate = 5;
  
  // In secret stages, spawn unique apples
  if (secretStageActive && secretStageType === "meadow") {
    if (frameCount % spawnRate !== 0) return;
    let rand = random();
    let type = "gold"; // Default
    
    if (rand < 0.15) type = "clover"; // 15% chance
    else if (rand < 0.25) type = "honey"; // 10% chance
    else if (rand < 0.35) type = "butterfly"; // 10% chance
    // Rest are regular gold apples for easy collecting
    
    apples.push({
      x: random(width),
      y: 0,
      size: 20,
      speed: 3 + SPEEDBOOST,
      type: type
    });
    return;
  }
  
  // Deep Sea secret stage
  if (secretStageActive && secretStageType === "deepsea") {
    if (frameCount % spawnRate !== 0) return;
    let rand = random();
    let type = "gold"; // Default
    
    if (rand < 0.08) type = "giant-pearl"; // 8% chance - high value
    else if (rand < 0.18) type = "bioluminescent"; // 10% chance
    else if (rand < 0.28) type = "coral"; // 10% chance
    // Rest are regular gold apples
    
    apples.push({
      x: random(width),
      y: 0,
      size: 20,
      speed: 2 + SPEEDBOOST, // Slower in water
      type: type
    });
    return;
  }
  
  // Apocalypse secret stage
  if (secretStageActive && secretStageType === "apocalypse") {
    if (frameCount % spawnRate !== 0) return;
    let rand = random();
    let type = "gold"; // Default
    
    if (rand < 0.05) type = "radiation"; // 5% chance
    else if (rand < 0.12) type = "survivor"; // 7% chance
    else if (rand < 0.15) type = "fallout"; // 3% chance - rare!
    // Rest are regular gold apples
    
    apples.push({
      x: random(width),
      y: 0,
      size: 20,
      speed: 3 + SPEEDBOOST,
      type: type
    });
    return;
  }
  
  // Cyberspace secret stage
  if (secretStageActive && secretStageType === "cyberspace") {
    if (frameCount % spawnRate !== 0) return;
    let rand = random();
    let type = "gold"; // Default
    
    if (rand < 0.06) type = "data"; // 6% chance
    else if (rand < 0.11) type = "glitch"; // 5% chance
    else if (rand < 0.14) type = "firewall"; // 3% chance - rare!
    // Rest are regular gold apples
    
    apples.push({
      x: random(width),
      y: 0,
      size: 20,
      speed: 3 + SPEEDBOOST,
      type: type
    });
    return;
  }
  
  // Demonic secret stage
  if (secretStageActive && secretStageType === "demonic") {
    if (frameCount % spawnRate !== 0) return;
    let rand = random();
    let type = "gold"; // Default
    
    if (rand < 0.08) type = "sacrifice"; // 8% chance
    else if (rand < 0.14) type = "inferno"; // 6% chance
    else if (rand < 0.19) type = "blood"; // 5% chance
    else if (rand < 0.23) type = "soul"; // 4% chance
    else if (rand < 0.25) type = "satan"; // 2% chance - THE ULTIMATE EVIL
    // Rest are regular gold apples
    
    apples.push({
      x: random(width),
      y: 0,
      size: 20,
      speed: 3 + SPEEDBOOST,
      type: type
    });
    return;
  }
  
  // During risky road, only spawn fail/success apples (50/50 chance)
  if (riskyRoadActive) {
    if (frameCount % spawnRate !== 0) return;
    let type = random() < 0.5 ? "fail" : "success";
    apples.push({
      x: random(50, width - 50),
      y: 0,
      size: 20,
      speed: 3 + SPEEDBOOST,
      type: type
    });
    return;
  }
  
  if (frameCount % spawnRate !== 0) return;
  let rand = random();
  let type = "gold";

  // JERRY LAWSON TRIBUTE - Fairchild Channel F Apple (December 1-3)
  let isJerryLawsonDay = (month() === 12 && day() >= 1 && day() <= 3);
  let isChristmasWeek = (month() === 12 && day() >= 19 && day() <= 25);
  
  if (isJerryLawsonDay && rand < 0.002 && !fairchildSpawned) type = "fairchild"; // 0.2% chance, only once per game
  else if (rand < 0.003) type = "queztelkonatol";
  // CHRISTMAS EXCLUSIVES (Dec 19-25)
  // CHRISTMAS EXCLUSIVES (Dec 19-25)
  // Rebalanced ranges so nutcracker is 0.5%, santa 0.5%, decoration 1%
  else if (isChristmasWeek && rand >= 0.003 && rand < 0.008 && !nutcrackerSpawned) type = "nutcracker"; // 0.5% chance, only once per game
  else if (isChristmasWeek && rand >= 0.008 && rand < 0.013) type = "santa"; // 0.5% chance
  else if (isChristmasWeek && rand >= 0.013 && rand < 0.023) type = "decoration"; // 1% chance
  // ALL STAGE-EXCLUSIVE APPLES - HIGHEST PRIORITY TO ENSURE SPAWNING
  // AQUATIC HORSE EXCLUSIVES (Stage 4)
  else if (horseType == 4 && rand >= 0.025 && rand < 0.065) type = "seashell-common"; // 4% chance
  else if (horseType == 4 && rand >= 0.065 && rand < 0.075) type = "seashell-rare"; // 1% chance
  else if (horseType == 4 && rand >= 0.075 && rand < 0.077) type = "seashell-legendary"; // 0.2% chance
  else if (horseType == 4 && rand >= 0.077 && rand < 0.087) type = "pearl"; // 1% chance
  // VOLCANIC HORSE EXCLUSIVES (Stage 3)
  else if (horseType == 3 && rand >= 0.053 && rand < 0.073) type = "magma"; // 2% chance
  else if (horseType == 3 && rand >= 0.073 && rand < 0.093) type = "ember"; // 2% chance
  else if (horseType == 3 && rand >= 0.093 && rand < 0.113) type = "ash"; // 2% chance
  else if (horseType == 3 && rand >= 0.113 && rand < 0.133) type = "sulfur"; // 2% chance
  // SECRET PORTAL APPLES (10%) - MUST COME BEFORE STAGE EXCLUSIVES
  else if (horseType == 1 && rand >= 0.003 && rand < 0.008) type = "portal-meadow"; // 0.5% chance - Default stage
  else if (horseType == 2 && rand >= 0.408 && rand < 0.413) type = "portal-cyberspace"; // 0.5% chance - Cyber stage
  else if (horseType == 3 && rand >= 0.133 && rand < 0.138) type = "portal-apocalypse"; // 0.5% chance - Volcanic stage
  else if (horseType == 4 && rand >= 0.087 && rand < 0.092) type = "portal-deepsea"; // 0.5% chance - Aquatic stage
  else if (horseType == 5 && rand >= 0.548 && rand < 0.553) type = "portal-demonic"; // 0.5% chance - Holy stage
  // CYBER HORSE EXCLUSIVES (Stage 2)
  else if (horseType == 2 && rand >= 0.133 && rand < 0.233) type = "robo"; // 10% chance
  else if (horseType == 2 && rand >= 0.233 && rand < 0.333) type = "cursed-robo"; // 10% chance
  else if (horseType == 2 && rand >= 0.333 && rand < 0.338) type = "concrete"; // 0.5% chance
  else if (horseType == 2 && rand >= 0.338 && rand < 0.408) type = "bomb"; // 7% chance
  // HOLY HORSE EXCLUSIVES (Stage 5)
  else if (horseType == 5 && rand >= 0.408 && rand < 0.413) type = "ruby"; // 0.5% chance
  else if (horseType == 5 && rand >= 0.413 && rand < 0.463) type = "blessed"; // 5% chance
  else if (horseType == 5 && rand >= 0.463 && rand < 0.543) type = "diamond"; // 8% chance
  else if (horseType == 5 && rand >= 0.543 && rand < 0.548) type = "queztelkonatol"; // Extra chance for holy horse
  // NOW GENERAL APPLES (no conflicts possible!)
  else if (rand < 0.005) type = "risky-road"; // 0.5% chance
  else if (rand < 0.01) type = "fat"; // 0.5% chance
  else if (rand < 0.0125) type = "frenzy"; // 0.25% chance (moved before brick to avoid conflicts)
  else if (score > 200 && rand < 0.015) type = "brick";
  else if (rand < 0.025) type = "magic";
  else if (score > 50 && rand < 0.015 && horseType != 5) type = "super-cursed"; // 1.5% chance, makes logs invisible for 5 seconds
  else if (score > 50 && rand < 0.03 && horseType != 5) type = "cursed"; // 1.5% chance, no demons for holy horse
  else if ( score > 200 && rand < 0.05) type = "obsidian"; // Restored original
  else if (score < 200 && rand < 0.05) type = "stone";
  else if (score > 200 && rand < 0.1) type = "sticky"; // Restored original
  else if (score > 150 && rand < 0.1) type = "bubble";
  else if (score > 20 && rand < 0.15) type = "platinum"; // Restored original
  else if (score > 30 && rand < 0.18) type = "dizzy"; // Fixed: increased threshold so it can actually spawn
  else if (horseType == 3 && rand < 0.3) type = "obsidian"; // volcanic horse gives you more obsidian apples
  else if (score > 10 && score < 75 && rand < 0.3) type = "rotten"; 
  else if (horseType == 2 && rand < 0.05) type = "platinum"; //from cyber horse
  else if (score > 75 && rand < 0.8) type = "mint";
 
  

  // If concrete effect is active, turn new apples into brick apples (except special apples)
  if (concreteActive && type !== "nutcracker" && type !== "santa" && type !== "decoration" && type !== "nut" && type !== "fairchild") {
    type = "brick";
  }

  apples.push({
    x: random(width),
    y: 0,
    size: 20,
    speed: 3 + SPEEDBOOST,
    type
  });
}

function spawnLogs() {
  if ((magicActive || cursedActive || secretStageActive) || frameCount % 50 !== 0) return;
  
  // Regular log spawn (only in first stage - default horse)
  if (horseType == 1) {
    logs.push({
      x: random(width),
      y: 0,
      size: 40,
      speed: 4 + ((sqrt(score))/5) + SPEEDBOOST,
      type: "log"
    });
  }

  // Cyber stage industrial machine spawn (every 200 frames, 100% chance)
  if (horseType == 2 && frameCount % 200 === 0 && random() < 1 && !magicActive) {
    logs.push({
      x: width * 0.15, // Start near left side of rail
      y: 0,
      size: 60,
      speed: 3 + SPEEDBOOST, // Match apple speed for consistent gameplay
      type: "industrial-machine",
      direction: random ([-1,1]), // 1 random direction for side-to-side movement
      sideSpeed: 2 + (sqrt(score) / 10) // Speed of side-to-side movement
    });
  }
}

function spawnLavaStreams() {
  // Only spawn lava streams in volcanic stage (horseType 3) and not during magic mode
  if (horseType !== 3 || magicActive) return;

  // Debug: More frequent and guaranteed spawning for testing
  if (frameCount % 120 === 0 && random() < 0.3) { // Every second with 30% chance
    // Random starting position at top of screen
    let startX = random(width * 0.1, width * 0.9);
    let targetX = random(width * 0.1, width * 0.9);
    
    // Calculate angle from start to target
    let angle = atan2(height - 50, targetX - startX);
    
    // Create warning first
    lavaWarnings.push({
      startX: startX,
      targetX: targetX,
      angle: angle,
      timer: 60, // 1 second warning at 60fps
      flashTimer: 0
    });
    
    // Debug alert to confirm spawning
    //showAlert("LAVA WARNING SPAWNED!", color(255, 140, 0));
    
  }
}

function updateLavaStreams() {
  // Update lava warnings
  for (let i = lavaWarnings.length - 1; i >= 0; i--) {
    let warning = lavaWarnings[i];
    warning.timer--;
    warning.flashTimer++;
    
    // Draw flashing warning
    if (warning.flashTimer % 8 < 4) { // Flash every 8 frames
      push();
      
      // Warning line showing lava stream path
      stroke(255, 140, 0, 200);
      strokeWeight(4);
      line(warning.startX, 0, warning.targetX, height);
      
      // Warning text
      fill(255, 0, 0);
      textAlign(CENTER);
      textSize(12);
      text("LAVA STREAM!", warning.startX, 20);
      
      // Heat shimmer effect at start point
      fill(255, 140, 0, 100);
      ellipse(warning.startX, 0, 20 + sin(warning.flashTimer * 0.5) * 5);
      
      noStroke();
      pop();
    }
    
    // When warning expires, create actual lava stream
    if (warning.timer <= 0) {
      screenShake = 30; // Add screen shake effect when lava stream spawns
      lavaStreams.push({
        startX: warning.startX,
        startY: 0,
        targetX: warning.targetX,
        targetY: height,
        angle: warning.angle,
        speed: 10 + (sqrt(score - 2000) / 5), // Fast lava stream
        width: 30,
        length: 100,
        currentY: 0,
        animationTimer: 0
      });
      lavaWarnings.splice(i, 1);
    }
  }
  
  // Update active lava streams
  for (let i = lavaStreams.length - 1; i >= 0; i--) {
    let stream = lavaStreams[i];
    stream.currentY += stream.speed;
    stream.animationTimer++;
    
    // Calculate current stream position along the angle
    let streamLength = stream.length;
    let streamX = stream.startX + cos(stream.angle) * stream.currentY;
    let streamY = stream.currentY;
    
    // Draw lava stream
    push();
    
    translate(streamX - stream.length /2 , streamY-50);
    rotate(stream.angle);
    
    // Main lava flow
    fill(255, 69, 0); // Bright orange-red
    noStroke();
    rect(-stream.width/2, -streamLength, stream.width, streamLength, stream.width/4);
    
    // Inner molten core
    fill(255, 255, 0, 200); // Bright yellow core
    rect(-stream.width/3, -streamLength + 5, stream.width/1.5, streamLength - 10, stream.width/6);
    
    // Lava bubbles and sparks
    fill(255, 140, 0);
    for(let spark = 0; spark < 5; spark++) {
      let sparkX = random(-stream.width/2, stream.width/2);
      let sparkY = random(-streamLength, 0);
      ellipse(sparkX, sparkY, random(2, 6));
    }
    
    // Glowing edges
    fill(255, 0, 0, 150);
    rect(-stream.width/2 - 2, -streamLength, 4, streamLength);
    rect(stream.width/2 - 2, -streamLength, 4, streamLength);
    
    pop();
    
    // Fixed collision detection - check collision with the entire stream length
    let streamHeadX = stream.startX + cos(stream.angle) * stream.currentY;
    let streamHeadY = stream.currentY;
    let streamTailX = stream.startX + cos(stream.angle) * (stream.currentY - streamLength);
    let streamTailY = stream.currentY - streamLength;
    
    // Check if player intersects with any part of the stream
    let collision = false;
    for (let checkPoint = 0; checkPoint <= streamLength; checkPoint += 5) {
      let checkX = stream.startX + cos(stream.angle) * (stream.currentY - checkPoint);
      let checkY = stream.currentY - checkPoint;
      
      if (checkY >= 0 && checkY <= height) { // Only check visible parts
        let distToPoint = dist(staler.x, staler.y, checkX, checkY);
        if (distToPoint < stream.width/2 + staler.size/2) {
          collision = true;
          break;
        }
      }
    }
    
    if (collision) {
      if (logImmunity) {
        // Protection works against lava
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Lava resisted! (" + pearlProtection + " left)", color(255, 255, 255));
          if (pearlProtection === 0) {
            logImmunity = false;
          }
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Lava resisted!", color(255, 215, 0));
        }
        lavaStreams.splice(i, 1); // Remove the lava stream
      } else {
        gameOver = true;
        showAlert("CONSUMED BY LAVA!", color(255, 69, 0));
      }
      continue;
    }
    
    // Create fire trail segments as the stream moves
    if (stream.currentY > 20) { // Start creating trails after stream has moved a bit
      let trailX = stream.startX + cos(stream.angle) * (stream.currentY - streamLength);
      let trailY = stream.currentY - streamLength;
      
      if (trailY >= 0 && trailY <= height) {
        fireTrails.push({
          x: trailX,
          y: trailY,
          width: stream.length, // Match the stream width exactly
          angle: stream.angle, // Store the stream's angle for proper orientation
          life: 240, // Frames the trail will persist
          maxLife: 240
        });
      }
    }
    
    // Remove stream when it goes off screen
    if (stream.currentY > height + stream.length) {
      lavaStreams.splice(i, 1);
    }
  }
  
  // Update and draw fire trails
  for (let i = fireTrails.length - 1; i >= 0; i--) {
    let trail = fireTrails[i];
    trail.life--;
    
    // Draw fading fire trail
    push();
    translate(trail.x, trail.y);
    rotate(trail.angle); // Rotate to match the lava stream's angle
    
    let alpha = map(trail.life, 0, trail.maxLife, 0, 255);
    
    // Main trail - rectangular to match lava stream shape
    fill(255, 69, 0, alpha * 0.4);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, trail.width, trail.width * 0.8); // Make trail height proportional to width
    
    // Inner bright trail
    fill(255, 140, 0, alpha * 0.6);
    rect(0, 0, trail.width * 0.7, trail.width * 0.6);
    
    // Hot center
    fill(255, 200, 0, alpha * 0.8);
    rect(0, 0, trail.width * 0.4, trail.width * 0.4);
    
    // Small sparks along the trail width
    if (frameCount % 4 === 0 && alpha > 50) {
      fill(255, 255, 0, alpha * 0.3);
      for (let spark = 0; spark < 2; spark++) {
        let sparkX = random(-trail.width/2, trail.width/2);
        let sparkY = random(-3, 3);
        ellipse(sparkX, sparkY, random(1, 2));
      }
    }
    
    pop();
    
    // Remove trail when it fades out
    if (trail.life <= 0) {
      fireTrails.splice(i, 1);
    }
  }
}

function spawnVortexes() {
  // Only spawn vortexes in holy stage (horseType 5) and not during magic mode or secret stages
  if (horseType !== 5 || magicActive || secretStageActive) return;

  // Dynamic vortex chance: starts at 50% at 5000 points, increases by 1% every 100 points deeper
  let baseChance = 0.5; // 50% at start of holy stage (5000 points)
  let pointsIntoStage5 = score - 5000; // How many points past the start of stage 5
  let increaseRate = 0.005; // 0.5% increase per 100 points
  let dynamicVortexChance = baseChance + (Math.floor(pointsIntoStage5 / 100) * increaseRate);
  
  // Cap at 100% chance (though that would be certain death)
  dynamicVortexChance = Math.min(dynamicVortexChance, 1.0);

  if (frameCount % 100 === 0 && random() < dynamicVortexChance) {
    // Random vortex positioning
    let targetX = random(width * 0.1, width * 0.9);
    vortexSize = random(0.5, 1.5); // Random vortex size
    
    // Create warning first
    vortexWarnings.push({
      x: targetX,
      y: random(height * 0.1, height * 0.33), // Upper third of screen
      timer: 90, // 1.5 seconds warning at 60fps
      flashTimer: 0
    });
  }
}

function updateVortexes() {
  // Update vortex warnings
  for (let i = vortexWarnings.length - 1; i >= 0; i--) {
    let warning = vortexWarnings[i];
    warning.timer--;
    warning.flashTimer++;
    
    // Draw flashing warning
    if (warning.flashTimer % 10 < 5) { // Flash every 10 frames
      push();
      fill(255, 0, 0);
      textAlign(CENTER);
      textSize(16);
      text("HELL VORTEX IMMINENT", warning.x, warning.y - 20);
      
      // Warning circle
      stroke(255, 0, 0);
      strokeWeight(3);
      noFill();
      ellipse(warning.x, warning.y, 75 + sin(warning.flashTimer * 0.3) * 10);
      noStroke();
      pop();
    }
    
    // When warning expires, create actual vortex
    if (warning.timer <= 0) {
      vortexes.push({
        x: warning.x,
        y: warning.y,
        speed: 3 + SPEEDBOOST, // Same speed as apples
        radius: 75 + ((score - 5000) * 0.01), // Dynamic radius based on score progression from stage 5
        animationTimer: 0
      });
      vortexWarnings.splice(i, 1);
    }
  }
  
  // Update active vortexes
  for (let i = vortexes.length - 1; i >= 0; i--) {
    let vortex = vortexes[i];
    vortex.y += vortex.speed;
    vortex.animationTimer++;
    
    // Draw hell vortex with cool animation
    push();
    translate(vortex.x, vortex.y);
    scale(vortex.radius / 75); // scale matches radius growth (75 = base radius)
    // Rotating outer ring of darkness
    for (let ring = 0; ring < 5; ring++) {
      let ringRadius = vortex.radius - ring * 12;
      let ringAlpha = 255 - ring * 40;
      
      fill(50, 0, 0, ringAlpha);
      stroke(139, 0, 0, ringAlpha);
      strokeWeight(2);
      
      // Rotating effect
      rotate(vortex.animationTimer * 0.02 * (ring + 1));
      
      // Draw jagged circle for hell effect
      beginShape();
      for (let angle = 0; angle < TWO_PI; angle += PI/8) {
        let radius = ringRadius + sin(angle * 4 + vortex.animationTimer * 0.1) * 5;
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    
    // Central bloody void
    fill(10, 0, 0);
    ellipse(0, 0, 30);
    
    // Swirling blood effect
    stroke(139, 0, 0, 200);
    strokeWeight(3);
    noFill();
    for (let spiral = 0; spiral < 3; spiral++) {
      let spiralAngle = vortex.animationTimer * 0.15 + spiral * TWO_PI/3;
      let spiralRadius = 15 + sin(vortex.animationTimer * 0.08 + spiral) * 8;
      let x1 = cos(spiralAngle) * spiralRadius;
      let y1 = sin(spiralAngle) * spiralRadius;
      let x2 = cos(spiralAngle + 0.5) * (spiralRadius * 0.7);
      let y2 = sin(spiralAngle + 0.5) * (spiralRadius * 0.7);
      line(x1, y1, x2, y2);
    }
    
    // Crackling energy around the vortex
    noStroke();
    fill(255, 0, 0, 150);
    for (let spark = 0; spark < 8; spark++) {
      let sparkAngle = vortex.animationTimer * 0.2 + spark * PI/4;
      let sparkRadius = vortex.radius * 0.8 + sin(vortex.animationTimer * 0.3 + spark) * 10;
      let sparkX = cos(sparkAngle) * sparkRadius;
      let sparkY = sin(sparkAngle) * sparkRadius;
      ellipse(sparkX, sparkY, 3);
    }
    
    noStroke();
    pop();
    
    // Remove apples that are above or inside the vortex (except portal-demonic)
    for (let j = apples.length - 1; j >= 0; j--) {
      let apple = apples[j];
      let distToVortex = dist(apple.x, apple.y, vortex.x, vortex.y);
      
      // Skip portal-demonic apples - they cannot be gobbled
      if (apple.type === "portal-demonic") continue;
      
      // Remove apples above the vortex or inside its radius
      if (distToVortex < vortex.radius || 
          (apple.x > vortex.x - vortex.radius && apple.x < vortex.x + vortex.radius && 
           apple.y < vortex.y && apple.y > vortex.y - 100)) {
        apples.splice(j, 1);
      }
    }
    
    // Check collision with player
    let distToPlayer = dist(staler.x, staler.y, vortex.x, vortex.y);
    if (distToPlayer < vortex.radius + (staler.size / 2)) { // Account for player's radius too
      if (logImmunity) {
        // Protection works against vortex
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Vortex resisted! (" + pearlProtection + " left)", color(255, 255, 255));
          if (pearlProtection === 0) {
            logImmunity = false;
          }
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Vortex resisted!", color(255, 215, 0));
        }
        vortexes.splice(i, 1); // Remove the vortex
      } else {
        gameOver = true;
        showAlert("CONSUMED BY HELL VORTEX!", color(139, 0, 0));
      }
    }
    
    // Remove vortex when it goes off screen
    if (vortex.y > height + vortex.radius) {
      vortexes.splice(i, 1);
    }
  }
}

function spawnNuts() {
  // Only spawn nuts if nutcracker effect is active
  if (!nutcrackerActive) return;
  
  // Spawn a nut every 45 frames (less frequent than apples)
  if (frameCount % 100 === 0) {
    apples.push({
      x: random(width),
      y: 0,
      size: 15,
      speed: 5 + SPEEDBOOST,
      type: "nut"
    });
  }
}

function updateApples() {
  for (let i = apples.length - 1; i >= 0; i--) {
    const a = apples[i];
    
    // Skip movement for apples that have been netted by robo animation
    let isNetted = false;
    if (roboGrabActive) {
      for (let grabbed of roboGrabbedApples) {
        if (grabbed.netted && !grabbed.grabbed && a.type === grabbed.type && 
            abs(a.x - grabbed.initialX) < 50 && 
            abs(a.y - grabbed.initialY) < 200) {
          isNetted = true;
          break;
        }
      }
    }
    
    if (!isNetted) {
      a.y += a.speed;
    }
    
    // Transform apples during magic mode (except special event apples)
    if (magicActive) {
      let isProtected = (a.type === "fairchild" || a.type === "santa" || 
                        a.type === "decoration" || a.type === "nutcracker" || 
                        a.type === "nut");
      
      if (!isProtected) {
        // Only transform once - check if already transformed
        if (horseType === 5 && a.type !== "diamond") {
          a.type = "diamond"; // Holy horse gets special apple during magic mode
        } else if (horseType === 4 && a.type !== "rare-seashell" && a.type !== "seashell-common") {
          // Aquatic stage: common seashells with occasional rare, no legendary (no pain no gain)
          if (random() < 0.2) {
            a.type = "rare-seashell";
          } else {
            a.type = "seashell-common";
          }
        } else if (horseType === 3 && a.type !== "ember" && a.type !== "obsidian") {
          // Volcanic stage: obsidian with occasional ember (no pain no gain - save magma for the risk)
          if (random() < 0.2) {
            a.type = "ember";
          } else {
            a.type = "obsidian";
          }
        } else if (a.type !== "platinum" && horseType !== 5 && horseType !== 4 && horseType !== 3) {
          a.type = "platinum";
        }
      }
    }
    
    // Draw unique apple designs
    push();
    translate(a.x, a.y);
    
    switch (a.type) {
      case "santa":
        drawSantaApple(a.size);
        break;
        
      case "decoration":
        drawDecorationApple(a.size);
        break;
        
      case "nutcracker":
        drawNutcrackerApple(a.size);
        break;
        
      case "fairchild":
        drawFairchildApple(a.size);
        break;
      
      case "gold": 
        drawGoldApple(a.size);
        break;
        
      case "ruby":
        drawRubyApple(a.size);
        break;
        
      case "platinum":
        drawPlatinumApple(a.size);
        break;
        
      case "rotten":
        drawRottenApple(a.size);
        break;
        
      case "frenzy":
        drawFrenzyApple(a.size);
        break;
        
      case "risky-road":
        drawRiskyRoadApple(a.size);
        break;
        
      case "fail":
        drawFailApple(a.size);
        showAlert("MAGMA POWER! +25 pts, obstacles melted!", color(255, 140, 0));
        if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
          try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
        }
        
      case "success":
        drawSuccessApple(a.size);
        if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
          try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
        }
        
      case "fat":
        drawFatApple(a.size);
        break;
        showAlert("ASH! -5 pts, smoke cloud!", color(120, 120, 120));
        if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
          try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
        }
      case "magic":
        drawMagicApple(a.size);
        break;
        
      case "bomb": 
        drawBombApple(a.size);
        break;
        
      case "cursed":
        drawCursedApple(a.size);
        break;
        
      case "super-cursed":
        drawSuperCursedApple(a.size);
        break;
        
      case "blessed":
        drawBlessedApple(a.size);
        break;
        
      case "diamond":
        drawDiamondApple(a.size);
        break;
        
      case "queztelkonatol":
        drawQueztelkonatolApple(a.size);
        break;
        
      case "mint":
        drawMintApple(a.size);
        break;
        
      case "brick":
        drawBrickApple(a.size);
        break;
        
      case "bubble":
        drawBubbleApple(a.size);
        break;
        
      case "obsidian":
        drawObsidianApple(a.size);
        break;
        
      case "stone":
        drawStoneApple(a.size);
        break;
        
      case "dizzy":
        drawDizzyApple(a.size);
        break;
        
      case "sticky":
        drawStickyApple(a.size);
        break;
        
      case "robo":
        drawRoboApple(a.size);
        break;
        
      case "cursed-robo":
        drawCursedRoboApple(a.size);
        break;
        
      case "concrete":
        drawConcreteApple(a.size);
        break;
        
      case "magma":
        drawMagmaApple(a.size);
        break;
        
      case "ember":
        drawEmberApple(a.size);
        break;
        
      case "ash":
        drawAshApple(a.size);
        break;
        
      case "sulfur":
        drawSulfurApple(a.size);
        break;
        
      case "seashell-common":
        drawSeashellCommonApple(a.size);
        break;
        
      case "seashell-rare":
        drawSeashellRareApple(a.size);
        break;
        
      case "seashell-legendary":
        drawSeashellLegendaryApple(a.size);
        break;
        
      case "pearl":
        drawPearlApple(a.size);
        break;
        
      case "nut":
        drawNutApple(a.size);
        break;
        
      case "portal-meadow":
        drawPortalMeadowApple(a.size);
        break;
        
      case "clover":
        drawCloverApple(a.size);
        break;
        
      case "honey":
        drawHoneyApple(a.size);
        break;
        
      case "butterfly":
        drawButterflyApple(a.size);
        break;
        
      case "portal-deepsea":
        drawPortalDeepSeaApple(a.size);
        break;
        
      case "giant-pearl":
        drawGiantPearlApple(a.size);
        break;
        
      case "bioluminescent":
        drawBioluminescentApple(a.size);
        break;
        
      case "coral":
        drawCoralApple(a.size);
        break;
        
      case "portal-apocalypse":
        drawPortalApocalypseApple(a.size);
        break;
        
      case "radiation":
        drawRadiationApple(a.size);
        break;
        
      case "survivor":
        drawSurvivorApple(a.size);
        break;
        
      case "fallout":
        drawFalloutApple(a.size);
        break;
        
      case "portal-cyberspace":
        drawPortalCyberspaceApple(a.size);
        break;
      
      case "portal-demonic":
        drawPortalDemonicApple(a.size);
        break;
        
      case "data":
        drawDataApple(a.size);
        break;
        
      case "glitch":
        drawGlitchApple(a.size);
        break;
        
      case "firewall":
        drawFirewallApple(a.size);
        break;
      
      case "sacrifice":
        drawSacrificeApple(a.size);
        break;
      
      case "inferno":
        drawInfernoApple(a.size);
        break;
      
      case "blood":
        drawBloodApple(a.size);
        break;
      
      case "soul":
        drawSoulApple(a.size);
        break;
      
      case "satan":
        drawSatanApple(a.size);
        break;
        
      case "mini-coral":
        drawMiniCoralApple(a.size);
        break;
    }
    
    pop();

    if (collides(staler, a)) {
      let appleIndex = i; // Store the index for robo apples
      // Reset custom-sound flag for this collection and apply the effect
      lastCustomSoundPlayed = false;
      applyAppleEffect(a.type, appleIndex);
      // Play pickup sound only if the apple effect did not play a custom sound
      if (!lastCustomSoundPlayed) {
        if (typeof pickupSound !== 'undefined' && pickupSound && typeof pickupSound.play === 'function') {
          try {
            pickupSound.play();
          } catch (e) {
            console.warn('pickupSound play failed:', e);
          }
        }
      }
      // For robo or cursed-robo apples, the array has been replaced, so break out of the loop
      if (a.type === "robo" || a.type === "cursed-robo") {
        break; // Exit the loop since the apples array has been completely replaced
      } else {
        apples.splice(i, 1);
      }
    } else if (a.y > height) {
      apples.splice(i, 1);
    }
  }
}

function applyAppleEffect(type, currentAppleIndex) {
  let finalMultiplier = multiplier * (qBuffActive ? 3 : 1); // Combine secret stage multiplier with Q-Buff
  switch (type) {
    case "santa":
      score += 30 * finalMultiplier;
      multiplier *= 2; // Activate 2x score multiplier
      showAlert("SANTA BONUS! +30 pts, 2x multiplier!", color(220, 20, 60));
      // Play Santa sound if available
      if (typeof santaSound !== 'undefined' && santaSound && typeof santaSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { santaSound.play(); } catch (e) { console.warn('santaSound play failed:', e); }
      }
      break;
      
    case "decoration":
      score += 20 * multiplier;
      showAlert("FESTIVE DECORATION! +20 pts", color(34, 139, 34));
      break;
      
    case "nutcracker":
      nutcrackerActive = true;
      nutcrackerSpawned = true; // Mark as spawned so it never spawns again
      isAllergic = random() < 0.012; // 1.2% chance of being allergic
      showAlert(isAllergic ? "NUTCRACKER! (You're allergic!)" : "NUTCRACKER POWER! Nuts incoming!", isAllergic ? color(255, 0, 0) : color(184, 134, 11));
      break;
      
    case "fairchild":
      // Jerry Lawson Tribute - Activate retro mode
      retroModeActive = true;
      retroModeTimer = millis();
      fairchildSpawned = true; // Mark as spawned so it never spawns again
      score += 1976 * multiplier; // Year Fairchild Channel F was released
      alert("Jerry Lawson was a pioneering African American video game engineer who led the team at Fairchild Semiconductor that created the Fairchild Channel F in 1976—the world's first cartridge-based home video game console. This invention allowed players to swap game cartridges instead of being stuck with built-in games, fundamentally changing the gaming industry and establishing the model used by every modern console. Despite facing discrimination as one of the few Black engineers in 1970s Silicon Valley, he later founded Videosoft, one of the first Black-owned video game companies, and continued mentoring future generations of diverse engineers until his death in 2011. You have just collected a fairchild F console, and will recieve 1976 points. This apple is only available on december 1st, his birthday, or the second or the third. Obviously this is a tribute to Jerry Lawson and his incredible contributions to Jerry Lawson.");
      showAlert("RETRO MODE! Honoring Jerry Lawson +1976", color(139, 90, 43));
      break;
      
    case "nut":
      if (isAllergic) {
        // Player is allergic - lose points and show barf emoji
           if ( random() < 0.5 ) {
            gameOver = true;
            showAlert("💀 UhOh! You are allergic and it was fatal.", color(139, 0, 0));
           } else {
            score = max(0, score - 50 * multiplier);
            showAlert("🤮 ALLERGIC! -50 pts", color(255, 0, 0));
           }
        
    
      } else {
        // Player is not allergic - gain points
        score += 20 * multiplier;
        showAlert("NUT! +20 pts", color(184, 134, 11));
      }
      break;
    
    case "gold": score += 1  * multiplier; showAlert("GOLD!", color(255, 215, 0)); break;
    case "ruby": 
      score *= 2; // Double the current score
      showAlert("RUBY POWER! Score DOUBLED!", color(139, 0, 0));
      break;
    case "platinum": score += 5 * multiplier; showAlert("MEGA BONUS!", color(200)); break;
    case "rotten": score = max(0, score - 1); showAlert("YUCK!", color(139, 69, 19)); break;
    case "frenzy":
      frenzyActive = true;
      frenzyTimer = millis();
      score += 5 * multiplier; // Small bonus for activating
      showAlert("FRENZY MODE! Apple rush!", color(255, 100, 0));
      break;
    case "risky-road":
      riskyRoadActive = true;
      riskyRoadTimer = millis();
      showAlert("RISKY ROAD! High risk, high reward!", color(150, 150, 150));
      break;
    case "fat":
      if (!fatActive) {
        originalSize = staler.size; // Store original size only if not already fat
      }
      fatActive = true;
      fatTimer = millis(); // Reset timer
      staler.size = originalSize * 2.5; // Always calculate from original size
      showAlert("MY 600LB LIFE! EXTREME catch area!", color(255, 165, 0));
      break;
    case "portal-meadow":
      secretStageActive = true;
      secretStageType = "meadow";
      secretStageStartTime = millis();
      secretStageTimer = 30000; // 30 seconds
      originalScore = score;
      multiplier = 1.5;
      // Initialize butterflies for meadow
      butterflies = [];
      for (let i = 0; i < 10; i++) {
        butterflies.push({
          x: random(width),
          y: random(-height, 0),
          speed: random(1, 3),
          size: random(10, 20),
          offset: random(TWO_PI)
        });
      }
      showAlert("ENDLESS MEADOW! Paradise awaits!", color(100, 200, 100));
      // Play portal woosh sound
      if (typeof portalSound !== 'undefined' && portalSound && typeof portalSound.play === 'function') {
        try { portalSound.play(); } catch (e) { console.warn('portalSound play failed:', e); }
      }
      // Start meadow ambient loop for Meadow stage
      if (typeof meadowSound !== 'undefined' && meadowSound && typeof meadowSound.loop === 'function') {
        try { meadowSound.loop(); } catch (e) { try { meadowSound.play(); } catch (e2) { } }
      } else if (typeof meadowSound !== 'undefined' && meadowSound && typeof meadowSound.play === 'function') {
        try { meadowSound.play(); } catch (e) { }
      }
      break;
    case "portal-deepsea":
      secretStageActive = true;
      secretStageType = "deepsea";
      secretStageStartTime = millis();
      secretStageTimer = 35000; // 35 seconds
      originalScore = score;
      multiplier = 2.5;
      // Initialize jellyfish
      jellyfish = [];
      for (let i = 0; i < 5; i++) {
        jellyfish.push({
          x: random(width),
          y: random(-height, height),
          speed: random(1, 2),
          size: random(30, 50),
          wobble: random(TWO_PI),
          direction: 1 // 1 for down, -1 for up
        });
      }
      // Initialize sea mines
      seaMines = [];
      for (let i = 0; i < 3; i++) {
        seaMines.push({
          x: random(width),
          y: -random(100, 300),
          speed: random(2, 3),
          size: 35
        });
      }
      // Initialize bubbles
      bubbles = [];
      for (let i = 0; i < 20; i++) {
        bubbles.push({
          x: random(width),
          y: random(height, height + 200),
          speed: random(0.5, 2),
          size: random(3, 10)
        });
      }
      showAlert("DEEP SEA! Beware of dangers!", color(0, 100, 200));
      // Play portal woosh sound
      if (typeof portalSound !== 'undefined' && portalSound && typeof portalSound.play === 'function') {
        try { portalSound.play(); } catch (e) { console.warn('portalSound play failed:', e); }
      }
      // Start ocean ambient loop for Deep Sea stage
      if (typeof oceanSound !== 'undefined' && oceanSound && typeof oceanSound.loop === 'function') {
        try { oceanSound.loop(); } catch (e) { try { oceanSound.play(); } catch (e2) { } }
      } else if (typeof oceanSound !== 'undefined' && oceanSound && typeof oceanSound.play === 'function') {
        try { oceanSound.play(); } catch (e) { }
      }
      break;
    case "portal-apocalypse":
      secretStageActive = true;
      secretStageType = "apocalypse";
      secretStageStartTime = millis();
      secretStageTimer = 20000; // 20 seconds
      originalScore = score;
      multiplier = 7; // 7x multiplier!
      // Initialize debris (random sizes)
      debris = [];
      for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 (2x less)
        debris.push({
          x: random(width),
          y: -random(100, 400),
          speed: random(3, 5),
          size: random(25, 60) // Random sizes!
        });
      }
      // Initialize toxic clouds (rare, 3 total)
      toxicClouds = [];
      for (let i = 0; i < 3; i++) {
        toxicClouds.push({
          x: random(width),
          y: -random(200, 600),
          speed: random(1, 2),
          size: random(50, 80),
          lingerTimer: 0, // How long it's been on ground
          onGround: false
        });
      }
      // Initialize dust particles
      dustParticles = [];
      for (let i = 0; i < 30; i++) {
        dustParticles.push({
          x: random(width),
          y: random(height),
          speedX: random(-0.5, 0.5),
          speedY: random(0.2, 0.8),
          size: random(2, 6),
          opacity: random(100, 200)
        });
      }
      showAlert("APOCALYPSE! Survive the wasteland!", color(200, 50, 0));
      // Play portal woosh sound
      if (typeof portalSound !== 'undefined' && portalSound && typeof portalSound.play === 'function') {
        try { portalSound.play(); } catch (e) { console.warn('portalSound play failed:', e); }
      }
      break;
    case "portal-cyberspace":
      secretStageActive = true;
      secretStageType = "cyberspace";
      secretStageStartTime = millis();
      secretStageTimer = 25000; // 25 seconds
      originalScore = score;
      multiplier = 5; // 5x multiplier!
      // Initialize laser grids with predefined gap patterns
      laserGrids = [];
      // Define laser patterns (gaps where player can pass through)
      let laserPatterns = [
        [200], // Single gap in center
        [100], // Single gap on left
        [300], // Single gap on right
        [150, 250], // Two gaps evenly spaced
        [100, 300], // Two gaps at edges
        [133, 266], // Two gaps, left and right thirds
        [80, 200, 320], // Three gaps
        [100, 200, 300], // Three evenly spaced gaps
        [120, 280], // Two gaps, slightly off center
        [160, 240], // Two close gaps in center
        [60, 340], // Two gaps near edges
        [100, 180, 260, 340], // Four gaps
        [80, 160, 240, 320], // Four evenly spaced gaps
        [200, 300], // Two gaps, center-right
        [100, 200] // Two gaps, left-center
      ];
      
      // Spawn 4-6 lasers with random patterns, starting above screen
      let numLasers = floor(random(4, 7));
      for (let i = 0; i < numLasers; i++) {
        let pattern = random(laserPatterns);
        laserGrids.push({
          y: -100 - i * random(150, 300), // Stagger them vertically
          speed: 2.5, // Same speed as apples
          thickness: 3,
          gaps: pattern, // Array of x-positions where gaps exist
          gapWidth: 70 // Width of each gap (wider for easier dodging)
        });
      }
      // Initialize data packets (fast moving obstacles)
      dataPackets = [];
      // TEMPORARILY DISABLED - testing lasers only
      /*for (let i = 0; i < 6; i++) {
        dataPackets.push({
          x: random(width),
          y: -50 - i * 100, // Stagger them vertically for consistent flow
          speed: random(3, 5),
          size: random(15, 25),
          rotation: random(TWO_PI)
        });
      }*/
      // Initialize scan lines
      scanLines = [];
      for (let i = 0; i < 8; i++) {
        scanLines.push({
          y: i * 60,
          speed: 1.5,
          opacity: random(100, 200)
        });
      }
      showAlert("CYBERSPACE! Digital realm entered!", color(0, 255, 255));
      // Play portal woosh sound
      if (typeof portalSound !== 'undefined' && portalSound && typeof portalSound.play === 'function') {
        try { portalSound.play(); } catch (e) { console.warn('portalSound play failed:', e); }
      }
      break;
    case "portal-demonic":
      secretStageActive = true;
      secretStageType = "demonic";
      console.log('PORTAL ACTIVATED - secretStageActive:', secretStageActive, 'type:', secretStageType);
      secretStageStartTime = millis();
      secretStageTimer = 30000; // 30 seconds
      originalScore = score;
      multiplier = 10; // 10x multiplier! Highest reward/difficulty
      // Clear Holy stage vortexes
      vortexes = [];
      // Initialize demon missiles
      demonMissiles = [];
      // Play portal woosh sound for demonic entrance
      if (typeof portalSound !== 'undefined' && portalSound && typeof portalSound.play === 'function') {
        try { portalSound.play(); } catch (e) { console.warn('portalSound play failed:', e); }
      }
      // Start demonic ambient loop for Demonic stage
      if (typeof demonicSound !== 'undefined' && demonicSound && typeof demonicSound.loop === 'function') {
        try { demonicSound.loop(); } catch (e) { try { demonicSound.play(); } catch (e2) { } }
      } else if (typeof demonicSound !== 'undefined' && demonicSound && typeof demonicSound.play === 'function') {
        try { demonicSound.play(); } catch (e) { }
      }
      for (let i = 0; i < 250; i++) {
        let spawnX, spawnY, targetAngle;
        // All missiles spawn from top
        spawnX = random(width);
        spawnY = -50;
        // Calculate initial angle toward player
        targetAngle = atan2(staler.y - spawnY, staler.x - spawnX);
        demonMissiles.push({
          x: spawnX,
          y: spawnY,
          speed: 3.5,
          angle: targetAngle,
          initialAngle: targetAngle,
          homingBudget: radians(10), // 10° total homing ability
          homingUsed: 0,
          size: 25
        });
        console.log('Initial missile spawned:', i, 'at', spawnX, spawnY);
      }
      // Initialize flame waves
      flameWaves = [];
      // TEMPORARILY DISABLED - testing missiles only
      /*for (let i = 0; i < 3; i++) {
        flameWaves.push({
          x: i % 2 === 0 ? -100 : width + 100,
          width: random(80, 100),
          speed: random(6, 8) * (i % 2 === 0 ? 1 : -1), // Alternate left/right
          direction: i % 2 === 0 ? 1 : -1
        });
      }*/
      // Initialize hell fog particles
      hellFog = [];
      for (let i = 0; i < 40; i++) {
        hellFog.push({
          x: random(width),
          y: random(height),
          speedX: random(-0.3, 0.3),
          speedY: random(-0.5, 0.5),
          size: random(10, 30),
          opacity: random(50, 150)
        });
      }
      showAlert("DEMONIC REALM! HELL UNLEASHED!", color(139, 0, 0));
      break;
    case "clover":
      score += 15 * multiplier;
      showAlert("LUCKY CLOVER! +15 pts", color(50, 205, 50));
      break;
    case "honey":
      score += 20 * multiplier;
      // TODO: Implement slow time effect
      showAlert("SWEET HONEY! +20 pts", color(255, 193, 37));
      break;
    case "butterfly":
      score += 10 * multiplier;
      // TODO: Implement float effect
      showAlert("BUTTERFLY GRACE! +10 pts", color(255, 105, 180));
      break;
    case "giant-pearl":
      score += 50 * multiplier;
      showAlert("GIANT PEARL! +50 pts", color(240, 234, 214));
      break;
    case "bioluminescent":
      score += 30 * multiplier;
      showAlert("BIOLUMINESCENT! +30 pts", color(0, 191, 255));
      break;
    case "coral":
      score += 10 * multiplier; // Base apple
      // Spawn 3 mini coral apples
      for (let i = 0; i < 3; i++) {
        apples.push({
          x: staler.x + random(-30, 30),
          y: staler.y - 20,
          size: 10,
          speed: 2,
          type: "mini-coral"
        });
      }
      showAlert("CORAL BURST! +10 pts (3 mini spawned)", color(255, 127, 80));
      break;
    case "mini-coral":
      score += 10 * multiplier;
      showAlert("+10", color(255, 127, 80));
      break;
    case "radiation":
      score += 35 * multiplier;
      // Screen flash effect
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          background(0, 255, 0, 100);
        }, i * 100);
      }
      showAlert("RADIATION! +35 pts", color(0, 255, 0));
      break;
    case "survivor":
      score += 25 * multiplier;
      logImmunity = true;
      setTimeout(() => { logImmunity = false; }, 2000); // 2 seconds immunity
      showAlert("SURVIVOR! +25 pts, 2s immunity!", color(139, 69, 19));
      break;
    case "fallout":
      score += 40 * multiplier;
      // Create protective shelter at player position
      shelterActive = true;
      shelterX = staler.x;
      shelterY = height - 60; // Ground level
      shelterTimer = millis();
      // Clear nearby debris and toxic clouds when shelter spawns
      for (let i = debris.length - 1; i >= 0; i--) {
        if (dist(staler.x, staler.y, debris[i].x, debris[i].y) < 150) {
          debris.splice(i, 1);
        }
      }
      for (let i = toxicClouds.length - 1; i >= 0; i--) {
        if (dist(staler.x, staler.y, toxicClouds[i].x, toxicClouds[i].y) < 150) {
          toxicClouds.splice(i, 1);
        }
      }
      showAlert("FALLOUT SHELTER! +40 pts, 5s protection!", color(100, 150, 200));
      break;
    case "data":
      score += 45 * multiplier;
      showAlert("DATA DOWNLOADED! +45 pts", color(0, 255, 255));
      // Play robot sound for data apple
      if (typeof robotSound !== 'undefined' && robotSound && typeof robotSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { robotSound.play(); } catch (e) { console.warn('robotSound play failed:', e); }
      }
      break;
    case "glitch":
      let glitchAmount = floor(random(-50, 51));
      score = max(0, score + glitchAmount);
      glitchEffect = true;
      glitchTimer = millis();
      showAlert("GLITCH! " + (glitchAmount >= 0 ? "+" : "") + glitchAmount + " pts", color(255, 0, 255));
      // Play glitch sound if available
      if (typeof glitchSound !== 'undefined' && glitchSound && typeof glitchSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { glitchSound.play(); } catch (e) { console.warn('glitchSound play failed:', e); }
      }
      break;
    case "firewall":
      score += 30 * multiplier;
      firewallActive = true;
      firewallTimer = millis();
      showAlert("FIREWALL SHIELD! +30 pts, 4s protection!", color(255, 100, 0));
      // Play robot sound for firewall apple
      if (typeof robotSound !== 'undefined' && robotSound && typeof robotSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { robotSound.play(); } catch (e) { console.warn('robotSound play failed:', e); }
      }
      break;
    case "sacrifice":
      score = max(0, score - 50);
      // Destroy all missiles within 100px radius
      for (let i = demonMissiles.length - 1; i >= 0; i--) {
        if (dist(staler.x, staler.y, demonMissiles[i].x, demonMissiles[i].y) < 100) {
          demonMissiles.splice(i, 1);
        }
      }
      logImmunity = true;
      setTimeout(() => { logImmunity = false; }, 3000); // 3s immunity
      showAlert("SACRIFICE! -50 pts, missiles cleared, 3s immunity!", color(100, 0, 100));
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      break;
    case "inferno":
      score += 100 * multiplier;
      // Spawn 3 extra missiles
      for (let i = 0; i < 3; i++) {
        let edge = floor(random(3));
        let spawnX, spawnY, targetAngle;
        if (edge === 0) {
          spawnX = random(width);
          spawnY = -50;
        } else if (edge === 1) {
          spawnX = -50;
          spawnY = random(height);
        } else {
          spawnX = width + 50;
          spawnY = random(height);
        }
        targetAngle = atan2(staler.y - spawnY, staler.x - spawnX);
        demonMissiles.push({
          x: spawnX,
          y: spawnY,
          speed: 3.5,
          angle: targetAngle,
          initialAngle: targetAngle,
          homingBudget: radians(30),
          homingUsed: 0,
          size: 25
        });
      }
      showAlert("INFERNO! +100 pts, 3 missiles summoned!", color(255, 100, 0));
      break;
    case "blood":
      score += 75 * multiplier;
      bloodOverlay = true;
      bloodOverlayTimer = millis();
      showAlert("BLOOD! +75 pts, vision obscured!", color(139, 0, 0));
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      break;
    case "soul":
      score += 200 * multiplier;
      showAlert("SOUL CAPTURED! +200 pts!", color(200, 200, 255));
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      break;
    case "satan":
      score += 500 * multiplier;
      satanActive = true;
      satanY = -300;
      satanSpeed = 12;
      // Screen shake effect
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          // Visual effect handled in draw
        }, i * 50);
      }
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      showAlert("SATAN APPROACHES! +500 pts - FLEE!", color(0, 0, 0));
      break;
    case "fail":
      score = max(0, score - 75);
      showAlert("DEBT! -75", color(255, 50, 50));
      break;
    case "success":
      score += 50 * multiplier;
      showAlert("CA$H MONEY! +50", color(0, 200, 0));
      break;
    case "magic":
      magicActive = true;
      magicTimer = millis();
      logs = [];
      score += (qBuffActive ? 0 : 20); // no extra points when QBuff is on
      showAlert("MAGIC POWER!", color(255, 0, 255));
      // Play magic apple sound if available
      if (typeof magicSound !== 'undefined' && magicSound && typeof magicSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try {
          magicSound.play();
        } catch (e) {
          console.warn('magicSound play failed:', e);
        }
      }
      break;
    case "cursed":
      cursedActive = true;
      apples.forEach(a => a.type = "rotten");
      showAlert("CURSED!", color(0));
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      break;
    case "super-cursed":
      superCursedActive = true;
      superCursedTimer = millis();
      //score += 5 * multiplier; // Small reward for the risk
      showAlert("SUPER CURSED! Logs invisible for 5 seconds!", color(75, 0, 130));
      if (typeof cursedSound !== 'undefined' && cursedSound && typeof cursedSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { cursedSound.play(); } catch (e) { console.warn('cursedSound play failed:', e); }
      }
      break;
    case "blessed":
      logImmunity = true;
      score += 10 * multiplier; // Good reward for holy protection
      showAlert("BLESSED! Immune to next log hit!", color(255, 215, 0));
      break;
    case "diamond":
      score += 20 * multiplier; // High point value for holy exclusive
      showAlert("DIAMOND SHINE! +20 pts!", color(240, 248, 255));
      break;
    case "queztelkonatol":
      qBuffActive = true;
      magicTimer = millis(); // reusing timer
      score += 1000 * multiplier;
      showAlert("QUEZTELKONATOL'S GIFT!", color(random(255), random(255), random(255)));
      // Play Q apple sound if available
      if (typeof qSound !== 'undefined' && qSound && typeof qSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try {
          qSound.play();
        } catch (e) {
          console.warn('qSound play failed:', e);
        }
      }
      break;
    case "bomb":
      gameOver = true;
      screenShake = 30;
      break;
    case "mint":
      score += 2 * multiplier;
      showAlert("Minty Fresh!", color(144, 238, 144));
      break;
    case "brick":
      score = max(0, score - 10);
      showAlert("BRICK DAMAGE!", color(178, 34, 34));
      break;
    case "bubble":
      let delta = random([-3, 3]);
      score = max(0, score + delta);
      showAlert("Bubble Effect: " + (delta > 0 ? "+" : "") + delta, color(135, 206, 250));
      break;
    case "obsidian":
      
      logs = [];
      showAlert("Obsidian Cleared Logs!", color(75, 0, 130));
      if (horseType === 3) {
        score += 4 * multiplier; // Volcanic stage bonus
      } else {
        score += 2 * multiplier;
      }
      break;
    case "stone":
      score += 1 * multiplier;
      logs.forEach(l => l.speed *= 0.7);
      // Play stone apple sound if available
      if (typeof stoneSound !== 'undefined' && stoneSound && typeof stoneSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { stoneSound.play(); } catch (e) { console.warn('stoneSound play failed:', e); }
      }
      showAlert("Stone Slows Logs!", color(128, 128, 128));
      break;
    case "dizzy":
      score += 3 * multiplier; // Uncomment if you want to give points for dizzy
      screenShake = 200;
      showAlert("DIZZY!", color(255, 165, 0));
      break;
    case "sticky":
      stickyActive = true;
      stickyTimer = millis();
      // Play sticky apple sound if loaded
      if (typeof tickySound !== 'undefined' && tickySound) {
        lastCustomSoundPlayed = true;
        try { tickySound.play(); } catch (e) { }
      }
      score += 1 * multiplier; // Small point reward for the risk
      showAlert("STICKY! Can't move for 3 seconds!", color(255, 140, 0));
      break;
    case "robo":
      // Robo-apple grabs all apples and gives their points
      // Play robot sound for robo apple
      if (typeof robotSound !== 'undefined' && robotSound && typeof robotSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { robotSound.play(); } catch (e) { console.warn('robotSound play failed:', e); }
      }
      let totalPoints = 0;
      let grabbedCursedRobo = false;
      let newApples = []; // Create a new array without the grabbed apples
      
      // Start robo grab animation
      roboGrabActive = true;
      roboGrabTimer = millis();
      roboGrabbedApples = [];
      roboGrabStartX = staler.x; // Store player position at start
      roboGrabStartY = staler.y;
      
      // Go through all apples and decide which to grab
      for(let i = 0; i < apples.length; i++) {
        if(i === currentAppleIndex) {
          // This is the robo apple itself - don't keep it
          continue;
        } else if(apples[i].type === "robo") {
          // Keep other robo apples
          newApples.push(apples[i]);
        } else {
          // This apple will be grabbed - store it with full info for animation
          roboGrabbedApples.push({
            x: apples[i].x,
            y: apples[i].y,
            initialX: apples[i].x, // Store initial position to find apple later
            initialY: apples[i].y,
            type: apples[i].type,
            netted: false, // Net hasn't reached apple yet
            grabbed: false, // Not grabbed yet - will be grabbed when hand reaches it
            appleIndex: -1 // Will be updated during animation
          });
          // Keep the apple for now - it will be removed during animation
          newApples.push(apples[i]);
        }
      }
      
      // Replace the apples array with the new one (still contains apples to be grabbed)
      apples = newApples;
      break;
      
    case "cursed-robo":
      // Cursed robo-apple grabs all apples and subtracts their points
      // Play glitch sound for cursed-robo if available
      if (typeof glitchSound !== 'undefined' && glitchSound && typeof glitchSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { glitchSound.play(); } catch (e) { console.warn('glitchSound play failed:', e); }
      }
      let totalLoss = 0;
      let grabbedRobo = false;
      let newCursedApples = []; // Create a new array without the grabbed apples
      
      // Go through all apples and decide which to keep
      for(let i = 0; i < apples.length; i++) {
        if(i === currentAppleIndex) {
          // This is the cursed-robo apple itself - don't keep it
          continue;
        } else if(apples[i].type === "cursed-robo") {
          // Keep other cursed-robo apples
          newCursedApples.push(apples[i]);
        } else {
          // This apple gets grabbed by the cursed-robo apple
          let appleType = apples[i].type;
          
          if(appleType === "robo") {
                       grabbedRobo = true;
            // robo gives no loss when grabbed by cursed-robo
          } else {
            // Calculate point loss for each apple
            if(appleType === "gold") totalLoss += 1;
            else if(appleType === "ruby") totalLoss += score; // Ruby subtracts current score value
            else if(appleType === "platinum") totalLoss += 5;
            else if(appleType === "mint") totalLoss += 2;
            else if(appleType === "magic") totalLoss += 20;
            else if(appleType === "queztelkonatol") totalLoss += 1000;
            else if(appleType === "obsidian") totalLoss += 1;
            else if(appleType === "stone") totalLoss += 1;
            else if(appleType === "dizzy") totalLoss += 3;
            else if(appleType === "sticky") totalLoss += 1;
            else if(appleType === "bubble") totalLoss += 1; // bubble is variable, default to 1
            else if(appleType === "super-cursed") totalLoss += 5;
            else if(appleType === "blessed") totalLoss += 10;
            else if(appleType === "diamond") totalLoss += 20;
            else if(appleType === "concrete") totalLoss -= 5; // concrete gives back points when stolen by cursed-robo (double negative)
            else if(appleType === "santa") totalLoss += 30;
            else if(appleType === "decoration") totalLoss += 20;
            else if(appleType === "fairchild") totalLoss += 1976;
            else if(appleType === "nut") {
              if(isAllergic) {
                totalLoss -= 25; // Nut penalty gives back points when stolen (double negative)
              } else {
                totalLoss += 20;
              }
            }
          }
          // Don't add this apple to newCursedApples - it gets grabbed
        }
      }
      
      // Replace the apples array with the new one
      apples = newCursedApples;
      
      score = max(0, score - totalLoss);
      let cursedAlertMsg = "CURSED ROBO STEAL! -" + totalLoss + " pts (stole all apples)";
      if(grabbedRobo) {
        cursedAlertMsg += " [Robo neutralized!]";
      }
      showAlert(cursedAlertMsg, color(255, 0, 0));
      break;
      
    case "concrete":
      // Concrete apple: turns all apples into brick apples for 5 seconds
      concreteActive = true;
      concreteTimer = millis();
      
      // Turn all current apples into brick apples (except special apples)
      for(let i = 0; i < apples.length; i++) {
        if(apples[i].type !== "concrete" && apples[i].type !== "nutcracker" && apples[i].type !== "santa" && apples[i].type !== "decoration" && apples[i].type !== "nut" && apples[i].type !== "fairchild") {
          apples[i].type = "brick";
        }
      }
      
      score = max(0, score - 5); // Small penalty for the harsh effect
      showAlert("CONCRETE EFFECT! All apples → brick for 5s!", color(169, 169, 169));
      break;
      
    case "magma":
      // Volcanic horse exclusive: +25 points, melts obstacles (removes logs and lava streams)
      score += 25 * multiplier;
      logs = []; // Melts all logs
      lavaStreams = []; // Melts all lava streams
      fireTrails = []; // Clears fire trails too
      // Play magma sound if available
      if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
      }
      showAlert("MAGMA POWER! +25 pts, obstacles melted!", color(255, 140, 0));
      break;
      
    case "ember":
      // Volcanic horse exclusive: +15 points, creates fire trail effect around player
      score += 15 * multiplier;
      // Create temporary fire trail effect around player
      for(let angle = 0; angle < TWO_PI; angle += PI/8) {
        fireTrails.push({
          x: staler.x + cos(angle) * 30,
          y: staler.y + sin(angle) * 30,
          width: 15,
          angle: angle,
          life: 120,
          maxLife: 120
        });
      }
      showAlert("EMBER BURST! +15 pts, fire trail!", color(255, 100, 0));
      // Play magma sound for ember
      if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
      }
      break;
      
    case "ash":
      // Volcanic horse exclusive: -5 points, creates smoke cloud that obscures vision
      score = max(0, score - 5);
      // Create smoke cloud effect
      smokeCloud = true;
      smokeTimer = millis();
      // Create smoke particles
      for(let i = 0; i < 1000; i++) {
        smokeParticles.push({
          x: random(width),
          y: random(height),
          size: random(10, 30),
          life: random(180, 300), // 3-5 seconds
          maxLife: random(180, 300),
          speedX: random(-1, 1),
          speedY: random(-0.5, 0.5)
        });
      }
      showAlert("ASH CLOUD! -5 pts, vision obscured!", color(128, 128, 128));
      // Play magma sound for ash
      if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
      }
      break;
      
    case "sulfur":
      // Volcanic horse exclusive: increases lava stream spawn rate temporarily
      if (lavaStreamChance > 30) lavaStreamChance -= 30; // Increase lava spawn rate
      showAlert("SULFUR ERUPTION! More lava incoming!", color(255, 255, 0));
      // Play magma sound for sulfur
      if (typeof magmaSound !== 'undefined' && magmaSound && typeof magmaSound.play === 'function') {
        lastCustomSoundPlayed = true;
        try { magmaSound.play(); } catch (e) { console.warn('magmaSound play failed:', e); }
      }
      break;
      
    case "seashell-common":
      // Common seashell apple: random points 3-10
      let commonPoints = Math.floor(random(3, 11)); // 3-10 points
      score += commonPoints * multiplier;
      showAlert("COMMON SEASHELL! +" + commonPoints + " pts", color(205, 127, 50));
      break;
      
    case "seashell-rare":
      // Rare seashell apple: random points 10-30
      let rarePoints = Math.floor(random(10, 31)); // 10-30 points
      score += rarePoints * multiplier;
      showAlert("RARE SEASHELL! +" + rarePoints + " pts", color(192, 192, 192));
      break;
      
    case "seashell-legendary":
      // Legendary seashell apple: random points 50-100
      let legendaryPoints = Math.floor(random(50, 101)); // 50-100 points
      score += legendaryPoints * multiplier;
      showAlert("LEGENDARY SEASHELL! +" + legendaryPoints + " pts", color(255, 215, 0));
      break;
      
    case "pearl":
      // Pearl apple: 3 rounds of protection + 15 points
      score += 15 * multiplier;
      pearlProtection += 3; // 3 rounds of protection
      logImmunity = true; // Also activate immediate protection
      showAlert("PEARL POWER! +15 pts, 3 rounds of protection!", color(255, 255, 255));
      break;
  }
}

function spawnWhirlpools() {
  // Only spawn whirlpools in aquatic stage (horseType 4) and not during magic mode
  if (horseType !== 4 || magicActive) return;

  whirlpoolSpawnTimer++;
  
  // Spawn 2 whirlpools every 7 seconds (420 frames)
  if (whirlpoolSpawnTimer >= 420) {
    whirlpoolSpawnTimer = 0;
    
    // Create 2 whirlpools that will sweep across the screen
    for (let i = 0; i < 2; i++) {
      let startX = random(width * 0.1, width * 0.9);
      let targetX = random(width * 0.1, width * 0.9);
      
      whirlpools.push({
        x: startX,
        y: -50, // Start above screen
        targetX: targetX,
        targetY: staler.y, // Fixed Y at player level
        startX: startX,
        startY: -50,
        phase: 0, // 0 = moving to target, 1 = moving back up
        lifetime: 420, // 7 seconds at 60fps
        maxLifetime: 420,
        size: 80, // Much bigger and more dangerous
        rotation: 0,
        dwindling: false
      });
    }
  }
}

function updateWhirlpools() {
  for (let i = whirlpools.length - 1; i >= 0; i--) {
    let whirlpool = whirlpools[i];
    
    whirlpool.lifetime--;
    whirlpool.rotation += 0.5; // Faster, more menacing spinning
    
    // Check if entering dwindling phase (last 0.5 seconds = 30 frames)
    if (whirlpool.lifetime <= 30 && !whirlpool.dwindling) {
      whirlpool.dwindling = true;
    }
    
    // Movement phases
    if (!whirlpool.dwindling) {
      if (whirlpool.phase === 0) {
        // Moving to target position - faster and more aggressive
        let lerpAmount = 0.04; // Faster movement
        whirlpool.x = lerp(whirlpool.x, whirlpool.targetX, lerpAmount);
        whirlpool.y = lerp(whirlpool.y, whirlpool.targetY, lerpAmount);
        
        // Switch to phase 1 when close to target
        if (abs(whirlpool.x - whirlpool.targetX) < 10 && abs(whirlpool.y - whirlpool.targetY) < 10) {
          whirlpool.phase = 1;
        }
      } else if (whirlpool.phase === 1) {
        // Moving back up - faster retreat
        let lerpAmount = 0.04;
        whirlpool.x = lerp(whirlpool.x, whirlpool.startX, lerpAmount);
        whirlpool.y = lerp(whirlpool.y, whirlpool.startY, lerpAmount);
      }
    }
    
    // Dwindling animation
    if (whirlpool.dwindling) {
      whirlpool.size *= 0.95; // Shrink
      whirlpool.rotation += 0.5; // Spin faster
    }
    
    // Remove when lifetime is over
    if (whirlpool.lifetime <= 0) {
      whirlpools.splice(i, 1);
      continue;
    }
    
    // Collision with player (only if not in magic mode)
    if (!magicActive && 
        dist(whirlpool.x, whirlpool.y, staler.x, staler.y) < whirlpool.size / 2 + staler.size / 2) {
      
      if (logImmunity) {
        // Protection works against whirlpool
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Whirlpool resisted! (" + pearlProtection + " left)", color(255, 255, 255));
          if (pearlProtection === 0) {
            logImmunity = false;
          }
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Whirlpool resisted!", color(255, 215, 0));
        }
        whirlpools.splice(i, 1); // Remove the whirlpool that hit us
      } else {
        showAlert("CAUGHT IN WHIRLPOOL!", color(0, 100, 255));
        gameOver = true;
      }
    }
    
    // Draw whirlpool (reusing vortex drawing but with blue colors)
    push();
    translate(whirlpool.x, whirlpool.y);
    scale(whirlpool.size / 75); // scale matches size
    
    // Rotating outer ring of water - more dramatic
    for (let ring = 0; ring < 8; ring++) {
      let ringRadius = whirlpool.size - ring * 6;
      let ringAlpha = 255 - ring * 25;
      
      // Darker, more menacing blues
      fill(0, 30, 100, ringAlpha);
      stroke(0, 60, 150, ringAlpha);
      strokeWeight(3);
      
      // Faster, more aggressive rotation
      rotate(whirlpool.rotation * 0.05 * (ring + 1));
      
      // Draw jagged circle for more dangerous effect
      beginShape();
      for (let angle = 0; angle < TWO_PI; angle += PI/12) {
        let radius = ringRadius + sin(angle * 6 + whirlpool.rotation * 0.2) * 8;
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    
    // Central dark void - deeper and more menacing
    fill(0, 10, 40);
    ellipse(0, 0, 50);
    
    // Inner vortex effect
    fill(0, 20, 60);
    ellipse(0, 0, 35);
    
    // Swirling water effect - more intense
    stroke(0, 100, 200, 250);
    strokeWeight(4);
    noFill();
    for (let spiral = 0; spiral < 6; spiral++) {
      let spiralAngle = whirlpool.rotation * 0.25 + spiral * TWO_PI/6;
      let spiralRadius = 20 + sin(whirlpool.rotation * 0.15 + spiral) * 12;
      let x1 = cos(spiralAngle) * spiralRadius;
      let y1 = sin(spiralAngle) * spiralRadius;
      let x2 = cos(spiralAngle + 0.8) * (spiralRadius * 0.5);
      let y2 = sin(spiralAngle + 0.8) * (spiralRadius * 0.5);
      line(x1, y1, x2, y2);
    }
    
    // Dangerous water spouts around the whirlpool
    noStroke();
    fill(0, 80, 180, 200);
    for (let splash = 0; splash < 12; splash++) {
      let splashAngle = whirlpool.rotation * 0.3 + splash * PI/6;
      let splashRadius = whirlpool.size * 0.9 + sin(whirlpool.rotation * 0.4 + splash) * 15;
      let splashX = cos(splashAngle) * splashRadius;
      let splashY = sin(splashAngle) * splashRadius;
      ellipse(splashX, splashY, 6);
    }
    
    // Add foam and turbulence effects
    fill(150, 200, 255, 180);
    for (let foam = 0; foam < 8; foam++) {
      let foamAngle = whirlpool.rotation * 0.4 + foam * PI/4;
      let foamRadius = whirlpool.size * 0.7 + sin(whirlpool.rotation * 0.5 + foam) * 8;
      let foamX = cos(foamAngle) * foamRadius;
      let foamY = sin(foamAngle) * foamRadius;
      ellipse(foamX, foamY, 4);
    }
    
    noStroke();
    pop();
  }
}
function updateLogs() {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    
    // Update position based on log type
    if (log.type === "industrial-machine") {
      // Industrial machine moves side-to-side along rail
      log.x += log.direction * log.sideSpeed;
      
      // Bounce off rail boundaries (wider rail boundaries)
      if (log.x <= width * 0.1) {
        log.x = width * 0.1;
        log.direction = 1; // Move right
      } else if (log.x >= width * 0.9) {
        log.x = width * 0.9;
        log.direction = -1; // Move left
      }
      
      log.y += log.speed;
    } else {
      // Regular log just moves down
      log.y += log.speed;
    }
    
    // Only draw logs if they're not invisible (super-cursed effect)
    if (!superCursedActive) {
      push();
      
      if (log.type === "industrial-machine") {
        // Draw stationary rail first (not translated with machine)
        fill(80, 80, 80);
        rect(width * 0.05, log.y + 10, width * 0.9, 10); // Long rail across screen
        fill(60, 60, 60);
        rect(width * 0.05, log.y + 12, width * 0.9, 6); // Inner rail track
        
        // Rail bolts/rivets
        fill(40, 40, 40);
        for(let r = width * 0.1; r < width * 0.9; r += 20) {
          ellipse(r, log.y + 13, 3);
          ellipse(r, log.y + 17, 3);
        }
        
        // Draw industrial machine (translated to its position)
        translate(log.x, log.y + 15); // Center the machine
        
        // Machine body - industrial gray
        fill(120, 120, 120);
        rect(-log.size/2, -15, log.size, 30, 5);
        
        // Machine panels and details
        fill(100, 100, 100);
        rect(-log.size/3, -12, log.size/3, 8);
        rect(0, -12, log.size/3, 8);
        
        // Warning lights
        fill(255, 0, 0);
        ellipse(-log.size/3, -8, 4);
        fill(255, 255, 0);
        ellipse(log.size/3, -8, 4);
        
        // Mechanical arms/hazards
        stroke(80, 80, 80);
        strokeWeight(3);
        line(-log.size/2, 0, -log.size/2 - 8, -5);
        line(log.size/2, 0, log.size/2 + 8, -5);
        
        // Sparks/electrical effects
        noStroke();
        fill(255, 255, 0, 150);
        for(let s = 0; s < 3; s++) {
          let sparkX = random(-log.size/2, log.size/2);
          let sparkY = random(-10, 10);
          ellipse(sparkX, sparkY, 2);
        }
        
        // Machine glow effect
        fill(0, 200, 255, 50);
        ellipse(0, 0, log.size * 1.3, 35);
        
      } else {
        // Draw regular log
        translate(log.x + log.size/2, log.y + 10); // Center the log
        
        // Main log body - rich brown wood
        fill(101, 67, 33);
        rect(-log.size/2, -10, log.size, 20, 3); // Rounded corners for log shape
        
        // Darker wood grain lines
        stroke(83, 53, 10);
        strokeWeight(1);
        for(let g = 0; g < 3; g++) {
          let grainY = -8 + g * 6;
          line(-log.size/2 + 3, grainY, log.size/2 - 3, grainY);
        }
        
        // Wood texture spots and knots
        noStroke();
        fill(83, 53, 10);
        ellipse(-log.size/3, -3, 4, 2); // Wood knot
        ellipse(log.size/4, 2, 3, 2); // Wood knot
        ellipse(-log.size/6, 5, 2, 1); // Small texture
        
        // Log end caps (circular wood grain)
        fill(139, 90, 43); // Lighter brown for cut ends
        ellipse(-log.size/2, 0, 8, 20); // Left end
        ellipse(log.size/2, 0, 8, 20); // Right end
        
        // Tree rings on the ends
        stroke(101, 67, 33);
        strokeWeight(1);
        noFill();
        ellipse(-log.size/2, 0, 6, 16); // Inner ring left
        ellipse(-log.size/2, 0, 4, 12); // Inner ring left
        ellipse(log.size/2, 0, 6, 16); // Inner ring right
        ellipse(log.size/2, 0, 4, 12); // Inner ring right
        
        // Bark texture on top and bottom
        noStroke();
        fill(62, 39, 35); // Dark bark color
        rect(-log.size/2 + 4, -10, log.size - 8, 3); // Top bark
        rect(-log.size/2 + 4, 7, log.size - 8, 3); // Bottom bark
        
        // Bark texture details
        fill(45, 25, 15); // Very dark bark
        for(let b = 0; b < log.size/8; b++) {
          let barkX = -log.size/2 + 8 + b * 6;
          rect(barkX, -9, 2, 1); // Top bark texture
          rect(barkX + 1, 8, 2, 1); // Bottom bark texture
        }
        
        // Highlight on the log for 3D effect
        fill(139, 90, 43, 100);
        ellipse(0, -5, log.size * 0.8, 6); // Top highlight
      }
      
      noStroke();
      pop();
    }

    // Collision detection
    let collisionHeight = log.type === "industrial-machine" ? 30 : 20;
    if (collidesWithRect(staler, log.x, log.y, log.size, collisionHeight)) {
      if (logImmunity) {
        // Protection works against logs
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Log resisted! (" + pearlProtection + " left)", color(255, 255, 255));
          if (pearlProtection === 0) {
            logImmunity = false;
          }
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Immunity used!", color(255, 215, 0));
        }
        logs.splice(i, 1); // Remove the log that hit us
      } else {
        gameOver = true;
      }
    }

    if (log.y > height) logs.splice(i, 1);
  }
}

function updateEffects() {
  if (magicActive && millis() - magicTimer > (qBuffActive ? 30000 : 10000)) {
    magicActive = false;
  }
  if (cursedActive && millis() - magicTimer > 10000) {
    cursedActive = false;
  }
  if (qBuffActive && millis() - magicTimer > Q_DURATION) {
    qBuffActive = false;
  }
  if (stickyActive && millis() - stickyTimer > 3000) { // 3 seconds immobilization
    stickyActive = false;
  }
  if (superCursedActive && millis() - superCursedTimer > 5000) { // 5 seconds invisible logs
    superCursedActive = false;
  }
  if (concreteActive && millis() - concreteTimer > 5000) { // 5 seconds concrete effect
    concreteActive = false;
  }
  if (smokeCloud && millis() - smokeTimer > 4000) { // 4 seconds smoke cloud
    smokeCloud = false;
    smokeParticles = []; // Clear all smoke particles
  }
  if (retroModeActive && millis() - retroModeTimer > 30000) { // 30 seconds retro mode
    retroModeActive = false;
    showAlert("Retro Mode Ended", color(139, 90, 43));
  }
  if (frenzyActive && millis() - frenzyTimer > 3000) { // 3 seconds frenzy
    frenzyActive = false;
  }
  if (riskyRoadActive && millis() - riskyRoadTimer > 5000) { // 5 seconds risky road
    riskyRoadActive = false;
  }
  if (fatActive && millis() - fatTimer > 5000) { // 5 seconds fat effect
    fatActive = false;
    staler.size = originalSize; // Restore original size
  }
  if (woozyActive && millis() - woozyTimer > 3000) { // 3 seconds woozy wobble
    woozyActive = false;
  }
  
  // Check shelter duration (5 seconds)
  if (shelterActive && millis() - shelterTimer > 5000) {
    shelterActive = false;
    showAlert("Shelter collapsed!", color(150, 100, 80));
  }
  
  // Check glitch effect duration (1 second)
  if (glitchEffect && millis() - glitchTimer > 1000) {
    glitchEffect = false;
  }
  
  // Check firewall duration (4 seconds)
  if (firewallActive && millis() - firewallTimer > 4000) {
    firewallActive = false;
    showAlert("Firewall disabled!", color(255, 100, 0));
  }
  
  // Check blood overlay duration (3 seconds)
  if (bloodOverlay && millis() - bloodOverlayTimer > 3000) {
    bloodOverlay = false;
  }
  
  // Secret stage timer
  if (secretStageActive && millis() - secretStageStartTime > secretStageTimer) {
    // Exit secret stage
    secretStageActive = false;
    multiplier = 1; // Reset multiplier
    showAlert("Returned from " + secretStageType, color(200, 200, 200));
    butterflies = []; // Clear butterflies
    jellyfish = []; // Clear jellyfish
    seaMines = []; // Clear sea mines
    bubbles = []; // Clear bubbles
    debris = []; // Clear debris
    toxicClouds = []; // Clear toxic clouds
    dustParticles = []; // Clear dust
    woozyActive = false; // Clear woozy effect
    shelterActive = false; // Clear shelter
    laserGrids = []; // Clear laser grids
    dataPackets = []; // Clear data packets
    scanLines = []; // Clear scan lines
    glitchEffect = false; // Clear glitch
    firewallActive = false; // Clear firewall
    demonMissiles = []; // Clear demon missiles
    flameWaves = []; // Clear flame waves
    hellFog = []; // Clear hell fog
    bloodOverlay = false; // Clear blood overlay
    satanActive = false; // Clear Satan
    // Stop ocean ambient when leaving Deep Sea
    if (typeof oceanSound !== 'undefined' && oceanSound && typeof oceanSound.stop === 'function') {
      try {
        oceanSound.stop();
      } catch (e) { }
    }
    // Stop meadow ambient when leaving Meadow
    if (typeof meadowSound !== 'undefined' && meadowSound && typeof meadowSound.stop === 'function') {
      try {
        meadowSound.stop();
      } catch (e) { }
    }
    // Stop demonic ambient when leaving Demonic
    if (typeof demonicSound !== 'undefined' && demonicSound && typeof demonicSound.stop === 'function') {
      try {
        demonicSound.stop();
      } catch (e) { }
    }
  }
  
  // Update butterflies in Endless Meadow
  for (let i = butterflies.length - 1; i >= 0; i--) {
    let butterfly = butterflies[i];
    butterfly.y += butterfly.speed;
    butterfly.x += sin(frameCount * 0.05 + butterfly.offset) * 2; // Gentle flutter
    
    // Reset butterfly when it goes off screen
    if (butterfly.y > height + 50) {
      butterfly.y = -50;
      butterfly.x = random(width);
    }
  }
  
  // Update jellyfish in Deep Sea
  for (let i = jellyfish.length - 1; i >= 0; i--) {
    let jelly = jellyfish[i];
    jelly.y += jelly.speed * jelly.direction;
    jelly.x += sin(frameCount * 0.03 + jelly.wobble) * 1.5; // Wobble side to side
    
    // Bounce up and down
    if (jelly.y > height + 50 || jelly.y < -50) {
      jelly.direction *= -1;
    }
    
    // Check collision with player
    if (collides(staler, jelly)) {
      if (!logImmunity) {
        gameOver = true;
      } else {
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Jellyfish resisted!", color(255, 255, 255));
          if (pearlProtection === 0) logImmunity = false;
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Immunity used!", color(255, 215, 0));
        }
        jellyfish.splice(i, 1);
      }
    }
  }
  
  // Update sea mines in Deep Sea
  for (let i = seaMines.length - 1; i >= 0; i--) {
    let mine = seaMines[i];
    mine.y += mine.speed;
    
    // Check collision with player
    if (collides(staler, mine)) {
      if (!logImmunity) {
        gameOver = true;
      } else {
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PEARL PROTECTION! Mine resisted!", color(255, 255, 255));
          if (pearlProtection === 0) logImmunity = false;
        } else {
          logImmunity = false;
          showAlert("BLESSED PROTECTION! Immunity used!", color(255, 215, 0));
        }
        seaMines.splice(i, 1);
      }
    }
    
    // Respawn at top when off screen
    if (mine.y > height + 50) {
      mine.y = -50;
      mine.x = random(width);
    }
  }
  
  // Update bubbles in Deep Sea
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    bubble.y -= bubble.speed; // Bubbles rise
    bubble.x += sin(frameCount * 0.05 + i) * 0.5; // Gentle drift
    
    // Reset when off screen
    if (bubble.y < -20) {
      bubble.y = height + 20;
      bubble.x = random(width);
    }
  }
  
  // Update debris in Apocalypse
  for (let i = debris.length - 1; i >= 0; i--) {
    let debrisChunk = debris[i];
    debrisChunk.y += debrisChunk.speed;
    debrisChunk.rotation += 0.05; // Spin as it falls
    
    // Check collision with player (unless protected by shelter)
    let inShelter = shelterActive && dist(staler.x, staler.y, shelterX, shelterY) < 80;
    if (collides(staler, debrisChunk) && !inShelter) {
      if (!logImmunity) {
        gameOver = true;
      } else {
        if (pearlProtection > 0) {
          pearlProtection--;
          showAlert("PROTECTION! Debris destroyed!", color(255, 255, 255));
          if (pearlProtection === 0) logImmunity = false;
        } else {
          logImmunity = false;
          showAlert("IMMUNITY used!", color(255, 215, 0));
        }
        debris.splice(i, 1);
      }
    }
    
    // Respawn at top when off screen
    if (debrisChunk.y > height + 100) {
      debrisChunk.y = -random(100, 400);
      debrisChunk.x = random(width);
      debrisChunk.size = random(25, 60); // Random size each respawn
    }
  }
  
  // Update toxic clouds in Apocalypse
  for (let i = toxicClouds.length - 1; i >= 0; i--) {
    let cloud = toxicClouds[i];
    
    if (!cloud.onGround) {
      cloud.y += cloud.speed;
      
      // Check if reached ground
      if (cloud.y >= height - 50) {
        cloud.onGround = true;
        cloud.lingerTimer = millis();
      }
    } else {
      // Cloud is lingering on ground
      if (millis() - cloud.lingerTimer > 2000) { // Linger for 2 seconds
        // Respawn at top
        cloud.y = -random(200, 600);
        cloud.x = random(width);
        cloud.onGround = false;
        cloud.lingerTimer = 0;
      }
    }
    
    // Check collision with player (unless protected by shelter)
    let inShelter = shelterActive && dist(staler.x, staler.y, shelterX, shelterY) < 80;
    if (collides(staler, cloud) && !inShelter) {
      let distanceToCenter = dist(staler.x, staler.y, cloud.x, cloud.y);
      
      if (distanceToCenter < cloud.size / 4) {
        // Deep in cloud - instant death
        if (!logImmunity) {
          gameOver = true;
        }
      } else {
        // Edge of cloud - woozy effect
        if (!woozyActive) {
          woozyActive = true;
          woozyTimer = millis();
          showAlert("WOOZY! Vision wobbling!", color(150, 200, 50));
        }
      }
    }
  }
  
  // Update dust particles in Apocalypse
  for (let i = dustParticles.length - 1; i >= 0; i--) {
    let dust = dustParticles[i];
    dust.x += dust.speedX;
    dust.y += dust.speedY;
    
    // Wrap around screen
    if (dust.x < 0) dust.x = width;
    if (dust.x > width) dust.x = 0;
    if (dust.y > height + 20) dust.y = -20;
  }
  
  // Update laser grids in Cyberspace (horizontal beams with gaps)
  for (let i = laserGrids.length - 1; i >= 0; i--) {
    let laser = laserGrids[i];
    
    // Move laser downward
    laser.y += laser.speed;
    
    // Respawn at top with new random pattern when off screen
    if (laser.y > height + 50) {
      let laserPatterns = [
        [200], [100], [300], [150, 250], [100, 300],
        [133, 266], [80, 200, 320], [100, 200, 300],
        [120, 280], [160, 240], [60, 340], [100, 180, 260, 340],
        [80, 160, 240, 320], [200, 300], [100, 200]
      ];
      laser.y = -50;
      laser.gaps = random(laserPatterns);
    }
    
    // Check collision with player (unless protected by firewall)
    if (!firewallActive) {
      let verticalHit = abs(staler.y - laser.y) < (laser.thickness + staler.size) / 2;
      
      if (verticalHit) {
        // Check if player is in a gap
        let inGap = false;
        for (let gapX of laser.gaps) {
          if (abs(staler.x - gapX) < (laser.gapWidth + staler.size) / 2) {
            inGap = true;
            break;
          }
        }
        
        // Only hit if NOT in a gap
        if (!inGap) {
          if (!logImmunity) {
            gameOver = true;
          } else {
            logImmunity = false;
            showAlert("IMMUNITY used! Laser dodged!", color(255, 215, 0));
          }
        }
      }
    }
  }
  
  // Update data packets in Cyberspace
  for (let i = dataPackets.length - 1; i >= 0; i--) {
    let packet = dataPackets[i];
    packet.y += packet.speed;
    packet.rotation += 0.1;
    
    // Check collision with player (unless protected by firewall)
    if (collides(staler, packet) && !firewallActive) {
      if (!logImmunity) {
        gameOver = true;
      } else {
        logImmunity = false;
        showAlert("IMMUNITY used!", color(255, 215, 0));
        dataPackets.splice(i, 1);
      }
    }
    
    // Respawn at top when off screen
    if (packet.y > height + 50) {
      packet.y = -50;
      packet.x = random(width);
    }
  }
  
  // Update scan lines in Cyberspace
  for (let i = scanLines.length - 1; i >= 0; i--) {
    let line = scanLines[i];
    line.y += line.speed;
    
    // Wrap around
    if (line.y > height + 10) {
      line.y = -10;
    }
  }
  
  // Update demon missiles in Demonic stage
  for (let i = demonMissiles.length - 1; i >= 0; i--) {
    let missile = demonMissiles[i];
    
    // Limited homing behavior (max 30° total)
    if (missile.homingUsed < missile.homingBudget) {
      // Calculate desired angle toward player
      let targetAngle = atan2(staler.y - missile.y, staler.x - missile.x);
      let angleDiff = targetAngle - missile.angle;
      
      // Normalize angle difference to -PI to PI
      while (angleDiff > PI) angleDiff -= TWO_PI;
      while (angleDiff < -PI) angleDiff += TWO_PI;
      
      // Max rotation per frame: 0.5° (radians(0.5))
      let maxRotation = radians(0.5);
      let rotation = constrain(angleDiff, -maxRotation, maxRotation);
      
      // Check if we have budget left
      if (abs(missile.homingUsed + rotation) <= missile.homingBudget) {
        missile.angle += rotation;
        missile.homingUsed += abs(rotation);
      }
    }
    
    // Move missile
    missile.x += cos(missile.angle) * missile.speed;
    missile.y += sin(missile.angle) * missile.speed;
    
    // Check collision with player (unless protected by firewall/blessed)
    if (dist(missile.x, missile.y, staler.x, staler.y) < (missile.size + staler.size) / 2) {
      if (!firewallActive && !logImmunity) {
        gameOver = true;
        showAlert("DEMON MISSILE HIT!", color(139, 0, 0));
      } else if (firewallActive) {
        showAlert("FIREWALL BLOCKED MISSILE!", color(255, 100, 0));
        demonMissiles.splice(i, 1);
      } else if (logImmunity) {
        logImmunity = false;
        showAlert("IMMUNITY used! Missile dodged!", color(255, 215, 0));
        demonMissiles.splice(i, 1);
      }
      continue;
    }
    
    // Remove if off screen - award points for dodging
    if (missile.x < -50 || missile.x > width + 50 || 
        missile.y < -50 || missile.y > height + 50) {
      score += 5 * multiplier; // 5 points (50 with 10x multiplier in Demonic)
      demonMissiles.splice(i, 1);
    }
  }
  
  // Spawn new missiles periodically in Demonic stage
  if (secretStageActive && secretStageType === "demonic" && frameCount % 40 === 0) {
    let spawnX, spawnY, targetAngle;
    // All missiles spawn from top
    spawnX = random(width);
    spawnY = -50;
    targetAngle = atan2(staler.y - spawnY, staler.x - spawnX);
    demonMissiles.push({
      x: spawnX,
      y: spawnY,
      speed: 3.5,
      angle: targetAngle,
      initialAngle: targetAngle,
      homingBudget: radians(10),
      homingUsed: 0,
      size: 25
    });
    console.log('Periodic missile spawned at', spawnX, spawnY);
  }
  
  // Update flame waves in Demonic stage
  for (let i = flameWaves.length - 1; i >= 0; i--) {
    let flame = flameWaves[i];
    flame.x += flame.speed;
    
    // Check collision with player
    if (abs(staler.x - flame.x) < (flame.width + staler.size) / 2) {
      if (!firewallActive && !logImmunity) {
        gameOver = true;
        showAlert("BURNED BY HELLFIRE!", color(255, 100, 0));
      } else if (firewallActive) {
        // Firewall protects but doesn't destroy flame
        showAlert("FIREWALL PROTECTS!", color(255, 100, 0));
      } else if (logImmunity) {
        logImmunity = false;
        showAlert("IMMUNITY used!", color(255, 215, 0));
      }
    }
    
    // Respawn from opposite side when off screen
    if ((flame.direction === 1 && flame.x > width + 100) ||
        (flame.direction === -1 && flame.x < -100)) {
      flame.x = flame.direction === 1 ? -100 : width + 100;
      flame.width = random(80, 100);
      flame.speed = random(6, 8) * flame.direction;
    }
  }
  
  // Update hell fog in Demonic stage
  for (let fog of hellFog) {
    fog.x += fog.speedX;
    fog.y += fog.speedY;
    
    // Wrap around
    if (fog.x < 0) fog.x = width;
    if (fog.x > width) fog.x = 0;
    if (fog.y < 0) fog.y = height;
    if (fog.y > height) fog.y = 0;
  }
  
  // Update Satan boss
  if (satanActive) {
    satanY += satanSpeed;
    
    // Check collision with player (300px wide = 150px radius)
    if (dist(width/2, satanY, staler.x, staler.y) < 150 + staler.size/2) {
      if (!logImmunity && !firewallActive) {
        gameOver = true;
        showAlert("CONSUMED BY SATAN!", color(0, 0, 0));
      } else if (firewallActive) {
        firewallActive = false;
        satanActive = false;
        showAlert("FIREWALL DESTROYED! SATAN REPELLED!", color(255, 100, 0));
      } else if (logImmunity) {
        logImmunity = false;
        satanActive = false;
        showAlert("DIVINE PROTECTION! SATAN BANISHED!", color(255, 215, 0));
      }
    }
    
    // Remove Satan when off screen
    if (satanY > height + 300) {
      satanActive = false;
    }
  }
  
  // Update smoke particles
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    let particle = smokeParticles[i];
    particle.life--;
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.speedY -= 0.02; // Smoke rises slightly
    
    if (particle.life <= 0) {
      smokeParticles.splice(i, 1);
    }
  }
}

function collides(a, b) {
  return dist(a.x, a.y, b.x, b.y) < (a.size + b.size) / 2;
}

function collidesWithRect(circle, rx, ry, rw, rh) {
  const cx = constrain(circle.x, rx, rx + rw);
  const cy = constrain(circle.y, ry, ry + rh);
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return dx * dx + dy * dy < (circle.size / 2) * (circle.size / 2);
}

function drawScore() {
  textFont('Courier New');
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("SCORE: " + score, 10, 25);
  
  // World Record display
  fill(255, 215, 0);
  textSize(14);
  text("WORLD RECORD: " + worldRecord, 10, 45);
}

function showAlert(msg, col) {
  alertMessage = msg;
  alertColor = col;
  alertTimer = 60;
}

function showLevelPopup(title, subtitle, horse) {
  levelPopup.title = title || '';
  levelPopup.subtitle = subtitle || '';
  levelPopup.horse = horse || 1;
  levelPopup.start = millis();
  levelPopup.active = true;
}

function drawLevelPopup() {
  if (!levelPopup.active) return;
  let elapsed = millis() - levelPopup.start;
  if (elapsed > levelPopup.duration) {
    levelPopup.active = false;
    return;
  }
  push();
  // Fade out near end
  let alpha = 255;
  if (elapsed > levelPopup.duration - 300) {
    alpha = map(elapsed, levelPopup.duration - 300, levelPopup.duration, 255, 0);
  }

  // Layout
  let boxW = width * 0.9;
  let boxX = (width - boxW) / 2;
  let boxY = 8;
  let iconArea = 96; // space reserved for horse icon
  let paddingRight = 16;
  let textAreaW = boxW - iconArea - paddingRight - 20;

  // Helper: wrap text into lines that fit textAreaW
  function wrapLines(str, size) {
    textSize(size);
    let words = (str || '').split(/\s+/);
    let lines = [];
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      let w = words[i];
      if (cur === '') {
        cur = w;
      } else {
        let test = cur + ' ' + w;
        if (textWidth(test) <= textAreaW) {
          cur = test;
        } else {
          lines.push(cur);
          cur = w;
        }
      }
    }
    if (cur !== '') lines.push(cur);
    if (lines.length === 0) lines.push('');
    return lines;
  }

  let titleSize = 18;
  let subSize = 12;
  let titleLines = wrapLines(levelPopup.title, titleSize);
  let subLines = wrapLines(levelPopup.subtitle, subSize);

  let lhTitle = titleSize + 6;
  let lhSub = subSize + 6;
  let boxH = max(84, 12 + titleLines.length * lhTitle + subLines.length * lhSub + 12);

  // background
  fill(20, 20, 30, 220 * (alpha / 255));
  noStroke();
  rect(boxX, boxY, boxW, boxH, 8);

  // Draw horse icon on left (vertically centered)
  push();
  let iconX = boxX + iconArea / 2;
  let iconY = boxY + boxH / 2 + 6;
  translate(iconX, iconY);
  let s = 0.5;
  scale(s);
  drawAerialHorse(0, 0, 0.6);
  pop();

  // Draw text lines
  textAlign(LEFT, TOP);
  let textX = boxX + iconArea + 12;
  let textY = boxY + 10;
  fill(255, alpha);
  textSize(titleSize);
  for (let i = 0; i < titleLines.length; i++) {
    text(titleLines[i], textX, textY);
    textY += lhTitle;
  }
  fill(200, alpha);
  textSize(subSize);
  for (let j = 0; j < subLines.length; j++) {
    text(subLines[j], textX, textY);
    textY += lhSub;
  }

  pop();
}

function drawAlert() {
  if (alertTimer > 0) {
    fill(alertColor);
    textSize(26);
    textAlign(CENTER);
    text(alertMessage, width / 2, height / 2 - 100);
    alertTimer--;
  }
}

function drawSmokeCloud() {
  if (smokeCloud && smokeParticles.length > 0) {
    // Draw smoke particles
    for (let particle of smokeParticles) {
      push();
      let alpha = map(particle.life, 0, particle.maxLife, 0, 120);
      fill(80, 80, 80, alpha); // Dark gray smoke
      noStroke();
      ellipse(particle.x, particle.y, particle.size);
      
      // Add some variation with lighter smoke
      fill(120, 120, 120, alpha * 0.6);
      ellipse(particle.x - 2, particle.y - 2, particle.size * 0.7);
      pop();
    }
    
    // Add overall screen tint for smoke effect
    push();
    fill(60, 60, 60, 30);
    rect(0, 0, width, height);
    pop();
  }
}

function drawRoboGrabAnimation() {
  if (!roboGrabActive) return;
  
  let elapsed = millis() - roboGrabTimer;
  let netDuration = 20; // Net shooting phase: 20ms
  let armDuration = 780; // Arm grabbing phase: 780ms
  let totalDuration = netDuration + armDuration; // Total: 800ms
  
  if (elapsed > totalDuration) {
    // Animation complete - cleanup
    roboGrabActive = false;
    roboGrabbedApples = [];
    return;
  }
  
  push();
  
  // PHASE 1: Net shooting (0-20ms)
  if (elapsed <= netDuration) {
    let netProgress = elapsed / netDuration;
    
    for (let i = 0; i < roboGrabbedApples.length; i++) {
      let storedApple = roboGrabbedApples[i];
      
      // Draw net projectile shooting toward apple (from fixed starting position)
      let netX = lerp(roboGrabStartX, storedApple.x, netProgress);
      let netY = lerp(roboGrabStartY, storedApple.y, netProgress);
      
      // Draw spinning net
      push();
      translate(netX, netY);
      rotate(netProgress * TWO_PI * 4);
      stroke(200, 200, 200);
      strokeWeight(2);
      noFill();
      // Web spokes
      for (let j = 0; j < 8; j++) {
        let angle = (TWO_PI / 8) * j;
        line(0, 0, cos(angle) * 15, sin(angle) * 15);
      }
      // Concentric circles
      ellipse(0, 0, 30);
      ellipse(0, 0, 20);
      ellipse(0, 0, 10);
      pop();
      
      // Mark as netted when net reaches the apple
      if (netProgress >= 0.95) {
        storedApple.netted = true;
      }
    }
    
    pop();
    return;
  }
  
  // PHASE 2: Arm grabbing (20-800ms)
  let armElapsed = elapsed - netDuration;
  let armProgress = armElapsed / armDuration;
  
  stroke(150, 150, 150);
  strokeWeight(3);
  
  for (let i = 0; i < roboGrabbedApples.length; i++) {
    let storedApple = roboGrabbedApples[i];
    
    // Skip if already grabbed
    if (storedApple.grabbed) continue;
    
    // Find the current position of this apple in the apples array
    let currentApple = null;
    for (let j = 0; j < apples.length; j++) {
      if (apples[j].type === storedApple.type && 
          abs(apples[j].x - storedApple.initialX) < 50 &&
          abs(apples[j].y - storedApple.initialY) < 200) {
        currentApple = apples[j];
        storedApple.appleIndex = j;
        break;
      }
    }
    
    // If we can't find the apple anymore, skip it
    if (!currentApple) continue;
    
    // Update stored position to current position
    storedApple.x = currentApple.x;
    storedApple.y = currentApple.y;
    
    // Draw net around the immobilized apple
    push();
    translate(currentApple.x, currentApple.y);
    stroke(200, 200, 200);
    strokeWeight(1.5);
    noFill();
    // Web spokes
    for (let j = 0; j < 8; j++) {
      let angle = (TWO_PI / 8) * j;
      line(0, 0, cos(angle) * 18, sin(angle) * 18);
    }
    // Concentric circles
    ellipse(0, 0, 36);
    ellipse(0, 0, 24);
    ellipse(0, 0, 12);
    pop();
    
    // Calculate arm extension based on distance (closer apples get reached faster)
    let distance = dist(roboGrabStartX, roboGrabStartY, currentApple.x, currentApple.y);
    let maxDistance = 600; // Approximate max distance on screen
    let distanceFactor = distance / maxDistance;
    // All apples reached by end, but closer ones reached sooner
    let reachProgress = constrain(armProgress / (0.5 + distanceFactor * 0.5), 0, 1);
    let armX = lerp(roboGrabStartX, currentApple.x, reachProgress);
    let armY = lerp(roboGrabStartY, currentApple.y, reachProgress);
    
    // Check if hand has reached the apple (90% of the way)
    if (reachProgress > 0.9) {
      storedApple.grabbed = true;
      
      // Store values before removing apple
      let appleType = currentApple.type;
      let appleX = currentApple.x;
      let appleY = currentApple.y;
      let points = 0;
      
      if(appleType === "cursed-robo" || appleType === "fairchild") {
        // cursed-robo gives no points when grabbed by robo
      } else {
        // Calculate points for each apple
        if(appleType === "gold") points = 1;
        else if(appleType === "platinum") points = 5;
        else if(appleType === "mint") points = 2;
        else if(appleType === "magic") points = 20;
        else if(appleType === "queztelkonatol") points = 1000 ;
        else if(appleType === "obsidian") points = 1 ;
        else if(appleType === "stone") points = 1 ;
        else if(appleType === "dizzy") points = 3 ;
        else if(appleType === "sticky") points = 1 ;
        else if(appleType === "bubble") points = 1;
        else if(appleType === "super-cursed") points = 5 ;
        else if(appleType === "blessed") points = 10 ;
        else if(appleType === "diamond") points = 20 ;
        else if(appleType === "concrete") points = -5;
        else if(appleType === "santa") points = 30 ;
        else if(appleType === "decoration") points = 20 ;
       // else if(appleType === "fairchild") points = 1;
       // just following the mantra: if you want big juicy apple with multiplier, go grab it yourself
        else if(appleType === "nut") {
          if(isAllergic) {
            points = -25;
          } else {
            points = 20 * multiplier;
          }
        } else {
          points = 1 * multiplier; // Default
        }
        score += points;
      }
      
      // Remove this apple from the apples array using stored position
      for(let k = apples.length - 1; k >= 0; k--) {
        if(apples[k].type === appleType && 
           abs(apples[k].x - appleX) < 20 && 
           abs(apples[k].y - appleY) < 20) {
          apples.splice(k, 1);
          break;
        }
      }
      continue; // Skip drawing since it's grabbed
    }
    
    // Draw arm to current apple position (from fixed starting position)
    // Draw mechanical arm line
    stroke(100, 200, 255, 200); // Cyan robotic color
    line(roboGrabStartX, roboGrabStartY, armX, armY);
    
    // Draw grabber claw at end of arm
    if (reachProgress > 0.3) {
      push();
      translate(armX, armY);
      let clawRotation = reachProgress * TWO_PI * 2; // Spinning claw
      rotate(clawRotation);
      
      // Claw opening/closing animation
      let clawOpen = sin(reachProgress * PI * 4) * 5 + 5;
      
      // Draw three-pronged claw
      stroke(150, 150, 150);
      strokeWeight(2);
      for (let j = 0; j < 3; j++) {
        let angle = (TWO_PI / 3) * j;
        let clawX = cos(angle) * clawOpen;
        let clawY = sin(angle) * clawOpen;
        line(0, 0, clawX, clawY);
        // Claw tips
        fill(255, 200, 0);
        noStroke();
        ellipse(clawX, clawY, 3);
        stroke(150, 150, 150);
        strokeWeight(2);
      }
      pop();
      
      // Energy pulse effect around apple being grabbed
      if (reachProgress > 0.7) {
        noFill();
        stroke(100, 200, 255, 150 * (1 - reachProgress));
        strokeWeight(2);
        let pulseSize = map(reachProgress, 0.7, 1, 10, 30);
        ellipse(currentApple.x, currentApple.y, pulseSize);
      }
    }
  }
  
  // Central hub glow on player (at fixed starting position)
  noStroke();
  fill(100, 200, 255, 100 * sin(armProgress * PI));
  ellipse(roboGrabStartX, roboGrabStartY, 50 * armProgress);
  
  pop();
}

function drawRetroEffects() {
  // CRT Scanlines effect
  push();
  stroke(0, 0, 0, 30);
  strokeWeight(1);
  for (let y = 0; y < height; y += 3) {
    line(0, y, width, y);
  }
  noStroke();
  
  // Screen vignette (darker edges like old TV)
  fill(0, 0, 0, 40);
  rect(0, 0, width, 20); // Top
  rect(0, height - 20, width, 20); // Bottom
  rect(0, 0, 20, height); // Left
  rect(width - 20, 0, 20, height); // Right
  
  // Subtle screen flicker
  if (frameCount % 60 === 0) {
    fill(255, 255, 255, 10);
    rect(0, 0, width, height);
  }
  
  // Retro mode label
  fill(210, 180, 140);
  textSize(10);
  textFont('monospace');
  textAlign(RIGHT);
  text("RETRO MODE", width - 10, 15);
  text("JERRY LAWSON", width - 10, 27);
  textAlign(LEFT);
  
  // Pixelation overlay effect (subtle grid)
  stroke(0, 0, 0, 15);
  strokeWeight(1);
  for (let x = 0; x < width; x += 8) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 8) {
    line(0, y, width, y);
  }
  noStroke();
  
  pop();
}

function drawGameOverScreen() {
  // Check if this is a 404 error game over
  if (error404Triggered && score === 404) {
    // 404 Error Page Style
    background(255);
    
    // Error code
    fill(220, 220, 220);
    textSize(150);
    textAlign(CENTER);
    textFont('monospace');
    text("404", width / 2, height / 2 - 80);
    
    // Error message
    fill(100);
    textSize(24);
    text("ERROR: POINTS NOT FOUND", width / 2, height / 2);
    
    // Sad broken apple icon
    push();
    translate(width / 2, height / 2 + 60);
    scale(2.5); // Make it bigger
    
    // Left broken piece - red apple half
    fill(220, 20, 60);
    ellipse(-15, 0, 30, 35);
    // Crack edge on left piece
    fill(180, 50, 50);
    triangle(-15, -17, -15, 17, 0, 10);
    triangle(-15, -17, -15, 17, 0, -10);
    // X eye on left piece
    stroke(0);
    strokeWeight(2);
    line(-20, -5, -15, 0);
    line(-15, -5, -20, 0);
    
    // Right broken piece - red apple half
    noStroke();
    fill(220, 20, 60);
    ellipse(15, 0, 30, 35);
    // Crack edge on right piece
    fill(180, 50, 50);
    triangle(15, -17, 15, 17, 0, 10);
    triangle(15, -17, 15, 17, 0, -10);
    // X eye on right piece
    stroke(0);
    strokeWeight(2);
    line(15, -5, 20, 0);
    line(20, -5, 15, 0);
    
    // Broken stem
    noStroke();
    fill(101, 67, 33);
    rect(-18, -18, 3, 6);
    rect(15, -18, 3, 6);
    
    // Little particles around the break
    fill(220, 20, 60, 150);
    ellipse(-5, -8, 3);
    ellipse(5, 8, 3);
    ellipse(0, -12, 2);
    ellipse(0, 12, 2);
    
    noStroke();
    pop();
    
    // Footer text
    fill(150);
    textSize(10);
    textFont('Courier New');
    text("The page you are looking for has been eaten by a horse.", width / 2, height - 80);
    text("Error Code: APPLE_NOT_FOUND", width / 2, height - 60);
    text("Please restart the game to continue.", width / 2, height - 40);
    
    return; // Exit early, don't show normal game over screen
  }
  
  // Normal game over screen
  background(10);
  fill(255, 0, 0);
  textSize(40);
  textAlign(CENTER);
  text("⚔ GAME OVER ⚔", width / 2, height / 2 - 30);
  textSize(24);
  fill(255);
  text("Final Score: " + score, width / 2, height / 2 + 10);

  // Show Certificate of Excellence for 750+ points
  if (score >= 750 && score < 40000) { // only get certificate if in cyber range
    // Ask user if they want to print (only once)
    let printCert = false;
    if (!haveShownPrintCert) {
      printCert = confirm("You've earned a Certificate of Excellence! Do you want to print it?");
      haveShownPrintCert = true; // Set flag immediately after asking
    }
    
    createCanvas(786, windowHeight/2);
    background('lightblue');
    textFont('cursive');
    textSize(75);
    fill('black');
    text('Certificate of Excellence', (786-40)/2, 75);
    rect(((786)/2)+ 130, 300, 150, 3);
    textSize(30); 
    text('Marko Sapienti', ((786-60)/2)+ 130 + 150/2, 285);
    textFont('New Courier');
    textSize(20);
    text('creator of the game', ((786-40)/2)+ 130 + 150/2, 320);

    fill('brown');
    rect(340, 250, 15, 45); 
    rect(360, 250, 15, 45); // Draws the horse's legs

    push();
    translate(786/2, height / 2- 40);
    scale(-1, 1);           // Flip horizontally
    rotate(45 * PI / 180);
    
    rect(-30, 30, 15, 45); 
    rect(-10, 30, 15, 45); 
    ellipse(0, 0, 150, 80);
    ellipse(-130, 15, 30, 50);
    fill('rgb(105,29,29)');
    rect(-130, -17, 60, 20);
    fill('brown'); 
    rect(-130, -10, 60, 20);
    pop();
 
    fill('black');
    text('For earning ' + score + ' points', 160, 280);
    text('In the game of Horz Harvest', 160, 300);
    textFont('cursive');
    textSize(15);
    text('you have recieved the honor of a true gamer', 160, 320);
    text('version 1.8.25', 160, 340);
    
    // Only print if user confirmed
    if (printCert) {
      print();
    }
  }
  
  // Show Royal Reward of Gaming for 15000+ points
  if (score >= 40000) {
    // Ask user if they want to print (only once)
    let printRoyalCert = false;
    if (!haveShownPrintRoyalCert) {
      printRoyalCert = confirm("You've earned the Royal Reward of Gaming! Do you want to print it?");
      
      // If they said no, double check with them
      if (!printRoyalCert) {
        printRoyalCert = !confirm("Are you sure you don't want to print this prestigious certificate? This is a rare honor!");
      }
      
      haveShownPrintRoyalCert = true; // Set flag immediately after asking
    }
    
    createCanvas(826, windowHeight / 2);
    noStroke();
    background('gold');

    fill('black');
    textFont('signature');
    textSize(40);
    text('Certificate of The Royal Reward of Gaming', 400, 40);
    textSize(20);
    textFont('cursive');
    text('even the royals bow to you, the true king of gamers', 350, 70);
    
    textFont('verdana');
    textSize(25);
    textFont('signature');
    text('signed', 680, 100);
    rect(625, 110, 95, 3);
    textFont('cursive');
    textSize(15);
    fill('navy');

    text('Rubberhorse', 680, 130);
    text('Horse', 680, 145);
    text('Marcus Sapienti', 680, 160);
    text('Clay', 680, 175);
    text('Marko Yavorsky', 680, 190);
    text('Enzo Gamez', 680, 205);
    text('Equintel', 680, 220);
    text('Queztelkonatol', 680, 235);
    text('Happekin', 680, 250);
    text('Blade', 680, 265);
    text('Truthvie', 680, 280);

    fill('black');
    text('honor of any gamer in Horseland. ', 130, 150);
    text(' You are truly honored as a the king  ', 130, 165);
    text('of gamers. Their most equine majesties ', 130, 180);
    text('bestow the honor of living in the Noble ', 130, 195);
    text('Village in Horse City. this reward ', 130, 210);
    text('may be used as a royal diploma. ', 130, 225);
    text('This reward may be cashed in for ', 130, 240);
    text('1000 Horsecoins at the palace, however,', 130, 255);
    text('you may still keep the certificate', 130, 270);

    stroke(1.5);
    fill('rgb(255,169,169)');
    circle(826 / 2, windowHeight / 4, 200);
    fill('royalblue');
    circle(826 / 2, windowHeight / 4, 175);
    fill('gold');
    noStroke();

    // --------insert hay stack here------------
    push();
    // The original wheat bundle height ~150px from -130 to 20, scale to 120 px
    let scaleFactor = 75 / 150; 
    // Place bundle bottom at y=180, so translate to y=180 - (20 * scaleFactor)
    translate(826 / 2, 180 - 20 * scaleFactor+20);
    scale(scaleFactor);
    drawWheatBundle();
    pop();

    textSize(120);
    text('⚔️', 826 / 2, windowHeight / 4 + 55);
    textSize(20);
    textFont('cursive');
    let yt = 365;
    let xt = 826 / 2;
    fill('black');
    text('for the score of '+ score + ' in the game of Horz Harvest', xt, yt);
   text('version 1.7.25', xt, yt + 20);
   
   // Only print if user confirmed
   if (printRoyalCert) {
     print();
   }
  }
}

// The wheat bundle drawing code (unchanged from before):
function drawWheatBundle() {
  push();
translate(0,60); // Adjust position to center the bundle
  // Draw wheat heads using golden triangles
  fill('gold');
  for (let i = -40; i <= 40; i += 10) {
    drawWheatHead(i, -105);
  }

  // Draw the top overlapping ovals of the bundle (top to mid section)
  fill('gold');
  beginShape();
  vertex(-35, -100);
  bezierVertex(-60, -110, -50, -130, 0, -120);
  bezierVertex(50, -130, 60, -110, 35, -100);
  bezierVertex(30, -80, -30, -80, -35, -100);
  endShape(CLOSE);

  beginShape();
  vertex(-25, -80);
  bezierVertex(-40, -90, -30, -105, 0, -100);
  bezierVertex(30, -105, 40, -90, 25, -80);
  bezierVertex(20, -65, -20, -65, -25, -80);
  endShape(CLOSE);

  beginShape();
  vertex(-20, -65);
  bezierVertex(-30, -75, -20, -90, 0, -85);
  bezierVertex(20, -90, 30, -75, 20, -65);
  bezierVertex(15, -50, -15, -50, -20, -65);
  endShape(CLOSE);

  // Middle bundle (straight)
  rectMode(CENTER);
  rect(0, -45, 35, 40);

  stroke (1)
  // Red band (X section)
  fill('red');
  rect(0, -25, 35, 10);

  noStroke ()
  // Bottom part of the bundle
  fill('gold');
  rect(0, -10, 35, 20);

  pop();
}

function drawWheatHead(xOffset, yOffset) {
  push();
  translate(xOffset, yOffset);
  beginShape();
  vertex(0, 0);
  vertex(-5, -15);
  vertex(0, -30);
  vertex(5, -15);
  endShape(CLOSE);
  pop();
}

function drawAppleAlmanac() {
  background(40, 30, 20); // Dark brown parchment background
  
  // Parchment texture
  for (let i = 0; i < 50; i++) {
    fill(60, 50, 40, 10);
    ellipse(random(width), random(height), random(30, 80));
  }
  
  // Title
  fill(255, 215, 0);
  textSize(32);
  textAlign(CENTER);
  textFont('Georgia');
  text("🍎 APPLE ALMANAC 🍎", width / 2, 35);
  
  // Subtitle
  fill(200, 180, 150);
  textSize(12);
  text("Press TAB to close | Use ↑↓ arrows to scroll", width / 2, 55);
  
  // Apple encyclopedia data - organized by stage
  let appleData = [
    // === ALL STAGES (Common) ===
    { type: "gold", name: "Gold Apple", desc: "A standard golden fruit", points: "+1", rarity: "●", stage: "All Stages" },
    { type: "mint", name: "Mint Apple", desc: "Fresh and minty", points: "+2", rarity: "●", stage: "All Stages" },
    { type: "rotten", name: "Rotten Apple", desc: "Spoiled and foul", points: "-1", rarity: "●", stage: "All Stages" },
    { type: "platinum", name: "Platinum Apple", desc: "Shiny metallic treasure", points: "+5", rarity: "●●", stage: "All Stages" },
    { type: "sticky", name: "Sticky Apple", desc: "Can't move for 3s!", points: "+1", rarity: "●●", stage: "All Stages" },
    { type: "dizzy", name: "Dizzy Apple", desc: "Screen shakes wildly", points: "+3", rarity: "●●", stage: "All Stages" },
    { type: "obsidian", name: "Obsidian Apple", desc: "Clears all logs", points: "+1", rarity: "●●", stage: "All Stages" },
    { type: "brick", name: "Brick Apple", desc: "Solid brick damage", points: "-10", rarity: "●●", stage: "All Stages" },
    { type: "bubble", name: "Bubble Apple", desc: "Random effect", points: "±3", rarity: "●●", stage: "All Stages" },
    { type: "stone", name: "Stone Apple", desc: "Slows all logs", points: "+1", rarity: "●●", stage: "All Stages" },
    { type: "magic", name: "Magic Apple", desc: "Clears logs, no obstacles", points: "+20", rarity: "●●●", stage: "All Stages" },
    { type: "frenzy", name: "Frenzy Apple", desc: "2x apple spawn for 3s", points: "+5", rarity: "●●", stage: "All Stages" },
    { type: "risky-road", name: "Entrepreneur Apple", desc: "5s: only $50 or -$75 apples", points: "0", rarity: "●●", stage: "All Stages" },
    { type: "fat", name: "Fat Appel", desc: "makes you need physical therapy", points: "0", rarity: "●●", stage: "All Stages" },
    { type: "portal-meadow", name: "Meadow Portal", desc: "Enter the Endless Meadow!", points: "Portal", rarity: "●●●●●●", stage: "Default Stage" },
    { type: "cursed", name: "Cursed Apple", desc: "Turns all apples rotten", points: "Curse", rarity: "●●●", stage: "All Stages" },
    { type: "blessed", name: "Blessed Apple", desc: "Immune to next log hit", points: "+10", rarity: "●●●", stage: "All Stages" },
    { type: "diamond", name: "Diamond Apple", desc: "Brilliant crystalline gem", points: "+20", rarity: "●●●●", stage: "All Stages" },
    { type: "ruby", name: "Ruby Apple", desc: "Doubles your entire score!", points: "x2", rarity: "●●●●●", stage: "All Stages" },
    { type: "super-cursed", name: "Super Cursed", desc: "Logs invisible for 5s", points: "0", rarity: "●●●●●", stage: "All Stages" },
    { type: "queztelkonatol", name: "Queztelkonatol", desc: " massive reward", points: "+1000", rarity: "●●●●●●", stage: "All Stages" },
    
    // === CYBER STAGE (Stage 3) ===
    { type: "bomb", name: "Bomb", desc: "INSTANT GAME OVER!", points: "DEATH", rarity: "●●●", stage: "Cyber Stage" },
    { type: "robo", name: "Robo Apple", desc: "Grabs all apples for points", points: "Varies", rarity: "●●●", stage: "Cyber Stage" },
    { type: "cursed-robo", name: "Cursed Robo", desc: "Steals all apples & points", points: "Curse", rarity: "●●●●", stage: "Cyber Stage" },
    { type: "concrete", name: "Concrete Apple", desc: "Turns apples → brick (5s)", points: "-5", rarity: "●●", stage: "Cyber Stage" },
    
    // === AQUATIC STAGE (Stage 4) ===
    { type: "seashell-common", name: "Common Seashell", desc: "Basic ocean treasure", points: "3-10", rarity: "●●", stage: "Aquatic Stage" },
    { type: "seashell-rare", name: "Rare Seashell", desc: "Valuable shell", points: "10-30", rarity: "●●●", stage: "Aquatic Stage" },
    { type: "seashell-legendary", name: "Legendary Seashell", desc: "Mythic ocean gem", points: "50-100", rarity: "●●●●●", stage: "Aquatic Stage" },
    { type: "pearl", name: "Pearl Apple", desc: "3 rounds of protection", points: "+15", rarity: "●●●●", stage: "Aquatic Stage" },
    { type: "portal-deepsea", name: "Deep Sea Portal", desc: "Enter the Deep Sea realm!", points: "Portal", rarity: "●●●●●●", stage: "Aquatic Stage" },
    
    // === VOLCANIC STAGE (Stage 5) ===
    { type: "magma", name: "Magma Apple", desc: "Melts all obstacles", points: "+25", rarity: "●●●", stage: "Volcanic Stage" },
    { type: "ember", name: "Ember Apple", desc: "Creates fire trail", points: "+15", rarity: "●●", stage: "Volcanic Stage" },
    { type: "ash", name: "Ash Apple", desc: "Smoke obscures vision", points: "-5", rarity: "●", stage: "Volcanic Stage" },
    { type: "sulfur", name: "Sulfur Apple", desc: "Increases lava spawn rate", points: "0", rarity: "●●●●", stage: "Volcanic Stage" },
    
    // === SECRET STAGES ===
    { type: "clover", name: "Clover Apple", desc: "Lucky 4-leaf charm", points: "+15 (×1.5)", rarity: "●●", stage: "Endless Meadow" },
    { type: "honey", name: "Honey Apple", desc: "Sweet golden nectar", points: "+20 (×1.5)", rarity: "●●", stage: "Endless Meadow" },
    { type: "butterfly", name: "Butterfly Apple", desc: "Graceful and light", points: "+10 (×1.5)", rarity: "●●", stage: "Endless Meadow" },
    { type: "giant-pearl", name: "Giant Pearl", desc: "Massive lustrous gem", points: "+50 (×2.5)", rarity: "●●●", stage: "Deep Sea" },
    { type: "bioluminescent", name: "Bioluminescent", desc: "Glowing deep sea treasure", points: "+30 (×2.5)", rarity: "●●", stage: "Deep Sea" },
    { type: "coral", name: "Coral Apple", desc: "Spawns 3 mini corals", points: "+10 (×2.5) +bonus", rarity: "●●", stage: "Deep Sea" },
    { type: "portal-apocalypse", name: "Apocalypse Portal", desc: "Enter the wasteland!", points: "Portal", rarity: "●●●●●●", stage: "Volcanic Stage" },
    { type: "radiation", name: "Radiation Apple", desc: "Toxic glow, blinds briefly", points: "+35 (×3)", rarity: "●●●", stage: "Apocalypse" },
    { type: "survivor", name: "Survivor Apple", desc: "Rusty can, grants immunity", points: "+25 (×3)", rarity: "●●", stage: "Apocalypse" },
    { type: "fallout", name: "Fallout Apple", desc: "Spawns shelter bunker", points: "+40 (×3)", rarity: "●●●●", stage: "Apocalypse" },
    { type: "portal-cyberspace", name: "Cyberspace Portal", desc: "Enter the digital realm!", points: "Portal", rarity: "●●●●●●", stage: "Cyber Stage" },
    { type: "data", name: "Data Apple", desc: "Downloads digital points", points: "+45 (×5)", rarity: "●●", stage: "Cyberspace" },
    { type: "glitch", name: "Glitch Apple", desc: "Random score change ±50", points: "±50 (×5)", rarity: "●●●", stage: "Cyberspace" },
    { type: "firewall", name: "Firewall Apple", desc: "Shield protection 4s", points: "+30 (×5)", rarity: "●●●●", stage: "Cyberspace" },
    { type: "portal-demonic", name: "Demonic Portal", desc: "Enter Hell itself!", points: "Portal", rarity: "●●●●●●●", stage: "Holy Stage" },
    { type: "sacrifice", name: "Sacrifice Apple", desc: "Destroys missiles, grants immunity", points: "-50 + 3s immunity", rarity: "●●●", stage: "Demonic" },
    { type: "inferno", name: "Inferno Apple", desc: "Blazing reward, spawns missiles", points: "+100 (×10)", rarity: "●●●", stage: "Demonic" },
    { type: "blood", name: "Blood Apple", desc: "Obscures vision with blood", points: "+75 (×10)", rarity: "●●●", stage: "Demonic" },
    { type: "soul", name: "Soul Apple", desc: "Captured soul, pure light", points: "+200 (×10)", rarity: "●●●●", stage: "Demonic" },
    { type: "satan", name: "Satan Apple", desc: "No one has lived to tell the tale", points: "+500 (×10)", rarity: "●●●●●●", stage: "Demonic" },
  ];
  
  // Calculate total content height and max scroll
  let rowHeight = 70;
  let totalRows = Math.ceil(appleData.length / 2);
  let contentHeight = 80 + totalRows * rowHeight;
  let maxScroll = max(0, contentHeight - height + 20);
  
  // Clamp scroll within bounds
  almanacScroll = constrain(almanacScroll, 0, maxScroll);
  
  // Draw apple entries in a grid with scroll offset
  let startY = 80 - almanacScroll;
  let col1X = 50;
  let col2X = 225;
  
  for (let i = 0; i < appleData.length; i++) {
    let apple = appleData[i];
    let isLeftColumn = (i % 2 === 0);
    let x = isLeftColumn ? col1X : col2X;
    let y = startY + Math.floor(i / 2) * rowHeight;
    
    // Only draw if visible on screen
    if (y > -70 && y < height + 70) {
      // Entry background
      fill(60, 50, 40, 100);
      rect(x - 5, y - 5, 160, 60, 5);
      
      // Draw animated apple sprite (smaller scale)
      push();
      translate(x + 20, y + 25);
      scale(0.8);
      drawAppleSprite(apple.type, 20);
      pop();
      
      // Apple info
      fill(255, 235, 205);
      textAlign(LEFT);
      textSize(11);
      textFont('Arial');
      text(apple.name, x + 45, y + 10);
      
      fill(180, 160, 140);
      textSize(8);
      text(apple.desc, x + 45, y + 23);
      
      fill(255, 215, 0);
      textSize(9);
      text(apple.points, x + 45, y + 36);
      
      fill(200, 200, 200);
      textSize(7);
      text(apple.rarity, x + 45, y + 46);
      
      fill(100, 180, 255);
      textSize(7);
      text(apple.stage, x + 45, y + 55);
    }
  }
  
  // Draw scrollbar if content is scrollable
  if (maxScroll > 0) {
    let scrollbarHeight = height * 0.7;
    let scrollbarY = 70;
    let thumbHeight = (height / contentHeight) * scrollbarHeight;
    let thumbY = scrollbarY + (almanacScroll / maxScroll) * (scrollbarHeight - thumbHeight);
    
    // Scrollbar track
    fill(80, 70, 60, 100);
    rect(width - 15, scrollbarY, 10, scrollbarHeight, 5);
    
    // Scrollbar thumb
    fill(150, 130, 110, 200);
    rect(width - 15, thumbY, 10, thumbHeight, 5);
  }
}

function drawAppleSprite(type, size) {
  // Use actual game drawing functions for high-quality almanac sprites
  switch(type) {
    case "gold": drawGoldApple(size); break;
    case "platinum": drawPlatinumApple(size); break;
    case "ruby": drawRubyApple(size); break;
    case "diamond": drawDiamondApple(size); break;
    case "mint": drawMintApple(size); break;
    case "rotten": drawRottenApple(size); break;
    case "magic": drawMagicApple(size); break;
    case "cursed": drawCursedApple(size); break;
    case "super-cursed": drawSuperCursedApple(size); break;
    case "queztelkonatol": drawQueztelkonatolApple(size); break;
    case "obsidian": drawObsidianApple(size); break;
    case "bomb": drawBombApple(size); break;
    case "blessed": drawBlessedApple(size); break;
    case "sticky": drawStickyApple(size); break;
    case "dizzy": drawDizzyApple(size); break;
    case "brick": drawBrickApple(size); break;
    case "bubble": drawBubbleApple(size); break;
    case "stone": drawStoneApple(size); break;
    case "robo": drawRoboApple(size); break;
    case "cursed-robo": drawCursedRoboApple(size); break;
    case "concrete": drawConcreteApple(size); break;
    case "magma": drawMagmaApple(size); break;
    case "ember": drawEmberApple(size); break;
    case "ash": drawAshApple(size); break;
    case "sulfur": drawSulfurApple(size); break;
    case "seashell-common": drawSeashellCommonApple(size); break;
    case "seashell-rare": drawSeashellRareApple(size); break;
    case "seashell-legendary": drawSeashellLegendaryApple(size); break;
    case "pearl": drawPearlApple(size); break;
    case "frenzy": drawFrenzyApple(size); break;
    case "risky-road": drawRiskyRoadApple(size); break;
    case "fat": drawFatApple(size); break;
    case "portal-meadow": drawPortalMeadowApple(size); break;
    case "clover": drawCloverApple(size); break;
    case "honey": drawHoneyApple(size); break;
    case "butterfly": drawButterflyApple(size); break;
    case "portal-deepsea": drawPortalDeepSeaApple(size); break;
    case "giant-pearl": drawGiantPearlApple(size); break;
    case "bioluminescent": drawBioluminescentApple(size); break;
    case "coral": drawCoralApple(size); break;
    case "portal-apocalypse": drawPortalApocalypseApple(size); break;
    case "radiation": drawRadiationApple(size); break;
    case "survivor": drawSurvivorApple(size); break;
    case "fallout": drawFalloutApple(size); break;
    case "portal-cyberspace": drawPortalCyberspaceApple(size); break;
    case "data": drawDataApple(size); break;
    case "glitch": drawGlitchApple(size); break;
    case "firewall": drawFirewallApple(size); break;
    case "portal-demonic": drawPortalDemonicApple(size); break;
    case "sacrifice": drawSacrificeApple(size); break;
    case "inferno": drawInfernoApple(size); break;
    case "blood": drawBloodApple(size); break;
    case "soul": drawSoulApple(size); break;
    case "satan": drawSatanApple(size); break;
    default:
      fill(200);
      ellipse(0, 0, size);
  }
}

// ============== APPLE DRAWING FUNCTIONS ==============

function drawGoldApple(size) {
  // Golden apple with shine
  fill(255, 215, 0);
  ellipse(0, 0, size);
  fill(255, 255, 150, 150);
  ellipse(-3, -3, size * 0.4);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawSantaApple(size) {
  // Santa face apple with hat
  // Face (tan/peach)
  fill(255, 220, 177);
  ellipse(0, 2, size * 0.85, size * 0.9);
  // Santa hat (red)
  fill(220, 20, 60);
  triangle(-size/2.5, -2, size/2.5, -2, 0, -size/2 - 6);
  // Hat trim and pom-pom (white)
  fill(255);
  rect(-size/2.5, -2, size/1.2, 3); // trim
  ellipse(0, -size/2 - 7, 5); // pom-pom
  // Eyes (black dots)
  fill(0);
  ellipse(-3, 0, 2);
  ellipse(3, 0, 2);
  // Nose (red)
  fill(255, 0, 0);
  ellipse(0, 3, 2);
  // Beard (white)
  fill(255);
  ellipse(0, 7, size * 0.6, size * 0.4);
  // Rosy cheeks
  fill(255, 182, 193, 150);
  ellipse(-5, 3, 3);
  ellipse(5, 3, 3);
}

function drawDecorationApple(size) {
  // Christmas ornament apple
  // Main ornament body (shiny red/green/gold)
  let ornamentColor = [color(220, 20, 60), color(34, 139, 34), color(255, 215, 0)][Math.floor((frameCount / 10) % 3)];
  fill(ornamentColor);
  ellipse(0, 0, size);
  // Shine highlight
  fill(255, 255, 255, 180);
  ellipse(-4, -4, size * 0.3);
  // Ornament cap (gold)
  fill(184, 134, 11);
  rect(-3, -size/2, 6, 4);
  // Hanger (thin line)
  stroke(184, 134, 11);
  strokeWeight(1);
  line(0, -size/2 - 4, 0, -size/2);
  noStroke();
  // Decorative stripes
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  line(-size/3, 0, size/3, 0);
  line(-size/4, -4, size/4, -4);
  line(-size/4, 4, size/4, 4);
  noStroke();
}

function drawNutcrackerApple(size) {
  // Nutcracker soldier apple
  // Face (peach)
  fill(255, 218, 185);
  rect(-size/3, -size/4, size * 0.67, size * 0.5);
  // Hat (black)
  fill(0);
  rect(-size/2.5, -size/2 - 2, size/1.2, 6);
  fill(139, 0, 0); // Red top
  rect(-size/3, -size/2 - 6, size * 0.67, 4);
  // Eyes (black)
  fill(0);
  ellipse(-3, -2, 2);
  ellipse(3, -2, 2);
  // Mustache (black)
  fill(0);
  rect(-5, 2, 10, 2);
  // Mouth (red)
  fill(255, 0, 0);
  rect(-4, 5, 8, 3);
  // Teeth (white)
  fill(255);
  rect(-3, 5, 2, 2);
  rect(1, 5, 2, 2);
  // Uniform (red with gold buttons)
  fill(220, 20, 60);
  rect(-size/3, size/4, size * 0.67, size * 0.4);
  fill(255, 215, 0);
  ellipse(-2, size/3, 2);
  ellipse(2, size/3, 2);
}

function drawBombApple(size) {
  push();
  scale(1.3); // Make bomb bigger and more threatening
  
  // Main bomb body (black sphere with gradient effect)
  fill(20, 20, 20);
  ellipse(0, 2, size * 1.2, size * 1.05);
  
  // Dark shading on bottom
  fill(10, 10, 10);
  ellipse(0, 5, size * 0.9, size * 0.4);
  
  // Metallic shine highlights
  fill(80, 80, 80);
  ellipse(-5, -3, size * 0.35, size * 0.3);
  fill(120, 120, 120);
  ellipse(-6, -4, size * 0.15, size * 0.12);
  
  // Fuse base (metal cap with threading detail)
  fill(100, 100, 100);
  rect(-3, -size/2 - 1, 6, 8, 1);
  // Threading lines
  stroke(60, 60, 60);
  strokeWeight(1);
  line(-3, -size/2 + 1, 3, -size/2 + 1);
  line(-3, -size/2 + 3, 3, -size/2 + 3);
  line(-3, -size/2 + 5, 3, -size/2 + 5);
  noStroke();
  
  // Fuse cord (brown/tan rope texture)
  stroke(139, 69, 19);
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(0, -size/2 + 1);
  vertex(-3, -size/2 - 4);
  vertex(3, -size/2 - 8);
  vertex(-1, -size/2 - 12);
  endShape();
  
  // Fuse texture details
  strokeWeight(1);
  stroke(101, 50, 10);
  line(0, -size/2 + 1, -3, -size/2 - 4);
  noStroke();
  
  // Animated burning spark at fuse tip (more intense)
  let sparkBrightness = sin(frameCount * 0.4) * 0.5 + 0.5;
  // Outer glow
  fill(255, 100, 0, 100);
  ellipse(-1, -size/2 - 12, 10 + sparkBrightness * 4);
  // Middle flame
  fill(255, 150 + sparkBrightness * 55, 0);
  ellipse(-1, -size/2 - 12, 6 + sparkBrightness * 3);
  // Bright core
  fill(255, 255, 200);
  ellipse(-1, -size/2 - 12, 3 + sparkBrightness * 2);
  
  // Flying spark particles
  fill(255, 200, 0, 200);
  for(let spark = 0; spark < 5; spark++) {
    let sparkAngle = frameCount * 0.5 + spark * TWO_PI/5;
    let sparkDist = 8 + sin(frameCount * 0.3 + spark) * 3;
    let sparkX = -1 + cos(sparkAngle) * sparkDist;
    let sparkY = -size/2 - 12 + sin(sparkAngle) * sparkDist;
    ellipse(sparkX, sparkY, 2.5);
  }
  
  // Smoke trail from spark
  fill(60, 60, 60, 100);
  for(let smoke = 0; smoke < 3; smoke++) {
    let smokeY = -size/2 - 12 - smoke * 3;
    let smokeSize = 3 + smoke * 2;
    ellipse(-1, smokeY, smokeSize);
  }
  
  // Danger symbols on bomb (skull or warning)
  fill(255, 0, 0);
  textSize(size * 0.6);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  text("☠", 0, 2);
  pop();
}

function drawRoboApple(size) {
  // Robo-apple with metallic body and robot features
  fill(150, 150, 150);
  ellipse(0, 0, size);
  // Robot panels
  fill(120, 120, 120);
  rect(-size/4, -size/4, size/2, size/2);
  // Robot eyes
  fill(0, 255, 255);
  ellipse(-3, -2, 4);
  ellipse(3, -2, 4);
  // Robot antenna
  stroke(100, 100, 100);
  strokeWeight(2);
  line(0, -size/2, 0, -size/2 - 4);
  noStroke();
  fill(255, 0, 0);
  ellipse(0, -size/2 - 4, 3);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawCursedRoboApple(size) {
  // Cursed robo-apple with red evil glow
  fill(100, 100, 100);
  ellipse(0, 0, size);
  // Robot panels with evil glow
  fill(80, 80, 80);
  rect(-size/4, -size/4, size/2, size/2);
  // Evil red eyes
  fill(255, 0, 0);
  ellipse(-3, -2, 4);
  ellipse(3, -2, 4);
  // Robot antenna
  stroke(80, 80, 80);
  strokeWeight(2);
  line(0, -size/2, 0, -size/2 - 4);
  noStroke();
  fill(255, 0, 0);
  ellipse(0, -size/2 - 4, 3);
  // Evil aura
  stroke(255, 0, 0);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size + 6);
  noStroke();
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawConcreteApple(size) {
  // Construction/concrete apple with industrial design
  fill(169, 169, 169); // Concrete gray
  ellipse(0, 0, size);
  // Concrete texture with rough spots
  fill(128, 128, 128);
  ellipse(-4, 2, 6);
  ellipse(3, -3, 5);
  ellipse(-2, -5, 4);
  // Construction warning stripes
  stroke(255, 255, 0);
  strokeWeight(2);
  line(-size/3, -size/3, size/3, size/3);
  line(-size/3, size/3, size/3, -size/3);
  noStroke();
  // Safety orange highlight
  fill(255, 140, 0);
  ellipse(-6, -6, 4);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawSeashellCommonApple(size) {
  // Common seashell apple with bronze stripe
  fill(245, 222, 179); // Sandy seashell color
  ellipse(0, 0, size);
  // Bronze stripe
  fill(205, 127, 50);
  ellipse(0, 0, size * 0.8, size * 0.3);
  // Seashell ridges
  stroke(139, 69, 19);
  strokeWeight(1);
  for(let ridge = 0; ridge < 8; ridge++) {
    let ridgeAngle = ridge * TWO_PI/8;
    let ridgeX1 = cos(ridgeAngle) * (size * 0.3);
    let ridgeY1 = sin(ridgeAngle) * (size * 0.3);
    let ridgeX2 = cos(ridgeAngle) * (size * 0.45);
    let ridgeY2 = sin(ridgeAngle) * (size * 0.45);
    line(ridgeX1, ridgeY1, ridgeX2, ridgeY2);
  }
  noStroke();
  // Pearl shimmer
  fill(255, 255, 255, 100);
  ellipse(-3, -3, size * 0.3);
}

function drawSeashellRareApple(size) {
  // Rare seashell apple with silver stripe
  fill(245, 222, 179); // Sandy seashell color
  ellipse(0, 0, size);
  // Silver stripe
  fill(192, 192, 192);
  ellipse(0, 0, size * 0.8, size * 0.3);
  // Seashell ridges
  stroke(139, 69, 19);
  strokeWeight(1);
  for(let ridge = 0; ridge < 10; ridge++) {
    let ridgeAngle = ridge * TWO_PI/10;
    let ridgeX1 = cos(ridgeAngle) * (size * 0.3);
    let ridgeY1 = sin(ridgeAngle) * (size * 0.3);
    let ridgeX2 = cos(ridgeAngle) * (size * 0.45);
    let ridgeY2 = sin(ridgeAngle) * (size * 0.45);
    line(ridgeX1, ridgeY1, ridgeX2, ridgeY2);
  }
  noStroke();
  // Silver shimmer
  fill(220, 220, 220, 150);
  ellipse(-3, -3, size * 0.4);
  // Extra pearl spots
  fill(255, 255, 255, 120);
  ellipse(4, 2, 3);
  ellipse(-2, 4, 2);
}

function drawSeashellLegendaryApple(size) {
  // Legendary seashell apple with gold stripe
  fill(245, 222, 179); // Sandy seashell color
  ellipse(0, 0, size);
  // Gold stripe
  fill(255, 215, 0);
  ellipse(0, 0, size * 0.8, size * 0.3);
  // Seashell ridges
  stroke(139, 69, 19);
  strokeWeight(1);
  for(let ridge = 0; ridge < 12; ridge++) {
    let ridgeAngle = ridge * TWO_PI/12;
    let ridgeX1 = cos(ridgeAngle) * (size * 0.3);
    let ridgeY1 = sin(ridgeAngle) * (size * 0.3);
    let ridgeX2 = cos(ridgeAngle) * (size * 0.45);
    let ridgeY2 = sin(ridgeAngle) * (size * 0.45);
    line(ridgeX1, ridgeY1, ridgeX2, ridgeY2);
  }
  noStroke();
  // Golden shimmer
  fill(255, 255, 150, 200);
  ellipse(-3, -3, size * 0.5);
  // Magical sparkles
  fill(255, 215, 0);
  for(let sparkle = 0; sparkle < 6; sparkle++) {
    let sparkleAngle = frameCount * 0.3 + sparkle * TWO_PI/6;
    let sparkleX = cos(sparkleAngle) * (size * 0.6);
    let sparkleY = sin(sparkleAngle) * (size * 0.6);
    ellipse(sparkleX, sparkleY, 2);
  }
  // Premium pearl spots
  fill(255, 255, 255, 180);
  ellipse(4, 2, 4);
  ellipse(-2, 4, 3);
  ellipse(1, -5, 2);
}

function drawPearlApple(size) {
  // Pearl apple - iridescent white with rainbow shimmer
  fill(255, 255, 255); // Pure white base
  ellipse(0, 0, size);
  
  // Rainbow iridescent effect
  let pearlTime = frameCount * 0.1;
  for(let layer = 0; layer < 3; layer++) {
    let hue = (pearlTime + layer * 120) % 360;
    fill(hue, 30, 100, 50); // HSB mode effect
    ellipse(0, 0, size * (0.8 - layer * 0.2));
  }
  
  // Bright pearl shine
  fill(255, 255, 255, 200);
  ellipse(-size/4, -size/4, size/2);
  
  // Smaller pearl highlights
  fill(255, 255, 255, 150);
  ellipse(size/6, size/6, size/4);
  ellipse(-size/8, size/4, size/6);
  
  // Rotating pearl sparkles
  fill(255, 255, 255);
  for(let p = 0; p < 8; p++) {
    let pearlAngle = frameCount * 0.2 + p * TWO_PI/8;
    let pearlX = cos(pearlAngle) * (size * 0.7);
    let pearlY = sin(pearlAngle) * (size * 0.7);
    ellipse(pearlX, pearlY, 2);
  }
}

function drawMagmaApple(size) {
  // Molten magma apple with flowing lava effect
  let magmaGlow = sin(frameCount * 0.4) * 0.3 + 0.7;
  fill(255, 69, 0); // Bright orange-red base
  ellipse(0, 0, size);
  // Molten core with yellow-white heat
  fill(255, 255, 100, 200 * magmaGlow);
  ellipse(0, 0, size * 0.7);
  // Flowing lava streaks
  fill(255, 140, 0);
  for(let streak = 0; streak < 4; streak++) {
    let streakAngle = frameCount * 0.1 + streak * PI/2;
    let streakX = cos(streakAngle) * (size * 0.3);
    let streakY = sin(streakAngle) * (size * 0.3);
    ellipse(streakX, streakY, 4, 8);
  }
  // Magma bubbles
  fill(255, 200, 0);
  for(let bubble = 0; bubble < 3; bubble++) {
    let bubbleAngle = frameCount * 0.2 + bubble * TWO_PI/3;
    let bubbleX = cos(bubbleAngle) * (size * 0.4);
    let bubbleY = sin(bubbleAngle) * (size * 0.4);
    ellipse(bubbleX, bubbleY, 3);
  }
  // Volcanic stem
  fill(50, 25, 0); // Dark burnt stem
  rect(-1, -size/2, 2, 4);
  fill(255, 69, 0, 150); // Glowing leaf
  ellipse(3, -size/2, 6, 3);
}

function drawEmberApple(size) {
  // Glowing ember apple with sparks
  let emberPulse = sin(frameCount * 0.5) * 0.4 + 0.6;
  fill(255, 100, 0); // Deep orange
  ellipse(0, 0, size * emberPulse);
  // Bright ember core
  fill(255, 200, 50, 180);
  ellipse(0, 0, size * 0.6 * emberPulse);
  // Flying sparks around the ember
  fill(255, 255, 100);
  for(let spark = 0; spark < 6; spark++) {
    let sparkAngle = frameCount * 0.25 + spark * PI/3;
    let sparkRadius = (size * 0.8) + sin(frameCount * 0.3 + spark) * 8;
    let sparkX = cos(sparkAngle) * sparkRadius;
    let sparkY = sin(sparkAngle) * sparkRadius;
    ellipse(sparkX, sparkY, 2);
  }
  // Heat shimmer effect
  stroke(255, 150, 0, 100);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size * 1.4);
  noStroke();
  // Burning stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(255, 100, 0, 100); // Smoldering leaf
  ellipse(3, -size/2, 6, 3);
}

function drawAshApple(size) {
  // Ashen gray apple with particle effects
  fill(128, 128, 128); // Ash gray
  ellipse(0, 0, size);
  // Darker ash spots
  fill(80, 80, 80);
  ellipse(-3, 2, 6);
  ellipse(4, -3, 5);
  ellipse(-1, -4, 4);
  // Floating ash particles
  fill(160, 160, 160, 150);
  for(let ash = 0; ash < 8; ash++) {
    let ashAngle = frameCount * 0.05 + ash * PI/4;
    let ashRadius = size * 0.9 + sin(frameCount * 0.1 + ash) * 4;
    let ashX = cos(ashAngle) * ashRadius;
    let ashY = sin(ashAngle) * ashRadius;
    ellipse(ashX, ashY, 1, 2);
  }
  // Withered stem and leaf
  fill(50, 25, 0); // Very dark stem
  rect(-1, -size/2, 2, 4);
  fill(80, 80, 80); // Ash-covered leaf
  ellipse(3, -size/2, 6, 3);
}

function drawSulfurApple(size) {
  // Sulfurous yellow apple with toxic glow
  fill(255, 255, 0); // Bright sulfur yellow
  ellipse(0, 0, size);
  // Toxic green tinge
  fill(173, 255, 47, 150);
  ellipse(0, 0, size * 0.8);
  // Sulfur crystal formations
  fill(255, 255, 150);
  beginShape();
  vertex(-4, -6);
  vertex(-2, -8);
  vertex(0, -6);
  vertex(-2, -4);
  endShape(CLOSE);
  beginShape();
  vertex(3, 2);
  vertex(5, 0);
  vertex(7, 2);
  vertex(5, 4);
  endShape(CLOSE);
  // Toxic vapors
  fill(173, 255, 47, 100);
  for(let vapor = 0; vapor < 5; vapor++) {
    let vaporAngle = frameCount * 0.15 + vapor * TWO_PI/5;
    let vaporRadius = size * 0.7 + sin(frameCount * 0.2 + vapor) * 6;
    let vaporX = cos(vaporAngle) * vaporRadius;
    let vaporY = sin(vaporAngle) * vaporRadius;
    ellipse(vaporX, vaporY, 3, 6);
  }
  // Chemical warning on apple
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  ellipse(0, 0, size * 0.5);
  stroke(255, 0, 0);
  line(-3, 0, 3, 0);
  line(0, -3, 0, 3);
  noStroke();
  // Corroded stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(173, 255, 47, 200); // Toxic leaf
  ellipse(3, -size/2, 6, 3);
}

function drawBlessedApple(size) {
  // Holy glowing apple with divine light
  let blessedGlow = sin(frameCount * 0.4) * 0.3 + 0.7;
  fill(255, 248, 220);
  ellipse(0, 0, size);
  // Divine glow effect
  fill(255, 255, 255, 150 * blessedGlow);
  ellipse(0, 0, size * 1.3);
  fill(255, 215, 0, 100 * blessedGlow);
  ellipse(0, 0, size * 1.6);
  // Cross symbol for blessing
  stroke(255, 215, 0);
  strokeWeight(2);
  line(0, -6, 0, 6);
  line(-4, 0, 4, 0);
  noStroke();
  // Sparkles around the apple
  fill(255, 255, 255);
  for(let sp = 0; sp < 6; sp++) {
    let sparkAngle = frameCount * 0.15 + sp * PI/3;
    let sparkX = cos(sparkAngle) * (size * 0.8);
    let sparkY = sin(sparkAngle) * (size * 0.8);
    ellipse(sparkX, sparkY, 2);
  }
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawQueztelkonatolApple(size) {
  // Rainbow shifting divine apple
  fill(lerpColor(color('green'), color('blue'), frameCount % 255 / 255));
  ellipse(0, 0, size);
  fill(lerpColor(color('yellow'), color('purple'), frameCount % 200 / 200));
  ellipse(0, 0, size * 0.7);
  fill(255, 255, 255, 150);
  ellipse(-3, -3, size * 0.3);
  // Divine aura
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size + sin(frameCount * 0.2) * 8);
  noStroke();
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawRubyApple(size) {
  // Brilliant ruby apple with deep red color and sparkles
  fill(139, 0, 0); // Deep red
  ellipse(0, 0, size);
  fill(220, 20, 60, 200); // Crimson overlay
  ellipse(0, 0, size * 0.8);
  // Ruby shine effect
  fill(255, 255, 255, 150);
  ellipse(-4, -4, size * 0.4);
  // Ruby sparkles
  fill(255, 255, 255);
  for(let r = 0; r < 6; r++) {
    let rubyAngle = frameCount * 0.25 + r * PI/3;
    let rubyX = cos(rubyAngle) * (size * 0.6);
    let rubyY = sin(rubyAngle) * (size * 0.6);
    ellipse(rubyX, rubyY, 2);
  }
  // Inner glow
  fill(255, 69, 0, 100);
  ellipse(0, 0, size * 0.6);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawDiamondApple(size) {
  // Brilliant diamond apple with crystal facets and rainbow sparkles
  fill(240, 248, 255);
  ellipse(0, 0, size);
  // Diamond facet pattern
  stroke(200, 220, 255);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size * 0.8);
  ellipse(0, 0, size * 0.6);
  ellipse(0, 0, size * 0.4);
  // Cross lines for facets
  line(-size/3, -size/3, size/3, size/3);
  line(-size/3, size/3, size/3, -size/3);
  line(-size/2, 0, size/2, 0);
  line(0, -size/2, 0, size/2);
  noStroke();
  // Rainbow sparkles
  for(let d = 0; d < 8; d++) {
    let sparkAngle = frameCount * 0.2 + d * PI/4;
    let sparkX = cos(sparkAngle) * (size * 0.7);
    let sparkY = sin(sparkAngle) * (size * 0.7);
    let sparkColor = lerpColor(color(255, 0, 0), color(0, 0, 255), (d / 8));
    fill(sparkColor);
    ellipse(sparkX, sparkY, 3);
  }
  // Brilliant white shine
  fill(255, 255, 255, 200);
  ellipse(-4, -4, size * 0.3);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawObsidianApple(size) {
  // Dark crystalline apple
  fill(75, 0, 130);
  beginShape();
  for(let angle = 0; angle < TWO_PI; angle += PI/3) {
    let radius = size/2 + random(-2, 2);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  fill(138, 43, 226, 100);
  ellipse(0, 0, size * 0.5);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawBubbleApple(size) {
  // Transparent bubble apple
  fill(135, 206, 250, 150);
  ellipse(0, 0, size);
  fill(255, 255, 255, 100);
  ellipse(-4, -4, size * 0.6);
  ellipse(3, 3, size * 0.3);
  // Bubble shine
  fill(255, 255, 255, 200);
  ellipse(-6, -6, 4);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawMintApple(size) {
  // Green minty apple with leaves
  fill(144, 238, 144);
  ellipse(0, 0, size);
  fill(0, 255, 0);
  ellipse(-2, -2, size * 0.4);
  // Mint leaves
  fill(34, 139, 34);
  ellipse(-6, -size/2, 8, 4);
  ellipse(6, -size/2, 8, 4);
}

function drawPlatinumApple(size) {
  // Shiny metallic apple
  fill(192, 192, 192);
  ellipse(0, 0, size);
  fill(255, 255, 255, 200);
  ellipse(-4, -4, size * 0.3);
  fill(220, 220, 220);
  ellipse(3, 3, size * 0.2);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(5, -size/2, 6, 3);
}

function drawRottenApple(size) {
  // Brown rotten apple with spots
  fill(139, 69, 19);
  ellipse(0, 0, size);
  fill(101, 67, 33);
  ellipse(-3, 2, 6);
  ellipse(4, -1, 4);
  ellipse(-1, -4, 3);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawFrenzyApple(size) {
  // Fast spinning orange/red apple with motion trails
  let spinSpeed = frameCount * 0.5;
  
  // Motion trail effect
  for(let i = 0; i < 3; i++) {
    let trailAlpha = 100 - (i * 30);
    let trailOffset = i * 3;
    fill(255, 100, 0, trailAlpha);
    ellipse(-trailOffset, 0, size - (i * 2));
  }
  
  // Main body - gradient orange to red
  fill(255, 69, 0);
  ellipse(0, 0, size);
  fill(255, 140, 0, 150);
  ellipse(-size/4, -size/4, size * 0.6);
  
  // Speed lines rotating around
  stroke(255, 200, 0);
  strokeWeight(2);
  for(let j = 0; j < 6; j++) {
    let angle = spinSpeed + j * (TWO_PI / 6);
    let x1 = cos(angle) * (size * 0.5);
    let y1 = sin(angle) * (size * 0.5);
    let x2 = cos(angle) * (size * 0.7);
    let y2 = sin(angle) * (size * 0.7);
    line(x1, y1, x2, y2);
  }
  noStroke();
  
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawRiskyRoadApple(size) {
  // Cool entrepreneur apple with animated sunglasses and confident vibe
  // Base apple (peach/tan skin tone with subtle gradient)
  fill(255, 220, 177);
  ellipse(0, 0, size);
  fill(255, 200, 150, 100);
  ellipse(-size/4, -size/4, size/2);
  
  // Slick sunglasses with frames
  fill(20, 20, 20);
  // Left lens
  ellipse(-size/4, -1, size/3, size/3.5);
  // Right lens
  ellipse(size/4, -1, size/3, size/3.5);
  // Bridge
  fill(30, 30, 30);
  rect(-size/12, -1, size/6, 2.5);
  // Frame arms
  stroke(20, 20, 20);
  strokeWeight(2);
  line(-size/2.5, -1, -size/2.2, -3);
  line(size/2.5, -1, size/2.2, -3);
  noStroke();
  
  // Lens reflections (light blue shine)
  fill(150, 200, 255, 180);
  ellipse(-size/4 - 2, -3, size/8, size/10);
  ellipse(size/4 - 2, -3, size/8, size/10);
  
  // Confident smirk
  noFill();
  stroke(100, 50, 20);
  strokeWeight(1.5);
  arc(size/6, size/5, size/3, size/5, 0, PI);
  noStroke();
  
  // Dollar sign bling necklace
  fill(255, 215, 0);
  ellipse(0, size/3, size/6, size/6);
  fill(0);
  textSize(size/6);
  textAlign(CENTER, CENTER);
  text("$", 0, size/3);
  
  // Stem (tilted like a cap)
  fill(139, 69, 19);
  push();
  rotate(-0.3);
  rect(-1, -size/2 - 1, 2, 5);
  pop();
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2, 7, 4);
}

function drawFailApple(size) {
  // Debt/bill themed apple
  // Base (paper white with red overtone)
  fill(255, 240, 240);
  ellipse(0, 0, size);
  
  // Red "PAST DUE" stamp effect
  fill(200, 0, 0, 100);
  ellipse(0, 0, size * 0.7);
  
  // Dollar sign with line through it (debt)
  fill(150, 0, 0);
  textSize(size * 0.6);
  textAlign(CENTER, CENTER);
  text("$", 0, 0);
  
  // Red X through it
  stroke(200, 0, 0);
  strokeWeight(2);
  line(-size/3, -size/3, size/3, size/3);
  line(size/3, -size/3, -size/3, size/3);
  noStroke();
  
  // Tear at edge (ripped paper effect)
  fill(255, 200, 200);
  triangle(-size/2.5, size/3, -size/3, size/2, -size/2, size/2.5);
}

function drawSuccessApple(size) {
  // Money/cash themed apple
  // Base (dollar bill green)
  fill(133, 187, 101);
  ellipse(0, 0, size);
  
  // Lighter center (like a bill)
  fill(160, 210, 130);
  ellipse(0, 0, size * 0.7);
  
  // Dollar sign
  fill(80, 120, 60);
  textSize(size * 0.7);
  textAlign(CENTER, CENTER);
  text("$", 0, 0);
  
  // Corner decorations (like bill corners)
  fill(100, 150, 80);
  ellipse(-size/3, -size/3, 4);
  ellipse(size/3, -size/3, 4);
  ellipse(-size/3, size/3, 4);
  ellipse(size/3, size/3, 4);
  
  // Sparkle effect
  fill(255, 255, 200);
  ellipse(-size/2.5, -size/2.5, 3);
  ellipse(size/2.5, size/2.5, 3);
}

function drawFatApple(size) {
  // Extra wide BigMac burger with stem and leaf (OBESE style)
  push();
  scale(1.4, 1); // Make it 40% wider for obese look
  
  // Bottom bun (tan/brown)
  fill(222, 184, 135);
  ellipse(0, size/3, size * 0.95, size/3);
  // Bottom bun seeds (fixed positions to avoid flickering)
  fill(139, 90, 43);
  let seedPositions = [-size/3, -size/6, 0, size/6, size/3, size/2.5];
  for (let i = 0; i < 6; i++) {
    ellipse(seedPositions[i], size/3 + (i % 2 === 0 ? -1 : 1), 2, 1.5);
  }
  
  // Lettuce layer (bright green, wavy, extra wide)
  fill(124, 252, 0);
  noStroke();
  ellipse(-size/2.5, size/6, size/3.5, size/8);
  ellipse(-size/6, size/6, size/3, size/8);
  ellipse(size/6, size/6, size/3, size/8);
  ellipse(size/2.5, size/6, size/3.5, size/8);
  
  // Patty (dark brown, meaty, wider)
  fill(101, 67, 33);
  ellipse(0, 0, size * 1.1, size/4);
  // Grill marks
  stroke(70, 40, 20);
  strokeWeight(1);
  line(-size/2.2, -2, size/2.2, -2);
  line(-size/2.2, 2, size/2.2, 2);
  noStroke();
  
  // Cheese (yellow/orange, melting over edges)
  fill(255, 200, 0);
  ellipse(0, -size/8, size * 1.05, size/5);
  // Cheese drips (extra drips for obese burger)
  fill(255, 200, 0, 200);
  triangle(-size/2.5, -size/8, -size/2.5 - 3, -size/8 + 5, -size/2.5 + 3, -size/8 + 5);
  triangle(-size/6, -size/8, -size/6 - 2, -size/8 + 4, -size/6 + 2, -size/8 + 4);
  triangle(size/6, -size/8, size/6 - 2, -size/8 + 4, size/6 + 2, -size/8 + 4);
  triangle(size/2.5, -size/8, size/2.5 - 3, -size/8 + 5, size/2.5 + 3, -size/8 + 5);
  
  // Top bun (tan/brown with shine, wider)
  fill(222, 184, 135);
  ellipse(0, -size/2.5, size * 0.95, size/2.5);
  // Top bun highlight
  fill(240, 200, 150, 150);
  ellipse(-size/6, -size/2.5 - 3, size/3, size/8);
  
  pop();
  
  // Sesame seeds on top
  fill(255, 250, 205);
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i;
    let seedX = cos(angle) * (size/4);
    let seedY = -size/2.5 + sin(angle) * (size/8);
    ellipse(seedX, seedY, 2.5, 2);
  }
  
  // Stem on top of bun
  fill(139, 69, 19);
  rect(-1, -size/2 - 8, 2, 6);
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2 - 8, 7, 4);
}

function drawMagicApple(size) {
  // Pulsing purple magic apple
  let magicSize = size + sin(frameCount * 0.3) * 3;
  fill(138, 43, 226, 200);
  ellipse(0, 0, magicSize);
  fill(255, 0, 255, 100);
  ellipse(0, 0, magicSize * 0.7);
  // Sparkles
  fill(255, 255, 255);
  for(let j = 0; j < 4; j++) {
    let angle = frameCount * 0.1 + j * PI/2;
    let x = cos(angle) * (magicSize * 0.6);
    let y = sin(angle) * (magicSize * 0.6);
    ellipse(x, y, 2);
  }
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawPortalMeadowApple(size) {
  // Swirling vortex portal with green meadow tint
  push();
  scale(2)
  rotate(frameCount * 0.05);
  
  // Outer swirl rings
  for (let i = 0; i < 4; i++) {
    noFill();
    stroke(100, 200 - i * 30, 100, 200 - i * 50);
    strokeWeight(2);
    let spiralSize = size * (1 - i * 0.2);
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let r = spiralSize * (0.5 + 0.5 * sin(angle * 3 + frameCount * 0.1 + i));
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      point(x, y);
    }
  }
  
  // Center portal glow
  noStroke();
  fill(150, 255, 150, 150);
  ellipse(0, 0, size * 0.4);
  fill(200, 255, 200, 100);
  ellipse(0, 0, size * 0.2);
  
  pop();
  
  // No stem/leaf for portals - they're dimensional rifts
}

function drawCloverApple(size) {
  // Green apple with 4-leaf clover pattern
  fill(50, 205, 50);
  ellipse(0, 0, size);
  
  // Four leaf clover in center
  fill(34, 139, 34);
  ellipse(0, -size/6, size/4, size/3); // Top
  ellipse(0, size/6, size/4, size/3); // Bottom
  ellipse(-size/6, 0, size/3, size/4); // Left
  ellipse(size/6, 0, size/3, size/4); // Right
  
  // Clover stem
  fill(34, 100, 34);
  rect(-size/20, size/6, size/10, size/4);
  
  // Apple stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawHoneyApple(size) {
  // Golden dripping honey apple
  fill(255, 193, 37);
  ellipse(0, 0, size);
  
  // Honey drip highlights
  fill(255, 215, 0, 200);
  ellipse(-size/4, -size/6, size/3, size/2);
  
  // Drips
  fill(255, 193, 37, 220);
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * i;
    let x = cos(angle) * (size/2.2);
    let y = sin(angle) * (size/2.2);
    triangle(x - 2, y, x + 2, y, x, y + 8);
  }
  
  // Stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawButterflyApple(size) {
  // Pink apple with butterfly wings
  fill(255, 105, 180);
  ellipse(0, 0, size);
  
  // Butterfly wings (animated flutter)
  let wingFlutter = sin(frameCount * 0.2) * 3;
  
  // Left wing
  fill(255, 182, 193, 200);
  ellipse(-size/2.5, -size/4, size/2.5 + wingFlutter, size/1.8);
  fill(255, 120, 150, 150);
  ellipse(-size/2.5, -size/4, size/4, size/2.5);
  
  // Right wing
  fill(255, 182, 193, 200);
  ellipse(size/2.5, -size/4, size/2.5 + wingFlutter, size/1.8);
  fill(255, 120, 150, 150);
  ellipse(size/2.5, -size/4, size/4, size/2.5);
  
  // Butterfly body
  fill(75, 0, 130);
  ellipse(0, -size/4, size/8, size/2.5);
  
  // Antennae
  stroke(75, 0, 130);
  strokeWeight(1);
  line(0, -size/2, -2, -size/1.5);
  line(0, -size/2, 2, -size/1.5);
  noStroke();
  
  // Stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawPortalDeepSeaApple(size) {
  // Swirling vortex portal with deep blue ocean tint
  push();
  scale(2)
  rotate(frameCount * 0.05);
  
  // Outer swirl rings
  for (let i = 0; i < 4; i++) {
    noFill();
    stroke(0, 100 + i * 30, 200 - i * 30, 200 - i * 50);
    strokeWeight(2);
    let spiralSize = size * (1 - i * 0.2);
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let r = spiralSize * (0.5 + 0.5 * sin(angle * 3 + frameCount * 0.1 + i));
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      point(x, y);
    }
  }
  
  // Center portal glow
  noStroke();
  fill(100, 150, 255, 150);
  ellipse(0, 0, size * 0.4);
  fill(150, 200, 255, 100);
  ellipse(0, 0, size * 0.2);
  
  pop();
}

function drawGiantPearlApple(size) {
  // Large lustrous pearl
  fill(240, 234, 214);
  ellipse(0, 0, size * 1.3);
  
  // Pearl shine
  fill(255, 255, 255, 200);
  ellipse(-size/4, -size/4, size/2, size/2.5);
  fill(255, 255, 255, 100);
  ellipse(size/5, size/5, size/4, size/3);
  
  // Iridescent highlights
  fill(200, 220, 255, 80);
  ellipse(-size/6, 0, size/3, size/2);
  fill(255, 200, 220, 80);
  ellipse(size/6, -size/8, size/4, size/3);
}

function drawBioluminescentApple(size) {
  // Glowing blue bioluminescent apple
  let glowPulse = sin(frameCount * 0.15) * 3;
  
  // Outer glow
  fill(0, 191, 255, 100);
  ellipse(0, 0, size + glowPulse * 2);
  
  // Main body
  fill(0, 150, 255);
  ellipse(0, 0, size);
  
  // Bioluminescent spots
  fill(100, 220, 255, 200);
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * i + frameCount * 0.05;
    let x = cos(angle) * (size/4);
    let y = sin(angle) * (size/4);
    ellipse(x, y, size/5 + sin(frameCount * 0.2 + i) * 2);
  }
  
  // Stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawCoralApple(size) {
  // Coral-textured apple (orange/pink)
  fill(255, 127, 80);
  ellipse(0, 0, size);
  
  // Coral texture (bumpy surface)
  fill(255, 99, 71);
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i;
    let x = cos(angle) * (size/3);
    let y = sin(angle) * (size/3);
    ellipse(x, y, size/4);
  }
  
  // Center bump
  fill(255, 140, 100);
  ellipse(0, 0, size/3);
  
  // Stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Leaf (seaweed-like)
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawMiniCoralApple(size) {
  // Tiny coral piece
  fill(255, 127, 80);
  ellipse(0, 0, size);
  fill(255, 140, 100);
  ellipse(0, 0, size/2);
}

function drawPortalApocalypseApple(size) {
  // Swirling vortex portal with apocalyptic red-orange tint
  push();
  scale(2)
  rotate(frameCount * 0.05);
  
  // Outer swirl rings (fiery red-orange) - same style as other portals
  for (let i = 0; i < 4; i++) {
    noFill();
    stroke(255, 100 - i * 20, 0, 200 - i * 50);
    strokeWeight(2);
    let spiralSize = size * (1 - i * 0.2);
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let r = spiralSize * (0.5 + 0.5 * sin(angle * 3 + frameCount * 0.1 + i));
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      point(x, y);
    }
  }
  
  // Center portal glow (fiery)
  noStroke();
  fill(255, 100, 0, 150);
  ellipse(0, 0, size * 0.4);
  fill(255, 150, 50, 100);
  ellipse(0, 0, size * 0.2);
  
  pop();
}

function drawRadiationApple(size) {
  // Toxic green glowing apple with radiation symbol
  let glowPulse = sin(frameCount * 0.2) * 4;
  
  // Outer radioactive glow
  fill(0, 255, 0, 80);
  ellipse(0, 0, size + glowPulse * 2);
  
  // Main body (sickly green)
  fill(100, 255, 50);
  ellipse(0, 0, size);
  
  // Darker green patches
  fill(80, 200, 40);
  ellipse(-size/4, -size/6, size/3);
  ellipse(size/4, size/6, size/4);
  
  // Radiation symbol (☢)
  fill(0, 0, 0);
  ellipse(0, 0, size/5);
  
  // Radiation warning blades
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / 3) * i - PI/2;
    push();
    rotate(angle);
    fill(0, 0, 0);
    triangle(-size/8, size/6, size/8, size/6, 0, size/3);
    pop();
  }
  
  // Stem
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 5);
  
  // Wilted leaf
  fill(80, 100, 30);
  ellipse(3, -size/2, 6, 3);
}

function drawSurvivorApple(size) {
  // Rusted can appearance
  fill(140, 90, 70);
  rect(-size/2.5, -size/2.2, size/1.3, size/1.1, 2);
  
  // Top lid
  fill(160, 110, 90);
  rect(-size/2.5, -size/2.2, size/1.3, size/8, 2);
  
  // Rust patches
  fill(100, 60, 40);
  ellipse(-size/4, 0, size/5);
  ellipse(size/5, size/6, size/6);
  
  // Dents
  stroke(80, 50, 30);
  strokeWeight(1);
  line(-size/5, -size/6, -size/6, size/6);
  line(size/8, -size/4, size/6, 0);
  noStroke();
  
  // Label remnant
  fill(200, 180, 150, 150);
  rect(-size/3.5, -size/8, size/2.2, size/4);
  
  // Text hint
  fill(60, 40, 20);
  textSize(6);
  textAlign(CENTER, CENTER);
  text("FOOD", 0, 0);
  textAlign(LEFT, BASELINE);
}

function drawFalloutApple(size) {
  // Bluish-gray radioactive apple covered in fallout
  fill(100, 120, 130);
  ellipse(0, 0, size);
  
  // Radioactive dust coating (bluish tint)
  fill(140, 160, 170, 180);
  ellipse(-size/6, -size/6, size/1.5);
  
  // Darker contaminated patches with blue glow
  fill(60, 80, 90);
  ellipse(size/4, size/5, size/3);
  ellipse(-size/3, size/4, size/4);
  
  // Subtle blue radioactive glow
  fill(100, 150, 200, 80);
  ellipse(0, 0, size * 1.1);
  
  // Radioactive dust particles floating around (bluish)
  for (let i = 0; i < 8; i++) {
    let angle = frameCount * 0.05 + i * TWO_PI/8;
    let x = cos(angle) * (size/1.2);
    let y = sin(angle) * (size/1.2) + sin(frameCount * 0.1 + i) * 3;
    fill(120, 160, 180, 150);
    ellipse(x, y, 2);
  }
  
  // Additional floating particles (varied depths)
  for (let i = 0; i < 5; i++) {
    let angle = -frameCount * 0.03 + i * TWO_PI/5;
    let x = cos(angle) * (size/1.5);
    let y = sin(angle) * (size/1.5) - sin(frameCount * 0.08 + i) * 4;
    fill(130, 150, 170, 120);
    ellipse(x, y, 3);
  }
  
  // Stem (withered)
  fill(80, 90, 95);
  rect(-1, -size/2, 2, 5);
  
  // Dead leaf with slight blue tint
  fill(70, 85, 90);
  ellipse(3, -size/2, 6, 3);
}

function drawPortalCyberspaceApple(size) {
  // Swirling vortex portal with neon cyan/magenta colors
  push();
  scale(2)
  rotate(frameCount * 0.05);
  
  // Outer swirl rings (neon cyan and magenta)
  for (let i = 0; i < 4; i++) {
    noFill();
    stroke(0 + i * 60, 255 - i * 50, 255, 200 - i * 50);
    strokeWeight(2);
    let spiralSize = size * (1 - i * 0.2);
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let r = spiralSize * (0.5 + 0.5 * sin(angle * 3 + frameCount * 0.1 + i));
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      point(x, y);
    }
  }
  
  // Center portal glow (electric blue)
  noStroke();
  fill(0, 255, 255, 150);
  ellipse(0, 0, size * 0.4);
  fill(100, 255, 255, 100);
  ellipse(0, 0, size * 0.2);
  
  pop();
}

function drawPortalDemonicApple(size) {
  // Hellish portal with flames and darkness
  push();
  scale(2);
  rotate(-frameCount * 0.08); // Rotate opposite direction for infernal feel
  
  // Outer hellfire rings (red/orange/black)
  for (let i = 0; i < 5; i++) {
    noFill();
    let c = lerpColor(color(255, 50, 0), color(0, 0, 0), i / 5);
    stroke(c, 220 - i * 40);
    strokeWeight(3);
    let spiralSize = size * (1 - i * 0.15);
    for (let angle = 0; angle < TWO_PI; angle += 0.08) {
      let r = spiralSize * (0.4 + 0.6 * sin(angle * 4 - frameCount * 0.12 + i));
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      point(x, y);
    }
  }
  
  // Demonic eye in center
  noStroke();
  fill(139, 0, 0);
  ellipse(0, 0, size * 0.5);
  fill(255, 0, 0);
  ellipse(0, 0, size * 0.3);
  fill(0, 0, 0);
  ellipse(0, 0, size * 0.15);
  
  // Flame particles swirling
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i + frameCount * 0.1;
    let distance = size * 0.7 + sin(frameCount * 0.15 + i) * 5;
    fill(255, random(50, 150), 0, 200);
    ellipse(cos(angle) * distance, sin(angle) * distance, 4);
  }
  
  pop();
}

function drawDataApple(size) {
  // Digital data apple with binary patterns
  fill(0, 200, 255);
  ellipse(0, 0, size);
  
  // Binary code pattern
  fill(0, 50, 100);
  textSize(6);
  textAlign(CENTER, CENTER);
  text("01", -size/4, -size/4);
  text("10", size/4, -size/4);
  text("11", -size/4, size/4);
  text("00", size/4, size/4);
  
  // Download arrow
  fill(255, 255, 255);
  triangle(-size/6, -size/8, size/6, -size/8, 0, size/6);
  rect(-size/16, -size/8, size/8, size/4);
  
  // Pulsing glow
  let pulse = sin(frameCount * 0.2) * 3;
  fill(0, 255, 255, 100);
  ellipse(0, 0, size + pulse);
  
  // Stem
  fill(100, 120, 140);
  rect(-1, -size/2, 2, 5);
  
  // Digital leaf
  fill(0, 180, 220);
  ellipse(3, -size/2, 6, 3);
  
  textAlign(LEFT, BASELINE);
}

function drawGlitchApple(size) {
  // Glitchy, distorted apple with RGB split effect
  push();
  
  // RGB channel split effect
  fill(255, 0, 0, 150);
  ellipse(-2, 0, size);
  fill(0, 255, 0, 150);
  ellipse(0, 0, size);
  fill(0, 0, 255, 150);
  ellipse(2, 0, size);
  
  // Random glitch blocks
  if (frameCount % 5 === 0) {
    fill(random(255), random(255), random(255));
    rect(random(-size/2, size/2), random(-size/2, size/2), random(5, 10), random(5, 10));
  }
  
  // Glitch lines
  stroke(255, 0, 255);
  strokeWeight(1);
  for (let i = 0; i < 3; i++) {
    let y = random(-size/2, size/2);
    line(-size/2, y, size/2, y);
  }
  noStroke();
  
  // Static noise overlay
  for (let i = 0; i < 10; i++) {
    fill(random(200, 255), random(100), random(255), 150);
    ellipse(random(-size/2, size/2), random(-size/2, size/2), 2);
  }
  
  pop();
  
  // Distorted stem
  fill(random(100, 150), random(50, 100), random(100, 150));
  rect(-1, -size/2, 2, 5);
  
  // Glitched leaf
  fill(random(100, 200), random(100, 200), 0);
  ellipse(3, -size/2, 6, 3);
}

function drawFirewallApple(size) {
  // Orange/red firewall shield apple
  fill(255, 100, 0);
  ellipse(0, 0, size);
  
  // Shield hexagon pattern
  stroke(255, 150, 50);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i - PI/2;
    let x = cos(angle) * (size/3);
    let y = sin(angle) * (size/3);
    vertex(x, y);
  }
  endShape(CLOSE);
  noStroke();
  
  // Shield layers (animated)
  let pulse = sin(frameCount * 0.15) * 2;
  stroke(255, 200, 100, 150);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size * 0.7 + pulse);
  ellipse(0, 0, size * 0.5 + pulse);
  noStroke();
  
  // Lock symbol
  fill(255, 255, 255);
  rect(-size/8, 0, size/4, size/5, 2);
  ellipse(0, -size/12, size/5, size/4);
  fill(255, 100, 0);
  ellipse(0, -size/12, size/6, size/5);
  
  // Firewall particles
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i + frameCount * 0.05;
    let x = cos(angle) * (size/1.5);
    let y = sin(angle) * (size/1.5);
    fill(255, 150, 0, 200);
    ellipse(x, y, 3);
  }
  
  // Stem
  fill(200, 100, 50);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(255, 140, 0);
  ellipse(3, -size/2, 6, 3);
}

function drawSacrificeApple(size) {
  // Dark purple apple with ritual symbols
  fill(80, 0, 80);
  ellipse(0, 0, size);
  
  // Darker center
  fill(50, 0, 50);
  ellipse(0, 0, size * 0.7);
  
  // Ritual circle
  stroke(150, 0, 150, 200);
  strokeWeight(2);
  noFill();
  ellipse(0, 0, size * 0.5);
  noStroke();
  
  // Pentagram points
  fill(200, 100, 200);
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * i - PI/2;
    let x = cos(angle) * (size/3);
    let y = sin(angle) * (size/3);
    ellipse(x, y, 3);
  }
  
  // Glowing aura
  fill(150, 0, 150, 80);
  ellipse(0, 0, size * 1.3);
  
  // Stem
  fill(60, 0, 60);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(100, 0, 100);
  ellipse(3, -size/2, 6, 3);
}

function drawInfernoApple(size) {
  // Blazing fire apple
  // Outer fire glow
  fill(255, 50, 0, 150);
  ellipse(0, 0, size * 1.4);
  
  // Main body (orange-red gradient effect)
  fill(255, 100, 0);
  ellipse(0, 0, size);
  
  fill(255, 150, 0);
  ellipse(0, 0, size * 0.7);
  
  fill(255, 200, 0);
  ellipse(0, 0, size * 0.4);
  
  // Flame flickers
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i + frameCount * 0.1;
    let flameSize = size/5 + sin(frameCount * 0.2 + i) * 3;
    let x = cos(angle) * (size/2.2);
    let y = sin(angle) * (size/2.2);
    fill(255, random(50, 150), 0, 200);
    ellipse(x, y, flameSize);
  }
  
  // Hot core
  fill(255, 255, 200, 200);
  ellipse(0, 0, size * 0.2);
  
  // Stem (charred)
  fill(40, 20, 10);
  rect(-1, -size/2, 2, 5);
  
  // Burnt leaf
  fill(80, 40, 20);
  ellipse(3, -size/2, 6, 3);
}

function drawBloodApple(size) {
  // Deep blood red apple, dripping
  fill(100, 0, 0);
  ellipse(0, 0, size);
  
  // Blood red shine
  fill(150, 0, 0);
  ellipse(-size/4, -size/4, size * 0.4);
  
  // Darker blood center
  fill(80, 0, 0);
  ellipse(size/6, size/6, size * 0.3);
  
  // Dripping blood effect
  for (let i = 0; i < 4; i++) {
    let angle = (TWO_PI / 4) * i + PI/4;
    let x = cos(angle) * (size/2);
    let y = sin(angle) * (size/2);
    fill(120, 0, 0);
    ellipse(x, y, 4);
    fill(100, 0, 0);
    rect(x-1, y, 2, random(5, 10));
  }
  
  // Blood drops falling
  fill(130, 0, 0, 200);
  let drop = sin(frameCount * 0.2) * 5;
  ellipse(0, size/2 + 8 + drop, 3, 5);
  
  // Stem (blood-soaked)
  fill(80, 0, 0);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(100, 20, 20);
  ellipse(3, -size/2, 6, 3);
}

function drawSoulApple(size) {
  // Ethereal light blue/white apple
  // Outer glow
  fill(150, 200, 255, 100);
  ellipse(0, 0, size * 1.5);
  
  // Main body (glowing)
  fill(200, 230, 255);
  ellipse(0, 0, size);
  
  // Inner light
  fill(230, 245, 255);
  ellipse(0, 0, size * 0.6);
  
  // Bright core
  fill(255, 255, 255, 200);
  ellipse(0, 0, size * 0.3);
  
  // Floating sparkles
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i + frameCount * 0.08;
    let distance = size/2 + sin(frameCount * 0.15 + i) * 8;
    let x = cos(angle) * distance;
    let y = sin(angle) * distance;
    fill(255, 255, 255, 220);
    ellipse(x, y, 3);
  }
  
  // Pulsing aura rings
  let pulse = sin(frameCount * 0.1) * 3;
  stroke(200, 230, 255, 150);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, size * 0.8 + pulse);
  ellipse(0, 0, size * 1.1 + pulse);
  noStroke();
  
  // Stem
  fill(180, 200, 220);
  rect(-1, -size/2, 2, 5);
  
  // Leaf
  fill(200, 220, 240);
  ellipse(3, -size/2, 6, 3);
}

function drawSatanApple(size) {
  // THE MOST EVIL APPLE - Twisted, corrupted, fear-inducing
  
  // Outer corruption aura (pulsing dark energy)
  let darkPulse = sin(frameCount * 0.15) * 5;
  fill(0, 0, 0, 180);
  ellipse(0, 0, size * 1.8 + darkPulse);
  fill(50, 0, 0, 150);
  ellipse(0, 0, size * 1.5 + darkPulse);
  
  // Twisted body (irregular, corrupted shape)
  fill(20, 0, 0);
  beginShape();
  for (let i = 0; i < 12; i++) {
    let angle = (TWO_PI / 12) * i;
    let irregularity = sin(i * 3 + frameCount * 0.1) * 4;
    let radius = (size/2) + irregularity;
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  
  // Rotting core (sickly green)
  fill(40, 60, 20);
  ellipse(0, 0, size * 0.7);
  
  // Evil eye in the center
  fill(255, 0, 0);
  ellipse(0, 0, size * 0.4);
  fill(0, 0, 0);
  ellipse(0, 0, size * 0.25);
  fill(255, 0, 0, 150);
  ellipse(-size/10, -size/10, size * 0.1); // Gleam
  
  // Demonic spikes/tendrils protruding
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i + frameCount * 0.05;
    let spikeLength = 6 + sin(frameCount * 0.2 + i) * 3;
    let baseX = cos(angle) * (size/2);
    let baseY = sin(angle) * (size/2);
    let tipX = cos(angle) * (size/2 + spikeLength);
    let tipY = sin(angle) * (size/2 + spikeLength);
    
    stroke(80, 0, 0);
    strokeWeight(2);
    line(baseX, baseY, tipX, tipY);
    noStroke();
    
    fill(100, 0, 0);
    ellipse(tipX, tipY, 3);
  }
  
  // Cracks emanating evil energy
  stroke(139, 0, 0, 200);
  strokeWeight(1);
  for (let i = 0; i < 6; i++) {
    let angle = random(TWO_PI);
    let startR = size * 0.3;
    let endR = size * 0.6;
    line(cos(angle) * startR, sin(angle) * startR,
         cos(angle) * endR, sin(angle) * endR);
  }
  noStroke();
  
  // Swirling dark matter particles
  for (let i = 0; i < 10; i++) {
    let angle = (frameCount * 0.08 + i * 0.6);
    let distance = (size * 0.8) + sin(frameCount * 0.1 + i) * 10;
    let x = cos(angle) * distance;
    let y = sin(angle) * distance;
    fill(50, 0, 0, 200);
    ellipse(x, y, 4);
  }
  
  // Corruption seeping (dripping darkness)
  for (let i = 0; i < 3; i++) {
    let x = random(-size/3, size/3);
    let dripY = size/2 + sin(frameCount * 0.15 + i) * 8;
    fill(10, 0, 0, 180);
    ellipse(x, dripY, 3, 8);
  }
  
  // Cursed stem (withered, twisted)
  fill(30, 20, 20);
  push();
  rotate(sin(frameCount * 0.1) * 0.2);
  rect(-1.5, -size/2, 3, 6);
  pop();
  
  // Dead, wilted leaf
  fill(40, 30, 20);
  push();
  translate(3, -size/2);
  rotate(sin(frameCount * 0.1) * 0.3);
  ellipse(0, 0, 7, 2);
  pop();
  
  // Pentagram mark (mark of the beast)
  stroke(200, 0, 0, 180);
  strokeWeight(1);
  noFill();
  beginShape();
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * (i * 2) - PI/2;
    let x = cos(angle) * (size/4);
    let y = sin(angle) * (size/4);
    vertex(x, y);
  }
  endShape(CLOSE);
  noStroke();
  
  // Ominous red glow that pulses with malice
  fill(139, 0, 0, 60 + sin(frameCount * 0.2) * 30);
  ellipse(0, 0, size * 2);
}

function drawCursedApple(size) {
  // Black apple with red evil glow
  fill(0, 0, 0);
  ellipse(0, 0, size);
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  ellipse(0, 0, size + 4);
  noStroke();
  fill(255, 0, 0, 50);
  ellipse(0, 0, size * 1.3);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawBrickApple(size) {
  // Red brick pattern
  fill(178, 34, 34);
  rect(-size/2, -size/2, size, size);
  stroke(139, 69, 19);
  strokeWeight(1);
  // Brick lines
  line(-size/2, -size/6, size/2, -size/6);
  line(-size/2, size/6, size/2, size/6);
  line(-size/6, -size/2, -size/6, size/2);
  line(size/6, -size/2, size/6, size/2);
  noStroke();
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawStoneApple(size) {
  // Gray rocky apple
  fill(128, 128, 128);
  ellipse(0, 0, size);
  fill(105, 105, 105);
  ellipse(-3, 2, 6);
  ellipse(4, -3, 5);
  fill(169, 169, 169);
  ellipse(-2, -4, 4);
  ellipse(5, 1, 3);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawDizzyApple(size) {
  // Spinning apple with motion lines
  let dizzyColor = lerpColor(color(255, 255, 0), color(255, 0, 255), sin(frameCount * 0.2) * 0.5 + 0.5);
  fill(dizzyColor);
  ellipse(0, 0, size);
  // Motion lines
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  for(let k = 0; k < 6; k++) {
    let angle = frameCount * 0.3 + k * PI/3;
    let x1 = cos(angle) * (size * 0.7);
    let y1 = sin(angle) * (size * 0.7);
    let x2 = cos(angle) * (size * 1.2);
    let y2 = sin(angle) * (size * 1.2);
    line(x1, y1, x2, y2);
  }
  noStroke();
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawStickyApple(size) {
  // White apple with slight yellow tint and translucent drips
  fill(255, 255, 240); // White with slight yellow tint
  ellipse(0, 0, size);
  fill(255, 255, 220); // Slightly more yellow highlight
  ellipse(-2, -2, size * 0.6);
  // Translucent sticky drips
  fill(255, 255, 200, 200); // Translucent yellow drips
  ellipse(-4, size/3, 4, 8);
  ellipse(3, size/4, 3, 6);
  ellipse(0, size/2, 2, 4);
  // Stem and leaf
  fill(139, 69, 19);
  rect(-1, -size/2, 2, 4);
  fill(34, 139, 34);
  ellipse(3, -size/2, 6, 3);
}

function drawSuperCursedApple(size) {
  push();
  scale(0.75); // Scale down because it is too big
  // Ultra-cursed apple with intense dark energy and demonic features
  // Pulsing dark core
  let cursedPulse = sin(frameCount * 0.3) * 0.4 + 0.6;
  fill(10, 0, 10); // Almost pure black
  ellipse(0, 0, size * cursedPulse);
  
  // Multiple swirling shadow rings
  stroke(139, 0, 139, 200); // Dark magenta
  strokeWeight(3);
  noFill();
  for(let s = 0; s < 5; s++) {
    let swirl = frameCount * 0.15 + s * TWO_PI/5;
    let radius = (size/2 + sin(swirl + s) * 4) * (0.8 + s * 0.2);
    ellipse(0, 0, radius * 2);
  }
  
  // Evil red outer ring
  stroke(255, 0, 0, 150);
  strokeWeight(4);
  ellipse(0, 0, size * 1.8);
  noStroke();
  
  // Chaotic dark energy bursts
  fill(75, 0, 130, 150);
  ellipse(0, 0, size * 1.6);
  fill(139, 0, 139, 120);
  ellipse(0, 0, size * 1.3);
  fill(255, 0, 255, 80);
  ellipse(0, 0, size * 1.1);
  
  // Demonic spikes/tendrils
  fill(139, 0, 0);
  for(let spike = 0; spike < 8; spike++) {
    let spikeAngle = frameCount * 0.2 + spike * PI/4;
    let spikeLength = sin(frameCount * 0.4 + spike) * 8 + 12;
    let spikeX1 = cos(spikeAngle) * (size * 0.5);
    let spikeY1 = sin(spikeAngle) * (size * 0.5);
    let spikeX2 = cos(spikeAngle) * (size * 0.5 + spikeLength);
    let spikeY2 = sin(spikeAngle) * (size * 0.5 + spikeLength);
    strokeWeight(2);
    stroke(255, 0, 0, 200);
    line(spikeX1, spikeY1, spikeX2, spikeY2);
    noStroke();
    // Spike tips
    fill(255, 0, 0);
    ellipse(spikeX2, spikeY2, 3);
  }
  
  // Evil glowing eyes in the darkness
  fill(255, 0, 0, 200);
  ellipse(-4, -2, 4);
  ellipse(4, -2, 4);
  fill(255, 255, 255);
  ellipse(-4, -2, 2);
  ellipse(4, -2, 2);
  
  // Floating dark particles
  fill(139, 0, 139, 150);
  for(let p = 0; p < 6; p++) {
    let particleAngle = frameCount * 0.08 + p * PI/3;
    let particleRadius = size * 0.9 + sin(frameCount * 0.2 + p) * 5;
    let particleX = cos(particleAngle) * particleRadius;
    let particleY = sin(particleAngle) * particleRadius;
    ellipse(particleX, particleY, 2);
  }
  
  // Withered stem and dead leaf
  fill(50, 25, 0); // Dark brown, almost black
  rect(-1, -size/2, 2, 4);
  fill(139, 69, 19, 100); // Semi-transparent dead leaf
  ellipse(3, -size/2, 6, 3);
  pop();
}

function drawFairchildApple(size) {
  // Jerry Lawson Tribute - Fairchild Channel F cartridge
  // Cartridge body (brown/tan)
  fill(139, 90, 43);
  rect(-size/2.5, -size/2, size/1.25, size, 2);
  // Darker edge
  fill(101, 67, 33);
  rect(-size/2.5, size/2 - 4, size/1.25, 4, 0, 0, 2, 2);
  // Label area (lighter tan)
  fill(210, 180, 140);
  rect(-size/3, -size/3, size * 0.67, size * 0.5, 1);
  // "F" logo
  fill(139, 0, 0);
  textSize(size * 0.8);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  text("F", 0, -size/12);
  // Retro dots pattern
  fill(101, 67, 33);
  for(let i = 0; i < 3; i++) {
    ellipse(-size/4 + i * (size/4), size/4, 2);
  }
  // Cartridge connector lines
  stroke(50);
  strokeWeight(1);
  for(let i = 0; i < 5; i++) {
    line(-size/3 + i * 3, size/2.5, -size/3 + i * 3, size/2);
  }
  noStroke();
}

function drawNutApple(size) {
  // Brown peanut-shaped nut
  fill(139, 90, 43);
  ellipse(-3, 0, size * 0.8, size);
  ellipse(3, 0, size * 0.8, size);
  
  // Darker shell texture
  fill(101, 67, 33);
  ellipse(-3, -2, size * 0.4, size * 0.5);
  ellipse(3, 2, size * 0.4, size * 0.5);
  
  // Shell lines
  stroke(80, 50, 20);
  strokeWeight(1);
  line(-6, -4, -6, 4);
  line(0, -5, 0, 5);
  line(6, -4, 6, 4);
  noStroke();
}