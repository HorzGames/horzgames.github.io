// Basic player and checkerboard demo
const PLAYER_SIZE = 16;
const PLAYER_SPEED = 300; // pixels per second
const CHECKER_SIZE = 64; // size of checker squares in px
// Default/global sprite scale (used when no per-facing override exists)
const SPRITE_SCALE = 1;
// Per-facing scale overrides. Only front is scaled up significantly.
const bladeScale = {
  front: 3,
  left: 0.1,
  right: 0.1,
  back: 0.1 // scaled down because too big
};

let player;
let bladeImgs = {
  front: null,
  left: null,
  right: null,
  back: null
};                       
// Block assets (filled in preload) and active blocks in the world
let blocksAssets = {};
let blocks = [];
// optional aliases for asset names so user-friendly names map to loaded keys
const BLOCK_ALIASES = {
  'grass_3': 'grass_03',
  'grass_3_block': 'grass_03',
  'desert path': 'desert_path',
  'desert_path_01': 'desert_path',
  'desert steel': 'desert_steel'
};
// Toggle to display hitboxes when pressing H
let showHitboxes = false;
// Current map coordinates
let mapX = 0;
let mapY = 0;
// simple cooldown to avoid immediate re-trigger of doors
let lastMapChangeTime = 0;

// HUD / health bar
const HEALTH_BAR_PIXELS = 100; // each pixel = 1 HP unit
const HEALTH_BAR_HEIGHT = 12; // visual height in px
let maxHP = 200; // max HP for player
let playerHP = 100
let playerHp = playerHP
let healthFrameScale = 2.5; // user requested ~2.5x scale for frame
let healthFrameImg = null;


// --- Enemy system globals ---
const ENEMY_DEFS = {};
const BEHAVIORS = {};
let enemies = [];
const MAX_ENEMIES_PER_MAP = 8;

