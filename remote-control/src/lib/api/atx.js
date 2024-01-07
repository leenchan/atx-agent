import axios from 'axios';
import { delay } from '@util';
import { loadSetting, defaultHost } from '@hook/useSetting';
import { getAtxUrl } from './common';

export const shell = ({ cmd }, stream = false) => {
  return axios.post(
    getAtxUrl() + '/shell',
    { command: cmd },
    { headers:
      {'content-type': 'application/x-www-form-urlencoded'},
    },
  );
};

export const shellStream = ({ cmd }) => {
  return axios.get(
    getAtxUrl() + '/shell/stream',
    { command: cmd },
  );
};

export const rotate = (rotation = 0) => {
  return axios.post(
    getAtxUrl() + '/info/rotation?direction=2',
    { direction: 2 },
    // { headers:
    //   {'content-type': 'application/json;charset=UTF-8'},
    // },
  );
};

export const getInfo = () => {
  return axios.get(
    getAtxUrl() + '/info'
  );
};

export const getProp = () => {
  return shell({ cmd: 'getprop' });
};

export const getMemUsage = () => {
  return shell({ cmd: 'cat /proc/meminfo' }).then((res) => {
    const data = {};
    res.data.output.split(/\n/)
      .filter((row) => /:/.test(row))
      .map((row) => row.split(/\s*:\s*/))
      .forEach(([name, value]) => data[name] = value);
      // console.log(data)
    return data;
  });
};

