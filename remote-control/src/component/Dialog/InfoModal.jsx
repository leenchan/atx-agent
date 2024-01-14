import { useContext, useState } from 'react';
import { useTheme } from '@emotion/react';
import Dialog from '@ui/Dialog';
import { Box, LinearProgress, Typography, Tabs, Tab } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Loading from '@ui/Loading';
import { useEffect } from 'react';
import { getMemUsage, getDiskUsage, getUptime, getInfo, getProcesses, getServices } from '@api/atx';
import ProgressBar from '@ui/ProgressBar';
import { LoadingContext } from '@hook/useLoading';
import ProcessList from './ProcessList';
import ServiceList from './ServiceList';

const InfoModal = ({
  open,
  ...props
}) => {
  const theme = useTheme();
  // const deviceInfo = { ...info };
  const [details, setDetails] = useState({});
  const deviceInfo = details?.info ?? {};
  const loading = useContext(LoadingContext);
  const [tab, setTab] = useState('info');
  const [processes, setProcesses] = useState([]);
  const [services, setServices] = useState([]);
  // console.log(Object.entries(info ?? {}).filter(([k, v]) => /memory/i.test(k)));
  // const infoList = [
  //   ['Product', deviceInfo['ro.product.model']],
  //   ['Brand', deviceInfo['ro.product.brand']],
  //   ['CPU', deviceInfo['ro.product.chiptype'] + ' (' + deviceInfo['ro.product.cpu.abi'] + ')'],
  //   ['GPU', deviceInfo['ro.product.gpu.info']],
  //   ['Memory', deviceInfo['ro.memory.size']],
  //   ['Storage Size', deviceInfo['ro.product.flash.info']],
  //   ['Android SDK API', deviceInfo['ro.build.version.sdk']],
  // ];

  // console.log(deviceInfo);
  const infoList = [
    ['Product', deviceInfo.product && `${deviceInfo.product.model}`],
    ['Brand', deviceInfo.brand],
    ['CPU', deviceInfo.cpu && `${deviceInfo.cpu.hardware} (${deviceInfo.cpu.cores} Cores)`],
    ['Arch', deviceInfo.arch],
    ['Memory', deviceInfo.memory?.around],
    ['/data', null],
    ['Android Version', deviceInfo.version],
    ['Android SDK API', deviceInfo.sdk],
    ['Uptime', details.upTime],
  ];

  const fetchInfo = async () => {
    loading.add('info');
    try {
      const { data: info } = await getInfo();
      const memory = await getMemUsage();
      Object.entries(memory).forEach(([name, value]) => memory[name] = (value.replace(/\sKB/i, '') / 1024).toFixed(0));
      memory.MemUsed = memory.MemTotal - memory.MemFree;
      memory.MemUsedPercent = memory.MemUsed / memory.MemTotal * 100;
      memory.MemUsedColor = memory.MemUsedPercent > 75 ? 'warning' : memory.MemUsedPercent > 90 ? 'error' : 'success';
      const disk = await getDiskUsage();
      const upTime = await getUptime();
      setDetails({ memory, disk, upTime, info });
    } catch (error) {
      console.error(error);
    }
    loading.remove('info');
  };
  const fetchProcess = async () => {
    loading.add('process');
    try {
      const nextProcesses = await getProcesses();
      setProcesses(nextProcesses);
    } catch (error) {
      
    }
    loading.remove('process');
  };
  const fetchService = async () => {
    loading.add('service');
    try {
      const nextServices = await getServices();
      setServices(nextServices);
      // setProcesses(nextProcesses);
    } catch (error) {
      
    }
    loading.remove('service');
  };

  const onTabChange = (e, v) => {
    setTab(v);
    switch (v) {
      case 'info':
        fetchInfo();
        break;
      case 'process':
        fetchProcess();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (open) {
      setTab('info');
      fetchInfo();
    } else {
      setDetails({});
    }
  }, [open]);

  return (
    <Dialog
      open={!!open}
      title={
        <>
          <Box mr={1} display="flex">
            <InfoOutlinedIcon fontSize="large" />
          </Box>
          Device Info
          <Box width="100%">
            <Tabs value={tab ?? ''} onChange={onTabChange} sx={{ borderBottom: theme.border.light }}>
              <Tab label="Device" value="info" />
              <Tab label="Process" value="process" />
              {/* <Tab label="Service" value="service" /> */}
            </Tabs>
          </Box>
        </>
      }
      closeButton="both"
      {...props}
    >
      {loading.has('info', 'process', 'service') ? (
        <Box p={4}>
          <Loading />
        </Box>
      ) : (
        <Box>
          {tab === 'info' && (
            <Box color="text.secondary">
                {infoList.map(([title, content], index) => (
                  <Box display="flex" flexWrap="wrap" py={1} key={index}>
                    <Box width={{ xs: '100%', md: '33.33%' }} mb={{ xs: 1, md: 0 }}>
                      <Typography variant="body1" color="secondary">
                        {title}
                      </Typography>
                    </Box>
                    <Box flex="1">
                      {title === 'Memory' && (
                        <ProgressBar
                          type={details.memory?.MemUsedColor}
                          value={details.memory?.MemUsedPercent}
                          text={`${details.memory?.MemUsed} MB / ${details.memory?.MemTotal} MB`}
                        />
                      )}
                      {title === '/data' && (
                        <ProgressBar
                          type="info"
                          value={details.disk?.['/data']?.percent}
                          text={`${details.disk?.['/data']?.used ?? '-'} / ${details.disk?.['/data']?.total ?? '-'}`}
                        />
                      )}
                      {['Memory', '/data'].includes(title) ? '' : (
                        <Typography variant="body1">
                          {content ?? '-'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
          )}
          {tab === 'process' && (
            <ProcessList
              data={processes}
              loading={loading.has('process')}
            />
          )}
          {/* {tab === 'service' && (
            <ServiceList
              data={services}
            />
          )} */}
        </Box>
      )}
    </Dialog>
  )
};

export default InfoModal;
