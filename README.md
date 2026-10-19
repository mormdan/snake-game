# Snake

Classic Snake in the browser: HTML5 canvas and plain JavaScript, with no dependencies and no build step.

## Play

- **Arrow keys** (or WASD): move
- **Space**: pause / resume
- **Enter**: start / restart after game over
- **Touch screens**: swipe on the board, or use the on-screen arrow pad

You lose if you hit a wall or your own body. Each food is worth 10 points, and the snake speeds up every 5 foods. Turn on **Wrap-around walls** to go through the edges. Fill the whole 20×20 board to win. Your best score is saved in your browser's `localStorage`.

## Run locally

Open `index.html` in a browser. It works from `file://` because the game uses no modules and makes no network requests.

To serve it instead, for example:

```bash
python -m http.server 8000
# then open http://localhost:8000
