// --- Input Priority Utility ---
// Returns true if a physical keyboard is likely present and should be prioritized over touch
function isKeyboardPreferred() {
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) return true;
  if (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer:fine)').matches) return false;
  return true;
}
// Usage: In your input handling, check isKeyboardPreferred() to decide which input to prioritize

// --- GLOBAL VARIABLES ---
let FlamethrowerNoduleImg = null; // for new rotor weapons
let FlameImg = null; // for flamethrower projectile

// Advanced bullet powerup
let advBulletActive = true;
let advBulletUntil = 1000000;
let advancedBulletImg = null;

// Flamethrower weapon state
// Will be initialized in setup() when HALF_PI is available
let flamethrowerTimers;
// Leviathan Ion Gun swivel angle (radians)
let levIonGunAngle = 0;
// Swivel speed (radians per frame)
const levIonGunSwivelSpeed = 0.012;
let player;
let players = []; // array of Player instances (players[0] is primary)
let buddyMode = false;
// death message shown on-screen when a player dies
let deathMessage = null;
let deathMessageTimer = 0;
const deathMessageDuration = 2000; // ms
let bullets = [];
let enemyBullets = [];
let enemies = [];
let explosions = [];
let score = 0

// Credits / currency
let creditsBalance = 0; // persistent across runs in memory
let lastCreditsEarned = 0; // credits earned in the last run
// Whether the game is currently in the game-over state (waiting for player action)
let gameOverActive = false;
// Nukes count (player inventory). Starts at 0.
let nukesCount = 0;

// Bombs count (player inventory). Starts at 3.
let bombsCount = 3;

// Shop state
let shopActive = false;
let shopMessage = null;
let shopMessageTimer = 0;
const shopMessageDuration = 1800; // ms
// Accumulator (energy capacity) upgrades purchased count
let accumulatorLevel = 1;
// Shop scroll state (vertical list)
let shopScrollY = 0;
let shopMaxScroll = 0;
// Mega Beam active instances
let megaBeams = [];
// Single boss instance (null when no boss present)
let boss = null;
// Timestamp (ms) when the boss should spawn after a game starts
let bossSpawnAt = 0;
// Ensure we only spawn one boss per game
let bossHasSpawned = false;
// Dev prefix state: press ',' then another key (within `devPrefixWindowMs`) to trigger dev actions
let devPrefixActive = false;
let devPrefixUntil = 0;
const devPrefixWindowMs = 1500; // 1.5 seconds to complete sequence
// Music mute toggle
let musicMuted = true; // very anoyying to listen to while coding, since it updates every time i make a change

// Minimal Boss class: single rectangle with large HP
class Boss {
  constructor(x, y) {
    this.x = (x != null) ? x : width / 2;
    this.y = (y != null) ? y : height * 0.25;
    this.w = 240;
    this.h = 140;
    this.hp = 15000;
    this.maxHp = 15000;
    this.spawnTime = millis();
    this.destroyed = false;
  }

  update() {
    const t = (millis() - this.spawnTime) / 1000;
    this.y += sin(t * 2) * 0.12;

    // Swivel the Ion Gun toward the player if the part exists and is not destroyed
    const ionGunPart = LevParts.find(p => p.name && p.name.includes('levIonGun'));
    if (ionGunPart && !ionGunPart.destroyed && typeof player !== 'undefined' && player) {
      const px = this.x + ionGunPart.x * (typeof LevScale === 'number' ? LevScale : 1);
      const py = this.y + ionGunPart.y * (typeof LevScale === 'number' ? LevScale : 1);
      const dx = player.x - px;
      const dy = player.y - py;
      const targetAngle = Math.atan2(dy, dx);
      // Shortest angle interpolation
      let delta = targetAngle - levIonGunAngle;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      levIonGunAngle += Math.sign(delta) * Math.min(Math.abs(delta), levIonGunSwivelSpeed);

      // --- Ion Gun Activation Logic ---
      // Only activate after part id:2 is destroyed and activationTime has elapsed
      if (!this.levIonGunActivated) this.levIonGunActivated = false;
      if (!this.levIonGunActivationStart) this.levIonGunActivationStart = 0;
      const middlePart = LevParts.find(p => p.id === 2);
      if (!this.levIonGunActivated) {
        if (middlePart && middlePart.destroyed) {
          if (this.levIonGunActivationStart === 0) {
            this.levIonGunActivationStart = millis();
          } else if (millis() - this.levIonGunActivationStart >= (ionGunPart.activationTime || 0) * 1000) {
            this.levIonGunActivated = true;
          }
        } else {
          this.levIonGunActivationStart = 0;
        }
      }

      // --- Ion Gun Firing Logic ---
      if (this.levIonGunActivated) {
        // Only fire if not already firing (one beam at a time)
        if (!this.levIonGunBeam || millis() - this.levIonGunBeam.start > this.levIonGunBeam.duration) {
          const gunLength = (typeof LevIonGunImg === 'object' && LevIonGunImg && LevIonGunImg.height) ? LevIonGunImg.height * ionGunPart.scale * (typeof LevScale === 'number' ? LevScale : 1) : 80;
          const tipX = px + Math.cos(levIonGunAngle) * gunLength/2;
          const tipY = py + Math.sin(levIonGunAngle) * gunLength/2;
          this.levIonGunBeam = spawnMegaBeam(tipX, tipY, {
            type: 'ion',
            dps: 10,
            duration: 1200,
            owner: { x: tipX, y: tipY },
            followPlayer: false,
            angle: levIonGunAngle,
            isEnemy: true
          });
          this.levIonGunBeam._levIonGun = true; // tag for custom update
          this.levIonGunBeam._levIonGunTipOffset = gunLength/2;
        }
      }
    }
  }

  // compute bounds (left,right,top,bottom) based on loaded part images and scales
  getBounds() {
    // conservative fallback if images not loaded: use this.w/this.h
    let minX = this.x - (this.w || 240) / 2;
    let maxX = this.x + (this.w || 240) / 2;
    let minY = this.y - (this.h || 140) / 2;
    let maxY = this.y + (this.h || 140) / 2;

    if (typeof LevParts !== 'undefined' && Array.isArray(LevParts)) {
      let any = false;
      for (let part of LevParts) {
        const img = (typeof part.img === 'function') ? part.img() : part.img;
        let pw = 100;
        let ph = 50;
        if (img && img.width && img.height) {
          pw = img.width * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
          ph = img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        } else {
          // heuristic fallback size
          pw = 200 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
          ph = 120 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        }
        const px = this.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
        const py = this.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
        minX = min(minX, px - pw / 2);
        maxX = max(maxX, px + pw / 2);
        minY = min(minY, py - ph / 2);
        maxY = max(maxY, py + ph / 2);
        any = true;
      }
      if (any) {
        // update stored w/h for other uses
        this.w = maxX - minX;
        this.h = maxY - minY;
      }
    }
    return { left: minX, right: maxX, top: minY, bottom: maxY };
  }

  show() {
    // Draw multi-part Leviathan assembled from LevParts, skip destroyed parts
    if (typeof LevParts === 'undefined' || !Array.isArray(LevParts)) {
      push(); rectMode(CENTER); noStroke(); fill(120,0,140); rect(this.x, this.y, this.w, this.h, 8); pop();
      return;
    }
    const parts = LevParts.slice().sort((a,b) => a.layer - b.layer);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let part of parts) {
      if (part.destroyed) continue;
      const img = (typeof part.img === 'function') ? part.img() : part.img;
      const px = this.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
      const py = this.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
      push();
      translate(px, py);
      let extraRot = 0;
      if (img === LevRotorImg) {
        extraRot = (millis() - this.spawnTime) / 10.0;
      }
      // Swivel Ion Gun if this is the part
      if (part.name && part.name.includes('levIonGun')) {
        rotate(levIonGunAngle);
      } else {
        rotate(radians(part.rot) + extraRot);
      }
      scale(part.scale * (typeof LevScale === 'number' ? LevScale : 1));
      imageMode(CENTER);
      if (img) {
        image(img, 0, 0);
        const pw = img.width * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        const ph = img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        minX = min(minX, px - pw/2);
        maxX = max(maxX, px + pw/2);
        minY = min(minY, py - ph/2);
        maxY = max(maxY, py + ph/2);
      } else {
        fill(150,50,150,120);
        noStroke();
        rect(0,0,120 * part.scale * (typeof LevScale === 'number' ? LevScale : 1), 80 * part.scale * (typeof LevScale === 'number' ? LevScale : 1));
        minX = min(minX, px - (120*part.scale*(typeof LevScale === 'number' ? LevScale : 1))/2);
        maxX = max(maxX, px + (120*part.scale*(typeof LevScale === 'number' ? LevScale : 1))/2);
        minY = min(minY, py - (80*part.scale*(typeof LevScale === 'number' ? LevScale : 1))/2);
        maxY = max(maxY, py + (80*part.scale*(typeof LevScale === 'number' ? LevScale : 1))/2);
      }
      pop();
    }
    if (isFinite(minX)) {
      this.w = maxX - minX;
      this.h = maxY - minY;
    }
    // Draw per-part HP bars above each part
    const now = millis();
    for (let part of parts) {
      if (part.destroyed) continue;
      if (!part.lastDamaged || now - part.lastDamaged > 1000) continue;
      const px = this.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
      const py = this.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
      const img = (typeof part.img === 'function') ? part.img() : part.img;
      let pw = 100;
      if (img && img.width) pw = img.width * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
      const barW = max(40, pw * 0.7);
      // Use LeviathanPartHP for max HP
      let maxHp = LeviathanPartHP;
      if (part.name && part.name.includes('back')) maxHp = LeviathanPartHP.back;
      else if (part.name && part.name.includes('front')) maxHp = LeviathanPartHP.front;
      else if (part.name && part.name.includes('middle')) maxHp = LeviathanPartHP.middle;
      else if (part.name && part.name.includes('t-tail')) maxHp = LeviathanPartHP.ttail;
      else if (part.name && part.name.includes('tailbeam')) maxHp = LeviathanPartHP.tailbeam;
      else if (part.name && part.name.includes('wing')) maxHp = LeviathanPartHP.wing;
      else if (part.name && part.name.includes('rotor')) maxHp = LeviathanPartHP.rotor;
      else maxHp = part.hp;
      const hpPct = constrain(part.hp / maxHp, 0, 1);
      push();
      noStroke();
      fill(60);
      rectMode(CENTER);
      rect(px, py - (img && img.height ? img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1) / 2 + 12 : 32), barW, 7, 3);
      fill('red');
      rect(px - barW * (1 - hpPct) / 2, py - (img && img.height ? img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1) / 2 + 12 : 32), barW * hpPct, 7, 3);
      pop();
    }
  }

  isAlive() {
    // Boss is alive if any part is not destroyed
    return LevParts.some(p => !p.destroyed);
  }

  // takeDamage now takes a part index and damage amount
  // Enforce destruction dependency chain: if any part in dependsOn is not destroyed, this part is invulnerable
  takeDamage(partIdx, dmg) {
    const part = LevParts[partIdx];
    if (!part || part.destroyed) return;
    if (Array.isArray(part.dependsOn) && part.dependsOn.length > 0) {
      for (let depIdx of part.dependsOn) {
        if (LevParts[depIdx] && !LevParts[depIdx].destroyed) {
          // Optionally: flash or play sound to indicate invulnerability
          part.lastDamaged = millis(); // still flash bar
          return;
        }
      }
    }
    part.hp -= dmg;
    if (part.hp <= 0) {
      part.hp = 0;
      part.destroyed = true;
      if (typeof ExplosionFX !== 'undefined' && ExplosionFX && typeof ExplosionFX.create === 'function') {
        const px = this.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
        const py = this.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
        ExplosionFX.create(px, py, { isDeathStar: true, particleCount: 32, duration: 800, scale: 0.7 });
      }
    }
    // If all parts destroyed, trigger boss death explosion/music
    if (!this.isAlive()) {
      this.destroyed = true;
      if (typeof ExplosionFX !== 'undefined' && ExplosionFX && typeof ExplosionFX.create === 'function') {
        ExplosionFX.create(this.x, this.y, { isDeathStar: true, particleCount: 120, duration: 2000, scale: 2.0 });
        for (let i = 0; i < 5; i++) {
          const angle = random(0, TWO_PI);
          const radius = random(max(this.w, this.h) * 0.8, max(this.w, this.h) * 2.0);
          const ex = this.x + cos(angle) * radius + random(-20, 20);
          const ey = this.y + sin(angle) * radius + random(-20, 20);
          ExplosionFX.create(ex, ey, { isDeathStar: true, particleCount: 100 + floor(random(0, 80)), duration: 1400 + floor(random(0, 1400)), scale: 1.4 + random(0, 0.8) });
        }
        try { if (bossMusicAudio) { bossMusicAudio.pause(); try { bossMusicAudio.currentTime = 0; } catch(e) {} } } catch (e) {}
        if (!musicMuted) {
          try { playGameMusic(); } catch (e) {}
        }
      }
    }
    part.lastDamaged = millis();
  }
}

// Leviathan part HP values for easy adjustment
const LeviathanPartHP = {
  back: 5000,
  front: 4500,
  middle: 5000,
  ttail: 2500,
  tailbeam: 2500,
  wing: 3000,
  rotor: 3000,
  ion: 750 //ion gun
};

// Leviathan part definitions (coords relative to boss center)
const LevParts = [
  // Destruction dependency chain: t-tail (3) → tailbeam (4) → back (0) → middle (2) → rotor (7,8) → wing (5,6) → front (1)
  { id: 0, layer: 0, x: -22.0, y: -60.0, scale: 0.35, rot: 0.0, img: () => LevBackImg, name: 'back.png', hp: LeviathanPartHP.back, destroyed: false, lastDamaged: 0, dependsOn: [4], isWeapon: false }, // back depends on tailbeam
  { id: 1, layer: 1, x: -8.0, y: 226.0, scale: 1.00, rot: 0.0, img: () => LevFrontImg, name: 'front.png', hp: LeviathanPartHP.front, destroyed: false, lastDamaged: 0, dependsOn: [9], isWeapon: false }, // front depends on both wings
  { id: 2, layer: 2, x: -6.0, y: 117.0, scale: 1.00, rot: 0.0, img: () => LevMiddleImg, name: 'middle.png', hp: LeviathanPartHP.middle, destroyed: false, lastDamaged: 0, dependsOn: [0], isWeapon: false }, // middle depends on back
  { id: 3, layer: 3, x: -4.0, y: -191.0, scale: 2.00, rot: 0.0, img: () => LevTTailImg, name: 't-tail.png', hp: LeviathanPartHP.ttail, destroyed: false, lastDamaged: 0, dependsOn: [], isWeapon: false }, // t-tail is first
  { id: 4, layer: 4, x: 11.0, y: -222.0, scale: 1.00, rot: 0.0, img: () => LevTailbeamImg, name: 'tailbeam.png', hp: LeviathanPartHP.tailbeam, destroyed: false, lastDamaged: 0, dependsOn: [3], isWeapon: false }, // tailbeam depends on t-tail
  { id: 5, layer: 5, x: 121.0, y: 152.0, scale: 1.00, rot: 0.0, img: () => LevWingImg, name: 'wing.png', hp: LeviathanPartHP.wing, destroyed: false, lastDamaged: 0, dependsOn: [7], isWeapon: false }, // right wing depends on right rotor
  { id: 6, layer: 6, x: -169.0, y: 151.0, scale: 1.00, rot: 0.0, img: () => LevWingImg, name: 'wing.png', hp: LeviathanPartHP.wing, destroyed: false, lastDamaged: 0, dependsOn: [8], isWeapon: false }, // left wing depends on left rotor
  { id: 7, layer: 7, x: 270.0, y: 160.0, scale: 0.3, rot: 0.0, img: () => LevRotorImg, name: 'leviathan rotor.png', hp: LeviathanPartHP.rotor, destroyed: false, lastDamaged: 0, dependsOn: [2], isWeapon: false }, // right rotor depends on middle
  // Weapon under right rotor
  //{ id: 10, layer: 7.5, x: 270.0, y: 300.0, scale: 0.18, rot: 0.0, img: () => FlamethrowerNoduleImg, name: 'flameNoduleRight.png', hp: 1000, destroyed: false, lastDamaged: 0, dependsOn: [7], isWeapon: true, activationTime: 1 },
  { id: 8, layer: 8, x: -215.0, y: 161.0, scale: 0.3, rot: 0.0, img: () => LevRotorImg, name: 'leviathan rotor.png', hp: LeviathanPartHP.rotor, destroyed: false, lastDamaged: 0, dependsOn: [2], isWeapon: false },
  // Weapon under left rotor
  //{ id: 11, layer: 8.5, x: -215.0, y: 300.0, scale: 0.18, rot: 0.0, img: () => FlamethrowerNoduleImg, name: 'flameNoduleLeft.png', hp: 1000, destroyed: false, lastDamaged: 0, dependsOn: [8], isWeapon: true, activationTime: 1 },
  { id: 9, layer: 9, x: -30, y: 320.0, scale: 0.05, rot: 0.0, img: () => LevIonGunImg, name: 'levIonGun.png', hp: LeviathanPartHP.ion, destroyed: false, lastDamaged: 0, dependsOn: [5,6], isWeapon: true, activationTime: 2 }, // ion gun is a weapon
];

function spawnMegaBeam(x, y, opts = {}) {
  const beam = {
    x: x,
    y: y,
    start: millis(),
    // if followPlayer is requested and no duration supplied, make it indefinite
    duration: (opts.duration != null) ? opts.duration : (opts.followPlayer ? Infinity : 1000),
    dps: opts.dps || 1000,
    followPlayer: !!opts.followPlayer,
    owner: opts.owner || null
  };
  // type: 'mega' or 'ion' (affects visuals and energy use)
  beam.type = opts.type || 'mega';
  // energy consumption per second for this beam (default: mega=750, ion=100)
  if (opts.energyPerSecond != null) beam.energyPerSecond = opts.energyPerSecond;
  else beam.energyPerSecond = (beam.type === 'ion') ? 100 : 7500;
  megaBeams.push(beam);
  return beam;
}

