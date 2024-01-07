import { Box, OutlinedInput, Button } from '@mui/material';
import Table from '@ui/Table';
import { useEffect, useState } from 'react';
import { getServiceDetail } from '@api/atx';

const createColumns = ({

} = {}) => ([
  {
    title: 'NAME',
    key: 'name',
    render: (row, text, index) => row.name,
  },
  {
    title: ' ',
    key: 'action',
    render: (row, text, index) => (
      <Box textAlign="right">
        <Button onClick={() => getServiceDetail(row.name)}>view</Button>
      </Box>
    ),
  },
]);

export const ServiceList = ({ data = [], loading }) => {
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
        columns={columns}
        rows={rows.filter((row) =>
          searchRegex ? (searchRegex.test(row.name) || searchRegex.test(row.user)) : true
        )}
        mode="full"
        padding="sm"
      />
    </>
  );
};

export default ServiceList;