function playerHpforbar() {
if(playerHp>100){
    let playerHpoverflow = playerHp - 100;
    return playerHpoverflow
} else {return playerHp}
    
}
class Player {
  constructor(x, y, size = PLAYER_SIZE, speed = PLAYER_SPEED) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.facing = 'front';
    this.sprite = null;
  }

  update(dt) {
    // dt is seconds
    let vx = 0;
    let vy = 0;

    // WASD
    if (keyIsDown(65)) vx -= 1; // A
    if (keyIsDown(68)) vx += 1; // D
    if (keyIsDown(87)) vy -= 1; // W
    if (keyIsDown(83)) vy += 1; // S

    // Arrow keys
    if (keyIsDown(LEFT_ARROW)) vx -= 1;
    if (keyIsDown(RIGHT_ARROW)) vx += 1;
    if (keyIsDown(UP_ARROW)) vy -= 1;
    if (keyIsDown(DOWN_ARROW)) vy += 1;

    // Normalize diagonal movement
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx /= len;
      vy /= len;
    }

    // compute movement from input (applied below with collision checks)

      // update facing when moving
      if (vx !== 0 || vy !== 0) {
        if (Math.abs(vx) > Math.abs(vy)) {
          this.facing = vx > 0 ? 'right' : 'left';
        } else {
          this.facing = vy > 0 ? 'front' : 'back';
        }
        // update sprite reference if available
        if (bladeImgs[this.facing]) this.sprite = bladeImgs[this.facing];
      }

      // Axis-separated collision: attempt X then Y
      const half = this.getHalfSize();
      const attemptX = this.x + vx * this.speed * dt;
      const attemptY = this.y; // x attempt only
      if (!isCollidingWithBlocks(attemptX, attemptY, half.w * 2, half.h * 2)) {
        this.x = attemptX;
      }

      const attemptX2 = this.x; // updated x
      const attemptY2 = this.y + vy * this.speed * dt;
      if (!isCollidingWithBlocks(attemptX2, attemptY2, half.w * 2, half.h * 2)) {
        this.y = attemptY2;
      }

      this.clampToCanvas();
  }

  clampToCanvas() {
    // treat x,y as center; compute half extents
    const half = this.getHalfSize();
    this.x = Math.max(half.w, Math.min(this.x, width - half.w));
    this.y = Math.max(half.h, Math.min(this.y, height - half.h));
  }

  getScaledSpriteSize() {
    if (this.sprite) {
      const face = this.facing || 'front';
      const scale = (bladeScale[face] !== undefined) ? bladeScale[face] : SPRITE_SCALE;
      return {
        w: this.sprite.width * scale,
        h: this.sprite.height * scale
      };
    }
    return { w: this.size, h: this.size };
  }

  getHalfSize() {
    const s = this.getScaledSpriteSize();
    return { w: s.w / 2, h: s.h / 2 };
  }

  draw() {
    push();
    noStroke();
    imageMode(CENTER);
    if (this.sprite) {
      const s = this.getScaledSpriteSize();
      image(this.sprite, this.x, this.y, s.w, s.h);
    } else {
      fill(255, 80, 80);
      rectMode(CENTER);
      rect(this.x, this.y, this.size, this.size, 4);
      rectMode(CORNER);
    }
    imageMode(CORNER);
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // create player with center coordinates
  player = new Player(width / 2, height / 2);
  // if sprites loaded, set default sprite
  if (bladeImgs.front) {
    player.sprite = bladeImgs.front;
    player.facing = 'front';
  }
  
  // create some sample blocks for demo
  blocks.push(new Block(3, 3, 'concrete', true));
  blocks.push(new Block(4, 3, 'concrete', true));
    blocks.push(new Block(3, 2, 'concrete', true));
  blocks.push(new Block(4, 2, 'concrete', true));
    blocks.push(new Block(5, 2, 'concrete', true));
  blocks.push(new Block(4, 3, 'concrete', true));
  blocks.push(new Block(5, 3, 'mossy_concrete', true));
  blocks.push(new Block(6, 3, 'mossy_concrete', true));
  blocks.push(new Block(8, 6, 'steel', true));
  // sample door: default to right-facing so it moves the player to mapX+1
  // Right door: leads to mapX + 1 (hallway)
  blocks.push(new Block(10, 6, 'door', false, 0, 0, { doorDir: 'right' }));
  // Left door: leads to mapX - 1
  blocks.push(new Block(2, 6, 'door', false, 0, 0, { doorDir: 'left' }));
  // Up door: leads to mapY + 1
  blocks.push(new Block(6, 1, 'door', false, 0, 0, { doorDir: 'up' }));
  // Down door: leads to mapY - 1
  blocks.push(new Block(6, 10, 'door', false, 0, 0, { doorDir: 'down' }));
  // create a vertical hallway: cobblestone-lined concrete floor
  // hallway parameters
  const hallStartX = 12; // left lining column
  const hallStartY = 2;
  const hallLength = 10; // number of tiles long
  // layout per column: [lining, inner1, inner2, lining]
  for (let j = 0; j < hallLength; j++) {
    const y = hallStartY + j;
    // left lining (cobblestone)
    blocks.push(new Block(hallStartX, y, 'cobblestone', true, 1, 0));
    // inner space (two-wide) - concrete floor
    blocks.push(new Block(hallStartX + 1, y, 'concrete', true, 1, 0));
    blocks.push(new Block(hallStartX + 2, y, 'concrete', true, 1, 0));
    // right lining (cobblestone)
    blocks.push(new Block(hallStartX + 3, y, 'cobblestone', true, 1, 0));
  }

  // --- target map content and return doors ---
  // Map (1,0) - hallway map: add a return door on the left edge (points left)
  blocks.push(new Block(1, 6, 'door', false, 1, 0, { doorDir: 'left' }));
  // Map (-1,0) - room reachable from left door: place a return door pointing right and some bricks
  blocks.push(new Block(14, 6, 'door', false, -1, 0, { doorDir: 'right' }));
  for (let rx = 11; rx <= 15; rx++) {
    for (let ry = 4; ry <= 8; ry++) {
      // frame of a small room
      if (rx === 11 || rx === 15 || ry === 4 || ry === 8) {
        blocks.push(new Block(rx, ry, 'brick', true, -1, 0));
      }
    }
  }

  // Map (0,1) - room above: return door pointing down
  blocks.push(new Block(6, 12, 'door', false, 0, 1, { doorDir: 'down' }));
  for (let rx = 4; rx <= 8; rx++) {
    for (let ry = 9; ry <= 13; ry++) {
      if (rx === 4 || rx === 8 || ry === 9 || ry === 13) {
        blocks.push(new Block(rx, ry, 'concrete', true, 0, 1));
      }
    }
  }

  // Additional door in map (0,1): left-facing demo door
  blocks.push(new Block(2, 11, 'door', false, 0, 1, { doorDir: 'left' }));

  // Map (0,-1) - room below: return door pointing up
  blocks.push(new Block(6, 1, 'door', false, 0, -1, { doorDir: 'up' }));
  for (let rx = 4; rx <= 8; rx++) {
    for (let ry = -1; ry <= 3; ry++) {
      if (rx === 4 || rx === 8 || ry === -1 || ry === 3) {
        blocks.push(new Block(rx, ry, 'mossy_concrete', true, 0, -1));
      }
    }
  }

  // --- Map (-1,1) - demo area for new user-provided assets ---
  // Factory tile floor area (walkable). Position this cluster near the
  // canvas center so it's visible when you move to this map.
  const centerGX = Math.floor((width / 2) / CHECKER_SIZE);
  const centerGY = Math.floor((height / 2) / CHECKER_SIZE);
  const fBaseX = centerGX - 1;
  const fBaseY = centerGY - 1;
  for (let fx = fBaseX; fx < fBaseX + 4; fx++) {
    for (let fy = fBaseY; fy < fBaseY + 4; fy++) {
      blocks.push(new Block(fx, fy, 'factory_tiles', false, -1, 1));
    }
  }
  // Grass area (walkable) using two variants
  for (let gx = fBaseX + 6; gx < fBaseX + 10; gx++) {
    for (let gy = fBaseY; gy < fBaseY + 3; gy++) {
      const t = ((gx + gy) % 2 === 0) ? 'grass_03' : 'grass_04';
      blocks.push(new Block(gx, gy, t, false, -1, 1));
    }
  }
  // Sand patches (walkable)
  for (let sx = fBaseX; sx < fBaseX + 3; sx++) {
    for (let sy = fBaseY + 6; sy < fBaseY + 9; sy++) {
      blocks.push(new Block(sx, sy, 'sand_01', false, -1, 1));
    }
  }
  // Desert steel obstacles (solid)
  blocks.push(new Block(fBaseX + 2, fBaseY + 2, 'desert_steel', true, -1, 1));
  blocks.push(new Block(fBaseX + 3, fBaseY + 6, 'desert_steel', true, -1, 1));

  // Ensure each adjacent chunk has a centered return door back to the origin (0,0)
  // Use the same center grid computed above but place doors in their respective maps
  blocks.push(new Block(centerGX, centerGY, 'door', false, -1, 0, { doorDir: 'right' }));
  blocks.push(new Block(centerGX, centerGY, 'door', false, 0, 1, { doorDir: 'down' }));
  blocks.push(new Block(centerGX, centerGY, 'door', false, 0, -1, { doorDir: 'up' }));

  // --- Map (2,0) - large grass chunk and connecting doors ---
  // Fill a wide area centered on the canvas with grass tiles (walkable)
  const grassW = 12;
  const grassH = 8;
  const gBaseX = centerGX - Math.floor(grassW / 2);
  const gBaseY = centerGY - Math.floor(grassH / 2);
  for (let gx = gBaseX; gx < gBaseX + grassW; gx++) {
    for (let gy = gBaseY; gy < gBaseY + grassH; gy++) {
      const t = ((gx + gy) % 2 === 0) ? 'grass_01' : 'grass_02';
      blocks.push(new Block(gx, gy, t, false, 2, 0));
    }
  }

  // Door in map (1,0) that leads to map (2,0)
  blocks.push(new Block(centerGX + 3, centerGY-6, 'door', false, 1, 0, { doorDir: 'right' }));
  // Return door in map (2,0) that leads back to map (1,0)
  blocks.push(new Block(centerGX + Math.floor(grassW / 2), centerGY, 'door', false, 2, 0, { doorDir: 'left' }));

  noSmooth();
  frameRate(60);

  // Register enemy definitions (data-driven)
  ENEMY_DEFS['goblin'] = { name: 'goblin', behavior: 1, speed: 125, size: 16, scale: 12, spriteKey: 'goblin' };

  // Simple behavior: behavior 1 = random walk within a local radius
  BEHAVIORS[1] = function behavior1_randomWalk(enemy, dt) {
    // if no target, choose one
    if (!enemy.target || enemy.state === 'idle') {
      enemy.chooseRandomTargetInRadius(6);
      enemy.state = 'moving';
      return;
    }
    // move toward target
    enemy.moveTowardsTarget(dt);
  };

  // spawn demo goblin in map (2,0) near the grass chunk center
  // pick center grid from earlier computation
  const spawnGridX = Math.floor((width / 2) / CHECKER_SIZE);
  const spawnGridY = Math.floor((height / 2) / CHECKER_SIZE);
  spawnEnemy('goblin', spawnGridX, spawnGridY, 2, 0);
}

