import { joinCallback, updateCallback, startCallback, SetZero, startCountdown, newUser } from "./socket";
import { socket } from '../lobby/lobbyUtils/lobbySocket';
import { useState, useRef, useEffect } from "react";
import { getMessage, onDroped } from "./gameUtils";
import { UploadOutlined } from "@ant-design/icons";
import * as utils from "./socket";
import "./game.css";
import Dropzone from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

export var doc: any;
export var user: any;
export let gameHash: any;


export function Game(props: any) {
	const navigate = useNavigate();
	const params = new URLSearchParams(window.location.search);
	gameHash = params.get("gameHash");
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

	async function hadnleEndOfGame(data: any) {
		utils.End(data, () => {
			navigate('/Lobby');
		});
	}

	useEffect(() => {
		socket.on("newUser", newUser);
		socket.on("getMessage", getMessage);
		socket.on('endOfGame', hadnleEndOfGame)
		return () => {
			socket.off("getMessage", getMessage);
			socket.off("newUser", newUser);
			socket.off('endOfGame', hadnleEndOfGame);
		};
	}, []);


	socket.on('update', updateCallback);
	socket.on('start', startCallback);
	socket.on('initalize', utils.start);
	socket.on('join', joinCallback);
	socket.on('userLeft', utils.userLeft);
	socket.on('startGame', startCountdown);
	//socket.on('playerLeft', SetZero);

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
												<button>
													<UploadOutlined />
												</button>
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
					<div className="online-users"></div>
					</div>
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
