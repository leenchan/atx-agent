import React, { useState, useEffect, useMemo } from 'react';
import { useTheme, lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import TextField from '@mui/material/TextField';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useBreakpoint } from 'src/theme';
import IconButton from '@mui/icons-material/IconButton';
import Typography from '@mui/icons-material/Typography';
import { MenuItem, Box } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  wordspace: {
    marginRight: '5px',
  },
  alignleft: {
    '& .MuiToolbar-gutters': {
      padding: 0,
    },
  },
  fixed: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'white',
    borderTop: `${theme.border.default}`,
    zIndex: 1,
  },
  fixedButton: {
    // border: `${theme.border.default}`,
    borderRadius: `${theme.radius.xs}`,
  },
}));

const pageSizes = [10, 20, 50, 100].map((v) => ({
  value: v,
  label: v
}));

const Pagination = ({
  onChange = () => {},
  offset = 0,
  count = 0,
  total = 0,
  pageSize = 10,
  fixed,
  hideOffset,
  ...props
}) => {
  const [currOffset, setCurrOffset] = useState(offset);
  const page =
    offset > 0 && pageSize > 0 ? Math.floor(offset / pageSize) + 1 : 1;
  const [currPage, setCurrPage] = useState(page);
  const minPage = 1;
  const maxPage = total > 0 ? Math.ceil(total / pageSize) : 0;

  const classes = useStyles();
  const { isMobile, padding } = useBreakpoint();

  const handlePageChange = (p, submitPage = true) => {
    const nextPage = p <= minPage ? minPage : p >= maxPage ? maxPage : p;
    const nextOffset = offset + (nextPage - page) * pageSize;
    setCurrOffset(nextOffset);
    setCurrPage(nextPage);
    // console.log(`minPage = ${minPage}, maxPage = ${maxPage}, page = ${p}, nextPage, nextOffset`)
    if (submitPage) {
      onChange({ offset: nextOffset, pageSize, page: p });
    }
  };

  const handlePageSizeChange = (pageSize) => {
    onChange({ offset: 0, pageSize: parseInt(pageSize), page: 1 });
  }

  const handlePageSubmit = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      console.log('handlePageSubmit', currOffset)
      onChange({ offset: currOffset, pageSize, page: currPage});
    }
  };

  useEffect(() => {
    if (offset !== currOffset) {
      setCurrOffset(offset);
      setCurrPage(page);
    }
  }, [offset]);

  return (
    <Box
      display={total > 0 ? 'flex' : 'none'}
      alignItems="center"
      position="relative"
      flexWrap="wrap"
      py={1}
      px={isMobile ? 1.5 : 2}
      sx={fixed ? { pb: 6 } : {}}
      {...props}
    >
      <Box
        // position="absolute"
        // top="0"
        // left="0"
        py={0.75}
        sx={{ ...(hideOffset && { display: 'none' }) }}
        width={isMobile ? '50%' : '25%'}
        order={1}
      >
        {fixed ? '' : (
          <Typography component="span" color="table.main" mr={0.5}>
            Displaying
          </Typography>
        )}
        <Typography component="span" color="primary.main">
          {offset + 1}-{offset + count > total ? total : offset + count}
        </Typography>
        <Typography component="span" color="table.main">
          {' '}
          of {total * 1 >= 0 ? total : 0}
        </Typography>
      </Box>
      <Box
        flex="1"
        className={fixed && classes.fixed}
        sx={{ ...(fixed && { px: 0, py: padding / 4 }) }}
        order={isMobile ? 3 : 2}
      >
        <Box display="flex" justifyContent="center">
          <IconButton
            size="medium"
            onClick={() => handlePageChange(currPage - 1)}
            color="primary"
            disabled={!(currPage > 1)}
            p={1}
            className={fixed && classes.fixedButton}
          >
            {fixed ? <ArrowBackIcon /> : <KeyboardArrowLeft />}
          </IconButton>
          <Box
            display="flex"
            py={0.5}
            alignItems="baseline"
            justifyContent="center"
            flex={isMobile ? '1' : '0'}
          >
            <TextField
              // value={pagenumber || ''}
              value={currPage}
              size="small"
              variant="outlined"
              type="number"
              color="primary"
              sx={{ mr: 1 }}
              onFocus={(e) => e.target.select()}
              onKeyDown={handlePageSubmit}
              onChange={(e) => handlePageChange(e.target.value, false)}
              inputProps={{
                sx: {
                  py: 0.75,
                  px: 0,
                  width: '3rem',
                  textAlign: 'center',
                },
              }}
            />
            <Typography variant="body1" color="table.main" sx={{ whiteSpace: 'nowrap' }}>
              of {pageSize > 0 && total > 0 ? Math.ceil(total / pageSize) : 0}{' '}
              pages
            </Typography>
          </Box>
          <IconButton
            size="medium"
            onClick={() => handlePageChange(currPage + 1)}
            color="primary"
            disabled={!(total > 0) || currPage >= maxPage}
            p={1}
            className={fixed && classes.fixedButton}
          >
            {fixed ? <ArrowForwardIcon /> : <KeyboardArrowRight />}
          </IconButton>
        </Box>
      </Box>
      <Box
        display="flex"
        py={0.5}
        alignItems="baseline"
        justifyContent="right"
        flex={fixed ? '1' : undefined}
        width={isMobile ? '50%' : '25%'}
        order={isMobile ? 2 : 3}
      >
        {/* <Typography variant="body1" color="table.main" mr={1}>Show</Typography> */}
        <TextField
          size="small"
          variant="outlined"
          type="number"
          color="primary"
          select
          defaultValue={pageSize}
          value={pageSize}
          sx={{ mr: 1 }}
          onChange={(e) => handlePageSizeChange(e.target.value)}
          inputProps={{
            sx: {
              py: 0.75,
              px: 1,
              width: '2rem',
              textAlign: 'center',
            },
          }}
        >
          {pageSizes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body1" color="table.main"> / page</Typography>
      </Box>
    </Box>
  );
};

export default Pagination;
