# 3D Pacman Game

A fully playable 3D Pacman game built as a web application using Three.js.

## Features

- **Full 3D Graphics**: Experience classic Pacman gameplay in immersive 3D
- **Classic Gameplay**: Collect pellets, avoid ghosts, and eat power pellets to turn the tables
- **Four Unique Ghosts**: Each ghost has its own AI behavior
- **Power Mode**: Eat power pellets to make ghosts vulnerable
- **Scoring System**: Earn points for pellets (10), power pellets (50), and eating scared ghosts (200)
- **Lives System**: Start with 3 lives
- **Responsive Controls**: Use arrow keys or WASD to move
- **Visual Effects**: Atmospheric lighting, shadows, and animations

## How to Play

1. Open `index.html` in a modern web browser
2. Click "START GAME" to begin
3. Use the arrow keys (↑ ↓ ← →) or WASD to move Pacman
4. Collect all yellow pellets while avoiding the colored ghosts
5. Eat the large red power pellets to temporarily turn ghosts blue and eat them for bonus points
6. Clear all pellets to win!

## Controls

- **Arrow Keys / WASD**: Move Pacman
- **Space**: Pause/Resume game
- **R**: Restart game

## Technical Details

- **Engine**: Three.js (WebGL)
- **Language**: Vanilla JavaScript
- **No Build Required**: Just open the HTML file in a browser
- **Browser Support**: Modern browsers with WebGL support (Chrome, Firefox, Safari, Edge)
- **Dependencies**: Three.js is loaded from CDN (jsdelivr.net) - requires internet connection

**Note**: The game requires an internet connection on first load to download Three.js from the CDN. Once loaded, the game runs entirely in the browser.

## Game Mechanics

- **Pellets**: Small yellow dots worth 10 points each
- **Power Pellets**: Large red dots worth 50 points that activate power mode for 10 seconds
- **Ghosts**: Four ghosts that chase Pacman with simple AI
  - Red ghost (Blinky)
  - Cyan ghost (Inky)
  - Pink ghost (Pinky)
  - Orange ghost (Clyde)
- **Power Mode**: When active, ghosts turn blue and run away. Eat them for 200 points each!

## Development

This is a pure frontend application with no dependencies other than Three.js loaded from CDN. To modify:

1. Edit `game.js` for game logic
2. Edit `index.html` for UI and styling
3. Refresh browser to see changes

## License

Open source project - feel free to modify and share!