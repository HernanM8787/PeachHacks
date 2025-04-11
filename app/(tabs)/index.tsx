import { Image, StyleSheet, Platform, Pressable, View, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

// Spotify API credentials - these should be moved to environment variables in production
const SPOTIFY_CLIENT_ID = 'YOUR_CLIENT_ID';
const SPOTIFY_REDIRECT_URI = 'peachradio://spotify-auth';
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=token&scope=playlist-read-private%20playlist-read-collaborative`;

export default function HomeScreen() {
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
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Image
            source={require('@/assets/images/image.png')}
            style={styles.peachImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>PEACH RADIO</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.signInBlock}>
          <Text style={styles.signInText}>Sign in:</Text>

          {/* Username and Password Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
          </View>

          <Text style={styles.orText}>OR</Text>

          {/* Spotify Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.spotifyButton,
              pressed && styles.buttonPressed
            ]}
            onPress={handleSpotifyLogin}>
            <Image
              source={require('@/assets/images/spotify-21.png')}
              style={styles.spotifyIcon}
              resizeMode="contain"
            />
            <Text style={styles.spotifyText}>Login with Spotify</Text>
          </Pressable>
        </View>

        {/* Play Recommended Section */}
        <Pressable 
          style={({ pressed }) => [
            styles.playlistContainer,
            pressed && styles.buttonPressed
          ]}
          onPress={() => router.push('/(tabs)/ipod')}>
          <Text style={styles.playlistText}>Play Recommended</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FACAD6', // Background color from design
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  peachImage: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'Marker Felt',
      android: 'Dancing Script',
      default: 'System',
    }),
    fontSize: 40,
    letterSpacing: 0.04,
    color: 'rgba(85, 61, 88, 1)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -100,
  },
  signInBlock: {
    width: '100%',
    backgroundColor: '#FFE0E0', // Light peach color for the block
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  signInText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'Avenir',
      android: 'Roboto',
      default: 'System',
    }),
    textAlign: 'left',
    width: '100%',
    fontStyle: 'italic',
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954', // Spotify green
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  spotifyIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  spotifyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'System',
    textAlign: 'center',
    flex: 1,
    marginLeft: 0,
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 10,
    fontFamily: Platform.select({
      ios: 'Avenir',
      android: 'Roboto',
      default: 'System',
    }),
    textAlign: 'center',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F2EDED',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'System',
  },
  playlistContainer: {
    marginTop: 20,
    backgroundColor: '#DC5830', // Dark orange background
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playlistText: {
    fontSize: 20,
    color: '#FFFFFF', // White text
    fontFamily: 'System',
  },
});
