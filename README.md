# Ganime’s Tower

A small, single-screen riddle game prototype. Pedro, the tower’s sarcastic commentator, offers hints and reacts to guesses without giving answers away. The project uses plain HTML, CSS, and JavaScript, so there is no build step or package installation.

## Run locally

From this folder, run:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

The first assignment displays a key and opens the next level when the player appends `/key` to the URL. Level 02 is a three-stage keypad: odd positions, prime positions, then the Fibonacci sequence. Completing it links to `/fibo`. Level 03 shows Durin’s Door and accepts `mellon` to continue to `/durin`. Level 04 crops the top-left 250×250 pixels of `assets/rabb1.png`; the uncropped file remains available from the image’s context menu. Entering `hammer` routes to `/hammer`. Level 05 renders a random binary matrix with 20 randomly placed clickable capital O characters, each routing to `/dragthemousethroughthelabyrinth`. Level 06 is a branching maze with separate arrow-key, WASD, and draggable mice; reaching the exit with the draggable mouse unlocks `/mechanics-101`. Level 07 is a precision stopwatch at `/mechanics-101`; its seconds-and-deciseconds clock runs at 80% speed, and stopping on `10:1` within its three-millisecond clock window unlocks `/Chess`. After 10 failed stops, the timer can be adjusted with the mouse wheel while running or paused; Pedro begins hinting at the alternate method after attempt 11. Level 08 at `/chess` awards the supplied pixel-art chess knight into the persistent four-slot inventory and opens `/seriously-what-is-that`. Level 09 at `/seriously-what-is-that` accepts `stonehenge` under a displayed subtraction problem and unlocks `/smile`. Level 10 at `/smile` adds the supplied stone to the inventory, then presents three sequential pattern-recognition questions; completing them unlocks `/movienight`. The reusable inventory starts collapsed and can be added to future levels with `/inventory.js` and `/inventory.css`. Inventory items can be dragged; levels can declare a valid target with `data-accept-item` and handle `tower:inventory-drop`. Dropping an item elsewhere brings up Pedro’s disappointed commentary. Pedro’s level-one welcome and orientation slideshow are in `game.js`; Level 02 behavior is in `key-level.js`, Level 03 form behavior is in `durin.js`, Level 04 form behavior is in `rabbit-level.js`, Level 06 movement is in `dragthemousethroughthelabyrinth/maze.js`, Level 07 timer behavior is in `mechanics-101/timer.js`, Level 09 answer behavior is in `seriously-what-is-that/level.js`, and Level 10 behavior is in `smile/level.js`. Google Fonts are currently loaded online; system fallbacks are included.
