import { lazy, Suspense, useContext } from 'react';
import { Box } from '@mui/material';
import { CssBaseline, Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '@theme';
import RemoteControl from './RemoteControl';
import useSetting, { SettingContext } from '@hook/useSetting';
// const LazyComponent = lazy(() => import('./LazyComponent'));

function Main() {
  const setting = useSetting();

  return (
    <SettingContext.Provider value={setting}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <RemoteControl />
      </ThemeProvider>
    </SettingContext.Provider>
  );
}

export default Main;
