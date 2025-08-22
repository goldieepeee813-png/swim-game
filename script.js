// Swimmin Gamer Web v5 - Fullscreen + Touch controls + GoldyPorter

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let gameState = "title";
let score = 0;
let highScore = localStorage.getItem("swimminHighScore") || 0;
let lives = 3;
let frame = 0;

// Player
const player = {
  x: 150,
  y: canvas.height/2,
  width: 50,
  height: 30
};

let swimUp = false;

// Input keys
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Touch input for mobile
canvas.addEventListener("touchstart", () => swimUp = true);
canvas.addEventListener("touchend", () => swimUp = false);

// Objects
let obstacles = [];
let collectibles = [];

// Reset game
function resetGame(){
  score = 0;
  lives = 3;
  player.y = canvas.height/2;
  obstacles = [];
  collectibles = [];
  gameState = "playing";
}

// Spawn
function spawnObjects(){
  if(frame % 100 === 0){
    let y = Math.random() * (canvas.height-100);
    obstacles.push({x: canvas.width, y: y, width: 60, height: 40, type: "shark"});
  }
  if(frame % 120 === 0){
    let y = Math.random() * (canvas.height-50);
    collectibles.push({x: canvas.width, y: y, width: 20, height: 20, type: "bubble"});
  }
  if(frame % 240 === 0){
    let y = Math.random() * (canvas.height-50);
    collectibles.push({x: canvas.width, y: y, width: 25, height: 25, type: "shell"});
  }
}

// Collision check
function collide(a, b){
  return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
}

// Update loop
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(gameState === "title"){
    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.height/12)}px Arial`;
    ctx.fillText("Swimmin Gamer", canvas.width/2-200, canvas.height/3);
    ctx.font = `${Math.floor(canvas.height/20)}px Arial`;
    ctx.fillText("Press SPACE or TAP to Start", canvas.width/2-180, canvas.height/2);
    ctx.font = `${Math.floor(canvas.height/18)}px Arial`;
    ctx.fillStyle = "magenta";
    ctx.fillText("✨ GoldyPorter ✨", canvas.width/2-150, canvas.height/1.5);
    if(keys[" "] || swimUp) resetGame();
  }
  else if(gameState === "playing"){
    frame++;

    // Move player (up/down)
    if(keys["ArrowUp"] || keys["w"] || swimUp) player.y -= 5;
    if(keys["ArrowDown"] || keys["s"]) player.y += 5;
    player.y = Math.max(0, Math.min(canvas.height-player.height, player.y));

    // Draw player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    spawnObjects();

    // Obstacles
    for(let i=obstacles.length-1; i>=0; i--){
      let o = obstacles[i];
      o.x -= 6 + score/80;
      ctx.fillStyle = "red";
      ctx.fillRect(o.x, o.y, o.width, o.height);
      if(collide(player, o)){
        lives--;
        obstacles.splice(i,1);
        if(lives <= 0) gameState = "gameover";
      } else if(o.x+o.width < 0){
        obstacles.splice(i,1);
      }
    }

    // Collectibles
    for(let i=collectibles.length-1; i>=0; i--){
      let c = collectibles[i];
      c.x -= 5;
      ctx.fillStyle = (c.type==="bubble")?"white":"yellow";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.width/2, 0, Math.PI*2);
      ctx.fill();
      if(collide(player, c)){
        score += (c.type==="bubble")?1:3;
        collectibles.splice(i,1);
      } else if(c.x+c.width < 0){
        collectibles.splice(i,1);
      }
    }

    // HUD
    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.height/25)}px Arial`;
    ctx.fillText("Score: "+score, 20, 40);
    ctx.fillText("High: "+highScore, 20, 80);
    ctx.fillText("Lives: "+lives, 20, 120);

    ctx.fillStyle = "magenta";
    ctx.font = `${Math.floor(canvas.height/28)}px Arial`;
    ctx.fillText("GoldyPorter", canvas.width-200, 40);

    if(score > highScore){
      highScore = score;
      localStorage.setItem("swimminHighScore", highScore);
    }
  }
  else if(gameState === "gameover"){
    ctx.fillStyle = "white";
    ctx.font = `${Math.floor(canvas.height/10)}px Arial`;
    ctx.fillText("Game Over", canvas.width/2-150, canvas.height/2);
    ctx.font = `${Math.floor(canvas.height/20)}px Arial`;
    ctx.fillText("Press R or TAP to Restart", canvas.width/2-180, canvas.height/2+80);
    if(keys["r"] || keys["R"] || swimUp) resetGame();
  }

  requestAnimationFrame(update);
}
update();
