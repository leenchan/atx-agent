import { useState, useEffect, useCallback, useContext } from 'react';
import LinearProgress from '@mui/material';
import FormData from 'form-data';
import Dropzone, { useDropzone } from 'react-dropzone';
import { useTheme } from '@emotion/react';
import {
  Box, Typography, Link, Paper,
} from '@mui/material';
// import { uploadFile } from '@/api/common';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { MessageContext } from './Message';
import { alpha } from '@mui/material';
import axios from 'axios';

export const Upload = ({
  sx,
  onChange,
  onRemove,
  fileList = [],
  disabled,
  listType = 'text',
  accept = '',
  description,
  maxCount,
  maxSize = '10M',
  width = '100%',
  error,
  helperText,
  uploadFile,
  action,
  api,
}) => {
  const theme = useTheme();
  const message = useContext(MessageContext);
  // const uploading = useUploading();
  const [uploading, setUploading] = useState([]);
  const isMaxCount = maxCount * 1 > 0 && (uploading.length + fileList.length) >= maxCount * 1;
  const acceptTypes = {};
  `${accept}`.toLowerCase().split(/\s*,\s*/).forEach((t) => {
    if (/^\.[a-z0-9]+$/.test(t)) {
      acceptTypes['image/*'] = [...(acceptTypes['image/*'] ?? []), t];
    } else if (/^.+\/.+$/.test(t)) {
      acceptTypes[t] = [];
    }
  });
  let maxFileSize = maxSize;
  if (/^[1-9][0-9]*(MB|M)$/i.test(maxSize)) {
    maxFileSize = maxSize.replace(/(MB|M)/i, '') * 1024 * 1024;
  } else if (/^[1-9][0-9]*(KB|K)$/i.test(maxSize)) {
    maxFileSize = maxSize.replace(/(KB|K)/i, '') * 1024;
  }
  // console.log(acceptTypes, maxFileSize);

  const onDrop = async (acceptedFiles) => {
    if (isMaxCount) {
      return;
    }
    let uploadingFiles = maxCount * 1 ?
      acceptedFiles.slice((uploading.length + fileList.length - maxCount * 1)) :
      acceptedFiles;
    if (maxFileSize * 1 > 0) {
      uploadingFiles = uploadingFiles.filter((f) => {
        if (f.size > maxFileSize) {
          message.add({ type: 'error', content: `${f.name}: file size is over ${maxSize} (Max Size).` });
          return false;
        }
        return true;
      });
    }
    // Upload file to cloud ...
    const uploadedFiles = [];
    setUploading((prevUploading) => [...prevUploading, ...uploadingFiles]);
    // uploading.push(...uploadingFiles);
    for (let i = 0; i < uploadingFiles.length; i += 1) {
      try {
        let data = {};
        const config = {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploading((prevUploading) => prevUploading.map((f) => {
              if (f === uploadingFiles[i]) {
                f.progress = progress;
              }
              return f;
            }));
            // uploadingFiles[i].progress = progress;
            // console.log(progress);
          },
        };
        if (typeof action === 'function') {
          data = (await action(uploadingFiles[i], config))?.data;
        } else if (typeof action === 'string') {
          const formData = new FormData();
          formData.append('file', uploadingFiles[i]);
          data = (await axios.post(action, formData, config))?.data;
        } else {
          throw new Error(`Failed to upload file: ${uploadingFiles[i].name}`)
        }
        // console.log(data);
        if (data.status !== 'success') {
          throw new Error(data);
        }
        uploadedFiles.push(uploadingFiles[i]);
        if (typeof onChange === 'function') {
          onChange([{
            name: uploadingFiles[i].name,
            size: uploadingFiles[i].size,
            type: uploadingFiles[i].type,
            ...data,
          }]);
        }
      } catch (error) {
        message.add({ type: 'error', content: `${uploadingFiles[i].name}: Failed to upload. (${error.code})` });
        console.error(error);
      }
      setUploading((prevUploading) => [...prevUploading].filter((f) => f !== uploadingFiles[i]));
      // uploading.splice(uploading.indexOf(uploadingFiles[i]), 1);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isMaxCount,
    accept: acceptTypes,
  });
  const { ref, ...rootProps } = getRootProps({ className: 'dropzone disabled' });

  const files = fileList?.filter((file) => !!file) ?? [];

  return (
    <Box sx={{ width }}>
      {(listType === 'text' && files[0]) && (
        <Box
          display="flex"
          flexWrap="wrap"
          sx={{
            m: -0.5,
            mb: 1,
            '> *': { width: '100%', m: 0.5 }
          }}
        >
          {files.map((file, i) => (
            <Box
              key={i}
              display="flex"
              alignItems="center"
              pl={1}
              border={theme.border.default}
              // bgcolor={theme.palette.info.light}
              borderRadius={theme.radius.button}
            >
              <Box fontSize="1rem" display="flex" px={1}>
                {/image/i.test(`${file.type}`) ? (
                  <ImageIcon fontSize="inherit" htmlColor={theme.palette.text.light} />
                ) : (
                  <FileIcon fontSize="inherit" htmlColor={theme.palette.text.light} />
                )}
              </Box>
              <Box flex="1" py={1.25}>
                <Link href={file.url} title={file.url} target="_blank">
                  <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{file.name}</Typography>
                </Link>
                {/* {name, type, size, key, url} */}
              </Box>
              {typeof onRemove === 'function' && (
                <Box p={0.25}>
                  <DeleteButton onClick={() => onRemove(file)} />
                </Box>
              )}
            </Box>
          ))}
          {uploading.map((file, i) => (
            <Box
              key={i}
              p={1.5}
              sx={{
                border: theme.border.default,
                borderRadius: '0.5rem',
              }}
            >
              <LinearProgress
                loading={true}
                loadingText={false}
                value={file.progress}
                variant={file.progress >= 0 ? 'determinate' : undefined}
              />
            </Box>
          ))}
        </Box>
      )}
      {listType === 'picture-card' && (
        <Box></Box>
      )}
      <Box
        ref={ref}
        {...rootProps}
        sx={{
          border: theme.border.default,
          borderRadius: '0.5rem',
          cursor: 'pointer',
          ...((disabled || isMaxCount) ? { opacity: '0.5', cursor: 'not-allowed' } : {}),
          ...(isDragActive ? { backgroundColor: alpha(theme.palette.primary.main, 0.25), borderColor: theme.palette.primary.main } : {}),
          ...sx,
        }}
        p={2}
        // isDragActive={isDragActive}
      >
        <input {...getInputProps()} />
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" color={ isDragActive ? 'primary' : 'text'}>
          <Box>
            <Box width="100%" textAlign="center" display="flex" justifyContent="center" color="text.secondary">
              <CloudUploadOutlinedIcon fontSize="large" color="inherit" />
            </Box>
            <Box display="flex">
              <Typography ml={0.5} variant="body1" color="text.light" sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="primary.main" component="span">Click to upload</Typography> or drag and drop
              </Typography>
            </Box>
          </Box>
          {description && (
            <Typography variant="body2" color="text.light" sx={{ textAlign: 'center', marginTop: '0.25rem' }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      {helperText && (
        <Box mt={1}>
          <Typography color={error ? 'error' : 'body'}>
            {helperText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Upload;
