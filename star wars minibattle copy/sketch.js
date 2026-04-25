// ===== GLOBAL VARIABLES =====

// Starship properties - stores position, size, and movement speed
let ship = {
  x: 400,        // X position (horizontal) - will be updated to center in setup
  y: 450,        // Y position (vertical) - will be updated in setup
  w: 40,         // Width of ship
  h: 20,         // Height of ship
  speed: 5,      // Movement speed in pixels per frame
  hp: 250,       // Player health points
  maxHp: 250     // Maximum health for health bar
};

// Array to store all regular laser bullets currently on screen
let bullets = [];

// Initialize screen shake intensity
let screenShake = 0; 

// Array to store all ion cannon shots currently on screen
let ionShots = [];

// Ion cannon properties
let ionRayLength = 1500;        // Length of ion beam in pixels

// Sound effects
let ionSound;                  // "Whoomp" sound for ion cannon
let bulletSound;               // Machine gun sound for regular bullets
let explosionSound;            // TIE fighter explosion sound
let deathStarExplosionSound;   // Death Star explosion sound

// Bullet firing control
let lastBulletTime = 0;        // Time when last bullet was fired
let bulletFireRate = 50;      // Fire rate in milliseconds (50ms = 20 bullets/sec) for overall balance

// Ion cannon cooldown
let lastIonTime = 0;           // Time when last ion shot was fired
let ionCooldown = 1000;        // Ion cannon cooldown in milliseconds (3 seconds) to make it funner and more balanced

// Enemy ships array
let enemies = [];

// Death Star boss
let deathStar = true; //null;

// Enemy counter for Death Star spawn
let enemiesDefeated = 0;
let deathStarSpawned = false;

// Weapon damage values
let bulletDamage = 0.5;          // Damage per bullet, for balance
let ionDamage = 50;           // Damage per ion shot, better for balance

// Array to store background star positions and sizes
let stars = [];

// Array to store active explosions
let explosions = [];

// Array to store enemy bullets
let enemyBullets = [];

// Array to store Death Star bullets
let deathStarBullets = [];

// Energy shield system
let shieldActive = false;        // Whether shield is currently active
let shieldStartTime = 0;         // When shield was activated
let lastShieldTime = 0;          // When shield was last used
let shieldDuration = 3000;       // Shield lasts 3 seconds
let shieldCooldown = 10000;      // Shield cooldown is 10 seconds

// ===== SETUP FUNCTION =====
// This runs once when the program starts
function setup() {
  createCanvas(windowWidth, windowHeight);  // Create full screen canvas
  
  // Position ship at center bottom of screen
  ship.x = width / 2;
  ship.y = height - 100;
  
  // Generate random stars for background
  for (let i = 0; i < 120; i++) {  // More stars for larger screen
    stars.push({
      x: random(width),      // Random X position across canvas width
      y: random(height),     // Random Y position across canvas height
      r: random(1, 3)        // Random radius between 1-3 pixels
    });
  }
  
  // Create sound effects using p5.sound oscillators
  createSounds();
  
  // Spawn initial enemy ships
  spawnEnemies();
}

// Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposition ship when window resizes
  ship.x = constrain(ship.x, 0, width);
  ship.y = constrain(ship.y, 0, height);
}

// ===== SOUND CREATION FUNCTION =====
// Creates synthetic sound effects for weapons
function createSounds() {
  // Create ion cannon "whoomp" sound
  ionSound = new p5.Oscillator('sine');
  ionSound.freq(80);             // Low frequency for deep "whoomp"
  ionSound.amp(0);               // Start with zero amplitude
  
  // Create bullet machine gun sound
  bulletSound = new p5.Oscillator('sawtooth');
  bulletSound.freq(300);         // Higher frequency for sharp bullet sound
  bulletSound.amp(0);            // Start with zero amplitude
  
  // Create TIE fighter explosion sound
  explosionSound = new p5.Oscillator('square');
  explosionSound.freq(200);      // Mid frequency for explosion
  explosionSound.amp(0);         // Start with zero amplitude
  
  // Create Death Star explosion sound
  deathStarExplosionSound = new p5.Oscillator('sawtooth');
  deathStarExplosionSound.freq(50);  // Very low frequency for massive explosion
  deathStarExplosionSound.amp(0);    // Start with zero amplitude
}

// ===== SOUND PLAYBACK FUNCTIONS =====
// Play ion cannon "whoomp" sound
function playIonSound() {
  ionSound.start();
  ionSound.amp(0.6, 0.01);       // Quick attack to 60% volume (increased from 30%)
  ionSound.freq(80, 0.01);       // Start at 80Hz
  ionSound.freq(40, 0.5);        // Drop to 40Hz over 0.5 seconds
  ionSound.amp(0, 0.5);          // Fade out over 0.5 seconds
  setTimeout(() => ionSound.stop(), 600);  // Stop after 0.6 seconds
}

// Play bullet machine gun sound
function playBulletSound() {
  bulletSound.start();
  bulletSound.amp(0.15, 0.001);  // Quick attack to 15% volume
  bulletSound.freq(300, 0.001);  // Start at 300Hz
  bulletSound.freq(200, 0.1);    // Drop to 200Hz quickly
  bulletSound.amp(0, 0.1);       // Fade out over 0.1 seconds
  setTimeout(() => bulletSound.stop(), 120);  // Stop after 0.12 seconds
}

// Play TIE fighter explosion sound
function playExplosionSound() {
  explosionSound.start();
  explosionSound.amp(0.4, 0.01);    // Quick attack to 40% volume
  explosionSound.freq(200, 0.01);   // Start at 200Hz
  explosionSound.freq(80, 0.3);     // Drop to 80Hz over 0.3 seconds
  explosionSound.amp(0, 0.8);       // Fade out over 0.8 seconds
  setTimeout(() => explosionSound.stop(), 900);  // Stop after 0.9 seconds
}

