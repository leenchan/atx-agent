import { useState, useEffect, useContext } from 'react';
import { Box, Button, CircularProgress, LinearProgress, IconButton, Typography } from '@mui/material';
import Dialog from '@ui/Dialog';
import Upload from '@ui/Upload';
import Loading from '@ui/Loading';
import { getPackages } from '@api/atx';
import { MessageContext } from '@ui/Message';
import { useTheme } from '@emotion/react';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { LoadingContext } from '@hook/useLoading';
import { alpha } from '@mui/material';
import { installApk, uninstallPkg } from '@api/atx';
import { getPkgInfo } from '@api/atx';
import { getAtxUrl } from '@api/common';
import Modal from './Modal';
import PackageInfo from './PackageInfo';

const Packages = ({
  open,
  ...props
}) => {
  const theme = useTheme();
  const [packages, setPackages] = useState([]);
  const message = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  const [uninstall, setUninstall] = useState();
  const [pkgInfo, setPkgInfo] = useState();

  const onOpenUninstall = (pkg) => {
    setUninstall(pkg);
  };

  const onCloseUninstall = () => {
    setUninstall();
  };

  const onUninstall = async () => {
    loading.add('uninstall');
    try {
      const res = await uninstallPkg(uninstall);
      message.add({
        type: 'success',
        content: `You have succeefully uninstall package: ${uninstall}.`,
      });
      onCloseUninstall();
      fetchPackages();
    } catch (error) {
      message.add({ type: 'error', content: error });
    }
    loading.remove('uninstall');
  };

  const onPkgInfo = async (name) => {
    setPkgInfo({});
    loading.add('info');
    try {
      const { data: { data } } = await getPkgInfo(name);
      // console.log(data);
      setPkgInfo(data);
    } catch (error) {
      console.error(error);
    }
    loading.remove('info');
  };

  const onInstall = async (file, config) => {
    loading.add('install');
    let res;
    try {
      res = await installApk(file, config);
    } catch (error) {
      res = error;
    }
    loading.remove('install');
    return res;
  };

  const onInstalled = (file) => {
    if (file?.[0]) {
      message.add({ type: 'success', content: `Successfully to install ${file.map((f) => f.name).join(',')}.` });
      fetchPackages();
      // console.log(file[0]);
    }
  };

  const fetchPackages = async () => {
    loading.add('packages');
    try {
      const { data } = await getPackages();
      setPackages(data);
    } catch (error) {
      message.add({ type: 'error', content: error });
    }
    loading.remove('packages');
  };

  const init = async () => {
    setPackages([]);
    await fetchPackages();
  };

  useEffect(() => {
    if (open) {
      init();
    }
  }, [open])

  return (
    <>
      <Dialog
        open={!!open}
        title={
          <>
            <Box mr={1} display="flex">
              <ExtensionOutlinedIcon fontSize="large" />
            </Box>
            Packages
          </>
        }
        closeButton="both"
        {...props}
        // footer={
        //   <Box>
        //     <Button variant="outlined">Cancel</Button>
        //   </Box>
        // }
        footer={
          <Box width="100%">
            <Upload
              fileList={[]}
              listType={false}
              // onChange={(file) => handleAddFileProof(job, file)}
              // onRemove={(file) => handleRemoveFileProof(job, file)}
              accept=".apk, .zip"
              // description="JPG,PNG,PDF (max size 5MB)"
              // maxCount={1}
              maxSize={false}
              // width="10rem"
              onChange={onInstalled}
              action={onInstall}
              disabled={loading.has()}
            />
          </Box>
        }
        disableBackdropClick={true}
      >
        <Box minHeight={12}>
          {loading.has() && (
            <Box display="flex" justifyContent="center" alignItems="center" position="absolute" sx={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <Loading />
            </Box>
          )}
          <Box
            sx={{
              '& > * + *': { marginTop: 1 },
              // opacity: loading.has() ? 0.5 : 1,
              ...(loading.has() ? { animation: theme.animation.blink } : {}),
            }}
          >
            {packages.map(({ packageName, versionName, size }, index) => (
              <Box display="flex" border={theme.border.default} borderRadius={theme.radius.button} key={index}>
                <Box p={1} display="flex">
                  <Box
                    component="img"
                    sx={{
                      height: 48,
                      width: 48,
                      maxHeight: { xs: 32, sm: 48 },
                      maxWidth: { xs: 32, sm: 48 },
                    }}
                    borderRadius={theme.radius.button}
                    bgcolor={theme.palette.background.panel}
                    overflow="hidden"
                    alt="The house from the offer."
                    src={getAtxUrl() + `/packages/${packageName}/icon`}
                  />
                </Box>
                <Box p={1} flex="1" display="flex" flexDirection="column">
                  <Box>
                    <Typography sx={{ wordBreak: 'break-all', whiteSpace: 'wrap' }}>
                      {packageName}
                    </Typography>
                  </Box>
                  <Box display="flex" color="text.secondary" mt={0.5}>
                    <Typography sx={{ mr: 1 }} variant="subtitle2" fontSize="0.75rem">
                      {versionName ? `v${versionName}` : '-'}
                    </Typography>
                    <Typography variant="subtitle2" fontSize="0.75rem">
                      {(size / 1024 / 1024).toFixed(0) + 'MB'}
                    </Typography>
                  </Box>
                </Box>
                <Box p={1} display="flex" justifyContent="flex-end" color="text.secondary" alignSelf="center">
                <IconButton
                    onClick={() => onPkgInfo(packageName)}
                  >
                    <InfoOutlinedIcon color="secondary" fontSize="small" />
                  </IconButton>
                  <IconButton
                    title="Remove"
                    onClick={() => onOpenUninstall(packageName)}
                    disabled={loading.has('uninstall')}
                  >
                    
                    <DeleteOutlineOutlinedIcon color="secondary" fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Dialog>
      <Modal
        open={uninstall}
        mode="warning"
        title="Uninstall"
        onOk={onUninstall}
        onClose={onCloseUninstall}
        okText="Uninstall"
        content={`Are you sure to uninstall ${uninstall}?`}
      />
      <Modal
        open={!!pkgInfo}
        mode="info"
        title="Package Details"
        onClose={loading.has('info') ? undefined : (() => setPkgInfo())}
        // okText="Uninstall"
      >
        {loading.has('info') ? (
          <Loading />
        ) : (
          <PackageInfo info={pkgInfo} />
        )}
      </Modal>
    </>

  )
};

export default Packages;