export const getDiskUsage = () => {
  return shell({ cmd: 'df' }).then(res => {
    const data = {};
    res.data?.output.split(/\n/).
      filter((row) => /^\//.test(row))
      .map((row) => row.split(/\s+/))
      .forEach((row) => {
        const [block, total, used, available, percent, point] = row;
        const name = point ?? block;
        data[name] = { block, total, used, available, percent: /%/.test(percent) ? percent : null }
      });
    // console.log(res.data?.output.split(/\n/).map((row) => row.split(/\s+/)));
    return data;
  });
};

export const getPropByJson = async () => {
  const { data: { output } } = await getProp();
  return JSON.parse('{' + output.replace(/[\[\]]/g, '"').replace(/\n/g, ',').replace(/,$/, '') + '}');
};

export const getProcesses = async () => {
  return await axios.get(getAtxUrl() + '/proc/list')
    .then(res => res.data);
};

export const getServices = async (param) => {
  return axios.get(getAtxUrl() + '/services', param)
    .then((res) => res.data);
};

export const getServiceDetail = async (name, param) => {
  return axios.get(getAtxUrl() + `/services/${name}`, param)
    .then((res) => res.data);
};

export const minitouchJsonToCmd = (obj) => {
  if (!window.displayPhySize) {
    return;
  }
  var cmd = '';
  var displayW = window.displayPhySize.split('x')[0],
    displayH = window.displayPhySize.split('x')[1];
  ['operation', 'index', 'xP', 'yP', 'pressure'].forEach(function(name) {
    if (obj[name] !== undefined && obj[name] !== null && obj[name] !== '') {
      var value = obj[name];
      if (name == 'xP') {
        value = Math.floor(displayW * value);
      }
      if (name == 'yP') {
        value = Math.floor(displayH * value);
      }
      cmd += cmd == '' ? value : (' ' + value);
    }
  });
  return cmd;
};

export const sendTouch = ({
  minitouch: wsMinitouch,
  event: obj,
  onSuccess = () => {},
} = {}) => {
  console.log(wsMinitouch, obj);
  if (!wsMinitouch) {
    return;
  };
  var xP, yP;
  if (obj.xP || obj.yP) {
    xP = Math.floor(obj.xP * 1000) / 1000;
    yP = Math.floor(obj.yP * 1000) / 1000;
    switch (window.orientation) {
      case 90:
        obj.xP = 1 - yP;
        obj.yP = xP;
        break;
      // case 180:
      //   obj.xP = 1 - xP;
      //   obj.yP = 1 - yP;
      //   break;
      // case 270:
      //   obj.xP = 1 - yP;
      //   obj.yP = xP;
      //   break;
      default:
        obj.xP = xP;
        obj.yP = yP;
        break;
    }
  }
  if (wsMinitouch.readyState == 1) {
    onSuccess(obj);
    wsMinitouch.send(JSON.stringify(obj));
  } else {
    if (obj.operation == 'u' && window.displayPhySize) {
      var displayPhySize = window.displayPhySize.split('x');
      var displayW = (window.orientation == 90 || window.orientation == 270) ? displayPhySize[1] : displayPhySize[0],
        displayH = (window.orientation == 90 || window.orientation == 270) ? displayPhySize[0] : displayPhySize[1];
      if (pointersMove[obj.index]) {
        shell({ cmd: 'input swipe ' + 
          Math.floor(pointersDown[obj.index].xP*displayW) + ' ' + Math.floor(pointersDown[obj.index].yP*displayH) + ' ' +
          Math.floor(pointersMove[obj.index].xP*displayW) + ' ' + Math.floor(pointersMove[obj.index].yP*displayH)
        });
      } else {
        shell({ cmd: 'input tap ' + Math.floor(pointersDown[obj.index].xP*displayW) + ' ' + Math.floor(pointersDown[obj.index].yP*displayH) });
      }
    }
  }
};

const unlockScreen = async ({ minitouch }) => {
  // console.log('Unlocking...')
  for (let retry = 0; retry < 5; retry++) {
    try {
      const { output } = await shell({ cmd: 'dumpsys window | grep mCurrentFocus | grep -q StatusBar && echo 1 || echo 0' });
      if (/0/.test(res.output)) {
        break;
      }
      if (/1/.test(output)) {
        if (minitouch.readyState == 1) {
          ['d 0 0.50 0.80 50', 'c', 'm 0 0.50 0.60 50', 'c', 'm 0 0.50 0.40 50', 'c', 'm 0 0.50 0.20 50', 'c', 'u 0', 'c'].forEach(function(o, index) {
            var operation = o.split(' ');
            var touch = {
              operation: operation[0],
              index: operation[1] !== undefined ? operation[1] * 1 : undefined,
              xP: operation[2] !== undefined ? operation[2] * 1 : undefined,
              yP: operation[3] !== undefined ? operation[3] * 1 : undefined,
              pressure: operation[4] !== undefined ? operation[4] * 1 : undefined
            };
            sendTouch(touch);
            // console.log(touch)
          });
        } else {
          await shell({ cmd: 'input swipe 126 459 413 472 1000' });
        }
      }
    } catch (error) {
    }
    await delay(1000);
  }
};

export const toggleScreen = async () => {
  const res = await shell({ cmd: 'dumpsys display | grep mScreenState' });
  if (!/OFF/.test(res.output)) {
    return false;
  }
  await shell({ cmd: 'input keyevent 26' });
  await rotate({ rotation: window.orientation ? window.orientation / 90 : 0 })
  shell({ cmd: 'dumpsys display | grep mScreenState', onSuccess: function(res) {
    if (res && res.output) {
      if (/OFF/.test(res.output)) {
        shell({ cmd: 'input keyevent ' + 26, onSuccess: function() {
          rotate({ rotation: window.orientation ? window.orientation / 90 : 0 });
          unlockScreen();
        }});
        return;
      }
    }
    shell({ cmd: 'input keyevent ' + 26 });
  }});
};

export const inputKey = async (keycode) => {
  if (keycode == 26) {
    toggleScreen();
  } else {
    return await shell({ cmd: `input keyevent ${keycode}` });
  }
};

export const inputText = async (text) => {
  return shell({cmd: 'input text "' + text + '"'});
};

export const sendKeybordCode = (e) => {
	var keyCode;
	var keyMap = {
		['Escape']: 4, ['Backspace']: 67,
		// ['.']: 56, [';']: 74, ['/']: 76,
		['ArrowLeft']: 21, ['ArrowUp']: 19, ['ArrowRight']: 22, ['ArrowDown']: 20, ['Enter']: 66, ['Space']: 62,
	}
	if (e.keyCode >= 65 && e.keyCode <= 90) {
		keyCode = 29 + (e.keyCode * 1 - 65);
	} else if (e.keyCode >= 48 && e.keyCode <= 57) {
		keyCode = 7 + (e.keyCode * 1 - 48);
	} else if (keyMap[e.key]) {
		keyCode = keyMap[e.key];
	}
	if (e.key.length == 1) {
		inputText(e.key);
	} else if (keyCode) {
		inputKey(keyCode);
	} else {
	}
	console.log('keybord_code', e.key, e.keyCode);
};

export const installApk = (file, config) => {
  const form = new FormData();
  form.append('file', file, 'filename.apk');
  const request_config = {
    method: 'post',
    url: getAtxUrl() + '/install',
    headers: {
        // "Authorization": "Bearer " + access_token,
        'Content-Type': 'multipart/form-data',
    },
    data: form,
  };
  return axios(request_config);
};

export const uninstallPkg = (pkg) => {
  return axios.delete(getAtxUrl() + `/packages/${pkg}`);
};

// minicap
export const installMinicap = () => {
  return axios.put(getAtxUrl() + '/minicap');
};
export const getMinicapDisplay = () => {
  return shell({ cmd: 'minicap -i' })
    .then((res) => JSON.parse(res.data.output));
};

// minitouch
export const installMinitouch = () => {
  return axios.put(getAtxUrl() + '/minitouch');
};
export const checkMinitouch = () => {
  return shell({ cmd: 'minitouch -h 2>&1' })
    .then((res) => /usage/i.test(res.data.output));
};

// busybox
export const installBusybox = () => {
  return axios.get(getAtxUrl() + '/busybox/install');
};
export const removeBusybox = () => {
  return axios.get(getAtxUrl() + '/busybox/uninstall');
};
export const getBusyboxVersion = () => {
  return shell({ cmd: 'busybox 2>&1' })
    .then((res) => res.data.output.match(/v[.0-9]+/)?.[0]);
};

// alist
export const installAlist = () => {
  return axios.put(getAtxUrl() + '/alist');
};
export const getAlistVersion = () => {
  return axios.get(getAtxUrl() + '/alist')
    .then((res) => {
      let output = {};
      res.data.data.split(/\n/).forEach((row) => {
        const spIndex = row.indexOf(':');
        output[row.substring(0, spIndex).trim().toLowerCase()] = row.substring(spIndex + 1).trim();
      });
      return output;
    });
};

export const getPackages = (filter) => {
  return axios.get(getAtxUrl() + '/packages');
};

export const getPkgInfo = (name) => {
  return axios.get(getAtxUrl() + `/packages/${name}/info`);
};

export const sl4aApi = (params) => {
  const formData = new FormData();
  Object.keys(params).forEach(function(name) {
    formData.append(name, params[name]);
  })

  return axios.post(
    getAtxUrl() + '/sl4a',
    formData,
  );
  xhr.responseType = 'json';
};
