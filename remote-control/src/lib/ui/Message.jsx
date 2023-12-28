import React, { useState, useEffect, createContext } from 'react';
import styled from '@emotion/styled';
import { Alert, AlertTitle, Box, Snackbar } from '@mui/material';

export const MessageContext = createContext();

export const Messages = (
  {
    onClose = () => {},
    messages = [],
    autoHideDuration = 5000,
    ...props
  }
) => {
  const onOver = (msg) => {
    // console.log('in');
    msg.createAt = 0;
  };

  const onLeave = (msg) => {
    // console.log('out');
    msg.createAt = new Date().valueOf();
    handleAutoRemoveMsg(autoHideDuration);
  };

  const handleAutoRemoveMsg = (duration) => {
    if (duration >= 0) {
      setTimeout(() => {
        const currTime = new Date().valueOf();
        messages.forEach((m) => {
          if (m.createAt && currTime - m.createAt >= duration) {
            onClose(m);
          }
        });
      }, duration);
    }
  };

  useEffect(() => {
    const createAt = new Date().valueOf();
    if (messages.length > 0) {
      messages.forEach((m) => {
        if (!m.createAt) {
          m.createAt = createAt;
        }
      });
      handleAutoRemoveMsg(autoHideDuration);
    }
  }, [messages]);

  return (
    <Snackbar
      open={messages?.length > 0}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // {...props}
    >
      <Box>
        {messages.map((msg, index) => {
          const { type, content, title } = msg;
          return (
            <Alert
              severity={type}
              onClose={() => onClose(msg)}
              sx={{
                margin: '1rem',
                '& .MuiAlert-message': {
                  whiteSpace: 'normal', wordBreak: 'break-all',
                }
              }}
              key={index}
              onMouseOver={(e) => onOver(msg, e)}
              onMouseLeave={(e) => onLeave(msg, e)}
            >
              {title &&
                <AlertTitle>{title}</AlertTitle>
              }
              {content}
            </Alert>
          );
        })}
      </Box>
    </Snackbar>
  );
};

export const Message = styled(
  // eslint-disable-next-line prefer-arrow-callback
  React.forwardRef(function Message(
    {
      onClose = () => null, severity, message, messageHeader, ...props
    },
    ref
  ) {
    return (
      <Snackbar
        ref={ref}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        {...props}
      >
        <Alert severity={severity} onClose={onClose} sx={{ '& .MuiAlert-message': { whiteSpace: 'normal', wordBreak: 'break-all' } }}>
          {messageHeader &&
            <AlertTitle>{messageHeader}</AlertTitle>
          }
          {message}
        </Alert>
      </Snackbar>
    );
  })
)``;

Message.defaultProps = {
  severity: 'info',
};

export default Message;
