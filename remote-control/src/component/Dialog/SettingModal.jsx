import Dialog from '@ui/Dialog';
import { Box, Tabs, Tab } from '@mui/material';

const SettingModal = ({
  open,
  ...props
}) => {

  return (
    <Dialog
      open={!!open}
      title="Setting"
      {...props}
    >
      <Box>

      </Box>
      {/* <Tabs>
        <Tab value="one" label="Item One" />
        <Tab value="two" label="Item Two" />
        <Tab value="three" label="Item Three" />
      </Tabs> */}
    </Dialog>
  )
};

export default SettingModal;
