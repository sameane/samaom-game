/**
 * =================================================================
 * --- Global Setup & Configuration ---
 * This section initializes the canvas and sets up global variables.
 * You can customize the core aspects of the animation here.
 * =================================================================
 */

// Get the canvas element from the HTML and its 2D rendering context.
const canvas = document.getElementById('birthdayCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas to fill the entire browser window.
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// --- CUSTOMIZE HERE ---
// This is the font used for the message. It's a "font stack", meaning the browser
// will try each font in order until it finds one it has.
const FONT_STACK = `'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;

// --- CUSTOMIZE HERE ---
// This is the message that will be displayed. You can change it to whatever you like!
// Emojis are supported.
const message = "Happy Birthday to Samsom 🥨";

// --- CUSTOMIZE HERE ---
// The padding from the edge of the screen for the containing frame.
const FRAME_PADDING = 20;

// These arrays will store all the animated objects (letters, rockets, etc.).
let letters = [];
let rockets = [];
let particles = [];
let balloons = [];

// This will hold the balloon object that is currently being dragged.
let grabbedBalloon = null;

// This object tracks the mouse or touch position for interactive effects.
const mouse = {
    x: undefined,
    y: undefined,
    prevX: undefined, // Previous X for calculating velocity
    prevY: undefined, // Previous Y for calculating velocity
    vx: 0,            // Velocity X for "flinging"
    vy: 0,            // Velocity Y for "flinging"
    radius: 100 // --- CUSTOMIZE HERE ---: The radius around the cursor that affects other balloons.
};


// --- Event Listeners ---
window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    init(); // Re-initialize the animation on resize to recenter the text.
});

// This function is called when the user presses the mouse button or touches the screen.
function handlePointerDown(e) {
    const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
    const pointerY = e.touches ? e.touches[0].clientY : e.clientY;

    // Set mouse position for interactions in the same frame
    mouse.x = pointerX;
    mouse.y = pointerY;

    // Check if we are grabbing a balloon. We loop backwards to correctly handle
    // clicking on overlapping balloons (the top-most one will be selected).
    for (let i = balloons.length - 1; i >= 0; i--) {
        const balloon = balloons[i];
        const distance = Math.hypot(balloon.x - pointerX, balloon.y - pointerY);
        if (distance < balloon.radius) {
            grabbedBalloon = balloon;
            grabbedBalloon.isGrabbed = true;
            // Bring the grabbed balloon to the end of the array so it's drawn last (on top).
            balloons.push(balloons.splice(i, 1)[0]);
            break; // We've found our balloon, no need to check others.
        }
    }
}

// This function is called when the user moves the mouse or drags their finger.
function handlePointerMove(e) {
    // Store previous position before updating
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    const newX = e.touches ? e.touches[0].clientX : e.clientX;
    const newY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate velocity for the fling effect. If prevX is undefined, velocity is 0.
    if (mouse.prevX !== undefined) {
        mouse.vx = newX - mouse.prevX;
        mouse.vy = newY - mouse.prevY;
    } else {
        mouse.vx = 0;
        mouse.vy = 0;
    }

    mouse.x = newX;
    mouse.y = newY;
}

// This function is called when the user releases the mouse button or lifts their finger.
function handlePointerUp() {
    if (grabbedBalloon) {
        grabbedBalloon.isGrabbed = false;
        // Apply the cursor's velocity to the balloon for a "fling" effect.
        grabbedBalloon.vx = mouse.vx;
        grabbedBalloon.vy = mouse.vy;
        grabbedBalloon = null;
    }
}

// This function is called when the mouse leaves the canvas area.
function handlePointerLeave() {
    // If we're dragging a balloon and the mouse leaves, release it.
    handlePointerUp();
    // Reset mouse coordinates so balloons stop reacting.
    mouse.x = undefined;
    mouse.y = undefined;
    mouse.prevX = undefined;
    mouse.prevY = undefined;
}

// --- Assigning the event handlers ---

// Mouse events
window.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);
window.addEventListener('mouseout', handlePointerLeave);

// Touch events
window.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch actions like zoom or scrolling.
    handlePointerDown(e);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while dragging.
    handlePointerMove(e);
}, { passive: false });

window.addEventListener('touchend', handlePointerUp);
window.addEventListener('touchcancel', handlePointerUp); // Also release on abnormal touch end.


/**
 * =================================================================
 * --- Utility Functions ---
 * Small helper functions used throughout the script.
 * =================================================================
 */

// Returns a random number between a min and max value.
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns a random color from a predefined palette.
function randomColor() {
    const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// --- Classes ---

/**
 * Represents a single particle from a firework explosion.
 */
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // --- CUSTOMIZE HERE ---
        // `size`: How big the particles are.
        // `life`: How long the particle lasts before fading.
        // `speed`: How fast the particle travels initially.
        // `gravity`: How much gravity affects the particle.
        this.size = random(2, 5);
        this.life = 1;
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.1;
        this.fade = 0.02;
    }

    // Updates the particle's position and life.
    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.fade;
    }

    // Draws the particle on the canvas.
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * Represents a rocket that flies to a letter's position to trigger an explosion.
 */
class Rocket {
    constructor(targetX, targetY, onExplode) {
        this.x = random(canvasWidth * 0.2, canvasWidth * 0.8);
        this.y = canvasHeight;
        this.tx = targetX;
        this.ty = targetY;
        this.onExplode = onExplode;
        this.color = randomColor();
        // --- CUSTOMIZE HERE ---: The speed of the rocket.
        this.speed = 6;
        this.angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    }

    // Moves the rocket towards its target. When it gets close, it calls the onExplode function.
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (Math.hypot(this.tx - this.x, this.ty - this.y) < 5) {
            this.onExplode();
        }
    }

    // Draws the rocket as a small triangle, rotated to face its direction of travel.
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Represents a single character of the message. It manages its own state (waiting, exploding, revealed, etc.).
 */
class Letter {
    constructor(char, x, y) {
        this.char = char;
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.size = Math.min(canvasWidth / (message.length + 2), 60);
        this.state = 'waiting'; // Can be: 'waiting', 'firework', 'revealed', 'balloon', 'done'
        this.color = '#fff';
        this.revealTimeout = null;
        this.balloon = null;
    }

    // Starts the firework sequence for this letter.
    startFirework() {
        if (this.state !== 'waiting') return;
        this.state = 'firework';
        const rocket = new Rocket(this.x, this.y, () => this.explode());
        rockets.push(rocket);
    }

    // Called when a rocket reaches the letter. Creates a particle explosion.
    explode() {
        this.state = 'revealed';
        const explosionColor = randomColor();
        // --- CUSTOMIZE HERE ---: The number of particles in each explosion.
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(this.x, this.y, explosionColor));
        }
        // After the explosion, wait a bit before attaching a balloon.
        // --- CUSTOMIZE HERE ---: The delay (in milliseconds) before the balloon appears. 5000ms = 5 seconds.
        this.revealTimeout = setTimeout(() => {
            this.attachBalloon();
        }, 5000);
    }

    // Creates a balloon and attaches it to this letter.
    attachBalloon() {
        if (this.state !== 'revealed') return;
        this.state = 'balloon';
        this.balloon = new Balloon(this);
        balloons.push(this.balloon);
    }

    // Updates the letter's state, primarily by updating its balloon if it has one.
    update() {
        if (this.balloon) {
            this.balloon.update();
        }
    }

    draw() {
        // Only draw the letter if it has been revealed by the firework or has a balloon.
        if (this.state === 'revealed' || this.state === 'balloon') {
            ctx.fillStyle = this.color;
            ctx.font = `bold ${this.size}px ${FONT_STACK}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, this.x, this.y);
        }
        // If the letter has a balloon, draw the balloon too.
        if (this.balloon) {
            this.balloon.draw();
        }
    }
}

