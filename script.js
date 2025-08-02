// This function waits for the DOM to be fully loaded before executing the game logic.  This ensures that all HTML elements are available before the script attempts to access them.
document.addEventListener('DOMContentLoaded', () => {
    // This gets the main game area element where all game elements will be placed.
    const gameArea = document.getElementById('game-area');
    // This gets the player element, representing the player's ship or character.
    const player = document.getElementById('player');
    // This gets the element used to display the player's score.
    const scoreDisplay = document.getElementById('score');
    // This gets the element used to display the player's remaining lives.
    const livesDisplay = document.getElementById('lives');
    // This gets the element that displays the phrase the player needs to collect letters for.
    const phraseContainer = document.getElementById('phrase-container');
    // This gets the element that displays the current score multiplier.
    const multiplierIndicator = document.getElementById('multiplier-indicator');
    // This gets the game over screen element.
    const gameOverScreen = document.getElementById('game-over');
    // This gets the element to display the final score when the game is over.
    const finalScoreDisplay = document.getElementById('final-score');
    // This gets the game win screen element.
    const gameWinScreen = document.getElementById('game-win');
    // This gets the element to display the final score when the game is won.
    const winScoreDisplay = document.getElementById('win-score');
    // This gets the canvas element used for the background starfield animation.
    const backgroundCanvas = document.getElementById('background-canvas');
    // This gets the 2D rendering context of the canvas, used for drawing.
    const ctx = backgroundCanvas.getContext('2d');

    // Initialize the player's score.
    let score = 0;
    // Initialize the player's lives.
    let lives = 5;
    // Variable to store the game loop interval.
    let gameInterval;
    // Variable to store the enemy creation interval.
    let enemyInterval;
    // Variable to store the letter creation interval.
    let letterInterval;
    // Flag to indicate whether the game is over.
    let isGameOver = false;
    // Initial speed of the enemies.
    let enemySpeed = 2;
    // Number of projectiles the player can fire simultaneously.
    let projectiles = 1;
    // Flag to indicate whether the player is invincible (e.g., after being hit).
    let isInvincible = false;
    // Current score multiplier.
    let scoreMultiplier = 1;
    // Flag to indicate whether the player is currently shooting.
    let isShooting = false;
    // Object to store the state of pressed movement keys.
    let movementKeys = {};

    // Array to store the star objects for the background animation.
    let stars = [];
    // Number of stars to generate for the background.
    const numStars = 200;
    // Array of colors to use for the stars.
    const starColors = ['#FFFFFF', '#FFD700', '#ADD8E6', '#FF69B4', '#90EE90'];

    // The phrase the player needs to collect letters for.
    const phrase = "Happy Birthday to samsom";
    // Array to track which letters of the phrase have been collected.
    let collectedLetters = Array(phrase.length).fill(false);

    // This function resizes the background canvas to match the size of the game area.  It's important to call this function whenever the window is resized to maintain the correct aspect ratio.
    function resizeCanvas() {
        backgroundCanvas.width = gameArea.clientWidth;
        backgroundCanvas.height = gameArea.clientHeight;
    }

    // This function initializes the starfield by creating and positioning the stars randomly across the canvas.  It should be called once at the start of the game and whenever the canvas is resized.
    function initStars() {
        resizeCanvas();
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * backgroundCanvas.width,
                y: Math.random() * backgroundCanvas.height,
                size: Math.random() * 2 + 1, // size between 1 and 3
                speed: Math.random() * 2 + 1, // speed between 1 and 3
                color: starColors[Math.floor(Math.random() * starColors.length)]
            });
        }
    }

    // This function draws the stars on the canvas. It clears the canvas and then iterates through the stars array, drawing each star using its properties (x, y, size, color).
    function drawStars() {
        ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        stars.forEach(star => {
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // This function updates the position of each star in the starfield, making them move downwards.  If a star goes off-screen, it's repositioned at the top.
    function updateStars() {
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > backgroundCanvas.height) {
                star.y = 0;
                star.x = Math.random() * backgroundCanvas.width;
            }
        });
    }

    // This function updates the UI elements (score, lives, phrase progress, multiplier) to reflect the current game state.  It's called whenever there's a change in score, lives, collected letters, or multiplier.
    function updateUI() {
        scoreDisplay.textContent = score;
        let hearts = '';
        for (let i = 0; i < lives; i++) {
            hearts += '♥️';
        }
        livesDisplay.innerHTML = hearts;

        let displayedPhrase = '';
        for (let i = 0; i < phrase.length; i++) {
            if (phrase[i] === ' ') {
                displayedPhrase += ' ';
            } else if (collectedLetters[i]) {
                displayedPhrase += phrase[i];
            } else {
                displayedPhrase += '_';
            }
        }
        phraseContainer.textContent = displayedPhrase;

        multiplierIndicator.textContent = scoreMultiplier > 1 ? ` (x${scoreMultiplier})` : '';
    }

    // This function moves the player horizontally based on the given x-coordinate.  It ensures the player stays within the bounds of the game area.  The x-coordinate is relative to the game area, not the entire screen.
    function movePlayer(x) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        let newLeft = x - gameAreaRect.left - playerRect.width / 2;
        newLeft = Math.max(0, newLeft);
        newLeft = Math.min(gameAreaRect.width - playerRect.width, newLeft);
        player.style.left = `${newLeft}px`;
    }

    // Event listener for mouse movement on desktop.  Moves the player based on the mouse's x-coordinate.
    document.addEventListener('mousemove', (e) => {
        movePlayer(e.clientX);
        // On desktop, we can assume shooting is tied to keyboard spacebar
    });
    // Event listener for touch movement on mobile.  Moves the player based on the touch's x-coordinate.  Prevents default touch behavior (scrolling).
    document.addEventListener('touchmove', (e) => {
        e.preventDefault(); // prevent screen scrolling
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    // Event listener for touch start on mobile.  Starts shooting when the screen is touched.
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(e.touches[0].clientX);
        isShooting = true;
    });
    // Event listener for touch end on mobile.  Stops shooting when the touch is released.
    document.addEventListener('touchend', () => {
        isShooting = false;
    });

    // Event listener for keyboard key presses.  Records pressed keys in the movementKeys object.  Spacebar is used for shooting.
    document.addEventListener('keydown', (e) => {
        movementKeys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            isShooting = true;
        }
    });

    // Event listener for keyboard key releases.  Updates the movementKeys object when keys are released.
    document.addEventListener('keyup', (e) => {
        movementKeys[e.key] = false;
        if (e.key === ' ') {
            e.preventDefault();
            isShooting = false;
        }
    });

    // This function handles player movement based on the arrow keys.  It checks the movementKeys object to see which keys are pressed and updates the player's position accordingly.  It prevents movement if the game is over.
    function handleKeyboardMovement() {
        if (isGameOver) return;
        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        let currentLeft = parseFloat(player.style.left) || (gameAreaRect.width / 2 - playerRect.width / 2);

        if (movementKeys['ArrowLeft'] && currentLeft > 0) {
            currentLeft -= 10;
        }
        if (movementKeys['ArrowRight'] && currentLeft < gameAreaRect.width - playerRect.width) {
            currentLeft += 10;
        }
        player.style.left = `${currentLeft}px`;
    }

    // This function handles shooting projectiles.  It creates projectile elements and adds them to the game area.  The number of projectiles fired depends on the projectiles variable.  It prevents shooting if the game is over or if isShooting is false.
    function shoot() {
        if (!isShooting || isGameOver) return;

        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        const spread = 15; // Increased spread for better visuals

        for (let i = 0; i < projectiles; i++) {
            const projectile = document.createElement('div');
            projectile.className = 'projectile';
            projectile.textContent = '⚡';
            const baseLeft = playerRect.left - gameAreaRect.left + playerRect.width / 2 - 10;
            // Calculate offset from the center
            const offset = (i - (projectiles - 1) / 2) * spread;
            projectile.style.left = `${baseLeft + offset}px`;
            projectile.style.top = `${playerRect.top - gameAreaRect.top}px`;
            gameArea.appendChild(projectile);
        }
    }

    // This function moves all dynamic elements in the game (projectiles, enemies, dropped items) downwards.  It removes elements that go off-screen.
    function moveElements() {
        // Move projectiles
        document.querySelectorAll('.projectile').forEach(projectile => {
            let top = parseFloat(projectile.style.top);
            if (top < 0) {
                projectile.remove();
            } else {
                projectile.style.top = `${top - 10}px`;
            }
        });

        // Move enemies
        document.querySelectorAll('.enemy').forEach(enemy => {
            let top = parseFloat(enemy.style.top);
            if (top > gameArea.clientHeight) {
                enemy.remove();
            } else {
                enemy.style.top = `${top + enemySpeed}px`;
            }
        });

        // Move dropped items
        document.querySelectorAll('.dropped-item').forEach(item => {
            let top = parseFloat(item.style.top);
            if (top > gameArea.clientHeight) {
                item.remove();
            } else {
                item.style.top = `${top + 2}px`;
            }
        });
    }

    // This function creates a new enemy element and adds it to the game area.  The enemy's horizontal position is randomized.  It prevents enemy creation if the game is over.
    function createEnemy() {
        if (isGameOver) return;

        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.textContent = '🎁';
        enemy.style.left = `${Math.random() * (gameArea.clientWidth - 40)}px`;
        enemy.style.top = '-40px';
        gameArea.appendChild(enemy);
    }

    // This function creates a new letter element and adds it to the game area.  It selects a random uncollected letter from the phrase.  If all letters are collected, it creates a pretzel instead.
    function createLetter() {
        if (isGameOver) return;

        const uncollectedIndexes = [];
        for (let i = 0; i < phrase.length; i++) {
            if (phrase[i] !== ' ' && !collectedLetters[i]) {
                uncollectedIndexes.push(i);
            }
        }

        if (uncollectedIndexes.length === 0) {
            if (!document.querySelector('.pretzel')) {
                 createPretzel();
            }
            // After one round of letters, restart the interval for the next round
            clearInterval(letterInterval);
            for(let i = 0; i < collectedLetters.length; i++){
                if(phrase[i] !== ' ') collectedLetters[i] = false;
            }
            letterInterval = setInterval(createLetter, 10000);
            return;
        }

        const letterIndex = uncollectedIndexes[0];
        const letter = document.createElement('div');
        letter.className = 'dropped-item letter-item';
        letter.textContent = phrase[letterIndex];
        letter.dataset.type = 'letter';
        letter.dataset.index = letterIndex;
        letter.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;
        letter.style.top = '-50px';
        gameArea.appendChild(letter);
    }

    // This function creates a pretzel element (the win condition) and adds it to the game area. It prevents creating multiple pretzels simultaneously.
    function createPretzel() {
        if (isGameOver || document.querySelector('[data-type="pretzel"]')) return;
        const pretzel = document.createElement('div');
        pretzel.className = 'dropped-item';
        pretzel.textContent = '🥨';
        pretzel.dataset.type = 'pretzel';
        pretzel.style.left = `${Math.random() * (gameArea.clientWidth - 30)}px`;
        pretzel.style.top = '-40px';
        pretzel.style.fontSize = '2em';
        gameArea.appendChild(pretzel);
    }

    // This function checks for collisions between the player, enemies, projectiles, and dropped items.  It handles the consequences of collisions (e.g., player hit, enemy destroyed, item collected).
    function checkCollisions() {
        if (isGameOver) return;
        const playerRect = player.getBoundingClientRect();
        const enemies = document.querySelectorAll('.enemy');
        const projectiles = document.querySelectorAll('.projectile');
 
        // Helper function to handle enemy destruction
        const destroyEnemy = (enemy) => {
            createExplosion(enemy.getBoundingClientRect());
            dropItem(enemy.getBoundingClientRect());
            enemy.remove();
        };
 
        // Player vs Enemy
        enemies.forEach(enemy => {
            if (isColliding(playerRect, enemy.getBoundingClientRect())) {
                if (!isInvincible) {
                    playerHit();
                }
                destroyEnemy(enemy);
            }
        });
 
        // Projectile vs Enemy
        projectiles.forEach(projectile => {
            // Find the first enemy that collides with this projectile
            const enemyHit = Array.from(enemies).find(enemy => 
                enemy.parentElement && isColliding(projectile.getBoundingClientRect(), enemy.getBoundingClientRect())
            );
 
            if (enemyHit) {
                projectile.remove();
                destroyEnemy(enemyHit);
                score += 5 * scoreMultiplier;
                updateUI();
            }
        });

        // Player vs Dropped Item
        document.querySelectorAll('.dropped-item').forEach(item => {
            if (isColliding(playerRect, item.getBoundingClientRect())) {
                applyItemEffect(item);
                item.remove();
            }
        });
    }

    // This function checks if two rectangles are colliding.  It uses the bounding client rectangles of the elements to determine overlap.
    function isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                   rect1.left > rect2.right ||
                   rect1.bottom < rect2.top ||
                   rect1.top > rect2.bottom);
    }

    // This function handles what happens when the player is hit by an enemy.  It reduces the player's lives, updates the UI, and triggers invincibility for a short period.  If lives reach zero, it calls gameOver().
    function playerHit() {
        lives--;
        updateUI(); // Update hearts immediately
        if (lives <= 0) {
            gameOver();
            return;
        }

        createExplosion(player.getBoundingClientRect());
        isInvincible = true;
        player.classList.add('flicker');
        setTimeout(() => {
            isInvincible = false;
            player.classList.remove('flicker');
        }, 2000);
    }

    // This function creates an explosion effect at a given rectangle's position.  It creates an explosion element, positions it, adds it to the game area, and then removes it after a short delay.
    function createExplosion(rect) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.textContent = '💥';
        // Position explosion relative to gameArea
        const gameAreaRect = gameArea.getBoundingClientRect();
        explosion.style.left = `${rect.left - gameAreaRect.left}px`;
        explosion.style.top = `${rect.top - gameAreaRect.top}px`;
        gameArea.appendChild(explosion);
        setTimeout(() => explosion.remove(), 500);
    }

    // This function randomly drops an item at the position of a destroyed enemy.  The type of item dropped is determined probabilistically.
    function dropItem(rect) {
        const chance = Math.random() * 100;
        let item = {};
        let emojiSet;

        if (chance < 1) { // 1%
            emojiSet = ['🍕', '🥯', '🍰', '🎂', '🧁', '🍭', '🍬', '🍩', '🍨', '🍉'];
            item = { type: 'life', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 25) { // 15%
            emojiSet = ['😊', '😁', '👍', '🤣', '👌', '🤩', '😝', '😹', '😎', '🐣'];
            item = { type: 'points', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 40) { // 15%
            emojiSet = ['⭐', '🌞', '🌜', '❄️', '⛄', '⚡', '🌧️', '☄️', '🌡️', '⛱️'];
            item = { type: 'slow', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 50) { // 10%
            emojiSet = ['✨', '🎉', '🪄', '🪅', '🕹️', '🪁', '🎢', '🎈', '🪂'];
            item = { type: 'multiplier', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 65) { // 15%
            emojiSet = ['🤝', '👋', '👏', '🤲', '💪', '✌️', '🤙', '🤛', '✊', '🙏'];
            item = { type: 'weapon', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else if (chance < 80) { // 15%
            emojiSet = ['📿', '🕯️', '🪔', '📗', '🕋', '🕌', '🌜', '☪️', '🤲', '🕊️'];
            item = { type: 'shield', emoji: emojiSet[Math.floor(Math.random() * emojiSet.length)] };
        } else { // 20%
            return; // No drop
        }

        const dropped = document.createElement('div');
        dropped.className = 'dropped-item';
        dropped.textContent = item.emoji;
        dropped.dataset.type = item.type;
        const gameAreaRect = gameArea.getBoundingClientRect();
        dropped.style.left = `${rect.left - gameAreaRect.left}px`;
        dropped.style.top = `${rect.top - gameAreaRect.top}px`;
        gameArea.appendChild(dropped);
    }

    // This function applies the effect of a collected item.  It uses a switch statement to handle different item types (life, points, slow, multiplier, weapon, shield, letter, pretzel).  It updates the score, lives, enemy speed, multiplier, projectiles, invincibility, and collected letters accordingly.  It also calls updateUI() to refresh the display.
    function applyItemEffect(item) {
        const type = item.dataset.type;

        switch (type) {
            case 'life':
                score += 5 * scoreMultiplier;
                lives++;
                break;
            case 'points':
                score += 15 * scoreMultiplier;
                break;
            case 'slow':
                score += 5 * scoreMultiplier;
                const currentSpeed = enemySpeed;
                enemySpeed = Math.max(1, enemySpeed / 2);
                setTimeout(() => enemySpeed = currentSpeed, 10000);
                break;
            case 'multiplier':
                score += 5 * scoreMultiplier;
                scoreMultiplier = 3;
                setTimeout(() => scoreMultiplier = 1, 10000);
                break;
            case 'weapon':
                score += 5 * scoreMultiplier;
                projectiles = Math.min(20, projectiles + 1);
                break;
            case 'shield':
                score += 5 * scoreMultiplier;
                if(document.getElementById('shield')) return; // Don't stack shields
                isInvincible = true;
                const shieldDiv = document.createElement('div');
                shieldDiv.id = 'shield';
                player.appendChild(shieldDiv);
                setTimeout(() => {
                    isInvincible = false;
                    document.getElementById('shield')?.remove();
                }, 10000);
                break;
            case 'letter':
                const index = parseInt(item.dataset.index);
                if (!collectedLetters[index]) {
                    collectedLetters[index] = true;
                    score += 20 * scoreMultiplier;
                }
                const allLettersCollected = phrase.split('').every((char, i) => {
                    return char === ' ' || collectedLetters[i];
                });
                if(allLettersCollected) {
                    createPretzel();
                }
                break;
            case 'pretzel':
                score += 100 * scoreMultiplier;
                gameWin();
                break;
        }
        updateUI();
    }

    // This function is the main game loop.  It updates the game state, draws the scene, checks for collisions, and then calls itself using requestAnimationFrame for smooth animation.
    function gameLoop() {
        if (isGameOver) return;
        updateStars();
        drawStars();
        handleKeyboardMovement();
        moveElements();
        checkCollisions();
        updateUI(); // Moved from loop to only when state changes
        requestAnimationFrame(gameLoop);
    }

    // This function initializes and starts the game.  It initializes the stars, sets up event listeners, starts intervals for enemy and letter creation, and calls gameLoop().
    function startGame() {
        initStars();
        window.addEventListener('resize', initStars); // Re-initialize on resize
        updateUI();
        enemyInterval = setInterval(createEnemy, 1000);
        setInterval(() => {
            if (!isGameOver) enemySpeed += 0.2;
        }, 5000);
        letterInterval = setInterval(createLetter, 10000); // Changed from 100ms to 10 seconds

        // Auto-fire interval
        setInterval(() => {
            if (isShooting) {
                 shoot();
            }
        }, 300); // Fire rate

        gameLoop();
    }

    // This function handles the game over state.  It stops intervals, displays the game over screen, and removes all game elements from the game area.
    function gameOver() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'block';
        gameArea.querySelectorAll('*').forEach(el => el.remove());
    }

    // This function handles the game win state.  It stops intervals, displays the game win screen, and removes all game elements from the game area.
    function gameWin() {
        isGameOver = true;
        clearInterval(enemyInterval);
        clearInterval(letterInterval);
        winScoreDisplay.textContent = score;
        gameWinScreen.style.display = 'block';
        gameArea.querySelectorAll('*').forEach(el => el.remove());
    }

    startGame();
});