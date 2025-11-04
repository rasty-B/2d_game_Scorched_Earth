# Bug Fixes - Artillery Game

## Issues Fixed

### 1. **Stage Selection Not Working**
**Problem:** Stage selection buttons were not responding to clicks. The selected stage would always default to 'lunaCrater'.

**Root Cause:** Event listeners for stage buttons were being attached INSIDE the start-game button click handler, meaning they weren't active until after clicking "Start Game".

**Fix:** Moved stage button event listeners to the main `setupEventListeners()` method and stored the selected stage in `this.selectedStage` class property.

**Location:** `src/game.js:96-110`

---

### 2. **Game Menu Not Displaying**
**Problem:** The game menu might not display on initial page load in some scenarios.

**Fix:** Added console logging to track initialization and ensured the `showMenu()` call happens after all DOM elements are loaded.

**Location:** `src/game.js:81-84`

---

### 3. **Game Loop Running in Menu State**
**Problem:** The render() method would try to draw terrain and stage even when they were null (during menu state), potentially causing errors.

**Fix:** Added null checks in `render()` method to return early if terrain or stage are not initialized.

**Location:** `src/game.js:294-297`

---

### 4. **AI Turns Not Triggering Properly**
**Problem:** AI turns were being checked on every update() call, potentially causing multiple setTimeout calls.

**Fix:**
- Removed AI turn check from `update()` method
- Added AI turn check in `endTurn()` method where it logically belongs
- Added AI turn check in `startGame()` for when AI goes first

**Location:** `src/game.js:217-223` and `src/game.js:506-512`

---

### 5. **Default Stage Not Visually Highlighted**
**Problem:** Even though 'lunaCrater' was the default selection, it wasn't visually highlighted in the menu.

**Fix:** Added code to highlight the default stage button when setting up event listeners.

**Location:** `src/game.js:106-109`

---

## Testing Checklist

- [x] Menu displays on page load
- [x] Stage selection buttons are clickable and highlight correctly
- [x] Start Game button creates terrain and tanks
- [x] Mouse click-and-drag works for aiming
- [x] Trajectory preview appears when dragging
- [x] Power meter and angle display update
- [x] Projectile fires and follows physics
- [x] Terrain deforms on impact
- [x] Tanks take damage
- [x] AI opponents take turns automatically
- [x] Game loop runs smoothly during gameplay
- [x] Game over screen displays correctly

---

## Console Debugging

The following console messages help track initialization:

```
"Game initialized"
"Menu should be visible now"
"Selected stage: [stage-name]"
"Starting game with: [stage] [tanks] tanks, [ai] AI"
"Stage loaded: [stage-name]"
"Terrain generated"
"Tanks created: [count]"
"Game loop started"
```

---

## Files Modified

- `src/game.js` - Main game logic fixes
  - Fixed stage selection bug
  - Added null checks in render()
  - Moved AI turn logic
  - Added debugging logs
  - Highlighted default stage

---

## How to Test

1. Open `index.html` in a browser
2. Open browser console (F12)
3. Verify menu is visible
4. Click different stage buttons - they should highlight
5. Adjust tank count and AI count sliders
6. Click "Start Game"
7. Verify terrain and tanks appear
8. Click and drag on your tank to aim
9. Release to fire
10. Watch projectile physics and terrain deformation

---

## Next Steps

All critical bugs have been fixed. The game is now fully playable with:
- Working menu system
- Stage selection
- Mouse-based aiming
- Trajectory preview
- AI opponents
- Destructible terrain
- Turn-based gameplay
