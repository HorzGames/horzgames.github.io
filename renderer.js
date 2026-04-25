// April Fools' joke: swap document title and main heading on April 1st only
window.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  if (now.getMonth() === 3 && now.getDate() === 1) { // April is month 3 (0-based)
    const docTitle = document.querySelector('title');
    if (docTitle) docTitle.textContent = 'Games Horz';
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) mainTitle.textContent = 'Games Horz';
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = 'Games Horz';
  } else {
    // Restore normal titles on all other days
    const docTitle = document.querySelector('title');
    if (docTitle) docTitle.textContent = 'Horz Games';
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) mainTitle.textContent = 'Horz Games';
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = 'Horz Games';
  }
});
// Horz Games Logo Easter Egg
window.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('horz-logo');
  const egg = document.getElementById('horz-easter-egg');
  if (logo && egg) {
    logo.addEventListener('click', () => {
      logo.style.display = 'none';
      egg.innerHTML = `<video id="egg-video" width="400" autoplay controls style="margin:0 auto 16px;display:block;">
        <source src="logos/Horz Easter Egg.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
      egg.style.display = '';
      const vid = document.getElementById('egg-video');
      if (vid) {
        vid.addEventListener('ended', () => {
          egg.style.display = 'none';
          logo.style.display = '';
        });
      }
    });
  }
});















// Admin window function for console use
// Admin credentials: each admin has an ID and a random password
const adminIDs = [
  { id: 'Exec_Architect12134', password:  'H0rs3' },
  { id: 'Exec_Progenitor12135', password: '7525757a' },
  { id: 'Exec_Originator12136', password: 'z8Qw2Xy1' },
  { id: 'Exec_Author12137', password: 'p3Rk7Vb6' },
  { id: 'Exec_Forger12138', password: 'n2Jm5Tq8' },
  { id: 'Exec_Shaper12139', password: 'w9Lz4Sd2' },
  { id: 'Exec_Steward12140', password: 'b6Hc3Xv7' },
  { id: 'Exec_Pathfinder12141', password: 't5Qp1Zk9' },
  { id: 'Exec_Warden12142', password: 'm8Vn2Jq4' },
  { id: 'Exec_Vector12143', password: 's1Xy6Lp3' }
];

window.admin = function admin() {
  const id = prompt('Enter admin ID:');
  if (id === null) return;
  const admin = adminIDs.find(a => a.id === id);
  if (!admin) {
    alert('Incorrect ID.');
    return;
  }
  const pw = prompt('Enter admin password:');
  if (pw === null) return;
  if (pw === admin.password) {
    alert('Admin access granted!');
    // Enable Horz Civilization popup (if present)
    const popup = document.getElementById('civ-popup');
    if (popup) popup.classList.remove('hidden');
    // Enable Horz Dungeons button
    const dungeonsBtn = document.getElementById('dungeons');
    if (dungeonsBtn) {
      dungeonsBtn.disabled = false;
      dungeonsBtn.style.opacity = '';
      dungeonsBtn.style.cursor = '';
      dungeonsBtn.dataset.desc = "Battle monsters and explore dungeons in this action RPG. WIP";
    }
  } else {
    alert('Incorrect password.');
  }
};
// Horz Civilization popup logic
window.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('civ-popup');
  const downloadBtn = document.getElementById('civ-download-btn');
  const closeBtn = document.getElementById('civ-close-btn');
  if (popup && downloadBtn && closeBtn) {
    // Show popup after short delay
    setTimeout(() => popup.classList.remove('hidden'), 900);
    downloadBtn.addEventListener('click', () => {
      // Download the PDF (must exist in the project root)
      const a = document.createElement('a');
      a.href = 'horz Civilization.pdf';
      a.download = 'horz Civilization.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 200);
    });
    closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  }
});
// Horz Force P5 Legacy Edition popup logic
window.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('force-popup');
  const downloadBtn = document.getElementById('force-download-btn');
  const closeBtn = document.getElementById('force-close-btn');
  if (popup && downloadBtn && closeBtn) {
    // Show popup after short delay
    setTimeout(() => popup.classList.remove('hidden'), 1200);
    downloadBtn.addEventListener('click', () => {
      // Trigger download of the Horz Force legacy sketch.js
      const a = document.createElement('a');
      a.href = 'Horz Force copy/sketch.js';
      a.download = 'sketch.js';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 200);
    });
    closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  }
});
console.log('Launcher UI script loaded');

function getLauncher() {
  return window.launcher || null;
}

async function tryLaunch(key) {
  const api = getLauncher();
  if (!api || typeof api.launch !== 'function') {
    console.warn('Launcher API unavailable. Falling back to browser iframe mode.');
    // Browser fallback: load the game's HTML into an iframe overlay
    const btn = document.querySelector(`[data-path][data-key="${key}"]`);
    const path = btn ? btn.dataset.path : null;
    if (!path) {
      alert('Game path not available. Run the app in Electron or ensure the button has a data-path.');
      return;
    }

    const overlay = document.getElementById('game-overlay');
    const frame = document.getElementById('game-frame');
    const close = document.getElementById('overlay-close');
    const backdrop = document.getElementById('overlay-backdrop');

    frame.src = path;
    overlay.classList.remove('hidden');

    // Message handler: game can postMessage({type:'request-exit'}) when ESC pressed inside the game
    function onMessage(e) {
      if (!e.data || e.data.type !== 'request-exit') return;
      const ok = confirm('Quit game and return to menu?');
      if (ok) closeOverlay();
    }

    function closeOverlay() {
      overlay.classList.add('hidden');
      try { frame.src = 'about:blank'; } catch (e) {}
      window.removeEventListener('message', onMessage);
      close.removeEventListener('click', closeOverlay);
      backdrop.removeEventListener('click', closeOverlay);
    }

    window.addEventListener('message', onMessage);
    close.addEventListener('click', closeOverlay);
    backdrop.addEventListener('click', closeOverlay);

    // Informational console message
    console.log('Loaded game into iframe (browser fallback):', path);
    return;
  }

  try {
    const res = await api.launch(key);
    if (res && res.error) alert('Failed to launch: ' + res.error);
  } catch (err) {
    console.error('Error while launching:', err);
    alert('Error launching game: ' + (err && err.message ? err.message : String(err)));
  }
}

// Attach click handlers and tooltip handlers to all buttons with a data-key attribute
const tooltip = document.getElementById('game-tooltip');
document.querySelectorAll('button[data-key]').forEach(btn => {
  btn.addEventListener('click', () => {
    const k = btn.dataset.key;
    tryLaunch(k);
  });

  btn.addEventListener('mouseenter', e => {
    let desc = btn.dataset.desc;
    if (!desc) return;
    // Replace 'WIP' (case-insensitive, at end or surrounded by spaces/punctuation) with styled span
    desc = desc.replace(/\bWIP\b/gi, '<span class="wip">WIP</span>');
    //desc = desc.replace(/\b\b/gi, '<span class="wip">WIP</span>');
    tooltip.innerHTML = desc;
    tooltip.classList.remove('hidden');
    // Position tooltip near mouse
    const rect = btn.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
    tooltip.style.top = `${rect.bottom + 8 + window.scrollY}px`;
  });
  btn.addEventListener('mousemove', e => {
    if (tooltip.classList.contains('hidden')) return;
    // Follow mouse horizontally, stay below button
    tooltip.style.left = `${e.clientX - tooltip.offsetWidth/2}px`;
  });
  btn.addEventListener('mouseleave', () => {
    tooltip.classList.add('hidden');
  });
});