// Play Death Star massive explosion sound
function playDeathStarExplosionSound() {
  deathStarExplosionSound.start();
  deathStarExplosionSound.amp(0.8, 0.02);   // Quick attack to 80% volume - LOUD!
  deathStarExplosionSound.freq(50, 0.02);   // Start at very low 50Hz
  deathStarExplosionSound.freq(20, 2.0);    // Drop to ultra-low 20Hz over 2 seconds
  deathStarExplosionSound.amp(0.6, 1.5);    // Stay loud for 1.5 seconds
  deathStarExplosionSound.amp(0, 3.0);      // Very slow fade out over 3 seconds
  setTimeout(() => deathStarExplosionSound.stop(), 6000);  // Stop after 6 seconds - LONG!
}

// ===== ENEMY MANAGEMENT FUNCTIONS =====
// Spawn enemy ships
function spawnEnemies() {
  for (let i = 0; i < 5; i++) {
    enemies.push({
      x: random(50, width - 50),     // Random X position
      y: random(50, 200),            // Random Y in upper area
      hp: 50,                        // Health points
      maxHp: 50,                     // Maximum health for health bar
      w: 30,                         // Width
      h: 15,                         // Height
      speed: random(0.5, 2),         // Random movement speed
      direction: random(0, TWO_PI),  // Random movement direction
      lastFireTime: 0,               // Time when last shot was fired
      fireRate: random(1500, 3000)   // Fire rate in milliseconds (1.5-3 seconds)
    });
  }
  
  // Alert player that enemies have been detected
  alert("ENEMIES DETECTED");
}

// Draw enemy ship (TIE Fighter style)
function drawEnemy(enemy) {
  push();
  translate(enemy.x, enemy.y);
  
  // ===== TIE FIGHTER SOLAR PANELS =====
  // Main solar panel structure
  fill(70, 70, 70);               // Dark gray base for panels
  rect(-20, -14, 10, 28, 1);      // Left solar panel (larger)
  rect(10, -14, 10, 28, 1);       // Right solar panel (larger)
  
  // Solar panel grid details
  stroke(50, 50, 50);             // Darker lines for grid
  strokeWeight(0.5);
  
  // Left panel grid
  for (let i = -18; i < -12; i += 2) {
    line(i, -12, i, 12);          // Vertical grid lines
  }
  for (let j = -12; j < 12; j += 3) {
    line(-19, j, -11, j);         // Horizontal grid lines
  }
  
  // Right panel grid
  for (let i = 11; i < 19; i += 2) {
    line(i, -12, i, 12);          // Vertical grid lines
  }
  for (let j = -12; j < 12; j += 3) {
    line(11, j, 19, j);           // Horizontal grid lines
  }
  
  noStroke();
  
  // Panel edge highlights
  fill(90, 90, 90);               // Lighter gray for edges
  rect(-20, -14, 1, 28);          // Left panel left edge
  rect(-11, -14, 1, 28);          // Left panel right edge
  rect(10, -14, 1, 28);           // Right panel left edge
  rect(19, -14, 1, 28);           // Right panel right edge
  
  // ===== TIE FIGHTER CONNECTORS =====
  fill(60, 60, 60);               // Medium gray for struts
  rect(-11, -3, 9, 6, 1);         // Left connector strut
  rect(2, -3, 9, 6, 1);           // Right connector strut
  
  // Connector details
  fill(80, 80, 80);               // Lighter gray for highlights
  rect(-10, -2, 7, 1);            // Left connector highlight
  rect(3, -2, 7, 1);              // Right connector highlight
  
  // ===== TIE FIGHTER MAIN COCKPIT =====
  // Main spherical body
  fill(45, 45, 45);               // Very dark gray for main hull
  ellipse(0, 0, 18, 18);          // Main cockpit sphere (larger)
  
  // Hull panel details
  fill(35, 35, 35);               // Even darker for panel lines
  arc(0, 0, 16, 16, 0, PI);       // Upper hemisphere panel
  ellipse(-3, -3, 4, 4);          // Small panel detail
  ellipse(3, 3, 3, 3);            // Another small panel
  
  // ===== TIE FIGHTER VIEWPORT =====
  // Main viewport window
  fill(15, 15, 40);               // Very dark blue-black for window
  ellipse(0, 0, 12, 12);          // Large viewport
  
  // Viewport frame
  stroke(25, 25, 25);             // Dark frame
  strokeWeight(1);
  noFill();
  ellipse(0, 0, 12, 12);
  noStroke();
  
  // Viewport reflection and details
  fill(80, 80, 120, 150);         // Blue reflection
  ellipse(-3, -3, 5, 5);          // Main reflection
  fill(120, 120, 180, 100);       // Lighter blue
  ellipse(-4, -4, 2, 2);          // Bright reflection spot
  
  // Crosshair/targeting system in viewport
  stroke(100, 0, 0);              // Red targeting system
  strokeWeight(0.5);
  line(-2, 0, 2, 0);              // Horizontal crosshair
  line(0, -2, 0, 2);              // Vertical crosshair
  noStroke();
  
  // ===== ENGINE GLOW (if moving) =====
  if (enemy.speed > 1) {          // Only show glow if moving fast
    fill(0, 100, 255, 100);       // Blue engine glow
    ellipse(0, 8, 6, 4);          // Engine glow effect
    fill(100, 150, 255, 80);      // Lighter blue center
    ellipse(0, 8, 3, 2);          // Engine core
  }
  
  // ===== WEAPON HARDPOINTS =====
  fill(80, 80, 80);               // Gray for weapon mounts
  ellipse(-6, 0, 2, 2);           // Left weapon mount
  ellipse(6, 0, 2, 2);            // Right weapon mount
  
  // ===== HEALTH BAR =====
  let healthPercent = enemy.hp / enemy.maxHp;
  
  // Health bar background
  fill(30, 30, 30);
  rect(0, -22, 28, 4, 1);
  
  // Health bar border
  stroke(60, 60, 60);
  strokeWeight(0.5);
  noFill();
  rect(0, -22, 28, 4, 1);
  noStroke();
  
  // Health bar fill with Imperial red theme
  if (healthPercent > 0.6) fill(0, 200, 0);        // Green
  else if (healthPercent > 0.3) fill(255, 150, 0); // Orange  
  else fill(255, 50, 50);                          // Imperial red
  
  rect(-14 + (28 * healthPercent / 2), -22, 28 * healthPercent, 4, 1);
  
  pop();
}

