// --- p5.js-style Math Constants for Sandbox ---
let credits = 67 // Initialize credits variable
// Credits infinity sentinel (∞) — use 2^32 as requested
const CREDITS_INFINITY = 4294967296;
// How much HP a machinist repair pack restores
let machinistHpRestore = 100;
// Exec mode flag — when true, privileged commands are enabled
window.execMode = false;
// Exec candidates map: name -> unblocked (true) or blocked (false).
// Architect is unblocked by default; others are present but blocked until you unblock them.
// Keep exactly ten Exec_ slots. Legacy numeric alias (e.g. '12134Architect') is supported
// as an alias for Architect but does not consume a slot.
window.execCandidates = {
    'Exec_Architect12134': true,
    'Exec_Progenitor12135': false,
    'Exec_Originator12136': false,
    'Exec_Author12137': false,
    'Exec_Forger12138': true,
    'Exec_Shaper12139': false,
    'Exec_Steward12140': false,
    'Exec_Pathfinder12141': false,
    'Exec_Warden12142': false,
    'Exec_Vector12143': false,
    'Horzland': true // special canonical name for Architect
   
};
// Track which exec user is currently authenticated (canonical Exec_ name)
window.currentExecUser = null;

// Architect password (required to authenticate as Architect)
// Renamed to a less obvious identifier to avoid accidental console disclosure
window.specialEnemyName = 'S1NGULARITY';

// Admin commands registry (architect-only). Use registerAdminCommand to add entries.
window.adminCommands = {};
window.registerAdminCommand = function(name, handler, helpText) {
    try {
        window.adminCommands = window.adminCommands || {};
        window.adminCommands[name] = { handler: handler, help: helpText || '' };
        return true;
    } catch (e) { console.error('registerAdminCommand failed', e); return false; }
};

// Persistent banned list for Exec names (architect can revoke)
window.execBanned = {};
// Per-Exec mailbox: map execName -> array of messages {from, text, time}
window.execMail = {};

// Persist/load exec state (execCandidates + execBanned) to localStorage
function saveExecState() {
    try {
        const payload = {
            execCandidates: window.execCandidates || {},
            execBanned: window.execBanned || {},
            execMail: window.execMail || {}
        };
        localStorage.setItem('horz_exec_state', JSON.stringify(payload));
    } catch (e) { console.warn('saveExecState failed', e); }
}

function loadExecState() {
    try {
        const raw = localStorage.getItem('horz_exec_state');
        if (!raw) return;
        const obj = JSON.parse(raw || '{}');
        // Merge stored state into defaults without losing keys not present in storage
        window.execCandidates = Object.assign({}, window.execCandidates || {}, obj.execCandidates || {});
        window.execBanned = Object.assign({}, window.execBanned || {}, obj.execBanned || {});
        // Mailboxes: merge arrays per-recipient (preserve any existing runtime mail)
        try {
            window.execMail = window.execMail || {};
            const storedMail = obj.execMail || {};
            Object.keys(storedMail).forEach(k => {
                // ensure array
                const arr = Array.isArray(storedMail[k]) ? storedMail[k].slice() : [];
                window.execMail[k] = (window.execMail[k] || []).concat(arr);
            });
        } catch (e) { console.warn('loadExecState: merging execMail failed', e); }
    } catch (e) { console.warn('loadExecState failed', e); }
}

// Initialize from persisted state (if any)
loadExecState();

// --- Music playlist: preload and random-loop playback ---
// The playlist below is generated to include tracks in nested folders under `GameSoundtracks`.
// Each entry has `name`, `url`, optional `category`, and a `mode` field.
// `mode` can be:
//  - 'ambient' : play when combat inactive
//  - 'combat'  : play when combat active
//  - 'any'     : play always
//  - 'none'    : never played automatically (manual/trigger-only)
// internal backing flag for combat mode; assign initial value here
window._combatModeActive = false; // set true by default (was window.combatModeActive)
console.log(window._combatModeActive + ' is the state of combat mode');
window.musicPlaylist = [
    { name: 'Black Hole', url: '../GameSoundtracks/Ambient Soundtracks/Black Hole.mp3', category: 'Ambient', mode: 'ambient' },
    { name: 'Orbital Assembly Line', url: '../GameSoundtracks/Ambient Soundtracks/Orbital Assembly Line.mp3', category: 'Ambient', mode: 'ambient' },
    { name: 'Zinc Chromate', url: '../GameSoundtracks/Ambient Soundtracks/Zinc Chromate.mp3', category: 'Ambient', mode: 'ambient' },
    { name: 'Orbital Assembly', url: '../GameSoundtracks/Ambient Soundtracks/Orbital Assembly.mp3', category: 'Ambient', mode: 'ambient' },
    { name: 'vast space', url: '../GameSoundtracks/Ambient Soundtracks/vast space.mp3', category: 'Ambient', mode: 'ambient' },

    { name: 'Ravager', url: '../GameSoundtracks/Combat Soundtracks/Ravager.mp3', category: 'Combat', mode: 'combat' },
    { name: 'Crimson Burn in Orbit', url: '../GameSoundtracks/Combat Soundtracks/Crimson Burn in Orbit.mp3', category: 'Combat', mode: 'combat' },
    { name: 'Burn the Black', url: '../GameSoundtracks/Combat Soundtracks/Burn the Black.mp3', category: 'Combat', mode: 'combat' },
   //{ name: 'Burning Orbits', url: '../GameSoundtracks/Combat Soundtracks/Burning Orbits.mp3', category: 'Combat', mode: 'combat' }, //nope nope nope

    { name: 'Last Stand in the Glitchstorm', url: '../GameSoundtracks/Special Soundtracks/Last Stand in the Glitchstorm.mp3', category: 'Special', mode: 'none' },
    { name: 'The Architect', url: '../GameSoundtracks/Special Soundtracks/The Architect.mp3', category: 'Special', mode: 'none' }
];
window.musicElems = [];
window.musicShuffled = [];
window.musicIndex = -1; // index into musicShuffled
window.musicPlaying = false;

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

// Build a shuffled array of playlist indices filtered by the current `combatModeActive` flag
function buildMusicShuffled() {
    try {
        const idxs = [];
        const counts = { any:0, combat:0, ambient:0, none:0, unknown:0 };
        (window.musicPlaylist || []).forEach((p, i) => {
            const mode = (p && p.mode) ? p.mode : 'any';
            if (!counts.hasOwnProperty(mode)) counts.unknown++;
            else counts[mode] = (counts[mode]||0) + 1;
            if (mode === 'none') return; // skip tracks flagged as manual-only
            if (mode === 'any') idxs.push(i);
            else if (mode === 'combat' && window._combatModeActive) idxs.push(i);
            else if (mode === 'ambient' && !window._combatModeActive) idxs.push(i);
        });
        console.log('buildMusicShuffled: mode=', window._combatModeActive ? 'combat' : 'ambient', 'counts=', counts, 'eligible=', idxs.length);
        if (idxs.length === 0) return [];
        const shuffled = shuffleArray(idxs);
        console.log('buildMusicShuffled: shuffled indices ->', shuffled.map(i => ({ i, name: window.musicPlaylist[i] && window.musicPlaylist[i].name, mode: window.musicPlaylist[i] && window.musicPlaylist[i].mode })));
        return shuffled;
    } catch (e) { console.warn('buildMusicShuffled failed', e); return []; }
}

function initMusic() {
    try {
        window.musicElems = window.musicPlaylist.map(p => {
            const a = new Audio(p.url);
            a.preload = 'auto';
            a.addEventListener('ended', function() { onTrackEnded(); });
            a.addEventListener('error', function(e) { console.warn('music load error', p.url, e); });
            return a;
        });
    } catch (e) { console.warn('initMusic failed', e); }
}

function onTrackEnded() {
    try {
        // advance index and play next; if reached end, reshuffle and start over
        if (!window.musicShuffled || window.musicShuffled.length === 0) return stopMusic();
        window.musicIndex++;
        if (window.musicIndex >= window.musicShuffled.length) {
            window.musicShuffled = shuffleArray(window.musicShuffled);
            window.musicIndex = 0;
        }
        const next = window.musicShuffled[window.musicIndex];
        playByShuffledIndex(window.musicIndex);
    } catch (e) { console.warn('onTrackEnded failed', e); }
}

function playByShuffledIndex(shufIdx) {
    try {
        // stop any playing
        window.musicElems.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
        const trackIdx = window.musicShuffled[shufIdx];
        const aud = window.musicElems[trackIdx];
        if (!aud) return console.warn('playByShuffledIndex: missing audio element', trackIdx);
        aud.play().catch(e => { console.warn('autoplay blocked or play failed', e); });
        window.musicPlaying = true;
        window.musicIndex = shufIdx;
        console.log('music: playing', window.musicPlaylist[trackIdx] && window.musicPlaylist[trackIdx].name);
    } catch (e) { console.error('playByShuffledIndex failed', e); }
}

function startMusicRandomLoop() {
    try {
        if (!window.musicElems || window.musicElems.length === 0) initMusic();
        if (!window.musicElems || window.musicElems.length === 0) return console.log('music: no tracks available');
        // build a shuffled index array filtered by current mode (ambient vs combat)
        window.musicShuffled = buildMusicShuffled();
        if (!window.musicShuffled || window.musicShuffled.length === 0) return console.log('music: no tracks for current mode', window._combatModeActive ? 'combat' : 'ambient');
        console.log('music: starting randomized loop for mode', window._combatModeActive ? 'combat' : 'ambient');
        window.musicIndex = 0;
        playByShuffledIndex(0);
    } catch (e) { console.error('startMusicRandomLoop failed', e); }
}

function stopMusic() {
    try {
        window.musicElems.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
        window.musicPlaying = false;
        window.musicIndex = -1;
        console.log('music: stopped');
    } catch (e) { console.warn('stopMusic failed', e); }
}

// Initialize audio elements but do not autoplay to respect browser policies. Call `startMusicRandomLoop()` to start.
initMusic();
// Auto-start music by default. Browsers may block autoplay until user interacts;
// this attempts to start the randomized loop on load. You can disable by setting
// `window.musicAutoStart = false` in the console before the script runs.
window.musicAutoStart = true;
if (window.musicAutoStart) {
    try { startMusicRandomLoop(); } catch (e) { console.warn('auto start music failed', e); }
}

// Helper: set combat mode and immediately switch playlist playback
function setCombatMode(active) {
    try {
        const prev = !!window._combatModeActive;
        window._combatModeActive = !!active;
        console.log('setCombatMode:', prev, '->', window._combatModeActive);
        // ensure audio elements exist
        if (!window.musicElems || window.musicElems.length === 0) initMusic();
        // stop current playback
        try { stopMusic(); } catch (e) {}
        // rebuild shuffled playlist for the new mode and start if available
        window.musicShuffled = buildMusicShuffled();
        if (!window.musicShuffled || window.musicShuffled.length === 0) {
            console.log('music: no tracks available for mode', window._combatModeActive ? 'combat' : 'ambient');
            return;
        }
        window.musicIndex = 0;
        playByShuffledIndex(0);
    } catch (e) { console.warn('setCombatMode failed', e); }
}
// Expose a property so assignments to `window.combatModeActive = true` auto-apply
try {
    Object.defineProperty(window, 'combatModeActive', {
        configurable: true,
        enumerable: true,
        get: function() { return !!window._combatModeActive; },
        set: function(v) { try { setCombatMode(!!v); } catch (e) { console.warn('combatModeActive setter failed', e); } }
    });
} catch (e) { console.warn('defineProperty combatModeActive failed', e); }
// Transient UI message for music toggle
window.musicToggleMessage = '';
window.musicToggleTime = 0; // ms timestamp when message was set
// Transient info message for music actions (next/track name)
window.musicInfoMessage = '';
window.musicInfoTime = 0;

// Sound effects registry and helper
window.sfx = {};
window.sfxVolume = 0.7; // global SFX volume (0.0 - 1.0)
function initSfx() {
    try {
        const base = '../GameSounds/';
        const make = (p) => { const a = new Audio(p); a.preload = 'auto'; a.volume = window.sfxVolume; a.addEventListener('error', (e)=>console.warn('sfx load error', p, e)); return a; };
        window.sfx.laser = make(base + 'laser-104024.mp3');
        window.sfx.explosion = make(base + 'explosion-sound-effect-425455.mp3');
        window.sfx.gameover = make(base + 'losing-horn-313723.mp3');
        window.sfx.far = [ make(base + 'far1.mp3'), make(base + 'far2.mp3'), make(base + 'far3.mp3') ];
    } catch (e) { console.warn('initSfx failed', e); }
}

function playSfx(name, opts) {
    try {
        if (!window.sfx) return;
        const entry = window.sfx[name];
        if (!entry) return;
        // choose one if it's an array (randomize for variety)
        let src = entry;
        if (Array.isArray(entry)) src = entry[Math.floor(Math.random() * entry.length)];
        // clone so overlapping sounds can play
        const node = src.cloneNode ? src.cloneNode(true) : new Audio(src.src || src);
        node.volume = (opts && typeof opts.volume === 'number') ? opts.volume : (window.sfxVolume || 0.7);
        // optional playbackRate/pitch
        if (opts && typeof opts.playbackRate === 'number') node.playbackRate = opts.playbackRate;
        node.play().catch(e => { /* ignore autoplay/decoding rejections */ });
    } catch (e) { console.warn('playSfx failed', e); }
}

// Initialize SFX now
initSfx();
// mark far[] loop state for all far variants
try {
    if (window.sfx && Array.isArray(window.sfx.far)) {
        for (let i = 0; i < window.sfx.far.length; i++) {
            try { window.sfx.far[i]._isLooping = false; window.sfx.far[i].loop = false; } catch(e) {}
        }
    }
} catch(e) {}

// Register 'revoke' admin command: permanently ban an Exec name and free their slot
try {
    window.registerAdminCommand('revoke', function(args) {
        const name = args[1];
        if (!name) return console.log('revoke usage: revoke <Exec_Name>');
        window.execCandidates = window.execCandidates || {};
        window.execBanned = window.execBanned || {};
        if (window.execBanned[name]) return console.log(name + ' is already banned');
        // Mark banned
        window.execBanned[name] = true;
        // If this is an Exec_ slot currently present, remove it to free the slot
        if (name.startsWith('Exec_') && Object.prototype.hasOwnProperty.call(window.execCandidates, name)) {
            delete window.execCandidates[name];
            console.log('revoke: removed slot and banned', name);
            try { saveExecState(); } catch (e) {}
        } else {
            // Ensure it is blocked
            window.execCandidates[name] = false;
            console.log('revoke: banned', name);
            try { saveExecState(); } catch (e) {}
        }
    }, 'revoke <Exec_Name> — permanently ban an Exec name and free their slot');
} catch (e) {}

// Admin command to remove a permanent ban. Requires explicit confirmation to run.
try {
    window.registerAdminCommand('unban', function(args) {
        const name = args[1];
        if (!name) return console.log('unban usage: unban <Exec_Name> [confirm]');
        window.execBanned = window.execBanned || {};
        window.execCandidates = window.execCandidates || {};
        if (!window.execBanned[name]) return console.log(name + ' is not banned');
        if (args[2] !== 'confirm') {
            return console.log('unban: This will remove the permanent ban on ' + name + '. To proceed run: unban ' + name + ' confirm');
        }
        try {
            delete window.execBanned[name];
        } catch (e) { window.execBanned[name] = undefined; }
        // Turn the exec back on (enable the slot) and persist
        window.execCandidates[name] = true;
        try { saveExecState(); } catch (e) {}
        console.log('unban: removed ban and enabled', name);
    }, 'unban <Exec_Name> [confirm] — remove permanent ban (Architect only)');
} catch (e) {}

// Admin command to list Exec IDs and their status: valid, off, or banned
try {
    window.registerAdminCommand('execlist', function(args) {
        const candidates = window.execCandidates || {};
        const banned = window.execBanned || {};
        // Build union of names
        const names = Array.from(new Set([].concat(Object.keys(candidates), Object.keys(banned)))).sort();
        if (names.length === 0) return console.log('execlist: no exec entries');
        console.log('execlist:');
        names.forEach(name => {
            let status = 'unknown';
            if (banned && banned[name]) status = 'banned';
            else if (Object.prototype.hasOwnProperty.call(candidates, name)) {
                status = candidates[name] ? 'valid' : 'off';
            }
            console.log(' -', name + ':', status);
        });
    }, 'execlist — list Exec IDs and show status (valid|off|banned)');
} catch (e) {}
const PI = Math.PI;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;
// --- SANDBOX: Your Drawing Playground ---
// You can use push(), pop(), translate(x,y,z), box(w,h,d), and setColor(r,g,b) below!
// Example: make a stack of boxes
// Edit inside mySandboxDrawing() to try your own ideas.

let sandboxStack = [identity()];
let sandboxColor = [1,1,1];

function push() {
    sandboxStack.push(new Float32Array(sandboxStack[sandboxStack.length-1]));
}
function pop() {
    if (sandboxStack.length > 1) sandboxStack.pop();
}
function translate(x, y, z) {
    let m = sandboxStack[sandboxStack.length-1];
    sandboxStack[sandboxStack.length-1] = translateMatrix(m, x, y, z);
}
function setColor(r, g, b) {
    sandboxColor = [r, g, b];
}
function box(w, h, d) {
    let m = sandboxStack[sandboxStack.length-1];
    m = scaleMatrix(m, w/2, h/2, d/2); // box is 2x2x2 by default
    gl.uniformMatrix4fv(uModelMatrix, false, m);
    drawBox(sandboxColor);
}

// Use this function as your playground:
function mySandboxDrawing() {
    // apply sandbox-local rotation to the top transform (avoid calling p5.rotateX)
    sandboxStack[sandboxStack.length-1] = rotateX(sandboxStack[sandboxStack.length-1], HALF_PI + PI);
  
 /*
  //body
  push()
  translate(0,0,0)
  setColor(129/255,129/255,129/255)
  cylinder(20,100)
  pop()
  
  //nose cone
   push()
  translate(0,65,0)
  setColor(107/255,107/255,107/255)
 cone(20,30)
  pop()
  
  //band (upper)
   push()
  translate(0,-40,0)
 setColor(0,94/255,14/255)
  cylinder(21,10)
  pop()
  
  //band (lower)
   push()
  translate(0,40,0)
 setColor(0,94/255,14/255)
  cylinder(21,10)
  pop()
  
  //fins
  push()
  translate(0,-60,0)
   setColor(107/255,107/255,107/255)
  box(40,30,10)
  rotateY(HALF_PI)
  box(40,30,10)
  pop()
  
  */
  
}

// Helper for translate (so it doesn't conflict with global translate)
function translateMatrix(matrix, x, y, z) {
    const result = new Float32Array(matrix);
    result[12] += x;
    result[13] += y;
    result[14] += z;
    return result;
}
// --- User Custom Drawing Functions (like the bomb) ---
// Write your own drawing code here, using the WebGL helpers (drawCylinder, drawCone, etc.)
// Example: Custom Bomb Drawing

// Draw a box centered at origin, size 2x2x2, colored
function drawBox(color) {
    // 8 vertices, 12 triangles
    const verts = new Float32Array([
        -1,-1,-1,  1,-1,-1,  1,1,-1, -1,1,-1, // back
        -1,-1, 1,  1,-1, 1,  1,1, 1, -1,1, 1  // front
    ]);
    const idx = new Uint16Array([
        0,1,2, 0,2,3, // back
        4,5,6, 4,6,7, // front
        0,1,5, 0,5,4, // bottom
        2,3,7, 2,7,6, // top
        1,2,6, 1,6,5, // right
        0,3,7, 0,7,4  // left
    ]);
    const colorArr = new Float32Array(24).fill(0).map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

function myCustomBomb(gl, modelMatrix) {
    // Example: draw a bomb using the same helpers as the main code
    // You can edit this function to try your own ideas!
    // modelMatrix is the transform for this object
    // Body
    let body = scaleMatrix(modelMatrix, 20, 100, 20);
    gl.uniformMatrix4fv(uModelMatrix, false, body);
    drawCylinder([0.5,0.5,0.5], 32);
    // Nose
    let nose = translate(modelMatrix, 0, 65, 0);
    nose = scaleMatrix(nose, 20, 30, 20);
    gl.uniformMatrix4fv(uModelMatrix, false, nose);
    drawCone([0.7,0.7,0.7], 32);
    // Bands
    let band1 = translate(modelMatrix, 0, -40, 0);
    band1 = scaleMatrix(band1, 21, 10, 21);
    gl.uniformMatrix4fv(uModelMatrix, false, band1);
    drawCylinder([0,0.7,0.2], 32);
    let band2 = translate(modelMatrix, 0, 40, 0);
    band2 = scaleMatrix(band2, 21, 10, 21);
    gl.uniformMatrix4fv(uModelMatrix, false, band2);
    drawCylinder([0,0.7,0.2], 32);
    // Fins
    let fin1 = translate(modelMatrix, 0, -60, 0);
    fin1 = scaleMatrix(fin1, 20, 15, 5);
    gl.uniformMatrix4fv(uModelMatrix, false, fin1);
    drawBox([0.7,0.7,0.7]);
    let fin2 = translate(modelMatrix, 0, -60, 0);
    fin2 = rotateY(fin2, Math.PI/2);
    fin2 = scaleMatrix(fin2, 20, 15, 5);
    gl.uniformMatrix4fv(uModelMatrix, false, fin2);
    drawBox([0.7,0.7,0.7]);
}

// --- User Custom Drawing Functions ---
// You can add your own drawing functions to the 'drawings' object below.
// Example:
// drawings.myShape = function(gl, params) {
//   // Your custom WebGL drawing code here
//   // Use gl, and any params you want to pass in
// };
//
// To call: drawings.myShape(gl, { ... });
const drawings = {};

// claude wuz here

// Get canvases and setup WebGL context
const canvas = document.getElementById('gameCanvas');
const uiCanvas = document.getElementById('uiCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
const uiCtx = uiCanvas.getContext('2d');

// Load user-provided PNG to use as an icon in the UI
let uiIcon = new Image();
let uiIconLoaded = false;
uiIcon.onload = () => { uiIconLoaded = true; };
// Icon lives in the sibling `game images` folder; reference it relative to `game code`
try { uiIcon.src = '../game images/icons8-spacecraft-50.png'; } catch (e) { uiIcon.src = '../game images/icons8-spacecraft-50.png'; }

// Optional robot image for machinist UI (user-provided)
let robotImg = new Image();
let robotLoaded = false;
robotImg.onload = () => { robotLoaded = true; };
robotImg.onerror = () => { robotLoaded = false; };
// Robot image for the machinist UI lives in `game images` (sibling folder)
try { robotImg.src = '../game images/robot.png'; } catch (e) { robotImg.src = '../game images/robot.png'; }

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
uiCanvas.width = window.innerWidth;
uiCanvas.height = window.innerHeight;

if (!gl) {
    alert('WebGL not supported in your browser');
}

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spaceship state
let spaceship = {
    position: [0, 0, -25000],
    rotation: [0, 0, 0],
    rotationSpeed: 0.015,
    speed: 2.0,
    minSpeed: 0.01,
    // maxSpeed so that speed in km/s is capped at 299792.458
    maxSpeed: 299792.458 * 1000 / (100000 * 60), // ≈ 49.9654 units/frame
    hp: 500,
    maxHp: 500
};

// Player credits (displayed in UI with § token)
//let credits = 12345;

// Camera configuration: base rotations (radians) that will be added
// to the spaceship's rotation to form the camera orientation.
let cameraBaseRotX = QUARTER_PI; // base pitch (X axis)
let cameraBaseRotY = 0;          // base yaw   (Y axis)
// Camera runtime state for smoothing
const cameraState = {
    eye: null,
    center: null,
    inited: false
};
// How fast the camera catches up to the target (0..1)
let cameraLerp = 0.12;
// How much the ship's pitch influences the camera pitch (0..1)
let pitchInfluence = 0.7;

// Transform a 3D vector by a 4x4 matrix (treating the vector as a direction when w=0)
function transformVec3(m, v, w = 0) {
    return [
        m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12]*w,
        m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13]*w,
        m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14]*w
    ];
}

