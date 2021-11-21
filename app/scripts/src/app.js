import socket from './ws-client';
import {UserStore} from './storage';
import {ChatForm, ChatList, promptForUsername} from './dom';

let userStore = new UserStore('x-chattrbox/u');

class ChatApp {
  constructor() {
    this.username = userStore.get();
    if (!this.username) {
      this.username = promptForUsername();
      userStore.set(this.username);
    }

    this.chatForm = new ChatForm('#js-chat-form', '#js-message-input');
    this.chatList = new ChatList('#js-message-list', this.username);
    socket.init('ws://localhost:3001');
    socket.registerOpenHandler(() => {
      this.chatForm.init((data) => {
        let message = new ChatMessage(data, true);
        socket.sendMessage(message.toObj());
      });
    });
    socket.registerMessageHandler((data) => {
      // Create a new instance of `ChatMessage` with the incoming data from the
      // WebSockets server
      let message = new ChatMessage(data, data.user == userStore.get());
      // then, call this.chatList.drawMessage() with the new message instance
      this.chatList.drawMessage(message.toObj());
    });
  }
}

class ChatMessage {
  constructor(data, me) {
    if (typeof data === 'string') {
      data = {
        message: data
      };
    }
    this.me = me;
    this.username = data.user || userStore.get();
    this.message = data.message;
    this.timestamp = data.timestamp || (new Date()).getTime();
  }

  toObj() {
    console.info('@JAKE - THIS', this);
    return {
      user: this.username,
      message: this.message,
      timestamp: this.timestamp,
      me: this.me,
    };
  }
}

export default ChatApp;
