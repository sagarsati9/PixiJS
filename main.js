import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import { Howl } from 'howler';

(async () => {
  const scoreSound = new Howl({ src: ['/sounds/score.mp3'] });
  const hitSound = new Howl({ src: ['/sounds/game-over.mp3'] });
  const bgMusic = new Howl({ src: ['/sounds/game.mp3'], loop: true, volume: 0.3 });
  bgMusic.play();

  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000
  });
  document.body.appendChild(app.canvas);

  const player = new Graphics();
  const playerWidth = 60;
  const playerHeight = 20;
  player.beginFill(0x00ff00);
  player.drawRect(0, 0, playerWidth, playerHeight);
  player.endFill();
  player.x = app.screen.width / 2 - playerWidth / 2;
  player.y = app.screen.height - playerHeight - 10;
  app.stage.addChild(player);

  const redBlocks = [];
  const blockWidth = 40;
  const blockHeight = 40;

  const keys = {};
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  let score = 0;
  let gameOver = false;
  let paused = false;

  function createRedBlock() {
    const red = new Graphics();
    red.beginFill(0xff0000);
    red.drawRect(0, 0, blockWidth, blockHeight);
    red.endFill();
    red.x = Math.random() * (app.screen.width - blockWidth);
    red.y = -blockHeight;
    app.stage.addChild(red);
    redBlocks.push(red);
  }

  function endGame() {
    gameOver = true;
    hitSound.play();

    const style = new TextStyle({
      fill: "#ffffff",
      fontSize: 48,
      fontWeight: "bold"
    });
    const text = new Text("Game Over", style);
    text.anchor.set(0.5);
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    app.stage.addChild(text);

    const restartText = new Text("Press R to Restart", {
      fill: "#ffffff",
      fontSize: 24
    });
    restartText.anchor.set(0.5);
    restartText.x = app.screen.width / 2;
    restartText.y = app.screen.height / 2 + 60;
    app.stage.addChild(restartText);
  }

  app.ticker.add(() => {
    if (gameOver || paused) return;

    const speed = 5;
    if (keys["ArrowLeft"] && player.x > 0) player.x -= speed;
    if (keys["ArrowRight"] && player.x < app.screen.width - playerWidth) player.x += speed;

    for (let i = redBlocks.length - 1; i >= 0; i--) {
      const red = redBlocks[i];
      red.y += 4 + score * 0.05;

      const hit = red.x < player.x + playerWidth &&
                  red.x + blockWidth > player.x &&
                  red.y < player.y + playerHeight &&
                  red.y + blockHeight > player.y;

      if (hit) {
        endGame();
      }

      if (red.y > app.screen.height) {
        redBlocks.splice(i, 1);
        app.stage.removeChild(red);
        score++;
        document.getElementById("score").innerText = `Score: ${score}`;
        scoreSound.play();
      }
    }
  });

  let blockInterval = 800;
  let intervalId = setInterval(spawnBlock, blockInterval);

  function spawnBlock() {
    if (!gameOver) {
      createRedBlock();
      if (score % 10 === 0 && blockInterval > 300) {
        clearInterval(intervalId);
        blockInterval -= 30;
        intervalId = setInterval(spawnBlock, blockInterval);
      }
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') paused = !paused;
    if (e.code === 'KeyR' && gameOver) location.reload();
  });

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    if (player.x > app.screen.width - playerWidth) {
      player.x = app.screen.width - playerWidth;
    }
    player.y = app.screen.height - playerHeight - 10;
  });
})();
