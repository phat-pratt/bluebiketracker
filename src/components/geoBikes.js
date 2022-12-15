import React, { useEffect, useState, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

const GeoBikes = (props) => {
    const { stationData } = props;
    const [sortedStations, setSortedStations] = useState(null);
    const [numStations, setNumStations] = useState(5);
    const [geolocation, setGeolocation] = useState(null);

    useEffect(() => {
        if(navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition((location) => {
                if (location) {
                    setGeolocation(location.coords)
                }
            });
        }
    },[])

    useEffect(() => {
        if(geolocation) {
            
            const userLat = geolocation?.latitude;
            const userLong = geolocation?.longitude;

            const distances = stationData?.map(station => {
                const stationLat = station?.geolocation?.coordinates?.[1]
                const stationLong = station?.geolocation?.coordinates?.[0]
                const dist = getDistanceFromLatLonInKm(userLat, userLong, stationLat, stationLong)
                return {
                    ...station,
                    dist
                }
            }).sort((a,b) => a.dist - b.dist)
            setSortedStations(distances)
        }

    }, [geolocation])
    
    const renderStations = useCallback(() => {
        if(!geolocation || !sortedStations) {
            return null;
        }

        return (
            <div style={{backgroundColor: '#282A3A'}}>
            <Table striped bordered hover variant="dark">
                <thead>
                <tr>
                    <th>Location</th>
                    <th>Bikes</th>
                    <th>Docks</th>
                    <th>Distance</th>
                </tr>
                </thead>
                <tbody>
                {sortedStations?.slice(0, numStations)?.map((station) => {
                    const { id, name, bikes_available, docks_available, dist } = station ?? {}

                    return (
                    <tr key={id}>
                        <td>{ name }</td>
                        <td>{ bikes_available }</td>
                        <td>{ docks_available }</td>
                        <td>{ `${dist.toFixed(2) } Km`}</td>
                    </tr>
                    );
                })}
                </tbody>
            </Table>
            <Button onClick={() => setNumStations(numStations + 5)} variant="primary">Load More</Button>
            </div>
        )
    }, [sortedStations, numStations, geolocation])

    return (
        <div>
            <h1 style={{color: 'white'}}>Closest Stations</h1>
            {renderStations()}
      </div>

    );
}

export default (GeoBikes);