function dot(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }

// Build a lookAt view matrix (column-major)
function lookAt(eye, center, up) {
    const f = normalize(sub(center, eye));
    const s = normalize(cross(f, up));
    const u = cross(s, f);

    return new Float32Array([
        s[0], u[0], -f[0], 0,
        s[1], u[1], -f[1], 0,
        s[2], u[2], -f[2], 0,
        -dot(s, eye), -dot(u, eye), dot(f, eye), 1
    ]);
}

// Compute a view matrix from camera base rotations + ship rotations, keeping the ship in view
function computeViewMatrix() {
    const shipPos = spaceship.position;

    // Compute forward vector from ship rotation (yaw, pitch)
    const yaw = spaceship.rotation[1];
    const pitch = spaceship.rotation[0];
    const forward = [
        Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    ];

    // Exact camera offsets requested:5 units behind, 1.5 units above
    const behindDistance =  5 //2.5; // for better visibility
    const upOffset = 1.5;

    // Position the eye strictly behind the ship using vector math
    const eye = add(shipPos, scale(forward, -behindDistance));
    eye[1] += upOffset;

    // Look directly at the ship (center = ship position)
    const center = shipPos.slice();

    // Write camera state immediately (no lerp/smoothing)
    cameraState.eye = eye.slice();
    cameraState.center = center.slice();
    cameraState.inited = true;

    return lookAt(cameraState.eye, cameraState.center, [0,1,0]);
}

// Return ship's forward (local Z) vector based on current rotations
function getShipForward() {
    const yaw = spaceship.rotation[1];
    const pitch = spaceship.rotation[0];
    // forward vector (matches view/camera forward used elsewhere)
    return [
        Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    ];
}

// Keyboard state
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false
};

// Docking state
let dockNearbyPlanet = null; // planet you can dock with (in range)
let isDocked = false;        // whether player is currently docked
let dockedPlanet = null;     // reference to planet we're docked at

// Vertex shader (adds normals and texcoords for lighting/textures)
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;
    uniform float uPointSize;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vWorldPos;

    void main() {
        vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
        vWorldPos = worldPos.xyz;
        // Transform normal (assumes model matrix has no shear)
        vNormal = mat3(uModelMatrix) * aNormal;
        vTexCoord = aTexCoord;
        vColor = aColor;
        gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
        gl_PointSize = uPointSize;
    }
`;

// Fragment shader: planets lit by two stars, with a bit of ambient
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vWorldPos;

    uniform vec3 uStar1Pos;
    uniform vec3 uStar1Color;
    uniform float uStar1Radius;
    uniform vec3 uStar2Pos;
    uniform vec3 uStar2Color;
    uniform float uStar2Radius;
    uniform sampler2D uTexture;
    uniform bool uHasTexture;

    uniform float uEmissive;
    uniform float uOverrideAlpha;

    void main() {
        vec3 N = normalize(vNormal);
        vec3 base = vColor;
        if (uHasTexture) {
            base = texture2D(uTexture, vTexCoord).rgb;
        }
        // Lighting from Antares (star 1)
        vec3 L1 = normalize(uStar1Pos - vWorldPos);
        float dist1 = length(uStar1Pos - vWorldPos);
        float diff1 = max(dot(N, L1), 0.0);
        float att1 = (uStar1Radius * 10.0) / (dist1 + 1.0);
        // Blend star color with white for whiter lighting
        vec3 star1LightColor = mix(uStar1Color, vec3(1.0, 1.0, 1.0), 0.6); // 60% white, 40% star color
        vec3 light1 = star1LightColor * diff1 * att1;
        // Lighting from Talmera (star 2)
        vec3 L2 = normalize(uStar2Pos - vWorldPos);
        float dist2 = length(uStar2Pos - vWorldPos);
        float diff2 = max(dot(N, L2), 0.0);
        float att2 = (uStar2Radius * 10.0) / (dist2 + 1.0);
        vec3 star2LightColor = mix(uStar2Color, vec3(1.0, 1.0, 1.0), 0.6);
        vec3 light2 = star2LightColor * diff2 * att2;
        // Add a small ambient term for minimum visibility
        float ambient = 0.10;
        vec3 color = base * (ambient + light1 + light2) + base * uEmissive;
        color = clamp(color, 0.0, 1.0);
        gl_FragColor = vec4(color, uOverrideAlpha);
    }
`;

// Compile shader
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create shader program
function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const program = createProgram(vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// Spaceship geometry (detailed ship with cockpit, body, wings, and cannons)
const spaceshipVertices = new Float32Array([
    // Main body/cockpit (front nose cone)
    0.0, 0.0, 0.7,
    -0.15, 0.1, 0.2,
    0.15, 0.1, 0.2,
    
    0.0, 0.0, 0.7,
    -0.15, -0.1, 0.2,
    0.15, -0.1, 0.2,
    
    // Cockpit sides
    -0.15, 0.1, 0.2,
    -0.15, -0.1, 0.2,
    0.15, -0.1, 0.2,
    
    -0.15, 0.1, 0.2,
    0.15, -0.1, 0.2,
    0.15, 0.1, 0.2,
    
    // Main body (center fuselage)
    -0.2, 0.1, 0.2,
    -0.2, -0.1, 0.2,
    0.2, -0.1, 0.2,
    
    -0.2, 0.1, 0.2,
    0.2, -0.1, 0.2,
    0.2, 0.1, 0.2,
    
    -0.2, 0.1, 0.2,
    -0.2, -0.1, 0.2,
    -0.2, -0.1, -0.3,
    
    -0.2, 0.1, 0.2,
    -0.2, -0.1, -0.3,
    -0.2, 0.1, -0.3,
    
    0.2, 0.1, 0.2,
    0.2, -0.1, 0.2,
    0.2, -0.1, -0.3,
    
    0.2, 0.1, 0.2,
    0.2, -0.1, -0.3,
    0.2, 0.1, -0.3,
    
    // Left wing
    -0.2, 0.0, 0.0,
    -0.6, 0.0, -0.1,
    -0.6, 0.0, -0.4,
    
    -0.2, 0.0, 0.0,
    -0.6, 0.0, -0.4,
    -0.2, 0.0, -0.3,
    
    // Right wing
    0.2, 0.0, 0.0,
    0.6, 0.0, -0.1,
    0.6, 0.0, -0.4,
    
    0.2, 0.0, 0.0,
    0.6, 0.0, -0.4,
    0.2, 0.0, -0.3,
    
    // Left cannon (mounted on left wing)
    -0.5, 0.05, 0.1,
    -0.45, 0.05, 0.1,
    -0.45, 0.05, 0.5,
    
    -0.5, 0.05, 0.1,
    -0.45, 0.05, 0.5,
    -0.5, 0.05, 0.5,
    
    -0.5, -0.05, 0.1,
    -0.45, -0.05, 0.1,
    -0.45, -0.05, 0.5,
    
    -0.5, -0.05, 0.1,
    -0.45, -0.05, 0.5,
    -0.5, -0.05, 0.5,
    
    // Right cannon (mounted on right wing)
    0.5, 0.05, 0.1,
    0.45, 0.05, 0.1,
    0.45, 0.05, 0.5,
    
    0.5, 0.05, 0.1,
    0.45, 0.05, 0.5,
    0.5, 0.05, 0.5,
    
    0.5, -0.05, 0.1,
    0.45, -0.05, 0.1,
    0.45, -0.05, 0.5,
    
    0.5, -0.05, 0.1,
    0.45, -0.05, 0.5,
    0.5, -0.05, 0.5,
    
    // Engine exhausts (back)
    -0.15, 0.05, -0.3,
    -0.15, -0.05, -0.3,
    -0.1, -0.05, -0.5,
    
    -0.15, 0.05, -0.3,
    -0.1, -0.05, -0.5,
    -0.1, 0.05, -0.5,
    
    0.15, 0.05, -0.3,
    0.15, -0.05, -0.3,
    0.1, -0.05, -0.5,
    
    0.15, 0.05, -0.3,
    0.1, -0.05, -0.5,
    0.1, 0.05, -0.5
]);

const spaceshipColors = new Float32Array([
    // Cockpit - bright blue
    0.3, 0.7, 1.0,
    0.3, 0.7, 1.0,
    0.3, 0.7, 1.0,
    
    0.3, 0.7, 1.0,
    0.3, 0.7, 1.0,
    0.3, 0.7, 1.0,
    
    0.2, 0.6, 0.9,
    0.2, 0.6, 0.9,
    0.2, 0.6, 0.9,
    
    0.2, 0.6, 0.9,
    0.2, 0.6, 0.9,
    0.2, 0.6, 0.9,
    
    // Main body - gray
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    0.4, 0.4, 0.4,
    
    // Left wing - dark gray
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    
    // Right wing - dark gray
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    0.3, 0.3, 0.3,
    
    // Left cannon - red
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    
    // Right cannon - red
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    0.8, 0.2, 0.2,
    
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    0.7, 0.1, 0.1,
    
    // Engine exhausts - bright orange/yellow
    1.0, 0.5, 0.0,
    1.0, 0.5, 0.0,
    1.0, 0.7, 0.0,
    
    1.0, 0.5, 0.0,
    1.0, 0.7, 0.0,
    1.0, 0.7, 0.0,
    
    1.0, 0.5, 0.0,
    1.0, 0.5, 0.0,
    1.0, 0.7, 0.0,
    
    1.0, 0.5, 0.0,
    1.0, 0.7, 0.0,
    1.0, 0.7, 0.0
]);

// Create buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, spaceshipVertices, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, spaceshipColors, gl.STATIC_DRAW);

// --- Optional external ship model loader (OBJ) ---
// If you place an OBJ at `game images/ship.obj` this will attempt to load it and
// use it instead of the built-in procedural spaceship geometry.
let loadedShipModel = null;
function createGLBufferFromArray(arr, itemSize, usage = gl.STATIC_DRAW) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), usage);
    buf._itemSize = itemSize;
    buf._numItems = arr.length / itemSize;
    return buf;
}
function createIndexBuffer(indices) {
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    ib._count = indices.length;
    return ib;
}
async function loadOBJtoModel(url, defaultColor = [0.6,0.6,0.6]) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const text = await resp.text();
        const lines = text.split('\n');
        const pos = [[0,0,0]];
        const tex = [[0,0]];
        const nor = [[0,0,1]];
        const outPositions = [];
        const outNormals = [];
        const outUVs = [];
        const outColors = [];
        const indices = [];
        const vertMap = new Map();
        let nextIndex = 0;

        function parseTriplet(token) {
            const parts = token.split('/');
            const vi = parseInt(parts[0] || '0', 10);
            const vti = parts[1] ? parseInt(parts[1], 10) : 0;
            const vni = parts[2] ? parseInt(parts[2], 10) : 0;
            return { vi, vti: vti || 0, vni: vni || 0 };
        }

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;
            const parts = line.split(/\s+/);
            const tag = parts[0];
            if (tag === 'v') {
                pos.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (tag === 'vt') {
                tex.push([parseFloat(parts[1]), parseFloat(parts[2])]);
            } else if (tag === 'vn') {
                nor.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (tag === 'f') {
                const face = parts.slice(1).map(parseTriplet);
                for (let i = 1; i < face.length - 1; i++) {
                    const tri = [face[0], face[i], face[i+1]];
                    for (const t of tri) {
                        const key = `${t.vi}/${t.vti}/${t.vni}`;
                        if (!vertMap.has(key)) {
                            const p = pos[t.vi] || [0,0,0];
                            outPositions.push(p[0], p[1], p[2]);
                            const uv = tex[t.vti] || [0,0];
                            outUVs.push(uv[0], uv[1]);
                            const nrm = nor[t.vni] || [0,0,1];
                            outNormals.push(nrm[0], nrm[1], nrm[2]);
                            outColors.push(defaultColor[0], defaultColor[1], defaultColor[2]);
                            vertMap.set(key, nextIndex++);
                        }
                        indices.push(vertMap.get(key));
                    }
                }
            }
        }

        const model = {};
        if (outPositions.length > 0) model.positionBuffer = createGLBufferFromArray(outPositions, 3);
        if (outColors.length > 0) model.colorBuffer = createGLBufferFromArray(outColors, 3);
        if (outNormals.length > 0) model.normalBuffer = createGLBufferFromArray(outNormals, 3);
        if (outUVs.length > 0) model.uvBuffer = createGLBufferFromArray(outUVs, 2);
        if (indices.length > 0) { model.indexBuffer = createIndexBuffer(indices); model.indexCount = indices.length; }
        else model.vertexCount = outPositions.length / 3;
        return model;
    } catch (e) { console.warn('Failed to load OBJ', url, e); return null; }
}
async function tryLoadShipModelCandidates() {
    const candidates = [
        'game images/ship3.obj',
        '../game images/ship3.obj',
        'game images/ship.obj',
        '../game images/ship.obj',
        'game images/spaceship.obj',
        '../game images/spaceship.obj'
    ];
    for (const c of candidates) {
        try {
            const m = await loadOBJtoModel(c);
            if (m) { loadedShipModel = m; console.log('Loaded ship model from', c); return; }
        } catch (e) { /* continue */ }
    }
    console.log('No external ship model found; using built-in spaceship geometry.');
}
tryLoadShipModelCandidates();
// --- End loader ---

// Sphere geometry
function createSphere(radius, segments, color) {
    const vertices = [];
    const colors = [];
    const normals = [];
    const uvs = [];
    
    for (let lat = 0; lat <= segments; lat++) {
        const theta = lat * Math.PI / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        for (let lon = 0; lon <= segments; lon++) {
            const phi = lon * 2 * Math.PI / segments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            
            const vx = radius * x, vy = radius * y, vz = radius * z;
            vertices.push(vx, vy, vz);
            normals.push(x, y, z);
            const u = lon / segments;
            const v = lat / segments;
            uvs.push(u, 1 - v);
            colors.push(color[0], color[1], color[2]);
        }
    }
    
    const indices = [];
    for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            const first = (lat * (segments + 1)) + lon;
            const second = first + segments + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    
    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices)
    };
}

