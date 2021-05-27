import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import produce from 'immer';
import { Line } from 'react-chartjs-2';

import {
  CssBaseline,
  Container,
  FormControl,
  InputLabel,
  Select,
} from '@material-ui/core';
import useStyles from './styles';

// Returns an array of the total championship points at each GP
const parseFinishPoints = (Races) => {
  let points = [];
  for (let i = 0; i < Races.length; i++) {
    const newPoints = parseInt(Races[i].Results[0].points);
    points.push(i === 0 ? newPoints : newPoints + points[i - 1]);
  }
  return points;
};

// Returns an array of all the circuit names that were used
const parseTracks = (Races) => {
  let names = Races.map((race) => race.raceName);
  return names;
};

const fetchDriverData = async (season, driver) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers/${driver}/results.json`
  );
  return res;
};

function App() {
  const classes = useStyles();
  const [driverData, setDriverData] = useState({
    driver: '',
    season: 'current',
    points: [],
    tracks: [],
  });
  const [drivers, setDrivers] = useState([]);

  const fetchDrivers = useCallback(async () => {
    const res = await axios.get(
      `http://ergast.com/api/f1/${driverData.season}/drivers.json`
    );
    return res;
  }, [driverData.season]);

  useEffect(() => {
    fetchDrivers(driverData.season).then((data) =>
      setDrivers(data.data.MRData.DriverTable.Drivers)
    );
  }, [driverData.season, fetchDrivers]);

  const seasonChange = async (e) => {
    const season = e.target.value;
    const res = await fetchDriverData(season, driverData.driver);
    const newData = produce(driverData, (data) => {
      data.season = season;
      data.points = parseFinishPoints(res.data.MRData.RaceTable.Races);
      data.tracks = parseTracks(res.data.MRData.RaceTable.Races);
    });
    setDriverData(newData);
  };

  const driverChange = async (e) => {
    const driver = e.target.value;
    const res = await fetchDriverData(driverData.season, driver);
    const newData = produce(driverData, (data) => {
      data.driver = driver;
      data.points = parseFinishPoints(res.data.MRData.RaceTable.Races);
      data.tracks = parseTracks(res.data.MRData.RaceTable.Races);
    });
    setDriverData(newData);
  };

  // Chart.js setup
  const data = {
    labels: driverData.tracks,
    datasets: [
      {
        label: 'Total championship points',
        data: driverData.points,
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
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
              value={driverData.season}
              onChange={seasonChange}
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
              value={driverData.driver}
              onChange={driverChange}
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
          <Line data={data} />
        </Container>
      </div>
    </>
  );
}

export default App;
