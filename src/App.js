import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

const fetchDriverData = async (season, driver) => {
  const res = await axios.get(
    `http://ergast.com/api/f1/${season}/drivers/${driver}/results.json`
  );
  return JSON.stringify(res);
};

function App() {
  const [data, setData] = useState('');
  const [driver, setDriver] = useState('vettel');
  const [season, setSeason] = useState('current');

  useEffect(() => {
    fetchDriverData(season, driver).then((data) => setData(data));
  }, [season, driver]);

  return (
    <div className='app'>
      <pre>{data}</pre>
    </div>
  );
}

export default App;