function preload() {
  // load the Blade sprite (file added by the user)
  // path includes space, p5 loadImage supports it
  // load all facing images (file names provided by user)
  // p5's loadImage will queue requests; if a file is missing, p5 reports an error in console
  bladeImgs.front = loadImage('Skins/Blade/Blade Front.png');
  bladeImgs.left = loadImage('Skins/Blade/Blade left.png');
  bladeImgs.right = loadImage('Skins/Blade/Blade right.png');
  bladeImgs.back = loadImage('Skins/Blade/Blade back.png');
  // Load block textures
  // door images: support directional variants if available
  blocksAssets.door = {
    default: loadImage('blocks/Doors/Door.png'),
    up: loadImage('blocks/Doors/door Up.png'),
    down: loadImage('blocks/Doors/door Down.png'),
    left: loadImage('blocks/Doors/door Left.png'),
    right: loadImage('blocks/Doors/Door.png')
  };
  blocksAssets.steel = [loadImage('blocks/steel block/Steel block.png')];
  // desert path and extra grass variant
  blocksAssets.desert_path = loadImage('blocks/Desert/desert path_01.png');
  blocksAssets.grass_03 = loadImage('blocks/Tiles/Grass_03.png');
    // Load additional user-provided assets
    blocksAssets.desert_steel = loadImage('blocks/Desert/Desert Steel.png');
    blocksAssets.sand_01 = loadImage('blocks/Desert/Sand_01.png');
    blocksAssets.factory_tiles = loadImage('blocks/Tiles/Factory Tiles.png');
    blocksAssets.grass_01 = loadImage('blocks/Tiles/Grass_01.png');
    blocksAssets.grass_02 = loadImage('blocks/Tiles/Grass_02.png');
  // concrete variants
  blocksAssets.concrete = [
    loadImage('blocks/concrete/Concrete_01.png'),
    loadImage('blocks/concrete/Concrete_02.png')
  ];
  // mossy concrete variants
  blocksAssets.mossy_concrete = [
    loadImage('blocks/mossy concete/Mossy_Concrete_01.png'),
    loadImage('blocks/mossy concete/Mossy_Concrete_02.png'),
    loadImage('blocks/mossy concete/Mossy_Concrete_03.png')
  ];
  // brick variants (user added)
  blocksAssets.brick = [
    loadImage('blocks/brick/Bricks_01.png'),
    loadImage('blocks/brick/Brick_02.png'),
    loadImage('blocks/brick/Brick_03.png')
  ];
  // cobblestone variants
  blocksAssets.cobblestone = [
    loadImage('blocks/Cobblestone/Cobblestone_01.png')
  ];
  healthbar = loadImage('Game Images/Health Bar.png');

  // HUD assets
  healthFrameImg = loadImage('Game Images/Health Bar.png');

  // enemy textures (Goblin)
  // files in `Enemy textures/` folder
  window.goblinImgs = {
    right: loadImage('Enemy textures/goblin/goblin right.png'),
    left: loadImage('Enemy textures/goblin/Goblin left.png'),
    up: loadImage('Enemy textures/goblin/Goblin up.png')
  };
}

