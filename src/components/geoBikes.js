import React, { useEffect, useState, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const MAP_LINK = 'http://maps.apple.com/?ll=';

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

    const onGetCurrentLocation =  () => {
        const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition( function (position) {
            //use coordinates
            const marker = { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            };
            setGeolocation(marker)
        }, function (error) {
            setGeolocation('error')
        }, options)
    }

    useEffect(() => {
        if ( navigator.permissions && navigator.permissions.query) {
            //try permissions APIs first
            navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
                // Will return ['granted', 'prompt', 'denied']
                const permission = result.state;
                if ( permission === 'granted' || permission === 'prompt' ) {
                    onGetCurrentLocation();
                }
            });
        } else if (navigator.geolocation) {
            //then Navigation APIs
            onGetCurrentLocation();
        }

    }, []);


    useEffect(() => {
            const userLat = geolocation?.lat;
            const userLong = geolocation?.lng;
        if(userLat && userLong) {
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

    }, [geolocation, stationData])

    const renderStations = useCallback(() => {
        if(geolocation === 'error') {
           return <p style={{ color: 'white'}}>Could not fetch location</p>;
        } else if(!geolocation || !sortedStations) {
            return (
                <div>
                    {/* <p>{geolocation}</p> */}
                <Spinner animation="border" role="status" variant="light">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                </div>
            );
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
                    const { id, name, bikes_available, docks_available, dist, geolocation } = station ?? {}
                    const stationLat = geolocation?.coordinates?.[1]
                    const stationLong = geolocation?.coordinates?.[0]
                    const link = `${MAP_LINK}${stationLat},${stationLong}`
                    
                    return (
                        <tr key={id}>
                            <td><a href={link}>{ name }</a></td>
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
    }, [sortedStations, numStations, geolocation, stationData])

    return (
        <div>
            <h1 style={{color: 'white'}}>Closest Stations</h1>
            {renderStations()}
      </div>

    );
}

export default (GeoBikes);