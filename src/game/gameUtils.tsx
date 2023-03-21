import { sendMessage } from "./socket";

export async function getMessage(message: any[]) {
	const chatbox = document.getElementsByClassName("message-list")[0];
	const messageContainer = document.createElement("div");
	const messageText = document.createElement("p");
	messageText.style.fontSize = "16px";
	const isFile = message[1] === "file";
	const isSent = message[3] === localStorage.getItem('sessionToken');

	messageContainer.appendChild(messageText);
	if (isFile) {
		const image = document.createElement("img");
		image.alt = "image";
		image.style.maxWidth = "180px";
		image.src = `http://142.93.164.123:3000/${message[2]}`;

		image.onload = function () {
			messageContainer.classList.add(isSent ? "sent" : "received");
			messageContainer.appendChild(image);
			appendMessageContainer(chatbox, messageContainer);
		};
	} else {
		messageText.innerHTML = isSent
			? message[2]
			: `${message[0]}: ${message[2]}`;
		messageContainer.classList.add(isSent ? "sent" : "received");
		appendMessageContainer(chatbox, messageContainer);
	}
}

function appendMessageContainer(chatbox: any, messageContainer: HTMLElement) {
	const fragment = document.createDocumentFragment();
	fragment.appendChild(messageContainer);
	chatbox.appendChild(fragment);
	requestAnimationFrame(() =>
		messageContainer.scrollIntoView({ behavior: "smooth" })
	);
}

export async function onDroped(files: any[]) {
	let formData = new FormData();
	formData.append("file", files[0]);

	const requestOptions = {
		method: "POST",
		body: formData,
	};
	const a = await fetch(
		"http://142.93.164.123:3000/auth/uploads",
		requestOptions
	);
	const x = await a.json();
	const url = x.body.url;
	sendMessage(url, "file");
}
