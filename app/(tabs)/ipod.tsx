import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Pressable, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Text } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Audio } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SpotifyInfo } from '@/components/SpotifyInfo';
import { connectSpotify } from '@/services/spotify';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const SCREEN_PADDING = 20;
const CONTENT_WIDTH = width - (SCREEN_PADDING * 2);
const TAB_BAR_HEIGHT = 49; // Standard iOS tab bar height

const SONGS = [
  {
    title: 'For Life',
    artist: 'Kygo, Zak Abel, Nile Rodgers',
    audioFile: require('@/assets/SongInfo/audio/Kygo - For Life (Lyrics) ft. Zak Abel, Nile Rodgers.mp3'),
  },
  {
    title: '7 rings',
    artist: 'Ariana Grande',
    audioFile: require('@/assets/SongInfo/audio/Ariana Grande - 7 rings (Official Video).mp3'),
  },
  {
    title: 'Randomly',
    artist: 'Lucki',
    audioFile: require('@/assets/SongInfo/audio/Lucki - Randomly (Audio).mp3'),
  },
  {
    title: 'Starburster',
    artist: 'Fontaines D.C.',
    audioFile: require('@/assets/SongInfo/audio/Fontaines D.C. - Starburster.mp3'),
  },
];

export default function IPodScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleConnectSpotify = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectSpotify();
    } catch (err) {
      console.error('Failed to connect to Spotify:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Set up audio mode when component mounts
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        // Load the first song after audio mode is set
        await loadSong(currentSongIndex);
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    
    setupAudio();
    
    // Set navigation options to hide tab bar
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      // Cleanup when component unmounts
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Reset navigation options when component unmounts
      navigation.setOptions({
        tabBarStyle: { display: 'flex' },
      });
    };
  }, [navigation]);

  const loadSong = async (index: number) => {
    try {
      // Unload previous song if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Create new sound object with initial status
      const { sound } = await Audio.Sound.createAsync(
        SONGS[index].audioFile,
        { progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      setProgress(0);
      setPosition(0);
      setDuration(0);
    } catch (error) {
      console.error('Error loading song:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const playNextSong = async () => {
    const nextIndex = (currentSongIndex + 1) % SONGS.length;
    setCurrentSongIndex(nextIndex);
    await loadSong(nextIndex);
    if (isPlaying) {
      await soundRef.current?.playAsync();
    }
  };

  const playPreviousSong = async () => {
    const prevIndex = (currentSongIndex - 1 + SONGS.length) % SONGS.length;
    setCurrentSongIndex(prevIndex);
    await loadSong(prevIndex);
    if (isPlaying) {
      await soundRef.current?.playAsync();
    }
  };

  const handleMenuPress = () => {
    router.replace('/(tabs)');
  };

  const currentSong = SONGS[currentSongIndex].title;
  const currentArtist = SONGS[currentSongIndex].artist;

  const getCurrentSongImage = () => {
    switch (currentSong) {
      case '7 rings':
        return require('@/assets/images/7rings.jpeg');
      case 'For Life':
        return require('@/assets/images/For Life.jpeg');
      case 'Randomly':
        return require('@/assets/images/LUCKI.png');
      case 'Starburster':
        return require('@/assets/images/starburster.jpeg');
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.content}>
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
          <View style={styles.ipodContainer}>
            {/* Album Art Section */}
            <View style={styles.imageContainer}>
              {getCurrentSongImage() && (
                <Image
                  source={getCurrentSongImage()}
                  style={styles.albumArt}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Song Info Section */}
            <View style={styles.songInfoSection}>
              <ThemedText style={styles.songTitle}>{currentSong}</ThemedText>
              <ThemedText style={styles.artistName}>{currentArtist}</ThemedText>
            </View>

            {/* Progress Bar and Time */}
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.timeContainer}>
                <ThemedText style={styles.timeText}>
                  {formatTime(position)}
                </ThemedText>
                <ThemedText style={styles.timeText}>
                  {formatTime(duration)}
                </ThemedText>
              </View>
            </View>

            {/* iPod Control Wheel */}
            <View style={styles.controlWheel}>
              <TouchableOpacity onPress={handleMenuPress}>
                <ThemedText style={styles.menuButton}>MENU</ThemedText>
              </TouchableOpacity>
              <View style={styles.middleControls}>
                <TouchableOpacity onPress={playPreviousSong}>
                  <ThemedText style={styles.prevButton}>⏮</ThemedText>
                </TouchableOpacity>
                <View style={styles.centerButton} />
                <TouchableOpacity onPress={playNextSong}>
                  <ThemedText style={styles.nextButton}>⏭</ThemedText>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={togglePlayPause}>
                <ThemedText style={styles.playPauseButton}>
                  {isPlaying ? '⏸' : '▶️'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
    </View>
  );
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Match the black/gray background
  },
  content: {
    flex: 1,
    padding: SCREEN_PADDING,
    backgroundColor: '#000000', // Match the black/gray background
  },
  ipodContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FACAD6',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: CONTENT_WIDTH - 40,
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F2EDED',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  songInfoSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: 'rgba(224, 107, 136, 1)', // Pink from DJ design
  },
  artistName: {
    fontSize: 20,
    color: 'rgba(86, 61, 88, 1)', // Purple from DJ design
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(86, 61, 88, 0.2)', // Semi-transparent purple
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(224, 107, 136, 1)', // Pink from DJ design
    borderRadius: 2,
  },
  controlWheel: {
    width: CONTENT_WIDTH - 120,
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: (CONTENT_WIDTH - 120) / 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(86, 61, 88, 0.2)',
  },
  menuButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(86, 61, 88, 1)',
  },
  middleControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevButton: {
    fontSize: 20,
    color: 'rgba(86, 61, 88, 1)',
  },
  nextButton: {
    fontSize: 20,
    color: 'rgba(86, 61, 88, 1)',
  },
  centerButton: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(224, 107, 136, 1)',
    borderRadius: 15,
  },
  playPauseButton: {
    fontSize: 20,
    color: 'rgba(86, 61, 88, 1)',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(86, 61, 88, 1)', // Purple from DJ design
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: 'rgba(86, 61, 88, 1)', // Purple from DJ design
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'rgba(212, 60, 17, 1)', // Red from DJ design
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(224, 107, 136, 1)', // Pink from DJ design
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
}); 