function drawCheckerboard(tileSize = CHECKER_SIZE, a = '#0f1724', b = '#111827') {
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const isEven = (i + j) % 2 === 0;
      fill(isEven ? a : b);
      noStroke();
      rect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
}

function drawHUD() {
  push();
  rectMode(CORNER);
  if(playerHp<=25){
    fill (255,0,0);
  } else {if(playerHp<=50){ fill(255,165,0); } else { fill(0,255,0);}} // green above 50%, orange between 25-50%, red below 25%
  rect(30,30,playerHpforbar()*2,20);
    // Draw health bar frame
    
  pop();
   image(healthbar,50,10)
}

// --- Block class and collision helpers ---
class Block {
  constructor(gridX, gridY, type = 'concrete', collision = true, mX = 0, mY = 0, meta = {}) {
    this.gridX = gridX; // column
    this.gridY = gridY; // row
    this.type = type;
    this.collision = collision;
    this.mapX = mX;
    this.mapY = mY;
    this.meta = meta;
    this.doorDir = (meta && meta.doorDir) ? meta.doorDir : null;
    // pick an image for this block type (normalize spaces/case)
    if (this.type === 'door') {
      const dir = (this.doorDir || '').toLowerCase();
      if (blocksAssets.door) {
        this.img = blocksAssets.door[dir] || blocksAssets.door.default || null;
      } else {
        this.img = null;
      }
    } else {
      let assetKey = String(type).replace(/\s+/g, '_').toLowerCase();
      if (BLOCK_ALIASES[assetKey]) assetKey = BLOCK_ALIASES[assetKey];
      const variants = blocksAssets[assetKey] || blocksAssets[type] || [];
      if (Array.isArray(variants) && variants.length > 0) {
        this.img = random(variants);
      } else if (variants) {
        this.img = variants || null;
      } else {
        this.img = null;
      }
    }
  }