function updateAndDrawMegaBeams() {
  if (!megaBeams || megaBeams.length === 0) return;
  const now = millis();
  // draw beams on top and apply damage
  push();
  for (let i = megaBeams.length - 1; i >= 0; i--) {
    const b = megaBeams[i];
    const t = now - b.start;
    if (t > b.duration) { megaBeams.splice(i, 1); continue; }

    // If the beam should follow its owner, update its position each frame
    if (b.followPlayer && b.owner) {
      try {
        b.x = b.owner.x;
        b.y = b.owner.y;
      } catch (err) {
        // if owner reference is gone, remove beam
        megaBeams.splice(i, 1);
        continue;
      }
    }
    // If this is a Leviathan Ion Gun beam, update its position and angle
    if (b._levIonGun) {
      // Find the boss and ion gun part
      if (boss && boss.isAlive()) {
        const ionGunPart = LevParts.find(p => p.name && p.name.includes('levIonGun'));
        if (ionGunPart && !ionGunPart.destroyed) {
          const px = boss.x + ionGunPart.x * (typeof LevScale === 'number' ? LevScale : 1);
          const py = boss.y + ionGunPart.y * (typeof LevScale === 'number' ? LevScale : 1);
          const tipOffset = b._levIonGunTipOffset || 40;
          b.x = px + Math.cos(levIonGunAngle) * tipOffset;
          b.y = py + Math.sin(levIonGunAngle) * tipOffset;
          b.angle = levIonGunAngle;
        }
      }
    }

    push();
    rectMode(CENTER);
    noStroke();
    // visuals differ by beam type
    if (b.type === 'ion') {
      if (b._levIonGun && typeof b.angle === 'number') {
        // Draw rotated beam for Leviathan Ion Gun (prank: add 90 degrees)
        push();
        translate(b.x, b.y);
        rotate(b.angle + HALF_PI);
        fill('rgb(0,255,233)');
        rect(sin(frameCount), -400, 10, 800, 10);
        fill(255);
        rect(0, -400, 5, 800, 10);
        fill('rgba(0,255,255,0.71)');
        circle(0, 0, 40 + sin(frameCount / 4) * 10);
        fill('rgba(255,255,255,0.71)');
        circle(0, 0, 20 + sin(frameCount / 4) * 5);
        pop();
      } else {
        fill('rgb(0,255,233)');
        rect(b.x + sin(frameCount), b.y - 400, 10, 800, 10);
        fill(255);
        rect(b.x, b.y - 400, 5, 800, 10);
        fill('rgba(0,255,255,0.71)');
        circle(b.x, b.y, 40 + sin(frameCount / 4) * 10);
        fill('rgba(255,255,255,0.71)');
        circle(b.x, b.y, 20 + sin(frameCount / 4) * 5);
      }
    } else {
      // main red mega-beam layer
      fill('rgb(255,0,0)');
      rect(b.x + sin(tan(frameCount)), b.y - 400, 65, 800, 10);
      fill('rgb(255,248,0)');
      rect(b.x, b.y - 400, 40, 800, 10);
      fill(255);
      rect(b.x + sin(frameCount), b.y - 400, 25, 800, 10);
      fill('rgba(255,165,0,0.71)');
      circle(b.x, b.y, 80 + sin(frameCount / 4) * 10);
      fill('rgba(255,237,0,0.71)');
      circle(b.x, b.y, 40 + sin(frameCount / 4) * 5);
    }
    pop();

    // Damage: apply proportional to elapsed frame time
    const dt = (deltaTime || 16.6667) / 1000; // seconds
    const dmg = b.dps * dt;

    // Energy consumption for follow-beams: use beam-specific rate (J/s)
    if (b.followPlayer) {
      const energyPerSecond = (b.energyPerSecond != null) ? b.energyPerSecond : 750;
      const energyConsume = energyPerSecond * dt;
      energyCurrent = max(0, energyCurrent - energyConsume);
      // if energy depleted, remove all follow-beams and stop beam audios
      if (energyCurrent <= 0) {
        // clear follow beams
        for (let k = megaBeams.length - 1; k >= 0; k--) {
          const bb = megaBeams[k];
          if (bb && bb.followPlayer) megaBeams.splice(k, 1);
        }
        try {
          if (megabeamAudio) {
            megabeamAudio.pause();
            try { megabeamAudio.currentTime = 0; } catch (err) {}
          }
        } catch (err) {}
        try {
          if (ionbeamAudio) {
            ionbeamAudio.pause();
            try { ionbeamAudio.currentTime = 0; } catch (err) {}
          }
        } catch (err) {}
        // stop further processing for this frame
        pop();
        return;
      }
    }

    // Beam rectangle area: for ion gun, use rotated rectangle; for others, vertical band
    let beamTop, beamBottom, beamHalfWidth;
    let beamRect = null;
    if (b._levIonGun && typeof b.angle === 'number') {
      // Rotated beam: center at b.x, b.y, angle b.angle, length 800, width 40
      const len = 800, w = 40;
      // For collision, project player onto beam axis
      beamRect = { x: b.x, y: b.y, angle: b.angle, len, w };
    } else {
      // Default: vertical band
      beamTop = b.y - 800;
      beamBottom = b.y;
      beamHalfWidth = 40;
    }

    // Damage enemies in beam
    for (let e of enemies) {
      if (!e || e.destroyed) continue;
      let hit = false;
      if (b._levIonGun && beamRect) {
        // Project enemy onto beam axis
        const dx = e.x - beamRect.x;
        const dy = e.y - beamRect.y;
        const proj = dx * Math.cos(beamRect.angle) + dy * Math.sin(beamRect.angle);
        const perp = -dx * Math.sin(beamRect.angle) + dy * Math.cos(beamRect.angle);
        if (proj >= 0 && proj <= beamRect.len && Math.abs(perp) <= beamRect.w / 2) hit = true;
      } else {
        if (e.y >= beamTop && e.y <= beamBottom && abs(e.x - b.x) <= beamHalfWidth) hit = true;
      }
      if (hit) {
        e.health -= dmg;
        score += dmg;
        if (e.health <= 0) {
          e.destroyed = true;
          ExplosionFX.create(e.x, e.y, { duration: 400, particleCount: 12 });
        }
      }
    }

    // Damage Leviathan parts if within beam band (skip if this is a Leviathan beam)
    if (!b._levIonGun && boss && boss.isAlive()) {
      for (let i = 0; i < LevParts.length; i++) {
        const part = LevParts[i];
        if (part.destroyed) continue;
        const img = (typeof part.img === 'function') ? part.img() : part.img;
        const px = boss.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
        const py = boss.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
        let pw = img && img.width ? img.width * part.scale * (typeof LevScale === 'number' ? LevScale : 1) : 120 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        let ph = img && img.height ? img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1) : 80 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        // AABB check for beam
        if (py + ph/2 >= beamTop && py - ph/2 <= beamBottom && abs(px - b.x) <= beamHalfWidth + pw/2) {
          boss.takeDamage(i, dmg);
        }
      }
    }
    // Damage player(s) if hit by Leviathan Ion Gun beam (circle-rectangle collision)
    if (b._levIonGun && beamRect) {
      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p || !p.alive) continue;
        // Player hitbox: circle at (p.x, p.y) with radius p.size/2
        const r = (typeof p.size === 'number') ? p.size / 2 : 20;
        // Project player center onto beam axis
        const dx = p.x - beamRect.x;
        const dy = p.y - beamRect.y;
        const proj = dx * Math.cos(beamRect.angle) + dy * Math.sin(beamRect.angle);
        const perp = -dx * Math.sin(beamRect.angle) + dy * Math.cos(beamRect.angle);
        // Find closest point on beam rectangle to player center
        const clampedProj = Math.max(0, Math.min(beamRect.len, proj));
        const clampedPerp = Math.max(-beamRect.w/2, Math.min(beamRect.w/2, perp));
        // Closest point on beam
        const closestX = beamRect.x + clampedProj * Math.cos(beamRect.angle) - clampedPerp * Math.sin(beamRect.angle);
        const closestY = beamRect.y + clampedProj * Math.sin(beamRect.angle) + clampedPerp * Math.cos(beamRect.angle);
        const distSq = (p.x - closestX) * (p.x - closestX) + (p.y - closestY) * (p.y - closestY);
        if (distSq <= r * r) {
          if (i === 0) playerHealth -= dmg; else player2Health -= dmg;
          // Optionally: add hit effect here
        }
      }
    }

    // Remove enemy bullets inside beam
    for (let j = enemyBullets.length - 1; j >= 0; j--) {
      const eb = enemyBullets[j];
      if (!eb) continue;
      if (eb.y >= beamTop && eb.y <= beamBottom && abs(eb.x - b.x) <= beamHalfWidth) {
        // Ion beams only have a 0.5% chance to destroy projectiles
        if (b.type === 'ion') {
          if (Math.random() < 0.05) {
            ExplosionFX.create(eb.x, eb.y, { duration: 200, particleCount: 6 });
            enemyBullets.splice(j, 1);
          }
        } else {
          ExplosionFX.create(eb.x, eb.y, { duration: 200, particleCount: 6 });
          enemyBullets.splice(j, 1);
        }
      }
    }
  }
  pop();
}

let rubberhorseMessages = [];
let currentMessage = '🐴🐴🐴🐴🐴🐴';
let messageTimer = 0;

let playerHealth = 500;
let player2Health = 500;
let startHealth = 0;
// Storage for bombs/items (cubic meters). Default fully stocked at 10 m^3.
let storageCapacity = 10;
let storageCurrent = storageCapacity;
// Energy (Joules). Default full at 5000 J.
let energyCapacity = 5000;
let energyCurrent = energyCapacity;
let shipImg;
let planeMainImg; // Images/Plane.png
let miniPlaneImg; // Images/mini-plane.png (used for small enemy planes)
let ship2Img;
let flamethrowerImg;
let turretImg;
let assaultImg;
let bulletImg;
let helicopterBaseImg;
let helicopterRotorImg;
let tankImg;
let railgunImg;
let heavyBomberImg;
let launcherImg;
let advancedLauncherImg;
// Leviathan part images (prefix `Lev` per your request)
let LevBackImg = null;
let LevFrontImg = null;
let LevMiddleImg = null;
let LevTTailImg = null; // t-tail
let LevTailbeamImg = null;
let LevWingImg = null;
let LevRotorImg = null; // leviathan rotor (used twice)
let LevIonGunImg = null;
// Global scale applied to all Leviathan parts (multiplies each part.scale)
let LevScale = 0.5;
// cache for per-enemy bullet images (filename -> p5.Image)
let bulletImageCache = {};
let mainMenuImg;
let mainMenuActive = true;
// scrolling background image (desert)
// Background style: 'desert' or 'slate'
let bgStyle = 'slate';
let lastBgStyle = null;
let bgDesertImg = null;
let bgSlateImg = null;
// support multiple background variants per style
let bgDesertImgs = []; // array of { img: p5.Image, name: string }
let bgSlateImgs = []; // array of { img: p5.Image, name: string }
let bgCurrentName = null;
let bgImg = null;
let bgY1 = 0;
let bgY2 = 0;
let bgSpeed = 0.8; // pixels per frame, adjust for speed
let bgScaleFactor = 1.4; // how "huge" the background is relative to canvas fit
let bgInitialized = false;
let bgScaledW = 0;
let bgScaledH = 0;
// scale factor to enlarge the `mini-plane.png` when drawn for enemies
const planeScale = 0.15; // change this number to scale more/less
// scale for flamethrower image
// increased so the flamethrower graphic appears larger in-game
const flamethrowerScale = 0.25;
// scale for turret image
const turretScale = 0.2;
// scale for assault plane image
const assaultScale = 0.5 ;
// scale for helicopter base and rotor
const helicopterScale = 0.4;
const rotorScale = 0.1;
// scale for railgun image
const railgunScale = 0.3;
// scale for tank image
const tankScale = 0.1;
// scale for launcher image
const launcherScale = 1;
// scale for advanced launcher image (if provided)
const advancedLauncherScale = 1;
// scale for heavy bomber image
const heavyBomberScale = 0.8;
// Default descend speed (pixels per frame) for turret-like enemies
// Lower = slower drift; tune between ~0.2 (very slow) and ~1.5 (quick)
const DEFAULT_DESCEND_SPEED = 1.25;

// Toggle verbose spawn debugging (prints aggregate counts occasionally)
const debugSpawnCounts = false;
// Internal counters used when `debugSpawnCounts` is true
let _spawnDebugCountsMap = {};
let _spawnDebugCalls = 0;
// How often to spawn enemy groups (in frames). Default ~ once every 400 frames (~6.7s at 60fps)
let spawnIntervalFrames = 1000;

// --- SPECIAL ATTACKS (pluggable wiring) ---
// Keys: z, x, c, v, b, n, m (lowercase)
const SPECIAL_KEYS = ['z','x','c','v','b','n','m'];
// key -> registered attack id (filled when attacks are registered)
const KEY_BINDINGS = {};
for (let k of SPECIAL_KEYS) KEY_BINDINGS[k] = null;

// Registry to hold attack definitions and state
const specialAttackRegistry = {
  entries: {},
  register(spec) {
    const id = spec.id || (spec.key ? `spec_${spec.key.toLowerCase()}` : `spec_${Object.keys(this.entries).length}`);
    const key = spec.key ? spec.key.toLowerCase() : null;
    this.entries[id] = Object.assign({
      id,
      key,
      label: spec.label || id,
      cooldown: spec.cooldown || 0,
      type: spec.type || 'instant', // 'instant' | 'charge' | 'toggle'
      handler: spec.handler || null,
      onRelease: spec.onRelease || null,
      lastUsed: 0,
//mainMenuActive = false,
 //mainMenuImg = null,
      active: false,
      _pressTime: 0,
      _isCharging: false
    }, spec);
    if (key) KEY_BINDINGS[key] = id;
    return id;
  },
  unregister(id) {
    const e = this.entries[id];
    if (!e) return;
    if (e.key) KEY_BINDINGS[e.key] = null;
    delete this.entries[id];
  },
  canUse(id) {
    const e = this.entries[id];
    if (!e) return false;
    return (millis() - (e.lastUsed || 0)) >= (e.cooldown || 0);
  },
  trigger(id, ctx) {
    const e = this.entries[id];
    if (!e) return false;
    if (!this.canUse(id)) return false;
    // call handler for instant/toggle; charge handlers are invoked on release
    if (e.handler) {
      try {
        e.handler(player, Object.assign({ key: e.key }, ctx || {}));
      } catch (err) {
        console.error('special handler error', err);
      }
    }
    e.lastUsed = millis();
    return true;
  }
};

// Helper functions exposed to handlers
function spawnPlayerBullet(x, y, angle, speed, size, color, damage) {
  let isAdvanced = typeof advBulletActive !== 'undefined' && advBulletActive;
  bullets.push(new Bullet(x, y, angle, speed, size, color, damage, isAdvanced));
}

function spawnExplosionAt(x, y) {
  ExplosionFX.create(x, y);
}

// UI / debug toggle for specials
let debugSpecials = false;

// --- Nuke visual state ---
let nukeStart = 0;
let nukeActive = false;
let nukeX = 0;
let nukeY = 0;
// whether we've cleared enemies for the current nuke (only once)
let nukeCleared = false;
// timestamp (ms) until which spawning is suppressed
let nukeNoSpawnUntil = 0;
// Nuke audio
let nukeAudio = null;
let nukeSoundPlayed = false;
// Mega beam audio
let megabeamAudio = null;
// Whether the player has purchased the Mega Beam
let megaBeamOwned = false;//change to false later
// Ion beam audio and ownership
let ionbeamAudio = null;
let ionBeamOwned = false;//change to false later
// Repair pack audio
let repairAudio = null;
// Store audio
let storeAudio = null;
// Buy audio
let buyAudio = null;
// Big one-time purchase audio (e.g., MEGA / ION)
let buyBigAudio = null;
// Bulk purchase audio (shift+click)
let bulkBuyAudio = null;
// Solar panels: passive energy regen (count)
let solarPanelsCount = 0;
// Repair packs: consumable health packs
let repairPacksCount = 3;
// Shop icons for beams
let megaBeamIconImg = null;
let ionBeamIconImg = null;
// Menu music
let shrineAudio = null;
let fallenComradeAudio = null;
let currentMenuAudio = null;
// Gameplay music tracks
let deathOvertureAudio = null;
let heIsComingAudio = null;
let greatFightAudio = null;
let gameTracks = [];
let currentGameTrackIndex = 0;
let currentGameAudio = null;
// Boss-specific music
let bossMusicAudio = null;

function triggerNuke(x, y) {
  nukeStart = frameCount;
  nukeActive = true;
  nukeX = x || width / 2;
  nukeY = y || height / 2;
  nukeCleared = false;
  nukeSoundPlayed = false;
}

function nuke(x, y) {
  if (!nukeActive) return;

  let elapsed = frameCount - nukeStart;

  push();
  translate(x, y);
  scale(2.5); // bigger explosion overall
  // ---------- PHASE 1: Ignition (0–60 frames) ----------
  if (elapsed < 60) {
    let r = 50 + elapsed * 3;

    // bloom layers
    for (let i = 6; i > 0; i--) {
      fill(255, 140, 0, 20);
      noStroke();
      circle(0, 0, r + i * 30);
    }

    fill(255, 200, 50);
    circle(0, 0, r);
  }

  // ---------- PHASE 2: Unstable Core (60–180) ----------
  if (elapsed >= 60 && elapsed < 180) {
    let pulse = sin(frameCount * 0.25) * 15;

    // play nuke sound once at the start of phase 2
    if (!nukeSoundPlayed && nukeAudio) {
      try {
        nukeAudio.currentTime = 0;
        nukeAudio.play().catch(() => {});
      } catch (err) {
        // ignore play errors
      }
      nukeSoundPlayed = true;
    }

    // soft outer glow
    for (let i = 8; i > 0; i--) {
      fill(255, 160, 0, 15);
      circle(0, 0, 200 + i * 25 + pulse);
    }

    // bright core
    fill(255, 255, 230);
    circle(0, 0, 120 + pulse);

    // light rays
    stroke(255, 200, 100, 50);
    strokeWeight(2);
    for (let i = 0; i < 30; i++) {
      let angle = TWO_PI / 30 * i + frameCount * 0.02;
      let len = 250 + random(-20, 20);
      line(0, 0, cos(angle) * len, sin(angle) * len);
    }
  }

  // ---------- PHASE 3: Blinding Flash (at 180) ----------
  if (elapsed == 180) {
    background(255);
  }

  // ---------- PHASE 4: Massive Shockwave (180+) ----------
  if (elapsed > 180) {
    let shock = (elapsed - 180) * 14;

    // screen shake
    translate(random(-6, 6), random(-6, 6));

    noFill();
    stroke(255, 220);
    strokeWeight(8);
    circle(0, 0, shock);

    // dust ring behind it
    stroke(180, 120);
    strokeWeight(20);
    circle(0, 0, shock - 40);

    if (shock > 900) {
      nukeActive = false;
    }
  }

  // On first frame of shockwave, clear enemies on-screen and suppress spawning
  if (elapsed > 180 && !nukeCleared) {
    // destroy enemies that are currently on-screen (with small margin)
    const margin = 50;
    for (let e of enemies) {
      if (e.x >= -margin && e.x <= width + margin && e.y >= -margin && e.y <= height + margin) {
        e.destroyed = true;
        // small per-enemy bursts
        ExplosionFX.create(e.x, e.y);
      }
    }
    // also clear all enemy-fired bullets (splice them out) and show small flashes
    for (let b of enemyBullets) {
      // small short-lived flash for each bullet removed
      ExplosionFX.create(b.x, b.y, { duration: 300, particleCount: 8 });
    }
    enemyBullets = [];

    // If a boss exists, apply large AoE damage from the nuke
    if (boss && boss.isAlive()) {
      // nuke shock radius in screen-space (matching the visual shock size scaled earlier)
      const nukeRadius = 900; // matches the shock threshold used later
      const d = dist(x, y, boss.x, boss.y);
      if (d <= nukeRadius) {
        // big damage to boss — use a large value but not instant-kill
        try { boss.takeDamage(3000); } catch (err) {}
      }
    }

    // suppress spawning for 5 seconds
    // create a single massive explosion at the nuke center
    ExplosionFX.create(x, y, { isDeathStar: true, duration: 2000, particleCount: 120 });
    nukeNoSpawnUntil = millis() + 5000;
    nukeCleared = true;
  }

  pop();
}

// Initialize or restart the game. If `buddy` is true, create two players.
function startGame(buddy = false) {
  buddyMode = Boolean(buddy);
  // reset gameplay state
  bullets = [];
  enemyBullets = [];
  enemies = [];
  explosions = [];
  score = 0;

  // reset player healths
  playerHealth = 500;//default 500
  player2Health = 500;//default 500
  startHealth = playerHealth + 250; //allows for BONUS health from repair packs

  players = [];
  // reset storage to full on game start
  storageCurrent = storageCapacity;
  // reset energy to full on game start
  energyCurrent = energyCapacity;
  // reset nukes to default on game start
  //nukesCount = 0;
  // reset bombs to default on game start
  //ombsCount = 0;
  if (buddyMode) {
    // place players apart horizontally
    const p1 = new Player(width * 0.25, height - 60, planeMainImg || shipImg, 'wasd');
    const p2 = new Player(width * 0.75, height - 60, ship2Img || planeMainImg || shipImg, 'arrows');
    players.push(p1, p2);
    player = players[0];
  } else {
    const p = new Player(width / 2, height - 60, planeMainImg || shipImg, 'mouse');
    players.push(p);
    player = p;
  }

  // spawn an initial group
  spawnEnemyGroup();
  // schedule boss spawn 15 seconds after game start
  boss = null;
  bossHasSpawned = false;
  bossSpawnAt = millis() + 120000; // ms (2 minutes)
  frameRate(60);
  // stop menu music (if playing) and start gameplay music
  stopMenuMusic();
  playGameMusic();
}

