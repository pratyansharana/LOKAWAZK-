import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Dimensions, SafeAreaView, StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../Firebase/FirebaseConfig';
import { useAppTheme } from '../Context/Themecontext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', title: 'Electricity', emoji: '💡' },
  { id: '2', title: 'Sanitation', emoji: '💧' },
  { id: '3', title: 'Garbage', emoji: '🗑️' },
  { id: '4', title: 'Roads', emoji: '🛣️' },
  { id: '5', title: 'My detections', emoji: '⚠️' },
  { id: '6', title: 'Other', emoji: '🔳' },
];
// ... (keep your existing imports and CATEGORIES array)

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme, themeName, toggleTheme } = useAppTheme();
  // Changed default state to 'My detections' to match your array
  const [selectedCategory, setSelectedCategory] = useState('My detections'); 
  const [totalPotholes, setTotalPotholes] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'pothole_reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalPotholes(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.status as any} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- USER GREETING SECTION --- */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {auth.currentUser?.displayName || 'Operator'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, { borderColor: theme.border }]} 
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 20 }}>{themeName === 'light' ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>

        {/* --- STANDOUT DASHCAM BUTTON --- */}
        <TouchableOpacity 
          style={[styles.dashcamBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Dashcam' as never)}
        >
          <View style={styles.dashcamContent}>
            <View style={styles.dashcamTextWrapper}>
              <Text style={styles.dashcamTitle}>LAUNCH DASHCAM</Text>
              <Text style={styles.dashcamSubtitle}>START AI ROAD INSPECTION</Text>
            </View>
            <View style={styles.pulseContainer}>
              <Text style={styles.dashcamEmoji}>🛡️</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* --- CATEGORY GRID --- */}
        <View style={styles.grid}>
          {CATEGORIES.map((item) => {
            const isSelected = selectedCategory === item.title;
            
            return (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.categoryCard, 
                  { 
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? theme.primary : 'transparent',
                    borderWidth: isSelected ? 2 : 0,
                  }
                ]}
                onPress={() => {
                  setSelectedCategory(item.title);
                  
                  // 🔥 NAVIGATION LOGIC
                  if (item.title === 'My detections') {
                    // Make sure 'Mydetections' matches the name in your Stack/Tab Navigator
                    navigation.navigate('Mydetections' as never); 
                  }
                }}
              >
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                
                {/* Updated check to match your CATEGORIES array title */}
                {item.title === 'My detections' && (
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.badgeText}>{totalPotholes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 20 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 30 
  },
  greetingText: { fontSize: 16, fontWeight: '600' },
  userName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  themeToggle: { padding: 10, borderWidth: 1, borderRadius: 50 },
  
  // DASHCAM BUTTON STYLES
  dashcamBtn: {
    padding: 25,
    borderRadius: 24,
    marginBottom: 35,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  dashcamContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  dashcamTextWrapper: { flex: 1 },
  dashcamTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  dashcamSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  dashcamEmoji: { fontSize: 36 },
  pulseContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 50,
  },

  // GRID STYLES
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  categoryCard: {
    width: (width - 70) / 2,
    height: 130,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative'
  },
  cardEmoji: { fontSize: 34, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' }
});

export default HomeScreen;