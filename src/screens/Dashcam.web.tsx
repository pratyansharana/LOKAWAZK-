import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

// List of mock road images with potholes for simulation
const MOCK_ROAD_IMAGES = [
  'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80', // asphalt road
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', // cracked asphalt
  'https://images.unsplash.com/photo-1584467541268-b029fb34deec?auto=format&fit=crop&w=800&q=80', // pothole road
];

export default function DashcamWeb() {
  const [isOnline, setIsOnline] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [pendingSync, setPendingSync] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mockDetections, setMockDetections] = useState<any[]>([]);
  const simulationInterval = useRef<any>(null);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });
    return () => {
      unsubscribe();
      stopSimulation();
    };
  }, []);

  const triggerTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setMockDetections([]);
    triggerTTS('Initializing simulated web AI dashcam');

    simulationInterval.current = setInterval(() => {
      // Toggle road image
      setCurrentImageIndex(prev => (prev + 1) % MOCK_ROAD_IMAGES.length);
      
      // Randomly simulate a pothole detection
      const detectPothole = Math.random() > 0.4;
      
      if (detectPothole) {
        // Create a random bounding box
        const x = 0.2 + Math.random() * 0.4;
        const y = 0.4 + Math.random() * 0.3;
        const w = 0.2 + Math.random() * 0.15;
        const h = 0.1 + Math.random() * 0.1;
        const score = 0.72 + Math.random() * 0.25;

        setMockDetections([{ x, y, w, h, score }]);
        setSessionCount(prev => prev + 1);
        
        // Trigger TTS
        triggerTTS('Pothole detected');

        // Simulate offline queueing if offline
        if (!isOnline) {
          setPendingSync(prev => prev + 1);
        }
      } else {
        setMockDetections([]);
      }
    }, 4000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setMockDetections([]);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Simulation View */}
      <View style={styles.visualizerContainer}>
        {isSimulating ? (
          <Image
            source={{ uri: MOCK_ROAD_IMAGES[currentImageIndex] }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.idleView}>
            <Text style={styles.idleEmoji}>🛣️</Text>
            <Text style={styles.webAlertTitle}>Web Simulation Mode</Text>
            <Text style={styles.webAlertText}>
              React Native Vision Camera and fast-tflite require mobile hardware accelerators (iOS/Android) and are bypassed on the web to prevent browser crashes.
            </Text>
            
            <TouchableOpacity style={styles.simulationBtn} onPress={startSimulation}>
              <Text style={styles.simulationBtnText}>START WEB AI SIMULATION</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bounding Box Overlay for Simulation */}
        {isSimulating && mockDetections.map((det, index) => (
          <View key={index} style={[styles.box, {
            left: `${det.x * 100}%`,
            top: `${det.y * 100}%`,
            width: `${det.w * 100}%`,
            height: `${det.h * 100}%`,
          }]}>
            <Text style={styles.label}>{Math.round(det.score * 100)}%</Text>
          </View>
        ))}

        {isSimulating && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopSimulation}>
            <Text style={styles.stopBtnText}>STOP SIMULATION</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 📊 HUD OVERLAY */}
      <View style={styles.topBar}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#00FF00' : '#FF3B30' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'SYSTEM ONLINE (SIMULATED)' : 'OFFLINE - QUEUING'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TRIP DETECTIONS</Text>
            <Text style={styles.statValue}>{sessionCount}</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statLabel}>PENDING SYNC</Text>
            <Text style={[styles.statValue, { color: pendingSync > 0 ? '#FFD700' : '#FFF' }]}>
              {pendingSync}
            </Text>
          </View>
        </View>

        <Text style={styles.debugText}>
          AI Model: {isSimulating ? 'YOLOv8-WebSim' : 'IDLE'} | Platform: Web Browser
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  visualizerContainer: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  idleView: {
    padding: 30,
    alignItems: 'center',
    maxWidth: 500,
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  idleEmoji: { fontSize: 60, marginBottom: 15 },
  webAlertTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  webAlertText: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  simulationBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 5,
  },
  simulationBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  stopBtn: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
  },
  stopBtnText: { color: '#FF3B30', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  box: { position: 'absolute', borderWidth: 3, borderColor: '#00FF00', borderRadius: 4 },
  label: { color: 'black', backgroundColor: '#00FF00', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 4, position: 'absolute', top: -20, left: -3 },
  
  // HUD STYLING
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 'bold' },
  statValue: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 2 },
  
  debugText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 5 },
});