// Update enemy positions
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    let currentTime = millis();
    
    // Move enemy
    enemy.x += cos(enemy.direction) * enemy.speed;
    enemy.y += sin(enemy.direction) * enemy.speed;
    
    // Bounce off screen edges
    if (enemy.x < 0 || enemy.x > width) {
      enemy.direction = PI - enemy.direction;
    }
    if (enemy.y < 0 || enemy.y > height/2) {
      enemy.direction = -enemy.direction;
    }
    
    // Keep enemies in bounds
    enemy.x = constrain(enemy.x, 0, width);
    enemy.y = constrain(enemy.y, 0, height/2);
    
    // Enemy firing logic
    if (currentTime - enemy.lastFireTime >= enemy.fireRate) {
      // Calculate angle to player
      let angleToPlayer = atan2(ship.y - enemy.y, ship.x - enemy.x);
      
      // Fire bullet toward player
      enemyBullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: cos(angleToPlayer) * 3,  // Bullet velocity X
        vy: sin(angleToPlayer) * 3   // Bullet velocity Y
      });
      
      enemy.lastFireTime = currentTime;
    }
    
    // Remove destroyed enemies
    if (enemy.hp <= 0) {
      // Create explosion effect
      createExplosion(enemy.x, enemy.y);
      
      // Play TIE fighter explosion sound
      playExplosionSound();
      
      enemies.splice(i, 1);
      
      // Increment defeated counter
      enemiesDefeated++;
      
      // Check if Death Star should spawn
      if (enemiesDefeated >= 20 && !deathStarSpawned) { // Spawn Death Star after 50 enemies defeated for longer gameplay
        spawnDeathStar();
        deathStarSpawned = true;
        alert("ALERT! ALERT! DEATH STAR DETECTED!!!");
        alert("DEATH STAR APPROACHING! MASSIVE IMPERIAL BATTLESTATION DETECTED!");
      } else if (!deathStarSpawned) {
        // Spawn new enemy to replace destroyed one (only if Death Star hasn't spawned)
        enemies.push({
          x: random(50, width - 50),
          y: random(50, 200),
          hp: 50,
          maxHp: 50,
          w: 30,
          h: 15,
          speed: random(0.5, 2),
          direction: random(0, TWO_PI),
          lastFireTime: 0,
          fireRate: random(1500, 3000)
        });
      }
    }
  }
}

// Create simple explosion effect
function createExplosion(x, y) {
  // Create a new explosion object with particles and animation
  let explosion = {
    x: x,
    y: y,
    startTime: millis(),
    duration: 1000,          // Explosion lasts 1 second
    particles: []
  };
  
  // Create multiple particles for the explosion
  for (let i = 0; i < 15; i++) {
    explosion.particles.push({
      x: x + random(-5, 5),
      y: y + random(-5, 5),
      vx: random(-3, 3),     // Velocity X
      vy: random(-3, 3),     // Velocity Y
      size: random(3, 8),
      life: 1.0              // Life from 1.0 to 0.0
    });
  }
  
  explosions.push(explosion);
}

// Update and draw all active explosions
function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    let explosion = explosions[i];
    let currentTime = millis();
    let elapsed = currentTime - explosion.startTime;
    let progress = elapsed / explosion.duration;
    
    // Remove explosion if it's finished
    if (progress >= 1.0) {
      explosions.splice(i, 1);
      continue;
    }
    
    // Update particles
    for (let particle of explosion.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;         // Slow down particles
      particle.vy *= 0.98;
      particle.life = 1.0 - progress; // Fade out over time
    }
    
    // Draw explosion
    drawExplosion(explosion, progress);
  }
}

// Draw a single explosion with particles
function drawExplosion(explosion, progress) {
  push();
  
  // Check if this is a Death Star explosion for ABSOLUTELY COLOSSAL scaling
  let isDeathStar = explosion.isDeathStar || false;
  let sizeMultiplier = isDeathStar ? 10 : 1;  // Death Star explosions are 10x bigger now!
  
  // Main explosion blast (gets bigger then smaller)
  let blastSize = (60 * sizeMultiplier) * sin(progress * PI); // Sine wave for realistic expansion/contraction
  let alpha = (1.0 - progress) * 255;
  
  // For Death Star, add insane screen shake effect with multiple massive rings
  if (isDeathStar) {
    // Extreme screen shake effect - draw multiple offset rings
    for (let shake = 0; shake < 6; shake++) {
      let shakeX = random(-12, 12);
      let shakeY = random(-12, 12);
      
      // Absolutely massive outer blast ring
      fill(255, 50, 0, alpha * 0.2);
      ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 4, blastSize * 4);
      
      // Huge middle ring
      fill(255, 100, 0, alpha * 0.3);
      ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 3, blastSize * 3);
      
      // Large inner ring
      fill(255, 150, 0, alpha * 0.4);
      ellipse(explosion.x + shakeX, explosion.y + shakeY, blastSize * 2.5, blastSize * 2.5);
    }
  }
  
  // Outer blast ring
  fill(255, 100, 0, alpha * 0.6);
  ellipse(explosion.x, explosion.y, blastSize * 1.5, blastSize * 1.5);
  
  // Middle blast
  fill(255, 150, 0, alpha * 0.8);
  ellipse(explosion.x, explosion.y, blastSize, blastSize);
  
  // Inner core
  fill(255, 255, 200, alpha);
  ellipse(explosion.x, explosion.y, blastSize * 0.5, blastSize * 0.5);
  
  // Bright white core for Death Star - make it even more intense
  if (isDeathStar && progress < 0.4) {
    fill(255, 255, 255, alpha * 1.2);
    ellipse(explosion.x, explosion.y, blastSize * 1.2, blastSize * 1.2);
    
    // Add an ultra-bright inner core
    fill(255, 255, 255, alpha * 1.5);
    ellipse(explosion.x, explosion.y, blastSize * 0.6, blastSize * 0.6);
  }
  
  // Draw particles
  for (let particle of explosion.particles) {
    let particleAlpha = particle.life * 255;
    let particleSize = particle.size * particle.life;
    
    // Death Star particles are much bigger and way brighter
    if (isDeathStar) {
      particleSize *= 2.5;  // Even bigger particles
      particleAlpha = Math.min(255, particleAlpha * 1.8);  // Much brighter
    }
    
    // Shield impact particles are blue and electric
    if (particle.isShieldImpact) {
      fill(100, 200, 255, particleAlpha); // Blue for shield impacts
    } else if (particle.life > 0.7) {
      fill(255, 255, 255, particleAlpha); // White hot
    } else if (particle.life > 0.4) {
      fill(255, 200, 0, particleAlpha);   // Yellow
    } else {
      fill(255, 100, 0, particleAlpha);   // Red/orange
    }
    
    ellipse(particle.x, particle.y, particleSize, particleSize);
    
    // Add enhanced particle trails for Death Star explosion
    if (isDeathStar && particle.life > 0.3) {
      // Draw multiple trail segments for more dramatic effect
      fill(255, 150, 50, particleAlpha * 0.6);
      ellipse(particle.x - particle.vx, particle.y - particle.vy, particleSize * 0.8, particleSize * 0.8);
      
      fill(255, 100, 25, particleAlpha * 0.4);
      ellipse(particle.x - particle.vx * 2, particle.y - particle.vy * 2, particleSize * 0.6, particleSize * 0.6);
      
      fill(255, 50, 0, particleAlpha * 0.2);
      ellipse(particle.x - particle.vx * 3, particle.y - particle.vy * 3, particleSize * 0.4, particleSize * 0.4);
    }
  }
  
  pop();
}

