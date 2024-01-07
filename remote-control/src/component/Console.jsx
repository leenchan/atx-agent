import { useContext, useState, useRef } from 'react';
import {
  Box, Button, TextField, OutlinedInput,
  InputAdornment, IconButton, Divider, Typography,
  Chip,
} from '@mui/material';
import { useTheme } from '@emotion/react';
import { grey } from '@mui/material/colors';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import ScreenRotationOutlinedIcon from '@mui/icons-material/ScreenRotationOutlined';
import { InfoContext } from './RemoteControl';
import { LoadingContext } from '@hook/useLoading';
import { LogContext } from '@hook/log';
import { inputText, shell, getInfo, sl4aApi, rotate } from '@api/atx';
import { getAtxHost } from '@api/common';
import InfoModal from './Dialog/InfoModal';
import Packages from './Dialog/Packages';
import SettingModal from './Dialog/SettingModal';
import Modal from './Dialog/Modal';
import { MessageContext } from '@ui/Message';
import Loading from '@ui/Loading';
import { copyToClipboard } from '@util';

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
  const inputRef = useRef();
  const theme = useTheme();
  const log = useContext(LogContext);
  const infoContext = useContext(InfoContext);
  const loading = useContext(LoadingContext);
  const message = useContext(MessageContext);
  const [text, setText] = useState();
  const [info, setInfo] = useState();
  const [openInstallApk, setOpenInstallApk] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [output, setOutput] = useState();
  const disabledInputButtons = !(text && `${text}`.trim() !== '');
  
  const onTts = async (e) => {
    try {
      const res = await sl4aApi({ activity: 'ttsSpeak', arg1: textInput.value.replace(/\s+/g, ',') });
    } catch (error) {
      
    }
  };

  const onRunCmd = async (e) => {
    loading.add('cmd');
    try {
      const res = await shell({ cmd: text });
      console.log(res.data.output);
      setOutput(res.data.output);
    } catch (error) {
      message.add({ type: 'error', content: error })
    }
    loading.remove('cmd');
  };

  const onSendText = async (e) => {
    try {
      const res = await inputText(text);
    } catch (error) {
      
    }
  };

  const onClear = () => {
    setText('');
    inputRef.current.focus();
  };

  const onRotate = async () => {
    const { data: { rotation } } = await rotate(2);
    console.log(rotation)
  };

  const onOpenInfo = async () => {
    setInfo(true);
    // try {
    //   const res = await getInfo();
    //   const { data: { output } } = await shell({ cmd: 'getprop' });
    //   setInfo(JSON.parse('{' + output.replace(/[\[\]]/g, '"').replace(/\n/g, ',').replace(/,$/, '') + '}'));
    // } catch (error) {
    //   console.error(error);
    // }
  };

  const onInstallApk = () => {
    setOpenInstallApk(true);
  };

  const onSetting = () => {
    setOpenSetting(true);
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
                <IconButton
                  sx={{ visibility: (text && text !== '' ? 'unset' : 'hidden') }}
                  onClick={onClear}
                >
                  <BackspaceOutlinedIcon htmlColor={theme.palette.text.secondary} fontSize="small" />
                </IconButton>
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
              background: theme.palette.background.lighter,
              '&.Mui-focused': {
                background: theme.palette.background.default,
              },
            }}
            value={text ?? ''}
            onChange={(e) => setText(e.target.value)}
            onFocus={(e) => e.target.select()}
            inputRef={inputRef}
          />
        </Box>
        <Box display="flex" flexWrap="nowrap" justifyContent="right" borderTop={theme.border.lighter}>
          <Box width="50%" display="flex" justifyContent="flex-start" color="text.secondary">
            <BarIcon Icon={BlockOutlinedIcon} title="Clear" onClick={log.clear} />
            <Divider orientation="vertical" variant="middle" flexItem />
            <BarIcon Icon={ScreenRotationOutlinedIcon} onClick={() => onRotate()} />
          </Box>
          <Box width="50%" display="flex" justifyContent="flex-end" color="text.secondary">
            <BarIcon Icon={InfoOutlinedIcon} color="inherit" title="Device Info" onClick={onOpenInfo} />
            <Divider orientation="vertical" variant="middle" flexItem />
            <BarIcon Icon={ExtensionOutlinedIcon} color="inherit" title="Packages" onClick={onInstallApk} />
            <Divider orientation="vertical" variant="middle" flexItem />
            <BarIcon Icon={SettingsOutlinedIcon} color="inherit" title="Setting" onClick={onSetting} />
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
                      <Typography variant="body2" color="text.secondary">
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
          <Typography fontSize="0.75rem" color="text.secondary">
            {getAtxHost()}
          </Typography>
        </Box>
      </Box>
      <InfoModal
        open={info}
        onClose={() => setInfo()}
      />
      <Packages
        open={openInstallApk}
        onClose={() => setOpenInstallApk(false)}
      />
      <SettingModal
        open={openSetting}
        onClose={() => setOpenSetting(false)}
      />
      <Modal
        title="Command"
        open={loading.has('cmd') || output !== undefined}
        content={
          <Box bgcolor={grey[900]} color={grey[100]} p={1} fontSize="0.825rem" sx={{ wordBreak: 'break-all' }} minHeight={100}>
            {loading.has('cmd') && <Loading />}
            {output ? output.split('\n').map((row) => (
              <>
                {row ? row.replace(/ /g, '\u00a0').replace(/\t/, '\u00a0\u00a0\u00a0\u00a0') : ''}
                <br />
              </>
            )) : ''}
          </Box>
        }
        footer={
          <Box>
            <Button color="secondary" onClick={() => setOutput()}>Cancel</Button>
            <Button onClick={() => copyToClipboard(output)}>Copy</Button>
          </Box>
        }
      />
    </>

  );
};

export default Console;
