import { useState, useContext } from 'react';
import { Box, Button, Divider, IconButton, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useBreakpoint } from '@theme';
import Collapse from '@mui/material/Collapse';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { inputKey } from '@api/atx';
import { LogContext } from '@hook/log';

const ControllerButton = ({ Icon, children, sx, ...props }) => {
  const { isMobile } = useBreakpoint();

  return (
    <IconButton
      size={isMobile ? 'medium' : 'large'}
      sx={{
        borderRadius: 0,
        color: 'text.secondary',
        // '&:hover': {
        //   color: 'text.primary',
        // },
        md: { padding: 0 },
        ...sx,
      }}
      // color="inherit"
      {...props}
    >
      {!!Icon && (
        <Icon fontSize="inherit" />
      )}
      {children}
    </IconButton>
  );
};

const Controller = ({ openController }) => {
  const theme = useTheme();
  const log = useContext(LogContext);
  const borderRadiusA = theme.radius[5];

  const groupButtonStyle = {
    border: theme.border.dark,
  };

  const onKeyPress = (code) => {
    inputKey(code);
    log.add({ content: `input key ${code}` });
  };

  return (
    <Box bgcolor={theme.palette.background.panel} display="flex" flexDirection="column">
      <Box flex="1">
        <Collapse in={openController}>
          <Box p={2} borderBottom={theme.border.light}>
            <Box maxWidth={320} mx="auto">
              <Box display="flex">
                <Box width="20%">
                  <Box sx={groupButtonStyle} display="flex" flexDirection="column" borderRadius={borderRadiusA} overflow="hidden">
                    <ControllerButton Icon={SkipPreviousOutlinedIcon} onClick={() => onKeyPress(88)} />
                    <ControllerButton Icon={SkipNextOutlinedIcon} onClick={() => onKeyPress(87)} />
                  </Box>
                </Box>
                <Box width="60%" px={2}>
                  <Box display="flex" flexWrap="wrap" sx={{ ...groupButtonStyle, '& > *': { width: '33.33%' } }} borderRadius="50%" overflow="hidden">
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowUpIcon} onClick={() => onKeyPress(19)} />
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowLeftIcon} onClick={() => onKeyPress(21)} />
                    <ControllerButton sx={{ border: theme.border.darker, borderRadius: '50%' }} onClick={() => onKeyPress(66)}>
                      <Typography>OK</Typography>
                    </ControllerButton>
                    <ControllerButton Icon={KeyboardArrowRightIcon} onClick={() => onKeyPress(22)} />
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowDownIcon} onClick={() => onKeyPress(20)} />
                    <Box>
                    </Box>
                  </Box>
                </Box>
                <Box width="20%">
                  <Box sx={groupButtonStyle} display="flex" flexDirection="column" borderRadius={borderRadiusA} overflow="hidden">
                    <ControllerButton Icon={StopIcon} onClick={() => onKeyPress(86)} />
                    <ControllerButton Icon={PlayArrowIcon} onClick={() => onKeyPress(85)} />
                  </Box>
                </Box>
              </Box>
              <Box display="flex" mt={1}>
                <Box width="20%" display="flex">
                  <Box
                    display="flex"
                    flexDirection="column"
                    borderRadius={borderRadiusA}
                    overflow="hidden"
                    flex="1"
                    sx={{ ...groupButtonStyle, '& > *': { height: '33.33%' } }}
                  >
                    <ControllerButton Icon={AddIcon} onClick={() => onKeyPress(24)} />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ opacity: 0.25, '&:after': { content: '""' } }}>
                      <VolumeUpOutlinedIcon />
                    </Box>
                    <ControllerButton Icon={RemoveIcon} onClick={() => onKeyPress(25)} />
                  </Box>
                </Box>
                <Box width="60%">
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    sx={{ '& > *': { width: '33.33%', textAlign: 'center', p: 1 } }}
                    px={1}
                  >
                    {[
                      [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13],
                      [7, 14], [8, 15], [9, 16], ['*', 17], ['0', 7], ['#', 18]
                    ].map(([key, code]) => (
                      <ControllerButton data-keycode={code} key={key} onClick={() => onKeyPress(code)}>
                        <Typography>{key}</Typography>
                      </ControllerButton>
                    ))}
                  </Box>
                </Box>
                <Box width="20%" display="flex">
                  <Box
                    display="flex"
                    flexDirection="column"
                    borderRadius={borderRadiusA}
                    overflow="hidden"
                    flex="1"
                    sx={{ ...groupButtonStyle, '& > *': { height: '33.33%' } }}
                  >
                    <ControllerButton Icon={KeyboardArrowUpIcon} onClick={() => onKeyPress(166)} />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ opacity: 0.25, '&:after': { content: '""' } }}>
                      CH
                    </Box>
                    <ControllerButton Icon={KeyboardArrowDownIcon} onClick={() => onKeyPress(167)} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>
      {/* <Button
        variant="outlined"
        size="medium"
        fullWidth
        startIcon={<SettingsRemoteOutlinedIcon fontSize="small" />}
        onClick={() => setOpen(!open)}
        color={open ? 'info' : 'primary'}
      >
        Remote Control
      </Button> */}
    </Box>
  );
};

export default Controller;
