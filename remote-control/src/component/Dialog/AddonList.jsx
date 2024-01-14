import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Divider, IconButton, Link, Chip, CircularProgress } from '@mui/material';
import { useTheme } from '@emotion/react';
import { isEmpty } from '@util';
import { LoadingContext } from '@hook/useLoading';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getProcesses, getServices, installAddon, uninstallAddon, runAddon, startAddon, stopAddon } from '@api/atx';

export const StatusChip = ({ process }) => {
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

export const ServiceChip = ({ running }) => (
  <Chip
    color={running ? 'success' : 'error'}
    label={running ? 'RUNNING' : 'STOPPED'}
    size="small"
    variant="outlined"
    sx={{ fontSize: '0.75rem', height: 'auto' }}
  />
);

const AddonCard = ({
  name, title, description, url, binary, check = () => {},
  loading, data={}, setData, processes=[], fetchProcesses, services=[], fetchServices,
}) => {
  const theme = useTheme();
  const installed = data?.[name]?.installed;
  const version = data?.[name]?.version;
  const process = processes?.find((p) => p.name === binary);
  const service = services.find((s) => s.name === name);
  const running = !!service?.running;
  // console.log(theme);

  const onInstall = async () => {
    loading.add(`install-${name}`);
    try {
      await installAddon({ name });
      await onCheck();
    } catch (error) {
      
    }
    loading.remove(`install-${name}`);
  };
  const onUninstall = async () => {
    loading.add(`uninstall-${name}`);
    try {
      await uninstallAddon({ name });
      await onCheck();
    } catch (error) {
      
    }
    loading.remove(`uninstall-${name}`);
  };
  const onCheck = async () => {
    loading.add(`check-${name}`);
    try {
      const result = await check();
      setData((prev) => ({
        ...prev,
        [name]: result,
      }));
    } catch (error) {
      setData((prev) => ({
        ...prev,
        [name]: {},
      }));
    }
    loading.remove(`check-${name}`);
  };
  const onStart = async () => {
    loading.add(`start-${name}`);
    try {
      const result = await startAddon({ name });
      await fetchServices();
    } catch (error) {
    }
    loading.remove(`start-${name}`);
  };
  const onStop = async () => {
    loading.add(`stop-${name}`);
    try {
      const result = await stopAddon({ name });
      await fetchServices();
    } catch (error) {
      console.log(error)
    }
    loading.remove(`stop-${name}`);
  };

  useEffect(() => {
    onCheck();
  }, []);

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
              <Link href={url} title={url} target="_blank" underline="none">
                <Typography variant="h5" color="text.primary" component="div" mb={0.5}>
                  {title}
                  {version && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{`${version}`}</Typography>
                  )}
                </Typography>
              </Link>
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
              {data?.[name]?.description ?? description}
            </Typography>
          </Box>
        </Box>
        <Divider variant="middle" flexItem />
        <Box display="flex" alignItems="center" width="100%">
          <Box flex="1" px={1.5} py={0.5} display="flex" alignItems="center" sx={{ '& > * + *': { ml: 1 } }}>
            {installed && service && (
              <ServiceChip running={running} />
            )}
          </Box>
          <Box px={1.5} py={0.5} display="flex" justifyContent="flex-end" alignItems="center">
            {installed && (
              <>
                {loading.has(`uninstall-${name}`) ? (
                  <Box component="span" display="flex" p={0.75}>
                    <CircularProgress color="secondary" size={16} />
                  </Box>
                ) : (
                  <IconButton loading={loading.has(`uninstall-${name}`)} onClick={onUninstall} size="small" color="secondary" title="Remove">
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
            {!installed && (
              <>
                {loading.has(`install-${name}`) ? (
                  <Box component="span" display="flex" p={0.75}>
                    <CircularProgress color="secondary" size={16} />
                  </Box>
                ) : (
                  <IconButton loading={loading} onClick={onInstall} size="small" color="secondary" title="Install">
                    <CloudDownloadOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
            {/* {url && (
              <Link href={url} title={url} target="_blank">
                <IconButton size="small" color="secondary">
                  <LinkOutlinedIcon fontSize="small" />
                </IconButton>
              </Link>
            )} */}
            {installed && service && (
              running ? (
                <IconButton loading={loading.has(`stop-${name}`)} onClick={onStop} size="small" color="secondary" title="Stop">
                  <StopIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton loading={loading.has(`start-${name}`)} onClick={onStart} size="small" color="secondary" title="Start">
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              )
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const AddonList = () => {
  const loading = useContext(LoadingContext);
  const [data, setData] = useState({});
  const [processes, setProcesses] = useState([]);
  const [services, setServices] = useState([]);

  const addons = [
    {
      name: 'minicap',
      title: 'minicap',
      description: 'Minicap provides a socket interface for streaming realtime screen capture data out of Android devices.',
      url: 'https://github.com/openstf/minicap',
      binary: 'minicap',
      service: true,
      check: async () => {
        const res = await runAddon({ name: 'minicap', args: ['-i'] });
        return {
          description: `display@${res.data?.id}, ${res.data?.width}x${res.data?.height}/${res.data?.rotation}, fps:60`,
          installed: true,
        };
      },
    },
    {
      name: 'minitouch',
      title: 'minitouch',
      description: 'Minitouch provides a socket interface for triggering multitouch events and gestures on Android devices.',
      url: 'https://github.com/openstf/minitouch',
      process: 'minitouch',
      service: true,
      check: async  () => {
        const res = await runAddon({ name: 'minitouch', args: ['-h', '2>&1'] });
        return { installed: true };
      },
    },
    {
      name: 'filebrowser',
      title: 'File Browser',
      description: 'filebrowser provides a file managing interface within a specified directory and it can be used to upload, delete, preview, rename and edit your files.',
      url: 'https://filebrowser.org',
      process: 'filebrowser',
      check: async  () => {
        const res = await runAddon({ name: 'filebrowser', args: ['version'] });
        return {
          version: res.data?.match(/v[.0-9]+/)?.[0],
          installed: true,
        };
      },
    },
    {
      name: 'alist',
      title: 'Alist',
      description: 'A file list program that supports multiple storage, powered by Gin and Solidjs.',
      url: 'https://alist.nn.ci',
      process: 'alist',
      check: async  () => {
        const res = await runAddon({ name: 'alist', args: ['version'] });
        return {
          version: res.data?.match(/version:\s*v[.0-9]+/i)?.[0]?.split(/:\s*/)[1],
          installed: true,
        };
      },
    },
    {
      name: 'busybox',
      title: 'Busybox',
      description: 'BusyBox combines tiny versions of many common UNIX utilities into a single small executable.',
      url: 'https://busybox.net',
      process: 'busybox',
      check: async  () => {
        const res = await runAddon({ name: 'busybox', args: ['2>&1'] });
        return {
          version: res.data?.match(/v[.0-9]+/)?.[0],
          installed: true,
        };
      },
    },
    {
      name: 'curl',
      title: 'Curl',
      description: 'command line tool and library for transferring data with URLs (since 1998)',
      url: 'https://curl.se',
      process: 'busybox',
      check: async  () => {
        const res = await runAddon({ name: 'curl', args: ['--version'] });
        const version = res.data?.match(/curl [.0-9]+/)?.[0].split(/\s+/)?.[1];
        return {
          version: version ? `v${version}` : null,
          installed: true,
        };
      },
    },
  ];

  const fetchProcesses = async () => {
    try {
      const nextProcesses = await getProcesses();
      setProcesses(nextProcesses);
    } catch (error) {
    }
  };

  const fetchServices = async () => {
    try {
      const nextServices = await getServices();
      setServices(nextServices);
    } catch (error) {
    }
  };

  useEffect(() => {
    // console.log('Addon mounted.');
    fetchProcesses();
    fetchServices();
    return () => {
      setProcesses([]);
      setServices([]);
    };
  }, []);
  
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
      {addons.map((addon) => {
        return (
          <AddonCard
            {...addon}
            {...{loading, data, setData, processes, fetchProcesses, services, fetchServices}}
          />
        );
      })}
    </Box>
  )
};

export default AddonList;
