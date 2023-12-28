import Dialog from '@ui/Dialog';

const InstallApkModal = ({
  open,
  ...props
}) => {
  return (
    <Dialog
      open={!!open}
      title="Install APK"
      {...props}
    >
    </Dialog>
  )
};

export default InstallApkModal;
