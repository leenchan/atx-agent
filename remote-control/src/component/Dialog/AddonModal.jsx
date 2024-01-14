import { useState, useEffect, useContext } from 'react';
import { Box, Button, CircularProgress, LinearProgress, IconButton, Typography } from '@mui/material';
import Dialog from '@ui/Dialog';
import Upload from '@ui/Upload';
import Loading from '@ui/Loading';
import { getPackages } from '@api/atx';
import { MessageContext } from '@ui/Message';
import { useTheme } from '@emotion/react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import { LoadingContext } from '@hook/useLoading';
import { alpha } from '@mui/material';
import { installApk, uninstallPkg } from '@api/atx';
import { getPkgInfo } from '@api/atx';
import { getAtxUrl } from '@api/common';
import Modal from './Modal';
import AddonList from './AddonList';

export const AddonModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={!!open}
      title={
        <>
          <Box mr={1} display="flex">
            <ExtensionOutlinedIcon fontSize="large" />
          </Box>
          Addon
        </>
      }
      closeButton="both"
      onClose={onClose}
      disableBackdropClick={true}
    >
      <AddonList />
    </Dialog>
  )
};

export default AddonModal;
