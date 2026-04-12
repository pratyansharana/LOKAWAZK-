import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Welcome Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, Operator</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={40} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Main Action Card: Launch Sensing */}
      <TouchableOpacity 
        style={styles.mainActionCard}
        onPress={() => navigation.navigate('Dashcam')}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>START SCANNING</Text>
          <Text style={styles.cardDesc}>Initialize AI-vision for road quality monitoring.</Text>
        </View>
        <Ionicons name="scan-outline" size={50} color="#FFF" />
      </TouchableOpacity>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>POTHOLES</Text>
          <Text style={styles.statValue}>128</Text>
          <Text style={styles.statSubText}>Total Detected</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COORDINATES</Text>
          <Text style={styles.statValue}>42</Text>
          <Text style={styles.statSubText}>Sync Pending</Text>
        </View>
      </View>

      {/* Quick Access Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>SYSTEM MODULES</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Nearby')}>
          <Ionicons name="location-outline" size={24} color="#FF3B30" />
          <Text style={styles.menuText}>Nearby Hazard Map</Text>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Report')}>
          <Ionicons name="document-text-outline" size={24} color="#FF3B30" />
          <Text style={styles.menuText}>Detection Logs</Text>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="cloud-upload-outline" size={24} color="#FF3B30" />
          <Text style={styles.menuText}>Cloud Sync Status</Text>
          <Text style={styles.syncStatus}>98%</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  dateText: { color: '#666', fontSize: 14, marginTop: 4 },
  profileBtn: { padding: 4 },
  mainActionCard: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  cardDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { 
    backgroundColor: '#1A1A1A', 
    width: (width - 55) / 2, 
    padding: 20, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  statValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  statSubText: { color: '#444', fontSize: 10 },
  menuSection: { marginTop: 10 },
  sectionTitle: { color: '#444', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#151515', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  menuText: { flex: 1, color: '#DDD', marginLeft: 15, fontSize: 16 },
  syncStatus: { color: '#00FF00', fontWeight: 'bold' }
});

export default HomeScreen;