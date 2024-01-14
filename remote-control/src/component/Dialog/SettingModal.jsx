import { useState, useEffect, useContext, useRef } from 'react';
import { useTheme } from '@emotion/react';
import Dialog from '@ui/Dialog';
import {
  Box, Tabs, Tab, Typography, Button, Divider, OutlinedInput,
  Card, CardHeader, CardContent, CardActions, Paper, Popover,
  Menu, MenuItem, Fade, Chip, IconButton, Link, Popper, Collapse,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { MessageContext } from '@ui/Message';
import { LoadingContext } from '@hook/useLoading';
import { SettingContext } from '@hook/useSetting';
import { CircularProgress } from '@mui/material';

const Section = ({ title, children }) => {
  return (
    <Box>
      {title && (
        <Box mb={2}>
          <Typography variant="h3" color="text.secondary" sx={{ textTransform: 'upper' }}>{title}</Typography>
        </Box>
      )}
      <Box sx={{ '& > * + *': { mt: 2 } }}>
        {children}
      </Box>
    </Box>
  );
};

const OptionItem = ({ title, startAdornment, endAdornment, children }) => {
  return (
    <Box position="relative">
      {title && (
        <Box>
          {typeof title === 'string' ? (
            <Typography variant="h5" color="secondary.light" sx={{ opacity: 0.5, fontWeight: 700 }}>{title}</Typography>
          ) : title}
        </Box>
      )}
      <Box display="flex" justifyContent="flex-start" alignItems="center">
        {startAdornment && (
          <Box>{startAdornment}</Box>
        )}
        {children && (
          <Box flex="1" color="secondary.main">{children}</Box>
        )}
        {endAdornment && (
          <Box>{endAdornment}</Box>
        )}
      </Box>
    </Box>
  );
};

const initData = {
  addon: {},
};

const SettingModal = ({
  open,
  ...props
}) => {
  const theme = useTheme();
  const message = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  const { setting, set, reset } = useContext(SettingContext);
  const [userSetting, setUserSetting] = useState({});
  const [data, setData] = useState(initData);
  const [inputingHost, setInputingHost] = useState(false);
  const hostRef = useRef();

  const onSettingChange = (changes) => {
    // console.log(changes);
    setUserSetting(prev => ({ ...prev, ...changes }));
  };

  const onSettingApply = (name, value) => {
    if (name) {
      const nextSetting = { ...setting, [name]: userSetting[name] };
      switch (name) {
        case 'host':
          if (nextSetting.host.trim !== '') {
            const hostHistory = (nextSetting.hostHistory ?? []).filter((h) => h !== nextSetting.host).slice(0, 9);
            nextSetting.hostHistory = [ nextSetting.host, ...hostHistory];
          }
          break;
        default:
          break;
      }
      set(nextSetting);
    } else {
      set({ ...userSetting });
    }
  };

  const init = async () => {
    setData({});
  };

  useEffect(() => {
    setUserSetting({ ...setting });
  }, [setting]);

  useEffect(() => {
    if (open) {
      init();
    }
  }, [open]);

  return (
    <Dialog
      open={!!open}
      title={
        <>
          <Box mt={-0.35} mr={1} display="flex">
            <SettingsOutlinedIcon fontSize="large" />
          </Box>
          Settings
        </>
      }
      {...props}
    >
      <Box sx={{ '& > * + *': { mt: 6 } }}>
        <Section title="General">
          <OptionItem>
            {inputingHost && (
              <Box position="fixed" width="100%" height="100%" top="0" left="0" zIndex={0} onClick={() => setInputingHost(false)} />
            )}
            <Box zIndex={1}>
              <OutlinedInput
                value={userSetting?.host ?? ''}
                onChange={(e) => onSettingChange({ host: e.target.value })}
                fullWidth
                size="small"
                placeholder="Host eg. 127.0.0.1:7912"
                startAdornment={
                  <Box pr={1}>
                    <Box pl={2} pr={1} borderRight={theme.border.light} fontWeight={700}>
                      HOST
                    </Box>
                  </Box>
                }
                endAdornment={
                  <Button size="small" onClick={() => onSettingApply('host')}>Apply</Button>
                }
                sx={{ paddingLeft: 0, paddingRight: 0, fontSize: '0.825rem' }}
                ref={(ref) => hostRef.current = ref}
                inputProps={{
                  onFocus: (e) => {setInputingHost(true)},
                  // onBlur: (e) => {setInputingHost(false)},
                }}
              />
            </Box>
            {/* <Popover open={inputingHost} /> */}
            {setting?.hostHistory?.[0] && (
              <Collapse in={!!inputingHost}>
                <Box zIndex={1}>
                  <Box
                    py={1}
                    bgcolor={theme.palette.background.default}
                    borderRadius={theme.radius.button}
                    sx={{ boxShadow: theme.shadows[6] }}
                  >
                    {setting.hostHistory.map((r, i) => (
                      <MenuItem
                        onClick={(e) => {
                          onSettingChange({ host: r });
                          setInputingHost(false);
                        }}
                        key={i}
                      >
                        {r}
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            )}
          {/* <Popover
            open={!!inputingHost}
            anchorEl={hostRef.current}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box width="100%">111</Box>
          </Popover> */}
          </OptionItem>
        </Section>
        {/* <Divider /> */}
        {/* <Section title="Addon">
          <AddonList
            {...{ data, setData }}
          />
        </Section> */}
        {/* <Divider /> */}
        <Section title="Other">

        </Section>
      </Box>
      {/* <Tabs>
        <Tab value="one" label="Item One" />
        <Tab value="two" label="Item Two" />
        <Tab value="three" label="Item Three" />
      </Tabs> */}
    </Dialog>
  )
};

export default SettingModal;
