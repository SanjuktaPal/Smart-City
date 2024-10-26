//Code for Mobile App (React Native)

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const WasteCollectionApp = () => {
  const [wasteBins, setWasteBins] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetchWasteBins();
  }, []);

  const fetchWasteBins = async () => {
    try {
      const response = await fetch('https://your-api-url.com/api/wastebins');
      const data = await response.json();
      setWasteBins(data);
    } catch (error) {
      console.error('Error fetching waste bins:', error);
    }
  };

  const reportFullBin = async (binId) => {
    try {
      await fetch('https://your-api-url.com/api/report-full-bin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ binId }),
      });
      setUserPoints(userPoints + 10);
      alert('Thank you for reporting! You earned 10 points.');
    } catch (error) {
      console.error('Error reporting full bin:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 40.7128,
          longitude: -74.0060,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {wasteBins.map((bin) => (
          <Marker
            key={bin._id}
            coordinate={{ latitude: bin.latitude, longitude: bin.longitude }}
            title={`Bin ${bin.binId}`}
            description={`Fill level: ${bin.fillLevel}%`}
          />
        ))}
      </MapView>
      <View style={{ padding: 10 }}>
        <Text>Your Points: {userPoints}</Text>
        <FlatList
          data={wasteBins}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
              <Text>Bin {item.binId} - Fill level: {item.fillLevel}%</Text>
              <Button title="Report Full" onPress={() => reportFullBin(item.binId)} />
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default WasteCollectionApp;
