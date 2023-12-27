import { apiWebsocketScheme, atxHost } from './atx';

export function createMinicapWebsocket({
  onMessage = () => {},
  onError = () => {},
  onClose = () => {},
  onOpen = () => {},
  updateDuration,
  setCount,
}) {
  var ws = new WebSocket(apiWebsocketScheme + atxHost + '/minicap');
  var lastTime = 0;
  ws.binaryType = 'blob';
  ws.onclose = function() {
    onClose();
    // console.log('onclose', arguments);
  }
  ws.onerror = function() {
    onError();
    // console.log('onerror', arguments);
  }
  ws.onmessage = function(message) {
    var ms = new Date().getTime();
    if (typeof message.data !== 'string') {
      // setCount(prev => prev + 1);
      // console.log(lastTime, ms - lastTime)
      // console.log('last time:' + lastTime);
      if (updateDuration > 0 && lastTime && ms - lastTime < updateDuration && message.data.size > 50 * 1000) {
        // console.log(lastTime < updateDuration, message.data);
        return;
      }
    }
    // console.log(ms - lastTime);
    lastTime = ms;
    onMessage(message);
  }
  ws.onopen = function() {
    onOpen();
    // console.log('onopen', arguments);
    // ws.send('1080x1920/0');
  };
  return ws;
}

export function createMinitouchWebsocket({
  onOpen = () => {},
  onMessage = () => {},
  onError = () => {},
  onClose = () => {},
}) {
  const ws = new WebSocket(apiWebsocketScheme + atxHost + '/minitouch');
  ws.onclose = function() {
    onClose();
    // console.log('onclose', arguments);
  };
  ws.onerror = function() {
    onError();
    // console.log('onerror', arguments);
  };
  ws.onopen = function() {
    onOpen();
    // console.log('onopen', arguments);
  };
  ws.onmessage = function(message) {
    onMessage(message);
    // console.log('minitouch: ' + message);
  };
  return ws;
};