// ===== DEATH STAR FUNCTIONS =====
// Spawn the Death Star boss
function spawnDeathStar() {
  deathStar = {
    x: width / 2,                    // Center of screen
    y: 100,                          // Upper area
    hp: 15000,                        // Massive health
    maxHp: 15000,                     // Maximum health
    size: 120,                       // Large size
    lastLaserTime: 0,                // For super laser cooldown
    laserCooldown: 5000,             // 5 second cooldown for super laser
    lastSpawnTime: 0,                // For spawning enemies
    spawnCooldown: 3000,             // 3 second cooldown for spawning
    lastGunTime: 0,                  // For defensive gun cooldown
    gunCooldown: 50                   // 50ms = 20 bullets per second
  };
}

// Draw Death Star
function drawDeathStar() {
  if (!deathStar) return;
  
  push();
  translate(deathStar.x, deathStar.y);
  
  // ===== DEATH STAR MAIN SPHERE =====
  fill(100, 100, 100);             // Gray base
  ellipse(0, 0, deathStar.size, deathStar.size);
  
  // Surface details
  fill(80, 80, 80);                // Darker gray for trenches
  arc(0, 0, deathStar.size - 10, deathStar.size - 10, 0, PI); // Upper hemisphere trench
  
  // Superlaser dish
  fill(60, 60, 60);                // Dark gray for dish
  ellipse(-15, -10, 25, 25);       // Superlaser dish
  fill(255, 0, 0);                 // Red for laser focus
  ellipse(-15, -10, 8, 8);         // Laser focus point
  
  // Surface details and panels
  fill(90, 90, 90);
  rect(-30, -5, 15, 3);            // Panel detail 1
  rect(10, 15, 20, 2);             // Panel detail 2
  rect(-5, 25, 10, 3);             // Panel detail 3
  
  // ===== DEATH STAR HEALTH BAR =====
  let healthPercent = deathStar.hp / deathStar.maxHp;
  
  // Health bar background (larger for boss)
  fill(50, 50, 50);
  rect(0, -80, 100, 8);
  
  // Health bar fill
  if (healthPercent > 0.6) fill(0, 255, 0);      // Green
  else if (healthPercent > 0.3) fill(255, 255, 0); // Yellow
  else fill(255, 0, 0);                           // Red
  
  rect(-50 + (100 * healthPercent / 2), -80, 100 * healthPercent, 8);
  
  // Boss label
  fill(255, 255, 255);
  textAlign(CENTER);
  textSize(12);
  text("DEATH STAR", 0, -95);
  
  pop();
}

// Update Death Star behavior
function updateDeathStar() {
  if (!deathStar) return;
  
  let currentTime = millis();
  
  // Death Star movement (slow side-to-side)
  deathStar.x += sin(currentTime * 0.001) * 0.5;
  deathStar.x = constrain(deathStar.x, deathStar.size/2, width - deathStar.size/2);
  
  // Spawn TIE fighters
  if (currentTime - deathStar.lastSpawnTime >= deathStar.spawnCooldown) {
    if (enemies.length < 8) { // Maximum 8 enemies when Death Star is active
      enemies.push({
        x: deathStar.x + random(-50, 50),
        y: deathStar.y + 80,
        hp: 100, // Increased health for Death Star TIEs 4 balanced gameplay
        maxHp: 100,
        w: 30,
        h: 15,
        speed: random(1, 3),
        direction: random(0, TWO_PI),
        lastFireTime: 0,
        fireRate: random(1200, 2500)  // Slightly faster firing when Death Star is active
      });
      deathStar.lastSpawnTime = currentTime;
    }
  }
  
  // Super laser attack
  if (currentTime - deathStar.lastLaserTime >= deathStar.laserCooldown) {
    fireSuperLaser();
    deathStar.lastLaserTime = currentTime;
  }
  
  // Defensive guns firing
  if (currentTime - deathStar.lastGunTime >= deathStar.gunCooldown) {
    // Calculate angle to player
    let angleToPlayer = atan2(ship.y - deathStar.y, ship.x - deathStar.x);
    
    // Fire bullet toward player from Death Star
    deathStarBullets.push({
      x: deathStar.x,
      y: deathStar.y,
      vx: cos(angleToPlayer) * 4,  // Slightly faster than enemy bullets
      vy: sin(angleToPlayer) * 4
    });
    
    deathStar.lastGunTime = currentTime;
  }
  
  // Check if Death Star is destroyed
  if (deathStar.hp <= 0) {
    // Epic explosion
    createMassiveExplosion(deathStar.x, deathStar.y);
  
    deathStar = null;
    //alert("DEATH STAR DESTROYED! THE EMPIRE HAS BEEN DEFEATED!");
  }
}

