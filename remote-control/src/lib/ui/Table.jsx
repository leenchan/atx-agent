import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableFooter,
  TableRow,
  TableSortLabel,
  Collapse,
  Checkbox,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Filter from './Filter';
import { grey } from '@mui/material/colors';
import { useBreakpoint } from '@theme';
import { isEmpty } from '@util';

const convertRemToPixels = (rem) => {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const createStyle = ({
  mode, padding, border, borderColor, borderRadius, tableLayout, tableStyle, loading,
}) => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const paddingSize = padding == 'sm' ? theme.spacing(isMobile ? 0.5 : 1)
    : padding == 'md' ? theme.spacing(isMobile ? 1 : 2)
    : padding == 'lg' ? theme.spacing(isMobile ? 2 : 3)
    : padding ? padding
    : theme.spacing(isMobile ? 1 : 2);
  const xPadding = paddingSize;
  const yPadding = paddingSize;
  const tableBorderRadius = borderRadius === 'default' ? theme.radius : borderRadius;
  const borderStyle = theme.border.light;
  const style = {

  };
  return {
    container: {
      position: 'relative',
      transition: 'all 0.5s linear',
      opacity: 1,
      // '& .MuiTable-root': {
      //   ...(borderRadius ? { borderRadius: tableBorderRadius, overflow: 'hidden' } : {}),
      // },
      ...(loading && {
        '&::after': loading && {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        },
        opacity: 0.5,
      }),
    },
    table: {
      '&': {
        ...(tableBorderRadius && {
          borderRadius: tableBorderRadius,
          overflow: 'hidden',
          border: borderStyle,
        }),
        ...tableStyle,
      },
      '& > table': {
        tableLayout,
      },
      ...(padding && {
        '& th': {
          padding: `${yPadding} ${xPadding}`,
        },
        '& td': {
          padding: `${yPadding} ${xPadding}`,
        }
      }),
      '& > table > thead > tr > th, & > table > tbody > tr > td': {
        border: 'none',
      },
      '& > table > thead > tr > th, & > table > tbody > tr:not(:last-child) > td': {
        borderBottom: (border === 'all' || border === 'horizontal' || border === 'row') ? borderStyle : 'none',
      },
      '& > table > thead > tr > th:not(:last-child), & > table > tbody > tr > td:not(:last-child)': {
        borderRight: (border === 'all' || border === 'vertical' || border === 'col') ? borderStyle : 'none',
      },
      ...((border === 'all' || border === 'horizontal') && {
        '& > table > thead > tr:first-child > th': {
          borderTop: borderStyle,
        },
        '& > table > tbody > tr:last-child > td': {
          borderBottom: borderStyle,
        },
      }),
      ...((border === 'all' || border === 'vertical') && {
        '& > table > thead > tr > th:first-child, & > table > tbody > tr > td:first-child': {
          borderLeft: borderStyle,
        },
        '& > table > thead > tr > th:last-child, & > table > tbody > tr > td:last-child': {
          borderRight: borderStyle,
        },
      }),
      ...(mode === 'full' && {
        '& td:first-child, & th:first-child': {
          paddingLeft: '0',
        },
        '& td:last-child, & th:last-child': {
          paddingRight: '0',
        },
      }),
    },
  };
};

const flatColumns = (originalColumns) => {
  const columnLevels = [];
  const contentColumns = [];
  const appendColumn = (c, index) => {
    if (!columnLevels[index]) {
      columnLevels[index] = [];
    }
    columnLevels[index].push(c);
  };
  const getColumns = (columns, level = -1, parentIndex) => {
    if (Array.isArray(columns)) {
      columns.forEach((c, index) => {
        getColumns(c, level + 1, index);
        if (!c.children) {
          contentColumns.push(c);
        }
      });
    } else {
      if (Array.isArray(columns.children)) {
        columns.children = columns.children.map((c) => ({ ...c, parentIndex }));
        getColumns(columns.children, level, parentIndex);
      }
      appendColumn({ ...columns, level, colSpan: 1 }, level);
    }
  };
  getColumns(originalColumns ?? []);
  const totalLevels = columnLevels.length;
  // Set rowSpan / colSpan
  [...columnLevels].reverse().forEach((currlevelColumns, level) => {
    currlevelColumns.forEach((column, index) => {
      const currLevel = totalLevels - level - 1;
      const currColumn = columnLevels[currLevel][index];
      currColumn.colSpan = currColumn.colSpan > 1 ? currColumn.colSpan - 1 : 1;
      currColumn.rowSpan = currColumn.children ? 1 : totalLevels - currLevel;
      if (column.parentIndex >= 0 && columnLevels[currLevel - 1]) {
        const parentColumn = columnLevels[currLevel - 1][column.parentIndex];
        parentColumn.colSpan += column.colSpan;
      }
    });
  });
  // Set Width
  [...columnLevels].forEach((currlevelColumns, level) => {
    if (level == 0) {
      currlevelColumns.forEach(column => {
        column.width = !column.width ? '0%' 
          : /^[.0-9]+r?em$/.test(`${column.width}`) ? `${column.width}`.replace(/r?em/, '') * 16 + 'px'
          : /^[.0-9]+(px)?$/.test(`${column.width}`) ? `${column.width}`.replace(/px/, '') + 'px'
          : /^[.0-9]+%$/.test(column.width) ? column.width
          : '1%';
      });
    } else {
      currlevelColumns.forEach(column => {
        const parentColumn = columnLevels[currLevel - 1][column.parentIndex];
        column.width = parentColumn.width == '1%' ? '1%' : column.colSpan > 1 ? parentColumn.width * column.colSpan : parentColumn.width;
      });
    }
  });
  return {
    header: columnLevels,
    content: contentColumns,
  };
};

