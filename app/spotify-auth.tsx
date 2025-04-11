import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SpotifyAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Get the URL from the navigation state
        const url = window.location.href;
        console.log('Auth callback URL:', url);

        // Extract the authorization code from the URL
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const error = urlObj.searchParams.get('error');
        
        if (error) {
          console.error('Spotify auth error:', error);
          router.replace('/(tabs)/ipod');
          return;
        }
        
        if (code) {
          console.log('Authorization code found in callback');
          // The code will be exchanged for a token in the connectSpotify function
          // We just need to redirect back to the iPod screen
          router.replace('/(tabs)/ipod');
        } else {
          console.error('No authorization code in callback URL');
          router.replace('/(tabs)/ipod');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        router.replace('/(tabs)/ipod');
      }
    };

    processAuthCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Processing Spotify authentication...</Text>
      <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
    </View>
  );
} 