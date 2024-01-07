import { useState, useEffect, useContext, useRef } from 'react';
import { useTheme } from '@emotion/react';
import Dialog from '@ui/Dialog';
import {
  Box, Tabs, Tab, Typography, Button, Divider, OutlinedInput,
  Card, CardHeader, CardContent, CardActions, Paper, Popover,
  Menu, MenuItem, Fade, Chip, IconButton, Link,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import {
  installMinicap, installMinitouch, installBusybox, installAlist,
  getMinicapDisplay, checkMinitouch, getBusyboxVersion, getAlistVersion,
  shell, getProcesses, removeBusybox,
} from '@api/atx';
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

const InstallButton = ({ loading, onClick, text = 'Install', loadingText, ...props }) => {
  const buttonLoadingText = loadingText ?? text;

  return (
    <Button
      size="small"
      startIcon={loading && <CircularProgress color="secondary" size={16} />}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading ? buttonLoadingText : text}
    </Button>
  )
};

const RemoveButton = ({ loading, onClick, text = 'Remove', loadingText }) => {
  const buttonLoadingText = loadingText ?? text;

  return (
    <Button
      size="small"
      color="error"
      startIcon={loading && <CircularProgress color="secondary" size={16} />}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? buttonLoadingText : text}
    </Button>
  )
};

const StatusChip = ({ process }) => {
  // console.log(process);
  return (
    <Chip
      color={process.pid ? 'success' : 'error'}
      label={process.pid ? 'RUNNING' : 'STOPPED'}
      size="small"
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: 'auto' }}
    />
  );
};