function preload() {
      // Load flame image for flamethrower projectiles
      loadImage('advanced bullet.png',
        img => { advancedBulletImg = img; console.log('Loaded image: advanced bullet.png'); },
        err => { console.warn('advanced bullet.png failed to load.'); }
      );
      loadImage('Images/flame.png',
        img => { FlameImg = img; console.log('Loaded image: Images/flame.png'); },
        err => { console.warn('Images/flame.png failed to load.'); }
      );
    // Load flamethrower nodule image for rotor weapons
    loadImage('Images/realistic Flamethrower nodule barrel.png',
      img => { FlamethrowerNoduleImg = img; console.log('Loaded image: Images/realistic Flamethrower nodule barrel.png'); },
      err => { console.warn('Images/realistic Flamethrower nodule barrel.png failed to load.'); }
    );
  // Attempt the common paths for the ship image. If the first path fails
  // (404), try a fallback that matches the current project content.
  // p5 will wait for these loads during preload.
  loadImage('Images/ship.png',
    img => { shipImg = img; console.log('Loaded image: Images/ship.png'); },
    err => {
      console.warn('Images/ship.png failed to load (404). Trying fallback Images/Plane.png');
      loadImage('Images/Plane.png',
        img2 => { shipImg = img2; console.log('Loaded image: Images/Plane.png'); },
        err2 => { console.warn('Fallback Images/Plane.png also failed to load. No ship image available.'); }
      );
    }
  );

  // initialize audio for nuke (if available)
  setupNukeAudio();
  // initialize megabeam audio (if available)
  setupMegaBeamAudio();
  // initialize ionbeam audio
  setupIonBeamAudio();
  // initialize repair pack audio
  setupRepairAudio();
  // initialize store audio
  setupStoreAudio();
  // initialize menu music
  setupMenuAudio();
  // initialize gameplay music
  setupGameAudio();
  // initialize buy_big and bulk buy audios
  setupBuyBigAudio();
  setupBulkBuyAudio();
  // initialize buy audio
  setupBuyAudio();

  // Load player plane images: primary and buddy variant
  // Helper: try multiple candidate paths to tolerate case/space differences across hosts
  function tryLoadImage(candidates, onSuccess, onFailure) {
    if (!Array.isArray(candidates)) candidates = [candidates];
    let tried = 0;
    function attemptNext() {
      if (tried >= candidates.length) {
        if (typeof onFailure === 'function') onFailure();
        return;
      }
      const p = candidates[tried++];
      loadImage(p,
        img => { if (typeof onSuccess === 'function') onSuccess(img, p); },
        err => { attemptNext(); }
      );
    }
    attemptNext();
  }

  tryLoadImage(['Images/Plane.png', 'Plane.png', 'images/Plane.png'],
    (img, path) => { planeMainImg = img; console.log('Loaded image:', path); },
    () => { console.warn('No planeMain image found in expected locations'); }
  );

  tryLoadImage(['Images/plane-2.png', 'plane-2.png', 'Images/Plane-2.png', 'Images/plane-2.PNG'],
    (img, path) => { ship2Img = img; console.log('Loaded buddy image:', path); },
    () => { console.warn('Buddy plane image not found; buddy will fallback to primary plane'); }
  );
  // Load the mini plane image for enemy `plane` type. Try common lowercase path then fallback.
  loadImage('Images/mini-plane.png',
    img => { miniPlaneImg = img; console.log('Loaded image: Images/mini-plane.png'); },
    err => {
      console.warn('Images/mini-plane.png failed to load. Trying fallback Images/mini-plane.png');
      loadImage('Images/mini-plane.png',
        img2 => { miniPlaneImg = img2; console.log('Loaded image: Images/mini-plane.png'); },
        err2 => { console.warn('Fallback Images/mini-plane.png also failed to load. No mini plane image available.'); }
      );
    }
  );
  // Load flamethrower image (used by Flamethrower enemy)
  tryLoadImage(['Images/flamethrower.png', 'Images/Flamethrower.png', 'flamethrower.png', 'Flamethrower.png', 'Images/flamethrower_LEV.png'],
    (img, path) => { flamethrowerImg = img; console.log('Loaded flamethrower image:', path); },
    () => { console.warn('Flamethrower image not found in expected locations'); }
  );
  // Load helicopter base and rotor images (if present). There are two assets in the Images folder.
  loadImage('Images/helicopter_base.png',
    img => { helicopterBaseImg = img; console.log('Loaded image: Images/helicopter_base.png'); },
    err => {
      console.warn('Images/helicopter_base.png failed to load. Trying fallback helicopter_base.png');
      loadImage('helicopter_base.png',
        img2 => { helicopterBaseImg = img2; console.log('Loaded image: helicopter_base.png'); },
        err2 => { console.warn('No helicopter base image found.'); }
      );
    }
  );
  loadImage('Images/helicopter_rotor.png',
    img => { helicopterRotorImg = img; console.log('Loaded image: Images/helicopter_rotor.png'); },
    err => {
      console.warn('Images/helicopter_rotor.png failed to load. Trying fallback helicopter_rotor.png');
      loadImage('helicopter_rotor.png',
        img2 => { helicopterRotorImg = img2; console.log('Loaded image: helicopter_rotor.png'); },
        err2 => { console.warn('No helicopter rotor image found.'); }
      );
    }
  );
  // Load main menu background image
  loadImage('Images/main menu.png',
    img => { mainMenuImg = img; console.log('Loaded image: Images/main menu.png'); },
    err => {
      console.warn('Images/main menu.png failed to load. Trying fallback Images/main_menu.png');
      loadImage('Images/main_menu.png',
        img2 => { mainMenuImg = img2; console.log('Loaded image: Images/main_menu.png'); },
        err2 => { console.warn('Fallback main menu image not found.'); }
      );
    }
  );
  // Load turret texture (no draw changes yet)
  loadImage('Images/turret.png',
    img => { turretImg = img; console.log('Loaded image: Images/turret.png'); },
    err => {
      console.warn('Images/turret.png failed to load. Trying fallback turret.png');
      loadImage('turret.png',
        img2 => { turretImg = img2; console.log('Loaded image: turret.png'); },
        err2 => { console.warn('Fallback turret image not found.'); }
      );
    }
  );
  // Load cucumber assault plane image
  loadImage('Images/cucumber assault plane.png',
    img => { assaultImg = img; console.log('Loaded image: Images/cucumber assault plane.png'); },
    err => {
      console.warn('Images/cucumber assault plane.png failed to load. Trying fallback cucumber_assault_plane.png');
      loadImage('Images/cucumber_assault_plane.png',
        img2 => { assaultImg = img2; console.log('Loaded image: Images/cucumber_assault_plane.png'); },
        err2 => { console.warn('Fallback assault image not found.'); }
      );
    }
  );
  // Load tank image (if you add one to Images/tank.png). Fall back to launcher images.
  loadImage('Images/tank.png',
    img => { tankImg = img; console.log('Loaded image: Images/tank.png'); },
    err => {
      console.warn('Images/tank.png failed to load. Trying fallback Images/launcher.png');
      // try a launcher image as a fallback for tank visuals
      loadImage('Images/launcher.png',
        img2 => { tankImg = img2; console.log('Loaded image: Images/launcher.png (fallback)'); },
        err2 => {
          console.warn('Fallback launcher image failed. Trying advanced launcher.');
          loadImage('Images/Cucumber assault plane.png',
            img3 => { tankImg = img3; console.log('Loaded image: Images/advanced launcher.png (fallback)'); },
            err3 => { console.warn('No fallback tank image found.'); }
          );
        }
      );
    }
  );
  // Load health pickup image (optional)
  loadImage('Images/health pickup.png',
    img => { healthPickupImg = img; console.log('Loaded image: Images/health pickup.png'); },
    err => {
      console.warn('Images/health pickup.png failed to load. Trying fallback health_pickup.png');
      loadImage('Images/health_pickup.png',
        img2 => { healthPickupImg = img2; console.log('Loaded image: Images/health_pickup.png'); },
        err2 => { console.warn('No health pickup image found.'); }
      );
    }
  );
  // Load store icons (optional)
  loadImage('Images/nuke pickup.png',
    img => { nukePickupImg = img; console.log('Loaded image: Images/nuke pickup.png'); },
    err => {
      console.warn('Images/nuke pickup.png failed to load.');
    }
  );
  loadImage('Images/bomb pickup.png',
    img => { bombPickupImg = img; console.log('Loaded image: Images/bomb pickup.png'); },
    err => {
      console.warn('Images/bomb pickup.png failed to load.');
    }
  );
  loadImage('Images/repair kit.png',
    img => { repairKitImg = img; console.log('Loaded image: Images/repair kit.png'); },
    err => {
      console.warn('Images/repair kit.png failed to load.');
    }
  );
  // Load crate icon for storage (optional)
  loadImage('Images/crate.png',
    img => { crateImg = img; console.log('Loaded image: Images/crate.png'); },
    err => {
      console.warn('Images/crate.png failed to load. Trying fallback crate.png');
      loadImage('crate.png',
        img2 => { crateImg = img2; console.log('Loaded image: crate.png'); },
        err2 => { console.warn('No crate image found.'); }
      );
    }
  );
  // Load accumulator icon (optional)
  loadImage('Images/accumulator.png',
    img => { accumulatorImg = img; console.log('Loaded image: Images/accumulator.png'); },
    err => {
      console.warn('Images/accumulator.png failed to load. Trying fallback accumulator.png');
      loadImage('accumulator.png',
        img2 => { accumulatorImg = img2; console.log('Loaded image: accumulator.png'); },
        err2 => { console.warn('No accumulator image found.'); }
      );
    }
  );
  // Load solar panel icon (optional)
  loadImage('Images/solar panel.png',
    img => { solarPanelImg = img; console.log('Loaded image: Images/solar panel.png'); },
    err => {
      console.warn('Images/solar panel.png failed to load. Trying fallback solar_panel.png');
      loadImage('Images/solar_panel.png',
        img2 => { solarPanelImg = img2; console.log('Loaded image: Images/solar_panel.png'); },
        err2 => { console.warn('No solar panel image found.'); }
      );
    }
  );
  // Load Ion & Mega beam icons (optional)
  loadImage('Images/ion beam.png',
    img => { ionBeamIconImg = img; console.log('Loaded image: Images/ion beam.png'); },
    err => {
      console.warn('Images/ion beam.png failed to load. Trying fallback ion_beam.png');
      loadImage('Images/ion_beam.png',
        img2 => { ionBeamIconImg = img2; console.log('Loaded image: Images/ion_beam.png'); },
        err2 => { console.warn('No ion beam image found.'); }
      );
    }
  );
  loadImage('Images/megabeam.png',
    img => { megaBeamIconImg = img; console.log('Loaded image: Images/megabeam.png'); },
    err => {
      console.warn('Images/megabeam.png failed to load.');
    }
  );
  // Load railgun image
  loadImage('Images/railgun.png',
    img => { railgunImg = img; console.log('Loaded image: Images/railgun.png'); },
    err => {
      console.warn('Images/railgun.png failed to load. Trying fallback railgun.png');
      loadImage('railgun.png',
        img2 => { railgunImg = img2; console.log('Loaded image: railgun.png'); },
        err2 => { console.warn('Fallback railgun image not found.'); }
      );
    }
  );
  // Load launcher image (used by `launcher` enemy)
  loadImage('Images/launcher.png',
    img => { launcherImg = img; console.log('Loaded image: Images/launcher.png'); },
    err => {
      console.warn('Images/launcher.png failed to load. Trying fallback launcher.png');
      loadImage('launcher.png',
        img2 => { launcherImg = img2; console.log('Loaded image: launcher.png'); },
        err2 => { console.warn('No launcher image found.'); }
      );
    }
  );
  // Load advanced launcher image (if you added `Images/advanced launcher.png`)
  loadImage('Images/advanced launcher.png',
    img => { advancedLauncherImg = img; console.log('Loaded image: Images/advanced launcher.png'); },
    err => {
      console.warn('Images/advanced launcher.png failed to load. Trying fallback advanced launcher.png');
      loadImage('advanced launcher.png',
        img2 => { advancedLauncherImg = img2; console.log('Loaded image: advanced launcher.png'); },
        err2 => { /* no advanced launcher image — that's fine */ }
      );
    }
  );
  // Load heavy bomber image
  loadImage('Images/heavy bomber.png',
    img => { heavyBomberImg = img; console.log('Loaded image: Images/heavy bomber.png'); },
    err => {
      console.warn('Images/heavy bomber.png failed to load. Trying fallback heavy_bomber.png');
      loadImage('Images/heavy_bomber.png',
        img2 => { heavyBomberImg = img2; console.log('Loaded image: Images/heavy_bomber.png'); },
        err2 => { console.warn('Fallback heavy bomber image not found.'); }
      );
    }
  );
  // --- Load Leviathan (steel leviathan) part images ---
  loadImage('Images/steel leviathan/back.png',
    img => { LevBackImg = img; console.log('Loaded image: Images/steel leviathan/back.png'); },
    err => { console.warn('Images/steel leviathan/back.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/front.png',
    img => { LevFrontImg = img; console.log('Loaded image: Images/steel leviathan/front.png'); },
    err => { console.warn('Images/steel leviathan/front.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/levIonGun.png',
    img => { LevIonGunImg = img; console.log('Loaded image: Images/steel leviathan/levIonGun.png'); },
    err => { console.warn('Images/steel leviathan/levIonGun.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/middle.png',
    img => { LevMiddleImg = img; console.log('Loaded image: Images/steel leviathan/middle.png'); },
    err => { console.warn('Images/steel leviathan/middle.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/t-tail.png',
    img => { LevTTailImg = img; console.log('Loaded image: Images/steel leviathan/t-tail.png'); },
    err => { console.warn('Images/steel leviathan/t-tail.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/tailbeam.png',
    img => { LevTailbeamImg = img; console.log('Loaded image: Images/steel leviathan/tailbeam.png'); },
    err => { console.warn('Images/steel leviathan/tailbeam.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/wing.png',
    img => { LevWingImg = img; console.log('Loaded image: Images/steel leviathan/wing.png'); },
    err => { console.warn('Images/steel leviathan/wing.png failed to load.'); }
  );
  loadImage('Images/steel leviathan/leviathan rotor.png',
    img => { LevRotorImg = img; console.log('Loaded image: Images/steel leviathan/leviathan rotor.png'); },
    err => { console.warn('Images/steel leviathan/leviathan rotor.png failed to load.'); }
  );
  // Load large desert background into bgDesertImg (try several likely filenames)
  loadImage('Images/desert_02.png',
    img => { bgDesertImg = img; bgDesertImgs.push({ img, name: 'Images/desert_02.png' }); console.log('Loaded image: Images/desert_02.png'); },
    err => {
      console.warn('Images/desert_02.png failed. Trying Images/dessert_02.png');
      loadImage('Images/dessert_02.png',
        img2 => { bgDesertImg = img2; bgDesertImgs.push({ img: img2, name: 'Images/dessert_02.png' }); console.log('Loaded image: Images/desert_02.png'); },
        err2 => {
          console.warn('Images/dessert_02.png failed. Trying Images/dessert _02.png');
          loadImage('Images/dessert _02.png',
            img3 => { bgDesertImg = img3; bgDesertImgs.push({ img: img3, name: 'Images/dessert _02.png' }); console.log('Loaded image: Images/dessert _02.png'); },
            err3 => { console.warn('No desert background image found.'); }
          );
        }
      );
    }
  );
  // Try additional desert variants (desert_01..desert_04)
  for (let i = 1; i <= 4; i++) {
    const fname = `Images/desert_0${i}.png`;
    // skip the one we already attempted (02) will be deduped by array contents
    loadImage(fname,
      img => {
        // avoid duplicates by name
        if (!bgDesertImgs.find(o => o.name === fname)) bgDesertImgs.push({ img, name: fname });
        console.log('Loaded desert variant:', fname);
      },
      err => {
        // ignore missing variants
      }
    );
  }
  // Load slate background option
  loadImage('Images/slate_01.png',
    img => { bgSlateImg = img; bgSlateImgs.push({ img, name: 'Images/slate_01.png' }); console.log('Loaded image: Images/slate_01.png'); },
    err => {
      console.warn('Images/slate_01.png failed. Trying Images/slate.png');
      loadImage('Images/slate.png',
        img2 => { bgSlateImg = img2; bgSlateImgs.push({ img: img2, name: 'Images/slate.png' }); console.log('Loaded image: Images/slate.png'); },
        err2 => { console.warn('No slate background image found.'); }
      );
    }
  );
  // Try additional slate variants (slate_02..slate_04)
  for (let i = 2; i <= 4; i++) {
    const fname = `Images/slate_0${i}.png`;
    loadImage(fname,
      img => {
        if (!bgSlateImgs.find(o => o.name === fname)) bgSlateImgs.push({ img, name: fname });
        console.log('Loaded slate variant:', fname);
      },
      err => { /* ignore missing */ }
    );
  }
  // Load player bullet sprite
  loadImage('Images/bullet.png',
    img => { bulletImg = img; console.log('Loaded image: Images/bullet.png'); },
    err => {
      console.warn('Images/bullet.png failed to load. Trying fallback bullet.png');
      loadImage('bullet.png',
        img2 => { bulletImg = img2; console.log('Loaded image: bullet.png'); },
        err2 => { console.warn('Fallback bullet image not found.'); }
      );
    }
  );
  // Preload any per-enemy bullet images specified in enemyTypes.bulletImage
  // Build a set of unique filenames first
  try {
    const seen = new Set();
    for (const k of Object.keys(enemyTypes)) {
      const t = enemyTypes[k];
      if (!t) continue;

      // Prefer image declared inside the bullet stats: enemyTypes[type].bullet.image
      // Fall back to the older top-level enemyTypes[type].bulletImage for compatibility.
      let fname = null;
      if (t.bullet && typeof t.bullet === 'object' && typeof t.bullet.image === 'string') {
        fname = t.bullet.image;
      } else if (typeof t.bulletImage === 'string') {
        fname = t.bulletImage;
      }

      if (fname && !seen.has(fname)) {
        seen.add(fname);
        // load and store into cache by filename
        loadImage(fname,
          img => { bulletImageCache[fname] = img; console.log('Loaded enemy bullet image:', fname); },
          err => { console.warn('Failed to load enemy bullet image:', fname); }
        );
      }
    }
  } catch (e) {
    // enemyTypes may not be fully defined yet in some edit sequences; ignore errors
  }
}
// Try to initialize nuke audio (fallback paths). Called from setup().
function setupNukeAudio() {
  try {
    nukeAudio = new Audio('Sounds/nuke.mp3');
    nukeAudio.preload = 'auto';
    nukeAudio.volume = 0.85;
    nukeAudio.addEventListener('error', function onErr() {
      // fallback to project root
      nukeAudio = new Audio('nuke.mp3');
      nukeAudio.preload = 'auto';
      nukeAudio.volume = 1.0;
      nukeAudio.addEventListener('error', function onErr2() {
        // give up, leave nukeAudio null
        nukeAudio = null;
      });
    });
  } catch (e) {
    nukeAudio = null;
  }
}
// Try to initialize megabeam audio (fallback paths). Called from preload().
function setupMegaBeamAudio() {
  try {
    megabeamAudio = new Audio('Sounds/megabeam.mp3');
    megabeamAudio.preload = 'auto';
    megabeamAudio.loop = true;
    megabeamAudio.volume = 0.75;
    megabeamAudio.addEventListener('error', function onErr() {
      // fallback to project root
      megabeamAudio = new Audio('megabeam.mp3');
      megabeamAudio.preload = 'auto';
      megabeamAudio.loop = true;
      megabeamAudio.volume = 0.75;
      megabeamAudio.addEventListener('error', function onErr2() {
        // give up, leave megabeamAudio null
        megabeamAudio = null;
      });
    });
  } catch (e) {
    megabeamAudio = null;
  }
}
// Try to initialize ionbeam audio (fallback paths). Called from preload().
function setupIonBeamAudio() {
  try {
    ionbeamAudio = new Audio('Sounds/ionbeam.mp3');
    ionbeamAudio.preload = 'auto';
    ionbeamAudio.loop = true;
    ionbeamAudio.volume = 0.7;
    ionbeamAudio.addEventListener('error', function onErr() {
      ionbeamAudio = new Audio('ionbeam.mp3');
      ionbeamAudio.preload = 'auto';
      ionbeamAudio.loop = true;
      ionbeamAudio.volume = 0.7;
      ionbeamAudio.addEventListener('error', function onErr2() { ionbeamAudio = null; });
    });
  } catch (e) {
    ionbeamAudio = null;
  }
}
// Try to initialize repair pack sound (fallback paths). Called from preload().
function setupRepairAudio() {
  try {
    repairAudio = new Audio('Sounds/repair.mp3');
    repairAudio.preload = 'auto';
    repairAudio.volume = 0.9;
    repairAudio.addEventListener('error', function onErr() {
      repairAudio = new Audio('repair.mp3');
      repairAudio.preload = 'auto';
      repairAudio.volume = 0.9;
      repairAudio.addEventListener('error', function onErr2() { repairAudio = null; });
    });
  } catch (e) {
    repairAudio = null;
  }
}
// Try to initialize store audio (fallback paths). Called from preload().
function setupStoreAudio() {
  try {
    storeAudio = new Audio('Sounds/store.mp3');
    storeAudio.preload = 'auto';
    storeAudio.volume = 0.85;
    storeAudio.addEventListener('error', function onErr() {
      storeAudio = new Audio('store.mp3');
      storeAudio.preload = 'auto';
      storeAudio.volume = 0.85;
      storeAudio.addEventListener('error', function onErr2() { storeAudio = null; });
    });
  } catch (e) {
    storeAudio = null;
  }
}

// Try to initialize buy audio (fallback paths). Called from preload().
function setupBuyAudio() {
  try {
    buyAudio = new Audio('Sounds/buy.mp3');
    buyAudio.preload = 'auto';
    buyAudio.volume = 0.9;
    buyAudio.addEventListener('error', function onErr() {
      buyAudio = new Audio('buy.mp3');
      buyAudio.preload = 'auto';
      buyAudio.volume = 0.9;
      buyAudio.addEventListener('error', function onErr2() { buyAudio = null; });
    });
  } catch (e) {
    buyAudio = null;
  }
}

function playBuySound() {
  if (!buyAudio) return;
  try { buyAudio.currentTime = 0; buyAudio.play().catch(() => {}); } catch (err) {}
}
// Try to initialize buy_big audio (one-time purchases)
function setupBuyBigAudio() {
  try {
    buyBigAudio = new Audio('Sounds/buy_big.mp3');
    buyBigAudio.preload = 'auto';
    buyBigAudio.volume = 0.95;
    buyBigAudio.addEventListener('error', function onErr() {
      buyBigAudio = new Audio('buy_big.mp3');
      buyBigAudio.preload = 'auto';
      buyBigAudio.volume = 0.95;
      buyBigAudio.addEventListener('error', function onErr2() { buyBigAudio = null; });
    });
  } catch (e) { buyBigAudio = null; }
}
function playBuyBigSound() { if (!buyBigAudio) return; try { buyBigAudio.currentTime = 0; buyBigAudio.play().catch(()=>{}); } catch (e) {} }

// Try to initialize bulk buy audio (bulk purchases)
function setupBulkBuyAudio() {
  try {
    bulkBuyAudio = new Audio('Sounds/bulk buy.mp3');
    bulkBuyAudio.preload = 'auto';
    bulkBuyAudio.volume = 0.95;
    bulkBuyAudio.addEventListener('error', function onErr() {
      bulkBuyAudio = new Audio('bulk_buy.mp3');
      bulkBuyAudio.preload = 'auto';
      bulkBuyAudio.volume = 0.95;
      bulkBuyAudio.addEventListener('error', function onErr2() { bulkBuyAudio = null; });
    });
  } catch (e) { bulkBuyAudio = null; }
}
function playBulkBuySound() { if (!bulkBuyAudio) return; try { bulkBuyAudio.currentTime = 0; bulkBuyAudio.play().catch(()=>{}); } catch (e) {} }

function playPurchaseSound(item, qty) {
  // qty > 1 => bulk
  if (qty && qty > 1) { playBulkBuySound(); return; }
  // one-time purchases (item.onceOnly true or known ids)
  if (item && (item.onceOnly || item.id === 'mega' || item.id === 'ion')) { playBuyBigSound(); return; }
  // default
  playBuySound();
}

// Load menu music tracks and prepare them
function setupMenuAudio() {
  try {
    shrineAudio = new Audio('Soundtracks/shrine by vg221horz.mp3');
    shrineAudio.preload = 'auto';
    shrineAudio.loop = true;
    shrineAudio.volume = 0.6;
  } catch (e) { shrineAudio = null; }
  try {
    fallenComradeAudio = new Audio('Soundtracks/fallen comrade by vg221horz.mp3');
    fallenComradeAudio.preload = 'auto';
    fallenComradeAudio.loop = true;
    fallenComradeAudio.volume = 0.6;
  } catch (e) { fallenComradeAudio = null; }
}

function playMenuMusic() {
  // stop any currently playing menu track
  stopMenuMusic();
  // pick one of the two tracks (random choice)
  const candidates = [];
  if (shrineAudio) candidates.push(shrineAudio);
  if (fallenComradeAudio) candidates.push(fallenComradeAudio);
  if (!candidates.length) return;
  currentMenuAudio = random(candidates);
  try { currentMenuAudio.currentTime = 0; currentMenuAudio.play().catch(()=>{}); } catch (e) {}
}

function stopMenuMusic() {
  if (!currentMenuAudio) return;
  try { currentMenuAudio.pause(); currentMenuAudio.currentTime = 0; } catch (e) {}
  currentMenuAudio = null;
}

// Load gameplay music tracks
function setupGameAudio() {
  /*
  try {
    deathOvertureAudio = new Audio('Soundtracks/death overture by vghorz221.mp3');
    deathOvertureAudio.preload = 'auto';
    deathOvertureAudio.volume = 0.7;
  } catch (e) { deathOvertureAudio = null; }
   */
  
  try {
    greatFightAudio = new Audio('Soundtracks/the great fight by vg221horz.mp3');
    greatFightAudio.preload = 'auto';
    greatFightAudio.volume = 0.7;
  } catch (e) { greatFightAudio = null; }

try {
    heIsComingAudio = new Audio('Soundtracks/he is coming by vg221horz.mp3');
    heIsComingAudio.preload = 'auto';
    heIsComingAudio.volume = 0.7;
  } catch (e) { heIsComingAudio = null; }


  try {
    bossMusicAudio = new Audio('Soundtracks/he is coming by vg221horz.mp3');
    bossMusicAudio.preload = 'auto';
    bossMusicAudio.loop = true;
    bossMusicAudio.volume = 0.8;
  } catch (e) { bossMusicAudio = null; }
  // build track list in available order
  gameTracks = [];
  if (deathOvertureAudio) gameTracks.push(deathOvertureAudio);
  if (heIsComingAudio) gameTracks.push(heIsComingAudio);
  if (greatFightAudio) gameTracks.push(greatFightAudio);
  currentGameTrackIndex = 0;
}

function playNextGameTrack() {
  if (!gameTracks || gameTracks.length === 0) return;
  // advance index
  currentGameTrackIndex = (currentGameTrackIndex) % gameTracks.length;
  // stop previous
  if (currentGameAudio) {
    try { currentGameAudio.pause(); currentGameAudio.currentTime = 0; } catch (e) {}
  }
  currentGameAudio = gameTracks[currentGameTrackIndex];
  // when this track ends, advance to next
  try {
    currentGameAudio.onended = function() {
      currentGameTrackIndex = (currentGameTrackIndex + 1) % gameTracks.length;
      playNextGameTrack();
    };
  } catch (e) { /* ignore */ }
  try { currentGameAudio.currentTime = 0; currentGameAudio.play().catch(()=>{}); } catch (e) {}
}

function playGameMusic() {
  if (!gameTracks || gameTracks.length === 0) return;
  // start at current index
  playNextGameTrack();
}

function stopGameMusic() {
  if (currentGameAudio) {
    try { currentGameAudio.pause(); currentGameAudio.currentTime = 0; } catch (e) {}
  }
  // clear onended handlers
  if (gameTracks) gameTracks.forEach(t => { try { t.onended = null; } catch (e) {} });
  currentGameAudio = null;
  currentGameTrackIndex = 0;
}
function drawTank(x, y) {
  // Calculate angle from tank center to mouse
  let dx = mouseX - x;
  let dy = mouseY - y;
  let angle = atan2(dy, dx);
  push();
  translate(x, y);

  // If a tank image is available, draw it centered and overlay a rotating cannon
  if (typeof tankImg !== 'undefined' && tankImg) {
    imageMode(CENTER);
    let w = tankImg.width * tankScale;
    let h = tankImg.height * tankScale;
    image(tankImg, 0, 0, w, h);

    // draw a rotating cannon overlay to aim at the mouse (keeps aiming behavior)
    push();
    rotate(angle);
    fill('rgb(77,77,77)');
    rectMode(CENTER);
    rect(10, 0, 20, 5);
    pop();
  } else {
    // procedural fallback
    // Draw tank body
    fill('rgb(0,97,0)');
    rectMode(CENTER);
    rect(0, 0, 40, 20, 1.5);

    // Draw cannon holder (gray ellipse for smoothness)
    fill('rgb(50,50,50)');
    ellipse(0, 0, 15, 15);

    // Draw rotating cannon
    push();
    rotate(angle);
    fill('rgb(77,77,77)');
    rectMode(CENTER);
    // Cannon rectangle positioned to the right of rotation center
    rect(10, 0, 20, 5);
    pop();
  }

  pop();
}



function drawHelicopter(x, y) {
  // Keep angle stored globally inside the function using a property
  if (drawHelicopter.angle === undefined) {
    drawHelicopter.angle = 0;
  }
  // animate rotor angle
  if (drawHelicopter._rotor === undefined) drawHelicopter._rotor = 0;
  drawHelicopter._rotor += 0.18;

  push();
  translate(x, y);

  // If helicopter images are available, draw base and rotating rotor
  if (typeof helicopterBaseImg !== 'undefined' && helicopterBaseImg) {
    imageMode(CENTER);
    let bw = helicopterBaseImg.width * helicopterScale;
    let bh = helicopterBaseImg.height * helicopterScale;
    image(helicopterBaseImg, 0, 0, bw, bh);

    if (typeof helicopterRotorImg !== 'undefined' && helicopterRotorImg) {
      push();
      rotate(drawHelicopter._rotor);
      let rw = helicopterRotorImg.width * rotorScale;
      let rh = helicopterRotorImg.height * rotorScale;
      imageMode(CENTER);
      // Rotor should be drawn centered on the same origin
      image(helicopterRotorImg, 0, 0, rw, rh);
      pop();
    } else {
      // fallback simple blades if rotor image missing
      push();
      rotate(drawHelicopter._rotor);
      fill('gray');
      rectMode(CENTER);
      rect(0, 0, 75, 5, 2);
      rotate(HALF_PI);
      rect(0, 0, 75, 5, 2);
      pop();
    }
  } else {
    // Procedural fallback (existing)
    // Helicopter body
    fill('darkgray');
    ellipse(0, 0, 25, 40);
    rect(-3.5, -40, 7, 25);

    // Blades (spin)
    push();
    rotate(drawHelicopter._rotor);
    fill('gray');
    rectMode(CENTER);
    rect(0, 0, 75, 5, 2);  // Blade 1
    rotate(HALF_PI);
    rect(0, 0, 75, 5, 2);  // Blade 2
    pop();
  }

  pop();
}


// Enemy Types Configuration
const enemyTypes = {
  
  heavyBomber: {
    health: 100,
    // relative spawn weight (higher = more common)
    spawnWeight: 0, // spawning tuened off for now because of reaseons // teleport 
    damage: 3,
    speed: 0.5,
    groupSize: 3,
    shootInterval: 2000,
    bulletsPerShot: 1,
    bullet: {
      color: 'gray',
      size: 6,
      speed: 5,
      damage: 50
    },
    behavior: 'slowChase',
    draw(x, y) {
      // draw heavy bomber image centered if available, otherwise fallback to procedural draw
      if (typeof heavyBomberImg !== 'undefined' && heavyBomberImg) {
        imageMode(CENTER);
        let w = heavyBomberImg.width * heavyBomberScale;
        let h = heavyBomberImg.height * heavyBomberScale;
        image(heavyBomberImg, x, y, w, h);
      } else {
        
        fill('rgb(83,83,83)')
        rectMode(CORNERS)
        rect (x-15,y,x-12,y+15)
        rect (x+15,y,x+12,y+15)
        rect (x-20,y,x-17,y+15)
        rect (x+20,y,x+17,y+15)
        rect (x-27,y,x-23,y+10)
        rect (x+27,y,x+23,y+10)
        fill('rgb(146,146,146)')
        ellipse (x,y,20,45)
        rectMode(CENTER)
        rect (x,y,75,10,4)
      }
    }
  },// temporarily disabled heavy bomber because serves no special role beyond being a tougher slow plane, and the sprite is not great quality. Can re-enable if you add a better heavy bomber image and want to use it.
  tank: {
    health: 50,
    spawnWeight: 12,//og:12
    damage: 75,
    speed: 0.75,
    groupSize: 3,//og:3
    shootInterval: 1500,
     bulletsPerShot: 1,
    bullet: {
      color: 'red',
      size: 6,
      speed: 4,
      damage: 50
    ,
      image: 'Images/shell.png',
      imageScale: 1
    },
    // use shell sprite for tank bullets (optional)
    // image path loaded during preload() into bulletImageCache
    // add `Images/shell.png` to your Images/ folder
    behavior: 'limitedHoming',
    draw(x, y) {
      drawTank(x,y)
    }
  },
  plane: {
    health: 10,
    spawnWeight: 30,//og:30
    damage: 1000,
    speed: 5,
    groupSize: 10,//og:10
    shootInterval: 0,
    bullet: null,
    behavior: 'limitedHoming',
    draw(x, y) {
      // If a plane image is available, draw it centered; otherwise draw the fallback shape.
      if (typeof miniPlaneImg !== 'undefined' && miniPlaneImg) {
        imageMode(CENTER);
        // compute scaled size preserving aspect ratio
        let w = miniPlaneImg.width * planeScale;
        let h = miniPlaneImg.height * planeScale;
        image(miniPlaneImg, x, y, w, h);
      } else {
        fill('rgb(111,111,111)');
        ellipse (x, y, 30, 15);
        rectMode(RADIUS);
        fill ('rgb(92,92,92)');
        rect (x, y, 5, 20, 3);
      }
      
    }
  },
  turret: {
    health: 75,
    spawnWeight: 5,//og:5
    damage: 20,
    speed: 0,
    // how fast a turret drifts downward each frame
    descendSpeed: 0.8,
    groupSize: 3,//og:3
    shootInterval: 2500,
       bulletsPerShot: 60,
    bullet: {
      color: 'blue',
      size: 4,
      speed: 6,
      damage: 0.5
    },
    behavior: 'stationary',
    draw(x, y) {
      // If turret image available, draw it centered and scaled; otherwise draw fallback shape
      if (typeof turretImg !== 'undefined' && turretImg) {
        imageMode(CENTER);
        let w = turretImg.width * turretScale;
        let h = turretImg.height * turretScale;
        image(turretImg, x, y, w, h);
      } else {
        fill('blue');
        rectMode(CENTER);
        rect(x, y, 20, 20);
        ellipse(x, y - 10, 15, 15);
      }
    }
  },
  helicopter: {
    health: 150,
    spawnWeight: 10,//og:10
    damage: 100,
    speed: 0.5,
    groupSize: 2,//og:2
    shootInterval: 3000,
       bulletsPerShot: 1, 
    bullet: {
      color: 'green',
      size: 5,
      speed: 3,
      damage: 50,
      image: 'Images/missile.png',
      imageScale: 10
    },
  
    behavior: 'slowChase',
    draw(x, y) {
drawHelicopter(x,y)
    }
  },
railgun: {
  health: 200,
  spawnWeight: 3,
    damage: 300,
    speed: 0.5,
    groupSize: 1,
    shootInterval: 3600,
    bullet: {
      color: 'white',
      size: 10,
      speed: 15,
      damage:300
    ,
      image: 'Images/shell.png',
      imageScale: 2
    },
    behavior: 'none',
    draw(x, y) {
      // Draw railgun image if available, otherwise draw the legacy shape
      if (typeof railgunImg !== 'undefined' && railgunImg) {
        imageMode(CENTER);
        let w = railgunImg.width * railgunScale;
        let h = railgunImg.height * railgunScale;
        image(railgunImg, x, y, w, h);
      } else {
        push()
        push()
        fill ('rgb(71,71,71)')
        rectMode (CENTER)
        rect (x,y+5,55,85,5)
        pop()
        fill ('darkgray')
        ellipse (x,y,50)
        fill ('rgba(255,237,0,0.6)')
        arc (x,y,50,50,1.5708 - HALF_PI, 4.71 - HALF_PI)
        fill ('gray')
        rect (x-4,y,8,60)
        fill (lerpColor(color('darkgray'), color('red'), frameCount%255/200))
        arc (x,y,50,50,1.5708 + (HALF_PI)*2-0.75,4.71239+(HALF_PI)/2)
        fill ('black')
        stroke(10)
        line (x,y,x-25,y)
        line (x,y,x-25,y+10)
        line (x,y,x-25,y+20)
        line (x,y,x-25,y+30)
        line (x,y,x+25,y+30)
        line (x,y,x+25,y)
        line (x,y,x+25,y+10)
        line (x,y,x+25,y+20)
        line (x,y,x-25,y+45)
        line (x,y,x+25,y+45)
        noStroke ()
        pop()
      }
    }
}, Flamethrower: {
  health: 120,
  spawnWeight: 3,//og:3
  damage: 20,
  // give the flamethrower a positive speed so it moves into view after spawning
  speed: 1,
  // flamethrower drifts faster so it moves noticeably
  descendSpeed: 0.8,
    groupSize: 2,//og:2
    shootInterval: 1, //fast low damage fire
bullet: {
        color: 'rgba(255,100,0,0.7)',
        size: 15,
        speed: 5,
          damage: 0.1,
          image: 'Images/flame.png'
      },
  // change behavior so it moves straight down into the play area
  behavior: 'rotatingTurret',
    draw(x, y) {
      if (typeof flamethrowerImg !== 'undefined' && flamethrowerImg) {
        imageMode(CENTER);
        let w = flamethrowerImg.width * flamethrowerScale;
        let h = flamethrowerImg.height * flamethrowerScale;
        image(flamethrowerImg, x, y, w, h);
      } else {
        fill('red') //placeholder for flamethrower enemy 4 testing
        rect(x - 10, y - 10, 20, 20);
      }
    }

}, AssualtPlane: { 
  health: 50,
  spawnWeight: 3,
  damage: 20,
  speed: 5,
  groupSize: 3,//og: 3
  shootInterval: 20,
bullet: { 
  color: 'rgba(255, 187, 0, 1)',
  size: 4,
  speed: 6.5,
  damage: 1,
  image: 'Images/bullet.png'
},
 behavior: 'limitedHoming',
draw(x,y) {
  if (typeof assaultImg !== 'undefined' && assaultImg) {
    imageMode(CENTER);
    let w = assaultImg.width * assaultScale;
    let h = assaultImg.height * assaultScale;
    image(assaultImg, x, y, w, h);
  } else {
    fill('rgb(255,187,0)')
    rect(x-10,y-5,20,10)
  }
}
}, launcher: {
health: 60,
spawnWeight: 4,//og:4
damage: 75,
speed: 0.5,
descendSpeed: 0.5,
groupSize: 2,//og:2
shootInterval: 3000,
behavior: 'rotatingTurret',
bullet: {
  color: 'rgb(150,75,0)',
  size: 8,
  speed: 6,
  damage: 75,
  image: 'Images/twin missiles.png',
  imageScale: 5
}, draw(x,y) {  // simple launcher design; add image support if you want something more detailed
  // If a launcher image exists, draw it centered and scaled; otherwise draw the procedural launcher
  if (typeof launcherImg !== 'undefined' && launcherImg) {
    imageMode(CENTER);
    let w = launcherImg.width * launcherScale;
    let h = launcherImg.height * launcherScale;
    image(launcherImg, x, y, w, h);
  } else {
    fill('rgb(150,75,0)');
    rectMode(CENTER);
    rect(x, y, 30, 20);
    rect(x - 10, y - 15, 10, 10);
    rect(x + 10, y - 15, 10, 10);
  }
}
},
advancedLauncher: {
  health: 150,
  spawnWeight: 1,//og:1
  damage: 100,
  speed: 0.5,
  descendSpeed: 0.5,
    groupSize: 1,//og:1
    shootInterval: 750,
    behavior: 'rotatingTurret',
    bullet: {
      color: 'rgb(150,75,0)',
      size: 10,
      speed: 10,
      damage: 100,
      image: 'Images/twin advanced missiles.png',
      imageScale: 5
    },
    draw(x,y) {
      // If an advanced launcher image was provided, draw it centered and scaled.
      if (typeof advancedLauncherImg !== 'undefined' && advancedLauncherImg) {
        imageMode(CENTER);
        let w = advancedLauncherImg.width * advancedLauncherScale;
        let h = advancedLauncherImg.height * advancedLauncherScale;
        image(advancedLauncherImg, x, y, w, h);
        return;
      }

      // Fall back to the regular launcher image if available
      if (typeof launcherImg !== 'undefined' && launcherImg) {
        imageMode(CENTER);
        let w = launcherImg.width * launcherScale;
        let h = launcherImg.height * launcherScale;
        image(launcherImg, x, y, w, h);
        return;
      }

      // Final fallback: procedural drawing
      fill('rgb(150,75,0)');
      rectMode(CENTER);
      rect(x - 15, y - 10, 30, 20); // base
      rect(x - 10, y - 20, 8, 8);
      rect(x + 10, y - 20, 8, 8);
    }
}
};
// --- SETUP ---
function setup() {
    // Initialize flamethrowerTimers with correct angle using HALF_PI
    flamethrowerTimers = [
      { lastFire: 0, firing: false, fireStart: 0, angle: HALF_PI }, // right
      { lastFire: 0, firing: false, fireStart: 0, angle: HALF_PI }  // left
    ];
  createCanvas(800, 600);
  setupRubberhorseMessages();
  // start standard single-player game by default
  startGame(false);
  // Register the Nuke special on Z (visuals only)
  player.registerSpecialAttack({
    key: 'z',
    label: 'Nuke',
    cooldown: 120,
    type: 'instant',
    handler(p, ctx) {
      // consume one nuke if available, otherwise show a brief message
      if (!nukesCount || nukesCount <= 0) {
        deathMessage = 'No nukes available';
        deathMessageTimer = millis();
        return;
      }
      nukesCount = Math.max(0, nukesCount - 1);
      // trigger at player position
      triggerNuke(p.x, p.y - 20);
    }
  });

  // Register Bomb special on X: AoE damage small nuke-like explosion
  player.registerSpecialAttack({
    key: 'x',
    label: 'Bomb',
    cooldown: 60,
    type: 'instant',
    handler(p, ctx) {
      // consume one bomb if available, otherwise show a brief message
      if (!bombsCount || bombsCount <= 0) {
        deathMessage = 'No bombs available';
        deathMessageTimer = millis();
        return;
      }
      bombsCount = Math.max(0, bombsCount - 1);

      const cx = p.x;
      const cy = p.y - 20;
      // visual: scaled-down massive explosion (death-star variant)
      ExplosionFX.create(cx, cy, { isDeathStar: true, scale: 1.5, duration: 800, particleCount: 48 });

      // AoE damage parameters
      const radius = 120; // pixels
      const damage = 80;

      // damage enemies within radius
      for (let e of enemies) {
        if (!e || e.destroyed) continue;
        const d = dist(cx, cy, e.x, e.y);
        if (d <= radius) {
          e.health -= damage;
          score += damage;
          if (e.health <= 0) {
            e.destroyed = true;
            ExplosionFX.create(e.x, e.y, { duration: 400, particleCount: 12 });
          }
        }
      }

      // also damage boss if present
      if (boss && boss.isAlive()) {
        const dBoss = dist(cx, cy, boss.x, boss.y);
        if (dBoss <= radius + max(boss.w, boss.h) / 2) {
          try { boss.takeDamage(damage); } catch (err) {}
        }
      }

      // remove enemy bullets within radius and show small flashes
      const remainingBullets = [];
      for (let b of enemyBullets) {
        if (!b) continue;
        if (dist(cx, cy, b.x, b.y) <= radius) {
          ExplosionFX.create(b.x, b.y, { duration: 200, particleCount: 6 });
          // drop the bullet (do not include in remainingBullets)
        } else {
          remainingBullets.push(b);
        }
      }
      enemyBullets = remainingBullets;
    }
  });

  // Register MEGA BEAM on C: high-DPS vertical beam with visuals
  player.registerSpecialAttack({
    key: 'c',
    label: 'MEGA BEAM',
    cooldown: 180,
    type: 'charge',
    // handler called on press (we now call handler for charge on press to start the beam)
    handler(p, ctx) {
      if (!p) return;
      // Must own the Mega Beam to use it
      if (!megaBeamOwned) {
        shopMessage = 'MEGA BEAM locked — purchase in store'; shopMessageTimer = millis();
        return;
      }
      // avoid spawning multiple follow-beams for same player
      for (let b of megaBeams) {
        if (b && b.followPlayer && b.owner === p) return;
      }
      // require at least some energy to start
      if (!energyCurrent || energyCurrent <= 0) {
        shopMessage = 'Not enough energy to fire MEGA BEAM';
        shopMessageTimer = millis();
        return;
      }
      // spawn a persistent beam that follows the player until release
      const cx = p.x;
      const cy = p.y;
      spawnMegaBeam(cx, cy, { followPlayer: true, owner: p, dps: 1000 });
      // start looping sound if available and not already playing
      try {
        if (megabeamAudio && megabeamAudio.paused) {
          megabeamAudio.currentTime = 0;
          megabeamAudio.play().catch(() => {});
        }
      } catch (err) { /* ignore audio errors */ }
    },
    // onRelease called when the key is released; remove the following beam
    onRelease(p, ctx) {
      if (!p) return;
      // find beams owned by this player and remove them
      for (let i = megaBeams.length - 1; i >= 0; i--) {
        const b = megaBeams[i];
        if (b && b.owner === p && b.followPlayer) {
          megaBeams.splice(i, 1);
        }
      }
      // if no follow-beams remain, stop the megabeam audio
      const anyFollow = megaBeams.some(b => b && b.followPlayer);
      if (!anyFollow) {
        try {
          if (megabeamAudio) {
            megabeamAudio.pause();
            try { megabeamAudio.currentTime = 0; } catch (err) {}
          }
        } catch (err) {}
      }
    }
  });
  // Register ION BEAM on V: lower-DPS, cheaper beam
  player.registerSpecialAttack({
    key: 'v',
    label: 'ION BEAM',
    cooldown: 60,
    type: 'charge',
    handler(p, ctx) {
      if (!p) return;
      // Must own the Ion Beam to use it
      if (!ionBeamOwned) {
        shopMessage = 'ION BEAM locked — purchase in store'; shopMessageTimer = millis();
        return;
      }
      // avoid spawning multiple follow-beams for same player
      for (let b of megaBeams) {
        if (b && b.followPlayer && b.owner === p && b.type === 'ion') return;
      }
      // require at least some energy to start
      if (!energyCurrent || energyCurrent <= 0) {
        shopMessage = 'Not enough energy to fire ION BEAM';
        shopMessageTimer = millis();
        return;
      }
      // spawn a persistent ion beam that follows the player until release
      const cx2 = p.x;
      const cy2 = p.y;
      spawnMegaBeam(cx2, cy2, { type: 'ion', followPlayer: true, owner: p, dps: 75, energyPerSecond: 100 });
      // start ion sound if available
      try {
        if (ionbeamAudio && ionbeamAudio.paused) {
          ionbeamAudio.currentTime = 0;
          ionbeamAudio.play().catch(() => {});
        }
      } catch (err) {}
    },
    onRelease(p, ctx) {
      if (!p) return;
      // remove ion beams owned by this player
      for (let i = megaBeams.length - 1; i >= 0; i--) {
        const b = megaBeams[i];
        if (b && b.owner === p && b.followPlayer && b.type === 'ion') {
          megaBeams.splice(i, 1);
        }
      }
      // if no ion follow-beams remain, stop the ion audio
      const anyIon = megaBeams.some(b => b && b.followPlayer && b.type === 'ion');
      if (!anyIon) {
        try {
          if (ionbeamAudio) {
            ionbeamAudio.pause();
            try { ionbeamAudio.currentTime = 0; } catch (err) {}
          }
        } catch (err) {}
      }
    }
  });
  messageTimer = millis();
  frameRate(60);
  startHealth = playerHealth
}

function setupRubberhorseMessages() {
  rubberhorseMessages = [
    "⚔️ Hold steady, brave pilot!",
    //"🍎 Collect the golden apples of victory!",
    "👑 This is your sky, rule it!",
    "🛡️ Don't let them break our defenses!",
    "💥 Remember, the Royal Reward awaits!",
    "🌈 Fly like the wind of Horseland!",
    "🎖️ Honor comes with fire!",
    "🐴 Rubberhorse believes in you!",
    "🐴Glory to Horseland, Horses glory",
    "🐴🐴🐴🐴🐴🐴🐴🐴",
    "VABBIT",
    "The Royal Reward is near!",
    "Keep flying, hero of Horseland!",
    "The skies are yours to conquer!",
    "Defend Horseland with valor!",
    "Every shot counts, pilot!",
    "Show them the might of Horseland!",
    "Your courage is our strength!",
    "Victory is on the horizon!"
  ];
}

// --- DRAW LOOP ---
function draw() {
      // Expire advanced bullet powerup
      if (advBulletActive && millis() > advBulletUntil) {
        advBulletActive = false;
      }
    // --- Flamethrower weapon logic ---
    // Find the two flamethrower nodule parts
    const flamethrowerParts = [
      LevParts.find(p => p.id === 10), // right
      LevParts.find(p => p.id === 11)  // left
    ];
    const flamethrowerInterval = 7500; // ms
    const flamethrowerDuration = 2550; // ms
    const now = millis();
    for (let i = 0; i < 2; i++) {
      const part = flamethrowerParts[i];
      if (!part || part.destroyed) continue;
      // Only fire if dependency (rotor) is destroyed
      if (Array.isArray(part.dependsOn) && part.dependsOn.length > 0) {
        let canFire = true;
        for (let depIdx of part.dependsOn) {
          if (LevParts[depIdx] && !LevParts[depIdx].destroyed) canFire = false;
        }
        if (!canFire) continue;
      }
      let timer = flamethrowerTimers[i];
      if (!timer) continue;
      if (!timer.firing && now - timer.lastFire > flamethrowerInterval) {
        timer.firing = true;
        timer.fireStart = now;
      }
      if (timer.firing && now - timer.fireStart > flamethrowerDuration) {
        timer.firing = false;
        timer.lastFire = now;
      }
      // If firing, spawn flames visually and check for player hit
      if (timer.firing && FlameImg) {
        // Get world position
        const px = boss.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
        const py = boss.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
        // Swivel logic: aim at player, clamp to 15 degrees from straight down
        let targetAngle = HALF_PI;
        if (player && player.alive) {
          const dx = player.x - px;
          const dy = player.y - py;
          targetAngle = Math.atan2(dy, dx);
        }
        // Clamp to within 15 degrees (PI/12 radians) of straight down
        const maxSwivel = Math.PI / 12;
        let delta = targetAngle - HALF_PI;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        delta = Math.max(-maxSwivel, Math.min(maxSwivel, delta));
        // Smoothly interpolate angle
        timer.angle = lerpAngle(timer.angle, HALF_PI + delta, 0.18);

        // Shoot a stream of flames (5 flames spaced out)
        for (let j = 0; j < 5; j++) {
          const fx = px + Math.cos(timer.angle) * (40 + j * 32);
          const fy = py + Math.sin(timer.angle) * (40 + j * 32);
          push();
          translate(fx, fy);
          rotate(timer.angle + random(-0.1, 0.1));
          imageMode(CENTER);
          image(FlameImg, 0, 0, 32, 32);
          pop();
          // Simple player hit check (circle)
          for (let pIdx = 0; pIdx < players.length; pIdx++) {
            const p = players[pIdx];
            if (!p || !p.alive) continue;
            const r = (typeof p.size === 'number') ? p.size / 2 : 20;
            const distSq = (p.x - fx) * (p.x - fx) + (p.y - fy) * (p.y - fy);
            if (distSq < (r + 16) * (r + 16)) {
              if (pIdx === 0) playerHealth -= 1;
              else player2Health -= 1;
            }
          }
        }
      // Helper for smooth angle interpolation
      function lerpAngle(a, b, t) {
        let d = b - a;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return a + d * t;
      }
      }
    }
  // draw a scrolling background if available; otherwise fall back to solid background
  drawScrollingBackground();
  // if shop is active, draw shop UI and skip game updates
  if (shopActive) {
    drawShop();
    return;
  }
  // If main menu active, draw it and skip game updates
  if (mainMenuActive) {
    drawMainMenu();
    return;
  }
//console.log ('your score is ' + score)
  textSize (20)
  if (score < 1000) fill ('white');   text ('your score is ' + score, 175,100)
  if (score > 1000 && score < 5000) fill ('gold');   text ('your score is ' + score, 175,100)
  if (score > 5000) fill(lerpColor( color ('gold'), color('red'), frameCount % 20 / 20));  text ('your score is ' + score, 175,100)

  // Show message
  if (millis() - messageTimer > 10000) {
    currentMessage = random(rubberhorseMessages);
    messageTimer = millis();
     
  }
  //else
    //currentMessage = '🐴🐴🐴🐴🐴🐴'
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(currentMessage, width / 2, 30);

  // show death message (e.g. "Player 1 died") for a short duration if set
  if (deathMessage && (millis() - deathMessageTimer) < deathMessageDuration) {
    push();
    textSize(20);
    fill(255, 220, 50);
    textAlign(CENTER);
    text(deathMessage, width / 2, 60);
    pop();
  }

  drawHealthBar();
  // Passive energy regeneration from solar panels: +1 J/s per panel
  const _dt = (deltaTime || 16.6667) / 1000;
  if (solarPanelsCount && solarPanelsCount > 0) {
    energyCurrent = min(energyCapacity, energyCurrent + solarPanelsCount * 1 * _dt);
  }
  // update & draw all alive players (primary player is players[0])
  for (let p of players) {
    if (!p || !p.alive) continue;
    p.update();
    p.draw();
  }

  for (let b of bullets) b.update();
  bullets = bullets.filter(b => !b.offscreen);
  bullets.forEach(b => b.draw());

  // Player bullet -> Leviathan part collision
  if (boss && boss.isAlive()) {
    for (let pb of bullets) {
      if (!pb || pb.offscreen) continue;
      let hitAndVulnerable = false;
      // Check each part for hit
      for (let i = 0; i < LevParts.length; i++) {
        const part = LevParts[i];
        if (part.destroyed) continue;
        const img = (typeof part.img === 'function') ? part.img() : part.img;
        const px = boss.x + part.x * (typeof LevScale === 'number' ? LevScale : 1);
        const py = boss.y + part.y * (typeof LevScale === 'number' ? LevScale : 1);
        let pw = img && img.width ? img.width * part.scale * (typeof LevScale === 'number' ? LevScale : 1) : 120 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        let ph = img && img.height ? img.height * part.scale * (typeof LevScale === 'number' ? LevScale : 1) : 80 * part.scale * (typeof LevScale === 'number' ? LevScale : 1);
        // Simple AABB hit
        if (pb.x >= px - pw/2 && pb.x <= px + pw/2 && pb.y >= py - ph/2 && pb.y <= py + ph/2) {
          // Check if part is vulnerable (no dependencies alive)
          let vulnerable = true;
          if (Array.isArray(part.dependsOn) && part.dependsOn.length > 0) {
            for (let depIdx of part.dependsOn) {
              if (LevParts[depIdx] && !LevParts[depIdx].destroyed) {
                vulnerable = false;
                break;
              }
            }
          }
          if (vulnerable) {
            boss.takeDamage(i, pb.damage || 1);
            pb.offscreen = true;
            if (typeof ExplosionFX !== 'undefined') ExplosionFX.create(pb.x, pb.y, { duration: 240, particleCount: 6 });
            hitAndVulnerable = true;
            break;
          }
          // If not vulnerable, bullet passes through
        }
      }
      // Only remove bullet if it actually hit a vulnerable part
      if (hitAndVulnerable) pb.offscreen = true;
    }
    bullets = bullets.filter(b => !b.offscreen);
  }

  for (let b of enemyBullets) {
    b.update();
    // check hits against all players (skip dead ones)
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p || !p.alive) continue;
      if (b.hits(p)) {
        if (i === 0) {
          playerHealth -= b.damage;
        } else {
          player2Health -= b.damage;
        }
        b.toDelete = true;
        break;
      }
    }
  }
  enemyBullets = enemyBullets.filter(b => !b.offscreen && !b.toDelete);
    drawSpecialUI();
  
  // Handle player deaths in buddy mode: spawn explosion once and mark player dead (disappear)
  if (buddyMode) {
    // primary
    if (players[0] && players[0].alive && playerHealth <= 0) {
      players[0].alive = false;
      ExplosionFX.create(players[0].x, players[0].y);
      deathMessage = 'Player 1 died';
      deathMessageTimer = millis();
    }
    // secondary
    if (players[1] && players[1].alive && player2Health <= 0) {
      players[1].alive = false;
      ExplosionFX.create(players[1].x, players[1].y);
      deathMessage = 'Player 2 died';
      deathMessageTimer = millis();
    }

    // Update the global `player` reference to the first alive player (so specials reference an alive one)
    const firstAlive = players.find(p => p && p.alive);
    if (firstAlive) player = firstAlive; else player = players[0] || null;
  }
  enemyBullets.forEach(b => b.draw());

  for (let e of enemies) {
    e.update();
    e.draw();
    e.shoot(enemyBullets);
    e.checkHit(bullets);
  }
  enemies = enemies.filter(e => !e.destroyed);

  // Update & draw pickups (spawned items like health packs)
  if (typeof updateAndDrawPickups === 'function') updateAndDrawPickups();

  // draw explosions via ExplosionFX module
  ExplosionFX.updateAndDraw();

  // Draw nuke visuals on top of the scene if active
  if (nukeActive) {
    nuke(nukeX, nukeY);
  }

  // update & draw mega beams (top layer)
  updateAndDrawMegaBeams();

  // Boss spawn timer: spawn a single boss 15 seconds into the game
  if (!bossHasSpawned && bossSpawnAt && millis() >= bossSpawnAt) {
    boss = new Boss(width / 2, height * 0.25);
    bossHasSpawned = true;
    // start boss music (stop normal game music first)
    try { stopGameMusic(); } catch (err) {}
    if (bossMusicAudio && !musicMuted) {
      try { bossMusicAudio.currentTime = 0; bossMusicAudio.play().catch(()=>{}); } catch (e) {}
    }
  }

  // If boss exists, update and draw it. While boss is alive, normal enemy spawning is suppressed.
  if (boss) {
    if (boss.isAlive()) {
      boss.update();
      boss.show();
    } else {
      // boss defeated or destroyed; clear reference so spawning resumes
      boss = null;
    }
  }

  if (!buddyMode) {
    if (playerHealth <= 0) gameOver();
  } else {
    // game over when both players are dead
    if (playerHealth <= 0 && player2Health <= 0) gameOver();
  }
  // only spawn if we're not suppressing spawns due to a recent nuke
  // and don't spawn normal enemies while the boss is alive
  if (frameCount % spawnIntervalFrames == 0 && millis() > nukeNoSpawnUntil && !(boss && boss.isAlive())) {
    spawnEnemyGroup();
  }
}

// --- HEALTH BAR ---
function drawHealthBar() {
  /*fill(255, 0, 0);
  rect(20, 50, 200, 20);
  fill(0, 255, 0);
  rect(20, 50, map(playerHealth, 0, 100, 0, 200), 20);
  noFill();
  stroke(255);
  rect(20, 50, 200, 20);
  noStroke();*/
  if (!buddyMode) {
    fill('red');
    rect(20, 50, startHealth, 20);
    fill('rgb(0,214,0)');
    rect(20, 50, playerHealth, 20);
  } else {
    // Player 1 bar
    fill('red');
    rect(20, 50, startHealth, 12);
    fill('rgb(0,214,0)');
    rect(20, 50, max(0, playerHealth), 12);
    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text('P1', 6, 56);

    // Player 2 bar below
    fill('red');
    rect(20, 70, startHealth, 12);
    fill('rgb(0,214,0)');
    rect(20, 70, max(0, player2Health), 12);
    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text('P2', 6, 76);
  }

  // Storage bar (shows available storage in cubic meters). Placed bottom-right.
  // Energy bar (bottom-left) — identical style to storage
  const energyW = 180;
  const energyH = 14;
  const pad = 20;
  const energyX = pad;
  const energyY = height - energyH - pad;
  // background
  fill(100);
  rect(energyX, energyY, energyW, energyH, 4);
  // filled portion (proportional to energyCurrent / energyCapacity)
  const energyFilled = constrain(energyCurrent / energyCapacity, 0, 1);
  fill('rgb(70,170,255)');
  rect(energyX, energyY, energyW * energyFilled, energyH, 4);
  // border
  noFill();
  stroke(255);
  rect(energyX, energyY, energyW, energyH, 4);
  noStroke();
  // numeric label to the right of the energy bar
  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(`${Math.round(energyCurrent) }J`, energyX + energyW + 8, energyY + energyH / 2);

  // Nukes counter (bottom-right) — replaces storage visuals
  const nukesW = 160;
  const nukesH = 22;
  const nukesX = width - nukesW - pad;
  const nukesY = height - nukesH - pad;
  // Bombs counter (draw above nukes)
  const bombsW = nukesW;
  const bombsH = 18;
  const bombsX = nukesX;
  const bombsY = nukesY - bombsH - 8;
  // Repair pack counter (draw above bombs)
  const repairW = bombsW;
  const repairH = 16;
  const repairX = nukesX;
  const repairY = bombsY - repairH - 6;
  // bombs background box
  fill(30, 30, 40, 200);
  rect(bombsX, bombsY, bombsW, bombsH, 6);
  fill(255);
  textSize(13);
  textAlign(CENTER, CENTER);
  text(`Bombs: ${bombsCount}`, bombsX + bombsW/2, bombsY + bombsH/2);
  // repair pack background box
  fill(30, 30, 40, 200);
  rect(repairX, repairY, repairW, repairH, 6);
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`Repair: ${repairPacksCount}`, repairX + repairW/2, repairY + repairH/2);
  // background box
  fill(30, 30, 40, 200);
  rect(nukesX, nukesY, nukesW, nukesH, 6);
  // label
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(`Nukes: ${nukesCount}`, nukesX + nukesW/2, nukesY + nukesH/2);
}

// --- PLAYER CLASS ---
class Player {
  // control: 'mouse' | 'wasd' | 'arrows'
  constructor(x = width / 2, y = height - 60, img = null, control = 'mouse') {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.lastShot = 0;
    this.shootInterval = 75;
    this.img = img; // p5.Image for this player
    this.control = control;
    this.speed = 5; // keyboard movement speed
    this.alive = true;
  }

  update() {
    if (this.control === 'mouse') {
      this.x = lerp(this.x, mouseX, 0.05);
      this.y = lerp(this.y, mouseY, 0.05);
    } else {
      // keyboard control
      let dx = 0;
      let dy = 0;
      if (this.control === 'wasd') {
        if (keyIsDown(65)) dx -= this.speed; // A
        if (keyIsDown(68)) dx += this.speed; // D
        if (keyIsDown(87)) dy -= this.speed; // W
        if (keyIsDown(83)) dy += this.speed; // S
      } else if (this.control === 'arrows') {
        if (keyIsDown(LEFT_ARROW)) dx -= this.speed;
        if (keyIsDown(RIGHT_ARROW)) dx += this.speed;
        if (keyIsDown(UP_ARROW)) dy -= this.speed;
        if (keyIsDown(DOWN_ARROW)) dy += this.speed;
      }
      this.x += dx;
      this.y += dy;
      // keep inside canvas
      this.x = constrain(this.x, 0, width);
      this.y = constrain(this.y, 0, height);
    }

    if (millis() - this.lastShot > this.shootInterval) {
      bullets.push(new Bullet(this.x, this.y - 20, -HALF_PI, 10, 6, 'red', 10));
      bullets.push(new Bullet(this.x + 20, this.y + 10, -HALF_PI, 10, 6, 'red', 10));
      bullets.push(new Bullet(this.x - 20, this.y + 10, -HALF_PI, 10, 6, 'red', 10));
      bullets.push(new Bullet(this.x + 30, this.y + 20, -HALF_PI, 10, 6, 'red', 10));
      bullets.push(new Bullet(this.x - 30, this.y + 20, -HALF_PI, 10, 6, 'red', 10));
      this.lastShot = millis();
    }
  }

  draw() {
    const img = this.img || shipImg;
    if (typeof img !== 'undefined' && img) {
      imageMode(CENTER);
      let w = this.size;
      let h = this.size;
      if (img.width && img.height) {
        h = w * (img.height / img.width);
      }
      image(img, this.x, this.y, w, h);
    } else {
      fill('blue');
      triangle(this.x, this.y - 20, this.x - 15, this.y + 20, this.x + 15, this.y + 20);
    }
  }
}

// Player API proxies for special attacks
Player.prototype.registerSpecialAttack = function(spec) {
  return specialAttackRegistry.register(spec);
};

Player.prototype.unregisterSpecialAttack = function(id) {
  return specialAttackRegistry.unregister(id);
};

Player.prototype.canUseSpecial = function(id) {
  return specialAttackRegistry.canUse(id);
};

Player.prototype.triggerSpecial = function(id, ctx) {
  return specialAttackRegistry.trigger(id, ctx);
};

// --- BULLET CLASS ---
class Bullet {
  constructor(x, y, angle, speed, size, color, damage, isAdvanced = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.size = size;
    this.color = color;
    this.isAdvanced = isAdvanced;
    this.damage = isAdvanced ? 12 : 5;
    this.offscreen = false;
  }

  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    if (this.y < -this.size || this.y > height + this.size || this.x < -this.size || this.x > width + this.size) {
      this.offscreen = true;
    }
  }

  explode() {
    if (this.exploded) return;
    this.exploded = true;
    // visual explosion: use Explosion class with small visualSize if provided
    const visSize = this.explodeDiameter || 20; // default 20 px diameter
    const particleCount = Math.max(8, Math.round(visSize / 2));
    ExplosionFX.create(this.x, this.y, { duration: 600, particleCount });

    // splash damage to players if within radius
    const radius = (this.explodeDiameter != null) ? (this.explodeDiameter / 2) : 10;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p) continue;
      if (dist(this.x, this.y, p.x, p.y) <= radius) {
        const dmg = (this.explodeDamage != null) ? this.explodeDamage : this.damage;
        if (i === 0) playerHealth -= dmg; else player2Health -= dmg;
      }
    }

    // mark for removal
    this.toDelete = true;
  }

  draw() {
    let useImg = null;
    if (this.isAdvanced && typeof advancedBulletImg !== 'undefined' && advancedBulletImg) {
      useImg = advancedBulletImg;
      console.log('Drawing advanced bullet');
    } else if (typeof bulletImg !== 'undefined' && bulletImg) {
      useImg = bulletImg;
    }
    if (useImg) {
      imageMode(CENTER);
      // scale the sprite to roughly the bullet size; allow aspect ratio preservation
      let w = this.size * 2;
      let h = this.size * 2;
      if (useImg.width && useImg.height) {
        // preserve aspect by basing height on width scaling
        h = w * (useImg.height / useImg.width);
      }
      push();
      translate(this.x, this.y);
      // rotate image so it points in the direction of motion (match EnemyBullet convention)
      rotate(this.angle + HALF_PI);
      image(useImg, 0, 0, w, h);
      pop();
    } else {
      fill(this.color);
      noStroke();
      ellipse(this.x, this.y, this.size);
    }
  }

  hits(target) {
    return dist(this.x, this.y, target.x, target.y) < this.size / 2 + (target.size ? target.size / 2 : 20);
  }
}

// --- ENEMY BULLET CLASS ---
class EnemyBullet {
  constructor(x, y, angle, speed, size, color, damage, img = null, imgScale = 1, homing = 0, homingBudgetDeg = null, explodeAfterMs = null, explodeDiameter = null, explodeDamage = null) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.size = size;
    this.color = color;
    this.damage = damage;
    this.img = img; // optional p5.Image for custom bullet visuals
    this.imgScale = imgScale || 1; // multiplier used when drawing image
    this.homing = homing || 0; // angular correction per frame (radians)
    // homingBudgetDeg (degrees) limits the total cumulative angular adjustment allowed
    // Convert to radians and track remaining budget. If null, budget is effectively unlimited.
    if (homingBudgetDeg !== null && homingBudgetDeg !== undefined) {
      this.homingBudget = Math.abs(homingBudgetDeg) * Math.PI / 180.0; // radians
    } else {
      this.homingBudget = Infinity;
    }
    this.homingBudgetRemaining = this.homingBudget;
    // explosion/timed detonation
    this.spawnTime = millis();
    this.explodeAfterMs = (explodeAfterMs !== undefined) ? explodeAfterMs : null; // milliseconds after spawn to explode
    this.explodeDiameter = (explodeDiameter !== undefined && explodeDiameter !== null) ? explodeDiameter : null; // visual diameter in px
    this.explodeDamage = (explodeDamage !== undefined && explodeDamage !== null) ? explodeDamage : null; // damage applied by explosion (splash)
    this.exploded = false;
    this.offscreen = false;
    this.toDelete = false;
  }

  update() {
    // apply slight homing towards player if configured

    if (this.homing && typeof player !== 'undefined' && player) {
      const desired = atan2(player.y - this.y, player.x - this.x);
      let diff = desired - this.angle;
      if (diff > PI) diff -= TWO_PI;
      if (diff < -PI) diff += TWO_PI;
      // nudge the angle by at most `this.homing` radians per frame
      let allowed = constrain(diff, -this.homing, this.homing);
      // also don't allow more than the remaining homing budget
      allowed = constrain(allowed, -this.homingBudgetRemaining, this.homingBudgetRemaining);
      // apply and subtract used budget
      this.angle += allowed;
      this.homingBudgetRemaining -= Math.abs(allowed);
    }

    // handle timed explosion if configured
    if (!this.exploded && this.explodeAfterMs !== null) {
      if (millis() - this.spawnTime >= this.explodeAfterMs) {
        this.explode();
      }
    }

    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    if (this.y < -this.size || this.y > height + this.size || this.x < -this.size || this.x > width + this.size) {
      this.offscreen = true;
    }
  }

  draw() {
    if (this.img) {
      imageMode(CENTER);
      // scale the image roughly to the bullet size while preserving aspect
      let w = this.size * 2 * this.imgScale;
      let h = this.size * 2 * this.imgScale;
      if (this.img.width && this.img.height) {
        h = w * (this.img.height / this.img.width);
      }
      push();
      translate(this.x, this.y);
      rotate(this.angle + HALF_PI); // rotate image to match bullet direction (optional)
      image(this.img, 0, 0, w, h);
      pop();
    } else {
      fill(this.color);
      noStroke();
      ellipse(this.x, this.y, this.size);
    }
  }

  hits(target) {
    return dist(this.x, this.y, target.x, target.y) < this.size / 2 + (target.size ? target.size / 2 : 20);
  }
}

// --- ENEMY CLASS ---
class Enemy {
  constructor(typeKey, x, y) {
    this.typeKey = typeKey;
    this.type = enemyTypes[typeKey];
    this.x = x;
    this.y = y;
    this.health = this.type.health;
    this.angle = 0;
    this.destroyed = false;
    this.shootCooldown = millis();
    this.size = 40;
  }

  update() {
    switch (this.type.behavior) {
      case 'limitedHoming': this.limitedHoming(); break;
      case 'rotatingTurret': this.rotatingTurret(); break;
      case 'straight': this.y += this.type.speed; break;
      case 'stationary': break;
      case 'slowChase': this.slowChase(); break;
      default: this.y += this.type.speed;
    }

    // Continuous downward motion for turret-like enemies (and any type that sets descendSpeed).
    if (this.type.behavior === 'stationary' || this.type.behavior === 'rotatingTurret') {
      this.y += (this.type.descendSpeed !== undefined) ? this.type.descendSpeed : DEFAULT_DESCEND_SPEED;
    }

    if (this.y > height + 50) this.destroyed = true;
  }

  limitedHoming() {
    let desired = atan2(player.y - this.y, player.x - this.x);
    let diff = desired - this.angle;
    if (diff > PI) diff -= TWO_PI;
    if (diff < -PI) diff += TWO_PI;
    this.angle += constrain(diff, -0.05, 0.05);
    this.x += this.type.speed * cos(this.angle);
    this.y += this.type.speed * sin(this.angle);
  }

  // Stationary turret that slowly rotates toward the player and fires.
  rotatingTurret() {
    // do not move position; only rotate the barrel slowly toward the player
    let desired = atan2(player.y - this.y, player.x - this.x);
    let diff = desired - this.angle;
    if (diff > PI) diff -= TWO_PI;
    if (diff < -PI) diff += TWO_PI;
    // faster rotation: allow a larger step so turrets track quicker
    this.angle += constrain(diff, -0.12, 0.12);
    // no positional change
  }

  slowChase() {
    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += this.type.speed * cos(angle);
    this.y += this.type.speed * sin(angle);
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    this.type.draw(0, 0);
    pop();
  }

  shoot(enemyBulletsArray) {
  if (!this.type.bullet) return;

  if (millis() > this.shootCooldown) {
    let b = this.type.bullet;
    let count = this.type.bulletsPerShot || 1; // fallback to 1 if undefined
    let spread = PI / 8; // default narrower spread

    // Base aiming angle: for rotating turrets use the turret's current angle,
    // otherwise default to downwards (PI/2) centered spread like before.
    let baseAngle;
    if (this.type.behavior === 'rotatingTurret') {
      baseAngle = this.angle;
    } else {
      baseAngle = PI / 2; // downwards
    }

    let startAngle = baseAngle - spread / 2;

    for (let i = 0; i < count; i++) {
      let t = (count === 1) ? 0.5 : i / (count - 1);
      let angle = startAngle + t * spread;
      // lookup optional bullet image for this enemy type
      // Prefer: this.type.bullet.image (string inside bullet stats)
      // Fallback: this.type.bulletImage (legacy string on the type)
      let bulletImgRef = null;
      let bulletImgScale = 1;
      try {
        let fname = null;
        if (this.type && this.type.bullet && typeof this.type.bullet.image === 'string') {
          fname = this.type.bullet.image;
        } else if (this.type && typeof this.type.bulletImage === 'string') {
          fname = this.type.bulletImage;
        }
        if (fname && bulletImageCache[fname]) {
          bulletImgRef = bulletImageCache[fname];
        }

        // support per-bullet image scale: enemyTypes[type].bullet.imageScale
        if (this.type && this.type.bullet && typeof this.type.bullet.imageScale === 'number') {
          bulletImgScale = this.type.bullet.imageScale;
        } else if (typeof this.type.bulletImageScale === 'number') {
          bulletImgScale = this.type.bulletImageScale;
        } else if (b.imageScale && typeof b.imageScale === 'number') {
          bulletImgScale = b.imageScale;
        }
      } catch (err) {
        bulletImgRef = null;
        bulletImgScale = 1;
      }

      // determine small homing for certain enemy types (helicopter gets a tiny homing)
      let homingStrength = 0;
      if (b && typeof b.homing === 'number') {
        homingStrength = b.homing;
      } else if (this.typeKey === 'helicopter') {
        // tiny angular nudge per frame (radians). Tune this value for desired behaviour.
        homingStrength = 0.02;
      }

      // cumulative homing budget in degrees (how much total angle change is allowed)
      let homingBudgetDeg = null;
      if (b && typeof b.homingBudgetDeg === 'number') {
        homingBudgetDeg = b.homingBudgetDeg;
      } else if (this.typeKey === 'helicopter') {
        // default budget for helicopter bullets: 20 degrees
        homingBudgetDeg = 20;
      }

      enemyBulletsArray.push(new EnemyBullet(this.x, this.y, angle, b.speed, b.size, b.color, b.damage, bulletImgRef, bulletImgScale, homingStrength, homingBudgetDeg));
    }

    this.shootCooldown = millis() + this.type.shootInterval;
  }
}


  checkHit(playerBullets) {
    for (let bullet of playerBullets) {
      if (dist(this.x, this.y, bullet.x, bullet.y) < 25) {
        this.health -= bullet.damage;
        score+= bullet.damage
        bullet.offscreen = true;
        if (this.health <= 0) {
          this.destroyed = true;
          ExplosionFX.create(this.x, this.y);
        }
        break;
      }
    }
  }
}

// --- ENEMY BULLET CLASS ---

// --- Explosion Effects Module (provides create / createShieldImpact / updateAndDraw)
const ExplosionFX = (function() {
  // internal list of active explosions managed by this module
  let _explosions = [];

  function create(x, y, options = {}) {
    const opts = {
      duration: options.duration || 1000,
      particleCount: options.particleCount || 15,
      isDeathStar: options.isDeathStar || false,
      scale: options.scale // optional scale override for death-star
    };

    const explosion = {
      x: x,
      y: y,
      startTime: millis(),
      duration: opts.duration,
      particles: [],
      isDeathStar: opts.isDeathStar,
      scale: opts.scale
    };

    for (let i = 0; i < opts.particleCount; i++) {
      explosion.particles.push({
        x: x + random(-5, 5),
        y: y + random(-5, 5),
        vx: random(-3, 3),
        vy: random(-3, 3),
        size: random(3, 8),
        life: 1.0
      });
    }

    _explosions.push(explosion);
    return explosion;
  }

  function createShieldImpact(x, y) {
    for (let i = 0; i < 8; i++) {
      _explosions.push({
        x: x + random(-10, 10),
        y: y + random(-10, 10),
        startTime: millis(),
        duration: 300,
        particles: [{
          x: x + random(-5, 5),
          y: y + random(-5, 5),
          vx: random(-2, 2),
          vy: random(-2, 2),
          size: random(2, 5),
          life: 1.0,
          isShieldImpact: true
        }]
      });
    }
  }

  function drawExplosion(explosion, progress) {
    push();

    const isDeathStar = !!explosion.isDeathStar;
    const sizeMultiplier = isDeathStar ? (explosion.scale || 10) : 1;
    const blastSize = (60 * sizeMultiplier) * sin(progress * PI);
    const alpha = (1.0 - progress) * 255;

    if (isDeathStar) {
      for (let shake = 0; shake < 6; shake++) {
        const shakeX = random(-12, 12);
        const shakeY = random(-12, 12);

        fill(255, 50, 0, alpha * 0.2);
        ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 4, blastSize * 4);

        fill(255, 100, 0, alpha * 0.3);
        ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 3, blastSize * 3);

        fill(255, 150, 0, alpha * 0.4);
        ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 2.5, blastSize * 2.5);
      }
    }

    fill(255, 100, 0, alpha * 0.6);
    ellipse(explosion.x, explosion.y, blastSize * 1.5, blastSize * 1.5);

    fill(255, 150, 0, alpha * 0.8);
    ellipse(explosion.x, explosion.y, blastSize, blastSize);

    fill(255, 255, 200, alpha);
    ellipse(explosion.x, explosion.y, blastSize * 0.5, blastSize * 0.5);

    if (isDeathStar && progress < 0.4) {
      fill(255, 255, 255, alpha * 1.2);
      ellipse(explosion.x, explosion.y, blastSize * 1.2, blastSize * 1.2);

      fill(255, 255, 255, alpha * 1.5);
      ellipse(explosion.x, explosion.y, blastSize * 0.6, blastSize * 0.6);
    }

    for (let particle of explosion.particles) {
      let pAlpha = particle.life * 255;
      let pSize = particle.size * particle.life;

      if (isDeathStar) {
        pSize *= 2.5;
        pAlpha = Math.min(255, pAlpha * 1.8);
      }

      if (particle.isShieldImpact) {
        fill(100, 200, 255, pAlpha);
      } else if (particle.life > 0.7) {
        fill(255, 255, 255, pAlpha);
      } else if (particle.life > 0.4) {
        fill(255, 200, 0, pAlpha);
      } else {
        fill(255, 100, 0, pAlpha);
      }

      ellipse(particle.x, particle.y, pSize, pSize);

      if (isDeathStar && particle.life > 0.3) {
        fill(255, 150, 50, pAlpha * 0.6);
        ellipse(particle.x - particle.vx, particle.y - particle.vy, pSize * 0.8, pSize * 0.8);

        fill(255, 100, 25, pAlpha * 0.4);
        ellipse(particle.x - particle.vx * 2, particle.y - particle.vy * 2, pSize * 0.6, pSize * 0.6);

        fill(255, 50, 0, pAlpha * 0.2);
        ellipse(particle.x - particle.vx * 3, particle.y - particle.vy * 3, pSize * 0.4, pSize * 0.4);
      }
    }

    pop();
  }

  function updateAndDraw() {
    for (let i = _explosions.length - 1; i >= 0; i--) {
      const explosion = _explosions[i];
      const currentTime = millis();
      const elapsed = currentTime - explosion.startTime;
      const progress = elapsed / explosion.duration;

      if (progress >= 1.0) {
        _explosions.splice(i, 1);
        continue;
      }

      for (let p of explosion.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life = 1.0 - progress;
      }

      drawExplosion(explosion, progress);
    }
  }

  function getActiveExplosions() { return _explosions; }

  function clearAll() { _explosions = []; }

  return { create, createShieldImpact, updateAndDraw, getActiveExplosions, clearAll };
})();

// --- ENEMY SPAWNER ---
function spawnEnemyGroup() {
  // Weighted selection: build arrays of keys and weights
  const keys = Object.keys(enemyTypes);
  const weights = keys.map(k => (enemyTypes[k].spawnWeight !== undefined) ? enemyTypes[k].spawnWeight : 1);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const cumulative = [];
  weights.reduce((acc, w, i) => cumulative[i] = acc + w, 0);

  // Keep the same number of group selections as before (one per type)
  const groupsToSpawn = keys.length;

  for (let g = 0; g < groupsToSpawn; g++) {
    // pick a weighted random index
    let r = Math.random() * totalWeight;
    let idx = 0;
    while (idx < cumulative.length && cumulative[idx] <= r) idx++;
    // Fallback to last key if something odd happens
    if (idx >= keys.length) idx = keys.length - 1;

    let typeKey = keys[idx];
    let type = enemyTypes[typeKey];

    // Track debug counts
    if (debugSpawnCounts) {
      _spawnDebugCountsMap[typeKey] = (_spawnDebugCountsMap[typeKey] || 0) + 1;
    }

    let startX = random(100, width - 100);
    // For stationary or rotating turrets, spawn them already on-screen so
    // they are visible immediately. Other enemies spawn above the screen.
    let startY;
    if (type.behavior === 'stationary' || type.behavior === 'rotatingTurret') {
      startY = random(50, height / 2);
    } else {
      startY = -random(100, 300);
    }

    for (let i = 0; i < type.groupSize; i++) {
      let x = startX + i * 60;
      let y = startY - i * 40;
      enemies.push(new Enemy(typeKey, x, y));
    }
  }

  // Chance to spawn a pickup when spawning a group
  if (Math.random() < PICKUP_SPAWN_CHANCE) {
    // build weighted list from pickupTypes
    const pkeys = Object.keys(pickupTypes);
    const pweights = pkeys.map(k => (pickupTypes[k].spawnWeight !== undefined) ? pickupTypes[k].spawnWeight : 1);
    const totalP = pweights.reduce((s, w) => s + w, 0);
    const pcumulative = [];
    pweights.reduce((acc, w, i) => pcumulative[i] = acc + w, 0);
    let r2 = Math.random() * totalP;
    let pidx = 0;
    while (pidx < pcumulative.length && pcumulative[pidx] <= r2) pidx++;
    if (pidx >= pkeys.length) pidx = pkeys.length - 1;
    // spawn pickup somewhere near the group area
    const spawnX = random(80, width - 80);
    const spawnY = -random(40, 160);
    spawnPickup(pkeys[pidx], spawnX, spawnY);
  }

  // Periodic debug summary
  if (debugSpawnCounts) {
    _spawnDebugCalls++;
    if (_spawnDebugCalls % 5 === 0) {
      console.log('[spawn debug] counts:', JSON.stringify(_spawnDebugCountsMap));
    }
  }
}

// --- PICKUPS ---
let pickups = [];
const pickupTypes = {
    battery: {
      spawnWeight: 5,
      w: 18,
      h: 14,
      color: 'rgb(80,180,255)'
    },
  health: {
    spawnWeight: 10,
    heal: 150,//og:135
    w: 18,
    h: 10,
    color: 'rgb(0,200,100)'
  },
  bomb: {
    spawnWeight: 2,
    w: 18,
    h: 18,
    color: 'rgb(200,200,40)'
  },
  nuke: {
    spawnWeight: 0.25,
    w: 22,
    h: 22,
    color: 'rgb(200,60,60)'
  },
  advbullet: {
    spawnWeight: 0, //for testing only - set very high to make it the only pickup that spawns
    w: 18,
    h: 18,
    color: 'rgb(120,220,255)'
  }
};

function spawnPickup(typeKey, x, y) {
  const t = pickupTypes[typeKey];
  if (!t) return null;
  const p = {
    type: typeKey,
    x: x != null ? x : random(60, width - 60),
    y: y != null ? y : -random(20, 120),
    w: t.w,
    h: t.h,
    vy: random(0.3, 1.0),
    created: millis()
  };
  pickups.push(p);
  return p;
}

function updateAndDrawPickups() {
  if (!pickups || pickups.length === 0) return;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    // simple gravity / drift downward
    p.y += p.vy;
    // draw as rectangle
    push();
    rectMode(CENTER);
    noStroke();
    const def = pickupTypes[p.type];
    if (p.type === 'health' && typeof healthPickupImg !== 'undefined' && healthPickupImg) {
      imageMode(CENTER);
      // Preserve sprite aspect ratio. Scale by desired height and compute width from image aspect.
      const desiredH = p.h * 2.2; // tweak this multiplier to change overall pickup size
      const aspect = healthPickupImg.width / max(1, healthPickupImg.height);
      const iw = desiredH * aspect;
      const ih = desiredH;
      image(healthPickupImg, p.x, p.y, iw, ih);
    } else if (p.type === 'bomb' && typeof bombPickupImg !== 'undefined' && bombPickupImg) {
      imageMode(CENTER);
      const desiredH = p.h * 2.2;
      const aspect = bombPickupImg.width / max(1, bombPickupImg.height);
      const iw = desiredH * aspect;
      const ih = desiredH;
      image(bombPickupImg, p.x, p.y, iw, ih);
    } else if (p.type === 'nuke' && typeof nukePickupImg !== 'undefined' && nukePickupImg) {
      imageMode(CENTER);
      const desiredH = p.h * 2.2;
      const aspect = nukePickupImg.width / max(1, nukePickupImg.height);
      const iw = desiredH * aspect;
      const ih = desiredH;
      image(nukePickupImg, p.x, p.y, iw, ih);
    } else if (p.type === 'battery' && typeof accumulatorImg !== 'undefined' && accumulatorImg) {
      imageMode(CENTER);
      const desiredH = p.h * 2.2;
      const aspect = accumulatorImg.width / max(1, accumulatorImg.height);
      const iw = desiredH * aspect;
      const ih = desiredH;
      image(accumulatorImg, p.x, p.y, iw, ih);
    } else {
      fill(def.color || 'white');
      rect(p.x, p.y, p.w, p.h, 3);
      // small label
      fill(255);
      textSize(10);
      textAlign(CENTER, CENTER);
      if (p.type === 'health') text('+HP', p.x, p.y);
      else if (p.type === 'bomb') text('BOMB', p.x, p.y);
      else if (p.type === 'nuke') text('NUKE', p.x, p.y);
      else if (p.type === 'battery') text('BAT', p.x, p.y);
    }
    pop();

    // offscreen removal
    if (p.y > height + 50) { pickups.splice(i, 1); continue; }

    // collision with players
    for (let pi = 0; pi < players.length; pi++) {
      const pl = players[pi];
      if (!pl || !pl.alive) continue;
      if (dist(p.x, p.y, pl.x, pl.y) <= max(p.w, p.h) + 12) {
        // apply effect
        if (p.type === 'advbullet') {
          advBulletActive = true;
          advBulletUntil = millis() + 7500;
          ExplosionFX.create(pl.x, pl.y, { duration: 350, particleCount: 12, color: 'cyan' });
        } else if (p.type === 'health') {
          if (pi === 0) playerHealth = min(startHealth, playerHealth + pickupTypes.health.heal);
          else if (pi === 1) player2Health = min(startHealth, player2Health + pickupTypes.health.heal);
          ExplosionFX.create(pl.x, pl.y, { duration: 300, particleCount: 8 });
        } else if (p.type === 'bomb') {
          bombsCount = (bombsCount || 0) + 1;
          ExplosionFX.create(pl.x, pl.y, { duration: 300, particleCount: 8, color: 'yellow' });
        } else if (p.type === 'nuke') {
          nukesCount = (nukesCount || 0) + 1;
          ExplosionFX.create(pl.x, pl.y, { duration: 400, particleCount: 12, color: 'red' });
        } else if (p.type === 'battery') {
          // Restore random(500,1000) energy, clamp to max
          const amt = Math.floor(random(500, 1001));
          energyCurrent = min(energyCapacity, (energyCurrent || 0) + amt);
          ExplosionFX.create(pl.x, pl.y, { duration: 300, particleCount: 10, color: 'cyan' });
        }
        // remove pickup
        pickups.splice(i, 1);
        break;
      }
    }
  }
}

// integrate pickup spawning into enemy spawner: small chance to spawn a pickup each group
const PICKUP_SPAWN_CHANCE = 1; //0.28

// --- SPECIAL INPUT HANDLERS ---
function keyPressed() {
  if (typeof key === 'undefined' || !key) return;
  const k = key.toLowerCase();
  // handle dev-prefix start (press ',' to enable next dev key)
  if (k === ',') {
    devPrefixActive = true;
    devPrefixUntil = millis() + devPrefixWindowMs;
    console.log('Dev prefix activated — press next key (e.g., k)');
    return;
  }

  // expire prefix if timed out
  if (devPrefixActive && millis() > devPrefixUntil) devPrefixActive = false;

  // Dev spawn: sequence ',' then 'k' within window
  if (k === 'k' && devPrefixActive) {
    devPrefixActive = false;
    if (!bossHasSpawned) {
      boss = new Boss(width/2, height * 0.25);
      bossHasSpawned = true;
      console.log('Dev: spawned boss via ,k');
      // suppress normal spawn until boss is defeated
      nukeNoSpawnUntil = millis() + 1000; // small pause
      try { stopGameMusic(); } catch (err) {}
      if (bossMusicAudio && !musicMuted) {
        try { bossMusicAudio.currentTime = 0; bossMusicAudio.play().catch(()=>{}); } catch (e) {}
      }
    } else {
      console.log('Dev: boss already spawned this run');
    }
    return;
  }

  // Music toggle: 'm' turns music off/on
  if (k === 'm') {
    musicMuted = !musicMuted;
    if (musicMuted) {
      stopGameMusic();
      stopMenuMusic();
    } else {
      if (mainMenuActive) playMenuMusic(); else playGameMusic();
    }
    console.log('Music muted:', musicMuted);
    return;
  }
  // Menu toggle (E)
  if (k === 'e') {
    // If we're at the game over screen, go back to the main menu and reset transient game state
    if (gameOverActive) {
      gameOverActive = false;
      mainMenuActive = true;
      // stop gameplay music and play menu music
      stopGameMusic();
      playMenuMusic();
      // clear runtime entities so menu shows a clean state
      enemies = [];
      bullets = [];
      enemyBullets = [];
      players = [];
      player = null;
      ExplosionFX.clearAll();
      nukeActive = false;
      nukeCleared = false;
      // resume the draw loop so the menu renders
      loop();
      return;
    }

    // If the shop is open, close it and return to the main menu
    if (shopActive) {
      shopActive = false;
      // stop store audio if playing
      if (storeAudio) {
        try { storeAudio.pause(); storeAudio.currentTime = 0; } catch (err) {}
      }
      mainMenuActive = true;
      // stop gameplay music and play menu music
      stopGameMusic();
      playMenuMusic();
      // resume draw loop so menu renders
      loop();
      return;
    }

    // Toggle the main menu display
    mainMenuActive = !mainMenuActive;
    if (mainMenuActive) { stopGameMusic(); playMenuMusic(); } else { stopMenuMusic(); }
    return;
  }

  // while main menu is open, ignore other key inputs
  if (mainMenuActive) return;
    // Quick consumable: Repair Pack on 'b' (consume and heal current player)
    if (k === 'b') {
      if ((repairPacksCount || 0) <= 0) {
        shopMessage = 'No repair packs'; shopMessageTimer = millis();
        return;
      }
      // If buddy mode is active, heal both players
      if (buddyMode) {
        playerHealth = min(startHealth, playerHealth + 75);
        player2Health = min(startHealth, player2Health + 75);
      } else {
        // find index of current `player` in players array
        const idx = players.indexOf(player);
        if (idx === -1) {
          // default to primary
          playerHealth = min(startHealth, playerHealth + 75);
        } else {
          if (idx === 0) playerHealth = min(startHealth, playerHealth + 75);
          else if (idx === 1) player2Health = min(startHealth, player2Health + 75);
          else playerHealth = min(startHealth, playerHealth + 75);
        }
      }
      repairPacksCount = Math.max(0, repairPacksCount - 1);
      // play repair sound if available
      if (repairAudio) {
        try { repairAudio.currentTime = 0; repairAudio.play().catch(() => {}); } catch (err) {}
      }
      shopMessage = '+75 HP'; shopMessageTimer = millis();
      return;
    }
  const id = KEY_BINDINGS[k];
  if (!id) return;
  const e = specialAttackRegistry.entries[id];
  if (!e) return;

  if (e.type === 'charge') {
    e._pressTime = millis();
    e._isCharging = true;
    // Allow charge-type specials to start an effect immediately via handler
    if (e.handler) {
      try { e.handler(player, { charging: true, spawnPlayerBullet, spawnExplosionAt, mouseX, mouseY }); } catch (err) { console.error(err); }
    }
  } else if (e.type === 'toggle') {
    if (specialAttackRegistry.canUse(id)) {
      e.active = !e.active;
      e.lastUsed = millis();
      if (e.handler) e.handler(player, { toggle: e.active, spawnPlayerBullet, spawnExplosionAt, mouseX, mouseY });
    }
  } else {
    // instant
    player.triggerSpecial(id, { spawnPlayerBullet, spawnExplosionAt, mouseX, mouseY });
  }
}

function keyReleased() {
  if (typeof key === 'undefined' || !key) return;
  const k = key.toLowerCase();
  const id = KEY_BINDINGS[k];
  if (!id) return;
  const e = specialAttackRegistry.entries[id];
  if (!e) return;

  if (e.type === 'charge' && e._isCharging) {
    const chargeMs = millis() - e._pressTime;
    e._isCharging = false;
    e._pressTime = 0;
    // call onRelease if present, otherwise call handler with chargeTime
    const ctx = { chargeTime: chargeMs / 1000, spawnPlayerBullet, spawnExplosionAt, mouseX, mouseY };
    if (e.onRelease) e.onRelease(player, ctx);
    else if (e.handler) e.handler(player, ctx);
    e.lastUsed = millis();
  }
}

// --- SPECIAL UI / DEBUG DRAW ---
function drawSpecialUI() {
  if (!debugSpecials) return;
  const entries = Object.values(specialAttackRegistry.entries);
  if (!entries.length) return;
  push();
  textSize(12);
  fill(255);
  let x = 10;
  let y = 50;
  for (let e of entries) {
    const cd = e.cooldown || 0;
    const elapsed = millis() - (e.lastUsed || 0);
    const ready = elapsed >= cd;
    fill(0, 0, 0, 160);
    rect(x - 4, y - 12, 200, 18, 4);
    fill(255);
    text(`${(e.key || '?').toUpperCase()} ${e.label} ${ready ? '' : '(' + Math.ceil((cd - elapsed) / 1000) + 's)'}`, x, y);
    y += 22;
  }
  pop();
}

// --- MAIN MENU DRAWING / INPUT ---
function getMainMenuButtons() {
  const w = 200;
  const h = 60;
  const gap = 20;
  // three buttons: SOLO | BUDDY | STORE
  const totalW = w * 3 + gap * 2;
  const startX = (width - totalW) / 2;
  const y = height - h - 40;
  return {
    solo: { x: startX, y: y, w: w, h: h },
    buddy: { x: startX + w + gap, y: y, w: w, h: h },
    store: { x: startX + (w + gap) * 2, y: y, w: w, h: h }
  };
}

function drawMainMenu() {
  push();
  // draw background image if available
  if (mainMenuImg) {
    imageMode(CORNER);
    image(mainMenuImg, 0, 0, width, height);
  } else {
    background(10, 10, 30);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text('HORZ FORCE', width/2, height/2 - 80);
  }

  // draw buttons
  const btns = getMainMenuButtons();
  rectMode(CORNER);
  // SOLO button (left) — show plane image centered above label
  fill(40, 160, 40);
  rect(btns.solo.x, btns.solo.y, btns.solo.w, btns.solo.h, 8);
  // draw plane icon inside the solo button if available
  if (planeMainImg) {
    push();
    imageMode(CENTER);
    const iconW = min(48, btns.solo.w - 20);
    const iconH = iconW * (planeMainImg.height / planeMainImg.width);
    image(planeMainImg, btns.solo.x + 48, btns.solo.y + btns.solo.h/2, iconW, iconH);
    pop();
  }
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text('SOLO', btns.solo.x + btns.solo.w/2 + 20, btns.solo.y + btns.solo.h/2);

  // BUDDY button (right) — show two plane icons and label
  fill(40, 40, 160);
  rect(btns.buddy.x, btns.buddy.y, btns.buddy.w, btns.buddy.h, 8);
  // draw two plane icons side-by-side
  push();
  imageMode(CENTER);
  const iconW = min(36, btns.buddy.w/3);
  const leftX = btns.buddy.x + btns.buddy.w/2 - 18;
  const rightX = btns.buddy.x + btns.buddy.w/2 + 18;
  const yIcon = btns.buddy.y + btns.buddy.h/2 - 6;
  if (planeMainImg) image(planeMainImg, leftX, yIcon, iconW, iconW * (planeMainImg.height/planeMainImg.width));
  if (ship2Img) image(ship2Img, rightX, yIcon, iconW, iconW * (ship2Img.height/ship2Img.width));
  // fallback if ship2Img missing: draw two of planeMainImg
  if (!ship2Img && planeMainImg) image(planeMainImg, rightX, yIcon, iconW, iconW * (planeMainImg.height/planeMainImg.width));
  pop();
  fill(255);
  textSize(18);
  text('BUDDY', btns.buddy.x + btns.buddy.w/2, btns.buddy.y + btns.buddy.h/2 + 18);

  // STORE button (right-most)
  fill(80, 80, 80);
  rect(btns.store.x, btns.store.y, btns.store.w, btns.store.h, 8);
  // Draw a simple cart icon on the left side of the button
  push();
  translate(btns.store.x + 48, btns.store.y + btns.store.h/2);
  // cart body
  fill(220);
  rectMode(CENTER);
  rect(0, -4, 36, 18, 3);
  // handle
  stroke(220);
  strokeWeight(3);
  line(-16, -12, -6, -6);
  noStroke();
  // wheels
  fill(40);
  ellipse(-10, 10, 8);
  ellipse(10, 10, 8);
  pop();
  fill(255);
  textSize(18);
  text('STORE', btns.store.x + btns.store.w/2, btns.store.y + btns.store.h/2 + 18);

  // hint
  fill(255, 200);
  textSize(12);
  text('Press E to close menu', width/2, btns.solo.y + btns.solo.h + 20);
  pop();
}

function drawShop() {
  push();
  // gray background
  background(70);

  // Credits top-left
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`Credits: ${creditsBalance}`, 12, 12);

  // Storage top-right
  textAlign(RIGHT, TOP);
  text(`Storage: ${Math.round(storageCurrent * 10) / 10}/${storageCapacity} m³`, width - 12, 12);

  // Title
  textAlign(CENTER, TOP);
  textSize(36);
  fill(220);
  text('STORE', width/2, 40);

  // Vertical list layout for store items
  const btnW = Math.min(560, width - 120);
  const btnH = 56;
  const gap = 18;
  const contentTop = 110; // y where list starts (below title)
  const visibleH = height - contentTop - 120; // leave space for footer/instructions

  // Build shop item list (order matters for vertical layout)
  const items = [];
  // Mega Beam is a one-time purchase (1500 cr)
  items.push({ id: 'mega', label: `MEGA BEAM — 1500 cr, 3 m³${megaBeamOwned ? ' (OWNED)' : ''}`, cost: 1500, storage: 3, onceOnly: true });
  // Ion Beam: cheaper, weaker, consumes 100 J/s, one-time purchase (1 m³)
  items.push({ id: 'ion', label: `ION BEAM — 750 cr, 1 m³${ionBeamOwned ? ' (OWNED)' : ''}`, cost: 750, storage: 1, onceOnly: true });
  // Solar Panel: passive +1 J/s per purchase, repeatable (takes 0.25 m³)
  items.push({ id: 'solar', label: `Solar Panel — 20 cr (+1 J/s, 0.25 m³)`, cost: 20, storage: 0.25, onceOnly: false });
  // Repair Pack: consumable, restores 75 HP, no storage cost
  items.push({ id: 'repair', label: `Repair Pack — 100 cr (restore 75 HP)`, cost: 100, storage: 0, onceOnly: false });
  items.push({ id: 'nuke', label: `Buy Nuke — 2500 cr, 5 m³`, cost: 2500, storage: 5 });
  items.push({ id: 'bomb', label: `Buy Bomb — 75 cr, 1 m³`, cost: 75, storage: 1 });
  const accCost = Math.max(1, Math.round(energyCapacity * 0.05));
  items.push({ id: 'accumulator', label: `Accumulator Lv${accumulatorLevel} — ${accCost} cr`, cost: accCost, storage: 0.5 });
  // Storage upgrade: increases max storage capacity by STORAGE_DELTA m³, no storage cost to buy
  const STORAGE_DELTA = 2; // how much storage capacity increases per purchase
  const storageCost = Math.max(1, Math.round(storageCapacity * 10));
  items.push({ id: 'storage', label: `Storage +${STORAGE_DELTA} m³ — ${storageCost} cr`, cost: storageCost, storage: 0, delta: STORAGE_DELTA });

  // compute content height and clamp scroll
  const contentHeight = items.length * (btnH + gap);
  shopMaxScroll = Math.max(0, contentHeight - visibleH);
  shopScrollY = constrain(shopScrollY, 0, shopMaxScroll);

  // draw the list clipped to the central region
  push();
  // container position (centered horizontally)
  const cx = width / 2 - btnW / 2;
  // translate by -shopScrollY to implement scrolling
  translate(cx, contentTop - shopScrollY);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const y = i * (btnH + gap);
    // cannot buy if insufficient credits/storage or if it's a one-time item already owned
    let canBuy = (creditsBalance || 0) >= it.cost && ((it.storage || 0) <= storageCurrent);
    if ((it.id === 'mega' && megaBeamOwned) || (it.id === 'ion' && ionBeamOwned)) canBuy = false;
    fill(canBuy ? 'rgb(60,160,60)' : 'rgb(80,80,80)');
    rect(0, y, btnW, btnH, 8);
    // draw optional icon for certain items on the left
    const iconSize = 40;
    const iconPad = 12;
    let iconImg = null;
    if (it.id === 'mega') iconImg = (typeof megaBeamIconImg !== 'undefined') ? megaBeamIconImg : null;
    else if (it.id === 'ion') iconImg = (typeof ionBeamIconImg !== 'undefined') ? ionBeamIconImg : null;
    else if (it.id === 'nuke') iconImg = (typeof nukePickupImg !== 'undefined') ? nukePickupImg : null;
    else if (it.id === 'bomb') iconImg = (typeof bombPickupImg !== 'undefined') ? bombPickupImg : null;
    else if (it.id === 'repair') iconImg = (typeof repairKitImg !== 'undefined') ? repairKitImg : null;
    else if (it.id === 'storage') iconImg = (typeof crateImg !== 'undefined') ? crateImg : null;
    else if (it.id === 'accumulator') iconImg = (typeof accumulatorImg !== 'undefined') ? accumulatorImg : null;
    else if (it.id === 'solar') iconImg = (typeof solarPanelImg !== 'undefined') ? solarPanelImg : null;
    if (iconImg) {
      imageMode(CORNER);
      // preserve aspect ratio
      const aspect = iconImg.width / max(1, iconImg.height);
      const iw = iconSize * aspect;
      const ih = iconSize;
      image(iconImg, iconPad, y + (btnH - ih) / 2, iw, ih);
    }
    // draw label shifted to account for icon (if present)
    fill(255);
    textSize(16);
    textAlign(LEFT, CENTER);
    const textX = iconImg ? (iconPad + iconSize + 12) : (btnW / 2 - 120);
    text(it.label, textX, y + btnH / 2);
  }
  pop();

  // instructions
  textSize(12);
  fill(200);
  text('Use mouse wheel or two-finger scroll to move the list. Press E to return to menu', width/2, height - 80);

  // show current inventory near the bottom
  textSize(14);
  fill(220);
  textAlign(CENTER, TOP);
  text(`Nukes: ${nukesCount}   Bombs: ${bombsCount}   AccLv: ${accumulatorLevel}   Storage: ${storageCapacity} m³   MEGA: ${megaBeamOwned ? 'OWNED' : 'LOCKED'}   ION: ${ionBeamOwned ? 'OWNED' : 'LOCKED'}   SOLAR: ${solarPanelsCount}`, width/2, height - 56);
  text(`   REPAIR: ${repairPacksCount}`, width/2 + 460, height - 56);

  // simple scrollbar on the right of the list
  if (contentHeight > visibleH) {
    const sbX = cx + btnW + 12;
    const sbY = contentTop;
    const sbH = visibleH;
    fill(60, 60, 70, 160);
    rect(sbX, sbY, 8, sbH, 4);
    const thumbH = max(20, sbH * (visibleH / contentHeight));
    const thumbY = sbY + (shopScrollY / (shopMaxScroll || 1)) * (sbH - thumbH);
    fill(200);
    rect(sbX, thumbY, 8, thumbH, 4);
  }

  // draw shopMessage if present (red popup)
  if (shopMessage && (millis() - shopMessageTimer) < shopMessageDuration) {
    push();
    const msg = (shopMessage === 'credits') ? 'Not enough\ncredits' : (shopMessage === 'storage') ? 'Not enough\nstorage' : (shopMessage === 'bought') ? 'Purchase complete' : shopMessage;
    fill(180, 40, 40);
    rectMode(CENTER);
    const mw = 280;
    const mh = 64;
    rect(width/2, height/2 - 120, mw, mh, 6);
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    // support newline
    const parts = msg.split('\n');
    for (let i = 0; i < parts.length; i++) {
      text(parts[i], width/2, height/2 - 120 - (parts.length-1)*8 + i*18);
    }
    pop();
  }

  pop();
}

