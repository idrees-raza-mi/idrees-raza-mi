const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;

// Game state
let leftPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let rightPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVX = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
let ballVY = BALL_SPEED * (Math.random() * 2 - 1);

let scoreLeft = 0;
let scoreRight = 0;

// Mouse control for left paddle
canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle position
  leftPaddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, leftPaddleY));
});

// AI control for right paddle
function moveRightPaddle() {
  const target = ballY + BALL_SIZE / 2;
  const paddleCenter = rightPaddleY + PADDLE_HEIGHT / 2;
  if (target < paddleCenter - 10) {
    rightPaddleY -= PADDLE_SPEED;
  } else if (target > paddleCenter + 10) {
    rightPaddleY += PADDLE_SPEED;
  }
  // Clamp
  rightPaddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightPaddleY));
}

function resetBall(direction) {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballVX = BALL_SPEED * (direction === "left" ? 1 : -1);
  ballVY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Collision detection
function checkCollisions() {
  // Top/bottom wall
  if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
    ballVY = -ballVY;
    ballY = Math.max(0, Math.min(canvas.height - BALL_SIZE, ballY));
  }
  // Left paddle
  if (
    ballX <= PADDLE_WIDTH &&
    ballY + BALL_SIZE > leftPaddleY &&
    ballY < leftPaddleY + PADDLE_HEIGHT
  ) {
    ballVX = Math.abs(ballVX); // always right
    // Add effect based on hit position
    let hitPos = (ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2);
    ballVY += hitPos * 0.09;
    ballX = PADDLE_WIDTH; // Prevent sticking
  }
  // Right paddle
  if (
    ballX + BALL_SIZE >= canvas.width - PADDLE_WIDTH &&
    ballY + BALL_SIZE > rightPaddleY &&
    ballY < rightPaddleY + PADDLE_HEIGHT
  ) {
    ballVX = -Math.abs(ballVX); // always left
    let hitPos = (ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2);
    ballVY += hitPos * 0.09;
    ballX = canvas.width - PADDLE_WIDTH - BALL_SIZE;
  }
  // Left/right wall (score)
  if (ballX < 0) {
    scoreRight++;
    updateScore();
    resetBall("right");
  }
  if (ballX > canvas.width) {
    scoreLeft++;
    updateScore();
    resetBall("left");
  }
}

function updateScore() {
  document.getElementById("score-left").textContent = scoreLeft;
  document.getElementById("score-right").textContent = scoreRight;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(canvas.width - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw net
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.height; i += 25) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, i);
    ctx.lineTo(canvas.width / 2, i + 15);
    ctx.stroke();
  }
}

function update() {
  // Move ball
  ballX += ballVX;
  ballY += ballVY;

  moveRightPaddle();
  checkCollisions();
  draw();

  requestAnimationFrame(update);
}

// Initialize game
updateScore();
update();