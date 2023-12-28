import { useState, useEffect, useContext } from 'react';
import { Box, Button, CircularProgress, LinearProgress, IconButton, Typography } from '@mui/material';
import Dialog from '@ui/Dialog';
import Upload from '@ui/Upload';
import { getPackages } from '@api/atx';
import { MessageContext } from '@ui/Message';
import { useTheme } from '@emotion/react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { LoadingContext } from '@hook/useLoading';
import { alpha } from '@mui/material';

const InstallApkModal = ({
  open,
  ...props
}) => {
  const theme = useTheme();
  const [packages, setPackages] = useState([]);
  const message = useContext(MessageContext);
  const loading = useContext(LoadingContext);
  const [deleting, setDeleting] = useState();

  const onOpenDelete = (pkg) => {
    setDeleting(pkg);
  };

  const onCloseDelete = () => {
    setDeleting();
  };

  const onConfirmDelete = () => {
    onCloseDelete();
    message.add({
      type: 'success',
      content: `You have succeefully uninstall package: ${deleting.packageName}.`,
    });
    fetchPackages();
  };

  const onFileUpload = (file) => {
    if (file?.[0]) {
      console.log(file[0]);
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
        title="Package"
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
              disabled={loading.has('install-apk')}
              onChange={onFileUpload}
            />
          </Box>
        }
        disableBackdropClick={true}
      >
        <Box minHeight={64}>
          {loading.has('packages') && (
            <Box display="flex" justifyContent="center" alignItems="center" position="absolute" sx={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <LinearProgress sx={{ width: 128 }} />
            </Box>
          )}
          <Box sx={{ '& > * + *': { marginTop: 1 }, opacity: loading.has('packages') ? 0.5 : 1 }}>
            {packages.map(({ packageName, versionName, size }) => (
              <Box display="flex" border={theme.border.default} borderRadius={theme.radius.button}>
                <Box py={1} px={2} flex="1" display="flex" flexDirection="column">
                  <Box>
                    <Typography sx={{ wordBreak: 'break-all', whiteSpace: 'wrap' }}>
                      {packageName}
                    </Typography>
                  </Box>
                  <Box display="flex" color="text.secondary">
                    <Typography sx={{ mr: 2 }} variant="subtitle2">
                      {versionName}
                    </Typography>
                    <Typography variant="subtitle2">
                      {size}
                    </Typography>
                  </Box>
                </Box>
                <Box p={1} display="flex" justifyContent="flex-end" color="text.secondary">
                  <IconButton
                    color="inherit"
                    onClick={() => onOpenDelete({ packageName })}
                    disabled={loading.has()}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Dialog>
      <Dialog
        open={!!deleting}
        title="Uninstall Package"
        onClose={onCloseDelete}
        footer={
          <Box display="flex" gap={2}>
            <Button color="secondary" onClick={onCloseDelete}>
              Cancel
            </Button>
            <Button color="error" onClick={onConfirmDelete}>
              Uninstall
            </Button>
          </Box>
        }
      >
        <Box py={1}>
          <Typography>
            Are you sure to uninstall {deleting?.packageName}?
          </Typography>
        </Box>
      </Dialog>
    </>

  )
};

export default InstallApkModal;