// Planets data - name, position, radius, color, description
const planets = [
    /*
    { name: "Zephyr", position: [0, 0, 750], radius: 300, color: [0.8, 0.3, 0.8], desc: "A mystic world shrouded in violet mists", texture: 'Zephyr planet texture.png' },
    { name: "Crimson Prime", position: [1200, 200, -500], radius: 250, color: [0.9, 0.2, 0.2], desc: "War-torn capital of the Red Dominion", texture: 'Crimson_Prime Planet texture.png' },
    { name: "Aqualis", position: [-800, -100, 1500], radius: 350, color: [0.2, 0.6, 0.9], desc: "Ocean world with endless depths", texture: 'Aqualis Planet texture.png' },
    { name: "Verdant", position: [500, 300, -1200], radius: 200, color: [0.3, 0.8, 0.3], desc: "Jungle planet teeming with exotic life", texture: 'Verdant planet texture.png' },
    { name: "Aurion", position: [-1500, 0, 800], radius: 400, color: [1.0, 0.8, 0.2], desc: "Golden desert world of ancient ruins", texture: 'Aurion Planet texture.png' },
    { name: "Nyx", position: [2000, -400, 300], radius: 180, color: [0.1, 0.1, 0.3], desc: "Perpetual night world, home to shadow dwellers", texture: 'Nyx planet texture.png' },
    { name: "Ember", position: [-600, 500, -900], radius: 220, color: [1.0, 0.4, 0.1], desc: "Volcanic hellscape with rivers of lava", texture: 'Ember Planet texture.png' },
    { name: "Glacius", position: [1800, 100, 1200], radius: 320, color: [0.7, 0.9, 1.0], desc: "Frozen wasteland of crystalline ice", texture: 'Glacius Planet texture.png' },
    { name: "Titanforge", position: [-1100, -300, -1500], radius: 450, color: [0.5, 0.5, 0.6], desc: "Industrial mega-world, forges of the empire", texture:  'Titanforge planet texture.png' },
    { name: "Lumina", position: [900, 600, 600], radius: 150, color: [1.0, 1.0, 0.7], desc: "Radiant beacon world, center of enlightenment", texture: 'Lumina Planet texture.png' },
    { name: "Obsidian", position: [-2200, 200, 0], radius: 280, color: [0.2, 0.2, 0.2], desc: "Dark mining colony extracting rare minerals", texture: 'Obsidian Planet texture.png' },
    { name: "Coral", position: [300, -200, -1800], radius: 190, color: [1.0, 0.5, 0.6], desc: "Living planet covered in pink coral reefs", texture: 'Coral planet texture.png' },
    { name: "Stratos", position: [-1300, 400, 1100], radius: 270, color: [0.6, 0.7, 0.9], desc: "Sky cities floating in endless clouds", texture: 'Stratos planet texture.png' },
    { name: "Inferno", position: [1600, -100, -700], radius: 240, color: [0.9, 0.3, 0.0], desc: "Scorched world orbiting twin suns", texture: 'Inferno Planet texture.png' },
    { name: "Jade", position: [-500, -500, 2000], radius: 210, color: [0.2, 0.7, 0.4], desc: "Peaceful farming world, breadbasket of the sector", texture: 'Jade planet texture.png' },
    { name: "Celestia", position: [2500, 300, 900], radius: 380, color: [0.9, 0.8, 1.0], desc: "Ethereal realm where reality bends", texture: 'Celestia Planet texture.png' },
    { name: "Rust", position: [-900, 100, -1100], radius: 230, color: [0.7, 0.4, 0.2], desc: "Abandoned mechanical world, ruins of AI civilization", texture: 'Rust Planet texture.png' },
    { name: "Sapphire", position: [1100, -300, 1600], radius: 290, color: [0.2, 0.4, 0.9], desc: "Rich world of crystalline deposits and gems", texture: 'Sapphire Planet texture.png' },
    { name: "Ash", position: [-1800, -200, 400], radius: 260, color: [0.4, 0.4, 0.4], desc: "Dead world, aftermath of an ancient cataclysm", texture: 'Ash planet texture.png' },
    { name: "Bloom", position: [700, 700, -300], radius: 170, color: [1.0, 0.7, 0.9], desc: "Garden paradise with eternal spring", texture: 'Bloom planet texture.png' },
    { name: "Cobalt", position: [-1400, 0, -800], radius: 310, color: [0.3, 0.5, 0.8], desc: "Military outpost guarding the frontier", texture: 'Cobalt Planet texture.png' },
    { name: "Amber", position: [2200, -500, 200], radius: 195, color: [1.0, 0.6, 0.0], desc: "Preserved in time, fossil world of prehistory", texture: 'Amber Planet texture.png' },
    { name: "Slate", position: [-700, 300, 1800], radius: 340, color: [0.5, 0.6, 0.6], desc: "Rocky mining world with deep canyon networks", texture: 'Slate planet texture.png' },
    { name: "Vermillion", position: [1400, 400, -1400], radius: 215, color: [0.8, 0.2, 0.3], desc: "Blood-red world, site of legendary battles", texture: 'Vermillion Planet texture.png' },
    //{ name: "Horizon", position: [-2000, -100, -500], radius: 360, color: [0.4, 0.6, 0.7], desc: "Frontier world on the edge of known space", texture: null },
    { name: "Horzland", position: [8000, 7500, 1500], radius: 1000, color: [0.0, 1.0, 0.5], desc: "The legendary hidden world, birthplace of the ancients", texture: 'Horzland planet texture.png' },
    { name: "The Secret", position: [50000, 50, 500000], radius: 750, color: [0.18, 0.06, 0.36], desc: "A hidden, shadowed world whispered about in legends", texture: 'The secret planet texture.png' },
    {name: "Realism Test", position: [3000, 1000, 4000],radius: 5000, color: [0.5, 0.5, 0.5], desc: "realistic size", texture: 'Coral Planet texture.png' },
    */ // removed for test
    // Newly added planet: Assaulted
    {name: "inner zephyr", position: [10000,1000,7500],radius: 2500, color: [0.8, 0.3, 0.8], desc: "zephyr surface", texture: 'inner Zephyr.png', spin: 1, dps: 10000000000 },
    { name: "Zephyr", position: [10000, 1000, 7500], radius: 3000, color: [0.8, 0.3, 0.8], desc: "zephyr atmosphere", texture: 'Zephyr planet texture.png', spin: 1,dps: 0.1 },
    { name: "Crimson Prime", position: [12000, 2000, -15000], radius: 2500, color: [0.9, 0.2, 0.2], desc: "War-torn capital of the Red Dominion", texture: 'Crimson_Prime Planet texture.png', spin: 1, dps: 10000000000 },
    { name: "Aqualis", position: [-8000, -1000, 15000], radius: 3500, color: [0.2, 0.6, 0.9], desc: "Ocean world with endless depths", texture: 'Aqualis Planet texture.png', spin: 0.001, dps: 1000000000 },
    { name: "Verdant", position: [5000, 3000, -12000], radius: 2000, color: [0.3, 0.8, 0.3], desc: "Jungle planet teeming with exotic life", texture: 'Verdant planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Aurion", position: [-15000, 1000, 8000], radius: 4000, color: [1.0, 0.8, 0.2], desc: "Golden desert world of ancient ruins", texture: 'Aurion Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Nyx", position: [20000, -4000, 3000], radius: 1800, color: [0.1, 0.1, 0.3], desc: "Perpetual night world, home to shadow dwellers", texture: 'Nyx planet texture.png', spin: 0.001, dps: 1000000000 },
    { name: "Ember", position: [-6000, 5000, -9000], radius: 2200, color: [1.0, 0.4, 0.1], desc: "Volcanic hellscape with rivers of lava", texture: 'Ember Planet texture.png', spin: 0.001, dps: 1000000000 },
    { name: "Glacius", position: [18000, 1000, 12000], radius: 3200, color: [0.7, 0.9, 1.0], desc: "Frozen wasteland of crystalline ice", texture: 'Glacius Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Titanforge", position: [-11000, -3000, -15000], radius: 4500, color: [0.5, 0.5, 0.6], desc: "Industrial mega-world, forges of the empire", texture:  'Titanforge planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Lumina", position: [9000, 6000, 6000], radius: 1500, color: [1.0, 1.0, 0.7], desc: "Radiant beacon world, center of enlightenment", texture: 'Lumina Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Obsidian", position: [-22000, 2000, 1000], radius: 2800, color: [0.2, 0.2, 0.2], desc: "Dark mining colony extracting rare minerals", texture: 'Obsidian Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Coral", position: [3000, -2000, -1800], radius: 1900, color: [1.0, 0.5, 0.6], desc: "Living planet covered in pink coral reefs", texture: 'Coral planet texture.png', spin: 0.001, dps: 10000000000 },
    {name: "inner stratos", position: [-13000, 400, 1100], radius: 2200, color: [0.6, 0.7, 0.9], desc: "Stratos surface", texture: 'inner stratos.png', spin: 0.001, dps: 10000000000 },
    { name: "Stratos", position: [-13000, 400, 1100], radius: 2700, color: [0.6, 0.7, 0.9], desc: "Sky cities floating in endless clouds", texture: 'Stratos planet texture.png', spin: 0.001,dps: 0.1},
    { name: "Inferno", position: [1600, -100, -7000], radius: 2400, color: [0.9, 0.3, 0.0], desc: "Scorched world orbiting twin suns", texture: 'Inferno Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Jade", position: [-500, -500, 2000], radius: 2100, color: [0.2, 0.7, 0.4], desc: "Peaceful farming world, breadbasket of the sector", texture: 'Jade planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Celestia", position: [2500, 300, 900], radius: 3800, color: [0.9, 0.8, 1.0], desc: "Ethereal realm where reality bends", texture: 'Celestia Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Rust", position: [-900, 100, -1100], radius: 2300, color: [0.7, 0.4, 0.2], desc: "Abandoned mechanical world, ruins of AI civilization", texture: 'Rust Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Sapphire", position: [1100, -300, 1600], radius: 2900, color: [0.2, 0.4, 0.9], desc: "Rich world of crystalline deposits and gems", texture: 'Sapphire Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Ash", position: [-1800, -200, 400], radius: 2600, color: [0.4, 0.4, 0.4], desc: "Dead world, aftermath of an ancient cataclysm", texture: 'Ash planet texture.png', spin: 0.001, dps: 1000000000 },
    { name: "Bloom", position: [700, 700, -300], radius: 1700, color: [1.0, 0.7, 0.9], desc: "Garden paradise with eternal spring", texture: 'Bloom planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Cobalt", position: [-1400, 1000, -800], radius: 3100, color: [0.3, 0.5, 0.8], desc: "Military outpost guarding the frontier", texture: 'Cobalt Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Amber", position: [2200, -500, 200], radius: 1950, color: [1.0, 0.6, 0.0], desc: "Preserved in time, fossil world of prehistory", texture: 'Amber Planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Slate", position: [-700, 300, 1800], radius: 3400, color: [0.5, 0.6, 0.6], desc: "Rocky mining world with deep canyon networks", texture: 'Slate planet texture.png', spin: 0.001, dps: 10000000000 },
    { name: "Vermillion", position: [1400, 400, -1400], radius: 2150, color: [0.8, 0.2, 0.3], desc: "Blood-red world, site of legendary battles", texture: 'Vermillion Planet texture.png', spin: 0.001, dps: 10000000000 },
    //{ name: "Horizon", position: [-2000, -100, -500], radius: 360, color: [0.4, 0.6, 0.7], desc: "Frontier world on the edge of known space", texture: null },
    { name: "Horzland", position: [80000, 75000, 15000], radius: 10000, color: [0.0, 1.0, 0.5], desc: "The legendary hidden world, birthplace of the ancients", texture: 'Horzland planet texture.png',spin: 1, dps: 1000000000 },
    { name: "The Secret", position: [50000, 50, 500000], radius: 750, color: [0.18, 0.06, 0.36], desc: "A hidden, shadowed world whispered about in legends", texture: 'The secret planet texture.png', dps: 0},
    
    { name: "Horseland", position: [600000, 75000, 15000], radius: 500000, color: [0.0, 1.0, 0.5], desc: "HORSELAND", texture: 'Horzland planet texture.png',spin: 0.0001, dps: 1000000000000000 },
    {name: "Horzland atmosphere", position: [80000,75000,15000], radius: 10250, color: [0.5, 0.7, 1.0], desc: "the sky", spin: 0.0001, dps: 0.0000000000000000001 },
    
    { name: "Titanforge 2000", position: [0, 50000, -15000], radius: 20000, color: [0.5, 0.5, 0.6], desc: "Industrial mega-world, forges of the empire", texture:  'Titanforge planet texture.png', dps: 1000000000 },
    //secret radius: 7500 originally
    { name: "Assaulted", position: [-3000, 2000, 13000], radius: 400, color: [0.6, 0.2, 0.2], desc: "A recently assaulted world scarred by bombardment", texture: 'Assaulted planet texture.png ',dps: 0} // no damage because it is testing world

];
// Create sphere buffers for each planet (positions, normals, uvs, colors, indices)
const planetBuffers = planets.map(planet => {
    const sphere = createSphere(planet.radius, 48, planet.color); // higher-res spheres

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    // Optional texture loading if planet.texture is provided
    let texture = null;
    if (planet.texture) {
        texture = gl.createTexture();
        const img = new Image();
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            // Handle NPOT textures: only use REPEAT + mipmaps for POT
            function isPowerOfTwo(v) { return (v & (v - 1)) === 0; }
            const pot = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
            if (pot) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                console.log('Loaded POT planet texture for', planet.name);
                planet._textureStatus = 'POT';
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                console.warn('Loaded NPOT planet texture for', planet.name, '; using CLAMP_TO_EDGE and no mipmaps.');
                planet._textureStatus = 'NPOT';
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        // Try multiple candidate paths before falling back to a placeholder.
        const candidatePaths = [
            '../planet textures/' + planet.texture,
            'planet textures/' + planet.texture,
            planet.texture
        ];
        let candidateIndex = 0;

        img.onerror = () => {
            if (candidateIndex < candidatePaths.length) {
                const next = candidatePaths[candidateIndex++];
                try { img.src = encodeURI(next); } catch (e) { img.src = next; }
                return; // try next path
            }

            console.warn('Failed to load planet texture for', planet.name, 'from', planet.texture);
            // Create a small POT placeholder (128x128) with a visible checker pattern so planet won't appear dark
            try {
                const c = document.createElement('canvas');
                c.width = 128; c.height = 128;
                const ctx = c.getContext('2d');
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        ctx.fillStyle = ((x + y) % 2 === 0) ? '#334455' : '#77aacc';
                        ctx.fillRect(x * 16, y * 16, 16, 16);
                    }
                }
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.bindTexture(gl.TEXTURE_2D, null);
                planet._textureStatus = 'placeholder';
                console.warn('Using placeholder POT texture for', planet.name);
            } catch (err) {
                console.error('Failed to create placeholder texture for', planet.name, err);
                planet._textureStatus = 'missing';
            }
        };

        // Start with the first candidate path
        try { img.src = encodeURI(candidatePaths[candidateIndex++]); } catch (e) { img.src = candidatePaths[candidateIndex - 1]; }
    }

    return {
        positionBuffer,
        normalBuffer,
        uvBuffer,
        colorBuffer,
        indexBuffer,
        indexCount: sphere.indices.length,
        texture
    };
});

// Stars: simple point cloud background
const STAR_COUNT = 600;
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
    // Spread stars widely around the scene
    const range = 60000;
    const x = (Math.random() * 2 - 1) * range;
    const y = (Math.random() * 2 - 1) * range;
    const z = (Math.random() * 2 - 1) * range;
    starPositions[i*3+0] = x;
    starPositions[i*3+1] = y;
    starPositions[i*3+2] = z;
    // Slight color variation
    const t = Math.random();
    starColors[i*3+0] = 0.8 + 0.2 * t;
    starColors[i*3+1] = 0.8 + 0.2 * Math.random();
    starColors[i*3+2] = 0.8 + 0.2 * Math.random();
}
const starPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);
const starColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, starColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, starColors, gl.STATIC_DRAW);

// Massive luminous objects (e.g. stars) that can kill or damage the ship on contact

// Added Antares per user request: yellow, not lethal, high DPS drain
const massiveObjects = [
    { name: 'Antares', position: [-400000, -10000, -150000], radius: 50000, color: [1.0, 1.0, 0], lethal: false, dps: 10000000000000000, emissive: 0.8 },//yellow-white star similar to our sun.Luminosity:0.8
//    {name: 'Talrion', position: [-300000, -5000, -200000], radius: 60000, color: [1.0, 0.0, 0.0], lethal: false, dps: 10000000000000000, emissive: 0.2 }, //reddish star
    { name: 'Talmera', position: [-100000, 10000, 200000], radius: 75000, color: [0.5, 0.5, 1.0], lethal: true, dps: 10000000000000000, emissive: 1.0 } //bluish-white hot star. Luminosity:1.0
] 
const massiveBuffers = massiveObjects.map(obj => {
    const sphere = createSphere(obj.radius, 32, obj.color);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.uvs, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    return {
        positionBuffer,
        normalBuffer,
        uvBuffer,
        colorBuffer,
        indexBuffer,
        indexCount: sphere.indices.length
    };
});

// Get attribute locations
const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');
const aNormal = gl.getAttribLocation(program, 'aNormal');
const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');

// Get uniform locations
const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
const uViewMatrix = gl.getUniformLocation(program, 'uViewMatrix');
const uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
const uLightDir = gl.getUniformLocation(program, 'uLightDir');
const uTexture = gl.getUniformLocation(program, 'uTexture');
const uHasTexture = gl.getUniformLocation(program, 'uHasTexture');
const uEmissive = gl.getUniformLocation(program, 'uEmissive');
const uPointSize = gl.getUniformLocation(program, 'uPointSize');

// Matrix utilities
function makeProjectionMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ]);
}

function identity() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

function translate(matrix, x, y, z) {
    const result = new Float32Array(matrix);
    result[12] += x;
    result[13] += y;
    result[14] += z;
    return result;
}

function rotateY(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);
    
    const m0 = result[0], m2 = result[2];
    const m4 = result[4], m6 = result[6];
    const m8 = result[8], m10 = result[10];
    
    result[0] = m0 * c - m8 * s;
    result[2] = m2 * c - m10 * s;
    result[4] = m4 * c - m8 * s;
    result[6] = m6 * c - m10 * s;
    result[8] = m0 * s + m8 * c;
    result[10] = m2 * s + m10 * c;
    
    return result;
}

function rotateX(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);
    
    const m4 = result[4], m5 = result[5], m6 = result[6];
    const m8 = result[8], m9 = result[9], m10 = result[10];
    
    result[4] = m4 * c + m8 * s;
    result[5] = m5 * c + m9 * s;
    result[6] = m6 * c + m10 * s;
    result[8] = m8 * c - m4 * s;
    result[9] = m9 * c - m5 * s;
    result[10] = m10 * c - m6 * s;
    
    return result;
}

// Keyboard handlers
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
    // Universe map debug zoom keys
    if (window.showUniverseMap) {
        if (e.key && (e.key === 'U' || e.key === 'u')) {
            universeMapZoom *= 0.6;
        
            universeMapZoom = Math.max(0.01, Math.min(20, universeMapZoom));
            e.preventDefault();
        } else if (e.key && (e.key === 'O' || e.key === 'o')) {
            universeMapZoom *= 1.5;
            universeMapZoom = Math.max(0.01, Math.min(20, universeMapZoom));
            e.preventDefault();
        }
    }
    // Toggle universe map with 'J'
    if (e.key && e.key.toLowerCase() === 'j') {
        window.showUniverseMap = !window.showUniverseMap;
        e.preventDefault();
    }
    // Hold 'C' to enable combat mode while held
    if (e.key && e.key.toLowerCase() === 'c') {
        try {
            window.combatModeActive = true;
        } catch (err) { console.warn('Failed to set combatModeActive on keydown C', err); }
        e.preventDefault();
    }
});
// Universe map camera state
window.showUniverseMap = false;
let universeMapZoom = 1.0;
let universeMapYaw = 0;
let universeMapPitch = 0;
let universeMapLastX = 0, universeMapLastY = 0, universeMapDragging = false;
universeMapZoom =10; // start zoomed out for better overview of planets
// Mouse controls for universe map
canvas.addEventListener('wheel', (e) => {
    if (window.showUniverseMap) {
        universeMapZoom *= (e.deltaY > 0) ? 1.5 : 0.6;
        universeMapZoom = Math.max(0.01, Math.min(20, universeMapZoom));
        console.log('[UniverseMap] Zoom changed:', universeMapZoom);
        e.preventDefault();
    } else {
        e.preventDefault();
        spaceship.speed += e.deltaY * -0.001;
        spaceship.speed = Math.max(spaceship.minSpeed, Math.min(spaceship.maxSpeed, spaceship.speed));
    }
});
canvas.addEventListener('mousedown', (e) => {
    if (window.showUniverseMap) {
        universeMapDragging = true;
        universeMapLastX = e.clientX;
        universeMapLastY = e.clientY;
        e.preventDefault();
    }
});
canvas.addEventListener('mouseup', (e) => { universeMapDragging = false; });
canvas.addEventListener('mouseleave', (e) => { universeMapDragging = false; });
canvas.addEventListener('mousemove', (e) => {
    if (window.showUniverseMap && universeMapDragging) {
        universeMapYaw += (e.clientX - universeMapLastX) * 0.01;
        universeMapPitch += (e.clientY - universeMapLastY) * 0.01;
        universeMapPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, universeMapPitch));
        universeMapLastX = e.clientX;
        universeMapLastY = e.clientY;
        console.log('[UniverseMap] Orbit changed: yaw', universeMapYaw, 'pitch', universeMapPitch);
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
    // Release 'C' to exit combat mode
    if (e.key && e.key.toLowerCase() === 'c') {
        try { window.combatModeActive = false; } catch (err) { console.warn('Failed to clear combatModeActive on keyup C', err); }
        e.preventDefault();
    }
});

// Listen for 'E' to dock/undock (separate so we don't have to add 'e' to keys map)
document.addEventListener('keydown', (e) => {
    if (e.key && e.key.toLowerCase() === 'e') {
        // If we're docked, undock; else if there's a nearby machinist, dock
        if (isDocked) {
            isDocked = false;
            dockedPlanet = null;
        } else if (dockNearbyPlanet) {
            isDocked = true;
            dockedPlanet = dockNearbyPlanet;
        }
        e.preventDefault();
    }
});

// Mouse wheel handler for speed control
canvas.addEventListener('wheel', (e) => {
    if (!window.showUniverseMap) {
        e.preventDefault();
        spaceship.speed += e.deltaY * -0.001;
        spaceship.speed = Math.max(spaceship.minSpeed, Math.min(spaceship.maxSpeed, spaceship.speed));
    }
});

// Update spaceship based on keyboard input
function updateSpaceship() {
    // Rotation controls (WASD or Arrow keys)
    if (keys.a || keys.ArrowLeft) {
        spaceship.rotation[1] += spaceship.rotationSpeed; // Now turns right
    }
    if (keys.d || keys.ArrowRight) {
        spaceship.rotation[1] -= spaceship.rotationSpeed; // Now turns left
    }
    if (keys.s || keys.ArrowDown) {
        spaceship.rotation[0] -= spaceship.rotationSpeed; // Pitch down
    }
    if (keys.w || keys.ArrowUp) {
        spaceship.rotation[0] += spaceship.rotationSpeed; // Pitch up
    }
    if (keys.Shift) { alert('The game is currently paused.'); keys.Shift = false; }
    // Clamp pitch to avoid flipping and keep camera/ship consistent (limit to ±45°)
    spaceship.rotation[0] = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, spaceship.rotation[0]));
    
    // Move forward in the direction the ship is facing
    const dirX = Math.sin(spaceship.rotation[1]) * Math.cos(spaceship.rotation[0]);
    const dirY = -Math.sin(spaceship.rotation[0]);
    const dirZ = Math.cos(spaceship.rotation[1]) * Math.cos(spaceship.rotation[0]);
    
    spaceship.position[0] += dirX * spaceship.speed;
    spaceship.position[1] += dirY * spaceship.speed;
    spaceship.position[2] += dirZ * spaceship.speed;
}

// Spaceship line (box) from spawn to Horzland
const horzlandPos = [8000, 7500, 1500];
const lineWidth = 50; // thickness of the box/line

// Compute direction and length
function normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len, v[1]/len, v[2]/len];
}
function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}
function add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function scale(v, s) { return [v[0]*s, v[1]*s, v[2]*s]; }
// Linear interpolate between two 3D points
function lerpVec(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Rotate vector `v` around unit `axis` by `angle` radians (Rodrigues' rotation formula)
function rotateVecAroundAxis(v, axis, angle) {
    const ux = axis[0], uy = axis[1], uz = axis[2];
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    // v_parallel = (u . v) * u
    const dot = ux * v[0] + uy * v[1] + uz * v[2];
    const vParallel = [ux * dot, uy * dot, uz * dot];
    // v_perp = v - v_parallel
    const vPerp = [v[0] - vParallel[0], v[1] - vParallel[1], v[2] - vParallel[2]];
    // v_cross = u x v
    const vCross = [uy * v[2] - uz * v[1], uz * v[0] - ux * v[2], ux * v[1] - uy * v[0]];
    return [
        vParallel[0] + vPerp[0] * cosA + vCross[0] * sinA,
        vParallel[1] + vPerp[1] * cosA + vCross[1] * sinA,
        vParallel[2] + vPerp[2] * cosA + vCross[2] * sinA
    ];
}

const start = [0, 0, 0];
const end = horzlandPos;
const dir = normalize(sub(end, start));
const len = Math.sqrt((end[0])**2 + (end[1])**2 + (end[2])**2);
// Find a vector perpendicular to dir for thickness (use Y axis unless parallel)
let up = [0, 1, 0];
if (Math.abs(dir[1]) > 0.99) up = [1, 0, 0];
const side = normalize(cross(dir, up));
const upVec = normalize(cross(side, dir));
const halfW = lineWidth / 2;

// 8 corners of the box
const corners = [
    add(add(start, scale(side, halfW)), scale(upVec, halfW)),
    add(add(start, scale(side, halfW)), scale(upVec, -halfW)),
    add(add(start, scale(side, -halfW)), scale(upVec, -halfW)),
    add(add(start, scale(side, -halfW)), scale(upVec, halfW)),
    add(add(end, scale(side, halfW)), scale(upVec, halfW)),
    add(add(end, scale(side, halfW)), scale(upVec, -halfW)),
    add(add(end, scale(side, -halfW)), scale(upVec, -halfW)),
    add(add(end, scale(side, -halfW)), scale(upVec, halfW)),
];
// 12 triangles (2 per face)
const lineBoxVertices = new Float32Array([
    // near face
    ...corners[0], ...corners[1], ...corners[2], ...corners[0], ...corners[2], ...corners[3],
    // far face
    ...corners[4], ...corners[5], ...corners[6], ...corners[4], ...corners[6], ...corners[7],
    // left face
    ...corners[0], ...corners[3], ...corners[7], ...corners[0], ...corners[7], ...corners[4],
    // right face
    ...corners[1], ...corners[2], ...corners[6], ...corners[1], ...corners[6], ...corners[5],
    // top face
    ...corners[0], ...corners[1], ...corners[5], ...corners[0], ...corners[5], ...corners[4],
    // bottom face
    ...corners[3], ...corners[2], ...corners[6], ...corners[3], ...corners[6], ...corners[7],
]);
const lineBoxColors = new Float32Array(Array(lineBoxVertices.length/3).fill().flatMap(() => [1.0, 1.0, 0.0])); // yellow
const lineBoxBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBoxBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lineBoxVertices, gl.STATIC_DRAW);
const lineBoxColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBoxColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lineBoxColors, gl.STATIC_DRAW);

