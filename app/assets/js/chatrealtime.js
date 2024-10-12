import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYFOkH6uXUdX-cc1duJy0KKrbevI6rcyQ",
  authDomain: "matketplace-9e824.firebaseapp.com",
  databaseURL:
    "https://matketplace-9e824-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "matketplace-9e824",
  storageBucket: "matketplace-9e824.appspot.com",
  messagingSenderId: "555987921295",
  appId: "1:555987921295:web:642161bfd68f8a4660c3fa",
  measurementId: "G-WD31VK9DHL",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const messageTag = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const openChat = document.getElementById("openChat");
const userIdTag = document.getElementById("userId");
const userIdTag2 = document.getElementById("userId2");
const userFullnameTag = document.getElementById("userFullname");
const groupIdTag = document.getElementById("groudId");
const ListChatTag = document.getElementById("list_chat");

const listItems = document.getElementsByClassName("bt");

let groupId = "";
let msgRef = "";
const userId = userIdTag.value;

Array.from(listItems).forEach((li) => {
  li.addEventListener("click", () => {
    Array.from(listItems).forEach((item) => {
      item.classList.remove("active_group");
    });
    li.classList.add("active_group");
    groupId = li.textContent;
    msgRef = ref(db, `messages/${groupId}`);
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      messageTag.innerHTML = "";
      if (data) {
        for (let key in data) {
          if (data[key].groupId == groupId) {
            if (data[key].userId == userId) {
              const message = `<div class="text-right"><button disabled>${data[key].message}</button></div>`;
              messageTag.innerHTML += message;
            } else {
              const message = `<div class="text-left"><button disabled>${data[key].message}</button></div>`;
              messageTag.innerHTML += message;
            }
          }
        }
      }

      scrollToBottom();
    });
  });
});

sendButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const messageText = messageInput.value.trim();
  const payload = {
    groupId: groupId,
    userId: userId,
    message: messageText,
  };
  if (messageText) {
    const req = await fetch("/message", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (!req.ok) {
    }

    push(msgRef, payload);

    // scrollToBottom();
    messageInput.value = "";
  }
});

function scrollToBottom() {
  const contentSpeakerTag = document.getElementById("content-speaker");
  contentSpeakerTag.scrollTo({ top: 100000000000000000 });
}
