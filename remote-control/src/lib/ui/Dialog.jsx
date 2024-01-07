import React from 'react';
import styled from '@emotion/styled';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import { sizing, spacing, borders } from '@mui/system';
import { Box, Slide, IconButton, Typography } from '@mui/material';
import { useBreakpoint } from '@theme';
import { useTheme } from '@mui/material/styles';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Dialog = styled(
  ({
    className,
    width="40rem",
    height,
    maxWidth,
    minWidth,
    maxHeight,
    minHeight,
    px,
    py,
    pt,
    pb,
    borderRadius,
    children,
    scroll="paper",
    title,
    header,
    footer,
    onClose,
    closeButton,
    disableBackdropClick,
    contentProps: { sx: contentSx, ...contentProps } = {},
    ...props
  }) => {
    const { isMobile, padding } = useBreakpoint();
    const showCloseButton = (closeButton == 'mobile' && isMobile) || (closeButton == 'desktop' && !isMobile) || closeButton == 'both';
    const handleClose = (event, reason) => {
      if (reason == 'backdropClick' && (disableBackdropClick === true || disableBackdropClick === 1)) {
        return;
      }
      if (typeof onClose == 'function') {
        onClose(event, reason);
      }
    };
    const hasHeader = (showCloseButton || title);
    const theme = useTheme();

    return (
      <MuiDialog onClose={handleClose} {...props}
        classes={{ paper: className }}
        scroll={scroll}
        // TransitionComponent={Transition}
        sx={{
          ['& .MuiPaper-root']: isMobile ? {
            position: 'fixed',
            bottom: 0,
            left: 0,
            m: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            height: 'auto',
            borderRadius: theme.radius.box,
          } : {
            height: 'auto',
            borderRadius: theme.radius.box,
            ...(scroll == 'body' && { maxHeight: 'none' }),
          },
        }}
      >
        { title &&
          <DialogTitle display="flex" sx={{ padding: '1rem 1.5rem', fontSize: '1.5rem', flexWrap: 'wrap' }}>
            {title}
            {/* {typeof title === 'string' ?
              <Typography variant="h2" sx={{ py: 2, fontSize: '1.125rem', minHeight: 5.75 }} flex="1">{title}</Typography>
              : title
            } */}
            {showCloseButton && (
              <Box sx={{ position: 'absolute', zIndex: 1, top: 12, right: 12 }}>
                {
                  <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                      // position: 'absolute',
                      // right: 8,
                      // top: 8,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              </Box>
            )}
          </DialogTitle>
        }
        <DialogContent
          sx={{
            ['&.MuiDialogContent-root']: {
              px: isMobile ? padding : padding / 2,
              pt: (hasHeader ? 0 : isMobile ? padding : padding / 2),
              pb: footer ? 0 : (isMobile ? padding : padding / 2),
              height: 'auto',
              overflowY: 'overlay',
              position: 'relative',
            },
            ...contentSx,
          }}
          {...contentProps}
        >
          {children}
        </DialogContent>
        {/* {footer &&
          <Box mt={0-3} px={padding} height="0" position="relative">
            <Box height={24} sx={{ background: 'linear-gradient(rgba(255,255,255,0.001), white)' }} />
          </Box>
        } */}
        {footer &&
          <DialogActions
            sx={{
              ['&.MuiDialogActions-root']: {
                px: isMobile ? padding : padding / 2,
                py: isMobile ? padding : padding / 2,
              }
            }}
          >
            {footer}
          </DialogActions>
        }
      </MuiDialog>
    )
})`
  ${sizing}
  ${spacing}
  ${borders}
`;

Dialog.defaultProps = {
  width: { xs: '100%', md: '40rem' },
  mb: { xs: 0, md: 4 },
  maxWidth: { xs: '100%', md: 'lg' },
  maxHeight: { xs: 'calc(100% - 48px)', md: 'calc(100% - 64px)' },
};

export default Dialog;