// --- Add at the top of the file ---
let lastDamageTime = performance.now();
let lastFrameTime = performance.now();
// Store last used matrices for UI projection
let lastViewMatrix = null;
let lastProjectionMatrix = null;
let gameOver = false;
let currentWeapon = 1; // 1=machine gun, 2=ion beam, 3=fusion bomb
const weaponNames = [null, 'Machine Gun', 'Ion Beam', 'Fusion Bomb'];
let projectiles = [];
let lastShotTime = 0;
// Debug: track when machine visuals are drawn (throttled) and scale multiplier
let lastMachineDrawLogTime = 0;
const BULLET_VISUAL_SCALE = 20; // multiplier for machine visual size
// Command/feature flags (can be toggled via console or gameCommand)
window.horzlandCoinSpawningEnabled = false; // default: disabled
// Pickups (repair packs, etc.)
let pickups = [];
// Generic world entities (spawned chains, debris, etc.)
let entities = [];
// Has the initial "Begin game" alert been shown?
let gameStartAlertShown = false;
// Has the initial "Begin game" alert been shown? (no debug teleport flag)

// Helper: create a machinist torus planet and register it
function createMachinist(position, radius) {
    const name = 'The Machinist';
    const color = [0.6, 0.6, 0.65];
    const desc = 'A mechanical torus world that periodically generates repair packs.';
    const planet = { name, position: position.slice(), radius, color, desc, machinist: true, lastRepairSpawn: 0 };
    planets.push(planet);
    // Ensure planetBuffers stays in sync (push placeholder)
    planetBuffers.push(null);
    return planet;
}

// Helper: create torus geometry buffers (positions, normals, uvs, colors, indices)
function createTorusBuffers(radialSegments=48, tubularSegments=24, majorRadius=1.0, tubeRadius=0.3, color=[0.6,0.6,0.65]) {
    const verts = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    for (let j = 0; j <= radialSegments; j++) {
        const v = j / radialSegments * Math.PI * 2;
        const cosV = Math.cos(v), sinV = Math.sin(v);
        for (let i = 0; i <= tubularSegments; i++) {
            const u = i / tubularSegments * Math.PI * 2;
            const cosU = Math.cos(u), sinU = Math.sin(u);
            const x = (majorRadius + tubeRadius * cosU) * cosV;
            const y = tubeRadius * sinU;
            const z = (majorRadius + tubeRadius * cosU) * sinV;
            verts.push(x, y, z);
            // normal: vector from tube center to vertex (unnormalized)
            const nx = cosU * cosV;
            const ny = sinU;
            const nz = cosU * sinV;
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
            normals.push(nx/len, ny/len, nz/len);
            uvs.push(i / tubularSegments, j / radialSegments);
            colors.push(color[0], color[1], color[2]);
        }
    }
    const indices = [];
    for (let j = 0; j < radialSegments; j++) {
        for (let i = 0; i < tubularSegments; i++) {
            const a = (tubularSegments + 1) * j + i;
            const b = (tubularSegments + 1) * (j + 1) + i;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    // Create GL buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        positionBuffer,
        normalBuffer,
        uvBuffer,
        colorBuffer,
        indexBuffer,
        indexCount: indices.length
    };
}

// Place a medium machinist station in orbit around Horzland (preset: radius=150, altitude=200)
(function placeMachinistAroundHorzland() {
    const horz = planets.find(p => p.name && p.name.toLowerCase() === 'horzland');
    if (!horz) return;
    const altitude = 500; // height above Horzland surface
    const stationRadius = 150; // medium preset
    // Simple fixed orbit position: offset along +X from planet center
    const stationPos = [horz.position[0] + (horz.radius + altitude), horz.position[1], horz.position[2]];
    const planet = createMachinist(stationPos, stationRadius);
    // Configure simple orbit parameters so the station actually orbits Horzland
    planet.orbitCenter = horz.position.slice();
    planet.orbitRadius = horz.radius + altitude;
    // initial angle (0 corresponds to +X offset used above)
    planet.orbitAngle = 0;
    // radians per second (tweakable): slow, pleasant orbit
    planet.orbitSpeed = 0.012; // ~0.69 degrees/sec
    // Build torus buffers for this planet (unit majorRadius=1.0, tube ratio chosen then scale by planet.radius in model)
    const tube = Math.max(planet.radius * 0.22, 30);
    const tubeRatio = tube / planet.radius;
    const torusBuffers = createTorusBuffers(48, 24, 1.0, tubeRatio, planet.color);
    // Load machinist texture from project `planet textures` folder
    // Use the user's updated machinist texture if present
    const texPath = '../planet textures/New Machinist texture.png';
    const img = new Image();
    img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        // Handle NPOT (non-power-of-two) textures: WebGL requires POT for REPEAT and mipmaps
        function isPowerOfTwo(v) { return (v & (v - 1)) === 0; }
        const pot = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
        if (pot) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            console.log('Machinist texture is POT; using REPEAT + mipmaps');
        } else {
            // NPOT: clamp to edge and use linear filtering without mipmaps
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            console.warn('Machinist texture is NPOT; using CLAMP_TO_EDGE and no mipmaps. To enable tiling/mipmaps, resize to power-of-two dimensions.');
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        // attach texture to this planet's buffers
        torusBuffers.texture = tex;
        console.log('Loaded machinist texture and applied to station');
    };
    img.onerror = () => { console.warn('Machinist texture not found at', texPath); };
    try { img.src = encodeURI(texPath); } catch (e) { img.src = texPath; }

    // Store buffers in planetBuffers at the corresponding index
    const idx = planets.indexOf(planet);
    if (idx >= 0) planetBuffers[idx] = torusBuffers;
    console.log('Placed machinist station (medium) around Horzland at', stationPos);
})();
// Place a small machinist station in orbit around Assaulted (small preset)
(function placeMachinistAroundAssaulted() {
    const assaulted = planets.find(p => p.name && p.name.toLowerCase() === 'assaulted');
    if (!assaulted) return;
    const altitude = 100; // small height above Assaulted surface
    const stationRadius = 80; // small preset
    // Simple fixed orbit position: offset along +X from planet center
    const stationPos = [assaulted.position[0] + (assaulted.radius + altitude), assaulted.position[1], assaulted.position[2]];
    const planet = createMachinist(stationPos, stationRadius);
    // Configure simple orbit parameters so the station actually orbits Assaulted
    planet.orbitCenter = assaulted.position.slice();
    planet.orbitRadius = assaulted.radius + altitude;
    // initial angle (0 corresponds to +X offset used above)
    planet.orbitAngle = 0;
    // radians per second: slightly faster orbit for a small station
    planet.orbitSpeed = 0.025;
    // Build torus buffers for this planet and scale appropriately
    const tube = Math.max(planet.radius * 0.18, 12);
    const tubeRatio = tube / planet.radius;
    const torusBuffers = createTorusBuffers(36, 18, 1.0, tubeRatio, planet.color);

    // Load machinist texture (reuse same machinist texture if present)
    const texPath = '../planet textures/New Machinist texture.png';
    const img = new Image();
    img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        function isPowerOfTwo(v) { return (v & (v - 1)) === 0; }
        const pot = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
        if (pot) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            console.warn('Machinist texture is NPOT; using CLAMP_TO_EDGE and no mipmaps.');
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        torusBuffers.texture = tex;
    };
    img.onerror = () => { console.warn('Machinist texture not found at', texPath); };
    try { img.src = encodeURI(texPath); } catch (e) { img.src = texPath; }

    // Store buffers in planetBuffers at the corresponding index
    const idx = planets.indexOf(planet);
    if (idx >= 0) planetBuffers[idx] = torusBuffers;
    console.log('Placed machinist station (small) around Assaulted at', stationPos);
})();

// Spawn an initial chain around Assaulted so it exists by default
(function placeInitialBoxChain() {
    // Tighter chain: closer altitude and more boxes so items are closer together
    const chain = spawnBoxChainAroundPlanet('Assaulted', { count: 12, altitude: 60, orbitSpeed: 0.2, boxSize: 22, color: [0.5,0.5,0.55] });
    if (chain) console.log('Spawned initial box chain around Assaulted (tighter spacing, visible speed)');
})();

// Spawn a circular chain of gray box entities around a given center position (or planet)
function spawnBoxChain(centerOrPos, opts) {
    opts = opts || {};
    const count = opts.count || 8;
    const orbitRadius = typeof opts.orbitRadius === 'number' ? opts.orbitRadius : (opts.planetRadius ? opts.planetRadius + 120 : 600);
    // orbitSpeed is in radians/sec. Clamp to a sane global maximum to avoid runaway values.
    const DEFAULT_ORBIT_SPEED = 0.02;
    const MAX_ORBIT_SPEED_GLOBAL = 2 * Math.PI; // 1 rev/sec (radians/sec)
    const orbitSpeedRaw = typeof opts.orbitSpeed === 'number' ? Math.abs(opts.orbitSpeed) : DEFAULT_ORBIT_SPEED;
    const orbitSpeed = Math.min(orbitSpeedRaw, MAX_ORBIT_SPEED_GLOBAL);
    const boxSize = typeof opts.boxSize === 'number' ? opts.boxSize : 20;
    const color = opts.color || [0.6,0.6,0.6];
    console.log(orbitSpeed)
    // centerOrPos may be a planet object or a position array
    let centerPos = [0,0,0];
    if (Array.isArray(centerOrPos)) centerPos = centerOrPos.slice();
    else if (centerOrPos && centerOrPos.position) centerPos = centerOrPos.position.slice();

    // random unit axis helper
    const randUnit = () => {
        let v = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
        const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) || 1;
        return [v[0]/len, v[1]/len, v[2]/len];
    };
    const chain = {
        type: 'boxChain',
        centerRef: centerOrPos && centerOrPos.position ? centerOrPos : null,
        centerPos: centerPos,
        count: count,
        orbitRadius: orbitRadius,
        baseOrbitRadius: orbitRadius,
        _orbitSpeed: orbitSpeed, // internal storage for accessor (radians/sec)
        orbitDirection: (typeof opts.orbitDirection === 'number') ? (opts.orbitDirection >= 0 ? 1 : -1) : (Math.random() < 0.5 ? 1 : -1),
        orbitAxis: opts.orbitAxis || randUnit(),
        boxSize: boxSize,
        color: color,
        orbitAngle: opts.startAngle || Math.random() * Math.PI * 2,
        baseAngleOffset: opts.baseAngleOffset || 0,
        lastRevolutionCount: Math.floor((opts.startAngle || Math.random() * Math.PI * 2) / (2 * Math.PI)),
        formationStride: opts.formationStride || 3
    };
    // Define an accessor so assignments to `orbitSpeed` are clamped and logged for debugging.
    try {
        const MAX_ORBIT_SPEED_GLOBAL = 2 * Math.PI;
        Object.defineProperty(chain, 'orbitSpeed', {
            configurable: true,
            enumerable: true,
            get: function() { return this._orbitSpeed; },
            set: function(v) {
                const incoming = Number(v) || 0;
                const clamped = Math.min(Math.abs(incoming), MAX_ORBIT_SPEED_GLOBAL);
                if (clamped !== incoming) console.warn('orbitSpeed assignment clamped from', incoming, 'to', clamped);
                if (clamped > 3.0) {
                    console.warn('Suspicious orbitSpeed set (>3.0):', incoming, '->', clamped, 'entity=', this);
                    try { throw new Error('orbitSpeed set stack'); } catch (e) { console.log(e.stack); }
                }
                this._orbitSpeed = clamped;
            }
        });
    } catch (e) { console.warn('defineProperty orbitSpeed failed', e); }
    entities.push(chain);
    return chain;
}

// Helper: spawn a box chain around a planet specified by name (case-insensitive)
function spawnBoxChainAroundPlanet(planetName, opts) {
    if (!planetName) return null;
    const p = planets.find(pl => pl.name && pl.name.toLowerCase() === String(planetName).toLowerCase());
    if (!p) return null;
    opts = opts || {};
    // default orbit radius: just outside planet surface
    if (typeof opts.orbitRadius !== 'number') opts.orbitRadius = p.radius + (opts.altitude || 120);
    opts.planetRadius = p.radius;
    return spawnBoxChain(p, opts);
}

