const { TextEncoder, TextDecoder } = require('util');
const { TransformStream } = require('web-streams-polyfill/dist/ponyfill.js');
const fetch = require('node-fetch');

// TextEncoderとTextDecoderをグローバルに設定
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.TransformStream = TransformStream;
global.Response = fetch.Response;

// BroadcastChannelのポリフィル
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class {
    constructor(name) {
      this.name = name;
      this.listeners = [];
    }
    postMessage(message) {
      this.listeners.forEach(listener => listener({ data: message }));
    }
    addEventListener(type, listener) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }
    removeEventListener(type, listener) {
      if (type === 'message') {
        this.listeners = this.listeners.filter(l => l !== listener);
      }
    }
    close() {
      this.listeners = [];
    }
  };
}