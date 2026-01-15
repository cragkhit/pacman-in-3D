// 3D Pacman Game
import * as THREE from 'three';

class PacmanGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        
        this.gameState = 'start'; // start, playing, paused, gameOver, won
        this.score = 0;
        this.lives = 3;
        this.pellets = [];
        this.powerPellets = [];
        this.ghosts = [];
        this.walls = [];
        
        this.pacman = null;
        this.pacmanSpeed = 0.05;
        this.ghostSpeed = 0.03;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.powerModeDuration = 300; // frames
        
        // Animation constants
        this.ghostDirectionChangeChance = 0.02;
        this.powerPelletPulseSpeed = 0.01;
        this.powerPelletPulseAmount = 0.2;
        this.ghostFloatSpeed = 0.005;
        this.ghostFloatAmount = 0.1;
        
        // FPS counter
        this.lastTime = performance.now();
        this.frames = 0;
        
        // Keyboard state
        this.keys = {};
        
        // Maze definition (1 = wall, 0 = path, 2 = pellet, 3 = power pellet, P = pacman start)
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
            [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
            [1,1,1,1,2,1,1,1,1,0,1,0,1,1,1,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,1,1,0,0,0,1,1,0,1,2,1,1,1,1],
            [0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0],
            [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,1,2,1],
            [1,3,2,1,2,2,2,2,2,2,'P',2,2,2,2,2,2,1,2,3,1],
            [1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
            [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.cellSize = 1;
        this.mazeWidth = this.maze[0].length;
        this.mazeHeight = this.maze.length;
        
        this.pacmanStartPos = null;
        this.ghostStartPositions = [
            { x: 9, z: 8 },
            { x: 10, z: 8 },
            { x: 11, z: 8 },
            { x: 10, z: 9 }
        ];
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Setup scene
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 10, 30);
        
        // Setup camera
        this.camera.position.set(10, 15, 15);
        this.camera.lookAt(10, 0, 10);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 20);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 20);
        pointLight2.position.set(15, 5, 15);
        this.scene.add(pointLight2);
        
        // Build maze
        this.buildMaze();
        
        // Create pacman
        this.createPacman();
        
        // Create ghosts
        this.createGhosts();
        
        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        
        // Start animation loop
        this.animate();
    }
    
    buildMaze() {
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1e40af,
            roughness: 0.5,
            metalness: 0.2
        });
        
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0f172a,
            roughness: 0.8
        });
        
        const pelletMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.5
        });
        
        const powerPelletMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff6b6b,
            emissive: 0xff6b6b,
            emissiveIntensity: 0.8
        });
        
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(this.mazeWidth, this.mazeHeight);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(this.mazeWidth / 2 - 0.5, -0.5, this.mazeHeight / 2 - 0.5);
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Build walls and place pellets
        for (let z = 0; z < this.mazeHeight; z++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                const cell = this.maze[z][x];
                
                if (cell === 1) {
                    // Wall
                    const wallGeometry = new THREE.BoxGeometry(this.cellSize, 1.5, this.cellSize);
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 0.25, z);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.walls.push({ x, z });
                } else if (cell === 2) {
                    // Pellet
                    const pelletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                    const pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
                    pellet.position.set(x, 0, z);
                    pellet.castShadow = true;
                    this.scene.add(pellet);
                    this.pellets.push({ mesh: pellet, x, z, collected: false });
                } else if (cell === 3) {
                    // Power pellet
                    const powerPelletGeometry = new THREE.SphereGeometry(0.2, 12, 12);
                    const powerPellet = new THREE.Mesh(powerPelletGeometry, powerPelletMaterial);
                    powerPellet.position.set(x, 0, z);
                    powerPellet.castShadow = true;
                    this.scene.add(powerPellet);
                    this.powerPellets.push({ mesh: powerPellet, x, z, collected: false });
                } else if (cell === 'P') {
                    // Pacman start position
                    this.pacmanStartPos = { x, z };
                }
            }
        }
    }
    
    createPacman() {
        const pacmanGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const pacmanMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
        });
        this.pacman = new THREE.Mesh(pacmanGeometry, pacmanMaterial);
        this.pacman.position.set(this.pacmanStartPos.x, 0.3, this.pacmanStartPos.z);
        this.pacman.castShadow = true;
        this.scene.add(this.pacman);
        
        // Pacman properties
        this.pacman.userData = {
            x: this.pacmanStartPos.x,
            z: this.pacmanStartPos.z,
            direction: { x: 0, z: 0 },
            nextDirection: { x: 0, z: 0 }
        };
    }
    
    createGhosts() {
        const ghostColors = [0xff0000, 0x00ffff, 0xffb8ff, 0xffb851];
        const ghostNames = ['Blinky', 'Inky', 'Pinky', 'Clyde'];
        
        for (let i = 0; i < 4; i++) {
            const ghostGeometry = new THREE.SphereGeometry(0.35, 16, 16);
            const ghostMaterial = new THREE.MeshStandardMaterial({ 
                color: ghostColors[i],
                emissive: ghostColors[i],
                emissiveIntensity: 0.3
            });
            const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
            
            const startPos = this.ghostStartPositions[i];
            ghost.position.set(startPos.x, 0.3, startPos.z);
            ghost.castShadow = true;
            this.scene.add(ghost);
            
            ghost.userData = {
                name: ghostNames[i],
                x: startPos.x,
                z: startPos.z,
                startX: startPos.x,
                startZ: startPos.z,
                direction: { x: 0, z: -1 },
                originalColor: ghostColors[i],
                scared: false
            };
            
            this.ghosts.push(ghost);
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.powerMode = false;
        this.powerModeTimer = 0;
        
        // Reset pellets
        this.pellets.forEach(pellet => {
            if (pellet.collected) {
                pellet.collected = false;
                pellet.mesh.visible = true;
            }
        });
        
        this.powerPellets.forEach(pellet => {
            if (pellet.collected) {
                pellet.collected = false;
                pellet.mesh.visible = true;
            }
        });
        
        // Reset pacman position
        this.pacman.position.set(this.pacmanStartPos.x, 0.3, this.pacmanStartPos.z);
        this.pacman.userData.x = this.pacmanStartPos.x;
        this.pacman.userData.z = this.pacmanStartPos.z;
        this.pacman.userData.direction = { x: 0, z: 0 };
        this.pacman.userData.nextDirection = { x: 0, z: 0 };
        
        // Reset ghosts
        this.ghosts.forEach(ghost => {
            ghost.position.set(ghost.userData.startX, 0.3, ghost.userData.startZ);
            ghost.userData.x = ghost.userData.startX;
            ghost.userData.z = ghost.userData.startZ;
            ghost.userData.scared = false;
            ghost.material.color.setHex(ghost.userData.originalColor);
            ghost.material.emissive.setHex(ghost.userData.originalColor);
        });
        
        this.updateUI();
        document.getElementById('game-message').classList.remove('active');
    }
    
    onKeyDown(event) {
        this.keys[event.key] = true;
        
        if (this.gameState !== 'playing') return;
        
        const next = this.pacman.userData.nextDirection;
        
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                next.x = 0;
                next.z = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                next.x = 0;
                next.z = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                next.x = -1;
                next.z = 0;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                next.x = 1;
                next.z = 0;
                break;
            case ' ':
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.startGame();
                break;
        }
    }
    
    onKeyUp(event) {
        this.keys[event.key] = false;
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showMessage('PAUSED', 'Press Space to continue');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('game-message').classList.remove('active');
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update power mode timer
        if (this.powerMode) {
            this.powerModeTimer--;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
                this.ghosts.forEach(ghost => {
                    ghost.userData.scared = false;
                    ghost.material.color.setHex(ghost.userData.originalColor);
                    ghost.material.emissive.setHex(ghost.userData.originalColor);
                });
            }
            
            // Animate power pellets pulsing
            const pulseScale = 1 + Math.sin(Date.now() * this.powerPelletPulseSpeed) * this.powerPelletPulseAmount;
            this.powerPellets.forEach(pellet => {
                if (!pellet.collected) {
                    pellet.mesh.scale.set(pulseScale, pulseScale, pulseScale);
                }
            });
        }
        
        // Update pacman
        this.updatePacman();
        
        // Update ghosts
        this.updateGhosts();
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
        this.checkWinCondition();
    }
    
    updatePacman() {
        const userData = this.pacman.userData;
        
        // Try to change direction if requested
        if (userData.nextDirection.x !== 0 || userData.nextDirection.z !== 0) {
            const nextX = Math.round(userData.x + userData.nextDirection.x * this.pacmanSpeed);
            const nextZ = Math.round(userData.z + userData.nextDirection.z * this.pacmanSpeed);
            
            if (this.isValidMove(nextX, nextZ)) {
                userData.direction.x = userData.nextDirection.x;
                userData.direction.z = userData.nextDirection.z;
            }
        }
        
        // Move in current direction
        if (userData.direction.x !== 0 || userData.direction.z !== 0) {
            const newX = userData.x + userData.direction.x * this.pacmanSpeed;
            const newZ = userData.z + userData.direction.z * this.pacmanSpeed;
            
            if (this.isValidMove(Math.round(newX), Math.round(newZ))) {
                userData.x = newX;
                userData.z = newZ;
                this.pacman.position.x = newX;
                this.pacman.position.z = newZ;
            }
        }
        
        // Animate pacman rotation
        this.pacman.rotation.y += 0.1;
    }
    
    updateGhosts() {
        this.ghosts.forEach(ghost => {
            const userData = ghost.userData;
            
            // Simple AI: move towards pacman or away if scared
            if (Math.random() < this.ghostDirectionChangeChance) { // Change direction occasionally
                const dx = this.pacman.userData.x - userData.x;
                const dz = this.pacman.userData.z - userData.z;
                
                const possibleDirections = [
                    { x: 0, z: -1 },
                    { x: 0, z: 1 },
                    { x: -1, z: 0 },
                    { x: 1, z: 0 }
                ];
                
                // Filter valid directions
                const validDirections = possibleDirections.filter(dir => {
                    const nextX = Math.round(userData.x + dir.x * 0.5);
                    const nextZ = Math.round(userData.z + dir.z * 0.5);
                    return this.isValidMove(nextX, nextZ);
                });
                
                if (validDirections.length > 0) {
                    if (userData.scared) {
                        // Run away from pacman
                        validDirections.sort((a, b) => {
                            const distA = Math.abs((userData.x + a.x) - this.pacman.userData.x) + 
                                         Math.abs((userData.z + a.z) - this.pacman.userData.z);
                            const distB = Math.abs((userData.x + b.x) - this.pacman.userData.x) + 
                                         Math.abs((userData.z + b.z) - this.pacman.userData.z);
                            return distB - distA;
                        });
                    } else {
                        // Chase pacman
                        validDirections.sort((a, b) => {
                            const distA = Math.abs((userData.x + a.x) - this.pacman.userData.x) + 
                                         Math.abs((userData.z + a.z) - this.pacman.userData.z);
                            const distB = Math.abs((userData.x + b.x) - this.pacman.userData.x) + 
                                         Math.abs((userData.z + b.z) - this.pacman.userData.z);
                            return distA - distB;
                        });
                    }
                    
                    userData.direction = validDirections[0];
                }
            }
            
            // Move ghost
            const speed = userData.scared ? this.ghostSpeed * 0.7 : this.ghostSpeed;
            const newX = userData.x + userData.direction.x * speed;
            const newZ = userData.z + userData.direction.z * speed;
            
            if (this.isValidMove(Math.round(newX), Math.round(newZ))) {
                userData.x = newX;
                userData.z = newZ;
                ghost.position.x = newX;
                ghost.position.z = newZ;
            } else {
                // Hit a wall, choose new direction
                userData.direction.x = 0;
                userData.direction.z = 0;
            }
            
            // Animate ghosts
            ghost.position.y = 0.3 + Math.sin(Date.now() * this.ghostFloatSpeed + ghost.userData.startX) * this.ghostFloatAmount;
        });
    }
    
    isValidMove(x, z) {
        if (x < 0 || x >= this.mazeWidth || z < 0 || z >= this.mazeHeight) {
            return false;
        }
        return this.maze[z][x] !== 1;
    }
    
    checkCollisions() {
        // Check pellet collection
        this.pellets.forEach(pellet => {
            if (!pellet.collected) {
                const dx = this.pacman.userData.x - pellet.x;
                const dz = this.pacman.userData.z - pellet.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < 0.4) {
                    pellet.collected = true;
                    pellet.mesh.visible = false;
                    this.score += 10;
                    this.updateUI();
                }
            }
        });
        
        // Check power pellet collection
        this.powerPellets.forEach(pellet => {
            if (!pellet.collected) {
                const dx = this.pacman.userData.x - pellet.x;
                const dz = this.pacman.userData.z - pellet.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < 0.4) {
                    pellet.collected = true;
                    pellet.mesh.visible = false;
                    this.score += 50;
                    this.activatePowerMode();
                    this.updateUI();
                }
            }
        });
        
        // Check ghost collision
        this.ghosts.forEach(ghost => {
            const dx = this.pacman.userData.x - ghost.userData.x;
            const dz = this.pacman.userData.z - ghost.userData.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 0.6) {
                if (ghost.userData.scared) {
                    // Eat ghost
                    this.score += 200;
                    ghost.position.set(ghost.userData.startX, 0.3, ghost.userData.startZ);
                    ghost.userData.x = ghost.userData.startX;
                    ghost.userData.z = ghost.userData.startZ;
                    ghost.userData.scared = false;
                    ghost.material.color.setHex(ghost.userData.originalColor);
                    ghost.material.emissive.setHex(ghost.userData.originalColor);
                    this.updateUI();
                } else {
                    // Lose life
                    this.loseLife();
                }
            }
        });
    }
    
    activatePowerMode() {
        this.powerMode = true;
        this.powerModeTimer = this.powerModeDuration;
        
        this.ghosts.forEach(ghost => {
            ghost.userData.scared = true;
            ghost.material.color.setHex(0x0000ff);
            ghost.material.emissive.setHex(0x0000ff);
        });
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset positions
            this.pacman.position.set(this.pacmanStartPos.x, 0.3, this.pacmanStartPos.z);
            this.pacman.userData.x = this.pacmanStartPos.x;
            this.pacman.userData.z = this.pacmanStartPos.z;
            this.pacman.userData.direction = { x: 0, z: 0 };
            
            this.ghosts.forEach(ghost => {
                ghost.position.set(ghost.userData.startX, 0.3, ghost.userData.startZ);
                ghost.userData.x = ghost.userData.startX;
                ghost.userData.z = ghost.userData.startZ;
            });
        }
    }
    
    checkWinCondition() {
        const allPelletsCollected = this.pellets.every(p => p.collected) && 
                                   this.powerPellets.every(p => p.collected);
        
        if (allPelletsCollected) {
            this.gameWon();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.showMessage('GAME OVER', `Final Score: ${this.score}<br>Press R to restart`);
    }
    
    gameWon() {
        this.gameState = 'won';
        this.showMessage('YOU WIN!', `Final Score: ${this.score}<br>Press R to play again`);
    }
    
    showMessage(title, message) {
        const messageEl = document.getElementById('game-message');
        messageEl.querySelector('h1').textContent = title;
        messageEl.querySelector('p').innerHTML = message;
        messageEl.querySelector('button').style.display = 'none';
        messageEl.classList.add('active');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        
        const livesEl = document.getElementById('lives');
        livesEl.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const lifeIcon = document.createElement('span');
            lifeIcon.className = 'life-icon';
            livesEl.appendChild(lifeIcon);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
        
        // Update FPS counter
        this.frames++;
        const currentTime = performance.now();
        if (currentTime >= this.lastTime + 1000) {
            const fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new PacmanGame();
});
