import { useTheme } from '@emotion/react';
import { Box, Typography } from '@mui/material';

export const ProgressBar = ({
  value = 0,
  text,
  type,
}) => {
  const theme = useTheme();
  const color = ['info', 'success', 'error', 'warning'].includes(type) ? type : 'secondary';
  const backgroundColor = theme.palette[color].dark;
  const forgroundColor = theme.palette[color].main;
  const percent = /%$/.test(value) ? value : (value * 1 >= 0 ? value : 0) + '%'
  // console.log(theme);

  return (
    <Box
      position="relative"
      textAlign="center"
      sx={{
        background: backgroundColor,
        ':before': {
          content: '""',
          position: 'absolute',
          display: 'inline-block',
          top: 0,
          left: 0,
          bottom: 0,
          // width: `${details.memory?.MemUsed / details.memory?.MemTotal * 100}%`,
          width: percent,
          background: forgroundColor,
        }
      }}
      width={200}
      maxWidth="100%"
      borderRadius={theme.radius.default}
      overflow="hidden"
    >
      <Typography fontSize="0.75rem" sx={{ zIndex: 1, position: 'relative' }} color={theme.palette.background.default}>
        {text ?? ' '}
        {/* {`${details.memory?.MemUsed} MB / ${details.memory?.MemTotal} MB`} */}
      </Typography>
    </Box>
  );
};

export default ProgressBar;
