import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Pressable, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Text, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Audio } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SpotifyInfo } from '@/components/SpotifyInfo';
import { connectSpotify } from '@/services/spotify';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');
const SCREEN_PADDING = 20;
const CONTENT_WIDTH = width - (SCREEN_PADDING * 2);
const TAB_BAR_HEIGHT = 49; // Standard iOS tab bar height

const SONGS = [
  {
    title: 'Peach Radio',
    artist: ' ',
    audioFile: require('../../assets/DJ/DjAudio1.mp3'),
  },
  {
    title: '7 rings',
    artist: 'Ariana Grande',
    audioFile: require('@/assets/SongInfo/audio/Ariana Grande - 7 rings (Official Video).mp3'),
  },
  {
    title: 'For Life',
    artist: 'Kygo, Zak Abel, Nile Rodgers',
    audioFile: require('@/assets/SongInfo/audio/Kygo - For Life (Lyrics) ft. Zak Abel, Nile Rodgers.mp3'),
  },
  {
    title: 'Peach Radio',
    artist: ' ',
    audioFile: require('../../assets/DJ/DjAudio2.mp3'),
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
  {
    title: 'Peach Radio',
    artist: ' ',
    audioFile: require('../../assets/DJ/DjAudio3.mp3'),
    isFinal: true, // Special flag for the final Peach Radio
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
  const currentSongIndexRef = useRef(0); // Add ref to track current song index
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Update the ref whenever currentSongIndex changes
  useEffect(() => {
    currentSongIndexRef.current = currentSongIndex;
  }, [currentSongIndex]);

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
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        SONGS[index].audioFile,
        { progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading song:', error);
    }
  };

  const onPlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);

      // Check if the song just finished
      if (status.didJustFinish) {
        // Use the ref to get the current song index
        const songIndex = currentSongIndexRef.current;
        const currentSong = SONGS[songIndex];
        console.log('Song finished:', currentSong.title);
        
        // If it's the final Peach Radio song, go to home
        if (currentSong.isFinal) {
          console.log('Final Peach Radio song, going to home');
          router.replace('/(tabs)');
          return;
        } 
        // If it's a regular Peach Radio song, play the next song
        else if (currentSong.title === 'Peach Radio') {
          console.log('Regular Peach Radio song, playing next');
          const nextIndex = songIndex + 1;
          setCurrentSongIndex(nextIndex);
          await loadSong(nextIndex);
          await soundRef.current?.playAsync();
          setIsPlaying(true);
        }
      }
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
    // If it's the final Peach Radio song, go to home
    if (SONGS[currentSongIndex].isFinal) {
      router.replace('/(tabs)');
    } else {
      // For all other songs, play the next song
      const nextIndex = currentSongIndex + 1;
      if (nextIndex < SONGS.length) {
        setCurrentSongIndex(nextIndex);
        await loadSong(nextIndex);
        await soundRef.current?.playAsync();
        setIsPlaying(true);
      }
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

  const currentSong = SONGS[currentSongIndex];
  const currentArtist = SONGS[currentSongIndex].artist;

  const getCurrentSongImage = () => {
    switch (currentSong.title) {
      case 'Peach Radio':
        return require('@/assets/DJ/PeachRadioLogo.png');
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

  const handleTTSClick = async () => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/Jw18Gw14Xf0XCznOPKkl', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_7fb655c85532e10814b458fdf5c5a57c2b0acef1981728c5'
        },
        body: JSON.stringify({
          text: "Welcome to Peach Radio, your personal music companion.",
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('TTS API request failed');
      }

      const fileUri = FileSystem.cacheDirectory + 'tts.mp3';
      const audioData = await response.arrayBuffer();
      await FileSystem.writeAsStringAsync(fileUri, Buffer.from(audioData).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      await sound.playAsync();
    } catch (error) {
      console.error('Error with TTS:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>

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
              <Image
                source={getCurrentSongImage()}
                style={styles.albumArt}
                resizeMode="cover"
              />
            </View>

            {/* Song Info Section */}
            <View style={styles.songInfoSection}>
              <ThemedText style={styles.songTitle}>{currentSong.title}</ThemedText>
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
              <TouchableOpacity 
                style={[styles.controlButton, styles.topButton]}
                onPress={handleMenuPress}
              >
                <Text style={styles.menuButton}>MENU</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.leftButton]}
                onPress={playPreviousSong}
              >
                <Image 
                  source={require('../../assets/images/PreviousSong.png')}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View style={[styles.controlButton, styles.centerButton]} />

              <TouchableOpacity 
                style={[styles.controlButton, styles.rightButton]}
                onPress={playNextSong}
              >
                <Image 
                  source={require('../../assets/images/NextSong.png')}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.bottomButton]}
                onPress={togglePlayPause}
              >
                <Image 
                  source={require('../../assets/images/PlayPause.png')}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
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
    backgroundColor: '#FACAD6', // Changed from black to match home screen
  },
  content: {
    flex: 1,
    padding: SCREEN_PADDING,
    backgroundColor: '#FACAD6',
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
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
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(86, 61, 88, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: -5,
    overflow: 'hidden',
  },
  controlButton: {
    position: 'absolute',
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButton: {
    top: 20,
  },
  leftButton: {
    left: 10,
  },
  centerButton: {
    width: 90,
    height: 90,
    backgroundColor: '#FACAD6',
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(86, 61, 88, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: -5,
    overflow: 'hidden',
  },
  rightButton: {
    right: 10,
  },
  bottomButton: {
    bottom: 20,
  },
  controlIcon: {
    width: 30,
    height: 30,
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
  backButton: {
    position: 'absolute',
    left: 20,
    top: 25,
    zIndex: 2,
    padding: 10,
  },
  backButtonText: {
    fontSize: 32,
    color: 'rgba(86, 61, 88, 0.5)', // Gray color matching the design
  },
  menuButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(86, 61, 88, 1)',
    textAlign: 'center',
    width: '100%',
  },
}); 