const Row = ({
  row,
  index: rowIndex,
  columns,
  emptyMark = '-',
  rowStyle,
  expandable,
  selectable,
  onRowClick,
  onSelect,
  typography = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const genContent = (column) => {
    const text = isEmpty(row[column.key]) ? emptyMark : row[column.key];
    if (typeof column.render === 'function') {
      const children = column.render(row, text, rowIndex);
      if (children?.props) {
        return children;
      }
      const childrenString = (isEmpty(children) || children === false) ? emptyMark
        : `${children}`;
      return !!typography ? <Typography color={column.color ?? 'table.main'}>{childrenString}</Typography>
        : childrenString;
    }
    return <Typography color={column.color ?? 'table.main'}>{text}</Typography>
  };
  const style = rowStyle ? rowStyle(row, rowIndex) : {};
  if (expandable) {
    style['& > *'] = { borderBottom: 'unset' };
  }
  if (onRowClick) {
    style['&'] = { cursor: 'pointer' };
  }
  const expandedTitle =
    typeof expandable?.title === 'function'
      ? expandable.title(row, row[expandable?.key], rowIndex)
      : expandable?.title;
  const expandedContent =
    typeof expandable?.expandedRowRender === 'function'
      ? expandable.expandedRowRender(row, row[expandable?.key], rowIndex)
      : expandable?.expandedRowRender;

  return (
    <>
      <TableRow
        sx={style}
        onClick={(e) => onRowClick && onRowClick(row, rowIndex, e)}
      >
        {expandable && (
          <TableCell>
            <Box display="flex" alignItems="center" justifyContent='flex-end'>
              {expandedTitle && <Box>{expandedTitle}</Box>}
                <IconButton
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <KeyboardArrowUpIcon sx={{ color: grey[700]}}/> : <KeyboardArrowDownIcon sx={{ color: grey[700]}}/>}
                </IconButton>
            </Box>
          </TableCell>
        )}
        {selectable && (
          <TableCell sx={{ width: '1rem'}} >
            <Checkbox
              checked={row.checked}
              disabled={row.checkDisable ?? false}
              onChange={(event) => {
                onSelect(row, rowIndex, event.target.checked)
              }}
            >
            </Checkbox>
          </TableCell>
        )}
        {columns.map((column, index) => {
          return (
            <TableCell key={index} sx={column?.sx} style={column?.style}>
              {genContent(column)}
            </TableCell>
          );
        })}
      </TableRow>
      {expandable?.expandedRowRender && (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}
            colSpan={columns.length + 1}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              {expandedContent}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const TableContent = ({
  rows,
  columns,
  emptyText = 'No Data',
  loading,
  selectable,
  selectAll,
  footer,
  ...props
}) => {
  return (
    <TableBody
      sx={{
        // borderLeft: defaultBorder,
        // borderRight: defaultBorder
        // '&>tr:last-child>td': { borderBottom: 0 }, position: 'relative' 
      }}
    >
      {loading && (
        <TableRow
          // sx={{ '& td': { padding: 0, borderBottom: 0 }}}
        >
          <TableCell colSpan={selectable? columns.length + 1 : columns.length}>
            <LinearProgress loading sx={{}} />
          </TableCell>
        </TableRow>
      )}
      {!rows?.[0] && emptyText ? (
        <TableRow>
          <TableCell colSpan={selectable? columns.length + 1 : columns.length}>
            <Box p={2} textAlign="center">
              <Typography color="table.main">{emptyText}</Typography>
            </Box>
          </TableCell>
        </TableRow>
      ) : null}
      {rows.map((row, index) => (
        <Row {...props} row={row} columns={columns} index={index} key={index} selectable={selectable} />
      ))}
      {footer && (
        <TableRow>
          <TableCell colSpan={columns.length}>
            {footer}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

const TableHeader = ({ columns, tableState, expandable, selectable, selectAll, onTableStateChange, headerStyle }) => {
  const headerColumns = [...columns];
  if (expandable) {
    headerColumns[0].unshift({
      colSpan: 1,
      width: '4rem',
      rowSpan: headerColumns.length,
    });
  }

  if (selectable) {
    headerColumns[0].unshift({
      colSpan: 1,
      key: 'checkbox',
      title: <Checkbox
              onChange={(event) => {
                selectAll(event.target.checked)
              }}
            >
          </Checkbox>,
    });
  }

  const sortList = [undefined, 'asc', 'desc'];
  const defaultSortOrder = sortList[1];
  const { filter, sort } = tableState;

  const handleFilterChange = (key, value) => {
    onTableStateChange({
      ...tableState,
      filter: {
        ...filter,
        [key]: value,
      },
    });
  };
  const handleSortChange = (sortBy) => {
    const sortOrder =
      sortList.indexOf(sort?.order) >= 0 &&
      sortList.indexOf(sort?.order) < sortList.length - 1
        ? sortList[sortList.indexOf(sort?.order) + 1]
        : sortList[0];

    onTableStateChange({
      ...tableState,
      sort: {
        by: sortOrder ? sortBy : undefined,
        order: sort?.by === sortBy ? sortOrder : defaultSortOrder,
      },
    });
  };

  return (
    <TableHead>
      {columns.map((levelColumns, level) => (
        <TableRow
          key={level}
          // sx={{ bgcolor: '#F9FAFB' }}
        >
          {levelColumns.map(
            (
              {
                key,
                rowSpan,
                colSpan,
                title,
                filters,
                sortOrder,
                width,
                headerStyle,
              },
              index
            ) => (
              <TableCell
                rowSpan={rowSpan}
                colSpan={colSpan}
                key={index}
                sx={{ width }}
                style={headerStyle}
              >
                <Box display="flex" alignItems="center">
                  {key === 'checkbox' && title}
                  {key !== 'checkbox' &&
                  <TableSortLabel
                    active={sort?.by === key && sort?.order}
                    direction={
                      sort?.by === key && sort?.order
                        ? sort.order
                        : defaultSortOrder
                    }
                    onClick={() => handleSortChange(key)}
                    hideSortIcon={!sortOrder}
                    IconComponent={sortOrder ? ArrowDropDownIcon : ''}
                    disabled={typeof title == 'function' ? false : !sortOrder}
                  >
                    <Typography variant="body1" color="table.main">
                      {typeof title == 'function'
                        ? title()
                        : title}
                    </Typography>
                  </TableSortLabel>
                  }
                  {filters?.[0] && (
                    <Filter
                      placeholder={title}
                      options={filters}
                      value={filter?.[key] ?? []}
                      onChange={(value) => handleFilterChange(key, value)}
                    />
                  )}
                </Box>
              </TableCell>
            )
          )}
        </TableRow>
      ))}
    </TableHead>
  );
};

const StyledTable = ({
  rows = [],
  columns,
  onPageChange,
  onTableStateChange = () => {},
  loading,
  pagination = {},
  mode,
  height,
  maxHeight,
  stickyHeader = false,
  padding = 'md',
  borderColor,
  border = 'horizontal',
  sx = {},
  tableState = {},
  selectable,
  selectAll,
  emptyMark,
  borderRadius,
  tableLayout,
  tableStyle,
  ...props
}) => {
  const { header: headerColumns, content: contentColumns } = flatColumns(columns ?? [], { tableLayout });
  const style = createStyle({ mode, padding, border, borderColor, borderRadius, tableLayout, tableStyle, loading });

  return (
    <>
      <TableContainer
        component={Box}
        sx={{ ...style.container, height, maxHeight, ...sx }}
      >
        {loading &&
          <Box sx={{ opacity: '1 !important', position: 'absolute', top: 0, left: 0, width: '100%' }}>
            <LinearProgress />
          </Box>
        }
        <Box sx={{ ...style.table }}>
          <Table aria-label="collapsible table" stickyHeader={stickyHeader}>
            <TableHeader
              columns={headerColumns}
              {...{ tableState, onTableStateChange }}
              {...props}
              selectable={selectable}
              selectAll={selectAll}
            />
            <TableContent
              rows={rows}
              columns={contentColumns}
              emptyMark={emptyMark}
              selectable={selectable}
              {...props}
            />
          </Table>
        </Box>
        {/* {pagination && (
          <Pagination
            onChange={(paginationChanges) =>
              onPageChange({ pagination: paginationChanges })
            }
            {...pagination}
            count={rows.length}
          />
        )} */}
      </TableContainer>
    </>
  );
};

export default StyledTable;
