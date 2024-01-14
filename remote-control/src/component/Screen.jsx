import { useState, useEffect, useRef, useContext } from 'react';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import AndroidIcon from '@mui/icons-material/Android';
import SentimentNeutralOutlinedIcon from '@mui/icons-material/SentimentNeutralOutlined';
import { useLoading } from '@hook';
import { createMinicapWebsocket, createMinitouchWebsocket } from '@api/websocket';
import { shell, sendTouch, inputKey } from  '@api/atx';
import { LogContext } from '@hook/log';
import { LoadingContext } from '@hook/useLoading';
import { SettingContext } from '@hook/useSetting';
import { MessageContext } from '@ui/Message';
import Loading from '@ui/Loading';
import { OptionContext } from '@hook/useOption';
import { delay } from '@util';
import { InfoContext } from './RemoteControl';

const commitEvent = { operation: 'c' };

const ScreenCanvas = styled.canvas`
  display: block;
  width: 100%;
`;

const msgConnected = {
  type: 'success',
  content: 'Connected to minicap.',
};

const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const Pointer = ({ pointer }) => {
  useEffect(() => {
    // not work!
  }, [pointer.move]);

  return (
    <Box
      sx={{
        opacity: 0.5,
        position: 'absolute',
        width: '5%',
        paddingBottom: '5%',
        borderRadius: '50%',
        background: '#fff',
        transform: 'translate(-2.5%, -2.5%)',
      }}
    />
  );
};

