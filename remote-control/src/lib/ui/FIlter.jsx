import React, { useState, useEffect, useRef } from 'react';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ClearIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import _ from 'lodash';

const CheckboxesTags = ({ name, value, selectedOptions, setSelectedOptions, placeholder, options, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleChange = (e, v) => {
    setSelectedOptions(v);
    // onChange(v?.[0] ? v.map(o => o.value) : []);
  };
  const handleClose = () => {
    // if (!_.isEqual(value, selectedOptions.map(o => o.value))) {
    //   onChange(selectedOptions.map(o => o.value));
    // }
  };
  const handleReset = () => {
    // setSelectedOptions([]);
  };

  useEffect(() => {
    setTimeout(() => {
      setOpen(true);
    }, 200);
  }, []);
  useEffect(() => {
    setSelectedOptions(options?.[0] && value?.[0] ? options.filter(o => value.includes(o.value)) : []);
  }, [value]);

  const selectedValues = selectedOptions.map(o => o.value);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      onClose={handleClose}
      open={open}
      value={options.filter(option => selectedValues.includes(option.value))}
      renderTags={() => {}}
      onChange={handleChange}
      options={options}
      sx={{ width: '17rem' }}
      getOptionLabel={(option) => option.text}
      clearIcon={<ClearIcon fontSize="small" onClick={handleReset} />}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by ..."
          placeholder={placeholder}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <Box {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.text}
        </Box>
      )}
    />
  );
};

const Filter = ({ name, filter={}, value, options, onChange, ...props }) => {
  const filtering = value?.[0] ? true : false;
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(value ?? []);
  const filterRef = useRef();

  const handleClose = () => {
    setOpen(false);
    if (!_.isEqual(value, selectedOptions.map(o => o.value))) {
      onChange(selectedOptions.map(o => o.value));
    }
  };

  return (
    <Box>
      <IconButton
        size="small"
        color={filtering ? 'primary.main' : 'default'}
        onClick={() => setOpen(!open)}
        ref={filterRef}
      >
        {filtering ? (
          <FilterAltIcon fontSize="inherit" />
        ) : (
          <FilterListIcon fontSize="inherit" />
        )}
      </IconButton>
      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={filterRef.current}
        // anchorOrigin={{
        //   vertical: 'bottom',
        //   horizontal: 'left',
        // }}
        elevation={3}
      >
        <Box p={1}>
          <CheckboxesTags value={value} onChange={onChange} options={options} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} name={name} {...props} />
        </Box>
    </Popover>
    </Box>
  );
};

export default Filter;
