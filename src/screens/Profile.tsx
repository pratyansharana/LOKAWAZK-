import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Operator Profile</Text>
      <Text style={styles.text}>Manage your LokAwaz credentials and history.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  text: { color: '#888', textAlign: 'center' }
});

export default ProfileScreen;