  getRect() {
    const x = this.gridX * CHECKER_SIZE;
    const y = this.gridY * CHECKER_SIZE;
    // match visual tile bounds exactly (concentric centers)
    return { left: x, top: y, right: x + CHECKER_SIZE, bottom: y + CHECKER_SIZE };
  }

  draw() {
    //playerHp+=0.1
    push();
    noStroke();
    if (this.img) {
      imageMode(CORNER);
      image(this.img, this.gridX * CHECKER_SIZE, this.gridY * CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
      imageMode(CORNER);
    } else {
      // fallback: draw a magenta tile for missing texture
      fill(200, 0, 200);
      rect(this.gridX * CHECKER_SIZE, this.gridY * CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
    }
    pop();
  }
}

// --- Enemy classes and helpers ---
class Enemy {
  constructor(defName, gridX, gridY, mX = 0, mY = 0) {
    const def = ENEMY_DEFS[defName] || {};
    this.defName = defName;
    this.size = def.size || 16;
    this.speed = def.speed || 50;
    this.scale = def.scale || 1;
    this.mapX = mX;
    this.mapY = mY;
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = gridX * CHECKER_SIZE + CHECKER_SIZE / 2;
    this.y = gridY * CHECKER_SIZE + CHECKER_SIZE / 2;
    this.state = 'idle';
    this.target = null; // {x,y}
    this.timer = 0;
    this.stuckTime = 0;
    this.sprite = null;
  }

  getHalfSize() {
    const s = this.size * (this.scale || 1);
    return { w: s / 2, h: s / 2 };
  }

  isOnCurrentMap() {
    return this.mapX === mapX && this.mapY === mapY;
  }

  chooseRandomTargetInRadius(radiusTiles = 6) {
    const sx = this.gridX;
    const sy = this.gridY;
    const rx = Math.floor(random(-radiusTiles, radiusTiles + 1));
    const ry = Math.floor(random(-radiusTiles, radiusTiles + 1));
    const gx = sx + rx;
    const gy = sy + ry;
    this.target = { x: gx * CHECKER_SIZE + CHECKER_SIZE / 2, y: gy * CHECKER_SIZE + CHECKER_SIZE / 2 };
  }

  moveTowardsTarget(dt) {
    if (!this.target) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) {
      // reached
      this.state = 'idle';
      this.target = null;
      this.timer = random(0.5, 2.0);
      return;
    }
    const vx = (dx / dist);
    const vy = (dy / dist);

    // Axis-separated movement with collision checks, same approach as Player
    const half = this.getHalfSize();
    const attemptX = this.x + vx * this.speed * dt;
    const attemptY = this.y;
    if (!isCollidingWithBlocks(attemptX, attemptY, half.w * 2, half.h * 2)) {
      this.x = attemptX;
    }

    const attemptX2 = this.x;
    const attemptY2 = this.y + vy * this.speed * dt;
    if (!isCollidingWithBlocks(attemptX2, attemptY2, half.w * 2, half.h * 2)) {
      this.y = attemptY2;
    }
  }

  update(dt) {
    // timers
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'idle';
    }

    // run behavior only when on same map
    if (!this.isOnCurrentMap()) return;

    const def = ENEMY_DEFS[this.defName] || {};
    const behaviorId = def.behavior || 1;
    const behavior = BEHAVIORS[behaviorId];
    if (behavior) behavior(this, dt);
  }

