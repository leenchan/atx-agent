import { Box, LinearProgress, CircularProgress, Typography } from "@mui/material";

export const Loading = ({
  width = 128,
  color,
  value,
  valueBuffer,
  variant,
  text,
  ...props
}) => {

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2} {...props}>
      <LinearProgress sx={{ width }} {...{ color, value, valueBuffer, variant }} />
      {text && (
        <Typography color="secondary" sx={{ marginTop: 1 }}>
          {text}
        </Typography>
      )}
    </Box>
  )
};

export default Loading;
