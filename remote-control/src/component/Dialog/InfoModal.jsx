import Dialog from '@ui/Dialog';
import { Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material';

const InfoModal = ({
  info,
  loading,
  ...props
}) => {
  const deviceInfo = { ...info };
  const productInfo = Object
    .entries(info ?? {})
    .reduce((acc, [key, value]) =>
      /ro\.product/.test(key) ? {...acc, [key]: value} : acc
    , {});

  console.log(Object.entries(info ?? {}).filter(([k, v]) => /core/i.test(k)));
  
  const infoList = [
    ['Product', deviceInfo['ro.product.model']],
    ['Brand', deviceInfo['ro.product.brand']],
    ['CPU', deviceInfo['ro.product.chiptype'] + ' (' + deviceInfo['ro.product.cpu.abi'] + ')'],
    ['GPU', deviceInfo['ro.product.gpu.info']],
    ['Memory', deviceInfo['ro.memory.size']],
    ['Storage Size', deviceInfo['ro.product.flash.info']],
    ['Android SDK API', deviceInfo['ro.build.version.sdk']],
  ];

  // console.log(info);
  // const infoList = [
  //   ['Product', deviceInfo.product && `${deviceInfo.product.model}`],
  //   ['Brand', deviceInfo.brand],
  //   ['CPU', deviceInfo.cpu && `${deviceInfo.cpu.hardware} (${deviceInfo.cpu.cores} Cores)`],
  //   ['Memory', deviceInfo.memory?.around],
  //   ['Android SDK API', deviceInfo.sdk],
  // ];

  return (
    <Dialog
      open={!!info}
      title={
        <>
          <Box mt={-0.35} mr={1} display="flex">
            <InfoOutlinedIcon fontSize="large" />
          </Box>
          Device Info
        </>
      }
      {...props}
    >
      {loading ? (
        <Box p={2}>
          <CircularProgress />
        </Box>
      ) : (
        <Box color="text.secondary">
          {infoList.map(([title, content], index) => (
            <Box display="flex" flexWrap="warp" py={1} key={index}>
              <Box width={{ sx: '100%', md: '33.33%' }}>
                <Typography variant="body2">
                  {title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  {content ?? '-'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

    </Dialog>
  )
};

export default InfoModal;
