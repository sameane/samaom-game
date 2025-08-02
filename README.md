# simsim-game

## Gameplay Description

### Concept
The game features the player character **👆** and gift emojis **🎁** as enemies. The objective is to dodge and shoot the enemies to score points and collect letters to win.

### Gameplay Mechanics
*   **Player**: The player character is **👆**.
*   **Movement**:
    *   **Mouse/Touch**: The player follows the horizontal position of the mouse or finger.
    *   **Keyboard**: Use the `ArrowLeft` and `ArrowRight` keys to move.
*   **Firing**: Firing is automatic.
    *   **Touch**: The player fires continuously while a finger is on the screen.
    *   **Keyboard**: Hold the `Space` bar to fire.
*   **Enemies**: Enemies **🎁** move downwards from the top. Their speed progressively increases over time.
*   **Lives**: The player starts with 5 lives **♥️**.

### User Interface (UI)
The game features a header at the top of the screen:
*   **Left**: Displays the current score.
*   **Center**: Shows the collected letters for the phrase `Happy Birthday to simsim`.
*   **Right**: Displays remaining lives **♥️**.

## Collisions & Power-ups

### Collisions
*   **Player vs. Enemy**: If the player **👆** collides with an enemy **🎁**, an explosion **💥** occurs, the player loses one life **-1♥️**, and becomes invincible for a short duration (flicker effect). If lives reach zero, the game is over.
*   **Projectile vs. Enemy**: When an enemy is destroyed, it has a chance to drop a random power-up emoji.

### Item Drops
When an enemy **🎁** is destroyed, it has a chance to drop one of the following items:

| Chance | Emojis                               | Effect                                                              |
| :----: | :----------------------------------- | :------------------------------------------------------------------ |
|  10%   | 🍕🥯🍰🎂🧁🍭🍬🍩🍨🍉                 | `+5 points` and `+1 life ♥️`                                        |
|  15%   | 😊😁👍🤣👌🤩😝😹😎🐣                 | `+15 points`                                                        |
|  15%   | ⭐🌞🌜❄️⛄⚡🌧️☄️🌡️⛱️                 | `+5 points` and slows down all enemies for 10 seconds.              |
|  10%   | ✨🎉🪄🪅🕹️🪁🎢🎈🪂                   | `+5 points` and a `3x` score multiplier for 10 seconds.             |
|  15%   | 🤝👋👏🤲💪✌️🤙🤛✊🙏                 | `+5 points` and `+1 projectile` (up to 20 max).                     |
|  15%   | 📿🕯️🪔📗🕋🕌🌜☪️🤲🕊️                 | `+5 points` and an invincibility shield for 10 seconds.             |
|  20%   | -                                          | Nothing drops.                                                      |

## Game Events

### Letter Collection
*   The letters of the phrase **"Happy Birthday to simsim"** appear one by one every 30 seconds.
*   Collecting a letter grants `+20 points`.
*   The letter sequence repeats after the full phrase is completed.

### Game Win
*   After all letters of the phrase have been collected, a pretzel emoji **🥨** will appear.
*   Collecting the **🥨** grants `+100 points` and you win the game!

### Game Over
*   The game ends when the player loses their last life.
*   A "Game Over" screen is displayed with the final score.