/**
 * Represents a balloon that lifts a letter up and off the screen.
 */
class Balloon {
    constructor(letter) {
        this.letter = letter;
        this.x = letter.x;
        this.y = letter.y;
        this.vx = 0;
        this.vy = -0.5; // Initial upward speed
        this.isGrabbed = false; // New property to track grab state
        // --- CUSTOMIZE HERE ---
        // `radius`: How big the balloon is relative to the letter size.
        // `stringLength`: How long the balloon string is.
        this.radius = letter.size * 0.8;
        this.color = randomColor();
        this.stringLength = letter.size * 1.5;
    }

    update() {
        // If the balloon is grabbed, it follows the cursor.
        if (this.isGrabbed) {
            this.x = mouse.x;
            this.y = mouse.y;
            // When grabbed, its own velocity is nullified. The fling velocity will be
            // applied on release in the `handlePointerUp` function.
            this.vx = 0;
            this.vy = 0;

        } else {
            // --- This is the "not grabbed" behavior ---

            // Interaction with mouse (repel effect for other balloons)
            if (mouse.x !== undefined && mouse.y !== undefined) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // The '0.5' values control how strongly the mouse pushes the balloons.
                    this.vx += Math.cos(angle) * force * 0.5;
                    this.vy += Math.sin(angle) * force * 0.5;
                }
            }

