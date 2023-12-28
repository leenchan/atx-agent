import Dialog from '@ui/Dialog';

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
    </Dialog>
  )
};

export default SettingModal;
