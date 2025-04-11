import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

// Spotify API credentials - these should be moved to environment variables in production
const SPOTIFY_CLIENT_ID = 'YOUR_CLIENT_ID';
const SPOTIFY_REDIRECT_URI = 'peachradio://spotify-auth';
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=token&scope=playlist-read-private%20playlist-read-collaborative`;

export default function SpotifyLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Handle the redirect from Spotify after authentication
    const handleAuthRedirect = (event: { url: string }) => {
      const { url } = event;
      if (url.startsWith(SPOTIFY_REDIRECT_URI)) {
        // Extract the access token from the URL
        const accessToken = url.split('access_token=')[1].split('&')[0];
        // Store the token and navigate back to home
        // In a real app, you'd store this securely
        console.log('Access Token:', accessToken);
        router.back();
      }
    };

    // Add event listener for URL changes
    Linking.addEventListener('url', handleAuthRedirect);

    // Clean up
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  const handleSpotifyLogin = () => {
    // Open Spotify authentication page
    Linking.openURL(SPOTIFY_AUTH_URL);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Connect to Spotify</Text>
      <Pressable 
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.buttonPressed
        ]}
        onPress={handleSpotifyLogin}>
        <Text style={styles.loginButtonText}>Login with Spotify</Text>
      </Pressable>
      <Pressable 
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed
        ]}
        onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FACAD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#1DB954', // Spotify green
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#F2EDED',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
}); 