            // Apply friction/damping to slow down the balloon's movement from interactions.
            this.vx *= 0.95;
            this.vy *= 0.95;

            // Add a constant upward force to make the balloon float up.
            this.vy -= 0.05;

            // Update position based on its velocity.
            this.x += this.vx;
            this.y += this.vy;
        }

        // --- Frame collision detection & bounce (applied in both grabbed and not-grabbed states) ---
        const bounceDamping = -0.7; // How much velocity is lost on bounce.

        // Left wall
        if (this.x - this.radius < FRAME_PADDING) {
            this.x = FRAME_PADDING + this.radius;
            // Only bounce if not being held, otherwise it fights the user's drag.
            if (!this.isGrabbed) this.vx *= bounceDamping;
        }
        // Right wall
        if (this.x + this.radius > canvasWidth - FRAME_PADDING) {
            this.x = canvasWidth - FRAME_PADDING - this.radius;
            if (!this.isGrabbed) this.vx *= bounceDamping;
        }
        // Top wall
        if (this.y - this.radius < FRAME_PADDING) {
            this.y = FRAME_PADDING + this.radius;
            if (!this.isGrabbed) this.vy *= bounceDamping;
        }
        // Bottom wall (check based on the letter's position)
        const letterBottomY = this.y + this.stringLength + (this.letter.size / 2);
        if (letterBottomY > canvasHeight - FRAME_PADDING) {
            this.y = canvasHeight - FRAME_PADDING - (this.letter.size / 2) - this.stringLength;
            if (!this.isGrabbed) this.vy *= bounceDamping;
        }

        // The letter always follows the balloon.
        this.letter.x = this.x;
        this.letter.y = this.y + this.stringLength;
    }

    draw() {
        // Draw string
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.letter.x, this.letter.y);
        ctx.stroke();

        // Draw balloon
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw balloon highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * =================================================================
 * --- Main Logic ---
 * This section contains the core functions that run the animation.
 * =================================================================
 */

/**
 * Initializes or resets the entire animation.
 */
function init() {
    letters.forEach(l => {
        if (l.revealTimeout) clearTimeout(l.revealTimeout);
    });
    letters = [];
    rockets = [];
    particles = [];
    balloons = [];
    grabbedBalloon = null; // Also reset the grabbed balloon state

    // Calculate font size and position to center the text on the screen.
    const fontSize = Math.min(canvasWidth / (Array.from(message).length + 2), 60);
    ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
    const textWidth = ctx.measureText(message).width;
    const startX = (canvasWidth - textWidth) / 2;
    const startY = canvasHeight / 2;

    let currentX = startX;
    // Create a `Letter` object for each character in the message.
    for (const char of message) {
        const charWidth = ctx.measureText(char).width;
        if (char !== ' ') {
            const letter = new Letter(char, currentX + charWidth / 2, startY);
            letters.push(letter);
        }
        currentX += charWidth;
    }

    // Stagger the firework launch for each letter to create a sequential reveal effect.
    letters.forEach((letter, index) => {
        // --- CUSTOMIZE HERE ---: The delay (in milliseconds) between each firework launch. 300ms is a good starting point.
        setTimeout(() => {
            letter.startFirework();
        }, index * 300);
    });
}

/**
 * The main animation loop, called on every frame.
 */
function animate() {
    // Request the next frame, creating an infinite loop.
    requestAnimationFrame(animate);

    // Draw a semi-transparent rectangle over the whole canvas. This creates a "trail" or "fade" effect.
    // --- CUSTOMIZE HERE ---: The alpha value (0.2) controls the length of the trails. Lower is longer.
    ctx.fillStyle = 'rgba(12, 0, 26, 0.2)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Update and draw all active rockets. Loop backwards to safely remove items from the array.
    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update();
        rockets[i].draw();
        if (Math.hypot(rockets[i].tx - rockets[i].x, rockets[i].ty - rockets[i].y) < 5) {
            rockets.splice(i, 1);
        }
    }

    // Update and draw all active particles. Loop backwards to safely remove items.
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Update and draw all letters (which also handles their attached balloons).
    // Note: The `balloons` array is updated and drawn via the `letters` objects.
    letters.forEach(letter => {
        letter.update();
        letter.draw();
    });

    // Draw the containing frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 5;
    ctx.strokeRect(
        FRAME_PADDING,
        FRAME_PADDING,
        canvasWidth - FRAME_PADDING * 2,
        canvasHeight - FRAME_PADDING * 2
    );
}

/**
 * =================================================================
 * --- Start the Animation ---
 * These two lines kick everything off.
 * =================================================================
 */
init();
animate();