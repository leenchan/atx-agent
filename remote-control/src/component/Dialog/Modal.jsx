import Dialog from '@ui/Dialog';
import { Box, Button, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const modes = {
  info: {
    title: 'Info',
    color: 'info',
    icon: <InfoOutlinedIcon color="secondary" fontSize="large" />
  },
  warning: {
    title: 'Warning',
    color: 'warning',
    icon: <WarningAmberOutlinedIcon color="warning" fontSize="large" />
  },
  error: {
    title: 'Error',
    color: 'error',
    icon: <ErrorOutlinedIcon color="error" fontSize="large" />
  },
  suceess: {
    title: 'Success',
    color: 'success',
    icon: <CheckCircleOutlineOutlinedIcon color="success" fontSize="large" />
  },
};

const Modal = ({
  mode,
  title,
  footer,
  onOk,
  onClose,
  okText = 'OK',
  closeText = 'Close',
  children,
  loading,
  open,
  content,
  icon,
}) => {
  const modalMode = Object.keys(modes).includes(mode) ? mode : 'info';
  const modalTitle = title ?? modes[modalMode].title;

  return (
    <Dialog
      open={!!open}
      footer={footer ? footer : (
        <Box display="flex" justifyContent="flex-end">
          {onClose && (
            <Button color="secondary" onClick={onClose} disabled={!!loading}>
              {closeText}
            </Button>
          )}
          {onOk && (
            <Button onClick={onOk} color={modes[modalMode].color} disabled={!!loading}>
              {okText}
            </Button>
          )}
        </Box>
      )}
      title={
        <Box display="flex" justifyContent="flex-start" alignItems="center">
          <Box mr={2} display="flex">
            {icon ?? modes[modalMode].icon}
          </Box>
          <Typography sx={{ fontSize: '1.25rem' }}>{modalTitle}</Typography>
        </Box>
      }
      onClose={onClose}
    >
      {content ? (
        <>
          {typeof content === 'string' ? (
            <Typography variant="body2">{content}</Typography>
          ) : content}
        </>
      ) : children}
    </Dialog>
  )
};

export default Modal;