// Fire Death Star super laser
function fireSuperLaser() {
  if (!deathStar) return;
  
  // Create massive laser beam
  push();
  stroke(255, 0, 0);               // Red laser
  strokeWeight(15);                // Very thick beam
  line(deathStar.x - 15, deathStar.y - 10, ship.x, ship.y); // Aim at player
  
  // Laser glow effect
  stroke(255, 100, 100, 150);
  strokeWeight(25);
  line(deathStar.x - 15, deathStar.y - 10, ship.x, ship.y);
  
  noStroke();
  pop();
  
  // Check if laser hits player (simplified - just check if player is in general area)
  let laserDistance = dist(deathStar.x - 15, deathStar.y - 10, ship.x, ship.y);
  if (laserDistance < 300) { // If player is close to the laser path
    // Only damage player if shield is not active
    if (!shieldActive) {
      // Deal massive damage from Death Star super laser
      ship.hp -= 20;
      
      // Check if player is destroyed
      if (ship.hp <= 0) {
        alert("GAME OVER! You were vaporized by the Death Star's super laser!");
        // Reset the game
        ship.hp = ship.maxHp;
        ship.x = width / 2;
        ship.y = height - 100;
        enemies = [];
        enemyBullets = [];
        deathStarBullets = [];
        deathStar = null;
        deathStarSpawned = false;
        enemiesDefeated = 0;
        spawnEnemies();
      }
    } else {
      // Shield absorbed the super laser hit - create massive shield impact
      for (let i = 0; i < 20; i++) {
        createShieldImpact(ship.x + random(-30, 30), ship.y + random(-30, 30));
      }
    }
    
    // Visual warning or damage indicator
    push();
    fill(255, 0, 0, 100);
    ellipse(ship.x, ship.y, 60, 60); // Red danger indicator
    pop();
  }
  
  // Play dramatic sound (you could add this)
  playIonSound(); // Reuse ion sound for now, could make new super laser sound
}

// Create ABSOLUTELY GIGANTIC explosion for Death Star - THE BIGGEST EXPLOSION EVER!
function createMassiveExplosion(x, y) {
  // Play the epic Death Star explosion sound immediately
  playDeathStarExplosionSound();
  
  // Create the main COLOSSAL explosion wave
  let explosion = {
    x: x,
    y: y,
    startTime: millis(),
    duration: 8000,          // Death Star explosion lasts a full 8 seconds now!
    particles: [],
    isDeathStar: true        // Special flag for Death Star explosions
  };
  screenShake = 100; // Set extreme screen shake for Death Star explosion
  // Create INSANELY MASSIVE amounts of particles for the most epic explosion ever
  for (let i = 0; i < 750; i++) {  // 750 particles for absolutely insane scale!
    explosion.particles.push({
      x: x + random(-100, 100),    // Even wider initial spread
      y: y + random(-100, 100),
      vx: random(-25, 25),         // Much faster velocities for bigger spread
      vy: random(-25, 25),
      size: random(10, 25),        // Absolutely enormous particles
      life: 1.0
    });
  }
  
  explosions.push(explosion);
  
  // Create multiple explosion rings at different times - EVEN MORE WAVES!
  // First wave - immediate (massive)
  for (let i = 0; i < 20; i++) {
    createExplosion(x + random(-200, 200), y + random(-200, 200));
  }
  
  // Second wave - 100ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 25; i++) {
        createExplosion(x + random(-300, 300), y + random(-300, 300));
      }
    }
  }, 100);
  
  // Third wave - 250ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 30; i++) {
        createExplosion(x + random(-450, 450), y + random(-450, 450));
      }
    }
  }, 250);
  
  // Fourth wave - 450ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 35; i++) {
        createExplosion(x + random(-600, 600), y + random(-600, 600));
      }
    }
  }, 450);
  
  // Fifth wave - 700ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 40; i++) {
        createExplosion(x + random(-750, 750), y + random(-750, 750));
      }
    }
  }, 700);
  
  // Sixth wave - 1000ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 45; i++) {
        createExplosion(x + random(-900, 900), y + random(-900, 900));
      }
    }
  }, 1000);
  
  // Seventh wave - 1400ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 50; i++) {
        createExplosion(x + random(-1050, 1050), y + random(-1050, 1050));
      }
    }
  }, 1400);
  
  // Eighth wave - 1900ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 55; i++) {
        createExplosion(x + random(-1200, 1200), y + random(-1200, 1200));
      }
    }
  }, 1900);
  
  // Final massive wave - 2800ms later
  setTimeout(() => {
    if (explosions.length > 0) {
      for (let i = 0; i < 60; i++) {
        createExplosion(x + random(-1400, 1400), y + random(-1400, 1400));
      }
    }
  }, 2800);
}

// Check collisions between bullets and enemies
function checkBulletCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      
      // Check if bullet hits enemy
      if (dist(bullet.x, bullet.y, enemy.x, enemy.y) < 20) {
        // Damage enemy
        enemy.hp -= bulletDamage;
        
        // Remove bullet
        bullets.splice(i, 1);
        break; // Exit inner loop since bullet is gone
      }
    }
    
    // Check if bullet hits Death Star (if not already removed)
    if (bullets[i] && deathStar && dist(bullet.x, bullet.y, deathStar.x, deathStar.y) < deathStar.size/2) {
      deathStar.hp -= bulletDamage;
      bullets.splice(i, 1);
    }
  }
}

