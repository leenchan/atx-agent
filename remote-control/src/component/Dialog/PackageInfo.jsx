import { Box, Divider, Typography } from '@mui/material';
import { getAtxUrl } from '@api/common';
import { useTheme } from '@emotion/react';

const PackageInfo = ({ info = {} } = {}) => {
  const theme = useTheme();
  const pkgInfo = [
    ['Name', info.label],
    ['Package', info.packageName],
    ['Version', info.versionName],
    ['Size', info.size],
    ['MainActivity', info.mainActivity],
  ];

  // console.log(info);

  return (
    <Box display="flex" gap={2}>
      <Box py={1} pr={2}>
        <Box width={{ xs: 48, md: 64 }}>
          <Box
            component="img"
            src={`${getAtxUrl()}/packages/${info.packageName}/icon`}
            borderRadius={theme.radius.box}
            width="100%"
          />
        </Box>
      </Box>
      {/* <Divider orientation="vertical" flexItem /> */}
      <Box flex="1" fontSize="0.825rem">
        {pkgInfo.map((row) => (
          <Box display="flex" py={1}>
            <Box width={128}>{row[0]}</Box>
            <Box flex="1" wordBreak="break-all">{row[1]}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PackageInfo;
