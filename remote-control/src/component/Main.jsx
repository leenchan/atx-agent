import { lazy, Suspense } from 'react';
import { Box } from '@mui/material';
import { CssBaseline, Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '@theme';
import RemoteControl from './RemoteControl';
// const LazyComponent = lazy(() => import('./LazyComponent'));

function Main() {

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RemoteControl />
    </ThemeProvider>
  );
}

export default Main;