// Check collisions between ion shots and enemies
function checkIonCollisions() {
  for (let i = ionShots.length - 1; i >= 0; i--) {
    let ion = ionShots[i];
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      
      // Check if ion beam hits enemy (wider collision area)
      if (abs(ion.x - enemy.x) < 30 && enemy.y > ion.y - ionRayLength && enemy.y < ion.y) {
        // Damage enemy
        enemy.hp -= ionDamage;
      }
    }
    
    // Check if ion beam hits Death Star
    if (deathStar && abs(ion.x - deathStar.x) < deathStar.size/2 && 
        deathStar.y > ion.y - ionRayLength && deathStar.y < ion.y) {
      deathStar.hp -= ionDamage;
    }
  }
}

// Update and draw enemy bullets
function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let bullet = enemyBullets[i];
    
    // Move bullet
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Remove bullets that go off screen
    if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (dist(bullet.x, bullet.y, ship.x, ship.y) < 20) {
      // Remove bullet
      enemyBullets.splice(i, 1);
      
      // Only damage player if shield is not active
      if (!shieldActive) {
        // Damage player
        ship.hp -= 10;  // Enemy bullets do 10 damage
        
        // Check if player is destroyed
        if (ship.hp <= 0) {
          alert("GAME OVER! Your X-wing has been destroyed!");
          // Reset the game
          ship.hp = ship.maxHp;
          ship.x = width / 2;
          ship.y = height - 100;
          enemies = [];
          enemyBullets = [];
          deathStarBullets = [];
          deathStar = null;
          deathStarSpawned = false;
          enemiesDefeated = 0;
          spawnEnemies();
        }
      } else {
        // Shield absorbed the hit - create shield impact effect
        createShieldImpact(bullet.x, bullet.y);
      }
      continue;
    }
    
    // Draw enemy bullet
    fill(255, 0, 0);  // Red color for enemy bullets
    ellipse(bullet.x, bullet.y, 4, 6);
  }
}

// Update and draw Death Star bullets
function updateDeathStarBullets() {
  for (let i = deathStarBullets.length - 1; i >= 0; i--) {
    let bullet = deathStarBullets[i];
    
    // Move bullet
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Remove bullets that go off screen
    if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
      deathStarBullets.splice(i, 1);
      continue;
    }
    
    // Check collision with player
    if (dist(bullet.x, bullet.y, ship.x, ship.y) < 20) {
      // Remove bullet
      deathStarBullets.splice(i, 1);
      
      // Only damage player if shield is not active
      if (!shieldActive) {
        // Damage player
        ship.hp -= 2;  // Death Star bullets do 2 damage
        
        // Check if player is destroyed
        if (ship.hp <= 0) {
          alert("GAME OVER! Your X-wing has been destroyed by the Death Star!");
          // Reset the game
          ship.hp = ship.maxHp;
          ship.x = width / 2;
          ship.y = height - 100;
          enemies = [];
          enemyBullets = [];
          deathStarBullets = [];
          deathStar = null;
          deathStarSpawned = false;
          enemiesDefeated = 0;
          spawnEnemies();
        }
      } else {
        // Shield absorbed the hit - create shield impact effect
        createShieldImpact(bullet.x, bullet.y);
      }
      continue;
    }
    
    // Draw Death Star bullet (larger and more dangerous looking)
    fill(255, 50, 50);  // Bright red for Death Star bullets
    ellipse(bullet.x, bullet.y, 6, 8);
    
    // Add glow effect for Death Star bullets
    fill(255, 100, 100, 100);
    ellipse(bullet.x, bullet.y, 10, 12);
  }
}

// Draw player health bar
function drawPlayerHealthBar() {
  let healthPercent = ship.hp / ship.maxHp;
  
  // Health bar background
  fill(50, 50, 50);
  rect(10, height - 30, 200, 15);
  
  // Health bar border
  stroke(100, 100, 100);
  strokeWeight(2);
  noFill();
  rect(10, height - 30, 200, 15);
  noStroke();
  
  // Health bar fill
  if (healthPercent > 0.6) fill(0, 255, 0);      // Green
  else if (healthPercent > 0.3) fill(255, 255, 0); // Yellow
  else fill(255, 0, 0);                           // Red
  
  rect(10, height - 30, 200 * healthPercent, 15);
  
  // Health text
  fill(255, 255, 255);
  textAlign(LEFT);
  textSize(12);
  text(`HP: ${ship.hp}/${ship.maxHp}`, 15, height - 18);
}

// ===== SHIELD SYSTEM FUNCTIONS =====

// Update shield system
function updateShield() {
  let currentTime = millis();
  
  // Check if shield should deactivate
  if (shieldActive && currentTime - shieldStartTime >= shieldDuration) {
    shieldActive = false;
  }
}

// Draw energy shield around ship
function drawShield() {
  if (!shieldActive) return;
  
  push();
  
  // Calculate shield pulse effect
  let currentTime = millis();
  let elapsed = currentTime - shieldStartTime;
  let pulse = sin(elapsed * 0.01) * 0.3 + 0.7; // Pulsing between 0.4 and 1.0
  
  // Shield bubble effect
  stroke(100, 200, 255, 150 * pulse);  // Blue shield with pulsing alpha
  strokeWeight(3);
  fill(100, 200, 255, 30 * pulse);     // Very transparent blue fill
  
  // Main shield bubble
  ellipse(ship.x, ship.y, 60, 60);
  
  // Secondary outer ring
  stroke(150, 220, 255, 100 * pulse);
  strokeWeight(1);
  noFill();
  ellipse(ship.x, ship.y, 70, 70);
  
  // Inner energy ring
  stroke(200, 240, 255, 200 * pulse);
  strokeWeight(2);
  ellipse(ship.x, ship.y, 50, 50);
  
  noStroke();
  pop();
}