const Screen = ({ ...props }) => {
  const theme = useTheme();
  const canvasRef = useRef();
  const minicap = useRef();
  const minitouch = useRef();
  const interval = useRef();
  const msg = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  // const loading = useLoading();
  const log = useContext(LogContext);
  const { setting } = useContext(SettingContext);
  const { option = {} } = useContext(OptionContext);
  const { current: pointer } = useRef({ down: [], move: [], scroll: {} });
  const { info, refresh: refreshInfo } = useContext(InfoContext);
  const [display, setDisplay] = useState({});

  let scrollAction = {};

  const clearPointer = (pointerId) => {
    pointer.down = pointer.down.filter(p => p.pointerId !== pointerId);
    pointer.move = pointer.move.filter(p => p.pointerId !== pointerId);
  };
  const onMinitouchSend = async (event) => {
    try {
      await sendTouch({
        minitouch: minitouch.current,
        event,
        display: info?.display,
        rotation: info?.rotation,
        pointerDown: pointer?.down,
        pointerMove: pointer?.move,
        onSend: (obj) => {
          // console.log(obj);
          // log.add({ type: 'info', content: `x:${obj.xP} y:${obj.yP}` });
        },
      });
    } catch (error) {
    }
  };
  const onPointerDown = (e) => {
    if (e.button == 2) {return}
    const event = { pointerId: e.pointerId, operation: 'd', index: pointer.down.length, xP: e.nativeEvent.offsetX / e.target.clientWidth, yP: e.nativeEvent.offsetY / e.target.clientHeight, pressure: 50};
    // console.log(e, event)
    onMinitouchSend(event);
    onMinitouchSend(commitEvent);
    pointer.down.push(event);
  };
  const onPointerUp = (e) => {
    if (e.button == 2) {return}
    if (pointer.down.find(function(p) {return p.pointerId === e.pointerId})) {
      const event = { operation: 'u', index: pointer.down.map(function(p) {return p.pointerId}).indexOf(e.pointerId) };
      onMinitouchSend(event);
      onMinitouchSend(commitEvent);
      clearPointer(e.pointerId);
    }
  };
  const onPointerOut = (e) => {
    // console.log(e)
    if (e.button == 2) {return}
    if (pointer.down.find(function(p) {return p.pointerId === e.pointerId})) {
      const event = { operation: 'u', index: pointer.down.map(function(p) {return p.pointerId}).indexOf(e.pointerId) };
      onMinitouchSend(event);
      onMinitouchSend(commitEvent);
      clearPointer(e.pointerId);
    }
  };
  const onPointerMove = (e) => {
    if (e.button == 2) {return}
    if (!pointer.down.find((p) => p.pointerId === e.pointerId)) {
      return false;
    }
    const pointersMoveIndex = pointer.move.map(function(p) {return p.pointerId}).indexOf(e.pointerId);
    const event = { pointerId: e.pointerId, operation: 'm', index: pointersMoveIndex >= 0 ? pointersMoveIndex : 0, xP: e.nativeEvent.offsetX / e.target.clientWidth, yP: e.nativeEvent.offsetY / e.target.clientHeight, pressure: 50};
    onMinitouchSend(event);
    onMinitouchSend(commitEvent);
    if (pointersMoveIndex >= 0) {
      // pointer.move.splice(pointersMoveIndex, 1, event);
      pointer.move = pointer.move.map((e, i) => i === pointersMoveIndex ? event : e);
    } else {
      pointer.move = [...pointer.move, event];
      // pointer.move.push(event);
    }
  };
  const onContextMenu = (e) => {
    e.preventDefault();
    inputKey(4);
    return false;
  };
  
  const onScreenChange = ({ canvas, onSizeChange }) => (message) => {
    if (!canvas || !canvas.getContext) {
      return;
    }
    const g = canvas.getContext('2d');
    const URL = window.URL || window.webkitURL;
    let blob = new Blob([message.data], {type: 'image/jpeg'});
    let url = URL.createObjectURL(blob);
    let img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      // mainDOM.classList.add('horizontal');
      // if (img.width >= img.height) {
      //   mainDOM.classList.add('horizontal');
      // } else {
      //   mainDOM.classList.remove('horizontal');
      // }
      // if (img.width + 'x' + img.height != window.screenSize) {
      //   initDisplay();
      //   window.screenSize = img.width + 'x' + img.height;
      // }
      g.drawImage(img, 0, 0);
      img.onload = null;
      // img.src = BLANK_IMG;
      img = null;
      url = null;
      blob = null;
    };
    img.src = url;
  };

  const onConnectMinicap = () => {
    // console.log(minicap.current?.readyState);
    if (!canvasRef.current || [0, 1].includes(minicap.current?.readyState)) {
      return;
    }
    if (minicap.current?.readyState === 3) {
      minicap.current.close();
    }
    try {
      minicap.current = createMinicapWebsocket({
        onOpen: () => {
          log.add({ type: 'info', content: 'connected to minicap.' });
        },
        onMessage: (data) => {
          if (typeof data.data === 'string') {
            console.log(data.data);
            // Direction Changed
            if (typeof data.data === 'string' && data.data.match(/rotation [0-9]+/)) {
              refreshInfo();
              return;
            }
          } else {
  
          }
          onScreenChange({
            canvas: canvasRef.current,
          })(data);
        },
        onError: () => {
          log.add({ type: 'error', content: 'Failed to connect to minicap.' });
          minicap.current.close();
          // minicap.current = undefined;
        },
        updateDuration: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onConnectMinitouch = () => {
    // console.log(minitouch.current?.readyState);
    if ([0, 1].includes(minitouch.current?.readyState)) {
      return;
    }
    if (minitouch.current?.readyState === 3) {
      minitouch.current.close();
    }
    try {
      minitouch.current = createMinitouchWebsocket({
        onOpen: () => {
          log.add({ type: 'info', content: 'connected to minitouch.' });
        },
        onMessage: (data) => {
          // console.log(data.message);
        },
        onError: () => {
          log.add({ type: 'error', content: 'Failed to connect to minitouch.' });
          minitouch.current.close();
          // minitouch.current = undefined;
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const init = () => {
    if (option.disableddMinicap) {
      return;
    }
    if (interval.current) {
      clearInterval(interval.current);
    }
    // console.log(setting.host);
    onConnectMinicap();
    onConnectMinitouch();
    interval.current = setInterval(() => {
      if (minicap.current?.readyState !== 1) {
        // console.log('reconnecting to minicap...');
        onConnectMinicap();
      }
      if (minitouch.current?.readyState !== 1) {
        // console.log('reconnecting to minitouch...');
        onConnectMinitouch();
      }
    }, 5000);
  };

  useEffect(() => {
    console.log(setting.host);
    // console.log('B');
    if (option.disableddMinicap) {
      if (minicap.current) {
        minicap.current.close();
      }
      if (minitouch.current) {
        minitouch.current.close();
      }
      msg.add({ type: 'warning', content: 'Disconnected from minicap.' });
      clearInterval(interval.current);
    } else {
      init();
    }
    return () => {
      // console.log('A');
      // console.log(minicap.current, minitouch.current);
    };
  }, [setting.host, option]);

  useEffect(() => {
    // console.log(display);
  }, [display]);

  useEffect(() => {
    init();
  }, []);

  // console.log(minitouch.current)

  return (
    <Box
      bgcolor={theme.palette.grey[900]}
      p={{ xs: 0, md: 0 }}
      flex="1"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      {...props}
    >
      <Box
        borderRadius={{ xs: 0, md: 0 /* theme.radius.box */ }}
        overflow="hidden"
        position="relative"
      >
        {loading.has('minicap') && (
          <Box
            position="absolute"
            zIndex={1}
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor={theme.palette.grey[700]}
          >
            <AndroidIcon sx={{ fontSize: { xs: '4rem', sm: '8rem', md: '12rem' }, color: 'grey' }} />
            <Loading />
          </Box>
        )}
        <Box position="relative">
          {/* <Pointer pointer={pointer} /> */}
          <Box
            component="canvas"
            ref={canvasRef}
            width="100%"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            onPointerOut={onPointerOut}
            onContextMenu={onContextMenu}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Screen;
