import { socket, joinCallback, updateCallback, startCallback, setZero, startCountdown, newUser, connect } from "./socket";
import { useState, useRef, useEffect } from "react";
import { getMessage, onDroped } from "./gameUtils";
import { UploadOutlined } from "@ant-design/icons";
import Dropzone from "react-dropzone";
import * as utils from "./socket";
import { Button } from "antd";
import "./game.css";
import "./button.css";

export var doc: any;
export var gameHash: any;
export var user: any;

export function Game(props: any) {
	const [userMessage, setUserMessage] = useState("");
	const [canvas, setCanvas]: any = useState(null);
	const [ctx, setCtx] = useState(null);
	const canvasRef = useRef(null);
	doc = document;

	function message(event: any) {
		setUserMessage(event.target.value);
	}

	function handleKeyDown(event: any) {
		if (event.key === "Enter") {
			handleSendClick();
		}
	}

	const params = new URLSearchParams(window.location.search);
	gameHash = params.get("gameHash");
	user = "user";
	connect();

	useEffect(() => {
		socket.on("newUser", newUser);
		socket.on("getMessage", getMessage);
		return () => {
			socket.off("getMessage", getMessage);
			socket.off("getMessage", getMessage);
		};
	}, []);


	socket.on('update', updateCallback);
	socket.on('start', startCallback);
	socket.on('initalize', utils.start);
	socket.on('join', joinCallback);
	socket.on('userLeft', utils.userLeft);
	socket.on('startGame', startCountdown);
	socket.on('playerLeft', setZero);
	socket.on('endOfGame', utils.end);

	const handleSendClick = () => {
		utils.sendMessage(userMessage, "txt");
		setUserMessage("");
	};

	useEffect(() => {
		if (!canvas) {
			setCanvas(canvasRef.current);
		}
		if (canvas != null) {
			setCtx(canvas.getContext("2d"));
			if (ctx) utils.drawLine(ctx, canvas);
		}
		window.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				handleSendClick();
			}
			utils.handleKeyDown(event.key);
		});
		window.addEventListener("keyup", (event) => {
			utils.handleKeyUp(event.key);
		});
		return () => {
			window.removeEventListener("keydown", utils.handleKeyDown);
			window.removeEventListener("keyup", utils.handleKeyDown);
		};
	}, [canvas, ctx]);

	return (
		<div>
			<div>
				<div id="container-stars">
					<div id="stars"></div>
				</div>
				<div id="canvas-container">
					<canvas
						id="canvas"
						ref={canvasRef}
						width="600"
						height="300"
						className="canvas"
					></canvas>
					<div id="player-scores">
						<div className="player-score">
							<div className="player-name" id="player1-name">
								Player 1
							</div>
							<div className="score" id="player1-score">
								0
							</div>
						</div>
						<div className="player-score">
							<div className="player-name" id="player2-name">
								Player 2
							</div>
							<div className="score" id="player2-score">
								0
							</div>
						</div>
					</div>
				</div>
				<div className="chat-container">
					<div className="card">
						<label className="chat-header"> Chat </label>
						<div className="chat-window">
							<ul className="message-list"></ul>
						</div>
						<div className="chat-input">
							<input
								type="text"
								onKeyDown={handleKeyDown}
								onChange={message}
								value={userMessage}
								className="message-input"
								placeholder="Type your message here"
							/>

							<div style={{ backgroundColor: "black" }}>
								<Dropzone onDrop={onDroped}>
									{({ getRootProps, getInputProps }) => (
										<section>
											<div {...getRootProps()}>
												<input {...getInputProps()} />
												<Button>
													<UploadOutlined />
												</Button>
											</div>
										</section>
									)}
								</Dropzone>
							</div>
							<button
								className="send-button"
								onClick={handleSendClick}
							>
								Send
							</button>
						</div>
					</div>
					<div className="online-users"></div>
				</div>
			</div>
			<div>
				<button type="button" className="btn">
					<strong>CUCUMBA</strong>
					<div id="glow">
						<div className="circle"></div>
						<div className="circle"></div>
					</div>
				</button>
			</div>
			<div id="countdown"></div>
			<div id="countdown2"></div>
		</div>
	);
}
