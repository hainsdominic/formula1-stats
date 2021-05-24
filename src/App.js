import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  CssBaseline,
  Container,
  FormControl,
  InputLabel,
  Select,
} from '@material-ui/core';
import useStyles from './styles';

const fetchDriverData = async (season, driver) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers/${driver}/results.json`
  );
  return JSON.stringify(res);
};

const fetchDrivers = async (season) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers.json`
  );
  return res;
};

function App() {
  const classes = useStyles();
  const [driverData, setDriverData] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [params, setParams] = useState({ driver: '', season: 'current' });

  useEffect(() => {
    const { season, driver } = params;
    // fetchDriverData(season, driver).then((data) => setDriverData(data));
    fetchDrivers(season).then((data) =>
      setDrivers(data.data.MRData.DriverTable.Drivers)
    );
  }, [params]);

  const handleChange = (event) => {
    const name = event.target.name;
    setParams({
      ...params,
      [name]: event.target.value,
    });
  };

  return (
    <>
      <CssBaseline />
      <div className={classes.container}>
        <Container maxWidth='md'>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='Season'>Season</InputLabel>
            <Select
              native
              value={params.season}
              onChange={handleChange}
              inputProps={{
                name: 'season',
                id: 'season',
              }}
            >
              <option value={'current'}>Current</option>
              {[...Array(71)].map((e, i) => (
                <option key={i} value={new Date().getFullYear() - i - 1}>
                  {new Date().getFullYear() - i - 1}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='driver'>Driver</InputLabel>
            <Select
              native
              value={params.driver}
              onChange={handleChange}
              inputProps={{
                name: 'driver',
                id: 'driver',
              }}
            >
              <option aria-label='None' value='' />
              {drivers.map(({ driverId, familyName, givenName }) => {
                return (
                  <option key={driverId} value={driverId}>
                    {`${givenName} ${familyName}`}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </Container>
      </div>
    </>
  );
}

export default App;