  draw() {
    if (!this.isOnCurrentMap()) return;
    push();
    imageMode(CENTER);
    // choose facing based on last movement or target
    let face = 'right';
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      if (Math.abs(dx) > Math.abs(dy)) face = dx > 0 ? 'right' : 'left';
      else face = dy > 0 ? 'front' : 'up';
    }
    // map 'front' to right image per note that right also serves as down
    let img = null;
    if (face === 'right' || face === 'front') img = window.goblinImgs.right;
    else if (face === 'left') img = window.goblinImgs.left;
    else if (face === 'up') img = window.goblinImgs.up;

    if (img) {
      const drawW = this.size * (this.scale || 1);
      const drawH = this.size * (this.scale || 1);
      image(img, this.x, this.y, drawW, drawH);
    } else {
      noStroke();
      fill(0, 200, 0);
      rectMode(CENTER);
      rect(this.x, this.y, this.size, this.size);
      rectMode(CORNER);
    }
    //pop();
  }
}

class Goblin extends Enemy {
  constructor(gridX, gridY, mX = 0, mY = 0) {
    super('goblin', gridX, gridY, mX, mY);
    const def = ENEMY_DEFS['goblin'];
    this.speed = def.speed;
    this.size = def.size;
  }
}

// helper: check if a grid tile in a map is collidable
function isTileCollidable(gridX, gridY, mX = mapX, mY = mapY) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.gridX === gridX && b.gridY === gridY && b.mapX === mX && b.mapY === mY) {
      return !!b.collision;
    }
  }
  return false;
}

function findFreeTileNear(gridX, gridY, mX, mY, radius = 6) {
  for (let r = 0; r <= radius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const gx = gridX + dx;
        const gy = gridY + dy;
        if (!isTileCollidable(gx, gy, mX, mY)) return { gx, gy };
      }
    }
  }
  return null;
}