function mousePressed() {
  // if shop active, handle shop clicks
  if (shopActive) {
    // Vertical list purchase handling
    const btnW = Math.min(560, width - 120);
    const btnH = 56;
    const gap = 18;
    const contentTop = 110;
    const STORAGE_DELTA = 2;
    const items = [
      { id: 'mega', cost: 1500, storage: 0, onceOnly: true },
      { id: 'ion', cost: 750, storage: 0, onceOnly: true },
      { id: 'solar', cost: 20, storage: 0.25, onceOnly: false },
      { id: 'repair', cost: 100, storage: 0, onceOnly: false },
      { id: 'nuke', cost: 2500, storage: 5 },
      { id: 'bomb', cost: 75, storage: 1 },//cheaper to encorage bomb yse
      { id: 'accumulator', cost: Math.max(1, Math.round(energyCapacity * 0.05)), storage: 0.5 },
      { id: 'storage', cost: Math.max(1, Math.round(storageCapacity * 10)), storage: 0, delta: STORAGE_DELTA }
    ];

    // detect which item was clicked by mapping mouseY into content coordinates
    for (let i = 0; i < items.length; i++) {
      const y = contentTop + i * (btnH + gap) - shopScrollY;
      const x = width / 2 - btnW / 2;
      if (mouseX >= x && mouseX <= x + btnW && mouseY >= y && mouseY <= y + btnH) {
        const it = items[i];
        // support Shift+click to buy 10 for repeatable items (solar, accumulator, storage, bomb)
        let qty = 1;
        try {
          if (keyIsDown && keyIsDown(SHIFT)) {
            if (it.id === 'solar' || it.id === 'accumulator' || it.id === 'storage' || it.id === 'bomb') qty = 10;
          }
        } catch (err) { qty = 1; }
        const totalCost = (it.cost || 0) * qty;
        if ((creditsBalance || 0) < totalCost) {
          shopMessage = 'credits'; shopMessageTimer = millis();
          return;
        }
        const requiredStorage = (it.storage || 0) * qty;
        if (requiredStorage > storageCurrent) {
          shopMessage = 'storage'; shopMessageTimer = millis();
          return;
        }

        // perform purchase by id
        if (it.id === 'mega') {
          if (megaBeamOwned) {
            shopMessage = 'Already owned'; shopMessageTimer = millis();
            return;
          }
          creditsBalance -= it.cost;
          // deduct storage for the mega beam
          storageCurrent = max(0, storageCurrent - requiredStorage);
          megaBeamOwned = true;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased MEGA BEAM — owned now', megaBeamOwned, 'creditsBalance:', creditsBalance, 'storage:', storageCurrent);
          return;
        }
        if (it.id === 'ion') {
          if (ionBeamOwned) {
            shopMessage = 'Already owned'; shopMessageTimer = millis();
            return;
          }
          creditsBalance -= it.cost;
          // deduct storage for the ion beam
          storageCurrent = max(0, storageCurrent - requiredStorage);
          ionBeamOwned = true;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased ION BEAM — owned now', ionBeamOwned, 'creditsBalance:', creditsBalance, 'storage:', storageCurrent);
          return;
        }
        if (it.id === 'solar') {
          // repeatable purchase, supports Shift+click to buy multiple
          creditsBalance -= totalCost;
          solarPanelsCount = (solarPanelsCount || 0) + qty;
          // deduct storage for all purchased panels
          storageCurrent = max(0, storageCurrent - requiredStorage);
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased Solar Panel x' + qty + ' — count now', solarPanelsCount, 'creditsBalance:', creditsBalance, 'storage:', storageCurrent);
          return;
        }
        if (it.id === 'repair') {
          // repeatable consumable, supports bulk buy via Shift
          creditsBalance -= totalCost;
          repairPacksCount = (repairPacksCount || 0) + qty;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased Repair Pack x' + qty + ' — count now', repairPacksCount, 'creditsBalance:', creditsBalance);
          return;
        }
        // (handled above) // solar purchase handled earlier
        if (it.id === 'nuke') {
          creditsBalance -= it.cost;
          storageCurrent -= it.storage;
          nukesCount = (nukesCount || 0) + 1;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased nuke — nukesCount now', nukesCount, 'creditsBalance:', creditsBalance, 'storage:', storageCurrent);
          return;
        }
        if (it.id === 'bomb') {
          creditsBalance -= totalCost;
          storageCurrent -= requiredStorage;
          bombsCount = (bombsCount || 0) + qty;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased bomb x' + qty + ' — bombsCount now', bombsCount, 'creditsBalance:', creditsBalance, 'storage:', storageCurrent);
          return;
        }
        if (it.id === 'accumulator') {
          // support qty (though accumulator typically bought one at a time)
          creditsBalance -= totalCost;
          accumulatorLevel = (accumulatorLevel || 0) + qty;
          // increase energyCapacity multiplicatively per purchase
          energyCapacity = Math.round(energyCapacity * Math.pow(1.10, qty));
          energyCurrent = energyCapacity;
          // deduct storage for accumulator purchases
          storageCurrent = max(0, storageCurrent - requiredStorage);
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased accumulator — level', accumulatorLevel, 'energyCapacity:', energyCapacity, 'creditsBalance:', creditsBalance);
          return;
        }
        if (it.id === 'storage') {
          // increase max storage capacity by the item's delta; also increase available storage by same amount
          const delta = (it.delta != null) ? it.delta : 1;
          // support bulk purchase via qty
          creditsBalance -= (it.cost || 0) * qty;
          storageCapacity = (storageCapacity || 0) + delta * qty;
          storageCurrent = (storageCurrent || 0) + delta * qty;
          playPurchaseSound(it, qty); shopMessage = 'bought'; shopMessageTimer = millis();
          console.log('Shop: purchased storage upgrade x' + qty + ' — storageCapacity now', storageCapacity, 'storageCurrent:', storageCurrent, 'creditsBalance:', creditsBalance);
          return;
        }
      }
    }
    // clicks outside buy items do nothing
    return;
  }

  // if menu active, handle clicks on its buttons
  if (mainMenuActive) {
    const b = getMainMenuButtons();
    // SOLO button
    if (mouseX >= b.solo.x && mouseX <= b.solo.x + b.solo.w && mouseY >= b.solo.y && mouseY <= b.solo.y + b.solo.h) {
        mainMenuActive = false;
      startGame(false);
      return;
    }
    // BUDDY button
    if (mouseX >= b.buddy.x && mouseX <= b.buddy.x + b.buddy.w && mouseY >= b.buddy.y && mouseY <= b.buddy.y + b.buddy.h) {
        mainMenuActive = false;
      startGame(true);
      return;
    }
    // STORE button opens the shop
    if (mouseX >= b.store.x && mouseX <= b.store.x + b.store.w && mouseY >= b.store.y && mouseY <= b.store.y + b.store.h) {
      // stop menu music
      stopMenuMusic();
      mainMenuActive = false;
      shopActive = true;
      // play store jingle (user gesture)
      if (storeAudio) {
        try { storeAudio.currentTime = 0; storeAudio.play().catch(() => {}); } catch (err) {}
      }
      return;
    }
  }
}

