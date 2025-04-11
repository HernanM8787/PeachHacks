import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as Random from 'expo-random';

// Temporary mock data for Spotify integration
export const MOCK_PLAYLISTS = [
  {
    id: '1',
    name: 'My Favorite Songs',
    images: [{ url: 'https://via.placeholder.com/150' }],
    lastAccessed: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Workout Mix',
    images: [{ url: 'https://via.placeholder.com/150' }],
    lastAccessed: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    name: 'Chill Vibes',
    images: [{ url: 'https://via.placeholder.com/150' }],
    lastAccessed: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

// Mock user profile data
export const MOCK_USER_PROFILE = {
  id: 'mock_user_id',
  display_name: 'Mock User',
  images: [{ url: 'https://via.placeholder.com/150' }],
  email: 'mock@example.com',
  country: 'US',
  product: 'premium',
  type: 'user',
  uri: 'spotify:user:mock_user_id'
};

// Spotify configuration
const SPOTIFY_CONFIG = {
  clientId: '8b814b3191ba4289b066b4d9b903297f',
  clientSecret: 'da632778e8644a7386c8741b9c077589',
  redirectURLs: [
    'exp://10.201.129.144:19000'
  ],
  scopes: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-read-recently-played'
  ]
};

// Log the redirect URI for debugging
console.log('Spotify Redirect URI:', SPOTIFY_CONFIG.redirectURLs[0]);

// Declare global type for TypeScript
declare global {
  var spotifyAccessToken: string | undefined;
  var useMockData: boolean;
}

// Initialize global variables
global.useMockData = true;

// Authentication function
export async function connectSpotify() {
  try {
    // Check if we already have a token stored
    const storedToken = await SecureStore.getItemAsync('spotify_access_token');
    if (storedToken) {
      console.log('Found stored token');
      global.spotifyAccessToken = storedToken;
      global.useMockData = false;
      return true;
    }

    // Set up the auth request
    const redirectUri = SPOTIFY_CONFIG.redirectURLs[0];
    console.log('Using redirect URI:', redirectUri);
    
    // Generate a random state value for security
    const state = Random.getRandomBytesAsync(32).then(bytes => 
      Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );
    
    // Build the auth URL with authorization code flow
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CONFIG.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SPOTIFY_CONFIG.scopes.join(' '))}&response_type=code&show_dialog=true&state=${state}`;
    console.log('Auth URL:', authUrl);
    
    // Open Spotify login in browser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      redirectUri,
      {
        showInRecents: true,
        dismissButtonStyle: 'done',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#1DB954',
        enableBarCollapsing: true,
        toolbarColor: '#000000'
      }
    );

    console.log('Auth Result:', result);

    if (result.type === 'success' && result.url) {
      // Extract authorization code from URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      
      console.log('URL:', result.url);
      console.log('Authorization code found:', !!code);

      if (code) {
        // Exchange the code for an access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
          }).toString()
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;
          
          // Store the token securely
          await SecureStore.setItemAsync('spotify_access_token', accessToken);
          global.spotifyAccessToken = accessToken;
          global.useMockData = false;
          return true;
        } else {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', tokenResponse.status, errorText);
        }
      } else {
        console.error('No authorization code in URL params');
        console.log('URL params:', Object.fromEntries(url.searchParams.entries()));
      }
    } else if (result.type === 'cancel') {
      console.log('Authentication was canceled by the user');
      // Don't throw an error for user cancellation
      return false;
    } else {
      console.error('Auth session not successful:', result.type);
    }
    
    // If we get here, authentication failed
    console.log('Using mock data due to authentication failure');
    global.useMockData = true;
    return false;
  } catch (error) {
    console.error('Spotify auth error:', error);
    // Use mock data on error
    global.useMockData = true;
    return false;
  }
}

// Get user's recent playlists
export async function getRecentPlaylists() {
  try {
    // If using mock data, return mock playlists
    if (global.useMockData) {
      console.log('Returning mock playlists');
      return MOCK_PLAYLISTS;
    }
    
    // Try to get token from memory first
    if (!global.spotifyAccessToken) {
      // If not in memory, try to get from secure storage
      const storedToken = await SecureStore.getItemAsync('spotify_access_token');
      if (storedToken) {
        global.spotifyAccessToken = storedToken;
      } else {
        console.log('No access token available, using mock data');
        global.useMockData = true;
        return MOCK_PLAYLISTS;
      }
    }

    // At this point, we know the token exists
    const token = global.spotifyAccessToken as string;
    console.log('Fetching playlists with token:', token.substring(0, 10) + '...');

    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=3', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Playlist fetch failed:', response.status, errorText);
      
      // If token is expired, clear it and use mock data
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('spotify_access_token');
        global.spotifyAccessToken = undefined;
        global.useMockData = true;
        return MOCK_PLAYLISTS;
      }
      
      throw new Error(`Failed to fetch playlists: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      images: playlist.images,
      lastAccessed: new Date().toISOString() // Spotify API doesn't provide last accessed time
    }));
  } catch (error) {
    console.error('Error fetching playlists:', error);
    // Use mock data on error
    global.useMockData = true;
    return MOCK_PLAYLISTS;
  }
}

// Get user profile
export async function getUserProfile() {
  try {
    // If using mock data, return mock profile
    if (global.useMockData) {
      console.log('Returning mock user profile');
      return MOCK_USER_PROFILE;
    }
    
    // Try to get token from memory first
    if (!global.spotifyAccessToken) {
      // If not in memory, try to get from secure storage
      const storedToken = await SecureStore.getItemAsync('spotify_access_token');
      if (storedToken) {
        global.spotifyAccessToken = storedToken;
      } else {
        console.log('No access token available, using mock data');
        global.useMockData = true;
        return MOCK_USER_PROFILE;
      }
    }

    // At this point, we know the token exists
    const token = global.spotifyAccessToken as string;
    console.log('Fetching user profile with token:', token.substring(0, 10) + '...');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile fetch failed:', response.status, errorText);
      
      // If token is expired, clear it and use mock data
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('spotify_access_token');
        global.spotifyAccessToken = undefined;
        global.useMockData = true;
        return MOCK_USER_PROFILE;
      }
      
      throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Use mock data on error
    global.useMockData = true;
    return MOCK_USER_PROFILE;
  }
} 