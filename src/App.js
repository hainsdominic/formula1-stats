import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

import {
  CssBaseline,
  Container,
  FormControl,
  InputLabel,
  Select,
} from '@material-ui/core';
import useStyles from './styles';

// Fetches the drivers data from the API
const fetchDriverData = async (season, driver) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers/${driver}/results.json`
  );
  return res;
};

// Fetches all the drivers that participated to the season
const fetchDrivers = async (season) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers.json`
  );
  return res;
};

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
const parseCircuitName = (Races) => {
  let names = Races.map((race) => race.raceName);
  return names;
};

function App() {
  const classes = useStyles();
  const [points, setPoints] = useState([]);
  const [circuitNames, setCircuitNames] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [params, setParams] = useState({
    driver: '',
    season: 'current',
  });

  // On each mount and when the params changes, fetches the data and parses it
  useEffect(() => {
    const { season, driver } = params;
    if (driver) {
      fetchDriverData(season, driver).then((data) => {
        setPoints(parseFinishPoints(data.data.MRData.RaceTable.Races));
        setCircuitNames(parseCircuitName(data.data.MRData.RaceTable.Races));
      });
    }

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

  // Chart.js setup
  const data = {
    labels: circuitNames,
    datasets: [
      {
        label: 'Total championship points',
        data: points,
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
          <Line data={data} />
        </Container>
      </div>
    </>
  );
}

export default App;
