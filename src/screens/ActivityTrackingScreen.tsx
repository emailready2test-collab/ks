import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityTrackingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Tracking</Text>
      <Text style={styles.text}>This is a placeholder for the Activity Tracking screen (web build).</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 14, color: '#666', textAlign: 'center' },
});

export default ActivityTrackingScreen;


