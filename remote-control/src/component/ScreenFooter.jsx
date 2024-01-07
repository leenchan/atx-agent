import { Box, Button, IconButton } from '@mui/material';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SettingsRemoteOutlinedIcon from '@mui/icons-material/SettingsRemoteOutlined';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import DesktopAccessDisabledOutlinedIcon from '@mui/icons-material/DesktopAccessDisabledOutlined';
import { useTheme } from '@emotion/react';
import { inputKey, rotate } from '@api/atx';
import { useBreakpoint } from '@theme';
import { LogContext } from '@hook/log';
import { useContext } from 'react';
import { OptionContext } from '@hook/useOption';

const FooterButton = ({
  Icon,
  ...props
}) => {
  const { breakpoint, isMobile } = useBreakpoint(['xs']);
  const size = breakpoint === 'xs' ? 'small' : 'medium';

  return (
    <IconButton
      size={size}
      sx={{
        borderRadius: 1,
      }}
      color="inherit"
      {...props}
    >
      {!!Icon && (
        <Icon fontSize={size} />
      )}
    </IconButton>
  )
};

const ScreenFooter = ({
  openController,
  onToggleController,
}) => {
  const theme = useTheme();

  const log = useContext(LogContext);
  const { option, set: setOption } = useContext(OptionContext);

  const onKeyPress = (code) => {
    inputKey(code);
    log.add({ content: `input key ${code}` });
  };

  return (
    <Box
      display="flex"
      flexWrap="nowrap"
      bgcolor={theme.palette.background.panel}
      justifyContent="center"
      p={1}
      gap={0.5}
      color="text.secondary"
    >
      <FooterButton Icon={PowerSettingsNewOutlinedIcon} onClick={() => onKeyPress(26)} />
      <FooterButton Icon={GridViewOutlinedIcon} onClick={() => onKeyPress(187)} />
      <FooterButton Icon={HomeOutlinedIcon} onClick={() => onKeyPress(3)} />
      <FooterButton Icon={KeyboardBackspaceIcon} onClick={() => onKeyPress(4)} />
      <Box border={theme.border.light} borderRadius={theme.radius.default}>
        <FooterButton Icon={VolumeDownIcon} onClick={() => onKeyPress(24)} />
        <FooterButton Icon={VolumeUpIcon} onClick={() => onKeyPress(25)} />
      </Box>
      <FooterButton
        Icon={option?.disableddMinicap ? DesktopAccessDisabledOutlinedIcon : DesktopWindowsOutlinedIcon}
        onClick={() => setOption({ disableddMinicap: !option?.disableddMinicap })}
        // color={openController ? 'primary' : 'inherit'}
      />
      <FooterButton Icon={SettingsRemoteOutlinedIcon} onClick={onToggleController} color={openController ? 'primary' : 'inherit'} />
    </Box>
  );
};

{/* <li data-keycode="26"><i class="icon icon-power"></i>Power</li>
<!-- <li data-keycode="27">Camera</li> -->
<li data-keycode="187"><i class="icon icon-tasks"></i>Tasks</li>
<li data-keycode="3"><i class="icon icon-home"></i>Home</li>
<li data-keycode="4"><i class="icon icon-back"></i>Back</li>
<li data-keycode="82"><i class="icon icon-menu"></i>Menu</li>
<li id="open-controller"><i class="icon icon-control"></i>Control</li>
<li id="control-open"><i class="icon icon-emoji"></i>Panel</li> */}

export default ScreenFooter;
