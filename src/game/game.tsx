import * as utils from "./socket";
import { socket, joinCallback, updateCallback, startCallback, setZero, startCountdown, newUser, getMessage } from "./socket";
import "./game.css";
import "./button.css";
import React, { useState, useRef, useEffect } from "react";

export let doc: any;

export function Game() {
    const canvasRef = useRef(null);
    const [canvas, setCanvas]: any = useState(null);
    const [ctx, setCtx] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [disabled, setDisabled] = useState(false);
    doc = document;

    function message(event: any) {
        setUserMessage(event.target.value)
    }
    function handleNameChange(event: any) {
        setRoomName(event.target.value);
    }

    socket.on("update", updateCallback);
    socket.on("start", startCallback);
    socket.on("join", joinCallback);
    socket.on("stop", setZero);
    socket.on("startGame", startCountdown);
    socket.on('newUser', newUser);
    useEffect(() => {
        socket.on('getMessage', getMessage);
        return () => {
          socket.off('getMessage', getMessage);
        };
      }, []);

    const handleSendClick = () => {
        setDisabled(true); // Disable the send button
        utils.sendMessage(userMessage);
        setDisabled(false)
    };

    useEffect(() => {
        if (!canvas) setCanvas(canvasRef.current);
        if (canvas != null) {
            setCtx(canvas.getContext("2d"));
            if (ctx) utils.drawLine(ctx, canvas);
        }
        window.addEventListener("keydown", (event) => {
            let key = event.key;
            if (utils.isGameStarted) utils.handleKeyDown(key);
        });
        window.addEventListener("keyup", (event) => {
            let key = event.key;
            if (utils.isGameStarted) utils.handleKeyUp(key);
        });
        return () => {
            window.removeEventListener("keydown", utils.handleKeyDown);
            window.removeEventListener("keyup", utils.handleKeyDown);
        };
    }, [canvas, ctx]);

    function test() {
        socket.emit('newUser');
    }

    return (
        <div>
            <div>
                <div id="canvas-container">
                    <canvas id="canvas" ref={canvasRef} width="600" height="400"></canvas>
                    <div id="player-scores">
                        <div className="player-score">
                            <div className="player-name" id="player1-name">Player 1</div>
                            <div className="score" id="player1-score">0</div>
                        </div>
                        <div className="player-score">
                            <div className="player-name" id="player2-name">Player 2</div>
                            <div className="score" id="player2-score">0</div>
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
                        onClick={() => { utils.start(roomName); }}
                    >
                        <span>Start Game</span>
                        <i></i>
                    </button>
                    <button
                        id="join-game-btn"
                        onClick={() => { utils.join(roomName); }}
                    >
                        <span>Join Game</span>
                        <i></i>
                    </button>
                    <button
                        id="test"
                        onClick={test}
                    >
                        <span>Join Game</span>
                        <i></i>
                    </button>
                </div>
                <div className="chat-container">
                    <div className="card">
                        <div className="chat-header">Lobby</div>
                        <div className="chat-window">
                            <ul className="message-list"></ul>
                        </div>
                        <div className="chat-input">
                            <input type="text" onChange={message} className="message-input" placeholder="Type your message here" />
                            <button className="send-button"  onClick={handleSendClick} disabled={disabled}>Send</button>
                        </div>
                    </div>
                    <div className="online-users">
                    </div>
                </div>
            </div>
            <div id="countdown"></div>
        </div>
    );
}

/*
for messaging
    const [userMessage, setUserMessage] = useState("");
    function handleChange(event: any) { 
        setUserMessage(event.target.value); 
    }
    function handleKeyPress(event: any) {
        if (event.key === "Enter") {
            utils.sendMessage(document, userMessage);
            setUserMessage("");
        }
    } */
