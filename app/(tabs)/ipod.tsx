import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Pressable, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextToSpeech } from '@/components/TextToSpeech';
import { SpotifyInfo } from '@/components/SpotifyInfo';
import { connectSpotify } from '@/services/spotify';

export default function IPodScreen() {
  const router = useRouter();
  const songInfo = "Now playing Song Title by Artist Name";
  const testSpeech = "Welcome to Peach Radio, your home for all things music! I am your host Peach. We have a message from Bob from Kennesaw State!";
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectSpotify = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectSpotify();
      // If we get here, connection was successful
    } catch (err) {
      console.error('Failed to connect to Spotify:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>iPod</ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Spotify Playlists</ThemedText>
          
          {isConnecting ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <ThemedText style={styles.loadingText}>Connecting to Spotify...</ThemedText>
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleConnectSpotify}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <SpotifyInfo onConnect={handleConnectSpotify} />
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 185, 84, 0.1)', // Spotify green with transparency
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1DB954', // Spotify green
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ipodBody: {
    width: '90%',
    aspectRatio: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 40,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 20,
  },
  screen: {
    width: '100%',
    height: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  nowPlaying: {
    fontSize: 12,
    color: '#666',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  albumArt: {
    width: '60%',
    aspectRatio: 1,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArtText: {
    color: '#666',
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#ddd',
    borderRadius: 1,
  },
  progress: {
    width: '30%',
    height: '100%',
    backgroundColor: '#666',
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontSize: 10,
    color: '#666',
  },
  clickWheel: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickWheelInner: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickWheelCenter: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#e0e0e0',
  },
  controlText: {
    fontSize: 16,
  },
  menuButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#666',
    borderRadius: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  testContainer: {
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  testButton: {
    padding: 10,
    backgroundColor: '#1DB954', // Spotify green
    borderRadius: 8,
  },
  spotifySection: {
    width: '100%',
    marginTop: 20,
  },
}); 