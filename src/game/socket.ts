import { io } from "socket.io-client";
import { doc, gameHash} from "./game";


export var gameData: any = null;
export var isGameStarted: boolean = false;
export let isPlaying: number = 0;
let context: any;
let cnvs: any;
let interval: any;

export var socket: any = null;
export function connect() {
	console.log(gameHash);
	if (!socket) {
		socket = io("http://142.93.164.123:3000/socket/game", {
			withCredentials: true,
			query: {
				gameHash: gameHash,
			},
			transports: ["websocket", "polling"],
		});
	}
}

export function drawLine(ctx: any, canvas: any): void {
	context = ctx;
	cnvs = canvas;
	cnvs.addEventListener("keydown", handleKeyDown);
	cnvs.addEventListener("keyup", handleKeyUp);
	ctx.beginPath();
	ctx.setLineDash([5, 5]);
	ctx.strokeStyle = "#fff";
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.stroke();
}

export function drawBall(ctx: any, ball: any) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = ball.color;
	ctx.fill();
	ctx.closePath();
	ctx.restore();
}

function drawPaddle(paddle: any, ctx: any) {
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 1)";  
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	ctx.restore();
}

function drawPaddle2(paddle: any, ctx: any) {
	var gradient = ctx.createLinearGradient(
		paddle.x,
		paddle.y,
		paddle.x + paddle.width,
		paddle.y + paddle.height
	);
	gradient.addColorStop(0, "#78281F");
	gradient.addColorStop(0.5, "#FDFEFE");
	gradient.addColorStop(1, "#85C1E9");

	ctx.fillStyle = gradient;
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

	var shineGradient = ctx.createRadialGradient(
		paddle.x + paddle.width / 2,
		paddle.y + paddle.height / 2,
		0,
		paddle.x + paddle.width / 2,
		paddle.y + paddle.height / 2,
		paddle.width / 2
	);
	shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
	shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

	ctx.fillStyle = shineGradient;
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawScores(leftPlayer: any, rightPlayer: any) {
	const p1Name: any = document.getElementById("player1-name");
	const p2Name: any = document.getElementById("player2-name");
	const p1Score: any = document.getElementById("player1-score");
	const p2Score: any = document.getElementById("player2-score");
	p1Name.textContent = leftPlayer.name;
	p2Name.textContent = rightPlayer.name;
	p1Score.textContent = leftPlayer.score;
	p2Score.textContent = rightPlayer.score;
}

export function render(ctx: any, canvas: any, game: any) {
	if (canvas && ctx && game) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawLine(ctx, canvas);
		if (game != null) {
			drawBall(ctx, game.ball);
			if (game.map === 2) {
				drawPaddle2(game.leftPlayer.paddle, ctx);
				drawPaddle2(game.rightPlayer.paddle, ctx);
			} else {
				drawPaddle(game.leftPlayer.paddle, ctx);
				drawPaddle(game.rightPlayer.paddle, ctx);
			}
			drawScores(game.leftPlayer, game.rightPlayer);
		}
	}
}

export async function update(socket: any, game: any) {
	await socket.emit("update", [game], () => {});
}

export async function gameLoop() {
	if (!isGameStarted || gameData == null || !isPlaying) {
		return;
	}
	await update(socket, gameData);
}

export function startCallback() {
	isGameStarted = true;
	isPlaying = 1;
	interval = setInterval(gameLoop, 1000 / 60);
}

export function updateCallback(args: any) {
	render(context, cnvs, args);
}

export function joinCallback() {
	interval = setInterval(gameLoop, 1000 / 60);
}

export function start(data: any) {
	const countdownEl: any = doc.getElementById("countdown2");
	const button: any = document.querySelector(".btn");
	countdownEl.innerText = "Waiting for second player...";
	gameData = data;
	if (gameData.map === 2) {
		cnvs.classList.add("gradient");
	} else {
		cnvs.classList.remove("gradient");
	}
	console.log(gameData.name);
	if (button) button.querySelector("strong").textContent = gameData.name;
	render(context, cnvs, gameData);
}

export function join(data: any) {
	socket.emit("join", [data], (data: any) => {
		gameData = data;
		render(context, cnvs, data);
	});
}

export async function sendMessage(message: any, type: any) {
	if (message !== "") {
		await socket.emit("sendMessage", [gameHash, type, message]);
	}
}

export function handleKeyUp(key: any) {
	if (isGameStarted)
		socket.emit("prUp", [
			key,
			gameData.ball,
			gameData.leftPaddle,
			gameData.rightPaddle,
		]);
}
export function handleKeyDown(key: any) {
	if (isGameStarted)
		socket.emit("prDown", [
			key,
			gameData.ball,
			gameData.leftPaddle,
			gameData.rightPaddle,
		]);
}

export function userLeft(data: any[]) {
	const onlineUsers = document.querySelector(".online-users");
	if (onlineUsers) {
	  const userPhotos : any = onlineUsers.querySelectorAll(".user-photo");
	  for (let i = 0; i < userPhotos.length; i++) {
		if (userPhotos[i].src === data[0]) {
		  onlineUsers.removeChild(userPhotos[i]);
		  break;
		}
	  }
	}
}

export function setZero(data: any[]) {
	clearInterval(interval);
	const warn: any = document.getElementById("countdown2");
	isPlaying = 0;
	let countdown = 5;
	warn.innerText = data[0] + ", you are redirecting to the lobby";
	const timer = setInterval(() => {
		if (countdown === 0) {
			clearInterval(timer);
			warn.style.display = "none";
			window.location.href = "http://142.93.104.99:3000/lobby";
		} else {
			countdown--;
		}
	}, 1000);
}

export function startCountdown(data: any) {
	const countdownEl: any = doc.getElementById("countdown");
	const warn: any = doc.getElementById("countdown2");
	warn.style.display = "none";
	let countdown = 5;
	if (countdownEl) {
		const timer = setInterval(() => {
			if (countdown === 0) {
				clearInterval(timer);
				countdownEl.style.display = "none";
				isGameStarted = true;
				isPlaying = 1;
				interval = setInterval(gameLoop, 1000 / 60);
			} else {
				countdownEl.innerText = countdown;
				countdown--;
			}
		}, 1000);
	}
}

export function end(data: any) {
	const warn: any = doc.getElementById("countdown");
	warn.innerText = `winner winner chciken dinner user: ${data} has won the game`;
	let countdown = 6;
	const timer = setInterval(() => {
		if (countdown === 0) {
			clearInterval(timer);
			warn.style.display = "none";
			window.location.href = "http://localhost:3000/lobby";
		} else {
			countdown--;
		}
	}, 1000);

	
}

export function newUser(data: any) {
	const userPhoto = document.createElement("img");
	userPhoto.src = data;
	userPhoto.alt = "img";
	userPhoto.className = "user-photo";
	const onlineUsers = document.querySelector(".online-users");
	if (onlineUsers) onlineUsers.appendChild(userPhoto);
}


export async function handleSendClick(userMessage: any) {
	sendMessage(userMessage, "txt");
}

