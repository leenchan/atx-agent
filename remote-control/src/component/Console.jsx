import { useContext, useState } from 'react';
import {
  Box, Button, TextField, OutlinedInput,
  InputAdornment, IconButton, Divider, Typography,
  Chip,
} from '@mui/material';
import { useTheme } from '@emotion/react';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { LogContext, InfoContext } from './RemoteControl';
import { inputText, shell, getInfo, sl4aApi } from '@api/atx';
import InfoModal from './Dialog/InfoModal';

const BarIcon = ({
  Icon,
  ...props
}) => (
  <IconButton
    size="small"
    sx={{
      borderRadius: 1,
    }}
    color="inherit"
    {...props}
  >
    {!!Icon && (
      <Icon fontSize="small" />
    )}
  </IconButton>
);

const logTypes = {
  error: {
    color: 'error',
    title: 'ERROR',
  },
  info: {
    color: 'info',
    title: 'INFO',
  },
  success: {
    color: 'success',
    title: 'SUCCESS',
  },
  warning: {
    color: 'warning',
    title: 'WARNING',
  },
};

const LogChip = ({ type, sx, ...props }) => {
  const logType = logTypes[type] ?? logTypes.info;
  return (
    <Chip
      color={logType.color}
      label={logType.title}
      variant="outlined"
      size="small"
      sx={{
        fontSize: '0.625rem',
        height: 'auto',
        ...sx,
      }}
      {...props}
    />
  );
};

const Console = () => {
  const theme = useTheme();
  const log = useContext(LogContext);
  const [text, setText] = useState();
  const [info, setInfo] = useState();
  const disabledInputButtons = !(text && `${text}`.trim() !== '');
  const deviceInfo = useContext(InfoContext);

  const onTts = async (e) => {
    try {
      const res = await sl4aApi({ activity: 'ttsSpeak', arg1: textInput.value.replace(/\s+/g, ',') });
    } catch (error) {
      
    }
  };

  const onRunCmd = async (e) => {
    try {
      const res = await shell({ cmd: text });
    } catch (error) {
      
    }
  };

  const onSendText = async (e) => {
    try {
      const res = await inputText(text);
    } catch (error) {
      
    }
  };

  const onGetInfo = async () => {
    try {
      const res = await getInfo();
      const { data: { output } } = await shell({ cmd: 'getprop' });
      setInfo(JSON.parse('{' + output.replace(/[\[\]]/g, '"').replace(/\n/g, ',').replace(/,$/, '') + '}'));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" flex="1" bgcolor={theme.palette.background.panel}>
        <Box px={2} py={1}>
          <OutlinedInput
            fullWidth
            size="small"
            placeholder="TTS / Command / Text"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={onTts} disabled={disabledInputButtons}>
                  <RecordVoiceOverOutlinedIcon />
                </IconButton>
                <Divider variant="middle" orientation="vertical" flexItem />
                <IconButton onClick={onRunCmd} disabled={disabledInputButtons}>
                  <TerminalOutlinedIcon />
                </IconButton>
                <Divider variant="middle" orientation="vertical" flexItem />
                <IconButton onClick={onSendText} color="primary" disabled={disabledInputButtons}>
                  <SendOutlinedIcon />
                </IconButton>
              </InputAdornment>
            }
            sx={{
              paddingRight: 0,
              background: theme.palette.background.default,
              '&:focus': {
                background: theme.palette.background.lighter,
              },
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Box>
        <Box display="flex" flexWrap="nowrap" justifyContent="right" borderTop={theme.border.lighter}>
          <Box width="50%" color="text.secondary">
            <BarIcon Icon={BlockOutlinedIcon} title="Clear" onClick={log.clear} />
          </Box>
          <Box width="50%" display="flex" justifyContent="flex-end" color="text.secondary">
            <BarIcon Icon={InfoOutlinedIcon} color="inherit" title="Device Info" onClick={onGetInfo} />
            <Divider orientation="vertical" variant="middle" flexItem />
            <BarIcon Icon={ExtensionOutlinedIcon} color="inherit" title="Install APK" />
            <Divider orientation="vertical" variant="middle" flexItem />
            <BarIcon Icon={SettingsOutlinedIcon} color="inherit" title="Setting" />
          </Box>
        </Box>
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          // border="1px solid"
          // borderColor="divider"
          // borderRadius={theme.radius.button}
          bgcolor={theme.palette.background.lighter}
        >
          <Box flex="1" position="relative" minHeight={{ xs: 200, md: 'unset' }}>
            <Box minHeight={{ xs: 100, md: 'unset' }} overflow="overlay" p={2} position="absolute" height="100%" width="100%">
              {/* {console.log([...log?.log])} */}
              {[...log?.log].reverse().map(({ type, content, time, pin }, index) =>
                (content && (
                  <Box p={0.25} my={0.5} key={index}>
                    {content.props ? content : (
                      <Typography variant="subtitle2" color="text.secondary">
                        <LogChip type={type} sx={{ marginRight: '0.5rem' }} title={new Date(time)} />
                        {content}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
        <Box textAlign="right" p={1}>
          <Typography variant="subtitle2" color="text.secondary">
            version: 1.0.1
          </Typography>
        </Box>
      </Box>
      <InfoModal
        info={info}
        onClose={() => setInfo()}
      />
    </>

  );
};

export default Console;