// Expose spawn helper globally so you can spawn chains from console/commands
window.spawnBoxChain = spawnBoxChain;
window.spawnBoxChainAroundPlanet = spawnBoxChainAroundPlanet;
// Render function
function render() {
        // Universe map mode
        if (window.showUniverseMap) {
            console.log('[UniverseMap] Render: zoom', universeMapZoom, 'yaw', universeMapYaw, 'pitch', universeMapPitch);
            // Clear
            gl.clearColor(0.05, 0.05, 0.12, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            // Setup projection
            const proj = makeProjectionMatrix(Math.PI/4, canvas.width/canvas.height, 0.1, 10000000.0);
            gl.uniformMatrix4fv(uProjectionMatrix, false, proj);
            // Camera orbit
            const R = 1.5 * planets.reduce((a, p) => Math.max(a, Math.hypot(...p.position) + p.radius), 0) / universeMapZoom;
            const camX = Math.cos(universeMapYaw) * Math.cos(universeMapPitch) * R;
            const camY = Math.sin(universeMapPitch) * R;
            const camZ = Math.sin(universeMapYaw) * Math.cos(universeMapPitch) * R;
            const center = [0,0,0];
            const up = [0,1,0];
            const view = lookAt([camX, camY, camZ], center, up);
            gl.uniformMatrix4fv(uViewMatrix, false, view);
            // Draw all planets as spheres
            for (let i = 0; i < planets.length; ++i) {
                const planet = planets[i];
                let model = identity();
                model = translate(model, planet.position[0], planet.position[1], planet.position[2]);
                gl.uniformMatrix4fv(uModelMatrix, false, model);
                gl.uniform3fv(uLightDir, new Float32Array([0.3,0.6,0.7]));
                gl.uniform1i(uHasTexture, 0);
                gl.uniform1f(uEmissive, 0.0);
                // Color
                gl.bindBuffer(gl.ARRAY_BUFFER, planetBuffers[i].colorBuffer);
                gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aColor);
                // Position
                gl.bindBuffer(gl.ARRAY_BUFFER, planetBuffers[i].positionBuffer);
                gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPosition);
                // Normal
                gl.bindBuffer(gl.ARRAY_BUFFER, planetBuffers[i].normalBuffer);
                gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aNormal);
                gl.disableVertexAttribArray(aTexCoord);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetBuffers[i].indexBuffer);
                gl.drawElements(gl.TRIANGLES, planetBuffers[i].indexCount, gl.UNSIGNED_SHORT, 0);
            }
            // Optionally: draw planet names in 2D overlay (not implemented here)
            // Optionally: draw ship as a small marker
            return;
        }
        // ...existing code...
    // Per-frame timing
    const now = performance.now();
    // cap dtFrame to avoid huge updates after tab switching or a long pause
    const dtFrame = Math.min(Math.max(0, (now - lastFrameTime) / 1000), 0.1);
    lastFrameTime = now;

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Update spaceship (skip while docked)
    if (!isDocked) updateSpaceship();

    // Planet damage + machinist station collision handling
    // Also compute nearby machinist for docking prompt (do this before collision pushes)
    let insidePlanet = false;
    dockNearbyPlanet = null;
    for (const planet of planets) {
        const dx = spaceship.position[0] - planet.position[0];
        const dy = spaceship.position[1] - planet.position[1];
        const dz = spaceship.position[2] - planet.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        // Detect nearby machinist for docking (range larger than collision radius)
        if (planet.machinist) {
            const dockingRange = planet.radius + 120; // how close you need to be to dock
            if (dist < dockingRange) {
                dockNearbyPlanet = planet;
            }
            // Special handling for machinist torus stations: approximate as a collision sphere
            const stationCollisionRadius = planet.radius + 40; // buffer around ring
            if (!isDocked && dist < stationCollisionRadius) {
                // Avoid divide-by-zero
                let nx = dx, ny = dy, nz = dz;
                if (dist > 1e-6) {
                    nx /= dist; ny /= dist; nz /= dist;
                } else {
                    nx = 1; ny = 0; nz = 0;
                }
                const penetration = stationCollisionRadius - dist;
                // Push the ship out of the station collision sphere
                spaceship.position[0] += nx * penetration;
                spaceship.position[1] += ny * penetration;
                spaceship.position[2] += nz * penetration;

                // If the ship hits the station at high speed, apply damage
                // Apply damage on high-speed impacts, but do not modify ship speed (no slowdown)
                if (spaceship.speed > 6) {
                    spaceship.hp -= (spaceship.speed * 8) * dtFrame;
                    if (spaceship.hp < 0) spaceship.hp = 0;
                }
            }
            continue;
        }

        if (dist < planet.radius) {
            insidePlanet = true;
            break;
        }
    }
    if (insidePlanet && spaceship.hp > 0) {
        // Find which planet the ship is inside for correct DPS
        let damagingPlanet = null;
        for (const planet of planets) {
            const dx = spaceship.position[0] - planet.position[0];
            const dy = spaceship.position[1] - planet.position[1];
            const dz = spaceship.position[2] - planet.position[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < planet.radius) { damagingPlanet = planet; break; }
        }
        let dps = damagingPlanet && damagingPlanet.dps ? damagingPlanet.dps : 50;
        spaceship.hp -= dps * dtFrame;
        if (spaceship.hp < 0) spaceship.hp = 0;
    }
    
    // Log position every frame
   // console.log('Ship position:', spaceship.position[0].toFixed(2), spaceship.position[1].toFixed(2), spaceship.position[2].toFixed(2));
    
    // Update and draw projectiles (skip updating while docked)
    if (!isDocked) updateProjectiles();
    drawProjectiles();
    
    // Setup projection matrix
    const projectionMatrix = makeProjectionMatrix(
        Math.PI / 4,
        canvas.width / canvas.height,
        0.1,
        1000000.0
    );
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    
    // Setup view matrix (camera at fixed offset from spaceship)
    const cameraX = spaceship.position[0];
    const cameraY = spaceship.position[1] + 1.5;
    const cameraZ = spaceship.position[2] + 5;
    
    // (startup teleport removed)

    // Compute view matrix from camera position + base rotations + ship rotations
    const viewMatrix = computeViewMatrix();
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
    // Save matrices for UI projection
    lastViewMatrix = viewMatrix;
    lastProjectionMatrix = projectionMatrix;
    // Draw star background as GL_POINTS (small, emissive)
    gl.uniform1f(uPointSize, 2.0);
    // Ensure stars are drawn in world coordinates without any leftover model transform
    gl.uniformMatrix4fv(uModelMatrix, false, identity());
    gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, starColorBuffer);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    // Disable normals/uvs for point rendering
    gl.disableVertexAttribArray(aNormal);
    gl.disableVertexAttribArray(aTexCoord);
    gl.uniform1i(uHasTexture, 0);
    gl.uniform1f(uEmissive, 1.2);
    gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
    // reset point size
    gl.uniform1f(uPointSize, 1.0);
    
    // Setup model matrix (spaceship stays at origin in camera space, just rotates)
    let modelMatrix = identity();
    modelMatrix = translate(modelMatrix, spaceship.position[0], spaceship.position[1], spaceship.position[2]);
    modelMatrix = rotateY(modelMatrix, spaceship.rotation[1]);
    modelMatrix = rotateX(modelMatrix, spaceship.rotation[0]);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
    // Set lighting (directional light in world space)
    const lightDir = normalize([0.3, 0.6, 0.7]);
    gl.uniform3fv(uLightDir, new Float32Array(lightDir));

    // Bind/draw spaceship: use external model if loaded, otherwise use built-in buffers
    if (loadedShipModel) {
        const b = loadedShipModel;
        // Debug: inspect loaded model and attribute locations (temporary)
        if (typeof console !== 'undefined' && !loadedShipModel._debugLogged) {
            console.log('--- loadedShipModel debug ---', b);
            console.log('attrib locs: aPosition=', aPosition, 'aColor=', aColor, 'aNormal=', aNormal, 'aTexCoord=', aTexCoord);
            console.log('buffers: position=', !!b.positionBuffer, 'color=', !!b.colorBuffer, 'normal=', !!b.normalBuffer, 'uv=', !!b.uvBuffer, 'indexCount=', b.indexCount, 'vertexCount=', b.vertexCount);
            loadedShipModel._debugLogged = true;
        }
        // positions
        if (b.positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.positionBuffer);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosition);
        } else {
            gl.disableVertexAttribArray(aPosition);
        }
        // colors
        if (b.colorBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.colorBuffer);
            gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aColor);
        } else {
            gl.disableVertexAttribArray(aColor);
        }
        // normals
        if (b.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.normalBuffer);
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aNormal);
        } else {
            gl.disableVertexAttribArray(aNormal);
        }
        // uvs / texture support (optional)
        if (b.uvBuffer && b.texture) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.uvBuffer);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, b.texture);
            gl.uniform1i(uTexture, 0);
            gl.uniform1i(uHasTexture, 1);
        } else {
            gl.disableVertexAttribArray(aTexCoord);
            gl.uniform1i(uHasTexture, 0);
        }
        gl.uniform1f(uEmissive, 0.0);
        if (b.indexBuffer && b.indexCount) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.indexBuffer);
            // Debug: log draw call parameters (temporary)
            if (typeof console !== 'undefined') console.log('drawElements -> count=', b.indexCount);
            gl.drawElements(gl.TRIANGLES, b.indexCount, gl.UNSIGNED_SHORT, 0);
            if (typeof console !== 'undefined') console.log('gl.getError()=', gl.getError());
        } else {
            const vcount = b.vertexCount || (b.positionBuffer && b.positionBuffer._numItems) || 0;
            if (vcount > 0) {
                if (typeof console !== 'undefined') console.log('drawArrays -> vcount=', vcount);
                gl.drawArrays(gl.TRIANGLES, 0, vcount);
                if (typeof console !== 'undefined') console.log('gl.getError()=', gl.getError());
            }
        }
    } else {
        // fallback to built-in procedural ship
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);

        gl.disableVertexAttribArray(aNormal);
        gl.disableVertexAttribArray(aTexCoord);
        gl.uniform1i(uHasTexture, 0);
        gl.uniform1f(uEmissive, 0.0);

        gl.drawArrays(gl.TRIANGLES, 0, spaceshipVertices.length / 3);
    }
    
    // Update orbits for machinist stations so they move around their host planet
    // Pause orbit updates while docked to freeze the world while in the UI
    if (!isDocked) {
        planets.forEach(planet => {
            if (planet.machinist && planet.orbitCenter && typeof planet.orbitSpeed === 'number') {
                planet.orbitAngle = (planet.orbitAngle || 0) + planet.orbitSpeed * dtFrame;
                const r = planet.orbitRadius || (planet.radius + 200);
                const cx = planet.orbitCenter[0];
                const cy = planet.orbitCenter[1];
                const cz = planet.orbitCenter[2];
                // Simple equatorial orbit in XZ plane (can later add inclination)
                planet.position[0] = cx + Math.cos(planet.orbitAngle) * r;
                planet.position[1] = cy; // keep same altitude
                planet.position[2] = cz + Math.sin(planet.orbitAngle) * r;
            }
        });
        // Update generic entity orbits (e.g., box chains)
        entities.forEach(ent => {
            if (!ent) return;
            // advance angle using direction; orbitSpeed stores magnitude
            // Protect against runaway speeds (clamp applied speed)
            const RAW_SPEED = Math.abs(ent.orbitSpeed) || 0.04;
            // Distance-based safe caps (radians/sec) to reduce frenzy when player is nearby.
            // nearCap: strict cap when very close; farCap: allowed max when player is far away.
            const nearCap = 0.6;   // ~0.1 rev/s
            const farCap = 1.5;    // ~0.24 rev/s
            const capDist = 1200;  // distance at which cap interpolates to farCap
            let appliedMax = farCap;
            try {
                const center = ent.centerRef && ent.centerRef.position ? ent.centerRef.position : ent.centerPos || [0,0,0];
                const dx = (spaceship.position[0] || 0) - (center[0] || 0);
                const dy = (spaceship.position[1] || 0) - (center[1] || 0);
                const dz = (spaceship.position[2] || 0) - (center[2] || 0);
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
                // interpolate cap between nearCap and farCap based on distance
                const t = Math.max(0, Math.min(1, dist / capDist));
                appliedMax = nearCap + (farCap - nearCap) * t;
            } catch (e) { /* ignore distance errors */ }
            const appliedSpeed = Math.min(RAW_SPEED, appliedMax);
            ent.orbitAngle = (ent.orbitAngle || 0) + (ent.orbitDirection || 1) * appliedSpeed * dtFrame;
            // detect completed revolution and, if so, reverse direction and pick a new random axis
            const rev = Math.floor(ent.orbitAngle / (2 * Math.PI));
            if (typeof ent.lastRevolutionCount === 'number' && rev !== ent.lastRevolutionCount) {
                const prevRev = ent.lastRevolutionCount;
                const revDelta = rev - prevRev;
                ent.lastRevolutionCount = rev;
                // If we've only advanced by one revolution since last frame, reverse direction.
                // If multiple revolutions occurred in one frame (due to a large delta), skip reversing
                // to avoid rapid back-and-forth jitter. Still apply a small axis jitter to vary the path.
                if (Math.abs(revDelta) === 1) {
                    ent.orbitDirection = -(ent.orbitDirection || 1);
                }
                // choose a new random axis (small jitter instead of fully random if provided)
                const jitter = () => (Math.random() * 2 - 1) * 0.6;
                const nx = (ent.orbitAxis && ent.orbitAxis[0]) ? ent.orbitAxis[0] + jitter() : (Math.random()*2-1);
                const ny = (ent.orbitAxis && ent.orbitAxis[1]) ? ent.orbitAxis[1] + jitter() : (Math.random()*2-1);
                const nz = (ent.orbitAxis && ent.orbitAxis[2]) ? ent.orbitAxis[2] + jitter() : (Math.random()*2-1);
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                ent.orbitAxis = [nx/len, ny/len, nz/len];
                // small radius tweak around the original base radius to avoid perfectly repeating orbits
                // Use baseOrbitRadius so the radius doesn't accumulate over time.
                if (typeof ent.baseOrbitRadius === 'number') {
                    const jitterFactor = 0.97 + Math.random() * 0.06; // range ~0.97..1.03
                    ent.orbitRadius = ent.baseOrbitRadius * jitterFactor;
                } else {
                    ent.orbitRadius = ent.orbitRadius * (0.95 + Math.random() * 0.1);
                }
            } else if (typeof ent.lastRevolutionCount !== 'number') {
                ent.lastRevolutionCount = Math.floor(ent.orbitAngle / (2 * Math.PI));
            }
        });
    }

    // Set star uniforms for lighting (Antares and Talmera)
    const star1 = massiveObjects[0];
    const star2 = massiveObjects[1];
    if (star1 && star2) {
        gl.uniform3fv(gl.getUniformLocation(program, 'uStar1Pos'), new Float32Array(star1.position));
        gl.uniform3fv(gl.getUniformLocation(program, 'uStar1Color'), new Float32Array(star1.color));
        gl.uniform1f(gl.getUniformLocation(program, 'uStar1Radius'), star1.radius);
        gl.uniform3fv(gl.getUniformLocation(program, 'uStar2Pos'), new Float32Array(star2.position));
        gl.uniform3fv(gl.getUniformLocation(program, 'uStar2Color'), new Float32Array(star2.color));
        gl.uniform1f(gl.getUniformLocation(program, 'uStar2Radius'), star2.radius);
    }
    // Draw all planets
    planets.forEach((planet, index) => {
        // --- Planet spin logic ---
        let spinKey = '__spinAngle';
        planet[spinKey] = (planet[spinKey] || 0) + (planet.spin || 0) * (window.dtFrame || 0.016);

        // Make Horzland atmosphere semi-transparent
        let overrideAlpha = 1.0;
        if (planet.name && planet.name.toLowerCase().includes('horzland atmosphere')) {
            overrideAlpha = 0.35; // Set desired transparency here
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        } else {
            gl.disable(gl.BLEND);
        }

        // If this planet is marked as a machinist, draw a torus model
        if (planet.machinist) {
            const buffers = planetBuffers[index];
            const model = identity();
            let m = translate(model, planet.position[0], planet.position[1], planet.position[2]);
            // Apply spin (Y axis)
            m = rotateY(m, planet[spinKey]);
            // Scale so the torus major radius matches planet.radius
            const major = planet.radius;
            m = scaleMatrix(m, major, major, major);
            gl.uniformMatrix4fv(uModelMatrix, false, m);

            if (buffers) {
                // Bind position
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
                gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPosition);
                // Bind color
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
                gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aColor);
                // Normals
                if (buffers.normalBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
                    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(aNormal);
                } else {
                    gl.disableVertexAttribArray(aNormal);
                }
                // UVs
                if (buffers.uvBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvBuffer);
                    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(aTexCoord);
                } else {
                    gl.disableVertexAttribArray(aTexCoord);
                }
                // Texture
                if (buffers.texture) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
                    gl.uniform1i(uTexture, 0);
                    gl.uniform1i(uHasTexture, 1);
                } else {
                    gl.uniform1i(uHasTexture, 0);
                }

                // Draw
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
                gl.uniform1f(uEmissive, 0.0);
                gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);

                if (buffers.texture) gl.bindTexture(gl.TEXTURE_2D, null);
            } else {
                // fallback: immediate draw
                const tube = Math.max(planet.radius * 0.22, 30);
                gl.disableVertexAttribArray(aNormal);
                gl.disableVertexAttribArray(aTexCoord);
                gl.uniform1i(uHasTexture, 0);
                drawTorus(planet.color, 48, 24, 1.0, tube / major);
            }
            return;
        }

        const buffers = planetBuffers[index];

        let planetMatrix = identity();
        planetMatrix = translate(planetMatrix, planet.position[0], planet.position[1], planet.position[2]);
        // Apply spin (Y axis)
       // planetMatrix = rotateY(planetMatrix, planet[spinKey]); //uncomment to enable planet spin
        gl.uniformMatrix4fv(uModelMatrix, false, planetMatrix);

        // Bind planet position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Bind planet color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);
        // Set alpha uniform
        gl.uniform1f(gl.getUniformLocation(program, 'uOverrideAlpha'), overrideAlpha);

        // Bind normals
        if (buffers.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aNormal);
        } else {
            gl.disableVertexAttribArray(aNormal);
        }
        // Bind UVs
        if (buffers.uvBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvBuffer);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
        } else {
            gl.disableVertexAttribArray(aTexCoord);
        }
        // Bind texture if present
        if (buffers && buffers.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
            gl.uniform1i(uTexture, 0);
            gl.uniform1i(uHasTexture, 1);
        } else {
            gl.uniform1i(uHasTexture, 0);
        }

        // Bind planet index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        // All planets: no special emissive for Nyx
        gl.uniform1f(gl.getUniformLocation(program, 'uEmissive'), 0.0);
        gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
        // Unbind texture for cleanliness
        if (buffers && buffers.texture) {
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    });

    // Draw entity chains (box chains, debris, etc.)
    try {
        entities.forEach(ent => {
            if (!ent || ent.type !== 'boxChain') return;
            // determine center position (support planet refs or fixed centers)
            const center = ent.centerRef && ent.centerRef.position ? ent.centerRef.position : ent.centerPos;
            const cx = center[0], cy = center[1], cz = center[2];
            const count = ent.count || 8;
            const r = ent.orbitRadius || 600;
            const boxSize = ent.boxSize || 20;
            for (let i = 0; i < count; i++) {
                // formation offsets to make boxes look like a military formation
                const row = Math.floor(i / (ent.formationStride || 3));
                const lane = i % (ent.formationStride || 3);
                const laneOffset = (lane - Math.floor((ent.formationStride || 3) / 2)) * (boxSize * 0.35);
                const rowAngleOffset = row * 0.035 * (ent.orbitDirection || 1);
                const baseAngle = ent.orbitAngle + (i / count) * Math.PI * 2 + rowAngleOffset + (ent.baseAngleOffset || 0);
                // Compute rotated vector around arbitrary axis
                const baseVec = [r + laneOffset, 0, 0];
                const vec = rotateVecAroundAxis(baseVec, ent.orbitAxis || [0,1,0], baseAngle);
                const x = cx + vec[0];
                const y = cy + vec[1] + (row * (boxSize * 0.12));
                const z = cz + vec[2];
                let m = identity();
                m = translate(m, x, y, z);
                // orient box to face along orbit tangent for formation feel
                const orient = baseAngle + (i * 0.15);
                m = rotateY(m, orient);
                m = scaleMatrix(m, boxSize, boxSize, boxSize);
                gl.uniformMatrix4fv(uModelMatrix, false, m);
                drawBox(ent.color || [0.6,0.6,0.6]);
               
            }
            // console.log(orbitSpeed)
        });
    } catch(e) { console.warn('draw entities failed', e); }

    // Massive luminous objects: apply damage on contact and render them emissively
    // Damage check
    for (const obj of massiveObjects) {
        const dx = spaceship.position[0] - obj.position[0];
        const dy = spaceship.position[1] - obj.position[1];
        const dz = spaceship.position[2] - obj.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < obj.radius) {
            if (obj.lethal) {
                spaceship.hp = 0;
            } else {
                spaceship.hp -= (obj.dps || 250) * dtFrame;
                if (spaceship.hp < 0) spaceship.hp = 0;
            }
        }
    }

    // Render massive objects (emissive spheres)
    massiveObjects.forEach((obj, index) => {
        const buffers = massiveBuffers[index];
        let m = identity();
        m = translate(m, obj.position[0], obj.position[1], obj.position[2]);
        gl.uniformMatrix4fv(uModelMatrix, false, m);

        // Positions
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);
        // Colors
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);
        // Normals
        if (buffers.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aNormal);
        } else {
            gl.disableVertexAttribArray(aNormal);
        }
        // UVs
        if (buffers.uvBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvBuffer);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
        } else {
            gl.disableVertexAttribArray(aTexCoord);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        // Set emissive strength for this object
        gl.uniform1f(uEmissive, obj.emissive || 1.0);
        gl.uniform1i(uHasTexture, 0);
        gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
    });

    // Regenerate repair packs on machinist planets every 15s if none present
    const RESPAWN_MS = 15000;
    planets.forEach(planet => {
        if (!planet.machinist) return;
        planet.lastRepairSpawn = planet.lastRepairSpawn || 0;
        // Check if a repair pickup is already near this planet
        const hasPickup = pickups.some(p => {
            const dx = p.position[0] - planet.position[0];
            const dy = p.position[1] - planet.position[1];
            const dz = p.position[2] - planet.position[2];
            return Math.sqrt(dx*dx + dy*dy + dz*dz) < (planet.radius + 120);
        });
        if (!hasPickup && (now - planet.lastRepairSpawn) >= RESPAWN_MS) {
            // spawn repair pack slightly above planet surface
            const spawnPos = [planet.position[0], planet.position[1] + planet.radius + 40, planet.position[2]];
            pickups.push({ type: 'repair', position: spawnPos, spawnTime: now });
            planet.lastRepairSpawn = now;
            console.log('Spawned repair pack at', spawnPos, 'for', planet.name);
        }
    });

    // Spawn coins around Horzland periodically
    // Coin tiers: bronze=1, silver=10, gold=100, green=1000
    (function spawnHorzlandCoins() {
        // Spawning around Horzland is gated by `window.horzlandCoinSpawningEnabled`.
        // This keeps the original logic intact while allowing runtime toggling.
        if (!window.horzlandCoinSpawningEnabled) return;
        const COIN_RESPAWN_MS = 12000; // every 12s
        // store last spawn time on Horzland planet object
        const horz = planets.find(p => p.name && p.name.toLowerCase() === 'horzland');
        if (!horz) return;
        horz._lastCoinSpawn = horz._lastCoinSpawn || 0;
        if ((now - horz._lastCoinSpawn) < COIN_RESPAWN_MS) return;

        // ensure we don't overcrowd: count existing coins near Horzland
        const nearbyCoins = pickups.filter(p => p.type === 'coin' && (() => {
            const dx = p.position[0] - horz.position[0];
            const dy = p.position[1] - horz.position[1];
            const dz = p.position[2] - horz.position[2];
            return Math.sqrt(dx*dx + dy*dy + dz*dz) < (horz.radius + 2000);
        })()).length;
        if (nearbyCoins > 40) {
            horz._lastCoinSpawn = now; // postpone
            return;
        }

        // Spawn a small cluster of coins (3..8)
        const spawnCount = 3 + Math.floor(Math.random() * 6);
        for (let i = 0; i < spawnCount; i++) {
            // random spherical position around planet within [radius+50 .. radius+800]
            const r = horz.radius + 50 + Math.random() * 750;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() * 2 - 1) * Math.PI/2; // +/- 90deg
            const x = horz.position[0] + r * Math.cos(phi) * Math.cos(theta);
            const y = horz.position[1] + r * Math.sin(phi);
            const z = horz.position[2] + r * Math.cos(phi) * Math.sin(theta);

            // Choose tier by weighted probability
            const rnd = Math.random();
            let tier = 'bronze', value = 1, color = [0.65,0.45,0.2];
            if (rnd < 0.60) { tier = 'bronze'; value = 1; color = [0.65,0.45,0.2]; }
            else if (rnd < 0.85) { tier = 'silver'; value = 10; color = [0.6,0.6,0.6]; }
            else if (rnd < 0.97) { tier = 'gold'; value = 100; color = [0.0,0.7,0.0]; }
            else { tier = 'diamond'; value = 1000; color = [0.2,0.5,1.0]; }

            // avoid placing too close to existing pickups
            const hasNearby = pickups.some(p => {
                const dx = p.position[0] - x;
                const dy = p.position[1] - y;
                const dz = p.position[2] - z;
                return Math.sqrt(dx*dx + dy*dy + dz*dz) < 40;
            });
            if (hasNearby) continue;

            // include animation state: scale and collecting flag
            pickups.push({ type: 'coin', tier, value, color, position: [x,y,z], spawnTime: now, scale: 1.0, collecting: false, spin: Math.random() * Math.PI * 2 });
        }
        horz._lastCoinSpawn = now;
    })();

    // Draw pickups and handle collection (with lerp attraction for coins)
    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];

        // Calculate distance to ship for attraction/collection decisions
        const dx0 = spaceship.position[0] - p.position[0];
        const dy0 = spaceship.position[1] - p.position[1];
        const dz0 = spaceship.position[2] - p.position[2];
        let dist = Math.sqrt(dx0*dx0 + dy0*dy0 + dz0*dz0);

        // Coin-specific attraction: start collecting (lerping) when within attract radius
        const ATTRACT_RADIUS = 200; // start moving toward player
        const COLLECTION_RADIUS = 250; // finalize collection when within 150 units
        if (p.type === 'coin') {
            if (!p.collecting && dist < ATTRACT_RADIUS) {
                p.collecting = true;
            }
            if (p.collecting) {
                // lerp the coin position toward the ship for a smooth magnet effect
                p.position = lerpVec(p.position, spaceship.position, 0.12);
                // grow the coin slightly as it approaches
                const targetScale = 1.8;
                p.scale = (p.scale || 1.0) + (targetScale - (p.scale || 1.0)) * 0.22;
                // recompute distance after moving
                const ndx = spaceship.position[0] - p.position[0];
                const ndy = spaceship.position[1] - p.position[1];
                const ndz = spaceship.position[2] - p.position[2];
                dist = Math.sqrt(ndx*ndx + ndy*ndy + ndz*ndz);
            }
        }

        // update spin for coins and build transform so the disc rotates about its local Y
        if (p.type === 'coin') {
            p.spin = p.spin || 0;
            p.spin += 0.06; // slow spin per frame
        }

        let modelMatrix = identity();
        if (p.type === 'coin') {
            // apply rotation first so the coin spins in place, then translate
            modelMatrix = rotateY(modelMatrix, p.spin || 0);
            modelMatrix = translate(modelMatrix, p.position[0], p.position[1], p.position[2]);
        } else {
            modelMatrix = translate(modelMatrix, p.position[0], p.position[1], p.position[2]);
        }
        // scale depending on pickup type (coins use animated scale)
        if (p.type === 'repair') {
            modelMatrix = scaleMatrix(modelMatrix, 6, 6, 6);
        } else if (p.type === 'coin') {
            const baseScale = 8.0; // make coins larger for visibility
            const s = baseScale * (p.scale || 1.0);
            modelMatrix = scaleMatrix(modelMatrix, s, s, s);
        } else {
            modelMatrix = scaleMatrix(modelMatrix, 5, 5, 5);
        }
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        // small emissive sphere or stylized coin: color/shape depends on type
        gl.disableVertexAttribArray(aNormal);
        gl.disableVertexAttribArray(aTexCoord);
        gl.uniform1f(uEmissive, 1.0);
        if (p.type === 'repair') {
            drawSphere([0.0, 1.0, 0.3], 8, 8);
        } else if (p.type === 'coin') {
            // Render coins as flattened cylinders (short height, larger radius) to resemble coins
            // Start from the modelMatrix (which includes per-coin translation and scaling)
            // Apply an additional squash in Y so the cylinder becomes a thin disc
            const squash = 0.12; // thickness factor relative to radius
            let tm = scaleMatrix(modelMatrix, 1.0, squash, 1.0);
            // Rotate so the disc faces the camera similarly to previous torus orientation
            tm = rotateX(tm, Math.PI / 2);
            gl.uniformMatrix4fv(uModelMatrix, false, tm);
            // Draw a cylinder (which will be flattened by the model matrix). Use different
            // subdivisions and slight thickness tweaks per tier for distinction.
            if (p.tier === 'diamond') {
                // diamond: larger radius, slightly thicker
                drawFlatCylinder(p.color || [0.2, 0.5, 1.0], 36);
            } else if (p.tier === 'gold') {
                // gold (now green): medium radius
                drawFlatCylinder(p.color || [0.0, 0.7, 0.0], 32);
            } else if (p.tier === 'silver') {
                // silver: medium radius, tighter subdivisions
                drawFlatCylinder(p.color || [0.6,0.6,0.6], 28);
            } else {
                // bronze / default
                drawFlatCylinder(p.color || [0.65,0.45,0.2], 24);
            }
            // restore modelMatrix uniform for any subsequent draws
            gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        } else {
            drawSphere([1,1,1], 8, 8);
        }
        gl.uniform1f(uEmissive, 0.0);

        // Check collection (finalize when within COLLECTION_RADIUS)
        if (dist < COLLECTION_RADIUS) {
            // collect
            if (p.type === 'repair') {
                const heal = machinistHpRestore || 100;
                spaceship.hp = Math.min(spaceship.maxHp, spaceship.hp + heal);
                console.log('Collected repair pack: +' + heal + ' HP');
            } else if (p.type === 'coin') {
                // Guard against overflow when credits have been set to the credits-infinity sentinel
                if (credits === CREDITS_INFINITY) {
                    console.log('Collected coin:', p.tier, '+', (p.value || 1), 'credits (already ∞)');
                } else {
                    credits = Math.min(CREDITS_INFINITY, (credits || 0) + (p.value || 1));
                    console.log('Collected coin:', p.tier, '+', (p.value || 1), 'credits');
                }
            }
            pickups.splice(i, 1);
        }
    }
    

    // --- SANDBOX: Call your drawing playground here ---
    sandboxStack = [identity()];
    sandboxColor = [1,1,1];
    mySandboxDrawing();

    // Draw UI overlays (HP and Speed bars)
    drawUI();
    
    if (spaceship.hp <= 0 && !gameOver) {
        gameOver = true;
        try { playSfx('gameover'); } catch (e) {}
        try { stopMusic(); } catch (e) {}
        drawGameOver();
        return;
    }
    
    // Ambient far-sound: choose far variant by distance thresholds and loop it
    try {
        const TH1 = 500000;    // far1 threshold
        const TH2 = 1000000;   // far2 threshold
        const TH3 = 1500000;   // far3 threshold
        const pos = spaceship && spaceship.position ? spaceship.position : [0,0,0];
        const maxAbs = Math.max(Math.abs(pos[0]), Math.abs(pos[1]), Math.abs(pos[2]));
        let desiredIndex = -1;
        if (maxAbs > TH3) desiredIndex = 2;
        else if (maxAbs > TH2) desiredIndex = 1;
        else if (maxAbs > TH1) desiredIndex = 0;

        if (window.sfx && Array.isArray(window.sfx.far)) {
            for (let i = 0; i < window.sfx.far.length; i++) {
                const farAud = window.sfx.far[i];
                if (!farAud) continue;
                if (i === desiredIndex) {
                    if (!farAud._isLooping) {
                        farAud.loop = true;
                        try {
                            // slightly reduce volumes for far ambience; farther = a bit quieter
                            const volFactor = (i === 2) ? 0.5 : (i === 1) ? 0.55 : 0.6;
                            farAud.volume = (window.sfxVolume || 0.7) * volFactor;
                        } catch (e) {}
                        farAud.play().catch(() => {});
                        farAud._isLooping = true;
                    }
                } else {
                    if (farAud._isLooping) {
                        try { farAud.pause(); farAud.currentTime = 0; } catch (e) {}
                        farAud.loop = false;
                        farAud._isLooping = false;
                    }
                }
            }
        }
    } catch (e) { /* ignore ambient SFX errors */ }

    // Continue animation loop
    requestAnimationFrame(render);
}

