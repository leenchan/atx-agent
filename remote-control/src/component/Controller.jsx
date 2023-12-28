import { useState } from 'react';
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
  const borderRadiusA = theme.radius[5];

  const groupButtonStyle = {
    border: theme.border.dark,
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
                    <ControllerButton Icon={SkipPreviousOutlinedIcon} />
                    <ControllerButton Icon={SkipNextOutlinedIcon} />
                  </Box>
                </Box>
                <Box width="60%" px={2}>
                  <Box display="flex" flexWrap="wrap" sx={{ ...groupButtonStyle, '& > *': { width: '33.33%' } }} borderRadius="50%" overflow="hidden">
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowUpIcon} />
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowLeftIcon} />
                    <ControllerButton sx={{ border: theme.border.darker, borderRadius: '50%' }}>
                      <Typography>OK</Typography>
                    </ControllerButton>
                    <ControllerButton Icon={KeyboardArrowRightIcon} />
                    <Box>
                    </Box>
                    <ControllerButton Icon={KeyboardArrowDownIcon} />
                    <Box>
                    </Box>
                  </Box>
                </Box>
                <Box width="20%">
                  <Box sx={groupButtonStyle} display="flex" flexDirection="column" borderRadius={borderRadiusA} overflow="hidden">
                    <ControllerButton Icon={StopIcon} />
                    <ControllerButton Icon={PlayArrowIcon} />
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
                    <ControllerButton Icon={AddIcon} />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ opacity: 0.25, '&:after': { content: '""' } }}>
                      <VolumeUpOutlinedIcon />
                    </Box>
                    <ControllerButton Icon={RemoveIcon} />
                  </Box>
                </Box>
                <Box width="60%">
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    sx={{ '& > *': { width: '33.33%', textAlign: 'center', p: 1 } }}
                    px={1}
                  >
                    <ControllerButton data-keycode="8"><Typography>1</Typography></ControllerButton>
                    <ControllerButton data-keycode="9"><Typography>2</Typography></ControllerButton>
                    <ControllerButton data-keycode="10"><Typography>3</Typography></ControllerButton>
                    <ControllerButton data-keycode="11"><Typography>4</Typography></ControllerButton>
                    <ControllerButton data-keycode="12"><Typography>5</Typography></ControllerButton>
                    <ControllerButton data-keycode="13"><Typography>6</Typography></ControllerButton>
                    <ControllerButton data-keycode="14"><Typography>7</Typography></ControllerButton>
                    <ControllerButton data-keycode="15"><Typography>8</Typography></ControllerButton>
                    <ControllerButton data-keycode="16"><Typography>9</Typography></ControllerButton>
                    <ControllerButton data-keycode="17"><Typography>*</Typography></ControllerButton>
                    <ControllerButton data-keycode="7"><Typography>0</Typography></ControllerButton>
                    <ControllerButton data-keycode="18"><Typography>#</Typography></ControllerButton>
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
                    <ControllerButton Icon={KeyboardArrowUpIcon} />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ opacity: 0.25, '&:after': { content: '""' } }}>
                      CH
                    </Box>
                    <ControllerButton Icon={KeyboardArrowDownIcon} />
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
