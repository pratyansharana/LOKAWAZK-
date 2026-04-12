import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const NearbyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Hazards</Text>
      <Text style={styles.text}>Crowdsourced pothole alerts in your vicinity.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#888', textAlign: 'center' }
});

export default NearbyScreen;