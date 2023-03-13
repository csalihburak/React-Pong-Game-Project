import * as utils from "./socket";
import { socket, joinCallback, updateCallback, startCallback, setZero, startCountdown, newUser, getMessage, connect} from "./socket";
import "./game.css";
import "./button.css";
import { useState, useRef, useEffect } from "react";

export var doc: any;
export var room: any;
export var user: any;

export function Game(props: any) {
	const [userMessage, setUserMessage] = useState("");
	const button: any = document.querySelector(".btn");
  	const [canvas, setCanvas]: any = useState(null);
  	const [roomName, setRoomName] = useState("");
  	const [ctx, setCtx] = useState(null);
  	const canvasRef = useRef(null);
  	doc = document;

  	function message(event: any) { setUserMessage(event.target.value); }
  	function handleNameChange(event: any) { setRoomName(event.target.value); }
	  
	  function handleKeyDown(event:any) {
		if (event.key === "Enter") {
		  	handleSendClick();
		}
	  }
	const params = new URLSearchParams(window.location.search);
	room = params.get('roomName');
	user = params.get('user');
	connect();
  	useEffect(() => {
		  socket.on("newUser", newUser);
		  socket.on("getMessage", getMessage);
		  return () => {
			  socket.off("getMessage", getMessage);
			  socket.off("getMessage", getMessage);
			};
		}, []);
		
	useEffect(() => {
			if (button)
				button.querySelector('strong').textContent = room;
	}, [button]);
	
	//button.querySelector('strong').textContent = room;
	socket.on("update", updateCallback);
	socket.on("start", startCallback);
	socket.on("join", joinCallback);
	socket.on("stop", setZero);
	socket.on("startGame", startCountdown);
	
	
  	const handleSendClick = () => {
		utils.sendMessage(userMessage);
		setUserMessage('');
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

  	function test() {
  	  socket.emit("newUser");
  	}

  return (
    <div>
      <div id="container-stars">
        <div id="stars"></div>
      </div>
      <div>
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
        <div id="controls">
          <input
            type="text"
            id="name"
            placeholder="Room name"
            value={roomName}
            onChange={handleNameChange}
          />
          <button
            id="start-game-btn"
            onClick={() => {
              utils.start(roomName);
            }}
          >
            <span>Start Game</span>
            <i></i>
          </button>
          <button
            id="join-game-btn"
            onClick={() => {
              utils.join(roomName);
            }}
          >
            <span>Join Game</span>
            <i></i>
          </button>
          <button id="test" onClick={test}>
            <span>Join Game</span>
            <i></i>
          </button>
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
          <div id="container-stars">
            <div id="stars"></div>
          </div>
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
