import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import './App.css';

const JAMES_STATIONS = [47, 415, 345];

function App() {
  const [stations, setStations] = useState(null);
  
  useEffect(() => {
    fetch('https://layer.bicyclesharing.net/map/v1/bos/map-inventory').then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json().then(json => ({ json, response }));
      }
    })
    .then(({ json, response }) => {
      json.statusCode = response.status;
      json.receivedAt = Date.now();
      if (!response.ok) {
          return Promise.reject(json);
      }

      const stations = json?.features?.filter((feature) => {
        const station = feature?.properties?.station;
        return !!station && JAMES_STATIONS.includes(parseInt(station.id))
      })?.map(feature => feature.properties.station);
      
      console.log('stations', stations)
      setStations(stations ?? []);
    })
  }, [])


  return (
    <div className="App">
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Location</th>
            <th>Bikes</th>
            <th>Docks</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {stations?.map((station) => {
            const { id, name, bikes_available, docks_available, last_reported } = station ?? {}

            const lastUpdate = new Date(last_reported * 1000).toLocaleDateString("en-US");
            return (
              <tr key={id}>
                <td>{ name }</td>
                <td>{ bikes_available }</td>
                <td>{ docks_available }</td>
                <td>{ lastUpdate }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default App;