// Draw UI elements (HP bar and Speed display)
function drawUI() {
    // Clear the UI canvas
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    // HP Bar
    const hpBarWidth = 200;
    const hpBarHeight = 25;
    const hpBarX = 20;
    const hpBarY = 20;
    // HP Bar background
    uiCtx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    uiCtx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    // HP Bar fill
    const INT32_MAX = 2147483647;
    const isInfiniteHp = (spaceship.maxHp === INT32_MAX);
    const hpPercentage = isInfiniteHp ? 1 : (spaceship.hp / spaceship.maxHp);
    const hpColor = hpPercentage > 0.5 ? '#00ff00' : hpPercentage > 0.25 ? '#ffaa00' : '#ff0000';
    uiCtx.fillStyle = hpColor;
    uiCtx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercentage, hpBarHeight);
    // HP Bar border
    uiCtx.strokeStyle = '#ffffff';
    uiCtx.lineWidth = 2;
    uiCtx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    // HP Text
    uiCtx.fillStyle = '#ffffff';
    uiCtx.font = '14px monospace';
    // If HP was set to INT32_MAX by the hidden exec, show it as infinity in the UI
    if (isInfiniteHp) {
        uiCtx.fillText(`HP: ∞`, hpBarX + 5, hpBarY + 17);
    } else {
        uiCtx.fillText(`HP: ${Math.floor(spaceship.hp)}/${spaceship.maxHp}`, hpBarX + 5, hpBarY + 17);
    }
    // Speed Display
    const speedKmPerSec = (spaceship.speed * 100000 * 60) / 1000;
    const speedBarY = hpBarY + hpBarHeight + 15;
    uiCtx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    uiCtx.fillRect(hpBarX, speedBarY, hpBarWidth, hpBarHeight);
    // Speed bar fill
    const speedPercentage = spaceship.speed / spaceship.maxSpeed;
    uiCtx.fillStyle = '#00aaff';
    uiCtx.fillRect(hpBarX, speedBarY, hpBarWidth * speedPercentage, hpBarHeight);
    // Speed bar border
    uiCtx.strokeStyle = '#ffffff';
    uiCtx.strokeRect(hpBarX, speedBarY, hpBarWidth, hpBarHeight);
    // Speed text
    uiCtx.fillStyle = '#ffffff';
    uiCtx.fillText(`Speed: ${speedKmPerSec.toFixed(0)} km/s`, hpBarX + 5, speedBarY + 17);
    // Weapon display
    uiCtx.font = '18px monospace';
    uiCtx.fillStyle = '#fff';
    uiCtx.fillText(`Weapon: ${weaponNames[currentWeapon]}`, hpBarX, speedBarY + hpBarHeight + 30);
    // Position (XYZ) display
    uiCtx.font = '14px monospace';
    uiCtx.fillStyle = '#ffffff';
    const pos = spaceship.position;
    // Show world coordinates with two decimal precision
    uiCtx.fillText(`Pos: X:${pos[0].toFixed(2)}  Y:${pos[1].toFixed(2)}  Z:${pos[2].toFixed(2)}`, hpBarX, speedBarY + hpBarHeight + 50);
    // Draw icon (if available). Use devicePixelRatio for crisper rendering on high-DPI displays.
    if (uiIconLoaded) {
        const dpr = window.devicePixelRatio || 1;
        const iconX = hpBarX + hpBarWidth + 10;
        const iconY = hpBarY;
        const iconSizeCSS = 48; // CSS pixels
        const drawSize = iconSizeCSS * dpr; // attempt to draw at DPR-scaled size if image is high-res
        uiCtx.drawImage(uiIcon, iconX, iconY, iconSizeCSS, iconSizeCSS);
    }

    // Transient music messages (shown for 1.8s). Prefer info messages (next track) over toggle.
    try {
        const now = performance.now();
        const visibleMs = 1800;
        let msgToShow = null;
        if (window.musicInfoMessage && window.musicInfoTime && (now - window.musicInfoTime) < visibleMs) {
            msgToShow = window.musicInfoMessage;
        } else if (window.musicToggleMessage && window.musicToggleTime && (now - window.musicToggleTime) < visibleMs) {
            msgToShow = window.musicToggleMessage;
        }
        if (msgToShow) {
            const msg = msgToShow;
            const w = 420; const h = 40;
            const x = (uiCanvas.width - w) / 2;
            const y = 80;
            uiCtx.save();
            uiCtx.globalCompositeOperation = 'source-over';
            uiCtx.fillStyle = 'rgba(0,0,0,0.6)';
            uiCtx.fillRect(x, y, w, h);
            uiCtx.strokeStyle = 'rgba(255,255,255,0.12)';
            uiCtx.strokeRect(x, y, w, h);
            uiCtx.fillStyle = '#ffffff';
            uiCtx.font = '18px monospace';
            uiCtx.textAlign = 'center';
            uiCtx.textBaseline = 'middle';
            uiCtx.fillText(msg, x + w/2, y + h/2);
            uiCtx.restore();
        }
    } catch (e) {}

    // Credits / token indicator (galaxy-like § symbol)
    // Place below the XYZ position display so it's easy to scan
    const tokenX = hpBarX; // left-aligned with HP/Speed UI
    const tokenY = speedBarY + hpBarHeight + 90; // below the Pos display (moved 30px lower)
    const tokenRadius = 24;

    // Radial gradient background to resemble a galaxy (slightly shifted up)
    const grad = uiCtx.createRadialGradient(tokenX + 8, tokenY - 8, 4, tokenX + 8, tokenY - 8, tokenRadius);
    grad.addColorStop(0, 'rgba(255,255,255,0.98)');
    grad.addColorStop(0.18, 'rgba(230,200,255,0.95)');
    grad.addColorStop(0.45, 'rgba(140,110,255,0.85)');
    grad.addColorStop(1, 'rgba(30,10,60,0.6)');

    uiCtx.save();
    uiCtx.beginPath();
    uiCtx.arc(tokenX + 8, tokenY - 8, tokenRadius, 0, Math.PI * 2);
    uiCtx.fillStyle = grad;
    uiCtx.fill();

    // Decorative star dots (subtle)
    uiCtx.fillStyle = 'rgba(255,255,220,0.9)';
    uiCtx.globalCompositeOperation = 'lighter';
    uiCtx.beginPath(); uiCtx.arc(tokenX - 4, tokenY - 14, 1.8, 0, Math.PI*2); uiCtx.fill();
    uiCtx.beginPath(); uiCtx.arc(tokenX + 18, tokenY - 18, 1.2, 0, Math.PI*2); uiCtx.fill();
    uiCtx.beginPath(); uiCtx.arc(tokenX + 20, tokenY + 2, 1.6, 0, Math.PI*2); uiCtx.fill();
    uiCtx.globalCompositeOperation = 'source-over';

    // Draw the § symbol with stronger styling so it's readable
    uiCtx.font = '28px serif';
    uiCtx.textAlign = 'center';
    uiCtx.textBaseline = 'middle';
    uiCtx.fillStyle = '#fff';
    uiCtx.shadowColor = 'rgba(120,90,255,0.9)';
    uiCtx.shadowBlur = 8;
    uiCtx.lineWidth = 2.5;
    uiCtx.strokeStyle = 'rgba(0,0,0,0.55)';
    uiCtx.fillText('§', tokenX + 8, tokenY - 10);
    uiCtx.strokeText('§', tokenX + 8, tokenY - 10);
    uiCtx.shadowBlur = 0;

    // Credits number to the right of the token
    uiCtx.font = '14px monospace';
    uiCtx.fillStyle = '#ffffff';
    uiCtx.textAlign = 'left';
    // Show infinity symbol if credits have been set to the credits-infinity sentinel
    if (credits === CREDITS_INFINITY) {
        uiCtx.fillText('∞', tokenX + tokenRadius*2 + 12, tokenY - 10);
    } else {
        uiCtx.fillText(credits.toString(), tokenX + tokenRadius*2 + 12, tokenY - 10);
    }
    uiCtx.restore();

    // If player is docked, draw full docking UI overlay and return
    if (isDocked) {
        uiCtx.save();
        // Grey background
        uiCtx.fillStyle = '#2f2f2f';
        uiCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

        // Left upgrades panel
        const leftX = 60;
        const leftY = 60;
        const leftW = uiCanvas.width - 420; // leave space for robot panel
        const leftH = uiCanvas.height - 140;
        uiCtx.fillStyle = '#1f1f1f';
        uiCtx.fillRect(leftX, leftY, leftW, leftH);
        uiCtx.strokeStyle = '#444';
        uiCtx.lineWidth = 2;
        uiCtx.strokeRect(leftX, leftY, leftW, leftH);

        // Upgrades title
        uiCtx.fillStyle = '#ffffff';
        uiCtx.font = '28px monospace';
        uiCtx.fillText('Upgrades', leftX + 20, leftY + 40);

        // Placeholder upgrade entries (replace later with real data)
        uiCtx.font = '18px monospace';
        const entryStartY = leftY + 80;
        const entryH = 44;
        const entries = ['Shield Boost - 500§', 'Engine Tuning - 1200§', 'Weapon Mod - 2000§'];
        for (let i = 0; i < entries.length; i++) {
            const y = entryStartY + i * (entryH + 8);
            uiCtx.fillStyle = 'rgba(255,255,255,0.06)';
            uiCtx.fillRect(leftX + 16, y, leftW - 40, entryH);
            uiCtx.fillStyle = '#fff';
            uiCtx.fillText(entries[i], leftX + 28, y + 28);
        }

        // Right robot panel
        const robotW = 300;
        const robotX = uiCanvas.width - robotW - 60;
        const robotY = leftY + 20;
        const robotH = Math.min(uiCanvas.height - 140, 520);
        uiCtx.fillStyle = '#bfbfbf';
        uiCtx.fillRect(robotX, robotY, robotW, robotH);
        uiCtx.strokeStyle = '#777';
        uiCtx.strokeRect(robotX, robotY, robotW, robotH);

        // Draw robot image centered in panel, leaving room for a desk the robot sits at
        const pad = 20;
        const deskHeight = 80;
        const imgW = robotW - pad*2;
        const imgH = Math.max(40, robotH - pad*2 - deskHeight); // leave space for desk
        const imgX = robotX + pad;
        const imgY = robotY + pad + 40; // moved robot image down 40px
        if (robotLoaded) {
            uiCtx.drawImage(robotImg, imgX, imgY, imgW, imgH);
        } else {
            uiCtx.fillStyle = '#333';
            uiCtx.font = '16px monospace';
            uiCtx.fillText('Robot image missing', robotX + 20, robotY + 40);
        }

        // Draw a desk below the robot so it appears to be sitting at it
        const deskX = robotX + 12;
        const deskW = robotW - 24;
        const deskY = robotY + robotH - deskHeight - 50;//37; // moved up 25px (was -12)
        // Wood gradient
        const deskGrad = uiCtx.createLinearGradient(deskX, deskY, deskX, deskY + deskHeight);
        deskGrad.addColorStop(0, '#b58145');
        deskGrad.addColorStop(0.5, '#8b5a2b');
        deskGrad.addColorStop(1, '#5a3a20');
        uiCtx.fillStyle = deskGrad;
        uiCtx.fillRect(deskX, deskY, deskW, deskHeight);
        // Desk top edge highlight
        uiCtx.strokeStyle = 'rgba(255,255,255,0.06)';
        uiCtx.lineWidth = 2;
        uiCtx.strokeRect(deskX, deskY, deskW, deskHeight);

        // Draw simple desk legs
        const legW = 12;
        const legH = 40;
        uiCtx.fillStyle = '#4a2f1a';
        uiCtx.fillRect(deskX + 12, deskY + deskHeight, legW, legH);
        uiCtx.fillRect(deskX + deskW - 12 - legW, deskY + deskHeight, legW, legH);

        // Draw small keyboard on desk
        const kbW = Math.min(160, deskW - 40);
        const kbH = 16;
        const kbX = deskX + (deskW - kbW) / 2;
        const kbY = deskY + 16;
        uiCtx.fillStyle = '#222';
        uiCtx.fillRect(kbX, kbY, kbW, kbH);
        uiCtx.fillStyle = '#444';
        for (let k = 0; k < 10; k++) {
            const keyW = (kbW - 12) / 10 - 4;
            const keyX = kbX + 6 + k * (keyW + 4);
            uiCtx.fillRect(keyX, kbY + 2, keyW, kbH - 4);
        }

        // Draw coffee mug on desk (simple circle + handle)
        const mugX = deskX + deskW - 48;
        const mugY = deskY + deskHeight / 2 - 6;
        uiCtx.fillStyle = '#e6e6e6';
        uiCtx.beginPath();
        uiCtx.ellipse(mugX, mugY, 10, 12, 0, 0, Math.PI * 2);
        uiCtx.fill();
        uiCtx.fillStyle = '#cfcfcf';
        uiCtx.beginPath();
        uiCtx.arc(mugX + 12, mugY, 4, -Math.PI/2, Math.PI/2);
        uiCtx.fill();

        // Instruction to undock
        uiCtx.fillStyle = '#ffffff';
        uiCtx.font = '16px monospace';
        uiCtx.textAlign = 'center';
        uiCtx.fillText("Press 'E' to return to the world", uiCanvas.width / 2, uiCanvas.height - 40);

        uiCtx.restore();
        return;
    }

    // Debug: show texture load status for planets (helpful to see POT/NPOT/missing)
    uiCtx.font = '12px monospace';
    uiCtx.fillStyle = '#ffffff';
    // Removed planet textures list from UI

    // If close to a machinist and not docked, show a small prompt
    if (dockNearbyPlanet && !isDocked) {
        uiCtx.save();
        uiCtx.fillStyle = 'rgba(0,0,0,0.6)';
        const w = 260, h = 36;
        const px = (uiCanvas.width - w) / 2;
        const py = uiCanvas.height - 120;
        uiCtx.fillRect(px, py, w, h);
        uiCtx.strokeStyle = '#fff';
        uiCtx.lineWidth = 1;
        uiCtx.strokeRect(px, py, w, h);
        uiCtx.fillStyle = '#fff';
        uiCtx.font = '16px monospace';
        uiCtx.textAlign = 'center';
        uiCtx.fillText("Press 'E' to dock", px + w/2, py + 22);
        uiCtx.restore();
    }

    // Draw Antares and Talmera starbursts (project world position to UI canvas)
    if (lastProjectionMatrix && lastViewMatrix && massiveObjects && massiveObjects.length > 0) {
        // Helper to draw a starburst for a given star object
        function drawStarburst(star) {
            const wp = star.position;
            const cam = cameraState.eye || [0,0,0];

            // --- Occlusion check: skip if any planet is between camera and star ---
            let occluded = false;
            if (typeof planets !== 'undefined' && Array.isArray(planets)) {
                const starVec = [wp[0] - cam[0], wp[1] - cam[1], wp[2] - cam[2]];
                const starDist = Math.sqrt(starVec[0]**2 + starVec[1]**2 + starVec[2]**2);
                for (let i = 0; i < planets.length; ++i) {
                    const planet = planets[i];
                    if (!planet || !planet.position || !planet.radius) continue;
                    // Vector from camera to planet center
                    const planetVec = [planet.position[0] - cam[0], planet.position[1] - cam[1], planet.position[2] - cam[2]];
                    const planetDist = Math.sqrt(planetVec[0]**2 + planetVec[1]**2 + planetVec[2]**2);
                    // Only consider planets closer than the star
                    if (planetDist >= starDist) continue;
                    // Project planet center onto camera-star line (parametric t)
                    const starDir = [starVec[0]/starDist, starVec[1]/starDist, starVec[2]/starDist];
                    const t = (planetVec[0]*starDir[0] + planetVec[1]*starDir[1] + planetVec[2]*starDir[2]);
                    // Closest point on line segment from camera to star
                    if (t < 0 || t > starDist) continue;
                    const closest = [cam[0] + starDir[0]*t, cam[1] + starDir[1]*t, cam[2] + starDir[2]*t];
                    const dx = planet.position[0] - closest[0];
                    const dy = planet.position[1] - closest[1];
                    const dz = planet.position[2] - closest[2];
                    const distToLine = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (distToLine < planet.radius * 1.05) { // 1.05 = small fudge for visual overlap
                        occluded = true;
                        break;
                    }
                }
            }
            if (occluded) return;

            const clip = projectToClip(wp, lastViewMatrix, lastProjectionMatrix);
            if (clip && clip[3] > 0) {
                const ndcX = clip[0] / clip[3];
                const ndcY = clip[1] / clip[3];
                const sx = (ndcX * 0.5 + 0.5) * uiCanvas.width;
                const sy = (1 - (ndcY * 0.5 + 0.5)) * uiCanvas.height;

                // Distance from camera to star to scale the effect
                const dx = cam[0] - wp[0];
                const dy = cam[1] - wp[1];
                const dz = cam[2] - wp[2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                // Size in pixels: scale by radius/dist with a clamp (made much larger)
                const sizePx = Math.max(120, (star.radius / Math.max(1, dist)) * Math.min(uiCanvas.width, uiCanvas.height) * 3.5);

                // Draw additive radial glow (multiple concentric gradients for stronger bloom)
                uiCtx.save();
                uiCtx.globalCompositeOperation = 'lighter';
                const r = Math.floor(star.color[0]*255);
                const g = Math.floor(star.color[1]*255);
                const b = Math.floor(star.color[2]*255);

                // Intense core: skip for Talmera, draw for others
                if (!(star.name && star.name.toLowerCase() === 'talmera')) {
                    const coreRadius = Math.max(16, sizePx * 0.18);
                    uiCtx.beginPath();
                    uiCtx.fillStyle = `rgba(${r},${g},${b},0.95)`;
                    uiCtx.arc(sx, sy, coreRadius, 0, Math.PI*2);
                    uiCtx.fill();
                }

                // Inner glow
                const grd1 = uiCtx.createRadialGradient(sx, sy, 0, sx, sy, sizePx * 0.6);
                grd1.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
                grd1.addColorStop(0.4, `rgba(${r},${g},${b},0.45)`);
                grd1.addColorStop(1, 'rgba(0,0,0,0)');
                uiCtx.fillStyle = grd1;
                uiCtx.beginPath();
                uiCtx.arc(sx, sy, sizePx * 0.6, 0, Math.PI*2);
                uiCtx.fill();

                // Outer halo
                const grd2 = uiCtx.createRadialGradient(sx, sy, sizePx * 0.6, sx, sy, sizePx * 1.8);
                grd2.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
                grd2.addColorStop(0.6, `rgba(${r},${g},${b},0.08)`);
                grd2.addColorStop(1, 'rgba(0,0,0,0)');
                uiCtx.fillStyle = grd2;
                uiCtx.beginPath();
                uiCtx.arc(sx, sy, sizePx * 1.8, 0, Math.PI*2);
                uiCtx.fill();

                // Animated starburst rays (more and stronger)
                const t = performance.now() * 0.0025;
                const rays = 24;
                for (let i = 0; i < rays; i++) {
                    const a = (i / rays) * Math.PI * 2 + t * (0.35 + (i%2 ? 0.08 : -0.04));
                    const inner = sizePx * (0.45 + 0.06 * Math.sin(t + i));
                    // Shorter outer length for subtler beams
                    const outer = sizePx * (1.15 + 0.5 * Math.sin(t * 0.6 + i));
                    const alpha = 0.18 + 0.14 * Math.abs(Math.sin(t + i));
                    uiCtx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                    uiCtx.lineWidth = 2 + (i % 4);
                    uiCtx.beginPath();
                    uiCtx.moveTo(sx + Math.cos(a) * inner, sy + Math.sin(a) * inner);
                    uiCtx.lineTo(sx + Math.cos(a) * outer, sy + Math.sin(a) * outer);
                    uiCtx.stroke();
                }

                uiCtx.restore();
            }
        }
        // Draw for Antares
        const antares = massiveObjects.find(s => s.name && s.name.toLowerCase() === 'antares');
        if (antares) drawStarburst(antares);
        // Draw for Talmera
        const talmera = massiveObjects.find(s => s.name && s.name.toLowerCase() === 'talmera');
        if (talmera) drawStarburst(talmera);
    }
}

// Helper: multiply 4x4 column-major matrix by vec4
function mulMat4Vec4(m, v) {
    return [
        m[0]*v[0] + m[4]*v[1] + m[8]*v[2] + m[12]*v[3],
        m[1]*v[0] + m[5]*v[1] + m[9]*v[2] + m[13]*v[3],
        m[2]*v[0] + m[6]*v[1] + m[10]*v[2] + m[14]*v[3],
        m[3]*v[0] + m[7]*v[1] + m[11]*v[2] + m[15]*v[3]
    ];
}

// Project world position to clip space using view and projection matrices
function projectToClip(worldPos, viewM, projM) {
    const mv = mulMat4Vec4(viewM, [worldPos[0], worldPos[1], worldPos[2], 1]);
    const clip = mulMat4Vec4(projM, mv);
    return clip;
}