// Create shield impact effect when bullet hits shield
function createShieldImpact(x, y) {
  // Create small explosion-like effect for shield impact
  for (let i = 0; i < 8; i++) {
    explosions.push({
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      startTime: millis(),
      duration: 300,  // Short duration
      particles: [{
        x: x + random(-5, 5),
        y: y + random(-5, 5),
        vx: random(-2, 2),
        vy: random(-2, 2),
        size: random(2, 5),
        life: 1.0,
        isShieldImpact: true  // Special flag for shield impacts
      }]
    });
  }
}

// Draw shield status UI
function drawShieldUI() {
  let currentTime = millis();
  let timeSinceLastShield = currentTime - lastShieldTime;
  let shieldReady = timeSinceLastShield >= shieldCooldown;
  
  push();
  
  // Shield status box
  fill(0, 0, 0, 150);
  rect(10, height - 70, 150, 35);
  
  // Border
  stroke(100, 100, 100);
  strokeWeight(1);
  noFill();
  rect(10, height - 70, 150, 35);
  noStroke();
  
  // Shield status text
  fill(255, 255, 255);
  textAlign(LEFT);
  textSize(10);
  
  if (shieldActive) {
    let timeLeft = shieldDuration - (currentTime - shieldStartTime);
    fill(100, 200, 255);
    text("SHIELD ACTIVE", 15, height - 55);
    text(`Time: ${Math.ceil(timeLeft/1000)}s`, 15, height - 45);
  } else if (shieldReady) {
    fill(0, 255, 0);
    text("SHIELD READY", 15, height - 55);
    text("Press X to activate", 15, height - 45);
  } else {
    let cooldownLeft = shieldCooldown - timeSinceLastShield;
    fill(255, 100, 100);
    text("SHIELD COOLDOWN", 15, height - 55);
    text(`${Math.ceil(cooldownLeft/1000)}s remaining`, 15, height - 45);
  }
  
  pop();
}

// ===== MAIN DRAW LOOP =====
// This runs continuously (60 times per second by default)
function draw() {
  // Clear screen with dark blue space background
  background(10, 10, 30);
  
if (screenShake > 0) {
  translate(random(-10,-10), random(-10,-10)); // Apply random translation for screen shake
screenShake -= 1; // Decrease screen shake intensity
}
  // ===== DRAW STARS =====
  noStroke();                    // No outline for stars
  fill(255, 255, 200);          // Light yellow color for stars
  for (let s of stars) {
    ellipse(s.x, s.y, s.r, s.r); // Draw each star as a small circle
  }

  // ===== DRAW SHIP =====
  drawShip(ship.x, ship.y);     // Call function to draw ship at current position

  // ===== DRAW SHIELD =====
  drawShield();                  // Draw energy shield if active

  // ===== UPDATE SHIELD SYSTEM =====
  updateShield();                // Update shield timing

  // ===== DRAW AND UPDATE ENEMIES =====
  updateEnemies();               // Update enemy positions and behavior
  for (let enemy of enemies) {
    drawEnemy(enemy);            // Draw each enemy ship
  }
  
  // ===== DRAW AND UPDATE DEATH STAR =====
  if (deathStar) {
    updateDeathStar();           // Update Death Star behavior
    drawDeathStar();             // Draw Death Star
  }

  // ===== UPDATE AND DRAW EXPLOSIONS =====
  updateExplosions();            // Update and draw all active explosions

  // ===== UPDATE AND DRAW ENEMY BULLETS =====
  updateEnemyBullets();          // Update and draw enemy bullets

  // ===== UPDATE AND DRAW DEATH STAR BULLETS =====
  if (deathStar) {
    updateDeathStarBullets();    // Update and draw Death Star bullets
  }

  // ===== UPDATE AND DRAW REGULAR BULLETS =====
  for (let i = bullets.length - 1; i >= 0; i--) {  // Loop backwards to safely remove items
    let b = bullets[i];          // Get current bullet
    fill(255, 200, 100);         // Orange color for bullets
    ellipse(b.x, b.y, 5, 10);    // Draw bullet as small oval
    b.y -= 7;                    // Move bullet upward by 7 pixels
    if (b.y < 0) {              // If bullet goes off top of screen
      bullets.splice(i, 1);      // Remove it from array
    }
  }

  // ===== UPDATE AND DRAW ION CANNON SHOTS =====
  for (let i = ionShots.length - 1; i >= 0; i--) {  // Loop backwards to safely remove items
    let ion = ionShots[i];       // Get current ion shot
    
    // Draw ion beam effect with two layers for glow
    stroke(100, 255, 255);       // Cyan color for outer glow
    strokeWeight(6);             // Thick line for outer beam
    line(ion.x, ion.y, ion.x, ion.y - ionRayLength);  // Draw beam line using variable length
    stroke(200, 255, 255);       // Brighter cyan for inner beam
    strokeWeight(3);             // Thinner line for inner beam
    line(ion.x, ion.y, ion.x, ion.y - ionRayLength);  // Draw inner beam using variable length
    noStroke();                  // Turn off stroke for other shapes
    
    // Draw glowing core of ion shot
    fill(200, 255, 255, 200);    // Semi-transparent cyan
    ellipse(ion.x, ion.y, 8, 8); // Outer glow circle
    fill(255);                   // White center
    ellipse(ion.x, ion.y, 4, 4); // Inner bright core

    ion.y -= 20;                 // Move ion shot upward by 20 pixels (faster than bullets)
    if (ion.y < -30) {           // If ion shot goes off screen
      ionShots.splice(i, 1);     // Remove it from array
    }
  }

  // ===== UPDATE AND DRAW EXPLOSIONS =====
  updateExplosions();            // Update and draw all active explosions

  // ===== CHECK COLLISIONS =====
  checkBulletCollisions();       // Check if bullets hit enemies
  checkIonCollisions();          // Check if ion beams hit enemies

  // ===== DRAW PLAYER HEALTH BAR =====
  drawPlayerHealthBar();         // Draw player health bar

  // ===== DRAW SHIELD UI =====
  drawShieldUI();                // Draw shield status

  // ===== HANDLE PLAYER INPUT =====
  handleInput();                 // Check for arrow key presses and move ship
}

