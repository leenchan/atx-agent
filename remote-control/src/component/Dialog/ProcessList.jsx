import { Box, OutlinedInput } from '@mui/material';
import Table from '@ui/Table';
import { useEffect, useState } from 'react';

const createColumns = ({

} = {}) => ([
  {
    title: 'NAME',
    key: 'name',
    render: (row, text, index) => row.name,
    width: '55%',
  },
  {
    title: 'PID',
    key: 'pid',
    render: (row, text, index) => row.pid,
    width: '15%',
  },
  // {
  //   title: 'USER',
  //   key: 'user',
  //   render: (row, text, index) => row.user,
  // },
  {
    title: 'VSIZE',
    key: 'vsize',
    render: (row, text, index) => row.vsize,
    width: '15%',
  },
  {
    title: 'RSS',
    key: 'rss',
    render: (row, text, index) => row.rss,
    width: '15%',
  },
]);

export const ProcessList = ({ data = [], loading }) => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState();
  const columns = createColumns();

  const searchRegex = search && search.trim() !== '' ? new RegExp(search.trim(), 'i') : undefined;

  useEffect(() => {
    setRows(data ?? []);
  }, [data])

  return (
    <>
      <Box mb={2} position="sticky" top="0" zIndex={1}>
        <OutlinedInput
          fullWidth
          size="small"
          placeholder="filter process by name or user"
          value={search ?? ''}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <Table
        loading={loading}
        columns={columns}
        rows={(rows ?? []).filter((row) =>
          searchRegex ? (searchRegex.test(row.name) || searchRegex.test(row.user)) : true
        )}
        mode="full"
        padding="sm"
        tableLayout="fixed"
      />
    </>
  );
};

export default ProcessList;
