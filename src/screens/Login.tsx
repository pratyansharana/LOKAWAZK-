import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) return;
  setLoading(true);
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      await signOut(auth); // Kick them out if not verified
      Alert.alert(
        'Email Not Verified',
        'Please verify your email before accessing the system. Check your inbox for the link.'
      );
      return;
    }
    
    // If verified, App.tsx listener will naturally handle the transition to Home
  } catch (error: any) {
    Alert.alert('Login Failed', error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LOKAWAZ</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>LOGIN</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.footer}>
  <Text style={styles.footerText}>
    New operator? <Text style={styles.link}>Create Account</Text>
  </Text>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', padding: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  footer: { marginTop: 30, alignItems: 'center' },
footerText: { color: '#888' },
link: { color: '#FF3B30', fontWeight: 'bold' }
});

export default LoginScreen;