// ===== SHIP DRAWING FUNCTION =====
// This function draws the X-wing starship at the given coordinates
function drawShip(x, y) {
  // ===== MAIN BODY =====
  fill(200, 200, 200);           // Light gray color
  rectMode(CENTER);              // Draw rectangles from center point
  rect(x, y, ship.w, ship.h - 5, 4);  // Main fuselage with rounded corners
  
  // ===== COCKPIT =====
  fill(50, 50, 80);              // Dark blue-gray for cockpit frame
  ellipse(x, y - 8, 18, 12);     // Outer cockpit window
  fill(100, 150, 255);           // Blue tint for cockpit glass
  ellipse(x, y - 8, 12, 8);      // Inner cockpit window
  
  // ===== ENGINE GLOW EFFECTS =====
  fill(255, 100, 100, 180);      // Red with transparency for engine glow
  ellipse(x - 8, y + 12, 6, 8);  // Left engine glow
  ellipse(x + 8, y + 12, 6, 8);  // Right engine glow
  fill(255, 200, 100);           // Bright orange for engine cores
  ellipse(x - 8, y + 12, 3, 5);  // Left engine core
  ellipse(x + 8, y + 12, 3, 5);  // Right engine core
  
  // ===== X-WING STYLE WINGS =====
  fill(180, 180, 180);           // Medium gray for wings
  // Upper wing pair
  rect(x - 25, y - 8, 15, 4);    // Left upper wing
  rect(x + 25, y - 8, 15, 4);    // Right upper wing
  // Lower wing pair
  rect(x - 25, y + 8, 15, 4);    // Left lower wing
  rect(x + 25, y + 8, 15, 4);    // Right lower wing
  
  // ===== LASER CANNONS ON WING TIPS =====
  fill(100, 100, 100);           // Dark gray for cannon tips
  ellipse(x - 32, y - 8, 4, 4);  // Left upper cannon
  ellipse(x + 32, y - 8, 4, 4);  // Right upper cannon
  ellipse(x - 32, y + 8, 4, 4);  // Left lower cannon
  ellipse(x + 32, y + 8, 4, 4);  // Right lower cannon
  
  // ===== ION CANNON (CENTER MOUNTED) =====
  fill(150, 150, 200);           // Purple-gray for ion cannon barrel
  rect(x, y - 15, 6, 10);        // Ion cannon barrel
  fill(100, 255, 255);           // Cyan for ion cannon tip
  ellipse(x, y - 20, 4, 4);      // Ion cannon muzzle
}

// ===== INPUT HANDLING FUNCTION =====
// This function updates the ship to follow the mouse
function handleInput() {
  // Make ship follow mouse with smooth movement
  let targetX = mouseX;
  let targetY = mouseY;
  
  // Calculate distance to mouse
  let dx = targetX - ship.x;
  let dy = targetY - ship.y;
  
  // Smooth movement toward mouse (lerp for smooth following)
  ship.x += dx * 0.1;  // 10% of the distance each frame
  ship.y += dy * 0.1;
  
  // Alternative: Direct following (comment out the lerp above and uncomment below for instant following)
  // ship.x = mouseX;
  // ship.y = mouseY;
  
  // SPACEBAR: Continuous machine gun fire while held down
  if (keyIsDown(32)) {           // 32 is the keyCode for spacebar
    let currentTime = millis();  // Get current time in milliseconds
    
    // Check if enough time has passed since last bullet
    if (currentTime - lastBulletTime >= bulletFireRate) {
      // Fire bullets from all four wing-tip cannons
      bullets.push({ x: ship.x - 32, y: ship.y - 8 }); // Left upper cannon
      bullets.push({ x: ship.x + 32, y: ship.y - 8 }); // Right upper cannon
      bullets.push({ x: ship.x - 32, y: ship.y + 8 }); // Left lower cannon
      bullets.push({ x: ship.x + 32, y: ship.y + 8 }); // Right lower cannon
      bullets.push({ x: ship.x - 16, y: ship.y - 8 }); // Left upper cannon
      bullets.push({ x: ship.x + 16, y: ship.y - 8 }); // Right upper cannon
      bullets.push({ x: ship.x - 16, y: ship.y + 8 }); // Left lower cannon
      bullets.push({ x: ship.x + 16, y: ship.y + 8 }); // Right lower cannon
// Add more bullets for a more intense fire effect
// you feel strong, strength = confidence
      // Play machine gun sound effect
      playBulletSound();
      
      // Update last bullet time
      lastBulletTime = currentTime;
    }
  }
  
  // Keep ship within screen boundaries
  // constrain() limits values between min and max
  ship.x = constrain(ship.x, ship.w / 2, width - ship.w / 2);    // Horizontal bounds
  ship.y = constrain(ship.y, ship.h / 2, height - ship.h / 2);   // Vertical bounds
}

// ===== KEY PRESS EVENT FUNCTION =====
// This function is called once each time a key is pressed
function keyPressed() {
  // Note: Spacebar firing is now handled in handleInput() for continuous fire
  
  // 'C' KEY: Fire ion cannon from center of ship (with cooldown)
  if (key === 'c' || key === 'C') {
    let currentTime = millis();
    
    // Check if ion cannon is off cooldown
    if (currentTime - lastIonTime >= ionCooldown) {
      // Create ion shot object and add it to ionShots array
      // Ion shot starts from the ion cannon position
      ionShots.push({ x: ship.x, y: ship.y - 20 });
      
      // Play ion cannon "whoomp" sound effect
      playIonSound();
      
      // Update last ion shot time
      lastIonTime = currentTime;
    }
  }
  
  // 'X' KEY: Activate energy shield (with cooldown)
  if (key === 'x' || key === 'X') {
    let currentTime = millis();
    
    // Check if shield is off cooldown and not already active
    if (!shieldActive && currentTime - lastShieldTime >= shieldCooldown) {
      // Activate shield
      shieldActive = true;
      shieldStartTime = currentTime;
      lastShieldTime = currentTime;
      
      // Play shield activation sound (reuse ion sound for now)
      playIonSound();
    }
  }
}
