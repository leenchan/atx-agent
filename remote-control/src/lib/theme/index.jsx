import { createTheme, useTheme, lighten, darken } from '@mui/material/styles';
import { alpha } from "@mui/material";
import { keyframes } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import { lime, purple, grey, lightGreen } from '@mui/material/colors';

const size = {
  4: '0.25rem',
  8: '0.5rem',
  10: '0.625rem',
  12: '0.75rem',
  14: '0.875rem',
  16: '1rem',
  20: '1.25rem',
  24: '1.5rem',
  28: '1.75rem',
  32: '2rem',
  36: '2.25rem',
  40: '2.5rem',
  44: '2.75rem',
  48: '3rem',
  64: '4rem',
  80: '5rem',
  96: '6rem',
  112: '7rem',
  128: '8rem',
};

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

const blink = keyframes`
  0% { opacity: 0.33; }
  50% { opacity: 0.75; }
  100% { opacity: 0.33; }`;

const theme = createTheme({
  size,
  radius: {
    ...borderRadius,
    default: borderRadius[3],
    button: borderRadius[4],
    box: borderRadius[6],
  },
  shape: {
    borderRadius: 8,
  },
  animation: {
    blink: `${blink} 2s linear infinite`,
  },
  padding,
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const commonTheme = createTheme(theme, {
  typography: {
    ...theme.typography,
    fontWeight: 400,
    // fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    h0: {
      fontSize: size[40],
      fontWeight: 500,
    },
    h1: {
      fontSize: size[32],
      fontWeight: 500,
    },
    h2: {
      fontSize: size[24],
      fontWeight: 500,
    },
    h3: {
      fontSize: size[20],
      fontWeight: 500,
    },
    h4: {
      fontSize: size[16],
      fontWeight: 500,
    },
    h5: {
      fontSize: size[14],
      fontWeight: 500,
    },
    h6: {
      fontSize: size[12],
      fontWeight: 500,
    },
    body1: {
      fontSize: size[14],
      fontWeight: 400,
    },
    body2: {
      fontSize: size[12],
      fontWeight: 400,
    },
    subtitle1: {
      fontSize: size[10],
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: size[8],
      fontWeight: 400,
    },
    caption: {
      fontSize: size[10],
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
    },
  },
});

const palette = {
  primary: lightGreen,
  secondary: { main: '#ccc' },
};

const commonDarkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    ...palette,
  },
});

const createComponentsTheme = (theme) => ({
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        paddingRight: 0,
        background: theme.palette.background.lighter,
        '&.Mui-focused': {
          background: theme.palette.background.default,
        },
      },
    },
  },
});

export const darkTheme = ((theme) => createTheme(theme, {
  components: createComponentsTheme(theme),
}))(createTheme(commonDarkTheme, {
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
}));

// console.log(darkTheme);

export const getBreakpoint = () => {
  const breakpoint = keys.reduce((output, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matches = useMediaQuery(currentTheme.breakpoints.up(key));
    return !output && matches ? key : output;
  }, null) || 'xs';
  return breakpoint;
};

export const useBreakpoint = (mobileBreakpoints) => {
  const mobileIncludes = Array.isArray(mobileBreakpoints) ? mobileBreakpoints : ['xs', 'sm'];
  const currentTheme = useTheme();
  const keys = [...currentTheme.breakpoints.keys].reverse();
  const breakpoint = keys.reduce((output, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matches = useMediaQuery(currentTheme.breakpoints.up(key));
    return !output && matches ? key : output;
  }, null) || 'xs';
  const isMobile = mobileIncludes.includes(breakpoint);

  return {
    breakpoint,
    isMobile,
    padding: isMobile ? 3 : 6,
  };
};
