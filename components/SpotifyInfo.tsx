import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { connectSpotify, getRecentPlaylists, getUserProfile } from '../services/spotify';

// Import mock data from spotify service
import { MOCK_USER_PROFILE, MOCK_PLAYLISTS } from '../services/spotify';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  lastAccessed: string;
}

interface SpotifyInfoProps {
  onConnect?: () => Promise<void>;
}

export function SpotifyInfo({ onConnect }: SpotifyInfoProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    // Start with mock data
    setUserProfile(MOCK_USER_PROFILE);
    setPlaylists(MOCK_PLAYLISTS);
    setIsMockData(true);
    setLoading(false);
  }, []);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get user profile first
      let profile;
      try {
        profile = await getUserProfile();
        setUserProfile(profile);
        // Check if we're using mock data
        setIsMockData(profile.id === 'mock_user_id');
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // If profile fetch fails, use mock profile
        setUserProfile(MOCK_USER_PROFILE);
        setIsMockData(true);
        // Continue with playlists even if profile fails
      }
      
      // Get recent playlists
      let recentPlaylists;
      try {
        recentPlaylists = await getRecentPlaylists();
        setPlaylists(recentPlaylists);
      } catch (playlistError) {
        console.error('Error fetching playlists:', playlistError);
        // If playlist fetch fails, use mock playlists
        setPlaylists(MOCK_PLAYLISTS);
        setIsMockData(true);
      }
    } catch (err) {
      console.error('Error fetching Spotify data:', err);
      setError('Failed to load Spotify data. Using mock data instead.');
      // Use mock data on error
      setUserProfile(MOCK_USER_PROFILE);
      setPlaylists(MOCK_PLAYLISTS);
      setIsMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to connect to Spotify
      const success = await connectSpotify();
      
      if (success) {
        // If connection was successful, fetch the data
        await fetchSpotifyData();
      } else {
        // If connection failed or was canceled, use mock data
        setUserProfile(MOCK_USER_PROFILE);
        setPlaylists(MOCK_PLAYLISTS);
        setIsMockData(true);
        setError('Using mock data. You can try connecting again later.');
      }
    } catch (err) {
      console.error('Failed to connect to Spotify:', err);
      setError('Failed to connect to Spotify. Using mock data instead.');
      // Use mock data on error
      setUserProfile(MOCK_USER_PROFILE);
      setPlaylists(MOCK_PLAYLISTS);
      setIsMockData(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <ThemedText style={styles.loadingText}>Loading Spotify data...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={handleConnect}
        >
          <ThemedText style={styles.connectButtonText}>Connect Spotify</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {userProfile && (
        <ThemedView style={styles.profileSection}>
          <ThemedText style={styles.welcomeText}>
            Welcome, {userProfile.display_name || 'Spotify User'}!
            {isMockData && (
              <ThemedText style={styles.mockDataText}> (Demo Mode)</ThemedText>
            )}
          </ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.playlistsSection}>
        <ThemedText style={styles.playlistsTitle}>
          Your Recent Playlists
          {isMockData && (
            <ThemedText style={styles.mockDataText}> (Demo Data)</ThemedText>
          )}
        </ThemedText>
        
        {playlists.length === 0 ? (
          <ThemedText style={styles.noPlaylistsText}>
            No playlists found. Connect your Spotify account to see your playlists.
          </ThemedText>
        ) : (
          playlists.map((playlist, index) => (
            <ThemedView key={playlist.id} style={styles.playlistItem}>
              <ThemedText style={styles.playlistIndex}>{index + 1}</ThemedText>
              <ThemedView style={styles.playlistInfo}>
                <ThemedText style={styles.playlistName}>{playlist.name}</ThemedText>
                <ThemedText style={styles.playlistDate}>
                  Last played: {new Date(playlist.lastAccessed).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))
        )}
        
        {isMockData && (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleConnect}
          >
            <ThemedText style={styles.connectButtonText}>Connect Real Spotify Account</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
  connectButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileSection: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(29, 185, 84, 0.05)',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mockDataText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  playlistsSection: {
    marginTop: 10,
  },
  playlistsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noPlaylistsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(29, 185, 84, 0.05)',
  },
  playlistIndex: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
    color: '#1DB954',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playlistDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
}); 