// Draw game over screen
function drawGameOver() {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    uiCtx.fillStyle = 'rgba(0,0,0,0.7)';
    uiCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);
    uiCtx.fillStyle = '#ff3333';
    uiCtx.font = 'bold 64px monospace';
    uiCtx.textAlign = 'center';
    uiCtx.fillText('Game Over', uiCanvas.width / 2, uiCanvas.height / 2);
    uiCtx.font = '24px monospace';
    uiCtx.fillStyle = '#fff';
    uiCtx.fillText('press R to restart', uiCanvas.width / 2, uiCanvas.height / 2 + 60);
}

// Get ready for projectile rendering
function updateProjectiles() {
    const now = performance.now();
    projectiles = projectiles.filter(p => {
        // Move
        p.position[0] += p.velocity[0];
        p.position[1] += p.velocity[1];
        p.position[2] += p.velocity[2];
        // Lifetime
        if (now - p.spawnTime > p.lifetime) {
            try { if (p.type === 'fusion') playSfx('explosion'); } catch (e) {}
            return false;
        }
        // Splice / range limit: remove if traveled more than 1500 units from spawn
        if (p.startPosition) {
            const dxs = p.position[0] - p.startPosition[0];
            const dys = p.position[1] - p.startPosition[1];
            const dzs = p.position[2] - p.startPosition[2];
            if (dxs*dxs + dys*dys + dzs*dzs > 1500*1500) {
                try { if (p.type === 'fusion') playSfx('explosion'); } catch (e) {}
                return false;
            }
        }
        // Remove if far from player (for performance)
        const dx = p.position[0] - spaceship.position[0];
        const dy = p.position[1] - spaceship.position[1];
        const dz = p.position[2] - spaceship.position[2];
        if (dx*dx + dy*dy + dz*dz > 1e8) {
            try { if (p.type === 'fusion') playSfx('explosion'); } catch (e) {}
            return false;
        }
        return true;
    });
    // Expose the last pushed projectile for quick console inspection
    try { window._lastProjectile = projectiles[projectiles.length-1]; } catch(e) {}
}

// Global in-page command function. Call from browser console: `gameCommand('help')` or `gameCommand('toggle_spawner')`
window.gameCommand = function(cmdStr) {
    if (!cmdStr) return console.log('gameCommand: provide a command string, e.g. "help"');
    // Support alternative syntax like "TP:X Y Z" (case-insensitive)
    try {
        const colonMatch = cmdStr.trim().match(/^([A-Za-z]+)\s*:\s*(.*)$/);
        if (colonMatch && colonMatch[1].toLowerCase() === 'tp') {
            if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
            const rest = colonMatch[2].trim();
            const parts = rest.split(/\s+/);
            if (parts.length >= 3) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                const z = parseFloat(parts[2]);
                if ([x,y,z].some(v => Number.isNaN(v))) return console.log('TP: invalid coordinates');
                spaceship.position = [x, y, z];
                console.log('TP: teleported to', spaceship.position);
                return;
            } else {
                return console.log('TP usage: TP:X Y Z');
            }
        }
    } catch (e) { /* ignore and fall through to normal parsing */ }
    const args = cmdStr.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    // Gate privileged commands behind execMode. Allow 'exec' always.
    if (!window.execMode && cmd !== 'exec') {
        return console.log('Restricted: exec mode required (run exec to enable)');
    }
    if (cmd === 'help') {
        // Base help visible to everyone
        console.log('gameCommand: available commands: help, message <Exec_Name> <text>, music <play|stop|list|next>, credits <+|-|=> <number|inf>, speed <+|-|=> <number>, maxspeed <+|-|=> <number>, hp <+|-|=> <number|inf>, maxHp <+|-|=> <number|inf>, machinistHpRestore <+|-|=> <number>, tp, toggle_spawner, enable_spawner, disable_spawner, spawn_entity, clear_projectiles, set_bullet_scale <n>, dump_projectiles');
        // If Architect is authenticated, show admin commands (private)
        try {
            if (window.currentExecUser === 'Exec_Architect12134' && window.adminCommands) {
                const names = Object.keys(window.adminCommands || {});
                if (names.length > 0) {
                    console.log('Admin commands (Architect-only):');
                    names.forEach(n => {
                        const h = (window.adminCommands[n] && window.adminCommands[n].help) ? window.adminCommands[n].help : n;
                        console.log(' -', n + ':', h);
                    });
                }
            }
        } catch (e) {}
        return;
    }
    if (cmd === 'toggle_spawner') { window.horzlandCoinSpawningEnabled = !window.horzlandCoinSpawningEnabled; return console.log('horzlandCoinSpawningEnabled=', window.horzlandCoinSpawningEnabled); }
    if (cmd === 'enable_spawner') { window.horzlandCoinSpawningEnabled = true; return console.log('horzlandCoinSpawningEnabled=true'); }
    if (cmd === 'disable_spawner') { window.horzlandCoinSpawningEnabled = false; return console.log('horzlandCoinSpawningEnabled=false'); }
    if (cmd === 'spawn_entity') {
        // spawn a simple test entity near the ship
        const n = { type: 'entity', position: [spaceship.position[0]+50, spaceship.position[1], spaceship.position[2]+50], spawnTime: performance.now(), color: [1,0,0] };
        pickups.push(n); // reuse pickups array as a quick proof-of-concept entity container
        return console.log('spawned entity at', n.position);
    }

    if (cmd === 'chain_speed') {
        // Usage: chain_speed <planet|all|index> <speed>
        if (args.length < 3) return console.log('chain_speed usage: chain_speed <planet|all|index> <speed>');
        const target = args[1];
        const speed = parseFloat(args[2]);
        if (Number.isNaN(speed)) return console.log('chain_speed: speed must be a number');
        let changed = 0;
        const MAX_ORBIT_SPEED_GLOBAL = 2 * Math.PI;
        if (target === 'all') {
            entities.forEach(e => { if (e && e.type === 'boxChain') { e.orbitSpeed = Math.min(Math.abs(speed), MAX_ORBIT_SPEED_GLOBAL); changed++; } });
        } else if (/^\d+$/.test(target)) {
            const idx = parseInt(target, 10);
            const e = entities[idx];
            if (e && e.type === 'boxChain') { e.orbitSpeed = Math.min(Math.abs(speed), MAX_ORBIT_SPEED_GLOBAL); changed = 1; }
        } else {
            // treat target as planet name
            entities.forEach(e => {
                if (e && e.type === 'boxChain' && e.centerRef && e.centerRef.name && e.centerRef.name.toLowerCase() === target.toLowerCase()) {
                    e.orbitSpeed = Math.min(Math.abs(speed), MAX_ORBIT_SPEED_GLOBAL);
                    changed++;
                }
            });
        }
        return console.log('chain_speed: changed', changed, 'chains to speed', speed);
    }

    // Music commands: play/stop/list/next
    if (cmd === 'music') {
        const sub = (args[1] || '').toLowerCase();
        if (sub === 'play' || sub === 'start') { startMusicRandomLoop(); return; }
        if (sub === 'stop' || sub === 'pause') { stopMusic(); return; }
        if (sub === 'list') {
            console.log('music playlist:');
            (window.musicPlaylist || []).forEach((t, i) => console.log(i + ':', t.name || t.url));
            return;
        }
        if (sub === 'next') {
            try {
                if (!window.musicShuffled || window.musicShuffled.length === 0) startMusicRandomLoop();
                else {
                    const nextIdx = (window.musicIndex + 1) % window.musicShuffled.length;
                    playByShuffledIndex(nextIdx);
                }
            } catch (e) { console.warn('music next failed', e); }
            return;
        }
        console.log('music usage: music <play|stop|list|next>');
        return;
    }

    // Teleport command: `tp x y z`, `tp random [radius]`, `tp origin`
    if (cmd === 'tp' || cmd === 'teleport') {
        // Usage: tp x y z
        if (args[1] === 'random') {
            const radius = parseFloat(args[2]) || 1000;
            // random point on/in sphere
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = radius * Math.cbrt(Math.random());
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            spaceship.position = [x, y, z];
            console.log('tp: teleported to random position', spaceship.position);
            return;
        }
        if (args[1] === 'origin' || args[1] === 'home') {
            spaceship.position = [0,0,-25000];
            console.log('tp: teleported to origin [0,0,25000]');
            return;
        }
        if (args.length >= 4) {
            const x = parseFloat(args[1]);
            const y = parseFloat(args[2]);
            const z = parseFloat(args[3]);
            if ([x,y,z].some(v => Number.isNaN(v))) {
                return console.log('tp usage: tp x y z | tp random [radius] | tp origin');
            }
            spaceship.position = [x, y, z];
            console.log('tp: teleported to', spaceship.position);
            return;
        }
        return console.log('tp usage: tp x y z | tp random [radius] | tp origin');
    }
    if (cmd === 'clear_projectiles') { projectiles.length = 0; return console.log('cleared projectiles'); }
    if (cmd === 'kill') {
        // Kill all entities (clear pickups/projectiles) and the player
        try { projectiles.length = 0; } catch(e) {}
        try { pickups.length = 0; } catch(e) {}
        try { spaceship.hp = 0; } catch(e) {}
        console.log('Cmd kill: cleared projectiles and pickups; spaceship.hp set to 0');
        return;
    }

    // Credits management command: `credits <+|-|=> <number|inf>`
    if (cmd === 'credits') {
        // Expect operator then value: e.g. `credits + 100` or `credits = 1000` or `credits = inf`
        if (args.length < 3) return console.log('credits usage: credits <+|-|=> <number|inf>');
        let op = args[1];
        let raw = args[2];
        // Support form `credits +100` where args[1] may be '+100'
        if (/^[+\-\=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        // Parse value
        let val;
        if (raw === 'inf' || raw === '∞') {
            val = CREDITS_INFINITY;
        } else {
            val = parseInt(raw, 10);
            if (Number.isNaN(val)) return console.log('credits usage: credits <+|-|=> <number|inf>');
        }

        const old = (credits || 0);
        try {
            if (op === '+') {
                if (old === CREDITS_INFINITY) {
                    console.log('credits is already ∞; add no-op');
                } else {
                    credits = Math.min(CREDITS_INFINITY, old + val);
                    console.log('Credits:', old, '->', credits, (credits === CREDITS_INFINITY ? '(∞)' : ''));
                }
            } else if (op === '-') {
                if (old === CREDITS_INFINITY) {
                    console.log('credits is ∞; subtraction not applied (use "credits = <number>" to override)');
                } else {
                    credits = Math.max(0, old - val);
                    console.log('Credits:', old, '->', credits);
                }
            } else if (op === '=') {
                if (val >= CREDITS_INFINITY) {
                    credits = CREDITS_INFINITY;
                    console.log('Credits:', old, '->', credits, '(∞)');
                } else {
                    credits = Math.max(0, val);
                    console.log('Credits:', old, '->', credits);
                }
            } else {
                console.log('credits usage: credits <+|-|=> <number|inf>');
            }
        } catch (e) {
            console.error('credits command failed', e);
        }
        return;
    }
    // Speed management command: `speed <+|-|=> <number>`
    if (cmd === 'speed') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        if (args.length < 3) return console.log('speed usage: speed <+|-|=> <number>');
        let op = args[1];
        let raw = args[2];
        if (/^[+\-=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        const val = parseFloat(raw);
        if (Number.isNaN(val)) return console.log('speed usage: speed <+|-|=> <number>');

        const old = (spaceship.speed || 0);
        try {
            if (op === '+') {
                spaceship.speed = Math.min(spaceship.maxSpeed || val, old + val);
                console.log('speed:', old, '->', spaceship.speed);
            } else if (op === '-') {
                spaceship.speed = Math.max(spaceship.minSpeed || 0, old - val);
                console.log('speed:', old, '->', spaceship.speed);
            } else if (op === '=') {
                spaceship.speed = Math.max(spaceship.minSpeed || 0, Math.min(spaceship.maxSpeed || val, val));
                console.log('speed:', old, '->', spaceship.speed);
            } else {
                console.log('speed usage: speed <+|-|=> <number>');
            }
        } catch (e) { console.error('speed command failed', e); }
        return;
    }
    // Max speed management command: `maxspeed <+|-|=> <number>`
    if (cmd === 'maxspeed') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        if (args.length < 3) return console.log('maxspeed usage: maxspeed <+|-|=> <number>');
        let op = args[1];
        let raw = args[2];
        if (/^[+\-=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        const val = parseFloat(raw);
        if (Number.isNaN(val)) return console.log('maxspeed usage: maxspeed <+|-|=> <number>');

        const old = (spaceship.maxSpeed || 0);
        try {
            if (op === '+') {
                spaceship.maxSpeed = old + val;
                // Ensure maxSpeed is at least minSpeed
                if (typeof spaceship.minSpeed === 'number') spaceship.maxSpeed = Math.max(spaceship.maxSpeed, spaceship.minSpeed);
                console.log('maxspeed:', old, '->', spaceship.maxSpeed);
            } else if (op === '-') {
                spaceship.maxSpeed = Math.max((spaceship.minSpeed || 0), old - val);
                if (spaceship.speed > spaceship.maxSpeed) spaceship.speed = spaceship.maxSpeed;
                console.log('maxspeed:', old, '->', spaceship.maxSpeed);
            } else if (op === '=') {
                spaceship.maxSpeed = Math.max((spaceship.minSpeed || 0), val);
                if (spaceship.speed > spaceship.maxSpeed) spaceship.speed = spaceship.maxSpeed;
                console.log('maxspeed:', old, '->', spaceship.maxSpeed);
            } else {
                console.log('maxspeed usage: maxspeed <+|-|=> <number>');
            }
        } catch (e) { console.error('maxspeed command failed', e); }
        return;
    }
    // HP management command: `hp <+|-|=> <number|inf>`
    if (cmd === 'hp' || cmd === 'Hp') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        if (args.length < 3) return console.log('hp usage: hp <+|-|=> <number|inf>');
        let op = args[1];
        let raw = args[2];
        if (/^[+\-\=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        const INT32_MAX = 2147483647;
        let val;
        if (raw === 'inf' || raw === '∞') {
            val = INT32_MAX;
        } else {
            val = parseInt(raw, 10);
            if (Number.isNaN(val)) return console.log('hp usage: hp <+|-|=> <number|inf>');
        }

        const old = (spaceship.hp || 0);
        try {
            // Determine allowed max for current HP (respect spaceship.maxHp)
            const maxAllowed = (spaceship.maxHp === INT32_MAX) ? INT32_MAX : spaceship.maxHp;
            if (op === '+') {
                if (old === INT32_MAX) {
                    console.log('hp is already ∞; add no-op');
                } else {
                    spaceship.hp = Math.min(maxAllowed, old + val);
                    console.log('HP:', old, '->', spaceship.hp);
                }
            } else if (op === '-') {
                if (old === INT32_MAX) {
                    console.log('hp is ∞; subtraction not applied (use "hp = <number>" to override)');
                } else {
                    spaceship.hp = Math.max(0, old - val);
                    console.log('HP:', old, '->', spaceship.hp);
                }
            } else if (op === '=') {
                if (val >= INT32_MAX) {
                    spaceship.hp = INT32_MAX;
                    console.log('HP:', old, '->', spaceship.hp, '(∞)');
                } else {
                    spaceship.hp = Math.max(0, Math.min(maxAllowed, val));
                    console.log('HP:', old, '->', spaceship.hp);
                }
            } else {
                console.log('hp usage: hp <+|-|=> <number|inf>');
            }
        } catch (e) {
            console.error('hp command failed', e);
        }
        return;
    }
    // Machinist repair-pack restore amount: `machinistHpRestore <+|-|=> <number>`
    if (cmd.startsWith('machinist')) {
        // Accept commands like 'machinistHpRestore' (case-insensitive)
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        if (args.length < 3) return console.log('machinistHpRestore usage: machinistHpRestore <+|-|=> <number>');
        let op = args[1];
        let raw = args[2];
        if (/^[+\-\=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        let val = parseInt(raw, 10);
        if (Number.isNaN(val)) return console.log('machinistHpRestore usage: machinistHpRestore <+|-|=> <number>');

        const old = machinistHpRestore;
        try {
            if (op === '+') {
                machinistHpRestore = Math.max(1, old + val);
                console.log('machinistHpRestore:', old, '->', machinistHpRestore);
            } else if (op === '-') {
                machinistHpRestore = Math.max(1, old - val);
                console.log('machinistHpRestore:', old, '->', machinistHpRestore);
            } else if (op === '=') {
                machinistHpRestore = Math.max(1, val);
                console.log('machinistHpRestore:', old, '->', machinistHpRestore);
            } else {
                console.log('machinistHpRestore usage: machinistHpRestore <+|-|=> <number>');
            }
        } catch (e) {
            console.error('machinistHpRestore command failed', e);
        }
        return;
    }
    // Max HP management command: `maxHp <+|-|=> <number|inf>`
    if (cmd === 'maxhp' || cmd === 'maxHp' || cmd === 'maxHP') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        if (args.length < 3) return console.log('maxHp usage: maxHp <+|-|=> <number|inf>');
        let op = args[1];
        let raw = args[2];
        if (/^[+\-\=]/.test(op) && op.length > 1) {
            raw = op.slice(1);
            op = op[0];
        }
        const opLower = (op || '').toString().toLowerCase();
        if (opLower === 'add' || opLower === 'plus') op = '+';
        if (opLower === 'sub' || opLower === 'minus') op = '-';
        if (opLower === 'set' || opLower === 'assign') op = '=';

        const INT32_MAX = 2147483647;
        let val;
        if (raw === 'inf' || raw === '∞') {
            val = INT32_MAX;
        } else {
            val = parseInt(raw, 10);
            if (Number.isNaN(val)) return console.log('maxHp usage: maxHp <+|-|=> <number|inf>');
        }

        const old = (spaceship.maxHp || 0);
        try {
            if (op === '+') {
                if (old === INT32_MAX) {
                    console.log('maxHp is already ∞; add no-op');
                } else {
                    spaceship.maxHp = Math.min(INT32_MAX, old + val);
                    console.log('maxHp:', old, '->', spaceship.maxHp, (spaceship.maxHp === INT32_MAX ? '(∞)' : ''));
                }
            } else if (op === '-') {
                if (old === INT32_MAX) {
                    console.log('maxHp is ∞; subtraction not applied (use "maxHp = <number>" to override)');
                } else {
                    spaceship.maxHp = Math.max(1, old - val);
                    // Ensure current hp doesn't exceed new max
                    if (spaceship.hp > spaceship.maxHp) spaceship.hp = spaceship.maxHp;
                    console.log('maxHp:', old, '->', spaceship.maxHp);
                }
            } else if (op === '=') {
                if (val >= INT32_MAX) {
                    spaceship.maxHp = INT32_MAX;
                    console.log('maxHp:', old, '->', spaceship.maxHp, '(∞)');
                } else {
                    spaceship.maxHp = Math.max(1, val);
                    if (spaceship.hp > spaceship.maxHp) spaceship.hp = spaceship.maxHp;
                    console.log('maxHp:', old, '->', spaceship.maxHp);
                }
            } else {
                console.log('maxHp usage: maxHp <+|-|=> <number|inf>');
            }
        } catch (e) {
            console.error('maxHp command failed', e);
        }
        return;
    }
    // Developer enable: give infinite health and credits. Requires execMode.
    if (cmd === 'dev') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        try {
            const INT32_MAX = 2147483647;
            try { spaceship.maxHp = INT32_MAX; spaceship.hp = INT32_MAX; } catch (e) {}
            try { credits = CREDITS_INFINITY; } catch (e) {}
            console.log('dev: applied INT32_MAX to health; credits set to 2^32 (∞)');
        } catch (e) {
            console.error('dev failed', e);
        }
        return;
    }
    // Hidden privileged exec command: prompts for ID, and if it matches the valid list
    // applies special global modifications. This command is intentionally not listed
    // in `help` output.
    if (cmd === 'exec') {
        try {
            const id = prompt('Enter exec ID:');
            // Consult runtime execCandidates map
            const candidates = window.execCandidates || {};
            const architectAlias = 'Exec_Architect12134';
            const legacyArchitect = '12134Architect';
            if (!id) return console.log('exec aborted');
            // If this id has been permanently banned, inform the caller
            if (window.execBanned && window.execBanned[id]) {
                return console.log(id + ' has been banned');
            }
            // If id is in the candidate map
            if (Object.prototype.hasOwnProperty.call(candidates, id)) {
                if (!candidates[id]) {
                    return console.log(id + ' does not exist');
                }
                // If authenticating as Architect, require password
                if (id === architectAlias) {
                    const pw = prompt('Enter Architect password:');
                    if (!pw || pw !== (window.specialEnemyName || '')) {
                        return console.log('Architect authentication failed');
                    }
                }
                // candidate is unblocked — accept and enable execMode; record canonical user
                try { window.execMode = true; } catch (e) {}
                try { window.currentExecUser = id; } catch (e) {}
                // Display pending mail for this exec (then clear and persist)
                try {
                    const mail = (window.execMail && window.execMail[window.currentExecUser]) || [];
                    if (mail && mail.length > 0) {
                        console.log('--- You have ' + mail.length + ' message(s) ---');
                        mail.forEach(m => {
                            const when = (m && m.time) ? new Date(m.time).toLocaleString() : 'unknown time';
                            console.log('From:', (m && m.from) || 'System', '-', when, '\n', (m && m.text) || '');
                        });
                        // clear mailbox after display and persist
                        try { window.execMail[window.currentExecUser] = []; } catch (e) {}
                        try { saveExecState(); } catch (e) {}
                    }
                } catch (e) { console.warn('display mail failed', e); }
                console.log('exec: exec mode enabled (' + id + ' authenticated)');
                return;
            }
            // Support legacy Architect ID as an alias if Architect is unblocked
            if (id === legacyArchitect) {
                // If canonical Architect has been banned, inform the caller
                if (window.execBanned && window.execBanned[architectAlias]) {
                    return console.log(architectAlias + ' has been banned');
                }
                if (candidates[architectAlias]) {
                    const pw2 = prompt('Enter Architect password:');
                    if (!pw2 || pw2 !== (window.specialEnemyName || '')) {
                        return console.log('Architect authentication failed');
                    }
                    try { window.execMode = true; } catch (e) {}
                    try { window.currentExecUser = architectAlias; } catch (e) {}
                    // Display pending mail for Architect (then clear and persist)
                    try {
                        const mail = (window.execMail && window.execMail[window.currentExecUser]) || [];
                        if (mail && mail.length > 0) {
                            console.log('--- You have ' + mail.length + ' message(s) ---');
                            mail.forEach(m => {
                                const when = (m && m.time) ? new Date(m.time).toLocaleString() : 'unknown time';
                                console.log('From:', (m && m.from) || 'System', '-', when, '\n', (m && m.text) || '');
                            });
                            try { window.execMail[window.currentExecUser] = []; } catch (e) {}
                            try { saveExecState(); } catch (e) {}
                        }
                    } catch (e) { console.warn('display mail failed', e); }
                    console.log('exec: exec mode enabled (Architect authenticated)');
                    return;
                }
            }
            // Unknown input
            return console.log('exec: invalid ID');
        } catch (e) {
            console.error('exec failed', e);
            return;
        }
    }
    // Runtime management for Exec candidates
    if (cmd === 'listExecs') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        console.log('execCandidates:', window.execCandidates);
        return;
    }
    // Message command: queue a message for an Exec to read on next login
    if (cmd === 'message') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        const target = args[1];
        if (!target) return console.log('message usage: message <Exec_Name> <text>');
        // message text may be provided as the rest of the args, or prompt if empty
        let text = args.slice(2).join(' ');
        if (!text) {
            try { text = prompt('Enter message text:'); } catch (e) { text = ''; }
        }
        if (!text) return console.log('message aborted');
        try {
            window.execMail = window.execMail || {};
            window.execMail[target] = window.execMail[target] || [];
            window.execMail[target].push({ from: window.currentExecUser || 'System', text: text, time: Date.now() });
            try { saveExecState(); } catch (e) {}
            console.log('message: queued for', target);
        } catch (e) { console.error('message failed', e); }
        return;
    }
    if (cmd === 'listBanned') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        console.log('execBanned:', window.execBanned || {});
        return;
    }
    if (cmd === 'unblockExec') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        const name = args[1];
        if (!name) return console.log('unblockExec usage: unblockExec <Exec_Name>');
        window.execCandidates = window.execCandidates || {};
        // Prevent unblocking a permanently banned name
        if (window.execBanned && window.execBanned[name]) return console.log('unblockExec: cannot unblock banned name ' + name);
        // Enforce maximum of 10 Exec_ slots. Legacy or non-Exec_ names do not count toward this limit.
        const slotKeys = Object.keys(window.execCandidates).filter(k => k.startsWith('Exec_'));
        const slotCount = slotKeys.length;
        if (name.startsWith('Exec_') && !Object.prototype.hasOwnProperty.call(window.execCandidates, name) && slotCount >= 10) {
            return console.log('unblockExec: cannot add more Exec_ slots (limit 10)');
        }
        window.execCandidates[name] = true;
        console.log('unblockExec: unblocked', name);
        try { saveExecState(); } catch (e) {}
        return;
    }
    if (cmd === 'revokeExec') {
        if (!window.execMode) return console.log('Restricted: exec mode required (run exec to enable)');
        const name = args[1];
        if (!name) return console.log('revokeExec usage: revokeExec <Exec_Name>');
        window.execCandidates = window.execCandidates || {};
        window.execBanned = window.execBanned || {};
        if (window.execBanned[name]) return console.log(name + ' is already banned');
        // Mark banned
        window.execBanned[name] = true;
        // If revoking a named Exec_ slot, remove it to free a slot.
        if (name.startsWith('Exec_') && Object.prototype.hasOwnProperty.call(window.execCandidates, name)) {
            delete window.execCandidates[name];
            console.log('revokeExec: removed slot', name);
            try { saveExecState(); } catch (e) {}
        } else {
            window.execCandidates[name] = false;
            console.log('revokeExec: revoked', name);
            try { saveExecState(); } catch (e) {}
        }
        return;
    }
    // Admin command routing (only called if execMode enabled and for authenticated users)
    try {
        if (window.adminCommands && Object.prototype.hasOwnProperty.call(window.adminCommands, cmd)) {
            // Only Architect may execute admin commands
                if (window.currentExecUser === 'Exec_Architect12134') {
                try {
                    const entry = window.adminCommands[cmd];
                    if (entry && typeof entry.handler === 'function') {
                            // Require Architect password before executing any admin command
                            try {
                                const _pw = prompt('Enter Architect password for admin command:');
                                if (!_pw || _pw !== (window.specialEnemyName || '')) {
                                    return console.log('Architect authentication failed');
                                }
                            } catch (e) {
                                return console.log('Architect authentication failed');
                            }
                            entry.handler(args);
                        return;
                    }
                } catch (e) { console.error('admin command failed', e); return; }
            } else {
                return console.log('Restricted: admin commands available to Architect only');
            }
        }
    } catch (e) {}
    if (cmd === 'set_bullet_scale') { const v = parseFloat(args[1]); if (!isNaN(v)) { window.BULLET_VISUAL_SCALE = v; return console.log('BULLET_VISUAL_SCALE=', v); } return console.log('usage: set_bullet_scale <number>'); }
    if (cmd === 'dump_projectiles') { return console.log('projectiles:', projectiles); }
    console.log('Unknown command:', cmdStr);
};

