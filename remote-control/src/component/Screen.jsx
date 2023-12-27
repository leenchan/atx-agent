import { useState, useEffect, useRef, useContext } from 'react';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import AndroidIcon from '@mui/icons-material/Android';
import SentimentNeutralOutlinedIcon from '@mui/icons-material/SentimentNeutralOutlined';
import { useLoading } from '@hook';
import { createMinicapWebsocket, createMinitouchWebsocket } from '@api/websocket';
import { shell, sendTouch, inputKey } from  '@api/atx';
import { MessageContext, LoadingContext, LogContext } from './RemoteControl';

const ScreenCanvas = styled.canvas`
  display: block;
  width: 100%;
`;

const msgConnected = {
  type: 'success',
  content: 'Connected to minicap.',
};

const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const initDisplay = () => {
  shell({cmd: 'dumpsys display', onSuccess: function(res) {
    var data = res;
    if (data.output) {
      // console.log(data.output)
      var orientationData = data.output.match(/orientation=[0-3]/);
      if (orientationData && orientationData[0]) {
        window.orientation = orientationData[0].split('=')[1] * 90;
        console.log('orientation: ' + window.orientation);
      }
      var mStableDisplaySize = data.output.match(/mStableDisplaySize=[^\(]*\([^\)]+\)/);
      if (mStableDisplaySize && mStableDisplaySize[0]) {
        window.displayPhySize = mStableDisplaySize[0].replace(/.*\(/,'').replace(/([0-9]+),\s*([0-9]+).*/, '$1x$2');
        console.log('displayPhySize:' + window.displayPhySize);
      }
    }
  }});
};

const onReceiveData = ({ canvas, onSizeChange }) => (message) => {
  if (!canvas || !canvas.getContext) {
    return;
  }
  // Direction Changed
  if (typeof message.data == 'string' && message.data.match(/rotation [0-9]+/)) {
    // window.orientation = message.data.match(/[0-9]+/)[0];
    // initDisplay();
    return;
  }
  var blob = new Blob([message.data], {type: 'image/jpeg'});
  var URL = window.URL || window.webkitURL;
  var img = new Image();
  const g = canvas.getContext('2d');
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
    img.src = BLANK_IMG;
    img = null;
    u = null;
    blob = null;
  };
  var u = URL.createObjectURL(blob);
  img.src = u;
};

const Screen = ({}) => {
  const theme = useTheme();
  const canvasRef = useRef();
  const minicap = useRef();
  const minitouch = useRef();
  const { openMsg, closeMsg } = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  // const loading = useLoading();
  const log = useContext(LogContext);
  const [count, setCount] = useState(0);

  let pointersDown = [];
  let pointersMove = [];
  let scrollAction = {};
  
  const clearPointer = (pointerId) => {
    pointersDown = pointersDown.filter(p => p.pointerId !== pointerId);
    pointersMove = pointersMove.filter(p => p.pointerId !== pointerId);
  };
  const onMinitouchSend = (event) => {
    sendTouch({
      minitouch: minitouch.current,
      event,
      onSuccess: () => {

      },
    });
  };
  const onPointerDown = (e) => {
    if (e.button == 2) {return}
    var event = { pointerId: e.pointerId, operation: 'd', index: pointersDown.length, xP: (e.offsetX ?? e.clientX) / e.target.clientWidth, yP: (e.offsetY ?? e.clientY) / e.target.clientHeight, pressure: 50};
    // console.log(e, event)
    onMinitouchSend(event);
    onMinitouchSend({ operation: 'c' });
    pointersDown.push(event);
  };
  const onPointerUp = (e) => {
    if (e.button == 2) {return}
    if (pointersDown.find(function(p) {return p.pointerId === e.pointerId})) {
      onMinitouchSend({ operation: 'u', index: pointersDown.map(function(p) {return p.pointerId}).indexOf(e.pointerId) });
      onMinitouchSend({ operation: 'c' });
      clearPointer(e.pointerId);
    }
  };
  const onPointerOut = (e) => {
    // console.log(e)
    if (e.button == 2) {return}
    if (pointersDown.find(function(p) {return p.pointerId === e.pointerId})) {
      onMinitouchSend({ operation: 'u', index: pointersDown.map(function(p) {return p.pointerId}).indexOf(e.pointerId) });
      onMinitouchSend({ operation: 'c' });
      clearPointer(e.pointerId);
    }
  };
  const onPointerMove = (e) => {
    if (e.button == 2) {return}
    if (!pointersDown.find(function(p) {return p.pointerId === e.pointerId})) {
      return false;
    }
    var pointersMoveIndex = pointersMove.map(function(p) {return p.pointerId}).indexOf(e.pointerId);
    var event = { pointerId: e.pointerId, operation: 'm', index: pointersMoveIndex >= 0 ? pointersMoveIndex : 0, xP: e.offsetX / e.target.clientWidth, yP: e.offsetY / e.target.clientHeight, pressure: 50};
    onMinitouchSend(event);
    onMinitouchSend({ operation: 'c' });
    if (pointersMoveIndex >= 0) {
      pointersMove.splice(pointersMoveIndex, 1, event);
    } else {
      pointersMove.push(event);
    }
  };
  const onContextMenu = (e) => {
    e.preventDefault();
    inputKey(4);
    return false;
  };

  useEffect(() => {
    if (canvasRef.current && !minicap.current) {
      loading.add('minicap');
      minicap.current = createMinicapWebsocket({
        onOpen: () => {
          log.add({ type: 'info', content: 'connected to minicap.' });
        },
        onMessage: (data) => {
          if (typeof data.data !== 'string') {
            setCount(prev => prev + 1);
          }
          onReceiveData({
            canvas: canvasRef.current,
          })(data);
        },
        onError: () => {
          minicap.current = undefined;
        },
        updateDuration: 100,
      });
    }
  }, [canvasRef.current, minicap.current]);

  useEffect(() => {
    if (!minitouch.current) {
      minitouch.current = createMinitouchWebsocket({
        onOpen: () => {
          log.add({ type: 'info', content: 'connected to minitouch.' });
        },
        onMessage: (data) => {
          console.log(data.message);
        },
      });
    }
  }, [minitouch.current]);

  useEffect(() => {
    if (count === 1) {
      loading.remove('minicap');
      log.add({ type: 'success', content: 'retriving image from minicap.' });
      // openMsg(msgConnected);
    }
  }, [count]);

  useEffect(() => {
  }, []);

  return (
    <Box bgcolor={theme.palette.grey[700]} p={{ xs: 0, md: 0 }} flex="1">
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
            <AndroidIcon sx={{ fontSize: { xs: '8rem', sm: '12rem', md: '16rem' }, color: 'grey' }} />
            {/* <Typography color="grey" fontSize={{ xs: '1rem', sm: '2rem', md: '3rem' }} fontWeight={700}>ATX-AGENT</Typography> */}
            <LinearProgress sx={{ width: '50%', maxWidth: '120px' }} color="primary" />
          </Box>
        )}
        <Box
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
          onContextMenu={onContextMenu}
        >
          <ScreenCanvas ref={canvasRef} />
        </Box>
      </Box>
    </Box>
  );
};

export default Screen;