function spawnEnemy(defName, gridX, gridY, mX = 0, mY = 0) {
  // limit per-map
  const count = enemies.filter(e => e.mapX === mX && e.mapY === mY).length;
  if (count >= MAX_ENEMIES_PER_MAP) return null;
  // find free tile
  const free = findFreeTileNear(gridX, gridY, mX, mY, 8);
  const spawn = free ? free : { gx: gridX, gy: gridY };
  const e = new Goblin(spawn.gx, spawn.gy, mX, mY);
  enemies.push(e);
  return e;
}

function updateEnemies(dt) {
  for (let i = 0; i < enemies.length; i++) enemies[i].update(dt);
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) enemies[i].draw();
}

function rectsIntersect(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

function isCollidingWithBlocks(centerX, centerY, w, h) {
  // center-based inputs: convert to box
  const halfW = w / 2;
  const halfH = h / 2;
  const a = { left: centerX - halfW, top: centerY - halfH, right: centerX + halfW, bottom: centerY + halfH };
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    // only consider blocks in the current map
    if (b.mapX !== mapX || b.mapY !== mapY) continue;
    if (!b.collision) continue;
    const br = b.getRect();
    if (rectsIntersect(a, br)) return true;
  }
  return false;
}

// map a door direction string to dx,dy
function dirToDelta(dir) {
  switch ((dir || '').toLowerCase()) {
    case 'up':
      return { dx: 0, dy: 1 };
    case 'down':
      return { dx: 0, dy: -1 };
    case 'left':
      return { dx: -1, dy: 0 };
    case 'right':
      return { dx: 1, dy: 0 };
    default:
      return { dx: 1, dy: 0 }; // default: move right
  }
}

// position player after a door transition. We center the orthogonal axis on the door tile,
// and set the travel axis to the requested edge (0/width/height) then nudge inward slightly
// to avoid immediate re-trigger. `doorBlock` is optional; if not provided we center on screen.
function positionPlayerForDoor(dir, doorBlock) {
  const NUDGE = 4; // small nudge inward to avoid re-triggering
  const d = (dir || '').toLowerCase();
  if (d === 'up') {
    // moved north: playerY = 0 (top), center X on door column
    if (doorBlock) {
      player.x = doorBlock.gridX * CHECKER_SIZE + CHECKER_SIZE / 2;
    } else {
      player.x = width / 2;
    }
    player.y = 0 + NUDGE;
  } else if (d === 'down') {
    if (doorBlock) {
      player.x = doorBlock.gridX * CHECKER_SIZE + CHECKER_SIZE / 2;
    } else {
      player.x = width / 2;
    }
    player.y = height - NUDGE;
  } else if (d === 'left') {
    if (doorBlock) {
      player.y = doorBlock.gridY * CHECKER_SIZE + CHECKER_SIZE / 2;
    } else {
      player.y = height / 2;
    }
    player.x = width - NUDGE;
  } else if (d === 'right') {
    if (doorBlock) {
      player.y = doorBlock.gridY * CHECKER_SIZE + CHECKER_SIZE / 2;
    } else {
      player.y = height / 2;
    }
    player.x = 0 + NUDGE;
  } else {
    // default: center on screen
    player.x = width / 2;
    player.y = height / 2;
  }
  // clamp to canvas bounds just in case
  const half = player.getHalfSize();
  player.x = Math.max(half.w, Math.min(player.x, width - half.w));
  player.y = Math.max(half.h, Math.min(player.y, height - half.h));
}