// --- SCROLLING BACKGROUND ---
// Mouse wheel handler for shop scrolling
function mouseWheel(event) {
  if (shopActive) {
    // event.delta is positive when scrolling down; increase scrollY accordingly
    shopScrollY += event.delta;
    shopScrollY = constrain(shopScrollY, 0, shopMaxScroll);
    return false; // prevent default page scroll
  }
  // allow default otherwise
}

// --- SCROLLING BACKGROUND ---
function drawScrollingBackground() {
  // pick active image based on style (choose from loaded variants if available)
  const candidates = (bgStyle === 'slate') ? (bgSlateImgs.length ? bgSlateImgs : (bgSlateImg ? [bgSlateImg] : []))
                                         : (bgDesertImgs.length ? bgDesertImgs : (bgDesertImg ? [bgDesertImg] : []));
  if (!bgImg || lastBgStyle !== bgStyle) {
    // pick an initial random image for this style
    if (candidates && candidates.length > 0) {
      const sel = random(candidates);
      if (sel && sel.img) {
        bgImg = sel.img;
        bgCurrentName = sel.name || null;
      } else {
        bgImg = sel;
        bgCurrentName = null;
      }
      console.log('Initial background selected:', bgCurrentName || '(unnamed)');
    } else {
      bgImg = (bgStyle === 'slate') ? bgSlateImg : bgDesertImg;
      bgCurrentName = null;
    }
  }

  // if style changed since last frame, reinitialize scroll positions
  if (lastBgStyle !== bgStyle) {
    bgInitialized = false;
    lastBgStyle = bgStyle;
    bgY1 = 0;
    bgY2 = 0;
  }

  if (!bgImg) {
    background(20, 20, 50);
    return;
  }

  // initialize scaled sizes and starting positions once bgImg is loaded
  if (!bgInitialized && bgImg.width) {
    // choose a scale so the image is noticeably "huge" while covering width
    const scale = max(width / bgImg.width, height / bgImg.height) * bgScaleFactor;
    bgScaledW = bgImg.width * scale;
    bgScaledH = bgImg.height * scale;

    // center horizontally
    // starting positions: one at 0, the other immediately above it
    bgY1 = 0;
    bgY2 = -bgScaledH;
    bgInitialized = true;
  }

  // draw two images to cover the vertical scroll, centered horizontally
  push();
  imageMode(CORNER);
  const x = (width - bgScaledW) / 2;
  image(bgImg, x, bgY1, bgScaledW, bgScaledH);
  image(bgImg, x, bgY2, bgScaledW, bgScaledH);
  pop();

  // advance both
  bgY1 += bgSpeed;
  bgY2 += bgSpeed;

  // when one image moves completely below the canvas, wrap it above the other
  let wrapped = false;
  if (bgY1 >= bgScaledH) {
    bgY1 = bgY2 - bgScaledH;
    wrapped = true;
  }
  if (bgY2 >= bgScaledH) {
    bgY2 = bgY1 - bgScaledH;
    wrapped = true;
  }

  // If we've completed a vertical cycle, pick a new random image for the current style
  if (wrapped) {
    if (candidates && candidates.length > 0) {
      const sel = random(candidates);
      if (sel && sel.img) {
        bgImg = sel.img;
        bgCurrentName = sel.name || null;
      } else {
        bgImg = sel;
        bgCurrentName = null;
      }
      console.log('Background switched to:', bgCurrentName || '(unnamed)');
    } else {
      bgImg = (bgStyle === 'slate') ? bgSlateImg : bgDesertImg;
      bgCurrentName = null;
    }
    // force reinitialization so scaling and positions are recalculated for the new image
    bgInitialized = false;
    if (bgImg && bgImg.width) {
      const scale = max(width / bgImg.width, height / bgImg.height) * bgScaleFactor;
      bgScaledW = bgImg.width * scale;
      bgScaledH = bgImg.height * scale;
      bgY1 = 0;
      bgY2 = -bgScaledH;
      bgInitialized = true;
    }
  }
}

// --- GAME OVER ---
function gameOver() {
  // compute credits: 1 credit per 10 points
  const creditsEarned = Math.floor((score || 0) / 10);
  lastCreditsEarned = creditsEarned;
  creditsBalance = (creditsBalance || 0) + creditsEarned;

  // draw a game-over + credits popup immediately, then stop the loop
  push();
  // dim background
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // MAIN title
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 40);

  // credits popup
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(`You earned ${creditsEarned} credits`, width / 2, height / 2 + 10);
  textSize(16);
  text(`Total credits: ${creditsBalance}`, width / 2, height / 2 + 40);
  // prompt to return to menu
  textSize(14);
  textAlign(CENTER, CENTER);
  fill(200);
  text('Click E to return to menu', width / 2, height / 2 + 80);

  pop();
  gameOverActive = true;
  noLoop();
}