const AddonCard = ({
  title, content, loading,
  installed, onInstall, onRemove,
  process, url, version,
}) => {
  const theme = useTheme();
  return (
    <Box
      width={{ xs: '100%', sm: 'calc(50% - 8px)' }}
      // width={{ xs: 'calc(50% - 8px)', sm: '100%' }}
      border={installed ? theme.border.default : theme.border.light}
      borderRadius={theme.radius.button}
      // sx={{ xs: { width: 'calc(50% - 8px)' }, md: { width: '100%' } }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box p={1.5} display="flex" flexDirection="column" width="100%" sx={{ opacity: installed || '0.5' }}>
          <Box display="flex">
            <Box flex="1">
              <Typography variant="h5" component="div" mb={0.5}>
                {title}
                {version && (
                  <Typography component="span" variant="body2" color="secondary" sx={{ ml: 1 }}>{version}</Typography>
                )}
              </Typography>
            </Box>
            <Box>
            </Box>
          </Box>
          <Box flex="1">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '2',
                height: 32,
              }}
            >
              {content}
            </Typography>
          </Box>
        </Box>
        <Divider variant="middle" flexItem />
        <Box display="flex" alignItems="baseline" width="100%">
          <Box flex="1" px={1.5} py={0.5} display="flex" alignItems="center" sx={{ '& > * + *': { ml: 1 } }}>
            {installed && process && (
              <StatusChip process={process} />
            )}
          </Box>
          <Box textAlign="right" px={1.5} py={0.5}>
            {url && (
              <Link href={url} title={url} target="_blank">
                <IconButton size="small" color="secondary">
                  <LinkOutlinedIcon fontSize="small" />
                </IconButton>
              </Link>
            )}
            {installed ? (
              <IconButton loading={loading} onClick={onRemove} size="small" color="secondary" title="Remove">
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton loading={loading} onClick={onInstall} size="small" color="secondary" title="Install">
                <CloudDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const SettingModal = ({
  open,
  ...props
}) => {
  const theme = useTheme();
  const message = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  const { setting, set, reset } = useContext(SettingContext);
  const [userSetting, setUserSetting] = useState({});
  const [data, setData] = useState({});
  const [processes, setProcesses] = useState([]);
  const [inputingHost, setInputingHost] = useState(false);
  const hostRef = useRef();


  const minicapDisplayInfo = data.minicapDisplay &&
    `display@${data.minicapDisplay.id}, ${data.minicapDisplay.width}x${data.minicapDisplay.height}/${data.minicapDisplay.rotation}, fps:60`

  const onSettingChange = (changes) => {
    console.log(changes)
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

  // Install Addon
  const installAddon = async ({ name, install, check = () => {} }) => {
    loading.add(`install-${name}`);
    try {
      const res = await install();
      const installed = await check();
      message.add({ type: 'success', content: `Successfully to install ${name}.` });
      
    } catch (error) {
      console.error()
    }
    loading.remove(`install-${name}`);
  };
  const onInstallMinicap = () => {
    installAddon({ name: 'minicap', install: installMinicap, check: onCheckMinicap });
  };
  const onInstallMinitouch = () => {
    installAddon({ name: 'minitouch', install: installMinitouch, check: onCheckMinicap });
  }
  const onInstallBusybox = async () => {
    installAddon({ name: 'busybox', install: installBusybox, check: onCheckBusybox });
  };
  const onInstallAlist = async () => {
    installAddon({ name: 'alist', install: installAlist, check: onCheckAlist });
  };
  // Remove Addon
  const removeAddon = async ({ name, remove, check }) => {
    loading.add(`remove-${name}`);
    try {
      const res = await remove();
      message.add({ type: 'success', content: `Successfully to remove ${name}.` });
      check();
    } catch (error) {
      console.error()
    }
    loading.remove(`remove-${name}`);
  };
  const onRemoveMinicap = async () => {
    
  };
  const onRemoveBusybox = async () => {
    removeAddon({ name: 'busybox', remove: removeBusybox, check: onCheckBusybox });
  };
  const onRemoveAlist = async () => {
    removeAddon({ name: 'alist', remove: () => shell({ cmd: 'rm -rf alist' }), check: onCheckAlist });
  };
  // Check Addon
  const checkAddon = async (check) => {
    try {
      const res = await check();
      return res;
    } catch (error) {
      console.error(error);
    }
    return false;
  };
  const onCheckMinicap = async () => {
    const minicapDisplay = await checkAddon(getMinicapDisplay);
    if (minicapDisplay) {
      setData(prev => ({ ...prev, minicapDisplay, minicapOk: !!minicapDisplay.width, }));
    }
    return !!minicapDisplay;
  };
  const onCheckMinitouch = async () => {
    const ok = await checkAddon(checkMinitouch);;
    setData(prev => ({ ...prev, minitouchOk: ok, }));
    return ok;
  };
  const onCheckBusybox = async () => {
    const version = await checkAddon(getBusyboxVersion);
    setData(prev => ({
      ...prev,
      busyboxVersion: version,
      busyboxOk: !!version
    }));
    return !!version;
  };
  const onCheckAlist = async () => {
    const data = await checkAddon(getAlistVersion);
    setData(prev => ({
      ...prev,
      alistVersion: data?.version,
      alistOk: !!data?.version
    }));
    console.log(data?.version)
    return !!data?.version;
  };

  const fetchProcesses = async () => {
    try {
      const nextProcesses = await getProcesses();
      setProcesses(nextProcesses);
    } catch (error) {
      
    }
  };

  const init = async () => {
    setData({});
    setProcesses([]);
    await Promise.all([
      onCheckMinicap(),
      onCheckMinitouch(),
      onCheckBusybox(),
      onCheckAlist(),
    ])
    // onCheckMinicap();
    // onCheckMinitouch();
    // onCheckBusybox();
    // onCheckAlist();
    fetchProcesses();
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
              ref={hostRef}
              inputProps={{
                onFocus: (e) => {setInputingHost(true)},
                onBlur: (e) => {setInputingHost(false)},
              }}
            />
            {/* <Popover open={inputingHost} /> */}
            {setting?.hostHistory?.[0] && (
              <Fade in={!!inputingHost}>
                <Paper sx={{ position: 'absolute', width: '100%' }}>
                  <Box py={1}>
                    {setting.hostHistory.map((r, i) => (
                      <MenuItem
                        onClick={(e) => {
                          onSettingChange({ host: r });
                        }}
                        key={i}
                      >
                        {r}
                      </MenuItem>
                    ))}
                  </Box>
                </Paper>
              </Fade>
            )}
          {/* <Popover
            open={true}
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
        <Section title="Addon">
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <AddonCard
              title="minicap"
              // content="Minicap provides a socket interface for streaming realtime screen capture data out of Android devices."
              content={minicapDisplayInfo ?? 'Minicap provides a socket interface for streaming realtime screen capture data out of Android devices.'}
              installed={data?.minicapOk}
              loading={loading.has('install-minicap')}
              onInstall={onInstallMinicap}
              process={processes?.find((p) => p.name === 'minicap') ?? {}}
              url="https://github.com/openstf/minicap"
            />
            <AddonCard
              title="minitouch"
              content="Minitouch provides a socket interface for triggering multitouch events and gestures on Android devices."
              installed={data?.minitouchOk}
              loading={loading.has('install-minitouch')}
              onInstall={onInstallMinitouch}
              process={processes?.find((p) => p.name === 'minitouch') ?? {}}
              url="https://github.com/openstf/minitouch"
            />
            <AddonCard
              title="busybox"
              content="BusyBox combines tiny versions of many common UNIX utilities into a single small executable."
              installed={data?.busyboxOk}
              loading={loading.has('install-busybox', 'remove-busybox')}
              onInstall={onInstallBusybox}
              onRemove={onRemoveBusybox}
              url="https://busybox.net/"
              version={data.busyboxVersion}
            />
            <AddonCard
              title="alist"
              content="A file list program that supports multiple storages, powered by Gin and Solidjs."
              installed={data?.alistOk}
              loading={loading.has('install-alist', 'remove-alist')}
              onInstall={onInstallAlist}
              onRemove={onRemoveAlist}
              process={processes?.find((p) => p.name === 'alist') ?? {}}
              url="https://alist.nn.ci"
              version={data.alistVersion}
            />
          </Box>
        </Section>
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
