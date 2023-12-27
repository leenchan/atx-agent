import { createTheme, useTheme, lighten, darken } from '@mui/material/styles';
import { alpha } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { lime, purple, grey, lightGreen } from '@mui/material/colors';

const borderRadius = {
  1: '0.125rem', // 2px
  2: '0.25rem', // 4px
  3: '0.375rem', // 6px
  4: '0.5rem', // 8px
  5: '0.625rem', // 10px
  6: '0.75rem', // 12px
  7: '1rem', // 16px
  8: '1.25rem', // 20px
  9: '1.5rem', // 24px
};

const padding = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  default: '1rem',
};

const commonTheme = {
  radius: {
    ...borderRadius,
    default: borderRadius[3],
    button: borderRadius[4],
    box: borderRadius[6],
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    }
  },
  padding,
};

const palette = {
  primary: lightGreen,
  secondary: { main: '#ffeb3b' },
}

const commonDarkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    ...palette,
  },
});

export const darkTheme = createTheme(commonDarkTheme, {
  palette: {
    background: {
      ...commonDarkTheme.palette.background,
      default: darken(commonDarkTheme.palette.grey[800], 0.4),
      lighter: darken(commonDarkTheme.palette.grey[800], 0.25),
      panel: commonDarkTheme.palette.grey[800],
    },
    border: {
      default: grey[500],
      light: grey[700],
      lighter: alpha(grey[700], 0.5),
      dark: grey[900],
      darker: alpha(grey[900], 0.5),
    },
  },
  border: {
    default: `1px solid ${grey[500]}`,
    light: `1px solid ${grey[700]}`,
    lighter: `1px solid ${alpha(grey[700], 0.5)}`,
    dark: `1px solid ${grey[900]}`,
    darker: `1px solid ${alpha(grey[900], 0.5)}`,
  },
})

export const useBreakpoint = () => {
  const currentTheme = useTheme();
  const keys = [...currentTheme.breakpoints.keys].reverse();
  const width = keys.reduce((output, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matches = useMediaQuery(currentTheme.breakpoints.up(key));
    return !output && matches ? key : output;
  }, null) || 'xs';
  const isMobile = ['xs', 'sm'].includes(width);

  return {
    width,
    breakpoint: width,
    isMobile,
    padding: isMobile ? 3 : 6,
  };
};
