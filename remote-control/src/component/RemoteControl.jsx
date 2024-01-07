import { useEffect, useState, useRef, createContext } from 'react';
import { Box, Divider } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useBreakpoint } from '@theme';
import { Messages } from '@ui/Message';
import useLoading from '@hook/useLoading';
import { sendKeybordCode, getPropByJson, getInfo } from '@api/atx';
import Controller from './Controller';
import Console from './Console';
import Screen from './Screen';
import ScreenFooter from './ScreenFooter';
import { MessageContext } from '@ui/Message';
import { LoadingContext } from '@hook/useLoading';
import { LogContext } from '@hook/log';
import { OptionContext, useOption } from '@hook/useOption';

export const InfoContext = createContext({});

const RemoteControl = () => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [openController, setOpenController] = useState(false);
  // const [loading, setLoading] = useState([]);
  const loading = useLoading();
  const [msg, setMsg] = useState([]);
  const [log, setLog] = useState([]);
  const [info, setInfo] = useState({});
  const option = useOption();

  const openMsg = (message) => {
    setMsg((prevMsg) => [...prevMsg, message]);
  };
  const closeMsg = (message) => {
    setMsg((prevMsg) => prevMsg.filter((m) => m !== message));
  };
  const clearMsg = () => {
    setMsg((prevMsg) => []);
  };
  const addLog = ({ type, content, time, pin }) => {
    setLog(prev => [...prev, { type, content, time: new Date().valueOf(), pin }]);
  };
  const clearLog = () => {
    setLog(prev => []);
  };
  const refreshInfo = async () => {
    loading.add('info');
    try {
      // const data = await getPropByJson();
      const { data } = await getInfo();
      setInfo(data);
    } catch (error) {
      console.error(error);
    }
    loading.remove('info');
  };

  useEffect(() => {
    document.addEventListener('keydown', function(e) {
      // console.log(e)
    });
    document.addEventListener('keyup', function(e) {
      if (e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA' || e.ctrlKey || e.altKey) {
        return;
      }
      try {
        sendKeybordCode(e);
        addLog({ type: 'info', content: `keycode: ${e.keyCode}` })
      } catch (error) {
        
      }
    });
    refreshInfo();
  }, []);

  return (
    <MessageContext.Provider value={{ msg, add: openMsg, remove: closeMsg, clear: clearMsg }}>
      <LoadingContext.Provider value={loading}>
        <LogContext.Provider value={{ log, add: addLog, clear: clearLog }}>
          <InfoContext.Provider value={{ info, refresh: refreshInfo }}>
            <OptionContext.Provider value={option}>
              <Box height={{ xs: 'auto', md: '100vh' }}>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                    <Box
                      flex="1"
                      display="flex"
                      flexDirection="column"
                      borderRight={{ xs: 'none', md: theme.border.light }}
                      borderBottom={{ xs: theme.border.light, md: 'none' }}
                    >
                      <Screen />
                      <ScreenFooter
                        onToggleController={() => setOpenController(!openController)}
                        openController={openController}
                      />
                    </Box>
                    <Divider orientation={isMobile ? 'horizontal' : 'vertical'} flexItem />
                    <Box width={{ xs: '100%', md: '33.33%', xl: '25%' }} display="flex" flexDirection="column">
                      <Box>
                        <Controller openController={openController} />
                      </Box>
                      <Box flex="1" display="flex" flexDirection="column">
                        <Console />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Messages
                  messages={msg}
                  onClose={closeMsg}
                />
            </OptionContext.Provider>
          </InfoContext.Provider>
        </LogContext.Provider>
      </LoadingContext.Provider>
    </MessageContext.Provider>
  )
};

export default RemoteControl;
