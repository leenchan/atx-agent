import { loadSetting, defaultHost } from '@hook/useSetting';

// export const atxHost = '115.222.156.224:7912';
// export const atxHost = '115.222.154.124:7912';

export const getProtocolScheme = () => {
  const protocolScheme = location.toString().split(':')[0];
  return protocolScheme;
};

export const getWebsocketScheme = () => {
  const protocolScheme = getProtocolScheme();
  const websocketScheme = protocolScheme == 'https' ? 'wss://' : 'ws://';
  return websocketScheme;
};

export const getAtxHost = () => {
  const setting = loadSetting();
  const atxHost = setting.host ?? defaultHost;
  return atxHost;
};

export const getAtxUrl = () => {
  const protocolScheme = getProtocolScheme();
  const atxHost = getAtxHost();
  const atxUrl = protocolScheme + '://' + atxHost;
  return atxUrl;
};

export const getAtxWsUrl = () => {
  const websocketScheme = getWebsocketScheme();
  const atxHost = getAtxHost();
  let [host, port] = atxHost.split(':');
  if (!/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host) && !/^localhost$/.test(host) && !/[-_0-9a-z.](\.[a-z]+){1,3}/.test(host)) {
    host = defaultHost.split(':')[0];
  }
  const atxWsUrl = websocketScheme + host + ':' + (port ?? '7912');
  return atxWsUrl;
};
