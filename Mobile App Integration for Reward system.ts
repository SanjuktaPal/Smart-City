//Mobile App Integration for Reward system

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RewardSystem = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  useEffect(() => {
    fetchUserProfile();
    fetchLeaderboard();
    fetchAvailableRewards();
  }, []);
  const fetchUserProfile = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const response = await fetch(`https://your-api-url.com/api/profile/${userId}`);
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('https://your-api-url.com/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };
  const fetchAvailableRewards = async () => {
    try {
      const response = await fetch('https://your-api-url.com/api/available-rewards');
      const data = await response.json();
      setAvailableRewards(data);
    } catch (error) {
      console.error('Error fetching available rewards:', error);
    }
  };
  const redeemReward = async (rewardId) => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const response = await fetch('https://your-api-url.com/api/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, rewardId }),
      });
      const data = await response.json();
      alert(data.message);
      fetchUserProfile(); // Refresh user profile after redeeming
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {userProfile && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Your Profile</Text>
          <Text>Username: {userProfile.username}</Text>
          <Text>Points: {userProfile.points}</Text>
          <Text>Level: {userProfile.level}</Text>
          <Text>Achievements: {userProfile.achievements.join(', ')}</Text>
        </View>
      )}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Text>{index + 1}. {item.username} - {item.points} points</Text>
        )}
        style={{ marginBottom: 20 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Available Rewards</Text>
      <FlatList
        data={availableRewards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text>{item.name} - {item.point_cost} points</Text>
            <Button title="Redeem" onPress={() => redeemReward(item.id)} />
          </View>
        )}
      />
    </View>
  );
};
export default RewardSystem;