// Quick keyboard command prompt: press ` (backtick) to enter a command
try {
    if (typeof canvas !== 'undefined' && canvas) {
        canvas.tabIndex = canvas.tabIndex || 0;
        canvas.style.outline = 'none';
        canvas.addEventListener('keydown', (e) => {
            // Open command prompt on backtick or slash
            if (e.key === '`' || e.key === '/') {
                let cmd = prompt('Enter game command (type "help" for list):');
                if (cmd) {
                    // allow users to prefix with '/' if they like; strip it before executing
                    if (cmd.startsWith('/')) cmd = cmd.slice(1);
                    window.gameCommand(cmd);
                }
                e.preventDefault();
            }
        });
    }
} catch (e) {}

// Convenience alias: call `Cmd('...')` from console or code to run commands
try { window.Cmd = function(s) { return window.gameCommand(s); }; } catch (e) {}

function drawProjectiles() {
    let machineDrawnThisFrame = false;
    // Throttled debug: show projectile counts by type (once per second)
    try {
        const now = performance.now();
        if (!drawProjectiles._lastCountLogTime) drawProjectiles._lastCountLogTime = 0;
        if (now - drawProjectiles._lastCountLogTime > 1000) {
            const total = projectiles.length;
            const byType = projectiles.reduce((acc, pr) => { acc[pr.type] = (acc[pr.type]||0)+1; return acc; }, {});
           // console.log('[debug] projectiles total=', total, 'byType=', byType);
            drawProjectiles._lastCountLogTime = now;
        }
    } catch (e) { }
    projectiles.forEach(p => {
        let modelMatrix = identity();
        modelMatrix = translate(modelMatrix, p.position[0], p.position[1], p.position[2]);
        if (p.type === 'machine') {
            // Machine gun pellet: draw as a short, thin cylinder aligned to velocity
            const vel = p.velocity || [0,0,1];
            const vlen = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1] + vel[2]*vel[2]) || 1.0;
            const dir = [vel[0]/vlen, vel[1]/vlen, vel[2]/vlen];
            // Compute yaw/pitch to orient the local Z axis toward dir
            const yaw = Math.atan2(dir[0], dir[2]);
            const pitch = Math.atan2(-dir[1], Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2]));
            let m = identity();
            m = translate(m, p.position[0], p.position[1], p.position[2]);
            m = rotateY(m, yaw);
            m = rotateX(m, pitch);
            // scale: thin radius, longer length along local Y (cylinder is height 2 by default)
            const radius = 0.35 * BULLET_VISUAL_SCALE;
            const length = 5.0 * BULLET_VISUAL_SCALE;
            m = scaleMatrix(m, radius, length, radius);
            gl.uniformMatrix4fv(uModelMatrix, false, m);
            // bright pellet color
            drawFlatCylinder([1.0, 0.95, 0.1], 12);
            machineDrawnThisFrame = true;
        } else if (p.type === 'ion') {
            // Cylinder for beam
            let m = rotateX(modelMatrix, Math.PI/2); // align with Z
            // thinner and a bit shorter for clarity
            m = scaleMatrix(m, 0.8, 24, 0.8);
            gl.uniformMatrix4fv(uModelMatrix, false, m);
            drawCylinder([0,1,1], 16);
        } else if (p.type === 'fusion') {
            // Call your own bomb drawing function here!
            let nukeMatrix = rotateX(modelMatrix, Math.PI/2 + Math.PI); // rotateX(HALF_PI + PI)
            myCustomBomb(gl, nukeMatrix);
        }
    });
// Draw a box centered at origin, size 2x2x2, colored
function drawBox(color) {
    // 8 vertices, 12 triangles
    const verts = new Float32Array([
        -1,-1,-1,  1,-1,-1,  1,1,-1, -1,1,-1, // back
        -1,-1, 1,  1,-1, 1,  1,1, 1, -1,1, 1  // front
    ]);
    const idx = new Uint16Array([
        0,1,2, 0,2,3, // back
        4,5,6, 4,6,7, // front
        0,1,5, 0,5,4, // bottom
        2,3,7, 2,7,6, // top
        1,2,6, 1,6,5, // right
        0,3,7, 0,7,4  // left
    ]);
    const colorArr = new Float32Array(24).fill(0).map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}
}

// --- Add these new draw helpers ---
function drawSphere(color, latBands, longBands) {
    // Simple UV sphere
    if (!drawSphere.cache) drawSphere.cache = {};
    const key = latBands+','+longBands;
    if (!drawSphere.cache[key]) {
        let verts = [], idx = [];
        for (let lat=0; lat<=latBands; ++lat) {
            let theta = lat * Math.PI / latBands;
            let sinT = Math.sin(theta), cosT = Math.cos(theta);
            for (let lon=0; lon<=longBands; ++lon) {
                let phi = lon * 2 * Math.PI / longBands;
                let sinP = Math.sin(phi), cosP = Math.cos(phi);
                verts.push(cosP*sinT, cosT, sinP*sinT);
            }
        }
        for (let lat=0; lat<latBands; ++lat) {
            for (let lon=0; lon<longBands; ++lon) {
                let first = lat*(longBands+1)+lon;
                let second = first+longBands+1;
                idx.push(first, second, first+1, second, second+1, first+1);
            }
        }
        drawSphere.cache[key] = {verts: new Float32Array(verts), idx: new Uint16Array(idx)};
    }
    const {verts, idx} = drawSphere.cache[key];
    const colorArr = new Float32Array(verts.length).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

// Draw a torus (donut). Uses a cache keyed by segments to avoid regen.
function drawTorus(color, radialSegments=32, tubularSegments=16, radius=1.0, tube=0.3) {
    if (!drawTorus.cache) drawTorus.cache = {};
    const key = `${radialSegments}/${tubularSegments}/${radius}/${tube}`;
    if (!drawTorus.cache[key]) {
        const verts = [];
        const idx = [];
        for (let j = 0; j <= radialSegments; j++) {
            const v = j / radialSegments * Math.PI * 2;
            const cosV = Math.cos(v), sinV = Math.sin(v);
            for (let i = 0; i <= tubularSegments; i++) {
                const u = i / tubularSegments * Math.PI * 2;
                const cosU = Math.cos(u), sinU = Math.sin(u);
                const x = (radius + tube * cosU) * cosV;
                const y = (radius + tube * cosU) * sinV;
                const z = tube * sinU;
                verts.push(x, z, y); // note: swap axes so torus lies in XZ plane
            }
        }
        for (let j = 0; j < radialSegments; j++) {
            for (let i = 0; i < tubularSegments; i++) {
                const a = (tubularSegments + 1) * j + i;
                const b = (tubularSegments + 1) * (j + 1) + i;
                idx.push(a, b, a + 1);
                idx.push(b, b + 1, a + 1);
            }
        }
        drawTorus.cache[key] = { verts: new Float32Array(verts), idx: new Uint16Array(idx) };
    }
    const { verts, idx } = drawTorus.cache[key];
    const colorArr = new Float32Array(verts.length).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

function drawCylinder(color, bands=16) {
    // Cylinder along Y axis, height 2, radius 1
    if (!drawCylinder.cache) drawCylinder.cache = {};
    if (!drawCylinder.cache[bands]) {
        let verts=[], idx=[];
        for (let i=0; i<=bands; ++i) {
            let theta = i*2*Math.PI/bands;
            let x = Math.cos(theta), z = Math.sin(theta);
            verts.push(x,1,z, x,-1,z);
        }
        for (let i=0; i<bands; ++i) {
            let a = i*2, b = a+1, c = ((i+1)% (bands+1))*2, d = c+1;
            idx.push(a,b,c, b,d,c);
        }
        drawCylinder.cache[bands] = {verts: new Float32Array(verts), idx: new Uint16Array(idx)};
    }
    const {verts, idx} = drawCylinder.cache[bands];
    const colorArr = new Float32Array(verts.length).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

// Draw a flat cylinder (with top and bottom caps) to represent a coin-like disc.
function drawFlatCylinder(color, bands=16) {
    if (!drawFlatCylinder.cache) drawFlatCylinder.cache = {};
    if (!drawFlatCylinder.cache[bands]) {
        const verts = [];
        const idx = [];
        // Side vertices (like drawCylinder): pairs (topY=1, bottomY=-1)
        for (let i=0; i<=bands; ++i) {
            const theta = i * 2 * Math.PI / bands;
            const x = Math.cos(theta), z = Math.sin(theta);
            // top edge
            verts.push(x, 1, z);
            // bottom edge
            verts.push(x, -1, z);
        }
        // Side indices
        for (let i=0; i<bands; ++i) {
            const a = i*2, b = a+1, c = ((i+1) % (bands+1))*2, d = c+1;
            idx.push(a, b, c, b, d, c);
        }
        // Top cap center vertex
        const topCenterIndex = verts.length/3;
        verts.push(0, 1, 0);
        // top cap triangles (fan)
        for (let i=0; i<bands; ++i) {
            const a = i*2; // top ring
            const c = ((i+1) % (bands+1))*2;
            idx.push(topCenterIndex, a, c);
        }
        // Bottom cap center vertex
        const bottomCenterIndex = verts.length/3;
        verts.push(0, -1, 0);
        // bottom cap triangles (fan)
        for (let i=0; i<bands; ++i) {
            const a = i*2 + 1; // bottom ring
            const c = ((i+1) % (bands+1))*2 + 1;
            // note winding reversed so normal points outward
            idx.push(bottomCenterIndex, c, a);
        }

        drawFlatCylinder.cache[bands] = { verts: new Float32Array(verts), idx: new Uint16Array(idx) };
    }
    const { verts, idx } = drawFlatCylinder.cache[bands];
    const colorArr = new Float32Array(verts.length).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

function drawCone(color, bands=16) {
    // Cone along Y axis, base at y=0, tip at y=1
    if (!drawCone.cache) drawCone.cache = {};
    if (!drawCone.cache[bands]) {
        let verts=[0,1,0], idx=[]; // tip
        for (let i=0; i<=bands; ++i) {
            let theta = i*2*Math.PI/bands;
            verts.push(Math.cos(theta),0,Math.sin(theta));
        }
        for (let i=1; i<=bands; ++i) {
            idx.push(0,i,i+1);
        }
        drawCone.cache[bands] = {verts: new Float32Array(verts), idx: new Uint16Array(idx)};
    }
    const {verts, idx} = drawCone.cache[bands];
    const colorArr = new Float32Array(verts.length).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

function drawFin(color) {
    // Simple quad for missile fin
    const verts = new Float32Array([
        -0.5,0,0, 0.5,0,0, 0.5,1,0, -0.5,1,0
    ]);
    const idx = new Uint16Array([0,1,2, 0,2,3]);
    const colorArr = new Float32Array(12).fill().map((_,i)=>color[i%3]);
    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    const ibuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.deleteBuffer(vbuf); gl.deleteBuffer(cbuf); gl.deleteBuffer(ibuf);
}

// Restart game on R key press
document.addEventListener('keydown', (e) => {
    if (gameOver && (e.key === 'r' || e.key === 'R')) {
        // Reset ship and state
        spaceship.position = [0, 0, -25000];
        spaceship.rotation = [0, 0, 0];
        spaceship.hp = spaceship.maxHp;
        gameOver = false;
        render();
    }
});

// --- Add weapon selection and fire logic at the bottom ---
document.addEventListener('keydown', (e) => {
    if (e.key === '1') currentWeapon = 1;
    if (e.key === '2') currentWeapon = 2;
    if (e.key === '3') currentWeapon = 3;
    // Toggle music on/off with 'm' (case-insensitive)
    if (e.key && e.key.toLowerCase() === 'm') {
        try {
            if (window.musicPlaying) {
                stopMusic();
                window.musicToggleMessage = 'music turned off';
            } else {
                startMusicRandomLoop();
                window.musicToggleMessage = 'music turned on';
            }
            window.musicToggleTime = performance.now();
        } catch (err) { console.warn('music toggle failed', err); }
        e.preventDefault();
    }
    // Skip to next track with 'n' (case-insensitive)
    if (e.key && e.key.toLowerCase() === 'n') {
        try {
            if (!window.musicShuffled || window.musicShuffled.length === 0) {
                // start and shuffle if nothing is playing yet
                startMusicRandomLoop();
            } else {
                const nextIdx = (window.musicIndex + 1) % window.musicShuffled.length;
                playByShuffledIndex(nextIdx);
            }
            // Show info message with the current track name
            try {
                const idx = (window.musicShuffled && window.musicShuffled[window.musicIndex]) || 0;
                const name = (window.musicPlaylist && window.musicPlaylist[idx] && window.musicPlaylist[idx].name) || 'unknown';
                window.musicInfoMessage = 'Next track: ' + name;
                window.musicInfoTime = performance.now();
            } catch (e) {}
        } catch (err) { console.warn('music skip failed', err); }
        e.preventDefault();
    }
    // Remap shooting to 'q' key (case-insensitive)
    if ((e.key === 'q' || e.key === 'Q') && !gameOver) {
        console.log('[input] shoot key pressed:', e.key);
        const now = performance.now();
        // Machine gun: rapid fire
        if (currentWeapon === 1 && now - lastShotTime > 80) {
            fireProjectile('machine');
            lastShotTime = now;
        }
        // Ion beam: short burst
        if (currentWeapon === 2 && now - lastShotTime > 400) {
            fireProjectile('ion');
            lastShotTime = now;
        }
        // Fusion bomb: slow fire
        if (currentWeapon === 3 && now - lastShotTime > 1000) {
            fireProjectile('fusion');
            lastShotTime = now;
        }
    }
});

// (Removed) X-axis lock toggle listener

function fireProjectile(type) {
    console.log('[game] fireProjectile called:', type);
    // Direction: use ship's forward (local Z) vector so roll/pitch/yaw are consistent
    // NOTE: invert forward if projectiles appear moving backward in your ship model
    let dir = getShipForward();
    // Flip direction so projectiles move away from ship nose (forward);
    // if your ship model is facing -Z, toggle this to false.
    const FLIP_PROJECTILE_DIR = false;//true; //testing for backward firing
    if (FLIP_PROJECTILE_DIR) dir = scale(dir, -1);
    let speed, lifetime;
    if (type === 'machine') { speed = spaceship.speed + 30; lifetime = 1000; }
    if (type === 'ion') { speed = spaceship.speed + 60; lifetime = 400; }
    if (type === 'fusion') { speed = spaceship.speed + 10; lifetime = 4000; }
    // Calculate ship's current velocity vector
    const shipSpeed = spaceship.speed || 0;
    // Add a small fraction of ship speed in the forward direction so projectiles inherit movement
    const shipVel = [dir[0] * shipSpeed / 60, dir[1] * shipSpeed / 60, dir[2] * shipSpeed / 60];
    // Projectile velocity = ship velocity + projectile base velocity
    const projVel = [
        shipVel[0] + dir[0]*speed/60,
        shipVel[1] + dir[1]*speed/60,
        shipVel[2] + dir[2]*speed/60
    ];
    projectiles.push({
        type,
        position: [
            spaceship.position[0] + dir[0]*10,
            spaceship.position[1] + dir[1]*10,
            spaceship.position[2] + dir[2]*10
        ],
        velocity: projVel,
        spawnTime: performance.now(),
        startPosition: [spaceship.position[0], spaceship.position[1], spaceship.position[2]],
        lifetime
    });
    // Play machine-gun laser SFX when firing machine projectiles
    try {
        if (type === 'machine') playSfx('laser');
    } catch (e) { /* ignore if SFX unavailable */ }
    // Throttled log to confirm machine visuals are being drawn
    try {
        const now = performance.now();
        if (machineDrawnThisFrame && (now - lastMachineDrawLogTime) > 1000) {
            console.log('[draw] machine projectiles rendered this frame:', projectiles.filter(pp => pp.type === 'machine').length);
            lastMachineDrawLogTime = now;
        }
    } catch (e) { /* ignore in non-browser or if performance not available */ }
}

// Start rendering
gl.viewport(0, 0, canvas.width, canvas.height);
// Show a one-time start alert to the player
if (!gameStartAlertShown) {
    try { alert('Begin game'); } catch (e) { /* ignore if alert blocked */ }
    gameStartAlertShown = true;
}
render();

function scaleMatrix(m, sx, sy, sz) {
    // Scales a 4x4 matrix by sx, sy, sz (column-major)
    const out = new Float32Array(m);
    out[0] *= sx; out[1] *= sx; out[2] *= sx; out[3] *= sx;
    out[4] *= sy; out[5] *= sy; out[6] *= sy; out[7] *= sy;
    out[8] *= sz; out[9] *= sz; out[10] *= sz; out[11] *= sz;
    return out;
}