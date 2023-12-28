import { Box, Button, IconButton } from '@mui/material';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import SettingsRemoteOutlinedIcon from '@mui/icons-material/SettingsRemoteOutlined';
import ScreenRotationOutlinedIcon from '@mui/icons-material/ScreenRotationOutlined';
import { useTheme } from '@emotion/react';
import { inputKey } from '@api/atx';

const FooterButton = ({
  Icon,
  ...props
}) => (
  <IconButton
    size="large"
    sx={{
      borderRadius: 1,
    }}
    color="inherit"
    {...props}
  >
    {!!Icon && (
      <Icon fontSize="medium" />
    )}
  </IconButton>
);

const ScreenFooter = ({
  openController,
  onToggleController,
}) => {
  const theme = useTheme();

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
      <FooterButton Icon={PowerSettingsNewOutlinedIcon} onClick={() => inputKey(26)} />
      <FooterButton Icon={GridViewOutlinedIcon} onClick={() => inputKey(187)} />
      <FooterButton Icon={HomeOutlinedIcon} onClick={() => inputKey(3)} />
      <FooterButton Icon={UndoOutlinedIcon} onClick={() => inputKey(4)} />
      <FooterButton Icon={ScreenRotationOutlinedIcon} onClick={() => inputKey()} />
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
