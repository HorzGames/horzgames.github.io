// Global key combo listener for Horz Games — works in launcher and all games
(function(){
  const adminCombo = ['a','d','m','i','n'];
  const prankCombo = ['p','r','a','n','k'];
  const pressed = new Set();
  let adminTriggered = false;
  let prankTriggered = false;
  let lastOpened = 0;
  const cooldownMs = 5000; // don't reopen more than once per 5s

  function isHeld(combo){
    return combo.every(k => pressed.has(k));
  }

  function openLink(){
    const now = Date.now();
    if (now - lastOpened < cooldownMs) return;
    lastOpened = now;
    try {
      // Prefer window.open — Electron BrowserView main process forwards to shell
      window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    } catch(e){
      try { location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; } catch(e){}
    }
  }

  window.addEventListener('keydown', (e) => {
    if (!e || !e.key) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pressed.add(k);

    // Admin combo
    if (!adminTriggered && isHeld(adminCombo)){
      adminTriggered = true;
      openLink();
    }
    // Prank combo
    if (!prankTriggered && isHeld(prankCombo)){
      prankTriggered = true;
      openLink();
    }
  }, true);

  window.addEventListener('keyup', (e) => {
    if (!e || !e.key) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pressed.delete(k);
    // Reset triggers when combos are released
    if (!isHeld(adminCombo)) adminTriggered = false;
    if (!isHeld(prankCombo)) prankTriggered = false;
  }, true);

  // Clear on blur to avoid sticky state
  window.addEventListener('blur', () => { pressed.clear(); adminTriggered = false; prankTriggered = false; });
})();