function draw() {
  const dt = deltaTime / 1000; // seconds since last frame

  // background checkerboard
  drawCheckerboard();

  // draw blocks for current map
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.mapX === mapX && b.mapY === mapY) b.draw();
  }

  // update and draw player
  player.update(dt);
  player.draw();

  // update and draw enemies
  updateEnemies(dt);
  drawEnemies();

  // after movement, check door interactions
  checkDoorInteractions();

  // draw hitboxes overlay if enabled
  if (showHitboxes) {
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    // block hitboxes
    for (let i = 0; i < blocks.length; i++) {
      const r = blocks[i].getRect();
      rect(r.left, r.top, r.right - r.left, r.bottom - r.top);
    }
    // enemy hitboxes
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.mapX !== mapX || e.mapY !== mapY) continue;
      const half = { w: (e.size * (e.scale || 1)) / 2, h: (e.size * (e.scale || 1)) / 2 };
      const r = { left: e.x - half.w, top: e.y - half.h, right: e.x + half.w, bottom: e.y + half.h };
      rect(r.left, r.top, r.right - r.left, r.bottom - r.top);
    }
    // player hitbox (center-based)
    const pHalf = player.getHalfSize();
    const pRect = { left: player.x - pHalf.w, top: player.y - pHalf.h, right: player.x + pHalf.w, bottom: player.y + pHalf.h };
    rect(pRect.left, pRect.top, pRect.right - pRect.left, pRect.bottom - pRect.top);
    pop();
  }

  // HUD overlays drawn last
  drawHUD();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (player) player.clampToCanvas();
}

// Prevent arrow keys from scrolling the page when using them for movement
function keyPressed() {
  // Update facing immediately on key press (WASD or arrows)
  if (player) {
    // letter keys (WASD)
    if (typeof key === 'string') {
      const k = key.toLowerCase();
      if (k === 'a') {
        player.facing = 'left';
        if (bladeImgs.left) player.sprite = bladeImgs.left;
      } else if (k === 'd') {
        player.facing = 'right';
        if (bladeImgs.right) player.sprite = bladeImgs.right;
      } else if (k === 'w') {
        player.facing = 'back';
        if (bladeImgs.back) player.sprite = bladeImgs.back;
      } else if (k === 's') {
        player.facing = 'front';
        if (bladeImgs.front) player.sprite = bladeImgs.front;
      }
    }

    // arrow keys
    if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode)) {
      if (keyCode === LEFT_ARROW) {
        player.facing = 'left';
        if (bladeImgs.left) player.sprite = bladeImgs.left;
      } else if (keyCode === RIGHT_ARROW) {
        player.facing = 'right';
        if (bladeImgs.right) player.sprite = bladeImgs.right;
      } else if (keyCode === UP_ARROW) {
        player.facing = 'back';
        if (bladeImgs.back) player.sprite = bladeImgs.back;
      } else if (keyCode === DOWN_ARROW) {
        player.facing = 'front';
        if (bladeImgs.front) player.sprite = bladeImgs.front;
      }
      return false; // prevent page scrolling for arrows
    }
  }

  // toggle hitboxes with H
  if (key === 'h' || key === 'H') {
    showHitboxes = !showHitboxes;
  }
}

function keyReleased() {
  if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode)) {
    return false;
  }
}

function changeMap(dx, dy, opts = {}) {
  const now = millis();
  if (now - lastMapChangeTime < 3000) return; // simple cooldown
  lastMapChangeTime = now;

  mapX += dx;
  mapY += dy;

  // position player based on door direction and source block if provided
  if (opts.dir) {
    positionPlayerForDoor(opts.dir, opts.doorBlock);
  } else {
    // default: place at center-left interior (grid x = 1)
    const targetGridX = 1;
    const half = player.getHalfSize();
    player.x = targetGridX * CHECKER_SIZE + CHECKER_SIZE / 2; // center of tile
    player.y = Math.max(half.h, Math.min(player.y, height - half.h));
  }
}

function checkDoorInteractions() {
  // check for overlap with any door blocks in the current map
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.mapX !== mapX || b.mapY !== mapY) continue;
    if (b.type !== 'door') continue;
    // door blocks are expected to be non-collidable so player can overlap
    const br = b.getRect();
    const half = player.getHalfSize();
    const pr = { left: player.x - half.w, top: player.y - half.h, right: player.x + half.w, bottom: player.y + half.h };
    if (rectsIntersect(pr, br)) {
      // read direction from metadata; default to 'right'
      const dir = (b.meta && b.meta.doorDir) ? b.meta.doorDir : 'right';
      const delta = dirToDelta(dir);
      changeMap(delta.dx, delta.dy, { dir, doorBlock: b });
      return;
    }
  }
}
